import { m as it, c as N, C as jt, d as ut, g as E, F as At, N as L, S as C, B as P, f as It, z as Ut, h as zt, l as Z, n as Mt, i as gt, j as J, Q as Rt, k as nt, T as vt, R as ft, v as Wt, o as Kt, K as Ht, p as Ft, U as Gt, u as qt, a as Jt, b as Qt, _ as Xt, q as Yt, e as mt, W as Zt, s as tn, P as nn } from "./styles-ENbzq8HT.js";
import { useId as en, mergeProps as T, openBlock as O, createElementBlock as I, createElementVNode as Lt, renderSlot as U, createTextVNode as on, toDisplayString as Y, resolveComponent as ht, resolveDirective as rn, withDirectives as an, createBlock as et, resolveDynamicComponent as un, withCtx as ln, createCommentVNode as X, normalizeClass as yt, defineComponent as dn, computed as sn, ref as B, onMounted as cn, watch as bn, withModifiers as pn, createVNode as ot, unref as rt } from "vue";
import { loadByTagName as $t, api as at, define as gn } from "@wippy-fe/proxy";
import "@iconify/vue";
function M(...n) {
  if (n) {
    let t = [];
    for (let e = 0; e < n.length; e++) {
      let o = n[e];
      if (!o) continue;
      let r = typeof o;
      if (r === "string" || r === "number") t.push(o);
      else if (r === "object") {
        let i = Array.isArray(o) ? [M(...o)] : Object.entries(o).map(([s, u]) => u ? s : void 0);
        t = i.length ? t.concat(i.filter((s) => !!s)) : t;
      }
    }
    return t.join(" ").trim();
  }
}
var Q = {};
function vn(n = "pui_id_") {
  return Object.hasOwn(Q, n) || (Q[n] = 0), Q[n]++, `${n}${Q[n]}`;
}
var V = {
  _loadedStyleNames: /* @__PURE__ */ new Set(),
  getLoadedStyleNames: function() {
    return this._loadedStyleNames;
  },
  isStyleNameLoaded: function(t) {
    return this._loadedStyleNames.has(t);
  },
  setLoadedStyleName: function(t) {
    this._loadedStyleNames.add(t);
  },
  deleteLoadedStyleName: function(t) {
    this._loadedStyleNames.delete(t);
  },
  clearLoadedStyleNames: function() {
    this._loadedStyleNames.clear();
  }
};
function fn() {
  var n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pc", t = en();
  return "".concat(n).concat(t.replace("v-", "").replaceAll("-", "_"));
}
var _t = P.extend({
  name: "common"
});
function R(n) {
  "@babel/helpers - typeof";
  return R = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, R(n);
}
function mn(n) {
  return Nt(n) || hn(n) || Vt(n) || Et();
}
function hn(n) {
  if (typeof Symbol < "u" && n[Symbol.iterator] != null || n["@@iterator"] != null) return Array.from(n);
}
function D(n, t) {
  return Nt(n) || yn(n, t) || Vt(n, t) || Et();
}
function Et() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Vt(n, t) {
  if (n) {
    if (typeof n == "string") return lt(n, t);
    var e = {}.toString.call(n).slice(8, -1);
    return e === "Object" && n.constructor && (e = n.constructor.name), e === "Map" || e === "Set" ? Array.from(n) : e === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e) ? lt(n, t) : void 0;
  }
}
function lt(n, t) {
  (t == null || t > n.length) && (t = n.length);
  for (var e = 0, o = Array(t); e < t; e++) o[e] = n[e];
  return o;
}
function yn(n, t) {
  var e = n == null ? null : typeof Symbol < "u" && n[Symbol.iterator] || n["@@iterator"];
  if (e != null) {
    var o, r, i, s, u = [], a = !0, l = !1;
    try {
      if (i = (e = e.call(n)).next, t === 0) {
        if (Object(e) !== e) return;
        a = !1;
      } else for (; !(a = (o = i.call(e)).done) && (u.push(o.value), u.length !== t); a = !0) ;
    } catch (c) {
      l = !0, r = c;
    } finally {
      try {
        if (!a && e.return != null && (s = e.return(), Object(s) !== s)) return;
      } finally {
        if (l) throw r;
      }
    }
    return u;
  }
}
function Nt(n) {
  if (Array.isArray(n)) return n;
}
function St(n, t) {
  var e = Object.keys(n);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(n);
    t && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(n, r).enumerable;
    })), e.push.apply(e, o);
  }
  return e;
}
function y(n) {
  for (var t = 1; t < arguments.length; t++) {
    var e = arguments[t] != null ? arguments[t] : {};
    t % 2 ? St(Object(e), !0).forEach(function(o) {
      z(n, o, e[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(n, Object.getOwnPropertyDescriptors(e)) : St(Object(e)).forEach(function(o) {
      Object.defineProperty(n, o, Object.getOwnPropertyDescriptor(e, o));
    });
  }
  return n;
}
function z(n, t, e) {
  return (t = $n(t)) in n ? Object.defineProperty(n, t, { value: e, enumerable: !0, configurable: !0, writable: !0 }) : n[t] = e, n;
}
function $n(n) {
  var t = _n(n, "string");
  return R(t) == "symbol" ? t : t + "";
}
function _n(n, t) {
  if (R(n) != "object" || !n) return n;
  var e = n[Symbol.toPrimitive];
  if (e !== void 0) {
    var o = e.call(n, t);
    if (R(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(n);
}
var pt = {
  name: "BaseComponent",
  props: {
    pt: {
      type: Object,
      default: void 0
    },
    ptOptions: {
      type: Object,
      default: void 0
    },
    unstyled: {
      type: Boolean,
      default: void 0
    },
    dt: {
      type: Object,
      default: void 0
    }
  },
  inject: {
    $parentInstance: {
      default: void 0
    }
  },
  watch: {
    isUnstyled: {
      immediate: !0,
      handler: function(t) {
        L.off("theme:change", this._loadCoreStyles), t || (this._loadCoreStyles(), this._themeChangeListener(this._loadCoreStyles));
      }
    },
    dt: {
      immediate: !0,
      handler: function(t, e) {
        var o = this;
        L.off("theme:change", this._themeScopedListener), t ? (this._loadScopedThemeStyles(t), this._themeScopedListener = function() {
          return o._loadScopedThemeStyles(t);
        }, this._themeChangeListener(this._themeScopedListener)) : this._unloadScopedThemeStyles();
      }
    }
  },
  scopedStyleEl: void 0,
  rootEl: void 0,
  uid: void 0,
  $attrSelector: void 0,
  beforeCreate: function() {
    var t, e, o, r, i, s, u, a, l, c, d, p = (t = this.pt) === null || t === void 0 ? void 0 : t._usept, v = p ? (e = this.pt) === null || e === void 0 || (e = e.originalValue) === null || e === void 0 ? void 0 : e[this.$.type.name] : void 0, g = p ? (o = this.pt) === null || o === void 0 || (o = o.value) === null || o === void 0 ? void 0 : o[this.$.type.name] : this.pt;
    (r = g || v) === null || r === void 0 || (r = r.hooks) === null || r === void 0 || (i = r.onBeforeCreate) === null || i === void 0 || i.call(r);
    var f = (s = this.$primevueConfig) === null || s === void 0 || (s = s.pt) === null || s === void 0 ? void 0 : s._usept, h = f ? (u = this.$primevue) === null || u === void 0 || (u = u.config) === null || u === void 0 || (u = u.pt) === null || u === void 0 ? void 0 : u.originalValue : void 0, _ = f ? (a = this.$primevue) === null || a === void 0 || (a = a.config) === null || a === void 0 || (a = a.pt) === null || a === void 0 ? void 0 : a.value : (l = this.$primevue) === null || l === void 0 || (l = l.config) === null || l === void 0 ? void 0 : l.pt;
    (c = _ || h) === null || c === void 0 || (c = c[this.$.type.name]) === null || c === void 0 || (c = c.hooks) === null || c === void 0 || (d = c.onBeforeCreate) === null || d === void 0 || d.call(c), this.$attrSelector = fn(), this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
  },
  created: function() {
    this._hook("onCreated");
  },
  beforeMount: function() {
    var t;
    this.rootEl = Ut(zt(this.$el) ? this.$el : (t = this.$el) === null || t === void 0 ? void 0 : t.parentElement, "[".concat(this.$attrSelector, "]")), this.rootEl && (this.rootEl.$pc = y({
      name: this.$.type.name,
      attrSelector: this.$attrSelector
    }, this.$params)), this._loadStyles(), this._hook("onBeforeMount");
  },
  mounted: function() {
    this._hook("onMounted");
  },
  beforeUpdate: function() {
    this._hook("onBeforeUpdate");
  },
  updated: function() {
    this._hook("onUpdated");
  },
  beforeUnmount: function() {
    this._hook("onBeforeUnmount");
  },
  unmounted: function() {
    this._removeThemeListeners(), this._unloadScopedThemeStyles(), this._hook("onUnmounted");
  },
  methods: {
    _hook: function(t) {
      if (!this.$options.hostName) {
        var e = this._usePT(this._getPT(this.pt, this.$.type.name), this._getOptionValue, "hooks.".concat(t)), o = this._useDefaultPT(this._getOptionValue, "hooks.".concat(t));
        e?.(), o?.();
      }
    },
    _mergeProps: function(t) {
      for (var e = arguments.length, o = new Array(e > 1 ? e - 1 : 0), r = 1; r < e; r++)
        o[r - 1] = arguments[r];
      return It(t) ? t.apply(void 0, o) : T.apply(void 0, o);
    },
    _load: function() {
      V.isStyleNameLoaded("base") || (P.loadCSS(this.$styleOptions), this._loadGlobalStyles(), V.setLoadedStyleName("base")), this._loadThemeStyles();
    },
    _loadStyles: function() {
      this._load(), this._themeChangeListener(this._load);
    },
    _loadCoreStyles: function() {
      var t, e;
      !V.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (e = this.$style) !== null && e !== void 0 && e.name && (_t.loadCSS(this.$styleOptions), this.$options.style && this.$style.loadCSS(this.$styleOptions), V.setLoadedStyleName(this.$style.name));
    },
    _loadGlobalStyles: function() {
      var t = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
      ut(t) && P.load(t, y({
        name: "global"
      }, this.$styleOptions));
    },
    _loadThemeStyles: function() {
      var t, e;
      if (!(this.isUnstyled || this.$theme === "none")) {
        if (!C.isStyleNameLoaded("common")) {
          var o, r, i = ((o = this.$style) === null || o === void 0 || (r = o.getCommonTheme) === null || r === void 0 ? void 0 : r.call(o)) || {}, s = i.primitive, u = i.semantic, a = i.global, l = i.style;
          P.load(s?.css, y({
            name: "primitive-variables"
          }, this.$styleOptions)), P.load(u?.css, y({
            name: "semantic-variables"
          }, this.$styleOptions)), P.load(a?.css, y({
            name: "global-variables"
          }, this.$styleOptions)), P.loadStyle(y({
            name: "global-style"
          }, this.$styleOptions), l), C.setLoadedStyleName("common");
        }
        if (!C.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (e = this.$style) !== null && e !== void 0 && e.name) {
          var c, d, p, v, g = ((c = this.$style) === null || c === void 0 || (d = c.getComponentTheme) === null || d === void 0 ? void 0 : d.call(c)) || {}, f = g.css, h = g.style;
          (p = this.$style) === null || p === void 0 || p.load(f, y({
            name: "".concat(this.$style.name, "-variables")
          }, this.$styleOptions)), (v = this.$style) === null || v === void 0 || v.loadStyle(y({
            name: "".concat(this.$style.name, "-style")
          }, this.$styleOptions), h), C.setLoadedStyleName(this.$style.name);
        }
        if (!C.isStyleNameLoaded("layer-order")) {
          var _, k, w = (_ = this.$style) === null || _ === void 0 || (k = _.getLayerOrderThemeCSS) === null || k === void 0 ? void 0 : k.call(_);
          P.load(w, y({
            name: "layer-order",
            first: !0
          }, this.$styleOptions)), C.setLoadedStyleName("layer-order");
        }
      }
    },
    _loadScopedThemeStyles: function(t) {
      var e, o, r, i = ((e = this.$style) === null || e === void 0 || (o = e.getPresetTheme) === null || o === void 0 ? void 0 : o.call(e, t, "[".concat(this.$attrSelector, "]"))) || {}, s = i.css, u = (r = this.$style) === null || r === void 0 ? void 0 : r.load(s, y({
        name: "".concat(this.$attrSelector, "-").concat(this.$style.name)
      }, this.$styleOptions));
      this.scopedStyleEl = u.el;
    },
    _unloadScopedThemeStyles: function() {
      var t;
      (t = this.scopedStyleEl) === null || t === void 0 || (t = t.value) === null || t === void 0 || t.remove();
    },
    _themeChangeListener: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
      };
      V.clearLoadedStyleNames(), L.on("theme:change", t);
    },
    _removeThemeListeners: function() {
      L.off("theme:change", this._loadCoreStyles), L.off("theme:change", this._load), L.off("theme:change", this._themeScopedListener);
    },
    _getHostInstance: function(t) {
      return t ? this.$options.hostName ? t.$.type.name === this.$options.hostName ? t : this._getHostInstance(t.$parentInstance) : t.$parentInstance : void 0;
    },
    _getPropValue: function(t) {
      var e;
      return this[t] || ((e = this._getHostInstance(this)) === null || e === void 0 ? void 0 : e[t]);
    },
    _getOptionValue: function(t) {
      var e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return At(t, e, o);
    },
    _getPTValue: function() {
      var t, e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, i = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, s = /./g.test(o) && !!r[o.split(".")[0]], u = this._getPropValue("ptOptions") || ((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.ptOptions) || {}, a = u.mergeSections, l = a === void 0 ? !0 : a, c = u.mergeProps, d = c === void 0 ? !1 : c, p = i ? s ? this._useGlobalPT(this._getPTClassValue, o, r) : this._useDefaultPT(this._getPTClassValue, o, r) : void 0, v = s ? void 0 : this._getPTSelf(e, this._getPTClassValue, o, y(y({}, r), {}, {
        global: p || {}
      })), g = this._getPTDatasets(o);
      return l || !l && v ? d ? this._mergeProps(d, p, v, g) : y(y(y({}, p), v), g) : y(y({}, v), g);
    },
    _getPTSelf: function() {
      for (var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, e = arguments.length, o = new Array(e > 1 ? e - 1 : 0), r = 1; r < e; r++)
        o[r - 1] = arguments[r];
      return T(
        this._usePT.apply(this, [this._getPT(t, this.$name)].concat(o)),
        // Exp; <component :pt="{}"
        this._usePT.apply(this, [this.$_attrsPT].concat(o))
        // Exp; <component :pt:[passthrough_key]:[attribute]="{value}" or <component :pt:[passthrough_key]="() =>{value}"
      );
    },
    _getPTDatasets: function() {
      var t, e, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = "data-pc-", i = o === "root" && ut((t = this.pt) === null || t === void 0 ? void 0 : t["data-pc-section"]);
      return o !== "transition" && y(y({}, o === "root" && y(y(z({}, "".concat(r, "name"), E(i ? (e = this.pt) === null || e === void 0 ? void 0 : e["data-pc-section"] : this.$.type.name)), i && z({}, "".concat(r, "extend"), E(this.$.type.name))), {}, z({}, "".concat(this.$attrSelector), ""))), {}, z({}, "".concat(r, "section"), E(o)));
    },
    _getPTClassValue: function() {
      var t = this._getOptionValue.apply(this, arguments);
      return N(t) || jt(t) ? {
        class: t
      } : t;
    },
    _getPT: function(t) {
      var e = this, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 ? arguments[2] : void 0, i = function(u) {
        var a, l = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, c = r ? r(u) : u, d = E(o), p = E(e.$name);
        return (a = l ? d !== p ? c?.[d] : void 0 : c?.[d]) !== null && a !== void 0 ? a : c;
      };
      return t != null && t.hasOwnProperty("_usept") ? {
        _usept: t._usept,
        originalValue: i(t.originalValue),
        value: i(t.value)
      } : i(t, !0);
    },
    _usePT: function(t, e, o, r) {
      var i = function(f) {
        return e(f, o, r);
      };
      if (t != null && t.hasOwnProperty("_usept")) {
        var s, u = t._usept || ((s = this.$primevueConfig) === null || s === void 0 ? void 0 : s.ptOptions) || {}, a = u.mergeSections, l = a === void 0 ? !0 : a, c = u.mergeProps, d = c === void 0 ? !1 : c, p = i(t.originalValue), v = i(t.value);
        return p === void 0 && v === void 0 ? void 0 : N(v) ? v : N(p) ? p : l || !l && v ? d ? this._mergeProps(d, p, v) : y(y({}, p), v) : v;
      }
      return i(t);
    },
    _useGlobalPT: function(t, e, o) {
      return this._usePT(this.globalPT, t, e, o);
    },
    _useDefaultPT: function(t, e, o) {
      return this._usePT(this.defaultPT, t, e, o);
    },
    ptm: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this._getPTValue(this.pt, t, y(y({}, this.$params), e));
    },
    ptmi: function() {
      var t, e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = T(this.$_attrsWithoutPT, this.ptm(e, o));
      return r?.hasOwnProperty("id") && ((t = r.id) !== null && t !== void 0 || (r.id = this.$id)), r;
    },
    ptmo: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return this._getPTValue(t, e, y({
        instance: this
      }, o), !1);
    },
    cx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this.isUnstyled ? void 0 : this._getOptionValue(this.$style.classes, t, y(y({}, this.$params), e));
    },
    sx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      if (e) {
        var r = this._getOptionValue(this.$style.inlineStyles, t, y(y({}, this.$params), o)), i = this._getOptionValue(_t.inlineStyles, t, y(y({}, this.$params), o));
        return [i, r];
      }
    }
  },
  computed: {
    globalPT: function() {
      var t, e = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(o) {
        return it(o, {
          instance: e
        });
      });
    },
    defaultPT: function() {
      var t, e = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(o) {
        return e._getOptionValue(o, e.$name, y({}, e.$params)) || it(o, y({}, e.$params));
      });
    },
    isUnstyled: function() {
      var t;
      return this.unstyled !== void 0 ? this.unstyled : (t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.unstyled;
    },
    $id: function() {
      return this.$attrs.id || this.uid;
    },
    $inProps: function() {
      var t, e = Object.keys(((t = this.$.vnode) === null || t === void 0 ? void 0 : t.props) || {});
      return Object.fromEntries(Object.entries(this.$props).filter(function(o) {
        var r = D(o, 1), i = r[0];
        return e?.includes(i);
      }));
    },
    $theme: function() {
      var t;
      return (t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.theme;
    },
    $style: function() {
      return y(y({
        classes: void 0,
        inlineStyles: void 0,
        load: function() {
        },
        loadCSS: function() {
        },
        loadStyle: function() {
        }
      }, (this._getHostInstance(this) || {}).$style), this.$options.style);
    },
    $styleOptions: function() {
      var t;
      return {
        nonce: (t = this.$primevueConfig) === null || t === void 0 || (t = t.csp) === null || t === void 0 ? void 0 : t.nonce
      };
    },
    $primevueConfig: function() {
      var t;
      return (t = this.$primevue) === null || t === void 0 ? void 0 : t.config;
    },
    $name: function() {
      return this.$options.hostName || this.$.type.name;
    },
    $params: function() {
      var t = this._getHostInstance(this) || this.$parent;
      return {
        instance: this,
        props: this.$props,
        state: this.$data,
        attrs: this.$attrs,
        parent: {
          instance: t,
          props: t?.$props,
          state: t?.$data,
          attrs: t?.$attrs
        }
      };
    },
    $_attrsPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(t) {
        var e = D(t, 1), o = e[0];
        return o?.startsWith("pt:");
      }).reduce(function(t, e) {
        var o = D(e, 2), r = o[0], i = o[1], s = r.split(":"), u = mn(s), a = lt(u).slice(1);
        return a?.reduce(function(l, c, d, p) {
          return !l[c] && (l[c] = d === p.length - 1 ? i : {}), l[c];
        }, t), t;
      }, {});
    },
    $_attrsWithoutPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(t) {
        var e = D(t, 1), o = e[0];
        return !(o != null && o.startsWith("pt:"));
      }).reduce(function(t, e) {
        var o = D(e, 2), r = o[0], i = o[1];
        return t[r] = i, t;
      }, {});
    }
  }
}, Sn = `
.p-icon {
    display: inline-block;
    vertical-align: baseline;
    flex-shrink: 0;
}

.p-icon-spin {
    -webkit-animation: p-icon-spin 2s infinite linear;
    animation: p-icon-spin 2s infinite linear;
}

@-webkit-keyframes p-icon-spin {
    0% {
        -webkit-transform: rotate(0deg);
        transform: rotate(0deg);
    }
    100% {
        -webkit-transform: rotate(359deg);
        transform: rotate(359deg);
    }
}

@keyframes p-icon-spin {
    0% {
        -webkit-transform: rotate(0deg);
        transform: rotate(0deg);
    }
    100% {
        -webkit-transform: rotate(359deg);
        transform: rotate(359deg);
    }
}
`, kn = P.extend({
  name: "baseicon",
  css: Sn
});
function W(n) {
  "@babel/helpers - typeof";
  return W = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, W(n);
}
function kt(n, t) {
  var e = Object.keys(n);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(n);
    t && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(n, r).enumerable;
    })), e.push.apply(e, o);
  }
  return e;
}
function wt(n) {
  for (var t = 1; t < arguments.length; t++) {
    var e = arguments[t] != null ? arguments[t] : {};
    t % 2 ? kt(Object(e), !0).forEach(function(o) {
      wn(n, o, e[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(n, Object.getOwnPropertyDescriptors(e)) : kt(Object(e)).forEach(function(o) {
      Object.defineProperty(n, o, Object.getOwnPropertyDescriptor(e, o));
    });
  }
  return n;
}
function wn(n, t, e) {
  return (t = Pn(t)) in n ? Object.defineProperty(n, t, { value: e, enumerable: !0, configurable: !0, writable: !0 }) : n[t] = e, n;
}
function Pn(n) {
  var t = xn(n, "string");
  return W(t) == "symbol" ? t : t + "";
}
function xn(n, t) {
  if (W(n) != "object" || !n) return n;
  var e = n[Symbol.toPrimitive];
  if (e !== void 0) {
    var o = e.call(n, t);
    if (W(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(n);
}
var Tn = {
  name: "BaseIcon",
  extends: pt,
  props: {
    label: {
      type: String,
      default: void 0
    },
    spin: {
      type: Boolean,
      default: !1
    }
  },
  style: kn,
  provide: function() {
    return {
      $pcIcon: this,
      $parentInstance: this
    };
  },
  methods: {
    pti: function() {
      var t = Z(this.label);
      return wt(wt({}, !this.isUnstyled && {
        class: ["p-icon", {
          "p-icon-spin": this.spin
        }]
      }), {}, {
        role: t ? void 0 : "img",
        "aria-label": t ? void 0 : this.label,
        "aria-hidden": t
      });
    }
  }
};
function K(n) {
  "@babel/helpers - typeof";
  return K = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, K(n);
}
function Pt(n, t) {
  return An(n) || jn(n, t) || On(n, t) || Cn();
}
function Cn() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function On(n, t) {
  if (n) {
    if (typeof n == "string") return xt(n, t);
    var e = {}.toString.call(n).slice(8, -1);
    return e === "Object" && n.constructor && (e = n.constructor.name), e === "Map" || e === "Set" ? Array.from(n) : e === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e) ? xt(n, t) : void 0;
  }
}
function xt(n, t) {
  (t == null || t > n.length) && (t = n.length);
  for (var e = 0, o = Array(t); e < t; e++) o[e] = n[e];
  return o;
}
function jn(n, t) {
  var e = n == null ? null : typeof Symbol < "u" && n[Symbol.iterator] || n["@@iterator"];
  if (e != null) {
    var o, r, i, s, u = [], a = !0, l = !1;
    try {
      if (i = (e = e.call(n)).next, t !== 0) for (; !(a = (o = i.call(e)).done) && (u.push(o.value), u.length !== t); a = !0) ;
    } catch (c) {
      l = !0, r = c;
    } finally {
      try {
        if (!a && e.return != null && (s = e.return(), Object(s) !== s)) return;
      } finally {
        if (l) throw r;
      }
    }
    return u;
  }
}
function An(n) {
  if (Array.isArray(n)) return n;
}
function Tt(n, t) {
  var e = Object.keys(n);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(n);
    t && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(n, r).enumerable;
    })), e.push.apply(e, o);
  }
  return e;
}
function $(n) {
  for (var t = 1; t < arguments.length; t++) {
    var e = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Tt(Object(e), !0).forEach(function(o) {
      dt(n, o, e[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(n, Object.getOwnPropertyDescriptors(e)) : Tt(Object(e)).forEach(function(o) {
      Object.defineProperty(n, o, Object.getOwnPropertyDescriptor(e, o));
    });
  }
  return n;
}
function dt(n, t, e) {
  return (t = In(t)) in n ? Object.defineProperty(n, t, { value: e, enumerable: !0, configurable: !0, writable: !0 }) : n[t] = e, n;
}
function In(n) {
  var t = Ln(n, "string");
  return K(t) == "symbol" ? t : t + "";
}
function Ln(n, t) {
  if (K(n) != "object" || !n) return n;
  var e = n[Symbol.toPrimitive];
  if (e !== void 0) {
    var o = e.call(n, t);
    if (K(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(n);
}
var m = {
  _getMeta: function() {
    return [gt(arguments.length <= 0 ? void 0 : arguments[0]) || arguments.length <= 0 ? void 0 : arguments[0], it(gt(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getConfig: function(t, e) {
    var o, r, i;
    return (o = (t == null || (r = t.instance) === null || r === void 0 ? void 0 : r.$primevue) || (e == null || (i = e.ctx) === null || i === void 0 || (i = i.appContext) === null || i === void 0 || (i = i.config) === null || i === void 0 || (i = i.globalProperties) === null || i === void 0 ? void 0 : i.$primevue)) === null || o === void 0 ? void 0 : o.config;
  },
  _getOptionValue: At,
  _getPTValue: function() {
    var t, e, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", s = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, u = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, a = function() {
      var k = m._getOptionValue.apply(m, arguments);
      return N(k) || jt(k) ? {
        class: k
      } : k;
    }, l = ((t = o.binding) === null || t === void 0 || (t = t.value) === null || t === void 0 ? void 0 : t.ptOptions) || ((e = o.$primevueConfig) === null || e === void 0 ? void 0 : e.ptOptions) || {}, c = l.mergeSections, d = c === void 0 ? !0 : c, p = l.mergeProps, v = p === void 0 ? !1 : p, g = u ? m._useDefaultPT(o, o.defaultPT(), a, i, s) : void 0, f = m._usePT(o, m._getPT(r, o.$name), a, i, $($({}, s), {}, {
      global: g || {}
    })), h = m._getPTDatasets(o, i);
    return d || !d && f ? v ? m._mergeProps(o, v, g, f, h) : $($($({}, g), f), h) : $($({}, f), h);
  },
  _getPTDatasets: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = "data-pc-";
    return $($({}, e === "root" && dt({}, "".concat(o, "name"), E(t.$name))), {}, dt({}, "".concat(o, "section"), E(e)));
  },
  _getPT: function(t) {
    var e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 ? arguments[2] : void 0, r = function(s) {
      var u, a = o ? o(s) : s, l = E(e);
      return (u = a?.[l]) !== null && u !== void 0 ? u : a;
    };
    return t && Object.hasOwn(t, "_usept") ? {
      _usept: t._usept,
      originalValue: r(t.originalValue),
      value: r(t.value)
    } : r(t);
  },
  _usePT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, e = arguments.length > 1 ? arguments[1] : void 0, o = arguments.length > 2 ? arguments[2] : void 0, r = arguments.length > 3 ? arguments[3] : void 0, i = arguments.length > 4 ? arguments[4] : void 0, s = function(h) {
      return o(h, r, i);
    };
    if (e && Object.hasOwn(e, "_usept")) {
      var u, a = e._usept || ((u = t.$primevueConfig) === null || u === void 0 ? void 0 : u.ptOptions) || {}, l = a.mergeSections, c = l === void 0 ? !0 : l, d = a.mergeProps, p = d === void 0 ? !1 : d, v = s(e.originalValue), g = s(e.value);
      return v === void 0 && g === void 0 ? void 0 : N(g) ? g : N(v) ? v : c || !c && g ? p ? m._mergeProps(t, p, v, g) : $($({}, v), g) : g;
    }
    return s(e);
  },
  _useDefaultPT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = arguments.length > 2 ? arguments[2] : void 0, r = arguments.length > 3 ? arguments[3] : void 0, i = arguments.length > 4 ? arguments[4] : void 0;
    return m._usePT(t, e, o, r, i);
  },
  _loadStyles: function() {
    var t, e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 ? arguments[1] : void 0, r = arguments.length > 2 ? arguments[2] : void 0, i = m._getConfig(o, r), s = {
      nonce: i == null || (t = i.csp) === null || t === void 0 ? void 0 : t.nonce
    };
    m._loadCoreStyles(e, s), m._loadThemeStyles(e, s), m._loadScopedThemeStyles(e, s), m._removeThemeListeners(e), e.$loadStyles = function() {
      return m._loadThemeStyles(e, s);
    }, m._themeChangeListener(e.$loadStyles);
  },
  _loadCoreStyles: function() {
    var t, e, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 ? arguments[1] : void 0;
    if (!V.isStyleNameLoaded((t = o.$style) === null || t === void 0 ? void 0 : t.name) && (e = o.$style) !== null && e !== void 0 && e.name) {
      var i;
      P.loadCSS(r), (i = o.$style) === null || i === void 0 || i.loadCSS(r), V.setLoadedStyleName(o.$style.name);
    }
  },
  _loadThemeStyles: function() {
    var t, e, o, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, i = arguments.length > 1 ? arguments[1] : void 0;
    if (!(r != null && r.isUnstyled() || (r == null || (t = r.theme) === null || t === void 0 ? void 0 : t.call(r)) === "none")) {
      if (!C.isStyleNameLoaded("common")) {
        var s, u, a = ((s = r.$style) === null || s === void 0 || (u = s.getCommonTheme) === null || u === void 0 ? void 0 : u.call(s)) || {}, l = a.primitive, c = a.semantic, d = a.global, p = a.style;
        P.load(l?.css, $({
          name: "primitive-variables"
        }, i)), P.load(c?.css, $({
          name: "semantic-variables"
        }, i)), P.load(d?.css, $({
          name: "global-variables"
        }, i)), P.loadStyle($({
          name: "global-style"
        }, i), p), C.setLoadedStyleName("common");
      }
      if (!C.isStyleNameLoaded((e = r.$style) === null || e === void 0 ? void 0 : e.name) && (o = r.$style) !== null && o !== void 0 && o.name) {
        var v, g, f, h, _ = ((v = r.$style) === null || v === void 0 || (g = v.getDirectiveTheme) === null || g === void 0 ? void 0 : g.call(v)) || {}, k = _.css, w = _.style;
        (f = r.$style) === null || f === void 0 || f.load(k, $({
          name: "".concat(r.$style.name, "-variables")
        }, i)), (h = r.$style) === null || h === void 0 || h.loadStyle($({
          name: "".concat(r.$style.name, "-style")
        }, i), w), C.setLoadedStyleName(r.$style.name);
      }
      if (!C.isStyleNameLoaded("layer-order")) {
        var b, S, A = (b = r.$style) === null || b === void 0 || (S = b.getLayerOrderThemeCSS) === null || S === void 0 ? void 0 : S.call(b);
        P.load(A, $({
          name: "layer-order",
          first: !0
        }, i)), C.setLoadedStyleName("layer-order");
      }
    }
  },
  _loadScopedThemeStyles: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, e = arguments.length > 1 ? arguments[1] : void 0, o = t.preset();
    if (o && t.$attrSelector) {
      var r, i, s, u = ((r = t.$style) === null || r === void 0 || (i = r.getPresetTheme) === null || i === void 0 ? void 0 : i.call(r, o, "[".concat(t.$attrSelector, "]"))) || {}, a = u.css, l = (s = t.$style) === null || s === void 0 ? void 0 : s.load(a, $({
        name: "".concat(t.$attrSelector, "-").concat(t.$style.name)
      }, e));
      t.scopedStyleEl = l.el;
    }
  },
  _themeChangeListener: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
    };
    V.clearLoadedStyleNames(), L.on("theme:change", t);
  },
  _removeThemeListeners: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    L.off("theme:change", t.$loadStyles), t.$loadStyles = void 0;
  },
  _hook: function(t, e, o, r, i, s) {
    var u, a, l = "on".concat(Mt(e)), c = m._getConfig(r, i), d = o?.$instance, p = m._usePT(d, m._getPT(r == null || (u = r.value) === null || u === void 0 ? void 0 : u.pt, t), m._getOptionValue, "hooks.".concat(l)), v = m._useDefaultPT(d, c == null || (a = c.pt) === null || a === void 0 || (a = a.directives) === null || a === void 0 ? void 0 : a[t], m._getOptionValue, "hooks.".concat(l)), g = {
      el: o,
      binding: r,
      vnode: i,
      prevVnode: s
    };
    p?.(d, g), v?.(d, g);
  },
  /* eslint-disable-next-line no-unused-vars */
  _mergeProps: function() {
    for (var t = arguments.length > 1 ? arguments[1] : void 0, e = arguments.length, o = new Array(e > 2 ? e - 2 : 0), r = 2; r < e; r++)
      o[r - 2] = arguments[r];
    return It(t) ? t.apply(void 0, o) : T.apply(void 0, o);
  },
  _extend: function(t) {
    var e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = function(u, a, l, c, d) {
      var p, v, g, f;
      a._$instances = a._$instances || {};
      var h = m._getConfig(l, c), _ = a._$instances[t] || {}, k = Z(_) ? $($({}, e), e?.methods) : {};
      a._$instances[t] = $($({}, _), {}, {
        /* new instance variables to pass in directive methods */
        $name: t,
        $host: a,
        $binding: l,
        $modifiers: l?.modifiers,
        $value: l?.value,
        $el: _.$el || a || void 0,
        $style: $({
          classes: void 0,
          inlineStyles: void 0,
          load: function() {
          },
          loadCSS: function() {
          },
          loadStyle: function() {
          }
        }, e?.style),
        $primevueConfig: h,
        $attrSelector: (p = a.$pd) === null || p === void 0 || (p = p[t]) === null || p === void 0 ? void 0 : p.attrSelector,
        /* computed instance variables */
        defaultPT: function() {
          return m._getPT(h?.pt, void 0, function(b) {
            var S;
            return b == null || (S = b.directives) === null || S === void 0 ? void 0 : S[t];
          });
        },
        isUnstyled: function() {
          var b, S;
          return ((b = a._$instances[t]) === null || b === void 0 || (b = b.$binding) === null || b === void 0 || (b = b.value) === null || b === void 0 ? void 0 : b.unstyled) !== void 0 ? (S = a._$instances[t]) === null || S === void 0 || (S = S.$binding) === null || S === void 0 || (S = S.value) === null || S === void 0 ? void 0 : S.unstyled : h?.unstyled;
        },
        theme: function() {
          var b;
          return (b = a._$instances[t]) === null || b === void 0 || (b = b.$primevueConfig) === null || b === void 0 ? void 0 : b.theme;
        },
        preset: function() {
          var b;
          return (b = a._$instances[t]) === null || b === void 0 || (b = b.$binding) === null || b === void 0 || (b = b.value) === null || b === void 0 ? void 0 : b.dt;
        },
        /* instance's methods */
        ptm: function() {
          var b, S = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", A = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return m._getPTValue(a._$instances[t], (b = a._$instances[t]) === null || b === void 0 || (b = b.$binding) === null || b === void 0 || (b = b.value) === null || b === void 0 ? void 0 : b.pt, S, $({}, A));
        },
        ptmo: function() {
          var b = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, S = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", A = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return m._getPTValue(a._$instances[t], b, S, A, !1);
        },
        cx: function() {
          var b, S, A = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", tt = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return (b = a._$instances[t]) !== null && b !== void 0 && b.isUnstyled() ? void 0 : m._getOptionValue((S = a._$instances[t]) === null || S === void 0 || (S = S.$style) === null || S === void 0 ? void 0 : S.classes, A, $({}, tt));
        },
        sx: function() {
          var b, S = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", A = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, tt = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return A ? m._getOptionValue((b = a._$instances[t]) === null || b === void 0 || (b = b.$style) === null || b === void 0 ? void 0 : b.inlineStyles, S, $({}, tt)) : void 0;
        }
      }, k), a.$instance = a._$instances[t], (v = (g = a.$instance)[u]) === null || v === void 0 || v.call(g, a, l, c, d), a["$".concat(t)] = a.$instance, m._hook(t, u, a, l, c, d), a.$pd || (a.$pd = {}), a.$pd[t] = $($({}, (f = a.$pd) === null || f === void 0 ? void 0 : f[t]), {}, {
        name: t,
        instance: a._$instances[t]
      });
    }, r = function(u) {
      var a, l, c, d = u._$instances[t], p = d?.watch, v = function(h) {
        var _, k = h.newValue, w = h.oldValue;
        return p == null || (_ = p.config) === null || _ === void 0 ? void 0 : _.call(d, k, w);
      }, g = function(h) {
        var _, k = h.newValue, w = h.oldValue;
        return p == null || (_ = p["config.ripple"]) === null || _ === void 0 ? void 0 : _.call(d, k, w);
      };
      d.$watchersCallback = {
        config: v,
        "config.ripple": g
      }, p == null || (a = p.config) === null || a === void 0 || a.call(d, d?.$primevueConfig), J.on("config:change", v), p == null || (l = p["config.ripple"]) === null || l === void 0 || l.call(d, d == null || (c = d.$primevueConfig) === null || c === void 0 ? void 0 : c.ripple), J.on("config:ripple:change", g);
    }, i = function(u) {
      var a = u._$instances[t].$watchersCallback;
      a && (J.off("config:change", a.config), J.off("config:ripple:change", a["config.ripple"]), u._$instances[t].$watchersCallback = void 0);
    };
    return {
      created: function(u, a, l, c) {
        u.$pd || (u.$pd = {}), u.$pd[t] = {
          name: t,
          attrSelector: vn("pd")
        }, o("created", u, a, l, c);
      },
      beforeMount: function(u, a, l, c) {
        var d;
        m._loadStyles((d = u.$pd[t]) === null || d === void 0 ? void 0 : d.instance, a, l), o("beforeMount", u, a, l, c), r(u);
      },
      mounted: function(u, a, l, c) {
        var d;
        m._loadStyles((d = u.$pd[t]) === null || d === void 0 ? void 0 : d.instance, a, l), o("mounted", u, a, l, c);
      },
      beforeUpdate: function(u, a, l, c) {
        o("beforeUpdate", u, a, l, c);
      },
      updated: function(u, a, l, c) {
        var d;
        m._loadStyles((d = u.$pd[t]) === null || d === void 0 ? void 0 : d.instance, a, l), o("updated", u, a, l, c);
      },
      beforeUnmount: function(u, a, l, c) {
        var d;
        i(u), m._removeThemeListeners((d = u.$pd[t]) === null || d === void 0 ? void 0 : d.instance), o("beforeUnmount", u, a, l, c);
      },
      unmounted: function(u, a, l, c) {
        var d;
        (d = u.$pd[t]) === null || d === void 0 || (d = d.instance) === null || d === void 0 || (d = d.scopedStyleEl) === null || d === void 0 || (d = d.value) === null || d === void 0 || d.remove(), o("unmounted", u, a, l, c);
      }
    };
  },
  extend: function() {
    var t = m._getMeta.apply(m, arguments), e = Pt(t, 2), o = e[0], r = e[1];
    return $({
      extend: function() {
        var s = m._getMeta.apply(m, arguments), u = Pt(s, 2), a = u[0], l = u[1];
        return m.extend(a, $($($({}, r), r?.methods), l));
      }
    }, m._extend(o, r));
  }
}, En = `
    .p-ink {
        display: block;
        position: absolute;
        background: dt('ripple.background');
        border-radius: 100%;
        transform: scale(0);
        pointer-events: none;
    }

    .p-ink-active {
        animation: ripple 0.4s linear;
    }

    @keyframes ripple {
        100% {
            opacity: 0;
            transform: scale(2.5);
        }
    }
`, Vn = {
  root: "p-ink"
}, Nn = P.extend({
  name: "ripple-directive",
  style: En,
  classes: Vn
}), Bn = m.extend({
  style: Nn
});
function H(n) {
  "@babel/helpers - typeof";
  return H = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, H(n);
}
function Dn(n) {
  return Rn(n) || Mn(n) || zn(n) || Un();
}
function Un() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function zn(n, t) {
  if (n) {
    if (typeof n == "string") return st(n, t);
    var e = {}.toString.call(n).slice(8, -1);
    return e === "Object" && n.constructor && (e = n.constructor.name), e === "Map" || e === "Set" ? Array.from(n) : e === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e) ? st(n, t) : void 0;
  }
}
function Mn(n) {
  if (typeof Symbol < "u" && n[Symbol.iterator] != null || n["@@iterator"] != null) return Array.from(n);
}
function Rn(n) {
  if (Array.isArray(n)) return st(n);
}
function st(n, t) {
  (t == null || t > n.length) && (t = n.length);
  for (var e = 0, o = Array(t); e < t; e++) o[e] = n[e];
  return o;
}
function Ct(n, t, e) {
  return (t = Wn(t)) in n ? Object.defineProperty(n, t, { value: e, enumerable: !0, configurable: !0, writable: !0 }) : n[t] = e, n;
}
function Wn(n) {
  var t = Kn(n, "string");
  return H(t) == "symbol" ? t : t + "";
}
function Kn(n, t) {
  if (H(n) != "object" || !n) return n;
  var e = n[Symbol.toPrimitive];
  if (e !== void 0) {
    var o = e.call(n, t);
    if (H(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(n);
}
var Hn = Bn.extend("ripple", {
  watch: {
    "config.ripple": function(t) {
      t ? (this.createRipple(this.$host), this.bindEvents(this.$host), this.$host.setAttribute("data-pd-ripple", !0), this.$host.style.overflow = "hidden", this.$host.style.position = "relative") : (this.remove(this.$host), this.$host.removeAttribute("data-pd-ripple"));
    }
  },
  unmounted: function(t) {
    this.remove(t);
  },
  timeout: void 0,
  methods: {
    bindEvents: function(t) {
      t.addEventListener("mousedown", this.onMouseDown.bind(this));
    },
    unbindEvents: function(t) {
      t.removeEventListener("mousedown", this.onMouseDown.bind(this));
    },
    createRipple: function(t) {
      var e = this.getInk(t);
      e || (e = Gt("span", Ct(Ct({
        role: "presentation",
        "aria-hidden": !0,
        "data-p-ink": !0,
        "data-p-ink-active": !1,
        class: !this.isUnstyled() && this.cx("root"),
        onAnimationEnd: this.onAnimationEnd.bind(this)
      }, this.$attrSelector, ""), "p-bind", this.ptm("root"))), t.appendChild(e), this.$el = e);
    },
    remove: function(t) {
      var e = this.getInk(t);
      e && (this.$host.style.overflow = "", this.$host.style.position = "", this.unbindEvents(t), e.removeEventListener("animationend", this.onAnimationEnd), e.remove());
    },
    onMouseDown: function(t) {
      var e = this, o = t.currentTarget, r = this.getInk(o);
      if (!(!r || getComputedStyle(r, null).display === "none")) {
        if (!this.isUnstyled() && nt(r, "p-ink-active"), r.setAttribute("data-p-ink-active", "false"), !vt(r) && !ft(r)) {
          var i = Math.max(Wt(o), Kt(o));
          r.style.height = i + "px", r.style.width = i + "px";
        }
        var s = Ht(o), u = t.pageX - s.left + document.body.scrollTop - ft(r) / 2, a = t.pageY - s.top + document.body.scrollLeft - vt(r) / 2;
        r.style.top = a + "px", r.style.left = u + "px", !this.isUnstyled() && Ft(r, "p-ink-active"), r.setAttribute("data-p-ink-active", "true"), this.timeout = setTimeout(function() {
          r && (!e.isUnstyled() && nt(r, "p-ink-active"), r.setAttribute("data-p-ink-active", "false"));
        }, 401);
      }
    },
    onAnimationEnd: function(t) {
      this.timeout && clearTimeout(this.timeout), !this.isUnstyled() && nt(t.currentTarget, "p-ink-active"), t.currentTarget.setAttribute("data-p-ink-active", "false");
    },
    getInk: function(t) {
      return t && t.children ? Dn(t.children).find(function(e) {
        return Rt(e, "data-pc-name") === "ripple";
      }) : void 0;
    }
  }
}), Bt = {
  name: "SpinnerIcon",
  extends: Tn
};
function Fn(n) {
  return Qn(n) || Jn(n) || qn(n) || Gn();
}
function Gn() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function qn(n, t) {
  if (n) {
    if (typeof n == "string") return ct(n, t);
    var e = {}.toString.call(n).slice(8, -1);
    return e === "Object" && n.constructor && (e = n.constructor.name), e === "Map" || e === "Set" ? Array.from(n) : e === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e) ? ct(n, t) : void 0;
  }
}
function Jn(n) {
  if (typeof Symbol < "u" && n[Symbol.iterator] != null || n["@@iterator"] != null) return Array.from(n);
}
function Qn(n) {
  if (Array.isArray(n)) return ct(n);
}
function ct(n, t) {
  (t == null || t > n.length) && (t = n.length);
  for (var e = 0, o = Array(t); e < t; e++) o[e] = n[e];
  return o;
}
function Xn(n, t, e, o, r, i) {
  return O(), I("svg", T({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, n.pti()), Fn(t[0] || (t[0] = [Lt("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Bt.render = Xn;
var Yn = `
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
`, Zn = {
  root: function(t) {
    var e = t.props, o = t.instance;
    return ["p-badge p-component", {
      "p-badge-circle": ut(e.value) && String(e.value).length === 1,
      "p-badge-dot": Z(e.value) && !o.$slots.default,
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
}, te = P.extend({
  name: "badge",
  style: Yn,
  classes: Zn
}), ne = {
  name: "BaseBadge",
  extends: pt,
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
  style: te,
  provide: function() {
    return {
      $pcBadge: this,
      $parentInstance: this
    };
  }
};
function F(n) {
  "@babel/helpers - typeof";
  return F = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, F(n);
}
function Ot(n, t, e) {
  return (t = ee(t)) in n ? Object.defineProperty(n, t, { value: e, enumerable: !0, configurable: !0, writable: !0 }) : n[t] = e, n;
}
function ee(n) {
  var t = oe(n, "string");
  return F(t) == "symbol" ? t : t + "";
}
function oe(n, t) {
  if (F(n) != "object" || !n) return n;
  var e = n[Symbol.toPrimitive];
  if (e !== void 0) {
    var o = e.call(n, t);
    if (F(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(n);
}
var Dt = {
  name: "Badge",
  extends: ne,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return M(Ot(Ot({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, re = ["data-p"];
function ae(n, t, e, o, r, i) {
  return O(), I("span", T({
    class: n.cx("root"),
    "data-p": i.dataP
  }, n.ptmi("root")), [U(n.$slots, "default", {}, function() {
    return [on(Y(n.value), 1)];
  })], 16, re);
}
Dt.render = ae;
var ie = `
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
function G(n) {
  "@babel/helpers - typeof";
  return G = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, G(n);
}
function j(n, t, e) {
  return (t = ue(t)) in n ? Object.defineProperty(n, t, { value: e, enumerable: !0, configurable: !0, writable: !0 }) : n[t] = e, n;
}
function ue(n) {
  var t = le(n, "string");
  return G(t) == "symbol" ? t : t + "";
}
function le(n, t) {
  if (G(n) != "object" || !n) return n;
  var e = n[Symbol.toPrimitive];
  if (e !== void 0) {
    var o = e.call(n, t);
    if (G(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(n);
}
var de = {
  root: function(t) {
    var e = t.instance, o = t.props;
    return ["p-button p-component", j(j(j(j(j(j(j(j(j({
      "p-button-icon-only": e.hasIcon && !o.label && !o.badge,
      "p-button-vertical": (o.iconPos === "top" || o.iconPos === "bottom") && o.label,
      "p-button-loading": o.loading,
      "p-button-link": o.link || o.variant === "link"
    }, "p-button-".concat(o.severity), o.severity), "p-button-raised", o.raised), "p-button-rounded", o.rounded), "p-button-text", o.text || o.variant === "text"), "p-button-outlined", o.outlined || o.variant === "outlined"), "p-button-sm", o.size === "small"), "p-button-lg", o.size === "large"), "p-button-plain", o.plain), "p-button-fluid", e.hasFluid)];
  },
  loadingIcon: "p-button-loading-icon",
  icon: function(t) {
    var e = t.props;
    return ["p-button-icon", j({}, "p-button-icon-".concat(e.iconPos), e.label)];
  },
  label: "p-button-label"
}, se = P.extend({
  name: "button",
  style: ie,
  classes: de
}), ce = {
  name: "BaseButton",
  extends: pt,
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
  style: se,
  provide: function() {
    return {
      $pcButton: this,
      $parentInstance: this
    };
  }
};
function q(n) {
  "@babel/helpers - typeof";
  return q = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, q(n);
}
function x(n, t, e) {
  return (t = be(t)) in n ? Object.defineProperty(n, t, { value: e, enumerable: !0, configurable: !0, writable: !0 }) : n[t] = e, n;
}
function be(n) {
  var t = pe(n, "string");
  return q(t) == "symbol" ? t : t + "";
}
function pe(n, t) {
  if (q(n) != "object" || !n) return n;
  var e = n[Symbol.toPrimitive];
  if (e !== void 0) {
    var o = e.call(n, t);
    if (q(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(n);
}
var bt = {
  name: "Button",
  extends: ce,
  inheritAttrs: !1,
  inject: {
    $pcFluid: {
      default: null
    }
  },
  methods: {
    getPTOptions: function(t) {
      var e = t === "root" ? this.ptmi : this.ptm;
      return e(t, {
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
      return T(this.asAttrs, this.a11yAttrs, this.getPTOptions("root"));
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
      return Z(this.fluid) ? !!this.$pcFluid : this.fluid;
    },
    dataP: function() {
      return M(x(x(x(x(x(x(x(x(x(x({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
    },
    dataIconP: function() {
      return M(x(x({}, this.iconPos, this.iconPos), this.size, this.size));
    },
    dataLabelP: function() {
      return M(x(x({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
    }
  },
  components: {
    SpinnerIcon: Bt,
    Badge: Dt
  },
  directives: {
    ripple: Hn
  }
}, ge = ["data-p"], ve = ["data-p"];
function fe(n, t, e, o, r, i) {
  var s = ht("SpinnerIcon"), u = ht("Badge"), a = rn("ripple");
  return n.asChild ? U(n.$slots, "default", {
    key: 1,
    class: yt(n.cx("root")),
    a11yAttrs: i.a11yAttrs
  }) : an((O(), et(un(n.as), T({
    key: 0,
    class: n.cx("root"),
    "data-p": i.dataP
  }, i.attrs), {
    default: ln(function() {
      return [U(n.$slots, "default", {}, function() {
        return [n.loading ? U(n.$slots, "loadingicon", T({
          key: 0,
          class: [n.cx("loadingIcon"), n.cx("icon")]
        }, n.ptm("loadingIcon")), function() {
          return [n.loadingIcon ? (O(), I("span", T({
            key: 0,
            class: [n.cx("loadingIcon"), n.cx("icon"), n.loadingIcon]
          }, n.ptm("loadingIcon")), null, 16)) : (O(), et(s, T({
            key: 1,
            class: [n.cx("loadingIcon"), n.cx("icon")],
            spin: ""
          }, n.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : U(n.$slots, "icon", T({
          key: 1,
          class: [n.cx("icon")]
        }, n.ptm("icon")), function() {
          return [n.icon ? (O(), I("span", T({
            key: 0,
            class: [n.cx("icon"), n.icon, n.iconClass],
            "data-p": i.dataIconP
          }, n.ptm("icon")), null, 16, ge)) : X("", !0)];
        }), n.label ? (O(), I("span", T({
          key: 2,
          class: n.cx("label")
        }, n.ptm("label"), {
          "data-p": i.dataLabelP
        }), Y(n.label), 17, ve)) : X("", !0), n.badge ? (O(), et(u, {
          key: 3,
          value: n.badge,
          class: yt(n.badgeClass),
          severity: n.badgeSeverity,
          unstyled: n.unstyled,
          pt: n.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : X("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[a]]);
}
bt.render = fe;
const me = {
  key: 0,
  class: "kx-2p-r-note"
}, he = {
  key: 1,
  class: "kx-alert",
  role: "alert",
  "data-test": "manage-error"
}, ye = {
  key: 0,
  class: "kx-alert",
  role: "alert"
}, $e = { class: "kx-actions" }, _e = "wc-schema-form", Se = "kickside-transform-assist", ke = /* @__PURE__ */ dn({
  __name: "SyncManage",
  setup(n) {
    const t = qt(), e = Jt();
    function o(g) {
      if (typeof g == "string")
        try {
          g = JSON.parse(g);
        } catch {
          return null;
        }
      return g && typeof g == "object" && !Array.isArray(g) ? g : null;
    }
    const r = sn(() => {
      for (const g of [t.value.config, t.value.value]) {
        const f = o(g)?.id;
        if (typeof f == "string" && f.trim()) return f.trim();
      }
      return "";
    }), i = Qt({ managed: !0 }), s = B(!0), u = B(!1), a = B(!1), l = B(""), c = B("");
    async function d() {
      if (s.value = !0, u.value = !1, l.value = "", !r.value) {
        l.value = "No data sync was given to manage.", s.value = !1;
        return;
      }
      const g = await i.loadCatalog();
      if (g) {
        l.value = g, s.value = !1;
        return;
      }
      try {
        const { data: f } = await at.get(
          `/api/v1/automations/${encodeURIComponent(r.value)}/config`
        );
        if (!f?.success) {
          const _ = typeof f?.error == "string" ? f.error : f?.error?.message;
          throw new Error(_ || "could not load the data sync configuration");
        }
        const h = Yt(f.config);
        if (!h) throw new Error("this data sync has no stored configuration to edit");
        i.seed(h), c.value = h.title, u.value = !0;
      } catch (f) {
        l.value = mt(f, "could not load this data sync");
      } finally {
        s.value = !1;
      }
    }
    async function p() {
      if (!u.value) return;
      const g = i.validationError.value;
      if (g) {
        l.value = g;
        return;
      }
      a.value = !0, l.value = "";
      const f = r.value;
      try {
        const h = i.currentInput(), { data: _ } = await at.put(
          `/api/v1/automations/${encodeURIComponent(f)}`,
          { input: h }
        );
        if (!_?.success) {
          const k = typeof _?.error == "string" ? _.error : _?.error?.message;
          throw new Error(k || "save failed");
        }
        if (h.title !== c.value) {
          const { data: k } = await at.patch(
            `/api/v1/automations/${encodeURIComponent(f)}`,
            { title: h.title }
          );
          if (!k?.success) {
            const w = typeof k?.error == "string" ? k.error : k?.error?.message;
            throw new Error(w || "rename failed");
          }
          c.value = h.title;
        }
        e("change", { id: f }), e("close", {});
      } catch (h) {
        const _ = mt(h, "save failed");
        l.value = _, e("error", { message: _, error: h });
      } finally {
        a.value = !1;
      }
    }
    function v() {
      e("close", {});
    }
    return cn(() => {
      $t(_e, { timeoutMs: 8e3 }).catch(() => {
      }), $t(Se, { timeoutMs: 8e3 }).catch(() => {
      }), d();
    }), bn(r, (g, f) => {
      g !== f && d();
    }), (g, f) => s.value ? (O(), I("div", me, "Loading this data sync…")) : u.value ? (O(), I("form", {
      key: 2,
      class: "kx-flow",
      "data-test": "sync-manage",
      onSubmit: pn(p, ["prevent"])
    }, [
      ot(Xt, { form: rt(i) }, null, 8, ["form"]),
      l.value ? (O(), I("p", ye, Y(l.value), 1)) : X("", !0),
      Lt("div", $e, [
        ot(rt(bt), {
          type: "button",
          label: "Cancel",
          severity: "secondary",
          outlined: "",
          disabled: a.value,
          onClick: v
        }, null, 8, ["disabled"]),
        ot(rt(bt), {
          type: "submit",
          label: "Save",
          "data-test": "sync-manage-save",
          loading: a.value,
          disabled: a.value
        }, null, 8, ["loading", "disabled"])
      ])
    ], 32)) : (O(), I("div", he, Y(l.value), 1));
  }
}), we = {
  type: "object",
  properties: {
    // Config-host convention: { id } names the installed data sync; value is its alias.
    config: { type: "object" },
    value: { type: "object" }
  }
};
class Pe extends Zt {
  static get wippyConfig() {
    return {
      propsSchema: we,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: tn
    };
  }
  static get vueConfig() {
    return { rootComponent: ke, plugins: [nn] };
  }
}
gn(import.meta.url, Pe);
//# sourceMappingURL=sync_manage.js.map
