import { hasInjectionContext as ho, inject as Lr, effectScope as fo, ref as A, markRaw as mo, onMounted as ut, onUnmounted as vo, watch as be, createApp as go, readonly as bo, getCurrentInstance as Kt, nextTick as yo, reactive as xo, renderSlot as st, openBlock as C, createBlock as He, Teleport as Pr, createCommentVNode as z, useId as wo, mergeProps as oe, h as ko, defineComponent as Er, onBeforeUnmount as Nr, createElementBlock as N, resolveComponent as So, createVNode as T, withCtx as Gt, Transition as _o, createElementVNode as m, computed as de, toDisplayString as re, unref as v, normalizeClass as me, createTextVNode as D, withDirectives as Yt, vModelText as Xt, Fragment as Pe, renderList as Je, withModifiers as Ee } from "vue";
import { addCollection as $o, Icon as P } from "@iconify/vue";
import { config as qt, addIcons as Co, on as Ar, applyThemeMode as et, host as at, hostCss as Oo, loadCss as To, loadByTagName as Lo, api as it, define as Po } from "@wippy-fe/proxy";
var Ct = "data-wippy-visible";
function Zt(e) {
  const t = e.getAttribute(Ct);
  return t === "true" ? !0 : t === "false" ? !1 : null;
}
var Eo = Object.defineProperty, No = (e, t, r) => t in e ? Eo(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, j = (e, t, r) => No(e, typeof t != "symbol" ? t + "" : t, r), Ao = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], Vo = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function Qt(e) {
  const t = e.startsWith("--") ? e : `--${e}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(t) ? t : null;
}
function Mo(...e) {
  const t = /* @__PURE__ */ new Set();
  for (const r of e)
    if (r)
      for (const [o, n] of Object.entries(r)) {
        if ((o === "@light" || o === "@dark") && n && typeof n == "object") {
          for (const [i, s] of Object.entries(n)) {
            const l = typeof s == "string" ? Qt(i) : null;
            l && t.add(l);
          }
          continue;
        }
        const a = typeof n == "string" ? Qt(o) : null;
        a && t.add(a);
      }
  return [...t].sort();
}
function Ro(e) {
  if (e.length === 0)
    return "";
  const t = e.map((r) => `  ${r}: inherit;`).join(`
`);
  return `${Vo} {
${t}
}`;
}
function jo(e, t) {
  const r = Ro(t);
  r && Vr(e, r, "@wippy-fe/css-variables-bridge");
}
function Do(e, t) {
  const o = (t ?? Ao).map(async (n) => {
    const a = Oo[n];
    if (!a)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${n}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await To(a);
    } catch (i) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${n}" (${a}):`, i), null;
    }
  });
  return Promise.all(o).then((n) => {
    for (const a of n) {
      if (!a)
        continue;
      const i = document.createElement("style");
      i.textContent = a, i.setAttribute("role", "@wippy-fe/host-css"), e.appendChild(i);
    }
  });
}
function Ho(e, t) {
  const r = document.createElement("style");
  r.textContent = t, e.appendChild(r);
}
function Vr(e, t, r) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const n = new CSSStyleSheet();
    n.replaceSync(t), e.adoptedStyleSheets = [...e.adoptedStyleSheets, n];
    return;
  }
  const o = document.createElement("style");
  o.setAttribute("role", r), o.textContent = t, e.appendChild(o);
}
function Io(e, t) {
  Vr(e, t, "@wippy-fe/custom-css");
}
function Mr(e) {
  return e.__wippyHost ?? null;
}
function Bo(e) {
  return e.replace(/-([a-z])/g, (t, r) => r.toUpperCase());
}
function zo(e, t, r) {
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
function kt(e, t) {
  const r = {}, o = [];
  for (const [n, a] of Object.entries(t.properties)) {
    const i = e.getAttribute(n), s = Bo(n);
    if (i === null) {
      a.default !== void 0 && (r[s] = a.default);
      continue;
    }
    const l = zo(n, i, a);
    l.error ? o.push(l.error) : r[s] = l.value;
  }
  return { props: r, errors: o };
}
var Uo = class {
  constructor(e, t) {
    j(this, "_props"), j(this, "_errors"), j(this, "_content"), j(this, "_hostVisibility"), j(this, "_propsListeners", /* @__PURE__ */ new Set()), j(this, "_contentListeners", /* @__PURE__ */ new Set()), j(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), j(this, "_disposed", !1), j(this, "_emitToDom"), j(this, "props"), j(this, "events"), j(this, "content"), j(this, "hostVisibility"), this._props = e.props, this._errors = e.errors, this._content = e.content, this._hostVisibility = e.hostVisibility, this._emitToDom = t;
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
}, Fo = class extends HTMLElement {
  constructor() {
    super(), j(this, "_internals"), j(this, "_contentObserver", null), j(this, "_initialized", !1), j(this, "_container", null), j(this, "_reactive", null), j(this, "_lastProps", null), j(this, "_lastErrors", []), j(this, "_lastContent", null), j(this, "_themeUnsub", null), j(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = Zt(this);
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
    return [.../* @__PURE__ */ new Set([...t, ...r, Ct])];
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
    return Mr(this);
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
        const a = kt(this, e.propsSchema);
        e.validateProps && a.errors.push(...e.validateProps(a.props)), r = a.props, o = a.errors, this._lastProps = r, this._lastErrors = o;
      }
      const n = t ? this._lastContent ?? this._extractContent(e.contentTemplate) : null;
      t && this._lastContent === null && (this._lastContent = n), this._reactive = new Uo(
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
        this.onInit(r), e.inlineCss && Ho(r, e.inlineCss);
        try {
          const c = qt?.theming, p = Mo(
            c?.global?.cssVariables,
            c?.children?.cssVariables
          );
          jo(r, p);
        } catch {
        }
        if (e.customCss !== !1)
          try {
            const c = qt?.theming, p = [c?.global?.customCSS, c?.children?.customCSS].filter(Boolean).join(`
`);
            p && Io(r, p);
          } catch {
          }
        (e.hostCssKeys === void 0 || e.hostCssKeys.length > 0) && Do(r, e.hostCssKeys), o = document.createElement("div"), o.setAttribute("data-wippy-theme-root", "");
        const l = e.containerClasses ?? [];
        l.length > 0 && o.classList.add(...l), r.appendChild(o), this._container = o, Co($o);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = Ar("@theme", (l) => this._applyTheme(l)));
      const { props: n, errors: a } = kt(this, e.propsSchema);
      e.validateProps && a.push(...e.validateProps(n));
      const i = n;
      this._lastProps = i, this._lastErrors = a;
      let s = null;
      e.contentTemplate && (s = this._extractContent(e.contentTemplate), this._lastContent = s, this._contentObserver = new MutationObserver(() => {
        const l = this._extractContent(e.contentTemplate);
        this._lastContent = l, this._reactive?.notifyContent(l), this.onContentChanged(l);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(r, o, i, a, s, t), this._internals.states.delete("loading"), this._internals.states.add("ready"), t || (this._initialized = !0), this.onReady(), this.emitEvent("load");
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
  _applyTheme(e = at.getThemeMode?.()) {
    et(e, this), this._container && et(e, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), et("auto", this), this._container && et("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(e, t, r) {
    if (t === r)
      return;
    if (e === Ct) {
      const s = this._hostVisible, l = Zt(this);
      if (l === s)
        return;
      this._hostVisible = l, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(l, s), this.onHostVisibilityChanged(l, s));
      return;
    }
    const o = this.constructor.wippyConfig, { props: n, errors: a } = kt(this, o.propsSchema);
    o.validateProps && a.push(...o.validateProps(n));
    const i = n;
    this._lastProps = i, this._lastErrors = a, this._reactive?.notifyProps(i, a), this.onPropsChanged(i, a);
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
function Wo(e) {
  return e.__wippyHostBus ?? null;
}
function Ko(e) {
  return e.dataset.wippyPanelId ?? null;
}
/*!
 * pinia v4.0.3
 * (c) 2026 Eduardo San Martin Morote
 * @license MIT
 */
let Rr;
const jr = (e) => Rr = e, Go = () => ho() && Lr(Dr) || Rr, Dr = (
  /* istanbul ignore next */
  Symbol()
);
function Yo() {
  const e = fo(!0), t = e.run(() => A({}));
  let r = [], o = [];
  const n = mo({
    install(a) {
      jr(n), n._a = a, a.provide(Dr, n), a.config.globalProperties.$pinia = n, o.forEach((i) => r.push(i)), o = [];
    },
    use(a) {
      return this._a ? r.push(a) : o.push(a), this;
    },
    _p: r,
    _a: null,
    _e: e,
    _s: /* @__PURE__ */ new Map(),
    state: t
  });
  return n;
}
var Xo = Object.defineProperty, qo = (e, t, r) => t in e ? Xo(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, Ne = (e, t, r) => qo(e, typeof t != "symbol" ? t + "" : t, r), Zo = /* @__PURE__ */ Symbol("wippy:emit"), Qo = /* @__PURE__ */ Symbol("wippy:props"), Jo = /* @__PURE__ */ Symbol("wippy:props_error"), en = /* @__PURE__ */ Symbol("wippy:content"), tn = /* @__PURE__ */ Symbol("wippy:panel-id"), rn = /* @__PURE__ */ Symbol("wippy:layout-bus"), on = /* @__PURE__ */ Symbol("wippy:host"), Hr = /* @__PURE__ */ Symbol("wippy:host-visibility");
function nn() {
  const e = Lr(Hr);
  if (!e)
    throw new Error("useHostVisibility() must be called inside a WippyVueElement");
  return e;
}
function an(e) {
  const t = nn();
  let r = !1, o = null, n = !1;
  function a() {
    if (o)
      return n = !0, o;
    let i;
    try {
      i = Promise.resolve(e());
    } catch (l) {
      i = Promise.reject(l);
    }
    const s = i.finally(() => {
      if (o === s && (o = null, r && n))
        return n = !1, a();
    });
    return o = s, s;
  }
  return ut(() => (r = !0, a())), vo(() => {
    r = !1, n = !1;
  }), be(t, (i, s) => {
    if (r && s === !1 && i === !0)
      return a();
  }), t;
}
var sn = class extends Fo {
  constructor() {
    super(...arguments), Ne(this, "_vueApp", null), Ne(this, "_propsRef", A({})), Ne(this, "_errorsRef", A([])), Ne(this, "_contentRef", A(null)), Ne(this, "_hostVisibilityRef", A(null)), Ne(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  onMount(e, t, r, o, n, a) {
    const i = this.constructor.vueConfig;
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
      const p = Go(), h = go(c.rootComponent);
      this._vueApp = h;
      const d = Yo();
      if (c.piniaPlugins)
        for (const f of c.piniaPlugins)
          d.use(f);
      if (h.use(d), c.plugins)
        for (const f of c.plugins)
          h.use(f);
      h.provide(Qo, this._propsRef), h.provide(Jo, this._errorsRef), h.provide(Zo, this.emitEvent.bind(this)), h.provide(en, this._contentRef), h.provide(Hr, this._hostVisibilityRef), h.provide(tn, Ko(this)), h.provide(rn, Wo(this)), h.provide(on, Mr(this)), c.providers && c.providers(h, this), h.mount(t), p && jr(p);
    };
    if (i.rootComponent)
      l(i);
    else if (i.lazyConfig) {
      const c = document.createElement("wippy-loading");
      c.setAttribute("no-bg", ""), t.appendChild(c), i.lazyConfig().then((p) => {
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
}, ln = Object.defineProperty, Jt = Object.getOwnPropertySymbols, cn = Object.prototype.hasOwnProperty, pn = Object.prototype.propertyIsEnumerable, er = (e, t, r) => t in e ? ln(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, un = (e, t) => {
  for (var r in t || (t = {})) cn.call(t, r) && er(e, r, t[r]);
  if (Jt) for (var r of Jt(t)) pn.call(t, r) && er(e, r, t[r]);
  return e;
};
function Vt(e) {
  return e == null || e === "" || Array.isArray(e) && e.length === 0 || !(e instanceof Date) && typeof e == "object" && Object.keys(e).length === 0;
}
function Ir(e) {
  return typeof e == "function" && "call" in e && "apply" in e;
}
function R(e) {
  return !Vt(e);
}
function ke(e, t = !0) {
  return e instanceof Object && e.constructor === Object && (t || Object.keys(e).length !== 0);
}
function Br(e = {}, t = {}) {
  let r = un({}, e);
  return Object.keys(t).forEach((o) => {
    let n = o;
    ke(t[n]) && n in e && ke(e[n]) ? r[n] = Br(e[n], t[n]) : r[n] = t[n];
  }), r;
}
function dn(...e) {
  return e.reduce((t, r, o) => o === 0 ? r : Br(t, r), {});
}
function le(e, ...t) {
  return Ir(e) ? e(...t) : e;
}
function ve(e, t = !0) {
  return typeof e == "string" && (t || e !== "");
}
function _e(e) {
  return ve(e) ? e.replace(/(-|_)/g, "").toLowerCase() : e;
}
function zr(e, t = "", r = {}) {
  let o = _e(t).split("."), n = o.shift();
  if (n) {
    if (ke(e)) {
      let a = Object.keys(e).find((i) => _e(i) === n) || "";
      return zr(le(e[a], r), o.join("."), r);
    }
    return;
  }
  return le(e, r);
}
function hn(e, t = !0) {
  return Array.isArray(e) && (t || e.length !== 0);
}
function fn(e) {
  return R(e) && !isNaN(e);
}
function $e(e, t) {
  if (t) {
    let r = t.test(e);
    return t.lastIndex = 0, r;
  }
  return !1;
}
function mn(...e) {
  return dn(...e);
}
function Be(e) {
  return e && e.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function Ur(e) {
  return ve(e) ? e.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : e;
}
function Mt() {
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
function vn(e, t) {
  return e ? e.classList ? e.classList.contains(t) : new RegExp("(^| )" + t + "( |$)", "gi").test(e.className) : !1;
}
function tr(e, t) {
  if (e && t) {
    let r = (o) => {
      vn(e, o) || (e.classList ? e.classList.add(o) : e.className += " " + o);
    };
    [t].flat().filter(Boolean).forEach((o) => o.split(" ").forEach(r));
  }
}
function gn(e, t) {
  if (e && t) {
    let r = (o) => {
      e.classList ? e.classList.remove(o) : e.className = e.className.replace(new RegExp("(^|\\b)" + o.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [t].flat().filter(Boolean).forEach((o) => o.split(" ").forEach(r));
  }
}
function Ot(e) {
  for (let t of document?.styleSheets) try {
    for (let r of t?.cssRules) for (let o of r?.style) if (e.test(o)) return { name: o, value: r.style.getPropertyValue(o).trim() };
  } catch {
  }
  return null;
}
function Fr(e) {
  let t = { width: 0, height: 0 };
  if (e) {
    let [r, o] = [e.style.visibility, e.style.display], n = e.getBoundingClientRect();
    e.style.visibility = "hidden", e.style.display = "block", t.width = n.width || e.offsetWidth, t.height = n.height || e.offsetHeight, e.style.display = o, e.style.visibility = r;
  }
  return t;
}
function Wr() {
  let e = window, t = document, r = t.documentElement, o = t.getElementsByTagName("body")[0], n = e.innerWidth || r.clientWidth || o.clientWidth, a = e.innerHeight || r.clientHeight || o.clientHeight;
  return { width: n, height: a };
}
function bn(e) {
  return e ? Math.abs(e.scrollLeft) : 0;
}
function yn() {
  let e = document.documentElement;
  return (window.pageXOffset || bn(e)) - (e.clientLeft || 0);
}
function xn() {
  let e = document.documentElement;
  return (window.pageYOffset || e.scrollTop) - (e.clientTop || 0);
}
function wn(e) {
  return e ? getComputedStyle(e).direction === "rtl" : !1;
}
function kn(e, t, r = !0) {
  var o, n, a, i;
  if (e) {
    let s = e.offsetParent ? { width: e.offsetWidth, height: e.offsetHeight } : Fr(e), l = s.height, c = s.width, p = t.offsetHeight, h = t.offsetWidth, d = t.getBoundingClientRect(), f = xn(), S = yn(), $ = Wr(), _, k, E = "top";
    d.top + p + l > $.height ? (_ = d.top + f - l, E = "bottom", _ < 0 && (_ = f)) : _ = p + d.top + f, d.left + c > $.width ? k = Math.max(0, d.left + S + h - c) : k = d.left + S, wn(e) ? e.style.insetInlineEnd = k + "px" : e.style.insetInlineStart = k + "px", e.style.top = _ + "px", e.style.transformOrigin = E, r && (e.style.marginTop = E === "bottom" ? `calc(${(n = (o = Ot(/-anchor-gutter$/)) == null ? void 0 : o.value) != null ? n : "2px"} * -1)` : (i = (a = Ot(/-anchor-gutter$/)) == null ? void 0 : a.value) != null ? i : "");
  }
}
function Sn(e, t, r = !0, o = void 0) {
  var n;
  if (e) {
    let a = e.offsetParent ? { width: e.offsetWidth, height: e.offsetHeight } : Fr(e), i = t.offsetHeight, s = t.getBoundingClientRect(), l = Wr(), c, p, h = o ?? "top";
    if (!o && s.top + i + a.height > l.height ? (c = -1 * a.height, h = "bottom", s.top + c < 0 && (c = -1 * s.top)) : c = i, a.width > l.width ? p = s.left * -1 : s.left + a.width > l.width ? p = (s.left + a.width - l.width) * -1 : p = 0, e.style.top = c + "px", e.style.insetInlineStart = p + "px", e.style.transformOrigin = h, r) {
      let d = (n = Ot(/-anchor-gutter$/)) == null ? void 0 : n.value;
      e.style.marginTop = h === "bottom" ? `calc(${d ?? "2px"} * -1)` : d ?? "";
    }
  }
}
function Kr(e) {
  if (e) {
    let t = e.parentNode;
    return t && t instanceof ShadowRoot && t.host && (t = t.host), t;
  }
  return null;
}
function _n(e) {
  return !!(e !== null && typeof e < "u" && e.nodeName && Kr(e));
}
function dt(e) {
  return typeof Element < "u" ? e instanceof Element : e !== null && typeof e == "object" && e.nodeType === 1 && typeof e.nodeName == "string";
}
function Tt(e, t = {}) {
  if (dt(e)) {
    let r = (o, n) => {
      var a, i;
      let s = (a = e?.$attrs) != null && a[o] ? [(i = e?.$attrs) == null ? void 0 : i[o]] : [];
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
        let a = o.match(/^on(.+)/);
        a ? e.addEventListener(a[1].toLowerCase(), n) : o === "p-bind" || o === "pBind" ? Tt(e, n) : (n = o === "class" ? [...new Set(r("class", n))].join(" ").trim() : o === "style" ? r("style", n).join(";").trim() : n, (e.$attrs = e.$attrs || {}) && (e.$attrs[o] = n), e.setAttribute(o, n));
      }
    });
  }
}
function Gr(e, t) {
  return dt(e) ? e.matches(t) ? e : e.querySelector(t) : null;
}
function Yr(e, t = []) {
  let r = Kr(e);
  return r === null ? t : Yr(r, t.concat([r]));
}
function $n(e) {
  let t = [];
  if (e) {
    let r = Yr(e), o = /(auto|scroll)/, n = (a) => {
      try {
        let i = window.getComputedStyle(a, null);
        return o.test(i.getPropertyValue("overflow")) || o.test(i.getPropertyValue("overflowX")) || o.test(i.getPropertyValue("overflowY"));
      } catch {
        return !1;
      }
    };
    for (let a of r) {
      let i = a.nodeType === 1 && a.dataset.scrollselectors;
      if (i) {
        let s = i.split(",");
        for (let l of s) {
          let c = Gr(a, l);
          c && n(c) && t.push(c);
        }
      }
      a.nodeType !== 9 && n(a) && t.push(a);
    }
  }
  return t;
}
function Xr() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function Cn() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}
function On(e, t = "", r) {
  dt(e) && r !== null && r !== void 0 && e.setAttribute(t, r);
}
function Tn() {
  let e = [], t = (i, s, l = 999) => {
    let c = n(i, s, l), p = c.value + (c.key === i ? 0 : l) + 1;
    return e.push({ key: i, value: p }), p;
  }, r = (i) => {
    e = e.filter((s) => s.value !== i);
  }, o = (i, s) => n(i).value, n = (i, s, l = 0) => [...e].reverse().find((c) => !0) || { key: i, value: l }, a = (i) => i && parseInt(i.style.zIndex, 10) || 0;
  return { get: a, set: (i, s, l) => {
    s && (s.style.zIndex = String(t(i, !0, l)));
  }, clear: (i) => {
    i && (r(a(i)), i.style.zIndex = "");
  }, getCurrent: (i) => o(i) };
}
var St = Tn(), Ln = Object.defineProperty, Pn = Object.defineProperties, En = Object.getOwnPropertyDescriptors, lt = Object.getOwnPropertySymbols, qr = Object.prototype.hasOwnProperty, Zr = Object.prototype.propertyIsEnumerable, rr = (e, t, r) => t in e ? Ln(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, he = (e, t) => {
  for (var r in t || (t = {})) qr.call(t, r) && rr(e, r, t[r]);
  if (lt) for (var r of lt(t)) Zr.call(t, r) && rr(e, r, t[r]);
  return e;
}, _t = (e, t) => Pn(e, En(t)), ge = (e, t) => {
  var r = {};
  for (var o in e) qr.call(e, o) && t.indexOf(o) < 0 && (r[o] = e[o]);
  if (e != null && lt) for (var o of lt(e)) t.indexOf(o) < 0 && Zr.call(e, o) && (r[o] = e[o]);
  return r;
}, Nn = Mt(), q = Nn, ze = /{([^}]*)}/g, Qr = /(\d+\s+[\+\-\*\/]\s+\d+)/g, Jr = /var\([^)]+\)/g;
function or(e) {
  return ve(e) ? e.replace(/[A-Z]/g, (t, r) => r === 0 ? t : "." + t.toLowerCase()).toLowerCase() : e;
}
function An(e) {
  return ke(e) && e.hasOwnProperty("$value") && e.hasOwnProperty("$type") ? e.$value : e;
}
function Vn(e) {
  return e.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function Lt(e = "", t = "") {
  return Vn(`${ve(e, !1) && ve(t, !1) ? `${e}-` : e}${t}`);
}
function eo(e = "", t = "") {
  return `--${Lt(e, t)}`;
}
function Mn(e = "") {
  let t = (e.match(/{/g) || []).length, r = (e.match(/}/g) || []).length;
  return (t + r) % 2 !== 0;
}
function to(e, t = "", r = "", o = [], n) {
  if (ve(e)) {
    let a = e.trim();
    if (Mn(a)) return;
    if ($e(a, ze)) {
      let i = a.replaceAll(ze, (s) => {
        let l = s.replace(/{|}/g, "").split(".").filter((c) => !o.some((p) => $e(c, p)));
        return `var(${eo(r, Ur(l.join("-")))}${R(n) ? `, ${n}` : ""})`;
      });
      return $e(i.replace(Jr, "0"), Qr) ? `calc(${i})` : i;
    }
    return a;
  } else if (fn(e)) return e;
}
function Rn(e, t, r) {
  ve(t, !1) && e.push(`${t}:${r};`);
}
function Ae(e, t) {
  return e ? `${e}{${t}}` : "";
}
function ro(e, t) {
  if (e.indexOf("dt(") === -1) return e;
  function r(i, s) {
    let l = [], c = 0, p = "", h = null, d = 0;
    for (; c <= i.length; ) {
      let f = i[c];
      if ((f === '"' || f === "'" || f === "`") && i[c - 1] !== "\\" && (h = h === f ? null : f), !h && (f === "(" && d++, f === ")" && d--, (f === "," || c === i.length) && d === 0)) {
        let S = p.trim();
        S.startsWith("dt(") ? l.push(ro(S, s)) : l.push(o(S)), p = "", c++;
        continue;
      }
      f !== void 0 && (p += f), c++;
    }
    return l;
  }
  function o(i) {
    let s = i[0];
    if ((s === '"' || s === "'" || s === "`") && i[i.length - 1] === s) return i.slice(1, -1);
    let l = Number(i);
    return isNaN(l) ? i : l;
  }
  let n = [], a = [];
  for (let i = 0; i < e.length; i++) if (e[i] === "d" && e.slice(i, i + 3) === "dt(") a.push(i), i += 2;
  else if (e[i] === ")" && a.length > 0) {
    let s = a.pop();
    a.length === 0 && n.push([s, i]);
  }
  if (!n.length) return e;
  for (let i = n.length - 1; i >= 0; i--) {
    let [s, l] = n[i], c = e.slice(s + 3, l), p = r(c, t), h = t(...p);
    e = e.slice(0, s) + h + e.slice(l + 1);
  }
  return e;
}
var Ce = (...e) => jn(H.getTheme(), ...e), jn = (e = {}, t, r, o) => {
  if (t) {
    let { variable: n, options: a } = H.defaults || {}, { prefix: i, transform: s } = e?.options || a || {}, l = $e(t, ze) ? t : `{${t}}`;
    return o === "value" || Vt(o) && s === "strict" ? H.getTokenValue(t) : to(l, void 0, i, [n.excludedKeyRegex], r);
  }
  return "";
};
function tt(e, ...t) {
  if (e instanceof Array) {
    let r = e.reduce((o, n, a) => {
      var i;
      return o + n + ((i = le(t[a], { dt: Ce })) != null ? i : "");
    }, "");
    return ro(r, Ce);
  }
  return le(e, { dt: Ce });
}
function Dn(e, t = {}) {
  let r = H.defaults.variable, { prefix: o = r.prefix, selector: n = r.selector, excludedKeyRegex: a = r.excludedKeyRegex } = t, i = [], s = [], l = [{ node: e, path: o }];
  for (; l.length; ) {
    let { node: p, path: h } = l.pop();
    for (let d in p) {
      let f = p[d], S = An(f), $ = $e(d, a) ? Lt(h) : Lt(h, Ur(d));
      if (ke(S)) l.push({ node: S, path: $ });
      else {
        let _ = eo($), k = to(S, $, o, [a]);
        Rn(s, _, k);
        let E = $;
        o && E.startsWith(o + "-") && (E = E.slice(o.length + 1)), i.push(E.replace(/-/g, "."));
      }
    }
  }
  let c = s.join("");
  return { value: s, tokens: i, declarations: c, css: Ae(n, c) };
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
  return Dn(e, { prefix: t?.prefix });
}, getCommon({ name: e = "", theme: t = {}, params: r, set: o, defaults: n }) {
  var a, i, s, l, c, p, h;
  let { preset: d, options: f } = t, S, $, _, k, E, G, V;
  if (R(d) && f.transform !== "strict") {
    let { primitive: ce, semantic: B, extend: ne } = d, ae = B || {}, { colorScheme: F } = ae, ee = ge(ae, ["colorScheme"]), Y = ne || {}, { colorScheme: ie } = Y, Q = ge(Y, ["colorScheme"]), J = F || {}, { dark: te } = J, X = ge(J, ["dark"]), se = ie || {}, { dark: g } = se, b = ge(se, ["dark"]), x = R(ce) ? this._toVariables({ primitive: ce }, f) : {}, M = R(ee) ? this._toVariables({ semantic: ee }, f) : {}, I = R(X) ? this._toVariables({ light: X }, f) : {}, U = R(te) ? this._toVariables({ dark: te }, f) : {}, W = R(Q) ? this._toVariables({ semantic: Q }, f) : {}, ye = R(b) ? this._toVariables({ light: b }, f) : {}, xe = R(g) ? this._toVariables({ dark: g }, f) : {}, [Me, Oe] = [(a = x.declarations) != null ? a : "", x.tokens], [ht, Te] = [(i = M.declarations) != null ? i : "", M.tokens || []], [ft, Xe] = [(s = I.declarations) != null ? s : "", I.tokens || []], [mt, vt] = [(l = U.declarations) != null ? l : "", U.tokens || []], [qe, gt] = [(c = W.declarations) != null ? c : "", W.tokens || []], [bt, yt] = [(p = ye.declarations) != null ? p : "", ye.tokens || []], [Se, xt] = [(h = xe.declarations) != null ? h : "", xe.tokens || []];
    S = this.transformCSS(e, Me, "light", "variable", f, o, n), $ = Oe;
    let we = this.transformCSS(e, `${ht}${ft}`, "light", "variable", f, o, n), Ze = this.transformCSS(e, `${mt}`, "dark", "variable", f, o, n);
    _ = `${we}${Ze}`, k = [.../* @__PURE__ */ new Set([...Te, ...Xe, ...vt])];
    let wt = this.transformCSS(e, `${qe}${bt}color-scheme:light`, "light", "variable", f, o, n), pe = this.transformCSS(e, `${Se}color-scheme:dark`, "dark", "variable", f, o, n);
    E = `${wt}${pe}`, G = [.../* @__PURE__ */ new Set([...gt, ...yt, ...xt])], V = le(d.css, { dt: Ce });
  }
  return { primitive: { css: S, tokens: $ }, semantic: { css: _, tokens: k }, global: { css: E, tokens: G }, style: V };
}, getPreset({ name: e = "", preset: t = {}, options: r, params: o, set: n, defaults: a, selector: i }) {
  var s, l, c;
  let p, h, d;
  if (R(t) && r.transform !== "strict") {
    let f = e.replace("-directive", ""), S = t, { colorScheme: $, extend: _, css: k } = S, E = ge(S, ["colorScheme", "extend", "css"]), G = _ || {}, { colorScheme: V } = G, ce = ge(G, ["colorScheme"]), B = $ || {}, { dark: ne } = B, ae = ge(B, ["dark"]), F = V || {}, { dark: ee } = F, Y = ge(F, ["dark"]), ie = R(E) ? this._toVariables({ [f]: he(he({}, E), ce) }, r) : {}, Q = R(ae) ? this._toVariables({ [f]: he(he({}, ae), Y) }, r) : {}, J = R(ne) ? this._toVariables({ [f]: he(he({}, ne), ee) }, r) : {}, [te, X] = [(s = ie.declarations) != null ? s : "", ie.tokens || []], [se, g] = [(l = Q.declarations) != null ? l : "", Q.tokens || []], [b, x] = [(c = J.declarations) != null ? c : "", J.tokens || []], M = this.transformCSS(f, `${te}${se}`, "light", "variable", r, n, a, i), I = this.transformCSS(f, b, "dark", "variable", r, n, a, i);
    p = `${M}${I}`, h = [.../* @__PURE__ */ new Set([...X, ...g, ...x])], d = le(k, { dt: Ce });
  }
  return { css: p, tokens: h, style: d };
}, getPresetC({ name: e = "", theme: t = {}, params: r, set: o, defaults: n }) {
  var a;
  let { preset: i, options: s } = t, l = (a = i?.components) == null ? void 0 : a[e];
  return this.getPreset({ name: e, preset: l, options: s, params: r, set: o, defaults: n });
}, getPresetD({ name: e = "", theme: t = {}, params: r, set: o, defaults: n }) {
  var a, i;
  let s = e.replace("-directive", ""), { preset: l, options: c } = t, p = ((a = l?.components) == null ? void 0 : a[s]) || ((i = l?.directives) == null ? void 0 : i[s]);
  return this.getPreset({ name: s, preset: p, options: c, params: r, set: o, defaults: n });
}, applyDarkColorScheme(e) {
  return !(e.darkModeSelector === "none" || e.darkModeSelector === !1);
}, getColorSchemeOption(e, t) {
  var r;
  return this.applyDarkColorScheme(e) ? this.regex.resolve(e.darkModeSelector === !0 ? t.options.darkModeSelector : (r = e.darkModeSelector) != null ? r : t.options.darkModeSelector) : [];
}, getLayerOrder(e, t = {}, r, o) {
  let { cssLayer: n } = t;
  return n ? `@layer ${le(n.order || n.name || "primeui", r)}` : "";
}, getCommonStyleSheet({ name: e = "", theme: t = {}, params: r, props: o = {}, set: n, defaults: a }) {
  let i = this.getCommon({ name: e, theme: t, params: r, set: n, defaults: a }), s = Object.entries(o).reduce((l, [c, p]) => l.push(`${c}="${p}"`) && l, []).join(" ");
  return Object.entries(i || {}).reduce((l, [c, p]) => {
    if (ke(p) && Object.hasOwn(p, "css")) {
      let h = Be(p.css), d = `${c}-variables`;
      l.push(`<style type="text/css" data-primevue-style-id="${d}" ${s}>${h}</style>`);
    }
    return l;
  }, []).join("");
}, getStyleSheet({ name: e = "", theme: t = {}, params: r, props: o = {}, set: n, defaults: a }) {
  var i;
  let s = { name: e, theme: t, params: r, set: n, defaults: a }, l = (i = e.includes("-directive") ? this.getPresetD(s) : this.getPresetC(s)) == null ? void 0 : i.css, c = Object.entries(o).reduce((p, [h, d]) => p.push(`${h}="${d}"`) && p, []).join(" ");
  return l ? `<style type="text/css" data-primevue-style-id="${e}-variables" ${c}>${Be(l)}</style>` : "";
}, createTokens(e = {}, t, r = "", o = "", n = {}) {
  let a = function(s, l = {}, c = []) {
    if (c.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: s, path: this.path, paths: l, value: void 0 };
    c.push(this.path), l.name = this.path, l.binding || (l.binding = {});
    let p = this.value;
    if (typeof this.value == "string" && ze.test(this.value)) {
      let h = this.value.trim().replace(ze, (d) => {
        var f;
        let S = d.slice(1, -1), $ = this.tokens[S];
        if (!$) return console.warn(`Token not found for path: ${S}`), "__UNRESOLVED__";
        let _ = $.computed(s, l, c);
        return Array.isArray(_) && _.length === 2 ? `light-dark(${_[0].value},${_[1].value})` : (f = _?.value) != null ? f : "__UNRESOLVED__";
      });
      p = Qr.test(h.replace(Jr, "0")) ? `calc(${h})` : h;
    }
    return Vt(l.binding) && delete l.binding, c.pop(), { colorScheme: s, path: this.path, paths: l, value: p.includes("__UNRESOLVED__") ? void 0 : p };
  }, i = (s, l, c) => {
    Object.entries(s).forEach(([p, h]) => {
      let d = $e(p, t.variable.excludedKeyRegex) ? l : l ? `${l}.${or(p)}` : or(p), f = c ? `${c}.${p}` : p;
      ke(h) ? i(h, d, f) : (n[d] || (n[d] = { paths: [], computed: (S, $ = {}, _ = []) => {
        if (n[d].paths.length === 1) return n[d].paths[0].computed(n[d].paths[0].scheme, $.binding, _);
        if (S && S !== "none") for (let k = 0; k < n[d].paths.length; k++) {
          let E = n[d].paths[k];
          if (E.scheme === S) return E.computed(S, $.binding, _);
        }
        return n[d].paths.map((k) => k.computed(k.scheme, $[k.scheme], _));
      } }), n[d].paths.push({ path: f, value: h, scheme: f.includes("colorScheme.light") ? "light" : f.includes("colorScheme.dark") ? "dark" : "none", computed: a, tokens: n }));
    });
  };
  return i(e, r, o), n;
}, getTokenValue(e, t, r) {
  var o;
  let n = ((s) => s.split(".").filter((l) => !$e(l.toLowerCase(), r.variable.excludedKeyRegex)).join("."))(t), a = t.includes("colorScheme.light") ? "light" : t.includes("colorScheme.dark") ? "dark" : void 0, i = [(o = e[n]) == null ? void 0 : o.computed(a)].flat().filter((s) => s);
  return i.length === 1 ? i[0].value : i.reduce((s = {}, l) => {
    let c = l, { colorScheme: p } = c, h = ge(c, ["colorScheme"]);
    return s[p] = h, s;
  }, void 0);
}, getSelectorRule(e, t, r, o) {
  return r === "class" || r === "attr" ? Ae(R(t) ? `${e}${t},${e} ${t}` : e, o) : Ae(e, Ae(t ?? ":root,:host", o));
}, transformCSS(e, t, r, o, n = {}, a, i, s) {
  if (R(t)) {
    let { cssLayer: l } = n;
    if (o !== "style") {
      let c = this.getColorSchemeOption(n, i);
      t = r === "dark" ? c.reduce((p, { type: h, selector: d }) => (R(d) && (p += d.includes("[CSS]") ? d.replace("[CSS]", t) : this.getSelectorRule(d, s, h, t)), p), "") : Ae(s ?? ":root,:host", t);
    }
    if (l) {
      let c = { name: "primeui" };
      ke(l) && (c.name = le(l.name, { name: e, type: o })), R(c.name) && (t = Ae(`@layer ${c.name}`, t), a?.layerNames(c.name));
    }
    return t;
  }
  return "";
} }, H = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(e = {}) {
  let { theme: t } = e;
  t && (this._theme = _t(he({}, t), { options: he(he({}, this.defaults.options), t.options) }), this._tokens = ue.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
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
  this._theme = _t(he({}, this.theme), { preset: e }), this._tokens = ue.createTokens(e, this.defaults), this.clearLoadedStyleNames(), q.emit("preset:change", e), q.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(e) {
  this._theme = _t(he({}, this.theme), { options: e }), this.clearLoadedStyleNames(), q.emit("options:change", e), q.emit("theme:change", this.theme);
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
}, Hn = `
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
function Ue(e) {
  "@babel/helpers - typeof";
  return Ue = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ue(e);
}
function nr(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(n) {
      return Object.getOwnPropertyDescriptor(e, n).enumerable;
    })), r.push.apply(r, o);
  }
  return r;
}
function ar(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2 ? nr(Object(r), !0).forEach(function(o) {
      In(e, o, r[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r)) : nr(Object(r)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(r, o));
    });
  }
  return e;
}
function In(e, t, r) {
  return (t = Bn(t)) in e ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = r, e;
}
function Bn(e) {
  var t = zn(e, "string");
  return Ue(t) == "symbol" ? t : t + "";
}
function zn(e, t) {
  if (Ue(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var o = r.call(e, t);
    if (Ue(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function Un(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  Kt() && Kt().components ? ut(e) : t ? e() : yo(e);
}
var Fn = 0;
function Wn(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = A(!1), o = A(e), n = A(null), a = Xr() ? window.document : void 0, i = t.document, s = i === void 0 ? a : i, l = t.immediate, c = l === void 0 ? !0 : l, p = t.manual, h = p === void 0 ? !1 : p, d = t.name, f = d === void 0 ? "style_".concat(++Fn) : d, S = t.id, $ = S === void 0 ? void 0 : S, _ = t.media, k = _ === void 0 ? void 0 : _, E = t.nonce, G = E === void 0 ? void 0 : E, V = t.first, ce = V === void 0 ? !1 : V, B = t.onMounted, ne = B === void 0 ? void 0 : B, ae = t.onUpdated, F = ae === void 0 ? void 0 : ae, ee = t.onLoad, Y = ee === void 0 ? void 0 : ee, ie = t.props, Q = ie === void 0 ? {} : ie, J = function() {
  }, te = function(g) {
    var b = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (s) {
      var x = ar(ar({}, Q), b), M = x.name || f, I = x.id || $, U = x.nonce || G;
      n.value = s.querySelector('style[data-primevue-style-id="'.concat(M, '"]')) || s.getElementById(I) || s.createElement("style"), n.value.isConnected || (o.value = g || e, Tt(n.value, {
        type: "text/css",
        id: I,
        media: k,
        nonce: U
      }), ce ? s.head.prepend(n.value) : s.head.appendChild(n.value), On(n.value, "data-primevue-style-id", M), Tt(n.value, x), n.value.onload = function(W) {
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
    !s || !r.value || (J(), _n(n.value) && s.head.removeChild(n.value), r.value = !1, n.value = null);
  };
  return c && !h && Un(te), {
    id: $,
    name: f,
    el: n,
    css: o,
    unload: X,
    load: te,
    isLoaded: bo(r)
  };
}
function Fe(e) {
  "@babel/helpers - typeof";
  return Fe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Fe(e);
}
var ir, sr, lr, cr;
function pr(e, t) {
  return Xn(e) || Yn(e, t) || Gn(e, t) || Kn();
}
function Kn() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Gn(e, t) {
  if (e) {
    if (typeof e == "string") return ur(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return r === "Object" && e.constructor && (r = e.constructor.name), r === "Map" || r === "Set" ? Array.from(e) : r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? ur(e, t) : void 0;
  }
}
function ur(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, o = Array(t); r < t; r++) o[r] = e[r];
  return o;
}
function Yn(e, t) {
  var r = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (r != null) {
    var o, n, a, i, s = [], l = !0, c = !1;
    try {
      if (a = (r = r.call(e)).next, t !== 0) for (; !(l = (o = a.call(r)).done) && (s.push(o.value), s.length !== t); l = !0) ;
    } catch (p) {
      c = !0, n = p;
    } finally {
      try {
        if (!l && r.return != null && (i = r.return(), Object(i) !== i)) return;
      } finally {
        if (c) throw n;
      }
    }
    return s;
  }
}
function Xn(e) {
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
function $t(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2 ? dr(Object(r), !0).forEach(function(o) {
      qn(e, o, r[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r)) : dr(Object(r)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(r, o));
    });
  }
  return e;
}
function qn(e, t, r) {
  return (t = Zn(t)) in e ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = r, e;
}
function Zn(e) {
  var t = Qn(e, "string");
  return Fe(t) == "symbol" ? t : t + "";
}
function Qn(e, t) {
  if (Fe(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var o = r.call(e, t);
    if (Fe(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function rt(e, t) {
  return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var Jn = function(t) {
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
}, ea = {}, ta = {}, Z = {
  name: "base",
  css: Jn,
  style: Hn,
  classes: ea,
  inlineStyles: ta,
  load: function(t) {
    var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(a) {
      return a;
    }, n = o(tt(ir || (ir = rt(["", ""])), t));
    return R(n) ? Wn(Be(n), $t({
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
      return H.transformCSS(r.name || t.name, "".concat(n).concat(tt(sr || (sr = rt(["", ""])), o)));
    });
  },
  getCommonTheme: function(t) {
    return H.getCommon(this.name, t);
  },
  getComponentTheme: function(t) {
    return H.getComponent(this.name, t);
  },
  getDirectiveTheme: function(t) {
    return H.getDirective(this.name, t);
  },
  getPresetTheme: function(t, r, o) {
    return H.getCustomPreset(this.name, t, r, o);
  },
  getLayerOrderThemeCSS: function() {
    return H.getLayerOrderCSS(this.name);
  },
  getStyleSheet: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.css) {
      var o = le(this.css, {
        dt: Ce
      }) || "", n = Be(tt(lr || (lr = rt(["", "", ""])), o, t)), a = Object.entries(r).reduce(function(i, s) {
        var l = pr(s, 2), c = l[0], p = l[1];
        return i.push("".concat(c, '="').concat(p, '"')) && i;
      }, []).join(" ");
      return R(n) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(a, ">").concat(n, "</style>") : "";
    }
    return "";
  },
  getCommonThemeStyleSheet: function(t) {
    var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return H.getCommonStyleSheet(this.name, t, r);
  },
  getThemeStyleSheet: function(t) {
    var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = [H.getStyleSheet(this.name, t, r)];
    if (this.style) {
      var n = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), a = tt(cr || (cr = rt(["", ""])), le(this.style, {
        dt: Ce
      })), i = Be(H.transformCSS(n, a)), s = Object.entries(r).reduce(function(l, c) {
        var p = pr(c, 2), h = p[0], d = p[1];
        return l.push("".concat(h, '="').concat(d, '"')) && l;
      }, []).join(" ");
      R(i) && o.push('<style type="text/css" data-primevue-style-id="'.concat(n, '" ').concat(s, ">").concat(i, "</style>"));
    }
    return o.join("");
  },
  extend: function(t) {
    return $t($t({}, this), {}, {
      css: void 0,
      style: void 0
    }, t);
  }
}, ot = Mt();
function We(e) {
  "@babel/helpers - typeof";
  return We = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, We(e);
}
function hr(e, t) {
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
    t % 2 ? hr(Object(r), !0).forEach(function(o) {
      ra(e, o, r[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r)) : hr(Object(r)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(r, o));
    });
  }
  return e;
}
function ra(e, t, r) {
  return (t = oa(t)) in e ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = r, e;
}
function oa(e) {
  var t = na(e, "string");
  return We(t) == "symbol" ? t : t + "";
}
function na(e, t) {
  if (We(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var o = r.call(e, t);
    if (We(o) != "object") return o;
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
}, ia = Symbol();
function sa(e, t) {
  var r = {
    config: xo(t)
  };
  return e.config.globalProperties.$primevue = r, e.provide(ia, r), la(), ca(e, r), r;
}
var Ve = [];
function la() {
  q.clear(), Ve.forEach(function(e) {
    return e?.();
  }), Ve = [];
}
function ca(e, t) {
  var r = A(!1), o = function() {
    var c;
    if (((c = t.config) === null || c === void 0 ? void 0 : c.theme) !== "none" && !H.isStyleNameLoaded("common")) {
      var p, h, d = ((p = Z.getCommonTheme) === null || p === void 0 ? void 0 : p.call(Z)) || {}, f = d.primitive, S = d.semantic, $ = d.global, _ = d.style, k = {
        nonce: (h = t.config) === null || h === void 0 || (h = h.csp) === null || h === void 0 ? void 0 : h.nonce
      };
      Z.load(f?.css, nt({
        name: "primitive-variables"
      }, k)), Z.load(S?.css, nt({
        name: "semantic-variables"
      }, k)), Z.load($?.css, nt({
        name: "global-variables"
      }, k)), Z.loadStyle(nt({
        name: "global-style"
      }, k), _), H.setLoadedStyleName("common");
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
  }), a = be(function() {
    return t.config.ripple;
  }, function(l, c) {
    ot.emit("config:ripple:change", {
      newValue: l,
      oldValue: c
    });
  }, {
    immediate: !0,
    deep: !0
  }), i = be(function() {
    return t.config.theme;
  }, function(l, c) {
    r.value || H.setTheme(l), t.config.unstyled || o(), r.value = !1, ot.emit("config:theme:change", {
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
  Ve.push(n), Ve.push(a), Ve.push(i), Ve.push(s);
}
var pa = {
  install: function(t, r) {
    var o = mn(aa, r);
    sa(t, o);
  }
}, Rt = {
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
    this.mounted = Xr();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function ua(e, t, r, o, n, a) {
  return a.inline ? st(e.$slots, "default", {
    key: 0
  }) : n.mounted ? (C(), He(Pr, {
    key: 1,
    to: r.appendTo
  }, [st(e.$slots, "default")], 8, ["to"])) : z("", !0);
}
Rt.render = ua;
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
function da() {
  var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pc", t = wo();
  return "".concat(e).concat(t.replace("v-", "").replaceAll("-", "_"));
}
var fr = Z.extend({
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
function ha(e) {
  return ao(e) || fa(e) || no(e) || oo();
}
function fa(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function De(e, t) {
  return ao(e) || ma(e, t) || no(e, t) || oo();
}
function oo() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function no(e, t) {
  if (e) {
    if (typeof e == "string") return Pt(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return r === "Object" && e.constructor && (r = e.constructor.name), r === "Map" || r === "Set" ? Array.from(e) : r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? Pt(e, t) : void 0;
  }
}
function Pt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, o = Array(t); r < t; r++) o[r] = e[r];
  return o;
}
function ma(e, t) {
  var r = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (r != null) {
    var o, n, a, i, s = [], l = !0, c = !1;
    try {
      if (a = (r = r.call(e)).next, t === 0) {
        if (Object(r) !== r) return;
        l = !1;
      } else for (; !(l = (o = a.call(r)).done) && (s.push(o.value), s.length !== t); l = !0) ;
    } catch (p) {
      c = !0, n = p;
    } finally {
      try {
        if (!l && r.return != null && (i = r.return(), Object(i) !== i)) return;
      } finally {
        if (c) throw n;
      }
    }
    return s;
  }
}
function ao(e) {
  if (Array.isArray(e)) return e;
}
function mr(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(n) {
      return Object.getOwnPropertyDescriptor(e, n).enumerable;
    })), r.push.apply(r, o);
  }
  return r;
}
function O(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2 ? mr(Object(r), !0).forEach(function(o) {
      Ie(e, o, r[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r)) : mr(Object(r)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(r, o));
    });
  }
  return e;
}
function Ie(e, t, r) {
  return (t = va(t)) in e ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = r, e;
}
function va(e) {
  var t = ga(e, "string");
  return Ke(t) == "symbol" ? t : t + "";
}
function ga(e, t) {
  if (Ke(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var o = r.call(e, t);
    if (Ke(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var ba = {
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
    var t, r, o, n, a, i, s, l, c, p, h, d = (t = this.pt) === null || t === void 0 ? void 0 : t._usept, f = d ? (r = this.pt) === null || r === void 0 || (r = r.originalValue) === null || r === void 0 ? void 0 : r[this.$.type.name] : void 0, S = d ? (o = this.pt) === null || o === void 0 || (o = o.value) === null || o === void 0 ? void 0 : o[this.$.type.name] : this.pt;
    (n = S || f) === null || n === void 0 || (n = n.hooks) === null || n === void 0 || (a = n.onBeforeCreate) === null || a === void 0 || a.call(n);
    var $ = (i = this.$primevueConfig) === null || i === void 0 || (i = i.pt) === null || i === void 0 ? void 0 : i._usept, _ = $ ? (s = this.$primevue) === null || s === void 0 || (s = s.config) === null || s === void 0 || (s = s.pt) === null || s === void 0 ? void 0 : s.originalValue : void 0, k = $ ? (l = this.$primevue) === null || l === void 0 || (l = l.config) === null || l === void 0 || (l = l.pt) === null || l === void 0 ? void 0 : l.value : (c = this.$primevue) === null || c === void 0 || (c = c.config) === null || c === void 0 ? void 0 : c.pt;
    (p = k || _) === null || p === void 0 || (p = p[this.$.type.name]) === null || p === void 0 || (p = p.hooks) === null || p === void 0 || (h = p.onBeforeCreate) === null || h === void 0 || h.call(p), this.$attrSelector = da(), this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
  },
  created: function() {
    this._hook("onCreated");
  },
  beforeMount: function() {
    var t;
    this.rootEl = Gr(dt(this.$el) ? this.$el : (t = this.$el) === null || t === void 0 ? void 0 : t.parentElement, "[".concat(this.$attrSelector, "]")), this.rootEl && (this.rootEl.$pc = O({
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
      return Ir(t) ? t.apply(void 0, o) : oe.apply(void 0, o);
    },
    _load: function() {
      je.isStyleNameLoaded("base") || (Z.loadCSS(this.$styleOptions), this._loadGlobalStyles(), je.setLoadedStyleName("base")), this._loadThemeStyles();
    },
    _loadStyles: function() {
      this._load(), this._themeChangeListener(this._load);
    },
    _loadCoreStyles: function() {
      var t, r;
      !je.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (r = this.$style) !== null && r !== void 0 && r.name && (fr.loadCSS(this.$styleOptions), this.$options.style && this.$style.loadCSS(this.$styleOptions), je.setLoadedStyleName(this.$style.name));
    },
    _loadGlobalStyles: function() {
      var t = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
      R(t) && Z.load(t, O({
        name: "global"
      }, this.$styleOptions));
    },
    _loadThemeStyles: function() {
      var t, r;
      if (!(this.isUnstyled || this.$theme === "none")) {
        if (!H.isStyleNameLoaded("common")) {
          var o, n, a = ((o = this.$style) === null || o === void 0 || (n = o.getCommonTheme) === null || n === void 0 ? void 0 : n.call(o)) || {}, i = a.primitive, s = a.semantic, l = a.global, c = a.style;
          Z.load(i?.css, O({
            name: "primitive-variables"
          }, this.$styleOptions)), Z.load(s?.css, O({
            name: "semantic-variables"
          }, this.$styleOptions)), Z.load(l?.css, O({
            name: "global-variables"
          }, this.$styleOptions)), Z.loadStyle(O({
            name: "global-style"
          }, this.$styleOptions), c), H.setLoadedStyleName("common");
        }
        if (!H.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (r = this.$style) !== null && r !== void 0 && r.name) {
          var p, h, d, f, S = ((p = this.$style) === null || p === void 0 || (h = p.getComponentTheme) === null || h === void 0 ? void 0 : h.call(p)) || {}, $ = S.css, _ = S.style;
          (d = this.$style) === null || d === void 0 || d.load($, O({
            name: "".concat(this.$style.name, "-variables")
          }, this.$styleOptions)), (f = this.$style) === null || f === void 0 || f.loadStyle(O({
            name: "".concat(this.$style.name, "-style")
          }, this.$styleOptions), _), H.setLoadedStyleName(this.$style.name);
        }
        if (!H.isStyleNameLoaded("layer-order")) {
          var k, E, G = (k = this.$style) === null || k === void 0 || (E = k.getLayerOrderThemeCSS) === null || E === void 0 ? void 0 : E.call(k);
          Z.load(G, O({
            name: "layer-order",
            first: !0
          }, this.$styleOptions)), H.setLoadedStyleName("layer-order");
        }
      }
    },
    _loadScopedThemeStyles: function(t) {
      var r, o, n, a = ((r = this.$style) === null || r === void 0 || (o = r.getPresetTheme) === null || o === void 0 ? void 0 : o.call(r, t, "[".concat(this.$attrSelector, "]"))) || {}, i = a.css, s = (n = this.$style) === null || n === void 0 ? void 0 : n.load(i, O({
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
      return zr(t, r, o);
    },
    _getPTValue: function() {
      var t, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, a = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, i = /./g.test(o) && !!n[o.split(".")[0]], s = this._getPropValue("ptOptions") || ((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.ptOptions) || {}, l = s.mergeSections, c = l === void 0 ? !0 : l, p = s.mergeProps, h = p === void 0 ? !1 : p, d = a ? i ? this._useGlobalPT(this._getPTClassValue, o, n) : this._useDefaultPT(this._getPTClassValue, o, n) : void 0, f = i ? void 0 : this._getPTSelf(r, this._getPTClassValue, o, O(O({}, n), {}, {
        global: d || {}
      })), S = this._getPTDatasets(o);
      return c || !c && f ? h ? this._mergeProps(h, d, f, S) : O(O(O({}, d), f), S) : O(O({}, f), S);
    },
    _getPTSelf: function() {
      for (var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length, o = new Array(r > 1 ? r - 1 : 0), n = 1; n < r; n++)
        o[n - 1] = arguments[n];
      return oe(
        this._usePT.apply(this, [this._getPT(t, this.$name)].concat(o)),
        // Exp; <component :pt="{}"
        this._usePT.apply(this, [this.$_attrsPT].concat(o))
        // Exp; <component :pt:[passthrough_key]:[attribute]="{value}" or <component :pt:[passthrough_key]="() =>{value}"
      );
    },
    _getPTDatasets: function() {
      var t, r, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = "data-pc-", a = o === "root" && R((t = this.pt) === null || t === void 0 ? void 0 : t["data-pc-section"]);
      return o !== "transition" && O(O({}, o === "root" && O(O(Ie({}, "".concat(n, "name"), _e(a ? (r = this.pt) === null || r === void 0 ? void 0 : r["data-pc-section"] : this.$.type.name)), a && Ie({}, "".concat(n, "extend"), _e(this.$.type.name))), {}, Ie({}, "".concat(this.$attrSelector), ""))), {}, Ie({}, "".concat(n, "section"), _e(o)));
    },
    _getPTClassValue: function() {
      var t = this._getOptionValue.apply(this, arguments);
      return ve(t) || hn(t) ? {
        class: t
      } : t;
    },
    _getPT: function(t) {
      var r = this, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", n = arguments.length > 2 ? arguments[2] : void 0, a = function(s) {
        var l, c = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, p = n ? n(s) : s, h = _e(o), d = _e(r.$name);
        return (l = c ? h !== d ? p?.[h] : void 0 : p?.[h]) !== null && l !== void 0 ? l : p;
      };
      return t != null && t.hasOwnProperty("_usept") ? {
        _usept: t._usept,
        originalValue: a(t.originalValue),
        value: a(t.value)
      } : a(t, !0);
    },
    _usePT: function(t, r, o, n) {
      var a = function($) {
        return r($, o, n);
      };
      if (t != null && t.hasOwnProperty("_usept")) {
        var i, s = t._usept || ((i = this.$primevueConfig) === null || i === void 0 ? void 0 : i.ptOptions) || {}, l = s.mergeSections, c = l === void 0 ? !0 : l, p = s.mergeProps, h = p === void 0 ? !1 : p, d = a(t.originalValue), f = a(t.value);
        return d === void 0 && f === void 0 ? void 0 : ve(f) ? f : ve(d) ? d : c || !c && f ? h ? this._mergeProps(h, d, f) : O(O({}, d), f) : f;
      }
      return a(t);
    },
    _useGlobalPT: function(t, r, o) {
      return this._usePT(this.globalPT, t, r, o);
    },
    _useDefaultPT: function(t, r, o) {
      return this._usePT(this.defaultPT, t, r, o);
    },
    ptm: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this._getPTValue(this.pt, t, O(O({}, this.$params), r));
    },
    ptmi: function() {
      var t, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = oe(this.$_attrsWithoutPT, this.ptm(r, o));
      return n?.hasOwnProperty("id") && ((t = n.id) !== null && t !== void 0 || (n.id = this.$id)), n;
    },
    ptmo: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return this._getPTValue(t, r, O({
        instance: this
      }, o), !1);
    },
    cx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this.isUnstyled ? void 0 : this._getOptionValue(this.$style.classes, t, O(O({}, this.$params), r));
    },
    sx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      if (r) {
        var n = this._getOptionValue(this.$style.inlineStyles, t, O(O({}, this.$params), o)), a = this._getOptionValue(fr.inlineStyles, t, O(O({}, this.$params), o));
        return [a, n];
      }
    }
  },
  computed: {
    globalPT: function() {
      var t, r = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(o) {
        return le(o, {
          instance: r
        });
      });
    },
    defaultPT: function() {
      var t, r = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(o) {
        return r._getOptionValue(o, r.$name, O({}, r.$params)) || le(o, O({}, r.$params));
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
        var n = De(o, 1), a = n[0];
        return r?.includes(a);
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
        var r = De(t, 1), o = r[0];
        return o?.startsWith("pt:");
      }).reduce(function(t, r) {
        var o = De(r, 2), n = o[0], a = o[1], i = n.split(":"), s = ha(i), l = Pt(s).slice(1);
        return l?.reduce(function(c, p, h, d) {
          return !c[p] && (c[p] = h === d.length - 1 ? a : {}), c[p];
        }, t), t;
      }, {});
    },
    $_attrsWithoutPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(t) {
        var r = De(t, 1), o = r[0];
        return !(o != null && o.startsWith("pt:"));
      }).reduce(function(t, r) {
        var o = De(r, 2), n = o[0], a = o[1];
        return t[n] = a, t;
      }, {});
    }
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
function ya(e, t) {
  if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
}
function xa(e, t) {
  for (var r = 0; r < t.length; r++) {
    var o = t[r];
    o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, ka(o.key), o);
  }
}
function wa(e, t, r) {
  return t && xa(e.prototype, t), Object.defineProperty(e, "prototype", { writable: !1 }), e;
}
function ka(e) {
  var t = Sa(e, "string");
  return Ge(t) == "symbol" ? t : t + "";
}
function Sa(e, t) {
  if (Ge(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var o = r.call(e, t);
    if (Ge(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return String(e);
}
var _a = /* @__PURE__ */ (function() {
  function e(t) {
    var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : function() {
    };
    ya(this, e), this.element = t, this.listener = r;
  }
  return wa(e, [{
    key: "bindScrollListener",
    value: function() {
      this.scrollableParents = $n(this.element);
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
})(), $a = Mt();
const Ca = "data-wippy-overlay-layer";
function io() {
  return typeof window < "u" && typeof window.document < "u";
}
function so() {
  return io() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function Oa() {
  return so() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const Ta = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let La = 0;
const ct = /* @__PURE__ */ new WeakMap();
function vr(e, t) {
  const r = e.style;
  r.setProperty("position", "fixed", "important"), r.setProperty("inset", "auto", "important"), r.setProperty("margin", "0", "important"), r.setProperty("position-anchor", t), r.setProperty("position-area", "bottom span-right"), r.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), r.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), r.setProperty("max-width", "stretch", "important");
}
function Pa(e, t) {
  if (!Ta.test(e.className))
    return;
  const r = e.style.cssText;
  vr(e, t), e.getAttribute("popover") !== "manual" && e.setAttribute("popover", "manual");
  try {
    e.matches(":popover-open") || e.showPopover();
  } catch {
  }
  if (!e.matches(":popover-open")) {
    e.removeAttribute("popover"), e.style.cssText = r;
    return;
  }
  if (!ct.has(e)) {
    const o = new MutationObserver(() => {
      const n = e.style;
      (n.top !== "auto" || n.left !== "auto" || n.margin !== "0px" || n.getPropertyPriority("top") !== "important" || n.getPropertyPriority("left") !== "important" || n.getPropertyPriority("margin") !== "important" || n.getPropertyPriority("min-width") !== "important" || n.maxWidth !== "stretch" || n.getPropertyPriority("max-width") !== "important") && vr(e, t);
    });
    o.observe(e, { attributes: !0, attributeFilter: ["style"] }), ct.set(e, o);
  }
}
function jt(e) {
  const t = ct.get(e);
  t && (t.disconnect(), ct.delete(e));
}
function Ea(e) {
  const t = e && typeof e.getRootNode == "function" ? e.getRootNode() : null;
  return t instanceof ShadowRoot ? t : null;
}
function Et(e) {
  e.style.top = "0px", e.style.left = "0px";
  const t = e.getBoundingClientRect();
  e.style.top = `${-window.scrollY - t.top}px`, e.style.left = `${-window.scrollX - t.left}px`;
}
const pt = /* @__PURE__ */ new Set(), Dt = /* @__PURE__ */ new WeakMap();
let gr = !1, Nt = !1;
function Na() {
  Nt = !1;
  for (const e of pt) {
    if (!e.isConnected) {
      for (const t of Array.from(e.children))
        t instanceof HTMLElement && jt(t);
      pt.delete(e), Dt.get(e)?.disconnect();
      continue;
    }
    e.childElementCount > 0 && Et(e);
  }
}
function br() {
  Nt || (Nt = !0, requestAnimationFrame(Na));
}
function Aa(e) {
  const t = document.createElement("div");
  t.setAttribute(Ca, "");
  const r = so();
  if (t.style.cssText = r ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", r && t.setAttribute("popover", "manual"), e.appendChild(t), r) {
    try {
      t.showPopover();
    } catch {
    }
    t.matches(":popover-open") || (t.removeAttribute("popover"), t.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  Et(t);
  const o = new MutationObserver((n) => {
    const a = t.__wippyAnchorName;
    for (const i of n) {
      if (a)
        for (const s of Array.from(i.addedNodes))
          s instanceof HTMLElement && Pa(s, a);
      for (const s of Array.from(i.removedNodes))
        s instanceof HTMLElement && jt(s);
    }
    t.isConnected && t.childElementCount > 0 && Et(t);
  });
  return o.observe(t, { childList: !0 }), Dt.set(t, o), pt.add(t), gr || (gr = !0, window.addEventListener("scroll", br, { capture: !0, passive: !0 }), window.addEventListener("resize", br, { passive: !0 })), t;
}
function yr(e) {
  if (!(!e.hostRoot || e.layer) && (e.layer = Aa(e.hostRoot), Oa())) {
    const t = e.$el ? e.$el.parentElement : null;
    t && (e.anchorName = `--wippy-a-${++La}`, e.anchorTrigger = t, t.style.setProperty("anchor-name", e.anchorName), e.layer.__wippyAnchorName = e.anchorName);
  }
}
function xr(e) {
  if (e.anchorTrigger && (e.anchorTrigger.style.removeProperty("anchor-name"), e.anchorTrigger = null), e.anchorName = null, e.layer) {
    for (const t of Array.from(e.layer.children))
      t instanceof HTMLElement && jt(t);
    pt.delete(e.layer), Dt.get(e.layer)?.disconnect(), e.layer.remove(), e.layer = null;
  }
}
let wr = !1;
function Va() {
  if (wr)
    return;
  wr = !0;
  const e = Rt;
  e.computed = e.computed || {}, e.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, e.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, e.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, e.mounted = function() {
    io() && (this.hostRoot = Ea(this.$el), this.mounted = !0, this.hostRoot && (this.inline || yr(this), this.$watch("inline", (t) => {
      t ? xr(this) : yr(this);
    })));
  }, e.render = function() {
    return this.inline ? st(this.$slots, "default", { key: 0 }) : this.mounted ? ko(Pr, { key: 1, to: this.resolvedTarget || document.body }, [
      st(this.$slots, "default")
    ]) : z("", !0);
  }, e.unmounted = function() {
    xr(this);
  };
}
const Ma = {
  install: (e) => {
    Va(), e.use(pa, { theme: "none" });
  }
}, kr = /* @__PURE__ */ Er({
  __name: "IconField",
  props: {
    modelValue: {},
    fallback: {}
  },
  emits: ["update:modelValue"],
  setup(e, { emit: t }) {
    const r = e, o = t, n = A(null);
    let a = null;
    function i(l) {
      o("update:modelValue", l.detail || "");
    }
    async function s() {
      if (n.value) {
        a && a.removeEventListener("select", i), n.value.innerHTML = "";
        try {
          customElements.get("wc-icon-picker") || await Lo("wc-icon-picker", { timeoutMs: 8e3 });
        } catch {
        }
        n.value && (a = document.createElement("wc-icon-picker"), a.setAttribute("value", r.modelValue || ""), r.fallback && a.setAttribute("fallback", r.fallback), a.addEventListener("select", i), n.value.appendChild(a));
      }
    }
    return ut(s), be(() => r.modelValue, (l) => {
      a && a.getAttribute("value") !== l && a.setAttribute("value", l || "");
    }), Nr(() => {
      a && a.removeEventListener("select", i);
    }), (l, c) => (C(), N("div", {
      ref_key: "host",
      ref: n,
      class: "wc-iconfield"
    }, null, 512));
  }
});
var Ra = {
  name: "BaseEditableHolder",
  extends: ba,
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
      return r.find(R);
    }
  },
  computed: {
    $filled: function() {
      return R(this.d_value);
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
}, ja = `
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
`, Da = {
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
}, Ha = Z.extend({
  name: "colorpicker",
  style: ja,
  classes: Da
}), Ia = {
  name: "BaseColorPicker",
  extends: Ra,
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
  style: Ha,
  provide: function() {
    return {
      $pcColorPicker: this,
      $parentInstance: this
    };
  }
}, lo = {
  name: "ColorPicker",
  extends: Ia,
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
    this.unbindOutsideClickListener(), this.unbindDragListeners(), this.unbindResizeListener(), this.scrollHandler && (this.scrollHandler.destroy(), this.scrollHandler = null), this.picker && this.autoZIndex && St.clear(this.picker), this.clearRefs();
  },
  mounted: function() {
    this.updateUI();
  },
  methods: {
    pickColor: function(t) {
      var r = this.colorSelector.getBoundingClientRect(), o = r.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), n = r.left + document.body.scrollLeft, a = Math.floor(100 * Math.max(0, Math.min(150, (t.pageX || t.changedTouches[0].pageX) - n)) / 150), i = Math.floor(100 * (150 - Math.max(0, Math.min(150, (t.pageY || t.changedTouches[0].pageY) - o))) / 150);
      this.hsbValue = this.validateHSB({
        h: this.localHue,
        s: a,
        b: i
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
      }, o = Math.min(t.r, t.g, t.b), n = Math.max(t.r, t.g, t.b), a = n - o;
      return r.b = n, r.s = n !== 0 ? 255 * a / n : 0, r.s !== 0 ? t.r === n ? r.h = (t.g - t.b) / a : t.g === n ? r.h = 2 + (t.b - t.r) / a : r.h = 4 + (t.r - t.g) / a : r.h = -1, r.h *= 60, r.h < 0 && (r.h += 360), r.s *= 100 / 255, r.b *= 100 / 255, r;
    },
    HSBtoRGB: function(t) {
      var r = {
        r: null,
        g: null,
        b: null
      }, o = Math.round(t.h), n = Math.round(t.s * 255 / 100), a = Math.round(t.b * 255 / 100);
      if (n === 0)
        r = {
          r: a,
          g: a,
          b: a
        };
      else {
        var i = a, s = (255 - n) * a / 255, l = (i - s) * (o % 60) / 60;
        o === 360 && (o = 0), o < 60 ? (r.r = i, r.b = s, r.g = s + l) : o < 120 ? (r.g = i, r.b = s, r.r = i - l) : o < 180 ? (r.g = i, r.r = s, r.b = s + l) : o < 240 ? (r.b = i, r.r = s, r.g = i - l) : o < 300 ? (r.b = i, r.g = s, r.r = s + l) : o < 360 ? (r.r = i, r.g = s, r.b = i - l) : (r.r = 0, r.g = 0, r.b = 0);
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
      this.updateUI(), this.alignOverlay(), this.bindOutsideClickListener(), this.bindScrollListener(), this.bindResizeListener(), this.autoZIndex && St.set("overlay", t, this.baseZIndex || this.$primevue.config.zIndex.overlay), this.$attrSelector && t.setAttribute(this.$attrSelector, ""), this.$emit("show");
    },
    onOverlayLeave: function() {
      this.unbindOutsideClickListener(), this.unbindScrollListener(), this.unbindResizeListener(), this.clearRefs(), this.$emit("hide");
    },
    onOverlayAfterLeave: function(t) {
      this.autoZIndex && St.clear(t);
    },
    alignOverlay: function() {
      this.appendTo === "self" ? Sn(this.picker, this.$refs.input) : kn(this.picker, this.$refs.input);
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
      this.disabled || (this.colorDragging = !0, this.pickColor(t), this.$el.setAttribute("p-colorpicker-dragging", "true"), !this.isUnstyled && tr(this.$el, "p-colorpicker-dragging"), t.preventDefault());
    },
    onDrag: function(t) {
      this.colorDragging && (this.pickColor(t), t.preventDefault()), this.hueDragging && (this.pickHue(t), t.preventDefault());
    },
    onDragEnd: function() {
      this.colorDragging = !1, this.hueDragging = !1, this.$el.setAttribute("p-colorpicker-dragging", "false"), !this.isUnstyled && gn(this.$el, "p-colorpicker-dragging"), this.unbindDragListeners();
    },
    onHueMousedown: function(t) {
      this.disabled || (this.bindDragListeners(), this.onHueDragStart(t));
    },
    onHueDragStart: function(t) {
      this.disabled || (this.hueDragging = !0, this.pickHue(t), !this.isUnstyled && tr(this.$el, "p-colorpicker-dragging"), t.preventDefault());
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
      this.scrollHandler || (this.scrollHandler = new _a(this.$refs.container, function() {
        t.overlayVisible && (t.overlayVisible = !1);
      })), this.scrollHandler.bindScrollListener();
    },
    unbindScrollListener: function() {
      this.scrollHandler && this.scrollHandler.unbindScrollListener();
    },
    bindResizeListener: function() {
      var t = this;
      this.resizeListener || (this.resizeListener = function() {
        t.overlayVisible && !Cn() && (t.overlayVisible = !1);
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
      $a.emit("overlay-click", {
        originalEvent: t,
        target: this.$el
      });
    }
  },
  components: {
    Portal: Rt
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
function Sr(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(n) {
      return Object.getOwnPropertyDescriptor(e, n).enumerable;
    })), r.push.apply(r, o);
  }
  return r;
}
function _r(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Sr(Object(r), !0).forEach(function(o) {
      Ba(e, o, r[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r)) : Sr(Object(r)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(r, o));
    });
  }
  return e;
}
function Ba(e, t, r) {
  return (t = za(t)) in e ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = r, e;
}
function za(e) {
  var t = Ua(e, "string");
  return Ye(t) == "symbol" ? t : t + "";
}
function Ua(e, t) {
  if (Ye(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var o = r.call(e, t);
    if (Ye(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Fa = ["id", "tabindex", "disabled"];
function Wa(e, t, r, o, n, a) {
  var i = So("Portal");
  return C(), N("div", oe({
    ref: "container",
    class: e.cx("root")
  }, e.ptmi("root")), [e.inline ? z("", !0) : (C(), N("input", oe({
    key: 0,
    ref: "input",
    id: e.inputId,
    type: "text",
    class: e.cx("preview"),
    readonly: "",
    tabindex: e.tabindex,
    disabled: e.disabled,
    onClick: t[0] || (t[0] = function() {
      return a.onInputClick && a.onInputClick.apply(a, arguments);
    }),
    onKeydown: t[1] || (t[1] = function() {
      return a.onInputKeydown && a.onInputKeydown.apply(a, arguments);
    }),
    onBlur: t[2] || (t[2] = function() {
      return a.onInputBlur && a.onInputBlur.apply(a, arguments);
    })
  }, e.ptm("preview")), null, 16, Fa)), T(i, {
    appendTo: e.appendTo,
    disabled: e.inline
  }, {
    default: Gt(function() {
      return [T(_o, oe({
        name: "p-anchored-overlay",
        onEnter: a.onOverlayEnter,
        onLeave: a.onOverlayLeave,
        onAfterLeave: a.onOverlayAfterLeave
      }, e.ptm("transition")), {
        default: Gt(function() {
          return [e.inline || n.overlayVisible ? (C(), N("div", oe({
            key: 0,
            ref: a.pickerRef,
            class: [e.cx("panel"), e.panelClass, e.overlayClass],
            onClick: t[11] || (t[11] = function() {
              return a.onOverlayClick && a.onOverlayClick.apply(a, arguments);
            })
          }, _r(_r({}, e.ptm("panel")), e.ptm("overlay"))), [m("div", oe({
            class: e.cx("content")
          }, e.ptm("content")), [m("div", oe({
            ref: a.colorSelectorRef,
            class: e.cx("colorSelector"),
            onMousedown: t[3] || (t[3] = function(s) {
              return a.onColorMousedown(s);
            }),
            onTouchstart: t[4] || (t[4] = function(s) {
              return a.onColorDragStart(s);
            }),
            onTouchmove: t[5] || (t[5] = function(s) {
              return a.onDrag(s);
            }),
            onTouchend: t[6] || (t[6] = function(s) {
              return a.onDragEnd();
            })
          }, e.ptm("colorSelector")), [m("div", oe({
            class: e.cx("colorBackground")
          }, e.ptm("colorBackground")), [m("div", oe({
            ref: a.colorHandleRef,
            class: e.cx("colorHandle")
          }, e.ptm("colorHandle")), null, 16)], 16)], 16), m("div", oe({
            ref: a.hueViewRef,
            class: e.cx("hue"),
            onMousedown: t[7] || (t[7] = function(s) {
              return a.onHueMousedown(s);
            }),
            onTouchstart: t[8] || (t[8] = function(s) {
              return a.onHueDragStart(s);
            }),
            onTouchmove: t[9] || (t[9] = function(s) {
              return a.onDrag(s);
            }),
            onTouchend: t[10] || (t[10] = function(s) {
              return a.onDragEnd();
            })
          }, e.ptm("hue")), [m("div", oe({
            ref: a.hueHandleRef,
            class: e.cx("hueHandle")
          }, e.ptm("hueHandle")), null, 16)], 16)], 16)], 16)) : z("", !0)];
        }),
        _: 1
      }, 16, ["onEnter", "onLeave", "onAfterLeave"])];
    }),
    _: 1
  }, 8, ["appendTo", "disabled"])], 16);
}
lo.render = Wa;
const $r = "#22c55e", Ht = "--p-primary";
function Ka(e) {
  const t = /^rgba?\(([^)]+)\)/i.exec((e || "").trim());
  if (!t) return null;
  const r = t[1].split(",").map((n) => parseFloat(n.trim()));
  if (r.length < 3 || r.slice(0, 3).some((n) => Number.isNaN(n))) return null;
  const o = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${o(r[0])}${o(r[1])}${o(r[2])}`;
}
function It(e) {
  let t = (e || "").trim().replace(/^#/, "");
  return t.length === 3 && (t = t[0] + t[0] + t[1] + t[1] + t[2] + t[2]), /^[0-9a-fA-F]{6}$/.test(t) ? `#${t.toLowerCase()}` : null;
}
function Cr(e) {
  const t = It(e);
  if (!t) return null;
  const r = t.slice(1);
  return {
    r: parseInt(r.slice(0, 2), 16),
    g: parseInt(r.slice(2, 4), 16),
    b: parseInt(r.slice(4, 6), 16)
  };
}
function At(e, t) {
  const r = It(e);
  if (!r) return "";
  const o = `${Ht}: ${r};`;
  return t === ":host" ? `:host { ${o} }` : [
    `:root { ${o} }`,
    `@media (prefers-color-scheme: dark) { :root:not(.w-theme-light) { ${o} } }`,
    `:root.w-theme-dark, .w-theme-dark { ${o} }`,
    `@media (prefers-color-scheme: light) { :root:not(.w-theme-dark) { ${o} } }`,
    `:root.w-theme-light, .w-theme-light { ${o} }`
  ].join(`
`);
}
function Ga(e, t) {
  if (!e || typeof e != "object") return "";
  const r = e[Ht];
  return typeof r == "string" ? At(r, t) : "";
}
const Ya = { r: 255, g: 255, b: 255 }, Xa = { r: 12, g: 14, b: 18 }, qa = 2, Za = 2;
function Or(e) {
  const t = (r) => {
    const o = r / 255;
    return o <= 0.03928 ? o / 12.92 : Math.pow((o + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * t(e.r) + 0.7152 * t(e.g) + 0.0722 * t(e.b);
}
function Tr(e, t) {
  const r = Or(e), o = Or(t);
  return (Math.max(r, o) + 0.05) / (Math.min(r, o) + 0.05);
}
function Qa(e, t = typeof document < "u" ? document : void 0) {
  const r = It(e);
  if (!r) return null;
  if (!t || !t.body || !t.defaultView) return Cr(r);
  const o = t.createElement("span");
  o.style.setProperty(Ht, r), o.style.color = "var(--p-primary-color)", o.style.display = "none", t.body.appendChild(o);
  const n = t.defaultView.getComputedStyle(o).color;
  return o.remove(), Cr(Ka(n) || r);
}
function Ja(e) {
  const t = Qa(e);
  if (!t) return null;
  const r = Tr(t, Ya), o = Tr(t, Xa), n = r >= qa, a = o >= Za;
  let i = "";
  return !n && !a ? i = "This tone is too low-contrast - buttons and accents would be unreadable in both light and dark mode." : n ? a || (i = "This tone is too dark - accents would be invisible against the dark background.") : i = "This tone is too light - white button text and accents would be unreadable in light mode.", { ok: n && a, onLight: r, onDark: o, reason: i };
}
function ei({ items: e, categories: t, overrides: r, home: o }) {
  const n = (g) => g.route_name || g.id;
  function a(g, b) {
    const x = n(g), M = { ...r.value[x] || {} };
    for (const [I, U] of Object.entries(b))
      U === void 0 || U === "" ? delete M[I] : M[I] = U;
    r.value = { ...r.value, [x]: M };
  }
  function i(g, b) {
    a(g, { hidden: b || void 0 }), g.hidden = b;
  }
  function s(g, b) {
    a(g, { category: b }), g.category = b;
  }
  function l(g, b) {
    a(g, { order: b }), g.order = b;
  }
  function c(g, b) {
    const x = b.replace(/^\s+/, "");
    g.label = x, a(g, { label: x || void 0 });
  }
  function p(g, b) {
    const x = (b || "").trim();
    g.icon = x, a(g, { icon: x || void 0 });
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
  }), $ = de(() => e.value.filter((g) => g.hidden)), _ = (g) => t.value.find((b) => b.key === g), k = A(null), E = A(null), G = A(null), V = (g) => e.value.find((b) => b.id === g);
  function ce(g, b) {
    k.value = g.id, b.dataTransfer && (b.dataTransfer.effectAllowed = "move", b.dataTransfer.setData("text/plain", g.id));
  }
  function B() {
    k.value = null, E.value = null, G.value = null;
  }
  function ne(g) {
    const b = k.value ? V(k.value) : null;
    if (!b || b.id === g.id) return B();
    const x = g.category || "", M = f(x).filter((U) => U.id !== b.id), I = M.indexOf(g);
    M.splice(I < 0 ? M.length : I, 0, b), s(b, x), M.forEach((U, W) => l(U, W * 10)), B();
  }
  function ae(g) {
    const b = k.value ? V(k.value) : null;
    if (!b) return B();
    const x = f(g).filter((M) => M.id !== b.id);
    x.push(b), s(b, g), x.forEach((M, I) => l(M, I * 10)), B();
  }
  function F(g, b) {
    E.value = g, b.dataTransfer && (b.dataTransfer.effectAllowed = "move", b.dataTransfer.setData("text/plain", "cat:" + g));
  }
  function ee(g) {
    const b = E.value;
    if (!b || b === g) return B();
    const x = [...d.value], M = x.findIndex((W) => W.key === b), I = x.findIndex((W) => W.key === g);
    if (M < 0 || I < 0) return B();
    const [U] = x.splice(M, 1);
    x.splice(I, 0, U), x.forEach((W, ye) => {
      const xe = t.value.find((Me) => Me.key === W.key);
      xe && (xe.order = ye * 10);
    }), B();
  }
  let Y = 0;
  function ie() {
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
    patchOverride: a,
    setHidden: i,
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
    dragItemId: k,
    dragCatKey: E,
    overGroup: G,
    onItemDragStart: ce,
    endDrag: B,
    onItemDrop: ne,
    onGroupDrop: ae,
    onCatDragStart: F,
    onCatDrop: ee,
    addCategory: ie,
    removeCategory: Q,
    renameCategory: J,
    setCatIcon: te,
    isHome: X,
    setHome: se
  };
}
function ti({ logoUrl: e, error: t, apiError: r }) {
  const o = A(!1);
  async function n(i) {
    const s = i.target, l = s.files && s.files[0];
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
        const { data: p } = await it.post("/api/v1/nav/logo", c, { headers: { "Content-Type": "multipart/form-data" } });
        if (!p.success || !p.url) throw new Error(p.error || "upload failed");
        e.value = p.url;
      } catch (c) {
        t.value = r(c, "upload failed");
      } finally {
        o.value = !1, s.value = "";
      }
    }
  }
  function a() {
    e.value = "";
  }
  return { uploadingLogo: o, uploadLogo: n, removeLogo: a };
}
const ri = { class: "ap" }, oi = { class: "ap-body" }, ni = { class: "ap-bar" }, ai = {
  key: 0,
  class: "ap-dirty ap-dirty-warn"
}, ii = {
  key: 1,
  class: "ap-dirty"
}, si = ["disabled"], li = ["disabled"], ci = {
  key: 0,
  class: "ap-msg ap-err"
}, pi = {
  key: 1,
  class: "ap-loading"
}, ui = {
  key: 2,
  class: "ap-grid"
}, di = { class: "ap-side" }, hi = { class: "ap-card" }, fi = { class: "ap-h" }, mi = { class: "ap-logo" }, vi = { class: "ap-logo-prev" }, gi = ["src"], bi = { class: "ap-logo-actions" }, yi = ["accept", "disabled"], xi = { class: "ap-hint" }, wi = { class: "ap-tone" }, ki = {
  key: 0,
  class: "ap-tone-warn",
  role: "alert"
}, Si = {
  class: "ap-theme-modes",
  role: "group",
  "aria-label": "Color scheme"
}, _i = ["aria-pressed", "onClick"], $i = { class: "ap-card" }, Ci = { class: "ap-h" }, Oi = { class: "ap-layouts" }, Ti = { class: "ap-lo-name" }, Li = { class: "ap-lo-name" }, Pi = { class: "ap-card ap-legend" }, Ei = { class: "ap-h" }, Ni = { class: "ap-tips" }, Ai = { class: "ap-card" }, Vi = { class: "ap-h" }, Mi = ["disabled"], Ri = {
  key: 0,
  class: "ap-hint"
}, ji = { class: "ap-card ap-structure" }, Di = { class: "ap-h" }, Hi = ["onDragover", "onDragleave", "onDrop"], Ii = ["onDrop"], Bi = ["onDragstart"], zi = {
  key: 1,
  class: "ap-grip ap-grip-ghost",
  "aria-hidden": "true"
}, Ui = ["value", "onInput"], Fi = { class: "ap-tile ap-tile-muted" }, Wi = { class: "ap-field ap-field-strong ap-field-static" }, Ki = { class: "ap-count" }, Gi = ["onClick"], Yi = {
  key: 0,
  class: "ap-drop-hint"
}, Xi = ["onDrop"], qi = ["onDragstart"], Zi = ["value", "onInput"], Qi = { class: "ap-path" }, Ji = {
  key: 0,
  class: "ap-pill kx-tag-sm"
}, es = {
  key: 1,
  class: "ap-pill kx-tag-sm ap-pill-home"
}, ts = ["aria-label", "title", "onClick"], rs = ["onClick"], os = {
  key: 0,
  class: "ap-hidden"
}, ns = {
  key: 0,
  class: "ap-hidden-list"
}, as = { class: "ap-tile" }, is = { class: "ap-field ap-field-strong ap-field-static" }, ss = ["onClick"], ls = /* @__PURE__ */ Er({
  __name: "appearance",
  setup(e) {
    const t = A(!0), r = A(!1), o = A("");
    function n(w, u) {
      return w?.response?.data?.error || w?.message || u;
    }
    const a = A("vertical"), i = A(at.getThemeMode?.() ?? "auto"), s = A([]), l = A([]), c = A({}), p = A(!1), h = A(""), d = A(""), f = A(), S = de(() => f.value?.formats.flatMap((w) => [w.mime, ...w.extensions.map((u) => `.${u}`)]).join(",")), $ = de(() => f.value ? `${f.value.formats.map((w) => w.label).join(", ")} · up to ${f.value.max_bytes / 1048576} MB.` : ""), _ = ti({ logoUrl: d, error: o, apiError: n }), { uploadingLogo: k, uploadLogo: E, removeLogo: G } = _, V = A(""), ce = A($r), B = de({
      // PrimeVue's <ColorPicker format="hex"> exchanges a BARE rrggbb string, while the stored
      // setting and the hex text field both keep the #-prefixed form — so strip on the way in
      // and re-add on the way out. Falling back to defaultTone keeps the swatch showing the live
      // theme tone while the setting is unset.
      get: () => (V.value || ce.value).trim().replace(/^#/, ""),
      set: (w) => {
        const u = String(w ?? "").replace(/^#/, "");
        V.value = u ? `#${u}` : "";
      }
    });
    function ne() {
      V.value = "";
    }
    function ae(w) {
      i.value = w, at.setThemeMode(w);
    }
    const F = de(() => V.value.trim() ? Ja(V.value) : null), ee = de(() => !!V.value.trim() && F.value === null), Y = de(() => ee.value || !!F.value && !F.value.ok), ie = de(() => ee.value ? "Enter a valid hex color, e.g. #2563eb." : F.value && !F.value.ok ? F.value.reason : ""), Q = A(""), J = A(""), te = () => JSON.stringify({
      layout: a.value,
      cats: l.value,
      overrides: c.value,
      title: h.value,
      logo: d.value,
      home: Q.value,
      tone: V.value,
      pos: s.value.map((w) => [w.id, w.category, w.order, !!w.hidden])
    }), X = de(() => te() !== J.value);
    async function se() {
      t.value = !0, o.value = "";
      try {
        const { data: w } = await it.get("/api/v1/nav/list?manage=1");
        if (!w.success) throw new Error(w.error || "failed to load nav");
        f.value = w.logo_upload, s.value = (w.items ?? []).map((y) => ({ ...y })), a.value = w.layout === "horizontal" ? "horizontal" : "vertical";
        const u = w.config ?? {};
        return l.value = Array.isArray(u.categories) ? u.categories.map((y) => ({ ...y })) : [], c.value = u.overrides && typeof u.overrides == "object" ? structuredClone(u.overrides) : {}, h.value = typeof u.title == "string" ? u.title : "", d.value = typeof u.logo_url == "string" ? u.logo_url : "", V.value = typeof u.primary_color == "string" ? u.primary_color : "", Re = V.value, Q.value = typeof w.home == "string" ? w.home : typeof u.home == "string" ? u.home : "", J.value = te(), !0;
      } catch (w) {
        return o.value = n(w, "failed to load"), !1;
      } finally {
        t.value = !1;
      }
    }
    const g = ei({ items: s, categories: l, overrides: c, home: Q }), {
      setHidden: b,
      setLabel: x,
      setIcon: M,
      hasOverride: I,
      itemsOf: U,
      editorGroups: W,
      hiddenItems: ye,
      catByKey: xe,
      dragItemId: Me,
      overGroup: Oe,
      onItemDragStart: ht,
      endDrag: Te,
      onItemDrop: ft,
      onGroupDrop: Xe,
      onCatDragStart: mt,
      onCatDrop: vt,
      addCategory: qe,
      removeCategory: gt,
      renameCategory: bt,
      setCatIcon: yt,
      isHome: Se,
      setHome: xt
    } = g, we = A(!1), Ze = A(!1);
    async function wt() {
      we.value = !0, o.value = "";
      try {
        const { data: w } = await it.delete("/api/v1/ui/splash/seen");
        if (w?.success !== !0) throw new Error(w?.error || "could not reset setup");
        Ze.value = !0, window.dispatchEvent(new CustomEvent("kickside:nav-changed"));
      } catch (w) {
        o.value = n(w, "could not reset setup");
      } finally {
        we.value = !1;
      }
    }
    let pe = null, Bt = !1, Re = "", zt = null;
    async function co() {
      try {
        const w = await fetch("/app/css-variables.facade.json", { cache: "no-store" });
        if (!w.ok) return;
        const u = await w.json();
        if (u && typeof u == "object") {
          zt = u;
          const y = u["--p-primary"];
          typeof y == "string" && (ce.value = y), !V.value.trim() && Qe.value !== !1 && Le("");
        }
      } catch {
      }
    }
    function Ut(w, u) {
      return At(w, u) || Ga(zt, u) || At($r, u);
    }
    function Le(w) {
      window.dispatchEvent(new CustomEvent("kickside:tone-apply", {
        detail: { hostCss: Ut(w, ":root"), shadowCss: Ut(w, ":host") }
      }));
    }
    Nr(() => {
      Bt = !0, pe && clearTimeout(pe), Le(Re), Ft?.();
    });
    async function po() {
      if (Y.value) return;
      const w = te(), u = V.value;
      r.value = !0, o.value = "";
      try {
        const { data: y } = await it.put("/api/v1/nav/config", {
          layout: a.value,
          overrides: c.value,
          categories: l.value,
          title: h.value,
          logo_url: d.value,
          home: Q.value,
          primary_color: V.value
        });
        if (!y.success) throw new Error(y.error || "save failed");
        J.value = w, Re = u, Le(Bt || Qe.value === !1 ? Re : V.value);
      } catch (y) {
        o.value = n(y, "save failed");
      } finally {
        r.value = !1;
      }
    }
    let Ft = null;
    ut(() => {
      i.value = at.getThemeMode?.() ?? "auto", Ft = Ar("@theme", (w) => {
        i.value = w;
      }), co();
    });
    let Wt = !1;
    async function uo() {
      Wt && X.value || await se() && (Wt = !0);
    }
    const Qe = an(uo);
    return be(V, (w) => {
      pe && clearTimeout(pe), pe = null, Qe.value !== !1 && (pe = setTimeout(() => Le(w), 90));
    }), be(Qe, (w, u) => {
      u === !0 && w === !1 ? (pe && clearTimeout(pe), pe = null, Le(Re)) : u === !1 && w === !0 && X.value && Le(V.value);
    }), (w, u) => (C(), N("div", ri, [
      m("div", oi, [
        m("header", ni, [
          Y.value ? (C(), N("span", ai, re(ee.value ? "Invalid color" : "Tone unreadable"), 1)) : X.value ? (C(), N("span", ii, "Unsaved changes")) : z("", !0),
          m("button", {
            class: "ap-btn ap-btn-ghost",
            disabled: !X.value || r.value,
            onClick: se
          }, "Discard", 8, si),
          m("button", {
            class: "ap-btn ap-btn-primary",
            disabled: !X.value || r.value || Y.value,
            onClick: po
          }, [
            T(v(P), {
              icon: r.value ? "tabler:loader-2" : "tabler:device-floppy",
              class: me(r.value && "spin"),
              "aria-hidden": "true"
            }, null, 8, ["icon", "class"]),
            D(" " + re(r.value ? "Saving…" : "Save"), 1)
          ], 8, li)
        ]),
        o.value ? (C(), N("div", ci, re(o.value), 1)) : z("", !0),
        t.value ? (C(), N("div", pi, [
          T(v(P), {
            icon: "tabler:loader-2",
            class: "spin"
          }),
          u[13] || (u[13] = D(" Loading…", -1))
        ])) : (C(), N("div", ui, [
          m("aside", di, [
            m("section", hi, [
              m("header", fi, [
                T(v(P), {
                  icon: "tabler:photo",
                  "aria-hidden": "true"
                }),
                u[14] || (u[14] = D(" Branding", -1))
              ]),
              u[17] || (u[17] = m("p", { class: "ap-sub" }, "Title and logo apply to everyone on this installation — header, login page, and browser tab.", -1)),
              u[18] || (u[18] = m("label", { class: "ap-blabel" }, "Title", -1)),
              Yt(m("input", {
                "onUpdate:modelValue": u[0] || (u[0] = (y) => h.value = y),
                class: "ap-binput",
                type: "text",
                maxlength: "60",
                placeholder: "KickSide"
              }, null, 512), [
                [Xt, h.value]
              ]),
              u[19] || (u[19] = m("label", { class: "ap-blabel" }, "Logo", -1)),
              m("div", mi, [
                m("span", vi, [
                  d.value ? (C(), N("img", {
                    key: 0,
                    src: d.value,
                    alt: "Logo preview"
                  }, null, 8, gi)) : (C(), He(v(P), {
                    key: 1,
                    icon: "tabler:photo",
                    "aria-hidden": "true"
                  }))
                ]),
                m("div", bi, [
                  m("label", {
                    class: me(["ap-btn ap-btn-ghost", v(k) && "ap-btn-busy"])
                  }, [
                    T(v(P), {
                      icon: v(k) ? "tabler:loader-2" : "tabler:upload",
                      class: me(v(k) && "spin"),
                      "aria-hidden": "true"
                    }, null, 8, ["icon", "class"]),
                    D(" " + re(v(k) ? "Uploading…" : "Upload") + " ", 1),
                    m("input", {
                      type: "file",
                      accept: S.value,
                      class: "ap-file",
                      disabled: v(k) || !f.value,
                      onChange: u[1] || (u[1] = //@ts-ignore
                      (...y) => v(E) && v(E)(...y))
                    }, null, 40, yi)
                  ], 2),
                  d.value ? (C(), N("button", {
                    key: 0,
                    class: "ap-btn ap-btn-ghost ap-danger",
                    onClick: u[2] || (u[2] = //@ts-ignore
                    (...y) => v(G) && v(G)(...y))
                  }, [
                    T(v(P), {
                      icon: "tabler:trash",
                      "aria-hidden": "true"
                    }),
                    u[15] || (u[15] = D(" Remove ", -1))
                  ])) : z("", !0)
                ])
              ]),
              m("p", xi, re($.value), 1),
              u[20] || (u[20] = m("label", { class: "ap-blabel" }, "Base tone", -1)),
              m("div", wi, [
                T(v(lo), {
                  modelValue: B.value,
                  "onUpdate:modelValue": u[3] || (u[3] = (y) => B.value = y),
                  format: "hex",
                  class: "ap-tone-swatch",
                  pt: { preview: { class: "ap-tone-preview", "aria-label": "Base tone color", "data-testid": "appearance-base-tone-picker" } }
                }, null, 8, ["modelValue"]),
                Yt(m("input", {
                  "onUpdate:modelValue": u[4] || (u[4] = (y) => V.value = y),
                  class: "ap-binput ap-tone-hex",
                  type: "text",
                  maxlength: "7",
                  placeholder: "Default",
                  "aria-label": "Base tone hex"
                }, null, 512), [
                  [Xt, V.value]
                ]),
                V.value ? (C(), N("button", {
                  key: 0,
                  class: "ap-btn ap-btn-ghost",
                  onClick: ne
                }, [
                  T(v(P), {
                    icon: "tabler:rotate",
                    "aria-hidden": "true"
                  }),
                  u[16] || (u[16] = D(" Reset", -1))
                ])) : z("", !0)
              ]),
              ie.value ? (C(), N("p", ki, [
                T(v(P), {
                  icon: "tabler:alert-triangle",
                  "aria-hidden": "true"
                }),
                D(" " + re(ie.value), 1)
              ])) : z("", !0),
              u[21] || (u[21] = m("p", { class: "ap-hint" }, "Primary color for buttons, links and accents. Applies across the app instantly.", -1)),
              u[22] || (u[22] = m("label", { class: "ap-blabel" }, "Color scheme", -1)),
              m("div", Si, [
                (C(), N(Pe, null, Je([
                  { mode: "auto", label: "Auto", icon: "tabler:device-desktop" },
                  { mode: "light", label: "Light", icon: "tabler:sun" },
                  { mode: "dark", label: "Dark", icon: "tabler:moon" }
                ], (y) => m("button", {
                  key: y.mode,
                  type: "button",
                  class: me(["ap-theme-mode", i.value === y.mode && "ap-theme-mode-on"]),
                  "aria-pressed": i.value === y.mode,
                  onClick: (L) => ae(y.mode)
                }, [
                  T(v(P), {
                    icon: y.icon,
                    "aria-hidden": "true"
                  }, null, 8, ["icon"]),
                  D(" " + re(y.label), 1)
                ], 10, _i)), 64))
              ]),
              u[23] || (u[23] = m("p", { class: "ap-hint" }, "Auto follows your browser or operating system setting. Changes apply immediately.", -1))
            ]),
            m("section", $i, [
              m("header", Ci, [
                T(v(P), {
                  icon: "tabler:layout-2",
                  "aria-hidden": "true"
                }),
                u[24] || (u[24] = D(" Layout", -1))
              ]),
              u[31] || (u[31] = m("p", { class: "ap-sub" }, "Where navigation sits.", -1)),
              m("div", Oi, [
                m("button", {
                  class: me(["ap-lo", a.value === "vertical" && "ap-lo-on"]),
                  onClick: u[5] || (u[5] = (y) => a.value = "vertical")
                }, [
                  u[26] || (u[26] = m("span", { class: "mock mock-v" }, [
                    m("span", { class: "mock-rail" }, [
                      m("i"),
                      m("i"),
                      m("i")
                    ]),
                    m("span", { class: "mock-fill" })
                  ], -1)),
                  m("span", Ti, [
                    u[25] || (u[25] = D("Vertical ", -1)),
                    a.value === "vertical" ? (C(), He(v(P), {
                      key: 0,
                      icon: "tabler:circle-check-filled",
                      "aria-hidden": "true"
                    })) : z("", !0)
                  ]),
                  u[27] || (u[27] = m("span", { class: "ap-lo-desc" }, "Sidebar rail", -1))
                ], 2),
                m("button", {
                  class: me(["ap-lo", a.value === "horizontal" && "ap-lo-on"]),
                  onClick: u[6] || (u[6] = (y) => a.value = "horizontal")
                }, [
                  u[29] || (u[29] = m("span", { class: "mock mock-h" }, [
                    m("span", { class: "mock-top" }, [
                      m("i"),
                      m("i"),
                      m("i")
                    ]),
                    m("span", { class: "mock-fill" })
                  ], -1)),
                  m("span", Li, [
                    u[28] || (u[28] = D("Horizontal ", -1)),
                    a.value === "horizontal" ? (C(), He(v(P), {
                      key: 0,
                      icon: "tabler:circle-check-filled",
                      "aria-hidden": "true"
                    })) : z("", !0)
                  ]),
                  u[30] || (u[30] = m("span", { class: "ap-lo-desc" }, "Top bar", -1))
                ], 2)
              ])
            ]),
            m("section", Pi, [
              m("header", Ei, [
                T(v(P), {
                  icon: "tabler:info-circle",
                  "aria-hidden": "true"
                }),
                u[32] || (u[32] = D(" How it works", -1))
              ]),
              m("ul", Ni, [
                m("li", null, [
                  T(v(P), {
                    icon: "tabler:grip-vertical",
                    "aria-hidden": "true"
                  }),
                  u[33] || (u[33] = D(" Drag to reorder or move between categories.", -1))
                ]),
                m("li", null, [
                  T(v(P), {
                    icon: "tabler:cursor-text",
                    "aria-hidden": "true"
                  }),
                  u[34] || (u[34] = D(" Click a label to rename it.", -1))
                ]),
                m("li", null, [
                  T(v(P), {
                    icon: "tabler:mood-smile",
                    "aria-hidden": "true"
                  }),
                  u[35] || (u[35] = D(" Click an icon to pick a new Tabler glyph.", -1))
                ]),
                m("li", null, [
                  T(v(P), {
                    icon: "tabler:eye-off",
                    "aria-hidden": "true"
                  }),
                  u[36] || (u[36] = D(" Hide a surface without removing its module.", -1))
                ])
              ])
            ]),
            m("section", Ai, [
              m("header", Vi, [
                T(v(P), {
                  icon: "tabler:rocket",
                  "aria-hidden": "true"
                }),
                u[37] || (u[37] = D(" Setup", -1))
              ]),
              u[38] || (u[38] = m("p", { class: "ap-sub" }, "Reopen setup for this installation. Once completed, it stays closed for everyone.", -1)),
              m("button", {
                class: "ap-btn ap-btn-ghost",
                disabled: we.value,
                onClick: wt
              }, [
                T(v(P), {
                  icon: we.value ? "tabler:loader-2" : "tabler:refresh",
                  class: me(we.value && "spin"),
                  "aria-hidden": "true"
                }, null, 8, ["icon", "class"]),
                D(" " + re(we.value ? "Resetting…" : "Show setup again"), 1)
              ], 8, Mi),
              Ze.value ? (C(), N("p", Ri, "Setup will appear now, or next time the app loads.")) : z("", !0)
            ])
          ]),
          m("section", ji, [
            m("header", Di, [
              T(v(P), {
                icon: "tabler:sitemap",
                "aria-hidden": "true"
              }),
              u[40] || (u[40] = D(" Structure ", -1)),
              m("button", {
                class: "ap-btn ap-btn-ghost ap-add",
                onClick: u[7] || (u[7] = //@ts-ignore
                (...y) => v(qe) && v(qe)(...y))
              }, [
                T(v(P), {
                  icon: "tabler:folder-plus",
                  "aria-hidden": "true"
                }),
                u[39] || (u[39] = D(" Add category", -1))
              ])
            ]),
            (C(!0), N(Pe, null, Je(v(W), (y) => (C(), N("div", {
              key: y.key || "_root",
              class: me(["ap-group", v(Oe) === y.key && "ap-group-over"]),
              onDragover: Ee((L) => Oe.value = y.key, ["prevent"]),
              onDragleave: (L) => v(Oe) === y.key && (Oe.value = null),
              onDrop: Ee((L) => v(Xe)(y.key), ["prevent"])
            }, [
              m("div", {
                class: "ap-group-head",
                onDragover: u[9] || (u[9] = Ee(() => {
                }, ["prevent"])),
                onDrop: Ee((L) => y.real ? v(vt)(y.key) : v(Xe)(y.key), ["prevent", "stop"])
              }, [
                y.real ? (C(), N("span", {
                  key: 0,
                  class: "ap-grip ap-grip-cat",
                  draggable: "true",
                  title: "Drag to reorder category",
                  onDragstart: (L) => v(mt)(y.key, L),
                  onDragend: u[8] || (u[8] = //@ts-ignore
                  (...L) => v(Te) && v(Te)(...L))
                }, [
                  T(v(P), {
                    icon: "tabler:grip-vertical",
                    "aria-hidden": "true"
                  })
                ], 40, Bi)) : (C(), N("span", zi)),
                y.real ? (C(), N(Pe, { key: 2 }, [
                  T(kr, {
                    "model-value": v(xe)(y.key)?.icon || "",
                    fallback: "tabler:folder",
                    "onUpdate:modelValue": (L) => v(yt)(y.key, L)
                  }, null, 8, ["model-value", "onUpdate:modelValue"]),
                  m("input", {
                    value: v(xe)(y.key)?.label,
                    class: "ap-field ap-field-strong",
                    "aria-label": "Category name",
                    placeholder: "Category name",
                    onInput: (L) => v(bt)(y.key, L.target.value)
                  }, null, 40, Ui)
                ], 64)) : (C(), N(Pe, { key: 3 }, [
                  m("span", Fi, [
                    T(v(P), {
                      icon: "tabler:layout-list",
                      "aria-hidden": "true"
                    })
                  ]),
                  m("span", Wi, re(y.label), 1)
                ], 64)),
                m("span", Ki, re(v(U)(y.key).length), 1),
                y.real ? (C(), N("button", {
                  key: 4,
                  class: "ap-icon-btn ap-danger",
                  "aria-label": "Remove category",
                  title: "Remove category",
                  onClick: (L) => v(gt)(y.key)
                }, [
                  T(v(P), {
                    icon: "tabler:trash",
                    "aria-hidden": "true"
                  })
                ], 8, Gi)) : z("", !0)
              ], 40, Ii),
              v(U)(y.key).length === 0 ? (C(), N("div", Yi, "Drag a surface here")) : z("", !0),
              (C(!0), N(Pe, null, Je(v(U)(y.key), (L) => (C(), N("div", {
                key: L.id,
                class: me(["ap-row", v(Me) === L.id && "ap-row-dragging"]),
                onDragover: u[11] || (u[11] = Ee(() => {
                }, ["prevent", "stop"])),
                onDrop: Ee((fe) => v(ft)(L), ["prevent", "stop"])
              }, [
                m("span", {
                  class: "ap-grip",
                  draggable: "true",
                  title: "Drag to reorder or move",
                  onDragstart: (fe) => v(ht)(L, fe),
                  onDragend: u[10] || (u[10] = //@ts-ignore
                  (...fe) => v(Te) && v(Te)(...fe))
                }, [
                  T(v(P), {
                    icon: "tabler:grip-vertical",
                    "aria-hidden": "true"
                  })
                ], 40, qi),
                T(kr, {
                  "model-value": L.icon || "",
                  fallback: "tabler:square",
                  "onUpdate:modelValue": (fe) => v(M)(L, fe)
                }, null, 8, ["model-value", "onUpdate:modelValue"]),
                m("input", {
                  value: L.label,
                  class: "ap-field ap-field-strong",
                  "aria-label": "Surface label",
                  placeholder: "Label",
                  onInput: (fe) => v(x)(L, fe.target.value)
                }, null, 40, Zi),
                m("span", Qi, re(L.path), 1),
                L.source === "custom" ? (C(), N("span", Ji, "custom")) : z("", !0),
                v(Se)(L) ? (C(), N("span", es, [
                  T(v(P), {
                    icon: "tabler:home",
                    "aria-hidden": "true"
                  }),
                  u[41] || (u[41] = D(" home", -1))
                ])) : z("", !0),
                v(I)(L) ? (C(), He(v(P), {
                  key: 2,
                  icon: "tabler:pencil",
                  class: "ap-edited",
                  title: "Customized — reset the field to revert",
                  "aria-hidden": "true"
                })) : z("", !0),
                m("button", {
                  class: me(["ap-icon-btn", v(Se)(L) && "ap-home-on"]),
                  "aria-label": v(Se)(L) ? "Home page (click to unset)" : "Set as home page",
                  title: v(Se)(L) ? "Home page — click to unset" : "Set as home page",
                  onClick: (fe) => v(xt)(L)
                }, [
                  T(v(P), {
                    icon: v(Se)(L) ? "tabler:home-filled" : "tabler:home",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ], 10, ts),
                m("button", {
                  class: "ap-icon-btn",
                  "aria-label": "Hide",
                  title: "Hide",
                  onClick: (fe) => v(b)(L, !0)
                }, [
                  T(v(P), {
                    icon: "tabler:eye",
                    "aria-hidden": "true"
                  })
                ], 8, rs)
              ], 42, Xi))), 128))
            ], 42, Hi))), 128)),
            v(ye).length ? (C(), N("div", os, [
              m("button", {
                class: "ap-hidden-h",
                onClick: u[12] || (u[12] = (y) => p.value = !p.value)
              }, [
                T(v(P), {
                  icon: p.value ? "tabler:chevron-down" : "tabler:chevron-right",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                T(v(P), {
                  icon: "tabler:eye-off",
                  "aria-hidden": "true"
                }),
                D(" Hidden (" + re(v(ye).length) + ") ", 1)
              ]),
              p.value ? (C(), N("div", ns, [
                (C(!0), N(Pe, null, Je(v(ye), (y) => (C(), N("div", {
                  key: y.id,
                  class: "ap-row ap-row-off"
                }, [
                  u[42] || (u[42] = m("span", {
                    class: "ap-grip ap-grip-ghost",
                    "aria-hidden": "true"
                  }, null, -1)),
                  m("span", as, [
                    T(v(P), {
                      icon: y.icon || "tabler:square",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"])
                  ]),
                  m("span", is, re(y.label), 1),
                  m("button", {
                    class: "ap-icon-btn",
                    "aria-label": "Show",
                    title: "Show",
                    onClick: (L) => v(b)(y, !1)
                  }, [
                    T(v(P), {
                      icon: "tabler:eye-plus",
                      "aria-hidden": "true"
                    })
                  ], 8, ss)
                ]))), 128))
              ])) : z("", !0)
            ])) : z("", !0)
          ])
        ]))
      ])
    ]));
  }
}), cs = ':root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}.spin{animation:kx-spin 1s linear infinite}@keyframes kx-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.spin{animation:none}}.kx-tag-sm,.kx-tag-sm.kx-tag-sm{display:inline-flex;align-items:center;gap:4px;padding:1px 7px;border-radius:var(--kx-radius-tag, 6px);font-size:10.5px;font-weight:600;line-height:1.5;white-space:nowrap}.kx-tag-sm svg,.kx-tag-sm.kx-tag-sm svg{width:12px;height:12px}.kx-tag-caps,.kx-tag-caps.kx-tag-caps{display:inline-flex;align-items:center;gap:3px;padding:2px 6px;border-radius:var(--kx-radius-tag, 6px);font-size:9px;font-weight:700;line-height:1.5;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap}.kx-tag-caps svg,.kx-tag-caps.kx-tag-caps svg{width:11px;height:11px}:host,:root{--kx-surface-1: color-mix(in srgb, var(--p-content-background) 96%, var(--p-text-color) 4%);--kx-surface-2: color-mix(in srgb, var(--p-content-background) 92%, var(--p-text-color) 8%);--kx-surface-3: color-mix(in srgb, var(--p-content-background) 86%, var(--p-text-color) 14%);--kx-surface-4: color-mix(in srgb, var(--p-content-background) 78%, var(--p-text-color) 22%);--kx-border-strong: color-mix(in srgb, var(--p-content-border-color) 60%, var(--p-text-color) 40%);--kx-border-stronger: color-mix(in srgb, var(--p-content-border-color) 30%, var(--p-text-color) 70%);--kx-text-faint: color-mix(in srgb, var(--p-text-muted-color) 70%, var(--p-content-background) 30%);--kx-text-fainter: color-mix(in srgb, var(--p-text-muted-color) 45%, var(--p-content-background) 55%);--kx-wash-primary: color-mix(in srgb, var(--p-primary-color) 12%, var(--p-content-background) 88%);--kx-wash-success: color-mix(in srgb, var(--p-success-500) 12%, var(--p-content-background) 88%);--kx-wash-info: color-mix(in srgb, var(--p-info-500) 12%, var(--p-content-background) 88%);--kx-wash-warn: color-mix(in srgb, var(--p-warn-500) 12%, var(--p-content-background) 88%);--kx-wash-danger: color-mix(in srgb, var(--p-danger-500) 12%, var(--p-content-background) 88%);--kx-wash-help: color-mix(in srgb, var(--p-help-500) 12%, var(--p-content-background) 88%);--kx-font-heading: "Outfit", system-ui, sans-serif;--kx-font-body: "Inter", system-ui, sans-serif;--kx-radius-4: 4px;--kx-radius-6: 6px;--kx-radius-8: 8px;--kx-radius-10: 10px;--kx-radius-14: 14px;--kx-radius-16: 16px;--kx-radius-tag: var(--p-content-border-radius, 6px);--kx-control-height: 34px;--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .08);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .12);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .18);--kx-overlay-hover: color-mix(in srgb, var(--p-text-color) 7%, transparent);--kx-overlay-subtle: color-mix(in srgb, var(--p-text-color) 4%, transparent)}@media(prefers-color-scheme:dark){:host(:not(.w-theme-light)),:root:not(.w-theme-light){--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .35);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .45);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .6)}}:host(.w-theme-dark),:root.w-theme-dark{--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .35);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .45);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .6)}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}:host{display:block;height:100%;min-height:0}:host>div{height:100%;min-height:0}*,*:before,*:after{box-sizing:border-box}.ap{--system-surface-gutter: var(--kickside-system-surface-gutter, 24px);height:100%;display:flex;flex-direction:column;color:var(--p-text-color);background:var(--p-content-background)}.ap-bar{display:flex;align-items:center;justify-content:flex-end;gap:10px;width:100%;margin:0;padding:12px var(--system-surface-gutter);background:var(--p-content-background);position:sticky;top:0;z-index:3}.ap-dirty{display:inline-flex;align-items:center;height:34px;font-size:12px;font-weight:600;color:var(--p-warn-600, var(--p-warn-500));background:color-mix(in srgb,var(--p-warn-500) 16%,transparent);padding:0 11px;border-radius:8px}.ap-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:34px;padding:0 14px;border-radius:8px;border:1px solid transparent;font:inherit;font-size:13px;font-weight:600;cursor:pointer;transition:filter .15s,background .15s,opacity .15s}.ap-btn:disabled{opacity:.45;cursor:default}.ap-btn-primary{background:var(--p-primary-color);color:var(--p-button-primary-color)}.ap-btn-primary:hover:not(:disabled){filter:brightness(1.05)}.ap-btn-ghost{background:transparent;border-color:var(--p-content-border-color);color:var(--p-text-color)}.ap-btn-ghost:hover:not(:disabled){background:color-mix(in srgb,var(--p-text-color) 8%,transparent)}.ap-btn svg{width:16px;height:16px}.ap-msg{width:calc(100% - (var(--system-surface-gutter) * 2));margin:12px 0 0 var(--system-surface-gutter);padding:9px 12px;border-radius:8px;font-size:13px}.ap-err{background:color-mix(in srgb,var(--p-danger-500) 12%,transparent);color:var(--p-danger-600, var(--p-danger-500))}.ap-loading{display:flex;align-items:center;gap:8px;color:var(--p-text-muted-color);font-size:13px;padding:24px}.ap-body{flex:1;overflow-y:auto;padding:0 0 28px}.ap-grid{display:grid;grid-template-columns:290px minmax(0,1fr);gap:16px;align-items:start;width:100%;margin:0;padding:6px var(--system-surface-gutter) 0}.ap-side{position:sticky;top:58px;display:flex;flex-direction:column;gap:16px}@media(max-width:880px){.ap-grid{grid-template-columns:1fr}.ap-side{position:static}}.ap-card{background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:14px;padding:16px 18px}.ap-structure{min-height:0}.ap-h{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:800;color:var(--p-text-color);letter-spacing:-.2px}.ap-h svg{width:17px;height:17px;color:var(--p-text-muted-color)}.ap-add{margin-left:auto;height:30px;padding:0 10px}.ap-sub{font-size:12.5px;color:var(--p-text-muted-color);margin:4px 0 12px}.ap-blabel{display:block;font-size:11.5px;font-weight:700;color:var(--p-text-muted-color);text-transform:uppercase;letter-spacing:.04em;margin:12px 0 6px}.ap-binput{width:100%;height:34px;padding:0 12px;border-radius:8px;border:1px solid var(--p-content-border-color);background:var(--p-content-background);color:var(--p-text-color);font:inherit;font-size:13px;box-sizing:border-box}.ap-logo{display:flex;align-items:center;gap:12px}.ap-logo-prev{display:flex;align-items:center;justify-content:center;width:56px;height:56px;flex:none;border-radius:11px;border:1px solid var(--p-content-border-color);background:color-mix(in srgb,var(--p-text-color) 4%,transparent);overflow:hidden}.ap-logo-prev img{width:100%;height:100%;object-fit:contain}.ap-logo-prev svg{width:22px;height:22px;color:var(--p-text-muted-color)}.ap-logo-actions{display:flex;flex-wrap:wrap;gap:8px}.ap-btn-busy{opacity:.7;pointer-events:none}.ap-file{position:absolute;width:1px;height:1px;opacity:0;overflow:hidden}.ap-hint{font-size:11.5px;color:var(--p-text-muted-color);margin:8px 0 0}.ap-tone-warn{display:flex;align-items:flex-start;gap:6px;margin:8px 0 0;font-size:11.5px;font-weight:600;line-height:1.35;color:var(--p-danger-600, var(--p-danger-500))}.ap-tone-warn svg{width:14px;height:14px;flex:none;margin-top:1px}.ap-dirty-warn{color:var(--p-danger-600, var(--p-danger-500));background:color-mix(in srgb,var(--p-danger-500) 16%,transparent)}.ap-tone{display:flex;align-items:center;gap:8px}.ap-tone-swatch{flex:none;display:inline-flex}.ap-tone-preview{width:40px;height:34px;border-radius:8px;border:1px solid var(--p-content-border-color);cursor:pointer}.ap-tone-hex{flex:1}.ap-theme-modes{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:2px;padding:3px;border-radius:8px;background:color-mix(in srgb,var(--p-text-color) 5%,transparent)}.ap-theme-mode{display:inline-flex;align-items:center;justify-content:center;gap:5px;min-width:0;height:28px;padding:0 6px;border:0;border-radius:6px;background:transparent;color:var(--p-text-muted-color);cursor:pointer;font:inherit;font-size:12px;font-weight:600}.ap-theme-mode svg{width:15px;height:15px;flex:none}.ap-theme-mode:hover{color:var(--p-text-color)}.ap-theme-mode-on{color:var(--p-text-color);background:var(--p-content-background);box-shadow:0 1px 3px color-mix(in srgb,var(--p-text-color) 12%,transparent)}.ap-layouts{display:grid;grid-template-columns:1fr 1fr;gap:10px}.ap-lo{display:flex;flex-direction:column;gap:8px;padding:11px;background:var(--p-content-background);border:2px solid var(--p-content-border-color);border-radius:14px;cursor:pointer;transition:border-color .15s,transform .15s;text-align:left}.ap-lo:hover{transform:translateY(-1px);border-color:color-mix(in srgb,var(--p-text-color) 24%,var(--p-content-border-color))}.ap-lo-on{border-color:var(--p-primary-color)}.ap-lo-name{display:flex;align-items:center;gap:5px;font-size:13px;font-weight:700;color:var(--p-text-color)}.ap-lo-name svg{width:15px;height:15px;color:var(--p-primary-color)}.ap-lo-desc{font-size:11.5px;color:var(--p-text-muted-color)}.mock{display:block;height:56px;border:1px solid var(--p-content-border-color);border-radius:8px;overflow:hidden;background:color-mix(in srgb,var(--p-text-color) 4%,var(--p-content-background))}.mock-v{display:flex}.mock-v .mock-rail{width:26%;background:color-mix(in srgb,var(--p-text-color) 8%,var(--p-content-background));display:flex;flex-direction:column;gap:5px;padding:7px 6px}.mock-v .mock-rail i{height:5px;border-radius:3px;background:color-mix(in srgb,var(--p-text-color) 22%,transparent)}.mock-v .mock-fill{flex:1}.mock-h{display:flex;flex-direction:column}.mock-h .mock-top{height:30%;background:color-mix(in srgb,var(--p-text-color) 8%,var(--p-content-background));display:flex;gap:6px;align-items:center;padding:0 7px}.mock-h .mock-top i{width:16px;height:5px;border-radius:3px;background:color-mix(in srgb,var(--p-text-color) 22%,transparent)}.mock-h .mock-fill{flex:1}.ap-lo-on .mock-rail i,.ap-lo-on .mock-top i{background:var(--p-primary-color)}.ap-legend .ap-tips{list-style:none;margin:10px 0 0;padding:0;display:flex;flex-direction:column;gap:9px}.ap-legend .ap-tips li{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--p-text-color)}.ap-legend .ap-tips svg{width:15px;height:15px;color:var(--p-text-muted-color);flex-shrink:0}.ap-group{border:1px solid var(--p-content-border-color);border-radius:14px;margin-top:12px;overflow:hidden;transition:border-color .12s,box-shadow .12s}.ap-group-over{border-color:var(--p-primary-color);box-shadow:0 0 0 3px color-mix(in srgb,var(--p-primary-color) 14%,transparent)}.ap-group-head{display:flex;align-items:center;gap:9px;padding:9px 12px;background:color-mix(in srgb,var(--p-text-color) 4%,var(--p-content-background));border-bottom:1px solid var(--p-content-border-color)}.ap-count{margin-left:auto;font-size:11px;color:var(--p-text-muted-color);background:color-mix(in srgb,var(--p-text-color) 8%,var(--p-content-background));padding:1px 8px;border-radius:999px;font-variant-numeric:tabular-nums;flex-shrink:0}.ap-grip{display:flex;align-items:center;justify-content:center;width:22px;cursor:grab;color:color-mix(in srgb,var(--p-text-muted-color) 70%,transparent);flex-shrink:0}.ap-grip:active{cursor:grabbing}.ap-grip:hover{color:var(--p-text-color)}.ap-grip svg{width:16px;height:16px}.ap-grip-cat svg{width:15px;height:15px}.ap-grip-ghost{cursor:default}.ap-drop-hint{font-size:12px;color:color-mix(in srgb,var(--p-text-muted-color) 70%,transparent);padding:14px;text-align:center;font-style:italic}.ap-row{display:flex;align-items:center;gap:9px;padding:8px 12px 8px 6px;border-bottom:1px solid var(--p-content-border-color);background:var(--p-content-background)}.ap-row:last-child{border-bottom:none}.ap-row:hover{background:color-mix(in srgb,var(--p-text-color) 4%,var(--p-content-background))}.ap-row-dragging{opacity:.4}.ap-row-off{opacity:.8;padding-left:6px}.ap-tile{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-text-color) 8%,var(--p-content-background));color:var(--p-text-color);flex-shrink:0}.ap-tile-muted{color:var(--p-text-muted-color)}.ap-tile svg{width:18px;height:18px}.wc-iconfield{display:inline-flex;align-items:center;flex-shrink:0}.ap-field{min-width:0;background:transparent;border:1px solid transparent;border-radius:8px;padding:6px 9px;font:inherit;font-size:13px;color:var(--p-text-color);transition:border-color .12s,background .12s}.ap-field-strong{flex:1;font-weight:600}.ap-field:not(.ap-field-static):hover{border-color:var(--p-content-border-color)}.ap-field:focus{background:var(--p-content-background)}.ap-field-static{border-color:transparent;cursor:default;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ap-path{font-family:ui-monospace,monospace;font-size:11.5px;color:color-mix(in srgb,var(--p-text-muted-color) 80%,transparent);flex-shrink:0;white-space:nowrap}@media(max-width:640px){.ap-path{display:none}}.ap-pill{flex-shrink:0;color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 14%,transparent)}.ap-edited{width:14px;height:14px;color:var(--p-primary-color);flex-shrink:0}.ap-icon-btn{width:30px;height:30px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;border:1px solid transparent;background:transparent;color:var(--p-text-muted-color);cursor:pointer;flex-shrink:0;transition:background .15s,color .15s}.ap-icon-btn:hover{color:var(--p-text-color);background:color-mix(in srgb,var(--p-text-color) 8%,transparent)}.ap-icon-btn svg{width:16px;height:16px}.ap-danger:hover{color:var(--p-danger-600, var(--p-danger-500))}.ap-home-on{color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 12%,transparent)}.ap-home-on:hover{color:var(--p-primary-color)}.ap-pill-home svg{width:11px;height:11px}.ap-hidden{margin-top:14px}.ap-hidden-h{display:flex;align-items:center;gap:6px;width:100%;font-size:12px;font-weight:600;color:var(--p-text-color);background:transparent;border:none;padding:6px 2px;cursor:pointer}.ap-hidden-h svg{width:15px;height:15px}.ap-hidden-list{border:1px dashed var(--p-content-border-color);border-radius:14px;margin-top:4px;overflow:hidden}', ps = { props: { type: "object", properties: {} } }, us = {
  wippy: ps
};
class ds extends sn {
  static get wippyConfig() {
    return {
      propsSchema: us.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: cs
    };
  }
  static get vueConfig() {
    return { rootComponent: ls, plugins: [Ma] };
  }
}
Po(import.meta.url, ds);
//# sourceMappingURL=index.js.map
