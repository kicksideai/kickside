import { m as Yo, a as xn, C as Pr, s as zt, g as on, F as Tr, N as nn, S as vt, B as ke, c as Lr, z as gi, b as Oa, l as Do, n as xa, i as Ii, P as $o, Q as Ia, d as Ko, T as pn, R as mn, v as yi, e as Ar, K as Pa, W as Er, U as jr, A as Ta, f as La, L as Vr, h as Ne, j as Cn, I as Pi, k as Aa, r as zr, o as Ea, p as Mr, q as ja, t as Dr, _ as Va, u as Lo, w as za, M as Ti, x as Ma, y as Da, Y as Ba, D as Fa, E as Ra, $ as Na, J as Ua, G as _n, H as qn, O as Mt, V as Ao, X as Pn, Z as Eo, a0 as fn, a1 as Li, a2 as Je, a3 as Xo, a4 as Ai, a5 as Ei, a6 as Ha, a7 as jo, a8 as Ka, a9 as qa, aa as Wa, ab as Ga, ac as Za, ad as Ya, ae as Br, af as Tn, ag as Wn, ah as Fr, ai as Xa, aj as xo, ak as he, al as Ja, am as Qa, an as es, ao as ts, ap as ns, aq as Nn, ar as Gn, as as Un, at as os, au as is, av as rs } from "./styles-Ds_3wigw.js";
import { useId as ki, mergeProps as K, openBlock as p, createElementBlock as h, createElementVNode as c, renderSlot as ae, createTextVNode as F, toDisplayString as k, resolveComponent as Ve, resolveDirective as Bo, withDirectives as Xe, createBlock as xe, resolveDynamicComponent as Ln, withCtx as Ie, createCommentVNode as _, normalizeClass as oe, computed as G, createVNode as P, Transition as Rr, Fragment as X, renderList as ce, normalizeProps as as, createSlots as ss, withModifiers as Io, defineComponent as En, ref as U, watch as lt, nextTick as An, onBeforeUnmount as Nr, normalizeStyle as hn, onUnmounted as $i, onMounted as Fo, readonly as ls, getCurrentInstance as ji, unref as r, vModelText as Po, vShow as zn, vModelCheckbox as us, isRef as tn, withKeys as ds } from "vue";
import { Icon as M } from "@iconify/vue";
import { api as Si, loadByTagName as Ur, host as Hr, on as cs, define as ps } from "@wippy-fe/proxy";
function _t(...t) {
  if (t) {
    let e = [];
    for (let n = 0; n < t.length; n++) {
      let o = t[n];
      if (!o) continue;
      let i = typeof o;
      if (i === "string" || i === "number") e.push(o);
      else if (i === "object") {
        let a = Array.isArray(o) ? [_t(...o)] : Object.entries(o).map(([l, u]) => u ? l : void 0);
        e = a.length ? e.concat(a.filter((l) => !!l)) : e;
      }
    }
    return e.join(" ").trim();
  }
}
var So = {};
function ms(t = "pui_id_") {
  return Object.hasOwn(So, t) || (So[t] = 0), So[t]++, `${t}${So[t]}`;
}
function fs() {
  let t = [], e = (l, u, s = 999) => {
    let d = i(l, u, s), m = d.value + (d.key === l ? 0 : s) + 1;
    return t.push({ key: l, value: m }), m;
  }, n = (l) => {
    t = t.filter((u) => u.value !== l);
  }, o = (l, u) => i(l).value, i = (l, u, s = 0) => [...t].reverse().find((d) => !0) || { key: l, value: s }, a = (l) => l && parseInt(l.style.zIndex, 10) || 0;
  return { get: a, set: (l, u, s) => {
    u && (u.style.zIndex = String(e(l, !0, s)));
  }, clear: (l) => {
    l && (n(a(l)), l.style.zIndex = "");
  }, getCurrent: (l) => o(l) };
}
var In = fs(), rn = {
  _loadedStyleNames: /* @__PURE__ */ new Set(),
  getLoadedStyleNames: function() {
    return this._loadedStyleNames;
  },
  isStyleNameLoaded: function(e) {
    return this._loadedStyleNames.has(e);
  },
  setLoadedStyleName: function(e) {
    this._loadedStyleNames.add(e);
  },
  deleteLoadedStyleName: function(e) {
    this._loadedStyleNames.delete(e);
  },
  clearLoadedStyleNames: function() {
    this._loadedStyleNames.clear();
  }
};
function hs() {
  var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pc", e = ki();
  return "".concat(t).concat(e.replace("v-", "").replaceAll("-", "_"));
}
var Vi = ke.extend({
  name: "common"
});
function Zn(t) {
  "@babel/helpers - typeof";
  return Zn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Zn(t);
}
function bs(t) {
  return Wr(t) || vs(t) || qr(t) || Kr();
}
function vs(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Mn(t, e) {
  return Wr(t) || gs(t, e) || qr(t, e) || Kr();
}
function Kr() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function qr(t, e) {
  if (t) {
    if (typeof t == "string") return Jo(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Jo(t, e) : void 0;
  }
}
function Jo(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function gs(t, e) {
  var n = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (n != null) {
    var o, i, a, l, u = [], s = !0, d = !1;
    try {
      if (a = (n = n.call(t)).next, e === 0) {
        if (Object(n) !== n) return;
        s = !1;
      } else for (; !(s = (o = a.call(n)).done) && (u.push(o.value), u.length !== e); s = !0) ;
    } catch (m) {
      d = !0, i = m;
    } finally {
      try {
        if (!s && n.return != null && (l = n.return(), Object(l) !== l)) return;
      } finally {
        if (d) throw i;
      }
    }
    return u;
  }
}
function Wr(t) {
  if (Array.isArray(t)) return t;
}
function zi(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    e && (o = o.filter(function(i) {
      return Object.getOwnPropertyDescriptor(t, i).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function ue(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? zi(Object(n), !0).forEach(function(o) {
      Fn(t, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : zi(Object(n)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return t;
}
function Fn(t, e, n) {
  return (e = ys(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function ys(t) {
  var e = ks(t, "string");
  return Zn(e) == "symbol" ? e : e + "";
}
function ks(t, e) {
  if (Zn(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (Zn(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var ln = {
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
      handler: function(e) {
        nn.off("theme:change", this._loadCoreStyles), e || (this._loadCoreStyles(), this._themeChangeListener(this._loadCoreStyles));
      }
    },
    dt: {
      immediate: !0,
      handler: function(e, n) {
        var o = this;
        nn.off("theme:change", this._themeScopedListener), e ? (this._loadScopedThemeStyles(e), this._themeScopedListener = function() {
          return o._loadScopedThemeStyles(e);
        }, this._themeChangeListener(this._themeScopedListener)) : this._unloadScopedThemeStyles();
      }
    }
  },
  scopedStyleEl: void 0,
  rootEl: void 0,
  uid: void 0,
  $attrSelector: void 0,
  beforeCreate: function() {
    var e, n, o, i, a, l, u, s, d, m, f, v = (e = this.pt) === null || e === void 0 ? void 0 : e._usept, g = v ? (n = this.pt) === null || n === void 0 || (n = n.originalValue) === null || n === void 0 ? void 0 : n[this.$.type.name] : void 0, w = v ? (o = this.pt) === null || o === void 0 || (o = o.value) === null || o === void 0 ? void 0 : o[this.$.type.name] : this.pt;
    (i = w || g) === null || i === void 0 || (i = i.hooks) === null || i === void 0 || (a = i.onBeforeCreate) === null || a === void 0 || a.call(i);
    var x = (l = this.$primevueConfig) === null || l === void 0 || (l = l.pt) === null || l === void 0 ? void 0 : l._usept, S = x ? (u = this.$primevue) === null || u === void 0 || (u = u.config) === null || u === void 0 || (u = u.pt) === null || u === void 0 ? void 0 : u.originalValue : void 0, T = x ? (s = this.$primevue) === null || s === void 0 || (s = s.config) === null || s === void 0 || (s = s.pt) === null || s === void 0 ? void 0 : s.value : (d = this.$primevue) === null || d === void 0 || (d = d.config) === null || d === void 0 ? void 0 : d.pt;
    (m = T || S) === null || m === void 0 || (m = m[this.$.type.name]) === null || m === void 0 || (m = m.hooks) === null || m === void 0 || (f = m.onBeforeCreate) === null || f === void 0 || f.call(m), this.$attrSelector = hs(), this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
  },
  created: function() {
    this._hook("onCreated");
  },
  beforeMount: function() {
    var e;
    this.rootEl = gi(Oa(this.$el) ? this.$el : (e = this.$el) === null || e === void 0 ? void 0 : e.parentElement, "[".concat(this.$attrSelector, "]")), this.rootEl && (this.rootEl.$pc = ue({
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
    _hook: function(e) {
      if (!this.$options.hostName) {
        var n = this._usePT(this._getPT(this.pt, this.$.type.name), this._getOptionValue, "hooks.".concat(e)), o = this._useDefaultPT(this._getOptionValue, "hooks.".concat(e));
        n?.(), o?.();
      }
    },
    _mergeProps: function(e) {
      for (var n = arguments.length, o = new Array(n > 1 ? n - 1 : 0), i = 1; i < n; i++)
        o[i - 1] = arguments[i];
      return Lr(e) ? e.apply(void 0, o) : K.apply(void 0, o);
    },
    _load: function() {
      rn.isStyleNameLoaded("base") || (ke.loadCSS(this.$styleOptions), this._loadGlobalStyles(), rn.setLoadedStyleName("base")), this._loadThemeStyles();
    },
    _loadStyles: function() {
      this._load(), this._themeChangeListener(this._load);
    },
    _loadCoreStyles: function() {
      var e, n;
      !rn.isStyleNameLoaded((e = this.$style) === null || e === void 0 ? void 0 : e.name) && (n = this.$style) !== null && n !== void 0 && n.name && (Vi.loadCSS(this.$styleOptions), this.$options.style && this.$style.loadCSS(this.$styleOptions), rn.setLoadedStyleName(this.$style.name));
    },
    _loadGlobalStyles: function() {
      var e = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
      zt(e) && ke.load(e, ue({
        name: "global"
      }, this.$styleOptions));
    },
    _loadThemeStyles: function() {
      var e, n;
      if (!(this.isUnstyled || this.$theme === "none")) {
        if (!vt.isStyleNameLoaded("common")) {
          var o, i, a = ((o = this.$style) === null || o === void 0 || (i = o.getCommonTheme) === null || i === void 0 ? void 0 : i.call(o)) || {}, l = a.primitive, u = a.semantic, s = a.global, d = a.style;
          ke.load(l?.css, ue({
            name: "primitive-variables"
          }, this.$styleOptions)), ke.load(u?.css, ue({
            name: "semantic-variables"
          }, this.$styleOptions)), ke.load(s?.css, ue({
            name: "global-variables"
          }, this.$styleOptions)), ke.loadStyle(ue({
            name: "global-style"
          }, this.$styleOptions), d), vt.setLoadedStyleName("common");
        }
        if (!vt.isStyleNameLoaded((e = this.$style) === null || e === void 0 ? void 0 : e.name) && (n = this.$style) !== null && n !== void 0 && n.name) {
          var m, f, v, g, w = ((m = this.$style) === null || m === void 0 || (f = m.getComponentTheme) === null || f === void 0 ? void 0 : f.call(m)) || {}, x = w.css, S = w.style;
          (v = this.$style) === null || v === void 0 || v.load(x, ue({
            name: "".concat(this.$style.name, "-variables")
          }, this.$styleOptions)), (g = this.$style) === null || g === void 0 || g.loadStyle(ue({
            name: "".concat(this.$style.name, "-style")
          }, this.$styleOptions), S), vt.setLoadedStyleName(this.$style.name);
        }
        if (!vt.isStyleNameLoaded("layer-order")) {
          var T, j, I = (T = this.$style) === null || T === void 0 || (j = T.getLayerOrderThemeCSS) === null || j === void 0 ? void 0 : j.call(T);
          ke.load(I, ue({
            name: "layer-order",
            first: !0
          }, this.$styleOptions)), vt.setLoadedStyleName("layer-order");
        }
      }
    },
    _loadScopedThemeStyles: function(e) {
      var n, o, i, a = ((n = this.$style) === null || n === void 0 || (o = n.getPresetTheme) === null || o === void 0 ? void 0 : o.call(n, e, "[".concat(this.$attrSelector, "]"))) || {}, l = a.css, u = (i = this.$style) === null || i === void 0 ? void 0 : i.load(l, ue({
        name: "".concat(this.$attrSelector, "-").concat(this.$style.name)
      }, this.$styleOptions));
      this.scopedStyleEl = u.el;
    },
    _unloadScopedThemeStyles: function() {
      var e;
      (e = this.scopedStyleEl) === null || e === void 0 || (e = e.value) === null || e === void 0 || e.remove();
    },
    _themeChangeListener: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
      };
      rn.clearLoadedStyleNames(), nn.on("theme:change", e);
    },
    _removeThemeListeners: function() {
      nn.off("theme:change", this._loadCoreStyles), nn.off("theme:change", this._load), nn.off("theme:change", this._themeScopedListener);
    },
    _getHostInstance: function(e) {
      return e ? this.$options.hostName ? e.$.type.name === this.$options.hostName ? e : this._getHostInstance(e.$parentInstance) : e.$parentInstance : void 0;
    },
    _getPropValue: function(e) {
      var n;
      return this[e] || ((n = this._getHostInstance(this)) === null || n === void 0 ? void 0 : n[e]);
    },
    _getOptionValue: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return Tr(e, n, o);
    },
    _getPTValue: function() {
      var e, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, a = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, l = /./g.test(o) && !!i[o.split(".")[0]], u = this._getPropValue("ptOptions") || ((e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.ptOptions) || {}, s = u.mergeSections, d = s === void 0 ? !0 : s, m = u.mergeProps, f = m === void 0 ? !1 : m, v = a ? l ? this._useGlobalPT(this._getPTClassValue, o, i) : this._useDefaultPT(this._getPTClassValue, o, i) : void 0, g = l ? void 0 : this._getPTSelf(n, this._getPTClassValue, o, ue(ue({}, i), {}, {
        global: v || {}
      })), w = this._getPTDatasets(o);
      return d || !d && g ? f ? this._mergeProps(f, v, g, w) : ue(ue(ue({}, v), g), w) : ue(ue({}, g), w);
    },
    _getPTSelf: function() {
      for (var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length, o = new Array(n > 1 ? n - 1 : 0), i = 1; i < n; i++)
        o[i - 1] = arguments[i];
      return K(
        this._usePT.apply(this, [this._getPT(e, this.$name)].concat(o)),
        // Exp; <component :pt="{}"
        this._usePT.apply(this, [this.$_attrsPT].concat(o))
        // Exp; <component :pt:[passthrough_key]:[attribute]="{value}" or <component :pt:[passthrough_key]="() =>{value}"
      );
    },
    _getPTDatasets: function() {
      var e, n, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", i = "data-pc-", a = o === "root" && zt((e = this.pt) === null || e === void 0 ? void 0 : e["data-pc-section"]);
      return o !== "transition" && ue(ue({}, o === "root" && ue(ue(Fn({}, "".concat(i, "name"), on(a ? (n = this.pt) === null || n === void 0 ? void 0 : n["data-pc-section"] : this.$.type.name)), a && Fn({}, "".concat(i, "extend"), on(this.$.type.name))), {}, Fn({}, "".concat(this.$attrSelector), ""))), {}, Fn({}, "".concat(i, "section"), on(o)));
    },
    _getPTClassValue: function() {
      var e = this._getOptionValue.apply(this, arguments);
      return xn(e) || Pr(e) ? {
        class: e
      } : e;
    },
    _getPT: function(e) {
      var n = this, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", i = arguments.length > 2 ? arguments[2] : void 0, a = function(u) {
        var s, d = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, m = i ? i(u) : u, f = on(o), v = on(n.$name);
        return (s = d ? f !== v ? m?.[f] : void 0 : m?.[f]) !== null && s !== void 0 ? s : m;
      };
      return e != null && e.hasOwnProperty("_usept") ? {
        _usept: e._usept,
        originalValue: a(e.originalValue),
        value: a(e.value)
      } : a(e, !0);
    },
    _usePT: function(e, n, o, i) {
      var a = function(x) {
        return n(x, o, i);
      };
      if (e != null && e.hasOwnProperty("_usept")) {
        var l, u = e._usept || ((l = this.$primevueConfig) === null || l === void 0 ? void 0 : l.ptOptions) || {}, s = u.mergeSections, d = s === void 0 ? !0 : s, m = u.mergeProps, f = m === void 0 ? !1 : m, v = a(e.originalValue), g = a(e.value);
        return v === void 0 && g === void 0 ? void 0 : xn(g) ? g : xn(v) ? v : d || !d && g ? f ? this._mergeProps(f, v, g) : ue(ue({}, v), g) : g;
      }
      return a(e);
    },
    _useGlobalPT: function(e, n, o) {
      return this._usePT(this.globalPT, e, n, o);
    },
    _useDefaultPT: function(e, n, o) {
      return this._usePT(this.defaultPT, e, n, o);
    },
    ptm: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this._getPTValue(this.pt, e, ue(ue({}, this.$params), n));
    },
    ptmi: function() {
      var e, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, i = K(this.$_attrsWithoutPT, this.ptm(n, o));
      return i?.hasOwnProperty("id") && ((e = i.id) !== null && e !== void 0 || (i.id = this.$id)), i;
    },
    ptmo: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return this._getPTValue(e, n, ue({
        instance: this
      }, o), !1);
    },
    cx: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this.isUnstyled ? void 0 : this._getOptionValue(this.$style.classes, e, ue(ue({}, this.$params), n));
    },
    sx: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      if (n) {
        var i = this._getOptionValue(this.$style.inlineStyles, e, ue(ue({}, this.$params), o)), a = this._getOptionValue(Vi.inlineStyles, e, ue(ue({}, this.$params), o));
        return [a, i];
      }
    }
  },
  computed: {
    globalPT: function() {
      var e, n = this;
      return this._getPT((e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.pt, void 0, function(o) {
        return Yo(o, {
          instance: n
        });
      });
    },
    defaultPT: function() {
      var e, n = this;
      return this._getPT((e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.pt, void 0, function(o) {
        return n._getOptionValue(o, n.$name, ue({}, n.$params)) || Yo(o, ue({}, n.$params));
      });
    },
    isUnstyled: function() {
      var e;
      return this.unstyled !== void 0 ? this.unstyled : (e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.unstyled;
    },
    $id: function() {
      return this.$attrs.id || this.uid;
    },
    $inProps: function() {
      var e, n = Object.keys(((e = this.$.vnode) === null || e === void 0 ? void 0 : e.props) || {});
      return Object.fromEntries(Object.entries(this.$props).filter(function(o) {
        var i = Mn(o, 1), a = i[0];
        return n?.includes(a);
      }));
    },
    $theme: function() {
      var e;
      return (e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.theme;
    },
    $style: function() {
      return ue(ue({
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
      var e;
      return {
        nonce: (e = this.$primevueConfig) === null || e === void 0 || (e = e.csp) === null || e === void 0 ? void 0 : e.nonce
      };
    },
    $primevueConfig: function() {
      var e;
      return (e = this.$primevue) === null || e === void 0 ? void 0 : e.config;
    },
    $name: function() {
      return this.$options.hostName || this.$.type.name;
    },
    $params: function() {
      var e = this._getHostInstance(this) || this.$parent;
      return {
        instance: this,
        props: this.$props,
        state: this.$data,
        attrs: this.$attrs,
        parent: {
          instance: e,
          props: e?.$props,
          state: e?.$data,
          attrs: e?.$attrs
        }
      };
    },
    $_attrsPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(e) {
        var n = Mn(e, 1), o = n[0];
        return o?.startsWith("pt:");
      }).reduce(function(e, n) {
        var o = Mn(n, 2), i = o[0], a = o[1], l = i.split(":"), u = bs(l), s = Jo(u).slice(1);
        return s?.reduce(function(d, m, f, v) {
          return !d[m] && (d[m] = f === v.length - 1 ? a : {}), d[m];
        }, e), e;
      }, {});
    },
    $_attrsWithoutPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(e) {
        var n = Mn(e, 1), o = n[0];
        return !(o != null && o.startsWith("pt:"));
      }).reduce(function(e, n) {
        var o = Mn(n, 2), i = o[0], a = o[1];
        return e[i] = a, e;
      }, {});
    }
  }
}, $s = `
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
`, Ss = ke.extend({
  name: "baseicon",
  css: $s
});
function Yn(t) {
  "@babel/helpers - typeof";
  return Yn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Yn(t);
}
function Mi(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    e && (o = o.filter(function(i) {
      return Object.getOwnPropertyDescriptor(t, i).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function Di(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Mi(Object(n), !0).forEach(function(o) {
      ws(t, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Mi(Object(n)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return t;
}
function ws(t, e, n) {
  return (e = _s(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function _s(t) {
  var e = Cs(t, "string");
  return Yn(e) == "symbol" ? e : e + "";
}
function Cs(t, e) {
  if (Yn(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (Yn(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var un = {
  name: "BaseIcon",
  extends: ln,
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
  style: Ss,
  provide: function() {
    return {
      $pcIcon: this,
      $parentInstance: this
    };
  },
  methods: {
    pti: function() {
      var e = Do(this.label);
      return Di(Di({}, !this.isUnstyled && {
        class: ["p-icon", {
          "p-icon-spin": this.spin
        }]
      }), {}, {
        role: e ? void 0 : "img",
        "aria-label": e ? void 0 : this.label,
        "aria-hidden": e
      });
    }
  }
};
function Xn(t) {
  "@babel/helpers - typeof";
  return Xn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Xn(t);
}
function Bi(t, e) {
  return Ps(t) || Is(t, e) || xs(t, e) || Os();
}
function Os() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function xs(t, e) {
  if (t) {
    if (typeof t == "string") return Fi(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Fi(t, e) : void 0;
  }
}
function Fi(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function Is(t, e) {
  var n = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (n != null) {
    var o, i, a, l, u = [], s = !0, d = !1;
    try {
      if (a = (n = n.call(t)).next, e !== 0) for (; !(s = (o = a.call(n)).done) && (u.push(o.value), u.length !== e); s = !0) ;
    } catch (m) {
      d = !0, i = m;
    } finally {
      try {
        if (!s && n.return != null && (l = n.return(), Object(l) !== l)) return;
      } finally {
        if (d) throw i;
      }
    }
    return u;
  }
}
function Ps(t) {
  if (Array.isArray(t)) return t;
}
function Ri(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    e && (o = o.filter(function(i) {
      return Object.getOwnPropertyDescriptor(t, i).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function me(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Ri(Object(n), !0).forEach(function(o) {
      Qo(t, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Ri(Object(n)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return t;
}
function Qo(t, e, n) {
  return (e = Ts(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Ts(t) {
  var e = Ls(t, "string");
  return Xn(e) == "symbol" ? e : e + "";
}
function Ls(t, e) {
  if (Xn(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (Xn(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var se = {
  _getMeta: function() {
    return [Ii(arguments.length <= 0 ? void 0 : arguments[0]) || arguments.length <= 0 ? void 0 : arguments[0], Yo(Ii(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getConfig: function(e, n) {
    var o, i, a;
    return (o = (e == null || (i = e.instance) === null || i === void 0 ? void 0 : i.$primevue) || (n == null || (a = n.ctx) === null || a === void 0 || (a = a.appContext) === null || a === void 0 || (a = a.config) === null || a === void 0 || (a = a.globalProperties) === null || a === void 0 ? void 0 : a.$primevue)) === null || o === void 0 ? void 0 : o.config;
  },
  _getOptionValue: Tr,
  _getPTValue: function() {
    var e, n, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, i = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", l = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, u = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, s = function() {
      var j = se._getOptionValue.apply(se, arguments);
      return xn(j) || Pr(j) ? {
        class: j
      } : j;
    }, d = ((e = o.binding) === null || e === void 0 || (e = e.value) === null || e === void 0 ? void 0 : e.ptOptions) || ((n = o.$primevueConfig) === null || n === void 0 ? void 0 : n.ptOptions) || {}, m = d.mergeSections, f = m === void 0 ? !0 : m, v = d.mergeProps, g = v === void 0 ? !1 : v, w = u ? se._useDefaultPT(o, o.defaultPT(), s, a, l) : void 0, x = se._usePT(o, se._getPT(i, o.$name), s, a, me(me({}, l), {}, {
      global: w || {}
    })), S = se._getPTDatasets(o, a);
    return f || !f && x ? g ? se._mergeProps(o, g, w, x, S) : me(me(me({}, w), x), S) : me(me({}, x), S);
  },
  _getPTDatasets: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = "data-pc-";
    return me(me({}, n === "root" && Qo({}, "".concat(o, "name"), on(e.$name))), {}, Qo({}, "".concat(o, "section"), on(n)));
  },
  _getPT: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 ? arguments[2] : void 0, i = function(l) {
      var u, s = o ? o(l) : l, d = on(n);
      return (u = s?.[d]) !== null && u !== void 0 ? u : s;
    };
    return e && Object.hasOwn(e, "_usept") ? {
      _usept: e._usept,
      originalValue: i(e.originalValue),
      value: i(e.value)
    } : i(e);
  },
  _usePT: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, o = arguments.length > 2 ? arguments[2] : void 0, i = arguments.length > 3 ? arguments[3] : void 0, a = arguments.length > 4 ? arguments[4] : void 0, l = function(S) {
      return o(S, i, a);
    };
    if (n && Object.hasOwn(n, "_usept")) {
      var u, s = n._usept || ((u = e.$primevueConfig) === null || u === void 0 ? void 0 : u.ptOptions) || {}, d = s.mergeSections, m = d === void 0 ? !0 : d, f = s.mergeProps, v = f === void 0 ? !1 : f, g = l(n.originalValue), w = l(n.value);
      return g === void 0 && w === void 0 ? void 0 : xn(w) ? w : xn(g) ? g : m || !m && w ? v ? se._mergeProps(e, v, g, w) : me(me({}, g), w) : w;
    }
    return l(n);
  },
  _useDefaultPT: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = arguments.length > 2 ? arguments[2] : void 0, i = arguments.length > 3 ? arguments[3] : void 0, a = arguments.length > 4 ? arguments[4] : void 0;
    return se._usePT(e, n, o, i, a);
  },
  _loadStyles: function() {
    var e, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 ? arguments[1] : void 0, i = arguments.length > 2 ? arguments[2] : void 0, a = se._getConfig(o, i), l = {
      nonce: a == null || (e = a.csp) === null || e === void 0 ? void 0 : e.nonce
    };
    se._loadCoreStyles(n, l), se._loadThemeStyles(n, l), se._loadScopedThemeStyles(n, l), se._removeThemeListeners(n), n.$loadStyles = function() {
      return se._loadThemeStyles(n, l);
    }, se._themeChangeListener(n.$loadStyles);
  },
  _loadCoreStyles: function() {
    var e, n, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, i = arguments.length > 1 ? arguments[1] : void 0;
    if (!rn.isStyleNameLoaded((e = o.$style) === null || e === void 0 ? void 0 : e.name) && (n = o.$style) !== null && n !== void 0 && n.name) {
      var a;
      ke.loadCSS(i), (a = o.$style) === null || a === void 0 || a.loadCSS(i), rn.setLoadedStyleName(o.$style.name);
    }
  },
  _loadThemeStyles: function() {
    var e, n, o, i = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, a = arguments.length > 1 ? arguments[1] : void 0;
    if (!(i != null && i.isUnstyled() || (i == null || (e = i.theme) === null || e === void 0 ? void 0 : e.call(i)) === "none")) {
      if (!vt.isStyleNameLoaded("common")) {
        var l, u, s = ((l = i.$style) === null || l === void 0 || (u = l.getCommonTheme) === null || u === void 0 ? void 0 : u.call(l)) || {}, d = s.primitive, m = s.semantic, f = s.global, v = s.style;
        ke.load(d?.css, me({
          name: "primitive-variables"
        }, a)), ke.load(m?.css, me({
          name: "semantic-variables"
        }, a)), ke.load(f?.css, me({
          name: "global-variables"
        }, a)), ke.loadStyle(me({
          name: "global-style"
        }, a), v), vt.setLoadedStyleName("common");
      }
      if (!vt.isStyleNameLoaded((n = i.$style) === null || n === void 0 ? void 0 : n.name) && (o = i.$style) !== null && o !== void 0 && o.name) {
        var g, w, x, S, T = ((g = i.$style) === null || g === void 0 || (w = g.getDirectiveTheme) === null || w === void 0 ? void 0 : w.call(g)) || {}, j = T.css, I = T.style;
        (x = i.$style) === null || x === void 0 || x.load(j, me({
          name: "".concat(i.$style.name, "-variables")
        }, a)), (S = i.$style) === null || S === void 0 || S.loadStyle(me({
          name: "".concat(i.$style.name, "-style")
        }, a), I), vt.setLoadedStyleName(i.$style.name);
      }
      if (!vt.isStyleNameLoaded("layer-order")) {
        var y, b, W = (y = i.$style) === null || y === void 0 || (b = y.getLayerOrderThemeCSS) === null || b === void 0 ? void 0 : b.call(y);
        ke.load(W, me({
          name: "layer-order",
          first: !0
        }, a)), vt.setLoadedStyleName("layer-order");
      }
    }
  },
  _loadScopedThemeStyles: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, o = e.preset();
    if (o && e.$attrSelector) {
      var i, a, l, u = ((i = e.$style) === null || i === void 0 || (a = i.getPresetTheme) === null || a === void 0 ? void 0 : a.call(i, o, "[".concat(e.$attrSelector, "]"))) || {}, s = u.css, d = (l = e.$style) === null || l === void 0 ? void 0 : l.load(s, me({
        name: "".concat(e.$attrSelector, "-").concat(e.$style.name)
      }, n));
      e.scopedStyleEl = d.el;
    }
  },
  _themeChangeListener: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
    };
    rn.clearLoadedStyleNames(), nn.on("theme:change", e);
  },
  _removeThemeListeners: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    nn.off("theme:change", e.$loadStyles), e.$loadStyles = void 0;
  },
  _hook: function(e, n, o, i, a, l) {
    var u, s, d = "on".concat(xa(n)), m = se._getConfig(i, a), f = o?.$instance, v = se._usePT(f, se._getPT(i == null || (u = i.value) === null || u === void 0 ? void 0 : u.pt, e), se._getOptionValue, "hooks.".concat(d)), g = se._useDefaultPT(f, m == null || (s = m.pt) === null || s === void 0 || (s = s.directives) === null || s === void 0 ? void 0 : s[e], se._getOptionValue, "hooks.".concat(d)), w = {
      el: o,
      binding: i,
      vnode: a,
      prevVnode: l
    };
    v?.(f, w), g?.(f, w);
  },
  /* eslint-disable-next-line no-unused-vars */
  _mergeProps: function() {
    for (var e = arguments.length > 1 ? arguments[1] : void 0, n = arguments.length, o = new Array(n > 2 ? n - 2 : 0), i = 2; i < n; i++)
      o[i - 2] = arguments[i];
    return Lr(e) ? e.apply(void 0, o) : K.apply(void 0, o);
  },
  _extend: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = function(u, s, d, m, f) {
      var v, g, w, x;
      s._$instances = s._$instances || {};
      var S = se._getConfig(d, m), T = s._$instances[e] || {}, j = Do(T) ? me(me({}, n), n?.methods) : {};
      s._$instances[e] = me(me({}, T), {}, {
        /* new instance variables to pass in directive methods */
        $name: e,
        $host: s,
        $binding: d,
        $modifiers: d?.modifiers,
        $value: d?.value,
        $el: T.$el || s || void 0,
        $style: me({
          classes: void 0,
          inlineStyles: void 0,
          load: function() {
          },
          loadCSS: function() {
          },
          loadStyle: function() {
          }
        }, n?.style),
        $primevueConfig: S,
        $attrSelector: (v = s.$pd) === null || v === void 0 || (v = v[e]) === null || v === void 0 ? void 0 : v.attrSelector,
        /* computed instance variables */
        defaultPT: function() {
          return se._getPT(S?.pt, void 0, function(y) {
            var b;
            return y == null || (b = y.directives) === null || b === void 0 ? void 0 : b[e];
          });
        },
        isUnstyled: function() {
          var y, b;
          return ((y = s._$instances[e]) === null || y === void 0 || (y = y.$binding) === null || y === void 0 || (y = y.value) === null || y === void 0 ? void 0 : y.unstyled) !== void 0 ? (b = s._$instances[e]) === null || b === void 0 || (b = b.$binding) === null || b === void 0 || (b = b.value) === null || b === void 0 ? void 0 : b.unstyled : S?.unstyled;
        },
        theme: function() {
          var y;
          return (y = s._$instances[e]) === null || y === void 0 || (y = y.$primevueConfig) === null || y === void 0 ? void 0 : y.theme;
        },
        preset: function() {
          var y;
          return (y = s._$instances[e]) === null || y === void 0 || (y = y.$binding) === null || y === void 0 || (y = y.value) === null || y === void 0 ? void 0 : y.dt;
        },
        /* instance's methods */
        ptm: function() {
          var y, b = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", W = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return se._getPTValue(s._$instances[e], (y = s._$instances[e]) === null || y === void 0 || (y = y.$binding) === null || y === void 0 || (y = y.value) === null || y === void 0 ? void 0 : y.pt, b, me({}, W));
        },
        ptmo: function() {
          var y = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, b = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", W = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return se._getPTValue(s._$instances[e], y, b, W, !1);
        },
        cx: function() {
          var y, b, W = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", $ = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return (y = s._$instances[e]) !== null && y !== void 0 && y.isUnstyled() ? void 0 : se._getOptionValue((b = s._$instances[e]) === null || b === void 0 || (b = b.$style) === null || b === void 0 ? void 0 : b.classes, W, me({}, $));
        },
        sx: function() {
          var y, b = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", W = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, $ = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return W ? se._getOptionValue((y = s._$instances[e]) === null || y === void 0 || (y = y.$style) === null || y === void 0 ? void 0 : y.inlineStyles, b, me({}, $)) : void 0;
        }
      }, j), s.$instance = s._$instances[e], (g = (w = s.$instance)[u]) === null || g === void 0 || g.call(w, s, d, m, f), s["$".concat(e)] = s.$instance, se._hook(e, u, s, d, m, f), s.$pd || (s.$pd = {}), s.$pd[e] = me(me({}, (x = s.$pd) === null || x === void 0 ? void 0 : x[e]), {}, {
        name: e,
        instance: s._$instances[e]
      });
    }, i = function(u) {
      var s, d, m, f = u._$instances[e], v = f?.watch, g = function(S) {
        var T, j = S.newValue, I = S.oldValue;
        return v == null || (T = v.config) === null || T === void 0 ? void 0 : T.call(f, j, I);
      }, w = function(S) {
        var T, j = S.newValue, I = S.oldValue;
        return v == null || (T = v["config.ripple"]) === null || T === void 0 ? void 0 : T.call(f, j, I);
      };
      f.$watchersCallback = {
        config: g,
        "config.ripple": w
      }, v == null || (s = v.config) === null || s === void 0 || s.call(f, f?.$primevueConfig), $o.on("config:change", g), v == null || (d = v["config.ripple"]) === null || d === void 0 || d.call(f, f == null || (m = f.$primevueConfig) === null || m === void 0 ? void 0 : m.ripple), $o.on("config:ripple:change", w);
    }, a = function(u) {
      var s = u._$instances[e].$watchersCallback;
      s && ($o.off("config:change", s.config), $o.off("config:ripple:change", s["config.ripple"]), u._$instances[e].$watchersCallback = void 0);
    };
    return {
      created: function(u, s, d, m) {
        u.$pd || (u.$pd = {}), u.$pd[e] = {
          name: e,
          attrSelector: ms("pd")
        }, o("created", u, s, d, m);
      },
      beforeMount: function(u, s, d, m) {
        var f;
        se._loadStyles((f = u.$pd[e]) === null || f === void 0 ? void 0 : f.instance, s, d), o("beforeMount", u, s, d, m), i(u);
      },
      mounted: function(u, s, d, m) {
        var f;
        se._loadStyles((f = u.$pd[e]) === null || f === void 0 ? void 0 : f.instance, s, d), o("mounted", u, s, d, m);
      },
      beforeUpdate: function(u, s, d, m) {
        o("beforeUpdate", u, s, d, m);
      },
      updated: function(u, s, d, m) {
        var f;
        se._loadStyles((f = u.$pd[e]) === null || f === void 0 ? void 0 : f.instance, s, d), o("updated", u, s, d, m);
      },
      beforeUnmount: function(u, s, d, m) {
        var f;
        a(u), se._removeThemeListeners((f = u.$pd[e]) === null || f === void 0 ? void 0 : f.instance), o("beforeUnmount", u, s, d, m);
      },
      unmounted: function(u, s, d, m) {
        var f;
        (f = u.$pd[e]) === null || f === void 0 || (f = f.instance) === null || f === void 0 || (f = f.scopedStyleEl) === null || f === void 0 || (f = f.value) === null || f === void 0 || f.remove(), o("unmounted", u, s, d, m);
      }
    };
  },
  extend: function() {
    var e = se._getMeta.apply(se, arguments), n = Bi(e, 2), o = n[0], i = n[1];
    return me({
      extend: function() {
        var l = se._getMeta.apply(se, arguments), u = Bi(l, 2), s = u[0], d = u[1];
        return se.extend(s, me(me(me({}, i), i?.methods), d));
      }
    }, se._extend(o, i));
  }
}, As = `
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
`, Es = {
  root: "p-ink"
}, js = ke.extend({
  name: "ripple-directive",
  style: As,
  classes: Es
}), Vs = se.extend({
  style: js
});
function Jn(t) {
  "@babel/helpers - typeof";
  return Jn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Jn(t);
}
function zs(t) {
  return Fs(t) || Bs(t) || Ds(t) || Ms();
}
function Ms() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ds(t, e) {
  if (t) {
    if (typeof t == "string") return ei(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? ei(t, e) : void 0;
  }
}
function Bs(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Fs(t) {
  if (Array.isArray(t)) return ei(t);
}
function ei(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function Ni(t, e, n) {
  return (e = Rs(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Rs(t) {
  var e = Ns(t, "string");
  return Jn(e) == "symbol" ? e : e + "";
}
function Ns(t, e) {
  if (Jn(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (Jn(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var wi = Vs.extend("ripple", {
  watch: {
    "config.ripple": function(e) {
      e ? (this.createRipple(this.$host), this.bindEvents(this.$host), this.$host.setAttribute("data-pd-ripple", !0), this.$host.style.overflow = "hidden", this.$host.style.position = "relative") : (this.remove(this.$host), this.$host.removeAttribute("data-pd-ripple"));
    }
  },
  unmounted: function(e) {
    this.remove(e);
  },
  timeout: void 0,
  methods: {
    bindEvents: function(e) {
      e.addEventListener("mousedown", this.onMouseDown.bind(this));
    },
    unbindEvents: function(e) {
      e.removeEventListener("mousedown", this.onMouseDown.bind(this));
    },
    createRipple: function(e) {
      var n = this.getInk(e);
      n || (n = jr("span", Ni(Ni({
        role: "presentation",
        "aria-hidden": !0,
        "data-p-ink": !0,
        "data-p-ink-active": !1,
        class: !this.isUnstyled() && this.cx("root"),
        onAnimationEnd: this.onAnimationEnd.bind(this)
      }, this.$attrSelector, ""), "p-bind", this.ptm("root"))), e.appendChild(n), this.$el = n);
    },
    remove: function(e) {
      var n = this.getInk(e);
      n && (this.$host.style.overflow = "", this.$host.style.position = "", this.unbindEvents(e), n.removeEventListener("animationend", this.onAnimationEnd), n.remove());
    },
    onMouseDown: function(e) {
      var n = this, o = e.currentTarget, i = this.getInk(o);
      if (!(!i || getComputedStyle(i, null).display === "none")) {
        if (!this.isUnstyled() && Ko(i, "p-ink-active"), i.setAttribute("data-p-ink-active", "false"), !pn(i) && !mn(i)) {
          var a = Math.max(yi(o), Ar(o));
          i.style.height = a + "px", i.style.width = a + "px";
        }
        var l = Pa(o), u = e.pageX - l.left + document.body.scrollTop - mn(i) / 2, s = e.pageY - l.top + document.body.scrollLeft - pn(i) / 2;
        i.style.top = s + "px", i.style.left = u + "px", !this.isUnstyled() && Er(i, "p-ink-active"), i.setAttribute("data-p-ink-active", "true"), this.timeout = setTimeout(function() {
          i && (!n.isUnstyled() && Ko(i, "p-ink-active"), i.setAttribute("data-p-ink-active", "false"));
        }, 401);
      }
    },
    onAnimationEnd: function(e) {
      this.timeout && clearTimeout(this.timeout), !this.isUnstyled() && Ko(e.currentTarget, "p-ink-active"), e.currentTarget.setAttribute("data-p-ink-active", "false");
    },
    getInk: function(e) {
      return e && e.children ? zs(e.children).find(function(n) {
        return Ia(n, "data-pc-name") === "ripple";
      }) : void 0;
    }
  }
});
function Qn(t) {
  "@babel/helpers - typeof";
  return Qn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Qn(t);
}
function Us(t, e) {
  if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function");
}
function Hs(t, e) {
  for (var n = 0; n < e.length; n++) {
    var o = e[n];
    o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(t, qs(o.key), o);
  }
}
function Ks(t, e, n) {
  return e && Hs(t.prototype, e), Object.defineProperty(t, "prototype", { writable: !1 }), t;
}
function qs(t) {
  var e = Ws(t, "string");
  return Qn(e) == "symbol" ? e : e + "";
}
function Ws(t, e) {
  if (Qn(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (Qn(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return String(t);
}
var Gs = /* @__PURE__ */ (function() {
  function t(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : function() {
    };
    Us(this, t), this.element = e, this.listener = n;
  }
  return Ks(t, [{
    key: "bindScrollListener",
    value: function() {
      this.scrollableParents = Ta(this.element);
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
})(), Zs = La(), _i = {
  name: "TimesIcon",
  extends: un
};
function Ys(t) {
  return el(t) || Qs(t) || Js(t) || Xs();
}
function Xs() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Js(t, e) {
  if (t) {
    if (typeof t == "string") return ti(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? ti(t, e) : void 0;
  }
}
function Qs(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function el(t) {
  if (Array.isArray(t)) return ti(t);
}
function ti(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function tl(t, e, n, o, i, a) {
  return p(), h("svg", K({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Ys(e[0] || (e[0] = [c("path", {
    d: "M8.01186 7.00933L12.27 2.75116C12.341 2.68501 12.398 2.60524 12.4375 2.51661C12.4769 2.42798 12.4982 2.3323 12.4999 2.23529C12.5016 2.13827 12.4838 2.0419 12.4474 1.95194C12.4111 1.86197 12.357 1.78024 12.2884 1.71163C12.2198 1.64302 12.138 1.58893 12.0481 1.55259C11.9581 1.51625 11.8617 1.4984 11.7647 1.50011C11.6677 1.50182 11.572 1.52306 11.4834 1.56255C11.3948 1.60204 11.315 1.65898 11.2488 1.72997L6.99067 5.98814L2.7325 1.72997C2.59553 1.60234 2.41437 1.53286 2.22718 1.53616C2.03999 1.53946 1.8614 1.61529 1.72901 1.74767C1.59663 1.88006 1.5208 2.05865 1.5175 2.24584C1.5142 2.43303 1.58368 2.61419 1.71131 2.75116L5.96948 7.00933L1.71131 11.2675C1.576 11.403 1.5 11.5866 1.5 11.7781C1.5 11.9696 1.576 12.1532 1.71131 12.2887C1.84679 12.424 2.03043 12.5 2.2219 12.5C2.41338 12.5 2.59702 12.424 2.7325 12.2887L6.99067 8.03052L11.2488 12.2887C11.3843 12.424 11.568 12.5 11.7594 12.5C11.9509 12.5 12.1346 12.424 12.27 12.2887C12.4053 12.1532 12.4813 11.9696 12.4813 11.7781C12.4813 11.5866 12.4053 11.403 12.27 11.2675L8.01186 7.00933Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
_i.render = tl;
var Gr = {
  name: "WindowMaximizeIcon",
  extends: un
};
function nl(t) {
  return al(t) || rl(t) || il(t) || ol();
}
function ol() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function il(t, e) {
  if (t) {
    if (typeof t == "string") return ni(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? ni(t, e) : void 0;
  }
}
function rl(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function al(t) {
  if (Array.isArray(t)) return ni(t);
}
function ni(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function sl(t, e, n, o, i, a) {
  return p(), h("svg", K({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), nl(e[0] || (e[0] = [c("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14ZM9.77805 7.42192C9.89013 7.534 10.0415 7.59788 10.2 7.59995C10.3585 7.59788 10.5099 7.534 10.622 7.42192C10.7341 7.30985 10.798 7.15844 10.8 6.99995V3.94242C10.8066 3.90505 10.8096 3.86689 10.8089 3.82843C10.8079 3.77159 10.7988 3.7157 10.7824 3.6623C10.756 3.55552 10.701 3.45698 10.622 3.37798C10.5099 3.2659 10.3585 3.20202 10.2 3.19995H7.00002C6.84089 3.19995 6.68828 3.26317 6.57576 3.37569C6.46324 3.48821 6.40002 3.64082 6.40002 3.79995C6.40002 3.95908 6.46324 4.11169 6.57576 4.22422C6.68828 4.33674 6.84089 4.39995 7.00002 4.39995H8.80006L6.19997 7.00005C6.10158 7.11005 6.04718 7.25246 6.04718 7.40005C6.04718 7.54763 6.10158 7.69004 6.19997 7.80005C6.30202 7.91645 6.44561 7.98824 6.59997 8.00005C6.75432 7.98824 6.89791 7.91645 6.99997 7.80005L9.60002 5.26841V6.99995C9.6021 7.15844 9.66598 7.30985 9.77805 7.42192ZM1.4 14H3.8C4.17066 13.9979 4.52553 13.8498 4.78763 13.5877C5.04973 13.3256 5.1979 12.9707 5.2 12.6V10.2C5.1979 9.82939 5.04973 9.47452 4.78763 9.21242C4.52553 8.95032 4.17066 8.80215 3.8 8.80005H1.4C1.02934 8.80215 0.674468 8.95032 0.412371 9.21242C0.150274 9.47452 0.00210008 9.82939 0 10.2V12.6C0.00210008 12.9707 0.150274 13.3256 0.412371 13.5877C0.674468 13.8498 1.02934 13.9979 1.4 14ZM1.25858 10.0586C1.29609 10.0211 1.34696 10 1.4 10H3.8C3.85304 10 3.90391 10.0211 3.94142 10.0586C3.97893 10.0961 4 10.147 4 10.2V12.6C4 12.6531 3.97893 12.704 3.94142 12.7415C3.90391 12.779 3.85304 12.8 3.8 12.8H1.4C1.34696 12.8 1.29609 12.779 1.25858 12.7415C1.22107 12.704 1.2 12.6531 1.2 12.6V10.2C1.2 10.147 1.22107 10.0961 1.25858 10.0586Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Gr.render = sl;
var Zr = {
  name: "WindowMinimizeIcon",
  extends: un
};
function ll(t) {
  return pl(t) || cl(t) || dl(t) || ul();
}
function ul() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function dl(t, e) {
  if (t) {
    if (typeof t == "string") return oi(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? oi(t, e) : void 0;
  }
}
function cl(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function pl(t) {
  if (Array.isArray(t)) return oi(t);
}
function oi(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function ml(t, e, n, o, i, a) {
  return p(), h("svg", K({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), ll(e[0] || (e[0] = [c("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0ZM6.368 7.952C6.44137 7.98326 6.52025 7.99958 6.6 8H9.8C9.95913 8 10.1117 7.93678 10.2243 7.82426C10.3368 7.71174 10.4 7.55913 10.4 7.4C10.4 7.24087 10.3368 7.08826 10.2243 6.97574C10.1117 6.86321 9.95913 6.8 9.8 6.8H8.048L10.624 4.224C10.73 4.11026 10.7877 3.95982 10.7849 3.80438C10.7822 3.64894 10.7192 3.50063 10.6093 3.3907C10.4994 3.28077 10.3511 3.2178 10.1956 3.21506C10.0402 3.21232 9.88974 3.27002 9.776 3.376L7.2 5.952V4.2C7.2 4.04087 7.13679 3.88826 7.02426 3.77574C6.91174 3.66321 6.75913 3.6 6.6 3.6C6.44087 3.6 6.28826 3.66321 6.17574 3.77574C6.06321 3.88826 6 4.04087 6 4.2V7.4C6.00042 7.47975 6.01674 7.55862 6.048 7.632C6.07656 7.70442 6.11971 7.7702 6.17475 7.82524C6.2298 7.88029 6.29558 7.92344 6.368 7.952ZM1.4 8.80005H3.8C4.17066 8.80215 4.52553 8.95032 4.78763 9.21242C5.04973 9.47452 5.1979 9.82939 5.2 10.2V12.6C5.1979 12.9707 5.04973 13.3256 4.78763 13.5877C4.52553 13.8498 4.17066 13.9979 3.8 14H1.4C1.02934 13.9979 0.674468 13.8498 0.412371 13.5877C0.150274 13.3256 0.00210008 12.9707 0 12.6V10.2C0.00210008 9.82939 0.150274 9.47452 0.412371 9.21242C0.674468 8.95032 1.02934 8.80215 1.4 8.80005ZM3.94142 12.7415C3.97893 12.704 4 12.6531 4 12.6V10.2C4 10.147 3.97893 10.0961 3.94142 10.0586C3.90391 10.0211 3.85304 10 3.8 10H1.4C1.34696 10 1.29609 10.0211 1.25858 10.0586C1.22107 10.0961 1.2 10.147 1.2 10.2V12.6C1.2 12.6531 1.22107 12.704 1.25858 12.7415C1.29609 12.779 1.34696 12.8 1.4 12.8H3.8C3.85304 12.8 3.90391 12.779 3.94142 12.7415Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Zr.render = ml;
var Ro = {
  name: "SpinnerIcon",
  extends: un
};
function fl(t) {
  return gl(t) || vl(t) || bl(t) || hl();
}
function hl() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function bl(t, e) {
  if (t) {
    if (typeof t == "string") return ii(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? ii(t, e) : void 0;
  }
}
function vl(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function gl(t) {
  if (Array.isArray(t)) return ii(t);
}
function ii(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function yl(t, e, n, o, i, a) {
  return p(), h("svg", K({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), fl(e[0] || (e[0] = [c("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Ro.render = yl;
var kl = `
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
`, $l = {
  root: function(e) {
    var n = e.props, o = e.instance;
    return ["p-badge p-component", {
      "p-badge-circle": zt(n.value) && String(n.value).length === 1,
      "p-badge-dot": Do(n.value) && !o.$slots.default,
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
}, Sl = ke.extend({
  name: "badge",
  style: kl,
  classes: $l
}), wl = {
  name: "BaseBadge",
  extends: ln,
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
  style: Sl,
  provide: function() {
    return {
      $pcBadge: this,
      $parentInstance: this
    };
  }
};
function eo(t) {
  "@babel/helpers - typeof";
  return eo = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, eo(t);
}
function Ui(t, e, n) {
  return (e = _l(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function _l(t) {
  var e = Cl(t, "string");
  return eo(e) == "symbol" ? e : e + "";
}
function Cl(t, e) {
  if (eo(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (eo(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Yr = {
  name: "Badge",
  extends: wl,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return _t(Ui(Ui({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, Ol = ["data-p"];
function xl(t, e, n, o, i, a) {
  return p(), h("span", K({
    class: t.cx("root"),
    "data-p": a.dataP
  }, t.ptmi("root")), [ae(t.$slots, "default", {}, function() {
    return [F(k(t.value), 1)];
  })], 16, Ol);
}
Yr.render = xl;
var Il = `
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
function to(t) {
  "@babel/helpers - typeof";
  return to = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, to(t);
}
function Et(t, e, n) {
  return (e = Pl(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Pl(t) {
  var e = Tl(t, "string");
  return to(e) == "symbol" ? e : e + "";
}
function Tl(t, e) {
  if (to(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (to(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Ll = {
  root: function(e) {
    var n = e.instance, o = e.props;
    return ["p-button p-component", Et(Et(Et(Et(Et(Et(Et(Et(Et({
      "p-button-icon-only": n.hasIcon && !o.label && !o.badge,
      "p-button-vertical": (o.iconPos === "top" || o.iconPos === "bottom") && o.label,
      "p-button-loading": o.loading,
      "p-button-link": o.link || o.variant === "link"
    }, "p-button-".concat(o.severity), o.severity), "p-button-raised", o.raised), "p-button-rounded", o.rounded), "p-button-text", o.text || o.variant === "text"), "p-button-outlined", o.outlined || o.variant === "outlined"), "p-button-sm", o.size === "small"), "p-button-lg", o.size === "large"), "p-button-plain", o.plain), "p-button-fluid", n.hasFluid)];
  },
  loadingIcon: "p-button-loading-icon",
  icon: function(e) {
    var n = e.props;
    return ["p-button-icon", Et({}, "p-button-icon-".concat(n.iconPos), n.label)];
  },
  label: "p-button-label"
}, Al = ke.extend({
  name: "button",
  style: Il,
  classes: Ll
}), El = {
  name: "BaseButton",
  extends: ln,
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
  style: Al,
  provide: function() {
    return {
      $pcButton: this,
      $parentInstance: this
    };
  }
};
function no(t) {
  "@babel/helpers - typeof";
  return no = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, no(t);
}
function Ze(t, e, n) {
  return (e = jl(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function jl(t) {
  var e = Vl(t, "string");
  return no(e) == "symbol" ? e : e + "";
}
function Vl(t, e) {
  if (no(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (no(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Xr = {
  name: "Button",
  extends: El,
  inheritAttrs: !1,
  inject: {
    $pcFluid: {
      default: null
    }
  },
  methods: {
    getPTOptions: function(e) {
      var n = e === "root" ? this.ptmi : this.ptm;
      return n(e, {
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
      return K(this.asAttrs, this.a11yAttrs, this.getPTOptions("root"));
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
      return Do(this.fluid) ? !!this.$pcFluid : this.fluid;
    },
    dataP: function() {
      return _t(Ze(Ze(Ze(Ze(Ze(Ze(Ze(Ze(Ze(Ze({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
    },
    dataIconP: function() {
      return _t(Ze(Ze({}, this.iconPos, this.iconPos), this.size, this.size));
    },
    dataLabelP: function() {
      return _t(Ze(Ze({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
    }
  },
  components: {
    SpinnerIcon: Ro,
    Badge: Yr
  },
  directives: {
    ripple: wi
  }
}, zl = ["data-p"], Ml = ["data-p"];
function Dl(t, e, n, o, i, a) {
  var l = Ve("SpinnerIcon"), u = Ve("Badge"), s = Bo("ripple");
  return t.asChild ? ae(t.$slots, "default", {
    key: 1,
    class: oe(t.cx("root")),
    a11yAttrs: a.a11yAttrs
  }) : Xe((p(), xe(Ln(t.as), K({
    key: 0,
    class: t.cx("root"),
    "data-p": a.dataP
  }, a.attrs), {
    default: Ie(function() {
      return [ae(t.$slots, "default", {}, function() {
        return [t.loading ? ae(t.$slots, "loadingicon", K({
          key: 0,
          class: [t.cx("loadingIcon"), t.cx("icon")]
        }, t.ptm("loadingIcon")), function() {
          return [t.loadingIcon ? (p(), h("span", K({
            key: 0,
            class: [t.cx("loadingIcon"), t.cx("icon"), t.loadingIcon]
          }, t.ptm("loadingIcon")), null, 16)) : (p(), xe(l, K({
            key: 1,
            class: [t.cx("loadingIcon"), t.cx("icon")],
            spin: ""
          }, t.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : ae(t.$slots, "icon", K({
          key: 1,
          class: [t.cx("icon")]
        }, t.ptm("icon")), function() {
          return [t.icon ? (p(), h("span", K({
            key: 0,
            class: [t.cx("icon"), t.icon, t.iconClass],
            "data-p": a.dataIconP
          }, t.ptm("icon")), null, 16, zl)) : _("", !0)];
        }), t.label ? (p(), h("span", K({
          key: 2,
          class: t.cx("label")
        }, t.ptm("label"), {
          "data-p": a.dataLabelP
        }), k(t.label), 17, Ml)) : _("", !0), t.badge ? (p(), xe(u, {
          key: 3,
          value: t.badge,
          class: oe(t.badgeClass),
          severity: t.badgeSeverity,
          unstyled: t.unstyled,
          pt: t.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : _("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[s]]);
}
Xr.render = Dl;
var Bl = ke.extend({
  name: "focustrap-directive"
}), Fl = se.extend({
  style: Bl
});
function oo(t) {
  "@babel/helpers - typeof";
  return oo = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, oo(t);
}
function Hi(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    e && (o = o.filter(function(i) {
      return Object.getOwnPropertyDescriptor(t, i).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function Ki(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Hi(Object(n), !0).forEach(function(o) {
      Rl(t, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Hi(Object(n)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return t;
}
function Rl(t, e, n) {
  return (e = Nl(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Nl(t) {
  var e = Ul(t, "string");
  return oo(e) == "symbol" ? e : e + "";
}
function Ul(t, e) {
  if (oo(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (oo(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Hl = Fl.extend("focustrap", {
  mounted: function(e, n) {
    var o = n.value || {}, i = o.disabled;
    i || (this.createHiddenFocusableElements(e, n), this.bind(e, n), this.autoElementFocus(e, n)), e.setAttribute("data-pd-focustrap", !0), this.$el = e;
  },
  updated: function(e, n) {
    var o = n.value || {}, i = o.disabled;
    i && this.unbind(e);
  },
  unmounted: function(e) {
    this.unbind(e);
  },
  methods: {
    getComputedSelector: function(e) {
      return ':not(.p-hidden-focusable):not([data-p-hidden-focusable="true"])'.concat(e ?? "");
    },
    bind: function(e, n) {
      var o = this, i = n.value || {}, a = i.onFocusIn, l = i.onFocusOut;
      e.$_pfocustrap_mutationobserver = new MutationObserver(function(u) {
        u.forEach(function(s) {
          if (s.type === "childList" && !e.contains(document.activeElement)) {
            var d = function(f) {
              var v = Pi(f) ? Pi(f, o.getComputedSelector(e.$_pfocustrap_focusableselector)) ? f : Cn(e, o.getComputedSelector(e.$_pfocustrap_focusableselector)) : Cn(f);
              return zt(v) ? v : f.nextSibling && d(f.nextSibling);
            };
            Ne(d(s.nextSibling));
          }
        });
      }), e.$_pfocustrap_mutationobserver.disconnect(), e.$_pfocustrap_mutationobserver.observe(e, {
        childList: !0
      }), e.$_pfocustrap_focusinlistener = function(u) {
        return a && a(u);
      }, e.$_pfocustrap_focusoutlistener = function(u) {
        return l && l(u);
      }, e.addEventListener("focusin", e.$_pfocustrap_focusinlistener), e.addEventListener("focusout", e.$_pfocustrap_focusoutlistener);
    },
    unbind: function(e) {
      e.$_pfocustrap_mutationobserver && e.$_pfocustrap_mutationobserver.disconnect(), e.$_pfocustrap_focusinlistener && e.removeEventListener("focusin", e.$_pfocustrap_focusinlistener) && (e.$_pfocustrap_focusinlistener = null), e.$_pfocustrap_focusoutlistener && e.removeEventListener("focusout", e.$_pfocustrap_focusoutlistener) && (e.$_pfocustrap_focusoutlistener = null);
    },
    autoFocus: function(e) {
      this.autoElementFocus(this.$el, {
        value: Ki(Ki({}, e), {}, {
          autoFocus: !0
        })
      });
    },
    autoElementFocus: function(e, n) {
      var o = n.value || {}, i = o.autoFocusSelector, a = i === void 0 ? "" : i, l = o.firstFocusableSelector, u = l === void 0 ? "" : l, s = o.autoFocus, d = s === void 0 ? !1 : s, m = Cn(e, "[autofocus]".concat(this.getComputedSelector(a)));
      d && !m && (m = Cn(e, this.getComputedSelector(u))), Ne(m);
    },
    onFirstHiddenElementFocus: function(e) {
      var n, o = e.currentTarget, i = e.relatedTarget, a = i === o.$_pfocustrap_lasthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(i)) ? Cn(o.parentElement, this.getComputedSelector(o.$_pfocustrap_focusableselector)) : o.$_pfocustrap_lasthiddenfocusableelement;
      Ne(a);
    },
    onLastHiddenElementFocus: function(e) {
      var n, o = e.currentTarget, i = e.relatedTarget, a = i === o.$_pfocustrap_firsthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(i)) ? Vr(o.parentElement, this.getComputedSelector(o.$_pfocustrap_focusableselector)) : o.$_pfocustrap_firsthiddenfocusableelement;
      Ne(a);
    },
    createHiddenFocusableElements: function(e, n) {
      var o = this, i = n.value || {}, a = i.tabIndex, l = a === void 0 ? 0 : a, u = i.firstFocusableSelector, s = u === void 0 ? "" : u, d = i.lastFocusableSelector, m = d === void 0 ? "" : d, f = function(x) {
        return jr("span", {
          class: "p-hidden-accessible p-hidden-focusable",
          tabIndex: l,
          role: "presentation",
          "aria-hidden": !0,
          "data-p-hidden-accessible": !0,
          "data-p-hidden-focusable": !0,
          onFocus: x?.bind(o)
        });
      }, v = f(this.onFirstHiddenElementFocus), g = f(this.onLastHiddenElementFocus);
      v.$_pfocustrap_lasthiddenfocusableelement = g, v.$_pfocustrap_focusableselector = s, v.setAttribute("data-pc-section", "firstfocusableelement"), g.$_pfocustrap_firsthiddenfocusableelement = v, g.$_pfocustrap_focusableselector = m, g.setAttribute("data-pc-section", "lastfocusableelement"), e.prepend(v), e.append(g);
    }
  }
});
function qi() {
  Ea({
    variableName: zr("scrollbar.width").name
  });
}
function Wi() {
  Aa({
    variableName: zr("scrollbar.width").name
  });
}
var Kl = `
    .p-dialog {
        max-height: 90%;
        transform: scale(1);
        border-radius: dt('dialog.border.radius');
        box-shadow: dt('dialog.shadow');
        background: dt('dialog.background');
        border: 1px solid dt('dialog.border.color');
        color: dt('dialog.color');
        will-change: transform;
    }

    .p-dialog-content {
        overflow-y: auto;
        padding: dt('dialog.content.padding');
        flex-grow: 1;
    }

    .p-dialog-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-shrink: 0;
        padding: dt('dialog.header.padding');
    }

    .p-dialog-title {
        font-weight: dt('dialog.title.font.weight');
        font-size: dt('dialog.title.font.size');
    }

    .p-dialog-footer {
        flex-shrink: 0;
        padding: dt('dialog.footer.padding');
        display: flex;
        justify-content: flex-end;
        gap: dt('dialog.footer.gap');
    }

    .p-dialog-header-actions {
        display: flex;
        align-items: center;
        gap: dt('dialog.header.gap');
    }

    .p-dialog-top .p-dialog,
    .p-dialog-bottom .p-dialog,
    .p-dialog-left .p-dialog,
    .p-dialog-right .p-dialog,
    .p-dialog-topleft .p-dialog,
    .p-dialog-topright .p-dialog,
    .p-dialog-bottomleft .p-dialog,
    .p-dialog-bottomright .p-dialog {
        margin: 1rem;
    }

    .p-dialog-maximized {
        width: 100vw !important;
        height: 100vh !important;
        top: 0px !important;
        left: 0px !important;
        max-height: 100%;
        height: 100%;
        border-radius: 0;
    }

    .p-dialog .p-resizable-handle {
        position: absolute;
        font-size: 0.1px;
        display: block;
        cursor: se-resize;
        width: 12px;
        height: 12px;
        right: 1px;
        bottom: 1px;
    }

    .p-dialog-enter-active {
        animation: p-animate-dialog-enter 300ms cubic-bezier(.19,1,.22,1);
    }

    .p-dialog-leave-active {
        animation: p-animate-dialog-leave 300ms cubic-bezier(.19,1,.22,1);
    }

    @keyframes p-animate-dialog-enter {
        from {
            opacity: 0;
            transform: scale(0.93);
        }
    }

    @keyframes p-animate-dialog-leave {
        to {
            opacity: 0;
            transform: scale(0.93);
        }
    }
`, ql = {
  mask: function(e) {
    var n = e.position, o = e.modal;
    return {
      position: "fixed",
      height: "100%",
      width: "100%",
      left: 0,
      top: 0,
      display: "flex",
      justifyContent: n === "left" || n === "topleft" || n === "bottomleft" ? "flex-start" : n === "right" || n === "topright" || n === "bottomright" ? "flex-end" : "center",
      alignItems: n === "top" || n === "topleft" || n === "topright" ? "flex-start" : n === "bottom" || n === "bottomleft" || n === "bottomright" ? "flex-end" : "center",
      pointerEvents: o ? "auto" : "none"
    };
  },
  root: {
    display: "flex",
    flexDirection: "column",
    pointerEvents: "auto"
  }
}, Wl = {
  mask: function(e) {
    var n = e.props, o = ["left", "right", "top", "topleft", "topright", "bottom", "bottomleft", "bottomright"], i = o.find(function(a) {
      return a === n.position;
    });
    return ["p-dialog-mask", {
      "p-overlay-mask p-overlay-mask-enter-active": n.modal
    }, i ? "p-dialog-".concat(i) : ""];
  },
  root: function(e) {
    var n = e.props, o = e.instance;
    return ["p-dialog p-component", {
      "p-dialog-maximized": n.maximizable && o.maximized
    }];
  },
  header: "p-dialog-header",
  title: "p-dialog-title",
  headerActions: "p-dialog-header-actions",
  pcMaximizeButton: "p-dialog-maximize-button",
  pcCloseButton: "p-dialog-close-button",
  content: "p-dialog-content",
  footer: "p-dialog-footer"
}, Gl = ke.extend({
  name: "dialog",
  style: Kl,
  classes: Wl,
  inlineStyles: ql
}), Zl = {
  name: "BaseDialog",
  extends: ln,
  props: {
    header: {
      type: null,
      default: null
    },
    footer: {
      type: null,
      default: null
    },
    visible: {
      type: Boolean,
      default: !1
    },
    modal: {
      type: Boolean,
      default: null
    },
    contentStyle: {
      type: null,
      default: null
    },
    contentClass: {
      type: String,
      default: null
    },
    contentProps: {
      type: null,
      default: null
    },
    maximizable: {
      type: Boolean,
      default: !1
    },
    dismissableMask: {
      type: Boolean,
      default: !1
    },
    closable: {
      type: Boolean,
      default: !0
    },
    closeOnEscape: {
      type: Boolean,
      default: !0
    },
    showHeader: {
      type: Boolean,
      default: !0
    },
    blockScroll: {
      type: Boolean,
      default: !1
    },
    baseZIndex: {
      type: Number,
      default: 0
    },
    autoZIndex: {
      type: Boolean,
      default: !0
    },
    position: {
      type: String,
      default: "center"
    },
    breakpoints: {
      type: Object,
      default: null
    },
    draggable: {
      type: Boolean,
      default: !0
    },
    keepInViewport: {
      type: Boolean,
      default: !0
    },
    minX: {
      type: Number,
      default: 0
    },
    minY: {
      type: Number,
      default: 0
    },
    appendTo: {
      type: [String, Object],
      default: "body"
    },
    closeIcon: {
      type: String,
      default: void 0
    },
    maximizeIcon: {
      type: String,
      default: void 0
    },
    minimizeIcon: {
      type: String,
      default: void 0
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
    maximizeButtonProps: {
      type: Object,
      default: function() {
        return {
          severity: "secondary",
          text: !0,
          rounded: !0
        };
      }
    },
    _instance: null
  },
  style: Gl,
  provide: function() {
    return {
      $pcDialog: this,
      $parentInstance: this
    };
  }
}, Jr = {
  name: "Dialog",
  extends: Zl,
  inheritAttrs: !1,
  emits: ["update:visible", "show", "hide", "after-hide", "maximize", "unmaximize", "dragstart", "dragend"],
  provide: function() {
    var e = this;
    return {
      dialogRef: G(function() {
        return e._instance;
      })
    };
  },
  data: function() {
    return {
      containerVisible: this.visible,
      maximized: !1,
      focusableMax: null,
      focusableClose: null,
      target: null
    };
  },
  documentKeydownListener: null,
  container: null,
  mask: null,
  content: null,
  headerContainer: null,
  footerContainer: null,
  maximizableButton: null,
  closeButton: null,
  styleElement: null,
  dragging: null,
  documentDragListener: null,
  documentDragEndListener: null,
  lastPageX: null,
  lastPageY: null,
  maskMouseDownTarget: null,
  updated: function() {
    this.visible && (this.containerVisible = this.visible);
  },
  beforeUnmount: function() {
    this.unbindDocumentState(), this.unbindGlobalListeners(), this.destroyStyle(), this.mask && this.autoZIndex && In.clear(this.mask), this.container = null, this.mask = null;
  },
  mounted: function() {
    this.breakpoints && this.createStyle();
  },
  methods: {
    close: function() {
      this.$emit("update:visible", !1);
    },
    onEnter: function() {
      this.$emit("show"), this.target = document.activeElement, this.enableDocumentSettings(), this.bindGlobalListeners(), this.autoZIndex && In.set("modal", this.mask, this.baseZIndex || this.$primevue.config.zIndex.modal);
    },
    onAfterEnter: function() {
      this.focus();
    },
    onBeforeLeave: function() {
      this.modal && !this.isUnstyled && Er(this.mask, "p-overlay-mask-leave-active"), this.dragging && this.documentDragEndListener && this.documentDragEndListener();
    },
    onLeave: function() {
      this.$emit("hide"), Ne(this.target), this.target = null, this.focusableClose = null, this.focusableMax = null;
    },
    onAfterLeave: function() {
      this.autoZIndex && In.clear(this.mask), this.containerVisible = !1, this.unbindDocumentState(), this.unbindGlobalListeners(), this.$emit("after-hide");
    },
    onMaskMouseDown: function(e) {
      this.maskMouseDownTarget = e.target;
    },
    onMaskMouseUp: function() {
      this.dismissableMask && this.modal && this.mask === this.maskMouseDownTarget && this.close();
    },
    focus: function() {
      var e = function(i) {
        return i && i.querySelector("[autofocus]");
      }, n = this.$slots.footer && e(this.footerContainer);
      n || (n = this.$slots.header && e(this.headerContainer), n || (n = this.$slots.default && e(this.content), n || (this.maximizable ? (this.focusableMax = !0, n = this.maximizableButton) : (this.focusableClose = !0, n = this.closeButton)))), n && Ne(n, {
        focusVisible: !0
      });
    },
    maximize: function(e) {
      this.maximized ? (this.maximized = !1, this.$emit("unmaximize", e)) : (this.maximized = !0, this.$emit("maximize", e)), this.modal || (this.maximized ? qi() : Wi());
    },
    enableDocumentSettings: function() {
      (this.modal || !this.modal && this.blockScroll || this.maximizable && this.maximized) && qi();
    },
    unbindDocumentState: function() {
      (this.modal || !this.modal && this.blockScroll || this.maximizable && this.maximized) && Wi();
    },
    onKeyDown: function(e) {
      e.code === "Escape" && this.closeOnEscape && !e.isComposing && this.close();
    },
    bindDocumentKeyDownListener: function() {
      this.documentKeydownListener || (this.documentKeydownListener = this.onKeyDown.bind(this), window.document.addEventListener("keydown", this.documentKeydownListener));
    },
    unbindDocumentKeyDownListener: function() {
      this.documentKeydownListener && (window.document.removeEventListener("keydown", this.documentKeydownListener), this.documentKeydownListener = null);
    },
    containerRef: function(e) {
      this.container = e;
    },
    maskRef: function(e) {
      this.mask = e;
    },
    contentRef: function(e) {
      this.content = e;
    },
    headerContainerRef: function(e) {
      this.headerContainer = e;
    },
    footerContainerRef: function(e) {
      this.footerContainer = e;
    },
    maximizableRef: function(e) {
      this.maximizableButton = e ? e.$el : void 0;
    },
    closeButtonRef: function(e) {
      this.closeButton = e ? e.$el : void 0;
    },
    createStyle: function() {
      if (!this.styleElement && !this.isUnstyled) {
        var e;
        this.styleElement = document.createElement("style"), this.styleElement.type = "text/css", Va(this.styleElement, "nonce", (e = this.$primevue) === null || e === void 0 || (e = e.config) === null || e === void 0 || (e = e.csp) === null || e === void 0 ? void 0 : e.nonce), document.head.appendChild(this.styleElement);
        var n = "";
        for (var o in this.breakpoints)
          n += `
                        @media screen and (max-width: `.concat(o, `) {
                            .p-dialog[`).concat(this.$attrSelector, `] {
                                width: `).concat(this.breakpoints[o], ` !important;
                            }
                        }
                    `);
        this.styleElement.innerHTML = n;
      }
    },
    destroyStyle: function() {
      this.styleElement && (document.head.removeChild(this.styleElement), this.styleElement = null);
    },
    initDrag: function(e) {
      e.target.closest("div").getAttribute("data-pc-section") !== "headeractions" && this.draggable && (this.dragging = !0, this.lastPageX = e.pageX, this.lastPageY = e.pageY, this.container.style.margin = "0", document.body.setAttribute("data-p-unselectable-text", "true"), !this.isUnstyled && Dr(document.body, {
        "user-select": "none"
      }), this.$emit("dragstart", e));
    },
    bindGlobalListeners: function() {
      this.draggable && (this.bindDocumentDragListener(), this.bindDocumentDragEndListener()), this.closeOnEscape && this.bindDocumentKeyDownListener();
    },
    unbindGlobalListeners: function() {
      this.unbindDocumentDragListener(), this.unbindDocumentDragEndListener(), this.unbindDocumentKeyDownListener();
    },
    bindDocumentDragListener: function() {
      var e = this;
      this.documentDragListener = function(n) {
        if (e.dragging) {
          var o = yi(e.container), i = Ar(e.container), a = n.pageX - e.lastPageX, l = n.pageY - e.lastPageY, u = e.container.getBoundingClientRect(), s = u.left + a, d = u.top + l, m = ja(), f = getComputedStyle(e.container), v = parseFloat(f.marginLeft), g = parseFloat(f.marginTop);
          e.container.style.position = "fixed", e.keepInViewport ? (s >= e.minX && s + o < m.width && (e.lastPageX = n.pageX, e.container.style.left = s - v + "px"), d >= e.minY && d + i < m.height && (e.lastPageY = n.pageY, e.container.style.top = d - g + "px")) : (e.lastPageX = n.pageX, e.container.style.left = s - v + "px", e.lastPageY = n.pageY, e.container.style.top = d - g + "px");
        }
      }, window.document.addEventListener("mousemove", this.documentDragListener);
    },
    unbindDocumentDragListener: function() {
      this.documentDragListener && (window.document.removeEventListener("mousemove", this.documentDragListener), this.documentDragListener = null);
    },
    bindDocumentDragEndListener: function() {
      var e = this;
      this.documentDragEndListener = function(n) {
        e.dragging && (e.dragging = !1, document.body.removeAttribute("data-p-unselectable-text"), !e.isUnstyled && (document.body.style["user-select"] = ""), e.$emit("dragend", n));
      }, window.document.addEventListener("mouseup", this.documentDragEndListener);
    },
    unbindDocumentDragEndListener: function() {
      this.documentDragEndListener && (window.document.removeEventListener("mouseup", this.documentDragEndListener), this.documentDragEndListener = null);
    }
  },
  computed: {
    maximizeIconComponent: function() {
      return this.maximized ? this.minimizeIcon ? "span" : "WindowMinimizeIcon" : this.maximizeIcon ? "span" : "WindowMaximizeIcon";
    },
    ariaLabelledById: function() {
      return this.header != null || this.$attrs["aria-labelledby"] !== null ? this.$id + "_header" : null;
    },
    closeAriaLabel: function() {
      return this.$primevue.config.locale.aria ? this.$primevue.config.locale.aria.close : void 0;
    },
    dataP: function() {
      return _t({
        maximized: this.maximized,
        modal: this.modal
      });
    }
  },
  directives: {
    ripple: wi,
    focustrap: Hl
  },
  components: {
    Button: Xr,
    Portal: Mr,
    WindowMinimizeIcon: Zr,
    WindowMaximizeIcon: Gr,
    TimesIcon: _i
  }
};
function io(t) {
  "@babel/helpers - typeof";
  return io = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, io(t);
}
function Gi(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    e && (o = o.filter(function(i) {
      return Object.getOwnPropertyDescriptor(t, i).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function Zi(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Gi(Object(n), !0).forEach(function(o) {
      Yl(t, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Gi(Object(n)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return t;
}
function Yl(t, e, n) {
  return (e = Xl(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Xl(t) {
  var e = Jl(t, "string");
  return io(e) == "symbol" ? e : e + "";
}
function Jl(t, e) {
  if (io(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (io(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Ql = ["data-p"], eu = ["aria-labelledby", "aria-modal", "data-p"], tu = ["id"], nu = ["data-p"];
function ou(t, e, n, o, i, a) {
  var l = Ve("Button"), u = Ve("Portal"), s = Bo("focustrap");
  return p(), xe(u, {
    appendTo: t.appendTo
  }, {
    default: Ie(function() {
      return [i.containerVisible ? (p(), h("div", K({
        key: 0,
        ref: a.maskRef,
        class: t.cx("mask"),
        style: t.sx("mask", !0, {
          position: t.position,
          modal: t.modal
        }),
        onMousedown: e[1] || (e[1] = function() {
          return a.onMaskMouseDown && a.onMaskMouseDown.apply(a, arguments);
        }),
        onMouseup: e[2] || (e[2] = function() {
          return a.onMaskMouseUp && a.onMaskMouseUp.apply(a, arguments);
        }),
        "data-p": a.dataP
      }, t.ptm("mask")), [P(Rr, K({
        name: "p-dialog",
        onEnter: a.onEnter,
        onAfterEnter: a.onAfterEnter,
        onBeforeLeave: a.onBeforeLeave,
        onLeave: a.onLeave,
        onAfterLeave: a.onAfterLeave,
        appear: ""
      }, t.ptm("transition")), {
        default: Ie(function() {
          return [t.visible ? Xe((p(), h("div", K({
            key: 0,
            ref: a.containerRef,
            class: t.cx("root"),
            style: t.sx("root"),
            role: "dialog",
            "aria-labelledby": a.ariaLabelledById,
            "aria-modal": t.modal,
            "data-p": a.dataP
          }, t.ptmi("root")), [t.$slots.container ? ae(t.$slots, "container", {
            key: 0,
            closeCallback: a.close,
            maximizeCallback: function(m) {
              return a.maximize(m);
            },
            initDragCallback: a.initDrag
          }) : (p(), h(X, {
            key: 1
          }, [t.showHeader ? (p(), h("div", K({
            key: 0,
            ref: a.headerContainerRef,
            class: t.cx("header"),
            onMousedown: e[0] || (e[0] = function() {
              return a.initDrag && a.initDrag.apply(a, arguments);
            })
          }, t.ptm("header")), [ae(t.$slots, "header", {
            class: oe(t.cx("title"))
          }, function() {
            return [t.header ? (p(), h("span", K({
              key: 0,
              id: a.ariaLabelledById,
              class: t.cx("title")
            }, t.ptm("title")), k(t.header), 17, tu)) : _("", !0)];
          }), c("div", K({
            class: t.cx("headerActions")
          }, t.ptm("headerActions")), [t.maximizable ? ae(t.$slots, "maximizebutton", {
            key: 0,
            maximized: i.maximized,
            maximizeCallback: function(m) {
              return a.maximize(m);
            }
          }, function() {
            return [P(l, K({
              ref: a.maximizableRef,
              autofocus: i.focusableMax,
              class: t.cx("pcMaximizeButton"),
              onClick: a.maximize,
              tabindex: t.maximizable ? "0" : "-1",
              unstyled: t.unstyled
            }, t.maximizeButtonProps, {
              pt: t.ptm("pcMaximizeButton"),
              "data-pc-group-section": "headericon"
            }), {
              icon: Ie(function(d) {
                return [ae(t.$slots, "maximizeicon", {
                  maximized: i.maximized
                }, function() {
                  return [(p(), xe(Ln(a.maximizeIconComponent), K({
                    class: [d.class, i.maximized ? t.minimizeIcon : t.maximizeIcon]
                  }, t.ptm("pcMaximizeButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "tabindex", "unstyled", "pt"])];
          }) : _("", !0), t.closable ? ae(t.$slots, "closebutton", {
            key: 1,
            closeCallback: a.close
          }, function() {
            return [P(l, K({
              ref: a.closeButtonRef,
              autofocus: i.focusableClose,
              class: t.cx("pcCloseButton"),
              onClick: a.close,
              "aria-label": a.closeAriaLabel,
              unstyled: t.unstyled
            }, t.closeButtonProps, {
              pt: t.ptm("pcCloseButton"),
              "data-pc-group-section": "headericon"
            }), {
              icon: Ie(function(d) {
                return [ae(t.$slots, "closeicon", {}, function() {
                  return [(p(), xe(Ln(t.closeIcon ? "span" : "TimesIcon"), K({
                    class: [t.closeIcon, d.class]
                  }, t.ptm("pcCloseButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "aria-label", "unstyled", "pt"])];
          }) : _("", !0)], 16)], 16)) : _("", !0), c("div", K({
            ref: a.contentRef,
            class: [t.cx("content"), t.contentClass],
            style: t.contentStyle,
            "data-p": a.dataP
          }, Zi(Zi({}, t.contentProps), t.ptm("content"))), [ae(t.$slots, "default")], 16, nu), t.footer || t.$slots.footer ? (p(), h("div", K({
            key: 1,
            ref: a.footerContainerRef,
            class: t.cx("footer")
          }, t.ptm("footer")), [ae(t.$slots, "footer", {}, function() {
            return [F(k(t.footer), 1)];
          })], 16)) : _("", !0)], 64))], 16, eu)), [[s, {
            disabled: !t.modal
          }]]) : _("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onBeforeLeave", "onLeave", "onAfterLeave"])], 16, Ql)) : _("", !0)];
    }),
    _: 3
  }, 8, ["appendTo"]);
}
Jr.render = ou;
var Qr = {
  name: "BlankIcon",
  extends: un
};
function iu(t) {
  return lu(t) || su(t) || au(t) || ru();
}
function ru() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function au(t, e) {
  if (t) {
    if (typeof t == "string") return ri(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? ri(t, e) : void 0;
  }
}
function su(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function lu(t) {
  if (Array.isArray(t)) return ri(t);
}
function ri(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function uu(t, e, n, o, i, a) {
  return p(), h("svg", K({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), iu(e[0] || (e[0] = [c("rect", {
    width: "1",
    height: "1",
    fill: "currentColor",
    "fill-opacity": "0"
  }, null, -1)])), 16);
}
Qr.render = uu;
var ea = {
  name: "CheckIcon",
  extends: un
};
function du(t) {
  return fu(t) || mu(t) || pu(t) || cu();
}
function cu() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function pu(t, e) {
  if (t) {
    if (typeof t == "string") return ai(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? ai(t, e) : void 0;
  }
}
function mu(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function fu(t) {
  if (Array.isArray(t)) return ai(t);
}
function ai(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function hu(t, e, n, o, i, a) {
  return p(), h("svg", K({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), du(e[0] || (e[0] = [c("path", {
    d: "M4.86199 11.5948C4.78717 11.5923 4.71366 11.5745 4.64596 11.5426C4.57826 11.5107 4.51779 11.4652 4.46827 11.4091L0.753985 7.69483C0.683167 7.64891 0.623706 7.58751 0.580092 7.51525C0.536478 7.44299 0.509851 7.36177 0.502221 7.27771C0.49459 7.19366 0.506156 7.10897 0.536046 7.03004C0.565935 6.95111 0.613367 6.88 0.674759 6.82208C0.736151 6.76416 0.8099 6.72095 0.890436 6.69571C0.970973 6.67046 1.05619 6.66385 1.13966 6.67635C1.22313 6.68886 1.30266 6.72017 1.37226 6.76792C1.44186 6.81567 1.4997 6.8786 1.54141 6.95197L4.86199 10.2503L12.6397 2.49483C12.7444 2.42694 12.8689 2.39617 12.9932 2.40745C13.1174 2.41873 13.2343 2.47141 13.3251 2.55705C13.4159 2.64268 13.4753 2.75632 13.4938 2.87973C13.5123 3.00315 13.4888 3.1292 13.4271 3.23768L5.2557 11.4091C5.20618 11.4652 5.14571 11.5107 5.07801 11.5426C5.01031 11.5745 4.9368 11.5923 4.86199 11.5948Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
ea.render = hu;
var ta = {
  name: "ChevronDownIcon",
  extends: un
};
function bu(t) {
  return ku(t) || yu(t) || gu(t) || vu();
}
function vu() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function gu(t, e) {
  if (t) {
    if (typeof t == "string") return si(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? si(t, e) : void 0;
  }
}
function yu(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function ku(t) {
  if (Array.isArray(t)) return si(t);
}
function si(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function $u(t, e, n, o, i, a) {
  return p(), h("svg", K({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), bu(e[0] || (e[0] = [c("path", {
    d: "M7.01744 10.398C6.91269 10.3985 6.8089 10.378 6.71215 10.3379C6.61541 10.2977 6.52766 10.2386 6.45405 10.1641L1.13907 4.84913C1.03306 4.69404 0.985221 4.5065 1.00399 4.31958C1.02276 4.13266 1.10693 3.95838 1.24166 3.82747C1.37639 3.69655 1.55301 3.61742 1.74039 3.60402C1.92777 3.59062 2.11386 3.64382 2.26584 3.75424L7.01744 8.47394L11.769 3.75424C11.9189 3.65709 12.097 3.61306 12.2748 3.62921C12.4527 3.64535 12.6199 3.72073 12.7498 3.84328C12.8797 3.96582 12.9647 4.12842 12.9912 4.30502C13.0177 4.48162 12.9841 4.662 12.8958 4.81724L7.58083 10.1322C7.50996 10.2125 7.42344 10.2775 7.32656 10.3232C7.22968 10.3689 7.12449 10.3944 7.01744 10.398Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
ta.render = $u;
var na = {
  name: "SearchIcon",
  extends: un
};
function Su(t) {
  return Ou(t) || Cu(t) || _u(t) || wu();
}
function wu() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function _u(t, e) {
  if (t) {
    if (typeof t == "string") return li(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? li(t, e) : void 0;
  }
}
function Cu(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Ou(t) {
  if (Array.isArray(t)) return li(t);
}
function li(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function xu(t, e, n, o, i, a) {
  return p(), h("svg", K({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Su(e[0] || (e[0] = [c("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M2.67602 11.0265C3.6661 11.688 4.83011 12.0411 6.02086 12.0411C6.81149 12.0411 7.59438 11.8854 8.32483 11.5828C8.87005 11.357 9.37808 11.0526 9.83317 10.6803L12.9769 13.8241C13.0323 13.8801 13.0983 13.9245 13.171 13.9548C13.2438 13.985 13.3219 14.0003 13.4007 14C13.4795 14.0003 13.5575 13.985 13.6303 13.9548C13.7031 13.9245 13.7691 13.8801 13.8244 13.8241C13.9367 13.7116 13.9998 13.5592 13.9998 13.4003C13.9998 13.2414 13.9367 13.089 13.8244 12.9765L10.6807 9.8328C11.053 9.37773 11.3573 8.86972 11.5831 8.32452C11.8857 7.59408 12.0414 6.81119 12.0414 6.02056C12.0414 4.8298 11.6883 3.66579 11.0268 2.67572C10.3652 1.68564 9.42494 0.913972 8.32483 0.45829C7.22472 0.00260857 6.01418 -0.116618 4.84631 0.115686C3.67844 0.34799 2.60568 0.921393 1.76369 1.76338C0.921698 2.60537 0.348296 3.67813 0.115991 4.84601C-0.116313 6.01388 0.00291375 7.22441 0.458595 8.32452C0.914277 9.42464 1.68595 10.3649 2.67602 11.0265ZM3.35565 2.0158C4.14456 1.48867 5.07206 1.20731 6.02086 1.20731C7.29317 1.20731 8.51338 1.71274 9.41304 2.6124C10.3127 3.51206 10.8181 4.73226 10.8181 6.00457C10.8181 6.95337 10.5368 7.88088 10.0096 8.66978C9.48251 9.45868 8.73328 10.0736 7.85669 10.4367C6.98011 10.7997 6.01554 10.8947 5.08496 10.7096C4.15439 10.5245 3.2996 10.0676 2.62869 9.39674C1.95778 8.72583 1.50089 7.87104 1.31579 6.94046C1.13068 6.00989 1.22568 5.04532 1.58878 4.16874C1.95187 3.29215 2.56675 2.54292 3.35565 2.0158Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
na.render = xu;
var Iu = `
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
`, Pu = {
  root: "p-iconfield"
}, Tu = ke.extend({
  name: "iconfield",
  style: Iu,
  classes: Pu
}), Lu = {
  name: "BaseIconField",
  extends: ln,
  style: Tu,
  provide: function() {
    return {
      $pcIconField: this,
      $parentInstance: this
    };
  }
}, oa = {
  name: "IconField",
  extends: Lu,
  inheritAttrs: !1
};
function Au(t, e, n, o, i, a) {
  return p(), h("div", K({
    class: t.cx("root")
  }, t.ptmi("root")), [ae(t.$slots, "default")], 16);
}
oa.render = Au;
var Eu = {
  root: "p-inputicon"
}, ju = ke.extend({
  name: "inputicon",
  classes: Eu
}), Vu = {
  name: "BaseInputIcon",
  extends: ln,
  style: ju,
  props: {
    class: null
  },
  provide: function() {
    return {
      $pcInputIcon: this,
      $parentInstance: this
    };
  }
}, ia = {
  name: "InputIcon",
  extends: Vu,
  inheritAttrs: !1,
  computed: {
    containerClass: function() {
      return [this.cx("root"), this.class];
    }
  }
};
function zu(t, e, n, o, i, a) {
  return p(), h("span", K({
    class: a.containerClass
  }, t.ptmi("root"), {
    "aria-hidden": "true"
  }), [ae(t.$slots, "default")], 16);
}
ia.render = zu;
var Mu = {
  name: "BaseEditableHolder",
  extends: ln,
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
        var n, o;
        this.formField = ((n = this.$pcForm) === null || n === void 0 || (o = n.register) === null || o === void 0 ? void 0 : o.call(n, e, this.$formControl)) || {};
      }
    },
    $formControl: {
      immediate: !0,
      handler: function(e) {
        var n, o;
        this.formField = ((n = this.$pcForm) === null || n === void 0 || (o = n.register) === null || o === void 0 ? void 0 : o.call(n, this.$formName, e)) || {};
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
      var o, i;
      this.controlled && (this.d_value = e, this.$emit("update:modelValue", e)), this.$emit("value-change", e), (o = (i = this.formField).onChange) === null || o === void 0 || o.call(i, {
        originalEvent: n,
        value: e
      });
    },
    // @todo move to @primeuix/utils
    findNonEmpty: function() {
      for (var e = arguments.length, n = new Array(e), o = 0; o < e; o++)
        n[o] = arguments[o];
      return n.find(zt);
    }
  },
  computed: {
    $filled: function() {
      return zt(this.d_value);
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
}, ra = {
  name: "BaseInput",
  extends: Mu,
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
}, Du = `
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
`, Bu = {
  root: function(e) {
    var n = e.instance, o = e.props;
    return ["p-inputtext p-component", {
      "p-filled": n.$filled,
      "p-inputtext-sm p-inputfield-sm": o.size === "small",
      "p-inputtext-lg p-inputfield-lg": o.size === "large",
      "p-invalid": n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-inputtext-fluid": n.$fluid
    }];
  }
}, Fu = ke.extend({
  name: "inputtext",
  style: Du,
  classes: Bu
}), Ru = {
  name: "BaseInputText",
  extends: ra,
  style: Fu,
  provide: function() {
    return {
      $pcInputText: this,
      $parentInstance: this
    };
  }
};
function ro(t) {
  "@babel/helpers - typeof";
  return ro = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, ro(t);
}
function Nu(t, e, n) {
  return (e = Uu(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Uu(t) {
  var e = Hu(t, "string");
  return ro(e) == "symbol" ? e : e + "";
}
function Hu(t, e) {
  if (ro(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (ro(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var aa = {
  name: "InputText",
  extends: Ru,
  inheritAttrs: !1,
  methods: {
    onInput: function(e) {
      this.writeValue(e.target.value, e);
    }
  },
  computed: {
    attrs: function() {
      return K(this.ptmi("root", {
        context: {
          filled: this.$filled,
          disabled: this.disabled
        }
      }), this.formField);
    },
    dataP: function() {
      return _t(Nu({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, Ku = ["value", "name", "disabled", "aria-invalid", "data-p"];
function qu(t, e, n, o, i, a) {
  return p(), h("input", K({
    type: "text",
    class: t.cx("root"),
    value: t.d_value,
    name: t.name,
    disabled: t.disabled,
    "aria-invalid": t.$invalid || void 0,
    "data-p": a.dataP,
    onInput: e[0] || (e[0] = function() {
      return a.onInput && a.onInput.apply(a, arguments);
    })
  }, a.attrs), null, 16, Ku);
}
aa.render = qu;
var Wu = `
    .p-virtualscroller-loader {
        background: dt('virtualscroller.loader.mask.background');
        color: dt('virtualscroller.loader.mask.color');
    }

    .p-virtualscroller-loading-icon {
        font-size: dt('virtualscroller.loader.icon.size');
        width: dt('virtualscroller.loader.icon.size');
        height: dt('virtualscroller.loader.icon.size');
    }
`, Gu = `
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
`, Yi = ke.extend({
  name: "virtualscroller",
  css: Gu,
  style: Wu
}), Zu = {
  name: "BaseVirtualScroller",
  extends: ln,
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
  style: Yi,
  provide: function() {
    return {
      $pcVirtualScroller: this,
      $parentInstance: this
    };
  },
  beforeMount: function() {
    var e;
    Yi.loadCSS({
      nonce: (e = this.$primevueConfig) === null || e === void 0 || (e = e.csp) === null || e === void 0 ? void 0 : e.nonce
    });
  }
};
function ao(t) {
  "@babel/helpers - typeof";
  return ao = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, ao(t);
}
function Xi(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    e && (o = o.filter(function(i) {
      return Object.getOwnPropertyDescriptor(t, i).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function Dn(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Xi(Object(n), !0).forEach(function(o) {
      sa(t, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Xi(Object(n)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return t;
}
function sa(t, e, n) {
  return (e = Yu(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Yu(t) {
  var e = Xu(t, "string");
  return ao(e) == "symbol" ? e : e + "";
}
function Xu(t, e) {
  if (ao(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (ao(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var la = {
  name: "VirtualScroller",
  extends: Zu,
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
      Lo(this.element) && (this.setContentEl(this.content), this.init(), this.calculateAutoSize(), this.defaultWidth = mn(this.element), this.defaultHeight = pn(this.element), this.defaultContentWidth = mn(this.content), this.defaultContentHeight = pn(this.content), this.initialized = !0), this.element && this.bindResizeListener();
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
      var n = this, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "auto", i = this.isBoth(), a = this.isHorizontal(), l = i ? e.every(function($) {
        return $ > -1;
      }) : e > -1;
      if (l) {
        var u = this.first, s = this.element, d = s.scrollTop, m = d === void 0 ? 0 : d, f = s.scrollLeft, v = f === void 0 ? 0 : f, g = this.calculateNumItems(), w = g.numToleratedItems, x = this.getContentPosition(), S = this.itemSize, T = function() {
          var L = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, z = arguments.length > 1 ? arguments[1] : void 0;
          return L <= z ? 0 : L;
        }, j = function(L, z, ie) {
          return L * z + ie;
        }, I = function() {
          var L = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, z = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return n.scrollTo({
            left: L,
            top: z,
            behavior: o
          });
        }, y = i ? {
          rows: 0,
          cols: 0
        } : 0, b = !1, W = !1;
        i ? (y = {
          rows: T(e[0], w[0]),
          cols: T(e[1], w[1])
        }, I(j(y.cols, S[1], x.left), j(y.rows, S[0], x.top)), W = this.lastScrollPos.top !== m || this.lastScrollPos.left !== v, b = y.rows !== u.rows || y.cols !== u.cols) : (y = T(e, w), a ? I(j(y, S, x.left), m) : I(v, j(y, S, x.top)), W = this.lastScrollPos !== (a ? v : m), b = y !== u), this.isRangeChanged = b, W && (this.first = y);
      }
    },
    scrollInView: function(e, n) {
      var o = this, i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "auto";
      if (n) {
        var a = this.isBoth(), l = this.isHorizontal(), u = a ? e.every(function(S) {
          return S > -1;
        }) : e > -1;
        if (u) {
          var s = this.getRenderedRange(), d = s.first, m = s.viewport, f = function() {
            var T = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, j = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
            return o.scrollTo({
              left: T,
              top: j,
              behavior: i
            });
          }, v = n === "to-start", g = n === "to-end";
          if (v) {
            if (a)
              m.first.rows - d.rows > e[0] ? f(m.first.cols * this.itemSize[1], (m.first.rows - 1) * this.itemSize[0]) : m.first.cols - d.cols > e[1] && f((m.first.cols - 1) * this.itemSize[1], m.first.rows * this.itemSize[0]);
            else if (m.first - d > e) {
              var w = (m.first - 1) * this.itemSize;
              l ? f(w, 0) : f(0, w);
            }
          } else if (g) {
            if (a)
              m.last.rows - d.rows <= e[0] + 1 ? f(m.first.cols * this.itemSize[1], (m.first.rows + 1) * this.itemSize[0]) : m.last.cols - d.cols <= e[1] + 1 && f((m.first.cols + 1) * this.itemSize[1], m.first.rows * this.itemSize[0]);
            else if (m.last - d <= e + 1) {
              var x = (m.first + 1) * this.itemSize;
              l ? f(x, 0) : f(0, x);
            }
          }
        }
      } else
        this.scrollToIndex(e, i);
    },
    getRenderedRange: function() {
      var e = function(f, v) {
        return Math.floor(f / (v || f));
      }, n = this.first, o = 0;
      if (this.element) {
        var i = this.isBoth(), a = this.isHorizontal(), l = this.element, u = l.scrollTop, s = l.scrollLeft;
        if (i)
          n = {
            rows: e(u, this.itemSize[0]),
            cols: e(s, this.itemSize[1])
          }, o = {
            rows: n.rows + this.numItemsInViewport.rows,
            cols: n.cols + this.numItemsInViewport.cols
          };
        else {
          var d = a ? s : u;
          n = e(d, this.itemSize), o = n + this.numItemsInViewport;
        }
      }
      return {
        first: this.first,
        last: this.last,
        viewport: {
          first: n,
          last: o
        }
      };
    },
    calculateNumItems: function() {
      var e = this.isBoth(), n = this.isHorizontal(), o = this.itemSize, i = this.getContentPosition(), a = this.element ? this.element.offsetWidth - i.left : 0, l = this.element ? this.element.offsetHeight - i.top : 0, u = function(v, g) {
        return Math.ceil(v / (g || v));
      }, s = function(v) {
        return Math.ceil(v / 2);
      }, d = e ? {
        rows: u(l, o[0]),
        cols: u(a, o[1])
      } : u(n ? a : l, o), m = this.d_numToleratedItems || (e ? [s(d.rows), s(d.cols)] : s(d));
      return {
        numItemsInViewport: d,
        numToleratedItems: m
      };
    },
    calculateOptions: function() {
      var e = this, n = this.isBoth(), o = this.first, i = this.calculateNumItems(), a = i.numItemsInViewport, l = i.numToleratedItems, u = function(m, f, v) {
        var g = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !1;
        return e.getLast(m + f + (m < v ? 2 : 3) * v, g);
      }, s = n ? {
        rows: u(o.rows, a.rows, l[0]),
        cols: u(o.cols, a.cols, l[1], !0)
      } : u(o, a, l);
      this.last = s, this.numItemsInViewport = a, this.d_numToleratedItems = l, this.$emit("update:numToleratedItems", this.d_numToleratedItems), this.showLoader && (this.loaderArr = n ? Array.from({
        length: a.rows
      }).map(function() {
        return Array.from({
          length: a.cols
        });
      }) : Array.from({
        length: a
      })), this.lazy && Promise.resolve().then(function() {
        var d;
        e.lazyLoadState = {
          first: e.step ? n ? {
            rows: 0,
            cols: o.cols
          } : 0 : o,
          last: Math.min(e.step ? e.step : s, ((d = e.items) === null || d === void 0 ? void 0 : d.length) || 0)
        }, e.$emit("lazy-load", e.lazyLoadState);
      });
    },
    calculateAutoSize: function() {
      var e = this;
      this.autoSize && !this.d_loading && Promise.resolve().then(function() {
        if (e.content) {
          var n = e.isBoth(), o = e.isHorizontal(), i = e.isVertical();
          e.content.style.minHeight = e.content.style.minWidth = "auto", e.content.style.position = "relative", e.element.style.contain = "none";
          var a = [mn(e.element), pn(e.element)], l = a[0], u = a[1];
          (n || o) && (e.element.style.width = l < e.defaultWidth ? l + "px" : e.scrollWidth || e.defaultWidth + "px"), (n || i) && (e.element.style.height = u < e.defaultHeight ? u + "px" : e.scrollHeight || e.defaultHeight + "px"), e.content.style.minHeight = e.content.style.minWidth = "", e.content.style.position = "", e.element.style.contain = "";
        }
      });
    },
    getLast: function() {
      var e, n, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, i = arguments.length > 1 ? arguments[1] : void 0;
      return this.items ? Math.min(i ? ((e = this.columns || this.items[0]) === null || e === void 0 ? void 0 : e.length) || 0 : ((n = this.items) === null || n === void 0 ? void 0 : n.length) || 0, o) : 0;
    },
    getContentPosition: function() {
      if (this.content) {
        var e = getComputedStyle(this.content), n = parseFloat(e.paddingLeft) + Math.max(parseFloat(e.left) || 0, 0), o = parseFloat(e.paddingRight) + Math.max(parseFloat(e.right) || 0, 0), i = parseFloat(e.paddingTop) + Math.max(parseFloat(e.top) || 0, 0), a = parseFloat(e.paddingBottom) + Math.max(parseFloat(e.bottom) || 0, 0);
        return {
          left: n,
          right: o,
          top: i,
          bottom: a,
          x: n + o,
          y: i + a
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
        var n = this.isBoth(), o = this.isHorizontal(), i = this.element.parentElement, a = this.scrollWidth || "".concat(this.element.offsetWidth || i.offsetWidth, "px"), l = this.scrollHeight || "".concat(this.element.offsetHeight || i.offsetHeight, "px"), u = function(d, m) {
          return e.element.style[d] = m;
        };
        n || o ? (u("height", l), u("width", a)) : u("height", l);
      }
    },
    setSpacerSize: function() {
      var e = this, n = this.items;
      if (n) {
        var o = this.isBoth(), i = this.isHorizontal(), a = this.getContentPosition(), l = function(s, d, m) {
          var f = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 0;
          return e.spacerStyle = Dn(Dn({}, e.spacerStyle), sa({}, "".concat(s), (d || []).length * m + f + "px"));
        };
        o ? (l("height", n, this.itemSize[0], a.y), l("width", this.columns || n[1], this.itemSize[1], a.x)) : i ? l("width", this.columns || n, this.itemSize, a.x) : l("height", n, this.itemSize, a.y);
      }
    },
    setContentPosition: function(e) {
      var n = this;
      if (this.content && !this.appendOnly) {
        var o = this.isBoth(), i = this.isHorizontal(), a = e ? e.first : this.first, l = function(m, f) {
          return m * f;
        }, u = function() {
          var m = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, f = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return n.contentStyle = Dn(Dn({}, n.contentStyle), {
            transform: "translate3d(".concat(m, "px, ").concat(f, "px, 0)")
          });
        };
        if (o)
          u(l(a.cols, this.itemSize[1]), l(a.rows, this.itemSize[0]));
        else {
          var s = l(a, this.itemSize);
          i ? u(s, 0) : u(0, s);
        }
      }
    },
    onScrollPositionChange: function(e) {
      var n = this, o = e.target, i = this.isBoth(), a = this.isHorizontal(), l = this.getContentPosition(), u = function(C, V) {
        return C ? C > V ? C - V : C : 0;
      }, s = function(C, V) {
        return Math.floor(C / (V || C));
      }, d = function(C, V, D, H, J, ee) {
        return C <= J ? J : ee ? D - H - J : V + J - 1;
      }, m = function(C, V, D, H, J, ee, te, pe) {
        if (C <= ee) return 0;
        var re = Math.max(0, te ? C < V ? D : C - ee : C > V ? D : C - 2 * ee), ge = n.getLast(re, pe);
        return re > ge ? ge - J : re;
      }, f = function(C, V, D, H, J, ee) {
        var te = V + H + 2 * J;
        return C >= J && (te += J + 1), n.getLast(te, ee);
      }, v = u(o.scrollTop, l.top), g = u(o.scrollLeft, l.left), w = i ? {
        rows: 0,
        cols: 0
      } : 0, x = this.last, S = !1, T = this.lastScrollPos;
      if (i) {
        var j = this.lastScrollPos.top <= v, I = this.lastScrollPos.left <= g;
        if (!this.appendOnly || this.appendOnly && (j || I)) {
          var y = {
            rows: s(v, this.itemSize[0]),
            cols: s(g, this.itemSize[1])
          }, b = {
            rows: d(y.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], j),
            cols: d(y.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], I)
          };
          w = {
            rows: m(y.rows, b.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], j),
            cols: m(y.cols, b.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], I, !0)
          }, x = {
            rows: f(y.rows, w.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0]),
            cols: f(y.cols, w.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], !0)
          }, S = w.rows !== this.first.rows || x.rows !== this.last.rows || w.cols !== this.first.cols || x.cols !== this.last.cols || this.isRangeChanged, T = {
            top: v,
            left: g
          };
        }
      } else {
        var W = a ? g : v, $ = this.lastScrollPos <= W;
        if (!this.appendOnly || this.appendOnly && $) {
          var L = s(W, this.itemSize), z = d(L, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, $);
          w = m(L, z, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, $), x = f(L, w, this.last, this.numItemsInViewport, this.d_numToleratedItems), S = w !== this.first || x !== this.last || this.isRangeChanged, T = W;
        }
      }
      return {
        first: w,
        last: x,
        isRangeChanged: S,
        scrollPos: T
      };
    },
    onScrollChange: function(e) {
      var n = this.onScrollPositionChange(e), o = n.first, i = n.last, a = n.isRangeChanged, l = n.scrollPos;
      if (a) {
        var u = {
          first: o,
          last: i
        };
        if (this.setContentPosition(u), this.first = o, this.last = i, this.lastScrollPos = l, this.$emit("scroll-index-change", u), this.lazy && this.isPageChanged(o)) {
          var s, d, m = {
            first: this.step ? Math.min(this.getPageByFirst(o) * this.step, (((s = this.items) === null || s === void 0 ? void 0 : s.length) || 0) - this.step) : o,
            last: Math.min(this.step ? (this.getPageByFirst(o) + 1) * this.step : i, ((d = this.items) === null || d === void 0 ? void 0 : d.length) || 0)
          }, f = this.lazyLoadState.first !== m.first || this.lazyLoadState.last !== m.last;
          f && this.$emit("lazy-load", m), this.lazyLoadState = m;
        }
      }
    },
    onScroll: function(e) {
      var n = this;
      if (this.$emit("scroll", e), this.delay) {
        if (this.scrollTimeout && clearTimeout(this.scrollTimeout), this.isPageChanged()) {
          if (!this.d_loading && this.showLoader) {
            var o = this.onScrollPositionChange(e), i = o.isRangeChanged, a = i || (this.step ? this.isPageChanged() : !1);
            a && (this.d_loading = !0);
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
        if (Lo(e.element)) {
          var n = e.isBoth(), o = e.isVertical(), i = e.isHorizontal(), a = [mn(e.element), pn(e.element)], l = a[0], u = a[1], s = l !== e.defaultWidth, d = u !== e.defaultHeight, m = n ? s || d : i ? s : o ? d : !1;
          m && (e.d_numToleratedItems = e.numToleratedItems, e.defaultWidth = l, e.defaultHeight = u, e.defaultContentWidth = mn(e.content), e.defaultContentHeight = pn(e.content), e.init());
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
      var n = (this.items || []).length, o = this.isBoth() ? this.first.rows + e : this.first + e;
      return {
        index: o,
        count: n,
        first: o === 0,
        last: o === n - 1,
        even: o % 2 === 0,
        odd: o % 2 !== 0
      };
    },
    getLoaderOptions: function(e, n) {
      var o = this.loaderArr.length;
      return Dn({
        index: e,
        count: o,
        first: e === 0,
        last: e === o - 1,
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
      this.content = e || this.content || gi(this.element, '[data-pc-section="content"]');
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
    SpinnerIcon: Ro
  }
}, Ju = ["tabindex"];
function Qu(t, e, n, o, i, a) {
  var l = Ve("SpinnerIcon");
  return t.disabled ? (p(), h(X, {
    key: 1
  }, [ae(t.$slots, "default"), ae(t.$slots, "content", {
    items: t.items,
    rows: t.items,
    columns: a.loadedColumns
  })], 64)) : (p(), h("div", K({
    key: 0,
    ref: a.elementRef,
    class: a.containerClass,
    tabindex: t.tabindex,
    style: t.style,
    onScroll: e[0] || (e[0] = function() {
      return a.onScroll && a.onScroll.apply(a, arguments);
    })
  }, t.ptmi("root")), [ae(t.$slots, "content", {
    styleClass: a.contentClass,
    items: a.loadedItems,
    getItemOptions: a.getOptions,
    loading: i.d_loading,
    getLoaderOptions: a.getLoaderOptions,
    itemSize: t.itemSize,
    rows: a.loadedRows,
    columns: a.loadedColumns,
    contentRef: a.contentRef,
    spacerStyle: i.spacerStyle,
    contentStyle: i.contentStyle,
    vertical: a.isVertical(),
    horizontal: a.isHorizontal(),
    both: a.isBoth()
  }, function() {
    return [c("div", K({
      ref: a.contentRef,
      class: a.contentClass,
      style: i.contentStyle
    }, t.ptm("content")), [(p(!0), h(X, null, ce(a.loadedItems, function(u, s) {
      return ae(t.$slots, "item", {
        key: s,
        item: u,
        options: a.getOptions(s)
      });
    }), 128))], 16)];
  }), t.showSpacer ? (p(), h("div", K({
    key: 0,
    class: "p-virtualscroller-spacer",
    style: i.spacerStyle
  }, t.ptm("spacer")), null, 16)) : _("", !0), !t.loaderDisabled && t.showLoader && i.d_loading ? (p(), h("div", K({
    key: 1,
    class: a.loaderClass
  }, t.ptm("loader")), [t.$slots && t.$slots.loader ? (p(!0), h(X, {
    key: 0
  }, ce(i.loaderArr, function(u, s) {
    return ae(t.$slots, "loader", {
      key: s,
      options: a.getLoaderOptions(s, a.isBoth() && {
        numCols: t.d_numItemsInViewport.cols
      })
    });
  }), 128)) : _("", !0), ae(t.$slots, "loadingicon", {}, function() {
    return [P(l, K({
      spin: "",
      class: "p-virtualscroller-loading-icon"
    }, t.ptm("loadingIcon")), null, 16)];
  })], 16)) : _("", !0)], 16, Ju));
}
la.render = Qu;
var ed = `
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
`, td = {
  root: function(e) {
    var n = e.instance, o = e.props, i = e.state;
    return ["p-select p-component p-inputwrapper", {
      "p-disabled": o.disabled,
      "p-invalid": n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-focus": i.focused,
      "p-inputwrapper-filled": n.$filled,
      "p-inputwrapper-focus": i.focused || i.overlayVisible,
      "p-select-open": i.overlayVisible,
      "p-select-fluid": n.$fluid,
      "p-select-sm p-inputfield-sm": o.size === "small",
      "p-select-lg p-inputfield-lg": o.size === "large"
    }];
  },
  label: function(e) {
    var n, o = e.instance, i = e.props;
    return ["p-select-label", {
      "p-placeholder": !i.editable && o.label === i.placeholder,
      "p-select-label-empty": !i.editable && !o.$slots.value && (o.label === "p-emptylabel" || ((n = o.label) === null || n === void 0 ? void 0 : n.length) === 0)
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
    var n = e.instance, o = e.props, i = e.state, a = e.option, l = e.focusedOption;
    return ["p-select-option", {
      "p-select-option-selected": n.isSelected(a) && o.highlightOnSelect,
      "p-focus": i.focusedOptionIndex === l,
      "p-disabled": n.isOptionDisabled(a)
    }];
  },
  optionLabel: "p-select-option-label",
  optionCheckIcon: "p-select-option-check-icon",
  optionBlankIcon: "p-select-option-blank-icon",
  emptyMessage: "p-select-empty-message"
}, nd = ke.extend({
  name: "select",
  style: ed,
  classes: td
}), od = {
  name: "BaseSelect",
  extends: ra,
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
  style: nd,
  provide: function() {
    return {
      $pcSelect: this,
      $parentInstance: this
    };
  }
};
function so(t) {
  "@babel/helpers - typeof";
  return so = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, so(t);
}
function id(t) {
  return ld(t) || sd(t) || ad(t) || rd();
}
function rd() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ad(t, e) {
  if (t) {
    if (typeof t == "string") return ui(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? ui(t, e) : void 0;
  }
}
function sd(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function ld(t) {
  if (Array.isArray(t)) return ui(t);
}
function ui(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function Ji(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    e && (o = o.filter(function(i) {
      return Object.getOwnPropertyDescriptor(t, i).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function Qi(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Ji(Object(n), !0).forEach(function(o) {
      cn(t, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Ji(Object(n)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return t;
}
function cn(t, e, n) {
  return (e = ud(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function ud(t) {
  var e = dd(t, "string");
  return so(e) == "symbol" ? e : e + "";
}
function dd(t, e) {
  if (so(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (so(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var To = {
  name: "Select",
  extends: od,
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
    this.unbindOutsideClickListener(), this.unbindResizeListener(), this.unbindLabelClickListener(), this.unbindMatchMediaOrientationListener(), this.scrollHandler && (this.scrollHandler.destroy(), this.scrollHandler = null), this.overlay && (In.clear(this.overlay), this.overlay = null);
  },
  methods: {
    getOptionIndex: function(e, n) {
      return this.virtualScrollerDisabled ? e : n && n(e).index;
    },
    getOptionLabel: function(e) {
      return this.optionLabel ? _n(e, this.optionLabel) : e;
    },
    getOptionValue: function(e) {
      return this.optionValue ? _n(e, this.optionValue) : e;
    },
    getOptionRenderKey: function(e, n) {
      return (this.dataKey ? _n(e, this.dataKey) : this.getOptionLabel(e)) + "_" + n;
    },
    getPTItemOptions: function(e, n, o, i) {
      return this.ptm(i, {
        context: {
          option: e,
          index: o,
          selected: this.isSelected(e),
          focused: this.focusedOptionIndex === this.getOptionIndex(o, n),
          disabled: this.isOptionDisabled(e)
        }
      });
    },
    isOptionDisabled: function(e) {
      return this.optionDisabled ? _n(e, this.optionDisabled) : !1;
    },
    isOptionGroup: function(e) {
      return this.optionGroupLabel && e.optionGroup && e.group;
    },
    getOptionGroupLabel: function(e) {
      return _n(e, this.optionGroupLabel);
    },
    getOptionGroupChildren: function(e) {
      return _n(e, this.optionGroupChildren);
    },
    getAriaPosInset: function(e) {
      var n = this;
      return (this.optionGroupLabel ? e - this.visibleOptions.slice(0, e).filter(function(o) {
        return n.isOptionGroup(o);
      }).length : e) + 1;
    },
    show: function(e) {
      this.$emit("before-show"), this.overlayVisible = !0, this.focusedOptionIndex = this.focusedOptionIndex !== -1 ? this.focusedOptionIndex : this.autoOptionFocus ? this.findFirstFocusedOptionIndex() : this.editable ? -1 : this.findSelectedOptionIndex(), e && Ne(this.$refs.focusInput);
    },
    hide: function(e) {
      var n = this, o = function() {
        n.$emit("before-hide"), n.overlayVisible = !1, n.clicked = !1, n.focusedOptionIndex = -1, n.searchValue = "", n.resetFilterOnHide && (n.filterValue = null), e && Ne(n.$refs.focusInput);
      };
      setTimeout(function() {
        o();
      }, 0);
    },
    onFocus: function(e) {
      this.disabled || (this.focused = !0, this.overlayVisible && (this.focusedOptionIndex = this.focusedOptionIndex !== -1 ? this.focusedOptionIndex : this.autoOptionFocus ? this.findFirstFocusedOptionIndex() : this.editable ? -1 : this.findSelectedOptionIndex(), this.scrollInView(this.focusedOptionIndex)), this.$emit("focus", e));
    },
    onBlur: function(e) {
      var n = this;
      setTimeout(function() {
        var o, i;
        n.focused = !1, n.focusedOptionIndex = -1, n.searchValue = "", n.$emit("blur", e), (o = (i = n.formField).onBlur) === null || o === void 0 || o.call(i, e);
      }, 100);
    },
    onKeyDown: function(e) {
      var n = this;
      if (this.disabled) {
        e.preventDefault();
        return;
      }
      if (Na())
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
      var o = e.metaKey || e.ctrlKey;
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
          !o && Ua(e.key) && (!this.overlayVisible && this.show(), !this.editable && this.searchOptions(e, e.key), this.filter && this.$nextTick(function() {
            n.$refs.filterInput && Ne(n.$refs.filterInput.$el);
          }));
          break;
      }
      this.clicked = !1;
    },
    onEditableInput: function(e) {
      var n = e.target.value;
      this.searchValue = "";
      var o = this.searchOptions(e, n);
      !o && (this.focusedOptionIndex = -1), this.updateModel(e, n), !this.overlayVisible && zt(n) && this.show();
    },
    onContainerClick: function(e) {
      this.disabled || this.loading || e.target.tagName === "INPUT" || e.target.getAttribute("data-pc-section") === "clearicon" || e.target.closest('[data-pc-section="clearicon"]') || ((!this.overlay || !this.overlay.contains(e.target)) && (this.overlayVisible ? this.hide(!0) : this.show(!0)), this.clicked = !0);
    },
    onClearClick: function(e) {
      this.updateModel(e, null), this.resetFilterOnClear && (this.filterValue = null);
    },
    onFirstHiddenFocus: function(e) {
      var n = e.relatedTarget === this.$refs.focusInput ? Cn(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      Ne(n);
    },
    onLastHiddenFocus: function(e) {
      var n = e.relatedTarget === this.$refs.focusInput ? Vr(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      Ne(n);
    },
    onOptionSelect: function(e, n) {
      var o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0;
      if (this.overlayVisible) {
        var i = this.getOptionValue(n);
        this.updateModel(e, i), o && this.hide(!0);
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
      Zs.emit("overlay-click", {
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
        var o = this.focusedOptionIndex !== -1 ? this.findPrevOptionIndex(this.focusedOptionIndex) : this.clicked ? this.findLastOptionIndex() : this.findLastFocusedOptionIndex();
        this.changeFocusedOptionIndex(e, o), !this.overlayVisible && this.show(), e.preventDefault();
      }
    },
    onArrowLeftKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n && (this.focusedOptionIndex = -1);
    },
    onHomeKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (n) {
        var o = e.currentTarget;
        e.shiftKey ? o.setSelectionRange(0, e.target.selectionStart) : (o.setSelectionRange(0, 0), this.focusedOptionIndex = -1);
      } else
        this.changeFocusedOptionIndex(e, this.findFirstOptionIndex()), !this.overlayVisible && this.show();
      e.preventDefault();
    },
    onEndKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (n) {
        var o = e.currentTarget;
        if (e.shiftKey)
          o.setSelectionRange(e.target.selectionStart, o.value.length);
        else {
          var i = o.value.length;
          o.setSelectionRange(i, i), this.focusedOptionIndex = -1;
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
      n || (this.overlayVisible && this.hasFocusableElements() ? (Ne(this.$refs.firstHiddenFocusableElementOnOverlay), e.preventDefault()) : (this.focusedOptionIndex !== -1 && this.onOptionSelect(e, this.visibleOptions[this.focusedOptionIndex]), this.overlayVisible && this.hide(this.filter)));
    },
    onBackspaceKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n && !this.overlayVisible && this.show();
    },
    onOverlayEnter: function(e) {
      var n = this;
      In.set("overlay", e, this.$primevue.config.zIndex.overlay), Dr(e, {
        position: "absolute",
        top: "0"
      }), this.alignOverlay(), this.scrollInView(), this.$attrSelector && e.setAttribute(this.$attrSelector, ""), setTimeout(function() {
        n.autoFilterFocus && n.filter && Ne(n.$refs.filterInput.$el), n.autoUpdateModel();
      }, 1);
    },
    onOverlayAfterEnter: function() {
      this.bindOutsideClickListener(), this.bindScrollListener(), this.bindResizeListener(), this.$emit("show");
    },
    onOverlayLeave: function(e) {
      var n = this;
      e.style.pointerEvents = "none", this.unbindOutsideClickListener(), this.unbindScrollListener(), this.unbindResizeListener(), this.autoFilterFocus && this.filter && !this.editable && this.$nextTick(function() {
        n.$refs.filterInput && Ne(n.$refs.filterInput.$el);
      }), this.$emit("hide"), this.overlay = null;
    },
    onOverlayAfterLeave: function(e) {
      In.clear(e);
    },
    alignOverlay: function() {
      this.appendTo === "self" ? Fa(this.overlay, this.$el) : this.overlay && (this.overlay.style.minWidth = yi(this.$el) + "px", Ra(this.overlay, this.$el));
    },
    bindOutsideClickListener: function() {
      var e = this;
      this.outsideClickListener || (this.outsideClickListener = function(n) {
        var o = n.composedPath();
        e.overlayVisible && e.overlay && !o.includes(e.$el) && !o.includes(e.overlay) && e.hide();
      }, document.addEventListener("click", this.outsideClickListener, !0));
    },
    unbindOutsideClickListener: function() {
      this.outsideClickListener && (document.removeEventListener("click", this.outsideClickListener, !0), this.outsideClickListener = null);
    },
    bindScrollListener: function() {
      var e = this;
      this.scrollHandler || (this.scrollHandler = new Gs(this.$refs.container, function() {
        e.overlayVisible && e.hide();
      })), this.scrollHandler.bindScrollListener();
    },
    unbindScrollListener: function() {
      this.scrollHandler && this.scrollHandler.unbindScrollListener();
    },
    bindResizeListener: function() {
      var e = this;
      this.resizeListener || (this.resizeListener = function() {
        e.overlayVisible && !Ba() && e.hide();
      }, window.addEventListener("resize", this.resizeListener));
    },
    unbindResizeListener: function() {
      this.resizeListener && (window.removeEventListener("resize", this.resizeListener), this.resizeListener = null);
    },
    bindLabelClickListener: function() {
      var e = this;
      if (!this.editable && !this.labelClickListener) {
        var n = document.querySelector('label[for="'.concat(this.labelId, '"]'));
        n && Lo(n) && (this.labelClickListener = function() {
          Ne(e.$refs.focusInput);
        }, n.addEventListener("click", this.labelClickListener));
      }
    },
    unbindLabelClickListener: function() {
      if (this.labelClickListener) {
        var e = document.querySelector('label[for="'.concat(this.labelId, '"]'));
        e && Lo(e) && e.removeEventListener("click", this.labelClickListener);
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
      return Da(this.overlay, ':not([data-p-hidden-focusable="true"])').length > 0;
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
      return zt(e) && !(this.isOptionDisabled(e) || this.isOptionGroup(e));
    },
    isValidSelectedOption: function(e) {
      return this.isValidOption(e) && this.isSelected(e);
    },
    isSelected: function(e) {
      return Ma(this.d_value, this.getOptionValue(e), this.equalityKey);
    },
    findFirstOptionIndex: function() {
      var e = this;
      return this.visibleOptions.findIndex(function(n) {
        return e.isValidOption(n);
      });
    },
    findLastOptionIndex: function() {
      var e = this;
      return Ti(this.visibleOptions, function(n) {
        return e.isValidOption(n);
      });
    },
    findNextOptionIndex: function(e) {
      var n = this, o = e < this.visibleOptions.length - 1 ? this.visibleOptions.slice(e + 1).findIndex(function(i) {
        return n.isValidOption(i);
      }) : -1;
      return o > -1 ? o + e + 1 : e;
    },
    findPrevOptionIndex: function(e) {
      var n = this, o = e > 0 ? Ti(this.visibleOptions.slice(0, e), function(i) {
        return n.isValidOption(i);
      }) : -1;
      return o > -1 ? o : e;
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
      var o = this;
      this.searchValue = (this.searchValue || "") + n;
      var i = -1, a = !1;
      return zt(this.searchValue) && (i = this.visibleOptions.findIndex(function(l) {
        return o.isOptionExactMatched(l);
      }), i === -1 && (i = this.visibleOptions.findIndex(function(l) {
        return o.isOptionStartsWith(l);
      })), i !== -1 && (a = !0), i === -1 && this.focusedOptionIndex === -1 && (i = this.findFirstFocusedOptionIndex()), i !== -1 && this.changeFocusedOptionIndex(e, i)), this.searchTimeout && clearTimeout(this.searchTimeout), this.searchTimeout = setTimeout(function() {
        o.searchValue = "", o.searchTimeout = null;
      }, 500), a;
    },
    changeFocusedOptionIndex: function(e, n) {
      this.focusedOptionIndex !== n && (this.focusedOptionIndex = n, this.scrollInView(), this.selectOnFocus && this.onOptionSelect(e, this.visibleOptions[n], !1));
    },
    scrollInView: function() {
      var e = this, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : -1;
      this.$nextTick(function() {
        var o = n !== -1 ? "".concat(e.$id, "_").concat(n) : e.focusedOptionId, i = gi(e.list, 'li[id="'.concat(o, '"]'));
        i ? i.scrollIntoView && i.scrollIntoView({
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
      return (e || []).reduce(function(o, i, a) {
        o.push({
          optionGroup: i,
          group: !0,
          index: a
        });
        var l = n.getOptionGroupChildren(i);
        return l && l.forEach(function(u) {
          return o.push(u);
        }), o;
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
        var o = za.filter(n, this.searchFields, this.filterValue, this.filterMatchMode, this.filterLocale);
        if (this.optionGroupLabel) {
          var i = this.options || [], a = [];
          return i.forEach(function(l) {
            var u = e.getOptionGroupChildren(l), s = u.filter(function(d) {
              return o.includes(d);
            });
            s.length > 0 && a.push(Qi(Qi({}, l), {}, cn({}, typeof e.optionGroupChildren == "string" ? e.optionGroupChildren : "items", id(s))));
          }), this.flatOptions(a);
        }
        return o;
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
      return zt(this.visibleOptions) ? this.filterMessageText.replaceAll("{0}", this.visibleOptions.length) : this.emptyFilterMessageText;
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
      return _t(cn({
        invalid: this.$invalid,
        disabled: this.disabled,
        focus: this.focused,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    },
    labelDataP: function() {
      return _t(cn(cn({
        placeholder: !this.editable && this.label === this.placeholder,
        clearable: this.showClear,
        disabled: this.disabled,
        editable: this.editable
      }, this.size, this.size), "empty", !this.editable && !this.$slots.value && (this.label === "p-emptylabel" || this.label.length === 0)));
    },
    dropdownIconDataP: function() {
      return _t(cn({}, this.size, this.size));
    },
    overlayDataP: function() {
      return _t(cn({}, "portal-" + this.appendTo, "portal-" + this.appendTo));
    }
  },
  directives: {
    ripple: wi
  },
  components: {
    InputText: aa,
    VirtualScroller: la,
    Portal: Mr,
    InputIcon: ia,
    IconField: oa,
    TimesIcon: _i,
    ChevronDownIcon: ta,
    SpinnerIcon: Ro,
    SearchIcon: na,
    CheckIcon: ea,
    BlankIcon: Qr
  }
}, cd = ["id", "data-p"], pd = ["name", "id", "value", "placeholder", "tabindex", "disabled", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-invalid", "data-p"], md = ["name", "id", "tabindex", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-invalid", "aria-disabled", "data-p"], fd = ["data-p"], hd = ["id"], bd = ["id"], vd = ["id", "aria-label", "aria-selected", "aria-disabled", "aria-setsize", "aria-posinset", "onMousedown", "onMousemove", "data-p-selected", "data-p-focused", "data-p-disabled"];
function gd(t, e, n, o, i, a) {
  var l = Ve("SpinnerIcon"), u = Ve("InputText"), s = Ve("SearchIcon"), d = Ve("InputIcon"), m = Ve("IconField"), f = Ve("CheckIcon"), v = Ve("BlankIcon"), g = Ve("VirtualScroller"), w = Ve("Portal"), x = Bo("ripple");
  return p(), h("div", K({
    ref: "container",
    id: t.$id,
    class: t.cx("root"),
    onClick: e[12] || (e[12] = function() {
      return a.onContainerClick && a.onContainerClick.apply(a, arguments);
    }),
    "data-p": a.containerDataP
  }, t.ptmi("root")), [t.editable ? (p(), h("input", K({
    key: 0,
    ref: "focusInput",
    name: t.name,
    id: t.labelId || t.inputId,
    type: "text",
    class: [t.cx("label"), t.inputClass, t.labelClass],
    style: [t.inputStyle, t.labelStyle],
    value: a.editableInputValue,
    placeholder: t.placeholder,
    tabindex: t.disabled ? -1 : t.tabindex,
    disabled: t.disabled,
    autocomplete: "off",
    role: "combobox",
    "aria-label": t.ariaLabel,
    "aria-labelledby": t.ariaLabelledby,
    "aria-haspopup": "listbox",
    "aria-expanded": i.overlayVisible,
    "aria-controls": i.overlayVisible ? t.$id + "_list" : void 0,
    "aria-activedescendant": i.focused ? a.focusedOptionId : void 0,
    "aria-invalid": t.invalid || void 0,
    onFocus: e[0] || (e[0] = function() {
      return a.onFocus && a.onFocus.apply(a, arguments);
    }),
    onBlur: e[1] || (e[1] = function() {
      return a.onBlur && a.onBlur.apply(a, arguments);
    }),
    onKeydown: e[2] || (e[2] = function() {
      return a.onKeyDown && a.onKeyDown.apply(a, arguments);
    }),
    onInput: e[3] || (e[3] = function() {
      return a.onEditableInput && a.onEditableInput.apply(a, arguments);
    }),
    "data-p": a.labelDataP
  }, t.ptm("label")), null, 16, pd)) : (p(), h("span", K({
    key: 1,
    ref: "focusInput",
    name: t.name,
    id: t.labelId || t.inputId,
    class: [t.cx("label"), t.inputClass, t.labelClass],
    style: [t.inputStyle, t.labelStyle],
    tabindex: t.disabled ? -1 : t.tabindex,
    role: "combobox",
    "aria-label": t.ariaLabel || (a.label === "p-emptylabel" ? void 0 : a.label),
    "aria-labelledby": t.ariaLabelledby,
    "aria-haspopup": "listbox",
    "aria-expanded": i.overlayVisible,
    "aria-controls": t.$id + "_list",
    "aria-activedescendant": i.focused ? a.focusedOptionId : void 0,
    "aria-invalid": t.invalid || void 0,
    "aria-disabled": t.disabled,
    onFocus: e[4] || (e[4] = function() {
      return a.onFocus && a.onFocus.apply(a, arguments);
    }),
    onBlur: e[5] || (e[5] = function() {
      return a.onBlur && a.onBlur.apply(a, arguments);
    }),
    onKeydown: e[6] || (e[6] = function() {
      return a.onKeyDown && a.onKeyDown.apply(a, arguments);
    }),
    "data-p": a.labelDataP
  }, t.ptm("label")), [ae(t.$slots, "value", {
    value: t.d_value,
    placeholder: t.placeholder
  }, function() {
    var S;
    return [F(k(a.label === "p-emptylabel" ? " " : (S = a.label) !== null && S !== void 0 ? S : "empty"), 1)];
  })], 16, md)), a.isClearIconVisible ? ae(t.$slots, "clearicon", {
    key: 2,
    class: oe(t.cx("clearIcon")),
    clearCallback: a.onClearClick
  }, function() {
    return [(p(), xe(Ln(t.clearIcon ? "i" : "TimesIcon"), K({
      ref: "clearIcon",
      class: [t.cx("clearIcon"), t.clearIcon],
      onClick: a.onClearClick
    }, t.ptm("clearIcon"), {
      "data-pc-section": "clearicon"
    }), null, 16, ["class", "onClick"]))];
  }) : _("", !0), c("div", K({
    class: t.cx("dropdown")
  }, t.ptm("dropdown")), [t.loading ? ae(t.$slots, "loadingicon", {
    key: 0,
    class: oe(t.cx("loadingIcon"))
  }, function() {
    return [t.loadingIcon ? (p(), h("span", K({
      key: 0,
      class: [t.cx("loadingIcon"), "pi-spin", t.loadingIcon],
      "aria-hidden": "true"
    }, t.ptm("loadingIcon")), null, 16)) : (p(), xe(l, K({
      key: 1,
      class: t.cx("loadingIcon"),
      spin: "",
      "aria-hidden": "true"
    }, t.ptm("loadingIcon")), null, 16, ["class"]))];
  }) : ae(t.$slots, "dropdownicon", {
    key: 1,
    class: oe(t.cx("dropdownIcon"))
  }, function() {
    return [(p(), xe(Ln(t.dropdownIcon ? "span" : "ChevronDownIcon"), K({
      class: [t.cx("dropdownIcon"), t.dropdownIcon],
      "aria-hidden": "true",
      "data-p": a.dropdownIconDataP
    }, t.ptm("dropdownIcon")), null, 16, ["class", "data-p"]))];
  })], 16), P(w, {
    appendTo: t.appendTo
  }, {
    default: Ie(function() {
      return [P(Rr, K({
        name: "p-anchored-overlay",
        onEnter: a.onOverlayEnter,
        onAfterEnter: a.onOverlayAfterEnter,
        onLeave: a.onOverlayLeave,
        onAfterLeave: a.onOverlayAfterLeave
      }, t.ptm("transition")), {
        default: Ie(function() {
          return [i.overlayVisible ? (p(), h("div", K({
            key: 0,
            ref: a.overlayRef,
            class: [t.cx("overlay"), t.panelClass, t.overlayClass],
            style: [t.panelStyle, t.overlayStyle],
            onClick: e[10] || (e[10] = function() {
              return a.onOverlayClick && a.onOverlayClick.apply(a, arguments);
            }),
            onKeydown: e[11] || (e[11] = function() {
              return a.onOverlayKeyDown && a.onOverlayKeyDown.apply(a, arguments);
            }),
            "data-p": a.overlayDataP
          }, t.ptm("overlay")), [c("span", K({
            ref: "firstHiddenFocusableElementOnOverlay",
            role: "presentation",
            "aria-hidden": "true",
            class: "p-hidden-accessible p-hidden-focusable",
            tabindex: 0,
            onFocus: e[7] || (e[7] = function() {
              return a.onFirstHiddenFocus && a.onFirstHiddenFocus.apply(a, arguments);
            })
          }, t.ptm("hiddenFirstFocusableEl"), {
            "data-p-hidden-accessible": !0,
            "data-p-hidden-focusable": !0
          }), null, 16), ae(t.$slots, "header", {
            value: t.d_value,
            options: a.visibleOptions
          }), t.filter ? (p(), h("div", K({
            key: 0,
            class: t.cx("header")
          }, t.ptm("header")), [P(m, {
            unstyled: t.unstyled,
            pt: t.ptm("pcFilterContainer")
          }, {
            default: Ie(function() {
              return [P(u, {
                ref: "filterInput",
                type: "text",
                value: i.filterValue,
                onVnodeMounted: a.onFilterUpdated,
                onVnodeUpdated: a.onFilterUpdated,
                class: oe(t.cx("pcFilter")),
                placeholder: t.filterPlaceholder,
                variant: t.variant,
                unstyled: t.unstyled,
                role: "searchbox",
                autocomplete: "off",
                "aria-owns": t.$id + "_list",
                "aria-activedescendant": a.focusedOptionId,
                onKeydown: a.onFilterKeyDown,
                onBlur: a.onFilterBlur,
                onInput: a.onFilterChange,
                pt: t.ptm("pcFilter"),
                formControl: {
                  novalidate: !0
                }
              }, null, 8, ["value", "onVnodeMounted", "onVnodeUpdated", "class", "placeholder", "variant", "unstyled", "aria-owns", "aria-activedescendant", "onKeydown", "onBlur", "onInput", "pt"]), P(d, {
                unstyled: t.unstyled,
                pt: t.ptm("pcFilterIconContainer")
              }, {
                default: Ie(function() {
                  return [ae(t.$slots, "filtericon", {}, function() {
                    return [t.filterIcon ? (p(), h("span", K({
                      key: 0,
                      class: t.filterIcon
                    }, t.ptm("filterIcon")), null, 16)) : (p(), xe(s, as(K({
                      key: 1
                    }, t.ptm("filterIcon"))), null, 16))];
                  })];
                }),
                _: 3
              }, 8, ["unstyled", "pt"])];
            }),
            _: 3
          }, 8, ["unstyled", "pt"]), c("span", K({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, t.ptm("hiddenFilterResult"), {
            "data-p-hidden-accessible": !0
          }), k(a.filterResultMessageText), 17)], 16)) : _("", !0), c("div", K({
            class: t.cx("listContainer"),
            style: {
              "max-height": a.virtualScrollerDisabled ? t.scrollHeight : ""
            }
          }, t.ptm("listContainer")), [P(g, K({
            ref: a.virtualScrollerRef
          }, t.virtualScrollerOptions, {
            items: a.visibleOptions,
            style: {
              height: t.scrollHeight
            },
            tabindex: -1,
            disabled: a.virtualScrollerDisabled,
            pt: t.ptm("virtualScroller")
          }), ss({
            content: Ie(function(S) {
              var T = S.styleClass, j = S.contentRef, I = S.items, y = S.getItemOptions, b = S.contentStyle, W = S.itemSize;
              return [c("ul", K({
                ref: function(L) {
                  return a.listRef(L, j);
                },
                id: t.$id + "_list",
                class: [t.cx("list"), T],
                style: b,
                role: "listbox"
              }, t.ptm("list")), [(p(!0), h(X, null, ce(I, function($, L) {
                return p(), h(X, {
                  key: a.getOptionRenderKey($, a.getOptionIndex(L, y))
                }, [a.isOptionGroup($) ? (p(), h("li", K({
                  key: 0,
                  id: t.$id + "_" + a.getOptionIndex(L, y),
                  style: {
                    height: W ? W + "px" : void 0
                  },
                  class: t.cx("optionGroup"),
                  role: "option"
                }, {
                  ref_for: !0
                }, t.ptm("optionGroup")), [ae(t.$slots, "optiongroup", {
                  option: $.optionGroup,
                  index: a.getOptionIndex(L, y)
                }, function() {
                  return [c("span", K({
                    class: t.cx("optionGroupLabel")
                  }, {
                    ref_for: !0
                  }, t.ptm("optionGroupLabel")), k(a.getOptionGroupLabel($.optionGroup)), 17)];
                })], 16, bd)) : Xe((p(), h("li", K({
                  key: 1,
                  id: t.$id + "_" + a.getOptionIndex(L, y),
                  class: t.cx("option", {
                    option: $,
                    focusedOption: a.getOptionIndex(L, y)
                  }),
                  style: {
                    height: W ? W + "px" : void 0
                  },
                  role: "option",
                  "aria-label": a.getOptionLabel($),
                  "aria-selected": a.isSelected($),
                  "aria-disabled": a.isOptionDisabled($),
                  "aria-setsize": a.ariaSetSize,
                  "aria-posinset": a.getAriaPosInset(a.getOptionIndex(L, y)),
                  onMousedown: function(ie) {
                    return a.onOptionSelect(ie, $);
                  },
                  onMousemove: function(ie) {
                    return a.onOptionMouseMove(ie, a.getOptionIndex(L, y));
                  },
                  onClick: e[8] || (e[8] = Io(function() {
                  }, ["stop"])),
                  "data-p-selected": !t.checkmark && a.isSelected($),
                  "data-p-focused": i.focusedOptionIndex === a.getOptionIndex(L, y),
                  "data-p-disabled": a.isOptionDisabled($)
                }, {
                  ref_for: !0
                }, a.getPTItemOptions($, y, L, "option")), [t.checkmark ? (p(), h(X, {
                  key: 0
                }, [a.isSelected($) ? (p(), xe(f, K({
                  key: 0,
                  class: t.cx("optionCheckIcon")
                }, {
                  ref_for: !0
                }, t.ptm("optionCheckIcon")), null, 16, ["class"])) : (p(), xe(v, K({
                  key: 1,
                  class: t.cx("optionBlankIcon")
                }, {
                  ref_for: !0
                }, t.ptm("optionBlankIcon")), null, 16, ["class"]))], 64)) : _("", !0), ae(t.$slots, "option", {
                  option: $,
                  selected: a.isSelected($),
                  index: a.getOptionIndex(L, y)
                }, function() {
                  return [c("span", K({
                    class: t.cx("optionLabel")
                  }, {
                    ref_for: !0
                  }, t.ptm("optionLabel")), k(a.getOptionLabel($)), 17)];
                })], 16, vd)), [[x]])], 64);
              }), 128)), i.filterValue && (!I || I && I.length === 0) ? (p(), h("li", K({
                key: 0,
                class: t.cx("emptyMessage"),
                role: "option"
              }, t.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [ae(t.$slots, "emptyfilter", {}, function() {
                return [F(k(a.emptyFilterMessageText), 1)];
              })], 16)) : !t.options || t.options && t.options.length === 0 ? (p(), h("li", K({
                key: 1,
                class: t.cx("emptyMessage"),
                role: "option"
              }, t.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [ae(t.$slots, "empty", {}, function() {
                return [F(k(a.emptyMessageText), 1)];
              })], 16)) : _("", !0)], 16, hd)];
            }),
            _: 2
          }, [t.$slots.loader ? {
            name: "loader",
            fn: Ie(function(S) {
              var T = S.options;
              return [ae(t.$slots, "loader", {
                options: T
              })];
            }),
            key: "0"
          } : void 0]), 1040, ["items", "style", "disabled", "pt"])], 16), ae(t.$slots, "footer", {
            value: t.d_value,
            options: a.visibleOptions
          }), !t.options || t.options && t.options.length === 0 ? (p(), h("span", K({
            key: 1,
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, t.ptm("hiddenEmptyMessage"), {
            "data-p-hidden-accessible": !0
          }), k(a.emptyMessageText), 17)) : _("", !0), c("span", K({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, t.ptm("hiddenSelectedMessage"), {
            "data-p-hidden-accessible": !0
          }), k(a.selectedMessageText), 17), c("span", K({
            ref: "lastHiddenFocusableElementOnOverlay",
            role: "presentation",
            "aria-hidden": "true",
            class: "p-hidden-accessible p-hidden-focusable",
            tabindex: 0,
            onFocus: e[9] || (e[9] = function() {
              return a.onLastHiddenFocus && a.onLastHiddenFocus.apply(a, arguments);
            })
          }, t.ptm("hiddenLastFocusableEl"), {
            "data-p-hidden-accessible": !0,
            "data-p-hidden-focusable": !0
          }), null, 16)], 16, fd)) : _("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onLeave", "onAfterLeave"])];
    }),
    _: 3
  }, 8, ["appendTo"])], 16, cd);
}
To.render = gd;
const yd = 2e3;
function er(t) {
  const e = t.margin ?? 8, n = t.gap ?? 4, o = Math.max(0, t.viewportWidth), i = Math.max(0, t.viewportHeight), a = Math.max(0, o - e * 2), l = Math.min(Math.max(0, t.requestedWidth), a), u = t.align === "right" ? t.anchor.right - l : t.anchor.left, s = Math.max(e, Math.min(u, o - e - l)), d = Math.max(0, i - t.anchor.bottom - n - e), m = Math.max(0, t.anchor.top - n - e), f = d < t.requestedMaxHeight && m > d ? "above" : "below", v = f === "above" ? m : d, g = Math.round(Math.min(Math.max(0, t.requestedMaxHeight), v)), w = Math.min(Math.max(0, t.panelHeight ?? g), g), x = f === "above" ? t.anchor.top - n - w : t.anchor.bottom + n, S = t.containingBlockOrigin ?? { left: 0, top: 0 };
  return {
    left: Math.round(s - S.left),
    width: Math.round(l),
    maxHeight: g,
    side: f,
    top: Math.round(x - S.top)
  };
}
const ua = /* @__PURE__ */ En({
  __name: "AnchoredPanel",
  props: {
    open: { type: Boolean },
    anchor: {},
    align: { default: "left" },
    width: { default: "anchor" },
    minWidth: { default: 0 },
    maxHeight: { default: 340 },
    gap: { default: 4 },
    zIndex: { default: yd }
  },
  emits: ["update:open"],
  setup(t, { emit: e }) {
    const n = t, o = e, i = U(null), a = U({ position: "fixed", visibility: "hidden" });
    function l() {
      const x = n.anchor, S = i.value;
      if (!x || !S) return;
      const T = x.getBoundingClientRect(), j = n.width === "anchor" ? Math.max(n.minWidth, T.width) : Math.max(n.minWidth, n.width), I = {
        anchor: T,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        requestedWidth: j,
        requestedMaxHeight: n.maxHeight,
        align: n.align,
        gap: n.gap
      }, y = er(I);
      Object.assign(S.style, {
        position: "fixed",
        left: "0px",
        top: "0px",
        right: "auto",
        bottom: "auto",
        width: `${y.width}px`,
        maxHeight: `${y.maxHeight}px`,
        visibility: "hidden"
      });
      const b = S.getBoundingClientRect(), W = er({
        ...I,
        containingBlockOrigin: { left: b.left, top: b.top },
        panelHeight: b.height
      }), $ = {
        position: "fixed",
        left: `${W.left}px`,
        top: `${W.top}px`,
        width: `${W.width}px`,
        maxHeight: `${W.maxHeight}px`,
        "--anchored-panel-available-height": `${W.maxHeight}px`,
        margin: "0",
        zIndex: String(n.zIndex),
        visibility: "visible"
      };
      a.value = $;
    }
    let u = null, s = !1;
    function d() {
      s || !n.open || (s = !0, requestAnimationFrame(() => {
        s = !1, n.open && l();
      }));
    }
    function m() {
      typeof ResizeObserver > "u" || (u = new ResizeObserver(d), i.value && u.observe(i.value), n.anchor && u.observe(n.anchor));
    }
    function f() {
      u?.disconnect(), u = null, s = !1;
    }
    lt(() => n.open, async (x) => {
      f(), x && (a.value = { position: "fixed", visibility: "hidden" }, await An(), l(), m());
    }, { immediate: !0 });
    function v(x) {
      if (!n.open) return;
      const S = x.composedPath();
      i.value && S.includes(i.value) || n.anchor && S.includes(n.anchor) || o("update:open", !1);
    }
    function g(x) {
      n.open && x.key === "Escape" && o("update:open", !1);
    }
    function w() {
      n.open && l();
    }
    return document.addEventListener("click", v), document.addEventListener("keydown", g), window.addEventListener("resize", w), window.addEventListener("scroll", w, !0), Nr(() => {
      f(), document.removeEventListener("click", v), document.removeEventListener("keydown", g), window.removeEventListener("resize", w), window.removeEventListener("scroll", w, !0);
    }), (x, S) => t.open ? (p(), h("div", {
      key: 0,
      ref_key: "panel",
      ref: i,
      class: "anchored-panel",
      style: hn(a.value)
    }, [
      ae(x.$slots, "default")
    ], 4)) : _("", !0);
  }
});
function kd(t) {
  if (!t) return null;
  let e;
  if (typeof t == "number")
    e = t;
  else {
    const n = t.trim();
    if (/^\d+$/.test(n))
      e = Number(n);
    else {
      const o = Date.parse(n);
      return Number.isNaN(o) ? null : o;
    }
  }
  return Number.isFinite(e) ? e < 1e12 ? e * 1e3 : e : null;
}
function Vo(t, e) {
  const n = kd(t);
  if (n === null) return "";
  const o = e?.now ?? Date.now(), i = e?.suffix ?? !0, a = e?.maxUnit ?? "day", l = e?.future ?? !1, u = 6e4, s = 60 * u, d = 24 * s, m = 30 * d, f = 365 * d, v = o - n;
  if (l && v < 0) {
    const x = -v;
    return x < u ? "in <1m" : x < s ? `in ${Math.floor(x / u)}m` : x < d ? `in ${Math.floor(x / s)}h` : `in ${Math.floor(x / d)}d`;
  }
  const g = Math.max(0, v);
  if (g < u) return "just now";
  const w = i ? " ago" : "";
  return g < s ? `${Math.floor(g / u)}m${w}` : g < d ? `${Math.floor(g / s)}h${w}` : a === "year" ? g < m ? `${Math.floor(g / d)}d${w}` : g < f ? `${Math.floor(g / m)}mo${w}` : `${Math.floor(g / f)}y${w}` : `${Math.floor(g / d)}d${w}`;
}
const di = {
  tool: { label: "Tools", icon: "tabler:tool" },
  "agent.trait": { label: "Agent capabilities", icon: "tabler:robot" },
  "contract.binding": { label: "Contract bindings", icon: "tabler:plug-connected" },
  "contract.definition": { label: "Contracts", icon: "tabler:file-description" },
  "view.page": { label: "Pages", icon: "tabler:browser" },
  "view.component": { label: "Components", icon: "tabler:components" }
};
function $d(t) {
  const e = t.meta?.type || "";
  return e && di[e] ? e : t.kind;
}
function Sd(t) {
  return String(t.id).split(":").pop() || t.id;
}
function wd(t) {
  const e = t.meta || {};
  return String(e.comment || e.title || "");
}
function _d(t, e) {
  return String(t.meta?.icon || e);
}
function Ct(t, e) {
  const n = e instanceof Error ? e.message : String(e);
  console.error(`[${t}]`, n, e);
}
function ci() {
  window.dispatchEvent(new CustomEvent("kickside:modules-changed")), window.dispatchEvent(new CustomEvent("kickside:nav-changed"));
}
function Cd(t) {
  const e = /* @__PURE__ */ new Map();
  for (const n of t.dependencies || []) {
    const o = String(n.component || n.name || n.id || "");
    o && e.set(o, {
      ...n,
      dependencyId: n.id,
      component: o,
      is_root: n.is_root ?? !0,
      used_by: n.used_by || [],
      used_by_count: n.used_by_count || 0,
      source: n.source || "hub"
    });
  }
  for (const n of t.modules || []) {
    const o = String(n.name || "");
    if (!o) continue;
    const i = e.get(o);
    if (i)
      e.set(o, {
        ...i,
        version: i.version || n.version || "",
        is_root: i.is_root ?? n.is_root ?? !n.transitive,
        used_by: i.used_by || n.used_by || [],
        used_by_count: i.used_by_count ?? n.used_by_count ?? 0,
        source: i.source || n.source || "hub"
      });
    else {
      const a = n.used_by || [], l = n.used_by_count || a.length || 0;
      if (n.is_root !== !0 && n.transitive === !0 && l === 0) continue;
      const u = o.split("/");
      e.set(o, {
        id: o,
        namespace: u.length > 1 ? u[0] : "",
        name: u[u.length - 1] || o,
        component: o,
        version: n.version || "",
        is_root: n.is_root ?? !n.transitive,
        used_by: a,
        used_by_count: l,
        source: n.source || "local"
      });
    }
  }
  return Array.from(e.values()).filter((n) => n.installed !== !1);
}
function tr(t) {
  const e = t.migrations || [];
  if (e.length === 0) return "";
  const n = e.filter((a) => a.status === "applied").length, o = e.filter((a) => a.status === "pending").length, i = [];
  return n > 0 && i.push(`${n} applied`), o > 0 && i.push(`${o} pending`), i.join(", ") || `${e.length} migrations`;
}
function Od({ hub: t, installed: e, catalog: n, installedDepFor: o, installedCanUpdate: i, installedUpdateDisabledReason: a, installedCanUninstall: l, installedIsPrivate: u }) {
  const s = U(null), d = U(null), m = U(""), f = U([]), v = U(!1), g = U("readme"), w = U([]), x = G(() => f.value.filter((D) => D.kind === "env.variable")), S = G(() => f.value.filter((D) => D.kind === "ns.requirement")), T = G(() => {
    const D = {};
    for (const H of f.value) {
      if (H.kind === "env.variable" || H.kind === "ns.requirement") continue;
      const J = $d(H);
      (D[J] ||= []).push(H);
    }
    return Object.entries(D).map(([H, J]) => ({
      key: H,
      label: di[H]?.label || H,
      icon: di[H]?.icon || "tabler:point",
      items: J
    })).sort((H, J) => J.items.length - H.items.length);
  }), j = G(() => w.value.find((D) => D.version === s.value?.version) || w.value[0]), I = G(() => s.value ? o(s.value.component) : void 0), y = G(() => !!(I.value && i(I.value))), b = G(() => I.value && !i(I.value) ? a(I.value) : ""), W = G(() => !!(I.value && l(I.value))), $ = G(() => qn(d.value) || !!(I.value && u(I.value)));
  async function L(D) {
    try {
      const H = e.value.find((te) => te.component === D);
      return H?.entries ? H.entries : ((await t.listDependencies({ component: D, includeMigrations: !1 })).dependencies || []).find((te) => te.component === D)?.entries || [];
    } catch (H) {
      return Ct("modules:entries", H), [];
    }
  }
  async function z(D, H) {
    if (H && H.full_name) return H;
    const J = n.value.find((ee) => Eo(ee, D));
    if (J) return J;
    try {
      const ee = D.split("/").pop() || D, pe = ((await t.browseModules({ query: ee, pageSize: 50 })).items || []).find((re) => Eo(re, D));
      if (pe) return pe;
    } catch {
    }
    return { full_name: D, component: D, latest_version: "", type: "library" };
  }
  async function ie(D) {
    const H = "component" in D && typeof D.component == "string" && !("full_name" in D) ? D.component : Ao(D), J = o(H), ee = "full_name" in D ? D : void 0;
    s.value = {
      component: H,
      label: ee ? Pn(ee) : H,
      description: ee?.description || "",
      version: J ? Mt(J) : String(ee?.latest_version || ""),
      installed: !!J,
      installedId: J?.id
    }, d.value = ee || null, m.value = "", f.value = [], w.value = [], g.value = "readme", v.value = !0;
    try {
      const [te, pe, re, ge] = await Promise.all([
        z(H, ee),
        t.getReadme(H).then((_e) => _e.content || "").catch(() => ""),
        J ? L(H) : Promise.resolve([]),
        t.listVersions(H).then((_e) => _e.items || []).catch(() => [])
      ]);
      d.value = te, m.value = pe, f.value = re, w.value = ge, s.value && (s.value = {
        ...s.value,
        label: Pn(te),
        description: te.description || s.value.description,
        version: J ? Mt(J) : String(te.latest_version || s.value.version)
      }), pe || (g.value = "overview");
    } finally {
      v.value = !1;
    }
  }
  function C() {
    s.value = null;
  }
  async function V() {
    if (!s.value) return;
    const D = s.value.component, H = o(D);
    s.value = {
      ...s.value,
      installed: !!H,
      installedId: H?.id,
      version: H ? Mt(H) : s.value.version
    }, f.value = H ? await L(D) : [];
  }
  return {
    selected: s,
    selectedModule: d,
    detailReadme: m,
    detailEntries: f,
    detailLoading: v,
    detailTab: g,
    detailVersions: w,
    envVars: x,
    requirements: S,
    detailGroups: T,
    versionMeta: j,
    selectedInstalledDep: I,
    selectedCanUpdate: y,
    selectedUpdateDisabledReason: b,
    selectedCanUninstall: W,
    selectedIsPrivate: $,
    loadEntriesFor: L,
    findModule: z,
    openDetail: ie,
    closeDetail: C,
    refreshSelectedDetail: V
  };
}
const xd = [
  { until: 1e3, label: "Planning uninstall" },
  { until: 4e3, label: "Stopping services" },
  { until: 6e3, label: "Removing entries" },
  { until: 8e3, label: "Updating lock" },
  { until: 1 / 0, label: "Finalizing" }
];
function Id(t, e) {
  const n = U(0);
  let o = 0, i = null;
  function a() {
    i && (clearInterval(i), i = null);
  }
  lt(t, (s) => {
    a(), s ? (o = Date.now(), n.value = 0, i = setInterval(() => {
      n.value = Date.now() - o;
    }, 200)) : n.value = 0;
  }), $i(a);
  const l = G(() => e.find((s) => n.value < s.until)?.label || e[e.length - 1].label), u = G(() => Math.floor(n.value / 1e3));
  return { phase: l, elapsedSec: u };
}
function Pd({ hub: t, selected: e, selectedInstalledDep: n, installedIsRoot: o, installedUninstallDisabledReason: i, installedCanUninstall: a, refreshAll: l, refreshSelectedDetail: u, showToast: s, notifyModulesChanged: d }) {
  const m = U(!1), f = U(null), v = U("block"), g = U(!1), w = U(!1), x = U(null), S = U([]), T = U(null), j = U(null), I = U([]), { phase: y, elapsedSec: b } = Id(g, xd), W = G(() => {
    const V = n.value;
    return !e.value?.installed || !V || o(V) ? "" : i(V);
  }), $ = G(() => f.value ? g.value ? "Uninstall is running." : w.value ? "Waiting for uninstall preview to finish." : I.value.length > 0 ? `Still required by: ${I.value.join(", ")}. Uninstall those root modules first.` : T.value === "MIGRATIONS_APPLIED" ? 'Applied migrations exist. Choose "Leave applied migrations" or "Revert (down)", then preview again.' : j.value && !x.value ? j.value : x.value ? "" : "Run Preview first so Keeper can show what will be removed." : ""), L = G(() => f.value ? g.value ? "Uninstall is running." : w.value ? "Waiting for uninstall preview to finish." : I.value.length > 0 ? `Still required by: ${I.value.join(", ")}. Uninstall those root modules first.` : T.value === "MIGRATIONS_APPLIED" ? 'Applied migrations exist. Choose "Leave applied migrations" or "Revert (down)", then preview again.' : "" : "No module selected.");
  async function z(V) {
    a(V) && (f.value = V, v.value = "block", T.value = null, j.value = null, I.value = [], x.value = null, S.value = [], m.value = !0, ie());
  }
  async function ie() {
    const V = f.value;
    if (V) {
      w.value = !0, T.value = null, j.value = null, I.value = [], x.value = null, S.value = [];
      try {
        const D = await t.uninstall({ id: V.id, component: V.component, dry_run: !0, migration_policy: v.value });
        x.value = D.preview || D.payload?.preview || null, x.value || (j.value = "Uninstall preview returned no preview data.");
      } catch (D) {
        if (Ct("modules:uninstall-preview", D), D instanceof fn && (T.value = D.code, I.value = Li(D.details), D.code === "NOT_FOUND")) {
          m.value = !1, f.value = null, s("ok", "Module already removed; refreshed installed modules"), await l(), await u();
          return;
        }
        j.value = Je(D, "uninstall preview failed");
      } finally {
        w.value = !1;
      }
    }
  }
  async function C() {
    const V = f.value;
    if (!(!V || L.value)) {
      g.value = !0, T.value = null, j.value = null, S.value = [];
      try {
        const D = await t.uninstall({ id: V.id, component: V.component, migration_policy: v.value });
        S.value = Xo(D), s("ok", `Module uninstalled: ${V.id}`), d(), await l(), await u();
      } catch (D) {
        if (Ct("modules:uninstall", D), D instanceof fn && (T.value = D.code, I.value = Li(D.details), S.value = Xo(D.details), D.code === "NOT_FOUND")) {
          m.value = !1, f.value = null, s("ok", "Module already removed; refreshed installed modules"), await l(), await u();
          return;
        }
        j.value = Je(D, "uninstall failed");
      } finally {
        g.value = !1;
      }
    }
  }
  return lt(v, () => {
    m.value && f.value && !g.value && ie();
  }), {
    uninstallDialogOpen: m,
    uninstallDep: f,
    uninstallPolicy: v,
    uninstallRunning: g,
    uninstallPreviewLoading: w,
    uninstallPreview: x,
    uninstallExecution: S,
    uninstallCode: T,
    uninstallError: j,
    uninstallRequiredBy: I,
    uninstallPhase: y,
    uninstallElapsedSec: b,
    selectedUninstallBlockedReason: W,
    uninstallBlockedReason: $,
    uninstallActionBlockedReason: L,
    openUninstallDialog: z,
    previewUninstall: ie,
    runUninstall: C
  };
}
function Td({ hub: t, installed: e, installedError: n, installedCanUpdate: o, installedIsRoot: i, showToast: a, notifyModulesChanged: l, refreshAll: u, refreshSelectedDetail: s }) {
  const d = U({}), m = U(!1), f = U(!1), v = G(() => e.value.filter((C) => {
    const V = j(C);
    return o(C) && i(C) && V && ["available", "failed", "blocked", "skipped"].includes(V.status) && S(V.latestVersion, Mt(C));
  }));
  function g(C) {
    return (String(C || "").trim().replace(/^[^\d]*/, "").match(/\d+(?:\.\d+)*/)?.[0] || "").split(".").filter(Boolean).map(Number);
  }
  function w(C, V) {
    const D = g(C), H = g(V), J = Math.max(D.length, H.length);
    for (let ee = 0; ee < J; ee++) {
      const te = D[ee] || 0, pe = H[ee] || 0;
      if (te !== pe) return te > pe ? 1 : -1;
    }
    return String(C || "").localeCompare(String(V || ""));
  }
  function x(C = []) {
    const V = C.find((D) => D.is_latest) || C[0];
    return String(V?.version || "");
  }
  function S(C, V) {
    return !!(C && V && C !== V && w(C, V) > 0);
  }
  function T(C) {
    const V = String(C || "").trim().replace(/^[>=<~^]+v?/, "");
    return V ? `>=${V}` : ">=v0.0.0";
  }
  function j(C) {
    return C?.component && d.value[C.component] || null;
  }
  function I(C, V) {
    const D = d.value[C];
    d.value = {
      ...d.value,
      [C]: {
        component: C,
        currentVersion: V.currentVersion ?? D?.currentVersion ?? "",
        latestVersion: V.latestVersion ?? D?.latestVersion ?? "",
        status: V.status ?? D?.status ?? "current",
        message: V.message
      }
    };
  }
  function y(C) {
    const V = j(C);
    return V ? V.status === "available" ? `${V.currentVersion || "?"} → ${V.latestVersion || "?"}` : V.status === "queued" ? "queued" : V.status === "skipped" ? "skipped" : V.status === "planning" ? "planning" : V.status === "updating" ? "updating" : V.status === "updated" ? "updated" : V.status === "blocked" ? "blocked" : V.status === "failed" ? "failed" : "" : "";
  }
  function b(C) {
    const V = j(C)?.status;
    return V === "planning" || V === "updating" ? "tabler:loader-2" : V === "updated" ? "tabler:check" : V === "queued" ? "tabler:clock" : V === "skipped" ? "tabler:player-skip-forward" : V === "blocked" ? "tabler:lock" : V === "failed" ? "tabler:alert-triangle" : "tabler:arrow-up-circle";
  }
  function W(C) {
    const V = j(C)?.status;
    return V === "planning" || V === "updating";
  }
  async function $() {
    if (!t || m.value) return;
    m.value = !0, n.value = null;
    const C = {};
    let V = 0, D = 0;
    try {
      for (const H of e.value) {
        if (!o(H) || !i(H)) continue;
        const J = Mt(H);
        try {
          const ee = await t.listVersions(H.component), te = x(ee.items), pe = S(te, J) ? "available" : "current";
          pe === "available" && V++, C[H.component] = { component: H.component, currentVersion: J, latestVersion: te, status: pe }, d.value = { ...C };
        } catch (ee) {
          D++, C[H.component] = {
            component: H.component,
            currentVersion: J,
            latestVersion: "",
            status: "failed",
            message: Je(ee, "version scan failed")
          }, d.value = { ...C };
        }
      }
      a("ok", `Found ${V} update${V === 1 ? "" : "s"}${D ? `, ${D} failed` : ""}`);
    } finally {
      m.value = !1;
    }
  }
  async function L(C, V) {
    I(C, { status: "planning", message: void 0 });
    try {
      const D = await t.planInstall({ component: C, version: V, run_migrations: !0 }), H = D.missing_requirements || [];
      if (H.length) {
        const J = `Missing required settings: ${H.join(", ")}`;
        return I(C, { status: "blocked", message: J }), null;
      }
      return D;
    } catch (D) {
      const H = Je(D, "update plan failed");
      return I(C, { status: "failed", message: H }), null;
    }
  }
  async function z(C) {
    if (!t || !C.component) return !1;
    let V = j(C);
    if (!V) {
      const D = Mt(C);
      try {
        const H = await t.listVersions(C.component), J = x(H.items);
        V = {
          component: C.component,
          currentVersion: D,
          latestVersion: J,
          status: S(J, D) ? "available" : "current"
        }, I(C.component, V);
      } catch (H) {
        return I(C.component, { status: "failed", message: Je(H, "version scan failed") }), !1;
      }
    }
    if (!V.latestVersion || !S(V.latestVersion, Mt(C))) return !0;
    try {
      const D = T(V.latestVersion), H = await L(C.component, D);
      if (!H) return !1;
      const J = t.install({
        ...H.install_payload,
        component: C.component,
        version: D,
        run_migrations: !0,
        migration_policy: "up"
      });
      return I(C.component, { status: "updating" }), await J, I(C.component, {
        status: "updated",
        currentVersion: V.latestVersion,
        latestVersion: V.latestVersion,
        message: void 0
      }), l(), !0;
    } catch (D) {
      return I(C.component, { status: "failed", message: Je(D, "update failed") }), !1;
    }
  }
  async function ie() {
    if (f.value || v.value.length === 0) return;
    f.value = !0;
    const C = [...v.value];
    try {
      for (const ee of C) I(ee.component, { status: "queued" });
      const V = [], D = [], H = [], J = [];
      for (; C.length; ) {
        const ee = C.findIndex((re) => !C.some((ge) => ge.used_by?.includes(re.component)));
        if (ee < 0) throw new Error(`Cannot order module updates: dependency cycle among ${C.map((re) => re.component).join(", ")}`);
        const [te] = C.splice(ee, 1), pe = V.filter((re) => re.used_by?.includes(te.component));
        if (pe.length) {
          const re = `Dependency update failed: ${pe.map((ge) => ge.component).join(", ")}`;
          I(te.component, { status: "skipped", message: re }), V.push(te), J.push(`${te.component}: ${re}`);
          continue;
        }
        if (await z(te))
          D.push(te.component);
        else {
          const re = j(te)?.message || "update failed";
          I(te.component, { status: "failed", message: re }), V.push(te), H.push(`${te.component}: ${re}`);
        }
      }
      a(H.length || J.length ? "error" : "ok", [
        `Updated ${D.length}${D.length ? `: ${D.join(", ")}` : ""}`,
        `Failed ${H.length}${H.length ? `: ${H.join("; ")}` : ""}`,
        `Skipped ${J.length}${J.length ? `: ${J.join("; ")}` : ""}`
      ].join(". ")), await u(), await s();
    } catch (V) {
      const D = Je(V, "update failed");
      for (const H of C) I(H.component, { status: "failed", message: D });
      a("error", D);
    } finally {
      f.value = !1;
    }
  }
  return {
    updateScan: d,
    updateScanLoading: m,
    updateAllRunning: f,
    availableUpdates: v,
    updateInfoForDep: j,
    updateStatusLabel: y,
    updateStatusIcon: b,
    updateStatusBusy: W,
    scanInstalledUpdates: $,
    updateInstalledDependency: z,
    updateAllAvailable: ie
  };
}
function Ld({ hub: t, loadCatalog: e }) {
  const n = U(!1), o = U(!1), i = U(!1), a = U(!1), l = U(null), u = U(""), s = U(!1), d = U(!1), m = U(null), f = G(() => l.value?.orgs || []), v = G(() => l.value?.username || l.value?.user_id || ""), g = G(() => !!l.value?.authenticated), w = G(() => !!(l.value?.authenticated && l.value?.expired)), x = G(() => i.value ? "tabler:key" : w.value ? "tabler:alert-triangle" : "tabler:key-off"), S = G(() => i.value ? "Hub token set" : w.value ? "Hub token expired" : "Set Hub token"), T = G(() => {
    const $ = l.value?.expires_at;
    if (!$) return "";
    const L = new Date($);
    return isNaN(L.getTime()) ? "" : L.toLocaleDateString();
  });
  function j($) {
    l.value = $?.authenticated ? $ : null;
    const L = Ai($);
    i.value = L, a.value = L;
  }
  async function I() {
    try {
      const { data: $ } = await Si.get("/api/v1/user/me");
      n.value = !!($?.success && $?.security?.is_admin);
    } catch ($) {
      Ct("modules:auth", $), n.value = !1;
    } finally {
      o.value = !0;
    }
  }
  async function y() {
    try {
      const $ = await t.authStatus();
      j($);
    } catch ($) {
      Ct("modules:hub-auth", $);
    }
  }
  async function b() {
    const $ = u.value.trim();
    if (!$) {
      m.value = "Paste a Hub token first.";
      return;
    }
    m.value = null, d.value = !0;
    try {
      const L = await t.authenticate($);
      j(L), Ai(L) ? (u.value = "", s.value = !1, await e()) : m.value = "That token is invalid or expired.";
    } catch (L) {
      m.value = Je(L, "failed to save Hub token");
    } finally {
      d.value = !1;
    }
  }
  async function W() {
    m.value = null;
    try {
      await t.logout();
    } catch ($) {
      m.value = Je($, "failed to clear Hub token");
      return;
    }
    j(null), await e();
  }
  return {
    isAdmin: n,
    authLoaded: o,
    hubConnected: i,
    hubUsable: a,
    hubStatus: l,
    hubToken: u,
    showTokenPanel: s,
    hubConnecting: d,
    hubError: m,
    hubOrgs: f,
    hubIdentity: v,
    hubTokenStored: g,
    hubTokenExpired: w,
    hubTokenIcon: x,
    hubTokenButtonLabel: S,
    hubExpiry: T,
    applyHubAuthStatus: j,
    loadAuth: I,
    loadHubAuth: y,
    saveHubToken: b,
    clearHubToken: W
  };
}
const Ad = ["kickside", "kickside-plugin"], nr = "kickside", Ed = "https://portal.wippy.ai/account/tokens", jd = [
  { label: "Block if any applied", value: "block" },
  { label: "Leave applied migrations", value: "leave" },
  { label: "Revert (down) - may lose data", value: "down" }
];
function Vd() {
  const t = Fr(Si), e = U(null), n = Ld({ hub: t, loadCatalog: ko }), {
    isAdmin: o,
    authLoaded: i,
    hubConnected: a,
    hubUsable: l,
    hubStatus: u,
    hubToken: s,
    showTokenPanel: d,
    hubConnecting: m,
    hubError: f,
    hubOrgs: v,
    hubIdentity: g,
    hubTokenStored: w,
    hubTokenExpired: x,
    hubTokenIcon: S,
    hubTokenButtonLabel: T,
    hubExpiry: j,
    loadAuth: I,
    loadHubAuth: y,
    saveHubToken: b,
    clearHubToken: W
  } = n, $ = U([]), L = U(""), z = U("all"), ie = U(!1), C = U(null), V = U(!0), D = U([]), H = U(!1), J = U(null), ee = U(""), te = U("downloads"), pe = Od({
    hub: t,
    installed: $,
    catalog: D,
    installedDepFor: Gt,
    installedCanUpdate: At,
    installedUpdateDisabledReason: Sn,
    installedCanUninstall: Wt,
    installedIsPrivate: Qt
  }), {
    selected: re,
    selectedModule: ge,
    detailReadme: _e,
    detailEntries: Pe,
    detailLoading: He,
    detailTab: Oe,
    detailVersions: Dt,
    envVars: Ot,
    requirements: Bt,
    detailGroups: Le,
    versionMeta: gt,
    selectedInstalledDep: dt,
    selectedCanUpdate: et,
    selectedUpdateDisabledReason: ct,
    selectedCanUninstall: pt,
    selectedIsPrivate: Be,
    openDetail: Ke,
    closeDetail: qe,
    refreshSelectedDetail: Ae
  } = pe, tt = Pd({
    hub: t,
    selected: re,
    selectedInstalledDep: dt,
    installedIsRoot: st,
    installedUninstallDisabledReason: $n,
    installedCanUninstall: Wt,
    refreshAll: dn,
    refreshSelectedDetail: Ae,
    showToast: E,
    notifyModulesChanged: ci
  }), {
    uninstallDialogOpen: Ft,
    uninstallDep: mt,
    uninstallPolicy: nt,
    uninstallRunning: ft,
    uninstallPreviewLoading: yt,
    uninstallPreview: ht,
    uninstallExecution: A,
    uninstallCode: B,
    uninstallError: R,
    uninstallRequiredBy: q,
    uninstallPhase: Y,
    uninstallElapsedSec: Q,
    selectedUninstallBlockedReason: be,
    uninstallBlockedReason: Ee,
    uninstallActionBlockedReason: xt,
    openUninstallDialog: Yt,
    previewUninstall: $e,
    runUninstall: We
  } = tt, Rt = Td({
    hub: t,
    installed: $,
    installedError: C,
    installedCanUpdate: At,
    installedIsRoot: st,
    showToast: E,
    notifyModulesChanged: ci,
    refreshAll: dn,
    refreshSelectedDetail: Ae
  }), {
    updateScanLoading: It,
    updateAllRunning: Xt,
    availableUpdates: Ce,
    updateInfoForDep: ot,
    updateStatusLabel: Me,
    updateStatusIcon: jn,
    updateStatusBusy: yn,
    scanInstalledUpdates: Nt,
    updateInstalledDependency: kn,
    updateAllAvailable: it
  } = Rt, rt = G(() => {
    const N = /* @__PURE__ */ new Set();
    for (const ne of $.value)
      if (ne.installed !== !1)
        for (const Ge of Ei(ne)) N.add(Ge);
    return N;
  }), Pt = G(() => Ha(D.value, ee.value)), je = G(() => Pt.value.filter((N) => !wn(N))), Ut = G(() => ee.value.trim() || je.value.length < 7 ? [] : [...je.value].sort((N, ne) => (ne.total_downloads || 0) - (N.total_downloads || 0)).slice(0, 6)), Ht = G(() => new Set(Ut.value.map(jo))), Vn = G(() => Ka(je.value.filter((N) => !Ht.value.has(jo(N))), te.value)), kt = G(() => $.value.filter((N) => N.installed !== !1).length), Kt = G(() => {
    const N = L.value.trim().toLowerCase(), ne = z.value, Ge = $.value.filter((Re) => Re.installed === !1 || ne === "root" && !st(Re) || ne === "transitive" && st(Re) || ne === "local" && Re.source !== "local" ? !1 : N ? [
      Re.component,
      Re.id,
      Re.name,
      Re.namespace,
      Re.version,
      Re.source,
      Lt(Re),
      en(Re),
      tr(Re),
      Mt(Re)
    ].filter(Boolean).join(" ").toLowerCase().includes(N) : !0);
    return qa(Ge, at);
  }), Tt = G(() => $.value.filter((N) => N.installed !== !1 && !!at(N.component)).length), De = G(() => Kt.value.filter((N) => !!at(N.component)).length), Fe = G(() => i.value && !o.value), Te = U(null), $t = G(() => Te.value !== null);
  function at(N) {
    return D.value.find((ne) => Eo(ne, N));
  }
  function qt(N) {
    return Wn({ full_name: N.component });
  }
  function Jt(N) {
    const ne = at(N.component);
    return ne ? Tn(ne) : "tabler:package";
  }
  function Qt(N) {
    return qn(at(N.component)) || qn(N);
  }
  function st(N) {
    return Wa(N || {});
  }
  function Lt(N) {
    return Ga(N);
  }
  function en(N) {
    return Za(N);
  }
  function $n(N) {
    if (st(N)) return "";
    const ne = en(N);
    return ne ? `Installed as a dependency; ${ne}` : "Installed as a dependency of another module";
  }
  function At(N) {
    return !!(N?.component && N.source !== "local");
  }
  function Sn(N) {
    return N.source === "local" ? "Local replacement; update from source" : "No Hub dependency update action available";
  }
  function Wt(N) {
    return !!(N && st(N));
  }
  function wn(N) {
    return Ei(N).some((ne) => rt.value.has(ne));
  }
  function Gt(N) {
    return $.value.find((ne) => Eo(ne, N));
  }
  function E(N, ne) {
    const Ge = Hr?.toast;
    typeof Ge == "function" ? Ge({ severity: N === "ok" ? "success" : "error", summary: ne }) : (e.value = { kind: N, message: ne }, setTimeout(() => {
      e.value?.message === ne && (e.value = null);
    }, 5e3));
  }
  function O() {
    re.value && Ho({
      full_name: re.value.component,
      latest_version: re.value.version,
      description: re.value.description
    });
  }
  function bt() {
    const N = re.value && Gt(re.value.component);
    N && At(N) && Z(N);
  }
  function No() {
    const N = re.value && Gt(re.value.component);
    N && Wt(N) && Yt(N);
  }
  async function Uo() {
    ie.value = !0, C.value = null;
    try {
      $.value = Cd(await t.listDependencies());
    } catch (N) {
      $.value = [], Ct("modules:listDependencies", N), C.value = Je(N, "dependency graph unavailable");
    }
    ie.value = !1;
  }
  async function ko() {
    H.value = !0, J.value = null;
    try {
      D.value = (await t.fetchAllByKeyword(Ad)).filter(Xa);
    } catch (N) {
      Ct("modules:catalog", N), N instanceof fn && (N.code === "UNAUTHORIZED" || N.code === "FORBIDDEN") ? l.value = !1 : J.value = Je(N, `failed to load ${nr} catalog`);
    } finally {
      H.value = !1;
    }
  }
  async function dn() {
    await Promise.all([Uo(), ko()]);
  }
  function Ho(N) {
    const ne = Ao(N);
    Te.value = {
      mode: "install",
      component: ne,
      version: N.latest_version ? String(N.latest_version) : "",
      currentId: null,
      catalogItem: at(ne) || N,
      installedDep: null
    };
  }
  function Z(N) {
    At(N) && (Te.value = {
      mode: "update",
      component: N.component,
      // Let the dialog load and select the newest published release. Seeding
      // this with the resolved version re-submits the current package while
      // presenting the operation as an update.
      version: "",
      currentId: N.dependencyId || null,
      catalogItem: at(N.component) || null,
      installedDep: N
    });
  }
  function we() {
    Te.value = null;
  }
  async function ve() {
    await dn(), await Ae(), we();
  }
  return Fo(() => {
    Ur("wc-render-markdown", { timeoutMs: 8e3 }).catch(() => {
    });
  }), Ya(async () => {
    await I(), o.value && (await y(), await dn());
  }), {
    LABEL: nr,
    HUB_PORTAL: Ed,
    UNINSTALL_MIGRATION_OPTIONS: jd,
    accessDenied: Fe,
    statusBanner: e,
    hubConnected: a,
    hubStatus: u,
    hubToken: s,
    showTokenPanel: d,
    hubConnecting: m,
    hubError: f,
    hubOrgs: v,
    hubIdentity: g,
    hubTokenStored: w,
    hubTokenExpired: x,
    hubTokenIcon: S,
    hubTokenButtonLabel: T,
    hubExpiry: j,
    selected: re,
    selectedModule: ge,
    detailReadme: _e,
    detailEntries: Pe,
    detailLoading: He,
    detailTab: Oe,
    detailVersions: Dt,
    envVars: Ot,
    requirements: Bt,
    detailGroups: Le,
    versionMeta: gt,
    selectedCanUpdate: et,
    selectedUpdateDisabledReason: ct,
    selectedCanUninstall: pt,
    selectedIsPrivate: Be,
    selectedUninstallBlockedReason: be,
    entryName: Sd,
    entryDesc: wd,
    entryIcon: _d,
    installed: $,
    installedFilter: L,
    installedKindFilter: z,
    installedTotal: kt,
    updateScanLoading: It,
    updateAllRunning: Xt,
    availableUpdates: Ce,
    installedLoading: ie,
    installedError: C,
    installedOpen: V,
    catalog: D,
    catalogLoading: H,
    catalogError: J,
    catalogInstalledTotal: Tt,
    visibleCatalogInstalled: De,
    browseFilter: ee,
    sortBy: te,
    availableItems: je,
    featured: Ut,
    sortedItems: Vn,
    visibleInstalled: Kt,
    catalogItemFor: at,
    installedAccent: qt,
    installedIcon: Jt,
    installedIsPrivate: Qt,
    installedIsRoot: st,
    installedRole: Lt,
    installedUsedBy: en,
    installedCanUpdate: At,
    installedUpdateDisabledReason: Sn,
    installedCanUninstall: Wt,
    installedMigrationSummary: tr,
    updateInfoForDep: ot,
    updateStatusLabel: Me,
    updateStatusIcon: jn,
    updateStatusBusy: yn,
    scanInstalledUpdates: Nt,
    updateInstalledDependency: kn,
    updateAllAvailable: it,
    installDialogOpen: $t,
    installTarget: Te,
    closeInstallDialog: we,
    onInstallChanged: ve,
    uninstallDialogOpen: Ft,
    uninstallDep: mt,
    uninstallPolicy: nt,
    uninstallRunning: ft,
    uninstallPreviewLoading: yt,
    uninstallPreview: ht,
    uninstallExecution: A,
    uninstallCode: B,
    uninstallError: R,
    uninstallRequiredBy: q,
    uninstallBlockedReason: Ee,
    uninstallActionBlockedReason: xt,
    uninstallPhase: Y,
    uninstallElapsedSec: Q,
    previewUninstall: $e,
    executionStepLabel: Br,
    openDetail: Ke,
    closeDetail: qe,
    detailInstall: O,
    detailUpdate: bt,
    detailUninstall: No,
    refreshAll: dn,
    saveHubToken: b,
    clearHubToken: W,
    openUpdateDialog: Z,
    openUninstallDialog: Yt,
    installedUninstallDisabledReason: $n,
    runUninstall: We
  };
}
function Hn(...t) {
  if (t) {
    let e = [];
    for (let n = 0; n < t.length; n++) {
      let o = t[n];
      if (!o) continue;
      let i = typeof o;
      if (i === "string" || i === "number") e.push(o);
      else if (i === "object") {
        let a = Array.isArray(o) ? [Hn(...o)] : Object.entries(o).map(([l, u]) => u ? l : void 0);
        e = a.length ? e.concat(a.filter((l) => !!l)) : e;
      }
    }
    return e.join(" ").trim();
  }
}
function zd(t, e) {
  return t ? t.classList ? t.classList.contains(e) : new RegExp("(^| )" + e + "( |$)", "gi").test(t.className) : !1;
}
function Md(t, e) {
  if (t && e) {
    let n = (o) => {
      zd(t, o) || (t.classList ? t.classList.add(o) : t.className += " " + o);
    };
    [e].flat().filter(Boolean).forEach((o) => o.split(" ").forEach(n));
  }
}
function qo(t, e) {
  if (t && e) {
    let n = (o) => {
      t.classList ? t.classList.remove(o) : t.className = t.className.replace(new RegExp("(^|\\b)" + o.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [e].flat().filter(Boolean).forEach((o) => o.split(" ").forEach(n));
  }
}
function or(t) {
  return t ? Math.abs(t.scrollLeft) : 0;
}
function Dd(t, e) {
  return t instanceof HTMLElement ? t.offsetWidth : 0;
}
function Bd(t) {
  if (t) {
    let e = t.parentNode;
    return e && e instanceof ShadowRoot && e.host && (e = e.host), e;
  }
  return null;
}
function Fd(t) {
  return !!(t !== null && typeof t < "u" && t.nodeName && Bd(t));
}
function yo(t) {
  return typeof Element < "u" ? t instanceof Element : t !== null && typeof t == "object" && t.nodeType === 1 && typeof t.nodeName == "string";
}
function zo(t, e = {}) {
  if (yo(t)) {
    let n = (o, i) => {
      var a, l;
      let u = (a = t?.$attrs) != null && a[o] ? [(l = t?.$attrs) == null ? void 0 : l[o]] : [];
      return [i].flat().reduce((s, d) => {
        if (d != null) {
          let m = typeof d;
          if (m === "string" || m === "number") s.push(d);
          else if (m === "object") {
            let f = Array.isArray(d) ? n(o, d) : Object.entries(d).map(([v, g]) => o === "style" && (g || g === 0) ? `${v.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}:${g}` : g ? v : void 0);
            s = f.length ? s.concat(f.filter((v) => !!v)) : s;
          }
        }
        return s;
      }, u);
    };
    Object.entries(e).forEach(([o, i]) => {
      if (i != null) {
        let a = o.match(/^on(.+)/);
        a ? t.addEventListener(a[1].toLowerCase(), i) : o === "p-bind" || o === "pBind" ? zo(t, i) : (i = o === "class" ? [...new Set(n("class", i))].join(" ").trim() : o === "style" ? n("style", i).join(";").trim() : i, (t.$attrs = t.$attrs || {}) && (t.$attrs[o] = i), t.setAttribute(o, i));
      }
    });
  }
}
function Rd(t, e = {}, ...n) {
  {
    let o = document.createElement(t);
    return zo(o, e), o.append(...n), o;
  }
}
function Nd(t, e) {
  return yo(t) ? t.matches(e) ? t : t.querySelector(e) : null;
}
function Ud(t, e) {
  if (yo(t)) {
    let n = t.getAttribute(e);
    return isNaN(n) ? n === "true" || n === "false" ? n === "true" : n : +n;
  }
}
function ir(t) {
  if (t) {
    let e = t.offsetHeight, n = getComputedStyle(t);
    return e -= parseFloat(n.paddingTop) + parseFloat(n.paddingBottom) + parseFloat(n.borderTopWidth) + parseFloat(n.borderBottomWidth), e;
  }
  return 0;
}
function Hd(t) {
  if (t) {
    let e = t.getBoundingClientRect();
    return { top: e.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: e.left + (window.pageXOffset || or(document.documentElement) || or(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function Kd(t, e) {
  return t ? t.offsetHeight : 0;
}
function rr(t) {
  if (t) {
    let e = t.offsetWidth, n = getComputedStyle(t);
    return e -= parseFloat(n.paddingLeft) + parseFloat(n.paddingRight) + parseFloat(n.borderLeftWidth) + parseFloat(n.borderRightWidth), e;
  }
  return 0;
}
function qd() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function Wd(t, e = "", n) {
  yo(t) && n !== null && n !== void 0 && t.setAttribute(e, n);
}
function da() {
  let t = /* @__PURE__ */ new Map();
  return { on(e, n) {
    let o = t.get(e);
    return o ? o.push(n) : o = [n], t.set(e, o), this;
  }, off(e, n) {
    let o = t.get(e);
    return o && o.splice(o.indexOf(n) >>> 0, 1), this;
  }, emit(e, n) {
    let o = t.get(e);
    o && o.forEach((i) => {
      i(n);
    });
  }, clear() {
    t.clear();
  } };
}
function gn(t) {
  return t == null || t === "" || Array.isArray(t) && t.length === 0 || !(t instanceof Date) && typeof t == "object" && Object.keys(t).length === 0;
}
function Ci(t) {
  return typeof t == "function" && "call" in t && "apply" in t;
}
function Se(t) {
  return !gn(t);
}
function sn(t, e = !0) {
  return t instanceof Object && t.constructor === Object && (e || Object.keys(t).length !== 0);
}
function ut(t, ...e) {
  return Ci(t) ? t(...e) : t;
}
function Qe(t, e = !0) {
  return typeof t == "string" && (e || t !== "");
}
function Vt(t) {
  return Qe(t) ? t.replace(/(-|_)/g, "").toLowerCase() : t;
}
function Oi(t, e = "", n = {}) {
  let o = Vt(e).split("."), i = o.shift();
  if (i) {
    if (sn(t)) {
      let a = Object.keys(t).find((l) => Vt(l) === i) || "";
      return Oi(ut(t[a], n), o.join("."), n);
    }
    return;
  }
  return ut(t, n);
}
function ca(t, e = !0) {
  return Array.isArray(t) && (e || t.length !== 0);
}
function Gd(t) {
  return Se(t) && !isNaN(t);
}
function bn(t, e) {
  if (e) {
    let n = e.test(t);
    return e.lastIndex = 0, n;
  }
  return !1;
}
function Kn(t) {
  return t && t.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function Zd(t) {
  return Qe(t, !1) ? t[0].toUpperCase() + t.slice(1) : t;
}
function pa(t) {
  return Qe(t) ? t.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : t;
}
var wo = {};
function Yd(t = "pui_id_") {
  return Object.hasOwn(wo, t) || (wo[t] = 0), wo[t]++, `${t}${wo[t]}`;
}
var Xd = Object.defineProperty, Jd = Object.defineProperties, Qd = Object.getOwnPropertyDescriptors, Mo = Object.getOwnPropertySymbols, ma = Object.prototype.hasOwnProperty, fa = Object.prototype.propertyIsEnumerable, ar = (t, e, n) => e in t ? Xd(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n, wt = (t, e) => {
  for (var n in e || (e = {})) ma.call(e, n) && ar(t, n, e[n]);
  if (Mo) for (var n of Mo(e)) fa.call(e, n) && ar(t, n, e[n]);
  return t;
}, Wo = (t, e) => Jd(t, Qd(e)), Zt = (t, e) => {
  var n = {};
  for (var o in t) ma.call(t, o) && e.indexOf(o) < 0 && (n[o] = t[o]);
  if (t != null && Mo) for (var o of Mo(t)) e.indexOf(o) < 0 && fa.call(t, o) && (n[o] = t[o]);
  return n;
}, ec = da(), Ue = ec, lo = /{([^}]*)}/g, ha = /(\d+\s+[\+\-\*\/]\s+\d+)/g, ba = /var\([^)]+\)/g;
function sr(t) {
  return Qe(t) ? t.replace(/[A-Z]/g, (e, n) => n === 0 ? e : "." + e.toLowerCase()).toLowerCase() : t;
}
function tc(t) {
  return sn(t) && t.hasOwnProperty("$value") && t.hasOwnProperty("$type") ? t.$value : t;
}
function nc(t) {
  return t.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function pi(t = "", e = "") {
  return nc(`${Qe(t, !1) && Qe(e, !1) ? `${t}-` : t}${e}`);
}
function va(t = "", e = "") {
  return `--${pi(t, e)}`;
}
function oc(t = "") {
  let e = (t.match(/{/g) || []).length, n = (t.match(/}/g) || []).length;
  return (e + n) % 2 !== 0;
}
function ga(t, e = "", n = "", o = [], i) {
  if (Qe(t)) {
    let a = t.trim();
    if (oc(a)) return;
    if (bn(a, lo)) {
      let l = a.replaceAll(lo, (u) => {
        let s = u.replace(/{|}/g, "").split(".").filter((d) => !o.some((m) => bn(d, m)));
        return `var(${va(n, pa(s.join("-")))}${Se(i) ? `, ${i}` : ""})`;
      });
      return bn(l.replace(ba, "0"), ha) ? `calc(${l})` : l;
    }
    return a;
  } else if (Gd(t)) return t;
}
function ic(t, e, n) {
  Qe(e, !1) && t.push(`${e}:${n};`);
}
function On(t, e) {
  return t ? `${t}{${e}}` : "";
}
function ya(t, e) {
  if (t.indexOf("dt(") === -1) return t;
  function n(l, u) {
    let s = [], d = 0, m = "", f = null, v = 0;
    for (; d <= l.length; ) {
      let g = l[d];
      if ((g === '"' || g === "'" || g === "`") && l[d - 1] !== "\\" && (f = f === g ? null : g), !f && (g === "(" && v++, g === ")" && v--, (g === "," || d === l.length) && v === 0)) {
        let w = m.trim();
        w.startsWith("dt(") ? s.push(ya(w, u)) : s.push(o(w)), m = "", d++;
        continue;
      }
      g !== void 0 && (m += g), d++;
    }
    return s;
  }
  function o(l) {
    let u = l[0];
    if ((u === '"' || u === "'" || u === "`") && l[l.length - 1] === u) return l.slice(1, -1);
    let s = Number(l);
    return isNaN(s) ? l : s;
  }
  let i = [], a = [];
  for (let l = 0; l < t.length; l++) if (t[l] === "d" && t.slice(l, l + 3) === "dt(") a.push(l), l += 2;
  else if (t[l] === ")" && a.length > 0) {
    let u = a.pop();
    a.length === 0 && i.push([u, l]);
  }
  if (!i.length) return t;
  for (let l = i.length - 1; l >= 0; l--) {
    let [u, s] = i[l], d = t.slice(u + 3, s), m = n(d, e), f = e(...m);
    t = t.slice(0, u) + f + t.slice(s + 1);
  }
  return t;
}
var vn = (...t) => rc(ye.getTheme(), ...t), rc = (t = {}, e, n, o) => {
  if (e) {
    let { variable: i, options: a } = ye.defaults || {}, { prefix: l, transform: u } = t?.options || a || {}, s = bn(e, lo) ? e : `{${e}}`;
    return o === "value" || gn(o) && u === "strict" ? ye.getTokenValue(e) : ga(s, void 0, l, [i.excludedKeyRegex], n);
  }
  return "";
};
function _o(t, ...e) {
  if (t instanceof Array) {
    let n = t.reduce((o, i, a) => {
      var l;
      return o + i + ((l = ut(e[a], { dt: vn })) != null ? l : "");
    }, "");
    return ya(n, vn);
  }
  return ut(t, { dt: vn });
}
function ac(t, e = {}) {
  let n = ye.defaults.variable, { prefix: o = n.prefix, selector: i = n.selector, excludedKeyRegex: a = n.excludedKeyRegex } = e, l = [], u = [], s = [{ node: t, path: o }];
  for (; s.length; ) {
    let { node: m, path: f } = s.pop();
    for (let v in m) {
      let g = m[v], w = tc(g), x = bn(v, a) ? pi(f) : pi(f, pa(v));
      if (sn(w)) s.push({ node: w, path: x });
      else {
        let S = va(x), T = ga(w, x, o, [a]);
        ic(u, S, T);
        let j = x;
        o && j.startsWith(o + "-") && (j = j.slice(o.length + 1)), l.push(j.replace(/-/g, "."));
      }
    }
  }
  let d = u.join("");
  return { value: u, tokens: l, declarations: d, css: On(i, d) };
}
var St = { regex: { rules: { class: { pattern: /^\.([a-zA-Z][\w-]*)$/, resolve(t) {
  return { type: "class", selector: t, matched: this.pattern.test(t.trim()) };
} }, attr: { pattern: /^\[(.*)\]$/, resolve(t) {
  return { type: "attr", selector: `:root${t},:host${t}`, matched: this.pattern.test(t.trim()) };
} }, media: { pattern: /^@media (.*)$/, resolve(t) {
  return { type: "media", selector: t, matched: this.pattern.test(t.trim()) };
} }, system: { pattern: /^system$/, resolve(t) {
  return { type: "system", selector: "@media (prefers-color-scheme: dark)", matched: this.pattern.test(t.trim()) };
} }, custom: { resolve(t) {
  return { type: "custom", selector: t, matched: !0 };
} } }, resolve(t) {
  let e = Object.keys(this.rules).filter((n) => n !== "custom").map((n) => this.rules[n]);
  return [t].flat().map((n) => {
    var o;
    return (o = e.map((i) => i.resolve(n)).find((i) => i.matched)) != null ? o : this.rules.custom.resolve(n);
  });
} }, _toVariables(t, e) {
  return ac(t, { prefix: e?.prefix });
}, getCommon({ name: t = "", theme: e = {}, params: n, set: o, defaults: i }) {
  var a, l, u, s, d, m, f;
  let { preset: v, options: g } = e, w, x, S, T, j, I, y;
  if (Se(v) && g.transform !== "strict") {
    let { primitive: b, semantic: W, extend: $ } = v, L = W || {}, { colorScheme: z } = L, ie = Zt(L, ["colorScheme"]), C = $ || {}, { colorScheme: V } = C, D = Zt(C, ["colorScheme"]), H = z || {}, { dark: J } = H, ee = Zt(H, ["dark"]), te = V || {}, { dark: pe } = te, re = Zt(te, ["dark"]), ge = Se(b) ? this._toVariables({ primitive: b }, g) : {}, _e = Se(ie) ? this._toVariables({ semantic: ie }, g) : {}, Pe = Se(ee) ? this._toVariables({ light: ee }, g) : {}, He = Se(J) ? this._toVariables({ dark: J }, g) : {}, Oe = Se(D) ? this._toVariables({ semantic: D }, g) : {}, Dt = Se(re) ? this._toVariables({ light: re }, g) : {}, Ot = Se(pe) ? this._toVariables({ dark: pe }, g) : {}, [Bt, Le] = [(a = ge.declarations) != null ? a : "", ge.tokens], [gt, dt] = [(l = _e.declarations) != null ? l : "", _e.tokens || []], [et, ct] = [(u = Pe.declarations) != null ? u : "", Pe.tokens || []], [pt, Be] = [(s = He.declarations) != null ? s : "", He.tokens || []], [Ke, qe] = [(d = Oe.declarations) != null ? d : "", Oe.tokens || []], [Ae, tt] = [(m = Dt.declarations) != null ? m : "", Dt.tokens || []], [Ft, mt] = [(f = Ot.declarations) != null ? f : "", Ot.tokens || []];
    w = this.transformCSS(t, Bt, "light", "variable", g, o, i), x = Le;
    let nt = this.transformCSS(t, `${gt}${et}`, "light", "variable", g, o, i), ft = this.transformCSS(t, `${pt}`, "dark", "variable", g, o, i);
    S = `${nt}${ft}`, T = [.../* @__PURE__ */ new Set([...dt, ...ct, ...Be])];
    let yt = this.transformCSS(t, `${Ke}${Ae}color-scheme:light`, "light", "variable", g, o, i), ht = this.transformCSS(t, `${Ft}color-scheme:dark`, "dark", "variable", g, o, i);
    j = `${yt}${ht}`, I = [.../* @__PURE__ */ new Set([...qe, ...tt, ...mt])], y = ut(v.css, { dt: vn });
  }
  return { primitive: { css: w, tokens: x }, semantic: { css: S, tokens: T }, global: { css: j, tokens: I }, style: y };
}, getPreset({ name: t = "", preset: e = {}, options: n, params: o, set: i, defaults: a, selector: l }) {
  var u, s, d;
  let m, f, v;
  if (Se(e) && n.transform !== "strict") {
    let g = t.replace("-directive", ""), w = e, { colorScheme: x, extend: S, css: T } = w, j = Zt(w, ["colorScheme", "extend", "css"]), I = S || {}, { colorScheme: y } = I, b = Zt(I, ["colorScheme"]), W = x || {}, { dark: $ } = W, L = Zt(W, ["dark"]), z = y || {}, { dark: ie } = z, C = Zt(z, ["dark"]), V = Se(j) ? this._toVariables({ [g]: wt(wt({}, j), b) }, n) : {}, D = Se(L) ? this._toVariables({ [g]: wt(wt({}, L), C) }, n) : {}, H = Se($) ? this._toVariables({ [g]: wt(wt({}, $), ie) }, n) : {}, [J, ee] = [(u = V.declarations) != null ? u : "", V.tokens || []], [te, pe] = [(s = D.declarations) != null ? s : "", D.tokens || []], [re, ge] = [(d = H.declarations) != null ? d : "", H.tokens || []], _e = this.transformCSS(g, `${J}${te}`, "light", "variable", n, i, a, l), Pe = this.transformCSS(g, re, "dark", "variable", n, i, a, l);
    m = `${_e}${Pe}`, f = [.../* @__PURE__ */ new Set([...ee, ...pe, ...ge])], v = ut(T, { dt: vn });
  }
  return { css: m, tokens: f, style: v };
}, getPresetC({ name: t = "", theme: e = {}, params: n, set: o, defaults: i }) {
  var a;
  let { preset: l, options: u } = e, s = (a = l?.components) == null ? void 0 : a[t];
  return this.getPreset({ name: t, preset: s, options: u, params: n, set: o, defaults: i });
}, getPresetD({ name: t = "", theme: e = {}, params: n, set: o, defaults: i }) {
  var a, l;
  let u = t.replace("-directive", ""), { preset: s, options: d } = e, m = ((a = s?.components) == null ? void 0 : a[u]) || ((l = s?.directives) == null ? void 0 : l[u]);
  return this.getPreset({ name: u, preset: m, options: d, params: n, set: o, defaults: i });
}, applyDarkColorScheme(t) {
  return !(t.darkModeSelector === "none" || t.darkModeSelector === !1);
}, getColorSchemeOption(t, e) {
  var n;
  return this.applyDarkColorScheme(t) ? this.regex.resolve(t.darkModeSelector === !0 ? e.options.darkModeSelector : (n = t.darkModeSelector) != null ? n : e.options.darkModeSelector) : [];
}, getLayerOrder(t, e = {}, n, o) {
  let { cssLayer: i } = e;
  return i ? `@layer ${ut(i.order || i.name || "primeui", n)}` : "";
}, getCommonStyleSheet({ name: t = "", theme: e = {}, params: n, props: o = {}, set: i, defaults: a }) {
  let l = this.getCommon({ name: t, theme: e, params: n, set: i, defaults: a }), u = Object.entries(o).reduce((s, [d, m]) => s.push(`${d}="${m}"`) && s, []).join(" ");
  return Object.entries(l || {}).reduce((s, [d, m]) => {
    if (sn(m) && Object.hasOwn(m, "css")) {
      let f = Kn(m.css), v = `${d}-variables`;
      s.push(`<style type="text/css" data-primevue-style-id="${v}" ${u}>${f}</style>`);
    }
    return s;
  }, []).join("");
}, getStyleSheet({ name: t = "", theme: e = {}, params: n, props: o = {}, set: i, defaults: a }) {
  var l;
  let u = { name: t, theme: e, params: n, set: i, defaults: a }, s = (l = t.includes("-directive") ? this.getPresetD(u) : this.getPresetC(u)) == null ? void 0 : l.css, d = Object.entries(o).reduce((m, [f, v]) => m.push(`${f}="${v}"`) && m, []).join(" ");
  return s ? `<style type="text/css" data-primevue-style-id="${t}-variables" ${d}>${Kn(s)}</style>` : "";
}, createTokens(t = {}, e, n = "", o = "", i = {}) {
  let a = function(u, s = {}, d = []) {
    if (d.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: u, path: this.path, paths: s, value: void 0 };
    d.push(this.path), s.name = this.path, s.binding || (s.binding = {});
    let m = this.value;
    if (typeof this.value == "string" && lo.test(this.value)) {
      let f = this.value.trim().replace(lo, (v) => {
        var g;
        let w = v.slice(1, -1), x = this.tokens[w];
        if (!x) return console.warn(`Token not found for path: ${w}`), "__UNRESOLVED__";
        let S = x.computed(u, s, d);
        return Array.isArray(S) && S.length === 2 ? `light-dark(${S[0].value},${S[1].value})` : (g = S?.value) != null ? g : "__UNRESOLVED__";
      });
      m = ha.test(f.replace(ba, "0")) ? `calc(${f})` : f;
    }
    return gn(s.binding) && delete s.binding, d.pop(), { colorScheme: u, path: this.path, paths: s, value: m.includes("__UNRESOLVED__") ? void 0 : m };
  }, l = (u, s, d) => {
    Object.entries(u).forEach(([m, f]) => {
      let v = bn(m, e.variable.excludedKeyRegex) ? s : s ? `${s}.${sr(m)}` : sr(m), g = d ? `${d}.${m}` : m;
      sn(f) ? l(f, v, g) : (i[v] || (i[v] = { paths: [], computed: (w, x = {}, S = []) => {
        if (i[v].paths.length === 1) return i[v].paths[0].computed(i[v].paths[0].scheme, x.binding, S);
        if (w && w !== "none") for (let T = 0; T < i[v].paths.length; T++) {
          let j = i[v].paths[T];
          if (j.scheme === w) return j.computed(w, x.binding, S);
        }
        return i[v].paths.map((T) => T.computed(T.scheme, x[T.scheme], S));
      } }), i[v].paths.push({ path: g, value: f, scheme: g.includes("colorScheme.light") ? "light" : g.includes("colorScheme.dark") ? "dark" : "none", computed: a, tokens: i }));
    });
  };
  return l(t, n, o), i;
}, getTokenValue(t, e, n) {
  var o;
  let i = ((u) => u.split(".").filter((s) => !bn(s.toLowerCase(), n.variable.excludedKeyRegex)).join("."))(e), a = e.includes("colorScheme.light") ? "light" : e.includes("colorScheme.dark") ? "dark" : void 0, l = [(o = t[i]) == null ? void 0 : o.computed(a)].flat().filter((u) => u);
  return l.length === 1 ? l[0].value : l.reduce((u = {}, s) => {
    let d = s, { colorScheme: m } = d, f = Zt(d, ["colorScheme"]);
    return u[m] = f, u;
  }, void 0);
}, getSelectorRule(t, e, n, o) {
  return n === "class" || n === "attr" ? On(Se(e) ? `${t}${e},${t} ${e}` : t, o) : On(t, On(e ?? ":root,:host", o));
}, transformCSS(t, e, n, o, i = {}, a, l, u) {
  if (Se(e)) {
    let { cssLayer: s } = i;
    if (o !== "style") {
      let d = this.getColorSchemeOption(i, l);
      e = n === "dark" ? d.reduce((m, { type: f, selector: v }) => (Se(v) && (m += v.includes("[CSS]") ? v.replace("[CSS]", e) : this.getSelectorRule(v, u, f, e)), m), "") : On(u ?? ":root,:host", e);
    }
    if (s) {
      let d = { name: "primeui" };
      sn(s) && (d.name = ut(s.name, { name: t, type: o })), Se(d.name) && (e = On(`@layer ${d.name}`, e), a?.layerNames(d.name));
    }
    return e;
  }
  return "";
} }, ye = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(t = {}) {
  let { theme: e } = t;
  e && (this._theme = Wo(wt({}, e), { options: wt(wt({}, this.defaults.options), e.options) }), this._tokens = St.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
}, get theme() {
  return this._theme;
}, get preset() {
  var t;
  return ((t = this.theme) == null ? void 0 : t.preset) || {};
}, get options() {
  var t;
  return ((t = this.theme) == null ? void 0 : t.options) || {};
}, get tokens() {
  return this._tokens;
}, getTheme() {
  return this.theme;
}, setTheme(t) {
  this.update({ theme: t }), Ue.emit("theme:change", t);
}, getPreset() {
  return this.preset;
}, setPreset(t) {
  this._theme = Wo(wt({}, this.theme), { preset: t }), this._tokens = St.createTokens(t, this.defaults), this.clearLoadedStyleNames(), Ue.emit("preset:change", t), Ue.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(t) {
  this._theme = Wo(wt({}, this.theme), { options: t }), this.clearLoadedStyleNames(), Ue.emit("options:change", t), Ue.emit("theme:change", this.theme);
}, getLayerNames() {
  return [...this._layerNames];
}, setLayerNames(t) {
  this._layerNames.add(t);
}, getLoadedStyleNames() {
  return this._loadedStyleNames;
}, isStyleNameLoaded(t) {
  return this._loadedStyleNames.has(t);
}, setLoadedStyleName(t) {
  this._loadedStyleNames.add(t);
}, deleteLoadedStyleName(t) {
  this._loadedStyleNames.delete(t);
}, clearLoadedStyleNames() {
  this._loadedStyleNames.clear();
}, getTokenValue(t) {
  return St.getTokenValue(this.tokens, t, this.defaults);
}, getCommon(t = "", e) {
  return St.getCommon({ name: t, theme: this.theme, params: e, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getComponent(t = "", e) {
  let n = { name: t, theme: this.theme, params: e, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return St.getPresetC(n);
}, getDirective(t = "", e) {
  let n = { name: t, theme: this.theme, params: e, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return St.getPresetD(n);
}, getCustomPreset(t = "", e, n, o) {
  let i = { name: t, preset: e, options: this.options, selector: n, params: o, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return St.getPreset(i);
}, getLayerOrderCSS(t = "") {
  return St.getLayerOrder(t, this.options, { names: this.getLayerNames() }, this.defaults);
}, transformCSS(t = "", e, n = "style", o) {
  return St.transformCSS(t, e, o, n, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
}, getCommonStyleSheet(t = "", e, n = {}) {
  return St.getCommonStyleSheet({ name: t, theme: this.theme, params: e, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getStyleSheet(t, e, n = {}) {
  return St.getStyleSheet({ name: t, theme: this.theme, params: e, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, onStyleMounted(t) {
  this._loadingStyles.add(t);
}, onStyleUpdated(t) {
  this._loadingStyles.add(t);
}, onStyleLoaded(t, { name: e }) {
  this._loadingStyles.size && (this._loadingStyles.delete(e), Ue.emit(`theme:${e}:load`, t), !this._loadingStyles.size && Ue.emit("theme:load"));
} }, an = {
  _loadedStyleNames: /* @__PURE__ */ new Set(),
  getLoadedStyleNames: function() {
    return this._loadedStyleNames;
  },
  isStyleNameLoaded: function(e) {
    return this._loadedStyleNames.has(e);
  },
  setLoadedStyleName: function(e) {
    this._loadedStyleNames.add(e);
  },
  deleteLoadedStyleName: function(e) {
    this._loadedStyleNames.delete(e);
  },
  clearLoadedStyleNames: function() {
    this._loadedStyleNames.clear();
  }
}, sc = `
    *,
    ::before,
    ::after {
        box-sizing: border-box;
    }

    .p-collapsible-enter-active {
        animation: p-animate-collapsible-expand 0.2s ease-out;
        overflow: hidden;
    }

    .p-collapsible-leave-active {
        animation: p-animate-collapsible-collapse 0.2s ease-out;
        overflow: hidden;
    }

    @keyframes p-animate-collapsible-expand {
        from {
            grid-template-rows: 0fr;
        }
        to {
            grid-template-rows: 1fr;
        }
    }

    @keyframes p-animate-collapsible-collapse {
        from {
            grid-template-rows: 1fr;
        }
        to {
            grid-template-rows: 0fr;
        }
    }

    .p-disabled,
    .p-disabled * {
        cursor: default;
        pointer-events: none;
        user-select: none;
    }

    .p-disabled,
    .p-component:disabled {
        opacity: dt('disabled.opacity');
    }

    .pi {
        font-size: dt('icon.size');
    }

    .p-icon {
        width: dt('icon.size');
        height: dt('icon.size');
    }

    .p-overlay-mask {
        background: var(--px-mask-background, dt('mask.background'));
        color: dt('mask.color');
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

    .p-overlay-mask-enter-active {
        animation: p-animate-overlay-mask-enter dt('mask.transition.duration') forwards;
    }

    .p-overlay-mask-leave-active {
        animation: p-animate-overlay-mask-leave dt('mask.transition.duration') forwards;
    }

    @keyframes p-animate-overlay-mask-enter {
        from {
            background: transparent;
        }
        to {
            background: var(--px-mask-background, dt('mask.background'));
        }
    }
    @keyframes p-animate-overlay-mask-leave {
        from {
            background: var(--px-mask-background, dt('mask.background'));
        }
        to {
            background: transparent;
        }
    }

    .p-anchored-overlay-enter-active {
        animation: p-animate-anchored-overlay-enter 300ms cubic-bezier(.19,1,.22,1);
    }

    .p-anchored-overlay-leave-active {
        animation: p-animate-anchored-overlay-leave 300ms cubic-bezier(.19,1,.22,1);
    }

    @keyframes p-animate-anchored-overlay-enter {
        from {
            opacity: 0;
            transform: scale(0.93);
        }
    }

    @keyframes p-animate-anchored-overlay-leave {
        to {
            opacity: 0;
            transform: scale(0.93);
        }
    }
`;
function uo(t) {
  "@babel/helpers - typeof";
  return uo = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, uo(t);
}
function lr(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    e && (o = o.filter(function(i) {
      return Object.getOwnPropertyDescriptor(t, i).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function ur(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? lr(Object(n), !0).forEach(function(o) {
      lc(t, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : lr(Object(n)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return t;
}
function lc(t, e, n) {
  return (e = uc(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function uc(t) {
  var e = dc(t, "string");
  return uo(e) == "symbol" ? e : e + "";
}
function dc(t, e) {
  if (uo(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (uo(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
function cc(t) {
  var e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  ji() && ji().components ? Fo(t) : e ? t() : An(t);
}
var pc = 0;
function mc(t) {
  var e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = U(!1), o = U(t), i = U(null), a = qd() ? window.document : void 0, l = e.document, u = l === void 0 ? a : l, s = e.immediate, d = s === void 0 ? !0 : s, m = e.manual, f = m === void 0 ? !1 : m, v = e.name, g = v === void 0 ? "style_".concat(++pc) : v, w = e.id, x = w === void 0 ? void 0 : w, S = e.media, T = S === void 0 ? void 0 : S, j = e.nonce, I = j === void 0 ? void 0 : j, y = e.first, b = y === void 0 ? !1 : y, W = e.onMounted, $ = W === void 0 ? void 0 : W, L = e.onUpdated, z = L === void 0 ? void 0 : L, ie = e.onLoad, C = ie === void 0 ? void 0 : ie, V = e.props, D = V === void 0 ? {} : V, H = function() {
  }, J = function(pe) {
    var re = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (u) {
      var ge = ur(ur({}, D), re), _e = ge.name || g, Pe = ge.id || x, He = ge.nonce || I;
      i.value = u.querySelector('style[data-primevue-style-id="'.concat(_e, '"]')) || u.getElementById(Pe) || u.createElement("style"), i.value.isConnected || (o.value = pe || t, zo(i.value, {
        type: "text/css",
        id: Pe,
        media: T,
        nonce: He
      }), b ? u.head.prepend(i.value) : u.head.appendChild(i.value), Wd(i.value, "data-primevue-style-id", _e), zo(i.value, ge), i.value.onload = function(Oe) {
        return C?.(Oe, {
          name: _e
        });
      }, $?.(_e)), !n.value && (H = lt(o, function(Oe) {
        i.value.textContent = Oe, z?.(_e);
      }, {
        immediate: !0
      }), n.value = !0);
    }
  }, ee = function() {
    !u || !n.value || (H(), Fd(i.value) && u.head.removeChild(i.value), n.value = !1, i.value = null);
  };
  return d && !f && cc(J), {
    id: x,
    name: g,
    el: i,
    css: o,
    unload: ee,
    load: J,
    isLoaded: ls(n)
  };
}
function co(t) {
  "@babel/helpers - typeof";
  return co = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, co(t);
}
var dr, cr, pr, mr;
function fr(t, e) {
  return vc(t) || bc(t, e) || hc(t, e) || fc();
}
function fc() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function hc(t, e) {
  if (t) {
    if (typeof t == "string") return hr(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? hr(t, e) : void 0;
  }
}
function hr(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function bc(t, e) {
  var n = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (n != null) {
    var o, i, a, l, u = [], s = !0, d = !1;
    try {
      if (a = (n = n.call(t)).next, e !== 0) for (; !(s = (o = a.call(n)).done) && (u.push(o.value), u.length !== e); s = !0) ;
    } catch (m) {
      d = !0, i = m;
    } finally {
      try {
        if (!s && n.return != null && (l = n.return(), Object(l) !== l)) return;
      } finally {
        if (d) throw i;
      }
    }
    return u;
  }
}
function vc(t) {
  if (Array.isArray(t)) return t;
}
function br(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    e && (o = o.filter(function(i) {
      return Object.getOwnPropertyDescriptor(t, i).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function Go(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? br(Object(n), !0).forEach(function(o) {
      gc(t, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : br(Object(n)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return t;
}
function gc(t, e, n) {
  return (e = yc(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function yc(t) {
  var e = kc(t, "string");
  return co(e) == "symbol" ? e : e + "";
}
function kc(t, e) {
  if (co(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (co(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
function Co(t, e) {
  return e || (e = t.slice(0)), Object.freeze(Object.defineProperties(t, { raw: { value: Object.freeze(e) } }));
}
var $c = function(e) {
  var n = e.dt;
  return `
.p-hidden-accessible {
    border: 0;
    clip: rect(0 0 0 0);
    height: 1px;
    margin: -1px;
    opacity: 0;
    overflow: hidden;
    padding: 0;
    pointer-events: none;
    position: absolute;
    white-space: nowrap;
    width: 1px;
}

.p-overflow-hidden {
    overflow: hidden;
    padding-right: `.concat(n("scrollbar.width"), `;
}
`);
}, Sc = {}, wc = {}, ze = {
  name: "base",
  css: $c,
  style: sc,
  classes: Sc,
  inlineStyles: wc,
  load: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(a) {
      return a;
    }, i = o(_o(dr || (dr = Co(["", ""])), e));
    return Se(i) ? mc(Kn(i), Go({
      name: this.name
    }, n)) : {};
  },
  loadCSS: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    return this.load(this.css, e);
  },
  loadStyle: function() {
    var e = this, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
    return this.load(this.style, n, function() {
      var i = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
      return ye.transformCSS(n.name || e.name, "".concat(i).concat(_o(cr || (cr = Co(["", ""])), o)));
    });
  },
  getCommonTheme: function(e) {
    return ye.getCommon(this.name, e);
  },
  getComponentTheme: function(e) {
    return ye.getComponent(this.name, e);
  },
  getDirectiveTheme: function(e) {
    return ye.getDirective(this.name, e);
  },
  getPresetTheme: function(e, n, o) {
    return ye.getCustomPreset(this.name, e, n, o);
  },
  getLayerOrderThemeCSS: function() {
    return ye.getLayerOrderCSS(this.name);
  },
  getStyleSheet: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.css) {
      var o = ut(this.css, {
        dt: vn
      }) || "", i = Kn(_o(pr || (pr = Co(["", "", ""])), o, e)), a = Object.entries(n).reduce(function(l, u) {
        var s = fr(u, 2), d = s[0], m = s[1];
        return l.push("".concat(d, '="').concat(m, '"')) && l;
      }, []).join(" ");
      return Se(i) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(a, ">").concat(i, "</style>") : "";
    }
    return "";
  },
  getCommonThemeStyleSheet: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return ye.getCommonStyleSheet(this.name, e, n);
  },
  getThemeStyleSheet: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = [ye.getStyleSheet(this.name, e, n)];
    if (this.style) {
      var i = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), a = _o(mr || (mr = Co(["", ""])), ut(this.style, {
        dt: vn
      })), l = Kn(ye.transformCSS(i, a)), u = Object.entries(n).reduce(function(s, d) {
        var m = fr(d, 2), f = m[0], v = m[1];
        return s.push("".concat(f, '="').concat(v, '"')) && s;
      }, []).join(" ");
      Se(l) && o.push('<style type="text/css" data-primevue-style-id="'.concat(i, '" ').concat(u, ">").concat(l, "</style>"));
    }
    return o.join("");
  },
  extend: function(e) {
    return Go(Go({}, this), {}, {
      css: void 0,
      style: void 0
    }, e);
  }
};
function _c() {
  var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pc", e = ki();
  return "".concat(t).concat(e.replace("v-", "").replaceAll("-", "_"));
}
var vr = ze.extend({
  name: "common"
});
function po(t) {
  "@babel/helpers - typeof";
  return po = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, po(t);
}
function Cc(t) {
  return Sa(t) || Oc(t) || $a(t) || ka();
}
function Oc(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Bn(t, e) {
  return Sa(t) || xc(t, e) || $a(t, e) || ka();
}
function ka() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function $a(t, e) {
  if (t) {
    if (typeof t == "string") return mi(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? mi(t, e) : void 0;
  }
}
function mi(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function xc(t, e) {
  var n = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (n != null) {
    var o, i, a, l, u = [], s = !0, d = !1;
    try {
      if (a = (n = n.call(t)).next, e === 0) {
        if (Object(n) !== n) return;
        s = !1;
      } else for (; !(s = (o = a.call(n)).done) && (u.push(o.value), u.length !== e); s = !0) ;
    } catch (m) {
      d = !0, i = m;
    } finally {
      try {
        if (!s && n.return != null && (l = n.return(), Object(l) !== l)) return;
      } finally {
        if (d) throw i;
      }
    }
    return u;
  }
}
function Sa(t) {
  if (Array.isArray(t)) return t;
}
function gr(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    e && (o = o.filter(function(i) {
      return Object.getOwnPropertyDescriptor(t, i).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function de(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? gr(Object(n), !0).forEach(function(o) {
      Rn(t, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : gr(Object(n)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return t;
}
function Rn(t, e, n) {
  return (e = Ic(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Ic(t) {
  var e = Pc(t, "string");
  return po(e) == "symbol" ? e : e + "";
}
function Pc(t, e) {
  if (po(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (po(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var xi = {
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
      handler: function(e) {
        Ue.off("theme:change", this._loadCoreStyles), e || (this._loadCoreStyles(), this._themeChangeListener(this._loadCoreStyles));
      }
    },
    dt: {
      immediate: !0,
      handler: function(e, n) {
        var o = this;
        Ue.off("theme:change", this._themeScopedListener), e ? (this._loadScopedThemeStyles(e), this._themeScopedListener = function() {
          return o._loadScopedThemeStyles(e);
        }, this._themeChangeListener(this._themeScopedListener)) : this._unloadScopedThemeStyles();
      }
    }
  },
  scopedStyleEl: void 0,
  rootEl: void 0,
  uid: void 0,
  $attrSelector: void 0,
  beforeCreate: function() {
    var e, n, o, i, a, l, u, s, d, m, f, v = (e = this.pt) === null || e === void 0 ? void 0 : e._usept, g = v ? (n = this.pt) === null || n === void 0 || (n = n.originalValue) === null || n === void 0 ? void 0 : n[this.$.type.name] : void 0, w = v ? (o = this.pt) === null || o === void 0 || (o = o.value) === null || o === void 0 ? void 0 : o[this.$.type.name] : this.pt;
    (i = w || g) === null || i === void 0 || (i = i.hooks) === null || i === void 0 || (a = i.onBeforeCreate) === null || a === void 0 || a.call(i);
    var x = (l = this.$primevueConfig) === null || l === void 0 || (l = l.pt) === null || l === void 0 ? void 0 : l._usept, S = x ? (u = this.$primevue) === null || u === void 0 || (u = u.config) === null || u === void 0 || (u = u.pt) === null || u === void 0 ? void 0 : u.originalValue : void 0, T = x ? (s = this.$primevue) === null || s === void 0 || (s = s.config) === null || s === void 0 || (s = s.pt) === null || s === void 0 ? void 0 : s.value : (d = this.$primevue) === null || d === void 0 || (d = d.config) === null || d === void 0 ? void 0 : d.pt;
    (m = T || S) === null || m === void 0 || (m = m[this.$.type.name]) === null || m === void 0 || (m = m.hooks) === null || m === void 0 || (f = m.onBeforeCreate) === null || f === void 0 || f.call(m), this.$attrSelector = _c(), this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
  },
  created: function() {
    this._hook("onCreated");
  },
  beforeMount: function() {
    var e;
    this.rootEl = Nd(yo(this.$el) ? this.$el : (e = this.$el) === null || e === void 0 ? void 0 : e.parentElement, "[".concat(this.$attrSelector, "]")), this.rootEl && (this.rootEl.$pc = de({
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
    _hook: function(e) {
      if (!this.$options.hostName) {
        var n = this._usePT(this._getPT(this.pt, this.$.type.name), this._getOptionValue, "hooks.".concat(e)), o = this._useDefaultPT(this._getOptionValue, "hooks.".concat(e));
        n?.(), o?.();
      }
    },
    _mergeProps: function(e) {
      for (var n = arguments.length, o = new Array(n > 1 ? n - 1 : 0), i = 1; i < n; i++)
        o[i - 1] = arguments[i];
      return Ci(e) ? e.apply(void 0, o) : K.apply(void 0, o);
    },
    _load: function() {
      an.isStyleNameLoaded("base") || (ze.loadCSS(this.$styleOptions), this._loadGlobalStyles(), an.setLoadedStyleName("base")), this._loadThemeStyles();
    },
    _loadStyles: function() {
      this._load(), this._themeChangeListener(this._load);
    },
    _loadCoreStyles: function() {
      var e, n;
      !an.isStyleNameLoaded((e = this.$style) === null || e === void 0 ? void 0 : e.name) && (n = this.$style) !== null && n !== void 0 && n.name && (vr.loadCSS(this.$styleOptions), this.$options.style && this.$style.loadCSS(this.$styleOptions), an.setLoadedStyleName(this.$style.name));
    },
    _loadGlobalStyles: function() {
      var e = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
      Se(e) && ze.load(e, de({
        name: "global"
      }, this.$styleOptions));
    },
    _loadThemeStyles: function() {
      var e, n;
      if (!(this.isUnstyled || this.$theme === "none")) {
        if (!ye.isStyleNameLoaded("common")) {
          var o, i, a = ((o = this.$style) === null || o === void 0 || (i = o.getCommonTheme) === null || i === void 0 ? void 0 : i.call(o)) || {}, l = a.primitive, u = a.semantic, s = a.global, d = a.style;
          ze.load(l?.css, de({
            name: "primitive-variables"
          }, this.$styleOptions)), ze.load(u?.css, de({
            name: "semantic-variables"
          }, this.$styleOptions)), ze.load(s?.css, de({
            name: "global-variables"
          }, this.$styleOptions)), ze.loadStyle(de({
            name: "global-style"
          }, this.$styleOptions), d), ye.setLoadedStyleName("common");
        }
        if (!ye.isStyleNameLoaded((e = this.$style) === null || e === void 0 ? void 0 : e.name) && (n = this.$style) !== null && n !== void 0 && n.name) {
          var m, f, v, g, w = ((m = this.$style) === null || m === void 0 || (f = m.getComponentTheme) === null || f === void 0 ? void 0 : f.call(m)) || {}, x = w.css, S = w.style;
          (v = this.$style) === null || v === void 0 || v.load(x, de({
            name: "".concat(this.$style.name, "-variables")
          }, this.$styleOptions)), (g = this.$style) === null || g === void 0 || g.loadStyle(de({
            name: "".concat(this.$style.name, "-style")
          }, this.$styleOptions), S), ye.setLoadedStyleName(this.$style.name);
        }
        if (!ye.isStyleNameLoaded("layer-order")) {
          var T, j, I = (T = this.$style) === null || T === void 0 || (j = T.getLayerOrderThemeCSS) === null || j === void 0 ? void 0 : j.call(T);
          ze.load(I, de({
            name: "layer-order",
            first: !0
          }, this.$styleOptions)), ye.setLoadedStyleName("layer-order");
        }
      }
    },
    _loadScopedThemeStyles: function(e) {
      var n, o, i, a = ((n = this.$style) === null || n === void 0 || (o = n.getPresetTheme) === null || o === void 0 ? void 0 : o.call(n, e, "[".concat(this.$attrSelector, "]"))) || {}, l = a.css, u = (i = this.$style) === null || i === void 0 ? void 0 : i.load(l, de({
        name: "".concat(this.$attrSelector, "-").concat(this.$style.name)
      }, this.$styleOptions));
      this.scopedStyleEl = u.el;
    },
    _unloadScopedThemeStyles: function() {
      var e;
      (e = this.scopedStyleEl) === null || e === void 0 || (e = e.value) === null || e === void 0 || e.remove();
    },
    _themeChangeListener: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
      };
      an.clearLoadedStyleNames(), Ue.on("theme:change", e);
    },
    _removeThemeListeners: function() {
      Ue.off("theme:change", this._loadCoreStyles), Ue.off("theme:change", this._load), Ue.off("theme:change", this._themeScopedListener);
    },
    _getHostInstance: function(e) {
      return e ? this.$options.hostName ? e.$.type.name === this.$options.hostName ? e : this._getHostInstance(e.$parentInstance) : e.$parentInstance : void 0;
    },
    _getPropValue: function(e) {
      var n;
      return this[e] || ((n = this._getHostInstance(this)) === null || n === void 0 ? void 0 : n[e]);
    },
    _getOptionValue: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return Oi(e, n, o);
    },
    _getPTValue: function() {
      var e, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, a = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, l = /./g.test(o) && !!i[o.split(".")[0]], u = this._getPropValue("ptOptions") || ((e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.ptOptions) || {}, s = u.mergeSections, d = s === void 0 ? !0 : s, m = u.mergeProps, f = m === void 0 ? !1 : m, v = a ? l ? this._useGlobalPT(this._getPTClassValue, o, i) : this._useDefaultPT(this._getPTClassValue, o, i) : void 0, g = l ? void 0 : this._getPTSelf(n, this._getPTClassValue, o, de(de({}, i), {}, {
        global: v || {}
      })), w = this._getPTDatasets(o);
      return d || !d && g ? f ? this._mergeProps(f, v, g, w) : de(de(de({}, v), g), w) : de(de({}, g), w);
    },
    _getPTSelf: function() {
      for (var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length, o = new Array(n > 1 ? n - 1 : 0), i = 1; i < n; i++)
        o[i - 1] = arguments[i];
      return K(
        this._usePT.apply(this, [this._getPT(e, this.$name)].concat(o)),
        // Exp; <component :pt="{}"
        this._usePT.apply(this, [this.$_attrsPT].concat(o))
        // Exp; <component :pt:[passthrough_key]:[attribute]="{value}" or <component :pt:[passthrough_key]="() =>{value}"
      );
    },
    _getPTDatasets: function() {
      var e, n, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", i = "data-pc-", a = o === "root" && Se((e = this.pt) === null || e === void 0 ? void 0 : e["data-pc-section"]);
      return o !== "transition" && de(de({}, o === "root" && de(de(Rn({}, "".concat(i, "name"), Vt(a ? (n = this.pt) === null || n === void 0 ? void 0 : n["data-pc-section"] : this.$.type.name)), a && Rn({}, "".concat(i, "extend"), Vt(this.$.type.name))), {}, Rn({}, "".concat(this.$attrSelector), ""))), {}, Rn({}, "".concat(i, "section"), Vt(o)));
    },
    _getPTClassValue: function() {
      var e = this._getOptionValue.apply(this, arguments);
      return Qe(e) || ca(e) ? {
        class: e
      } : e;
    },
    _getPT: function(e) {
      var n = this, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", i = arguments.length > 2 ? arguments[2] : void 0, a = function(u) {
        var s, d = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, m = i ? i(u) : u, f = Vt(o), v = Vt(n.$name);
        return (s = d ? f !== v ? m?.[f] : void 0 : m?.[f]) !== null && s !== void 0 ? s : m;
      };
      return e != null && e.hasOwnProperty("_usept") ? {
        _usept: e._usept,
        originalValue: a(e.originalValue),
        value: a(e.value)
      } : a(e, !0);
    },
    _usePT: function(e, n, o, i) {
      var a = function(x) {
        return n(x, o, i);
      };
      if (e != null && e.hasOwnProperty("_usept")) {
        var l, u = e._usept || ((l = this.$primevueConfig) === null || l === void 0 ? void 0 : l.ptOptions) || {}, s = u.mergeSections, d = s === void 0 ? !0 : s, m = u.mergeProps, f = m === void 0 ? !1 : m, v = a(e.originalValue), g = a(e.value);
        return v === void 0 && g === void 0 ? void 0 : Qe(g) ? g : Qe(v) ? v : d || !d && g ? f ? this._mergeProps(f, v, g) : de(de({}, v), g) : g;
      }
      return a(e);
    },
    _useGlobalPT: function(e, n, o) {
      return this._usePT(this.globalPT, e, n, o);
    },
    _useDefaultPT: function(e, n, o) {
      return this._usePT(this.defaultPT, e, n, o);
    },
    ptm: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this._getPTValue(this.pt, e, de(de({}, this.$params), n));
    },
    ptmi: function() {
      var e, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, i = K(this.$_attrsWithoutPT, this.ptm(n, o));
      return i?.hasOwnProperty("id") && ((e = i.id) !== null && e !== void 0 || (i.id = this.$id)), i;
    },
    ptmo: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return this._getPTValue(e, n, de({
        instance: this
      }, o), !1);
    },
    cx: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this.isUnstyled ? void 0 : this._getOptionValue(this.$style.classes, e, de(de({}, this.$params), n));
    },
    sx: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      if (n) {
        var i = this._getOptionValue(this.$style.inlineStyles, e, de(de({}, this.$params), o)), a = this._getOptionValue(vr.inlineStyles, e, de(de({}, this.$params), o));
        return [a, i];
      }
    }
  },
  computed: {
    globalPT: function() {
      var e, n = this;
      return this._getPT((e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.pt, void 0, function(o) {
        return ut(o, {
          instance: n
        });
      });
    },
    defaultPT: function() {
      var e, n = this;
      return this._getPT((e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.pt, void 0, function(o) {
        return n._getOptionValue(o, n.$name, de({}, n.$params)) || ut(o, de({}, n.$params));
      });
    },
    isUnstyled: function() {
      var e;
      return this.unstyled !== void 0 ? this.unstyled : (e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.unstyled;
    },
    $id: function() {
      return this.$attrs.id || this.uid;
    },
    $inProps: function() {
      var e, n = Object.keys(((e = this.$.vnode) === null || e === void 0 ? void 0 : e.props) || {});
      return Object.fromEntries(Object.entries(this.$props).filter(function(o) {
        var i = Bn(o, 1), a = i[0];
        return n?.includes(a);
      }));
    },
    $theme: function() {
      var e;
      return (e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.theme;
    },
    $style: function() {
      return de(de({
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
      var e;
      return {
        nonce: (e = this.$primevueConfig) === null || e === void 0 || (e = e.csp) === null || e === void 0 ? void 0 : e.nonce
      };
    },
    $primevueConfig: function() {
      var e;
      return (e = this.$primevue) === null || e === void 0 ? void 0 : e.config;
    },
    $name: function() {
      return this.$options.hostName || this.$.type.name;
    },
    $params: function() {
      var e = this._getHostInstance(this) || this.$parent;
      return {
        instance: this,
        props: this.$props,
        state: this.$data,
        attrs: this.$attrs,
        parent: {
          instance: e,
          props: e?.$props,
          state: e?.$data,
          attrs: e?.$attrs
        }
      };
    },
    $_attrsPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(e) {
        var n = Bn(e, 1), o = n[0];
        return o?.startsWith("pt:");
      }).reduce(function(e, n) {
        var o = Bn(n, 2), i = o[0], a = o[1], l = i.split(":"), u = Cc(l), s = mi(u).slice(1);
        return s?.reduce(function(d, m, f, v) {
          return !d[m] && (d[m] = f === v.length - 1 ? a : {}), d[m];
        }, e), e;
      }, {});
    },
    $_attrsWithoutPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(e) {
        var n = Bn(e, 1), o = n[0];
        return !(o != null && o.startsWith("pt:"));
      }).reduce(function(e, n) {
        var o = Bn(n, 2), i = o[0], a = o[1];
        return e[i] = a, e;
      }, {});
    }
  }
}, Tc = `
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
`, Lc = ze.extend({
  name: "baseicon",
  css: Tc
});
function mo(t) {
  "@babel/helpers - typeof";
  return mo = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, mo(t);
}
function yr(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    e && (o = o.filter(function(i) {
      return Object.getOwnPropertyDescriptor(t, i).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function kr(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? yr(Object(n), !0).forEach(function(o) {
      Ac(t, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : yr(Object(n)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return t;
}
function Ac(t, e, n) {
  return (e = Ec(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Ec(t) {
  var e = jc(t, "string");
  return mo(e) == "symbol" ? e : e + "";
}
function jc(t, e) {
  if (mo(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (mo(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Vc = {
  name: "BaseIcon",
  extends: xi,
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
  style: Lc,
  provide: function() {
    return {
      $pcIcon: this,
      $parentInstance: this
    };
  },
  methods: {
    pti: function() {
      var e = gn(this.label);
      return kr(kr({}, !this.isUnstyled && {
        class: ["p-icon", {
          "p-icon-spin": this.spin
        }]
      }), {}, {
        role: e ? void 0 : "img",
        "aria-label": e ? void 0 : this.label,
        "aria-hidden": e
      });
    }
  }
}, wa = {
  name: "SpinnerIcon",
  extends: Vc
};
function zc(t) {
  return Fc(t) || Bc(t) || Dc(t) || Mc();
}
function Mc() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Dc(t, e) {
  if (t) {
    if (typeof t == "string") return fi(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? fi(t, e) : void 0;
  }
}
function Bc(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Fc(t) {
  if (Array.isArray(t)) return fi(t);
}
function fi(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function Rc(t, e, n, o, i, a) {
  return p(), h("svg", K({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), zc(e[0] || (e[0] = [c("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
wa.render = Rc;
var Nc = `
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
`, Uc = {
  root: function(e) {
    var n = e.props, o = e.instance;
    return ["p-badge p-component", {
      "p-badge-circle": Se(n.value) && String(n.value).length === 1,
      "p-badge-dot": gn(n.value) && !o.$slots.default,
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
}, Hc = ze.extend({
  name: "badge",
  style: Nc,
  classes: Uc
}), Kc = {
  name: "BaseBadge",
  extends: xi,
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
  style: Hc,
  provide: function() {
    return {
      $pcBadge: this,
      $parentInstance: this
    };
  }
};
function fo(t) {
  "@babel/helpers - typeof";
  return fo = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, fo(t);
}
function $r(t, e, n) {
  return (e = qc(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function qc(t) {
  var e = Wc(t, "string");
  return fo(e) == "symbol" ? e : e + "";
}
function Wc(t, e) {
  if (fo(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (fo(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var _a = {
  name: "Badge",
  extends: Kc,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return Hn($r($r({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, Gc = ["data-p"];
function Zc(t, e, n, o, i, a) {
  return p(), h("span", K({
    class: t.cx("root"),
    "data-p": a.dataP
  }, t.ptmi("root")), [ae(t.$slots, "default", {}, function() {
    return [F(k(t.value), 1)];
  })], 16, Gc);
}
_a.render = Zc;
var Oo = da();
function ho(t) {
  "@babel/helpers - typeof";
  return ho = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, ho(t);
}
function Sr(t, e) {
  return Qc(t) || Jc(t, e) || Xc(t, e) || Yc();
}
function Yc() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Xc(t, e) {
  if (t) {
    if (typeof t == "string") return wr(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? wr(t, e) : void 0;
  }
}
function wr(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function Jc(t, e) {
  var n = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (n != null) {
    var o, i, a, l, u = [], s = !0, d = !1;
    try {
      if (a = (n = n.call(t)).next, e !== 0) for (; !(s = (o = a.call(n)).done) && (u.push(o.value), u.length !== e); s = !0) ;
    } catch (m) {
      d = !0, i = m;
    } finally {
      try {
        if (!s && n.return != null && (l = n.return(), Object(l) !== l)) return;
      } finally {
        if (d) throw i;
      }
    }
    return u;
  }
}
function Qc(t) {
  if (Array.isArray(t)) return t;
}
function _r(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    e && (o = o.filter(function(i) {
      return Object.getOwnPropertyDescriptor(t, i).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function fe(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? _r(Object(n), !0).forEach(function(o) {
      hi(t, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : _r(Object(n)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return t;
}
function hi(t, e, n) {
  return (e = ep(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function ep(t) {
  var e = tp(t, "string");
  return ho(e) == "symbol" ? e : e + "";
}
function tp(t, e) {
  if (ho(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (ho(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var le = {
  _getMeta: function() {
    return [sn(arguments.length <= 0 ? void 0 : arguments[0]) || arguments.length <= 0 ? void 0 : arguments[0], ut(sn(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getConfig: function(e, n) {
    var o, i, a;
    return (o = (e == null || (i = e.instance) === null || i === void 0 ? void 0 : i.$primevue) || (n == null || (a = n.ctx) === null || a === void 0 || (a = a.appContext) === null || a === void 0 || (a = a.config) === null || a === void 0 || (a = a.globalProperties) === null || a === void 0 ? void 0 : a.$primevue)) === null || o === void 0 ? void 0 : o.config;
  },
  _getOptionValue: Oi,
  _getPTValue: function() {
    var e, n, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, i = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", l = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, u = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, s = function() {
      var j = le._getOptionValue.apply(le, arguments);
      return Qe(j) || ca(j) ? {
        class: j
      } : j;
    }, d = ((e = o.binding) === null || e === void 0 || (e = e.value) === null || e === void 0 ? void 0 : e.ptOptions) || ((n = o.$primevueConfig) === null || n === void 0 ? void 0 : n.ptOptions) || {}, m = d.mergeSections, f = m === void 0 ? !0 : m, v = d.mergeProps, g = v === void 0 ? !1 : v, w = u ? le._useDefaultPT(o, o.defaultPT(), s, a, l) : void 0, x = le._usePT(o, le._getPT(i, o.$name), s, a, fe(fe({}, l), {}, {
      global: w || {}
    })), S = le._getPTDatasets(o, a);
    return f || !f && x ? g ? le._mergeProps(o, g, w, x, S) : fe(fe(fe({}, w), x), S) : fe(fe({}, x), S);
  },
  _getPTDatasets: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = "data-pc-";
    return fe(fe({}, n === "root" && hi({}, "".concat(o, "name"), Vt(e.$name))), {}, hi({}, "".concat(o, "section"), Vt(n)));
  },
  _getPT: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 ? arguments[2] : void 0, i = function(l) {
      var u, s = o ? o(l) : l, d = Vt(n);
      return (u = s?.[d]) !== null && u !== void 0 ? u : s;
    };
    return e && Object.hasOwn(e, "_usept") ? {
      _usept: e._usept,
      originalValue: i(e.originalValue),
      value: i(e.value)
    } : i(e);
  },
  _usePT: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, o = arguments.length > 2 ? arguments[2] : void 0, i = arguments.length > 3 ? arguments[3] : void 0, a = arguments.length > 4 ? arguments[4] : void 0, l = function(S) {
      return o(S, i, a);
    };
    if (n && Object.hasOwn(n, "_usept")) {
      var u, s = n._usept || ((u = e.$primevueConfig) === null || u === void 0 ? void 0 : u.ptOptions) || {}, d = s.mergeSections, m = d === void 0 ? !0 : d, f = s.mergeProps, v = f === void 0 ? !1 : f, g = l(n.originalValue), w = l(n.value);
      return g === void 0 && w === void 0 ? void 0 : Qe(w) ? w : Qe(g) ? g : m || !m && w ? v ? le._mergeProps(e, v, g, w) : fe(fe({}, g), w) : w;
    }
    return l(n);
  },
  _useDefaultPT: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = arguments.length > 2 ? arguments[2] : void 0, i = arguments.length > 3 ? arguments[3] : void 0, a = arguments.length > 4 ? arguments[4] : void 0;
    return le._usePT(e, n, o, i, a);
  },
  _loadStyles: function() {
    var e, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 ? arguments[1] : void 0, i = arguments.length > 2 ? arguments[2] : void 0, a = le._getConfig(o, i), l = {
      nonce: a == null || (e = a.csp) === null || e === void 0 ? void 0 : e.nonce
    };
    le._loadCoreStyles(n, l), le._loadThemeStyles(n, l), le._loadScopedThemeStyles(n, l), le._removeThemeListeners(n), n.$loadStyles = function() {
      return le._loadThemeStyles(n, l);
    }, le._themeChangeListener(n.$loadStyles);
  },
  _loadCoreStyles: function() {
    var e, n, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, i = arguments.length > 1 ? arguments[1] : void 0;
    if (!an.isStyleNameLoaded((e = o.$style) === null || e === void 0 ? void 0 : e.name) && (n = o.$style) !== null && n !== void 0 && n.name) {
      var a;
      ze.loadCSS(i), (a = o.$style) === null || a === void 0 || a.loadCSS(i), an.setLoadedStyleName(o.$style.name);
    }
  },
  _loadThemeStyles: function() {
    var e, n, o, i = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, a = arguments.length > 1 ? arguments[1] : void 0;
    if (!(i != null && i.isUnstyled() || (i == null || (e = i.theme) === null || e === void 0 ? void 0 : e.call(i)) === "none")) {
      if (!ye.isStyleNameLoaded("common")) {
        var l, u, s = ((l = i.$style) === null || l === void 0 || (u = l.getCommonTheme) === null || u === void 0 ? void 0 : u.call(l)) || {}, d = s.primitive, m = s.semantic, f = s.global, v = s.style;
        ze.load(d?.css, fe({
          name: "primitive-variables"
        }, a)), ze.load(m?.css, fe({
          name: "semantic-variables"
        }, a)), ze.load(f?.css, fe({
          name: "global-variables"
        }, a)), ze.loadStyle(fe({
          name: "global-style"
        }, a), v), ye.setLoadedStyleName("common");
      }
      if (!ye.isStyleNameLoaded((n = i.$style) === null || n === void 0 ? void 0 : n.name) && (o = i.$style) !== null && o !== void 0 && o.name) {
        var g, w, x, S, T = ((g = i.$style) === null || g === void 0 || (w = g.getDirectiveTheme) === null || w === void 0 ? void 0 : w.call(g)) || {}, j = T.css, I = T.style;
        (x = i.$style) === null || x === void 0 || x.load(j, fe({
          name: "".concat(i.$style.name, "-variables")
        }, a)), (S = i.$style) === null || S === void 0 || S.loadStyle(fe({
          name: "".concat(i.$style.name, "-style")
        }, a), I), ye.setLoadedStyleName(i.$style.name);
      }
      if (!ye.isStyleNameLoaded("layer-order")) {
        var y, b, W = (y = i.$style) === null || y === void 0 || (b = y.getLayerOrderThemeCSS) === null || b === void 0 ? void 0 : b.call(y);
        ze.load(W, fe({
          name: "layer-order",
          first: !0
        }, a)), ye.setLoadedStyleName("layer-order");
      }
    }
  },
  _loadScopedThemeStyles: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, o = e.preset();
    if (o && e.$attrSelector) {
      var i, a, l, u = ((i = e.$style) === null || i === void 0 || (a = i.getPresetTheme) === null || a === void 0 ? void 0 : a.call(i, o, "[".concat(e.$attrSelector, "]"))) || {}, s = u.css, d = (l = e.$style) === null || l === void 0 ? void 0 : l.load(s, fe({
        name: "".concat(e.$attrSelector, "-").concat(e.$style.name)
      }, n));
      e.scopedStyleEl = d.el;
    }
  },
  _themeChangeListener: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
    };
    an.clearLoadedStyleNames(), Ue.on("theme:change", e);
  },
  _removeThemeListeners: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    Ue.off("theme:change", e.$loadStyles), e.$loadStyles = void 0;
  },
  _hook: function(e, n, o, i, a, l) {
    var u, s, d = "on".concat(Zd(n)), m = le._getConfig(i, a), f = o?.$instance, v = le._usePT(f, le._getPT(i == null || (u = i.value) === null || u === void 0 ? void 0 : u.pt, e), le._getOptionValue, "hooks.".concat(d)), g = le._useDefaultPT(f, m == null || (s = m.pt) === null || s === void 0 || (s = s.directives) === null || s === void 0 ? void 0 : s[e], le._getOptionValue, "hooks.".concat(d)), w = {
      el: o,
      binding: i,
      vnode: a,
      prevVnode: l
    };
    v?.(f, w), g?.(f, w);
  },
  /* eslint-disable-next-line no-unused-vars */
  _mergeProps: function() {
    for (var e = arguments.length > 1 ? arguments[1] : void 0, n = arguments.length, o = new Array(n > 2 ? n - 2 : 0), i = 2; i < n; i++)
      o[i - 2] = arguments[i];
    return Ci(e) ? e.apply(void 0, o) : K.apply(void 0, o);
  },
  _extend: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = function(u, s, d, m, f) {
      var v, g, w, x;
      s._$instances = s._$instances || {};
      var S = le._getConfig(d, m), T = s._$instances[e] || {}, j = gn(T) ? fe(fe({}, n), n?.methods) : {};
      s._$instances[e] = fe(fe({}, T), {}, {
        /* new instance variables to pass in directive methods */
        $name: e,
        $host: s,
        $binding: d,
        $modifiers: d?.modifiers,
        $value: d?.value,
        $el: T.$el || s || void 0,
        $style: fe({
          classes: void 0,
          inlineStyles: void 0,
          load: function() {
          },
          loadCSS: function() {
          },
          loadStyle: function() {
          }
        }, n?.style),
        $primevueConfig: S,
        $attrSelector: (v = s.$pd) === null || v === void 0 || (v = v[e]) === null || v === void 0 ? void 0 : v.attrSelector,
        /* computed instance variables */
        defaultPT: function() {
          return le._getPT(S?.pt, void 0, function(y) {
            var b;
            return y == null || (b = y.directives) === null || b === void 0 ? void 0 : b[e];
          });
        },
        isUnstyled: function() {
          var y, b;
          return ((y = s._$instances[e]) === null || y === void 0 || (y = y.$binding) === null || y === void 0 || (y = y.value) === null || y === void 0 ? void 0 : y.unstyled) !== void 0 ? (b = s._$instances[e]) === null || b === void 0 || (b = b.$binding) === null || b === void 0 || (b = b.value) === null || b === void 0 ? void 0 : b.unstyled : S?.unstyled;
        },
        theme: function() {
          var y;
          return (y = s._$instances[e]) === null || y === void 0 || (y = y.$primevueConfig) === null || y === void 0 ? void 0 : y.theme;
        },
        preset: function() {
          var y;
          return (y = s._$instances[e]) === null || y === void 0 || (y = y.$binding) === null || y === void 0 || (y = y.value) === null || y === void 0 ? void 0 : y.dt;
        },
        /* instance's methods */
        ptm: function() {
          var y, b = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", W = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return le._getPTValue(s._$instances[e], (y = s._$instances[e]) === null || y === void 0 || (y = y.$binding) === null || y === void 0 || (y = y.value) === null || y === void 0 ? void 0 : y.pt, b, fe({}, W));
        },
        ptmo: function() {
          var y = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, b = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", W = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return le._getPTValue(s._$instances[e], y, b, W, !1);
        },
        cx: function() {
          var y, b, W = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", $ = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return (y = s._$instances[e]) !== null && y !== void 0 && y.isUnstyled() ? void 0 : le._getOptionValue((b = s._$instances[e]) === null || b === void 0 || (b = b.$style) === null || b === void 0 ? void 0 : b.classes, W, fe({}, $));
        },
        sx: function() {
          var y, b = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", W = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, $ = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return W ? le._getOptionValue((y = s._$instances[e]) === null || y === void 0 || (y = y.$style) === null || y === void 0 ? void 0 : y.inlineStyles, b, fe({}, $)) : void 0;
        }
      }, j), s.$instance = s._$instances[e], (g = (w = s.$instance)[u]) === null || g === void 0 || g.call(w, s, d, m, f), s["$".concat(e)] = s.$instance, le._hook(e, u, s, d, m, f), s.$pd || (s.$pd = {}), s.$pd[e] = fe(fe({}, (x = s.$pd) === null || x === void 0 ? void 0 : x[e]), {}, {
        name: e,
        instance: s._$instances[e]
      });
    }, i = function(u) {
      var s, d, m, f = u._$instances[e], v = f?.watch, g = function(S) {
        var T, j = S.newValue, I = S.oldValue;
        return v == null || (T = v.config) === null || T === void 0 ? void 0 : T.call(f, j, I);
      }, w = function(S) {
        var T, j = S.newValue, I = S.oldValue;
        return v == null || (T = v["config.ripple"]) === null || T === void 0 ? void 0 : T.call(f, j, I);
      };
      f.$watchersCallback = {
        config: g,
        "config.ripple": w
      }, v == null || (s = v.config) === null || s === void 0 || s.call(f, f?.$primevueConfig), Oo.on("config:change", g), v == null || (d = v["config.ripple"]) === null || d === void 0 || d.call(f, f == null || (m = f.$primevueConfig) === null || m === void 0 ? void 0 : m.ripple), Oo.on("config:ripple:change", w);
    }, a = function(u) {
      var s = u._$instances[e].$watchersCallback;
      s && (Oo.off("config:change", s.config), Oo.off("config:ripple:change", s["config.ripple"]), u._$instances[e].$watchersCallback = void 0);
    };
    return {
      created: function(u, s, d, m) {
        u.$pd || (u.$pd = {}), u.$pd[e] = {
          name: e,
          attrSelector: Yd("pd")
        }, o("created", u, s, d, m);
      },
      beforeMount: function(u, s, d, m) {
        var f;
        le._loadStyles((f = u.$pd[e]) === null || f === void 0 ? void 0 : f.instance, s, d), o("beforeMount", u, s, d, m), i(u);
      },
      mounted: function(u, s, d, m) {
        var f;
        le._loadStyles((f = u.$pd[e]) === null || f === void 0 ? void 0 : f.instance, s, d), o("mounted", u, s, d, m);
      },
      beforeUpdate: function(u, s, d, m) {
        o("beforeUpdate", u, s, d, m);
      },
      updated: function(u, s, d, m) {
        var f;
        le._loadStyles((f = u.$pd[e]) === null || f === void 0 ? void 0 : f.instance, s, d), o("updated", u, s, d, m);
      },
      beforeUnmount: function(u, s, d, m) {
        var f;
        a(u), le._removeThemeListeners((f = u.$pd[e]) === null || f === void 0 ? void 0 : f.instance), o("beforeUnmount", u, s, d, m);
      },
      unmounted: function(u, s, d, m) {
        var f;
        (f = u.$pd[e]) === null || f === void 0 || (f = f.instance) === null || f === void 0 || (f = f.scopedStyleEl) === null || f === void 0 || (f = f.value) === null || f === void 0 || f.remove(), o("unmounted", u, s, d, m);
      }
    };
  },
  extend: function() {
    var e = le._getMeta.apply(le, arguments), n = Sr(e, 2), o = n[0], i = n[1];
    return fe({
      extend: function() {
        var l = le._getMeta.apply(le, arguments), u = Sr(l, 2), s = u[0], d = u[1];
        return le.extend(s, fe(fe(fe({}, i), i?.methods), d));
      }
    }, le._extend(o, i));
  }
}, np = `
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
`, op = {
  root: "p-ink"
}, ip = ze.extend({
  name: "ripple-directive",
  style: np,
  classes: op
}), rp = le.extend({
  style: ip
});
function bo(t) {
  "@babel/helpers - typeof";
  return bo = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, bo(t);
}
function ap(t) {
  return dp(t) || up(t) || lp(t) || sp();
}
function sp() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function lp(t, e) {
  if (t) {
    if (typeof t == "string") return bi(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? bi(t, e) : void 0;
  }
}
function up(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function dp(t) {
  if (Array.isArray(t)) return bi(t);
}
function bi(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function Cr(t, e, n) {
  return (e = cp(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function cp(t) {
  var e = pp(t, "string");
  return bo(e) == "symbol" ? e : e + "";
}
function pp(t, e) {
  if (bo(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (bo(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var mp = rp.extend("ripple", {
  watch: {
    "config.ripple": function(e) {
      e ? (this.createRipple(this.$host), this.bindEvents(this.$host), this.$host.setAttribute("data-pd-ripple", !0), this.$host.style.overflow = "hidden", this.$host.style.position = "relative") : (this.remove(this.$host), this.$host.removeAttribute("data-pd-ripple"));
    }
  },
  unmounted: function(e) {
    this.remove(e);
  },
  timeout: void 0,
  methods: {
    bindEvents: function(e) {
      e.addEventListener("mousedown", this.onMouseDown.bind(this));
    },
    unbindEvents: function(e) {
      e.removeEventListener("mousedown", this.onMouseDown.bind(this));
    },
    createRipple: function(e) {
      var n = this.getInk(e);
      n || (n = Rd("span", Cr(Cr({
        role: "presentation",
        "aria-hidden": !0,
        "data-p-ink": !0,
        "data-p-ink-active": !1,
        class: !this.isUnstyled() && this.cx("root"),
        onAnimationEnd: this.onAnimationEnd.bind(this)
      }, this.$attrSelector, ""), "p-bind", this.ptm("root"))), e.appendChild(n), this.$el = n);
    },
    remove: function(e) {
      var n = this.getInk(e);
      n && (this.$host.style.overflow = "", this.$host.style.position = "", this.unbindEvents(e), n.removeEventListener("animationend", this.onAnimationEnd), n.remove());
    },
    onMouseDown: function(e) {
      var n = this, o = e.currentTarget, i = this.getInk(o);
      if (!(!i || getComputedStyle(i, null).display === "none")) {
        if (!this.isUnstyled() && qo(i, "p-ink-active"), i.setAttribute("data-p-ink-active", "false"), !ir(i) && !rr(i)) {
          var a = Math.max(Dd(o), Kd(o));
          i.style.height = a + "px", i.style.width = a + "px";
        }
        var l = Hd(o), u = e.pageX - l.left + document.body.scrollTop - rr(i) / 2, s = e.pageY - l.top + document.body.scrollLeft - ir(i) / 2;
        i.style.top = s + "px", i.style.left = u + "px", !this.isUnstyled() && Md(i, "p-ink-active"), i.setAttribute("data-p-ink-active", "true"), this.timeout = setTimeout(function() {
          i && (!n.isUnstyled() && qo(i, "p-ink-active"), i.setAttribute("data-p-ink-active", "false"));
        }, 401);
      }
    },
    onAnimationEnd: function(e) {
      this.timeout && clearTimeout(this.timeout), !this.isUnstyled() && qo(e.currentTarget, "p-ink-active"), e.currentTarget.setAttribute("data-p-ink-active", "false");
    },
    getInk: function(e) {
      return e && e.children ? ap(e.children).find(function(n) {
        return Ud(n, "data-pc-name") === "ripple";
      }) : void 0;
    }
  }
}), fp = `
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
function vo(t) {
  "@babel/helpers - typeof";
  return vo = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, vo(t);
}
function jt(t, e, n) {
  return (e = hp(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function hp(t) {
  var e = bp(t, "string");
  return vo(e) == "symbol" ? e : e + "";
}
function bp(t, e) {
  if (vo(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (vo(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var vp = {
  root: function(e) {
    var n = e.instance, o = e.props;
    return ["p-button p-component", jt(jt(jt(jt(jt(jt(jt(jt(jt({
      "p-button-icon-only": n.hasIcon && !o.label && !o.badge,
      "p-button-vertical": (o.iconPos === "top" || o.iconPos === "bottom") && o.label,
      "p-button-loading": o.loading,
      "p-button-link": o.link || o.variant === "link"
    }, "p-button-".concat(o.severity), o.severity), "p-button-raised", o.raised), "p-button-rounded", o.rounded), "p-button-text", o.text || o.variant === "text"), "p-button-outlined", o.outlined || o.variant === "outlined"), "p-button-sm", o.size === "small"), "p-button-lg", o.size === "large"), "p-button-plain", o.plain), "p-button-fluid", n.hasFluid)];
  },
  loadingIcon: "p-button-loading-icon",
  icon: function(e) {
    var n = e.props;
    return ["p-button-icon", jt({}, "p-button-icon-".concat(n.iconPos), n.label)];
  },
  label: "p-button-label"
}, gp = ze.extend({
  name: "button",
  style: fp,
  classes: vp
}), yp = {
  name: "BaseButton",
  extends: xi,
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
  style: gp,
  provide: function() {
    return {
      $pcButton: this,
      $parentInstance: this
    };
  }
};
function go(t) {
  "@babel/helpers - typeof";
  return go = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, go(t);
}
function Ye(t, e, n) {
  return (e = kp(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function kp(t) {
  var e = $p(t, "string");
  return go(e) == "symbol" ? e : e + "";
}
function $p(t, e) {
  if (go(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (go(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Ca = {
  name: "Button",
  extends: yp,
  inheritAttrs: !1,
  inject: {
    $pcFluid: {
      default: null
    }
  },
  methods: {
    getPTOptions: function(e) {
      var n = e === "root" ? this.ptmi : this.ptm;
      return n(e, {
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
      return K(this.asAttrs, this.a11yAttrs, this.getPTOptions("root"));
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
      return gn(this.fluid) ? !!this.$pcFluid : this.fluid;
    },
    dataP: function() {
      return Hn(Ye(Ye(Ye(Ye(Ye(Ye(Ye(Ye(Ye(Ye({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
    },
    dataIconP: function() {
      return Hn(Ye(Ye({}, this.iconPos, this.iconPos), this.size, this.size));
    },
    dataLabelP: function() {
      return Hn(Ye(Ye({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
    }
  },
  components: {
    SpinnerIcon: wa,
    Badge: _a
  },
  directives: {
    ripple: mp
  }
}, Sp = ["data-p"], wp = ["data-p"];
function _p(t, e, n, o, i, a) {
  var l = Ve("SpinnerIcon"), u = Ve("Badge"), s = Bo("ripple");
  return t.asChild ? ae(t.$slots, "default", {
    key: 1,
    class: oe(t.cx("root")),
    a11yAttrs: a.a11yAttrs
  }) : Xe((p(), xe(Ln(t.as), K({
    key: 0,
    class: t.cx("root"),
    "data-p": a.dataP
  }, a.attrs), {
    default: Ie(function() {
      return [ae(t.$slots, "default", {}, function() {
        return [t.loading ? ae(t.$slots, "loadingicon", K({
          key: 0,
          class: [t.cx("loadingIcon"), t.cx("icon")]
        }, t.ptm("loadingIcon")), function() {
          return [t.loadingIcon ? (p(), h("span", K({
            key: 0,
            class: [t.cx("loadingIcon"), t.cx("icon"), t.loadingIcon]
          }, t.ptm("loadingIcon")), null, 16)) : (p(), xe(l, K({
            key: 1,
            class: [t.cx("loadingIcon"), t.cx("icon")],
            spin: ""
          }, t.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : ae(t.$slots, "icon", K({
          key: 1,
          class: [t.cx("icon")]
        }, t.ptm("icon")), function() {
          return [t.icon ? (p(), h("span", K({
            key: 0,
            class: [t.cx("icon"), t.icon, t.iconClass],
            "data-p": a.dataIconP
          }, t.ptm("icon")), null, 16, Sp)) : _("", !0)];
        }), t.label ? (p(), h("span", K({
          key: 2,
          class: t.cx("label")
        }, t.ptm("label"), {
          "data-p": a.dataLabelP
        }), k(t.label), 17, wp)) : _("", !0), t.badge ? (p(), xe(u, {
          key: 3,
          value: t.badge,
          class: oe(t.badgeClass),
          severity: t.badgeSeverity,
          unstyled: t.unstyled,
          pt: t.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : _("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[s]]);
}
Ca.render = _p;
const Cp = ["aria-label", "aria-busy"], Op = /* @__PURE__ */ En({
  __name: "NativeDialog",
  props: {
    visible: { type: Boolean },
    busy: { type: Boolean },
    label: {},
    headerClass: {},
    contentClass: {},
    footerClass: {}
  },
  emits: ["close"],
  setup(t, { emit: e }) {
    const n = t, o = e, i = U(null);
    async function a() {
      await An();
      const u = i.value;
      u && (n.visible && !u.open ? u.showModal() : !n.visible && u.open && u.close());
    }
    function l(u) {
      u.preventDefault(), n.busy || o("close");
    }
    return lt(() => n.visible, a), Fo(a), Nr(() => {
      i.value?.open && i.value.close();
    }), (u, s) => (p(), h("dialog", {
      ref_key: "dialog",
      ref: i,
      class: "kx-native-dialog",
      "aria-label": t.label,
      "aria-modal": "true",
      "aria-busy": t.busy || void 0,
      onCancel: l,
      onClose: s[1] || (s[1] = () => {
        t.visible && !t.busy && o("close");
      })
    }, [
      c("header", {
        class: oe(t.headerClass)
      }, [
        ae(u.$slots, "header"),
        P(r(Ca), {
          type: "button",
          text: "",
          severity: "secondary",
          "aria-label": "Close dialog",
          disabled: t.busy,
          onClick: s[0] || (s[0] = (d) => o("close"))
        }, {
          default: Ie(() => [...s[2] || (s[2] = [
            F("×", -1)
          ])]),
          _: 1
        }, 8, ["disabled"])
      ], 2),
      c("div", {
        class: oe(t.contentClass)
      }, [
        ae(u.$slots, "default")
      ], 2),
      u.$slots.footer ? (p(), h("footer", {
        key: 0,
        class: oe(t.footerClass)
      }, [
        ae(u.$slots, "footer")
      ], 2)) : _("", !0)
    ], 40, Cp));
  }
}), xp = ["aria-expanded", "aria-controls", "aria-label", "disabled"], Ip = { class: "p-select-label" }, Pp = {
  key: 0,
  class: "kx-ps-val"
}, Tp = { class: "kx-ps-val-label" }, Lp = {
  key: 1,
  class: "kx-ps-ph"
}, Ap = { class: "p-select-dropdown" }, Ep = { class: "p-select-overlay kx-ps-panel" }, jp = { class: "p-select-header" }, Vp = ["aria-label", "aria-controls", "aria-activedescendant"], zp = ["id", "aria-label"], Mp = {
  class: "p-select-option-group",
  role: "presentation"
}, Dp = ["id", "aria-selected", "onClick", "onMousemove"], Bp = { class: "kx-ps-opt-body" }, Fp = { class: "kx-ps-opt-title" }, Rp = {
  key: 0,
  class: "kx-ps-opt-sub"
}, Np = {
  key: 0,
  class: "p-select-empty-message",
  role: "status"
}, Up = {
  key: 1,
  class: "p-select-empty-message",
  role: "presentation"
}, Hp = {
  key: 0,
  class: "p-select-empty-message",
  role: "alert"
}, Kp = ["disabled"], Or = /* @__PURE__ */ En({
  __name: "PickerSelect",
  props: {
    items: {},
    modelValue: {},
    placeholder: {},
    ariaLabel: {},
    disabled: { type: Boolean },
    remote: { type: Boolean },
    loading: { type: Boolean },
    more: { type: Boolean },
    error: {}
  },
  emits: ["update:modelValue", "search", "more"],
  setup(t, { emit: e }) {
    const n = t, o = e, i = U(null), a = U(null), l = U(!1), u = U(""), s = U(0), d = ki(), m = G(() => {
      const S = u.value.trim().toLowerCase(), T = /* @__PURE__ */ new Map();
      for (const I of n.items) {
        if (!n.remote && S && ![I.title, I.subtitle, I.id, I.group].some((W) => W?.toLowerCase().includes(S))) continue;
        const y = I.group || "Other", b = T.get(y);
        b ? b.push(I) : T.set(y, [I]);
      }
      let j = 0;
      return [...T.entries()].sort((I, y) => I[0].localeCompare(y[0])).map(([I, y]) => ({ group: I, items: y.map((b) => ({ item: b, index: j++ })) }));
    }), f = G(() => m.value.flatMap((S) => S.items)), v = G(() => n.items.find((S) => S.id === n.modelValue)), g = G(() => f.value[s.value] ? `${d}-${s.value}` : void 0);
    lt(u, () => {
      s.value = 0;
    }), lt([l, u], ([S, T]) => {
      S && n.remote && o("search", T);
    }), lt(() => n.disabled, (S) => {
      S && (l.value = !1);
    }), lt(l, async (S) => {
      if (!S) {
        i.value?.focus();
        return;
      }
      u.value = "", s.value = Math.max(0, f.value.findIndex(({ item: T }) => T.id === n.modelValue)), await An(), a.value?.focus();
    });
    function w(S) {
      n.disabled || n.loading || (o("update:modelValue", S.id), l.value = !1);
    }
    async function x(S) {
      if (S.key === "Escape" && l.value) {
        S.preventDefault(), S.stopPropagation(), l.value = !1;
        return;
      }
      if (!["ArrowDown", "ArrowUp", "Home", "End", "Enter"].includes(S.key)) return;
      if (S.preventDefault(), !l.value) {
        l.value = !0;
        return;
      }
      if (S.key === "Enter") {
        const I = f.value[s.value];
        I && w(I.item);
        return;
      }
      const T = f.value.length - 1;
      s.value = S.key === "Home" ? 0 : S.key === "End" ? T : Math.max(0, Math.min(T, s.value + (S.key === "ArrowDown" ? 1 : -1))), await An(), i.value?.getRootNode()?.querySelector(`[id="${g.value}"]`)?.scrollIntoView({ block: "nearest" });
    }
    return (S, T) => (p(), h(X, null, [
      c("button", {
        ref_key: "anchor",
        ref: i,
        type: "button",
        class: "kx-ps p-select",
        role: "combobox",
        "aria-haspopup": "listbox",
        "aria-expanded": l.value,
        "aria-controls": r(d),
        "aria-label": t.ariaLabel,
        disabled: t.disabled,
        onClick: T[0] || (T[0] = (j) => l.value = !l.value),
        onKeydown: x
      }, [
        c("span", Ip, [
          v.value ? (p(), h("span", Pp, [
            P(r(M), {
              icon: v.value.icon || "tabler:point",
              class: "kx-ps-val-ico",
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            c("span", Tp, k(v.value.title), 1)
          ])) : (p(), h("span", Lp, k(t.placeholder || "Select…"), 1))
        ]),
        c("span", Ap, [
          P(r(M), {
            icon: "tabler:chevron-down",
            "aria-hidden": "true"
          })
        ])
      ], 40, xp),
      P(ua, {
        open: l.value,
        "onUpdate:open": T[3] || (T[3] = (j) => l.value = j),
        anchor: i.value
      }, {
        default: Ie(() => [
          c("div", Ep, [
            c("div", jp, [
              Xe(c("input", {
                ref_key: "search",
                ref: a,
                "onUpdate:modelValue": T[1] || (T[1] = (j) => u.value = j),
                type: "search",
                class: "p-inputtext p-select-filter",
                "aria-label": `Search ${t.ariaLabel || t.placeholder || "options"}`,
                "aria-controls": r(d),
                "aria-activedescendant": g.value,
                onKeydown: x
              }, null, 40, Vp), [
                [Po, u.value]
              ])
            ]),
            c("ul", {
              id: r(d),
              class: "p-select-list kx-ps-options",
              role: "listbox",
              "aria-label": t.ariaLabel || t.placeholder || "Options"
            }, [
              (p(!0), h(X, null, ce(m.value, (j) => (p(), h(X, {
                key: j.group
              }, [
                c("li", Mp, k(j.group), 1),
                (p(!0), h(X, null, ce(j.items, ({ item: I, index: y }) => (p(), h("li", {
                  id: `${r(d)}-${y}`,
                  key: I.id,
                  class: oe(["p-select-option kx-ps-option", { "p-select-option-selected": I.id === t.modelValue, "p-focus": y === s.value }]),
                  role: "option",
                  "aria-selected": I.id === t.modelValue,
                  onClick: (b) => w(I),
                  onMousemove: (b) => s.value = y
                }, [
                  P(r(M), {
                    icon: I.icon || "tabler:point",
                    class: "kx-ps-opt-ico",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"]),
                  c("span", Bp, [
                    c("span", Fp, k(I.title), 1),
                    I.subtitle ? (p(), h("span", Rp, k(I.subtitle), 1)) : _("", !0)
                  ])
                ], 42, Dp))), 128))
              ], 64))), 128)),
              t.loading ? (p(), h("li", Np, "Loading…")) : !f.value.length && !t.error ? (p(), h("li", Up, "No matches")) : _("", !0)
            ], 8, zp),
            t.error ? (p(), h("div", Hp, k(t.error), 1)) : _("", !0),
            t.more ? (p(), h("button", {
              key: 1,
              type: "button",
              class: "p-button p-button-secondary",
              "data-testid": "picker-more",
              disabled: t.loading || t.disabled,
              onClick: T[2] || (T[2] = (j) => o("more"))
            }, "Load more", 8, Kp)) : _("", !0)
          ])
        ]),
        _: 1
      }, 8, ["open", "anchor"])
    ], 64));
  }
});
function vi() {
  return { status: "idle", modules: [], findings: [], scanned: 0, total: 0 };
}
function qp(t) {
  return t.some((e) => e.severity === "critical") ? "critical" : t.length > 0 ? "warnings" : "clean";
}
const xr = {
  info: { label: "Info", icon: "tabler:info-circle", tone: "info" },
  warning: { label: "Warning", icon: "tabler:alert-triangle", tone: "warn" },
  critical: { label: "Critical", icon: "tabler:shield-x", tone: "danger" }
};
function Wp(t) {
  return t.severity !== "critical";
}
const Gp = ["clean", "warnings", "critical", "error", "unavailable", "skipped"];
function Ir(t) {
  return Gp.includes(t) ? t : "clean";
}
function Zp(t) {
  return t === "critical" ? "critical" : t === "warning" ? "warning" : "info";
}
function Yp(t) {
  const e = t && typeof t == "object" ? t : {}, n = [], o = [];
  for (const u of e.modules || []) {
    const s = String(u.module || ""), d = u.version ? String(u.version) : void 0, m = (u.findings || []).map((f, v) => ({
      id: `${s}#${v}`,
      module: s,
      version: d,
      severity: Zp(f.severity),
      title: String(f.title || "Issue"),
      detail: f.detail ? String(f.detail) : void 0,
      location: f.location ? String(f.location) : void 0
    }));
    for (const f of m) o.push(f);
    n.push({
      module: s,
      version: d,
      status: Ir(u.status),
      summary: u.summary ? String(u.summary) : void 0,
      findings: m
    });
  }
  const i = typeof e.total == "number" ? e.total : n.length, a = typeof e.scanned == "number" ? e.scanned : n.length;
  return {
    status: e.overall_status ? Ir(e.overall_status) : qp(o),
    summary: e.overall_summary ? String(e.overall_summary) : void 0,
    modules: n,
    findings: o,
    scanned: a,
    total: i
  };
}
function Xp({ props: t, hub: e, plan: n, activeSection: o, versionArg: i, requirementPayload: a, invalidatePlan: l, refreshPlan: u, planCurrent: s }) {
  const d = U([]), m = U({}), f = U({}), v = G(() => {
    const A = /* @__PURE__ */ new Map();
    for (const B of d.value) {
      const R = String(B.module || "");
      A.has(R) || A.set(R, []), A.get(R).push(B);
    }
    return Array.from(A.entries()).map(([B, R]) => ({ module: B, items: R, direct: !R.every((q) => xo(q, t.component)) })).sort((B, R) => B.direct === R.direct ? B.module.localeCompare(R.module) : B.direct ? -1 : 1);
  }), g = G(() => d.value.filter((A) => !xo(A, t.component))), w = G(() => d.value.filter((A) => !Pe(A))), x = G(() => d.value.length - g.value.length), S = G(() => {
    const A = [];
    for (const B of d.value) {
      const R = he(B);
      !R || !B.required && !B.missing || C(m.value[R]) && A.push(R);
    }
    return A;
  }), T = G(() => d.value.filter((A) => !C(m.value[he(A)])).length), j = G(() => dt().length), I = U(!1), y = U(null);
  let b = null;
  const W = U(0), $ = U({}), L = G(() => Object.keys($.value).length);
  let z = 0;
  const ie = /* @__PURE__ */ new Set();
  function C(A) {
    return A == null || A === "" || typeof A == "string" && !A.trim() || Array.isArray(A) && A.length === 0 || typeof A == "object" && Object.keys(A).length === 0;
  }
  function V(A) {
    return A == null ? "" : typeof A == "object" ? JSON.stringify(A) : String(A);
  }
  function D(A) {
    if (A.expected_type) return A.expected_type;
    const B = [A.value, A.default, ...(A.suggestions || []).map((R) => R.value)];
    for (const R of B) {
      if (typeof R == "boolean" || typeof R == "number") return typeof R;
      if (Array.isArray(R)) return "array";
      if (R && typeof R == "object") return "object";
    }
    return "string";
  }
  function H(A, B) {
    if (typeof B != "string") return B;
    const R = B.trim(), q = D(A);
    if (q === "boolean") return /^(true|false)$/.test(R) ? R === "true" : B;
    if (q === "number" || q === "integer") return R && Number.isFinite(Number(R)) ? Number(R) : B;
    if (q === "array" || q === "object")
      try {
        return JSON.parse(R);
      } catch {
        return B;
      }
    return B;
  }
  function J(A, B) {
    const R = D(A);
    return R === "array" ? Array.isArray(B) : R === "object" ? B !== null && typeof B == "object" && !Array.isArray(B) : R === "integer" ? typeof B == "number" && Number.isInteger(B) : typeof B === R && (R !== "number" || Number.isFinite(B));
  }
  function ee(A, B) {
    const R = he(A);
    if (!R || Pe(A)) return;
    const q = H(A, B ?? "");
    JSON.stringify(m.value[R]) !== JSON.stringify(q) && (ie.add(R), m.value = { ...m.value, [R]: q }, l());
  }
  function te(A) {
    const B = m.value[he(A)];
    return !Pe(A) && !C(B) && !J(A, B);
  }
  function pe(A) {
    const B = D(A);
    return B === "boolean" ? "expects true or false" : `expects ${B === "integer" || B === "object" || B === "array" ? "an" : "a"} ${B}`;
  }
  const re = G(() => d.value.filter(te).map(he).filter(Boolean));
  function ge(A) {
    return V(m.value[he(A)]);
  }
  function _e(A) {
    return (A.required || A.missing) === !0 && C(m.value[he(A)]);
  }
  function Pe(A) {
    return xo(A, t.component) && A.missing !== !0 && !ie.has(he(A));
  }
  function He(A) {
    const B = /* @__PURE__ */ new Set(), R = [];
    for (const q of A.suggestions || []) {
      const Y = V(q.value).trim();
      if (!Y || B.has(Y)) continue;
      B.add(Y);
      const Q = String(q.label || Y).trim(), be = [q.kind, q.source, q.description].filter(Boolean).map(String).join(" | ");
      R.push({ label: Q && Q !== Y ? `${Q} (${Y})` : Y, value: Y, title: be });
    }
    return R;
  }
  function Oe() {
    const A = {}, B = (q, Y) => {
      if (q = String(q || "").trim(), !q) return;
      A[q] = Y;
      const Q = q.includes(":") && q.split(":").pop() || "";
      Q && A[Q] === void 0 && (A[Q] = A[q]);
    }, R = t.installedDep?.parameters;
    if (Array.isArray(R))
      for (const q of R)
        B(q.name, q.value);
    else if (R && typeof R == "object")
      for (const [q, Y] of Object.entries(R)) B(q, Y);
    return A;
  }
  async function Dt() {
    if (f.value = {}, !!e)
      try {
        const A = await e.listDependencies({ includeEntries: !1, includeMigrations: !1 }), B = {}, R = (q, Y) => {
          q = String(q || "").trim();
          const Q = String(Y ?? "").trim();
          if (!q || !Q || B[q] !== void 0) return;
          B[q] = Y;
          const be = q.includes(":") && q.split(":").pop() || "";
          be && B[be] === void 0 && (B[be] = B[q]);
        };
        for (const q of A.dependencies || []) {
          const Y = q.parameters;
          if (Array.isArray(Y))
            for (const Q of Y) R(Q.name, Q.value);
          else if (Y && typeof Y == "object")
            for (const [Q, be] of Object.entries(Y)) R(Q, be);
        }
        f.value = B;
      } catch (A) {
        Ct("install:dependency-parameters", A);
      }
  }
  function Ot(A) {
    for (const B of n.value?.recommended_parameters || [])
      if (B.name === A && V(B.value).trim() !== "") return V(B.value);
    return "";
  }
  function Bt(A) {
    const B = [
      he(A),
      String(A.parameter_name || ""),
      String(A.full_id || ""),
      String(A.name || ""),
      String(A.short_name || "")
    ].map((R) => R.trim()).filter(Boolean);
    for (const R of B) {
      const q = V(f.value[R]).trim();
      if (q) return q;
      const Y = R.includes(":") && R.split(":").pop() || "";
      if (Y) {
        const Q = V(f.value[Y]).trim();
        if (Q) return Q;
      }
    }
    return "";
  }
  function Le(A) {
    const B = he(A);
    if (!B || Pe(A) || String(m.value[B] ?? "").trim()) return "";
    const q = Ot(B).trim();
    if (q) return q;
    const Y = Bt(A);
    if (Y) return Y;
    const Q = V(A.default).trim();
    if (Q) return Q;
    const be = He(A).map((xt) => xt.value).filter(Boolean);
    if (be.length === 1) return be[0];
    const Ee = gt(A);
    return Ee.length && Ee[0].score > 0 && (Ee.length === 1 || Ee[0].score > Ee[1].score) ? Ee[0].value : "";
  }
  function gt(A) {
    return String(A.expected_kind || "").trim() !== "security.scope" ? [] : (A.suggestions || []).map((B) => {
      const R = V(B.value).trim(), q = String(B.label || "").toLowerCase(), Y = String(B.description || "").toLowerCase();
      let Q = 0;
      return R || (Q -= 1e3), (q.includes("system") || Y.includes("system") || Y.includes("internal")) && (Q -= 50), (q.includes("admin") || Y.includes("full access") || Y.includes("assign sparingly")) && (Q -= 50), (Y.includes("signed-in") || Y.includes("authenticated")) && (Q += 30), (q === "user" || q === "member") && (Q += 20), { value: R, score: Q };
    }).filter((B) => B.value).sort((B, R) => R.score - B.score || B.value.localeCompare(R.value));
  }
  function dt() {
    const A = [];
    for (const B of w.value) {
      if (!_e(B)) continue;
      const R = he(B), q = Le(B);
      R && q && A.push({ name: R, value: q });
    }
    return A;
  }
  function et(A) {
    return Le(A) !== "";
  }
  function ct(A) {
    const B = he(A), R = Le(A);
    if (!B || !R) {
      o.value = "requirements", W.value++;
      return;
    }
    ee(A, R);
  }
  function pt() {
    const A = dt();
    if (!A.length) {
      o.value = "requirements", W.value++;
      return;
    }
    for (const B of A) {
      const R = d.value.find((q) => he(q) === B.name);
      R && ee(R, String(B.value));
    }
  }
  function Be() {
    return w.value.filter((A) => C(m.value[he(A)]) && (A.missing || A.value_source === "conflict" || A.expected_type || He(A).length)).map((A) => ({ name: A.full_id || he(A) }));
  }
  const Ke = G(() => Be().length);
  function qe(A, B) {
    return C(B) || !J(A, B) ? !1 : !A.expected_kind || !!A.suggestions?.some((R) => R.value === B);
  }
  function Ae(A) {
    const B = { ...$.value }, R = { ...m.value };
    for (const q of A) {
      const Y = B[q];
      Y?.value !== void 0 && (R[q] = Y.value, ie.add(q), delete B[q]);
    }
    return m.value = R, l(), B;
  }
  async function tt(A) {
    if (!s.value || I.value) return;
    const B = Ae(A), R = z;
    if (await u(), R !== z || !s.value) return;
    const q = {};
    for (const Y of w.value) {
      const Q = he(Y), be = B[Q];
      be && C(m.value[Q]) && Y.expected_type === be.expected_type && Y.expected_kind === be.expected_kind && qe(Y, be.value) && (q[Q] = be);
    }
    $.value = q;
  }
  function Ft(A) {
    const B = { ...$.value };
    for (const R of A) delete B[R];
    $.value = B;
  }
  function mt(A) {
    !s.value || I.value || Ae(A);
  }
  async function nt(A) {
    const B = Be();
    if (!s.value || !B.length || I.value) return;
    yt();
    const R = z, q = new AbortController();
    b = q, I.value = !0, y.value = null, $.value = {}, await new Promise((Y) => {
      let Q = !1, be = !1;
      const Ee = ($e) => {
        if (Q) return;
        if (Q = !0, clearTimeout(xt), q.signal.aborted || R !== z || b !== q) {
          Y();
          return;
        }
        b = null;
        const We = $e && typeof $e == "object" ? $e : {};
        if (We.success === !0) {
          const Rt = new Set(B.map((Ce) => Ce.name)), It = {}, Xt = new Map((We.requirements || []).map((Ce) => [Ce.full_id, Ce]));
          d.value = d.value.map((Ce) => ({
            ...Ce,
            resolution_error: Xt.get(Ce.full_id)?.resolution_error
          }));
          for (const Ce of We.parameters || []) {
            const ot = d.value.find((Me) => (Me.full_id || he(Me)) === Ce.name || he(Me) === Ce.name);
            if (!ot || !Rt.has(ot.full_id || he(ot)) || !qe(ot, Ce.value) || typeof Ce.reason != "string" || !Ce.reason.trim()) {
              y.value = { tone: "warning", code: "INVALID_CHOICE", message: "AI returns an invalid planned value or omits its reason. Choose a value manually." };
              continue;
            }
            It[he(ot)] = { ...ot, value: Ce.value, choice_reason: Ce.reason };
          }
          $.value = It, Object.keys(It).length ? y.value = { tone: "success", message: "Review AI suggestions before applying." } : y.value || (y.value = { tone: "warning", message: "No valid AI suggestion is available. Choose a value manually." });
        } else
          y.value = {
            tone: "warning",
            code: We.code,
            kind: We.kind,
            details: We.details,
            message: We.error || "AI could not resolve these settings. Choose a value manually."
          };
        I.value = !1, Y();
      }, xt = setTimeout(() => {
        Ee({ success: !1, code: "TIMEOUT", error: "AI requirement resolution timed out." }), q.abort();
      }, 2e4);
      q.signal.addEventListener("abort", () => {
        Q || (Q = !0, clearTimeout(xt), Y());
      }, { once: !0 });
      const Yt = {
        component: t.component,
        ...i() ? { version: i() } : {},
        ...t.mode === "update" && t.currentId ? { current_id: t.currentId } : {},
        ...a(),
        requirements: B,
        signal: q.signal,
        accept: () => {
          Q || (be = !0);
        },
        respond: Ee
      };
      A?.dispatchEvent(new CustomEvent("instrumentRequirementResolution", { detail: Yt, bubbles: !0, composed: !0 })), be || Ee({ success: !1, code: "MODEL_UNAVAILABLE", error: "Configure an AI model to suggest settings, or choose values manually." });
    });
  }
  function ft(A, B) {
    n.value = A, d.value = (A.requirements || []).filter((Y) => Y.name !== "required_setup" && Y.short_name !== "required_setup");
    const R = Oe(), q = {};
    for (const Y of d.value) {
      const Q = he(Y);
      if (!Q) continue;
      const be = String(Y.name || Y.short_name || Q.split(":").pop() || "");
      q[Q] = (ie.has(Q) ? B[Q] : C(B[Q]) ? void 0 : B[Q]) ?? R[Q] ?? R[be] ?? f.value[Q] ?? f.value[be] ?? Y.value ?? Y.default ?? "";
    }
    m.value = q;
    for (const Y of ie)
      Y in q || ie.delete(Y);
  }
  function yt() {
    b?.abort(), b = null, I.value = !1, z++, $.value = {}, y.value = null;
  }
  function ht() {
    yt(), d.value = [], m.value = {}, ie.clear(), f.value = {}, I.value = !1, y.value = null;
  }
  return {
    pendingSuggestions: $,
    pendingCount: L,
    acceptSuggestions: tt,
    rejectSuggestions: Ft,
    editSuggestions: mt,
    displayValue: V,
    requirements: d,
    parameterValues: m,
    installedParameterHints: f,
    requirementGroups: v,
    rootRequirements: g,
    editableRequirements: w,
    transitiveRequirementCount: x,
    missingRequirements: S,
    boundRequirementCount: T,
    autoFitCount: j,
    aiResolving: I,
    aiResolutionNotice: y,
    typeInvalidRequirements: re,
    highlightTick: W,
    aiResolvableCount: Ke,
    setParameter: ee,
    requirementTypeInvalid: te,
    requirementTypeHint: pe,
    requirementValue: ge,
    requirementMissing: _e,
    requirementReadOnly: Pe,
    requirementOptions: He,
    loadInstalledParameterHints: Dt,
    applyPlan: ft,
    recommendedValueFor: Ot,
    hintedValueFor: Bt,
    autoFitValue: Le,
    canAutoFitRequirement: et,
    autoFitRequirement: ct,
    autoFitRequirements: pt,
    resolveRequirementsWithAI: nt,
    abortAI: yt,
    resetRequirements: ht
  };
}
function Jp({ props: t, hub: e, plan: n, versionArg: o }) {
  const i = U(vi()), a = U(/* @__PURE__ */ new Set()), l = U(!1);
  let u = 0;
  const s = G(() => i.value.findings.filter(Wp)), d = G(() => s.value.filter((S) => !a.value.has(S.id)));
  function m(S) {
    const T = new Set(a.value);
    T.add(S.id), a.value = T;
  }
  function f() {
    const S = new Set(a.value);
    for (const T of s.value) S.add(T.id);
    a.value = S;
  }
  function v(S = 0) {
    u++, i.value = { ...vi(), total: S }, a.value = /* @__PURE__ */ new Set(), l.value = !1;
  }
  async function g() {
    if (!e || !t.component) return;
    const S = n.value?.graph || [], T = ++u;
    a.value = /* @__PURE__ */ new Set(), l.value = !1, i.value = { status: "scanning", modules: [], findings: [], scanned: 0, total: S.length };
    try {
      const j = await e.scan({ component: t.component, version: o() });
      T === u && (i.value = Yp(j));
    } catch (j) {
      if (T === u) {
        const I = j instanceof fn && (j.status === 404 || j.code === "UNKNOWN" || j.code === "NETWORK");
        i.value = I ? { status: "unavailable", modules: [], findings: [], scanned: 0, total: S.length, error: "Security scan unavailable" } : { status: "error", modules: [], findings: [], scanned: 0, total: S.length, error: Je(j, "scan failed") };
      }
    }
  }
  function w() {
    const S = n.value?.graph || [];
    u++, i.value = {
      status: "skipped",
      modules: [],
      findings: [],
      scanned: 0,
      total: S.length,
      summary: "Security scan skipped by operator."
    }, a.value = /* @__PURE__ */ new Set(), l.value = !1;
  }
  function x() {
    u++;
  }
  return { scan: i, acknowledged: a, criticalConfirmed: l, softFindings: s, unacknowledgedSoft: d, acknowledge: m, acknowledgeAllSoft: f, resetScanForPlan: v, runScanNow: g, skipScan: w, cancelScan: x };
}
const Qp = {
  "hub.install.started": "Publishing changeset",
  "hub.install.finished": "Finalizing",
  "hub.migrations.started": "Running migrations",
  "hub.migrations.finished": "Migrations applied",
  "hub.uninstall.started": "Removing entries"
}, Zo = [
  { label: "Run migrations (up)", value: "up" },
  { label: "Skip migrations (none)", value: "none" }
];
function em(t) {
  if (!t || typeof t != "object") return "";
  const e = [t, t.data, t.payload, t.detail];
  for (const n of e)
    if (n && typeof n == "object" && typeof n.event == "string")
      return String(n.event);
  return "";
}
function tm(t, e) {
  const n = Fr(Si), o = U("overview"), i = U(""), a = U("pin"), l = U([]), u = U(!1), s = G(() => [
    { label: "latest", value: "" },
    ...l.value.map((Z) => String(Z.version || "")).filter(Boolean).map((Z) => ({ label: Z, value: Z }))
  ]), d = G(() => l.value.find((Z) => Z.version === i.value) || l.value[0]);
  function m() {
    const Z = i.value.trim().replace(/^>=?/, "");
    if (Z)
      return a.value === "track" ? `>=${Z}` : Z;
  }
  const f = G(() => t.installedDep ? Mt(t.installedDep) : ""), v = U(""), g = U(!1), w = U(null), x = U(!1), S = U(!1), T = U(null), j = U(null), I = U(null), y = G(() => (w.value?.graph || []).filter((Z) => Z.direct || Z.module === t.component)), b = G(() => (w.value?.graph || []).filter((Z) => !Z.direct && Z.module !== t.component)), W = G(() => Ja(w.value?.graph || [])), $ = G(() => {
    const Z = [], we = (ve, N) => {
      for (const ne of ve)
        Z.push({ ...ne, level: N }), we(ne.children, N + 1);
    };
    return we(W.value, 0), Z;
  }), L = G(() => w.value?.module_count || w.value?.graph?.length || 0), z = G(() => (w.value?.graph || []).reduce((Z, we) => Z + (we.size_bytes || 0), 0));
  function ie(Z) {
    return ts(Z, { currentVersion: f.value, targetModule: t.component });
  }
  const C = Xp({ props: t, hub: n, plan: w, activeSection: o, versionArg: m, requirementPayload: Jt, invalidatePlan: O, refreshPlan: Gt, planCurrent: S }), {
    pendingSuggestions: V,
    pendingCount: D,
    acceptSuggestions: H,
    rejectSuggestions: J,
    editSuggestions: ee,
    displayValue: te,
    requirements: pe,
    requirementGroups: re,
    rootRequirements: ge,
    transitiveRequirementCount: _e,
    parameterValues: Pe,
    editableRequirements: He,
    missingRequirements: Oe,
    boundRequirementCount: Dt,
    autoFitCount: Ot,
    aiResolvableCount: Bt,
    aiResolving: Le,
    aiResolutionNotice: gt,
    resolveRequirementsWithAI: dt,
    highlightTick: et,
    setParameter: ct,
    requirementValue: pt,
    requirementMissing: Be,
    requirementReadOnly: Ke,
    requirementOptions: qe,
    typeInvalidRequirements: Ae,
    requirementTypeInvalid: tt,
    requirementTypeHint: Ft,
    canAutoFitRequirement: mt,
    autoFitRequirement: nt,
    autoFitRequirements: ft,
    loadInstalledParameterHints: yt,
    applyPlan: ht,
    resetRequirements: A,
    abortAI: B
  } = C, R = U("up"), q = U([]), Y = G(() => q.value.length > 0), Q = G({
    get: () => Y.value ? "up" : R.value,
    set: (Z) => {
      R.value = Z;
    }
  }), be = G(() => Y.value ? [Zo[0]] : Zo), Ee = G(() => w.value?.migrations || []), xt = G(() => w.value?.dependency?.id || w.value?.install_payload?.id || ""), Yt = Jp({ props: t, hub: n, plan: w, versionArg: m }), {
    scan: $e,
    acknowledged: We,
    criticalConfirmed: Rt,
    softFindings: It,
    unacknowledgedSoft: Xt,
    acknowledge: Ce,
    acknowledgeAllSoft: ot,
    resetScanForPlan: Me,
    runScanNow: jn,
    skipScan: yn,
    cancelScan: Nt
  } = Yt, kn = G(() => {
    const Z = x.value || Le.value ? { tone: "loading" } : D.value ? { tone: "warn", badge: String(D.value) } : Oe.value.length || Ae.value.length ? { tone: "danger", badge: String(Oe.value.length + Ae.value.length) } : pe.value.length ? { tone: "ok" } : { tone: "none" }, we = {
      scanning: "loading",
      clean: "ok",
      warnings: "warn",
      critical: "danger",
      error: "danger",
      unavailable: "none",
      idle: "none",
      skipped: "none"
    }[$e.value.status] || "none";
    return {
      overview: { tone: "none" },
      modules: x.value ? { tone: "loading" } : w.value ? { tone: "none", badge: String(L.value) } : { tone: "none" },
      requirements: Z,
      scan: { tone: we, badge: $e.value.findings.length ? String($e.value.findings.length) : void 0 },
      review: Ee.value.length ? { tone: "none", badge: String(Ee.value.length) } : { tone: "none" }
    };
  }), it = U(!1), rt = U(!1), Pt = U(null), je = U(null), Ut = U(null), Ht = U(null), Vn = G(() => Xo(Pt.value || Ht.value)), kt = U(""), Kt = U(0);
  let Tt = null, De = null, Fe = 0, Te = 0, $t = 0;
  function at() {
    kt.value = "", Kt.value = 0;
    const Z = Date.now();
    Tt = setInterval(() => {
      Kt.value = Math.floor((Date.now() - Z) / 1e3);
    }, 250);
    try {
      const we = cs("keeper.hub", (ve) => {
        const N = Qp[em(ve)];
        N && (kt.value = N);
      });
      De = typeof we == "function" ? we : null;
    } catch {
      De = null;
    }
  }
  function qt() {
    if (Tt && (clearInterval(Tt), Tt = null), De) {
      try {
        De();
      } catch {
      }
      De = null;
    }
  }
  function Jt() {
    const Z = [], we = [];
    for (const ve of He.value) {
      const N = he(ve);
      if (!N) continue;
      const ne = Pe.value[N], Ge = typeof ne == "string" ? ne.trim() : ne;
      if (Ge == null || Ge === "") continue;
      (xo(ve, t.component) ? we : Z).push({ name: N, value: Ge });
    }
    return {
      parameters: Z.length ? Z : void 0,
      requirement_bindings: we.length ? we : void 0
    };
  }
  function Qt(Z, we) {
    const ve = Hr?.toast;
    typeof ve == "function" && ve({ severity: Z === "ok" ? "success" : "error", summary: we });
  }
  async function st(Z) {
    if (!n || !t.component || !S.value || w.value?.applicable === !1 || D.value || Le.value) return;
    const we = ++$t, ve = () => we === $t && t.open;
    Z ? rt.value = !0 : it.value = !0, Pt.value = null, Ut.value = null, je.value = null, Ht.value = null, Z || at();
    let N = !1;
    try {
      const ne = await n.install({
        component: t.component,
        version: m(),
        id: t.mode === "update" && t.currentId ? t.currentId : void 0,
        dry_run: Z || void 0,
        migration_policy: Q.value,
        ...Jt()
      });
      if (!ve()) return;
      if (ne.success !== !0) throw new fn("INSTALL_INCOMPLETE", "Keeper does not confirm a successful install.", void 0, ne);
      if (Z || await ns(n, q.value, {
        isCurrent: ve,
        onPhase: (Ge) => {
          kt.value = Ge;
        }
      }), !ve()) return;
      if (Pt.value = ne, !Z) {
        const Ge = t.mode === "update" ? "updated" : "installed";
        Qt("ok", `Module ${Ge}: ${ne.dependency?.id || t.component}`), ci(), N = !0;
      }
    } catch (ne) {
      if (!ve()) return;
      Ct("install:run", ne), ne instanceof fn && (Ut.value = ne.code, Ht.value = ne.details), je.value = Je(ne, Z ? "preview failed" : "install failed"), Qt("error", je.value);
    } finally {
      we === $t && (Z ? rt.value = !1 : (it.value = !1, qt()));
    }
    N && e("changed");
  }
  const Lt = G(() => !w.value || T.value ? "modules" : D.value || Le.value || Oe.value.length || Ae.value.length || !S.value || w.value.applicable === !1 || pe.value.some((Z) => Z.invalid) ? "requirements" : $e.value.status === "idle" || $e.value.status === "scanning" || $e.value.status === "critical" && !Rt.value || Xt.value.length ? "scan" : null), en = G(() => it.value || rt.value || x.value || !w.value || !!T.value || !S.value || D.value > 0 || Le.value || $e.value.status === "scanning" || o.value === "scan" && $e.value.status === "idle"), $n = G(() => {
    if (D.value) return `Review ${D.value} AI suggestion${D.value === 1 ? "" : "s"}`;
    if (Le.value) return "Resolving settings…";
    if (!S.value) return "Validating settings…";
    const Z = Oe.value.length;
    return Z ? `${Z} required setting${Z === 1 ? "" : "s"} missing` : "Review requirement errors";
  }), At = G(() => it.value || rt.value || x.value || !w.value || !!T.value || !S.value || D.value > 0 || Le.value), Sn = G(() => it.value ? t.mode === "update" ? "Updating…" : "Installing…" : Lt.value === "scan" && $e.value.status === "idle" ? o.value === "scan" ? "Choose scan option" : "Review scan choice" : Lt.value === "scan" && o.value === "scan" && ($e.value.status === "warnings" || $e.value.status === "critical") ? "Install anyway" : t.mode === "update" ? "Update" : "Install");
  function Wt() {
    if (en.value) return;
    const Z = Lt.value;
    if (Z === "requirements") {
      o.value = "requirements", et.value++;
      return;
    }
    if (Z === "scan") {
      if (o.value !== "scan") {
        o.value = "scan";
        return;
      }
      if ($e.value.status === "idle" || $e.value.status === "scanning" || $e.value.status === "critical" && !Rt.value || (ot(), Lt.value)) return;
    }
    if (Z === "modules") {
      o.value = "modules";
      return;
    }
    st(!1);
  }
  function wn() {
    if (!S.value || w.value?.applicable === !1 || D.value || Le.value || pe.value.some((Z) => Z.invalid) || Oe.value.length || Ae.value.length) {
      o.value = "requirements", et.value++;
      return;
    }
    o.value = "review", st(!0);
  }
  async function Gt() {
    if (!n || !t.component) return;
    E && (clearTimeout(E), E = null);
    const Z = ++Fe;
    S.value = !1, x.value = !0, T.value = null, j.value = null, I.value = null;
    const we = { ...Pe.value };
    try {
      const ve = await n.planInstall({
        component: t.component,
        version: m(),
        id: t.mode === "update" && t.currentId ? t.currentId : void 0,
        run_migrations: Q.value === "up",
        ...Jt()
      });
      if (Z !== Fe || !t.open) return;
      const N = es(ve.requirements || []);
      q.value = N, ht(ve, we), S.value = !0, Me((ve.graph || []).length);
    } catch (ve) {
      if (Z !== Fe || !t.open) return;
      Ct("install:plan", ve), w.value = null, $e.value = vi(), T.value = Je(ve, "failed to plan install"), ve instanceof fn && (j.value = ve.code, I.value = ve.details);
    } finally {
      Z === Fe && (x.value = !1);
    }
  }
  let E = null;
  function O() {
    Fe++, S.value = !1, B(), bt();
  }
  function bt() {
    E && clearTimeout(E), E = setTimeout(() => {
      Gt();
    }, 350);
  }
  async function No() {
    if (l.value = [], !(!n || !t.component)) {
      u.value = !0;
      try {
        const Z = await n.listVersions(t.component);
        l.value = Z.items || [];
      } catch (Z) {
        Ct("install:versions", Z);
      } finally {
        u.value = !1;
      }
    }
  }
  async function Uo() {
    if (v.value = "", !(!n || !t.component)) {
      g.value = !0;
      try {
        const Z = await n.getReadme(t.component);
        v.value = Z.content || "";
      } catch {
      } finally {
        g.value = !1;
      }
    }
  }
  function ko() {
    Fe++, o.value = "overview", w.value = null, S.value = !1, q.value = [], it.value = !1, rt.value = !1, T.value = null, j.value = null, I.value = null, Q.value = "up", Pt.value = null, je.value = null, Ut.value = null, Ht.value = null, A(), Me(), v.value = "", l.value = [];
  }
  async function dn() {
    const Z = ++Te;
    ko(), i.value = t.mode === "update" ? "" : t.version || "", a.value = "track", await Promise.all([No(), Uo(), yt()]), !(!t.open || Z !== Te) && (t.mode === "update" && !i.value && l.value.length && (i.value = String(l.value[0].version || "")), await Gt());
  }
  lt(() => t.open, (Z) => {
    if (Z) {
      dn();
      return;
    }
    B(), qt(), $t++, it.value = !1, rt.value = !1, Te++, Fe++, Nt(), E && (clearTimeout(E), E = null);
  }, { immediate: !0 }), lt([i, a], () => {
    t.open && n && O();
  }, { flush: "sync" }), lt(Q, () => {
    t.open && n && w.value && O();
  }, { flush: "sync" }), $i(() => {
    $t++, B(), qt(), Te++, Fe++, Nt(), E && clearTimeout(E);
  });
  function Ho() {
    B(), $t++, it.value = !1, rt.value = !1, qt(), e("close");
  }
  return {
    // nav
    activeSection: o,
    sectionStatus: kn,
    blockingSection: Lt,
    // version
    version: i,
    versionMode: a,
    versionOptions: s,
    versionsLoading: u,
    versionMeta: d,
    currentVersion: f,
    // overview
    readme: v,
    readmeLoading: g,
    // plan
    plan: w,
    planCurrent: S,
    planLoading: x,
    planError: T,
    planCode: j,
    planErrorDetails: I,
    directModules: y,
    transitiveModules: b,
    planTree: W,
    planRows: $,
    moduleCount: L,
    totalSize: z,
    badgesForNode: ie,
    // requirements
    requirements: pe,
    requirementGroups: re,
    rootRequirements: ge,
    editableRequirements: He,
    transitiveRequirementCount: _e,
    parameterValues: Pe,
    missingRequirements: Oe,
    boundRequirementCount: Dt,
    autoFitCount: Ot,
    aiResolvableCount: Bt,
    aiResolving: Le,
    aiResolutionNotice: gt,
    resolveRequirementsWithAI: dt,
    pendingSuggestions: V,
    pendingCount: D,
    acceptSuggestions: H,
    rejectSuggestions: J,
    editSuggestions: ee,
    displayValue: te,
    highlightTick: et,
    setParameter: ct,
    requirementValue: pt,
    requirementMissing: Be,
    requirementReadOnly: Ke,
    requirementOptions: qe,
    requirementConfiguredBy: Qa,
    typeInvalidRequirements: Ae,
    requirementTypeInvalid: tt,
    requirementTypeHint: Ft,
    canAutoFitRequirement: mt,
    autoFitRequirement: nt,
    autoFitRequirements: ft,
    // review / options
    requiredSetup: Y,
    migrationPolicy: Q,
    migrationOptions: be,
    migrations: Ee,
    destinationId: xt,
    INSTALL_MIGRATION_OPTIONS: Zo,
    // scan
    scan: $e,
    acknowledged: We,
    criticalConfirmed: Rt,
    softFindings: It,
    unacknowledgedSoft: Xt,
    acknowledge: Ce,
    acknowledgeAllSoft: ot,
    runScanNow: jn,
    skipScan: yn,
    // execution
    running: it,
    dryRunning: rt,
    result: Pt,
    resultError: je,
    resultCode: Ut,
    resultErrorDetails: Ht,
    resultExecution: Vn,
    executionStepLabel: Br,
    progressPhase: kt,
    elapsedSec: Kt,
    requirementStatusMessage: $n,
    primaryDisabled: en,
    previewDisabled: At,
    primaryLabel: Sn,
    primaryAction: Wt,
    preview: wn,
    refreshPlan: Gt,
    close: Ho
  };
}
const nm = { class: "km-2p-head-icon" }, om = { class: "km-2p-head-text" }, im = { class: "km-2p-head-title" }, rm = { class: "km-2p-head-sub" }, am = { class: "km-dim km-mono" }, sm = { class: "km-2p" }, lm = {
  class: "km-2p-nav",
  "aria-label": "Install steps"
}, um = ["onClick"], dm = { class: "km-2p-navlabel" }, cm = { class: "km-2p-navstatus" }, pm = {
  key: 2,
  class: "km-dot km-dot-danger",
  "aria-hidden": "true"
}, mm = {
  key: 3,
  class: "km-dot km-dot-warn",
  "aria-hidden": "true"
}, fm = {
  key: 4,
  class: "km-navbadge"
}, hm = { class: "km-sec" }, bm = { class: "km-ov-hero" }, vm = { class: "km-ov-icon" }, gm = { class: "km-grow km-min0" }, ym = { class: "km-row-wrap" }, km = { class: "km-ov-name" }, $m = {
  key: 0,
  class: "badge-app kx-tag-caps"
}, Sm = {
  key: 1,
  class: "badge-warn kx-tag-caps"
}, wm = { class: "km-ov-org km-mono" }, _m = {
  key: 0,
  class: "km-ov-desc"
}, Cm = {
  key: 1,
  class: "km-hint"
}, Om = { class: "km-field" }, xm = { class: "km-row-gap" }, Im = {
  class: "km-seg",
  role: "group",
  "aria-label": "Version mode"
}, Pm = ["aria-pressed"], Tm = ["aria-pressed"], Lm = { class: "km-hint" }, Am = { class: "km-ov-meta" }, Em = { class: "km-meta-row" }, jm = {
  key: 0,
  class: "km-meta-row"
}, Vm = {
  key: 1,
  class: "km-meta-row"
}, zm = {
  key: 2,
  class: "km-meta-row"
}, Mm = {
  key: 3,
  class: "km-meta-row"
}, Dm = {
  key: 4,
  class: "km-meta-row"
}, Bm = {
  key: 5,
  class: "km-meta-row"
}, Fm = {
  key: 2,
  class: "km-loading"
}, Rm = {
  key: 3,
  class: "km-ov-readme"
}, Nm = { class: "km-sec" }, Um = {
  key: 1,
  class: "km-msg km-msg-err"
}, Hm = {
  key: 0,
  class: "km-code"
}, Km = { class: "km-sec-title" }, qm = {
  key: 0,
  class: "km-dim"
}, Wm = {
  key: 1,
  class: "km-tree-spacer",
  "aria-hidden": "true"
}, Gm = { class: "km-mrow-badge kx-tag-caps" }, Zm = { class: "km-mrow-name km-mono" }, Ym = {
  key: 2,
  class: "km-mrow-ver km-mono"
}, Xm = {
  key: 3,
  class: "km-dim km-mono"
}, Jm = {
  key: 4,
  class: "km-dim"
}, Qm = { class: "km-sec" }, ef = {
  key: 1,
  class: "km-empty-inline"
}, tf = { class: "km-sec-title" }, nf = { class: "km-dim" }, of = { class: "km-req-toolbar" }, rf = ["disabled"], af = ["disabled"], sf = {
  key: 0,
  class: "km-code"
}, lf = {
  key: 1,
  class: "km-code"
}, uf = {
  key: 2,
  class: "km-mono"
}, df = {
  key: 1,
  class: "km-req-toolbar",
  role: "status"
}, cf = { class: "km-grow" }, pf = ["disabled"], mf = ["disabled"], ff = { class: "km-req-group-head" }, hf = { class: "km-mono" }, bf = {
  key: 0,
  class: "km-dim"
}, vf = { class: "km-req-meta" }, gf = { class: "km-mono km-req-name" }, yf = {
  key: 0,
  class: "km-req-flag"
}, kf = {
  key: 1,
  class: "km-chip km-mono"
}, $f = ["onClick"], Sf = ["aria-label", "disabled", "value", "list", "placeholder", "onInput"], wf = ["id"], _f = ["value", "title"], Cf = {
  key: 1,
  class: "km-readonly-field km-mono"
}, Of = { class: "km-req-foot" }, xf = {
  key: 0,
  class: "km-req-src"
}, If = {
  key: 1,
  class: "km-req-invalid"
}, Pf = {
  key: 2,
  class: "km-req-invalid"
}, Tf = {
  key: 3,
  class: "km-req-info"
}, Lf = {
  key: 4,
  class: "km-req-info"
}, Af = ["aria-label"], Ef = { class: "km-mono" }, jf = { class: "km-row-gap" }, Vf = ["disabled", "onClick"], zf = ["onClick"], Mf = ["onClick"], Df = {
  key: 3,
  class: "km-msg km-msg-err",
  role: "alert"
}, Bf = { class: "km-code" }, Ff = { key: 0 }, Rf = {
  key: 4,
  class: "km-req-desc"
}, Nf = { class: "km-sec" }, Uf = { class: "km-sec-title" }, Hf = {
  key: 0,
  class: "km-scan-run"
}, Kf = {
  key: 1,
  class: "km-msg km-msg-info"
}, qf = {
  key: 2,
  class: "km-scan-run"
}, Wf = { class: "km-grow" }, Gf = {
  key: 3,
  class: "km-empty-inline"
}, Zf = {
  key: 4,
  class: "km-msg km-msg-err"
}, Yf = {
  key: 5,
  class: "km-msg km-msg-info"
}, Xf = {
  key: 0,
  class: "km-scan-overall"
}, Jf = {
  key: 1,
  class: "km-msg km-msg-err"
}, Qf = { class: "km-scan-mod-head" }, eh = { class: "km-mono km-scan-mod-name" }, th = { class: "km-chip" }, nh = {
  key: 0,
  class: "km-scan-mod-sum"
}, oh = { class: "km-grow km-min0" }, ih = { class: "km-finding-head" }, rh = { class: "km-finding-title" }, ah = {
  key: 0,
  class: "km-finding-detail"
}, sh = {
  key: 1,
  class: "km-finding-loc km-mono"
}, lh = ["onClick"], uh = {
  key: 1,
  class: "km-dim km-scan-mod-clean"
}, dh = {
  key: 2,
  class: "km-check km-mt"
}, ch = { class: "km-sec" }, ph = { class: "km-sec-title" }, mh = { class: "km-review-grid" }, fh = { class: "km-review-tile" }, hh = { class: "km-review-tile" }, bh = { class: "km-review-tile" }, vh = { class: "km-review-tile" }, gh = { class: "km-field" }, yh = {
  key: 0,
  class: "km-hint"
}, kh = {
  key: 1,
  class: "km-mig-list"
}, $h = { class: "km-mono km-trunc" }, Sh = { class: "km-chip" }, wh = { class: "km-hint" }, _h = { class: "km-adv" }, Ch = { class: "km-adv-body" }, Oh = { class: "km-meta-row" }, xh = { class: "km-mono" }, Ih = { class: "km-meta-row" }, Ph = { class: "km-mono" }, Th = {
  key: 0,
  class: "km-panel km-panel-ok"
}, Lh = { class: "km-panel-title" }, Ah = {
  key: 0,
  class: "km-dim"
}, Eh = {
  key: 1,
  class: "km-dim"
}, jh = {
  key: 0,
  class: "km-dim"
}, Vh = { class: "km-mono" }, zh = {
  key: 1,
  class: "km-dim"
}, Mh = {
  key: 2,
  class: "km-dim"
}, Dh = {
  key: 1,
  class: "km-ledger"
}, Bh = { class: "km-ledger-step" }, Fh = { class: "km-grow" }, Rh = { class: "km-chip" }, Nh = {
  key: 0,
  class: "km-ledger-msg"
}, Uh = {
  key: 2,
  class: "km-msg km-msg-err"
}, Hh = {
  key: 0,
  class: "km-code"
}, Kh = {
  key: 0,
  class: "km-running km-2p-progress"
}, qh = { class: "km-grow km-running-label" }, Wh = { class: "km-dim" }, Gh = {
  key: 0,
  class: "km-foot-note"
}, Zh = ["disabled"], Yh = ["disabled"], Xh = ["disabled"], Jh = /* @__PURE__ */ En({
  __name: "InstallDialog",
  props: {
    open: { type: Boolean },
    mode: {},
    component: {},
    version: {},
    currentId: {},
    catalogItem: {},
    installedDep: {}
  },
  emits: ["close", "changed"],
  setup(t, { emit: e }) {
    const n = t, i = tm(n, e), a = [
      { key: "overview", label: "Overview", icon: "tabler:info-circle" },
      { key: "modules", label: "Modules", icon: "tabler:hierarchy-2" },
      { key: "requirements", label: "Requirements", icon: "tabler:adjustments" },
      { key: "scan", label: "Security scan", icon: "tabler:shield-check" },
      { key: "review", label: "Review & install", icon: "tabler:checklist" }
    ], l = G(() => n.catalogItem || { full_name: n.component, component: n.component }), u = G(() => Wn(l.value)), s = G(() => n.mode === "update" ? "Update module" : "Install module");
    function d(y) {
      const b = i.requirementOptions(y), W = i.requirementValue(y);
      return W && !b.some(($) => $.value === W) ? [{ label: `${W} (current)`, value: W }, ...b] : b;
    }
    function m(y) {
      return `km-req-options-${he(y).replace(/[^a-zA-Z0-9_-]/g, "-")}`;
    }
    function f(y) {
      return {
        provided: "you set this",
        provided_bare: "you set this",
        existing: "auto-detected",
        existing_bare: "auto-detected",
        default: "package default",
        registry: "from registry",
        conflict: "multiple candidates — pick one"
      }[String(y.value_source || "")] || "";
    }
    const v = U(null), g = U(!1);
    let w;
    $i(() => clearTimeout(w)), lt(() => i.highlightTick.value, async (y, b, W) => {
      let $ = !0;
      if (W(() => {
        $ = !1;
      }), i.activeSection.value !== "requirements" || (await An(), !$)) return;
      v.value?.querySelector(".km-req.is-missing, .km-req.is-invalid")?.scrollIntoView({ block: "center", behavior: "smooth" }), g.value = !0, clearTimeout(w), w = setTimeout(() => {
        g.value = !1;
      }, 1200);
    });
    function x(y) {
      return xr[y.severity].tone;
    }
    function S(y) {
      return y === "critical" || y === "error" ? "km-dot-danger" : y === "warnings" ? "km-dot-warn" : "km-dot-ok";
    }
    function T(y) {
      return `km-plan-badge kx-tag-caps km-plan-badge-${y}`;
    }
    function j(y) {
      return y === "failed" || y === "rollback_failed" ? "km-ledger-bad" : y === "rolled_back" ? "km-ledger-warn" : "km-ledger-ok";
    }
    const I = G(() => i.progressPhase.value || (n.mode === "update" ? "Updating…" : "Installing…"));
    return Fo(() => {
      Ur("wc-render-markdown", { timeoutMs: 8e3 }).catch(() => {
      });
    }), (y, b) => {
      const W = Ve("wc-render-markdown");
      return p(), xe(Op, {
        visible: t.open,
        busy: r(i).running.value || r(i).dryRunning.value,
        label: s.value,
        class: "km-dialog km-dialog-2p",
        "header-class": "km-modal-head km-2p-head",
        "content-class": "km-dialog-content km-dialog-content-2p",
        "footer-class": "km-modal-foot km-2p-foot",
        style: hn({ "--accent": u.value }),
        onClose: b[19] || (b[19] = ($) => r(i).close())
      }, {
        header: Ie(() => [
          c("span", nm, [
            P(r(M), {
              icon: r(Tn)(l.value),
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ]),
          c("span", om, [
            c("span", im, k(s.value), 1),
            c("span", rm, [
              F(k(r(Pn)(l.value)) + " ", 1),
              c("span", am, k(n.component), 1)
            ])
          ])
        ]),
        footer: Ie(() => [
          r(i).running.value ? (p(), h("div", Kh, [
            P(r(M), {
              icon: "tabler:loader-2",
              class: "km-i spin km-accent",
              "aria-hidden": "true"
            }),
            c("span", qh, k(I.value), 1),
            c("span", Wh, k(r(i).elapsedSec.value) + "s", 1)
          ])) : (p(), h(X, { key: 1 }, [
            r(i).blockingSection.value === "requirements" ? (p(), h("span", Gh, [
              P(r(M), {
                icon: "tabler:alert-triangle",
                class: "km-i-sm",
                "aria-hidden": "true"
              }),
              F(" " + k(r(i).requirementStatusMessage.value), 1)
            ])) : _("", !0),
            r(i).blockingSection.value === "requirements" ? (p(), h("button", {
              key: 1,
              class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm",
              disabled: r(i).autoFitCount.value === 0,
              onClick: b[15] || (b[15] = ($) => r(i).autoFitRequirements())
            }, [
              P(r(M), {
                icon: "tabler:wand",
                class: "km-i",
                "aria-hidden": "true"
              }),
              b[69] || (b[69] = F(" Auto-fit ", -1))
            ], 8, Zh)) : _("", !0),
            b[71] || (b[71] = c("span", { class: "km-grow" }, null, -1)),
            c("button", {
              class: "km-btn km-btn-text km-btn-secondary km-btn-sm",
              onClick: b[16] || (b[16] = ($) => r(i).close())
            }, "Cancel"),
            c("button", {
              class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm",
              disabled: r(i).previewDisabled.value,
              onClick: b[17] || (b[17] = ($) => r(i).preview())
            }, [
              P(r(M), {
                icon: r(i).dryRunning.value ? "tabler:loader-2" : "tabler:eye",
                class: oe(["km-i", r(i).dryRunning.value && "spin"]),
                "aria-hidden": "true"
              }, null, 8, ["icon", "class"]),
              b[70] || (b[70] = F(" Preview changes ", -1))
            ], 8, Yh),
            c("button", {
              class: "km-btn km-btn-sm",
              disabled: r(i).primaryDisabled.value,
              onClick: b[18] || (b[18] = ($) => r(i).primaryAction())
            }, [
              P(r(M), {
                icon: n.mode === "update" ? "tabler:refresh-dot" : "tabler:download",
                class: "km-i",
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              F(" " + k(r(i).primaryLabel.value), 1)
            ], 8, Xh)
          ], 64))
        ]),
        default: Ie(() => [
          c("div", sm, [
            c("nav", lm, [
              (p(), h(X, null, ce(a, ($) => c("button", {
                key: $.key,
                class: oe(["km-2p-navitem", { active: r(i).activeSection.value === $.key }]),
                onClick: (L) => r(i).activeSection.value = $.key
              }, [
                P(r(M), {
                  icon: $.icon,
                  class: "km-i",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                c("span", dm, k($.label), 1),
                c("span", cm, [
                  r(i).sectionStatus.value[$.key].tone === "loading" ? (p(), xe(r(M), {
                    key: 0,
                    icon: "tabler:loader-2",
                    class: "km-i-sm spin km-dim",
                    "aria-hidden": "true"
                  })) : r(i).sectionStatus.value[$.key].tone === "ok" ? (p(), xe(r(M), {
                    key: 1,
                    icon: "tabler:circle-check-filled",
                    class: "km-i-sm km-sev-ok-fg",
                    "aria-hidden": "true"
                  })) : r(i).sectionStatus.value[$.key].tone === "danger" ? (p(), h("span", pm)) : r(i).sectionStatus.value[$.key].tone === "warn" ? (p(), h("span", mm)) : _("", !0),
                  r(i).sectionStatus.value[$.key].badge ? (p(), h("span", fm, k(r(i).sectionStatus.value[$.key].badge), 1)) : _("", !0)
                ])
              ], 10, um)), 64))
            ]),
            c("div", {
              ref_key: "mainRef",
              ref: v,
              class: "km-2p-main"
            }, [
              Xe(c("section", hm, [
                c("div", bm, [
                  c("span", vm, [
                    P(r(M), {
                      icon: r(Tn)(l.value),
                      class: "km-i-lg",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"])
                  ]),
                  c("div", gm, [
                    c("div", ym, [
                      c("span", km, k(r(Pn)(l.value)), 1),
                      r(Nn)(l.value) ? (p(), h("span", $m, "app")) : _("", !0),
                      l.value.deprecated ? (p(), h("span", Sm, "deprecated")) : _("", !0)
                    ]),
                    c("div", wm, k(n.component), 1)
                  ])
                ]),
                l.value.description ? (p(), h("p", _m, k(l.value.description), 1)) : _("", !0),
                n.mode === "update" && !n.currentId ? (p(), h("p", Cm, " Updating this module creates an application root dependency for the selected version. This version also applies to modules that depend on it; the plan shows any conflicts. ")) : _("", !0),
                c("div", Om, [
                  b[21] || (b[21] = c("label", { class: "km-label" }, "Version", -1)),
                  c("div", xm, [
                    P(Or, {
                      modelValue: r(i).version.value,
                      "onUpdate:modelValue": b[0] || (b[0] = ($) => r(i).version.value = $),
                      class: "km-sort km-grow",
                      items: r(i).versionOptions.value.map(($) => ({ id: $.value, title: $.label })),
                      placeholder: "latest",
                      "aria-label": "Version"
                    }, null, 8, ["modelValue", "items"])
                  ]),
                  c("div", Im, [
                    c("button", {
                      class: oe(["km-seg-btn", { active: r(i).versionMode.value === "pin" }]),
                      "aria-pressed": r(i).versionMode.value === "pin",
                      onClick: b[1] || (b[1] = ($) => r(i).versionMode.value = "pin")
                    }, [
                      P(r(M), {
                        icon: "tabler:pin",
                        class: "km-i-sm",
                        "aria-hidden": "true"
                      }),
                      F(" Pin " + k(r(i).version.value || "latest"), 1)
                    ], 10, Pm),
                    c("button", {
                      class: oe(["km-seg-btn", { active: r(i).versionMode.value === "track" }]),
                      "aria-pressed": r(i).versionMode.value === "track",
                      onClick: b[2] || (b[2] = ($) => r(i).versionMode.value = "track")
                    }, [
                      P(r(M), {
                        icon: "tabler:arrow-up-circle",
                        class: "km-i-sm",
                        "aria-hidden": "true"
                      }),
                      b[20] || (b[20] = F(" Track updates ", -1))
                    ], 10, Tm)
                  ]),
                  c("p", Lm, k(r(i).versionMode.value === "pin" ? "Locks to this exact version; future updates are manual." : `Tracks ${r(i).version.value ? "≥ " + r(i).version.value : "all"} releases on the next resolve.`), 1)
                ]),
                c("div", Am, [
                  c("div", Em, [
                    P(r(M), {
                      icon: "tabler:download",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    b[22] || (b[22] = c("span", null, "Downloads", -1)),
                    c("b", null, k(r(Gn)(l.value.total_downloads)), 1)
                  ]),
                  l.value.favorites_count ? (p(), h("div", jm, [
                    P(r(M), {
                      icon: "tabler:star",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    b[23] || (b[23] = c("span", null, "Favorites", -1)),
                    c("b", null, k(l.value.favorites_count), 1)
                  ])) : _("", !0),
                  l.value.license ? (p(), h("div", Vm, [
                    P(r(M), {
                      icon: "tabler:license",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    b[24] || (b[24] = c("span", null, "License", -1)),
                    c("b", null, k(l.value.license), 1)
                  ])) : _("", !0),
                  l.value.type ? (p(), h("div", zm, [
                    P(r(M), {
                      icon: "tabler:category",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    b[25] || (b[25] = c("span", null, "Type", -1)),
                    c("b", null, k(l.value.type), 1)
                  ])) : _("", !0),
                  r(i).versionMeta.value?.entry_count ? (p(), h("div", Mm, [
                    P(r(M), {
                      icon: "tabler:list-numbers",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    b[26] || (b[26] = c("span", null, "Entries", -1)),
                    c("b", null, k(r(i).versionMeta.value.entry_count), 1)
                  ])) : _("", !0),
                  r(i).versionMeta.value?.size_bytes ? (p(), h("div", Dm, [
                    P(r(M), {
                      icon: "tabler:weight",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    b[27] || (b[27] = c("span", null, "Size", -1)),
                    c("b", null, k(r(Un)(r(i).versionMeta.value.size_bytes)), 1)
                  ])) : _("", !0),
                  l.value.update_time ? (p(), h("div", Bm, [
                    P(r(M), {
                      icon: "tabler:clock",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    b[28] || (b[28] = c("span", null, "Updated", -1)),
                    c("b", null, k(r(Vo)(l.value.update_time, { maxUnit: "year" })), 1)
                  ])) : _("", !0)
                ]),
                r(i).readmeLoading.value ? (p(), h("div", Fm, [
                  P(r(M), {
                    icon: "tabler:loader-2",
                    class: "km-i spin",
                    "aria-hidden": "true"
                  }),
                  b[29] || (b[29] = F(" Loading README…", -1))
                ])) : r(i).readme.value ? (p(), h("article", Rm, [
                  P(W, {
                    source: r(i).readme.value
                  }, null, 8, ["source"])
                ])) : _("", !0)
              ], 512), [
                [zn, r(i).activeSection.value === "overview"]
              ]),
              Xe(c("section", Nm, [
                r(i).planLoading.value ? (p(), h(X, { key: 0 }, [
                  b[30] || (b[30] = c("div", {
                    class: "km-skel km-skel-line",
                    style: { width: "40%" }
                  }, null, -1)),
                  (p(), h(X, null, ce(4, ($) => c("div", {
                    class: "km-skel km-skel-card",
                    key: $
                  })), 64))
                ], 64)) : r(i).planError.value ? (p(), h("div", Um, [
                  r(i).planCode.value ? (p(), h("span", Hm, k(r(i).planCode.value), 1)) : _("", !0),
                  F(k(r(i).planError.value), 1)
                ])) : r(i).plan.value ? (p(), h(X, { key: 2 }, [
                  c("div", Km, [
                    P(r(M), {
                      icon: "tabler:hierarchy-2",
                      class: "km-i km-accent",
                      "aria-hidden": "true"
                    }),
                    F(" Installs " + k(r(i).moduleCount.value) + " module" + k(r(i).moduleCount.value === 1 ? "" : "s") + " ", 1),
                    r(i).totalSize.value ? (p(), h("span", qm, "· " + k(r(Un)(r(i).totalSize.value)), 1)) : _("", !0)
                  ]),
                  b[32] || (b[32] = c("p", { class: "km-hint" }, "The module plus its full dependency chain (ns.dependency), resolved to these versions.", -1)),
                  (p(!0), h(X, null, ce(r(i).planRows.value, ($) => (p(), h("div", {
                    key: $.path || $.module,
                    class: oe(["km-mrow", { "km-mrow-direct": $.direct || $.module === n.component, "km-mrow-transitive": !($.direct || $.module === n.component) }]),
                    style: hn({ "--tree-level": $.level })
                  }, [
                    $.level > 0 ? (p(), xe(r(M), {
                      key: 0,
                      icon: "tabler:corner-down-right",
                      class: "km-i-sm km-dim",
                      "aria-hidden": "true"
                    })) : (p(), h("span", Wm)),
                    c("span", Gm, k($.direct || $.module === n.component ? "direct" : "transitive"), 1),
                    c("span", Zm, k($.module), 1),
                    $.version ? (p(), h("span", Ym, k($.version), 1)) : _("", !0),
                    $.constraint ? (p(), h("span", Xm, k($.constraint), 1)) : _("", !0),
                    b[31] || (b[31] = c("span", { class: "km-grow" }, null, -1)),
                    (p(!0), h(X, null, ce(r(i).badgesForNode($), (L) => (p(), h("span", {
                      key: L.label,
                      class: oe(T(L.tone))
                    }, k(L.label), 3))), 128)),
                    $.size_bytes ? (p(), h("span", Jm, k(r(Un)($.size_bytes)), 1)) : _("", !0)
                  ], 6))), 128))
                ], 64)) : _("", !0)
              ], 512), [
                [zn, r(i).activeSection.value === "modules"]
              ]),
              Xe(c("section", Qm, [
                r(i).planLoading.value ? (p(), h(X, { key: 0 }, [
                  b[33] || (b[33] = c("div", {
                    class: "km-skel km-skel-line",
                    style: { width: "30%" }
                  }, null, -1)),
                  (p(), h(X, null, ce(3, ($) => c("div", {
                    class: "km-skel km-skel-field",
                    key: $
                  })), 64))
                ], 64)) : r(i).requirements.value.length ? (p(), h(X, { key: 2 }, [
                  c("div", tf, [
                    P(r(M), {
                      icon: "tabler:adjustments",
                      class: "km-i km-accent",
                      "aria-hidden": "true"
                    }),
                    b[35] || (b[35] = F(" Configuration ", -1)),
                    c("span", nf, "(" + k(r(i).boundRequirementCount.value) + "/" + k(r(i).requirements.value.length) + " set)", 1)
                  ]),
                  c("div", of, [
                    b[37] || (b[37] = c("p", { class: "km-hint km-grow" }, "Bind root requirements to host resources. Transitive requirements are shown for review and are configured by their owning module.", -1)),
                    r(i).aiResolvableCount.value ? (p(), h("button", {
                      key: 0,
                      class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm",
                      disabled: r(i).aiResolving.value || !r(i).planCurrent.value,
                      onClick: b[3] || (b[3] = ($) => r(i).resolveRequirementsWithAI(v.value))
                    }, [
                      P(r(M), {
                        icon: r(i).aiResolving.value ? "tabler:loader-2" : "tabler:sparkles",
                        class: oe(["km-i", r(i).aiResolving.value && "spin"]),
                        "aria-hidden": "true"
                      }, null, 8, ["icon", "class"]),
                      F(" " + k(r(i).aiResolving.value ? "Resolving…" : "Resolve with AI"), 1)
                    ], 8, rf)) : _("", !0),
                    r(i).missingRequirements.value.length ? (p(), h("button", {
                      key: 1,
                      class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm",
                      disabled: r(i).autoFitCount.value === 0,
                      onClick: b[4] || (b[4] = ($) => r(i).autoFitRequirements())
                    }, [
                      P(r(M), {
                        icon: "tabler:wand",
                        class: "km-i",
                        "aria-hidden": "true"
                      }),
                      b[36] || (b[36] = F(" Auto-fit ", -1))
                    ], 8, af)) : _("", !0)
                  ]),
                  r(i).aiResolutionNotice.value ? (p(), h("div", {
                    key: 0,
                    class: oe(["km-msg", r(i).aiResolutionNotice.value.tone === "success" ? "km-msg-ok" : "km-msg-warn"]),
                    role: "status"
                  }, [
                    r(i).aiResolutionNotice.value.code ? (p(), h("span", sf, k(r(i).aiResolutionNotice.value.code), 1)) : _("", !0),
                    r(i).aiResolutionNotice.value.kind ? (p(), h("span", lf, k(r(i).aiResolutionNotice.value.kind), 1)) : _("", !0),
                    F(" " + k(r(i).aiResolutionNotice.value.message) + " ", 1),
                    r(i).aiResolutionNotice.value.details ? (p(), h("pre", uf, k(JSON.stringify(r(i).aiResolutionNotice.value.details, null, 2)), 1)) : _("", !0)
                  ], 2)) : _("", !0),
                  r(i).pendingCount.value ? (p(), h("div", df, [
                    c("span", cf, "Review " + k(r(i).pendingCount.value) + " AI suggestion" + k(r(i).pendingCount.value === 1 ? "" : "s") + " before applying.", 1),
                    c("button", {
                      class: "km-btn km-btn-sm",
                      disabled: !r(i).planCurrent.value,
                      onClick: b[5] || (b[5] = ($) => r(i).acceptSuggestions(Object.keys(r(i).pendingSuggestions.value)))
                    }, "Accept all", 8, pf),
                    c("button", {
                      class: "km-btn km-btn-secondary km-btn-sm",
                      onClick: b[6] || (b[6] = ($) => r(i).rejectSuggestions(Object.keys(r(i).pendingSuggestions.value)))
                    }, "Reject all"),
                    c("button", {
                      class: "km-btn km-btn-secondary km-btn-sm",
                      disabled: !r(i).planCurrent.value,
                      onClick: b[7] || (b[7] = ($) => r(i).editSuggestions(Object.keys(r(i).pendingSuggestions.value)))
                    }, "Edit all", 8, mf)
                  ])) : _("", !0),
                  (p(!0), h(X, null, ce(r(i).requirementGroups.value, ($) => (p(), h("div", {
                    key: $.module,
                    class: "km-req-group"
                  }, [
                    c("div", ff, [
                      P(r(M), {
                        icon: $.direct ? "tabler:package" : "tabler:corner-down-right",
                        class: "km-i-sm",
                        "aria-hidden": "true"
                      }, null, 8, ["icon"]),
                      c("span", hf, k($.module), 1),
                      $.direct ? _("", !0) : (p(), h("span", bf, "dependency"))
                    ]),
                    (p(!0), h(X, null, ce($.items, (L) => (p(), h("div", {
                      key: r(he)(L),
                      class: oe(["km-req", { "is-missing": r(i).requirementMissing(L), "is-invalid": r(i).requirementTypeInvalid(L), "is-flash": g.value && (r(i).requirementMissing(L) || r(i).requirementTypeInvalid(L)) }])
                    }, [
                      c("div", vf, [
                        c("span", gf, k(L.name || r(he)(L)), 1),
                        L.required || L.missing ? (p(), h("span", yf, "required")) : _("", !0),
                        L.expected_kind ? (p(), h("span", kf, k(L.expected_kind), 1)) : _("", !0),
                        b[39] || (b[39] = c("span", { class: "km-grow" }, null, -1)),
                        r(i).requirementMissing(L) && r(i).canAutoFitRequirement(L) ? (p(), h("button", {
                          key: 2,
                          class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm km-req-fit",
                          onClick: (z) => r(i).autoFitRequirement(L)
                        }, [
                          P(r(M), {
                            icon: "tabler:wand",
                            class: "km-i-sm",
                            "aria-hidden": "true"
                          }),
                          b[38] || (b[38] = F(" Auto-fit ", -1))
                        ], 8, $f)) : _("", !0)
                      ]),
                      r(i).requirementReadOnly(L) ? (p(), h("div", Cf, k(r(i).requirementValue(L) || r(i).displayValue(L.default) || "not set"), 1)) : (p(), h(X, { key: 0 }, [
                        c("input", {
                          class: "km-input km-w-full",
                          "aria-label": L.name || r(he)(L),
                          disabled: r(i).running.value || r(i).dryRunning.value,
                          value: r(i).requirementValue(L),
                          list: d(L).length ? m(L) : void 0,
                          placeholder: r(i).displayValue(L.default) || (L.expected_kind ? `Enter ${L.expected_kind} id` : "Enter registry id or value"),
                          onInput: (z) => r(i).setParameter(L, z.target.value)
                        }, null, 40, Sf),
                        d(L).length ? (p(), h("datalist", {
                          key: 0,
                          id: m(L)
                        }, [
                          (p(!0), h(X, null, ce(d(L), (z) => (p(), h("option", {
                            key: z.value,
                            value: z.value,
                            title: z.title
                          }, k(z.label), 9, _f))), 128))
                        ], 8, wf)) : _("", !0)
                      ], 64)),
                      c("div", Of, [
                        f(L) ? (p(), h("span", xf, [
                          P(r(M), {
                            icon: "tabler:wand",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          F(" " + k(f(L)), 1)
                        ])) : _("", !0),
                        r(i).requirementTypeInvalid(L) ? (p(), h("span", If, [
                          P(r(M), {
                            icon: "tabler:alert-triangle",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          F(" " + k(r(i).requirementTypeHint(L)), 1)
                        ])) : L.invalid ? (p(), h("span", Pf, [
                          P(r(M), {
                            icon: "tabler:alert-triangle",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          F(" " + k(L.invalid_reason || "invalid value"), 1)
                        ])) : _("", !0),
                        r(i).requirementMissing(L) && !r(i).canAutoFitRequirement(L) ? (p(), h("span", Tf, [
                          P(r(M), {
                            icon: "tabler:hand-click",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          b[40] || (b[40] = F(" choose a value to continue ", -1))
                        ])) : _("", !0),
                        r(i).requirementReadOnly(L) ? (p(), h("span", Lf, [
                          P(r(M), {
                            icon: "tabler:lock",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          F(" configured by " + k(r(i).requirementConfiguredBy(L)) + "; install it directly to override ", 1)
                        ])) : _("", !0)
                      ]),
                      r(i).pendingSuggestions.value[r(he)(L)] ? (p(), h("div", {
                        key: 2,
                        class: "km-ai-proposal",
                        role: "group",
                        "aria-label": `AI suggestion for ${L.name || r(he)(L)}`
                      }, [
                        c("div", Ef, "Suggested value: " + k(r(i).displayValue(r(i).pendingSuggestions.value[r(he)(L)].value)), 1),
                        c("p", null, k(r(i).pendingSuggestions.value[r(he)(L)].choice_reason), 1),
                        c("div", jf, [
                          c("button", {
                            class: "km-btn km-btn-sm",
                            disabled: !r(i).planCurrent.value,
                            onClick: (z) => r(i).acceptSuggestions([r(he)(L)])
                          }, "Accept", 8, Vf),
                          c("button", {
                            class: "km-btn km-btn-secondary km-btn-sm",
                            onClick: (z) => r(i).rejectSuggestions([r(he)(L)])
                          }, "Reject", 8, zf),
                          c("button", {
                            class: "km-btn km-btn-secondary km-btn-sm",
                            onClick: (z) => r(i).editSuggestions([r(he)(L)])
                          }, "Edit", 8, Mf)
                        ])
                      ], 8, Af)) : _("", !0),
                      L.resolution_error ? (p(), h("div", Df, [
                        c("span", Bf, k(L.resolution_error.kind || L.resolution_error.code), 1),
                        F(" " + k(L.resolution_error.message) + " ", 1),
                        L.resolution_error.details ? (p(), h("pre", Ff, k(JSON.stringify(L.resolution_error.details, null, 2)), 1)) : _("", !0)
                      ])) : _("", !0),
                      L.description ? (p(), h("div", Rf, k(L.description), 1)) : _("", !0)
                    ], 2))), 128))
                  ]))), 128))
                ], 64)) : (p(), h("div", ef, [
                  P(r(M), {
                    icon: "tabler:circle-check",
                    class: "km-i-lg km-sev-ok-fg",
                    "aria-hidden": "true"
                  }),
                  b[34] || (b[34] = c("p", null, "Nothing to configure — this module binds no host resources.", -1))
                ]))
              ], 512), [
                [zn, r(i).activeSection.value === "requirements"]
              ]),
              Xe(c("section", Nf, [
                c("div", Uf, [
                  P(r(M), {
                    icon: "tabler:shield-check",
                    class: "km-i km-accent",
                    "aria-hidden": "true"
                  }),
                  b[41] || (b[41] = F(" Security scan", -1))
                ]),
                b[54] || (b[54] = c("p", { class: "km-hint" }, "An agent reviews the code of every module being installed. Heuristic, not a guarantee — review flagged items before proceeding.", -1)),
                r(i).scan.value.status === "idle" ? (p(), h("div", Hf, [
                  P(r(M), {
                    icon: "tabler:shield-question",
                    class: "km-i km-accent",
                    "aria-hidden": "true"
                  }),
                  b[44] || (b[44] = c("span", { class: "km-grow" }, "Security scan not run. Running the reviewer may spend LLM tokens.", -1)),
                  c("button", {
                    class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm",
                    onClick: b[8] || (b[8] = ($) => r(i).skipScan())
                  }, [
                    P(r(M), {
                      icon: "tabler:player-skip-forward",
                      class: "km-i",
                      "aria-hidden": "true"
                    }),
                    b[42] || (b[42] = F(" Skip scan ", -1))
                  ]),
                  c("button", {
                    class: "km-btn km-btn-sm",
                    onClick: b[9] || (b[9] = ($) => r(i).runScanNow())
                  }, [
                    P(r(M), {
                      icon: "tabler:shield-check",
                      class: "km-i",
                      "aria-hidden": "true"
                    }),
                    b[43] || (b[43] = F(" Run scan ", -1))
                  ])
                ])) : r(i).scan.value.status === "skipped" ? (p(), h("div", Kf, [
                  P(r(M), {
                    icon: "tabler:shield-off",
                    class: "km-i",
                    "aria-hidden": "true"
                  }),
                  b[46] || (b[46] = F(" Security scan skipped. Install can continue without spending reviewer tokens. ", -1)),
                  c("button", {
                    class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm km-mt",
                    onClick: b[10] || (b[10] = ($) => r(i).runScanNow())
                  }, [
                    P(r(M), {
                      icon: "tabler:shield-check",
                      class: "km-i",
                      "aria-hidden": "true"
                    }),
                    b[45] || (b[45] = F(" Run scan", -1))
                  ])
                ])) : r(i).scan.value.status === "scanning" ? (p(), h("div", qf, [
                  P(r(M), {
                    icon: "tabler:loader-2",
                    class: "km-i spin km-accent",
                    "aria-hidden": "true"
                  }),
                  c("span", Wf, [
                    F("Scanning " + k(r(i).scan.value.total || "") + " module" + k(r(i).scan.value.total === 1 ? "" : "s") + "… ", 1),
                    b[47] || (b[47] = c("span", { class: "km-dim" }, "this can take a moment", -1))
                  ])
                ])) : r(i).scan.value.status === "clean" ? (p(), h("div", Gf, [
                  P(r(M), {
                    icon: "tabler:shield-check-filled",
                    class: "km-i-lg km-sev-ok-fg",
                    "aria-hidden": "true"
                  }),
                  c("p", null, "No issues found across " + k(r(i).scan.value.scanned) + " module" + k(r(i).scan.value.scanned === 1 ? "" : "s") + ".", 1)
                ])) : r(i).scan.value.status === "error" ? (p(), h("div", Zf, [
                  F(" Scan failed: " + k(r(i).scan.value.error) + " ", 1),
                  c("button", {
                    class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm km-mt",
                    onClick: b[11] || (b[11] = ($) => r(i).runScanNow())
                  }, [
                    P(r(M), {
                      icon: "tabler:refresh",
                      class: "km-i",
                      "aria-hidden": "true"
                    }),
                    b[48] || (b[48] = F(" Retry", -1))
                  ])
                ])) : r(i).scan.value.status === "unavailable" ? (p(), h("div", Yf, [
                  P(r(M), {
                    icon: "tabler:shield-off",
                    class: "km-i",
                    "aria-hidden": "true"
                  }),
                  b[50] || (b[50] = F(" Security scan unavailable ", -1)),
                  c("button", {
                    class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm km-mt",
                    onClick: b[12] || (b[12] = ($) => r(i).runScanNow())
                  }, [
                    P(r(M), {
                      icon: "tabler:refresh",
                      class: "km-i",
                      "aria-hidden": "true"
                    }),
                    b[49] || (b[49] = F(" Retry", -1))
                  ])
                ])) : (p(), h(X, { key: 6 }, [
                  r(i).scan.value.summary ? (p(), h("p", Xf, k(r(i).scan.value.summary), 1)) : _("", !0),
                  r(i).scan.value.status === "critical" ? (p(), h("div", Jf, [
                    P(r(M), {
                      icon: "tabler:shield-x",
                      class: "km-i",
                      "aria-hidden": "true"
                    }),
                    b[51] || (b[51] = F(" Critical findings must be reviewed and confirmed before install.", -1))
                  ])) : _("", !0),
                  (p(!0), h(X, null, ce(r(i).scan.value.modules, ($) => (p(), h("div", {
                    key: $.module,
                    class: "km-scan-mod"
                  }, [
                    c("div", Qf, [
                      c("span", {
                        class: oe(["km-dot", S($.status)]),
                        "aria-hidden": "true"
                      }, null, 2),
                      c("span", eh, [
                        F(k($.module), 1),
                        $.version ? (p(), h(X, { key: 0 }, [
                          F("@" + k($.version), 1)
                        ], 64)) : _("", !0)
                      ]),
                      b[52] || (b[52] = c("span", { class: "km-grow" }, null, -1)),
                      c("span", th, k($.status), 1)
                    ]),
                    $.summary ? (p(), h("p", nh, k($.summary), 1)) : _("", !0),
                    (p(!0), h(X, null, ce($.findings, (L) => (p(), h("div", {
                      key: L.id,
                      class: oe(["km-finding", `km-sev-${x(L)}`])
                    }, [
                      P(r(M), {
                        icon: r(xr)[L.severity].icon,
                        class: "km-i km-finding-icon",
                        "aria-hidden": "true"
                      }, null, 8, ["icon"]),
                      c("div", oh, [
                        c("div", ih, [
                          c("span", rh, k(L.title), 1)
                        ]),
                        L.detail ? (p(), h("div", ah, k(L.detail), 1)) : _("", !0),
                        L.location ? (p(), h("div", sh, k(L.location), 1)) : _("", !0),
                        L.severity !== "critical" ? (p(), h("button", {
                          key: 2,
                          class: oe(["km-ack", { done: r(i).acknowledged.value.has(L.id) }]),
                          onClick: (z) => r(i).acknowledge(L)
                        }, [
                          P(r(M), {
                            icon: r(i).acknowledged.value.has(L.id) ? "tabler:check" : "tabler:eye",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }, null, 8, ["icon"]),
                          F(" " + k(r(i).acknowledged.value.has(L.id) ? "Acknowledged" : "Acknowledge"), 1)
                        ], 10, lh)) : _("", !0)
                      ])
                    ], 2))), 128)),
                    $.findings.length ? _("", !0) : (p(), h("p", uh, "No issues in this module."))
                  ]))), 128)),
                  r(i).scan.value.status === "critical" ? (p(), h("label", dh, [
                    Xe(c("input", {
                      type: "checkbox",
                      "onUpdate:modelValue": b[13] || (b[13] = ($) => r(i).criticalConfirmed.value = $)
                    }, null, 512), [
                      [us, r(i).criticalConfirmed.value]
                    ]),
                    b[53] || (b[53] = c("span", null, "I understand the critical findings and want to install anyway.", -1))
                  ])) : _("", !0)
                ], 64))
              ], 512), [
                [zn, r(i).activeSection.value === "scan"]
              ]),
              Xe(c("section", ch, [
                c("div", ph, [
                  P(r(M), {
                    icon: "tabler:checklist",
                    class: "km-i km-accent",
                    "aria-hidden": "true"
                  }),
                  b[55] || (b[55] = F(" Review & install", -1))
                ]),
                c("div", mh, [
                  c("div", fh, [
                    P(r(M), {
                      icon: "tabler:package",
                      class: "km-i km-accent",
                      "aria-hidden": "true"
                    }),
                    c("b", null, k(r(i).moduleCount.value), 1),
                    b[56] || (b[56] = c("span", null, "modules", -1))
                  ]),
                  c("div", hh, [
                    P(r(M), {
                      icon: "tabler:adjustments",
                      class: "km-i km-accent",
                      "aria-hidden": "true"
                    }),
                    c("b", null, k(r(i).boundRequirementCount.value) + "/" + k(r(i).requirements.value.length), 1),
                    b[57] || (b[57] = c("span", null, "configured", -1))
                  ]),
                  c("div", bh, [
                    P(r(M), {
                      icon: "tabler:database",
                      class: "km-i km-accent",
                      "aria-hidden": "true"
                    }),
                    c("b", null, k(r(i).migrations.value.length), 1),
                    b[58] || (b[58] = c("span", null, "migrations", -1))
                  ]),
                  c("div", vh, [
                    P(r(M), {
                      icon: r(i).scan.value.status === "clean" ? "tabler:shield-check" : r(i).scan.value.status === "critical" ? "tabler:shield-x" : r(i).scan.value.status === "skipped" ? "tabler:shield-off" : "tabler:shield",
                      class: "km-i km-accent",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"]),
                    c("b", null, k(r(i).scan.value.status === "scanning" ? "…" : r(i).scan.value.status === "skipped" || r(i).scan.value.status === "idle" ? "—" : r(i).scan.value.findings.length), 1),
                    b[59] || (b[59] = c("span", null, "scan findings", -1))
                  ])
                ]),
                c("div", gh, [
                  b[62] || (b[62] = c("label", { class: "km-label" }, "Migration policy", -1)),
                  P(Or, {
                    modelValue: r(i).migrationPolicy.value,
                    "onUpdate:modelValue": b[14] || (b[14] = ($) => r(i).migrationPolicy.value = $),
                    class: "km-sort km-w-full",
                    items: r(i).migrationOptions.value.map(($) => ({ id: $.value, title: $.label })),
                    "aria-label": "Migration policy"
                  }, null, 8, ["modelValue", "items"]),
                  r(i).requiredSetup.value ? (p(), h("p", yh, "This module requires setup. Installation completes after migrations and setup pass verification.")) : _("", !0),
                  r(i).migrations.value.length ? (p(), h("div", kh, [
                    (p(!0), h(X, null, ce(r(i).migrations.value, ($) => (p(), h("div", {
                      key: $.id,
                      class: "km-mig-row"
                    }, [
                      P(r(M), {
                        icon: "tabler:database-import",
                        class: "km-i-xs km-dim",
                        "aria-hidden": "true"
                      }),
                      c("span", $h, k($.id), 1),
                      b[60] || (b[60] = c("span", { class: "km-grow" }, null, -1)),
                      c("span", Sh, k($.status), 1)
                    ]))), 128))
                  ])) : _("", !0),
                  c("p", wh, [
                    P(r(M), {
                      icon: "tabler:shield-lock",
                      class: "km-i-xs",
                      "aria-hidden": "true"
                    }),
                    b[61] || (b[61] = F(" Changes are transactional — if any step fails, the registry, lock and migrations are rolled back.", -1))
                  ])
                ]),
                c("details", _h, [
                  b[65] || (b[65] = c("summary", null, "Advanced", -1)),
                  c("div", Ch, [
                    c("div", Oh, [
                      b[63] || (b[63] = c("span", null, "Installs as", -1)),
                      c("b", xh, k(r(i).destinationId.value || "—"), 1)
                    ]),
                    c("div", Ih, [
                      b[64] || (b[64] = c("span", null, "Version", -1)),
                      c("b", Ph, k(r(i).versionMode.value === "pin" ? r(i).version.value || "latest" : "≥ " + (r(i).version.value || "0.0.0")), 1)
                    ])
                  ])
                ]),
                r(i).result.value ? (p(), h("div", Th, [
                  c("div", Lh, k(r(i).result.value.dry_run ? "Dry-run preview" : "Applied"), 1),
                  r(i).result.value.dry_run ? (p(), h(X, { key: 0 }, [
                    b[66] || (b[66] = c("div", { class: "km-dim" }, "No changes were applied.", -1)),
                    r(i).resultExecution.value.length ? (p(), h("div", Ah, k(r(i).resultExecution.value.length) + " planned step" + k(r(i).resultExecution.value.length === 1 ? "" : "s") + " below.", 1)) : (p(), h("div", Eh, "Keeper accepted the dry-run but returned no execution details."))
                  ], 64)) : (p(), h(X, { key: 1 }, [
                    r(i).result.value.apply?.stage || r(i).result.value.operation_id ? (p(), h("div", jh, [
                      r(i).result.value.apply?.stage ? (p(), h(X, { key: 0 }, [
                        F("stage: " + k(r(i).result.value.apply.stage), 1)
                      ], 64)) : _("", !0),
                      r(i).result.value.apply?.stage && r(i).result.value.operation_id ? (p(), h(X, { key: 1 }, [
                        F(" · ")
                      ], 64)) : _("", !0),
                      r(i).result.value.operation_id ? (p(), h(X, { key: 2 }, [
                        b[67] || (b[67] = F("op: ", -1)),
                        c("code", Vh, k(r(i).result.value.operation_id), 1)
                      ], 64)) : _("", !0)
                    ])) : (p(), h("div", zh, "Changes applied successfully.")),
                    r(i).result.value.apply?.message ? (p(), h("div", Mh, k(r(i).result.value.apply.message), 1)) : _("", !0)
                  ], 64))
                ])) : _("", !0),
                r(i).resultExecution.value.length ? (p(), h("div", Dh, [
                  b[68] || (b[68] = c("div", { class: "km-panel-title" }, "Execution ledger", -1)),
                  (p(!0), h(X, null, ce(r(i).resultExecution.value, ($, L) => (p(), h("div", {
                    key: `${$.step}-${L}`,
                    class: oe(["km-ledger-row", j($.status)])
                  }, [
                    c("span", Bh, k(L + 1), 1),
                    c("span", Fh, k(r(i).executionStepLabel($)), 1),
                    c("span", Rh, k($.status), 1),
                    $.message ? (p(), h("span", Nh, k($.message), 1)) : _("", !0)
                  ], 2))), 128))
                ])) : _("", !0),
                r(i).resultError.value ? (p(), h("div", Uh, [
                  r(i).resultCode.value ? (p(), h("span", Hh, k(r(i).resultCode.value), 1)) : _("", !0),
                  F(k(r(i).resultError.value), 1)
                ])) : _("", !0)
              ], 512), [
                [zn, r(i).activeSection.value === "review"]
              ])
            ], 512)
          ])
        ]),
        _: 1
      }, 8, ["visible", "busy", "label", "style"]);
    };
  }
}), Qh = { class: "d-hero" }, eb = { class: "d-hero-icon" }, tb = { class: "km-grow km-min0" }, nb = { class: "km-row-wrap" }, ob = { class: "d-hero-name" }, ib = { class: "d-ver" }, rb = {
  key: 0,
  class: "badge-app kx-tag-caps"
}, ab = {
  key: 1,
  class: "badge-installed kx-tag-caps"
}, sb = {
  key: 2,
  class: "badge-private kx-tag-caps",
  title: "Private Hub module"
}, lb = {
  key: 3,
  class: "badge-warn kx-tag-caps"
}, ub = { class: "d-hero-org" }, db = {
  key: 0,
  class: "d-hero-desc"
}, cb = { class: "d-hero-actions" }, pb = ["title"], mb = ["title"], fb = ["href"], hb = ["href"], bb = { class: "d-grid" }, vb = { class: "d-side" }, gb = { class: "d-block" }, yb = { class: "d-row" }, kb = { class: "d-row-v" }, $b = {
  key: 0,
  class: "d-row"
}, Sb = { class: "d-row-v" }, wb = {
  key: 1,
  class: "d-row"
}, _b = { class: "d-row-v" }, Cb = {
  key: 2,
  class: "d-row"
}, Ob = { class: "d-row-v" }, xb = {
  key: 3,
  class: "d-row"
}, Ib = {
  key: 4,
  class: "d-row"
}, Pb = { class: "d-row-v" }, Tb = {
  key: 5,
  class: "d-row"
}, Lb = { class: "d-row-v" }, Ab = {
  key: 6,
  class: "d-row"
}, Eb = { class: "d-row-v" }, jb = {
  key: 0,
  class: "d-block"
}, Vb = { class: "km-pills" }, zb = {
  key: 1,
  class: "d-block"
}, Mb = { class: "km-dep-list" }, Db = { class: "km-trunc" }, Bb = { class: "km-dim" }, Fb = {
  key: 2,
  class: "d-block"
}, Rb = { class: "km-pills" }, Nb = { class: "d-main" }, Ub = { class: "d-tabs" }, Hb = ["disabled"], Kb = {
  key: 0,
  class: "km-dim"
}, qb = { class: "d-tab-body" }, Wb = {
  key: 0,
  class: "km-loading"
}, Gb = {
  key: 0,
  class: "d-empty"
}, Zb = {
  key: 1,
  class: "rm"
}, Yb = {
  key: 2,
  class: "km-stack-lg"
}, Xb = { key: 0 }, Jb = { class: "d-block-title d-accent" }, Qb = { class: "km-dim" }, ev = { class: "km-2col" }, tv = { class: "d-field-i" }, nv = { class: "km-grow km-min0" }, ov = { class: "d-cfg-name" }, iv = {
  key: 0,
  class: "d-cfg-desc"
}, rv = { key: 1 }, av = { class: "d-block-title" }, sv = { class: "km-2col" }, lv = { class: "d-field-i d-field-i-req" }, uv = { class: "km-grow km-min0" }, dv = { class: "d-cfg-name" }, cv = {
  key: 0,
  class: "d-cfg-desc"
}, pv = { class: "d-field-i d-field-i-req" }, mv = { class: "km-grow km-min0" }, fv = { class: "d-cfg-name" }, hv = {
  key: 0,
  class: "d-cfg-desc"
}, bv = {
  key: 1,
  class: "d-cfg-desc km-mono"
}, vv = { class: "d-block-title" }, gv = { key: 0 }, yv = { class: "d-sub" }, kv = { class: "km-pills" }, $v = {
  key: 1,
  class: "km-muted"
}, Sv = {
  key: 1,
  class: "km-muted"
}, wv = {
  key: 2,
  class: "km-stack"
}, _v = { class: "km-group-head" }, Cv = { class: "km-dim" }, Ov = { class: "km-2col" }, xv = { class: "d-entry-name" }, Iv = { class: "d-entry-id" }, Pv = {
  key: 0,
  class: "km-muted"
}, Tv = {
  key: 1,
  class: "d-vers"
}, Lv = { class: "d-ver-tag" }, Av = {
  key: 0,
  class: "km-dim"
}, Ev = {
  key: 1,
  class: "km-dim km-inline"
}, jv = {
  key: 2,
  class: "km-dim"
}, Vv = /* @__PURE__ */ En({
  __name: "ModuleDetailView",
  props: {
    page: {}
  },
  setup(t) {
    const e = t, {
      selectedModule: n,
      selectedIsPrivate: o,
      selectedCanUpdate: i,
      selectedUpdateDisabledReason: a,
      selectedCanUninstall: l,
      selectedUninstallBlockedReason: u,
      detailUpdate: s,
      detailUninstall: d,
      detailInstall: m,
      closeDetail: f,
      versionMeta: v,
      detailTab: g,
      detailReadme: w,
      detailLoading: x,
      detailVersions: S,
      envVars: T,
      requirements: j,
      entryIcon: I,
      entryName: y,
      entryDesc: b,
      detailGroups: W
    } = e.page, $ = G(() => e.page.selected.value);
    return (L, z) => {
      const ie = Ve("wc-render-markdown");
      return p(), h("div", {
        class: "d-page",
        style: hn({ "--accent": r(n) ? r(Wn)(r(n)) : "var(--p-primary-color)" })
      }, [
        c("button", {
          class: "d-back",
          onClick: z[0] || (z[0] = //@ts-ignore
          (...C) => r(f) && r(f)(...C))
        }, [
          P(r(M), {
            icon: "tabler:arrow-left",
            class: "km-i-sm",
            "aria-hidden": "true"
          }),
          z[7] || (z[7] = F(" Back to modules ", -1))
        ]),
        c("header", Qh, [
          c("div", eb, [
            P(r(M), {
              icon: r(n) ? r(Tn)(r(n)) : "tabler:package",
              class: "km-i-lg",
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ]),
          c("div", tb, [
            c("div", nb, [
              c("h2", ob, k($.value.label), 1),
              c("span", ib, k($.value.version || "—"), 1),
              r(Nn)(r(n)) ? (p(), h("span", rb, "app")) : _("", !0),
              $.value.installed ? (p(), h("span", ab, "installed")) : _("", !0),
              r(o) ? (p(), h("span", sb, [
                P(r(M), {
                  icon: "tabler:lock",
                  class: "km-i-xs",
                  "aria-hidden": "true"
                }),
                z[8] || (z[8] = F(" private", -1))
              ])) : _("", !0),
              r(n)?.deprecated ? (p(), h("span", lb, "deprecated")) : _("", !0)
            ]),
            c("div", ub, k($.value.component), 1),
            $.value.description ? (p(), h("p", db, k($.value.description), 1)) : _("", !0),
            c("div", cb, [
              $.value.installed ? (p(), h(X, { key: 0 }, [
                r(i) ? (p(), h("button", {
                  key: 0,
                  class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm",
                  onClick: z[1] || (z[1] = //@ts-ignore
                  (...C) => r(s) && r(s)(...C))
                }, [
                  P(r(M), {
                    icon: "tabler:refresh-dot",
                    class: "km-i",
                    "aria-hidden": "true"
                  }),
                  z[9] || (z[9] = F(" Update ", -1))
                ])) : (p(), h("button", {
                  key: 1,
                  class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm",
                  disabled: "",
                  title: r(a) || void 0
                }, [
                  P(r(M), {
                    icon: "tabler:refresh-off",
                    class: "km-i",
                    "aria-hidden": "true"
                  }),
                  z[10] || (z[10] = F(" Update ", -1))
                ], 8, pb)),
                r(l) ? (p(), h("button", {
                  key: 2,
                  class: "km-btn km-btn-text km-btn-danger km-btn-sm",
                  onClick: z[2] || (z[2] = //@ts-ignore
                  (...C) => r(d) && r(d)(...C))
                }, [
                  P(r(M), {
                    icon: "tabler:trash",
                    class: "km-i",
                    "aria-hidden": "true"
                  }),
                  z[11] || (z[11] = F(" Uninstall ", -1))
                ])) : r(u) ? (p(), h("button", {
                  key: 3,
                  class: "km-btn km-btn-text km-btn-danger km-btn-sm",
                  disabled: "",
                  title: r(u)
                }, [
                  P(r(M), {
                    icon: "tabler:trash-off",
                    class: "km-i",
                    "aria-hidden": "true"
                  }),
                  z[12] || (z[12] = F(" Uninstall ", -1))
                ], 8, mb)) : _("", !0)
              ], 64)) : (p(), h("button", {
                key: 1,
                class: "km-btn km-btn-sm",
                onClick: z[3] || (z[3] = //@ts-ignore
                (...C) => r(m) && r(m)(...C))
              }, [
                P(r(M), {
                  icon: "tabler:download",
                  class: "km-i",
                  "aria-hidden": "true"
                }),
                z[13] || (z[13] = F(" Install ", -1))
              ])),
              r(n)?.repository ? (p(), h("a", {
                key: 2,
                href: String(r(n).repository),
                target: "_blank",
                rel: "noopener",
                class: "d-link"
              }, [
                P(r(M), {
                  icon: "tabler:brand-github",
                  class: "km-i-sm",
                  "aria-hidden": "true"
                }),
                z[14] || (z[14] = F(" Repository", -1))
              ], 8, fb)) : _("", !0),
              r(n)?.homepage ? (p(), h("a", {
                key: 3,
                href: String(r(n).homepage),
                target: "_blank",
                rel: "noopener",
                class: "d-link"
              }, [
                P(r(M), {
                  icon: "tabler:home",
                  class: "km-i-sm",
                  "aria-hidden": "true"
                }),
                z[15] || (z[15] = F(" Homepage", -1))
              ], 8, hb)) : _("", !0)
            ])
          ])
        ]),
        c("div", bb, [
          c("aside", vb, [
            c("section", gb, [
              c("div", yb, [
                P(r(M), {
                  icon: "tabler:download",
                  class: "d-row-i",
                  "aria-hidden": "true"
                }),
                z[16] || (z[16] = c("span", { class: "d-row-k" }, "Downloads", -1)),
                c("span", kb, k(r(Gn)(r(n)?.total_downloads)), 1)
              ]),
              r(n)?.favorites_count ? (p(), h("div", $b, [
                P(r(M), {
                  icon: "tabler:star",
                  class: "d-row-i",
                  "aria-hidden": "true"
                }),
                z[17] || (z[17] = c("span", { class: "d-row-k" }, "Favorites", -1)),
                c("span", Sb, k(r(n).favorites_count), 1)
              ])) : _("", !0),
              r(n)?.license ? (p(), h("div", wb, [
                P(r(M), {
                  icon: "tabler:license",
                  class: "d-row-i",
                  "aria-hidden": "true"
                }),
                z[18] || (z[18] = c("span", { class: "d-row-k" }, "License", -1)),
                c("span", _b, k(r(n).license), 1)
              ])) : _("", !0),
              r(n)?.type ? (p(), h("div", Cb, [
                P(r(M), {
                  icon: "tabler:category",
                  class: "d-row-i",
                  "aria-hidden": "true"
                }),
                z[19] || (z[19] = c("span", { class: "d-row-k" }, "Type", -1)),
                c("span", Ob, k(r(n).type), 1)
              ])) : _("", !0),
              r(o) ? (p(), h("div", xb, [
                P(r(M), {
                  icon: "tabler:lock",
                  class: "d-row-i",
                  "aria-hidden": "true"
                }),
                z[20] || (z[20] = c("span", { class: "d-row-k" }, "Visibility", -1)),
                z[21] || (z[21] = c("span", { class: "d-row-v" }, "Private", -1))
              ])) : _("", !0),
              r(n)?.update_time ? (p(), h("div", Ib, [
                P(r(M), {
                  icon: "tabler:clock",
                  class: "d-row-i",
                  "aria-hidden": "true"
                }),
                z[22] || (z[22] = c("span", { class: "d-row-k" }, "Updated", -1)),
                c("span", Pb, k(r(Vo)(r(n).update_time, { maxUnit: "year" })), 1)
              ])) : _("", !0),
              r(v)?.entry_count ? (p(), h("div", Tb, [
                P(r(M), {
                  icon: "tabler:list-numbers",
                  class: "d-row-i",
                  "aria-hidden": "true"
                }),
                z[23] || (z[23] = c("span", { class: "d-row-k" }, "Entries", -1)),
                c("span", Lb, k(r(v).entry_count), 1)
              ])) : _("", !0),
              r(v)?.size_bytes ? (p(), h("div", Ab, [
                P(r(M), {
                  icon: "tabler:weight",
                  class: "d-row-i",
                  "aria-hidden": "true"
                }),
                z[24] || (z[24] = c("span", { class: "d-row-k" }, "Size", -1)),
                c("span", Eb, k(r(Un)(r(v).size_bytes)), 1)
              ])) : _("", !0)
            ]),
            (r(n)?.keywords || []).length ? (p(), h("section", jb, [
              z[25] || (z[25] = c("div", { class: "d-block-title" }, "Keywords", -1)),
              c("div", Vb, [
                (p(!0), h(X, null, ce(r(n).keywords, (C) => (p(), h("span", {
                  key: C,
                  class: "provides-pill"
                }, k(C), 1))), 128))
              ])
            ])) : _("", !0),
            (r(v)?.dependencies || []).length ? (p(), h("section", zb, [
              z[26] || (z[26] = c("div", { class: "d-block-title" }, "Dependencies", -1)),
              c("div", Mb, [
                (p(!0), h(X, null, ce(r(v).dependencies, (C, V) => (p(), h("div", {
                  key: V,
                  class: "km-dep"
                }, [
                  c("span", Db, k(C.org) + "/" + k(C.name), 1),
                  c("span", Bb, k(C.version_constraint), 1)
                ]))), 128))
              ])
            ])) : _("", !0),
            (r(v)?.lua_modules || []).length ? (p(), h("section", Fb, [
              z[27] || (z[27] = c("div", { class: "d-block-title" }, "Lua modules", -1)),
              c("div", Rb, [
                (p(!0), h(X, null, ce(r(v).lua_modules, (C) => (p(), h("span", {
                  key: C,
                  class: "provides-pill"
                }, k(C), 1))), 128))
              ])
            ])) : _("", !0)
          ]),
          c("main", Nb, [
            c("div", Ub, [
              c("button", {
                class: oe(["d-tab", { active: r(g) === "readme" }]),
                disabled: !r(w) && !r(x),
                onClick: z[4] || (z[4] = (C) => g.value = "readme")
              }, "Readme", 10, Hb),
              c("button", {
                class: oe(["d-tab", { active: r(g) === "overview" }]),
                onClick: z[5] || (z[5] = (C) => g.value = "overview")
              }, "Overview", 2),
              c("button", {
                class: oe(["d-tab", { active: r(g) === "versions" }]),
                onClick: z[6] || (z[6] = (C) => g.value = "versions")
              }, [
                z[28] || (z[28] = F("Versions ", -1)),
                r(S).length ? (p(), h("span", Kb, k(r(S).length), 1)) : _("", !0)
              ], 2)
            ]),
            c("div", qb, [
              r(x) ? (p(), h("div", Wb, [
                P(r(M), {
                  icon: "tabler:loader-2",
                  class: "km-i spin",
                  "aria-hidden": "true"
                }),
                z[29] || (z[29] = F(" Loading… ", -1))
              ])) : r(g) === "readme" ? (p(), h(X, { key: 1 }, [
                r(w) ? (p(), h("article", Zb, [
                  P(ie, { source: r(w) }, null, 8, ["source"])
                ])) : (p(), h("div", Gb, [
                  P(r(M), {
                    icon: "tabler:file-off",
                    class: "km-i-xl km-dim",
                    "aria-hidden": "true"
                  }),
                  z[30] || (z[30] = c("p", { class: "km-mt" }, "No README provided.", -1))
                ]))
              ], 64)) : r(g) === "overview" ? (p(), h("div", Yb, [
                r(T).length ? (p(), h("section", Xb, [
                  c("div", Jb, [
                    P(r(M), {
                      icon: "tabler:settings-2",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    z[31] || (z[31] = F(" Environment ", -1)),
                    c("span", Qb, k(r(T).length), 1)
                  ]),
                  z[32] || (z[32] = c("p", { class: "d-sub" }, "Variables this module reads — set them in your environment.", -1)),
                  c("div", ev, [
                    (p(!0), h(X, null, ce(r(T), (C) => (p(), h("div", {
                      key: C.id,
                      class: "d-field d-field-env"
                    }, [
                      c("span", tv, [
                        P(r(M), {
                          icon: r(I)(C, "tabler:variable"),
                          class: "km-i",
                          "aria-hidden": "true"
                        }, null, 8, ["icon"])
                      ]),
                      c("span", nv, [
                        c("span", ov, k(r(y)(C)), 1),
                        r(b)(C) ? (p(), h("span", iv, k(r(b)(C)), 1)) : _("", !0)
                      ])
                    ]))), 128))
                  ])
                ])) : _("", !0),
                r(j).length || (r(v)?.requirements || []).length ? (p(), h("section", rv, [
                  c("div", av, [
                    P(r(M), {
                      icon: "tabler:plug-connected",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    z[33] || (z[33] = F(" Requires", -1))
                  ]),
                  z[34] || (z[34] = c("p", { class: "d-sub" }, "Host resources this module is wired to at install.", -1)),
                  c("div", sv, [
                    r(j).length ? (p(!0), h(X, { key: 0 }, ce(r(j), (C) => (p(), h("div", {
                      key: C.id,
                      class: "d-field d-field-req"
                    }, [
                      c("span", lv, [
                        P(r(M), {
                          icon: "tabler:link",
                          class: "km-i",
                          "aria-hidden": "true"
                        })
                      ]),
                      c("span", uv, [
                        c("span", dv, k(r(y)(C)), 1),
                        r(b)(C) ? (p(), h("span", cv, k(r(b)(C)), 1)) : _("", !0)
                      ])
                    ]))), 128)) : (p(!0), h(X, { key: 1 }, ce(r(v).requirements, (C, V) => (p(), h("div", {
                      key: V,
                      class: "d-field d-field-req"
                    }, [
                      c("span", pv, [
                        P(r(M), {
                          icon: "tabler:link",
                          class: "km-i",
                          "aria-hidden": "true"
                        })
                      ]),
                      c("span", mv, [
                        c("span", fv, k(C.name), 1),
                        C.description ? (p(), h("span", hv, k(C.description), 1)) : _("", !0),
                        C.default ? (p(), h("span", bv, "default: " + k(C.default), 1)) : _("", !0)
                      ])
                    ]))), 128))
                  ])
                ])) : _("", !0),
                c("section", null, [
                  c("div", vv, [
                    P(r(M), {
                      icon: "tabler:package",
                      class: "km-i-sm d-accent-i",
                      "aria-hidden": "true"
                    }),
                    z[35] || (z[35] = F(" Provides", -1))
                  ]),
                  $.value.installed ? r(W).length ? (p(), h("div", wv, [
                    (p(!0), h(X, null, ce(r(W), (C) => (p(), h("div", {
                      key: C.key
                    }, [
                      c("div", _v, [
                        P(r(M), {
                          icon: C.icon,
                          class: "km-i-sm d-accent-i",
                          "aria-hidden": "true"
                        }, null, 8, ["icon"]),
                        F(" " + k(C.label) + " ", 1),
                        c("span", Cv, k(C.items.length), 1)
                      ]),
                      c("div", Ov, [
                        (p(!0), h(X, null, ce(C.items, (V) => (p(), h("div", {
                          key: V.id,
                          class: "d-entry"
                        }, [
                          c("div", xv, k(V.meta && V.meta.title || r(y)(V)), 1),
                          c("div", Iv, k(V.id), 1)
                        ]))), 128))
                      ])
                    ]))), 128))
                  ])) : (p(), h("p", Sv, "No registry entries.")) : (p(), h("div", gv, [
                    (r(v)?.entry_kinds || []).length ? (p(), h(X, { key: 0 }, [
                      c("p", yv, "Publishes " + k(r(v).entry_count || r(v).entry_kinds.length) + " entries; per-entry detail resolves after install.", 1),
                      c("div", kv, [
                        (p(!0), h(X, null, ce(r(v).entry_kinds, (C) => (p(), h("span", {
                          key: C,
                          class: "provides-pill"
                        }, k(C), 1))), 128))
                      ])
                    ], 64)) : (p(), h("p", $v, [...z[36] || (z[36] = [
                      F("See the ", -1),
                      c("strong", null, "Readme", -1),
                      F(" tab for details.", -1)
                    ])]))
                  ]))
                ])
              ])) : (p(), h(X, { key: 3 }, [
                r(S).length ? (p(), h("div", Tv, [
                  (p(!0), h(X, null, ce(r(S), (C) => (p(), h("div", {
                    key: C.version,
                    class: "d-ver-row"
                  }, [
                    c("span", Lv, k(C.version), 1),
                    C.create_time ? (p(), h("span", Av, k(r(Vo)(C.create_time, { maxUnit: "year" })), 1)) : _("", !0),
                    z[37] || (z[37] = c("span", { class: "km-grow" }, null, -1)),
                    C.download_count ? (p(), h("span", Ev, [
                      P(r(M), {
                        icon: "tabler:download",
                        class: "km-i-xs",
                        "aria-hidden": "true"
                      }),
                      F(" " + k(r(Gn)(C.download_count)), 1)
                    ])) : _("", !0),
                    C.size_bytes ? (p(), h("span", jv, k(r(Un)(C.size_bytes)), 1)) : _("", !0)
                  ]))), 128))
                ])) : (p(), h("p", Pv, "No published versions."))
              ], 64))
            ])
          ])
        ])
      ], 4);
    };
  }
}), zv = { class: "km" }, Mv = {
  key: 1,
  class: "km-denied"
}, Dv = { class: "km-denied-box" }, Bv = {
  key: 2,
  class: "km-scroll"
}, Fv = {
  key: 1,
  class: "km-list"
}, Rv = { class: "km-sec-bar km-sec-bar-toolbar" }, Nv = { class: "km-controls" }, Uv = ["disabled"], Hv = ["disabled"], Kv = ["disabled"], qv = {
  key: 0,
  class: "km-btn-count"
}, Wv = ["disabled"], Gv = { class: "km-hub-auth-panel" }, Zv = { class: "km-hub-auth-row" }, Yv = {
  key: 0,
  class: "km-hub-auth-meta"
}, Xv = { class: "km-hub-auth-meta" }, Jv = {
  key: 1,
  class: "km-hub-auth-orgs"
}, Qv = { class: "km-hub-auth-org-name" }, eg = {
  key: 0,
  class: "km-hub-auth-org-role"
}, tg = { class: "km-hub-auth-hint" }, ng = ["href"], og = { class: "km-hub-auth-actions" }, ig = ["disabled"], rg = {
  key: 0,
  class: "km-msg km-msg-err"
}, ag = {
  key: 1,
  class: "km-msg"
}, sg = {
  key: 2,
  class: "km-msg km-msg-err"
}, lg = {
  key: 3,
  class: "km-loading km-center"
}, ug = { key: 0 }, dg = { class: "hub-section-head" }, cg = { class: "feat-grid" }, pg = ["onClick"], mg = { class: "feat-icon" }, fg = { class: "feat-body" }, hg = { class: "km-row-wrap" }, bg = { class: "feat-name" }, vg = {
  key: 0,
  class: "badge-app kx-tag-caps"
}, gg = {
  key: 1,
  class: "badge-private kx-tag-caps",
  title: "Private Hub module"
}, yg = {
  key: 2,
  class: "badge-warn kx-tag-caps"
}, kg = { class: "feat-org" }, $g = {
  key: 0,
  class: "feat-desc"
}, Sg = { class: "feat-meta" }, wg = { class: "meta-pill" }, _g = { class: "meta-pill" }, Cg = {
  key: 0,
  class: "meta-pill"
}, Og = { class: "hub-section-head" }, xg = { class: "hub-section-title" }, Ig = { class: "hub-section-sub" }, Pg = { class: "mod-grid" }, Tg = ["onClick"], Lg = { class: "mod-icon" }, Ag = { class: "mod-body" }, Eg = { class: "km-row-wrap" }, jg = { class: "mod-name" }, Vg = { class: "mod-version" }, zg = {
  key: 0,
  class: "badge-app kx-tag-caps"
}, Mg = {
  key: 1,
  class: "badge-private kx-tag-caps",
  title: "Private Hub module"
}, Dg = {
  key: 2,
  class: "badge-warn kx-tag-caps"
}, Bg = { class: "mod-org" }, Fg = {
  key: 0,
  class: "mod-desc"
}, Rg = { class: "mod-foot" }, Ng = { class: "foot-stat" }, Ug = {
  key: 0,
  class: "foot-stat"
}, Hg = {
  key: 1,
  class: "foot-stat km-dim"
}, Kg = {
  key: 2,
  class: "foot-stat km-dim km-ml-auto"
}, qg = {
  key: 5,
  class: "km-empty"
}, Wg = { class: "km-muted" }, Gg = { class: "km-mono" }, Zg = {
  key: 6,
  class: "km-empty"
}, Yg = {
  key: 7,
  class: "km-empty"
}, Xg = { class: "km-muted" }, Jg = { class: "km-mono" }, Qg = {
  key: 0,
  class: "km-installed"
}, ey = ["aria-expanded"], ty = { class: "km-sub" }, ny = {
  key: 0,
  class: "km-update-count"
}, oy = {
  key: 1,
  class: "km-update-count"
}, iy = {
  key: 0,
  class: "km-msg km-msg-err km-mb"
}, ry = {
  key: 1,
  class: "inst-toolbar"
}, ay = {
  key: 2,
  class: "inst-list"
}, sy = ["onClick"], ly = { class: "inst-icon" }, uy = { class: "km-grow km-min0" }, dy = { class: "km-row-tight" }, cy = { class: "inst-name" }, py = {
  key: 0,
  class: "badge-app kx-tag-caps"
}, my = {
  key: 1,
  class: "badge-private kx-tag-caps",
  title: "Private Hub module"
}, fy = {
  key: 2,
  class: "km-chip"
}, hy = ["title"], by = { class: "inst-id" }, vy = {
  key: 0,
  class: "km-dim"
}, gy = {
  key: 0,
  class: "inst-update-msg"
}, yy = { class: "inst-ver" }, ky = { class: "inst-migs" }, $y = { class: "inst-actions" }, Sy = ["disabled", "aria-label", "onClick"], wy = ["disabled", "aria-label", "onClick"], _y = ["title", "aria-label"], Cy = ["aria-label", "onClick"], Oy = ["title", "aria-label"], xy = {
  key: 3,
  class: "km-empty inst-empty"
}, Iy = { class: "km-modal-body" }, Py = { class: "km-uninstall-target" }, Ty = { class: "km-mono" }, Ly = { class: "km-dim" }, Ay = {
  key: 0,
  class: "km-msg km-msg-err"
}, Ey = {
  key: 0,
  class: "km-code"
}, jy = {
  key: 1,
  class: "km-mt"
}, Vy = {
  key: 1,
  class: "km-msg km-msg-info"
}, zy = {
  key: 2,
  class: "km-running"
}, My = {
  key: 3,
  class: "km-uninstall-preview"
}, Dy = {
  key: 0,
  class: "km-msg"
}, By = {
  key: 1,
  class: "km-preview-block"
}, Fy = { class: "km-mono" }, Ry = { class: "km-dim" }, Ny = {
  key: 2,
  class: "km-preview-block"
}, Uy = { class: "km-mono" }, Hy = { class: "km-dim" }, Ky = {
  key: 3,
  class: "km-preview-block"
}, qy = { class: "km-mono" }, Wy = { class: "km-dim" }, Gy = {
  key: 4,
  class: "km-ledger"
}, Zy = { class: "km-ledger-step" }, Yy = { class: "km-grow" }, Xy = { class: "km-chip" }, Jy = {
  key: 0,
  class: "km-ledger-msg"
}, Qy = {
  key: 5,
  class: "km-running"
}, e1 = { class: "km-grow km-running-label" }, t1 = { class: "km-dim" }, n1 = ["disabled"], o1 = ["disabled"], i1 = ["disabled", "title"], r1 = /* @__PURE__ */ En({
  __name: "modules",
  setup(t) {
    const e = Vd(), {
      LABEL: n,
      HUB_PORTAL: o,
      UNINSTALL_MIGRATION_OPTIONS: i,
      accessDenied: a,
      statusBanner: l,
      hubConnected: u,
      hubStatus: s,
      hubToken: d,
      showTokenPanel: m,
      hubConnecting: f,
      hubError: v,
      hubOrgs: g,
      hubIdentity: w,
      hubTokenStored: x,
      hubTokenExpired: S,
      hubTokenIcon: T,
      hubTokenButtonLabel: j,
      hubExpiry: I,
      saveHubToken: y,
      clearHubToken: b,
      selected: W,
      selectedModule: $,
      detailReadme: L,
      detailLoading: z,
      detailTab: ie,
      detailVersions: C,
      envVars: V,
      requirements: D,
      detailGroups: H,
      versionMeta: J,
      selectedCanUpdate: ee,
      selectedUpdateDisabledReason: te,
      selectedCanUninstall: pe,
      selectedIsPrivate: re,
      selectedUninstallBlockedReason: ge,
      entryName: _e,
      entryDesc: Pe,
      entryIcon: He,
      openDetail: Oe,
      closeDetail: Dt,
      detailInstall: Ot,
      detailUpdate: Bt,
      detailUninstall: Le,
      installed: gt,
      installedFilter: dt,
      installedKindFilter: et,
      installedTotal: ct,
      updateScanLoading: pt,
      updateAllRunning: Be,
      availableUpdates: Ke,
      installedLoading: qe,
      installedError: Ae,
      installedOpen: tt,
      catalog: Ft,
      catalogLoading: mt,
      catalogError: nt,
      catalogInstalledTotal: ft,
      visibleCatalogInstalled: yt,
      browseFilter: ht,
      sortBy: A,
      availableItems: B,
      featured: R,
      sortedItems: q,
      visibleInstalled: Y,
      catalogItemFor: Q,
      installedAccent: be,
      installedIcon: Ee,
      installedIsRoot: xt,
      installedIsPrivate: Yt,
      installedRole: $e,
      installedUsedBy: We,
      installedCanUpdate: Rt,
      installedUpdateDisabledReason: It,
      installedCanUninstall: Xt,
      installedUninstallDisabledReason: Ce,
      installedMigrationSummary: ot,
      updateInfoForDep: Me,
      updateStatusLabel: jn,
      updateStatusIcon: yn,
      updateStatusBusy: Nt,
      scanInstalledUpdates: kn,
      updateInstalledDependency: it,
      updateAllAvailable: rt,
      refreshAll: Pt,
      installTarget: je,
      closeInstallDialog: Ut,
      onInstallChanged: Ht,
      openUpdateDialog: Vn,
      uninstallDialogOpen: kt,
      uninstallDep: Kt,
      uninstallPolicy: Tt,
      uninstallRunning: De,
      uninstallPreviewLoading: Fe,
      uninstallPreview: Te,
      uninstallExecution: $t,
      uninstallCode: at,
      uninstallError: qt,
      uninstallRequiredBy: Jt,
      uninstallBlockedReason: Qt,
      uninstallActionBlockedReason: st,
      uninstallPhase: Lt,
      uninstallElapsedSec: en,
      openUninstallDialog: $n,
      previewUninstall: At,
      executionStepLabel: Sn,
      runUninstall: Wt
    } = e, wn = U(null);
    return (Gt, E) => (p(), h("div", zv, [
      r(l) ? (p(), h("div", {
        key: 0,
        class: oe(["km-banner", r(l).kind === "ok" ? "km-banner-ok" : "km-banner-err"])
      }, k(r(l).message), 3)) : _("", !0),
      r(a) ? (p(), h("div", Mv, [
        c("div", Dv, [
          P(r(M), {
            icon: "tabler:lock",
            class: "km-denied-icon",
            "aria-hidden": "true"
          }),
          E[19] || (E[19] = c("p", { class: "km-denied-title" }, "Admins only", -1)),
          E[20] || (E[20] = c("p", { class: "km-denied-sub" }, [
            F("You need the "),
            c("code", { class: "km-mono" }, "app.security:admin"),
            F(" scope to manage modules.")
          ], -1))
        ])
      ])) : (p(), h("div", Bv, [
        r(W) ? (p(), xe(Vv, {
          key: 0,
          page: r(e)
        }, null, 8, ["page"])) : (p(), h("div", Fv, [
          c("section", null, [
            c("div", Rv, [
              c("div", Nv, [
                c("button", {
                  class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm",
                  disabled: r(qe) || r(mt),
                  onClick: E[0] || (E[0] = //@ts-ignore
                  (...O) => r(Pt) && r(Pt)(...O))
                }, [
                  P(r(M), {
                    icon: r(qe) || r(mt) ? "tabler:loader-2" : "tabler:refresh",
                    class: oe(["km-i", (r(qe) || r(mt)) && "spin"]),
                    "aria-hidden": "true"
                  }, null, 8, ["icon", "class"]),
                  E[21] || (E[21] = F(" Refresh ", -1))
                ], 8, Uv),
                c("button", {
                  class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm",
                  disabled: r(pt) || r(Be) || r(qe) || r(ct) === 0,
                  onClick: E[1] || (E[1] = //@ts-ignore
                  (...O) => r(kn) && r(kn)(...O))
                }, [
                  P(r(M), {
                    icon: r(pt) ? "tabler:loader-2" : "tabler:refresh-dot",
                    class: oe(["km-i", r(pt) && "spin"]),
                    "aria-hidden": "true"
                  }, null, 8, ["icon", "class"]),
                  E[22] || (E[22] = F(" Scan updates ", -1))
                ], 8, Hv),
                c("button", {
                  class: "km-btn km-btn-sm",
                  disabled: r(Be) || r(pt) || r(Ke).length === 0,
                  onClick: E[2] || (E[2] = //@ts-ignore
                  (...O) => r(rt) && r(rt)(...O))
                }, [
                  P(r(M), {
                    icon: r(Be) ? "tabler:loader-2" : "tabler:download",
                    class: oe(["km-i", r(Be) && "spin"]),
                    "aria-hidden": "true"
                  }, null, 8, ["icon", "class"]),
                  E[23] || (E[23] = F(" Update all ", -1)),
                  r(Ke).length ? (p(), h("span", qv, k(r(Ke).length), 1)) : _("", !0)
                ], 8, Kv),
                Xe(c("input", {
                  "onUpdate:modelValue": E[3] || (E[3] = (O) => tn(ht) ? ht.value = O : null),
                  class: "km-input km-filter",
                  placeholder: "Filter…"
                }, null, 512), [
                  [Po, r(ht)]
                ]),
                P(r(To), {
                  modelValue: r(A),
                  "onUpdate:modelValue": E[4] || (E[4] = (O) => tn(A) ? A.value = O : null),
                  class: "km-sort",
                  options: [
                    { label: "Top downloads", value: "downloads" },
                    { label: "Name A→Z", value: "name" },
                    { label: "Recently updated", value: "recent" }
                  ],
                  "option-label": "label",
                  "option-value": "value",
                  "aria-label": "Sort modules"
                }, null, 8, ["modelValue"]),
                c("div", {
                  ref_key: "anchorEl",
                  ref: wn,
                  class: "km-hub-auth"
                }, [
                  c("button", {
                    class: oe(["km-btn km-btn-sm", r(u) ? "km-btn-secondary km-btn-outlined" : r(S) ? "km-btn-warning km-btn-outlined" : ""]),
                    disabled: r(f),
                    onClick: E[5] || (E[5] = (O) => m.value = !r(m))
                  }, [
                    P(r(M), {
                      icon: r(T),
                      class: "km-i",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"]),
                    F(" " + k(r(j)) + " ", 1),
                    P(r(M), {
                      icon: "tabler:chevron-down",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    })
                  ], 10, Wv),
                  P(ua, {
                    open: r(m),
                    "onUpdate:open": E[10] || (E[10] = (O) => tn(m) ? m.value = O : null),
                    anchor: wn.value,
                    align: "right",
                    width: 300
                  }, {
                    default: Ie(() => [
                      c("div", Gv, [
                        E[27] || (E[27] = c("div", { class: "km-hub-auth-title" }, "Wippy Hub token", -1)),
                        r(x) ? (p(), h("div", {
                          key: 0,
                          class: oe(["km-hub-auth-active", r(S) && "is-expired"])
                        }, [
                          c("div", Zv, [
                            P(r(M), {
                              icon: r(S) ? "tabler:alert-triangle" : "tabler:circle-check-filled",
                              class: oe(["km-i-sm", r(S) ? "km-hub-warn" : "km-hub-ok"]),
                              "aria-hidden": "true"
                            }, null, 8, ["icon", "class"]),
                            c("span", null, [
                              F(k(r(S) ? "Token expired" : "Token active"), 1),
                              r(w) ? (p(), h(X, { key: 0 }, [
                                E[24] || (E[24] = F(" — ", -1)),
                                c("strong", null, k(r(w)), 1)
                              ], 64)) : _("", !0)
                            ])
                          ]),
                          r(s)?.registry ? (p(), h("div", Yv, k(r(s).registry), 1)) : _("", !0),
                          c("div", Xv, [
                            r(s)?.scope ? (p(), h(X, { key: 0 }, [
                              F("scope: " + k(r(s).scope), 1)
                            ], 64)) : _("", !0),
                            r(I) ? (p(), h(X, { key: 1 }, [
                              F(" · expires " + k(r(I)), 1)
                            ], 64)) : _("", !0)
                          ]),
                          r(g).length ? (p(), h("div", Jv, [
                            E[25] || (E[25] = c("div", { class: "km-hub-auth-orgs-label" }, "Organizations", -1)),
                            (p(!0), h(X, null, ce(r(g), (O) => (p(), h("div", {
                              key: O.id || O.name,
                              class: "km-hub-auth-org"
                            }, [
                              P(r(M), {
                                icon: "tabler:building",
                                class: "km-i-sm",
                                "aria-hidden": "true"
                              }),
                              c("span", Qv, k(O.display_name || O.name), 1),
                              O.role ? (p(), h("span", eg, k(O.role), 1)) : _("", !0)
                            ]))), 128))
                          ])) : _("", !0)
                        ], 2)) : _("", !0),
                        c("p", tg, [
                          F(k(r(x) ? "Replace the token, or" : "Paste a Hub registry token to browse and install private modules.") + " ", 1),
                          r(x) ? (p(), h(X, { key: 0 }, [
                            F("create a new one")
                          ], 64)) : _("", !0),
                          c("a", {
                            href: r(o),
                            target: "_blank",
                            rel: "noopener"
                          }, k(r(x) ? "↗" : "Create one →"), 9, ng)
                        ]),
                        Xe(c("input", {
                          "onUpdate:modelValue": E[6] || (E[6] = (O) => tn(d) ? d.value = O : null),
                          type: "password",
                          class: "km-input km-hub-auth-input",
                          placeholder: "wpy_…",
                          autocomplete: "off",
                          onKeyup: E[7] || (E[7] = ds(
                            //@ts-ignore
                            (...O) => r(y) && r(y)(...O),
                            ["enter"]
                          ))
                        }, null, 544), [
                          [Po, r(d)]
                        ]),
                        c("div", og, [
                          c("button", {
                            class: "km-btn km-btn-sm",
                            disabled: r(f),
                            onClick: E[8] || (E[8] = //@ts-ignore
                            (...O) => r(y) && r(y)(...O))
                          }, [
                            P(r(M), {
                              icon: r(f) ? "tabler:loader-2" : "tabler:device-floppy",
                              class: oe(["km-i", r(f) && "spin"]),
                              "aria-hidden": "true"
                            }, null, 8, ["icon", "class"]),
                            F(" " + k(r(f) ? "Saving…" : r(x) ? "Replace token" : "Save token"), 1)
                          ], 8, ig),
                          r(x) ? (p(), h("button", {
                            key: 0,
                            class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm",
                            onClick: E[9] || (E[9] = //@ts-ignore
                            (...O) => r(b) && r(b)(...O))
                          }, [
                            P(r(M), {
                              icon: "tabler:trash",
                              class: "km-i",
                              "aria-hidden": "true"
                            }),
                            E[26] || (E[26] = F(" Clear ", -1))
                          ])) : _("", !0)
                        ])
                      ])
                    ]),
                    _: 1
                  }, 8, ["open", "anchor"])
                ], 512)
              ])
            ]),
            r(v) ? (p(), h("div", rg, k(r(v)), 1)) : _("", !0),
            !r(u) && r(S) ? (p(), h("div", ag, "Your Wippy Hub token is expired.")) : _("", !0),
            r(nt) ? (p(), h("div", sg, k(r(nt)), 1)) : _("", !0),
            r(mt) || r(qe) ? (p(), h("div", lg, [
              P(r(M), {
                icon: "tabler:loader-2",
                class: "km-i spin",
                "aria-hidden": "true"
              }),
              E[28] || (E[28] = F(" Loading modules… ", -1))
            ])) : r(B).length > 0 ? (p(), h(X, { key: 4 }, [
              r(R).length ? (p(), h("div", ug, [
                c("div", dg, [
                  P(r(M), {
                    icon: "tabler:flame",
                    class: "km-i km-flame",
                    "aria-hidden": "true"
                  }),
                  E[29] || (E[29] = c("span", { class: "hub-section-title" }, "Most popular", -1)),
                  E[30] || (E[30] = c("span", { class: "hub-section-sub" }, "by downloads", -1))
                ]),
                c("div", cg, [
                  (p(!0), h(X, null, ce(r(R), (O) => (p(), h("button", {
                    key: "f" + r(jo)(O),
                    class: "feat-card",
                    style: hn({ "--accent": r(Wn)(O) }),
                    onClick: (bt) => r(Oe)(O)
                  }, [
                    E[32] || (E[32] = c("span", { class: "feat-strip" }, null, -1)),
                    c("span", mg, [
                      P(r(M), {
                        icon: r(Tn)(O),
                        class: "km-i-lg",
                        "aria-hidden": "true"
                      }, null, 8, ["icon"])
                    ]),
                    c("span", fg, [
                      c("span", hg, [
                        c("span", bg, k(r(Pn)(O)), 1),
                        r(Nn)(O) ? (p(), h("span", vg, "app")) : _("", !0),
                        r(qn)(O) ? (p(), h("span", gg, [
                          P(r(M), {
                            icon: "tabler:lock",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          E[31] || (E[31] = F(" private", -1))
                        ])) : _("", !0),
                        O.deprecated ? (p(), h("span", yg, "deprecated")) : _("", !0)
                      ]),
                      c("span", kg, k(r(Ao)(O)), 1),
                      O.description ? (p(), h("span", $g, k(O.description), 1)) : _("", !0),
                      c("span", Sg, [
                        c("span", wg, [
                          P(r(M), {
                            icon: "tabler:tag",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          F(" " + k(O.latest_version || "?"), 1)
                        ]),
                        c("span", _g, [
                          P(r(M), {
                            icon: "tabler:download",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          F(" " + k(r(Gn)(O.total_downloads)), 1)
                        ]),
                        O.license ? (p(), h("span", Cg, [
                          P(r(M), {
                            icon: "tabler:license",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          F(" " + k(O.license), 1)
                        ])) : _("", !0)
                      ])
                    ])
                  ], 12, pg))), 128))
                ])
              ])) : _("", !0),
              c("div", {
                class: oe(r(R).length ? "km-mt-sm" : "")
              }, [
                c("div", Og, [
                  P(r(M), {
                    icon: "tabler:apps",
                    class: "km-i km-accent",
                    "aria-hidden": "true"
                  }),
                  c("span", xg, k(r(R).length ? "All modules" : "Available"), 1),
                  c("span", Ig, k(r(B).length) + " available", 1)
                ]),
                c("div", Pg, [
                  (p(!0), h(X, null, ce(r(q), (O) => (p(), h("button", {
                    key: r(jo)(O),
                    class: "mod-card",
                    style: hn({ "--accent": r(Wn)(O) }),
                    onClick: (bt) => r(Oe)(O)
                  }, [
                    c("span", Lg, [
                      P(r(M), {
                        icon: r(Tn)(O),
                        class: "km-i",
                        "aria-hidden": "true"
                      }, null, 8, ["icon"])
                    ]),
                    c("span", Ag, [
                      c("span", Eg, [
                        c("span", jg, k(r(Pn)(O)), 1),
                        c("span", Vg, k(O.latest_version || "—"), 1),
                        r(Nn)(O) ? (p(), h("span", zg, "app")) : _("", !0),
                        r(qn)(O) ? (p(), h("span", Mg, [
                          P(r(M), {
                            icon: "tabler:lock",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          E[33] || (E[33] = F(" private", -1))
                        ])) : _("", !0),
                        O.deprecated ? (p(), h("span", Dg, "deprecated")) : _("", !0)
                      ]),
                      c("span", Bg, k(r(Ao)(O)), 1),
                      O.description ? (p(), h("span", Fg, k(O.description), 1)) : _("", !0),
                      c("span", Rg, [
                        c("span", Ng, [
                          P(r(M), {
                            icon: "tabler:download",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          F(" " + k(r(Gn)(O.total_downloads)), 1)
                        ]),
                        O.favorites_count ? (p(), h("span", Ug, [
                          P(r(M), {
                            icon: "tabler:star",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          F(" " + k(O.favorites_count), 1)
                        ])) : _("", !0),
                        O.license ? (p(), h("span", Hg, k(O.license), 1)) : _("", !0),
                        O.update_time ? (p(), h("span", Kg, k(r(Vo)(O.update_time, { maxUnit: "year" })), 1)) : _("", !0)
                      ])
                    ])
                  ], 12, Tg))), 128))
                ])
              ], 2)
            ], 64)) : !r(nt) && r(Ft).length === 0 ? (p(), h("div", qg, [
              P(r(M), {
                icon: "tabler:package-off",
                class: "km-i-xl km-dim km-block",
                "aria-hidden": "true"
              }),
              c("p", Wg, [
                E[34] || (E[34] = F(" No modules tagged ", -1)),
                c("code", Gg, k(r(n)), 1),
                E[35] || (E[35] = F(" are published yet. ", -1))
              ])
            ])) : !r(nt) && r(ht) ? (p(), h("div", Zg, [...E[36] || (E[36] = [
              c("p", { class: "km-muted" }, "No available modules match this filter.", -1)
            ])])) : r(nt) ? _("", !0) : (p(), h("div", Yg, [
              P(r(M), {
                icon: "tabler:circle-check",
                class: "km-i-xl km-dim km-block",
                "aria-hidden": "true"
              }),
              c("p", Xg, [
                E[37] || (E[37] = F(" All ", -1)),
                c("code", Jg, k(r(n)), 1),
                E[38] || (E[38] = F(" modules are installed — manage them under Installed below. ", -1))
              ])
            ]))
          ]),
          r(gt).length > 0 || r(Ae) ? (p(), h("section", Qg, [
            c("button", {
              class: "km-collapse-head",
              "aria-expanded": r(tt),
              onClick: E[11] || (E[11] = (O) => tt.value = !r(tt))
            }, [
              P(r(M), {
                icon: r(tt) ? "tabler:chevron-down" : "tabler:chevron-right",
                class: "km-i",
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              E[39] || (E[39] = c("span", { class: "km-h2" }, "Installed", -1)),
              c("span", ty, [
                F(k(r(Y).length), 1),
                r(Y).length !== r(ct) ? (p(), h(X, { key: 0 }, [
                  F(" of " + k(r(ct)), 1)
                ], 64)) : _("", !0),
                F(" module" + k(r(Y).length === 1 ? "" : "s"), 1)
              ]),
              r(ft) > 0 && r(ft) !== r(ct) ? (p(), h("span", ny, k(r(yt)) + " of " + k(r(ft)) + " hub module" + k(r(ft) === 1 ? "" : "s"), 1)) : _("", !0),
              r(Ke).length ? (p(), h("span", oy, k(r(Ke).length) + " update" + k(r(Ke).length === 1 ? "" : "s"), 1)) : _("", !0)
            ], 8, ey),
            r(tt) ? (p(), h(X, { key: 0 }, [
              r(Ae) ? (p(), h("div", iy, k(r(Ae)), 1)) : _("", !0),
              r(gt).length > 0 ? (p(), h("div", ry, [
                Xe(c("input", {
                  "onUpdate:modelValue": E[12] || (E[12] = (O) => tn(dt) ? dt.value = O : null),
                  class: "km-input km-filter inst-filter",
                  placeholder: "Search installed…",
                  "aria-label": "Search installed modules"
                }, null, 512), [
                  [Po, r(dt)]
                ]),
                P(r(To), {
                  modelValue: r(et),
                  "onUpdate:modelValue": E[13] || (E[13] = (O) => tn(et) ? et.value = O : null),
                  class: "km-sort",
                  options: [
                    { label: "All installed", value: "all" },
                    { label: "Root only", value: "root" },
                    { label: "Transitive only", value: "transitive" },
                    { label: "Local replacements", value: "local" }
                  ],
                  "option-label": "label",
                  "option-value": "value",
                  "aria-label": "Filter installed modules"
                }, null, 8, ["modelValue"])
              ])) : _("", !0),
              r(Y).length > 0 ? (p(), h("div", ay, [
                (p(!0), h(X, null, ce(r(Y), (O) => (p(), h("button", {
                  key: O.id,
                  class: "inst-row",
                  style: hn({ "--accent": r(be)(O) }),
                  onClick: (bt) => r(Oe)(O)
                }, [
                  E[41] || (E[41] = c("span", {
                    class: "inst-strip",
                    "aria-hidden": "true"
                  }, null, -1)),
                  c("div", ly, [
                    P(r(M), {
                      icon: r(Ee)(O),
                      class: "km-i",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"])
                  ]),
                  c("div", uy, [
                    c("div", dy, [
                      c("span", cy, k(O.component), 1),
                      r(Nn)(r(Q)(O.component)) ? (p(), h("span", py, "app")) : _("", !0),
                      c("span", {
                        class: oe(r(xt)(O) ? "badge-installed kx-tag-caps" : "km-chip")
                      }, k(r($e)(O)), 3),
                      r(Yt)(O) ? (p(), h("span", my, [
                        P(r(M), {
                          icon: "tabler:lock",
                          class: "km-i-xs",
                          "aria-hidden": "true"
                        }),
                        E[40] || (E[40] = F(" private", -1))
                      ])) : _("", !0),
                      O.source ? (p(), h("span", fy, k(O.source), 1)) : _("", !0),
                      r(Me)(O) && r(Me)(O)?.status !== "current" ? (p(), h("span", {
                        key: 3,
                        class: oe(["inst-update", r(Me)(O)?.status]),
                        title: r(Me)(O)?.message || ""
                      }, [
                        P(r(M), {
                          icon: r(yn)(O),
                          class: oe(["km-i-xs", r(Nt)(O) && "spin"]),
                          "aria-hidden": "true"
                        }, null, 8, ["icon", "class"]),
                        F(" " + k(r(jn)(O)), 1)
                      ], 10, hy)) : _("", !0)
                    ]),
                    c("div", by, [
                      F(k(O.id) + " ", 1),
                      r(We)(O) ? (p(), h("span", vy, " · " + k(r(We)(O)), 1)) : _("", !0)
                    ]),
                    r(Me)(O)?.message ? (p(), h("div", gy, k(r(Me)(O)?.message), 1)) : _("", !0)
                  ]),
                  c("span", yy, k(r(Mt)(O)), 1),
                  c("span", ky, k(r(ot)(O)), 1),
                  c("div", $y, [
                    r(Me)(O)?.status === "available" || r(Nt)(O) ? (p(), h("button", {
                      key: 0,
                      class: "km-icon-btn",
                      disabled: r(Nt)(O) || r(Be),
                      "aria-label": `Update ${O.component}`,
                      onClick: Io((bt) => r(it)(O), ["stop"])
                    }, [
                      P(r(M), {
                        icon: r(yn)(O),
                        class: oe(["km-i", r(Nt)(O) && "spin"]),
                        "aria-hidden": "true"
                      }, null, 8, ["icon", "class"])
                    ], 8, Sy)) : r(Rt)(O) ? (p(), h("button", {
                      key: 1,
                      class: "km-icon-btn",
                      disabled: r(Be),
                      "aria-label": `Open update planner for ${O.component}`,
                      onClick: Io((bt) => r(Vn)(O), ["stop"])
                    }, [
                      P(r(M), {
                        icon: "tabler:refresh-dot",
                        class: "km-i",
                        "aria-hidden": "true"
                      })
                    ], 8, wy)) : (p(), h("button", {
                      key: 2,
                      class: "km-icon-btn",
                      disabled: "",
                      title: r(It)(O),
                      "aria-label": `Cannot update ${O.component}: ${r(It)(O)}`
                    }, [
                      P(r(M), {
                        icon: "tabler:refresh-off",
                        class: "km-i",
                        "aria-hidden": "true"
                      })
                    ], 8, _y)),
                    r(Xt)(O) ? (p(), h("button", {
                      key: 3,
                      class: "km-icon-btn km-danger",
                      "aria-label": `Uninstall ${O.component}`,
                      onClick: Io((bt) => r($n)(O), ["stop"])
                    }, [
                      P(r(M), {
                        icon: "tabler:trash",
                        class: "km-i",
                        "aria-hidden": "true"
                      })
                    ], 8, Cy)) : (p(), h("button", {
                      key: 4,
                      class: "km-icon-btn",
                      disabled: "",
                      title: r(Ce)(O),
                      "aria-label": `Cannot uninstall ${O.component}: ${r(Ce)(O)}`
                    }, [
                      P(r(M), {
                        icon: "tabler:trash-off",
                        class: "km-i",
                        "aria-hidden": "true"
                      })
                    ], 8, Oy))
                  ]),
                  P(r(M), {
                    icon: "tabler:chevron-right",
                    class: "km-i km-chev",
                    "aria-hidden": "true"
                  })
                ], 12, sy))), 128))
              ])) : r(gt).length > 0 ? (p(), h("div", xy, [
                P(r(M), {
                  icon: "tabler:filter-off",
                  class: "km-i-xl km-dim km-block",
                  "aria-hidden": "true"
                }),
                E[42] || (E[42] = c("p", { class: "km-muted" }, "No installed modules match this filter.", -1))
              ])) : _("", !0)
            ], 64)) : _("", !0)
          ])) : _("", !0)
        ]))
      ])),
      r(je) ? (p(), xe(Jh, {
        key: 3,
        open: !0,
        mode: r(je).mode,
        component: r(je).component,
        version: r(je).version,
        "current-id": r(je).currentId,
        "catalog-item": r(je).catalogItem,
        "installed-dep": r(je).installedDep,
        onClose: r(Ut),
        onChanged: r(Ht)
      }, null, 8, ["mode", "component", "version", "current-id", "catalog-item", "installed-dep", "onClose", "onChanged"])) : _("", !0),
      P(r(Jr), {
        visible: r(kt),
        "onUpdate:visible": E[18] || (E[18] = (O) => tn(kt) ? kt.value = O : null),
        modal: "",
        closable: !r(De),
        "dismissable-mask": !r(De),
        "close-on-escape": !r(De),
        class: "km-dialog",
        pt: { header: { class: "km-modal-head" }, content: { class: "km-dialog-content" }, footer: { class: "km-modal-foot" } },
        style: { width: "min(560px, calc(100vw - 40px))" }
      }, {
        header: Ie(() => [...E[43] || (E[43] = [
          c("span", null, "Uninstall module", -1)
        ])]),
        footer: Ie(() => [
          c("button", {
            class: "km-btn km-btn-text km-btn-secondary km-btn-sm",
            disabled: r(De),
            onClick: E[15] || (E[15] = (O) => kt.value = !1)
          }, "Cancel", 8, n1),
          c("button", {
            class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm",
            disabled: r(De) || r(Fe),
            onClick: E[16] || (E[16] = //@ts-ignore
            (...O) => r(At) && r(At)(...O))
          }, [
            P(r(M), {
              icon: r(Fe) ? "tabler:loader-2" : "tabler:eye",
              class: oe(["km-i", r(Fe) && "spin"]),
              "aria-hidden": "true"
            }, null, 8, ["icon", "class"]),
            E[56] || (E[56] = F(" Preview ", -1))
          ], 8, o1),
          c("button", {
            class: "km-btn km-btn-danger km-btn-sm",
            disabled: !!r(st),
            title: r(st) || void 0,
            onClick: E[17] || (E[17] = //@ts-ignore
            (...O) => r(Wt) && r(Wt)(...O))
          }, [
            P(r(M), {
              icon: r(De) ? "tabler:loader-2" : "tabler:trash",
              class: oe(["km-i", r(De) && "spin"]),
              "aria-hidden": "true"
            }, null, 8, ["icon", "class"]),
            E[57] || (E[57] = F(" Uninstall ", -1))
          ], 8, i1)
        ]),
        default: Ie(() => [
          c("div", Iy, [
            c("p", Py, [
              E[44] || (E[44] = F(" Uninstall ", -1)),
              c("code", Ty, k(r(Kt)?.component), 1),
              c("span", Ly, "(" + k(r(Kt)?.id) + ")", 1)
            ]),
            c("div", null, [
              E[45] || (E[45] = c("label", { class: "km-label" }, "Migration policy", -1)),
              P(r(To), {
                modelValue: r(Tt),
                "onUpdate:modelValue": E[14] || (E[14] = (O) => tn(Tt) ? Tt.value = O : null),
                class: "km-sort km-w-full",
                options: r(i),
                "option-label": "label",
                "option-value": "value",
                "aria-label": "Uninstall migration policy"
              }, null, 8, ["modelValue", "options"]),
              E[46] || (E[46] = c("p", { class: "km-req-desc" }, [
                F("Default "),
                c("code", { class: "km-mono" }, "block"),
                F(". Choose "),
                c("code", { class: "km-mono" }, "down"),
                F(" only if the module's down migrations are safe; data loss is possible.")
              ], -1))
            ]),
            r(qt) ? (p(), h("div", Ay, [
              r(at) ? (p(), h("span", Ey, k(r(at)), 1)) : _("", !0),
              F(k(r(qt)) + " ", 1),
              r(Jt).length ? (p(), h("div", jy, "required by: " + k(r(Jt).join(", ")), 1)) : _("", !0)
            ])) : _("", !0),
            r(Qt) ? (p(), h("div", Vy, [
              E[47] || (E[47] = c("strong", null, "Uninstall blocked:", -1)),
              F(" " + k(r(Qt)), 1)
            ])) : _("", !0),
            r(Fe) ? (p(), h("div", zy, [
              P(r(M), {
                icon: "tabler:loader-2",
                class: "km-i spin km-accent",
                "aria-hidden": "true"
              }),
              E[48] || (E[48] = c("span", { class: "km-grow km-running-label" }, "Previewing uninstall", -1))
            ])) : r(Te) ? (p(), h("div", My, [
              r(Te).warnings?.length ? (p(), h("div", Dy, [
                (p(!0), h(X, null, ce(r(Te).warnings, (O) => (p(), h("div", { key: O }, k(O), 1))), 128))
              ])) : _("", !0),
              r(Te).removed?.length ? (p(), h("div", By, [
                E[50] || (E[50] = c("div", { class: "km-preview-title" }, "Removed", -1)),
                (p(!0), h(X, null, ce(r(Te).removed, (O) => (p(), h("div", {
                  key: O.name || O.component,
                  class: "km-preview-row"
                }, [
                  P(r(M), {
                    icon: "tabler:minus",
                    class: "km-i-xs km-danger-fg",
                    "aria-hidden": "true"
                  }),
                  c("span", Fy, k(O.name || O.component), 1),
                  E[49] || (E[49] = c("span", { class: "km-grow" }, null, -1)),
                  c("span", Ry, k(O.version), 1)
                ]))), 128))
              ])) : _("", !0),
              r(Te).kept?.length ? (p(), h("div", Ny, [
                E[52] || (E[52] = c("div", { class: "km-preview-title" }, "Kept, still needed", -1)),
                (p(!0), h(X, null, ce(r(Te).kept, (O) => (p(), h("div", {
                  key: O.name || O.component,
                  class: "km-preview-row"
                }, [
                  P(r(M), {
                    icon: "tabler:lock",
                    class: "km-i-xs km-dim",
                    "aria-hidden": "true"
                  }),
                  c("span", Uy, k(O.name || O.component), 1),
                  E[51] || (E[51] = c("span", { class: "km-grow" }, null, -1)),
                  c("span", Hy, k(O.version), 1)
                ]))), 128))
              ])) : _("", !0),
              r(Te).kept_under_uncertainty?.length ? (p(), h("div", Ky, [
                E[54] || (E[54] = c("div", { class: "km-preview-title" }, "Kept under uncertainty", -1)),
                (p(!0), h(X, null, ce(r(Te).kept_under_uncertainty, (O) => (p(), h("div", {
                  key: O.name || O.component,
                  class: "km-preview-row"
                }, [
                  P(r(M), {
                    icon: "tabler:help",
                    class: "km-i-xs km-dim",
                    "aria-hidden": "true"
                  }),
                  c("span", qy, k(O.name || O.component), 1),
                  E[53] || (E[53] = c("span", { class: "km-grow" }, null, -1)),
                  c("span", Wy, k(O.reason || O.version), 1)
                ]))), 128))
              ])) : _("", !0)
            ])) : _("", !0),
            r($t).length ? (p(), h("div", Gy, [
              E[55] || (E[55] = c("div", { class: "km-panel-title" }, "Execution ledger", -1)),
              (p(!0), h(X, null, ce(r($t), (O, bt) => (p(), h("div", {
                key: `${O.step}-${bt}`,
                class: oe(["km-ledger-row", O.status === "failed" || O.status === "rollback_failed" ? "km-ledger-bad" : O.status === "rolled_back" ? "km-ledger-warn" : "km-ledger-ok"])
              }, [
                c("span", Zy, k(bt + 1), 1),
                c("span", Yy, k(r(Sn)(O)), 1),
                c("span", Xy, k(O.status), 1),
                O.message ? (p(), h("span", Jy, k(O.message), 1)) : _("", !0)
              ], 2))), 128))
            ])) : _("", !0),
            r(De) ? (p(), h("div", Qy, [
              P(r(M), {
                icon: "tabler:loader-2",
                class: "km-i spin km-accent",
                "aria-hidden": "true"
              }),
              c("span", e1, k(r(Lt)), 1),
              c("span", t1, k(r(en)) + "s", 1)
            ])) : _("", !0)
          ])
        ]),
        _: 1
      }, 8, ["visible", "closable", "dismissable-mask", "close-on-escape"])
    ]));
  }
}), a1 = { props: { type: "object", properties: {} } }, s1 = {
  wippy: a1
};
class l1 extends os {
  static get wippyConfig() {
    return {
      propsSchema: s1.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: is
    };
  }
  static get vueConfig() {
    return { rootComponent: r1, plugins: [rs] };
  }
}
ps(import.meta.url, l1);
//# sourceMappingURL=index.js.map
