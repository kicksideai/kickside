import { hasInjectionContext as wr, inject as On, effectScope as _r, ref as R, markRaw as Sr, onMounted as Nt, onUnmounted as $r, watch as Oe, createApp as Cr, readonly as Pr, getCurrentInstance as $t, nextTick as zt, reactive as Tr, renderSlot as Q, openBlock as v, createBlock as D, Teleport as An, createCommentVNode as O, useId as Or, mergeProps as K, h as Ar, defineComponent as Z, createElementBlock as k, createElementVNode as g, createTextVNode as M, toDisplayString as $, resolveComponent as Ut, resolveDirective as Er, withDirectives as ft, resolveDynamicComponent as En, withCtx as z, normalizeClass as ie, computed as q, unref as b, createVNode as A, onBeforeUnmount as jr, Fragment as fe, renderList as ve, vModelCheckbox as Lr, withModifiers as We, vShow as Ht } from "vue";
import { addCollection as Nr, Icon as Y } from "@iconify/vue";
import { config as Wt, addIcons as zr, on as Rr, applyThemeMode as ct, host as jn, hostCss as Vr, loadCss as Ir, loadByTagName as Dr, api as Ee, define as Mr } from "@wippy-fe/proxy";
var Ct = "data-wippy-visible";
function Ft(e) {
  const t = e.getAttribute(Ct);
  return t === "true" ? !0 : t === "false" ? !1 : null;
}
var Br = Object.defineProperty, Ur = (e, t, n) => t in e ? Br(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, W = (e, t, n) => Ur(e, typeof t != "symbol" ? t + "" : t, n), Hr = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], Wr = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function Kt(e) {
  const t = e.startsWith("--") ? e : `--${e}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(t) ? t : null;
}
function Fr(...e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of e)
    if (n)
      for (const [r, o] of Object.entries(n)) {
        if ((r === "@light" || r === "@dark") && o && typeof o == "object") {
          for (const [l, c] of Object.entries(o)) {
            const a = typeof c == "string" ? Kt(l) : null;
            a && t.add(a);
          }
          continue;
        }
        const i = typeof o == "string" ? Kt(r) : null;
        i && t.add(i);
      }
  return [...t].sort();
}
function Kr(e) {
  if (e.length === 0)
    return "";
  const t = e.map((n) => `  ${n}: inherit;`).join(`
`);
  return `${Wr} {
${t}
}`;
}
function qr(e, t) {
  const n = Kr(t);
  n && Ln(e, n, "@wippy-fe/css-variables-bridge");
}
function Yr(e, t) {
  const r = (t ?? Hr).map(async (o) => {
    const i = Vr[o];
    if (!i)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${o}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await Ir(i);
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
function Gr(e, t) {
  const n = document.createElement("style");
  n.textContent = t, e.appendChild(n);
}
function Ln(e, t, n) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const o = new CSSStyleSheet();
    o.replaceSync(t), e.adoptedStyleSheets = [...e.adoptedStyleSheets, o];
    return;
  }
  const r = document.createElement("style");
  r.setAttribute("role", n), r.textContent = t, e.appendChild(r);
}
function Qr(e, t) {
  Ln(e, t, "@wippy-fe/custom-css");
}
function Nn(e) {
  return e.__wippyHost ?? null;
}
function Jr(e) {
  return e.replace(/-([a-z])/g, (t, n) => n.toUpperCase());
}
function Zr(e, t, n) {
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
function xt(e, t) {
  const n = {}, r = [];
  for (const [o, i] of Object.entries(t.properties)) {
    const l = e.getAttribute(o), c = Jr(o);
    if (l === null) {
      i.default !== void 0 && (n[c] = i.default);
      continue;
    }
    const a = Zr(o, l, i);
    a.error ? r.push(a.error) : n[c] = a.value;
  }
  return { props: n, errors: r };
}
var Xr = class {
  constructor(e, t) {
    W(this, "_props"), W(this, "_errors"), W(this, "_content"), W(this, "_hostVisibility"), W(this, "_propsListeners", /* @__PURE__ */ new Set()), W(this, "_contentListeners", /* @__PURE__ */ new Set()), W(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), W(this, "_disposed", !1), W(this, "_emitToDom"), W(this, "props"), W(this, "events"), W(this, "content"), W(this, "hostVisibility"), this._props = e.props, this._errors = e.errors, this._content = e.content, this._hostVisibility = e.hostVisibility, this._emitToDom = t;
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
}, eo = class extends HTMLElement {
  constructor() {
    super(), W(this, "_internals"), W(this, "_contentObserver", null), W(this, "_initialized", !1), W(this, "_container", null), W(this, "_reactive", null), W(this, "_lastProps", null), W(this, "_lastErrors", []), W(this, "_lastContent", null), W(this, "_themeUnsub", null), W(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = Ft(this);
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
    return [.../* @__PURE__ */ new Set([...t, ...n, Ct])];
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
    return Nn(this);
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
        const i = xt(this, e.propsSchema);
        e.validateProps && i.errors.push(...e.validateProps(i.props)), n = i.props, r = i.errors, this._lastProps = n, this._lastErrors = r;
      }
      const o = t ? this._lastContent ?? this._extractContent(e.contentTemplate) : null;
      t && this._lastContent === null && (this._lastContent = o), this._reactive = new Xr(
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
        this.onInit(n), e.inlineCss && Gr(n, e.inlineCss);
        try {
          const d = Wt?.theming, s = Fr(
            d?.global?.cssVariables,
            d?.children?.cssVariables
          );
          qr(n, s);
        } catch {
        }
        if (e.customCss !== !1)
          try {
            const d = Wt?.theming, s = [d?.global?.customCSS, d?.children?.customCSS].filter(Boolean).join(`
`);
            s && Qr(n, s);
          } catch {
          }
        (e.hostCssKeys === void 0 || e.hostCssKeys.length > 0) && Yr(n, e.hostCssKeys), r = document.createElement("div"), r.setAttribute("data-wippy-theme-root", "");
        const a = e.containerClasses ?? [];
        a.length > 0 && r.classList.add(...a), n.appendChild(r), this._container = r, zr(Nr);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = Rr("@theme", (a) => this._applyTheme(a)));
      const { props: o, errors: i } = xt(this, e.propsSchema);
      e.validateProps && i.push(...e.validateProps(o));
      const l = o;
      this._lastProps = l, this._lastErrors = i;
      let c = null;
      e.contentTemplate && (c = this._extractContent(e.contentTemplate), this._lastContent = c, this._contentObserver = new MutationObserver(() => {
        const a = this._extractContent(e.contentTemplate);
        this._lastContent = a, this._reactive?.notifyContent(a), this.onContentChanged(a);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(n, r, l, i, c, t), this._internals.states.delete("loading"), this._internals.states.add("ready"), t || (this._initialized = !0), this.onReady(), this.emitEvent("load");
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
  _applyTheme(e = jn.getThemeMode?.()) {
    ct(e, this), this._container && ct(e, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), ct("auto", this), this._container && ct("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(e, t, n) {
    if (t === n)
      return;
    if (e === Ct) {
      const c = this._hostVisible, a = Ft(this);
      if (a === c)
        return;
      this._hostVisible = a, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(a, c), this.onHostVisibilityChanged(a, c));
      return;
    }
    const r = this.constructor.wippyConfig, { props: o, errors: i } = xt(this, r.propsSchema);
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
function to(e) {
  return e.__wippyHostBus ?? null;
}
function no(e) {
  return e.dataset.wippyPanelId ?? null;
}
/*!
 * pinia v4.0.3
 * (c) 2026 Eduardo San Martin Morote
 * @license MIT
 */
let zn;
const Rn = (e) => zn = e, ro = () => wr() && On(Vn) || zn, Vn = (
  /* istanbul ignore next */
  Symbol()
);
function oo() {
  const e = _r(!0), t = e.run(() => R({}));
  let n = [], r = [];
  const o = Sr({
    install(i) {
      Rn(o), o._a = i, i.provide(Vn, o), i.config.globalProperties.$pinia = o, r.forEach((l) => n.push(l)), r = [];
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
var ao = Object.defineProperty, io = (e, t, n) => t in e ? ao(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, Re = (e, t, n) => io(e, typeof t != "symbol" ? t + "" : t, n), so = /* @__PURE__ */ Symbol("wippy:emit"), lo = /* @__PURE__ */ Symbol("wippy:props"), co = /* @__PURE__ */ Symbol("wippy:props_error"), uo = /* @__PURE__ */ Symbol("wippy:content"), po = /* @__PURE__ */ Symbol("wippy:panel-id"), mo = /* @__PURE__ */ Symbol("wippy:layout-bus"), fo = /* @__PURE__ */ Symbol("wippy:host"), In = /* @__PURE__ */ Symbol("wippy:host-visibility");
function vo() {
  const e = On(In);
  if (!e)
    throw new Error("useHostVisibility() must be called inside a WippyVueElement");
  return e;
}
function go(e) {
  const t = vo();
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
    const c = l.finally(() => {
      if (r === c && (r = null, n && o))
        return o = !1, i();
    });
    return r = c, c;
  }
  return Nt(() => (n = !0, i())), $r(() => {
    n = !1, o = !1;
  }), Oe(t, (l, c) => {
    if (n && c === !1 && l === !0)
      return i();
  }), t;
}
var ho = class extends eo {
  constructor() {
    super(...arguments), Re(this, "_vueApp", null), Re(this, "_propsRef", R({})), Re(this, "_errorsRef", R([])), Re(this, "_contentRef", R(null)), Re(this, "_hostVisibilityRef", R(null)), Re(this, "_bridgeAbort", null);
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
    for (const d of r)
      this.emitEvent("invalid", { message: d });
    const c = new AbortController();
    this._bridgeAbort = c, this.reactive.props.subscribe((d, s) => {
      this._propsRef.value = d, this._errorsRef.value = [...s];
      for (const u of s)
        this.emitEvent("invalid", { message: u });
    }, { signal: c.signal }), this.reactive.content && this.reactive.content.subscribe((d) => {
      this._contentRef.value = d;
    }, { signal: c.signal }), this.reactive.hostVisibility.subscribe((d) => {
      this._hostVisibilityRef.value = d;
    }, { signal: c.signal });
    const a = (d) => {
      if (c.signal.aborted)
        return;
      const s = ro(), u = Cr(d.rootComponent);
      this._vueApp = u;
      const p = oo();
      if (d.piniaPlugins)
        for (const f of d.piniaPlugins)
          p.use(f);
      if (u.use(p), d.plugins)
        for (const f of d.plugins)
          u.use(f);
      u.provide(lo, this._propsRef), u.provide(co, this._errorsRef), u.provide(so, this.emitEvent.bind(this)), u.provide(uo, this._contentRef), u.provide(In, this._hostVisibilityRef), u.provide(po, no(this)), u.provide(mo, to(this)), u.provide(fo, Nn(this)), d.providers && d.providers(u, this), u.mount(t), s && Rn(s);
    };
    if (l.rootComponent)
      a(l);
    else if (l.lazyConfig) {
      const d = document.createElement("wippy-loading");
      d.setAttribute("no-bg", ""), t.appendChild(d), l.lazyConfig().then((s) => {
        c.signal.aborted || (d.remove(), a(s));
      }).catch((s) => {
        if (c.signal.aborted)
          return;
        const u = s instanceof Error ? s.message : String(s), p = document.createElement("wippy-error");
        p.setAttribute("title", "Failed to load"), p.setAttribute("message", u), d.replaceWith(p), this.emitEvent("error", { message: u });
      });
    } else
      throw new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._vueApp && (this._vueApp.unmount(), this._vueApp = null);
  }
}, bo = Object.defineProperty, qt = Object.getOwnPropertySymbols, yo = Object.prototype.hasOwnProperty, xo = Object.prototype.propertyIsEnumerable, Yt = (e, t, n) => t in e ? bo(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, ko = (e, t) => {
  for (var n in t || (t = {})) yo.call(t, n) && Yt(e, n, t[n]);
  if (qt) for (var n of qt(t)) xo.call(t, n) && Yt(e, n, t[n]);
  return e;
};
function ze(e) {
  return e == null || e === "" || Array.isArray(e) && e.length === 0 || !(e instanceof Date) && typeof e == "object" && Object.keys(e).length === 0;
}
function Rt(e) {
  return typeof e == "function" && "call" in e && "apply" in e;
}
function H(e) {
  return !ze(e);
}
function we(e, t = !0) {
  return e instanceof Object && e.constructor === Object && (t || Object.keys(e).length !== 0);
}
function Dn(e = {}, t = {}) {
  let n = ko({}, e);
  return Object.keys(t).forEach((r) => {
    let o = r;
    we(t[o]) && o in e && we(e[o]) ? n[o] = Dn(e[o], t[o]) : n[o] = t[o];
  }), n;
}
function wo(...e) {
  return e.reduce((t, n, r) => r === 0 ? n : Dn(t, n), {});
}
function se(e, ...t) {
  return Rt(e) ? e(...t) : e;
}
function te(e, t = !0) {
  return typeof e == "string" && (t || e !== "");
}
function ke(e) {
  return te(e) ? e.replace(/(-|_)/g, "").toLowerCase() : e;
}
function Vt(e, t = "", n = {}) {
  let r = ke(t).split("."), o = r.shift();
  if (o) {
    if (we(e)) {
      let i = Object.keys(e).find((l) => ke(l) === o) || "";
      return Vt(se(e[i], n), r.join("."), n);
    }
    return;
  }
  return se(e, n);
}
function Mn(e, t = !0) {
  return Array.isArray(e) && (t || e.length !== 0);
}
function _o(e) {
  return H(e) && !isNaN(e);
}
function Le(e, t) {
  if (t) {
    let n = t.test(e);
    return t.lastIndex = 0, n;
  }
  return !1;
}
function So(...e) {
  return wo(...e);
}
function Fe(e) {
  return e && e.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function $o(e) {
  return te(e, !1) ? e[0].toUpperCase() + e.slice(1) : e;
}
function Bn(e) {
  return te(e) ? e.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : e;
}
function Un() {
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
function De(...e) {
  if (e) {
    let t = [];
    for (let n = 0; n < e.length; n++) {
      let r = e[n];
      if (!r) continue;
      let o = typeof r;
      if (o === "string" || o === "number") t.push(r);
      else if (o === "object") {
        let i = Array.isArray(r) ? [De(...r)] : Object.entries(r).map(([l, c]) => c ? l : void 0);
        t = i.length ? t.concat(i.filter((l) => !!l)) : t;
      }
    }
    return t.join(" ").trim();
  }
}
function Co(e, t) {
  return e ? e.classList ? e.classList.contains(t) : new RegExp("(^| )" + t + "( |$)", "gi").test(e.className) : !1;
}
function Po(e, t) {
  if (e && t) {
    let n = (r) => {
      Co(e, r) || (e.classList ? e.classList.add(r) : e.className += " " + r);
    };
    [t].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function kt(e, t) {
  if (e && t) {
    let n = (r) => {
      e.classList ? e.classList.remove(r) : e.className = e.className.replace(new RegExp("(^|\\b)" + r.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [t].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function Gt(e) {
  return e ? Math.abs(e.scrollLeft) : 0;
}
function To(e, t) {
  return e instanceof HTMLElement ? e.offsetWidth : 0;
}
function Oo(e) {
  if (e) {
    let t = e.parentNode;
    return t && t instanceof ShadowRoot && t.host && (t = t.host), t;
  }
  return null;
}
function Ao(e) {
  return !!(e !== null && typeof e < "u" && e.nodeName && Oo(e));
}
function at(e) {
  return typeof Element < "u" ? e instanceof Element : e !== null && typeof e == "object" && e.nodeType === 1 && typeof e.nodeName == "string";
}
function vt(e, t = {}) {
  if (at(e)) {
    let n = (r, o) => {
      var i, l;
      let c = (i = e?.$attrs) != null && i[r] ? [(l = e?.$attrs) == null ? void 0 : l[r]] : [];
      return [o].flat().reduce((a, d) => {
        if (d != null) {
          let s = typeof d;
          if (s === "string" || s === "number") a.push(d);
          else if (s === "object") {
            let u = Array.isArray(d) ? n(r, d) : Object.entries(d).map(([p, f]) => r === "style" && (f || f === 0) ? `${p.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}:${f}` : f ? p : void 0);
            a = u.length ? a.concat(u.filter((p) => !!p)) : a;
          }
        }
        return a;
      }, c);
    };
    Object.entries(t).forEach(([r, o]) => {
      if (o != null) {
        let i = r.match(/^on(.+)/);
        i ? e.addEventListener(i[1].toLowerCase(), o) : r === "p-bind" || r === "pBind" ? vt(e, o) : (o = r === "class" ? [...new Set(n("class", o))].join(" ").trim() : r === "style" ? n("style", o).join(";").trim() : o, (e.$attrs = e.$attrs || {}) && (e.$attrs[r] = o), e.setAttribute(r, o));
      }
    });
  }
}
function Eo(e, t = {}, ...n) {
  {
    let r = document.createElement(e);
    return vt(r, t), r.append(...n), r;
  }
}
function jo(e, t) {
  return at(e) ? e.matches(t) ? e : e.querySelector(t) : null;
}
function Lo(e, t) {
  if (at(e)) {
    let n = e.getAttribute(t);
    return isNaN(n) ? n === "true" || n === "false" ? n === "true" : n : +n;
  }
}
function Qt(e) {
  if (e) {
    let t = e.offsetHeight, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingTop) + parseFloat(n.paddingBottom) + parseFloat(n.borderTopWidth) + parseFloat(n.borderBottomWidth), t;
  }
  return 0;
}
function No(e) {
  if (e) {
    let t = e.getBoundingClientRect();
    return { top: t.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: t.left + (window.pageXOffset || Gt(document.documentElement) || Gt(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function zo(e, t) {
  return e ? e.offsetHeight : 0;
}
function Jt(e) {
  if (e) {
    let t = e.offsetWidth, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingLeft) + parseFloat(n.paddingRight) + parseFloat(n.borderLeftWidth) + parseFloat(n.borderRightWidth), t;
  }
  return 0;
}
function Hn() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function Ro(e, t = "", n) {
  at(e) && n !== null && n !== void 0 && e.setAttribute(t, n);
}
var dt = {};
function Vo(e = "pui_id_") {
  return Object.hasOwn(dt, e) || (dt[e] = 0), dt[e]++, `${e}${dt[e]}`;
}
var Io = Object.defineProperty, Do = Object.defineProperties, Mo = Object.getOwnPropertyDescriptors, gt = Object.getOwnPropertySymbols, Wn = Object.prototype.hasOwnProperty, Fn = Object.prototype.propertyIsEnumerable, Zt = (e, t, n) => t in e ? Io(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, ge = (e, t) => {
  for (var n in t || (t = {})) Wn.call(t, n) && Zt(e, n, t[n]);
  if (gt) for (var n of gt(t)) Fn.call(t, n) && Zt(e, n, t[n]);
  return e;
}, wt = (e, t) => Do(e, Mo(t)), Ce = (e, t) => {
  var n = {};
  for (var r in e) Wn.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
  if (e != null && gt) for (var r of gt(e)) t.indexOf(r) < 0 && Fn.call(e, r) && (n[r] = e[r]);
  return n;
}, Bo = Un(), G = Bo, qe = /{([^}]*)}/g, Kn = /(\d+\s+[\+\-\*\/]\s+\d+)/g, qn = /var\([^)]+\)/g;
function Xt(e) {
  return te(e) ? e.replace(/[A-Z]/g, (t, n) => n === 0 ? t : "." + t.toLowerCase()).toLowerCase() : e;
}
function Uo(e) {
  return we(e) && e.hasOwnProperty("$value") && e.hasOwnProperty("$type") ? e.$value : e;
}
function Ho(e) {
  return e.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function Pt(e = "", t = "") {
  return Ho(`${te(e, !1) && te(t, !1) ? `${e}-` : e}${t}`);
}
function Yn(e = "", t = "") {
  return `--${Pt(e, t)}`;
}
function Wo(e = "") {
  let t = (e.match(/{/g) || []).length, n = (e.match(/}/g) || []).length;
  return (t + n) % 2 !== 0;
}
function Gn(e, t = "", n = "", r = [], o) {
  if (te(e)) {
    let i = e.trim();
    if (Wo(i)) return;
    if (Le(i, qe)) {
      let l = i.replaceAll(qe, (c) => {
        let a = c.replace(/{|}/g, "").split(".").filter((d) => !r.some((s) => Le(d, s)));
        return `var(${Yn(n, Bn(a.join("-")))}${H(o) ? `, ${o}` : ""})`;
      });
      return Le(l.replace(qn, "0"), Kn) ? `calc(${l})` : l;
    }
    return i;
  } else if (_o(e)) return e;
}
function Fo(e, t, n) {
  te(t, !1) && e.push(`${t}:${n};`);
}
function Ve(e, t) {
  return e ? `${e}{${t}}` : "";
}
function Qn(e, t) {
  if (e.indexOf("dt(") === -1) return e;
  function n(l, c) {
    let a = [], d = 0, s = "", u = null, p = 0;
    for (; d <= l.length; ) {
      let f = l[d];
      if ((f === '"' || f === "'" || f === "`") && l[d - 1] !== "\\" && (u = u === f ? null : f), !u && (f === "(" && p++, f === ")" && p--, (f === "," || d === l.length) && p === 0)) {
        let _ = s.trim();
        _.startsWith("dt(") ? a.push(Qn(_, c)) : a.push(r(_)), s = "", d++;
        continue;
      }
      f !== void 0 && (s += f), d++;
    }
    return a;
  }
  function r(l) {
    let c = l[0];
    if ((c === '"' || c === "'" || c === "`") && l[l.length - 1] === c) return l.slice(1, -1);
    let a = Number(l);
    return isNaN(a) ? l : a;
  }
  let o = [], i = [];
  for (let l = 0; l < e.length; l++) if (e[l] === "d" && e.slice(l, l + 3) === "dt(") i.push(l), l += 2;
  else if (e[l] === ")" && i.length > 0) {
    let c = i.pop();
    i.length === 0 && o.push([c, l]);
  }
  if (!o.length) return e;
  for (let l = o.length - 1; l >= 0; l--) {
    let [c, a] = o[l], d = e.slice(c + 3, a), s = n(d, t), u = t(...s);
    e = e.slice(0, c) + u + e.slice(a + 1);
  }
  return e;
}
var Ne = (...e) => Ko(B.getTheme(), ...e), Ko = (e = {}, t, n, r) => {
  if (t) {
    let { variable: o, options: i } = B.defaults || {}, { prefix: l, transform: c } = e?.options || i || {}, a = Le(t, qe) ? t : `{${t}}`;
    return r === "value" || ze(r) && c === "strict" ? B.getTokenValue(t) : Gn(a, void 0, l, [o.excludedKeyRegex], n);
  }
  return "";
};
function ut(e, ...t) {
  if (e instanceof Array) {
    let n = e.reduce((r, o, i) => {
      var l;
      return r + o + ((l = se(t[i], { dt: Ne })) != null ? l : "");
    }, "");
    return Qn(n, Ne);
  }
  return se(e, { dt: Ne });
}
function qo(e, t = {}) {
  let n = B.defaults.variable, { prefix: r = n.prefix, selector: o = n.selector, excludedKeyRegex: i = n.excludedKeyRegex } = t, l = [], c = [], a = [{ node: e, path: r }];
  for (; a.length; ) {
    let { node: s, path: u } = a.pop();
    for (let p in s) {
      let f = s[p], _ = Uo(f), T = Le(p, i) ? Pt(u) : Pt(u, Bn(p));
      if (we(_)) a.push({ node: _, path: T });
      else {
        let S = Yn(T), P = Gn(_, T, r, [i]);
        Fo(c, S, P);
        let C = T;
        r && C.startsWith(r + "-") && (C = C.slice(r.length + 1)), l.push(C.replace(/-/g, "."));
      }
    }
  }
  let d = c.join("");
  return { value: c, tokens: l, declarations: d, css: Ve(o, d) };
}
var me = { regex: { rules: { class: { pattern: /^\.([a-zA-Z][\w-]*)$/, resolve(e) {
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
  return qo(e, { prefix: t?.prefix });
}, getCommon({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var i, l, c, a, d, s, u;
  let { preset: p, options: f } = t, _, T, S, P, C, j, m;
  if (H(p) && f.transform !== "strict") {
    let { primitive: y, semantic: E, extend: I } = p, ne = E || {}, { colorScheme: he } = ne, F = Ce(ne, ["colorScheme"]), ce = I || {}, { colorScheme: _e } = ce, Se = Ce(ce, ["colorScheme"]), be = he || {}, { dark: de } = be, $e = Ce(be, ["dark"]), re = _e || {}, { dark: ye } = re, Pe = Ce(re, ["dark"]), ue = H(y) ? this._toVariables({ primitive: y }, f) : {}, le = H(F) ? this._toVariables({ semantic: F }, f) : {}, pe = H($e) ? this._toVariables({ light: $e }, f) : {}, oe = H(de) ? this._toVariables({ dark: de }, f) : {}, w = H(Se) ? this._toVariables({ semantic: Se }, f) : {}, x = H(Pe) ? this._toVariables({ light: Pe }, f) : {}, h = H(ye) ? this._toVariables({ dark: ye }, f) : {}, [X, st] = [(i = ue.declarations) != null ? i : "", ue.tokens], [lt, sr] = [(l = le.declarations) != null ? l : "", le.tokens || []], [lr, cr] = [(c = pe.declarations) != null ? c : "", pe.tokens || []], [dr, ur] = [(a = oe.declarations) != null ? a : "", oe.tokens || []], [pr, mr] = [(d = w.declarations) != null ? d : "", w.tokens || []], [fr, vr] = [(s = x.declarations) != null ? s : "", x.tokens || []], [gr, hr] = [(u = h.declarations) != null ? u : "", h.tokens || []];
    _ = this.transformCSS(e, X, "light", "variable", f, r, o), T = st;
    let br = this.transformCSS(e, `${lt}${lr}`, "light", "variable", f, r, o), yr = this.transformCSS(e, `${dr}`, "dark", "variable", f, r, o);
    S = `${br}${yr}`, P = [.../* @__PURE__ */ new Set([...sr, ...cr, ...ur])];
    let xr = this.transformCSS(e, `${pr}${fr}color-scheme:light`, "light", "variable", f, r, o), kr = this.transformCSS(e, `${gr}color-scheme:dark`, "dark", "variable", f, r, o);
    C = `${xr}${kr}`, j = [.../* @__PURE__ */ new Set([...mr, ...vr, ...hr])], m = se(p.css, { dt: Ne });
  }
  return { primitive: { css: _, tokens: T }, semantic: { css: S, tokens: P }, global: { css: C, tokens: j }, style: m };
}, getPreset({ name: e = "", preset: t = {}, options: n, params: r, set: o, defaults: i, selector: l }) {
  var c, a, d;
  let s, u, p;
  if (H(t) && n.transform !== "strict") {
    let f = e.replace("-directive", ""), _ = t, { colorScheme: T, extend: S, css: P } = _, C = Ce(_, ["colorScheme", "extend", "css"]), j = S || {}, { colorScheme: m } = j, y = Ce(j, ["colorScheme"]), E = T || {}, { dark: I } = E, ne = Ce(E, ["dark"]), he = m || {}, { dark: F } = he, ce = Ce(he, ["dark"]), _e = H(C) ? this._toVariables({ [f]: ge(ge({}, C), y) }, n) : {}, Se = H(ne) ? this._toVariables({ [f]: ge(ge({}, ne), ce) }, n) : {}, be = H(I) ? this._toVariables({ [f]: ge(ge({}, I), F) }, n) : {}, [de, $e] = [(c = _e.declarations) != null ? c : "", _e.tokens || []], [re, ye] = [(a = Se.declarations) != null ? a : "", Se.tokens || []], [Pe, ue] = [(d = be.declarations) != null ? d : "", be.tokens || []], le = this.transformCSS(f, `${de}${re}`, "light", "variable", n, o, i, l), pe = this.transformCSS(f, Pe, "dark", "variable", n, o, i, l);
    s = `${le}${pe}`, u = [.../* @__PURE__ */ new Set([...$e, ...ye, ...ue])], p = se(P, { dt: Ne });
  }
  return { css: s, tokens: u, style: p };
}, getPresetC({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var i;
  let { preset: l, options: c } = t, a = (i = l?.components) == null ? void 0 : i[e];
  return this.getPreset({ name: e, preset: a, options: c, params: n, set: r, defaults: o });
}, getPresetD({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var i, l;
  let c = e.replace("-directive", ""), { preset: a, options: d } = t, s = ((i = a?.components) == null ? void 0 : i[c]) || ((l = a?.directives) == null ? void 0 : l[c]);
  return this.getPreset({ name: c, preset: s, options: d, params: n, set: r, defaults: o });
}, applyDarkColorScheme(e) {
  return !(e.darkModeSelector === "none" || e.darkModeSelector === !1);
}, getColorSchemeOption(e, t) {
  var n;
  return this.applyDarkColorScheme(e) ? this.regex.resolve(e.darkModeSelector === !0 ? t.options.darkModeSelector : (n = e.darkModeSelector) != null ? n : t.options.darkModeSelector) : [];
}, getLayerOrder(e, t = {}, n, r) {
  let { cssLayer: o } = t;
  return o ? `@layer ${se(o.order || o.name || "primeui", n)}` : "";
}, getCommonStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: o, defaults: i }) {
  let l = this.getCommon({ name: e, theme: t, params: n, set: o, defaults: i }), c = Object.entries(r).reduce((a, [d, s]) => a.push(`${d}="${s}"`) && a, []).join(" ");
  return Object.entries(l || {}).reduce((a, [d, s]) => {
    if (we(s) && Object.hasOwn(s, "css")) {
      let u = Fe(s.css), p = `${d}-variables`;
      a.push(`<style type="text/css" data-primevue-style-id="${p}" ${c}>${u}</style>`);
    }
    return a;
  }, []).join("");
}, getStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: o, defaults: i }) {
  var l;
  let c = { name: e, theme: t, params: n, set: o, defaults: i }, a = (l = e.includes("-directive") ? this.getPresetD(c) : this.getPresetC(c)) == null ? void 0 : l.css, d = Object.entries(r).reduce((s, [u, p]) => s.push(`${u}="${p}"`) && s, []).join(" ");
  return a ? `<style type="text/css" data-primevue-style-id="${e}-variables" ${d}>${Fe(a)}</style>` : "";
}, createTokens(e = {}, t, n = "", r = "", o = {}) {
  let i = function(c, a = {}, d = []) {
    if (d.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: c, path: this.path, paths: a, value: void 0 };
    d.push(this.path), a.name = this.path, a.binding || (a.binding = {});
    let s = this.value;
    if (typeof this.value == "string" && qe.test(this.value)) {
      let u = this.value.trim().replace(qe, (p) => {
        var f;
        let _ = p.slice(1, -1), T = this.tokens[_];
        if (!T) return console.warn(`Token not found for path: ${_}`), "__UNRESOLVED__";
        let S = T.computed(c, a, d);
        return Array.isArray(S) && S.length === 2 ? `light-dark(${S[0].value},${S[1].value})` : (f = S?.value) != null ? f : "__UNRESOLVED__";
      });
      s = Kn.test(u.replace(qn, "0")) ? `calc(${u})` : u;
    }
    return ze(a.binding) && delete a.binding, d.pop(), { colorScheme: c, path: this.path, paths: a, value: s.includes("__UNRESOLVED__") ? void 0 : s };
  }, l = (c, a, d) => {
    Object.entries(c).forEach(([s, u]) => {
      let p = Le(s, t.variable.excludedKeyRegex) ? a : a ? `${a}.${Xt(s)}` : Xt(s), f = d ? `${d}.${s}` : s;
      we(u) ? l(u, p, f) : (o[p] || (o[p] = { paths: [], computed: (_, T = {}, S = []) => {
        if (o[p].paths.length === 1) return o[p].paths[0].computed(o[p].paths[0].scheme, T.binding, S);
        if (_ && _ !== "none") for (let P = 0; P < o[p].paths.length; P++) {
          let C = o[p].paths[P];
          if (C.scheme === _) return C.computed(_, T.binding, S);
        }
        return o[p].paths.map((P) => P.computed(P.scheme, T[P.scheme], S));
      } }), o[p].paths.push({ path: f, value: u, scheme: f.includes("colorScheme.light") ? "light" : f.includes("colorScheme.dark") ? "dark" : "none", computed: i, tokens: o }));
    });
  };
  return l(e, n, r), o;
}, getTokenValue(e, t, n) {
  var r;
  let o = ((c) => c.split(".").filter((a) => !Le(a.toLowerCase(), n.variable.excludedKeyRegex)).join("."))(t), i = t.includes("colorScheme.light") ? "light" : t.includes("colorScheme.dark") ? "dark" : void 0, l = [(r = e[o]) == null ? void 0 : r.computed(i)].flat().filter((c) => c);
  return l.length === 1 ? l[0].value : l.reduce((c = {}, a) => {
    let d = a, { colorScheme: s } = d, u = Ce(d, ["colorScheme"]);
    return c[s] = u, c;
  }, void 0);
}, getSelectorRule(e, t, n, r) {
  return n === "class" || n === "attr" ? Ve(H(t) ? `${e}${t},${e} ${t}` : e, r) : Ve(e, Ve(t ?? ":root,:host", r));
}, transformCSS(e, t, n, r, o = {}, i, l, c) {
  if (H(t)) {
    let { cssLayer: a } = o;
    if (r !== "style") {
      let d = this.getColorSchemeOption(o, l);
      t = n === "dark" ? d.reduce((s, { type: u, selector: p }) => (H(p) && (s += p.includes("[CSS]") ? p.replace("[CSS]", t) : this.getSelectorRule(p, c, u, t)), s), "") : Ve(c ?? ":root,:host", t);
    }
    if (a) {
      let d = { name: "primeui" };
      we(a) && (d.name = se(a.name, { name: e, type: r })), H(d.name) && (t = Ve(`@layer ${d.name}`, t), i?.layerNames(d.name));
    }
    return t;
  }
  return "";
} }, B = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(e = {}) {
  let { theme: t } = e;
  t && (this._theme = wt(ge({}, t), { options: ge(ge({}, this.defaults.options), t.options) }), this._tokens = me.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
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
  this.update({ theme: e }), G.emit("theme:change", e);
}, getPreset() {
  return this.preset;
}, setPreset(e) {
  this._theme = wt(ge({}, this.theme), { preset: e }), this._tokens = me.createTokens(e, this.defaults), this.clearLoadedStyleNames(), G.emit("preset:change", e), G.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(e) {
  this._theme = wt(ge({}, this.theme), { options: e }), this.clearLoadedStyleNames(), G.emit("options:change", e), G.emit("theme:change", this.theme);
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
  return me.getTokenValue(this.tokens, e, this.defaults);
}, getCommon(e = "", t) {
  return me.getCommon({ name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getComponent(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return me.getPresetC(n);
}, getDirective(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return me.getPresetD(n);
}, getCustomPreset(e = "", t, n, r) {
  let o = { name: e, preset: t, options: this.options, selector: n, params: r, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return me.getPreset(o);
}, getLayerOrderCSS(e = "") {
  return me.getLayerOrder(e, this.options, { names: this.getLayerNames() }, this.defaults);
}, transformCSS(e = "", t, n = "style", r) {
  return me.transformCSS(e, t, r, n, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
}, getCommonStyleSheet(e = "", t, n = {}) {
  return me.getCommonStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getStyleSheet(e, t, n = {}) {
  return me.getStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, onStyleMounted(e) {
  this._loadingStyles.add(e);
}, onStyleUpdated(e) {
  this._loadingStyles.add(e);
}, onStyleLoaded(e, { name: t }) {
  this._loadingStyles.size && (this._loadingStyles.delete(t), G.emit(`theme:${t}:load`, e), !this._loadingStyles.size && G.emit("theme:load"));
} }, J = {
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
}, Yo = `
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
function Ye(e) {
  "@babel/helpers - typeof";
  return Ye = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ye(e);
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
function tn(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? en(Object(n), !0).forEach(function(r) {
      Go(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : en(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Go(e, t, n) {
  return (t = Qo(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Qo(e) {
  var t = Jo(e, "string");
  return Ye(t) == "symbol" ? t : t + "";
}
function Jo(e, t) {
  if (Ye(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Ye(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function Zo(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  $t() && $t().components ? Nt(e) : t ? e() : zt(e);
}
var Xo = 0;
function ea(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = R(!1), r = R(e), o = R(null), i = Hn() ? window.document : void 0, l = t.document, c = l === void 0 ? i : l, a = t.immediate, d = a === void 0 ? !0 : a, s = t.manual, u = s === void 0 ? !1 : s, p = t.name, f = p === void 0 ? "style_".concat(++Xo) : p, _ = t.id, T = _ === void 0 ? void 0 : _, S = t.media, P = S === void 0 ? void 0 : S, C = t.nonce, j = C === void 0 ? void 0 : C, m = t.first, y = m === void 0 ? !1 : m, E = t.onMounted, I = E === void 0 ? void 0 : E, ne = t.onUpdated, he = ne === void 0 ? void 0 : ne, F = t.onLoad, ce = F === void 0 ? void 0 : F, _e = t.props, Se = _e === void 0 ? {} : _e, be = function() {
  }, de = function(ye) {
    var Pe = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (c) {
      var ue = tn(tn({}, Se), Pe), le = ue.name || f, pe = ue.id || T, oe = ue.nonce || j;
      o.value = c.querySelector('style[data-primevue-style-id="'.concat(le, '"]')) || c.getElementById(pe) || c.createElement("style"), o.value.isConnected || (r.value = ye || e, vt(o.value, {
        type: "text/css",
        id: pe,
        media: P,
        nonce: oe
      }), y ? c.head.prepend(o.value) : c.head.appendChild(o.value), Ro(o.value, "data-primevue-style-id", le), vt(o.value, ue), o.value.onload = function(w) {
        return ce?.(w, {
          name: le
        });
      }, I?.(le)), !n.value && (be = Oe(r, function(w) {
        o.value.textContent = w, he?.(le);
      }, {
        immediate: !0
      }), n.value = !0);
    }
  }, $e = function() {
    !c || !n.value || (be(), Ao(o.value) && c.head.removeChild(o.value), n.value = !1, o.value = null);
  };
  return d && !u && Zo(de), {
    id: T,
    name: f,
    el: o,
    css: r,
    unload: $e,
    load: de,
    isLoaded: Pr(n)
  };
}
function Ge(e) {
  "@babel/helpers - typeof";
  return Ge = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ge(e);
}
var nn, rn, on, an;
function sn(e, t) {
  return oa(e) || ra(e, t) || na(e, t) || ta();
}
function ta() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function na(e, t) {
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
function ra(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, o, i, l, c = [], a = !0, d = !1;
    try {
      if (i = (n = n.call(e)).next, t !== 0) for (; !(a = (r = i.call(n)).done) && (c.push(r.value), c.length !== t); a = !0) ;
    } catch (s) {
      d = !0, o = s;
    } finally {
      try {
        if (!a && n.return != null && (l = n.return(), Object(l) !== l)) return;
      } finally {
        if (d) throw o;
      }
    }
    return c;
  }
}
function oa(e) {
  if (Array.isArray(e)) return e;
}
function cn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function _t(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? cn(Object(n), !0).forEach(function(r) {
      aa(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : cn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function aa(e, t, n) {
  return (t = ia(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ia(e) {
  var t = sa(e, "string");
  return Ge(t) == "symbol" ? t : t + "";
}
function sa(e, t) {
  if (Ge(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Ge(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function pt(e, t) {
  return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var la = function(t) {
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
}, ca = {}, da = {}, U = {
  name: "base",
  css: la,
  style: Yo,
  classes: ca,
  inlineStyles: da,
  load: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(i) {
      return i;
    }, o = r(ut(nn || (nn = pt(["", ""])), t));
    return H(o) ? ea(Fe(o), _t({
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
      return B.transformCSS(n.name || t.name, "".concat(o).concat(ut(rn || (rn = pt(["", ""])), r)));
    });
  },
  getCommonTheme: function(t) {
    return B.getCommon(this.name, t);
  },
  getComponentTheme: function(t) {
    return B.getComponent(this.name, t);
  },
  getDirectiveTheme: function(t) {
    return B.getDirective(this.name, t);
  },
  getPresetTheme: function(t, n, r) {
    return B.getCustomPreset(this.name, t, n, r);
  },
  getLayerOrderThemeCSS: function() {
    return B.getLayerOrderCSS(this.name);
  },
  getStyleSheet: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.css) {
      var r = se(this.css, {
        dt: Ne
      }) || "", o = Fe(ut(on || (on = pt(["", "", ""])), r, t)), i = Object.entries(n).reduce(function(l, c) {
        var a = sn(c, 2), d = a[0], s = a[1];
        return l.push("".concat(d, '="').concat(s, '"')) && l;
      }, []).join(" ");
      return H(o) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(i, ">").concat(o, "</style>") : "";
    }
    return "";
  },
  getCommonThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return B.getCommonStyleSheet(this.name, t, n);
  },
  getThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = [B.getStyleSheet(this.name, t, n)];
    if (this.style) {
      var o = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), i = ut(an || (an = pt(["", ""])), se(this.style, {
        dt: Ne
      })), l = Fe(B.transformCSS(o, i)), c = Object.entries(n).reduce(function(a, d) {
        var s = sn(d, 2), u = s[0], p = s[1];
        return a.push("".concat(u, '="').concat(p, '"')) && a;
      }, []).join(" ");
      H(l) && r.push('<style type="text/css" data-primevue-style-id="'.concat(o, '" ').concat(c, ">").concat(l, "</style>"));
    }
    return r.join("");
  },
  extend: function(t) {
    return _t(_t({}, this), {}, {
      css: void 0,
      style: void 0
    }, t);
  }
}, Ae = Un();
function Qe(e) {
  "@babel/helpers - typeof";
  return Qe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Qe(e);
}
function dn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function mt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? dn(Object(n), !0).forEach(function(r) {
      ua(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : dn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function ua(e, t, n) {
  return (t = pa(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function pa(e) {
  var t = ma(e, "string");
  return Qe(t) == "symbol" ? t : t + "";
}
function ma(e, t) {
  if (Qe(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Qe(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var fa = {
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
    text: [J.STARTS_WITH, J.CONTAINS, J.NOT_CONTAINS, J.ENDS_WITH, J.EQUALS, J.NOT_EQUALS],
    numeric: [J.EQUALS, J.NOT_EQUALS, J.LESS_THAN, J.LESS_THAN_OR_EQUAL_TO, J.GREATER_THAN, J.GREATER_THAN_OR_EQUAL_TO],
    date: [J.DATE_IS, J.DATE_IS_NOT, J.DATE_BEFORE, J.DATE_AFTER]
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
}, va = Symbol();
function ga(e, t) {
  var n = {
    config: Tr(t)
  };
  return e.config.globalProperties.$primevue = n, e.provide(va, n), ha(), ba(e, n), n;
}
var Ie = [];
function ha() {
  G.clear(), Ie.forEach(function(e) {
    return e?.();
  }), Ie = [];
}
function ba(e, t) {
  var n = R(!1), r = function() {
    var d;
    if (((d = t.config) === null || d === void 0 ? void 0 : d.theme) !== "none" && !B.isStyleNameLoaded("common")) {
      var s, u, p = ((s = U.getCommonTheme) === null || s === void 0 ? void 0 : s.call(U)) || {}, f = p.primitive, _ = p.semantic, T = p.global, S = p.style, P = {
        nonce: (u = t.config) === null || u === void 0 || (u = u.csp) === null || u === void 0 ? void 0 : u.nonce
      };
      U.load(f?.css, mt({
        name: "primitive-variables"
      }, P)), U.load(_?.css, mt({
        name: "semantic-variables"
      }, P)), U.load(T?.css, mt({
        name: "global-variables"
      }, P)), U.loadStyle(mt({
        name: "global-style"
      }, P), S), B.setLoadedStyleName("common");
    }
  };
  G.on("theme:change", function(a) {
    n.value || (e.config.globalProperties.$primevue.config.theme = a, n.value = !0);
  });
  var o = Oe(t.config, function(a, d) {
    Ae.emit("config:change", {
      newValue: a,
      oldValue: d
    });
  }, {
    immediate: !0,
    deep: !0
  }), i = Oe(function() {
    return t.config.ripple;
  }, function(a, d) {
    Ae.emit("config:ripple:change", {
      newValue: a,
      oldValue: d
    });
  }, {
    immediate: !0,
    deep: !0
  }), l = Oe(function() {
    return t.config.theme;
  }, function(a, d) {
    n.value || B.setTheme(a), t.config.unstyled || r(), n.value = !1, Ae.emit("config:theme:change", {
      newValue: a,
      oldValue: d
    });
  }, {
    immediate: !0,
    deep: !1
  }), c = Oe(function() {
    return t.config.unstyled;
  }, function(a, d) {
    !a && t.config.theme && r(), Ae.emit("config:unstyled:change", {
      newValue: a,
      oldValue: d
    });
  }, {
    immediate: !0,
    deep: !0
  });
  Ie.push(o), Ie.push(i), Ie.push(l), Ie.push(c);
}
var ya = {
  install: function(t, n) {
    var r = So(fa, n);
    ga(t, r);
  }
}, Jn = {
  data: function() {
    return {
      mounted: !1
    };
  },
  mounted: function() {
    this.mounted = Hn();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function xa(e, t, n, r, o, i) {
  return i.inline ? Q(e.$slots, "default", {
    key: 0
  }) : o.mounted ? (v(), D(An, {
    key: 1,
    to: n.appendTo
  }, [Q(e.$slots, "default")], 8, ["to"])) : O("", !0);
}
Jn.render = xa;
var Te = {
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
function ka() {
  var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pc", t = Or();
  return "".concat(e).concat(t.replace("v-", "").replaceAll("-", "_"));
}
var un = U.extend({
  name: "common"
});
function Je(e) {
  "@babel/helpers - typeof";
  return Je = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Je(e);
}
function wa(e) {
  return er(e) || _a(e) || Xn(e) || Zn();
}
function _a(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Me(e, t) {
  return er(e) || Sa(e, t) || Xn(e, t) || Zn();
}
function Zn() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Xn(e, t) {
  if (e) {
    if (typeof e == "string") return Tt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Tt(e, t) : void 0;
  }
}
function Tt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Sa(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, o, i, l, c = [], a = !0, d = !1;
    try {
      if (i = (n = n.call(e)).next, t === 0) {
        if (Object(n) !== n) return;
        a = !1;
      } else for (; !(a = (r = i.call(n)).done) && (c.push(r.value), c.length !== t); a = !0) ;
    } catch (s) {
      d = !0, o = s;
    } finally {
      try {
        if (!a && n.return != null && (l = n.return(), Object(l) !== l)) return;
      } finally {
        if (d) throw o;
      }
    }
    return c;
  }
}
function er(e) {
  if (Array.isArray(e)) return e;
}
function pn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function N(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? pn(Object(n), !0).forEach(function(r) {
      Ue(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : pn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Ue(e, t, n) {
  return (t = $a(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function $a(e) {
  var t = Ca(e, "string");
  return Je(t) == "symbol" ? t : t + "";
}
function Ca(e, t) {
  if (Je(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Je(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var it = {
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
        G.off("theme:change", this._loadCoreStyles), t || (this._loadCoreStyles(), this._themeChangeListener(this._loadCoreStyles));
      }
    },
    dt: {
      immediate: !0,
      handler: function(t, n) {
        var r = this;
        G.off("theme:change", this._themeScopedListener), t ? (this._loadScopedThemeStyles(t), this._themeScopedListener = function() {
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
    var t, n, r, o, i, l, c, a, d, s, u, p = (t = this.pt) === null || t === void 0 ? void 0 : t._usept, f = p ? (n = this.pt) === null || n === void 0 || (n = n.originalValue) === null || n === void 0 ? void 0 : n[this.$.type.name] : void 0, _ = p ? (r = this.pt) === null || r === void 0 || (r = r.value) === null || r === void 0 ? void 0 : r[this.$.type.name] : this.pt;
    (o = _ || f) === null || o === void 0 || (o = o.hooks) === null || o === void 0 || (i = o.onBeforeCreate) === null || i === void 0 || i.call(o);
    var T = (l = this.$primevueConfig) === null || l === void 0 || (l = l.pt) === null || l === void 0 ? void 0 : l._usept, S = T ? (c = this.$primevue) === null || c === void 0 || (c = c.config) === null || c === void 0 || (c = c.pt) === null || c === void 0 ? void 0 : c.originalValue : void 0, P = T ? (a = this.$primevue) === null || a === void 0 || (a = a.config) === null || a === void 0 || (a = a.pt) === null || a === void 0 ? void 0 : a.value : (d = this.$primevue) === null || d === void 0 || (d = d.config) === null || d === void 0 ? void 0 : d.pt;
    (s = P || S) === null || s === void 0 || (s = s[this.$.type.name]) === null || s === void 0 || (s = s.hooks) === null || s === void 0 || (u = s.onBeforeCreate) === null || u === void 0 || u.call(s), this.$attrSelector = ka(), this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
  },
  created: function() {
    this._hook("onCreated");
  },
  beforeMount: function() {
    var t;
    this.rootEl = jo(at(this.$el) ? this.$el : (t = this.$el) === null || t === void 0 ? void 0 : t.parentElement, "[".concat(this.$attrSelector, "]")), this.rootEl && (this.rootEl.$pc = N({
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
      return Rt(t) ? t.apply(void 0, r) : K.apply(void 0, r);
    },
    _load: function() {
      Te.isStyleNameLoaded("base") || (U.loadCSS(this.$styleOptions), this._loadGlobalStyles(), Te.setLoadedStyleName("base")), this._loadThemeStyles();
    },
    _loadStyles: function() {
      this._load(), this._themeChangeListener(this._load);
    },
    _loadCoreStyles: function() {
      var t, n;
      !Te.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name && (un.loadCSS(this.$styleOptions), this.$options.style && this.$style.loadCSS(this.$styleOptions), Te.setLoadedStyleName(this.$style.name));
    },
    _loadGlobalStyles: function() {
      var t = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
      H(t) && U.load(t, N({
        name: "global"
      }, this.$styleOptions));
    },
    _loadThemeStyles: function() {
      var t, n;
      if (!(this.isUnstyled || this.$theme === "none")) {
        if (!B.isStyleNameLoaded("common")) {
          var r, o, i = ((r = this.$style) === null || r === void 0 || (o = r.getCommonTheme) === null || o === void 0 ? void 0 : o.call(r)) || {}, l = i.primitive, c = i.semantic, a = i.global, d = i.style;
          U.load(l?.css, N({
            name: "primitive-variables"
          }, this.$styleOptions)), U.load(c?.css, N({
            name: "semantic-variables"
          }, this.$styleOptions)), U.load(a?.css, N({
            name: "global-variables"
          }, this.$styleOptions)), U.loadStyle(N({
            name: "global-style"
          }, this.$styleOptions), d), B.setLoadedStyleName("common");
        }
        if (!B.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name) {
          var s, u, p, f, _ = ((s = this.$style) === null || s === void 0 || (u = s.getComponentTheme) === null || u === void 0 ? void 0 : u.call(s)) || {}, T = _.css, S = _.style;
          (p = this.$style) === null || p === void 0 || p.load(T, N({
            name: "".concat(this.$style.name, "-variables")
          }, this.$styleOptions)), (f = this.$style) === null || f === void 0 || f.loadStyle(N({
            name: "".concat(this.$style.name, "-style")
          }, this.$styleOptions), S), B.setLoadedStyleName(this.$style.name);
        }
        if (!B.isStyleNameLoaded("layer-order")) {
          var P, C, j = (P = this.$style) === null || P === void 0 || (C = P.getLayerOrderThemeCSS) === null || C === void 0 ? void 0 : C.call(P);
          U.load(j, N({
            name: "layer-order",
            first: !0
          }, this.$styleOptions)), B.setLoadedStyleName("layer-order");
        }
      }
    },
    _loadScopedThemeStyles: function(t) {
      var n, r, o, i = ((n = this.$style) === null || n === void 0 || (r = n.getPresetTheme) === null || r === void 0 ? void 0 : r.call(n, t, "[".concat(this.$attrSelector, "]"))) || {}, l = i.css, c = (o = this.$style) === null || o === void 0 ? void 0 : o.load(l, N({
        name: "".concat(this.$attrSelector, "-").concat(this.$style.name)
      }, this.$styleOptions));
      this.scopedStyleEl = c.el;
    },
    _unloadScopedThemeStyles: function() {
      var t;
      (t = this.scopedStyleEl) === null || t === void 0 || (t = t.value) === null || t === void 0 || t.remove();
    },
    _themeChangeListener: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
      };
      Te.clearLoadedStyleNames(), G.on("theme:change", t);
    },
    _removeThemeListeners: function() {
      G.off("theme:change", this._loadCoreStyles), G.off("theme:change", this._load), G.off("theme:change", this._themeScopedListener);
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
      return Vt(t, n, r);
    },
    _getPTValue: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, i = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, l = /./g.test(r) && !!o[r.split(".")[0]], c = this._getPropValue("ptOptions") || ((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.ptOptions) || {}, a = c.mergeSections, d = a === void 0 ? !0 : a, s = c.mergeProps, u = s === void 0 ? !1 : s, p = i ? l ? this._useGlobalPT(this._getPTClassValue, r, o) : this._useDefaultPT(this._getPTClassValue, r, o) : void 0, f = l ? void 0 : this._getPTSelf(n, this._getPTClassValue, r, N(N({}, o), {}, {
        global: p || {}
      })), _ = this._getPTDatasets(r);
      return d || !d && f ? u ? this._mergeProps(u, p, f, _) : N(N(N({}, p), f), _) : N(N({}, f), _);
    },
    _getPTSelf: function() {
      for (var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), o = 1; o < n; o++)
        r[o - 1] = arguments[o];
      return K(
        this._usePT.apply(this, [this._getPT(t, this.$name)].concat(r)),
        // Exp; <component :pt="{}"
        this._usePT.apply(this, [this.$_attrsPT].concat(r))
        // Exp; <component :pt:[passthrough_key]:[attribute]="{value}" or <component :pt:[passthrough_key]="() =>{value}"
      );
    },
    _getPTDatasets: function() {
      var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", o = "data-pc-", i = r === "root" && H((t = this.pt) === null || t === void 0 ? void 0 : t["data-pc-section"]);
      return r !== "transition" && N(N({}, r === "root" && N(N(Ue({}, "".concat(o, "name"), ke(i ? (n = this.pt) === null || n === void 0 ? void 0 : n["data-pc-section"] : this.$.type.name)), i && Ue({}, "".concat(o, "extend"), ke(this.$.type.name))), {}, Ue({}, "".concat(this.$attrSelector), ""))), {}, Ue({}, "".concat(o, "section"), ke(r)));
    },
    _getPTClassValue: function() {
      var t = this._getOptionValue.apply(this, arguments);
      return te(t) || Mn(t) ? {
        class: t
      } : t;
    },
    _getPT: function(t) {
      var n = this, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 ? arguments[2] : void 0, i = function(c) {
        var a, d = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, s = o ? o(c) : c, u = ke(r), p = ke(n.$name);
        return (a = d ? u !== p ? s?.[u] : void 0 : s?.[u]) !== null && a !== void 0 ? a : s;
      };
      return t != null && t.hasOwnProperty("_usept") ? {
        _usept: t._usept,
        originalValue: i(t.originalValue),
        value: i(t.value)
      } : i(t, !0);
    },
    _usePT: function(t, n, r, o) {
      var i = function(T) {
        return n(T, r, o);
      };
      if (t != null && t.hasOwnProperty("_usept")) {
        var l, c = t._usept || ((l = this.$primevueConfig) === null || l === void 0 ? void 0 : l.ptOptions) || {}, a = c.mergeSections, d = a === void 0 ? !0 : a, s = c.mergeProps, u = s === void 0 ? !1 : s, p = i(t.originalValue), f = i(t.value);
        return p === void 0 && f === void 0 ? void 0 : te(f) ? f : te(p) ? p : d || !d && f ? u ? this._mergeProps(u, p, f) : N(N({}, p), f) : f;
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
      return this._getPTValue(this.pt, t, N(N({}, this.$params), n));
    },
    ptmi: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = K(this.$_attrsWithoutPT, this.ptm(n, r));
      return o?.hasOwnProperty("id") && ((t = o.id) !== null && t !== void 0 || (o.id = this.$id)), o;
    },
    ptmo: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return this._getPTValue(t, n, N({
        instance: this
      }, r), !1);
    },
    cx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this.isUnstyled ? void 0 : this._getOptionValue(this.$style.classes, t, N(N({}, this.$params), n));
    },
    sx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      if (n) {
        var o = this._getOptionValue(this.$style.inlineStyles, t, N(N({}, this.$params), r)), i = this._getOptionValue(un.inlineStyles, t, N(N({}, this.$params), r));
        return [i, o];
      }
    }
  },
  computed: {
    globalPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(r) {
        return se(r, {
          instance: n
        });
      });
    },
    defaultPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(r) {
        return n._getOptionValue(r, n.$name, N({}, n.$params)) || se(r, N({}, n.$params));
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
        var o = Me(r, 1), i = o[0];
        return n?.includes(i);
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
        var n = Me(t, 1), r = n[0];
        return r?.startsWith("pt:");
      }).reduce(function(t, n) {
        var r = Me(n, 2), o = r[0], i = r[1], l = o.split(":"), c = wa(l), a = Tt(c).slice(1);
        return a?.reduce(function(d, s, u, p) {
          return !d[s] && (d[s] = u === p.length - 1 ? i : {}), d[s];
        }, t), t;
      }, {});
    },
    $_attrsWithoutPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(t) {
        var n = Me(t, 1), r = n[0];
        return !(r != null && r.startsWith("pt:"));
      }).reduce(function(t, n) {
        var r = Me(n, 2), o = r[0], i = r[1];
        return t[o] = i, t;
      }, {});
    }
  }
}, Pa = `
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
`, Ta = U.extend({
  name: "baseicon",
  css: Pa
});
function Ze(e) {
  "@babel/helpers - typeof";
  return Ze = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ze(e);
}
function mn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function fn(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? mn(Object(n), !0).forEach(function(r) {
      Oa(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : mn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Oa(e, t, n) {
  return (t = Aa(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Aa(e) {
  var t = Ea(e, "string");
  return Ze(t) == "symbol" ? t : t + "";
}
function Ea(e, t) {
  if (Ze(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Ze(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var ja = {
  name: "BaseIcon",
  extends: it,
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
  style: Ta,
  provide: function() {
    return {
      $pcIcon: this,
      $parentInstance: this
    };
  },
  methods: {
    pti: function() {
      var t = ze(this.label);
      return fn(fn({}, !this.isUnstyled && {
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
function Xe(e) {
  "@babel/helpers - typeof";
  return Xe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Xe(e);
}
function vn(e, t) {
  return Ra(e) || za(e, t) || Na(e, t) || La();
}
function La() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Na(e, t) {
  if (e) {
    if (typeof e == "string") return gn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? gn(e, t) : void 0;
  }
}
function gn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function za(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, o, i, l, c = [], a = !0, d = !1;
    try {
      if (i = (n = n.call(e)).next, t !== 0) for (; !(a = (r = i.call(n)).done) && (c.push(r.value), c.length !== t); a = !0) ;
    } catch (s) {
      d = !0, o = s;
    } finally {
      try {
        if (!a && n.return != null && (l = n.return(), Object(l) !== l)) return;
      } finally {
        if (d) throw o;
      }
    }
    return c;
  }
}
function Ra(e) {
  if (Array.isArray(e)) return e;
}
function hn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function V(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? hn(Object(n), !0).forEach(function(r) {
      Ot(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : hn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Ot(e, t, n) {
  return (t = Va(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Va(e) {
  var t = Ia(e, "string");
  return Xe(t) == "symbol" ? t : t + "";
}
function Ia(e, t) {
  if (Xe(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Xe(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var L = {
  _getMeta: function() {
    return [we(arguments.length <= 0 ? void 0 : arguments[0]) || arguments.length <= 0 ? void 0 : arguments[0], se(we(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getConfig: function(t, n) {
    var r, o, i;
    return (r = (t == null || (o = t.instance) === null || o === void 0 ? void 0 : o.$primevue) || (n == null || (i = n.ctx) === null || i === void 0 || (i = i.appContext) === null || i === void 0 || (i = i.config) === null || i === void 0 || (i = i.globalProperties) === null || i === void 0 ? void 0 : i.$primevue)) === null || r === void 0 ? void 0 : r.config;
  },
  _getOptionValue: Vt,
  _getPTValue: function() {
    var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", l = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, c = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, a = function() {
      var C = L._getOptionValue.apply(L, arguments);
      return te(C) || Mn(C) ? {
        class: C
      } : C;
    }, d = ((t = r.binding) === null || t === void 0 || (t = t.value) === null || t === void 0 ? void 0 : t.ptOptions) || ((n = r.$primevueConfig) === null || n === void 0 ? void 0 : n.ptOptions) || {}, s = d.mergeSections, u = s === void 0 ? !0 : s, p = d.mergeProps, f = p === void 0 ? !1 : p, _ = c ? L._useDefaultPT(r, r.defaultPT(), a, i, l) : void 0, T = L._usePT(r, L._getPT(o, r.$name), a, i, V(V({}, l), {}, {
      global: _ || {}
    })), S = L._getPTDatasets(r, i);
    return u || !u && T ? f ? L._mergeProps(r, f, _, T, S) : V(V(V({}, _), T), S) : V(V({}, T), S);
  },
  _getPTDatasets: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = "data-pc-";
    return V(V({}, n === "root" && Ot({}, "".concat(r, "name"), ke(t.$name))), {}, Ot({}, "".concat(r, "section"), ke(n)));
  },
  _getPT: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 ? arguments[2] : void 0, o = function(l) {
      var c, a = r ? r(l) : l, d = ke(n);
      return (c = a?.[d]) !== null && c !== void 0 ? c : a;
    };
    return t && Object.hasOwn(t, "_usept") ? {
      _usept: t._usept,
      originalValue: o(t.originalValue),
      value: o(t.value)
    } : o(t);
  },
  _usePT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = arguments.length > 2 ? arguments[2] : void 0, o = arguments.length > 3 ? arguments[3] : void 0, i = arguments.length > 4 ? arguments[4] : void 0, l = function(S) {
      return r(S, o, i);
    };
    if (n && Object.hasOwn(n, "_usept")) {
      var c, a = n._usept || ((c = t.$primevueConfig) === null || c === void 0 ? void 0 : c.ptOptions) || {}, d = a.mergeSections, s = d === void 0 ? !0 : d, u = a.mergeProps, p = u === void 0 ? !1 : u, f = l(n.originalValue), _ = l(n.value);
      return f === void 0 && _ === void 0 ? void 0 : te(_) ? _ : te(f) ? f : s || !s && _ ? p ? L._mergeProps(t, p, f, _) : V(V({}, f), _) : _;
    }
    return l(n);
  },
  _useDefaultPT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 ? arguments[2] : void 0, o = arguments.length > 3 ? arguments[3] : void 0, i = arguments.length > 4 ? arguments[4] : void 0;
    return L._usePT(t, n, r, o, i);
  },
  _loadStyles: function() {
    var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 ? arguments[1] : void 0, o = arguments.length > 2 ? arguments[2] : void 0, i = L._getConfig(r, o), l = {
      nonce: i == null || (t = i.csp) === null || t === void 0 ? void 0 : t.nonce
    };
    L._loadCoreStyles(n, l), L._loadThemeStyles(n, l), L._loadScopedThemeStyles(n, l), L._removeThemeListeners(n), n.$loadStyles = function() {
      return L._loadThemeStyles(n, l);
    }, L._themeChangeListener(n.$loadStyles);
  },
  _loadCoreStyles: function() {
    var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 ? arguments[1] : void 0;
    if (!Te.isStyleNameLoaded((t = r.$style) === null || t === void 0 ? void 0 : t.name) && (n = r.$style) !== null && n !== void 0 && n.name) {
      var i;
      U.loadCSS(o), (i = r.$style) === null || i === void 0 || i.loadCSS(o), Te.setLoadedStyleName(r.$style.name);
    }
  },
  _loadThemeStyles: function() {
    var t, n, r, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, i = arguments.length > 1 ? arguments[1] : void 0;
    if (!(o != null && o.isUnstyled() || (o == null || (t = o.theme) === null || t === void 0 ? void 0 : t.call(o)) === "none")) {
      if (!B.isStyleNameLoaded("common")) {
        var l, c, a = ((l = o.$style) === null || l === void 0 || (c = l.getCommonTheme) === null || c === void 0 ? void 0 : c.call(l)) || {}, d = a.primitive, s = a.semantic, u = a.global, p = a.style;
        U.load(d?.css, V({
          name: "primitive-variables"
        }, i)), U.load(s?.css, V({
          name: "semantic-variables"
        }, i)), U.load(u?.css, V({
          name: "global-variables"
        }, i)), U.loadStyle(V({
          name: "global-style"
        }, i), p), B.setLoadedStyleName("common");
      }
      if (!B.isStyleNameLoaded((n = o.$style) === null || n === void 0 ? void 0 : n.name) && (r = o.$style) !== null && r !== void 0 && r.name) {
        var f, _, T, S, P = ((f = o.$style) === null || f === void 0 || (_ = f.getDirectiveTheme) === null || _ === void 0 ? void 0 : _.call(f)) || {}, C = P.css, j = P.style;
        (T = o.$style) === null || T === void 0 || T.load(C, V({
          name: "".concat(o.$style.name, "-variables")
        }, i)), (S = o.$style) === null || S === void 0 || S.loadStyle(V({
          name: "".concat(o.$style.name, "-style")
        }, i), j), B.setLoadedStyleName(o.$style.name);
      }
      if (!B.isStyleNameLoaded("layer-order")) {
        var m, y, E = (m = o.$style) === null || m === void 0 || (y = m.getLayerOrderThemeCSS) === null || y === void 0 ? void 0 : y.call(m);
        U.load(E, V({
          name: "layer-order",
          first: !0
        }, i)), B.setLoadedStyleName("layer-order");
      }
    }
  },
  _loadScopedThemeStyles: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = t.preset();
    if (r && t.$attrSelector) {
      var o, i, l, c = ((o = t.$style) === null || o === void 0 || (i = o.getPresetTheme) === null || i === void 0 ? void 0 : i.call(o, r, "[".concat(t.$attrSelector, "]"))) || {}, a = c.css, d = (l = t.$style) === null || l === void 0 ? void 0 : l.load(a, V({
        name: "".concat(t.$attrSelector, "-").concat(t.$style.name)
      }, n));
      t.scopedStyleEl = d.el;
    }
  },
  _themeChangeListener: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
    };
    Te.clearLoadedStyleNames(), G.on("theme:change", t);
  },
  _removeThemeListeners: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    G.off("theme:change", t.$loadStyles), t.$loadStyles = void 0;
  },
  _hook: function(t, n, r, o, i, l) {
    var c, a, d = "on".concat($o(n)), s = L._getConfig(o, i), u = r?.$instance, p = L._usePT(u, L._getPT(o == null || (c = o.value) === null || c === void 0 ? void 0 : c.pt, t), L._getOptionValue, "hooks.".concat(d)), f = L._useDefaultPT(u, s == null || (a = s.pt) === null || a === void 0 || (a = a.directives) === null || a === void 0 ? void 0 : a[t], L._getOptionValue, "hooks.".concat(d)), _ = {
      el: r,
      binding: o,
      vnode: i,
      prevVnode: l
    };
    p?.(u, _), f?.(u, _);
  },
  /* eslint-disable-next-line no-unused-vars */
  _mergeProps: function() {
    for (var t = arguments.length > 1 ? arguments[1] : void 0, n = arguments.length, r = new Array(n > 2 ? n - 2 : 0), o = 2; o < n; o++)
      r[o - 2] = arguments[o];
    return Rt(t) ? t.apply(void 0, r) : K.apply(void 0, r);
  },
  _extend: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = function(c, a, d, s, u) {
      var p, f, _, T;
      a._$instances = a._$instances || {};
      var S = L._getConfig(d, s), P = a._$instances[t] || {}, C = ze(P) ? V(V({}, n), n?.methods) : {};
      a._$instances[t] = V(V({}, P), {}, {
        /* new instance variables to pass in directive methods */
        $name: t,
        $host: a,
        $binding: d,
        $modifiers: d?.modifiers,
        $value: d?.value,
        $el: P.$el || a || void 0,
        $style: V({
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
        $attrSelector: (p = a.$pd) === null || p === void 0 || (p = p[t]) === null || p === void 0 ? void 0 : p.attrSelector,
        /* computed instance variables */
        defaultPT: function() {
          return L._getPT(S?.pt, void 0, function(m) {
            var y;
            return m == null || (y = m.directives) === null || y === void 0 ? void 0 : y[t];
          });
        },
        isUnstyled: function() {
          var m, y;
          return ((m = a._$instances[t]) === null || m === void 0 || (m = m.$binding) === null || m === void 0 || (m = m.value) === null || m === void 0 ? void 0 : m.unstyled) !== void 0 ? (y = a._$instances[t]) === null || y === void 0 || (y = y.$binding) === null || y === void 0 || (y = y.value) === null || y === void 0 ? void 0 : y.unstyled : S?.unstyled;
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
          var m, y = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", E = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return L._getPTValue(a._$instances[t], (m = a._$instances[t]) === null || m === void 0 || (m = m.$binding) === null || m === void 0 || (m = m.value) === null || m === void 0 ? void 0 : m.pt, y, V({}, E));
        },
        ptmo: function() {
          var m = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, y = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", E = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return L._getPTValue(a._$instances[t], m, y, E, !1);
        },
        cx: function() {
          var m, y, E = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", I = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return (m = a._$instances[t]) !== null && m !== void 0 && m.isUnstyled() ? void 0 : L._getOptionValue((y = a._$instances[t]) === null || y === void 0 || (y = y.$style) === null || y === void 0 ? void 0 : y.classes, E, V({}, I));
        },
        sx: function() {
          var m, y = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", E = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, I = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return E ? L._getOptionValue((m = a._$instances[t]) === null || m === void 0 || (m = m.$style) === null || m === void 0 ? void 0 : m.inlineStyles, y, V({}, I)) : void 0;
        }
      }, C), a.$instance = a._$instances[t], (f = (_ = a.$instance)[c]) === null || f === void 0 || f.call(_, a, d, s, u), a["$".concat(t)] = a.$instance, L._hook(t, c, a, d, s, u), a.$pd || (a.$pd = {}), a.$pd[t] = V(V({}, (T = a.$pd) === null || T === void 0 ? void 0 : T[t]), {}, {
        name: t,
        instance: a._$instances[t]
      });
    }, o = function(c) {
      var a, d, s, u = c._$instances[t], p = u?.watch, f = function(S) {
        var P, C = S.newValue, j = S.oldValue;
        return p == null || (P = p.config) === null || P === void 0 ? void 0 : P.call(u, C, j);
      }, _ = function(S) {
        var P, C = S.newValue, j = S.oldValue;
        return p == null || (P = p["config.ripple"]) === null || P === void 0 ? void 0 : P.call(u, C, j);
      };
      u.$watchersCallback = {
        config: f,
        "config.ripple": _
      }, p == null || (a = p.config) === null || a === void 0 || a.call(u, u?.$primevueConfig), Ae.on("config:change", f), p == null || (d = p["config.ripple"]) === null || d === void 0 || d.call(u, u == null || (s = u.$primevueConfig) === null || s === void 0 ? void 0 : s.ripple), Ae.on("config:ripple:change", _);
    }, i = function(c) {
      var a = c._$instances[t].$watchersCallback;
      a && (Ae.off("config:change", a.config), Ae.off("config:ripple:change", a["config.ripple"]), c._$instances[t].$watchersCallback = void 0);
    };
    return {
      created: function(c, a, d, s) {
        c.$pd || (c.$pd = {}), c.$pd[t] = {
          name: t,
          attrSelector: Vo("pd")
        }, r("created", c, a, d, s);
      },
      beforeMount: function(c, a, d, s) {
        var u;
        L._loadStyles((u = c.$pd[t]) === null || u === void 0 ? void 0 : u.instance, a, d), r("beforeMount", c, a, d, s), o(c);
      },
      mounted: function(c, a, d, s) {
        var u;
        L._loadStyles((u = c.$pd[t]) === null || u === void 0 ? void 0 : u.instance, a, d), r("mounted", c, a, d, s);
      },
      beforeUpdate: function(c, a, d, s) {
        r("beforeUpdate", c, a, d, s);
      },
      updated: function(c, a, d, s) {
        var u;
        L._loadStyles((u = c.$pd[t]) === null || u === void 0 ? void 0 : u.instance, a, d), r("updated", c, a, d, s);
      },
      beforeUnmount: function(c, a, d, s) {
        var u;
        i(c), L._removeThemeListeners((u = c.$pd[t]) === null || u === void 0 ? void 0 : u.instance), r("beforeUnmount", c, a, d, s);
      },
      unmounted: function(c, a, d, s) {
        var u;
        (u = c.$pd[t]) === null || u === void 0 || (u = u.instance) === null || u === void 0 || (u = u.scopedStyleEl) === null || u === void 0 || (u = u.value) === null || u === void 0 || u.remove(), r("unmounted", c, a, d, s);
      }
    };
  },
  extend: function() {
    var t = L._getMeta.apply(L, arguments), n = vn(t, 2), r = n[0], o = n[1];
    return V({
      extend: function() {
        var l = L._getMeta.apply(L, arguments), c = vn(l, 2), a = c[0], d = c[1];
        return L.extend(a, V(V(V({}, o), o?.methods), d));
      }
    }, L._extend(r, o));
  }
}, Da = `
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
`, Ma = {
  root: "p-ink"
}, Ba = U.extend({
  name: "ripple-directive",
  style: Da,
  classes: Ma
}), Ua = L.extend({
  style: Ba
});
function et(e) {
  "@babel/helpers - typeof";
  return et = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, et(e);
}
function Ha(e) {
  return qa(e) || Ka(e) || Fa(e) || Wa();
}
function Wa() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Fa(e, t) {
  if (e) {
    if (typeof e == "string") return At(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? At(e, t) : void 0;
  }
}
function Ka(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function qa(e) {
  if (Array.isArray(e)) return At(e);
}
function At(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function bn(e, t, n) {
  return (t = Ya(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ya(e) {
  var t = Ga(e, "string");
  return et(t) == "symbol" ? t : t + "";
}
function Ga(e, t) {
  if (et(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (et(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Qa = Ua.extend("ripple", {
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
      n || (n = Eo("span", bn(bn({
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
        if (!this.isUnstyled() && kt(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "false"), !Qt(o) && !Jt(o)) {
          var i = Math.max(To(r), zo(r));
          o.style.height = i + "px", o.style.width = i + "px";
        }
        var l = No(r), c = t.pageX - l.left + document.body.scrollTop - Jt(o) / 2, a = t.pageY - l.top + document.body.scrollLeft - Qt(o) / 2;
        o.style.top = a + "px", o.style.left = c + "px", !this.isUnstyled() && Po(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "true"), this.timeout = setTimeout(function() {
          o && (!n.isUnstyled() && kt(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "false"));
        }, 401);
      }
    },
    onAnimationEnd: function(t) {
      this.timeout && clearTimeout(this.timeout), !this.isUnstyled() && kt(t.currentTarget, "p-ink-active"), t.currentTarget.setAttribute("data-p-ink-active", "false");
    },
    getInk: function(t) {
      return t && t.children ? Ha(t.children).find(function(n) {
        return Lo(n, "data-pc-name") === "ripple";
      }) : void 0;
    }
  }
});
const Ja = "data-wippy-overlay-layer";
function tr() {
  return typeof window < "u" && typeof window.document < "u";
}
function nr() {
  return tr() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function Za() {
  return nr() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const Xa = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let ei = 0;
const ht = /* @__PURE__ */ new WeakMap();
function yn(e, t) {
  const n = e.style;
  n.setProperty("position", "fixed", "important"), n.setProperty("inset", "auto", "important"), n.setProperty("margin", "0", "important"), n.setProperty("position-anchor", t), n.setProperty("position-area", "bottom span-right"), n.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), n.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), n.setProperty("max-width", "stretch", "important");
}
function ti(e, t) {
  if (!Xa.test(e.className))
    return;
  const n = e.style.cssText;
  yn(e, t), e.getAttribute("popover") !== "manual" && e.setAttribute("popover", "manual");
  try {
    e.matches(":popover-open") || e.showPopover();
  } catch {
  }
  if (!e.matches(":popover-open")) {
    e.removeAttribute("popover"), e.style.cssText = n;
    return;
  }
  if (!ht.has(e)) {
    const r = new MutationObserver(() => {
      const o = e.style;
      (o.top !== "auto" || o.left !== "auto" || o.margin !== "0px" || o.getPropertyPriority("top") !== "important" || o.getPropertyPriority("left") !== "important" || o.getPropertyPriority("margin") !== "important" || o.getPropertyPriority("min-width") !== "important" || o.maxWidth !== "stretch" || o.getPropertyPriority("max-width") !== "important") && yn(e, t);
    });
    r.observe(e, { attributes: !0, attributeFilter: ["style"] }), ht.set(e, r);
  }
}
function It(e) {
  const t = ht.get(e);
  t && (t.disconnect(), ht.delete(e));
}
function ni(e) {
  const t = e && typeof e.getRootNode == "function" ? e.getRootNode() : null;
  return t instanceof ShadowRoot ? t : null;
}
function Et(e) {
  e.style.top = "0px", e.style.left = "0px";
  const t = e.getBoundingClientRect();
  e.style.top = `${-window.scrollY - t.top}px`, e.style.left = `${-window.scrollX - t.left}px`;
}
const bt = /* @__PURE__ */ new Set(), Dt = /* @__PURE__ */ new WeakMap();
let xn = !1, jt = !1;
function ri() {
  jt = !1;
  for (const e of bt) {
    if (!e.isConnected) {
      for (const t of Array.from(e.children))
        t instanceof HTMLElement && It(t);
      bt.delete(e), Dt.get(e)?.disconnect();
      continue;
    }
    e.childElementCount > 0 && Et(e);
  }
}
function kn() {
  jt || (jt = !0, requestAnimationFrame(ri));
}
function oi(e) {
  const t = document.createElement("div");
  t.setAttribute(Ja, "");
  const n = nr();
  if (t.style.cssText = n ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", n && t.setAttribute("popover", "manual"), e.appendChild(t), n) {
    try {
      t.showPopover();
    } catch {
    }
    t.matches(":popover-open") || (t.removeAttribute("popover"), t.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  Et(t);
  const r = new MutationObserver((o) => {
    const i = t.__wippyAnchorName;
    for (const l of o) {
      if (i)
        for (const c of Array.from(l.addedNodes))
          c instanceof HTMLElement && ti(c, i);
      for (const c of Array.from(l.removedNodes))
        c instanceof HTMLElement && It(c);
    }
    t.isConnected && t.childElementCount > 0 && Et(t);
  });
  return r.observe(t, { childList: !0 }), Dt.set(t, r), bt.add(t), xn || (xn = !0, window.addEventListener("scroll", kn, { capture: !0, passive: !0 }), window.addEventListener("resize", kn, { passive: !0 })), t;
}
function wn(e) {
  if (!(!e.hostRoot || e.layer) && (e.layer = oi(e.hostRoot), Za())) {
    const t = e.$el ? e.$el.parentElement : null;
    t && (e.anchorName = `--wippy-a-${++ei}`, e.anchorTrigger = t, t.style.setProperty("anchor-name", e.anchorName), e.layer.__wippyAnchorName = e.anchorName);
  }
}
function _n(e) {
  if (e.anchorTrigger && (e.anchorTrigger.style.removeProperty("anchor-name"), e.anchorTrigger = null), e.anchorName = null, e.layer) {
    for (const t of Array.from(e.layer.children))
      t instanceof HTMLElement && It(t);
    bt.delete(e.layer), Dt.get(e.layer)?.disconnect(), e.layer.remove(), e.layer = null;
  }
}
let Sn = !1;
function ai() {
  if (Sn)
    return;
  Sn = !0;
  const e = Jn;
  e.computed = e.computed || {}, e.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, e.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, e.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, e.mounted = function() {
    tr() && (this.hostRoot = ni(this.$el), this.mounted = !0, this.hostRoot && (this.inline || wn(this), this.$watch("inline", (t) => {
      t ? _n(this) : wn(this);
    })));
  }, e.render = function() {
    return this.inline ? Q(this.$slots, "default", { key: 0 }) : this.mounted ? Ar(An, { key: 1, to: this.resolvedTarget || document.body }, [
      Q(this.$slots, "default")
    ]) : O("", !0);
  }, e.unmounted = function() {
    _n(this);
  };
}
const ii = {
  install: (e) => {
    ai(), e.use(ya, { theme: "none" });
  }
}, si = { class: "km-shell" }, li = { class: "km-rail" }, ci = { class: "km-main" }, di = /* @__PURE__ */ Z({
  __name: "Shell",
  setup(e) {
    return (t, n) => (v(), k("div", si, [
      g("aside", li, [
        Q(t.$slots, "rail")
      ]),
      g("main", ci, [
        Q(t.$slots, "default")
      ])
    ]));
  }
}), ui = { class: "km-railhead" }, pi = { class: "km-railhead-title" }, mi = { key: 0 }, fi = { class: "km-railhead-acts" }, vi = /* @__PURE__ */ Z({
  __name: "RailHeader",
  props: {
    title: {},
    count: {}
  },
  setup(e) {
    return (t, n) => (v(), k("div", ui, [
      g("span", pi, [
        M($(e.title), 1),
        e.count !== void 0 ? (v(), k("b", mi, $(e.count), 1)) : O("", !0)
      ]),
      g("div", fi, [
        Q(t.$slots, "actions")
      ])
    ]));
  }
});
var Mt = {
  name: "SpinnerIcon",
  extends: ja
};
function gi(e) {
  return xi(e) || yi(e) || bi(e) || hi();
}
function hi() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function bi(e, t) {
  if (e) {
    if (typeof e == "string") return Lt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Lt(e, t) : void 0;
  }
}
function yi(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function xi(e) {
  if (Array.isArray(e)) return Lt(e);
}
function Lt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function ki(e, t, n, r, o, i) {
  return v(), k("svg", K({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), gi(t[0] || (t[0] = [g("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Mt.render = ki;
var wi = `
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
`, _i = {
  root: function(t) {
    var n = t.props, r = t.instance;
    return ["p-badge p-component", {
      "p-badge-circle": H(n.value) && String(n.value).length === 1,
      "p-badge-dot": ze(n.value) && !r.$slots.default,
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
}, Si = U.extend({
  name: "badge",
  style: wi,
  classes: _i
}), $i = {
  name: "BaseBadge",
  extends: it,
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
  style: Si,
  provide: function() {
    return {
      $pcBadge: this,
      $parentInstance: this
    };
  }
};
function tt(e) {
  "@babel/helpers - typeof";
  return tt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, tt(e);
}
function $n(e, t, n) {
  return (t = Ci(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ci(e) {
  var t = Pi(e, "string");
  return tt(t) == "symbol" ? t : t + "";
}
function Pi(e, t) {
  if (tt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (tt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var rr = {
  name: "Badge",
  extends: $i,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return De($n($n({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, Ti = ["data-p"];
function Oi(e, t, n, r, o, i) {
  return v(), k("span", K({
    class: e.cx("root"),
    "data-p": i.dataP
  }, e.ptmi("root")), [Q(e.$slots, "default", {}, function() {
    return [M($(e.value), 1)];
  })], 16, Ti);
}
rr.render = Oi;
var Ai = `
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
function nt(e) {
  "@babel/helpers - typeof";
  return nt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, nt(e);
}
function xe(e, t, n) {
  return (t = Ei(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ei(e) {
  var t = ji(e, "string");
  return nt(t) == "symbol" ? t : t + "";
}
function ji(e, t) {
  if (nt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (nt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Li = {
  root: function(t) {
    var n = t.instance, r = t.props;
    return ["p-button p-component", xe(xe(xe(xe(xe(xe(xe(xe(xe({
      "p-button-icon-only": n.hasIcon && !r.label && !r.badge,
      "p-button-vertical": (r.iconPos === "top" || r.iconPos === "bottom") && r.label,
      "p-button-loading": r.loading,
      "p-button-link": r.link || r.variant === "link"
    }, "p-button-".concat(r.severity), r.severity), "p-button-raised", r.raised), "p-button-rounded", r.rounded), "p-button-text", r.text || r.variant === "text"), "p-button-outlined", r.outlined || r.variant === "outlined"), "p-button-sm", r.size === "small"), "p-button-lg", r.size === "large"), "p-button-plain", r.plain), "p-button-fluid", n.hasFluid)];
  },
  loadingIcon: "p-button-loading-icon",
  icon: function(t) {
    var n = t.props;
    return ["p-button-icon", xe({}, "p-button-icon-".concat(n.iconPos), n.label)];
  },
  label: "p-button-label"
}, Ni = U.extend({
  name: "button",
  style: Ai,
  classes: Li
}), zi = {
  name: "BaseButton",
  extends: it,
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
  style: Ni,
  provide: function() {
    return {
      $pcButton: this,
      $parentInstance: this
    };
  }
};
function rt(e) {
  "@babel/helpers - typeof";
  return rt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, rt(e);
}
function ee(e, t, n) {
  return (t = Ri(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ri(e) {
  var t = Vi(e, "string");
  return rt(t) == "symbol" ? t : t + "";
}
function Vi(e, t) {
  if (rt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (rt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Bt = {
  name: "Button",
  extends: zi,
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
      return ze(this.fluid) ? !!this.$pcFluid : this.fluid;
    },
    dataP: function() {
      return De(ee(ee(ee(ee(ee(ee(ee(ee(ee(ee({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
    },
    dataIconP: function() {
      return De(ee(ee({}, this.iconPos, this.iconPos), this.size, this.size));
    },
    dataLabelP: function() {
      return De(ee(ee({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
    }
  },
  components: {
    SpinnerIcon: Mt,
    Badge: rr
  },
  directives: {
    ripple: Qa
  }
}, Ii = ["data-p"], Di = ["data-p"];
function Mi(e, t, n, r, o, i) {
  var l = Ut("SpinnerIcon"), c = Ut("Badge"), a = Er("ripple");
  return e.asChild ? Q(e.$slots, "default", {
    key: 1,
    class: ie(e.cx("root")),
    a11yAttrs: i.a11yAttrs
  }) : ft((v(), D(En(e.as), K({
    key: 0,
    class: e.cx("root"),
    "data-p": i.dataP
  }, i.attrs), {
    default: z(function() {
      return [Q(e.$slots, "default", {}, function() {
        return [e.loading ? Q(e.$slots, "loadingicon", K({
          key: 0,
          class: [e.cx("loadingIcon"), e.cx("icon")]
        }, e.ptm("loadingIcon")), function() {
          return [e.loadingIcon ? (v(), k("span", K({
            key: 0,
            class: [e.cx("loadingIcon"), e.cx("icon"), e.loadingIcon]
          }, e.ptm("loadingIcon")), null, 16)) : (v(), D(l, K({
            key: 1,
            class: [e.cx("loadingIcon"), e.cx("icon")],
            spin: ""
          }, e.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : Q(e.$slots, "icon", K({
          key: 1,
          class: [e.cx("icon")]
        }, e.ptm("icon")), function() {
          return [e.icon ? (v(), k("span", K({
            key: 0,
            class: [e.cx("icon"), e.icon, e.iconClass],
            "data-p": i.dataIconP
          }, e.ptm("icon")), null, 16, Ii)) : O("", !0)];
        }), e.label ? (v(), k("span", K({
          key: 2,
          class: e.cx("label")
        }, e.ptm("label"), {
          "data-p": i.dataLabelP
        }), $(e.label), 17, Di)) : O("", !0), e.badge ? (v(), D(c, {
          key: 3,
          value: e.badge,
          class: ie(e.badgeClass),
          severity: e.badgeSeverity,
          unstyled: e.unstyled,
          pt: e.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : O("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[a]]);
}
Bt.render = Mi;
const Cn = /* @__PURE__ */ Z({
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
    const n = e, r = t, o = $t(), i = q(
      () => Object.prototype.hasOwnProperty.call(o?.vnode.props ?? {}, "active")
    ), l = q(
      () => n.variant === "danger" ? "danger" : n.variant === "bordered" ? "secondary" : void 0
    ), c = q(
      () => n.size === "sm" ? "small" : n.size === "lg" ? "large" : void 0
    );
    return (a, d) => (v(), D(b(Bt), {
      type: "button",
      severity: l.value,
      text: e.variant !== "bordered" && !e.active,
      outlined: e.variant === "bordered",
      size: c.value,
      loading: e.spin,
      disabled: e.disabled || e.spin,
      pt: {
        root: {
          "aria-label": e.label,
          "aria-pressed": i.value ? String(e.active) : void 0,
          title: e.label
        }
      },
      onClick: d[0] || (d[0] = (s) => r("click"))
    }, {
      icon: z(() => [
        A(b(Y), {
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])
      ]),
      _: 1
    }, 8, ["severity", "text", "outlined", "size", "loading", "disabled", "pt"]));
  }
}), ae = /* @__PURE__ */ Z({
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
    const n = e, r = t, o = q(
      () => n.variant === "danger" ? "danger" : n.variant === "primary" ? void 0 : "secondary"
    );
    return (i, l) => (v(), D(b(Bt), {
      type: e.type,
      severity: o.value,
      outlined: e.variant === "ghost",
      loading: e.loading,
      disabled: e.disabled || e.loading,
      size: e.small ? "small" : void 0,
      onClick: l[0] || (l[0] = (c) => r("click"))
    }, {
      default: z(() => [
        e.loading ? (v(), D(b(Mt), {
          key: 0,
          class: "p-button-loading-icon p-button-icon",
          spin: ""
        })) : O("", !0),
        e.icon && !e.loading ? (v(), D(b(Y), {
          key: 1,
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : O("", !0),
        Q(i.$slots, "default")
      ]),
      _: 3
    }, 8, ["type", "severity", "outlined", "loading", "disabled", "size"]));
  }
}), Bi = { class: "km-search" }, Ui = ["value", "placeholder"], Pn = /* @__PURE__ */ Z({
  __name: "SearchField",
  props: {
    modelValue: {},
    placeholder: {}
  },
  emits: ["update:modelValue"],
  setup(e, { emit: t }) {
    const n = t;
    return (r, o) => (v(), k("div", Bi, [
      A(b(Y), {
        icon: "tabler:search",
        class: "km-search-ico",
        "aria-hidden": "true"
      }),
      g("input", {
        class: "km-search-input",
        value: e.modelValue,
        placeholder: e.placeholder || "Search",
        onInput: o[0] || (o[0] = (i) => n("update:modelValue", i.target.value))
      }, null, 40, Ui),
      e.modelValue ? (v(), k("button", {
        key: 0,
        class: "km-search-clear",
        "aria-label": "Clear search",
        onClick: o[1] || (o[1] = (i) => n("update:modelValue", ""))
      }, [
        A(b(Y), {
          icon: "tabler:x",
          "aria-hidden": "true"
        })
      ])) : O("", !0)
    ]));
  }
}), Hi = { class: "km-field" }, Wi = { class: "km-field-label" }, Fi = {
  key: 0,
  class: "km-field-help"
}, je = /* @__PURE__ */ Z({
  __name: "FormField",
  props: {
    label: {},
    help: {}
  },
  setup(e) {
    return (t, n) => (v(), k("label", Hi, [
      g("span", Wi, $(e.label), 1),
      Q(t.$slots, "default"),
      e.help ? (v(), k("small", Fi, $(e.help), 1)) : O("", !0)
    ]));
  }
}), Ki = ["type", "value", "placeholder", "readonly", "disabled", "autocomplete", "min", "max", "step"], He = /* @__PURE__ */ Z({
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
    function r(o) {
      const i = o.target;
      n("update:modelValue", i.value);
    }
    return (o, i) => (v(), k("input", {
      class: ie(["km-input", e.mono && "mono"]),
      type: e.type,
      value: e.modelValue,
      placeholder: e.placeholder,
      readonly: e.readonly,
      disabled: e.disabled,
      autocomplete: e.autocomplete,
      min: e.min,
      max: e.max,
      step: e.step,
      onInput: r
    }, null, 42, Ki));
  }
});
var qi = `
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
`, Yi = {
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
}, Gi = U.extend({
  name: "tag",
  style: qi,
  classes: Yi
}), Qi = {
  name: "BaseTag",
  extends: it,
  props: {
    value: null,
    severity: null,
    rounded: Boolean,
    icon: String
  },
  style: Gi,
  provide: function() {
    return {
      $pcTag: this,
      $parentInstance: this
    };
  }
};
function ot(e) {
  "@babel/helpers - typeof";
  return ot = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ot(e);
}
function Ji(e, t, n) {
  return (t = Zi(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Zi(e) {
  var t = Xi(e, "string");
  return ot(t) == "symbol" ? t : t + "";
}
function Xi(e, t) {
  if (ot(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ot(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var or = {
  name: "Tag",
  extends: Qi,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return De(Ji({
        rounded: this.rounded
      }, this.severity, this.severity));
    }
  }
}, es = ["data-p"];
function ts(e, t, n, r, o, i) {
  return v(), k("span", K({
    class: e.cx("root"),
    "data-p": i.dataP
  }, e.ptmi("root")), [e.$slots.icon ? (v(), D(En(e.$slots.icon), K({
    key: 0,
    class: e.cx("icon")
  }, e.ptm("icon")), null, 16, ["class"])) : e.icon ? (v(), k("span", K({
    key: 1,
    class: [e.cx("icon"), e.icon]
  }, e.ptm("icon")), null, 16)) : O("", !0), e.value != null || e.$slots.default ? Q(e.$slots, "default", {
    key: 2
  }, function() {
    return [g("span", K({
      class: e.cx("label")
    }, e.ptm("label")), $(e.value), 17)];
  }) : O("", !0)], 16, es);
}
or.render = ts;
const ns = {
  key: 0,
  class: "km-pill-dot",
  "aria-hidden": "true"
}, Be = /* @__PURE__ */ Z({
  __name: "Pill",
  props: {
    severity: { default: "secondary" },
    dot: { type: Boolean },
    icon: {}
  },
  setup(e) {
    return (t, n) => (v(), D(b(or), {
      severity: e.severity || void 0,
      class: "km-pill kx-tag-sm"
    }, {
      default: z(() => [
        e.dot ? (v(), k("span", ns)) : e.icon ? (v(), D(b(Y), {
          key: 1,
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : O("", !0),
        Q(t.$slots, "default")
      ]),
      _: 3
    }, 8, ["severity"]));
  }
}), rs = { class: "km-notice-text" }, yt = /* @__PURE__ */ Z({
  __name: "Notice",
  props: {
    severity: { default: "info" }
  },
  emits: ["dismiss"],
  setup(e, { emit: t }) {
    const n = t, r = (o) => o === "danger" ? "tabler:alert-triangle" : o === "success" ? "tabler:circle-check" : "tabler:info-circle";
    return (o, i) => (v(), k("div", {
      class: ie(["km-notice", `is-${e.severity}`]),
      role: "status"
    }, [
      A(b(Y), {
        icon: r(e.severity),
        "aria-hidden": "true"
      }, null, 8, ["icon"]),
      g("span", rs, [
        Q(o.$slots, "default")
      ]),
      g("button", {
        class: "km-notice-x",
        "aria-label": "Dismiss",
        onClick: i[0] || (i[0] = (l) => n("dismiss"))
      }, [
        A(b(Y), {
          icon: "tabler:x",
          "aria-hidden": "true"
        })
      ])
    ], 2));
  }
});
var os = `
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
`, as = {
  root: "p-progressspinner",
  spin: "p-progressspinner-spin",
  circle: "p-progressspinner-circle"
}, is = U.extend({
  name: "progressspinner",
  style: os,
  classes: as
}), ss = {
  name: "BaseProgressSpinner",
  extends: it,
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
  style: is,
  provide: function() {
    return {
      $pcProgressSpinner: this,
      $parentInstance: this
    };
  }
}, ar = {
  name: "ProgressSpinner",
  extends: ss,
  inheritAttrs: !1,
  computed: {
    svgStyle: function() {
      return {
        "animation-duration": this.animationDuration
      };
    }
  }
}, ls = ["fill", "stroke-width"];
function cs(e, t, n, r, o, i) {
  return v(), k("div", K({
    class: e.cx("root"),
    role: "progressbar"
  }, e.ptmi("root")), [(v(), k("svg", K({
    class: e.cx("spin"),
    viewBox: "25 25 50 50",
    style: i.svgStyle
  }, e.ptm("spin")), [g("circle", K({
    class: e.cx("circle"),
    cx: "50",
    cy: "50",
    r: "20",
    fill: e.fill,
    "stroke-width": e.strokeWidth,
    strokeMiterlimit: "10"
  }, e.ptm("circle")), null, 16, ls)], 16))], 16);
}
ar.render = cs;
const ds = { class: "km-loading" }, us = { key: 0 }, ir = /* @__PURE__ */ Z({
  __name: "Spinner",
  props: {
    label: {}
  },
  setup(e) {
    return (t, n) => (v(), k("div", ds, [
      A(b(ar), {
        style: { width: "22px", height: "22px", margin: "0" },
        "aria-label": e.label || "Loading"
      }, null, 8, ["aria-label"]),
      e.label ? (v(), k("span", us, $(e.label), 1)) : O("", !0)
    ]));
  }
}), ps = { class: "km-empty" }, ms = { class: "km-empty-title" }, fs = {
  key: 0,
  class: "km-empty-hint"
}, vs = /* @__PURE__ */ Z({
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
    return (r, o) => (v(), k("div", ps, [
      A(b(Y), {
        icon: e.icon,
        class: "km-empty-ico",
        "aria-hidden": "true"
      }, null, 8, ["icon"]),
      g("div", ms, $(e.title), 1),
      e.hint ? (v(), k("p", fs, $(e.hint), 1)) : O("", !0),
      e.cta ? (v(), D(ae, {
        key: 1,
        icon: e.ctaIcon,
        onClick: o[0] || (o[0] = (i) => n("cta"))
      }, {
        default: z(() => [
          M($(e.cta), 1)
        ]),
        _: 1
      }, 8, ["icon"])) : O("", !0)
    ]));
  }
}), gs = { class: "kx-wcmount" }, hs = {
  key: 0,
  class: "kx-wcmount-fail",
  role: "alert"
}, bs = /* @__PURE__ */ Z({
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
  emits: ["change", "created", "close", "error"],
  setup(e, { emit: t }) {
    const n = e, r = t, o = R(null), i = R(!1);
    let l = null, c = 0;
    const a = /* @__PURE__ */ new Set();
    function d(m) {
      m.composedPath()[0] === l && (m.stopPropagation(), r("change", m.detail));
    }
    function s(m) {
      return m.composedPath()[0] !== l ? !1 : (m.stopPropagation(), !0);
    }
    function u(m) {
      s(m) && r("created", m.detail);
    }
    function p(m) {
      s(m) && r("close", m.detail);
    }
    function f(m) {
      s(m) && r("error", m.detail);
    }
    function _(m) {
      if (typeof m == "string") return m;
      try {
        return JSON.stringify(m ?? {});
      } catch {
        return null;
      }
    }
    function T() {
      if (!l) return;
      const m = _(n.config);
      if (m !== null && l.setAttribute("config", m), n.schema !== void 0 && n.schema !== null) {
        const E = _(n.schema);
        E !== null && l.setAttribute("schema", E);
      }
      if (n.meta !== void 0 && n.meta !== null) {
        const E = _(n.meta);
        E !== null && l.setAttribute("meta", E);
      }
      n.provider && l.setAttribute("provider", n.provider), n.label && l.setAttribute("label", n.label);
      const y = n.attrs || {};
      for (const E of [...a])
        (!(E in y) || y[E] == null) && (l.removeAttribute(E), a.delete(E));
      for (const [E, I] of Object.entries(y)) {
        if (I == null) continue;
        const ne = typeof I == "object" ? _(I) : String(I);
        ne !== null && (l.setAttribute(E, ne), a.add(E));
      }
    }
    function S(m = l) {
      m && (m.removeEventListener("config-changed", d), m.removeEventListener("change", d), m.removeEventListener("created", u), m.removeEventListener("close", p), m.removeEventListener("error", f), m === l && (l = null), a.clear());
    }
    async function P(m) {
      if (!customElements.get(m))
        try {
          await Dr(m, { timeoutMs: 8e3 });
        } catch {
        }
    }
    async function C() {
      const m = ++c, y = o.value, E = n.tag;
      if (i.value = !1, !!y && (S(), y.innerHTML = "", !!E))
        try {
          if (await P(E), m !== c || o.value !== y || n.tag !== E) return;
          const I = document.createElement(E);
          I.classList.add("kx-wcmount-surface"), l = I, T(), I.addEventListener("config-changed", d), I.addEventListener("change", d), I.addEventListener("created", u), I.addEventListener("close", p), I.addEventListener("error", f), I.style.display = "block", y.appendChild(I), i.value = !customElements.get(E);
        } catch {
          m === c && (i.value = !0);
        }
    }
    async function j() {
      i.value = !1, await zt(), await C();
    }
    return Nt(C), Oe(() => n.tag, C), Oe(() => [n.config, n.schema, n.meta, n.provider, n.label, n.attrs], T, { deep: !0 }), jr(() => {
      c += 1, S();
    }), (m, y) => (v(), k("div", gs, [
      i.value ? (v(), k("div", hs, [
        y[0] || (y[0] = g("span", null, "This setup panel couldn’t load.", -1)),
        g("button", {
          type: "button",
          onClick: j
        }, "Try again")
      ])) : (v(), k("div", {
        key: 1,
        ref_key: "host",
        ref: o
      }, null, 512))
    ]));
  }
}), ys = (e, t) => {
  const n = e.__vccOpts || e;
  for (const [r, o] of t)
    n[r] = o;
  return n;
}, Tn = /* @__PURE__ */ ys(bs, [["__scopeId", "data-v-3ec70c11"]]);
function Ke(e, t) {
  const n = e?.response?.data ?? e?.data;
  return typeof n?.error == "string" && n.error ? n.error : typeof n?.message == "string" && n.message ? n.message : e instanceof Error ? e.message : t;
}
function xs() {
  const e = R([]), t = R([]), n = R(!0), r = R(!1), o = R("");
  let i = 0;
  async function l() {
    const d = ++i;
    n.value = !0, o.value = "";
    try {
      const [s, u] = await Promise.all([
        Ee.get("/api/v1/security/scopes"),
        Ee.get("/api/v1/security/policies")
      ]);
      if (d !== i) return;
      e.value = s.data?.scopes ?? [], t.value = u.data?.policies ?? [];
    } catch (s) {
      d === i && (o.value = Ke(s, "failed to load security"));
    } finally {
      d === i && (n.value = !1);
    }
  }
  async function c(d) {
    r.value = !0, o.value = "";
    try {
      return await Ee.post("/api/v1/security/scopes", d), await l(), !0;
    } catch (s) {
      return o.value = Ke(s, "failed to save scope"), !1;
    } finally {
      r.value = !1;
    }
  }
  async function a(d) {
    r.value = !0, o.value = "";
    try {
      return await Ee.delete(`/api/v1/security/scopes?slug=${encodeURIComponent(d)}`), await l(), !0;
    } catch (s) {
      return o.value = Ke(s, "failed to delete scope"), !1;
    } finally {
      r.value = !1;
    }
  }
  return { scopes: e, policies: t, loading: n, saving: r, error: o, load: l, saveScope: c, deleteScope: a };
}
function ks() {
  const e = R([]), t = R(!1), n = R(!1), r = R(""), o = R(""), i = R(null);
  let l = 0;
  async function c() {
    const s = ++l;
    t.value = !0, r.value = "";
    try {
      const { data: u } = await Ee.get("/api/v1/security/delegations");
      if (u?.success !== !0 || !Array.isArray(u.delegations))
        throw new Error(u?.error || "Delegation inventory is unconfirmed");
      s === l && (e.value = u.delegations);
    } catch (u) {
      s === l && (r.value = Ke(u, "Could not load act-as grants"));
    } finally {
      s === l && (t.value = !1);
    }
  }
  async function a() {
    if (!i.value || n.value) return;
    const s = i.value;
    n.value = !0, r.value = "", o.value = "";
    try {
      const { data: u } = s.method === "save" ? await Ee.post("/api/v1/security/delegations", s.request) : await Ee.delete("/api/v1/security/delegations", { data: s.request });
      if (u?.success !== !0) throw new Error(u?.error || "Act-as request is unconfirmed");
      i.value = null, o.value = s.method === "save" ? "Act-as grant saved" : "Act-as grant revoked", await c();
    } catch (u) {
      r.value = Ke(u, "Could not confirm act-as request");
      const p = u?.response?.status;
      p && p >= 400 && p < 500 && (i.value = null);
    } finally {
      n.value = !1;
    }
  }
  async function d(s, u) {
    i.value || n.value || (i.value = { method: s, request: {
      ...u,
      principal: { ...u.principal },
      ...u.groups ? { groups: [...u.groups].sort() } : {}
    } }, await a());
  }
  return { delegations: e, loading: t, saving: n, error: r, confirmation: o, pending: i, load: c, mutate: d, submit: a };
}
const ws = {
  class: "ks-delegations",
  "aria-label": "Act-as grants"
}, _s = { class: "ks-builder-head" }, Ss = {
  key: 0,
  role: "alert"
}, $s = ["disabled", "inert"], Cs = {
  key: 0,
  "aria-label": "Selected operator groups"
}, Ps = { class: "ks-delegation-all" }, Ts = {
  key: 0,
  class: "ks-field-err"
}, Os = { key: 2 }, As = {
  key: 4,
  class: "ks-delegation-table"
}, Es = { key: 5 }, js = /* @__PURE__ */ Z({
  __name: "Delegations",
  setup(e, { expose: t }) {
    const n = ks(), { delegations: r, loading: o, saving: i, error: l, confirmation: c, pending: a } = n, d = R(""), s = R(""), u = R(!1), p = R([]), f = q(() => i.value || !!a.value), _ = q(() => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s.value.trim())), T = q(() => !!d.value && p.value.length > 0 && (u.value || _.value));
    function S(j, m) {
      if (!j || typeof j != "object") return;
      const y = j;
      f.value || y.type !== m || typeof y.id != "string" || (m === "user" ? d.value = y.id : y.id && !p.value.some((E) => E.id === y.id) && p.value.push({ id: y.id, label: typeof y.label == "string" ? y.label : y.id }));
    }
    function P(j) {
      l.value = j && typeof j == "object" && "message" in j ? String(j.message) : "Could not load the principal picker";
    }
    async function C() {
      T.value && await n.mutate("save", {
        principal: { kind: "user", id: d.value },
        root: u.value ? "*" : s.value.trim(),
        groups: p.value.map((j) => j.id)
      });
    }
    return t({ load: n.load }), (j, m) => (v(), k("section", ws, [
      g("div", _s, [
        m[7] || (m[7] = g("h2", { class: "ks-builder-title" }, "Act-as grants", -1)),
        A(b(ae), {
          variant: "ghost",
          disabled: b(o) || f.value,
          onClick: b(n).load
        }, {
          default: z(() => [...m[6] || (m[6] = [
            M("Refresh act-as grants", -1)
          ])]),
          _: 1
        }, 8, ["disabled", "onClick"])
      ]),
      m[16] || (m[16] = g("p", null, "Choose which operator groups may select an ordinary user account for execution. Account groups supply its access. An act-as grant also requires administration of the execution root and access to its declared resources.", -1)),
      b(l) ? (v(), k("div", Ss, [
        A(b(yt), {
          severity: "danger",
          onDismiss: m[0] || (m[0] = (y) => l.value = "")
        }, {
          default: z(() => [
            M($(b(l)), 1)
          ]),
          _: 1
        })
      ])) : O("", !0),
      b(c) ? (v(), D(b(yt), {
        key: 1,
        "data-test": "delegation-confirmation",
        severity: "success",
        onDismiss: m[1] || (m[1] = (y) => c.value = "")
      }, {
        default: z(() => [
          M($(b(c)), 1)
        ]),
        _: 1
      })) : O("", !0),
      g("fieldset", {
        disabled: f.value,
        inert: f.value,
        class: "ks-delegation-form"
      }, [
        A(b(je), { label: "Execution account" }, {
          default: z(() => [
            A(Tn, {
              tag: "wc-principal-picker",
              attrs: { kinds: "user", placeholder: "Choose execution account…" },
              config: { principal_id: d.value },
              onChange: m[2] || (m[2] = (y) => S(y, "user")),
              onError: P
            }, null, 8, ["config"])
          ]),
          _: 1
        }),
        A(b(je), {
          label: "Operator groups",
          help: "Only members of these groups receive selection permission. This does not change any account membership."
        }, {
          default: z(() => [
            A(Tn, {
              tag: "wc-principal-picker",
              attrs: { kinds: "group", placeholder: "Add operator group…" },
              config: {},
              onChange: m[3] || (m[3] = (y) => S(y, "group")),
              onError: P
            })
          ]),
          _: 1
        }),
        p.value.length ? (v(), k("ul", Cs, [
          (v(!0), k(fe, null, ve(p.value, (y) => (v(), k("li", {
            key: y.id
          }, [
            g("span", null, [
              M($(y.label) + " ", 1),
              g("small", null, $(y.id), 1)
            ]),
            A(b(ae), {
              variant: "ghost",
              small: "",
              "aria-label": `Remove operator group ${y.label}`,
              onClick: (E) => p.value = p.value.filter((I) => I.id !== y.id)
            }, {
              default: z(() => [...m[8] || (m[8] = [
                M("Remove", -1)
              ])]),
              _: 1
            }, 8, ["aria-label", "onClick"])
          ]))), 128))
        ])) : O("", !0),
        g("label", Ps, [
          ft(g("input", {
            "onUpdate:modelValue": m[4] || (m[4] = (y) => u.value = y),
            type: "checkbox",
            "aria-label": "All component roots"
          }, null, 512), [
            [Lr, u.value]
          ]),
          m[9] || (m[9] = M("All component roots", -1))
        ]),
        u.value ? O("", !0) : (v(), D(b(je), {
          key: 1,
          label: "Component root",
          help: "The existing execution component UUID. Selection still requires administration of this root."
        }, {
          default: z(() => [
            A(b(He), {
              modelValue: s.value,
              "onUpdate:modelValue": m[5] || (m[5] = (y) => s.value = y),
              "aria-label": "Component root",
              placeholder: "Component UUID"
            }, null, 8, ["modelValue"]),
            s.value.trim() && !_.value ? (v(), k("small", Ts, "Enter a component UUID or choose all component roots.")) : O("", !0)
          ]),
          _: 1
        })),
        A(b(ae), {
          disabled: !T.value || f.value,
          loading: b(i),
          onClick: C
        }, {
          default: z(() => [...m[10] || (m[10] = [
            M("Save act-as grant", -1)
          ])]),
          _: 1
        }, 8, ["disabled", "loading"])
      ], 8, $s),
      b(a) && !b(i) ? (v(), k("div", Os, [
        m[12] || (m[12] = g("p", null, "The result is unconfirmed. Retry the same request before editing this grant.", -1)),
        A(b(ae), {
          onClick: b(n).submit
        }, {
          default: z(() => [...m[11] || (m[11] = [
            M("Retry act-as request", -1)
          ])]),
          _: 1
        }, 8, ["onClick"])
      ])) : O("", !0),
      b(o) ? (v(), D(b(ir), {
        key: 3,
        label: "Loading act-as grants…"
      })) : b(r).length ? (v(), k("table", As, [
        m[14] || (m[14] = g("caption", null, "Native act-as grants", -1)),
        m[15] || (m[15] = g("thead", null, [
          g("tr", null, [
            g("th", { scope: "col" }, "Execution account"),
            g("th", { scope: "col" }, "Component root"),
            g("th", { scope: "col" }, "Operator groups"),
            g("th", { scope: "col" }, "Status"),
            g("th", { scope: "col" }, "Actions")
          ])
        ], -1)),
        g("tbody", null, [
          (v(!0), k(fe, null, ve(b(r), (y) => (v(), k("tr", {
            key: y.policy_id
          }, [
            g("td", null, $(y.principal.id), 1),
            g("td", null, $(y.root === "*" ? "All component roots" : y.root), 1),
            g("td", null, $(y.groups.join(", ")), 1),
            g("td", null, $(y.active ? "Active" : "Revoked"), 1),
            g("td", null, [
              y.active ? (v(), D(b(ae), {
                key: 0,
                variant: "danger",
                small: "",
                disabled: f.value,
                "aria-label": `Revoke act-as grant for ${y.principal.id} at ${y.root}`,
                onClick: (E) => b(n).mutate("revoke", { principal: y.principal, root: y.root })
              }, {
                default: z(() => [...m[13] || (m[13] = [
                  M("Revoke", -1)
                ])]),
                _: 1
              }, 8, ["disabled", "aria-label", "onClick"])) : O("", !0)
            ])
          ]))), 128))
        ])
      ])) : b(l) ? O("", !0) : (v(), k("p", Es, "No act-as grants."))
    ]));
  }
}), Ls = ["draggable"], Ns = { class: "ks-pcard-row" }, zs = { class: "ks-pcard-body" }, Rs = { class: "ks-pcard-head" }, Vs = ["title"], Is = {
  key: 0,
  class: "ks-pcard-comment"
}, Ds = ["title"], Ms = ["aria-label"], Bs = {
  key: 0,
  class: "ks-pcard-detail"
}, Us = {
  key: 0,
  class: "ks-pcard-kv"
}, Hs = { class: "ks-pcard-kv" }, Ws = { class: "ks-pcard-kv" }, Fs = { class: "ks-pcard-tags" }, Ks = {
  key: 0,
  class: "ks-pcard-none"
}, qs = { class: "ks-pcard-kv" }, Ys = { class: "ks-pcard-tags" }, Gs = {
  key: 0,
  class: "ks-pcard-none"
}, St = /* @__PURE__ */ Z({
  __name: "PolicyCard",
  props: {
    policy: {},
    mode: {}
  },
  emits: ["add", "remove"],
  setup(e, { emit: t }) {
    const n = e, r = t, o = R(!1);
    function i(u) {
      n.mode === "locked" || !u.dataTransfer || (u.dataTransfer.setData("text/plain", n.policy.id), u.dataTransfer.effectAllowed = n.mode === "palette" ? "copy" : "move");
    }
    function l(u) {
      return u.includes(":") ? u.split(":").slice(-1)[0] : u;
    }
    function c(u) {
      return Array.isArray(u) ? u.map(String) : typeof u == "string" && u ? [u] : [];
    }
    const a = q(() => c(n.policy.actions)), d = q(() => c(n.policy.resources)), s = q(() => !!n.policy.effect || a.value.length > 0 || d.value.length > 0 || !!n.policy.surface);
    return (u, p) => (v(), k("div", {
      class: ie(["ks-pcard", [e.mode, { expanded: o.value }]]),
      draggable: e.mode !== "locked",
      onDragstart: i,
      onDblclick: p[3] || (p[3] = (f) => e.mode === "palette" && r("add"))
    }, [
      g("div", Ns, [
        e.mode === "locked" ? (v(), D(b(Y), {
          key: 0,
          icon: "tabler:lock",
          class: "ks-pcard-grip locked",
          "aria-hidden": "true"
        })) : (v(), D(b(Y), {
          key: 1,
          icon: "tabler:grip-vertical",
          class: "ks-pcard-grip",
          "aria-hidden": "true"
        })),
        g("div", zs, [
          g("div", Rs, [
            g("span", {
              class: "ks-pcard-title",
              title: e.policy.title || l(e.policy.id)
            }, $(e.policy.title || l(e.policy.id)), 9, Vs),
            e.policy.effect ? (v(), k("span", {
              key: 0,
              class: ie(["ks-eff", e.policy.effect])
            }, $(e.policy.effect), 3)) : O("", !0)
          ]),
          e.policy.comment ? (v(), k("div", Is, $(e.policy.comment), 1)) : O("", !0),
          g("div", {
            class: "ks-pcard-id",
            title: e.policy.id
          }, $(e.policy.id), 9, Ds)
        ]),
        s.value ? (v(), k("button", {
          key: 2,
          class: ie(["ks-pcard-act detail", { open: o.value }]),
          "aria-label": o.value ? "Hide details" : "Show details",
          onClick: p[0] || (p[0] = We((f) => o.value = !o.value, ["stop"]))
        }, [
          A(b(Y), {
            icon: "tabler:chevron-right",
            "aria-hidden": "true"
          })
        ], 10, Ms)) : O("", !0),
        e.mode === "palette" ? (v(), k("button", {
          key: 3,
          class: "ks-pcard-act add",
          "aria-label": "Add policy",
          onClick: p[1] || (p[1] = We((f) => r("add"), ["stop"]))
        }, [
          A(b(Y), {
            icon: "tabler:plus",
            "aria-hidden": "true"
          })
        ])) : e.mode === "selected" ? (v(), k("button", {
          key: 4,
          class: "ks-pcard-act remove",
          "aria-label": "Remove policy",
          onClick: p[2] || (p[2] = We((f) => r("remove"), ["stop"]))
        }, [
          A(b(Y), {
            icon: "tabler:x",
            "aria-hidden": "true"
          })
        ])) : O("", !0)
      ]),
      o.value ? (v(), k("div", Bs, [
        e.policy.surface || e.policy.intent ? (v(), k("div", Us, [
          p[4] || (p[4] = g("span", null, "Surface", -1)),
          g("code", null, $(e.policy.surface || e.policy.intent), 1)
        ])) : O("", !0),
        g("div", Hs, [
          p[5] || (p[5] = g("span", null, "Effect", -1)),
          g("code", {
            class: ie(["ks-eff-code", e.policy.effect])
          }, $(e.policy.effect || "—"), 3)
        ]),
        g("div", Ws, [
          p[6] || (p[6] = g("span", null, "Actions", -1)),
          g("div", Fs, [
            (v(!0), k(fe, null, ve(a.value, (f) => (v(), k("code", { key: f }, $(f), 1))), 128)),
            a.value.length ? O("", !0) : (v(), k("span", Ks, "—"))
          ])
        ]),
        g("div", qs, [
          p[7] || (p[7] = g("span", null, "Resources", -1)),
          g("div", Ys, [
            (v(!0), k(fe, null, ve(d.value, (f) => (v(), k("code", { key: f }, $(f), 1))), 128)),
            d.value.length ? O("", !0) : (v(), k("span", Gs, "—"))
          ])
        ])
      ])) : O("", !0)
    ], 42, Ls));
  }
}), Qs = { class: "ks" }, Js = {
  class: "ks-tabs",
  role: "tablist",
  "aria-label": "Security administration"
}, Zs = { class: "ks-rail-search" }, Xs = { class: "ks-rail-list" }, el = {
  key: 0,
  class: "ks-rail-group"
}, tl = ["onClick"], nl = { class: "ks-scope-name" }, rl = { class: "ks-scope-meta" }, ol = { class: "ks-scope-count" }, al = ["onClick"], il = { class: "ks-scope-name" }, sl = { class: "ks-scope-meta" }, ll = { class: "ks-scope-count" }, cl = {
  key: 0,
  class: "ks-builder"
}, dl = { class: "ks-builder-head" }, ul = { class: "ks-builder-title" }, pl = { class: "ks-builder-acts" }, ml = {
  key: 0,
  class: "ks-overlay-warn"
}, fl = { class: "ks-fields" }, vl = {
  key: 0,
  class: "ks-field-err"
}, gl = {
  key: 0,
  class: "ks-pane locked-pane"
}, hl = { class: "ks-pane-head" }, bl = { class: "ks-pane-sub" }, yl = { class: "ks-pane-body" }, xl = {
  key: 0,
  class: "ks-pane-empty"
}, kl = { class: "ks-pane" }, wl = { class: "ks-pane-search" }, _l = { class: "ks-pane-body" }, Sl = {
  key: 0,
  class: "ks-pane-empty"
}, $l = { class: "ks-pane-head" }, Cl = { class: "ks-pane-sub" }, Pl = { class: "ks-pane-body" }, Tl = ["onDrop"], Ol = {
  key: 0,
  class: "ks-drop-hint"
}, Al = {
  key: 1,
  class: "ks-view"
}, El = { class: "ks-builder-head" }, jl = { class: "ks-builder-title" }, Ll = { class: "ks-builder-acts" }, Nl = { class: "ks-view-note" }, zl = { class: "ks-view-id" }, Rl = { class: "ks-pane-body ks-view-list" }, Vl = { class: "ks-view-pol-title" }, Il = {
  key: 1,
  class: "ks-view-pol-comment"
}, Dl = { class: "ks-view-pol-id" }, Ml = {
  key: 0,
  class: "ks-pane-empty"
}, Bl = {
  key: 0,
  class: "ks-ext-block"
}, Ul = { class: "ks-ext-head" }, Hl = { class: "ks-pane-body ks-view-list" }, Wl = { class: "ks-view-pol-title" }, Fl = {
  key: 1,
  class: "ks-view-pol-comment"
}, Kl = { class: "ks-view-pol-id" }, ql = /* @__PURE__ */ Z({
  __name: "Security",
  setup(e) {
    const t = xs(), { scopes: n, policies: r, loading: o, saving: i, error: l } = t, c = R(""), a = R(""), d = R(null), s = R(null), u = R("scopes"), p = R(null), f = R(!1);
    async function _() {
      u.value = "delegations", f.value = !0, await zt(), await p.value?.load();
    }
    go(async () => {
      await t.load(), u.value === "delegations" && await p.value?.load();
    });
    const T = q(() => {
      const w = {};
      for (const x of r.value) w[x.id] = x;
      return w;
    }), S = q(() => {
      const w = c.value.trim().toLowerCase(), x = (h) => !w || h.label.toLowerCase().includes(w) || h.id.toLowerCase().includes(w);
      return {
        custom: n.value.filter((h) => h.source === "custom" && x(h)),
        builtin: n.value.filter((h) => h.source !== "custom" && x(h))
      };
    }), P = q(() => n.value.find((w) => w.id === d.value) || null), C = q(() => P.value && P.value.source !== "custom" ? P.value : null), j = q(() => {
      if (!s.value) return [];
      const w = /* @__PURE__ */ new Set([...s.value.policies, ...s.value.base.map((h) => h.id)]), x = a.value.trim().toLowerCase();
      return r.value.filter((h) => !w.has(h.id) && (!x || (h.title || "").toLowerCase().includes(x) || h.id.toLowerCase().includes(x) || (h.comment || "").toLowerCase().includes(x)));
    }), m = q(
      () => s.value ? s.value.policies.map((w) => T.value[w] || { id: w }) : []
    );
    function y(w) {
      d.value = w.id, s.value = w.source === "custom" ? { slug: w.slug || "", label: w.label, description: w.description, policies: w.policies.map((x) => x.id), enabled: w.enabled, isNew: !1, target: "", base: [] } : null;
    }
    function E() {
      d.value = null, s.value = { slug: "", label: "", description: "", policies: [], enabled: !0, isNew: !0, target: "", base: [] };
    }
    function I(w) {
      d.value = null, s.value = {
        slug: "",
        label: w.label ? `Copy of ${w.label}` : "",
        description: w.description,
        policies: [...w.policies.map((x) => x.id), ...(w.overlay_policies ?? []).map((x) => x.id)],
        enabled: !0,
        isNew: !0,
        target: "",
        base: []
      };
    }
    function ne(w) {
      return w.replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "");
    }
    function he(w) {
      d.value = w.id, s.value = {
        slug: w.overlay_slug || ne(w.id),
        label: w.label || oe(w.id),
        description: w.description,
        policies: (w.overlay_policies ?? []).map((x) => x.id),
        enabled: !0,
        isNew: !w.overlay_slug,
        target: w.id,
        base: w.policies
      };
    }
    const F = q(() => !!s.value && s.value.target !== "");
    function ce(w) {
      s.value && !s.value.policies.includes(w) && s.value.policies.push(w);
    }
    function _e(w) {
      s.value && (s.value.policies = s.value.policies.filter((x) => x !== w));
    }
    function Se(w) {
      const x = w.dataTransfer?.getData("text/plain");
      x && ce(x);
    }
    function be(w, x) {
      w.stopPropagation();
      const h = w.dataTransfer?.getData("text/plain");
      if (!h || !s.value || h === x) return;
      const X = s.value.policies, st = X.indexOf(h);
      st !== -1 && X.splice(st, 1);
      const lt = X.indexOf(x);
      X.splice(lt === -1 ? X.length : lt, 0, h);
    }
    const de = q(() => {
      if (!s.value || !s.value.isNew || s.value.target !== "") return "";
      const w = s.value.slug.trim();
      return w && !/^[a-z0-9][\w.-]*$/i.test(w) ? "Slug must be alphanumeric (with _.-)" : "";
    }), $e = q(() => !!s.value && s.value.slug.trim() !== "" && !de.value && s.value.policies.length > 0), re = R("");
    let ye = null;
    function Pe(w) {
      re.value = w, ye && clearTimeout(ye), ye = setTimeout(() => {
        re.value = "";
      }, 3e3);
    }
    async function ue() {
      if (!s.value || !$e.value) return;
      const w = s.value.slug.trim(), x = s.value.target, h = s.value.label.trim() || w;
      await t.saveScope({
        slug: w,
        target: x,
        label: s.value.label.trim(),
        description: s.value.description.trim(),
        policies: s.value.policies,
        enabled: s.value.enabled
      }) && (d.value = x || `kickside.security.scopes:${w}`, Pe(`Saved “${h}”. New scopes appear in user assignment after a moment.`));
    }
    async function le() {
      if (!s.value || s.value.isNew) return;
      const w = F.value;
      if (!await jn.confirm({
        header: w ? "Remove extension?" : "Delete scope?",
        message: w ? "The scope reverts to platform defaults. Users keep their base policies; only the added extensions are removed." : "This removes the custom scope and its projected security.scope entry.",
        icon: "tabler:trash",
        acceptLabel: w ? "Remove extension" : "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      })) return;
      await t.deleteScope(s.value.slug) && (s.value = null, d.value = null);
    }
    function pe(w) {
      return w === "custom" ? "" : w === "builtin" ? "info" : "secondary";
    }
    function oe(w) {
      return w.includes(":") ? w.split(":").slice(-1)[0] : w;
    }
    return (w, x) => (v(), k("div", Qs, [
      g("div", Js, [
        A(b(ae), {
          role: "tab",
          "aria-selected": u.value === "scopes",
          onClick: x[0] || (x[0] = (h) => u.value = "scopes")
        }, {
          default: z(() => [...x[13] || (x[13] = [
            M("Scopes", -1)
          ])]),
          _: 1
        }, 8, ["aria-selected"]),
        A(b(ae), {
          role: "tab",
          "data-tab": "delegations",
          "aria-selected": u.value === "delegations",
          onClick: _
        }, {
          default: z(() => [...x[14] || (x[14] = [
            M("Act-as grants", -1)
          ])]),
          _: 1
        }, 8, ["aria-selected"])
      ]),
      f.value ? ft((v(), D(js, {
        key: 0,
        ref_key: "delegationPanel",
        ref: p
      }, null, 512)), [
        [Ht, u.value === "delegations"]
      ]) : O("", !0),
      b(l) ? (v(), D(b(yt), {
        key: 1,
        severity: "danger",
        class: "ks-top-notice",
        onDismiss: x[1] || (x[1] = (h) => l.value = "")
      }, {
        default: z(() => [
          M($(b(l)), 1)
        ]),
        _: 1
      })) : re.value ? (v(), D(b(yt), {
        key: 2,
        severity: "success",
        class: "ks-top-notice",
        onDismiss: x[2] || (x[2] = (h) => re.value = "")
      }, {
        default: z(() => [
          M($(re.value), 1)
        ]),
        _: 1
      })) : O("", !0),
      u.value === "scopes" && b(o) && !b(n).length ? (v(), D(b(ir), {
        key: 3,
        label: "Loading security…"
      })) : ft((v(), D(b(di), { key: 4 }, {
        rail: z(() => [
          A(b(vi), {
            title: "Scopes",
            count: b(n).length
          }, {
            actions: z(() => [
              A(b(Cn), {
                icon: "tabler:plus",
                label: "New scope",
                disabled: b(i),
                onClick: E
              }, null, 8, ["disabled"]),
              A(b(Cn), {
                icon: "tabler:refresh",
                label: "Refresh",
                disabled: b(o),
                spin: b(o),
                onClick: b(t).load
              }, null, 8, ["disabled", "spin", "onClick"])
            ]),
            _: 1
          }, 8, ["count"]),
          g("div", Zs, [
            A(b(Pn), {
              modelValue: c.value,
              "onUpdate:modelValue": x[3] || (x[3] = (h) => c.value = h),
              placeholder: "Filter scopes…"
            }, null, 8, ["modelValue"])
          ]),
          g("div", Xs, [
            S.value.custom.length ? (v(), k("div", el, "Custom")) : O("", !0),
            (v(!0), k(fe, null, ve(S.value.custom, (h) => (v(), k("button", {
              key: h.id,
              class: ie(["ks-scope-row", { active: h.id === d.value }]),
              onClick: (X) => y(h)
            }, [
              g("span", nl, $(h.label || oe(h.id)), 1),
              g("span", rl, [
                A(b(Be), {
                  severity: pe(h.source)
                }, {
                  default: z(() => [
                    M($(h.source), 1)
                  ]),
                  _: 2
                }, 1032, ["severity"]),
                g("span", ol, $(h.policies.length), 1)
              ])
            ], 10, tl))), 128)),
            x[15] || (x[15] = g("div", { class: "ks-rail-group" }, "Built-in", -1)),
            (v(!0), k(fe, null, ve(S.value.builtin, (h) => (v(), k("button", {
              key: h.id,
              class: ie(["ks-scope-row", { active: h.id === d.value }]),
              onClick: (X) => y(h)
            }, [
              g("span", il, $(h.label || oe(h.id)), 1),
              g("span", sl, [
                A(b(Be), {
                  severity: pe(h.source)
                }, {
                  default: z(() => [
                    M($(h.source), 1)
                  ]),
                  _: 2
                }, 1032, ["severity"]),
                g("span", ll, $(h.policies.length), 1)
              ])
            ], 10, al))), 128))
          ])
        ]),
        default: z(() => [
          s.value ? (v(), k("div", cl, [
            g("div", dl, [
              g("div", ul, [
                A(b(Y), {
                  icon: F.value ? "tabler:stack-2" : "tabler:shield-lock",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                g("span", null, $(F.value ? `Extend ${s.value.label || oe(s.value.target)}` : s.value.isNew ? "New scope" : s.value.label || s.value.slug), 1),
                F.value ? (v(), D(b(Be), {
                  key: 0,
                  severity: "warn"
                }, {
                  default: z(() => [...x[16] || (x[16] = [
                    M("overlay", -1)
                  ])]),
                  _: 1
                })) : O("", !0)
              ]),
              g("div", pl, [
                !s.value.isNew && !F.value && P.value ? (v(), D(b(ae), {
                  key: 0,
                  variant: "soft",
                  small: "",
                  icon: "tabler:copy",
                  disabled: b(i),
                  onClick: x[4] || (x[4] = (h) => I(P.value))
                }, {
                  default: z(() => [...x[17] || (x[17] = [
                    M("Duplicate", -1)
                  ])]),
                  _: 1
                }, 8, ["disabled"])) : O("", !0),
                s.value.isNew ? O("", !0) : (v(), D(b(ae), {
                  key: 1,
                  variant: "danger",
                  small: "",
                  icon: "tabler:trash",
                  disabled: b(i),
                  onClick: le
                }, {
                  default: z(() => [
                    M($(F.value ? "Remove extension" : "Delete"), 1)
                  ]),
                  _: 1
                }, 8, ["disabled"])),
                A(b(ae), {
                  variant: "primary",
                  small: "",
                  icon: "tabler:device-floppy",
                  loading: b(i),
                  disabled: !$e.value,
                  onClick: ue
                }, {
                  default: z(() => [
                    M($(F.value ? "Save extension" : "Save scope"), 1)
                  ]),
                  _: 1
                }, 8, ["loading", "disabled"])
              ])
            ]),
            F.value ? (v(), k("div", ml, [
              A(b(Y), {
                icon: "tabler:alert-triangle",
                "aria-hidden": "true"
              }),
              g("span", null, [
                x[18] || (x[18] = M("Extending a platform scope grants the added policies to ", -1)),
                g("b", null, "every user with the " + $(oe(s.value.target)) + " role", 1),
                x[19] || (x[19] = M(". Base policies stay in place — extensions only add access, they can't remove it.", -1))
              ])
            ])) : O("", !0),
            g("div", fl, [
              F.value ? (v(), D(b(je), {
                key: 1,
                label: "Extends"
              }, {
                default: z(() => [
                  A(b(He), {
                    "model-value": s.value.target,
                    disabled: ""
                  }, null, 8, ["model-value"])
                ]),
                _: 1
              })) : (v(), D(b(je), {
                key: 0,
                label: "Slug",
                help: s.value.isNew ? "Lowercase id; cannot change later." : void 0
              }, {
                default: z(() => [
                  A(b(He), {
                    modelValue: s.value.slug,
                    "onUpdate:modelValue": x[5] || (x[5] = (h) => s.value.slug = h),
                    disabled: !s.value.isNew,
                    placeholder: "reviewer"
                  }, null, 8, ["modelValue", "disabled"]),
                  de.value ? (v(), k("span", vl, $(de.value), 1)) : O("", !0)
                ]),
                _: 1
              }, 8, ["help"])),
              A(b(je), { label: "Label" }, {
                default: z(() => [
                  A(b(He), {
                    modelValue: s.value.label,
                    "onUpdate:modelValue": x[6] || (x[6] = (h) => s.value.label = h),
                    placeholder: "Reviewer"
                  }, null, 8, ["modelValue"])
                ]),
                _: 1
              }),
              A(b(je), { label: "Description" }, {
                default: z(() => [
                  A(b(He), {
                    modelValue: s.value.description,
                    "onUpdate:modelValue": x[7] || (x[7] = (h) => s.value.description = h),
                    placeholder: "Read-only reviewer role"
                  }, null, 8, ["modelValue"])
                ]),
                _: 1
              })
            ]),
            g("div", {
              class: ie(["ks-panes", { three: F.value }])
            }, [
              F.value ? (v(), k("section", gl, [
                g("header", hl, [
                  x[20] || (x[20] = g("span", null, "Base policies", -1)),
                  g("span", bl, $(s.value.base.length) + " · locked", 1)
                ]),
                g("div", yl, [
                  (v(!0), k(fe, null, ve(s.value.base, (h) => (v(), D(St, {
                    key: h.id,
                    policy: h,
                    mode: "locked"
                  }, null, 8, ["policy"]))), 128)),
                  s.value.base.length ? O("", !0) : (v(), k("div", xl, "No base policies."))
                ])
              ])) : O("", !0),
              g("section", kl, [
                x[21] || (x[21] = g("header", { class: "ks-pane-head" }, [
                  g("span", null, "Available policies"),
                  g("span", { class: "ks-pane-sub" }, "public only · drag or click +")
                ], -1)),
                g("div", wl, [
                  A(b(Pn), {
                    modelValue: a.value,
                    "onUpdate:modelValue": x[8] || (x[8] = (h) => a.value = h),
                    placeholder: "Search policies…"
                  }, null, 8, ["modelValue"])
                ]),
                g("div", _l, [
                  (v(!0), k(fe, null, ve(j.value, (h) => (v(), D(St, {
                    key: h.id,
                    policy: h,
                    mode: "palette",
                    onAdd: (X) => ce(h.id)
                  }, null, 8, ["policy", "onAdd"]))), 128)),
                  j.value.length ? O("", !0) : (v(), k("div", Sl, "No matching public policies."))
                ])
              ]),
              g("section", {
                class: "ks-pane drop",
                onDragover: x[10] || (x[10] = We(() => {
                }, ["prevent"])),
                onDrop: Se
              }, [
                g("header", $l, [
                  g("span", null, $(F.value ? "Added by you" : "In this scope"), 1),
                  g("span", Cl, $(s.value.policies.length) + " " + $(s.value.policies.length === 1 ? "policy" : "policies"), 1)
                ]),
                g("div", Pl, [
                  (v(!0), k(fe, null, ve(m.value, (h) => (v(), k("div", {
                    key: h.id,
                    onDragover: x[9] || (x[9] = We(() => {
                    }, ["prevent"])),
                    onDrop: (X) => be(X, h.id)
                  }, [
                    A(St, {
                      policy: h,
                      mode: "selected",
                      onRemove: (X) => _e(h.id)
                    }, null, 8, ["policy", "onRemove"])
                  ], 40, Tl))), 128)),
                  s.value.policies.length ? O("", !0) : (v(), k("div", Ol, [
                    A(b(Y), {
                      icon: "tabler:drag-drop",
                      "aria-hidden": "true"
                    }),
                    g("span", null, $(F.value ? "Drag policies here to extend this scope." : "Drag policies here to grant them to this scope."), 1)
                  ]))
                ])
              ], 32)
            ], 2)
          ])) : C.value ? (v(), k("div", Al, [
            g("div", El, [
              g("div", jl, [
                A(b(Y), {
                  icon: "tabler:shield",
                  "aria-hidden": "true"
                }),
                g("span", null, $(C.value.label || oe(C.value.id)), 1),
                A(b(Be), {
                  severity: pe(C.value.source)
                }, {
                  default: z(() => [
                    M($(C.value.source), 1)
                  ]),
                  _: 1
                }, 8, ["severity"])
              ]),
              g("div", Ll, [
                A(b(ae), {
                  variant: "primary",
                  small: "",
                  icon: "tabler:stack-2",
                  onClick: x[11] || (x[11] = (h) => he(C.value))
                }, {
                  default: z(() => [
                    M($(C.value.overlay_slug ? "Edit extension" : "Extend scope"), 1)
                  ]),
                  _: 1
                }),
                A(b(ae), {
                  variant: "soft",
                  small: "",
                  icon: "tabler:copy",
                  onClick: x[12] || (x[12] = (h) => I(C.value))
                }, {
                  default: z(() => [...x[22] || (x[22] = [
                    M("Copy to custom scope", -1)
                  ])]),
                  _: 1
                })
              ])
            ]),
            g("p", Nl, [
              M($(C.value.source === "builtin" ? "Built-in role — composed from the policies that list its group. You can extend it (add policies) via an overlay; base policies can only change in the owning package." : "Registry-declared scope.") + " ", 1),
              g("span", zl, $(C.value.id), 1)
            ]),
            g("div", Rl, [
              (v(!0), k(fe, null, ve(C.value.policies, (h) => (v(), k("div", {
                key: h.id,
                class: "ks-view-pol"
              }, [
                g("span", Vl, $(h.title || oe(h.id)), 1),
                h.effect ? (v(), k("span", {
                  key: 0,
                  class: ie(["ks-eff", h.effect])
                }, $(h.effect), 3)) : O("", !0),
                h.comment ? (v(), k("div", Il, $(h.comment), 1)) : O("", !0),
                g("div", Dl, $(h.id), 1)
              ]))), 128)),
              C.value.policies.length ? O("", !0) : (v(), k("div", Ml, "No policies in this scope."))
            ]),
            C.value.overlay_policies && C.value.overlay_policies.length ? (v(), k("div", Bl, [
              g("div", Ul, [
                A(b(Y), {
                  icon: "tabler:stack-2",
                  "aria-hidden": "true"
                }),
                x[23] || (x[23] = g("span", null, "Extensions", -1)),
                A(b(Be), { severity: "warn" }, {
                  default: z(() => [
                    M("overlay · " + $(C.value.overlay_policies.length), 1)
                  ]),
                  _: 1
                })
              ]),
              g("div", Hl, [
                (v(!0), k(fe, null, ve(C.value.overlay_policies, (h) => (v(), k("div", {
                  key: h.id,
                  class: "ks-view-pol"
                }, [
                  g("span", Wl, $(h.title || oe(h.id)), 1),
                  h.effect ? (v(), k("span", {
                    key: 0,
                    class: ie(["ks-eff", h.effect])
                  }, $(h.effect), 3)) : O("", !0),
                  h.comment ? (v(), k("div", Fl, $(h.comment), 1)) : O("", !0),
                  g("div", Kl, $(h.id), 1)
                ]))), 128))
              ])
            ])) : O("", !0)
          ])) : (v(), D(b(vs), {
            key: 2,
            icon: "tabler:shield-lock",
            title: "Scopes & roles",
            hint: "Select a scope to inspect it, or create a custom scope by composing public policies.",
            cta: "New scope",
            "cta-icon": "tabler:plus",
            onCta: E
          }))
        ]),
        _: 1
      }, 512)), [
        [Ht, u.value === "scopes"]
      ])
    ]));
  }
}), Yl = ':root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}.kx-tag-sm,.kx-tag-sm.kx-tag-sm{display:inline-flex;align-items:center;gap:4px;padding:1px 7px;border-radius:var(--kx-radius-tag, 6px);font-size:10.5px;font-weight:600;line-height:1.5;white-space:nowrap}.kx-tag-sm svg,.kx-tag-sm.kx-tag-sm svg{width:12px;height:12px}.kx-tag-caps,.kx-tag-caps.kx-tag-caps{display:inline-flex;align-items:center;gap:3px;padding:2px 6px;border-radius:var(--kx-radius-tag, 6px);font-size:9px;font-weight:700;line-height:1.5;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap}.kx-tag-caps svg,.kx-tag-caps.kx-tag-caps svg{width:11px;height:11px}:host,:root{--kx-surface-1: color-mix(in srgb, var(--p-content-background) 96%, var(--p-text-color) 4%);--kx-surface-2: color-mix(in srgb, var(--p-content-background) 92%, var(--p-text-color) 8%);--kx-surface-3: color-mix(in srgb, var(--p-content-background) 86%, var(--p-text-color) 14%);--kx-surface-4: color-mix(in srgb, var(--p-content-background) 78%, var(--p-text-color) 22%);--kx-border-strong: color-mix(in srgb, var(--p-content-border-color) 60%, var(--p-text-color) 40%);--kx-border-stronger: color-mix(in srgb, var(--p-content-border-color) 30%, var(--p-text-color) 70%);--kx-text-faint: color-mix(in srgb, var(--p-text-muted-color) 70%, var(--p-content-background) 30%);--kx-text-fainter: color-mix(in srgb, var(--p-text-muted-color) 45%, var(--p-content-background) 55%);--kx-wash-primary: color-mix(in srgb, var(--p-primary-color) 12%, var(--p-content-background) 88%);--kx-wash-success: color-mix(in srgb, var(--p-success-500) 12%, var(--p-content-background) 88%);--kx-wash-info: color-mix(in srgb, var(--p-info-500) 12%, var(--p-content-background) 88%);--kx-wash-warn: color-mix(in srgb, var(--p-warn-500) 12%, var(--p-content-background) 88%);--kx-wash-danger: color-mix(in srgb, var(--p-danger-500) 12%, var(--p-content-background) 88%);--kx-wash-help: color-mix(in srgb, var(--p-help-500) 12%, var(--p-content-background) 88%);--kx-font-heading: "Outfit", system-ui, sans-serif;--kx-font-body: "Inter", system-ui, sans-serif;--kx-radius-4: 4px;--kx-radius-6: 6px;--kx-radius-8: 8px;--kx-radius-10: 10px;--kx-radius-14: 14px;--kx-radius-16: 16px;--kx-radius-tag: var(--p-content-border-radius, 6px);--kx-control-height: 34px;--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .08);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .12);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .18);--kx-overlay-hover: color-mix(in srgb, var(--p-text-color) 7%, transparent);--kx-overlay-subtle: color-mix(in srgb, var(--p-text-color) 4%, transparent)}@media(prefers-color-scheme:dark){:host(:not(.w-theme-light)),:root:not(.w-theme-light){--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .35);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .45);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .6)}}:host(.w-theme-dark),:root.w-theme-dark{--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .35);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .45);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .6)}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}:host{display:block;height:100%;min-height:0;--km-rail-w: 296px;--system-surface-gutter: var(--kickside-system-surface-gutter, 24px)}:host>div{height:100%;min-height:0}*,*:before,*:after{box-sizing:border-box}.km{height:100%;min-height:0;display:flex;flex-direction:column;background:var(--p-content-background);color:var(--p-text-color);font-family:inherit}.km-top-notice{width:calc(100% - (var(--system-surface-gutter) * 2));margin:12px 0 0 var(--system-surface-gutter)}.km-shell{flex:1;min-height:0;width:100%;margin:0;display:grid;grid-template-columns:var(--km-rail-w) minmax(0,1fr);border-left:1px solid var(--p-content-border-color);border-right:1px solid var(--p-content-border-color)}.km-rail{min-width:0;min-height:0;display:flex;flex-direction:column;border-right:1px solid var(--p-content-border-color)}.km-rail-body{flex:1;min-height:0;overflow:auto;padding:6px}.km-main{min-width:0;min-height:0;display:flex;flex-direction:column;overflow:hidden}.km-railhead{flex:0 0 auto;display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:48px;padding:0 8px 0 14px;border-bottom:1px solid var(--p-content-border-color)}.km-railhead-title{display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:760;letter-spacing:.03em;text-transform:uppercase;color:var(--p-text-muted-color)}.km-railhead-title b{min-width:18px;padding:1px 6px;border-radius:999px;background:var(--kx-overlay-subtle);color:var(--p-text-color);font-size:11px;font-weight:700;text-align:center}.km-railhead-acts{display:inline-flex;align-items:center;gap:2px}.km-input{width:100%;min-width:0;height:34px;padding:0 10px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);background:var(--p-content-background);color:var(--p-text-color);font:inherit;font-size:13px}.km-input:read-only{color:var(--p-text-muted-color);background:var(--kx-overlay-subtle)}.km-input:disabled{opacity:.6}.km-input.mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}.km-textarea{height:auto;min-height:120px;padding:9px 10px;line-height:1.45;resize:vertical}.km-search{position:relative;display:flex;align-items:center;min-width:0}.km-search-ico{position:absolute;left:9px;width:16px;height:16px;color:var(--p-text-muted-color);pointer-events:none}.km-search-input{width:100%;height:34px;padding:0 30px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);background:var(--p-content-background);color:var(--p-text-color);font:inherit;font-size:13px}.km-search-clear{position:absolute;right:6px;width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:6px;background:transparent;color:var(--p-text-muted-color);cursor:pointer}.km-search-clear:hover{color:var(--p-text-color);background:var(--kx-overlay-hover)}.km-search-clear svg{width:14px;height:14px}.km-select{position:relative;min-width:0;display:flex}.km-select-el{width:100%;height:34px;padding:0 30px 0 10px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);background:var(--p-content-background);color:var(--p-text-color);font:inherit;font-size:13px;cursor:pointer;appearance:none}.km-select-chev{position:absolute;right:9px;top:50%;transform:translateY(-50%);width:15px;height:15px;color:var(--p-text-muted-color);pointer-events:none}.km-field{min-width:0;display:flex;flex-direction:column;gap:5px}.km-field-label{color:var(--p-text-muted-color);font-size:11.5px;font-weight:680}.km-field-help{color:var(--p-text-muted-color);font-size:11.5px;line-height:1.35}.km-pill{max-width:190px;overflow:hidden;text-overflow:ellipsis}.km-pill-dot{width:6px;height:6px;border-radius:50%;background:currentColor}.km-notice{display:flex;align-items:center;gap:9px;padding:9px 10px 9px 12px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);font-size:13px}.km-notice svg{width:17px;height:17px;flex:0 0 auto}.km-notice-text{flex:1;min-width:0}.km-notice.is-info{color:var(--p-text-color);background:var(--kx-overlay-subtle)}.km-notice.is-danger{color:var(--p-danger-600, var(--p-danger-500));border-color:color-mix(in srgb,var(--p-danger-500) 32%,var(--p-content-border-color));background:color-mix(in srgb,var(--p-danger-500) 9%,transparent)}.km-notice.is-success{color:var(--p-success-700);border-color:color-mix(in srgb,var(--p-success-500) 36%,var(--p-content-border-color));background:color-mix(in srgb,var(--p-success-500) 12%,transparent)}.km-notice-x{width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:6px;background:transparent;color:inherit;cursor:pointer;opacity:.7}.km-notice-x:hover{opacity:1;background:color-mix(in srgb,currentColor 12%,transparent)}.km-notice-x svg{width:14px;height:14px}.km-loading{display:flex;align-items:center;justify-content:center;gap:9px;padding:40px 20px;color:var(--p-text-muted-color);font-size:13px}.km-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:48px 24px;text-align:center}.km-empty-ico{width:30px;height:30px;color:var(--p-text-muted-color)}.km-empty-title{font-size:14px;font-weight:720}.km-empty-hint{margin:0;max-width:340px;color:var(--p-text-muted-color);font-size:12.5px;line-height:1.45}.km-empty .p-button{margin-top:4px}.km-plist{display:flex;flex-direction:column;gap:2px}.km-plist-all{width:100%;height:32px;display:flex;align-items:center;padding:0 10px;border:0;border-radius:var(--kx-radius-8);background:transparent;color:var(--p-text-muted-color);font:inherit;font-size:12.5px;font-weight:640;text-align:left;cursor:pointer}.km-plist-all:hover{background:var(--kx-overlay-hover);color:var(--p-text-color)}.km-plist-all.on{background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);color:var(--p-primary-color)}.km-plist-empty{display:flex;flex-direction:column;align-items:flex-start;gap:8px;padding:10px;color:var(--p-text-muted-color);font-size:12.5px}.km-plist-empty p{margin:0}.km-picker{display:flex;flex-direction:column;gap:18px}.km-picker-sec{display:flex;flex-direction:column;gap:7px}.km-picker-sec-title{color:var(--p-text-muted-color);font-size:11px;font-weight:760;letter-spacing:.03em;text-transform:uppercase}.km-picker-list{display:flex;flex-direction:column;gap:4px}.km-picker-item{display:grid;grid-template-columns:32px minmax(0,1fr) 16px;align-items:center;gap:11px;padding:9px 10px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);background:transparent;color:var(--p-text-color);font:inherit;text-align:left;cursor:pointer;transition:border-color .12s ease,background-color .12s ease}.km-picker-item:hover{border-color:color-mix(in srgb,var(--p-primary-color) 50%,var(--p-content-border-color));background:var(--kx-overlay-hover)}.km-picker-ico{width:32px;height:32px;display:inline-flex;align-items:center;justify-content:center;border-radius:var(--kx-radius-8);color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 11%,transparent)}.km-picker-ico svg{width:18px;height:18px}.km-picker-body{min-width:0;display:flex;flex-direction:column;gap:2px}.km-picker-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;font-weight:660}.km-picker-desc{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--p-text-muted-color);font-size:11.5px}.km-picker-go{width:16px;height:16px;color:var(--p-text-muted-color)}.km-form{display:flex;flex-direction:column;gap:16px}.km-editor-head{display:flex;align-items:center;gap:11px}.km-editor-head-text{min-width:0}.km-editor-head-title{font-size:14px;font-weight:740}.km-editor-head-sub{margin-top:2px;color:var(--p-text-muted-color);font-size:12px;line-height:1.4}.km-form-sec{display:flex;flex-direction:column;gap:10px}.km-form-sec+.km-form-sec{padding-top:16px;border-top:1px solid var(--p-content-border-color)}.km-form-sec-title{color:var(--p-text-muted-color);font-size:11px;font-weight:760;letter-spacing:.03em;text-transform:uppercase}.km-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}.km-form-grid.four{grid-template-columns:repeat(4,minmax(0,1fr))}.km-form-foot{position:sticky;bottom:-16px;display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px;margin:0 -16px -16px;padding:14px 16px;border-top:1px solid var(--p-content-border-color);background:var(--p-content-background)}.km-form-id{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11.5px;color:var(--p-text-muted-color)}.km-form-foot-sp{flex:1}.km-adv-toggle{display:inline-flex;align-items:center;gap:6px;padding:0;border:0;background:transparent;color:var(--p-text-muted-color);font:inherit;font-size:11px;font-weight:760;letter-spacing:.03em;text-transform:uppercase;cursor:pointer}.km-adv-toggle:hover{color:var(--p-text-color)}.km-adv-chev{width:14px;height:14px;transition:transform .15s ease}.km-adv-toggle.open .km-adv-chev{transform:rotate(90deg)}.km-adv-body{display:flex;flex-direction:column;gap:10px;margin-top:10px}.km-test-result{display:flex;align-items:center;gap:8px;padding:8px 11px;border-radius:var(--kx-radius-8);font-size:12.5px}.km-test-result svg{width:16px;height:16px;flex:0 0 auto}.km-test-result span{min-width:0;overflow-wrap:anywhere}.km-test-result.testing{color:var(--p-text-muted-color);background:var(--kx-overlay-subtle)}.km-test-result.ok{color:var(--p-success-600, var(--p-success-500));background:color-mix(in srgb,var(--p-success-500) 12%,transparent)}.km-test-result.fail{color:var(--p-danger-600, var(--p-danger-500));background:color-mix(in srgb,var(--p-danger-500) 10%,transparent)}.km-probe{border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);font-size:13px}.km-probe.ok{border-color:color-mix(in srgb,var(--p-success-500) 30%,var(--p-content-border-color));background:color-mix(in srgb,var(--p-success-500) 8%,transparent)}.km-probe.fail{border-color:color-mix(in srgb,var(--p-danger-500) 30%,var(--p-content-border-color));background:color-mix(in srgb,var(--p-danger-500) 8%,transparent)}.km-probe-head{display:flex;flex-wrap:wrap;align-items:center;gap:9px;padding:9px 10px 9px 12px}.km-probe-head>svg{width:17px;height:17px;flex:0 0 auto}.km-probe.ok .km-probe-head>svg{color:var(--p-success-600, var(--p-success-500))}.km-probe.fail .km-probe-head>svg{color:var(--p-danger-600, var(--p-danger-500))}.km-probe-msg{flex:1;min-width:0}.km-probe-time{flex:0 0 auto;padding:1px 7px;border-radius:var(--kx-radius-tag);background:var(--kx-overlay-subtle);color:var(--p-text-muted-color);font-size:11px;font-weight:700;font-variant-numeric:tabular-nums}.km-probe-adv-btn{flex:0 0 auto}.km-probe-x{width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;border:0;border-radius:6px;background:transparent;color:var(--p-text-muted-color);cursor:pointer;opacity:.7}.km-probe-x:hover{opacity:1;background:color-mix(in srgb,currentColor 12%,transparent)}.km-probe-x svg{width:14px;height:14px}.km-probe-adv{display:flex;flex-direction:column;gap:10px;padding:10px 12px 12px;border-top:1px solid var(--p-content-border-color)}.km-probe-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:6px 16px}.km-probe-kv{display:flex;align-items:baseline;gap:8px;min-width:0}.km-probe-kv span{flex:0 0 96px;color:var(--p-text-muted-color);font-size:11.5px}.km-probe-kv code{min-width:0;overflow:hidden;text-overflow:ellipsis;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11.5px}.km-probe-tokens{display:flex;flex-wrap:wrap;align-items:center;gap:6px}.km-probe-tokens-l{color:var(--p-text-muted-color);font-size:11.5px;margin-right:2px}.km-probe-tok{padding:1px 8px;border-radius:var(--kx-radius-tag);background:var(--kx-overlay-subtle);color:var(--p-text-muted-color);font-size:11px;font-variant-numeric:tabular-nums}.km-probe-tok b{color:var(--p-text-color);font-weight:700}.km-probe-out{display:flex;flex-direction:column;gap:4px}.km-probe-out span{color:var(--p-text-muted-color);font-size:11.5px;font-weight:700}.km-probe-out pre{margin:0;max-height:160px;overflow:auto;padding:9px 10px;border-radius:6px;background:var(--kx-overlay-subtle);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11.5px;line-height:1.45;white-space:pre-wrap;word-break:break-word}.km-tabs{flex:0 0 auto;display:flex;gap:2px;padding:0 12px;border-bottom:1px solid var(--p-content-border-color)}.km-tab{position:relative;display:inline-flex;align-items:center;gap:7px;height:44px;padding:0 12px;border:0;background:transparent;color:var(--p-text-muted-color);font:inherit;font-size:13px;font-weight:700;cursor:pointer}.km-tab:hover,.km-tab.on{color:var(--p-text-color)}.km-tab.on:after{content:"";position:absolute;left:8px;right:8px;bottom:-1px;height:2px;border-radius:2px 2px 0 0;background:var(--p-primary-color)}.km-tab b{min-width:18px;padding:0 6px;border-radius:999px;background:var(--kx-overlay-subtle);color:var(--p-text-muted-color);font-size:11px;font-weight:700;text-align:center}.km-tab.on b{background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.km-classes{flex:1;min-height:0;display:flex;flex-direction:column}.km-classes-list{display:flex;flex-direction:column;gap:10px;padding:14px 16px}.km-class{flex:0 0 auto;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);overflow:hidden}.km-class-head{display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--kx-overlay-subtle);border-bottom:1px solid var(--p-content-border-color)}.km-class-head-text{flex:1;min-width:0}.km-class-title{display:flex;align-items:center;gap:8px;font-size:13.5px;font-weight:720}.km-class-ref{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;font-weight:600;color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);padding:1px 6px;border-radius:6px}.km-class-desc{margin-top:3px;color:var(--p-text-muted-color);font-size:12px;line-height:1.4}.km-class-meta{display:flex;align-items:center;gap:8px;flex:0 0 auto}.km-class-count{color:var(--p-text-muted-color);font-size:11.5px;white-space:nowrap}.km-class-members{display:flex;flex-direction:column}.km-class-member{display:grid;grid-template-columns:58px minmax(0,1.2fr) minmax(0,1fr) auto;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid var(--p-content-border-color)}.km-class-member:last-child{border-bottom:0}.km-class-member.top{background:color-mix(in srgb,var(--p-success-500) 6%,transparent)}.km-class-rank{width:20px;height:20px;display:inline-flex;align-items:center;justify-content:center;border-radius:6px;background:var(--kx-overlay-subtle);color:var(--p-text-muted-color);font-size:11px;font-weight:700}.km-class-member-name{font-size:13px;font-weight:620;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.km-class-member-id{color:var(--p-text-muted-color);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.km-class-member-pri{color:var(--p-text-muted-color);font-size:11px;justify-self:end;white-space:nowrap}.km-class-empty{padding:12px;color:var(--p-text-muted-color);font-size:12px}@media(max-width:860px){.km-shell{grid-template-columns:1fr;grid-template-rows:auto minmax(0,1fr)}.km-rail{border-right:0;border-bottom:1px solid var(--p-content-border-color);max-height:40vh}.km-form-grid,.km-form-grid.four{grid-template-columns:1fr}.km-class-member{grid-template-columns:auto minmax(0,1fr) auto}.km-class-member-id{display:none}}@media(max-width:560px){.km-probe-grid{grid-template-columns:1fr}}.ks{height:100%;display:flex;flex-direction:column}.ks-top-notice{margin:8px}.ks-rail-search{padding:8px 10px}.ks-rail-list{padding:0 8px 10px;overflow-y:auto}.ks-rail-group{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--p-text-muted-color);padding:10px 6px 4px}.ks-scope-row{width:100%;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;border:none;border-radius:var(--kx-radius-8);background:transparent;cursor:pointer;text-align:left;color:var(--p-text-color);transition:background .12s;font:inherit}.ks-scope-row:hover{background:var(--kx-overlay-hover)}.ks-scope-row.active{background:color-mix(in srgb,var(--p-primary-color) 14%,transparent)}.ks-scope-name{font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ks-scope-meta{flex:none;display:flex;align-items:center;gap:6px}.ks-scope-count{font-size:11px;font-weight:700;color:var(--p-text-muted-color);min-width:18px;text-align:right}.ks-builder,.ks-view{display:flex;flex-direction:column;height:100%;min-height:0;padding:14px 16px;gap:14px}.ks-builder-head{display:flex;align-items:center;justify-content:space-between;gap:12px}.ks-builder-title{display:flex;align-items:center;gap:8px;font-size:16px;font-weight:700;color:var(--p-text-color)}.ks-builder-acts{display:flex;gap:8px}.ks-fields{display:grid;grid-template-columns:220px 1fr 1fr;gap:12px}.ks-field-err{display:block;margin-top:4px;font-size:11px;color:var(--p-danger-500)}.ks-panes{flex:1;min-height:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.ks-pane{display:flex;flex-direction:column;min-height:0;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);background:var(--kx-overlay-subtle)}.ks-pane.drop{border-style:dashed}.ks-pane-head{display:flex;align-items:baseline;justify-content:space-between;gap:8px;padding:10px 12px 8px;font-size:13px;font-weight:700;color:var(--p-text-color)}.ks-pane-sub{font-size:11px;font-weight:500;color:var(--p-text-muted-color)}.ks-pane-search{padding:0 10px 8px}.ks-pane-body{flex:1;min-height:0;overflow-y:auto;padding:4px 10px 10px;display:flex;flex-direction:column;gap:8px}.ks-pane-empty{padding:16px 8px;font-size:12px;color:var(--p-text-muted-color);text-align:center}.ks-drop-hint{margin:auto;display:flex;flex-direction:column;align-items:center;gap:8px;padding:24px;color:var(--p-text-muted-color);font-size:13px;text-align:center}.ks-drop-hint svg{font-size:28px}.ks-view-note{font-size:12px;color:var(--p-text-muted-color);line-height:1.5;margin:0}.ks-view-id{display:block;margin-top:4px;font-family:ui-monospace,Menlo,monospace;font-size:11px;color:var(--p-text-muted-color);overflow-wrap:anywhere}.ks-view-list{border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);background:var(--kx-overlay-subtle);padding:4px 10px}.ks-view-pol{padding:8px 4px;border-bottom:1px solid var(--p-content-border-color)}.ks-view-pol:last-child{border-bottom:none}.ks-view-pol-title{font-size:13px;font-weight:600;color:var(--p-text-color)}.ks-view-pol-comment{font-size:12px;color:var(--p-text-muted-color);margin-top:2px}.ks-view-pol-id{font-size:10.5px;color:var(--p-text-muted-color);font-family:ui-monospace,Menlo,monospace;margin-top:2px;overflow-wrap:anywhere}.ks-eff{font-size:10px;font-weight:700;text-transform:uppercase;padding:1px 6px;border-radius:999px;margin-left:6px}.ks-eff.allow{background:color-mix(in srgb,var(--p-success-600) 14%,transparent);color:var(--p-success-700)}.ks-eff.deny{background:color-mix(in srgb,var(--p-danger-500) 14%,transparent);color:var(--p-danger-700)}.ks-pcard{display:flex;align-items:flex-start;gap:8px;padding:10px 10px 10px 6px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);background:var(--p-content-background);cursor:grab;transition:border-color .12s,box-shadow .12s,transform .08s}.ks-pcard:hover{border-color:var(--p-primary-color);box-shadow:0 1px 6px #0000000f}.ks-pcard:active{cursor:grabbing;transform:scale(.997)}.ks-pcard-grip{flex:none;margin-top:2px;color:var(--p-text-muted-color);font-size:15px}.ks-pcard-body{flex:1;min-width:0}.ks-pcard-head{display:flex;align-items:center;gap:8px}.ks-pcard-title{font-weight:600;font-size:13px;color:var(--p-text-color);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ks-pcard-comment{font-size:12px;color:var(--p-text-muted-color);margin-top:2px;line-height:1.35}.ks-pcard-id{font-size:10.5px;color:var(--p-text-muted-color);margin-top:3px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ks-pcard-act{flex:none;width:24px;height:24px;display:grid;place-items:center;border:none;border-radius:6px;cursor:pointer;background:transparent;color:var(--p-text-muted-color);transition:background .12s,color .12s}.ks-pcard-act.add:hover{background:color-mix(in srgb,var(--p-success-600) 12%,transparent);color:var(--p-success-700)}.ks-pcard-act.remove:hover{background:color-mix(in srgb,var(--p-danger-500) 12%,transparent);color:var(--p-danger-700)}.ks-pcard{flex-direction:column;align-items:stretch}.ks-pcard-row{display:flex;align-items:flex-start;gap:8px}.ks-pcard.locked{cursor:default;opacity:.9}.ks-pcard.locked:hover{border-color:var(--p-content-border-color);box-shadow:none}.ks-pcard-grip.locked,.ks-pcard-act.detail{color:var(--p-text-muted-color)}.ks-pcard-act.detail svg{transition:transform .15s}.ks-pcard-act.detail.open svg{transform:rotate(90deg)}.ks-pcard-act.detail:hover{background:var(--kx-overlay-hover);color:var(--p-text-color)}.ks-pcard-detail{margin-top:8px;padding-top:8px;border-top:1px dashed var(--p-content-border-color);display:flex;flex-direction:column;gap:5px}.ks-pcard-kv{display:flex;gap:8px;font-size:11px;align-items:flex-start}.ks-pcard-kv>span{flex:none;width:64px;color:var(--p-text-muted-color);text-transform:uppercase;font-weight:700;letter-spacing:.03em;font-size:10px;padding-top:3px}.ks-pcard-tags{display:flex;flex-wrap:wrap;gap:4px}.ks-pcard-kv code,.ks-eff-code{min-width:0;overflow-wrap:anywhere;font-family:ui-monospace,Menlo,monospace;font-size:10.5px;background:var(--kx-overlay-subtle);padding:1px 5px;border-radius:4px;color:var(--p-text-color)}.ks-eff-code.allow{color:var(--p-success-700)}.ks-eff-code.deny{color:var(--p-danger-700)}.ks-pcard-none{color:var(--p-text-muted-color);font-size:11px}.ks-overlay-warn{display:flex;gap:10px;align-items:flex-start;padding:10px 12px;border-radius:var(--kx-radius-8);background:color-mix(in srgb,var(--p-warn-500) 12%,transparent);border:1px solid color-mix(in srgb,var(--p-warn-500) 40%,transparent);color:var(--p-text-color);font-size:12.5px;line-height:1.45}.ks-overlay-warn svg{flex:none;margin-top:1px;color:var(--p-warn-600);font-size:18px}.ks-panes.three{grid-template-columns:repeat(3,minmax(0,1fr))}.ks-pane.locked-pane{background:var(--kx-overlay-hover)}.ks-ext-block{margin-top:14px}.ks-ext-head{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700;color:var(--p-text-color);margin-bottom:6px}.ks-ext-head svg{color:var(--p-warn-600)}.ks-tabs{display:flex;gap:8px;padding:12px 16px;border-bottom:1px solid var(--p-content-border-color)}.ks-tabs [aria-selected=false]{background:var(--p-content-background);color:var(--p-text-color)}.ks-delegations{flex:1;min-height:0;overflow:auto;padding:16px;display:flex;flex-direction:column;gap:16px;color:var(--p-text-color)}.ks-delegation-form{display:flex;flex-direction:column;gap:12px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);padding:16px;max-width:720px}.ks-delegation-form ul{list-style:none;margin:0;padding:0}.ks-delegation-form li{display:flex;align-items:center;justify-content:space-between;gap:12px}.ks-delegation-form small{display:block;overflow-wrap:anywhere;color:var(--p-text-muted-color)}.ks-delegation-all{display:flex;align-items:center;gap:8px}.ks-delegation-table{width:100%;border-collapse:collapse;text-align:left}.ks-delegation-table caption{text-align:left;font-weight:600;padding:8px 0}.ks-delegation-table th,.ks-delegation-table td{border-bottom:1px solid var(--p-content-border-color);padding:10px;overflow-wrap:anywhere}', Gl = { props: { type: "object", properties: {} } }, Ql = {
  wippy: Gl
};
class Jl extends ho {
  static get wippyConfig() {
    return {
      propsSchema: Ql.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: Yl
    };
  }
  static get vueConfig() {
    return { rootComponent: ql, plugins: [ii] };
  }
}
Mr(import.meta.url, Jl);
//# sourceMappingURL=index.js.map
