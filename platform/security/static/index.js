import { hasInjectionContext as qr, inject as Hn, effectScope as Yr, ref as D, markRaw as Zr, onMounted as Yt, onUnmounted as Kn, watch as Te, createApp as Qr, readonly as Jr, getCurrentInstance as Nt, nextTick as Zt, reactive as Xr, renderSlot as Q, openBlock as f, createBlock as j, Teleport as Gn, createCommentVNode as A, useId as qn, mergeProps as E, h as eo, resolveDirective as Qt, withDirectives as Fe, resolveDynamicComponent as ze, withCtx as B, normalizeClass as be, createElementBlock as g, createElementVNode as b, defineComponent as ie, createTextVNode as W, toDisplayString as N, resolveComponent as sn, computed as X, unref as h, createVNode as L, onBeforeUnmount as to, withModifiers as Me, Fragment as ge, renderList as ye, vShow as ln } from "vue";
import { addCollection as no, Icon as ee } from "@iconify/vue";
import { config as dn, addIcons as ro, on as oo, applyThemeMode as mt, host as Jt, hostCss as ao, loadCss as io, loadByTagName as so, api as Le, define as lo } from "@wippy-fe/proxy";
var jt = "data-wippy-visible";
function cn(e) {
  const t = e.getAttribute(jt);
  return t === "true" ? !0 : t === "false" ? !1 : null;
}
var co = Object.defineProperty, uo = (e, t, n) => t in e ? co(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, Z = (e, t, n) => uo(e, typeof t != "symbol" ? t + "" : t, n), po = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], fo = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function un(e) {
  const t = e.startsWith("--") ? e : `--${e}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(t) ? t : null;
}
function mo(...e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of e)
    if (n)
      for (const [r, o] of Object.entries(n)) {
        if ((r === "@light" || r === "@dark") && o && typeof o == "object") {
          for (const [l, d] of Object.entries(o)) {
            const i = typeof d == "string" ? un(l) : null;
            i && t.add(i);
          }
          continue;
        }
        const a = typeof o == "string" ? un(r) : null;
        a && t.add(a);
      }
  return [...t].sort();
}
function bo(e) {
  if (e.length === 0)
    return "";
  const t = e.map((n) => `  ${n}: inherit;`).join(`
`);
  return `${fo} {
${t}
}`;
}
function ho(e, t) {
  const n = bo(t);
  n && Yn(e, n, "@wippy-fe/css-variables-bridge");
}
function vo(e, t) {
  const r = (t ?? po).map(async (o) => {
    const a = ao[o];
    if (!a)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${o}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await io(a);
    } catch (l) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${o}" (${a}):`, l), null;
    }
  });
  return Promise.all(r).then((o) => {
    for (const a of o) {
      if (!a)
        continue;
      const l = document.createElement("style");
      l.textContent = a, l.setAttribute("role", "@wippy-fe/host-css"), e.appendChild(l);
    }
  });
}
function go(e, t) {
  const n = document.createElement("style");
  n.textContent = t, e.appendChild(n);
}
function Yn(e, t, n) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const o = new CSSStyleSheet();
    o.replaceSync(t), e.adoptedStyleSheets = [...e.adoptedStyleSheets, o];
    return;
  }
  const r = document.createElement("style");
  r.setAttribute("role", n), r.textContent = t, e.appendChild(r);
}
function yo(e, t) {
  Yn(e, t, "@wippy-fe/custom-css");
}
function Zn(e) {
  return e.__wippyHost ?? null;
}
function ko(e) {
  return e.replace(/-([a-z])/g, (t, n) => n.toUpperCase());
}
function xo(e, t, n) {
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
function Tt(e, t) {
  const n = {}, r = [];
  for (const [o, a] of Object.entries(t.properties)) {
    const l = e.getAttribute(o), d = ko(o);
    if (l === null) {
      a.default !== void 0 && (n[d] = a.default);
      continue;
    }
    const i = xo(o, l, a);
    i.error ? r.push(i.error) : n[d] = i.value;
  }
  return { props: n, errors: r };
}
var wo = class {
  constructor(e, t) {
    Z(this, "_props"), Z(this, "_errors"), Z(this, "_content"), Z(this, "_hostVisibility"), Z(this, "_propsListeners", /* @__PURE__ */ new Set()), Z(this, "_contentListeners", /* @__PURE__ */ new Set()), Z(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), Z(this, "_disposed", !1), Z(this, "_emitToDom"), Z(this, "props"), Z(this, "events"), Z(this, "content"), Z(this, "hostVisibility"), this._props = e.props, this._errors = e.errors, this._content = e.content, this._hostVisibility = e.hostVisibility, this._emitToDom = t;
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
}, $o = class extends HTMLElement {
  constructor() {
    super(), Z(this, "_internals"), Z(this, "_contentObserver", null), Z(this, "_initialized", !1), Z(this, "_container", null), Z(this, "_reactive", null), Z(this, "_lastProps", null), Z(this, "_lastErrors", []), Z(this, "_lastContent", null), Z(this, "_themeUnsub", null), Z(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = cn(this);
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
    return Zn(this);
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
        const a = Tt(this, e.propsSchema);
        e.validateProps && a.errors.push(...e.validateProps(a.props)), n = a.props, r = a.errors, this._lastProps = n, this._lastErrors = r;
      }
      const o = t ? this._lastContent ?? this._extractContent(e.contentTemplate) : null;
      t && this._lastContent === null && (this._lastContent = o), this._reactive = new wo(
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
        this.onInit(n), e.inlineCss && go(n, e.inlineCss);
        try {
          const c = dn?.theming, s = mo(
            c?.global?.cssVariables,
            c?.children?.cssVariables
          );
          ho(n, s);
        } catch {
        }
        if (e.customCss !== !1)
          try {
            const c = dn?.theming, s = [c?.global?.customCSS, c?.children?.customCSS].filter(Boolean).join(`
`);
            s && yo(n, s);
          } catch {
          }
        (e.hostCssKeys === void 0 || e.hostCssKeys.length > 0) && vo(n, e.hostCssKeys), r = document.createElement("div"), r.setAttribute("data-wippy-theme-root", "");
        const i = e.containerClasses ?? [];
        i.length > 0 && r.classList.add(...i), n.appendChild(r), this._container = r, ro(no);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = oo("@theme", (i) => this._applyTheme(i)));
      const { props: o, errors: a } = Tt(this, e.propsSchema);
      e.validateProps && a.push(...e.validateProps(o));
      const l = o;
      this._lastProps = l, this._lastErrors = a;
      let d = null;
      e.contentTemplate && (d = this._extractContent(e.contentTemplate), this._lastContent = d, this._contentObserver = new MutationObserver(() => {
        const i = this._extractContent(e.contentTemplate);
        this._lastContent = i, this._reactive?.notifyContent(i), this.onContentChanged(i);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(n, r, l, a, d, t), this._internals.states.delete("loading"), this._internals.states.add("ready"), t || (this._initialized = !0), this.onReady(), this.emitEvent("load");
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
  _applyTheme(e = Jt.getThemeMode?.()) {
    mt(e, this), this._container && mt(e, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), mt("auto", this), this._container && mt("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(e, t, n) {
    if (t === n)
      return;
    if (e === jt) {
      const d = this._hostVisible, i = cn(this);
      if (i === d)
        return;
      this._hostVisible = i, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(i, d), this.onHostVisibilityChanged(i, d));
      return;
    }
    const r = this.constructor.wippyConfig, { props: o, errors: a } = Tt(this, r.propsSchema);
    r.validateProps && a.push(...r.validateProps(o));
    const l = o;
    this._lastProps = l, this._lastErrors = a, this._reactive?.notifyProps(l, a), this.onPropsChanged(l, a);
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
function So(e) {
  return e.__wippyHostBus ?? null;
}
function _o(e) {
  return e.dataset.wippyPanelId ?? null;
}
/*!
 * pinia v4.0.3
 * (c) 2026 Eduardo San Martin Morote
 * @license MIT
 */
let Qn;
const Jn = (e) => Qn = e, Co = () => qr() && Hn(Xn) || Qn, Xn = (
  /* istanbul ignore next */
  Symbol()
);
function Po() {
  const e = Yr(!0), t = e.run(() => D({}));
  let n = [], r = [];
  const o = Zr({
    install(a) {
      Jn(o), o._a = a, a.provide(Xn, o), a.config.globalProperties.$pinia = o, r.forEach((l) => n.push(l)), r = [];
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
var To = Object.defineProperty, Oo = (e, t, n) => t in e ? To(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, Re = (e, t, n) => Oo(e, typeof t != "symbol" ? t + "" : t, n), Ao = /* @__PURE__ */ Symbol("wippy:emit"), Lo = /* @__PURE__ */ Symbol("wippy:props"), Eo = /* @__PURE__ */ Symbol("wippy:props_error"), No = /* @__PURE__ */ Symbol("wippy:content"), jo = /* @__PURE__ */ Symbol("wippy:panel-id"), zo = /* @__PURE__ */ Symbol("wippy:layout-bus"), Io = /* @__PURE__ */ Symbol("wippy:host"), er = /* @__PURE__ */ Symbol("wippy:host-visibility");
function Ro() {
  const e = Hn(er);
  if (!e)
    throw new Error("useHostVisibility() must be called inside a WippyVueElement");
  return e;
}
function Vo(e) {
  const t = Ro();
  let n = !1, r = null, o = !1;
  function a() {
    if (r)
      return o = !0, r;
    let l;
    try {
      l = Promise.resolve(e());
    } catch (i) {
      l = Promise.reject(i);
    }
    const d = l.finally(() => {
      if (r === d && (r = null, n && o))
        return o = !1, a();
    });
    return r = d, d;
  }
  return Yt(() => (n = !0, a())), Kn(() => {
    n = !1, o = !1;
  }), Te(t, (l, d) => {
    if (n && d === !1 && l === !0)
      return a();
  }), t;
}
var Bo = class extends $o {
  constructor() {
    super(...arguments), Re(this, "_vueApp", null), Re(this, "_propsRef", D({})), Re(this, "_errorsRef", D([])), Re(this, "_contentRef", D(null)), Re(this, "_hostVisibilityRef", D(null)), Re(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  onMount(e, t, n, r, o, a) {
    const l = this.constructor.vueConfig;
    this._propsRef.value = n, this._errorsRef.value = r, this._contentRef.value = o ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const c of r)
      this.emitEvent("invalid", { message: c });
    const d = new AbortController();
    this._bridgeAbort = d, this.reactive.props.subscribe((c, s) => {
      this._propsRef.value = c, this._errorsRef.value = [...s];
      for (const u of s)
        this.emitEvent("invalid", { message: u });
    }, { signal: d.signal }), this.reactive.content && this.reactive.content.subscribe((c) => {
      this._contentRef.value = c;
    }, { signal: d.signal }), this.reactive.hostVisibility.subscribe((c) => {
      this._hostVisibilityRef.value = c;
    }, { signal: d.signal });
    const i = (c) => {
      if (d.signal.aborted)
        return;
      const s = Co(), u = Qr(c.rootComponent);
      this._vueApp = u;
      const p = Po();
      if (c.piniaPlugins)
        for (const m of c.piniaPlugins)
          p.use(m);
      if (u.use(p), c.plugins)
        for (const m of c.plugins)
          u.use(m);
      u.provide(Lo, this._propsRef), u.provide(Eo, this._errorsRef), u.provide(Ao, this.emitEvent.bind(this)), u.provide(No, this._contentRef), u.provide(er, this._hostVisibilityRef), u.provide(jo, _o(this)), u.provide(zo, So(this)), u.provide(Io, Zn(this)), c.providers && c.providers(u, this), u.mount(t), s && Jn(s);
    };
    if (l.rootComponent)
      i(l);
    else if (l.lazyConfig) {
      const c = document.createElement("wippy-loading");
      c.setAttribute("no-bg", ""), t.appendChild(c), l.lazyConfig().then((s) => {
        d.signal.aborted || (c.remove(), i(s));
      }).catch((s) => {
        if (d.signal.aborted)
          return;
        const u = s instanceof Error ? s.message : String(s), p = document.createElement("wippy-error");
        p.setAttribute("title", "Failed to load"), p.setAttribute("message", u), c.replaceWith(p), this.emitEvent("error", { message: u });
      });
    } else
      throw new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._vueApp && (this._vueApp.unmount(), this._vueApp = null);
  }
}, Do = Object.defineProperty, pn = Object.getOwnPropertySymbols, Mo = Object.prototype.hasOwnProperty, Fo = Object.prototype.propertyIsEnumerable, fn = (e, t, n) => t in e ? Do(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, Uo = (e, t) => {
  for (var n in t || (t = {})) Mo.call(t, n) && fn(e, n, t[n]);
  if (pn) for (var n of pn(t)) Fo.call(t, n) && fn(e, n, t[n]);
  return e;
};
function Ie(e) {
  return e == null || e === "" || Array.isArray(e) && e.length === 0 || !(e instanceof Date) && typeof e == "object" && Object.keys(e).length === 0;
}
function zt(e, t, n = /* @__PURE__ */ new WeakSet()) {
  if (e === t) return !0;
  if (!e || !t || typeof e != "object" || typeof t != "object" || n.has(e) || n.has(t)) return !1;
  n.add(e).add(t);
  let r = Array.isArray(e), o = Array.isArray(t), a, l, d;
  if (r && o) {
    if (l = e.length, l != t.length) return !1;
    for (a = l; a-- !== 0; ) if (!zt(e[a], t[a], n)) return !1;
    return !0;
  }
  if (r != o) return !1;
  let i = e instanceof Date, c = t instanceof Date;
  if (i != c) return !1;
  if (i && c) return e.getTime() == t.getTime();
  let s = e instanceof RegExp, u = t instanceof RegExp;
  if (s != u) return !1;
  if (s && u) return e.toString() == t.toString();
  let p = Object.keys(e);
  if (l = p.length, l !== Object.keys(t).length) return !1;
  for (a = l; a-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(t, p[a])) return !1;
  for (a = l; a-- !== 0; ) if (d = p[a], !zt(e[d], t[d], n)) return !1;
  return !0;
}
function Wo(e, t) {
  return zt(e, t);
}
function Xt(e) {
  return typeof e == "function" && "call" in e && "apply" in e;
}
function q(e) {
  return !Ie(e);
}
function mn(e, t) {
  return null;
}
function tr(e, t, n) {
  return n ? mn() === mn() : Wo(e, t);
}
function Se(e, t = !0) {
  return e instanceof Object && e.constructor === Object && (t || Object.keys(e).length !== 0);
}
function nr(e = {}, t = {}) {
  let n = Uo({}, e);
  return Object.keys(t).forEach((r) => {
    let o = r;
    Se(t[o]) && o in e && Se(e[o]) ? n[o] = nr(e[o], t[o]) : n[o] = t[o];
  }), n;
}
function Ho(...e) {
  return e.reduce((t, n, r) => r === 0 ? n : nr(t, n), {});
}
function pe(e, ...t) {
  return Xt(e) ? e(...t) : e;
}
function de(e, t = !0) {
  return typeof e == "string" && (t || e !== "");
}
function $e(e) {
  return de(e) ? e.replace(/(-|_)/g, "").toLowerCase() : e;
}
function en(e, t = "", n = {}) {
  let r = $e(t).split("."), o = r.shift();
  if (o) {
    if (Se(e)) {
      let a = Object.keys(e).find((l) => $e(l) === o) || "";
      return en(pe(e[a], n), r.join("."), n);
    }
    return;
  }
  return pe(e, n);
}
function rr(e, t = !0) {
  return Array.isArray(e) && (t || e.length !== 0);
}
function Ko(e) {
  return q(e) && !isNaN(e);
}
function Ne(e, t) {
  if (t) {
    let n = t.test(e);
    return t.lastIndex = 0, n;
  }
  return !1;
}
function Go(...e) {
  return Ho(...e);
}
function qe(e) {
  return e && e.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function qo(e) {
  return de(e, !1) ? e[0].toUpperCase() + e.slice(1) : e;
}
function or(e) {
  return de(e) ? e.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : e;
}
function ar() {
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
function _e(...e) {
  if (e) {
    let t = [];
    for (let n = 0; n < e.length; n++) {
      let r = e[n];
      if (!r) continue;
      let o = typeof r;
      if (o === "string" || o === "number") t.push(r);
      else if (o === "object") {
        let a = Array.isArray(r) ? [_e(...r)] : Object.entries(r).map(([l, d]) => d ? l : void 0);
        t = a.length ? t.concat(a.filter((l) => !!l)) : t;
      }
    }
    return t.join(" ").trim();
  }
}
function Yo(e, t) {
  return e ? e.classList ? e.classList.contains(t) : new RegExp("(^| )" + t + "( |$)", "gi").test(e.className) : !1;
}
function Zo(e, t) {
  if (e && t) {
    let n = (r) => {
      Yo(e, r) || (e.classList ? e.classList.add(r) : e.className += " " + r);
    };
    [t].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function Ot(e, t) {
  if (e && t) {
    let n = (r) => {
      e.classList ? e.classList.remove(r) : e.className = e.className.replace(new RegExp("(^|\\b)" + r.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [t].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function bn(e) {
  return e ? Math.abs(e.scrollLeft) : 0;
}
function hn(e) {
  return e ? getComputedStyle(e).direction === "rtl" : !1;
}
function ir(e, t) {
  return e instanceof HTMLElement ? e.offsetWidth : 0;
}
function Qo(e) {
  if (e) {
    let t = e.parentNode;
    return t && t instanceof ShadowRoot && t.host && (t = t.host), t;
  }
  return null;
}
function Jo(e) {
  return !!(e !== null && typeof e < "u" && e.nodeName && Qo(e));
}
function ut(e) {
  return typeof Element < "u" ? e instanceof Element : e !== null && typeof e == "object" && e.nodeType === 1 && typeof e.nodeName == "string";
}
function kt(e, t = {}) {
  if (ut(e)) {
    let n = (r, o) => {
      var a, l;
      let d = (a = e?.$attrs) != null && a[r] ? [(l = e?.$attrs) == null ? void 0 : l[r]] : [];
      return [o].flat().reduce((i, c) => {
        if (c != null) {
          let s = typeof c;
          if (s === "string" || s === "number") i.push(c);
          else if (s === "object") {
            let u = Array.isArray(c) ? n(r, c) : Object.entries(c).map(([p, m]) => r === "style" && (m || m === 0) ? `${p.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}:${m}` : m ? p : void 0);
            i = u.length ? i.concat(u.filter((p) => !!p)) : i;
          }
        }
        return i;
      }, d);
    };
    Object.entries(t).forEach(([r, o]) => {
      if (o != null) {
        let a = r.match(/^on(.+)/);
        a ? e.addEventListener(a[1].toLowerCase(), o) : r === "p-bind" || r === "pBind" ? kt(e, o) : (o = r === "class" ? [...new Set(n("class", o))].join(" ").trim() : r === "style" ? n("style", o).join(";").trim() : o, (e.$attrs = e.$attrs || {}) && (e.$attrs[r] = o), e.setAttribute(r, o));
      }
    });
  }
}
function Xo(e, t = {}, ...n) {
  {
    let r = document.createElement(e);
    return kt(r, t), r.append(...n), r;
  }
}
function Qe(e, t) {
  return ut(e) ? e.matches(t) ? e : e.querySelector(t) : null;
}
function ea(e, t) {
  e && document.activeElement !== e && e.focus(t);
}
function He(e, t) {
  if (ut(e)) {
    let n = e.getAttribute(t);
    return isNaN(n) ? n === "true" || n === "false" ? n === "true" : n : +n;
  }
}
function It(e) {
  if (e) {
    let t = e.offsetHeight, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingTop) + parseFloat(n.paddingBottom) + parseFloat(n.borderTopWidth) + parseFloat(n.borderBottomWidth), t;
  }
  return 0;
}
function Ke(e) {
  if (e) {
    let t = e.getBoundingClientRect();
    return { top: t.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: t.left + (window.pageXOffset || bn(document.documentElement) || bn(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function sr(e, t) {
  return e ? e.offsetHeight : 0;
}
function Ye(e) {
  if (e) {
    let t = e.offsetWidth, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingLeft) + parseFloat(n.paddingRight) + parseFloat(n.borderLeftWidth) + parseFloat(n.borderRightWidth), t;
  }
  return 0;
}
function lr() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function ta(e, t = "", n) {
  ut(e) && n !== null && n !== void 0 && e.setAttribute(t, n);
}
var bt = {};
function na(e = "pui_id_") {
  return Object.hasOwn(bt, e) || (bt[e] = 0), bt[e]++, `${e}${bt[e]}`;
}
var ra = Object.defineProperty, oa = Object.defineProperties, aa = Object.getOwnPropertyDescriptors, xt = Object.getOwnPropertySymbols, dr = Object.prototype.hasOwnProperty, cr = Object.prototype.propertyIsEnumerable, vn = (e, t, n) => t in e ? ra(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, ke = (e, t) => {
  for (var n in t || (t = {})) dr.call(t, n) && vn(e, n, t[n]);
  if (xt) for (var n of xt(t)) cr.call(t, n) && vn(e, n, t[n]);
  return e;
}, At = (e, t) => oa(e, aa(t)), Pe = (e, t) => {
  var n = {};
  for (var r in e) dr.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
  if (e != null && xt) for (var r of xt(e)) t.indexOf(r) < 0 && cr.call(e, r) && (n[r] = e[r]);
  return n;
}, ia = ar(), ne = ia, Je = /{([^}]*)}/g, ur = /(\d+\s+[\+\-\*\/]\s+\d+)/g, pr = /var\([^)]+\)/g;
function gn(e) {
  return de(e) ? e.replace(/[A-Z]/g, (t, n) => n === 0 ? t : "." + t.toLowerCase()).toLowerCase() : e;
}
function sa(e) {
  return Se(e) && e.hasOwnProperty("$value") && e.hasOwnProperty("$type") ? e.$value : e;
}
function la(e) {
  return e.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function Rt(e = "", t = "") {
  return la(`${de(e, !1) && de(t, !1) ? `${e}-` : e}${t}`);
}
function fr(e = "", t = "") {
  return `--${Rt(e, t)}`;
}
function da(e = "") {
  let t = (e.match(/{/g) || []).length, n = (e.match(/}/g) || []).length;
  return (t + n) % 2 !== 0;
}
function mr(e, t = "", n = "", r = [], o) {
  if (de(e)) {
    let a = e.trim();
    if (da(a)) return;
    if (Ne(a, Je)) {
      let l = a.replaceAll(Je, (d) => {
        let i = d.replace(/{|}/g, "").split(".").filter((c) => !r.some((s) => Ne(c, s)));
        return `var(${fr(n, or(i.join("-")))}${q(o) ? `, ${o}` : ""})`;
      });
      return Ne(l.replace(pr, "0"), ur) ? `calc(${l})` : l;
    }
    return a;
  } else if (Ko(e)) return e;
}
function ca(e, t, n) {
  de(t, !1) && e.push(`${t}:${n};`);
}
function Ve(e, t) {
  return e ? `${e}{${t}}` : "";
}
function br(e, t) {
  if (e.indexOf("dt(") === -1) return e;
  function n(l, d) {
    let i = [], c = 0, s = "", u = null, p = 0;
    for (; c <= l.length; ) {
      let m = l[c];
      if ((m === '"' || m === "'" || m === "`") && l[c - 1] !== "\\" && (u = u === m ? null : m), !u && (m === "(" && p++, m === ")" && p--, (m === "," || c === l.length) && p === 0)) {
        let x = s.trim();
        x.startsWith("dt(") ? i.push(br(x, d)) : i.push(r(x)), s = "", c++;
        continue;
      }
      m !== void 0 && (s += m), c++;
    }
    return i;
  }
  function r(l) {
    let d = l[0];
    if ((d === '"' || d === "'" || d === "`") && l[l.length - 1] === d) return l.slice(1, -1);
    let i = Number(l);
    return isNaN(i) ? l : i;
  }
  let o = [], a = [];
  for (let l = 0; l < e.length; l++) if (e[l] === "d" && e.slice(l, l + 3) === "dt(") a.push(l), l += 2;
  else if (e[l] === ")" && a.length > 0) {
    let d = a.pop();
    a.length === 0 && o.push([d, l]);
  }
  if (!o.length) return e;
  for (let l = o.length - 1; l >= 0; l--) {
    let [d, i] = o[l], c = e.slice(d + 3, i), s = n(c, t), u = t(...s);
    e = e.slice(0, d) + u + e.slice(i + 1);
  }
  return e;
}
var je = (...e) => ua(G.getTheme(), ...e), ua = (e = {}, t, n, r) => {
  if (t) {
    let { variable: o, options: a } = G.defaults || {}, { prefix: l, transform: d } = e?.options || a || {}, i = Ne(t, Je) ? t : `{${t}}`;
    return r === "value" || Ie(r) && d === "strict" ? G.getTokenValue(t) : mr(i, void 0, l, [o.excludedKeyRegex], n);
  }
  return "";
};
function ht(e, ...t) {
  if (e instanceof Array) {
    let n = e.reduce((r, o, a) => {
      var l;
      return r + o + ((l = pe(t[a], { dt: je })) != null ? l : "");
    }, "");
    return br(n, je);
  }
  return pe(e, { dt: je });
}
function pa(e, t = {}) {
  let n = G.defaults.variable, { prefix: r = n.prefix, selector: o = n.selector, excludedKeyRegex: a = n.excludedKeyRegex } = t, l = [], d = [], i = [{ node: e, path: r }];
  for (; i.length; ) {
    let { node: s, path: u } = i.pop();
    for (let p in s) {
      let m = s[p], x = sa(m), P = Ne(p, a) ? Rt(u) : Rt(u, or(p));
      if (Se(x)) i.push({ node: x, path: P });
      else {
        let S = fr(P), T = mr(x, P, r, [a]);
        ca(d, S, T);
        let O = P;
        r && O.startsWith(r + "-") && (O = O.slice(r.length + 1)), l.push(O.replace(/-/g, "."));
      }
    }
  }
  let c = d.join("");
  return { value: d, tokens: l, declarations: c, css: Ve(o, c) };
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
  return pa(e, { prefix: t?.prefix });
}, getCommon({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var a, l, d, i, c, s, u;
  let { preset: p, options: m } = t, x, P, S, T, O, z, $;
  if (q(p) && m.transform !== "strict") {
    let { primitive: y, semantic: F, extend: V } = p, K = F || {}, { colorScheme: oe } = K, Y = Pe(K, ["colorScheme"]), ce = V || {}, { colorScheme: I } = ce, w = Pe(ce, ["colorScheme"]), C = oe || {}, { dark: J } = C, te = Pe(C, ["dark"]), ue = I || {}, { dark: fe } = ue, Oe = Pe(ue, ["dark"]), he = q(y) ? this._toVariables({ primitive: y }, m) : {}, me = q(Y) ? this._toVariables({ semantic: Y }, m) : {}, se = q(te) ? this._toVariables({ light: te }, m) : {}, k = q(J) ? this._toVariables({ dark: J }, m) : {}, v = q(w) ? this._toVariables({ semantic: w }, m) : {}, _ = q(Oe) ? this._toVariables({ light: Oe }, m) : {}, ae = q(fe) ? this._toVariables({ dark: fe }, m) : {}, [pt, ft] = [(a = he.declarations) != null ? a : "", he.tokens], [Er, Nr] = [(l = me.declarations) != null ? l : "", me.tokens || []], [jr, zr] = [(d = se.declarations) != null ? d : "", se.tokens || []], [Ir, Rr] = [(i = k.declarations) != null ? i : "", k.tokens || []], [Vr, Br] = [(c = v.declarations) != null ? c : "", v.tokens || []], [Dr, Mr] = [(s = _.declarations) != null ? s : "", _.tokens || []], [Fr, Ur] = [(u = ae.declarations) != null ? u : "", ae.tokens || []];
    x = this.transformCSS(e, pt, "light", "variable", m, r, o), P = ft;
    let Wr = this.transformCSS(e, `${Er}${jr}`, "light", "variable", m, r, o), Hr = this.transformCSS(e, `${Ir}`, "dark", "variable", m, r, o);
    S = `${Wr}${Hr}`, T = [.../* @__PURE__ */ new Set([...Nr, ...zr, ...Rr])];
    let Kr = this.transformCSS(e, `${Vr}${Dr}color-scheme:light`, "light", "variable", m, r, o), Gr = this.transformCSS(e, `${Fr}color-scheme:dark`, "dark", "variable", m, r, o);
    O = `${Kr}${Gr}`, z = [.../* @__PURE__ */ new Set([...Br, ...Mr, ...Ur])], $ = pe(p.css, { dt: je });
  }
  return { primitive: { css: x, tokens: P }, semantic: { css: S, tokens: T }, global: { css: O, tokens: z }, style: $ };
}, getPreset({ name: e = "", preset: t = {}, options: n, params: r, set: o, defaults: a, selector: l }) {
  var d, i, c;
  let s, u, p;
  if (q(t) && n.transform !== "strict") {
    let m = e.replace("-directive", ""), x = t, { colorScheme: P, extend: S, css: T } = x, O = Pe(x, ["colorScheme", "extend", "css"]), z = S || {}, { colorScheme: $ } = z, y = Pe(z, ["colorScheme"]), F = P || {}, { dark: V } = F, K = Pe(F, ["dark"]), oe = $ || {}, { dark: Y } = oe, ce = Pe(oe, ["dark"]), I = q(O) ? this._toVariables({ [m]: ke(ke({}, O), y) }, n) : {}, w = q(K) ? this._toVariables({ [m]: ke(ke({}, K), ce) }, n) : {}, C = q(V) ? this._toVariables({ [m]: ke(ke({}, V), Y) }, n) : {}, [J, te] = [(d = I.declarations) != null ? d : "", I.tokens || []], [ue, fe] = [(i = w.declarations) != null ? i : "", w.tokens || []], [Oe, he] = [(c = C.declarations) != null ? c : "", C.tokens || []], me = this.transformCSS(m, `${J}${ue}`, "light", "variable", n, o, a, l), se = this.transformCSS(m, Oe, "dark", "variable", n, o, a, l);
    s = `${me}${se}`, u = [.../* @__PURE__ */ new Set([...te, ...fe, ...he])], p = pe(T, { dt: je });
  }
  return { css: s, tokens: u, style: p };
}, getPresetC({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var a;
  let { preset: l, options: d } = t, i = (a = l?.components) == null ? void 0 : a[e];
  return this.getPreset({ name: e, preset: i, options: d, params: n, set: r, defaults: o });
}, getPresetD({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var a, l;
  let d = e.replace("-directive", ""), { preset: i, options: c } = t, s = ((a = i?.components) == null ? void 0 : a[d]) || ((l = i?.directives) == null ? void 0 : l[d]);
  return this.getPreset({ name: d, preset: s, options: c, params: n, set: r, defaults: o });
}, applyDarkColorScheme(e) {
  return !(e.darkModeSelector === "none" || e.darkModeSelector === !1);
}, getColorSchemeOption(e, t) {
  var n;
  return this.applyDarkColorScheme(e) ? this.regex.resolve(e.darkModeSelector === !0 ? t.options.darkModeSelector : (n = e.darkModeSelector) != null ? n : t.options.darkModeSelector) : [];
}, getLayerOrder(e, t = {}, n, r) {
  let { cssLayer: o } = t;
  return o ? `@layer ${pe(o.order || o.name || "primeui", n)}` : "";
}, getCommonStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: o, defaults: a }) {
  let l = this.getCommon({ name: e, theme: t, params: n, set: o, defaults: a }), d = Object.entries(r).reduce((i, [c, s]) => i.push(`${c}="${s}"`) && i, []).join(" ");
  return Object.entries(l || {}).reduce((i, [c, s]) => {
    if (Se(s) && Object.hasOwn(s, "css")) {
      let u = qe(s.css), p = `${c}-variables`;
      i.push(`<style type="text/css" data-primevue-style-id="${p}" ${d}>${u}</style>`);
    }
    return i;
  }, []).join("");
}, getStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: o, defaults: a }) {
  var l;
  let d = { name: e, theme: t, params: n, set: o, defaults: a }, i = (l = e.includes("-directive") ? this.getPresetD(d) : this.getPresetC(d)) == null ? void 0 : l.css, c = Object.entries(r).reduce((s, [u, p]) => s.push(`${u}="${p}"`) && s, []).join(" ");
  return i ? `<style type="text/css" data-primevue-style-id="${e}-variables" ${c}>${qe(i)}</style>` : "";
}, createTokens(e = {}, t, n = "", r = "", o = {}) {
  let a = function(d, i = {}, c = []) {
    if (c.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: d, path: this.path, paths: i, value: void 0 };
    c.push(this.path), i.name = this.path, i.binding || (i.binding = {});
    let s = this.value;
    if (typeof this.value == "string" && Je.test(this.value)) {
      let u = this.value.trim().replace(Je, (p) => {
        var m;
        let x = p.slice(1, -1), P = this.tokens[x];
        if (!P) return console.warn(`Token not found for path: ${x}`), "__UNRESOLVED__";
        let S = P.computed(d, i, c);
        return Array.isArray(S) && S.length === 2 ? `light-dark(${S[0].value},${S[1].value})` : (m = S?.value) != null ? m : "__UNRESOLVED__";
      });
      s = ur.test(u.replace(pr, "0")) ? `calc(${u})` : u;
    }
    return Ie(i.binding) && delete i.binding, c.pop(), { colorScheme: d, path: this.path, paths: i, value: s.includes("__UNRESOLVED__") ? void 0 : s };
  }, l = (d, i, c) => {
    Object.entries(d).forEach(([s, u]) => {
      let p = Ne(s, t.variable.excludedKeyRegex) ? i : i ? `${i}.${gn(s)}` : gn(s), m = c ? `${c}.${s}` : s;
      Se(u) ? l(u, p, m) : (o[p] || (o[p] = { paths: [], computed: (x, P = {}, S = []) => {
        if (o[p].paths.length === 1) return o[p].paths[0].computed(o[p].paths[0].scheme, P.binding, S);
        if (x && x !== "none") for (let T = 0; T < o[p].paths.length; T++) {
          let O = o[p].paths[T];
          if (O.scheme === x) return O.computed(x, P.binding, S);
        }
        return o[p].paths.map((T) => T.computed(T.scheme, P[T.scheme], S));
      } }), o[p].paths.push({ path: m, value: u, scheme: m.includes("colorScheme.light") ? "light" : m.includes("colorScheme.dark") ? "dark" : "none", computed: a, tokens: o }));
    });
  };
  return l(e, n, r), o;
}, getTokenValue(e, t, n) {
  var r;
  let o = ((d) => d.split(".").filter((i) => !Ne(i.toLowerCase(), n.variable.excludedKeyRegex)).join("."))(t), a = t.includes("colorScheme.light") ? "light" : t.includes("colorScheme.dark") ? "dark" : void 0, l = [(r = e[o]) == null ? void 0 : r.computed(a)].flat().filter((d) => d);
  return l.length === 1 ? l[0].value : l.reduce((d = {}, i) => {
    let c = i, { colorScheme: s } = c, u = Pe(c, ["colorScheme"]);
    return d[s] = u, d;
  }, void 0);
}, getSelectorRule(e, t, n, r) {
  return n === "class" || n === "attr" ? Ve(q(t) ? `${e}${t},${e} ${t}` : e, r) : Ve(e, Ve(t ?? ":root,:host", r));
}, transformCSS(e, t, n, r, o = {}, a, l, d) {
  if (q(t)) {
    let { cssLayer: i } = o;
    if (r !== "style") {
      let c = this.getColorSchemeOption(o, l);
      t = n === "dark" ? c.reduce((s, { type: u, selector: p }) => (q(p) && (s += p.includes("[CSS]") ? p.replace("[CSS]", t) : this.getSelectorRule(p, d, u, t)), s), "") : Ve(d ?? ":root,:host", t);
    }
    if (i) {
      let c = { name: "primeui" };
      Se(i) && (c.name = pe(i.name, { name: e, type: r })), q(c.name) && (t = Ve(`@layer ${c.name}`, t), a?.layerNames(c.name));
    }
    return t;
  }
  return "";
} }, G = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(e = {}) {
  let { theme: t } = e;
  t && (this._theme = At(ke({}, t), { options: ke(ke({}, this.defaults.options), t.options) }), this._tokens = ve.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
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
  this.update({ theme: e }), ne.emit("theme:change", e);
}, getPreset() {
  return this.preset;
}, setPreset(e) {
  this._theme = At(ke({}, this.theme), { preset: e }), this._tokens = ve.createTokens(e, this.defaults), this.clearLoadedStyleNames(), ne.emit("preset:change", e), ne.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(e) {
  this._theme = At(ke({}, this.theme), { options: e }), this.clearLoadedStyleNames(), ne.emit("options:change", e), ne.emit("theme:change", this.theme);
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
  this._loadingStyles.size && (this._loadingStyles.delete(t), ne.emit(`theme:${t}:load`, e), !this._loadingStyles.size && ne.emit("theme:load"));
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
}, fa = `
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
function Xe(e) {
  "@babel/helpers - typeof";
  return Xe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Xe(e);
}
function yn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function kn(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? yn(Object(n), !0).forEach(function(r) {
      ma(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : yn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function ma(e, t, n) {
  return (t = ba(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ba(e) {
  var t = ha(e, "string");
  return Xe(t) == "symbol" ? t : t + "";
}
function ha(e, t) {
  if (Xe(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Xe(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function va(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  Nt() && Nt().components ? Yt(e) : t ? e() : Zt(e);
}
var ga = 0;
function ya(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = D(!1), r = D(e), o = D(null), a = lr() ? window.document : void 0, l = t.document, d = l === void 0 ? a : l, i = t.immediate, c = i === void 0 ? !0 : i, s = t.manual, u = s === void 0 ? !1 : s, p = t.name, m = p === void 0 ? "style_".concat(++ga) : p, x = t.id, P = x === void 0 ? void 0 : x, S = t.media, T = S === void 0 ? void 0 : S, O = t.nonce, z = O === void 0 ? void 0 : O, $ = t.first, y = $ === void 0 ? !1 : $, F = t.onMounted, V = F === void 0 ? void 0 : F, K = t.onUpdated, oe = K === void 0 ? void 0 : K, Y = t.onLoad, ce = Y === void 0 ? void 0 : Y, I = t.props, w = I === void 0 ? {} : I, C = function() {
  }, J = function(fe) {
    var Oe = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (d) {
      var he = kn(kn({}, w), Oe), me = he.name || m, se = he.id || P, k = he.nonce || z;
      o.value = d.querySelector('style[data-primevue-style-id="'.concat(me, '"]')) || d.getElementById(se) || d.createElement("style"), o.value.isConnected || (r.value = fe || e, kt(o.value, {
        type: "text/css",
        id: se,
        media: T,
        nonce: k
      }), y ? d.head.prepend(o.value) : d.head.appendChild(o.value), ta(o.value, "data-primevue-style-id", me), kt(o.value, he), o.value.onload = function(v) {
        return ce?.(v, {
          name: me
        });
      }, V?.(me)), !n.value && (C = Te(r, function(v) {
        o.value.textContent = v, oe?.(me);
      }, {
        immediate: !0
      }), n.value = !0);
    }
  }, te = function() {
    !d || !n.value || (C(), Jo(o.value) && d.head.removeChild(o.value), n.value = !1, o.value = null);
  };
  return c && !u && va(J), {
    id: P,
    name: m,
    el: o,
    css: r,
    unload: te,
    load: J,
    isLoaded: Jr(n)
  };
}
function et(e) {
  "@babel/helpers - typeof";
  return et = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, et(e);
}
var xn, wn, $n, Sn;
function _n(e, t) {
  return $a(e) || wa(e, t) || xa(e, t) || ka();
}
function ka() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function xa(e, t) {
  if (e) {
    if (typeof e == "string") return Cn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Cn(e, t) : void 0;
  }
}
function Cn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function wa(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, o, a, l, d = [], i = !0, c = !1;
    try {
      if (a = (n = n.call(e)).next, t !== 0) for (; !(i = (r = a.call(n)).done) && (d.push(r.value), d.length !== t); i = !0) ;
    } catch (s) {
      c = !0, o = s;
    } finally {
      try {
        if (!i && n.return != null && (l = n.return(), Object(l) !== l)) return;
      } finally {
        if (c) throw o;
      }
    }
    return d;
  }
}
function $a(e) {
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
function Lt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Pn(Object(n), !0).forEach(function(r) {
      Sa(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Pn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Sa(e, t, n) {
  return (t = _a(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function _a(e) {
  var t = Ca(e, "string");
  return et(t) == "symbol" ? t : t + "";
}
function Ca(e, t) {
  if (et(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (et(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function vt(e, t) {
  return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var Pa = function(t) {
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
}, Ta = {}, Oa = {}, H = {
  name: "base",
  css: Pa,
  style: fa,
  classes: Ta,
  inlineStyles: Oa,
  load: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(a) {
      return a;
    }, o = r(ht(xn || (xn = vt(["", ""])), t));
    return q(o) ? ya(qe(o), Lt({
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
      return G.transformCSS(n.name || t.name, "".concat(o).concat(ht(wn || (wn = vt(["", ""])), r)));
    });
  },
  getCommonTheme: function(t) {
    return G.getCommon(this.name, t);
  },
  getComponentTheme: function(t) {
    return G.getComponent(this.name, t);
  },
  getDirectiveTheme: function(t) {
    return G.getDirective(this.name, t);
  },
  getPresetTheme: function(t, n, r) {
    return G.getCustomPreset(this.name, t, n, r);
  },
  getLayerOrderThemeCSS: function() {
    return G.getLayerOrderCSS(this.name);
  },
  getStyleSheet: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.css) {
      var r = pe(this.css, {
        dt: je
      }) || "", o = qe(ht($n || ($n = vt(["", "", ""])), r, t)), a = Object.entries(n).reduce(function(l, d) {
        var i = _n(d, 2), c = i[0], s = i[1];
        return l.push("".concat(c, '="').concat(s, '"')) && l;
      }, []).join(" ");
      return q(o) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(a, ">").concat(o, "</style>") : "";
    }
    return "";
  },
  getCommonThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return G.getCommonStyleSheet(this.name, t, n);
  },
  getThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = [G.getStyleSheet(this.name, t, n)];
    if (this.style) {
      var o = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), a = ht(Sn || (Sn = vt(["", ""])), pe(this.style, {
        dt: je
      })), l = qe(G.transformCSS(o, a)), d = Object.entries(n).reduce(function(i, c) {
        var s = _n(c, 2), u = s[0], p = s[1];
        return i.push("".concat(u, '="').concat(p, '"')) && i;
      }, []).join(" ");
      q(l) && r.push('<style type="text/css" data-primevue-style-id="'.concat(o, '" ').concat(d, ">").concat(l, "</style>"));
    }
    return r.join("");
  },
  extend: function(t) {
    return Lt(Lt({}, this), {}, {
      css: void 0,
      style: void 0
    }, t);
  }
}, Ee = ar();
function tt(e) {
  "@babel/helpers - typeof";
  return tt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, tt(e);
}
function Tn(e, t) {
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
    t % 2 ? Tn(Object(n), !0).forEach(function(r) {
      Aa(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Tn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Aa(e, t, n) {
  return (t = La(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function La(e) {
  var t = Ea(e, "string");
  return tt(t) == "symbol" ? t : t + "";
}
function Ea(e, t) {
  if (tt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (tt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Na = {
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
}, ja = Symbol();
function za(e, t) {
  var n = {
    config: Xr(t)
  };
  return e.config.globalProperties.$primevue = n, e.provide(ja, n), Ia(), Ra(e, n), n;
}
var Be = [];
function Ia() {
  ne.clear(), Be.forEach(function(e) {
    return e?.();
  }), Be = [];
}
function Ra(e, t) {
  var n = D(!1), r = function() {
    var c;
    if (((c = t.config) === null || c === void 0 ? void 0 : c.theme) !== "none" && !G.isStyleNameLoaded("common")) {
      var s, u, p = ((s = H.getCommonTheme) === null || s === void 0 ? void 0 : s.call(H)) || {}, m = p.primitive, x = p.semantic, P = p.global, S = p.style, T = {
        nonce: (u = t.config) === null || u === void 0 || (u = u.csp) === null || u === void 0 ? void 0 : u.nonce
      };
      H.load(m?.css, gt({
        name: "primitive-variables"
      }, T)), H.load(x?.css, gt({
        name: "semantic-variables"
      }, T)), H.load(P?.css, gt({
        name: "global-variables"
      }, T)), H.loadStyle(gt({
        name: "global-style"
      }, T), S), G.setLoadedStyleName("common");
    }
  };
  ne.on("theme:change", function(i) {
    n.value || (e.config.globalProperties.$primevue.config.theme = i, n.value = !0);
  });
  var o = Te(t.config, function(i, c) {
    Ee.emit("config:change", {
      newValue: i,
      oldValue: c
    });
  }, {
    immediate: !0,
    deep: !0
  }), a = Te(function() {
    return t.config.ripple;
  }, function(i, c) {
    Ee.emit("config:ripple:change", {
      newValue: i,
      oldValue: c
    });
  }, {
    immediate: !0,
    deep: !0
  }), l = Te(function() {
    return t.config.theme;
  }, function(i, c) {
    n.value || G.setTheme(i), t.config.unstyled || r(), n.value = !1, Ee.emit("config:theme:change", {
      newValue: i,
      oldValue: c
    });
  }, {
    immediate: !0,
    deep: !1
  }), d = Te(function() {
    return t.config.unstyled;
  }, function(i, c) {
    !i && t.config.theme && r(), Ee.emit("config:unstyled:change", {
      newValue: i,
      oldValue: c
    });
  }, {
    immediate: !0,
    deep: !0
  });
  Be.push(o), Be.push(a), Be.push(l), Be.push(d);
}
var Va = {
  install: function(t, n) {
    var r = Go(Na, n);
    za(t, r);
  }
}, hr = {
  data: function() {
    return {
      mounted: !1
    };
  },
  mounted: function() {
    this.mounted = lr();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function Ba(e, t, n, r, o, a) {
  return a.inline ? Q(e.$slots, "default", {
    key: 0
  }) : o.mounted ? (f(), j(Gn, {
    key: 1,
    to: n.appendTo
  }, [Q(e.$slots, "default")], 8, ["to"])) : A("", !0);
}
hr.render = Ba;
var Ae = {
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
function Da() {
  var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pc", t = qn();
  return "".concat(e).concat(t.replace("v-", "").replaceAll("-", "_"));
}
var On = H.extend({
  name: "common"
});
function nt(e) {
  "@babel/helpers - typeof";
  return nt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, nt(e);
}
function Ma(e) {
  return yr(e) || Fa(e) || gr(e) || vr();
}
function Fa(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Ue(e, t) {
  return yr(e) || Ua(e, t) || gr(e, t) || vr();
}
function vr() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function gr(e, t) {
  if (e) {
    if (typeof e == "string") return Vt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Vt(e, t) : void 0;
  }
}
function Vt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Ua(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, o, a, l, d = [], i = !0, c = !1;
    try {
      if (a = (n = n.call(e)).next, t === 0) {
        if (Object(n) !== n) return;
        i = !1;
      } else for (; !(i = (r = a.call(n)).done) && (d.push(r.value), d.length !== t); i = !0) ;
    } catch (s) {
      c = !0, o = s;
    } finally {
      try {
        if (!i && n.return != null && (l = n.return(), Object(l) !== l)) return;
      } finally {
        if (c) throw o;
      }
    }
    return d;
  }
}
function yr(e) {
  if (Array.isArray(e)) return e;
}
function An(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function M(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? An(Object(n), !0).forEach(function(r) {
      Ge(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : An(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Ge(e, t, n) {
  return (t = Wa(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Wa(e) {
  var t = Ha(e, "string");
  return nt(t) == "symbol" ? t : t + "";
}
function Ha(e, t) {
  if (nt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (nt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Ce = {
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
        ne.off("theme:change", this._loadCoreStyles), t || (this._loadCoreStyles(), this._themeChangeListener(this._loadCoreStyles));
      }
    },
    dt: {
      immediate: !0,
      handler: function(t, n) {
        var r = this;
        ne.off("theme:change", this._themeScopedListener), t ? (this._loadScopedThemeStyles(t), this._themeScopedListener = function() {
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
    var t, n, r, o, a, l, d, i, c, s, u, p = (t = this.pt) === null || t === void 0 ? void 0 : t._usept, m = p ? (n = this.pt) === null || n === void 0 || (n = n.originalValue) === null || n === void 0 ? void 0 : n[this.$.type.name] : void 0, x = p ? (r = this.pt) === null || r === void 0 || (r = r.value) === null || r === void 0 ? void 0 : r[this.$.type.name] : this.pt;
    (o = x || m) === null || o === void 0 || (o = o.hooks) === null || o === void 0 || (a = o.onBeforeCreate) === null || a === void 0 || a.call(o);
    var P = (l = this.$primevueConfig) === null || l === void 0 || (l = l.pt) === null || l === void 0 ? void 0 : l._usept, S = P ? (d = this.$primevue) === null || d === void 0 || (d = d.config) === null || d === void 0 || (d = d.pt) === null || d === void 0 ? void 0 : d.originalValue : void 0, T = P ? (i = this.$primevue) === null || i === void 0 || (i = i.config) === null || i === void 0 || (i = i.pt) === null || i === void 0 ? void 0 : i.value : (c = this.$primevue) === null || c === void 0 || (c = c.config) === null || c === void 0 ? void 0 : c.pt;
    (s = T || S) === null || s === void 0 || (s = s[this.$.type.name]) === null || s === void 0 || (s = s.hooks) === null || s === void 0 || (u = s.onBeforeCreate) === null || u === void 0 || u.call(s), this.$attrSelector = Da(), this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
  },
  created: function() {
    this._hook("onCreated");
  },
  beforeMount: function() {
    var t;
    this.rootEl = Qe(ut(this.$el) ? this.$el : (t = this.$el) === null || t === void 0 ? void 0 : t.parentElement, "[".concat(this.$attrSelector, "]")), this.rootEl && (this.rootEl.$pc = M({
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
      return Xt(t) ? t.apply(void 0, r) : E.apply(void 0, r);
    },
    _load: function() {
      Ae.isStyleNameLoaded("base") || (H.loadCSS(this.$styleOptions), this._loadGlobalStyles(), Ae.setLoadedStyleName("base")), this._loadThemeStyles();
    },
    _loadStyles: function() {
      this._load(), this._themeChangeListener(this._load);
    },
    _loadCoreStyles: function() {
      var t, n;
      !Ae.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name && (On.loadCSS(this.$styleOptions), this.$options.style && this.$style.loadCSS(this.$styleOptions), Ae.setLoadedStyleName(this.$style.name));
    },
    _loadGlobalStyles: function() {
      var t = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
      q(t) && H.load(t, M({
        name: "global"
      }, this.$styleOptions));
    },
    _loadThemeStyles: function() {
      var t, n;
      if (!(this.isUnstyled || this.$theme === "none")) {
        if (!G.isStyleNameLoaded("common")) {
          var r, o, a = ((r = this.$style) === null || r === void 0 || (o = r.getCommonTheme) === null || o === void 0 ? void 0 : o.call(r)) || {}, l = a.primitive, d = a.semantic, i = a.global, c = a.style;
          H.load(l?.css, M({
            name: "primitive-variables"
          }, this.$styleOptions)), H.load(d?.css, M({
            name: "semantic-variables"
          }, this.$styleOptions)), H.load(i?.css, M({
            name: "global-variables"
          }, this.$styleOptions)), H.loadStyle(M({
            name: "global-style"
          }, this.$styleOptions), c), G.setLoadedStyleName("common");
        }
        if (!G.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name) {
          var s, u, p, m, x = ((s = this.$style) === null || s === void 0 || (u = s.getComponentTheme) === null || u === void 0 ? void 0 : u.call(s)) || {}, P = x.css, S = x.style;
          (p = this.$style) === null || p === void 0 || p.load(P, M({
            name: "".concat(this.$style.name, "-variables")
          }, this.$styleOptions)), (m = this.$style) === null || m === void 0 || m.loadStyle(M({
            name: "".concat(this.$style.name, "-style")
          }, this.$styleOptions), S), G.setLoadedStyleName(this.$style.name);
        }
        if (!G.isStyleNameLoaded("layer-order")) {
          var T, O, z = (T = this.$style) === null || T === void 0 || (O = T.getLayerOrderThemeCSS) === null || O === void 0 ? void 0 : O.call(T);
          H.load(z, M({
            name: "layer-order",
            first: !0
          }, this.$styleOptions)), G.setLoadedStyleName("layer-order");
        }
      }
    },
    _loadScopedThemeStyles: function(t) {
      var n, r, o, a = ((n = this.$style) === null || n === void 0 || (r = n.getPresetTheme) === null || r === void 0 ? void 0 : r.call(n, t, "[".concat(this.$attrSelector, "]"))) || {}, l = a.css, d = (o = this.$style) === null || o === void 0 ? void 0 : o.load(l, M({
        name: "".concat(this.$attrSelector, "-").concat(this.$style.name)
      }, this.$styleOptions));
      this.scopedStyleEl = d.el;
    },
    _unloadScopedThemeStyles: function() {
      var t;
      (t = this.scopedStyleEl) === null || t === void 0 || (t = t.value) === null || t === void 0 || t.remove();
    },
    _themeChangeListener: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
      };
      Ae.clearLoadedStyleNames(), ne.on("theme:change", t);
    },
    _removeThemeListeners: function() {
      ne.off("theme:change", this._loadCoreStyles), ne.off("theme:change", this._load), ne.off("theme:change", this._themeScopedListener);
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
      return en(t, n, r);
    },
    _getPTValue: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, a = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, l = /./g.test(r) && !!o[r.split(".")[0]], d = this._getPropValue("ptOptions") || ((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.ptOptions) || {}, i = d.mergeSections, c = i === void 0 ? !0 : i, s = d.mergeProps, u = s === void 0 ? !1 : s, p = a ? l ? this._useGlobalPT(this._getPTClassValue, r, o) : this._useDefaultPT(this._getPTClassValue, r, o) : void 0, m = l ? void 0 : this._getPTSelf(n, this._getPTClassValue, r, M(M({}, o), {}, {
        global: p || {}
      })), x = this._getPTDatasets(r);
      return c || !c && m ? u ? this._mergeProps(u, p, m, x) : M(M(M({}, p), m), x) : M(M({}, m), x);
    },
    _getPTSelf: function() {
      for (var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), o = 1; o < n; o++)
        r[o - 1] = arguments[o];
      return E(
        this._usePT.apply(this, [this._getPT(t, this.$name)].concat(r)),
        // Exp; <component :pt="{}"
        this._usePT.apply(this, [this.$_attrsPT].concat(r))
        // Exp; <component :pt:[passthrough_key]:[attribute]="{value}" or <component :pt:[passthrough_key]="() =>{value}"
      );
    },
    _getPTDatasets: function() {
      var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", o = "data-pc-", a = r === "root" && q((t = this.pt) === null || t === void 0 ? void 0 : t["data-pc-section"]);
      return r !== "transition" && M(M({}, r === "root" && M(M(Ge({}, "".concat(o, "name"), $e(a ? (n = this.pt) === null || n === void 0 ? void 0 : n["data-pc-section"] : this.$.type.name)), a && Ge({}, "".concat(o, "extend"), $e(this.$.type.name))), {}, Ge({}, "".concat(this.$attrSelector), ""))), {}, Ge({}, "".concat(o, "section"), $e(r)));
    },
    _getPTClassValue: function() {
      var t = this._getOptionValue.apply(this, arguments);
      return de(t) || rr(t) ? {
        class: t
      } : t;
    },
    _getPT: function(t) {
      var n = this, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 ? arguments[2] : void 0, a = function(d) {
        var i, c = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, s = o ? o(d) : d, u = $e(r), p = $e(n.$name);
        return (i = c ? u !== p ? s?.[u] : void 0 : s?.[u]) !== null && i !== void 0 ? i : s;
      };
      return t != null && t.hasOwnProperty("_usept") ? {
        _usept: t._usept,
        originalValue: a(t.originalValue),
        value: a(t.value)
      } : a(t, !0);
    },
    _usePT: function(t, n, r, o) {
      var a = function(P) {
        return n(P, r, o);
      };
      if (t != null && t.hasOwnProperty("_usept")) {
        var l, d = t._usept || ((l = this.$primevueConfig) === null || l === void 0 ? void 0 : l.ptOptions) || {}, i = d.mergeSections, c = i === void 0 ? !0 : i, s = d.mergeProps, u = s === void 0 ? !1 : s, p = a(t.originalValue), m = a(t.value);
        return p === void 0 && m === void 0 ? void 0 : de(m) ? m : de(p) ? p : c || !c && m ? u ? this._mergeProps(u, p, m) : M(M({}, p), m) : m;
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
      return this._getPTValue(this.pt, t, M(M({}, this.$params), n));
    },
    ptmi: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = E(this.$_attrsWithoutPT, this.ptm(n, r));
      return o?.hasOwnProperty("id") && ((t = o.id) !== null && t !== void 0 || (o.id = this.$id)), o;
    },
    ptmo: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return this._getPTValue(t, n, M({
        instance: this
      }, r), !1);
    },
    cx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this.isUnstyled ? void 0 : this._getOptionValue(this.$style.classes, t, M(M({}, this.$params), n));
    },
    sx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      if (n) {
        var o = this._getOptionValue(this.$style.inlineStyles, t, M(M({}, this.$params), r)), a = this._getOptionValue(On.inlineStyles, t, M(M({}, this.$params), r));
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
        return n._getOptionValue(r, n.$name, M({}, n.$params)) || pe(r, M({}, n.$params));
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
        var o = Ue(r, 1), a = o[0];
        return n?.includes(a);
      }));
    },
    $theme: function() {
      var t;
      return (t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.theme;
    },
    $style: function() {
      return M(M({
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
        var n = Ue(t, 1), r = n[0];
        return r?.startsWith("pt:");
      }).reduce(function(t, n) {
        var r = Ue(n, 2), o = r[0], a = r[1], l = o.split(":"), d = Ma(l), i = Vt(d).slice(1);
        return i?.reduce(function(c, s, u, p) {
          return !c[s] && (c[s] = u === p.length - 1 ? a : {}), c[s];
        }, t), t;
      }, {});
    },
    $_attrsWithoutPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(t) {
        var n = Ue(t, 1), r = n[0];
        return !(r != null && r.startsWith("pt:"));
      }).reduce(function(t, n) {
        var r = Ue(n, 2), o = r[0], a = r[1];
        return t[o] = a, t;
      }, {});
    }
  }
}, Ka = `
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
`, Ga = H.extend({
  name: "baseicon",
  css: Ka
});
function rt(e) {
  "@babel/helpers - typeof";
  return rt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, rt(e);
}
function Ln(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function En(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Ln(Object(n), !0).forEach(function(r) {
      qa(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Ln(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function qa(e, t, n) {
  return (t = Ya(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ya(e) {
  var t = Za(e, "string");
  return rt(t) == "symbol" ? t : t + "";
}
function Za(e, t) {
  if (rt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (rt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Pt = {
  name: "BaseIcon",
  extends: Ce,
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
  style: Ga,
  provide: function() {
    return {
      $pcIcon: this,
      $parentInstance: this
    };
  },
  methods: {
    pti: function() {
      var t = Ie(this.label);
      return En(En({}, !this.isUnstyled && {
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
function ot(e) {
  "@babel/helpers - typeof";
  return ot = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ot(e);
}
function Nn(e, t) {
  return ei(e) || Xa(e, t) || Ja(e, t) || Qa();
}
function Qa() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ja(e, t) {
  if (e) {
    if (typeof e == "string") return jn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? jn(e, t) : void 0;
  }
}
function jn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Xa(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, o, a, l, d = [], i = !0, c = !1;
    try {
      if (a = (n = n.call(e)).next, t !== 0) for (; !(i = (r = a.call(n)).done) && (d.push(r.value), d.length !== t); i = !0) ;
    } catch (s) {
      c = !0, o = s;
    } finally {
      try {
        if (!i && n.return != null && (l = n.return(), Object(l) !== l)) return;
      } finally {
        if (c) throw o;
      }
    }
    return d;
  }
}
function ei(e) {
  if (Array.isArray(e)) return e;
}
function zn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function U(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? zn(Object(n), !0).forEach(function(r) {
      Bt(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : zn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Bt(e, t, n) {
  return (t = ti(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ti(e) {
  var t = ni(e, "string");
  return ot(t) == "symbol" ? t : t + "";
}
function ni(e, t) {
  if (ot(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ot(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var R = {
  _getMeta: function() {
    return [Se(arguments.length <= 0 ? void 0 : arguments[0]) || arguments.length <= 0 ? void 0 : arguments[0], pe(Se(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getConfig: function(t, n) {
    var r, o, a;
    return (r = (t == null || (o = t.instance) === null || o === void 0 ? void 0 : o.$primevue) || (n == null || (a = n.ctx) === null || a === void 0 || (a = a.appContext) === null || a === void 0 || (a = a.config) === null || a === void 0 || (a = a.globalProperties) === null || a === void 0 ? void 0 : a.$primevue)) === null || r === void 0 ? void 0 : r.config;
  },
  _getOptionValue: en,
  _getPTValue: function() {
    var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", l = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, d = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, i = function() {
      var O = R._getOptionValue.apply(R, arguments);
      return de(O) || rr(O) ? {
        class: O
      } : O;
    }, c = ((t = r.binding) === null || t === void 0 || (t = t.value) === null || t === void 0 ? void 0 : t.ptOptions) || ((n = r.$primevueConfig) === null || n === void 0 ? void 0 : n.ptOptions) || {}, s = c.mergeSections, u = s === void 0 ? !0 : s, p = c.mergeProps, m = p === void 0 ? !1 : p, x = d ? R._useDefaultPT(r, r.defaultPT(), i, a, l) : void 0, P = R._usePT(r, R._getPT(o, r.$name), i, a, U(U({}, l), {}, {
      global: x || {}
    })), S = R._getPTDatasets(r, a);
    return u || !u && P ? m ? R._mergeProps(r, m, x, P, S) : U(U(U({}, x), P), S) : U(U({}, P), S);
  },
  _getPTDatasets: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = "data-pc-";
    return U(U({}, n === "root" && Bt({}, "".concat(r, "name"), $e(t.$name))), {}, Bt({}, "".concat(r, "section"), $e(n)));
  },
  _getPT: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 ? arguments[2] : void 0, o = function(l) {
      var d, i = r ? r(l) : l, c = $e(n);
      return (d = i?.[c]) !== null && d !== void 0 ? d : i;
    };
    return t && Object.hasOwn(t, "_usept") ? {
      _usept: t._usept,
      originalValue: o(t.originalValue),
      value: o(t.value)
    } : o(t);
  },
  _usePT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = arguments.length > 2 ? arguments[2] : void 0, o = arguments.length > 3 ? arguments[3] : void 0, a = arguments.length > 4 ? arguments[4] : void 0, l = function(S) {
      return r(S, o, a);
    };
    if (n && Object.hasOwn(n, "_usept")) {
      var d, i = n._usept || ((d = t.$primevueConfig) === null || d === void 0 ? void 0 : d.ptOptions) || {}, c = i.mergeSections, s = c === void 0 ? !0 : c, u = i.mergeProps, p = u === void 0 ? !1 : u, m = l(n.originalValue), x = l(n.value);
      return m === void 0 && x === void 0 ? void 0 : de(x) ? x : de(m) ? m : s || !s && x ? p ? R._mergeProps(t, p, m, x) : U(U({}, m), x) : x;
    }
    return l(n);
  },
  _useDefaultPT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 ? arguments[2] : void 0, o = arguments.length > 3 ? arguments[3] : void 0, a = arguments.length > 4 ? arguments[4] : void 0;
    return R._usePT(t, n, r, o, a);
  },
  _loadStyles: function() {
    var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 ? arguments[1] : void 0, o = arguments.length > 2 ? arguments[2] : void 0, a = R._getConfig(r, o), l = {
      nonce: a == null || (t = a.csp) === null || t === void 0 ? void 0 : t.nonce
    };
    R._loadCoreStyles(n, l), R._loadThemeStyles(n, l), R._loadScopedThemeStyles(n, l), R._removeThemeListeners(n), n.$loadStyles = function() {
      return R._loadThemeStyles(n, l);
    }, R._themeChangeListener(n.$loadStyles);
  },
  _loadCoreStyles: function() {
    var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 ? arguments[1] : void 0;
    if (!Ae.isStyleNameLoaded((t = r.$style) === null || t === void 0 ? void 0 : t.name) && (n = r.$style) !== null && n !== void 0 && n.name) {
      var a;
      H.loadCSS(o), (a = r.$style) === null || a === void 0 || a.loadCSS(o), Ae.setLoadedStyleName(r.$style.name);
    }
  },
  _loadThemeStyles: function() {
    var t, n, r, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, a = arguments.length > 1 ? arguments[1] : void 0;
    if (!(o != null && o.isUnstyled() || (o == null || (t = o.theme) === null || t === void 0 ? void 0 : t.call(o)) === "none")) {
      if (!G.isStyleNameLoaded("common")) {
        var l, d, i = ((l = o.$style) === null || l === void 0 || (d = l.getCommonTheme) === null || d === void 0 ? void 0 : d.call(l)) || {}, c = i.primitive, s = i.semantic, u = i.global, p = i.style;
        H.load(c?.css, U({
          name: "primitive-variables"
        }, a)), H.load(s?.css, U({
          name: "semantic-variables"
        }, a)), H.load(u?.css, U({
          name: "global-variables"
        }, a)), H.loadStyle(U({
          name: "global-style"
        }, a), p), G.setLoadedStyleName("common");
      }
      if (!G.isStyleNameLoaded((n = o.$style) === null || n === void 0 ? void 0 : n.name) && (r = o.$style) !== null && r !== void 0 && r.name) {
        var m, x, P, S, T = ((m = o.$style) === null || m === void 0 || (x = m.getDirectiveTheme) === null || x === void 0 ? void 0 : x.call(m)) || {}, O = T.css, z = T.style;
        (P = o.$style) === null || P === void 0 || P.load(O, U({
          name: "".concat(o.$style.name, "-variables")
        }, a)), (S = o.$style) === null || S === void 0 || S.loadStyle(U({
          name: "".concat(o.$style.name, "-style")
        }, a), z), G.setLoadedStyleName(o.$style.name);
      }
      if (!G.isStyleNameLoaded("layer-order")) {
        var $, y, F = ($ = o.$style) === null || $ === void 0 || (y = $.getLayerOrderThemeCSS) === null || y === void 0 ? void 0 : y.call($);
        H.load(F, U({
          name: "layer-order",
          first: !0
        }, a)), G.setLoadedStyleName("layer-order");
      }
    }
  },
  _loadScopedThemeStyles: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = t.preset();
    if (r && t.$attrSelector) {
      var o, a, l, d = ((o = t.$style) === null || o === void 0 || (a = o.getPresetTheme) === null || a === void 0 ? void 0 : a.call(o, r, "[".concat(t.$attrSelector, "]"))) || {}, i = d.css, c = (l = t.$style) === null || l === void 0 ? void 0 : l.load(i, U({
        name: "".concat(t.$attrSelector, "-").concat(t.$style.name)
      }, n));
      t.scopedStyleEl = c.el;
    }
  },
  _themeChangeListener: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
    };
    Ae.clearLoadedStyleNames(), ne.on("theme:change", t);
  },
  _removeThemeListeners: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    ne.off("theme:change", t.$loadStyles), t.$loadStyles = void 0;
  },
  _hook: function(t, n, r, o, a, l) {
    var d, i, c = "on".concat(qo(n)), s = R._getConfig(o, a), u = r?.$instance, p = R._usePT(u, R._getPT(o == null || (d = o.value) === null || d === void 0 ? void 0 : d.pt, t), R._getOptionValue, "hooks.".concat(c)), m = R._useDefaultPT(u, s == null || (i = s.pt) === null || i === void 0 || (i = i.directives) === null || i === void 0 ? void 0 : i[t], R._getOptionValue, "hooks.".concat(c)), x = {
      el: r,
      binding: o,
      vnode: a,
      prevVnode: l
    };
    p?.(u, x), m?.(u, x);
  },
  /* eslint-disable-next-line no-unused-vars */
  _mergeProps: function() {
    for (var t = arguments.length > 1 ? arguments[1] : void 0, n = arguments.length, r = new Array(n > 2 ? n - 2 : 0), o = 2; o < n; o++)
      r[o - 2] = arguments[o];
    return Xt(t) ? t.apply(void 0, r) : E.apply(void 0, r);
  },
  _extend: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = function(d, i, c, s, u) {
      var p, m, x, P;
      i._$instances = i._$instances || {};
      var S = R._getConfig(c, s), T = i._$instances[t] || {}, O = Ie(T) ? U(U({}, n), n?.methods) : {};
      i._$instances[t] = U(U({}, T), {}, {
        /* new instance variables to pass in directive methods */
        $name: t,
        $host: i,
        $binding: c,
        $modifiers: c?.modifiers,
        $value: c?.value,
        $el: T.$el || i || void 0,
        $style: U({
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
        $attrSelector: (p = i.$pd) === null || p === void 0 || (p = p[t]) === null || p === void 0 ? void 0 : p.attrSelector,
        /* computed instance variables */
        defaultPT: function() {
          return R._getPT(S?.pt, void 0, function($) {
            var y;
            return $ == null || (y = $.directives) === null || y === void 0 ? void 0 : y[t];
          });
        },
        isUnstyled: function() {
          var $, y;
          return (($ = i._$instances[t]) === null || $ === void 0 || ($ = $.$binding) === null || $ === void 0 || ($ = $.value) === null || $ === void 0 ? void 0 : $.unstyled) !== void 0 ? (y = i._$instances[t]) === null || y === void 0 || (y = y.$binding) === null || y === void 0 || (y = y.value) === null || y === void 0 ? void 0 : y.unstyled : S?.unstyled;
        },
        theme: function() {
          var $;
          return ($ = i._$instances[t]) === null || $ === void 0 || ($ = $.$primevueConfig) === null || $ === void 0 ? void 0 : $.theme;
        },
        preset: function() {
          var $;
          return ($ = i._$instances[t]) === null || $ === void 0 || ($ = $.$binding) === null || $ === void 0 || ($ = $.value) === null || $ === void 0 ? void 0 : $.dt;
        },
        /* instance's methods */
        ptm: function() {
          var $, y = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", F = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return R._getPTValue(i._$instances[t], ($ = i._$instances[t]) === null || $ === void 0 || ($ = $.$binding) === null || $ === void 0 || ($ = $.value) === null || $ === void 0 ? void 0 : $.pt, y, U({}, F));
        },
        ptmo: function() {
          var $ = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, y = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", F = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return R._getPTValue(i._$instances[t], $, y, F, !1);
        },
        cx: function() {
          var $, y, F = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", V = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return ($ = i._$instances[t]) !== null && $ !== void 0 && $.isUnstyled() ? void 0 : R._getOptionValue((y = i._$instances[t]) === null || y === void 0 || (y = y.$style) === null || y === void 0 ? void 0 : y.classes, F, U({}, V));
        },
        sx: function() {
          var $, y = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", F = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, V = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return F ? R._getOptionValue(($ = i._$instances[t]) === null || $ === void 0 || ($ = $.$style) === null || $ === void 0 ? void 0 : $.inlineStyles, y, U({}, V)) : void 0;
        }
      }, O), i.$instance = i._$instances[t], (m = (x = i.$instance)[d]) === null || m === void 0 || m.call(x, i, c, s, u), i["$".concat(t)] = i.$instance, R._hook(t, d, i, c, s, u), i.$pd || (i.$pd = {}), i.$pd[t] = U(U({}, (P = i.$pd) === null || P === void 0 ? void 0 : P[t]), {}, {
        name: t,
        instance: i._$instances[t]
      });
    }, o = function(d) {
      var i, c, s, u = d._$instances[t], p = u?.watch, m = function(S) {
        var T, O = S.newValue, z = S.oldValue;
        return p == null || (T = p.config) === null || T === void 0 ? void 0 : T.call(u, O, z);
      }, x = function(S) {
        var T, O = S.newValue, z = S.oldValue;
        return p == null || (T = p["config.ripple"]) === null || T === void 0 ? void 0 : T.call(u, O, z);
      };
      u.$watchersCallback = {
        config: m,
        "config.ripple": x
      }, p == null || (i = p.config) === null || i === void 0 || i.call(u, u?.$primevueConfig), Ee.on("config:change", m), p == null || (c = p["config.ripple"]) === null || c === void 0 || c.call(u, u == null || (s = u.$primevueConfig) === null || s === void 0 ? void 0 : s.ripple), Ee.on("config:ripple:change", x);
    }, a = function(d) {
      var i = d._$instances[t].$watchersCallback;
      i && (Ee.off("config:change", i.config), Ee.off("config:ripple:change", i["config.ripple"]), d._$instances[t].$watchersCallback = void 0);
    };
    return {
      created: function(d, i, c, s) {
        d.$pd || (d.$pd = {}), d.$pd[t] = {
          name: t,
          attrSelector: na("pd")
        }, r("created", d, i, c, s);
      },
      beforeMount: function(d, i, c, s) {
        var u;
        R._loadStyles((u = d.$pd[t]) === null || u === void 0 ? void 0 : u.instance, i, c), r("beforeMount", d, i, c, s), o(d);
      },
      mounted: function(d, i, c, s) {
        var u;
        R._loadStyles((u = d.$pd[t]) === null || u === void 0 ? void 0 : u.instance, i, c), r("mounted", d, i, c, s);
      },
      beforeUpdate: function(d, i, c, s) {
        r("beforeUpdate", d, i, c, s);
      },
      updated: function(d, i, c, s) {
        var u;
        R._loadStyles((u = d.$pd[t]) === null || u === void 0 ? void 0 : u.instance, i, c), r("updated", d, i, c, s);
      },
      beforeUnmount: function(d, i, c, s) {
        var u;
        a(d), R._removeThemeListeners((u = d.$pd[t]) === null || u === void 0 ? void 0 : u.instance), r("beforeUnmount", d, i, c, s);
      },
      unmounted: function(d, i, c, s) {
        var u;
        (u = d.$pd[t]) === null || u === void 0 || (u = u.instance) === null || u === void 0 || (u = u.scopedStyleEl) === null || u === void 0 || (u = u.value) === null || u === void 0 || u.remove(), r("unmounted", d, i, c, s);
      }
    };
  },
  extend: function() {
    var t = R._getMeta.apply(R, arguments), n = Nn(t, 2), r = n[0], o = n[1];
    return U({
      extend: function() {
        var l = R._getMeta.apply(R, arguments), d = Nn(l, 2), i = d[0], c = d[1];
        return R.extend(i, U(U(U({}, o), o?.methods), c));
      }
    }, R._extend(r, o));
  }
}, ri = `
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
`, oi = {
  root: "p-ink"
}, ai = H.extend({
  name: "ripple-directive",
  style: ri,
  classes: oi
}), ii = R.extend({
  style: ai
});
function at(e) {
  "@babel/helpers - typeof";
  return at = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, at(e);
}
function si(e) {
  return ui(e) || ci(e) || di(e) || li();
}
function li() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function di(e, t) {
  if (e) {
    if (typeof e == "string") return Dt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Dt(e, t) : void 0;
  }
}
function ci(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function ui(e) {
  if (Array.isArray(e)) return Dt(e);
}
function Dt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function In(e, t, n) {
  return (t = pi(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function pi(e) {
  var t = fi(e, "string");
  return at(t) == "symbol" ? t : t + "";
}
function fi(e, t) {
  if (at(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (at(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var tn = ii.extend("ripple", {
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
      n || (n = Xo("span", In(In({
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
        if (!this.isUnstyled() && Ot(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "false"), !It(o) && !Ye(o)) {
          var a = Math.max(ir(r), sr(r));
          o.style.height = a + "px", o.style.width = a + "px";
        }
        var l = Ke(r), d = t.pageX - l.left + document.body.scrollTop - Ye(o) / 2, i = t.pageY - l.top + document.body.scrollLeft - It(o) / 2;
        o.style.top = i + "px", o.style.left = d + "px", !this.isUnstyled() && Zo(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "true"), this.timeout = setTimeout(function() {
          o && (!n.isUnstyled() && Ot(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "false"));
        }, 401);
      }
    },
    onAnimationEnd: function(t) {
      this.timeout && clearTimeout(this.timeout), !this.isUnstyled() && Ot(t.currentTarget, "p-ink-active"), t.currentTarget.setAttribute("data-p-ink-active", "false");
    },
    getInk: function(t) {
      return t && t.children ? si(t.children).find(function(n) {
        return He(n, "data-pc-name") === "ripple";
      }) : void 0;
    }
  }
});
const mi = "data-wippy-overlay-layer";
function kr() {
  return typeof window < "u" && typeof window.document < "u";
}
function xr() {
  return kr() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function bi() {
  return xr() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const hi = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let vi = 0;
const wt = /* @__PURE__ */ new WeakMap();
function Rn(e, t) {
  const n = e.style;
  n.setProperty("position", "fixed", "important"), n.setProperty("inset", "auto", "important"), n.setProperty("margin", "0", "important"), n.setProperty("position-anchor", t), n.setProperty("position-area", "bottom span-right"), n.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), n.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), n.setProperty("max-width", "stretch", "important");
}
function gi(e, t) {
  if (!hi.test(e.className))
    return;
  const n = e.style.cssText;
  Rn(e, t), e.getAttribute("popover") !== "manual" && e.setAttribute("popover", "manual");
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
      (o.top !== "auto" || o.left !== "auto" || o.margin !== "0px" || o.getPropertyPriority("top") !== "important" || o.getPropertyPriority("left") !== "important" || o.getPropertyPriority("margin") !== "important" || o.getPropertyPriority("min-width") !== "important" || o.maxWidth !== "stretch" || o.getPropertyPriority("max-width") !== "important") && Rn(e, t);
    });
    r.observe(e, { attributes: !0, attributeFilter: ["style"] }), wt.set(e, r);
  }
}
function nn(e) {
  const t = wt.get(e);
  t && (t.disconnect(), wt.delete(e));
}
function yi(e) {
  const t = e && typeof e.getRootNode == "function" ? e.getRootNode() : null;
  return t instanceof ShadowRoot ? t : null;
}
function Mt(e) {
  e.style.top = "0px", e.style.left = "0px";
  const t = e.getBoundingClientRect();
  e.style.top = `${-window.scrollY - t.top}px`, e.style.left = `${-window.scrollX - t.left}px`;
}
const $t = /* @__PURE__ */ new Set(), rn = /* @__PURE__ */ new WeakMap();
let Vn = !1, Ft = !1;
function ki() {
  Ft = !1;
  for (const e of $t) {
    if (!e.isConnected) {
      for (const t of Array.from(e.children))
        t instanceof HTMLElement && nn(t);
      $t.delete(e), rn.get(e)?.disconnect();
      continue;
    }
    e.childElementCount > 0 && Mt(e);
  }
}
function Bn() {
  Ft || (Ft = !0, requestAnimationFrame(ki));
}
function xi(e) {
  const t = document.createElement("div");
  t.setAttribute(mi, "");
  const n = xr();
  if (t.style.cssText = n ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", n && t.setAttribute("popover", "manual"), e.appendChild(t), n) {
    try {
      t.showPopover();
    } catch {
    }
    t.matches(":popover-open") || (t.removeAttribute("popover"), t.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  Mt(t);
  const r = new MutationObserver((o) => {
    const a = t.__wippyAnchorName;
    for (const l of o) {
      if (a)
        for (const d of Array.from(l.addedNodes))
          d instanceof HTMLElement && gi(d, a);
      for (const d of Array.from(l.removedNodes))
        d instanceof HTMLElement && nn(d);
    }
    t.isConnected && t.childElementCount > 0 && Mt(t);
  });
  return r.observe(t, { childList: !0 }), rn.set(t, r), $t.add(t), Vn || (Vn = !0, window.addEventListener("scroll", Bn, { capture: !0, passive: !0 }), window.addEventListener("resize", Bn, { passive: !0 })), t;
}
function Dn(e) {
  if (!(!e.hostRoot || e.layer) && (e.layer = xi(e.hostRoot), bi())) {
    const t = e.$el ? e.$el.parentElement : null;
    t && (e.anchorName = `--wippy-a-${++vi}`, e.anchorTrigger = t, t.style.setProperty("anchor-name", e.anchorName), e.layer.__wippyAnchorName = e.anchorName);
  }
}
function Mn(e) {
  if (e.anchorTrigger && (e.anchorTrigger.style.removeProperty("anchor-name"), e.anchorTrigger = null), e.anchorName = null, e.layer) {
    for (const t of Array.from(e.layer.children))
      t instanceof HTMLElement && nn(t);
    $t.delete(e.layer), rn.get(e.layer)?.disconnect(), e.layer.remove(), e.layer = null;
  }
}
let Fn = !1;
function wi() {
  if (Fn)
    return;
  Fn = !0;
  const e = hr;
  e.computed = e.computed || {}, e.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, e.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, e.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, e.mounted = function() {
    kr() && (this.hostRoot = yi(this.$el), this.mounted = !0, this.hostRoot && (this.inline || Dn(this), this.$watch("inline", (t) => {
      t ? Mn(this) : Dn(this);
    })));
  }, e.render = function() {
    return this.inline ? Q(this.$slots, "default", { key: 0 }) : this.mounted ? eo(Gn, { key: 1, to: this.resolvedTarget || document.body }, [
      Q(this.$slots, "default")
    ]) : A("", !0);
  }, e.unmounted = function() {
    Mn(this);
  };
}
const $i = {
  install: (e) => {
    wi(), e.use(Va, { theme: "none" });
  }
};
var Si = {
  root: function(t) {
    var n = t.instance, r = t.props;
    return ["p-tab", {
      "p-tab-active": n.active,
      "p-disabled": r.disabled
    }];
  }
}, _i = H.extend({
  name: "tab",
  classes: Si
}), Ci = {
  name: "BaseTab",
  extends: Ce,
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
  style: _i,
  provide: function() {
    return {
      $pcTab: this,
      $parentInstance: this
    };
  }
}, Ut = {
  name: "Tab",
  extends: Ci,
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
      return r ? He(r, "data-p-disabled") || He(r, "data-pc-section") === "activebar" ? this.findNextTab(r) : Qe(r, '[data-pc-name="tab"]') : null;
    },
    findPrevTab: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, r = n ? t : t.previousElementSibling;
      return r ? He(r, "data-p-disabled") || He(r, "data-pc-section") === "activebar" ? this.findPrevTab(r) : Qe(r, '[data-pc-name="tab"]') : null;
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
      ea(n), this.scrollInView(n);
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
      return tr((t = this.$pcTabs) === null || t === void 0 ? void 0 : t.d_value, this.value);
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
      return E(this.asAttrs, this.a11yAttrs, this.ptmi("root", this.ptParams));
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
      return _e({
        active: this.active
      });
    }
  },
  directives: {
    ripple: tn
  }
};
function Pi(e, t, n, r, o, a) {
  var l = Qt("ripple");
  return e.asChild ? Q(e.$slots, "default", {
    key: 1,
    dataP: a.dataP,
    class: be(e.cx("root")),
    active: a.active,
    a11yAttrs: a.a11yAttrs,
    onClick: a.onClick
  }) : Fe((f(), j(ze(e.as), E({
    key: 0,
    class: e.cx("root"),
    "data-p": a.dataP,
    onClick: a.onClick
  }, a.attrs), {
    default: B(function() {
      return [Q(e.$slots, "default")];
    }),
    _: 3
  }, 16, ["class", "data-p", "onClick"])), [[l]]);
}
Ut.render = Pi;
var wr = {
  name: "ChevronLeftIcon",
  extends: Pt
};
function Ti(e) {
  return Ei(e) || Li(e) || Ai(e) || Oi();
}
function Oi() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ai(e, t) {
  if (e) {
    if (typeof e == "string") return Wt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Wt(e, t) : void 0;
  }
}
function Li(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Ei(e) {
  if (Array.isArray(e)) return Wt(e);
}
function Wt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Ni(e, t, n, r, o, a) {
  return f(), g("svg", E({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Ti(t[0] || (t[0] = [b("path", {
    d: "M9.61296 13C9.50997 13.0005 9.40792 12.9804 9.3128 12.9409C9.21767 12.9014 9.13139 12.8433 9.05902 12.7701L3.83313 7.54416C3.68634 7.39718 3.60388 7.19795 3.60388 6.99022C3.60388 6.78249 3.68634 6.58325 3.83313 6.43628L9.05902 1.21039C9.20762 1.07192 9.40416 0.996539 9.60724 1.00012C9.81032 1.00371 10.0041 1.08597 10.1477 1.22959C10.2913 1.37322 10.3736 1.56698 10.3772 1.77005C10.3808 1.97313 10.3054 2.16968 10.1669 2.31827L5.49496 6.99022L10.1669 11.6622C10.3137 11.8091 10.3962 12.0084 10.3962 12.2161C10.3962 12.4238 10.3137 12.6231 10.1669 12.7701C10.0945 12.8433 10.0083 12.9014 9.91313 12.9409C9.81801 12.9804 9.71596 13.0005 9.61296 13Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
wr.render = Ni;
var $r = {
  name: "ChevronRightIcon",
  extends: Pt
};
function ji(e) {
  return Vi(e) || Ri(e) || Ii(e) || zi();
}
function zi() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ii(e, t) {
  if (e) {
    if (typeof e == "string") return Ht(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ht(e, t) : void 0;
  }
}
function Ri(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Vi(e) {
  if (Array.isArray(e)) return Ht(e);
}
function Ht(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Bi(e, t, n, r, o, a) {
  return f(), g("svg", E({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), ji(t[0] || (t[0] = [b("path", {
    d: "M4.38708 13C4.28408 13.0005 4.18203 12.9804 4.08691 12.9409C3.99178 12.9014 3.9055 12.8433 3.83313 12.7701C3.68634 12.6231 3.60388 12.4238 3.60388 12.2161C3.60388 12.0084 3.68634 11.8091 3.83313 11.6622L8.50507 6.99022L3.83313 2.31827C3.69467 2.16968 3.61928 1.97313 3.62287 1.77005C3.62645 1.56698 3.70872 1.37322 3.85234 1.22959C3.99596 1.08597 4.18972 1.00371 4.3928 1.00012C4.59588 0.996539 4.79242 1.07192 4.94102 1.21039L10.1669 6.43628C10.3137 6.58325 10.3962 6.78249 10.3962 6.99022C10.3962 7.19795 10.3137 7.39718 10.1669 7.54416L4.94102 12.7701C4.86865 12.8433 4.78237 12.9014 4.68724 12.9409C4.59212 12.9804 4.49007 13.0005 4.38708 13Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
$r.render = Bi;
var Di = {
  root: "p-tablist",
  content: "p-tablist-content p-tablist-viewport",
  tabList: "p-tablist-tab-list",
  activeBar: "p-tablist-active-bar",
  prevButton: "p-tablist-prev-button p-tablist-nav-button",
  nextButton: "p-tablist-next-button p-tablist-nav-button"
}, Mi = H.extend({
  name: "tablist",
  classes: Di
}), Fi = {
  name: "BaseTabList",
  extends: Ce,
  props: {},
  style: Mi,
  provide: function() {
    return {
      $pcTabList: this,
      $parentInstance: this
    };
  }
}, Sr = {
  name: "TabList",
  extends: Fi,
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
      var t = this.$refs.content, n = this.getVisibleButtonWidths(), r = Ye(t) - n, o = Math.abs(t.scrollLeft), a = r * 0.8, l = o - a, d = Math.max(l, 0);
      t.scrollLeft = hn(t) ? -1 * d : d;
    },
    onNextButtonClick: function() {
      var t = this.$refs.content, n = this.getVisibleButtonWidths(), r = Ye(t) - n, o = Math.abs(t.scrollLeft), a = r * 0.8, l = o + a, d = t.scrollWidth - r, i = Math.min(l, d);
      t.scrollLeft = hn(t) ? -1 * i : i;
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
      var n = this.$refs.content, r = Qe(n, '[data-pc-name="tab"][data-p-active="true"]');
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
        var a = Qe(n, '[data-pc-name="tab"][data-p-active="true"]');
        this.$pcTabs.isVertical() ? (r.style.height = sr(a) + "px", r.style.top = Ke(a).top - Ke(o).top + "px") : (r.style.width = ir(a) + "px", r.style.left = Ke(a).left - Ke(o).left + "px");
      }
    },
    updateButtonState: function() {
      var t = this.$refs, n = t.list, r = t.content, o = r.scrollTop, a = r.scrollWidth, l = r.scrollHeight, d = r.offsetWidth, i = r.offsetHeight, c = Math.abs(r.scrollLeft), s = [Ye(r), It(r)], u = s[0], p = s[1];
      this.$pcTabs.isVertical() ? (this.isPrevButtonEnabled = o !== 0, this.isNextButtonEnabled = n.offsetHeight >= i && parseInt(o) !== l - p) : (this.isPrevButtonEnabled = c !== 0, this.isNextButtonEnabled = n.offsetWidth >= d && parseInt(c) !== a - u);
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
      return _e({
        scrollable: this.$pcTabs.scrollable
      });
    }
  },
  components: {
    ChevronLeftIcon: wr,
    ChevronRightIcon: $r
  },
  directives: {
    ripple: tn
  }
}, Ui = ["data-p"], Wi = ["aria-label", "tabindex"], Hi = ["data-p"], Ki = ["aria-orientation"], Gi = ["aria-label", "tabindex"];
function qi(e, t, n, r, o, a) {
  var l = Qt("ripple");
  return f(), g("div", E({
    ref: "list",
    class: e.cx("root"),
    "data-p": a.dataP
  }, e.ptmi("root")), [a.showNavigators && o.isPrevButtonEnabled ? Fe((f(), g("button", E({
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
  }), [(f(), j(ze(a.templates.previcon || "ChevronLeftIcon"), E({
    "aria-hidden": "true"
  }, e.ptm("prevIcon")), null, 16))], 16, Wi)), [[l]]) : A("", !0), b("div", E({
    ref: "content",
    class: e.cx("content"),
    onScroll: t[1] || (t[1] = function() {
      return a.onScroll && a.onScroll.apply(a, arguments);
    }),
    "data-p": a.dataP
  }, e.ptm("content")), [b("div", E({
    ref: "tabs",
    class: e.cx("tabList"),
    role: "tablist",
    "aria-orientation": a.$pcTabs.orientation || "horizontal"
  }, e.ptm("tabList")), [Q(e.$slots, "default"), b("span", E({
    ref: "inkbar",
    class: e.cx("activeBar"),
    role: "presentation",
    "aria-hidden": "true"
  }, e.ptm("activeBar")), null, 16)], 16, Ki)], 16, Hi), a.showNavigators && o.isNextButtonEnabled ? Fe((f(), g("button", E({
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
  }), [(f(), j(ze(a.templates.nexticon || "ChevronRightIcon"), E({
    "aria-hidden": "true"
  }, e.ptm("nextIcon")), null, 16))], 16, Gi)), [[l]]) : A("", !0)], 16, Ui);
}
Sr.render = qi;
var Yi = `
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
`, Zi = {
  root: function(t) {
    var n = t.props;
    return ["p-tabs p-component", {
      "p-tabs-scrollable": n.scrollable
    }];
  }
}, Qi = H.extend({
  name: "tabs",
  style: Yi,
  classes: Zi
}), Ji = {
  name: "BaseTabs",
  extends: Ce,
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
  style: Qi,
  provide: function() {
    return {
      $pcTabs: this,
      $parentInstance: this
    };
  }
}, _r = {
  name: "Tabs",
  extends: Ji,
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
function Xi(e, t, n, r, o, a) {
  return f(), g("div", E({
    class: e.cx("root")
  }, e.ptmi("root")), [Q(e.$slots, "default")], 16);
}
_r.render = Xi;
const es = { class: "km-shell" }, ts = { class: "km-rail" }, ns = { class: "km-main" }, rs = /* @__PURE__ */ ie({
  __name: "Shell",
  setup(e) {
    return (t, n) => (f(), g("div", es, [
      b("aside", ts, [
        Q(t.$slots, "rail")
      ]),
      b("main", ns, [
        Q(t.$slots, "default")
      ])
    ]));
  }
}), os = { class: "km-railhead" }, as = { class: "km-railhead-title" }, is = { key: 0 }, ss = { class: "km-railhead-acts" }, ls = /* @__PURE__ */ ie({
  __name: "RailHeader",
  props: {
    title: {},
    count: {}
  },
  setup(e) {
    return (t, n) => (f(), g("div", os, [
      b("span", as, [
        W(N(e.title), 1),
        e.count !== void 0 ? (f(), g("b", is, N(e.count), 1)) : A("", !0)
      ]),
      b("div", ss, [
        Q(t.$slots, "actions")
      ])
    ]));
  }
});
var on = {
  name: "SpinnerIcon",
  extends: Pt
};
function ds(e) {
  return fs(e) || ps(e) || us(e) || cs();
}
function cs() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function us(e, t) {
  if (e) {
    if (typeof e == "string") return Kt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Kt(e, t) : void 0;
  }
}
function ps(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function fs(e) {
  if (Array.isArray(e)) return Kt(e);
}
function Kt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function ms(e, t, n, r, o, a) {
  return f(), g("svg", E({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), ds(t[0] || (t[0] = [b("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
on.render = ms;
var bs = `
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
`, hs = {
  root: function(t) {
    var n = t.props, r = t.instance;
    return ["p-badge p-component", {
      "p-badge-circle": q(n.value) && String(n.value).length === 1,
      "p-badge-dot": Ie(n.value) && !r.$slots.default,
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
}, vs = H.extend({
  name: "badge",
  style: bs,
  classes: hs
}), gs = {
  name: "BaseBadge",
  extends: Ce,
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
  style: vs,
  provide: function() {
    return {
      $pcBadge: this,
      $parentInstance: this
    };
  }
};
function it(e) {
  "@babel/helpers - typeof";
  return it = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, it(e);
}
function Un(e, t, n) {
  return (t = ys(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ys(e) {
  var t = ks(e, "string");
  return it(t) == "symbol" ? t : t + "";
}
function ks(e, t) {
  if (it(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (it(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Cr = {
  name: "Badge",
  extends: gs,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return _e(Un(Un({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, xs = ["data-p"];
function ws(e, t, n, r, o, a) {
  return f(), g("span", E({
    class: e.cx("root"),
    "data-p": a.dataP
  }, e.ptmi("root")), [Q(e.$slots, "default", {}, function() {
    return [W(N(e.value), 1)];
  })], 16, xs);
}
Cr.render = ws;
var $s = `
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
function st(e) {
  "@babel/helpers - typeof";
  return st = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, st(e);
}
function we(e, t, n) {
  return (t = Ss(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ss(e) {
  var t = _s(e, "string");
  return st(t) == "symbol" ? t : t + "";
}
function _s(e, t) {
  if (st(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (st(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Cs = {
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
}, Ps = H.extend({
  name: "button",
  style: $s,
  classes: Cs
}), Ts = {
  name: "BaseButton",
  extends: Ce,
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
  style: Ps,
  provide: function() {
    return {
      $pcButton: this,
      $parentInstance: this
    };
  }
};
function lt(e) {
  "@babel/helpers - typeof";
  return lt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, lt(e);
}
function le(e, t, n) {
  return (t = Os(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Os(e) {
  var t = As(e, "string");
  return lt(t) == "symbol" ? t : t + "";
}
function As(e, t) {
  if (lt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (lt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var an = {
  name: "Button",
  extends: Ts,
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
      return E(this.asAttrs, this.a11yAttrs, this.getPTOptions("root"));
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
      return Ie(this.fluid) ? !!this.$pcFluid : this.fluid;
    },
    dataP: function() {
      return _e(le(le(le(le(le(le(le(le(le(le({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
    },
    dataIconP: function() {
      return _e(le(le({}, this.iconPos, this.iconPos), this.size, this.size));
    },
    dataLabelP: function() {
      return _e(le(le({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
    }
  },
  components: {
    SpinnerIcon: on,
    Badge: Cr
  },
  directives: {
    ripple: tn
  }
}, Ls = ["data-p"], Es = ["data-p"];
function Ns(e, t, n, r, o, a) {
  var l = sn("SpinnerIcon"), d = sn("Badge"), i = Qt("ripple");
  return e.asChild ? Q(e.$slots, "default", {
    key: 1,
    class: be(e.cx("root")),
    a11yAttrs: a.a11yAttrs
  }) : Fe((f(), j(ze(e.as), E({
    key: 0,
    class: e.cx("root"),
    "data-p": a.dataP
  }, a.attrs), {
    default: B(function() {
      return [Q(e.$slots, "default", {}, function() {
        return [e.loading ? Q(e.$slots, "loadingicon", E({
          key: 0,
          class: [e.cx("loadingIcon"), e.cx("icon")]
        }, e.ptm("loadingIcon")), function() {
          return [e.loadingIcon ? (f(), g("span", E({
            key: 0,
            class: [e.cx("loadingIcon"), e.cx("icon"), e.loadingIcon]
          }, e.ptm("loadingIcon")), null, 16)) : (f(), j(l, E({
            key: 1,
            class: [e.cx("loadingIcon"), e.cx("icon")],
            spin: ""
          }, e.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : Q(e.$slots, "icon", E({
          key: 1,
          class: [e.cx("icon")]
        }, e.ptm("icon")), function() {
          return [e.icon ? (f(), g("span", E({
            key: 0,
            class: [e.cx("icon"), e.icon, e.iconClass],
            "data-p": a.dataIconP
          }, e.ptm("icon")), null, 16, Ls)) : A("", !0)];
        }), e.label ? (f(), g("span", E({
          key: 2,
          class: e.cx("label")
        }, e.ptm("label"), {
          "data-p": a.dataLabelP
        }), N(e.label), 17, Es)) : A("", !0), e.badge ? (f(), j(d, {
          key: 3,
          value: e.badge,
          class: be(e.badgeClass),
          severity: e.badgeSeverity,
          unstyled: e.unstyled,
          pt: e.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : A("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[i]]);
}
an.render = Ns;
const St = /* @__PURE__ */ ie({
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
    const n = e, r = t, o = Nt(), a = X(
      () => Object.prototype.hasOwnProperty.call(o?.vnode.props ?? {}, "active")
    ), l = X(
      () => n.variant === "danger" ? "danger" : n.variant === "bordered" ? "secondary" : void 0
    ), d = X(
      () => n.size === "sm" ? "small" : n.size === "lg" ? "large" : void 0
    );
    return (i, c) => (f(), j(h(an), {
      type: "button",
      severity: l.value,
      text: e.variant !== "bordered" && !e.active,
      outlined: e.variant === "bordered",
      size: d.value,
      loading: e.spin,
      disabled: e.disabled || e.spin,
      pt: {
        root: {
          "aria-label": e.label,
          "aria-pressed": a.value ? String(e.active) : void 0,
          title: e.label
        }
      },
      onClick: c[0] || (c[0] = (s) => r("click"))
    }, {
      icon: B(() => [
        L(h(ee), {
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])
      ]),
      _: 1
    }, 8, ["severity", "text", "outlined", "size", "loading", "disabled", "pt"]));
  }
}), xe = /* @__PURE__ */ ie({
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
    const n = e, r = t, o = X(
      () => n.variant === "danger" ? "danger" : n.variant === "primary" ? void 0 : "secondary"
    );
    return (a, l) => (f(), j(h(an), {
      type: e.type,
      severity: o.value,
      outlined: e.variant === "ghost",
      loading: e.loading,
      disabled: e.disabled || e.loading,
      size: e.small ? "small" : void 0,
      onClick: l[0] || (l[0] = (d) => r("click"))
    }, {
      default: B(() => [
        e.loading ? (f(), j(h(on), {
          key: 0,
          class: "p-button-loading-icon p-button-icon",
          spin: ""
        })) : A("", !0),
        e.icon && !e.loading ? (f(), j(h(ee), {
          key: 1,
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : A("", !0),
        Q(a.$slots, "default")
      ]),
      _: 3
    }, 8, ["type", "severity", "outlined", "loading", "disabled", "size"]));
  }
}), js = { class: "km-search" }, zs = ["value", "placeholder"], Wn = /* @__PURE__ */ ie({
  __name: "SearchField",
  props: {
    modelValue: {},
    placeholder: {}
  },
  emits: ["update:modelValue"],
  setup(e, { emit: t }) {
    const n = t;
    return (r, o) => (f(), g("div", js, [
      L(h(ee), {
        icon: "tabler:search",
        class: "km-search-ico",
        "aria-hidden": "true"
      }),
      b("input", {
        class: "km-search-input",
        value: e.modelValue,
        placeholder: e.placeholder || "Search",
        onInput: o[0] || (o[0] = (a) => n("update:modelValue", a.target.value))
      }, null, 40, zs),
      e.modelValue ? (f(), g("button", {
        key: 0,
        class: "km-search-clear",
        "aria-label": "Clear search",
        onClick: o[1] || (o[1] = (a) => n("update:modelValue", ""))
      }, [
        L(h(ee), {
          icon: "tabler:x",
          "aria-hidden": "true"
        })
      ])) : A("", !0)
    ]));
  }
}), Is = { class: "km-field" }, Rs = { class: "km-field-label" }, Vs = {
  key: 0,
  class: "km-field-help"
}, De = /* @__PURE__ */ ie({
  __name: "FormField",
  props: {
    label: {},
    help: {}
  },
  setup(e) {
    return (t, n) => (f(), g("label", Is, [
      b("span", Rs, N(e.label), 1),
      Q(t.$slots, "default"),
      e.help ? (f(), g("small", Vs, N(e.help), 1)) : A("", !0)
    ]));
  }
}), Bs = ["type", "value", "placeholder", "readonly", "disabled", "autocomplete", "min", "max", "step"], yt = /* @__PURE__ */ ie({
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
    return (o, a) => (f(), g("input", {
      class: be(["km-input", e.mono && "mono"]),
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
    }, null, 42, Bs));
  }
});
var Ds = `
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
`, Ms = {
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
}, Fs = H.extend({
  name: "tag",
  style: Ds,
  classes: Ms
}), Us = {
  name: "BaseTag",
  extends: Ce,
  props: {
    value: null,
    severity: null,
    rounded: Boolean,
    icon: String
  },
  style: Fs,
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
function Ws(e, t, n) {
  return (t = Hs(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Hs(e) {
  var t = Ks(e, "string");
  return dt(t) == "symbol" ? t : t + "";
}
function Ks(e, t) {
  if (dt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (dt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Pr = {
  name: "Tag",
  extends: Us,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return _e(Ws({
        rounded: this.rounded
      }, this.severity, this.severity));
    }
  }
}, Gs = ["data-p"];
function qs(e, t, n, r, o, a) {
  return f(), g("span", E({
    class: e.cx("root"),
    "data-p": a.dataP
  }, e.ptmi("root")), [e.$slots.icon ? (f(), j(ze(e.$slots.icon), E({
    key: 0,
    class: e.cx("icon")
  }, e.ptm("icon")), null, 16, ["class"])) : e.icon ? (f(), g("span", E({
    key: 1,
    class: [e.cx("icon"), e.icon]
  }, e.ptm("icon")), null, 16)) : A("", !0), e.value != null || e.$slots.default ? Q(e.$slots, "default", {
    key: 2
  }, function() {
    return [b("span", E({
      class: e.cx("label")
    }, e.ptm("label")), N(e.value), 17)];
  }) : A("", !0)], 16, Gs);
}
Pr.render = qs;
const Ys = {
  key: 0,
  class: "km-pill-dot",
  "aria-hidden": "true"
}, _t = /* @__PURE__ */ ie({
  __name: "Pill",
  props: {
    severity: { default: "secondary" },
    dot: { type: Boolean },
    icon: {}
  },
  setup(e) {
    return (t, n) => (f(), j(h(Pr), {
      severity: e.severity || void 0,
      class: "km-pill kx-tag-sm"
    }, {
      default: B(() => [
        e.dot ? (f(), g("span", Ys)) : e.icon ? (f(), j(h(ee), {
          key: 1,
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : A("", !0),
        Q(t.$slots, "default")
      ]),
      _: 3
    }, 8, ["severity"]));
  }
}), Zs = { class: "km-notice-text" }, Ct = /* @__PURE__ */ ie({
  __name: "Notice",
  props: {
    severity: { default: "info" }
  },
  emits: ["dismiss"],
  setup(e, { emit: t }) {
    const n = t, r = (o) => o === "danger" ? "tabler:alert-triangle" : o === "success" ? "tabler:circle-check" : "tabler:info-circle";
    return (o, a) => (f(), g("div", {
      class: be(["km-notice", `is-${e.severity}`]),
      role: "status"
    }, [
      L(h(ee), {
        icon: r(e.severity),
        "aria-hidden": "true"
      }, null, 8, ["icon"]),
      b("span", Zs, [
        Q(o.$slots, "default")
      ]),
      b("button", {
        class: "km-notice-x",
        "aria-label": "Dismiss",
        onClick: a[0] || (a[0] = (l) => n("dismiss"))
      }, [
        L(h(ee), {
          icon: "tabler:x",
          "aria-hidden": "true"
        })
      ])
    ], 2));
  }
});
var Qs = `
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
`, Js = {
  root: "p-progressspinner",
  spin: "p-progressspinner-spin",
  circle: "p-progressspinner-circle"
}, Xs = H.extend({
  name: "progressspinner",
  style: Qs,
  classes: Js
}), el = {
  name: "BaseProgressSpinner",
  extends: Ce,
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
  style: Xs,
  provide: function() {
    return {
      $pcProgressSpinner: this,
      $parentInstance: this
    };
  }
}, Tr = {
  name: "ProgressSpinner",
  extends: el,
  inheritAttrs: !1,
  computed: {
    svgStyle: function() {
      return {
        "animation-duration": this.animationDuration
      };
    }
  }
}, tl = ["fill", "stroke-width"];
function nl(e, t, n, r, o, a) {
  return f(), g("div", E({
    class: e.cx("root"),
    role: "progressbar"
  }, e.ptmi("root")), [(f(), g("svg", E({
    class: e.cx("spin"),
    viewBox: "25 25 50 50",
    style: a.svgStyle
  }, e.ptm("spin")), [b("circle", E({
    class: e.cx("circle"),
    cx: "50",
    cy: "50",
    r: "20",
    fill: e.fill,
    "stroke-width": e.strokeWidth,
    strokeMiterlimit: "10"
  }, e.ptm("circle")), null, 16, tl)], 16))], 16);
}
Tr.render = nl;
const rl = { class: "km-loading" }, ol = { key: 0 }, Or = /* @__PURE__ */ ie({
  __name: "Spinner",
  props: {
    label: {}
  },
  setup(e) {
    return (t, n) => (f(), g("div", rl, [
      L(h(Tr), {
        style: { width: "22px", height: "22px", margin: "0" },
        "aria-label": e.label || "Loading"
      }, null, 8, ["aria-label"]),
      e.label ? (f(), g("span", ol, N(e.label), 1)) : A("", !0)
    ]));
  }
}), al = { class: "km-empty" }, il = { class: "km-empty-title" }, sl = {
  key: 0,
  class: "km-empty-hint"
}, ll = /* @__PURE__ */ ie({
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
    return (r, o) => (f(), g("div", al, [
      L(h(ee), {
        icon: e.icon,
        class: "km-empty-ico",
        "aria-hidden": "true"
      }, null, 8, ["icon"]),
      b("div", il, N(e.title), 1),
      e.hint ? (f(), g("p", sl, N(e.hint), 1)) : A("", !0),
      e.cta ? (f(), j(xe, {
        key: 1,
        icon: e.ctaIcon,
        onClick: o[0] || (o[0] = (a) => n("cta"))
      }, {
        default: B(() => [
          W(N(e.cta), 1)
        ]),
        _: 1
      }, 8, ["icon"])) : A("", !0)
    ]));
  }
});
var Ar = {
  name: "TimesCircleIcon",
  extends: Pt
};
function dl(e) {
  return fl(e) || pl(e) || ul(e) || cl();
}
function cl() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ul(e, t) {
  if (e) {
    if (typeof e == "string") return Gt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Gt(e, t) : void 0;
  }
}
function pl(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function fl(e) {
  if (Array.isArray(e)) return Gt(e);
}
function Gt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function ml(e, t, n, r, o, a) {
  return f(), g("svg", E({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), dl(t[0] || (t[0] = [b("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M7 14C5.61553 14 4.26215 13.5895 3.11101 12.8203C1.95987 12.0511 1.06266 10.9579 0.532846 9.67879C0.00303296 8.3997 -0.13559 6.99224 0.134506 5.63437C0.404603 4.2765 1.07129 3.02922 2.05026 2.05026C3.02922 1.07129 4.2765 0.404603 5.63437 0.134506C6.99224 -0.13559 8.3997 0.00303296 9.67879 0.532846C10.9579 1.06266 12.0511 1.95987 12.8203 3.11101C13.5895 4.26215 14 5.61553 14 7C14 8.85652 13.2625 10.637 11.9497 11.9497C10.637 13.2625 8.85652 14 7 14ZM7 1.16667C5.84628 1.16667 4.71846 1.50879 3.75918 2.14976C2.79989 2.79074 2.05222 3.70178 1.61071 4.76768C1.16919 5.83358 1.05367 7.00647 1.27876 8.13803C1.50384 9.26958 2.05941 10.309 2.87521 11.1248C3.69102 11.9406 4.73042 12.4962 5.86198 12.7212C6.99353 12.9463 8.16642 12.8308 9.23232 12.3893C10.2982 11.9478 11.2093 11.2001 11.8502 10.2408C12.4912 9.28154 12.8333 8.15373 12.8333 7C12.8333 5.45291 12.2188 3.96918 11.1248 2.87521C10.0308 1.78125 8.5471 1.16667 7 1.16667ZM4.66662 9.91668C4.58998 9.91704 4.51404 9.90209 4.44325 9.87271C4.37246 9.84333 4.30826 9.8001 4.2544 9.74557C4.14516 9.6362 4.0838 9.48793 4.0838 9.33335C4.0838 9.17876 4.14516 9.0305 4.2544 8.92113L6.17553 7L4.25443 5.07891C4.15139 4.96832 4.09529 4.82207 4.09796 4.67094C4.10063 4.51982 4.16185 4.37563 4.26872 4.26876C4.3756 4.16188 4.51979 4.10066 4.67091 4.09799C4.82204 4.09532 4.96829 4.15142 5.07887 4.25446L6.99997 6.17556L8.92106 4.25446C9.03164 4.15142 9.1779 4.09532 9.32903 4.09799C9.48015 4.10066 9.62434 4.16188 9.73121 4.26876C9.83809 4.37563 9.89931 4.51982 9.90198 4.67094C9.90464 4.82207 9.84855 4.96832 9.74551 5.07891L7.82441 7L9.74554 8.92113C9.85478 9.0305 9.91614 9.17876 9.91614 9.33335C9.91614 9.48793 9.85478 9.6362 9.74554 9.74557C9.69168 9.8001 9.62748 9.84333 9.55669 9.87271C9.4859 9.90209 9.40996 9.91704 9.33332 9.91668C9.25668 9.91704 9.18073 9.90209 9.10995 9.87271C9.03916 9.84333 8.97495 9.8001 8.9211 9.74557L6.99997 7.82444L5.07884 9.74557C5.02499 9.8001 4.96078 9.84333 4.88999 9.87271C4.81921 9.90209 4.74326 9.91704 4.66662 9.91668Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Ar.render = ml;
var bl = `
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
`, hl = {
  root: "p-chip p-component",
  image: "p-chip-image",
  icon: "p-chip-icon",
  label: "p-chip-label",
  removeIcon: "p-chip-remove-icon"
}, vl = H.extend({
  name: "chip",
  style: bl,
  classes: hl
}), gl = {
  name: "BaseChip",
  extends: Ce,
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
  style: vl,
  provide: function() {
    return {
      $pcChip: this,
      $parentInstance: this
    };
  }
}, Lr = {
  name: "Chip",
  extends: gl,
  inheritAttrs: !1,
  emits: ["remove"],
  data: function() {
    return {
      visible: !0
    };
  },
  methods: {
    onKeydown: function(t) {
      (t.key === "Enter" || t.key === "Backspace") && this.close(t);
    },
    close: function(t) {
      this.visible = !1, this.$emit("remove", t);
    }
  },
  computed: {
    dataP: function() {
      return _e({
        removable: this.removable
      });
    }
  },
  components: {
    TimesCircleIcon: Ar
  }
}, yl = ["aria-label", "data-p"], kl = ["src"];
function xl(e, t, n, r, o, a) {
  return o.visible ? (f(), g("div", E({
    key: 0,
    class: e.cx("root"),
    "aria-label": e.label
  }, e.ptmi("root"), {
    "data-p": a.dataP
  }), [Q(e.$slots, "default", {}, function() {
    return [e.image ? (f(), g("img", E({
      key: 0,
      src: e.image
    }, e.ptm("image"), {
      class: e.cx("image")
    }), null, 16, kl)) : e.$slots.icon ? (f(), j(ze(e.$slots.icon), E({
      key: 1,
      class: e.cx("icon")
    }, e.ptm("icon")), null, 16, ["class"])) : e.icon ? (f(), g("span", E({
      key: 2,
      class: [e.cx("icon"), e.icon]
    }, e.ptm("icon")), null, 16)) : A("", !0), e.label !== null ? (f(), g("div", E({
      key: 3,
      class: e.cx("label")
    }, e.ptm("label")), N(e.label), 17)) : A("", !0)];
  }), e.removable ? Q(e.$slots, "removeicon", {
    key: 0,
    removeCallback: a.close,
    keydownCallback: a.onKeydown
  }, function() {
    return [(f(), j(ze(e.removeIcon ? "span" : "TimesCircleIcon"), E({
      class: [e.cx("removeIcon"), e.removeIcon],
      onClick: a.close,
      onKeydown: a.onKeydown
    }, e.ptm("removeIcon")), null, 16, ["class", "onClick", "onKeydown"]))];
  }) : A("", !0)], 16, yl)) : A("", !0);
}
Lr.render = xl;
var wl = {
  name: "BaseEditableHolder",
  extends: Ce,
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
        var n, r;
        this.formField = ((n = this.$pcForm) === null || n === void 0 || (r = n.register) === null || r === void 0 ? void 0 : r.call(n, t, this.$formControl)) || {};
      }
    },
    $formControl: {
      immediate: !0,
      handler: function(t) {
        var n, r;
        this.formField = ((n = this.$pcForm) === null || n === void 0 || (r = n.register) === null || r === void 0 ? void 0 : r.call(n, this.$formName, t)) || {};
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
      var r, o;
      this.controlled && (this.d_value = t, this.$emit("update:modelValue", t)), this.$emit("value-change", t), (r = (o = this.formField).onChange) === null || r === void 0 || r.call(o, {
        originalEvent: n,
        value: t
      });
    },
    // @todo move to @primeuix/utils
    findNonEmpty: function() {
      for (var t = arguments.length, n = new Array(t), r = 0; r < t; r++)
        n[r] = arguments[r];
      return n.find(q);
    }
  },
  computed: {
    $filled: function() {
      return q(this.d_value);
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
}, $l = {
  name: "BaseInput",
  extends: wl,
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
}, Sl = `
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
`, _l = {
  root: function(t) {
    var n = t.instance, r = t.props;
    return ["p-radiobutton p-component", {
      "p-radiobutton-checked": n.checked,
      "p-disabled": r.disabled,
      "p-invalid": n.$pcRadioButtonGroup ? n.$pcRadioButtonGroup.$invalid : n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-radiobutton-sm p-inputfield-sm": r.size === "small",
      "p-radiobutton-lg p-inputfield-lg": r.size === "large"
    }];
  },
  box: "p-radiobutton-box",
  input: "p-radiobutton-input",
  icon: "p-radiobutton-icon"
}, Cl = H.extend({
  name: "radiobutton",
  style: Sl,
  classes: _l
}), Pl = {
  name: "BaseRadioButton",
  extends: $l,
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
  style: Cl,
  provide: function() {
    return {
      $pcRadioButton: this,
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
function Tl(e, t, n) {
  return (t = Ol(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ol(e) {
  var t = Al(e, "string");
  return ct(t) == "symbol" ? t : t + "";
}
function Al(e, t) {
  if (ct(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ct(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var qt = {
  name: "RadioButton",
  extends: Pl,
  inheritAttrs: !1,
  emits: ["change", "focus", "blur"],
  inject: {
    $pcRadioButtonGroup: {
      default: void 0
    }
  },
  methods: {
    getPTOptions: function(t) {
      var n = t === "root" ? this.ptmi : this.ptm;
      return n(t, {
        context: {
          checked: this.checked,
          disabled: this.disabled
        }
      });
    },
    onChange: function(t) {
      if (!this.disabled && !this.readonly) {
        var n = this.binary ? !this.checked : this.value;
        this.$pcRadioButtonGroup ? this.$pcRadioButtonGroup.writeValue(n, t) : this.writeValue(n, t), this.$emit("change", t);
      }
    },
    onFocus: function(t) {
      this.$emit("focus", t);
    },
    onBlur: function(t) {
      var n, r;
      this.$emit("blur", t), (n = (r = this.formField).onBlur) === null || n === void 0 || n.call(r, t);
    }
  },
  computed: {
    groupName: function() {
      return this.$pcRadioButtonGroup ? this.$pcRadioButtonGroup.groupName : this.$formName;
    },
    checked: function() {
      var t = this.$pcRadioButtonGroup ? this.$pcRadioButtonGroup.d_value : this.d_value;
      return t != null && (this.binary ? !!t : tr(t, this.value));
    },
    dataP: function() {
      return _e(Tl({
        invalid: this.$invalid,
        checked: this.checked,
        disabled: this.disabled,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, Ll = ["data-p-checked", "data-p-disabled", "data-p"], El = ["id", "value", "name", "checked", "tabindex", "disabled", "readonly", "aria-labelledby", "aria-label", "aria-invalid"], Nl = ["data-p"], jl = ["data-p"];
function zl(e, t, n, r, o, a) {
  return f(), g("div", E({
    class: e.cx("root")
  }, a.getPTOptions("root"), {
    "data-p-checked": a.checked,
    "data-p-disabled": e.disabled,
    "data-p": a.dataP
  }), [b("input", E({
    id: e.inputId,
    type: "radio",
    class: [e.cx("input"), e.inputClass],
    style: e.inputStyle,
    value: e.value,
    name: a.groupName,
    checked: a.checked,
    tabindex: e.tabindex,
    disabled: e.disabled,
    readonly: e.readonly,
    "aria-labelledby": e.ariaLabelledby,
    "aria-label": e.ariaLabel,
    "aria-invalid": e.invalid || void 0,
    onFocus: t[0] || (t[0] = function() {
      return a.onFocus && a.onFocus.apply(a, arguments);
    }),
    onBlur: t[1] || (t[1] = function() {
      return a.onBlur && a.onBlur.apply(a, arguments);
    }),
    onChange: t[2] || (t[2] = function() {
      return a.onChange && a.onChange.apply(a, arguments);
    })
  }, a.getPTOptions("input")), null, 16, El), b("div", E({
    class: e.cx("box")
  }, a.getPTOptions("box"), {
    "data-p": a.dataP
  }), [b("div", E({
    class: e.cx("icon")
  }, a.getPTOptions("icon"), {
    "data-p": a.dataP
  }), null, 16, jl)], 16, Nl)], 16, Ll);
}
qt.render = zl;
const Il = { class: "kx-wcmount" }, Rl = {
  key: 0,
  class: "kx-wcmount-fail",
  role: "alert"
}, Vl = /* @__PURE__ */ ie({
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
    const n = e, r = t, o = D(null), a = D(!1);
    let l = null, d = 0;
    const i = /* @__PURE__ */ new Set();
    function c(y) {
      y.composedPath()[0] === l && (y.stopPropagation(), r("change", y.detail));
    }
    function s(y) {
      return y.composedPath()[0] !== l ? !1 : (y.stopPropagation(), !0);
    }
    function u(y) {
      s(y) && r("select", y.detail);
    }
    function p(y) {
      s(y) && r("created", y.detail);
    }
    function m(y) {
      s(y) && r("close", y.detail);
    }
    function x(y) {
      s(y) && r("error", y.detail);
    }
    function P(y) {
      if (typeof y == "string") return y;
      try {
        return JSON.stringify(y ?? {});
      } catch {
        return null;
      }
    }
    function S() {
      if (!l) return;
      const y = P(n.config);
      if (y !== null && l.setAttribute("config", y), n.schema !== void 0 && n.schema !== null) {
        const V = P(n.schema);
        V !== null && l.setAttribute("schema", V);
      }
      if (n.meta !== void 0 && n.meta !== null) {
        const V = P(n.meta);
        V !== null && l.setAttribute("meta", V);
      }
      n.provider && l.setAttribute("provider", n.provider), n.label && l.setAttribute("label", n.label);
      const F = n.attrs || {};
      for (const V of [...i])
        (!(V in F) || F[V] == null) && (l.removeAttribute(V), i.delete(V));
      for (const [V, K] of Object.entries(F)) {
        if (K == null) continue;
        const oe = typeof K == "object" ? P(K) : String(K);
        oe !== null && (l.setAttribute(V, oe), i.add(V));
      }
    }
    function T(y = l) {
      y && (y.removeEventListener("config-changed", c), y.removeEventListener("change", c), y.removeEventListener("select", u), y.removeEventListener("created", p), y.removeEventListener("close", m), y.removeEventListener("error", x), y === l && (l = null), i.clear());
    }
    async function O(y) {
      if (!customElements.get(y))
        try {
          await so(y, { timeoutMs: 8e3 });
        } catch {
        }
    }
    async function z() {
      const y = ++d, F = o.value, V = n.tag;
      if (a.value = !1, !!F && (T(), F.innerHTML = "", !!V))
        try {
          if (await O(V), y !== d || o.value !== F || n.tag !== V) return;
          const K = document.createElement(V);
          K.classList.add("kx-wcmount-surface"), l = K, S(), K.addEventListener("config-changed", c), K.addEventListener("change", c), K.addEventListener("select", u), K.addEventListener("created", p), K.addEventListener("close", m), K.addEventListener("error", x), K.style.display = "block", F.appendChild(K), a.value = !customElements.get(V);
        } catch {
          y === d && (a.value = !0);
        }
    }
    async function $() {
      a.value = !1, await Zt(), await z();
    }
    return Yt(z), Te(() => n.tag, z), Te(() => [n.config, n.schema, n.meta, n.provider, n.label, n.attrs], S, { deep: !0 }), to(() => {
      d += 1, T();
    }), (y, F) => (f(), g("div", Il, [
      a.value ? (f(), g("div", Rl, [
        F[0] || (F[0] = b("span", null, "This setup panel couldn’t load.", -1)),
        b("button", {
          type: "button",
          onClick: $
        }, "Try again")
      ])) : (f(), g("div", {
        key: 1,
        ref_key: "host",
        ref: o
      }, null, 512))
    ]));
  }
}), Bl = (e, t) => {
  const n = e.__vccOpts || e;
  for (const [r, o] of t)
    n[r] = o;
  return n;
}, Et = /* @__PURE__ */ Bl(Vl, [["__scopeId", "data-v-3d6a00f1"]]);
function Ze(e, t) {
  const n = e?.response?.data ?? e?.data;
  return typeof n?.error == "string" && n.error ? n.error : typeof n?.message == "string" && n.message ? n.message : e instanceof Error ? e.message : t;
}
function Dl() {
  const e = D([]), t = D([]), n = D(!0), r = D(!1), o = D("");
  let a = 0;
  async function l() {
    const c = ++a;
    n.value = !0, o.value = "";
    try {
      const [s, u] = await Promise.all([
        Le.get("/api/v1/security/scopes"),
        Le.get("/api/v1/security/policies")
      ]);
      if (c !== a) return;
      e.value = s.data?.scopes ?? [], t.value = u.data?.policies ?? [];
    } catch (s) {
      c === a && (o.value = Ze(s, "failed to load security"));
    } finally {
      c === a && (n.value = !1);
    }
  }
  async function d(c) {
    r.value = !0, o.value = "";
    try {
      return await Le.post("/api/v1/security/scopes", c), await l(), !0;
    } catch (s) {
      return o.value = Ze(s, "failed to save scope"), !1;
    } finally {
      r.value = !1;
    }
  }
  async function i(c) {
    r.value = !0, o.value = "";
    try {
      return await Le.delete(`/api/v1/security/scopes?slug=${encodeURIComponent(c)}`), await l(), !0;
    } catch (s) {
      return o.value = Ze(s, "failed to delete scope"), !1;
    } finally {
      r.value = !1;
    }
  }
  return { scopes: e, policies: t, loading: n, saving: r, error: o, load: l, saveScope: d, deleteScope: i };
}
function Ml() {
  const e = D([]), t = D(!1), n = D(!1), r = D(""), o = D(""), a = D(null);
  let l = 0;
  async function d() {
    const s = ++l;
    t.value = !0, r.value = "";
    try {
      const { data: u } = await Le.get("/api/v1/security/delegations");
      if (u?.success !== !0 || !Array.isArray(u.delegations))
        throw new Error(u?.error || "Delegation inventory is unconfirmed");
      s === l && (e.value = u.delegations);
    } catch (u) {
      s === l && (r.value = Ze(u, "Could not load run-as permissions"));
    } finally {
      s === l && (t.value = !1);
    }
  }
  async function i() {
    if (!a.value || n.value) return;
    const s = a.value;
    n.value = !0, r.value = "", o.value = "";
    try {
      const { data: u } = s.method === "save" ? await Le.post("/api/v1/security/delegations", s.request) : await Le.delete("/api/v1/security/delegations", { data: s.request });
      if (u?.success !== !0) throw new Error(u?.error || "Run-as request is unconfirmed");
      a.value = null, o.value = s.method === "save" ? "Run-as permission saved" : "Run-as permission revoked", await d();
    } catch (u) {
      r.value = Ze(u, "Could not confirm run-as request");
      const p = u?.response?.status;
      p && p >= 400 && p < 500 && (a.value = null);
    } finally {
      n.value = !1;
    }
  }
  async function c(s, u) {
    a.value || n.value || (a.value = { method: s, request: {
      ...u,
      principal: { ...u.principal },
      ...u.groups ? { groups: [...u.groups].sort() } : {}
    } }, await i());
  }
  return { delegations: e, loading: t, saving: n, error: r, confirmation: o, pending: a, load: d, mutate: c, submit: i };
}
const Fl = {
  class: "ks-runas",
  "aria-label": "Run-as permissions"
}, Ul = { class: "ks-runas-head" }, Wl = { class: "ks-runas-acts" }, Hl = {
  key: 0,
  role: "alert"
}, Kl = { class: "ks-runas-form-head" }, Gl = ["disabled", "inert"], ql = { class: "ks-runas-steps" }, Yl = {
  key: 0,
  class: "ks-runas-chips",
  "aria-label": "Selected groups"
}, Zl = { class: "ks-runas-component-options" }, Ql = ["for"], Jl = ["for"], Xl = { class: "ks-runas-form-foot" }, ed = {
  key: 3,
  class: "ks-runas-pending"
}, td = {
  key: 5,
  class: "ks-runas-list"
}, nd = { class: "ks-runas-grant-body" }, rd = { class: "ks-runas-grant-line" }, od = {
  key: 0,
  class: "ks-runas-who"
}, ad = { class: "ks-runas-verb" }, id = { class: "ks-runas-who" }, sd = { class: "ks-runas-grant-meta" }, ld = { key: 0 }, dd = { key: 1 }, cd = { key: 2 }, ud = {
  key: 6,
  class: "ks-runas-empty"
}, pd = /* @__PURE__ */ ie({
  __name: "Delegations",
  props: {
    scopes: {}
  },
  setup(e, { expose: t }) {
    const n = e, r = Ml(), { delegations: o, loading: a, saving: l, error: d, confirmation: i, pending: c } = r, s = D(!1), u = D(""), p = D(""), m = D(!0), x = qn(), P = D([]), S = X(() => l.value || !!c.value), T = X(() => !!u.value && P.value.length > 0 && (m.value || !!p.value)), O = X(() => {
      const I = {};
      for (const w of n.scopes) I[w.id] = w.label || w.id;
      return I;
    }), z = D({});
    Te(o, async (I) => {
      const w = [...new Set(I.map((C) => C.principal.id))].filter((C) => !z.value[C]);
      if (w.length)
        try {
          const { data: C } = await Le.post("/api/v1/principals/resolve", { refs: w.map((te) => ({ type: "user", id: te })) }), J = { ...z.value };
          for (const te of Array.isArray(C?.principals) ? C.principals : [])
            te && typeof te.id == "string" && typeof te.label == "string" && (J[te.id] = te.label);
          z.value = J;
        } catch (C) {
          d.value = C && typeof C == "object" && "message" in C ? String(C.message) : "Could not resolve account names";
        }
    });
    const $ = X(() => o.value.filter((I) => I.active)), y = X(() => o.value.filter((I) => !I.active));
    function F(I, w) {
      if (!I || typeof I != "object") return;
      const C = I;
      S.value || C.type !== w || typeof C.id != "string" || (w === "user" ? u.value = C.id : C.id && !P.value.some((J) => J.id === C.id) && P.value.push({ id: C.id, label: typeof C.label == "string" ? C.label : C.id }));
    }
    function V(I) {
      const w = I && typeof I == "object" ? I.thread_id : void 0;
      !S.value && typeof w == "string" && (p.value = w);
    }
    function K(I) {
      d.value = I && typeof I == "object" && "message" in I ? String(I.message) : "Could not load the picker";
    }
    function oe() {
      u.value = "", p.value = "", m.value = !0, P.value = [], s.value = !0;
    }
    async function Y() {
      T.value && (await r.mutate("save", {
        principal: { kind: "user", id: u.value },
        root: m.value ? "*" : p.value,
        groups: P.value.map((I) => I.id)
      }), !d.value && !c.value && (s.value = !1));
    }
    async function ce(I) {
      await Jt.confirm({
        header: "Revoke run-as permission?",
        message: `Members of ${I.groups.map((C) => O.value[C] || C).join(", ")} can no longer choose ${z.value[I.principal.id] || I.principal.id} in the Run as setting.`,
        icon: "tabler:user-off",
        acceptLabel: "Revoke",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      }) && await r.mutate("revoke", { principal: I.principal, root: I.root });
    }
    return t({ load: r.load }), (I, w) => (f(), g("section", Fl, [
      b("header", Ul, [
        w[9] || (w[9] = b("div", null, [
          b("h2", { class: "ks-runas-title" }, "Run-as permissions"),
          b("p", { class: "ks-runas-lede" }, [
            W(" Agents, automations and workflows run with the access of the account set in their "),
            b("b", null, "Run as"),
            W(" setting. A permission lets members of a group choose a specific account there, typically a bot account, so the component works with that account's access instead of their own. ")
          ])
        ], -1)),
        b("div", Wl, [
          L(h(St), {
            icon: "tabler:refresh",
            label: "Refresh",
            disabled: h(a) || S.value,
            spin: h(a),
            onClick: h(r).load
          }, null, 8, ["disabled", "spin", "onClick"]),
          s.value ? A("", !0) : (f(), j(h(xe), {
            key: 0,
            variant: "primary",
            small: "",
            icon: "tabler:plus",
            disabled: S.value,
            onClick: oe
          }, {
            default: B(() => [...w[8] || (w[8] = [
              W("New permission", -1)
            ])]),
            _: 1
          }, 8, ["disabled"]))
        ])
      ]),
      h(d) ? (f(), g("div", Hl, [
        L(h(Ct), {
          severity: "danger",
          onDismiss: w[0] || (w[0] = (C) => d.value = "")
        }, {
          default: B(() => [
            W(N(h(d)), 1)
          ]),
          _: 1
        })
      ])) : A("", !0),
      h(i) ? (f(), j(h(Ct), {
        key: 1,
        "data-test": "delegation-confirmation",
        severity: "success",
        onDismiss: w[1] || (w[1] = (C) => i.value = "")
      }, {
        default: B(() => [
          W(N(h(i)), 1)
        ]),
        _: 1
      })) : A("", !0),
      s.value ? (f(), g("form", {
        key: 2,
        class: "ks-runas-form",
        onSubmit: Me(Y, ["prevent"])
      }, [
        b("div", Kl, [
          w[10] || (w[10] = b("span", null, "New run-as permission", -1)),
          L(h(St), {
            icon: "tabler:x",
            label: "Cancel",
            disabled: S.value,
            onClick: w[2] || (w[2] = (C) => s.value = !1)
          }, null, 8, ["disabled"])
        ]),
        b("fieldset", {
          disabled: S.value,
          inert: S.value
        }, [
          b("ol", ql, [
            b("li", null, [
              L(h(De), {
                label: "Account to run as",
                help: "The account whose access the component uses. Its group memberships decide what the component can do."
              }, {
                default: B(() => [
                  L(Et, {
                    tag: "wc-principal-picker",
                    attrs: { kinds: "user", placeholder: "Choose an account…" },
                    config: { principal_id: u.value },
                    onChange: w[3] || (w[3] = (C) => F(C, "user")),
                    onError: K
                  }, null, 8, ["config"])
                ]),
                _: 1
              })
            ]),
            b("li", null, [
              L(h(De), {
                label: "Who may choose it",
                help: "Members of these groups see this account in the Run as setting. Nobody's group membership changes."
              }, {
                default: B(() => [
                  L(Et, {
                    tag: "wc-principal-picker",
                    attrs: { kinds: "group", placeholder: "Add a group…" },
                    config: {},
                    onChange: w[4] || (w[4] = (C) => F(C, "group")),
                    onError: K
                  })
                ]),
                _: 1
              }),
              P.value.length ? (f(), g("div", Yl, [
                (f(!0), g(ge, null, ye(P.value, (C) => (f(), j(h(Lr), {
                  key: C.id,
                  label: C.label,
                  removable: !S.value,
                  pt: { removeIcon: { "aria-label": `Remove group ${C.label}` } },
                  onRemove: (J) => P.value = P.value.filter((te) => te.id !== C.id)
                }, null, 8, ["label", "removable", "pt", "onRemove"]))), 128))
              ])) : A("", !0)
            ]),
            b("li", null, [
              b("fieldset", null, [
                w[13] || (w[13] = b("legend", { class: "km-field-label" }, "On which components", -1)),
                b("div", Zl, [
                  b("label", {
                    class: "ks-runas-component-option",
                    for: `${h(x)}-any`
                  }, [
                    L(h(qt), {
                      modelValue: m.value,
                      "onUpdate:modelValue": w[5] || (w[5] = (C) => m.value = C),
                      "input-id": `${h(x)}-any`,
                      name: h(x),
                      value: !0,
                      disabled: S.value
                    }, null, 8, ["modelValue", "input-id", "name", "disabled"]),
                    w[11] || (w[11] = W(" Any component ", -1))
                  ], 8, Ql),
                  b("label", {
                    class: "ks-runas-component-option",
                    for: `${h(x)}-one`
                  }, [
                    L(h(qt), {
                      modelValue: m.value,
                      "onUpdate:modelValue": w[6] || (w[6] = (C) => m.value = C),
                      "input-id": `${h(x)}-one`,
                      name: h(x),
                      value: !1,
                      disabled: S.value
                    }, null, 8, ["modelValue", "input-id", "name", "disabled"]),
                    w[12] || (w[12] = W(" One component ", -1))
                  ], 8, Jl)
                ]),
                w[14] || (w[14] = b("small", { class: "km-field-help" }, "The person choosing the account must also be able to manage the component.", -1))
              ]),
              m.value ? A("", !0) : (f(), j(Et, {
                key: 0,
                class: "ks-runas-component",
                tag: "wc-component-picker",
                attrs: { source: "/api/v1/security/delegations/roots", title: "Component", placeholder: "Choose a component you manage…" },
                config: p.value ? { thread_id: p.value } : {},
                onChange: V,
                onError: K
              }, null, 8, ["config"]))
            ])
          ])
        ], 8, Gl),
        b("div", Xl, [
          L(h(xe), {
            variant: "ghost",
            small: "",
            disabled: S.value,
            onClick: w[7] || (w[7] = (C) => s.value = !1)
          }, {
            default: B(() => [...w[15] || (w[15] = [
              W("Cancel", -1)
            ])]),
            _: 1
          }, 8, ["disabled"]),
          L(h(xe), {
            variant: "primary",
            small: "",
            icon: "tabler:device-floppy",
            disabled: !T.value || S.value,
            loading: h(l),
            onClick: Y
          }, {
            default: B(() => [...w[16] || (w[16] = [
              W("Save permission", -1)
            ])]),
            _: 1
          }, 8, ["disabled", "loading"])
        ])
      ], 32)) : A("", !0),
      h(c) && !h(l) ? (f(), g("div", ed, [
        w[18] || (w[18] = b("span", null, "The result is unconfirmed. Retry the same request before editing this permission.", -1)),
        L(h(xe), {
          small: "",
          onClick: h(r).submit
        }, {
          default: B(() => [...w[17] || (w[17] = [
            W("Retry", -1)
          ])]),
          _: 1
        }, 8, ["onClick"])
      ])) : A("", !0),
      h(a) && !h(o).length ? (f(), j(h(Or), {
        key: 4,
        label: "Loading run-as permissions…"
      })) : $.value.length || y.value.length ? (f(), g("div", td, [
        (f(!0), g(ge, null, ye([...$.value, ...y.value], (C) => (f(), g("article", {
          key: C.policy_id,
          class: be(["ks-runas-grant", { revoked: !C.active }])
        }, [
          L(h(ee), {
            class: "ks-runas-grant-icon",
            icon: "tabler:user-shield",
            "aria-hidden": "true"
          }),
          b("div", nd, [
            b("div", rd, [
              C.active ? (f(), g("span", od, N(C.groups.map((J) => O.value[J] || J).join(", ")), 1)) : A("", !0),
              b("span", ad, N(C.active ? "can run as" : "Permission to run as"), 1),
              b("span", id, N(z.value[C.principal.id] || C.principal.id), 1)
            ]),
            b("div", sd, [
              C.root === "*" ? (f(), g("span", ld, "on any component they manage")) : C.root_label ? (f(), g("span", dd, [
                w[19] || (w[19] = W("on ", -1)),
                b("b", null, N(C.root_label), 1)
              ])) : (f(), g("span", cd, [
                w[20] || (w[20] = W("on component ", -1)),
                b("code", null, N(C.root), 1)
              ]))
            ])
          ]),
          C.active ? (f(), j(h(xe), {
            key: 1,
            variant: "ghost",
            small: "",
            icon: "tabler:user-off",
            disabled: S.value,
            "aria-label": `Revoke run-as permission for ${z.value[C.principal.id] || C.principal.id}`,
            onClick: (J) => ce(C)
          }, {
            default: B(() => [...w[22] || (w[22] = [
              W("Revoke", -1)
            ])]),
            _: 1
          }, 8, ["disabled", "aria-label", "onClick"])) : (f(), j(h(_t), {
            key: 0,
            severity: "secondary"
          }, {
            default: B(() => [...w[21] || (w[21] = [
              W("revoked", -1)
            ])]),
            _: 1
          }))
        ], 2))), 128))
      ])) : !h(d) && !s.value ? (f(), g("div", ud, [
        L(h(ee), {
          icon: "tabler:user-shield",
          "aria-hidden": "true"
        }),
        w[23] || (w[23] = b("b", null, "No run-as permissions yet", -1)),
        w[24] || (w[24] = b("span", null, [
          W("Until a group gets a permission, the Run as setting offers only "),
          b("b", null, "Me"),
          W(".")
        ], -1))
      ])) : A("", !0)
    ]));
  }
}), fd = ["draggable"], md = { class: "ks-pcard-row" }, bd = { class: "ks-pcard-body" }, hd = { class: "ks-pcard-head" }, vd = ["title"], gd = {
  key: 0,
  class: "ks-pcard-comment"
}, yd = ["aria-label", "aria-expanded"], kd = ["aria-label"], xd = ["aria-label"], wd = {
  key: 0,
  class: "ks-pcard-detail"
}, $d = { class: "ks-pcard-kv" }, Sd = {
  key: 0,
  class: "ks-pcard-kv"
}, _d = { class: "ks-pcard-kv" }, Cd = { class: "ks-pcard-kv" }, Pd = { class: "ks-pcard-tags" }, Td = {
  key: 0,
  class: "ks-pcard-none"
}, Od = { class: "ks-pcard-kv" }, Ad = { class: "ks-pcard-tags" }, Ld = {
  key: 0,
  class: "ks-pcard-none"
}, We = /* @__PURE__ */ ie({
  __name: "PolicyCard",
  props: {
    policy: {},
    mode: {}
  },
  emits: ["add", "remove"],
  setup(e, { emit: t }) {
    const n = e, r = t, o = D(!1);
    function a(s) {
      n.mode === "locked" || !s.dataTransfer || (s.dataTransfer.setData("text/plain", n.policy.id), s.dataTransfer.effectAllowed = n.mode === "palette" ? "copy" : "move");
    }
    function l(s) {
      return s.includes(":") ? s.split(":").slice(-1)[0] : s;
    }
    function d(s) {
      return Array.isArray(s) ? s.map(String) : typeof s == "string" && s ? [s] : [];
    }
    const i = X(() => d(n.policy.actions)), c = X(() => d(n.policy.resources));
    return (s, u) => (f(), g("div", {
      class: be(["ks-pcard", [e.mode, { expanded: o.value }]]),
      draggable: e.mode !== "locked",
      onDragstart: a,
      onDblclick: u[3] || (u[3] = (p) => e.mode === "palette" && r("add"))
    }, [
      b("div", md, [
        e.mode === "locked" ? (f(), j(h(ee), {
          key: 0,
          icon: "tabler:lock",
          class: "ks-pcard-grip locked",
          "aria-hidden": "true"
        })) : (f(), j(h(ee), {
          key: 1,
          icon: "tabler:grip-vertical",
          class: "ks-pcard-grip",
          "aria-hidden": "true"
        })),
        b("div", bd, [
          b("div", hd, [
            b("span", {
              class: "ks-pcard-title",
              title: e.policy.title || l(e.policy.id)
            }, N(e.policy.title || l(e.policy.id)), 9, vd),
            e.policy.effect ? (f(), j(_t, {
              key: 0,
              severity: e.policy.effect === "allow" ? "success" : e.policy.effect === "deny" ? "danger" : "secondary"
            }, {
              default: B(() => [
                W(N(e.policy.effect), 1)
              ]),
              _: 1
            }, 8, ["severity"])) : A("", !0)
          ]),
          e.policy.comment ? (f(), g("div", gd, N(e.policy.comment), 1)) : A("", !0)
        ]),
        b("button", {
          class: be(["ks-pcard-act detail", { open: o.value }]),
          "aria-label": `${o.value ? "Hide" : "Show"} details for ${e.policy.title || l(e.policy.id)}`,
          "aria-expanded": o.value,
          onClick: u[0] || (u[0] = Me((p) => o.value = !o.value, ["stop"]))
        }, [
          L(h(ee), {
            icon: "tabler:chevron-right",
            "aria-hidden": "true"
          })
        ], 10, yd),
        e.mode === "palette" ? (f(), g("button", {
          key: 2,
          class: "ks-pcard-act add",
          "aria-label": `Add permission ${e.policy.title || l(e.policy.id)}`,
          onClick: u[1] || (u[1] = Me((p) => r("add"), ["stop"]))
        }, [
          L(h(ee), {
            icon: "tabler:plus",
            "aria-hidden": "true"
          })
        ], 8, kd)) : e.mode === "selected" ? (f(), g("button", {
          key: 3,
          class: "ks-pcard-act remove",
          "aria-label": `Remove permission ${e.policy.title || l(e.policy.id)}`,
          onClick: u[2] || (u[2] = Me((p) => r("remove"), ["stop"]))
        }, [
          L(h(ee), {
            icon: "tabler:x",
            "aria-hidden": "true"
          })
        ], 8, xd)) : A("", !0)
      ]),
      o.value ? (f(), g("div", wd, [
        b("div", $d, [
          u[4] || (u[4] = b("span", null, "Policy ID", -1)),
          b("code", null, N(e.policy.id), 1)
        ]),
        e.policy.surface || e.policy.intent ? (f(), g("div", Sd, [
          u[5] || (u[5] = b("span", null, "Surface", -1)),
          b("code", null, N(e.policy.surface || e.policy.intent), 1)
        ])) : A("", !0),
        b("div", _d, [
          u[6] || (u[6] = b("span", null, "Effect", -1)),
          b("code", {
            class: be(["ks-eff-code", e.policy.effect])
          }, N(e.policy.effect || "—"), 3)
        ]),
        b("div", Cd, [
          u[7] || (u[7] = b("span", null, "Actions", -1)),
          b("div", Pd, [
            (f(!0), g(ge, null, ye(i.value, (p) => (f(), g("code", { key: p }, N(p), 1))), 128)),
            i.value.length ? A("", !0) : (f(), g("span", Td, "—"))
          ])
        ]),
        b("div", Od, [
          u[8] || (u[8] = b("span", null, "Resources", -1)),
          b("div", Ad, [
            (f(!0), g(ge, null, ye(c.value, (p) => (f(), g("code", { key: p }, N(p), 1))), 128)),
            c.value.length ? A("", !0) : (f(), g("span", Ld, "—"))
          ])
        ])
      ])) : A("", !0)
    ], 42, fd));
  }
}), Ed = { class: "ks" }, Nd = { class: "ks-rail-search" }, jd = { class: "ks-rail-list" }, zd = {
  key: 0,
  class: "ks-rail-group"
}, Id = ["onClick"], Rd = { class: "ks-scope-name" }, Vd = ["onClick"], Bd = { class: "ks-scope-name" }, Dd = {
  key: 0,
  class: "ks-builder"
}, Md = { class: "ks-builder-head" }, Fd = { class: "ks-builder-title" }, Ud = { class: "ks-builder-acts" }, Wd = {
  key: 0,
  class: "ks-overlay-warn"
}, Hd = {
  key: 1,
  class: "ks-view-note"
}, Kd = { class: "ks-fields" }, Gd = {
  key: 0,
  class: "ks-field-err"
}, qd = {
  key: 0,
  class: "ks-pane locked-pane"
}, Yd = { class: "ks-pane-head" }, Zd = { class: "ks-pane-sub" }, Qd = { class: "ks-pane-body" }, Jd = {
  key: 0,
  class: "ks-pane-empty"
}, Xd = { class: "ks-pane" }, ec = { class: "ks-pane-search" }, tc = { class: "ks-pane-body" }, nc = {
  key: 0,
  class: "ks-pane-empty"
}, rc = { class: "ks-pane-head" }, oc = { class: "ks-pane-sub" }, ac = { class: "ks-pane-body" }, ic = ["onDrop"], sc = {
  key: 0,
  class: "ks-drop-hint"
}, lc = {
  key: 1,
  class: "ks-view"
}, dc = { class: "ks-builder-head" }, cc = { class: "ks-builder-title" }, uc = { class: "ks-builder-acts" }, pc = { class: "ks-pane-body ks-view-list" }, fc = {
  key: 0,
  class: "ks-pane-empty"
}, mc = {
  key: 0,
  class: "ks-ext-block"
}, bc = { class: "ks-ext-head" }, hc = { class: "ks-pane-body ks-view-list" }, vc = /* @__PURE__ */ ie({
  __name: "Security",
  setup(e) {
    const t = Dl(), { scopes: n, policies: r, loading: o, saving: a, error: l } = t, d = D(""), i = D(""), c = D(null), s = D(null), u = D("scopes"), p = D(null), m = D(!1);
    async function x(k) {
      u.value = String(k), k === "delegations" && (m.value = !0, await Zt(), await p.value?.load());
    }
    Vo(async () => {
      await t.load(), u.value === "delegations" && await p.value?.load();
    });
    const P = X(() => {
      const k = {};
      for (const v of r.value) k[v.id] = v;
      return k;
    }), S = X(() => {
      const k = d.value.trim().toLowerCase(), v = (_) => !k || _.label.toLowerCase().includes(k) || _.id.toLowerCase().includes(k);
      return {
        custom: n.value.filter((_) => _.source === "custom" && v(_)),
        builtin: n.value.filter((_) => _.source !== "custom" && v(_))
      };
    }), T = X(() => n.value.find((k) => k.id === c.value) || null), O = X(() => T.value && T.value.source !== "custom" ? T.value : null), z = X(() => {
      if (!s.value) return [];
      const k = /* @__PURE__ */ new Set([...s.value.policies, ...s.value.base.map((_) => _.id)]), v = i.value.trim().toLowerCase();
      return r.value.filter((_) => !k.has(_.id) && (!v || (_.title || "").toLowerCase().includes(v) || _.id.toLowerCase().includes(v) || (_.comment || "").toLowerCase().includes(v)));
    }), $ = X(
      () => s.value ? s.value.policies.map((k) => P.value[k] || { id: k }) : []
    );
    function y(k) {
      c.value = k.id, s.value = k.source === "custom" ? { slug: k.slug || "", label: k.label, description: k.description, policies: k.policies.map((v) => v.id), enabled: k.enabled, isNew: !1, target: "", base: [] } : null;
    }
    function F() {
      c.value = null, s.value = { slug: "", label: "", description: "", policies: [], enabled: !0, isNew: !0, target: "", base: [] };
    }
    function V(k) {
      c.value = null, s.value = {
        slug: "",
        label: k.label ? `Copy of ${k.label}` : "",
        description: k.description,
        policies: [...k.policies.map((v) => v.id), ...(k.overlay_policies ?? []).map((v) => v.id)],
        enabled: !0,
        isNew: !0,
        target: "",
        base: []
      };
    }
    function K(k) {
      return k.replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "");
    }
    function oe(k) {
      c.value = k.id, s.value = {
        slug: k.overlay_slug || K(k.id),
        label: k.label || se(k.id),
        description: k.description,
        policies: (k.overlay_policies ?? []).map((v) => v.id),
        enabled: !0,
        isNew: !k.overlay_slug,
        target: k.id,
        base: k.policies
      };
    }
    const Y = X(() => !!s.value && s.value.target !== "");
    function ce(k) {
      s.value && !s.value.policies.includes(k) && s.value.policies.push(k);
    }
    function I(k) {
      s.value && (s.value.policies = s.value.policies.filter((v) => v !== k));
    }
    function w(k) {
      const v = k.dataTransfer?.getData("text/plain");
      v && ce(v);
    }
    function C(k, v) {
      k.stopPropagation();
      const _ = k.dataTransfer?.getData("text/plain");
      if (!_ || !s.value || _ === v) return;
      const ae = s.value.policies, pt = ae.indexOf(_);
      pt !== -1 && ae.splice(pt, 1);
      const ft = ae.indexOf(v);
      ae.splice(ft === -1 ? ae.length : ft, 0, _);
    }
    const J = X(() => {
      if (!s.value || !s.value.isNew || s.value.target !== "") return "";
      const k = s.value.slug.trim();
      return k && !/^[a-z0-9][\w.-]*$/i.test(k) ? "Slug must be alphanumeric (with _.-)" : "";
    }), te = X(() => !!s.value && s.value.slug.trim() !== "" && !J.value && s.value.policies.length > 0), ue = D("");
    let fe = null;
    Kn(() => {
      fe && clearTimeout(fe);
    });
    function Oe(k) {
      ue.value = k, fe && clearTimeout(fe), fe = setTimeout(() => {
        ue.value = "";
      }, 3e3);
    }
    async function he() {
      if (!s.value || !te.value) return;
      const k = s.value.slug.trim(), v = s.value.target, _ = s.value.label.trim() || k;
      await t.saveScope({
        slug: k,
        target: v,
        label: s.value.label.trim(),
        description: s.value.description.trim(),
        policies: s.value.policies,
        enabled: s.value.enabled
      }) && (c.value = v || `kickside.security.scopes:${k}`, Oe(`Saved “${_}”. The role will be available when assigning users.`));
    }
    async function me() {
      if (!s.value || s.value.isNew) return;
      const k = Y.value;
      if (!await Jt.confirm({
        header: k ? "Remove extension?" : "Delete role?",
        message: k ? "This removes the added permissions. Users keep the role’s original permissions." : "This removes the custom role and its permissions.",
        icon: "tabler:trash",
        acceptLabel: k ? "Remove extension" : "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      })) return;
      await t.deleteScope(s.value.slug) && (s.value = null, c.value = null);
    }
    function se(k) {
      return k.includes(":") ? k.split(":").slice(-1)[0] : k;
    }
    return (k, v) => (f(), g("div", Ed, [
      L(h(_r), {
        class: "ks-tabs",
        value: u.value,
        "onUpdate:value": x
      }, {
        default: B(() => [
          L(h(Sr), { pt: { tabList: { "aria-label": "Security administration" } } }, {
            default: B(() => [
              L(h(Ut), { value: "scopes" }, {
                default: B(() => [...v[12] || (v[12] = [
                  W("Roles", -1)
                ])]),
                _: 1
              }),
              L(h(Ut), {
                value: "delegations",
                "data-tab": "delegations"
              }, {
                default: B(() => [...v[13] || (v[13] = [
                  W("Run as", -1)
                ])]),
                _: 1
              })
            ]),
            _: 1
          })
        ]),
        _: 1
      }, 8, ["value"]),
      m.value ? Fe((f(), j(pd, {
        key: 0,
        ref_key: "delegationPanel",
        ref: p,
        scopes: h(n)
      }, null, 8, ["scopes"])), [
        [ln, u.value === "delegations"]
      ]) : A("", !0),
      h(l) ? (f(), j(h(Ct), {
        key: 1,
        severity: "danger",
        class: "ks-top-notice",
        onDismiss: v[0] || (v[0] = (_) => l.value = "")
      }, {
        default: B(() => [
          W(N(h(l)), 1)
        ]),
        _: 1
      })) : ue.value ? (f(), j(h(Ct), {
        key: 2,
        severity: "success",
        class: "ks-top-notice",
        onDismiss: v[1] || (v[1] = (_) => ue.value = "")
      }, {
        default: B(() => [
          W(N(ue.value), 1)
        ]),
        _: 1
      })) : A("", !0),
      u.value === "scopes" && h(o) && !h(n).length ? (f(), j(h(Or), {
        key: 3,
        label: "Loading security…"
      })) : Fe((f(), j(h(rs), { key: 4 }, {
        rail: B(() => [
          L(h(ls), {
            title: "Roles",
            count: h(n).length
          }, {
            actions: B(() => [
              L(h(St), {
                icon: "tabler:plus",
                label: "New role",
                disabled: h(a),
                onClick: F
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
          b("div", Nd, [
            L(h(Wn), {
              modelValue: d.value,
              "onUpdate:modelValue": v[2] || (v[2] = (_) => d.value = _),
              placeholder: "Find a role…"
            }, null, 8, ["modelValue"])
          ]),
          b("div", jd, [
            S.value.custom.length ? (f(), g("div", zd, "Custom")) : A("", !0),
            (f(!0), g(ge, null, ye(S.value.custom, (_) => (f(), g("button", {
              key: _.id,
              class: be(["ks-scope-row", { active: _.id === c.value }]),
              onClick: (ae) => y(_)
            }, [
              b("span", Rd, N(_.label || se(_.id)), 1)
            ], 10, Id))), 128)),
            v[14] || (v[14] = b("div", { class: "ks-rail-group" }, "Default", -1)),
            (f(!0), g(ge, null, ye(S.value.builtin, (_) => (f(), g("button", {
              key: _.id,
              class: be(["ks-scope-row", { active: _.id === c.value }]),
              onClick: (ae) => y(_)
            }, [
              b("span", Bd, N(_.label || se(_.id)), 1)
            ], 10, Vd))), 128))
          ])
        ]),
        default: B(() => [
          s.value ? (f(), g("div", Dd, [
            b("div", Md, [
              b("div", Fd, [
                L(h(ee), {
                  icon: Y.value ? "tabler:stack-2" : "tabler:shield-lock",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                b("span", null, N(Y.value ? `Extend ${s.value.label || se(s.value.target)}` : s.value.isNew ? "New role" : s.value.label || s.value.slug), 1),
                Y.value ? (f(), j(h(_t), {
                  key: 0,
                  severity: "warn"
                }, {
                  default: B(() => [...v[15] || (v[15] = [
                    W("Additional permissions", -1)
                  ])]),
                  _: 1
                })) : A("", !0)
              ]),
              b("div", Ud, [
                !s.value.isNew && !Y.value && T.value ? (f(), j(h(xe), {
                  key: 0,
                  variant: "soft",
                  small: "",
                  icon: "tabler:copy",
                  disabled: h(a),
                  onClick: v[3] || (v[3] = (_) => V(T.value))
                }, {
                  default: B(() => [...v[16] || (v[16] = [
                    W("Duplicate", -1)
                  ])]),
                  _: 1
                }, 8, ["disabled"])) : A("", !0),
                s.value.isNew ? A("", !0) : (f(), j(h(xe), {
                  key: 1,
                  variant: "danger",
                  small: "",
                  icon: "tabler:trash",
                  disabled: h(a),
                  onClick: me
                }, {
                  default: B(() => [
                    W(N(Y.value ? "Remove extension" : "Delete"), 1)
                  ]),
                  _: 1
                }, 8, ["disabled"])),
                L(h(xe), {
                  variant: "primary",
                  small: "",
                  icon: "tabler:device-floppy",
                  loading: h(a),
                  disabled: !te.value,
                  onClick: he
                }, {
                  default: B(() => [
                    W(N(Y.value ? "Save extension" : "Save role"), 1)
                  ]),
                  _: 1
                }, 8, ["loading", "disabled"])
              ])
            ]),
            Y.value ? (f(), g("div", Wd, [
              L(h(ee), {
                icon: "tabler:alert-triangle",
                "aria-hidden": "true"
              }),
              b("span", null, [
                v[17] || (v[17] = W("Adding permissions grants them to ", -1)),
                b("b", null, "everyone assigned " + N(T.value?.label || se(s.value.target)), 1),
                v[18] || (v[18] = W(". Original permissions cannot be removed here. To restrict access, create a new role with only the permissions needed.", -1))
              ])
            ])) : (f(), g("p", Hd, "Choose the permissions this role grants, then assign it in System → Users. To restrict a Member, assign this role instead of Member; other assigned roles may still grant access.")),
            b("div", Kd, [
              Y.value ? (f(), j(h(De), {
                key: 1,
                label: "Role"
              }, {
                default: B(() => [
                  L(h(yt), {
                    "model-value": T.value?.label || s.value.target,
                    disabled: ""
                  }, null, 8, ["model-value"])
                ]),
                _: 1
              })) : (f(), j(h(De), {
                key: 0,
                label: "Role ID",
                help: s.value.isNew ? "Unique identifier; cannot change later." : void 0
              }, {
                default: B(() => [
                  L(h(yt), {
                    modelValue: s.value.slug,
                    "onUpdate:modelValue": v[4] || (v[4] = (_) => s.value.slug = _),
                    disabled: !s.value.isNew,
                    placeholder: "reviewer"
                  }, null, 8, ["modelValue", "disabled"]),
                  J.value ? (f(), g("span", Gd, N(J.value), 1)) : A("", !0)
                ]),
                _: 1
              }, 8, ["help"])),
              L(h(De), { label: "Name" }, {
                default: B(() => [
                  L(h(yt), {
                    modelValue: s.value.label,
                    "onUpdate:modelValue": v[5] || (v[5] = (_) => s.value.label = _),
                    placeholder: "Reviewer"
                  }, null, 8, ["modelValue"])
                ]),
                _: 1
              }),
              L(h(De), { label: "Description" }, {
                default: B(() => [
                  L(h(yt), {
                    modelValue: s.value.description,
                    "onUpdate:modelValue": v[6] || (v[6] = (_) => s.value.description = _),
                    placeholder: "Read-only reviewer role"
                  }, null, 8, ["modelValue"])
                ]),
                _: 1
              })
            ]),
            b("div", {
              class: be(["ks-panes", { three: Y.value }])
            }, [
              Y.value ? (f(), g("section", qd, [
                b("header", Yd, [
                  v[19] || (v[19] = b("span", null, "Original permissions", -1)),
                  b("span", Zd, N(s.value.base.length) + " · locked", 1)
                ]),
                b("div", Qd, [
                  (f(!0), g(ge, null, ye(s.value.base, (_) => (f(), j(We, {
                    key: _.id,
                    policy: _,
                    mode: "locked"
                  }, null, 8, ["policy"]))), 128)),
                  s.value.base.length ? A("", !0) : (f(), g("div", Jd, "No original permissions."))
                ])
              ])) : A("", !0),
              b("section", Xd, [
                v[20] || (v[20] = b("header", { class: "ks-pane-head" }, [
                  b("span", null, "Available permissions"),
                  b("span", { class: "ks-pane-sub" }, "Click + to add")
                ], -1)),
                b("div", ec, [
                  L(h(Wn), {
                    modelValue: i.value,
                    "onUpdate:modelValue": v[7] || (v[7] = (_) => i.value = _),
                    placeholder: "Search permissions…"
                  }, null, 8, ["modelValue"])
                ]),
                b("div", tc, [
                  (f(!0), g(ge, null, ye(z.value, (_) => (f(), j(We, {
                    key: _.id,
                    policy: _,
                    mode: "palette",
                    onAdd: (ae) => ce(_.id)
                  }, null, 8, ["policy", "onAdd"]))), 128)),
                  z.value.length ? A("", !0) : (f(), g("div", nc, "No matching permissions."))
                ])
              ]),
              b("section", {
                class: "ks-pane drop",
                onDragover: v[9] || (v[9] = Me(() => {
                }, ["prevent"])),
                onDrop: w
              }, [
                b("header", rc, [
                  b("span", null, N(Y.value ? "Added by you" : "In this role"), 1),
                  b("span", oc, N(s.value.policies.length) + " " + N(s.value.policies.length === 1 ? "permission" : "permissions"), 1)
                ]),
                b("div", ac, [
                  (f(!0), g(ge, null, ye($.value, (_) => (f(), g("div", {
                    key: _.id,
                    onDragover: v[8] || (v[8] = Me(() => {
                    }, ["prevent"])),
                    onDrop: (ae) => C(ae, _.id)
                  }, [
                    L(We, {
                      policy: _,
                      mode: "selected",
                      onRemove: (ae) => I(_.id)
                    }, null, 8, ["policy", "onRemove"])
                  ], 40, ic))), 128)),
                  s.value.policies.length ? A("", !0) : (f(), g("div", sc, [
                    L(h(ee), {
                      icon: "tabler:drag-drop",
                      "aria-hidden": "true"
                    }),
                    v[21] || (v[21] = b("span", null, "Use + on an available permission, or drag it here.", -1))
                  ]))
                ])
              ], 32)
            ], 2)
          ])) : O.value ? (f(), g("div", lc, [
            b("div", dc, [
              b("div", cc, [
                L(h(ee), {
                  icon: "tabler:shield",
                  "aria-hidden": "true"
                }),
                b("span", null, N(O.value.label || se(O.value.id)), 1)
              ]),
              b("div", uc, [
                L(h(xe), {
                  variant: "primary",
                  small: "",
                  icon: "tabler:stack-2",
                  onClick: v[10] || (v[10] = (_) => oe(O.value))
                }, {
                  default: B(() => [
                    W(N(O.value.overlay_slug ? "Edit extension" : "Add permissions"), 1)
                  ]),
                  _: 1
                }),
                L(h(xe), {
                  variant: "soft",
                  small: "",
                  icon: "tabler:copy",
                  onClick: v[11] || (v[11] = (_) => V(O.value))
                }, {
                  default: B(() => [...v[22] || (v[22] = [
                    W("Copy role", -1)
                  ])]),
                  _: 1
                })
              ])
            ]),
            v[24] || (v[24] = b("p", { class: "ks-view-note" }, " Included with the application. Adding permissions affects everyone with this role. For restricted access, create a new role with only the permissions needed and assign it in System → Users instead of this role. Other assigned roles may still grant access. ", -1)),
            b("div", pc, [
              (f(!0), g(ge, null, ye(O.value.policies, (_) => (f(), j(We, {
                key: _.id,
                policy: _,
                mode: "locked"
              }, null, 8, ["policy"]))), 128)),
              O.value.policies.length ? A("", !0) : (f(), g("div", fc, "No permissions in this role."))
            ]),
            O.value.overlay_policies && O.value.overlay_policies.length ? (f(), g("div", mc, [
              b("div", bc, [
                L(h(ee), {
                  icon: "tabler:stack-2",
                  "aria-hidden": "true"
                }),
                v[23] || (v[23] = b("span", null, "Additional permissions", -1)),
                L(h(_t), { severity: "warn" }, {
                  default: B(() => [
                    W(N(O.value.overlay_policies.length), 1)
                  ]),
                  _: 1
                })
              ]),
              b("div", hc, [
                (f(!0), g(ge, null, ye(O.value.overlay_policies, (_) => (f(), j(We, {
                  key: _.id,
                  policy: _,
                  mode: "locked"
                }, null, 8, ["policy"]))), 128))
              ])
            ])) : A("", !0)
          ])) : (f(), j(h(ll), {
            key: 2,
            icon: "tabler:shield-lock",
            title: "Roles",
            hint: "Choose a role to view its permissions, or create one with the permissions your team needs. Assign roles in System → Users.",
            cta: "New role",
            "cta-icon": "tabler:plus",
            onCta: F
          }))
        ]),
        _: 1
      }, 512)), [
        [ln, u.value === "scopes"]
      ])
    ]));
  }
}), gc = ':root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}.kx-tag-sm,.kx-tag-sm.kx-tag-sm{display:inline-flex;align-items:center;gap:4px;padding:1px 7px;border-radius:var(--kx-radius-tag, 6px);font-size:10.5px;font-weight:600;line-height:1.5;white-space:nowrap}.kx-tag-sm svg,.kx-tag-sm.kx-tag-sm svg{width:12px;height:12px}.kx-tag-caps,.kx-tag-caps.kx-tag-caps{display:inline-flex;align-items:center;gap:3px;padding:2px 6px;border-radius:var(--kx-radius-tag, 6px);font-size:9px;font-weight:700;line-height:1.5;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap}.kx-tag-caps svg,.kx-tag-caps.kx-tag-caps svg{width:11px;height:11px}:host,:root{--kx-surface-1: color-mix(in srgb, var(--p-content-background) 96%, var(--p-text-color) 4%);--kx-surface-2: color-mix(in srgb, var(--p-content-background) 92%, var(--p-text-color) 8%);--kx-surface-3: color-mix(in srgb, var(--p-content-background) 86%, var(--p-text-color) 14%);--kx-surface-4: color-mix(in srgb, var(--p-content-background) 78%, var(--p-text-color) 22%);--kx-border-strong: color-mix(in srgb, var(--p-content-border-color) 60%, var(--p-text-color) 40%);--kx-border-stronger: color-mix(in srgb, var(--p-content-border-color) 30%, var(--p-text-color) 70%);--kx-text-faint: color-mix(in srgb, var(--p-text-muted-color) 70%, var(--p-content-background) 30%);--kx-text-fainter: color-mix(in srgb, var(--p-text-muted-color) 45%, var(--p-content-background) 55%);--kx-wash-primary: color-mix(in srgb, var(--p-primary-color) 12%, var(--p-content-background) 88%);--kx-wash-success: color-mix(in srgb, var(--p-success-500) 12%, var(--p-content-background) 88%);--kx-wash-info: color-mix(in srgb, var(--p-info-500) 12%, var(--p-content-background) 88%);--kx-wash-warn: color-mix(in srgb, var(--p-warn-500) 12%, var(--p-content-background) 88%);--kx-wash-danger: color-mix(in srgb, var(--p-danger-500) 12%, var(--p-content-background) 88%);--kx-wash-help: color-mix(in srgb, var(--p-help-500) 12%, var(--p-content-background) 88%);--kx-font-heading: "Outfit", system-ui, sans-serif;--kx-font-body: "Inter", system-ui, sans-serif;--kx-radius-4: 4px;--kx-radius-6: 6px;--kx-radius-8: 8px;--kx-radius-10: 10px;--kx-radius-14: 14px;--kx-radius-16: 16px;--kx-radius-tag: var(--p-content-border-radius, 6px);--kx-control-height: 34px;--kx-control-height-sm: 30px;--kx-rail-width: 264px;--kx-reading-measure: 880px;--kx-row-height: 32px;--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .08);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .12);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .18);--kx-overlay-hover: color-mix(in srgb, var(--p-text-color) 7%, transparent);--kx-overlay-subtle: color-mix(in srgb, var(--p-text-color) 4%, transparent)}@media(prefers-color-scheme:dark){:host(:not(.w-theme-light)),:root:not(.w-theme-light){--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .35);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .45);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .6)}}:host(.w-theme-dark),:root.w-theme-dark{--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .35);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .45);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .6)}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}:host{display:block;height:100%;min-height:0;--km-rail-w: 296px;--system-surface-gutter: var(--kickside-system-surface-gutter, 24px)}:host>div{height:100%;min-height:0}*,*:before,*:after{box-sizing:border-box}.km{height:100%;min-height:0;display:flex;flex-direction:column;background:var(--p-content-background);color:var(--p-text-color);font-family:inherit}.km-top-notice{width:calc(100% - (var(--system-surface-gutter) * 2));margin:12px 0 0 var(--system-surface-gutter)}.km-shell{flex:1;min-height:0;width:100%;margin:0;display:grid;grid-template-columns:var(--km-rail-w) minmax(0,1fr);border-left:1px solid var(--p-content-border-color);border-right:1px solid var(--p-content-border-color)}.km-rail{min-width:0;min-height:0;display:flex;flex-direction:column;border-right:1px solid var(--p-content-border-color)}.km-rail-body{flex:1;min-height:0;overflow:auto;padding:6px}.km-main{min-width:0;min-height:0;display:flex;flex-direction:column;overflow:hidden}.km-railhead{flex:0 0 auto;display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:48px;padding:0 8px 0 14px;border-bottom:1px solid var(--p-content-border-color)}.km-railhead-title{display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:760;letter-spacing:.03em;text-transform:uppercase;color:var(--p-text-muted-color)}.km-railhead-title b{min-width:18px;padding:1px 6px;border-radius:999px;background:var(--kx-overlay-subtle);color:var(--p-text-color);font-size:11px;font-weight:700;text-align:center}.km-railhead-acts{display:inline-flex;align-items:center;gap:2px}.km-input{width:100%;min-width:0;height:34px;padding:0 10px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);background:var(--p-content-background);color:var(--p-text-color);font:inherit;font-size:13px}.km-input:read-only{color:var(--p-text-muted-color);background:var(--kx-overlay-subtle)}.km-input:disabled{opacity:.6}.km-input.mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}.km-textarea{height:auto;min-height:120px;padding:9px 10px;line-height:1.45;resize:vertical}.km-search{position:relative;display:flex;align-items:center;min-width:0}.km-search-ico{position:absolute;left:9px;width:16px;height:16px;color:var(--p-text-muted-color);pointer-events:none}.km-search-input{width:100%;height:34px;padding:0 30px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);background:var(--p-content-background);color:var(--p-text-color);font:inherit;font-size:13px}.km-search-clear{position:absolute;right:6px;width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:6px;background:transparent;color:var(--p-text-muted-color);cursor:pointer}.km-search-clear:hover{color:var(--p-text-color);background:var(--kx-overlay-hover)}.km-search-clear svg{width:14px;height:14px}.km-select{position:relative;min-width:0;display:flex}.km-select-el{width:100%;height:34px;padding:0 30px 0 10px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);background:var(--p-content-background);color:var(--p-text-color);font:inherit;font-size:13px;cursor:pointer;appearance:none}.km-select-chev{position:absolute;right:9px;top:50%;transform:translateY(-50%);width:15px;height:15px;color:var(--p-text-muted-color);pointer-events:none}.km-field{min-width:0;display:flex;flex-direction:column;gap:5px}.km-field-label{color:var(--p-text-muted-color);font-size:11.5px;font-weight:680}.km-field-help{color:var(--p-text-muted-color);font-size:11.5px;line-height:1.35}.km-pill{max-width:190px;overflow:hidden;text-overflow:ellipsis}.km-pill-dot{width:6px;height:6px;border-radius:50%;background:currentColor}.km-notice{display:flex;align-items:center;gap:9px;padding:9px 10px 9px 12px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);font-size:13px}.km-notice svg{width:17px;height:17px;flex:0 0 auto}.km-notice-text{flex:1;min-width:0}.km-notice.is-info{color:var(--p-text-color);background:var(--kx-overlay-subtle)}.km-notice.is-danger{color:var(--p-text-color);border-color:color-mix(in srgb,var(--p-danger-500) 32%,var(--p-content-border-color));background:color-mix(in srgb,var(--p-danger-500) 9%,transparent)}.km-notice.is-success{color:var(--p-text-color);border-color:color-mix(in srgb,var(--p-success-500) 36%,var(--p-content-border-color));background:color-mix(in srgb,var(--p-success-500) 12%,transparent)}.km-notice-x{width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:6px;background:transparent;color:inherit;cursor:pointer;opacity:.7}.km-notice-x:hover{opacity:1;background:color-mix(in srgb,currentColor 12%,transparent)}.km-notice-x svg{width:14px;height:14px}.km-loading{display:flex;align-items:center;justify-content:center;gap:9px;padding:40px 20px;color:var(--p-text-muted-color);font-size:13px}.km-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:48px 24px;text-align:center}.km-empty-ico{width:30px;height:30px;color:var(--p-text-muted-color)}.km-empty-title{font-size:14px;font-weight:720}.km-empty-hint{margin:0;max-width:340px;color:var(--p-text-muted-color);font-size:12.5px;line-height:1.45}.km-empty .p-button{margin-top:4px}.km-plist{display:flex;flex-direction:column;gap:2px}.km-plist-all{width:100%;height:32px;display:flex;align-items:center;padding:0 10px;border:0;border-radius:var(--kx-radius-8);background:transparent;color:var(--p-text-muted-color);font:inherit;font-size:12.5px;font-weight:640;text-align:left;cursor:pointer}.km-plist-all:hover{background:var(--kx-overlay-hover);color:var(--p-text-color)}.km-plist-all.on{background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);color:var(--p-primary-color)}.km-plist-empty{display:flex;flex-direction:column;align-items:flex-start;gap:8px;padding:10px;color:var(--p-text-muted-color);font-size:12.5px}.km-plist-empty p{margin:0}.km-picker{display:flex;flex-direction:column;gap:18px}.km-picker-sec{display:flex;flex-direction:column;gap:7px}.km-picker-sec-title{color:var(--p-text-muted-color);font-size:11px;font-weight:760;letter-spacing:.03em;text-transform:uppercase}.km-picker-list{display:flex;flex-direction:column;gap:4px}.km-picker-item{display:grid;grid-template-columns:32px minmax(0,1fr) 16px;align-items:center;gap:11px;padding:9px 10px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);background:transparent;color:var(--p-text-color);font:inherit;text-align:left;cursor:pointer;transition:border-color .12s ease,background-color .12s ease}.km-picker-item:hover{border-color:color-mix(in srgb,var(--p-primary-color) 50%,var(--p-content-border-color));background:var(--kx-overlay-hover)}.km-picker-ico{width:32px;height:32px;display:inline-flex;align-items:center;justify-content:center;border-radius:var(--kx-radius-8);color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 11%,transparent)}.km-picker-ico svg{width:18px;height:18px}.km-picker-body{min-width:0;display:flex;flex-direction:column;gap:2px}.km-picker-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;font-weight:660}.km-picker-desc{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--p-text-muted-color);font-size:11.5px}.km-picker-go{width:16px;height:16px;color:var(--p-text-muted-color)}.km-form{display:flex;flex-direction:column;gap:16px}.km-editor-head{display:flex;align-items:center;gap:11px}.km-editor-head-text{min-width:0}.km-editor-head-title{font-size:14px;font-weight:740}.km-editor-head-sub{margin-top:2px;color:var(--p-text-muted-color);font-size:12px;line-height:1.4}.km-form-sec{display:flex;flex-direction:column;gap:10px}.km-form-sec+.km-form-sec{padding-top:16px;border-top:1px solid var(--p-content-border-color)}.km-form-sec-title{color:var(--p-text-muted-color);font-size:11px;font-weight:760;letter-spacing:.03em;text-transform:uppercase}.km-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}.km-form-grid.four{grid-template-columns:repeat(4,minmax(0,1fr))}.km-form-foot{position:sticky;bottom:-16px;display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px;margin:0 -16px -16px;padding:14px 16px;border-top:1px solid var(--p-content-border-color);background:var(--p-content-background)}.km-form-id{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11.5px;color:var(--p-text-muted-color)}.km-form-foot-sp{flex:1}.km-adv-toggle{display:inline-flex;align-items:center;gap:6px;padding:0;border:0;background:transparent;color:var(--p-text-muted-color);font:inherit;font-size:11px;font-weight:760;letter-spacing:.03em;text-transform:uppercase;cursor:pointer}.km-adv-toggle:hover{color:var(--p-text-color)}.km-adv-chev{width:14px;height:14px;transition:transform .15s ease}.km-adv-toggle.open .km-adv-chev{transform:rotate(90deg)}.km-adv-body{display:flex;flex-direction:column;gap:10px;margin-top:10px}.km-test-result{display:flex;align-items:center;gap:8px;padding:8px 11px;border-radius:var(--kx-radius-8);font-size:12.5px}.km-test-result svg{width:16px;height:16px;flex:0 0 auto}.km-test-result span{min-width:0;overflow-wrap:anywhere}.km-test-result.testing{color:var(--p-text-muted-color);background:var(--kx-overlay-subtle)}.km-test-result.ok{color:var(--p-success-600, var(--p-success-500));background:color-mix(in srgb,var(--p-success-500) 12%,transparent)}.km-test-result.fail{color:var(--p-danger-600, var(--p-danger-500));background:color-mix(in srgb,var(--p-danger-500) 10%,transparent)}.km-probe{border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);font-size:13px}.km-probe.ok{border-color:color-mix(in srgb,var(--p-success-500) 30%,var(--p-content-border-color));background:color-mix(in srgb,var(--p-success-500) 8%,transparent)}.km-probe.fail{border-color:color-mix(in srgb,var(--p-danger-500) 30%,var(--p-content-border-color));background:color-mix(in srgb,var(--p-danger-500) 8%,transparent)}.km-probe-head{display:flex;flex-wrap:wrap;align-items:center;gap:9px;padding:9px 10px 9px 12px}.km-probe-head>svg{width:17px;height:17px;flex:0 0 auto}.km-probe.ok .km-probe-head>svg{color:var(--p-success-600, var(--p-success-500))}.km-probe.fail .km-probe-head>svg{color:var(--p-danger-600, var(--p-danger-500))}.km-probe-msg{flex:1;min-width:0}.km-probe-time{flex:0 0 auto;padding:1px 7px;border-radius:var(--kx-radius-tag);background:var(--kx-overlay-subtle);color:var(--p-text-muted-color);font-size:11px;font-weight:700;font-variant-numeric:tabular-nums}.km-probe-adv-btn{flex:0 0 auto}.km-probe-x{width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;border:0;border-radius:6px;background:transparent;color:var(--p-text-muted-color);cursor:pointer;opacity:.7}.km-probe-x:hover{opacity:1;background:color-mix(in srgb,currentColor 12%,transparent)}.km-probe-x svg{width:14px;height:14px}.km-probe-adv{display:flex;flex-direction:column;gap:10px;padding:10px 12px 12px;border-top:1px solid var(--p-content-border-color)}.km-probe-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:6px 16px}.km-probe-kv{display:flex;align-items:baseline;gap:8px;min-width:0}.km-probe-kv span{flex:0 0 96px;color:var(--p-text-muted-color);font-size:11.5px}.km-probe-kv code{min-width:0;overflow:hidden;text-overflow:ellipsis;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11.5px}.km-probe-tokens{display:flex;flex-wrap:wrap;align-items:center;gap:6px}.km-probe-tokens-l{color:var(--p-text-muted-color);font-size:11.5px;margin-right:2px}.km-probe-tok{padding:1px 8px;border-radius:var(--kx-radius-tag);background:var(--kx-overlay-subtle);color:var(--p-text-muted-color);font-size:11px;font-variant-numeric:tabular-nums}.km-probe-tok b{color:var(--p-text-color);font-weight:700}.km-probe-out{display:flex;flex-direction:column;gap:4px}.km-probe-out span{color:var(--p-text-muted-color);font-size:11.5px;font-weight:700}.km-probe-out pre{margin:0;max-height:160px;overflow:auto;padding:9px 10px;border-radius:6px;background:var(--kx-overlay-subtle);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11.5px;line-height:1.45;white-space:pre-wrap;word-break:break-word}.km-tabs{flex:0 0 auto;display:flex;gap:2px;padding:0 12px;border-bottom:1px solid var(--p-content-border-color)}.km-tab{position:relative;display:inline-flex;align-items:center;gap:7px;height:44px;padding:0 12px;border:0;background:transparent;color:var(--p-text-muted-color);font:inherit;font-size:13px;font-weight:700;cursor:pointer}.km-tab:hover,.km-tab.on{color:var(--p-text-color)}.km-tab.on:after{content:"";position:absolute;left:8px;right:8px;bottom:-1px;height:2px;border-radius:2px 2px 0 0;background:var(--p-primary-color)}.km-tab b{min-width:18px;padding:0 6px;border-radius:999px;background:var(--kx-overlay-subtle);color:var(--p-text-muted-color);font-size:11px;font-weight:700;text-align:center}.km-tab.on b{background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.km-classes{flex:1;min-height:0;display:flex;flex-direction:column}.km-classes-list{display:flex;flex-direction:column;gap:10px;padding:14px 16px}.km-class{flex:0 0 auto;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);overflow:hidden}.km-class-head{display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--kx-overlay-subtle);border-bottom:1px solid var(--p-content-border-color)}.km-class-head-text{flex:1;min-width:0}.km-class-title{display:flex;align-items:center;gap:8px;font-size:13.5px;font-weight:720}.km-class-ref{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;font-weight:600;color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);padding:1px 6px;border-radius:6px}.km-class-desc{margin-top:3px;color:var(--p-text-muted-color);font-size:12px;line-height:1.4}.km-class-meta{display:flex;align-items:center;gap:8px;flex:0 0 auto}.km-class-count{color:var(--p-text-muted-color);font-size:11.5px;white-space:nowrap}.km-class-members{display:flex;flex-direction:column}.km-class-member{display:grid;grid-template-columns:58px minmax(0,1.2fr) minmax(0,1fr) auto;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid var(--p-content-border-color)}.km-class-member:last-child{border-bottom:0}.km-class-member.top{background:color-mix(in srgb,var(--p-success-500) 6%,transparent)}.km-class-rank{width:20px;height:20px;display:inline-flex;align-items:center;justify-content:center;border-radius:6px;background:var(--kx-overlay-subtle);color:var(--p-text-muted-color);font-size:11px;font-weight:700}.km-class-member-name{font-size:13px;font-weight:620;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.km-class-member-id{color:var(--p-text-muted-color);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.km-class-member-pri{color:var(--p-text-muted-color);font-size:11px;justify-self:end;white-space:nowrap}.km-class-empty{padding:12px;color:var(--p-text-muted-color);font-size:12px}@media(max-width:860px){.km-shell{grid-template-columns:1fr;grid-template-rows:auto minmax(0,1fr)}.km-rail{border-right:0;border-bottom:1px solid var(--p-content-border-color);max-height:40vh}.km-form-grid,.km-form-grid.four{grid-template-columns:1fr}.km-class-member{grid-template-columns:auto minmax(0,1fr) auto}.km-class-member-id{display:none}}@media(max-width:560px){.km-probe-grid{grid-template-columns:1fr}}.ks{height:100%;min-height:0;display:flex;flex-direction:column;color:var(--p-text-color);background:var(--p-content-background)}.ks-tabs{padding:0 var(--system-surface-gutter);flex:none}.ks-top-notice{margin:12px var(--system-surface-gutter)}.ks-rail-search{padding:8px 10px}.ks-rail-list{padding:0 8px 10px;overflow-y:auto}.ks-rail-group{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--p-text-muted-color);padding:10px 6px 4px}.ks-scope-row{width:100%;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;border:none;border-radius:var(--kx-radius-8);background:transparent;cursor:pointer;text-align:left;color:var(--p-text-color);transition:background .12s;font:inherit}.ks-scope-row:hover{background:var(--kx-overlay-hover)}.ks-scope-row.active{background:color-mix(in srgb,var(--p-primary-color) 14%,transparent)}.ks-scope-name{font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ks-scope-meta{flex:none;display:flex;align-items:center;gap:6px}.ks-scope-count{font-size:11px;font-weight:700;color:var(--p-text-muted-color);min-width:18px;text-align:right}.ks-builder,.ks-view{display:flex;flex-direction:column;height:100%;min-height:0;padding:16px var(--system-surface-gutter);gap:14px;overflow:auto}.ks-builder-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}.ks-builder-title{display:flex;align-items:center;gap:8px;font-size:16px;font-weight:700;color:var(--p-text-color)}.ks-builder-acts{display:flex;gap:8px;flex-wrap:wrap}.ks-fields{display:grid;grid-template-columns:220px 1fr 1fr;gap:12px}.ks-field-err{display:block;margin-top:4px;font-size:11px;color:var(--p-danger-500)}.ks-panes{flex:1;min-height:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.ks-pane{display:flex;flex-direction:column;min-height:0;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);background:var(--kx-overlay-subtle)}.ks-pane.drop{border-style:dashed}.ks-pane-head{display:flex;align-items:baseline;justify-content:space-between;gap:8px;padding:10px 12px 8px;font-size:13px;font-weight:700;color:var(--p-text-color)}.ks-pane-sub{font-size:11px;font-weight:500;color:var(--p-text-muted-color)}.ks-pane-search{padding:0 10px 8px}.ks-pane-body{flex:1;min-height:0;overflow-y:auto;padding:4px 10px 10px;display:flex;flex-direction:column;gap:8px}.ks-pane-empty{padding:16px 8px;font-size:12px;color:var(--p-text-muted-color);text-align:center}.ks-drop-hint{margin:auto;display:flex;flex-direction:column;align-items:center;gap:8px;padding:24px;color:var(--p-text-muted-color);font-size:13px;text-align:center}.ks-drop-hint svg{font-size:28px}.ks-view-note{font-size:12px;color:var(--p-text-muted-color);line-height:1.5;margin:0}.ks-view-list{border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);background:var(--kx-overlay-subtle);padding:4px 10px}.ks-pcard{display:flex;align-items:flex-start;gap:8px;padding:10px 10px 10px 6px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);background:var(--p-content-background);cursor:grab;transition:border-color .12s,box-shadow .12s,transform .08s}.ks-pcard:hover{border-color:var(--p-primary-color);box-shadow:0 1px 6px #0000000f}.ks-pcard:active{cursor:grabbing;transform:scale(.997)}.ks-pcard-grip{flex:none;margin-top:2px;color:var(--p-text-muted-color);font-size:15px}.ks-pcard-body{flex:1;min-width:0}.ks-pcard-head{display:flex;align-items:center;gap:8px}.ks-pcard-title{font-weight:600;font-size:13px;color:var(--p-text-color);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ks-pcard-comment{font-size:12px;color:var(--p-text-muted-color);margin-top:2px;line-height:1.35}.ks-pcard-act{flex:none;width:24px;height:24px;display:grid;place-items:center;border:none;border-radius:6px;cursor:pointer;background:transparent;color:var(--p-text-muted-color);transition:background .12s,color .12s}.ks-pcard-act.add:hover{background:color-mix(in srgb,var(--p-success-600) 12%,transparent);color:var(--p-success-700)}.ks-pcard-act.remove:hover{background:color-mix(in srgb,var(--p-danger-500) 12%,transparent);color:var(--p-danger-700)}.ks-pcard{flex-direction:column;align-items:stretch}.ks-pcard-row{display:flex;align-items:flex-start;gap:8px}.ks-pcard.locked{cursor:default;opacity:.9}.ks-pcard.locked:hover{border-color:var(--p-content-border-color);box-shadow:none}.ks-pcard-grip.locked,.ks-pcard-act.detail{color:var(--p-text-muted-color)}.ks-pcard-act.detail svg{transition:transform .15s}.ks-pcard-act.detail.open svg{transform:rotate(90deg)}.ks-pcard-act.detail:hover{background:var(--kx-overlay-hover);color:var(--p-text-color)}.ks-pcard-detail{margin-top:8px;padding-top:8px;border-top:1px dashed var(--p-content-border-color);display:flex;flex-direction:column;gap:5px}.ks-pcard-kv{display:flex;gap:8px;font-size:11px;align-items:flex-start}.ks-pcard-kv>span{flex:none;width:64px;color:var(--p-text-muted-color);text-transform:uppercase;font-weight:700;letter-spacing:.03em;font-size:10px;padding-top:3px}.ks-pcard-tags{display:flex;flex-wrap:wrap;gap:4px}.ks-pcard-kv code,.ks-eff-code{min-width:0;overflow-wrap:anywhere;font-family:ui-monospace,Menlo,monospace;font-size:10.5px;background:var(--kx-overlay-subtle);padding:1px 5px;border-radius:4px;color:var(--p-text-color)}.ks-pcard-none{color:var(--p-text-muted-color);font-size:11px}.ks-overlay-warn{display:flex;gap:10px;align-items:flex-start;padding:10px 12px;border-radius:var(--kx-radius-8);background:color-mix(in srgb,var(--p-warn-500) 12%,transparent);border:1px solid color-mix(in srgb,var(--p-warn-500) 40%,transparent);color:var(--p-text-color);font-size:12.5px;line-height:1.45}.ks-overlay-warn svg{flex:none;margin-top:1px;color:var(--p-warn-600);font-size:18px}.ks-panes.three{grid-template-columns:repeat(3,minmax(0,1fr))}.ks-pane.locked-pane{background:var(--kx-overlay-hover)}.ks-ext-block{margin-top:14px}.ks-ext-head{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700;color:var(--p-text-color);margin-bottom:6px}.ks-ext-head svg{color:var(--p-warn-600)}.ks-runas{flex:1;min-height:0;overflow:auto;padding:16px var(--system-surface-gutter);display:flex;flex-direction:column;gap:16px;color:var(--p-text-color)}.ks-runas>*{width:100%;max-width:860px}.ks-runas-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}.ks-runas-title{margin:0 0 6px;font-size:16px;font-weight:700}.ks-runas-lede{margin:0;max-width:640px;color:var(--p-text-muted-color);font-size:13px;line-height:1.5}.ks-runas-lede b{color:var(--p-text-color);font-weight:600}.ks-runas-acts{flex:0 0 auto;display:flex;align-items:center;gap:6px}.ks-runas-form{border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);background:var(--kx-overlay-subtle)}.ks-runas-form fieldset{border:0;margin:0;padding:0;min-width:0}.ks-runas-form-head{display:flex;align-items:center;justify-content:space-between;padding:10px 12px 10px 16px;border-bottom:1px solid var(--p-content-border-color);font-size:13px;font-weight:700}.ks-runas-form-foot{display:flex;justify-content:flex-end;gap:8px;padding:12px 16px;border-top:1px solid var(--p-content-border-color)}.ks-runas-steps{list-style:none;counter-reset:step;margin:0;padding:16px;display:flex;flex-direction:column;gap:18px}.ks-runas-steps>li{counter-increment:step;position:relative;padding-left:34px;display:flex;flex-direction:column;gap:8px}.ks-runas-steps>li:before{content:counter(step);position:absolute;left:0;top:0;width:22px;height:22px;border-radius:999px;display:grid;place-items:center;font-size:11.5px;font-weight:700;color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 14%,transparent)}.ks-runas-component-options{display:flex;flex-wrap:wrap;gap:8px 16px;margin:8px 0}.ks-runas-component-option{display:inline-flex;align-items:center;gap:8px;font-size:13px;cursor:pointer}.ks-runas-chips{display:flex;flex-wrap:wrap;gap:6px}.ks-runas-pending{display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:13px}.ks-runas-list{display:flex;flex-direction:column;gap:8px}.ks-runas-grant{display:flex;align-items:center;gap:12px;padding:12px 14px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);background:var(--p-content-background)}.ks-runas-grant-icon{flex:0 0 auto;font-size:20px;color:var(--p-primary-color)}.ks-runas-grant.revoked .ks-runas-grant-icon{color:var(--p-text-muted-color)}.ks-runas-grant-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}.ks-runas-grant-line{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px;font-size:13.5px}.ks-runas-who{font-weight:650;overflow-wrap:anywhere}.ks-runas-verb{color:var(--p-text-muted-color)}.ks-runas-grant-meta{color:var(--p-text-muted-color);font-size:12px;overflow-wrap:anywhere}.ks-runas-grant-meta code{font-family:ui-monospace,Menlo,monospace;font-size:11px;padding:1px 5px;border-radius:4px;background:var(--kx-overlay-subtle)}.ks-runas-grant-meta b{color:var(--p-text-color);font-weight:600}.ks-runas-empty{display:flex;flex-direction:column;align-items:center;gap:8px;padding:40px 16px;text-align:center;border:1px dashed var(--p-content-border-color);border-radius:var(--kx-radius-10);color:var(--p-text-muted-color);font-size:13px}.ks-runas-empty>svg{font-size:28px}.ks-runas-empty b{color:var(--p-text-color)}@media(max-width:640px){.ks-runas{padding:16px}.ks-runas-head{flex-direction:column}.ks-runas-grant{flex-wrap:wrap}}@media(max-width:1100px){.ks-fields{grid-template-columns:1fr}.ks-panes,.ks-panes.three{flex:none;grid-template-columns:1fr}.ks-pane{min-height:180px}.ks-pane-body{max-height:360px}.ks-pane-head{flex-wrap:wrap}}', yc = { props: { type: "object", properties: {} } }, kc = {
  wippy: yc
};
class xc extends Bo {
  static get wippyConfig() {
    return {
      propsSchema: kc.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: gc
    };
  }
  static get vueConfig() {
    return { rootComponent: vc, plugins: [$i] };
  }
}
lo(import.meta.url, xc);
//# sourceMappingURL=index.js.map
