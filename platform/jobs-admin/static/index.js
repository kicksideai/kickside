import { hasInjectionContext as fr, inject as yn, effectScope as hr, ref as D, markRaw as mr, onMounted as wn, onUnmounted as xn, watch as Ee, createApp as br, readonly as vr, getCurrentInstance as Lt, nextTick as gr, reactive as yr, renderSlot as be, openBlock as _, createBlock as Ne, Teleport as kn, createCommentVNode as z, useId as wr, mergeProps as q, h as xr, createElementBlock as T, createElementVNode as $, createTextVNode as ye, toDisplayString as N, resolveComponent as Nt, resolveDirective as kr, withDirectives as _r, resolveDynamicComponent as Sr, withCtx as _n, normalizeClass as lt, defineComponent as Sn, createVNode as ze, unref as M, computed as Oe, Fragment as Ie, renderList as Re, normalizeStyle as $r } from "vue";
import { addCollection as Pr, Icon as $n } from "@iconify/vue";
import { config as It, addIcons as Cr, on as gt, applyThemeMode as nt, host as Or, hostCss as Tr, loadCss as jr, api as Rt, define as Ar } from "@wippy-fe/proxy";
var yt = "data-wippy-visible";
function Vt(e) {
  const t = e.getAttribute(yt);
  return t === "true" ? !0 : t === "false" ? !1 : null;
}
var Er = Object.defineProperty, Lr = (e, t, n) => t in e ? Er(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, V = (e, t, n) => Lr(e, typeof t != "symbol" ? t + "" : t, n), Nr = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], Ir = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function Mt(e) {
  const t = e.startsWith("--") ? e : `--${e}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(t) ? t : null;
}
function Rr(...e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of e)
    if (n)
      for (const [r, o] of Object.entries(n)) {
        if ((r === "@light" || r === "@dark") && o && typeof o == "object") {
          for (const [l, s] of Object.entries(o)) {
            const a = typeof s == "string" ? Mt(l) : null;
            a && t.add(a);
          }
          continue;
        }
        const i = typeof o == "string" ? Mt(r) : null;
        i && t.add(i);
      }
  return [...t].sort();
}
function Vr(e) {
  if (e.length === 0)
    return "";
  const t = e.map((n) => `  ${n}: inherit;`).join(`
`);
  return `${Ir} {
${t}
}`;
}
function Mr(e, t) {
  const n = Vr(t);
  n && Pn(e, n, "@wippy-fe/css-variables-bridge");
}
function zr(e, t) {
  const r = (t ?? Nr).map(async (o) => {
    const i = Tr[o];
    if (!i)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${o}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await jr(i);
    } catch (l) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${o}" (${i}):`, l), null;
    }
  });
  return Promise.all(r).then((o) => {
    for (const i of o) {
      if (!i)
        continue;
      const l = document.createElement("style");
      l.textContent = i, l.setAttribute("role", "@wippy-fe/host-css"), e.appendChild(l);
    }
  });
}
function Dr(e, t) {
  const n = document.createElement("style");
  n.textContent = t, e.appendChild(n);
}
function Pn(e, t, n) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const o = new CSSStyleSheet();
    o.replaceSync(t), e.adoptedStyleSheets = [...e.adoptedStyleSheets, o];
    return;
  }
  const r = document.createElement("style");
  r.setAttribute("role", n), r.textContent = t, e.appendChild(r);
}
function Br(e, t) {
  Pn(e, t, "@wippy-fe/custom-css");
}
function Cn(e) {
  return e.__wippyHost ?? null;
}
function Ur(e) {
  return e.replace(/-([a-z])/g, (t, n) => n.toUpperCase());
}
function Hr(e, t, n) {
  switch (n.type) {
    case "string":
      return { value: t };
    case "number": {
      const r = Number.parseFloat(t);
      return Number.isNaN(r) ? { value: void 0, error: `Invalid ${e}: expected a number` } : { value: r };
    }
    case "integer": {
      const r = Number.parseInt(t, 10);
      return Number.isNaN(r) ? { value: void 0, error: `Invalid ${e}: expected an integer` } : { value: r };
    }
    case "boolean":
      return { value: t !== "false" };
    case "array":
    case "object":
      try {
        const r = JSON.parse(t);
        return n.type === "array" && !Array.isArray(r) ? { value: void 0, error: `Invalid ${e}: expected a JSON array` } : { value: r };
      } catch {
        return { value: void 0, error: `Invalid ${e}: must be valid JSON` };
      }
    default:
      return { value: t };
  }
}
function ht(e, t) {
  const n = {}, r = [];
  for (const [o, i] of Object.entries(t.properties)) {
    const l = e.getAttribute(o), s = Ur(o);
    if (l === null) {
      i.default !== void 0 && (n[s] = i.default);
      continue;
    }
    const a = Hr(o, l, i);
    a.error ? r.push(a.error) : n[s] = a.value;
  }
  return { props: n, errors: r };
}
var Wr = class {
  constructor(e, t) {
    V(this, "_props"), V(this, "_errors"), V(this, "_content"), V(this, "_hostVisibility"), V(this, "_propsListeners", /* @__PURE__ */ new Set()), V(this, "_contentListeners", /* @__PURE__ */ new Set()), V(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), V(this, "_disposed", !1), V(this, "_emitToDom"), V(this, "props"), V(this, "events"), V(this, "content"), V(this, "hostVisibility"), this._props = e.props, this._errors = e.errors, this._content = e.content, this._hostVisibility = e.hostVisibility, this._emitToDom = t;
    const n = this;
    this.props = {
      get value() {
        return n._props;
      },
      get errors() {
        return n._errors;
      },
      subscribe(r, o) {
        return n._subscribeProps(r, o);
      }
    }, this.events = {
      emit(r, o) {
        n._disposed || n._emitToDom(r, o);
      }
    }, this.content = e.hasContent ? {
      get value() {
        return n._content;
      },
      subscribe(r, o) {
        return n._subscribeContent(r, o);
      }
    } : null, this.hostVisibility = {
      get value() {
        return n._hostVisibility;
      },
      subscribe(r, o) {
        return n._subscribeHostVisibility(r, o);
      }
    };
  }
  /** @internal */
  notifyProps(e, t) {
    if (!this._disposed) {
      this._props = e, this._errors = t;
      for (const n of this._propsListeners)
        n(e, t);
    }
  }
  /** @internal */
  notifyContent(e) {
    if (!this._disposed) {
      this._content = e;
      for (const t of this._contentListeners)
        t(e);
    }
  }
  /** @internal */
  notifyHostVisibility(e, t) {
    if (!(this._disposed || e === t)) {
      this._hostVisibility = e;
      for (const n of this._hostVisibilityListeners)
        n(e, t);
    }
  }
  /** @internal */
  dispose() {
    this._disposed || (this._disposed = !0, this._propsListeners.clear(), this._contentListeners.clear(), this._hostVisibilityListeners.clear());
  }
  _subscribeProps(e, t) {
    if (this._disposed || t?.signal?.aborted)
      return () => {
      };
    this._propsListeners.add(e), t?.immediate && e(this._props, this._errors);
    const n = () => {
      this._propsListeners.delete(e), t?.signal?.removeEventListener("abort", n);
    };
    return t?.signal?.addEventListener("abort", n, { once: !0 }), n;
  }
  _subscribeContent(e, t) {
    if (this._disposed || t?.signal?.aborted)
      return () => {
      };
    this._contentListeners.add(e), t?.immediate && e(this._content);
    const n = () => {
      this._contentListeners.delete(e), t?.signal?.removeEventListener("abort", n);
    };
    return t?.signal?.addEventListener("abort", n, { once: !0 }), n;
  }
  _subscribeHostVisibility(e, t) {
    if (this._disposed || t?.signal?.aborted)
      return () => {
      };
    this._hostVisibilityListeners.add(e), t?.immediate && e(this._hostVisibility, this._hostVisibility);
    const n = () => {
      this._hostVisibilityListeners.delete(e), t?.signal?.removeEventListener("abort", n);
    };
    return t?.signal?.addEventListener("abort", n, { once: !0 }), n;
  }
}, Fr = class extends HTMLElement {
  constructor() {
    super(), V(this, "_internals"), V(this, "_contentObserver", null), V(this, "_initialized", !1), V(this, "_container", null), V(this, "_reactive", null), V(this, "_lastProps", null), V(this, "_lastErrors", []), V(this, "_lastContent", null), V(this, "_themeUnsub", null), V(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = Vt(this);
  }
  /**
   * Override to provide the component's configuration.
   * Must be static because `observedAttributes` reads it before construction.
   *
   * Specify the generic to get typed `validateProps`:
   * ```ts
   * static get wippyConfig(): WippyElementConfig<MyProps> { ... }
   * ```
   */
  static get wippyConfig() {
    return { propsSchema: { properties: {} } };
  }
  /**
   * Derived from the props schema + any `extraObservedAttributes`.
   */
  static get observedAttributes() {
    const e = this.wippyConfig, t = Object.keys(e.propsSchema.properties), n = e.extraObservedAttributes ?? [];
    return [.../* @__PURE__ */ new Set([...t, ...n, yt])];
  }
  /**
   * Host-owned logical activity. `null` means no host manages this element.
   * It is not CSS visibility or viewport intersection.
   */
  get hostVisible() {
    return this._hostVisible;
  }
  /**
   * Panel-scoped `host` wrapper attached by the managed-layout shell's
   * content resolvers (`ComponentResolver` / `WebComponentPackageLoader`).
   *
   * Inside a managed-layout panel, this is a wrapper around the universal
   * `host` API where context-aware calls (`layout.broadcast / send / on`)
   * are routed through the panel-bound bus — so `sourcePanelId` is
   * attributed correctly without postMessage indirection. Layout
   * mutations and other host methods pass through unchanged.
   *
   * `null` outside a managed-layout context (compat shell, chat sidebar,
   * standalone playground). Subclass code that needs a host in those
   * cases can fall back to `import { host } from '@wippy-fe/proxy'`.
   */
  get host() {
    return Cn(this);
  }
  /**
   * Emit a CustomEvent that bubbles and crosses shadow DOM boundaries.
   */
  emitEvent(e, t) {
    this.dispatchEvent(new CustomEvent(e, {
      bubbles: !0,
      composed: !0,
      detail: t
    }));
  }
  /**
   * Opt-in reactive adapter — framework-agnostic. Subscribe to prop
   * changes, content changes, or emit typed events from a non-Vue
   * consumer without re-rolling reactivity.
   *
   * ```ts
   * class MyEl extends WippyElement<{ count: number }, { tick: { n: number } }> {
   *   protected onMount() {
   *     const ctrl = new AbortController()
   *     this.reactive.props.subscribe(({ count }) => {
   *       this.shadowRoot!.querySelector('.n')!.textContent = String(count)
   *     }, { signal: ctrl.signal, immediate: true })
   *   }
   *   tick(n: number) { this.reactive.events.emit('tick', { n }) }
   * }
   * ```
   *
   * Allocation cost is zero unless this getter is touched. Disposed on
   * `disconnectedCallback`; a fresh adapter is allocated on the next
   * access after reconnect.
   */
  get reactive() {
    if (!this._reactive) {
      const e = this.constructor.wippyConfig, t = !!e.contentTemplate;
      let n, r;
      if (this._lastProps !== null)
        n = this._lastProps, r = this._lastErrors;
      else {
        const i = ht(this, e.propsSchema);
        e.validateProps && i.errors.push(...e.validateProps(i.props)), n = i.props, r = i.errors, this._lastProps = n, this._lastErrors = r;
      }
      const o = t ? this._lastContent ?? this._extractContent(e.contentTemplate) : null;
      t && this._lastContent === null && (this._lastContent = o), this._reactive = new Wr(
        { props: n, errors: r, content: o, hasContent: t, hostVisibility: this._hostVisible },
        this.emitEvent.bind(this)
      );
    }
    return this._reactive;
  }
  // ── Lifecycle ──────────────────────────────────────────────
  connectedCallback() {
    this._internals.states.add("loading");
    try {
      const e = this.constructor.wippyConfig, t = this._initialized, n = this.shadowRoot ?? this.attachShadow({ mode: e.shadowMode ?? "open" });
      let r;
      if (t)
        r = this._container;
      else {
        this.onInit(n), e.inlineCss && Dr(n, e.inlineCss);
        try {
          const u = It?.theming, c = Rr(
            u?.global?.cssVariables,
            u?.children?.cssVariables
          );
          Mr(n, c);
        } catch {
        }
        if (e.customCss !== !1)
          try {
            const u = It?.theming, c = [u?.global?.customCSS, u?.children?.customCSS].filter(Boolean).join(`
`);
            c && Br(n, c);
          } catch {
          }
        (e.hostCssKeys === void 0 || e.hostCssKeys.length > 0) && zr(n, e.hostCssKeys), r = document.createElement("div"), r.setAttribute("data-wippy-theme-root", "");
        const a = e.containerClasses ?? [];
        a.length > 0 && r.classList.add(...a), n.appendChild(r), this._container = r, Cr(Pr);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = gt("@theme", (a) => this._applyTheme(a)));
      const { props: o, errors: i } = ht(this, e.propsSchema);
      e.validateProps && i.push(...e.validateProps(o));
      const l = o;
      this._lastProps = l, this._lastErrors = i;
      let s = null;
      e.contentTemplate && (s = this._extractContent(e.contentTemplate), this._lastContent = s, this._contentObserver = new MutationObserver(() => {
        const a = this._extractContent(e.contentTemplate);
        this._lastContent = a, this._reactive?.notifyContent(a), this.onContentChanged(a);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(n, r, l, i, s, t), this._internals.states.delete("loading"), this._internals.states.add("ready"), t || (this._initialized = !0), this.onReady(), this.emitEvent("load");
    } catch (e) {
      this.onError(e), this._internals.states.delete("loading"), this._internals.states.add("error"), this.emitEvent("error", {
        message: e instanceof Error ? e.message : String(e),
        error: e
      });
    }
  }
  /**
   * Applies a forced theme mode to this host element AND the shadow container.
   * The container class drives in-shadow selectors (Tailwind `dark:` utilities,
   * `.w-theme-dark &`); the host-element class drives `:host(.w-theme-*)`
   * selectors. On `@theme` broadcasts the resolved `mode` is passed in directly
   * (don't re-read `getThemeMode()` — the proxy's config-vs-emit order isn't a
   * contract); on the initial connect it defaults to the host's current mode.
   * No-op for an older proxy without `getThemeMode` — `applyThemeMode` clamps
   * `undefined` to 'auto'.
   */
  _applyTheme(e = Or.getThemeMode?.()) {
    nt(e, this), this._container && nt(e, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), nt("auto", this), this._container && nt("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(e, t, n) {
    if (t === n)
      return;
    if (e === yt) {
      const s = this._hostVisible, a = Vt(this);
      if (a === s)
        return;
      this._hostVisible = a, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(a, s), this.onHostVisibilityChanged(a, s));
      return;
    }
    const r = this.constructor.wippyConfig, { props: o, errors: i } = ht(this, r.propsSchema);
    r.validateProps && i.push(...r.validateProps(o));
    const l = o;
    this._lastProps = l, this._lastErrors = i, this._reactive?.notifyProps(l, i), this.onPropsChanged(l, i);
  }
  // ── Hooks ──────────────────────────────────────────────────
  /** Called right after shadow DOM is attached, before CSS or container. */
  onInit(e) {
  }
  /** Called after internals state is set to ready, before the `load` event. */
  onReady() {
  }
  /** Called when connectedCallback throws. Default logs to console. */
  onError(e) {
    console.error(`${this.constructor.name} initialization failed:`, e);
  }
  /** Called when observed attributes change. Override to update framework state. */
  onPropsChanged(e, t) {
  }
  /**
   * Called when the host changes logical activity. `null` means unmanaged.
   * This does not imply a DOM remount or a CSS/viewport visibility change.
   */
  onHostVisibilityChanged(e, t) {
  }
  /**
   * Extract text from a child `<template data-type="...">` element.
   * Uses `.content.textContent` since `<template>` stores content in a DocumentFragment.
   */
  _extractContent(e) {
    return this.querySelector(`template[data-type="${e}"]`)?.content.textContent?.trim() ?? null;
  }
  /** Called when child `<template>` content changes. Override to update framework state. */
  onContentChanged(e) {
  }
};
function Kr(e) {
  return e.__wippyHostBus ?? null;
}
function qr(e) {
  return e.dataset.wippyPanelId ?? null;
}
/*!
 * pinia v4.0.3
 * (c) 2026 Eduardo San Martin Morote
 * @license MIT
 */
let On;
const Tn = (e) => On = e, Yr = () => fr() && yn(jn) || On, jn = (
  /* istanbul ignore next */
  Symbol()
);
function Gr() {
  const e = hr(!0), t = e.run(() => D({}));
  let n = [], r = [];
  const o = mr({
    install(i) {
      Tn(o), o._a = i, i.provide(jn, o), i.config.globalProperties.$pinia = o, r.forEach((l) => n.push(l)), r = [];
    },
    use(i) {
      return this._a ? n.push(i) : r.push(i), this;
    },
    _p: n,
    _a: null,
    _e: e,
    _s: /* @__PURE__ */ new Map(),
    state: t
  });
  return o;
}
var Jr = Object.defineProperty, Qr = (e, t, n) => t in e ? Jr(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, Te = (e, t, n) => Qr(e, typeof t != "symbol" ? t + "" : t, n), Zr = /* @__PURE__ */ Symbol("wippy:emit"), Xr = /* @__PURE__ */ Symbol("wippy:props"), eo = /* @__PURE__ */ Symbol("wippy:props_error"), to = /* @__PURE__ */ Symbol("wippy:content"), no = /* @__PURE__ */ Symbol("wippy:panel-id"), ro = /* @__PURE__ */ Symbol("wippy:layout-bus"), oo = /* @__PURE__ */ Symbol("wippy:host"), An = /* @__PURE__ */ Symbol("wippy:host-visibility");
function ao() {
  const e = yn(An);
  if (!e)
    throw new Error("useHostVisibility() must be called inside a WippyVueElement");
  return e;
}
function io(e) {
  const t = ao();
  let n = !1, r = null, o = !1;
  function i() {
    if (r)
      return o = !0, r;
    let l;
    try {
      l = Promise.resolve(e());
    } catch (a) {
      l = Promise.reject(a);
    }
    const s = l.finally(() => {
      if (r === s && (r = null, n && o))
        return o = !1, i();
    });
    return r = s, s;
  }
  return wn(() => (n = !0, i())), xn(() => {
    n = !1, o = !1;
  }), Ee(t, (l, s) => {
    if (n && s === !1 && l === !0)
      return i();
  }), t;
}
var so = class extends Fr {
  constructor() {
    super(...arguments), Te(this, "_vueApp", null), Te(this, "_propsRef", D({})), Te(this, "_errorsRef", D([])), Te(this, "_contentRef", D(null)), Te(this, "_hostVisibilityRef", D(null)), Te(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  onMount(e, t, n, r, o, i) {
    const l = this.constructor.vueConfig;
    this._propsRef.value = n, this._errorsRef.value = r, this._contentRef.value = o ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const u of r)
      this.emitEvent("invalid", { message: u });
    const s = new AbortController();
    this._bridgeAbort = s, this.reactive.props.subscribe((u, c) => {
      this._propsRef.value = u, this._errorsRef.value = [...c];
      for (const d of c)
        this.emitEvent("invalid", { message: d });
    }, { signal: s.signal }), this.reactive.content && this.reactive.content.subscribe((u) => {
      this._contentRef.value = u;
    }, { signal: s.signal }), this.reactive.hostVisibility.subscribe((u) => {
      this._hostVisibilityRef.value = u;
    }, { signal: s.signal });
    const a = (u) => {
      if (s.signal.aborted)
        return;
      const c = Yr(), d = br(u.rootComponent);
      this._vueApp = d;
      const p = Gr();
      if (u.piniaPlugins)
        for (const f of u.piniaPlugins)
          p.use(f);
      if (d.use(p), u.plugins)
        for (const f of u.plugins)
          d.use(f);
      d.provide(Xr, this._propsRef), d.provide(eo, this._errorsRef), d.provide(Zr, this.emitEvent.bind(this)), d.provide(to, this._contentRef), d.provide(An, this._hostVisibilityRef), d.provide(no, qr(this)), d.provide(ro, Kr(this)), d.provide(oo, Cn(this)), u.providers && u.providers(d, this), d.mount(t), c && Tn(c);
    };
    if (l.rootComponent)
      a(l);
    else if (l.lazyConfig) {
      const u = document.createElement("wippy-loading");
      u.setAttribute("no-bg", ""), t.appendChild(u), l.lazyConfig().then((c) => {
        s.signal.aborted || (u.remove(), a(c));
      }).catch((c) => {
        if (s.signal.aborted)
          return;
        const d = c instanceof Error ? c.message : String(c), p = document.createElement("wippy-error");
        p.setAttribute("title", "Failed to load"), p.setAttribute("message", d), u.replaceWith(p), this.emitEvent("error", { message: d });
      });
    } else
      throw new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._vueApp && (this._vueApp.unmount(), this._vueApp = null);
  }
}, lo = Object.defineProperty, zt = Object.getOwnPropertySymbols, uo = Object.prototype.hasOwnProperty, co = Object.prototype.propertyIsEnumerable, Dt = (e, t, n) => t in e ? lo(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, po = (e, t) => {
  for (var n in t || (t = {})) uo.call(t, n) && Dt(e, n, t[n]);
  if (zt) for (var n of zt(t)) co.call(t, n) && Dt(e, n, t[n]);
  return e;
};
function Pe(e) {
  return e == null || e === "" || Array.isArray(e) && e.length === 0 || !(e instanceof Date) && typeof e == "object" && Object.keys(e).length === 0;
}
function Ot(e) {
  return typeof e == "function" && "call" in e && "apply" in e;
}
function I(e) {
  return !Pe(e);
}
function de(e, t = !0) {
  return e instanceof Object && e.constructor === Object && (t || Object.keys(e).length !== 0);
}
function En(e = {}, t = {}) {
  let n = po({}, e);
  return Object.keys(t).forEach((r) => {
    let o = r;
    de(t[o]) && o in e && de(e[o]) ? n[o] = En(e[o], t[o]) : n[o] = t[o];
  }), n;
}
function fo(...e) {
  return e.reduce((t, n, r) => r === 0 ? n : En(t, n), {});
}
function G(e, ...t) {
  return Ot(e) ? e(...t) : e;
}
function Y(e, t = !0) {
  return typeof e == "string" && (t || e !== "");
}
function ce(e) {
  return Y(e) ? e.replace(/(-|_)/g, "").toLowerCase() : e;
}
function Tt(e, t = "", n = {}) {
  let r = ce(t).split("."), o = r.shift();
  if (o) {
    if (de(e)) {
      let i = Object.keys(e).find((l) => ce(l) === o) || "";
      return Tt(G(e[i], n), r.join("."), n);
    }
    return;
  }
  return G(e, n);
}
function Ln(e, t = !0) {
  return Array.isArray(e) && (t || e.length !== 0);
}
function ho(e) {
  return I(e) && !isNaN(e);
}
function Se(e, t) {
  if (t) {
    let n = t.test(e);
    return t.lastIndex = 0, n;
  }
  return !1;
}
function mo(...e) {
  return fo(...e);
}
function De(e) {
  return e && e.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function bo(e) {
  return Y(e, !1) ? e[0].toUpperCase() + e.slice(1) : e;
}
function Nn(e) {
  return Y(e) ? e.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : e;
}
function In() {
  let e = /* @__PURE__ */ new Map();
  return { on(t, n) {
    let r = e.get(t);
    return r ? r.push(n) : r = [n], e.set(t, r), this;
  }, off(t, n) {
    let r = e.get(t);
    return r && r.splice(r.indexOf(n) >>> 0, 1), this;
  }, emit(t, n) {
    let r = e.get(t);
    r && r.forEach((o) => {
      o(n);
    });
  }, clear() {
    e.clear();
  } };
}
function Be(...e) {
  if (e) {
    let t = [];
    for (let n = 0; n < e.length; n++) {
      let r = e[n];
      if (!r) continue;
      let o = typeof r;
      if (o === "string" || o === "number") t.push(r);
      else if (o === "object") {
        let i = Array.isArray(r) ? [Be(...r)] : Object.entries(r).map(([l, s]) => s ? l : void 0);
        t = i.length ? t.concat(i.filter((l) => !!l)) : t;
      }
    }
    return t.join(" ").trim();
  }
}
function vo(e, t) {
  return e ? e.classList ? e.classList.contains(t) : new RegExp("(^| )" + t + "( |$)", "gi").test(e.className) : !1;
}
function go(e, t) {
  if (e && t) {
    let n = (r) => {
      vo(e, r) || (e.classList ? e.classList.add(r) : e.className += " " + r);
    };
    [t].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function mt(e, t) {
  if (e && t) {
    let n = (r) => {
      e.classList ? e.classList.remove(r) : e.className = e.className.replace(new RegExp("(^|\\b)" + r.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [t].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function Bt(e) {
  return e ? Math.abs(e.scrollLeft) : 0;
}
function yo(e, t) {
  return e instanceof HTMLElement ? e.offsetWidth : 0;
}
function wo(e) {
  if (e) {
    let t = e.parentNode;
    return t && t instanceof ShadowRoot && t.host && (t = t.host), t;
  }
  return null;
}
function xo(e) {
  return !!(e !== null && typeof e < "u" && e.nodeName && wo(e));
}
function et(e) {
  return typeof Element < "u" ? e instanceof Element : e !== null && typeof e == "object" && e.nodeType === 1 && typeof e.nodeName == "string";
}
function ut(e, t = {}) {
  if (et(e)) {
    let n = (r, o) => {
      var i, l;
      let s = (i = e?.$attrs) != null && i[r] ? [(l = e?.$attrs) == null ? void 0 : l[r]] : [];
      return [o].flat().reduce((a, u) => {
        if (u != null) {
          let c = typeof u;
          if (c === "string" || c === "number") a.push(u);
          else if (c === "object") {
            let d = Array.isArray(u) ? n(r, u) : Object.entries(u).map(([p, f]) => r === "style" && (f || f === 0) ? `${p.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}:${f}` : f ? p : void 0);
            a = d.length ? a.concat(d.filter((p) => !!p)) : a;
          }
        }
        return a;
      }, s);
    };
    Object.entries(t).forEach(([r, o]) => {
      if (o != null) {
        let i = r.match(/^on(.+)/);
        i ? e.addEventListener(i[1].toLowerCase(), o) : r === "p-bind" || r === "pBind" ? ut(e, o) : (o = r === "class" ? [...new Set(n("class", o))].join(" ").trim() : r === "style" ? n("style", o).join(";").trim() : o, (e.$attrs = e.$attrs || {}) && (e.$attrs[r] = o), e.setAttribute(r, o));
      }
    });
  }
}
function ko(e, t = {}, ...n) {
  {
    let r = document.createElement(e);
    return ut(r, t), r.append(...n), r;
  }
}
function _o(e, t) {
  return et(e) ? e.matches(t) ? e : e.querySelector(t) : null;
}
function So(e, t) {
  if (et(e)) {
    let n = e.getAttribute(t);
    return isNaN(n) ? n === "true" || n === "false" ? n === "true" : n : +n;
  }
}
function Ut(e) {
  if (e) {
    let t = e.offsetHeight, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingTop) + parseFloat(n.paddingBottom) + parseFloat(n.borderTopWidth) + parseFloat(n.borderBottomWidth), t;
  }
  return 0;
}
function $o(e) {
  if (e) {
    let t = e.getBoundingClientRect();
    return { top: t.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: t.left + (window.pageXOffset || Bt(document.documentElement) || Bt(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function Po(e, t) {
  return e ? e.offsetHeight : 0;
}
function Ht(e) {
  if (e) {
    let t = e.offsetWidth, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingLeft) + parseFloat(n.paddingRight) + parseFloat(n.borderLeftWidth) + parseFloat(n.borderRightWidth), t;
  }
  return 0;
}
function Rn() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function Co(e, t = "", n) {
  et(e) && n !== null && n !== void 0 && e.setAttribute(t, n);
}
var rt = {};
function Oo(e = "pui_id_") {
  return Object.hasOwn(rt, e) || (rt[e] = 0), rt[e]++, `${e}${rt[e]}`;
}
var To = Object.defineProperty, jo = Object.defineProperties, Ao = Object.getOwnPropertyDescriptors, ct = Object.getOwnPropertySymbols, Vn = Object.prototype.hasOwnProperty, Mn = Object.prototype.propertyIsEnumerable, Wt = (e, t, n) => t in e ? To(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, oe = (e, t) => {
  for (var n in t || (t = {})) Vn.call(t, n) && Wt(e, n, t[n]);
  if (ct) for (var n of ct(t)) Mn.call(t, n) && Wt(e, n, t[n]);
  return e;
}, bt = (e, t) => jo(e, Ao(t)), me = (e, t) => {
  var n = {};
  for (var r in e) Vn.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
  if (e != null && ct) for (var r of ct(e)) t.indexOf(r) < 0 && Mn.call(e, r) && (n[r] = e[r]);
  return n;
}, Eo = In(), H = Eo, Ue = /{([^}]*)}/g, zn = /(\d+\s+[\+\-\*\/]\s+\d+)/g, Dn = /var\([^)]+\)/g;
function Ft(e) {
  return Y(e) ? e.replace(/[A-Z]/g, (t, n) => n === 0 ? t : "." + t.toLowerCase()).toLowerCase() : e;
}
function Lo(e) {
  return de(e) && e.hasOwnProperty("$value") && e.hasOwnProperty("$type") ? e.$value : e;
}
function No(e) {
  return e.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function wt(e = "", t = "") {
  return No(`${Y(e, !1) && Y(t, !1) ? `${e}-` : e}${t}`);
}
function Bn(e = "", t = "") {
  return `--${wt(e, t)}`;
}
function Io(e = "") {
  let t = (e.match(/{/g) || []).length, n = (e.match(/}/g) || []).length;
  return (t + n) % 2 !== 0;
}
function Un(e, t = "", n = "", r = [], o) {
  if (Y(e)) {
    let i = e.trim();
    if (Io(i)) return;
    if (Se(i, Ue)) {
      let l = i.replaceAll(Ue, (s) => {
        let a = s.replace(/{|}/g, "").split(".").filter((u) => !r.some((c) => Se(u, c)));
        return `var(${Bn(n, Nn(a.join("-")))}${I(o) ? `, ${o}` : ""})`;
      });
      return Se(l.replace(Dn, "0"), zn) ? `calc(${l})` : l;
    }
    return i;
  } else if (ho(e)) return e;
}
function Ro(e, t, n) {
  Y(t, !1) && e.push(`${t}:${n};`);
}
function je(e, t) {
  return e ? `${e}{${t}}` : "";
}
function Hn(e, t) {
  if (e.indexOf("dt(") === -1) return e;
  function n(l, s) {
    let a = [], u = 0, c = "", d = null, p = 0;
    for (; u <= l.length; ) {
      let f = l[u];
      if ((f === '"' || f === "'" || f === "`") && l[u - 1] !== "\\" && (d = d === f ? null : f), !d && (f === "(" && p++, f === ")" && p--, (f === "," || u === l.length) && p === 0)) {
        let b = c.trim();
        b.startsWith("dt(") ? a.push(Hn(b, s)) : a.push(r(b)), c = "", u++;
        continue;
      }
      f !== void 0 && (c += f), u++;
    }
    return a;
  }
  function r(l) {
    let s = l[0];
    if ((s === '"' || s === "'" || s === "`") && l[l.length - 1] === s) return l.slice(1, -1);
    let a = Number(l);
    return isNaN(a) ? l : a;
  }
  let o = [], i = [];
  for (let l = 0; l < e.length; l++) if (e[l] === "d" && e.slice(l, l + 3) === "dt(") i.push(l), l += 2;
  else if (e[l] === ")" && i.length > 0) {
    let s = i.pop();
    i.length === 0 && o.push([s, l]);
  }
  if (!o.length) return e;
  for (let l = o.length - 1; l >= 0; l--) {
    let [s, a] = o[l], u = e.slice(s + 3, a), c = n(u, t), d = t(...c);
    e = e.slice(0, s) + d + e.slice(a + 1);
  }
  return e;
}
var $e = (...e) => Vo(E.getTheme(), ...e), Vo = (e = {}, t, n, r) => {
  if (t) {
    let { variable: o, options: i } = E.defaults || {}, { prefix: l, transform: s } = e?.options || i || {}, a = Se(t, Ue) ? t : `{${t}}`;
    return r === "value" || Pe(r) && s === "strict" ? E.getTokenValue(t) : Un(a, void 0, l, [o.excludedKeyRegex], n);
  }
  return "";
};
function ot(e, ...t) {
  if (e instanceof Array) {
    let n = e.reduce((r, o, i) => {
      var l;
      return r + o + ((l = G(t[i], { dt: $e })) != null ? l : "");
    }, "");
    return Hn(n, $e);
  }
  return G(e, { dt: $e });
}
function Mo(e, t = {}) {
  let n = E.defaults.variable, { prefix: r = n.prefix, selector: o = n.selector, excludedKeyRegex: i = n.excludedKeyRegex } = t, l = [], s = [], a = [{ node: e, path: r }];
  for (; a.length; ) {
    let { node: c, path: d } = a.pop();
    for (let p in c) {
      let f = c[p], b = Lo(f), y = Se(p, i) ? wt(d) : wt(d, Nn(p));
      if (de(b)) a.push({ node: b, path: y });
      else {
        let g = Bn(y), x = Un(b, y, r, [i]);
        Ro(s, g, x);
        let C = y;
        r && C.startsWith(r + "-") && (C = C.slice(r.length + 1)), l.push(C.replace(/-/g, "."));
      }
    }
  }
  let u = s.join("");
  return { value: s, tokens: l, declarations: u, css: je(o, u) };
}
var ne = { regex: { rules: { class: { pattern: /^\.([a-zA-Z][\w-]*)$/, resolve(e) {
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
    var r;
    return (r = t.map((o) => o.resolve(n)).find((o) => o.matched)) != null ? r : this.rules.custom.resolve(n);
  });
} }, _toVariables(e, t) {
  return Mo(e, { prefix: t?.prefix });
}, getCommon({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var i, l, s, a, u, c, d;
  let { preset: p, options: f } = t, b, y, g, x, C, A, m;
  if (I(p) && f.transform !== "strict") {
    let { primitive: k, semantic: B, extend: F } = p, U = B || {}, { colorScheme: ae } = U, pe = me(U, ["colorScheme"]), J = F || {}, { colorScheme: fe } = J, ie = me(J, ["colorScheme"]), X = ae || {}, { dark: ee } = X, se = me(X, ["dark"]), Q = fe || {}, { dark: le } = Q, ve = me(Q, ["dark"]), te = I(k) ? this._toVariables({ primitive: k }, f) : {}, Z = I(pe) ? this._toVariables({ semantic: pe }, f) : {}, he = I(se) ? this._toVariables({ light: se }, f) : {}, Ce = I(ee) ? this._toVariables({ dark: ee }, f) : {}, ge = I(ie) ? this._toVariables({ semantic: ie }, f) : {}, tt = I(ve) ? this._toVariables({ light: ve }, f) : {}, h = I(le) ? this._toVariables({ dark: le }, f) : {}, [v, P] = [(i = te.declarations) != null ? i : "", te.tokens], [w, L] = [(l = Z.declarations) != null ? l : "", Z.tokens || []], [ft, er] = [(s = he.declarations) != null ? s : "", he.tokens || []], [tr, nr] = [(a = Ce.declarations) != null ? a : "", Ce.tokens || []], [rr, or] = [(u = ge.declarations) != null ? u : "", ge.tokens || []], [ar, ir] = [(c = tt.declarations) != null ? c : "", tt.tokens || []], [sr, lr] = [(d = h.declarations) != null ? d : "", h.tokens || []];
    b = this.transformCSS(e, v, "light", "variable", f, r, o), y = P;
    let ur = this.transformCSS(e, `${w}${ft}`, "light", "variable", f, r, o), cr = this.transformCSS(e, `${tr}`, "dark", "variable", f, r, o);
    g = `${ur}${cr}`, x = [.../* @__PURE__ */ new Set([...L, ...er, ...nr])];
    let dr = this.transformCSS(e, `${rr}${ar}color-scheme:light`, "light", "variable", f, r, o), pr = this.transformCSS(e, `${sr}color-scheme:dark`, "dark", "variable", f, r, o);
    C = `${dr}${pr}`, A = [.../* @__PURE__ */ new Set([...or, ...ir, ...lr])], m = G(p.css, { dt: $e });
  }
  return { primitive: { css: b, tokens: y }, semantic: { css: g, tokens: x }, global: { css: C, tokens: A }, style: m };
}, getPreset({ name: e = "", preset: t = {}, options: n, params: r, set: o, defaults: i, selector: l }) {
  var s, a, u;
  let c, d, p;
  if (I(t) && n.transform !== "strict") {
    let f = e.replace("-directive", ""), b = t, { colorScheme: y, extend: g, css: x } = b, C = me(b, ["colorScheme", "extend", "css"]), A = g || {}, { colorScheme: m } = A, k = me(A, ["colorScheme"]), B = y || {}, { dark: F } = B, U = me(B, ["dark"]), ae = m || {}, { dark: pe } = ae, J = me(ae, ["dark"]), fe = I(C) ? this._toVariables({ [f]: oe(oe({}, C), k) }, n) : {}, ie = I(U) ? this._toVariables({ [f]: oe(oe({}, U), J) }, n) : {}, X = I(F) ? this._toVariables({ [f]: oe(oe({}, F), pe) }, n) : {}, [ee, se] = [(s = fe.declarations) != null ? s : "", fe.tokens || []], [Q, le] = [(a = ie.declarations) != null ? a : "", ie.tokens || []], [ve, te] = [(u = X.declarations) != null ? u : "", X.tokens || []], Z = this.transformCSS(f, `${ee}${Q}`, "light", "variable", n, o, i, l), he = this.transformCSS(f, ve, "dark", "variable", n, o, i, l);
    c = `${Z}${he}`, d = [.../* @__PURE__ */ new Set([...se, ...le, ...te])], p = G(x, { dt: $e });
  }
  return { css: c, tokens: d, style: p };
}, getPresetC({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var i;
  let { preset: l, options: s } = t, a = (i = l?.components) == null ? void 0 : i[e];
  return this.getPreset({ name: e, preset: a, options: s, params: n, set: r, defaults: o });
}, getPresetD({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var i, l;
  let s = e.replace("-directive", ""), { preset: a, options: u } = t, c = ((i = a?.components) == null ? void 0 : i[s]) || ((l = a?.directives) == null ? void 0 : l[s]);
  return this.getPreset({ name: s, preset: c, options: u, params: n, set: r, defaults: o });
}, applyDarkColorScheme(e) {
  return !(e.darkModeSelector === "none" || e.darkModeSelector === !1);
}, getColorSchemeOption(e, t) {
  var n;
  return this.applyDarkColorScheme(e) ? this.regex.resolve(e.darkModeSelector === !0 ? t.options.darkModeSelector : (n = e.darkModeSelector) != null ? n : t.options.darkModeSelector) : [];
}, getLayerOrder(e, t = {}, n, r) {
  let { cssLayer: o } = t;
  return o ? `@layer ${G(o.order || o.name || "primeui", n)}` : "";
}, getCommonStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: o, defaults: i }) {
  let l = this.getCommon({ name: e, theme: t, params: n, set: o, defaults: i }), s = Object.entries(r).reduce((a, [u, c]) => a.push(`${u}="${c}"`) && a, []).join(" ");
  return Object.entries(l || {}).reduce((a, [u, c]) => {
    if (de(c) && Object.hasOwn(c, "css")) {
      let d = De(c.css), p = `${u}-variables`;
      a.push(`<style type="text/css" data-primevue-style-id="${p}" ${s}>${d}</style>`);
    }
    return a;
  }, []).join("");
}, getStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: o, defaults: i }) {
  var l;
  let s = { name: e, theme: t, params: n, set: o, defaults: i }, a = (l = e.includes("-directive") ? this.getPresetD(s) : this.getPresetC(s)) == null ? void 0 : l.css, u = Object.entries(r).reduce((c, [d, p]) => c.push(`${d}="${p}"`) && c, []).join(" ");
  return a ? `<style type="text/css" data-primevue-style-id="${e}-variables" ${u}>${De(a)}</style>` : "";
}, createTokens(e = {}, t, n = "", r = "", o = {}) {
  let i = function(s, a = {}, u = []) {
    if (u.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: s, path: this.path, paths: a, value: void 0 };
    u.push(this.path), a.name = this.path, a.binding || (a.binding = {});
    let c = this.value;
    if (typeof this.value == "string" && Ue.test(this.value)) {
      let d = this.value.trim().replace(Ue, (p) => {
        var f;
        let b = p.slice(1, -1), y = this.tokens[b];
        if (!y) return console.warn(`Token not found for path: ${b}`), "__UNRESOLVED__";
        let g = y.computed(s, a, u);
        return Array.isArray(g) && g.length === 2 ? `light-dark(${g[0].value},${g[1].value})` : (f = g?.value) != null ? f : "__UNRESOLVED__";
      });
      c = zn.test(d.replace(Dn, "0")) ? `calc(${d})` : d;
    }
    return Pe(a.binding) && delete a.binding, u.pop(), { colorScheme: s, path: this.path, paths: a, value: c.includes("__UNRESOLVED__") ? void 0 : c };
  }, l = (s, a, u) => {
    Object.entries(s).forEach(([c, d]) => {
      let p = Se(c, t.variable.excludedKeyRegex) ? a : a ? `${a}.${Ft(c)}` : Ft(c), f = u ? `${u}.${c}` : c;
      de(d) ? l(d, p, f) : (o[p] || (o[p] = { paths: [], computed: (b, y = {}, g = []) => {
        if (o[p].paths.length === 1) return o[p].paths[0].computed(o[p].paths[0].scheme, y.binding, g);
        if (b && b !== "none") for (let x = 0; x < o[p].paths.length; x++) {
          let C = o[p].paths[x];
          if (C.scheme === b) return C.computed(b, y.binding, g);
        }
        return o[p].paths.map((x) => x.computed(x.scheme, y[x.scheme], g));
      } }), o[p].paths.push({ path: f, value: d, scheme: f.includes("colorScheme.light") ? "light" : f.includes("colorScheme.dark") ? "dark" : "none", computed: i, tokens: o }));
    });
  };
  return l(e, n, r), o;
}, getTokenValue(e, t, n) {
  var r;
  let o = ((s) => s.split(".").filter((a) => !Se(a.toLowerCase(), n.variable.excludedKeyRegex)).join("."))(t), i = t.includes("colorScheme.light") ? "light" : t.includes("colorScheme.dark") ? "dark" : void 0, l = [(r = e[o]) == null ? void 0 : r.computed(i)].flat().filter((s) => s);
  return l.length === 1 ? l[0].value : l.reduce((s = {}, a) => {
    let u = a, { colorScheme: c } = u, d = me(u, ["colorScheme"]);
    return s[c] = d, s;
  }, void 0);
}, getSelectorRule(e, t, n, r) {
  return n === "class" || n === "attr" ? je(I(t) ? `${e}${t},${e} ${t}` : e, r) : je(e, je(t ?? ":root,:host", r));
}, transformCSS(e, t, n, r, o = {}, i, l, s) {
  if (I(t)) {
    let { cssLayer: a } = o;
    if (r !== "style") {
      let u = this.getColorSchemeOption(o, l);
      t = n === "dark" ? u.reduce((c, { type: d, selector: p }) => (I(p) && (c += p.includes("[CSS]") ? p.replace("[CSS]", t) : this.getSelectorRule(p, s, d, t)), c), "") : je(s ?? ":root,:host", t);
    }
    if (a) {
      let u = { name: "primeui" };
      de(a) && (u.name = G(a.name, { name: e, type: r })), I(u.name) && (t = je(`@layer ${u.name}`, t), i?.layerNames(u.name));
    }
    return t;
  }
  return "";
} }, E = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(e = {}) {
  let { theme: t } = e;
  t && (this._theme = bt(oe({}, t), { options: oe(oe({}, this.defaults.options), t.options) }), this._tokens = ne.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
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
  this.update({ theme: e }), H.emit("theme:change", e);
}, getPreset() {
  return this.preset;
}, setPreset(e) {
  this._theme = bt(oe({}, this.theme), { preset: e }), this._tokens = ne.createTokens(e, this.defaults), this.clearLoadedStyleNames(), H.emit("preset:change", e), H.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(e) {
  this._theme = bt(oe({}, this.theme), { options: e }), this.clearLoadedStyleNames(), H.emit("options:change", e), H.emit("theme:change", this.theme);
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
  return ne.getTokenValue(this.tokens, e, this.defaults);
}, getCommon(e = "", t) {
  return ne.getCommon({ name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getComponent(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return ne.getPresetC(n);
}, getDirective(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return ne.getPresetD(n);
}, getCustomPreset(e = "", t, n, r) {
  let o = { name: e, preset: t, options: this.options, selector: n, params: r, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return ne.getPreset(o);
}, getLayerOrderCSS(e = "") {
  return ne.getLayerOrder(e, this.options, { names: this.getLayerNames() }, this.defaults);
}, transformCSS(e = "", t, n = "style", r) {
  return ne.transformCSS(e, t, r, n, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
}, getCommonStyleSheet(e = "", t, n = {}) {
  return ne.getCommonStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getStyleSheet(e, t, n = {}) {
  return ne.getStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, onStyleMounted(e) {
  this._loadingStyles.add(e);
}, onStyleUpdated(e) {
  this._loadingStyles.add(e);
}, onStyleLoaded(e, { name: t }) {
  this._loadingStyles.size && (this._loadingStyles.delete(t), H.emit(`theme:${t}:load`, e), !this._loadingStyles.size && H.emit("theme:load"));
} }, W = {
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
}, zo = `
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
function He(e) {
  "@babel/helpers - typeof";
  return He = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, He(e);
}
function Kt(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function qt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Kt(Object(n), !0).forEach(function(r) {
      Do(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Kt(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Do(e, t, n) {
  return (t = Bo(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Bo(e) {
  var t = Uo(e, "string");
  return He(t) == "symbol" ? t : t + "";
}
function Uo(e, t) {
  if (He(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (He(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function Ho(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  Lt() && Lt().components ? wn(e) : t ? e() : gr(e);
}
var Wo = 0;
function Fo(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = D(!1), r = D(e), o = D(null), i = Rn() ? window.document : void 0, l = t.document, s = l === void 0 ? i : l, a = t.immediate, u = a === void 0 ? !0 : a, c = t.manual, d = c === void 0 ? !1 : c, p = t.name, f = p === void 0 ? "style_".concat(++Wo) : p, b = t.id, y = b === void 0 ? void 0 : b, g = t.media, x = g === void 0 ? void 0 : g, C = t.nonce, A = C === void 0 ? void 0 : C, m = t.first, k = m === void 0 ? !1 : m, B = t.onMounted, F = B === void 0 ? void 0 : B, U = t.onUpdated, ae = U === void 0 ? void 0 : U, pe = t.onLoad, J = pe === void 0 ? void 0 : pe, fe = t.props, ie = fe === void 0 ? {} : fe, X = function() {
  }, ee = function(le) {
    var ve = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (s) {
      var te = qt(qt({}, ie), ve), Z = te.name || f, he = te.id || y, Ce = te.nonce || A;
      o.value = s.querySelector('style[data-primevue-style-id="'.concat(Z, '"]')) || s.getElementById(he) || s.createElement("style"), o.value.isConnected || (r.value = le || e, ut(o.value, {
        type: "text/css",
        id: he,
        media: x,
        nonce: Ce
      }), k ? s.head.prepend(o.value) : s.head.appendChild(o.value), Co(o.value, "data-primevue-style-id", Z), ut(o.value, te), o.value.onload = function(ge) {
        return J?.(ge, {
          name: Z
        });
      }, F?.(Z)), !n.value && (X = Ee(r, function(ge) {
        o.value.textContent = ge, ae?.(Z);
      }, {
        immediate: !0
      }), n.value = !0);
    }
  }, se = function() {
    !s || !n.value || (X(), xo(o.value) && s.head.removeChild(o.value), n.value = !1, o.value = null);
  };
  return u && !d && Ho(ee), {
    id: y,
    name: f,
    el: o,
    css: r,
    unload: se,
    load: ee,
    isLoaded: vr(n)
  };
}
function We(e) {
  "@babel/helpers - typeof";
  return We = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, We(e);
}
var Yt, Gt, Jt, Qt;
function Zt(e, t) {
  return Go(e) || Yo(e, t) || qo(e, t) || Ko();
}
function Ko() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function qo(e, t) {
  if (e) {
    if (typeof e == "string") return Xt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Xt(e, t) : void 0;
  }
}
function Xt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Yo(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, o, i, l, s = [], a = !0, u = !1;
    try {
      if (i = (n = n.call(e)).next, t !== 0) for (; !(a = (r = i.call(n)).done) && (s.push(r.value), s.length !== t); a = !0) ;
    } catch (c) {
      u = !0, o = c;
    } finally {
      try {
        if (!a && n.return != null && (l = n.return(), Object(l) !== l)) return;
      } finally {
        if (u) throw o;
      }
    }
    return s;
  }
}
function Go(e) {
  if (Array.isArray(e)) return e;
}
function en(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function vt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? en(Object(n), !0).forEach(function(r) {
      Jo(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : en(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Jo(e, t, n) {
  return (t = Qo(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Qo(e) {
  var t = Zo(e, "string");
  return We(t) == "symbol" ? t : t + "";
}
function Zo(e, t) {
  if (We(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (We(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function at(e, t) {
  return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var Xo = function(t) {
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
}, ea = {}, ta = {}, R = {
  name: "base",
  css: Xo,
  style: zo,
  classes: ea,
  inlineStyles: ta,
  load: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(i) {
      return i;
    }, o = r(ot(Yt || (Yt = at(["", ""])), t));
    return I(o) ? Fo(De(o), vt({
      name: this.name
    }, n)) : {};
  },
  loadCSS: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    return this.load(this.css, t);
  },
  loadStyle: function() {
    var t = this, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
    return this.load(this.style, n, function() {
      var o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
      return E.transformCSS(n.name || t.name, "".concat(o).concat(ot(Gt || (Gt = at(["", ""])), r)));
    });
  },
  getCommonTheme: function(t) {
    return E.getCommon(this.name, t);
  },
  getComponentTheme: function(t) {
    return E.getComponent(this.name, t);
  },
  getDirectiveTheme: function(t) {
    return E.getDirective(this.name, t);
  },
  getPresetTheme: function(t, n, r) {
    return E.getCustomPreset(this.name, t, n, r);
  },
  getLayerOrderThemeCSS: function() {
    return E.getLayerOrderCSS(this.name);
  },
  getStyleSheet: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.css) {
      var r = G(this.css, {
        dt: $e
      }) || "", o = De(ot(Jt || (Jt = at(["", "", ""])), r, t)), i = Object.entries(n).reduce(function(l, s) {
        var a = Zt(s, 2), u = a[0], c = a[1];
        return l.push("".concat(u, '="').concat(c, '"')) && l;
      }, []).join(" ");
      return I(o) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(i, ">").concat(o, "</style>") : "";
    }
    return "";
  },
  getCommonThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return E.getCommonStyleSheet(this.name, t, n);
  },
  getThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = [E.getStyleSheet(this.name, t, n)];
    if (this.style) {
      var o = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), i = ot(Qt || (Qt = at(["", ""])), G(this.style, {
        dt: $e
      })), l = De(E.transformCSS(o, i)), s = Object.entries(n).reduce(function(a, u) {
        var c = Zt(u, 2), d = c[0], p = c[1];
        return a.push("".concat(d, '="').concat(p, '"')) && a;
      }, []).join(" ");
      I(l) && r.push('<style type="text/css" data-primevue-style-id="'.concat(o, '" ').concat(s, ">").concat(l, "</style>"));
    }
    return r.join("");
  },
  extend: function(t) {
    return vt(vt({}, this), {}, {
      css: void 0,
      style: void 0
    }, t);
  }
}, xe = In();
function Fe(e) {
  "@babel/helpers - typeof";
  return Fe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Fe(e);
}
function tn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function it(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? tn(Object(n), !0).forEach(function(r) {
      na(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : tn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function na(e, t, n) {
  return (t = ra(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ra(e) {
  var t = oa(e, "string");
  return Fe(t) == "symbol" ? t : t + "";
}
function oa(e, t) {
  if (Fe(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Fe(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var aa = {
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
    text: [W.STARTS_WITH, W.CONTAINS, W.NOT_CONTAINS, W.ENDS_WITH, W.EQUALS, W.NOT_EQUALS],
    numeric: [W.EQUALS, W.NOT_EQUALS, W.LESS_THAN, W.LESS_THAN_OR_EQUAL_TO, W.GREATER_THAN, W.GREATER_THAN_OR_EQUAL_TO],
    date: [W.DATE_IS, W.DATE_IS_NOT, W.DATE_BEFORE, W.DATE_AFTER]
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
}, ia = Symbol();
function sa(e, t) {
  var n = {
    config: yr(t)
  };
  return e.config.globalProperties.$primevue = n, e.provide(ia, n), la(), ua(e, n), n;
}
var Le = [];
function la() {
  H.clear(), Le.forEach(function(e) {
    return e?.();
  }), Le = [];
}
function ua(e, t) {
  var n = D(!1), r = function() {
    var u;
    if (((u = t.config) === null || u === void 0 ? void 0 : u.theme) !== "none" && !E.isStyleNameLoaded("common")) {
      var c, d, p = ((c = R.getCommonTheme) === null || c === void 0 ? void 0 : c.call(R)) || {}, f = p.primitive, b = p.semantic, y = p.global, g = p.style, x = {
        nonce: (d = t.config) === null || d === void 0 || (d = d.csp) === null || d === void 0 ? void 0 : d.nonce
      };
      R.load(f?.css, it({
        name: "primitive-variables"
      }, x)), R.load(b?.css, it({
        name: "semantic-variables"
      }, x)), R.load(y?.css, it({
        name: "global-variables"
      }, x)), R.loadStyle(it({
        name: "global-style"
      }, x), g), E.setLoadedStyleName("common");
    }
  };
  H.on("theme:change", function(a) {
    n.value || (e.config.globalProperties.$primevue.config.theme = a, n.value = !0);
  });
  var o = Ee(t.config, function(a, u) {
    xe.emit("config:change", {
      newValue: a,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), i = Ee(function() {
    return t.config.ripple;
  }, function(a, u) {
    xe.emit("config:ripple:change", {
      newValue: a,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), l = Ee(function() {
    return t.config.theme;
  }, function(a, u) {
    n.value || E.setTheme(a), t.config.unstyled || r(), n.value = !1, xe.emit("config:theme:change", {
      newValue: a,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !1
  }), s = Ee(function() {
    return t.config.unstyled;
  }, function(a, u) {
    !a && t.config.theme && r(), xe.emit("config:unstyled:change", {
      newValue: a,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  });
  Le.push(o), Le.push(i), Le.push(l), Le.push(s);
}
var ca = {
  install: function(t, n) {
    var r = mo(aa, n);
    sa(t, r);
  }
}, Wn = {
  data: function() {
    return {
      mounted: !1
    };
  },
  mounted: function() {
    this.mounted = Rn();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function da(e, t, n, r, o, i) {
  return i.inline ? be(e.$slots, "default", {
    key: 0
  }) : o.mounted ? (_(), Ne(kn, {
    key: 1,
    to: n.appendTo
  }, [be(e.$slots, "default")], 8, ["to"])) : z("", !0);
}
Wn.render = da;
var we = {
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
function pa() {
  var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pc", t = wr();
  return "".concat(e).concat(t.replace("v-", "").replaceAll("-", "_"));
}
var nn = R.extend({
  name: "common"
});
function Ke(e) {
  "@babel/helpers - typeof";
  return Ke = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ke(e);
}
function fa(e) {
  return qn(e) || ha(e) || Kn(e) || Fn();
}
function ha(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Ve(e, t) {
  return qn(e) || ma(e, t) || Kn(e, t) || Fn();
}
function Fn() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Kn(e, t) {
  if (e) {
    if (typeof e == "string") return xt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? xt(e, t) : void 0;
  }
}
function xt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function ma(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, o, i, l, s = [], a = !0, u = !1;
    try {
      if (i = (n = n.call(e)).next, t === 0) {
        if (Object(n) !== n) return;
        a = !1;
      } else for (; !(a = (r = i.call(n)).done) && (s.push(r.value), s.length !== t); a = !0) ;
    } catch (c) {
      u = !0, o = c;
    } finally {
      try {
        if (!a && n.return != null && (l = n.return(), Object(l) !== l)) return;
      } finally {
        if (u) throw o;
      }
    }
    return s;
  }
}
function qn(e) {
  if (Array.isArray(e)) return e;
}
function rn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function O(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? rn(Object(n), !0).forEach(function(r) {
      Me(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : rn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Me(e, t, n) {
  return (t = ba(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ba(e) {
  var t = va(e, "string");
  return Ke(t) == "symbol" ? t : t + "";
}
function va(e, t) {
  if (Ke(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Ke(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var jt = {
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
        H.off("theme:change", this._loadCoreStyles), t || (this._loadCoreStyles(), this._themeChangeListener(this._loadCoreStyles));
      }
    },
    dt: {
      immediate: !0,
      handler: function(t, n) {
        var r = this;
        H.off("theme:change", this._themeScopedListener), t ? (this._loadScopedThemeStyles(t), this._themeScopedListener = function() {
          return r._loadScopedThemeStyles(t);
        }, this._themeChangeListener(this._themeScopedListener)) : this._unloadScopedThemeStyles();
      }
    }
  },
  scopedStyleEl: void 0,
  rootEl: void 0,
  uid: void 0,
  $attrSelector: void 0,
  beforeCreate: function() {
    var t, n, r, o, i, l, s, a, u, c, d, p = (t = this.pt) === null || t === void 0 ? void 0 : t._usept, f = p ? (n = this.pt) === null || n === void 0 || (n = n.originalValue) === null || n === void 0 ? void 0 : n[this.$.type.name] : void 0, b = p ? (r = this.pt) === null || r === void 0 || (r = r.value) === null || r === void 0 ? void 0 : r[this.$.type.name] : this.pt;
    (o = b || f) === null || o === void 0 || (o = o.hooks) === null || o === void 0 || (i = o.onBeforeCreate) === null || i === void 0 || i.call(o);
    var y = (l = this.$primevueConfig) === null || l === void 0 || (l = l.pt) === null || l === void 0 ? void 0 : l._usept, g = y ? (s = this.$primevue) === null || s === void 0 || (s = s.config) === null || s === void 0 || (s = s.pt) === null || s === void 0 ? void 0 : s.originalValue : void 0, x = y ? (a = this.$primevue) === null || a === void 0 || (a = a.config) === null || a === void 0 || (a = a.pt) === null || a === void 0 ? void 0 : a.value : (u = this.$primevue) === null || u === void 0 || (u = u.config) === null || u === void 0 ? void 0 : u.pt;
    (c = x || g) === null || c === void 0 || (c = c[this.$.type.name]) === null || c === void 0 || (c = c.hooks) === null || c === void 0 || (d = c.onBeforeCreate) === null || d === void 0 || d.call(c), this.$attrSelector = pa(), this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
  },
  created: function() {
    this._hook("onCreated");
  },
  beforeMount: function() {
    var t;
    this.rootEl = _o(et(this.$el) ? this.$el : (t = this.$el) === null || t === void 0 ? void 0 : t.parentElement, "[".concat(this.$attrSelector, "]")), this.rootEl && (this.rootEl.$pc = O({
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
        var n = this._usePT(this._getPT(this.pt, this.$.type.name), this._getOptionValue, "hooks.".concat(t)), r = this._useDefaultPT(this._getOptionValue, "hooks.".concat(t));
        n?.(), r?.();
      }
    },
    _mergeProps: function(t) {
      for (var n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), o = 1; o < n; o++)
        r[o - 1] = arguments[o];
      return Ot(t) ? t.apply(void 0, r) : q.apply(void 0, r);
    },
    _load: function() {
      we.isStyleNameLoaded("base") || (R.loadCSS(this.$styleOptions), this._loadGlobalStyles(), we.setLoadedStyleName("base")), this._loadThemeStyles();
    },
    _loadStyles: function() {
      this._load(), this._themeChangeListener(this._load);
    },
    _loadCoreStyles: function() {
      var t, n;
      !we.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name && (nn.loadCSS(this.$styleOptions), this.$options.style && this.$style.loadCSS(this.$styleOptions), we.setLoadedStyleName(this.$style.name));
    },
    _loadGlobalStyles: function() {
      var t = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
      I(t) && R.load(t, O({
        name: "global"
      }, this.$styleOptions));
    },
    _loadThemeStyles: function() {
      var t, n;
      if (!(this.isUnstyled || this.$theme === "none")) {
        if (!E.isStyleNameLoaded("common")) {
          var r, o, i = ((r = this.$style) === null || r === void 0 || (o = r.getCommonTheme) === null || o === void 0 ? void 0 : o.call(r)) || {}, l = i.primitive, s = i.semantic, a = i.global, u = i.style;
          R.load(l?.css, O({
            name: "primitive-variables"
          }, this.$styleOptions)), R.load(s?.css, O({
            name: "semantic-variables"
          }, this.$styleOptions)), R.load(a?.css, O({
            name: "global-variables"
          }, this.$styleOptions)), R.loadStyle(O({
            name: "global-style"
          }, this.$styleOptions), u), E.setLoadedStyleName("common");
        }
        if (!E.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name) {
          var c, d, p, f, b = ((c = this.$style) === null || c === void 0 || (d = c.getComponentTheme) === null || d === void 0 ? void 0 : d.call(c)) || {}, y = b.css, g = b.style;
          (p = this.$style) === null || p === void 0 || p.load(y, O({
            name: "".concat(this.$style.name, "-variables")
          }, this.$styleOptions)), (f = this.$style) === null || f === void 0 || f.loadStyle(O({
            name: "".concat(this.$style.name, "-style")
          }, this.$styleOptions), g), E.setLoadedStyleName(this.$style.name);
        }
        if (!E.isStyleNameLoaded("layer-order")) {
          var x, C, A = (x = this.$style) === null || x === void 0 || (C = x.getLayerOrderThemeCSS) === null || C === void 0 ? void 0 : C.call(x);
          R.load(A, O({
            name: "layer-order",
            first: !0
          }, this.$styleOptions)), E.setLoadedStyleName("layer-order");
        }
      }
    },
    _loadScopedThemeStyles: function(t) {
      var n, r, o, i = ((n = this.$style) === null || n === void 0 || (r = n.getPresetTheme) === null || r === void 0 ? void 0 : r.call(n, t, "[".concat(this.$attrSelector, "]"))) || {}, l = i.css, s = (o = this.$style) === null || o === void 0 ? void 0 : o.load(l, O({
        name: "".concat(this.$attrSelector, "-").concat(this.$style.name)
      }, this.$styleOptions));
      this.scopedStyleEl = s.el;
    },
    _unloadScopedThemeStyles: function() {
      var t;
      (t = this.scopedStyleEl) === null || t === void 0 || (t = t.value) === null || t === void 0 || t.remove();
    },
    _themeChangeListener: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
      };
      we.clearLoadedStyleNames(), H.on("theme:change", t);
    },
    _removeThemeListeners: function() {
      H.off("theme:change", this._loadCoreStyles), H.off("theme:change", this._load), H.off("theme:change", this._themeScopedListener);
    },
    _getHostInstance: function(t) {
      return t ? this.$options.hostName ? t.$.type.name === this.$options.hostName ? t : this._getHostInstance(t.$parentInstance) : t.$parentInstance : void 0;
    },
    _getPropValue: function(t) {
      var n;
      return this[t] || ((n = this._getHostInstance(this)) === null || n === void 0 ? void 0 : n[t]);
    },
    _getOptionValue: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return Tt(t, n, r);
    },
    _getPTValue: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, i = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, l = /./g.test(r) && !!o[r.split(".")[0]], s = this._getPropValue("ptOptions") || ((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.ptOptions) || {}, a = s.mergeSections, u = a === void 0 ? !0 : a, c = s.mergeProps, d = c === void 0 ? !1 : c, p = i ? l ? this._useGlobalPT(this._getPTClassValue, r, o) : this._useDefaultPT(this._getPTClassValue, r, o) : void 0, f = l ? void 0 : this._getPTSelf(n, this._getPTClassValue, r, O(O({}, o), {}, {
        global: p || {}
      })), b = this._getPTDatasets(r);
      return u || !u && f ? d ? this._mergeProps(d, p, f, b) : O(O(O({}, p), f), b) : O(O({}, f), b);
    },
    _getPTSelf: function() {
      for (var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), o = 1; o < n; o++)
        r[o - 1] = arguments[o];
      return q(
        this._usePT.apply(this, [this._getPT(t, this.$name)].concat(r)),
        // Exp; <component :pt="{}"
        this._usePT.apply(this, [this.$_attrsPT].concat(r))
        // Exp; <component :pt:[passthrough_key]:[attribute]="{value}" or <component :pt:[passthrough_key]="() =>{value}"
      );
    },
    _getPTDatasets: function() {
      var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", o = "data-pc-", i = r === "root" && I((t = this.pt) === null || t === void 0 ? void 0 : t["data-pc-section"]);
      return r !== "transition" && O(O({}, r === "root" && O(O(Me({}, "".concat(o, "name"), ce(i ? (n = this.pt) === null || n === void 0 ? void 0 : n["data-pc-section"] : this.$.type.name)), i && Me({}, "".concat(o, "extend"), ce(this.$.type.name))), {}, Me({}, "".concat(this.$attrSelector), ""))), {}, Me({}, "".concat(o, "section"), ce(r)));
    },
    _getPTClassValue: function() {
      var t = this._getOptionValue.apply(this, arguments);
      return Y(t) || Ln(t) ? {
        class: t
      } : t;
    },
    _getPT: function(t) {
      var n = this, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 ? arguments[2] : void 0, i = function(s) {
        var a, u = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, c = o ? o(s) : s, d = ce(r), p = ce(n.$name);
        return (a = u ? d !== p ? c?.[d] : void 0 : c?.[d]) !== null && a !== void 0 ? a : c;
      };
      return t != null && t.hasOwnProperty("_usept") ? {
        _usept: t._usept,
        originalValue: i(t.originalValue),
        value: i(t.value)
      } : i(t, !0);
    },
    _usePT: function(t, n, r, o) {
      var i = function(y) {
        return n(y, r, o);
      };
      if (t != null && t.hasOwnProperty("_usept")) {
        var l, s = t._usept || ((l = this.$primevueConfig) === null || l === void 0 ? void 0 : l.ptOptions) || {}, a = s.mergeSections, u = a === void 0 ? !0 : a, c = s.mergeProps, d = c === void 0 ? !1 : c, p = i(t.originalValue), f = i(t.value);
        return p === void 0 && f === void 0 ? void 0 : Y(f) ? f : Y(p) ? p : u || !u && f ? d ? this._mergeProps(d, p, f) : O(O({}, p), f) : f;
      }
      return i(t);
    },
    _useGlobalPT: function(t, n, r) {
      return this._usePT(this.globalPT, t, n, r);
    },
    _useDefaultPT: function(t, n, r) {
      return this._usePT(this.defaultPT, t, n, r);
    },
    ptm: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this._getPTValue(this.pt, t, O(O({}, this.$params), n));
    },
    ptmi: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = q(this.$_attrsWithoutPT, this.ptm(n, r));
      return o?.hasOwnProperty("id") && ((t = o.id) !== null && t !== void 0 || (o.id = this.$id)), o;
    },
    ptmo: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return this._getPTValue(t, n, O({
        instance: this
      }, r), !1);
    },
    cx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this.isUnstyled ? void 0 : this._getOptionValue(this.$style.classes, t, O(O({}, this.$params), n));
    },
    sx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      if (n) {
        var o = this._getOptionValue(this.$style.inlineStyles, t, O(O({}, this.$params), r)), i = this._getOptionValue(nn.inlineStyles, t, O(O({}, this.$params), r));
        return [i, o];
      }
    }
  },
  computed: {
    globalPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(r) {
        return G(r, {
          instance: n
        });
      });
    },
    defaultPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(r) {
        return n._getOptionValue(r, n.$name, O({}, n.$params)) || G(r, O({}, n.$params));
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
      return Object.fromEntries(Object.entries(this.$props).filter(function(r) {
        var o = Ve(r, 1), i = o[0];
        return n?.includes(i);
      }));
    },
    $theme: function() {
      var t;
      return (t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.theme;
    },
    $style: function() {
      return O(O({
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
        var n = Ve(t, 1), r = n[0];
        return r?.startsWith("pt:");
      }).reduce(function(t, n) {
        var r = Ve(n, 2), o = r[0], i = r[1], l = o.split(":"), s = fa(l), a = xt(s).slice(1);
        return a?.reduce(function(u, c, d, p) {
          return !u[c] && (u[c] = d === p.length - 1 ? i : {}), u[c];
        }, t), t;
      }, {});
    },
    $_attrsWithoutPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(t) {
        var n = Ve(t, 1), r = n[0];
        return !(r != null && r.startsWith("pt:"));
      }).reduce(function(t, n) {
        var r = Ve(n, 2), o = r[0], i = r[1];
        return t[o] = i, t;
      }, {});
    }
  }
}, ga = `
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
`, ya = R.extend({
  name: "baseicon",
  css: ga
});
function qe(e) {
  "@babel/helpers - typeof";
  return qe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, qe(e);
}
function on(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function an(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? on(Object(n), !0).forEach(function(r) {
      wa(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : on(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function wa(e, t, n) {
  return (t = xa(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function xa(e) {
  var t = ka(e, "string");
  return qe(t) == "symbol" ? t : t + "";
}
function ka(e, t) {
  if (qe(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (qe(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var _a = {
  name: "BaseIcon",
  extends: jt,
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
  style: ya,
  provide: function() {
    return {
      $pcIcon: this,
      $parentInstance: this
    };
  },
  methods: {
    pti: function() {
      var t = Pe(this.label);
      return an(an({}, !this.isUnstyled && {
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
function Ye(e) {
  "@babel/helpers - typeof";
  return Ye = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ye(e);
}
function sn(e, t) {
  return Ca(e) || Pa(e, t) || $a(e, t) || Sa();
}
function Sa() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function $a(e, t) {
  if (e) {
    if (typeof e == "string") return ln(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? ln(e, t) : void 0;
  }
}
function ln(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Pa(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, o, i, l, s = [], a = !0, u = !1;
    try {
      if (i = (n = n.call(e)).next, t !== 0) for (; !(a = (r = i.call(n)).done) && (s.push(r.value), s.length !== t); a = !0) ;
    } catch (c) {
      u = !0, o = c;
    } finally {
      try {
        if (!a && n.return != null && (l = n.return(), Object(l) !== l)) return;
      } finally {
        if (u) throw o;
      }
    }
    return s;
  }
}
function Ca(e) {
  if (Array.isArray(e)) return e;
}
function un(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function j(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? un(Object(n), !0).forEach(function(r) {
      kt(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : un(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function kt(e, t, n) {
  return (t = Oa(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Oa(e) {
  var t = Ta(e, "string");
  return Ye(t) == "symbol" ? t : t + "";
}
function Ta(e, t) {
  if (Ye(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Ye(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var S = {
  _getMeta: function() {
    return [de(arguments.length <= 0 ? void 0 : arguments[0]) || arguments.length <= 0 ? void 0 : arguments[0], G(de(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getConfig: function(t, n) {
    var r, o, i;
    return (r = (t == null || (o = t.instance) === null || o === void 0 ? void 0 : o.$primevue) || (n == null || (i = n.ctx) === null || i === void 0 || (i = i.appContext) === null || i === void 0 || (i = i.config) === null || i === void 0 || (i = i.globalProperties) === null || i === void 0 ? void 0 : i.$primevue)) === null || r === void 0 ? void 0 : r.config;
  },
  _getOptionValue: Tt,
  _getPTValue: function() {
    var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", l = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, s = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, a = function() {
      var C = S._getOptionValue.apply(S, arguments);
      return Y(C) || Ln(C) ? {
        class: C
      } : C;
    }, u = ((t = r.binding) === null || t === void 0 || (t = t.value) === null || t === void 0 ? void 0 : t.ptOptions) || ((n = r.$primevueConfig) === null || n === void 0 ? void 0 : n.ptOptions) || {}, c = u.mergeSections, d = c === void 0 ? !0 : c, p = u.mergeProps, f = p === void 0 ? !1 : p, b = s ? S._useDefaultPT(r, r.defaultPT(), a, i, l) : void 0, y = S._usePT(r, S._getPT(o, r.$name), a, i, j(j({}, l), {}, {
      global: b || {}
    })), g = S._getPTDatasets(r, i);
    return d || !d && y ? f ? S._mergeProps(r, f, b, y, g) : j(j(j({}, b), y), g) : j(j({}, y), g);
  },
  _getPTDatasets: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = "data-pc-";
    return j(j({}, n === "root" && kt({}, "".concat(r, "name"), ce(t.$name))), {}, kt({}, "".concat(r, "section"), ce(n)));
  },
  _getPT: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 ? arguments[2] : void 0, o = function(l) {
      var s, a = r ? r(l) : l, u = ce(n);
      return (s = a?.[u]) !== null && s !== void 0 ? s : a;
    };
    return t && Object.hasOwn(t, "_usept") ? {
      _usept: t._usept,
      originalValue: o(t.originalValue),
      value: o(t.value)
    } : o(t);
  },
  _usePT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = arguments.length > 2 ? arguments[2] : void 0, o = arguments.length > 3 ? arguments[3] : void 0, i = arguments.length > 4 ? arguments[4] : void 0, l = function(g) {
      return r(g, o, i);
    };
    if (n && Object.hasOwn(n, "_usept")) {
      var s, a = n._usept || ((s = t.$primevueConfig) === null || s === void 0 ? void 0 : s.ptOptions) || {}, u = a.mergeSections, c = u === void 0 ? !0 : u, d = a.mergeProps, p = d === void 0 ? !1 : d, f = l(n.originalValue), b = l(n.value);
      return f === void 0 && b === void 0 ? void 0 : Y(b) ? b : Y(f) ? f : c || !c && b ? p ? S._mergeProps(t, p, f, b) : j(j({}, f), b) : b;
    }
    return l(n);
  },
  _useDefaultPT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 ? arguments[2] : void 0, o = arguments.length > 3 ? arguments[3] : void 0, i = arguments.length > 4 ? arguments[4] : void 0;
    return S._usePT(t, n, r, o, i);
  },
  _loadStyles: function() {
    var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 ? arguments[1] : void 0, o = arguments.length > 2 ? arguments[2] : void 0, i = S._getConfig(r, o), l = {
      nonce: i == null || (t = i.csp) === null || t === void 0 ? void 0 : t.nonce
    };
    S._loadCoreStyles(n, l), S._loadThemeStyles(n, l), S._loadScopedThemeStyles(n, l), S._removeThemeListeners(n), n.$loadStyles = function() {
      return S._loadThemeStyles(n, l);
    }, S._themeChangeListener(n.$loadStyles);
  },
  _loadCoreStyles: function() {
    var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 ? arguments[1] : void 0;
    if (!we.isStyleNameLoaded((t = r.$style) === null || t === void 0 ? void 0 : t.name) && (n = r.$style) !== null && n !== void 0 && n.name) {
      var i;
      R.loadCSS(o), (i = r.$style) === null || i === void 0 || i.loadCSS(o), we.setLoadedStyleName(r.$style.name);
    }
  },
  _loadThemeStyles: function() {
    var t, n, r, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, i = arguments.length > 1 ? arguments[1] : void 0;
    if (!(o != null && o.isUnstyled() || (o == null || (t = o.theme) === null || t === void 0 ? void 0 : t.call(o)) === "none")) {
      if (!E.isStyleNameLoaded("common")) {
        var l, s, a = ((l = o.$style) === null || l === void 0 || (s = l.getCommonTheme) === null || s === void 0 ? void 0 : s.call(l)) || {}, u = a.primitive, c = a.semantic, d = a.global, p = a.style;
        R.load(u?.css, j({
          name: "primitive-variables"
        }, i)), R.load(c?.css, j({
          name: "semantic-variables"
        }, i)), R.load(d?.css, j({
          name: "global-variables"
        }, i)), R.loadStyle(j({
          name: "global-style"
        }, i), p), E.setLoadedStyleName("common");
      }
      if (!E.isStyleNameLoaded((n = o.$style) === null || n === void 0 ? void 0 : n.name) && (r = o.$style) !== null && r !== void 0 && r.name) {
        var f, b, y, g, x = ((f = o.$style) === null || f === void 0 || (b = f.getDirectiveTheme) === null || b === void 0 ? void 0 : b.call(f)) || {}, C = x.css, A = x.style;
        (y = o.$style) === null || y === void 0 || y.load(C, j({
          name: "".concat(o.$style.name, "-variables")
        }, i)), (g = o.$style) === null || g === void 0 || g.loadStyle(j({
          name: "".concat(o.$style.name, "-style")
        }, i), A), E.setLoadedStyleName(o.$style.name);
      }
      if (!E.isStyleNameLoaded("layer-order")) {
        var m, k, B = (m = o.$style) === null || m === void 0 || (k = m.getLayerOrderThemeCSS) === null || k === void 0 ? void 0 : k.call(m);
        R.load(B, j({
          name: "layer-order",
          first: !0
        }, i)), E.setLoadedStyleName("layer-order");
      }
    }
  },
  _loadScopedThemeStyles: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = t.preset();
    if (r && t.$attrSelector) {
      var o, i, l, s = ((o = t.$style) === null || o === void 0 || (i = o.getPresetTheme) === null || i === void 0 ? void 0 : i.call(o, r, "[".concat(t.$attrSelector, "]"))) || {}, a = s.css, u = (l = t.$style) === null || l === void 0 ? void 0 : l.load(a, j({
        name: "".concat(t.$attrSelector, "-").concat(t.$style.name)
      }, n));
      t.scopedStyleEl = u.el;
    }
  },
  _themeChangeListener: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
    };
    we.clearLoadedStyleNames(), H.on("theme:change", t);
  },
  _removeThemeListeners: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    H.off("theme:change", t.$loadStyles), t.$loadStyles = void 0;
  },
  _hook: function(t, n, r, o, i, l) {
    var s, a, u = "on".concat(bo(n)), c = S._getConfig(o, i), d = r?.$instance, p = S._usePT(d, S._getPT(o == null || (s = o.value) === null || s === void 0 ? void 0 : s.pt, t), S._getOptionValue, "hooks.".concat(u)), f = S._useDefaultPT(d, c == null || (a = c.pt) === null || a === void 0 || (a = a.directives) === null || a === void 0 ? void 0 : a[t], S._getOptionValue, "hooks.".concat(u)), b = {
      el: r,
      binding: o,
      vnode: i,
      prevVnode: l
    };
    p?.(d, b), f?.(d, b);
  },
  /* eslint-disable-next-line no-unused-vars */
  _mergeProps: function() {
    for (var t = arguments.length > 1 ? arguments[1] : void 0, n = arguments.length, r = new Array(n > 2 ? n - 2 : 0), o = 2; o < n; o++)
      r[o - 2] = arguments[o];
    return Ot(t) ? t.apply(void 0, r) : q.apply(void 0, r);
  },
  _extend: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = function(s, a, u, c, d) {
      var p, f, b, y;
      a._$instances = a._$instances || {};
      var g = S._getConfig(u, c), x = a._$instances[t] || {}, C = Pe(x) ? j(j({}, n), n?.methods) : {};
      a._$instances[t] = j(j({}, x), {}, {
        /* new instance variables to pass in directive methods */
        $name: t,
        $host: a,
        $binding: u,
        $modifiers: u?.modifiers,
        $value: u?.value,
        $el: x.$el || a || void 0,
        $style: j({
          classes: void 0,
          inlineStyles: void 0,
          load: function() {
          },
          loadCSS: function() {
          },
          loadStyle: function() {
          }
        }, n?.style),
        $primevueConfig: g,
        $attrSelector: (p = a.$pd) === null || p === void 0 || (p = p[t]) === null || p === void 0 ? void 0 : p.attrSelector,
        /* computed instance variables */
        defaultPT: function() {
          return S._getPT(g?.pt, void 0, function(m) {
            var k;
            return m == null || (k = m.directives) === null || k === void 0 ? void 0 : k[t];
          });
        },
        isUnstyled: function() {
          var m, k;
          return ((m = a._$instances[t]) === null || m === void 0 || (m = m.$binding) === null || m === void 0 || (m = m.value) === null || m === void 0 ? void 0 : m.unstyled) !== void 0 ? (k = a._$instances[t]) === null || k === void 0 || (k = k.$binding) === null || k === void 0 || (k = k.value) === null || k === void 0 ? void 0 : k.unstyled : g?.unstyled;
        },
        theme: function() {
          var m;
          return (m = a._$instances[t]) === null || m === void 0 || (m = m.$primevueConfig) === null || m === void 0 ? void 0 : m.theme;
        },
        preset: function() {
          var m;
          return (m = a._$instances[t]) === null || m === void 0 || (m = m.$binding) === null || m === void 0 || (m = m.value) === null || m === void 0 ? void 0 : m.dt;
        },
        /* instance's methods */
        ptm: function() {
          var m, k = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", B = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return S._getPTValue(a._$instances[t], (m = a._$instances[t]) === null || m === void 0 || (m = m.$binding) === null || m === void 0 || (m = m.value) === null || m === void 0 ? void 0 : m.pt, k, j({}, B));
        },
        ptmo: function() {
          var m = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, k = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", B = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return S._getPTValue(a._$instances[t], m, k, B, !1);
        },
        cx: function() {
          var m, k, B = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", F = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return (m = a._$instances[t]) !== null && m !== void 0 && m.isUnstyled() ? void 0 : S._getOptionValue((k = a._$instances[t]) === null || k === void 0 || (k = k.$style) === null || k === void 0 ? void 0 : k.classes, B, j({}, F));
        },
        sx: function() {
          var m, k = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", B = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, F = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return B ? S._getOptionValue((m = a._$instances[t]) === null || m === void 0 || (m = m.$style) === null || m === void 0 ? void 0 : m.inlineStyles, k, j({}, F)) : void 0;
        }
      }, C), a.$instance = a._$instances[t], (f = (b = a.$instance)[s]) === null || f === void 0 || f.call(b, a, u, c, d), a["$".concat(t)] = a.$instance, S._hook(t, s, a, u, c, d), a.$pd || (a.$pd = {}), a.$pd[t] = j(j({}, (y = a.$pd) === null || y === void 0 ? void 0 : y[t]), {}, {
        name: t,
        instance: a._$instances[t]
      });
    }, o = function(s) {
      var a, u, c, d = s._$instances[t], p = d?.watch, f = function(g) {
        var x, C = g.newValue, A = g.oldValue;
        return p == null || (x = p.config) === null || x === void 0 ? void 0 : x.call(d, C, A);
      }, b = function(g) {
        var x, C = g.newValue, A = g.oldValue;
        return p == null || (x = p["config.ripple"]) === null || x === void 0 ? void 0 : x.call(d, C, A);
      };
      d.$watchersCallback = {
        config: f,
        "config.ripple": b
      }, p == null || (a = p.config) === null || a === void 0 || a.call(d, d?.$primevueConfig), xe.on("config:change", f), p == null || (u = p["config.ripple"]) === null || u === void 0 || u.call(d, d == null || (c = d.$primevueConfig) === null || c === void 0 ? void 0 : c.ripple), xe.on("config:ripple:change", b);
    }, i = function(s) {
      var a = s._$instances[t].$watchersCallback;
      a && (xe.off("config:change", a.config), xe.off("config:ripple:change", a["config.ripple"]), s._$instances[t].$watchersCallback = void 0);
    };
    return {
      created: function(s, a, u, c) {
        s.$pd || (s.$pd = {}), s.$pd[t] = {
          name: t,
          attrSelector: Oo("pd")
        }, r("created", s, a, u, c);
      },
      beforeMount: function(s, a, u, c) {
        var d;
        S._loadStyles((d = s.$pd[t]) === null || d === void 0 ? void 0 : d.instance, a, u), r("beforeMount", s, a, u, c), o(s);
      },
      mounted: function(s, a, u, c) {
        var d;
        S._loadStyles((d = s.$pd[t]) === null || d === void 0 ? void 0 : d.instance, a, u), r("mounted", s, a, u, c);
      },
      beforeUpdate: function(s, a, u, c) {
        r("beforeUpdate", s, a, u, c);
      },
      updated: function(s, a, u, c) {
        var d;
        S._loadStyles((d = s.$pd[t]) === null || d === void 0 ? void 0 : d.instance, a, u), r("updated", s, a, u, c);
      },
      beforeUnmount: function(s, a, u, c) {
        var d;
        i(s), S._removeThemeListeners((d = s.$pd[t]) === null || d === void 0 ? void 0 : d.instance), r("beforeUnmount", s, a, u, c);
      },
      unmounted: function(s, a, u, c) {
        var d;
        (d = s.$pd[t]) === null || d === void 0 || (d = d.instance) === null || d === void 0 || (d = d.scopedStyleEl) === null || d === void 0 || (d = d.value) === null || d === void 0 || d.remove(), r("unmounted", s, a, u, c);
      }
    };
  },
  extend: function() {
    var t = S._getMeta.apply(S, arguments), n = sn(t, 2), r = n[0], o = n[1];
    return j({
      extend: function() {
        var l = S._getMeta.apply(S, arguments), s = sn(l, 2), a = s[0], u = s[1];
        return S.extend(a, j(j(j({}, o), o?.methods), u));
      }
    }, S._extend(r, o));
  }
}, ja = `
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
`, Aa = {
  root: "p-ink"
}, Ea = R.extend({
  name: "ripple-directive",
  style: ja,
  classes: Aa
}), La = S.extend({
  style: Ea
});
function Ge(e) {
  "@babel/helpers - typeof";
  return Ge = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ge(e);
}
function Na(e) {
  return Ma(e) || Va(e) || Ra(e) || Ia();
}
function Ia() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ra(e, t) {
  if (e) {
    if (typeof e == "string") return _t(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? _t(e, t) : void 0;
  }
}
function Va(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Ma(e) {
  if (Array.isArray(e)) return _t(e);
}
function _t(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function cn(e, t, n) {
  return (t = za(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function za(e) {
  var t = Da(e, "string");
  return Ge(t) == "symbol" ? t : t + "";
}
function Da(e, t) {
  if (Ge(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Ge(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Ba = La.extend("ripple", {
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
      var n = this.getInk(t);
      n || (n = ko("span", cn(cn({
        role: "presentation",
        "aria-hidden": !0,
        "data-p-ink": !0,
        "data-p-ink-active": !1,
        class: !this.isUnstyled() && this.cx("root"),
        onAnimationEnd: this.onAnimationEnd.bind(this)
      }, this.$attrSelector, ""), "p-bind", this.ptm("root"))), t.appendChild(n), this.$el = n);
    },
    remove: function(t) {
      var n = this.getInk(t);
      n && (this.$host.style.overflow = "", this.$host.style.position = "", this.unbindEvents(t), n.removeEventListener("animationend", this.onAnimationEnd), n.remove());
    },
    onMouseDown: function(t) {
      var n = this, r = t.currentTarget, o = this.getInk(r);
      if (!(!o || getComputedStyle(o, null).display === "none")) {
        if (!this.isUnstyled() && mt(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "false"), !Ut(o) && !Ht(o)) {
          var i = Math.max(yo(r), Po(r));
          o.style.height = i + "px", o.style.width = i + "px";
        }
        var l = $o(r), s = t.pageX - l.left + document.body.scrollTop - Ht(o) / 2, a = t.pageY - l.top + document.body.scrollLeft - Ut(o) / 2;
        o.style.top = a + "px", o.style.left = s + "px", !this.isUnstyled() && go(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "true"), this.timeout = setTimeout(function() {
          o && (!n.isUnstyled() && mt(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "false"));
        }, 401);
      }
    },
    onAnimationEnd: function(t) {
      this.timeout && clearTimeout(this.timeout), !this.isUnstyled() && mt(t.currentTarget, "p-ink-active"), t.currentTarget.setAttribute("data-p-ink-active", "false");
    },
    getInk: function(t) {
      return t && t.children ? Na(t.children).find(function(n) {
        return So(n, "data-pc-name") === "ripple";
      }) : void 0;
    }
  }
});
const Ua = "data-wippy-overlay-layer";
function Yn() {
  return typeof window < "u" && typeof window.document < "u";
}
function Gn() {
  return Yn() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function Ha() {
  return Gn() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const Wa = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let Fa = 0;
const dt = /* @__PURE__ */ new WeakMap();
function dn(e, t) {
  const n = e.style;
  n.setProperty("position", "fixed", "important"), n.setProperty("inset", "auto", "important"), n.setProperty("margin", "0", "important"), n.setProperty("position-anchor", t), n.setProperty("position-area", "bottom span-right"), n.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), n.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), n.setProperty("max-width", "stretch", "important");
}
function Ka(e, t) {
  if (!Wa.test(e.className))
    return;
  const n = e.style.cssText;
  dn(e, t), e.getAttribute("popover") !== "manual" && e.setAttribute("popover", "manual");
  try {
    e.matches(":popover-open") || e.showPopover();
  } catch {
  }
  if (!e.matches(":popover-open")) {
    e.removeAttribute("popover"), e.style.cssText = n;
    return;
  }
  if (!dt.has(e)) {
    const r = new MutationObserver(() => {
      const o = e.style;
      (o.top !== "auto" || o.left !== "auto" || o.margin !== "0px" || o.getPropertyPriority("top") !== "important" || o.getPropertyPriority("left") !== "important" || o.getPropertyPriority("margin") !== "important" || o.getPropertyPriority("min-width") !== "important" || o.maxWidth !== "stretch" || o.getPropertyPriority("max-width") !== "important") && dn(e, t);
    });
    r.observe(e, { attributes: !0, attributeFilter: ["style"] }), dt.set(e, r);
  }
}
function At(e) {
  const t = dt.get(e);
  t && (t.disconnect(), dt.delete(e));
}
function qa(e) {
  const t = e && typeof e.getRootNode == "function" ? e.getRootNode() : null;
  return t instanceof ShadowRoot ? t : null;
}
function St(e) {
  e.style.top = "0px", e.style.left = "0px";
  const t = e.getBoundingClientRect();
  e.style.top = `${-window.scrollY - t.top}px`, e.style.left = `${-window.scrollX - t.left}px`;
}
const pt = /* @__PURE__ */ new Set(), Et = /* @__PURE__ */ new WeakMap();
let pn = !1, $t = !1;
function Ya() {
  $t = !1;
  for (const e of pt) {
    if (!e.isConnected) {
      for (const t of Array.from(e.children))
        t instanceof HTMLElement && At(t);
      pt.delete(e), Et.get(e)?.disconnect();
      continue;
    }
    e.childElementCount > 0 && St(e);
  }
}
function fn() {
  $t || ($t = !0, requestAnimationFrame(Ya));
}
function Ga(e) {
  const t = document.createElement("div");
  t.setAttribute(Ua, "");
  const n = Gn();
  if (t.style.cssText = n ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", n && t.setAttribute("popover", "manual"), e.appendChild(t), n) {
    try {
      t.showPopover();
    } catch {
    }
    t.matches(":popover-open") || (t.removeAttribute("popover"), t.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  St(t);
  const r = new MutationObserver((o) => {
    const i = t.__wippyAnchorName;
    for (const l of o) {
      if (i)
        for (const s of Array.from(l.addedNodes))
          s instanceof HTMLElement && Ka(s, i);
      for (const s of Array.from(l.removedNodes))
        s instanceof HTMLElement && At(s);
    }
    t.isConnected && t.childElementCount > 0 && St(t);
  });
  return r.observe(t, { childList: !0 }), Et.set(t, r), pt.add(t), pn || (pn = !0, window.addEventListener("scroll", fn, { capture: !0, passive: !0 }), window.addEventListener("resize", fn, { passive: !0 })), t;
}
function hn(e) {
  if (!(!e.hostRoot || e.layer) && (e.layer = Ga(e.hostRoot), Ha())) {
    const t = e.$el ? e.$el.parentElement : null;
    t && (e.anchorName = `--wippy-a-${++Fa}`, e.anchorTrigger = t, t.style.setProperty("anchor-name", e.anchorName), e.layer.__wippyAnchorName = e.anchorName);
  }
}
function mn(e) {
  if (e.anchorTrigger && (e.anchorTrigger.style.removeProperty("anchor-name"), e.anchorTrigger = null), e.anchorName = null, e.layer) {
    for (const t of Array.from(e.layer.children))
      t instanceof HTMLElement && At(t);
    pt.delete(e.layer), Et.get(e.layer)?.disconnect(), e.layer.remove(), e.layer = null;
  }
}
let bn = !1;
function Ja() {
  if (bn)
    return;
  bn = !0;
  const e = Wn;
  e.computed = e.computed || {}, e.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, e.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, e.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, e.mounted = function() {
    Yn() && (this.hostRoot = qa(this.$el), this.mounted = !0, this.hostRoot && (this.inline || hn(this), this.$watch("inline", (t) => {
      t ? mn(this) : hn(this);
    })));
  }, e.render = function() {
    return this.inline ? be(this.$slots, "default", { key: 0 }) : this.mounted ? xr(kn, { key: 1, to: this.resolvedTarget || document.body }, [
      be(this.$slots, "default")
    ]) : z("", !0);
  }, e.unmounted = function() {
    mn(this);
  };
}
const Qa = {
  install: (e) => {
    Ja(), e.use(ca, { theme: "none" });
  }
};
var Jn = {
  name: "SpinnerIcon",
  extends: _a
};
function Za(e) {
  return ni(e) || ti(e) || ei(e) || Xa();
}
function Xa() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ei(e, t) {
  if (e) {
    if (typeof e == "string") return Pt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Pt(e, t) : void 0;
  }
}
function ti(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function ni(e) {
  if (Array.isArray(e)) return Pt(e);
}
function Pt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function ri(e, t, n, r, o, i) {
  return _(), T("svg", q({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Za(t[0] || (t[0] = [$("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Jn.render = ri;
var oi = `
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
`, ai = {
  root: function(t) {
    var n = t.props, r = t.instance;
    return ["p-badge p-component", {
      "p-badge-circle": I(n.value) && String(n.value).length === 1,
      "p-badge-dot": Pe(n.value) && !r.$slots.default,
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
}, ii = R.extend({
  name: "badge",
  style: oi,
  classes: ai
}), si = {
  name: "BaseBadge",
  extends: jt,
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
  style: ii,
  provide: function() {
    return {
      $pcBadge: this,
      $parentInstance: this
    };
  }
};
function Je(e) {
  "@babel/helpers - typeof";
  return Je = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Je(e);
}
function vn(e, t, n) {
  return (t = li(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function li(e) {
  var t = ui(e, "string");
  return Je(t) == "symbol" ? t : t + "";
}
function ui(e, t) {
  if (Je(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Je(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Qn = {
  name: "Badge",
  extends: si,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return Be(vn(vn({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, ci = ["data-p"];
function di(e, t, n, r, o, i) {
  return _(), T("span", q({
    class: e.cx("root"),
    "data-p": i.dataP
  }, e.ptmi("root")), [be(e.$slots, "default", {}, function() {
    return [ye(N(e.value), 1)];
  })], 16, ci);
}
Qn.render = di;
var pi = `
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
function Qe(e) {
  "@babel/helpers - typeof";
  return Qe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Qe(e);
}
function ue(e, t, n) {
  return (t = fi(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function fi(e) {
  var t = hi(e, "string");
  return Qe(t) == "symbol" ? t : t + "";
}
function hi(e, t) {
  if (Qe(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Qe(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var mi = {
  root: function(t) {
    var n = t.instance, r = t.props;
    return ["p-button p-component", ue(ue(ue(ue(ue(ue(ue(ue(ue({
      "p-button-icon-only": n.hasIcon && !r.label && !r.badge,
      "p-button-vertical": (r.iconPos === "top" || r.iconPos === "bottom") && r.label,
      "p-button-loading": r.loading,
      "p-button-link": r.link || r.variant === "link"
    }, "p-button-".concat(r.severity), r.severity), "p-button-raised", r.raised), "p-button-rounded", r.rounded), "p-button-text", r.text || r.variant === "text"), "p-button-outlined", r.outlined || r.variant === "outlined"), "p-button-sm", r.size === "small"), "p-button-lg", r.size === "large"), "p-button-plain", r.plain), "p-button-fluid", n.hasFluid)];
  },
  loadingIcon: "p-button-loading-icon",
  icon: function(t) {
    var n = t.props;
    return ["p-button-icon", ue({}, "p-button-icon-".concat(n.iconPos), n.label)];
  },
  label: "p-button-label"
}, bi = R.extend({
  name: "button",
  style: pi,
  classes: mi
}), vi = {
  name: "BaseButton",
  extends: jt,
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
  style: bi,
  provide: function() {
    return {
      $pcButton: this,
      $parentInstance: this
    };
  }
};
function Ze(e) {
  "@babel/helpers - typeof";
  return Ze = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ze(e);
}
function K(e, t, n) {
  return (t = gi(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function gi(e) {
  var t = yi(e, "string");
  return Ze(t) == "symbol" ? t : t + "";
}
function yi(e, t) {
  if (Ze(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Ze(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Xe = {
  name: "Button",
  extends: vi,
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
      return q(this.asAttrs, this.a11yAttrs, this.getPTOptions("root"));
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
      return Pe(this.fluid) ? !!this.$pcFluid : this.fluid;
    },
    dataP: function() {
      return Be(K(K(K(K(K(K(K(K(K(K({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
    },
    dataIconP: function() {
      return Be(K(K({}, this.iconPos, this.iconPos), this.size, this.size));
    },
    dataLabelP: function() {
      return Be(K(K({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
    }
  },
  components: {
    SpinnerIcon: Jn,
    Badge: Qn
  },
  directives: {
    ripple: Ba
  }
}, wi = ["data-p"], xi = ["data-p"];
function ki(e, t, n, r, o, i) {
  var l = Nt("SpinnerIcon"), s = Nt("Badge"), a = kr("ripple");
  return e.asChild ? be(e.$slots, "default", {
    key: 1,
    class: lt(e.cx("root")),
    a11yAttrs: i.a11yAttrs
  }) : _r((_(), Ne(Sr(e.as), q({
    key: 0,
    class: e.cx("root"),
    "data-p": i.dataP
  }, i.attrs), {
    default: _n(function() {
      return [be(e.$slots, "default", {}, function() {
        return [e.loading ? be(e.$slots, "loadingicon", q({
          key: 0,
          class: [e.cx("loadingIcon"), e.cx("icon")]
        }, e.ptm("loadingIcon")), function() {
          return [e.loadingIcon ? (_(), T("span", q({
            key: 0,
            class: [e.cx("loadingIcon"), e.cx("icon"), e.loadingIcon]
          }, e.ptm("loadingIcon")), null, 16)) : (_(), Ne(l, q({
            key: 1,
            class: [e.cx("loadingIcon"), e.cx("icon")],
            spin: ""
          }, e.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : be(e.$slots, "icon", q({
          key: 1,
          class: [e.cx("icon")]
        }, e.ptm("icon")), function() {
          return [e.icon ? (_(), T("span", q({
            key: 0,
            class: [e.cx("icon"), e.icon, e.iconClass],
            "data-p": i.dataIconP
          }, e.ptm("icon")), null, 16, wi)) : z("", !0)];
        }), e.label ? (_(), T("span", q({
          key: 2,
          class: e.cx("label")
        }, e.ptm("label"), {
          "data-p": i.dataLabelP
        }), N(e.label), 17, xi)) : z("", !0), e.badge ? (_(), Ne(s, {
          key: 3,
          value: e.badge,
          class: lt(e.badgeClass),
          severity: e.badgeSeverity,
          unstyled: e.unstyled,
          pt: e.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : z("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[a]]);
}
Xe.render = ki;
const _i = { class: "ap-bar" }, Si = {
  key: 0,
  class: "ap-dirty",
  role: "status"
}, $i = {
  key: 1,
  class: "ks-saved",
  role: "status"
}, Pi = /* @__PURE__ */ Sn({
  __name: "Toolbar",
  props: {
    dirty: { type: Boolean },
    saving: { type: Boolean },
    invalid: { type: Boolean },
    saved: { type: Boolean },
    disabled: { type: Boolean }
  },
  emits: ["discard", "save"],
  setup(e) {
    return (t, n) => (_(), T("header", _i, [
      e.dirty ? (_(), T("span", Si, "Unsaved changes")) : z("", !0),
      e.saved ? (_(), T("span", $i, [...n[2] || (n[2] = [
        $("span", {
          class: "ks-saved-tick",
          "aria-hidden": "true"
        }, "✓", -1),
        ye(" Saved", -1)
      ])])) : z("", !0),
      ze(M(Xe), {
        type: "button",
        label: "Discard",
        severity: "secondary",
        outlined: "",
        disabled: e.disabled || !e.dirty || e.saving,
        onClick: n[0] || (n[0] = (r) => t.$emit("discard"))
      }, null, 8, ["disabled"]),
      ze(M(Xe), {
        type: "button",
        label: e.saving ? "Saving…" : "Save",
        loading: e.saving,
        disabled: e.disabled || !e.dirty || e.saving || e.invalid,
        onClick: n[1] || (n[1] = (r) => t.$emit("save"))
      }, {
        icon: _n(() => [
          e.saving ? z("", !0) : (_(), Ne(M($n), {
            key: 0,
            icon: "tabler:device-floppy",
            "aria-hidden": "true"
          }))
        ]),
        _: 1
      }, 8, ["label", "loading", "disabled"])
    ]));
  }
}), Zn = [
  { title: "Workers", help: "Balance throughput with database and provider capacity.", fields: [
    { key: "worker.count_postgres", title: "Postgres workers", help: "Jobs that can execute together on Postgres. Higher counts use more connections and provider capacity.", unit: "workers", min: 1, max: 256 },
    { key: "worker.count_sqlite", title: "SQLite workers", help: "Jobs that can execute together on SQLite. Its write concurrency keeps this pool small.", unit: "workers", min: 1, max: 2 },
    { key: "worker.awaited_slots", title: "Awaited slots", help: "Extra slots reserved for jobs other jobs wait for, so waiting work can keep moving.", unit: "slots", min: 1, max: 256 }
  ] },
  { title: "Claiming and fairness", help: "Choose how the next available slots pick up work.", fields: [
    { key: "worker.claim_batch", title: "Claim batch", help: "Maximum jobs claimed in one database transaction. Smaller batches keep transactions short.", unit: "jobs", min: 1, max: 256 },
    { key: "fairness.shares", title: "Queue shares", help: "Relative turns for each tier when all tiers have work. Unused turns are available to other tiers.", unit: "shares", min: 0, max: 1e3 }
  ] },
  { title: "Leases and retries", help: "Lease changes apply to new executions. Active executions retain their lease timing.", fields: [
    { key: "lease.timeout", title: "Lease timeout", help: "How long a claimed job stays owned without renewal. Use whole seconds, at least 1s.", unit: "duration · e.g. 45s" },
    { key: "lease.heartbeat", title: "Lease heartbeat", help: "Time between renewals. Must be positive and shorter than the lease timeout.", unit: "duration · e.g. 10s" },
    { key: "retry.max_attempts", title: "Maximum attempts", help: "Attempt limit for newly enqueued one-shot jobs. Existing jobs retain their attempt limit.", unit: "attempts", min: 1, max: 1e6 },
    { key: "retry.retry_after_ms", title: "Initial retry delay", help: "Minimum delay before retrying a failed one-shot job.", unit: "duration · e.g. 1s", durationMilliseconds: !0, min: 1, max: 864e5 },
    { key: "retry.max_delay_ms", title: "Maximum retry delay", help: "Cap on exponential retry delay. A provider’s explicit retry delay may be longer.", unit: "duration · e.g. 15m", durationMilliseconds: !0, min: 1e3, max: 864e5 }
  ] },
  { title: "Execution limits", help: "Keep each execution bounded while allowing enough time for useful work.", fields: [
    { key: "proc.max_execution", title: "Maximum execution time", help: "Default time limit for subsequent executions. A job’s declared execution limit takes precedence.", unit: "duration · e.g. 60m" }
  ] }
], ke = Zn.flatMap((e) => e.fields), _e = ["live", "backfill", "maintenance"], st = (e) => e.charAt(0).toUpperCase() + e.slice(1), re = (e) => e.replaceAll(".", "-"), Ci = (e, t) => JSON.stringify(e) === JSON.stringify(t);
function Ae(e) {
  const t = String(e), n = t.startsWith("-"), r = /^[+-]/.test(t) ? t.slice(1) : t;
  if (/^\d+d$/.test(r)) {
    if (t !== r) return NaN;
    const a = Number(r.slice(0, -1));
    return a <= 36500 ? a * 864e5 : NaN;
  }
  const o = [...r.matchAll(/((?:\d+(?:\.\d*)?|\.\d+))(ns|us|µs|µs|μs|ms|s|m|h)/g)];
  if (!o.length || o.map((a) => a[0]).join("") !== r) return NaN;
  const i = { ns: 1e-6, us: 1e-3, µs: 1e-3, μs: 1e-3, ms: 1, s: 1e3, m: 6e4, h: 36e5 }, l = o.reduce((a, u) => a + Number(u[1]) * i[u[2]], 0), s = Math.round(l);
  return n ? -l : Math.abs(l - s) <= Number.EPSILON * Math.max(1, l) * 2 ? s : l;
}
function Ct(e) {
  for (const [t, n] of [["d", 864e5], ["h", 36e5], ["m", 6e4], ["s", 1e3]])
    if (e >= n && e % n === 0) return `${e / n}${t}`;
  return e >= 1e3 ? `${e / 1e3}s` : `${e}ms`;
}
function Oi(e, t) {
  return e.durationMilliseconds ? Ct(Number(t)) : t;
}
function gn(e, t) {
  return e.durationMilliseconds ? Ae(t) : t;
}
function Xn(e) {
  return e.durationMilliseconds ? `${Ct(e.min)}–${Ct(e.max)}` : e.min === void 0 ? "Positive duration" : `${e.min}–${e.max} ${e.unit}${e.key === "fairness.shares" ? " per tier; total above zero" : ""}`;
}
function Ti(e) {
  const t = {};
  for (const r of ke) {
    const o = e[r.key];
    if (r.key === "fairness.shares")
      (_e.some((i) => !Number.isInteger(o?.[i]) || o[i] < 0 || o[i] > 1e3) || _e.reduce((i, l) => i + (o?.[l] || 0), 0) === 0) && (t[r.key] = "Use whole shares from 0–1000; at least one tier needs a share.");
    else if (r.durationMilliseconds) {
      const i = Ae(o);
      (!Number.isInteger(i) || i < r.min || i > r.max) && (t[r.key] = `Enter a duration from ${Xn(r)}, in whole milliseconds.`);
    } else r.min !== void 0 ? (!Number.isInteger(o) || o < r.min || o > r.max) && (t[r.key] = `Use a whole number from ${r.min}–${r.max}.`) : (!Number.isFinite(Ae(o)) || Ae(o) < 1) && (t[r.key] = "Enter a positive duration, such as 10s or 5m.");
  }
  const n = Ae(e["lease.timeout"]);
  return (n < 1e3 || n % 1e3 !== 0) && (t["lease.timeout"] = "Use whole seconds, at least 1s."), Ae(e["lease.heartbeat"]) >= n && (t["lease.heartbeat"] = "Heartbeat must be shorter than the lease timeout."), t;
}
const ji = { class: "ap perf" }, Ai = { class: "ap-body" }, Ei = {
  key: 0,
  class: "ap-hint",
  role: "status"
}, Li = {
  key: 1,
  class: "ap-msg ap-err",
  role: "alert"
}, Ni = {
  key: 2,
  class: "ap-msg ap-err",
  role: "alert"
}, Ii = {
  key: 3,
  class: "ap-msg ap-err",
  role: "alert"
}, Ri = {
  key: 4,
  class: "ap-loading",
  role: "status"
}, Vi = {
  key: 5,
  class: "ap-cards"
}, Mi = {
  class: "ap-card perf-status",
  "aria-label": "Live job pool status"
}, zi = { class: "ap-h" }, Di = {
  key: 0,
  class: "ks-tag kx-tag-caps"
}, Bi = { class: "perf-status-grid" }, Ui = { class: "perf-capacity" }, Hi = { class: "perf-stat-values" }, Wi = { class: "perf-stat-title" }, Fi = { class: "perf-stat-values" }, Ki = { class: "ap-hint perf-capacity-summary" }, qi = { key: 0 }, Yi = { class: "ap-h" }, Gi = { class: "ap-sub" }, Ji = ["data-policy-key"], Qi = { class: "perf-description" }, Zi = { class: "perf-field-title" }, Xi = ["id"], es = ["for"], ts = ["data-source"], ns = ["id"], rs = ["id"], os = {
  key: 0,
  class: "ap-hint perf-unused-note"
}, as = {
  key: 2,
  class: "ap-hint"
}, is = ["aria-labelledby", "aria-describedby"], ss = ["aria-label"], ls = { class: "perf-share-inputs" }, us = ["for"], cs = ["id", "aria-label", "value", "disabled", "aria-invalid", "aria-describedby", "onInput"], ds = ["id"], ps = {
  key: 1,
  class: "perf-value"
}, fs = { class: "perf-input-unit" }, hs = ["id", "type", "min", "max", "value", "disabled", "aria-invalid", "aria-describedby", "onInput"], ms = ["id"], bs = /* @__PURE__ */ Sn({
  __name: "App",
  setup(e) {
    const t = D({}), n = D({}), r = D(/* @__PURE__ */ new Set()), o = D(null), i = D(!0), l = D(!1), s = D(""), a = D(""), u = D(!1), c = D(!1), d = D(-1), p = Oe(() => u.value && (o.value?.applied_revision ?? -1) < d.value);
    let f = null, b = !1, y = 0, g = !1;
    const x = (h) => h === void 0 ? h : JSON.parse(JSON.stringify(h)), C = (h) => ke.find((v) => v.key === h), A = (h, v) => x(Oi(C(h), v)), m = (h) => u.value && (r.value.has(h) || !Ci(gn(C(h), n.value[h]), t.value[h]?.value)), k = (h) => !!o.value?.database && h.startsWith("worker.count_") && h !== `worker.count_${o.value.database}`, B = Oe(() => Zn.map((h) => {
      if (h.title !== "Workers") return h;
      const v = h.fields.filter((P) => P.key.startsWith("worker.count_"));
      return v.sort((P, w) => Number(k(P.key)) - Number(k(w.key))), { ...h, fields: [...v, ...h.fields.filter((P) => !P.key.startsWith("worker.count_"))] };
    })), F = Oe(() => ke.some((h) => m(h.key))), U = Oe(() => i.value ? {} : Ti(n.value)), ae = (h) => r.value.has(h) ? "Reset on save" : { default: "Default", host: "Host", admin: "Admin" }[t.value[h]?.source] || "", pe = Oe(() => _e.reduce((h, v) => h + Math.max(0, Number(n.value["fairness.shares"]?.[v]) || 0), 0)), J = (h) => Math.max(0, Number(n.value["fairness.shares"]?.[h]) || 0) / Math.max(1, pe.value) * 100, fe = Oe(() => _e.map((h) => `${st(h)} ${Math.round(J(h))}%`).join(", "));
    function ie(h) {
      return h?.response?.data;
    }
    function X(h) {
      const v = ie(h), P = v?.error || v?.message || (h instanceof Error ? h.message : String(h));
      return v?.committed ? `Settings are saved; owner notification failed: ${P}` : P;
    }
    function ee(h, v, P) {
      if (!(typeof P == "number" && P < d.value)) {
        typeof P == "number" && (d.value = P);
        for (const w of ke) {
          const L = w.key;
          (!v || !m(L)) && (n.value[L] = A(L, h[L].value)), v && r.value.has(L) && (n.value[L] = A(L, h[L].fallback));
        }
        t.value = h, u.value = !0;
      }
    }
    function se(h) {
      return !!h && ke.every((v) => h[v.key]);
    }
    function Q() {
      return f ? (b = !0, f) : (f = (async () => {
        do {
          b = !1;
          try {
            const h = y, { data: v } = await Rt.get("/api/v1/jobs/policy");
            if (g) return;
            if (y !== h) {
              b = !0;
              continue;
            }
            if (!v?.success || !se(v.fields) || !v.pool) throw new Error(v?.error || "Could not load performance settings.");
            ee(v.fields, !0, v.revision), o.value = v.pool, p.value || (s.value = ""), a.value = "";
          } catch (h) {
            g || (a.value = X(h));
          } finally {
            g || (i.value = !1);
          }
        } while (b && !g);
      })().finally(() => {
        f = null;
      }), f);
    }
    const le = (h) => [re(h) + "-help", re(h) + "-bounds", U.value[h] ? re(h) + "-error" : ""].filter(Boolean).join(" ");
    function ve(h, v) {
      r.value.delete(h.key);
      const P = v.target.value;
      n.value[h.key] = h.min === void 0 || h.durationMilliseconds ? P : P === "" ? null : Number(P), c.value = !1;
    }
    function te(h, v) {
      r.value.delete("fairness.shares");
      const P = v.target.value;
      n.value["fairness.shares"][h] = P === "" ? null : Number(P), c.value = !1;
    }
    function Z(h) {
      n.value[h] = A(h, t.value[h].fallback), r.value.add(h), c.value = !1;
    }
    function he() {
      if (u.value) {
        for (const h of ke) n.value[h.key] = A(h.key, t.value[h.key].value);
        r.value.clear(), c.value = !1;
      }
    }
    async function Ce() {
      if (!u.value || l.value || Object.keys(U.value).length || !F.value) return;
      l.value = !0, s.value = "";
      const h = {};
      for (const v of ke) m(v.key) && !r.value.has(v.key) && (h[v.key] = x(gn(v, n.value[v.key])));
      try {
        const { data: v } = await Rt.put("/api/v1/jobs/policy", { values: h, unset: [...r.value] });
        if (g) return;
        if (!v?.success) throw { response: { data: v } };
        if (!se(v.fields)) throw new Error("The save response has no policy fields.");
        r.value.clear(), y++, ee(v.fields, !1, v.revision), c.value = !0;
      } catch (v) {
        if (!g) {
          const P = ie(v);
          P?.committed && se(P.fields) && (r.value.clear(), y++, ee(P.fields, !1, P.revision)), s.value = X(v), c.value = !1;
        }
      } finally {
        g || (l.value = !1);
      }
    }
    const ge = gt("kickside.jobs.performance.changed", () => {
      Q();
    }), tt = gt("kickside.jobs.policy.changed", () => {
      Q();
    });
    return io(Q), xn(() => {
      g = !0, b = !1, ge(), tt();
    }), (h, v) => (_(), T("div", ji, [
      $("div", Ai, [
        ze(Pi, {
          dirty: F.value,
          saving: l.value,
          disabled: !u.value,
          invalid: !!Object.keys(U.value).length,
          saved: c.value,
          onDiscard: he,
          onSave: Ce
        }, null, 8, ["dirty", "saving", "disabled", "invalid", "saved"]),
        p.value ? (_(), T("p", Ei, "Applying…")) : z("", !0),
        o.value?.apply_error ? (_(), T("div", Li, N(o.value.apply_error.message), 1)) : z("", !0),
        s.value ? (_(), T("div", Ni, N(s.value), 1)) : z("", !0),
        a.value ? (_(), T("div", Ii, [
          ye(N(a.value) + " ", 1),
          ze(M(Xe), {
            label: "Reload",
            text: "",
            onClick: Q
          })
        ])) : z("", !0),
        i.value ? (_(), T("div", Ri, "Loading performance settings…")) : o.value ? (_(), T("div", Vi, [
          $("section", Mi, [
            $("header", zi, [
              ze(M($n), {
                icon: "tabler:activity",
                "aria-hidden": "true"
              }),
              v[0] || (v[0] = ye(" Job pool ", -1)),
              o.value.database ? (_(), T("span", Di, N(o.value.database === "postgres" ? "Postgres" : "SQLite"), 1)) : z("", !0)
            ]),
            v[6] || (v[6] = $("p", { class: "ap-sub" }, "Tune job throughput, queue fairness and execution limits.", -1)),
            $("div", Bi, [
              $("div", Ui, [
                v[3] || (v[3] = $("h3", { class: "perf-stat-title" }, "Slots", -1)),
                $("div", Hi, [
                  $("span", null, [
                    $("strong", null, N(o.value.busy), 1),
                    v[1] || (v[1] = ye(" busy", -1))
                  ]),
                  $("span", null, [
                    $("strong", null, N(o.value.idle), 1),
                    v[2] || (v[2] = ye(" idle", -1))
                  ])
                ])
              ]),
              (_(!0), T(Ie, null, Re(M(_e), (P) => (_(), T("div", {
                key: P,
                class: "perf-tier"
              }, [
                $("h3", Wi, N(M(st)(P)), 1),
                $("dl", Fi, [
                  $("div", null, [
                    v[4] || (v[4] = $("dt", {
                      title: "Includes scheduled pending jobs",
                      "aria-description": "Includes scheduled pending jobs"
                    }, "Queued", -1)),
                    $("dd", null, N(o.value.queued[P] || 0), 1)
                  ]),
                  $("div", null, [
                    v[5] || (v[5] = $("dt", null, "Running", -1)),
                    $("dd", null, N(o.value.running[P] || 0), 1)
                  ])
                ])
              ]))), 128))
            ]),
            $("p", Ki, [
              ye(N(o.value.total) + " total slots · " + N(o.value.awaited) + " reserved for awaited work", 1),
              o.value.applied_revision < 0 ? (_(), T("span", qi, " · Awaiting pool startup")) : z("", !0)
            ])
          ]),
          (_(!0), T(Ie, null, Re(B.value, (P) => (_(), T("section", {
            key: P.title,
            class: "ap-card"
          }, [
            $("h2", Yi, N(P.title), 1),
            $("p", Gi, N(P.help), 1),
            (_(!0), T(Ie, null, Re(P.fields, (w) => (_(), T("div", {
              key: w.key,
              class: lt(["perf-field", { "perf-field-unused": k(w.key) }]),
              "data-policy-key": w.key
            }, [
              $("div", Qi, [
                $("div", Zi, [
                  w.key === "fairness.shares" ? (_(), T("span", {
                    key: 0,
                    id: M(re)(w.key)
                  }, N(w.title), 9, Xi)) : (_(), T("label", {
                    key: 1,
                    for: M(re)(w.key)
                  }, N(w.title), 9, es)),
                  $("span", {
                    class: "ks-tag kx-tag-caps",
                    "data-source": t.value[w.key]?.source
                  }, N(ae(w.key)), 9, ts)
                ]),
                $("p", {
                  id: M(re)(w.key) + "-help",
                  class: "ap-hint"
                }, N(w.help), 9, ns),
                $("p", {
                  id: M(re)(w.key) + "-bounds",
                  class: "perf-bounds"
                }, N(M(Xn)(w)), 9, rs),
                k(w.key) ? (_(), T("p", os, "Not used by this installation.")) : z("", !0),
                t.value[w.key]?.source === "admin" && !r.value.has(w.key) ? (_(), Ne(M(Xe), {
                  key: 1,
                  "aria-label": `Reset ${w.title} to default`,
                  label: "Reset to default",
                  class: "perf-reset",
                  text: "",
                  severity: "secondary",
                  disabled: l.value,
                  onClick: (L) => Z(w.key)
                }, null, 8, ["aria-label", "disabled", "onClick"])) : z("", !0),
                r.value.has(w.key) ? (_(), T("p", as, "Removes the Admin override on save. Host configuration takes precedence over the Default.")) : z("", !0)
              ]),
              w.key === "fairness.shares" ? (_(), T("div", {
                key: 0,
                class: "perf-fairness",
                role: "group",
                "aria-labelledby": M(re)(w.key),
                "aria-describedby": le(w.key)
              }, [
                $("div", {
                  class: "perf-share-bar",
                  role: "img",
                  "aria-label": fe.value
                }, [
                  (_(!0), T(Ie, null, Re(M(_e), (L) => (_(), T("span", {
                    key: L,
                    class: lt(`perf-share-${L}`),
                    style: $r({ width: J(L) + "%" })
                  }, null, 6))), 128))
                ], 8, ss),
                $("div", ls, [
                  (_(!0), T(Ie, null, Re(M(_e), (L) => (_(), T("div", { key: L }, [
                    $("label", {
                      for: `share-${L}`
                    }, [
                      ye(N(M(st)(L)) + " ", 1),
                      $("span", null, N(Math.round(J(L))) + "%", 1)
                    ], 8, us),
                    $("input", {
                      id: `share-${L}`,
                      class: "ks-input kx-focus-halo",
                      type: "number",
                      min: "0",
                      max: "1000",
                      step: "1",
                      "aria-label": `${M(st)(L)} shares`,
                      value: n.value[w.key]?.[L],
                      disabled: l.value,
                      "aria-invalid": !!U.value[w.key],
                      "aria-describedby": le(w.key),
                      onInput: (ft) => te(L, ft)
                    }, null, 40, cs)
                  ]))), 128))
                ]),
                U.value[w.key] ? (_(), T("p", {
                  key: 0,
                  id: M(re)(w.key) + "-error",
                  class: "perf-invalid",
                  role: "alert"
                }, N(U.value[w.key]), 9, ds)) : z("", !0)
              ], 8, is)) : (_(), T("div", ps, [
                $("div", fs, [
                  $("input", {
                    id: M(re)(w.key),
                    class: "ks-input kx-focus-halo",
                    type: w.min === void 0 || w.durationMilliseconds ? "text" : "number",
                    min: w.durationMilliseconds ? void 0 : w.min,
                    max: w.durationMilliseconds ? void 0 : w.max,
                    step: "1",
                    value: n.value[w.key],
                    disabled: l.value,
                    "aria-invalid": !!U.value[w.key],
                    "aria-describedby": le(w.key),
                    onInput: (L) => ve(w, L)
                  }, null, 40, hs),
                  $("span", null, N(w.unit), 1)
                ]),
                U.value[w.key] ? (_(), T("p", {
                  key: 0,
                  id: M(re)(w.key) + "-error",
                  class: "perf-invalid",
                  role: "alert"
                }, N(U.value[w.key]), 9, ms)) : z("", !0)
              ]))
            ], 10, Ji))), 128))
          ]))), 128)),
          v[7] || (v[7] = $("p", { class: "ap-hint" }, "Reducing workers lets active executions finish before their slots retire. Changes apply without a restart.", -1))
        ])) : z("", !0)
      ])
    ]));
  }
}), vs = ':root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}.spin{animation:kx-spin 1s linear infinite}@keyframes kx-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.spin{animation:none}}.kx-tag-sm,.kx-tag-sm.kx-tag-sm{display:inline-flex;align-items:center;gap:4px;padding:1px 7px;border-radius:var(--kx-radius-tag, 6px);font-size:10.5px;font-weight:600;line-height:1.5;white-space:nowrap}.kx-tag-sm svg,.kx-tag-sm.kx-tag-sm svg{width:12px;height:12px}.kx-tag-caps,.kx-tag-caps.kx-tag-caps{display:inline-flex;align-items:center;gap:3px;padding:2px 6px;border-radius:var(--kx-radius-tag, 6px);font-size:9px;font-weight:700;line-height:1.5;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap}.kx-tag-caps svg,.kx-tag-caps.kx-tag-caps svg{width:11px;height:11px}:host,:root{--kx-surface-1: color-mix(in srgb, var(--p-content-background) 96%, var(--p-text-color) 4%);--kx-surface-2: color-mix(in srgb, var(--p-content-background) 92%, var(--p-text-color) 8%);--kx-surface-3: color-mix(in srgb, var(--p-content-background) 86%, var(--p-text-color) 14%);--kx-surface-4: color-mix(in srgb, var(--p-content-background) 78%, var(--p-text-color) 22%);--kx-border-strong: color-mix(in srgb, var(--p-content-border-color) 60%, var(--p-text-color) 40%);--kx-border-stronger: color-mix(in srgb, var(--p-content-border-color) 30%, var(--p-text-color) 70%);--kx-text-faint: color-mix(in srgb, var(--p-text-muted-color) 70%, var(--p-content-background) 30%);--kx-text-fainter: color-mix(in srgb, var(--p-text-muted-color) 45%, var(--p-content-background) 55%);--kx-wash-primary: color-mix(in srgb, var(--p-primary-color) 12%, var(--p-content-background) 88%);--kx-wash-success: color-mix(in srgb, var(--p-success-500) 12%, var(--p-content-background) 88%);--kx-wash-info: color-mix(in srgb, var(--p-info-500) 12%, var(--p-content-background) 88%);--kx-wash-warn: color-mix(in srgb, var(--p-warn-500) 12%, var(--p-content-background) 88%);--kx-wash-danger: color-mix(in srgb, var(--p-danger-500) 12%, var(--p-content-background) 88%);--kx-wash-help: color-mix(in srgb, var(--p-help-500) 12%, var(--p-content-background) 88%);--kx-font-heading: "Outfit", system-ui, sans-serif;--kx-font-body: "Inter", system-ui, sans-serif;--kx-radius-4: 4px;--kx-radius-6: 6px;--kx-radius-8: 8px;--kx-radius-10: 10px;--kx-radius-14: 14px;--kx-radius-16: 16px;--kx-radius-tag: var(--p-content-border-radius, 6px);--kx-control-height: 34px;--kx-control-height-sm: 30px;--kx-rail-width: 264px;--kx-reading-measure: 880px;--kx-row-height: 32px;--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .08);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .12);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .18);--kx-overlay-hover: color-mix(in srgb, var(--p-text-color) 7%, transparent);--kx-overlay-subtle: color-mix(in srgb, var(--p-text-color) 4%, transparent)}@media(prefers-color-scheme:dark){:host(:not(.w-theme-light)),:root:not(.w-theme-light){--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .35);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .45);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .6)}}:host(.w-theme-dark),:root.w-theme-dark{--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .35);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .45);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .6)}.kx-iconbtn{width:28px;height:28px;flex:none;display:grid;place-items:center;cursor:pointer;border:1px solid transparent;border-radius:var(--kx-radius-8);background:transparent;color:var(--p-text-muted-color);transition:color .14s,background .14s,border-color .14s}.kx-iconbtn:hover:not(:disabled){color:var(--p-text-color);background:var(--kx-surface-2)}.kx-iconbtn.on{color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 14%,transparent)}.kx-iconbtn:disabled{opacity:.55;cursor:default}.kx-iconbtn svg{width:16px;height:16px}.kx-iconbtn.lg{width:var(--kx-control-height);height:var(--kx-control-height)}.kx-iconbtn.sm{width:var(--kx-control-height-sm);height:var(--kx-control-height-sm)}.kx-iconbtn.bordered{border-color:var(--p-content-border-color);background:var(--kx-surface-1);color:var(--p-text-muted-color)}.kx-iconbtn.bordered:hover:not(:disabled){border-color:color-mix(in srgb,var(--p-text-color) 18%,transparent)}.kx-iconbtn.danger:hover:not(:disabled),.kx-iconbtn.danger.on{background:color-mix(in srgb,var(--p-danger-500) 12%,transparent);color:var(--p-danger-500)}.kx-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;height:var(--kx-control-height);padding:0 14px;border-radius:var(--kx-radius-8);cursor:pointer;font:inherit;font-size:12.5px;font-weight:600;white-space:nowrap;border:1px solid transparent;transition:filter .15s,transform .15s,background .14s,border-color .14s,color .14s}.kx-btn svg{width:15px;height:15px}.kx-btn:disabled{opacity:.5;cursor:not-allowed}.kx-btn.sm{height:var(--kx-control-height-sm);padding:0 12px}.kx-btn-primary{background:var(--p-primary-color);color:var(--p-button-primary-color);border-color:var(--p-primary-color)}.kx-btn-primary:hover:not(:disabled){background:var(--p-primary-hover-color);color:var(--p-button-primary-hover-color);border-color:var(--p-primary-hover-color);transform:translateY(-1px)}.kx-btn-primary:active:not(:disabled){background:var(--p-primary-active-color);color:var(--p-button-primary-active-color);border-color:var(--p-primary-active-color);transform:translateY(0)}.kx-btn-ghost{background:transparent;color:var(--p-text-color);border-color:var(--p-content-border-color)}.kx-btn-ghost:hover:not(:disabled){background:var(--kx-surface-2);border-color:color-mix(in srgb,var(--p-text-color) 18%,transparent)}.kx-btn-soft{background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color);border-color:color-mix(in srgb,var(--p-primary-color) 30%,transparent)}.kx-btn-soft:hover:not(:disabled){background:color-mix(in srgb,var(--p-primary-color) 18%,transparent)}.kx-btn-danger{background:var(--p-danger-500);color:var(--p-danger-contrast-color);border-color:var(--p-danger-500)}.kx-btn-danger:hover:not(:disabled){filter:brightness(1.07)}.kx-search{position:relative;display:flex;align-items:center}.kx-search-ico{position:absolute;left:10px;width:15px;height:15px;color:var(--p-text-muted-color);pointer-events:none}.kx-search-input{width:100%;height:var(--kx-control-height);padding:0 30px 0 31px;font:inherit;font-size:13px;color:var(--p-text-color);background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);transition:border-color .14s,box-shadow .14s}.kx-search-input::placeholder{color:var(--p-text-muted-color)}.kx-search-input:focus{outline:none;border-color:var(--p-focus-ring-color);box-shadow:var(--p-focus-ring-shadow)}.kx-search-clear{position:absolute;right:6px;width:22px;height:22px;border-radius:var(--kx-radius-8);display:grid;place-items:center;cursor:pointer;background:transparent;border:none;color:var(--p-text-muted-color)}.kx-search-clear:hover{color:var(--p-text-color);background:var(--kx-surface-2)}.kx-search-clear svg{width:14px;height:14px}.kx-chip{font-size:9.5px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;padding:2px 7px;border-radius:var(--kx-radius-6);background:var(--kx-surface-2);color:var(--p-text-muted-color);border:1px solid var(--p-content-border-color)}.kx-count{min-width:18px;height:16px;padding:0 5px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;font-variant-numeric:tabular-nums;background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.kx-focus-halo:focus-visible{border-color:var(--p-focus-ring-color);outline:none;box-shadow:var(--p-focus-ring-shadow)}.kx-focus-outline:focus-visible{outline:var(--p-focus-ring-width) var(--p-focus-ring-style) var(--p-focus-ring-color);outline-offset:var(--p-focus-ring-offset);box-shadow:none}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}:host{display:block;height:100%;min-height:0}:host,:root{font-family:var(--kx-font-body)}:host>div{height:100%;min-height:0}*,*:before,*:after{box-sizing:border-box}h1,h2,h3,h4,h5,h6,.ap-h{font-family:var(--kx-font-heading)}.ks-input{min-width:0;max-width:100%;padding:.5rem .625rem;font:inherit;font-size:.8125rem;color:var(--p-text-color);background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:.5rem}.ks-tag{background:color-mix(in srgb,var(--p-text-color) 10%,transparent);color:var(--p-text-muted-color)}.ks-saved{display:inline-flex;align-items:center;gap:.25rem;font-size:.75rem;font-weight:600;color:var(--p-primary-color);white-space:nowrap}.ks-saved-tick{font-size:.8125rem}.ap{display:flex;flex-direction:column;height:100%;min-height:0;color:var(--p-text-color);background:var(--p-content-background)}.ap-body{min-height:0;flex:1;overflow-y:auto;padding:0 0 28px}.ap-bar{display:flex;align-items:center;justify-content:flex-end;gap:10px;width:100%;padding:12px var(--system-surface-gutter);background:var(--p-content-background);position:sticky;top:0;z-index:3;border-bottom:1px solid var(--p-content-border-color)}.ap-dirty{display:inline-flex;align-items:center;height:34px;font-size:12px;font-weight:600;color:var(--p-warn-600, var(--p-warn-500));background:color-mix(in srgb,var(--p-warn-500) 16%,transparent);padding:0 11px;border-radius:8px;margin-right:auto}.ap-msg{margin:12px var(--system-surface-gutter) 0;padding:9px 12px;border-radius:8px;font-size:13px}.ap-err{background:color-mix(in srgb,var(--p-danger-500) 12%,transparent);color:var(--p-danger-600, var(--p-danger-500))}.ap-loading{display:flex;align-items:center;gap:8px;color:var(--p-text-muted-color);font-size:13px;padding:24px}.ap-cards{display:flex;flex-direction:column;gap:16px;padding:16px var(--system-surface-gutter) 0}.ap-card{background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:14px;padding:16px 18px}.ap-h{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:800;color:var(--p-text-color);letter-spacing:normal;word-spacing:.04em}.ap-h svg{width:17px;height:17px;color:var(--p-text-muted-color)}.ap-sub{font-size:12.5px;color:var(--p-text-muted-color);margin:4px 0 12px}.ap-blabel{display:block;font-size:11.5px;font-weight:700;color:var(--p-text-muted-color);text-transform:uppercase;letter-spacing:.04em;margin:12px 0 6px}.ap-select{width:100%}.ap-hint{font-size:11.5px;color:var(--p-text-muted-color);margin:8px 0 0}.perf{--system-surface-gutter: var(--kickside-system-surface-gutter, 1.5rem);container-type:inline-size}.perf-field{display:grid;grid-template-columns:minmax(0,1fr) minmax(12rem,.65fr);gap:1.5rem;padding-block:1.25rem;border-top:1px solid var(--p-content-border-color)}.perf-field-title{display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;font-weight:600}.perf-bounds{color:var(--p-text-muted-color);font-size:.75rem;margin-top:.5rem}.perf-input-unit{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem}.perf-input-unit input{width:min(100%,12rem);min-width:0}.perf-input-unit>span{color:var(--p-text-muted-color);font-size:.75rem}.perf-reset{margin-top:.25rem}.perf-status-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1.5rem;padding-top:.5rem}.perf-stat-title{margin:0 0 .5rem;font-size:.75rem;font-weight:600;color:var(--p-text-muted-color)}.perf-stat-values{display:flex;flex-wrap:wrap;align-items:baseline;gap:.5rem 1.25rem;margin:0}.perf-stat-values>div{display:flex;flex-direction:column-reverse;gap:.125rem}.perf-stat-values dt{font-size:.6875rem;color:var(--p-text-muted-color)}.perf-stat-values dd,.perf-stat-values strong{margin:0;font-size:1.5rem;font-weight:600;font-variant-numeric:tabular-nums;line-height:1.25;color:var(--p-text-color)}.perf-capacity .perf-stat-values>span{display:flex;flex-direction:column;gap:.125rem;font-size:.6875rem;color:var(--p-text-muted-color)}.perf-capacity-summary{white-space:nowrap}.perf-field-unused .perf-field-title,.perf-field-unused .ks-input{color:var(--p-text-muted-color)}.perf-field-unused .ks-input{background:var(--p-content-hover-background)}.perf-field-unused:focus-within .ks-input{color:var(--p-text-color)}.perf-share-bar{display:flex;gap:2px;height:.75rem;border-radius:var(--kx-radius-8);overflow:hidden;background:var(--p-content-background)}.perf-share-live{background:var(--p-primary-color)}.perf-share-backfill{background:var(--kx-surface-4)}.perf-share-maintenance{background:var(--p-text-muted-color)}.perf-share-inputs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.5rem;margin-top:.75rem}.perf-share-inputs label{display:flex;flex-wrap:wrap;gap:.25rem;font-size:.75rem;margin-bottom:.375rem}.perf-share-inputs label span{color:var(--p-text-muted-color)}.perf-share-inputs input{width:100%;min-width:0}.perf-invalid{color:var(--p-danger-color);font-size:.8125rem;margin-top:.5rem}.perf [data-source=admin]{color:var(--p-primary-color);background:var(--kx-wash-primary)}@container (max-width: 45rem){.perf-field{grid-template-columns:minmax(0,1fr);gap:.75rem}.perf-status-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.perf-capacity-summary{white-space:normal}}@container (max-width: 24rem){.perf-share-inputs{grid-template-columns:minmax(0,1fr)}.perf-share-inputs label{justify-content:space-between}}@container (max-width: 30rem){.perf .ap-bar{flex-wrap:wrap}.perf .ap-dirty{width:100%}.perf .ap-cards{padding-inline:.75rem}}', gs = { props: { type: "object", properties: { config: { type: "object", default: {}, description: "Opaque Settings mount configuration; no fields are required." } } } }, ys = {
  wippy: gs
}, ws = ys.wippy.props;
class xs extends so {
  static get wippyConfig() {
    return {
      propsSchema: ws,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: vs
    };
  }
  static get vueConfig() {
    return { rootComponent: bs, plugins: [Qa] };
  }
}
Ar(import.meta.url, xs);
//# sourceMappingURL=index.js.map
