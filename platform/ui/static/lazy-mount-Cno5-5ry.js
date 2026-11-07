import gt from "primevue/config";
import bt from "primevue/contextmenu";
import kt from "primevue/menu";
import wt from "primevue/portal";
import { renderSlot as Ne, createCommentVNode as x, h as Ct, Teleport as _t, defineComponent as tt, ref as b, onMounted as ot, watch as _e, onBeforeUnmount as at, openBlock as m, createElementBlock as g, computed as P, createElementVNode as n, toDisplayString as E, createVNode as y, unref as a, normalizeClass as H, createTextVNode as w, withDirectives as Be, vModelText as Ue, createBlock as pe, Fragment as Y, renderList as fe, withModifiers as J } from "vue";
import { Icon as v } from "@iconify/vue";
import { loadByTagName as Tt, api as he, host as Ce, on as Lt } from "@wippy-fe/proxy";
import { a as xt } from "./wc-runtime-BMe_f3Uc.js";
import St from "primevue/colorpicker";
const Dt = "data-wippy-overlay-layer";
function nt() {
  return typeof window < "u" && typeof window.document < "u";
}
function rt() {
  return nt() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function At() {
  return rt() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const Et = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let $t = 0;
const ve = /* @__PURE__ */ new WeakMap();
function ze(t, o) {
  const r = t.style;
  r.setProperty("position", "fixed", "important"), r.setProperty("inset", "auto", "important"), r.setProperty("margin", "0", "important"), r.setProperty("position-anchor", o), r.setProperty("position-area", "bottom span-right"), r.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), r.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), r.setProperty("max-width", "stretch", "important");
}
function Mt(t, o) {
  if (!Et.test(t.className))
    return;
  const r = t.style.cssText;
  ze(t, o), t.getAttribute("popover") !== "manual" && t.setAttribute("popover", "manual");
  try {
    t.matches(":popover-open") || t.showPopover();
  } catch {
  }
  if (!t.matches(":popover-open")) {
    t.removeAttribute("popover"), t.style.cssText = r;
    return;
  }
  if (!ve.has(t)) {
    const u = new MutationObserver(() => {
      const d = t.style;
      (d.top !== "auto" || d.left !== "auto" || d.margin !== "0px" || d.getPropertyPriority("top") !== "important" || d.getPropertyPriority("left") !== "important" || d.getPropertyPriority("margin") !== "important" || d.getPropertyPriority("min-width") !== "important" || d.maxWidth !== "stretch" || d.getPropertyPriority("max-width") !== "important") && ze(t, o);
    });
    u.observe(t, { attributes: !0, attributeFilter: ["style"] }), ve.set(t, u);
  }
}
function Se(t) {
  const o = ve.get(t);
  o && (o.disconnect(), ve.delete(t));
}
function Ot(t) {
  const o = t && typeof t.getRootNode == "function" ? t.getRootNode() : null;
  return o instanceof ShadowRoot ? o : null;
}
function Te(t) {
  t.style.top = "0px", t.style.left = "0px";
  const o = t.getBoundingClientRect();
  t.style.top = `${-window.scrollY - o.top}px`, t.style.left = `${-window.scrollX - o.left}px`;
}
const me = /* @__PURE__ */ new Set(), De = /* @__PURE__ */ new WeakMap();
let Fe = !1, Le = !1;
function It() {
  Le = !1;
  for (const t of me) {
    if (!t.isConnected) {
      for (const o of Array.from(t.children))
        o instanceof HTMLElement && Se(o);
      me.delete(t), De.get(t)?.disconnect();
      continue;
    }
    t.childElementCount > 0 && Te(t);
  }
}
function je() {
  Le || (Le = !0, requestAnimationFrame(It));
}
function Pt(t) {
  const o = document.createElement("div");
  o.setAttribute(Dt, "");
  const r = rt();
  if (o.style.cssText = r ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", r && o.setAttribute("popover", "manual"), t.appendChild(o), r) {
    try {
      o.showPopover();
    } catch {
    }
    o.matches(":popover-open") || (o.removeAttribute("popover"), o.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  Te(o);
  const u = new MutationObserver((d) => {
    const f = o.__wippyAnchorName;
    for (const C of d) {
      if (f)
        for (const k of Array.from(C.addedNodes))
          k instanceof HTMLElement && Mt(k, f);
      for (const k of Array.from(C.removedNodes))
        k instanceof HTMLElement && Se(k);
    }
    o.isConnected && o.childElementCount > 0 && Te(o);
  });
  return u.observe(o, { childList: !0 }), De.set(o, u), me.add(o), Fe || (Fe = !0, window.addEventListener("scroll", je, { capture: !0, passive: !0 }), window.addEventListener("resize", je, { passive: !0 })), o;
}
function Ge(t) {
  if (!(!t.hostRoot || t.layer) && (t.layer = Pt(t.hostRoot), At())) {
    const o = t.$el ? t.$el.parentElement : null;
    o && (t.anchorName = `--wippy-a-${++$t}`, t.anchorTrigger = o, o.style.setProperty("anchor-name", t.anchorName), t.layer.__wippyAnchorName = t.anchorName);
  }
}
function Ke(t) {
  if (t.anchorTrigger && (t.anchorTrigger.style.removeProperty("anchor-name"), t.anchorTrigger = null), t.anchorName = null, t.layer) {
    for (const o of Array.from(t.layer.children))
      o instanceof HTMLElement && Se(o);
    me.delete(t.layer), De.get(t.layer)?.disconnect(), t.layer.remove(), t.layer = null;
  }
}
let We = !1;
function Rt() {
  if (We)
    return;
  const t = kt;
  !t.methods || typeof t.methods.bindOutsideClickListener != "function" || (t.methods.bindOutsideClickListener = function() {
    this.outsideClickListener || (this.outsideClickListener = (o) => {
      const r = o.composedPath(), u = this.container && !r.includes(this.container), d = !(this.target && r.includes(this.target));
      this.overlayVisible && u && d ? this.hide() : !this.popup && u && d && (this.focusedOptionIndex = -1);
    }, document.addEventListener("click", this.outsideClickListener, !0));
  }, We = !0);
}
let qe = !1;
function Vt() {
  if (qe)
    return;
  const t = bt;
  !t.methods || typeof t.methods.bindOutsideClickListener != "function" || (t.methods.bindOutsideClickListener = function() {
    this.outsideClickListener || (this.outsideClickListener = (o) => {
      const r = o.composedPath(), u = this.container && !r.includes(this.container), d = this.visible ? !(this.target && r.includes(this.target)) : !0;
      u && d && this.hide();
    }, document.addEventListener("click", this.outsideClickListener, !0));
  }, qe = !0);
}
let Ye = !1;
function Ht() {
  if (Ye)
    return;
  Ye = !0;
  const t = wt;
  t.computed = t.computed || {}, t.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, t.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, t.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, t.mounted = function() {
    nt() && (this.hostRoot = Ot(this.$el), this.mounted = !0, this.hostRoot && (this.inline || Ge(this), this.$watch("inline", (o) => {
      o ? Ke(this) : Ge(this);
    })));
  }, t.render = function() {
    return this.inline ? Ne(this.$slots, "default", { key: 0 }) : this.mounted ? Ct(_t, { key: 1, to: this.resolvedTarget || document.body }, [
      Ne(this.$slots, "default")
    ]) : x("", !0);
  }, t.unmounted = function() {
    Ke(this);
  };
}
const Nt = {
  install: (t) => {
    Rt(), Vt(), Ht(), t.use(gt, { theme: "none" });
  }
}, Je = /* @__PURE__ */ tt({
  __name: "IconField",
  props: {
    modelValue: {},
    fallback: {}
  },
  emits: ["update:modelValue"],
  setup(t, { emit: o }) {
    const r = t, u = o, d = b(null);
    let f = null;
    function C(T) {
      u("update:modelValue", T.detail || "");
    }
    async function k() {
      if (d.value) {
        f && f.removeEventListener("select", C), d.value.innerHTML = "";
        try {
          customElements.get("wc-icon-picker") || await Tt("wc-icon-picker", { timeoutMs: 8e3 });
        } catch {
        }
        d.value && (f = document.createElement("wc-icon-picker"), f.setAttribute("value", r.modelValue || ""), r.fallback && f.setAttribute("fallback", r.fallback), f.addEventListener("select", C), d.value.appendChild(f));
      }
    }
    return ot(k), _e(() => r.modelValue, (T) => {
      f && f.getAttribute("value") !== T && f.setAttribute("value", T || "");
    }), at(() => {
      f && f.removeEventListener("select", C);
    }), (T, $) => (m(), g("div", {
      ref_key: "host",
      ref: d,
      class: "wc-iconfield"
    }, null, 512));
  }
}), Xe = "#22c55e", Ae = "--p-primary";
function Bt(t) {
  const o = /^rgba?\(([^)]+)\)/i.exec((t || "").trim());
  if (!o) return null;
  const r = o[1].split(",").map((d) => parseFloat(d.trim()));
  if (r.length < 3 || r.slice(0, 3).some((d) => Number.isNaN(d))) return null;
  const u = (d) => Math.max(0, Math.min(255, Math.round(d))).toString(16).padStart(2, "0");
  return `#${u(r[0])}${u(r[1])}${u(r[2])}`;
}
function Ee(t) {
  let o = (t || "").trim().replace(/^#/, "");
  return o.length === 3 && (o = o[0] + o[0] + o[1] + o[1] + o[2] + o[2]), /^[0-9a-fA-F]{6}$/.test(o) ? `#${o.toLowerCase()}` : null;
}
function Qe(t) {
  const o = Ee(t);
  if (!o) return null;
  const r = o.slice(1);
  return {
    r: parseInt(r.slice(0, 2), 16),
    g: parseInt(r.slice(2, 4), 16),
    b: parseInt(r.slice(4, 6), 16)
  };
}
function xe(t, o) {
  const r = Ee(t);
  if (!r) return "";
  const u = `${Ae}: ${r};`;
  return o === ":host" ? `:host { ${u} }` : [
    `:root { ${u} }`,
    `@media (prefers-color-scheme: dark) { :root:not(.w-theme-light) { ${u} } }`,
    `:root.w-theme-dark, .w-theme-dark { ${u} }`,
    `@media (prefers-color-scheme: light) { :root:not(.w-theme-dark) { ${u} } }`,
    `:root.w-theme-light, .w-theme-light { ${u} }`
  ].join(`
`);
}
function Ut(t, o) {
  if (!t || typeof t != "object") return "";
  const r = t[Ae];
  return typeof r == "string" ? xe(r, o) : "";
}
const zt = { r: 255, g: 255, b: 255 }, Ft = { r: 12, g: 14, b: 18 }, jt = 2, Gt = 2;
function Ze(t) {
  const o = (r) => {
    const u = r / 255;
    return u <= 0.03928 ? u / 12.92 : Math.pow((u + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * o(t.r) + 0.7152 * o(t.g) + 0.0722 * o(t.b);
}
function et(t, o) {
  const r = Ze(t), u = Ze(o);
  return (Math.max(r, u) + 0.05) / (Math.min(r, u) + 0.05);
}
function Kt(t, o = typeof document < "u" ? document : void 0) {
  const r = Ee(t);
  if (!r) return null;
  if (!o || !o.body || !o.defaultView) return Qe(r);
  const u = o.createElement("span");
  u.style.setProperty(Ae, r), u.style.color = "var(--p-primary-color)", u.style.display = "none", o.body.appendChild(u);
  const d = o.defaultView.getComputedStyle(u).color;
  return u.remove(), Qe(Bt(d) || r);
}
function Wt(t) {
  const o = Kt(t);
  if (!o) return null;
  const r = et(o, zt), u = et(o, Ft), d = r >= jt, f = u >= Gt;
  let C = "";
  return !d && !f ? C = "This tone is too low-contrast - buttons and accents would be unreadable in both light and dark mode." : d ? f || (C = "This tone is too dark - accents would be invisible against the dark background.") : C = "This tone is too light - white button text and accents would be unreadable in light mode.", { ok: d && f, onLight: r, onDark: u, reason: C };
}
function qt({ items: t, categories: o, overrides: r, home: u }) {
  const d = (l) => l.route_name || l.id;
  function f(l, s) {
    const p = d(l), L = { ...r.value[p] || {} };
    for (const [M, A] of Object.entries(s))
      A === void 0 || A === "" ? delete L[M] : L[M] = A;
    r.value = { ...r.value, [p]: L };
  }
  function C(l, s) {
    f(l, { hidden: s || void 0 }), l.hidden = s;
  }
  function k(l, s) {
    f(l, { category: s }), l.category = s;
  }
  function T(l, s) {
    f(l, { order: s }), l.order = s;
  }
  function $(l, s) {
    const p = s.replace(/^\s+/, "");
    l.label = p, f(l, { label: p || void 0 });
  }
  function O(l, s) {
    const p = (s || "").trim();
    l.icon = p, f(l, { icon: p || void 0 });
  }
  function F(l) {
    const s = r.value[d(l)];
    return !!s && (s.label !== void 0 || s.icon !== void 0);
  }
  const S = P(() => [...o.value].sort((l, s) => l.order - s.order));
  function R(l) {
    return t.value.filter((s) => !s.hidden && (s.category || "") === l).sort((s, p) => s.order - p.order || s.label.localeCompare(p.label));
  }
  const ye = P(() => {
    const l = [];
    l.push({ key: "", label: "Ungrouped", real: !1 });
    for (const p of S.value) l.push({ key: p.key, label: p.label || p.key, real: !0 });
    const s = /* @__PURE__ */ new Set(["", ...o.value.map((p) => p.key)]);
    for (const p of t.value)
      p.category && !s.has(p.category) && (s.add(p.category), l.push({ key: p.category, label: p.category, real: !1 }));
    return l;
  }), ge = P(() => t.value.filter((l) => l.hidden)), X = (l) => o.value.find((s) => s.key === l), D = b(null), j = b(null), Q = b(null), _ = (l) => t.value.find((s) => s.id === l);
  function le(l, s) {
    D.value = l.id, s.dataTransfer && (s.dataTransfer.effectAllowed = "move", s.dataTransfer.setData("text/plain", l.id));
  }
  function I() {
    D.value = null, j.value = null, Q.value = null;
  }
  function be(l) {
    const s = D.value ? _(D.value) : null;
    if (!s || s.id === l.id) return I();
    const p = l.category || "", L = R(p).filter((A) => A.id !== s.id), M = L.indexOf(l);
    L.splice(M < 0 ? L.length : M, 0, s), k(s, p), L.forEach((A, N) => T(A, N * 10)), I();
  }
  function ke(l) {
    const s = D.value ? _(D.value) : null;
    if (!s) return I();
    const p = R(l).filter((L) => L.id !== s.id);
    p.push(s), k(s, l), p.forEach((L, M) => T(L, M * 10)), I();
  }
  function U(l, s) {
    j.value = l, s.dataTransfer && (s.dataTransfer.effectAllowed = "move", s.dataTransfer.setData("text/plain", "cat:" + l));
  }
  function Z(l) {
    const s = j.value;
    if (!s || s === l) return I();
    const p = [...S.value], L = p.findIndex((N) => N.key === s), M = p.findIndex((N) => N.key === l);
    if (L < 0 || M < 0) return I();
    const [A] = p.splice(L, 1);
    p.splice(M, 0, A), p.forEach((N, oe) => {
      const ae = o.value.find((we) => we.key === N.key);
      ae && (ae.order = oe * 10);
    }), I();
  }
  let G = 0;
  function se() {
    G += 1;
    const l = S.value[S.value.length - 1];
    o.value.push({ key: "cat_" + Date.now().toString(36) + "_" + G, label: "New category", icon: "tabler:folder", order: (l?.order ?? 0) + 10 });
  }
  function K(l) {
    for (const s of t.value) s.category === l && k(s, "");
    o.value = o.value.filter((s) => s.key !== l);
  }
  function ee(l, s) {
    const p = X(l);
    p && (p.label = s);
  }
  function te(l, s) {
    const p = X(l);
    p && (p.icon = (s || "").trim() || void 0);
  }
  function z(l) {
    return !!u.value && u.value === l.path;
  }
  function ie(l) {
    u.value = z(l) ? "" : l.path;
  }
  return {
    itemKey: d,
    patchOverride: f,
    setHidden: C,
    setCategory: k,
    setOrder: T,
    setLabel: $,
    setIcon: O,
    hasOverride: F,
    orderedCats: S,
    itemsOf: R,
    editorGroups: ye,
    hiddenItems: ge,
    catByKey: X,
    dragItemId: D,
    dragCatKey: j,
    overGroup: Q,
    onItemDragStart: le,
    endDrag: I,
    onItemDrop: be,
    onGroupDrop: ke,
    onCatDragStart: U,
    onCatDrop: Z,
    addCategory: se,
    removeCategory: K,
    renameCategory: ee,
    setCatIcon: te,
    isHome: z,
    setHome: ie
  };
}
function Yt({ logoUrl: t, error: o, apiError: r }) {
  const u = b(!1);
  async function d(C) {
    const k = C.target, T = k.files && k.files[0];
    if (T) {
      if (!T.type.startsWith("image/")) {
        o.value = "Logo must be an image", k.value = "";
        return;
      }
      if (T.size > 2 * 1024 * 1024) {
        o.value = "Logo too large (max 2 MB)", k.value = "";
        return;
      }
      u.value = !0, o.value = "";
      try {
        const $ = new FormData();
        $.append("logo", T);
        const { data: O } = await he.post("/api/v1/nav/logo", $, { headers: { "Content-Type": "multipart/form-data" } });
        if (!O.success || !O.url) throw new Error(O.error || "upload failed");
        t.value = O.url;
      } catch ($) {
        o.value = r($, "upload failed");
      } finally {
        u.value = !1, k.value = "";
      }
    }
  }
  function f() {
    t.value = "";
  }
  return { uploadingLogo: u, uploadLogo: d, removeLogo: f };
}
const Jt = { class: "ap" }, Xt = { class: "ap-body" }, Qt = { class: "ap-bar" }, Zt = {
  key: 0,
  class: "ap-dirty ap-dirty-warn"
}, eo = {
  key: 1,
  class: "ap-dirty"
}, to = ["disabled"], oo = ["disabled"], ao = {
  key: 0,
  class: "ap-msg ap-err"
}, no = {
  key: 1,
  class: "ap-loading"
}, ro = {
  key: 2,
  class: "ap-grid"
}, lo = { class: "ap-side" }, so = { class: "ap-card" }, io = { class: "ap-h" }, uo = { class: "ap-logo" }, co = { class: "ap-logo-prev" }, po = ["src"], fo = { class: "ap-logo-actions" }, ho = ["accept", "disabled"], vo = { class: "ap-hint" }, mo = { class: "ap-tone" }, yo = {
  key: 0,
  class: "ap-tone-warn",
  role: "alert"
}, go = {
  class: "ap-theme-modes",
  role: "group",
  "aria-label": "Color scheme"
}, bo = ["aria-pressed", "onClick"], ko = { class: "ap-card" }, wo = { class: "ap-h" }, Co = { class: "ap-layouts" }, _o = { class: "ap-lo-name" }, To = { class: "ap-lo-name" }, Lo = { class: "ap-card ap-legend" }, xo = { class: "ap-h" }, So = { class: "ap-tips" }, Do = { class: "ap-card" }, Ao = { class: "ap-h" }, Eo = ["disabled"], $o = {
  key: 0,
  class: "ap-hint"
}, Mo = { class: "ap-card ap-structure" }, Oo = { class: "ap-h" }, Io = ["onDragover", "onDragleave", "onDrop"], Po = ["onDrop"], Ro = ["onDragstart"], Vo = {
  key: 1,
  class: "ap-grip ap-grip-ghost",
  "aria-hidden": "true"
}, Ho = ["value", "onInput"], No = { class: "ap-tile ap-tile-muted" }, Bo = { class: "ap-field ap-field-strong ap-field-static" }, Uo = { class: "ap-count" }, zo = ["onClick"], Fo = {
  key: 0,
  class: "ap-drop-hint"
}, jo = ["onDrop"], Go = ["onDragstart"], Ko = ["value", "onInput"], Wo = { class: "ap-path" }, qo = {
  key: 0,
  class: "ap-pill kx-tag-sm"
}, Yo = {
  key: 1,
  class: "ap-pill kx-tag-sm ap-pill-home"
}, Jo = ["aria-label", "title", "onClick"], Xo = ["onClick"], Qo = {
  key: 0,
  class: "ap-hidden"
}, Zo = {
  key: 0,
  class: "ap-hidden-list"
}, ea = { class: "ap-tile" }, ta = { class: "ap-field ap-field-strong ap-field-static" }, oa = ["onClick"], aa = /* @__PURE__ */ tt({
  __name: "appearance",
  setup(t) {
    const o = b(!0), r = b(!1), u = b("");
    function d(c, e) {
      return c?.response?.data?.error || c?.message || e;
    }
    const f = b("vertical"), C = b(Ce.getThemeMode?.() ?? "auto"), k = b([]), T = b([]), $ = b({}), O = b(!1), F = b(""), S = b(""), R = b(), ye = P(() => R.value?.formats.flatMap((c) => [c.mime, ...c.extensions.map((e) => `.${e}`)]).join(",")), ge = P(() => R.value ? `${R.value.formats.map((c) => c.label).join(", ")} · up to ${R.value.max_bytes / 1048576} MB.` : ""), X = Yt({ logoUrl: S, error: u, apiError: d }), { uploadingLogo: D, uploadLogo: j, removeLogo: Q } = X, _ = b(""), le = b(Xe), I = P({
      // PrimeVue's <ColorPicker format="hex"> exchanges a BARE rrggbb string, while the stored
      // setting and the hex text field both keep the #-prefixed form — so strip on the way in
      // and re-add on the way out. Falling back to defaultTone keeps the swatch showing the live
      // theme tone while the setting is unset.
      get: () => (_.value || le.value).trim().replace(/^#/, ""),
      set: (c) => {
        const e = String(c ?? "").replace(/^#/, "");
        _.value = e ? `#${e}` : "";
      }
    });
    function be() {
      _.value = "";
    }
    function ke(c) {
      C.value = c, Ce.setThemeMode(c);
    }
    const U = P(() => _.value.trim() ? Wt(_.value) : null), Z = P(() => !!_.value.trim() && U.value === null), G = P(() => Z.value || !!U.value && !U.value.ok), se = P(() => Z.value ? "Enter a valid hex color, e.g. #2563eb." : U.value && !U.value.ok ? U.value.reason : ""), K = b(""), ee = b(""), te = () => JSON.stringify({
      layout: f.value,
      cats: T.value,
      overrides: $.value,
      title: F.value,
      logo: S.value,
      home: K.value,
      tone: _.value,
      pos: k.value.map((c) => [c.id, c.category, c.order, !!c.hidden])
    }), z = P(() => te() !== ee.value);
    async function ie() {
      o.value = !0, u.value = "";
      try {
        const { data: c } = await he.get("/api/v1/nav/list?manage=1");
        if (!c.success) throw new Error(c.error || "failed to load nav");
        R.value = c.logo_upload, k.value = (c.items ?? []).map((i) => ({ ...i })), f.value = c.layout === "horizontal" ? "horizontal" : "vertical";
        const e = c.config ?? {};
        return T.value = Array.isArray(e.categories) ? e.categories.map((i) => ({ ...i })) : [], $.value = e.overrides && typeof e.overrides == "object" ? structuredClone(e.overrides) : {}, F.value = typeof e.title == "string" ? e.title : "", S.value = typeof e.logo_url == "string" ? e.logo_url : "", _.value = typeof e.primary_color == "string" ? e.primary_color : "", re = _.value, K.value = typeof c.home == "string" ? c.home : typeof e.home == "string" ? e.home : "", ee.value = te(), !0;
      } catch (c) {
        return u.value = d(c, "failed to load"), !1;
      } finally {
        o.value = !1;
      }
    }
    const l = qt({ items: k, categories: T, overrides: $, home: K }), {
      setHidden: s,
      setLabel: p,
      setIcon: L,
      hasOverride: M,
      itemsOf: A,
      editorGroups: N,
      hiddenItems: oe,
      catByKey: ae,
      dragItemId: we,
      overGroup: ue,
      onItemDragStart: lt,
      endDrag: ce,
      onItemDrop: st,
      onGroupDrop: $e,
      onCatDragStart: it,
      onCatDrop: ut,
      addCategory: Me,
      removeCategory: ct,
      renameCategory: dt,
      setCatIcon: pt,
      isHome: ne,
      setHome: ft
    } = l, W = b(!1), Oe = b(!1);
    async function ht() {
      W.value = !0, u.value = "";
      try {
        const { data: c } = await he.delete("/api/v1/ui/splash/seen");
        if (c?.success !== !0) throw new Error(c?.error || "could not reset setup");
        Oe.value = !0, window.dispatchEvent(new CustomEvent("kickside:nav-changed"));
      } catch (c) {
        u.value = d(c, "could not reset setup");
      } finally {
        W.value = !1;
      }
    }
    let B = null, Ie = !1, re = "", Pe = null;
    async function vt() {
      try {
        const c = await fetch("/app/css-variables.facade.json", { cache: "no-store" });
        if (!c.ok) return;
        const e = await c.json();
        if (e && typeof e == "object") {
          Pe = e;
          const i = e["--p-primary"];
          typeof i == "string" && (le.value = i), !_.value.trim() && de.value !== !1 && q("");
        }
      } catch {
      }
    }
    function Re(c, e) {
      return xe(c, e) || Ut(Pe, e) || xe(Xe, e);
    }
    function q(c) {
      window.dispatchEvent(new CustomEvent("kickside:tone-apply", {
        detail: { hostCss: Re(c, ":root"), shadowCss: Re(c, ":host") }
      }));
    }
    at(() => {
      Ie = !0, B && clearTimeout(B), q(re), Ve?.();
    });
    async function mt() {
      if (G.value) return;
      const c = te(), e = _.value;
      r.value = !0, u.value = "";
      try {
        const { data: i } = await he.put("/api/v1/nav/config", {
          layout: f.value,
          overrides: $.value,
          categories: T.value,
          title: F.value,
          logo_url: S.value,
          home: K.value,
          primary_color: _.value
        });
        if (!i.success) throw new Error(i.error || "save failed");
        ee.value = c, re = e, q(Ie || de.value === !1 ? re : _.value);
      } catch (i) {
        u.value = d(i, "save failed");
      } finally {
        r.value = !1;
      }
    }
    let Ve = null;
    ot(() => {
      C.value = Ce.getThemeMode?.() ?? "auto", Ve = Lt("@theme", (c) => {
        C.value = c;
      }), vt();
    });
    let He = !1;
    async function yt() {
      He && z.value || await ie() && (He = !0);
    }
    const de = xt(yt);
    return _e(_, (c) => {
      B && clearTimeout(B), B = null, de.value !== !1 && (B = setTimeout(() => q(c), 90));
    }), _e(de, (c, e) => {
      e === !0 && c === !1 ? (B && clearTimeout(B), B = null, q(re)) : e === !1 && c === !0 && z.value && q(_.value);
    }), (c, e) => (m(), g("div", Jt, [
      n("div", Xt, [
        n("header", Qt, [
          G.value ? (m(), g("span", Zt, E(Z.value ? "Invalid color" : "Tone unreadable"), 1)) : z.value ? (m(), g("span", eo, "Unsaved changes")) : x("", !0),
          n("button", {
            class: "ap-btn ap-btn-ghost",
            disabled: !z.value || r.value,
            onClick: ie
          }, "Discard", 8, to),
          n("button", {
            class: "ap-btn ap-btn-primary",
            disabled: !z.value || r.value || G.value,
            onClick: mt
          }, [
            y(a(v), {
              icon: r.value ? "tabler:loader-2" : "tabler:device-floppy",
              class: H(r.value && "spin"),
              "aria-hidden": "true"
            }, null, 8, ["icon", "class"]),
            w(" " + E(r.value ? "Saving…" : "Save"), 1)
          ], 8, oo)
        ]),
        u.value ? (m(), g("div", ao, E(u.value), 1)) : x("", !0),
        o.value ? (m(), g("div", no, [
          y(a(v), {
            icon: "tabler:loader-2",
            class: "spin"
          }),
          e[13] || (e[13] = w(" Loading…", -1))
        ])) : (m(), g("div", ro, [
          n("aside", lo, [
            n("section", so, [
              n("header", io, [
                y(a(v), {
                  icon: "tabler:photo",
                  "aria-hidden": "true"
                }),
                e[14] || (e[14] = w(" Branding", -1))
              ]),
              e[17] || (e[17] = n("p", { class: "ap-sub" }, "Title and logo apply to everyone on this installation — header, login page, and browser tab.", -1)),
              e[18] || (e[18] = n("label", { class: "ap-blabel" }, "Title", -1)),
              Be(n("input", {
                "onUpdate:modelValue": e[0] || (e[0] = (i) => F.value = i),
                class: "ap-binput",
                type: "text",
                maxlength: "60",
                placeholder: "KickSide"
              }, null, 512), [
                [Ue, F.value]
              ]),
              e[19] || (e[19] = n("label", { class: "ap-blabel" }, "Logo", -1)),
              n("div", uo, [
                n("span", co, [
                  S.value ? (m(), g("img", {
                    key: 0,
                    src: S.value,
                    alt: "Logo preview"
                  }, null, 8, po)) : (m(), pe(a(v), {
                    key: 1,
                    icon: "tabler:photo",
                    "aria-hidden": "true"
                  }))
                ]),
                n("div", fo, [
                  n("label", {
                    class: H(["ap-btn ap-btn-ghost", a(D) && "ap-btn-busy"])
                  }, [
                    y(a(v), {
                      icon: a(D) ? "tabler:loader-2" : "tabler:upload",
                      class: H(a(D) && "spin"),
                      "aria-hidden": "true"
                    }, null, 8, ["icon", "class"]),
                    w(" " + E(a(D) ? "Uploading…" : "Upload") + " ", 1),
                    n("input", {
                      type: "file",
                      accept: ye.value,
                      class: "ap-file",
                      disabled: a(D) || !R.value,
                      onChange: e[1] || (e[1] = //@ts-ignore
                      (...i) => a(j) && a(j)(...i))
                    }, null, 40, ho)
                  ], 2),
                  S.value ? (m(), g("button", {
                    key: 0,
                    class: "ap-btn ap-btn-ghost ap-danger",
                    onClick: e[2] || (e[2] = //@ts-ignore
                    (...i) => a(Q) && a(Q)(...i))
                  }, [
                    y(a(v), {
                      icon: "tabler:trash",
                      "aria-hidden": "true"
                    }),
                    e[15] || (e[15] = w(" Remove ", -1))
                  ])) : x("", !0)
                ])
              ]),
              n("p", vo, E(ge.value), 1),
              e[20] || (e[20] = n("label", { class: "ap-blabel" }, "Base tone", -1)),
              n("div", mo, [
                y(a(St), {
                  modelValue: I.value,
                  "onUpdate:modelValue": e[3] || (e[3] = (i) => I.value = i),
                  format: "hex",
                  class: "ap-tone-swatch",
                  pt: { preview: { class: "ap-tone-preview", "aria-label": "Base tone color", "data-testid": "appearance-base-tone-picker" } }
                }, null, 8, ["modelValue"]),
                Be(n("input", {
                  "onUpdate:modelValue": e[4] || (e[4] = (i) => _.value = i),
                  class: "ap-binput ap-tone-hex",
                  type: "text",
                  maxlength: "7",
                  placeholder: "Default",
                  "aria-label": "Base tone hex"
                }, null, 512), [
                  [Ue, _.value]
                ]),
                _.value ? (m(), g("button", {
                  key: 0,
                  class: "ap-btn ap-btn-ghost",
                  onClick: be
                }, [
                  y(a(v), {
                    icon: "tabler:rotate",
                    "aria-hidden": "true"
                  }),
                  e[16] || (e[16] = w(" Reset", -1))
                ])) : x("", !0)
              ]),
              se.value ? (m(), g("p", yo, [
                y(a(v), {
                  icon: "tabler:alert-triangle",
                  "aria-hidden": "true"
                }),
                w(" " + E(se.value), 1)
              ])) : x("", !0),
              e[21] || (e[21] = n("p", { class: "ap-hint" }, "Primary color for buttons, links and accents. Applies across the app instantly.", -1)),
              e[22] || (e[22] = n("label", { class: "ap-blabel" }, "Color scheme", -1)),
              n("div", go, [
                (m(), g(Y, null, fe([
                  { mode: "auto", label: "Auto", icon: "tabler:device-desktop" },
                  { mode: "light", label: "Light", icon: "tabler:sun" },
                  { mode: "dark", label: "Dark", icon: "tabler:moon" }
                ], (i) => n("button", {
                  key: i.mode,
                  type: "button",
                  class: H(["ap-theme-mode", C.value === i.mode && "ap-theme-mode-on"]),
                  "aria-pressed": C.value === i.mode,
                  onClick: (h) => ke(i.mode)
                }, [
                  y(a(v), {
                    icon: i.icon,
                    "aria-hidden": "true"
                  }, null, 8, ["icon"]),
                  w(" " + E(i.label), 1)
                ], 10, bo)), 64))
              ]),
              e[23] || (e[23] = n("p", { class: "ap-hint" }, "Auto follows your browser or operating system setting. Changes apply immediately.", -1))
            ]),
            n("section", ko, [
              n("header", wo, [
                y(a(v), {
                  icon: "tabler:layout-2",
                  "aria-hidden": "true"
                }),
                e[24] || (e[24] = w(" Layout", -1))
              ]),
              e[31] || (e[31] = n("p", { class: "ap-sub" }, "Where navigation sits.", -1)),
              n("div", Co, [
                n("button", {
                  class: H(["ap-lo", f.value === "vertical" && "ap-lo-on"]),
                  onClick: e[5] || (e[5] = (i) => f.value = "vertical")
                }, [
                  e[26] || (e[26] = n("span", { class: "mock mock-v" }, [
                    n("span", { class: "mock-rail" }, [
                      n("i"),
                      n("i"),
                      n("i")
                    ]),
                    n("span", { class: "mock-fill" })
                  ], -1)),
                  n("span", _o, [
                    e[25] || (e[25] = w("Vertical ", -1)),
                    f.value === "vertical" ? (m(), pe(a(v), {
                      key: 0,
                      icon: "tabler:circle-check-filled",
                      "aria-hidden": "true"
                    })) : x("", !0)
                  ]),
                  e[27] || (e[27] = n("span", { class: "ap-lo-desc" }, "Sidebar rail", -1))
                ], 2),
                n("button", {
                  class: H(["ap-lo", f.value === "horizontal" && "ap-lo-on"]),
                  onClick: e[6] || (e[6] = (i) => f.value = "horizontal")
                }, [
                  e[29] || (e[29] = n("span", { class: "mock mock-h" }, [
                    n("span", { class: "mock-top" }, [
                      n("i"),
                      n("i"),
                      n("i")
                    ]),
                    n("span", { class: "mock-fill" })
                  ], -1)),
                  n("span", To, [
                    e[28] || (e[28] = w("Horizontal ", -1)),
                    f.value === "horizontal" ? (m(), pe(a(v), {
                      key: 0,
                      icon: "tabler:circle-check-filled",
                      "aria-hidden": "true"
                    })) : x("", !0)
                  ]),
                  e[30] || (e[30] = n("span", { class: "ap-lo-desc" }, "Top bar", -1))
                ], 2)
              ])
            ]),
            n("section", Lo, [
              n("header", xo, [
                y(a(v), {
                  icon: "tabler:info-circle",
                  "aria-hidden": "true"
                }),
                e[32] || (e[32] = w(" How it works", -1))
              ]),
              n("ul", So, [
                n("li", null, [
                  y(a(v), {
                    icon: "tabler:grip-vertical",
                    "aria-hidden": "true"
                  }),
                  e[33] || (e[33] = w(" Drag to reorder or move between categories.", -1))
                ]),
                n("li", null, [
                  y(a(v), {
                    icon: "tabler:cursor-text",
                    "aria-hidden": "true"
                  }),
                  e[34] || (e[34] = w(" Click a label to rename it.", -1))
                ]),
                n("li", null, [
                  y(a(v), {
                    icon: "tabler:mood-smile",
                    "aria-hidden": "true"
                  }),
                  e[35] || (e[35] = w(" Click an icon to pick a new Tabler glyph.", -1))
                ]),
                n("li", null, [
                  y(a(v), {
                    icon: "tabler:eye-off",
                    "aria-hidden": "true"
                  }),
                  e[36] || (e[36] = w(" Hide a surface without removing its module.", -1))
                ])
              ])
            ]),
            n("section", Do, [
              n("header", Ao, [
                y(a(v), {
                  icon: "tabler:rocket",
                  "aria-hidden": "true"
                }),
                e[37] || (e[37] = w(" Setup", -1))
              ]),
              e[38] || (e[38] = n("p", { class: "ap-sub" }, "Reopen setup for this installation. Once completed, it stays closed for everyone.", -1)),
              n("button", {
                class: "ap-btn ap-btn-ghost",
                disabled: W.value,
                onClick: ht
              }, [
                y(a(v), {
                  icon: W.value ? "tabler:loader-2" : "tabler:refresh",
                  class: H(W.value && "spin"),
                  "aria-hidden": "true"
                }, null, 8, ["icon", "class"]),
                w(" " + E(W.value ? "Resetting…" : "Show setup again"), 1)
              ], 8, Eo),
              Oe.value ? (m(), g("p", $o, "Setup will appear now, or next time the app loads.")) : x("", !0)
            ])
          ]),
          n("section", Mo, [
            n("header", Oo, [
              y(a(v), {
                icon: "tabler:sitemap",
                "aria-hidden": "true"
              }),
              e[40] || (e[40] = w(" Structure ", -1)),
              n("button", {
                class: "ap-btn ap-btn-ghost ap-add",
                onClick: e[7] || (e[7] = //@ts-ignore
                (...i) => a(Me) && a(Me)(...i))
              }, [
                y(a(v), {
                  icon: "tabler:folder-plus",
                  "aria-hidden": "true"
                }),
                e[39] || (e[39] = w(" Add category", -1))
              ])
            ]),
            (m(!0), g(Y, null, fe(a(N), (i) => (m(), g("div", {
              key: i.key || "_root",
              class: H(["ap-group", a(ue) === i.key && "ap-group-over"]),
              onDragover: J((h) => ue.value = i.key, ["prevent"]),
              onDragleave: (h) => a(ue) === i.key && (ue.value = null),
              onDrop: J((h) => a($e)(i.key), ["prevent"])
            }, [
              n("div", {
                class: "ap-group-head",
                onDragover: e[9] || (e[9] = J(() => {
                }, ["prevent"])),
                onDrop: J((h) => i.real ? a(ut)(i.key) : a($e)(i.key), ["prevent", "stop"])
              }, [
                i.real ? (m(), g("span", {
                  key: 0,
                  class: "ap-grip ap-grip-cat",
                  draggable: "true",
                  title: "Drag to reorder category",
                  onDragstart: (h) => a(it)(i.key, h),
                  onDragend: e[8] || (e[8] = //@ts-ignore
                  (...h) => a(ce) && a(ce)(...h))
                }, [
                  y(a(v), {
                    icon: "tabler:grip-vertical",
                    "aria-hidden": "true"
                  })
                ], 40, Ro)) : (m(), g("span", Vo)),
                i.real ? (m(), g(Y, { key: 2 }, [
                  y(Je, {
                    "model-value": a(ae)(i.key)?.icon || "",
                    fallback: "tabler:folder",
                    "onUpdate:modelValue": (h) => a(pt)(i.key, h)
                  }, null, 8, ["model-value", "onUpdate:modelValue"]),
                  n("input", {
                    value: a(ae)(i.key)?.label,
                    class: "ap-field ap-field-strong",
                    "aria-label": "Category name",
                    placeholder: "Category name",
                    onInput: (h) => a(dt)(i.key, h.target.value)
                  }, null, 40, Ho)
                ], 64)) : (m(), g(Y, { key: 3 }, [
                  n("span", No, [
                    y(a(v), {
                      icon: "tabler:layout-list",
                      "aria-hidden": "true"
                    })
                  ]),
                  n("span", Bo, E(i.label), 1)
                ], 64)),
                n("span", Uo, E(a(A)(i.key).length), 1),
                i.real ? (m(), g("button", {
                  key: 4,
                  class: "ap-icon-btn ap-danger",
                  "aria-label": "Remove category",
                  title: "Remove category",
                  onClick: (h) => a(ct)(i.key)
                }, [
                  y(a(v), {
                    icon: "tabler:trash",
                    "aria-hidden": "true"
                  })
                ], 8, zo)) : x("", !0)
              ], 40, Po),
              a(A)(i.key).length === 0 ? (m(), g("div", Fo, "Drag a surface here")) : x("", !0),
              (m(!0), g(Y, null, fe(a(A)(i.key), (h) => (m(), g("div", {
                key: h.id,
                class: H(["ap-row", a(we) === h.id && "ap-row-dragging"]),
                onDragover: e[11] || (e[11] = J(() => {
                }, ["prevent", "stop"])),
                onDrop: J((V) => a(st)(h), ["prevent", "stop"])
              }, [
                n("span", {
                  class: "ap-grip",
                  draggable: "true",
                  title: "Drag to reorder or move",
                  onDragstart: (V) => a(lt)(h, V),
                  onDragend: e[10] || (e[10] = //@ts-ignore
                  (...V) => a(ce) && a(ce)(...V))
                }, [
                  y(a(v), {
                    icon: "tabler:grip-vertical",
                    "aria-hidden": "true"
                  })
                ], 40, Go),
                y(Je, {
                  "model-value": h.icon || "",
                  fallback: "tabler:square",
                  "onUpdate:modelValue": (V) => a(L)(h, V)
                }, null, 8, ["model-value", "onUpdate:modelValue"]),
                n("input", {
                  value: h.label,
                  class: "ap-field ap-field-strong",
                  "aria-label": "Surface label",
                  placeholder: "Label",
                  onInput: (V) => a(p)(h, V.target.value)
                }, null, 40, Ko),
                n("span", Wo, E(h.path), 1),
                h.source === "custom" ? (m(), g("span", qo, "custom")) : x("", !0),
                a(ne)(h) ? (m(), g("span", Yo, [
                  y(a(v), {
                    icon: "tabler:home",
                    "aria-hidden": "true"
                  }),
                  e[41] || (e[41] = w(" home", -1))
                ])) : x("", !0),
                a(M)(h) ? (m(), pe(a(v), {
                  key: 2,
                  icon: "tabler:pencil",
                  class: "ap-edited",
                  title: "Customized — reset the field to revert",
                  "aria-hidden": "true"
                })) : x("", !0),
                n("button", {
                  class: H(["ap-icon-btn", a(ne)(h) && "ap-home-on"]),
                  "aria-label": a(ne)(h) ? "Home page (click to unset)" : "Set as home page",
                  title: a(ne)(h) ? "Home page — click to unset" : "Set as home page",
                  onClick: (V) => a(ft)(h)
                }, [
                  y(a(v), {
                    icon: a(ne)(h) ? "tabler:home-filled" : "tabler:home",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ], 10, Jo),
                n("button", {
                  class: "ap-icon-btn",
                  "aria-label": "Hide",
                  title: "Hide",
                  onClick: (V) => a(s)(h, !0)
                }, [
                  y(a(v), {
                    icon: "tabler:eye",
                    "aria-hidden": "true"
                  })
                ], 8, Xo)
              ], 42, jo))), 128))
            ], 42, Io))), 128)),
            a(oe).length ? (m(), g("div", Qo, [
              n("button", {
                class: "ap-hidden-h",
                onClick: e[12] || (e[12] = (i) => O.value = !O.value)
              }, [
                y(a(v), {
                  icon: O.value ? "tabler:chevron-down" : "tabler:chevron-right",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                y(a(v), {
                  icon: "tabler:eye-off",
                  "aria-hidden": "true"
                }),
                w(" Hidden (" + E(a(oe).length) + ") ", 1)
              ]),
              O.value ? (m(), g("div", Zo, [
                (m(!0), g(Y, null, fe(a(oe), (i) => (m(), g("div", {
                  key: i.id,
                  class: "ap-row ap-row-off"
                }, [
                  e[42] || (e[42] = n("span", {
                    class: "ap-grip ap-grip-ghost",
                    "aria-hidden": "true"
                  }, null, -1)),
                  n("span", ea, [
                    y(a(v), {
                      icon: i.icon || "tabler:square",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"])
                  ]),
                  n("span", ta, E(i.label), 1),
                  n("button", {
                    class: "ap-icon-btn",
                    "aria-label": "Show",
                    title: "Show",
                    onClick: (h) => a(s)(i, !1)
                  }, [
                    y(a(v), {
                      icon: "tabler:eye-plus",
                      "aria-hidden": "true"
                    })
                  ], 8, oa)
                ]))), 128))
              ])) : x("", !0)
            ])) : x("", !0)
          ])
        ]))
      ])
    ]));
  }
}), fa = {
  rootComponent: aa,
  plugins: [Nt]
};
export {
  fa as mountConfig
};
//# sourceMappingURL=lazy-mount-Cno5-5ry.js.map
