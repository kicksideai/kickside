import { B as J, R as De, s as ae, f as Z, k as mt, b as ue, Q as Ke, z as ge, c as se, d as pe, T as me, C as fn, K as Re, v as Nt, V as $t, e as He, g as ce, q as hn, p as bn, M as St, h as We, i as mn, F as gn, j as Ct, m as vn, Y as yn, n as kn, I as wn, D as xn, x as Je, S as In, O as $n, L as Sn, o as Cn, $ as On, J as zn, r as be, u as Ln, P as An } from "./wc-runtime-CyGCuPS8.js";
import { mergeProps as c, resolveDirective as Ee, withDirectives as ve, openBlock as s, createBlock as T, resolveDynamicComponent as ie, withCtx as te, renderSlot as O, normalizeClass as K, createElementBlock as u, createElementVNode as m, createCommentVNode as $, resolveComponent as R, Transition as Kt, toDisplayString as A, createTextVNode as de, createVNode as E, normalizeStyle as Bn, toHandlers as Ue, Fragment as U, renderList as re, normalizeProps as Pn, createSlots as Tn, withModifiers as Fn, defineComponent as gt, ref as N, watch as vt, onUnmounted as yt, unref as M, computed as ne, onMounted as Vn } from "vue";
import { Icon as ye } from "@iconify/vue";
import { api as xe, loadByTagName as Qe, on as Mn } from "@wippy-fe/proxy";
var Dn = {
  root: function(t) {
    var n = t.instance, i = t.props;
    return ["p-tab", {
      "p-tab-active": n.active,
      "p-disabled": i.disabled
    }];
  }
}, En = J.extend({
  name: "tab",
  classes: Dn
}), _n = {
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
  style: En,
  provide: function() {
    return {
      $pcTab: this,
      $parentInstance: this
    };
  }
}, Rt = {
  name: "Tab",
  extends: _n,
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
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, i = n ? t : t.nextElementSibling;
      return i ? Ke(i, "data-p-disabled") || Ke(i, "data-pc-section") === "activebar" ? this.findNextTab(i) : ge(i, '[data-pc-name="tab"]') : null;
    },
    findPrevTab: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, i = n ? t : t.previousElementSibling;
      return i ? Ke(i, "data-p-disabled") || Ke(i, "data-pc-section") === "activebar" ? this.findPrevTab(i) : ge(i, '[data-pc-name="tab"]') : null;
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
      ue(n), this.scrollInView(n);
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
      return mt((t = this.$pcTabs) === null || t === void 0 ? void 0 : t.d_value, this.value);
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
      return c(this.asAttrs, this.a11yAttrs, this.ptmi("root", this.ptParams));
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
      return Z({
        active: this.active
      });
    }
  },
  directives: {
    ripple: De
  }
};
function jn(e, t, n, i, r, o) {
  var a = Ee("ripple");
  return e.asChild ? O(e.$slots, "default", {
    key: 1,
    dataP: o.dataP,
    class: K(e.cx("root")),
    active: o.active,
    a11yAttrs: o.a11yAttrs,
    onClick: o.onClick
  }) : ve((s(), T(ie(e.as), c({
    key: 0,
    class: e.cx("root"),
    "data-p": o.dataP,
    onClick: o.onClick
  }, o.attrs), {
    default: te(function() {
      return [O(e.$slots, "default")];
    }),
    _: 3
  }, 16, ["class", "data-p", "onClick"])), [[a]]);
}
Rt.render = jn;
var Ut = {
  name: "ChevronLeftIcon",
  extends: se
};
function Nn(e) {
  return Hn(e) || Un(e) || Rn(e) || Kn();
}
function Kn() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Rn(e, t) {
  if (e) {
    if (typeof e == "string") return Xe(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Xe(e, t) : void 0;
  }
}
function Un(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Hn(e) {
  if (Array.isArray(e)) return Xe(e);
}
function Xe(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, i = Array(t); n < t; n++) i[n] = e[n];
  return i;
}
function Wn(e, t, n, i, r, o) {
  return s(), u("svg", c({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Nn(t[0] || (t[0] = [m("path", {
    d: "M9.61296 13C9.50997 13.0005 9.40792 12.9804 9.3128 12.9409C9.21767 12.9014 9.13139 12.8433 9.05902 12.7701L3.83313 7.54416C3.68634 7.39718 3.60388 7.19795 3.60388 6.99022C3.60388 6.78249 3.68634 6.58325 3.83313 6.43628L9.05902 1.21039C9.20762 1.07192 9.40416 0.996539 9.60724 1.00012C9.81032 1.00371 10.0041 1.08597 10.1477 1.22959C10.2913 1.37322 10.3736 1.56698 10.3772 1.77005C10.3808 1.97313 10.3054 2.16968 10.1669 2.31827L5.49496 6.99022L10.1669 11.6622C10.3137 11.8091 10.3962 12.0084 10.3962 12.2161C10.3962 12.4238 10.3137 12.6231 10.1669 12.7701C10.0945 12.8433 10.0083 12.9014 9.91313 12.9409C9.81801 12.9804 9.71596 13.0005 9.61296 13Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Ut.render = Wn;
var Ht = {
  name: "ChevronRightIcon",
  extends: se
};
function Gn(e) {
  return Jn(e) || Yn(e) || Zn(e) || qn();
}
function qn() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Zn(e, t) {
  if (e) {
    if (typeof e == "string") return et(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? et(e, t) : void 0;
  }
}
function Yn(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Jn(e) {
  if (Array.isArray(e)) return et(e);
}
function et(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, i = Array(t); n < t; n++) i[n] = e[n];
  return i;
}
function Qn(e, t, n, i, r, o) {
  return s(), u("svg", c({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Gn(t[0] || (t[0] = [m("path", {
    d: "M4.38708 13C4.28408 13.0005 4.18203 12.9804 4.08691 12.9409C3.99178 12.9014 3.9055 12.8433 3.83313 12.7701C3.68634 12.6231 3.60388 12.4238 3.60388 12.2161C3.60388 12.0084 3.68634 11.8091 3.83313 11.6622L8.50507 6.99022L3.83313 2.31827C3.69467 2.16968 3.61928 1.97313 3.62287 1.77005C3.62645 1.56698 3.70872 1.37322 3.85234 1.22959C3.99596 1.08597 4.18972 1.00371 4.3928 1.00012C4.59588 0.996539 4.79242 1.07192 4.94102 1.21039L10.1669 6.43628C10.3137 6.58325 10.3962 6.78249 10.3962 6.99022C10.3962 7.19795 10.3137 7.39718 10.1669 7.54416L4.94102 12.7701C4.86865 12.8433 4.78237 12.9014 4.68724 12.9409C4.59212 12.9804 4.49007 13.0005 4.38708 13Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Ht.render = Qn;
var Xn = {
  root: "p-tablist",
  content: "p-tablist-content p-tablist-viewport",
  tabList: "p-tablist-tab-list",
  activeBar: "p-tablist-active-bar",
  prevButton: "p-tablist-prev-button p-tablist-nav-button",
  nextButton: "p-tablist-next-button p-tablist-nav-button"
}, ei = J.extend({
  name: "tablist",
  classes: Xn
}), ti = {
  name: "BaseTabList",
  extends: ae,
  props: {},
  style: ei,
  provide: function() {
    return {
      $pcTabList: this,
      $parentInstance: this
    };
  }
}, Wt = {
  name: "TabList",
  extends: ti,
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
      var t = this.$refs.content, n = this.getVisibleButtonWidths(), i = pe(t) - n, r = Math.abs(t.scrollLeft), o = i * 0.8, a = r - o, l = Math.max(a, 0);
      t.scrollLeft = $t(t) ? -1 * l : l;
    },
    onNextButtonClick: function() {
      var t = this.$refs.content, n = this.getVisibleButtonWidths(), i = pe(t) - n, r = Math.abs(t.scrollLeft), o = i * 0.8, a = r + o, l = t.scrollWidth - i, d = Math.min(a, l);
      t.scrollLeft = $t(t) ? -1 * d : d;
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
      var n = this.$refs.content, i = ge(n, '[data-pc-name="tab"][data-p-active="true"]');
      i && (this.inkBarObserver = new ResizeObserver(function() {
        return t.updateInkBar();
      }), this.inkBarObserver.observe(i));
    },
    unbindInkBarObserver: function() {
      var t;
      (t = this.inkBarObserver) === null || t === void 0 || t.disconnect(), this.inkBarObserver = void 0;
    },
    updateInkBar: function() {
      var t = this.$refs, n = t.content, i = t.inkbar, r = t.tabs;
      if (i) {
        var o = ge(n, '[data-pc-name="tab"][data-p-active="true"]');
        this.$pcTabs.isVertical() ? (i.style.height = fn(o) + "px", i.style.top = Re(o).top - Re(r).top + "px") : (i.style.width = Nt(o) + "px", i.style.left = Re(o).left - Re(r).left + "px");
      }
    },
    updateButtonState: function() {
      var t = this.$refs, n = t.list, i = t.content, r = i.scrollTop, o = i.scrollWidth, a = i.scrollHeight, l = i.offsetWidth, d = i.offsetHeight, p = Math.abs(i.scrollLeft), b = [pe(i), me(i)], x = b[0], f = b[1];
      this.$pcTabs.isVertical() ? (this.isPrevButtonEnabled = r !== 0, this.isNextButtonEnabled = n.offsetHeight >= d && parseInt(r) !== a - f) : (this.isPrevButtonEnabled = p !== 0, this.isNextButtonEnabled = n.offsetWidth >= l && parseInt(p) !== o - x);
    },
    getVisibleButtonWidths: function() {
      var t = this.$refs, n = t.prevButton, i = t.nextButton, r = 0;
      return this.showNavigators && (r = (n?.offsetWidth || 0) + (i?.offsetWidth || 0)), r;
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
      return Z({
        scrollable: this.$pcTabs.scrollable
      });
    }
  },
  components: {
    ChevronLeftIcon: Ut,
    ChevronRightIcon: Ht
  },
  directives: {
    ripple: De
  }
}, ni = ["data-p"], ii = ["aria-label", "tabindex"], oi = ["data-p"], ri = ["aria-orientation"], ai = ["aria-label", "tabindex"];
function si(e, t, n, i, r, o) {
  var a = Ee("ripple");
  return s(), u("div", c({
    ref: "list",
    class: e.cx("root"),
    "data-p": o.dataP
  }, e.ptmi("root")), [o.showNavigators && r.isPrevButtonEnabled ? ve((s(), u("button", c({
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
  }), [(s(), T(ie(o.templates.previcon || "ChevronLeftIcon"), c({
    "aria-hidden": "true"
  }, e.ptm("prevIcon")), null, 16))], 16, ii)), [[a]]) : $("", !0), m("div", c({
    ref: "content",
    class: e.cx("content"),
    onScroll: t[1] || (t[1] = function() {
      return o.onScroll && o.onScroll.apply(o, arguments);
    }),
    "data-p": o.dataP
  }, e.ptm("content")), [m("div", c({
    ref: "tabs",
    class: e.cx("tabList"),
    role: "tablist",
    "aria-orientation": o.$pcTabs.orientation || "horizontal"
  }, e.ptm("tabList")), [O(e.$slots, "default"), m("span", c({
    ref: "inkbar",
    class: e.cx("activeBar"),
    role: "presentation",
    "aria-hidden": "true"
  }, e.ptm("activeBar")), null, 16)], 16, ri)], 16, oi), o.showNavigators && r.isNextButtonEnabled ? ve((s(), u("button", c({
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
  }), [(s(), T(ie(o.templates.nexticon || "ChevronRightIcon"), c({
    "aria-hidden": "true"
  }, e.ptm("nextIcon")), null, 16))], 16, ai)), [[a]]) : $("", !0)], 16, ni);
}
Wt.render = si;
var li = `
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
`, ui = {
  root: function(t) {
    var n = t.props;
    return ["p-tabs p-component", {
      "p-tabs-scrollable": n.scrollable
    }];
  }
}, di = J.extend({
  name: "tabs",
  style: li,
  classes: ui
}), ci = {
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
  style: di,
  provide: function() {
    return {
      $pcTabs: this,
      $parentInstance: this
    };
  }
}, Gt = {
  name: "Tabs",
  extends: ci,
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
function pi(e, t, n, i, r, o) {
  return s(), u("div", c({
    class: e.cx("root")
  }, e.ptmi("root")), [O(e.$slots, "default")], 16);
}
Gt.render = pi;
var qe = {
  name: "TimesIcon",
  extends: se
};
function fi(e) {
  return gi(e) || mi(e) || bi(e) || hi();
}
function hi() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function bi(e, t) {
  if (e) {
    if (typeof e == "string") return tt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? tt(e, t) : void 0;
  }
}
function mi(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function gi(e) {
  if (Array.isArray(e)) return tt(e);
}
function tt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, i = Array(t); n < t; n++) i[n] = e[n];
  return i;
}
function vi(e, t, n, i, r, o) {
  return s(), u("svg", c({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), fi(t[0] || (t[0] = [m("path", {
    d: "M8.01186 7.00933L12.27 2.75116C12.341 2.68501 12.398 2.60524 12.4375 2.51661C12.4769 2.42798 12.4982 2.3323 12.4999 2.23529C12.5016 2.13827 12.4838 2.0419 12.4474 1.95194C12.4111 1.86197 12.357 1.78024 12.2884 1.71163C12.2198 1.64302 12.138 1.58893 12.0481 1.55259C11.9581 1.51625 11.8617 1.4984 11.7647 1.50011C11.6677 1.50182 11.572 1.52306 11.4834 1.56255C11.3948 1.60204 11.315 1.65898 11.2488 1.72997L6.99067 5.98814L2.7325 1.72997C2.59553 1.60234 2.41437 1.53286 2.22718 1.53616C2.03999 1.53946 1.8614 1.61529 1.72901 1.74767C1.59663 1.88006 1.5208 2.05865 1.5175 2.24584C1.5142 2.43303 1.58368 2.61419 1.71131 2.75116L5.96948 7.00933L1.71131 11.2675C1.576 11.403 1.5 11.5866 1.5 11.7781C1.5 11.9696 1.576 12.1532 1.71131 12.2887C1.84679 12.424 2.03043 12.5 2.2219 12.5C2.41338 12.5 2.59702 12.424 2.7325 12.2887L6.99067 8.03052L11.2488 12.2887C11.3843 12.424 11.568 12.5 11.7594 12.5C11.9509 12.5 12.1346 12.424 12.27 12.2887C12.4053 12.1532 12.4813 11.9696 12.4813 11.7781C12.4813 11.5866 12.4053 11.403 12.27 11.2675L8.01186 7.00933Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
qe.render = vi;
var yi = `
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
`, ki = {
  root: function(t) {
    var n = t.props;
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
}, wi = J.extend({
  name: "message",
  style: yi,
  classes: ki
}), xi = {
  name: "BaseMessage",
  extends: ae,
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
  style: wi,
  provide: function() {
    return {
      $pcMessage: this,
      $parentInstance: this
    };
  }
};
function $e(e) {
  "@babel/helpers - typeof";
  return $e = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, $e(e);
}
function Ot(e, t, n) {
  return (t = Ii(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ii(e) {
  var t = $i(e, "string");
  return $e(t) == "symbol" ? t : t + "";
}
function $i(e, t) {
  if ($e(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(e, t);
    if ($e(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var qt = {
  name: "Message",
  extends: xi,
  inheritAttrs: !1,
  emits: ["close", "life-end"],
  timeout: null,
  data: function() {
    return {
      visible: !0
    };
  },
  mounted: function() {
    var t = this;
    this.life && setTimeout(function() {
      t.visible = !1, t.$emit("life-end");
    }, this.life);
  },
  methods: {
    close: function(t) {
      this.visible = !1, this.$emit("close", t);
    }
  },
  computed: {
    closeAriaLabel: function() {
      return this.$primevue.config.locale.aria ? this.$primevue.config.locale.aria.close : void 0;
    },
    dataP: function() {
      return Z(Ot(Ot({
        outlined: this.variant === "outlined",
        simple: this.variant === "simple"
      }, this.severity, this.severity), this.size, this.size));
    }
  },
  directives: {
    ripple: De
  },
  components: {
    TimesIcon: qe
  }
};
function Se(e) {
  "@babel/helpers - typeof";
  return Se = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Se(e);
}
function zt(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(e);
    t && (i = i.filter(function(r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), n.push.apply(n, i);
  }
  return n;
}
function Lt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? zt(Object(n), !0).forEach(function(i) {
      Si(e, i, n[i]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : zt(Object(n)).forEach(function(i) {
      Object.defineProperty(e, i, Object.getOwnPropertyDescriptor(n, i));
    });
  }
  return e;
}
function Si(e, t, n) {
  return (t = Ci(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ci(e) {
  var t = Oi(e, "string");
  return Se(t) == "symbol" ? t : t + "";
}
function Oi(e, t) {
  if (Se(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(e, t);
    if (Se(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var zi = ["data-p"], Li = ["data-p"], Ai = ["data-p"], Bi = ["aria-label", "data-p"], Pi = ["data-p"];
function Ti(e, t, n, i, r, o) {
  var a = R("TimesIcon"), l = Ee("ripple");
  return s(), T(Kt, c({
    name: "p-message",
    appear: ""
  }, e.ptmi("transition")), {
    default: te(function() {
      return [r.visible ? (s(), u("div", c({
        key: 0,
        class: e.cx("root"),
        role: "alert",
        "aria-live": "assertive",
        "aria-atomic": "true",
        "data-p": o.dataP
      }, e.ptm("root")), [m("div", c({
        class: e.cx("contentWrapper")
      }, e.ptm("contentWrapper")), [e.$slots.container ? O(e.$slots, "container", {
        key: 0,
        closeCallback: o.close
      }) : (s(), u("div", c({
        key: 1,
        class: e.cx("content"),
        "data-p": o.dataP
      }, e.ptm("content")), [O(e.$slots, "icon", {
        class: K(e.cx("icon"))
      }, function() {
        return [(s(), T(ie(e.icon ? "span" : null), c({
          class: [e.cx("icon"), e.icon],
          "data-p": o.dataP
        }, e.ptm("icon")), null, 16, ["class", "data-p"]))];
      }), e.$slots.default ? (s(), u("div", c({
        key: 0,
        class: e.cx("text"),
        "data-p": o.dataP
      }, e.ptm("text")), [O(e.$slots, "default")], 16, Ai)) : $("", !0), e.closable ? ve((s(), u("button", c({
        key: 1,
        class: e.cx("closeButton"),
        "aria-label": o.closeAriaLabel,
        type: "button",
        onClick: t[0] || (t[0] = function(d) {
          return o.close(d);
        }),
        "data-p": o.dataP
      }, Lt(Lt({}, e.closeButtonProps), e.ptm("closeButton"))), [O(e.$slots, "closeicon", {}, function() {
        return [e.closeIcon ? (s(), u("i", c({
          key: 0,
          class: [e.cx("closeIcon"), e.closeIcon],
          "data-p": o.dataP
        }, e.ptm("closeIcon")), null, 16, Pi)) : (s(), T(a, c({
          key: 1,
          class: [e.cx("closeIcon"), e.closeIcon],
          "data-p": o.dataP
        }, e.ptm("closeIcon")), null, 16, ["class", "data-p"]))];
      })], 16, Bi)), [[l]]) : $("", !0)], 16, Li))], 16)], 16, zi)) : $("", !0)];
    }),
    _: 3
  }, 16);
}
qt.render = Ti;
var Fi = `
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
`, Vi = {
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
}, Mi = J.extend({
  name: "tag",
  style: Fi,
  classes: Vi
}), Di = {
  name: "BaseTag",
  extends: ae,
  props: {
    value: null,
    severity: null,
    rounded: Boolean,
    icon: String
  },
  style: Mi,
  provide: function() {
    return {
      $pcTag: this,
      $parentInstance: this
    };
  }
};
function Ce(e) {
  "@babel/helpers - typeof";
  return Ce = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ce(e);
}
function Ei(e, t, n) {
  return (t = _i(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function _i(e) {
  var t = ji(e, "string");
  return Ce(t) == "symbol" ? t : t + "";
}
function ji(e, t) {
  if (Ce(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(e, t);
    if (Ce(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Ge = {
  name: "Tag",
  extends: Di,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return Z(Ei({
        rounded: this.rounded
      }, this.severity, this.severity));
    }
  }
}, Ni = ["data-p"];
function Ki(e, t, n, i, r, o) {
  return s(), u("span", c({
    class: e.cx("root"),
    "data-p": o.dataP
  }, e.ptmi("root")), [e.$slots.icon ? (s(), T(ie(e.$slots.icon), c({
    key: 0,
    class: e.cx("icon")
  }, e.ptm("icon")), null, 16, ["class"])) : e.icon ? (s(), u("span", c({
    key: 1,
    class: [e.cx("icon"), e.icon]
  }, e.ptm("icon")), null, 16)) : $("", !0), e.value != null || e.$slots.default ? O(e.$slots, "default", {
    key: 2
  }, function() {
    return [m("span", c({
      class: e.cx("label")
    }, e.ptm("label")), A(e.value), 17)];
  }) : $("", !0)], 16, Ni);
}
Ge.render = Ki;
var Ze = {
  name: "SpinnerIcon",
  extends: se
};
function Ri(e) {
  return Gi(e) || Wi(e) || Hi(e) || Ui();
}
function Ui() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Hi(e, t) {
  if (e) {
    if (typeof e == "string") return nt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? nt(e, t) : void 0;
  }
}
function Wi(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Gi(e) {
  if (Array.isArray(e)) return nt(e);
}
function nt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, i = Array(t); n < t; n++) i[n] = e[n];
  return i;
}
function qi(e, t, n, i, r, o) {
  return s(), u("svg", c({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Ri(t[0] || (t[0] = [m("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Ze.render = qi;
var Zi = `
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
`, Yi = {
  root: function(t) {
    var n = t.props, i = t.instance;
    return ["p-badge p-component", {
      "p-badge-circle": ce(n.value) && String(n.value).length === 1,
      "p-badge-dot": He(n.value) && !i.$slots.default,
      "p-badge-sm": n.size === "small",
      "p-badge-lg": n.size === "large",
      "p-badge-xl": n.size === "xlarge",
      "p-badge-info": n.severity === "info",
      "p-badge-success": n.severity === "success",
      "p-badge-warn": n.severity === "warn",
      "p-badge-danger": n.severity === "danger",
      "p-badge-secondary": n.severity === "secondary",
      "p-badge-contrast": n.severity === "contrast"
    }];
  }
}, Ji = J.extend({
  name: "badge",
  style: Zi,
  classes: Yi
}), Qi = {
  name: "BaseBadge",
  extends: ae,
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
  style: Ji,
  provide: function() {
    return {
      $pcBadge: this,
      $parentInstance: this
    };
  }
};
function Oe(e) {
  "@babel/helpers - typeof";
  return Oe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Oe(e);
}
function At(e, t, n) {
  return (t = Xi(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Xi(e) {
  var t = eo(e, "string");
  return Oe(t) == "symbol" ? t : t + "";
}
function eo(e, t) {
  if (Oe(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(e, t);
    if (Oe(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Zt = {
  name: "Badge",
  extends: Qi,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return Z(At(At({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, to = ["data-p"];
function no(e, t, n, i, r, o) {
  return s(), u("span", c({
    class: e.cx("root"),
    "data-p": o.dataP
  }, e.ptmi("root")), [O(e.$slots, "default", {}, function() {
    return [de(A(e.value), 1)];
  })], 16, to);
}
Zt.render = no;
var io = `
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
function ze(e) {
  "@babel/helpers - typeof";
  return ze = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ze(e);
}
function le(e, t, n) {
  return (t = oo(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function oo(e) {
  var t = ro(e, "string");
  return ze(t) == "symbol" ? t : t + "";
}
function ro(e, t) {
  if (ze(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(e, t);
    if (ze(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var ao = {
  root: function(t) {
    var n = t.instance, i = t.props;
    return ["p-button p-component", le(le(le(le(le(le(le(le(le({
      "p-button-icon-only": n.hasIcon && !i.label && !i.badge,
      "p-button-vertical": (i.iconPos === "top" || i.iconPos === "bottom") && i.label,
      "p-button-loading": i.loading,
      "p-button-link": i.link || i.variant === "link"
    }, "p-button-".concat(i.severity), i.severity), "p-button-raised", i.raised), "p-button-rounded", i.rounded), "p-button-text", i.text || i.variant === "text"), "p-button-outlined", i.outlined || i.variant === "outlined"), "p-button-sm", i.size === "small"), "p-button-lg", i.size === "large"), "p-button-plain", i.plain), "p-button-fluid", n.hasFluid)];
  },
  loadingIcon: "p-button-loading-icon",
  icon: function(t) {
    var n = t.props;
    return ["p-button-icon", le({}, "p-button-icon-".concat(n.iconPos), n.label)];
  },
  label: "p-button-label"
}, so = J.extend({
  name: "button",
  style: io,
  classes: ao
}), lo = {
  name: "BaseButton",
  extends: ae,
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
  style: so,
  provide: function() {
    return {
      $pcButton: this,
      $parentInstance: this
    };
  }
};
function Le(e) {
  "@babel/helpers - typeof";
  return Le = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Le(e);
}
function ee(e, t, n) {
  return (t = uo(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function uo(e) {
  var t = co(e, "string");
  return Le(t) == "symbol" ? t : t + "";
}
function co(e, t) {
  if (Le(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(e, t);
    if (Le(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Ae = {
  name: "Button",
  extends: lo,
  inheritAttrs: !1,
  inject: {
    $pcFluid: {
      default: null
    }
  },
  methods: {
    getPTOptions: function(t) {
      var n = t === "root" ? this.ptmi : this.ptm;
      return n(t, {
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
      return c(this.asAttrs, this.a11yAttrs, this.getPTOptions("root"));
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
      return He(this.fluid) ? !!this.$pcFluid : this.fluid;
    },
    dataP: function() {
      return Z(ee(ee(ee(ee(ee(ee(ee(ee(ee(ee({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
    },
    dataIconP: function() {
      return Z(ee(ee({}, this.iconPos, this.iconPos), this.size, this.size));
    },
    dataLabelP: function() {
      return Z(ee(ee({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
    }
  },
  components: {
    SpinnerIcon: Ze,
    Badge: Zt
  },
  directives: {
    ripple: De
  }
}, po = ["data-p"], fo = ["data-p"];
function ho(e, t, n, i, r, o) {
  var a = R("SpinnerIcon"), l = R("Badge"), d = Ee("ripple");
  return e.asChild ? O(e.$slots, "default", {
    key: 1,
    class: K(e.cx("root")),
    a11yAttrs: o.a11yAttrs
  }) : ve((s(), T(ie(e.as), c({
    key: 0,
    class: e.cx("root"),
    "data-p": o.dataP
  }, o.attrs), {
    default: te(function() {
      return [O(e.$slots, "default", {}, function() {
        return [e.loading ? O(e.$slots, "loadingicon", c({
          key: 0,
          class: [e.cx("loadingIcon"), e.cx("icon")]
        }, e.ptm("loadingIcon")), function() {
          return [e.loadingIcon ? (s(), u("span", c({
            key: 0,
            class: [e.cx("loadingIcon"), e.cx("icon"), e.loadingIcon]
          }, e.ptm("loadingIcon")), null, 16)) : (s(), T(a, c({
            key: 1,
            class: [e.cx("loadingIcon"), e.cx("icon")],
            spin: ""
          }, e.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : O(e.$slots, "icon", c({
          key: 1,
          class: [e.cx("icon")]
        }, e.ptm("icon")), function() {
          return [e.icon ? (s(), u("span", c({
            key: 0,
            class: [e.cx("icon"), e.icon, e.iconClass],
            "data-p": o.dataIconP
          }, e.ptm("icon")), null, 16, po)) : $("", !0)];
        }), e.label ? (s(), u("span", c({
          key: 2,
          class: e.cx("label")
        }, e.ptm("label"), {
          "data-p": o.dataLabelP
        }), A(e.label), 17, fo)) : $("", !0), e.badge ? (s(), T(l, {
          key: 3,
          value: e.badge,
          class: K(e.badgeClass),
          severity: e.badgeSeverity,
          unstyled: e.unstyled,
          pt: e.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : $("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[d]]);
}
Ae.render = ho;
var kt = {
  name: "CheckIcon",
  extends: se
};
function bo(e) {
  return yo(e) || vo(e) || go(e) || mo();
}
function mo() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function go(e, t) {
  if (e) {
    if (typeof e == "string") return it(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? it(e, t) : void 0;
  }
}
function vo(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function yo(e) {
  if (Array.isArray(e)) return it(e);
}
function it(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, i = Array(t); n < t; n++) i[n] = e[n];
  return i;
}
function ko(e, t, n, i, r, o) {
  return s(), u("svg", c({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), bo(t[0] || (t[0] = [m("path", {
    d: "M4.86199 11.5948C4.78717 11.5923 4.71366 11.5745 4.64596 11.5426C4.57826 11.5107 4.51779 11.4652 4.46827 11.4091L0.753985 7.69483C0.683167 7.64891 0.623706 7.58751 0.580092 7.51525C0.536478 7.44299 0.509851 7.36177 0.502221 7.27771C0.49459 7.19366 0.506156 7.10897 0.536046 7.03004C0.565935 6.95111 0.613367 6.88 0.674759 6.82208C0.736151 6.76416 0.8099 6.72095 0.890436 6.69571C0.970973 6.67046 1.05619 6.66385 1.13966 6.67635C1.22313 6.68886 1.30266 6.72017 1.37226 6.76792C1.44186 6.81567 1.4997 6.8786 1.54141 6.95197L4.86199 10.2503L12.6397 2.49483C12.7444 2.42694 12.8689 2.39617 12.9932 2.40745C13.1174 2.41873 13.2343 2.47141 13.3251 2.55705C13.4159 2.64268 13.4753 2.75632 13.4938 2.87973C13.5123 3.00315 13.4888 3.1292 13.4271 3.23768L5.2557 11.4091C5.20618 11.4652 5.14571 11.5107 5.07801 11.5426C5.01031 11.5745 4.9368 11.5923 4.86199 11.5948Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
kt.render = ko;
var Yt = {
  name: "MinusIcon",
  extends: se
};
function wo(e) {
  return So(e) || $o(e) || Io(e) || xo();
}
function xo() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Io(e, t) {
  if (e) {
    if (typeof e == "string") return ot(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? ot(e, t) : void 0;
  }
}
function $o(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function So(e) {
  if (Array.isArray(e)) return ot(e);
}
function ot(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, i = Array(t); n < t; n++) i[n] = e[n];
  return i;
}
function Co(e, t, n, i, r, o) {
  return s(), u("svg", c({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), wo(t[0] || (t[0] = [m("path", {
    d: "M13.2222 7.77778H0.777778C0.571498 7.77778 0.373667 7.69584 0.227806 7.54998C0.0819442 7.40412 0 7.20629 0 7.00001C0 6.79373 0.0819442 6.5959 0.227806 6.45003C0.373667 6.30417 0.571498 6.22223 0.777778 6.22223H13.2222C13.4285 6.22223 13.6263 6.30417 13.7722 6.45003C13.9181 6.5959 14 6.79373 14 7.00001C14 7.20629 13.9181 7.40412 13.7722 7.54998C13.6263 7.69584 13.4285 7.77778 13.2222 7.77778Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Yt.render = Co;
var Oo = {
  name: "BaseEditableHolder",
  extends: ae,
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
      handler: function(t) {
        this.d_value = t;
      }
    },
    defaultValue: function(t) {
      this.d_value = t;
    },
    $formName: {
      immediate: !0,
      handler: function(t) {
        var n, i;
        this.formField = ((n = this.$pcForm) === null || n === void 0 || (i = n.register) === null || i === void 0 ? void 0 : i.call(n, t, this.$formControl)) || {};
      }
    },
    $formControl: {
      immediate: !0,
      handler: function(t) {
        var n, i;
        this.formField = ((n = this.$pcForm) === null || n === void 0 || (i = n.register) === null || i === void 0 ? void 0 : i.call(n, this.$formName, t)) || {};
      }
    },
    $formDefaultValue: {
      immediate: !0,
      handler: function(t) {
        this.d_value !== t && (this.d_value = t);
      }
    },
    $formValue: {
      immediate: !1,
      handler: function(t) {
        var n;
        (n = this.$pcForm) !== null && n !== void 0 && n.getFieldState(this.$formName) && t !== this.d_value && (this.d_value = t);
      }
    }
  },
  formField: {},
  methods: {
    writeValue: function(t, n) {
      var i, r;
      this.controlled && (this.d_value = t, this.$emit("update:modelValue", t)), this.$emit("value-change", t), (i = (r = this.formField).onChange) === null || i === void 0 || i.call(r, {
        originalEvent: n,
        value: t
      });
    },
    // @todo move to @primeuix/utils
    findNonEmpty: function() {
      for (var t = arguments.length, n = new Array(t), i = 0; i < t; i++)
        n[i] = arguments[i];
      return n.find(ce);
    }
  },
  computed: {
    $filled: function() {
      return ce(this.d_value);
    },
    $invalid: function() {
      var t, n;
      return !this.$formNovalidate && this.findNonEmpty(this.invalid, (t = this.$pcFormField) === null || t === void 0 || (t = t.$field) === null || t === void 0 ? void 0 : t.invalid, (n = this.$pcForm) === null || n === void 0 || (n = n.getFieldState(this.$formName)) === null || n === void 0 ? void 0 : n.invalid);
    },
    $formName: function() {
      var t;
      return this.$formNovalidate ? void 0 : this.name || ((t = this.$formControl) === null || t === void 0 ? void 0 : t.name);
    },
    $formControl: function() {
      var t;
      return this.formControl || ((t = this.$pcFormField) === null || t === void 0 ? void 0 : t.formControl);
    },
    $formNovalidate: function() {
      var t;
      return (t = this.$formControl) === null || t === void 0 ? void 0 : t.novalidate;
    },
    $formDefaultValue: function() {
      var t, n;
      return this.findNonEmpty(this.d_value, (t = this.$pcFormField) === null || t === void 0 ? void 0 : t.initialValue, (n = this.$pcForm) === null || n === void 0 || (n = n.initialValues) === null || n === void 0 ? void 0 : n[this.$formName]);
    },
    $formValue: function() {
      var t, n;
      return this.findNonEmpty((t = this.$pcFormField) === null || t === void 0 || (t = t.$field) === null || t === void 0 ? void 0 : t.value, (n = this.$pcForm) === null || n === void 0 || (n = n.getFieldState(this.$formName)) === null || n === void 0 ? void 0 : n.value);
    },
    controlled: function() {
      return this.$inProps.hasOwnProperty("modelValue") || !this.$inProps.hasOwnProperty("modelValue") && !this.$inProps.hasOwnProperty("defaultValue");
    },
    // @deprecated use $filled instead
    filled: function() {
      return this.$filled;
    }
  }
}, _e = {
  name: "BaseInput",
  extends: Oo,
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
}, zo = `
    .p-checkbox {
        position: relative;
        display: inline-flex;
        user-select: none;
        vertical-align: bottom;
        width: dt('checkbox.width');
        height: dt('checkbox.height');
    }

    .p-checkbox-input {
        cursor: pointer;
        appearance: none;
        position: absolute;
        inset-block-start: 0;
        inset-inline-start: 0;
        width: 100%;
        height: 100%;
        padding: 0;
        margin: 0;
        opacity: 0;
        z-index: 1;
        outline: 0 none;
        border: 1px solid transparent;
        border-radius: dt('checkbox.border.radius');
    }

    .p-checkbox-box {
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: dt('checkbox.border.radius');
        border: 1px solid dt('checkbox.border.color');
        background: dt('checkbox.background');
        width: dt('checkbox.width');
        height: dt('checkbox.height');
        transition:
            background dt('checkbox.transition.duration'),
            color dt('checkbox.transition.duration'),
            border-color dt('checkbox.transition.duration'),
            box-shadow dt('checkbox.transition.duration'),
            outline-color dt('checkbox.transition.duration');
        outline-color: transparent;
        box-shadow: dt('checkbox.shadow');
    }

    .p-checkbox-icon {
        transition-duration: dt('checkbox.transition.duration');
        color: dt('checkbox.icon.color');
        font-size: dt('checkbox.icon.size');
        width: dt('checkbox.icon.size');
        height: dt('checkbox.icon.size');
    }

    .p-checkbox:not(.p-disabled):has(.p-checkbox-input:hover) .p-checkbox-box {
        border-color: dt('checkbox.hover.border.color');
    }

    .p-checkbox-checked .p-checkbox-box {
        border-color: dt('checkbox.checked.border.color');
        background: dt('checkbox.checked.background');
    }

    .p-checkbox-checked .p-checkbox-icon {
        color: dt('checkbox.icon.checked.color');
    }

    .p-checkbox-checked:not(.p-disabled):has(.p-checkbox-input:hover) .p-checkbox-box {
        background: dt('checkbox.checked.hover.background');
        border-color: dt('checkbox.checked.hover.border.color');
    }

    .p-checkbox-checked:not(.p-disabled):has(.p-checkbox-input:hover) .p-checkbox-icon {
        color: dt('checkbox.icon.checked.hover.color');
    }

    .p-checkbox:not(.p-disabled):has(.p-checkbox-input:focus-visible) .p-checkbox-box {
        border-color: dt('checkbox.focus.border.color');
        box-shadow: dt('checkbox.focus.ring.shadow');
        outline: dt('checkbox.focus.ring.width') dt('checkbox.focus.ring.style') dt('checkbox.focus.ring.color');
        outline-offset: dt('checkbox.focus.ring.offset');
    }

    .p-checkbox-checked:not(.p-disabled):has(.p-checkbox-input:focus-visible) .p-checkbox-box {
        border-color: dt('checkbox.checked.focus.border.color');
    }

    .p-checkbox.p-invalid > .p-checkbox-box {
        border-color: dt('checkbox.invalid.border.color');
    }

    .p-checkbox.p-variant-filled .p-checkbox-box {
        background: dt('checkbox.filled.background');
    }

    .p-checkbox-checked.p-variant-filled .p-checkbox-box {
        background: dt('checkbox.checked.background');
    }

    .p-checkbox-checked.p-variant-filled:not(.p-disabled):has(.p-checkbox-input:hover) .p-checkbox-box {
        background: dt('checkbox.checked.hover.background');
    }

    .p-checkbox.p-disabled {
        opacity: 1;
    }

    .p-checkbox.p-disabled .p-checkbox-box {
        background: dt('checkbox.disabled.background');
        border-color: dt('checkbox.checked.disabled.border.color');
    }

    .p-checkbox.p-disabled .p-checkbox-box .p-checkbox-icon {
        color: dt('checkbox.icon.disabled.color');
    }

    .p-checkbox-sm,
    .p-checkbox-sm .p-checkbox-box {
        width: dt('checkbox.sm.width');
        height: dt('checkbox.sm.height');
    }

    .p-checkbox-sm .p-checkbox-icon {
        font-size: dt('checkbox.icon.sm.size');
        width: dt('checkbox.icon.sm.size');
        height: dt('checkbox.icon.sm.size');
    }

    .p-checkbox-lg,
    .p-checkbox-lg .p-checkbox-box {
        width: dt('checkbox.lg.width');
        height: dt('checkbox.lg.height');
    }

    .p-checkbox-lg .p-checkbox-icon {
        font-size: dt('checkbox.icon.lg.size');
        width: dt('checkbox.icon.lg.size');
        height: dt('checkbox.icon.lg.size');
    }
`, Lo = {
  root: function(t) {
    var n = t.instance, i = t.props;
    return ["p-checkbox p-component", {
      "p-checkbox-checked": n.checked,
      "p-disabled": i.disabled,
      "p-invalid": n.$pcCheckboxGroup ? n.$pcCheckboxGroup.$invalid : n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-checkbox-sm p-inputfield-sm": i.size === "small",
      "p-checkbox-lg p-inputfield-lg": i.size === "large"
    }];
  },
  box: "p-checkbox-box",
  input: "p-checkbox-input",
  icon: "p-checkbox-icon"
}, Ao = J.extend({
  name: "checkbox",
  style: zo,
  classes: Lo
}), Bo = {
  name: "BaseCheckbox",
  extends: _e,
  props: {
    value: null,
    binary: Boolean,
    indeterminate: {
      type: Boolean,
      default: !1
    },
    trueValue: {
      type: null,
      default: !0
    },
    falseValue: {
      type: null,
      default: !1
    },
    readonly: {
      type: Boolean,
      default: !1
    },
    required: {
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
  style: Ao,
  provide: function() {
    return {
      $pcCheckbox: this,
      $parentInstance: this
    };
  }
};
function Be(e) {
  "@babel/helpers - typeof";
  return Be = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Be(e);
}
function Po(e, t, n) {
  return (t = To(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function To(e) {
  var t = Fo(e, "string");
  return Be(t) == "symbol" ? t : t + "";
}
function Fo(e, t) {
  if (Be(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(e, t);
    if (Be(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function Vo(e) {
  return _o(e) || Eo(e) || Do(e) || Mo();
}
function Mo() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Do(e, t) {
  if (e) {
    if (typeof e == "string") return rt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? rt(e, t) : void 0;
  }
}
function Eo(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function _o(e) {
  if (Array.isArray(e)) return rt(e);
}
function rt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, i = Array(t); n < t; n++) i[n] = e[n];
  return i;
}
var Jt = {
  name: "Checkbox",
  extends: Bo,
  inheritAttrs: !1,
  emits: ["change", "focus", "blur", "update:indeterminate"],
  inject: {
    $pcCheckboxGroup: {
      default: void 0
    }
  },
  data: function() {
    return {
      d_indeterminate: this.indeterminate
    };
  },
  watch: {
    indeterminate: function(t) {
      this.d_indeterminate = t, this.updateIndeterminate();
    }
  },
  mounted: function() {
    this.updateIndeterminate();
  },
  updated: function() {
    this.updateIndeterminate();
  },
  methods: {
    getPTOptions: function(t) {
      var n = t === "root" ? this.ptmi : this.ptm;
      return n(t, {
        context: {
          checked: this.checked,
          indeterminate: this.d_indeterminate,
          disabled: this.disabled
        }
      });
    },
    onChange: function(t) {
      var n = this;
      if (!this.disabled && !this.readonly) {
        var i = this.$pcCheckboxGroup ? this.$pcCheckboxGroup.d_value : this.d_value, r;
        this.binary ? r = this.d_indeterminate ? this.trueValue : this.checked ? this.falseValue : this.trueValue : this.checked || this.d_indeterminate ? r = i.filter(function(o) {
          return !mt(o, n.value);
        }) : r = i ? [].concat(Vo(i), [this.value]) : [this.value], this.d_indeterminate && (this.d_indeterminate = !1, this.$emit("update:indeterminate", this.d_indeterminate)), this.$pcCheckboxGroup ? this.$pcCheckboxGroup.writeValue(r, t) : this.writeValue(r, t), this.$emit("change", t);
      }
    },
    onFocus: function(t) {
      this.$emit("focus", t);
    },
    onBlur: function(t) {
      var n, i;
      this.$emit("blur", t), (n = (i = this.formField).onBlur) === null || n === void 0 || n.call(i, t);
    },
    updateIndeterminate: function() {
      this.$refs.input && (this.$refs.input.indeterminate = this.d_indeterminate);
    }
  },
  computed: {
    groupName: function() {
      return this.$pcCheckboxGroup ? this.$pcCheckboxGroup.groupName : this.$formName;
    },
    checked: function() {
      var t = this.$pcCheckboxGroup ? this.$pcCheckboxGroup.d_value : this.d_value;
      return this.d_indeterminate ? !1 : this.binary ? t === this.trueValue : hn(this.value, t);
    },
    dataP: function() {
      return Z(Po({
        invalid: this.$invalid,
        checked: this.checked,
        disabled: this.disabled,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  },
  components: {
    CheckIcon: kt,
    MinusIcon: Yt
  }
}, jo = ["data-p-checked", "data-p-indeterminate", "data-p-disabled", "data-p"], No = ["id", "value", "name", "checked", "tabindex", "disabled", "readonly", "required", "aria-labelledby", "aria-label", "aria-invalid"], Ko = ["data-p"];
function Ro(e, t, n, i, r, o) {
  var a = R("CheckIcon"), l = R("MinusIcon");
  return s(), u("div", c({
    class: e.cx("root")
  }, o.getPTOptions("root"), {
    "data-p-checked": o.checked,
    "data-p-indeterminate": r.d_indeterminate || void 0,
    "data-p-disabled": e.disabled,
    "data-p": o.dataP
  }), [m("input", c({
    ref: "input",
    id: e.inputId,
    type: "checkbox",
    class: [e.cx("input"), e.inputClass],
    style: e.inputStyle,
    value: e.value,
    name: o.groupName,
    checked: o.checked,
    tabindex: e.tabindex,
    disabled: e.disabled,
    readonly: e.readonly,
    required: e.required,
    "aria-labelledby": e.ariaLabelledby,
    "aria-label": e.ariaLabel,
    "aria-invalid": e.invalid || void 0,
    onFocus: t[0] || (t[0] = function() {
      return o.onFocus && o.onFocus.apply(o, arguments);
    }),
    onBlur: t[1] || (t[1] = function() {
      return o.onBlur && o.onBlur.apply(o, arguments);
    }),
    onChange: t[2] || (t[2] = function() {
      return o.onChange && o.onChange.apply(o, arguments);
    })
  }, o.getPTOptions("input")), null, 16, No), m("div", c({
    class: e.cx("box")
  }, o.getPTOptions("box"), {
    "data-p": o.dataP
  }), [O(e.$slots, "icon", {
    checked: o.checked,
    indeterminate: r.d_indeterminate,
    class: K(e.cx("icon")),
    dataP: o.dataP
  }, function() {
    return [o.checked ? (s(), T(a, c({
      key: 0,
      class: e.cx("icon")
    }, o.getPTOptions("icon"), {
      "data-p": o.dataP
    }), null, 16, ["class", "data-p"])) : r.d_indeterminate ? (s(), T(l, c({
      key: 1,
      class: e.cx("icon")
    }, o.getPTOptions("icon"), {
      "data-p": o.dataP
    }), null, 16, ["class", "data-p"])) : $("", !0)];
  })], 16, Ko)], 16, jo);
}
Jt.render = Ro;
var Qt = {
  name: "AngleDownIcon",
  extends: se
};
function Uo(e) {
  return qo(e) || Go(e) || Wo(e) || Ho();
}
function Ho() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Wo(e, t) {
  if (e) {
    if (typeof e == "string") return at(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? at(e, t) : void 0;
  }
}
function Go(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function qo(e) {
  if (Array.isArray(e)) return at(e);
}
function at(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, i = Array(t); n < t; n++) i[n] = e[n];
  return i;
}
function Zo(e, t, n, i, r, o) {
  return s(), u("svg", c({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Uo(t[0] || (t[0] = [m("path", {
    d: "M3.58659 4.5007C3.68513 4.50023 3.78277 4.51945 3.87379 4.55723C3.9648 4.59501 4.04735 4.65058 4.11659 4.7207L7.11659 7.7207L10.1166 4.7207C10.2619 4.65055 10.4259 4.62911 10.5843 4.65956C10.7427 4.69002 10.8871 4.77074 10.996 4.88976C11.1049 5.00877 11.1726 5.15973 11.1889 5.32022C11.2052 5.48072 11.1693 5.6422 11.0866 5.7807L7.58659 9.2807C7.44597 9.42115 7.25534 9.50004 7.05659 9.50004C6.85784 9.50004 6.66722 9.42115 6.52659 9.2807L3.02659 5.7807C2.88614 5.64007 2.80725 5.44945 2.80725 5.2507C2.80725 5.05195 2.88614 4.86132 3.02659 4.7207C3.09932 4.64685 3.18675 4.58911 3.28322 4.55121C3.37969 4.51331 3.48305 4.4961 3.58659 4.5007Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Qt.render = Zo;
var Xt = {
  name: "AngleUpIcon",
  extends: se
};
function Yo(e) {
  return er(e) || Xo(e) || Qo(e) || Jo();
}
function Jo() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Qo(e, t) {
  if (e) {
    if (typeof e == "string") return st(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? st(e, t) : void 0;
  }
}
function Xo(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function er(e) {
  if (Array.isArray(e)) return st(e);
}
function st(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, i = Array(t); n < t; n++) i[n] = e[n];
  return i;
}
function tr(e, t, n, i, r, o) {
  return s(), u("svg", c({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Yo(t[0] || (t[0] = [m("path", {
    d: "M10.4134 9.49931C10.3148 9.49977 10.2172 9.48055 10.1262 9.44278C10.0352 9.405 9.95263 9.34942 9.88338 9.27931L6.88338 6.27931L3.88338 9.27931C3.73811 9.34946 3.57409 9.3709 3.41567 9.34044C3.25724 9.30999 3.11286 9.22926 3.00395 9.11025C2.89504 8.99124 2.82741 8.84028 2.8111 8.67978C2.79478 8.51928 2.83065 8.35781 2.91338 8.21931L6.41338 4.71931C6.55401 4.57886 6.74463 4.49997 6.94338 4.49997C7.14213 4.49997 7.33276 4.57886 7.47338 4.71931L10.9734 8.21931C11.1138 8.35994 11.1927 8.55056 11.1927 8.74931C11.1927 8.94806 11.1138 9.13868 10.9734 9.27931C10.9007 9.35315 10.8132 9.41089 10.7168 9.44879C10.6203 9.48669 10.5169 9.5039 10.4134 9.49931Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Xt.render = tr;
var nr = `
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
`, ir = {
  root: function(t) {
    var n = t.instance, i = t.props;
    return ["p-inputtext p-component", {
      "p-filled": n.$filled,
      "p-inputtext-sm p-inputfield-sm": i.size === "small",
      "p-inputtext-lg p-inputfield-lg": i.size === "large",
      "p-invalid": n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-inputtext-fluid": n.$fluid
    }];
  }
}, or = J.extend({
  name: "inputtext",
  style: nr,
  classes: ir
}), rr = {
  name: "BaseInputText",
  extends: _e,
  style: or,
  provide: function() {
    return {
      $pcInputText: this,
      $parentInstance: this
    };
  }
};
function Pe(e) {
  "@babel/helpers - typeof";
  return Pe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Pe(e);
}
function ar(e, t, n) {
  return (t = sr(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function sr(e) {
  var t = lr(e, "string");
  return Pe(t) == "symbol" ? t : t + "";
}
function lr(e, t) {
  if (Pe(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(e, t);
    if (Pe(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Ye = {
  name: "InputText",
  extends: rr,
  inheritAttrs: !1,
  methods: {
    onInput: function(t) {
      this.writeValue(t.target.value, t);
    }
  },
  computed: {
    attrs: function() {
      return c(this.ptmi("root", {
        context: {
          filled: this.$filled,
          disabled: this.disabled
        }
      }), this.formField);
    },
    dataP: function() {
      return Z(ar({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, ur = ["value", "name", "disabled", "aria-invalid", "data-p"];
function dr(e, t, n, i, r, o) {
  return s(), u("input", c({
    type: "text",
    class: e.cx("root"),
    value: e.d_value,
    name: e.name,
    disabled: e.disabled,
    "aria-invalid": e.$invalid || void 0,
    "data-p": o.dataP,
    onInput: t[0] || (t[0] = function() {
      return o.onInput && o.onInput.apply(o, arguments);
    })
  }, o.attrs), null, 16, ur);
}
Ye.render = dr;
var cr = `
    .p-inputnumber {
        display: inline-flex;
        position: relative;
    }

    .p-inputnumber-button {
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 auto;
        cursor: pointer;
        background: dt('inputnumber.button.background');
        color: dt('inputnumber.button.color');
        width: dt('inputnumber.button.width');
        transition:
            background dt('inputnumber.transition.duration'),
            color dt('inputnumber.transition.duration'),
            border-color dt('inputnumber.transition.duration'),
            outline-color dt('inputnumber.transition.duration');
    }

    .p-inputnumber-button:disabled {
        cursor: auto;
    }

    .p-inputnumber-button:not(:disabled):hover {
        background: dt('inputnumber.button.hover.background');
        color: dt('inputnumber.button.hover.color');
    }

    .p-inputnumber-button:not(:disabled):active {
        background: dt('inputnumber.button.active.background');
        color: dt('inputnumber.button.active.color');
    }

    .p-inputnumber-stacked .p-inputnumber-button {
        position: relative;
        flex: 1 1 auto;
        border: 0 none;
    }

    .p-inputnumber-stacked .p-inputnumber-button-group {
        display: flex;
        flex-direction: column;
        position: absolute;
        inset-block-start: 1px;
        inset-inline-end: 1px;
        height: calc(100% - 2px);
        z-index: 1;
    }

    .p-inputnumber-stacked .p-inputnumber-increment-button {
        padding: 0;
        border-start-end-radius: calc(dt('inputnumber.button.border.radius') - 1px);
    }

    .p-inputnumber-stacked .p-inputnumber-decrement-button {
        padding: 0;
        border-end-end-radius: calc(dt('inputnumber.button.border.radius') - 1px);
    }

    .p-inputnumber-stacked .p-inputnumber-input {
        padding-inline-end: calc(dt('inputnumber.button.width') + dt('form.field.padding.x'));
    }

    .p-inputnumber-horizontal .p-inputnumber-button {
        border: 1px solid dt('inputnumber.button.border.color');
    }

    .p-inputnumber-horizontal .p-inputnumber-button:hover {
        border-color: dt('inputnumber.button.hover.border.color');
    }

    .p-inputnumber-horizontal .p-inputnumber-button:active {
        border-color: dt('inputnumber.button.active.border.color');
    }

    .p-inputnumber-horizontal .p-inputnumber-increment-button {
        order: 3;
        border-start-end-radius: dt('inputnumber.button.border.radius');
        border-end-end-radius: dt('inputnumber.button.border.radius');
        border-inline-start: 0 none;
    }

    .p-inputnumber-horizontal .p-inputnumber-input {
        order: 2;
        border-radius: 0;
    }

    .p-inputnumber-horizontal .p-inputnumber-decrement-button {
        order: 1;
        border-start-start-radius: dt('inputnumber.button.border.radius');
        border-end-start-radius: dt('inputnumber.button.border.radius');
        border-inline-end: 0 none;
    }

    .p-floatlabel:has(.p-inputnumber-horizontal) label {
        margin-inline-start: dt('inputnumber.button.width');
    }

    .p-inputnumber-vertical {
        flex-direction: column;
    }

    .p-inputnumber-vertical .p-inputnumber-button {
        border: 1px solid dt('inputnumber.button.border.color');
        padding: dt('inputnumber.button.vertical.padding');
    }

    .p-inputnumber-vertical .p-inputnumber-button:hover {
        border-color: dt('inputnumber.button.hover.border.color');
    }

    .p-inputnumber-vertical .p-inputnumber-button:active {
        border-color: dt('inputnumber.button.active.border.color');
    }

    .p-inputnumber-vertical .p-inputnumber-increment-button {
        order: 1;
        border-start-start-radius: dt('inputnumber.button.border.radius');
        border-start-end-radius: dt('inputnumber.button.border.radius');
        width: 100%;
        border-block-end: 0 none;
    }

    .p-inputnumber-vertical .p-inputnumber-input {
        order: 2;
        border-radius: 0;
        text-align: center;
    }

    .p-inputnumber-vertical .p-inputnumber-decrement-button {
        order: 3;
        border-end-start-radius: dt('inputnumber.button.border.radius');
        border-end-end-radius: dt('inputnumber.button.border.radius');
        width: 100%;
        border-block-start: 0 none;
    }

    .p-inputnumber-input {
        flex: 1 1 auto;
    }

    .p-inputnumber-fluid {
        width: 100%;
    }

    .p-inputnumber-fluid .p-inputnumber-input {
        width: 1%;
    }

    .p-inputnumber-fluid.p-inputnumber-vertical .p-inputnumber-input {
        width: 100%;
    }

    .p-inputnumber:has(.p-inputtext-sm) .p-inputnumber-button .p-icon {
        font-size: dt('form.field.sm.font.size');
        width: dt('form.field.sm.font.size');
        height: dt('form.field.sm.font.size');
    }

    .p-inputnumber:has(.p-inputtext-lg) .p-inputnumber-button .p-icon {
        font-size: dt('form.field.lg.font.size');
        width: dt('form.field.lg.font.size');
        height: dt('form.field.lg.font.size');
    }

    .p-inputnumber-clear-icon {
        position: absolute;
        top: 50%;
        margin-top: -0.5rem;
        cursor: pointer;
        inset-inline-end: dt('form.field.padding.x');
        color: dt('form.field.icon.color');
    }

    .p-inputnumber:has(.p-inputnumber-clear-icon) .p-inputnumber-input {
        padding-inline-end: calc((dt('form.field.padding.x') * 2) + dt('icon.size'));
    }

    .p-inputnumber-stacked .p-inputnumber-clear-icon {
        inset-inline-end: calc(dt('inputnumber.button.width') + dt('form.field.padding.x'));
    }

    .p-inputnumber-stacked:has(.p-inputnumber-clear-icon) .p-inputnumber-input {
        padding-inline-end: calc(dt('inputnumber.button.width') + (dt('form.field.padding.x') * 2) + dt('icon.size'));
    }

    .p-inputnumber-horizontal .p-inputnumber-clear-icon {
        inset-inline-end: calc(dt('inputnumber.button.width') + dt('form.field.padding.x'));
    }
`, pr = {
  root: function(t) {
    var n = t.instance, i = t.props;
    return ["p-inputnumber p-component p-inputwrapper", {
      "p-invalid": n.$invalid,
      "p-inputwrapper-filled": n.$filled || i.allowEmpty === !1,
      "p-inputwrapper-focus": n.focused,
      "p-inputnumber-stacked": i.showButtons && i.buttonLayout === "stacked",
      "p-inputnumber-horizontal": i.showButtons && i.buttonLayout === "horizontal",
      "p-inputnumber-vertical": i.showButtons && i.buttonLayout === "vertical",
      "p-inputnumber-fluid": n.$fluid
    }];
  },
  pcInputText: "p-inputnumber-input",
  clearIcon: "p-inputnumber-clear-icon",
  buttonGroup: "p-inputnumber-button-group",
  incrementButton: function(t) {
    var n = t.instance, i = t.props;
    return ["p-inputnumber-button p-inputnumber-increment-button", {
      "p-disabled": i.showButtons && i.max !== null && n.maxBoundry()
    }];
  },
  decrementButton: function(t) {
    var n = t.instance, i = t.props;
    return ["p-inputnumber-button p-inputnumber-decrement-button", {
      "p-disabled": i.showButtons && i.min !== null && n.minBoundry()
    }];
  }
}, fr = J.extend({
  name: "inputnumber",
  style: cr,
  classes: pr
}), hr = {
  name: "BaseInputNumber",
  extends: _e,
  props: {
    format: {
      type: Boolean,
      default: !0
    },
    showButtons: {
      type: Boolean,
      default: !1
    },
    buttonLayout: {
      type: String,
      default: "stacked"
    },
    incrementButtonClass: {
      type: String,
      default: null
    },
    decrementButtonClass: {
      type: String,
      default: null
    },
    incrementButtonIcon: {
      type: String,
      default: void 0
    },
    incrementIcon: {
      type: String,
      default: void 0
    },
    decrementButtonIcon: {
      type: String,
      default: void 0
    },
    decrementIcon: {
      type: String,
      default: void 0
    },
    locale: {
      type: String,
      default: void 0
    },
    localeMatcher: {
      type: String,
      default: void 0
    },
    mode: {
      type: String,
      default: "decimal"
    },
    prefix: {
      type: String,
      default: null
    },
    suffix: {
      type: String,
      default: null
    },
    currency: {
      type: String,
      default: void 0
    },
    currencyDisplay: {
      type: String,
      default: void 0
    },
    useGrouping: {
      type: Boolean,
      default: !0
    },
    minFractionDigits: {
      type: Number,
      default: void 0
    },
    maxFractionDigits: {
      type: Number,
      default: void 0
    },
    roundingMode: {
      type: String,
      default: "halfExpand",
      validator: function(t) {
        return ["ceil", "floor", "expand", "trunc", "halfCeil", "halfFloor", "halfExpand", "halfTrunc", "halfEven"].includes(t);
      }
    },
    min: {
      type: Number,
      default: null
    },
    max: {
      type: Number,
      default: null
    },
    step: {
      type: Number,
      default: 1
    },
    allowEmpty: {
      type: Boolean,
      default: !0
    },
    highlightOnFocus: {
      type: Boolean,
      default: !1
    },
    showClear: {
      type: Boolean,
      default: !1
    },
    readonly: {
      type: Boolean,
      default: !1
    },
    placeholder: {
      type: String,
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
    },
    required: {
      type: Boolean,
      default: !1
    }
  },
  style: fr,
  provide: function() {
    return {
      $pcInputNumber: this,
      $parentInstance: this
    };
  }
};
function Te(e) {
  "@babel/helpers - typeof";
  return Te = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Te(e);
}
function Bt(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(e);
    t && (i = i.filter(function(r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), n.push.apply(n, i);
  }
  return n;
}
function Pt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Bt(Object(n), !0).forEach(function(i) {
      lt(e, i, n[i]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Bt(Object(n)).forEach(function(i) {
      Object.defineProperty(e, i, Object.getOwnPropertyDescriptor(n, i));
    });
  }
  return e;
}
function lt(e, t, n) {
  return (t = br(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function br(e) {
  var t = mr(e, "string");
  return Te(t) == "symbol" ? t : t + "";
}
function mr(e, t) {
  if (Te(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(e, t);
    if (Te(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function gr(e) {
  return wr(e) || kr(e) || yr(e) || vr();
}
function vr() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function yr(e, t) {
  if (e) {
    if (typeof e == "string") return ut(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? ut(e, t) : void 0;
  }
}
function kr(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function wr(e) {
  if (Array.isArray(e)) return ut(e);
}
function ut(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, i = Array(t); n < t; n++) i[n] = e[n];
  return i;
}
var en = {
  name: "InputNumber",
  extends: hr,
  inheritAttrs: !1,
  emits: ["input", "focus", "blur"],
  inject: {
    $pcFluid: {
      default: null
    }
  },
  numberFormat: null,
  _numeral: null,
  _decimal: null,
  _group: null,
  _minusSign: null,
  _currency: null,
  _suffix: null,
  _prefix: null,
  _index: null,
  groupChar: "",
  isSpecialChar: null,
  prefixChar: null,
  suffixChar: null,
  timer: null,
  data: function() {
    return {
      // @deprecated
      d_modelValue: this.d_value,
      focused: !1
    };
  },
  watch: {
    d_value: {
      immediate: !0,
      handler: function(t) {
        var n;
        this.d_modelValue = t, (n = this.$refs.clearIcon) !== null && n !== void 0 && (n = n.$el) !== null && n !== void 0 && n.style && (this.$refs.clearIcon.$el.style.display = He(t) ? "none" : "block");
      }
    },
    locale: function(t, n) {
      this.updateConstructParser(t, n);
    },
    localeMatcher: function(t, n) {
      this.updateConstructParser(t, n);
    },
    mode: function(t, n) {
      this.updateConstructParser(t, n);
    },
    currency: function(t, n) {
      this.updateConstructParser(t, n);
    },
    currencyDisplay: function(t, n) {
      this.updateConstructParser(t, n);
    },
    useGrouping: function(t, n) {
      this.updateConstructParser(t, n);
    },
    minFractionDigits: function(t, n) {
      this.updateConstructParser(t, n);
    },
    maxFractionDigits: function(t, n) {
      this.updateConstructParser(t, n);
    },
    suffix: function(t, n) {
      this.updateConstructParser(t, n);
    },
    prefix: function(t, n) {
      this.updateConstructParser(t, n);
    }
  },
  created: function() {
    this.constructParser();
  },
  mounted: function() {
    var t;
    (t = this.$refs.clearIcon) !== null && t !== void 0 && (t = t.$el) !== null && t !== void 0 && t.style && (this.$refs.clearIcon.$el.style.display = this.$filled ? "block" : "none");
  },
  methods: {
    getOptions: function() {
      return {
        localeMatcher: this.localeMatcher,
        style: this.mode,
        currency: this.currency,
        currencyDisplay: this.currencyDisplay,
        useGrouping: this.useGrouping,
        minimumFractionDigits: this.minFractionDigits,
        maximumFractionDigits: this.maxFractionDigits,
        roundingMode: this.roundingMode
      };
    },
    constructParser: function() {
      this.numberFormat = new Intl.NumberFormat(this.locale, this.getOptions());
      var t = gr(new Intl.NumberFormat(this.locale, {
        useGrouping: !1
      }).format(9876543210)).reverse(), n = new Map(t.map(function(i, r) {
        return [i, r];
      }));
      this._numeral = new RegExp("[".concat(t.join(""), "]"), "g"), this._group = this.getGroupingExpression(), this._minusSign = this.getMinusSignExpression(), this._currency = this.getCurrencyExpression(), this._decimal = this.getDecimalExpression(), this._suffix = this.getSuffixExpression(), this._prefix = this.getPrefixExpression(), this._index = function(i) {
        return n.get(i);
      };
    },
    updateConstructParser: function(t, n) {
      t !== n && this.constructParser();
    },
    escapeRegExp: function(t) {
      return t.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    },
    getDecimalExpression: function() {
      var t = new Intl.NumberFormat(this.locale, Pt(Pt({}, this.getOptions()), {}, {
        useGrouping: !1
      })), n = t.format(1.1);
      return n === t.format(1) ? new RegExp("[]", "g") : new RegExp("[".concat(n.replace(this._currency, "").trim().replace(this._numeral, ""), "]"), "g");
    },
    getGroupingExpression: function() {
      var t = new Intl.NumberFormat(this.locale, {
        useGrouping: !0
      });
      return this.groupChar = t.format(1e6).trim().replace(this._numeral, "").charAt(0), new RegExp("[".concat(this.groupChar, "]"), "g");
    },
    getMinusSignExpression: function() {
      var t = new Intl.NumberFormat(this.locale, {
        useGrouping: !1
      });
      return new RegExp("[".concat(t.format(-1).trim().replace(this._numeral, ""), "]"), "g");
    },
    getCurrencyExpression: function() {
      if (this.currency) {
        var t = new Intl.NumberFormat(this.locale, {
          style: "currency",
          currency: this.currency,
          currencyDisplay: this.currencyDisplay,
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
          roundingMode: this.roundingMode
        });
        return new RegExp("[".concat(t.format(1).replace(/\s/g, "").replace(this._numeral, "").replace(this._group, ""), "]"), "g");
      }
      return new RegExp("[]", "g");
    },
    getPrefixExpression: function() {
      if (this.prefix)
        this.prefixChar = this.prefix;
      else {
        var t = new Intl.NumberFormat(this.locale, {
          style: this.mode,
          currency: this.currency,
          currencyDisplay: this.currencyDisplay
        });
        this.prefixChar = t.format(1).split("1")[0];
      }
      return new RegExp("".concat(this.escapeRegExp(this.prefixChar || "")), "g");
    },
    getSuffixExpression: function() {
      if (this.suffix)
        this.suffixChar = this.suffix;
      else {
        var t = new Intl.NumberFormat(this.locale, {
          style: this.mode,
          currency: this.currency,
          currencyDisplay: this.currencyDisplay,
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
          roundingMode: this.roundingMode
        });
        this.suffixChar = t.format(1).split("1")[1];
      }
      return new RegExp("".concat(this.escapeRegExp(this.suffixChar || "")), "g");
    },
    formatValue: function(t) {
      if (t != null) {
        if (t === "-")
          return t;
        if (this.format) {
          var n = new Intl.NumberFormat(this.locale, this.getOptions()), i = n.format(t);
          return this.prefix && (i = this.prefix + i), this.suffix && (i = i + this.suffix), i;
        }
        return t.toString();
      }
      return "";
    },
    parseValue: function(t) {
      var n = t.replace(this._suffix, "").replace(this._prefix, "").trim().replace(/\s/g, "").replace(this._currency, "").replace(this._group, "").replace(this._minusSign, "-").replace(this._decimal, ".").replace(this._numeral, this._index);
      if (n) {
        if (n === "-")
          return n;
        var i = +n;
        return isNaN(i) ? null : i;
      }
      return null;
    },
    repeat: function(t, n, i) {
      var r = this;
      if (!this.readonly) {
        var o = n || 500;
        this.clearTimer(), this.timer = setTimeout(function() {
          r.repeat(t, 40, i);
        }, o), this.spin(t, i);
      }
    },
    addWithPrecision: function(t, n) {
      var i = t.toString(), r = n.toString(), o = i.includes(".") ? i.split(".")[1].length : 0, a = r.includes(".") ? r.split(".")[1].length : 0, l = Math.max(o, a), d = Math.pow(10, l);
      return Math.round((t + n) * d) / d;
    },
    spin: function(t, n) {
      if (this.$refs.input) {
        var i = this.step * n, r = this.parseValue(this.$refs.input.$el.value) || 0, o = this.validateValue(this.addWithPrecision(r, i));
        this.updateInput(o, null, "spin"), this.updateModel(t, o), this.handleOnInput(t, r, o);
      }
    },
    onUpButtonMouseDown: function(t) {
      this.disabled || (this.$refs.input.$el.focus(), this.repeat(t, null, 1), t.preventDefault());
    },
    onUpButtonMouseUp: function() {
      this.disabled || this.clearTimer();
    },
    onUpButtonMouseLeave: function() {
      this.disabled || this.clearTimer();
    },
    onUpButtonKeyUp: function() {
      this.disabled || this.clearTimer();
    },
    onUpButtonKeyDown: function(t) {
      (t.code === "Space" || t.code === "Enter" || t.code === "NumpadEnter") && this.repeat(t, null, 1);
    },
    onDownButtonMouseDown: function(t) {
      this.disabled || (this.$refs.input.$el.focus(), this.repeat(t, null, -1), t.preventDefault());
    },
    onDownButtonMouseUp: function() {
      this.disabled || this.clearTimer();
    },
    onDownButtonMouseLeave: function() {
      this.disabled || this.clearTimer();
    },
    onDownButtonKeyUp: function() {
      this.disabled || this.clearTimer();
    },
    onDownButtonKeyDown: function(t) {
      (t.code === "Space" || t.code === "Enter" || t.code === "NumpadEnter") && this.repeat(t, null, -1);
    },
    onUserInput: function() {
      this.isSpecialChar && (this.$refs.input.$el.value = this.lastValue), this.isSpecialChar = !1;
    },
    onInputKeyDown: function(t) {
      if (!this.readonly && !t.isComposing) {
        if (t.altKey || t.ctrlKey || t.metaKey) {
          this.isSpecialChar = !0, this.lastValue = this.$refs.input.$el.value;
          return;
        }
        this.lastValue = t.target.value;
        var n = t.target.selectionStart, i = t.target.selectionEnd, r = i - n, o = t.target.value, a = null, l = t.code || t.key;
        switch (l) {
          case "ArrowUp":
            this.spin(t, 1), t.preventDefault();
            break;
          case "ArrowDown":
            this.spin(t, -1), t.preventDefault();
            break;
          case "ArrowLeft":
            if (r > 1) {
              var d = this.isNumeralChar(o.charAt(n)) ? n + 1 : n + 2;
              this.$refs.input.$el.setSelectionRange(d, d);
            } else this.isNumeralChar(o.charAt(n - 1)) || t.preventDefault();
            break;
          case "ArrowRight":
            if (r > 1) {
              var p = i - 1;
              this.$refs.input.$el.setSelectionRange(p, p);
            } else this.isNumeralChar(o.charAt(n)) || t.preventDefault();
            break;
          case "Tab":
          case "Enter":
          case "NumpadEnter":
            a = this.validateValue(this.parseValue(o)), this.$refs.input.$el.value = this.formatValue(a), this.$refs.input.$el.setAttribute("aria-valuenow", a), this.updateModel(t, a);
            break;
          case "Backspace": {
            if (t.preventDefault(), n === i) {
              n >= o.length && this.suffixChar !== null && (n = o.length - this.suffixChar.length, this.$refs.input.$el.setSelectionRange(n, n));
              var b = o.charAt(n - 1), x = this.getDecimalCharIndexes(o), f = x.decimalCharIndex, g = x.decimalCharIndexWithoutPrefix;
              if (this.isNumeralChar(b)) {
                var k = this.getDecimalLength(o);
                if (this._group.test(b))
                  this._group.lastIndex = 0, a = o.slice(0, n - 2) + o.slice(n - 1);
                else if (this._decimal.test(b))
                  this._decimal.lastIndex = 0, k ? this.$refs.input.$el.setSelectionRange(n - 1, n - 1) : a = o.slice(0, n - 1) + o.slice(n);
                else if (f > 0 && n > f) {
                  var I = this.isDecimalMode() && (this.minFractionDigits || 0) < k ? "" : "0";
                  a = o.slice(0, n - 1) + I + o.slice(n);
                } else g === 1 ? (a = o.slice(0, n - 1) + "0" + o.slice(n), a = this.parseValue(a) > 0 ? a : "") : a = o.slice(0, n - 1) + o.slice(n);
              }
              this.updateValue(t, a, null, "delete-single");
            } else
              a = this.deleteRange(o, n, i), this.updateValue(t, a, null, "delete-range");
            break;
          }
          case "Delete":
            if (t.preventDefault(), n === i) {
              var S = o.charAt(n), z = this.getDecimalCharIndexes(o), F = z.decimalCharIndex, D = z.decimalCharIndexWithoutPrefix;
              if (this.isNumeralChar(S)) {
                var L = this.getDecimalLength(o);
                if (this._group.test(S))
                  this._group.lastIndex = 0, a = o.slice(0, n) + o.slice(n + 2);
                else if (this._decimal.test(S))
                  this._decimal.lastIndex = 0, L ? this.$refs.input.$el.setSelectionRange(n + 1, n + 1) : a = o.slice(0, n) + o.slice(n + 1);
                else if (F > 0 && n > F) {
                  var H = this.isDecimalMode() && (this.minFractionDigits || 0) < L ? "" : "0";
                  a = o.slice(0, n) + H + o.slice(n + 1);
                } else D === 1 ? (a = o.slice(0, n) + "0" + o.slice(n + 1), a = this.parseValue(a) > 0 ? a : "") : a = o.slice(0, n) + o.slice(n + 1);
              }
              this.updateValue(t, a, null, "delete-back-single");
            } else
              a = this.deleteRange(o, n, i), this.updateValue(t, a, null, "delete-range");
            break;
          case "Home":
            t.preventDefault(), ce(this.min) && this.updateModel(t, this.min);
            break;
          case "End":
            t.preventDefault(), ce(this.max) && this.updateModel(t, this.max);
            break;
        }
      }
    },
    onInputKeyPress: function(t) {
      if (!this.readonly) {
        var n = t.key, i = this.isDecimalSign(n), r = this.isMinusSign(n);
        t.code !== "Enter" && t.preventDefault(), (Number(n) >= 0 && Number(n) <= 9 || r || i) && this.insert(t, n, {
          isDecimalSign: i,
          isMinusSign: r
        });
      }
    },
    onPaste: function(t) {
      if (!(this.readonly || this.disabled)) {
        t.preventDefault();
        var n = (t.clipboardData || window.clipboardData).getData("Text");
        if (!(this.inputId === "integeronly" && /[^\d-]/.test(n)) && n) {
          var i = this.parseValue(n);
          i != null && this.insert(t, i.toString());
        }
      }
    },
    onClearClick: function(t) {
      this.updateModel(t, null), this.$refs.input.$el.focus();
    },
    allowMinusSign: function() {
      return this.min === null || this.min < 0;
    },
    isMinusSign: function(t) {
      return this._minusSign.test(t) || t === "-" ? (this._minusSign.lastIndex = 0, !0) : !1;
    },
    isDecimalSign: function(t) {
      var n;
      return (n = this.locale) !== null && n !== void 0 && n.includes("fr") && [".", ","].includes(t) || this._decimal.test(t) ? (this._decimal.lastIndex = 0, !0) : !1;
    },
    isDecimalMode: function() {
      return this.mode === "decimal";
    },
    getDecimalCharIndexes: function(t) {
      var n = t.search(this._decimal);
      this._decimal.lastIndex = 0;
      var i = t.replace(this._prefix, "").trim().replace(/\s/g, "").replace(this._currency, ""), r = i.search(this._decimal);
      return this._decimal.lastIndex = 0, {
        decimalCharIndex: n,
        decimalCharIndexWithoutPrefix: r
      };
    },
    getCharIndexes: function(t) {
      var n = t.search(this._decimal);
      this._decimal.lastIndex = 0;
      var i = t.search(this._minusSign);
      this._minusSign.lastIndex = 0;
      var r = t.search(this._suffix);
      this._suffix.lastIndex = 0;
      var o = t.search(this._currency);
      return this._currency.lastIndex = 0, {
        decimalCharIndex: n,
        minusCharIndex: i,
        suffixCharIndex: r,
        currencyCharIndex: o
      };
    },
    insert: function(t, n) {
      var i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {
        isDecimalSign: !1,
        isMinusSign: !1
      }, r = n.search(this._minusSign);
      if (this._minusSign.lastIndex = 0, !(!this.allowMinusSign() && r !== -1)) {
        var o = this.$refs.input.$el.selectionStart, a = this.$refs.input.$el.selectionEnd, l = this.$refs.input.$el.value.trim(), d = this.getCharIndexes(l), p = d.decimalCharIndex, b = d.minusCharIndex, x = d.suffixCharIndex, f = d.currencyCharIndex, g;
        if (i.isMinusSign) {
          var k = b === -1;
          (o === 0 || o === f + 1) && (g = l, (k || a !== 0) && (g = this.insertText(l, n, 0, a)), this.updateValue(t, g, n, "insert"));
        } else if (i.isDecimalSign)
          p > 0 && o === p ? this.updateValue(t, l, n, "insert") : p > o && p < a ? (g = this.insertText(l, n, o, a), this.updateValue(t, g, n, "insert")) : p === -1 && this.maxFractionDigits && (g = this.insertText(l, n, o, a), this.updateValue(t, g, n, "insert"));
        else {
          var I = this.numberFormat.resolvedOptions().maximumFractionDigits, S = o !== a ? "range-insert" : "insert";
          if (p > 0 && o > p) {
            if (o + n.length - (p + 1) <= I) {
              var z = f >= o ? f - 1 : x >= o ? x : l.length;
              g = l.slice(0, o) + n + l.slice(o + n.length, z) + l.slice(z), this.updateValue(t, g, n, S);
            }
          } else
            g = this.insertText(l, n, o, a), this.updateValue(t, g, n, S);
        }
      }
    },
    insertText: function(t, n, i, r) {
      var o = n === "." ? n : n.split(".");
      if (o.length === 2) {
        var a = t.slice(i, r).search(this._decimal);
        return this._decimal.lastIndex = 0, a > 0 ? t.slice(0, i) + this.formatValue(n) + t.slice(r) : this.formatValue(n) || t;
      } else return r - i === t.length ? this.formatValue(n) : i === 0 ? n + t.slice(r) : r === t.length ? t.slice(0, i) + n : t.slice(0, i) + n + t.slice(r);
    },
    deleteRange: function(t, n, i) {
      var r;
      return i - n === t.length ? r = "" : n === 0 ? r = t.slice(i) : i === t.length ? r = t.slice(0, n) : r = t.slice(0, n) + t.slice(i), r;
    },
    initCursor: function() {
      var t = this.$refs.input.$el.selectionStart, n = this.$refs.input.$el.value, i = n.length, r = null, o = (this.prefixChar || "").length;
      n = n.replace(this._prefix, ""), t = t - o;
      var a = n.charAt(t);
      if (this.isNumeralChar(a))
        return t + o;
      for (var l = t - 1; l >= 0; )
        if (a = n.charAt(l), this.isNumeralChar(a)) {
          r = l + o;
          break;
        } else
          l--;
      if (r !== null)
        this.$refs.input.$el.setSelectionRange(r + 1, r + 1);
      else {
        for (l = t; l < i; )
          if (a = n.charAt(l), this.isNumeralChar(a)) {
            r = l + o;
            break;
          } else
            l++;
        r !== null && this.$refs.input.$el.setSelectionRange(r, r);
      }
      return r || 0;
    },
    onInputClick: function() {
      var t = this.$refs.input.$el.value;
      !this.readonly && t !== St() && this.initCursor();
    },
    isNumeralChar: function(t) {
      return t.length === 1 && (this._numeral.test(t) || this._decimal.test(t) || this._group.test(t) || this._minusSign.test(t)) ? (this.resetRegex(), !0) : !1;
    },
    resetRegex: function() {
      this._numeral.lastIndex = 0, this._decimal.lastIndex = 0, this._group.lastIndex = 0, this._minusSign.lastIndex = 0;
    },
    updateValue: function(t, n, i, r) {
      var o = this.$refs.input.$el.value, a = null;
      n != null && (a = this.parseValue(n), a = !a && !this.allowEmpty ? 0 : a, this.updateInput(a, i, r, n), this.handleOnInput(t, o, a));
    },
    handleOnInput: function(t, n, i) {
      if (this.isValueChanged(n, i)) {
        var r, o;
        this.$emit("input", {
          originalEvent: t,
          value: i,
          formattedValue: n
        }), (r = (o = this.formField).onInput) === null || r === void 0 || r.call(o, {
          originalEvent: t,
          value: i
        });
      }
    },
    isValueChanged: function(t, n) {
      if (n === null && t !== null)
        return !0;
      if (n != null) {
        var i = typeof t == "string" ? this.parseValue(t) : t;
        return n !== i;
      }
      return !1;
    },
    validateValue: function(t) {
      return t === "-" || t == null ? null : this.min != null && t < this.min ? this.min : this.max != null && t > this.max ? this.max : t;
    },
    updateInput: function(t, n, i, r) {
      var o;
      n = n || "";
      var a = this.$refs.input.$el.value, l = this.formatValue(t), d = a.length;
      if (l !== r && (l = this.concatValues(l, r)), d === 0) {
        this.$refs.input.$el.value = l, this.$refs.input.$el.setSelectionRange(0, 0);
        var p = this.initCursor(), b = p + n.length;
        this.$refs.input.$el.setSelectionRange(b, b);
      } else {
        var x = this.$refs.input.$el.selectionStart, f = this.$refs.input.$el.selectionEnd;
        this.$refs.input.$el.value = l;
        var g = l.length;
        if (i === "range-insert") {
          var k = this.parseValue((a || "").slice(0, x)), I = k !== null ? k.toString() : "", S = I.split("").join("(".concat(this.groupChar, ")?")), z = new RegExp(S, "g");
          z.test(l);
          var F = n.split("").join("(".concat(this.groupChar, ")?")), D = new RegExp(F, "g");
          D.test(l.slice(z.lastIndex)), f = z.lastIndex + D.lastIndex, this.$refs.input.$el.setSelectionRange(f, f);
        } else if (g === d)
          i === "insert" || i === "delete-back-single" ? this.$refs.input.$el.setSelectionRange(f + 1, f + 1) : i === "delete-single" ? this.$refs.input.$el.setSelectionRange(f - 1, f - 1) : (i === "delete-range" || i === "spin") && this.$refs.input.$el.setSelectionRange(f, f);
        else if (i === "delete-back-single") {
          var L = a.charAt(f - 1), H = a.charAt(f), j = d - g, P = this._group.test(H);
          P && j === 1 ? f += 1 : !P && this.isNumeralChar(L) && (f += -1 * j + 1), this._group.lastIndex = 0, this.$refs.input.$el.setSelectionRange(f, f);
        } else if (a === "-" && i === "insert") {
          this.$refs.input.$el.setSelectionRange(0, 0);
          var V = this.initCursor(), W = V + n.length + 1;
          this.$refs.input.$el.setSelectionRange(W, W);
        } else
          f = f + (g - d), this.$refs.input.$el.setSelectionRange(f, f);
      }
      this.$refs.input.$el.setAttribute("aria-valuenow", t), (o = this.$refs.clearIcon) !== null && o !== void 0 && (o = o.$el) !== null && o !== void 0 && o.style && (this.$refs.clearIcon.$el.style.display = He(l) ? "none" : "block");
    },
    concatValues: function(t, n) {
      if (t && n) {
        var i = n.search(this._decimal);
        return this._decimal.lastIndex = 0, this.suffixChar ? i !== -1 ? t.replace(this.suffixChar, "").split(this._decimal)[0] + n.replace(this.suffixChar, "").slice(i) + this.suffixChar : t : i !== -1 ? t.split(this._decimal)[0] + n.slice(i) : t;
      }
      return t;
    },
    getDecimalLength: function(t) {
      if (t) {
        var n = t.split(this._decimal);
        if (n.length === 2)
          return n[1].replace(this._suffix, "").trim().replace(/\s/g, "").replace(this._currency, "").length;
      }
      return 0;
    },
    updateModel: function(t, n) {
      this.writeValue(n, t);
    },
    onInputFocus: function(t) {
      this.focused = !0, !this.disabled && !this.readonly && this.$refs.input.$el.value !== St() && this.highlightOnFocus && t.target.select(), this.$emit("focus", t);
    },
    onInputBlur: function(t) {
      var n, i;
      this.focused = !1;
      var r = t.target, o = this.validateValue(this.parseValue(r.value));
      this.$emit("blur", {
        originalEvent: t,
        value: r.value
      }), (n = (i = this.formField).onBlur) === null || n === void 0 || n.call(i, t), r.value = this.formatValue(o), r.setAttribute("aria-valuenow", o), this.updateModel(t, o), !this.disabled && !this.readonly && this.highlightOnFocus && bn();
    },
    clearTimer: function() {
      this.timer && clearTimeout(this.timer);
    },
    maxBoundry: function() {
      return this.d_value >= this.max;
    },
    minBoundry: function() {
      return this.d_value <= this.min;
    }
  },
  computed: {
    upButtonListeners: function() {
      var t = this;
      return {
        mousedown: function(i) {
          return t.onUpButtonMouseDown(i);
        },
        mouseup: function(i) {
          return t.onUpButtonMouseUp(i);
        },
        mouseleave: function(i) {
          return t.onUpButtonMouseLeave(i);
        },
        keydown: function(i) {
          return t.onUpButtonKeyDown(i);
        },
        keyup: function(i) {
          return t.onUpButtonKeyUp(i);
        }
      };
    },
    downButtonListeners: function() {
      var t = this;
      return {
        mousedown: function(i) {
          return t.onDownButtonMouseDown(i);
        },
        mouseup: function(i) {
          return t.onDownButtonMouseUp(i);
        },
        mouseleave: function(i) {
          return t.onDownButtonMouseLeave(i);
        },
        keydown: function(i) {
          return t.onDownButtonKeyDown(i);
        },
        keyup: function(i) {
          return t.onDownButtonKeyUp(i);
        }
      };
    },
    formattedValue: function() {
      var t = !this.d_value && !this.allowEmpty ? 0 : this.d_value;
      return this.formatValue(t);
    },
    getFormatter: function() {
      return this.numberFormat;
    },
    dataP: function() {
      return Z(lt(lt({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size), this.buttonLayout, this.showButtons && this.buttonLayout));
    }
  },
  components: {
    InputText: Ye,
    AngleUpIcon: Xt,
    AngleDownIcon: Qt,
    TimesIcon: qe
  }
}, xr = ["data-p"], Ir = ["data-p"], $r = ["disabled", "data-p"], Sr = ["disabled", "data-p"], Cr = ["disabled", "data-p"], Or = ["disabled", "data-p"];
function zr(e, t, n, i, r, o) {
  var a = R("InputText"), l = R("TimesIcon");
  return s(), u("span", c({
    class: e.cx("root")
  }, e.ptmi("root"), {
    "data-p": o.dataP
  }), [E(a, {
    ref: "input",
    id: e.inputId,
    name: e.$formName,
    role: "spinbutton",
    class: K([e.cx("pcInputText"), e.inputClass]),
    style: Bn(e.inputStyle),
    defaultValue: o.formattedValue,
    "aria-valuemin": e.min,
    "aria-valuemax": e.max,
    "aria-valuenow": e.d_value,
    inputmode: e.mode === "decimal" && !e.minFractionDigits ? "numeric" : "decimal",
    disabled: e.disabled,
    readonly: e.readonly,
    placeholder: e.placeholder,
    "aria-labelledby": e.ariaLabelledby,
    "aria-label": e.ariaLabel,
    required: e.required,
    size: e.size,
    invalid: e.invalid,
    variant: e.variant,
    onInput: o.onUserInput,
    onKeydown: o.onInputKeyDown,
    onKeypress: o.onInputKeyPress,
    onPaste: o.onPaste,
    onClick: o.onInputClick,
    onFocus: o.onInputFocus,
    onBlur: o.onInputBlur,
    pt: e.ptm("pcInputText"),
    unstyled: e.unstyled,
    "data-p": o.dataP
  }, null, 8, ["id", "name", "class", "style", "defaultValue", "aria-valuemin", "aria-valuemax", "aria-valuenow", "inputmode", "disabled", "readonly", "placeholder", "aria-labelledby", "aria-label", "required", "size", "invalid", "variant", "onInput", "onKeydown", "onKeypress", "onPaste", "onClick", "onFocus", "onBlur", "pt", "unstyled", "data-p"]), e.showClear && e.buttonLayout !== "vertical" ? O(e.$slots, "clearicon", {
    key: 0,
    class: K(e.cx("clearIcon")),
    clearCallback: o.onClearClick
  }, function() {
    return [E(l, c({
      ref: "clearIcon",
      class: [e.cx("clearIcon")],
      onClick: o.onClearClick
    }, e.ptm("clearIcon")), null, 16, ["class", "onClick"])];
  }) : $("", !0), e.showButtons && e.buttonLayout === "stacked" ? (s(), u("span", c({
    key: 1,
    class: e.cx("buttonGroup")
  }, e.ptm("buttonGroup"), {
    "data-p": o.dataP
  }), [O(e.$slots, "incrementbutton", {
    listeners: o.upButtonListeners
  }, function() {
    return [m("button", c({
      class: [e.cx("incrementButton"), e.incrementButtonClass]
    }, Ue(o.upButtonListeners, !0), {
      disabled: e.disabled,
      tabindex: -1,
      "aria-hidden": "true",
      type: "button"
    }, e.ptm("incrementButton"), {
      "data-p": o.dataP
    }), [O(e.$slots, e.$slots.incrementicon ? "incrementicon" : "incrementbuttonicon", {}, function() {
      return [(s(), T(ie(e.incrementIcon || e.incrementButtonIcon ? "span" : "AngleUpIcon"), c({
        class: [e.incrementIcon, e.incrementButtonIcon]
      }, e.ptm("incrementIcon"), {
        "data-pc-section": "incrementicon"
      }), null, 16, ["class"]))];
    })], 16, $r)];
  }), O(e.$slots, "decrementbutton", {
    listeners: o.downButtonListeners
  }, function() {
    return [m("button", c({
      class: [e.cx("decrementButton"), e.decrementButtonClass]
    }, Ue(o.downButtonListeners, !0), {
      disabled: e.disabled,
      tabindex: -1,
      "aria-hidden": "true",
      type: "button"
    }, e.ptm("decrementButton"), {
      "data-p": o.dataP
    }), [O(e.$slots, e.$slots.decrementicon ? "decrementicon" : "decrementbuttonicon", {}, function() {
      return [(s(), T(ie(e.decrementIcon || e.decrementButtonIcon ? "span" : "AngleDownIcon"), c({
        class: [e.decrementIcon, e.decrementButtonIcon]
      }, e.ptm("decrementIcon"), {
        "data-pc-section": "decrementicon"
      }), null, 16, ["class"]))];
    })], 16, Sr)];
  })], 16, Ir)) : $("", !0), O(e.$slots, "incrementbutton", {
    listeners: o.upButtonListeners
  }, function() {
    return [e.showButtons && e.buttonLayout !== "stacked" ? (s(), u("button", c({
      key: 0,
      class: [e.cx("incrementButton"), e.incrementButtonClass]
    }, Ue(o.upButtonListeners, !0), {
      disabled: e.disabled,
      tabindex: -1,
      "aria-hidden": "true",
      type: "button"
    }, e.ptm("incrementButton"), {
      "data-p": o.dataP
    }), [O(e.$slots, e.$slots.incrementicon ? "incrementicon" : "incrementbuttonicon", {}, function() {
      return [(s(), T(ie(e.incrementIcon || e.incrementButtonIcon ? "span" : "AngleUpIcon"), c({
        class: [e.incrementIcon, e.incrementButtonIcon]
      }, e.ptm("incrementIcon"), {
        "data-pc-section": "incrementicon"
      }), null, 16, ["class"]))];
    })], 16, Cr)) : $("", !0)];
  }), O(e.$slots, "decrementbutton", {
    listeners: o.downButtonListeners
  }, function() {
    return [e.showButtons && e.buttonLayout !== "stacked" ? (s(), u("button", c({
      key: 0,
      class: [e.cx("decrementButton"), e.decrementButtonClass]
    }, Ue(o.downButtonListeners, !0), {
      disabled: e.disabled,
      tabindex: -1,
      "aria-hidden": "true",
      type: "button"
    }, e.ptm("decrementButton"), {
      "data-p": o.dataP
    }), [O(e.$slots, e.$slots.decrementicon ? "decrementicon" : "decrementbuttonicon", {}, function() {
      return [(s(), T(ie(e.decrementIcon || e.decrementButtonIcon ? "span" : "AngleDownIcon"), c({
        class: [e.decrementIcon, e.decrementButtonIcon]
      }, e.ptm("decrementIcon"), {
        "data-pc-section": "decrementicon"
      }), null, 16, ["class"]))];
    })], 16, Or)) : $("", !0)];
  })], 16, xr);
}
en.render = zr;
var Lr = `
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
`, Ar = {
  root: function(t) {
    var n = t.instance, i = t.props;
    return ["p-textarea p-component", {
      "p-filled": n.$filled,
      "p-textarea-resizable ": i.autoResize,
      "p-textarea-sm p-inputfield-sm": i.size === "small",
      "p-textarea-lg p-inputfield-lg": i.size === "large",
      "p-invalid": n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-textarea-fluid": n.$fluid
    }];
  }
}, Br = J.extend({
  name: "textarea",
  style: Lr,
  classes: Ar
}), Pr = {
  name: "BaseTextarea",
  extends: _e,
  props: {
    autoResize: Boolean
  },
  style: Br,
  provide: function() {
    return {
      $pcTextarea: this,
      $parentInstance: this
    };
  }
};
function Fe(e) {
  "@babel/helpers - typeof";
  return Fe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Fe(e);
}
function Tr(e, t, n) {
  return (t = Fr(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Fr(e) {
  var t = Vr(e, "string");
  return Fe(t) == "symbol" ? t : t + "";
}
function Vr(e, t) {
  if (Fe(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(e, t);
    if (Fe(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var tn = {
  name: "Textarea",
  extends: Pr,
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
        var t = this.$el.style.height, n = parseInt(t) || 0, i = this.$el.scrollHeight, r = !n || i > n, o = n && i < n;
        o ? (this.$el.style.height = "auto", this.$el.style.height = "".concat(this.$el.scrollHeight, "px")) : r && (this.$el.style.height = "".concat(i, "px"));
      }
    },
    onInput: function(t) {
      this.autoResize && this.resize(), this.writeValue(t.target.value, t);
    }
  },
  computed: {
    attrs: function() {
      return c(this.ptmi("root", {
        context: {
          filled: this.$filled,
          disabled: this.disabled
        }
      }), this.formField);
    },
    dataP: function() {
      return Z(Tr({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, Mr = ["value", "name", "disabled", "aria-invalid", "data-p"];
function Dr(e, t, n, i, r, o) {
  return s(), u("textarea", c({
    class: e.cx("root"),
    value: e.d_value,
    name: e.name,
    disabled: e.disabled,
    "aria-invalid": e.invalid || void 0,
    "data-p": o.dataP,
    onInput: t[0] || (t[0] = function() {
      return o.onInput && o.onInput.apply(o, arguments);
    })
  }, o.attrs), null, 16, Mr);
}
tn.render = Dr;
var nn = {
  name: "BlankIcon",
  extends: se
};
function Er(e) {
  return Kr(e) || Nr(e) || jr(e) || _r();
}
function _r() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function jr(e, t) {
  if (e) {
    if (typeof e == "string") return dt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? dt(e, t) : void 0;
  }
}
function Nr(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Kr(e) {
  if (Array.isArray(e)) return dt(e);
}
function dt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, i = Array(t); n < t; n++) i[n] = e[n];
  return i;
}
function Rr(e, t, n, i, r, o) {
  return s(), u("svg", c({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Er(t[0] || (t[0] = [m("rect", {
    width: "1",
    height: "1",
    fill: "currentColor",
    "fill-opacity": "0"
  }, null, -1)])), 16);
}
nn.render = Rr;
var on = {
  name: "ChevronDownIcon",
  extends: se
};
function Ur(e) {
  return qr(e) || Gr(e) || Wr(e) || Hr();
}
function Hr() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Wr(e, t) {
  if (e) {
    if (typeof e == "string") return ct(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? ct(e, t) : void 0;
  }
}
function Gr(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function qr(e) {
  if (Array.isArray(e)) return ct(e);
}
function ct(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, i = Array(t); n < t; n++) i[n] = e[n];
  return i;
}
function Zr(e, t, n, i, r, o) {
  return s(), u("svg", c({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Ur(t[0] || (t[0] = [m("path", {
    d: "M7.01744 10.398C6.91269 10.3985 6.8089 10.378 6.71215 10.3379C6.61541 10.2977 6.52766 10.2386 6.45405 10.1641L1.13907 4.84913C1.03306 4.69404 0.985221 4.5065 1.00399 4.31958C1.02276 4.13266 1.10693 3.95838 1.24166 3.82747C1.37639 3.69655 1.55301 3.61742 1.74039 3.60402C1.92777 3.59062 2.11386 3.64382 2.26584 3.75424L7.01744 8.47394L11.769 3.75424C11.9189 3.65709 12.097 3.61306 12.2748 3.62921C12.4527 3.64535 12.6199 3.72073 12.7498 3.84328C12.8797 3.96582 12.9647 4.12842 12.9912 4.30502C13.0177 4.48162 12.9841 4.662 12.8958 4.81724L7.58083 10.1322C7.50996 10.2125 7.42344 10.2775 7.32656 10.3232C7.22968 10.3689 7.12449 10.3944 7.01744 10.398Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
on.render = Zr;
var rn = {
  name: "SearchIcon",
  extends: se
};
function Yr(e) {
  return ea(e) || Xr(e) || Qr(e) || Jr();
}
function Jr() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Qr(e, t) {
  if (e) {
    if (typeof e == "string") return pt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? pt(e, t) : void 0;
  }
}
function Xr(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function ea(e) {
  if (Array.isArray(e)) return pt(e);
}
function pt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, i = Array(t); n < t; n++) i[n] = e[n];
  return i;
}
function ta(e, t, n, i, r, o) {
  return s(), u("svg", c({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Yr(t[0] || (t[0] = [m("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M2.67602 11.0265C3.6661 11.688 4.83011 12.0411 6.02086 12.0411C6.81149 12.0411 7.59438 11.8854 8.32483 11.5828C8.87005 11.357 9.37808 11.0526 9.83317 10.6803L12.9769 13.8241C13.0323 13.8801 13.0983 13.9245 13.171 13.9548C13.2438 13.985 13.3219 14.0003 13.4007 14C13.4795 14.0003 13.5575 13.985 13.6303 13.9548C13.7031 13.9245 13.7691 13.8801 13.8244 13.8241C13.9367 13.7116 13.9998 13.5592 13.9998 13.4003C13.9998 13.2414 13.9367 13.089 13.8244 12.9765L10.6807 9.8328C11.053 9.37773 11.3573 8.86972 11.5831 8.32452C11.8857 7.59408 12.0414 6.81119 12.0414 6.02056C12.0414 4.8298 11.6883 3.66579 11.0268 2.67572C10.3652 1.68564 9.42494 0.913972 8.32483 0.45829C7.22472 0.00260857 6.01418 -0.116618 4.84631 0.115686C3.67844 0.34799 2.60568 0.921393 1.76369 1.76338C0.921698 2.60537 0.348296 3.67813 0.115991 4.84601C-0.116313 6.01388 0.00291375 7.22441 0.458595 8.32452C0.914277 9.42464 1.68595 10.3649 2.67602 11.0265ZM3.35565 2.0158C4.14456 1.48867 5.07206 1.20731 6.02086 1.20731C7.29317 1.20731 8.51338 1.71274 9.41304 2.6124C10.3127 3.51206 10.8181 4.73226 10.8181 6.00457C10.8181 6.95337 10.5368 7.88088 10.0096 8.66978C9.48251 9.45868 8.73328 10.0736 7.85669 10.4367C6.98011 10.7997 6.01554 10.8947 5.08496 10.7096C4.15439 10.5245 3.2996 10.0676 2.62869 9.39674C1.95778 8.72583 1.50089 7.87104 1.31579 6.94046C1.13068 6.00989 1.22568 5.04532 1.58878 4.16874C1.95187 3.29215 2.56675 2.54292 3.35565 2.0158Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
rn.render = ta;
var na = `
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
`, ia = {
  root: "p-iconfield"
}, oa = J.extend({
  name: "iconfield",
  style: na,
  classes: ia
}), ra = {
  name: "BaseIconField",
  extends: ae,
  style: oa,
  provide: function() {
    return {
      $pcIconField: this,
      $parentInstance: this
    };
  }
}, an = {
  name: "IconField",
  extends: ra,
  inheritAttrs: !1
};
function aa(e, t, n, i, r, o) {
  return s(), u("div", c({
    class: e.cx("root")
  }, e.ptmi("root")), [O(e.$slots, "default")], 16);
}
an.render = aa;
var sa = {
  root: "p-inputicon"
}, la = J.extend({
  name: "inputicon",
  classes: sa
}), ua = {
  name: "BaseInputIcon",
  extends: ae,
  style: la,
  props: {
    class: null
  },
  provide: function() {
    return {
      $pcInputIcon: this,
      $parentInstance: this
    };
  }
}, sn = {
  name: "InputIcon",
  extends: ua,
  inheritAttrs: !1,
  computed: {
    containerClass: function() {
      return [this.cx("root"), this.class];
    }
  }
};
function da(e, t, n, i, r, o) {
  return s(), u("span", c({
    class: o.containerClass
  }, e.ptmi("root"), {
    "aria-hidden": "true"
  }), [O(e.$slots, "default")], 16);
}
sn.render = da;
var ca = `
    .p-virtualscroller-loader {
        background: dt('virtualscroller.loader.mask.background');
        color: dt('virtualscroller.loader.mask.color');
    }

    .p-virtualscroller-loading-icon {
        font-size: dt('virtualscroller.loader.icon.size');
        width: dt('virtualscroller.loader.icon.size');
        height: dt('virtualscroller.loader.icon.size');
    }
`, pa = `
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
`, Tt = J.extend({
  name: "virtualscroller",
  css: pa,
  style: ca
}), fa = {
  name: "BaseVirtualScroller",
  extends: ae,
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
  style: Tt,
  provide: function() {
    return {
      $pcVirtualScroller: this,
      $parentInstance: this
    };
  },
  beforeMount: function() {
    var t;
    Tt.loadCSS({
      nonce: (t = this.$primevueConfig) === null || t === void 0 || (t = t.csp) === null || t === void 0 ? void 0 : t.nonce
    });
  }
};
function Ve(e) {
  "@babel/helpers - typeof";
  return Ve = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ve(e);
}
function Ft(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(e);
    t && (i = i.filter(function(r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), n.push.apply(n, i);
  }
  return n;
}
function ke(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Ft(Object(n), !0).forEach(function(i) {
      ln(e, i, n[i]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Ft(Object(n)).forEach(function(i) {
      Object.defineProperty(e, i, Object.getOwnPropertyDescriptor(n, i));
    });
  }
  return e;
}
function ln(e, t, n) {
  return (t = ha(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ha(e) {
  var t = ba(e, "string");
  return Ve(t) == "symbol" ? t : t + "";
}
function ba(e, t) {
  if (Ve(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(e, t);
    if (Ve(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var un = {
  name: "VirtualScroller",
  extends: fa,
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
      We(this.element) && (this.setContentEl(this.content), this.init(), this.calculateAutoSize(), this.defaultWidth = pe(this.element), this.defaultHeight = me(this.element), this.defaultContentWidth = pe(this.content), this.defaultContentHeight = me(this.content), this.initialized = !0), this.element && this.bindResizeListener();
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
      var n = this, i = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "auto", r = this.isBoth(), o = this.isHorizontal(), a = r ? t.every(function(P) {
        return P > -1;
      }) : t > -1;
      if (a) {
        var l = this.first, d = this.element, p = d.scrollTop, b = p === void 0 ? 0 : p, x = d.scrollLeft, f = x === void 0 ? 0 : x, g = this.calculateNumItems(), k = g.numToleratedItems, I = this.getContentPosition(), S = this.itemSize, z = function() {
          var V = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, W = arguments.length > 1 ? arguments[1] : void 0;
          return V <= W ? 0 : V;
        }, F = function(V, W, Q) {
          return V * W + Q;
        }, D = function() {
          var V = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, W = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return n.scrollTo({
            left: V,
            top: W,
            behavior: i
          });
        }, L = r ? {
          rows: 0,
          cols: 0
        } : 0, H = !1, j = !1;
        r ? (L = {
          rows: z(t[0], k[0]),
          cols: z(t[1], k[1])
        }, D(F(L.cols, S[1], I.left), F(L.rows, S[0], I.top)), j = this.lastScrollPos.top !== b || this.lastScrollPos.left !== f, H = L.rows !== l.rows || L.cols !== l.cols) : (L = z(t, k), o ? D(F(L, S, I.left), b) : D(f, F(L, S, I.top)), j = this.lastScrollPos !== (o ? f : b), H = L !== l), this.isRangeChanged = H, j && (this.first = L);
      }
    },
    scrollInView: function(t, n) {
      var i = this, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "auto";
      if (n) {
        var o = this.isBoth(), a = this.isHorizontal(), l = o ? t.every(function(S) {
          return S > -1;
        }) : t > -1;
        if (l) {
          var d = this.getRenderedRange(), p = d.first, b = d.viewport, x = function() {
            var z = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, F = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
            return i.scrollTo({
              left: z,
              top: F,
              behavior: r
            });
          }, f = n === "to-start", g = n === "to-end";
          if (f) {
            if (o)
              b.first.rows - p.rows > t[0] ? x(b.first.cols * this.itemSize[1], (b.first.rows - 1) * this.itemSize[0]) : b.first.cols - p.cols > t[1] && x((b.first.cols - 1) * this.itemSize[1], b.first.rows * this.itemSize[0]);
            else if (b.first - p > t) {
              var k = (b.first - 1) * this.itemSize;
              a ? x(k, 0) : x(0, k);
            }
          } else if (g) {
            if (o)
              b.last.rows - p.rows <= t[0] + 1 ? x(b.first.cols * this.itemSize[1], (b.first.rows + 1) * this.itemSize[0]) : b.last.cols - p.cols <= t[1] + 1 && x((b.first.cols + 1) * this.itemSize[1], b.first.rows * this.itemSize[0]);
            else if (b.last - p <= t + 1) {
              var I = (b.first + 1) * this.itemSize;
              a ? x(I, 0) : x(0, I);
            }
          }
        }
      } else
        this.scrollToIndex(t, r);
    },
    getRenderedRange: function() {
      var t = function(x, f) {
        return Math.floor(x / (f || x));
      }, n = this.first, i = 0;
      if (this.element) {
        var r = this.isBoth(), o = this.isHorizontal(), a = this.element, l = a.scrollTop, d = a.scrollLeft;
        if (r)
          n = {
            rows: t(l, this.itemSize[0]),
            cols: t(d, this.itemSize[1])
          }, i = {
            rows: n.rows + this.numItemsInViewport.rows,
            cols: n.cols + this.numItemsInViewport.cols
          };
        else {
          var p = o ? d : l;
          n = t(p, this.itemSize), i = n + this.numItemsInViewport;
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
      var t = this.isBoth(), n = this.isHorizontal(), i = this.itemSize, r = this.getContentPosition(), o = this.element ? this.element.offsetWidth - r.left : 0, a = this.element ? this.element.offsetHeight - r.top : 0, l = function(f, g) {
        return Math.ceil(f / (g || f));
      }, d = function(f) {
        return Math.ceil(f / 2);
      }, p = t ? {
        rows: l(a, i[0]),
        cols: l(o, i[1])
      } : l(n ? o : a, i), b = this.d_numToleratedItems || (t ? [d(p.rows), d(p.cols)] : d(p));
      return {
        numItemsInViewport: p,
        numToleratedItems: b
      };
    },
    calculateOptions: function() {
      var t = this, n = this.isBoth(), i = this.first, r = this.calculateNumItems(), o = r.numItemsInViewport, a = r.numToleratedItems, l = function(b, x, f) {
        var g = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !1;
        return t.getLast(b + x + (b < f ? 2 : 3) * f, g);
      }, d = n ? {
        rows: l(i.rows, o.rows, a[0]),
        cols: l(i.cols, o.cols, a[1], !0)
      } : l(i, o, a);
      this.last = d, this.numItemsInViewport = o, this.d_numToleratedItems = a, this.$emit("update:numToleratedItems", this.d_numToleratedItems), this.showLoader && (this.loaderArr = n ? Array.from({
        length: o.rows
      }).map(function() {
        return Array.from({
          length: o.cols
        });
      }) : Array.from({
        length: o
      })), this.lazy && Promise.resolve().then(function() {
        var p;
        t.lazyLoadState = {
          first: t.step ? n ? {
            rows: 0,
            cols: i.cols
          } : 0 : i,
          last: Math.min(t.step ? t.step : d, ((p = t.items) === null || p === void 0 ? void 0 : p.length) || 0)
        }, t.$emit("lazy-load", t.lazyLoadState);
      });
    },
    calculateAutoSize: function() {
      var t = this;
      this.autoSize && !this.d_loading && Promise.resolve().then(function() {
        if (t.content) {
          var n = t.isBoth(), i = t.isHorizontal(), r = t.isVertical();
          t.content.style.minHeight = t.content.style.minWidth = "auto", t.content.style.position = "relative", t.element.style.contain = "none";
          var o = [pe(t.element), me(t.element)], a = o[0], l = o[1];
          (n || i) && (t.element.style.width = a < t.defaultWidth ? a + "px" : t.scrollWidth || t.defaultWidth + "px"), (n || r) && (t.element.style.height = l < t.defaultHeight ? l + "px" : t.scrollHeight || t.defaultHeight + "px"), t.content.style.minHeight = t.content.style.minWidth = "", t.content.style.position = "", t.element.style.contain = "";
        }
      });
    },
    getLast: function() {
      var t, n, i = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, r = arguments.length > 1 ? arguments[1] : void 0;
      return this.items ? Math.min(r ? ((t = this.columns || this.items[0]) === null || t === void 0 ? void 0 : t.length) || 0 : ((n = this.items) === null || n === void 0 ? void 0 : n.length) || 0, i) : 0;
    },
    getContentPosition: function() {
      if (this.content) {
        var t = getComputedStyle(this.content), n = parseFloat(t.paddingLeft) + Math.max(parseFloat(t.left) || 0, 0), i = parseFloat(t.paddingRight) + Math.max(parseFloat(t.right) || 0, 0), r = parseFloat(t.paddingTop) + Math.max(parseFloat(t.top) || 0, 0), o = parseFloat(t.paddingBottom) + Math.max(parseFloat(t.bottom) || 0, 0);
        return {
          left: n,
          right: i,
          top: r,
          bottom: o,
          x: n + i,
          y: r + o
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
        var n = this.isBoth(), i = this.isHorizontal(), r = this.element.parentElement, o = this.scrollWidth || "".concat(this.element.offsetWidth || r.offsetWidth, "px"), a = this.scrollHeight || "".concat(this.element.offsetHeight || r.offsetHeight, "px"), l = function(p, b) {
          return t.element.style[p] = b;
        };
        n || i ? (l("height", a), l("width", o)) : l("height", a);
      }
    },
    setSpacerSize: function() {
      var t = this, n = this.items;
      if (n) {
        var i = this.isBoth(), r = this.isHorizontal(), o = this.getContentPosition(), a = function(d, p, b) {
          var x = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 0;
          return t.spacerStyle = ke(ke({}, t.spacerStyle), ln({}, "".concat(d), (p || []).length * b + x + "px"));
        };
        i ? (a("height", n, this.itemSize[0], o.y), a("width", this.columns || n[1], this.itemSize[1], o.x)) : r ? a("width", this.columns || n, this.itemSize, o.x) : a("height", n, this.itemSize, o.y);
      }
    },
    setContentPosition: function(t) {
      var n = this;
      if (this.content && !this.appendOnly) {
        var i = this.isBoth(), r = this.isHorizontal(), o = t ? t.first : this.first, a = function(b, x) {
          return b * x;
        }, l = function() {
          var b = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, x = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return n.contentStyle = ke(ke({}, n.contentStyle), {
            transform: "translate3d(".concat(b, "px, ").concat(x, "px, 0)")
          });
        };
        if (i)
          l(a(o.cols, this.itemSize[1]), a(o.rows, this.itemSize[0]));
        else {
          var d = a(o, this.itemSize);
          r ? l(d, 0) : l(0, d);
        }
      }
    },
    onScrollPositionChange: function(t) {
      var n = this, i = t.target, r = this.isBoth(), o = this.isHorizontal(), a = this.getContentPosition(), l = function(_, G) {
        return _ ? _ > G ? _ - G : _ : 0;
      }, d = function(_, G) {
        return Math.floor(_ / (G || _));
      }, p = function(_, G, oe, X, v, B) {
        return _ <= v ? v : B ? oe - X - v : G + v - 1;
      }, b = function(_, G, oe, X, v, B, y, h) {
        if (_ <= B) return 0;
        var C = Math.max(0, y ? _ < G ? oe : _ - B : _ > G ? oe : _ - 2 * B), w = n.getLast(C, h);
        return C > w ? w - v : C;
      }, x = function(_, G, oe, X, v, B) {
        var y = G + X + 2 * v;
        return _ >= v && (y += v + 1), n.getLast(y, B);
      }, f = l(i.scrollTop, a.top), g = l(i.scrollLeft, a.left), k = r ? {
        rows: 0,
        cols: 0
      } : 0, I = this.last, S = !1, z = this.lastScrollPos;
      if (r) {
        var F = this.lastScrollPos.top <= f, D = this.lastScrollPos.left <= g;
        if (!this.appendOnly || this.appendOnly && (F || D)) {
          var L = {
            rows: d(f, this.itemSize[0]),
            cols: d(g, this.itemSize[1])
          }, H = {
            rows: p(L.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], F),
            cols: p(L.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], D)
          };
          k = {
            rows: b(L.rows, H.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], F),
            cols: b(L.cols, H.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], D, !0)
          }, I = {
            rows: x(L.rows, k.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0]),
            cols: x(L.cols, k.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], !0)
          }, S = k.rows !== this.first.rows || I.rows !== this.last.rows || k.cols !== this.first.cols || I.cols !== this.last.cols || this.isRangeChanged, z = {
            top: f,
            left: g
          };
        }
      } else {
        var j = o ? g : f, P = this.lastScrollPos <= j;
        if (!this.appendOnly || this.appendOnly && P) {
          var V = d(j, this.itemSize), W = p(V, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, P);
          k = b(V, W, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, P), I = x(V, k, this.last, this.numItemsInViewport, this.d_numToleratedItems), S = k !== this.first || I !== this.last || this.isRangeChanged, z = j;
        }
      }
      return {
        first: k,
        last: I,
        isRangeChanged: S,
        scrollPos: z
      };
    },
    onScrollChange: function(t) {
      var n = this.onScrollPositionChange(t), i = n.first, r = n.last, o = n.isRangeChanged, a = n.scrollPos;
      if (o) {
        var l = {
          first: i,
          last: r
        };
        if (this.setContentPosition(l), this.first = i, this.last = r, this.lastScrollPos = a, this.$emit("scroll-index-change", l), this.lazy && this.isPageChanged(i)) {
          var d, p, b = {
            first: this.step ? Math.min(this.getPageByFirst(i) * this.step, (((d = this.items) === null || d === void 0 ? void 0 : d.length) || 0) - this.step) : i,
            last: Math.min(this.step ? (this.getPageByFirst(i) + 1) * this.step : r, ((p = this.items) === null || p === void 0 ? void 0 : p.length) || 0)
          }, x = this.lazyLoadState.first !== b.first || this.lazyLoadState.last !== b.last;
          x && this.$emit("lazy-load", b), this.lazyLoadState = b;
        }
      }
    },
    onScroll: function(t) {
      var n = this;
      if (this.$emit("scroll", t), this.delay) {
        if (this.scrollTimeout && clearTimeout(this.scrollTimeout), this.isPageChanged()) {
          if (!this.d_loading && this.showLoader) {
            var i = this.onScrollPositionChange(t), r = i.isRangeChanged, o = r || (this.step ? this.isPageChanged() : !1);
            o && (this.d_loading = !0);
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
        if (We(t.element)) {
          var n = t.isBoth(), i = t.isVertical(), r = t.isHorizontal(), o = [pe(t.element), me(t.element)], a = o[0], l = o[1], d = a !== t.defaultWidth, p = l !== t.defaultHeight, b = n ? d || p : r ? d : i ? p : !1;
          b && (t.d_numToleratedItems = t.numToleratedItems, t.defaultWidth = a, t.defaultHeight = l, t.defaultContentWidth = pe(t.content), t.defaultContentHeight = me(t.content), t.init());
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
      var n = (this.items || []).length, i = this.isBoth() ? this.first.rows + t : this.first + t;
      return {
        index: i,
        count: n,
        first: i === 0,
        last: i === n - 1,
        even: i % 2 === 0,
        odd: i % 2 !== 0
      };
    },
    getLoaderOptions: function(t, n) {
      var i = this.loaderArr.length;
      return ke({
        index: t,
        count: i,
        first: t === 0,
        last: t === i - 1,
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
      this.content = t || this.content || ge(this.element, '[data-pc-section="content"]');
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
    SpinnerIcon: Ze
  }
}, ma = ["tabindex"];
function ga(e, t, n, i, r, o) {
  var a = R("SpinnerIcon");
  return e.disabled ? (s(), u(U, {
    key: 1
  }, [O(e.$slots, "default"), O(e.$slots, "content", {
    items: e.items,
    rows: e.items,
    columns: o.loadedColumns
  })], 64)) : (s(), u("div", c({
    key: 0,
    ref: o.elementRef,
    class: o.containerClass,
    tabindex: e.tabindex,
    style: e.style,
    onScroll: t[0] || (t[0] = function() {
      return o.onScroll && o.onScroll.apply(o, arguments);
    })
  }, e.ptmi("root")), [O(e.$slots, "content", {
    styleClass: o.contentClass,
    items: o.loadedItems,
    getItemOptions: o.getOptions,
    loading: r.d_loading,
    getLoaderOptions: o.getLoaderOptions,
    itemSize: e.itemSize,
    rows: o.loadedRows,
    columns: o.loadedColumns,
    contentRef: o.contentRef,
    spacerStyle: r.spacerStyle,
    contentStyle: r.contentStyle,
    vertical: o.isVertical(),
    horizontal: o.isHorizontal(),
    both: o.isBoth()
  }, function() {
    return [m("div", c({
      ref: o.contentRef,
      class: o.contentClass,
      style: r.contentStyle
    }, e.ptm("content")), [(s(!0), u(U, null, re(o.loadedItems, function(l, d) {
      return O(e.$slots, "item", {
        key: d,
        item: l,
        options: o.getOptions(d)
      });
    }), 128))], 16)];
  }), e.showSpacer ? (s(), u("div", c({
    key: 0,
    class: "p-virtualscroller-spacer",
    style: r.spacerStyle
  }, e.ptm("spacer")), null, 16)) : $("", !0), !e.loaderDisabled && e.showLoader && r.d_loading ? (s(), u("div", c({
    key: 1,
    class: o.loaderClass
  }, e.ptm("loader")), [e.$slots && e.$slots.loader ? (s(!0), u(U, {
    key: 0
  }, re(r.loaderArr, function(l, d) {
    return O(e.$slots, "loader", {
      key: d,
      options: o.getLoaderOptions(d, o.isBoth() && {
        numCols: e.d_numItemsInViewport.cols
      })
    });
  }), 128)) : $("", !0), O(e.$slots, "loadingicon", {}, function() {
    return [E(a, c({
      spin: "",
      class: "p-virtualscroller-loading-icon"
    }, e.ptm("loadingIcon")), null, 16)];
  })], 16)) : $("", !0)], 16, ma));
}
un.render = ga;
var va = `
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
`, ya = {
  root: function(t) {
    var n = t.instance, i = t.props, r = t.state;
    return ["p-select p-component p-inputwrapper", {
      "p-disabled": i.disabled,
      "p-invalid": n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-focus": r.focused,
      "p-inputwrapper-filled": n.$filled,
      "p-inputwrapper-focus": r.focused || r.overlayVisible,
      "p-select-open": r.overlayVisible,
      "p-select-fluid": n.$fluid,
      "p-select-sm p-inputfield-sm": i.size === "small",
      "p-select-lg p-inputfield-lg": i.size === "large"
    }];
  },
  label: function(t) {
    var n, i = t.instance, r = t.props;
    return ["p-select-label", {
      "p-placeholder": !r.editable && i.label === r.placeholder,
      "p-select-label-empty": !r.editable && !i.$slots.value && (i.label === "p-emptylabel" || ((n = i.label) === null || n === void 0 ? void 0 : n.length) === 0)
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
    var n = t.instance, i = t.props, r = t.state, o = t.option, a = t.focusedOption;
    return ["p-select-option", {
      "p-select-option-selected": n.isSelected(o) && i.highlightOnSelect,
      "p-focus": r.focusedOptionIndex === a,
      "p-disabled": n.isOptionDisabled(o)
    }];
  },
  optionLabel: "p-select-option-label",
  optionCheckIcon: "p-select-option-check-icon",
  optionBlankIcon: "p-select-option-blank-icon",
  emptyMessage: "p-select-empty-message"
}, ka = J.extend({
  name: "select",
  style: va,
  classes: ya
}), wa = {
  name: "BaseSelect",
  extends: _e,
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
  style: ka,
  provide: function() {
    return {
      $pcSelect: this,
      $parentInstance: this
    };
  }
};
function Me(e) {
  "@babel/helpers - typeof";
  return Me = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Me(e);
}
function xa(e) {
  return Ca(e) || Sa(e) || $a(e) || Ia();
}
function Ia() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function $a(e, t) {
  if (e) {
    if (typeof e == "string") return ft(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? ft(e, t) : void 0;
  }
}
function Sa(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Ca(e) {
  if (Array.isArray(e)) return ft(e);
}
function ft(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, i = Array(t); n < t; n++) i[n] = e[n];
  return i;
}
function Vt(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(e);
    t && (i = i.filter(function(r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), n.push.apply(n, i);
  }
  return n;
}
function Mt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Vt(Object(n), !0).forEach(function(i) {
      fe(e, i, n[i]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Vt(Object(n)).forEach(function(i) {
      Object.defineProperty(e, i, Object.getOwnPropertyDescriptor(n, i));
    });
  }
  return e;
}
function fe(e, t, n) {
  return (t = Oa(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Oa(e) {
  var t = za(e, "string");
  return Me(t) == "symbol" ? t : t + "";
}
function za(e, t) {
  if (Me(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(e, t);
    if (Me(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var dn = {
  name: "Select",
  extends: wa,
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
    this.unbindOutsideClickListener(), this.unbindResizeListener(), this.unbindLabelClickListener(), this.unbindMatchMediaOrientationListener(), this.scrollHandler && (this.scrollHandler.destroy(), this.scrollHandler = null), this.overlay && (Je.clear(this.overlay), this.overlay = null);
  },
  methods: {
    getOptionIndex: function(t, n) {
      return this.virtualScrollerDisabled ? t : n && n(t).index;
    },
    getOptionLabel: function(t) {
      return this.optionLabel ? be(t, this.optionLabel) : t;
    },
    getOptionValue: function(t) {
      return this.optionValue ? be(t, this.optionValue) : t;
    },
    getOptionRenderKey: function(t, n) {
      return (this.dataKey ? be(t, this.dataKey) : this.getOptionLabel(t)) + "_" + n;
    },
    getPTItemOptions: function(t, n, i, r) {
      return this.ptm(r, {
        context: {
          option: t,
          index: i,
          selected: this.isSelected(t),
          focused: this.focusedOptionIndex === this.getOptionIndex(i, n),
          disabled: this.isOptionDisabled(t)
        }
      });
    },
    isOptionDisabled: function(t) {
      return this.optionDisabled ? be(t, this.optionDisabled) : !1;
    },
    isOptionGroup: function(t) {
      return this.optionGroupLabel && t.optionGroup && t.group;
    },
    getOptionGroupLabel: function(t) {
      return be(t, this.optionGroupLabel);
    },
    getOptionGroupChildren: function(t) {
      return be(t, this.optionGroupChildren);
    },
    getAriaPosInset: function(t) {
      var n = this;
      return (this.optionGroupLabel ? t - this.visibleOptions.slice(0, t).filter(function(i) {
        return n.isOptionGroup(i);
      }).length : t) + 1;
    },
    show: function(t) {
      this.$emit("before-show"), this.overlayVisible = !0, this.focusedOptionIndex = this.focusedOptionIndex !== -1 ? this.focusedOptionIndex : this.autoOptionFocus ? this.findFirstFocusedOptionIndex() : this.editable ? -1 : this.findSelectedOptionIndex(), t && ue(this.$refs.focusInput);
    },
    hide: function(t) {
      var n = this, i = function() {
        n.$emit("before-hide"), n.overlayVisible = !1, n.clicked = !1, n.focusedOptionIndex = -1, n.searchValue = "", n.resetFilterOnHide && (n.filterValue = null), t && ue(n.$refs.focusInput);
      };
      setTimeout(function() {
        i();
      }, 0);
    },
    onFocus: function(t) {
      this.disabled || (this.focused = !0, this.overlayVisible && (this.focusedOptionIndex = this.focusedOptionIndex !== -1 ? this.focusedOptionIndex : this.autoOptionFocus ? this.findFirstFocusedOptionIndex() : this.editable ? -1 : this.findSelectedOptionIndex(), this.scrollInView(this.focusedOptionIndex)), this.$emit("focus", t));
    },
    onBlur: function(t) {
      var n = this;
      setTimeout(function() {
        var i, r;
        n.focused = !1, n.focusedOptionIndex = -1, n.searchValue = "", n.$emit("blur", t), (i = (r = n.formField).onBlur) === null || i === void 0 || i.call(r, t);
      }, 100);
    },
    onKeyDown: function(t) {
      var n = this;
      if (this.disabled) {
        t.preventDefault();
        return;
      }
      if (On())
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
      var i = t.metaKey || t.ctrlKey;
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
          !i && zn(t.key) && (!this.overlayVisible && this.show(), !this.editable && this.searchOptions(t, t.key), this.filter && this.$nextTick(function() {
            n.$refs.filterInput && ue(n.$refs.filterInput.$el);
          }));
          break;
      }
      this.clicked = !1;
    },
    onEditableInput: function(t) {
      var n = t.target.value;
      this.searchValue = "";
      var i = this.searchOptions(t, n);
      !i && (this.focusedOptionIndex = -1), this.updateModel(t, n), !this.overlayVisible && ce(n) && this.show();
    },
    onContainerClick: function(t) {
      this.disabled || this.loading || t.target.tagName === "INPUT" || t.target.getAttribute("data-pc-section") === "clearicon" || t.target.closest('[data-pc-section="clearicon"]') || ((!this.overlay || !this.overlay.contains(t.target)) && (this.overlayVisible ? this.hide(!0) : this.show(!0)), this.clicked = !0);
    },
    onClearClick: function(t) {
      this.updateModel(t, null), this.resetFilterOnClear && (this.filterValue = null);
    },
    onFirstHiddenFocus: function(t) {
      var n = t.relatedTarget === this.$refs.focusInput ? Cn(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      ue(n);
    },
    onLastHiddenFocus: function(t) {
      var n = t.relatedTarget === this.$refs.focusInput ? Sn(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      ue(n);
    },
    onOptionSelect: function(t, n) {
      var i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0;
      if (this.overlayVisible) {
        var r = this.getOptionValue(n);
        this.updateModel(t, r), i && this.hide(!0);
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
      $n.emit("overlay-click", {
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
        var i = this.focusedOptionIndex !== -1 ? this.findPrevOptionIndex(this.focusedOptionIndex) : this.clicked ? this.findLastOptionIndex() : this.findLastFocusedOptionIndex();
        this.changeFocusedOptionIndex(t, i), !this.overlayVisible && this.show(), t.preventDefault();
      }
    },
    onArrowLeftKey: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n && (this.focusedOptionIndex = -1);
    },
    onHomeKey: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (n) {
        var i = t.currentTarget;
        t.shiftKey ? i.setSelectionRange(0, t.target.selectionStart) : (i.setSelectionRange(0, 0), this.focusedOptionIndex = -1);
      } else
        this.changeFocusedOptionIndex(t, this.findFirstOptionIndex()), !this.overlayVisible && this.show();
      t.preventDefault();
    },
    onEndKey: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (n) {
        var i = t.currentTarget;
        if (t.shiftKey)
          i.setSelectionRange(t.target.selectionStart, i.value.length);
        else {
          var r = i.value.length;
          i.setSelectionRange(r, r), this.focusedOptionIndex = -1;
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
      n || (this.overlayVisible && this.hasFocusableElements() ? (ue(this.$refs.firstHiddenFocusableElementOnOverlay), t.preventDefault()) : (this.focusedOptionIndex !== -1 && this.onOptionSelect(t, this.visibleOptions[this.focusedOptionIndex]), this.overlayVisible && this.hide(this.filter)));
    },
    onBackspaceKey: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n && !this.overlayVisible && this.show();
    },
    onOverlayEnter: function(t) {
      var n = this;
      Je.set("overlay", t, this.$primevue.config.zIndex.overlay), In(t, {
        position: "absolute",
        top: "0"
      }), this.alignOverlay(), this.scrollInView(), this.$attrSelector && t.setAttribute(this.$attrSelector, ""), setTimeout(function() {
        n.autoFilterFocus && n.filter && ue(n.$refs.filterInput.$el), n.autoUpdateModel();
      }, 1);
    },
    onOverlayAfterEnter: function() {
      this.bindOutsideClickListener(), this.bindScrollListener(), this.bindResizeListener(), this.$emit("show");
    },
    onOverlayLeave: function(t) {
      var n = this;
      t.style.pointerEvents = "none", this.unbindOutsideClickListener(), this.unbindScrollListener(), this.unbindResizeListener(), this.autoFilterFocus && this.filter && !this.editable && this.$nextTick(function() {
        n.$refs.filterInput && ue(n.$refs.filterInput.$el);
      }), this.$emit("hide"), this.overlay = null;
    },
    onOverlayAfterLeave: function(t) {
      Je.clear(t);
    },
    alignOverlay: function() {
      this.appendTo === "self" ? wn(this.overlay, this.$el) : this.overlay && (this.overlay.style.minWidth = Nt(this.$el) + "px", xn(this.overlay, this.$el));
    },
    bindOutsideClickListener: function() {
      var t = this;
      this.outsideClickListener || (this.outsideClickListener = function(n) {
        var i = n.composedPath();
        t.overlayVisible && t.overlay && !i.includes(t.$el) && !i.includes(t.overlay) && t.hide();
      }, document.addEventListener("click", this.outsideClickListener, !0));
    },
    unbindOutsideClickListener: function() {
      this.outsideClickListener && (document.removeEventListener("click", this.outsideClickListener, !0), this.outsideClickListener = null);
    },
    bindScrollListener: function() {
      var t = this;
      this.scrollHandler || (this.scrollHandler = new kn(this.$refs.container, function() {
        t.overlayVisible && t.hide();
      })), this.scrollHandler.bindScrollListener();
    },
    unbindScrollListener: function() {
      this.scrollHandler && this.scrollHandler.unbindScrollListener();
    },
    bindResizeListener: function() {
      var t = this;
      this.resizeListener || (this.resizeListener = function() {
        t.overlayVisible && !yn() && t.hide();
      }, window.addEventListener("resize", this.resizeListener));
    },
    unbindResizeListener: function() {
      this.resizeListener && (window.removeEventListener("resize", this.resizeListener), this.resizeListener = null);
    },
    bindLabelClickListener: function() {
      var t = this;
      if (!this.editable && !this.labelClickListener) {
        var n = document.querySelector('label[for="'.concat(this.labelId, '"]'));
        n && We(n) && (this.labelClickListener = function() {
          ue(t.$refs.focusInput);
        }, n.addEventListener("click", this.labelClickListener));
      }
    },
    unbindLabelClickListener: function() {
      if (this.labelClickListener) {
        var t = document.querySelector('label[for="'.concat(this.labelId, '"]'));
        t && We(t) && t.removeEventListener("click", this.labelClickListener);
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
      return vn(this.overlay, ':not([data-p-hidden-focusable="true"])').length > 0;
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
      return ce(t) && !(this.isOptionDisabled(t) || this.isOptionGroup(t));
    },
    isValidSelectedOption: function(t) {
      return this.isValidOption(t) && this.isSelected(t);
    },
    isSelected: function(t) {
      return mt(this.d_value, this.getOptionValue(t), this.equalityKey);
    },
    findFirstOptionIndex: function() {
      var t = this;
      return this.visibleOptions.findIndex(function(n) {
        return t.isValidOption(n);
      });
    },
    findLastOptionIndex: function() {
      var t = this;
      return Ct(this.visibleOptions, function(n) {
        return t.isValidOption(n);
      });
    },
    findNextOptionIndex: function(t) {
      var n = this, i = t < this.visibleOptions.length - 1 ? this.visibleOptions.slice(t + 1).findIndex(function(r) {
        return n.isValidOption(r);
      }) : -1;
      return i > -1 ? i + t + 1 : t;
    },
    findPrevOptionIndex: function(t) {
      var n = this, i = t > 0 ? Ct(this.visibleOptions.slice(0, t), function(r) {
        return n.isValidOption(r);
      }) : -1;
      return i > -1 ? i : t;
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
      var i = this;
      this.searchValue = (this.searchValue || "") + n;
      var r = -1, o = !1;
      return ce(this.searchValue) && (r = this.visibleOptions.findIndex(function(a) {
        return i.isOptionExactMatched(a);
      }), r === -1 && (r = this.visibleOptions.findIndex(function(a) {
        return i.isOptionStartsWith(a);
      })), r !== -1 && (o = !0), r === -1 && this.focusedOptionIndex === -1 && (r = this.findFirstFocusedOptionIndex()), r !== -1 && this.changeFocusedOptionIndex(t, r)), this.searchTimeout && clearTimeout(this.searchTimeout), this.searchTimeout = setTimeout(function() {
        i.searchValue = "", i.searchTimeout = null;
      }, 500), o;
    },
    changeFocusedOptionIndex: function(t, n) {
      this.focusedOptionIndex !== n && (this.focusedOptionIndex = n, this.scrollInView(), this.selectOnFocus && this.onOptionSelect(t, this.visibleOptions[n], !1));
    },
    scrollInView: function() {
      var t = this, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : -1;
      this.$nextTick(function() {
        var i = n !== -1 ? "".concat(t.$id, "_").concat(n) : t.focusedOptionId, r = ge(t.list, 'li[id="'.concat(i, '"]'));
        r ? r.scrollIntoView && r.scrollIntoView({
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
      return (t || []).reduce(function(i, r, o) {
        i.push({
          optionGroup: r,
          group: !0,
          index: o
        });
        var a = n.getOptionGroupChildren(r);
        return a && a.forEach(function(l) {
          return i.push(l);
        }), i;
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
        var i = gn.filter(n, this.searchFields, this.filterValue, this.filterMatchMode, this.filterLocale);
        if (this.optionGroupLabel) {
          var r = this.options || [], o = [];
          return r.forEach(function(a) {
            var l = t.getOptionGroupChildren(a), d = l.filter(function(p) {
              return i.includes(p);
            });
            d.length > 0 && o.push(Mt(Mt({}, a), {}, fe({}, typeof t.optionGroupChildren == "string" ? t.optionGroupChildren : "items", xa(d))));
          }), this.flatOptions(o);
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
      return Z(fe({
        invalid: this.$invalid,
        disabled: this.disabled,
        focus: this.focused,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    },
    labelDataP: function() {
      return Z(fe(fe({
        placeholder: !this.editable && this.label === this.placeholder,
        clearable: this.showClear,
        disabled: this.disabled,
        editable: this.editable
      }, this.size, this.size), "empty", !this.editable && !this.$slots.value && (this.label === "p-emptylabel" || this.label.length === 0)));
    },
    dropdownIconDataP: function() {
      return Z(fe({}, this.size, this.size));
    },
    overlayDataP: function() {
      return Z(fe({}, "portal-" + this.appendTo, "portal-" + this.appendTo));
    }
  },
  directives: {
    ripple: De
  },
  components: {
    InputText: Ye,
    VirtualScroller: un,
    Portal: mn,
    InputIcon: sn,
    IconField: an,
    TimesIcon: qe,
    ChevronDownIcon: on,
    SpinnerIcon: Ze,
    SearchIcon: rn,
    CheckIcon: kt,
    BlankIcon: nn
  }
}, La = ["id", "data-p"], Aa = ["name", "id", "value", "placeholder", "tabindex", "disabled", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-invalid", "data-p"], Ba = ["name", "id", "tabindex", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-invalid", "aria-disabled", "data-p"], Pa = ["data-p"], Ta = ["id"], Fa = ["id"], Va = ["id", "aria-label", "aria-selected", "aria-disabled", "aria-setsize", "aria-posinset", "onMousedown", "onMousemove", "data-p-selected", "data-p-focused", "data-p-disabled"];
function Ma(e, t, n, i, r, o) {
  var a = R("SpinnerIcon"), l = R("InputText"), d = R("SearchIcon"), p = R("InputIcon"), b = R("IconField"), x = R("CheckIcon"), f = R("BlankIcon"), g = R("VirtualScroller"), k = R("Portal"), I = Ee("ripple");
  return s(), u("div", c({
    ref: "container",
    id: e.$id,
    class: e.cx("root"),
    onClick: t[12] || (t[12] = function() {
      return o.onContainerClick && o.onContainerClick.apply(o, arguments);
    }),
    "data-p": o.containerDataP
  }, e.ptmi("root")), [e.editable ? (s(), u("input", c({
    key: 0,
    ref: "focusInput",
    name: e.name,
    id: e.labelId || e.inputId,
    type: "text",
    class: [e.cx("label"), e.inputClass, e.labelClass],
    style: [e.inputStyle, e.labelStyle],
    value: o.editableInputValue,
    placeholder: e.placeholder,
    tabindex: e.disabled ? -1 : e.tabindex,
    disabled: e.disabled,
    autocomplete: "off",
    role: "combobox",
    "aria-label": e.ariaLabel,
    "aria-labelledby": e.ariaLabelledby,
    "aria-haspopup": "listbox",
    "aria-expanded": r.overlayVisible,
    "aria-controls": r.overlayVisible ? e.$id + "_list" : void 0,
    "aria-activedescendant": r.focused ? o.focusedOptionId : void 0,
    "aria-invalid": e.invalid || void 0,
    onFocus: t[0] || (t[0] = function() {
      return o.onFocus && o.onFocus.apply(o, arguments);
    }),
    onBlur: t[1] || (t[1] = function() {
      return o.onBlur && o.onBlur.apply(o, arguments);
    }),
    onKeydown: t[2] || (t[2] = function() {
      return o.onKeyDown && o.onKeyDown.apply(o, arguments);
    }),
    onInput: t[3] || (t[3] = function() {
      return o.onEditableInput && o.onEditableInput.apply(o, arguments);
    }),
    "data-p": o.labelDataP
  }, e.ptm("label")), null, 16, Aa)) : (s(), u("span", c({
    key: 1,
    ref: "focusInput",
    name: e.name,
    id: e.labelId || e.inputId,
    class: [e.cx("label"), e.inputClass, e.labelClass],
    style: [e.inputStyle, e.labelStyle],
    tabindex: e.disabled ? -1 : e.tabindex,
    role: "combobox",
    "aria-label": e.ariaLabel || (o.label === "p-emptylabel" ? void 0 : o.label),
    "aria-labelledby": e.ariaLabelledby,
    "aria-haspopup": "listbox",
    "aria-expanded": r.overlayVisible,
    "aria-controls": e.$id + "_list",
    "aria-activedescendant": r.focused ? o.focusedOptionId : void 0,
    "aria-invalid": e.invalid || void 0,
    "aria-disabled": e.disabled,
    onFocus: t[4] || (t[4] = function() {
      return o.onFocus && o.onFocus.apply(o, arguments);
    }),
    onBlur: t[5] || (t[5] = function() {
      return o.onBlur && o.onBlur.apply(o, arguments);
    }),
    onKeydown: t[6] || (t[6] = function() {
      return o.onKeyDown && o.onKeyDown.apply(o, arguments);
    }),
    "data-p": o.labelDataP
  }, e.ptm("label")), [O(e.$slots, "value", {
    value: e.d_value,
    placeholder: e.placeholder
  }, function() {
    var S;
    return [de(A(o.label === "p-emptylabel" ? " " : (S = o.label) !== null && S !== void 0 ? S : "empty"), 1)];
  })], 16, Ba)), o.isClearIconVisible ? O(e.$slots, "clearicon", {
    key: 2,
    class: K(e.cx("clearIcon")),
    clearCallback: o.onClearClick
  }, function() {
    return [(s(), T(ie(e.clearIcon ? "i" : "TimesIcon"), c({
      ref: "clearIcon",
      class: [e.cx("clearIcon"), e.clearIcon],
      onClick: o.onClearClick
    }, e.ptm("clearIcon"), {
      "data-pc-section": "clearicon"
    }), null, 16, ["class", "onClick"]))];
  }) : $("", !0), m("div", c({
    class: e.cx("dropdown")
  }, e.ptm("dropdown")), [e.loading ? O(e.$slots, "loadingicon", {
    key: 0,
    class: K(e.cx("loadingIcon"))
  }, function() {
    return [e.loadingIcon ? (s(), u("span", c({
      key: 0,
      class: [e.cx("loadingIcon"), "pi-spin", e.loadingIcon],
      "aria-hidden": "true"
    }, e.ptm("loadingIcon")), null, 16)) : (s(), T(a, c({
      key: 1,
      class: e.cx("loadingIcon"),
      spin: "",
      "aria-hidden": "true"
    }, e.ptm("loadingIcon")), null, 16, ["class"]))];
  }) : O(e.$slots, "dropdownicon", {
    key: 1,
    class: K(e.cx("dropdownIcon"))
  }, function() {
    return [(s(), T(ie(e.dropdownIcon ? "span" : "ChevronDownIcon"), c({
      class: [e.cx("dropdownIcon"), e.dropdownIcon],
      "aria-hidden": "true",
      "data-p": o.dropdownIconDataP
    }, e.ptm("dropdownIcon")), null, 16, ["class", "data-p"]))];
  })], 16), E(k, {
    appendTo: e.appendTo
  }, {
    default: te(function() {
      return [E(Kt, c({
        name: "p-anchored-overlay",
        onEnter: o.onOverlayEnter,
        onAfterEnter: o.onOverlayAfterEnter,
        onLeave: o.onOverlayLeave,
        onAfterLeave: o.onOverlayAfterLeave
      }, e.ptm("transition")), {
        default: te(function() {
          return [r.overlayVisible ? (s(), u("div", c({
            key: 0,
            ref: o.overlayRef,
            class: [e.cx("overlay"), e.panelClass, e.overlayClass],
            style: [e.panelStyle, e.overlayStyle],
            onClick: t[10] || (t[10] = function() {
              return o.onOverlayClick && o.onOverlayClick.apply(o, arguments);
            }),
            onKeydown: t[11] || (t[11] = function() {
              return o.onOverlayKeyDown && o.onOverlayKeyDown.apply(o, arguments);
            }),
            "data-p": o.overlayDataP
          }, e.ptm("overlay")), [m("span", c({
            ref: "firstHiddenFocusableElementOnOverlay",
            role: "presentation",
            "aria-hidden": "true",
            class: "p-hidden-accessible p-hidden-focusable",
            tabindex: 0,
            onFocus: t[7] || (t[7] = function() {
              return o.onFirstHiddenFocus && o.onFirstHiddenFocus.apply(o, arguments);
            })
          }, e.ptm("hiddenFirstFocusableEl"), {
            "data-p-hidden-accessible": !0,
            "data-p-hidden-focusable": !0
          }), null, 16), O(e.$slots, "header", {
            value: e.d_value,
            options: o.visibleOptions
          }), e.filter ? (s(), u("div", c({
            key: 0,
            class: e.cx("header")
          }, e.ptm("header")), [E(b, {
            unstyled: e.unstyled,
            pt: e.ptm("pcFilterContainer")
          }, {
            default: te(function() {
              return [E(l, {
                ref: "filterInput",
                type: "text",
                value: r.filterValue,
                onVnodeMounted: o.onFilterUpdated,
                onVnodeUpdated: o.onFilterUpdated,
                class: K(e.cx("pcFilter")),
                placeholder: e.filterPlaceholder,
                variant: e.variant,
                unstyled: e.unstyled,
                role: "searchbox",
                autocomplete: "off",
                "aria-owns": e.$id + "_list",
                "aria-activedescendant": o.focusedOptionId,
                onKeydown: o.onFilterKeyDown,
                onBlur: o.onFilterBlur,
                onInput: o.onFilterChange,
                pt: e.ptm("pcFilter"),
                formControl: {
                  novalidate: !0
                }
              }, null, 8, ["value", "onVnodeMounted", "onVnodeUpdated", "class", "placeholder", "variant", "unstyled", "aria-owns", "aria-activedescendant", "onKeydown", "onBlur", "onInput", "pt"]), E(p, {
                unstyled: e.unstyled,
                pt: e.ptm("pcFilterIconContainer")
              }, {
                default: te(function() {
                  return [O(e.$slots, "filtericon", {}, function() {
                    return [e.filterIcon ? (s(), u("span", c({
                      key: 0,
                      class: e.filterIcon
                    }, e.ptm("filterIcon")), null, 16)) : (s(), T(d, Pn(c({
                      key: 1
                    }, e.ptm("filterIcon"))), null, 16))];
                  })];
                }),
                _: 3
              }, 8, ["unstyled", "pt"])];
            }),
            _: 3
          }, 8, ["unstyled", "pt"]), m("span", c({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, e.ptm("hiddenFilterResult"), {
            "data-p-hidden-accessible": !0
          }), A(o.filterResultMessageText), 17)], 16)) : $("", !0), m("div", c({
            class: e.cx("listContainer"),
            style: {
              "max-height": o.virtualScrollerDisabled ? e.scrollHeight : ""
            }
          }, e.ptm("listContainer")), [E(g, c({
            ref: o.virtualScrollerRef
          }, e.virtualScrollerOptions, {
            items: o.visibleOptions,
            style: {
              height: e.scrollHeight
            },
            tabindex: -1,
            disabled: o.virtualScrollerDisabled,
            pt: e.ptm("virtualScroller")
          }), Tn({
            content: te(function(S) {
              var z = S.styleClass, F = S.contentRef, D = S.items, L = S.getItemOptions, H = S.contentStyle, j = S.itemSize;
              return [m("ul", c({
                ref: function(V) {
                  return o.listRef(V, F);
                },
                id: e.$id + "_list",
                class: [e.cx("list"), z],
                style: H,
                role: "listbox"
              }, e.ptm("list")), [(s(!0), u(U, null, re(D, function(P, V) {
                return s(), u(U, {
                  key: o.getOptionRenderKey(P, o.getOptionIndex(V, L))
                }, [o.isOptionGroup(P) ? (s(), u("li", c({
                  key: 0,
                  id: e.$id + "_" + o.getOptionIndex(V, L),
                  style: {
                    height: j ? j + "px" : void 0
                  },
                  class: e.cx("optionGroup"),
                  role: "option"
                }, {
                  ref_for: !0
                }, e.ptm("optionGroup")), [O(e.$slots, "optiongroup", {
                  option: P.optionGroup,
                  index: o.getOptionIndex(V, L)
                }, function() {
                  return [m("span", c({
                    class: e.cx("optionGroupLabel")
                  }, {
                    ref_for: !0
                  }, e.ptm("optionGroupLabel")), A(o.getOptionGroupLabel(P.optionGroup)), 17)];
                })], 16, Fa)) : ve((s(), u("li", c({
                  key: 1,
                  id: e.$id + "_" + o.getOptionIndex(V, L),
                  class: e.cx("option", {
                    option: P,
                    focusedOption: o.getOptionIndex(V, L)
                  }),
                  style: {
                    height: j ? j + "px" : void 0
                  },
                  role: "option",
                  "aria-label": o.getOptionLabel(P),
                  "aria-selected": o.isSelected(P),
                  "aria-disabled": o.isOptionDisabled(P),
                  "aria-setsize": o.ariaSetSize,
                  "aria-posinset": o.getAriaPosInset(o.getOptionIndex(V, L)),
                  onMousedown: function(Q) {
                    return o.onOptionSelect(Q, P);
                  },
                  onMousemove: function(Q) {
                    return o.onOptionMouseMove(Q, o.getOptionIndex(V, L));
                  },
                  onClick: t[8] || (t[8] = Fn(function() {
                  }, ["stop"])),
                  "data-p-selected": !e.checkmark && o.isSelected(P),
                  "data-p-focused": r.focusedOptionIndex === o.getOptionIndex(V, L),
                  "data-p-disabled": o.isOptionDisabled(P)
                }, {
                  ref_for: !0
                }, o.getPTItemOptions(P, L, V, "option")), [e.checkmark ? (s(), u(U, {
                  key: 0
                }, [o.isSelected(P) ? (s(), T(x, c({
                  key: 0,
                  class: e.cx("optionCheckIcon")
                }, {
                  ref_for: !0
                }, e.ptm("optionCheckIcon")), null, 16, ["class"])) : (s(), T(f, c({
                  key: 1,
                  class: e.cx("optionBlankIcon")
                }, {
                  ref_for: !0
                }, e.ptm("optionBlankIcon")), null, 16, ["class"]))], 64)) : $("", !0), O(e.$slots, "option", {
                  option: P,
                  selected: o.isSelected(P),
                  index: o.getOptionIndex(V, L)
                }, function() {
                  return [m("span", c({
                    class: e.cx("optionLabel")
                  }, {
                    ref_for: !0
                  }, e.ptm("optionLabel")), A(o.getOptionLabel(P)), 17)];
                })], 16, Va)), [[I]])], 64);
              }), 128)), r.filterValue && (!D || D && D.length === 0) ? (s(), u("li", c({
                key: 0,
                class: e.cx("emptyMessage"),
                role: "option"
              }, e.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [O(e.$slots, "emptyfilter", {}, function() {
                return [de(A(o.emptyFilterMessageText), 1)];
              })], 16)) : !e.options || e.options && e.options.length === 0 ? (s(), u("li", c({
                key: 1,
                class: e.cx("emptyMessage"),
                role: "option"
              }, e.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [O(e.$slots, "empty", {}, function() {
                return [de(A(o.emptyMessageText), 1)];
              })], 16)) : $("", !0)], 16, Ta)];
            }),
            _: 2
          }, [e.$slots.loader ? {
            name: "loader",
            fn: te(function(S) {
              var z = S.options;
              return [O(e.$slots, "loader", {
                options: z
              })];
            }),
            key: "0"
          } : void 0]), 1040, ["items", "style", "disabled", "pt"])], 16), O(e.$slots, "footer", {
            value: e.d_value,
            options: o.visibleOptions
          }), !e.options || e.options && e.options.length === 0 ? (s(), u("span", c({
            key: 1,
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, e.ptm("hiddenEmptyMessage"), {
            "data-p-hidden-accessible": !0
          }), A(o.emptyMessageText), 17)) : $("", !0), m("span", c({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, e.ptm("hiddenSelectedMessage"), {
            "data-p-hidden-accessible": !0
          }), A(o.selectedMessageText), 17), m("span", c({
            ref: "lastHiddenFocusableElementOnOverlay",
            role: "presentation",
            "aria-hidden": "true",
            class: "p-hidden-accessible p-hidden-focusable",
            tabindex: 0,
            onFocus: t[9] || (t[9] = function() {
              return o.onLastHiddenFocus && o.onLastHiddenFocus.apply(o, arguments);
            })
          }, e.ptm("hiddenLastFocusableEl"), {
            "data-p-hidden-accessible": !0,
            "data-p-hidden-focusable": !0
          }), null, 16)], 16, Pa)) : $("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onLeave", "onAfterLeave"])];
    }),
    _: 3
  }, 8, ["appendTo"])], 16, La);
}
dn.render = Ma;
function Da(e) {
  if (!e) return null;
  let t;
  if (typeof e == "number")
    t = e;
  else {
    const n = e.trim();
    if (/^\d+$/.test(n))
      t = Number(n);
    else {
      const i = Date.parse(n);
      return Number.isNaN(i) ? null : i;
    }
  }
  return Number.isFinite(t) ? t < 1e12 ? t * 1e3 : t : null;
}
function cn(e, t) {
  const n = Da(e);
  if (n === null) return "";
  const i = t?.now ?? Date.now(), r = t?.suffix ?? !0, o = t?.maxUnit ?? "day", a = t?.future ?? !1, l = 6e4, d = 60 * l, p = 24 * d, b = 30 * p, x = 365 * p, f = i - n;
  if (a && f < 0) {
    const I = -f;
    return I < l ? "in <1m" : I < d ? `in ${Math.floor(I / l)}m` : I < p ? `in ${Math.floor(I / d)}h` : `in ${Math.floor(I / p)}d`;
  }
  const g = Math.max(0, f);
  if (g < l) return "just now";
  const k = r ? " ago" : "";
  return g < d ? `${Math.floor(g / l)}m${k}` : g < p ? `${Math.floor(g / d)}h${k}` : o === "year" ? g < b ? `${Math.floor(g / p)}d${k}` : g < x ? `${Math.floor(g / b)}mo${k}` : `${Math.floor(g / x)}y${k}` : `${Math.floor(g / p)}d${k}`;
}
function Ea(e) {
  const t = e || "";
  return t.startsWith("image/") ? "tabler:photo" : t === "application/pdf" ? "tabler:file-type-pdf" : t.includes("word") || t.includes("opendocument.text") || t === "application/rtf" ? "tabler:file-type-doc" : t.includes("sheet") || t.includes("excel") || t.includes("spreadsheet") || t === "text/csv" ? "tabler:file-type-xls" : t.includes("presentation") || t.includes("powerpoint") ? "tabler:file-type-ppt" : t === "application/epub+zip" ? "tabler:book" : t.startsWith("text/") || t === "application/json" || t === "application/xml" ? "tabler:file-text" : "tabler:file";
}
function _a(e) {
  if (!e) return "0 B";
  const t = ["B", "KB", "MB", "GB"], n = Math.min(Math.floor(Math.log(e) / Math.log(1024)), t.length - 1);
  return `${(e / Math.pow(1024, n)).toFixed(n ? 1 : 0)} ${t[n]}`;
}
function Ie(e, t) {
  if (e && typeof e == "object") {
    const n = e, i = n.response?.data?.error;
    if (typeof i == "string") return i;
    if (i && typeof i == "object" && typeof i.message == "string")
      return i.message;
    if (typeof n.message == "string" && n.message) return n.message;
  }
  return t;
}
function he(e) {
  return e !== null && typeof e == "object" && !Array.isArray(e);
}
function ht(e) {
  return he(e) ? ["id", "item_type", "title", "priority", "status"].every((t) => typeof e[t] == "string") && ["content", "action", "file_version"].every((t) => e[t] === void 0 || typeof e[t] == "string") && ["created_at", "resolved_at"].every((t) => e[t] === void 0 || typeof e[t] == "number") && (e.file_count === void 0 || Number.isInteger(e.file_count) && Number(e.file_count) >= 0) && (e.files === void 0 || Array.isArray(e.files) && e.files.every((t) => he(t) && typeof t.locked == "boolean" && ["filename", "content_type", "view_url"].every((n) => t[n] === void 0 || typeof t[n] == "string") && (t.size === void 0 || typeof t.size == "number" && Number.isFinite(t.size) && t.size >= 0))) && ["metadata", "form"].every((t) => e[t] === void 0 || he(e[t])) : !1;
}
const ja = {
  class: "kx-files",
  "aria-label": "Attached files"
}, Na = {
  key: 0,
  role: "status"
}, Ka = { key: 1 }, Ra = { role: "alert" }, Ua = { class: "kx-file-list" }, Ha = {
  key: 0,
  class: "kx-file-row kx-file-locked",
  "data-testid": "inbox-file-locked"
}, Wa = { class: "kx-file-row" }, Ga = { class: "kx-file-label" }, qa = { class: "kx-file-name" }, Za = {
  key: 0,
  class: "kx-file-size"
}, Ya = ["href"], Ja = { class: "kx-sr-only" }, Qa = {
  key: 0,
  class: "kx-file-preview"
}, Xa = {
  key: 0,
  role: "status"
}, es = {
  key: 1,
  role: "alert"
}, ts = ["content-type", "filename", "source-url"], ns = /* @__PURE__ */ gt({
  __name: "ItemFiles",
  props: {
    itemId: {},
    files: {},
    count: {},
    version: {}
  },
  setup(e) {
    const t = e, n = N([]), i = N(!1), r = N("");
    let o = 0;
    const a = N(null), l = N(!1), d = N("");
    async function p() {
      const f = ++o;
      if (a.value = null, n.value = t.files || [], r.value = "", i.value = !1, t.files === void 0) {
        i.value = !0;
        try {
          const { data: g } = await xe.get(
            `/api/v1/inbox?id=${encodeURIComponent(t.itemId)}&status=all&limit=1`
          );
          if (f !== o) return;
          const k = g?.items?.[0];
          if (!g?.success || !ht(k) || k.id !== t.itemId) throw new Error("Attached files are unavailable");
          n.value = k.files || [];
        } catch (g) {
          f === o && (r.value = Ie(g, "Attached files are unavailable"));
        } finally {
          f === o && (i.value = !1);
        }
      }
    }
    vt(() => [t.itemId, t.files, t.count, t.version], () => {
      p();
    }, { immediate: !0 }), yt(() => {
      o += 1;
    });
    function b(f) {
      if (f)
        return /^(https?:\/\/|\/(?!\/))/i.test(f) ? f : void 0;
    }
    async function x(f) {
      if (a.value === f) {
        a.value = null;
        return;
      }
      a.value = f, l.value = !0, d.value = "";
      try {
        await Qe("wc-resource-view", { timeoutMs: 8e3 });
      } catch (g) {
        d.value = g instanceof Error ? g.message : String(g);
      } finally {
        l.value = !1;
      }
    }
    return (f, g) => (s(), u("section", ja, [
      g[2] || (g[2] = m("h3", null, "Files", -1)),
      i.value ? (s(), u("p", Na, "Loading attached files…")) : r.value ? (s(), u("div", Ka, [
        m("p", Ra, A(r.value), 1),
        E(M(Ae), {
          type: "button",
          size: "small",
          text: "",
          severity: "secondary",
          label: "Retry files",
          onClick: p
        })
      ])) : $("", !0),
      m("ul", Ua, [
        (s(!0), u(U, null, re(n.value, (k, I) => (s(), u("li", { key: I }, [
          k.locked ? (s(), u("div", Ha, [
            E(M(ye), {
              icon: "tabler:lock",
              "aria-hidden": "true"
            }),
            g[0] || (g[0] = m("span", null, "Locked file", -1))
          ])) : (s(), u(U, { key: 1 }, [
            m("div", Wa, [
              E(M(ye), {
                icon: M(Ea)(k.content_type || ""),
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              m("div", Ga, [
                m("span", qa, A(k.filename || "File"), 1),
                k.size !== void 0 ? (s(), u("span", Za, A(M(_a)(k.size)), 1)) : $("", !0)
              ]),
              E(M(Ae), {
                type: "button",
                size: "small",
                text: "",
                severity: "secondary",
                "data-testid": "inbox-file-preview",
                label: a.value === I ? "Close preview" : "Preview",
                "aria-expanded": a.value === I,
                onClick: (S) => x(I)
              }, null, 8, ["label", "aria-expanded", "onClick"]),
              b(k.view_url) ? (s(), u("a", {
                key: 0,
                href: b(k.view_url),
                target: "_blank",
                rel: "noopener noreferrer",
                "data-testid": "inbox-file-open"
              }, [
                g[1] || (g[1] = de("Open", -1)),
                m("span", Ja, A(k.filename || "file"), 1)
              ], 8, Ya)) : $("", !0)
            ]),
            a.value === I ? (s(), u("div", Qa, [
              l.value ? (s(), u("p", Xa, "Loading preview…")) : d.value ? (s(), u("p", es, A(d.value), 1)) : (s(), u("wc-resource-view", {
                key: 2,
                "content-type": k.content_type || "",
                filename: k.filename || "",
                "source-url": `/api/v1/inbox/${encodeURIComponent(t.itemId)}/files/${I + 1}`
              }, null, 8, ts))
            ])) : $("", !0)
          ], 64))
        ]))), 128))
      ])
    ]));
  }
}), Dt = {
  item_count: "integer",
  pending_count: "integer",
  resolved_count: "integer",
  urgent_count: "integer",
  high_count: "integer"
}, is = {
  pending: "Pending",
  resolved: "Resolved",
  approved: "Approved",
  rejected: "Rejected",
  dismissed: "Dismissed"
};
function bt(e) {
  const t = e || "";
  return is[t] || t;
}
function os(e) {
  const t = (e || "").trim();
  return t ? t.replace(/[._-]+/g, " ").replace(/\b\w/g, (n) => n.toUpperCase()) : "";
}
const rs = 80;
function wt(e) {
  const t = e.replace(/[_-]+/g, " ").trim();
  return t ? t.split(" ").map((n) => n && n[0].toUpperCase() + n.slice(1)).join(" ") : e;
}
function Et(e) {
  return e == null ? "" : typeof e == "string" ? e : typeof e == "number" || typeof e == "boolean" ? String(e) : JSON.stringify(e, null, 2);
}
function _t(e) {
  if (e == null || e === "") return { kind: "empty" };
  if (typeof e == "string") return { kind: "text", text: e };
  if (typeof e == "object" && !Array.isArray(e)) {
    const t = Object.entries(e).map(([n, i]) => {
      const r = Et(i);
      return { key: n, label: wt(n), value: r, long: r.length > rs || r.includes(`
`) };
    });
    return t.length ? { kind: "rows", rows: t } : { kind: "empty" };
  }
  return { kind: "text", text: Et(e) };
}
function pn(e) {
  return typeof e == "string" || typeof e == "number" || typeof e == "boolean";
}
function as(e, t, n) {
  const i = t.default;
  return e === "checkbox" ? typeof i == "boolean" ? i : void 0 : e === "number" ? typeof i != "number" || !Number.isFinite(i) || t.type === "integer" && !Number.isInteger(i) ? void 0 : i : e === "select" ? pn(i) && n.includes(i) ? i : void 0 : typeof i == "string" ? i : void 0;
}
function ss(e) {
  return Array.isArray(e.enum) ? "select" : e.type === "number" || e.type === "integer" ? "number" : e.type === "boolean" ? "checkbox" : e.type === "string" ? e.format === "textarea" ? "textarea" : "text" : null;
}
function ls(e) {
  if (e && typeof e == "object" && !Array.isArray(e)) {
    const t = e, n = t.properties;
    if (!n || typeof n != "object" || Array.isArray(n)) return [];
    const i = new Set(Array.isArray(t.required) ? t.required.filter((r) => typeof r == "string") : []);
    return Object.entries(n).flatMap(([r, o]) => {
      if (!o || typeof o != "object" || Array.isArray(o)) return [];
      const a = o, l = ss(a);
      if (!l) return [];
      const d = l === "select" && Array.isArray(a.enum) ? a.enum.filter(pn) : [], p = as(l, a, d);
      return [{
        key: r,
        label: typeof a.title == "string" && a.title ? a.title : wt(r),
        type: l,
        required: i.has(r),
        options: d,
        ...p === void 0 ? {} : { default: p }
      }];
    });
  }
  return [];
}
function us(e) {
  const t = {};
  for (const n of e) t[n.key] = n.default ?? (n.type === "checkbox" ? !1 : "");
  return t;
}
function ds(e, t) {
  return e.some((n) => {
    if (!n.required) return !1;
    const i = t[n.key];
    return n.type === "checkbox" ? i !== !0 : i == null || String(i).trim() === "";
  });
}
const cs = { class: "kx-detail" }, ps = { class: "kx-detail-head" }, fs = { class: "kx-detail-title-block" }, hs = { class: "kx-detail-title" }, bs = { class: "kx-detail-meta" }, ms = ["title"], gs = { class: "kx-detail-body" }, vs = {
  key: 1,
  class: "kx-native-body"
}, ys = ["source"], ks = ["source"], ws = {
  key: 2,
  class: "kx-fields"
}, xs = ["source"], Is = { key: 4 }, $s = {
  key: 0,
  "data-testid": "decision-outcome"
}, Ss = {
  key: 1,
  "data-testid": "decision-submitted-form",
  class: "kx-fields"
}, Cs = {
  key: 5,
  class: "kx-decision-form"
}, Os = {
  key: 0,
  class: "kx-checkbox-row"
}, zs = ["for"], Ls = {
  key: 0,
  class: "kx-required"
}, As = ["for"], Bs = {
  key: 0,
  class: "kx-required"
}, Ps = {
  key: 0,
  class: "kx-form-hint"
}, Ts = {
  key: 2,
  class: "kx-native-body"
}, Fs = ["source"], Vs = {
  key: 1,
  class: "kx-fields"
}, Ms = { class: "kx-detail-foot" }, Ds = { class: "kx-resolved" }, Es = { key: 0 }, _s = /* @__PURE__ */ gt({
  __name: "InboxItem",
  props: {
    item: {},
    tag: {},
    icon: {},
    typeLabel: {},
    actions: {},
    actionOwner: {},
    resolving: { type: Boolean },
    resolvingAction: {}
  },
  emits: ["resolve", "delete"],
  setup(e, { emit: t }) {
    const n = e, i = t, r = N(null), o = N(!1);
    let a = null;
    const l = ne(() => n.item.status === "pending"), d = { approve: "Approve", reject: "Reject", dismiss: "Dismiss" }, p = ne(() => (Array.isArray(n.actions) ? n.actions : []).filter((B) => typeof B == "string" && B.length > 0));
    function b(v) {
      const B = n.item.metadata;
      return v === "approve" && typeof B?.approve_label == "string" && B.approve_label ? B.approve_label : v === "reject" && typeof B?.reject_label == "string" && B.reject_label ? B.reject_label : d[v] || wt(v);
    }
    const x = ne(() => {
      const v = n.item.metadata?.fields;
      return Array.isArray(v) ? v.map((B) => ({ label: String(B.label ?? B.key ?? ""), value: B.value })) : [];
    }), f = ne(() => n.item.item_type === "flow_decision"), g = ne(() => {
      const v = n.item.metadata?.prompt;
      return typeof v == "string" && v !== n.item.title ? v : "";
    }), k = ne(() => f.value ? _t(n.item.metadata?.context) : { kind: "empty" }), I = ne(() => f.value ? ls(n.item.metadata?.form) : []), S = ne(() => {
      const v = _t(n.item.form);
      return v.kind !== "rows" ? [] : v.rows.map((B) => ({ ...B, label: I.value.find((y) => y.key === B.key)?.label || B.label }));
    }), z = N(us(I.value)), F = ne(() => !ds(I.value, z.value));
    function D(v) {
      return l.value && (v !== "approve" || F.value);
    }
    function L(v) {
      return typeof v == "string" ? v : void 0;
    }
    function H(v) {
      return typeof v == "number" ? v : void 0;
    }
    function j(v) {
      if (n.resolving || !D(v)) return;
      const B = { id: n.item.id, action: v };
      I.value.length && (B.form = { ...z.value }), i("resolve", B);
    }
    const P = ne(() => n.typeLabel || os(n.item.item_type));
    function V(v) {
      return v ? new Date(v * 1e3).toLocaleString() : "";
    }
    function W(v) {
      return cn(v, { maxUnit: "year" });
    }
    function Q(v) {
      return `kx-priority-${v === "urgent" || v === "high" || v === "low" ? v : "normal"}`;
    }
    function _(v) {
      return v === "urgent" ? "danger" : v === "high" ? "warn" : v === "low" ? "secondary" : "info";
    }
    function G(v) {
      const B = v.detail;
      B?.id && B?.action && i("resolve", B);
    }
    function oe() {
      a && (a.removeEventListener("inbox-resolve", G), a = null);
    }
    async function X() {
      if (!(!n.tag || !r.value)) {
        oe();
        try {
          await Qe(n.tag, { timeoutMs: 8e3 });
          const v = document.createElement(n.tag);
          v.style.display = "block", v.style.height = "100%", v.setAttribute("item-id", n.item.id), v.setAttribute("content", n.item.content || ""), n.item.metadata && v.setAttribute("data-meta", JSON.stringify(n.item.metadata)), v.addEventListener("inbox-resolve", G), r.value.innerHTML = "", r.value.appendChild(v), a = v;
        } catch {
          o.value = !0;
        }
      }
    }
    return Vn(() => {
      Qe("wc-render-markdown", { timeoutMs: 8e3 }).catch(() => {
      }), X();
    }), yt(oe), vt(() => [n.tag, n.item.id], () => {
      o.value = !1, X();
    }), (v, B) => (s(), u("div", cs, [
      m("header", ps, [
        m("div", {
          class: K(["kx-detail-icon", Q(e.item.priority)])
        }, [
          E(M(ye), {
            icon: e.icon || "tabler:inbox",
            "aria-hidden": "true"
          }, null, 8, ["icon"])
        ], 2),
        m("div", fs, [
          m("h2", hs, A(e.item.title), 1),
          m("div", bs, [
            E(M(Ge), {
              severity: _(e.item.priority),
              value: e.item.priority,
              class: "kx-pill kx-tag-sm"
            }, null, 8, ["severity", "value"]),
            m("span", null, A(P.value), 1),
            m("span", {
              title: V(e.item.created_at)
            }, A(W(e.item.created_at)), 9, ms),
            l.value ? $("", !0) : (s(), T(M(Ge), {
              key: 0,
              severity: "secondary",
              value: M(bt)(e.item.status),
              class: "kx-pill kx-tag-sm"
            }, null, 8, ["value"]))
          ])
        ])
      ]),
      m("div", gs, [
        e.tag && !o.value ? (s(), u("div", {
          key: 0,
          ref_key: "host",
          ref: r,
          class: "kx-wc-host"
        }, null, 512)) : f.value ? (s(), u("div", vs, [
          g.value ? (s(), u("wc-render-markdown", {
            key: 0,
            class: "kx-md",
            source: g.value
          }, null, 8, ys)) : $("", !0),
          k.value.kind === "text" ? (s(), u("wc-render-markdown", {
            key: 1,
            class: "kx-md",
            source: k.value.text
          }, null, 8, ks)) : k.value.kind === "rows" ? (s(), u("dl", ws, [
            (s(!0), u(U, null, re(k.value.rows, (y) => (s(), u("div", {
              key: y.key,
              class: "kx-field-row"
            }, [
              m("dt", null, A(y.label), 1),
              m("dd", {
                class: K({ "kx-field-long": y.long })
              }, A(y.value), 3)
            ]))), 128))
          ])) : e.item.content ? (s(), u("wc-render-markdown", {
            key: 3,
            class: "kx-md",
            source: e.item.content
          }, null, 8, xs)) : $("", !0),
          l.value ? I.value.length ? (s(), u("div", Cs, [
            (s(!0), u(U, null, re(I.value, (y) => (s(), u("div", {
              key: y.key,
              class: "kx-form-field"
            }, [
              y.type === "checkbox" ? (s(), u("div", Os, [
                E(M(Jt), {
                  modelValue: z.value[y.key],
                  "onUpdate:modelValue": (h) => z.value[y.key] = h,
                  binary: "",
                  "input-id": `kx-df-${y.key}`,
                  "data-testid": `decision-${y.key}`
                }, null, 8, ["modelValue", "onUpdate:modelValue", "input-id", "data-testid"]),
                m("label", {
                  for: `kx-df-${y.key}`
                }, [
                  de(A(y.label), 1),
                  y.required ? (s(), u("span", Ls, "*")) : $("", !0)
                ], 8, zs)
              ])) : (s(), u(U, { key: 1 }, [
                m("label", {
                  class: "kx-form-label",
                  for: `kx-df-${y.key}`
                }, [
                  de(A(y.label), 1),
                  y.required ? (s(), u("span", Bs, "*")) : $("", !0)
                ], 8, As),
                y.type === "text" ? (s(), T(M(Ye), {
                  key: 0,
                  id: `kx-df-${y.key}`,
                  "model-value": L(z.value[y.key]),
                  "data-testid": `decision-${y.key}`,
                  "onUpdate:modelValue": (h) => z.value[y.key] = h
                }, null, 8, ["id", "model-value", "data-testid", "onUpdate:modelValue"])) : y.type === "textarea" ? (s(), T(M(tn), {
                  key: 1,
                  id: `kx-df-${y.key}`,
                  "model-value": L(z.value[y.key]),
                  "data-testid": `decision-${y.key}`,
                  rows: "8",
                  "auto-resize": "",
                  "onUpdate:modelValue": (h) => z.value[y.key] = h
                }, null, 8, ["id", "model-value", "data-testid", "onUpdate:modelValue"])) : y.type === "number" ? (s(), T(M(en), {
                  key: 2,
                  "model-value": H(z.value[y.key]),
                  "input-id": `kx-df-${y.key}`,
                  "data-testid": `decision-${y.key}`,
                  "onUpdate:modelValue": (h) => z.value[y.key] = h
                }, null, 8, ["model-value", "input-id", "data-testid", "onUpdate:modelValue"])) : (s(), T(M(dn), {
                  key: 3,
                  modelValue: z.value[y.key],
                  "onUpdate:modelValue": (h) => z.value[y.key] = h,
                  options: y.options,
                  "input-id": `kx-df-${y.key}`,
                  "data-testid": `decision-${y.key}`,
                  placeholder: "Choose…"
                }, null, 8, ["modelValue", "onUpdate:modelValue", "options", "input-id", "data-testid"]))
              ], 64))
            ]))), 128)),
            F.value ? $("", !0) : (s(), u("p", Ps, "Fill in the required fields to approve."))
          ])) : $("", !0) : (s(), u("div", Is, [
            e.item.action ? (s(), u("p", $s, "Outcome: " + A(b(e.item.action)), 1)) : $("", !0),
            S.value.length ? (s(), u("dl", Ss, [
              (s(!0), u(U, null, re(S.value, (y) => (s(), u("div", {
                key: y.key,
                class: "kx-field-row"
              }, [
                m("dt", null, A(y.label), 1),
                m("dd", {
                  class: K({ "kx-field-long": y.long })
                }, A(y.value), 3)
              ]))), 128))
            ])) : $("", !0)
          ]))
        ])) : (s(), u("div", Ts, [
          e.item.content ? (s(), u("wc-render-markdown", {
            key: 0,
            class: "kx-md",
            source: e.item.content
          }, null, 8, Fs)) : $("", !0),
          x.value.length ? (s(), u("dl", Vs, [
            (s(!0), u(U, null, re(x.value, (y, h) => (s(), u("div", {
              key: h,
              class: "kx-field-row"
            }, [
              m("dt", null, A(y.label), 1),
              m("dd", null, A(y.value), 1)
            ]))), 128))
          ])) : $("", !0)
        ])),
        e.item.file_count || e.item.files?.length ? (s(), T(ns, {
          key: e.item.id,
          "item-id": e.item.id,
          files: e.item.files,
          count: e.item.file_count,
          version: e.item.file_version
        }, null, 8, ["item-id", "files", "count", "version"])) : $("", !0)
      ]),
      m("footer", Ms, [
        l.value && e.actionOwner !== "component" ? (s(!0), u(U, { key: 0 }, re(p.value, (y, h) => (s(), T(M(Ae), {
          key: y,
          type: "button",
          class: "kx-detail-action",
          "data-testid": "inbox-action",
          severity: h === 0 ? void 0 : "secondary",
          outlined: h !== 0,
          label: e.resolving && e.resolvingAction === y ? "Resolving…" : b(y),
          loading: e.resolving && e.resolvingAction === y,
          disabled: e.resolving || !D(y),
          onClick: (C) => j(y)
        }, null, 8, ["severity", "outlined", "label", "loading", "disabled", "onClick"]))), 128)) : l.value ? $("", !0) : (s(), u(U, { key: 1 }, [
          m("span", Ds, [
            de(A(M(bt)(e.item.status)), 1),
            e.item.resolved_at ? (s(), u("span", Es, " · " + A(V(e.item.resolved_at)), 1)) : $("", !0)
          ]),
          E(M(Ae), {
            class: "kx-detail-action",
            type: "button",
            "data-testid": "inbox-delete",
            label: "Delete",
            severity: "secondary",
            outlined: "",
            onClick: B[0] || (B[0] = (y) => i("delete", e.item.id))
          }, {
            icon: te(({ class: y }) => [
              E(M(ye), {
                icon: "tabler:trash",
                class: K(y)
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ], 64))
      ])
    ]));
  }
});
function we(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function js(e, t) {
  if (t == null) return t;
  switch (e) {
    case "boolean":
    case "checkbox":
      return typeof t == "boolean" ? t : t === "true" ? !0 : t === "false" ? !1 : t;
    case "number":
    case "integer": {
      if (typeof t == "number") return t;
      if (typeof t == "string" && t.trim() !== "") {
        const n = Number(t);
        if (!Number.isNaN(n)) return n;
      }
      return t;
    }
    case "object":
    case "array":
      if (typeof t == "string")
        try {
          const n = JSON.parse(t);
          if (n && typeof n == "object") return n;
        } catch {
        }
      return t;
    default:
      return t;
  }
}
function Ns(e, t) {
  if (!t) return e;
  const n = {};
  for (const [i, r] of Object.entries(e))
    n[i] = js(t[i], r);
  return n;
}
function Ks(e, t, n) {
  if (t !== void 0 && !t) return null;
  const i = we(e) ? e : {}, r = [
    i,
    we(i.data) ? i.data : null,
    we(i.payload) ? i.payload : null,
    we(i.detail) ? i.detail : null
  ].filter(Boolean);
  for (const o of r) {
    if (o.event !== "component.meta.changed" && o.event !== "component.deleting" && o.event !== "component.deleted") continue;
    const a = String(o.component_id || ""), l = String(i.topic || o.topic || "");
    if (t === void 0) {
      if (!a && (!l.startsWith("component.") || l === "component.")) continue;
    } else if (a && a !== t || !a && l !== `component.${t}`) continue;
    const d = a || t || l.slice(10);
    return o.event === "component.deleting" && typeof o.deletion_job_id == "string" && o.deletion_job_id ? { event: o.event, component_id: d, deletion_job_id: o.deletion_job_id } : o.event !== "component.meta.changed" ? { event: o.event, component_id: d } : {
      event: "component.meta.changed",
      component_id: d,
      meta: Ns(we(o.meta) ? o.meta : {}, n),
      deleted: Array.isArray(o.deleted) ? o.deleted.map(String) : []
    };
  }
  return null;
}
function Rs(e, t, n) {
  const i = Ks(e, t, n);
  return i?.event === "component.meta.changed" ? i : null;
}
function Us(e, t, n) {
  if (!e) return null;
  const i = Mn(`component.${e}`, (r) => {
    const o = Rs(r, e, n);
    o && t(o);
  });
  return typeof i == "function" ? i : null;
}
const jt = /^[ \t]*(?:>[ \t]?|#{1,6}(?=[ \t]|$)[ \t]*|[-*+][ \t]+|\d{1,9}[.)][ \t]+)/;
function Hs(e) {
  let t = e;
  for (let n = t.replace(jt, ""); n !== t; n = t.replace(jt, "")) t = n;
  return t.replace(/\s+/g, " ").trim();
}
function Ws(e) {
  if (!e) return "";
  for (const t of e.split(/\r?\n/)) {
    const n = Hs(t);
    if (n) return n;
  }
  return "";
}
const Gs = { class: "kx-inbox" }, qs = { class: "kx-head-bar" }, Zs = { class: "kx-head-row" }, Ys = { class: "kx-head-icon" }, Js = { class: "kx-head-text" }, Qs = { class: "kx-sub" }, Xs = { class: "kx-shell" }, el = { class: "kx-list-pane" }, tl = {
  key: 0,
  class: "kx-loading"
}, nl = {
  key: 1,
  class: "kx-list-empty"
}, il = ["onClick"], ol = { class: "kx-item-main" }, rl = { class: "kx-item-line" }, al = ["title"], sl = {
  key: 0,
  class: "kx-preview"
}, ll = { class: "kx-detail-pane" }, ul = {
  key: 0,
  class: "kx-detail-empty"
}, dl = {
  key: 1,
  class: "kx-detail-card"
}, cl = /* @__PURE__ */ gt({
  __name: "inbox",
  setup(e) {
    const t = [
      { key: "pending", label: "Pending", icon: "tabler:clock" },
      { key: "resolved", label: "Resolved", icon: "tabler:checks" },
      { key: "all", label: "All", icon: "tabler:inbox" }
    ], n = N([]), i = N({}), r = N(0), o = N({}), a = N(!0), l = N(""), d = N("pending"), p = N(""), b = N(""), x = N("");
    let f = null, g = "", k = 0, I = !1;
    const S = /* @__PURE__ */ new Map();
    let z = 0;
    const F = ne(() => n.value.find((h) => h.id === p.value) || null), D = ne(() => new Map(n.value.map((h) => [h.id, Ws(h.content)]))), L = (h) => o.value[h], H = (h, C) => Object.prototype.hasOwnProperty.call(h, C), j = ne(() => d.value === "pending" ? Number(i.value.pending_count ?? r.value ?? n.value.length) : d.value === "resolved" ? Number(i.value.resolved_count ?? r.value ?? n.value.length) : d.value === "all" ? Number(i.value.item_count ?? r.value ?? n.value.length) : Number(r.value || n.value.length));
    function P(h) {
      return `kx-priority-${h === "urgent" || h === "high" || h === "low" ? h : "normal"}`;
    }
    function V(h) {
      const C = {};
      for (const w of Object.keys(Dt)) {
        const Y = h[w];
        H(h, w) && typeof Y == "number" && (C[w] = Y);
      }
      Object.keys(C).length && (i.value = { ...i.value, ...C });
    }
    function W(h) {
      return cn(h, { suffix: !1 });
    }
    function Q(h) {
      return h ? new Date(h * 1e3).toLocaleString() : "";
    }
    async function _() {
      try {
        const { data: h } = await xe.get("/api/v1/inbox/item-types"), C = {};
        if (he(h) && Array.isArray(h.item_types))
          for (const w of h.item_types)
            he(w) && typeof w.value == "string" && typeof w.name == "string" && (w.icon === void 0 || typeof w.icon == "string") && (w.component_tag === void 0 || typeof w.component_tag == "string") && (w.actions === void 0 || Array.isArray(w.actions) && w.actions.every((Y) => typeof Y == "string")) && (w.action_owner === void 0 || w.action_owner === "component") && (C[w.value] = { value: w.value, name: w.name, icon: w.icon, component_tag: w.component_tag, actions: w.actions, action_owner: w.action_owner });
        o.value = C;
      } catch (h) {
        l.value = Ie(h, "Could not load inbox item types.");
      }
    }
    function G(h) {
      return d.value === "all" || (d.value === "resolved" ? h.status !== "pending" : h.status === d.value);
    }
    function oe(h, C, w, Y = !0) {
      if (Y)
        for (const q of h)
          q.status !== "pending" && S.delete(q.id);
      S.size || (z = 0);
      const je = new Map(h.map((q) => [q.id, q]));
      for (const q of S.values()) {
        const Ne = je.has(q.id);
        G(q) ? (je.set(q.id, q), Ne || (w += 1)) : je.delete(q.id) && (w -= 1);
      }
      const xt = { urgent: 4, high: 3, normal: 2, low: 1 };
      n.value = [...je.values()].sort((q, Ne) => (xt[Ne.priority] || 0) - (xt[q.priority] || 0) || (Ne.created_at || 0) - (q.created_at || 0));
      const It = Math.min(C.item_count || 0, Math.max(C.resolved_count || 0, z));
      i.value = { ...C, resolved_count: It, pending_count: (C.item_count || 0) - It }, r.value = w, n.value.some((q) => q.id === p.value) || (p.value = n.value[0]?.id || "");
    }
    async function X() {
      if (I) return;
      const h = ++k;
      l.value = "";
      try {
        const { data: C } = await xe.get("/api/v1/inbox?status=" + encodeURIComponent(d.value));
        if (h !== k || I) return;
        if (!he(C) || !Array.isArray(C.items) || !C.items.every(ht))
          throw new Error("Invalid inbox list response.");
        if (typeof C.component_id == "string" && y(C.component_id)) {
          await X();
          return;
        }
        oe(C.items, {
          item_count: Number(C.item_count ?? 0),
          pending_count: Number(C.pending_count ?? 0),
          resolved_count: Number(C.resolved_count ?? 0),
          urgent_count: Number(C.urgent_count ?? 0),
          high_count: Number(C.high_count ?? 0)
        }, Number(C.total_count ?? C.items.length));
      } catch (C) {
        h === k && !I && (l.value = Ie(C, "Could not load the inbox."));
      } finally {
        h === k && !I && (a.value = !1);
      }
    }
    vt(d, () => {
      p.value = "", X();
    });
    async function v(h) {
      l.value = "", b.value = h.id, x.value = h.action;
      const C = i.value.resolved_count || 0;
      try {
        const w = h.form ? { form: h.form } : void 0, { data: Y } = await xe.post(`/api/v1/inbox/${encodeURIComponent(h.id)}/${encodeURIComponent(h.action)}`, w);
        if (I) return;
        if (!he(Y) || Y.success !== !0 || !ht(Y.item) || Y.item.id !== h.id || Y.item.status === "pending" || Y.item.action !== h.action)
          throw new Error("Invalid inbox resolution response.");
        ++k, S.set(h.id, Y.item), z = Math.max(z + 1, C + 1), oe(n.value, i.value, r.value, !1), await X();
      } catch (w) {
        l.value = Ie(w, "Could not resolve this item.");
      } finally {
        b.value = "", x.value = "";
      }
    }
    async function B(h) {
      l.value = "";
      try {
        await xe.delete(`/api/v1/inbox/${encodeURIComponent(h)}`), S.delete(h), S.size || (z = 0), p.value === h && (p.value = ""), await X();
      } catch (C) {
        l.value = Ie(C, "Could not delete this item.");
      }
    }
    function y(h) {
      if (!h || g === h) return !1;
      if (f && f(), f = null, g = "", f = Us(h, (C) => {
        V(C.meta), X();
      }, Dt), !f) throw new Error("Could not subscribe to the inbox.");
      return g = h, !0;
    }
    return Ln(async () => {
      await Promise.all([_(), X()]);
    }), yt(() => {
      I = !0, ++k, S.clear(), f && f(), f = null, g = "";
    }), (h, C) => (s(), u("div", Gs, [
      m("header", qs, [
        m("div", Zs, [
          m("div", Ys, [
            E(M(ye), {
              icon: "tabler:inbox",
              "aria-hidden": "true"
            })
          ]),
          m("div", Js, [
            C[1] || (C[1] = m("h1", { class: "kx-title" }, "Inbox", -1)),
            m("p", Qs, A(j.value) + " " + A(d.value) + " · live", 1)
          ])
        ]),
        E(M(Gt), {
          value: d.value,
          "data-kx-separator": "surface",
          "onUpdate:value": C[0] || (C[0] = (w) => d.value = String(w))
        }, {
          default: te(() => [
            E(M(Wt), {
              "aria-label": "Inbox folders",
              pt: { tabList: { class: "kx-tabs-list" } }
            }, {
              default: te(() => [
                (s(), u(U, null, re(t, (w) => E(M(Rt), {
                  class: "kx-tab",
                  key: w.key,
                  value: w.key,
                  "data-testid": `inbox-tab-${w.key}`
                }, {
                  default: te(() => [
                    E(M(ye), {
                      icon: w.icon,
                      "aria-hidden": "true"
                    }, null, 8, ["icon"]),
                    de(" " + A(w.label), 1)
                  ]),
                  _: 2
                }, 1032, ["value", "data-testid"])), 64))
              ]),
              _: 1
            })
          ]),
          _: 1
        }, 8, ["value"])
      ]),
      l.value ? (s(), T(M(qt), {
        key: 0,
        severity: "error",
        class: "kx-alert"
      }, {
        default: te(() => [
          de(A(l.value), 1)
        ]),
        _: 1
      })) : $("", !0),
      m("main", Xs, [
        m("aside", el, [
          a.value ? (s(), u("div", tl, "Loading...")) : n.value.length ? $("", !0) : (s(), u("div", nl, A(d.value === "pending" ? "Inbox zero — nothing to review." : "Nothing here."), 1)),
          (s(!0), u(U, null, re(n.value, (w) => (s(), u("button", {
            key: w.id,
            class: K(["kx-item", { active: p.value === w.id }]),
            onClick: (Y) => p.value = w.id
          }, [
            m("span", {
              class: K(["kx-priority-dot", P(w.priority)])
            }, null, 2),
            m("div", ol, [
              m("div", rl, [
                m("span", {
                  class: K(["kx-item-title", { pending: w.status === "pending" }])
                }, A(w.title), 3),
                m("span", {
                  class: "kx-time",
                  title: Q(w.created_at)
                }, A(W(w.created_at)), 9, al)
              ]),
              D.value.get(w.id) ? (s(), u("span", sl, A(D.value.get(w.id)), 1)) : $("", !0),
              w.status !== "pending" ? (s(), T(M(Ge), {
                key: 1,
                severity: "secondary",
                value: M(bt)(w.status),
                class: "kx-status kx-tag-sm"
              }, null, 8, ["value"])) : $("", !0)
            ])
          ], 10, il))), 128))
        ]),
        m("section", ll, [
          F.value ? (s(), u("div", dl, [
            (s(), T(_s, {
              key: F.value.id,
              item: F.value,
              tag: L(F.value.item_type)?.component_tag,
              icon: L(F.value.item_type)?.icon,
              "type-label": L(F.value.item_type)?.name,
              actions: L(F.value.item_type)?.actions,
              "action-owner": L(F.value.item_type)?.action_owner,
              resolving: b.value === F.value.id,
              "resolving-action": x.value,
              onResolve: v,
              onDelete: B
            }, null, 8, ["item", "tag", "icon", "type-label", "actions", "action-owner", "resolving", "resolving-action"]))
          ])) : (s(), u("div", ul, " Select an item to view it. "))
        ])
      ])
    ]));
  }
}), ml = {
  rootComponent: cl,
  plugins: [An]
};
export {
  ml as mountConfig
};
//# sourceMappingURL=lazy-mount-BkpR4PNZ.js.map
