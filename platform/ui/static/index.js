import { hasInjectionContext as co, inject as Cr, effectScope as po, ref as A, markRaw as uo, onMounted as pt, onUnmounted as ho, watch as be, createApp as fo, readonly as mo, getCurrentInstance as Ut, nextTick as vo, reactive as go, renderSlot as at, openBlock as O, createBlock as De, Teleport as Or, createCommentVNode as U, useId as bo, mergeProps as re, h as yo, defineComponent as Tr, onBeforeUnmount as Lr, createElementBlock as N, resolveComponent as xo, createVNode as P, withCtx as Ft, Transition as wo, createElementVNode as v, computed as de, toDisplayString as le, unref as m, normalizeClass as ve, createTextVNode as I, withDirectives as Wt, vModelText as Kt, Fragment as Pe, renderList as Je, withModifiers as Ee } from "vue";
import { addCollection as ko, Icon as E } from "@iconify/vue";
import { config as Gt, addIcons as So, on as Pr, applyThemeMode as et, host as it, hostCss as _o, loadCss as $o, loadByTagName as Co, api as _t, define as Oo } from "@wippy-fe/proxy";
var $t = "data-wippy-visible";
function Yt(e) {
  const t = e.getAttribute($t);
  return t === "true" ? !0 : t === "false" ? !1 : null;
}
var To = Object.defineProperty, Lo = (e, t, r) => t in e ? To(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, R = (e, t, r) => Lo(e, typeof t != "symbol" ? t + "" : t, r), Po = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], Eo = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function Xt(e) {
  const t = e.startsWith("--") ? e : `--${e}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(t) ? t : null;
}
function No(...e) {
  const t = /* @__PURE__ */ new Set();
  for (const r of e)
    if (r)
      for (const [o, n] of Object.entries(r)) {
        if ((o === "@light" || o === "@dark") && n && typeof n == "object") {
          for (const [a, s] of Object.entries(n)) {
            const l = typeof s == "string" ? Xt(a) : null;
            l && t.add(l);
          }
          continue;
        }
        const i = typeof n == "string" ? Xt(o) : null;
        i && t.add(i);
      }
  return [...t].sort();
}
function Ao(e) {
  if (e.length === 0)
    return "";
  const t = e.map((r) => `  ${r}: inherit;`).join(`
`);
  return `${Eo} {
${t}
}`;
}
function Vo(e, t) {
  const r = Ao(t);
  r && Er(e, r, "@wippy-fe/css-variables-bridge");
}
function Mo(e, t) {
  const o = (t ?? Po).map(async (n) => {
    const i = _o[n];
    if (!i)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${n}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await $o(i);
    } catch (a) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${n}" (${i}):`, a), null;
    }
  });
  return Promise.all(o).then((n) => {
    for (const i of n) {
      if (!i)
        continue;
      const a = document.createElement("style");
      a.textContent = i, a.setAttribute("role", "@wippy-fe/host-css"), e.appendChild(a);
    }
  });
}
function jo(e, t) {
  const r = document.createElement("style");
  r.textContent = t, e.appendChild(r);
}
function Er(e, t, r) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const n = new CSSStyleSheet();
    n.replaceSync(t), e.adoptedStyleSheets = [...e.adoptedStyleSheets, n];
    return;
  }
  const o = document.createElement("style");
  o.setAttribute("role", r), o.textContent = t, e.appendChild(o);
}
function Ro(e, t) {
  Er(e, t, "@wippy-fe/custom-css");
}
function Nr(e) {
  return e.__wippyHost ?? null;
}
function Do(e) {
  return e.replace(/-([a-z])/g, (t, r) => r.toUpperCase());
}
function Ho(e, t, r) {
  switch (r.type) {
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
        return r.type === "array" && !Array.isArray(o) ? { value: void 0, error: `Invalid ${e}: expected a JSON array` } : { value: o };
      } catch {
        return { value: void 0, error: `Invalid ${e}: must be valid JSON` };
      }
    default:
      return { value: t };
  }
}
function xt(e, t) {
  const r = {}, o = [];
  for (const [n, i] of Object.entries(t.properties)) {
    const a = e.getAttribute(n), s = Do(n);
    if (a === null) {
      i.default !== void 0 && (r[s] = i.default);
      continue;
    }
    const l = Ho(n, a, i);
    l.error ? o.push(l.error) : r[s] = l.value;
  }
  return { props: r, errors: o };
}
var Io = class {
  constructor(e, t) {
    R(this, "_props"), R(this, "_errors"), R(this, "_content"), R(this, "_hostVisibility"), R(this, "_propsListeners", /* @__PURE__ */ new Set()), R(this, "_contentListeners", /* @__PURE__ */ new Set()), R(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), R(this, "_disposed", !1), R(this, "_emitToDom"), R(this, "props"), R(this, "events"), R(this, "content"), R(this, "hostVisibility"), this._props = e.props, this._errors = e.errors, this._content = e.content, this._hostVisibility = e.hostVisibility, this._emitToDom = t;
    const r = this;
    this.props = {
      get value() {
        return r._props;
      },
      get errors() {
        return r._errors;
      },
      subscribe(o, n) {
        return r._subscribeProps(o, n);
      }
    }, this.events = {
      emit(o, n) {
        r._disposed || r._emitToDom(o, n);
      }
    }, this.content = e.hasContent ? {
      get value() {
        return r._content;
      },
      subscribe(o, n) {
        return r._subscribeContent(o, n);
      }
    } : null, this.hostVisibility = {
      get value() {
        return r._hostVisibility;
      },
      subscribe(o, n) {
        return r._subscribeHostVisibility(o, n);
      }
    };
  }
  /** @internal */
  notifyProps(e, t) {
    if (!this._disposed) {
      this._props = e, this._errors = t;
      for (const r of this._propsListeners)
        r(e, t);
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
      for (const r of this._hostVisibilityListeners)
        r(e, t);
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
    const r = () => {
      this._propsListeners.delete(e), t?.signal?.removeEventListener("abort", r);
    };
    return t?.signal?.addEventListener("abort", r, { once: !0 }), r;
  }
  _subscribeContent(e, t) {
    if (this._disposed || t?.signal?.aborted)
      return () => {
      };
    this._contentListeners.add(e), t?.immediate && e(this._content);
    const r = () => {
      this._contentListeners.delete(e), t?.signal?.removeEventListener("abort", r);
    };
    return t?.signal?.addEventListener("abort", r, { once: !0 }), r;
  }
  _subscribeHostVisibility(e, t) {
    if (this._disposed || t?.signal?.aborted)
      return () => {
      };
    this._hostVisibilityListeners.add(e), t?.immediate && e(this._hostVisibility, this._hostVisibility);
    const r = () => {
      this._hostVisibilityListeners.delete(e), t?.signal?.removeEventListener("abort", r);
    };
    return t?.signal?.addEventListener("abort", r, { once: !0 }), r;
  }
}, Bo = class extends HTMLElement {
  constructor() {
    super(), R(this, "_internals"), R(this, "_contentObserver", null), R(this, "_initialized", !1), R(this, "_container", null), R(this, "_reactive", null), R(this, "_lastProps", null), R(this, "_lastErrors", []), R(this, "_lastContent", null), R(this, "_themeUnsub", null), R(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = Yt(this);
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
    const e = this.wippyConfig, t = Object.keys(e.propsSchema.properties), r = e.extraObservedAttributes ?? [];
    return [.../* @__PURE__ */ new Set([...t, ...r, $t])];
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
    return Nr(this);
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
      let r, o;
      if (this._lastProps !== null)
        r = this._lastProps, o = this._lastErrors;
      else {
        const i = xt(this, e.propsSchema);
        e.validateProps && i.errors.push(...e.validateProps(i.props)), r = i.props, o = i.errors, this._lastProps = r, this._lastErrors = o;
      }
      const n = t ? this._lastContent ?? this._extractContent(e.contentTemplate) : null;
      t && this._lastContent === null && (this._lastContent = n), this._reactive = new Io(
        { props: r, errors: o, content: n, hasContent: t, hostVisibility: this._hostVisible },
        this.emitEvent.bind(this)
      );
    }
    return this._reactive;
  }
  // ── Lifecycle ──────────────────────────────────────────────
  connectedCallback() {
    this._internals.states.add("loading");
    try {
      const e = this.constructor.wippyConfig, t = this._initialized, r = this.shadowRoot ?? this.attachShadow({ mode: e.shadowMode ?? "open" });
      let o;
      if (t)
        o = this._container;
      else {
        this.onInit(r), e.inlineCss && jo(r, e.inlineCss);
        try {
          const c = Gt?.theming, p = No(
            c?.global?.cssVariables,
            c?.children?.cssVariables
          );
          Vo(r, p);
        } catch {
        }
        if (e.customCss !== !1)
          try {
            const c = Gt?.theming, p = [c?.global?.customCSS, c?.children?.customCSS].filter(Boolean).join(`
`);
            p && Ro(r, p);
          } catch {
          }
        (e.hostCssKeys === void 0 || e.hostCssKeys.length > 0) && Mo(r, e.hostCssKeys), o = document.createElement("div"), o.setAttribute("data-wippy-theme-root", "");
        const l = e.containerClasses ?? [];
        l.length > 0 && o.classList.add(...l), r.appendChild(o), this._container = o, So(ko);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = Pr("@theme", (l) => this._applyTheme(l)));
      const { props: n, errors: i } = xt(this, e.propsSchema);
      e.validateProps && i.push(...e.validateProps(n));
      const a = n;
      this._lastProps = a, this._lastErrors = i;
      let s = null;
      e.contentTemplate && (s = this._extractContent(e.contentTemplate), this._lastContent = s, this._contentObserver = new MutationObserver(() => {
        const l = this._extractContent(e.contentTemplate);
        this._lastContent = l, this._reactive?.notifyContent(l), this.onContentChanged(l);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(r, o, a, i, s, t), this._internals.states.delete("loading"), this._internals.states.add("ready"), t || (this._initialized = !0), this.onReady(), this.emitEvent("load");
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
  _applyTheme(e = it.getThemeMode?.()) {
    et(e, this), this._container && et(e, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), et("auto", this), this._container && et("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(e, t, r) {
    if (t === r)
      return;
    if (e === $t) {
      const s = this._hostVisible, l = Yt(this);
      if (l === s)
        return;
      this._hostVisible = l, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(l, s), this.onHostVisibilityChanged(l, s));
      return;
    }
    const o = this.constructor.wippyConfig, { props: n, errors: i } = xt(this, o.propsSchema);
    o.validateProps && i.push(...o.validateProps(n));
    const a = n;
    this._lastProps = a, this._lastErrors = i, this._reactive?.notifyProps(a, i), this.onPropsChanged(a, i);
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
function zo(e) {
  return e.__wippyHostBus ?? null;
}
function Uo(e) {
  return e.dataset.wippyPanelId ?? null;
}
/*!
 * pinia v4.0.3
 * (c) 2026 Eduardo San Martin Morote
 * @license MIT
 */
let Ar;
const Vr = (e) => Ar = e, Fo = () => co() && Cr(Mr) || Ar, Mr = (
  /* istanbul ignore next */
  Symbol()
);
function Wo() {
  const e = po(!0), t = e.run(() => A({}));
  let r = [], o = [];
  const n = uo({
    install(i) {
      Vr(n), n._a = i, i.provide(Mr, n), i.config.globalProperties.$pinia = n, o.forEach((a) => r.push(a)), o = [];
    },
    use(i) {
      return this._a ? r.push(i) : o.push(i), this;
    },
    _p: r,
    _a: null,
    _e: e,
    _s: /* @__PURE__ */ new Map(),
    state: t
  });
  return n;
}
var Ko = Object.defineProperty, Go = (e, t, r) => t in e ? Ko(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, Ne = (e, t, r) => Go(e, typeof t != "symbol" ? t + "" : t, r), Yo = /* @__PURE__ */ Symbol("wippy:emit"), Xo = /* @__PURE__ */ Symbol("wippy:props"), qo = /* @__PURE__ */ Symbol("wippy:props_error"), Zo = /* @__PURE__ */ Symbol("wippy:content"), Qo = /* @__PURE__ */ Symbol("wippy:panel-id"), Jo = /* @__PURE__ */ Symbol("wippy:layout-bus"), en = /* @__PURE__ */ Symbol("wippy:host"), jr = /* @__PURE__ */ Symbol("wippy:host-visibility");
function tn() {
  const e = Cr(jr);
  if (!e)
    throw new Error("useHostVisibility() must be called inside a WippyVueElement");
  return e;
}
function rn(e) {
  const t = tn();
  let r = !1, o = null, n = !1;
  function i() {
    if (o)
      return n = !0, o;
    let a;
    try {
      a = Promise.resolve(e());
    } catch (l) {
      a = Promise.reject(l);
    }
    const s = a.finally(() => {
      if (o === s && (o = null, r && n))
        return n = !1, i();
    });
    return o = s, s;
  }
  return pt(() => (r = !0, i())), ho(() => {
    r = !1, n = !1;
  }), be(t, (a, s) => {
    if (r && s === !1 && a === !0)
      return i();
  }), t;
}
var on = class extends Bo {
  constructor() {
    super(...arguments), Ne(this, "_vueApp", null), Ne(this, "_propsRef", A({})), Ne(this, "_errorsRef", A([])), Ne(this, "_contentRef", A(null)), Ne(this, "_hostVisibilityRef", A(null)), Ne(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  onMount(e, t, r, o, n, i) {
    const a = this.constructor.vueConfig;
    this._propsRef.value = r, this._errorsRef.value = o, this._contentRef.value = n ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const c of o)
      this.emitEvent("invalid", { message: c });
    const s = new AbortController();
    this._bridgeAbort = s, this.reactive.props.subscribe((c, p) => {
      this._propsRef.value = c, this._errorsRef.value = [...p];
      for (const h of p)
        this.emitEvent("invalid", { message: h });
    }, { signal: s.signal }), this.reactive.content && this.reactive.content.subscribe((c) => {
      this._contentRef.value = c;
    }, { signal: s.signal }), this.reactive.hostVisibility.subscribe((c) => {
      this._hostVisibilityRef.value = c;
    }, { signal: s.signal });
    const l = (c) => {
      if (s.signal.aborted)
        return;
      const p = Fo(), h = fo(c.rootComponent);
      this._vueApp = h;
      const d = Wo();
      if (c.piniaPlugins)
        for (const f of c.piniaPlugins)
          d.use(f);
      if (h.use(d), c.plugins)
        for (const f of c.plugins)
          h.use(f);
      h.provide(Xo, this._propsRef), h.provide(qo, this._errorsRef), h.provide(Yo, this.emitEvent.bind(this)), h.provide(Zo, this._contentRef), h.provide(jr, this._hostVisibilityRef), h.provide(Qo, Uo(this)), h.provide(Jo, zo(this)), h.provide(en, Nr(this)), c.providers && c.providers(h, this), h.mount(t), p && Vr(p);
    };
    if (a.rootComponent)
      l(a);
    else if (a.lazyConfig) {
      const c = document.createElement("wippy-loading");
      c.setAttribute("no-bg", ""), t.appendChild(c), a.lazyConfig().then((p) => {
        s.signal.aborted || (c.remove(), l(p));
      }).catch((p) => {
        if (s.signal.aborted)
          return;
        const h = p instanceof Error ? p.message : String(p), d = document.createElement("wippy-error");
        d.setAttribute("title", "Failed to load"), d.setAttribute("message", h), c.replaceWith(d), this.emitEvent("error", { message: h });
      });
    } else
      throw new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._vueApp && (this._vueApp.unmount(), this._vueApp = null);
  }
}, nn = Object.defineProperty, qt = Object.getOwnPropertySymbols, an = Object.prototype.hasOwnProperty, sn = Object.prototype.propertyIsEnumerable, Zt = (e, t, r) => t in e ? nn(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, ln = (e, t) => {
  for (var r in t || (t = {})) an.call(t, r) && Zt(e, r, t[r]);
  if (qt) for (var r of qt(t)) sn.call(t, r) && Zt(e, r, t[r]);
  return e;
};
function At(e) {
  return e == null || e === "" || Array.isArray(e) && e.length === 0 || !(e instanceof Date) && typeof e == "object" && Object.keys(e).length === 0;
}
function Rr(e) {
  return typeof e == "function" && "call" in e && "apply" in e;
}
function j(e) {
  return !At(e);
}
function we(e, t = !0) {
  return e instanceof Object && e.constructor === Object && (t || Object.keys(e).length !== 0);
}
function Dr(e = {}, t = {}) {
  let r = ln({}, e);
  return Object.keys(t).forEach((o) => {
    let n = o;
    we(t[n]) && n in e && we(e[n]) ? r[n] = Dr(e[n], t[n]) : r[n] = t[n];
  }), r;
}
function cn(...e) {
  return e.reduce((t, r, o) => o === 0 ? r : Dr(t, r), {});
}
function ce(e, ...t) {
  return Rr(e) ? e(...t) : e;
}
function me(e, t = !0) {
  return typeof e == "string" && (t || e !== "");
}
function _e(e) {
  return me(e) ? e.replace(/(-|_)/g, "").toLowerCase() : e;
}
function Hr(e, t = "", r = {}) {
  let o = _e(t).split("."), n = o.shift();
  if (n) {
    if (we(e)) {
      let i = Object.keys(e).find((a) => _e(a) === n) || "";
      return Hr(ce(e[i], r), o.join("."), r);
    }
    return;
  }
  return ce(e, r);
}
function pn(e, t = !0) {
  return Array.isArray(e) && (t || e.length !== 0);
}
function un(e) {
  return j(e) && !isNaN(e);
}
function $e(e, t) {
  if (t) {
    let r = t.test(e);
    return t.lastIndex = 0, r;
  }
  return !1;
}
function dn(...e) {
  return cn(...e);
}
function Ie(e) {
  return e && e.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function Ir(e) {
  return me(e) ? e.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : e;
}
function Vt() {
  let e = /* @__PURE__ */ new Map();
  return { on(t, r) {
    let o = e.get(t);
    return o ? o.push(r) : o = [r], e.set(t, o), this;
  }, off(t, r) {
    let o = e.get(t);
    return o && o.splice(o.indexOf(r) >>> 0, 1), this;
  }, emit(t, r) {
    let o = e.get(t);
    o && o.forEach((n) => {
      n(r);
    });
  }, clear() {
    e.clear();
  } };
}
function hn(e, t) {
  return e ? e.classList ? e.classList.contains(t) : new RegExp("(^| )" + t + "( |$)", "gi").test(e.className) : !1;
}
function Qt(e, t) {
  if (e && t) {
    let r = (o) => {
      hn(e, o) || (e.classList ? e.classList.add(o) : e.className += " " + o);
    };
    [t].flat().filter(Boolean).forEach((o) => o.split(" ").forEach(r));
  }
}
function fn(e, t) {
  if (e && t) {
    let r = (o) => {
      e.classList ? e.classList.remove(o) : e.className = e.className.replace(new RegExp("(^|\\b)" + o.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [t].flat().filter(Boolean).forEach((o) => o.split(" ").forEach(r));
  }
}
function Ct(e) {
  for (let t of document?.styleSheets) try {
    for (let r of t?.cssRules) for (let o of r?.style) if (e.test(o)) return { name: o, value: r.style.getPropertyValue(o).trim() };
  } catch {
  }
  return null;
}
function Br(e) {
  let t = { width: 0, height: 0 };
  if (e) {
    let [r, o] = [e.style.visibility, e.style.display], n = e.getBoundingClientRect();
    e.style.visibility = "hidden", e.style.display = "block", t.width = n.width || e.offsetWidth, t.height = n.height || e.offsetHeight, e.style.display = o, e.style.visibility = r;
  }
  return t;
}
function zr() {
  let e = window, t = document, r = t.documentElement, o = t.getElementsByTagName("body")[0], n = e.innerWidth || r.clientWidth || o.clientWidth, i = e.innerHeight || r.clientHeight || o.clientHeight;
  return { width: n, height: i };
}
function mn(e) {
  return e ? Math.abs(e.scrollLeft) : 0;
}
function vn() {
  let e = document.documentElement;
  return (window.pageXOffset || mn(e)) - (e.clientLeft || 0);
}
function gn() {
  let e = document.documentElement;
  return (window.pageYOffset || e.scrollTop) - (e.clientTop || 0);
}
function bn(e) {
  return e ? getComputedStyle(e).direction === "rtl" : !1;
}
function yn(e, t, r = !0) {
  var o, n, i, a;
  if (e) {
    let s = e.offsetParent ? { width: e.offsetWidth, height: e.offsetHeight } : Br(e), l = s.height, c = s.width, p = t.offsetHeight, h = t.offsetWidth, d = t.getBoundingClientRect(), f = gn(), S = vn(), $ = zr(), _, w, L = "top";
    d.top + p + l > $.height ? (_ = d.top + f - l, L = "bottom", _ < 0 && (_ = f)) : _ = p + d.top + f, d.left + c > $.width ? w = Math.max(0, d.left + S + h - c) : w = d.left + S, bn(e) ? e.style.insetInlineEnd = w + "px" : e.style.insetInlineStart = w + "px", e.style.top = _ + "px", e.style.transformOrigin = L, r && (e.style.marginTop = L === "bottom" ? `calc(${(n = (o = Ct(/-anchor-gutter$/)) == null ? void 0 : o.value) != null ? n : "2px"} * -1)` : (a = (i = Ct(/-anchor-gutter$/)) == null ? void 0 : i.value) != null ? a : "");
  }
}
function xn(e, t, r = !0, o = void 0) {
  var n;
  if (e) {
    let i = e.offsetParent ? { width: e.offsetWidth, height: e.offsetHeight } : Br(e), a = t.offsetHeight, s = t.getBoundingClientRect(), l = zr(), c, p, h = o ?? "top";
    if (!o && s.top + a + i.height > l.height ? (c = -1 * i.height, h = "bottom", s.top + c < 0 && (c = -1 * s.top)) : c = a, i.width > l.width ? p = s.left * -1 : s.left + i.width > l.width ? p = (s.left + i.width - l.width) * -1 : p = 0, e.style.top = c + "px", e.style.insetInlineStart = p + "px", e.style.transformOrigin = h, r) {
      let d = (n = Ct(/-anchor-gutter$/)) == null ? void 0 : n.value;
      e.style.marginTop = h === "bottom" ? `calc(${d ?? "2px"} * -1)` : d ?? "";
    }
  }
}
function Ur(e) {
  if (e) {
    let t = e.parentNode;
    return t && t instanceof ShadowRoot && t.host && (t = t.host), t;
  }
  return null;
}
function wn(e) {
  return !!(e !== null && typeof e < "u" && e.nodeName && Ur(e));
}
function ut(e) {
  return typeof Element < "u" ? e instanceof Element : e !== null && typeof e == "object" && e.nodeType === 1 && typeof e.nodeName == "string";
}
function Ot(e, t = {}) {
  if (ut(e)) {
    let r = (o, n) => {
      var i, a;
      let s = (i = e?.$attrs) != null && i[o] ? [(a = e?.$attrs) == null ? void 0 : a[o]] : [];
      return [n].flat().reduce((l, c) => {
        if (c != null) {
          let p = typeof c;
          if (p === "string" || p === "number") l.push(c);
          else if (p === "object") {
            let h = Array.isArray(c) ? r(o, c) : Object.entries(c).map(([d, f]) => o === "style" && (f || f === 0) ? `${d.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}:${f}` : f ? d : void 0);
            l = h.length ? l.concat(h.filter((d) => !!d)) : l;
          }
        }
        return l;
      }, s);
    };
    Object.entries(t).forEach(([o, n]) => {
      if (n != null) {
        let i = o.match(/^on(.+)/);
        i ? e.addEventListener(i[1].toLowerCase(), n) : o === "p-bind" || o === "pBind" ? Ot(e, n) : (n = o === "class" ? [...new Set(r("class", n))].join(" ").trim() : o === "style" ? r("style", n).join(";").trim() : n, (e.$attrs = e.$attrs || {}) && (e.$attrs[o] = n), e.setAttribute(o, n));
      }
    });
  }
}
function Fr(e, t) {
  return ut(e) ? e.matches(t) ? e : e.querySelector(t) : null;
}
function Wr(e, t = []) {
  let r = Ur(e);
  return r === null ? t : Wr(r, t.concat([r]));
}
function kn(e) {
  let t = [];
  if (e) {
    let r = Wr(e), o = /(auto|scroll)/, n = (i) => {
      try {
        let a = window.getComputedStyle(i, null);
        return o.test(a.getPropertyValue("overflow")) || o.test(a.getPropertyValue("overflowX")) || o.test(a.getPropertyValue("overflowY"));
      } catch {
        return !1;
      }
    };
    for (let i of r) {
      let a = i.nodeType === 1 && i.dataset.scrollselectors;
      if (a) {
        let s = a.split(",");
        for (let l of s) {
          let c = Fr(i, l);
          c && n(c) && t.push(c);
        }
      }
      i.nodeType !== 9 && n(i) && t.push(i);
    }
  }
  return t;
}
function Kr() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function Sn() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}
function _n(e, t = "", r) {
  ut(e) && r !== null && r !== void 0 && e.setAttribute(t, r);
}
function $n() {
  let e = [], t = (a, s, l = 999) => {
    let c = n(a, s, l), p = c.value + (c.key === a ? 0 : l) + 1;
    return e.push({ key: a, value: p }), p;
  }, r = (a) => {
    e = e.filter((s) => s.value !== a);
  }, o = (a, s) => n(a).value, n = (a, s, l = 0) => [...e].reverse().find((c) => !0) || { key: a, value: l }, i = (a) => a && parseInt(a.style.zIndex, 10) || 0;
  return { get: i, set: (a, s, l) => {
    s && (s.style.zIndex = String(t(a, !0, l)));
  }, clear: (a) => {
    a && (r(i(a)), a.style.zIndex = "");
  }, getCurrent: (a) => o(a) };
}
var wt = $n(), Cn = Object.defineProperty, On = Object.defineProperties, Tn = Object.getOwnPropertyDescriptors, st = Object.getOwnPropertySymbols, Gr = Object.prototype.hasOwnProperty, Yr = Object.prototype.propertyIsEnumerable, Jt = (e, t, r) => t in e ? Cn(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, he = (e, t) => {
  for (var r in t || (t = {})) Gr.call(t, r) && Jt(e, r, t[r]);
  if (st) for (var r of st(t)) Yr.call(t, r) && Jt(e, r, t[r]);
  return e;
}, kt = (e, t) => On(e, Tn(t)), ge = (e, t) => {
  var r = {};
  for (var o in e) Gr.call(e, o) && t.indexOf(o) < 0 && (r[o] = e[o]);
  if (e != null && st) for (var o of st(e)) t.indexOf(o) < 0 && Yr.call(e, o) && (r[o] = e[o]);
  return r;
}, Ln = Vt(), q = Ln, Be = /{([^}]*)}/g, Xr = /(\d+\s+[\+\-\*\/]\s+\d+)/g, qr = /var\([^)]+\)/g;
function er(e) {
  return me(e) ? e.replace(/[A-Z]/g, (t, r) => r === 0 ? t : "." + t.toLowerCase()).toLowerCase() : e;
}
function Pn(e) {
  return we(e) && e.hasOwnProperty("$value") && e.hasOwnProperty("$type") ? e.$value : e;
}
function En(e) {
  return e.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function Tt(e = "", t = "") {
  return En(`${me(e, !1) && me(t, !1) ? `${e}-` : e}${t}`);
}
function Zr(e = "", t = "") {
  return `--${Tt(e, t)}`;
}
function Nn(e = "") {
  let t = (e.match(/{/g) || []).length, r = (e.match(/}/g) || []).length;
  return (t + r) % 2 !== 0;
}
function Qr(e, t = "", r = "", o = [], n) {
  if (me(e)) {
    let i = e.trim();
    if (Nn(i)) return;
    if ($e(i, Be)) {
      let a = i.replaceAll(Be, (s) => {
        let l = s.replace(/{|}/g, "").split(".").filter((c) => !o.some((p) => $e(c, p)));
        return `var(${Zr(r, Ir(l.join("-")))}${j(n) ? `, ${n}` : ""})`;
      });
      return $e(a.replace(qr, "0"), Xr) ? `calc(${a})` : a;
    }
    return i;
  } else if (un(e)) return e;
}
function An(e, t, r) {
  me(t, !1) && e.push(`${t}:${r};`);
}
function Ae(e, t) {
  return e ? `${e}{${t}}` : "";
}
function Jr(e, t) {
  if (e.indexOf("dt(") === -1) return e;
  function r(a, s) {
    let l = [], c = 0, p = "", h = null, d = 0;
    for (; c <= a.length; ) {
      let f = a[c];
      if ((f === '"' || f === "'" || f === "`") && a[c - 1] !== "\\" && (h = h === f ? null : f), !h && (f === "(" && d++, f === ")" && d--, (f === "," || c === a.length) && d === 0)) {
        let S = p.trim();
        S.startsWith("dt(") ? l.push(Jr(S, s)) : l.push(o(S)), p = "", c++;
        continue;
      }
      f !== void 0 && (p += f), c++;
    }
    return l;
  }
  function o(a) {
    let s = a[0];
    if ((s === '"' || s === "'" || s === "`") && a[a.length - 1] === s) return a.slice(1, -1);
    let l = Number(a);
    return isNaN(l) ? a : l;
  }
  let n = [], i = [];
  for (let a = 0; a < e.length; a++) if (e[a] === "d" && e.slice(a, a + 3) === "dt(") i.push(a), a += 2;
  else if (e[a] === ")" && i.length > 0) {
    let s = i.pop();
    i.length === 0 && n.push([s, a]);
  }
  if (!n.length) return e;
  for (let a = n.length - 1; a >= 0; a--) {
    let [s, l] = n[a], c = e.slice(s + 3, l), p = r(c, t), h = t(...p);
    e = e.slice(0, s) + h + e.slice(l + 1);
  }
  return e;
}
var Ce = (...e) => Vn(D.getTheme(), ...e), Vn = (e = {}, t, r, o) => {
  if (t) {
    let { variable: n, options: i } = D.defaults || {}, { prefix: a, transform: s } = e?.options || i || {}, l = $e(t, Be) ? t : `{${t}}`;
    return o === "value" || At(o) && s === "strict" ? D.getTokenValue(t) : Qr(l, void 0, a, [n.excludedKeyRegex], r);
  }
  return "";
};
function tt(e, ...t) {
  if (e instanceof Array) {
    let r = e.reduce((o, n, i) => {
      var a;
      return o + n + ((a = ce(t[i], { dt: Ce })) != null ? a : "");
    }, "");
    return Jr(r, Ce);
  }
  return ce(e, { dt: Ce });
}
function Mn(e, t = {}) {
  let r = D.defaults.variable, { prefix: o = r.prefix, selector: n = r.selector, excludedKeyRegex: i = r.excludedKeyRegex } = t, a = [], s = [], l = [{ node: e, path: o }];
  for (; l.length; ) {
    let { node: p, path: h } = l.pop();
    for (let d in p) {
      let f = p[d], S = Pn(f), $ = $e(d, i) ? Tt(h) : Tt(h, Ir(d));
      if (we(S)) l.push({ node: S, path: $ });
      else {
        let _ = Zr($), w = Qr(S, $, o, [i]);
        An(s, _, w);
        let L = $;
        o && L.startsWith(o + "-") && (L = L.slice(o.length + 1)), a.push(L.replace(/-/g, "."));
      }
    }
  }
  let c = s.join("");
  return { value: s, tokens: a, declarations: c, css: Ae(n, c) };
}
var ue = { regex: { rules: { class: { pattern: /^\.([a-zA-Z][\w-]*)$/, resolve(e) {
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
  let t = Object.keys(this.rules).filter((r) => r !== "custom").map((r) => this.rules[r]);
  return [e].flat().map((r) => {
    var o;
    return (o = t.map((n) => n.resolve(r)).find((n) => n.matched)) != null ? o : this.rules.custom.resolve(r);
  });
} }, _toVariables(e, t) {
  return Mn(e, { prefix: t?.prefix });
}, getCommon({ name: e = "", theme: t = {}, params: r, set: o, defaults: n }) {
  var i, a, s, l, c, p, h;
  let { preset: d, options: f } = t, S, $, _, w, L, G, V;
  if (j(d) && f.transform !== "strict") {
    let { primitive: oe, semantic: B, extend: ne } = d, ie = B || {}, { colorScheme: F } = ie, ee = ge(ie, ["colorScheme"]), Y = ne || {}, { colorScheme: ae } = Y, Q = ge(Y, ["colorScheme"]), J = F || {}, { dark: te } = J, X = ge(J, ["dark"]), se = ae || {}, { dark: g } = se, b = ge(se, ["dark"]), x = j(oe) ? this._toVariables({ primitive: oe }, f) : {}, M = j(ee) ? this._toVariables({ semantic: ee }, f) : {}, H = j(X) ? this._toVariables({ light: X }, f) : {}, z = j(te) ? this._toVariables({ dark: te }, f) : {}, W = j(Q) ? this._toVariables({ semantic: Q }, f) : {}, ye = j(b) ? this._toVariables({ light: b }, f) : {}, xe = j(g) ? this._toVariables({ dark: g }, f) : {}, [Me, Oe] = [(i = x.declarations) != null ? i : "", x.tokens], [dt, Te] = [(a = M.declarations) != null ? a : "", M.tokens || []], [ht, Ye] = [(s = H.declarations) != null ? s : "", H.tokens || []], [ft, mt] = [(l = z.declarations) != null ? l : "", z.tokens || []], [Xe, vt] = [(c = W.declarations) != null ? c : "", W.tokens || []], [gt, bt] = [(p = ye.declarations) != null ? p : "", ye.tokens || []], [ke, yt] = [(h = xe.declarations) != null ? h : "", xe.tokens || []];
    S = this.transformCSS(e, Me, "light", "variable", f, o, n), $ = Oe;
    let pe = this.transformCSS(e, `${dt}${ht}`, "light", "variable", f, o, n), qe = this.transformCSS(e, `${ft}`, "dark", "variable", f, o, n);
    _ = `${pe}${qe}`, w = [.../* @__PURE__ */ new Set([...Te, ...Ye, ...mt])];
    let Se = this.transformCSS(e, `${Xe}${gt}color-scheme:light`, "light", "variable", f, o, n), Ze = this.transformCSS(e, `${ke}color-scheme:dark`, "dark", "variable", f, o, n);
    L = `${Se}${Ze}`, G = [.../* @__PURE__ */ new Set([...vt, ...bt, ...yt])], V = ce(d.css, { dt: Ce });
  }
  return { primitive: { css: S, tokens: $ }, semantic: { css: _, tokens: w }, global: { css: L, tokens: G }, style: V };
}, getPreset({ name: e = "", preset: t = {}, options: r, params: o, set: n, defaults: i, selector: a }) {
  var s, l, c;
  let p, h, d;
  if (j(t) && r.transform !== "strict") {
    let f = e.replace("-directive", ""), S = t, { colorScheme: $, extend: _, css: w } = S, L = ge(S, ["colorScheme", "extend", "css"]), G = _ || {}, { colorScheme: V } = G, oe = ge(G, ["colorScheme"]), B = $ || {}, { dark: ne } = B, ie = ge(B, ["dark"]), F = V || {}, { dark: ee } = F, Y = ge(F, ["dark"]), ae = j(L) ? this._toVariables({ [f]: he(he({}, L), oe) }, r) : {}, Q = j(ie) ? this._toVariables({ [f]: he(he({}, ie), Y) }, r) : {}, J = j(ne) ? this._toVariables({ [f]: he(he({}, ne), ee) }, r) : {}, [te, X] = [(s = ae.declarations) != null ? s : "", ae.tokens || []], [se, g] = [(l = Q.declarations) != null ? l : "", Q.tokens || []], [b, x] = [(c = J.declarations) != null ? c : "", J.tokens || []], M = this.transformCSS(f, `${te}${se}`, "light", "variable", r, n, i, a), H = this.transformCSS(f, b, "dark", "variable", r, n, i, a);
    p = `${M}${H}`, h = [.../* @__PURE__ */ new Set([...X, ...g, ...x])], d = ce(w, { dt: Ce });
  }
  return { css: p, tokens: h, style: d };
}, getPresetC({ name: e = "", theme: t = {}, params: r, set: o, defaults: n }) {
  var i;
  let { preset: a, options: s } = t, l = (i = a?.components) == null ? void 0 : i[e];
  return this.getPreset({ name: e, preset: l, options: s, params: r, set: o, defaults: n });
}, getPresetD({ name: e = "", theme: t = {}, params: r, set: o, defaults: n }) {
  var i, a;
  let s = e.replace("-directive", ""), { preset: l, options: c } = t, p = ((i = l?.components) == null ? void 0 : i[s]) || ((a = l?.directives) == null ? void 0 : a[s]);
  return this.getPreset({ name: s, preset: p, options: c, params: r, set: o, defaults: n });
}, applyDarkColorScheme(e) {
  return !(e.darkModeSelector === "none" || e.darkModeSelector === !1);
}, getColorSchemeOption(e, t) {
  var r;
  return this.applyDarkColorScheme(e) ? this.regex.resolve(e.darkModeSelector === !0 ? t.options.darkModeSelector : (r = e.darkModeSelector) != null ? r : t.options.darkModeSelector) : [];
}, getLayerOrder(e, t = {}, r, o) {
  let { cssLayer: n } = t;
  return n ? `@layer ${ce(n.order || n.name || "primeui", r)}` : "";
}, getCommonStyleSheet({ name: e = "", theme: t = {}, params: r, props: o = {}, set: n, defaults: i }) {
  let a = this.getCommon({ name: e, theme: t, params: r, set: n, defaults: i }), s = Object.entries(o).reduce((l, [c, p]) => l.push(`${c}="${p}"`) && l, []).join(" ");
  return Object.entries(a || {}).reduce((l, [c, p]) => {
    if (we(p) && Object.hasOwn(p, "css")) {
      let h = Ie(p.css), d = `${c}-variables`;
      l.push(`<style type="text/css" data-primevue-style-id="${d}" ${s}>${h}</style>`);
    }
    return l;
  }, []).join("");
}, getStyleSheet({ name: e = "", theme: t = {}, params: r, props: o = {}, set: n, defaults: i }) {
  var a;
  let s = { name: e, theme: t, params: r, set: n, defaults: i }, l = (a = e.includes("-directive") ? this.getPresetD(s) : this.getPresetC(s)) == null ? void 0 : a.css, c = Object.entries(o).reduce((p, [h, d]) => p.push(`${h}="${d}"`) && p, []).join(" ");
  return l ? `<style type="text/css" data-primevue-style-id="${e}-variables" ${c}>${Ie(l)}</style>` : "";
}, createTokens(e = {}, t, r = "", o = "", n = {}) {
  let i = function(s, l = {}, c = []) {
    if (c.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: s, path: this.path, paths: l, value: void 0 };
    c.push(this.path), l.name = this.path, l.binding || (l.binding = {});
    let p = this.value;
    if (typeof this.value == "string" && Be.test(this.value)) {
      let h = this.value.trim().replace(Be, (d) => {
        var f;
        let S = d.slice(1, -1), $ = this.tokens[S];
        if (!$) return console.warn(`Token not found for path: ${S}`), "__UNRESOLVED__";
        let _ = $.computed(s, l, c);
        return Array.isArray(_) && _.length === 2 ? `light-dark(${_[0].value},${_[1].value})` : (f = _?.value) != null ? f : "__UNRESOLVED__";
      });
      p = Xr.test(h.replace(qr, "0")) ? `calc(${h})` : h;
    }
    return At(l.binding) && delete l.binding, c.pop(), { colorScheme: s, path: this.path, paths: l, value: p.includes("__UNRESOLVED__") ? void 0 : p };
  }, a = (s, l, c) => {
    Object.entries(s).forEach(([p, h]) => {
      let d = $e(p, t.variable.excludedKeyRegex) ? l : l ? `${l}.${er(p)}` : er(p), f = c ? `${c}.${p}` : p;
      we(h) ? a(h, d, f) : (n[d] || (n[d] = { paths: [], computed: (S, $ = {}, _ = []) => {
        if (n[d].paths.length === 1) return n[d].paths[0].computed(n[d].paths[0].scheme, $.binding, _);
        if (S && S !== "none") for (let w = 0; w < n[d].paths.length; w++) {
          let L = n[d].paths[w];
          if (L.scheme === S) return L.computed(S, $.binding, _);
        }
        return n[d].paths.map((w) => w.computed(w.scheme, $[w.scheme], _));
      } }), n[d].paths.push({ path: f, value: h, scheme: f.includes("colorScheme.light") ? "light" : f.includes("colorScheme.dark") ? "dark" : "none", computed: i, tokens: n }));
    });
  };
  return a(e, r, o), n;
}, getTokenValue(e, t, r) {
  var o;
  let n = ((s) => s.split(".").filter((l) => !$e(l.toLowerCase(), r.variable.excludedKeyRegex)).join("."))(t), i = t.includes("colorScheme.light") ? "light" : t.includes("colorScheme.dark") ? "dark" : void 0, a = [(o = e[n]) == null ? void 0 : o.computed(i)].flat().filter((s) => s);
  return a.length === 1 ? a[0].value : a.reduce((s = {}, l) => {
    let c = l, { colorScheme: p } = c, h = ge(c, ["colorScheme"]);
    return s[p] = h, s;
  }, void 0);
}, getSelectorRule(e, t, r, o) {
  return r === "class" || r === "attr" ? Ae(j(t) ? `${e}${t},${e} ${t}` : e, o) : Ae(e, Ae(t ?? ":root,:host", o));
}, transformCSS(e, t, r, o, n = {}, i, a, s) {
  if (j(t)) {
    let { cssLayer: l } = n;
    if (o !== "style") {
      let c = this.getColorSchemeOption(n, a);
      t = r === "dark" ? c.reduce((p, { type: h, selector: d }) => (j(d) && (p += d.includes("[CSS]") ? d.replace("[CSS]", t) : this.getSelectorRule(d, s, h, t)), p), "") : Ae(s ?? ":root,:host", t);
    }
    if (l) {
      let c = { name: "primeui" };
      we(l) && (c.name = ce(l.name, { name: e, type: o })), j(c.name) && (t = Ae(`@layer ${c.name}`, t), i?.layerNames(c.name));
    }
    return t;
  }
  return "";
} }, D = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(e = {}) {
  let { theme: t } = e;
  t && (this._theme = kt(he({}, t), { options: he(he({}, this.defaults.options), t.options) }), this._tokens = ue.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
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
  this.update({ theme: e }), q.emit("theme:change", e);
}, getPreset() {
  return this.preset;
}, setPreset(e) {
  this._theme = kt(he({}, this.theme), { preset: e }), this._tokens = ue.createTokens(e, this.defaults), this.clearLoadedStyleNames(), q.emit("preset:change", e), q.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(e) {
  this._theme = kt(he({}, this.theme), { options: e }), this.clearLoadedStyleNames(), q.emit("options:change", e), q.emit("theme:change", this.theme);
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
  return ue.getTokenValue(this.tokens, e, this.defaults);
}, getCommon(e = "", t) {
  return ue.getCommon({ name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getComponent(e = "", t) {
  let r = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return ue.getPresetC(r);
}, getDirective(e = "", t) {
  let r = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return ue.getPresetD(r);
}, getCustomPreset(e = "", t, r, o) {
  let n = { name: e, preset: t, options: this.options, selector: r, params: o, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return ue.getPreset(n);
}, getLayerOrderCSS(e = "") {
  return ue.getLayerOrder(e, this.options, { names: this.getLayerNames() }, this.defaults);
}, transformCSS(e = "", t, r = "style", o) {
  return ue.transformCSS(e, t, o, r, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
}, getCommonStyleSheet(e = "", t, r = {}) {
  return ue.getCommonStyleSheet({ name: e, theme: this.theme, params: t, props: r, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getStyleSheet(e, t, r = {}) {
  return ue.getStyleSheet({ name: e, theme: this.theme, params: t, props: r, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, onStyleMounted(e) {
  this._loadingStyles.add(e);
}, onStyleUpdated(e) {
  this._loadingStyles.add(e);
}, onStyleLoaded(e, { name: t }) {
  this._loadingStyles.size && (this._loadingStyles.delete(t), q.emit(`theme:${t}:load`, e), !this._loadingStyles.size && q.emit("theme:load"));
} }, K = {
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
}, jn = `
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
function ze(e) {
  "@babel/helpers - typeof";
  return ze = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ze(e);
}
function tr(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(n) {
      return Object.getOwnPropertyDescriptor(e, n).enumerable;
    })), r.push.apply(r, o);
  }
  return r;
}
function rr(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2 ? tr(Object(r), !0).forEach(function(o) {
      Rn(e, o, r[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r)) : tr(Object(r)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(r, o));
    });
  }
  return e;
}
function Rn(e, t, r) {
  return (t = Dn(t)) in e ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = r, e;
}
function Dn(e) {
  var t = Hn(e, "string");
  return ze(t) == "symbol" ? t : t + "";
}
function Hn(e, t) {
  if (ze(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var o = r.call(e, t);
    if (ze(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function In(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  Ut() && Ut().components ? pt(e) : t ? e() : vo(e);
}
var Bn = 0;
function zn(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = A(!1), o = A(e), n = A(null), i = Kr() ? window.document : void 0, a = t.document, s = a === void 0 ? i : a, l = t.immediate, c = l === void 0 ? !0 : l, p = t.manual, h = p === void 0 ? !1 : p, d = t.name, f = d === void 0 ? "style_".concat(++Bn) : d, S = t.id, $ = S === void 0 ? void 0 : S, _ = t.media, w = _ === void 0 ? void 0 : _, L = t.nonce, G = L === void 0 ? void 0 : L, V = t.first, oe = V === void 0 ? !1 : V, B = t.onMounted, ne = B === void 0 ? void 0 : B, ie = t.onUpdated, F = ie === void 0 ? void 0 : ie, ee = t.onLoad, Y = ee === void 0 ? void 0 : ee, ae = t.props, Q = ae === void 0 ? {} : ae, J = function() {
  }, te = function(g) {
    var b = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (s) {
      var x = rr(rr({}, Q), b), M = x.name || f, H = x.id || $, z = x.nonce || G;
      n.value = s.querySelector('style[data-primevue-style-id="'.concat(M, '"]')) || s.getElementById(H) || s.createElement("style"), n.value.isConnected || (o.value = g || e, Ot(n.value, {
        type: "text/css",
        id: H,
        media: w,
        nonce: z
      }), oe ? s.head.prepend(n.value) : s.head.appendChild(n.value), _n(n.value, "data-primevue-style-id", M), Ot(n.value, x), n.value.onload = function(W) {
        return Y?.(W, {
          name: M
        });
      }, ne?.(M)), !r.value && (J = be(o, function(W) {
        n.value.textContent = W, F?.(M);
      }, {
        immediate: !0
      }), r.value = !0);
    }
  }, X = function() {
    !s || !r.value || (J(), wn(n.value) && s.head.removeChild(n.value), r.value = !1, n.value = null);
  };
  return c && !h && In(te), {
    id: $,
    name: f,
    el: n,
    css: o,
    unload: X,
    load: te,
    isLoaded: mo(r)
  };
}
function Ue(e) {
  "@babel/helpers - typeof";
  return Ue = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ue(e);
}
var or, nr, ir, ar;
function sr(e, t) {
  return Kn(e) || Wn(e, t) || Fn(e, t) || Un();
}
function Un() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Fn(e, t) {
  if (e) {
    if (typeof e == "string") return lr(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return r === "Object" && e.constructor && (r = e.constructor.name), r === "Map" || r === "Set" ? Array.from(e) : r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? lr(e, t) : void 0;
  }
}
function lr(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, o = Array(t); r < t; r++) o[r] = e[r];
  return o;
}
function Wn(e, t) {
  var r = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (r != null) {
    var o, n, i, a, s = [], l = !0, c = !1;
    try {
      if (i = (r = r.call(e)).next, t !== 0) for (; !(l = (o = i.call(r)).done) && (s.push(o.value), s.length !== t); l = !0) ;
    } catch (p) {
      c = !0, n = p;
    } finally {
      try {
        if (!l && r.return != null && (a = r.return(), Object(a) !== a)) return;
      } finally {
        if (c) throw n;
      }
    }
    return s;
  }
}
function Kn(e) {
  if (Array.isArray(e)) return e;
}
function cr(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(n) {
      return Object.getOwnPropertyDescriptor(e, n).enumerable;
    })), r.push.apply(r, o);
  }
  return r;
}
function St(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2 ? cr(Object(r), !0).forEach(function(o) {
      Gn(e, o, r[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r)) : cr(Object(r)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(r, o));
    });
  }
  return e;
}
function Gn(e, t, r) {
  return (t = Yn(t)) in e ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = r, e;
}
function Yn(e) {
  var t = Xn(e, "string");
  return Ue(t) == "symbol" ? t : t + "";
}
function Xn(e, t) {
  if (Ue(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var o = r.call(e, t);
    if (Ue(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function rt(e, t) {
  return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var qn = function(t) {
  var r = t.dt;
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
    padding-right: `.concat(r("scrollbar.width"), `;
}
`);
}, Zn = {}, Qn = {}, Z = {
  name: "base",
  css: qn,
  style: jn,
  classes: Zn,
  inlineStyles: Qn,
  load: function(t) {
    var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(i) {
      return i;
    }, n = o(tt(or || (or = rt(["", ""])), t));
    return j(n) ? zn(Ie(n), St({
      name: this.name
    }, r)) : {};
  },
  loadCSS: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    return this.load(this.css, t);
  },
  loadStyle: function() {
    var t = this, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
    return this.load(this.style, r, function() {
      var n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
      return D.transformCSS(r.name || t.name, "".concat(n).concat(tt(nr || (nr = rt(["", ""])), o)));
    });
  },
  getCommonTheme: function(t) {
    return D.getCommon(this.name, t);
  },
  getComponentTheme: function(t) {
    return D.getComponent(this.name, t);
  },
  getDirectiveTheme: function(t) {
    return D.getDirective(this.name, t);
  },
  getPresetTheme: function(t, r, o) {
    return D.getCustomPreset(this.name, t, r, o);
  },
  getLayerOrderThemeCSS: function() {
    return D.getLayerOrderCSS(this.name);
  },
  getStyleSheet: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.css) {
      var o = ce(this.css, {
        dt: Ce
      }) || "", n = Ie(tt(ir || (ir = rt(["", "", ""])), o, t)), i = Object.entries(r).reduce(function(a, s) {
        var l = sr(s, 2), c = l[0], p = l[1];
        return a.push("".concat(c, '="').concat(p, '"')) && a;
      }, []).join(" ");
      return j(n) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(i, ">").concat(n, "</style>") : "";
    }
    return "";
  },
  getCommonThemeStyleSheet: function(t) {
    var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return D.getCommonStyleSheet(this.name, t, r);
  },
  getThemeStyleSheet: function(t) {
    var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = [D.getStyleSheet(this.name, t, r)];
    if (this.style) {
      var n = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), i = tt(ar || (ar = rt(["", ""])), ce(this.style, {
        dt: Ce
      })), a = Ie(D.transformCSS(n, i)), s = Object.entries(r).reduce(function(l, c) {
        var p = sr(c, 2), h = p[0], d = p[1];
        return l.push("".concat(h, '="').concat(d, '"')) && l;
      }, []).join(" ");
      j(a) && o.push('<style type="text/css" data-primevue-style-id="'.concat(n, '" ').concat(s, ">").concat(a, "</style>"));
    }
    return o.join("");
  },
  extend: function(t) {
    return St(St({}, this), {}, {
      css: void 0,
      style: void 0
    }, t);
  }
}, ot = Vt();
function Fe(e) {
  "@babel/helpers - typeof";
  return Fe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Fe(e);
}
function pr(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(n) {
      return Object.getOwnPropertyDescriptor(e, n).enumerable;
    })), r.push.apply(r, o);
  }
  return r;
}
function nt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2 ? pr(Object(r), !0).forEach(function(o) {
      Jn(e, o, r[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r)) : pr(Object(r)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(r, o));
    });
  }
  return e;
}
function Jn(e, t, r) {
  return (t = ei(t)) in e ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = r, e;
}
function ei(e) {
  var t = ti(e, "string");
  return Fe(t) == "symbol" ? t : t + "";
}
function ti(e, t) {
  if (Fe(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var o = r.call(e, t);
    if (Fe(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var ri = {
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
    text: [K.STARTS_WITH, K.CONTAINS, K.NOT_CONTAINS, K.ENDS_WITH, K.EQUALS, K.NOT_EQUALS],
    numeric: [K.EQUALS, K.NOT_EQUALS, K.LESS_THAN, K.LESS_THAN_OR_EQUAL_TO, K.GREATER_THAN, K.GREATER_THAN_OR_EQUAL_TO],
    date: [K.DATE_IS, K.DATE_IS_NOT, K.DATE_BEFORE, K.DATE_AFTER]
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
}, oi = Symbol();
function ni(e, t) {
  var r = {
    config: go(t)
  };
  return e.config.globalProperties.$primevue = r, e.provide(oi, r), ii(), ai(e, r), r;
}
var Ve = [];
function ii() {
  q.clear(), Ve.forEach(function(e) {
    return e?.();
  }), Ve = [];
}
function ai(e, t) {
  var r = A(!1), o = function() {
    var c;
    if (((c = t.config) === null || c === void 0 ? void 0 : c.theme) !== "none" && !D.isStyleNameLoaded("common")) {
      var p, h, d = ((p = Z.getCommonTheme) === null || p === void 0 ? void 0 : p.call(Z)) || {}, f = d.primitive, S = d.semantic, $ = d.global, _ = d.style, w = {
        nonce: (h = t.config) === null || h === void 0 || (h = h.csp) === null || h === void 0 ? void 0 : h.nonce
      };
      Z.load(f?.css, nt({
        name: "primitive-variables"
      }, w)), Z.load(S?.css, nt({
        name: "semantic-variables"
      }, w)), Z.load($?.css, nt({
        name: "global-variables"
      }, w)), Z.loadStyle(nt({
        name: "global-style"
      }, w), _), D.setLoadedStyleName("common");
    }
  };
  q.on("theme:change", function(l) {
    r.value || (e.config.globalProperties.$primevue.config.theme = l, r.value = !0);
  });
  var n = be(t.config, function(l, c) {
    ot.emit("config:change", {
      newValue: l,
      oldValue: c
    });
  }, {
    immediate: !0,
    deep: !0
  }), i = be(function() {
    return t.config.ripple;
  }, function(l, c) {
    ot.emit("config:ripple:change", {
      newValue: l,
      oldValue: c
    });
  }, {
    immediate: !0,
    deep: !0
  }), a = be(function() {
    return t.config.theme;
  }, function(l, c) {
    r.value || D.setTheme(l), t.config.unstyled || o(), r.value = !1, ot.emit("config:theme:change", {
      newValue: l,
      oldValue: c
    });
  }, {
    immediate: !0,
    deep: !1
  }), s = be(function() {
    return t.config.unstyled;
  }, function(l, c) {
    !l && t.config.theme && o(), ot.emit("config:unstyled:change", {
      newValue: l,
      oldValue: c
    });
  }, {
    immediate: !0,
    deep: !0
  });
  Ve.push(n), Ve.push(i), Ve.push(a), Ve.push(s);
}
var si = {
  install: function(t, r) {
    var o = dn(ri, r);
    ni(t, o);
  }
}, Mt = {
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
    this.mounted = Kr();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function li(e, t, r, o, n, i) {
  return i.inline ? at(e.$slots, "default", {
    key: 0
  }) : n.mounted ? (O(), De(Or, {
    key: 1,
    to: r.appendTo
  }, [at(e.$slots, "default")], 8, ["to"])) : U("", !0);
}
Mt.render = li;
var je = {
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
function ci() {
  var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pc", t = bo();
  return "".concat(e).concat(t.replace("v-", "").replaceAll("-", "_"));
}
var ur = Z.extend({
  name: "common"
});
function We(e) {
  "@babel/helpers - typeof";
  return We = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, We(e);
}
function pi(e) {
  return ro(e) || ui(e) || to(e) || eo();
}
function ui(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Re(e, t) {
  return ro(e) || di(e, t) || to(e, t) || eo();
}
function eo() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function to(e, t) {
  if (e) {
    if (typeof e == "string") return Lt(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return r === "Object" && e.constructor && (r = e.constructor.name), r === "Map" || r === "Set" ? Array.from(e) : r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? Lt(e, t) : void 0;
  }
}
function Lt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, o = Array(t); r < t; r++) o[r] = e[r];
  return o;
}
function di(e, t) {
  var r = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (r != null) {
    var o, n, i, a, s = [], l = !0, c = !1;
    try {
      if (i = (r = r.call(e)).next, t === 0) {
        if (Object(r) !== r) return;
        l = !1;
      } else for (; !(l = (o = i.call(r)).done) && (s.push(o.value), s.length !== t); l = !0) ;
    } catch (p) {
      c = !0, n = p;
    } finally {
      try {
        if (!l && r.return != null && (a = r.return(), Object(a) !== a)) return;
      } finally {
        if (c) throw n;
      }
    }
    return s;
  }
}
function ro(e) {
  if (Array.isArray(e)) return e;
}
function dr(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(n) {
      return Object.getOwnPropertyDescriptor(e, n).enumerable;
    })), r.push.apply(r, o);
  }
  return r;
}
function C(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2 ? dr(Object(r), !0).forEach(function(o) {
      He(e, o, r[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r)) : dr(Object(r)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(r, o));
    });
  }
  return e;
}
function He(e, t, r) {
  return (t = hi(t)) in e ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = r, e;
}
function hi(e) {
  var t = fi(e, "string");
  return We(t) == "symbol" ? t : t + "";
}
function fi(e, t) {
  if (We(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var o = r.call(e, t);
    if (We(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var mi = {
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
        q.off("theme:change", this._loadCoreStyles), t || (this._loadCoreStyles(), this._themeChangeListener(this._loadCoreStyles));
      }
    },
    dt: {
      immediate: !0,
      handler: function(t, r) {
        var o = this;
        q.off("theme:change", this._themeScopedListener), t ? (this._loadScopedThemeStyles(t), this._themeScopedListener = function() {
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
    var t, r, o, n, i, a, s, l, c, p, h, d = (t = this.pt) === null || t === void 0 ? void 0 : t._usept, f = d ? (r = this.pt) === null || r === void 0 || (r = r.originalValue) === null || r === void 0 ? void 0 : r[this.$.type.name] : void 0, S = d ? (o = this.pt) === null || o === void 0 || (o = o.value) === null || o === void 0 ? void 0 : o[this.$.type.name] : this.pt;
    (n = S || f) === null || n === void 0 || (n = n.hooks) === null || n === void 0 || (i = n.onBeforeCreate) === null || i === void 0 || i.call(n);
    var $ = (a = this.$primevueConfig) === null || a === void 0 || (a = a.pt) === null || a === void 0 ? void 0 : a._usept, _ = $ ? (s = this.$primevue) === null || s === void 0 || (s = s.config) === null || s === void 0 || (s = s.pt) === null || s === void 0 ? void 0 : s.originalValue : void 0, w = $ ? (l = this.$primevue) === null || l === void 0 || (l = l.config) === null || l === void 0 || (l = l.pt) === null || l === void 0 ? void 0 : l.value : (c = this.$primevue) === null || c === void 0 || (c = c.config) === null || c === void 0 ? void 0 : c.pt;
    (p = w || _) === null || p === void 0 || (p = p[this.$.type.name]) === null || p === void 0 || (p = p.hooks) === null || p === void 0 || (h = p.onBeforeCreate) === null || h === void 0 || h.call(p), this.$attrSelector = ci(), this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
  },
  created: function() {
    this._hook("onCreated");
  },
  beforeMount: function() {
    var t;
    this.rootEl = Fr(ut(this.$el) ? this.$el : (t = this.$el) === null || t === void 0 ? void 0 : t.parentElement, "[".concat(this.$attrSelector, "]")), this.rootEl && (this.rootEl.$pc = C({
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
        var r = this._usePT(this._getPT(this.pt, this.$.type.name), this._getOptionValue, "hooks.".concat(t)), o = this._useDefaultPT(this._getOptionValue, "hooks.".concat(t));
        r?.(), o?.();
      }
    },
    _mergeProps: function(t) {
      for (var r = arguments.length, o = new Array(r > 1 ? r - 1 : 0), n = 1; n < r; n++)
        o[n - 1] = arguments[n];
      return Rr(t) ? t.apply(void 0, o) : re.apply(void 0, o);
    },
    _load: function() {
      je.isStyleNameLoaded("base") || (Z.loadCSS(this.$styleOptions), this._loadGlobalStyles(), je.setLoadedStyleName("base")), this._loadThemeStyles();
    },
    _loadStyles: function() {
      this._load(), this._themeChangeListener(this._load);
    },
    _loadCoreStyles: function() {
      var t, r;
      !je.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (r = this.$style) !== null && r !== void 0 && r.name && (ur.loadCSS(this.$styleOptions), this.$options.style && this.$style.loadCSS(this.$styleOptions), je.setLoadedStyleName(this.$style.name));
    },
    _loadGlobalStyles: function() {
      var t = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
      j(t) && Z.load(t, C({
        name: "global"
      }, this.$styleOptions));
    },
    _loadThemeStyles: function() {
      var t, r;
      if (!(this.isUnstyled || this.$theme === "none")) {
        if (!D.isStyleNameLoaded("common")) {
          var o, n, i = ((o = this.$style) === null || o === void 0 || (n = o.getCommonTheme) === null || n === void 0 ? void 0 : n.call(o)) || {}, a = i.primitive, s = i.semantic, l = i.global, c = i.style;
          Z.load(a?.css, C({
            name: "primitive-variables"
          }, this.$styleOptions)), Z.load(s?.css, C({
            name: "semantic-variables"
          }, this.$styleOptions)), Z.load(l?.css, C({
            name: "global-variables"
          }, this.$styleOptions)), Z.loadStyle(C({
            name: "global-style"
          }, this.$styleOptions), c), D.setLoadedStyleName("common");
        }
        if (!D.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (r = this.$style) !== null && r !== void 0 && r.name) {
          var p, h, d, f, S = ((p = this.$style) === null || p === void 0 || (h = p.getComponentTheme) === null || h === void 0 ? void 0 : h.call(p)) || {}, $ = S.css, _ = S.style;
          (d = this.$style) === null || d === void 0 || d.load($, C({
            name: "".concat(this.$style.name, "-variables")
          }, this.$styleOptions)), (f = this.$style) === null || f === void 0 || f.loadStyle(C({
            name: "".concat(this.$style.name, "-style")
          }, this.$styleOptions), _), D.setLoadedStyleName(this.$style.name);
        }
        if (!D.isStyleNameLoaded("layer-order")) {
          var w, L, G = (w = this.$style) === null || w === void 0 || (L = w.getLayerOrderThemeCSS) === null || L === void 0 ? void 0 : L.call(w);
          Z.load(G, C({
            name: "layer-order",
            first: !0
          }, this.$styleOptions)), D.setLoadedStyleName("layer-order");
        }
      }
    },
    _loadScopedThemeStyles: function(t) {
      var r, o, n, i = ((r = this.$style) === null || r === void 0 || (o = r.getPresetTheme) === null || o === void 0 ? void 0 : o.call(r, t, "[".concat(this.$attrSelector, "]"))) || {}, a = i.css, s = (n = this.$style) === null || n === void 0 ? void 0 : n.load(a, C({
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
      je.clearLoadedStyleNames(), q.on("theme:change", t);
    },
    _removeThemeListeners: function() {
      q.off("theme:change", this._loadCoreStyles), q.off("theme:change", this._load), q.off("theme:change", this._themeScopedListener);
    },
    _getHostInstance: function(t) {
      return t ? this.$options.hostName ? t.$.type.name === this.$options.hostName ? t : this._getHostInstance(t.$parentInstance) : t.$parentInstance : void 0;
    },
    _getPropValue: function(t) {
      var r;
      return this[t] || ((r = this._getHostInstance(this)) === null || r === void 0 ? void 0 : r[t]);
    },
    _getOptionValue: function(t) {
      var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return Hr(t, r, o);
    },
    _getPTValue: function() {
      var t, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, i = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, a = /./g.test(o) && !!n[o.split(".")[0]], s = this._getPropValue("ptOptions") || ((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.ptOptions) || {}, l = s.mergeSections, c = l === void 0 ? !0 : l, p = s.mergeProps, h = p === void 0 ? !1 : p, d = i ? a ? this._useGlobalPT(this._getPTClassValue, o, n) : this._useDefaultPT(this._getPTClassValue, o, n) : void 0, f = a ? void 0 : this._getPTSelf(r, this._getPTClassValue, o, C(C({}, n), {}, {
        global: d || {}
      })), S = this._getPTDatasets(o);
      return c || !c && f ? h ? this._mergeProps(h, d, f, S) : C(C(C({}, d), f), S) : C(C({}, f), S);
    },
    _getPTSelf: function() {
      for (var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length, o = new Array(r > 1 ? r - 1 : 0), n = 1; n < r; n++)
        o[n - 1] = arguments[n];
      return re(
        this._usePT.apply(this, [this._getPT(t, this.$name)].concat(o)),
        // Exp; <component :pt="{}"
        this._usePT.apply(this, [this.$_attrsPT].concat(o))
        // Exp; <component :pt:[passthrough_key]:[attribute]="{value}" or <component :pt:[passthrough_key]="() =>{value}"
      );
    },
    _getPTDatasets: function() {
      var t, r, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = "data-pc-", i = o === "root" && j((t = this.pt) === null || t === void 0 ? void 0 : t["data-pc-section"]);
      return o !== "transition" && C(C({}, o === "root" && C(C(He({}, "".concat(n, "name"), _e(i ? (r = this.pt) === null || r === void 0 ? void 0 : r["data-pc-section"] : this.$.type.name)), i && He({}, "".concat(n, "extend"), _e(this.$.type.name))), {}, He({}, "".concat(this.$attrSelector), ""))), {}, He({}, "".concat(n, "section"), _e(o)));
    },
    _getPTClassValue: function() {
      var t = this._getOptionValue.apply(this, arguments);
      return me(t) || pn(t) ? {
        class: t
      } : t;
    },
    _getPT: function(t) {
      var r = this, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", n = arguments.length > 2 ? arguments[2] : void 0, i = function(s) {
        var l, c = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, p = n ? n(s) : s, h = _e(o), d = _e(r.$name);
        return (l = c ? h !== d ? p?.[h] : void 0 : p?.[h]) !== null && l !== void 0 ? l : p;
      };
      return t != null && t.hasOwnProperty("_usept") ? {
        _usept: t._usept,
        originalValue: i(t.originalValue),
        value: i(t.value)
      } : i(t, !0);
    },
    _usePT: function(t, r, o, n) {
      var i = function($) {
        return r($, o, n);
      };
      if (t != null && t.hasOwnProperty("_usept")) {
        var a, s = t._usept || ((a = this.$primevueConfig) === null || a === void 0 ? void 0 : a.ptOptions) || {}, l = s.mergeSections, c = l === void 0 ? !0 : l, p = s.mergeProps, h = p === void 0 ? !1 : p, d = i(t.originalValue), f = i(t.value);
        return d === void 0 && f === void 0 ? void 0 : me(f) ? f : me(d) ? d : c || !c && f ? h ? this._mergeProps(h, d, f) : C(C({}, d), f) : f;
      }
      return i(t);
    },
    _useGlobalPT: function(t, r, o) {
      return this._usePT(this.globalPT, t, r, o);
    },
    _useDefaultPT: function(t, r, o) {
      return this._usePT(this.defaultPT, t, r, o);
    },
    ptm: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this._getPTValue(this.pt, t, C(C({}, this.$params), r));
    },
    ptmi: function() {
      var t, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = re(this.$_attrsWithoutPT, this.ptm(r, o));
      return n?.hasOwnProperty("id") && ((t = n.id) !== null && t !== void 0 || (n.id = this.$id)), n;
    },
    ptmo: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return this._getPTValue(t, r, C({
        instance: this
      }, o), !1);
    },
    cx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this.isUnstyled ? void 0 : this._getOptionValue(this.$style.classes, t, C(C({}, this.$params), r));
    },
    sx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      if (r) {
        var n = this._getOptionValue(this.$style.inlineStyles, t, C(C({}, this.$params), o)), i = this._getOptionValue(ur.inlineStyles, t, C(C({}, this.$params), o));
        return [i, n];
      }
    }
  },
  computed: {
    globalPT: function() {
      var t, r = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(o) {
        return ce(o, {
          instance: r
        });
      });
    },
    defaultPT: function() {
      var t, r = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(o) {
        return r._getOptionValue(o, r.$name, C({}, r.$params)) || ce(o, C({}, r.$params));
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
      var t, r = Object.keys(((t = this.$.vnode) === null || t === void 0 ? void 0 : t.props) || {});
      return Object.fromEntries(Object.entries(this.$props).filter(function(o) {
        var n = Re(o, 1), i = n[0];
        return r?.includes(i);
      }));
    },
    $theme: function() {
      var t;
      return (t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.theme;
    },
    $style: function() {
      return C(C({
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
        var r = Re(t, 1), o = r[0];
        return o?.startsWith("pt:");
      }).reduce(function(t, r) {
        var o = Re(r, 2), n = o[0], i = o[1], a = n.split(":"), s = pi(a), l = Lt(s).slice(1);
        return l?.reduce(function(c, p, h, d) {
          return !c[p] && (c[p] = h === d.length - 1 ? i : {}), c[p];
        }, t), t;
      }, {});
    },
    $_attrsWithoutPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(t) {
        var r = Re(t, 1), o = r[0];
        return !(o != null && o.startsWith("pt:"));
      }).reduce(function(t, r) {
        var o = Re(r, 2), n = o[0], i = o[1];
        return t[n] = i, t;
      }, {});
    }
  }
};
function Ke(e) {
  "@babel/helpers - typeof";
  return Ke = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ke(e);
}
function vi(e, t) {
  if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
}
function gi(e, t) {
  for (var r = 0; r < t.length; r++) {
    var o = t[r];
    o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, yi(o.key), o);
  }
}
function bi(e, t, r) {
  return t && gi(e.prototype, t), Object.defineProperty(e, "prototype", { writable: !1 }), e;
}
function yi(e) {
  var t = xi(e, "string");
  return Ke(t) == "symbol" ? t : t + "";
}
function xi(e, t) {
  if (Ke(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var o = r.call(e, t);
    if (Ke(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return String(e);
}
var wi = /* @__PURE__ */ (function() {
  function e(t) {
    var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : function() {
    };
    vi(this, e), this.element = t, this.listener = r;
  }
  return bi(e, [{
    key: "bindScrollListener",
    value: function() {
      this.scrollableParents = kn(this.element);
      for (var r = 0; r < this.scrollableParents.length; r++)
        this.scrollableParents[r].addEventListener("scroll", this.listener);
    }
  }, {
    key: "unbindScrollListener",
    value: function() {
      if (this.scrollableParents)
        for (var r = 0; r < this.scrollableParents.length; r++)
          this.scrollableParents[r].removeEventListener("scroll", this.listener);
    }
  }, {
    key: "destroy",
    value: function() {
      this.unbindScrollListener(), this.element = null, this.listener = null, this.scrollableParents = null;
    }
  }]);
})(), ki = Vt();
const Si = "data-wippy-overlay-layer";
function oo() {
  return typeof window < "u" && typeof window.document < "u";
}
function no() {
  return oo() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function _i() {
  return no() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const $i = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let Ci = 0;
const lt = /* @__PURE__ */ new WeakMap();
function hr(e, t) {
  const r = e.style;
  r.setProperty("position", "fixed", "important"), r.setProperty("inset", "auto", "important"), r.setProperty("margin", "0", "important"), r.setProperty("position-anchor", t), r.setProperty("position-area", "bottom span-right"), r.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), r.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), r.setProperty("max-width", "stretch", "important");
}
function Oi(e, t) {
  if (!$i.test(e.className))
    return;
  const r = e.style.cssText;
  hr(e, t), e.getAttribute("popover") !== "manual" && e.setAttribute("popover", "manual");
  try {
    e.matches(":popover-open") || e.showPopover();
  } catch {
  }
  if (!e.matches(":popover-open")) {
    e.removeAttribute("popover"), e.style.cssText = r;
    return;
  }
  if (!lt.has(e)) {
    const o = new MutationObserver(() => {
      const n = e.style;
      (n.top !== "auto" || n.left !== "auto" || n.margin !== "0px" || n.getPropertyPriority("top") !== "important" || n.getPropertyPriority("left") !== "important" || n.getPropertyPriority("margin") !== "important" || n.getPropertyPriority("min-width") !== "important" || n.maxWidth !== "stretch" || n.getPropertyPriority("max-width") !== "important") && hr(e, t);
    });
    o.observe(e, { attributes: !0, attributeFilter: ["style"] }), lt.set(e, o);
  }
}
function jt(e) {
  const t = lt.get(e);
  t && (t.disconnect(), lt.delete(e));
}
function Ti(e) {
  const t = e && typeof e.getRootNode == "function" ? e.getRootNode() : null;
  return t instanceof ShadowRoot ? t : null;
}
function Pt(e) {
  e.style.top = "0px", e.style.left = "0px";
  const t = e.getBoundingClientRect();
  e.style.top = `${-window.scrollY - t.top}px`, e.style.left = `${-window.scrollX - t.left}px`;
}
const ct = /* @__PURE__ */ new Set(), Rt = /* @__PURE__ */ new WeakMap();
let fr = !1, Et = !1;
function Li() {
  Et = !1;
  for (const e of ct) {
    if (!e.isConnected) {
      for (const t of Array.from(e.children))
        t instanceof HTMLElement && jt(t);
      ct.delete(e), Rt.get(e)?.disconnect();
      continue;
    }
    e.childElementCount > 0 && Pt(e);
  }
}
function mr() {
  Et || (Et = !0, requestAnimationFrame(Li));
}
function Pi(e) {
  const t = document.createElement("div");
  t.setAttribute(Si, "");
  const r = no();
  if (t.style.cssText = r ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", r && t.setAttribute("popover", "manual"), e.appendChild(t), r) {
    try {
      t.showPopover();
    } catch {
    }
    t.matches(":popover-open") || (t.removeAttribute("popover"), t.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  Pt(t);
  const o = new MutationObserver((n) => {
    const i = t.__wippyAnchorName;
    for (const a of n) {
      if (i)
        for (const s of Array.from(a.addedNodes))
          s instanceof HTMLElement && Oi(s, i);
      for (const s of Array.from(a.removedNodes))
        s instanceof HTMLElement && jt(s);
    }
    t.isConnected && t.childElementCount > 0 && Pt(t);
  });
  return o.observe(t, { childList: !0 }), Rt.set(t, o), ct.add(t), fr || (fr = !0, window.addEventListener("scroll", mr, { capture: !0, passive: !0 }), window.addEventListener("resize", mr, { passive: !0 })), t;
}
function vr(e) {
  if (!(!e.hostRoot || e.layer) && (e.layer = Pi(e.hostRoot), _i())) {
    const t = e.$el ? e.$el.parentElement : null;
    t && (e.anchorName = `--wippy-a-${++Ci}`, e.anchorTrigger = t, t.style.setProperty("anchor-name", e.anchorName), e.layer.__wippyAnchorName = e.anchorName);
  }
}
function gr(e) {
  if (e.anchorTrigger && (e.anchorTrigger.style.removeProperty("anchor-name"), e.anchorTrigger = null), e.anchorName = null, e.layer) {
    for (const t of Array.from(e.layer.children))
      t instanceof HTMLElement && jt(t);
    ct.delete(e.layer), Rt.get(e.layer)?.disconnect(), e.layer.remove(), e.layer = null;
  }
}
let br = !1;
function Ei() {
  if (br)
    return;
  br = !0;
  const e = Mt;
  e.computed = e.computed || {}, e.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, e.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, e.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, e.mounted = function() {
    oo() && (this.hostRoot = Ti(this.$el), this.mounted = !0, this.hostRoot && (this.inline || vr(this), this.$watch("inline", (t) => {
      t ? gr(this) : vr(this);
    })));
  }, e.render = function() {
    return this.inline ? at(this.$slots, "default", { key: 0 }) : this.mounted ? yo(Or, { key: 1, to: this.resolvedTarget || document.body }, [
      at(this.$slots, "default")
    ]) : U("", !0);
  }, e.unmounted = function() {
    gr(this);
  };
}
const Ni = {
  install: (e) => {
    Ei(), e.use(si, { theme: "none" });
  }
}, yr = /* @__PURE__ */ Tr({
  __name: "IconField",
  props: {
    modelValue: {},
    fallback: {}
  },
  emits: ["update:modelValue"],
  setup(e, { emit: t }) {
    const r = e, o = t, n = A(null);
    let i = null;
    function a(l) {
      o("update:modelValue", l.detail || "");
    }
    async function s() {
      if (n.value) {
        i && i.removeEventListener("select", a), n.value.innerHTML = "";
        try {
          customElements.get("wc-icon-picker") || await Co("wc-icon-picker", { timeoutMs: 8e3 });
        } catch {
        }
        n.value && (i = document.createElement("wc-icon-picker"), i.setAttribute("value", r.modelValue || ""), r.fallback && i.setAttribute("fallback", r.fallback), i.addEventListener("select", a), n.value.appendChild(i));
      }
    }
    return pt(s), be(() => r.modelValue, (l) => {
      i && i.getAttribute("value") !== l && i.setAttribute("value", l || "");
    }), Lr(() => {
      i && i.removeEventListener("select", a);
    }), (l, c) => (O(), N("div", {
      ref_key: "host",
      ref: n,
      class: "wc-iconfield"
    }, null, 512));
  }
});
var Ai = {
  name: "BaseEditableHolder",
  extends: mi,
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
        var r, o;
        this.formField = ((r = this.$pcForm) === null || r === void 0 || (o = r.register) === null || o === void 0 ? void 0 : o.call(r, t, this.$formControl)) || {};
      }
    },
    $formControl: {
      immediate: !0,
      handler: function(t) {
        var r, o;
        this.formField = ((r = this.$pcForm) === null || r === void 0 || (o = r.register) === null || o === void 0 ? void 0 : o.call(r, this.$formName, t)) || {};
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
        var r;
        (r = this.$pcForm) !== null && r !== void 0 && r.getFieldState(this.$formName) && t !== this.d_value && (this.d_value = t);
      }
    }
  },
  formField: {},
  methods: {
    writeValue: function(t, r) {
      var o, n;
      this.controlled && (this.d_value = t, this.$emit("update:modelValue", t)), this.$emit("value-change", t), (o = (n = this.formField).onChange) === null || o === void 0 || o.call(n, {
        originalEvent: r,
        value: t
      });
    },
    // @todo move to @primeuix/utils
    findNonEmpty: function() {
      for (var t = arguments.length, r = new Array(t), o = 0; o < t; o++)
        r[o] = arguments[o];
      return r.find(j);
    }
  },
  computed: {
    $filled: function() {
      return j(this.d_value);
    },
    $invalid: function() {
      var t, r;
      return !this.$formNovalidate && this.findNonEmpty(this.invalid, (t = this.$pcFormField) === null || t === void 0 || (t = t.$field) === null || t === void 0 ? void 0 : t.invalid, (r = this.$pcForm) === null || r === void 0 || (r = r.getFieldState(this.$formName)) === null || r === void 0 ? void 0 : r.invalid);
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
      var t, r;
      return this.findNonEmpty(this.d_value, (t = this.$pcFormField) === null || t === void 0 ? void 0 : t.initialValue, (r = this.$pcForm) === null || r === void 0 || (r = r.initialValues) === null || r === void 0 ? void 0 : r[this.$formName]);
    },
    $formValue: function() {
      var t, r;
      return this.findNonEmpty((t = this.$pcFormField) === null || t === void 0 || (t = t.$field) === null || t === void 0 ? void 0 : t.value, (r = this.$pcForm) === null || r === void 0 || (r = r.getFieldState(this.$formName)) === null || r === void 0 ? void 0 : r.value);
    },
    controlled: function() {
      return this.$inProps.hasOwnProperty("modelValue") || !this.$inProps.hasOwnProperty("modelValue") && !this.$inProps.hasOwnProperty("defaultValue");
    },
    // @deprecated use $filled instead
    filled: function() {
      return this.$filled;
    }
  }
}, Vi = `
    .p-colorpicker {
        display: inline-block;
        position: relative;
    }

    .p-colorpicker-dragging {
        cursor: pointer;
    }

    .p-colorpicker-preview {
        width: dt('colorpicker.preview.width');
        height: dt('colorpicker.preview.height');
        padding: 0;
        border: 0 none;
        border-radius: dt('colorpicker.preview.border.radius');
        transition:
            background dt('colorpicker.transition.duration'),
            color dt('colorpicker.transition.duration'),
            border-color dt('colorpicker.transition.duration'),
            outline-color dt('colorpicker.transition.duration'),
            box-shadow dt('colorpicker.transition.duration');
        outline-color: transparent;
        cursor: pointer;
    }

    .p-colorpicker-preview:enabled:focus-visible {
        border-color: dt('colorpicker.preview.focus.border.color');
        box-shadow: dt('colorpicker.preview.focus.ring.shadow');
        outline: dt('colorpicker.preview.focus.ring.width') dt('colorpicker.preview.focus.ring.style') dt('colorpicker.preview.focus.ring.color');
        outline-offset: dt('colorpicker.preview.focus.ring.offset');
    }

    .p-colorpicker-panel {
        background: dt('colorpicker.panel.background');
        border: 1px solid dt('colorpicker.panel.border.color');
        border-radius: dt('colorpicker.panel.border.radius');
        box-shadow: dt('colorpicker.panel.shadow');
        width: 193px;
        height: 166px;
        position: absolute;
        top: 0;
        left: 0;
    }

    .p-colorpicker-panel-inline {
        box-shadow: none;
        position: static;
    }

    .p-colorpicker-content {
        position: relative;
    }

    .p-colorpicker-color-selector {
        width: 150px;
        height: 150px;
        inset-block-start: 8px;
        inset-inline-start: 8px;
        position: absolute;
    }

    .p-colorpicker-color-background {
        width: 100%;
        height: 100%;
        background: linear-gradient(to top, #000 0%, rgba(0, 0, 0, 0) 100%), linear-gradient(to right, #fff 0%, rgba(255, 255, 255, 0) 100%);
    }

    .p-colorpicker-color-handle {
        position: absolute;
        inset-block-start: 0px;
        inset-inline-start: 150px;
        border-radius: 100%;
        width: 10px;
        height: 10px;
        border-width: 1px;
        border-style: solid;
        margin: -5px 0 0 -5px;
        cursor: pointer;
        opacity: 0.85;
        border-color: dt('colorpicker.handle.color');
    }

    .p-colorpicker-hue {
        width: 17px;
        height: 150px;
        inset-block-start: 8px;
        inset-inline-start: 167px;
        position: absolute;
        opacity: 0.85;
        background: linear-gradient(0deg, red 0, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, red);
    }

    .p-colorpicker-hue-handle {
        position: absolute;
        inset-block-start: 150px;
        inset-inline-start: 0px;
        width: 21px;
        margin-inline-start: -2px;
        margin-block-start: -5px;
        height: 10px;
        border-width: 2px;
        border-style: solid;
        opacity: 0.85;
        cursor: pointer;
        border-color: dt('colorpicker.handle.color');
    }
`, Mi = {
  root: "p-colorpicker p-component",
  preview: function(t) {
    var r = t.props;
    return ["p-colorpicker-preview", {
      "p-disabled": r.disabled
    }];
  },
  panel: function(t) {
    var r = t.instance, o = t.props;
    return ["p-colorpicker-panel", {
      "p-colorpicker-panel-inline": o.inline,
      "p-disabled": o.disabled,
      "p-invalid": r.$invalid
    }];
  },
  colorSelector: "p-colorpicker-color-selector",
  colorBackground: "p-colorpicker-color-background",
  colorHandle: "p-colorpicker-color-handle",
  hue: "p-colorpicker-hue",
  hueHandle: "p-colorpicker-hue-handle"
}, ji = Z.extend({
  name: "colorpicker",
  style: Vi,
  classes: Mi
}), Ri = {
  name: "BaseColorPicker",
  extends: Ai,
  props: {
    defaultColor: {
      type: null,
      default: "ff0000"
    },
    inline: {
      type: Boolean,
      default: !1
    },
    format: {
      type: String,
      default: "hex"
    },
    tabindex: {
      type: String,
      default: null
    },
    autoZIndex: {
      type: Boolean,
      default: !0
    },
    baseZIndex: {
      type: Number,
      default: 0
    },
    appendTo: {
      type: [String, Object],
      default: "body"
    },
    inputId: {
      type: String,
      default: null
    },
    panelClass: null,
    overlayClass: null
  },
  style: ji,
  provide: function() {
    return {
      $pcColorPicker: this,
      $parentInstance: this
    };
  }
}, io = {
  name: "ColorPicker",
  extends: Ri,
  inheritAttrs: !1,
  emits: ["change", "show", "hide"],
  data: function() {
    return {
      overlayVisible: !1
    };
  },
  hsbValue: null,
  localHue: null,
  outsideClickListener: null,
  documentMouseMoveListener: null,
  documentMouseUpListener: null,
  scrollHandler: null,
  resizeListener: null,
  hueDragging: null,
  colorDragging: null,
  selfUpdate: null,
  picker: null,
  colorSelector: null,
  colorHandle: null,
  hueView: null,
  hueHandle: null,
  watch: {
    modelValue: {
      immediate: !0,
      handler: function(t) {
        this.hsbValue = this.toHSB(t), this.selfUpdate ? this.selfUpdate = !1 : this.updateUI();
      }
    }
  },
  beforeUnmount: function() {
    this.unbindOutsideClickListener(), this.unbindDragListeners(), this.unbindResizeListener(), this.scrollHandler && (this.scrollHandler.destroy(), this.scrollHandler = null), this.picker && this.autoZIndex && wt.clear(this.picker), this.clearRefs();
  },
  mounted: function() {
    this.updateUI();
  },
  methods: {
    pickColor: function(t) {
      var r = this.colorSelector.getBoundingClientRect(), o = r.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), n = r.left + document.body.scrollLeft, i = Math.floor(100 * Math.max(0, Math.min(150, (t.pageX || t.changedTouches[0].pageX) - n)) / 150), a = Math.floor(100 * (150 - Math.max(0, Math.min(150, (t.pageY || t.changedTouches[0].pageY) - o))) / 150);
      this.hsbValue = this.validateHSB({
        h: this.localHue,
        s: i,
        b: a
      }), this.selfUpdate = !0, this.updateColorHandle(), this.updateInput(), this.updateModel(t);
    },
    pickHue: function(t) {
      var r = this.hueView.getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0);
      this.localHue = Math.floor(360 * (150 - Math.max(0, Math.min(150, (t.pageY || t.changedTouches[0].pageY) - r))) / 150), this.hsbValue = this.validateHSB({
        h: this.localHue,
        s: this.hsbValue.s,
        b: this.hsbValue.b
      }), this.selfUpdate = !0, this.updateColorSelector(), this.updateHue(), this.updateModel(t), this.updateInput();
    },
    updateModel: function(t) {
      var r = this.d_value;
      switch (this.format) {
        case "hex":
          r = this.HSBtoHEX(this.hsbValue);
          break;
        case "rgb":
          r = this.HSBtoRGB(this.hsbValue);
          break;
        case "hsb":
          r = this.hsbValue;
          break;
      }
      this.writeValue(r, t), this.$emit("change", {
        event: t,
        value: r
      });
    },
    updateColorSelector: function() {
      if (this.colorSelector) {
        var t = this.validateHSB({
          h: this.hsbValue.h,
          s: 100,
          b: 100
        });
        this.colorSelector.style.backgroundColor = "#" + this.HSBtoHEX(t);
      }
    },
    updateColorHandle: function() {
      this.colorHandle && (this.colorHandle.style.left = Math.floor(150 * this.hsbValue.s / 100) + "px", this.colorHandle.style.top = Math.floor(150 * (100 - this.hsbValue.b) / 100) + "px");
    },
    updateHue: function() {
      this.hueHandle && (this.hueHandle.style.top = Math.floor(150 - 150 * this.hsbValue.h / 360) + "px");
    },
    updateInput: function() {
      this.$refs.input && (this.$refs.input.style.backgroundColor = "#" + this.HSBtoHEX(this.hsbValue));
    },
    updateUI: function() {
      this.updateHue(), this.updateColorHandle(), this.updateInput(), this.updateColorSelector();
    },
    validateHSB: function(t) {
      return {
        h: Math.min(360, Math.max(0, t.h)),
        s: Math.min(100, Math.max(0, t.s)),
        b: Math.min(100, Math.max(0, t.b))
      };
    },
    validateRGB: function(t) {
      return {
        r: Math.min(255, Math.max(0, t.r)),
        g: Math.min(255, Math.max(0, t.g)),
        b: Math.min(255, Math.max(0, t.b))
      };
    },
    validateHEX: function(t) {
      var r = 6 - t.length;
      if (r > 0) {
        for (var o = [], n = 0; n < r; n++)
          o.push("0");
        o.push(t), t = o.join("");
      }
      return t;
    },
    HEXtoRGB: function(t) {
      var r = parseInt(t.indexOf("#") > -1 ? t.substring(1) : t, 16);
      return {
        r: r >> 16,
        g: (r & 65280) >> 8,
        b: r & 255
      };
    },
    HEXtoHSB: function(t) {
      return this.RGBtoHSB(this.HEXtoRGB(t));
    },
    RGBtoHSB: function(t) {
      var r = {
        h: 0,
        s: 0,
        b: 0
      }, o = Math.min(t.r, t.g, t.b), n = Math.max(t.r, t.g, t.b), i = n - o;
      return r.b = n, r.s = n !== 0 ? 255 * i / n : 0, r.s !== 0 ? t.r === n ? r.h = (t.g - t.b) / i : t.g === n ? r.h = 2 + (t.b - t.r) / i : r.h = 4 + (t.r - t.g) / i : r.h = -1, r.h *= 60, r.h < 0 && (r.h += 360), r.s *= 100 / 255, r.b *= 100 / 255, r;
    },
    HSBtoRGB: function(t) {
      var r = {
        r: null,
        g: null,
        b: null
      }, o = Math.round(t.h), n = Math.round(t.s * 255 / 100), i = Math.round(t.b * 255 / 100);
      if (n === 0)
        r = {
          r: i,
          g: i,
          b: i
        };
      else {
        var a = i, s = (255 - n) * i / 255, l = (a - s) * (o % 60) / 60;
        o === 360 && (o = 0), o < 60 ? (r.r = a, r.b = s, r.g = s + l) : o < 120 ? (r.g = a, r.b = s, r.r = a - l) : o < 180 ? (r.g = a, r.r = s, r.b = s + l) : o < 240 ? (r.b = a, r.r = s, r.g = a - l) : o < 300 ? (r.b = a, r.g = s, r.r = s + l) : o < 360 ? (r.r = a, r.g = s, r.b = a - l) : (r.r = 0, r.g = 0, r.b = 0);
      }
      return {
        r: Math.round(r.r),
        g: Math.round(r.g),
        b: Math.round(r.b)
      };
    },
    RGBtoHEX: function(t) {
      var r = [t.r.toString(16), t.g.toString(16), t.b.toString(16)];
      for (var o in r)
        r[o].length === 1 && (r[o] = "0" + r[o]);
      return r.join("");
    },
    HSBtoHEX: function(t) {
      return this.RGBtoHEX(this.HSBtoRGB(t));
    },
    toHSB: function(t) {
      var r;
      if (t)
        switch (this.format) {
          case "hex":
            r = this.HEXtoHSB(t);
            break;
          case "rgb":
            r = this.RGBtoHSB(t);
            break;
          case "hsb":
            r = t;
            break;
        }
      else
        r = this.HEXtoHSB(this.defaultColor);
      return r.s === 0 || r.b === 0 ? r.h = this.localHue : this.localHue = r.h, r;
    },
    onOverlayEnter: function(t) {
      this.updateUI(), this.alignOverlay(), this.bindOutsideClickListener(), this.bindScrollListener(), this.bindResizeListener(), this.autoZIndex && wt.set("overlay", t, this.baseZIndex || this.$primevue.config.zIndex.overlay), this.$attrSelector && t.setAttribute(this.$attrSelector, ""), this.$emit("show");
    },
    onOverlayLeave: function() {
      this.unbindOutsideClickListener(), this.unbindScrollListener(), this.unbindResizeListener(), this.clearRefs(), this.$emit("hide");
    },
    onOverlayAfterLeave: function(t) {
      this.autoZIndex && wt.clear(t);
    },
    alignOverlay: function() {
      this.appendTo === "self" ? xn(this.picker, this.$refs.input) : yn(this.picker, this.$refs.input);
    },
    onInputClick: function() {
      this.disabled || (this.overlayVisible = !this.overlayVisible);
    },
    onInputKeydown: function(t) {
      switch (t.code) {
        case "Space":
          this.overlayVisible = !this.overlayVisible, t.preventDefault();
          break;
        case "Escape":
        case "Tab":
          this.overlayVisible = !1;
          break;
      }
    },
    onInputBlur: function(t) {
      var r, o;
      (r = (o = this.formField).onBlur) === null || r === void 0 || r.call(o);
    },
    onColorMousedown: function(t) {
      this.disabled || (this.bindDragListeners(), this.onColorDragStart(t));
    },
    onColorDragStart: function(t) {
      this.disabled || (this.colorDragging = !0, this.pickColor(t), this.$el.setAttribute("p-colorpicker-dragging", "true"), !this.isUnstyled && Qt(this.$el, "p-colorpicker-dragging"), t.preventDefault());
    },
    onDrag: function(t) {
      this.colorDragging && (this.pickColor(t), t.preventDefault()), this.hueDragging && (this.pickHue(t), t.preventDefault());
    },
    onDragEnd: function() {
      this.colorDragging = !1, this.hueDragging = !1, this.$el.setAttribute("p-colorpicker-dragging", "false"), !this.isUnstyled && fn(this.$el, "p-colorpicker-dragging"), this.unbindDragListeners();
    },
    onHueMousedown: function(t) {
      this.disabled || (this.bindDragListeners(), this.onHueDragStart(t));
    },
    onHueDragStart: function(t) {
      this.disabled || (this.hueDragging = !0, this.pickHue(t), !this.isUnstyled && Qt(this.$el, "p-colorpicker-dragging"), t.preventDefault());
    },
    isInputClicked: function(t) {
      return this.$refs.input && this.$refs.input.isSameNode(t.target);
    },
    bindDragListeners: function() {
      this.bindDocumentMouseMoveListener(), this.bindDocumentMouseUpListener();
    },
    unbindDragListeners: function() {
      this.unbindDocumentMouseMoveListener(), this.unbindDocumentMouseUpListener();
    },
    bindOutsideClickListener: function() {
      var t = this;
      this.outsideClickListener || (this.outsideClickListener = function(r) {
        t.overlayVisible && t.picker && !t.picker.contains(r.target) && !t.isInputClicked(r) && (t.overlayVisible = !1);
      }, document.addEventListener("click", this.outsideClickListener, !0));
    },
    unbindOutsideClickListener: function() {
      this.outsideClickListener && (document.removeEventListener("click", this.outsideClickListener, !0), this.outsideClickListener = null);
    },
    bindScrollListener: function() {
      var t = this;
      this.scrollHandler || (this.scrollHandler = new wi(this.$refs.container, function() {
        t.overlayVisible && (t.overlayVisible = !1);
      })), this.scrollHandler.bindScrollListener();
    },
    unbindScrollListener: function() {
      this.scrollHandler && this.scrollHandler.unbindScrollListener();
    },
    bindResizeListener: function() {
      var t = this;
      this.resizeListener || (this.resizeListener = function() {
        t.overlayVisible && !Sn() && (t.overlayVisible = !1);
      }, window.addEventListener("resize", this.resizeListener));
    },
    unbindResizeListener: function() {
      this.resizeListener && (window.removeEventListener("resize", this.resizeListener), this.resizeListener = null);
    },
    bindDocumentMouseMoveListener: function() {
      this.documentMouseMoveListener || (this.documentMouseMoveListener = this.onDrag.bind(this), document.addEventListener("mousemove", this.documentMouseMoveListener));
    },
    unbindDocumentMouseMoveListener: function() {
      this.documentMouseMoveListener && (document.removeEventListener("mousemove", this.documentMouseMoveListener), this.documentMouseMoveListener = null);
    },
    bindDocumentMouseUpListener: function() {
      this.documentMouseUpListener || (this.documentMouseUpListener = this.onDragEnd.bind(this), document.addEventListener("mouseup", this.documentMouseUpListener));
    },
    unbindDocumentMouseUpListener: function() {
      this.documentMouseUpListener && (document.removeEventListener("mouseup", this.documentMouseUpListener), this.documentMouseUpListener = null);
    },
    pickerRef: function(t) {
      this.picker = t;
    },
    colorSelectorRef: function(t) {
      this.colorSelector = t;
    },
    colorHandleRef: function(t) {
      this.colorHandle = t;
    },
    hueViewRef: function(t) {
      this.hueView = t;
    },
    hueHandleRef: function(t) {
      this.hueHandle = t;
    },
    clearRefs: function() {
      this.picker = null, this.colorSelector = null, this.colorHandle = null, this.hueView = null, this.hueHandle = null;
    },
    onOverlayClick: function(t) {
      ki.emit("overlay-click", {
        originalEvent: t,
        target: this.$el
      });
    }
  },
  components: {
    Portal: Mt
  }
};
function Ge(e) {
  "@babel/helpers - typeof";
  return Ge = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ge(e);
}
function xr(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(n) {
      return Object.getOwnPropertyDescriptor(e, n).enumerable;
    })), r.push.apply(r, o);
  }
  return r;
}
function wr(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2 ? xr(Object(r), !0).forEach(function(o) {
      Di(e, o, r[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r)) : xr(Object(r)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(r, o));
    });
  }
  return e;
}
function Di(e, t, r) {
  return (t = Hi(t)) in e ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = r, e;
}
function Hi(e) {
  var t = Ii(e, "string");
  return Ge(t) == "symbol" ? t : t + "";
}
function Ii(e, t) {
  if (Ge(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var o = r.call(e, t);
    if (Ge(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Bi = ["id", "tabindex", "disabled"];
function zi(e, t, r, o, n, i) {
  var a = xo("Portal");
  return O(), N("div", re({
    ref: "container",
    class: e.cx("root")
  }, e.ptmi("root")), [e.inline ? U("", !0) : (O(), N("input", re({
    key: 0,
    ref: "input",
    id: e.inputId,
    type: "text",
    class: e.cx("preview"),
    readonly: "",
    tabindex: e.tabindex,
    disabled: e.disabled,
    onClick: t[0] || (t[0] = function() {
      return i.onInputClick && i.onInputClick.apply(i, arguments);
    }),
    onKeydown: t[1] || (t[1] = function() {
      return i.onInputKeydown && i.onInputKeydown.apply(i, arguments);
    }),
    onBlur: t[2] || (t[2] = function() {
      return i.onInputBlur && i.onInputBlur.apply(i, arguments);
    })
  }, e.ptm("preview")), null, 16, Bi)), P(a, {
    appendTo: e.appendTo,
    disabled: e.inline
  }, {
    default: Ft(function() {
      return [P(wo, re({
        name: "p-anchored-overlay",
        onEnter: i.onOverlayEnter,
        onLeave: i.onOverlayLeave,
        onAfterLeave: i.onOverlayAfterLeave
      }, e.ptm("transition")), {
        default: Ft(function() {
          return [e.inline || n.overlayVisible ? (O(), N("div", re({
            key: 0,
            ref: i.pickerRef,
            class: [e.cx("panel"), e.panelClass, e.overlayClass],
            onClick: t[11] || (t[11] = function() {
              return i.onOverlayClick && i.onOverlayClick.apply(i, arguments);
            })
          }, wr(wr({}, e.ptm("panel")), e.ptm("overlay"))), [v("div", re({
            class: e.cx("content")
          }, e.ptm("content")), [v("div", re({
            ref: i.colorSelectorRef,
            class: e.cx("colorSelector"),
            onMousedown: t[3] || (t[3] = function(s) {
              return i.onColorMousedown(s);
            }),
            onTouchstart: t[4] || (t[4] = function(s) {
              return i.onColorDragStart(s);
            }),
            onTouchmove: t[5] || (t[5] = function(s) {
              return i.onDrag(s);
            }),
            onTouchend: t[6] || (t[6] = function(s) {
              return i.onDragEnd();
            })
          }, e.ptm("colorSelector")), [v("div", re({
            class: e.cx("colorBackground")
          }, e.ptm("colorBackground")), [v("div", re({
            ref: i.colorHandleRef,
            class: e.cx("colorHandle")
          }, e.ptm("colorHandle")), null, 16)], 16)], 16), v("div", re({
            ref: i.hueViewRef,
            class: e.cx("hue"),
            onMousedown: t[7] || (t[7] = function(s) {
              return i.onHueMousedown(s);
            }),
            onTouchstart: t[8] || (t[8] = function(s) {
              return i.onHueDragStart(s);
            }),
            onTouchmove: t[9] || (t[9] = function(s) {
              return i.onDrag(s);
            }),
            onTouchend: t[10] || (t[10] = function(s) {
              return i.onDragEnd();
            })
          }, e.ptm("hue")), [v("div", re({
            ref: i.hueHandleRef,
            class: e.cx("hueHandle")
          }, e.ptm("hueHandle")), null, 16)], 16)], 16)], 16)) : U("", !0)];
        }),
        _: 1
      }, 16, ["onEnter", "onLeave", "onAfterLeave"])];
    }),
    _: 1
  }, 8, ["appendTo", "disabled"])], 16);
}
io.render = zi;
const kr = "#d63a22", Dt = "--p-primary";
function Ui(e) {
  const t = /^rgba?\(([^)]+)\)/i.exec((e || "").trim());
  if (!t) return null;
  const r = t[1].split(",").map((n) => parseFloat(n.trim()));
  if (r.length < 3 || r.slice(0, 3).some((n) => Number.isNaN(n))) return null;
  const o = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${o(r[0])}${o(r[1])}${o(r[2])}`;
}
function Ht(e) {
  let t = (e || "").trim().replace(/^#/, "");
  return t.length === 3 && (t = t[0] + t[0] + t[1] + t[1] + t[2] + t[2]), /^[0-9a-fA-F]{6}$/.test(t) ? `#${t.toLowerCase()}` : null;
}
function Sr(e) {
  const t = Ht(e);
  if (!t) return null;
  const r = t.slice(1);
  return {
    r: parseInt(r.slice(0, 2), 16),
    g: parseInt(r.slice(2, 4), 16),
    b: parseInt(r.slice(4, 6), 16)
  };
}
function Nt(e, t) {
  const r = Ht(e);
  if (!r) return "";
  const o = `${Dt}: ${r};`;
  return t === ":host" ? `:host { ${o} }` : [
    `:root { ${o} }`,
    `@media (prefers-color-scheme: dark) { :root:not(.w-theme-light) { ${o} } }`,
    `:root.w-theme-dark, .w-theme-dark { ${o} }`,
    `@media (prefers-color-scheme: light) { :root:not(.w-theme-dark) { ${o} } }`,
    `:root.w-theme-light, .w-theme-light { ${o} }`
  ].join(`
`);
}
function Fi(e, t) {
  if (!e || typeof e != "object") return "";
  const r = e[Dt];
  return typeof r == "string" ? Nt(r, t) : "";
}
const Wi = { r: 255, g: 255, b: 255 }, Ki = { r: 12, g: 14, b: 18 }, Gi = 2, Yi = 2;
function _r(e) {
  const t = (r) => {
    const o = r / 255;
    return o <= 0.03928 ? o / 12.92 : Math.pow((o + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * t(e.r) + 0.7152 * t(e.g) + 0.0722 * t(e.b);
}
function $r(e, t) {
  const r = _r(e), o = _r(t);
  return (Math.max(r, o) + 0.05) / (Math.min(r, o) + 0.05);
}
function Xi(e, t = typeof document < "u" ? document : void 0) {
  const r = Ht(e);
  if (!r) return null;
  if (!t || !t.body || !t.defaultView) return Sr(r);
  const o = t.createElement("span");
  o.style.setProperty(Dt, r), o.style.color = "var(--p-primary-color)", o.style.display = "none", t.body.appendChild(o);
  const n = t.defaultView.getComputedStyle(o).color;
  return o.remove(), Sr(Ui(n) || r);
}
function qi(e) {
  const t = Xi(e);
  if (!t) return null;
  const r = $r(t, Wi), o = $r(t, Ki), n = r >= Gi, i = o >= Yi;
  let a = "";
  return !n && !i ? a = "This tone is too low-contrast - buttons and accents would be unreadable in both light and dark mode." : n ? i || (a = "This tone is too dark - accents would be invisible against the dark background.") : a = "This tone is too light - white button text and accents would be unreadable in light mode.", { ok: n && i, onLight: r, onDark: o, reason: a };
}
function Zi({ items: e, categories: t, overrides: r, home: o }) {
  const n = (g) => g.route_name || g.id;
  function i(g, b) {
    const x = n(g), M = { ...r.value[x] || {} };
    for (const [H, z] of Object.entries(b))
      z === void 0 || z === "" ? delete M[H] : M[H] = z;
    r.value = { ...r.value, [x]: M };
  }
  function a(g, b) {
    i(g, { hidden: b || void 0 }), g.hidden = b;
  }
  function s(g, b) {
    i(g, { category: b }), g.category = b;
  }
  function l(g, b) {
    i(g, { order: b }), g.order = b;
  }
  function c(g, b) {
    const x = b.replace(/^\s+/, "");
    g.label = x, i(g, { label: x || void 0 });
  }
  function p(g, b) {
    const x = (b || "").trim();
    g.icon = x, i(g, { icon: x || void 0 });
  }
  function h(g) {
    const b = r.value[n(g)];
    return !!b && (b.label !== void 0 || b.icon !== void 0);
  }
  const d = de(() => [...t.value].sort((g, b) => g.order - b.order));
  function f(g) {
    return e.value.filter((b) => !b.hidden && (b.category || "") === g).sort((b, x) => b.order - x.order || b.label.localeCompare(x.label));
  }
  const S = de(() => {
    const g = [];
    g.push({ key: "", label: "Ungrouped", real: !1 });
    for (const x of d.value) g.push({ key: x.key, label: x.label || x.key, real: !0 });
    const b = /* @__PURE__ */ new Set(["", ...t.value.map((x) => x.key)]);
    for (const x of e.value)
      x.category && !b.has(x.category) && (b.add(x.category), g.push({ key: x.category, label: x.category, real: !1 }));
    return g;
  }), $ = de(() => e.value.filter((g) => g.hidden)), _ = (g) => t.value.find((b) => b.key === g), w = A(null), L = A(null), G = A(null), V = (g) => e.value.find((b) => b.id === g);
  function oe(g, b) {
    w.value = g.id, b.dataTransfer && (b.dataTransfer.effectAllowed = "move", b.dataTransfer.setData("text/plain", g.id));
  }
  function B() {
    w.value = null, L.value = null, G.value = null;
  }
  function ne(g) {
    const b = w.value ? V(w.value) : null;
    if (!b || b.id === g.id) return B();
    const x = g.category || "", M = f(x).filter((z) => z.id !== b.id), H = M.indexOf(g);
    M.splice(H < 0 ? M.length : H, 0, b), s(b, x), M.forEach((z, W) => l(z, W * 10)), B();
  }
  function ie(g) {
    const b = w.value ? V(w.value) : null;
    if (!b) return B();
    const x = f(g).filter((M) => M.id !== b.id);
    x.push(b), s(b, g), x.forEach((M, H) => l(M, H * 10)), B();
  }
  function F(g, b) {
    L.value = g, b.dataTransfer && (b.dataTransfer.effectAllowed = "move", b.dataTransfer.setData("text/plain", "cat:" + g));
  }
  function ee(g) {
    const b = L.value;
    if (!b || b === g) return B();
    const x = [...d.value], M = x.findIndex((W) => W.key === b), H = x.findIndex((W) => W.key === g);
    if (M < 0 || H < 0) return B();
    const [z] = x.splice(M, 1);
    x.splice(H, 0, z), x.forEach((W, ye) => {
      const xe = t.value.find((Me) => Me.key === W.key);
      xe && (xe.order = ye * 10);
    }), B();
  }
  let Y = 0;
  function ae() {
    Y += 1;
    const g = d.value[d.value.length - 1];
    t.value.push({ key: "cat_" + Date.now().toString(36) + "_" + Y, label: "New category", icon: "tabler:folder", order: (g?.order ?? 0) + 10 });
  }
  function Q(g) {
    for (const b of e.value) b.category === g && s(b, "");
    t.value = t.value.filter((b) => b.key !== g);
  }
  function J(g, b) {
    const x = _(g);
    x && (x.label = b);
  }
  function te(g, b) {
    const x = _(g);
    x && (x.icon = (b || "").trim() || void 0);
  }
  function X(g) {
    return !!o.value && o.value === g.path;
  }
  function se(g) {
    o.value = X(g) ? "" : g.path;
  }
  return {
    itemKey: n,
    patchOverride: i,
    setHidden: a,
    setCategory: s,
    setOrder: l,
    setLabel: c,
    setIcon: p,
    hasOverride: h,
    orderedCats: d,
    itemsOf: f,
    editorGroups: S,
    hiddenItems: $,
    catByKey: _,
    dragItemId: w,
    dragCatKey: L,
    overGroup: G,
    onItemDragStart: oe,
    endDrag: B,
    onItemDrop: ne,
    onGroupDrop: ie,
    onCatDragStart: F,
    onCatDrop: ee,
    addCategory: ae,
    removeCategory: Q,
    renameCategory: J,
    setCatIcon: te,
    isHome: X,
    setHome: se
  };
}
function Qi({ logoUrl: e, error: t, apiError: r }) {
  const o = A(!1);
  async function n(a) {
    const s = a.target, l = s.files && s.files[0];
    if (l) {
      if (!l.type.startsWith("image/")) {
        t.value = "Logo must be an image", s.value = "";
        return;
      }
      if (l.size > 2 * 1024 * 1024) {
        t.value = "Logo too large (max 2 MB)", s.value = "";
        return;
      }
      o.value = !0, t.value = "";
      try {
        const c = new FormData();
        c.append("logo", l);
        const { data: p } = await _t.post("/api/v1/nav/logo", c, { headers: { "Content-Type": "multipart/form-data" } });
        if (!p.success || !p.url) throw new Error(p.error || "upload failed");
        e.value = p.url;
      } catch (c) {
        t.value = r(c, "upload failed");
      } finally {
        o.value = !1, s.value = "";
      }
    }
  }
  function i() {
    e.value = "";
  }
  return { uploadingLogo: o, uploadLogo: n, removeLogo: i };
}
const Ji = { class: "ap" }, ea = { class: "ap-body" }, ta = { class: "ap-bar" }, ra = {
  key: 0,
  class: "ap-dirty ap-dirty-warn"
}, oa = {
  key: 1,
  class: "ap-dirty"
}, na = ["disabled"], ia = ["disabled"], aa = {
  key: 0,
  class: "ap-msg ap-err"
}, sa = {
  key: 1,
  class: "ap-loading"
}, la = {
  key: 2,
  class: "ap-grid"
}, ca = { class: "ap-side" }, pa = { class: "ap-card" }, ua = { class: "ap-h" }, da = { class: "ap-logo" }, ha = { class: "ap-logo-prev" }, fa = ["src"], ma = { class: "ap-logo-actions" }, va = ["accept", "disabled"], ga = { class: "ap-hint" }, ba = { class: "ap-tone" }, ya = ["placeholder"], xa = {
  key: 0,
  class: "ap-tone-warn",
  role: "alert"
}, wa = {
  class: "ap-theme-modes",
  role: "group",
  "aria-label": "Color scheme"
}, ka = ["aria-pressed", "onClick"], Sa = { class: "ap-card" }, _a = { class: "ap-h" }, $a = { class: "ap-layouts" }, Ca = { class: "ap-lo-name" }, Oa = { class: "ap-lo-name" }, Ta = { class: "ap-card ap-legend" }, La = { class: "ap-h" }, Pa = { class: "ap-tips" }, Ea = { class: "ap-card ap-structure" }, Na = { class: "ap-h" }, Aa = ["onDragover", "onDragleave", "onDrop"], Va = ["onDrop"], Ma = ["onDragstart"], ja = {
  key: 1,
  class: "ap-grip ap-grip-ghost",
  "aria-hidden": "true"
}, Ra = ["value", "onInput"], Da = { class: "ap-tile ap-tile-muted" }, Ha = { class: "ap-field ap-field-strong ap-field-static" }, Ia = { class: "ap-count" }, Ba = ["onClick"], za = {
  key: 0,
  class: "ap-drop-hint"
}, Ua = ["onDrop"], Fa = ["onDragstart"], Wa = ["value", "onInput"], Ka = { class: "ap-path" }, Ga = {
  key: 0,
  class: "ap-pill kx-tag-sm"
}, Ya = {
  key: 1,
  class: "ap-pill kx-tag-sm ap-pill-home"
}, Xa = ["aria-label", "title", "onClick"], qa = ["onClick"], Za = {
  key: 0,
  class: "ap-hidden"
}, Qa = {
  key: 0,
  class: "ap-hidden-list"
}, Ja = { class: "ap-tile" }, es = { class: "ap-field ap-field-strong ap-field-static" }, ts = ["onClick"], rs = /* @__PURE__ */ Tr({
  __name: "appearance",
  setup(e) {
    const t = A(!0), r = A(!1), o = A("");
    function n(k, u) {
      return k?.response?.data?.error || k?.message || u;
    }
    const i = A("vertical"), a = A(it.getThemeMode?.() ?? "auto"), s = A([]), l = A([]), c = A({}), p = A(!1), h = A(""), d = A(""), f = A(), S = de(() => f.value?.formats.flatMap((k) => [k.mime, ...k.extensions.map((u) => `.${u}`)]).join(",")), $ = de(() => f.value ? `${f.value.formats.map((k) => k.label).join(", ")} · up to ${f.value.max_bytes / 1048576} MB.` : ""), _ = Qi({ logoUrl: d, error: o, apiError: n }), { uploadingLogo: w, uploadLogo: L, removeLogo: G } = _, V = A(""), oe = A(kr), B = de({
      // PrimeVue's <ColorPicker format="hex"> exchanges a BARE rrggbb string, while the stored
      // setting and the hex text field both keep the #-prefixed form — so strip on the way in
      // and re-add on the way out. Falling back to defaultTone keeps the swatch showing the live
      // theme tone while the setting is unset.
      get: () => (V.value || oe.value).trim().replace(/^#/, ""),
      set: (k) => {
        const u = String(k ?? "").replace(/^#/, "");
        V.value = u ? `#${u}` : "";
      }
    });
    function ne() {
      V.value = "";
    }
    function ie(k) {
      a.value = k, it.setThemeMode(k);
    }
    const F = de(() => V.value.trim() ? qi(V.value) : null), ee = de(() => !!V.value.trim() && F.value === null), Y = de(() => ee.value || !!F.value && !F.value.ok), ae = de(() => ee.value ? "Enter a valid hex color, e.g. #2563eb." : F.value && !F.value.ok ? F.value.reason : ""), Q = A(""), J = A(""), te = () => JSON.stringify({
      layout: i.value,
      cats: l.value,
      overrides: c.value,
      title: h.value,
      logo: d.value,
      home: Q.value,
      tone: V.value,
      pos: s.value.map((k) => [k.id, k.category, k.order, !!k.hidden])
    }), X = de(() => te() !== J.value);
    async function se() {
      t.value = !0, o.value = "";
      try {
        const { data: k } = await _t.get("/api/v1/nav/list?manage=1");
        if (!k.success) throw new Error(k.error || "failed to load nav");
        f.value = k.logo_upload, s.value = (k.items ?? []).map((y) => ({ ...y })), i.value = k.layout === "horizontal" ? "horizontal" : "vertical";
        const u = k.config ?? {};
        return l.value = Array.isArray(u.categories) ? u.categories.map((y) => ({ ...y })) : [], c.value = u.overrides && typeof u.overrides == "object" ? structuredClone(u.overrides) : {}, h.value = typeof u.title == "string" ? u.title : "", d.value = typeof u.logo_url == "string" ? u.logo_url : "", V.value = typeof u.primary_color == "string" ? u.primary_color : "", Se = V.value, Q.value = typeof k.home == "string" ? k.home : typeof u.home == "string" ? u.home : "", J.value = te(), !0;
      } catch (k) {
        return o.value = n(k, "failed to load"), !1;
      } finally {
        t.value = !1;
      }
    }
    const g = Zi({ items: s, categories: l, overrides: c, home: Q }), {
      setHidden: b,
      setLabel: x,
      setIcon: M,
      hasOverride: H,
      itemsOf: z,
      editorGroups: W,
      hiddenItems: ye,
      catByKey: xe,
      dragItemId: Me,
      overGroup: Oe,
      onItemDragStart: dt,
      endDrag: Te,
      onItemDrop: ht,
      onGroupDrop: Ye,
      onCatDragStart: ft,
      onCatDrop: mt,
      addCategory: Xe,
      removeCategory: vt,
      renameCategory: gt,
      setCatIcon: bt,
      isHome: ke,
      setHome: yt
    } = g;
    let pe = null, qe = !1, Se = "", Ze = null;
    async function ao() {
      try {
        const k = await fetch("/app/css-variables.facade.json", { cache: "no-store" });
        if (!k.ok) return;
        const u = await k.json();
        if (u && typeof u == "object") {
          Ze = u;
          const y = u["--p-primary"];
          typeof y == "string" && (oe.value = y), !V.value.trim() && Qe.value !== !1 && Le("");
        }
      } catch {
      }
    }
    function It(k, u) {
      return Nt(k, u) || Fi(Ze, u) || Nt(kr, u);
    }
    function Le(k) {
      window.dispatchEvent(new CustomEvent("kickside:tone-apply", {
        detail: { hostCss: It(k, ":root"), shadowCss: It(k, ":host") }
      }));
    }
    Lr(() => {
      qe = !0, pe && clearTimeout(pe), Le(Se), Bt?.();
    });
    async function so() {
      if (Y.value) return;
      const k = te(), u = V.value;
      r.value = !0, o.value = "";
      try {
        const { data: y } = await _t.put("/api/v1/nav/config", {
          layout: i.value,
          overrides: c.value,
          categories: l.value,
          title: h.value,
          logo_url: d.value,
          home: Q.value,
          primary_color: V.value
        });
        if (!y.success) throw new Error(y.error || "save failed");
        J.value = k, Se = u, Le(qe || Qe.value === !1 ? Se : V.value);
      } catch (y) {
        o.value = n(y, "save failed");
      } finally {
        r.value = !1;
      }
    }
    let Bt = null;
    pt(() => {
      a.value = it.getThemeMode?.() ?? "auto", Bt = Pr("@theme", (k) => {
        a.value = k;
      }), ao();
    });
    let zt = !1;
    async function lo() {
      zt && X.value || await se() && (zt = !0);
    }
    const Qe = rn(lo);
    return be(V, (k) => {
      pe && clearTimeout(pe), pe = null, Qe.value !== !1 && (pe = setTimeout(() => Le(k), 90));
    }), be(Qe, (k, u) => {
      u === !0 && k === !1 ? (pe && clearTimeout(pe), pe = null, Le(Se)) : u === !1 && k === !0 && X.value && Le(V.value);
    }), (k, u) => (O(), N("div", Ji, [
      v("div", ea, [
        v("header", ta, [
          Y.value ? (O(), N("span", ra, le(ee.value ? "Invalid color" : "Tone unreadable"), 1)) : X.value ? (O(), N("span", oa, "Unsaved changes")) : U("", !0),
          v("button", {
            class: "ap-btn ap-btn-ghost",
            disabled: !X.value || r.value,
            onClick: se
          }, "Discard", 8, na),
          v("button", {
            class: "ap-btn ap-btn-primary",
            disabled: !X.value || r.value || Y.value,
            onClick: so
          }, [
            P(m(E), {
              icon: r.value ? "tabler:loader-2" : "tabler:device-floppy",
              class: ve(r.value && "spin"),
              "aria-hidden": "true"
            }, null, 8, ["icon", "class"]),
            I(" " + le(r.value ? "Saving…" : "Save"), 1)
          ], 8, ia)
        ]),
        o.value ? (O(), N("div", aa, le(o.value), 1)) : U("", !0),
        t.value ? (O(), N("div", sa, [
          P(m(E), {
            icon: "tabler:loader-2",
            class: "spin"
          }),
          u[13] || (u[13] = I(" Loading…", -1))
        ])) : (O(), N("div", la, [
          v("aside", ca, [
            v("section", pa, [
              v("header", ua, [
                P(m(E), {
                  icon: "tabler:photo",
                  "aria-hidden": "true"
                }),
                u[14] || (u[14] = I(" Branding", -1))
              ]),
              u[17] || (u[17] = v("p", { class: "ap-sub" }, "Title and logo apply to everyone on this installation — header, login page, and browser tab.", -1)),
              u[18] || (u[18] = v("label", { class: "ap-blabel" }, "Title", -1)),
              Wt(v("input", {
                "onUpdate:modelValue": u[0] || (u[0] = (y) => h.value = y),
                class: "ap-binput",
                type: "text",
                maxlength: "60",
                placeholder: "KickSide"
              }, null, 512), [
                [Kt, h.value]
              ]),
              u[19] || (u[19] = v("label", { class: "ap-blabel" }, "Logo", -1)),
              v("div", da, [
                v("span", ha, [
                  d.value ? (O(), N("img", {
                    key: 0,
                    src: d.value,
                    alt: "Logo preview"
                  }, null, 8, fa)) : (O(), De(m(E), {
                    key: 1,
                    icon: "tabler:photo",
                    "aria-hidden": "true"
                  }))
                ]),
                v("div", ma, [
                  v("label", {
                    class: ve(["ap-btn ap-btn-ghost", m(w) && "ap-btn-busy"])
                  }, [
                    P(m(E), {
                      icon: m(w) ? "tabler:loader-2" : "tabler:upload",
                      class: ve(m(w) && "spin"),
                      "aria-hidden": "true"
                    }, null, 8, ["icon", "class"]),
                    I(" " + le(m(w) ? "Uploading…" : "Upload") + " ", 1),
                    v("input", {
                      type: "file",
                      accept: S.value,
                      class: "ap-file",
                      disabled: m(w) || !f.value,
                      onChange: u[1] || (u[1] = //@ts-ignore
                      (...y) => m(L) && m(L)(...y))
                    }, null, 40, va)
                  ], 2),
                  d.value ? (O(), N("button", {
                    key: 0,
                    class: "ap-btn ap-btn-ghost ap-danger",
                    onClick: u[2] || (u[2] = //@ts-ignore
                    (...y) => m(G) && m(G)(...y))
                  }, [
                    P(m(E), {
                      icon: "tabler:trash",
                      "aria-hidden": "true"
                    }),
                    u[15] || (u[15] = I(" Remove ", -1))
                  ])) : U("", !0)
                ])
              ]),
              v("p", ga, le($.value), 1),
              u[20] || (u[20] = v("label", { class: "ap-blabel" }, "Base tone", -1)),
              v("div", ba, [
                P(m(io), {
                  modelValue: B.value,
                  "onUpdate:modelValue": u[3] || (u[3] = (y) => B.value = y),
                  format: "hex",
                  class: "ap-tone-swatch",
                  pt: { preview: { class: "ap-tone-preview", "aria-label": "Base tone color", "data-testid": "appearance-base-tone-picker" } }
                }, null, 8, ["modelValue"]),
                Wt(v("input", {
                  "onUpdate:modelValue": u[4] || (u[4] = (y) => V.value = y),
                  class: "ap-binput ap-tone-hex",
                  type: "text",
                  maxlength: "7",
                  placeholder: oe.value,
                  "aria-label": "Base tone hex"
                }, null, 8, ya), [
                  [Kt, V.value]
                ]),
                V.value ? (O(), N("button", {
                  key: 0,
                  class: "ap-btn ap-btn-ghost",
                  onClick: ne
                }, [
                  P(m(E), {
                    icon: "tabler:rotate",
                    "aria-hidden": "true"
                  }),
                  u[16] || (u[16] = I(" Reset", -1))
                ])) : U("", !0)
              ]),
              ae.value ? (O(), N("p", xa, [
                P(m(E), {
                  icon: "tabler:alert-triangle",
                  "aria-hidden": "true"
                }),
                I(" " + le(ae.value), 1)
              ])) : U("", !0),
              u[21] || (u[21] = v("p", { class: "ap-hint" }, "Primary color for buttons, links and accents. Applies across the app instantly.", -1)),
              u[22] || (u[22] = v("label", { class: "ap-blabel" }, "Color scheme", -1)),
              v("div", wa, [
                (O(), N(Pe, null, Je([
                  { mode: "auto", label: "Auto", icon: "tabler:device-desktop" },
                  { mode: "light", label: "Light", icon: "tabler:sun" },
                  { mode: "dark", label: "Dark", icon: "tabler:moon" }
                ], (y) => v("button", {
                  key: y.mode,
                  type: "button",
                  class: ve(["ap-theme-mode", a.value === y.mode && "ap-theme-mode-on"]),
                  "aria-pressed": a.value === y.mode,
                  onClick: (T) => ie(y.mode)
                }, [
                  P(m(E), {
                    icon: y.icon,
                    "aria-hidden": "true"
                  }, null, 8, ["icon"]),
                  I(" " + le(y.label), 1)
                ], 10, ka)), 64))
              ]),
              u[23] || (u[23] = v("p", { class: "ap-hint" }, "Auto follows your browser or operating system setting. Changes apply immediately.", -1))
            ]),
            v("section", Sa, [
              v("header", _a, [
                P(m(E), {
                  icon: "tabler:layout-2",
                  "aria-hidden": "true"
                }),
                u[24] || (u[24] = I(" Layout", -1))
              ]),
              u[31] || (u[31] = v("p", { class: "ap-sub" }, "Where navigation sits.", -1)),
              v("div", $a, [
                v("button", {
                  class: ve(["ap-lo", i.value === "vertical" && "ap-lo-on"]),
                  onClick: u[5] || (u[5] = (y) => i.value = "vertical")
                }, [
                  u[26] || (u[26] = v("span", { class: "mock mock-v" }, [
                    v("span", { class: "mock-rail" }, [
                      v("i"),
                      v("i"),
                      v("i")
                    ]),
                    v("span", { class: "mock-fill" })
                  ], -1)),
                  v("span", Ca, [
                    u[25] || (u[25] = I("Vertical ", -1)),
                    i.value === "vertical" ? (O(), De(m(E), {
                      key: 0,
                      icon: "tabler:circle-check-filled",
                      "aria-hidden": "true"
                    })) : U("", !0)
                  ]),
                  u[27] || (u[27] = v("span", { class: "ap-lo-desc" }, "Sidebar rail", -1))
                ], 2),
                v("button", {
                  class: ve(["ap-lo", i.value === "horizontal" && "ap-lo-on"]),
                  onClick: u[6] || (u[6] = (y) => i.value = "horizontal")
                }, [
                  u[29] || (u[29] = v("span", { class: "mock mock-h" }, [
                    v("span", { class: "mock-top" }, [
                      v("i"),
                      v("i"),
                      v("i")
                    ]),
                    v("span", { class: "mock-fill" })
                  ], -1)),
                  v("span", Oa, [
                    u[28] || (u[28] = I("Horizontal ", -1)),
                    i.value === "horizontal" ? (O(), De(m(E), {
                      key: 0,
                      icon: "tabler:circle-check-filled",
                      "aria-hidden": "true"
                    })) : U("", !0)
                  ]),
                  u[30] || (u[30] = v("span", { class: "ap-lo-desc" }, "Top bar", -1))
                ], 2)
              ])
            ]),
            v("section", Ta, [
              v("header", La, [
                P(m(E), {
                  icon: "tabler:info-circle",
                  "aria-hidden": "true"
                }),
                u[32] || (u[32] = I(" How it works", -1))
              ]),
              v("ul", Pa, [
                v("li", null, [
                  P(m(E), {
                    icon: "tabler:grip-vertical",
                    "aria-hidden": "true"
                  }),
                  u[33] || (u[33] = I(" Drag to reorder or move between categories.", -1))
                ]),
                v("li", null, [
                  P(m(E), {
                    icon: "tabler:cursor-text",
                    "aria-hidden": "true"
                  }),
                  u[34] || (u[34] = I(" Click a label to rename it.", -1))
                ]),
                v("li", null, [
                  P(m(E), {
                    icon: "tabler:mood-smile",
                    "aria-hidden": "true"
                  }),
                  u[35] || (u[35] = I(" Click an icon to pick a new Tabler glyph.", -1))
                ]),
                v("li", null, [
                  P(m(E), {
                    icon: "tabler:eye-off",
                    "aria-hidden": "true"
                  }),
                  u[36] || (u[36] = I(" Hide a surface without removing its module.", -1))
                ])
              ])
            ])
          ]),
          v("section", Ea, [
            v("header", Na, [
              P(m(E), {
                icon: "tabler:sitemap",
                "aria-hidden": "true"
              }),
              u[38] || (u[38] = I(" Structure ", -1)),
              v("button", {
                class: "ap-btn ap-btn-ghost ap-add",
                onClick: u[7] || (u[7] = //@ts-ignore
                (...y) => m(Xe) && m(Xe)(...y))
              }, [
                P(m(E), {
                  icon: "tabler:folder-plus",
                  "aria-hidden": "true"
                }),
                u[37] || (u[37] = I(" Add category", -1))
              ])
            ]),
            (O(!0), N(Pe, null, Je(m(W), (y) => (O(), N("div", {
              key: y.key || "_root",
              class: ve(["ap-group", m(Oe) === y.key && "ap-group-over"]),
              onDragover: Ee((T) => Oe.value = y.key, ["prevent"]),
              onDragleave: (T) => m(Oe) === y.key && (Oe.value = null),
              onDrop: Ee((T) => m(Ye)(y.key), ["prevent"])
            }, [
              v("div", {
                class: "ap-group-head",
                onDragover: u[9] || (u[9] = Ee(() => {
                }, ["prevent"])),
                onDrop: Ee((T) => y.real ? m(mt)(y.key) : m(Ye)(y.key), ["prevent", "stop"])
              }, [
                y.real ? (O(), N("span", {
                  key: 0,
                  class: "ap-grip ap-grip-cat",
                  draggable: "true",
                  title: "Drag to reorder category",
                  onDragstart: (T) => m(ft)(y.key, T),
                  onDragend: u[8] || (u[8] = //@ts-ignore
                  (...T) => m(Te) && m(Te)(...T))
                }, [
                  P(m(E), {
                    icon: "tabler:grip-vertical",
                    "aria-hidden": "true"
                  })
                ], 40, Ma)) : (O(), N("span", ja)),
                y.real ? (O(), N(Pe, { key: 2 }, [
                  P(yr, {
                    "model-value": m(xe)(y.key)?.icon || "",
                    fallback: "tabler:folder",
                    "onUpdate:modelValue": (T) => m(bt)(y.key, T)
                  }, null, 8, ["model-value", "onUpdate:modelValue"]),
                  v("input", {
                    value: m(xe)(y.key)?.label,
                    class: "ap-field ap-field-strong",
                    "aria-label": "Category name",
                    placeholder: "Category name",
                    onInput: (T) => m(gt)(y.key, T.target.value)
                  }, null, 40, Ra)
                ], 64)) : (O(), N(Pe, { key: 3 }, [
                  v("span", Da, [
                    P(m(E), {
                      icon: "tabler:layout-list",
                      "aria-hidden": "true"
                    })
                  ]),
                  v("span", Ha, le(y.label), 1)
                ], 64)),
                v("span", Ia, le(m(z)(y.key).length), 1),
                y.real ? (O(), N("button", {
                  key: 4,
                  class: "ap-icon-btn ap-danger",
                  "aria-label": "Remove category",
                  title: "Remove category",
                  onClick: (T) => m(vt)(y.key)
                }, [
                  P(m(E), {
                    icon: "tabler:trash",
                    "aria-hidden": "true"
                  })
                ], 8, Ba)) : U("", !0)
              ], 40, Va),
              m(z)(y.key).length === 0 ? (O(), N("div", za, "Drag a surface here")) : U("", !0),
              (O(!0), N(Pe, null, Je(m(z)(y.key), (T) => (O(), N("div", {
                key: T.id,
                class: ve(["ap-row", m(Me) === T.id && "ap-row-dragging"]),
                onDragover: u[11] || (u[11] = Ee(() => {
                }, ["prevent", "stop"])),
                onDrop: Ee((fe) => m(ht)(T), ["prevent", "stop"])
              }, [
                v("span", {
                  class: "ap-grip",
                  draggable: "true",
                  title: "Drag to reorder or move",
                  onDragstart: (fe) => m(dt)(T, fe),
                  onDragend: u[10] || (u[10] = //@ts-ignore
                  (...fe) => m(Te) && m(Te)(...fe))
                }, [
                  P(m(E), {
                    icon: "tabler:grip-vertical",
                    "aria-hidden": "true"
                  })
                ], 40, Fa),
                P(yr, {
                  "model-value": T.icon || "",
                  fallback: "tabler:square",
                  "onUpdate:modelValue": (fe) => m(M)(T, fe)
                }, null, 8, ["model-value", "onUpdate:modelValue"]),
                v("input", {
                  value: T.label,
                  class: "ap-field ap-field-strong",
                  "aria-label": "Surface label",
                  placeholder: "Label",
                  onInput: (fe) => m(x)(T, fe.target.value)
                }, null, 40, Wa),
                v("span", Ka, le(T.path), 1),
                T.source === "custom" ? (O(), N("span", Ga, "custom")) : U("", !0),
                m(ke)(T) ? (O(), N("span", Ya, [
                  P(m(E), {
                    icon: "tabler:home",
                    "aria-hidden": "true"
                  }),
                  u[39] || (u[39] = I(" home", -1))
                ])) : U("", !0),
                m(H)(T) ? (O(), De(m(E), {
                  key: 2,
                  icon: "tabler:pencil",
                  class: "ap-edited",
                  title: "Customized — reset the field to revert",
                  "aria-hidden": "true"
                })) : U("", !0),
                v("button", {
                  class: ve(["ap-icon-btn", m(ke)(T) && "ap-home-on"]),
                  "aria-label": m(ke)(T) ? "Home page (click to unset)" : "Set as home page",
                  title: m(ke)(T) ? "Home page — click to unset" : "Set as home page",
                  onClick: (fe) => m(yt)(T)
                }, [
                  P(m(E), {
                    icon: m(ke)(T) ? "tabler:home-filled" : "tabler:home",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ], 10, Xa),
                v("button", {
                  class: "ap-icon-btn",
                  "aria-label": "Hide",
                  title: "Hide",
                  onClick: (fe) => m(b)(T, !0)
                }, [
                  P(m(E), {
                    icon: "tabler:eye",
                    "aria-hidden": "true"
                  })
                ], 8, qa)
              ], 42, Ua))), 128))
            ], 42, Aa))), 128)),
            m(ye).length ? (O(), N("div", Za, [
              v("button", {
                class: "ap-hidden-h",
                onClick: u[12] || (u[12] = (y) => p.value = !p.value)
              }, [
                P(m(E), {
                  icon: p.value ? "tabler:chevron-down" : "tabler:chevron-right",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                P(m(E), {
                  icon: "tabler:eye-off",
                  "aria-hidden": "true"
                }),
                I(" Hidden (" + le(m(ye).length) + ") ", 1)
              ]),
              p.value ? (O(), N("div", Qa, [
                (O(!0), N(Pe, null, Je(m(ye), (y) => (O(), N("div", {
                  key: y.id,
                  class: "ap-row ap-row-off"
                }, [
                  u[40] || (u[40] = v("span", {
                    class: "ap-grip ap-grip-ghost",
                    "aria-hidden": "true"
                  }, null, -1)),
                  v("span", Ja, [
                    P(m(E), {
                      icon: y.icon || "tabler:square",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"])
                  ]),
                  v("span", es, le(y.label), 1),
                  v("button", {
                    class: "ap-icon-btn",
                    "aria-label": "Show",
                    title: "Show",
                    onClick: (T) => m(b)(y, !1)
                  }, [
                    P(m(E), {
                      icon: "tabler:eye-plus",
                      "aria-hidden": "true"
                    })
                  ], 8, ts)
                ]))), 128))
              ])) : U("", !0)
            ])) : U("", !0)
          ])
        ]))
      ])
    ]));
  }
}), os = ':root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}.spin{animation:kx-spin 1s linear infinite}@keyframes kx-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.spin{animation:none}}.kx-tag-sm,.kx-tag-sm.kx-tag-sm{display:inline-flex;align-items:center;gap:4px;padding:1px 7px;border-radius:var(--kx-radius-tag, 6px);font-size:10.5px;font-weight:600;line-height:1.5;white-space:nowrap}.kx-tag-sm svg,.kx-tag-sm.kx-tag-sm svg{width:12px;height:12px}.kx-tag-caps,.kx-tag-caps.kx-tag-caps{display:inline-flex;align-items:center;gap:3px;padding:2px 6px;border-radius:var(--kx-radius-tag, 6px);font-size:9px;font-weight:700;line-height:1.5;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap}.kx-tag-caps svg,.kx-tag-caps.kx-tag-caps svg{width:11px;height:11px}:host,:root{--kx-surface-1: color-mix(in srgb, var(--p-content-background) 96%, var(--p-text-color) 4%);--kx-surface-2: color-mix(in srgb, var(--p-content-background) 92%, var(--p-text-color) 8%);--kx-surface-3: color-mix(in srgb, var(--p-content-background) 86%, var(--p-text-color) 14%);--kx-surface-4: color-mix(in srgb, var(--p-content-background) 78%, var(--p-text-color) 22%);--kx-border-strong: color-mix(in srgb, var(--p-content-border-color) 60%, var(--p-text-color) 40%);--kx-border-stronger: color-mix(in srgb, var(--p-content-border-color) 30%, var(--p-text-color) 70%);--kx-text-faint: color-mix(in srgb, var(--p-text-muted-color) 70%, var(--p-content-background) 30%);--kx-text-fainter: color-mix(in srgb, var(--p-text-muted-color) 45%, var(--p-content-background) 55%);--kx-wash-primary: color-mix(in srgb, var(--p-primary-color) 12%, var(--p-content-background) 88%);--kx-wash-success: color-mix(in srgb, var(--p-success-500) 12%, var(--p-content-background) 88%);--kx-wash-info: color-mix(in srgb, var(--p-info-500) 12%, var(--p-content-background) 88%);--kx-wash-warn: color-mix(in srgb, var(--p-warn-500) 12%, var(--p-content-background) 88%);--kx-wash-danger: color-mix(in srgb, var(--p-danger-500) 12%, var(--p-content-background) 88%);--kx-wash-help: color-mix(in srgb, var(--p-help-500) 12%, var(--p-content-background) 88%);--kx-font-heading: "Outfit", system-ui, sans-serif;--kx-font-body: "Inter", system-ui, sans-serif;--kx-radius-4: 4px;--kx-radius-6: 6px;--kx-radius-8: 8px;--kx-radius-10: 10px;--kx-radius-14: 14px;--kx-radius-16: 16px;--kx-radius-tag: var(--p-content-border-radius, 6px);--kx-control-height: 34px;--kx-control-height-sm: 30px;--kx-rail-width: 264px;--kx-reading-measure: 880px;--kx-row-height: 32px;--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .08);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .12);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .18);--kx-overlay-hover: color-mix(in srgb, var(--p-text-color) 7%, transparent);--kx-overlay-subtle: color-mix(in srgb, var(--p-text-color) 4%, transparent)}@media(prefers-color-scheme:dark){:host(:not(.w-theme-light)),:root:not(.w-theme-light){--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .35);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .45);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .6)}}:host(.w-theme-dark),:root.w-theme-dark{--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .35);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .45);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .6)}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}:host{display:block;height:100%;min-height:0}:host>div{height:100%;min-height:0}*,*:before,*:after{box-sizing:border-box}.ap{--system-surface-gutter: var(--kickside-system-surface-gutter, 24px);height:100%;display:flex;flex-direction:column;color:var(--p-text-color);background:var(--p-content-background)}.ap-bar{display:flex;align-items:center;justify-content:flex-end;gap:10px;width:100%;margin:0;padding:12px var(--system-surface-gutter);background:var(--p-content-background);position:sticky;top:0;z-index:3}.ap-dirty{display:inline-flex;align-items:center;height:34px;font-size:12px;font-weight:600;color:var(--p-warn-600, var(--p-warn-500));background:color-mix(in srgb,var(--p-warn-500) 16%,transparent);padding:0 11px;border-radius:8px}.ap-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:34px;padding:0 14px;border-radius:8px;border:1px solid transparent;font:inherit;font-size:13px;font-weight:600;cursor:pointer;transition:filter .15s,background .15s,opacity .15s}.ap-btn:disabled{opacity:.45;cursor:default}.ap-btn-primary{background:var(--p-primary-color);color:var(--p-button-primary-color)}.ap-btn-primary:hover:not(:disabled){filter:brightness(1.05)}.ap-btn-ghost{background:transparent;border-color:var(--p-content-border-color);color:var(--p-text-color)}.ap-btn-ghost:hover:not(:disabled){background:color-mix(in srgb,var(--p-text-color) 8%,transparent)}.ap-btn svg{width:16px;height:16px}.ap-msg{width:calc(100% - (var(--system-surface-gutter) * 2));margin:12px 0 0 var(--system-surface-gutter);padding:9px 12px;border-radius:8px;font-size:13px}.ap-err{background:color-mix(in srgb,var(--p-danger-500) 12%,transparent);color:var(--p-danger-600, var(--p-danger-500))}.ap-loading{display:flex;align-items:center;gap:8px;color:var(--p-text-muted-color);font-size:13px;padding:24px}.ap-body{flex:1;overflow-y:auto;padding:0 0 28px}.ap-grid{display:grid;grid-template-columns:290px minmax(0,1fr);gap:16px;align-items:start;width:100%;margin:0;padding:6px var(--system-surface-gutter) 0}.ap-side{position:sticky;top:58px;display:flex;flex-direction:column;gap:16px}@media(max-width:880px){.ap-grid{grid-template-columns:1fr}.ap-side{position:static}}.ap-card{background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:14px;padding:16px 18px}.ap-structure{min-height:0}.ap-h{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:800;color:var(--p-text-color);letter-spacing:-.2px}.ap-h svg{width:17px;height:17px;color:var(--p-text-muted-color)}.ap-add{margin-left:auto;height:30px;padding:0 10px}.ap-sub{font-size:12.5px;color:var(--p-text-muted-color);margin:4px 0 12px}.ap-blabel{display:block;font-size:11.5px;font-weight:700;color:var(--p-text-muted-color);text-transform:uppercase;letter-spacing:.04em;margin:12px 0 6px}.ap-binput{width:100%;height:34px;padding:0 12px;border-radius:8px;border:1px solid var(--p-content-border-color);background:var(--p-content-background);color:var(--p-text-color);font:inherit;font-size:13px;box-sizing:border-box}.ap-logo{display:flex;align-items:center;gap:12px}.ap-logo-prev{display:flex;align-items:center;justify-content:center;width:56px;height:56px;flex:none;border-radius:11px;border:1px solid var(--p-content-border-color);background:color-mix(in srgb,var(--p-text-color) 4%,transparent);overflow:hidden}.ap-logo-prev img{width:100%;height:100%;object-fit:contain}.ap-logo-prev svg{width:22px;height:22px;color:var(--p-text-muted-color)}.ap-logo-actions{display:flex;flex-wrap:wrap;gap:8px}.ap-btn-busy{opacity:.7;pointer-events:none}.ap-file{position:absolute;width:1px;height:1px;opacity:0;overflow:hidden}.ap-hint{font-size:11.5px;color:var(--p-text-muted-color);margin:8px 0 0}.ap-tone-warn{display:flex;align-items:flex-start;gap:6px;margin:8px 0 0;font-size:11.5px;font-weight:600;line-height:1.35;color:var(--p-danger-600, var(--p-danger-500))}.ap-tone-warn svg{width:14px;height:14px;flex:none;margin-top:1px}.ap-dirty-warn{color:var(--p-danger-600, var(--p-danger-500));background:color-mix(in srgb,var(--p-danger-500) 16%,transparent)}.ap-tone{display:flex;align-items:center;gap:8px}.ap-tone-swatch{flex:none;display:inline-flex}.ap-tone-preview{width:40px;height:34px;border-radius:8px;border:1px solid var(--p-content-border-color);cursor:pointer}.ap-tone-hex{flex:1}.ap-theme-modes{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:2px;padding:3px;border-radius:8px;background:color-mix(in srgb,var(--p-text-color) 5%,transparent)}.ap-theme-mode{display:inline-flex;align-items:center;justify-content:center;gap:5px;min-width:0;height:28px;padding:0 6px;border:0;border-radius:6px;background:transparent;color:var(--p-text-muted-color);cursor:pointer;font:inherit;font-size:12px;font-weight:600}.ap-theme-mode svg{width:15px;height:15px;flex:none}.ap-theme-mode:hover{color:var(--p-text-color)}.ap-theme-mode-on{color:var(--p-text-color);background:var(--p-content-background);box-shadow:0 1px 3px color-mix(in srgb,var(--p-text-color) 12%,transparent)}.ap-layouts{display:grid;grid-template-columns:1fr 1fr;gap:10px}.ap-lo{display:flex;flex-direction:column;gap:8px;padding:11px;background:var(--p-content-background);border:2px solid var(--p-content-border-color);border-radius:14px;cursor:pointer;transition:border-color .15s,transform .15s;text-align:left}.ap-lo:hover{transform:translateY(-1px);border-color:color-mix(in srgb,var(--p-text-color) 24%,var(--p-content-border-color))}.ap-lo-on{border-color:var(--p-primary-color)}.ap-lo-name{display:flex;align-items:center;gap:5px;font-size:13px;font-weight:700;color:var(--p-text-color)}.ap-lo-name svg{width:15px;height:15px;color:var(--p-primary-color)}.ap-lo-desc{font-size:11.5px;color:var(--p-text-muted-color)}.mock{display:block;height:56px;border:1px solid var(--p-content-border-color);border-radius:8px;overflow:hidden;background:color-mix(in srgb,var(--p-text-color) 4%,var(--p-content-background))}.mock-v{display:flex}.mock-v .mock-rail{width:26%;background:color-mix(in srgb,var(--p-text-color) 8%,var(--p-content-background));display:flex;flex-direction:column;gap:5px;padding:7px 6px}.mock-v .mock-rail i{height:5px;border-radius:3px;background:color-mix(in srgb,var(--p-text-color) 22%,transparent)}.mock-v .mock-fill{flex:1}.mock-h{display:flex;flex-direction:column}.mock-h .mock-top{height:30%;background:color-mix(in srgb,var(--p-text-color) 8%,var(--p-content-background));display:flex;gap:6px;align-items:center;padding:0 7px}.mock-h .mock-top i{width:16px;height:5px;border-radius:3px;background:color-mix(in srgb,var(--p-text-color) 22%,transparent)}.mock-h .mock-fill{flex:1}.ap-lo-on .mock-rail i,.ap-lo-on .mock-top i{background:var(--p-primary-color)}.ap-legend .ap-tips{list-style:none;margin:10px 0 0;padding:0;display:flex;flex-direction:column;gap:9px}.ap-legend .ap-tips li{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--p-text-color)}.ap-legend .ap-tips svg{width:15px;height:15px;color:var(--p-text-muted-color);flex-shrink:0}.ap-group{border:1px solid var(--p-content-border-color);border-radius:14px;margin-top:12px;overflow:hidden;transition:border-color .12s,box-shadow .12s}.ap-group-over{border-color:var(--p-primary-color);box-shadow:0 0 0 3px color-mix(in srgb,var(--p-primary-color) 14%,transparent)}.ap-group-head{display:flex;align-items:center;gap:9px;padding:9px 12px;background:color-mix(in srgb,var(--p-text-color) 4%,var(--p-content-background));border-bottom:1px solid var(--p-content-border-color)}.ap-count{margin-left:auto;font-size:11px;color:var(--p-text-muted-color);background:color-mix(in srgb,var(--p-text-color) 8%,var(--p-content-background));padding:1px 8px;border-radius:999px;font-variant-numeric:tabular-nums;flex-shrink:0}.ap-grip{display:flex;align-items:center;justify-content:center;width:22px;cursor:grab;color:color-mix(in srgb,var(--p-text-muted-color) 70%,transparent);flex-shrink:0}.ap-grip:active{cursor:grabbing}.ap-grip:hover{color:var(--p-text-color)}.ap-grip svg{width:16px;height:16px}.ap-grip-cat svg{width:15px;height:15px}.ap-grip-ghost{cursor:default}.ap-drop-hint{font-size:12px;color:color-mix(in srgb,var(--p-text-muted-color) 70%,transparent);padding:14px;text-align:center;font-style:italic}.ap-row{display:flex;align-items:center;gap:9px;padding:8px 12px 8px 6px;border-bottom:1px solid var(--p-content-border-color);background:var(--p-content-background)}.ap-row:last-child{border-bottom:none}.ap-row:hover{background:color-mix(in srgb,var(--p-text-color) 4%,var(--p-content-background))}.ap-row-dragging{opacity:.4}.ap-row-off{opacity:.8;padding-left:6px}.ap-tile{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-text-color) 8%,var(--p-content-background));color:var(--p-text-color);flex-shrink:0}.ap-tile-muted{color:var(--p-text-muted-color)}.ap-tile svg{width:18px;height:18px}.wc-iconfield{display:inline-flex;align-items:center;flex-shrink:0}.ap-field{min-width:0;background:transparent;border:1px solid transparent;border-radius:8px;padding:6px 9px;font:inherit;font-size:13px;color:var(--p-text-color);transition:border-color .12s,background .12s}.ap-field-strong{flex:1;font-weight:600}.ap-field:not(.ap-field-static):hover{border-color:var(--p-content-border-color)}.ap-field:focus{background:var(--p-content-background)}.ap-field-static{border-color:transparent;cursor:default;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ap-path{font-family:ui-monospace,monospace;font-size:11.5px;color:color-mix(in srgb,var(--p-text-muted-color) 80%,transparent);flex-shrink:0;white-space:nowrap}@media(max-width:640px){.ap-path{display:none}}.ap-pill{flex-shrink:0;color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 14%,transparent)}.ap-edited{width:14px;height:14px;color:var(--p-primary-color);flex-shrink:0}.ap-icon-btn{width:30px;height:30px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;border:1px solid transparent;background:transparent;color:var(--p-text-muted-color);cursor:pointer;flex-shrink:0;transition:background .15s,color .15s}.ap-icon-btn:hover{color:var(--p-text-color);background:color-mix(in srgb,var(--p-text-color) 8%,transparent)}.ap-icon-btn svg{width:16px;height:16px}.ap-danger:hover{color:var(--p-danger-600, var(--p-danger-500))}.ap-home-on{color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 12%,transparent)}.ap-home-on:hover{color:var(--p-primary-color)}.ap-pill-home svg{width:11px;height:11px}.ap-hidden{margin-top:14px}.ap-hidden-h{display:flex;align-items:center;gap:6px;width:100%;font-size:12px;font-weight:600;color:var(--p-text-color);background:transparent;border:none;padding:6px 2px;cursor:pointer}.ap-hidden-h svg{width:15px;height:15px}.ap-hidden-list{border:1px dashed var(--p-content-border-color);border-radius:14px;margin-top:4px;overflow:hidden}', ns = { props: { type: "object", properties: {} } }, is = {
  wippy: ns
};
class as extends on {
  static get wippyConfig() {
    return {
      propsSchema: is.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: os
    };
  }
  static get vueConfig() {
    return { rootComponent: rs, plugins: [Ni] };
  }
}
Oo(import.meta.url, as);
//# sourceMappingURL=index.js.map
