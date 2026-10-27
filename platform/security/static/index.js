import { hasInjectionContext as Dr, inject as Wn, effectScope as Mr, ref as R, markRaw as Ur, onMounted as Kt, onUnmounted as Wr, watch as Te, createApp as Fr, readonly as Hr, getCurrentInstance as Et, nextTick as qt, reactive as Kr, renderSlot as X, openBlock as m, createBlock as B, Teleport as Fn, createCommentVNode as E, useId as qr, mergeProps as W, h as Yr, resolveDirective as Yt, withDirectives as We, resolveDynamicComponent as Ze, withCtx as I, normalizeClass as ne, createElementBlock as y, createElementVNode as b, defineComponent as ae, createTextVNode as U, toDisplayString as P, resolveComponent as on, computed as J, unref as h, createVNode as L, onBeforeUnmount as Gr, withModifiers as Ue, Fragment as he, renderList as ge, vShow as an } from "vue";
import { addCollection as Qr, Icon as Q } from "@iconify/vue";
import { config as sn, addIcons as Zr, on as Jr, applyThemeMode as mt, host as Gt, hostCss as Xr, loadCss as eo, loadByTagName as to, api as Ae, define as no } from "@wippy-fe/proxy";
var jt = "data-wippy-visible";
function ln(e) {
  const t = e.getAttribute(jt);
  return t === "true" ? !0 : t === "false" ? !1 : null;
}
var ro = Object.defineProperty, oo = (e, t, n) => t in e ? ro(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, G = (e, t, n) => oo(e, typeof t != "symbol" ? t + "" : t, n), ao = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], io = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function cn(e) {
  const t = e.startsWith("--") ? e : `--${e}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(t) ? t : null;
}
function so(...e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of e)
    if (n)
      for (const [r, o] of Object.entries(n)) {
        if ((r === "@light" || r === "@dark") && o && typeof o == "object") {
          for (const [s, c] of Object.entries(o)) {
            const i = typeof c == "string" ? cn(s) : null;
            i && t.add(i);
          }
          continue;
        }
        const a = typeof o == "string" ? cn(r) : null;
        a && t.add(a);
      }
  return [...t].sort();
}
function lo(e) {
  if (e.length === 0)
    return "";
  const t = e.map((n) => `  ${n}: inherit;`).join(`
`);
  return `${io} {
${t}
}`;
}
function co(e, t) {
  const n = lo(t);
  n && Hn(e, n, "@wippy-fe/css-variables-bridge");
}
function uo(e, t) {
  const r = (t ?? ao).map(async (o) => {
    const a = Xr[o];
    if (!a)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${o}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await eo(a);
    } catch (s) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${o}" (${a}):`, s), null;
    }
  });
  return Promise.all(r).then((o) => {
    for (const a of o) {
      if (!a)
        continue;
      const s = document.createElement("style");
      s.textContent = a, s.setAttribute("role", "@wippy-fe/host-css"), e.appendChild(s);
    }
  });
}
function po(e, t) {
  const n = document.createElement("style");
  n.textContent = t, e.appendChild(n);
}
function Hn(e, t, n) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const o = new CSSStyleSheet();
    o.replaceSync(t), e.adoptedStyleSheets = [...e.adoptedStyleSheets, o];
    return;
  }
  const r = document.createElement("style");
  r.setAttribute("role", n), r.textContent = t, e.appendChild(r);
}
function fo(e, t) {
  Hn(e, t, "@wippy-fe/custom-css");
}
function Kn(e) {
  return e.__wippyHost ?? null;
}
function mo(e) {
  return e.replace(/-([a-z])/g, (t, n) => n.toUpperCase());
}
function bo(e, t, n) {
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
function Ct(e, t) {
  const n = {}, r = [];
  for (const [o, a] of Object.entries(t.properties)) {
    const s = e.getAttribute(o), c = mo(o);
    if (s === null) {
      a.default !== void 0 && (n[c] = a.default);
      continue;
    }
    const i = bo(o, s, a);
    i.error ? r.push(i.error) : n[c] = i.value;
  }
  return { props: n, errors: r };
}
var vo = class {
  constructor(e, t) {
    G(this, "_props"), G(this, "_errors"), G(this, "_content"), G(this, "_hostVisibility"), G(this, "_propsListeners", /* @__PURE__ */ new Set()), G(this, "_contentListeners", /* @__PURE__ */ new Set()), G(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), G(this, "_disposed", !1), G(this, "_emitToDom"), G(this, "props"), G(this, "events"), G(this, "content"), G(this, "hostVisibility"), this._props = e.props, this._errors = e.errors, this._content = e.content, this._hostVisibility = e.hostVisibility, this._emitToDom = t;
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
}, ho = class extends HTMLElement {
  constructor() {
    super(), G(this, "_internals"), G(this, "_contentObserver", null), G(this, "_initialized", !1), G(this, "_container", null), G(this, "_reactive", null), G(this, "_lastProps", null), G(this, "_lastErrors", []), G(this, "_lastContent", null), G(this, "_themeUnsub", null), G(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = ln(this);
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
    return [.../* @__PURE__ */ new Set([...t, ...n, jt])];
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
    return Kn(this);
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
        const a = Ct(this, e.propsSchema);
        e.validateProps && a.errors.push(...e.validateProps(a.props)), n = a.props, r = a.errors, this._lastProps = n, this._lastErrors = r;
      }
      const o = t ? this._lastContent ?? this._extractContent(e.contentTemplate) : null;
      t && this._lastContent === null && (this._lastContent = o), this._reactive = new vo(
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
        this.onInit(n), e.inlineCss && po(n, e.inlineCss);
        try {
          const d = sn?.theming, l = so(
            d?.global?.cssVariables,
            d?.children?.cssVariables
          );
          co(n, l);
        } catch {
        }
        if (e.customCss !== !1)
          try {
            const d = sn?.theming, l = [d?.global?.customCSS, d?.children?.customCSS].filter(Boolean).join(`
`);
            l && fo(n, l);
          } catch {
          }
        (e.hostCssKeys === void 0 || e.hostCssKeys.length > 0) && uo(n, e.hostCssKeys), r = document.createElement("div"), r.setAttribute("data-wippy-theme-root", "");
        const i = e.containerClasses ?? [];
        i.length > 0 && r.classList.add(...i), n.appendChild(r), this._container = r, Zr(Qr);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = Jr("@theme", (i) => this._applyTheme(i)));
      const { props: o, errors: a } = Ct(this, e.propsSchema);
      e.validateProps && a.push(...e.validateProps(o));
      const s = o;
      this._lastProps = s, this._lastErrors = a;
      let c = null;
      e.contentTemplate && (c = this._extractContent(e.contentTemplate), this._lastContent = c, this._contentObserver = new MutationObserver(() => {
        const i = this._extractContent(e.contentTemplate);
        this._lastContent = i, this._reactive?.notifyContent(i), this.onContentChanged(i);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(n, r, s, a, c, t), this._internals.states.delete("loading"), this._internals.states.add("ready"), t || (this._initialized = !0), this.onReady(), this.emitEvent("load");
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
  _applyTheme(e = Gt.getThemeMode?.()) {
    mt(e, this), this._container && mt(e, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), mt("auto", this), this._container && mt("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(e, t, n) {
    if (t === n)
      return;
    if (e === jt) {
      const c = this._hostVisible, i = ln(this);
      if (i === c)
        return;
      this._hostVisible = i, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(i, c), this.onHostVisibilityChanged(i, c));
      return;
    }
    const r = this.constructor.wippyConfig, { props: o, errors: a } = Ct(this, r.propsSchema);
    r.validateProps && a.push(...r.validateProps(o));
    const s = o;
    this._lastProps = s, this._lastErrors = a, this._reactive?.notifyProps(s, a), this.onPropsChanged(s, a);
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
function go(e) {
  return e.__wippyHostBus ?? null;
}
function yo(e) {
  return e.dataset.wippyPanelId ?? null;
}
/*!
 * pinia v4.0.3
 * (c) 2026 Eduardo San Martin Morote
 * @license MIT
 */
let qn;
const Yn = (e) => qn = e, xo = () => Dr() && Wn(Gn) || qn, Gn = (
  /* istanbul ignore next */
  Symbol()
);
function ko() {
  const e = Mr(!0), t = e.run(() => R({}));
  let n = [], r = [];
  const o = Ur({
    install(a) {
      Yn(o), o._a = a, a.provide(Gn, o), a.config.globalProperties.$pinia = o, r.forEach((s) => n.push(s)), r = [];
    },
    use(a) {
      return this._a ? n.push(a) : r.push(a), this;
    },
    _p: n,
    _a: null,
    _e: e,
    _s: /* @__PURE__ */ new Map(),
    state: t
  });
  return o;
}
var wo = Object.defineProperty, _o = (e, t, n) => t in e ? wo(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, Ve = (e, t, n) => _o(e, typeof t != "symbol" ? t + "" : t, n), So = /* @__PURE__ */ Symbol("wippy:emit"), $o = /* @__PURE__ */ Symbol("wippy:props"), Co = /* @__PURE__ */ Symbol("wippy:props_error"), To = /* @__PURE__ */ Symbol("wippy:content"), Po = /* @__PURE__ */ Symbol("wippy:panel-id"), Oo = /* @__PURE__ */ Symbol("wippy:layout-bus"), Ao = /* @__PURE__ */ Symbol("wippy:host"), Qn = /* @__PURE__ */ Symbol("wippy:host-visibility");
function Lo() {
  const e = Wn(Qn);
  if (!e)
    throw new Error("useHostVisibility() must be called inside a WippyVueElement");
  return e;
}
function Eo(e) {
  const t = Lo();
  let n = !1, r = null, o = !1;
  function a() {
    if (r)
      return o = !0, r;
    let s;
    try {
      s = Promise.resolve(e());
    } catch (i) {
      s = Promise.reject(i);
    }
    const c = s.finally(() => {
      if (r === c && (r = null, n && o))
        return o = !1, a();
    });
    return r = c, c;
  }
  return Kt(() => (n = !0, a())), Wr(() => {
    n = !1, o = !1;
  }), Te(t, (s, c) => {
    if (n && c === !1 && s === !0)
      return a();
  }), t;
}
var jo = class extends ho {
  constructor() {
    super(...arguments), Ve(this, "_vueApp", null), Ve(this, "_propsRef", R({})), Ve(this, "_errorsRef", R([])), Ve(this, "_contentRef", R(null)), Ve(this, "_hostVisibilityRef", R(null)), Ve(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  onMount(e, t, n, r, o, a) {
    const s = this.constructor.vueConfig;
    this._propsRef.value = n, this._errorsRef.value = r, this._contentRef.value = o ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const d of r)
      this.emitEvent("invalid", { message: d });
    const c = new AbortController();
    this._bridgeAbort = c, this.reactive.props.subscribe((d, l) => {
      this._propsRef.value = d, this._errorsRef.value = [...l];
      for (const u of l)
        this.emitEvent("invalid", { message: u });
    }, { signal: c.signal }), this.reactive.content && this.reactive.content.subscribe((d) => {
      this._contentRef.value = d;
    }, { signal: c.signal }), this.reactive.hostVisibility.subscribe((d) => {
      this._hostVisibilityRef.value = d;
    }, { signal: c.signal });
    const i = (d) => {
      if (c.signal.aborted)
        return;
      const l = xo(), u = Fr(d.rootComponent);
      this._vueApp = u;
      const p = ko();
      if (d.piniaPlugins)
        for (const f of d.piniaPlugins)
          p.use(f);
      if (u.use(p), d.plugins)
        for (const f of d.plugins)
          u.use(f);
      u.provide($o, this._propsRef), u.provide(Co, this._errorsRef), u.provide(So, this.emitEvent.bind(this)), u.provide(To, this._contentRef), u.provide(Qn, this._hostVisibilityRef), u.provide(Po, yo(this)), u.provide(Oo, go(this)), u.provide(Ao, Kn(this)), d.providers && d.providers(u, this), u.mount(t), l && Yn(l);
    };
    if (s.rootComponent)
      i(s);
    else if (s.lazyConfig) {
      const d = document.createElement("wippy-loading");
      d.setAttribute("no-bg", ""), t.appendChild(d), s.lazyConfig().then((l) => {
        c.signal.aborted || (d.remove(), i(l));
      }).catch((l) => {
        if (c.signal.aborted)
          return;
        const u = l instanceof Error ? l.message : String(l), p = document.createElement("wippy-error");
        p.setAttribute("title", "Failed to load"), p.setAttribute("message", u), d.replaceWith(p), this.emitEvent("error", { message: u });
      });
    } else
      throw new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._vueApp && (this._vueApp.unmount(), this._vueApp = null);
  }
}, No = Object.defineProperty, dn = Object.getOwnPropertySymbols, zo = Object.prototype.hasOwnProperty, Io = Object.prototype.propertyIsEnumerable, un = (e, t, n) => t in e ? No(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, Ro = (e, t) => {
  for (var n in t || (t = {})) zo.call(t, n) && un(e, n, t[n]);
  if (dn) for (var n of dn(t)) Io.call(t, n) && un(e, n, t[n]);
  return e;
};
function Re(e) {
  return e == null || e === "" || Array.isArray(e) && e.length === 0 || !(e instanceof Date) && typeof e == "object" && Object.keys(e).length === 0;
}
function Nt(e, t, n = /* @__PURE__ */ new WeakSet()) {
  if (e === t) return !0;
  if (!e || !t || typeof e != "object" || typeof t != "object" || n.has(e) || n.has(t)) return !1;
  n.add(e).add(t);
  let r = Array.isArray(e), o = Array.isArray(t), a, s, c;
  if (r && o) {
    if (s = e.length, s != t.length) return !1;
    for (a = s; a-- !== 0; ) if (!Nt(e[a], t[a], n)) return !1;
    return !0;
  }
  if (r != o) return !1;
  let i = e instanceof Date, d = t instanceof Date;
  if (i != d) return !1;
  if (i && d) return e.getTime() == t.getTime();
  let l = e instanceof RegExp, u = t instanceof RegExp;
  if (l != u) return !1;
  if (l && u) return e.toString() == t.toString();
  let p = Object.keys(e);
  if (s = p.length, s !== Object.keys(t).length) return !1;
  for (a = s; a-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(t, p[a])) return !1;
  for (a = s; a-- !== 0; ) if (c = p[a], !Nt(e[c], t[c], n)) return !1;
  return !0;
}
function Vo(e, t) {
  return Nt(e, t);
}
function Qt(e) {
  return typeof e == "function" && "call" in e && "apply" in e;
}
function q(e) {
  return !Re(e);
}
function pn(e, t) {
  return null;
}
function Bo(e, t, n) {
  return n ? pn() === pn() : Vo(e, t);
}
function Se(e, t = !0) {
  return e instanceof Object && e.constructor === Object && (t || Object.keys(e).length !== 0);
}
function Zn(e = {}, t = {}) {
  let n = Ro({}, e);
  return Object.keys(t).forEach((r) => {
    let o = r;
    Se(t[o]) && o in e && Se(e[o]) ? n[o] = Zn(e[o], t[o]) : n[o] = t[o];
  }), n;
}
function Do(...e) {
  return e.reduce((t, n, r) => r === 0 ? n : Zn(t, n), {});
}
function pe(e, ...t) {
  return Qt(e) ? e(...t) : e;
}
function le(e, t = !0) {
  return typeof e == "string" && (t || e !== "");
}
function _e(e) {
  return le(e) ? e.replace(/(-|_)/g, "").toLowerCase() : e;
}
function Zt(e, t = "", n = {}) {
  let r = _e(t).split("."), o = r.shift();
  if (o) {
    if (Se(e)) {
      let a = Object.keys(e).find((s) => _e(s) === o) || "";
      return Zt(pe(e[a], n), r.join("."), n);
    }
    return;
  }
  return pe(e, n);
}
function Jn(e, t = !0) {
  return Array.isArray(e) && (t || e.length !== 0);
}
function Mo(e) {
  return q(e) && !isNaN(e);
}
function ze(e, t) {
  if (t) {
    let n = t.test(e);
    return t.lastIndex = 0, n;
  }
  return !1;
}
function Uo(...e) {
  return Do(...e);
}
function Ye(e) {
  return e && e.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function Wo(e) {
  return le(e, !1) ? e[0].toUpperCase() + e.slice(1) : e;
}
function Xn(e) {
  return le(e) ? e.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : e;
}
function er() {
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
function Ee(...e) {
  if (e) {
    let t = [];
    for (let n = 0; n < e.length; n++) {
      let r = e[n];
      if (!r) continue;
      let o = typeof r;
      if (o === "string" || o === "number") t.push(r);
      else if (o === "object") {
        let a = Array.isArray(r) ? [Ee(...r)] : Object.entries(r).map(([s, c]) => c ? s : void 0);
        t = a.length ? t.concat(a.filter((s) => !!s)) : t;
      }
    }
    return t.join(" ").trim();
  }
}
function Fo(e, t) {
  return e ? e.classList ? e.classList.contains(t) : new RegExp("(^| )" + t + "( |$)", "gi").test(e.className) : !1;
}
function Ho(e, t) {
  if (e && t) {
    let n = (r) => {
      Fo(e, r) || (e.classList ? e.classList.add(r) : e.className += " " + r);
    };
    [t].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function Tt(e, t) {
  if (e && t) {
    let n = (r) => {
      e.classList ? e.classList.remove(r) : e.className = e.className.replace(new RegExp("(^|\\b)" + r.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [t].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function fn(e) {
  return e ? Math.abs(e.scrollLeft) : 0;
}
function mn(e) {
  return e ? getComputedStyle(e).direction === "rtl" : !1;
}
function tr(e, t) {
  return e instanceof HTMLElement ? e.offsetWidth : 0;
}
function Ko(e) {
  if (e) {
    let t = e.parentNode;
    return t && t instanceof ShadowRoot && t.host && (t = t.host), t;
  }
  return null;
}
function qo(e) {
  return !!(e !== null && typeof e < "u" && e.nodeName && Ko(e));
}
function ut(e) {
  return typeof Element < "u" ? e instanceof Element : e !== null && typeof e == "object" && e.nodeType === 1 && typeof e.nodeName == "string";
}
function xt(e, t = {}) {
  if (ut(e)) {
    let n = (r, o) => {
      var a, s;
      let c = (a = e?.$attrs) != null && a[r] ? [(s = e?.$attrs) == null ? void 0 : s[r]] : [];
      return [o].flat().reduce((i, d) => {
        if (d != null) {
          let l = typeof d;
          if (l === "string" || l === "number") i.push(d);
          else if (l === "object") {
            let u = Array.isArray(d) ? n(r, d) : Object.entries(d).map(([p, f]) => r === "style" && (f || f === 0) ? `${p.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}:${f}` : f ? p : void 0);
            i = u.length ? i.concat(u.filter((p) => !!p)) : i;
          }
        }
        return i;
      }, c);
    };
    Object.entries(t).forEach(([r, o]) => {
      if (o != null) {
        let a = r.match(/^on(.+)/);
        a ? e.addEventListener(a[1].toLowerCase(), o) : r === "p-bind" || r === "pBind" ? xt(e, o) : (o = r === "class" ? [...new Set(n("class", o))].join(" ").trim() : r === "style" ? n("style", o).join(";").trim() : o, (e.$attrs = e.$attrs || {}) && (e.$attrs[r] = o), e.setAttribute(r, o));
      }
    });
  }
}
function Yo(e, t = {}, ...n) {
  {
    let r = document.createElement(e);
    return xt(r, t), r.append(...n), r;
  }
}
function Je(e, t) {
  return ut(e) ? e.matches(t) ? e : e.querySelector(t) : null;
}
function Go(e, t) {
  e && document.activeElement !== e && e.focus(t);
}
function He(e, t) {
  if (ut(e)) {
    let n = e.getAttribute(t);
    return isNaN(n) ? n === "true" || n === "false" ? n === "true" : n : +n;
  }
}
function zt(e) {
  if (e) {
    let t = e.offsetHeight, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingTop) + parseFloat(n.paddingBottom) + parseFloat(n.borderTopWidth) + parseFloat(n.borderBottomWidth), t;
  }
  return 0;
}
function Ke(e) {
  if (e) {
    let t = e.getBoundingClientRect();
    return { top: t.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: t.left + (window.pageXOffset || fn(document.documentElement) || fn(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function nr(e, t) {
  return e ? e.offsetHeight : 0;
}
function Ge(e) {
  if (e) {
    let t = e.offsetWidth, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingLeft) + parseFloat(n.paddingRight) + parseFloat(n.borderLeftWidth) + parseFloat(n.borderRightWidth), t;
  }
  return 0;
}
function rr() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function Qo(e, t = "", n) {
  ut(e) && n !== null && n !== void 0 && e.setAttribute(t, n);
}
var bt = {};
function Zo(e = "pui_id_") {
  return Object.hasOwn(bt, e) || (bt[e] = 0), bt[e]++, `${e}${bt[e]}`;
}
var Jo = Object.defineProperty, Xo = Object.defineProperties, ea = Object.getOwnPropertyDescriptors, kt = Object.getOwnPropertySymbols, or = Object.prototype.hasOwnProperty, ar = Object.prototype.propertyIsEnumerable, bn = (e, t, n) => t in e ? Jo(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, ye = (e, t) => {
  for (var n in t || (t = {})) or.call(t, n) && bn(e, n, t[n]);
  if (kt) for (var n of kt(t)) ar.call(t, n) && bn(e, n, t[n]);
  return e;
}, Pt = (e, t) => Xo(e, ea(t)), Ce = (e, t) => {
  var n = {};
  for (var r in e) or.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
  if (e != null && kt) for (var r of kt(e)) t.indexOf(r) < 0 && ar.call(e, r) && (n[r] = e[r]);
  return n;
}, ta = er(), te = ta, Xe = /{([^}]*)}/g, ir = /(\d+\s+[\+\-\*\/]\s+\d+)/g, sr = /var\([^)]+\)/g;
function vn(e) {
  return le(e) ? e.replace(/[A-Z]/g, (t, n) => n === 0 ? t : "." + t.toLowerCase()).toLowerCase() : e;
}
function na(e) {
  return Se(e) && e.hasOwnProperty("$value") && e.hasOwnProperty("$type") ? e.$value : e;
}
function ra(e) {
  return e.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function It(e = "", t = "") {
  return ra(`${le(e, !1) && le(t, !1) ? `${e}-` : e}${t}`);
}
function lr(e = "", t = "") {
  return `--${It(e, t)}`;
}
function oa(e = "") {
  let t = (e.match(/{/g) || []).length, n = (e.match(/}/g) || []).length;
  return (t + n) % 2 !== 0;
}
function cr(e, t = "", n = "", r = [], o) {
  if (le(e)) {
    let a = e.trim();
    if (oa(a)) return;
    if (ze(a, Xe)) {
      let s = a.replaceAll(Xe, (c) => {
        let i = c.replace(/{|}/g, "").split(".").filter((d) => !r.some((l) => ze(d, l)));
        return `var(${lr(n, Xn(i.join("-")))}${q(o) ? `, ${o}` : ""})`;
      });
      return ze(s.replace(sr, "0"), ir) ? `calc(${s})` : s;
    }
    return a;
  } else if (Mo(e)) return e;
}
function aa(e, t, n) {
  le(t, !1) && e.push(`${t}:${n};`);
}
function Be(e, t) {
  return e ? `${e}{${t}}` : "";
}
function dr(e, t) {
  if (e.indexOf("dt(") === -1) return e;
  function n(s, c) {
    let i = [], d = 0, l = "", u = null, p = 0;
    for (; d <= s.length; ) {
      let f = s[d];
      if ((f === '"' || f === "'" || f === "`") && s[d - 1] !== "\\" && (u = u === f ? null : f), !u && (f === "(" && p++, f === ")" && p--, (f === "," || d === s.length) && p === 0)) {
        let k = l.trim();
        k.startsWith("dt(") ? i.push(dr(k, c)) : i.push(r(k)), l = "", d++;
        continue;
      }
      f !== void 0 && (l += f), d++;
    }
    return i;
  }
  function r(s) {
    let c = s[0];
    if ((c === '"' || c === "'" || c === "`") && s[s.length - 1] === c) return s.slice(1, -1);
    let i = Number(s);
    return isNaN(i) ? s : i;
  }
  let o = [], a = [];
  for (let s = 0; s < e.length; s++) if (e[s] === "d" && e.slice(s, s + 3) === "dt(") a.push(s), s += 2;
  else if (e[s] === ")" && a.length > 0) {
    let c = a.pop();
    a.length === 0 && o.push([c, s]);
  }
  if (!o.length) return e;
  for (let s = o.length - 1; s >= 0; s--) {
    let [c, i] = o[s], d = e.slice(c + 3, i), l = n(d, t), u = t(...l);
    e = e.slice(0, c) + u + e.slice(i + 1);
  }
  return e;
}
var Ie = (...e) => ia(K.getTheme(), ...e), ia = (e = {}, t, n, r) => {
  if (t) {
    let { variable: o, options: a } = K.defaults || {}, { prefix: s, transform: c } = e?.options || a || {}, i = ze(t, Xe) ? t : `{${t}}`;
    return r === "value" || Re(r) && c === "strict" ? K.getTokenValue(t) : cr(i, void 0, s, [o.excludedKeyRegex], n);
  }
  return "";
};
function vt(e, ...t) {
  if (e instanceof Array) {
    let n = e.reduce((r, o, a) => {
      var s;
      return r + o + ((s = pe(t[a], { dt: Ie })) != null ? s : "");
    }, "");
    return dr(n, Ie);
  }
  return pe(e, { dt: Ie });
}
function sa(e, t = {}) {
  let n = K.defaults.variable, { prefix: r = n.prefix, selector: o = n.selector, excludedKeyRegex: a = n.excludedKeyRegex } = t, s = [], c = [], i = [{ node: e, path: r }];
  for (; i.length; ) {
    let { node: l, path: u } = i.pop();
    for (let p in l) {
      let f = l[p], k = na(f), T = ze(p, a) ? It(u) : It(u, Xn(p));
      if (Se(k)) i.push({ node: k, path: T });
      else {
        let C = lr(T), O = cr(k, T, r, [a]);
        aa(c, C, O);
        let S = T;
        r && S.startsWith(r + "-") && (S = S.slice(r.length + 1)), s.push(S.replace(/-/g, "."));
      }
    }
  }
  let d = c.join("");
  return { value: c, tokens: s, declarations: d, css: Be(o, d) };
}
var ve = { regex: { rules: { class: { pattern: /^\.([a-zA-Z][\w-]*)$/, resolve(e) {
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
  return sa(e, { prefix: t?.prefix });
}, getCommon({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var a, s, c, i, d, l, u;
  let { preset: p, options: f } = t, k, T, C, O, S, D, v;
  if (q(p) && f.transform !== "strict") {
    let { primitive: A, semantic: j, extend: M } = p, oe = j || {}, { colorScheme: ce } = oe, Y = Ce(oe, ["colorScheme"]), N = M || {}, { colorScheme: _ } = N, $ = Ce(N, ["colorScheme"]), ee = ce || {}, { dark: Z } = ee, $e = Ce(ee, ["dark"]), de = _ || {}, { dark: ke } = de, Pe = Ce(de, ["dark"]), me = q(A) ? this._toVariables({ primitive: A }, f) : {}, fe = q(Y) ? this._toVariables({ semantic: Y }, f) : {}, be = q($e) ? this._toVariables({ light: $e }, f) : {}, ue = q(Z) ? this._toVariables({ dark: Z }, f) : {}, x = q($) ? this._toVariables({ semantic: $ }, f) : {}, w = q(Pe) ? this._toVariables({ light: Pe }, f) : {}, g = q(ke) ? this._toVariables({ dark: ke }, f) : {}, [ie, pt] = [(a = me.declarations) != null ? a : "", me.tokens], [ft, $r] = [(s = fe.declarations) != null ? s : "", fe.tokens || []], [Cr, Tr] = [(c = be.declarations) != null ? c : "", be.tokens || []], [Pr, Or] = [(i = ue.declarations) != null ? i : "", ue.tokens || []], [Ar, Lr] = [(d = x.declarations) != null ? d : "", x.tokens || []], [Er, jr] = [(l = w.declarations) != null ? l : "", w.tokens || []], [Nr, zr] = [(u = g.declarations) != null ? u : "", g.tokens || []];
    k = this.transformCSS(e, ie, "light", "variable", f, r, o), T = pt;
    let Ir = this.transformCSS(e, `${ft}${Cr}`, "light", "variable", f, r, o), Rr = this.transformCSS(e, `${Pr}`, "dark", "variable", f, r, o);
    C = `${Ir}${Rr}`, O = [.../* @__PURE__ */ new Set([...$r, ...Tr, ...Or])];
    let Vr = this.transformCSS(e, `${Ar}${Er}color-scheme:light`, "light", "variable", f, r, o), Br = this.transformCSS(e, `${Nr}color-scheme:dark`, "dark", "variable", f, r, o);
    S = `${Vr}${Br}`, D = [.../* @__PURE__ */ new Set([...Lr, ...jr, ...zr])], v = pe(p.css, { dt: Ie });
  }
  return { primitive: { css: k, tokens: T }, semantic: { css: C, tokens: O }, global: { css: S, tokens: D }, style: v };
}, getPreset({ name: e = "", preset: t = {}, options: n, params: r, set: o, defaults: a, selector: s }) {
  var c, i, d;
  let l, u, p;
  if (q(t) && n.transform !== "strict") {
    let f = e.replace("-directive", ""), k = t, { colorScheme: T, extend: C, css: O } = k, S = Ce(k, ["colorScheme", "extend", "css"]), D = C || {}, { colorScheme: v } = D, A = Ce(D, ["colorScheme"]), j = T || {}, { dark: M } = j, oe = Ce(j, ["dark"]), ce = v || {}, { dark: Y } = ce, N = Ce(ce, ["dark"]), _ = q(S) ? this._toVariables({ [f]: ye(ye({}, S), A) }, n) : {}, $ = q(oe) ? this._toVariables({ [f]: ye(ye({}, oe), N) }, n) : {}, ee = q(M) ? this._toVariables({ [f]: ye(ye({}, M), Y) }, n) : {}, [Z, $e] = [(c = _.declarations) != null ? c : "", _.tokens || []], [de, ke] = [(i = $.declarations) != null ? i : "", $.tokens || []], [Pe, me] = [(d = ee.declarations) != null ? d : "", ee.tokens || []], fe = this.transformCSS(f, `${Z}${de}`, "light", "variable", n, o, a, s), be = this.transformCSS(f, Pe, "dark", "variable", n, o, a, s);
    l = `${fe}${be}`, u = [.../* @__PURE__ */ new Set([...$e, ...ke, ...me])], p = pe(O, { dt: Ie });
  }
  return { css: l, tokens: u, style: p };
}, getPresetC({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var a;
  let { preset: s, options: c } = t, i = (a = s?.components) == null ? void 0 : a[e];
  return this.getPreset({ name: e, preset: i, options: c, params: n, set: r, defaults: o });
}, getPresetD({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var a, s;
  let c = e.replace("-directive", ""), { preset: i, options: d } = t, l = ((a = i?.components) == null ? void 0 : a[c]) || ((s = i?.directives) == null ? void 0 : s[c]);
  return this.getPreset({ name: c, preset: l, options: d, params: n, set: r, defaults: o });
}, applyDarkColorScheme(e) {
  return !(e.darkModeSelector === "none" || e.darkModeSelector === !1);
}, getColorSchemeOption(e, t) {
  var n;
  return this.applyDarkColorScheme(e) ? this.regex.resolve(e.darkModeSelector === !0 ? t.options.darkModeSelector : (n = e.darkModeSelector) != null ? n : t.options.darkModeSelector) : [];
}, getLayerOrder(e, t = {}, n, r) {
  let { cssLayer: o } = t;
  return o ? `@layer ${pe(o.order || o.name || "primeui", n)}` : "";
}, getCommonStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: o, defaults: a }) {
  let s = this.getCommon({ name: e, theme: t, params: n, set: o, defaults: a }), c = Object.entries(r).reduce((i, [d, l]) => i.push(`${d}="${l}"`) && i, []).join(" ");
  return Object.entries(s || {}).reduce((i, [d, l]) => {
    if (Se(l) && Object.hasOwn(l, "css")) {
      let u = Ye(l.css), p = `${d}-variables`;
      i.push(`<style type="text/css" data-primevue-style-id="${p}" ${c}>${u}</style>`);
    }
    return i;
  }, []).join("");
}, getStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: o, defaults: a }) {
  var s;
  let c = { name: e, theme: t, params: n, set: o, defaults: a }, i = (s = e.includes("-directive") ? this.getPresetD(c) : this.getPresetC(c)) == null ? void 0 : s.css, d = Object.entries(r).reduce((l, [u, p]) => l.push(`${u}="${p}"`) && l, []).join(" ");
  return i ? `<style type="text/css" data-primevue-style-id="${e}-variables" ${d}>${Ye(i)}</style>` : "";
}, createTokens(e = {}, t, n = "", r = "", o = {}) {
  let a = function(c, i = {}, d = []) {
    if (d.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: c, path: this.path, paths: i, value: void 0 };
    d.push(this.path), i.name = this.path, i.binding || (i.binding = {});
    let l = this.value;
    if (typeof this.value == "string" && Xe.test(this.value)) {
      let u = this.value.trim().replace(Xe, (p) => {
        var f;
        let k = p.slice(1, -1), T = this.tokens[k];
        if (!T) return console.warn(`Token not found for path: ${k}`), "__UNRESOLVED__";
        let C = T.computed(c, i, d);
        return Array.isArray(C) && C.length === 2 ? `light-dark(${C[0].value},${C[1].value})` : (f = C?.value) != null ? f : "__UNRESOLVED__";
      });
      l = ir.test(u.replace(sr, "0")) ? `calc(${u})` : u;
    }
    return Re(i.binding) && delete i.binding, d.pop(), { colorScheme: c, path: this.path, paths: i, value: l.includes("__UNRESOLVED__") ? void 0 : l };
  }, s = (c, i, d) => {
    Object.entries(c).forEach(([l, u]) => {
      let p = ze(l, t.variable.excludedKeyRegex) ? i : i ? `${i}.${vn(l)}` : vn(l), f = d ? `${d}.${l}` : l;
      Se(u) ? s(u, p, f) : (o[p] || (o[p] = { paths: [], computed: (k, T = {}, C = []) => {
        if (o[p].paths.length === 1) return o[p].paths[0].computed(o[p].paths[0].scheme, T.binding, C);
        if (k && k !== "none") for (let O = 0; O < o[p].paths.length; O++) {
          let S = o[p].paths[O];
          if (S.scheme === k) return S.computed(k, T.binding, C);
        }
        return o[p].paths.map((O) => O.computed(O.scheme, T[O.scheme], C));
      } }), o[p].paths.push({ path: f, value: u, scheme: f.includes("colorScheme.light") ? "light" : f.includes("colorScheme.dark") ? "dark" : "none", computed: a, tokens: o }));
    });
  };
  return s(e, n, r), o;
}, getTokenValue(e, t, n) {
  var r;
  let o = ((c) => c.split(".").filter((i) => !ze(i.toLowerCase(), n.variable.excludedKeyRegex)).join("."))(t), a = t.includes("colorScheme.light") ? "light" : t.includes("colorScheme.dark") ? "dark" : void 0, s = [(r = e[o]) == null ? void 0 : r.computed(a)].flat().filter((c) => c);
  return s.length === 1 ? s[0].value : s.reduce((c = {}, i) => {
    let d = i, { colorScheme: l } = d, u = Ce(d, ["colorScheme"]);
    return c[l] = u, c;
  }, void 0);
}, getSelectorRule(e, t, n, r) {
  return n === "class" || n === "attr" ? Be(q(t) ? `${e}${t},${e} ${t}` : e, r) : Be(e, Be(t ?? ":root,:host", r));
}, transformCSS(e, t, n, r, o = {}, a, s, c) {
  if (q(t)) {
    let { cssLayer: i } = o;
    if (r !== "style") {
      let d = this.getColorSchemeOption(o, s);
      t = n === "dark" ? d.reduce((l, { type: u, selector: p }) => (q(p) && (l += p.includes("[CSS]") ? p.replace("[CSS]", t) : this.getSelectorRule(p, c, u, t)), l), "") : Be(c ?? ":root,:host", t);
    }
    if (i) {
      let d = { name: "primeui" };
      Se(i) && (d.name = pe(i.name, { name: e, type: r })), q(d.name) && (t = Be(`@layer ${d.name}`, t), a?.layerNames(d.name));
    }
    return t;
  }
  return "";
} }, K = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(e = {}) {
  let { theme: t } = e;
  t && (this._theme = Pt(ye({}, t), { options: ye(ye({}, this.defaults.options), t.options) }), this._tokens = ve.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
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
  this._theme = Pt(ye({}, this.theme), { preset: e }), this._tokens = ve.createTokens(e, this.defaults), this.clearLoadedStyleNames(), te.emit("preset:change", e), te.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(e) {
  this._theme = Pt(ye({}, this.theme), { options: e }), this.clearLoadedStyleNames(), te.emit("options:change", e), te.emit("theme:change", this.theme);
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
  return ve.getTokenValue(this.tokens, e, this.defaults);
}, getCommon(e = "", t) {
  return ve.getCommon({ name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getComponent(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return ve.getPresetC(n);
}, getDirective(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return ve.getPresetD(n);
}, getCustomPreset(e = "", t, n, r) {
  let o = { name: e, preset: t, options: this.options, selector: n, params: r, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return ve.getPreset(o);
}, getLayerOrderCSS(e = "") {
  return ve.getLayerOrder(e, this.options, { names: this.getLayerNames() }, this.defaults);
}, transformCSS(e = "", t, n = "style", r) {
  return ve.transformCSS(e, t, r, n, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
}, getCommonStyleSheet(e = "", t, n = {}) {
  return ve.getCommonStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getStyleSheet(e, t, n = {}) {
  return ve.getStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, onStyleMounted(e) {
  this._loadingStyles.add(e);
}, onStyleUpdated(e) {
  this._loadingStyles.add(e);
}, onStyleLoaded(e, { name: t }) {
  this._loadingStyles.size && (this._loadingStyles.delete(t), te.emit(`theme:${t}:load`, e), !this._loadingStyles.size && te.emit("theme:load"));
} }, re = {
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
}, la = `
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
function et(e) {
  "@babel/helpers - typeof";
  return et = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, et(e);
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
function gn(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? hn(Object(n), !0).forEach(function(r) {
      ca(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : hn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function ca(e, t, n) {
  return (t = da(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function da(e) {
  var t = ua(e, "string");
  return et(t) == "symbol" ? t : t + "";
}
function ua(e, t) {
  if (et(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (et(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function pa(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  Et() && Et().components ? Kt(e) : t ? e() : qt(e);
}
var fa = 0;
function ma(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = R(!1), r = R(e), o = R(null), a = rr() ? window.document : void 0, s = t.document, c = s === void 0 ? a : s, i = t.immediate, d = i === void 0 ? !0 : i, l = t.manual, u = l === void 0 ? !1 : l, p = t.name, f = p === void 0 ? "style_".concat(++fa) : p, k = t.id, T = k === void 0 ? void 0 : k, C = t.media, O = C === void 0 ? void 0 : C, S = t.nonce, D = S === void 0 ? void 0 : S, v = t.first, A = v === void 0 ? !1 : v, j = t.onMounted, M = j === void 0 ? void 0 : j, oe = t.onUpdated, ce = oe === void 0 ? void 0 : oe, Y = t.onLoad, N = Y === void 0 ? void 0 : Y, _ = t.props, $ = _ === void 0 ? {} : _, ee = function() {
  }, Z = function(ke) {
    var Pe = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (c) {
      var me = gn(gn({}, $), Pe), fe = me.name || f, be = me.id || T, ue = me.nonce || D;
      o.value = c.querySelector('style[data-primevue-style-id="'.concat(fe, '"]')) || c.getElementById(be) || c.createElement("style"), o.value.isConnected || (r.value = ke || e, xt(o.value, {
        type: "text/css",
        id: be,
        media: O,
        nonce: ue
      }), A ? c.head.prepend(o.value) : c.head.appendChild(o.value), Qo(o.value, "data-primevue-style-id", fe), xt(o.value, me), o.value.onload = function(x) {
        return N?.(x, {
          name: fe
        });
      }, M?.(fe)), !n.value && (ee = Te(r, function(x) {
        o.value.textContent = x, ce?.(fe);
      }, {
        immediate: !0
      }), n.value = !0);
    }
  }, $e = function() {
    !c || !n.value || (ee(), qo(o.value) && c.head.removeChild(o.value), n.value = !1, o.value = null);
  };
  return d && !u && pa(Z), {
    id: T,
    name: f,
    el: o,
    css: r,
    unload: $e,
    load: Z,
    isLoaded: Hr(n)
  };
}
function tt(e) {
  "@babel/helpers - typeof";
  return tt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, tt(e);
}
var yn, xn, kn, wn;
function _n(e, t) {
  return ga(e) || ha(e, t) || va(e, t) || ba();
}
function ba() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function va(e, t) {
  if (e) {
    if (typeof e == "string") return Sn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Sn(e, t) : void 0;
  }
}
function Sn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function ha(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, o, a, s, c = [], i = !0, d = !1;
    try {
      if (a = (n = n.call(e)).next, t !== 0) for (; !(i = (r = a.call(n)).done) && (c.push(r.value), c.length !== t); i = !0) ;
    } catch (l) {
      d = !0, o = l;
    } finally {
      try {
        if (!i && n.return != null && (s = n.return(), Object(s) !== s)) return;
      } finally {
        if (d) throw o;
      }
    }
    return c;
  }
}
function ga(e) {
  if (Array.isArray(e)) return e;
}
function $n(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Ot(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? $n(Object(n), !0).forEach(function(r) {
      ya(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : $n(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function ya(e, t, n) {
  return (t = xa(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function xa(e) {
  var t = ka(e, "string");
  return tt(t) == "symbol" ? t : t + "";
}
function ka(e, t) {
  if (tt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (tt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function ht(e, t) {
  return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var wa = function(t) {
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
}, _a = {}, Sa = {}, H = {
  name: "base",
  css: wa,
  style: la,
  classes: _a,
  inlineStyles: Sa,
  load: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(a) {
      return a;
    }, o = r(vt(yn || (yn = ht(["", ""])), t));
    return q(o) ? ma(Ye(o), Ot({
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
      return K.transformCSS(n.name || t.name, "".concat(o).concat(vt(xn || (xn = ht(["", ""])), r)));
    });
  },
  getCommonTheme: function(t) {
    return K.getCommon(this.name, t);
  },
  getComponentTheme: function(t) {
    return K.getComponent(this.name, t);
  },
  getDirectiveTheme: function(t) {
    return K.getDirective(this.name, t);
  },
  getPresetTheme: function(t, n, r) {
    return K.getCustomPreset(this.name, t, n, r);
  },
  getLayerOrderThemeCSS: function() {
    return K.getLayerOrderCSS(this.name);
  },
  getStyleSheet: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.css) {
      var r = pe(this.css, {
        dt: Ie
      }) || "", o = Ye(vt(kn || (kn = ht(["", "", ""])), r, t)), a = Object.entries(n).reduce(function(s, c) {
        var i = _n(c, 2), d = i[0], l = i[1];
        return s.push("".concat(d, '="').concat(l, '"')) && s;
      }, []).join(" ");
      return q(o) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(a, ">").concat(o, "</style>") : "";
    }
    return "";
  },
  getCommonThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return K.getCommonStyleSheet(this.name, t, n);
  },
  getThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = [K.getStyleSheet(this.name, t, n)];
    if (this.style) {
      var o = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), a = vt(wn || (wn = ht(["", ""])), pe(this.style, {
        dt: Ie
      })), s = Ye(K.transformCSS(o, a)), c = Object.entries(n).reduce(function(i, d) {
        var l = _n(d, 2), u = l[0], p = l[1];
        return i.push("".concat(u, '="').concat(p, '"')) && i;
      }, []).join(" ");
      q(s) && r.push('<style type="text/css" data-primevue-style-id="'.concat(o, '" ').concat(c, ">").concat(s, "</style>"));
    }
    return r.join("");
  },
  extend: function(t) {
    return Ot(Ot({}, this), {}, {
      css: void 0,
      style: void 0
    }, t);
  }
}, Le = er();
function nt(e) {
  "@babel/helpers - typeof";
  return nt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, nt(e);
}
function Cn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function gt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Cn(Object(n), !0).forEach(function(r) {
      $a(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Cn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function $a(e, t, n) {
  return (t = Ca(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ca(e) {
  var t = Ta(e, "string");
  return nt(t) == "symbol" ? t : t + "";
}
function Ta(e, t) {
  if (nt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (nt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Pa = {
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
    text: [re.STARTS_WITH, re.CONTAINS, re.NOT_CONTAINS, re.ENDS_WITH, re.EQUALS, re.NOT_EQUALS],
    numeric: [re.EQUALS, re.NOT_EQUALS, re.LESS_THAN, re.LESS_THAN_OR_EQUAL_TO, re.GREATER_THAN, re.GREATER_THAN_OR_EQUAL_TO],
    date: [re.DATE_IS, re.DATE_IS_NOT, re.DATE_BEFORE, re.DATE_AFTER]
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
}, Oa = Symbol();
function Aa(e, t) {
  var n = {
    config: Kr(t)
  };
  return e.config.globalProperties.$primevue = n, e.provide(Oa, n), La(), Ea(e, n), n;
}
var Me = [];
function La() {
  te.clear(), Me.forEach(function(e) {
    return e?.();
  }), Me = [];
}
function Ea(e, t) {
  var n = R(!1), r = function() {
    var d;
    if (((d = t.config) === null || d === void 0 ? void 0 : d.theme) !== "none" && !K.isStyleNameLoaded("common")) {
      var l, u, p = ((l = H.getCommonTheme) === null || l === void 0 ? void 0 : l.call(H)) || {}, f = p.primitive, k = p.semantic, T = p.global, C = p.style, O = {
        nonce: (u = t.config) === null || u === void 0 || (u = u.csp) === null || u === void 0 ? void 0 : u.nonce
      };
      H.load(f?.css, gt({
        name: "primitive-variables"
      }, O)), H.load(k?.css, gt({
        name: "semantic-variables"
      }, O)), H.load(T?.css, gt({
        name: "global-variables"
      }, O)), H.loadStyle(gt({
        name: "global-style"
      }, O), C), K.setLoadedStyleName("common");
    }
  };
  te.on("theme:change", function(i) {
    n.value || (e.config.globalProperties.$primevue.config.theme = i, n.value = !0);
  });
  var o = Te(t.config, function(i, d) {
    Le.emit("config:change", {
      newValue: i,
      oldValue: d
    });
  }, {
    immediate: !0,
    deep: !0
  }), a = Te(function() {
    return t.config.ripple;
  }, function(i, d) {
    Le.emit("config:ripple:change", {
      newValue: i,
      oldValue: d
    });
  }, {
    immediate: !0,
    deep: !0
  }), s = Te(function() {
    return t.config.theme;
  }, function(i, d) {
    n.value || K.setTheme(i), t.config.unstyled || r(), n.value = !1, Le.emit("config:theme:change", {
      newValue: i,
      oldValue: d
    });
  }, {
    immediate: !0,
    deep: !1
  }), c = Te(function() {
    return t.config.unstyled;
  }, function(i, d) {
    !i && t.config.theme && r(), Le.emit("config:unstyled:change", {
      newValue: i,
      oldValue: d
    });
  }, {
    immediate: !0,
    deep: !0
  });
  Me.push(o), Me.push(a), Me.push(s), Me.push(c);
}
var ja = {
  install: function(t, n) {
    var r = Uo(Pa, n);
    Aa(t, r);
  }
}, ur = {
  data: function() {
    return {
      mounted: !1
    };
  },
  mounted: function() {
    this.mounted = rr();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function Na(e, t, n, r, o, a) {
  return a.inline ? X(e.$slots, "default", {
    key: 0
  }) : o.mounted ? (m(), B(Fn, {
    key: 1,
    to: n.appendTo
  }, [X(e.$slots, "default")], 8, ["to"])) : E("", !0);
}
ur.render = Na;
var Oe = {
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
function za() {
  var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pc", t = qr();
  return "".concat(e).concat(t.replace("v-", "").replaceAll("-", "_"));
}
var Tn = H.extend({
  name: "common"
});
function rt(e) {
  "@babel/helpers - typeof";
  return rt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, rt(e);
}
function Ia(e) {
  return mr(e) || Ra(e) || fr(e) || pr();
}
function Ra(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Fe(e, t) {
  return mr(e) || Va(e, t) || fr(e, t) || pr();
}
function pr() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function fr(e, t) {
  if (e) {
    if (typeof e == "string") return Rt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Rt(e, t) : void 0;
  }
}
function Rt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Va(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, o, a, s, c = [], i = !0, d = !1;
    try {
      if (a = (n = n.call(e)).next, t === 0) {
        if (Object(n) !== n) return;
        i = !1;
      } else for (; !(i = (r = a.call(n)).done) && (c.push(r.value), c.length !== t); i = !0) ;
    } catch (l) {
      d = !0, o = l;
    } finally {
      try {
        if (!i && n.return != null && (s = n.return(), Object(s) !== s)) return;
      } finally {
        if (d) throw o;
      }
    }
    return c;
  }
}
function mr(e) {
  if (Array.isArray(e)) return e;
}
function Pn(e, t) {
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
    t % 2 ? Pn(Object(n), !0).forEach(function(r) {
      qe(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Pn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function qe(e, t, n) {
  return (t = Ba(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ba(e) {
  var t = Da(e, "string");
  return rt(t) == "symbol" ? t : t + "";
}
function Da(e, t) {
  if (rt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (rt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var je = {
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
        var r = this;
        te.off("theme:change", this._themeScopedListener), t ? (this._loadScopedThemeStyles(t), this._themeScopedListener = function() {
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
    var t, n, r, o, a, s, c, i, d, l, u, p = (t = this.pt) === null || t === void 0 ? void 0 : t._usept, f = p ? (n = this.pt) === null || n === void 0 || (n = n.originalValue) === null || n === void 0 ? void 0 : n[this.$.type.name] : void 0, k = p ? (r = this.pt) === null || r === void 0 || (r = r.value) === null || r === void 0 ? void 0 : r[this.$.type.name] : this.pt;
    (o = k || f) === null || o === void 0 || (o = o.hooks) === null || o === void 0 || (a = o.onBeforeCreate) === null || a === void 0 || a.call(o);
    var T = (s = this.$primevueConfig) === null || s === void 0 || (s = s.pt) === null || s === void 0 ? void 0 : s._usept, C = T ? (c = this.$primevue) === null || c === void 0 || (c = c.config) === null || c === void 0 || (c = c.pt) === null || c === void 0 ? void 0 : c.originalValue : void 0, O = T ? (i = this.$primevue) === null || i === void 0 || (i = i.config) === null || i === void 0 || (i = i.pt) === null || i === void 0 ? void 0 : i.value : (d = this.$primevue) === null || d === void 0 || (d = d.config) === null || d === void 0 ? void 0 : d.pt;
    (l = O || C) === null || l === void 0 || (l = l[this.$.type.name]) === null || l === void 0 || (l = l.hooks) === null || l === void 0 || (u = l.onBeforeCreate) === null || u === void 0 || u.call(l), this.$attrSelector = za(), this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
  },
  created: function() {
    this._hook("onCreated");
  },
  beforeMount: function() {
    var t;
    this.rootEl = Je(ut(this.$el) ? this.$el : (t = this.$el) === null || t === void 0 ? void 0 : t.parentElement, "[".concat(this.$attrSelector, "]")), this.rootEl && (this.rootEl.$pc = V({
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
      return Qt(t) ? t.apply(void 0, r) : W.apply(void 0, r);
    },
    _load: function() {
      Oe.isStyleNameLoaded("base") || (H.loadCSS(this.$styleOptions), this._loadGlobalStyles(), Oe.setLoadedStyleName("base")), this._loadThemeStyles();
    },
    _loadStyles: function() {
      this._load(), this._themeChangeListener(this._load);
    },
    _loadCoreStyles: function() {
      var t, n;
      !Oe.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name && (Tn.loadCSS(this.$styleOptions), this.$options.style && this.$style.loadCSS(this.$styleOptions), Oe.setLoadedStyleName(this.$style.name));
    },
    _loadGlobalStyles: function() {
      var t = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
      q(t) && H.load(t, V({
        name: "global"
      }, this.$styleOptions));
    },
    _loadThemeStyles: function() {
      var t, n;
      if (!(this.isUnstyled || this.$theme === "none")) {
        if (!K.isStyleNameLoaded("common")) {
          var r, o, a = ((r = this.$style) === null || r === void 0 || (o = r.getCommonTheme) === null || o === void 0 ? void 0 : o.call(r)) || {}, s = a.primitive, c = a.semantic, i = a.global, d = a.style;
          H.load(s?.css, V({
            name: "primitive-variables"
          }, this.$styleOptions)), H.load(c?.css, V({
            name: "semantic-variables"
          }, this.$styleOptions)), H.load(i?.css, V({
            name: "global-variables"
          }, this.$styleOptions)), H.loadStyle(V({
            name: "global-style"
          }, this.$styleOptions), d), K.setLoadedStyleName("common");
        }
        if (!K.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name) {
          var l, u, p, f, k = ((l = this.$style) === null || l === void 0 || (u = l.getComponentTheme) === null || u === void 0 ? void 0 : u.call(l)) || {}, T = k.css, C = k.style;
          (p = this.$style) === null || p === void 0 || p.load(T, V({
            name: "".concat(this.$style.name, "-variables")
          }, this.$styleOptions)), (f = this.$style) === null || f === void 0 || f.loadStyle(V({
            name: "".concat(this.$style.name, "-style")
          }, this.$styleOptions), C), K.setLoadedStyleName(this.$style.name);
        }
        if (!K.isStyleNameLoaded("layer-order")) {
          var O, S, D = (O = this.$style) === null || O === void 0 || (S = O.getLayerOrderThemeCSS) === null || S === void 0 ? void 0 : S.call(O);
          H.load(D, V({
            name: "layer-order",
            first: !0
          }, this.$styleOptions)), K.setLoadedStyleName("layer-order");
        }
      }
    },
    _loadScopedThemeStyles: function(t) {
      var n, r, o, a = ((n = this.$style) === null || n === void 0 || (r = n.getPresetTheme) === null || r === void 0 ? void 0 : r.call(n, t, "[".concat(this.$attrSelector, "]"))) || {}, s = a.css, c = (o = this.$style) === null || o === void 0 ? void 0 : o.load(s, V({
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
      Oe.clearLoadedStyleNames(), te.on("theme:change", t);
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
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return Zt(t, n, r);
    },
    _getPTValue: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, a = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, s = /./g.test(r) && !!o[r.split(".")[0]], c = this._getPropValue("ptOptions") || ((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.ptOptions) || {}, i = c.mergeSections, d = i === void 0 ? !0 : i, l = c.mergeProps, u = l === void 0 ? !1 : l, p = a ? s ? this._useGlobalPT(this._getPTClassValue, r, o) : this._useDefaultPT(this._getPTClassValue, r, o) : void 0, f = s ? void 0 : this._getPTSelf(n, this._getPTClassValue, r, V(V({}, o), {}, {
        global: p || {}
      })), k = this._getPTDatasets(r);
      return d || !d && f ? u ? this._mergeProps(u, p, f, k) : V(V(V({}, p), f), k) : V(V({}, f), k);
    },
    _getPTSelf: function() {
      for (var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), o = 1; o < n; o++)
        r[o - 1] = arguments[o];
      return W(
        this._usePT.apply(this, [this._getPT(t, this.$name)].concat(r)),
        // Exp; <component :pt="{}"
        this._usePT.apply(this, [this.$_attrsPT].concat(r))
        // Exp; <component :pt:[passthrough_key]:[attribute]="{value}" or <component :pt:[passthrough_key]="() =>{value}"
      );
    },
    _getPTDatasets: function() {
      var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", o = "data-pc-", a = r === "root" && q((t = this.pt) === null || t === void 0 ? void 0 : t["data-pc-section"]);
      return r !== "transition" && V(V({}, r === "root" && V(V(qe({}, "".concat(o, "name"), _e(a ? (n = this.pt) === null || n === void 0 ? void 0 : n["data-pc-section"] : this.$.type.name)), a && qe({}, "".concat(o, "extend"), _e(this.$.type.name))), {}, qe({}, "".concat(this.$attrSelector), ""))), {}, qe({}, "".concat(o, "section"), _e(r)));
    },
    _getPTClassValue: function() {
      var t = this._getOptionValue.apply(this, arguments);
      return le(t) || Jn(t) ? {
        class: t
      } : t;
    },
    _getPT: function(t) {
      var n = this, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 ? arguments[2] : void 0, a = function(c) {
        var i, d = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, l = o ? o(c) : c, u = _e(r), p = _e(n.$name);
        return (i = d ? u !== p ? l?.[u] : void 0 : l?.[u]) !== null && i !== void 0 ? i : l;
      };
      return t != null && t.hasOwnProperty("_usept") ? {
        _usept: t._usept,
        originalValue: a(t.originalValue),
        value: a(t.value)
      } : a(t, !0);
    },
    _usePT: function(t, n, r, o) {
      var a = function(T) {
        return n(T, r, o);
      };
      if (t != null && t.hasOwnProperty("_usept")) {
        var s, c = t._usept || ((s = this.$primevueConfig) === null || s === void 0 ? void 0 : s.ptOptions) || {}, i = c.mergeSections, d = i === void 0 ? !0 : i, l = c.mergeProps, u = l === void 0 ? !1 : l, p = a(t.originalValue), f = a(t.value);
        return p === void 0 && f === void 0 ? void 0 : le(f) ? f : le(p) ? p : d || !d && f ? u ? this._mergeProps(u, p, f) : V(V({}, p), f) : f;
      }
      return a(t);
    },
    _useGlobalPT: function(t, n, r) {
      return this._usePT(this.globalPT, t, n, r);
    },
    _useDefaultPT: function(t, n, r) {
      return this._usePT(this.defaultPT, t, n, r);
    },
    ptm: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this._getPTValue(this.pt, t, V(V({}, this.$params), n));
    },
    ptmi: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = W(this.$_attrsWithoutPT, this.ptm(n, r));
      return o?.hasOwnProperty("id") && ((t = o.id) !== null && t !== void 0 || (o.id = this.$id)), o;
    },
    ptmo: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return this._getPTValue(t, n, V({
        instance: this
      }, r), !1);
    },
    cx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this.isUnstyled ? void 0 : this._getOptionValue(this.$style.classes, t, V(V({}, this.$params), n));
    },
    sx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      if (n) {
        var o = this._getOptionValue(this.$style.inlineStyles, t, V(V({}, this.$params), r)), a = this._getOptionValue(Tn.inlineStyles, t, V(V({}, this.$params), r));
        return [a, o];
      }
    }
  },
  computed: {
    globalPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(r) {
        return pe(r, {
          instance: n
        });
      });
    },
    defaultPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(r) {
        return n._getOptionValue(r, n.$name, V({}, n.$params)) || pe(r, V({}, n.$params));
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
        var o = Fe(r, 1), a = o[0];
        return n?.includes(a);
      }));
    },
    $theme: function() {
      var t;
      return (t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.theme;
    },
    $style: function() {
      return V(V({
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
        var n = Fe(t, 1), r = n[0];
        return r?.startsWith("pt:");
      }).reduce(function(t, n) {
        var r = Fe(n, 2), o = r[0], a = r[1], s = o.split(":"), c = Ia(s), i = Rt(c).slice(1);
        return i?.reduce(function(d, l, u, p) {
          return !d[l] && (d[l] = u === p.length - 1 ? a : {}), d[l];
        }, t), t;
      }, {});
    },
    $_attrsWithoutPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(t) {
        var n = Fe(t, 1), r = n[0];
        return !(r != null && r.startsWith("pt:"));
      }).reduce(function(t, n) {
        var r = Fe(n, 2), o = r[0], a = r[1];
        return t[o] = a, t;
      }, {});
    }
  }
}, Ma = `
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
`, Ua = H.extend({
  name: "baseicon",
  css: Ma
});
function ot(e) {
  "@babel/helpers - typeof";
  return ot = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ot(e);
}
function On(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function An(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? On(Object(n), !0).forEach(function(r) {
      Wa(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : On(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Wa(e, t, n) {
  return (t = Fa(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Fa(e) {
  var t = Ha(e, "string");
  return ot(t) == "symbol" ? t : t + "";
}
function Ha(e, t) {
  if (ot(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ot(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Jt = {
  name: "BaseIcon",
  extends: je,
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
  style: Ua,
  provide: function() {
    return {
      $pcIcon: this,
      $parentInstance: this
    };
  },
  methods: {
    pti: function() {
      var t = Re(this.label);
      return An(An({}, !this.isUnstyled && {
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
function at(e) {
  "@babel/helpers - typeof";
  return at = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, at(e);
}
function Ln(e, t) {
  return Ga(e) || Ya(e, t) || qa(e, t) || Ka();
}
function Ka() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function qa(e, t) {
  if (e) {
    if (typeof e == "string") return En(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? En(e, t) : void 0;
  }
}
function En(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Ya(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, o, a, s, c = [], i = !0, d = !1;
    try {
      if (a = (n = n.call(e)).next, t !== 0) for (; !(i = (r = a.call(n)).done) && (c.push(r.value), c.length !== t); i = !0) ;
    } catch (l) {
      d = !0, o = l;
    } finally {
      try {
        if (!i && n.return != null && (s = n.return(), Object(s) !== s)) return;
      } finally {
        if (d) throw o;
      }
    }
    return c;
  }
}
function Ga(e) {
  if (Array.isArray(e)) return e;
}
function jn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function F(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? jn(Object(n), !0).forEach(function(r) {
      Vt(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : jn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Vt(e, t, n) {
  return (t = Qa(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Qa(e) {
  var t = Za(e, "string");
  return at(t) == "symbol" ? t : t + "";
}
function Za(e, t) {
  if (at(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (at(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var z = {
  _getMeta: function() {
    return [Se(arguments.length <= 0 ? void 0 : arguments[0]) || arguments.length <= 0 ? void 0 : arguments[0], pe(Se(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getConfig: function(t, n) {
    var r, o, a;
    return (r = (t == null || (o = t.instance) === null || o === void 0 ? void 0 : o.$primevue) || (n == null || (a = n.ctx) === null || a === void 0 || (a = a.appContext) === null || a === void 0 || (a = a.config) === null || a === void 0 || (a = a.globalProperties) === null || a === void 0 ? void 0 : a.$primevue)) === null || r === void 0 ? void 0 : r.config;
  },
  _getOptionValue: Zt,
  _getPTValue: function() {
    var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", s = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, c = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, i = function() {
      var S = z._getOptionValue.apply(z, arguments);
      return le(S) || Jn(S) ? {
        class: S
      } : S;
    }, d = ((t = r.binding) === null || t === void 0 || (t = t.value) === null || t === void 0 ? void 0 : t.ptOptions) || ((n = r.$primevueConfig) === null || n === void 0 ? void 0 : n.ptOptions) || {}, l = d.mergeSections, u = l === void 0 ? !0 : l, p = d.mergeProps, f = p === void 0 ? !1 : p, k = c ? z._useDefaultPT(r, r.defaultPT(), i, a, s) : void 0, T = z._usePT(r, z._getPT(o, r.$name), i, a, F(F({}, s), {}, {
      global: k || {}
    })), C = z._getPTDatasets(r, a);
    return u || !u && T ? f ? z._mergeProps(r, f, k, T, C) : F(F(F({}, k), T), C) : F(F({}, T), C);
  },
  _getPTDatasets: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = "data-pc-";
    return F(F({}, n === "root" && Vt({}, "".concat(r, "name"), _e(t.$name))), {}, Vt({}, "".concat(r, "section"), _e(n)));
  },
  _getPT: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 ? arguments[2] : void 0, o = function(s) {
      var c, i = r ? r(s) : s, d = _e(n);
      return (c = i?.[d]) !== null && c !== void 0 ? c : i;
    };
    return t && Object.hasOwn(t, "_usept") ? {
      _usept: t._usept,
      originalValue: o(t.originalValue),
      value: o(t.value)
    } : o(t);
  },
  _usePT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = arguments.length > 2 ? arguments[2] : void 0, o = arguments.length > 3 ? arguments[3] : void 0, a = arguments.length > 4 ? arguments[4] : void 0, s = function(C) {
      return r(C, o, a);
    };
    if (n && Object.hasOwn(n, "_usept")) {
      var c, i = n._usept || ((c = t.$primevueConfig) === null || c === void 0 ? void 0 : c.ptOptions) || {}, d = i.mergeSections, l = d === void 0 ? !0 : d, u = i.mergeProps, p = u === void 0 ? !1 : u, f = s(n.originalValue), k = s(n.value);
      return f === void 0 && k === void 0 ? void 0 : le(k) ? k : le(f) ? f : l || !l && k ? p ? z._mergeProps(t, p, f, k) : F(F({}, f), k) : k;
    }
    return s(n);
  },
  _useDefaultPT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 ? arguments[2] : void 0, o = arguments.length > 3 ? arguments[3] : void 0, a = arguments.length > 4 ? arguments[4] : void 0;
    return z._usePT(t, n, r, o, a);
  },
  _loadStyles: function() {
    var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 ? arguments[1] : void 0, o = arguments.length > 2 ? arguments[2] : void 0, a = z._getConfig(r, o), s = {
      nonce: a == null || (t = a.csp) === null || t === void 0 ? void 0 : t.nonce
    };
    z._loadCoreStyles(n, s), z._loadThemeStyles(n, s), z._loadScopedThemeStyles(n, s), z._removeThemeListeners(n), n.$loadStyles = function() {
      return z._loadThemeStyles(n, s);
    }, z._themeChangeListener(n.$loadStyles);
  },
  _loadCoreStyles: function() {
    var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 ? arguments[1] : void 0;
    if (!Oe.isStyleNameLoaded((t = r.$style) === null || t === void 0 ? void 0 : t.name) && (n = r.$style) !== null && n !== void 0 && n.name) {
      var a;
      H.loadCSS(o), (a = r.$style) === null || a === void 0 || a.loadCSS(o), Oe.setLoadedStyleName(r.$style.name);
    }
  },
  _loadThemeStyles: function() {
    var t, n, r, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, a = arguments.length > 1 ? arguments[1] : void 0;
    if (!(o != null && o.isUnstyled() || (o == null || (t = o.theme) === null || t === void 0 ? void 0 : t.call(o)) === "none")) {
      if (!K.isStyleNameLoaded("common")) {
        var s, c, i = ((s = o.$style) === null || s === void 0 || (c = s.getCommonTheme) === null || c === void 0 ? void 0 : c.call(s)) || {}, d = i.primitive, l = i.semantic, u = i.global, p = i.style;
        H.load(d?.css, F({
          name: "primitive-variables"
        }, a)), H.load(l?.css, F({
          name: "semantic-variables"
        }, a)), H.load(u?.css, F({
          name: "global-variables"
        }, a)), H.loadStyle(F({
          name: "global-style"
        }, a), p), K.setLoadedStyleName("common");
      }
      if (!K.isStyleNameLoaded((n = o.$style) === null || n === void 0 ? void 0 : n.name) && (r = o.$style) !== null && r !== void 0 && r.name) {
        var f, k, T, C, O = ((f = o.$style) === null || f === void 0 || (k = f.getDirectiveTheme) === null || k === void 0 ? void 0 : k.call(f)) || {}, S = O.css, D = O.style;
        (T = o.$style) === null || T === void 0 || T.load(S, F({
          name: "".concat(o.$style.name, "-variables")
        }, a)), (C = o.$style) === null || C === void 0 || C.loadStyle(F({
          name: "".concat(o.$style.name, "-style")
        }, a), D), K.setLoadedStyleName(o.$style.name);
      }
      if (!K.isStyleNameLoaded("layer-order")) {
        var v, A, j = (v = o.$style) === null || v === void 0 || (A = v.getLayerOrderThemeCSS) === null || A === void 0 ? void 0 : A.call(v);
        H.load(j, F({
          name: "layer-order",
          first: !0
        }, a)), K.setLoadedStyleName("layer-order");
      }
    }
  },
  _loadScopedThemeStyles: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = t.preset();
    if (r && t.$attrSelector) {
      var o, a, s, c = ((o = t.$style) === null || o === void 0 || (a = o.getPresetTheme) === null || a === void 0 ? void 0 : a.call(o, r, "[".concat(t.$attrSelector, "]"))) || {}, i = c.css, d = (s = t.$style) === null || s === void 0 ? void 0 : s.load(i, F({
        name: "".concat(t.$attrSelector, "-").concat(t.$style.name)
      }, n));
      t.scopedStyleEl = d.el;
    }
  },
  _themeChangeListener: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
    };
    Oe.clearLoadedStyleNames(), te.on("theme:change", t);
  },
  _removeThemeListeners: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    te.off("theme:change", t.$loadStyles), t.$loadStyles = void 0;
  },
  _hook: function(t, n, r, o, a, s) {
    var c, i, d = "on".concat(Wo(n)), l = z._getConfig(o, a), u = r?.$instance, p = z._usePT(u, z._getPT(o == null || (c = o.value) === null || c === void 0 ? void 0 : c.pt, t), z._getOptionValue, "hooks.".concat(d)), f = z._useDefaultPT(u, l == null || (i = l.pt) === null || i === void 0 || (i = i.directives) === null || i === void 0 ? void 0 : i[t], z._getOptionValue, "hooks.".concat(d)), k = {
      el: r,
      binding: o,
      vnode: a,
      prevVnode: s
    };
    p?.(u, k), f?.(u, k);
  },
  /* eslint-disable-next-line no-unused-vars */
  _mergeProps: function() {
    for (var t = arguments.length > 1 ? arguments[1] : void 0, n = arguments.length, r = new Array(n > 2 ? n - 2 : 0), o = 2; o < n; o++)
      r[o - 2] = arguments[o];
    return Qt(t) ? t.apply(void 0, r) : W.apply(void 0, r);
  },
  _extend: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = function(c, i, d, l, u) {
      var p, f, k, T;
      i._$instances = i._$instances || {};
      var C = z._getConfig(d, l), O = i._$instances[t] || {}, S = Re(O) ? F(F({}, n), n?.methods) : {};
      i._$instances[t] = F(F({}, O), {}, {
        /* new instance variables to pass in directive methods */
        $name: t,
        $host: i,
        $binding: d,
        $modifiers: d?.modifiers,
        $value: d?.value,
        $el: O.$el || i || void 0,
        $style: F({
          classes: void 0,
          inlineStyles: void 0,
          load: function() {
          },
          loadCSS: function() {
          },
          loadStyle: function() {
          }
        }, n?.style),
        $primevueConfig: C,
        $attrSelector: (p = i.$pd) === null || p === void 0 || (p = p[t]) === null || p === void 0 ? void 0 : p.attrSelector,
        /* computed instance variables */
        defaultPT: function() {
          return z._getPT(C?.pt, void 0, function(v) {
            var A;
            return v == null || (A = v.directives) === null || A === void 0 ? void 0 : A[t];
          });
        },
        isUnstyled: function() {
          var v, A;
          return ((v = i._$instances[t]) === null || v === void 0 || (v = v.$binding) === null || v === void 0 || (v = v.value) === null || v === void 0 ? void 0 : v.unstyled) !== void 0 ? (A = i._$instances[t]) === null || A === void 0 || (A = A.$binding) === null || A === void 0 || (A = A.value) === null || A === void 0 ? void 0 : A.unstyled : C?.unstyled;
        },
        theme: function() {
          var v;
          return (v = i._$instances[t]) === null || v === void 0 || (v = v.$primevueConfig) === null || v === void 0 ? void 0 : v.theme;
        },
        preset: function() {
          var v;
          return (v = i._$instances[t]) === null || v === void 0 || (v = v.$binding) === null || v === void 0 || (v = v.value) === null || v === void 0 ? void 0 : v.dt;
        },
        /* instance's methods */
        ptm: function() {
          var v, A = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", j = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return z._getPTValue(i._$instances[t], (v = i._$instances[t]) === null || v === void 0 || (v = v.$binding) === null || v === void 0 || (v = v.value) === null || v === void 0 ? void 0 : v.pt, A, F({}, j));
        },
        ptmo: function() {
          var v = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, A = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", j = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return z._getPTValue(i._$instances[t], v, A, j, !1);
        },
        cx: function() {
          var v, A, j = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", M = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return (v = i._$instances[t]) !== null && v !== void 0 && v.isUnstyled() ? void 0 : z._getOptionValue((A = i._$instances[t]) === null || A === void 0 || (A = A.$style) === null || A === void 0 ? void 0 : A.classes, j, F({}, M));
        },
        sx: function() {
          var v, A = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", j = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, M = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return j ? z._getOptionValue((v = i._$instances[t]) === null || v === void 0 || (v = v.$style) === null || v === void 0 ? void 0 : v.inlineStyles, A, F({}, M)) : void 0;
        }
      }, S), i.$instance = i._$instances[t], (f = (k = i.$instance)[c]) === null || f === void 0 || f.call(k, i, d, l, u), i["$".concat(t)] = i.$instance, z._hook(t, c, i, d, l, u), i.$pd || (i.$pd = {}), i.$pd[t] = F(F({}, (T = i.$pd) === null || T === void 0 ? void 0 : T[t]), {}, {
        name: t,
        instance: i._$instances[t]
      });
    }, o = function(c) {
      var i, d, l, u = c._$instances[t], p = u?.watch, f = function(C) {
        var O, S = C.newValue, D = C.oldValue;
        return p == null || (O = p.config) === null || O === void 0 ? void 0 : O.call(u, S, D);
      }, k = function(C) {
        var O, S = C.newValue, D = C.oldValue;
        return p == null || (O = p["config.ripple"]) === null || O === void 0 ? void 0 : O.call(u, S, D);
      };
      u.$watchersCallback = {
        config: f,
        "config.ripple": k
      }, p == null || (i = p.config) === null || i === void 0 || i.call(u, u?.$primevueConfig), Le.on("config:change", f), p == null || (d = p["config.ripple"]) === null || d === void 0 || d.call(u, u == null || (l = u.$primevueConfig) === null || l === void 0 ? void 0 : l.ripple), Le.on("config:ripple:change", k);
    }, a = function(c) {
      var i = c._$instances[t].$watchersCallback;
      i && (Le.off("config:change", i.config), Le.off("config:ripple:change", i["config.ripple"]), c._$instances[t].$watchersCallback = void 0);
    };
    return {
      created: function(c, i, d, l) {
        c.$pd || (c.$pd = {}), c.$pd[t] = {
          name: t,
          attrSelector: Zo("pd")
        }, r("created", c, i, d, l);
      },
      beforeMount: function(c, i, d, l) {
        var u;
        z._loadStyles((u = c.$pd[t]) === null || u === void 0 ? void 0 : u.instance, i, d), r("beforeMount", c, i, d, l), o(c);
      },
      mounted: function(c, i, d, l) {
        var u;
        z._loadStyles((u = c.$pd[t]) === null || u === void 0 ? void 0 : u.instance, i, d), r("mounted", c, i, d, l);
      },
      beforeUpdate: function(c, i, d, l) {
        r("beforeUpdate", c, i, d, l);
      },
      updated: function(c, i, d, l) {
        var u;
        z._loadStyles((u = c.$pd[t]) === null || u === void 0 ? void 0 : u.instance, i, d), r("updated", c, i, d, l);
      },
      beforeUnmount: function(c, i, d, l) {
        var u;
        a(c), z._removeThemeListeners((u = c.$pd[t]) === null || u === void 0 ? void 0 : u.instance), r("beforeUnmount", c, i, d, l);
      },
      unmounted: function(c, i, d, l) {
        var u;
        (u = c.$pd[t]) === null || u === void 0 || (u = u.instance) === null || u === void 0 || (u = u.scopedStyleEl) === null || u === void 0 || (u = u.value) === null || u === void 0 || u.remove(), r("unmounted", c, i, d, l);
      }
    };
  },
  extend: function() {
    var t = z._getMeta.apply(z, arguments), n = Ln(t, 2), r = n[0], o = n[1];
    return F({
      extend: function() {
        var s = z._getMeta.apply(z, arguments), c = Ln(s, 2), i = c[0], d = c[1];
        return z.extend(i, F(F(F({}, o), o?.methods), d));
      }
    }, z._extend(r, o));
  }
}, Ja = `
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
`, Xa = {
  root: "p-ink"
}, ei = H.extend({
  name: "ripple-directive",
  style: Ja,
  classes: Xa
}), ti = z.extend({
  style: ei
});
function it(e) {
  "@babel/helpers - typeof";
  return it = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, it(e);
}
function ni(e) {
  return ii(e) || ai(e) || oi(e) || ri();
}
function ri() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function oi(e, t) {
  if (e) {
    if (typeof e == "string") return Bt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Bt(e, t) : void 0;
  }
}
function ai(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function ii(e) {
  if (Array.isArray(e)) return Bt(e);
}
function Bt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Nn(e, t, n) {
  return (t = si(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function si(e) {
  var t = li(e, "string");
  return it(t) == "symbol" ? t : t + "";
}
function li(e, t) {
  if (it(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (it(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Xt = ti.extend("ripple", {
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
      n || (n = Yo("span", Nn(Nn({
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
        if (!this.isUnstyled() && Tt(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "false"), !zt(o) && !Ge(o)) {
          var a = Math.max(tr(r), nr(r));
          o.style.height = a + "px", o.style.width = a + "px";
        }
        var s = Ke(r), c = t.pageX - s.left + document.body.scrollTop - Ge(o) / 2, i = t.pageY - s.top + document.body.scrollLeft - zt(o) / 2;
        o.style.top = i + "px", o.style.left = c + "px", !this.isUnstyled() && Ho(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "true"), this.timeout = setTimeout(function() {
          o && (!n.isUnstyled() && Tt(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "false"));
        }, 401);
      }
    },
    onAnimationEnd: function(t) {
      this.timeout && clearTimeout(this.timeout), !this.isUnstyled() && Tt(t.currentTarget, "p-ink-active"), t.currentTarget.setAttribute("data-p-ink-active", "false");
    },
    getInk: function(t) {
      return t && t.children ? ni(t.children).find(function(n) {
        return He(n, "data-pc-name") === "ripple";
      }) : void 0;
    }
  }
});
const ci = "data-wippy-overlay-layer";
function br() {
  return typeof window < "u" && typeof window.document < "u";
}
function vr() {
  return br() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function di() {
  return vr() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const ui = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let pi = 0;
const wt = /* @__PURE__ */ new WeakMap();
function zn(e, t) {
  const n = e.style;
  n.setProperty("position", "fixed", "important"), n.setProperty("inset", "auto", "important"), n.setProperty("margin", "0", "important"), n.setProperty("position-anchor", t), n.setProperty("position-area", "bottom span-right"), n.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), n.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), n.setProperty("max-width", "stretch", "important");
}
function fi(e, t) {
  if (!ui.test(e.className))
    return;
  const n = e.style.cssText;
  zn(e, t), e.getAttribute("popover") !== "manual" && e.setAttribute("popover", "manual");
  try {
    e.matches(":popover-open") || e.showPopover();
  } catch {
  }
  if (!e.matches(":popover-open")) {
    e.removeAttribute("popover"), e.style.cssText = n;
    return;
  }
  if (!wt.has(e)) {
    const r = new MutationObserver(() => {
      const o = e.style;
      (o.top !== "auto" || o.left !== "auto" || o.margin !== "0px" || o.getPropertyPriority("top") !== "important" || o.getPropertyPriority("left") !== "important" || o.getPropertyPriority("margin") !== "important" || o.getPropertyPriority("min-width") !== "important" || o.maxWidth !== "stretch" || o.getPropertyPriority("max-width") !== "important") && zn(e, t);
    });
    r.observe(e, { attributes: !0, attributeFilter: ["style"] }), wt.set(e, r);
  }
}
function en(e) {
  const t = wt.get(e);
  t && (t.disconnect(), wt.delete(e));
}
function mi(e) {
  const t = e && typeof e.getRootNode == "function" ? e.getRootNode() : null;
  return t instanceof ShadowRoot ? t : null;
}
function Dt(e) {
  e.style.top = "0px", e.style.left = "0px";
  const t = e.getBoundingClientRect();
  e.style.top = `${-window.scrollY - t.top}px`, e.style.left = `${-window.scrollX - t.left}px`;
}
const _t = /* @__PURE__ */ new Set(), tn = /* @__PURE__ */ new WeakMap();
let In = !1, Mt = !1;
function bi() {
  Mt = !1;
  for (const e of _t) {
    if (!e.isConnected) {
      for (const t of Array.from(e.children))
        t instanceof HTMLElement && en(t);
      _t.delete(e), tn.get(e)?.disconnect();
      continue;
    }
    e.childElementCount > 0 && Dt(e);
  }
}
function Rn() {
  Mt || (Mt = !0, requestAnimationFrame(bi));
}
function vi(e) {
  const t = document.createElement("div");
  t.setAttribute(ci, "");
  const n = vr();
  if (t.style.cssText = n ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", n && t.setAttribute("popover", "manual"), e.appendChild(t), n) {
    try {
      t.showPopover();
    } catch {
    }
    t.matches(":popover-open") || (t.removeAttribute("popover"), t.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  Dt(t);
  const r = new MutationObserver((o) => {
    const a = t.__wippyAnchorName;
    for (const s of o) {
      if (a)
        for (const c of Array.from(s.addedNodes))
          c instanceof HTMLElement && fi(c, a);
      for (const c of Array.from(s.removedNodes))
        c instanceof HTMLElement && en(c);
    }
    t.isConnected && t.childElementCount > 0 && Dt(t);
  });
  return r.observe(t, { childList: !0 }), tn.set(t, r), _t.add(t), In || (In = !0, window.addEventListener("scroll", Rn, { capture: !0, passive: !0 }), window.addEventListener("resize", Rn, { passive: !0 })), t;
}
function Vn(e) {
  if (!(!e.hostRoot || e.layer) && (e.layer = vi(e.hostRoot), di())) {
    const t = e.$el ? e.$el.parentElement : null;
    t && (e.anchorName = `--wippy-a-${++pi}`, e.anchorTrigger = t, t.style.setProperty("anchor-name", e.anchorName), e.layer.__wippyAnchorName = e.anchorName);
  }
}
function Bn(e) {
  if (e.anchorTrigger && (e.anchorTrigger.style.removeProperty("anchor-name"), e.anchorTrigger = null), e.anchorName = null, e.layer) {
    for (const t of Array.from(e.layer.children))
      t instanceof HTMLElement && en(t);
    _t.delete(e.layer), tn.get(e.layer)?.disconnect(), e.layer.remove(), e.layer = null;
  }
}
let Dn = !1;
function hi() {
  if (Dn)
    return;
  Dn = !0;
  const e = ur;
  e.computed = e.computed || {}, e.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, e.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, e.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, e.mounted = function() {
    br() && (this.hostRoot = mi(this.$el), this.mounted = !0, this.hostRoot && (this.inline || Vn(this), this.$watch("inline", (t) => {
      t ? Bn(this) : Vn(this);
    })));
  }, e.render = function() {
    return this.inline ? X(this.$slots, "default", { key: 0 }) : this.mounted ? Yr(Fn, { key: 1, to: this.resolvedTarget || document.body }, [
      X(this.$slots, "default")
    ]) : E("", !0);
  }, e.unmounted = function() {
    Bn(this);
  };
}
const gi = {
  install: (e) => {
    hi(), e.use(ja, { theme: "none" });
  }
};
var yi = {
  root: function(t) {
    var n = t.instance, r = t.props;
    return ["p-tab", {
      "p-tab-active": n.active,
      "p-disabled": r.disabled
    }];
  }
}, xi = H.extend({
  name: "tab",
  classes: yi
}), ki = {
  name: "BaseTab",
  extends: je,
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
  style: xi,
  provide: function() {
    return {
      $pcTab: this,
      $parentInstance: this
    };
  }
}, Ut = {
  name: "Tab",
  extends: ki,
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
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, r = n ? t : t.nextElementSibling;
      return r ? He(r, "data-p-disabled") || He(r, "data-pc-section") === "activebar" ? this.findNextTab(r) : Je(r, '[data-pc-name="tab"]') : null;
    },
    findPrevTab: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, r = n ? t : t.previousElementSibling;
      return r ? He(r, "data-p-disabled") || He(r, "data-pc-section") === "activebar" ? this.findPrevTab(r) : Je(r, '[data-pc-name="tab"]') : null;
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
      Go(n), this.scrollInView(n);
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
      return Bo((t = this.$pcTabs) === null || t === void 0 ? void 0 : t.d_value, this.value);
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
      return W(this.asAttrs, this.a11yAttrs, this.ptmi("root", this.ptParams));
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
      return Ee({
        active: this.active
      });
    }
  },
  directives: {
    ripple: Xt
  }
};
function wi(e, t, n, r, o, a) {
  var s = Yt("ripple");
  return e.asChild ? X(e.$slots, "default", {
    key: 1,
    dataP: a.dataP,
    class: ne(e.cx("root")),
    active: a.active,
    a11yAttrs: a.a11yAttrs,
    onClick: a.onClick
  }) : We((m(), B(Ze(e.as), W({
    key: 0,
    class: e.cx("root"),
    "data-p": a.dataP,
    onClick: a.onClick
  }, a.attrs), {
    default: I(function() {
      return [X(e.$slots, "default")];
    }),
    _: 3
  }, 16, ["class", "data-p", "onClick"])), [[s]]);
}
Ut.render = wi;
var hr = {
  name: "ChevronLeftIcon",
  extends: Jt
};
function _i(e) {
  return Ti(e) || Ci(e) || $i(e) || Si();
}
function Si() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function $i(e, t) {
  if (e) {
    if (typeof e == "string") return Wt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Wt(e, t) : void 0;
  }
}
function Ci(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Ti(e) {
  if (Array.isArray(e)) return Wt(e);
}
function Wt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Pi(e, t, n, r, o, a) {
  return m(), y("svg", W({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), _i(t[0] || (t[0] = [b("path", {
    d: "M9.61296 13C9.50997 13.0005 9.40792 12.9804 9.3128 12.9409C9.21767 12.9014 9.13139 12.8433 9.05902 12.7701L3.83313 7.54416C3.68634 7.39718 3.60388 7.19795 3.60388 6.99022C3.60388 6.78249 3.68634 6.58325 3.83313 6.43628L9.05902 1.21039C9.20762 1.07192 9.40416 0.996539 9.60724 1.00012C9.81032 1.00371 10.0041 1.08597 10.1477 1.22959C10.2913 1.37322 10.3736 1.56698 10.3772 1.77005C10.3808 1.97313 10.3054 2.16968 10.1669 2.31827L5.49496 6.99022L10.1669 11.6622C10.3137 11.8091 10.3962 12.0084 10.3962 12.2161C10.3962 12.4238 10.3137 12.6231 10.1669 12.7701C10.0945 12.8433 10.0083 12.9014 9.91313 12.9409C9.81801 12.9804 9.71596 13.0005 9.61296 13Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
hr.render = Pi;
var gr = {
  name: "ChevronRightIcon",
  extends: Jt
};
function Oi(e) {
  return ji(e) || Ei(e) || Li(e) || Ai();
}
function Ai() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Li(e, t) {
  if (e) {
    if (typeof e == "string") return Ft(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ft(e, t) : void 0;
  }
}
function Ei(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function ji(e) {
  if (Array.isArray(e)) return Ft(e);
}
function Ft(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Ni(e, t, n, r, o, a) {
  return m(), y("svg", W({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Oi(t[0] || (t[0] = [b("path", {
    d: "M4.38708 13C4.28408 13.0005 4.18203 12.9804 4.08691 12.9409C3.99178 12.9014 3.9055 12.8433 3.83313 12.7701C3.68634 12.6231 3.60388 12.4238 3.60388 12.2161C3.60388 12.0084 3.68634 11.8091 3.83313 11.6622L8.50507 6.99022L3.83313 2.31827C3.69467 2.16968 3.61928 1.97313 3.62287 1.77005C3.62645 1.56698 3.70872 1.37322 3.85234 1.22959C3.99596 1.08597 4.18972 1.00371 4.3928 1.00012C4.59588 0.996539 4.79242 1.07192 4.94102 1.21039L10.1669 6.43628C10.3137 6.58325 10.3962 6.78249 10.3962 6.99022C10.3962 7.19795 10.3137 7.39718 10.1669 7.54416L4.94102 12.7701C4.86865 12.8433 4.78237 12.9014 4.68724 12.9409C4.59212 12.9804 4.49007 13.0005 4.38708 13Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
gr.render = Ni;
var zi = {
  root: "p-tablist",
  content: "p-tablist-content p-tablist-viewport",
  tabList: "p-tablist-tab-list",
  activeBar: "p-tablist-active-bar",
  prevButton: "p-tablist-prev-button p-tablist-nav-button",
  nextButton: "p-tablist-next-button p-tablist-nav-button"
}, Ii = H.extend({
  name: "tablist",
  classes: zi
}), Ri = {
  name: "BaseTabList",
  extends: je,
  props: {},
  style: Ii,
  provide: function() {
    return {
      $pcTabList: this,
      $parentInstance: this
    };
  }
}, yr = {
  name: "TabList",
  extends: Ri,
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
      var t = this.$refs.content, n = this.getVisibleButtonWidths(), r = Ge(t) - n, o = Math.abs(t.scrollLeft), a = r * 0.8, s = o - a, c = Math.max(s, 0);
      t.scrollLeft = mn(t) ? -1 * c : c;
    },
    onNextButtonClick: function() {
      var t = this.$refs.content, n = this.getVisibleButtonWidths(), r = Ge(t) - n, o = Math.abs(t.scrollLeft), a = r * 0.8, s = o + a, c = t.scrollWidth - r, i = Math.min(s, c);
      t.scrollLeft = mn(t) ? -1 * i : i;
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
      var n = this.$refs.content, r = Je(n, '[data-pc-name="tab"][data-p-active="true"]');
      r && (this.inkBarObserver = new ResizeObserver(function() {
        return t.updateInkBar();
      }), this.inkBarObserver.observe(r));
    },
    unbindInkBarObserver: function() {
      var t;
      (t = this.inkBarObserver) === null || t === void 0 || t.disconnect(), this.inkBarObserver = void 0;
    },
    updateInkBar: function() {
      var t = this.$refs, n = t.content, r = t.inkbar, o = t.tabs;
      if (r) {
        var a = Je(n, '[data-pc-name="tab"][data-p-active="true"]');
        this.$pcTabs.isVertical() ? (r.style.height = nr(a) + "px", r.style.top = Ke(a).top - Ke(o).top + "px") : (r.style.width = tr(a) + "px", r.style.left = Ke(a).left - Ke(o).left + "px");
      }
    },
    updateButtonState: function() {
      var t = this.$refs, n = t.list, r = t.content, o = r.scrollTop, a = r.scrollWidth, s = r.scrollHeight, c = r.offsetWidth, i = r.offsetHeight, d = Math.abs(r.scrollLeft), l = [Ge(r), zt(r)], u = l[0], p = l[1];
      this.$pcTabs.isVertical() ? (this.isPrevButtonEnabled = o !== 0, this.isNextButtonEnabled = n.offsetHeight >= i && parseInt(o) !== s - p) : (this.isPrevButtonEnabled = d !== 0, this.isNextButtonEnabled = n.offsetWidth >= c && parseInt(d) !== a - u);
    },
    getVisibleButtonWidths: function() {
      var t = this.$refs, n = t.prevButton, r = t.nextButton, o = 0;
      return this.showNavigators && (o = (n?.offsetWidth || 0) + (r?.offsetWidth || 0)), o;
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
      return Ee({
        scrollable: this.$pcTabs.scrollable
      });
    }
  },
  components: {
    ChevronLeftIcon: hr,
    ChevronRightIcon: gr
  },
  directives: {
    ripple: Xt
  }
}, Vi = ["data-p"], Bi = ["aria-label", "tabindex"], Di = ["data-p"], Mi = ["aria-orientation"], Ui = ["aria-label", "tabindex"];
function Wi(e, t, n, r, o, a) {
  var s = Yt("ripple");
  return m(), y("div", W({
    ref: "list",
    class: e.cx("root"),
    "data-p": a.dataP
  }, e.ptmi("root")), [a.showNavigators && o.isPrevButtonEnabled ? We((m(), y("button", W({
    key: 0,
    ref: "prevButton",
    type: "button",
    class: e.cx("prevButton"),
    "aria-label": a.prevButtonAriaLabel,
    tabindex: a.$pcTabs.tabindex,
    onClick: t[0] || (t[0] = function() {
      return a.onPrevButtonClick && a.onPrevButtonClick.apply(a, arguments);
    })
  }, e.ptm("prevButton"), {
    "data-pc-group-section": "navigator"
  }), [(m(), B(Ze(a.templates.previcon || "ChevronLeftIcon"), W({
    "aria-hidden": "true"
  }, e.ptm("prevIcon")), null, 16))], 16, Bi)), [[s]]) : E("", !0), b("div", W({
    ref: "content",
    class: e.cx("content"),
    onScroll: t[1] || (t[1] = function() {
      return a.onScroll && a.onScroll.apply(a, arguments);
    }),
    "data-p": a.dataP
  }, e.ptm("content")), [b("div", W({
    ref: "tabs",
    class: e.cx("tabList"),
    role: "tablist",
    "aria-orientation": a.$pcTabs.orientation || "horizontal"
  }, e.ptm("tabList")), [X(e.$slots, "default"), b("span", W({
    ref: "inkbar",
    class: e.cx("activeBar"),
    role: "presentation",
    "aria-hidden": "true"
  }, e.ptm("activeBar")), null, 16)], 16, Mi)], 16, Di), a.showNavigators && o.isNextButtonEnabled ? We((m(), y("button", W({
    key: 1,
    ref: "nextButton",
    type: "button",
    class: e.cx("nextButton"),
    "aria-label": a.nextButtonAriaLabel,
    tabindex: a.$pcTabs.tabindex,
    onClick: t[2] || (t[2] = function() {
      return a.onNextButtonClick && a.onNextButtonClick.apply(a, arguments);
    })
  }, e.ptm("nextButton"), {
    "data-pc-group-section": "navigator"
  }), [(m(), B(Ze(a.templates.nexticon || "ChevronRightIcon"), W({
    "aria-hidden": "true"
  }, e.ptm("nextIcon")), null, 16))], 16, Ui)), [[s]]) : E("", !0)], 16, Vi);
}
yr.render = Wi;
var Fi = `
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
`, Hi = {
  root: function(t) {
    var n = t.props;
    return ["p-tabs p-component", {
      "p-tabs-scrollable": n.scrollable
    }];
  }
}, Ki = H.extend({
  name: "tabs",
  style: Fi,
  classes: Hi
}), qi = {
  name: "BaseTabs",
  extends: je,
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
  style: Ki,
  provide: function() {
    return {
      $pcTabs: this,
      $parentInstance: this
    };
  }
}, xr = {
  name: "Tabs",
  extends: qi,
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
function Yi(e, t, n, r, o, a) {
  return m(), y("div", W({
    class: e.cx("root")
  }, e.ptmi("root")), [X(e.$slots, "default")], 16);
}
xr.render = Yi;
const Gi = { class: "km-shell" }, Qi = { class: "km-rail" }, Zi = { class: "km-main" }, Ji = /* @__PURE__ */ ae({
  __name: "Shell",
  setup(e) {
    return (t, n) => (m(), y("div", Gi, [
      b("aside", Qi, [
        X(t.$slots, "rail")
      ]),
      b("main", Zi, [
        X(t.$slots, "default")
      ])
    ]));
  }
}), Xi = { class: "km-railhead" }, es = { class: "km-railhead-title" }, ts = { key: 0 }, ns = { class: "km-railhead-acts" }, rs = /* @__PURE__ */ ae({
  __name: "RailHeader",
  props: {
    title: {},
    count: {}
  },
  setup(e) {
    return (t, n) => (m(), y("div", Xi, [
      b("span", es, [
        U(P(e.title), 1),
        e.count !== void 0 ? (m(), y("b", ts, P(e.count), 1)) : E("", !0)
      ]),
      b("div", ns, [
        X(t.$slots, "actions")
      ])
    ]));
  }
});
var nn = {
  name: "SpinnerIcon",
  extends: Jt
};
function os(e) {
  return ls(e) || ss(e) || is(e) || as();
}
function as() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function is(e, t) {
  if (e) {
    if (typeof e == "string") return Ht(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ht(e, t) : void 0;
  }
}
function ss(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function ls(e) {
  if (Array.isArray(e)) return Ht(e);
}
function Ht(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function cs(e, t, n, r, o, a) {
  return m(), y("svg", W({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), os(t[0] || (t[0] = [b("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
nn.render = cs;
var ds = `
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
`, us = {
  root: function(t) {
    var n = t.props, r = t.instance;
    return ["p-badge p-component", {
      "p-badge-circle": q(n.value) && String(n.value).length === 1,
      "p-badge-dot": Re(n.value) && !r.$slots.default,
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
}, ps = H.extend({
  name: "badge",
  style: ds,
  classes: us
}), fs = {
  name: "BaseBadge",
  extends: je,
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
  style: ps,
  provide: function() {
    return {
      $pcBadge: this,
      $parentInstance: this
    };
  }
};
function st(e) {
  "@babel/helpers - typeof";
  return st = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, st(e);
}
function Mn(e, t, n) {
  return (t = ms(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ms(e) {
  var t = bs(e, "string");
  return st(t) == "symbol" ? t : t + "";
}
function bs(e, t) {
  if (st(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (st(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var kr = {
  name: "Badge",
  extends: fs,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return Ee(Mn(Mn({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, vs = ["data-p"];
function hs(e, t, n, r, o, a) {
  return m(), y("span", W({
    class: e.cx("root"),
    "data-p": a.dataP
  }, e.ptmi("root")), [X(e.$slots, "default", {}, function() {
    return [U(P(e.value), 1)];
  })], 16, vs);
}
kr.render = hs;
var gs = `
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
function lt(e) {
  "@babel/helpers - typeof";
  return lt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, lt(e);
}
function we(e, t, n) {
  return (t = ys(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ys(e) {
  var t = xs(e, "string");
  return lt(t) == "symbol" ? t : t + "";
}
function xs(e, t) {
  if (lt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (lt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var ks = {
  root: function(t) {
    var n = t.instance, r = t.props;
    return ["p-button p-component", we(we(we(we(we(we(we(we(we({
      "p-button-icon-only": n.hasIcon && !r.label && !r.badge,
      "p-button-vertical": (r.iconPos === "top" || r.iconPos === "bottom") && r.label,
      "p-button-loading": r.loading,
      "p-button-link": r.link || r.variant === "link"
    }, "p-button-".concat(r.severity), r.severity), "p-button-raised", r.raised), "p-button-rounded", r.rounded), "p-button-text", r.text || r.variant === "text"), "p-button-outlined", r.outlined || r.variant === "outlined"), "p-button-sm", r.size === "small"), "p-button-lg", r.size === "large"), "p-button-plain", r.plain), "p-button-fluid", n.hasFluid)];
  },
  loadingIcon: "p-button-loading-icon",
  icon: function(t) {
    var n = t.props;
    return ["p-button-icon", we({}, "p-button-icon-".concat(n.iconPos), n.label)];
  },
  label: "p-button-label"
}, ws = H.extend({
  name: "button",
  style: gs,
  classes: ks
}), _s = {
  name: "BaseButton",
  extends: je,
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
  style: ws,
  provide: function() {
    return {
      $pcButton: this,
      $parentInstance: this
    };
  }
};
function ct(e) {
  "@babel/helpers - typeof";
  return ct = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ct(e);
}
function se(e, t, n) {
  return (t = Ss(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ss(e) {
  var t = $s(e, "string");
  return ct(t) == "symbol" ? t : t + "";
}
function $s(e, t) {
  if (ct(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ct(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var rn = {
  name: "Button",
  extends: _s,
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
      return W(this.asAttrs, this.a11yAttrs, this.getPTOptions("root"));
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
      return Re(this.fluid) ? !!this.$pcFluid : this.fluid;
    },
    dataP: function() {
      return Ee(se(se(se(se(se(se(se(se(se(se({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
    },
    dataIconP: function() {
      return Ee(se(se({}, this.iconPos, this.iconPos), this.size, this.size));
    },
    dataLabelP: function() {
      return Ee(se(se({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
    }
  },
  components: {
    SpinnerIcon: nn,
    Badge: kr
  },
  directives: {
    ripple: Xt
  }
}, Cs = ["data-p"], Ts = ["data-p"];
function Ps(e, t, n, r, o, a) {
  var s = on("SpinnerIcon"), c = on("Badge"), i = Yt("ripple");
  return e.asChild ? X(e.$slots, "default", {
    key: 1,
    class: ne(e.cx("root")),
    a11yAttrs: a.a11yAttrs
  }) : We((m(), B(Ze(e.as), W({
    key: 0,
    class: e.cx("root"),
    "data-p": a.dataP
  }, a.attrs), {
    default: I(function() {
      return [X(e.$slots, "default", {}, function() {
        return [e.loading ? X(e.$slots, "loadingicon", W({
          key: 0,
          class: [e.cx("loadingIcon"), e.cx("icon")]
        }, e.ptm("loadingIcon")), function() {
          return [e.loadingIcon ? (m(), y("span", W({
            key: 0,
            class: [e.cx("loadingIcon"), e.cx("icon"), e.loadingIcon]
          }, e.ptm("loadingIcon")), null, 16)) : (m(), B(s, W({
            key: 1,
            class: [e.cx("loadingIcon"), e.cx("icon")],
            spin: ""
          }, e.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : X(e.$slots, "icon", W({
          key: 1,
          class: [e.cx("icon")]
        }, e.ptm("icon")), function() {
          return [e.icon ? (m(), y("span", W({
            key: 0,
            class: [e.cx("icon"), e.icon, e.iconClass],
            "data-p": a.dataIconP
          }, e.ptm("icon")), null, 16, Cs)) : E("", !0)];
        }), e.label ? (m(), y("span", W({
          key: 2,
          class: e.cx("label")
        }, e.ptm("label"), {
          "data-p": a.dataLabelP
        }), P(e.label), 17, Ts)) : E("", !0), e.badge ? (m(), B(c, {
          key: 3,
          value: e.badge,
          class: ne(e.badgeClass),
          severity: e.badgeSeverity,
          unstyled: e.unstyled,
          pt: e.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : E("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[i]]);
}
rn.render = Ps;
const St = /* @__PURE__ */ ae({
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
    const n = e, r = t, o = Et(), a = J(
      () => Object.prototype.hasOwnProperty.call(o?.vnode.props ?? {}, "active")
    ), s = J(
      () => n.variant === "danger" ? "danger" : n.variant === "bordered" ? "secondary" : void 0
    ), c = J(
      () => n.size === "sm" ? "small" : n.size === "lg" ? "large" : void 0
    );
    return (i, d) => (m(), B(h(rn), {
      type: "button",
      severity: s.value,
      text: e.variant !== "bordered" && !e.active,
      outlined: e.variant === "bordered",
      size: c.value,
      loading: e.spin,
      disabled: e.disabled || e.spin,
      pt: {
        root: {
          "aria-label": e.label,
          "aria-pressed": a.value ? String(e.active) : void 0,
          title: e.label
        }
      },
      onClick: d[0] || (d[0] = (l) => r("click"))
    }, {
      icon: I(() => [
        L(h(Q), {
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])
      ]),
      _: 1
    }, 8, ["severity", "text", "outlined", "size", "loading", "disabled", "pt"]));
  }
}), xe = /* @__PURE__ */ ae({
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
    const n = e, r = t, o = J(
      () => n.variant === "danger" ? "danger" : n.variant === "primary" ? void 0 : "secondary"
    );
    return (a, s) => (m(), B(h(rn), {
      type: e.type,
      severity: o.value,
      outlined: e.variant === "ghost",
      loading: e.loading,
      disabled: e.disabled || e.loading,
      size: e.small ? "small" : void 0,
      onClick: s[0] || (s[0] = (c) => r("click"))
    }, {
      default: I(() => [
        e.loading ? (m(), B(h(nn), {
          key: 0,
          class: "p-button-loading-icon p-button-icon",
          spin: ""
        })) : E("", !0),
        e.icon && !e.loading ? (m(), B(h(Q), {
          key: 1,
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : E("", !0),
        X(a.$slots, "default")
      ]),
      _: 3
    }, 8, ["type", "severity", "outlined", "loading", "disabled", "size"]));
  }
}), Os = { class: "km-search" }, As = ["value", "placeholder"], Un = /* @__PURE__ */ ae({
  __name: "SearchField",
  props: {
    modelValue: {},
    placeholder: {}
  },
  emits: ["update:modelValue"],
  setup(e, { emit: t }) {
    const n = t;
    return (r, o) => (m(), y("div", Os, [
      L(h(Q), {
        icon: "tabler:search",
        class: "km-search-ico",
        "aria-hidden": "true"
      }),
      b("input", {
        class: "km-search-input",
        value: e.modelValue,
        placeholder: e.placeholder || "Search",
        onInput: o[0] || (o[0] = (a) => n("update:modelValue", a.target.value))
      }, null, 40, As),
      e.modelValue ? (m(), y("button", {
        key: 0,
        class: "km-search-clear",
        "aria-label": "Clear search",
        onClick: o[1] || (o[1] = (a) => n("update:modelValue", ""))
      }, [
        L(h(Q), {
          icon: "tabler:x",
          "aria-hidden": "true"
        })
      ])) : E("", !0)
    ]));
  }
}), Ls = { class: "km-field" }, Es = { class: "km-field-label" }, js = {
  key: 0,
  class: "km-field-help"
}, Ne = /* @__PURE__ */ ae({
  __name: "FormField",
  props: {
    label: {},
    help: {}
  },
  setup(e) {
    return (t, n) => (m(), y("label", Ls, [
      b("span", Es, P(e.label), 1),
      X(t.$slots, "default"),
      e.help ? (m(), y("small", js, P(e.help), 1)) : E("", !0)
    ]));
  }
}), Ns = ["type", "value", "placeholder", "readonly", "disabled", "autocomplete", "min", "max", "step"], yt = /* @__PURE__ */ ae({
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
      const a = o.target;
      n("update:modelValue", a.value);
    }
    return (o, a) => (m(), y("input", {
      class: ne(["km-input", e.mono && "mono"]),
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
    }, null, 42, Ns));
  }
});
var zs = `
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
`, Is = {
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
}, Rs = H.extend({
  name: "tag",
  style: zs,
  classes: Is
}), Vs = {
  name: "BaseTag",
  extends: je,
  props: {
    value: null,
    severity: null,
    rounded: Boolean,
    icon: String
  },
  style: Rs,
  provide: function() {
    return {
      $pcTag: this,
      $parentInstance: this
    };
  }
};
function dt(e) {
  "@babel/helpers - typeof";
  return dt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, dt(e);
}
function Bs(e, t, n) {
  return (t = Ds(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ds(e) {
  var t = Ms(e, "string");
  return dt(t) == "symbol" ? t : t + "";
}
function Ms(e, t) {
  if (dt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (dt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var wr = {
  name: "Tag",
  extends: Vs,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return Ee(Bs({
        rounded: this.rounded
      }, this.severity, this.severity));
    }
  }
}, Us = ["data-p"];
function Ws(e, t, n, r, o, a) {
  return m(), y("span", W({
    class: e.cx("root"),
    "data-p": a.dataP
  }, e.ptmi("root")), [e.$slots.icon ? (m(), B(Ze(e.$slots.icon), W({
    key: 0,
    class: e.cx("icon")
  }, e.ptm("icon")), null, 16, ["class"])) : e.icon ? (m(), y("span", W({
    key: 1,
    class: [e.cx("icon"), e.icon]
  }, e.ptm("icon")), null, 16)) : E("", !0), e.value != null || e.$slots.default ? X(e.$slots, "default", {
    key: 2
  }, function() {
    return [b("span", W({
      class: e.cx("label")
    }, e.ptm("label")), P(e.value), 17)];
  }) : E("", !0)], 16, Us);
}
wr.render = Ws;
const Fs = {
  key: 0,
  class: "km-pill-dot",
  "aria-hidden": "true"
}, De = /* @__PURE__ */ ae({
  __name: "Pill",
  props: {
    severity: { default: "secondary" },
    dot: { type: Boolean },
    icon: {}
  },
  setup(e) {
    return (t, n) => (m(), B(h(wr), {
      severity: e.severity || void 0,
      class: "km-pill kx-tag-sm"
    }, {
      default: I(() => [
        e.dot ? (m(), y("span", Fs)) : e.icon ? (m(), B(h(Q), {
          key: 1,
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : E("", !0),
        X(t.$slots, "default")
      ]),
      _: 3
    }, 8, ["severity"]));
  }
}), Hs = { class: "km-notice-text" }, $t = /* @__PURE__ */ ae({
  __name: "Notice",
  props: {
    severity: { default: "info" }
  },
  emits: ["dismiss"],
  setup(e, { emit: t }) {
    const n = t, r = (o) => o === "danger" ? "tabler:alert-triangle" : o === "success" ? "tabler:circle-check" : "tabler:info-circle";
    return (o, a) => (m(), y("div", {
      class: ne(["km-notice", `is-${e.severity}`]),
      role: "status"
    }, [
      L(h(Q), {
        icon: r(e.severity),
        "aria-hidden": "true"
      }, null, 8, ["icon"]),
      b("span", Hs, [
        X(o.$slots, "default")
      ]),
      b("button", {
        class: "km-notice-x",
        "aria-label": "Dismiss",
        onClick: a[0] || (a[0] = (s) => n("dismiss"))
      }, [
        L(h(Q), {
          icon: "tabler:x",
          "aria-hidden": "true"
        })
      ])
    ], 2));
  }
});
var Ks = `
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
`, qs = {
  root: "p-progressspinner",
  spin: "p-progressspinner-spin",
  circle: "p-progressspinner-circle"
}, Ys = H.extend({
  name: "progressspinner",
  style: Ks,
  classes: qs
}), Gs = {
  name: "BaseProgressSpinner",
  extends: je,
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
  style: Ys,
  provide: function() {
    return {
      $pcProgressSpinner: this,
      $parentInstance: this
    };
  }
}, _r = {
  name: "ProgressSpinner",
  extends: Gs,
  inheritAttrs: !1,
  computed: {
    svgStyle: function() {
      return {
        "animation-duration": this.animationDuration
      };
    }
  }
}, Qs = ["fill", "stroke-width"];
function Zs(e, t, n, r, o, a) {
  return m(), y("div", W({
    class: e.cx("root"),
    role: "progressbar"
  }, e.ptmi("root")), [(m(), y("svg", W({
    class: e.cx("spin"),
    viewBox: "25 25 50 50",
    style: a.svgStyle
  }, e.ptm("spin")), [b("circle", W({
    class: e.cx("circle"),
    cx: "50",
    cy: "50",
    r: "20",
    fill: e.fill,
    "stroke-width": e.strokeWidth,
    strokeMiterlimit: "10"
  }, e.ptm("circle")), null, 16, Qs)], 16))], 16);
}
_r.render = Zs;
const Js = { class: "km-loading" }, Xs = { key: 0 }, Sr = /* @__PURE__ */ ae({
  __name: "Spinner",
  props: {
    label: {}
  },
  setup(e) {
    return (t, n) => (m(), y("div", Js, [
      L(h(_r), {
        style: { width: "22px", height: "22px", margin: "0" },
        "aria-label": e.label || "Loading"
      }, null, 8, ["aria-label"]),
      e.label ? (m(), y("span", Xs, P(e.label), 1)) : E("", !0)
    ]));
  }
}), el = { class: "km-empty" }, tl = { class: "km-empty-title" }, nl = {
  key: 0,
  class: "km-empty-hint"
}, rl = /* @__PURE__ */ ae({
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
    return (r, o) => (m(), y("div", el, [
      L(h(Q), {
        icon: e.icon,
        class: "km-empty-ico",
        "aria-hidden": "true"
      }, null, 8, ["icon"]),
      b("div", tl, P(e.title), 1),
      e.hint ? (m(), y("p", nl, P(e.hint), 1)) : E("", !0),
      e.cta ? (m(), B(xe, {
        key: 1,
        icon: e.ctaIcon,
        onClick: o[0] || (o[0] = (a) => n("cta"))
      }, {
        default: I(() => [
          U(P(e.cta), 1)
        ]),
        _: 1
      }, 8, ["icon"])) : E("", !0)
    ]));
  }
}), ol = { class: "kx-wcmount" }, al = {
  key: 0,
  class: "kx-wcmount-fail",
  role: "alert"
}, il = /* @__PURE__ */ ae({
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
    const n = e, r = t, o = R(null), a = R(!1);
    let s = null, c = 0;
    const i = /* @__PURE__ */ new Set();
    function d(v) {
      v.composedPath()[0] === s && (v.stopPropagation(), r("change", v.detail));
    }
    function l(v) {
      return v.composedPath()[0] !== s ? !1 : (v.stopPropagation(), !0);
    }
    function u(v) {
      l(v) && r("created", v.detail);
    }
    function p(v) {
      l(v) && r("close", v.detail);
    }
    function f(v) {
      l(v) && r("error", v.detail);
    }
    function k(v) {
      if (typeof v == "string") return v;
      try {
        return JSON.stringify(v ?? {});
      } catch {
        return null;
      }
    }
    function T() {
      if (!s) return;
      const v = k(n.config);
      if (v !== null && s.setAttribute("config", v), n.schema !== void 0 && n.schema !== null) {
        const j = k(n.schema);
        j !== null && s.setAttribute("schema", j);
      }
      if (n.meta !== void 0 && n.meta !== null) {
        const j = k(n.meta);
        j !== null && s.setAttribute("meta", j);
      }
      n.provider && s.setAttribute("provider", n.provider), n.label && s.setAttribute("label", n.label);
      const A = n.attrs || {};
      for (const j of [...i])
        (!(j in A) || A[j] == null) && (s.removeAttribute(j), i.delete(j));
      for (const [j, M] of Object.entries(A)) {
        if (M == null) continue;
        const oe = typeof M == "object" ? k(M) : String(M);
        oe !== null && (s.setAttribute(j, oe), i.add(j));
      }
    }
    function C(v = s) {
      v && (v.removeEventListener("config-changed", d), v.removeEventListener("change", d), v.removeEventListener("created", u), v.removeEventListener("close", p), v.removeEventListener("error", f), v === s && (s = null), i.clear());
    }
    async function O(v) {
      if (!customElements.get(v))
        try {
          await to(v, { timeoutMs: 8e3 });
        } catch {
        }
    }
    async function S() {
      const v = ++c, A = o.value, j = n.tag;
      if (a.value = !1, !!A && (C(), A.innerHTML = "", !!j))
        try {
          if (await O(j), v !== c || o.value !== A || n.tag !== j) return;
          const M = document.createElement(j);
          M.classList.add("kx-wcmount-surface"), s = M, T(), M.addEventListener("config-changed", d), M.addEventListener("change", d), M.addEventListener("created", u), M.addEventListener("close", p), M.addEventListener("error", f), M.style.display = "block", A.appendChild(M), a.value = !customElements.get(j);
        } catch {
          v === c && (a.value = !0);
        }
    }
    async function D() {
      a.value = !1, await qt(), await S();
    }
    return Kt(S), Te(() => n.tag, S), Te(() => [n.config, n.schema, n.meta, n.provider, n.label, n.attrs], T, { deep: !0 }), Gr(() => {
      c += 1, C();
    }), (v, A) => (m(), y("div", ol, [
      a.value ? (m(), y("div", al, [
        A[0] || (A[0] = b("span", null, "This setup panel couldn’t load.", -1)),
        b("button", {
          type: "button",
          onClick: D
        }, "Try again")
      ])) : (m(), y("div", {
        key: 1,
        ref_key: "host",
        ref: o
      }, null, 512))
    ]));
  }
}), sl = (e, t) => {
  const n = e.__vccOpts || e;
  for (const [r, o] of t)
    n[r] = o;
  return n;
}, At = /* @__PURE__ */ sl(il, [["__scopeId", "data-v-3ec70c11"]]);
function Qe(e, t) {
  const n = e?.response?.data ?? e?.data;
  return typeof n?.error == "string" && n.error ? n.error : typeof n?.message == "string" && n.message ? n.message : e instanceof Error ? e.message : t;
}
function ll() {
  const e = R([]), t = R([]), n = R(!0), r = R(!1), o = R("");
  let a = 0;
  async function s() {
    const d = ++a;
    n.value = !0, o.value = "";
    try {
      const [l, u] = await Promise.all([
        Ae.get("/api/v1/security/scopes"),
        Ae.get("/api/v1/security/policies")
      ]);
      if (d !== a) return;
      e.value = l.data?.scopes ?? [], t.value = u.data?.policies ?? [];
    } catch (l) {
      d === a && (o.value = Qe(l, "failed to load security"));
    } finally {
      d === a && (n.value = !1);
    }
  }
  async function c(d) {
    r.value = !0, o.value = "";
    try {
      return await Ae.post("/api/v1/security/scopes", d), await s(), !0;
    } catch (l) {
      return o.value = Qe(l, "failed to save scope"), !1;
    } finally {
      r.value = !1;
    }
  }
  async function i(d) {
    r.value = !0, o.value = "";
    try {
      return await Ae.delete(`/api/v1/security/scopes?slug=${encodeURIComponent(d)}`), await s(), !0;
    } catch (l) {
      return o.value = Qe(l, "failed to delete scope"), !1;
    } finally {
      r.value = !1;
    }
  }
  return { scopes: e, policies: t, loading: n, saving: r, error: o, load: s, saveScope: c, deleteScope: i };
}
function cl() {
  const e = R([]), t = R(!1), n = R(!1), r = R(""), o = R(""), a = R(null);
  let s = 0;
  async function c() {
    const l = ++s;
    t.value = !0, r.value = "";
    try {
      const { data: u } = await Ae.get("/api/v1/security/delegations");
      if (u?.success !== !0 || !Array.isArray(u.delegations))
        throw new Error(u?.error || "Delegation inventory is unconfirmed");
      l === s && (e.value = u.delegations);
    } catch (u) {
      l === s && (r.value = Qe(u, "Could not load run-as permissions"));
    } finally {
      l === s && (t.value = !1);
    }
  }
  async function i() {
    if (!a.value || n.value) return;
    const l = a.value;
    n.value = !0, r.value = "", o.value = "";
    try {
      const { data: u } = l.method === "save" ? await Ae.post("/api/v1/security/delegations", l.request) : await Ae.delete("/api/v1/security/delegations", { data: l.request });
      if (u?.success !== !0) throw new Error(u?.error || "Run-as request is unconfirmed");
      a.value = null, o.value = l.method === "save" ? "Run-as permission saved" : "Run-as permission revoked", await c();
    } catch (u) {
      r.value = Qe(u, "Could not confirm run-as request");
      const p = u?.response?.status;
      p && p >= 400 && p < 500 && (a.value = null);
    } finally {
      n.value = !1;
    }
  }
  async function d(l, u) {
    a.value || n.value || (a.value = { method: l, request: {
      ...u,
      principal: { ...u.principal },
      ...u.groups ? { groups: [...u.groups].sort() } : {}
    } }, await i());
  }
  return { delegations: e, loading: t, saving: n, error: r, confirmation: o, pending: a, load: c, mutate: d, submit: i };
}
const dl = {
  class: "ks-runas",
  "aria-label": "Run-as permissions"
}, ul = { class: "ks-runas-head" }, pl = { class: "ks-runas-acts" }, fl = {
  key: 0,
  role: "alert"
}, ml = { class: "ks-runas-form-head" }, bl = ["disabled", "inert"], vl = { class: "ks-runas-steps" }, hl = {
  key: 0,
  class: "ks-runas-chips",
  "aria-label": "Selected groups"
}, gl = ["aria-label", "onClick"], yl = {
  class: "ks-runas-seg",
  role: "radiogroup",
  "aria-label": "On which components"
}, xl = ["aria-checked"], kl = ["aria-checked"], wl = { class: "ks-runas-form-foot" }, _l = {
  key: 3,
  class: "ks-runas-pending"
}, Sl = {
  key: 5,
  class: "ks-runas-list"
}, $l = { class: "ks-runas-grant-body" }, Cl = { class: "ks-runas-grant-line" }, Tl = { class: "ks-runas-who" }, Pl = { class: "ks-runas-who" }, Ol = { class: "ks-runas-grant-meta" }, Al = { key: 0 }, Ll = { key: 1 }, El = {
  key: 6,
  class: "ks-runas-empty"
}, jl = /* @__PURE__ */ ae({
  __name: "Delegations",
  props: {
    scopes: {}
  },
  setup(e, { expose: t }) {
    const n = e, r = cl(), { delegations: o, loading: a, saving: s, error: c, confirmation: i, pending: d } = r, l = R(!1), u = R(""), p = R(""), f = R(!0), k = R([]), T = J(() => s.value || !!d.value), C = J(() => !!u.value && k.value.length > 0 && (f.value || !!p.value)), O = J(() => {
      const N = {};
      for (const _ of n.scopes) N[_.id] = _.label || _.id;
      return N;
    }), S = R({});
    Te(o, async (N) => {
      const _ = [...new Set(N.map(($) => $.principal.id))].filter(($) => !S.value[$]);
      if (_.length)
        try {
          const { data: $ } = await Ae.post("/api/v1/principals/resolve", { refs: _.map((Z) => ({ type: "user", id: Z })) }), ee = { ...S.value };
          for (const Z of Array.isArray($?.principals) ? $.principals : [])
            Z && typeof Z.id == "string" && typeof Z.label == "string" && (ee[Z.id] = Z.label);
          S.value = ee;
        } catch ($) {
          c.value = $ && typeof $ == "object" && "message" in $ ? String($.message) : "Could not resolve account names";
        }
    });
    const D = J(() => o.value.filter((N) => N.active)), v = J(() => o.value.filter((N) => !N.active));
    function A(N, _) {
      if (!N || typeof N != "object") return;
      const $ = N;
      T.value || $.type !== _ || typeof $.id != "string" || (_ === "user" ? u.value = $.id : $.id && !k.value.some((ee) => ee.id === $.id) && k.value.push({ id: $.id, label: typeof $.label == "string" ? $.label : $.id }));
    }
    function j(N) {
      const _ = N && typeof N == "object" ? N.thread_id : void 0;
      !T.value && typeof _ == "string" && (p.value = _);
    }
    function M(N) {
      c.value = N && typeof N == "object" && "message" in N ? String(N.message) : "Could not load the picker";
    }
    function oe() {
      u.value = "", p.value = "", f.value = !0, k.value = [], l.value = !0;
    }
    async function ce() {
      C.value && (await r.mutate("save", {
        principal: { kind: "user", id: u.value },
        root: f.value ? "*" : p.value,
        groups: k.value.map((N) => N.id)
      }), !c.value && !d.value && (l.value = !1));
    }
    async function Y(N) {
      await Gt.confirm({
        header: "Revoke run-as permission?",
        message: `Members of ${N.groups.map(($) => O.value[$] || $).join(", ")} can no longer choose ${S.value[N.principal.id] || N.principal.id} in the Run as setting.`,
        icon: "tabler:user-off",
        acceptLabel: "Revoke",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      }) && await r.mutate("revoke", { principal: N.principal, root: N.root });
    }
    return t({ load: r.load }), (N, _) => (m(), y("section", dl, [
      b("header", ul, [
        _[9] || (_[9] = b("div", null, [
          b("h2", { class: "ks-runas-title" }, "Run-as permissions"),
          b("p", { class: "ks-runas-lede" }, [
            U(" Agents, automations and workflows run with the access of the account set in their "),
            b("b", null, "Run as"),
            U(" setting. A permission lets members of a group choose a specific account there, typically a bot account, so the component works with that account's access instead of their own. ")
          ])
        ], -1)),
        b("div", pl, [
          L(h(St), {
            icon: "tabler:refresh",
            label: "Refresh",
            disabled: h(a) || T.value,
            spin: h(a),
            onClick: h(r).load
          }, null, 8, ["disabled", "spin", "onClick"]),
          l.value ? E("", !0) : (m(), B(h(xe), {
            key: 0,
            variant: "primary",
            small: "",
            icon: "tabler:plus",
            onClick: oe
          }, {
            default: I(() => [..._[8] || (_[8] = [
              U("New permission", -1)
            ])]),
            _: 1
          }))
        ])
      ]),
      h(c) ? (m(), y("div", fl, [
        L(h($t), {
          severity: "danger",
          onDismiss: _[0] || (_[0] = ($) => c.value = "")
        }, {
          default: I(() => [
            U(P(h(c)), 1)
          ]),
          _: 1
        })
      ])) : E("", !0),
      h(i) ? (m(), B(h($t), {
        key: 1,
        "data-test": "delegation-confirmation",
        severity: "success",
        onDismiss: _[1] || (_[1] = ($) => i.value = "")
      }, {
        default: I(() => [
          U(P(h(i)), 1)
        ]),
        _: 1
      })) : E("", !0),
      l.value ? (m(), y("form", {
        key: 2,
        class: "ks-runas-form",
        onSubmit: Ue(ce, ["prevent"])
      }, [
        b("div", ml, [
          _[10] || (_[10] = b("span", null, "New run-as permission", -1)),
          L(h(St), {
            icon: "tabler:x",
            label: "Cancel",
            disabled: h(s),
            onClick: _[2] || (_[2] = ($) => l.value = !1)
          }, null, 8, ["disabled"])
        ]),
        b("fieldset", {
          disabled: T.value,
          inert: T.value
        }, [
          b("ol", vl, [
            b("li", null, [
              L(h(Ne), {
                label: "Account to run as",
                help: "The account whose access the component uses. Its group memberships decide what the component can do."
              }, {
                default: I(() => [
                  L(At, {
                    tag: "wc-principal-picker",
                    attrs: { kinds: "user", placeholder: "Choose an account…" },
                    config: { principal_id: u.value },
                    onChange: _[3] || (_[3] = ($) => A($, "user")),
                    onError: M
                  }, null, 8, ["config"])
                ]),
                _: 1
              })
            ]),
            b("li", null, [
              L(h(Ne), {
                label: "Who may choose it",
                help: "Members of these groups see this account in the Run as setting. Nobody's group membership changes."
              }, {
                default: I(() => [
                  L(At, {
                    tag: "wc-principal-picker",
                    attrs: { kinds: "group", placeholder: "Add a group…" },
                    config: {},
                    onChange: _[4] || (_[4] = ($) => A($, "group")),
                    onError: M
                  })
                ]),
                _: 1
              }),
              k.value.length ? (m(), y("div", hl, [
                (m(!0), y(he, null, ge(k.value, ($) => (m(), y("span", {
                  key: $.id,
                  class: "ks-runas-chip"
                }, [
                  U(P($.label) + " ", 1),
                  b("button", {
                    type: "button",
                    "aria-label": `Remove group ${$.label}`,
                    onClick: (ee) => k.value = k.value.filter((Z) => Z.id !== $.id)
                  }, [
                    L(h(Q), {
                      icon: "tabler:x",
                      "aria-hidden": "true"
                    })
                  ], 8, gl)
                ]))), 128))
              ])) : E("", !0)
            ]),
            b("li", null, [
              L(h(Ne), {
                label: "On which components",
                help: "The person choosing the account must also be able to manage the component."
              }, {
                default: I(() => [
                  b("div", yl, [
                    b("button", {
                      type: "button",
                      role: "radio",
                      "aria-checked": f.value,
                      class: ne({ on: f.value }),
                      onClick: _[5] || (_[5] = ($) => f.value = !0)
                    }, "Any component", 10, xl),
                    b("button", {
                      type: "button",
                      role: "radio",
                      "aria-checked": !f.value,
                      class: ne({ on: !f.value }),
                      onClick: _[6] || (_[6] = ($) => f.value = !1)
                    }, "One component", 10, kl)
                  ])
                ]),
                _: 1
              }),
              f.value ? E("", !0) : (m(), B(At, {
                key: 0,
                class: "ks-runas-component",
                tag: "wc-component-picker",
                attrs: { title: "Component", placeholder: "Choose a component…" },
                config: p.value ? { thread_id: p.value } : {},
                onChange: j,
                onError: M
              }, null, 8, ["config"]))
            ])
          ])
        ], 8, bl),
        b("div", wl, [
          L(h(xe), {
            variant: "ghost",
            small: "",
            disabled: h(s),
            onClick: _[7] || (_[7] = ($) => l.value = !1)
          }, {
            default: I(() => [..._[11] || (_[11] = [
              U("Cancel", -1)
            ])]),
            _: 1
          }, 8, ["disabled"]),
          L(h(xe), {
            variant: "primary",
            small: "",
            icon: "tabler:device-floppy",
            disabled: !C.value || T.value,
            loading: h(s),
            onClick: ce
          }, {
            default: I(() => [..._[12] || (_[12] = [
              U("Save permission", -1)
            ])]),
            _: 1
          }, 8, ["disabled", "loading"])
        ])
      ], 32)) : E("", !0),
      h(d) && !h(s) ? (m(), y("div", _l, [
        _[14] || (_[14] = b("span", null, "The result is unconfirmed. Retry the same request before editing this permission.", -1)),
        L(h(xe), {
          small: "",
          onClick: h(r).submit
        }, {
          default: I(() => [..._[13] || (_[13] = [
            U("Retry", -1)
          ])]),
          _: 1
        }, 8, ["onClick"])
      ])) : E("", !0),
      h(a) && !h(o).length ? (m(), B(h(Sr), {
        key: 4,
        label: "Loading run-as permissions…"
      })) : D.value.length || v.value.length ? (m(), y("div", Sl, [
        (m(!0), y(he, null, ge([...D.value, ...v.value], ($) => (m(), y("article", {
          key: $.policy_id,
          class: ne(["ks-runas-grant", { revoked: !$.active }])
        }, [
          L(h(Q), {
            class: "ks-runas-grant-icon",
            icon: "tabler:user-shield",
            "aria-hidden": "true"
          }),
          b("div", $l, [
            b("div", Cl, [
              b("span", Tl, P($.groups.map((ee) => O.value[ee] || ee).join(", ")), 1),
              _[15] || (_[15] = b("span", { class: "ks-runas-verb" }, "can run as", -1)),
              b("span", Pl, P(S.value[$.principal.id] || $.principal.id), 1)
            ]),
            b("div", Ol, [
              $.root === "*" ? (m(), y("span", Al, "on any component they manage")) : (m(), y("span", Ll, [
                _[16] || (_[16] = U("on component ", -1)),
                b("code", null, P($.root), 1)
              ]))
            ])
          ]),
          $.active ? (m(), B(h(xe), {
            key: 1,
            variant: "ghost",
            small: "",
            icon: "tabler:user-off",
            disabled: T.value,
            "aria-label": `Revoke run-as permission for ${S.value[$.principal.id] || $.principal.id}`,
            onClick: (ee) => Y($)
          }, {
            default: I(() => [..._[18] || (_[18] = [
              U("Revoke", -1)
            ])]),
            _: 1
          }, 8, ["disabled", "aria-label", "onClick"])) : (m(), B(h(De), {
            key: 0,
            severity: "secondary"
          }, {
            default: I(() => [..._[17] || (_[17] = [
              U("revoked", -1)
            ])]),
            _: 1
          }))
        ], 2))), 128))
      ])) : !h(c) && !l.value ? (m(), y("div", El, [
        L(h(Q), {
          icon: "tabler:user-shield",
          "aria-hidden": "true"
        }),
        _[19] || (_[19] = b("b", null, "No run-as permissions yet", -1)),
        _[20] || (_[20] = b("span", null, [
          U("Until a group gets a permission, the Run as setting offers only "),
          b("b", null, "Me"),
          U(".")
        ], -1))
      ])) : E("", !0)
    ]));
  }
}), Nl = ["draggable"], zl = { class: "ks-pcard-row" }, Il = { class: "ks-pcard-body" }, Rl = { class: "ks-pcard-head" }, Vl = ["title"], Bl = {
  key: 0,
  class: "ks-pcard-comment"
}, Dl = ["title"], Ml = ["aria-label"], Ul = {
  key: 0,
  class: "ks-pcard-detail"
}, Wl = {
  key: 0,
  class: "ks-pcard-kv"
}, Fl = { class: "ks-pcard-kv" }, Hl = { class: "ks-pcard-kv" }, Kl = { class: "ks-pcard-tags" }, ql = {
  key: 0,
  class: "ks-pcard-none"
}, Yl = { class: "ks-pcard-kv" }, Gl = { class: "ks-pcard-tags" }, Ql = {
  key: 0,
  class: "ks-pcard-none"
}, Lt = /* @__PURE__ */ ae({
  __name: "PolicyCard",
  props: {
    policy: {},
    mode: {}
  },
  emits: ["add", "remove"],
  setup(e, { emit: t }) {
    const n = e, r = t, o = R(!1);
    function a(u) {
      n.mode === "locked" || !u.dataTransfer || (u.dataTransfer.setData("text/plain", n.policy.id), u.dataTransfer.effectAllowed = n.mode === "palette" ? "copy" : "move");
    }
    function s(u) {
      return u.includes(":") ? u.split(":").slice(-1)[0] : u;
    }
    function c(u) {
      return Array.isArray(u) ? u.map(String) : typeof u == "string" && u ? [u] : [];
    }
    const i = J(() => c(n.policy.actions)), d = J(() => c(n.policy.resources)), l = J(() => !!n.policy.effect || i.value.length > 0 || d.value.length > 0 || !!n.policy.surface);
    return (u, p) => (m(), y("div", {
      class: ne(["ks-pcard", [e.mode, { expanded: o.value }]]),
      draggable: e.mode !== "locked",
      onDragstart: a,
      onDblclick: p[3] || (p[3] = (f) => e.mode === "palette" && r("add"))
    }, [
      b("div", zl, [
        e.mode === "locked" ? (m(), B(h(Q), {
          key: 0,
          icon: "tabler:lock",
          class: "ks-pcard-grip locked",
          "aria-hidden": "true"
        })) : (m(), B(h(Q), {
          key: 1,
          icon: "tabler:grip-vertical",
          class: "ks-pcard-grip",
          "aria-hidden": "true"
        })),
        b("div", Il, [
          b("div", Rl, [
            b("span", {
              class: "ks-pcard-title",
              title: e.policy.title || s(e.policy.id)
            }, P(e.policy.title || s(e.policy.id)), 9, Vl),
            e.policy.effect ? (m(), y("span", {
              key: 0,
              class: ne(["ks-eff", e.policy.effect])
            }, P(e.policy.effect), 3)) : E("", !0)
          ]),
          e.policy.comment ? (m(), y("div", Bl, P(e.policy.comment), 1)) : E("", !0),
          b("div", {
            class: "ks-pcard-id",
            title: e.policy.id
          }, P(e.policy.id), 9, Dl)
        ]),
        l.value ? (m(), y("button", {
          key: 2,
          class: ne(["ks-pcard-act detail", { open: o.value }]),
          "aria-label": o.value ? "Hide details" : "Show details",
          onClick: p[0] || (p[0] = Ue((f) => o.value = !o.value, ["stop"]))
        }, [
          L(h(Q), {
            icon: "tabler:chevron-right",
            "aria-hidden": "true"
          })
        ], 10, Ml)) : E("", !0),
        e.mode === "palette" ? (m(), y("button", {
          key: 3,
          class: "ks-pcard-act add",
          "aria-label": "Add policy",
          onClick: p[1] || (p[1] = Ue((f) => r("add"), ["stop"]))
        }, [
          L(h(Q), {
            icon: "tabler:plus",
            "aria-hidden": "true"
          })
        ])) : e.mode === "selected" ? (m(), y("button", {
          key: 4,
          class: "ks-pcard-act remove",
          "aria-label": "Remove policy",
          onClick: p[2] || (p[2] = Ue((f) => r("remove"), ["stop"]))
        }, [
          L(h(Q), {
            icon: "tabler:x",
            "aria-hidden": "true"
          })
        ])) : E("", !0)
      ]),
      o.value ? (m(), y("div", Ul, [
        e.policy.surface || e.policy.intent ? (m(), y("div", Wl, [
          p[4] || (p[4] = b("span", null, "Surface", -1)),
          b("code", null, P(e.policy.surface || e.policy.intent), 1)
        ])) : E("", !0),
        b("div", Fl, [
          p[5] || (p[5] = b("span", null, "Effect", -1)),
          b("code", {
            class: ne(["ks-eff-code", e.policy.effect])
          }, P(e.policy.effect || "—"), 3)
        ]),
        b("div", Hl, [
          p[6] || (p[6] = b("span", null, "Actions", -1)),
          b("div", Kl, [
            (m(!0), y(he, null, ge(i.value, (f) => (m(), y("code", { key: f }, P(f), 1))), 128)),
            i.value.length ? E("", !0) : (m(), y("span", ql, "—"))
          ])
        ]),
        b("div", Yl, [
          p[7] || (p[7] = b("span", null, "Resources", -1)),
          b("div", Gl, [
            (m(!0), y(he, null, ge(d.value, (f) => (m(), y("code", { key: f }, P(f), 1))), 128)),
            d.value.length ? E("", !0) : (m(), y("span", Ql, "—"))
          ])
        ])
      ])) : E("", !0)
    ], 42, Nl));
  }
}), Zl = { class: "ks" }, Jl = { class: "ks-rail-search" }, Xl = { class: "ks-rail-list" }, ec = {
  key: 0,
  class: "ks-rail-group"
}, tc = ["onClick"], nc = { class: "ks-scope-name" }, rc = { class: "ks-scope-meta" }, oc = { class: "ks-scope-count" }, ac = ["onClick"], ic = { class: "ks-scope-name" }, sc = { class: "ks-scope-meta" }, lc = { class: "ks-scope-count" }, cc = {
  key: 0,
  class: "ks-builder"
}, dc = { class: "ks-builder-head" }, uc = { class: "ks-builder-title" }, pc = { class: "ks-builder-acts" }, fc = {
  key: 0,
  class: "ks-overlay-warn"
}, mc = { class: "ks-fields" }, bc = {
  key: 0,
  class: "ks-field-err"
}, vc = {
  key: 0,
  class: "ks-pane locked-pane"
}, hc = { class: "ks-pane-head" }, gc = { class: "ks-pane-sub" }, yc = { class: "ks-pane-body" }, xc = {
  key: 0,
  class: "ks-pane-empty"
}, kc = { class: "ks-pane" }, wc = { class: "ks-pane-search" }, _c = { class: "ks-pane-body" }, Sc = {
  key: 0,
  class: "ks-pane-empty"
}, $c = { class: "ks-pane-head" }, Cc = { class: "ks-pane-sub" }, Tc = { class: "ks-pane-body" }, Pc = ["onDrop"], Oc = {
  key: 0,
  class: "ks-drop-hint"
}, Ac = {
  key: 1,
  class: "ks-view"
}, Lc = { class: "ks-builder-head" }, Ec = { class: "ks-builder-title" }, jc = { class: "ks-builder-acts" }, Nc = { class: "ks-view-note" }, zc = { class: "ks-view-id" }, Ic = { class: "ks-pane-body ks-view-list" }, Rc = { class: "ks-view-pol-title" }, Vc = {
  key: 1,
  class: "ks-view-pol-comment"
}, Bc = { class: "ks-view-pol-id" }, Dc = {
  key: 0,
  class: "ks-pane-empty"
}, Mc = {
  key: 0,
  class: "ks-ext-block"
}, Uc = { class: "ks-ext-head" }, Wc = { class: "ks-pane-body ks-view-list" }, Fc = { class: "ks-view-pol-title" }, Hc = {
  key: 1,
  class: "ks-view-pol-comment"
}, Kc = { class: "ks-view-pol-id" }, qc = /* @__PURE__ */ ae({
  __name: "Security",
  setup(e) {
    const t = ll(), { scopes: n, policies: r, loading: o, saving: a, error: s } = t, c = R(""), i = R(""), d = R(null), l = R(null), u = R("scopes"), p = R(null), f = R(!1);
    async function k(x) {
      u.value = String(x), x === "delegations" && (f.value = !0, await qt(), await p.value?.load());
    }
    Eo(async () => {
      await t.load(), u.value === "delegations" && await p.value?.load();
    });
    const T = J(() => {
      const x = {};
      for (const w of r.value) x[w.id] = w;
      return x;
    }), C = J(() => {
      const x = c.value.trim().toLowerCase(), w = (g) => !x || g.label.toLowerCase().includes(x) || g.id.toLowerCase().includes(x);
      return {
        custom: n.value.filter((g) => g.source === "custom" && w(g)),
        builtin: n.value.filter((g) => g.source !== "custom" && w(g))
      };
    }), O = J(() => n.value.find((x) => x.id === d.value) || null), S = J(() => O.value && O.value.source !== "custom" ? O.value : null), D = J(() => {
      if (!l.value) return [];
      const x = /* @__PURE__ */ new Set([...l.value.policies, ...l.value.base.map((g) => g.id)]), w = i.value.trim().toLowerCase();
      return r.value.filter((g) => !x.has(g.id) && (!w || (g.title || "").toLowerCase().includes(w) || g.id.toLowerCase().includes(w) || (g.comment || "").toLowerCase().includes(w)));
    }), v = J(
      () => l.value ? l.value.policies.map((x) => T.value[x] || { id: x }) : []
    );
    function A(x) {
      d.value = x.id, l.value = x.source === "custom" ? { slug: x.slug || "", label: x.label, description: x.description, policies: x.policies.map((w) => w.id), enabled: x.enabled, isNew: !1, target: "", base: [] } : null;
    }
    function j() {
      d.value = null, l.value = { slug: "", label: "", description: "", policies: [], enabled: !0, isNew: !0, target: "", base: [] };
    }
    function M(x) {
      d.value = null, l.value = {
        slug: "",
        label: x.label ? `Copy of ${x.label}` : "",
        description: x.description,
        policies: [...x.policies.map((w) => w.id), ...(x.overlay_policies ?? []).map((w) => w.id)],
        enabled: !0,
        isNew: !0,
        target: "",
        base: []
      };
    }
    function oe(x) {
      return x.replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "");
    }
    function ce(x) {
      d.value = x.id, l.value = {
        slug: x.overlay_slug || oe(x.id),
        label: x.label || ue(x.id),
        description: x.description,
        policies: (x.overlay_policies ?? []).map((w) => w.id),
        enabled: !0,
        isNew: !x.overlay_slug,
        target: x.id,
        base: x.policies
      };
    }
    const Y = J(() => !!l.value && l.value.target !== "");
    function N(x) {
      l.value && !l.value.policies.includes(x) && l.value.policies.push(x);
    }
    function _(x) {
      l.value && (l.value.policies = l.value.policies.filter((w) => w !== x));
    }
    function $(x) {
      const w = x.dataTransfer?.getData("text/plain");
      w && N(w);
    }
    function ee(x, w) {
      x.stopPropagation();
      const g = x.dataTransfer?.getData("text/plain");
      if (!g || !l.value || g === w) return;
      const ie = l.value.policies, pt = ie.indexOf(g);
      pt !== -1 && ie.splice(pt, 1);
      const ft = ie.indexOf(w);
      ie.splice(ft === -1 ? ie.length : ft, 0, g);
    }
    const Z = J(() => {
      if (!l.value || !l.value.isNew || l.value.target !== "") return "";
      const x = l.value.slug.trim();
      return x && !/^[a-z0-9][\w.-]*$/i.test(x) ? "Slug must be alphanumeric (with _.-)" : "";
    }), $e = J(() => !!l.value && l.value.slug.trim() !== "" && !Z.value && l.value.policies.length > 0), de = R("");
    let ke = null;
    function Pe(x) {
      de.value = x, ke && clearTimeout(ke), ke = setTimeout(() => {
        de.value = "";
      }, 3e3);
    }
    async function me() {
      if (!l.value || !$e.value) return;
      const x = l.value.slug.trim(), w = l.value.target, g = l.value.label.trim() || x;
      await t.saveScope({
        slug: x,
        target: w,
        label: l.value.label.trim(),
        description: l.value.description.trim(),
        policies: l.value.policies,
        enabled: l.value.enabled
      }) && (d.value = w || `kickside.security.scopes:${x}`, Pe(`Saved “${g}”. New scopes appear in user assignment after a moment.`));
    }
    async function fe() {
      if (!l.value || l.value.isNew) return;
      const x = Y.value;
      if (!await Gt.confirm({
        header: x ? "Remove extension?" : "Delete scope?",
        message: x ? "The scope reverts to platform defaults. Users keep their base policies; only the added extensions are removed." : "This removes the custom scope and its projected security.scope entry.",
        icon: "tabler:trash",
        acceptLabel: x ? "Remove extension" : "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      })) return;
      await t.deleteScope(l.value.slug) && (l.value = null, d.value = null);
    }
    function be(x) {
      return x === "custom" ? "" : x === "builtin" ? "info" : "secondary";
    }
    function ue(x) {
      return x.includes(":") ? x.split(":").slice(-1)[0] : x;
    }
    return (x, w) => (m(), y("div", Zl, [
      L(h(xr), {
        class: "ks-tabs",
        value: u.value,
        "onUpdate:value": k
      }, {
        default: I(() => [
          L(h(yr), { pt: { tabList: { "aria-label": "Security administration" } } }, {
            default: I(() => [
              L(h(Ut), { value: "scopes" }, {
                default: I(() => [
                  L(h(Q), {
                    icon: "tabler:shield-lock",
                    "aria-hidden": "true"
                  }),
                  w[12] || (w[12] = U("Scopes", -1)),
                  b("b", null, P(h(n).length), 1)
                ]),
                _: 1
              }),
              L(h(Ut), {
                value: "delegations",
                "data-tab": "delegations"
              }, {
                default: I(() => [
                  L(h(Q), {
                    icon: "tabler:user-shield",
                    "aria-hidden": "true"
                  }),
                  w[13] || (w[13] = U("Run as", -1))
                ]),
                _: 1
              })
            ]),
            _: 1
          })
        ]),
        _: 1
      }, 8, ["value"]),
      f.value ? We((m(), B(jl, {
        key: 0,
        ref_key: "delegationPanel",
        ref: p,
        scopes: h(n)
      }, null, 8, ["scopes"])), [
        [an, u.value === "delegations"]
      ]) : E("", !0),
      h(s) ? (m(), B(h($t), {
        key: 1,
        severity: "danger",
        class: "ks-top-notice",
        onDismiss: w[0] || (w[0] = (g) => s.value = "")
      }, {
        default: I(() => [
          U(P(h(s)), 1)
        ]),
        _: 1
      })) : de.value ? (m(), B(h($t), {
        key: 2,
        severity: "success",
        class: "ks-top-notice",
        onDismiss: w[1] || (w[1] = (g) => de.value = "")
      }, {
        default: I(() => [
          U(P(de.value), 1)
        ]),
        _: 1
      })) : E("", !0),
      u.value === "scopes" && h(o) && !h(n).length ? (m(), B(h(Sr), {
        key: 3,
        label: "Loading security…"
      })) : We((m(), B(h(Ji), { key: 4 }, {
        rail: I(() => [
          L(h(rs), {
            title: "Scopes",
            count: h(n).length
          }, {
            actions: I(() => [
              L(h(St), {
                icon: "tabler:plus",
                label: "New scope",
                disabled: h(a),
                onClick: j
              }, null, 8, ["disabled"]),
              L(h(St), {
                icon: "tabler:refresh",
                label: "Refresh",
                disabled: h(o),
                spin: h(o),
                onClick: h(t).load
              }, null, 8, ["disabled", "spin", "onClick"])
            ]),
            _: 1
          }, 8, ["count"]),
          b("div", Jl, [
            L(h(Un), {
              modelValue: c.value,
              "onUpdate:modelValue": w[2] || (w[2] = (g) => c.value = g),
              placeholder: "Filter scopes…"
            }, null, 8, ["modelValue"])
          ]),
          b("div", Xl, [
            C.value.custom.length ? (m(), y("div", ec, "Custom")) : E("", !0),
            (m(!0), y(he, null, ge(C.value.custom, (g) => (m(), y("button", {
              key: g.id,
              class: ne(["ks-scope-row", { active: g.id === d.value }]),
              onClick: (ie) => A(g)
            }, [
              b("span", nc, P(g.label || ue(g.id)), 1),
              b("span", rc, [
                L(h(De), {
                  severity: be(g.source)
                }, {
                  default: I(() => [
                    U(P(g.source), 1)
                  ]),
                  _: 2
                }, 1032, ["severity"]),
                b("span", oc, P(g.policies.length), 1)
              ])
            ], 10, tc))), 128)),
            w[14] || (w[14] = b("div", { class: "ks-rail-group" }, "Built-in", -1)),
            (m(!0), y(he, null, ge(C.value.builtin, (g) => (m(), y("button", {
              key: g.id,
              class: ne(["ks-scope-row", { active: g.id === d.value }]),
              onClick: (ie) => A(g)
            }, [
              b("span", ic, P(g.label || ue(g.id)), 1),
              b("span", sc, [
                L(h(De), {
                  severity: be(g.source)
                }, {
                  default: I(() => [
                    U(P(g.source), 1)
                  ]),
                  _: 2
                }, 1032, ["severity"]),
                b("span", lc, P(g.policies.length), 1)
              ])
            ], 10, ac))), 128))
          ])
        ]),
        default: I(() => [
          l.value ? (m(), y("div", cc, [
            b("div", dc, [
              b("div", uc, [
                L(h(Q), {
                  icon: Y.value ? "tabler:stack-2" : "tabler:shield-lock",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                b("span", null, P(Y.value ? `Extend ${l.value.label || ue(l.value.target)}` : l.value.isNew ? "New scope" : l.value.label || l.value.slug), 1),
                Y.value ? (m(), B(h(De), {
                  key: 0,
                  severity: "warn"
                }, {
                  default: I(() => [...w[15] || (w[15] = [
                    U("overlay", -1)
                  ])]),
                  _: 1
                })) : E("", !0)
              ]),
              b("div", pc, [
                !l.value.isNew && !Y.value && O.value ? (m(), B(h(xe), {
                  key: 0,
                  variant: "soft",
                  small: "",
                  icon: "tabler:copy",
                  disabled: h(a),
                  onClick: w[3] || (w[3] = (g) => M(O.value))
                }, {
                  default: I(() => [...w[16] || (w[16] = [
                    U("Duplicate", -1)
                  ])]),
                  _: 1
                }, 8, ["disabled"])) : E("", !0),
                l.value.isNew ? E("", !0) : (m(), B(h(xe), {
                  key: 1,
                  variant: "danger",
                  small: "",
                  icon: "tabler:trash",
                  disabled: h(a),
                  onClick: fe
                }, {
                  default: I(() => [
                    U(P(Y.value ? "Remove extension" : "Delete"), 1)
                  ]),
                  _: 1
                }, 8, ["disabled"])),
                L(h(xe), {
                  variant: "primary",
                  small: "",
                  icon: "tabler:device-floppy",
                  loading: h(a),
                  disabled: !$e.value,
                  onClick: me
                }, {
                  default: I(() => [
                    U(P(Y.value ? "Save extension" : "Save scope"), 1)
                  ]),
                  _: 1
                }, 8, ["loading", "disabled"])
              ])
            ]),
            Y.value ? (m(), y("div", fc, [
              L(h(Q), {
                icon: "tabler:alert-triangle",
                "aria-hidden": "true"
              }),
              b("span", null, [
                w[17] || (w[17] = U("Extending a platform scope grants the added policies to ", -1)),
                b("b", null, "every user with the " + P(ue(l.value.target)) + " role", 1),
                w[18] || (w[18] = U(". Base policies stay in place — extensions only add access, they can't remove it.", -1))
              ])
            ])) : E("", !0),
            b("div", mc, [
              Y.value ? (m(), B(h(Ne), {
                key: 1,
                label: "Extends"
              }, {
                default: I(() => [
                  L(h(yt), {
                    "model-value": l.value.target,
                    disabled: ""
                  }, null, 8, ["model-value"])
                ]),
                _: 1
              })) : (m(), B(h(Ne), {
                key: 0,
                label: "Slug",
                help: l.value.isNew ? "Lowercase id; cannot change later." : void 0
              }, {
                default: I(() => [
                  L(h(yt), {
                    modelValue: l.value.slug,
                    "onUpdate:modelValue": w[4] || (w[4] = (g) => l.value.slug = g),
                    disabled: !l.value.isNew,
                    placeholder: "reviewer"
                  }, null, 8, ["modelValue", "disabled"]),
                  Z.value ? (m(), y("span", bc, P(Z.value), 1)) : E("", !0)
                ]),
                _: 1
              }, 8, ["help"])),
              L(h(Ne), { label: "Label" }, {
                default: I(() => [
                  L(h(yt), {
                    modelValue: l.value.label,
                    "onUpdate:modelValue": w[5] || (w[5] = (g) => l.value.label = g),
                    placeholder: "Reviewer"
                  }, null, 8, ["modelValue"])
                ]),
                _: 1
              }),
              L(h(Ne), { label: "Description" }, {
                default: I(() => [
                  L(h(yt), {
                    modelValue: l.value.description,
                    "onUpdate:modelValue": w[6] || (w[6] = (g) => l.value.description = g),
                    placeholder: "Read-only reviewer role"
                  }, null, 8, ["modelValue"])
                ]),
                _: 1
              })
            ]),
            b("div", {
              class: ne(["ks-panes", { three: Y.value }])
            }, [
              Y.value ? (m(), y("section", vc, [
                b("header", hc, [
                  w[19] || (w[19] = b("span", null, "Base policies", -1)),
                  b("span", gc, P(l.value.base.length) + " · locked", 1)
                ]),
                b("div", yc, [
                  (m(!0), y(he, null, ge(l.value.base, (g) => (m(), B(Lt, {
                    key: g.id,
                    policy: g,
                    mode: "locked"
                  }, null, 8, ["policy"]))), 128)),
                  l.value.base.length ? E("", !0) : (m(), y("div", xc, "No base policies."))
                ])
              ])) : E("", !0),
              b("section", kc, [
                w[20] || (w[20] = b("header", { class: "ks-pane-head" }, [
                  b("span", null, "Available policies"),
                  b("span", { class: "ks-pane-sub" }, "public only · drag or click +")
                ], -1)),
                b("div", wc, [
                  L(h(Un), {
                    modelValue: i.value,
                    "onUpdate:modelValue": w[7] || (w[7] = (g) => i.value = g),
                    placeholder: "Search policies…"
                  }, null, 8, ["modelValue"])
                ]),
                b("div", _c, [
                  (m(!0), y(he, null, ge(D.value, (g) => (m(), B(Lt, {
                    key: g.id,
                    policy: g,
                    mode: "palette",
                    onAdd: (ie) => N(g.id)
                  }, null, 8, ["policy", "onAdd"]))), 128)),
                  D.value.length ? E("", !0) : (m(), y("div", Sc, "No matching public policies."))
                ])
              ]),
              b("section", {
                class: "ks-pane drop",
                onDragover: w[9] || (w[9] = Ue(() => {
                }, ["prevent"])),
                onDrop: $
              }, [
                b("header", $c, [
                  b("span", null, P(Y.value ? "Added by you" : "In this scope"), 1),
                  b("span", Cc, P(l.value.policies.length) + " " + P(l.value.policies.length === 1 ? "policy" : "policies"), 1)
                ]),
                b("div", Tc, [
                  (m(!0), y(he, null, ge(v.value, (g) => (m(), y("div", {
                    key: g.id,
                    onDragover: w[8] || (w[8] = Ue(() => {
                    }, ["prevent"])),
                    onDrop: (ie) => ee(ie, g.id)
                  }, [
                    L(Lt, {
                      policy: g,
                      mode: "selected",
                      onRemove: (ie) => _(g.id)
                    }, null, 8, ["policy", "onRemove"])
                  ], 40, Pc))), 128)),
                  l.value.policies.length ? E("", !0) : (m(), y("div", Oc, [
                    L(h(Q), {
                      icon: "tabler:drag-drop",
                      "aria-hidden": "true"
                    }),
                    b("span", null, P(Y.value ? "Drag policies here to extend this scope." : "Drag policies here to grant them to this scope."), 1)
                  ]))
                ])
              ], 32)
            ], 2)
          ])) : S.value ? (m(), y("div", Ac, [
            b("div", Lc, [
              b("div", Ec, [
                L(h(Q), {
                  icon: "tabler:shield",
                  "aria-hidden": "true"
                }),
                b("span", null, P(S.value.label || ue(S.value.id)), 1),
                L(h(De), {
                  severity: be(S.value.source)
                }, {
                  default: I(() => [
                    U(P(S.value.source), 1)
                  ]),
                  _: 1
                }, 8, ["severity"])
              ]),
              b("div", jc, [
                L(h(xe), {
                  variant: "primary",
                  small: "",
                  icon: "tabler:stack-2",
                  onClick: w[10] || (w[10] = (g) => ce(S.value))
                }, {
                  default: I(() => [
                    U(P(S.value.overlay_slug ? "Edit extension" : "Extend scope"), 1)
                  ]),
                  _: 1
                }),
                L(h(xe), {
                  variant: "soft",
                  small: "",
                  icon: "tabler:copy",
                  onClick: w[11] || (w[11] = (g) => M(S.value))
                }, {
                  default: I(() => [...w[21] || (w[21] = [
                    U("Copy to custom scope", -1)
                  ])]),
                  _: 1
                })
              ])
            ]),
            b("p", Nc, [
              U(P(S.value.source === "builtin" ? "Built-in role — composed from the policies that list its group. You can extend it (add policies) via an overlay; base policies can only change in the owning package." : "Registry-declared scope.") + " ", 1),
              b("span", zc, P(S.value.id), 1)
            ]),
            b("div", Ic, [
              (m(!0), y(he, null, ge(S.value.policies, (g) => (m(), y("div", {
                key: g.id,
                class: "ks-view-pol"
              }, [
                b("span", Rc, P(g.title || ue(g.id)), 1),
                g.effect ? (m(), y("span", {
                  key: 0,
                  class: ne(["ks-eff", g.effect])
                }, P(g.effect), 3)) : E("", !0),
                g.comment ? (m(), y("div", Vc, P(g.comment), 1)) : E("", !0),
                b("div", Bc, P(g.id), 1)
              ]))), 128)),
              S.value.policies.length ? E("", !0) : (m(), y("div", Dc, "No policies in this scope."))
            ]),
            S.value.overlay_policies && S.value.overlay_policies.length ? (m(), y("div", Mc, [
              b("div", Uc, [
                L(h(Q), {
                  icon: "tabler:stack-2",
                  "aria-hidden": "true"
                }),
                w[22] || (w[22] = b("span", null, "Extensions", -1)),
                L(h(De), { severity: "warn" }, {
                  default: I(() => [
                    U("overlay · " + P(S.value.overlay_policies.length), 1)
                  ]),
                  _: 1
                })
              ]),
              b("div", Wc, [
                (m(!0), y(he, null, ge(S.value.overlay_policies, (g) => (m(), y("div", {
                  key: g.id,
                  class: "ks-view-pol"
                }, [
                  b("span", Fc, P(g.title || ue(g.id)), 1),
                  g.effect ? (m(), y("span", {
                    key: 0,
                    class: ne(["ks-eff", g.effect])
                  }, P(g.effect), 3)) : E("", !0),
                  g.comment ? (m(), y("div", Hc, P(g.comment), 1)) : E("", !0),
                  b("div", Kc, P(g.id), 1)
                ]))), 128))
              ])
            ])) : E("", !0)
          ])) : (m(), B(h(rl), {
            key: 2,
            icon: "tabler:shield-lock",
            title: "Scopes & roles",
            hint: "Select a scope to inspect it, or create a custom scope by composing public policies.",
            cta: "New scope",
            "cta-icon": "tabler:plus",
            onCta: j
          }))
        ]),
        _: 1
      }, 512)), [
        [an, u.value === "scopes"]
      ])
    ]));
  }
}), Yc = ':root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}.kx-tag-sm,.kx-tag-sm.kx-tag-sm{display:inline-flex;align-items:center;gap:4px;padding:1px 7px;border-radius:var(--kx-radius-tag, 6px);font-size:10.5px;font-weight:600;line-height:1.5;white-space:nowrap}.kx-tag-sm svg,.kx-tag-sm.kx-tag-sm svg{width:12px;height:12px}.kx-tag-caps,.kx-tag-caps.kx-tag-caps{display:inline-flex;align-items:center;gap:3px;padding:2px 6px;border-radius:var(--kx-radius-tag, 6px);font-size:9px;font-weight:700;line-height:1.5;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap}.kx-tag-caps svg,.kx-tag-caps.kx-tag-caps svg{width:11px;height:11px}:host,:root{--kx-surface-1: color-mix(in srgb, var(--p-content-background) 96%, var(--p-text-color) 4%);--kx-surface-2: color-mix(in srgb, var(--p-content-background) 92%, var(--p-text-color) 8%);--kx-surface-3: color-mix(in srgb, var(--p-content-background) 86%, var(--p-text-color) 14%);--kx-surface-4: color-mix(in srgb, var(--p-content-background) 78%, var(--p-text-color) 22%);--kx-border-strong: color-mix(in srgb, var(--p-content-border-color) 60%, var(--p-text-color) 40%);--kx-border-stronger: color-mix(in srgb, var(--p-content-border-color) 30%, var(--p-text-color) 70%);--kx-text-faint: color-mix(in srgb, var(--p-text-muted-color) 70%, var(--p-content-background) 30%);--kx-text-fainter: color-mix(in srgb, var(--p-text-muted-color) 45%, var(--p-content-background) 55%);--kx-wash-primary: color-mix(in srgb, var(--p-primary-color) 12%, var(--p-content-background) 88%);--kx-wash-success: color-mix(in srgb, var(--p-success-500) 12%, var(--p-content-background) 88%);--kx-wash-info: color-mix(in srgb, var(--p-info-500) 12%, var(--p-content-background) 88%);--kx-wash-warn: color-mix(in srgb, var(--p-warn-500) 12%, var(--p-content-background) 88%);--kx-wash-danger: color-mix(in srgb, var(--p-danger-500) 12%, var(--p-content-background) 88%);--kx-wash-help: color-mix(in srgb, var(--p-help-500) 12%, var(--p-content-background) 88%);--kx-font-heading: "Outfit", system-ui, sans-serif;--kx-font-body: "Inter", system-ui, sans-serif;--kx-radius-4: 4px;--kx-radius-6: 6px;--kx-radius-8: 8px;--kx-radius-10: 10px;--kx-radius-14: 14px;--kx-radius-16: 16px;--kx-radius-tag: var(--p-content-border-radius, 6px);--kx-control-height: 34px;--kx-control-height-sm: 30px;--kx-rail-width: 264px;--kx-reading-measure: 880px;--kx-row-height: 32px;--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .08);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .12);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .18);--kx-overlay-hover: color-mix(in srgb, var(--p-text-color) 7%, transparent);--kx-overlay-subtle: color-mix(in srgb, var(--p-text-color) 4%, transparent)}@media(prefers-color-scheme:dark){:host(:not(.w-theme-light)),:root:not(.w-theme-light){--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .35);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .45);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .6)}}:host(.w-theme-dark),:root.w-theme-dark{--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .35);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .45);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .6)}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}:host{display:block;height:100%;min-height:0;--km-rail-w: 296px;--system-surface-gutter: var(--kickside-system-surface-gutter, 24px)}:host>div{height:100%;min-height:0}*,*:before,*:after{box-sizing:border-box}.km{height:100%;min-height:0;display:flex;flex-direction:column;background:var(--p-content-background);color:var(--p-text-color);font-family:inherit}.km-top-notice{width:calc(100% - (var(--system-surface-gutter) * 2));margin:12px 0 0 var(--system-surface-gutter)}.km-shell{flex:1;min-height:0;width:100%;margin:0;display:grid;grid-template-columns:var(--km-rail-w) minmax(0,1fr);border-left:1px solid var(--p-content-border-color);border-right:1px solid var(--p-content-border-color)}.km-rail{min-width:0;min-height:0;display:flex;flex-direction:column;border-right:1px solid var(--p-content-border-color)}.km-rail-body{flex:1;min-height:0;overflow:auto;padding:6px}.km-main{min-width:0;min-height:0;display:flex;flex-direction:column;overflow:hidden}.km-railhead{flex:0 0 auto;display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:48px;padding:0 8px 0 14px;border-bottom:1px solid var(--p-content-border-color)}.km-railhead-title{display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:760;letter-spacing:.03em;text-transform:uppercase;color:var(--p-text-muted-color)}.km-railhead-title b{min-width:18px;padding:1px 6px;border-radius:999px;background:var(--kx-overlay-subtle);color:var(--p-text-color);font-size:11px;font-weight:700;text-align:center}.km-railhead-acts{display:inline-flex;align-items:center;gap:2px}.km-input{width:100%;min-width:0;height:34px;padding:0 10px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);background:var(--p-content-background);color:var(--p-text-color);font:inherit;font-size:13px}.km-input:read-only{color:var(--p-text-muted-color);background:var(--kx-overlay-subtle)}.km-input:disabled{opacity:.6}.km-input.mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}.km-textarea{height:auto;min-height:120px;padding:9px 10px;line-height:1.45;resize:vertical}.km-search{position:relative;display:flex;align-items:center;min-width:0}.km-search-ico{position:absolute;left:9px;width:16px;height:16px;color:var(--p-text-muted-color);pointer-events:none}.km-search-input{width:100%;height:34px;padding:0 30px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);background:var(--p-content-background);color:var(--p-text-color);font:inherit;font-size:13px}.km-search-clear{position:absolute;right:6px;width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:6px;background:transparent;color:var(--p-text-muted-color);cursor:pointer}.km-search-clear:hover{color:var(--p-text-color);background:var(--kx-overlay-hover)}.km-search-clear svg{width:14px;height:14px}.km-select{position:relative;min-width:0;display:flex}.km-select-el{width:100%;height:34px;padding:0 30px 0 10px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);background:var(--p-content-background);color:var(--p-text-color);font:inherit;font-size:13px;cursor:pointer;appearance:none}.km-select-chev{position:absolute;right:9px;top:50%;transform:translateY(-50%);width:15px;height:15px;color:var(--p-text-muted-color);pointer-events:none}.km-field{min-width:0;display:flex;flex-direction:column;gap:5px}.km-field-label{color:var(--p-text-muted-color);font-size:11.5px;font-weight:680}.km-field-help{color:var(--p-text-muted-color);font-size:11.5px;line-height:1.35}.km-pill{max-width:190px;overflow:hidden;text-overflow:ellipsis}.km-pill-dot{width:6px;height:6px;border-radius:50%;background:currentColor}.km-notice{display:flex;align-items:center;gap:9px;padding:9px 10px 9px 12px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);font-size:13px}.km-notice svg{width:17px;height:17px;flex:0 0 auto}.km-notice-text{flex:1;min-width:0}.km-notice.is-info{color:var(--p-text-color);background:var(--kx-overlay-subtle)}.km-notice.is-danger{color:var(--p-danger-600, var(--p-danger-500));border-color:color-mix(in srgb,var(--p-danger-500) 32%,var(--p-content-border-color));background:color-mix(in srgb,var(--p-danger-500) 9%,transparent)}.km-notice.is-success{color:var(--p-success-700);border-color:color-mix(in srgb,var(--p-success-500) 36%,var(--p-content-border-color));background:color-mix(in srgb,var(--p-success-500) 12%,transparent)}.km-notice-x{width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:6px;background:transparent;color:inherit;cursor:pointer;opacity:.7}.km-notice-x:hover{opacity:1;background:color-mix(in srgb,currentColor 12%,transparent)}.km-notice-x svg{width:14px;height:14px}.km-loading{display:flex;align-items:center;justify-content:center;gap:9px;padding:40px 20px;color:var(--p-text-muted-color);font-size:13px}.km-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:48px 24px;text-align:center}.km-empty-ico{width:30px;height:30px;color:var(--p-text-muted-color)}.km-empty-title{font-size:14px;font-weight:720}.km-empty-hint{margin:0;max-width:340px;color:var(--p-text-muted-color);font-size:12.5px;line-height:1.45}.km-empty .p-button{margin-top:4px}.km-plist{display:flex;flex-direction:column;gap:2px}.km-plist-all{width:100%;height:32px;display:flex;align-items:center;padding:0 10px;border:0;border-radius:var(--kx-radius-8);background:transparent;color:var(--p-text-muted-color);font:inherit;font-size:12.5px;font-weight:640;text-align:left;cursor:pointer}.km-plist-all:hover{background:var(--kx-overlay-hover);color:var(--p-text-color)}.km-plist-all.on{background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);color:var(--p-primary-color)}.km-plist-empty{display:flex;flex-direction:column;align-items:flex-start;gap:8px;padding:10px;color:var(--p-text-muted-color);font-size:12.5px}.km-plist-empty p{margin:0}.km-picker{display:flex;flex-direction:column;gap:18px}.km-picker-sec{display:flex;flex-direction:column;gap:7px}.km-picker-sec-title{color:var(--p-text-muted-color);font-size:11px;font-weight:760;letter-spacing:.03em;text-transform:uppercase}.km-picker-list{display:flex;flex-direction:column;gap:4px}.km-picker-item{display:grid;grid-template-columns:32px minmax(0,1fr) 16px;align-items:center;gap:11px;padding:9px 10px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);background:transparent;color:var(--p-text-color);font:inherit;text-align:left;cursor:pointer;transition:border-color .12s ease,background-color .12s ease}.km-picker-item:hover{border-color:color-mix(in srgb,var(--p-primary-color) 50%,var(--p-content-border-color));background:var(--kx-overlay-hover)}.km-picker-ico{width:32px;height:32px;display:inline-flex;align-items:center;justify-content:center;border-radius:var(--kx-radius-8);color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 11%,transparent)}.km-picker-ico svg{width:18px;height:18px}.km-picker-body{min-width:0;display:flex;flex-direction:column;gap:2px}.km-picker-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;font-weight:660}.km-picker-desc{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--p-text-muted-color);font-size:11.5px}.km-picker-go{width:16px;height:16px;color:var(--p-text-muted-color)}.km-form{display:flex;flex-direction:column;gap:16px}.km-editor-head{display:flex;align-items:center;gap:11px}.km-editor-head-text{min-width:0}.km-editor-head-title{font-size:14px;font-weight:740}.km-editor-head-sub{margin-top:2px;color:var(--p-text-muted-color);font-size:12px;line-height:1.4}.km-form-sec{display:flex;flex-direction:column;gap:10px}.km-form-sec+.km-form-sec{padding-top:16px;border-top:1px solid var(--p-content-border-color)}.km-form-sec-title{color:var(--p-text-muted-color);font-size:11px;font-weight:760;letter-spacing:.03em;text-transform:uppercase}.km-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}.km-form-grid.four{grid-template-columns:repeat(4,minmax(0,1fr))}.km-form-foot{position:sticky;bottom:-16px;display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px;margin:0 -16px -16px;padding:14px 16px;border-top:1px solid var(--p-content-border-color);background:var(--p-content-background)}.km-form-id{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11.5px;color:var(--p-text-muted-color)}.km-form-foot-sp{flex:1}.km-adv-toggle{display:inline-flex;align-items:center;gap:6px;padding:0;border:0;background:transparent;color:var(--p-text-muted-color);font:inherit;font-size:11px;font-weight:760;letter-spacing:.03em;text-transform:uppercase;cursor:pointer}.km-adv-toggle:hover{color:var(--p-text-color)}.km-adv-chev{width:14px;height:14px;transition:transform .15s ease}.km-adv-toggle.open .km-adv-chev{transform:rotate(90deg)}.km-adv-body{display:flex;flex-direction:column;gap:10px;margin-top:10px}.km-test-result{display:flex;align-items:center;gap:8px;padding:8px 11px;border-radius:var(--kx-radius-8);font-size:12.5px}.km-test-result svg{width:16px;height:16px;flex:0 0 auto}.km-test-result span{min-width:0;overflow-wrap:anywhere}.km-test-result.testing{color:var(--p-text-muted-color);background:var(--kx-overlay-subtle)}.km-test-result.ok{color:var(--p-success-600, var(--p-success-500));background:color-mix(in srgb,var(--p-success-500) 12%,transparent)}.km-test-result.fail{color:var(--p-danger-600, var(--p-danger-500));background:color-mix(in srgb,var(--p-danger-500) 10%,transparent)}.km-probe{border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);font-size:13px}.km-probe.ok{border-color:color-mix(in srgb,var(--p-success-500) 30%,var(--p-content-border-color));background:color-mix(in srgb,var(--p-success-500) 8%,transparent)}.km-probe.fail{border-color:color-mix(in srgb,var(--p-danger-500) 30%,var(--p-content-border-color));background:color-mix(in srgb,var(--p-danger-500) 8%,transparent)}.km-probe-head{display:flex;flex-wrap:wrap;align-items:center;gap:9px;padding:9px 10px 9px 12px}.km-probe-head>svg{width:17px;height:17px;flex:0 0 auto}.km-probe.ok .km-probe-head>svg{color:var(--p-success-600, var(--p-success-500))}.km-probe.fail .km-probe-head>svg{color:var(--p-danger-600, var(--p-danger-500))}.km-probe-msg{flex:1;min-width:0}.km-probe-time{flex:0 0 auto;padding:1px 7px;border-radius:var(--kx-radius-tag);background:var(--kx-overlay-subtle);color:var(--p-text-muted-color);font-size:11px;font-weight:700;font-variant-numeric:tabular-nums}.km-probe-adv-btn{flex:0 0 auto}.km-probe-x{width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;border:0;border-radius:6px;background:transparent;color:var(--p-text-muted-color);cursor:pointer;opacity:.7}.km-probe-x:hover{opacity:1;background:color-mix(in srgb,currentColor 12%,transparent)}.km-probe-x svg{width:14px;height:14px}.km-probe-adv{display:flex;flex-direction:column;gap:10px;padding:10px 12px 12px;border-top:1px solid var(--p-content-border-color)}.km-probe-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:6px 16px}.km-probe-kv{display:flex;align-items:baseline;gap:8px;min-width:0}.km-probe-kv span{flex:0 0 96px;color:var(--p-text-muted-color);font-size:11.5px}.km-probe-kv code{min-width:0;overflow:hidden;text-overflow:ellipsis;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11.5px}.km-probe-tokens{display:flex;flex-wrap:wrap;align-items:center;gap:6px}.km-probe-tokens-l{color:var(--p-text-muted-color);font-size:11.5px;margin-right:2px}.km-probe-tok{padding:1px 8px;border-radius:var(--kx-radius-tag);background:var(--kx-overlay-subtle);color:var(--p-text-muted-color);font-size:11px;font-variant-numeric:tabular-nums}.km-probe-tok b{color:var(--p-text-color);font-weight:700}.km-probe-out{display:flex;flex-direction:column;gap:4px}.km-probe-out span{color:var(--p-text-muted-color);font-size:11.5px;font-weight:700}.km-probe-out pre{margin:0;max-height:160px;overflow:auto;padding:9px 10px;border-radius:6px;background:var(--kx-overlay-subtle);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11.5px;line-height:1.45;white-space:pre-wrap;word-break:break-word}.km-tabs{flex:0 0 auto;display:flex;gap:2px;padding:0 12px;border-bottom:1px solid var(--p-content-border-color)}.km-tab{position:relative;display:inline-flex;align-items:center;gap:7px;height:44px;padding:0 12px;border:0;background:transparent;color:var(--p-text-muted-color);font:inherit;font-size:13px;font-weight:700;cursor:pointer}.km-tab:hover,.km-tab.on{color:var(--p-text-color)}.km-tab.on:after{content:"";position:absolute;left:8px;right:8px;bottom:-1px;height:2px;border-radius:2px 2px 0 0;background:var(--p-primary-color)}.km-tab b{min-width:18px;padding:0 6px;border-radius:999px;background:var(--kx-overlay-subtle);color:var(--p-text-muted-color);font-size:11px;font-weight:700;text-align:center}.km-tab.on b{background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.km-classes{flex:1;min-height:0;display:flex;flex-direction:column}.km-classes-list{display:flex;flex-direction:column;gap:10px;padding:14px 16px}.km-class{flex:0 0 auto;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);overflow:hidden}.km-class-head{display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--kx-overlay-subtle);border-bottom:1px solid var(--p-content-border-color)}.km-class-head-text{flex:1;min-width:0}.km-class-title{display:flex;align-items:center;gap:8px;font-size:13.5px;font-weight:720}.km-class-ref{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;font-weight:600;color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);padding:1px 6px;border-radius:6px}.km-class-desc{margin-top:3px;color:var(--p-text-muted-color);font-size:12px;line-height:1.4}.km-class-meta{display:flex;align-items:center;gap:8px;flex:0 0 auto}.km-class-count{color:var(--p-text-muted-color);font-size:11.5px;white-space:nowrap}.km-class-members{display:flex;flex-direction:column}.km-class-member{display:grid;grid-template-columns:58px minmax(0,1.2fr) minmax(0,1fr) auto;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid var(--p-content-border-color)}.km-class-member:last-child{border-bottom:0}.km-class-member.top{background:color-mix(in srgb,var(--p-success-500) 6%,transparent)}.km-class-rank{width:20px;height:20px;display:inline-flex;align-items:center;justify-content:center;border-radius:6px;background:var(--kx-overlay-subtle);color:var(--p-text-muted-color);font-size:11px;font-weight:700}.km-class-member-name{font-size:13px;font-weight:620;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.km-class-member-id{color:var(--p-text-muted-color);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.km-class-member-pri{color:var(--p-text-muted-color);font-size:11px;justify-self:end;white-space:nowrap}.km-class-empty{padding:12px;color:var(--p-text-muted-color);font-size:12px}@media(max-width:860px){.km-shell{grid-template-columns:1fr;grid-template-rows:auto minmax(0,1fr)}.km-rail{border-right:0;border-bottom:1px solid var(--p-content-border-color);max-height:40vh}.km-form-grid,.km-form-grid.four{grid-template-columns:1fr}.km-class-member{grid-template-columns:auto minmax(0,1fr) auto}.km-class-member-id{display:none}}@media(max-width:560px){.km-probe-grid{grid-template-columns:1fr}}.ks{height:100%;display:flex;flex-direction:column}.ks-top-notice{margin:8px}.ks-rail-search{padding:8px 10px}.ks-rail-list{padding:0 8px 10px;overflow-y:auto}.ks-rail-group{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--p-text-muted-color);padding:10px 6px 4px}.ks-scope-row{width:100%;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;border:none;border-radius:var(--kx-radius-8);background:transparent;cursor:pointer;text-align:left;color:var(--p-text-color);transition:background .12s;font:inherit}.ks-scope-row:hover{background:var(--kx-overlay-hover)}.ks-scope-row.active{background:color-mix(in srgb,var(--p-primary-color) 14%,transparent)}.ks-scope-name{font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ks-scope-meta{flex:none;display:flex;align-items:center;gap:6px}.ks-scope-count{font-size:11px;font-weight:700;color:var(--p-text-muted-color);min-width:18px;text-align:right}.ks-builder,.ks-view{display:flex;flex-direction:column;height:100%;min-height:0;padding:14px 16px;gap:14px}.ks-builder-head{display:flex;align-items:center;justify-content:space-between;gap:12px}.ks-builder-title{display:flex;align-items:center;gap:8px;font-size:16px;font-weight:700;color:var(--p-text-color)}.ks-builder-acts{display:flex;gap:8px}.ks-fields{display:grid;grid-template-columns:220px 1fr 1fr;gap:12px}.ks-field-err{display:block;margin-top:4px;font-size:11px;color:var(--p-danger-500)}.ks-panes{flex:1;min-height:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.ks-pane{display:flex;flex-direction:column;min-height:0;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);background:var(--kx-overlay-subtle)}.ks-pane.drop{border-style:dashed}.ks-pane-head{display:flex;align-items:baseline;justify-content:space-between;gap:8px;padding:10px 12px 8px;font-size:13px;font-weight:700;color:var(--p-text-color)}.ks-pane-sub{font-size:11px;font-weight:500;color:var(--p-text-muted-color)}.ks-pane-search{padding:0 10px 8px}.ks-pane-body{flex:1;min-height:0;overflow-y:auto;padding:4px 10px 10px;display:flex;flex-direction:column;gap:8px}.ks-pane-empty{padding:16px 8px;font-size:12px;color:var(--p-text-muted-color);text-align:center}.ks-drop-hint{margin:auto;display:flex;flex-direction:column;align-items:center;gap:8px;padding:24px;color:var(--p-text-muted-color);font-size:13px;text-align:center}.ks-drop-hint svg{font-size:28px}.ks-view-note{font-size:12px;color:var(--p-text-muted-color);line-height:1.5;margin:0}.ks-view-id{display:block;margin-top:4px;font-family:ui-monospace,Menlo,monospace;font-size:11px;color:var(--p-text-muted-color);overflow-wrap:anywhere}.ks-view-list{border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);background:var(--kx-overlay-subtle);padding:4px 10px}.ks-view-pol{padding:8px 4px;border-bottom:1px solid var(--p-content-border-color)}.ks-view-pol:last-child{border-bottom:none}.ks-view-pol-title{font-size:13px;font-weight:600;color:var(--p-text-color)}.ks-view-pol-comment{font-size:12px;color:var(--p-text-muted-color);margin-top:2px}.ks-view-pol-id{font-size:10.5px;color:var(--p-text-muted-color);font-family:ui-monospace,Menlo,monospace;margin-top:2px;overflow-wrap:anywhere}.ks-eff{font-size:10px;font-weight:700;text-transform:uppercase;padding:1px 6px;border-radius:999px;margin-left:6px}.ks-eff.allow{background:color-mix(in srgb,var(--p-success-600) 14%,transparent);color:var(--p-success-700)}.ks-eff.deny{background:color-mix(in srgb,var(--p-danger-500) 14%,transparent);color:var(--p-danger-700)}.ks-pcard{display:flex;align-items:flex-start;gap:8px;padding:10px 10px 10px 6px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);background:var(--p-content-background);cursor:grab;transition:border-color .12s,box-shadow .12s,transform .08s}.ks-pcard:hover{border-color:var(--p-primary-color);box-shadow:0 1px 6px #0000000f}.ks-pcard:active{cursor:grabbing;transform:scale(.997)}.ks-pcard-grip{flex:none;margin-top:2px;color:var(--p-text-muted-color);font-size:15px}.ks-pcard-body{flex:1;min-width:0}.ks-pcard-head{display:flex;align-items:center;gap:8px}.ks-pcard-title{font-weight:600;font-size:13px;color:var(--p-text-color);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ks-pcard-comment{font-size:12px;color:var(--p-text-muted-color);margin-top:2px;line-height:1.35}.ks-pcard-id{font-size:10.5px;color:var(--p-text-muted-color);margin-top:3px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ks-pcard-act{flex:none;width:24px;height:24px;display:grid;place-items:center;border:none;border-radius:6px;cursor:pointer;background:transparent;color:var(--p-text-muted-color);transition:background .12s,color .12s}.ks-pcard-act.add:hover{background:color-mix(in srgb,var(--p-success-600) 12%,transparent);color:var(--p-success-700)}.ks-pcard-act.remove:hover{background:color-mix(in srgb,var(--p-danger-500) 12%,transparent);color:var(--p-danger-700)}.ks-pcard{flex-direction:column;align-items:stretch}.ks-pcard-row{display:flex;align-items:flex-start;gap:8px}.ks-pcard.locked{cursor:default;opacity:.9}.ks-pcard.locked:hover{border-color:var(--p-content-border-color);box-shadow:none}.ks-pcard-grip.locked,.ks-pcard-act.detail{color:var(--p-text-muted-color)}.ks-pcard-act.detail svg{transition:transform .15s}.ks-pcard-act.detail.open svg{transform:rotate(90deg)}.ks-pcard-act.detail:hover{background:var(--kx-overlay-hover);color:var(--p-text-color)}.ks-pcard-detail{margin-top:8px;padding-top:8px;border-top:1px dashed var(--p-content-border-color);display:flex;flex-direction:column;gap:5px}.ks-pcard-kv{display:flex;gap:8px;font-size:11px;align-items:flex-start}.ks-pcard-kv>span{flex:none;width:64px;color:var(--p-text-muted-color);text-transform:uppercase;font-weight:700;letter-spacing:.03em;font-size:10px;padding-top:3px}.ks-pcard-tags{display:flex;flex-wrap:wrap;gap:4px}.ks-pcard-kv code,.ks-eff-code{min-width:0;overflow-wrap:anywhere;font-family:ui-monospace,Menlo,monospace;font-size:10.5px;background:var(--kx-overlay-subtle);padding:1px 5px;border-radius:4px;color:var(--p-text-color)}.ks-eff-code.allow{color:var(--p-success-700)}.ks-eff-code.deny{color:var(--p-danger-700)}.ks-pcard-none{color:var(--p-text-muted-color);font-size:11px}.ks-overlay-warn{display:flex;gap:10px;align-items:flex-start;padding:10px 12px;border-radius:var(--kx-radius-8);background:color-mix(in srgb,var(--p-warn-500) 12%,transparent);border:1px solid color-mix(in srgb,var(--p-warn-500) 40%,transparent);color:var(--p-text-color);font-size:12.5px;line-height:1.45}.ks-overlay-warn svg{flex:none;margin-top:1px;color:var(--p-warn-600);font-size:18px}.ks-panes.three{grid-template-columns:repeat(3,minmax(0,1fr))}.ks-pane.locked-pane{background:var(--kx-overlay-hover)}.ks-ext-block{margin-top:14px}.ks-ext-head{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700;color:var(--p-text-color);margin-bottom:6px}.ks-ext-head svg{color:var(--p-warn-600)}.ks-tabs{flex:0 0 auto;padding:0 12px;border-bottom:1px solid var(--p-content-border-color)}.ks-tabs .p-tab{display:inline-flex;align-items:center;gap:7px}.ks-tabs .p-tab svg{font-size:15px}.ks-tabs .p-tab b{min-width:18px;padding:0 6px;border-radius:999px;background:var(--kx-overlay-subtle);color:var(--p-text-muted-color);font-size:11px;font-weight:700;text-align:center}.ks-tabs .p-tab[aria-selected=true] b{background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.ks-runas{flex:1;min-height:0;overflow:auto;padding:20px 24px;display:flex;flex-direction:column;gap:16px;color:var(--p-text-color)}.ks-runas>*{width:100%;max-width:860px}.ks-runas-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}.ks-runas-title{margin:0 0 6px;font-size:16px;font-weight:700}.ks-runas-lede{margin:0;max-width:640px;color:var(--p-text-muted-color);font-size:13px;line-height:1.5}.ks-runas-lede b{color:var(--p-text-color);font-weight:600}.ks-runas-acts{flex:0 0 auto;display:flex;align-items:center;gap:6px}.ks-runas-form{border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);background:var(--kx-overlay-subtle)}.ks-runas-form fieldset{border:0;margin:0;padding:0;min-width:0}.ks-runas-form-head{display:flex;align-items:center;justify-content:space-between;padding:10px 12px 10px 16px;border-bottom:1px solid var(--p-content-border-color);font-size:13px;font-weight:700}.ks-runas-form-foot{display:flex;justify-content:flex-end;gap:8px;padding:12px 16px;border-top:1px solid var(--p-content-border-color)}.ks-runas-steps{list-style:none;counter-reset:step;margin:0;padding:16px;display:flex;flex-direction:column;gap:18px}.ks-runas-steps>li{counter-increment:step;position:relative;padding-left:34px;display:flex;flex-direction:column;gap:8px}.ks-runas-steps>li:before{content:counter(step);position:absolute;left:0;top:0;width:22px;height:22px;border-radius:999px;display:grid;place-items:center;font-size:11.5px;font-weight:700;color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 14%,transparent)}.ks-runas-chips{display:flex;flex-wrap:wrap;gap:6px}.ks-runas-chip{display:inline-flex;align-items:center;gap:4px;padding:3px 4px 3px 10px;border-radius:999px;border:1px solid var(--p-content-border-color);background:var(--p-content-background);font-size:12px}.ks-runas-chip button{display:grid;place-items:center;width:18px;height:18px;border:0;border-radius:999px;background:transparent;color:var(--p-text-muted-color);cursor:pointer}.ks-runas-chip button:hover{background:var(--kx-overlay-hover);color:var(--p-text-color)}.ks-runas-seg{display:inline-flex;padding:2px;border-radius:var(--kx-radius-8);border:1px solid var(--p-content-border-color);background:var(--p-content-background);align-self:flex-start}.ks-runas-seg button{border:0;border-radius:6px;padding:5px 12px;background:transparent;color:var(--p-text-muted-color);font:inherit;font-size:12.5px;font-weight:600;cursor:pointer}.ks-runas-seg button.on{background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.ks-runas-pending{display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:13px}.ks-runas-list{display:flex;flex-direction:column;gap:8px}.ks-runas-grant{display:flex;align-items:center;gap:12px;padding:12px 14px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);background:var(--p-content-background)}.ks-runas-grant.revoked{opacity:.6}.ks-runas-grant-icon{flex:0 0 auto;font-size:20px;color:var(--p-primary-color)}.ks-runas-grant.revoked .ks-runas-grant-icon{color:var(--p-text-muted-color)}.ks-runas-grant-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}.ks-runas-grant-line{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px;font-size:13.5px}.ks-runas-who{font-weight:650;overflow-wrap:anywhere}.ks-runas-verb{color:var(--p-text-muted-color)}.ks-runas-grant-meta{color:var(--p-text-muted-color);font-size:12px;overflow-wrap:anywhere}.ks-runas-grant-meta code{font-family:ui-monospace,Menlo,monospace;font-size:11px;padding:1px 5px;border-radius:4px;background:var(--kx-overlay-subtle)}.ks-runas-empty{display:flex;flex-direction:column;align-items:center;gap:8px;padding:40px 16px;text-align:center;border:1px dashed var(--p-content-border-color);border-radius:var(--kx-radius-10);color:var(--p-text-muted-color);font-size:13px}.ks-runas-empty>svg{font-size:28px}.ks-runas-empty b{color:var(--p-text-color)}@media(max-width:640px){.ks-runas{padding:16px}.ks-runas-head{flex-direction:column}.ks-runas-grant{flex-wrap:wrap}}', Gc = { props: { type: "object", properties: {} } }, Qc = {
  wippy: Gc
};
class Zc extends jo {
  static get wippyConfig() {
    return {
      propsSchema: Qc.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: Yc
    };
  }
  static get vueConfig() {
    return { rootComponent: qc, plugins: [gi] };
  }
}
no(import.meta.url, Zc);
//# sourceMappingURL=index.js.map
