import { hasInjectionContext as I, inject as y, effectScope as A, ref as m, markRaw as O, onMounted as L, onUnmounted as T, watch as j, createApp as N } from "vue";
import { addCollection as H } from "@iconify/vue";
import { config as w, addIcons as U, on as $, applyThemeMode as f, host as D, hostCss as M, loadCss as W } from "@wippy-fe/proxy";
var x = "data-wippy-visible";
function k(r) {
  const e = r.getAttribute(x);
  return e === "true" ? !0 : e === "false" ? !1 : null;
}
var B = Object.defineProperty, F = (r, e, t) => e in r ? B(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : r[e] = t, l = (r, e, t) => F(r, typeof e != "symbol" ? e + "" : e, t), K = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], Y = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function _(r) {
  const e = r.startsWith("--") ? r : `--${r}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(e) ? e : null;
}
function J(...r) {
  const e = /* @__PURE__ */ new Set();
  for (const t of r)
    if (t)
      for (const [o, a] of Object.entries(t)) {
        if ((o === "@light" || o === "@dark") && a && typeof a == "object") {
          for (const [n, s] of Object.entries(a)) {
            const c = typeof s == "string" ? _(n) : null;
            c && e.add(c);
          }
          continue;
        }
        const i = typeof a == "string" ? _(o) : null;
        i && e.add(i);
      }
  return [...e].sort();
}
function q(r) {
  if (r.length === 0)
    return "";
  const e = r.map((t) => `  ${t}: inherit;`).join(`
`);
  return `${Y} {
${e}
}`;
}
function G(r, e) {
  const t = q(e);
  t && C(r, t, "@wippy-fe/css-variables-bridge");
}
function Q(r, e) {
  const o = (e ?? K).map(async (a) => {
    const i = M[a];
    if (!i)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${a}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await W(i);
    } catch (n) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${a}" (${i}):`, n), null;
    }
  });
  return Promise.all(o).then((a) => {
    for (const i of a) {
      if (!i)
        continue;
      const n = document.createElement("style");
      n.textContent = i, n.setAttribute("role", "@wippy-fe/host-css"), r.appendChild(n);
    }
  });
}
function X(r, e) {
  const t = document.createElement("style");
  t.textContent = e, r.appendChild(t);
}
function C(r, e, t) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const a = new CSSStyleSheet();
    a.replaceSync(e), r.adoptedStyleSheets = [...r.adoptedStyleSheets, a];
    return;
  }
  const o = document.createElement("style");
  o.setAttribute("role", t), o.textContent = e, r.appendChild(o);
}
function Z(r, e) {
  C(r, e, "@wippy-fe/custom-css");
}
function z(r) {
  return r.__wippyHost ?? null;
}
function rr(r) {
  return r.replace(/-([a-z])/g, (e, t) => t.toUpperCase());
}
function er(r, e, t) {
  switch (t.type) {
    case "string":
      return { value: e };
    case "number": {
      const o = Number.parseFloat(e);
      return Number.isNaN(o) ? { value: void 0, error: `Invalid ${r}: expected a number` } : { value: o };
    }
    case "integer": {
      const o = Number.parseInt(e, 10);
      return Number.isNaN(o) ? { value: void 0, error: `Invalid ${r}: expected an integer` } : { value: o };
    }
    case "boolean":
      return { value: e !== "false" };
    case "array":
    case "object":
      try {
        const o = JSON.parse(e);
        return t.type === "array" && !Array.isArray(o) ? { value: void 0, error: `Invalid ${r}: expected a JSON array` } : { value: o };
      } catch {
        return { value: void 0, error: `Invalid ${r}: must be valid JSON` };
      }
    default:
      return { value: e };
  }
}
function b(r, e) {
  const t = {}, o = [];
  for (const [a, i] of Object.entries(e.properties)) {
    const n = r.getAttribute(a), s = rr(a);
    if (n === null) {
      i.default !== void 0 && (t[s] = i.default);
      continue;
    }
    const c = er(a, n, i);
    c.error ? o.push(c.error) : t[s] = c.value;
  }
  return { props: t, errors: o };
}
var tr = class {
  constructor(r, e) {
    l(this, "_props"), l(this, "_errors"), l(this, "_content"), l(this, "_hostVisibility"), l(this, "_propsListeners", /* @__PURE__ */ new Set()), l(this, "_contentListeners", /* @__PURE__ */ new Set()), l(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), l(this, "_disposed", !1), l(this, "_emitToDom"), l(this, "props"), l(this, "events"), l(this, "content"), l(this, "hostVisibility"), this._props = r.props, this._errors = r.errors, this._content = r.content, this._hostVisibility = r.hostVisibility, this._emitToDom = e;
    const t = this;
    this.props = {
      get value() {
        return t._props;
      },
      get errors() {
        return t._errors;
      },
      subscribe(o, a) {
        return t._subscribeProps(o, a);
      }
    }, this.events = {
      emit(o, a) {
        t._disposed || t._emitToDom(o, a);
      }
    }, this.content = r.hasContent ? {
      get value() {
        return t._content;
      },
      subscribe(o, a) {
        return t._subscribeContent(o, a);
      }
    } : null, this.hostVisibility = {
      get value() {
        return t._hostVisibility;
      },
      subscribe(o, a) {
        return t._subscribeHostVisibility(o, a);
      }
    };
  }
  /** @internal */
  notifyProps(r, e) {
    if (!this._disposed) {
      this._props = r, this._errors = e;
      for (const t of this._propsListeners)
        t(r, e);
    }
  }
  /** @internal */
  notifyContent(r) {
    if (!this._disposed) {
      this._content = r;
      for (const e of this._contentListeners)
        e(r);
    }
  }
  /** @internal */
  notifyHostVisibility(r, e) {
    if (!(this._disposed || r === e)) {
      this._hostVisibility = r;
      for (const t of this._hostVisibilityListeners)
        t(r, e);
    }
  }
  /** @internal */
  dispose() {
    this._disposed || (this._disposed = !0, this._propsListeners.clear(), this._contentListeners.clear(), this._hostVisibilityListeners.clear());
  }
  _subscribeProps(r, e) {
    if (this._disposed || e?.signal?.aborted)
      return () => {
      };
    this._propsListeners.add(r), e?.immediate && r(this._props, this._errors);
    const t = () => {
      this._propsListeners.delete(r), e?.signal?.removeEventListener("abort", t);
    };
    return e?.signal?.addEventListener("abort", t, { once: !0 }), t;
  }
  _subscribeContent(r, e) {
    if (this._disposed || e?.signal?.aborted)
      return () => {
      };
    this._contentListeners.add(r), e?.immediate && r(this._content);
    const t = () => {
      this._contentListeners.delete(r), e?.signal?.removeEventListener("abort", t);
    };
    return e?.signal?.addEventListener("abort", t, { once: !0 }), t;
  }
  _subscribeHostVisibility(r, e) {
    if (this._disposed || e?.signal?.aborted)
      return () => {
      };
    this._hostVisibilityListeners.add(r), e?.immediate && r(this._hostVisibility, this._hostVisibility);
    const t = () => {
      this._hostVisibilityListeners.delete(r), e?.signal?.removeEventListener("abort", t);
    };
    return e?.signal?.addEventListener("abort", t, { once: !0 }), t;
  }
}, or = class extends HTMLElement {
  constructor() {
    super(), l(this, "_internals"), l(this, "_contentObserver", null), l(this, "_initialized", !1), l(this, "_container", null), l(this, "_reactive", null), l(this, "_lastProps", null), l(this, "_lastErrors", []), l(this, "_lastContent", null), l(this, "_themeUnsub", null), l(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = k(this);
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
    const r = this.wippyConfig, e = Object.keys(r.propsSchema.properties), t = r.extraObservedAttributes ?? [];
    return [.../* @__PURE__ */ new Set([...e, ...t, x])];
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
    return z(this);
  }
  /**
   * Emit a CustomEvent that bubbles and crosses shadow DOM boundaries.
   */
  emitEvent(r, e) {
    this.dispatchEvent(new CustomEvent(r, {
      bubbles: !0,
      composed: !0,
      detail: e
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
      const r = this.constructor.wippyConfig, e = !!r.contentTemplate;
      let t, o;
      if (this._lastProps !== null)
        t = this._lastProps, o = this._lastErrors;
      else {
        const i = b(this, r.propsSchema);
        r.validateProps && i.errors.push(...r.validateProps(i.props)), t = i.props, o = i.errors, this._lastProps = t, this._lastErrors = o;
      }
      const a = e ? this._lastContent ?? this._extractContent(r.contentTemplate) : null;
      e && this._lastContent === null && (this._lastContent = a), this._reactive = new tr(
        { props: t, errors: o, content: a, hasContent: e, hostVisibility: this._hostVisible },
        this.emitEvent.bind(this)
      );
    }
    return this._reactive;
  }
  // ── Lifecycle ──────────────────────────────────────────────
  connectedCallback() {
    this._internals.states.add("loading");
    try {
      const r = this.constructor.wippyConfig, e = this._initialized, t = this.shadowRoot ?? this.attachShadow({ mode: r.shadowMode ?? "open" });
      let o;
      if (e)
        o = this._container;
      else {
        this.onInit(t), r.inlineCss && X(t, r.inlineCss);
        try {
          const p = w?.theming, u = J(
            p?.global?.cssVariables,
            p?.children?.cssVariables
          );
          G(t, u);
        } catch {
        }
        if (r.customCss !== !1)
          try {
            const p = w?.theming, u = [p?.global?.customCSS, p?.children?.customCSS].filter(Boolean).join(`
`);
            u && Z(t, u);
          } catch {
          }
        (r.hostCssKeys === void 0 || r.hostCssKeys.length > 0) && Q(t, r.hostCssKeys), o = document.createElement("div"), o.setAttribute("data-wippy-theme-root", "");
        const c = r.containerClasses ?? [];
        c.length > 0 && o.classList.add(...c), t.appendChild(o), this._container = o, U(H);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = $("@theme", (c) => this._applyTheme(c)));
      const { props: a, errors: i } = b(this, r.propsSchema);
      r.validateProps && i.push(...r.validateProps(a));
      const n = a;
      this._lastProps = n, this._lastErrors = i;
      let s = null;
      r.contentTemplate && (s = this._extractContent(r.contentTemplate), this._lastContent = s, this._contentObserver = new MutationObserver(() => {
        const c = this._extractContent(r.contentTemplate);
        this._lastContent = c, this._reactive?.notifyContent(c), this.onContentChanged(c);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(t, o, n, i, s, e), this._internals.states.delete("loading"), this._internals.states.add("ready"), e || (this._initialized = !0), this.onReady(), this.emitEvent("load");
    } catch (r) {
      this.onError(r), this._internals.states.delete("loading"), this._internals.states.add("error"), this.emitEvent("error", {
        message: r instanceof Error ? r.message : String(r),
        error: r
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
  _applyTheme(r = D.getThemeMode?.()) {
    f(r, this), this._container && f(r, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), f("auto", this), this._container && f("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(r, e, t) {
    if (e === t)
      return;
    if (r === x) {
      const s = this._hostVisible, c = k(this);
      if (c === s)
        return;
      this._hostVisible = c, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(c, s), this.onHostVisibilityChanged(c, s));
      return;
    }
    const o = this.constructor.wippyConfig, { props: a, errors: i } = b(this, o.propsSchema);
    o.validateProps && i.push(...o.validateProps(a));
    const n = a;
    this._lastProps = n, this._lastErrors = i, this._reactive?.notifyProps(n, i), this.onPropsChanged(n, i);
  }
  // ── Hooks ──────────────────────────────────────────────────
  /** Called right after shadow DOM is attached, before CSS or container. */
  onInit(r) {
  }
  /** Called after internals state is set to ready, before the `load` event. */
  onReady() {
  }
  /** Called when connectedCallback throws. Default logs to console. */
  onError(r) {
    console.error(`${this.constructor.name} initialization failed:`, r);
  }
  /** Called when observed attributes change. Override to update framework state. */
  onPropsChanged(r, e) {
  }
  /**
   * Called when the host changes logical activity. `null` means unmanaged.
   * This does not imply a DOM remount or a CSS/viewport visibility change.
   */
  onHostVisibilityChanged(r, e) {
  }
  /**
   * Extract text from a child `<template data-type="...">` element.
   * Uses `.content.textContent` since `<template>` stores content in a DocumentFragment.
   */
  _extractContent(r) {
    return this.querySelector(`template[data-type="${r}"]`)?.content.textContent?.trim() ?? null;
  }
  /** Called when child `<template>` content changes. Override to update framework state. */
  onContentChanged(r) {
  }
};
function ar(r) {
  return r.__wippyHostBus ?? null;
}
function ir(r) {
  return r.dataset.wippyPanelId ?? null;
}
/*!
 * pinia v4.0.3
 * (c) 2026 Eduardo San Martin Morote
 * @license MIT
 */
let S;
const E = (r) => S = r, nr = () => I() && y(V) || S, V = (
  /* istanbul ignore next */
  Symbol()
);
function sr() {
  const r = A(!0), e = r.run(() => m({}));
  let t = [], o = [];
  const a = O({
    install(i) {
      E(a), a._a = i, i.provide(V, a), i.config.globalProperties.$pinia = a, o.forEach((n) => t.push(n)), o = [];
    },
    use(i) {
      return this._a ? t.push(i) : o.push(i), this;
    },
    _p: t,
    _a: null,
    _e: r,
    _s: /* @__PURE__ */ new Map(),
    state: e
  });
  return a;
}
var pr = Object.defineProperty, cr = (r, e, t) => e in r ? pr(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : r[e] = t, g = (r, e, t) => cr(r, typeof e != "symbol" ? e + "" : e, t), lr = /* @__PURE__ */ Symbol("wippy:emit"), P = /* @__PURE__ */ Symbol("wippy:props"), dr = /* @__PURE__ */ Symbol("wippy:props_error"), ur = /* @__PURE__ */ Symbol("wippy:content"), hr = /* @__PURE__ */ Symbol("wippy:panel-id"), gr = /* @__PURE__ */ Symbol("wippy:layout-bus"), mr = /* @__PURE__ */ Symbol("wippy:host"), R = /* @__PURE__ */ Symbol("wippy:host-visibility");
function yr() {
  const r = y(P);
  if (!r)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return r;
}
function fr() {
  const r = y(R);
  if (!r)
    throw new Error("useHostVisibility() must be called inside a WippyVueElement");
  return r;
}
function wr(r) {
  const e = fr();
  let t = !1, o = null, a = !1;
  function i() {
    if (o)
      return a = !0, o;
    let n;
    try {
      n = Promise.resolve(r());
    } catch (c) {
      n = Promise.reject(c);
    }
    const s = n.finally(() => {
      if (o === s && (o = null, t && a))
        return a = !1, i();
    });
    return o = s, s;
  }
  return L(() => (t = !0, i())), T(() => {
    t = !1, a = !1;
  }), j(e, (n, s) => {
    if (t && s === !1 && n === !0)
      return i();
  }), e;
}
var kr = class extends or {
  constructor() {
    super(...arguments), g(this, "_vueApp", null), g(this, "_propsRef", m({})), g(this, "_errorsRef", m([])), g(this, "_contentRef", m(null)), g(this, "_hostVisibilityRef", m(null)), g(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  onMount(r, e, t, o, a, i) {
    const n = this.constructor.vueConfig;
    this._propsRef.value = t, this._errorsRef.value = o, this._contentRef.value = a ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const p of o)
      this.emitEvent("invalid", { message: p });
    const s = new AbortController();
    this._bridgeAbort = s, this.reactive.props.subscribe((p, u) => {
      this._propsRef.value = p, this._errorsRef.value = [...u];
      for (const d of u)
        this.emitEvent("invalid", { message: d });
    }, { signal: s.signal }), this.reactive.content && this.reactive.content.subscribe((p) => {
      this._contentRef.value = p;
    }, { signal: s.signal }), this.reactive.hostVisibility.subscribe((p) => {
      this._hostVisibilityRef.value = p;
    }, { signal: s.signal });
    const c = (p) => {
      if (s.signal.aborted)
        return;
      const u = nr(), d = N(p.rootComponent);
      this._vueApp = d;
      const h = sr();
      if (p.piniaPlugins)
        for (const v of p.piniaPlugins)
          h.use(v);
      if (d.use(h), p.plugins)
        for (const v of p.plugins)
          d.use(v);
      d.provide(P, this._propsRef), d.provide(dr, this._errorsRef), d.provide(lr, this.emitEvent.bind(this)), d.provide(ur, this._contentRef), d.provide(R, this._hostVisibilityRef), d.provide(hr, ir(this)), d.provide(gr, ar(this)), d.provide(mr, z(this)), p.providers && p.providers(d, this), d.mount(e), u && E(u);
    };
    if (n.rootComponent)
      c(n);
    else if (n.lazyConfig) {
      const p = document.createElement("wippy-loading");
      p.setAttribute("no-bg", ""), e.appendChild(p), n.lazyConfig().then((u) => {
        s.signal.aborted || (p.remove(), c(u));
      }).catch((u) => {
        if (s.signal.aborted)
          return;
        const d = u instanceof Error ? u.message : String(u), h = document.createElement("wippy-error");
        h.setAttribute("title", "Failed to load"), h.setAttribute("message", d), p.replaceWith(h), this.emitEvent("error", { message: d });
      });
    } else
      throw new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._vueApp && (this._vueApp.unmount(), this._vueApp = null);
  }
};
const _r = ':root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}.spin{animation:kx-spin 1s linear infinite}@keyframes kx-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.spin{animation:none}}.kx-tag-sm,.kx-tag-sm.kx-tag-sm{display:inline-flex;align-items:center;gap:4px;padding:1px 7px;border-radius:var(--kx-radius-tag, 6px);font-size:10.5px;font-weight:600;line-height:1.5;white-space:nowrap}.kx-tag-sm svg,.kx-tag-sm.kx-tag-sm svg{width:12px;height:12px}.kx-tag-caps,.kx-tag-caps.kx-tag-caps{display:inline-flex;align-items:center;gap:3px;padding:2px 6px;border-radius:var(--kx-radius-tag, 6px);font-size:9px;font-weight:700;line-height:1.5;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap}.kx-tag-caps svg,.kx-tag-caps.kx-tag-caps svg{width:11px;height:11px}:host,:root{--kx-surface-1: color-mix(in srgb, var(--p-content-background) 96%, var(--p-text-color) 4%);--kx-surface-2: color-mix(in srgb, var(--p-content-background) 92%, var(--p-text-color) 8%);--kx-surface-3: color-mix(in srgb, var(--p-content-background) 86%, var(--p-text-color) 14%);--kx-surface-4: color-mix(in srgb, var(--p-content-background) 78%, var(--p-text-color) 22%);--kx-border-strong: color-mix(in srgb, var(--p-content-border-color) 60%, var(--p-text-color) 40%);--kx-border-stronger: color-mix(in srgb, var(--p-content-border-color) 30%, var(--p-text-color) 70%);--kx-text-faint: color-mix(in srgb, var(--p-text-muted-color) 70%, var(--p-content-background) 30%);--kx-text-fainter: color-mix(in srgb, var(--p-text-muted-color) 45%, var(--p-content-background) 55%);--kx-wash-primary: color-mix(in srgb, var(--p-primary-color) 12%, var(--p-content-background) 88%);--kx-wash-success: color-mix(in srgb, var(--p-success-500) 12%, var(--p-content-background) 88%);--kx-wash-info: color-mix(in srgb, var(--p-info-500) 12%, var(--p-content-background) 88%);--kx-wash-warn: color-mix(in srgb, var(--p-warn-500) 12%, var(--p-content-background) 88%);--kx-wash-danger: color-mix(in srgb, var(--p-danger-500) 12%, var(--p-content-background) 88%);--kx-wash-help: color-mix(in srgb, var(--p-help-500) 12%, var(--p-content-background) 88%);--kx-font-heading: "Outfit", system-ui, sans-serif;--kx-font-body: "Inter", system-ui, sans-serif;--kx-radius-4: 4px;--kx-radius-6: 6px;--kx-radius-8: 8px;--kx-radius-10: 10px;--kx-radius-14: 14px;--kx-radius-16: 16px;--kx-radius-tag: var(--p-content-border-radius, 6px);--kx-control-height: 34px;--kx-control-height-sm: 30px;--kx-rail-width: 264px;--kx-reading-measure: 880px;--kx-row-height: 32px;--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .08);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .12);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .18);--kx-overlay-hover: color-mix(in srgb, var(--p-text-color) 7%, transparent);--kx-overlay-subtle: color-mix(in srgb, var(--p-text-color) 4%, transparent)}@media(prefers-color-scheme:dark){:host(:not(.w-theme-light)),:root:not(.w-theme-light){--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .35);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .45);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .6)}}:host(.w-theme-dark),:root.w-theme-dark{--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .35);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .45);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .6)}.kx-iconbtn{width:28px;height:28px;flex:none;display:grid;place-items:center;cursor:pointer;border:1px solid transparent;border-radius:var(--kx-radius-8);background:transparent;color:var(--p-text-muted-color);transition:color .14s,background .14s,border-color .14s}.kx-iconbtn:hover:not(:disabled){color:var(--p-text-color);background:var(--kx-surface-2)}.kx-iconbtn.on{color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 14%,transparent)}.kx-iconbtn:disabled{opacity:.55;cursor:default}.kx-iconbtn svg{width:16px;height:16px}.kx-iconbtn.lg{width:var(--kx-control-height);height:var(--kx-control-height)}.kx-iconbtn.sm{width:var(--kx-control-height-sm);height:var(--kx-control-height-sm)}.kx-iconbtn.bordered{border-color:var(--p-content-border-color);background:var(--kx-surface-1);color:var(--p-text-muted-color)}.kx-iconbtn.bordered:hover:not(:disabled){border-color:color-mix(in srgb,var(--p-text-color) 18%,transparent)}.kx-iconbtn.danger:hover:not(:disabled),.kx-iconbtn.danger.on{background:color-mix(in srgb,var(--p-danger-500) 12%,transparent);color:var(--p-danger-500)}.kx-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;height:var(--kx-control-height);padding:0 14px;border-radius:var(--kx-radius-8);cursor:pointer;font:inherit;font-size:12.5px;font-weight:600;white-space:nowrap;border:1px solid transparent;transition:filter .15s,transform .15s,background .14s,border-color .14s,color .14s}.kx-btn svg{width:15px;height:15px}.kx-btn:disabled{opacity:.5;cursor:not-allowed}.kx-btn.sm{height:var(--kx-control-height-sm);padding:0 12px}.kx-btn-primary{background:var(--p-primary-color);color:var(--p-button-primary-color);border-color:var(--p-primary-color)}.kx-btn-primary:hover:not(:disabled){background:var(--p-primary-hover-color);color:var(--p-button-primary-hover-color);border-color:var(--p-primary-hover-color);transform:translateY(-1px)}.kx-btn-primary:active:not(:disabled){background:var(--p-primary-active-color);color:var(--p-button-primary-active-color);border-color:var(--p-primary-active-color);transform:translateY(0)}.kx-btn-ghost{background:transparent;color:var(--p-text-color);border-color:var(--p-content-border-color)}.kx-btn-ghost:hover:not(:disabled){background:var(--kx-surface-2);border-color:color-mix(in srgb,var(--p-text-color) 18%,transparent)}.kx-btn-soft{background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color);border-color:color-mix(in srgb,var(--p-primary-color) 30%,transparent)}.kx-btn-soft:hover:not(:disabled){background:color-mix(in srgb,var(--p-primary-color) 18%,transparent)}.kx-btn-danger{background:var(--p-danger-500);color:var(--p-danger-contrast-color);border-color:var(--p-danger-500)}.kx-btn-danger:hover:not(:disabled){filter:brightness(1.07)}.kx-search{position:relative;display:flex;align-items:center}.kx-search-ico{position:absolute;left:10px;width:15px;height:15px;color:var(--p-text-muted-color);pointer-events:none}.kx-search-input{width:100%;height:var(--kx-control-height);padding:0 30px 0 31px;font:inherit;font-size:13px;color:var(--p-text-color);background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);transition:border-color .14s,box-shadow .14s}.kx-search-input::placeholder{color:var(--p-text-muted-color)}.kx-search-input:focus{outline:none;border-color:var(--p-focus-ring-color);box-shadow:var(--p-focus-ring-shadow)}.kx-search-clear{position:absolute;right:6px;width:22px;height:22px;border-radius:var(--kx-radius-8);display:grid;place-items:center;cursor:pointer;background:transparent;border:none;color:var(--p-text-muted-color)}.kx-search-clear:hover{color:var(--p-text-color);background:var(--kx-surface-2)}.kx-search-clear svg{width:14px;height:14px}.kx-chip{font-size:9.5px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;padding:2px 7px;border-radius:var(--kx-radius-6);background:var(--kx-surface-2);color:var(--p-text-muted-color);border:1px solid var(--p-content-border-color)}.kx-count{min-width:18px;height:16px;padding:0 5px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;font-variant-numeric:tabular-nums;background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.kx-focus-halo:focus-visible{border-color:var(--p-focus-ring-color);outline:none;box-shadow:var(--p-focus-ring-shadow)}.kx-focus-outline:focus-visible{outline:var(--p-focus-ring-width) var(--p-focus-ring-style) var(--p-focus-ring-color);outline-offset:var(--p-focus-ring-offset);box-shadow:none}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}:host{display:block;height:100%;min-height:0}:host,:root{font-family:var(--kx-font-body)}h1,h2,h3,h4,h5,h6,.ap-h,.ap-blabel,.ks-title,.ks-group-title,.pv-group-title{font-family:var(--kx-font-heading)}:host>div{height:100%;min-height:0}*,*:before,*:after{box-sizing:border-box}.ks{--system-surface-gutter: var(--kickside-system-surface-gutter, 24px);font-family:inherit;color:var(--p-text-color);background:var(--p-content-background);height:100%;min-height:0;display:flex;flex-direction:column;overflow:hidden}.ks-loading,.ks-empty{display:flex;align-items:center;gap:8px;color:var(--p-text-muted-color);font-size:13px;padding:24px}.ks-err{margin:14px var(--system-surface-gutter) 0;padding:9px 12px;border-radius:10px;font-size:13px;background:color-mix(in srgb,var(--p-danger-500) 12%,transparent);color:var(--p-danger-600, var(--p-danger-500))}.ks-shell{flex:1;min-height:0;display:flex;align-items:stretch}.ks-nav{flex:0 0 232px;min-width:0;overflow-y:auto;overflow-x:hidden;padding:16px 12px;display:flex;flex-direction:column;gap:14px;border-right:1px solid var(--p-content-border-color)}.ks-nav-section{display:flex;flex-direction:column;gap:2px}.ks-nav-group{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--p-text-muted-color);margin:2px 0 4px 10px}.ks-nav-item{display:flex;align-items:center;gap:10px;width:100%;text-align:left;padding:8px 10px;border:none;border-radius:8px;cursor:pointer;font:inherit;font-size:13px;font-weight:500;color:var(--p-text-color);background:transparent;transition:background .15s,color .15s}.ks-nav-item:hover{background:color-mix(in srgb,var(--p-text-color) 7%,transparent)}.ks-nav-item-active{background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.ks-nav-ico{flex:0 0 auto;width:18px;height:18px}.ks-nav-label{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ks-pane{flex:1;min-width:0;overflow-y:auto;overflow-x:hidden;padding:18px var(--system-surface-gutter) 28px}.ks-pane-flush{padding:0}.ks-about{padding:24px var(--system-surface-gutter);color:var(--p-text-color);font-family:inherit}.ks-about-facts{display:grid;gap:16px;margin:0 0 24px}.ks-about-facts>div{display:grid;grid-template-columns:160px minmax(0,1fr);gap:12px}.ks-about-facts dt{color:var(--p-text-muted-color)}.ks-about-facts dd{margin:0}.ks-about a{color:var(--p-primary-color);text-decoration:underline}.ks-about-runtime{margin-bottom:28px}.ks-about-runtime span{color:var(--p-text-muted-color);margin-left:8px}.ks-about h2{font-size:16px;font-weight:600;margin-bottom:12px}.ks-about-notices{white-space:pre-wrap;overflow-wrap:anywhere;font:inherit;font-size:13px;line-height:1.6;padding:18px;border:1px solid var(--p-content-border-color);border-radius:var(--p-content-border-radius);background:var(--p-content-hover-background)}@media(max-width:640px){.ks-about-facts>div{grid-template-columns:1fr;gap:4px}}.ks-pane-head{display:flex;align-items:center;gap:12px;margin:0 0 20px}.ks-pane-ico{flex:none;display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:11px;background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);color:var(--p-primary-color)}.ks-pane-ico svg{width:22px;height:22px}.ks-pane-head-text{min-width:0}.ks-pane-head-text h1{margin:0;font-size:17px;font-weight:700;letter-spacing:normal;word-spacing:.04em;color:var(--p-text-color)}.ks-pane-head-text p{margin:2px 0 0;font-size:13px;color:var(--p-text-muted-color)}.ks-form{display:flex;flex-direction:column;gap:26px}.ks-pane-solo{flex:1;min-height:0;overflow-y:auto;padding:18px var(--system-surface-gutter) 28px}.ks-group{display:flex;flex-direction:column}.ks-group-head{display:flex;align-items:center;gap:8px;margin:0 0 8px 2px}.ks-group-ico{width:16px;height:16px;color:var(--p-text-muted-color)}.ks-group-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--p-text-muted-color);margin:0}.ks-group-count{font-size:10px;font-weight:600;line-height:1;padding:2px 7px;border-radius:999px;background:color-mix(in srgb,var(--p-text-color) 10%,transparent);color:var(--p-text-muted-color)}.ks-list{border:1px solid var(--p-content-border-color);border-radius:14px;overflow:hidden;background:var(--p-content-background)}.ks-row{display:flex;flex-wrap:wrap;align-items:flex-start;gap:12px 24px;padding:16px;border-bottom:1px solid var(--p-content-border-color)}.ks-row:last-child{border-bottom:none}.ks-row-main{flex:1 1 260px;min-width:0}.ks-row-head{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}.ks-title{font-size:14px;font-weight:600;color:var(--p-text-color)}.ks-key{font-size:11px;font-family:ui-monospace,monospace;padding:1px 6px;border-radius:6px;background:color-mix(in srgb,var(--p-text-color) 7%,transparent);color:var(--p-text-muted-color)}.ks-tag{background:color-mix(in srgb,var(--p-text-color) 10%,transparent);color:var(--p-text-muted-color)}.ks-tag-on{background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.ks-desc{font-size:12px;color:var(--p-text-muted-color);margin:3px 0 0}.ks-hint{font-size:11px;color:var(--p-text-muted-color);opacity:.85;margin:3px 0 0;font-family:ui-monospace,monospace}.ks-prov{font-size:11px;color:var(--p-text-muted-color);opacity:.8;margin-top:4px}.ks-row-invalid{background:color-mix(in srgb,var(--p-danger-500) 5%,transparent)}.ks-control{display:flex;flex-direction:column;align-items:stretch;gap:6px;flex:0 1 360px;min-width:0}.ks-field{display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:flex-end}.ks-field-err{font-size:12px;margin:0;text-align:right;color:var(--p-danger-600, var(--p-danger-500))}.ks-input{flex:1 1 180px;min-width:0;max-width:100%;padding:8px 10px;font:inherit;font-size:13px;color:var(--p-text-color);background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:8px;transition:border-color .15s}textarea.ks-input{flex-basis:100%;min-height:88px;font-family:ui-monospace,monospace;resize:vertical}.ks-check{flex:0 0 auto;width:18px;height:18px;accent-color:var(--p-primary-color)}.ks-static{font-size:13px;color:var(--p-text-muted-color)}.ks-select{flex:1 1 180px;min-width:0;max-width:100%}.ks-select.ks-select-invalid{border-color:var(--p-danger-500)}.ks-saved{display:inline-flex;align-items:center;gap:4px;font-size:12px;font-weight:600;color:var(--p-primary-color);white-space:nowrap}.ks-saved-tick{font-size:13px}.ks-row-wc{align-items:stretch}.ks-wc-slot{flex:1 1 360px;min-width:0}.ks-wc-slot .kx-wcmount{display:block}@media(max-width:640px){.ks{--system-surface-gutter: 16px}.ks-shell{flex-direction:column}.ks-nav{flex:0 0 auto;max-height:40%;flex-direction:row;flex-wrap:wrap;gap:6px;border-right:none;border-bottom:1px solid var(--p-content-border-color)}.ks-nav-section{flex-direction:row;flex-wrap:wrap;align-items:center;gap:6px}.ks-nav-group{margin:0 6px 0 2px}.ks-pane{padding-top:14px}.ks-form{gap:20px}.ks-row{padding:14px}.ks-control{flex:1 1 100%}.ks-field{justify-content:flex-start}}.ap{display:flex;flex-direction:column;height:100%;min-height:0;color:var(--p-text-color);background:var(--p-content-background)}.ap-body{flex:1;overflow-y:auto;padding:0 0 28px}.ap-bar{display:flex;align-items:center;justify-content:flex-end;gap:10px;width:100%;padding:12px var(--system-surface-gutter);background:var(--p-content-background);position:sticky;top:0;z-index:3;border-bottom:1px solid var(--p-content-border-color)}.ap-dirty{display:inline-flex;align-items:center;height:34px;font-size:12px;font-weight:600;color:var(--p-warn-600, var(--p-warn-500));background:color-mix(in srgb,var(--p-warn-500) 16%,transparent);padding:0 11px;border-radius:8px;margin-right:auto}.ap-msg{margin:12px var(--system-surface-gutter) 0;padding:9px 12px;border-radius:8px;font-size:13px}.ap-err{background:color-mix(in srgb,var(--p-danger-500) 12%,transparent);color:var(--p-danger-600, var(--p-danger-500))}.ap-loading{display:flex;align-items:center;gap:8px;color:var(--p-text-muted-color);font-size:13px;padding:24px}.ap-cards{display:flex;flex-direction:column;gap:16px;padding:16px var(--system-surface-gutter) 0}.ap-card{background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:14px;padding:16px 18px}.ap-h{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:800;color:var(--p-text-color);letter-spacing:normal;word-spacing:.04em}.ap-h svg{width:17px;height:17px;color:var(--p-text-muted-color)}.ap-sub{font-size:12.5px;color:var(--p-text-muted-color);margin:4px 0 12px}.ap-blabel{display:block;font-size:11.5px;font-weight:700;color:var(--p-text-muted-color);text-transform:uppercase;letter-spacing:.04em;margin:12px 0 6px}.ap-binput{width:100%;height:34px;padding:0 12px;border-radius:8px;border:1px solid var(--p-content-border-color);background:var(--p-content-background);color:var(--p-text-color);font:inherit;font-size:13px;box-sizing:border-box}.ap-select{width:100%}.ap-hint{font-size:11.5px;color:var(--p-text-muted-color);margin:8px 0 0}.ap-unit{display:flex;align-items:center;gap:8px}.ap-unit .ap-binput{flex:1;min-width:0}.ap-unit-suffix{font-size:12px;font-weight:600;color:var(--p-text-muted-color);flex:0 0 auto;min-width:34px}.ap-toggle-row{display:flex;align-items:center;gap:16px;margin-top:8px}.ap-toggle-text{display:flex;flex-direction:column;gap:2px;flex:1;min-width:0}.ap-toggle-name{font-size:13px;font-weight:600;color:var(--p-text-color)}.ap-toggle-desc{font-size:12px;color:var(--p-text-muted-color)}.ap-field-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px 14px;margin-top:14px}.ap-fg{min-width:0}.ap-fg .ap-blabel{margin-top:0}.pv-group+.pv-group{margin-top:22px}.pv-group-title{margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--p-text-muted-color)}.pv-field{margin-bottom:16px}.pv-field:last-child{margin-bottom:0}.pv-field-head{display:flex;align-items:center;gap:8px;margin-bottom:6px}.pv-reset{margin-left:auto}.pv-toggle{margin-top:2px}.pv-textarea{resize:vertical;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}.ks-all-search{margin-bottom:1rem}.ks-all-table{width:100%;border-collapse:collapse;text-align:left}.ks-all-table th{padding:1rem;color:var(--p-text-muted-color);font-weight:600}.ks-all-table .ks-row{display:table-row}.ks-all-table td{padding:1rem;vertical-align:top;border-top:1px solid var(--p-content-border-color)}.ks-all-table .ks-control{display:table-cell}.ks-all-table .ks-owner{color:var(--p-text-muted-color)}.perf{--system-surface-gutter: var(--kickside-system-surface-gutter, 1.5rem);container-type:inline-size}.perf-field{display:grid;grid-template-columns:minmax(0,1fr) minmax(12rem,.65fr);gap:1.5rem;padding-block:1.25rem;border-top:1px solid var(--p-content-border-color)}.perf-field-title{display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;font-weight:600}.perf-bounds{color:var(--p-text-muted-color);font-size:.75rem;margin-top:.5rem}.perf-input-unit{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem}.perf-input-unit input{width:min(100%,12rem);min-width:0}.perf-input-unit>span{color:var(--p-text-muted-color);font-size:.75rem}.perf-reset{margin-top:.25rem}.perf-status-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1.5rem;padding-top:.5rem}.perf-stat-title{margin:0 0 .5rem;font-size:.75rem;font-weight:600;color:var(--p-text-muted-color)}.perf-stat-values{display:flex;flex-wrap:wrap;align-items:baseline;gap:.5rem 1.25rem;margin:0}.perf-stat-values>div{display:flex;flex-direction:column-reverse;gap:.125rem}.perf-stat-values dt{font-size:.6875rem;color:var(--p-text-muted-color)}.perf-stat-values dd,.perf-stat-values strong{margin:0;font-size:1.5rem;font-weight:600;font-variant-numeric:tabular-nums;line-height:1.25;color:var(--p-text-color)}.perf-capacity .perf-stat-values>span{display:flex;flex-direction:column;gap:.125rem;font-size:.6875rem;color:var(--p-text-muted-color)}.perf-capacity-summary{white-space:nowrap}.perf-field-unused .perf-field-title,.perf-field-unused .ks-input{color:var(--p-text-muted-color)}.perf-field-unused .ks-input{background:var(--p-content-hover-background)}.perf-field-unused:focus-within .ks-input{color:var(--p-text-color)}.perf-share-bar{display:flex;gap:2px;height:.75rem;border-radius:var(--kx-radius-8);overflow:hidden;background:var(--p-content-background)}.perf-share-live{background:var(--p-primary-color)}.perf-share-backfill{background:var(--kx-surface-4)}.perf-share-maintenance{background:var(--p-text-muted-color)}.perf-share-inputs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.5rem;margin-top:.75rem}.perf-share-inputs label{display:flex;flex-wrap:wrap;gap:.25rem;font-size:.75rem;margin-bottom:.375rem}.perf-share-inputs label span{color:var(--p-text-muted-color)}.perf-share-inputs input{width:100%;min-width:0}.perf-invalid{color:var(--p-danger-color);font-size:.8125rem;margin-top:.5rem}.perf [data-source=admin]{color:var(--p-primary-color);background:var(--kx-wash-primary)}@container (max-width: 45rem){.perf-field{grid-template-columns:minmax(0,1fr);gap:.75rem}.perf-status-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.perf-capacity-summary{white-space:normal}}@container (max-width: 24rem){.perf-share-inputs{grid-template-columns:minmax(0,1fr)}.perf-share-inputs label{justify-content:space-between}}@container (max-width: 30rem){.perf .ap-bar{flex-wrap:wrap}.perf .ap-dirty{width:100%}.perf .ap-cards{padding-inline:.75rem}}.ks-input:focus-visible,.ap-binput:focus-visible{outline:none;border-color:var(--p-focus-ring-color);box-shadow:var(--p-focus-ring-shadow)}.ks-nav-item:focus-visible{outline:var(--p-focus-ring-width) var(--p-focus-ring-style) var(--p-focus-ring-color);outline-offset:var(--p-focus-ring-offset);box-shadow:none}';
export {
  kr as W,
  yr as a,
  _r as s,
  wr as u
};
//# sourceMappingURL=styles-DUWI6o6L.js.map
