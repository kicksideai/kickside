import wn from "primevue/config";
import Cn from "primevue/contextmenu";
import On from "primevue/menu";
import Pn from "primevue/portal";
import { renderSlot as pe, createCommentVNode as E, h as Tn, Teleport as xn, defineComponent as X, openBlock as p, createBlock as V, unref as c, withCtx as j, createVNode as O, createElementBlock as $, Fragment as de, renderList as ce, mergeProps as xe, createTextVNode as D, toDisplayString as A, createElementVNode as h, getCurrentInstance as tt, computed as K, ref as I, readonly as Ln, onMounted as Mt, nextTick as lt, watch as Be, useId as Ut, normalizeClass as ge, createSlots as jn, onBeforeUnmount as Nn, withModifiers as Ne, onUnmounted as An, withDirectives as ct, vShow as mt } from "vue";
import En from "primevue/tab";
import Vn from "primevue/tablist";
import Rn from "primevue/tabs";
import { Icon as F } from "@iconify/vue";
import { loadByTagName as Dn, api as ye, host as Bt } from "@wippy-fe/proxy";
import { a as In } from "./wc-runtime-BMe_f3Uc.js";
import Ze from "primevue/button";
import zt from "primevue/inputtext";
import Mn from "primevue/iconfield";
import Un from "primevue/inputicon";
import Bn from "primevue/tag";
import zn from "primevue/progressspinner";
import Hn from "primevue/chip";
import pt from "primevue/radiobutton";
const Wn = "data-wippy-overlay-layer";
function Ht() {
  return typeof window < "u" && typeof window.document < "u";
}
function Wt() {
  return Ht() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function Kn() {
  return Wt() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const Gn = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let qn = 0;
const ze = /* @__PURE__ */ new WeakMap();
function ft(e, t) {
  const n = e.style;
  n.setProperty("position", "fixed", "important"), n.setProperty("inset", "auto", "important"), n.setProperty("margin", "0", "important"), n.setProperty("position-anchor", t), n.setProperty("position-area", "bottom span-right"), n.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), n.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), n.setProperty("max-width", "stretch", "important");
}
function Fn(e, t) {
  if (!Gn.test(e.className))
    return;
  const n = e.style.cssText;
  ft(e, t), e.getAttribute("popover") !== "manual" && e.setAttribute("popover", "manual");
  try {
    e.matches(":popover-open") || e.showPopover();
  } catch {
  }
  if (!e.matches(":popover-open")) {
    e.removeAttribute("popover"), e.style.cssText = n;
    return;
  }
  if (!ze.has(e)) {
    const a = new MutationObserver(() => {
      const o = e.style;
      (o.top !== "auto" || o.left !== "auto" || o.margin !== "0px" || o.getPropertyPriority("top") !== "important" || o.getPropertyPriority("left") !== "important" || o.getPropertyPriority("margin") !== "important" || o.getPropertyPriority("min-width") !== "important" || o.maxWidth !== "stretch" || o.getPropertyPriority("max-width") !== "important") && ft(e, t);
    });
    a.observe(e, { attributes: !0, attributeFilter: ["style"] }), ze.set(e, a);
  }
}
function ut(e) {
  const t = ze.get(e);
  t && (t.disconnect(), ze.delete(e));
}
function Zn(e) {
  const t = e && typeof e.getRootNode == "function" ? e.getRootNode() : null;
  return t instanceof ShadowRoot ? t : null;
}
function nt(e) {
  e.style.top = "0px", e.style.left = "0px";
  const t = e.getBoundingClientRect();
  e.style.top = `${-window.scrollY - t.top}px`, e.style.left = `${-window.scrollX - t.left}px`;
}
const He = /* @__PURE__ */ new Set(), dt = /* @__PURE__ */ new WeakMap();
let vt = !1, at = !1;
function Yn() {
  at = !1;
  for (const e of He) {
    if (!e.isConnected) {
      for (const t of Array.from(e.children))
        t instanceof HTMLElement && ut(t);
      He.delete(e), dt.get(e)?.disconnect();
      continue;
    }
    e.childElementCount > 0 && nt(e);
  }
}
function ht() {
  at || (at = !0, requestAnimationFrame(Yn));
}
function Xn(e) {
  const t = document.createElement("div");
  t.setAttribute(Wn, "");
  const n = Wt();
  if (t.style.cssText = n ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", n && t.setAttribute("popover", "manual"), e.appendChild(t), n) {
    try {
      t.showPopover();
    } catch {
    }
    t.matches(":popover-open") || (t.removeAttribute("popover"), t.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  nt(t);
  const a = new MutationObserver((o) => {
    const l = t.__wippyAnchorName;
    for (const i of o) {
      if (l)
        for (const r of Array.from(i.addedNodes))
          r instanceof HTMLElement && Fn(r, l);
      for (const r of Array.from(i.removedNodes))
        r instanceof HTMLElement && ut(r);
    }
    t.isConnected && t.childElementCount > 0 && nt(t);
  });
  return a.observe(t, { childList: !0 }), dt.set(t, a), He.add(t), vt || (vt = !0, window.addEventListener("scroll", ht, { capture: !0, passive: !0 }), window.addEventListener("resize", ht, { passive: !0 })), t;
}
function yt(e) {
  if (!(!e.hostRoot || e.layer) && (e.layer = Xn(e.hostRoot), Kn())) {
    const t = e.$el ? e.$el.parentElement : null;
    t && (e.anchorName = `--wippy-a-${++qn}`, e.anchorTrigger = t, t.style.setProperty("anchor-name", e.anchorName), e.layer.__wippyAnchorName = e.anchorName);
  }
}
function gt(e) {
  if (e.anchorTrigger && (e.anchorTrigger.style.removeProperty("anchor-name"), e.anchorTrigger = null), e.anchorName = null, e.layer) {
    for (const t of Array.from(e.layer.children))
      t instanceof HTMLElement && ut(t);
    He.delete(e.layer), dt.get(e.layer)?.disconnect(), e.layer.remove(), e.layer = null;
  }
}
let bt = !1;
function Jn() {
  if (bt)
    return;
  const e = On;
  !e.methods || typeof e.methods.bindOutsideClickListener != "function" || (e.methods.bindOutsideClickListener = function() {
    this.outsideClickListener || (this.outsideClickListener = (t) => {
      const n = t.composedPath(), a = this.container && !n.includes(this.container), o = !(this.target && n.includes(this.target));
      this.overlayVisible && a && o ? this.hide() : !this.popup && a && o && (this.focusedOptionIndex = -1);
    }, document.addEventListener("click", this.outsideClickListener, !0));
  }, bt = !0);
}
let kt = !1;
function Qn() {
  if (kt)
    return;
  const e = Cn;
  !e.methods || typeof e.methods.bindOutsideClickListener != "function" || (e.methods.bindOutsideClickListener = function() {
    this.outsideClickListener || (this.outsideClickListener = (t) => {
      const n = t.composedPath(), a = this.container && !n.includes(this.container), o = this.visible ? !(this.target && n.includes(this.target)) : !0;
      a && o && this.hide();
    }, document.addEventListener("click", this.outsideClickListener, !0));
  }, kt = !0);
}
let St = !1;
function ea() {
  if (St)
    return;
  St = !0;
  const e = Pn;
  e.computed = e.computed || {}, e.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, e.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, e.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, e.mounted = function() {
    Ht() && (this.hostRoot = Zn(this.$el), this.mounted = !0, this.hostRoot && (this.inline || yt(this), this.$watch("inline", (t) => {
      t ? gt(this) : yt(this);
    })));
  }, e.render = function() {
    return this.inline ? pe(this.$slots, "default", { key: 0 }) : this.mounted ? Tn(xn, { key: 1, to: this.resolvedTarget || document.body }, [
      pe(this.$slots, "default")
    ]) : E("", !0);
  }, e.unmounted = function() {
    gt(this);
  };
}
const ta = {
  install: (e) => {
    Jn(), Qn(), ea(), e.use(wn, { theme: "none" });
  }
}, na = {
  key: 0,
  class: "kx-system-tab-count"
}, aa = /* @__PURE__ */ X({
  __name: "SystemTabs",
  props: {
    value: {},
    label: {},
    items: {}
  },
  emits: ["update:value"],
  setup(e) {
    return (t, n) => (p(), V(c(Rn), {
      class: "kx-system-tabs",
      "data-kx-separator": "surface",
      value: e.value,
      "onUpdate:value": n[0] || (n[0] = (a) => t.$emit("update:value", String(a)))
    }, {
      default: j(() => [
        O(c(Vn), {
          pt: { tabList: { "aria-label": e.label } }
        }, {
          default: j(() => [
            (p(!0), $(de, null, ce(e.items, (a) => (p(), V(c(En), xe({
              key: a.value,
              value: a.value
            }, { ref_for: !0 }, a.controls ? { "aria-controls": a.controls } : {}), {
              default: j(() => [
                D(A(a.label), 1),
                a.count !== void 0 ? (p(), $("b", na, A(a.count), 1)) : E("", !0)
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
}), oa = { class: "kx-shell" }, sa = { class: "kx-rail" }, ia = { class: "kx-main kx-system-pane" }, ra = /* @__PURE__ */ X({
  __name: "Shell",
  setup(e) {
    return (t, n) => (p(), $("div", oa, [
      h("aside", sa, [
        pe(t.$slots, "rail")
      ]),
      h("main", ia, [
        pe(t.$slots, "default")
      ])
    ]));
  }
}), la = { class: "kx-railhead" }, ua = { class: "kx-railhead-title" }, da = { key: 0 }, ca = { class: "kx-railhead-acts" }, ma = /* @__PURE__ */ X({
  __name: "RailHeader",
  props: {
    title: {},
    count: {}
  },
  setup(e) {
    return (t, n) => (p(), $("div", la, [
      h("span", ua, [
        D(A(e.title), 1),
        e.count !== void 0 ? (p(), $("b", da, A(e.count), 1)) : E("", !0)
      ]),
      h("div", ca, [
        pe(t.$slots, "actions")
      ])
    ]));
  }
}), We = /* @__PURE__ */ X({
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
  setup(e, { emit: t }) {
    const n = e, a = t, o = tt(), l = K(
      () => Object.prototype.hasOwnProperty.call(o?.vnode.props ?? {}, "active")
    ), i = K(
      () => n.variant === "danger" ? "danger" : n.variant === "bordered" ? "secondary" : void 0
    ), r = K(
      () => n.size === "sm" ? "small" : n.size === "lg" ? "large" : void 0
    );
    return (u, d) => (p(), V(c(Ze), {
      type: "button",
      severity: i.value,
      text: e.variant !== "bordered" && !e.active,
      outlined: e.variant === "bordered",
      size: r.value,
      loading: e.spin,
      disabled: e.disabled || e.spin,
      pt: {
        root: {
          "aria-label": e.label,
          "aria-pressed": l.value ? String(e.active) : void 0,
          title: e.label
        }
      },
      onClick: d[0] || (d[0] = (s) => a("click"))
    }, {
      icon: j(() => [
        O(c(F), {
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])
      ]),
      _: 1
    }, 8, ["severity", "text", "outlined", "size", "loading", "disabled", "pt"]));
  }
});
function Ye(e) {
  return e == null || e === "" || Array.isArray(e) && e.length === 0 || !(e instanceof Date) && typeof e == "object" && Object.keys(e).length === 0;
}
function Kt(e) {
  return typeof e == "function" && "call" in e && "apply" in e;
}
function z(e) {
  return !Ye(e);
}
function _e(e, t = !0) {
  return e instanceof Object && e.constructor === Object && (t || Object.keys(e).length !== 0);
}
function oe(e, ...t) {
  return Kt(e) ? e(...t) : e;
}
function me(e, t = !0) {
  return typeof e == "string" && (t || e !== "");
}
function be(e) {
  return me(e) ? e.replace(/(-|_)/g, "").toLowerCase() : e;
}
function Gt(e, t = "", n = {}) {
  let a = be(t).split("."), o = a.shift();
  if (o) {
    if (_e(e)) {
      let l = Object.keys(e).find((i) => be(i) === o) || "";
      return Gt(oe(e[l], n), a.join("."), n);
    }
    return;
  }
  return oe(e, n);
}
function pa(e, t = !0) {
  return Array.isArray(e) && (t || e.length !== 0);
}
function fa(e) {
  return z(e) && !isNaN(e);
}
function ke(e, t) {
  if (t) {
    let n = t.test(e);
    return t.lastIndex = 0, n;
  }
  return !1;
}
function Le(e) {
  return e && e.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function qt(e) {
  return me(e) ? e.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : e;
}
function va() {
  let e = /* @__PURE__ */ new Map();
  return { on(t, n) {
    let a = e.get(t);
    return a ? a.push(n) : a = [n], e.set(t, a), this;
  }, off(t, n) {
    let a = e.get(t);
    return a && a.splice(a.indexOf(n) >>> 0, 1), this;
  }, emit(t, n) {
    let a = e.get(t);
    a && a.forEach((o) => {
      o(n);
    });
  }, clear() {
    e.clear();
  } };
}
function ha(e) {
  if (e) {
    let t = e.parentNode;
    return t && t instanceof ShadowRoot && t.host && (t = t.host), t;
  }
  return null;
}
function ya(e) {
  return !!(e !== null && typeof e < "u" && e.nodeName && ha(e));
}
function Xe(e) {
  return typeof Element < "u" ? e instanceof Element : e !== null && typeof e == "object" && e.nodeType === 1 && typeof e.nodeName == "string";
}
function ot(e, t = {}) {
  if (Xe(e)) {
    let n = (a, o) => {
      var l, i;
      let r = (l = e?.$attrs) != null && l[a] ? [(i = e?.$attrs) == null ? void 0 : i[a]] : [];
      return [o].flat().reduce((u, d) => {
        if (d != null) {
          let s = typeof d;
          if (s === "string" || s === "number") u.push(d);
          else if (s === "object") {
            let m = Array.isArray(d) ? n(a, d) : Object.entries(d).map(([f, y]) => a === "style" && (y || y === 0) ? `${f.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}:${y}` : y ? f : void 0);
            u = m.length ? u.concat(m.filter((f) => !!f)) : u;
          }
        }
        return u;
      }, r);
    };
    Object.entries(t).forEach(([a, o]) => {
      if (o != null) {
        let l = a.match(/^on(.+)/);
        l ? e.addEventListener(l[1].toLowerCase(), o) : a === "p-bind" || a === "pBind" ? ot(e, o) : (o = a === "class" ? [...new Set(n("class", o))].join(" ").trim() : a === "style" ? n("style", o).join(";").trim() : o, (e.$attrs = e.$attrs || {}) && (e.$attrs[a] = o), e.setAttribute(a, o));
      }
    });
  }
}
function ga(e, t) {
  return Xe(e) ? e.matches(t) ? e : e.querySelector(t) : null;
}
function ba() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function ka(e, t = "", n) {
  Xe(e) && n !== null && n !== void 0 && e.setAttribute(t, n);
}
var Sa = Object.defineProperty, $a = Object.defineProperties, _a = Object.getOwnPropertyDescriptors, Ke = Object.getOwnPropertySymbols, Ft = Object.prototype.hasOwnProperty, Zt = Object.prototype.propertyIsEnumerable, $t = (e, t, n) => t in e ? Sa(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, le = (e, t) => {
  for (var n in t || (t = {})) Ft.call(t, n) && $t(e, n, t[n]);
  if (Ke) for (var n of Ke(t)) Zt.call(t, n) && $t(e, n, t[n]);
  return e;
}, Je = (e, t) => $a(e, _a(t)), fe = (e, t) => {
  var n = {};
  for (var a in e) Ft.call(e, a) && t.indexOf(a) < 0 && (n[a] = e[a]);
  if (e != null && Ke) for (var a of Ke(e)) t.indexOf(a) < 0 && Zt.call(e, a) && (n[a] = e[a]);
  return n;
}, wa = va(), te = wa, Ae = /{([^}]*)}/g, Yt = /(\d+\s+[\+\-\*\/]\s+\d+)/g, Xt = /var\([^)]+\)/g;
function _t(e) {
  return me(e) ? e.replace(/[A-Z]/g, (t, n) => n === 0 ? t : "." + t.toLowerCase()).toLowerCase() : e;
}
function Ca(e) {
  return _e(e) && e.hasOwnProperty("$value") && e.hasOwnProperty("$type") ? e.$value : e;
}
function Oa(e) {
  return e.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function st(e = "", t = "") {
  return Oa(`${me(e, !1) && me(t, !1) ? `${e}-` : e}${t}`);
}
function Jt(e = "", t = "") {
  return `--${st(e, t)}`;
}
function Pa(e = "") {
  let t = (e.match(/{/g) || []).length, n = (e.match(/}/g) || []).length;
  return (t + n) % 2 !== 0;
}
function Qt(e, t = "", n = "", a = [], o) {
  if (me(e)) {
    let l = e.trim();
    if (Pa(l)) return;
    if (ke(l, Ae)) {
      let i = l.replaceAll(Ae, (r) => {
        let u = r.replace(/{|}/g, "").split(".").filter((d) => !a.some((s) => ke(d, s)));
        return `var(${Jt(n, qt(u.join("-")))}${z(o) ? `, ${o}` : ""})`;
      });
      return ke(i.replace(Xt, "0"), Yt) ? `calc(${i})` : i;
    }
    return l;
  } else if (fa(e)) return e;
}
function Ta(e, t, n) {
  me(t, !1) && e.push(`${t}:${n};`);
}
function $e(e, t) {
  return e ? `${e}{${t}}` : "";
}
function en(e, t) {
  if (e.indexOf("dt(") === -1) return e;
  function n(i, r) {
    let u = [], d = 0, s = "", m = null, f = 0;
    for (; d <= i.length; ) {
      let y = i[d];
      if ((y === '"' || y === "'" || y === "`") && i[d - 1] !== "\\" && (m = m === y ? null : y), !m && (y === "(" && f++, y === ")" && f--, (y === "," || d === i.length) && f === 0)) {
        let w = s.trim();
        w.startsWith("dt(") ? u.push(en(w, r)) : u.push(a(w)), s = "", d++;
        continue;
      }
      y !== void 0 && (s += y), d++;
    }
    return u;
  }
  function a(i) {
    let r = i[0];
    if ((r === '"' || r === "'" || r === "`") && i[i.length - 1] === r) return i.slice(1, -1);
    let u = Number(i);
    return isNaN(u) ? i : u;
  }
  let o = [], l = [];
  for (let i = 0; i < e.length; i++) if (e[i] === "d" && e.slice(i, i + 3) === "dt(") l.push(i), i += 2;
  else if (e[i] === ")" && l.length > 0) {
    let r = l.pop();
    l.length === 0 && o.push([r, i]);
  }
  if (!o.length) return e;
  for (let i = o.length - 1; i >= 0; i--) {
    let [r, u] = o[i], d = e.slice(r + 3, u), s = n(d, t), m = t(...s);
    e = e.slice(0, r) + m + e.slice(u + 1);
  }
  return e;
}
var Se = (...e) => xa(q.getTheme(), ...e), xa = (e = {}, t, n, a) => {
  if (t) {
    let { variable: o, options: l } = q.defaults || {}, { prefix: i, transform: r } = e?.options || l || {}, u = ke(t, Ae) ? t : `{${t}}`;
    return a === "value" || Ye(a) && r === "strict" ? q.getTokenValue(t) : Qt(u, void 0, i, [o.excludedKeyRegex], n);
  }
  return "";
};
function Me(e, ...t) {
  if (e instanceof Array) {
    let n = e.reduce((a, o, l) => {
      var i;
      return a + o + ((i = oe(t[l], { dt: Se })) != null ? i : "");
    }, "");
    return en(n, Se);
  }
  return oe(e, { dt: Se });
}
function La(e, t = {}) {
  let n = q.defaults.variable, { prefix: a = n.prefix, selector: o = n.selector, excludedKeyRegex: l = n.excludedKeyRegex } = t, i = [], r = [], u = [{ node: e, path: a }];
  for (; u.length; ) {
    let { node: s, path: m } = u.pop();
    for (let f in s) {
      let y = s[f], w = Ca(y), T = ke(f, l) ? st(m) : st(m, qt(f));
      if (_e(w)) u.push({ node: w, path: T });
      else {
        let P = Jt(T), C = Qt(w, T, a, [l]);
        Ta(r, P, C);
        let L = T;
        a && L.startsWith(a + "-") && (L = L.slice(a.length + 1)), i.push(L.replace(/-/g, "."));
      }
    }
  }
  let d = r.join("");
  return { value: r, tokens: i, declarations: d, css: $e(o, d) };
}
var re = { regex: { rules: { class: { pattern: /^\.([a-zA-Z][\w-]*)$/, resolve(e) {
  return { type: "class", selector: e, matched: this.pattern.test(e.trim()) };
} }, attr: { pattern: /^\[(.*)\]$/, resolve(e) {
  return { type: "attr", selector: `:root${e},:host${e}`, matched: this.pattern.test(e.trim()) };
} }, media: { pattern: /^@media (.*)$/, resolve(e) {
  return { type: "media", selector: e, matched: this.pattern.test(e.trim()) };
} }, system: { pattern: /^system$/, resolve(e) {
  return { type: "system", selector: "@media (prefers-color-scheme: dark)", matched: this.pattern.test(e.trim()) };
} }, custom: { resolve(e) {
  return { type: "custom", selector: e, matched: !0 };
} } }, resolve(e) {
  let t = Object.keys(this.rules).filter((n) => n !== "custom").map((n) => this.rules[n]);
  return [e].flat().map((n) => {
    var a;
    return (a = t.map((o) => o.resolve(n)).find((o) => o.matched)) != null ? a : this.rules.custom.resolve(n);
  });
} }, _toVariables(e, t) {
  return La(e, { prefix: t?.prefix });
}, getCommon({ name: e = "", theme: t = {}, params: n, set: a, defaults: o }) {
  var l, i, r, u, d, s, m;
  let { preset: f, options: y } = t, w, T, P, C, L, G, Z;
  if (z(f) && y.transform !== "strict") {
    let { primitive: _, semantic: U, extend: R } = f, M = U || {}, { colorScheme: J } = M, B = fe(M, ["colorScheme"]), ee = R || {}, { colorScheme: ne } = ee, se = fe(ee, ["colorScheme"]), x = J || {}, { dark: b } = x, S = fe(x, ["dark"]), H = ne || {}, { dark: W } = H, he = fe(H, ["dark"]), ie = z(_) ? this._toVariables({ primitive: _ }, y) : {}, ae = z(B) ? this._toVariables({ semantic: B }, y) : {}, Q = z(S) ? this._toVariables({ light: S }, y) : {}, g = z(b) ? this._toVariables({ dark: b }, y) : {}, v = z(se) ? this._toVariables({ semantic: se }, y) : {}, k = z(he) ? this._toVariables({ light: he }, y) : {}, Y = z(W) ? this._toVariables({ dark: W }, y) : {}, [we, Ie] = [(l = ie.declarations) != null ? l : "", ie.tokens], [ln, un] = [(i = ae.declarations) != null ? i : "", ae.tokens || []], [dn, cn] = [(r = Q.declarations) != null ? r : "", Q.tokens || []], [mn, pn] = [(u = g.declarations) != null ? u : "", g.tokens || []], [fn, vn] = [(d = v.declarations) != null ? d : "", v.tokens || []], [hn, yn] = [(s = k.declarations) != null ? s : "", k.tokens || []], [gn, bn] = [(m = Y.declarations) != null ? m : "", Y.tokens || []];
    w = this.transformCSS(e, we, "light", "variable", y, a, o), T = Ie;
    let kn = this.transformCSS(e, `${ln}${dn}`, "light", "variable", y, a, o), Sn = this.transformCSS(e, `${mn}`, "dark", "variable", y, a, o);
    P = `${kn}${Sn}`, C = [.../* @__PURE__ */ new Set([...un, ...cn, ...pn])];
    let $n = this.transformCSS(e, `${fn}${hn}color-scheme:light`, "light", "variable", y, a, o), _n = this.transformCSS(e, `${gn}color-scheme:dark`, "dark", "variable", y, a, o);
    L = `${$n}${_n}`, G = [.../* @__PURE__ */ new Set([...vn, ...yn, ...bn])], Z = oe(f.css, { dt: Se });
  }
  return { primitive: { css: w, tokens: T }, semantic: { css: P, tokens: C }, global: { css: L, tokens: G }, style: Z };
}, getPreset({ name: e = "", preset: t = {}, options: n, params: a, set: o, defaults: l, selector: i }) {
  var r, u, d;
  let s, m, f;
  if (z(t) && n.transform !== "strict") {
    let y = e.replace("-directive", ""), w = t, { colorScheme: T, extend: P, css: C } = w, L = fe(w, ["colorScheme", "extend", "css"]), G = P || {}, { colorScheme: Z } = G, _ = fe(G, ["colorScheme"]), U = T || {}, { dark: R } = U, M = fe(U, ["dark"]), J = Z || {}, { dark: B } = J, ee = fe(J, ["dark"]), ne = z(L) ? this._toVariables({ [y]: le(le({}, L), _) }, n) : {}, se = z(M) ? this._toVariables({ [y]: le(le({}, M), ee) }, n) : {}, x = z(R) ? this._toVariables({ [y]: le(le({}, R), B) }, n) : {}, [b, S] = [(r = ne.declarations) != null ? r : "", ne.tokens || []], [H, W] = [(u = se.declarations) != null ? u : "", se.tokens || []], [he, ie] = [(d = x.declarations) != null ? d : "", x.tokens || []], ae = this.transformCSS(y, `${b}${H}`, "light", "variable", n, o, l, i), Q = this.transformCSS(y, he, "dark", "variable", n, o, l, i);
    s = `${ae}${Q}`, m = [.../* @__PURE__ */ new Set([...S, ...W, ...ie])], f = oe(C, { dt: Se });
  }
  return { css: s, tokens: m, style: f };
}, getPresetC({ name: e = "", theme: t = {}, params: n, set: a, defaults: o }) {
  var l;
  let { preset: i, options: r } = t, u = (l = i?.components) == null ? void 0 : l[e];
  return this.getPreset({ name: e, preset: u, options: r, params: n, set: a, defaults: o });
}, getPresetD({ name: e = "", theme: t = {}, params: n, set: a, defaults: o }) {
  var l, i;
  let r = e.replace("-directive", ""), { preset: u, options: d } = t, s = ((l = u?.components) == null ? void 0 : l[r]) || ((i = u?.directives) == null ? void 0 : i[r]);
  return this.getPreset({ name: r, preset: s, options: d, params: n, set: a, defaults: o });
}, applyDarkColorScheme(e) {
  return !(e.darkModeSelector === "none" || e.darkModeSelector === !1);
}, getColorSchemeOption(e, t) {
  var n;
  return this.applyDarkColorScheme(e) ? this.regex.resolve(e.darkModeSelector === !0 ? t.options.darkModeSelector : (n = e.darkModeSelector) != null ? n : t.options.darkModeSelector) : [];
}, getLayerOrder(e, t = {}, n, a) {
  let { cssLayer: o } = t;
  return o ? `@layer ${oe(o.order || o.name || "primeui", n)}` : "";
}, getCommonStyleSheet({ name: e = "", theme: t = {}, params: n, props: a = {}, set: o, defaults: l }) {
  let i = this.getCommon({ name: e, theme: t, params: n, set: o, defaults: l }), r = Object.entries(a).reduce((u, [d, s]) => u.push(`${d}="${s}"`) && u, []).join(" ");
  return Object.entries(i || {}).reduce((u, [d, s]) => {
    if (_e(s) && Object.hasOwn(s, "css")) {
      let m = Le(s.css), f = `${d}-variables`;
      u.push(`<style type="text/css" data-primevue-style-id="${f}" ${r}>${m}</style>`);
    }
    return u;
  }, []).join("");
}, getStyleSheet({ name: e = "", theme: t = {}, params: n, props: a = {}, set: o, defaults: l }) {
  var i;
  let r = { name: e, theme: t, params: n, set: o, defaults: l }, u = (i = e.includes("-directive") ? this.getPresetD(r) : this.getPresetC(r)) == null ? void 0 : i.css, d = Object.entries(a).reduce((s, [m, f]) => s.push(`${m}="${f}"`) && s, []).join(" ");
  return u ? `<style type="text/css" data-primevue-style-id="${e}-variables" ${d}>${Le(u)}</style>` : "";
}, createTokens(e = {}, t, n = "", a = "", o = {}) {
  let l = function(r, u = {}, d = []) {
    if (d.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: r, path: this.path, paths: u, value: void 0 };
    d.push(this.path), u.name = this.path, u.binding || (u.binding = {});
    let s = this.value;
    if (typeof this.value == "string" && Ae.test(this.value)) {
      let m = this.value.trim().replace(Ae, (f) => {
        var y;
        let w = f.slice(1, -1), T = this.tokens[w];
        if (!T) return console.warn(`Token not found for path: ${w}`), "__UNRESOLVED__";
        let P = T.computed(r, u, d);
        return Array.isArray(P) && P.length === 2 ? `light-dark(${P[0].value},${P[1].value})` : (y = P?.value) != null ? y : "__UNRESOLVED__";
      });
      s = Yt.test(m.replace(Xt, "0")) ? `calc(${m})` : m;
    }
    return Ye(u.binding) && delete u.binding, d.pop(), { colorScheme: r, path: this.path, paths: u, value: s.includes("__UNRESOLVED__") ? void 0 : s };
  }, i = (r, u, d) => {
    Object.entries(r).forEach(([s, m]) => {
      let f = ke(s, t.variable.excludedKeyRegex) ? u : u ? `${u}.${_t(s)}` : _t(s), y = d ? `${d}.${s}` : s;
      _e(m) ? i(m, f, y) : (o[f] || (o[f] = { paths: [], computed: (w, T = {}, P = []) => {
        if (o[f].paths.length === 1) return o[f].paths[0].computed(o[f].paths[0].scheme, T.binding, P);
        if (w && w !== "none") for (let C = 0; C < o[f].paths.length; C++) {
          let L = o[f].paths[C];
          if (L.scheme === w) return L.computed(w, T.binding, P);
        }
        return o[f].paths.map((C) => C.computed(C.scheme, T[C.scheme], P));
      } }), o[f].paths.push({ path: y, value: m, scheme: y.includes("colorScheme.light") ? "light" : y.includes("colorScheme.dark") ? "dark" : "none", computed: l, tokens: o }));
    });
  };
  return i(e, n, a), o;
}, getTokenValue(e, t, n) {
  var a;
  let o = ((r) => r.split(".").filter((u) => !ke(u.toLowerCase(), n.variable.excludedKeyRegex)).join("."))(t), l = t.includes("colorScheme.light") ? "light" : t.includes("colorScheme.dark") ? "dark" : void 0, i = [(a = e[o]) == null ? void 0 : a.computed(l)].flat().filter((r) => r);
  return i.length === 1 ? i[0].value : i.reduce((r = {}, u) => {
    let d = u, { colorScheme: s } = d, m = fe(d, ["colorScheme"]);
    return r[s] = m, r;
  }, void 0);
}, getSelectorRule(e, t, n, a) {
  return n === "class" || n === "attr" ? $e(z(t) ? `${e}${t},${e} ${t}` : e, a) : $e(e, $e(t ?? ":root,:host", a));
}, transformCSS(e, t, n, a, o = {}, l, i, r) {
  if (z(t)) {
    let { cssLayer: u } = o;
    if (a !== "style") {
      let d = this.getColorSchemeOption(o, i);
      t = n === "dark" ? d.reduce((s, { type: m, selector: f }) => (z(f) && (s += f.includes("[CSS]") ? f.replace("[CSS]", t) : this.getSelectorRule(f, r, m, t)), s), "") : $e(r ?? ":root,:host", t);
    }
    if (u) {
      let d = { name: "primeui" };
      _e(u) && (d.name = oe(u.name, { name: e, type: a })), z(d.name) && (t = $e(`@layer ${d.name}`, t), l?.layerNames(d.name));
    }
    return t;
  }
  return "";
} }, q = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(e = {}) {
  let { theme: t } = e;
  t && (this._theme = Je(le({}, t), { options: le(le({}, this.defaults.options), t.options) }), this._tokens = re.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
}, get theme() {
  return this._theme;
}, get preset() {
  var e;
  return ((e = this.theme) == null ? void 0 : e.preset) || {};
}, get options() {
  var e;
  return ((e = this.theme) == null ? void 0 : e.options) || {};
}, get tokens() {
  return this._tokens;
}, getTheme() {
  return this.theme;
}, setTheme(e) {
  this.update({ theme: e }), te.emit("theme:change", e);
}, getPreset() {
  return this.preset;
}, setPreset(e) {
  this._theme = Je(le({}, this.theme), { preset: e }), this._tokens = re.createTokens(e, this.defaults), this.clearLoadedStyleNames(), te.emit("preset:change", e), te.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(e) {
  this._theme = Je(le({}, this.theme), { options: e }), this.clearLoadedStyleNames(), te.emit("options:change", e), te.emit("theme:change", this.theme);
}, getLayerNames() {
  return [...this._layerNames];
}, setLayerNames(e) {
  this._layerNames.add(e);
}, getLoadedStyleNames() {
  return this._loadedStyleNames;
}, isStyleNameLoaded(e) {
  return this._loadedStyleNames.has(e);
}, setLoadedStyleName(e) {
  this._loadedStyleNames.add(e);
}, deleteLoadedStyleName(e) {
  this._loadedStyleNames.delete(e);
}, clearLoadedStyleNames() {
  this._loadedStyleNames.clear();
}, getTokenValue(e) {
  return re.getTokenValue(this.tokens, e, this.defaults);
}, getCommon(e = "", t) {
  return re.getCommon({ name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getComponent(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return re.getPresetC(n);
}, getDirective(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return re.getPresetD(n);
}, getCustomPreset(e = "", t, n, a) {
  let o = { name: e, preset: t, options: this.options, selector: n, params: a, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return re.getPreset(o);
}, getLayerOrderCSS(e = "") {
  return re.getLayerOrder(e, this.options, { names: this.getLayerNames() }, this.defaults);
}, transformCSS(e = "", t, n = "style", a) {
  return re.transformCSS(e, t, a, n, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
}, getCommonStyleSheet(e = "", t, n = {}) {
  return re.getCommonStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getStyleSheet(e, t, n = {}) {
  return re.getStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, onStyleMounted(e) {
  this._loadingStyles.add(e);
}, onStyleUpdated(e) {
  this._loadingStyles.add(e);
}, onStyleLoaded(e, { name: t }) {
  this._loadingStyles.size && (this._loadingStyles.delete(t), te.emit(`theme:${t}:load`, e), !this._loadingStyles.size && te.emit("theme:load"));
} }, Ce = {
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
}, ja = `
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
function Ee(e) {
  "@babel/helpers - typeof";
  return Ee = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ee(e);
}
function wt(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    t && (a = a.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, a);
  }
  return n;
}
function Ct(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? wt(Object(n), !0).forEach(function(a) {
      Na(e, a, n[a]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : wt(Object(n)).forEach(function(a) {
      Object.defineProperty(e, a, Object.getOwnPropertyDescriptor(n, a));
    });
  }
  return e;
}
function Na(e, t, n) {
  return (t = Aa(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Aa(e) {
  var t = Ea(e, "string");
  return Ee(t) == "symbol" ? t : t + "";
}
function Ea(e, t) {
  if (Ee(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var a = n.call(e, t);
    if (Ee(a) != "object") return a;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function Va(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  tt() && tt().components ? Mt(e) : t ? e() : lt(e);
}
var Ra = 0;
function Da(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = I(!1), a = I(e), o = I(null), l = ba() ? window.document : void 0, i = t.document, r = i === void 0 ? l : i, u = t.immediate, d = u === void 0 ? !0 : u, s = t.manual, m = s === void 0 ? !1 : s, f = t.name, y = f === void 0 ? "style_".concat(++Ra) : f, w = t.id, T = w === void 0 ? void 0 : w, P = t.media, C = P === void 0 ? void 0 : P, L = t.nonce, G = L === void 0 ? void 0 : L, Z = t.first, _ = Z === void 0 ? !1 : Z, U = t.onMounted, R = U === void 0 ? void 0 : U, M = t.onUpdated, J = M === void 0 ? void 0 : M, B = t.onLoad, ee = B === void 0 ? void 0 : B, ne = t.props, se = ne === void 0 ? {} : ne, x = function() {
  }, b = function(W) {
    var he = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (r) {
      var ie = Ct(Ct({}, se), he), ae = ie.name || y, Q = ie.id || T, g = ie.nonce || G;
      o.value = r.querySelector('style[data-primevue-style-id="'.concat(ae, '"]')) || r.getElementById(Q) || r.createElement("style"), o.value.isConnected || (a.value = W || e, ot(o.value, {
        type: "text/css",
        id: Q,
        media: C,
        nonce: g
      }), _ ? r.head.prepend(o.value) : r.head.appendChild(o.value), ka(o.value, "data-primevue-style-id", ae), ot(o.value, ie), o.value.onload = function(v) {
        return ee?.(v, {
          name: ae
        });
      }, R?.(ae)), !n.value && (x = Be(a, function(v) {
        o.value.textContent = v, J?.(ae);
      }, {
        immediate: !0
      }), n.value = !0);
    }
  }, S = function() {
    !r || !n.value || (x(), ya(o.value) && r.head.removeChild(o.value), n.value = !1, o.value = null);
  };
  return d && !m && Va(b), {
    id: T,
    name: y,
    el: o,
    css: a,
    unload: S,
    load: b,
    isLoaded: Ln(n)
  };
}
function Ve(e) {
  "@babel/helpers - typeof";
  return Ve = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ve(e);
}
var Ot, Pt, Tt, xt;
function Lt(e, t) {
  return Ba(e) || Ua(e, t) || Ma(e, t) || Ia();
}
function Ia() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ma(e, t) {
  if (e) {
    if (typeof e == "string") return jt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? jt(e, t) : void 0;
  }
}
function jt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, a = Array(t); n < t; n++) a[n] = e[n];
  return a;
}
function Ua(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var a, o, l, i, r = [], u = !0, d = !1;
    try {
      if (l = (n = n.call(e)).next, t !== 0) for (; !(u = (a = l.call(n)).done) && (r.push(a.value), r.length !== t); u = !0) ;
    } catch (s) {
      d = !0, o = s;
    } finally {
      try {
        if (!u && n.return != null && (i = n.return(), Object(i) !== i)) return;
      } finally {
        if (d) throw o;
      }
    }
    return r;
  }
}
function Ba(e) {
  if (Array.isArray(e)) return e;
}
function Nt(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    t && (a = a.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, a);
  }
  return n;
}
function Qe(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Nt(Object(n), !0).forEach(function(a) {
      za(e, a, n[a]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Nt(Object(n)).forEach(function(a) {
      Object.defineProperty(e, a, Object.getOwnPropertyDescriptor(n, a));
    });
  }
  return e;
}
function za(e, t, n) {
  return (t = Ha(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ha(e) {
  var t = Wa(e, "string");
  return Ve(t) == "symbol" ? t : t + "";
}
function Wa(e, t) {
  if (Ve(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var a = n.call(e, t);
    if (Ve(a) != "object") return a;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function Ue(e, t) {
  return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var Ka = function(t) {
  var n = t.dt;
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
}, Ga = {}, qa = {}, ve = {
  name: "base",
  css: Ka,
  style: ja,
  classes: Ga,
  inlineStyles: qa,
  load: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(l) {
      return l;
    }, o = a(Me(Ot || (Ot = Ue(["", ""])), t));
    return z(o) ? Da(Le(o), Qe({
      name: this.name
    }, n)) : {};
  },
  loadCSS: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    return this.load(this.css, t);
  },
  loadStyle: function() {
    var t = this, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, a = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
    return this.load(this.style, n, function() {
      var o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
      return q.transformCSS(n.name || t.name, "".concat(o).concat(Me(Pt || (Pt = Ue(["", ""])), a)));
    });
  },
  getCommonTheme: function(t) {
    return q.getCommon(this.name, t);
  },
  getComponentTheme: function(t) {
    return q.getComponent(this.name, t);
  },
  getDirectiveTheme: function(t) {
    return q.getDirective(this.name, t);
  },
  getPresetTheme: function(t, n, a) {
    return q.getCustomPreset(this.name, t, n, a);
  },
  getLayerOrderThemeCSS: function() {
    return q.getLayerOrderCSS(this.name);
  },
  getStyleSheet: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.css) {
      var a = oe(this.css, {
        dt: Se
      }) || "", o = Le(Me(Tt || (Tt = Ue(["", "", ""])), a, t)), l = Object.entries(n).reduce(function(i, r) {
        var u = Lt(r, 2), d = u[0], s = u[1];
        return i.push("".concat(d, '="').concat(s, '"')) && i;
      }, []).join(" ");
      return z(o) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(l, ">").concat(o, "</style>") : "";
    }
    return "";
  },
  getCommonThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return q.getCommonStyleSheet(this.name, t, n);
  },
  getThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, a = [q.getStyleSheet(this.name, t, n)];
    if (this.style) {
      var o = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), l = Me(xt || (xt = Ue(["", ""])), oe(this.style, {
        dt: Se
      })), i = Le(q.transformCSS(o, l)), r = Object.entries(n).reduce(function(u, d) {
        var s = Lt(d, 2), m = s[0], f = s[1];
        return u.push("".concat(m, '="').concat(f, '"')) && u;
      }, []).join(" ");
      z(i) && a.push('<style type="text/css" data-primevue-style-id="'.concat(o, '" ').concat(r, ">").concat(i, "</style>"));
    }
    return a.join("");
  },
  extend: function(t) {
    return Qe(Qe({}, this), {}, {
      css: void 0,
      style: void 0
    }, t);
  }
};
function Fa() {
  var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pc", t = Ut();
  return "".concat(e).concat(t.replace("v-", "").replaceAll("-", "_"));
}
var At = ve.extend({
  name: "common"
});
function Re(e) {
  "@babel/helpers - typeof";
  return Re = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Re(e);
}
function Za(e) {
  return an(e) || Ya(e) || nn(e) || tn();
}
function Ya(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Oe(e, t) {
  return an(e) || Xa(e, t) || nn(e, t) || tn();
}
function tn() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function nn(e, t) {
  if (e) {
    if (typeof e == "string") return it(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? it(e, t) : void 0;
  }
}
function it(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, a = Array(t); n < t; n++) a[n] = e[n];
  return a;
}
function Xa(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var a, o, l, i, r = [], u = !0, d = !1;
    try {
      if (l = (n = n.call(e)).next, t === 0) {
        if (Object(n) !== n) return;
        u = !1;
      } else for (; !(u = (a = l.call(n)).done) && (r.push(a.value), r.length !== t); u = !0) ;
    } catch (s) {
      d = !0, o = s;
    } finally {
      try {
        if (!u && n.return != null && (i = n.return(), Object(i) !== i)) return;
      } finally {
        if (d) throw o;
      }
    }
    return r;
  }
}
function an(e) {
  if (Array.isArray(e)) return e;
}
function Et(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    t && (a = a.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, a);
  }
  return n;
}
function N(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Et(Object(n), !0).forEach(function(a) {
      Te(e, a, n[a]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Et(Object(n)).forEach(function(a) {
      Object.defineProperty(e, a, Object.getOwnPropertyDescriptor(n, a));
    });
  }
  return e;
}
function Te(e, t, n) {
  return (t = Ja(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ja(e) {
  var t = Qa(e, "string");
  return Re(t) == "symbol" ? t : t + "";
}
function Qa(e, t) {
  if (Re(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var a = n.call(e, t);
    if (Re(a) != "object") return a;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var eo = {
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
        te.off("theme:change", this._loadCoreStyles), t || (this._loadCoreStyles(), this._themeChangeListener(this._loadCoreStyles));
      }
    },
    dt: {
      immediate: !0,
      handler: function(t, n) {
        var a = this;
        te.off("theme:change", this._themeScopedListener), t ? (this._loadScopedThemeStyles(t), this._themeScopedListener = function() {
          return a._loadScopedThemeStyles(t);
        }, this._themeChangeListener(this._themeScopedListener)) : this._unloadScopedThemeStyles();
      }
    }
  },
  scopedStyleEl: void 0,
  rootEl: void 0,
  uid: void 0,
  $attrSelector: void 0,
  beforeCreate: function() {
    var t, n, a, o, l, i, r, u, d, s, m, f = (t = this.pt) === null || t === void 0 ? void 0 : t._usept, y = f ? (n = this.pt) === null || n === void 0 || (n = n.originalValue) === null || n === void 0 ? void 0 : n[this.$.type.name] : void 0, w = f ? (a = this.pt) === null || a === void 0 || (a = a.value) === null || a === void 0 ? void 0 : a[this.$.type.name] : this.pt;
    (o = w || y) === null || o === void 0 || (o = o.hooks) === null || o === void 0 || (l = o.onBeforeCreate) === null || l === void 0 || l.call(o);
    var T = (i = this.$primevueConfig) === null || i === void 0 || (i = i.pt) === null || i === void 0 ? void 0 : i._usept, P = T ? (r = this.$primevue) === null || r === void 0 || (r = r.config) === null || r === void 0 || (r = r.pt) === null || r === void 0 ? void 0 : r.originalValue : void 0, C = T ? (u = this.$primevue) === null || u === void 0 || (u = u.config) === null || u === void 0 || (u = u.pt) === null || u === void 0 ? void 0 : u.value : (d = this.$primevue) === null || d === void 0 || (d = d.config) === null || d === void 0 ? void 0 : d.pt;
    (s = C || P) === null || s === void 0 || (s = s[this.$.type.name]) === null || s === void 0 || (s = s.hooks) === null || s === void 0 || (m = s.onBeforeCreate) === null || m === void 0 || m.call(s), this.$attrSelector = Fa(), this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
  },
  created: function() {
    this._hook("onCreated");
  },
  beforeMount: function() {
    var t;
    this.rootEl = ga(Xe(this.$el) ? this.$el : (t = this.$el) === null || t === void 0 ? void 0 : t.parentElement, "[".concat(this.$attrSelector, "]")), this.rootEl && (this.rootEl.$pc = N({
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
        var n = this._usePT(this._getPT(this.pt, this.$.type.name), this._getOptionValue, "hooks.".concat(t)), a = this._useDefaultPT(this._getOptionValue, "hooks.".concat(t));
        n?.(), a?.();
      }
    },
    _mergeProps: function(t) {
      for (var n = arguments.length, a = new Array(n > 1 ? n - 1 : 0), o = 1; o < n; o++)
        a[o - 1] = arguments[o];
      return Kt(t) ? t.apply(void 0, a) : xe.apply(void 0, a);
    },
    _load: function() {
      Ce.isStyleNameLoaded("base") || (ve.loadCSS(this.$styleOptions), this._loadGlobalStyles(), Ce.setLoadedStyleName("base")), this._loadThemeStyles();
    },
    _loadStyles: function() {
      this._load(), this._themeChangeListener(this._load);
    },
    _loadCoreStyles: function() {
      var t, n;
      !Ce.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name && (At.loadCSS(this.$styleOptions), this.$options.style && this.$style.loadCSS(this.$styleOptions), Ce.setLoadedStyleName(this.$style.name));
    },
    _loadGlobalStyles: function() {
      var t = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
      z(t) && ve.load(t, N({
        name: "global"
      }, this.$styleOptions));
    },
    _loadThemeStyles: function() {
      var t, n;
      if (!(this.isUnstyled || this.$theme === "none")) {
        if (!q.isStyleNameLoaded("common")) {
          var a, o, l = ((a = this.$style) === null || a === void 0 || (o = a.getCommonTheme) === null || o === void 0 ? void 0 : o.call(a)) || {}, i = l.primitive, r = l.semantic, u = l.global, d = l.style;
          ve.load(i?.css, N({
            name: "primitive-variables"
          }, this.$styleOptions)), ve.load(r?.css, N({
            name: "semantic-variables"
          }, this.$styleOptions)), ve.load(u?.css, N({
            name: "global-variables"
          }, this.$styleOptions)), ve.loadStyle(N({
            name: "global-style"
          }, this.$styleOptions), d), q.setLoadedStyleName("common");
        }
        if (!q.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name) {
          var s, m, f, y, w = ((s = this.$style) === null || s === void 0 || (m = s.getComponentTheme) === null || m === void 0 ? void 0 : m.call(s)) || {}, T = w.css, P = w.style;
          (f = this.$style) === null || f === void 0 || f.load(T, N({
            name: "".concat(this.$style.name, "-variables")
          }, this.$styleOptions)), (y = this.$style) === null || y === void 0 || y.loadStyle(N({
            name: "".concat(this.$style.name, "-style")
          }, this.$styleOptions), P), q.setLoadedStyleName(this.$style.name);
        }
        if (!q.isStyleNameLoaded("layer-order")) {
          var C, L, G = (C = this.$style) === null || C === void 0 || (L = C.getLayerOrderThemeCSS) === null || L === void 0 ? void 0 : L.call(C);
          ve.load(G, N({
            name: "layer-order",
            first: !0
          }, this.$styleOptions)), q.setLoadedStyleName("layer-order");
        }
      }
    },
    _loadScopedThemeStyles: function(t) {
      var n, a, o, l = ((n = this.$style) === null || n === void 0 || (a = n.getPresetTheme) === null || a === void 0 ? void 0 : a.call(n, t, "[".concat(this.$attrSelector, "]"))) || {}, i = l.css, r = (o = this.$style) === null || o === void 0 ? void 0 : o.load(i, N({
        name: "".concat(this.$attrSelector, "-").concat(this.$style.name)
      }, this.$styleOptions));
      this.scopedStyleEl = r.el;
    },
    _unloadScopedThemeStyles: function() {
      var t;
      (t = this.scopedStyleEl) === null || t === void 0 || (t = t.value) === null || t === void 0 || t.remove();
    },
    _themeChangeListener: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
      };
      Ce.clearLoadedStyleNames(), te.on("theme:change", t);
    },
    _removeThemeListeners: function() {
      te.off("theme:change", this._loadCoreStyles), te.off("theme:change", this._load), te.off("theme:change", this._themeScopedListener);
    },
    _getHostInstance: function(t) {
      return t ? this.$options.hostName ? t.$.type.name === this.$options.hostName ? t : this._getHostInstance(t.$parentInstance) : t.$parentInstance : void 0;
    },
    _getPropValue: function(t) {
      var n;
      return this[t] || ((n = this._getHostInstance(this)) === null || n === void 0 ? void 0 : n[t]);
    },
    _getOptionValue: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return Gt(t, n, a);
    },
    _getPTValue: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, a = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, l = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, i = /./g.test(a) && !!o[a.split(".")[0]], r = this._getPropValue("ptOptions") || ((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.ptOptions) || {}, u = r.mergeSections, d = u === void 0 ? !0 : u, s = r.mergeProps, m = s === void 0 ? !1 : s, f = l ? i ? this._useGlobalPT(this._getPTClassValue, a, o) : this._useDefaultPT(this._getPTClassValue, a, o) : void 0, y = i ? void 0 : this._getPTSelf(n, this._getPTClassValue, a, N(N({}, o), {}, {
        global: f || {}
      })), w = this._getPTDatasets(a);
      return d || !d && y ? m ? this._mergeProps(m, f, y, w) : N(N(N({}, f), y), w) : N(N({}, y), w);
    },
    _getPTSelf: function() {
      for (var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length, a = new Array(n > 1 ? n - 1 : 0), o = 1; o < n; o++)
        a[o - 1] = arguments[o];
      return xe(
        this._usePT.apply(this, [this._getPT(t, this.$name)].concat(a)),
        // Exp; <component :pt="{}"
        this._usePT.apply(this, [this.$_attrsPT].concat(a))
        // Exp; <component :pt:[passthrough_key]:[attribute]="{value}" or <component :pt:[passthrough_key]="() =>{value}"
      );
    },
    _getPTDatasets: function() {
      var t, n, a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", o = "data-pc-", l = a === "root" && z((t = this.pt) === null || t === void 0 ? void 0 : t["data-pc-section"]);
      return a !== "transition" && N(N({}, a === "root" && N(N(Te({}, "".concat(o, "name"), be(l ? (n = this.pt) === null || n === void 0 ? void 0 : n["data-pc-section"] : this.$.type.name)), l && Te({}, "".concat(o, "extend"), be(this.$.type.name))), {}, Te({}, "".concat(this.$attrSelector), ""))), {}, Te({}, "".concat(o, "section"), be(a)));
    },
    _getPTClassValue: function() {
      var t = this._getOptionValue.apply(this, arguments);
      return me(t) || pa(t) ? {
        class: t
      } : t;
    },
    _getPT: function(t) {
      var n = this, a = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 ? arguments[2] : void 0, l = function(r) {
        var u, d = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, s = o ? o(r) : r, m = be(a), f = be(n.$name);
        return (u = d ? m !== f ? s?.[m] : void 0 : s?.[m]) !== null && u !== void 0 ? u : s;
      };
      return t != null && t.hasOwnProperty("_usept") ? {
        _usept: t._usept,
        originalValue: l(t.originalValue),
        value: l(t.value)
      } : l(t, !0);
    },
    _usePT: function(t, n, a, o) {
      var l = function(T) {
        return n(T, a, o);
      };
      if (t != null && t.hasOwnProperty("_usept")) {
        var i, r = t._usept || ((i = this.$primevueConfig) === null || i === void 0 ? void 0 : i.ptOptions) || {}, u = r.mergeSections, d = u === void 0 ? !0 : u, s = r.mergeProps, m = s === void 0 ? !1 : s, f = l(t.originalValue), y = l(t.value);
        return f === void 0 && y === void 0 ? void 0 : me(y) ? y : me(f) ? f : d || !d && y ? m ? this._mergeProps(m, f, y) : N(N({}, f), y) : y;
      }
      return l(t);
    },
    _useGlobalPT: function(t, n, a) {
      return this._usePT(this.globalPT, t, n, a);
    },
    _useDefaultPT: function(t, n, a) {
      return this._usePT(this.defaultPT, t, n, a);
    },
    ptm: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this._getPTValue(this.pt, t, N(N({}, this.$params), n));
    },
    ptmi: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", a = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = xe(this.$_attrsWithoutPT, this.ptm(n, a));
      return o?.hasOwnProperty("id") && ((t = o.id) !== null && t !== void 0 || (o.id = this.$id)), o;
    },
    ptmo: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return this._getPTValue(t, n, N({
        instance: this
      }, a), !1);
    },
    cx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this.isUnstyled ? void 0 : this._getOptionValue(this.$style.classes, t, N(N({}, this.$params), n));
    },
    sx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      if (n) {
        var o = this._getOptionValue(this.$style.inlineStyles, t, N(N({}, this.$params), a)), l = this._getOptionValue(At.inlineStyles, t, N(N({}, this.$params), a));
        return [l, o];
      }
    }
  },
  computed: {
    globalPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(a) {
        return oe(a, {
          instance: n
        });
      });
    },
    defaultPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(a) {
        return n._getOptionValue(a, n.$name, N({}, n.$params)) || oe(a, N({}, n.$params));
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
      var t, n = Object.keys(((t = this.$.vnode) === null || t === void 0 ? void 0 : t.props) || {});
      return Object.fromEntries(Object.entries(this.$props).filter(function(a) {
        var o = Oe(a, 1), l = o[0];
        return n?.includes(l);
      }));
    },
    $theme: function() {
      var t;
      return (t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.theme;
    },
    $style: function() {
      return N(N({
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
        var n = Oe(t, 1), a = n[0];
        return a?.startsWith("pt:");
      }).reduce(function(t, n) {
        var a = Oe(n, 2), o = a[0], l = a[1], i = o.split(":"), r = Za(i), u = it(r).slice(1);
        return u?.reduce(function(d, s, m, f) {
          return !d[s] && (d[s] = m === f.length - 1 ? l : {}), d[s];
        }, t), t;
      }, {});
    },
    $_attrsWithoutPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(t) {
        var n = Oe(t, 1), a = n[0];
        return !(a != null && a.startsWith("pt:"));
      }).reduce(function(t, n) {
        var a = Oe(n, 2), o = a[0], l = a[1];
        return t[o] = l, t;
      }, {});
    }
  }
}, to = `
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
`, no = ve.extend({
  name: "baseicon",
  css: to
});
function De(e) {
  "@babel/helpers - typeof";
  return De = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, De(e);
}
function Vt(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    t && (a = a.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, a);
  }
  return n;
}
function Rt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Vt(Object(n), !0).forEach(function(a) {
      ao(e, a, n[a]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Vt(Object(n)).forEach(function(a) {
      Object.defineProperty(e, a, Object.getOwnPropertyDescriptor(n, a));
    });
  }
  return e;
}
function ao(e, t, n) {
  return (t = oo(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function oo(e) {
  var t = so(e, "string");
  return De(t) == "symbol" ? t : t + "";
}
function so(e, t) {
  if (De(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var a = n.call(e, t);
    if (De(a) != "object") return a;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var io = {
  name: "BaseIcon",
  extends: eo,
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
  style: no,
  provide: function() {
    return {
      $pcIcon: this,
      $parentInstance: this
    };
  },
  methods: {
    pti: function() {
      var t = Ye(this.label);
      return Rt(Rt({}, !this.isUnstyled && {
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
}, on = {
  name: "SpinnerIcon",
  extends: io
};
function ro(e) {
  return mo(e) || co(e) || uo(e) || lo();
}
function lo() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function uo(e, t) {
  if (e) {
    if (typeof e == "string") return rt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? rt(e, t) : void 0;
  }
}
function co(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function mo(e) {
  if (Array.isArray(e)) return rt(e);
}
function rt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, a = Array(t); n < t; n++) a[n] = e[n];
  return a;
}
function po(e, t, n, a, o, l) {
  return p(), $("svg", xe({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), ro(t[0] || (t[0] = [h("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
on.render = po;
const ue = /* @__PURE__ */ X({
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
  setup(e, { emit: t }) {
    const n = e, a = t, o = K(
      () => n.variant === "danger" ? "danger" : n.variant === "primary" ? void 0 : "secondary"
    );
    return (l, i) => (p(), V(c(Ze), {
      type: e.type,
      severity: o.value,
      outlined: e.variant === "ghost",
      loading: e.loading,
      disabled: e.disabled || e.loading,
      size: e.small ? "small" : void 0,
      onClick: i[0] || (i[0] = (r) => a("click"))
    }, {
      default: j(() => [
        e.loading ? (p(), V(c(on), {
          key: 0,
          class: "p-button-loading-icon p-button-icon",
          spin: ""
        })) : E("", !0),
        e.icon && !e.loading ? (p(), V(c(F), {
          key: 1,
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : E("", !0),
        pe(l.$slots, "default")
      ]),
      _: 3
    }, 8, ["type", "severity", "outlined", "loading", "disabled", "size"]));
  }
}), Dt = /* @__PURE__ */ X({
  __name: "SearchField",
  props: {
    modelValue: {},
    placeholder: {}
  },
  emits: ["update:modelValue"],
  setup(e, { emit: t }) {
    const n = t;
    return (a, o) => (p(), V(c(Mn), { class: "km-search" }, {
      default: j(() => [
        O(c(Un), null, {
          default: j(() => [
            O(c(F), {
              icon: "tabler:search",
              "aria-hidden": "true"
            })
          ]),
          _: 1
        }),
        O(c(zt), {
          class: "km-search-input",
          "aria-label": e.placeholder || "Search",
          "model-value": e.modelValue,
          placeholder: e.placeholder || "Search",
          "onUpdate:modelValue": o[0] || (o[0] = (l) => n("update:modelValue", l ?? ""))
        }, null, 8, ["aria-label", "model-value", "placeholder"]),
        e.modelValue ? (p(), V(c(Ze), {
          key: 0,
          text: "",
          severity: "secondary",
          class: "km-search-clear",
          "aria-label": "Clear search",
          onClick: o[1] || (o[1] = (l) => n("update:modelValue", ""))
        }, {
          icon: j(() => [
            O(c(F), {
              icon: "tabler:x",
              "aria-hidden": "true"
            })
          ]),
          _: 1
        })) : E("", !0)
      ]),
      _: 1
    }));
  }
}), fo = { class: "km-field" }, vo = { class: "km-field-label" }, ho = {
  key: 0,
  class: "km-field-help"
}, Ge = /* @__PURE__ */ X({
  __name: "FormField",
  props: {
    label: {},
    help: {}
  },
  setup(e) {
    return (t, n) => (p(), $("label", fo, [
      h("span", vo, A(e.label), 1),
      pe(t.$slots, "default"),
      e.help ? (p(), $("small", ho, A(e.help), 1)) : E("", !0)
    ]));
  }
}), It = /* @__PURE__ */ X({
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
  setup(e, { emit: t }) {
    const n = t;
    return (a, o) => (p(), V(c(zt), {
      class: ge(["km-input", e.mono && "mono"]),
      type: e.type,
      "model-value": String(e.modelValue),
      placeholder: e.placeholder,
      readonly: e.readonly,
      disabled: e.disabled,
      autocomplete: e.autocomplete,
      min: e.min,
      max: e.max,
      step: e.step,
      "onUpdate:modelValue": o[0] || (o[0] = (l) => n("update:modelValue", l ?? ""))
    }, null, 8, ["class", "type", "model-value", "placeholder", "readonly", "disabled", "autocomplete", "min", "max", "step"]));
  }
}), yo = {
  key: 0,
  class: "km-pill-dot",
  "aria-hidden": "true"
}, qe = /* @__PURE__ */ X({
  __name: "Pill",
  props: {
    severity: { default: "secondary" },
    dot: { type: Boolean },
    icon: {}
  },
  setup(e) {
    return (t, n) => (p(), V(c(Bn), {
      severity: e.severity || void 0,
      class: "km-pill kx-tag-sm"
    }, {
      default: j(() => [
        e.dot ? (p(), $("span", yo)) : e.icon ? (p(), V(c(F), {
          key: 1,
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : E("", !0),
        pe(t.$slots, "default")
      ]),
      _: 3
    }, 8, ["severity"]));
  }
}), go = { class: "km-notice-text" }, Fe = /* @__PURE__ */ X({
  __name: "Notice",
  props: {
    severity: { default: "info" }
  },
  emits: ["dismiss"],
  setup(e, { emit: t }) {
    const n = t, a = (o) => o === "danger" ? "tabler:alert-triangle" : o === "success" ? "tabler:circle-check" : "tabler:info-circle";
    return (o, l) => (p(), $("div", {
      class: ge(["km-notice", `is-${e.severity}`]),
      role: "status"
    }, [
      O(c(F), {
        icon: a(e.severity),
        "aria-hidden": "true"
      }, null, 8, ["icon"]),
      h("span", go, [
        pe(o.$slots, "default")
      ]),
      h("button", {
        class: "km-notice-x",
        "aria-label": "Dismiss",
        onClick: l[0] || (l[0] = (i) => n("dismiss"))
      }, [
        O(c(F), {
          icon: "tabler:x",
          "aria-hidden": "true"
        })
      ])
    ], 2));
  }
}), bo = { class: "km-loading" }, ko = { key: 0 }, sn = /* @__PURE__ */ X({
  __name: "Spinner",
  props: {
    label: {}
  },
  setup(e) {
    return (t, n) => (p(), $("div", bo, [
      O(c(zn), {
        style: { width: "22px", height: "22px", margin: "0" },
        "aria-label": e.label || "Loading"
      }, null, 8, ["aria-label"]),
      e.label ? (p(), $("span", ko, A(e.label), 1)) : E("", !0)
    ]));
  }
}), So = { class: "kx-empty" }, $o = { class: "kx-empty-ico" }, _o = { class: "kx-empty-title" }, wo = {
  key: 0,
  class: "kx-empty-sub"
}, rn = /* @__PURE__ */ X({
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
    return (t, n) => (p(), $("div", So, [
      h("div", $o, [
        O(c(F), {
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])
      ]),
      h("div", _o, A(e.title), 1),
      e.hint || t.$slots.hint ? (p(), $("p", wo, [
        pe(t.$slots, "hint", {}, () => [
          D(A(e.hint), 1)
        ])
      ])) : E("", !0),
      e.cta ? (p(), V(c(Ze), {
        key: 1,
        label: e.cta,
        onClick: n[0] || (n[0] = (a) => t.$emit("cta"))
      }, jn({ _: 2 }, [
        e.ctaIcon ? {
          name: "icon",
          fn: j(({ class: a }) => [
            O(c(F), {
              icon: e.ctaIcon,
              class: ge(a),
              "aria-hidden": "true"
            }, null, 8, ["icon", "class"])
          ]),
          key: "0"
        } : void 0
      ]), 1032, ["label"])) : E("", !0)
    ]));
  }
}), Co = { class: "kx-wcmount" }, Oo = {
  key: 0,
  class: "kx-wcmount-fail",
  role: "alert"
}, et = /* @__PURE__ */ X({
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
  setup(e, { emit: t }) {
    const n = e, a = t, o = I(null), l = I(!1);
    let i = null, r = 0;
    const u = /* @__PURE__ */ new Set();
    function d(_) {
      _.composedPath()[0] === i && (_.stopPropagation(), a("change", _.detail));
    }
    function s(_) {
      return _.composedPath()[0] !== i ? !1 : (_.stopPropagation(), !0);
    }
    function m(_) {
      s(_) && a("select", _.detail);
    }
    function f(_) {
      s(_) && a("created", _.detail);
    }
    function y(_) {
      s(_) && a("close", _.detail);
    }
    function w(_) {
      s(_) && a("error", _.detail);
    }
    function T(_) {
      if (typeof _ == "string") return _;
      try {
        return JSON.stringify(_ ?? {});
      } catch {
        return null;
      }
    }
    function P() {
      if (!i) return;
      const _ = T(n.config);
      if (_ !== null && i.setAttribute("config", _), n.schema !== void 0 && n.schema !== null) {
        const R = T(n.schema);
        R !== null && i.setAttribute("schema", R);
      }
      if (n.meta !== void 0 && n.meta !== null) {
        const R = T(n.meta);
        R !== null && i.setAttribute("meta", R);
      }
      n.provider && i.setAttribute("provider", n.provider), n.label && i.setAttribute("label", n.label);
      const U = n.attrs || {};
      for (const R of [...u])
        (!(R in U) || U[R] == null) && (i.removeAttribute(R), u.delete(R));
      for (const [R, M] of Object.entries(U)) {
        if (M == null) continue;
        const J = typeof M == "object" ? T(M) : String(M);
        J !== null && (i.setAttribute(R, J), u.add(R));
      }
    }
    function C(_ = i) {
      _ && (_.removeEventListener("config-changed", d), _.removeEventListener("change", d), _.removeEventListener("select", m), _.removeEventListener("created", f), _.removeEventListener("close", y), _.removeEventListener("error", w), _ === i && (i = null), u.clear());
    }
    async function L(_) {
      if (!customElements.get(_))
        try {
          await Dn(_, { timeoutMs: 8e3 });
        } catch {
        }
    }
    async function G() {
      const _ = ++r, U = o.value, R = n.tag;
      if (l.value = !1, !!U && (C(), U.innerHTML = "", !!R))
        try {
          if (await L(R), _ !== r || o.value !== U || n.tag !== R) return;
          const M = document.createElement(R);
          M.classList.add("kx-wcmount-surface"), i = M, P(), M.addEventListener("config-changed", d), M.addEventListener("change", d), M.addEventListener("select", m), M.addEventListener("created", f), M.addEventListener("close", y), M.addEventListener("error", w), M.style.display = "block", U.appendChild(M), l.value = !customElements.get(R);
        } catch {
          _ === r && (l.value = !0);
        }
    }
    async function Z() {
      l.value = !1, await lt(), await G();
    }
    return Mt(G), Be(() => n.tag, G), Be(() => [n.config, n.schema, n.meta, n.provider, n.label, n.attrs], P, { deep: !0 }), Nn(() => {
      r += 1, C();
    }), (_, U) => (p(), $("div", Co, [
      l.value ? (p(), $("div", Oo, [
        U[0] || (U[0] = h("span", null, "This setup panel couldn’t load.", -1)),
        h("button", {
          type: "button",
          onClick: Z
        }, "Try again")
      ])) : (p(), $("div", {
        key: 1,
        ref_key: "host",
        ref: o
      }, null, 512))
    ]));
  }
});
function je(e, t) {
  const n = e?.response?.data ?? e?.data;
  return typeof n?.error == "string" && n.error ? n.error : typeof n?.message == "string" && n.message ? n.message : e instanceof Error ? e.message : t;
}
function Po() {
  const e = I([]), t = I([]), n = I(!0), a = I(!1), o = I("");
  let l = 0;
  async function i() {
    const d = ++l;
    n.value = !0, o.value = "";
    try {
      const [s, m] = await Promise.all([
        ye.get("/api/v1/security/scopes"),
        ye.get("/api/v1/security/policies")
      ]);
      if (d !== l) return;
      e.value = s.data?.scopes ?? [], t.value = m.data?.policies ?? [];
    } catch (s) {
      d === l && (o.value = je(s, "failed to load security"));
    } finally {
      d === l && (n.value = !1);
    }
  }
  async function r(d) {
    a.value = !0, o.value = "";
    try {
      return await ye.post("/api/v1/security/scopes", d), await i(), !0;
    } catch (s) {
      return o.value = je(s, "failed to save scope"), !1;
    } finally {
      a.value = !1;
    }
  }
  async function u(d) {
    a.value = !0, o.value = "";
    try {
      return await ye.delete(`/api/v1/security/scopes?slug=${encodeURIComponent(d)}`), await i(), !0;
    } catch (s) {
      return o.value = je(s, "failed to delete scope"), !1;
    } finally {
      a.value = !1;
    }
  }
  return { scopes: e, policies: t, loading: n, saving: a, error: o, load: i, saveScope: r, deleteScope: u };
}
function To() {
  const e = I([]), t = I(!1), n = I(!1), a = I(""), o = I(""), l = I(null);
  let i = 0;
  async function r() {
    const s = ++i;
    t.value = !0, a.value = "";
    try {
      const { data: m } = await ye.get("/api/v1/security/delegations");
      if (m?.success !== !0 || !Array.isArray(m.delegations))
        throw new Error(m?.error || "Delegation inventory is unconfirmed");
      s === i && (e.value = m.delegations);
    } catch (m) {
      s === i && (a.value = je(m, "Could not load run-as permissions"));
    } finally {
      s === i && (t.value = !1);
    }
  }
  async function u() {
    if (!l.value || n.value) return;
    const s = l.value;
    n.value = !0, a.value = "", o.value = "";
    try {
      const { data: m } = s.method === "save" ? await ye.post("/api/v1/security/delegations", s.request) : await ye.delete("/api/v1/security/delegations", { data: s.request });
      if (m?.success !== !0) throw new Error(m?.error || "Run-as request is unconfirmed");
      l.value = null, o.value = s.method === "save" ? "Run-as permission saved" : "Run-as permission revoked", await r();
    } catch (m) {
      a.value = je(m, "Could not confirm run-as request");
      const f = m?.response?.status;
      f && f >= 400 && f < 500 && (l.value = null);
    } finally {
      n.value = !1;
    }
  }
  async function d(s, m) {
    l.value || n.value || (l.value = { method: s, request: {
      ...m,
      principal: { ...m.principal },
      ...m.groups ? { groups: [...m.groups].sort() } : {}
    } }, await u());
  }
  return { delegations: e, loading: t, saving: n, error: a, confirmation: o, pending: l, load: r, mutate: d, submit: u };
}
const xo = {
  class: "ks-runas kx-system-pane",
  "aria-label": "Run-as permissions"
}, Lo = { class: "kx-system-tools" }, jo = { class: "ks-runas-head kx-system-toolbar" }, No = { class: "ks-runas-count" }, Ao = { class: "ks-runas-acts" }, Eo = { class: "kx-system-body ks-runas-body" }, Vo = {
  key: 0,
  role: "alert"
}, Ro = { class: "ks-runas-form-head" }, Do = ["disabled", "inert"], Io = { class: "ks-runas-steps" }, Mo = {
  key: 0,
  class: "ks-runas-chips",
  "aria-label": "Selected groups"
}, Uo = { class: "ks-runas-component-options" }, Bo = ["for"], zo = ["for"], Ho = { class: "ks-runas-form-foot" }, Wo = {
  key: 3,
  class: "ks-runas-pending"
}, Ko = {
  key: 6,
  class: "ks-runas-list"
}, Go = { class: "ks-runas-grant-body" }, qo = { class: "ks-runas-grant-line" }, Fo = {
  key: 0,
  class: "ks-runas-who"
}, Zo = { class: "ks-runas-verb" }, Yo = { class: "ks-runas-who" }, Xo = { class: "ks-runas-grant-meta" }, Jo = { key: 0 }, Qo = { key: 1 }, es = { key: 2 }, ts = /* @__PURE__ */ X({
  __name: "Delegations",
  props: {
    scopes: {}
  },
  setup(e, { expose: t }) {
    const n = e, a = To(), { delegations: o, loading: l, saving: i, error: r, confirmation: u, pending: d } = a, s = I(!1), m = I(!1), f = I(""), y = I(""), w = I(!0), T = Ut(), P = I([]), C = K(() => i.value || !!d.value), L = K(() => !!f.value && P.value.length > 0 && (w.value || !!y.value)), G = K(() => {
      const x = {};
      for (const b of n.scopes) x[b.id] = b.label || "Group unavailable";
      return x;
    }), Z = I({});
    Be(o, async (x) => {
      const b = [...new Set(x.map((S) => S.principal.id))].filter((S) => !Z.value[S]);
      if (b.length)
        try {
          const { data: S } = await ye.post("/api/v1/principals/resolve", { refs: b.map((W) => ({ type: "user", id: W })) }), H = { ...Z.value };
          for (const W of Array.isArray(S?.principals) ? S.principals : [])
            W && typeof W.id == "string" && typeof W.label == "string" && (H[W.id] = W.label);
          Z.value = H;
        } catch (S) {
          r.value = S && typeof S == "object" && "message" in S ? String(S.message) : "Could not resolve account names";
        }
    });
    const _ = K(() => o.value.filter((x) => x.active)), U = K(() => o.value.filter((x) => !x.active)), R = K(() => m.value ? [..._.value, ...U.value] : _.value);
    function M(x, b) {
      if (!x || typeof x != "object") return;
      const S = x;
      C.value || S.type !== b || typeof S.id != "string" || (b === "user" ? f.value = S.id : S.id && !P.value.some((H) => H.id === S.id) && P.value.push({ id: S.id, label: typeof S.label == "string" ? S.label : S.id }));
    }
    function J(x) {
      const b = x && typeof x == "object" ? x.thread_id : void 0;
      !C.value && typeof b == "string" && (y.value = b);
    }
    function B(x) {
      r.value = x && typeof x == "object" && "message" in x ? String(x.message) : "Could not load the picker";
    }
    function ee() {
      f.value = "", y.value = "", w.value = !0, P.value = [], s.value = !0;
    }
    async function ne() {
      L.value && (await a.mutate("save", {
        principal: { kind: "user", id: f.value },
        root: w.value ? "*" : y.value,
        groups: P.value.map((x) => x.id)
      }), !r.value && !d.value && (s.value = !1));
    }
    async function se(x) {
      await Bt.confirm({
        header: "Revoke run-as permission?",
        message: `Members of ${x.groups.map((S) => G.value[S] || "Group unavailable").join(", ")} can no longer choose ${Z.value[x.principal.id] || "Account unavailable"} in the Run as setting.`,
        icon: "tabler:user-off",
        acceptLabel: "Revoke",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      }) && await a.mutate("revoke", { principal: x.principal, root: x.root });
    }
    return t({ load: a.load }), (x, b) => (p(), $("section", xo, [
      h("div", Lo, [
        h("header", jo, [
          h("span", No, A(_.value.length) + " active " + A(_.value.length === 1 ? "permission" : "permissions"), 1),
          h("div", Ao, [
            O(c(We), {
              icon: "tabler:refresh",
              label: "Refresh",
              disabled: c(l) || C.value,
              spin: c(l),
              onClick: c(a).load
            }, null, 8, ["disabled", "spin", "onClick"]),
            s.value ? E("", !0) : (p(), V(c(ue), {
              key: 0,
              variant: "primary",
              icon: "tabler:plus",
              disabled: C.value,
              onClick: ee
            }, {
              default: j(() => [...b[9] || (b[9] = [
                D("New permission", -1)
              ])]),
              _: 1
            }, 8, ["disabled"]))
          ])
        ]),
        b[10] || (b[10] = h("p", { class: "ks-runas-lede" }, [
          D(" Agents, automations and workflows run with the access of the account set in their "),
          h("b", null, "Run as"),
          D(" setting. A permission lets members of a group choose a specific account there, typically a bot account, so the component works with that account's access instead of their own. ")
        ], -1))
      ]),
      h("div", Eo, [
        c(r) ? (p(), $("div", Vo, [
          O(c(Fe), {
            severity: "danger",
            onDismiss: b[0] || (b[0] = (S) => r.value = "")
          }, {
            default: j(() => [
              D(A(c(r)), 1)
            ]),
            _: 1
          })
        ])) : E("", !0),
        c(u) ? (p(), V(c(Fe), {
          key: 1,
          "data-test": "delegation-confirmation",
          severity: "success",
          onDismiss: b[1] || (b[1] = (S) => u.value = "")
        }, {
          default: j(() => [
            D(A(c(u)), 1)
          ]),
          _: 1
        })) : E("", !0),
        s.value ? (p(), $("form", {
          key: 2,
          class: "ks-runas-form",
          onSubmit: Ne(ne, ["prevent"])
        }, [
          h("div", Ro, [
            b[11] || (b[11] = h("span", null, "New run-as permission", -1)),
            O(c(We), {
              icon: "tabler:x",
              label: "Cancel",
              disabled: C.value,
              onClick: b[2] || (b[2] = (S) => s.value = !1)
            }, null, 8, ["disabled"])
          ]),
          h("fieldset", {
            disabled: C.value,
            inert: C.value
          }, [
            h("ol", Io, [
              h("li", null, [
                O(c(Ge), {
                  label: "Account to run as",
                  help: "The account whose access the component uses. Its group memberships decide what the component can do."
                }, {
                  default: j(() => [
                    O(et, {
                      tag: "wc-principal-picker",
                      attrs: { kinds: "user", placeholder: "Choose an account…" },
                      config: { principal_id: f.value },
                      onChange: b[3] || (b[3] = (S) => M(S, "user")),
                      onError: B
                    }, null, 8, ["config"])
                  ]),
                  _: 1
                })
              ]),
              h("li", null, [
                O(c(Ge), {
                  label: "Who may choose it",
                  help: "Members of these groups see this account in the Run as setting. Nobody's group membership changes."
                }, {
                  default: j(() => [
                    O(et, {
                      tag: "wc-principal-picker",
                      attrs: { kinds: "group", placeholder: "Add a group…" },
                      config: {},
                      onChange: b[4] || (b[4] = (S) => M(S, "group")),
                      onError: B
                    })
                  ]),
                  _: 1
                }),
                P.value.length ? (p(), $("div", Mo, [
                  (p(!0), $(de, null, ce(P.value, (S) => (p(), V(c(Hn), {
                    key: S.id,
                    label: S.label,
                    removable: !C.value,
                    pt: { removeIcon: { "aria-label": `Remove group ${S.label}` } },
                    onRemove: (H) => P.value = P.value.filter((W) => W.id !== S.id)
                  }, null, 8, ["label", "removable", "pt", "onRemove"]))), 128))
                ])) : E("", !0)
              ]),
              h("li", null, [
                h("fieldset", null, [
                  b[14] || (b[14] = h("legend", { class: "km-field-label" }, "On which components", -1)),
                  h("div", Uo, [
                    h("label", {
                      class: "ks-runas-component-option",
                      for: `${c(T)}-any`
                    }, [
                      O(c(pt), {
                        modelValue: w.value,
                        "onUpdate:modelValue": b[5] || (b[5] = (S) => w.value = S),
                        "input-id": `${c(T)}-any`,
                        name: c(T),
                        value: !0,
                        disabled: C.value
                      }, null, 8, ["modelValue", "input-id", "name", "disabled"]),
                      b[12] || (b[12] = D(" Any component ", -1))
                    ], 8, Bo),
                    h("label", {
                      class: "ks-runas-component-option",
                      for: `${c(T)}-one`
                    }, [
                      O(c(pt), {
                        modelValue: w.value,
                        "onUpdate:modelValue": b[6] || (b[6] = (S) => w.value = S),
                        "input-id": `${c(T)}-one`,
                        name: c(T),
                        value: !1,
                        disabled: C.value
                      }, null, 8, ["modelValue", "input-id", "name", "disabled"]),
                      b[13] || (b[13] = D(" One component ", -1))
                    ], 8, zo)
                  ]),
                  b[15] || (b[15] = h("small", { class: "km-field-help" }, "The person choosing the account must also be able to manage the component.", -1))
                ]),
                w.value ? E("", !0) : (p(), V(et, {
                  key: 0,
                  class: "ks-runas-component",
                  tag: "wc-component-picker",
                  attrs: { source: "/api/v1/security/delegations/roots", title: "Component", placeholder: "Choose a component you manage…" },
                  config: y.value ? { thread_id: y.value } : {},
                  onChange: J,
                  onError: B
                }, null, 8, ["config"]))
              ])
            ])
          ], 8, Do),
          h("div", Ho, [
            O(c(ue), {
              variant: "ghost",
              small: "",
              disabled: C.value,
              onClick: b[7] || (b[7] = (S) => s.value = !1)
            }, {
              default: j(() => [...b[16] || (b[16] = [
                D("Cancel", -1)
              ])]),
              _: 1
            }, 8, ["disabled"]),
            O(c(ue), {
              variant: "primary",
              small: "",
              icon: "tabler:device-floppy",
              disabled: !L.value || C.value,
              loading: c(i),
              onClick: ne
            }, {
              default: j(() => [...b[17] || (b[17] = [
                D("Save permission", -1)
              ])]),
              _: 1
            }, 8, ["disabled", "loading"])
          ])
        ], 32)) : E("", !0),
        c(d) && !c(i) ? (p(), $("div", Wo, [
          b[19] || (b[19] = h("span", null, "We could not confirm whether the permission changed. Select Retry to check before making another change.", -1)),
          O(c(ue), {
            small: "",
            onClick: c(a).submit
          }, {
            default: j(() => [...b[18] || (b[18] = [
              D("Retry", -1)
            ])]),
            _: 1
          }, 8, ["onClick"])
        ])) : E("", !0),
        U.value.length ? (p(), V(c(ue), {
          key: 4,
          class: "ks-runas-history",
          variant: "ghost",
          small: "",
          "aria-expanded": m.value,
          onClick: b[8] || (b[8] = (S) => m.value = !m.value)
        }, {
          default: j(() => [
            D(A(m.value ? "Hide revoked permissions" : "Show revoked permissions"), 1)
          ]),
          _: 1
        }, 8, ["aria-expanded"])) : E("", !0),
        c(l) && !c(o).length ? (p(), V(c(sn), {
          key: 5,
          label: "Loading run-as permissions…"
        })) : R.value.length ? (p(), $("div", Ko, [
          (p(!0), $(de, null, ce(R.value, (S) => (p(), $("article", {
            key: S.policy_id,
            class: ge(["kx-card ks-runas-grant", { revoked: !S.active }])
          }, [
            O(c(F), {
              class: "ks-runas-grant-icon",
              icon: "tabler:user-shield",
              "aria-hidden": "true"
            }),
            h("div", Go, [
              h("div", qo, [
                S.active ? (p(), $("span", Fo, A(S.groups.map((H) => G.value[H] || "Group unavailable").join(", ")), 1)) : E("", !0),
                h("span", Zo, A(S.active ? "can run as" : "Permission to run as"), 1),
                h("span", Yo, A(Z.value[S.principal.id] || "Account unavailable"), 1)
              ]),
              h("div", Xo, [
                S.root === "*" ? (p(), $("span", Jo, "on any component they manage")) : S.root_label ? (p(), $("span", Qo, [
                  b[20] || (b[20] = D("on ", -1)),
                  h("b", null, A(S.root_label), 1)
                ])) : (p(), $("span", es, "on an unavailable component"))
              ])
            ]),
            S.active ? (p(), V(c(ue), {
              key: 1,
              variant: "ghost",
              small: "",
              icon: "tabler:user-off",
              disabled: C.value,
              "aria-label": `Revoke run-as permission for ${Z.value[S.principal.id] || "Account unavailable"}`,
              onClick: (H) => se(S)
            }, {
              default: j(() => [...b[22] || (b[22] = [
                D("Revoke", -1)
              ])]),
              _: 1
            }, 8, ["disabled", "aria-label", "onClick"])) : (p(), V(c(qe), {
              key: 0,
              severity: "secondary"
            }, {
              default: j(() => [...b[21] || (b[21] = [
                D("revoked", -1)
              ])]),
              _: 1
            }))
          ], 2))), 128))
        ])) : !c(r) && !s.value ? (p(), V(c(rn), {
          key: 7,
          icon: "tabler:user-shield",
          title: "No active run-as permissions"
        }, {
          hint: j(() => [...b[23] || (b[23] = [
            D("Without an active permission, the Run as setting offers only ", -1),
            h("b", null, "Me", -1),
            D(".", -1)
          ])]),
          _: 1
        })) : E("", !0)
      ])
    ]));
  }
}), ns = ["draggable"], as = { class: "ks-pcard-row" }, os = { class: "ks-pcard-body" }, ss = { class: "ks-pcard-head" }, is = ["title"], rs = {
  key: 0,
  class: "ks-pcard-comment"
}, ls = ["aria-label"], us = ["aria-label"], Pe = /* @__PURE__ */ X({
  __name: "PolicyCard",
  props: {
    policy: {},
    mode: {}
  },
  emits: ["add", "remove"],
  setup(e, { emit: t }) {
    const n = e, a = t, o = K(() => n.policy.title && n.policy.title !== n.policy.id ? n.policy.title : "Unnamed permission");
    function l(i) {
      n.mode === "locked" || !i.dataTransfer || (i.dataTransfer.setData("text/plain", n.policy.id), i.dataTransfer.effectAllowed = n.mode === "palette" ? "copy" : "move");
    }
    return (i, r) => (p(), $("div", {
      class: ge(["kx-card ks-pcard", e.mode]),
      draggable: e.mode !== "locked",
      onDragstart: l,
      onDblclick: r[2] || (r[2] = (u) => e.mode === "palette" && a("add"))
    }, [
      h("div", as, [
        e.mode === "locked" ? (p(), V(c(F), {
          key: 0,
          icon: "tabler:lock",
          class: "ks-pcard-grip locked",
          "aria-hidden": "true"
        })) : (p(), V(c(F), {
          key: 1,
          icon: "tabler:grip-vertical",
          class: "ks-pcard-grip",
          "aria-hidden": "true"
        })),
        h("div", os, [
          h("div", ss, [
            e.policy.effect === "allow" || e.policy.effect === "deny" ? (p(), V(qe, {
              key: 0,
              severity: e.policy.effect === "allow" ? "success" : "danger"
            }, {
              default: j(() => [
                D(A(e.policy.effect === "deny" ? "Blocks" : "Allows"), 1)
              ]),
              _: 1
            }, 8, ["severity"])) : E("", !0),
            h("span", {
              class: "ks-pcard-title",
              title: o.value
            }, A(o.value), 9, is)
          ]),
          e.policy.comment ? (p(), $("div", rs, A(e.policy.comment), 1)) : E("", !0)
        ]),
        e.mode === "palette" ? (p(), $("button", {
          key: 2,
          class: "ks-pcard-act add",
          "aria-label": `Add permission ${o.value}`,
          onClick: r[0] || (r[0] = Ne((u) => a("add"), ["stop"]))
        }, [
          O(c(F), {
            icon: "tabler:plus",
            "aria-hidden": "true"
          })
        ], 8, ls)) : e.mode === "selected" ? (p(), $("button", {
          key: 3,
          class: "ks-pcard-act remove",
          "aria-label": `Remove permission ${o.value}`,
          onClick: r[1] || (r[1] = Ne((u) => a("remove"), ["stop"]))
        }, [
          O(c(F), {
            icon: "tabler:x",
            "aria-hidden": "true"
          })
        ], 8, us)) : E("", !0)
      ])
    ], 42, ns));
  }
}), ds = { class: "ks" }, cs = { class: "ks-rail-search" }, ms = { class: "ks-rail-list" }, ps = {
  key: 0,
  class: "ks-rail-group"
}, fs = ["onClick"], vs = { class: "ks-scope-name" }, hs = ["onClick"], ys = { class: "ks-scope-name" }, gs = {
  key: 0,
  class: "ks-builder"
}, bs = { class: "ks-builder-head" }, ks = { class: "ks-builder-title" }, Ss = { class: "ks-builder-acts" }, $s = {
  key: 0,
  class: "ks-overlay-warn"
}, _s = {
  key: 1,
  class: "ks-view-note"
}, ws = { class: "ks-fields" }, Cs = {
  key: 0,
  class: "ks-pane locked-pane"
}, Os = { class: "ks-pane-head" }, Ps = { class: "ks-pane-sub" }, Ts = { class: "ks-pane-body" }, xs = {
  key: 0,
  class: "ks-pane-empty"
}, Ls = { class: "ks-pane" }, js = { class: "ks-pane-search" }, Ns = { class: "ks-pane-body" }, As = {
  key: 0,
  class: "ks-pane-empty"
}, Es = { class: "ks-pane-head" }, Vs = { class: "ks-pane-sub" }, Rs = { class: "ks-pane-body" }, Ds = ["onDrop"], Is = {
  key: 0,
  class: "ks-drop-hint"
}, Ms = {
  key: 1,
  class: "ks-view"
}, Us = { class: "ks-builder-head" }, Bs = { class: "ks-builder-title" }, zs = { class: "ks-builder-acts" }, Hs = { class: "ks-pane-body ks-view-list" }, Ws = {
  key: 0,
  class: "ks-pane-empty"
}, Ks = {
  key: 0,
  class: "ks-ext-block"
}, Gs = { class: "ks-ext-head" }, qs = { class: "ks-pane-body ks-view-list" }, Fs = {
  key: 2,
  class: "kx-system-body"
}, Zs = /* @__PURE__ */ X({
  __name: "Security",
  setup(e) {
    const t = Po(), { scopes: n, policies: a, loading: o, saving: l, error: i } = t, r = I(""), u = I(""), d = I(null), s = I(null), m = I("scopes"), f = I(null), y = I(!1);
    async function w(g) {
      m.value = String(g), g === "delegations" && (y.value = !0, await lt(), await f.value?.load());
    }
    In(async () => {
      await t.load(), m.value === "delegations" && await f.value?.load();
    });
    const T = K(() => {
      const g = {};
      for (const v of a.value) g[v.id] = v;
      return g;
    }), P = K(() => {
      const g = r.value.trim().toLowerCase(), v = (k) => !g || k.label.toLowerCase().includes(g) || k.id.toLowerCase().includes(g);
      return {
        custom: n.value.filter((k) => k.source === "custom" && v(k)),
        builtin: n.value.filter((k) => k.source !== "custom" && v(k))
      };
    }), C = K(() => n.value.find((g) => g.id === d.value) || null), L = K(() => C.value && C.value.source !== "custom" ? C.value : null), G = K(() => {
      if (!s.value) return [];
      const g = /* @__PURE__ */ new Set([...s.value.policies, ...s.value.base.map((k) => k.id)]), v = u.value.trim().toLowerCase();
      return a.value.filter((k) => !g.has(k.id) && (!v || (k.title || "").toLowerCase().includes(v) || k.id.toLowerCase().includes(v) || (k.comment || "").toLowerCase().includes(v)));
    }), Z = K(
      () => s.value ? s.value.policies.map((g) => T.value[g] || { id: g }) : []
    );
    function _(g) {
      d.value = g.id, s.value = g.source === "custom" ? { slug: g.slug || "", label: g.label, description: g.description, policies: g.policies.map((v) => v.id), enabled: g.enabled, isNew: !1, target: "", base: [] } : null;
    }
    function U() {
      d.value = null, s.value = { slug: Array.from(crypto.getRandomValues(new Uint8Array(16)), (g) => g.toString(16).padStart(2, "0")).join(""), label: "", description: "", policies: [], enabled: !0, isNew: !0, target: "", base: [] };
    }
    function R(g) {
      U(), Object.assign(s.value, {
        label: g.label ? `Copy of ${g.label}` : "",
        description: g.description,
        policies: [...g.policies.map((v) => v.id), ...(g.overlay_policies ?? []).map((v) => v.id)]
      });
    }
    function M(g) {
      return g.replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "");
    }
    function J(g) {
      d.value = g.id, s.value = {
        slug: g.overlay_slug || M(g.id),
        label: g.label || Q(g.id),
        description: g.description,
        policies: (g.overlay_policies ?? []).map((v) => v.id),
        enabled: !0,
        isNew: !g.overlay_slug,
        target: g.id,
        base: g.policies
      };
    }
    const B = K(() => !!s.value && s.value.target !== "");
    function ee(g) {
      s.value && !s.value.policies.includes(g) && s.value.policies.push(g);
    }
    function ne(g) {
      s.value && (s.value.policies = s.value.policies.filter((v) => v !== g));
    }
    function se(g) {
      const v = g.dataTransfer?.getData("text/plain");
      v && ee(v);
    }
    function x(g, v) {
      g.stopPropagation();
      const k = g.dataTransfer?.getData("text/plain");
      if (!k || !s.value || k === v) return;
      const Y = s.value.policies, we = Y.indexOf(k);
      we !== -1 && Y.splice(we, 1);
      const Ie = Y.indexOf(v);
      Y.splice(Ie === -1 ? Y.length : Ie, 0, k);
    }
    const b = K(() => s.value ? !s.value.isNew || s.value.target ? s.value.slug : `${M(s.value.label.normalize("NFKD").replace(/\p{M}/gu, "")).toLowerCase() || "role"}_${s.value.slug}` : ""), S = K(() => !!s.value && s.value.label.trim() !== "" && s.value.policies.length > 0), H = I("");
    let W = null;
    An(() => {
      W && clearTimeout(W);
    });
    function he(g) {
      H.value = g, W && clearTimeout(W), W = setTimeout(() => {
        H.value = "";
      }, 3e3);
    }
    async function ie() {
      if (!s.value || !S.value) return;
      const g = s.value, v = b.value, k = s.value.target, Y = s.value.label.trim() || v;
      await t.saveScope({
        slug: v,
        target: k,
        label: s.value.label.trim(),
        description: s.value.description.trim(),
        policies: s.value.policies,
        enabled: s.value.enabled
      }) && (g.slug = v, g.isNew = !1, s.value === g && (d.value = k || `kickside.security.scopes:${v}`), he(`Saved “${Y}”. The role will be available when assigning users.`));
    }
    async function ae() {
      if (!s.value || s.value.isNew) return;
      const g = B.value;
      if (!await Bt.confirm({
        header: g ? "Remove extension?" : "Delete role?",
        message: g ? "This removes the added permissions. Users keep the role’s original permissions." : "This removes the custom role and its permissions.",
        icon: "tabler:trash",
        acceptLabel: g ? "Remove extension" : "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      })) return;
      await t.deleteScope(s.value.slug) && (s.value = null, d.value = null);
    }
    function Q(g) {
      return g.includes(":") ? g.split(":").slice(-1)[0] : g;
    }
    return (g, v) => (p(), $("div", ds, [
      O(aa, {
        value: m.value,
        label: "Security administration",
        items: [
          { value: "scopes", label: "Roles" },
          { value: "delegations", label: "Run as" }
        ],
        "onUpdate:value": w
      }, null, 8, ["value"]),
      y.value ? ct((p(), V(ts, {
        key: 0,
        ref_key: "delegationPanel",
        ref: f,
        scopes: c(n)
      }, null, 8, ["scopes"])), [
        [mt, m.value === "delegations"]
      ]) : E("", !0),
      c(i) ? (p(), V(c(Fe), {
        key: 1,
        severity: "danger",
        class: "ks-top-notice",
        onDismiss: v[0] || (v[0] = (k) => i.value = "")
      }, {
        default: j(() => [
          D(A(c(i)), 1)
        ]),
        _: 1
      })) : H.value ? (p(), V(c(Fe), {
        key: 2,
        severity: "success",
        class: "ks-top-notice",
        onDismiss: v[1] || (v[1] = (k) => H.value = "")
      }, {
        default: j(() => [
          D(A(H.value), 1)
        ]),
        _: 1
      })) : E("", !0),
      m.value === "scopes" && c(o) && !c(n).length ? (p(), V(c(sn), {
        key: 3,
        label: "Loading security…"
      })) : ct((p(), V(c(ra), { key: 4 }, {
        rail: j(() => [
          O(c(ma), {
            title: "Roles",
            count: c(n).length
          }, {
            actions: j(() => [
              O(c(We), {
                icon: "tabler:plus",
                label: "New role",
                disabled: c(l),
                onClick: U
              }, null, 8, ["disabled"]),
              O(c(We), {
                icon: "tabler:refresh",
                label: "Refresh",
                disabled: c(o),
                spin: c(o),
                onClick: c(t).load
              }, null, 8, ["disabled", "spin", "onClick"])
            ]),
            _: 1
          }, 8, ["count"]),
          h("div", cs, [
            O(c(Dt), {
              modelValue: r.value,
              "onUpdate:modelValue": v[2] || (v[2] = (k) => r.value = k),
              placeholder: "Find a role…"
            }, null, 8, ["modelValue"])
          ]),
          h("div", ms, [
            P.value.custom.length ? (p(), $("div", ps, "Custom")) : E("", !0),
            (p(!0), $(de, null, ce(P.value.custom, (k) => (p(), $("button", {
              key: k.id,
              class: ge(["ks-scope-row", { active: k.id === d.value }]),
              onClick: (Y) => _(k)
            }, [
              h("span", vs, A(k.label || Q(k.id)), 1)
            ], 10, fs))), 128)),
            v[11] || (v[11] = h("div", { class: "ks-rail-group" }, "Default", -1)),
            (p(!0), $(de, null, ce(P.value.builtin, (k) => (p(), $("button", {
              key: k.id,
              class: ge(["ks-scope-row", { active: k.id === d.value }]),
              onClick: (Y) => _(k)
            }, [
              h("span", ys, A(k.label || Q(k.id)), 1)
            ], 10, hs))), 128))
          ])
        ]),
        default: j(() => [
          s.value ? (p(), $("div", gs, [
            h("div", bs, [
              h("div", ks, [
                O(c(F), {
                  icon: B.value ? "tabler:stack-2" : "tabler:shield-lock",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                h("span", null, A(B.value ? `Extend ${s.value.label || Q(s.value.target)}` : s.value.isNew ? "New role" : s.value.label || s.value.slug), 1),
                B.value ? (p(), V(c(qe), {
                  key: 0,
                  severity: "warn"
                }, {
                  default: j(() => [...v[12] || (v[12] = [
                    D("Additional permissions", -1)
                  ])]),
                  _: 1
                })) : E("", !0)
              ]),
              h("div", Ss, [
                !s.value.isNew && !B.value && C.value ? (p(), V(c(ue), {
                  key: 0,
                  variant: "soft",
                  small: "",
                  icon: "tabler:copy",
                  disabled: c(l),
                  onClick: v[3] || (v[3] = (k) => R(C.value))
                }, {
                  default: j(() => [...v[13] || (v[13] = [
                    D("Duplicate", -1)
                  ])]),
                  _: 1
                }, 8, ["disabled"])) : E("", !0),
                s.value.isNew ? E("", !0) : (p(), V(c(ue), {
                  key: 1,
                  variant: "danger",
                  small: "",
                  icon: "tabler:trash",
                  disabled: c(l),
                  onClick: ae
                }, {
                  default: j(() => [
                    D(A(B.value ? "Remove extension" : "Delete"), 1)
                  ]),
                  _: 1
                }, 8, ["disabled"])),
                O(c(ue), {
                  variant: "primary",
                  small: "",
                  icon: "tabler:device-floppy",
                  loading: c(l),
                  disabled: !S.value,
                  onClick: ie
                }, {
                  default: j(() => [
                    D(A(B.value ? "Save extension" : "Save role"), 1)
                  ]),
                  _: 1
                }, 8, ["loading", "disabled"])
              ])
            ]),
            B.value ? (p(), $("div", $s, [
              O(c(F), {
                icon: "tabler:alert-triangle",
                "aria-hidden": "true"
              }),
              h("span", null, [
                v[14] || (v[14] = D("Adding permissions grants them to ", -1)),
                h("b", null, "everyone assigned " + A(C.value?.label || Q(s.value.target)), 1),
                v[15] || (v[15] = D(". Original permissions cannot be removed here. To restrict access, create a new role with only the permissions needed.", -1))
              ])
            ])) : (p(), $("p", _s, "Choose the permissions this role grants, then assign it in System → Users. To restrict a Member, assign this role instead of Member; other assigned roles may still grant access.")),
            h("div", ws, [
              O(c(Ge), { label: "Name" }, {
                default: j(() => [
                  O(c(It), {
                    modelValue: s.value.label,
                    "onUpdate:modelValue": v[4] || (v[4] = (k) => s.value.label = k),
                    placeholder: "Reviewer"
                  }, null, 8, ["modelValue"])
                ]),
                _: 1
              }),
              O(c(Ge), { label: "Description" }, {
                default: j(() => [
                  O(c(It), {
                    modelValue: s.value.description,
                    "onUpdate:modelValue": v[5] || (v[5] = (k) => s.value.description = k),
                    placeholder: "Read-only reviewer role"
                  }, null, 8, ["modelValue"])
                ]),
                _: 1
              })
            ]),
            h("div", {
              class: ge(["ks-panes", { three: B.value }])
            }, [
              B.value ? (p(), $("section", Cs, [
                h("header", Os, [
                  v[16] || (v[16] = h("span", null, "Original permissions", -1)),
                  h("span", Ps, A(s.value.base.length) + " · locked", 1)
                ]),
                h("div", Ts, [
                  (p(!0), $(de, null, ce(s.value.base, (k) => (p(), V(Pe, {
                    key: k.id,
                    policy: k,
                    mode: "locked"
                  }, null, 8, ["policy"]))), 128)),
                  s.value.base.length ? E("", !0) : (p(), $("div", xs, "No original permissions."))
                ])
              ])) : E("", !0),
              h("section", Ls, [
                v[17] || (v[17] = h("header", { class: "ks-pane-head" }, [
                  h("span", null, "Available permissions"),
                  h("span", { class: "ks-pane-sub" }, "Click + to add")
                ], -1)),
                h("div", js, [
                  O(c(Dt), {
                    modelValue: u.value,
                    "onUpdate:modelValue": v[6] || (v[6] = (k) => u.value = k),
                    placeholder: "Search permissions…"
                  }, null, 8, ["modelValue"])
                ]),
                h("div", Ns, [
                  (p(!0), $(de, null, ce(G.value, (k) => (p(), V(Pe, {
                    key: k.id,
                    policy: k,
                    mode: "palette",
                    onAdd: (Y) => ee(k.id)
                  }, null, 8, ["policy", "onAdd"]))), 128)),
                  G.value.length ? E("", !0) : (p(), $("div", As, "No matching permissions."))
                ])
              ]),
              h("section", {
                class: "ks-pane drop",
                onDragover: v[8] || (v[8] = Ne(() => {
                }, ["prevent"])),
                onDrop: se
              }, [
                h("header", Es, [
                  h("span", null, A(B.value ? "Added by you" : "In this role"), 1),
                  h("span", Vs, A(s.value.policies.length) + " " + A(s.value.policies.length === 1 ? "permission" : "permissions"), 1)
                ]),
                h("div", Rs, [
                  (p(!0), $(de, null, ce(Z.value, (k) => (p(), $("div", {
                    key: k.id,
                    onDragover: v[7] || (v[7] = Ne(() => {
                    }, ["prevent"])),
                    onDrop: (Y) => x(Y, k.id)
                  }, [
                    O(Pe, {
                      policy: k,
                      mode: "selected",
                      onRemove: (Y) => ne(k.id)
                    }, null, 8, ["policy", "onRemove"])
                  ], 40, Ds))), 128)),
                  s.value.policies.length ? E("", !0) : (p(), $("div", Is, [
                    O(c(F), {
                      icon: "tabler:drag-drop",
                      "aria-hidden": "true"
                    }),
                    v[18] || (v[18] = h("span", null, "Use + on an available permission, or drag it here.", -1))
                  ]))
                ])
              ], 32)
            ], 2)
          ])) : L.value ? (p(), $("div", Ms, [
            h("div", Us, [
              h("div", Bs, [
                O(c(F), {
                  icon: "tabler:shield",
                  "aria-hidden": "true"
                }),
                h("span", null, A(L.value.label || Q(L.value.id)), 1)
              ]),
              h("div", zs, [
                O(c(ue), {
                  variant: "primary",
                  small: "",
                  icon: "tabler:stack-2",
                  onClick: v[9] || (v[9] = (k) => J(L.value))
                }, {
                  default: j(() => [
                    D(A(L.value.overlay_slug ? "Edit extension" : "Add permissions"), 1)
                  ]),
                  _: 1
                }),
                O(c(ue), {
                  variant: "soft",
                  small: "",
                  icon: "tabler:copy",
                  onClick: v[10] || (v[10] = (k) => R(L.value))
                }, {
                  default: j(() => [...v[19] || (v[19] = [
                    D("Copy role", -1)
                  ])]),
                  _: 1
                })
              ])
            ]),
            v[21] || (v[21] = h("p", { class: "ks-view-note" }, " Included with the application. Adding permissions affects everyone with this role. For restricted access, create a new role with only the permissions needed and assign it in System → Users instead of this role. Other assigned roles may still grant access. ", -1)),
            h("div", Hs, [
              (p(!0), $(de, null, ce(L.value.policies, (k) => (p(), V(Pe, {
                key: k.id,
                policy: k,
                mode: "locked"
              }, null, 8, ["policy"]))), 128)),
              L.value.policies.length ? E("", !0) : (p(), $("div", Ws, "No permissions in this role."))
            ]),
            L.value.overlay_policies && L.value.overlay_policies.length ? (p(), $("div", Ks, [
              h("div", Gs, [
                O(c(F), {
                  icon: "tabler:stack-2",
                  "aria-hidden": "true"
                }),
                v[20] || (v[20] = h("span", null, "Additional permissions", -1)),
                O(c(qe), { severity: "warn" }, {
                  default: j(() => [
                    D(A(L.value.overlay_policies.length), 1)
                  ]),
                  _: 1
                })
              ]),
              h("div", qs, [
                (p(!0), $(de, null, ce(L.value.overlay_policies, (k) => (p(), V(Pe, {
                  key: k.id,
                  policy: k,
                  mode: "locked"
                }, null, 8, ["policy"]))), 128))
              ])
            ])) : E("", !0)
          ])) : (p(), $("div", Fs, [
            O(c(rn), {
              icon: "tabler:shield-lock",
              title: "Roles",
              hint: "Choose a role to view its permissions, or create one with the permissions your team needs. Assign roles in System → Users.",
              cta: "New role",
              "cta-icon": "tabler:plus",
              onCta: U
            })
          ]))
        ]),
        _: 1
      }, 512)), [
        [mt, m.value === "scopes"]
      ])
    ]));
  }
}), vi = {
  rootComponent: Zs,
  plugins: [ta]
};
export {
  vi as mountConfig
};
//# sourceMappingURL=lazy-mount-Drm1HR5l.js.map
