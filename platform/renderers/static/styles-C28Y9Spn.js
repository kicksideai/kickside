import { hasInjectionContext as P, inject as C, effectScope as R, ref as b, markRaw as L, createApp as I } from "vue";
import { addCollection as A } from "@iconify/vue";
import { config as w, addIcons as O, on as T, applyThemeMode as m, host as N, hostCss as M, loadCss as U } from "@wippy-fe/proxy";
var x = "data-wippy-visible";
function y(t) {
  const e = t.getAttribute(x);
  return e === "true" ? !0 : e === "false" ? !1 : null;
}
var $ = Object.defineProperty, H = (t, e, r) => e in t ? $(t, e, { enumerable: !0, configurable: !0, writable: !0, value: r }) : t[e] = r, p = (t, e, r) => H(t, typeof e != "symbol" ? e + "" : e, r), D = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], F = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function _(t) {
  const e = t.startsWith("--") ? t : `--${t}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(e) ? e : null;
}
function B(...t) {
  const e = /* @__PURE__ */ new Set();
  for (const r of t)
    if (r)
      for (const [o, i] of Object.entries(r)) {
        if ((o === "@light" || o === "@dark") && i && typeof i == "object") {
          for (const [a, d] of Object.entries(i)) {
            const l = typeof d == "string" ? _(a) : null;
            l && e.add(l);
          }
          continue;
        }
        const s = typeof i == "string" ? _(o) : null;
        s && e.add(s);
      }
  return [...e].sort();
}
function W(t) {
  if (t.length === 0)
    return "";
  const e = t.map((r) => `  ${r}: inherit;`).join(`
`);
  return `${F} {
${e}
}`;
}
function K(t, e) {
  const r = W(e);
  r && k(t, r, "@wippy-fe/css-variables-bridge");
}
function q(t, e) {
  const o = (e ?? D).map(async (i) => {
    const s = M[i];
    if (!s)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${i}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await U(s);
    } catch (a) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${i}" (${s}):`, a), null;
    }
  });
  return Promise.all(o).then((i) => {
    for (const s of i) {
      if (!s)
        continue;
      const a = document.createElement("style");
      a.textContent = s, a.setAttribute("role", "@wippy-fe/host-css"), t.appendChild(a);
    }
  });
}
function Y(t, e) {
  const r = document.createElement("style");
  r.textContent = e, t.appendChild(r);
}
function k(t, e, r) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const i = new CSSStyleSheet();
    i.replaceSync(e), t.adoptedStyleSheets = [...t.adoptedStyleSheets, i];
    return;
  }
  const o = document.createElement("style");
  o.setAttribute("role", r), o.textContent = e, t.appendChild(o);
}
function J(t, e) {
  k(t, e, "@wippy-fe/custom-css");
}
function j(t) {
  return t.__wippyHost ?? null;
}
function G(t) {
  return t.replace(/-([a-z])/g, (e, r) => r.toUpperCase());
}
function X(t, e, r) {
  switch (r.type) {
    case "string":
      return { value: e };
    case "number": {
      const o = Number.parseFloat(e);
      return Number.isNaN(o) ? { value: void 0, error: `Invalid ${t}: expected a number` } : { value: o };
    }
    case "integer": {
      const o = Number.parseInt(e, 10);
      return Number.isNaN(o) ? { value: void 0, error: `Invalid ${t}: expected an integer` } : { value: o };
    }
    case "boolean":
      return { value: e !== "false" };
    case "array":
    case "object":
      try {
        const o = JSON.parse(e);
        return r.type === "array" && !Array.isArray(o) ? { value: void 0, error: `Invalid ${t}: expected a JSON array` } : { value: o };
      } catch {
        return { value: void 0, error: `Invalid ${t}: must be valid JSON` };
      }
    default:
      return { value: e };
  }
}
function f(t, e) {
  const r = {}, o = [];
  for (const [i, s] of Object.entries(e.properties)) {
    const a = t.getAttribute(i), d = G(i);
    if (a === null) {
      s.default !== void 0 && (r[d] = s.default);
      continue;
    }
    const l = X(i, a, s);
    l.error ? o.push(l.error) : r[d] = l.value;
  }
  return { props: r, errors: o };
}
var Q = class {
  constructor(t, e) {
    p(this, "_props"), p(this, "_errors"), p(this, "_content"), p(this, "_hostVisibility"), p(this, "_propsListeners", /* @__PURE__ */ new Set()), p(this, "_contentListeners", /* @__PURE__ */ new Set()), p(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), p(this, "_disposed", !1), p(this, "_emitToDom"), p(this, "props"), p(this, "events"), p(this, "content"), p(this, "hostVisibility"), this._props = t.props, this._errors = t.errors, this._content = t.content, this._hostVisibility = t.hostVisibility, this._emitToDom = e;
    const r = this;
    this.props = {
      get value() {
        return r._props;
      },
      get errors() {
        return r._errors;
      },
      subscribe(o, i) {
        return r._subscribeProps(o, i);
      }
    }, this.events = {
      emit(o, i) {
        r._disposed || r._emitToDom(o, i);
      }
    }, this.content = t.hasContent ? {
      get value() {
        return r._content;
      },
      subscribe(o, i) {
        return r._subscribeContent(o, i);
      }
    } : null, this.hostVisibility = {
      get value() {
        return r._hostVisibility;
      },
      subscribe(o, i) {
        return r._subscribeHostVisibility(o, i);
      }
    };
  }
  /** @internal */
  notifyProps(t, e) {
    if (!this._disposed) {
      this._props = t, this._errors = e;
      for (const r of this._propsListeners)
        r(t, e);
    }
  }
  /** @internal */
  notifyContent(t) {
    if (!this._disposed) {
      this._content = t;
      for (const e of this._contentListeners)
        e(t);
    }
  }
  /** @internal */
  notifyHostVisibility(t, e) {
    if (!(this._disposed || t === e)) {
      this._hostVisibility = t;
      for (const r of this._hostVisibilityListeners)
        r(t, e);
    }
  }
  /** @internal */
  dispose() {
    this._disposed || (this._disposed = !0, this._propsListeners.clear(), this._contentListeners.clear(), this._hostVisibilityListeners.clear());
  }
  _subscribeProps(t, e) {
    if (this._disposed || e?.signal?.aborted)
      return () => {
      };
    this._propsListeners.add(t), e?.immediate && t(this._props, this._errors);
    const r = () => {
      this._propsListeners.delete(t), e?.signal?.removeEventListener("abort", r);
    };
    return e?.signal?.addEventListener("abort", r, { once: !0 }), r;
  }
  _subscribeContent(t, e) {
    if (this._disposed || e?.signal?.aborted)
      return () => {
      };
    this._contentListeners.add(t), e?.immediate && t(this._content);
    const r = () => {
      this._contentListeners.delete(t), e?.signal?.removeEventListener("abort", r);
    };
    return e?.signal?.addEventListener("abort", r, { once: !0 }), r;
  }
  _subscribeHostVisibility(t, e) {
    if (this._disposed || e?.signal?.aborted)
      return () => {
      };
    this._hostVisibilityListeners.add(t), e?.immediate && t(this._hostVisibility, this._hostVisibility);
    const r = () => {
      this._hostVisibilityListeners.delete(t), e?.signal?.removeEventListener("abort", r);
    };
    return e?.signal?.addEventListener("abort", r, { once: !0 }), r;
  }
}, Z = class extends HTMLElement {
  constructor() {
    super(), p(this, "_internals"), p(this, "_contentObserver", null), p(this, "_initialized", !1), p(this, "_container", null), p(this, "_reactive", null), p(this, "_lastProps", null), p(this, "_lastErrors", []), p(this, "_lastContent", null), p(this, "_themeUnsub", null), p(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = y(this);
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
    const t = this.wippyConfig, e = Object.keys(t.propsSchema.properties), r = t.extraObservedAttributes ?? [];
    return [.../* @__PURE__ */ new Set([...e, ...r, x])];
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
    return j(this);
  }
  /**
   * Emit a CustomEvent that bubbles and crosses shadow DOM boundaries.
   */
  emitEvent(t, e) {
    this.dispatchEvent(new CustomEvent(t, {
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
      const t = this.constructor.wippyConfig, e = !!t.contentTemplate;
      let r, o;
      if (this._lastProps !== null)
        r = this._lastProps, o = this._lastErrors;
      else {
        const s = f(this, t.propsSchema);
        t.validateProps && s.errors.push(...t.validateProps(s.props)), r = s.props, o = s.errors, this._lastProps = r, this._lastErrors = o;
      }
      const i = e ? this._lastContent ?? this._extractContent(t.contentTemplate) : null;
      e && this._lastContent === null && (this._lastContent = i), this._reactive = new Q(
        { props: r, errors: o, content: i, hasContent: e, hostVisibility: this._hostVisible },
        this.emitEvent.bind(this)
      );
    }
    return this._reactive;
  }
  // ── Lifecycle ──────────────────────────────────────────────
  connectedCallback() {
    this._internals.states.add("loading");
    try {
      const t = this.constructor.wippyConfig, e = this._initialized, r = this.shadowRoot ?? this.attachShadow({ mode: t.shadowMode ?? "open" });
      let o;
      if (e)
        o = this._container;
      else {
        this.onInit(r), t.inlineCss && Y(r, t.inlineCss);
        try {
          const n = w?.theming, h = B(
            n?.global?.cssVariables,
            n?.children?.cssVariables
          );
          K(r, h);
        } catch {
        }
        if (t.customCss !== !1)
          try {
            const n = w?.theming, h = [n?.global?.customCSS, n?.children?.customCSS].filter(Boolean).join(`
`);
            h && J(r, h);
          } catch {
          }
        (t.hostCssKeys === void 0 || t.hostCssKeys.length > 0) && q(r, t.hostCssKeys), o = document.createElement("div"), o.setAttribute("data-wippy-theme-root", "");
        const l = t.containerClasses ?? [];
        l.length > 0 && o.classList.add(...l), r.appendChild(o), this._container = o, O(A);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = T("@theme", (l) => this._applyTheme(l)));
      const { props: i, errors: s } = f(this, t.propsSchema);
      t.validateProps && s.push(...t.validateProps(i));
      const a = i;
      this._lastProps = a, this._lastErrors = s;
      let d = null;
      t.contentTemplate && (d = this._extractContent(t.contentTemplate), this._lastContent = d, this._contentObserver = new MutationObserver(() => {
        const l = this._extractContent(t.contentTemplate);
        this._lastContent = l, this._reactive?.notifyContent(l), this.onContentChanged(l);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(r, o, a, s, d, e), this._internals.states.delete("loading"), this._internals.states.add("ready"), e || (this._initialized = !0), this.onReady(), this.emitEvent("load");
    } catch (t) {
      this.onError(t), this._internals.states.delete("loading"), this._internals.states.add("error"), this.emitEvent("error", {
        message: t instanceof Error ? t.message : String(t),
        error: t
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
  _applyTheme(t = N.getThemeMode?.()) {
    m(t, this), this._container && m(t, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), m("auto", this), this._container && m("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(t, e, r) {
    if (e === r)
      return;
    if (t === x) {
      const d = this._hostVisible, l = y(this);
      if (l === d)
        return;
      this._hostVisible = l, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(l, d), this.onHostVisibilityChanged(l, d));
      return;
    }
    const o = this.constructor.wippyConfig, { props: i, errors: s } = f(this, o.propsSchema);
    o.validateProps && s.push(...o.validateProps(i));
    const a = i;
    this._lastProps = a, this._lastErrors = s, this._reactive?.notifyProps(a, s), this.onPropsChanged(a, s);
  }
  // ── Hooks ──────────────────────────────────────────────────
  /** Called right after shadow DOM is attached, before CSS or container. */
  onInit(t) {
  }
  /** Called after internals state is set to ready, before the `load` event. */
  onReady() {
  }
  /** Called when connectedCallback throws. Default logs to console. */
  onError(t) {
    console.error(`${this.constructor.name} initialization failed:`, t);
  }
  /** Called when observed attributes change. Override to update framework state. */
  onPropsChanged(t, e) {
  }
  /**
   * Called when the host changes logical activity. `null` means unmanaged.
   * This does not imply a DOM remount or a CSS/viewport visibility change.
   */
  onHostVisibilityChanged(t, e) {
  }
  /**
   * Extract text from a child `<template data-type="...">` element.
   * Uses `.content.textContent` since `<template>` stores content in a DocumentFragment.
   */
  _extractContent(t) {
    return this.querySelector(`template[data-type="${t}"]`)?.content.textContent?.trim() ?? null;
  }
  /** Called when child `<template>` content changes. Override to update framework state. */
  onContentChanged(t) {
  }
};
function tt(t) {
  return t.__wippyHostBus ?? null;
}
function et(t) {
  return t.dataset.wippyPanelId ?? null;
}
/*!
 * pinia v4.0.3
 * (c) 2026 Eduardo San Martin Morote
 * @license MIT
 */
let S;
const E = (t) => S = t, rt = () => P() && C(z) || S, z = (
  /* istanbul ignore next */
  Symbol()
);
function ot() {
  const t = R(!0), e = t.run(() => b({}));
  let r = [], o = [];
  const i = L({
    install(s) {
      E(i), i._a = s, s.provide(z, i), s.config.globalProperties.$pinia = i, o.forEach((a) => r.push(a)), o = [];
    },
    use(s) {
      return this._a ? r.push(s) : o.push(s), this;
    },
    _p: r,
    _a: null,
    _e: t,
    _s: /* @__PURE__ */ new Map(),
    state: e
  });
  return i;
}
var it = Object.defineProperty, st = (t, e, r) => e in t ? it(t, e, { enumerable: !0, configurable: !0, writable: !0, value: r }) : t[e] = r, u = (t, e, r) => st(t, typeof e != "symbol" ? e + "" : e, r), nt = /* @__PURE__ */ Symbol("wippy:emit"), V = /* @__PURE__ */ Symbol("wippy:props"), at = /* @__PURE__ */ Symbol("wippy:props_error"), lt = /* @__PURE__ */ Symbol("wippy:content"), pt = /* @__PURE__ */ Symbol("wippy:panel-id"), dt = /* @__PURE__ */ Symbol("wippy:layout-bus"), ct = /* @__PURE__ */ Symbol("wippy:host"), ht = /* @__PURE__ */ Symbol("wippy:host-visibility");
function mt() {
  const t = C(V);
  if (!t)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return t;
}
var gt = class extends Z {
  constructor() {
    super(...arguments), u(this, "_vueApp", null), u(this, "_propsRef", b({})), u(this, "_errorsRef", b([])), u(this, "_contentRef", b(null)), u(this, "_hostVisibilityRef", b(null)), u(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  onMount(t, e, r, o, i, s) {
    const a = this.constructor.vueConfig;
    this._propsRef.value = r, this._errorsRef.value = o, this._contentRef.value = i ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const n of o)
      this.emitEvent("invalid", { message: n });
    const d = new AbortController();
    this._bridgeAbort = d, this.reactive.props.subscribe((n, h) => {
      this._propsRef.value = n, this._errorsRef.value = [...h];
      for (const c of h)
        this.emitEvent("invalid", { message: c });
    }, { signal: d.signal }), this.reactive.content && this.reactive.content.subscribe((n) => {
      this._contentRef.value = n;
    }, { signal: d.signal }), this.reactive.hostVisibility.subscribe((n) => {
      this._hostVisibilityRef.value = n;
    }, { signal: d.signal });
    const l = (n) => {
      if (d.signal.aborted)
        return;
      const h = rt(), c = I(n.rootComponent);
      this._vueApp = c;
      const v = ot();
      if (n.piniaPlugins)
        for (const g of n.piniaPlugins)
          v.use(g);
      if (c.use(v), n.plugins)
        for (const g of n.plugins)
          c.use(g);
      c.provide(V, this._propsRef), c.provide(at, this._errorsRef), c.provide(nt, this.emitEvent.bind(this)), c.provide(lt, this._contentRef), c.provide(ht, this._hostVisibilityRef), c.provide(pt, et(this)), c.provide(dt, tt(this)), c.provide(ct, j(this)), n.providers && n.providers(c, this), c.mount(e), h && E(h);
    };
    if (a.rootComponent)
      l(a);
    else if (a.lazyConfig) {
      const n = document.createElement("wippy-loading");
      n.setAttribute("no-bg", ""), e.appendChild(n), a.lazyConfig().then((h) => {
        d.signal.aborted || (n.remove(), l(h));
      }).catch((h) => {
        if (d.signal.aborted)
          return;
        const c = h instanceof Error ? h.message : String(h), v = document.createElement("wippy-error");
        v.setAttribute("title", "Failed to load"), v.setAttribute("message", c), n.replaceWith(v), this.emitEvent("error", { message: c });
      });
    } else
      throw new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._vueApp && (this._vueApp.unmount(), this._vueApp = null);
  }
};
const ft = '.spin{animation:kx-spin 1s linear infinite}@keyframes kx-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.spin{animation:none}}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}:host{display:block;min-width:0;--rv-text: var(--p-text-color);--rv-muted: var(--p-text-muted-color);--rv-faint: color-mix(in srgb, var(--p-text-color) 45%, transparent);--rv-border: var(--p-content-border-color, color-mix(in srgb, var(--p-text-color) 12%, transparent));--rv-surface: color-mix(in srgb, var(--p-text-color) 3%, transparent);--rv-surface-2: color-mix(in srgb, var(--p-text-color) 6%, transparent);--rv-header: color-mix(in srgb, var(--p-content-background) 90%, var(--p-text-color) 10%);--rv-zebra: color-mix(in srgb, var(--p-content-background) 96%, var(--p-text-color) 4%);--rv-danger: var(--p-danger-500);--rv-hljs-string: var(--p-success-600);--rv-hljs-number: var(--p-warn-500);--rv-hljs-title: var(--p-info-500);--rv-hljs-type: var(--p-info-600);--rv-hljs-attr: var(--p-help-500);--rv-document-canvas: #fff;--rv-video-canvas: #000;--rv-pad: 18px;--rv-radius: 10px}.rv{padding:var(--rv-pad);min-width:0;box-sizing:border-box}.rv-state{display:flex;align-items:center;justify-content:center;gap:9px;padding:40px 16px;color:var(--rv-muted);font-size:13px}.rv-state.err{color:var(--rv-danger)}.rv-state svg{width:17px;height:17px;flex-shrink:0}.rv-fallback{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:13px;text-align:center;min-height:180px;padding:40px 24px;border-radius:var(--rv-radius);border:1px solid var(--rv-border);background:var(--rv-surface);color:var(--rv-muted);font-size:13px}.rv-fallback svg{width:34px;height:34px;color:var(--rv-faint)}.rv-fallback strong{color:var(--rv-text);font-weight:700}.rv-fallback a{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:8px;border:1px solid var(--rv-border);color:var(--p-primary-color);text-decoration:none;font-weight:650}.rv-fallback a:hover{border-color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 8%,transparent)}.md{font-size:14.5px;line-height:1.7;color:var(--rv-text);overflow-wrap:break-word;max-width:768px}.md>:first-child{margin-top:0}.md>:last-child{margin-bottom:0}.md p{margin:0 0 14px}.md h1,.md h2,.md h3,.md h4,.md h5,.md h6{color:var(--rv-text);font-weight:720;line-height:1.28}.md h1{font-size:25px;margin:32px 0 14px;padding-bottom:9px;border-bottom:1px solid var(--rv-border)}.md h2{font-size:20px;margin:28px 0 12px;padding-bottom:7px;border-bottom:1px solid var(--rv-border)}.md h3{font-size:16.5px;margin:22px 0 9px}.md h4{font-size:14.5px;margin:18px 0 8px}.md h5,.md h6{font-size:12.5px;margin:16px 0 7px;text-transform:uppercase;letter-spacing:.04em;color:var(--rv-muted)}.md strong{font-weight:700;color:var(--rv-text)}.md em{font-style:italic}.md a{color:var(--p-primary-color);text-decoration:none;border-bottom:1px solid color-mix(in srgb,var(--p-primary-color) 38%,transparent)}.md a:hover{border-bottom-color:var(--p-primary-color)}.md ul,.md ol{margin:0 0 14px;padding-left:22px}.md li{margin:4px 0}.md li::marker{color:var(--rv-faint)}.md blockquote{margin:0 0 16px;padding:2px 16px;border-left:3px solid color-mix(in srgb,var(--p-primary-color) 55%,var(--rv-border));color:var(--rv-muted)}.md blockquote p{margin:8px 0}.md hr{border:none;border-top:1px solid var(--rv-border);margin:24px 0}.md :not(pre)>code{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:.88em;padding:2px 5px;border-radius:4px;background:color-mix(in srgb,var(--p-text-color) 6%,transparent);color:var(--rv-text);overflow-wrap:anywhere}.md pre{margin:0 0 16px;padding:12px 14px;border-radius:6px;background:color-mix(in srgb,var(--p-text-color) 4%,transparent);border:1px solid var(--rv-border);overflow-x:auto;white-space:pre-wrap}.md pre code{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:13px;line-height:1.6;color:var(--rv-text);background:transparent;padding:0;white-space:pre-wrap;overflow-wrap:anywhere}.md table{display:block;width:100%;margin:0 0 16px;border-collapse:collapse;overflow-x:auto;font-size:13.5px}.md th,.md td{padding:8px 11px;border:1px solid var(--rv-border);text-align:left;vertical-align:top}.md th{background:var(--rv-header);color:var(--rv-text);font-weight:700;white-space:nowrap}.md tr:nth-child(2n) td{background:var(--rv-zebra)}.md .hljs,.codev .hljs{color:var(--rv-text);background:transparent}.md .hljs-comment,.md .hljs-quote,.codev .hljs-comment,.codev .hljs-quote{color:var(--rv-faint);font-style:italic}.md .hljs-keyword,.md .hljs-selector-tag,.md .hljs-subst,.codev .hljs-keyword,.codev .hljs-selector-tag,.codev .hljs-subst{color:var(--p-primary-color)}.md .hljs-string,.md .hljs-doctag,.codev .hljs-string,.codev .hljs-doctag{color:var(--rv-hljs-string)}.md .hljs-number,.md .hljs-literal,.codev .hljs-number,.codev .hljs-literal{color:var(--rv-hljs-number)}.md .hljs-title,.md .hljs-section,.codev .hljs-title,.codev .hljs-section{color:var(--rv-hljs-title)}.md .hljs-type,.md .hljs-class .hljs-title,.codev .hljs-type,.codev .hljs-class .hljs-title{color:var(--rv-hljs-type)}.md .hljs-attribute,.md .hljs-name,.md .hljs-selector-class,.codev .hljs-attribute,.codev .hljs-name,.codev .hljs-selector-class{color:var(--rv-hljs-attr)}.md .hljs-built_in,.codev .hljs-built_in{color:var(--rv-hljs-title)}.md .hljs-meta,.codev .hljs-meta{color:var(--rv-muted)}.md .hljs-deletion,.codev .hljs-deletion{color:var(--rv-danger)}.md .hljs-addition,.codev .hljs-addition{color:var(--rv-hljs-string)}.pdfv{border:1px solid var(--rv-border);border-radius:8px;overflow:auto;background:color-mix(in srgb,var(--p-text-color) 3%,transparent);max-height:min(82vh,900px)}.pdfv-pages{display:flex;flex-direction:column;align-items:center;width:100%}.pdfv-page{position:relative;background:var(--rv-document-canvas);max-width:100%;container-type:inline-size}.pdfv-page+.pdfv-page{border-top:1px solid var(--rv-border)}.pdfv-page canvas{display:block;max-width:100%;height:auto}.textLayer{position:absolute;inset:0;overflow:clip;opacity:1;line-height:1;text-align:initial;transform-origin:0 0;forced-color-adjust:none;text-size-adjust:none;--scale-round-x: 1px;--scale-round-y: 1px;transform:scale(calc(100cqw / var(--pdf-width))) var(--pdf-rotation, translate(0))}.textLayer[data-main-rotation="90"]{--pdf-rotation: rotate(90deg) translateY(-100%)}.textLayer[data-main-rotation="180"]{--pdf-rotation: rotate(180deg) translate(-100%, -100%)}.textLayer[data-main-rotation="270"]{--pdf-rotation: rotate(270deg) translateX(-100%)}.textLayer span,.textLayer br{position:absolute;white-space:pre;color:transparent;transform-origin:0 0;cursor:text}.textLayer>:not(.markedContent),.textLayer .markedContent span:not(.markedContent){font-size:calc(var(--total-scale-factor) * var(--min-font-size) * var(--font-height));transform:rotate(var(--rotate, 0deg)) scaleX(var(--scale-x, 1)) scale(calc(1 / var(--min-font-size)))}.textLayer .markedContent{display:contents}.textLayer ::selection{background:color-mix(in srgb,var(--p-primary-color) 35%,transparent)}.imgv{display:flex;align-items:center;justify-content:center;padding:var(--rv-image-padding, 16px);border-radius:10px;background:color-mix(in srgb,var(--p-text-color) 4%,transparent);border:1px solid var(--rv-border)}.imgv img{max-width:100%;max-height:min(80vh,860px);height:auto;border-radius:4px;box-shadow:0 8px 24px color-mix(in srgb,#000 16%,transparent)}.htmlv{border:1px solid var(--rv-border);border-radius:10px;overflow:hidden;background:var(--rv-document-canvas)}.htmlv-frame{width:100%;border:0;display:block;min-height:240px}.codev-code{display:flex;border-radius:10px;overflow:hidden;border:1px solid var(--rv-border);background:color-mix(in srgb,var(--p-text-color) 4%,transparent);font-family:Geist Mono,ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12.5px;line-height:1.6}.codev-gutter{margin:0;padding:16px 10px 16px 14px;flex:none;text-align:right;color:var(--rv-faint);user-select:none;tab-size:2;border-right:1px solid var(--rv-border);background:color-mix(in srgb,var(--p-text-color) 2.5%,transparent);font:inherit;white-space:pre}.codev-pre{margin:0;padding:16px 18px;overflow:auto;flex:1;min-width:0;background:transparent;font:inherit;tab-size:2}.codev-pre code{font:inherit;white-space:pre}.codev-table-wrap{overflow:auto;border:1px solid var(--rv-border);border-radius:var(--rv-radius);max-height:78vh}.codev-table{width:100%;border-collapse:separate;border-spacing:0;font-size:12.5px}.codev-table th,.codev-table td{padding:8px 12px;text-align:left;border-bottom:1px solid var(--rv-border);border-right:1px solid var(--rv-border);white-space:nowrap}.codev-table th{position:sticky;top:0;z-index:1;font-weight:700;color:var(--rv-text);background:var(--rv-header);box-shadow:inset 0 -1px 0 var(--rv-border);letter-spacing:.01em}.codev-table td{color:var(--rv-muted)}.codev-table tbody tr:nth-child(2n) td{background:var(--rv-zebra)}.codev-table tbody tr:hover td{background:color-mix(in srgb,var(--p-primary-color) 7%,transparent)}.codev-table tr:last-child td{border-bottom:none}.codev-table th:last-child,.codev-table td:last-child{border-right:none}.docxv{display:flex;justify-content:center}.docxv-host{width:100%}.docxv-host .docx-wrapper{background:transparent;padding:0;gap:16px}.docxv-host .docx-wrapper>section.docx{box-shadow:0 8px 28px color-mix(in srgb,#000 16%,transparent);margin-bottom:0;max-width:100%;border-radius:4px;box-sizing:border-box;padding:clamp(22px,5%,48px)}.xlsxv{display:flex;flex-direction:column;min-width:0}.xlsxv-tabs{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px}.xlsxv-tab{height:28px;padding:0 12px;border-radius:8px;cursor:pointer;font:inherit;font-size:12px;font-weight:600;background:transparent;color:var(--rv-muted);border:1px solid var(--rv-border);transition:background .14s,color .14s,border-color .14s}.xlsxv-tab:hover{color:var(--rv-text)}.xlsxv-tab.on{color:var(--p-primary-color);border-color:color-mix(in srgb,var(--p-primary-color) 45%,transparent);background:color-mix(in srgb,var(--p-primary-color) 12%,transparent)}.xlsxv-sheet{overflow:auto;border:1px solid var(--rv-border);border-radius:var(--rv-radius);max-height:78vh}.xlsxv-sheet table{border-collapse:separate;border-spacing:0;font-size:12.5px;min-width:100%}.xlsxv-sheet td,.xlsxv-sheet th{border-bottom:1px solid var(--rv-border);border-right:1px solid var(--rv-border);padding:6px 10px;white-space:nowrap;color:var(--rv-text);text-align:left}.xlsxv-sheet td:last-child,.xlsxv-sheet th:last-child{border-right:none}.xlsxv-sheet tr:first-child td,.xlsxv-sheet thead td,.xlsxv-sheet thead th{position:sticky;top:0;z-index:1;font-weight:700;color:var(--rv-text);background:var(--rv-header);box-shadow:inset 0 -1px 0 var(--rv-border)}.xlsxv-sheet tbody tr:nth-child(2n) td,.xlsxv-sheet tr:nth-child(2n):not(:first-child) td{background:var(--rv-zebra)}.xlsxv-sheet tr:not(:first-child):hover td{background:color-mix(in srgb,var(--p-primary-color) 7%,transparent)}.pptxv{display:flex;flex-direction:column;align-items:center;gap:12px}.pptxv-frame{width:100%;max-width:960px;position:relative;overflow:hidden;background:var(--rv-document-canvas);border:1px solid var(--rv-border);border-radius:8px;box-shadow:0 8px 28px color-mix(in srgb,#000 16%,transparent)}.pptxv-stage{position:absolute;top:0;left:0;transform-origin:top left}.pptxv-nav{display:flex;align-items:center;gap:14px}.pptxv-btn{width:34px;height:34px;display:grid;place-items:center;cursor:pointer;border:1px solid var(--rv-border);border-radius:8px;background:transparent;color:var(--rv-text);transition:background .14s,color .14s,border-color .14s}.pptxv-btn:hover:not(:disabled){background:color-mix(in srgb,var(--p-text-color) 8%,transparent)}.pptxv-btn:disabled{opacity:.4;cursor:default}.pptxv-btn svg{width:18px;height:18px}.pptxv-count{font-size:12.5px;font-weight:600;color:var(--rv-muted);font-variant-numeric:tabular-nums}.mediav{display:flex;align-items:center;justify-content:center;padding:16px}.mediav-audio{width:100%;max-width:560px}.mediav-video{max-width:100%;max-height:min(80vh,860px);border-radius:8px;box-shadow:0 8px 24px color-mix(in srgb,#000 18%,transparent);background:var(--rv-video-canvas)}.preview-pager{display:flex;flex-wrap:wrap;align-items:center;gap:8px 16px;padding:8px 0;color:var(--rv-text);font-size:12px}.preview-axis{display:flex;flex-wrap:wrap;align-items:center;gap:8px}.preview-pager button,.preview-pager input{font:inherit;color:var(--rv-text);background:var(--rv-header);border:1px solid var(--rv-border);border-radius:var(--rv-radius);padding:4px 6px}.preview-pager input{width:64px}.preview-pager button{cursor:pointer}.preview-pager button:disabled{opacity:.5;cursor:default}.md-mermaid{overflow-x:auto;white-space:pre-wrap}.md-mermaid svg{display:block;max-width:100%;height:auto;white-space:normal}.md-mermaid-error{margin-top:8px;padding-left:8px;border-left:3px solid var(--rv-danger);color:var(--rv-text);white-space:normal}';
export {
  gt as W,
  ft as s,
  mt as u
};
//# sourceMappingURL=styles-C28Y9Spn.js.map
