import { reactive as mt, ref as gt, watch as de, renderSlot as S, openBlock as f, createBlock as j, Teleport as Qe, createCommentVNode as P, h as yt, createElementBlock as m, mergeProps as c, createElementVNode as k, resolveComponent as D, Fragment as Q, renderList as Oe, createVNode as W, resolveDirective as vt, createTextVNode as be, toDisplayString as H, normalizeClass as ce, resolveDynamicComponent as Ee, withCtx as _, Transition as bt, normalizeProps as St, createSlots as wt, withDirectives as Ot, withModifiers as It } from "vue";
import { k as Ze, X as F, p as U, H as Ct, N as Je, P as pe, S as Se, B as M, t as Lt, A as Tt, c as kt, d as le, a as ye, s as q, f as te, b as Xe, z as et, e as he, g as J, T as X, R as At, M as Ve, h as $t, i as R, Y as xt, I as Ft, v as zt, D as Pt, j as Mt, L as Et, m as Vt, $ as Dt, J as Nt } from "./index-nfQnU_Pv.js";
function Rt() {
  let t = [], e = (s, a, l = 999) => {
    let u = o(s, a, l), d = u.value + (u.key === s ? 0 : l) + 1;
    return t.push({ key: s, value: d }), d;
  }, n = (s) => {
    t = t.filter((a) => a.value !== s);
  }, i = (s, a) => o(s).value, o = (s, a, l = 0) => [...t].reverse().find((u) => !0) || { key: s, value: l }, r = (s) => s && parseInt(s.style.zIndex, 10) || 0;
  return { get: r, set: (s, a, l) => {
    a && (a.style.zIndex = String(e(s, !0, l)));
  }, clear: (s) => {
    s && (n(r(s)), s.style.zIndex = "");
  }, getCurrent: (s) => i(s) };
}
var we = Rt(), T = {
  STARTS_WITH: "startsWith",
  CONTAINS: "contains",
  NOT_CONTAINS: "notContains",
  ENDS_WITH: "endsWith",
  EQUALS: "equals",
  NOT_EQUALS: "notEquals",
  LESS_THAN: "lt",
  LESS_THAN_OR_EQUAL_TO: "lte",
  GREATER_THAN: "gt",
  GREATER_THAN_OR_EQUAL_TO: "gte",
  DATE_IS: "dateIs",
  DATE_IS_NOT: "dateIsNot",
  DATE_BEFORE: "dateBefore",
  DATE_AFTER: "dateAfter"
};
function De(t, e) {
  var n = typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (!n) {
    if (Array.isArray(t) || (n = Bt(t)) || e) {
      n && (t = n);
      var i = 0, o = function() {
      };
      return { s: o, n: function() {
        return i >= t.length ? { done: !0 } : { done: !1, value: t[i++] };
      }, e: function(u) {
        throw u;
      }, f: o };
    }
    throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }
  var r, s = !0, a = !1;
  return { s: function() {
    n = n.call(t);
  }, n: function() {
    var u = n.next();
    return s = u.done, u;
  }, e: function(u) {
    a = !0, r = u;
  }, f: function() {
    try {
      s || n.return == null || n.return();
    } finally {
      if (a) throw r;
    }
  } };
}
function Bt(t, e) {
  if (t) {
    if (typeof t == "string") return Ne(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ne(t, e) : void 0;
  }
}
function Ne(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, i = Array(e); n < e; n++) i[n] = t[n];
  return i;
}
var Ht = {
  filter: function(e, n, i, o, r) {
    var s = [];
    if (!e)
      return s;
    var a = De(e), l;
    try {
      for (a.s(); !(l = a.n()).done; ) {
        var u = l.value;
        if (typeof u == "string") {
          if (this.filters[o](u, i, r)) {
            s.push(u);
            continue;
          }
        } else {
          var d = De(n), p;
          try {
            for (d.s(); !(p = d.n()).done; ) {
              var h = p.value, O = U(u, h);
              if (this.filters[o](O, i, r)) {
                s.push(u);
                break;
              }
            }
          } catch (y) {
            d.e(y);
          } finally {
            d.f();
          }
        }
      }
    } catch (y) {
      a.e(y);
    } finally {
      a.f();
    }
    return s;
  },
  filters: {
    startsWith: function(e, n, i) {
      if (n == null || n === "")
        return !0;
      if (e == null)
        return !1;
      var o = F(n.toString()).toLocaleLowerCase(i), r = F(e.toString()).toLocaleLowerCase(i);
      return r.slice(0, o.length) === o;
    },
    contains: function(e, n, i) {
      if (n == null || n === "")
        return !0;
      if (e == null)
        return !1;
      var o = F(n.toString()).toLocaleLowerCase(i), r = F(e.toString()).toLocaleLowerCase(i);
      return r.indexOf(o) !== -1;
    },
    notContains: function(e, n, i) {
      if (n == null || n === "")
        return !0;
      if (e == null)
        return !1;
      var o = F(n.toString()).toLocaleLowerCase(i), r = F(e.toString()).toLocaleLowerCase(i);
      return r.indexOf(o) === -1;
    },
    endsWith: function(e, n, i) {
      if (n == null || n === "")
        return !0;
      if (e == null)
        return !1;
      var o = F(n.toString()).toLocaleLowerCase(i), r = F(e.toString()).toLocaleLowerCase(i);
      return r.indexOf(o, r.length - o.length) !== -1;
    },
    equals: function(e, n, i) {
      return n == null || n === "" ? !0 : e == null ? !1 : e.getTime && n.getTime ? e.getTime() === n.getTime() : F(e.toString()).toLocaleLowerCase(i) == F(n.toString()).toLocaleLowerCase(i);
    },
    notEquals: function(e, n, i) {
      return n == null || n === "" ? !1 : e == null ? !0 : e.getTime && n.getTime ? e.getTime() !== n.getTime() : F(e.toString()).toLocaleLowerCase(i) != F(n.toString()).toLocaleLowerCase(i);
    },
    in: function(e, n) {
      if (n == null || n.length === 0)
        return !0;
      for (var i = 0; i < n.length; i++)
        if (Ze(e, n[i]))
          return !0;
      return !1;
    },
    between: function(e, n) {
      return n == null || n[0] == null || n[1] == null ? !0 : e == null ? !1 : e.getTime ? n[0].getTime() <= e.getTime() && e.getTime() <= n[1].getTime() : n[0] <= e && e <= n[1];
    },
    lt: function(e, n) {
      return n == null ? !0 : e == null ? !1 : e.getTime && n.getTime ? e.getTime() < n.getTime() : e < n;
    },
    lte: function(e, n) {
      return n == null ? !0 : e == null ? !1 : e.getTime && n.getTime ? e.getTime() <= n.getTime() : e <= n;
    },
    gt: function(e, n) {
      return n == null ? !0 : e == null ? !1 : e.getTime && n.getTime ? e.getTime() > n.getTime() : e > n;
    },
    gte: function(e, n) {
      return n == null ? !0 : e == null ? !1 : e.getTime && n.getTime ? e.getTime() >= n.getTime() : e >= n;
    },
    dateIs: function(e, n) {
      return n == null ? !0 : e == null ? !1 : (typeof e == "string" && (e = new Date(e)), typeof n == "string" && (n = new Date(n)), e.toDateString() === n.toDateString());
    },
    dateIsNot: function(e, n) {
      return n == null ? !0 : e == null ? !1 : (typeof e == "string" && (e = new Date(e)), typeof n == "string" && (n = new Date(n)), e.toDateString() !== n.toDateString());
    },
    dateBefore: function(e, n) {
      return n == null ? !0 : e == null ? !1 : (typeof e == "string" && (e = new Date(e)), typeof n == "string" && (n = new Date(n)), e.getTime() < n.getTime());
    },
    dateAfter: function(e, n) {
      return n == null ? !0 : e == null ? !1 : (typeof e == "string" && (e = new Date(e)), typeof n == "string" && (n = new Date(n)), e.getTime() > n.getTime());
    }
  },
  register: function(e, n) {
    this.filters[e] = n;
  }
};
function ne(t) {
  "@babel/helpers - typeof";
  return ne = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, ne(t);
}
function Re(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(t);
    e && (i = i.filter(function(o) {
      return Object.getOwnPropertyDescriptor(t, o).enumerable;
    })), n.push.apply(n, i);
  }
  return n;
}
function fe(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Re(Object(n), !0).forEach(function(i) {
      Kt(t, i, n[i]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Re(Object(n)).forEach(function(i) {
      Object.defineProperty(t, i, Object.getOwnPropertyDescriptor(n, i));
    });
  }
  return t;
}
function Kt(t, e, n) {
  return (e = jt(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function jt(t) {
  var e = Wt(t, "string");
  return ne(e) == "symbol" ? e : e + "";
}
function Wt(t, e) {
  if (ne(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(t, e);
    if (ne(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Ut = {
  ripple: !1,
  inputStyle: null,
  inputVariant: null,
  locale: {
    startsWith: "Starts with",
    contains: "Contains",
    notContains: "Not contains",
    endsWith: "Ends with",
    equals: "Equals",
    notEquals: "Not equals",
    noFilter: "No Filter",
    lt: "Less than",
    lte: "Less than or equal to",
    gt: "Greater than",
    gte: "Greater than or equal to",
    dateIs: "Date is",
    dateIsNot: "Date is not",
    dateBefore: "Date is before",
    dateAfter: "Date is after",
    clear: "Clear",
    apply: "Apply",
    matchAll: "Match All",
    matchAny: "Match Any",
    addRule: "Add Rule",
    removeRule: "Remove Rule",
    accept: "Yes",
    reject: "No",
    choose: "Choose",
    upload: "Upload",
    cancel: "Cancel",
    completed: "Completed",
    pending: "Pending",
    fileSizeTypes: ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
    dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    dayNamesShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    dayNamesMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    monthNamesShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    chooseYear: "Choose Year",
    chooseMonth: "Choose Month",
    chooseDate: "Choose Date",
    prevDecade: "Previous Decade",
    nextDecade: "Next Decade",
    prevYear: "Previous Year",
    nextYear: "Next Year",
    prevMonth: "Previous Month",
    nextMonth: "Next Month",
    prevHour: "Previous Hour",
    nextHour: "Next Hour",
    prevMinute: "Previous Minute",
    nextMinute: "Next Minute",
    prevSecond: "Previous Second",
    nextSecond: "Next Second",
    am: "am",
    pm: "pm",
    today: "Today",
    weekHeader: "Wk",
    firstDayOfWeek: 0,
    showMonthAfterYear: !1,
    dateFormat: "mm/dd/yy",
    weak: "Weak",
    medium: "Medium",
    strong: "Strong",
    passwordPrompt: "Enter a password",
    emptyFilterMessage: "No results found",
    searchMessage: "{0} results are available",
    selectionMessage: "{0} items selected",
    emptySelectionMessage: "No selected item",
    emptySearchMessage: "No results found",
    fileChosenMessage: "{0} files",
    noFileChosenMessage: "No file chosen",
    emptyMessage: "No available options",
    aria: {
      trueLabel: "True",
      falseLabel: "False",
      nullLabel: "Not Selected",
      star: "1 star",
      stars: "{star} stars",
      selectAll: "All items selected",
      unselectAll: "All items unselected",
      close: "Close",
      previous: "Previous",
      next: "Next",
      navigation: "Navigation",
      scrollTop: "Scroll Top",
      moveTop: "Move Top",
      moveUp: "Move Up",
      moveDown: "Move Down",
      moveBottom: "Move Bottom",
      moveToTarget: "Move to Target",
      moveToSource: "Move to Source",
      moveAllToTarget: "Move All to Target",
      moveAllToSource: "Move All to Source",
      pageLabel: "Page {page}",
      firstPageLabel: "First Page",
      lastPageLabel: "Last Page",
      nextPageLabel: "Next Page",
      prevPageLabel: "Previous Page",
      rowsPerPageLabel: "Rows per page",
      jumpToPageDropdownLabel: "Jump to Page Dropdown",
      jumpToPageInputLabel: "Jump to Page Input",
      selectRow: "Row Selected",
      unselectRow: "Row Unselected",
      expandRow: "Row Expanded",
      collapseRow: "Row Collapsed",
      showFilterMenu: "Show Filter Menu",
      hideFilterMenu: "Hide Filter Menu",
      filterOperator: "Filter Operator",
      filterConstraint: "Filter Constraint",
      editRow: "Row Edit",
      saveEdit: "Save Edit",
      cancelEdit: "Cancel Edit",
      listView: "List View",
      gridView: "Grid View",
      slide: "Slide",
      slideNumber: "{slideNumber}",
      zoomImage: "Zoom Image",
      zoomIn: "Zoom In",
      zoomOut: "Zoom Out",
      rotateRight: "Rotate Right",
      rotateLeft: "Rotate Left",
      listLabel: "Option List"
    }
  },
  filterMatchModeOptions: {
    text: [T.STARTS_WITH, T.CONTAINS, T.NOT_CONTAINS, T.ENDS_WITH, T.EQUALS, T.NOT_EQUALS],
    numeric: [T.EQUALS, T.NOT_EQUALS, T.LESS_THAN, T.LESS_THAN_OR_EQUAL_TO, T.GREATER_THAN, T.GREATER_THAN_OR_EQUAL_TO],
    date: [T.DATE_IS, T.DATE_IS_NOT, T.DATE_BEFORE, T.DATE_AFTER]
  },
  zIndex: {
    modal: 1100,
    overlay: 1e3,
    menu: 1e3,
    tooltip: 1100
  },
  theme: void 0,
  unstyled: !1,
  pt: void 0,
  ptOptions: {
    mergeSections: !0,
    mergeProps: !1
  },
  csp: {
    nonce: void 0
  }
}, Gt = Symbol();
function _t(t, e) {
  var n = {
    config: mt(e)
  };
  return t.config.globalProperties.$primevue = n, t.provide(Gt, n), qt(), Yt(t, n), n;
}
var Y = [];
function qt() {
  Je.clear(), Y.forEach(function(t) {
    return t?.();
  }), Y = [];
}
function Yt(t, e) {
  var n = gt(!1), i = function() {
    var u;
    if (((u = e.config) === null || u === void 0 ? void 0 : u.theme) !== "none" && !Se.isStyleNameLoaded("common")) {
      var d, p, h = ((d = M.getCommonTheme) === null || d === void 0 ? void 0 : d.call(M)) || {}, O = h.primitive, y = h.semantic, I = h.global, v = h.style, C = {
        nonce: (p = e.config) === null || p === void 0 || (p = p.csp) === null || p === void 0 ? void 0 : p.nonce
      };
      M.load(O?.css, fe({
        name: "primitive-variables"
      }, C)), M.load(y?.css, fe({
        name: "semantic-variables"
      }, C)), M.load(I?.css, fe({
        name: "global-variables"
      }, C)), M.loadStyle(fe({
        name: "global-style"
      }, C), v), Se.setLoadedStyleName("common");
    }
  };
  Je.on("theme:change", function(l) {
    n.value || (t.config.globalProperties.$primevue.config.theme = l, n.value = !0);
  });
  var o = de(e.config, function(l, u) {
    pe.emit("config:change", {
      newValue: l,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), r = de(function() {
    return e.config.ripple;
  }, function(l, u) {
    pe.emit("config:ripple:change", {
      newValue: l,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), s = de(function() {
    return e.config.theme;
  }, function(l, u) {
    n.value || Se.setTheme(l), e.config.unstyled || i(), n.value = !1, pe.emit("config:theme:change", {
      newValue: l,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !1
  }), a = de(function() {
    return e.config.unstyled;
  }, function(l, u) {
    !l && e.config.theme && i(), pe.emit("config:unstyled:change", {
      newValue: l,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  });
  Y.push(o), Y.push(r), Y.push(s), Y.push(a);
}
var Qt = {
  install: function(e, n) {
    var i = Ct(Ut, n);
    _t(e, i);
  }
}, Fe = {
  name: "Portal",
  props: {
    appendTo: {
      type: [String, Object],
      default: "body"
    },
    disabled: {
      type: Boolean,
      default: !1
    }
  },
  data: function() {
    return {
      mounted: !1
    };
  },
  mounted: function() {
    this.mounted = Lt();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function Zt(t, e, n, i, o, r) {
  return r.inline ? S(t.$slots, "default", {
    key: 0
  }) : o.mounted ? (f(), j(Qe, {
    key: 1,
    to: n.appendTo
  }, [S(t.$slots, "default")], 8, ["to"])) : P("", !0);
}
Fe.render = Zt;
function ie(t) {
  "@babel/helpers - typeof";
  return ie = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, ie(t);
}
function Jt(t, e) {
  if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function");
}
function Xt(t, e) {
  for (var n = 0; n < e.length; n++) {
    var i = e[n];
    i.enumerable = i.enumerable || !1, i.configurable = !0, "value" in i && (i.writable = !0), Object.defineProperty(t, tn(i.key), i);
  }
}
function en(t, e, n) {
  return e && Xt(t.prototype, e), Object.defineProperty(t, "prototype", { writable: !1 }), t;
}
function tn(t) {
  var e = nn(t, "string");
  return ie(e) == "symbol" ? e : e + "";
}
function nn(t, e) {
  if (ie(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(t, e);
    if (ie(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return String(t);
}
var rn = /* @__PURE__ */ (function() {
  function t(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : function() {
    };
    Jt(this, t), this.element = e, this.listener = n;
  }
  return en(t, [{
    key: "bindScrollListener",
    value: function() {
      this.scrollableParents = Tt(this.element);
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
})(), on = kt();
const sn = "data-wippy-overlay-layer";
function tt() {
  return typeof window < "u" && typeof window.document < "u";
}
function nt() {
  return tt() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function ln() {
  return nt() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const an = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let un = 0;
const me = /* @__PURE__ */ new WeakMap();
function Be(t, e) {
  const n = t.style;
  n.setProperty("position", "fixed", "important"), n.setProperty("inset", "auto", "important"), n.setProperty("margin", "0", "important"), n.setProperty("position-anchor", e), n.setProperty("position-area", "bottom span-right"), n.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), n.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), n.setProperty("max-width", "stretch", "important");
}
function dn(t, e) {
  if (!an.test(t.className))
    return;
  const n = t.style.cssText;
  Be(t, e), t.getAttribute("popover") !== "manual" && t.setAttribute("popover", "manual");
  try {
    t.matches(":popover-open") || t.showPopover();
  } catch {
  }
  if (!t.matches(":popover-open")) {
    t.removeAttribute("popover"), t.style.cssText = n;
    return;
  }
  if (!me.has(t)) {
    const i = new MutationObserver(() => {
      const o = t.style;
      (o.top !== "auto" || o.left !== "auto" || o.margin !== "0px" || o.getPropertyPriority("top") !== "important" || o.getPropertyPriority("left") !== "important" || o.getPropertyPriority("margin") !== "important" || o.getPropertyPriority("min-width") !== "important" || o.maxWidth !== "stretch" || o.getPropertyPriority("max-width") !== "important") && Be(t, e);
    });
    i.observe(t, { attributes: !0, attributeFilter: ["style"] }), me.set(t, i);
  }
}
function ze(t) {
  const e = me.get(t);
  e && (e.disconnect(), me.delete(t));
}
function cn(t) {
  const e = t && typeof t.getRootNode == "function" ? t.getRootNode() : null;
  return e instanceof ShadowRoot ? e : null;
}
function Ie(t) {
  t.style.top = "0px", t.style.left = "0px";
  const e = t.getBoundingClientRect();
  t.style.top = `${-window.scrollY - e.top}px`, t.style.left = `${-window.scrollX - e.left}px`;
}
const ge = /* @__PURE__ */ new Set(), Pe = /* @__PURE__ */ new WeakMap();
let He = !1, Ce = !1;
function pn() {
  Ce = !1;
  for (const t of ge) {
    if (!t.isConnected) {
      for (const e of Array.from(t.children))
        e instanceof HTMLElement && ze(e);
      ge.delete(t), Pe.get(t)?.disconnect();
      continue;
    }
    t.childElementCount > 0 && Ie(t);
  }
}
function Ke() {
  Ce || (Ce = !0, requestAnimationFrame(pn));
}
function fn(t) {
  const e = document.createElement("div");
  e.setAttribute(sn, "");
  const n = nt();
  if (e.style.cssText = n ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", n && e.setAttribute("popover", "manual"), t.appendChild(e), n) {
    try {
      e.showPopover();
    } catch {
    }
    e.matches(":popover-open") || (e.removeAttribute("popover"), e.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  Ie(e);
  const i = new MutationObserver((o) => {
    const r = e.__wippyAnchorName;
    for (const s of o) {
      if (r)
        for (const a of Array.from(s.addedNodes))
          a instanceof HTMLElement && dn(a, r);
      for (const a of Array.from(s.removedNodes))
        a instanceof HTMLElement && ze(a);
    }
    e.isConnected && e.childElementCount > 0 && Ie(e);
  });
  return i.observe(e, { childList: !0 }), Pe.set(e, i), ge.add(e), He || (He = !0, window.addEventListener("scroll", Ke, { capture: !0, passive: !0 }), window.addEventListener("resize", Ke, { passive: !0 })), e;
}
function je(t) {
  if (!(!t.hostRoot || t.layer) && (t.layer = fn(t.hostRoot), ln())) {
    const e = t.$el ? t.$el.parentElement : null;
    e && (t.anchorName = `--wippy-a-${++un}`, t.anchorTrigger = e, e.style.setProperty("anchor-name", t.anchorName), t.layer.__wippyAnchorName = t.anchorName);
  }
}
function We(t) {
  if (t.anchorTrigger && (t.anchorTrigger.style.removeProperty("anchor-name"), t.anchorTrigger = null), t.anchorName = null, t.layer) {
    for (const e of Array.from(t.layer.children))
      e instanceof HTMLElement && ze(e);
    ge.delete(t.layer), Pe.get(t.layer)?.disconnect(), t.layer.remove(), t.layer = null;
  }
}
let Ue = !1;
function hn() {
  if (Ue)
    return;
  Ue = !0;
  const t = Fe;
  t.computed = t.computed || {}, t.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, t.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, t.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, t.mounted = function() {
    tt() && (this.hostRoot = cn(this.$el), this.mounted = !0, this.hostRoot && (this.inline || je(this), this.$watch("inline", (e) => {
      e ? We(this) : je(this);
    })));
  }, t.render = function() {
    return this.inline ? S(this.$slots, "default", { key: 0 }) : this.mounted ? yt(Qe, { key: 1, to: this.resolvedTarget || document.body }, [
      S(this.$slots, "default")
    ]) : P("", !0);
  }, t.unmounted = function() {
    We(this);
  };
}
const Ri = {
  install: (t) => {
    hn(), t.use(Qt, { theme: "none" });
  }
};
var it = {
  name: "BlankIcon",
  extends: le
};
function mn(t) {
  return bn(t) || vn(t) || yn(t) || gn();
}
function gn() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function yn(t, e) {
  if (t) {
    if (typeof t == "string") return Le(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Le(t, e) : void 0;
  }
}
function vn(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function bn(t) {
  if (Array.isArray(t)) return Le(t);
}
function Le(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, i = Array(e); n < e; n++) i[n] = t[n];
  return i;
}
function Sn(t, e, n, i, o, r) {
  return f(), m("svg", c({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), mn(e[0] || (e[0] = [k("rect", {
    width: "1",
    height: "1",
    fill: "currentColor",
    "fill-opacity": "0"
  }, null, -1)])), 16);
}
it.render = Sn;
var rt = {
  name: "CheckIcon",
  extends: le
};
function wn(t) {
  return Ln(t) || Cn(t) || In(t) || On();
}
function On() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function In(t, e) {
  if (t) {
    if (typeof t == "string") return Te(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Te(t, e) : void 0;
  }
}
function Cn(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Ln(t) {
  if (Array.isArray(t)) return Te(t);
}
function Te(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, i = Array(e); n < e; n++) i[n] = t[n];
  return i;
}
function Tn(t, e, n, i, o, r) {
  return f(), m("svg", c({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), wn(e[0] || (e[0] = [k("path", {
    d: "M4.86199 11.5948C4.78717 11.5923 4.71366 11.5745 4.64596 11.5426C4.57826 11.5107 4.51779 11.4652 4.46827 11.4091L0.753985 7.69483C0.683167 7.64891 0.623706 7.58751 0.580092 7.51525C0.536478 7.44299 0.509851 7.36177 0.502221 7.27771C0.49459 7.19366 0.506156 7.10897 0.536046 7.03004C0.565935 6.95111 0.613367 6.88 0.674759 6.82208C0.736151 6.76416 0.8099 6.72095 0.890436 6.69571C0.970973 6.67046 1.05619 6.66385 1.13966 6.67635C1.22313 6.68886 1.30266 6.72017 1.37226 6.76792C1.44186 6.81567 1.4997 6.8786 1.54141 6.95197L4.86199 10.2503L12.6397 2.49483C12.7444 2.42694 12.8689 2.39617 12.9932 2.40745C13.1174 2.41873 13.2343 2.47141 13.3251 2.55705C13.4159 2.64268 13.4753 2.75632 13.4938 2.87973C13.5123 3.00315 13.4888 3.1292 13.4271 3.23768L5.2557 11.4091C5.20618 11.4652 5.14571 11.5107 5.07801 11.5426C5.01031 11.5745 4.9368 11.5923 4.86199 11.5948Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
rt.render = Tn;
var ot = {
  name: "ChevronDownIcon",
  extends: le
};
function kn(t) {
  return Fn(t) || xn(t) || $n(t) || An();
}
function An() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function $n(t, e) {
  if (t) {
    if (typeof t == "string") return ke(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? ke(t, e) : void 0;
  }
}
function xn(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Fn(t) {
  if (Array.isArray(t)) return ke(t);
}
function ke(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, i = Array(e); n < e; n++) i[n] = t[n];
  return i;
}
function zn(t, e, n, i, o, r) {
  return f(), m("svg", c({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), kn(e[0] || (e[0] = [k("path", {
    d: "M7.01744 10.398C6.91269 10.3985 6.8089 10.378 6.71215 10.3379C6.61541 10.2977 6.52766 10.2386 6.45405 10.1641L1.13907 4.84913C1.03306 4.69404 0.985221 4.5065 1.00399 4.31958C1.02276 4.13266 1.10693 3.95838 1.24166 3.82747C1.37639 3.69655 1.55301 3.61742 1.74039 3.60402C1.92777 3.59062 2.11386 3.64382 2.26584 3.75424L7.01744 8.47394L11.769 3.75424C11.9189 3.65709 12.097 3.61306 12.2748 3.62921C12.4527 3.64535 12.6199 3.72073 12.7498 3.84328C12.8797 3.96582 12.9647 4.12842 12.9912 4.30502C13.0177 4.48162 12.9841 4.662 12.8958 4.81724L7.58083 10.1322C7.50996 10.2125 7.42344 10.2775 7.32656 10.3232C7.22968 10.3689 7.12449 10.3944 7.01744 10.398Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
ot.render = zn;
var st = {
  name: "SearchIcon",
  extends: le
};
function Pn(t) {
  return Dn(t) || Vn(t) || En(t) || Mn();
}
function Mn() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function En(t, e) {
  if (t) {
    if (typeof t == "string") return Ae(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ae(t, e) : void 0;
  }
}
function Vn(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Dn(t) {
  if (Array.isArray(t)) return Ae(t);
}
function Ae(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, i = Array(e); n < e; n++) i[n] = t[n];
  return i;
}
function Nn(t, e, n, i, o, r) {
  return f(), m("svg", c({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Pn(e[0] || (e[0] = [k("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M2.67602 11.0265C3.6661 11.688 4.83011 12.0411 6.02086 12.0411C6.81149 12.0411 7.59438 11.8854 8.32483 11.5828C8.87005 11.357 9.37808 11.0526 9.83317 10.6803L12.9769 13.8241C13.0323 13.8801 13.0983 13.9245 13.171 13.9548C13.2438 13.985 13.3219 14.0003 13.4007 14C13.4795 14.0003 13.5575 13.985 13.6303 13.9548C13.7031 13.9245 13.7691 13.8801 13.8244 13.8241C13.9367 13.7116 13.9998 13.5592 13.9998 13.4003C13.9998 13.2414 13.9367 13.089 13.8244 12.9765L10.6807 9.8328C11.053 9.37773 11.3573 8.86972 11.5831 8.32452C11.8857 7.59408 12.0414 6.81119 12.0414 6.02056C12.0414 4.8298 11.6883 3.66579 11.0268 2.67572C10.3652 1.68564 9.42494 0.913972 8.32483 0.45829C7.22472 0.00260857 6.01418 -0.116618 4.84631 0.115686C3.67844 0.34799 2.60568 0.921393 1.76369 1.76338C0.921698 2.60537 0.348296 3.67813 0.115991 4.84601C-0.116313 6.01388 0.00291375 7.22441 0.458595 8.32452C0.914277 9.42464 1.68595 10.3649 2.67602 11.0265ZM3.35565 2.0158C4.14456 1.48867 5.07206 1.20731 6.02086 1.20731C7.29317 1.20731 8.51338 1.71274 9.41304 2.6124C10.3127 3.51206 10.8181 4.73226 10.8181 6.00457C10.8181 6.95337 10.5368 7.88088 10.0096 8.66978C9.48251 9.45868 8.73328 10.0736 7.85669 10.4367C6.98011 10.7997 6.01554 10.8947 5.08496 10.7096C4.15439 10.5245 3.2996 10.0676 2.62869 9.39674C1.95778 8.72583 1.50089 7.87104 1.31579 6.94046C1.13068 6.00989 1.22568 5.04532 1.58878 4.16874C1.95187 3.29215 2.56675 2.54292 3.35565 2.0158Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
st.render = Nn;
var lt = {
  name: "TimesIcon",
  extends: le
};
function Rn(t) {
  return jn(t) || Kn(t) || Hn(t) || Bn();
}
function Bn() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Hn(t, e) {
  if (t) {
    if (typeof t == "string") return $e(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? $e(t, e) : void 0;
  }
}
function Kn(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function jn(t) {
  if (Array.isArray(t)) return $e(t);
}
function $e(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, i = Array(e); n < e; n++) i[n] = t[n];
  return i;
}
function Wn(t, e, n, i, o, r) {
  return f(), m("svg", c({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Rn(e[0] || (e[0] = [k("path", {
    d: "M8.01186 7.00933L12.27 2.75116C12.341 2.68501 12.398 2.60524 12.4375 2.51661C12.4769 2.42798 12.4982 2.3323 12.4999 2.23529C12.5016 2.13827 12.4838 2.0419 12.4474 1.95194C12.4111 1.86197 12.357 1.78024 12.2884 1.71163C12.2198 1.64302 12.138 1.58893 12.0481 1.55259C11.9581 1.51625 11.8617 1.4984 11.7647 1.50011C11.6677 1.50182 11.572 1.52306 11.4834 1.56255C11.3948 1.60204 11.315 1.65898 11.2488 1.72997L6.99067 5.98814L2.7325 1.72997C2.59553 1.60234 2.41437 1.53286 2.22718 1.53616C2.03999 1.53946 1.8614 1.61529 1.72901 1.74767C1.59663 1.88006 1.5208 2.05865 1.5175 2.24584C1.5142 2.43303 1.58368 2.61419 1.71131 2.75116L5.96948 7.00933L1.71131 11.2675C1.576 11.403 1.5 11.5866 1.5 11.7781C1.5 11.9696 1.576 12.1532 1.71131 12.2887C1.84679 12.424 2.03043 12.5 2.2219 12.5C2.41338 12.5 2.59702 12.424 2.7325 12.2887L6.99067 8.03052L11.2488 12.2887C11.3843 12.424 11.568 12.5 11.7594 12.5C11.9509 12.5 12.1346 12.424 12.27 12.2887C12.4053 12.1532 12.4813 11.9696 12.4813 11.7781C12.4813 11.5866 12.4053 11.403 12.27 11.2675L8.01186 7.00933Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
lt.render = Wn;
var Un = `
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
`, Gn = {
  root: "p-iconfield"
}, _n = M.extend({
  name: "iconfield",
  style: Un,
  classes: Gn
}), qn = {
  name: "BaseIconField",
  extends: ye,
  style: _n,
  provide: function() {
    return {
      $pcIconField: this,
      $parentInstance: this
    };
  }
}, at = {
  name: "IconField",
  extends: qn,
  inheritAttrs: !1
};
function Yn(t, e, n, i, o, r) {
  return f(), m("div", c({
    class: t.cx("root")
  }, t.ptmi("root")), [S(t.$slots, "default")], 16);
}
at.render = Yn;
var Qn = {
  root: "p-inputicon"
}, Zn = M.extend({
  name: "inputicon",
  classes: Qn
}), Jn = {
  name: "BaseInputIcon",
  extends: ye,
  style: Zn,
  props: {
    class: null
  },
  provide: function() {
    return {
      $pcInputIcon: this,
      $parentInstance: this
    };
  }
}, ut = {
  name: "InputIcon",
  extends: Jn,
  inheritAttrs: !1,
  computed: {
    containerClass: function() {
      return [this.cx("root"), this.class];
    }
  }
};
function Xn(t, e, n, i, o, r) {
  return f(), m("span", c({
    class: r.containerClass
  }, t.ptmi("root"), {
    "aria-hidden": "true"
  }), [S(t.$slots, "default")], 16);
}
ut.render = Xn;
var ei = {
  name: "BaseEditableHolder",
  extends: ye,
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
      return n.find(q);
    }
  },
  computed: {
    $filled: function() {
      return q(this.d_value);
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
}, dt = {
  name: "BaseInput",
  extends: ei,
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
}, ti = `
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
`, ni = {
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
}, ii = M.extend({
  name: "inputtext",
  style: ti,
  classes: ni
}), ri = {
  name: "BaseInputText",
  extends: dt,
  style: ii,
  provide: function() {
    return {
      $pcInputText: this,
      $parentInstance: this
    };
  }
};
function re(t) {
  "@babel/helpers - typeof";
  return re = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, re(t);
}
function oi(t, e, n) {
  return (e = si(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function si(t) {
  var e = li(t, "string");
  return re(e) == "symbol" ? e : e + "";
}
function li(t, e) {
  if (re(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(t, e);
    if (re(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var ct = {
  name: "InputText",
  extends: ri,
  inheritAttrs: !1,
  methods: {
    onInput: function(e) {
      this.writeValue(e.target.value, e);
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
      return te(oi({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, ai = ["value", "name", "disabled", "aria-invalid", "data-p"];
function ui(t, e, n, i, o, r) {
  return f(), m("input", c({
    type: "text",
    class: t.cx("root"),
    value: t.d_value,
    name: t.name,
    disabled: t.disabled,
    "aria-invalid": t.$invalid || void 0,
    "data-p": r.dataP,
    onInput: e[0] || (e[0] = function() {
      return r.onInput && r.onInput.apply(r, arguments);
    })
  }, r.attrs), null, 16, ai);
}
ct.render = ui;
var di = `
    .p-virtualscroller-loader {
        background: dt('virtualscroller.loader.mask.background');
        color: dt('virtualscroller.loader.mask.color');
    }

    .p-virtualscroller-loading-icon {
        font-size: dt('virtualscroller.loader.icon.size');
        width: dt('virtualscroller.loader.icon.size');
        height: dt('virtualscroller.loader.icon.size');
    }
`, ci = `
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
`, Ge = M.extend({
  name: "virtualscroller",
  css: ci,
  style: di
}), pi = {
  name: "BaseVirtualScroller",
  extends: ye,
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
  style: Ge,
  provide: function() {
    return {
      $pcVirtualScroller: this,
      $parentInstance: this
    };
  },
  beforeMount: function() {
    var e;
    Ge.loadCSS({
      nonce: (e = this.$primevueConfig) === null || e === void 0 || (e = e.csp) === null || e === void 0 ? void 0 : e.nonce
    });
  }
};
function oe(t) {
  "@babel/helpers - typeof";
  return oe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, oe(t);
}
function _e(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(t);
    e && (i = i.filter(function(o) {
      return Object.getOwnPropertyDescriptor(t, o).enumerable;
    })), n.push.apply(n, i);
  }
  return n;
}
function ee(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? _e(Object(n), !0).forEach(function(i) {
      pt(t, i, n[i]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : _e(Object(n)).forEach(function(i) {
      Object.defineProperty(t, i, Object.getOwnPropertyDescriptor(n, i));
    });
  }
  return t;
}
function pt(t, e, n) {
  return (e = fi(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function fi(t) {
  var e = hi(t, "string");
  return oe(e) == "symbol" ? e : e + "";
}
function hi(t, e) {
  if (oe(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(t, e);
    if (oe(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var ft = {
  name: "VirtualScroller",
  extends: pi,
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
      he(this.element) && (this.setContentEl(this.content), this.init(), this.calculateAutoSize(), this.defaultWidth = J(this.element), this.defaultHeight = X(this.element), this.defaultContentWidth = J(this.content), this.defaultContentHeight = X(this.content), this.initialized = !0), this.element && this.bindResizeListener();
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
      var n = this, i = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "auto", o = this.isBoth(), r = this.isHorizontal(), s = o ? e.every(function(b) {
        return b > -1;
      }) : e > -1;
      if (s) {
        var a = this.first, l = this.element, u = l.scrollTop, d = u === void 0 ? 0 : u, p = l.scrollLeft, h = p === void 0 ? 0 : p, O = this.calculateNumItems(), y = O.numToleratedItems, I = this.getContentPosition(), v = this.itemSize, C = function() {
          var w = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, N = arguments.length > 1 ? arguments[1] : void 0;
          return w <= N ? 0 : w;
        }, A = function(w, N, E) {
          return w * N + E;
        }, $ = function() {
          var w = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, N = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return n.scrollTo({
            left: w,
            top: N,
            behavior: i
          });
        }, g = o ? {
          rows: 0,
          cols: 0
        } : 0, B = !1, x = !1;
        o ? (g = {
          rows: C(e[0], y[0]),
          cols: C(e[1], y[1])
        }, $(A(g.cols, v[1], I.left), A(g.rows, v[0], I.top)), x = this.lastScrollPos.top !== d || this.lastScrollPos.left !== h, B = g.rows !== a.rows || g.cols !== a.cols) : (g = C(e, y), r ? $(A(g, v, I.left), d) : $(h, A(g, v, I.top)), x = this.lastScrollPos !== (r ? h : d), B = g !== a), this.isRangeChanged = B, x && (this.first = g);
      }
    },
    scrollInView: function(e, n) {
      var i = this, o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "auto";
      if (n) {
        var r = this.isBoth(), s = this.isHorizontal(), a = r ? e.every(function(v) {
          return v > -1;
        }) : e > -1;
        if (a) {
          var l = this.getRenderedRange(), u = l.first, d = l.viewport, p = function() {
            var C = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, A = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
            return i.scrollTo({
              left: C,
              top: A,
              behavior: o
            });
          }, h = n === "to-start", O = n === "to-end";
          if (h) {
            if (r)
              d.first.rows - u.rows > e[0] ? p(d.first.cols * this.itemSize[1], (d.first.rows - 1) * this.itemSize[0]) : d.first.cols - u.cols > e[1] && p((d.first.cols - 1) * this.itemSize[1], d.first.rows * this.itemSize[0]);
            else if (d.first - u > e) {
              var y = (d.first - 1) * this.itemSize;
              s ? p(y, 0) : p(0, y);
            }
          } else if (O) {
            if (r)
              d.last.rows - u.rows <= e[0] + 1 ? p(d.first.cols * this.itemSize[1], (d.first.rows + 1) * this.itemSize[0]) : d.last.cols - u.cols <= e[1] + 1 && p((d.first.cols + 1) * this.itemSize[1], d.first.rows * this.itemSize[0]);
            else if (d.last - u <= e + 1) {
              var I = (d.first + 1) * this.itemSize;
              s ? p(I, 0) : p(0, I);
            }
          }
        }
      } else
        this.scrollToIndex(e, o);
    },
    getRenderedRange: function() {
      var e = function(p, h) {
        return Math.floor(p / (h || p));
      }, n = this.first, i = 0;
      if (this.element) {
        var o = this.isBoth(), r = this.isHorizontal(), s = this.element, a = s.scrollTop, l = s.scrollLeft;
        if (o)
          n = {
            rows: e(a, this.itemSize[0]),
            cols: e(l, this.itemSize[1])
          }, i = {
            rows: n.rows + this.numItemsInViewport.rows,
            cols: n.cols + this.numItemsInViewport.cols
          };
        else {
          var u = r ? l : a;
          n = e(u, this.itemSize), i = n + this.numItemsInViewport;
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
      var e = this.isBoth(), n = this.isHorizontal(), i = this.itemSize, o = this.getContentPosition(), r = this.element ? this.element.offsetWidth - o.left : 0, s = this.element ? this.element.offsetHeight - o.top : 0, a = function(h, O) {
        return Math.ceil(h / (O || h));
      }, l = function(h) {
        return Math.ceil(h / 2);
      }, u = e ? {
        rows: a(s, i[0]),
        cols: a(r, i[1])
      } : a(n ? r : s, i), d = this.d_numToleratedItems || (e ? [l(u.rows), l(u.cols)] : l(u));
      return {
        numItemsInViewport: u,
        numToleratedItems: d
      };
    },
    calculateOptions: function() {
      var e = this, n = this.isBoth(), i = this.first, o = this.calculateNumItems(), r = o.numItemsInViewport, s = o.numToleratedItems, a = function(d, p, h) {
        var O = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !1;
        return e.getLast(d + p + (d < h ? 2 : 3) * h, O);
      }, l = n ? {
        rows: a(i.rows, r.rows, s[0]),
        cols: a(i.cols, r.cols, s[1], !0)
      } : a(i, r, s);
      this.last = l, this.numItemsInViewport = r, this.d_numToleratedItems = s, this.$emit("update:numToleratedItems", this.d_numToleratedItems), this.showLoader && (this.loaderArr = n ? Array.from({
        length: r.rows
      }).map(function() {
        return Array.from({
          length: r.cols
        });
      }) : Array.from({
        length: r
      })), this.lazy && Promise.resolve().then(function() {
        var u;
        e.lazyLoadState = {
          first: e.step ? n ? {
            rows: 0,
            cols: i.cols
          } : 0 : i,
          last: Math.min(e.step ? e.step : l, ((u = e.items) === null || u === void 0 ? void 0 : u.length) || 0)
        }, e.$emit("lazy-load", e.lazyLoadState);
      });
    },
    calculateAutoSize: function() {
      var e = this;
      this.autoSize && !this.d_loading && Promise.resolve().then(function() {
        if (e.content) {
          var n = e.isBoth(), i = e.isHorizontal(), o = e.isVertical();
          e.content.style.minHeight = e.content.style.minWidth = "auto", e.content.style.position = "relative", e.element.style.contain = "none";
          var r = [J(e.element), X(e.element)], s = r[0], a = r[1];
          (n || i) && (e.element.style.width = s < e.defaultWidth ? s + "px" : e.scrollWidth || e.defaultWidth + "px"), (n || o) && (e.element.style.height = a < e.defaultHeight ? a + "px" : e.scrollHeight || e.defaultHeight + "px"), e.content.style.minHeight = e.content.style.minWidth = "", e.content.style.position = "", e.element.style.contain = "";
        }
      });
    },
    getLast: function() {
      var e, n, i = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, o = arguments.length > 1 ? arguments[1] : void 0;
      return this.items ? Math.min(o ? ((e = this.columns || this.items[0]) === null || e === void 0 ? void 0 : e.length) || 0 : ((n = this.items) === null || n === void 0 ? void 0 : n.length) || 0, i) : 0;
    },
    getContentPosition: function() {
      if (this.content) {
        var e = getComputedStyle(this.content), n = parseFloat(e.paddingLeft) + Math.max(parseFloat(e.left) || 0, 0), i = parseFloat(e.paddingRight) + Math.max(parseFloat(e.right) || 0, 0), o = parseFloat(e.paddingTop) + Math.max(parseFloat(e.top) || 0, 0), r = parseFloat(e.paddingBottom) + Math.max(parseFloat(e.bottom) || 0, 0);
        return {
          left: n,
          right: i,
          top: o,
          bottom: r,
          x: n + i,
          y: o + r
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
        var n = this.isBoth(), i = this.isHorizontal(), o = this.element.parentElement, r = this.scrollWidth || "".concat(this.element.offsetWidth || o.offsetWidth, "px"), s = this.scrollHeight || "".concat(this.element.offsetHeight || o.offsetHeight, "px"), a = function(u, d) {
          return e.element.style[u] = d;
        };
        n || i ? (a("height", s), a("width", r)) : a("height", s);
      }
    },
    setSpacerSize: function() {
      var e = this, n = this.items;
      if (n) {
        var i = this.isBoth(), o = this.isHorizontal(), r = this.getContentPosition(), s = function(l, u, d) {
          var p = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 0;
          return e.spacerStyle = ee(ee({}, e.spacerStyle), pt({}, "".concat(l), (u || []).length * d + p + "px"));
        };
        i ? (s("height", n, this.itemSize[0], r.y), s("width", this.columns || n[1], this.itemSize[1], r.x)) : o ? s("width", this.columns || n, this.itemSize, r.x) : s("height", n, this.itemSize, r.y);
      }
    },
    setContentPosition: function(e) {
      var n = this;
      if (this.content && !this.appendOnly) {
        var i = this.isBoth(), o = this.isHorizontal(), r = e ? e.first : this.first, s = function(d, p) {
          return d * p;
        }, a = function() {
          var d = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, p = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return n.contentStyle = ee(ee({}, n.contentStyle), {
            transform: "translate3d(".concat(d, "px, ").concat(p, "px, 0)")
          });
        };
        if (i)
          a(s(r.cols, this.itemSize[1]), s(r.rows, this.itemSize[0]));
        else {
          var l = s(r, this.itemSize);
          o ? a(l, 0) : a(0, l);
        }
      }
    },
    onScrollPositionChange: function(e) {
      var n = this, i = e.target, o = this.isBoth(), r = this.isHorizontal(), s = this.getContentPosition(), a = function(L, z) {
        return L ? L > z ? L - z : L : 0;
      }, l = function(L, z) {
        return Math.floor(L / (z || L));
      }, u = function(L, z, Z, ae, V, K) {
        return L <= V ? V : K ? Z - ae - V : z + V - 1;
      }, d = function(L, z, Z, ae, V, K, ue, ht) {
        if (L <= K) return 0;
        var ve = Math.max(0, ue ? L < z ? Z : L - K : L > z ? Z : L - 2 * K), Me = n.getLast(ve, ht);
        return ve > Me ? Me - V : ve;
      }, p = function(L, z, Z, ae, V, K) {
        var ue = z + ae + 2 * V;
        return L >= V && (ue += V + 1), n.getLast(ue, K);
      }, h = a(i.scrollTop, s.top), O = a(i.scrollLeft, s.left), y = o ? {
        rows: 0,
        cols: 0
      } : 0, I = this.last, v = !1, C = this.lastScrollPos;
      if (o) {
        var A = this.lastScrollPos.top <= h, $ = this.lastScrollPos.left <= O;
        if (!this.appendOnly || this.appendOnly && (A || $)) {
          var g = {
            rows: l(h, this.itemSize[0]),
            cols: l(O, this.itemSize[1])
          }, B = {
            rows: u(g.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], A),
            cols: u(g.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], $)
          };
          y = {
            rows: d(g.rows, B.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], A),
            cols: d(g.cols, B.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], $, !0)
          }, I = {
            rows: p(g.rows, y.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0]),
            cols: p(g.cols, y.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], !0)
          }, v = y.rows !== this.first.rows || I.rows !== this.last.rows || y.cols !== this.first.cols || I.cols !== this.last.cols || this.isRangeChanged, C = {
            top: h,
            left: O
          };
        }
      } else {
        var x = r ? O : h, b = this.lastScrollPos <= x;
        if (!this.appendOnly || this.appendOnly && b) {
          var w = l(x, this.itemSize), N = u(w, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, b);
          y = d(w, N, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, b), I = p(w, y, this.last, this.numItemsInViewport, this.d_numToleratedItems), v = y !== this.first || I !== this.last || this.isRangeChanged, C = x;
        }
      }
      return {
        first: y,
        last: I,
        isRangeChanged: v,
        scrollPos: C
      };
    },
    onScrollChange: function(e) {
      var n = this.onScrollPositionChange(e), i = n.first, o = n.last, r = n.isRangeChanged, s = n.scrollPos;
      if (r) {
        var a = {
          first: i,
          last: o
        };
        if (this.setContentPosition(a), this.first = i, this.last = o, this.lastScrollPos = s, this.$emit("scroll-index-change", a), this.lazy && this.isPageChanged(i)) {
          var l, u, d = {
            first: this.step ? Math.min(this.getPageByFirst(i) * this.step, (((l = this.items) === null || l === void 0 ? void 0 : l.length) || 0) - this.step) : i,
            last: Math.min(this.step ? (this.getPageByFirst(i) + 1) * this.step : o, ((u = this.items) === null || u === void 0 ? void 0 : u.length) || 0)
          }, p = this.lazyLoadState.first !== d.first || this.lazyLoadState.last !== d.last;
          p && this.$emit("lazy-load", d), this.lazyLoadState = d;
        }
      }
    },
    onScroll: function(e) {
      var n = this;
      if (this.$emit("scroll", e), this.delay) {
        if (this.scrollTimeout && clearTimeout(this.scrollTimeout), this.isPageChanged()) {
          if (!this.d_loading && this.showLoader) {
            var i = this.onScrollPositionChange(e), o = i.isRangeChanged, r = o || (this.step ? this.isPageChanged() : !1);
            r && (this.d_loading = !0);
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
        if (he(e.element)) {
          var n = e.isBoth(), i = e.isVertical(), o = e.isHorizontal(), r = [J(e.element), X(e.element)], s = r[0], a = r[1], l = s !== e.defaultWidth, u = a !== e.defaultHeight, d = n ? l || u : o ? l : i ? u : !1;
          d && (e.d_numToleratedItems = e.numToleratedItems, e.defaultWidth = s, e.defaultHeight = a, e.defaultContentWidth = J(e.content), e.defaultContentHeight = X(e.content), e.init());
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
      return ee({
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
      this.content = e || this.content || et(this.element, '[data-pc-section="content"]');
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
    SpinnerIcon: Xe
  }
}, mi = ["tabindex"];
function gi(t, e, n, i, o, r) {
  var s = D("SpinnerIcon");
  return t.disabled ? (f(), m(Q, {
    key: 1
  }, [S(t.$slots, "default"), S(t.$slots, "content", {
    items: t.items,
    rows: t.items,
    columns: r.loadedColumns
  })], 64)) : (f(), m("div", c({
    key: 0,
    ref: r.elementRef,
    class: r.containerClass,
    tabindex: t.tabindex,
    style: t.style,
    onScroll: e[0] || (e[0] = function() {
      return r.onScroll && r.onScroll.apply(r, arguments);
    })
  }, t.ptmi("root")), [S(t.$slots, "content", {
    styleClass: r.contentClass,
    items: r.loadedItems,
    getItemOptions: r.getOptions,
    loading: o.d_loading,
    getLoaderOptions: r.getLoaderOptions,
    itemSize: t.itemSize,
    rows: r.loadedRows,
    columns: r.loadedColumns,
    contentRef: r.contentRef,
    spacerStyle: o.spacerStyle,
    contentStyle: o.contentStyle,
    vertical: r.isVertical(),
    horizontal: r.isHorizontal(),
    both: r.isBoth()
  }, function() {
    return [k("div", c({
      ref: r.contentRef,
      class: r.contentClass,
      style: o.contentStyle
    }, t.ptm("content")), [(f(!0), m(Q, null, Oe(r.loadedItems, function(a, l) {
      return S(t.$slots, "item", {
        key: l,
        item: a,
        options: r.getOptions(l)
      });
    }), 128))], 16)];
  }), t.showSpacer ? (f(), m("div", c({
    key: 0,
    class: "p-virtualscroller-spacer",
    style: o.spacerStyle
  }, t.ptm("spacer")), null, 16)) : P("", !0), !t.loaderDisabled && t.showLoader && o.d_loading ? (f(), m("div", c({
    key: 1,
    class: r.loaderClass
  }, t.ptm("loader")), [t.$slots && t.$slots.loader ? (f(!0), m(Q, {
    key: 0
  }, Oe(o.loaderArr, function(a, l) {
    return S(t.$slots, "loader", {
      key: l,
      options: r.getLoaderOptions(l, r.isBoth() && {
        numCols: t.d_numItemsInViewport.cols
      })
    });
  }), 128)) : P("", !0), S(t.$slots, "loadingicon", {}, function() {
    return [W(s, c({
      spin: "",
      class: "p-virtualscroller-loading-icon"
    }, t.ptm("loadingIcon")), null, 16)];
  })], 16)) : P("", !0)], 16, mi));
}
ft.render = gi;
var yi = `
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
`, vi = {
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
    var n = e.instance, i = e.props, o = e.state, r = e.option, s = e.focusedOption;
    return ["p-select-option", {
      "p-select-option-selected": n.isSelected(r) && i.highlightOnSelect,
      "p-focus": o.focusedOptionIndex === s,
      "p-disabled": n.isOptionDisabled(r)
    }];
  },
  optionLabel: "p-select-option-label",
  optionCheckIcon: "p-select-option-check-icon",
  optionBlankIcon: "p-select-option-blank-icon",
  emptyMessage: "p-select-empty-message"
}, bi = M.extend({
  name: "select",
  style: yi,
  classes: vi
}), Si = {
  name: "BaseSelect",
  extends: dt,
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
  style: bi,
  provide: function() {
    return {
      $pcSelect: this,
      $parentInstance: this
    };
  }
};
function se(t) {
  "@babel/helpers - typeof";
  return se = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, se(t);
}
function wi(t) {
  return Li(t) || Ci(t) || Ii(t) || Oi();
}
function Oi() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ii(t, e) {
  if (t) {
    if (typeof t == "string") return xe(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? xe(t, e) : void 0;
  }
}
function Ci(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Li(t) {
  if (Array.isArray(t)) return xe(t);
}
function xe(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, i = Array(e); n < e; n++) i[n] = t[n];
  return i;
}
function qe(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(t);
    e && (i = i.filter(function(o) {
      return Object.getOwnPropertyDescriptor(t, o).enumerable;
    })), n.push.apply(n, i);
  }
  return n;
}
function Ye(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? qe(Object(n), !0).forEach(function(i) {
      G(t, i, n[i]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : qe(Object(n)).forEach(function(i) {
      Object.defineProperty(t, i, Object.getOwnPropertyDescriptor(n, i));
    });
  }
  return t;
}
function G(t, e, n) {
  return (e = Ti(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Ti(t) {
  var e = ki(t, "string");
  return se(e) == "symbol" ? e : e + "";
}
function ki(t, e) {
  if (se(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(t, e);
    if (se(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Ai = {
  name: "Select",
  extends: Si,
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
    this.unbindOutsideClickListener(), this.unbindResizeListener(), this.unbindLabelClickListener(), this.unbindMatchMediaOrientationListener(), this.scrollHandler && (this.scrollHandler.destroy(), this.scrollHandler = null), this.overlay && (we.clear(this.overlay), this.overlay = null);
  },
  methods: {
    getOptionIndex: function(e, n) {
      return this.virtualScrollerDisabled ? e : n && n(e).index;
    },
    getOptionLabel: function(e) {
      return this.optionLabel ? U(e, this.optionLabel) : e;
    },
    getOptionValue: function(e) {
      return this.optionValue ? U(e, this.optionValue) : e;
    },
    getOptionRenderKey: function(e, n) {
      return (this.dataKey ? U(e, this.dataKey) : this.getOptionLabel(e)) + "_" + n;
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
      return this.optionDisabled ? U(e, this.optionDisabled) : !1;
    },
    isOptionGroup: function(e) {
      return this.optionGroupLabel && e.optionGroup && e.group;
    },
    getOptionGroupLabel: function(e) {
      return U(e, this.optionGroupLabel);
    },
    getOptionGroupChildren: function(e) {
      return U(e, this.optionGroupChildren);
    },
    getAriaPosInset: function(e) {
      var n = this;
      return (this.optionGroupLabel ? e - this.visibleOptions.slice(0, e).filter(function(i) {
        return n.isOptionGroup(i);
      }).length : e) + 1;
    },
    show: function(e) {
      this.$emit("before-show"), this.overlayVisible = !0, this.focusedOptionIndex = this.focusedOptionIndex !== -1 ? this.focusedOptionIndex : this.autoOptionFocus ? this.findFirstFocusedOptionIndex() : this.editable ? -1 : this.findSelectedOptionIndex(), e && R(this.$refs.focusInput);
    },
    hide: function(e) {
      var n = this, i = function() {
        n.$emit("before-hide"), n.overlayVisible = !1, n.clicked = !1, n.focusedOptionIndex = -1, n.searchValue = "", n.resetFilterOnHide && (n.filterValue = null), e && R(n.$refs.focusInput);
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
      if (Dt())
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
          !i && Nt(e.key) && (!this.overlayVisible && this.show(), !this.editable && this.searchOptions(e, e.key), this.filter && this.$nextTick(function() {
            n.$refs.filterInput && R(n.$refs.filterInput.$el);
          }));
          break;
      }
      this.clicked = !1;
    },
    onEditableInput: function(e) {
      var n = e.target.value;
      this.searchValue = "";
      var i = this.searchOptions(e, n);
      !i && (this.focusedOptionIndex = -1), this.updateModel(e, n), !this.overlayVisible && q(n) && this.show();
    },
    onContainerClick: function(e) {
      this.disabled || this.loading || e.target.tagName === "INPUT" || e.target.getAttribute("data-pc-section") === "clearicon" || e.target.closest('[data-pc-section="clearicon"]') || ((!this.overlay || !this.overlay.contains(e.target)) && (this.overlayVisible ? this.hide(!0) : this.show(!0)), this.clicked = !0);
    },
    onClearClick: function(e) {
      this.updateModel(e, null), this.resetFilterOnClear && (this.filterValue = null);
    },
    onFirstHiddenFocus: function(e) {
      var n = e.relatedTarget === this.$refs.focusInput ? Vt(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      R(n);
    },
    onLastHiddenFocus: function(e) {
      var n = e.relatedTarget === this.$refs.focusInput ? Et(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      R(n);
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
      on.emit("overlay-click", {
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
      n || (this.overlayVisible && this.hasFocusableElements() ? (R(this.$refs.firstHiddenFocusableElementOnOverlay), e.preventDefault()) : (this.focusedOptionIndex !== -1 && this.onOptionSelect(e, this.visibleOptions[this.focusedOptionIndex]), this.overlayVisible && this.hide(this.filter)));
    },
    onBackspaceKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n && !this.overlayVisible && this.show();
    },
    onOverlayEnter: function(e) {
      var n = this;
      we.set("overlay", e, this.$primevue.config.zIndex.overlay), Mt(e, {
        position: "absolute",
        top: "0"
      }), this.alignOverlay(), this.scrollInView(), this.$attrSelector && e.setAttribute(this.$attrSelector, ""), setTimeout(function() {
        n.autoFilterFocus && n.filter && R(n.$refs.filterInput.$el), n.autoUpdateModel();
      }, 1);
    },
    onOverlayAfterEnter: function() {
      this.bindOutsideClickListener(), this.bindScrollListener(), this.bindResizeListener(), this.$emit("show");
    },
    onOverlayLeave: function(e) {
      var n = this;
      e.style.pointerEvents = "none", this.unbindOutsideClickListener(), this.unbindScrollListener(), this.unbindResizeListener(), this.autoFilterFocus && this.filter && !this.editable && this.$nextTick(function() {
        n.$refs.filterInput && R(n.$refs.filterInput.$el);
      }), this.$emit("hide"), this.overlay = null;
    },
    onOverlayAfterLeave: function(e) {
      we.clear(e);
    },
    alignOverlay: function() {
      this.appendTo === "self" ? Ft(this.overlay, this.$el) : this.overlay && (this.overlay.style.minWidth = zt(this.$el) + "px", Pt(this.overlay, this.$el));
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
      this.scrollHandler || (this.scrollHandler = new rn(this.$refs.container, function() {
        e.overlayVisible && e.hide();
      })), this.scrollHandler.bindScrollListener();
    },
    unbindScrollListener: function() {
      this.scrollHandler && this.scrollHandler.unbindScrollListener();
    },
    bindResizeListener: function() {
      var e = this;
      this.resizeListener || (this.resizeListener = function() {
        e.overlayVisible && !xt() && e.hide();
      }, window.addEventListener("resize", this.resizeListener));
    },
    unbindResizeListener: function() {
      this.resizeListener && (window.removeEventListener("resize", this.resizeListener), this.resizeListener = null);
    },
    bindLabelClickListener: function() {
      var e = this;
      if (!this.editable && !this.labelClickListener) {
        var n = document.querySelector('label[for="'.concat(this.labelId, '"]'));
        n && he(n) && (this.labelClickListener = function() {
          R(e.$refs.focusInput);
        }, n.addEventListener("click", this.labelClickListener));
      }
    },
    unbindLabelClickListener: function() {
      if (this.labelClickListener) {
        var e = document.querySelector('label[for="'.concat(this.labelId, '"]'));
        e && he(e) && e.removeEventListener("click", this.labelClickListener);
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
      return $t(this.overlay, ':not([data-p-hidden-focusable="true"])').length > 0;
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
      return q(e) && !(this.isOptionDisabled(e) || this.isOptionGroup(e));
    },
    isValidSelectedOption: function(e) {
      return this.isValidOption(e) && this.isSelected(e);
    },
    isSelected: function(e) {
      return Ze(this.d_value, this.getOptionValue(e), this.equalityKey);
    },
    findFirstOptionIndex: function() {
      var e = this;
      return this.visibleOptions.findIndex(function(n) {
        return e.isValidOption(n);
      });
    },
    findLastOptionIndex: function() {
      var e = this;
      return Ve(this.visibleOptions, function(n) {
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
      var n = this, i = e > 0 ? Ve(this.visibleOptions.slice(0, e), function(o) {
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
      var o = -1, r = !1;
      return q(this.searchValue) && (o = this.visibleOptions.findIndex(function(s) {
        return i.isOptionExactMatched(s);
      }), o === -1 && (o = this.visibleOptions.findIndex(function(s) {
        return i.isOptionStartsWith(s);
      })), o !== -1 && (r = !0), o === -1 && this.focusedOptionIndex === -1 && (o = this.findFirstFocusedOptionIndex()), o !== -1 && this.changeFocusedOptionIndex(e, o)), this.searchTimeout && clearTimeout(this.searchTimeout), this.searchTimeout = setTimeout(function() {
        i.searchValue = "", i.searchTimeout = null;
      }, 500), r;
    },
    changeFocusedOptionIndex: function(e, n) {
      this.focusedOptionIndex !== n && (this.focusedOptionIndex = n, this.scrollInView(), this.selectOnFocus && this.onOptionSelect(e, this.visibleOptions[n], !1));
    },
    scrollInView: function() {
      var e = this, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : -1;
      this.$nextTick(function() {
        var i = n !== -1 ? "".concat(e.$id, "_").concat(n) : e.focusedOptionId, o = et(e.list, 'li[id="'.concat(i, '"]'));
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
      return (e || []).reduce(function(i, o, r) {
        i.push({
          optionGroup: o,
          group: !0,
          index: r
        });
        var s = n.getOptionGroupChildren(o);
        return s && s.forEach(function(a) {
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
        var i = Ht.filter(n, this.searchFields, this.filterValue, this.filterMatchMode, this.filterLocale);
        if (this.optionGroupLabel) {
          var o = this.options || [], r = [];
          return o.forEach(function(s) {
            var a = e.getOptionGroupChildren(s), l = a.filter(function(u) {
              return i.includes(u);
            });
            l.length > 0 && r.push(Ye(Ye({}, s), {}, G({}, typeof e.optionGroupChildren == "string" ? e.optionGroupChildren : "items", wi(l))));
          }), this.flatOptions(r);
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
      return q(this.visibleOptions) ? this.filterMessageText.replaceAll("{0}", this.visibleOptions.length) : this.emptyFilterMessageText;
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
      return te(G({
        invalid: this.$invalid,
        disabled: this.disabled,
        focus: this.focused,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    },
    labelDataP: function() {
      return te(G(G({
        placeholder: !this.editable && this.label === this.placeholder,
        clearable: this.showClear,
        disabled: this.disabled,
        editable: this.editable
      }, this.size, this.size), "empty", !this.editable && !this.$slots.value && (this.label === "p-emptylabel" || this.label.length === 0)));
    },
    dropdownIconDataP: function() {
      return te(G({}, this.size, this.size));
    },
    overlayDataP: function() {
      return te(G({}, "portal-" + this.appendTo, "portal-" + this.appendTo));
    }
  },
  directives: {
    ripple: At
  },
  components: {
    InputText: ct,
    VirtualScroller: ft,
    Portal: Fe,
    InputIcon: ut,
    IconField: at,
    TimesIcon: lt,
    ChevronDownIcon: ot,
    SpinnerIcon: Xe,
    SearchIcon: st,
    CheckIcon: rt,
    BlankIcon: it
  }
}, $i = ["id", "data-p"], xi = ["name", "id", "value", "placeholder", "tabindex", "disabled", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-invalid", "data-p"], Fi = ["name", "id", "tabindex", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-invalid", "aria-disabled", "data-p"], zi = ["data-p"], Pi = ["id"], Mi = ["id"], Ei = ["id", "aria-label", "aria-selected", "aria-disabled", "aria-setsize", "aria-posinset", "onMousedown", "onMousemove", "data-p-selected", "data-p-focused", "data-p-disabled"];
function Vi(t, e, n, i, o, r) {
  var s = D("SpinnerIcon"), a = D("InputText"), l = D("SearchIcon"), u = D("InputIcon"), d = D("IconField"), p = D("CheckIcon"), h = D("BlankIcon"), O = D("VirtualScroller"), y = D("Portal"), I = vt("ripple");
  return f(), m("div", c({
    ref: "container",
    id: t.$id,
    class: t.cx("root"),
    onClick: e[12] || (e[12] = function() {
      return r.onContainerClick && r.onContainerClick.apply(r, arguments);
    }),
    "data-p": r.containerDataP
  }, t.ptmi("root")), [t.editable ? (f(), m("input", c({
    key: 0,
    ref: "focusInput",
    name: t.name,
    id: t.labelId || t.inputId,
    type: "text",
    class: [t.cx("label"), t.inputClass, t.labelClass],
    style: [t.inputStyle, t.labelStyle],
    value: r.editableInputValue,
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
    "aria-activedescendant": o.focused ? r.focusedOptionId : void 0,
    "aria-invalid": t.invalid || void 0,
    onFocus: e[0] || (e[0] = function() {
      return r.onFocus && r.onFocus.apply(r, arguments);
    }),
    onBlur: e[1] || (e[1] = function() {
      return r.onBlur && r.onBlur.apply(r, arguments);
    }),
    onKeydown: e[2] || (e[2] = function() {
      return r.onKeyDown && r.onKeyDown.apply(r, arguments);
    }),
    onInput: e[3] || (e[3] = function() {
      return r.onEditableInput && r.onEditableInput.apply(r, arguments);
    }),
    "data-p": r.labelDataP
  }, t.ptm("label")), null, 16, xi)) : (f(), m("span", c({
    key: 1,
    ref: "focusInput",
    name: t.name,
    id: t.labelId || t.inputId,
    class: [t.cx("label"), t.inputClass, t.labelClass],
    style: [t.inputStyle, t.labelStyle],
    tabindex: t.disabled ? -1 : t.tabindex,
    role: "combobox",
    "aria-label": t.ariaLabel || (r.label === "p-emptylabel" ? void 0 : r.label),
    "aria-labelledby": t.ariaLabelledby,
    "aria-haspopup": "listbox",
    "aria-expanded": o.overlayVisible,
    "aria-controls": t.$id + "_list",
    "aria-activedescendant": o.focused ? r.focusedOptionId : void 0,
    "aria-invalid": t.invalid || void 0,
    "aria-disabled": t.disabled,
    onFocus: e[4] || (e[4] = function() {
      return r.onFocus && r.onFocus.apply(r, arguments);
    }),
    onBlur: e[5] || (e[5] = function() {
      return r.onBlur && r.onBlur.apply(r, arguments);
    }),
    onKeydown: e[6] || (e[6] = function() {
      return r.onKeyDown && r.onKeyDown.apply(r, arguments);
    }),
    "data-p": r.labelDataP
  }, t.ptm("label")), [S(t.$slots, "value", {
    value: t.d_value,
    placeholder: t.placeholder
  }, function() {
    var v;
    return [be(H(r.label === "p-emptylabel" ? " " : (v = r.label) !== null && v !== void 0 ? v : "empty"), 1)];
  })], 16, Fi)), r.isClearIconVisible ? S(t.$slots, "clearicon", {
    key: 2,
    class: ce(t.cx("clearIcon")),
    clearCallback: r.onClearClick
  }, function() {
    return [(f(), j(Ee(t.clearIcon ? "i" : "TimesIcon"), c({
      ref: "clearIcon",
      class: [t.cx("clearIcon"), t.clearIcon],
      onClick: r.onClearClick
    }, t.ptm("clearIcon"), {
      "data-pc-section": "clearicon"
    }), null, 16, ["class", "onClick"]))];
  }) : P("", !0), k("div", c({
    class: t.cx("dropdown")
  }, t.ptm("dropdown")), [t.loading ? S(t.$slots, "loadingicon", {
    key: 0,
    class: ce(t.cx("loadingIcon"))
  }, function() {
    return [t.loadingIcon ? (f(), m("span", c({
      key: 0,
      class: [t.cx("loadingIcon"), "pi-spin", t.loadingIcon],
      "aria-hidden": "true"
    }, t.ptm("loadingIcon")), null, 16)) : (f(), j(s, c({
      key: 1,
      class: t.cx("loadingIcon"),
      spin: "",
      "aria-hidden": "true"
    }, t.ptm("loadingIcon")), null, 16, ["class"]))];
  }) : S(t.$slots, "dropdownicon", {
    key: 1,
    class: ce(t.cx("dropdownIcon"))
  }, function() {
    return [(f(), j(Ee(t.dropdownIcon ? "span" : "ChevronDownIcon"), c({
      class: [t.cx("dropdownIcon"), t.dropdownIcon],
      "aria-hidden": "true",
      "data-p": r.dropdownIconDataP
    }, t.ptm("dropdownIcon")), null, 16, ["class", "data-p"]))];
  })], 16), W(y, {
    appendTo: t.appendTo
  }, {
    default: _(function() {
      return [W(bt, c({
        name: "p-anchored-overlay",
        onEnter: r.onOverlayEnter,
        onAfterEnter: r.onOverlayAfterEnter,
        onLeave: r.onOverlayLeave,
        onAfterLeave: r.onOverlayAfterLeave
      }, t.ptm("transition")), {
        default: _(function() {
          return [o.overlayVisible ? (f(), m("div", c({
            key: 0,
            ref: r.overlayRef,
            class: [t.cx("overlay"), t.panelClass, t.overlayClass],
            style: [t.panelStyle, t.overlayStyle],
            onClick: e[10] || (e[10] = function() {
              return r.onOverlayClick && r.onOverlayClick.apply(r, arguments);
            }),
            onKeydown: e[11] || (e[11] = function() {
              return r.onOverlayKeyDown && r.onOverlayKeyDown.apply(r, arguments);
            }),
            "data-p": r.overlayDataP
          }, t.ptm("overlay")), [k("span", c({
            ref: "firstHiddenFocusableElementOnOverlay",
            role: "presentation",
            "aria-hidden": "true",
            class: "p-hidden-accessible p-hidden-focusable",
            tabindex: 0,
            onFocus: e[7] || (e[7] = function() {
              return r.onFirstHiddenFocus && r.onFirstHiddenFocus.apply(r, arguments);
            })
          }, t.ptm("hiddenFirstFocusableEl"), {
            "data-p-hidden-accessible": !0,
            "data-p-hidden-focusable": !0
          }), null, 16), S(t.$slots, "header", {
            value: t.d_value,
            options: r.visibleOptions
          }), t.filter ? (f(), m("div", c({
            key: 0,
            class: t.cx("header")
          }, t.ptm("header")), [W(d, {
            unstyled: t.unstyled,
            pt: t.ptm("pcFilterContainer")
          }, {
            default: _(function() {
              return [W(a, {
                ref: "filterInput",
                type: "text",
                value: o.filterValue,
                onVnodeMounted: r.onFilterUpdated,
                onVnodeUpdated: r.onFilterUpdated,
                class: ce(t.cx("pcFilter")),
                placeholder: t.filterPlaceholder,
                variant: t.variant,
                unstyled: t.unstyled,
                role: "searchbox",
                autocomplete: "off",
                "aria-owns": t.$id + "_list",
                "aria-activedescendant": r.focusedOptionId,
                onKeydown: r.onFilterKeyDown,
                onBlur: r.onFilterBlur,
                onInput: r.onFilterChange,
                pt: t.ptm("pcFilter"),
                formControl: {
                  novalidate: !0
                }
              }, null, 8, ["value", "onVnodeMounted", "onVnodeUpdated", "class", "placeholder", "variant", "unstyled", "aria-owns", "aria-activedescendant", "onKeydown", "onBlur", "onInput", "pt"]), W(u, {
                unstyled: t.unstyled,
                pt: t.ptm("pcFilterIconContainer")
              }, {
                default: _(function() {
                  return [S(t.$slots, "filtericon", {}, function() {
                    return [t.filterIcon ? (f(), m("span", c({
                      key: 0,
                      class: t.filterIcon
                    }, t.ptm("filterIcon")), null, 16)) : (f(), j(l, St(c({
                      key: 1
                    }, t.ptm("filterIcon"))), null, 16))];
                  })];
                }),
                _: 3
              }, 8, ["unstyled", "pt"])];
            }),
            _: 3
          }, 8, ["unstyled", "pt"]), k("span", c({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, t.ptm("hiddenFilterResult"), {
            "data-p-hidden-accessible": !0
          }), H(r.filterResultMessageText), 17)], 16)) : P("", !0), k("div", c({
            class: t.cx("listContainer"),
            style: {
              "max-height": r.virtualScrollerDisabled ? t.scrollHeight : ""
            }
          }, t.ptm("listContainer")), [W(O, c({
            ref: r.virtualScrollerRef
          }, t.virtualScrollerOptions, {
            items: r.visibleOptions,
            style: {
              height: t.scrollHeight
            },
            tabindex: -1,
            disabled: r.virtualScrollerDisabled,
            pt: t.ptm("virtualScroller")
          }), wt({
            content: _(function(v) {
              var C = v.styleClass, A = v.contentRef, $ = v.items, g = v.getItemOptions, B = v.contentStyle, x = v.itemSize;
              return [k("ul", c({
                ref: function(w) {
                  return r.listRef(w, A);
                },
                id: t.$id + "_list",
                class: [t.cx("list"), C],
                style: B,
                role: "listbox"
              }, t.ptm("list")), [(f(!0), m(Q, null, Oe($, function(b, w) {
                return f(), m(Q, {
                  key: r.getOptionRenderKey(b, r.getOptionIndex(w, g))
                }, [r.isOptionGroup(b) ? (f(), m("li", c({
                  key: 0,
                  id: t.$id + "_" + r.getOptionIndex(w, g),
                  style: {
                    height: x ? x + "px" : void 0
                  },
                  class: t.cx("optionGroup"),
                  role: "option"
                }, {
                  ref_for: !0
                }, t.ptm("optionGroup")), [S(t.$slots, "optiongroup", {
                  option: b.optionGroup,
                  index: r.getOptionIndex(w, g)
                }, function() {
                  return [k("span", c({
                    class: t.cx("optionGroupLabel")
                  }, {
                    ref_for: !0
                  }, t.ptm("optionGroupLabel")), H(r.getOptionGroupLabel(b.optionGroup)), 17)];
                })], 16, Mi)) : Ot((f(), m("li", c({
                  key: 1,
                  id: t.$id + "_" + r.getOptionIndex(w, g),
                  class: t.cx("option", {
                    option: b,
                    focusedOption: r.getOptionIndex(w, g)
                  }),
                  style: {
                    height: x ? x + "px" : void 0
                  },
                  role: "option",
                  "aria-label": r.getOptionLabel(b),
                  "aria-selected": r.isSelected(b),
                  "aria-disabled": r.isOptionDisabled(b),
                  "aria-setsize": r.ariaSetSize,
                  "aria-posinset": r.getAriaPosInset(r.getOptionIndex(w, g)),
                  onMousedown: function(E) {
                    return r.onOptionSelect(E, b);
                  },
                  onMousemove: function(E) {
                    return r.onOptionMouseMove(E, r.getOptionIndex(w, g));
                  },
                  onClick: e[8] || (e[8] = It(function() {
                  }, ["stop"])),
                  "data-p-selected": !t.checkmark && r.isSelected(b),
                  "data-p-focused": o.focusedOptionIndex === r.getOptionIndex(w, g),
                  "data-p-disabled": r.isOptionDisabled(b)
                }, {
                  ref_for: !0
                }, r.getPTItemOptions(b, g, w, "option")), [t.checkmark ? (f(), m(Q, {
                  key: 0
                }, [r.isSelected(b) ? (f(), j(p, c({
                  key: 0,
                  class: t.cx("optionCheckIcon")
                }, {
                  ref_for: !0
                }, t.ptm("optionCheckIcon")), null, 16, ["class"])) : (f(), j(h, c({
                  key: 1,
                  class: t.cx("optionBlankIcon")
                }, {
                  ref_for: !0
                }, t.ptm("optionBlankIcon")), null, 16, ["class"]))], 64)) : P("", !0), S(t.$slots, "option", {
                  option: b,
                  selected: r.isSelected(b),
                  index: r.getOptionIndex(w, g)
                }, function() {
                  return [k("span", c({
                    class: t.cx("optionLabel")
                  }, {
                    ref_for: !0
                  }, t.ptm("optionLabel")), H(r.getOptionLabel(b)), 17)];
                })], 16, Ei)), [[I]])], 64);
              }), 128)), o.filterValue && (!$ || $ && $.length === 0) ? (f(), m("li", c({
                key: 0,
                class: t.cx("emptyMessage"),
                role: "option"
              }, t.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [S(t.$slots, "emptyfilter", {}, function() {
                return [be(H(r.emptyFilterMessageText), 1)];
              })], 16)) : !t.options || t.options && t.options.length === 0 ? (f(), m("li", c({
                key: 1,
                class: t.cx("emptyMessage"),
                role: "option"
              }, t.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [S(t.$slots, "empty", {}, function() {
                return [be(H(r.emptyMessageText), 1)];
              })], 16)) : P("", !0)], 16, Pi)];
            }),
            _: 2
          }, [t.$slots.loader ? {
            name: "loader",
            fn: _(function(v) {
              var C = v.options;
              return [S(t.$slots, "loader", {
                options: C
              })];
            }),
            key: "0"
          } : void 0]), 1040, ["items", "style", "disabled", "pt"])], 16), S(t.$slots, "footer", {
            value: t.d_value,
            options: r.visibleOptions
          }), !t.options || t.options && t.options.length === 0 ? (f(), m("span", c({
            key: 1,
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, t.ptm("hiddenEmptyMessage"), {
            "data-p-hidden-accessible": !0
          }), H(r.emptyMessageText), 17)) : P("", !0), k("span", c({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, t.ptm("hiddenSelectedMessage"), {
            "data-p-hidden-accessible": !0
          }), H(r.selectedMessageText), 17), k("span", c({
            ref: "lastHiddenFocusableElementOnOverlay",
            role: "presentation",
            "aria-hidden": "true",
            class: "p-hidden-accessible p-hidden-focusable",
            tabindex: 0,
            onFocus: e[9] || (e[9] = function() {
              return r.onLastHiddenFocus && r.onLastHiddenFocus.apply(r, arguments);
            })
          }, t.ptm("hiddenLastFocusableEl"), {
            "data-p-hidden-accessible": !0,
            "data-p-hidden-focusable": !0
          }), null, 16)], 16, zi)) : P("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onLeave", "onAfterLeave"])];
    }),
    _: 3
  }, 8, ["appendTo"])], 16, $i);
}
Ai.render = Vi;
export {
  Ri as P,
  Ai as s
};
//# sourceMappingURL=index-DlcaE2y7.js.map
