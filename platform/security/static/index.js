import { hasInjectionContext as Dr, inject as Mn, effectScope as Mr, ref as R, markRaw as Ur, onMounted as Ut, onUnmounted as Wr, watch as Pe, createApp as Fr, readonly as Hr, getCurrentInstance as Pt, nextTick as Wt, reactive as Kr, renderSlot as Y, openBlock as b, createBlock as V, Teleport as Un, createCommentVNode as P, useId as qr, mergeProps as B, h as Yr, resolveDirective as Ft, withDirectives as ze, resolveDynamicComponent as Qe, withCtx as z, normalizeClass as re, createElementBlock as k, createElementVNode as h, defineComponent as te, createTextVNode as F, toDisplayString as T, resolveComponent as Xt, computed as G, unref as g, createVNode as L, onBeforeUnmount as Gr, Fragment as fe, renderList as me, vModelCheckbox as Qr, withModifiers as Ke, vShow as en } from "vue";
import { addCollection as Zr, Icon as Q } from "@iconify/vue";
import { config as tn, addIcons as Jr, on as Xr, applyThemeMode as ft, host as Wn, hostCss as eo, loadCss as to, loadByTagName as no, api as Ee, define as ro } from "@wippy-fe/proxy";
var Ot = "data-wippy-visible";
function nn(e) {
  const t = e.getAttribute(Ot);
  return t === "true" ? !0 : t === "false" ? !1 : null;
}
var oo = Object.defineProperty, ao = (e, t, n) => t in e ? oo(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, K = (e, t, n) => ao(e, typeof t != "symbol" ? t + "" : t, n), io = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], so = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function rn(e) {
  const t = e.startsWith("--") ? e : `--${e}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(t) ? t : null;
}
function lo(...e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of e)
    if (n)
      for (const [r, o] of Object.entries(n)) {
        if ((r === "@light" || r === "@dark") && o && typeof o == "object") {
          for (const [s, c] of Object.entries(o)) {
            const i = typeof c == "string" ? rn(s) : null;
            i && t.add(i);
          }
          continue;
        }
        const a = typeof o == "string" ? rn(r) : null;
        a && t.add(a);
      }
  return [...t].sort();
}
function co(e) {
  if (e.length === 0)
    return "";
  const t = e.map((n) => `  ${n}: inherit;`).join(`
`);
  return `${so} {
${t}
}`;
}
function uo(e, t) {
  const n = co(t);
  n && Fn(e, n, "@wippy-fe/css-variables-bridge");
}
function po(e, t) {
  const r = (t ?? io).map(async (o) => {
    const a = eo[o];
    if (!a)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${o}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await to(a);
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
function fo(e, t) {
  const n = document.createElement("style");
  n.textContent = t, e.appendChild(n);
}
function Fn(e, t, n) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const o = new CSSStyleSheet();
    o.replaceSync(t), e.adoptedStyleSheets = [...e.adoptedStyleSheets, o];
    return;
  }
  const r = document.createElement("style");
  r.setAttribute("role", n), r.textContent = t, e.appendChild(r);
}
function mo(e, t) {
  Fn(e, t, "@wippy-fe/custom-css");
}
function Hn(e) {
  return e.__wippyHost ?? null;
}
function bo(e) {
  return e.replace(/-([a-z])/g, (t, n) => n.toUpperCase());
}
function vo(e, t, n) {
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
function St(e, t) {
  const n = {}, r = [];
  for (const [o, a] of Object.entries(t.properties)) {
    const s = e.getAttribute(o), c = bo(o);
    if (s === null) {
      a.default !== void 0 && (n[c] = a.default);
      continue;
    }
    const i = vo(o, s, a);
    i.error ? r.push(i.error) : n[c] = i.value;
  }
  return { props: n, errors: r };
}
var ho = class {
  constructor(e, t) {
    K(this, "_props"), K(this, "_errors"), K(this, "_content"), K(this, "_hostVisibility"), K(this, "_propsListeners", /* @__PURE__ */ new Set()), K(this, "_contentListeners", /* @__PURE__ */ new Set()), K(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), K(this, "_disposed", !1), K(this, "_emitToDom"), K(this, "props"), K(this, "events"), K(this, "content"), K(this, "hostVisibility"), this._props = e.props, this._errors = e.errors, this._content = e.content, this._hostVisibility = e.hostVisibility, this._emitToDom = t;
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
}, go = class extends HTMLElement {
  constructor() {
    super(), K(this, "_internals"), K(this, "_contentObserver", null), K(this, "_initialized", !1), K(this, "_container", null), K(this, "_reactive", null), K(this, "_lastProps", null), K(this, "_lastErrors", []), K(this, "_lastContent", null), K(this, "_themeUnsub", null), K(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = nn(this);
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
    return [.../* @__PURE__ */ new Set([...t, ...n, Ot])];
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
    return Hn(this);
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
        const a = St(this, e.propsSchema);
        e.validateProps && a.errors.push(...e.validateProps(a.props)), n = a.props, r = a.errors, this._lastProps = n, this._lastErrors = r;
      }
      const o = t ? this._lastContent ?? this._extractContent(e.contentTemplate) : null;
      t && this._lastContent === null && (this._lastContent = o), this._reactive = new ho(
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
        this.onInit(n), e.inlineCss && fo(n, e.inlineCss);
        try {
          const d = tn?.theming, l = lo(
            d?.global?.cssVariables,
            d?.children?.cssVariables
          );
          uo(n, l);
        } catch {
        }
        if (e.customCss !== !1)
          try {
            const d = tn?.theming, l = [d?.global?.customCSS, d?.children?.customCSS].filter(Boolean).join(`
`);
            l && mo(n, l);
          } catch {
          }
        (e.hostCssKeys === void 0 || e.hostCssKeys.length > 0) && po(n, e.hostCssKeys), r = document.createElement("div"), r.setAttribute("data-wippy-theme-root", "");
        const i = e.containerClasses ?? [];
        i.length > 0 && r.classList.add(...i), n.appendChild(r), this._container = r, Jr(Zr);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = Xr("@theme", (i) => this._applyTheme(i)));
      const { props: o, errors: a } = St(this, e.propsSchema);
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
  _applyTheme(e = Wn.getThemeMode?.()) {
    ft(e, this), this._container && ft(e, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), ft("auto", this), this._container && ft("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(e, t, n) {
    if (t === n)
      return;
    if (e === Ot) {
      const c = this._hostVisible, i = nn(this);
      if (i === c)
        return;
      this._hostVisible = i, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(i, c), this.onHostVisibilityChanged(i, c));
      return;
    }
    const r = this.constructor.wippyConfig, { props: o, errors: a } = St(this, r.propsSchema);
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
function yo(e) {
  return e.__wippyHostBus ?? null;
}
function xo(e) {
  return e.dataset.wippyPanelId ?? null;
}
/*!
 * pinia v4.0.3
 * (c) 2026 Eduardo San Martin Morote
 * @license MIT
 */
let Kn;
const qn = (e) => Kn = e, ko = () => Dr() && Mn(Yn) || Kn, Yn = (
  /* istanbul ignore next */
  Symbol()
);
function wo() {
  const e = Mr(!0), t = e.run(() => R({}));
  let n = [], r = [];
  const o = Ur({
    install(a) {
      qn(o), o._a = a, a.provide(Yn, o), a.config.globalProperties.$pinia = o, r.forEach((s) => n.push(s)), r = [];
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
var So = Object.defineProperty, _o = (e, t, n) => t in e ? So(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, Ve = (e, t, n) => _o(e, typeof t != "symbol" ? t + "" : t, n), $o = /* @__PURE__ */ Symbol("wippy:emit"), Co = /* @__PURE__ */ Symbol("wippy:props"), To = /* @__PURE__ */ Symbol("wippy:props_error"), Po = /* @__PURE__ */ Symbol("wippy:content"), Oo = /* @__PURE__ */ Symbol("wippy:panel-id"), Ao = /* @__PURE__ */ Symbol("wippy:layout-bus"), Lo = /* @__PURE__ */ Symbol("wippy:host"), Gn = /* @__PURE__ */ Symbol("wippy:host-visibility");
function Eo() {
  const e = Mn(Gn);
  if (!e)
    throw new Error("useHostVisibility() must be called inside a WippyVueElement");
  return e;
}
function No(e) {
  const t = Eo();
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
  return Ut(() => (n = !0, a())), Wr(() => {
    n = !1, o = !1;
  }), Pe(t, (s, c) => {
    if (n && c === !1 && s === !0)
      return a();
  }), t;
}
var jo = class extends go {
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
      const l = ko(), u = Fr(d.rootComponent);
      this._vueApp = u;
      const p = wo();
      if (d.piniaPlugins)
        for (const f of d.piniaPlugins)
          p.use(f);
      if (u.use(p), d.plugins)
        for (const f of d.plugins)
          u.use(f);
      u.provide(Co, this._propsRef), u.provide(To, this._errorsRef), u.provide($o, this.emitEvent.bind(this)), u.provide(Po, this._contentRef), u.provide(Gn, this._hostVisibilityRef), u.provide(Oo, xo(this)), u.provide(Ao, yo(this)), u.provide(Lo, Hn(this)), d.providers && d.providers(u, this), u.mount(t), l && qn(l);
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
}, Io = Object.defineProperty, on = Object.getOwnPropertySymbols, zo = Object.prototype.hasOwnProperty, Ro = Object.prototype.propertyIsEnumerable, an = (e, t, n) => t in e ? Io(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, Vo = (e, t) => {
  for (var n in t || (t = {})) zo.call(t, n) && an(e, n, t[n]);
  if (on) for (var n of on(t)) Ro.call(t, n) && an(e, n, t[n]);
  return e;
};
function Re(e) {
  return e == null || e === "" || Array.isArray(e) && e.length === 0 || !(e instanceof Date) && typeof e == "object" && Object.keys(e).length === 0;
}
function At(e, t, n = /* @__PURE__ */ new WeakSet()) {
  if (e === t) return !0;
  if (!e || !t || typeof e != "object" || typeof t != "object" || n.has(e) || n.has(t)) return !1;
  n.add(e).add(t);
  let r = Array.isArray(e), o = Array.isArray(t), a, s, c;
  if (r && o) {
    if (s = e.length, s != t.length) return !1;
    for (a = s; a-- !== 0; ) if (!At(e[a], t[a], n)) return !1;
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
  for (a = s; a-- !== 0; ) if (c = p[a], !At(e[c], t[c], n)) return !1;
  return !0;
}
function Bo(e, t) {
  return At(e, t);
}
function Ht(e) {
  return typeof e == "function" && "call" in e && "apply" in e;
}
function H(e) {
  return !Re(e);
}
function sn(e, t) {
  return null;
}
function Do(e, t, n) {
  return n ? sn() === sn() : Bo(e, t);
}
function ke(e, t = !0) {
  return e instanceof Object && e.constructor === Object && (t || Object.keys(e).length !== 0);
}
function Qn(e = {}, t = {}) {
  let n = Vo({}, e);
  return Object.keys(t).forEach((r) => {
    let o = r;
    ke(t[o]) && o in e && ke(e[o]) ? n[o] = Qn(e[o], t[o]) : n[o] = t[o];
  }), n;
}
function Mo(...e) {
  return e.reduce((t, n, r) => r === 0 ? n : Qn(t, n), {});
}
function se(e, ...t) {
  return Ht(e) ? e(...t) : e;
}
function oe(e, t = !0) {
  return typeof e == "string" && (t || e !== "");
}
function xe(e) {
  return oe(e) ? e.replace(/(-|_)/g, "").toLowerCase() : e;
}
function Kt(e, t = "", n = {}) {
  let r = xe(t).split("."), o = r.shift();
  if (o) {
    if (ke(e)) {
      let a = Object.keys(e).find((s) => xe(s) === o) || "";
      return Kt(se(e[a], n), r.join("."), n);
    }
    return;
  }
  return se(e, n);
}
function Zn(e, t = !0) {
  return Array.isArray(e) && (t || e.length !== 0);
}
function Uo(e) {
  return H(e) && !isNaN(e);
}
function je(e, t) {
  if (t) {
    let n = t.test(e);
    return t.lastIndex = 0, n;
  }
  return !1;
}
function Wo(...e) {
  return Mo(...e);
}
function qe(e) {
  return e && e.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function Fo(e) {
  return oe(e, !1) ? e[0].toUpperCase() + e.slice(1) : e;
}
function Jn(e) {
  return oe(e) ? e.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : e;
}
function Xn() {
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
function Ae(...e) {
  if (e) {
    let t = [];
    for (let n = 0; n < e.length; n++) {
      let r = e[n];
      if (!r) continue;
      let o = typeof r;
      if (o === "string" || o === "number") t.push(r);
      else if (o === "object") {
        let a = Array.isArray(r) ? [Ae(...r)] : Object.entries(r).map(([s, c]) => c ? s : void 0);
        t = a.length ? t.concat(a.filter((s) => !!s)) : t;
      }
    }
    return t.join(" ").trim();
  }
}
function Ho(e, t) {
  return e ? e.classList ? e.classList.contains(t) : new RegExp("(^| )" + t + "( |$)", "gi").test(e.className) : !1;
}
function Ko(e, t) {
  if (e && t) {
    let n = (r) => {
      Ho(e, r) || (e.classList ? e.classList.add(r) : e.className += " " + r);
    };
    [t].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function _t(e, t) {
  if (e && t) {
    let n = (r) => {
      e.classList ? e.classList.remove(r) : e.className = e.className.replace(new RegExp("(^|\\b)" + r.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [t].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function ln(e) {
  return e ? Math.abs(e.scrollLeft) : 0;
}
function cn(e) {
  return e ? getComputedStyle(e).direction === "rtl" : !1;
}
function er(e, t) {
  return e instanceof HTMLElement ? e.offsetWidth : 0;
}
function qo(e) {
  if (e) {
    let t = e.parentNode;
    return t && t instanceof ShadowRoot && t.host && (t = t.host), t;
  }
  return null;
}
function Yo(e) {
  return !!(e !== null && typeof e < "u" && e.nodeName && qo(e));
}
function dt(e) {
  return typeof Element < "u" ? e instanceof Element : e !== null && typeof e == "object" && e.nodeType === 1 && typeof e.nodeName == "string";
}
function gt(e, t = {}) {
  if (dt(e)) {
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
        a ? e.addEventListener(a[1].toLowerCase(), o) : r === "p-bind" || r === "pBind" ? gt(e, o) : (o = r === "class" ? [...new Set(n("class", o))].join(" ").trim() : r === "style" ? n("style", o).join(";").trim() : o, (e.$attrs = e.$attrs || {}) && (e.$attrs[r] = o), e.setAttribute(r, o));
      }
    });
  }
}
function Go(e, t = {}, ...n) {
  {
    let r = document.createElement(e);
    return gt(r, t), r.append(...n), r;
  }
}
function Ze(e, t) {
  return dt(e) ? e.matches(t) ? e : e.querySelector(t) : null;
}
function Qo(e, t) {
  e && document.activeElement !== e && e.focus(t);
}
function Ue(e, t) {
  if (dt(e)) {
    let n = e.getAttribute(t);
    return isNaN(n) ? n === "true" || n === "false" ? n === "true" : n : +n;
  }
}
function Lt(e) {
  if (e) {
    let t = e.offsetHeight, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingTop) + parseFloat(n.paddingBottom) + parseFloat(n.borderTopWidth) + parseFloat(n.borderBottomWidth), t;
  }
  return 0;
}
function We(e) {
  if (e) {
    let t = e.getBoundingClientRect();
    return { top: t.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: t.left + (window.pageXOffset || ln(document.documentElement) || ln(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function tr(e, t) {
  return e ? e.offsetHeight : 0;
}
function Ye(e) {
  if (e) {
    let t = e.offsetWidth, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingLeft) + parseFloat(n.paddingRight) + parseFloat(n.borderLeftWidth) + parseFloat(n.borderRightWidth), t;
  }
  return 0;
}
function nr() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function Zo(e, t = "", n) {
  dt(e) && n !== null && n !== void 0 && e.setAttribute(t, n);
}
var mt = {};
function Jo(e = "pui_id_") {
  return Object.hasOwn(mt, e) || (mt[e] = 0), mt[e]++, `${e}${mt[e]}`;
}
var Xo = Object.defineProperty, ea = Object.defineProperties, ta = Object.getOwnPropertyDescriptors, yt = Object.getOwnPropertySymbols, rr = Object.prototype.hasOwnProperty, or = Object.prototype.propertyIsEnumerable, dn = (e, t, n) => t in e ? Xo(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, be = (e, t) => {
  for (var n in t || (t = {})) rr.call(t, n) && dn(e, n, t[n]);
  if (yt) for (var n of yt(t)) or.call(t, n) && dn(e, n, t[n]);
  return e;
}, $t = (e, t) => ea(e, ta(t)), $e = (e, t) => {
  var n = {};
  for (var r in e) rr.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
  if (e != null && yt) for (var r of yt(e)) t.indexOf(r) < 0 && or.call(e, r) && (n[r] = e[r]);
  return n;
}, na = Xn(), Z = na, Je = /{([^}]*)}/g, ar = /(\d+\s+[\+\-\*\/]\s+\d+)/g, ir = /var\([^)]+\)/g;
function un(e) {
  return oe(e) ? e.replace(/[A-Z]/g, (t, n) => n === 0 ? t : "." + t.toLowerCase()).toLowerCase() : e;
}
function ra(e) {
  return ke(e) && e.hasOwnProperty("$value") && e.hasOwnProperty("$type") ? e.$value : e;
}
function oa(e) {
  return e.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function Et(e = "", t = "") {
  return oa(`${oe(e, !1) && oe(t, !1) ? `${e}-` : e}${t}`);
}
function sr(e = "", t = "") {
  return `--${Et(e, t)}`;
}
function aa(e = "") {
  let t = (e.match(/{/g) || []).length, n = (e.match(/}/g) || []).length;
  return (t + n) % 2 !== 0;
}
function lr(e, t = "", n = "", r = [], o) {
  if (oe(e)) {
    let a = e.trim();
    if (aa(a)) return;
    if (je(a, Je)) {
      let s = a.replaceAll(Je, (c) => {
        let i = c.replace(/{|}/g, "").split(".").filter((d) => !r.some((l) => je(d, l)));
        return `var(${sr(n, Jn(i.join("-")))}${H(o) ? `, ${o}` : ""})`;
      });
      return je(s.replace(ir, "0"), ar) ? `calc(${s})` : s;
    }
    return a;
  } else if (Uo(e)) return e;
}
function ia(e, t, n) {
  oe(t, !1) && e.push(`${t}:${n};`);
}
function Be(e, t) {
  return e ? `${e}{${t}}` : "";
}
function cr(e, t) {
  if (e.indexOf("dt(") === -1) return e;
  function n(s, c) {
    let i = [], d = 0, l = "", u = null, p = 0;
    for (; d <= s.length; ) {
      let f = s[d];
      if ((f === '"' || f === "'" || f === "`") && s[d - 1] !== "\\" && (u = u === f ? null : f), !u && (f === "(" && p++, f === ")" && p--, (f === "," || d === s.length) && p === 0)) {
        let S = l.trim();
        S.startsWith("dt(") ? i.push(cr(S, c)) : i.push(r(S)), l = "", d++;
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
var Ie = (...e) => sa(U.getTheme(), ...e), sa = (e = {}, t, n, r) => {
  if (t) {
    let { variable: o, options: a } = U.defaults || {}, { prefix: s, transform: c } = e?.options || a || {}, i = je(t, Je) ? t : `{${t}}`;
    return r === "value" || Re(r) && c === "strict" ? U.getTokenValue(t) : lr(i, void 0, s, [o.excludedKeyRegex], n);
  }
  return "";
};
function bt(e, ...t) {
  if (e instanceof Array) {
    let n = e.reduce((r, o, a) => {
      var s;
      return r + o + ((s = se(t[a], { dt: Ie })) != null ? s : "");
    }, "");
    return cr(n, Ie);
  }
  return se(e, { dt: Ie });
}
function la(e, t = {}) {
  let n = U.defaults.variable, { prefix: r = n.prefix, selector: o = n.selector, excludedKeyRegex: a = n.excludedKeyRegex } = t, s = [], c = [], i = [{ node: e, path: r }];
  for (; i.length; ) {
    let { node: l, path: u } = i.pop();
    for (let p in l) {
      let f = l[p], S = ra(f), $ = je(p, a) ? Et(u) : Et(u, Jn(p));
      if (ke(S)) i.push({ node: S, path: $ });
      else {
        let _ = sr($), C = lr(S, $, r, [a]);
        ia(c, _, C);
        let O = $;
        r && O.startsWith(r + "-") && (O = O.slice(r.length + 1)), s.push(O.replace(/-/g, "."));
      }
    }
  }
  let d = c.join("");
  return { value: c, tokens: s, declarations: d, css: Be(o, d) };
}
var pe = { regex: { rules: { class: { pattern: /^\.([a-zA-Z][\w-]*)$/, resolve(e) {
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
  return la(e, { prefix: t?.prefix });
}, getCommon({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var a, s, c, i, d, l, u;
  let { preset: p, options: f } = t, S, $, _, C, O, A, v;
  if (H(p) && f.transform !== "strict") {
    let { primitive: m, semantic: j, extend: N } = p, W = j || {}, { colorScheme: ae } = W, q = $e(W, ["colorScheme"]), ce = N || {}, { colorScheme: we } = ce, Se = $e(ce, ["colorScheme"]), he = ae || {}, { dark: de } = he, _e = $e(he, ["dark"]), ie = we || {}, { dark: ge } = ie, Ce = $e(ie, ["dark"]), ue = H(m) ? this._toVariables({ primitive: m }, f) : {}, le = H(q) ? this._toVariables({ semantic: q }, f) : {}, J = H(_e) ? this._toVariables({ light: _e }, f) : {}, w = H(de) ? this._toVariables({ dark: de }, f) : {}, y = H(Se) ? this._toVariables({ semantic: Se }, f) : {}, x = H(Ce) ? this._toVariables({ light: Ce }, f) : {}, ee = H(ge) ? this._toVariables({ dark: ge }, f) : {}, [ut, pt] = [(a = ue.declarations) != null ? a : "", ue.tokens], [_r, $r] = [(s = le.declarations) != null ? s : "", le.tokens || []], [Cr, Tr] = [(c = J.declarations) != null ? c : "", J.tokens || []], [Pr, Or] = [(i = w.declarations) != null ? i : "", w.tokens || []], [Ar, Lr] = [(d = y.declarations) != null ? d : "", y.tokens || []], [Er, Nr] = [(l = x.declarations) != null ? l : "", x.tokens || []], [jr, Ir] = [(u = ee.declarations) != null ? u : "", ee.tokens || []];
    S = this.transformCSS(e, ut, "light", "variable", f, r, o), $ = pt;
    let zr = this.transformCSS(e, `${_r}${Cr}`, "light", "variable", f, r, o), Rr = this.transformCSS(e, `${Pr}`, "dark", "variable", f, r, o);
    _ = `${zr}${Rr}`, C = [.../* @__PURE__ */ new Set([...$r, ...Tr, ...Or])];
    let Vr = this.transformCSS(e, `${Ar}${Er}color-scheme:light`, "light", "variable", f, r, o), Br = this.transformCSS(e, `${jr}color-scheme:dark`, "dark", "variable", f, r, o);
    O = `${Vr}${Br}`, A = [.../* @__PURE__ */ new Set([...Lr, ...Nr, ...Ir])], v = se(p.css, { dt: Ie });
  }
  return { primitive: { css: S, tokens: $ }, semantic: { css: _, tokens: C }, global: { css: O, tokens: A }, style: v };
}, getPreset({ name: e = "", preset: t = {}, options: n, params: r, set: o, defaults: a, selector: s }) {
  var c, i, d;
  let l, u, p;
  if (H(t) && n.transform !== "strict") {
    let f = e.replace("-directive", ""), S = t, { colorScheme: $, extend: _, css: C } = S, O = $e(S, ["colorScheme", "extend", "css"]), A = _ || {}, { colorScheme: v } = A, m = $e(A, ["colorScheme"]), j = $ || {}, { dark: N } = j, W = $e(j, ["dark"]), ae = v || {}, { dark: q } = ae, ce = $e(ae, ["dark"]), we = H(O) ? this._toVariables({ [f]: be(be({}, O), m) }, n) : {}, Se = H(W) ? this._toVariables({ [f]: be(be({}, W), ce) }, n) : {}, he = H(N) ? this._toVariables({ [f]: be(be({}, N), q) }, n) : {}, [de, _e] = [(c = we.declarations) != null ? c : "", we.tokens || []], [ie, ge] = [(i = Se.declarations) != null ? i : "", Se.tokens || []], [Ce, ue] = [(d = he.declarations) != null ? d : "", he.tokens || []], le = this.transformCSS(f, `${de}${ie}`, "light", "variable", n, o, a, s), J = this.transformCSS(f, Ce, "dark", "variable", n, o, a, s);
    l = `${le}${J}`, u = [.../* @__PURE__ */ new Set([..._e, ...ge, ...ue])], p = se(C, { dt: Ie });
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
  return o ? `@layer ${se(o.order || o.name || "primeui", n)}` : "";
}, getCommonStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: o, defaults: a }) {
  let s = this.getCommon({ name: e, theme: t, params: n, set: o, defaults: a }), c = Object.entries(r).reduce((i, [d, l]) => i.push(`${d}="${l}"`) && i, []).join(" ");
  return Object.entries(s || {}).reduce((i, [d, l]) => {
    if (ke(l) && Object.hasOwn(l, "css")) {
      let u = qe(l.css), p = `${d}-variables`;
      i.push(`<style type="text/css" data-primevue-style-id="${p}" ${c}>${u}</style>`);
    }
    return i;
  }, []).join("");
}, getStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: o, defaults: a }) {
  var s;
  let c = { name: e, theme: t, params: n, set: o, defaults: a }, i = (s = e.includes("-directive") ? this.getPresetD(c) : this.getPresetC(c)) == null ? void 0 : s.css, d = Object.entries(r).reduce((l, [u, p]) => l.push(`${u}="${p}"`) && l, []).join(" ");
  return i ? `<style type="text/css" data-primevue-style-id="${e}-variables" ${d}>${qe(i)}</style>` : "";
}, createTokens(e = {}, t, n = "", r = "", o = {}) {
  let a = function(c, i = {}, d = []) {
    if (d.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: c, path: this.path, paths: i, value: void 0 };
    d.push(this.path), i.name = this.path, i.binding || (i.binding = {});
    let l = this.value;
    if (typeof this.value == "string" && Je.test(this.value)) {
      let u = this.value.trim().replace(Je, (p) => {
        var f;
        let S = p.slice(1, -1), $ = this.tokens[S];
        if (!$) return console.warn(`Token not found for path: ${S}`), "__UNRESOLVED__";
        let _ = $.computed(c, i, d);
        return Array.isArray(_) && _.length === 2 ? `light-dark(${_[0].value},${_[1].value})` : (f = _?.value) != null ? f : "__UNRESOLVED__";
      });
      l = ar.test(u.replace(ir, "0")) ? `calc(${u})` : u;
    }
    return Re(i.binding) && delete i.binding, d.pop(), { colorScheme: c, path: this.path, paths: i, value: l.includes("__UNRESOLVED__") ? void 0 : l };
  }, s = (c, i, d) => {
    Object.entries(c).forEach(([l, u]) => {
      let p = je(l, t.variable.excludedKeyRegex) ? i : i ? `${i}.${un(l)}` : un(l), f = d ? `${d}.${l}` : l;
      ke(u) ? s(u, p, f) : (o[p] || (o[p] = { paths: [], computed: (S, $ = {}, _ = []) => {
        if (o[p].paths.length === 1) return o[p].paths[0].computed(o[p].paths[0].scheme, $.binding, _);
        if (S && S !== "none") for (let C = 0; C < o[p].paths.length; C++) {
          let O = o[p].paths[C];
          if (O.scheme === S) return O.computed(S, $.binding, _);
        }
        return o[p].paths.map((C) => C.computed(C.scheme, $[C.scheme], _));
      } }), o[p].paths.push({ path: f, value: u, scheme: f.includes("colorScheme.light") ? "light" : f.includes("colorScheme.dark") ? "dark" : "none", computed: a, tokens: o }));
    });
  };
  return s(e, n, r), o;
}, getTokenValue(e, t, n) {
  var r;
  let o = ((c) => c.split(".").filter((i) => !je(i.toLowerCase(), n.variable.excludedKeyRegex)).join("."))(t), a = t.includes("colorScheme.light") ? "light" : t.includes("colorScheme.dark") ? "dark" : void 0, s = [(r = e[o]) == null ? void 0 : r.computed(a)].flat().filter((c) => c);
  return s.length === 1 ? s[0].value : s.reduce((c = {}, i) => {
    let d = i, { colorScheme: l } = d, u = $e(d, ["colorScheme"]);
    return c[l] = u, c;
  }, void 0);
}, getSelectorRule(e, t, n, r) {
  return n === "class" || n === "attr" ? Be(H(t) ? `${e}${t},${e} ${t}` : e, r) : Be(e, Be(t ?? ":root,:host", r));
}, transformCSS(e, t, n, r, o = {}, a, s, c) {
  if (H(t)) {
    let { cssLayer: i } = o;
    if (r !== "style") {
      let d = this.getColorSchemeOption(o, s);
      t = n === "dark" ? d.reduce((l, { type: u, selector: p }) => (H(p) && (l += p.includes("[CSS]") ? p.replace("[CSS]", t) : this.getSelectorRule(p, c, u, t)), l), "") : Be(c ?? ":root,:host", t);
    }
    if (i) {
      let d = { name: "primeui" };
      ke(i) && (d.name = se(i.name, { name: e, type: r })), H(d.name) && (t = Be(`@layer ${d.name}`, t), a?.layerNames(d.name));
    }
    return t;
  }
  return "";
} }, U = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(e = {}) {
  let { theme: t } = e;
  t && (this._theme = $t(be({}, t), { options: be(be({}, this.defaults.options), t.options) }), this._tokens = pe.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
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
  this.update({ theme: e }), Z.emit("theme:change", e);
}, getPreset() {
  return this.preset;
}, setPreset(e) {
  this._theme = $t(be({}, this.theme), { preset: e }), this._tokens = pe.createTokens(e, this.defaults), this.clearLoadedStyleNames(), Z.emit("preset:change", e), Z.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(e) {
  this._theme = $t(be({}, this.theme), { options: e }), this.clearLoadedStyleNames(), Z.emit("options:change", e), Z.emit("theme:change", this.theme);
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
  return pe.getTokenValue(this.tokens, e, this.defaults);
}, getCommon(e = "", t) {
  return pe.getCommon({ name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getComponent(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return pe.getPresetC(n);
}, getDirective(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return pe.getPresetD(n);
}, getCustomPreset(e = "", t, n, r) {
  let o = { name: e, preset: t, options: this.options, selector: n, params: r, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return pe.getPreset(o);
}, getLayerOrderCSS(e = "") {
  return pe.getLayerOrder(e, this.options, { names: this.getLayerNames() }, this.defaults);
}, transformCSS(e = "", t, n = "style", r) {
  return pe.transformCSS(e, t, r, n, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
}, getCommonStyleSheet(e = "", t, n = {}) {
  return pe.getCommonStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getStyleSheet(e, t, n = {}) {
  return pe.getStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, onStyleMounted(e) {
  this._loadingStyles.add(e);
}, onStyleUpdated(e) {
  this._loadingStyles.add(e);
}, onStyleLoaded(e, { name: t }) {
  this._loadingStyles.size && (this._loadingStyles.delete(t), Z.emit(`theme:${t}:load`, e), !this._loadingStyles.size && Z.emit("theme:load"));
} }, X = {
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
}, ca = `
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
function fn(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? pn(Object(n), !0).forEach(function(r) {
      da(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : pn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function da(e, t, n) {
  return (t = ua(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ua(e) {
  var t = pa(e, "string");
  return Xe(t) == "symbol" ? t : t + "";
}
function pa(e, t) {
  if (Xe(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Xe(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function fa(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  Pt() && Pt().components ? Ut(e) : t ? e() : Wt(e);
}
var ma = 0;
function ba(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = R(!1), r = R(e), o = R(null), a = nr() ? window.document : void 0, s = t.document, c = s === void 0 ? a : s, i = t.immediate, d = i === void 0 ? !0 : i, l = t.manual, u = l === void 0 ? !1 : l, p = t.name, f = p === void 0 ? "style_".concat(++ma) : p, S = t.id, $ = S === void 0 ? void 0 : S, _ = t.media, C = _ === void 0 ? void 0 : _, O = t.nonce, A = O === void 0 ? void 0 : O, v = t.first, m = v === void 0 ? !1 : v, j = t.onMounted, N = j === void 0 ? void 0 : j, W = t.onUpdated, ae = W === void 0 ? void 0 : W, q = t.onLoad, ce = q === void 0 ? void 0 : q, we = t.props, Se = we === void 0 ? {} : we, he = function() {
  }, de = function(ge) {
    var Ce = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (c) {
      var ue = fn(fn({}, Se), Ce), le = ue.name || f, J = ue.id || $, w = ue.nonce || A;
      o.value = c.querySelector('style[data-primevue-style-id="'.concat(le, '"]')) || c.getElementById(J) || c.createElement("style"), o.value.isConnected || (r.value = ge || e, gt(o.value, {
        type: "text/css",
        id: J,
        media: C,
        nonce: w
      }), m ? c.head.prepend(o.value) : c.head.appendChild(o.value), Zo(o.value, "data-primevue-style-id", le), gt(o.value, ue), o.value.onload = function(y) {
        return ce?.(y, {
          name: le
        });
      }, N?.(le)), !n.value && (he = Pe(r, function(y) {
        o.value.textContent = y, ae?.(le);
      }, {
        immediate: !0
      }), n.value = !0);
    }
  }, _e = function() {
    !c || !n.value || (he(), Yo(o.value) && c.head.removeChild(o.value), n.value = !1, o.value = null);
  };
  return d && !u && fa(de), {
    id: $,
    name: f,
    el: o,
    css: r,
    unload: _e,
    load: de,
    isLoaded: Hr(n)
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
var mn, bn, vn, hn;
function gn(e, t) {
  return ya(e) || ga(e, t) || ha(e, t) || va();
}
function va() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ha(e, t) {
  if (e) {
    if (typeof e == "string") return yn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? yn(e, t) : void 0;
  }
}
function yn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function ga(e, t) {
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
function ya(e) {
  if (Array.isArray(e)) return e;
}
function xn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Ct(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? xn(Object(n), !0).forEach(function(r) {
      xa(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : xn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function xa(e, t, n) {
  return (t = ka(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ka(e) {
  var t = wa(e, "string");
  return et(t) == "symbol" ? t : t + "";
}
function wa(e, t) {
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
var Sa = function(t) {
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
}, _a = {}, $a = {}, M = {
  name: "base",
  css: Sa,
  style: ca,
  classes: _a,
  inlineStyles: $a,
  load: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(a) {
      return a;
    }, o = r(bt(mn || (mn = vt(["", ""])), t));
    return H(o) ? ba(qe(o), Ct({
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
      return U.transformCSS(n.name || t.name, "".concat(o).concat(bt(bn || (bn = vt(["", ""])), r)));
    });
  },
  getCommonTheme: function(t) {
    return U.getCommon(this.name, t);
  },
  getComponentTheme: function(t) {
    return U.getComponent(this.name, t);
  },
  getDirectiveTheme: function(t) {
    return U.getDirective(this.name, t);
  },
  getPresetTheme: function(t, n, r) {
    return U.getCustomPreset(this.name, t, n, r);
  },
  getLayerOrderThemeCSS: function() {
    return U.getLayerOrderCSS(this.name);
  },
  getStyleSheet: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.css) {
      var r = se(this.css, {
        dt: Ie
      }) || "", o = qe(bt(vn || (vn = vt(["", "", ""])), r, t)), a = Object.entries(n).reduce(function(s, c) {
        var i = gn(c, 2), d = i[0], l = i[1];
        return s.push("".concat(d, '="').concat(l, '"')) && s;
      }, []).join(" ");
      return H(o) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(a, ">").concat(o, "</style>") : "";
    }
    return "";
  },
  getCommonThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return U.getCommonStyleSheet(this.name, t, n);
  },
  getThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = [U.getStyleSheet(this.name, t, n)];
    if (this.style) {
      var o = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), a = bt(hn || (hn = vt(["", ""])), se(this.style, {
        dt: Ie
      })), s = qe(U.transformCSS(o, a)), c = Object.entries(n).reduce(function(i, d) {
        var l = gn(d, 2), u = l[0], p = l[1];
        return i.push("".concat(u, '="').concat(p, '"')) && i;
      }, []).join(" ");
      H(s) && r.push('<style type="text/css" data-primevue-style-id="'.concat(o, '" ').concat(c, ">").concat(s, "</style>"));
    }
    return r.join("");
  },
  extend: function(t) {
    return Ct(Ct({}, this), {}, {
      css: void 0,
      style: void 0
    }, t);
  }
}, Oe = Xn();
function tt(e) {
  "@babel/helpers - typeof";
  return tt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, tt(e);
}
function kn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function ht(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? kn(Object(n), !0).forEach(function(r) {
      Ca(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : kn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Ca(e, t, n) {
  return (t = Ta(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ta(e) {
  var t = Pa(e, "string");
  return tt(t) == "symbol" ? t : t + "";
}
function Pa(e, t) {
  if (tt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (tt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Oa = {
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
    text: [X.STARTS_WITH, X.CONTAINS, X.NOT_CONTAINS, X.ENDS_WITH, X.EQUALS, X.NOT_EQUALS],
    numeric: [X.EQUALS, X.NOT_EQUALS, X.LESS_THAN, X.LESS_THAN_OR_EQUAL_TO, X.GREATER_THAN, X.GREATER_THAN_OR_EQUAL_TO],
    date: [X.DATE_IS, X.DATE_IS_NOT, X.DATE_BEFORE, X.DATE_AFTER]
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
}, Aa = Symbol();
function La(e, t) {
  var n = {
    config: Kr(t)
  };
  return e.config.globalProperties.$primevue = n, e.provide(Aa, n), Ea(), Na(e, n), n;
}
var De = [];
function Ea() {
  Z.clear(), De.forEach(function(e) {
    return e?.();
  }), De = [];
}
function Na(e, t) {
  var n = R(!1), r = function() {
    var d;
    if (((d = t.config) === null || d === void 0 ? void 0 : d.theme) !== "none" && !U.isStyleNameLoaded("common")) {
      var l, u, p = ((l = M.getCommonTheme) === null || l === void 0 ? void 0 : l.call(M)) || {}, f = p.primitive, S = p.semantic, $ = p.global, _ = p.style, C = {
        nonce: (u = t.config) === null || u === void 0 || (u = u.csp) === null || u === void 0 ? void 0 : u.nonce
      };
      M.load(f?.css, ht({
        name: "primitive-variables"
      }, C)), M.load(S?.css, ht({
        name: "semantic-variables"
      }, C)), M.load($?.css, ht({
        name: "global-variables"
      }, C)), M.loadStyle(ht({
        name: "global-style"
      }, C), _), U.setLoadedStyleName("common");
    }
  };
  Z.on("theme:change", function(i) {
    n.value || (e.config.globalProperties.$primevue.config.theme = i, n.value = !0);
  });
  var o = Pe(t.config, function(i, d) {
    Oe.emit("config:change", {
      newValue: i,
      oldValue: d
    });
  }, {
    immediate: !0,
    deep: !0
  }), a = Pe(function() {
    return t.config.ripple;
  }, function(i, d) {
    Oe.emit("config:ripple:change", {
      newValue: i,
      oldValue: d
    });
  }, {
    immediate: !0,
    deep: !0
  }), s = Pe(function() {
    return t.config.theme;
  }, function(i, d) {
    n.value || U.setTheme(i), t.config.unstyled || r(), n.value = !1, Oe.emit("config:theme:change", {
      newValue: i,
      oldValue: d
    });
  }, {
    immediate: !0,
    deep: !1
  }), c = Pe(function() {
    return t.config.unstyled;
  }, function(i, d) {
    !i && t.config.theme && r(), Oe.emit("config:unstyled:change", {
      newValue: i,
      oldValue: d
    });
  }, {
    immediate: !0,
    deep: !0
  });
  De.push(o), De.push(a), De.push(s), De.push(c);
}
var ja = {
  install: function(t, n) {
    var r = Wo(Oa, n);
    La(t, r);
  }
}, dr = {
  data: function() {
    return {
      mounted: !1
    };
  },
  mounted: function() {
    this.mounted = nr();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function Ia(e, t, n, r, o, a) {
  return a.inline ? Y(e.$slots, "default", {
    key: 0
  }) : o.mounted ? (b(), V(Un, {
    key: 1,
    to: n.appendTo
  }, [Y(e.$slots, "default")], 8, ["to"])) : P("", !0);
}
dr.render = Ia;
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
function za() {
  var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pc", t = qr();
  return "".concat(e).concat(t.replace("v-", "").replaceAll("-", "_"));
}
var wn = M.extend({
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
function Ra(e) {
  return fr(e) || Va(e) || pr(e) || ur();
}
function Va(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Me(e, t) {
  return fr(e) || Ba(e, t) || pr(e, t) || ur();
}
function ur() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function pr(e, t) {
  if (e) {
    if (typeof e == "string") return Nt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Nt(e, t) : void 0;
  }
}
function Nt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Ba(e, t) {
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
function fr(e) {
  if (Array.isArray(e)) return e;
}
function Sn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function I(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Sn(Object(n), !0).forEach(function(r) {
      Fe(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Sn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Fe(e, t, n) {
  return (t = Da(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Da(e) {
  var t = Ma(e, "string");
  return nt(t) == "symbol" ? t : t + "";
}
function Ma(e, t) {
  if (nt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (nt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Le = {
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
        Z.off("theme:change", this._loadCoreStyles), t || (this._loadCoreStyles(), this._themeChangeListener(this._loadCoreStyles));
      }
    },
    dt: {
      immediate: !0,
      handler: function(t, n) {
        var r = this;
        Z.off("theme:change", this._themeScopedListener), t ? (this._loadScopedThemeStyles(t), this._themeScopedListener = function() {
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
    var t, n, r, o, a, s, c, i, d, l, u, p = (t = this.pt) === null || t === void 0 ? void 0 : t._usept, f = p ? (n = this.pt) === null || n === void 0 || (n = n.originalValue) === null || n === void 0 ? void 0 : n[this.$.type.name] : void 0, S = p ? (r = this.pt) === null || r === void 0 || (r = r.value) === null || r === void 0 ? void 0 : r[this.$.type.name] : this.pt;
    (o = S || f) === null || o === void 0 || (o = o.hooks) === null || o === void 0 || (a = o.onBeforeCreate) === null || a === void 0 || a.call(o);
    var $ = (s = this.$primevueConfig) === null || s === void 0 || (s = s.pt) === null || s === void 0 ? void 0 : s._usept, _ = $ ? (c = this.$primevue) === null || c === void 0 || (c = c.config) === null || c === void 0 || (c = c.pt) === null || c === void 0 ? void 0 : c.originalValue : void 0, C = $ ? (i = this.$primevue) === null || i === void 0 || (i = i.config) === null || i === void 0 || (i = i.pt) === null || i === void 0 ? void 0 : i.value : (d = this.$primevue) === null || d === void 0 || (d = d.config) === null || d === void 0 ? void 0 : d.pt;
    (l = C || _) === null || l === void 0 || (l = l[this.$.type.name]) === null || l === void 0 || (l = l.hooks) === null || l === void 0 || (u = l.onBeforeCreate) === null || u === void 0 || u.call(l), this.$attrSelector = za(), this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
  },
  created: function() {
    this._hook("onCreated");
  },
  beforeMount: function() {
    var t;
    this.rootEl = Ze(dt(this.$el) ? this.$el : (t = this.$el) === null || t === void 0 ? void 0 : t.parentElement, "[".concat(this.$attrSelector, "]")), this.rootEl && (this.rootEl.$pc = I({
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
      return Ht(t) ? t.apply(void 0, r) : B.apply(void 0, r);
    },
    _load: function() {
      Te.isStyleNameLoaded("base") || (M.loadCSS(this.$styleOptions), this._loadGlobalStyles(), Te.setLoadedStyleName("base")), this._loadThemeStyles();
    },
    _loadStyles: function() {
      this._load(), this._themeChangeListener(this._load);
    },
    _loadCoreStyles: function() {
      var t, n;
      !Te.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name && (wn.loadCSS(this.$styleOptions), this.$options.style && this.$style.loadCSS(this.$styleOptions), Te.setLoadedStyleName(this.$style.name));
    },
    _loadGlobalStyles: function() {
      var t = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
      H(t) && M.load(t, I({
        name: "global"
      }, this.$styleOptions));
    },
    _loadThemeStyles: function() {
      var t, n;
      if (!(this.isUnstyled || this.$theme === "none")) {
        if (!U.isStyleNameLoaded("common")) {
          var r, o, a = ((r = this.$style) === null || r === void 0 || (o = r.getCommonTheme) === null || o === void 0 ? void 0 : o.call(r)) || {}, s = a.primitive, c = a.semantic, i = a.global, d = a.style;
          M.load(s?.css, I({
            name: "primitive-variables"
          }, this.$styleOptions)), M.load(c?.css, I({
            name: "semantic-variables"
          }, this.$styleOptions)), M.load(i?.css, I({
            name: "global-variables"
          }, this.$styleOptions)), M.loadStyle(I({
            name: "global-style"
          }, this.$styleOptions), d), U.setLoadedStyleName("common");
        }
        if (!U.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name) {
          var l, u, p, f, S = ((l = this.$style) === null || l === void 0 || (u = l.getComponentTheme) === null || u === void 0 ? void 0 : u.call(l)) || {}, $ = S.css, _ = S.style;
          (p = this.$style) === null || p === void 0 || p.load($, I({
            name: "".concat(this.$style.name, "-variables")
          }, this.$styleOptions)), (f = this.$style) === null || f === void 0 || f.loadStyle(I({
            name: "".concat(this.$style.name, "-style")
          }, this.$styleOptions), _), U.setLoadedStyleName(this.$style.name);
        }
        if (!U.isStyleNameLoaded("layer-order")) {
          var C, O, A = (C = this.$style) === null || C === void 0 || (O = C.getLayerOrderThemeCSS) === null || O === void 0 ? void 0 : O.call(C);
          M.load(A, I({
            name: "layer-order",
            first: !0
          }, this.$styleOptions)), U.setLoadedStyleName("layer-order");
        }
      }
    },
    _loadScopedThemeStyles: function(t) {
      var n, r, o, a = ((n = this.$style) === null || n === void 0 || (r = n.getPresetTheme) === null || r === void 0 ? void 0 : r.call(n, t, "[".concat(this.$attrSelector, "]"))) || {}, s = a.css, c = (o = this.$style) === null || o === void 0 ? void 0 : o.load(s, I({
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
      Te.clearLoadedStyleNames(), Z.on("theme:change", t);
    },
    _removeThemeListeners: function() {
      Z.off("theme:change", this._loadCoreStyles), Z.off("theme:change", this._load), Z.off("theme:change", this._themeScopedListener);
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
      return Kt(t, n, r);
    },
    _getPTValue: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, a = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, s = /./g.test(r) && !!o[r.split(".")[0]], c = this._getPropValue("ptOptions") || ((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.ptOptions) || {}, i = c.mergeSections, d = i === void 0 ? !0 : i, l = c.mergeProps, u = l === void 0 ? !1 : l, p = a ? s ? this._useGlobalPT(this._getPTClassValue, r, o) : this._useDefaultPT(this._getPTClassValue, r, o) : void 0, f = s ? void 0 : this._getPTSelf(n, this._getPTClassValue, r, I(I({}, o), {}, {
        global: p || {}
      })), S = this._getPTDatasets(r);
      return d || !d && f ? u ? this._mergeProps(u, p, f, S) : I(I(I({}, p), f), S) : I(I({}, f), S);
    },
    _getPTSelf: function() {
      for (var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), o = 1; o < n; o++)
        r[o - 1] = arguments[o];
      return B(
        this._usePT.apply(this, [this._getPT(t, this.$name)].concat(r)),
        // Exp; <component :pt="{}"
        this._usePT.apply(this, [this.$_attrsPT].concat(r))
        // Exp; <component :pt:[passthrough_key]:[attribute]="{value}" or <component :pt:[passthrough_key]="() =>{value}"
      );
    },
    _getPTDatasets: function() {
      var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", o = "data-pc-", a = r === "root" && H((t = this.pt) === null || t === void 0 ? void 0 : t["data-pc-section"]);
      return r !== "transition" && I(I({}, r === "root" && I(I(Fe({}, "".concat(o, "name"), xe(a ? (n = this.pt) === null || n === void 0 ? void 0 : n["data-pc-section"] : this.$.type.name)), a && Fe({}, "".concat(o, "extend"), xe(this.$.type.name))), {}, Fe({}, "".concat(this.$attrSelector), ""))), {}, Fe({}, "".concat(o, "section"), xe(r)));
    },
    _getPTClassValue: function() {
      var t = this._getOptionValue.apply(this, arguments);
      return oe(t) || Zn(t) ? {
        class: t
      } : t;
    },
    _getPT: function(t) {
      var n = this, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 ? arguments[2] : void 0, a = function(c) {
        var i, d = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, l = o ? o(c) : c, u = xe(r), p = xe(n.$name);
        return (i = d ? u !== p ? l?.[u] : void 0 : l?.[u]) !== null && i !== void 0 ? i : l;
      };
      return t != null && t.hasOwnProperty("_usept") ? {
        _usept: t._usept,
        originalValue: a(t.originalValue),
        value: a(t.value)
      } : a(t, !0);
    },
    _usePT: function(t, n, r, o) {
      var a = function($) {
        return n($, r, o);
      };
      if (t != null && t.hasOwnProperty("_usept")) {
        var s, c = t._usept || ((s = this.$primevueConfig) === null || s === void 0 ? void 0 : s.ptOptions) || {}, i = c.mergeSections, d = i === void 0 ? !0 : i, l = c.mergeProps, u = l === void 0 ? !1 : l, p = a(t.originalValue), f = a(t.value);
        return p === void 0 && f === void 0 ? void 0 : oe(f) ? f : oe(p) ? p : d || !d && f ? u ? this._mergeProps(u, p, f) : I(I({}, p), f) : f;
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
      return this._getPTValue(this.pt, t, I(I({}, this.$params), n));
    },
    ptmi: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = B(this.$_attrsWithoutPT, this.ptm(n, r));
      return o?.hasOwnProperty("id") && ((t = o.id) !== null && t !== void 0 || (o.id = this.$id)), o;
    },
    ptmo: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return this._getPTValue(t, n, I({
        instance: this
      }, r), !1);
    },
    cx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this.isUnstyled ? void 0 : this._getOptionValue(this.$style.classes, t, I(I({}, this.$params), n));
    },
    sx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      if (n) {
        var o = this._getOptionValue(this.$style.inlineStyles, t, I(I({}, this.$params), r)), a = this._getOptionValue(wn.inlineStyles, t, I(I({}, this.$params), r));
        return [a, o];
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
        return n._getOptionValue(r, n.$name, I({}, n.$params)) || se(r, I({}, n.$params));
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
        var o = Me(r, 1), a = o[0];
        return n?.includes(a);
      }));
    },
    $theme: function() {
      var t;
      return (t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.theme;
    },
    $style: function() {
      return I(I({
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
        var r = Me(n, 2), o = r[0], a = r[1], s = o.split(":"), c = Ra(s), i = Nt(c).slice(1);
        return i?.reduce(function(d, l, u, p) {
          return !d[l] && (d[l] = u === p.length - 1 ? a : {}), d[l];
        }, t), t;
      }, {});
    },
    $_attrsWithoutPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(t) {
        var n = Me(t, 1), r = n[0];
        return !(r != null && r.startsWith("pt:"));
      }).reduce(function(t, n) {
        var r = Me(n, 2), o = r[0], a = r[1];
        return t[o] = a, t;
      }, {});
    }
  }
}, Ua = `
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
`, Wa = M.extend({
  name: "baseicon",
  css: Ua
});
function rt(e) {
  "@babel/helpers - typeof";
  return rt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, rt(e);
}
function _n(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function $n(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? _n(Object(n), !0).forEach(function(r) {
      Fa(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : _n(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Fa(e, t, n) {
  return (t = Ha(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ha(e) {
  var t = Ka(e, "string");
  return rt(t) == "symbol" ? t : t + "";
}
function Ka(e, t) {
  if (rt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (rt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var qt = {
  name: "BaseIcon",
  extends: Le,
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
  style: Wa,
  provide: function() {
    return {
      $pcIcon: this,
      $parentInstance: this
    };
  },
  methods: {
    pti: function() {
      var t = Re(this.label);
      return $n($n({}, !this.isUnstyled && {
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
function Cn(e, t) {
  return Qa(e) || Ga(e, t) || Ya(e, t) || qa();
}
function qa() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ya(e, t) {
  if (e) {
    if (typeof e == "string") return Tn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Tn(e, t) : void 0;
  }
}
function Tn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Ga(e, t) {
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
function Qa(e) {
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
function D(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Pn(Object(n), !0).forEach(function(r) {
      jt(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Pn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function jt(e, t, n) {
  return (t = Za(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Za(e) {
  var t = Ja(e, "string");
  return ot(t) == "symbol" ? t : t + "";
}
function Ja(e, t) {
  if (ot(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ot(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var E = {
  _getMeta: function() {
    return [ke(arguments.length <= 0 ? void 0 : arguments[0]) || arguments.length <= 0 ? void 0 : arguments[0], se(ke(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getConfig: function(t, n) {
    var r, o, a;
    return (r = (t == null || (o = t.instance) === null || o === void 0 ? void 0 : o.$primevue) || (n == null || (a = n.ctx) === null || a === void 0 || (a = a.appContext) === null || a === void 0 || (a = a.config) === null || a === void 0 || (a = a.globalProperties) === null || a === void 0 ? void 0 : a.$primevue)) === null || r === void 0 ? void 0 : r.config;
  },
  _getOptionValue: Kt,
  _getPTValue: function() {
    var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", s = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, c = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, i = function() {
      var O = E._getOptionValue.apply(E, arguments);
      return oe(O) || Zn(O) ? {
        class: O
      } : O;
    }, d = ((t = r.binding) === null || t === void 0 || (t = t.value) === null || t === void 0 ? void 0 : t.ptOptions) || ((n = r.$primevueConfig) === null || n === void 0 ? void 0 : n.ptOptions) || {}, l = d.mergeSections, u = l === void 0 ? !0 : l, p = d.mergeProps, f = p === void 0 ? !1 : p, S = c ? E._useDefaultPT(r, r.defaultPT(), i, a, s) : void 0, $ = E._usePT(r, E._getPT(o, r.$name), i, a, D(D({}, s), {}, {
      global: S || {}
    })), _ = E._getPTDatasets(r, a);
    return u || !u && $ ? f ? E._mergeProps(r, f, S, $, _) : D(D(D({}, S), $), _) : D(D({}, $), _);
  },
  _getPTDatasets: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = "data-pc-";
    return D(D({}, n === "root" && jt({}, "".concat(r, "name"), xe(t.$name))), {}, jt({}, "".concat(r, "section"), xe(n)));
  },
  _getPT: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 ? arguments[2] : void 0, o = function(s) {
      var c, i = r ? r(s) : s, d = xe(n);
      return (c = i?.[d]) !== null && c !== void 0 ? c : i;
    };
    return t && Object.hasOwn(t, "_usept") ? {
      _usept: t._usept,
      originalValue: o(t.originalValue),
      value: o(t.value)
    } : o(t);
  },
  _usePT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = arguments.length > 2 ? arguments[2] : void 0, o = arguments.length > 3 ? arguments[3] : void 0, a = arguments.length > 4 ? arguments[4] : void 0, s = function(_) {
      return r(_, o, a);
    };
    if (n && Object.hasOwn(n, "_usept")) {
      var c, i = n._usept || ((c = t.$primevueConfig) === null || c === void 0 ? void 0 : c.ptOptions) || {}, d = i.mergeSections, l = d === void 0 ? !0 : d, u = i.mergeProps, p = u === void 0 ? !1 : u, f = s(n.originalValue), S = s(n.value);
      return f === void 0 && S === void 0 ? void 0 : oe(S) ? S : oe(f) ? f : l || !l && S ? p ? E._mergeProps(t, p, f, S) : D(D({}, f), S) : S;
    }
    return s(n);
  },
  _useDefaultPT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 ? arguments[2] : void 0, o = arguments.length > 3 ? arguments[3] : void 0, a = arguments.length > 4 ? arguments[4] : void 0;
    return E._usePT(t, n, r, o, a);
  },
  _loadStyles: function() {
    var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 ? arguments[1] : void 0, o = arguments.length > 2 ? arguments[2] : void 0, a = E._getConfig(r, o), s = {
      nonce: a == null || (t = a.csp) === null || t === void 0 ? void 0 : t.nonce
    };
    E._loadCoreStyles(n, s), E._loadThemeStyles(n, s), E._loadScopedThemeStyles(n, s), E._removeThemeListeners(n), n.$loadStyles = function() {
      return E._loadThemeStyles(n, s);
    }, E._themeChangeListener(n.$loadStyles);
  },
  _loadCoreStyles: function() {
    var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 ? arguments[1] : void 0;
    if (!Te.isStyleNameLoaded((t = r.$style) === null || t === void 0 ? void 0 : t.name) && (n = r.$style) !== null && n !== void 0 && n.name) {
      var a;
      M.loadCSS(o), (a = r.$style) === null || a === void 0 || a.loadCSS(o), Te.setLoadedStyleName(r.$style.name);
    }
  },
  _loadThemeStyles: function() {
    var t, n, r, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, a = arguments.length > 1 ? arguments[1] : void 0;
    if (!(o != null && o.isUnstyled() || (o == null || (t = o.theme) === null || t === void 0 ? void 0 : t.call(o)) === "none")) {
      if (!U.isStyleNameLoaded("common")) {
        var s, c, i = ((s = o.$style) === null || s === void 0 || (c = s.getCommonTheme) === null || c === void 0 ? void 0 : c.call(s)) || {}, d = i.primitive, l = i.semantic, u = i.global, p = i.style;
        M.load(d?.css, D({
          name: "primitive-variables"
        }, a)), M.load(l?.css, D({
          name: "semantic-variables"
        }, a)), M.load(u?.css, D({
          name: "global-variables"
        }, a)), M.loadStyle(D({
          name: "global-style"
        }, a), p), U.setLoadedStyleName("common");
      }
      if (!U.isStyleNameLoaded((n = o.$style) === null || n === void 0 ? void 0 : n.name) && (r = o.$style) !== null && r !== void 0 && r.name) {
        var f, S, $, _, C = ((f = o.$style) === null || f === void 0 || (S = f.getDirectiveTheme) === null || S === void 0 ? void 0 : S.call(f)) || {}, O = C.css, A = C.style;
        ($ = o.$style) === null || $ === void 0 || $.load(O, D({
          name: "".concat(o.$style.name, "-variables")
        }, a)), (_ = o.$style) === null || _ === void 0 || _.loadStyle(D({
          name: "".concat(o.$style.name, "-style")
        }, a), A), U.setLoadedStyleName(o.$style.name);
      }
      if (!U.isStyleNameLoaded("layer-order")) {
        var v, m, j = (v = o.$style) === null || v === void 0 || (m = v.getLayerOrderThemeCSS) === null || m === void 0 ? void 0 : m.call(v);
        M.load(j, D({
          name: "layer-order",
          first: !0
        }, a)), U.setLoadedStyleName("layer-order");
      }
    }
  },
  _loadScopedThemeStyles: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = t.preset();
    if (r && t.$attrSelector) {
      var o, a, s, c = ((o = t.$style) === null || o === void 0 || (a = o.getPresetTheme) === null || a === void 0 ? void 0 : a.call(o, r, "[".concat(t.$attrSelector, "]"))) || {}, i = c.css, d = (s = t.$style) === null || s === void 0 ? void 0 : s.load(i, D({
        name: "".concat(t.$attrSelector, "-").concat(t.$style.name)
      }, n));
      t.scopedStyleEl = d.el;
    }
  },
  _themeChangeListener: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
    };
    Te.clearLoadedStyleNames(), Z.on("theme:change", t);
  },
  _removeThemeListeners: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    Z.off("theme:change", t.$loadStyles), t.$loadStyles = void 0;
  },
  _hook: function(t, n, r, o, a, s) {
    var c, i, d = "on".concat(Fo(n)), l = E._getConfig(o, a), u = r?.$instance, p = E._usePT(u, E._getPT(o == null || (c = o.value) === null || c === void 0 ? void 0 : c.pt, t), E._getOptionValue, "hooks.".concat(d)), f = E._useDefaultPT(u, l == null || (i = l.pt) === null || i === void 0 || (i = i.directives) === null || i === void 0 ? void 0 : i[t], E._getOptionValue, "hooks.".concat(d)), S = {
      el: r,
      binding: o,
      vnode: a,
      prevVnode: s
    };
    p?.(u, S), f?.(u, S);
  },
  /* eslint-disable-next-line no-unused-vars */
  _mergeProps: function() {
    for (var t = arguments.length > 1 ? arguments[1] : void 0, n = arguments.length, r = new Array(n > 2 ? n - 2 : 0), o = 2; o < n; o++)
      r[o - 2] = arguments[o];
    return Ht(t) ? t.apply(void 0, r) : B.apply(void 0, r);
  },
  _extend: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = function(c, i, d, l, u) {
      var p, f, S, $;
      i._$instances = i._$instances || {};
      var _ = E._getConfig(d, l), C = i._$instances[t] || {}, O = Re(C) ? D(D({}, n), n?.methods) : {};
      i._$instances[t] = D(D({}, C), {}, {
        /* new instance variables to pass in directive methods */
        $name: t,
        $host: i,
        $binding: d,
        $modifiers: d?.modifiers,
        $value: d?.value,
        $el: C.$el || i || void 0,
        $style: D({
          classes: void 0,
          inlineStyles: void 0,
          load: function() {
          },
          loadCSS: function() {
          },
          loadStyle: function() {
          }
        }, n?.style),
        $primevueConfig: _,
        $attrSelector: (p = i.$pd) === null || p === void 0 || (p = p[t]) === null || p === void 0 ? void 0 : p.attrSelector,
        /* computed instance variables */
        defaultPT: function() {
          return E._getPT(_?.pt, void 0, function(v) {
            var m;
            return v == null || (m = v.directives) === null || m === void 0 ? void 0 : m[t];
          });
        },
        isUnstyled: function() {
          var v, m;
          return ((v = i._$instances[t]) === null || v === void 0 || (v = v.$binding) === null || v === void 0 || (v = v.value) === null || v === void 0 ? void 0 : v.unstyled) !== void 0 ? (m = i._$instances[t]) === null || m === void 0 || (m = m.$binding) === null || m === void 0 || (m = m.value) === null || m === void 0 ? void 0 : m.unstyled : _?.unstyled;
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
          var v, m = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", j = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return E._getPTValue(i._$instances[t], (v = i._$instances[t]) === null || v === void 0 || (v = v.$binding) === null || v === void 0 || (v = v.value) === null || v === void 0 ? void 0 : v.pt, m, D({}, j));
        },
        ptmo: function() {
          var v = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, m = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", j = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return E._getPTValue(i._$instances[t], v, m, j, !1);
        },
        cx: function() {
          var v, m, j = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", N = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return (v = i._$instances[t]) !== null && v !== void 0 && v.isUnstyled() ? void 0 : E._getOptionValue((m = i._$instances[t]) === null || m === void 0 || (m = m.$style) === null || m === void 0 ? void 0 : m.classes, j, D({}, N));
        },
        sx: function() {
          var v, m = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", j = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, N = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return j ? E._getOptionValue((v = i._$instances[t]) === null || v === void 0 || (v = v.$style) === null || v === void 0 ? void 0 : v.inlineStyles, m, D({}, N)) : void 0;
        }
      }, O), i.$instance = i._$instances[t], (f = (S = i.$instance)[c]) === null || f === void 0 || f.call(S, i, d, l, u), i["$".concat(t)] = i.$instance, E._hook(t, c, i, d, l, u), i.$pd || (i.$pd = {}), i.$pd[t] = D(D({}, ($ = i.$pd) === null || $ === void 0 ? void 0 : $[t]), {}, {
        name: t,
        instance: i._$instances[t]
      });
    }, o = function(c) {
      var i, d, l, u = c._$instances[t], p = u?.watch, f = function(_) {
        var C, O = _.newValue, A = _.oldValue;
        return p == null || (C = p.config) === null || C === void 0 ? void 0 : C.call(u, O, A);
      }, S = function(_) {
        var C, O = _.newValue, A = _.oldValue;
        return p == null || (C = p["config.ripple"]) === null || C === void 0 ? void 0 : C.call(u, O, A);
      };
      u.$watchersCallback = {
        config: f,
        "config.ripple": S
      }, p == null || (i = p.config) === null || i === void 0 || i.call(u, u?.$primevueConfig), Oe.on("config:change", f), p == null || (d = p["config.ripple"]) === null || d === void 0 || d.call(u, u == null || (l = u.$primevueConfig) === null || l === void 0 ? void 0 : l.ripple), Oe.on("config:ripple:change", S);
    }, a = function(c) {
      var i = c._$instances[t].$watchersCallback;
      i && (Oe.off("config:change", i.config), Oe.off("config:ripple:change", i["config.ripple"]), c._$instances[t].$watchersCallback = void 0);
    };
    return {
      created: function(c, i, d, l) {
        c.$pd || (c.$pd = {}), c.$pd[t] = {
          name: t,
          attrSelector: Jo("pd")
        }, r("created", c, i, d, l);
      },
      beforeMount: function(c, i, d, l) {
        var u;
        E._loadStyles((u = c.$pd[t]) === null || u === void 0 ? void 0 : u.instance, i, d), r("beforeMount", c, i, d, l), o(c);
      },
      mounted: function(c, i, d, l) {
        var u;
        E._loadStyles((u = c.$pd[t]) === null || u === void 0 ? void 0 : u.instance, i, d), r("mounted", c, i, d, l);
      },
      beforeUpdate: function(c, i, d, l) {
        r("beforeUpdate", c, i, d, l);
      },
      updated: function(c, i, d, l) {
        var u;
        E._loadStyles((u = c.$pd[t]) === null || u === void 0 ? void 0 : u.instance, i, d), r("updated", c, i, d, l);
      },
      beforeUnmount: function(c, i, d, l) {
        var u;
        a(c), E._removeThemeListeners((u = c.$pd[t]) === null || u === void 0 ? void 0 : u.instance), r("beforeUnmount", c, i, d, l);
      },
      unmounted: function(c, i, d, l) {
        var u;
        (u = c.$pd[t]) === null || u === void 0 || (u = u.instance) === null || u === void 0 || (u = u.scopedStyleEl) === null || u === void 0 || (u = u.value) === null || u === void 0 || u.remove(), r("unmounted", c, i, d, l);
      }
    };
  },
  extend: function() {
    var t = E._getMeta.apply(E, arguments), n = Cn(t, 2), r = n[0], o = n[1];
    return D({
      extend: function() {
        var s = E._getMeta.apply(E, arguments), c = Cn(s, 2), i = c[0], d = c[1];
        return E.extend(i, D(D(D({}, o), o?.methods), d));
      }
    }, E._extend(r, o));
  }
}, Xa = `
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
`, ei = {
  root: "p-ink"
}, ti = M.extend({
  name: "ripple-directive",
  style: Xa,
  classes: ei
}), ni = E.extend({
  style: ti
});
function at(e) {
  "@babel/helpers - typeof";
  return at = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, at(e);
}
function ri(e) {
  return si(e) || ii(e) || ai(e) || oi();
}
function oi() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ai(e, t) {
  if (e) {
    if (typeof e == "string") return It(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? It(e, t) : void 0;
  }
}
function ii(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function si(e) {
  if (Array.isArray(e)) return It(e);
}
function It(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function On(e, t, n) {
  return (t = li(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function li(e) {
  var t = ci(e, "string");
  return at(t) == "symbol" ? t : t + "";
}
function ci(e, t) {
  if (at(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (at(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Yt = ni.extend("ripple", {
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
      n || (n = Go("span", On(On({
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
        if (!this.isUnstyled() && _t(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "false"), !Lt(o) && !Ye(o)) {
          var a = Math.max(er(r), tr(r));
          o.style.height = a + "px", o.style.width = a + "px";
        }
        var s = We(r), c = t.pageX - s.left + document.body.scrollTop - Ye(o) / 2, i = t.pageY - s.top + document.body.scrollLeft - Lt(o) / 2;
        o.style.top = i + "px", o.style.left = c + "px", !this.isUnstyled() && Ko(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "true"), this.timeout = setTimeout(function() {
          o && (!n.isUnstyled() && _t(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "false"));
        }, 401);
      }
    },
    onAnimationEnd: function(t) {
      this.timeout && clearTimeout(this.timeout), !this.isUnstyled() && _t(t.currentTarget, "p-ink-active"), t.currentTarget.setAttribute("data-p-ink-active", "false");
    },
    getInk: function(t) {
      return t && t.children ? ri(t.children).find(function(n) {
        return Ue(n, "data-pc-name") === "ripple";
      }) : void 0;
    }
  }
});
const di = "data-wippy-overlay-layer";
function mr() {
  return typeof window < "u" && typeof window.document < "u";
}
function br() {
  return mr() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function ui() {
  return br() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const pi = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let fi = 0;
const xt = /* @__PURE__ */ new WeakMap();
function An(e, t) {
  const n = e.style;
  n.setProperty("position", "fixed", "important"), n.setProperty("inset", "auto", "important"), n.setProperty("margin", "0", "important"), n.setProperty("position-anchor", t), n.setProperty("position-area", "bottom span-right"), n.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), n.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), n.setProperty("max-width", "stretch", "important");
}
function mi(e, t) {
  if (!pi.test(e.className))
    return;
  const n = e.style.cssText;
  An(e, t), e.getAttribute("popover") !== "manual" && e.setAttribute("popover", "manual");
  try {
    e.matches(":popover-open") || e.showPopover();
  } catch {
  }
  if (!e.matches(":popover-open")) {
    e.removeAttribute("popover"), e.style.cssText = n;
    return;
  }
  if (!xt.has(e)) {
    const r = new MutationObserver(() => {
      const o = e.style;
      (o.top !== "auto" || o.left !== "auto" || o.margin !== "0px" || o.getPropertyPriority("top") !== "important" || o.getPropertyPriority("left") !== "important" || o.getPropertyPriority("margin") !== "important" || o.getPropertyPriority("min-width") !== "important" || o.maxWidth !== "stretch" || o.getPropertyPriority("max-width") !== "important") && An(e, t);
    });
    r.observe(e, { attributes: !0, attributeFilter: ["style"] }), xt.set(e, r);
  }
}
function Gt(e) {
  const t = xt.get(e);
  t && (t.disconnect(), xt.delete(e));
}
function bi(e) {
  const t = e && typeof e.getRootNode == "function" ? e.getRootNode() : null;
  return t instanceof ShadowRoot ? t : null;
}
function zt(e) {
  e.style.top = "0px", e.style.left = "0px";
  const t = e.getBoundingClientRect();
  e.style.top = `${-window.scrollY - t.top}px`, e.style.left = `${-window.scrollX - t.left}px`;
}
const kt = /* @__PURE__ */ new Set(), Qt = /* @__PURE__ */ new WeakMap();
let Ln = !1, Rt = !1;
function vi() {
  Rt = !1;
  for (const e of kt) {
    if (!e.isConnected) {
      for (const t of Array.from(e.children))
        t instanceof HTMLElement && Gt(t);
      kt.delete(e), Qt.get(e)?.disconnect();
      continue;
    }
    e.childElementCount > 0 && zt(e);
  }
}
function En() {
  Rt || (Rt = !0, requestAnimationFrame(vi));
}
function hi(e) {
  const t = document.createElement("div");
  t.setAttribute(di, "");
  const n = br();
  if (t.style.cssText = n ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", n && t.setAttribute("popover", "manual"), e.appendChild(t), n) {
    try {
      t.showPopover();
    } catch {
    }
    t.matches(":popover-open") || (t.removeAttribute("popover"), t.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  zt(t);
  const r = new MutationObserver((o) => {
    const a = t.__wippyAnchorName;
    for (const s of o) {
      if (a)
        for (const c of Array.from(s.addedNodes))
          c instanceof HTMLElement && mi(c, a);
      for (const c of Array.from(s.removedNodes))
        c instanceof HTMLElement && Gt(c);
    }
    t.isConnected && t.childElementCount > 0 && zt(t);
  });
  return r.observe(t, { childList: !0 }), Qt.set(t, r), kt.add(t), Ln || (Ln = !0, window.addEventListener("scroll", En, { capture: !0, passive: !0 }), window.addEventListener("resize", En, { passive: !0 })), t;
}
function Nn(e) {
  if (!(!e.hostRoot || e.layer) && (e.layer = hi(e.hostRoot), ui())) {
    const t = e.$el ? e.$el.parentElement : null;
    t && (e.anchorName = `--wippy-a-${++fi}`, e.anchorTrigger = t, t.style.setProperty("anchor-name", e.anchorName), e.layer.__wippyAnchorName = e.anchorName);
  }
}
function jn(e) {
  if (e.anchorTrigger && (e.anchorTrigger.style.removeProperty("anchor-name"), e.anchorTrigger = null), e.anchorName = null, e.layer) {
    for (const t of Array.from(e.layer.children))
      t instanceof HTMLElement && Gt(t);
    kt.delete(e.layer), Qt.get(e.layer)?.disconnect(), e.layer.remove(), e.layer = null;
  }
}
let In = !1;
function gi() {
  if (In)
    return;
  In = !0;
  const e = dr;
  e.computed = e.computed || {}, e.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, e.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, e.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, e.mounted = function() {
    mr() && (this.hostRoot = bi(this.$el), this.mounted = !0, this.hostRoot && (this.inline || Nn(this), this.$watch("inline", (t) => {
      t ? jn(this) : Nn(this);
    })));
  }, e.render = function() {
    return this.inline ? Y(this.$slots, "default", { key: 0 }) : this.mounted ? Yr(Un, { key: 1, to: this.resolvedTarget || document.body }, [
      Y(this.$slots, "default")
    ]) : P("", !0);
  }, e.unmounted = function() {
    jn(this);
  };
}
const yi = {
  install: (e) => {
    gi(), e.use(ja, { theme: "none" });
  }
};
var xi = {
  root: function(t) {
    var n = t.instance, r = t.props;
    return ["p-tab", {
      "p-tab-active": n.active,
      "p-disabled": r.disabled
    }];
  }
}, ki = M.extend({
  name: "tab",
  classes: xi
}), wi = {
  name: "BaseTab",
  extends: Le,
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
  style: ki,
  provide: function() {
    return {
      $pcTab: this,
      $parentInstance: this
    };
  }
}, Vt = {
  name: "Tab",
  extends: wi,
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
      return r ? Ue(r, "data-p-disabled") || Ue(r, "data-pc-section") === "activebar" ? this.findNextTab(r) : Ze(r, '[data-pc-name="tab"]') : null;
    },
    findPrevTab: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, r = n ? t : t.previousElementSibling;
      return r ? Ue(r, "data-p-disabled") || Ue(r, "data-pc-section") === "activebar" ? this.findPrevTab(r) : Ze(r, '[data-pc-name="tab"]') : null;
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
      Qo(n), this.scrollInView(n);
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
      return Do((t = this.$pcTabs) === null || t === void 0 ? void 0 : t.d_value, this.value);
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
      return B(this.asAttrs, this.a11yAttrs, this.ptmi("root", this.ptParams));
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
      return Ae({
        active: this.active
      });
    }
  },
  directives: {
    ripple: Yt
  }
};
function Si(e, t, n, r, o, a) {
  var s = Ft("ripple");
  return e.asChild ? Y(e.$slots, "default", {
    key: 1,
    dataP: a.dataP,
    class: re(e.cx("root")),
    active: a.active,
    a11yAttrs: a.a11yAttrs,
    onClick: a.onClick
  }) : ze((b(), V(Qe(e.as), B({
    key: 0,
    class: e.cx("root"),
    "data-p": a.dataP,
    onClick: a.onClick
  }, a.attrs), {
    default: z(function() {
      return [Y(e.$slots, "default")];
    }),
    _: 3
  }, 16, ["class", "data-p", "onClick"])), [[s]]);
}
Vt.render = Si;
var vr = {
  name: "ChevronLeftIcon",
  extends: qt
};
function _i(e) {
  return Pi(e) || Ti(e) || Ci(e) || $i();
}
function $i() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ci(e, t) {
  if (e) {
    if (typeof e == "string") return Bt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Bt(e, t) : void 0;
  }
}
function Ti(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Pi(e) {
  if (Array.isArray(e)) return Bt(e);
}
function Bt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Oi(e, t, n, r, o, a) {
  return b(), k("svg", B({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), _i(t[0] || (t[0] = [h("path", {
    d: "M9.61296 13C9.50997 13.0005 9.40792 12.9804 9.3128 12.9409C9.21767 12.9014 9.13139 12.8433 9.05902 12.7701L3.83313 7.54416C3.68634 7.39718 3.60388 7.19795 3.60388 6.99022C3.60388 6.78249 3.68634 6.58325 3.83313 6.43628L9.05902 1.21039C9.20762 1.07192 9.40416 0.996539 9.60724 1.00012C9.81032 1.00371 10.0041 1.08597 10.1477 1.22959C10.2913 1.37322 10.3736 1.56698 10.3772 1.77005C10.3808 1.97313 10.3054 2.16968 10.1669 2.31827L5.49496 6.99022L10.1669 11.6622C10.3137 11.8091 10.3962 12.0084 10.3962 12.2161C10.3962 12.4238 10.3137 12.6231 10.1669 12.7701C10.0945 12.8433 10.0083 12.9014 9.91313 12.9409C9.81801 12.9804 9.71596 13.0005 9.61296 13Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
vr.render = Oi;
var hr = {
  name: "ChevronRightIcon",
  extends: qt
};
function Ai(e) {
  return ji(e) || Ni(e) || Ei(e) || Li();
}
function Li() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ei(e, t) {
  if (e) {
    if (typeof e == "string") return Dt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Dt(e, t) : void 0;
  }
}
function Ni(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function ji(e) {
  if (Array.isArray(e)) return Dt(e);
}
function Dt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Ii(e, t, n, r, o, a) {
  return b(), k("svg", B({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Ai(t[0] || (t[0] = [h("path", {
    d: "M4.38708 13C4.28408 13.0005 4.18203 12.9804 4.08691 12.9409C3.99178 12.9014 3.9055 12.8433 3.83313 12.7701C3.68634 12.6231 3.60388 12.4238 3.60388 12.2161C3.60388 12.0084 3.68634 11.8091 3.83313 11.6622L8.50507 6.99022L3.83313 2.31827C3.69467 2.16968 3.61928 1.97313 3.62287 1.77005C3.62645 1.56698 3.70872 1.37322 3.85234 1.22959C3.99596 1.08597 4.18972 1.00371 4.3928 1.00012C4.59588 0.996539 4.79242 1.07192 4.94102 1.21039L10.1669 6.43628C10.3137 6.58325 10.3962 6.78249 10.3962 6.99022C10.3962 7.19795 10.3137 7.39718 10.1669 7.54416L4.94102 12.7701C4.86865 12.8433 4.78237 12.9014 4.68724 12.9409C4.59212 12.9804 4.49007 13.0005 4.38708 13Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
hr.render = Ii;
var zi = {
  root: "p-tablist",
  content: "p-tablist-content p-tablist-viewport",
  tabList: "p-tablist-tab-list",
  activeBar: "p-tablist-active-bar",
  prevButton: "p-tablist-prev-button p-tablist-nav-button",
  nextButton: "p-tablist-next-button p-tablist-nav-button"
}, Ri = M.extend({
  name: "tablist",
  classes: zi
}), Vi = {
  name: "BaseTabList",
  extends: Le,
  props: {},
  style: Ri,
  provide: function() {
    return {
      $pcTabList: this,
      $parentInstance: this
    };
  }
}, gr = {
  name: "TabList",
  extends: Vi,
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
      var t = this.$refs.content, n = this.getVisibleButtonWidths(), r = Ye(t) - n, o = Math.abs(t.scrollLeft), a = r * 0.8, s = o - a, c = Math.max(s, 0);
      t.scrollLeft = cn(t) ? -1 * c : c;
    },
    onNextButtonClick: function() {
      var t = this.$refs.content, n = this.getVisibleButtonWidths(), r = Ye(t) - n, o = Math.abs(t.scrollLeft), a = r * 0.8, s = o + a, c = t.scrollWidth - r, i = Math.min(s, c);
      t.scrollLeft = cn(t) ? -1 * i : i;
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
      var n = this.$refs.content, r = Ze(n, '[data-pc-name="tab"][data-p-active="true"]');
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
        var a = Ze(n, '[data-pc-name="tab"][data-p-active="true"]');
        this.$pcTabs.isVertical() ? (r.style.height = tr(a) + "px", r.style.top = We(a).top - We(o).top + "px") : (r.style.width = er(a) + "px", r.style.left = We(a).left - We(o).left + "px");
      }
    },
    updateButtonState: function() {
      var t = this.$refs, n = t.list, r = t.content, o = r.scrollTop, a = r.scrollWidth, s = r.scrollHeight, c = r.offsetWidth, i = r.offsetHeight, d = Math.abs(r.scrollLeft), l = [Ye(r), Lt(r)], u = l[0], p = l[1];
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
      return Ae({
        scrollable: this.$pcTabs.scrollable
      });
    }
  },
  components: {
    ChevronLeftIcon: vr,
    ChevronRightIcon: hr
  },
  directives: {
    ripple: Yt
  }
}, Bi = ["data-p"], Di = ["aria-label", "tabindex"], Mi = ["data-p"], Ui = ["aria-orientation"], Wi = ["aria-label", "tabindex"];
function Fi(e, t, n, r, o, a) {
  var s = Ft("ripple");
  return b(), k("div", B({
    ref: "list",
    class: e.cx("root"),
    "data-p": a.dataP
  }, e.ptmi("root")), [a.showNavigators && o.isPrevButtonEnabled ? ze((b(), k("button", B({
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
  }), [(b(), V(Qe(a.templates.previcon || "ChevronLeftIcon"), B({
    "aria-hidden": "true"
  }, e.ptm("prevIcon")), null, 16))], 16, Di)), [[s]]) : P("", !0), h("div", B({
    ref: "content",
    class: e.cx("content"),
    onScroll: t[1] || (t[1] = function() {
      return a.onScroll && a.onScroll.apply(a, arguments);
    }),
    "data-p": a.dataP
  }, e.ptm("content")), [h("div", B({
    ref: "tabs",
    class: e.cx("tabList"),
    role: "tablist",
    "aria-orientation": a.$pcTabs.orientation || "horizontal"
  }, e.ptm("tabList")), [Y(e.$slots, "default"), h("span", B({
    ref: "inkbar",
    class: e.cx("activeBar"),
    role: "presentation",
    "aria-hidden": "true"
  }, e.ptm("activeBar")), null, 16)], 16, Ui)], 16, Mi), a.showNavigators && o.isNextButtonEnabled ? ze((b(), k("button", B({
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
  }), [(b(), V(Qe(a.templates.nexticon || "ChevronRightIcon"), B({
    "aria-hidden": "true"
  }, e.ptm("nextIcon")), null, 16))], 16, Wi)), [[s]]) : P("", !0)], 16, Bi);
}
gr.render = Fi;
var Hi = `
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
`, Ki = {
  root: function(t) {
    var n = t.props;
    return ["p-tabs p-component", {
      "p-tabs-scrollable": n.scrollable
    }];
  }
}, qi = M.extend({
  name: "tabs",
  style: Hi,
  classes: Ki
}), Yi = {
  name: "BaseTabs",
  extends: Le,
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
  style: qi,
  provide: function() {
    return {
      $pcTabs: this,
      $parentInstance: this
    };
  }
}, yr = {
  name: "Tabs",
  extends: Yi,
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
function Gi(e, t, n, r, o, a) {
  return b(), k("div", B({
    class: e.cx("root")
  }, e.ptmi("root")), [Y(e.$slots, "default")], 16);
}
yr.render = Gi;
const Qi = { class: "km-shell" }, Zi = { class: "km-rail" }, Ji = { class: "km-main" }, Xi = /* @__PURE__ */ te({
  __name: "Shell",
  setup(e) {
    return (t, n) => (b(), k("div", Qi, [
      h("aside", Zi, [
        Y(t.$slots, "rail")
      ]),
      h("main", Ji, [
        Y(t.$slots, "default")
      ])
    ]));
  }
}), es = { class: "km-railhead" }, ts = { class: "km-railhead-title" }, ns = { key: 0 }, rs = { class: "km-railhead-acts" }, os = /* @__PURE__ */ te({
  __name: "RailHeader",
  props: {
    title: {},
    count: {}
  },
  setup(e) {
    return (t, n) => (b(), k("div", es, [
      h("span", ts, [
        F(T(e.title), 1),
        e.count !== void 0 ? (b(), k("b", ns, T(e.count), 1)) : P("", !0)
      ]),
      h("div", rs, [
        Y(t.$slots, "actions")
      ])
    ]));
  }
});
var Zt = {
  name: "SpinnerIcon",
  extends: qt
};
function as(e) {
  return cs(e) || ls(e) || ss(e) || is();
}
function is() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ss(e, t) {
  if (e) {
    if (typeof e == "string") return Mt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Mt(e, t) : void 0;
  }
}
function ls(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function cs(e) {
  if (Array.isArray(e)) return Mt(e);
}
function Mt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function ds(e, t, n, r, o, a) {
  return b(), k("svg", B({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), as(t[0] || (t[0] = [h("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Zt.render = ds;
var us = `
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
`, ps = {
  root: function(t) {
    var n = t.props, r = t.instance;
    return ["p-badge p-component", {
      "p-badge-circle": H(n.value) && String(n.value).length === 1,
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
}, fs = M.extend({
  name: "badge",
  style: us,
  classes: ps
}), ms = {
  name: "BaseBadge",
  extends: Le,
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
  style: fs,
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
function zn(e, t, n) {
  return (t = bs(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function bs(e) {
  var t = vs(e, "string");
  return it(t) == "symbol" ? t : t + "";
}
function vs(e, t) {
  if (it(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (it(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var xr = {
  name: "Badge",
  extends: ms,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return Ae(zn(zn({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, hs = ["data-p"];
function gs(e, t, n, r, o, a) {
  return b(), k("span", B({
    class: e.cx("root"),
    "data-p": a.dataP
  }, e.ptmi("root")), [Y(e.$slots, "default", {}, function() {
    return [F(T(e.value), 1)];
  })], 16, hs);
}
xr.render = gs;
var ys = `
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
function ye(e, t, n) {
  return (t = xs(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function xs(e) {
  var t = ks(e, "string");
  return st(t) == "symbol" ? t : t + "";
}
function ks(e, t) {
  if (st(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (st(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var ws = {
  root: function(t) {
    var n = t.instance, r = t.props;
    return ["p-button p-component", ye(ye(ye(ye(ye(ye(ye(ye(ye({
      "p-button-icon-only": n.hasIcon && !r.label && !r.badge,
      "p-button-vertical": (r.iconPos === "top" || r.iconPos === "bottom") && r.label,
      "p-button-loading": r.loading,
      "p-button-link": r.link || r.variant === "link"
    }, "p-button-".concat(r.severity), r.severity), "p-button-raised", r.raised), "p-button-rounded", r.rounded), "p-button-text", r.text || r.variant === "text"), "p-button-outlined", r.outlined || r.variant === "outlined"), "p-button-sm", r.size === "small"), "p-button-lg", r.size === "large"), "p-button-plain", r.plain), "p-button-fluid", n.hasFluid)];
  },
  loadingIcon: "p-button-loading-icon",
  icon: function(t) {
    var n = t.props;
    return ["p-button-icon", ye({}, "p-button-icon-".concat(n.iconPos), n.label)];
  },
  label: "p-button-label"
}, Ss = M.extend({
  name: "button",
  style: ys,
  classes: ws
}), _s = {
  name: "BaseButton",
  extends: Le,
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
  style: Ss,
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
function ne(e, t, n) {
  return (t = $s(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function $s(e) {
  var t = Cs(e, "string");
  return lt(t) == "symbol" ? t : t + "";
}
function Cs(e, t) {
  if (lt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (lt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Jt = {
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
      return B(this.asAttrs, this.a11yAttrs, this.getPTOptions("root"));
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
      return Ae(ne(ne(ne(ne(ne(ne(ne(ne(ne(ne({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
    },
    dataIconP: function() {
      return Ae(ne(ne({}, this.iconPos, this.iconPos), this.size, this.size));
    },
    dataLabelP: function() {
      return Ae(ne(ne({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
    }
  },
  components: {
    SpinnerIcon: Zt,
    Badge: xr
  },
  directives: {
    ripple: Yt
  }
}, Ts = ["data-p"], Ps = ["data-p"];
function Os(e, t, n, r, o, a) {
  var s = Xt("SpinnerIcon"), c = Xt("Badge"), i = Ft("ripple");
  return e.asChild ? Y(e.$slots, "default", {
    key: 1,
    class: re(e.cx("root")),
    a11yAttrs: a.a11yAttrs
  }) : ze((b(), V(Qe(e.as), B({
    key: 0,
    class: e.cx("root"),
    "data-p": a.dataP
  }, a.attrs), {
    default: z(function() {
      return [Y(e.$slots, "default", {}, function() {
        return [e.loading ? Y(e.$slots, "loadingicon", B({
          key: 0,
          class: [e.cx("loadingIcon"), e.cx("icon")]
        }, e.ptm("loadingIcon")), function() {
          return [e.loadingIcon ? (b(), k("span", B({
            key: 0,
            class: [e.cx("loadingIcon"), e.cx("icon"), e.loadingIcon]
          }, e.ptm("loadingIcon")), null, 16)) : (b(), V(s, B({
            key: 1,
            class: [e.cx("loadingIcon"), e.cx("icon")],
            spin: ""
          }, e.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : Y(e.$slots, "icon", B({
          key: 1,
          class: [e.cx("icon")]
        }, e.ptm("icon")), function() {
          return [e.icon ? (b(), k("span", B({
            key: 0,
            class: [e.cx("icon"), e.icon, e.iconClass],
            "data-p": a.dataIconP
          }, e.ptm("icon")), null, 16, Ts)) : P("", !0)];
        }), e.label ? (b(), k("span", B({
          key: 2,
          class: e.cx("label")
        }, e.ptm("label"), {
          "data-p": a.dataLabelP
        }), T(e.label), 17, Ps)) : P("", !0), e.badge ? (b(), V(c, {
          key: 3,
          value: e.badge,
          class: re(e.badgeClass),
          severity: e.badgeSeverity,
          unstyled: e.unstyled,
          pt: e.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : P("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[i]]);
}
Jt.render = Os;
const Rn = /* @__PURE__ */ te({
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
    const n = e, r = t, o = Pt(), a = G(
      () => Object.prototype.hasOwnProperty.call(o?.vnode.props ?? {}, "active")
    ), s = G(
      () => n.variant === "danger" ? "danger" : n.variant === "bordered" ? "secondary" : void 0
    ), c = G(
      () => n.size === "sm" ? "small" : n.size === "lg" ? "large" : void 0
    );
    return (i, d) => (b(), V(g(Jt), {
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
      icon: z(() => [
        L(g(Q), {
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])
      ]),
      _: 1
    }, 8, ["severity", "text", "outlined", "size", "loading", "disabled", "pt"]));
  }
}), ve = /* @__PURE__ */ te({
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
    const n = e, r = t, o = G(
      () => n.variant === "danger" ? "danger" : n.variant === "primary" ? void 0 : "secondary"
    );
    return (a, s) => (b(), V(g(Jt), {
      type: e.type,
      severity: o.value,
      outlined: e.variant === "ghost",
      loading: e.loading,
      disabled: e.disabled || e.loading,
      size: e.small ? "small" : void 0,
      onClick: s[0] || (s[0] = (c) => r("click"))
    }, {
      default: z(() => [
        e.loading ? (b(), V(g(Zt), {
          key: 0,
          class: "p-button-loading-icon p-button-icon",
          spin: ""
        })) : P("", !0),
        e.icon && !e.loading ? (b(), V(g(Q), {
          key: 1,
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : P("", !0),
        Y(a.$slots, "default")
      ]),
      _: 3
    }, 8, ["type", "severity", "outlined", "loading", "disabled", "size"]));
  }
}), As = { class: "km-search" }, Ls = ["value", "placeholder"], Vn = /* @__PURE__ */ te({
  __name: "SearchField",
  props: {
    modelValue: {},
    placeholder: {}
  },
  emits: ["update:modelValue"],
  setup(e, { emit: t }) {
    const n = t;
    return (r, o) => (b(), k("div", As, [
      L(g(Q), {
        icon: "tabler:search",
        class: "km-search-ico",
        "aria-hidden": "true"
      }),
      h("input", {
        class: "km-search-input",
        value: e.modelValue,
        placeholder: e.placeholder || "Search",
        onInput: o[0] || (o[0] = (a) => n("update:modelValue", a.target.value))
      }, null, 40, Ls),
      e.modelValue ? (b(), k("button", {
        key: 0,
        class: "km-search-clear",
        "aria-label": "Clear search",
        onClick: o[1] || (o[1] = (a) => n("update:modelValue", ""))
      }, [
        L(g(Q), {
          icon: "tabler:x",
          "aria-hidden": "true"
        })
      ])) : P("", !0)
    ]));
  }
}), Es = { class: "km-field" }, Ns = { class: "km-field-label" }, js = {
  key: 0,
  class: "km-field-help"
}, Ne = /* @__PURE__ */ te({
  __name: "FormField",
  props: {
    label: {},
    help: {}
  },
  setup(e) {
    return (t, n) => (b(), k("label", Es, [
      h("span", Ns, T(e.label), 1),
      Y(t.$slots, "default"),
      e.help ? (b(), k("small", js, T(e.help), 1)) : P("", !0)
    ]));
  }
}), Is = ["type", "value", "placeholder", "readonly", "disabled", "autocomplete", "min", "max", "step"], He = /* @__PURE__ */ te({
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
    return (o, a) => (b(), k("input", {
      class: re(["km-input", e.mono && "mono"]),
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
    }, null, 42, Is));
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
`, Rs = {
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
}, Vs = M.extend({
  name: "tag",
  style: zs,
  classes: Rs
}), Bs = {
  name: "BaseTag",
  extends: Le,
  props: {
    value: null,
    severity: null,
    rounded: Boolean,
    icon: String
  },
  style: Vs,
  provide: function() {
    return {
      $pcTag: this,
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
function Ds(e, t, n) {
  return (t = Ms(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ms(e) {
  var t = Us(e, "string");
  return ct(t) == "symbol" ? t : t + "";
}
function Us(e, t) {
  if (ct(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ct(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var kr = {
  name: "Tag",
  extends: Bs,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return Ae(Ds({
        rounded: this.rounded
      }, this.severity, this.severity));
    }
  }
}, Ws = ["data-p"];
function Fs(e, t, n, r, o, a) {
  return b(), k("span", B({
    class: e.cx("root"),
    "data-p": a.dataP
  }, e.ptmi("root")), [e.$slots.icon ? (b(), V(Qe(e.$slots.icon), B({
    key: 0,
    class: e.cx("icon")
  }, e.ptm("icon")), null, 16, ["class"])) : e.icon ? (b(), k("span", B({
    key: 1,
    class: [e.cx("icon"), e.icon]
  }, e.ptm("icon")), null, 16)) : P("", !0), e.value != null || e.$slots.default ? Y(e.$slots, "default", {
    key: 2
  }, function() {
    return [h("span", B({
      class: e.cx("label")
    }, e.ptm("label")), T(e.value), 17)];
  }) : P("", !0)], 16, Ws);
}
kr.render = Fs;
const Hs = {
  key: 0,
  class: "km-pill-dot",
  "aria-hidden": "true"
}, Bn = /* @__PURE__ */ te({
  __name: "Pill",
  props: {
    severity: { default: "secondary" },
    dot: { type: Boolean },
    icon: {}
  },
  setup(e) {
    return (t, n) => (b(), V(g(kr), {
      severity: e.severity || void 0,
      class: "km-pill kx-tag-sm"
    }, {
      default: z(() => [
        e.dot ? (b(), k("span", Hs)) : e.icon ? (b(), V(g(Q), {
          key: 1,
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : P("", !0),
        Y(t.$slots, "default")
      ]),
      _: 3
    }, 8, ["severity"]));
  }
}), Ks = { class: "km-notice-text" }, wt = /* @__PURE__ */ te({
  __name: "Notice",
  props: {
    severity: { default: "info" }
  },
  emits: ["dismiss"],
  setup(e, { emit: t }) {
    const n = t, r = (o) => o === "danger" ? "tabler:alert-triangle" : o === "success" ? "tabler:circle-check" : "tabler:info-circle";
    return (o, a) => (b(), k("div", {
      class: re(["km-notice", `is-${e.severity}`]),
      role: "status"
    }, [
      L(g(Q), {
        icon: r(e.severity),
        "aria-hidden": "true"
      }, null, 8, ["icon"]),
      h("span", Ks, [
        Y(o.$slots, "default")
      ]),
      h("button", {
        class: "km-notice-x",
        "aria-label": "Dismiss",
        onClick: a[0] || (a[0] = (s) => n("dismiss"))
      }, [
        L(g(Q), {
          icon: "tabler:x",
          "aria-hidden": "true"
        })
      ])
    ], 2));
  }
});
var qs = `
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
`, Ys = {
  root: "p-progressspinner",
  spin: "p-progressspinner-spin",
  circle: "p-progressspinner-circle"
}, Gs = M.extend({
  name: "progressspinner",
  style: qs,
  classes: Ys
}), Qs = {
  name: "BaseProgressSpinner",
  extends: Le,
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
  style: Gs,
  provide: function() {
    return {
      $pcProgressSpinner: this,
      $parentInstance: this
    };
  }
}, wr = {
  name: "ProgressSpinner",
  extends: Qs,
  inheritAttrs: !1,
  computed: {
    svgStyle: function() {
      return {
        "animation-duration": this.animationDuration
      };
    }
  }
}, Zs = ["fill", "stroke-width"];
function Js(e, t, n, r, o, a) {
  return b(), k("div", B({
    class: e.cx("root"),
    role: "progressbar"
  }, e.ptmi("root")), [(b(), k("svg", B({
    class: e.cx("spin"),
    viewBox: "25 25 50 50",
    style: a.svgStyle
  }, e.ptm("spin")), [h("circle", B({
    class: e.cx("circle"),
    cx: "50",
    cy: "50",
    r: "20",
    fill: e.fill,
    "stroke-width": e.strokeWidth,
    strokeMiterlimit: "10"
  }, e.ptm("circle")), null, 16, Zs)], 16))], 16);
}
wr.render = Js;
const Xs = { class: "km-loading" }, el = { key: 0 }, Sr = /* @__PURE__ */ te({
  __name: "Spinner",
  props: {
    label: {}
  },
  setup(e) {
    return (t, n) => (b(), k("div", Xs, [
      L(g(wr), {
        style: { width: "22px", height: "22px", margin: "0" },
        "aria-label": e.label || "Loading"
      }, null, 8, ["aria-label"]),
      e.label ? (b(), k("span", el, T(e.label), 1)) : P("", !0)
    ]));
  }
}), tl = { class: "km-empty" }, nl = { class: "km-empty-title" }, rl = {
  key: 0,
  class: "km-empty-hint"
}, ol = /* @__PURE__ */ te({
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
    return (r, o) => (b(), k("div", tl, [
      L(g(Q), {
        icon: e.icon,
        class: "km-empty-ico",
        "aria-hidden": "true"
      }, null, 8, ["icon"]),
      h("div", nl, T(e.title), 1),
      e.hint ? (b(), k("p", rl, T(e.hint), 1)) : P("", !0),
      e.cta ? (b(), V(ve, {
        key: 1,
        icon: e.ctaIcon,
        onClick: o[0] || (o[0] = (a) => n("cta"))
      }, {
        default: z(() => [
          F(T(e.cta), 1)
        ]),
        _: 1
      }, 8, ["icon"])) : P("", !0)
    ]));
  }
}), al = { class: "kx-wcmount" }, il = {
  key: 0,
  class: "kx-wcmount-fail",
  role: "alert"
}, sl = /* @__PURE__ */ te({
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
    const n = e, r = t, o = R(null), a = R(!1);
    let s = null, c = 0;
    const i = /* @__PURE__ */ new Set();
    function d(m) {
      m.composedPath()[0] === s && (m.stopPropagation(), r("change", m.detail));
    }
    function l(m) {
      return m.composedPath()[0] !== s ? !1 : (m.stopPropagation(), !0);
    }
    function u(m) {
      l(m) && r("select", m.detail);
    }
    function p(m) {
      l(m) && r("created", m.detail);
    }
    function f(m) {
      l(m) && r("close", m.detail);
    }
    function S(m) {
      l(m) && r("error", m.detail);
    }
    function $(m) {
      if (typeof m == "string") return m;
      try {
        return JSON.stringify(m ?? {});
      } catch {
        return null;
      }
    }
    function _() {
      if (!s) return;
      const m = $(n.config);
      if (m !== null && s.setAttribute("config", m), n.schema !== void 0 && n.schema !== null) {
        const N = $(n.schema);
        N !== null && s.setAttribute("schema", N);
      }
      if (n.meta !== void 0 && n.meta !== null) {
        const N = $(n.meta);
        N !== null && s.setAttribute("meta", N);
      }
      n.provider && s.setAttribute("provider", n.provider), n.label && s.setAttribute("label", n.label);
      const j = n.attrs || {};
      for (const N of [...i])
        (!(N in j) || j[N] == null) && (s.removeAttribute(N), i.delete(N));
      for (const [N, W] of Object.entries(j)) {
        if (W == null) continue;
        const ae = typeof W == "object" ? $(W) : String(W);
        ae !== null && (s.setAttribute(N, ae), i.add(N));
      }
    }
    function C(m = s) {
      m && (m.removeEventListener("config-changed", d), m.removeEventListener("change", d), m.removeEventListener("select", u), m.removeEventListener("created", p), m.removeEventListener("close", f), m.removeEventListener("error", S), m === s && (s = null), i.clear());
    }
    async function O(m) {
      if (!customElements.get(m))
        try {
          await no(m, { timeoutMs: 8e3 });
        } catch {
        }
    }
    async function A() {
      const m = ++c, j = o.value, N = n.tag;
      if (a.value = !1, !!j && (C(), j.innerHTML = "", !!N))
        try {
          if (await O(N), m !== c || o.value !== j || n.tag !== N) return;
          const W = document.createElement(N);
          W.classList.add("kx-wcmount-surface"), s = W, _(), W.addEventListener("config-changed", d), W.addEventListener("change", d), W.addEventListener("select", u), W.addEventListener("created", p), W.addEventListener("close", f), W.addEventListener("error", S), W.style.display = "block", j.appendChild(W), a.value = !customElements.get(N);
        } catch {
          m === c && (a.value = !0);
        }
    }
    async function v() {
      a.value = !1, await Wt(), await A();
    }
    return Ut(A), Pe(() => n.tag, A), Pe(() => [n.config, n.schema, n.meta, n.provider, n.label, n.attrs], _, { deep: !0 }), Gr(() => {
      c += 1, C();
    }), (m, j) => (b(), k("div", al, [
      a.value ? (b(), k("div", il, [
        j[0] || (j[0] = h("span", null, "This setup panel couldn’t load.", -1)),
        h("button", {
          type: "button",
          onClick: v
        }, "Try again")
      ])) : (b(), k("div", {
        key: 1,
        ref_key: "host",
        ref: o
      }, null, 512))
    ]));
  }
}), ll = (e, t) => {
  const n = e.__vccOpts || e;
  for (const [r, o] of t)
    n[r] = o;
  return n;
}, Dn = /* @__PURE__ */ ll(sl, [["__scopeId", "data-v-3d6a00f1"]]);
function Ge(e, t) {
  const n = e?.response?.data ?? e?.data;
  return typeof n?.error == "string" && n.error ? n.error : typeof n?.message == "string" && n.message ? n.message : e instanceof Error ? e.message : t;
}
function cl() {
  const e = R([]), t = R([]), n = R(!0), r = R(!1), o = R("");
  let a = 0;
  async function s() {
    const d = ++a;
    n.value = !0, o.value = "";
    try {
      const [l, u] = await Promise.all([
        Ee.get("/api/v1/security/scopes"),
        Ee.get("/api/v1/security/policies")
      ]);
      if (d !== a) return;
      e.value = l.data?.scopes ?? [], t.value = u.data?.policies ?? [];
    } catch (l) {
      d === a && (o.value = Ge(l, "failed to load security"));
    } finally {
      d === a && (n.value = !1);
    }
  }
  async function c(d) {
    r.value = !0, o.value = "";
    try {
      return await Ee.post("/api/v1/security/scopes", d), await s(), !0;
    } catch (l) {
      return o.value = Ge(l, "failed to save scope"), !1;
    } finally {
      r.value = !1;
    }
  }
  async function i(d) {
    r.value = !0, o.value = "";
    try {
      return await Ee.delete(`/api/v1/security/scopes?slug=${encodeURIComponent(d)}`), await s(), !0;
    } catch (l) {
      return o.value = Ge(l, "failed to delete scope"), !1;
    } finally {
      r.value = !1;
    }
  }
  return { scopes: e, policies: t, loading: n, saving: r, error: o, load: s, saveScope: c, deleteScope: i };
}
function dl() {
  const e = R([]), t = R(!1), n = R(!1), r = R(""), o = R(""), a = R(null);
  let s = 0;
  async function c() {
    const l = ++s;
    t.value = !0, r.value = "";
    try {
      const { data: u } = await Ee.get("/api/v1/security/delegations");
      if (u?.success !== !0 || !Array.isArray(u.delegations))
        throw new Error(u?.error || "Delegation inventory is unconfirmed");
      l === s && (e.value = u.delegations);
    } catch (u) {
      l === s && (r.value = Ge(u, "Could not load act-as grants"));
    } finally {
      l === s && (t.value = !1);
    }
  }
  async function i() {
    if (!a.value || n.value) return;
    const l = a.value;
    n.value = !0, r.value = "", o.value = "";
    try {
      const { data: u } = l.method === "save" ? await Ee.post("/api/v1/security/delegations", l.request) : await Ee.delete("/api/v1/security/delegations", { data: l.request });
      if (u?.success !== !0) throw new Error(u?.error || "Act-as request is unconfirmed");
      a.value = null, o.value = l.method === "save" ? "Act-as grant saved" : "Act-as grant revoked", await c();
    } catch (u) {
      r.value = Ge(u, "Could not confirm act-as request");
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
const ul = {
  class: "ks-delegations",
  "aria-label": "Act-as grants"
}, pl = { class: "ks-builder-head" }, fl = {
  key: 0,
  role: "alert"
}, ml = ["disabled", "inert"], bl = {
  key: 0,
  "aria-label": "Selected operator groups"
}, vl = { class: "ks-delegation-all" }, hl = {
  key: 0,
  class: "ks-field-err"
}, gl = { key: 2 }, yl = {
  key: 4,
  class: "ks-delegation-table"
}, xl = { key: 5 }, kl = /* @__PURE__ */ te({
  __name: "Delegations",
  setup(e, { expose: t }) {
    const n = dl(), { delegations: r, loading: o, saving: a, error: s, confirmation: c, pending: i } = n, d = R(""), l = R(""), u = R(!1), p = R([]), f = G(() => a.value || !!i.value), S = G(() => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(l.value.trim())), $ = G(() => !!d.value && p.value.length > 0 && (u.value || S.value));
    function _(A, v) {
      if (!A || typeof A != "object") return;
      const m = A;
      f.value || m.type !== v || typeof m.id != "string" || (v === "user" ? d.value = m.id : m.id && !p.value.some((j) => j.id === m.id) && p.value.push({ id: m.id, label: typeof m.label == "string" ? m.label : m.id }));
    }
    function C(A) {
      s.value = A && typeof A == "object" && "message" in A ? String(A.message) : "Could not load the principal picker";
    }
    async function O() {
      $.value && await n.mutate("save", {
        principal: { kind: "user", id: d.value },
        root: u.value ? "*" : l.value.trim(),
        groups: p.value.map((A) => A.id)
      });
    }
    return t({ load: n.load }), (A, v) => (b(), k("section", ul, [
      h("div", pl, [
        v[7] || (v[7] = h("h2", { class: "ks-builder-title" }, "Act-as grants", -1)),
        L(g(ve), {
          variant: "ghost",
          disabled: g(o) || f.value,
          onClick: g(n).load
        }, {
          default: z(() => [...v[6] || (v[6] = [
            F("Refresh act-as grants", -1)
          ])]),
          _: 1
        }, 8, ["disabled", "onClick"])
      ]),
      v[16] || (v[16] = h("p", null, "Choose which operator groups may select an ordinary user account for execution. Account groups supply its access. An act-as grant also requires administration of the execution root and access to its declared resources.", -1)),
      g(s) ? (b(), k("div", fl, [
        L(g(wt), {
          severity: "danger",
          onDismiss: v[0] || (v[0] = (m) => s.value = "")
        }, {
          default: z(() => [
            F(T(g(s)), 1)
          ]),
          _: 1
        })
      ])) : P("", !0),
      g(c) ? (b(), V(g(wt), {
        key: 1,
        "data-test": "delegation-confirmation",
        severity: "success",
        onDismiss: v[1] || (v[1] = (m) => c.value = "")
      }, {
        default: z(() => [
          F(T(g(c)), 1)
        ]),
        _: 1
      })) : P("", !0),
      h("fieldset", {
        disabled: f.value,
        inert: f.value,
        class: "ks-delegation-form"
      }, [
        L(g(Ne), { label: "Execution account" }, {
          default: z(() => [
            L(Dn, {
              tag: "wc-principal-picker",
              attrs: { kinds: "user", placeholder: "Choose execution account…" },
              config: { principal_id: d.value },
              onChange: v[2] || (v[2] = (m) => _(m, "user")),
              onError: C
            }, null, 8, ["config"])
          ]),
          _: 1
        }),
        L(g(Ne), {
          label: "Operator groups",
          help: "Only members of these groups receive selection permission. This does not change any account membership."
        }, {
          default: z(() => [
            L(Dn, {
              tag: "wc-principal-picker",
              attrs: { kinds: "group", placeholder: "Add operator group…" },
              config: {},
              onChange: v[3] || (v[3] = (m) => _(m, "group")),
              onError: C
            })
          ]),
          _: 1
        }),
        p.value.length ? (b(), k("ul", bl, [
          (b(!0), k(fe, null, me(p.value, (m) => (b(), k("li", {
            key: m.id
          }, [
            h("span", null, [
              F(T(m.label) + " ", 1),
              h("small", null, T(m.id), 1)
            ]),
            L(g(ve), {
              variant: "ghost",
              small: "",
              "aria-label": `Remove operator group ${m.label}`,
              onClick: (j) => p.value = p.value.filter((N) => N.id !== m.id)
            }, {
              default: z(() => [...v[8] || (v[8] = [
                F("Remove", -1)
              ])]),
              _: 1
            }, 8, ["aria-label", "onClick"])
          ]))), 128))
        ])) : P("", !0),
        h("label", vl, [
          ze(h("input", {
            "onUpdate:modelValue": v[4] || (v[4] = (m) => u.value = m),
            type: "checkbox",
            "aria-label": "All component roots"
          }, null, 512), [
            [Qr, u.value]
          ]),
          v[9] || (v[9] = F("All component roots", -1))
        ]),
        u.value ? P("", !0) : (b(), V(g(Ne), {
          key: 1,
          label: "Component root",
          help: "The existing execution component UUID. Selection still requires administration of this root."
        }, {
          default: z(() => [
            L(g(He), {
              modelValue: l.value,
              "onUpdate:modelValue": v[5] || (v[5] = (m) => l.value = m),
              "aria-label": "Component root",
              placeholder: "Component UUID"
            }, null, 8, ["modelValue"]),
            l.value.trim() && !S.value ? (b(), k("small", hl, "Enter a component UUID or choose all component roots.")) : P("", !0)
          ]),
          _: 1
        })),
        L(g(ve), {
          disabled: !$.value || f.value,
          loading: g(a),
          onClick: O
        }, {
          default: z(() => [...v[10] || (v[10] = [
            F("Save act-as grant", -1)
          ])]),
          _: 1
        }, 8, ["disabled", "loading"])
      ], 8, ml),
      g(i) && !g(a) ? (b(), k("div", gl, [
        v[12] || (v[12] = h("p", null, "The result is unconfirmed. Retry the same request before editing this grant.", -1)),
        L(g(ve), {
          onClick: g(n).submit
        }, {
          default: z(() => [...v[11] || (v[11] = [
            F("Retry act-as request", -1)
          ])]),
          _: 1
        }, 8, ["onClick"])
      ])) : P("", !0),
      g(o) ? (b(), V(g(Sr), {
        key: 3,
        label: "Loading act-as grants…"
      })) : g(r).length ? (b(), k("table", yl, [
        v[14] || (v[14] = h("caption", null, "Native act-as grants", -1)),
        v[15] || (v[15] = h("thead", null, [
          h("tr", null, [
            h("th", { scope: "col" }, "Execution account"),
            h("th", { scope: "col" }, "Component root"),
            h("th", { scope: "col" }, "Operator groups"),
            h("th", { scope: "col" }, "Status"),
            h("th", { scope: "col" }, "Actions")
          ])
        ], -1)),
        h("tbody", null, [
          (b(!0), k(fe, null, me(g(r), (m) => (b(), k("tr", {
            key: m.policy_id
          }, [
            h("td", null, T(m.principal.id), 1),
            h("td", null, T(m.root === "*" ? "All component roots" : m.root), 1),
            h("td", null, T(m.groups.join(", ")), 1),
            h("td", null, T(m.active ? "Active" : "Revoked"), 1),
            h("td", null, [
              m.active ? (b(), V(g(ve), {
                key: 0,
                variant: "danger",
                small: "",
                disabled: f.value,
                "aria-label": `Revoke act-as grant for ${m.principal.id} at ${m.root}`,
                onClick: (j) => g(n).mutate("revoke", { principal: m.principal, root: m.root })
              }, {
                default: z(() => [...v[13] || (v[13] = [
                  F("Revoke", -1)
                ])]),
                _: 1
              }, 8, ["disabled", "aria-label", "onClick"])) : P("", !0)
            ])
          ]))), 128))
        ])
      ])) : g(s) ? P("", !0) : (b(), k("p", xl, "No act-as grants."))
    ]));
  }
}), wl = ["draggable"], Sl = { class: "ks-pcard-row" }, _l = { class: "ks-pcard-body" }, $l = { class: "ks-pcard-head" }, Cl = ["title"], Tl = {
  key: 0,
  class: "ks-pcard-comment"
}, Pl = ["title"], Ol = ["aria-label"], Al = {
  key: 0,
  class: "ks-pcard-detail"
}, Ll = {
  key: 0,
  class: "ks-pcard-kv"
}, El = { class: "ks-pcard-kv" }, Nl = { class: "ks-pcard-kv" }, jl = { class: "ks-pcard-tags" }, Il = {
  key: 0,
  class: "ks-pcard-none"
}, zl = { class: "ks-pcard-kv" }, Rl = { class: "ks-pcard-tags" }, Vl = {
  key: 0,
  class: "ks-pcard-none"
}, Tt = /* @__PURE__ */ te({
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
    const i = G(() => c(n.policy.actions)), d = G(() => c(n.policy.resources)), l = G(() => !!n.policy.effect || i.value.length > 0 || d.value.length > 0 || !!n.policy.surface);
    return (u, p) => (b(), k("div", {
      class: re(["ks-pcard", [e.mode, { expanded: o.value }]]),
      draggable: e.mode !== "locked",
      onDragstart: a,
      onDblclick: p[3] || (p[3] = (f) => e.mode === "palette" && r("add"))
    }, [
      h("div", Sl, [
        e.mode === "locked" ? (b(), V(g(Q), {
          key: 0,
          icon: "tabler:lock",
          class: "ks-pcard-grip locked",
          "aria-hidden": "true"
        })) : (b(), V(g(Q), {
          key: 1,
          icon: "tabler:grip-vertical",
          class: "ks-pcard-grip",
          "aria-hidden": "true"
        })),
        h("div", _l, [
          h("div", $l, [
            h("span", {
              class: "ks-pcard-title",
              title: e.policy.title || s(e.policy.id)
            }, T(e.policy.title || s(e.policy.id)), 9, Cl),
            e.policy.effect ? (b(), k("span", {
              key: 0,
              class: re(["ks-eff", e.policy.effect])
            }, T(e.policy.effect), 3)) : P("", !0)
          ]),
          e.policy.comment ? (b(), k("div", Tl, T(e.policy.comment), 1)) : P("", !0),
          h("div", {
            class: "ks-pcard-id",
            title: e.policy.id
          }, T(e.policy.id), 9, Pl)
        ]),
        l.value ? (b(), k("button", {
          key: 2,
          class: re(["ks-pcard-act detail", { open: o.value }]),
          "aria-label": o.value ? "Hide details" : "Show details",
          onClick: p[0] || (p[0] = Ke((f) => o.value = !o.value, ["stop"]))
        }, [
          L(g(Q), {
            icon: "tabler:chevron-right",
            "aria-hidden": "true"
          })
        ], 10, Ol)) : P("", !0),
        e.mode === "palette" ? (b(), k("button", {
          key: 3,
          class: "ks-pcard-act add",
          "aria-label": "Add policy",
          onClick: p[1] || (p[1] = Ke((f) => r("add"), ["stop"]))
        }, [
          L(g(Q), {
            icon: "tabler:plus",
            "aria-hidden": "true"
          })
        ])) : e.mode === "selected" ? (b(), k("button", {
          key: 4,
          class: "ks-pcard-act remove",
          "aria-label": "Remove policy",
          onClick: p[2] || (p[2] = Ke((f) => r("remove"), ["stop"]))
        }, [
          L(g(Q), {
            icon: "tabler:x",
            "aria-hidden": "true"
          })
        ])) : P("", !0)
      ]),
      o.value ? (b(), k("div", Al, [
        e.policy.surface || e.policy.intent ? (b(), k("div", Ll, [
          p[4] || (p[4] = h("span", null, "Surface", -1)),
          h("code", null, T(e.policy.surface || e.policy.intent), 1)
        ])) : P("", !0),
        h("div", El, [
          p[5] || (p[5] = h("span", null, "Effect", -1)),
          h("code", {
            class: re(["ks-eff-code", e.policy.effect])
          }, T(e.policy.effect || "—"), 3)
        ]),
        h("div", Nl, [
          p[6] || (p[6] = h("span", null, "Actions", -1)),
          h("div", jl, [
            (b(!0), k(fe, null, me(i.value, (f) => (b(), k("code", { key: f }, T(f), 1))), 128)),
            i.value.length ? P("", !0) : (b(), k("span", Il, "—"))
          ])
        ]),
        h("div", zl, [
          p[7] || (p[7] = h("span", null, "Resources", -1)),
          h("div", Rl, [
            (b(!0), k(fe, null, me(d.value, (f) => (b(), k("code", { key: f }, T(f), 1))), 128)),
            d.value.length ? P("", !0) : (b(), k("span", Vl, "—"))
          ])
        ])
      ])) : P("", !0)
    ], 42, wl));
  }
}), Bl = { class: "ks" }, Dl = { class: "ks-rail-search" }, Ml = { class: "ks-rail-list" }, Ul = {
  key: 0,
  class: "ks-rail-group"
}, Wl = ["onClick"], Fl = { class: "ks-scope-name" }, Hl = ["onClick"], Kl = { class: "ks-scope-name" }, ql = {
  key: 0,
  class: "ks-builder"
}, Yl = { class: "ks-builder-head" }, Gl = { class: "ks-builder-title" }, Ql = { class: "ks-builder-acts" }, Zl = {
  key: 0,
  class: "ks-overlay-warn"
}, Jl = { class: "ks-fields" }, Xl = {
  key: 0,
  class: "ks-field-err"
}, ec = {
  key: 0,
  class: "ks-pane locked-pane"
}, tc = { class: "ks-pane-head" }, nc = { class: "ks-pane-sub" }, rc = { class: "ks-pane-body" }, oc = {
  key: 0,
  class: "ks-pane-empty"
}, ac = { class: "ks-pane" }, ic = { class: "ks-pane-search" }, sc = { class: "ks-pane-body" }, lc = {
  key: 0,
  class: "ks-pane-empty"
}, cc = { class: "ks-pane-head" }, dc = { class: "ks-pane-sub" }, uc = { class: "ks-pane-body" }, pc = ["onDrop"], fc = {
  key: 0,
  class: "ks-drop-hint"
}, mc = {
  key: 1,
  class: "ks-view"
}, bc = { class: "ks-builder-head" }, vc = { class: "ks-builder-title" }, hc = { class: "ks-builder-acts" }, gc = { class: "ks-pane-body ks-view-list" }, yc = { class: "ks-view-pol-title" }, xc = {
  key: 1,
  class: "ks-view-pol-comment"
}, kc = { class: "ks-view-pol-id" }, wc = {
  key: 0,
  class: "ks-pane-empty"
}, Sc = {
  key: 0,
  class: "ks-ext-block"
}, _c = { class: "ks-ext-head" }, $c = { class: "ks-pane-body ks-view-list" }, Cc = { class: "ks-view-pol-title" }, Tc = {
  key: 1,
  class: "ks-view-pol-comment"
}, Pc = { class: "ks-view-pol-id" }, Oc = /* @__PURE__ */ te({
  __name: "Security",
  setup(e) {
    const t = cl(), { scopes: n, policies: r, loading: o, saving: a, error: s } = t, c = R(""), i = R(""), d = R(null), l = R(null), u = R("scopes"), p = R(null), f = R(!1);
    async function S(w) {
      u.value = String(w), w === "delegations" && (f.value = !0, await Wt(), await p.value?.load());
    }
    No(async () => {
      await t.load(), u.value === "delegations" && await p.value?.load();
    });
    const $ = G(() => {
      const w = {};
      for (const y of r.value) w[y.id] = y;
      return w;
    }), _ = G(() => {
      const w = c.value.trim().toLowerCase(), y = (x) => !w || x.label.toLowerCase().includes(w) || x.id.toLowerCase().includes(w);
      return {
        custom: n.value.filter((x) => x.source === "custom" && y(x)),
        builtin: n.value.filter((x) => x.source !== "custom" && y(x))
      };
    }), C = G(() => n.value.find((w) => w.id === d.value) || null), O = G(() => C.value && C.value.source !== "custom" ? C.value : null), A = G(() => {
      if (!l.value) return [];
      const w = /* @__PURE__ */ new Set([...l.value.policies, ...l.value.base.map((x) => x.id)]), y = i.value.trim().toLowerCase();
      return r.value.filter((x) => !w.has(x.id) && (!y || (x.title || "").toLowerCase().includes(y) || x.id.toLowerCase().includes(y) || (x.comment || "").toLowerCase().includes(y)));
    }), v = G(
      () => l.value ? l.value.policies.map((w) => $.value[w] || { id: w }) : []
    );
    function m(w) {
      d.value = w.id, l.value = w.source === "custom" ? { slug: w.slug || "", label: w.label, description: w.description, policies: w.policies.map((y) => y.id), enabled: w.enabled, isNew: !1, target: "", base: [] } : null;
    }
    function j() {
      d.value = null, l.value = { slug: "", label: "", description: "", policies: [], enabled: !0, isNew: !0, target: "", base: [] };
    }
    function N(w) {
      d.value = null, l.value = {
        slug: "",
        label: w.label ? `Copy of ${w.label}` : "",
        description: w.description,
        policies: [...w.policies.map((y) => y.id), ...(w.overlay_policies ?? []).map((y) => y.id)],
        enabled: !0,
        isNew: !0,
        target: "",
        base: []
      };
    }
    function W(w) {
      return w.replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "");
    }
    function ae(w) {
      d.value = w.id, l.value = {
        slug: w.overlay_slug || W(w.id),
        label: w.label || J(w.id),
        description: w.description,
        policies: (w.overlay_policies ?? []).map((y) => y.id),
        enabled: !0,
        isNew: !w.overlay_slug,
        target: w.id,
        base: w.policies
      };
    }
    const q = G(() => !!l.value && l.value.target !== "");
    function ce(w) {
      l.value && !l.value.policies.includes(w) && l.value.policies.push(w);
    }
    function we(w) {
      l.value && (l.value.policies = l.value.policies.filter((y) => y !== w));
    }
    function Se(w) {
      const y = w.dataTransfer?.getData("text/plain");
      y && ce(y);
    }
    function he(w, y) {
      w.stopPropagation();
      const x = w.dataTransfer?.getData("text/plain");
      if (!x || !l.value || x === y) return;
      const ee = l.value.policies, ut = ee.indexOf(x);
      ut !== -1 && ee.splice(ut, 1);
      const pt = ee.indexOf(y);
      ee.splice(pt === -1 ? ee.length : pt, 0, x);
    }
    const de = G(() => {
      if (!l.value || !l.value.isNew || l.value.target !== "") return "";
      const w = l.value.slug.trim();
      return w && !/^[a-z0-9][\w.-]*$/i.test(w) ? "Slug must be alphanumeric (with _.-)" : "";
    }), _e = G(() => !!l.value && l.value.slug.trim() !== "" && !de.value && l.value.policies.length > 0), ie = R("");
    let ge = null;
    function Ce(w) {
      ie.value = w, ge && clearTimeout(ge), ge = setTimeout(() => {
        ie.value = "";
      }, 3e3);
    }
    async function ue() {
      if (!l.value || !_e.value) return;
      const w = l.value.slug.trim(), y = l.value.target, x = l.value.label.trim() || w;
      await t.saveScope({
        slug: w,
        target: y,
        label: l.value.label.trim(),
        description: l.value.description.trim(),
        policies: l.value.policies,
        enabled: l.value.enabled
      }) && (d.value = y || `kickside.security.scopes:${w}`, Ce(`Saved “${x}”. The role will be available when assigning users.`));
    }
    async function le() {
      if (!l.value || l.value.isNew) return;
      const w = q.value;
      if (!await Wn.confirm({
        header: w ? "Remove extension?" : "Delete role?",
        message: w ? "This removes the added permissions. Users keep the role’s original permissions." : "This removes the custom role and its permissions.",
        icon: "tabler:trash",
        acceptLabel: w ? "Remove extension" : "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      })) return;
      await t.deleteScope(l.value.slug) && (l.value = null, d.value = null);
    }
    function J(w) {
      return w.includes(":") ? w.split(":").slice(-1)[0] : w;
    }
    return (w, y) => (b(), k("div", Bl, [
      L(g(yr), {
        value: u.value,
        "onUpdate:value": S
      }, {
        default: z(() => [
          L(g(gr), { pt: { tabList: { "aria-label": "Security administration" } } }, {
            default: z(() => [
              L(g(Vt), { value: "scopes" }, {
                default: z(() => [...y[12] || (y[12] = [
                  F("Roles", -1)
                ])]),
                _: 1
              }),
              L(g(Vt), {
                value: "delegations",
                "data-tab": "delegations"
              }, {
                default: z(() => [...y[13] || (y[13] = [
                  F("Act-as grants", -1)
                ])]),
                _: 1
              })
            ]),
            _: 1
          })
        ]),
        _: 1
      }, 8, ["value"]),
      f.value ? ze((b(), V(kl, {
        key: 0,
        ref_key: "delegationPanel",
        ref: p
      }, null, 512)), [
        [en, u.value === "delegations"]
      ]) : P("", !0),
      g(s) ? (b(), V(g(wt), {
        key: 1,
        severity: "danger",
        class: "ks-top-notice",
        onDismiss: y[0] || (y[0] = (x) => s.value = "")
      }, {
        default: z(() => [
          F(T(g(s)), 1)
        ]),
        _: 1
      })) : ie.value ? (b(), V(g(wt), {
        key: 2,
        severity: "success",
        class: "ks-top-notice",
        onDismiss: y[1] || (y[1] = (x) => ie.value = "")
      }, {
        default: z(() => [
          F(T(ie.value), 1)
        ]),
        _: 1
      })) : P("", !0),
      u.value === "scopes" && g(o) && !g(n).length ? (b(), V(g(Sr), {
        key: 3,
        label: "Loading security…"
      })) : ze((b(), V(g(Xi), { key: 4 }, {
        rail: z(() => [
          L(g(os), {
            title: "Roles",
            count: g(n).length
          }, {
            actions: z(() => [
              L(g(Rn), {
                icon: "tabler:plus",
                label: "New role",
                disabled: g(a),
                onClick: j
              }, null, 8, ["disabled"]),
              L(g(Rn), {
                icon: "tabler:refresh",
                label: "Refresh",
                disabled: g(o),
                spin: g(o),
                onClick: g(t).load
              }, null, 8, ["disabled", "spin", "onClick"])
            ]),
            _: 1
          }, 8, ["count"]),
          h("div", Dl, [
            L(g(Vn), {
              modelValue: c.value,
              "onUpdate:modelValue": y[2] || (y[2] = (x) => c.value = x),
              placeholder: "Find a role…"
            }, null, 8, ["modelValue"])
          ]),
          h("div", Ml, [
            _.value.custom.length ? (b(), k("div", Ul, "Custom")) : P("", !0),
            (b(!0), k(fe, null, me(_.value.custom, (x) => (b(), k("button", {
              key: x.id,
              class: re(["ks-scope-row", { active: x.id === d.value }]),
              onClick: (ee) => m(x)
            }, [
              h("span", Fl, T(x.label || J(x.id)), 1)
            ], 10, Wl))), 128)),
            y[14] || (y[14] = h("div", { class: "ks-rail-group" }, "Default", -1)),
            (b(!0), k(fe, null, me(_.value.builtin, (x) => (b(), k("button", {
              key: x.id,
              class: re(["ks-scope-row", { active: x.id === d.value }]),
              onClick: (ee) => m(x)
            }, [
              h("span", Kl, T(x.label || J(x.id)), 1)
            ], 10, Hl))), 128))
          ])
        ]),
        default: z(() => [
          l.value ? (b(), k("div", ql, [
            h("div", Yl, [
              h("div", Gl, [
                L(g(Q), {
                  icon: q.value ? "tabler:stack-2" : "tabler:shield-lock",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                h("span", null, T(q.value ? `Extend ${l.value.label || J(l.value.target)}` : l.value.isNew ? "New role" : l.value.label || l.value.slug), 1),
                q.value ? (b(), V(g(Bn), {
                  key: 0,
                  severity: "warn"
                }, {
                  default: z(() => [...y[15] || (y[15] = [
                    F("overlay", -1)
                  ])]),
                  _: 1
                })) : P("", !0)
              ]),
              h("div", Ql, [
                !l.value.isNew && !q.value && C.value ? (b(), V(g(ve), {
                  key: 0,
                  variant: "soft",
                  small: "",
                  icon: "tabler:copy",
                  disabled: g(a),
                  onClick: y[3] || (y[3] = (x) => N(C.value))
                }, {
                  default: z(() => [...y[16] || (y[16] = [
                    F("Duplicate", -1)
                  ])]),
                  _: 1
                }, 8, ["disabled"])) : P("", !0),
                l.value.isNew ? P("", !0) : (b(), V(g(ve), {
                  key: 1,
                  variant: "danger",
                  small: "",
                  icon: "tabler:trash",
                  disabled: g(a),
                  onClick: le
                }, {
                  default: z(() => [
                    F(T(q.value ? "Remove extension" : "Delete"), 1)
                  ]),
                  _: 1
                }, 8, ["disabled"])),
                L(g(ve), {
                  variant: "primary",
                  small: "",
                  icon: "tabler:device-floppy",
                  loading: g(a),
                  disabled: !_e.value,
                  onClick: ue
                }, {
                  default: z(() => [
                    F(T(q.value ? "Save extension" : "Save role"), 1)
                  ]),
                  _: 1
                }, 8, ["loading", "disabled"])
              ])
            ]),
            q.value ? (b(), k("div", Zl, [
              L(g(Q), {
                icon: "tabler:alert-triangle",
                "aria-hidden": "true"
              }),
              h("span", null, [
                y[17] || (y[17] = F("Adding permissions to this role grants them to ", -1)),
                h("b", null, "every user with the " + T(J(l.value.target)) + " role", 1),
                y[18] || (y[18] = F(". The original permissions stay in place.", -1))
              ])
            ])) : P("", !0),
            h("div", Jl, [
              q.value ? (b(), V(g(Ne), {
                key: 1,
                label: "Extends"
              }, {
                default: z(() => [
                  L(g(He), {
                    "model-value": l.value.target,
                    disabled: ""
                  }, null, 8, ["model-value"])
                ]),
                _: 1
              })) : (b(), V(g(Ne), {
                key: 0,
                label: "Slug",
                help: l.value.isNew ? "Lowercase id; cannot change later." : void 0
              }, {
                default: z(() => [
                  L(g(He), {
                    modelValue: l.value.slug,
                    "onUpdate:modelValue": y[4] || (y[4] = (x) => l.value.slug = x),
                    disabled: !l.value.isNew,
                    placeholder: "reviewer"
                  }, null, 8, ["modelValue", "disabled"]),
                  de.value ? (b(), k("span", Xl, T(de.value), 1)) : P("", !0)
                ]),
                _: 1
              }, 8, ["help"])),
              L(g(Ne), { label: "Label" }, {
                default: z(() => [
                  L(g(He), {
                    modelValue: l.value.label,
                    "onUpdate:modelValue": y[5] || (y[5] = (x) => l.value.label = x),
                    placeholder: "Reviewer"
                  }, null, 8, ["modelValue"])
                ]),
                _: 1
              }),
              L(g(Ne), { label: "Description" }, {
                default: z(() => [
                  L(g(He), {
                    modelValue: l.value.description,
                    "onUpdate:modelValue": y[6] || (y[6] = (x) => l.value.description = x),
                    placeholder: "Read-only reviewer role"
                  }, null, 8, ["modelValue"])
                ]),
                _: 1
              })
            ]),
            h("div", {
              class: re(["ks-panes", { three: q.value }])
            }, [
              q.value ? (b(), k("section", ec, [
                h("header", tc, [
                  y[19] || (y[19] = h("span", null, "Base policies", -1)),
                  h("span", nc, T(l.value.base.length) + " · locked", 1)
                ]),
                h("div", rc, [
                  (b(!0), k(fe, null, me(l.value.base, (x) => (b(), V(Tt, {
                    key: x.id,
                    policy: x,
                    mode: "locked"
                  }, null, 8, ["policy"]))), 128)),
                  l.value.base.length ? P("", !0) : (b(), k("div", oc, "No base policies."))
                ])
              ])) : P("", !0),
              h("section", ac, [
                y[20] || (y[20] = h("header", { class: "ks-pane-head" }, [
                  h("span", null, "Available policies"),
                  h("span", { class: "ks-pane-sub" }, "public only · drag or click +")
                ], -1)),
                h("div", ic, [
                  L(g(Vn), {
                    modelValue: i.value,
                    "onUpdate:modelValue": y[7] || (y[7] = (x) => i.value = x),
                    placeholder: "Search policies…"
                  }, null, 8, ["modelValue"])
                ]),
                h("div", sc, [
                  (b(!0), k(fe, null, me(A.value, (x) => (b(), V(Tt, {
                    key: x.id,
                    policy: x,
                    mode: "palette",
                    onAdd: (ee) => ce(x.id)
                  }, null, 8, ["policy", "onAdd"]))), 128)),
                  A.value.length ? P("", !0) : (b(), k("div", lc, "No matching public policies."))
                ])
              ]),
              h("section", {
                class: "ks-pane drop",
                onDragover: y[9] || (y[9] = Ke(() => {
                }, ["prevent"])),
                onDrop: Se
              }, [
                h("header", cc, [
                  h("span", null, T(q.value ? "Added by you" : "In this role"), 1),
                  h("span", dc, T(l.value.policies.length) + " " + T(l.value.policies.length === 1 ? "policy" : "policies"), 1)
                ]),
                h("div", uc, [
                  (b(!0), k(fe, null, me(v.value, (x) => (b(), k("div", {
                    key: x.id,
                    onDragover: y[8] || (y[8] = Ke(() => {
                    }, ["prevent"])),
                    onDrop: (ee) => he(ee, x.id)
                  }, [
                    L(Tt, {
                      policy: x,
                      mode: "selected",
                      onRemove: (ee) => we(x.id)
                    }, null, 8, ["policy", "onRemove"])
                  ], 40, pc))), 128)),
                  l.value.policies.length ? P("", !0) : (b(), k("div", fc, [
                    L(g(Q), {
                      icon: "tabler:drag-drop",
                      "aria-hidden": "true"
                    }),
                    h("span", null, T(q.value ? "Drag permissions here to extend this role." : "Drag permissions here to grant them to this role."), 1)
                  ]))
                ])
              ], 32)
            ], 2)
          ])) : O.value ? (b(), k("div", mc, [
            h("div", bc, [
              h("div", vc, [
                L(g(Q), {
                  icon: "tabler:shield",
                  "aria-hidden": "true"
                }),
                h("span", null, T(O.value.label || J(O.value.id)), 1)
              ]),
              h("div", hc, [
                L(g(ve), {
                  variant: "primary",
                  small: "",
                  icon: "tabler:stack-2",
                  onClick: y[10] || (y[10] = (x) => ae(O.value))
                }, {
                  default: z(() => [
                    F(T(O.value.overlay_slug ? "Edit extension" : "Add permissions"), 1)
                  ]),
                  _: 1
                }),
                L(g(ve), {
                  variant: "soft",
                  small: "",
                  icon: "tabler:copy",
                  onClick: y[11] || (y[11] = (x) => N(O.value))
                }, {
                  default: z(() => [...y[21] || (y[21] = [
                    F("Copy role", -1)
                  ])]),
                  _: 1
                })
              ])
            ]),
            y[23] || (y[23] = h("p", { class: "ks-view-note" }, " Included with the application. You can add permissions or copy it to create your own role. ", -1)),
            h("div", gc, [
              (b(!0), k(fe, null, me(O.value.policies, (x) => (b(), k("div", {
                key: x.id,
                class: "ks-view-pol"
              }, [
                h("span", yc, T(x.title || J(x.id)), 1),
                x.effect ? (b(), k("span", {
                  key: 0,
                  class: re(["ks-eff", x.effect])
                }, T(x.effect), 3)) : P("", !0),
                x.comment ? (b(), k("div", xc, T(x.comment), 1)) : P("", !0),
                h("div", kc, T(x.id), 1)
              ]))), 128)),
              O.value.policies.length ? P("", !0) : (b(), k("div", wc, "No permissions in this role."))
            ]),
            O.value.overlay_policies && O.value.overlay_policies.length ? (b(), k("div", Sc, [
              h("div", _c, [
                L(g(Q), {
                  icon: "tabler:stack-2",
                  "aria-hidden": "true"
                }),
                y[22] || (y[22] = h("span", null, "Extensions", -1)),
                L(g(Bn), { severity: "warn" }, {
                  default: z(() => [
                    F("overlay · " + T(O.value.overlay_policies.length), 1)
                  ]),
                  _: 1
                })
              ]),
              h("div", $c, [
                (b(!0), k(fe, null, me(O.value.overlay_policies, (x) => (b(), k("div", {
                  key: x.id,
                  class: "ks-view-pol"
                }, [
                  h("span", Cc, T(x.title || J(x.id)), 1),
                  x.effect ? (b(), k("span", {
                    key: 0,
                    class: re(["ks-eff", x.effect])
                  }, T(x.effect), 3)) : P("", !0),
                  x.comment ? (b(), k("div", Tc, T(x.comment), 1)) : P("", !0),
                  h("div", Pc, T(x.id), 1)
                ]))), 128))
              ])
            ])) : P("", !0)
          ])) : (b(), V(g(ol), {
            key: 2,
            icon: "tabler:shield-lock",
            title: "Roles",
            hint: "Choose a role to view its permissions, or create a role for your team.",
            cta: "New role",
            "cta-icon": "tabler:plus",
            onCta: j
          }))
        ]),
        _: 1
      }, 512)), [
        [en, u.value === "scopes"]
      ])
    ]));
  }
}), Ac = ':root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}.kx-tag-sm,.kx-tag-sm.kx-tag-sm{display:inline-flex;align-items:center;gap:4px;padding:1px 7px;border-radius:var(--kx-radius-tag, 6px);font-size:10.5px;font-weight:600;line-height:1.5;white-space:nowrap}.kx-tag-sm svg,.kx-tag-sm.kx-tag-sm svg{width:12px;height:12px}.kx-tag-caps,.kx-tag-caps.kx-tag-caps{display:inline-flex;align-items:center;gap:3px;padding:2px 6px;border-radius:var(--kx-radius-tag, 6px);font-size:9px;font-weight:700;line-height:1.5;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap}.kx-tag-caps svg,.kx-tag-caps.kx-tag-caps svg{width:11px;height:11px}:host,:root{--kx-surface-1: color-mix(in srgb, var(--p-content-background) 96%, var(--p-text-color) 4%);--kx-surface-2: color-mix(in srgb, var(--p-content-background) 92%, var(--p-text-color) 8%);--kx-surface-3: color-mix(in srgb, var(--p-content-background) 86%, var(--p-text-color) 14%);--kx-surface-4: color-mix(in srgb, var(--p-content-background) 78%, var(--p-text-color) 22%);--kx-border-strong: color-mix(in srgb, var(--p-content-border-color) 60%, var(--p-text-color) 40%);--kx-border-stronger: color-mix(in srgb, var(--p-content-border-color) 30%, var(--p-text-color) 70%);--kx-text-faint: color-mix(in srgb, var(--p-text-muted-color) 70%, var(--p-content-background) 30%);--kx-text-fainter: color-mix(in srgb, var(--p-text-muted-color) 45%, var(--p-content-background) 55%);--kx-wash-primary: color-mix(in srgb, var(--p-primary-color) 12%, var(--p-content-background) 88%);--kx-wash-success: color-mix(in srgb, var(--p-success-500) 12%, var(--p-content-background) 88%);--kx-wash-info: color-mix(in srgb, var(--p-info-500) 12%, var(--p-content-background) 88%);--kx-wash-warn: color-mix(in srgb, var(--p-warn-500) 12%, var(--p-content-background) 88%);--kx-wash-danger: color-mix(in srgb, var(--p-danger-500) 12%, var(--p-content-background) 88%);--kx-wash-help: color-mix(in srgb, var(--p-help-500) 12%, var(--p-content-background) 88%);--kx-font-heading: "Outfit", system-ui, sans-serif;--kx-font-body: "Inter", system-ui, sans-serif;--kx-radius-4: 4px;--kx-radius-6: 6px;--kx-radius-8: 8px;--kx-radius-10: 10px;--kx-radius-14: 14px;--kx-radius-16: 16px;--kx-radius-tag: var(--p-content-border-radius, 6px);--kx-control-height: 34px;--kx-control-height-sm: 30px;--kx-rail-width: 264px;--kx-reading-measure: 880px;--kx-row-height: 32px;--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .08);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .12);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .18);--kx-overlay-hover: color-mix(in srgb, var(--p-text-color) 7%, transparent);--kx-overlay-subtle: color-mix(in srgb, var(--p-text-color) 4%, transparent)}@media(prefers-color-scheme:dark){:host(:not(.w-theme-light)),:root:not(.w-theme-light){--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .35);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .45);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .6)}}:host(.w-theme-dark),:root.w-theme-dark{--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .35);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .45);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .6)}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}:host{display:block;height:100%;min-height:0;--km-rail-w: 296px;--system-surface-gutter: var(--kickside-system-surface-gutter, 24px)}:host>div{height:100%;min-height:0}*,*:before,*:after{box-sizing:border-box}.km{height:100%;min-height:0;display:flex;flex-direction:column;background:var(--p-content-background);color:var(--p-text-color);font-family:inherit}.km-top-notice{width:calc(100% - (var(--system-surface-gutter) * 2));margin:12px 0 0 var(--system-surface-gutter)}.km-shell{flex:1;min-height:0;width:100%;margin:0;display:grid;grid-template-columns:var(--km-rail-w) minmax(0,1fr);border-left:1px solid var(--p-content-border-color);border-right:1px solid var(--p-content-border-color)}.km-rail{min-width:0;min-height:0;display:flex;flex-direction:column;border-right:1px solid var(--p-content-border-color)}.km-rail-body{flex:1;min-height:0;overflow:auto;padding:6px}.km-main{min-width:0;min-height:0;display:flex;flex-direction:column;overflow:hidden}.km-railhead{flex:0 0 auto;display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:48px;padding:0 8px 0 14px;border-bottom:1px solid var(--p-content-border-color)}.km-railhead-title{display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:760;letter-spacing:.03em;text-transform:uppercase;color:var(--p-text-muted-color)}.km-railhead-title b{min-width:18px;padding:1px 6px;border-radius:999px;background:var(--kx-overlay-subtle);color:var(--p-text-color);font-size:11px;font-weight:700;text-align:center}.km-railhead-acts{display:inline-flex;align-items:center;gap:2px}.km-input{width:100%;min-width:0;height:34px;padding:0 10px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);background:var(--p-content-background);color:var(--p-text-color);font:inherit;font-size:13px}.km-input:read-only{color:var(--p-text-muted-color);background:var(--kx-overlay-subtle)}.km-input:disabled{opacity:.6}.km-input.mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}.km-textarea{height:auto;min-height:120px;padding:9px 10px;line-height:1.45;resize:vertical}.km-search{position:relative;display:flex;align-items:center;min-width:0}.km-search-ico{position:absolute;left:9px;width:16px;height:16px;color:var(--p-text-muted-color);pointer-events:none}.km-search-input{width:100%;height:34px;padding:0 30px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);background:var(--p-content-background);color:var(--p-text-color);font:inherit;font-size:13px}.km-search-clear{position:absolute;right:6px;width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:6px;background:transparent;color:var(--p-text-muted-color);cursor:pointer}.km-search-clear:hover{color:var(--p-text-color);background:var(--kx-overlay-hover)}.km-search-clear svg{width:14px;height:14px}.km-select{position:relative;min-width:0;display:flex}.km-select-el{width:100%;height:34px;padding:0 30px 0 10px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);background:var(--p-content-background);color:var(--p-text-color);font:inherit;font-size:13px;cursor:pointer;appearance:none}.km-select-chev{position:absolute;right:9px;top:50%;transform:translateY(-50%);width:15px;height:15px;color:var(--p-text-muted-color);pointer-events:none}.km-field{min-width:0;display:flex;flex-direction:column;gap:5px}.km-field-label{color:var(--p-text-muted-color);font-size:11.5px;font-weight:680}.km-field-help{color:var(--p-text-muted-color);font-size:11.5px;line-height:1.35}.km-pill{max-width:190px;overflow:hidden;text-overflow:ellipsis}.km-pill-dot{width:6px;height:6px;border-radius:50%;background:currentColor}.km-notice{display:flex;align-items:center;gap:9px;padding:9px 10px 9px 12px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);font-size:13px}.km-notice svg{width:17px;height:17px;flex:0 0 auto}.km-notice-text{flex:1;min-width:0}.km-notice.is-info{color:var(--p-text-color);background:var(--kx-overlay-subtle)}.km-notice.is-danger{color:var(--p-danger-600, var(--p-danger-500));border-color:color-mix(in srgb,var(--p-danger-500) 32%,var(--p-content-border-color));background:color-mix(in srgb,var(--p-danger-500) 9%,transparent)}.km-notice.is-success{color:var(--p-success-700);border-color:color-mix(in srgb,var(--p-success-500) 36%,var(--p-content-border-color));background:color-mix(in srgb,var(--p-success-500) 12%,transparent)}.km-notice-x{width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:6px;background:transparent;color:inherit;cursor:pointer;opacity:.7}.km-notice-x:hover{opacity:1;background:color-mix(in srgb,currentColor 12%,transparent)}.km-notice-x svg{width:14px;height:14px}.km-loading{display:flex;align-items:center;justify-content:center;gap:9px;padding:40px 20px;color:var(--p-text-muted-color);font-size:13px}.km-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:48px 24px;text-align:center}.km-empty-ico{width:30px;height:30px;color:var(--p-text-muted-color)}.km-empty-title{font-size:14px;font-weight:720}.km-empty-hint{margin:0;max-width:340px;color:var(--p-text-muted-color);font-size:12.5px;line-height:1.45}.km-empty .p-button{margin-top:4px}.km-plist{display:flex;flex-direction:column;gap:2px}.km-plist-all{width:100%;height:32px;display:flex;align-items:center;padding:0 10px;border:0;border-radius:var(--kx-radius-8);background:transparent;color:var(--p-text-muted-color);font:inherit;font-size:12.5px;font-weight:640;text-align:left;cursor:pointer}.km-plist-all:hover{background:var(--kx-overlay-hover);color:var(--p-text-color)}.km-plist-all.on{background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);color:var(--p-primary-color)}.km-plist-empty{display:flex;flex-direction:column;align-items:flex-start;gap:8px;padding:10px;color:var(--p-text-muted-color);font-size:12.5px}.km-plist-empty p{margin:0}.km-picker{display:flex;flex-direction:column;gap:18px}.km-picker-sec{display:flex;flex-direction:column;gap:7px}.km-picker-sec-title{color:var(--p-text-muted-color);font-size:11px;font-weight:760;letter-spacing:.03em;text-transform:uppercase}.km-picker-list{display:flex;flex-direction:column;gap:4px}.km-picker-item{display:grid;grid-template-columns:32px minmax(0,1fr) 16px;align-items:center;gap:11px;padding:9px 10px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);background:transparent;color:var(--p-text-color);font:inherit;text-align:left;cursor:pointer;transition:border-color .12s ease,background-color .12s ease}.km-picker-item:hover{border-color:color-mix(in srgb,var(--p-primary-color) 50%,var(--p-content-border-color));background:var(--kx-overlay-hover)}.km-picker-ico{width:32px;height:32px;display:inline-flex;align-items:center;justify-content:center;border-radius:var(--kx-radius-8);color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 11%,transparent)}.km-picker-ico svg{width:18px;height:18px}.km-picker-body{min-width:0;display:flex;flex-direction:column;gap:2px}.km-picker-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;font-weight:660}.km-picker-desc{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--p-text-muted-color);font-size:11.5px}.km-picker-go{width:16px;height:16px;color:var(--p-text-muted-color)}.km-form{display:flex;flex-direction:column;gap:16px}.km-editor-head{display:flex;align-items:center;gap:11px}.km-editor-head-text{min-width:0}.km-editor-head-title{font-size:14px;font-weight:740}.km-editor-head-sub{margin-top:2px;color:var(--p-text-muted-color);font-size:12px;line-height:1.4}.km-form-sec{display:flex;flex-direction:column;gap:10px}.km-form-sec+.km-form-sec{padding-top:16px;border-top:1px solid var(--p-content-border-color)}.km-form-sec-title{color:var(--p-text-muted-color);font-size:11px;font-weight:760;letter-spacing:.03em;text-transform:uppercase}.km-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}.km-form-grid.four{grid-template-columns:repeat(4,minmax(0,1fr))}.km-form-foot{position:sticky;bottom:-16px;display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px;margin:0 -16px -16px;padding:14px 16px;border-top:1px solid var(--p-content-border-color);background:var(--p-content-background)}.km-form-id{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11.5px;color:var(--p-text-muted-color)}.km-form-foot-sp{flex:1}.km-adv-toggle{display:inline-flex;align-items:center;gap:6px;padding:0;border:0;background:transparent;color:var(--p-text-muted-color);font:inherit;font-size:11px;font-weight:760;letter-spacing:.03em;text-transform:uppercase;cursor:pointer}.km-adv-toggle:hover{color:var(--p-text-color)}.km-adv-chev{width:14px;height:14px;transition:transform .15s ease}.km-adv-toggle.open .km-adv-chev{transform:rotate(90deg)}.km-adv-body{display:flex;flex-direction:column;gap:10px;margin-top:10px}.km-test-result{display:flex;align-items:center;gap:8px;padding:8px 11px;border-radius:var(--kx-radius-8);font-size:12.5px}.km-test-result svg{width:16px;height:16px;flex:0 0 auto}.km-test-result span{min-width:0;overflow-wrap:anywhere}.km-test-result.testing{color:var(--p-text-muted-color);background:var(--kx-overlay-subtle)}.km-test-result.ok{color:var(--p-success-600, var(--p-success-500));background:color-mix(in srgb,var(--p-success-500) 12%,transparent)}.km-test-result.fail{color:var(--p-danger-600, var(--p-danger-500));background:color-mix(in srgb,var(--p-danger-500) 10%,transparent)}.km-probe{border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);font-size:13px}.km-probe.ok{border-color:color-mix(in srgb,var(--p-success-500) 30%,var(--p-content-border-color));background:color-mix(in srgb,var(--p-success-500) 8%,transparent)}.km-probe.fail{border-color:color-mix(in srgb,var(--p-danger-500) 30%,var(--p-content-border-color));background:color-mix(in srgb,var(--p-danger-500) 8%,transparent)}.km-probe-head{display:flex;flex-wrap:wrap;align-items:center;gap:9px;padding:9px 10px 9px 12px}.km-probe-head>svg{width:17px;height:17px;flex:0 0 auto}.km-probe.ok .km-probe-head>svg{color:var(--p-success-600, var(--p-success-500))}.km-probe.fail .km-probe-head>svg{color:var(--p-danger-600, var(--p-danger-500))}.km-probe-msg{flex:1;min-width:0}.km-probe-time{flex:0 0 auto;padding:1px 7px;border-radius:var(--kx-radius-tag);background:var(--kx-overlay-subtle);color:var(--p-text-muted-color);font-size:11px;font-weight:700;font-variant-numeric:tabular-nums}.km-probe-adv-btn{flex:0 0 auto}.km-probe-x{width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;border:0;border-radius:6px;background:transparent;color:var(--p-text-muted-color);cursor:pointer;opacity:.7}.km-probe-x:hover{opacity:1;background:color-mix(in srgb,currentColor 12%,transparent)}.km-probe-x svg{width:14px;height:14px}.km-probe-adv{display:flex;flex-direction:column;gap:10px;padding:10px 12px 12px;border-top:1px solid var(--p-content-border-color)}.km-probe-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:6px 16px}.km-probe-kv{display:flex;align-items:baseline;gap:8px;min-width:0}.km-probe-kv span{flex:0 0 96px;color:var(--p-text-muted-color);font-size:11.5px}.km-probe-kv code{min-width:0;overflow:hidden;text-overflow:ellipsis;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11.5px}.km-probe-tokens{display:flex;flex-wrap:wrap;align-items:center;gap:6px}.km-probe-tokens-l{color:var(--p-text-muted-color);font-size:11.5px;margin-right:2px}.km-probe-tok{padding:1px 8px;border-radius:var(--kx-radius-tag);background:var(--kx-overlay-subtle);color:var(--p-text-muted-color);font-size:11px;font-variant-numeric:tabular-nums}.km-probe-tok b{color:var(--p-text-color);font-weight:700}.km-probe-out{display:flex;flex-direction:column;gap:4px}.km-probe-out span{color:var(--p-text-muted-color);font-size:11.5px;font-weight:700}.km-probe-out pre{margin:0;max-height:160px;overflow:auto;padding:9px 10px;border-radius:6px;background:var(--kx-overlay-subtle);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11.5px;line-height:1.45;white-space:pre-wrap;word-break:break-word}.km-tabs{flex:0 0 auto;display:flex;gap:2px;padding:0 12px;border-bottom:1px solid var(--p-content-border-color)}.km-tab{position:relative;display:inline-flex;align-items:center;gap:7px;height:44px;padding:0 12px;border:0;background:transparent;color:var(--p-text-muted-color);font:inherit;font-size:13px;font-weight:700;cursor:pointer}.km-tab:hover,.km-tab.on{color:var(--p-text-color)}.km-tab.on:after{content:"";position:absolute;left:8px;right:8px;bottom:-1px;height:2px;border-radius:2px 2px 0 0;background:var(--p-primary-color)}.km-tab b{min-width:18px;padding:0 6px;border-radius:999px;background:var(--kx-overlay-subtle);color:var(--p-text-muted-color);font-size:11px;font-weight:700;text-align:center}.km-tab.on b{background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.km-classes{flex:1;min-height:0;display:flex;flex-direction:column}.km-classes-list{display:flex;flex-direction:column;gap:10px;padding:14px 16px}.km-class{flex:0 0 auto;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);overflow:hidden}.km-class-head{display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--kx-overlay-subtle);border-bottom:1px solid var(--p-content-border-color)}.km-class-head-text{flex:1;min-width:0}.km-class-title{display:flex;align-items:center;gap:8px;font-size:13.5px;font-weight:720}.km-class-ref{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;font-weight:600;color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);padding:1px 6px;border-radius:6px}.km-class-desc{margin-top:3px;color:var(--p-text-muted-color);font-size:12px;line-height:1.4}.km-class-meta{display:flex;align-items:center;gap:8px;flex:0 0 auto}.km-class-count{color:var(--p-text-muted-color);font-size:11.5px;white-space:nowrap}.km-class-members{display:flex;flex-direction:column}.km-class-member{display:grid;grid-template-columns:58px minmax(0,1.2fr) minmax(0,1fr) auto;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid var(--p-content-border-color)}.km-class-member:last-child{border-bottom:0}.km-class-member.top{background:color-mix(in srgb,var(--p-success-500) 6%,transparent)}.km-class-rank{width:20px;height:20px;display:inline-flex;align-items:center;justify-content:center;border-radius:6px;background:var(--kx-overlay-subtle);color:var(--p-text-muted-color);font-size:11px;font-weight:700}.km-class-member-name{font-size:13px;font-weight:620;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.km-class-member-id{color:var(--p-text-muted-color);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.km-class-member-pri{color:var(--p-text-muted-color);font-size:11px;justify-self:end;white-space:nowrap}.km-class-empty{padding:12px;color:var(--p-text-muted-color);font-size:12px}@media(max-width:860px){.km-shell{grid-template-columns:1fr;grid-template-rows:auto minmax(0,1fr)}.km-rail{border-right:0;border-bottom:1px solid var(--p-content-border-color);max-height:40vh}.km-form-grid,.km-form-grid.four{grid-template-columns:1fr}.km-class-member{grid-template-columns:auto minmax(0,1fr) auto}.km-class-member-id{display:none}}@media(max-width:560px){.km-probe-grid{grid-template-columns:1fr}}.ks{height:100%;display:flex;flex-direction:column}.ks-top-notice{margin:8px}.ks-rail-search{padding:8px 10px}.ks-rail-list{padding:0 8px 10px;overflow-y:auto}.ks-rail-group{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--p-text-muted-color);padding:10px 6px 4px}.ks-scope-row{width:100%;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;border:none;border-radius:var(--kx-radius-8);background:transparent;cursor:pointer;text-align:left;color:var(--p-text-color);transition:background .12s;font:inherit}.ks-scope-row:hover{background:var(--kx-overlay-hover)}.ks-scope-row.active{background:color-mix(in srgb,var(--p-primary-color) 14%,transparent)}.ks-scope-name{font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ks-scope-meta{flex:none;display:flex;align-items:center;gap:6px}.ks-scope-count{font-size:11px;font-weight:700;color:var(--p-text-muted-color);min-width:18px;text-align:right}.ks-builder,.ks-view{display:flex;flex-direction:column;height:100%;min-height:0;padding:14px 16px;gap:14px}.ks-builder-head{display:flex;align-items:center;justify-content:space-between;gap:12px}.ks-builder-title{display:flex;align-items:center;gap:8px;font-size:16px;font-weight:700;color:var(--p-text-color)}.ks-builder-acts{display:flex;gap:8px}.ks-fields{display:grid;grid-template-columns:220px 1fr 1fr;gap:12px}.ks-field-err{display:block;margin-top:4px;font-size:11px;color:var(--p-danger-500)}.ks-panes{flex:1;min-height:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.ks-pane{display:flex;flex-direction:column;min-height:0;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);background:var(--kx-overlay-subtle)}.ks-pane.drop{border-style:dashed}.ks-pane-head{display:flex;align-items:baseline;justify-content:space-between;gap:8px;padding:10px 12px 8px;font-size:13px;font-weight:700;color:var(--p-text-color)}.ks-pane-sub{font-size:11px;font-weight:500;color:var(--p-text-muted-color)}.ks-pane-search{padding:0 10px 8px}.ks-pane-body{flex:1;min-height:0;overflow-y:auto;padding:4px 10px 10px;display:flex;flex-direction:column;gap:8px}.ks-pane-empty{padding:16px 8px;font-size:12px;color:var(--p-text-muted-color);text-align:center}.ks-drop-hint{margin:auto;display:flex;flex-direction:column;align-items:center;gap:8px;padding:24px;color:var(--p-text-muted-color);font-size:13px;text-align:center}.ks-drop-hint svg{font-size:28px}.ks-view-note{font-size:12px;color:var(--p-text-muted-color);line-height:1.5;margin:0}.ks-view-id{display:block;margin-top:4px;font-family:ui-monospace,Menlo,monospace;font-size:11px;color:var(--p-text-muted-color);overflow-wrap:anywhere}.ks-view-list{border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);background:var(--kx-overlay-subtle);padding:4px 10px}.ks-view-pol{padding:8px 4px;border-bottom:1px solid var(--p-content-border-color)}.ks-view-pol:last-child{border-bottom:none}.ks-view-pol-title{font-size:13px;font-weight:600;color:var(--p-text-color)}.ks-view-pol-comment{font-size:12px;color:var(--p-text-muted-color);margin-top:2px}.ks-view-pol-id{font-size:10.5px;color:var(--p-text-muted-color);font-family:ui-monospace,Menlo,monospace;margin-top:2px;overflow-wrap:anywhere}.ks-eff{font-size:10px;font-weight:700;text-transform:uppercase;padding:1px 6px;border-radius:999px;margin-left:6px}.ks-eff.allow{background:color-mix(in srgb,var(--p-success-600) 14%,transparent);color:var(--p-success-700)}.ks-eff.deny{background:color-mix(in srgb,var(--p-danger-500) 14%,transparent);color:var(--p-danger-700)}.ks-pcard{display:flex;align-items:flex-start;gap:8px;padding:10px 10px 10px 6px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);background:var(--p-content-background);cursor:grab;transition:border-color .12s,box-shadow .12s,transform .08s}.ks-pcard:hover{border-color:var(--p-primary-color);box-shadow:0 1px 6px #0000000f}.ks-pcard:active{cursor:grabbing;transform:scale(.997)}.ks-pcard-grip{flex:none;margin-top:2px;color:var(--p-text-muted-color);font-size:15px}.ks-pcard-body{flex:1;min-width:0}.ks-pcard-head{display:flex;align-items:center;gap:8px}.ks-pcard-title{font-weight:600;font-size:13px;color:var(--p-text-color);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ks-pcard-comment{font-size:12px;color:var(--p-text-muted-color);margin-top:2px;line-height:1.35}.ks-pcard-id{font-size:10.5px;color:var(--p-text-muted-color);margin-top:3px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ks-pcard-act{flex:none;width:24px;height:24px;display:grid;place-items:center;border:none;border-radius:6px;cursor:pointer;background:transparent;color:var(--p-text-muted-color);transition:background .12s,color .12s}.ks-pcard-act.add:hover{background:color-mix(in srgb,var(--p-success-600) 12%,transparent);color:var(--p-success-700)}.ks-pcard-act.remove:hover{background:color-mix(in srgb,var(--p-danger-500) 12%,transparent);color:var(--p-danger-700)}.ks-pcard{flex-direction:column;align-items:stretch}.ks-pcard-row{display:flex;align-items:flex-start;gap:8px}.ks-pcard.locked{cursor:default;opacity:.9}.ks-pcard.locked:hover{border-color:var(--p-content-border-color);box-shadow:none}.ks-pcard-grip.locked,.ks-pcard-act.detail{color:var(--p-text-muted-color)}.ks-pcard-act.detail svg{transition:transform .15s}.ks-pcard-act.detail.open svg{transform:rotate(90deg)}.ks-pcard-act.detail:hover{background:var(--kx-overlay-hover);color:var(--p-text-color)}.ks-pcard-detail{margin-top:8px;padding-top:8px;border-top:1px dashed var(--p-content-border-color);display:flex;flex-direction:column;gap:5px}.ks-pcard-kv{display:flex;gap:8px;font-size:11px;align-items:flex-start}.ks-pcard-kv>span{flex:none;width:64px;color:var(--p-text-muted-color);text-transform:uppercase;font-weight:700;letter-spacing:.03em;font-size:10px;padding-top:3px}.ks-pcard-tags{display:flex;flex-wrap:wrap;gap:4px}.ks-pcard-kv code,.ks-eff-code{min-width:0;overflow-wrap:anywhere;font-family:ui-monospace,Menlo,monospace;font-size:10.5px;background:var(--kx-overlay-subtle);padding:1px 5px;border-radius:4px;color:var(--p-text-color)}.ks-eff-code.allow{color:var(--p-success-700)}.ks-eff-code.deny{color:var(--p-danger-700)}.ks-pcard-none{color:var(--p-text-muted-color);font-size:11px}.ks-overlay-warn{display:flex;gap:10px;align-items:flex-start;padding:10px 12px;border-radius:var(--kx-radius-8);background:color-mix(in srgb,var(--p-warn-500) 12%,transparent);border:1px solid color-mix(in srgb,var(--p-warn-500) 40%,transparent);color:var(--p-text-color);font-size:12.5px;line-height:1.45}.ks-overlay-warn svg{flex:none;margin-top:1px;color:var(--p-warn-600);font-size:18px}.ks-panes.three{grid-template-columns:repeat(3,minmax(0,1fr))}.ks-pane.locked-pane{background:var(--kx-overlay-hover)}.ks-ext-block{margin-top:14px}.ks-ext-head{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700;color:var(--p-text-color);margin-bottom:6px}.ks-ext-head svg{color:var(--p-warn-600)}.ks-delegations{flex:1;min-height:0;overflow:auto;padding:16px;display:flex;flex-direction:column;gap:16px;color:var(--p-text-color)}.ks-delegation-form{display:flex;flex-direction:column;gap:12px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);padding:16px;max-width:720px}.ks-delegation-form ul{list-style:none;margin:0;padding:0}.ks-delegation-form li{display:flex;align-items:center;justify-content:space-between;gap:12px}.ks-delegation-form small{display:block;overflow-wrap:anywhere;color:var(--p-text-muted-color)}.ks-delegation-all{display:flex;align-items:center;gap:8px}.ks-delegation-table{width:100%;border-collapse:collapse;text-align:left}.ks-delegation-table caption{text-align:left;font-weight:600;padding:8px 0}.ks-delegation-table th,.ks-delegation-table td{border-bottom:1px solid var(--p-content-border-color);padding:10px;overflow-wrap:anywhere}', Lc = { props: { type: "object", properties: {} } }, Ec = {
  wippy: Lc
};
class Nc extends jo {
  static get wippyConfig() {
    return {
      propsSchema: Ec.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: Ac
    };
  }
  static get vueConfig() {
    return { rootComponent: Oc, plugins: [yi] };
  }
}
ro(import.meta.url, Nc);
//# sourceMappingURL=index.js.map
