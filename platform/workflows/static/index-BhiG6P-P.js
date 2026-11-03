import { ref as J, inject as lt, createApp as Xn, onMounted as Xt, onUnmounted as eo, watch as he, readonly as to, getCurrentInstance as ft, nextTick as no, reactive as oo, renderSlot as Q, openBlock as B, createBlock as Me, Teleport as en, createCommentVNode as be, useId as ro, mergeProps as L, h as io, createElementBlock as pe, createElementVNode as tn, resolveComponent as so, resolveDirective as ao, Transition as lo, withCtx as uo, normalizeClass as co, resolveDynamicComponent as mo, withDirectives as po } from "vue";
import { addCollection as fo } from "@iconify/vue";
import { config as ht, addIcons as ho, on as go, applyThemeMode as Ne, host as vo, hostCss as yo, loadCss as bo } from "@wippy-fe/proxy";
import { getActivePinia as So, createPinia as _o, setActivePinia as $o } from "pinia";
var qe = "data-wippy-visible";
function gt(e) {
  const t = e.getAttribute(qe);
  return t === "true" ? !0 : t === "false" ? !1 : null;
}
var wo = Object.defineProperty, To = (e, t, n) => t in e ? wo(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, x = (e, t, n) => To(e, typeof t != "symbol" ? t + "" : t, n), Po = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], Co = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function vt(e) {
  const t = e.startsWith("--") ? e : `--${e}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(t) ? t : null;
}
function Oo(...e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of e)
    if (n)
      for (const [o, r] of Object.entries(n)) {
        if ((o === "@light" || o === "@dark") && r && typeof r == "object") {
          for (const [l, a] of Object.entries(r)) {
            const i = typeof a == "string" ? vt(l) : null;
            i && t.add(i);
          }
          continue;
        }
        const s = typeof r == "string" ? vt(o) : null;
        s && t.add(s);
      }
  return [...t].sort();
}
function xo(e) {
  if (e.length === 0)
    return "";
  const t = e.map((n) => `  ${n}: inherit;`).join(`
`);
  return `${Co} {
${t}
}`;
}
function ko(e, t) {
  const n = xo(t);
  n && nn(e, n, "@wippy-fe/css-variables-bridge");
}
function Eo(e, t) {
  const o = (t ?? Po).map(async (r) => {
    const s = yo[r];
    if (!s)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${r}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await bo(s);
    } catch (l) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${r}" (${s}):`, l), null;
    }
  });
  return Promise.all(o).then((r) => {
    for (const s of r) {
      if (!s)
        continue;
      const l = document.createElement("style");
      l.textContent = s, l.setAttribute("role", "@wippy-fe/host-css"), e.appendChild(l);
    }
  });
}
function Ao(e, t) {
  const n = document.createElement("style");
  n.textContent = t, e.appendChild(n);
}
function nn(e, t, n) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const r = new CSSStyleSheet();
    r.replaceSync(t), e.adoptedStyleSheets = [...e.adoptedStyleSheets, r];
    return;
  }
  const o = document.createElement("style");
  o.setAttribute("role", n), o.textContent = t, e.appendChild(o);
}
function Lo(e, t) {
  nn(e, t, "@wippy-fe/custom-css");
}
function on(e) {
  return e.__wippyHost ?? null;
}
function jo(e) {
  return e.replace(/-([a-z])/g, (t, n) => n.toUpperCase());
}
function No(e, t, n) {
  switch (n.type) {
    case "string":
      return { value: t };
    case "number": {
      const o = Number.parseFloat(t);
      return Number.isNaN(o) ? { value: void 0, error: `Invalid ${e}: expected a number` } : { value: o };
    }
    case "integer": {
      const o = Number.parseInt(t, 10);
      return Number.isNaN(o) ? { value: void 0, error: `Invalid ${e}: expected an integer` } : { value: o };
    }
    case "boolean":
      return { value: t !== "false" };
    case "array":
    case "object":
      try {
        const o = JSON.parse(t);
        return n.type === "array" && !Array.isArray(o) ? { value: void 0, error: `Invalid ${e}: expected a JSON array` } : { value: o };
      } catch {
        return { value: void 0, error: `Invalid ${e}: must be valid JSON` };
      }
    default:
      return { value: t };
  }
}
function Fe(e, t) {
  const n = {}, o = [];
  for (const [r, s] of Object.entries(t.properties)) {
    const l = e.getAttribute(r), a = jo(r);
    if (l === null) {
      s.default !== void 0 && (n[a] = s.default);
      continue;
    }
    const i = No(r, l, s);
    i.error ? o.push(i.error) : n[a] = i.value;
  }
  return { props: n, errors: o };
}
var Io = class {
  constructor(e, t) {
    x(this, "_props"), x(this, "_errors"), x(this, "_content"), x(this, "_hostVisibility"), x(this, "_propsListeners", /* @__PURE__ */ new Set()), x(this, "_contentListeners", /* @__PURE__ */ new Set()), x(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), x(this, "_disposed", !1), x(this, "_emitToDom"), x(this, "props"), x(this, "events"), x(this, "content"), x(this, "hostVisibility"), this._props = e.props, this._errors = e.errors, this._content = e.content, this._hostVisibility = e.hostVisibility, this._emitToDom = t;
    const n = this;
    this.props = {
      get value() {
        return n._props;
      },
      get errors() {
        return n._errors;
      },
      subscribe(o, r) {
        return n._subscribeProps(o, r);
      }
    }, this.events = {
      emit(o, r) {
        n._disposed || n._emitToDom(o, r);
      }
    }, this.content = e.hasContent ? {
      get value() {
        return n._content;
      },
      subscribe(o, r) {
        return n._subscribeContent(o, r);
      }
    } : null, this.hostVisibility = {
      get value() {
        return n._hostVisibility;
      },
      subscribe(o, r) {
        return n._subscribeHostVisibility(o, r);
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
}, Ro = class extends HTMLElement {
  constructor() {
    super(), x(this, "_internals"), x(this, "_contentObserver", null), x(this, "_initialized", !1), x(this, "_container", null), x(this, "_reactive", null), x(this, "_lastProps", null), x(this, "_lastErrors", []), x(this, "_lastContent", null), x(this, "_themeUnsub", null), x(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = gt(this);
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
    return [.../* @__PURE__ */ new Set([...t, ...n, qe])];
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
    return on(this);
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
      let n, o;
      if (this._lastProps !== null)
        n = this._lastProps, o = this._lastErrors;
      else {
        const s = Fe(this, e.propsSchema);
        e.validateProps && s.errors.push(...e.validateProps(s.props)), n = s.props, o = s.errors, this._lastProps = n, this._lastErrors = o;
      }
      const r = t ? this._lastContent ?? this._extractContent(e.contentTemplate) : null;
      t && this._lastContent === null && (this._lastContent = r), this._reactive = new Io(
        { props: n, errors: o, content: r, hasContent: t, hostVisibility: this._hostVisible },
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
      let o;
      if (t)
        o = this._container;
      else {
        this.onInit(n), e.inlineCss && Ao(n, e.inlineCss);
        try {
          const u = ht?.theming, d = Oo(
            u?.global?.cssVariables,
            u?.children?.cssVariables
          );
          ko(n, d);
        } catch {
        }
        if (e.customCss !== !1)
          try {
            const u = ht?.theming, d = [u?.global?.customCSS, u?.children?.customCSS].filter(Boolean).join(`
`);
            d && Lo(n, d);
          } catch {
          }
        (e.hostCssKeys === void 0 || e.hostCssKeys.length > 0) && Eo(n, e.hostCssKeys), o = document.createElement("div"), o.setAttribute("data-wippy-theme-root", "");
        const i = e.containerClasses ?? [];
        i.length > 0 && o.classList.add(...i), n.appendChild(o), this._container = o, ho(fo);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = go("@theme", (i) => this._applyTheme(i)));
      const { props: r, errors: s } = Fe(this, e.propsSchema);
      e.validateProps && s.push(...e.validateProps(r));
      const l = r;
      this._lastProps = l, this._lastErrors = s;
      let a = null;
      e.contentTemplate && (a = this._extractContent(e.contentTemplate), this._lastContent = a, this._contentObserver = new MutationObserver(() => {
        const i = this._extractContent(e.contentTemplate);
        this._lastContent = i, this._reactive?.notifyContent(i), this.onContentChanged(i);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(n, o, l, s, a, t), this._internals.states.delete("loading"), this._internals.states.add("ready"), t || (this._initialized = !0), this.onReady(), this.emitEvent("load");
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
  _applyTheme(e = vo.getThemeMode?.()) {
    Ne(e, this), this._container && Ne(e, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), Ne("auto", this), this._container && Ne("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(e, t, n) {
    if (t === n)
      return;
    if (e === qe) {
      const a = this._hostVisible, i = gt(this);
      if (i === a)
        return;
      this._hostVisible = i, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(i, a), this.onHostVisibilityChanged(i, a));
      return;
    }
    const o = this.constructor.wippyConfig, { props: r, errors: s } = Fe(this, o.propsSchema);
    o.validateProps && s.push(...o.validateProps(r));
    const l = r;
    this._lastProps = l, this._lastErrors = s, this._reactive?.notifyProps(l, s), this.onPropsChanged(l, s);
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
function Vo(e) {
  return e.__wippyHostBus ?? null;
}
function Do(e) {
  return e.dataset.wippyPanelId ?? null;
}
var Mo = Object.defineProperty, Bo = (e, t, n) => t in e ? Mo(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, me = (e, t, n) => Bo(e, typeof t != "symbol" ? t + "" : t, n), rn = /* @__PURE__ */ Symbol("wippy:emit"), sn = /* @__PURE__ */ Symbol("wippy:props"), Wo = /* @__PURE__ */ Symbol("wippy:props_error"), Uo = /* @__PURE__ */ Symbol("wippy:content"), zo = /* @__PURE__ */ Symbol("wippy:panel-id"), Ho = /* @__PURE__ */ Symbol("wippy:layout-bus"), Fo = /* @__PURE__ */ Symbol("wippy:host"), an = /* @__PURE__ */ Symbol("wippy:host-visibility");
function hs() {
  const e = lt(sn);
  if (!e)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return e;
}
function gs() {
  const e = lt(rn);
  if (!e)
    throw new Error("useEvents() must be called inside a WippyVueElement");
  return e;
}
function Ko() {
  const e = lt(an);
  if (!e)
    throw new Error("useHostVisibility() must be called inside a WippyVueElement");
  return e;
}
function vs(e) {
  const t = Ko();
  let n = !1, o = null, r = !1;
  function s() {
    if (o)
      return r = !0, o;
    let l;
    try {
      l = Promise.resolve(e());
    } catch (i) {
      l = Promise.reject(i);
    }
    const a = l.finally(() => {
      if (o === a && (o = null, n && r))
        return r = !1, s();
    });
    return o = a, a;
  }
  return Xt(() => (n = !0, s())), eo(() => {
    n = !1, r = !1;
  }), he(t, (l, a) => {
    if (n && a === !1 && l === !0)
      return s();
  }), t;
}
var ys = class extends Ro {
  constructor() {
    super(...arguments), me(this, "_vueApp", null), me(this, "_propsRef", J({})), me(this, "_errorsRef", J([])), me(this, "_contentRef", J(null)), me(this, "_hostVisibilityRef", J(null)), me(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  onMount(e, t, n, o, r, s) {
    const l = this.constructor.vueConfig;
    this._propsRef.value = n, this._errorsRef.value = o, this._contentRef.value = r ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const u of o)
      this.emitEvent("invalid", { message: u });
    const a = new AbortController();
    this._bridgeAbort = a, this.reactive.props.subscribe((u, d) => {
      this._propsRef.value = u, this._errorsRef.value = [...d];
      for (const c of d)
        this.emitEvent("invalid", { message: c });
    }, { signal: a.signal }), this.reactive.content && this.reactive.content.subscribe((u) => {
      this._contentRef.value = u;
    }, { signal: a.signal }), this.reactive.hostVisibility.subscribe((u) => {
      this._hostVisibilityRef.value = u;
    }, { signal: a.signal });
    const i = (u) => {
      if (a.signal.aborted)
        return;
      const d = So(), c = Xn(u.rootComponent);
      this._vueApp = c;
      const m = _o();
      if (u.piniaPlugins)
        for (const p of u.piniaPlugins)
          m.use(p);
      if (c.use(m), u.plugins)
        for (const p of u.plugins)
          c.use(p);
      c.provide(sn, this._propsRef), c.provide(Wo, this._errorsRef), c.provide(rn, this.emitEvent.bind(this)), c.provide(Uo, this._contentRef), c.provide(an, this._hostVisibilityRef), c.provide(zo, Do(this)), c.provide(Ho, Vo(this)), c.provide(Fo, on(this)), u.providers && u.providers(c, this), c.mount(t), d && $o(d);
    };
    if (l.rootComponent)
      i(l);
    else if (l.lazyConfig) {
      const u = document.createElement("wippy-loading");
      u.setAttribute("no-bg", ""), t.appendChild(u), l.lazyConfig().then((d) => {
        a.signal.aborted || (u.remove(), i(d));
      }).catch((d) => {
        if (a.signal.aborted)
          return;
        const c = d instanceof Error ? d.message : String(d), m = document.createElement("wippy-error");
        m.setAttribute("title", "Failed to load"), m.setAttribute("message", c), u.replaceWith(m), this.emitEvent("error", { message: c });
      });
    } else
      throw new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._vueApp && (this._vueApp.unmount(), this._vueApp = null);
  }
}, Yo = Object.defineProperty, yt = Object.getOwnPropertySymbols, qo = Object.prototype.hasOwnProperty, Go = Object.prototype.propertyIsEnumerable, bt = (e, t, n) => t in e ? Yo(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, Jo = (e, t) => {
  for (var n in t || (t = {})) qo.call(t, n) && bt(e, n, t[n]);
  if (yt) for (var n of yt(t)) Go.call(t, n) && bt(e, n, t[n]);
  return e;
};
function Le(e) {
  return e == null || e === "" || Array.isArray(e) && e.length === 0 || !(e instanceof Date) && typeof e == "object" && Object.keys(e).length === 0;
}
function Ge(e, t, n = /* @__PURE__ */ new WeakSet()) {
  if (e === t) return !0;
  if (!e || !t || typeof e != "object" || typeof t != "object" || n.has(e) || n.has(t)) return !1;
  n.add(e).add(t);
  let o = Array.isArray(e), r = Array.isArray(t), s, l, a;
  if (o && r) {
    if (l = e.length, l != t.length) return !1;
    for (s = l; s-- !== 0; ) if (!Ge(e[s], t[s], n)) return !1;
    return !0;
  }
  if (o != r) return !1;
  let i = e instanceof Date, u = t instanceof Date;
  if (i != u) return !1;
  if (i && u) return e.getTime() == t.getTime();
  let d = e instanceof RegExp, c = t instanceof RegExp;
  if (d != c) return !1;
  if (d && c) return e.toString() == t.toString();
  let m = Object.keys(e);
  if (l = m.length, l !== Object.keys(t).length) return !1;
  for (s = l; s-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(t, m[s])) return !1;
  for (s = l; s-- !== 0; ) if (a = m[s], !Ge(e[a], t[a], n)) return !1;
  return !0;
}
function Qo(e, t) {
  return Ge(e, t);
}
function He(e) {
  return typeof e == "function" && "call" in e && "apply" in e;
}
function C(e) {
  return !Le(e);
}
function Je(e, t) {
  if (!e || !t) return null;
  try {
    let n = e[t];
    if (C(n)) return n;
  } catch {
  }
  if (Object.keys(e).length) {
    if (He(t)) return t(e);
    if (t.indexOf(".") === -1) return e[t];
    {
      let n = t.split("."), o = e;
      for (let r = 0, s = n.length; r < s; ++r) {
        if (o == null) return null;
        o = o[n[r]];
      }
      return o;
    }
  }
  return null;
}
function Zo(e, t, n) {
  return n ? Je(e, n) === Je(t, n) : Qo(e, t);
}
function U(e, t = !0) {
  return e instanceof Object && e.constructor === Object && (t || Object.keys(e).length !== 0);
}
function ln(e = {}, t = {}) {
  let n = Jo({}, e);
  return Object.keys(t).forEach((o) => {
    let r = o;
    U(t[r]) && r in e && U(e[r]) ? n[r] = ln(e[r], t[r]) : n[r] = t[r];
  }), n;
}
function Xo(...e) {
  return e.reduce((t, n, o) => o === 0 ? n : ln(t, n), {});
}
function bs(e, t) {
  let n = -1;
  if (C(e)) try {
    n = e.findLastIndex(t);
  } catch {
    n = e.lastIndexOf([...e].reverse().find(t));
  }
  return n;
}
function N(e, ...t) {
  return He(e) ? e(...t) : e;
}
function j(e, t = !0) {
  return typeof e == "string" && (t || e !== "");
}
function W(e) {
  return j(e) ? e.replace(/(-|_)/g, "").toLowerCase() : e;
}
function ut(e, t = "", n = {}) {
  let o = W(t).split("."), r = o.shift();
  if (r) {
    if (U(e)) {
      let s = Object.keys(e).find((l) => W(l) === r) || "";
      return ut(N(e[s], n), o.join("."), n);
    }
    return;
  }
  return N(e, n);
}
function un(e, t = !0) {
  return Array.isArray(e) && (t || e.length !== 0);
}
function er(e) {
  return C(e) && !isNaN(e);
}
function Ss(e = "") {
  return C(e) && e.length === 1 && !!e.match(/\S| /);
}
function ie(e, t) {
  if (t) {
    let n = t.test(e);
    return t.lastIndex = 0, n;
  }
  return !1;
}
function tr(...e) {
  return Xo(...e);
}
function Se(e) {
  return e && e.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function R(e) {
  if (e && /[\xC0-\xFF\u0100-\u017E]/.test(e)) {
    let t = { A: /[\xC0-\xC5\u0100\u0102\u0104]/g, AE: /[\xC6]/g, C: /[\xC7\u0106\u0108\u010A\u010C]/g, D: /[\xD0\u010E\u0110]/g, E: /[\xC8-\xCB\u0112\u0114\u0116\u0118\u011A]/g, G: /[\u011C\u011E\u0120\u0122]/g, H: /[\u0124\u0126]/g, I: /[\xCC-\xCF\u0128\u012A\u012C\u012E\u0130]/g, IJ: /[\u0132]/g, J: /[\u0134]/g, K: /[\u0136]/g, L: /[\u0139\u013B\u013D\u013F\u0141]/g, N: /[\xD1\u0143\u0145\u0147\u014A]/g, O: /[\xD2-\xD6\xD8\u014C\u014E\u0150]/g, OE: /[\u0152]/g, R: /[\u0154\u0156\u0158]/g, S: /[\u015A\u015C\u015E\u0160]/g, T: /[\u0162\u0164\u0166]/g, U: /[\xD9-\xDC\u0168\u016A\u016C\u016E\u0170\u0172]/g, W: /[\u0174]/g, Y: /[\xDD\u0176\u0178]/g, Z: /[\u0179\u017B\u017D]/g, a: /[\xE0-\xE5\u0101\u0103\u0105]/g, ae: /[\xE6]/g, c: /[\xE7\u0107\u0109\u010B\u010D]/g, d: /[\u010F\u0111]/g, e: /[\xE8-\xEB\u0113\u0115\u0117\u0119\u011B]/g, g: /[\u011D\u011F\u0121\u0123]/g, i: /[\xEC-\xEF\u0129\u012B\u012D\u012F\u0131]/g, ij: /[\u0133]/g, j: /[\u0135]/g, k: /[\u0137,\u0138]/g, l: /[\u013A\u013C\u013E\u0140\u0142]/g, n: /[\xF1\u0144\u0146\u0148\u014B]/g, p: /[\xFE]/g, o: /[\xF2-\xF6\xF8\u014D\u014F\u0151]/g, oe: /[\u0153]/g, r: /[\u0155\u0157\u0159]/g, s: /[\u015B\u015D\u015F\u0161]/g, t: /[\u0163\u0165\u0167]/g, u: /[\xF9-\xFC\u0169\u016B\u016D\u016F\u0171\u0173]/g, w: /[\u0175]/g, y: /[\xFD\xFF\u0177]/g, z: /[\u017A\u017C\u017E]/g };
    for (let n in t) e = e.replace(t[n], n);
  }
  return e;
}
function nr(e) {
  return j(e, !1) ? e[0].toUpperCase() + e.slice(1) : e;
}
function dn(e) {
  return j(e) ? e.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : e;
}
function cn() {
  let e = /* @__PURE__ */ new Map();
  return { on(t, n) {
    let o = e.get(t);
    return o ? o.push(n) : o = [n], e.set(t, o), this;
  }, off(t, n) {
    let o = e.get(t);
    return o && o.splice(o.indexOf(n) >>> 0, 1), this;
  }, emit(t, n) {
    let o = e.get(t);
    o && o.forEach((r) => {
      r(n);
    });
  }, clear() {
    e.clear();
  } };
}
function mn(...e) {
  if (e) {
    let t = [];
    for (let n = 0; n < e.length; n++) {
      let o = e[n];
      if (!o) continue;
      let r = typeof o;
      if (r === "string" || r === "number") t.push(o);
      else if (r === "object") {
        let s = Array.isArray(o) ? [mn(...o)] : Object.entries(o).map(([l, a]) => a ? l : void 0);
        t = s.length ? t.concat(s.filter((l) => !!l)) : t;
      }
    }
    return t.join(" ").trim();
  }
}
function or(e, t) {
  return e ? e.classList ? e.classList.contains(t) : new RegExp("(^| )" + t + "( |$)", "gi").test(e.className) : !1;
}
function Qe(e, t) {
  if (e && t) {
    let n = (o) => {
      or(e, o) || (e.classList ? e.classList.add(o) : e.className += " " + o);
    };
    [t].flat().filter(Boolean).forEach((o) => o.split(" ").forEach(n));
  }
}
function rr() {
  return window.innerWidth - document.documentElement.offsetWidth;
}
function _s(e) {
  typeof e == "string" ? Qe(document.body, e || "p-overflow-hidden") : (e != null && e.variableName && document.body.style.setProperty(e.variableName, rr() + "px"), Qe(document.body, e?.className || "p-overflow-hidden"));
}
function _e(e, t) {
  if (e && t) {
    let n = (o) => {
      e.classList ? e.classList.remove(o) : e.className = e.className.replace(new RegExp("(^|\\b)" + o.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [t].flat().filter(Boolean).forEach((o) => o.split(" ").forEach(n));
  }
}
function $s(e) {
  typeof e == "string" ? _e(document.body, e || "p-overflow-hidden") : (e != null && e.variableName && document.body.style.removeProperty(e.variableName), _e(document.body, e?.className || "p-overflow-hidden"));
}
function Ze(e) {
  for (let t of document?.styleSheets) try {
    for (let n of t?.cssRules) for (let o of n?.style) if (e.test(o)) return { name: o, value: n.style.getPropertyValue(o).trim() };
  } catch {
  }
  return null;
}
function pn(e) {
  let t = { width: 0, height: 0 };
  if (e) {
    let [n, o] = [e.style.visibility, e.style.display], r = e.getBoundingClientRect();
    e.style.visibility = "hidden", e.style.display = "block", t.width = r.width || e.offsetWidth, t.height = r.height || e.offsetHeight, e.style.display = o, e.style.visibility = n;
  }
  return t;
}
function fn() {
  let e = window, t = document, n = t.documentElement, o = t.getElementsByTagName("body")[0], r = e.innerWidth || n.clientWidth || o.clientWidth, s = e.innerHeight || n.clientHeight || o.clientHeight;
  return { width: r, height: s };
}
function Xe(e) {
  return e ? Math.abs(e.scrollLeft) : 0;
}
function ir() {
  let e = document.documentElement;
  return (window.pageXOffset || Xe(e)) - (e.clientLeft || 0);
}
function sr() {
  let e = document.documentElement;
  return (window.pageYOffset || e.scrollTop) - (e.clientTop || 0);
}
function ar(e) {
  return e ? getComputedStyle(e).direction === "rtl" : !1;
}
function ws(e, t, n = !0) {
  var o, r, s, l;
  if (e) {
    let a = e.offsetParent ? { width: e.offsetWidth, height: e.offsetHeight } : pn(e), i = a.height, u = a.width, d = t.offsetHeight, c = t.offsetWidth, m = t.getBoundingClientRect(), p = sr(), f = ir(), v = fn(), g, y, S = "top";
    m.top + d + i > v.height ? (g = m.top + p - i, S = "bottom", g < 0 && (g = p)) : g = d + m.top + p, m.left + u > v.width ? y = Math.max(0, m.left + f + c - u) : y = m.left + f, ar(e) ? e.style.insetInlineEnd = y + "px" : e.style.insetInlineStart = y + "px", e.style.top = g + "px", e.style.transformOrigin = S, n && (e.style.marginTop = S === "bottom" ? `calc(${(r = (o = Ze(/-anchor-gutter$/)) == null ? void 0 : o.value) != null ? r : "2px"} * -1)` : (l = (s = Ze(/-anchor-gutter$/)) == null ? void 0 : s.value) != null ? l : "");
  }
}
function Ts(e, t) {
  e && (typeof t == "string" ? e.style.cssText = t : Object.entries(t || {}).forEach(([n, o]) => e.style[n] = o));
}
function lr(e, t) {
  return e instanceof HTMLElement ? e.offsetWidth : 0;
}
function Ps(e, t, n = !0, o = void 0) {
  var r;
  if (e) {
    let s = e.offsetParent ? { width: e.offsetWidth, height: e.offsetHeight } : pn(e), l = t.offsetHeight, a = t.getBoundingClientRect(), i = fn(), u, d, c = o ?? "top";
    if (!o && a.top + l + s.height > i.height ? (u = -1 * s.height, c = "bottom", a.top + u < 0 && (u = -1 * a.top)) : u = l, s.width > i.width ? d = a.left * -1 : a.left + s.width > i.width ? d = (a.left + s.width - i.width) * -1 : d = 0, e.style.top = u + "px", e.style.insetInlineStart = d + "px", e.style.transformOrigin = c, n) {
      let m = (r = Ze(/-anchor-gutter$/)) == null ? void 0 : r.value;
      e.style.marginTop = c === "bottom" ? `calc(${m ?? "2px"} * -1)` : m ?? "";
    }
  }
}
function hn(e) {
  if (e) {
    let t = e.parentNode;
    return t && t instanceof ShadowRoot && t.host && (t = t.host), t;
  }
  return null;
}
function ur(e) {
  return !!(e !== null && typeof e < "u" && e.nodeName && hn(e));
}
function ae(e) {
  return typeof Element < "u" ? e instanceof Element : e !== null && typeof e == "object" && e.nodeType === 1 && typeof e.nodeName == "string";
}
function Cs() {
  if (window.getSelection) {
    let e = window.getSelection() || {};
    e.empty ? e.empty() : e.removeAllRanges && e.rangeCount > 0 && e.getRangeAt(0).getClientRects().length > 0 && e.removeAllRanges();
  }
}
function Be(e, t = {}) {
  if (ae(e)) {
    let n = (o, r) => {
      var s, l;
      let a = (s = e?.$attrs) != null && s[o] ? [(l = e?.$attrs) == null ? void 0 : l[o]] : [];
      return [r].flat().reduce((i, u) => {
        if (u != null) {
          let d = typeof u;
          if (d === "string" || d === "number") i.push(u);
          else if (d === "object") {
            let c = Array.isArray(u) ? n(o, u) : Object.entries(u).map(([m, p]) => o === "style" && (p || p === 0) ? `${m.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}:${p}` : p ? m : void 0);
            i = c.length ? i.concat(c.filter((m) => !!m)) : i;
          }
        }
        return i;
      }, a);
    };
    Object.entries(t).forEach(([o, r]) => {
      if (r != null) {
        let s = o.match(/^on(.+)/);
        s ? e.addEventListener(s[1].toLowerCase(), r) : o === "p-bind" || o === "pBind" ? Be(e, r) : (r = o === "class" ? [...new Set(n("class", r))].join(" ").trim() : o === "style" ? n("style", r).join(";").trim() : r, (e.$attrs = e.$attrs || {}) && (e.$attrs[o] = r), e.setAttribute(o, r));
      }
    });
  }
}
function dr(e, t = {}, ...n) {
  {
    let o = document.createElement(e);
    return Be(o, t), o.append(...n), o;
  }
}
function cr(e, t) {
  return ae(e) ? Array.from(e.querySelectorAll(t)) : [];
}
function gn(e, t) {
  return ae(e) ? e.matches(t) ? e : e.querySelector(t) : null;
}
function Os(e, t) {
  e && document.activeElement !== e && e.focus(t);
}
function mr(e, t) {
  if (ae(e)) {
    let n = e.getAttribute(t);
    return isNaN(n) ? n === "true" || n === "false" ? n === "true" : n : +n;
  }
}
function vn(e, t = "") {
  let n = cr(e, `button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [href]:not([tabindex = "-1"]):not([style*="display:none"]):not([hidden])${t},
            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t}`), o = [];
  for (let r of n) getComputedStyle(r).display != "none" && getComputedStyle(r).visibility != "hidden" && o.push(r);
  return o;
}
function xs(e, t) {
  let n = vn(e, t);
  return n.length > 0 ? n[0] : null;
}
function St(e) {
  if (e) {
    let t = e.offsetHeight, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingTop) + parseFloat(n.paddingBottom) + parseFloat(n.borderTopWidth) + parseFloat(n.borderBottomWidth), t;
  }
  return 0;
}
function ks(e, t) {
  let n = vn(e, t);
  return n.length > 0 ? n[n.length - 1] : null;
}
function pr(e) {
  if (e) {
    let t = e.getBoundingClientRect();
    return { top: t.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: t.left + (window.pageXOffset || Xe(document.documentElement) || Xe(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function fr(e, t) {
  return e ? e.offsetHeight : 0;
}
function yn(e, t = []) {
  let n = hn(e);
  return n === null ? t : yn(n, t.concat([n]));
}
function Es(e) {
  let t = [];
  if (e) {
    let n = yn(e), o = /(auto|scroll)/, r = (s) => {
      try {
        let l = window.getComputedStyle(s, null);
        return o.test(l.getPropertyValue("overflow")) || o.test(l.getPropertyValue("overflowX")) || o.test(l.getPropertyValue("overflowY"));
      } catch {
        return !1;
      }
    };
    for (let s of n) {
      let l = s.nodeType === 1 && s.dataset.scrollselectors;
      if (l) {
        let a = l.split(",");
        for (let i of a) {
          let u = gn(s, i);
          u && r(u) && t.push(u);
        }
      }
      s.nodeType !== 9 && r(s) && t.push(s);
    }
  }
  return t;
}
function As() {
  if (window.getSelection) return window.getSelection().toString();
  if (document.getSelection) return document.getSelection().toString();
}
function _t(e) {
  if (e) {
    let t = e.offsetWidth, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingLeft) + parseFloat(n.paddingRight) + parseFloat(n.borderLeftWidth) + parseFloat(n.borderRightWidth), t;
  }
  return 0;
}
function Ls() {
  return /(android)/i.test(navigator.userAgent);
}
function bn() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function js(e, t = "") {
  return ae(e) ? e.matches(`button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [href][clientHeight][clientWidth]:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t}`) : !1;
}
function Ns(e) {
  return !!(e && e.offsetParent != null);
}
function Is() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}
function hr(e, t = "", n) {
  ae(e) && n !== null && n !== void 0 && e.setAttribute(t, n);
}
var Ie = {};
function gr(e = "pui_id_") {
  return Object.hasOwn(Ie, e) || (Ie[e] = 0), Ie[e]++, `${e}${Ie[e]}`;
}
var vr = Object.defineProperty, yr = Object.defineProperties, br = Object.getOwnPropertyDescriptors, We = Object.getOwnPropertySymbols, Sn = Object.prototype.hasOwnProperty, _n = Object.prototype.propertyIsEnumerable, $t = (e, t, n) => t in e ? vr(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, D = (e, t) => {
  for (var n in t || (t = {})) Sn.call(t, n) && $t(e, n, t[n]);
  if (We) for (var n of We(t)) _n.call(t, n) && $t(e, n, t[n]);
  return e;
}, Ke = (e, t) => yr(e, br(t)), H = (e, t) => {
  var n = {};
  for (var o in e) Sn.call(e, o) && t.indexOf(o) < 0 && (n[o] = e[o]);
  if (e != null && We) for (var o of We(e)) t.indexOf(o) < 0 && _n.call(e, o) && (n[o] = e[o]);
  return n;
}, Sr = cn(), E = Sr, $e = /{([^}]*)}/g, $n = /(\d+\s+[\+\-\*\/]\s+\d+)/g, wn = /var\([^)]+\)/g;
function wt(e) {
  return j(e) ? e.replace(/[A-Z]/g, (t, n) => n === 0 ? t : "." + t.toLowerCase()).toLowerCase() : e;
}
function _r(e) {
  return U(e) && e.hasOwnProperty("$value") && e.hasOwnProperty("$type") ? e.$value : e;
}
function $r(e) {
  return e.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function et(e = "", t = "") {
  return $r(`${j(e, !1) && j(t, !1) ? `${e}-` : e}${t}`);
}
function Tn(e = "", t = "") {
  return `--${et(e, t)}`;
}
function wr(e = "") {
  let t = (e.match(/{/g) || []).length, n = (e.match(/}/g) || []).length;
  return (t + n) % 2 !== 0;
}
function Pn(e, t = "", n = "", o = [], r) {
  if (j(e)) {
    let s = e.trim();
    if (wr(s)) return;
    if (ie(s, $e)) {
      let l = s.replaceAll($e, (a) => {
        let i = a.replace(/{|}/g, "").split(".").filter((u) => !o.some((d) => ie(u, d)));
        return `var(${Tn(n, dn(i.join("-")))}${C(r) ? `, ${r}` : ""})`;
      });
      return ie(l.replace(wn, "0"), $n) ? `calc(${l})` : l;
    }
    return s;
  } else if (er(e)) return e;
}
function Tr(e, t, n) {
  j(t, !1) && e.push(`${t}:${n};`);
}
function fe(e, t) {
  return e ? `${e}{${t}}` : "";
}
function Cn(e, t) {
  if (e.indexOf("dt(") === -1) return e;
  function n(l, a) {
    let i = [], u = 0, d = "", c = null, m = 0;
    for (; u <= l.length; ) {
      let p = l[u];
      if ((p === '"' || p === "'" || p === "`") && l[u - 1] !== "\\" && (c = c === p ? null : p), !c && (p === "(" && m++, p === ")" && m--, (p === "," || u === l.length) && m === 0)) {
        let f = d.trim();
        f.startsWith("dt(") ? i.push(Cn(f, a)) : i.push(o(f)), d = "", u++;
        continue;
      }
      p !== void 0 && (d += p), u++;
    }
    return i;
  }
  function o(l) {
    let a = l[0];
    if ((a === '"' || a === "'" || a === "`") && l[l.length - 1] === a) return l.slice(1, -1);
    let i = Number(l);
    return isNaN(i) ? l : i;
  }
  let r = [], s = [];
  for (let l = 0; l < e.length; l++) if (e[l] === "d" && e.slice(l, l + 3) === "dt(") s.push(l), l += 2;
  else if (e[l] === ")" && s.length > 0) {
    let a = s.pop();
    s.length === 0 && r.push([a, l]);
  }
  if (!r.length) return e;
  for (let l = r.length - 1; l >= 0; l--) {
    let [a, i] = r[l], u = e.slice(a + 3, i), d = n(u, t), c = t(...d);
    e = e.slice(0, a) + c + e.slice(i + 1);
  }
  return e;
}
var Rs = (e) => {
  var t;
  let n = T.getTheme(), o = tt(n, e, void 0, "variable"), r = (t = o?.match(/--[\w-]+/g)) == null ? void 0 : t[0], s = tt(n, e, void 0, "value");
  return { name: r, variable: o, value: s };
}, se = (...e) => tt(T.getTheme(), ...e), tt = (e = {}, t, n, o) => {
  if (t) {
    let { variable: r, options: s } = T.defaults || {}, { prefix: l, transform: a } = e?.options || s || {}, i = ie(t, $e) ? t : `{${t}}`;
    return o === "value" || Le(o) && a === "strict" ? T.getTokenValue(t) : Pn(i, void 0, l, [r.excludedKeyRegex], n);
  }
  return "";
};
function Re(e, ...t) {
  if (e instanceof Array) {
    let n = e.reduce((o, r, s) => {
      var l;
      return o + r + ((l = N(t[s], { dt: se })) != null ? l : "");
    }, "");
    return Cn(n, se);
  }
  return N(e, { dt: se });
}
function Pr(e, t = {}) {
  let n = T.defaults.variable, { prefix: o = n.prefix, selector: r = n.selector, excludedKeyRegex: s = n.excludedKeyRegex } = t, l = [], a = [], i = [{ node: e, path: o }];
  for (; i.length; ) {
    let { node: d, path: c } = i.pop();
    for (let m in d) {
      let p = d[m], f = _r(p), v = ie(m, s) ? et(c) : et(c, dn(m));
      if (U(f)) i.push({ node: f, path: v });
      else {
        let g = Tn(v), y = Pn(f, v, o, [s]);
        Tr(a, g, y);
        let S = v;
        o && S.startsWith(o + "-") && (S = S.slice(o.length + 1)), l.push(S.replace(/-/g, "."));
      }
    }
  }
  let u = a.join("");
  return { value: a, tokens: l, declarations: u, css: fe(r, u) };
}
var V = { regex: { rules: { class: { pattern: /^\.([a-zA-Z][\w-]*)$/, resolve(e) {
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
    var o;
    return (o = t.map((r) => r.resolve(n)).find((r) => r.matched)) != null ? o : this.rules.custom.resolve(n);
  });
} }, _toVariables(e, t) {
  return Pr(e, { prefix: t?.prefix });
}, getCommon({ name: e = "", theme: t = {}, params: n, set: o, defaults: r }) {
  var s, l, a, i, u, d, c;
  let { preset: m, options: p } = t, f, v, g, y, S, P, h;
  if (C(m) && p.transform !== "strict") {
    let { primitive: _, semantic: k, extend: I } = m, F = k || {}, { colorScheme: K } = F, X = H(F, ["colorScheme"]), Y = I || {}, { colorScheme: ee } = Y, te = H(Y, ["colorScheme"]), q = K || {}, { dark: ne } = q, le = H(q, ["dark"]), oe = ee || {}, { dark: ue } = oe, de = H(oe, ["dark"]), z = C(_) ? this._toVariables({ primitive: _ }, p) : {}, M = C(X) ? this._toVariables({ semantic: X }, p) : {}, re = C(le) ? this._toVariables({ light: le }, p) : {}, je = C(ne) ? this._toVariables({ dark: ne }, p) : {}, ce = C(te) ? this._toVariables({ semantic: te }, p) : {}, mt = C(de) ? this._toVariables({ light: de }, p) : {}, pt = C(ue) ? this._toVariables({ dark: ue }, p) : {}, [In, Rn] = [(s = z.declarations) != null ? s : "", z.tokens], [Vn, Dn] = [(l = M.declarations) != null ? l : "", M.tokens || []], [Mn, Bn] = [(a = re.declarations) != null ? a : "", re.tokens || []], [Wn, Un] = [(i = je.declarations) != null ? i : "", je.tokens || []], [zn, Hn] = [(u = ce.declarations) != null ? u : "", ce.tokens || []], [Fn, Kn] = [(d = mt.declarations) != null ? d : "", mt.tokens || []], [Yn, qn] = [(c = pt.declarations) != null ? c : "", pt.tokens || []];
    f = this.transformCSS(e, In, "light", "variable", p, o, r), v = Rn;
    let Gn = this.transformCSS(e, `${Vn}${Mn}`, "light", "variable", p, o, r), Jn = this.transformCSS(e, `${Wn}`, "dark", "variable", p, o, r);
    g = `${Gn}${Jn}`, y = [.../* @__PURE__ */ new Set([...Dn, ...Bn, ...Un])];
    let Qn = this.transformCSS(e, `${zn}${Fn}color-scheme:light`, "light", "variable", p, o, r), Zn = this.transformCSS(e, `${Yn}color-scheme:dark`, "dark", "variable", p, o, r);
    S = `${Qn}${Zn}`, P = [.../* @__PURE__ */ new Set([...Hn, ...Kn, ...qn])], h = N(m.css, { dt: se });
  }
  return { primitive: { css: f, tokens: v }, semantic: { css: g, tokens: y }, global: { css: S, tokens: P }, style: h };
}, getPreset({ name: e = "", preset: t = {}, options: n, params: o, set: r, defaults: s, selector: l }) {
  var a, i, u;
  let d, c, m;
  if (C(t) && n.transform !== "strict") {
    let p = e.replace("-directive", ""), f = t, { colorScheme: v, extend: g, css: y } = f, S = H(f, ["colorScheme", "extend", "css"]), P = g || {}, { colorScheme: h } = P, _ = H(P, ["colorScheme"]), k = v || {}, { dark: I } = k, F = H(k, ["dark"]), K = h || {}, { dark: X } = K, Y = H(K, ["dark"]), ee = C(S) ? this._toVariables({ [p]: D(D({}, S), _) }, n) : {}, te = C(F) ? this._toVariables({ [p]: D(D({}, F), Y) }, n) : {}, q = C(I) ? this._toVariables({ [p]: D(D({}, I), X) }, n) : {}, [ne, le] = [(a = ee.declarations) != null ? a : "", ee.tokens || []], [oe, ue] = [(i = te.declarations) != null ? i : "", te.tokens || []], [de, z] = [(u = q.declarations) != null ? u : "", q.tokens || []], M = this.transformCSS(p, `${ne}${oe}`, "light", "variable", n, r, s, l), re = this.transformCSS(p, de, "dark", "variable", n, r, s, l);
    d = `${M}${re}`, c = [.../* @__PURE__ */ new Set([...le, ...ue, ...z])], m = N(y, { dt: se });
  }
  return { css: d, tokens: c, style: m };
}, getPresetC({ name: e = "", theme: t = {}, params: n, set: o, defaults: r }) {
  var s;
  let { preset: l, options: a } = t, i = (s = l?.components) == null ? void 0 : s[e];
  return this.getPreset({ name: e, preset: i, options: a, params: n, set: o, defaults: r });
}, getPresetD({ name: e = "", theme: t = {}, params: n, set: o, defaults: r }) {
  var s, l;
  let a = e.replace("-directive", ""), { preset: i, options: u } = t, d = ((s = i?.components) == null ? void 0 : s[a]) || ((l = i?.directives) == null ? void 0 : l[a]);
  return this.getPreset({ name: a, preset: d, options: u, params: n, set: o, defaults: r });
}, applyDarkColorScheme(e) {
  return !(e.darkModeSelector === "none" || e.darkModeSelector === !1);
}, getColorSchemeOption(e, t) {
  var n;
  return this.applyDarkColorScheme(e) ? this.regex.resolve(e.darkModeSelector === !0 ? t.options.darkModeSelector : (n = e.darkModeSelector) != null ? n : t.options.darkModeSelector) : [];
}, getLayerOrder(e, t = {}, n, o) {
  let { cssLayer: r } = t;
  return r ? `@layer ${N(r.order || r.name || "primeui", n)}` : "";
}, getCommonStyleSheet({ name: e = "", theme: t = {}, params: n, props: o = {}, set: r, defaults: s }) {
  let l = this.getCommon({ name: e, theme: t, params: n, set: r, defaults: s }), a = Object.entries(o).reduce((i, [u, d]) => i.push(`${u}="${d}"`) && i, []).join(" ");
  return Object.entries(l || {}).reduce((i, [u, d]) => {
    if (U(d) && Object.hasOwn(d, "css")) {
      let c = Se(d.css), m = `${u}-variables`;
      i.push(`<style type="text/css" data-primevue-style-id="${m}" ${a}>${c}</style>`);
    }
    return i;
  }, []).join("");
}, getStyleSheet({ name: e = "", theme: t = {}, params: n, props: o = {}, set: r, defaults: s }) {
  var l;
  let a = { name: e, theme: t, params: n, set: r, defaults: s }, i = (l = e.includes("-directive") ? this.getPresetD(a) : this.getPresetC(a)) == null ? void 0 : l.css, u = Object.entries(o).reduce((d, [c, m]) => d.push(`${c}="${m}"`) && d, []).join(" ");
  return i ? `<style type="text/css" data-primevue-style-id="${e}-variables" ${u}>${Se(i)}</style>` : "";
}, createTokens(e = {}, t, n = "", o = "", r = {}) {
  let s = function(a, i = {}, u = []) {
    if (u.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: a, path: this.path, paths: i, value: void 0 };
    u.push(this.path), i.name = this.path, i.binding || (i.binding = {});
    let d = this.value;
    if (typeof this.value == "string" && $e.test(this.value)) {
      let c = this.value.trim().replace($e, (m) => {
        var p;
        let f = m.slice(1, -1), v = this.tokens[f];
        if (!v) return console.warn(`Token not found for path: ${f}`), "__UNRESOLVED__";
        let g = v.computed(a, i, u);
        return Array.isArray(g) && g.length === 2 ? `light-dark(${g[0].value},${g[1].value})` : (p = g?.value) != null ? p : "__UNRESOLVED__";
      });
      d = $n.test(c.replace(wn, "0")) ? `calc(${c})` : c;
    }
    return Le(i.binding) && delete i.binding, u.pop(), { colorScheme: a, path: this.path, paths: i, value: d.includes("__UNRESOLVED__") ? void 0 : d };
  }, l = (a, i, u) => {
    Object.entries(a).forEach(([d, c]) => {
      let m = ie(d, t.variable.excludedKeyRegex) ? i : i ? `${i}.${wt(d)}` : wt(d), p = u ? `${u}.${d}` : d;
      U(c) ? l(c, m, p) : (r[m] || (r[m] = { paths: [], computed: (f, v = {}, g = []) => {
        if (r[m].paths.length === 1) return r[m].paths[0].computed(r[m].paths[0].scheme, v.binding, g);
        if (f && f !== "none") for (let y = 0; y < r[m].paths.length; y++) {
          let S = r[m].paths[y];
          if (S.scheme === f) return S.computed(f, v.binding, g);
        }
        return r[m].paths.map((y) => y.computed(y.scheme, v[y.scheme], g));
      } }), r[m].paths.push({ path: p, value: c, scheme: p.includes("colorScheme.light") ? "light" : p.includes("colorScheme.dark") ? "dark" : "none", computed: s, tokens: r }));
    });
  };
  return l(e, n, o), r;
}, getTokenValue(e, t, n) {
  var o;
  let r = ((a) => a.split(".").filter((i) => !ie(i.toLowerCase(), n.variable.excludedKeyRegex)).join("."))(t), s = t.includes("colorScheme.light") ? "light" : t.includes("colorScheme.dark") ? "dark" : void 0, l = [(o = e[r]) == null ? void 0 : o.computed(s)].flat().filter((a) => a);
  return l.length === 1 ? l[0].value : l.reduce((a = {}, i) => {
    let u = i, { colorScheme: d } = u, c = H(u, ["colorScheme"]);
    return a[d] = c, a;
  }, void 0);
}, getSelectorRule(e, t, n, o) {
  return n === "class" || n === "attr" ? fe(C(t) ? `${e}${t},${e} ${t}` : e, o) : fe(e, fe(t ?? ":root,:host", o));
}, transformCSS(e, t, n, o, r = {}, s, l, a) {
  if (C(t)) {
    let { cssLayer: i } = r;
    if (o !== "style") {
      let u = this.getColorSchemeOption(r, l);
      t = n === "dark" ? u.reduce((d, { type: c, selector: m }) => (C(m) && (d += m.includes("[CSS]") ? m.replace("[CSS]", t) : this.getSelectorRule(m, a, c, t)), d), "") : fe(a ?? ":root,:host", t);
    }
    if (i) {
      let u = { name: "primeui" };
      U(i) && (u.name = N(i.name, { name: e, type: o })), C(u.name) && (t = fe(`@layer ${u.name}`, t), s?.layerNames(u.name));
    }
    return t;
  }
  return "";
} }, T = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(e = {}) {
  let { theme: t } = e;
  t && (this._theme = Ke(D({}, t), { options: D(D({}, this.defaults.options), t.options) }), this._tokens = V.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
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
  this.update({ theme: e }), E.emit("theme:change", e);
}, getPreset() {
  return this.preset;
}, setPreset(e) {
  this._theme = Ke(D({}, this.theme), { preset: e }), this._tokens = V.createTokens(e, this.defaults), this.clearLoadedStyleNames(), E.emit("preset:change", e), E.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(e) {
  this._theme = Ke(D({}, this.theme), { options: e }), this.clearLoadedStyleNames(), E.emit("options:change", e), E.emit("theme:change", this.theme);
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
  return V.getTokenValue(this.tokens, e, this.defaults);
}, getCommon(e = "", t) {
  return V.getCommon({ name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getComponent(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return V.getPresetC(n);
}, getDirective(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return V.getPresetD(n);
}, getCustomPreset(e = "", t, n, o) {
  let r = { name: e, preset: t, options: this.options, selector: n, params: o, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return V.getPreset(r);
}, getLayerOrderCSS(e = "") {
  return V.getLayerOrder(e, this.options, { names: this.getLayerNames() }, this.defaults);
}, transformCSS(e = "", t, n = "style", o) {
  return V.transformCSS(e, t, o, n, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
}, getCommonStyleSheet(e = "", t, n = {}) {
  return V.getCommonStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getStyleSheet(e, t, n = {}) {
  return V.getStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, onStyleMounted(e) {
  this._loadingStyles.add(e);
}, onStyleUpdated(e) {
  this._loadingStyles.add(e);
}, onStyleLoaded(e, { name: t }) {
  this._loadingStyles.size && (this._loadingStyles.delete(t), E.emit(`theme:${t}:load`, e), !this._loadingStyles.size && E.emit("theme:load"));
} }, A = {
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
};
function Tt(e, t) {
  var n = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (!n) {
    if (Array.isArray(e) || (n = Cr(e)) || t) {
      n && (e = n);
      var o = 0, r = function() {
      };
      return { s: r, n: function() {
        return o >= e.length ? { done: !0 } : { done: !1, value: e[o++] };
      }, e: function(u) {
        throw u;
      }, f: r };
    }
    throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }
  var s, l = !0, a = !1;
  return { s: function() {
    n = n.call(e);
  }, n: function() {
    var u = n.next();
    return l = u.done, u;
  }, e: function(u) {
    a = !0, s = u;
  }, f: function() {
    try {
      l || n.return == null || n.return();
    } finally {
      if (a) throw s;
    }
  } };
}
function Cr(e, t) {
  if (e) {
    if (typeof e == "string") return Pt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Pt(e, t) : void 0;
  }
}
function Pt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
var Vs = {
  filter: function(t, n, o, r, s) {
    var l = [];
    if (!t)
      return l;
    var a = Tt(t), i;
    try {
      for (a.s(); !(i = a.n()).done; ) {
        var u = i.value;
        if (typeof u == "string") {
          if (this.filters[r](u, o, s)) {
            l.push(u);
            continue;
          }
        } else {
          var d = Tt(n), c;
          try {
            for (d.s(); !(c = d.n()).done; ) {
              var m = c.value, p = Je(u, m);
              if (this.filters[r](p, o, s)) {
                l.push(u);
                break;
              }
            }
          } catch (f) {
            d.e(f);
          } finally {
            d.f();
          }
        }
      }
    } catch (f) {
      a.e(f);
    } finally {
      a.f();
    }
    return l;
  },
  filters: {
    startsWith: function(t, n, o) {
      if (n == null || n === "")
        return !0;
      if (t == null)
        return !1;
      var r = R(n.toString()).toLocaleLowerCase(o), s = R(t.toString()).toLocaleLowerCase(o);
      return s.slice(0, r.length) === r;
    },
    contains: function(t, n, o) {
      if (n == null || n === "")
        return !0;
      if (t == null)
        return !1;
      var r = R(n.toString()).toLocaleLowerCase(o), s = R(t.toString()).toLocaleLowerCase(o);
      return s.indexOf(r) !== -1;
    },
    notContains: function(t, n, o) {
      if (n == null || n === "")
        return !0;
      if (t == null)
        return !1;
      var r = R(n.toString()).toLocaleLowerCase(o), s = R(t.toString()).toLocaleLowerCase(o);
      return s.indexOf(r) === -1;
    },
    endsWith: function(t, n, o) {
      if (n == null || n === "")
        return !0;
      if (t == null)
        return !1;
      var r = R(n.toString()).toLocaleLowerCase(o), s = R(t.toString()).toLocaleLowerCase(o);
      return s.indexOf(r, s.length - r.length) !== -1;
    },
    equals: function(t, n, o) {
      return n == null || n === "" ? !0 : t == null ? !1 : t.getTime && n.getTime ? t.getTime() === n.getTime() : R(t.toString()).toLocaleLowerCase(o) == R(n.toString()).toLocaleLowerCase(o);
    },
    notEquals: function(t, n, o) {
      return n == null || n === "" ? !1 : t == null ? !0 : t.getTime && n.getTime ? t.getTime() !== n.getTime() : R(t.toString()).toLocaleLowerCase(o) != R(n.toString()).toLocaleLowerCase(o);
    },
    in: function(t, n) {
      if (n == null || n.length === 0)
        return !0;
      for (var o = 0; o < n.length; o++)
        if (Zo(t, n[o]))
          return !0;
      return !1;
    },
    between: function(t, n) {
      return n == null || n[0] == null || n[1] == null ? !0 : t == null ? !1 : t.getTime ? n[0].getTime() <= t.getTime() && t.getTime() <= n[1].getTime() : n[0] <= t && t <= n[1];
    },
    lt: function(t, n) {
      return n == null ? !0 : t == null ? !1 : t.getTime && n.getTime ? t.getTime() < n.getTime() : t < n;
    },
    lte: function(t, n) {
      return n == null ? !0 : t == null ? !1 : t.getTime && n.getTime ? t.getTime() <= n.getTime() : t <= n;
    },
    gt: function(t, n) {
      return n == null ? !0 : t == null ? !1 : t.getTime && n.getTime ? t.getTime() > n.getTime() : t > n;
    },
    gte: function(t, n) {
      return n == null ? !0 : t == null ? !1 : t.getTime && n.getTime ? t.getTime() >= n.getTime() : t >= n;
    },
    dateIs: function(t, n) {
      return n == null ? !0 : t == null ? !1 : (typeof t == "string" && (t = new Date(t)), typeof n == "string" && (n = new Date(n)), t.toDateString() === n.toDateString());
    },
    dateIsNot: function(t, n) {
      return n == null ? !0 : t == null ? !1 : (typeof t == "string" && (t = new Date(t)), typeof n == "string" && (n = new Date(n)), t.toDateString() !== n.toDateString());
    },
    dateBefore: function(t, n) {
      return n == null ? !0 : t == null ? !1 : (typeof t == "string" && (t = new Date(t)), typeof n == "string" && (n = new Date(n)), t.getTime() < n.getTime());
    },
    dateAfter: function(t, n) {
      return n == null ? !0 : t == null ? !1 : (typeof t == "string" && (t = new Date(t)), typeof n == "string" && (n = new Date(n)), t.getTime() > n.getTime());
    }
  },
  register: function(t, n) {
    this.filters[t] = n;
  }
}, Or = `
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
function we(e) {
  "@babel/helpers - typeof";
  return we = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, we(e);
}
function Ct(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function Ot(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Ct(Object(n), !0).forEach(function(o) {
      xr(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Ct(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function xr(e, t, n) {
  return (t = kr(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function kr(e) {
  var t = Er(e, "string");
  return we(t) == "symbol" ? t : t + "";
}
function Er(e, t) {
  if (we(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (we(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function Ar(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  ft() && ft().components ? Xt(e) : t ? e() : no(e);
}
var Lr = 0;
function jr(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = J(!1), o = J(e), r = J(null), s = bn() ? window.document : void 0, l = t.document, a = l === void 0 ? s : l, i = t.immediate, u = i === void 0 ? !0 : i, d = t.manual, c = d === void 0 ? !1 : d, m = t.name, p = m === void 0 ? "style_".concat(++Lr) : m, f = t.id, v = f === void 0 ? void 0 : f, g = t.media, y = g === void 0 ? void 0 : g, S = t.nonce, P = S === void 0 ? void 0 : S, h = t.first, _ = h === void 0 ? !1 : h, k = t.onMounted, I = k === void 0 ? void 0 : k, F = t.onUpdated, K = F === void 0 ? void 0 : F, X = t.onLoad, Y = X === void 0 ? void 0 : X, ee = t.props, te = ee === void 0 ? {} : ee, q = function() {
  }, ne = function(ue) {
    var de = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (a) {
      var z = Ot(Ot({}, te), de), M = z.name || p, re = z.id || v, je = z.nonce || P;
      r.value = a.querySelector('style[data-primevue-style-id="'.concat(M, '"]')) || a.getElementById(re) || a.createElement("style"), r.value.isConnected || (o.value = ue || e, Be(r.value, {
        type: "text/css",
        id: re,
        media: y,
        nonce: je
      }), _ ? a.head.prepend(r.value) : a.head.appendChild(r.value), hr(r.value, "data-primevue-style-id", M), Be(r.value, z), r.value.onload = function(ce) {
        return Y?.(ce, {
          name: M
        });
      }, I?.(M)), !n.value && (q = he(o, function(ce) {
        r.value.textContent = ce, K?.(M);
      }, {
        immediate: !0
      }), n.value = !0);
    }
  }, le = function() {
    !a || !n.value || (q(), ur(r.value) && a.head.removeChild(r.value), n.value = !1, r.value = null);
  };
  return u && !c && Ar(ne), {
    id: v,
    name: p,
    el: r,
    css: o,
    unload: le,
    load: ne,
    isLoaded: to(n)
  };
}
function Te(e) {
  "@babel/helpers - typeof";
  return Te = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Te(e);
}
var xt, kt, Et, At;
function Lt(e, t) {
  return Vr(e) || Rr(e, t) || Ir(e, t) || Nr();
}
function Nr() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ir(e, t) {
  if (e) {
    if (typeof e == "string") return jt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? jt(e, t) : void 0;
  }
}
function jt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function Rr(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var o, r, s, l, a = [], i = !0, u = !1;
    try {
      if (s = (n = n.call(e)).next, t !== 0) for (; !(i = (o = s.call(n)).done) && (a.push(o.value), a.length !== t); i = !0) ;
    } catch (d) {
      u = !0, r = d;
    } finally {
      try {
        if (!i && n.return != null && (l = n.return(), Object(l) !== l)) return;
      } finally {
        if (u) throw r;
      }
    }
    return a;
  }
}
function Vr(e) {
  if (Array.isArray(e)) return e;
}
function Nt(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function Ye(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Nt(Object(n), !0).forEach(function(o) {
      Dr(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Nt(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function Dr(e, t, n) {
  return (t = Mr(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Mr(e) {
  var t = Br(e, "string");
  return Te(t) == "symbol" ? t : t + "";
}
function Br(e, t) {
  if (Te(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (Te(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function Ve(e, t) {
  return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var Wr = function(t) {
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
}, Ur = {}, zr = {}, O = {
  name: "base",
  css: Wr,
  style: Or,
  classes: Ur,
  inlineStyles: zr,
  load: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(s) {
      return s;
    }, r = o(Re(xt || (xt = Ve(["", ""])), t));
    return C(r) ? jr(Se(r), Ye({
      name: this.name
    }, n)) : {};
  },
  loadCSS: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    return this.load(this.css, t);
  },
  loadStyle: function() {
    var t = this, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
    return this.load(this.style, n, function() {
      var r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
      return T.transformCSS(n.name || t.name, "".concat(r).concat(Re(kt || (kt = Ve(["", ""])), o)));
    });
  },
  getCommonTheme: function(t) {
    return T.getCommon(this.name, t);
  },
  getComponentTheme: function(t) {
    return T.getComponent(this.name, t);
  },
  getDirectiveTheme: function(t) {
    return T.getDirective(this.name, t);
  },
  getPresetTheme: function(t, n, o) {
    return T.getCustomPreset(this.name, t, n, o);
  },
  getLayerOrderThemeCSS: function() {
    return T.getLayerOrderCSS(this.name);
  },
  getStyleSheet: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.css) {
      var o = N(this.css, {
        dt: se
      }) || "", r = Se(Re(Et || (Et = Ve(["", "", ""])), o, t)), s = Object.entries(n).reduce(function(l, a) {
        var i = Lt(a, 2), u = i[0], d = i[1];
        return l.push("".concat(u, '="').concat(d, '"')) && l;
      }, []).join(" ");
      return C(r) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(s, ">").concat(r, "</style>") : "";
    }
    return "";
  },
  getCommonThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return T.getCommonStyleSheet(this.name, t, n);
  },
  getThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = [T.getStyleSheet(this.name, t, n)];
    if (this.style) {
      var r = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), s = Re(At || (At = Ve(["", ""])), N(this.style, {
        dt: se
      })), l = Se(T.transformCSS(r, s)), a = Object.entries(n).reduce(function(i, u) {
        var d = Lt(u, 2), c = d[0], m = d[1];
        return i.push("".concat(c, '="').concat(m, '"')) && i;
      }, []).join(" ");
      C(l) && o.push('<style type="text/css" data-primevue-style-id="'.concat(r, '" ').concat(a, ">").concat(l, "</style>"));
    }
    return o.join("");
  },
  extend: function(t) {
    return Ye(Ye({}, this), {}, {
      css: void 0,
      style: void 0
    }, t);
  }
}, Z = cn();
function Pe(e) {
  "@babel/helpers - typeof";
  return Pe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Pe(e);
}
function It(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function De(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? It(Object(n), !0).forEach(function(o) {
      Hr(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : It(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function Hr(e, t, n) {
  return (t = Fr(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Fr(e) {
  var t = Kr(e, "string");
  return Pe(t) == "symbol" ? t : t + "";
}
function Kr(e, t) {
  if (Pe(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (Pe(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Yr = {
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
    text: [A.STARTS_WITH, A.CONTAINS, A.NOT_CONTAINS, A.ENDS_WITH, A.EQUALS, A.NOT_EQUALS],
    numeric: [A.EQUALS, A.NOT_EQUALS, A.LESS_THAN, A.LESS_THAN_OR_EQUAL_TO, A.GREATER_THAN, A.GREATER_THAN_OR_EQUAL_TO],
    date: [A.DATE_IS, A.DATE_IS_NOT, A.DATE_BEFORE, A.DATE_AFTER]
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
}, qr = Symbol();
function Gr(e, t) {
  var n = {
    config: oo(t)
  };
  return e.config.globalProperties.$primevue = n, e.provide(qr, n), Jr(), Qr(e, n), n;
}
var ge = [];
function Jr() {
  E.clear(), ge.forEach(function(e) {
    return e?.();
  }), ge = [];
}
function Qr(e, t) {
  var n = J(!1), o = function() {
    var u;
    if (((u = t.config) === null || u === void 0 ? void 0 : u.theme) !== "none" && !T.isStyleNameLoaded("common")) {
      var d, c, m = ((d = O.getCommonTheme) === null || d === void 0 ? void 0 : d.call(O)) || {}, p = m.primitive, f = m.semantic, v = m.global, g = m.style, y = {
        nonce: (c = t.config) === null || c === void 0 || (c = c.csp) === null || c === void 0 ? void 0 : c.nonce
      };
      O.load(p?.css, De({
        name: "primitive-variables"
      }, y)), O.load(f?.css, De({
        name: "semantic-variables"
      }, y)), O.load(v?.css, De({
        name: "global-variables"
      }, y)), O.loadStyle(De({
        name: "global-style"
      }, y), g), T.setLoadedStyleName("common");
    }
  };
  E.on("theme:change", function(i) {
    n.value || (e.config.globalProperties.$primevue.config.theme = i, n.value = !0);
  });
  var r = he(t.config, function(i, u) {
    Z.emit("config:change", {
      newValue: i,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), s = he(function() {
    return t.config.ripple;
  }, function(i, u) {
    Z.emit("config:ripple:change", {
      newValue: i,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), l = he(function() {
    return t.config.theme;
  }, function(i, u) {
    n.value || T.setTheme(i), t.config.unstyled || o(), n.value = !1, Z.emit("config:theme:change", {
      newValue: i,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !1
  }), a = he(function() {
    return t.config.unstyled;
  }, function(i, u) {
    !i && t.config.theme && o(), Z.emit("config:unstyled:change", {
      newValue: i,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  });
  ge.push(r), ge.push(s), ge.push(l), ge.push(a);
}
var Zr = {
  install: function(t, n) {
    var o = tr(Yr, n);
    Gr(t, o);
  }
}, On = {
  name: "Portal",
  props: {
    appendTo: {
      type: [String, Object],
      default: "body"
    },
    disabled: {
      type: Boolean,
      default: !1
    }
  },
  data: function() {
    return {
      mounted: !1
    };
  },
  mounted: function() {
    this.mounted = bn();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function Xr(e, t, n, o, r, s) {
  return s.inline ? Q(e.$slots, "default", {
    key: 0
  }) : r.mounted ? (B(), Me(en, {
    key: 1,
    to: n.appendTo
  }, [Q(e.$slots, "default")], 8, ["to"])) : be("", !0);
}
On.render = Xr;
var G = {
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
function ei() {
  var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pc", t = ro();
  return "".concat(e).concat(t.replace("v-", "").replaceAll("-", "_"));
}
var Rt = O.extend({
  name: "common"
});
function Ce(e) {
  "@babel/helpers - typeof";
  return Ce = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ce(e);
}
function ti(e) {
  return En(e) || ni(e) || kn(e) || xn();
}
function ni(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function ve(e, t) {
  return En(e) || oi(e, t) || kn(e, t) || xn();
}
function xn() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function kn(e, t) {
  if (e) {
    if (typeof e == "string") return nt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? nt(e, t) : void 0;
  }
}
function nt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function oi(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var o, r, s, l, a = [], i = !0, u = !1;
    try {
      if (s = (n = n.call(e)).next, t === 0) {
        if (Object(n) !== n) return;
        i = !1;
      } else for (; !(i = (o = s.call(n)).done) && (a.push(o.value), a.length !== t); i = !0) ;
    } catch (d) {
      u = !0, r = d;
    } finally {
      try {
        if (!i && n.return != null && (l = n.return(), Object(l) !== l)) return;
      } finally {
        if (u) throw r;
      }
    }
    return a;
  }
}
function En(e) {
  if (Array.isArray(e)) return e;
}
function Vt(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function $(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Vt(Object(n), !0).forEach(function(o) {
      ye(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Vt(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function ye(e, t, n) {
  return (t = ri(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ri(e) {
  var t = ii(e, "string");
  return Ce(t) == "symbol" ? t : t + "";
}
function ii(e, t) {
  if (Ce(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (Ce(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var An = {
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
        E.off("theme:change", this._loadCoreStyles), t || (this._loadCoreStyles(), this._themeChangeListener(this._loadCoreStyles));
      }
    },
    dt: {
      immediate: !0,
      handler: function(t, n) {
        var o = this;
        E.off("theme:change", this._themeScopedListener), t ? (this._loadScopedThemeStyles(t), this._themeScopedListener = function() {
          return o._loadScopedThemeStyles(t);
        }, this._themeChangeListener(this._themeScopedListener)) : this._unloadScopedThemeStyles();
      }
    }
  },
  scopedStyleEl: void 0,
  rootEl: void 0,
  uid: void 0,
  $attrSelector: void 0,
  beforeCreate: function() {
    var t, n, o, r, s, l, a, i, u, d, c, m = (t = this.pt) === null || t === void 0 ? void 0 : t._usept, p = m ? (n = this.pt) === null || n === void 0 || (n = n.originalValue) === null || n === void 0 ? void 0 : n[this.$.type.name] : void 0, f = m ? (o = this.pt) === null || o === void 0 || (o = o.value) === null || o === void 0 ? void 0 : o[this.$.type.name] : this.pt;
    (r = f || p) === null || r === void 0 || (r = r.hooks) === null || r === void 0 || (s = r.onBeforeCreate) === null || s === void 0 || s.call(r);
    var v = (l = this.$primevueConfig) === null || l === void 0 || (l = l.pt) === null || l === void 0 ? void 0 : l._usept, g = v ? (a = this.$primevue) === null || a === void 0 || (a = a.config) === null || a === void 0 || (a = a.pt) === null || a === void 0 ? void 0 : a.originalValue : void 0, y = v ? (i = this.$primevue) === null || i === void 0 || (i = i.config) === null || i === void 0 || (i = i.pt) === null || i === void 0 ? void 0 : i.value : (u = this.$primevue) === null || u === void 0 || (u = u.config) === null || u === void 0 ? void 0 : u.pt;
    (d = y || g) === null || d === void 0 || (d = d[this.$.type.name]) === null || d === void 0 || (d = d.hooks) === null || d === void 0 || (c = d.onBeforeCreate) === null || c === void 0 || c.call(d), this.$attrSelector = ei(), this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
  },
  created: function() {
    this._hook("onCreated");
  },
  beforeMount: function() {
    var t;
    this.rootEl = gn(ae(this.$el) ? this.$el : (t = this.$el) === null || t === void 0 ? void 0 : t.parentElement, "[".concat(this.$attrSelector, "]")), this.rootEl && (this.rootEl.$pc = $({
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
        var n = this._usePT(this._getPT(this.pt, this.$.type.name), this._getOptionValue, "hooks.".concat(t)), o = this._useDefaultPT(this._getOptionValue, "hooks.".concat(t));
        n?.(), o?.();
      }
    },
    _mergeProps: function(t) {
      for (var n = arguments.length, o = new Array(n > 1 ? n - 1 : 0), r = 1; r < n; r++)
        o[r - 1] = arguments[r];
      return He(t) ? t.apply(void 0, o) : L.apply(void 0, o);
    },
    _load: function() {
      G.isStyleNameLoaded("base") || (O.loadCSS(this.$styleOptions), this._loadGlobalStyles(), G.setLoadedStyleName("base")), this._loadThemeStyles();
    },
    _loadStyles: function() {
      this._load(), this._themeChangeListener(this._load);
    },
    _loadCoreStyles: function() {
      var t, n;
      !G.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name && (Rt.loadCSS(this.$styleOptions), this.$options.style && this.$style.loadCSS(this.$styleOptions), G.setLoadedStyleName(this.$style.name));
    },
    _loadGlobalStyles: function() {
      var t = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
      C(t) && O.load(t, $({
        name: "global"
      }, this.$styleOptions));
    },
    _loadThemeStyles: function() {
      var t, n;
      if (!(this.isUnstyled || this.$theme === "none")) {
        if (!T.isStyleNameLoaded("common")) {
          var o, r, s = ((o = this.$style) === null || o === void 0 || (r = o.getCommonTheme) === null || r === void 0 ? void 0 : r.call(o)) || {}, l = s.primitive, a = s.semantic, i = s.global, u = s.style;
          O.load(l?.css, $({
            name: "primitive-variables"
          }, this.$styleOptions)), O.load(a?.css, $({
            name: "semantic-variables"
          }, this.$styleOptions)), O.load(i?.css, $({
            name: "global-variables"
          }, this.$styleOptions)), O.loadStyle($({
            name: "global-style"
          }, this.$styleOptions), u), T.setLoadedStyleName("common");
        }
        if (!T.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name) {
          var d, c, m, p, f = ((d = this.$style) === null || d === void 0 || (c = d.getComponentTheme) === null || c === void 0 ? void 0 : c.call(d)) || {}, v = f.css, g = f.style;
          (m = this.$style) === null || m === void 0 || m.load(v, $({
            name: "".concat(this.$style.name, "-variables")
          }, this.$styleOptions)), (p = this.$style) === null || p === void 0 || p.loadStyle($({
            name: "".concat(this.$style.name, "-style")
          }, this.$styleOptions), g), T.setLoadedStyleName(this.$style.name);
        }
        if (!T.isStyleNameLoaded("layer-order")) {
          var y, S, P = (y = this.$style) === null || y === void 0 || (S = y.getLayerOrderThemeCSS) === null || S === void 0 ? void 0 : S.call(y);
          O.load(P, $({
            name: "layer-order",
            first: !0
          }, this.$styleOptions)), T.setLoadedStyleName("layer-order");
        }
      }
    },
    _loadScopedThemeStyles: function(t) {
      var n, o, r, s = ((n = this.$style) === null || n === void 0 || (o = n.getPresetTheme) === null || o === void 0 ? void 0 : o.call(n, t, "[".concat(this.$attrSelector, "]"))) || {}, l = s.css, a = (r = this.$style) === null || r === void 0 ? void 0 : r.load(l, $({
        name: "".concat(this.$attrSelector, "-").concat(this.$style.name)
      }, this.$styleOptions));
      this.scopedStyleEl = a.el;
    },
    _unloadScopedThemeStyles: function() {
      var t;
      (t = this.scopedStyleEl) === null || t === void 0 || (t = t.value) === null || t === void 0 || t.remove();
    },
    _themeChangeListener: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
      };
      G.clearLoadedStyleNames(), E.on("theme:change", t);
    },
    _removeThemeListeners: function() {
      E.off("theme:change", this._loadCoreStyles), E.off("theme:change", this._load), E.off("theme:change", this._themeScopedListener);
    },
    _getHostInstance: function(t) {
      return t ? this.$options.hostName ? t.$.type.name === this.$options.hostName ? t : this._getHostInstance(t.$parentInstance) : t.$parentInstance : void 0;
    },
    _getPropValue: function(t) {
      var n;
      return this[t] || ((n = this._getHostInstance(this)) === null || n === void 0 ? void 0 : n[t]);
    },
    _getOptionValue: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return ut(t, n, o);
    },
    _getPTValue: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, s = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, l = /./g.test(o) && !!r[o.split(".")[0]], a = this._getPropValue("ptOptions") || ((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.ptOptions) || {}, i = a.mergeSections, u = i === void 0 ? !0 : i, d = a.mergeProps, c = d === void 0 ? !1 : d, m = s ? l ? this._useGlobalPT(this._getPTClassValue, o, r) : this._useDefaultPT(this._getPTClassValue, o, r) : void 0, p = l ? void 0 : this._getPTSelf(n, this._getPTClassValue, o, $($({}, r), {}, {
        global: m || {}
      })), f = this._getPTDatasets(o);
      return u || !u && p ? c ? this._mergeProps(c, m, p, f) : $($($({}, m), p), f) : $($({}, p), f);
    },
    _getPTSelf: function() {
      for (var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length, o = new Array(n > 1 ? n - 1 : 0), r = 1; r < n; r++)
        o[r - 1] = arguments[r];
      return L(
        this._usePT.apply(this, [this._getPT(t, this.$name)].concat(o)),
        // Exp; <component :pt="{}"
        this._usePT.apply(this, [this.$_attrsPT].concat(o))
        // Exp; <component :pt:[passthrough_key]:[attribute]="{value}" or <component :pt:[passthrough_key]="() =>{value}"
      );
    },
    _getPTDatasets: function() {
      var t, n, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = "data-pc-", s = o === "root" && C((t = this.pt) === null || t === void 0 ? void 0 : t["data-pc-section"]);
      return o !== "transition" && $($({}, o === "root" && $($(ye({}, "".concat(r, "name"), W(s ? (n = this.pt) === null || n === void 0 ? void 0 : n["data-pc-section"] : this.$.type.name)), s && ye({}, "".concat(r, "extend"), W(this.$.type.name))), {}, ye({}, "".concat(this.$attrSelector), ""))), {}, ye({}, "".concat(r, "section"), W(o)));
    },
    _getPTClassValue: function() {
      var t = this._getOptionValue.apply(this, arguments);
      return j(t) || un(t) ? {
        class: t
      } : t;
    },
    _getPT: function(t) {
      var n = this, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 ? arguments[2] : void 0, s = function(a) {
        var i, u = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, d = r ? r(a) : a, c = W(o), m = W(n.$name);
        return (i = u ? c !== m ? d?.[c] : void 0 : d?.[c]) !== null && i !== void 0 ? i : d;
      };
      return t != null && t.hasOwnProperty("_usept") ? {
        _usept: t._usept,
        originalValue: s(t.originalValue),
        value: s(t.value)
      } : s(t, !0);
    },
    _usePT: function(t, n, o, r) {
      var s = function(v) {
        return n(v, o, r);
      };
      if (t != null && t.hasOwnProperty("_usept")) {
        var l, a = t._usept || ((l = this.$primevueConfig) === null || l === void 0 ? void 0 : l.ptOptions) || {}, i = a.mergeSections, u = i === void 0 ? !0 : i, d = a.mergeProps, c = d === void 0 ? !1 : d, m = s(t.originalValue), p = s(t.value);
        return m === void 0 && p === void 0 ? void 0 : j(p) ? p : j(m) ? m : u || !u && p ? c ? this._mergeProps(c, m, p) : $($({}, m), p) : p;
      }
      return s(t);
    },
    _useGlobalPT: function(t, n, o) {
      return this._usePT(this.globalPT, t, n, o);
    },
    _useDefaultPT: function(t, n, o) {
      return this._usePT(this.defaultPT, t, n, o);
    },
    ptm: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this._getPTValue(this.pt, t, $($({}, this.$params), n));
    },
    ptmi: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = L(this.$_attrsWithoutPT, this.ptm(n, o));
      return r?.hasOwnProperty("id") && ((t = r.id) !== null && t !== void 0 || (r.id = this.$id)), r;
    },
    ptmo: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return this._getPTValue(t, n, $({
        instance: this
      }, o), !1);
    },
    cx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this.isUnstyled ? void 0 : this._getOptionValue(this.$style.classes, t, $($({}, this.$params), n));
    },
    sx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      if (n) {
        var r = this._getOptionValue(this.$style.inlineStyles, t, $($({}, this.$params), o)), s = this._getOptionValue(Rt.inlineStyles, t, $($({}, this.$params), o));
        return [s, r];
      }
    }
  },
  computed: {
    globalPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(o) {
        return N(o, {
          instance: n
        });
      });
    },
    defaultPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(o) {
        return n._getOptionValue(o, n.$name, $({}, n.$params)) || N(o, $({}, n.$params));
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
      return Object.fromEntries(Object.entries(this.$props).filter(function(o) {
        var r = ve(o, 1), s = r[0];
        return n?.includes(s);
      }));
    },
    $theme: function() {
      var t;
      return (t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.theme;
    },
    $style: function() {
      return $($({
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
        var n = ve(t, 1), o = n[0];
        return o?.startsWith("pt:");
      }).reduce(function(t, n) {
        var o = ve(n, 2), r = o[0], s = o[1], l = r.split(":"), a = ti(l), i = nt(a).slice(1);
        return i?.reduce(function(u, d, c, m) {
          return !u[d] && (u[d] = c === m.length - 1 ? s : {}), u[d];
        }, t), t;
      }, {});
    },
    $_attrsWithoutPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(t) {
        var n = ve(t, 1), o = n[0];
        return !(o != null && o.startsWith("pt:"));
      }).reduce(function(t, n) {
        var o = ve(n, 2), r = o[0], s = o[1];
        return t[r] = s, t;
      }, {});
    }
  }
}, si = `
    .p-contextmenu {
        background: dt('contextmenu.background');
        color: dt('contextmenu.color');
        border: 1px solid dt('contextmenu.border.color');
        border-radius: dt('contextmenu.border.radius');
        box-shadow: dt('contextmenu.shadow');
        min-width: 12.5rem;
    }

    .p-contextmenu-root-list,
    .p-contextmenu-submenu {
        margin: 0;
        padding: dt('contextmenu.list.padding');
        list-style: none;
        outline: 0 none;
        display: flex;
        flex-direction: column;
        gap: dt('contextmenu.list.gap');
    }

    .p-contextmenu-submenu {
        position: absolute;
        display: flex;
        flex-direction: column;
        min-width: 100%;
        z-index: 1;
        background: dt('contextmenu.background');
        color: dt('contextmenu.color');
        border: 1px solid dt('contextmenu.border.color');
        border-radius: dt('contextmenu.border.radius');
        box-shadow: dt('contextmenu.shadow');
    }

    .p-contextmenu-item {
        position: relative;
    }

    .p-contextmenu-item-content {
        transition:
            background dt('contextmenu.transition.duration'),
            color dt('contextmenu.transition.duration');
        border-radius: dt('contextmenu.item.border.radius');
        color: dt('contextmenu.item.color');
    }

    .p-contextmenu-item-link {
        cursor: pointer;
        display: flex;
        align-items: center;
        text-decoration: none;
        overflow: hidden;
        position: relative;
        color: inherit;
        padding: dt('contextmenu.item.padding');
        gap: dt('contextmenu.item.gap');
        user-select: none;
    }

    .p-contextmenu-item-label {
        line-height: 1;
    }

    .p-contextmenu-item-icon {
        color: dt('contextmenu.item.icon.color');
    }

    .p-contextmenu-submenu-icon {
        color: dt('contextmenu.submenu.icon.color');
        margin-left: auto;
        font-size: dt('contextmenu.submenu.icon.size');
        width: dt('contextmenu.submenu.icon.size');
        height: dt('contextmenu.submenu.icon.size');
    }

    .p-contextmenu-submenu-icon:dir(rtl) {
        margin-left: 0;
        margin-right: auto;
    }

    .p-contextmenu-item.p-focus > .p-contextmenu-item-content {
        color: dt('contextmenu.item.focus.color');
        background: dt('contextmenu.item.focus.background');
    }

    .p-contextmenu-item.p-focus > .p-contextmenu-item-content .p-contextmenu-item-icon {
        color: dt('contextmenu.item.icon.focus.color');
    }

    .p-contextmenu-item.p-focus > .p-contextmenu-item-content .p-contextmenu-submenu-icon {
        color: dt('contextmenu.submenu.icon.focus.color');
    }

    .p-contextmenu-item:not(.p-disabled) > .p-contextmenu-item-content:hover {
        color: dt('contextmenu.item.focus.color');
        background: dt('contextmenu.item.focus.background');
    }

    .p-contextmenu-item:not(.p-disabled) > .p-contextmenu-item-content:hover .p-contextmenu-item-icon {
        color: dt('contextmenu.item.icon.focus.color');
    }

    .p-contextmenu-item:not(.p-disabled) > .p-contextmenu-item-content:hover .p-contextmenu-submenu-icon {
        color: dt('contextmenu.submenu.icon.focus.color');
    }

    .p-contextmenu-item-active > .p-contextmenu-item-content {
        color: dt('contextmenu.item.active.color');
        background: dt('contextmenu.item.active.background');
    }

    .p-contextmenu-item-active > .p-contextmenu-item-content .p-contextmenu-item-icon {
        color: dt('contextmenu.item.icon.active.color');
    }

    .p-contextmenu-item-active > .p-contextmenu-item-content .p-contextmenu-submenu-icon {
        color: dt('contextmenu.submenu.icon.active.color');
    }

    .p-contextmenu-separator {
        border-block-start: 1px solid dt('contextmenu.separator.border.color');
    }

    .p-contextmenu-mobile .p-contextmenu-submenu {
        position: static;
        box-shadow: none;
        border: 0 none;
        padding-inline-start: dt('tieredmenu.submenu.mobile.indent');
        padding-inline-end: 0;
    }

    .p-contextmenu-mobile .p-contextmenu-submenu-icon {
        transition: transform 0.2s;
        transform: rotate(90deg);
    }

    .p-contextmenu-mobile .p-contextmenu-item-active > .p-contextmenu-item-content .p-contextmenu-submenu-icon {
        transform: rotate(-90deg);
    }
`, ai = {
  root: function(t) {
    var n = t.instance;
    return ["p-contextmenu p-component", {
      "p-contextmenu-mobile": n.queryMatches
    }];
  },
  rootList: "p-contextmenu-root-list",
  item: function(t) {
    var n = t.instance, o = t.processedItem;
    return ["p-contextmenu-item", {
      "p-contextmenu-item-active": n.isItemActive(o),
      "p-focus": n.isItemFocused(o),
      "p-disabled": n.isItemDisabled(o)
    }];
  },
  itemContent: "p-contextmenu-item-content",
  itemLink: "p-contextmenu-item-link",
  itemIcon: "p-contextmenu-item-icon",
  itemLabel: "p-contextmenu-item-label",
  submenuIcon: "p-contextmenu-submenu-icon",
  submenu: "p-contextmenu-submenu",
  separator: "p-contextmenu-separator"
};
O.extend({
  name: "contextmenu",
  style: si,
  classes: ai
});
var li = `
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
`, ui = O.extend({
  name: "baseicon",
  css: li
});
function Oe(e) {
  "@babel/helpers - typeof";
  return Oe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Oe(e);
}
function Dt(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function Mt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Dt(Object(n), !0).forEach(function(o) {
      di(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Dt(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function di(e, t, n) {
  return (t = ci(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ci(e) {
  var t = mi(e, "string");
  return Oe(t) == "symbol" ? t : t + "";
}
function mi(e, t) {
  if (Oe(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (Oe(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var pi = {
  name: "BaseIcon",
  extends: An,
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
  style: ui,
  provide: function() {
    return {
      $pcIcon: this,
      $parentInstance: this
    };
  },
  methods: {
    pti: function() {
      var t = Le(this.label);
      return Mt(Mt({}, !this.isUnstyled && {
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
function xe(e) {
  "@babel/helpers - typeof";
  return xe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, xe(e);
}
function Bt(e, t) {
  return vi(e) || gi(e, t) || hi(e, t) || fi();
}
function fi() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function hi(e, t) {
  if (e) {
    if (typeof e == "string") return Wt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Wt(e, t) : void 0;
  }
}
function Wt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function gi(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var o, r, s, l, a = [], i = !0, u = !1;
    try {
      if (s = (n = n.call(e)).next, t !== 0) for (; !(i = (o = s.call(n)).done) && (a.push(o.value), a.length !== t); i = !0) ;
    } catch (d) {
      u = !0, r = d;
    } finally {
      try {
        if (!i && n.return != null && (l = n.return(), Object(l) !== l)) return;
      } finally {
        if (u) throw r;
      }
    }
    return a;
  }
}
function vi(e) {
  if (Array.isArray(e)) return e;
}
function Ut(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function w(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Ut(Object(n), !0).forEach(function(o) {
      ot(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Ut(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function ot(e, t, n) {
  return (t = yi(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function yi(e) {
  var t = bi(e, "string");
  return xe(t) == "symbol" ? t : t + "";
}
function bi(e, t) {
  if (xe(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (xe(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var b = {
  _getMeta: function() {
    return [U(arguments.length <= 0 ? void 0 : arguments[0]) || arguments.length <= 0 ? void 0 : arguments[0], N(U(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getConfig: function(t, n) {
    var o, r, s;
    return (o = (t == null || (r = t.instance) === null || r === void 0 ? void 0 : r.$primevue) || (n == null || (s = n.ctx) === null || s === void 0 || (s = s.appContext) === null || s === void 0 || (s = s.config) === null || s === void 0 || (s = s.globalProperties) === null || s === void 0 ? void 0 : s.$primevue)) === null || o === void 0 ? void 0 : o.config;
  },
  _getOptionValue: ut,
  _getPTValue: function() {
    var t, n, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, s = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", l = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, a = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, i = function() {
      var S = b._getOptionValue.apply(b, arguments);
      return j(S) || un(S) ? {
        class: S
      } : S;
    }, u = ((t = o.binding) === null || t === void 0 || (t = t.value) === null || t === void 0 ? void 0 : t.ptOptions) || ((n = o.$primevueConfig) === null || n === void 0 ? void 0 : n.ptOptions) || {}, d = u.mergeSections, c = d === void 0 ? !0 : d, m = u.mergeProps, p = m === void 0 ? !1 : m, f = a ? b._useDefaultPT(o, o.defaultPT(), i, s, l) : void 0, v = b._usePT(o, b._getPT(r, o.$name), i, s, w(w({}, l), {}, {
      global: f || {}
    })), g = b._getPTDatasets(o, s);
    return c || !c && v ? p ? b._mergeProps(o, p, f, v, g) : w(w(w({}, f), v), g) : w(w({}, v), g);
  },
  _getPTDatasets: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = "data-pc-";
    return w(w({}, n === "root" && ot({}, "".concat(o, "name"), W(t.$name))), {}, ot({}, "".concat(o, "section"), W(n)));
  },
  _getPT: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 ? arguments[2] : void 0, r = function(l) {
      var a, i = o ? o(l) : l, u = W(n);
      return (a = i?.[u]) !== null && a !== void 0 ? a : i;
    };
    return t && Object.hasOwn(t, "_usept") ? {
      _usept: t._usept,
      originalValue: r(t.originalValue),
      value: r(t.value)
    } : r(t);
  },
  _usePT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, o = arguments.length > 2 ? arguments[2] : void 0, r = arguments.length > 3 ? arguments[3] : void 0, s = arguments.length > 4 ? arguments[4] : void 0, l = function(g) {
      return o(g, r, s);
    };
    if (n && Object.hasOwn(n, "_usept")) {
      var a, i = n._usept || ((a = t.$primevueConfig) === null || a === void 0 ? void 0 : a.ptOptions) || {}, u = i.mergeSections, d = u === void 0 ? !0 : u, c = i.mergeProps, m = c === void 0 ? !1 : c, p = l(n.originalValue), f = l(n.value);
      return p === void 0 && f === void 0 ? void 0 : j(f) ? f : j(p) ? p : d || !d && f ? m ? b._mergeProps(t, m, p, f) : w(w({}, p), f) : f;
    }
    return l(n);
  },
  _useDefaultPT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = arguments.length > 2 ? arguments[2] : void 0, r = arguments.length > 3 ? arguments[3] : void 0, s = arguments.length > 4 ? arguments[4] : void 0;
    return b._usePT(t, n, o, r, s);
  },
  _loadStyles: function() {
    var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 ? arguments[1] : void 0, r = arguments.length > 2 ? arguments[2] : void 0, s = b._getConfig(o, r), l = {
      nonce: s == null || (t = s.csp) === null || t === void 0 ? void 0 : t.nonce
    };
    b._loadCoreStyles(n, l), b._loadThemeStyles(n, l), b._loadScopedThemeStyles(n, l), b._removeThemeListeners(n), n.$loadStyles = function() {
      return b._loadThemeStyles(n, l);
    }, b._themeChangeListener(n.$loadStyles);
  },
  _loadCoreStyles: function() {
    var t, n, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 ? arguments[1] : void 0;
    if (!G.isStyleNameLoaded((t = o.$style) === null || t === void 0 ? void 0 : t.name) && (n = o.$style) !== null && n !== void 0 && n.name) {
      var s;
      O.loadCSS(r), (s = o.$style) === null || s === void 0 || s.loadCSS(r), G.setLoadedStyleName(o.$style.name);
    }
  },
  _loadThemeStyles: function() {
    var t, n, o, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, s = arguments.length > 1 ? arguments[1] : void 0;
    if (!(r != null && r.isUnstyled() || (r == null || (t = r.theme) === null || t === void 0 ? void 0 : t.call(r)) === "none")) {
      if (!T.isStyleNameLoaded("common")) {
        var l, a, i = ((l = r.$style) === null || l === void 0 || (a = l.getCommonTheme) === null || a === void 0 ? void 0 : a.call(l)) || {}, u = i.primitive, d = i.semantic, c = i.global, m = i.style;
        O.load(u?.css, w({
          name: "primitive-variables"
        }, s)), O.load(d?.css, w({
          name: "semantic-variables"
        }, s)), O.load(c?.css, w({
          name: "global-variables"
        }, s)), O.loadStyle(w({
          name: "global-style"
        }, s), m), T.setLoadedStyleName("common");
      }
      if (!T.isStyleNameLoaded((n = r.$style) === null || n === void 0 ? void 0 : n.name) && (o = r.$style) !== null && o !== void 0 && o.name) {
        var p, f, v, g, y = ((p = r.$style) === null || p === void 0 || (f = p.getDirectiveTheme) === null || f === void 0 ? void 0 : f.call(p)) || {}, S = y.css, P = y.style;
        (v = r.$style) === null || v === void 0 || v.load(S, w({
          name: "".concat(r.$style.name, "-variables")
        }, s)), (g = r.$style) === null || g === void 0 || g.loadStyle(w({
          name: "".concat(r.$style.name, "-style")
        }, s), P), T.setLoadedStyleName(r.$style.name);
      }
      if (!T.isStyleNameLoaded("layer-order")) {
        var h, _, k = (h = r.$style) === null || h === void 0 || (_ = h.getLayerOrderThemeCSS) === null || _ === void 0 ? void 0 : _.call(h);
        O.load(k, w({
          name: "layer-order",
          first: !0
        }, s)), T.setLoadedStyleName("layer-order");
      }
    }
  },
  _loadScopedThemeStyles: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, o = t.preset();
    if (o && t.$attrSelector) {
      var r, s, l, a = ((r = t.$style) === null || r === void 0 || (s = r.getPresetTheme) === null || s === void 0 ? void 0 : s.call(r, o, "[".concat(t.$attrSelector, "]"))) || {}, i = a.css, u = (l = t.$style) === null || l === void 0 ? void 0 : l.load(i, w({
        name: "".concat(t.$attrSelector, "-").concat(t.$style.name)
      }, n));
      t.scopedStyleEl = u.el;
    }
  },
  _themeChangeListener: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
    };
    G.clearLoadedStyleNames(), E.on("theme:change", t);
  },
  _removeThemeListeners: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    E.off("theme:change", t.$loadStyles), t.$loadStyles = void 0;
  },
  _hook: function(t, n, o, r, s, l) {
    var a, i, u = "on".concat(nr(n)), d = b._getConfig(r, s), c = o?.$instance, m = b._usePT(c, b._getPT(r == null || (a = r.value) === null || a === void 0 ? void 0 : a.pt, t), b._getOptionValue, "hooks.".concat(u)), p = b._useDefaultPT(c, d == null || (i = d.pt) === null || i === void 0 || (i = i.directives) === null || i === void 0 ? void 0 : i[t], b._getOptionValue, "hooks.".concat(u)), f = {
      el: o,
      binding: r,
      vnode: s,
      prevVnode: l
    };
    m?.(c, f), p?.(c, f);
  },
  /* eslint-disable-next-line no-unused-vars */
  _mergeProps: function() {
    for (var t = arguments.length > 1 ? arguments[1] : void 0, n = arguments.length, o = new Array(n > 2 ? n - 2 : 0), r = 2; r < n; r++)
      o[r - 2] = arguments[r];
    return He(t) ? t.apply(void 0, o) : L.apply(void 0, o);
  },
  _extend: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = function(a, i, u, d, c) {
      var m, p, f, v;
      i._$instances = i._$instances || {};
      var g = b._getConfig(u, d), y = i._$instances[t] || {}, S = Le(y) ? w(w({}, n), n?.methods) : {};
      i._$instances[t] = w(w({}, y), {}, {
        /* new instance variables to pass in directive methods */
        $name: t,
        $host: i,
        $binding: u,
        $modifiers: u?.modifiers,
        $value: u?.value,
        $el: y.$el || i || void 0,
        $style: w({
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
        $attrSelector: (m = i.$pd) === null || m === void 0 || (m = m[t]) === null || m === void 0 ? void 0 : m.attrSelector,
        /* computed instance variables */
        defaultPT: function() {
          return b._getPT(g?.pt, void 0, function(h) {
            var _;
            return h == null || (_ = h.directives) === null || _ === void 0 ? void 0 : _[t];
          });
        },
        isUnstyled: function() {
          var h, _;
          return ((h = i._$instances[t]) === null || h === void 0 || (h = h.$binding) === null || h === void 0 || (h = h.value) === null || h === void 0 ? void 0 : h.unstyled) !== void 0 ? (_ = i._$instances[t]) === null || _ === void 0 || (_ = _.$binding) === null || _ === void 0 || (_ = _.value) === null || _ === void 0 ? void 0 : _.unstyled : g?.unstyled;
        },
        theme: function() {
          var h;
          return (h = i._$instances[t]) === null || h === void 0 || (h = h.$primevueConfig) === null || h === void 0 ? void 0 : h.theme;
        },
        preset: function() {
          var h;
          return (h = i._$instances[t]) === null || h === void 0 || (h = h.$binding) === null || h === void 0 || (h = h.value) === null || h === void 0 ? void 0 : h.dt;
        },
        /* instance's methods */
        ptm: function() {
          var h, _ = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", k = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return b._getPTValue(i._$instances[t], (h = i._$instances[t]) === null || h === void 0 || (h = h.$binding) === null || h === void 0 || (h = h.value) === null || h === void 0 ? void 0 : h.pt, _, w({}, k));
        },
        ptmo: function() {
          var h = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, _ = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", k = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return b._getPTValue(i._$instances[t], h, _, k, !1);
        },
        cx: function() {
          var h, _, k = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", I = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return (h = i._$instances[t]) !== null && h !== void 0 && h.isUnstyled() ? void 0 : b._getOptionValue((_ = i._$instances[t]) === null || _ === void 0 || (_ = _.$style) === null || _ === void 0 ? void 0 : _.classes, k, w({}, I));
        },
        sx: function() {
          var h, _ = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", k = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, I = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return k ? b._getOptionValue((h = i._$instances[t]) === null || h === void 0 || (h = h.$style) === null || h === void 0 ? void 0 : h.inlineStyles, _, w({}, I)) : void 0;
        }
      }, S), i.$instance = i._$instances[t], (p = (f = i.$instance)[a]) === null || p === void 0 || p.call(f, i, u, d, c), i["$".concat(t)] = i.$instance, b._hook(t, a, i, u, d, c), i.$pd || (i.$pd = {}), i.$pd[t] = w(w({}, (v = i.$pd) === null || v === void 0 ? void 0 : v[t]), {}, {
        name: t,
        instance: i._$instances[t]
      });
    }, r = function(a) {
      var i, u, d, c = a._$instances[t], m = c?.watch, p = function(g) {
        var y, S = g.newValue, P = g.oldValue;
        return m == null || (y = m.config) === null || y === void 0 ? void 0 : y.call(c, S, P);
      }, f = function(g) {
        var y, S = g.newValue, P = g.oldValue;
        return m == null || (y = m["config.ripple"]) === null || y === void 0 ? void 0 : y.call(c, S, P);
      };
      c.$watchersCallback = {
        config: p,
        "config.ripple": f
      }, m == null || (i = m.config) === null || i === void 0 || i.call(c, c?.$primevueConfig), Z.on("config:change", p), m == null || (u = m["config.ripple"]) === null || u === void 0 || u.call(c, c == null || (d = c.$primevueConfig) === null || d === void 0 ? void 0 : d.ripple), Z.on("config:ripple:change", f);
    }, s = function(a) {
      var i = a._$instances[t].$watchersCallback;
      i && (Z.off("config:change", i.config), Z.off("config:ripple:change", i["config.ripple"]), a._$instances[t].$watchersCallback = void 0);
    };
    return {
      created: function(a, i, u, d) {
        a.$pd || (a.$pd = {}), a.$pd[t] = {
          name: t,
          attrSelector: gr("pd")
        }, o("created", a, i, u, d);
      },
      beforeMount: function(a, i, u, d) {
        var c;
        b._loadStyles((c = a.$pd[t]) === null || c === void 0 ? void 0 : c.instance, i, u), o("beforeMount", a, i, u, d), r(a);
      },
      mounted: function(a, i, u, d) {
        var c;
        b._loadStyles((c = a.$pd[t]) === null || c === void 0 ? void 0 : c.instance, i, u), o("mounted", a, i, u, d);
      },
      beforeUpdate: function(a, i, u, d) {
        o("beforeUpdate", a, i, u, d);
      },
      updated: function(a, i, u, d) {
        var c;
        b._loadStyles((c = a.$pd[t]) === null || c === void 0 ? void 0 : c.instance, i, u), o("updated", a, i, u, d);
      },
      beforeUnmount: function(a, i, u, d) {
        var c;
        s(a), b._removeThemeListeners((c = a.$pd[t]) === null || c === void 0 ? void 0 : c.instance), o("beforeUnmount", a, i, u, d);
      },
      unmounted: function(a, i, u, d) {
        var c;
        (c = a.$pd[t]) === null || c === void 0 || (c = c.instance) === null || c === void 0 || (c = c.scopedStyleEl) === null || c === void 0 || (c = c.value) === null || c === void 0 || c.remove(), o("unmounted", a, i, u, d);
      }
    };
  },
  extend: function() {
    var t = b._getMeta.apply(b, arguments), n = Bt(t, 2), o = n[0], r = n[1];
    return w({
      extend: function() {
        var l = b._getMeta.apply(b, arguments), a = Bt(l, 2), i = a[0], u = a[1];
        return b.extend(i, w(w(w({}, r), r?.methods), u));
      }
    }, b._extend(o, r));
  }
}, Si = `
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
`, _i = {
  root: "p-ink"
}, $i = O.extend({
  name: "ripple-directive",
  style: Si,
  classes: _i
}), wi = b.extend({
  style: $i
});
function ke(e) {
  "@babel/helpers - typeof";
  return ke = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ke(e);
}
function Ti(e) {
  return xi(e) || Oi(e) || Ci(e) || Pi();
}
function Pi() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ci(e, t) {
  if (e) {
    if (typeof e == "string") return rt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? rt(e, t) : void 0;
  }
}
function Oi(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function xi(e) {
  if (Array.isArray(e)) return rt(e);
}
function rt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function zt(e, t, n) {
  return (t = ki(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ki(e) {
  var t = Ei(e, "string");
  return ke(t) == "symbol" ? t : t + "";
}
function Ei(e, t) {
  if (ke(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (ke(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Ai = wi.extend("ripple", {
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
      n || (n = dr("span", zt(zt({
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
      var n = this, o = t.currentTarget, r = this.getInk(o);
      if (!(!r || getComputedStyle(r, null).display === "none")) {
        if (!this.isUnstyled() && _e(r, "p-ink-active"), r.setAttribute("data-p-ink-active", "false"), !St(r) && !_t(r)) {
          var s = Math.max(lr(o), fr(o));
          r.style.height = s + "px", r.style.width = s + "px";
        }
        var l = pr(o), a = t.pageX - l.left + document.body.scrollTop - _t(r) / 2, i = t.pageY - l.top + document.body.scrollLeft - St(r) / 2;
        r.style.top = i + "px", r.style.left = a + "px", !this.isUnstyled() && Qe(r, "p-ink-active"), r.setAttribute("data-p-ink-active", "true"), this.timeout = setTimeout(function() {
          r && (!n.isUnstyled() && _e(r, "p-ink-active"), r.setAttribute("data-p-ink-active", "false"));
        }, 401);
      }
    },
    onAnimationEnd: function(t) {
      this.timeout && clearTimeout(this.timeout), !this.isUnstyled() && _e(t.currentTarget, "p-ink-active"), t.currentTarget.setAttribute("data-p-ink-active", "false");
    },
    getInk: function(t) {
      return t && t.children ? Ti(t.children).find(function(n) {
        return mr(n, "data-pc-name") === "ripple";
      }) : void 0;
    }
  }
}), Li = `
    .p-menu {
        background: dt('menu.background');
        color: dt('menu.color');
        border: 1px solid dt('menu.border.color');
        border-radius: dt('menu.border.radius');
        min-width: 12.5rem;
    }

    .p-menu-list {
        margin: 0;
        padding: dt('menu.list.padding');
        outline: 0 none;
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: dt('menu.list.gap');
    }

    .p-menu-item-content {
        transition:
            background dt('menu.transition.duration'),
            color dt('menu.transition.duration');
        border-radius: dt('menu.item.border.radius');
        color: dt('menu.item.color');
        overflow: hidden;
    }

    .p-menu-item-link {
        cursor: pointer;
        display: flex;
        align-items: center;
        text-decoration: none;
        overflow: hidden;
        position: relative;
        color: inherit;
        padding: dt('menu.item.padding');
        gap: dt('menu.item.gap');
        user-select: none;
        outline: 0 none;
    }

    .p-menu-item-label {
        line-height: 1;
    }

    .p-menu-item-icon {
        color: dt('menu.item.icon.color');
    }

    .p-menu-item.p-focus .p-menu-item-content {
        color: dt('menu.item.focus.color');
        background: dt('menu.item.focus.background');
    }

    .p-menu-item.p-focus .p-menu-item-icon {
        color: dt('menu.item.icon.focus.color');
    }

    .p-menu-item:not(.p-disabled) .p-menu-item-content:hover {
        color: dt('menu.item.focus.color');
        background: dt('menu.item.focus.background');
    }

    .p-menu-item:not(.p-disabled) .p-menu-item-content:hover .p-menu-item-icon {
        color: dt('menu.item.icon.focus.color');
    }

    .p-menu-overlay {
        box-shadow: dt('menu.shadow');
    }

    .p-menu-submenu-label {
        background: dt('menu.submenu.label.background');
        padding: dt('menu.submenu.label.padding');
        color: dt('menu.submenu.label.color');
        font-weight: dt('menu.submenu.label.font.weight');
    }

    .p-menu-separator {
        border-block-start: 1px solid dt('menu.separator.border.color');
    }
`, ji = {
  root: function(t) {
    var n = t.props;
    return ["p-menu p-component", {
      "p-menu-overlay": n.popup
    }];
  },
  start: "p-menu-start",
  list: "p-menu-list",
  submenuLabel: "p-menu-submenu-label",
  separator: "p-menu-separator",
  end: "p-menu-end",
  item: function(t) {
    var n = t.instance;
    return ["p-menu-item", {
      "p-focus": n.id === n.focusedOptionId,
      "p-disabled": n.disabled()
    }];
  },
  itemContent: "p-menu-item-content",
  itemLink: "p-menu-item-link",
  itemIcon: "p-menu-item-icon",
  itemLabel: "p-menu-item-label"
};
O.extend({
  name: "menu",
  style: Li,
  classes: ji
});
const Ni = "data-wippy-overlay-layer";
function Ln() {
  return typeof window < "u" && typeof window.document < "u";
}
function jn() {
  return Ln() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function Ii() {
  return jn() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const Ri = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let Vi = 0;
const Ue = /* @__PURE__ */ new WeakMap();
function Ht(e, t) {
  const n = e.style;
  n.setProperty("position", "fixed", "important"), n.setProperty("inset", "auto", "important"), n.setProperty("margin", "0", "important"), n.setProperty("position-anchor", t), n.setProperty("position-area", "bottom span-right"), n.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), n.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), n.setProperty("max-width", "stretch", "important");
}
function Di(e, t) {
  if (!Ri.test(e.className))
    return;
  const n = e.style.cssText;
  Ht(e, t), e.getAttribute("popover") !== "manual" && e.setAttribute("popover", "manual");
  try {
    e.matches(":popover-open") || e.showPopover();
  } catch {
  }
  if (!e.matches(":popover-open")) {
    e.removeAttribute("popover"), e.style.cssText = n;
    return;
  }
  if (!Ue.has(e)) {
    const o = new MutationObserver(() => {
      const r = e.style;
      (r.top !== "auto" || r.left !== "auto" || r.margin !== "0px" || r.getPropertyPriority("top") !== "important" || r.getPropertyPriority("left") !== "important" || r.getPropertyPriority("margin") !== "important" || r.getPropertyPriority("min-width") !== "important" || r.maxWidth !== "stretch" || r.getPropertyPriority("max-width") !== "important") && Ht(e, t);
    });
    o.observe(e, { attributes: !0, attributeFilter: ["style"] }), Ue.set(e, o);
  }
}
function dt(e) {
  const t = Ue.get(e);
  t && (t.disconnect(), Ue.delete(e));
}
function Mi(e) {
  const t = e && typeof e.getRootNode == "function" ? e.getRootNode() : null;
  return t instanceof ShadowRoot ? t : null;
}
function it(e) {
  e.style.top = "0px", e.style.left = "0px";
  const t = e.getBoundingClientRect();
  e.style.top = `${-window.scrollY - t.top}px`, e.style.left = `${-window.scrollX - t.left}px`;
}
const ze = /* @__PURE__ */ new Set(), ct = /* @__PURE__ */ new WeakMap();
let Ft = !1, st = !1;
function Bi() {
  st = !1;
  for (const e of ze) {
    if (!e.isConnected) {
      for (const t of Array.from(e.children))
        t instanceof HTMLElement && dt(t);
      ze.delete(e), ct.get(e)?.disconnect();
      continue;
    }
    e.childElementCount > 0 && it(e);
  }
}
function Kt() {
  st || (st = !0, requestAnimationFrame(Bi));
}
function Wi(e) {
  const t = document.createElement("div");
  t.setAttribute(Ni, "");
  const n = jn();
  if (t.style.cssText = n ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", n && t.setAttribute("popover", "manual"), e.appendChild(t), n) {
    try {
      t.showPopover();
    } catch {
    }
    t.matches(":popover-open") || (t.removeAttribute("popover"), t.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  it(t);
  const o = new MutationObserver((r) => {
    const s = t.__wippyAnchorName;
    for (const l of r) {
      if (s)
        for (const a of Array.from(l.addedNodes))
          a instanceof HTMLElement && Di(a, s);
      for (const a of Array.from(l.removedNodes))
        a instanceof HTMLElement && dt(a);
    }
    t.isConnected && t.childElementCount > 0 && it(t);
  });
  return o.observe(t, { childList: !0 }), ct.set(t, o), ze.add(t), Ft || (Ft = !0, window.addEventListener("scroll", Kt, { capture: !0, passive: !0 }), window.addEventListener("resize", Kt, { passive: !0 })), t;
}
function Yt(e) {
  if (!(!e.hostRoot || e.layer) && (e.layer = Wi(e.hostRoot), Ii())) {
    const t = e.$el ? e.$el.parentElement : null;
    t && (e.anchorName = `--wippy-a-${++Vi}`, e.anchorTrigger = t, t.style.setProperty("anchor-name", e.anchorName), e.layer.__wippyAnchorName = e.anchorName);
  }
}
function qt(e) {
  if (e.anchorTrigger && (e.anchorTrigger.style.removeProperty("anchor-name"), e.anchorTrigger = null), e.anchorName = null, e.layer) {
    for (const t of Array.from(e.layer.children))
      t instanceof HTMLElement && dt(t);
    ze.delete(e.layer), ct.get(e.layer)?.disconnect(), e.layer.remove(), e.layer = null;
  }
}
let Gt = !1;
function Ui() {
  if (Gt)
    return;
  Gt = !0;
  const e = On;
  e.computed = e.computed || {}, e.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, e.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, e.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, e.mounted = function() {
    Ln() && (this.hostRoot = Mi(this.$el), this.mounted = !0, this.hostRoot && (this.inline || Yt(this), this.$watch("inline", (t) => {
      t ? qt(this) : Yt(this);
    })));
  }, e.render = function() {
    return this.inline ? Q(this.$slots, "default", { key: 0 }) : this.mounted ? io(en, { key: 1, to: this.resolvedTarget || document.body }, [
      Q(this.$slots, "default")
    ]) : be("", !0);
  }, e.unmounted = function() {
    qt(this);
  };
}
const Ds = {
  install: (e) => {
    Ui(), e.use(Zr, { theme: "none" });
  }
};
var Nn = {
  name: "TimesIcon",
  extends: pi
};
function zi(e) {
  return Yi(e) || Ki(e) || Fi(e) || Hi();
}
function Hi() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Fi(e, t) {
  if (e) {
    if (typeof e == "string") return at(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? at(e, t) : void 0;
  }
}
function Ki(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Yi(e) {
  if (Array.isArray(e)) return at(e);
}
function at(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function qi(e, t, n, o, r, s) {
  return B(), pe("svg", L({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), zi(t[0] || (t[0] = [tn("path", {
    d: "M8.01186 7.00933L12.27 2.75116C12.341 2.68501 12.398 2.60524 12.4375 2.51661C12.4769 2.42798 12.4982 2.3323 12.4999 2.23529C12.5016 2.13827 12.4838 2.0419 12.4474 1.95194C12.4111 1.86197 12.357 1.78024 12.2884 1.71163C12.2198 1.64302 12.138 1.58893 12.0481 1.55259C11.9581 1.51625 11.8617 1.4984 11.7647 1.50011C11.6677 1.50182 11.572 1.52306 11.4834 1.56255C11.3948 1.60204 11.315 1.65898 11.2488 1.72997L6.99067 5.98814L2.7325 1.72997C2.59553 1.60234 2.41437 1.53286 2.22718 1.53616C2.03999 1.53946 1.8614 1.61529 1.72901 1.74767C1.59663 1.88006 1.5208 2.05865 1.5175 2.24584C1.5142 2.43303 1.58368 2.61419 1.71131 2.75116L5.96948 7.00933L1.71131 11.2675C1.576 11.403 1.5 11.5866 1.5 11.7781C1.5 11.9696 1.576 12.1532 1.71131 12.2887C1.84679 12.424 2.03043 12.5 2.2219 12.5C2.41338 12.5 2.59702 12.424 2.7325 12.2887L6.99067 8.03052L11.2488 12.2887C11.3843 12.424 11.568 12.5 11.7594 12.5C11.9509 12.5 12.1346 12.424 12.27 12.2887C12.4053 12.1532 12.4813 11.9696 12.4813 11.7781C12.4813 11.5866 12.4053 11.403 12.27 11.2675L8.01186 7.00933Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Nn.render = qi;
var Gi = `
    .p-message {
        display: grid;
        grid-template-rows: 1fr;
        border-radius: dt('message.border.radius');
        outline-width: dt('message.border.width');
        outline-style: solid;
    }

    .p-message-content-wrapper {
        min-height: 0;
    }

    .p-message-content {
        display: flex;
        align-items: center;
        padding: dt('message.content.padding');
        gap: dt('message.content.gap');
    }

    .p-message-icon {
        flex-shrink: 0;
    }

    .p-message-close-button {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        margin-inline-start: auto;
        overflow: hidden;
        position: relative;
        width: dt('message.close.button.width');
        height: dt('message.close.button.height');
        border-radius: dt('message.close.button.border.radius');
        background: transparent;
        transition:
            background dt('message.transition.duration'),
            color dt('message.transition.duration'),
            outline-color dt('message.transition.duration'),
            box-shadow dt('message.transition.duration'),
            opacity 0.3s;
        outline-color: transparent;
        color: inherit;
        padding: 0;
        border: none;
        cursor: pointer;
        user-select: none;
    }

    .p-message-close-icon {
        font-size: dt('message.close.icon.size');
        width: dt('message.close.icon.size');
        height: dt('message.close.icon.size');
    }

    .p-message-close-button:focus-visible {
        outline-width: dt('message.close.button.focus.ring.width');
        outline-style: dt('message.close.button.focus.ring.style');
        outline-offset: dt('message.close.button.focus.ring.offset');
    }

    .p-message-info {
        background: dt('message.info.background');
        outline-color: dt('message.info.border.color');
        color: dt('message.info.color');
        box-shadow: dt('message.info.shadow');
    }

    .p-message-info .p-message-close-button:focus-visible {
        outline-color: dt('message.info.close.button.focus.ring.color');
        box-shadow: dt('message.info.close.button.focus.ring.shadow');
    }

    .p-message-info .p-message-close-button:hover {
        background: dt('message.info.close.button.hover.background');
    }

    .p-message-info.p-message-outlined {
        color: dt('message.info.outlined.color');
        outline-color: dt('message.info.outlined.border.color');
    }

    .p-message-info.p-message-simple {
        color: dt('message.info.simple.color');
    }

    .p-message-success {
        background: dt('message.success.background');
        outline-color: dt('message.success.border.color');
        color: dt('message.success.color');
        box-shadow: dt('message.success.shadow');
    }

    .p-message-success .p-message-close-button:focus-visible {
        outline-color: dt('message.success.close.button.focus.ring.color');
        box-shadow: dt('message.success.close.button.focus.ring.shadow');
    }

    .p-message-success .p-message-close-button:hover {
        background: dt('message.success.close.button.hover.background');
    }

    .p-message-success.p-message-outlined {
        color: dt('message.success.outlined.color');
        outline-color: dt('message.success.outlined.border.color');
    }

    .p-message-success.p-message-simple {
        color: dt('message.success.simple.color');
    }

    .p-message-warn {
        background: dt('message.warn.background');
        outline-color: dt('message.warn.border.color');
        color: dt('message.warn.color');
        box-shadow: dt('message.warn.shadow');
    }

    .p-message-warn .p-message-close-button:focus-visible {
        outline-color: dt('message.warn.close.button.focus.ring.color');
        box-shadow: dt('message.warn.close.button.focus.ring.shadow');
    }

    .p-message-warn .p-message-close-button:hover {
        background: dt('message.warn.close.button.hover.background');
    }

    .p-message-warn.p-message-outlined {
        color: dt('message.warn.outlined.color');
        outline-color: dt('message.warn.outlined.border.color');
    }

    .p-message-warn.p-message-simple {
        color: dt('message.warn.simple.color');
    }

    .p-message-error {
        background: dt('message.error.background');
        outline-color: dt('message.error.border.color');
        color: dt('message.error.color');
        box-shadow: dt('message.error.shadow');
    }

    .p-message-error .p-message-close-button:focus-visible {
        outline-color: dt('message.error.close.button.focus.ring.color');
        box-shadow: dt('message.error.close.button.focus.ring.shadow');
    }

    .p-message-error .p-message-close-button:hover {
        background: dt('message.error.close.button.hover.background');
    }

    .p-message-error.p-message-outlined {
        color: dt('message.error.outlined.color');
        outline-color: dt('message.error.outlined.border.color');
    }

    .p-message-error.p-message-simple {
        color: dt('message.error.simple.color');
    }

    .p-message-secondary {
        background: dt('message.secondary.background');
        outline-color: dt('message.secondary.border.color');
        color: dt('message.secondary.color');
        box-shadow: dt('message.secondary.shadow');
    }

    .p-message-secondary .p-message-close-button:focus-visible {
        outline-color: dt('message.secondary.close.button.focus.ring.color');
        box-shadow: dt('message.secondary.close.button.focus.ring.shadow');
    }

    .p-message-secondary .p-message-close-button:hover {
        background: dt('message.secondary.close.button.hover.background');
    }

    .p-message-secondary.p-message-outlined {
        color: dt('message.secondary.outlined.color');
        outline-color: dt('message.secondary.outlined.border.color');
    }

    .p-message-secondary.p-message-simple {
        color: dt('message.secondary.simple.color');
    }

    .p-message-contrast {
        background: dt('message.contrast.background');
        outline-color: dt('message.contrast.border.color');
        color: dt('message.contrast.color');
        box-shadow: dt('message.contrast.shadow');
    }

    .p-message-contrast .p-message-close-button:focus-visible {
        outline-color: dt('message.contrast.close.button.focus.ring.color');
        box-shadow: dt('message.contrast.close.button.focus.ring.shadow');
    }

    .p-message-contrast .p-message-close-button:hover {
        background: dt('message.contrast.close.button.hover.background');
    }

    .p-message-contrast.p-message-outlined {
        color: dt('message.contrast.outlined.color');
        outline-color: dt('message.contrast.outlined.border.color');
    }

    .p-message-contrast.p-message-simple {
        color: dt('message.contrast.simple.color');
    }

    .p-message-text {
        font-size: dt('message.text.font.size');
        font-weight: dt('message.text.font.weight');
    }

    .p-message-icon {
        font-size: dt('message.icon.size');
        width: dt('message.icon.size');
        height: dt('message.icon.size');
    }

    .p-message-sm .p-message-content {
        padding: dt('message.content.sm.padding');
    }

    .p-message-sm .p-message-text {
        font-size: dt('message.text.sm.font.size');
    }

    .p-message-sm .p-message-icon {
        font-size: dt('message.icon.sm.size');
        width: dt('message.icon.sm.size');
        height: dt('message.icon.sm.size');
    }

    .p-message-sm .p-message-close-icon {
        font-size: dt('message.close.icon.sm.size');
        width: dt('message.close.icon.sm.size');
        height: dt('message.close.icon.sm.size');
    }

    .p-message-lg .p-message-content {
        padding: dt('message.content.lg.padding');
    }

    .p-message-lg .p-message-text {
        font-size: dt('message.text.lg.font.size');
    }

    .p-message-lg .p-message-icon {
        font-size: dt('message.icon.lg.size');
        width: dt('message.icon.lg.size');
        height: dt('message.icon.lg.size');
    }

    .p-message-lg .p-message-close-icon {
        font-size: dt('message.close.icon.lg.size');
        width: dt('message.close.icon.lg.size');
        height: dt('message.close.icon.lg.size');
    }

    .p-message-outlined {
        background: transparent;
        outline-width: dt('message.outlined.border.width');
    }

    .p-message-simple {
        background: transparent;
        outline-color: transparent;
        box-shadow: none;
    }

    .p-message-simple .p-message-content {
        padding: dt('message.simple.content.padding');
    }

    .p-message-outlined .p-message-close-button:hover,
    .p-message-simple .p-message-close-button:hover {
        background: transparent;
    }

    .p-message-enter-active {
        animation: p-animate-message-enter 0.3s ease-out forwards;
        overflow: hidden;
    }

    .p-message-leave-active {
        animation: p-animate-message-leave 0.15s ease-in forwards;
        overflow: hidden;
    }

    @keyframes p-animate-message-enter {
        from {
            opacity: 0;
            grid-template-rows: 0fr;
        }
        to {
            opacity: 1;
            grid-template-rows: 1fr;
        }
    }

    @keyframes p-animate-message-leave {
        from {
            opacity: 1;
            grid-template-rows: 1fr;
        }
        to {
            opacity: 0;
            margin: 0;
            grid-template-rows: 0fr;
        }
    }
`, Ji = {
  root: function(t) {
    var n = t.props;
    return ["p-message p-component p-message-" + n.severity, {
      "p-message-outlined": n.variant === "outlined",
      "p-message-simple": n.variant === "simple",
      "p-message-sm": n.size === "small",
      "p-message-lg": n.size === "large"
    }];
  },
  contentWrapper: "p-message-content-wrapper",
  content: "p-message-content",
  icon: "p-message-icon",
  text: "p-message-text",
  closeButton: "p-message-close-button",
  closeIcon: "p-message-close-icon"
}, Qi = O.extend({
  name: "message",
  style: Gi,
  classes: Ji
}), Zi = {
  name: "BaseMessage",
  extends: An,
  props: {
    severity: {
      type: String,
      default: "info"
    },
    closable: {
      type: Boolean,
      default: !1
    },
    life: {
      type: Number,
      default: null
    },
    icon: {
      type: String,
      default: void 0
    },
    closeIcon: {
      type: String,
      default: void 0
    },
    closeButtonProps: {
      type: null,
      default: null
    },
    size: {
      type: String,
      default: null
    },
    variant: {
      type: String,
      default: null
    }
  },
  style: Qi,
  provide: function() {
    return {
      $pcMessage: this,
      $parentInstance: this
    };
  }
};
function Ee(e) {
  "@babel/helpers - typeof";
  return Ee = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ee(e);
}
function Jt(e, t, n) {
  return (t = Xi(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Xi(e) {
  var t = es(e, "string");
  return Ee(t) == "symbol" ? t : t + "";
}
function es(e, t) {
  if (Ee(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (Ee(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var ts = {
  name: "Message",
  extends: Zi,
  inheritAttrs: !1,
  emits: ["close", "life-end"],
  timeout: null,
  data: function() {
    return {
      visible: !0
    };
  },
  mounted: function() {
    var t = this;
    this.life && setTimeout(function() {
      t.visible = !1, t.$emit("life-end");
    }, this.life);
  },
  methods: {
    close: function(t) {
      this.visible = !1, this.$emit("close", t);
    }
  },
  computed: {
    closeAriaLabel: function() {
      return this.$primevue.config.locale.aria ? this.$primevue.config.locale.aria.close : void 0;
    },
    dataP: function() {
      return mn(Jt(Jt({
        outlined: this.variant === "outlined",
        simple: this.variant === "simple"
      }, this.severity, this.severity), this.size, this.size));
    }
  },
  directives: {
    ripple: Ai
  },
  components: {
    TimesIcon: Nn
  }
};
function Ae(e) {
  "@babel/helpers - typeof";
  return Ae = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ae(e);
}
function Qt(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function Zt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Qt(Object(n), !0).forEach(function(o) {
      ns(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Qt(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function ns(e, t, n) {
  return (t = os(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function os(e) {
  var t = rs(e, "string");
  return Ae(t) == "symbol" ? t : t + "";
}
function rs(e, t) {
  if (Ae(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (Ae(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var is = ["data-p"], ss = ["data-p"], as = ["data-p"], ls = ["aria-label", "data-p"], us = ["data-p"];
function ds(e, t, n, o, r, s) {
  var l = so("TimesIcon"), a = ao("ripple");
  return B(), Me(lo, L({
    name: "p-message",
    appear: ""
  }, e.ptmi("transition")), {
    default: uo(function() {
      return [r.visible ? (B(), pe("div", L({
        key: 0,
        class: e.cx("root"),
        role: "alert",
        "aria-live": "assertive",
        "aria-atomic": "true",
        "data-p": s.dataP
      }, e.ptm("root")), [tn("div", L({
        class: e.cx("contentWrapper")
      }, e.ptm("contentWrapper")), [e.$slots.container ? Q(e.$slots, "container", {
        key: 0,
        closeCallback: s.close
      }) : (B(), pe("div", L({
        key: 1,
        class: e.cx("content"),
        "data-p": s.dataP
      }, e.ptm("content")), [Q(e.$slots, "icon", {
        class: co(e.cx("icon"))
      }, function() {
        return [(B(), Me(mo(e.icon ? "span" : null), L({
          class: [e.cx("icon"), e.icon],
          "data-p": s.dataP
        }, e.ptm("icon")), null, 16, ["class", "data-p"]))];
      }), e.$slots.default ? (B(), pe("div", L({
        key: 0,
        class: e.cx("text"),
        "data-p": s.dataP
      }, e.ptm("text")), [Q(e.$slots, "default")], 16, as)) : be("", !0), e.closable ? po((B(), pe("button", L({
        key: 1,
        class: e.cx("closeButton"),
        "aria-label": s.closeAriaLabel,
        type: "button",
        onClick: t[0] || (t[0] = function(i) {
          return s.close(i);
        }),
        "data-p": s.dataP
      }, Zt(Zt({}, e.closeButtonProps), e.ptm("closeButton"))), [Q(e.$slots, "closeicon", {}, function() {
        return [e.closeIcon ? (B(), pe("i", L({
          key: 0,
          class: [e.cx("closeIcon"), e.closeIcon],
          "data-p": s.dataP
        }, e.ptm("closeIcon")), null, 16, us)) : (B(), Me(l, L({
          key: 1,
          class: [e.cx("closeIcon"), e.closeIcon],
          "data-p": s.dataP
        }, e.ptm("closeIcon")), null, 16, ["class", "data-p"]))];
      })], 16, ls)), [[a]]) : be("", !0)], 16, ss))], 16)], 16, is)) : be("", !0)];
    }),
    _: 3
  }, 16);
}
ts.render = ds;
export {
  Ls as $,
  Es as A,
  O as B,
  fr as C,
  ws as D,
  js as E,
  Vs as F,
  $s as G,
  Rs as H,
  Ps as I,
  Ss as J,
  pr as K,
  ks as L,
  bs as M,
  _s as N,
  fn as O,
  Ds as P,
  mr as Q,
  _t as R,
  Ts as S,
  St as T,
  dr as U,
  ar as V,
  ys as W,
  Is as Y,
  hr as _,
  gs as a,
  cn as b,
  pi as c,
  An as d,
  Ns as e,
  Nn as f,
  On as g,
  Ai as h,
  mn as i,
  C as j,
  Zo as k,
  vn as l,
  Os as m,
  xs as n,
  _e as o,
  Je as p,
  Qe as q,
  vs as r,
  ts as s,
  Le as t,
  hs as u,
  lr as v,
  Cs as w,
  As as x,
  b as y,
  gn as z
};
