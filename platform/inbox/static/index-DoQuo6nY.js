import { addCollection as v } from "@iconify/vue";
import { config as f, addIcons as C, on as g, applyThemeMode as p, host as S, hostCss as w, loadCss as V } from "@wippy-fe/proxy";
var _ = "data-wippy-visible";
function b(t) {
  const e = t.getAttribute(_);
  return e === "true" ? !0 : e === "false" ? !1 : null;
}
var E = Object.defineProperty, P = (t, e, s) => e in t ? E(t, e, { enumerable: !0, configurable: !0, writable: !0, value: s }) : t[e] = s, o = (t, e, s) => P(t, typeof e != "symbol" ? e + "" : e, s), L = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], I = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function m(t) {
  const e = t.startsWith("--") ? t : `--${t}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(e) ? e : null;
}
function T(...t) {
  const e = /* @__PURE__ */ new Set();
  for (const s of t)
    if (s)
      for (const [i, n] of Object.entries(s)) {
        if ((i === "@light" || i === "@dark") && n && typeof n == "object") {
          for (const [l, h] of Object.entries(n)) {
            const a = typeof h == "string" ? m(l) : null;
            a && e.add(a);
          }
          continue;
        }
        const r = typeof n == "string" ? m(i) : null;
        r && e.add(r);
      }
  return [...e].sort();
}
function O(t) {
  if (t.length === 0)
    return "";
  const e = t.map((s) => `  ${s}: inherit;`).join(`
`);
  return `${I} {
${e}
}`;
}
function A(t, e) {
  const s = O(e);
  s && y(t, s, "@wippy-fe/css-variables-bridge");
}
function x(t, e) {
  const i = (e ?? L).map(async (n) => {
    const r = w[n];
    if (!r)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${n}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await V(r);
    } catch (l) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${n}" (${r}):`, l), null;
    }
  });
  return Promise.all(i).then((n) => {
    for (const r of n) {
      if (!r)
        continue;
      const l = document.createElement("style");
      l.textContent = r, l.setAttribute("role", "@wippy-fe/host-css"), t.appendChild(l);
    }
  });
}
function H(t, e) {
  const s = document.createElement("style");
  s.textContent = e, t.appendChild(s);
}
function y(t, e, s) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const n = new CSSStyleSheet();
    n.replaceSync(e), t.adoptedStyleSheets = [...t.adoptedStyleSheets, n];
    return;
  }
  const i = document.createElement("style");
  i.setAttribute("role", s), i.textContent = e, t.appendChild(i);
}
function N(t, e) {
  y(t, e, "@wippy-fe/custom-css");
}
function $(t) {
  return t.__wippyHost ?? null;
}
function U(t) {
  return t.replace(/-([a-z])/g, (e, s) => s.toUpperCase());
}
function j(t, e, s) {
  switch (s.type) {
    case "string":
      return { value: e };
    case "number": {
      const i = Number.parseFloat(e);
      return Number.isNaN(i) ? { value: void 0, error: `Invalid ${t}: expected a number` } : { value: i };
    }
    case "integer": {
      const i = Number.parseInt(e, 10);
      return Number.isNaN(i) ? { value: void 0, error: `Invalid ${t}: expected an integer` } : { value: i };
    }
    case "boolean":
      return { value: e !== "false" };
    case "array":
    case "object":
      try {
        const i = JSON.parse(e);
        return s.type === "array" && !Array.isArray(i) ? { value: void 0, error: `Invalid ${t}: expected a JSON array` } : { value: i };
      } catch {
        return { value: void 0, error: `Invalid ${t}: must be valid JSON` };
      }
    default:
      return { value: e };
  }
}
function d(t, e) {
  const s = {}, i = [];
  for (const [n, r] of Object.entries(e.properties)) {
    const l = t.getAttribute(n), h = U(n);
    if (l === null) {
      r.default !== void 0 && (s[h] = r.default);
      continue;
    }
    const a = j(n, l, r);
    a.error ? i.push(a.error) : s[h] = a.value;
  }
  return { props: s, errors: i };
}
var B = class {
  constructor(t, e) {
    o(this, "_props"), o(this, "_errors"), o(this, "_content"), o(this, "_hostVisibility"), o(this, "_propsListeners", /* @__PURE__ */ new Set()), o(this, "_contentListeners", /* @__PURE__ */ new Set()), o(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), o(this, "_disposed", !1), o(this, "_emitToDom"), o(this, "props"), o(this, "events"), o(this, "content"), o(this, "hostVisibility"), this._props = t.props, this._errors = t.errors, this._content = t.content, this._hostVisibility = t.hostVisibility, this._emitToDom = e;
    const s = this;
    this.props = {
      get value() {
        return s._props;
      },
      get errors() {
        return s._errors;
      },
      subscribe(i, n) {
        return s._subscribeProps(i, n);
      }
    }, this.events = {
      emit(i, n) {
        s._disposed || s._emitToDom(i, n);
      }
    }, this.content = t.hasContent ? {
      get value() {
        return s._content;
      },
      subscribe(i, n) {
        return s._subscribeContent(i, n);
      }
    } : null, this.hostVisibility = {
      get value() {
        return s._hostVisibility;
      },
      subscribe(i, n) {
        return s._subscribeHostVisibility(i, n);
      }
    };
  }
  /** @internal */
  notifyProps(t, e) {
    if (!this._disposed) {
      this._props = t, this._errors = e;
      for (const s of this._propsListeners)
        s(t, e);
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
      for (const s of this._hostVisibilityListeners)
        s(t, e);
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
    const s = () => {
      this._propsListeners.delete(t), e?.signal?.removeEventListener("abort", s);
    };
    return e?.signal?.addEventListener("abort", s, { once: !0 }), s;
  }
  _subscribeContent(t, e) {
    if (this._disposed || e?.signal?.aborted)
      return () => {
      };
    this._contentListeners.add(t), e?.immediate && t(this._content);
    const s = () => {
      this._contentListeners.delete(t), e?.signal?.removeEventListener("abort", s);
    };
    return e?.signal?.addEventListener("abort", s, { once: !0 }), s;
  }
  _subscribeHostVisibility(t, e) {
    if (this._disposed || e?.signal?.aborted)
      return () => {
      };
    this._hostVisibilityListeners.add(t), e?.immediate && t(this._hostVisibility, this._hostVisibility);
    const s = () => {
      this._hostVisibilityListeners.delete(t), e?.signal?.removeEventListener("abort", s);
    };
    return e?.signal?.addEventListener("abort", s, { once: !0 }), s;
  }
}, F = class extends HTMLElement {
  constructor() {
    super(), o(this, "_internals"), o(this, "_contentObserver", null), o(this, "_initialized", !1), o(this, "_container", null), o(this, "_reactive", null), o(this, "_lastProps", null), o(this, "_lastErrors", []), o(this, "_lastContent", null), o(this, "_themeUnsub", null), o(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = b(this);
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
    const t = this.wippyConfig, e = Object.keys(t.propsSchema.properties), s = t.extraObservedAttributes ?? [];
    return [.../* @__PURE__ */ new Set([...e, ...s, _])];
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
    return $(this);
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
      let s, i;
      if (this._lastProps !== null)
        s = this._lastProps, i = this._lastErrors;
      else {
        const r = d(this, t.propsSchema);
        t.validateProps && r.errors.push(...t.validateProps(r.props)), s = r.props, i = r.errors, this._lastProps = s, this._lastErrors = i;
      }
      const n = e ? this._lastContent ?? this._extractContent(t.contentTemplate) : null;
      e && this._lastContent === null && (this._lastContent = n), this._reactive = new B(
        { props: s, errors: i, content: n, hasContent: e, hostVisibility: this._hostVisible },
        this.emitEvent.bind(this)
      );
    }
    return this._reactive;
  }
  // ── Lifecycle ──────────────────────────────────────────────
  connectedCallback() {
    this._internals.states.add("loading");
    try {
      const t = this.constructor.wippyConfig, e = this._initialized, s = this.shadowRoot ?? this.attachShadow({ mode: t.shadowMode ?? "open" });
      let i;
      if (e)
        i = this._container;
      else {
        this.onInit(s), t.inlineCss && H(s, t.inlineCss);
        try {
          const c = f?.theming, u = T(
            c?.global?.cssVariables,
            c?.children?.cssVariables
          );
          A(s, u);
        } catch {
        }
        if (t.customCss !== !1)
          try {
            const c = f?.theming, u = [c?.global?.customCSS, c?.children?.customCSS].filter(Boolean).join(`
`);
            u && N(s, u);
          } catch {
          }
        (t.hostCssKeys === void 0 || t.hostCssKeys.length > 0) && x(s, t.hostCssKeys), i = document.createElement("div"), i.setAttribute("data-wippy-theme-root", "");
        const a = t.containerClasses ?? [];
        a.length > 0 && i.classList.add(...a), s.appendChild(i), this._container = i, C(v);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = g("@theme", (a) => this._applyTheme(a)));
      const { props: n, errors: r } = d(this, t.propsSchema);
      t.validateProps && r.push(...t.validateProps(n));
      const l = n;
      this._lastProps = l, this._lastErrors = r;
      let h = null;
      t.contentTemplate && (h = this._extractContent(t.contentTemplate), this._lastContent = h, this._contentObserver = new MutationObserver(() => {
        const a = this._extractContent(t.contentTemplate);
        this._lastContent = a, this._reactive?.notifyContent(a), this.onContentChanged(a);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(s, i, l, r, h, e), this._internals.states.delete("loading"), this._internals.states.add("ready"), e || (this._initialized = !0), this.onReady(), this.emitEvent("load");
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
  _applyTheme(t = S.getThemeMode?.()) {
    p(t, this), this._container && p(t, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), p("auto", this), this._container && p("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(t, e, s) {
    if (e === s)
      return;
    if (t === _) {
      const h = this._hostVisible, a = b(this);
      if (a === h)
        return;
      this._hostVisible = a, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(a, h), this.onHostVisibilityChanged(a, h));
      return;
    }
    const i = this.constructor.wippyConfig, { props: n, errors: r } = d(this, i.propsSchema);
    i.validateProps && r.push(...i.validateProps(n));
    const l = n;
    this._lastProps = l, this._lastErrors = r, this._reactive?.notifyProps(l, r), this.onPropsChanged(l, r);
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
function K(t) {
  return t.__wippyHostBus ?? null;
}
function W(t) {
  return t.dataset.wippyPanelId ?? null;
}
export {
  F as W,
  K as a,
  $ as b,
  W as g
};
//# sourceMappingURL=index-DoQuo6nY.js.map
