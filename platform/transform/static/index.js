import { hasInjectionContext as qr, inject as Nt, effectScope as Yr, ref as U, markRaw as Jr, createApp as Zr, readonly as Qr, getCurrentInstance as Yt, onMounted as Mn, nextTick as Fn, watch as Te, reactive as Xr, renderSlot as M, openBlock as k, createBlock as me, Teleport as Nn, createCommentVNode as W, useId as ei, mergeProps as O, h as ti, createElementBlock as C, createElementVNode as D, resolveComponent as se, Fragment as he, renderList as at, createVNode as le, resolveDirective as ni, createTextVNode as ve, toDisplayString as X, normalizeClass as Pe, resolveDynamicComponent as St, withCtx as Ce, Transition as ri, normalizeProps as ii, createSlots as oi, withDirectives as ot, withModifiers as ai, defineComponent as si, computed as ae, unref as ht, vModelText as mt } from "vue";
import { addCollection as li, Icon as Jt } from "@iconify/vue";
import { config as Zt, addIcons as ui, on as ci, applyThemeMode as et, host as Dn, hostCss as di, loadCss as pi, api as Rn, loadByTagName as fi, define as hi } from "@wippy-fe/proxy";
var xt = "data-wippy-visible";
function Qt(t) {
  const e = t.getAttribute(xt);
  return e === "true" ? !0 : e === "false" ? !1 : null;
}
var mi = Object.defineProperty, vi = (t, e, n) => e in t ? mi(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n, N = (t, e, n) => vi(t, typeof e != "symbol" ? e + "" : e, n), gi = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], yi = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function Xt(t) {
  const e = t.startsWith("--") ? t : `--${t}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(e) ? e : null;
}
function bi(...t) {
  const e = /* @__PURE__ */ new Set();
  for (const n of t)
    if (n)
      for (const [r, i] of Object.entries(n)) {
        if ((r === "@light" || r === "@dark") && i && typeof i == "object") {
          for (const [s, l] of Object.entries(i)) {
            const a = typeof l == "string" ? Xt(s) : null;
            a && e.add(a);
          }
          continue;
        }
        const o = typeof i == "string" ? Xt(r) : null;
        o && e.add(o);
      }
  return [...e].sort();
}
function wi(t) {
  if (t.length === 0)
    return "";
  const e = t.map((n) => `  ${n}: inherit;`).join(`
`);
  return `${yi} {
${e}
}`;
}
function Si(t, e) {
  const n = wi(e);
  n && Bn(t, n, "@wippy-fe/css-variables-bridge");
}
function xi(t, e) {
  const r = (e ?? gi).map(async (i) => {
    const o = di[i];
    if (!o)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${i}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await pi(o);
    } catch (s) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${i}" (${o}):`, s), null;
    }
  });
  return Promise.all(r).then((i) => {
    for (const o of i) {
      if (!o)
        continue;
      const s = document.createElement("style");
      s.textContent = o, s.setAttribute("role", "@wippy-fe/host-css"), t.appendChild(s);
    }
  });
}
function ki(t, e) {
  const n = document.createElement("style");
  n.textContent = e, t.appendChild(n);
}
function Bn(t, e, n) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const i = new CSSStyleSheet();
    i.replaceSync(e), t.adoptedStyleSheets = [...t.adoptedStyleSheets, i];
    return;
  }
  const r = document.createElement("style");
  r.setAttribute("role", n), r.textContent = e, t.appendChild(r);
}
function Oi(t, e) {
  Bn(t, e, "@wippy-fe/custom-css");
}
function Hn(t) {
  return t.__wippyHost ?? null;
}
function $i(t) {
  return t.replace(/-([a-z])/g, (e, n) => n.toUpperCase());
}
function Ci(t, e, n) {
  switch (n.type) {
    case "string":
      return { value: e };
    case "number": {
      const r = Number.parseFloat(e);
      return Number.isNaN(r) ? { value: void 0, error: `Invalid ${t}: expected a number` } : { value: r };
    }
    case "integer": {
      const r = Number.parseInt(e, 10);
      return Number.isNaN(r) ? { value: void 0, error: `Invalid ${t}: expected an integer` } : { value: r };
    }
    case "boolean":
      return { value: e !== "false" };
    case "array":
    case "object":
      try {
        const r = JSON.parse(e);
        return n.type === "array" && !Array.isArray(r) ? { value: void 0, error: `Invalid ${t}: expected a JSON array` } : { value: r };
      } catch {
        return { value: void 0, error: `Invalid ${t}: must be valid JSON` };
      }
    default:
      return { value: e };
  }
}
function vt(t, e) {
  const n = {}, r = [];
  for (const [i, o] of Object.entries(e.properties)) {
    const s = t.getAttribute(i), l = $i(i);
    if (s === null) {
      o.default !== void 0 && (n[l] = o.default);
      continue;
    }
    const a = Ci(i, s, o);
    a.error ? r.push(a.error) : n[l] = a.value;
  }
  return { props: n, errors: r };
}
var _i = class {
  constructor(t, e) {
    N(this, "_props"), N(this, "_errors"), N(this, "_content"), N(this, "_hostVisibility"), N(this, "_propsListeners", /* @__PURE__ */ new Set()), N(this, "_contentListeners", /* @__PURE__ */ new Set()), N(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), N(this, "_disposed", !1), N(this, "_emitToDom"), N(this, "props"), N(this, "events"), N(this, "content"), N(this, "hostVisibility"), this._props = t.props, this._errors = t.errors, this._content = t.content, this._hostVisibility = t.hostVisibility, this._emitToDom = e;
    const n = this;
    this.props = {
      get value() {
        return n._props;
      },
      get errors() {
        return n._errors;
      },
      subscribe(r, i) {
        return n._subscribeProps(r, i);
      }
    }, this.events = {
      emit(r, i) {
        n._disposed || n._emitToDom(r, i);
      }
    }, this.content = t.hasContent ? {
      get value() {
        return n._content;
      },
      subscribe(r, i) {
        return n._subscribeContent(r, i);
      }
    } : null, this.hostVisibility = {
      get value() {
        return n._hostVisibility;
      },
      subscribe(r, i) {
        return n._subscribeHostVisibility(r, i);
      }
    };
  }
  /** @internal */
  notifyProps(t, e) {
    if (!this._disposed) {
      this._props = t, this._errors = e;
      for (const n of this._propsListeners)
        n(t, e);
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
      for (const n of this._hostVisibilityListeners)
        n(t, e);
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
    const n = () => {
      this._propsListeners.delete(t), e?.signal?.removeEventListener("abort", n);
    };
    return e?.signal?.addEventListener("abort", n, { once: !0 }), n;
  }
  _subscribeContent(t, e) {
    if (this._disposed || e?.signal?.aborted)
      return () => {
      };
    this._contentListeners.add(t), e?.immediate && t(this._content);
    const n = () => {
      this._contentListeners.delete(t), e?.signal?.removeEventListener("abort", n);
    };
    return e?.signal?.addEventListener("abort", n, { once: !0 }), n;
  }
  _subscribeHostVisibility(t, e) {
    if (this._disposed || e?.signal?.aborted)
      return () => {
      };
    this._hostVisibilityListeners.add(t), e?.immediate && t(this._hostVisibility, this._hostVisibility);
    const n = () => {
      this._hostVisibilityListeners.delete(t), e?.signal?.removeEventListener("abort", n);
    };
    return e?.signal?.addEventListener("abort", n, { once: !0 }), n;
  }
}, Ii = class extends HTMLElement {
  constructor() {
    super(), N(this, "_internals"), N(this, "_contentObserver", null), N(this, "_initialized", !1), N(this, "_container", null), N(this, "_reactive", null), N(this, "_lastProps", null), N(this, "_lastErrors", []), N(this, "_lastContent", null), N(this, "_themeUnsub", null), N(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = Qt(this);
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
    const t = this.wippyConfig, e = Object.keys(t.propsSchema.properties), n = t.extraObservedAttributes ?? [];
    return [.../* @__PURE__ */ new Set([...e, ...n, xt])];
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
      let n, r;
      if (this._lastProps !== null)
        n = this._lastProps, r = this._lastErrors;
      else {
        const o = vt(this, t.propsSchema);
        t.validateProps && o.errors.push(...t.validateProps(o.props)), n = o.props, r = o.errors, this._lastProps = n, this._lastErrors = r;
      }
      const i = e ? this._lastContent ?? this._extractContent(t.contentTemplate) : null;
      e && this._lastContent === null && (this._lastContent = i), this._reactive = new _i(
        { props: n, errors: r, content: i, hasContent: e, hostVisibility: this._hostVisible },
        this.emitEvent.bind(this)
      );
    }
    return this._reactive;
  }
  // ── Lifecycle ──────────────────────────────────────────────
  connectedCallback() {
    this._internals.states.add("loading");
    try {
      const t = this.constructor.wippyConfig, e = this._initialized, n = this.shadowRoot ?? this.attachShadow({ mode: t.shadowMode ?? "open" });
      let r;
      if (e)
        r = this._container;
      else {
        this.onInit(n), t.inlineCss && ki(n, t.inlineCss);
        try {
          const u = Zt?.theming, c = bi(
            u?.global?.cssVariables,
            u?.children?.cssVariables
          );
          Si(n, c);
        } catch {
        }
        if (t.customCss !== !1)
          try {
            const u = Zt?.theming, c = [u?.global?.customCSS, u?.children?.customCSS].filter(Boolean).join(`
`);
            c && Oi(n, c);
          } catch {
          }
        (t.hostCssKeys === void 0 || t.hostCssKeys.length > 0) && xi(n, t.hostCssKeys), r = document.createElement("div"), r.setAttribute("data-wippy-theme-root", "");
        const a = t.containerClasses ?? [];
        a.length > 0 && r.classList.add(...a), n.appendChild(r), this._container = r, ui(li);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = ci("@theme", (a) => this._applyTheme(a)));
      const { props: i, errors: o } = vt(this, t.propsSchema);
      t.validateProps && o.push(...t.validateProps(i));
      const s = i;
      this._lastProps = s, this._lastErrors = o;
      let l = null;
      t.contentTemplate && (l = this._extractContent(t.contentTemplate), this._lastContent = l, this._contentObserver = new MutationObserver(() => {
        const a = this._extractContent(t.contentTemplate);
        this._lastContent = a, this._reactive?.notifyContent(a), this.onContentChanged(a);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(n, r, s, o, l, e), this._internals.states.delete("loading"), this._internals.states.add("ready"), e || (this._initialized = !0), this.onReady(), this.emitEvent("load");
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
  _applyTheme(t = Dn.getThemeMode?.()) {
    et(t, this), this._container && et(t, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), et("auto", this), this._container && et("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(t, e, n) {
    if (e === n)
      return;
    if (t === xt) {
      const l = this._hostVisible, a = Qt(this);
      if (a === l)
        return;
      this._hostVisible = a, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(a, l), this.onHostVisibilityChanged(a, l));
      return;
    }
    const r = this.constructor.wippyConfig, { props: i, errors: o } = vt(this, r.propsSchema);
    r.validateProps && o.push(...r.validateProps(i));
    const s = i;
    this._lastProps = s, this._lastErrors = o, this._reactive?.notifyProps(s, o), this.onPropsChanged(s, o);
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
function Ti(t) {
  return t.__wippyHostBus ?? null;
}
function Pi(t) {
  return t.dataset.wippyPanelId ?? null;
}
/*!
 * pinia v4.0.3
 * (c) 2026 Eduardo San Martin Morote
 * @license MIT
 */
let Kn;
const Un = (t) => Kn = t, Li = () => qr() && Nt(Wn) || Kn, Wn = (
  /* istanbul ignore next */
  Symbol()
);
function Ai() {
  const t = Yr(!0), e = t.run(() => U({}));
  let n = [], r = [];
  const i = Jr({
    install(o) {
      Un(i), i._a = o, o.provide(Wn, i), o.config.globalProperties.$pinia = i, r.forEach((s) => n.push(s)), r = [];
    },
    use(o) {
      return this._a ? n.push(o) : r.push(o), this;
    },
    _p: n,
    _a: null,
    _e: t,
    _s: /* @__PURE__ */ new Map(),
    state: e
  });
  return i;
}
var Ei = Object.defineProperty, Vi = (t, e, n) => e in t ? Ei(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n, _e = (t, e, n) => Vi(t, typeof e != "symbol" ? e + "" : e, n), Gn = /* @__PURE__ */ Symbol("wippy:emit"), qn = /* @__PURE__ */ Symbol("wippy:props"), ji = /* @__PURE__ */ Symbol("wippy:props_error"), zi = /* @__PURE__ */ Symbol("wippy:content"), Mi = /* @__PURE__ */ Symbol("wippy:panel-id"), Fi = /* @__PURE__ */ Symbol("wippy:layout-bus"), Ni = /* @__PURE__ */ Symbol("wippy:host"), Di = /* @__PURE__ */ Symbol("wippy:host-visibility");
function Ri() {
  const t = Nt(qn);
  if (!t)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return t;
}
function Bi() {
  const t = Nt(Gn);
  if (!t)
    throw new Error("useEvents() must be called inside a WippyVueElement");
  return t;
}
var Hi = class extends Ii {
  constructor() {
    super(...arguments), _e(this, "_vueApp", null), _e(this, "_propsRef", U({})), _e(this, "_errorsRef", U([])), _e(this, "_contentRef", U(null)), _e(this, "_hostVisibilityRef", U(null)), _e(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  onMount(t, e, n, r, i, o) {
    const s = this.constructor.vueConfig;
    this._propsRef.value = n, this._errorsRef.value = r, this._contentRef.value = i ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const u of r)
      this.emitEvent("invalid", { message: u });
    const l = new AbortController();
    this._bridgeAbort = l, this.reactive.props.subscribe((u, c) => {
      this._propsRef.value = u, this._errorsRef.value = [...c];
      for (const d of c)
        this.emitEvent("invalid", { message: d });
    }, { signal: l.signal }), this.reactive.content && this.reactive.content.subscribe((u) => {
      this._contentRef.value = u;
    }, { signal: l.signal }), this.reactive.hostVisibility.subscribe((u) => {
      this._hostVisibilityRef.value = u;
    }, { signal: l.signal });
    const a = (u) => {
      if (l.signal.aborted)
        return;
      const c = Li(), d = Zr(u.rootComponent);
      this._vueApp = d;
      const p = Ai();
      if (u.piniaPlugins)
        for (const f of u.piniaPlugins)
          p.use(f);
      if (d.use(p), u.plugins)
        for (const f of u.plugins)
          d.use(f);
      d.provide(qn, this._propsRef), d.provide(ji, this._errorsRef), d.provide(Gn, this.emitEvent.bind(this)), d.provide(zi, this._contentRef), d.provide(Di, this._hostVisibilityRef), d.provide(Mi, Pi(this)), d.provide(Fi, Ti(this)), d.provide(Ni, Hn(this)), u.providers && u.providers(d, this), d.mount(e), c && Un(c);
    };
    if (s.rootComponent)
      a(s);
    else if (s.lazyConfig) {
      const u = document.createElement("wippy-loading");
      u.setAttribute("no-bg", ""), e.appendChild(u), s.lazyConfig().then((c) => {
        l.signal.aborted || (u.remove(), a(c));
      }).catch((c) => {
        if (l.signal.aborted)
          return;
        const d = c instanceof Error ? c.message : String(c), p = document.createElement("wippy-error");
        p.setAttribute("title", "Failed to load"), p.setAttribute("message", d), u.replaceWith(p), this.emitEvent("error", { message: d });
      });
    } else
      throw new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._vueApp && (this._vueApp.unmount(), this._vueApp = null);
  }
}, Ki = Object.defineProperty, en = Object.getOwnPropertySymbols, Ui = Object.prototype.hasOwnProperty, Wi = Object.prototype.propertyIsEnumerable, tn = (t, e, n) => e in t ? Ki(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n, Gi = (t, e) => {
  for (var n in e || (e = {})) Ui.call(e, n) && tn(t, n, e[n]);
  if (en) for (var n of en(e)) Wi.call(e, n) && tn(t, n, e[n]);
  return t;
};
function Ze(t) {
  return t == null || t === "" || Array.isArray(t) && t.length === 0 || !(t instanceof Date) && typeof t == "object" && Object.keys(t).length === 0;
}
function kt(t, e, n = /* @__PURE__ */ new WeakSet()) {
  if (t === e) return !0;
  if (!t || !e || typeof t != "object" || typeof e != "object" || n.has(t) || n.has(e)) return !1;
  n.add(t).add(e);
  let r = Array.isArray(t), i = Array.isArray(e), o, s, l;
  if (r && i) {
    if (s = t.length, s != e.length) return !1;
    for (o = s; o-- !== 0; ) if (!kt(t[o], e[o], n)) return !1;
    return !0;
  }
  if (r != i) return !1;
  let a = t instanceof Date, u = e instanceof Date;
  if (a != u) return !1;
  if (a && u) return t.getTime() == e.getTime();
  let c = t instanceof RegExp, d = e instanceof RegExp;
  if (c != d) return !1;
  if (c && d) return t.toString() == e.toString();
  let p = Object.keys(t);
  if (s = p.length, s !== Object.keys(e).length) return !1;
  for (o = s; o-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(e, p[o])) return !1;
  for (o = s; o-- !== 0; ) if (l = p[o], !kt(t[l], e[l], n)) return !1;
  return !0;
}
function qi(t, e) {
  return kt(t, e);
}
function pt(t) {
  return typeof t == "function" && "call" in t && "apply" in t;
}
function E(t) {
  return !Ze(t);
}
function fe(t, e) {
  if (!t || !e) return null;
  try {
    let n = t[e];
    if (E(n)) return n;
  } catch {
  }
  if (Object.keys(t).length) {
    if (pt(e)) return e(t);
    if (e.indexOf(".") === -1) return t[e];
    {
      let n = e.split("."), r = t;
      for (let i = 0, o = n.length; i < o; ++i) {
        if (r == null) return null;
        r = r[n[i]];
      }
      return r;
    }
  }
  return null;
}
function Yn(t, e, n) {
  return n ? fe(t, n) === fe(e, n) : qi(t, e);
}
function ce(t, e = !0) {
  return t instanceof Object && t.constructor === Object && (e || Object.keys(t).length !== 0);
}
function Jn(t = {}, e = {}) {
  let n = Gi({}, t);
  return Object.keys(e).forEach((r) => {
    let i = r;
    ce(e[i]) && i in t && ce(t[i]) ? n[i] = Jn(t[i], e[i]) : n[i] = e[i];
  }), n;
}
function Yi(...t) {
  return t.reduce((e, n, r) => r === 0 ? n : Jn(e, n), {});
}
function nn(t, e) {
  let n = -1;
  if (E(t)) try {
    n = t.findLastIndex(e);
  } catch {
    n = t.lastIndexOf([...t].reverse().find(e));
  }
  return n;
}
function te(t, ...e) {
  return pt(t) ? t(...e) : t;
}
function ee(t, e = !0) {
  return typeof t == "string" && (e || t !== "");
}
function ue(t) {
  return ee(t) ? t.replace(/(-|_)/g, "").toLowerCase() : t;
}
function Dt(t, e = "", n = {}) {
  let r = ue(e).split("."), i = r.shift();
  if (i) {
    if (ce(t)) {
      let o = Object.keys(t).find((s) => ue(s) === i) || "";
      return Dt(te(t[o], n), r.join("."), n);
    }
    return;
  }
  return te(t, n);
}
function Zn(t, e = !0) {
  return Array.isArray(t) && (e || t.length !== 0);
}
function Ji(t) {
  return E(t) && !isNaN(t);
}
function Zi(t = "") {
  return E(t) && t.length === 1 && !!t.match(/\S| /);
}
function ke(t, e) {
  if (e) {
    let n = e.test(t);
    return e.lastIndex = 0, n;
  }
  return !1;
}
function Qi(...t) {
  return Yi(...t);
}
function Fe(t) {
  return t && t.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function ne(t) {
  if (t && /[\xC0-\xFF\u0100-\u017E]/.test(t)) {
    let e = { A: /[\xC0-\xC5\u0100\u0102\u0104]/g, AE: /[\xC6]/g, C: /[\xC7\u0106\u0108\u010A\u010C]/g, D: /[\xD0\u010E\u0110]/g, E: /[\xC8-\xCB\u0112\u0114\u0116\u0118\u011A]/g, G: /[\u011C\u011E\u0120\u0122]/g, H: /[\u0124\u0126]/g, I: /[\xCC-\xCF\u0128\u012A\u012C\u012E\u0130]/g, IJ: /[\u0132]/g, J: /[\u0134]/g, K: /[\u0136]/g, L: /[\u0139\u013B\u013D\u013F\u0141]/g, N: /[\xD1\u0143\u0145\u0147\u014A]/g, O: /[\xD2-\xD6\xD8\u014C\u014E\u0150]/g, OE: /[\u0152]/g, R: /[\u0154\u0156\u0158]/g, S: /[\u015A\u015C\u015E\u0160]/g, T: /[\u0162\u0164\u0166]/g, U: /[\xD9-\xDC\u0168\u016A\u016C\u016E\u0170\u0172]/g, W: /[\u0174]/g, Y: /[\xDD\u0176\u0178]/g, Z: /[\u0179\u017B\u017D]/g, a: /[\xE0-\xE5\u0101\u0103\u0105]/g, ae: /[\xE6]/g, c: /[\xE7\u0107\u0109\u010B\u010D]/g, d: /[\u010F\u0111]/g, e: /[\xE8-\xEB\u0113\u0115\u0117\u0119\u011B]/g, g: /[\u011D\u011F\u0121\u0123]/g, i: /[\xEC-\xEF\u0129\u012B\u012D\u012F\u0131]/g, ij: /[\u0133]/g, j: /[\u0135]/g, k: /[\u0137,\u0138]/g, l: /[\u013A\u013C\u013E\u0140\u0142]/g, n: /[\xF1\u0144\u0146\u0148\u014B]/g, p: /[\xFE]/g, o: /[\xF2-\xF6\xF8\u014D\u014F\u0151]/g, oe: /[\u0153]/g, r: /[\u0155\u0157\u0159]/g, s: /[\u015B\u015D\u015F\u0161]/g, t: /[\u0163\u0165\u0167]/g, u: /[\xF9-\xFC\u0169\u016B\u016D\u016F\u0171\u0173]/g, w: /[\u0175]/g, y: /[\xFD\xFF\u0177]/g, z: /[\u017A\u017C\u017E]/g };
    for (let n in e) t = t.replace(e[n], n);
  }
  return t;
}
function Xi(t) {
  return ee(t, !1) ? t[0].toUpperCase() + t.slice(1) : t;
}
function Qn(t) {
  return ee(t) ? t.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : t;
}
function Rt() {
  let t = /* @__PURE__ */ new Map();
  return { on(e, n) {
    let r = t.get(e);
    return r ? r.push(n) : r = [n], t.set(e, r), this;
  }, off(e, n) {
    let r = t.get(e);
    return r && r.splice(r.indexOf(n) >>> 0, 1), this;
  }, emit(e, n) {
    let r = t.get(e);
    r && r.forEach((i) => {
      i(n);
    });
  }, clear() {
    t.clear();
  } };
}
function Le(...t) {
  if (t) {
    let e = [];
    for (let n = 0; n < t.length; n++) {
      let r = t[n];
      if (!r) continue;
      let i = typeof r;
      if (i === "string" || i === "number") e.push(r);
      else if (i === "object") {
        let o = Array.isArray(r) ? [Le(...r)] : Object.entries(r).map(([s, l]) => l ? s : void 0);
        e = o.length ? e.concat(o.filter((s) => !!s)) : e;
      }
    }
    return e.join(" ").trim();
  }
}
function eo(t, e) {
  return t ? t.classList ? t.classList.contains(e) : new RegExp("(^| )" + e + "( |$)", "gi").test(t.className) : !1;
}
function to(t, e) {
  if (t && e) {
    let n = (r) => {
      eo(t, r) || (t.classList ? t.classList.add(r) : t.className += " " + r);
    };
    [e].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function gt(t, e) {
  if (t && e) {
    let n = (r) => {
      t.classList ? t.classList.remove(r) : t.className = t.className.replace(new RegExp("(^|\\b)" + r.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [e].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function Ot(t) {
  for (let e of document?.styleSheets) try {
    for (let n of e?.cssRules) for (let r of n?.style) if (t.test(r)) return { name: r, value: n.style.getPropertyValue(r).trim() };
  } catch {
  }
  return null;
}
function Xn(t) {
  let e = { width: 0, height: 0 };
  if (t) {
    let [n, r] = [t.style.visibility, t.style.display], i = t.getBoundingClientRect();
    t.style.visibility = "hidden", t.style.display = "block", e.width = i.width || t.offsetWidth, e.height = i.height || t.offsetHeight, t.style.display = r, t.style.visibility = n;
  }
  return e;
}
function er() {
  let t = window, e = document, n = e.documentElement, r = e.getElementsByTagName("body")[0], i = t.innerWidth || n.clientWidth || r.clientWidth, o = t.innerHeight || n.clientHeight || r.clientHeight;
  return { width: i, height: o };
}
function $t(t) {
  return t ? Math.abs(t.scrollLeft) : 0;
}
function no() {
  let t = document.documentElement;
  return (window.pageXOffset || $t(t)) - (t.clientLeft || 0);
}
function ro() {
  let t = document.documentElement;
  return (window.pageYOffset || t.scrollTop) - (t.clientTop || 0);
}
function io(t) {
  return t ? getComputedStyle(t).direction === "rtl" : !1;
}
function oo(t, e, n = !0) {
  var r, i, o, s;
  if (t) {
    let l = t.offsetParent ? { width: t.offsetWidth, height: t.offsetHeight } : Xn(t), a = l.height, u = l.width, c = e.offsetHeight, d = e.offsetWidth, p = e.getBoundingClientRect(), f = ro(), h = no(), g = er(), v, y, b = "top";
    p.top + c + a > g.height ? (v = p.top + f - a, b = "bottom", v < 0 && (v = f)) : v = c + p.top + f, p.left + u > g.width ? y = Math.max(0, p.left + h + d - u) : y = p.left + h, io(t) ? t.style.insetInlineEnd = y + "px" : t.style.insetInlineStart = y + "px", t.style.top = v + "px", t.style.transformOrigin = b, n && (t.style.marginTop = b === "bottom" ? `calc(${(i = (r = Ot(/-anchor-gutter$/)) == null ? void 0 : r.value) != null ? i : "2px"} * -1)` : (s = (o = Ot(/-anchor-gutter$/)) == null ? void 0 : o.value) != null ? s : "");
  }
}
function ao(t, e) {
  t && (typeof e == "string" ? t.style.cssText = e : Object.entries(e || {}).forEach(([n, r]) => t.style[n] = r));
}
function tr(t, e) {
  return t instanceof HTMLElement ? t.offsetWidth : 0;
}
function so(t, e, n = !0, r = void 0) {
  var i;
  if (t) {
    let o = t.offsetParent ? { width: t.offsetWidth, height: t.offsetHeight } : Xn(t), s = e.offsetHeight, l = e.getBoundingClientRect(), a = er(), u, c, d = r ?? "top";
    if (!r && l.top + s + o.height > a.height ? (u = -1 * o.height, d = "bottom", l.top + u < 0 && (u = -1 * l.top)) : u = s, o.width > a.width ? c = l.left * -1 : l.left + o.width > a.width ? c = (l.left + o.width - a.width) * -1 : c = 0, t.style.top = u + "px", t.style.insetInlineStart = c + "px", t.style.transformOrigin = d, n) {
      let p = (i = Ot(/-anchor-gutter$/)) == null ? void 0 : i.value;
      t.style.marginTop = d === "bottom" ? `calc(${p ?? "2px"} * -1)` : p ?? "";
    }
  }
}
function nr(t) {
  if (t) {
    let e = t.parentNode;
    return e && e instanceof ShadowRoot && e.host && (e = e.host), e;
  }
  return null;
}
function lo(t) {
  return !!(t !== null && typeof t < "u" && t.nodeName && nr(t));
}
function Ee(t) {
  return typeof Element < "u" ? t instanceof Element : t !== null && typeof t == "object" && t.nodeType === 1 && typeof t.nodeName == "string";
}
function st(t, e = {}) {
  if (Ee(t)) {
    let n = (r, i) => {
      var o, s;
      let l = (o = t?.$attrs) != null && o[r] ? [(s = t?.$attrs) == null ? void 0 : s[r]] : [];
      return [i].flat().reduce((a, u) => {
        if (u != null) {
          let c = typeof u;
          if (c === "string" || c === "number") a.push(u);
          else if (c === "object") {
            let d = Array.isArray(u) ? n(r, u) : Object.entries(u).map(([p, f]) => r === "style" && (f || f === 0) ? `${p.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}:${f}` : f ? p : void 0);
            a = d.length ? a.concat(d.filter((p) => !!p)) : a;
          }
        }
        return a;
      }, l);
    };
    Object.entries(e).forEach(([r, i]) => {
      if (i != null) {
        let o = r.match(/^on(.+)/);
        o ? t.addEventListener(o[1].toLowerCase(), i) : r === "p-bind" || r === "pBind" ? st(t, i) : (i = r === "class" ? [...new Set(n("class", i))].join(" ").trim() : r === "style" ? n("style", i).join(";").trim() : i, (t.$attrs = t.$attrs || {}) && (t.$attrs[r] = i), t.setAttribute(r, i));
      }
    });
  }
}
function uo(t, e = {}, ...n) {
  {
    let r = document.createElement(t);
    return st(r, e), r.append(...n), r;
  }
}
function co(t, e) {
  return Ee(t) ? Array.from(t.querySelectorAll(e)) : [];
}
function ft(t, e) {
  return Ee(t) ? t.matches(e) ? t : t.querySelector(e) : null;
}
function de(t, e) {
  t && document.activeElement !== t && t.focus(e);
}
function po(t, e) {
  if (Ee(t)) {
    let n = t.getAttribute(e);
    return isNaN(n) ? n === "true" || n === "false" ? n === "true" : n : +n;
  }
}
function Bt(t, e = "") {
  let n = co(t, `button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            [href]:not([tabindex = "-1"]):not([style*="display:none"]):not([hidden])${e},
            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e}`), r = [];
  for (let i of n) getComputedStyle(i).display != "none" && getComputedStyle(i).visibility != "hidden" && r.push(i);
  return r;
}
function fo(t, e) {
  let n = Bt(t, e);
  return n.length > 0 ? n[0] : null;
}
function Se(t) {
  if (t) {
    let e = t.offsetHeight, n = getComputedStyle(t);
    return e -= parseFloat(n.paddingTop) + parseFloat(n.paddingBottom) + parseFloat(n.borderTopWidth) + parseFloat(n.borderBottomWidth), e;
  }
  return 0;
}
function ho(t, e) {
  let n = Bt(t, e);
  return n.length > 0 ? n[n.length - 1] : null;
}
function mo(t) {
  if (t) {
    let e = t.getBoundingClientRect();
    return { top: e.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: e.left + (window.pageXOffset || $t(document.documentElement) || $t(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function vo(t, e) {
  return t ? t.offsetHeight : 0;
}
function rr(t, e = []) {
  let n = nr(t);
  return n === null ? e : rr(n, e.concat([n]));
}
function go(t) {
  let e = [];
  if (t) {
    let n = rr(t), r = /(auto|scroll)/, i = (o) => {
      try {
        let s = window.getComputedStyle(o, null);
        return r.test(s.getPropertyValue("overflow")) || r.test(s.getPropertyValue("overflowX")) || r.test(s.getPropertyValue("overflowY"));
      } catch {
        return !1;
      }
    };
    for (let o of n) {
      let s = o.nodeType === 1 && o.dataset.scrollselectors;
      if (s) {
        let l = s.split(",");
        for (let a of l) {
          let u = ft(o, a);
          u && i(u) && e.push(u);
        }
      }
      o.nodeType !== 9 && i(o) && e.push(o);
    }
  }
  return e;
}
function xe(t) {
  if (t) {
    let e = t.offsetWidth, n = getComputedStyle(t);
    return e -= parseFloat(n.paddingLeft) + parseFloat(n.paddingRight) + parseFloat(n.borderLeftWidth) + parseFloat(n.borderRightWidth), e;
  }
  return 0;
}
function yo() {
  return /(android)/i.test(navigator.userAgent);
}
function ir() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function lt(t) {
  return !!(t && t.offsetParent != null);
}
function bo() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}
function wo(t, e = "", n) {
  Ee(t) && n !== null && n !== void 0 && t.setAttribute(e, n);
}
var tt = {};
function So(t = "pui_id_") {
  return Object.hasOwn(tt, t) || (tt[t] = 0), tt[t]++, `${t}${tt[t]}`;
}
function xo() {
  let t = [], e = (s, l, a = 999) => {
    let u = i(s, l, a), c = u.value + (u.key === s ? 0 : a) + 1;
    return t.push({ key: s, value: c }), c;
  }, n = (s) => {
    t = t.filter((l) => l.value !== s);
  }, r = (s, l) => i(s).value, i = (s, l, a = 0) => [...t].reverse().find((u) => !0) || { key: s, value: a }, o = (s) => s && parseInt(s.style.zIndex, 10) || 0;
  return { get: o, set: (s, l, a) => {
    l && (l.style.zIndex = String(e(s, !0, a)));
  }, clear: (s) => {
    s && (n(o(s)), s.style.zIndex = "");
  }, getCurrent: (s) => r(s) };
}
var yt = xo(), ko = Object.defineProperty, Oo = Object.defineProperties, $o = Object.getOwnPropertyDescriptors, ut = Object.getOwnPropertySymbols, or = Object.prototype.hasOwnProperty, ar = Object.prototype.propertyIsEnumerable, rn = (t, e, n) => e in t ? ko(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n, ie = (t, e) => {
  for (var n in e || (e = {})) or.call(e, n) && rn(t, n, e[n]);
  if (ut) for (var n of ut(e)) ar.call(e, n) && rn(t, n, e[n]);
  return t;
}, bt = (t, e) => Oo(t, $o(e)), pe = (t, e) => {
  var n = {};
  for (var r in t) or.call(t, r) && e.indexOf(r) < 0 && (n[r] = t[r]);
  if (t != null && ut) for (var r of ut(t)) e.indexOf(r) < 0 && ar.call(t, r) && (n[r] = t[r]);
  return n;
}, Co = Rt(), q = Co, Ne = /{([^}]*)}/g, sr = /(\d+\s+[\+\-\*\/]\s+\d+)/g, lr = /var\([^)]+\)/g;
function on(t) {
  return ee(t) ? t.replace(/[A-Z]/g, (e, n) => n === 0 ? e : "." + e.toLowerCase()).toLowerCase() : t;
}
function _o(t) {
  return ce(t) && t.hasOwnProperty("$value") && t.hasOwnProperty("$type") ? t.$value : t;
}
function Io(t) {
  return t.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function Ct(t = "", e = "") {
  return Io(`${ee(t, !1) && ee(e, !1) ? `${t}-` : t}${e}`);
}
function ur(t = "", e = "") {
  return `--${Ct(t, e)}`;
}
function To(t = "") {
  let e = (t.match(/{/g) || []).length, n = (t.match(/}/g) || []).length;
  return (e + n) % 2 !== 0;
}
function cr(t, e = "", n = "", r = [], i) {
  if (ee(t)) {
    let o = t.trim();
    if (To(o)) return;
    if (ke(o, Ne)) {
      let s = o.replaceAll(Ne, (l) => {
        let a = l.replace(/{|}/g, "").split(".").filter((u) => !r.some((c) => ke(u, c)));
        return `var(${ur(n, Qn(a.join("-")))}${E(i) ? `, ${i}` : ""})`;
      });
      return ke(s.replace(lr, "0"), sr) ? `calc(${s})` : s;
    }
    return o;
  } else if (Ji(t)) return t;
}
function Po(t, e, n) {
  ee(e, !1) && t.push(`${e}:${n};`);
}
function Ie(t, e) {
  return t ? `${t}{${e}}` : "";
}
function dr(t, e) {
  if (t.indexOf("dt(") === -1) return t;
  function n(s, l) {
    let a = [], u = 0, c = "", d = null, p = 0;
    for (; u <= s.length; ) {
      let f = s[u];
      if ((f === '"' || f === "'" || f === "`") && s[u - 1] !== "\\" && (d = d === f ? null : f), !d && (f === "(" && p++, f === ")" && p--, (f === "," || u === s.length) && p === 0)) {
        let h = c.trim();
        h.startsWith("dt(") ? a.push(dr(h, l)) : a.push(r(h)), c = "", u++;
        continue;
      }
      f !== void 0 && (c += f), u++;
    }
    return a;
  }
  function r(s) {
    let l = s[0];
    if ((l === '"' || l === "'" || l === "`") && s[s.length - 1] === l) return s.slice(1, -1);
    let a = Number(s);
    return isNaN(a) ? s : a;
  }
  let i = [], o = [];
  for (let s = 0; s < t.length; s++) if (t[s] === "d" && t.slice(s, s + 3) === "dt(") o.push(s), s += 2;
  else if (t[s] === ")" && o.length > 0) {
    let l = o.pop();
    o.length === 0 && i.push([l, s]);
  }
  if (!i.length) return t;
  for (let s = i.length - 1; s >= 0; s--) {
    let [l, a] = i[s], u = t.slice(l + 3, a), c = n(u, e), d = e(...c);
    t = t.slice(0, l) + d + t.slice(a + 1);
  }
  return t;
}
var Oe = (...t) => Lo(j.getTheme(), ...t), Lo = (t = {}, e, n, r) => {
  if (e) {
    let { variable: i, options: o } = j.defaults || {}, { prefix: s, transform: l } = t?.options || o || {}, a = ke(e, Ne) ? e : `{${e}}`;
    return r === "value" || Ze(r) && l === "strict" ? j.getTokenValue(e) : cr(a, void 0, s, [i.excludedKeyRegex], n);
  }
  return "";
};
function nt(t, ...e) {
  if (t instanceof Array) {
    let n = t.reduce((r, i, o) => {
      var s;
      return r + i + ((s = te(e[o], { dt: Oe })) != null ? s : "");
    }, "");
    return dr(n, Oe);
  }
  return te(t, { dt: Oe });
}
function Ao(t, e = {}) {
  let n = j.defaults.variable, { prefix: r = n.prefix, selector: i = n.selector, excludedKeyRegex: o = n.excludedKeyRegex } = e, s = [], l = [], a = [{ node: t, path: r }];
  for (; a.length; ) {
    let { node: c, path: d } = a.pop();
    for (let p in c) {
      let f = c[p], h = _o(f), g = ke(p, o) ? Ct(d) : Ct(d, Qn(p));
      if (ce(h)) a.push({ node: h, path: g });
      else {
        let v = ur(g), y = cr(h, g, r, [o]);
        Po(l, v, y);
        let b = g;
        r && b.startsWith(r + "-") && (b = b.slice(r.length + 1)), s.push(b.replace(/-/g, "."));
      }
    }
  }
  let u = l.join("");
  return { value: l, tokens: s, declarations: u, css: Ie(i, u) };
}
var re = { regex: { rules: { class: { pattern: /^\.([a-zA-Z][\w-]*)$/, resolve(t) {
  return { type: "class", selector: t, matched: this.pattern.test(t.trim()) };
} }, attr: { pattern: /^\[(.*)\]$/, resolve(t) {
  return { type: "attr", selector: `:root${t},:host${t}`, matched: this.pattern.test(t.trim()) };
} }, media: { pattern: /^@media (.*)$/, resolve(t) {
  return { type: "media", selector: t, matched: this.pattern.test(t.trim()) };
} }, system: { pattern: /^system$/, resolve(t) {
  return { type: "system", selector: "@media (prefers-color-scheme: dark)", matched: this.pattern.test(t.trim()) };
} }, custom: { resolve(t) {
  return { type: "custom", selector: t, matched: !0 };
} } }, resolve(t) {
  let e = Object.keys(this.rules).filter((n) => n !== "custom").map((n) => this.rules[n]);
  return [t].flat().map((n) => {
    var r;
    return (r = e.map((i) => i.resolve(n)).find((i) => i.matched)) != null ? r : this.rules.custom.resolve(n);
  });
} }, _toVariables(t, e) {
  return Ao(t, { prefix: e?.prefix });
}, getCommon({ name: t = "", theme: e = {}, params: n, set: r, defaults: i }) {
  var o, s, l, a, u, c, d;
  let { preset: p, options: f } = e, h, g, v, y, b, _, m;
  if (E(p) && f.transform !== "strict") {
    let { primitive: x, semantic: P, extend: S } = p, L = P || {}, { colorScheme: R } = L, B = pe(L, ["colorScheme"]), V = S || {}, { colorScheme: F } = V, J = pe(V, ["colorScheme"]), Z = R || {}, { dark: K } = Z, G = pe(Z, ["dark"]), w = F || {}, { dark: $ } = w, H = pe(w, ["dark"]), Q = E(x) ? this._toVariables({ primitive: x }, f) : {}, oe = E(B) ? this._toVariables({ semantic: B }, f) : {}, be = E(G) ? this._toVariables({ light: G }, f) : {}, Xe = E(K) ? this._toVariables({ dark: K }, f) : {}, $e = E(J) ? this._toVariables({ semantic: J }, f) : {}, Gt = E(H) ? this._toVariables({ light: H }, f) : {}, qt = E($) ? this._toVariables({ dark: $ }, f) : {}, [Pr, Lr] = [(o = Q.declarations) != null ? o : "", Q.tokens], [Ar, Er] = [(s = oe.declarations) != null ? s : "", oe.tokens || []], [Vr, jr] = [(l = be.declarations) != null ? l : "", be.tokens || []], [zr, Mr] = [(a = Xe.declarations) != null ? a : "", Xe.tokens || []], [Fr, Nr] = [(u = $e.declarations) != null ? u : "", $e.tokens || []], [Dr, Rr] = [(c = Gt.declarations) != null ? c : "", Gt.tokens || []], [Br, Hr] = [(d = qt.declarations) != null ? d : "", qt.tokens || []];
    h = this.transformCSS(t, Pr, "light", "variable", f, r, i), g = Lr;
    let Kr = this.transformCSS(t, `${Ar}${Vr}`, "light", "variable", f, r, i), Ur = this.transformCSS(t, `${zr}`, "dark", "variable", f, r, i);
    v = `${Kr}${Ur}`, y = [.../* @__PURE__ */ new Set([...Er, ...jr, ...Mr])];
    let Wr = this.transformCSS(t, `${Fr}${Dr}color-scheme:light`, "light", "variable", f, r, i), Gr = this.transformCSS(t, `${Br}color-scheme:dark`, "dark", "variable", f, r, i);
    b = `${Wr}${Gr}`, _ = [.../* @__PURE__ */ new Set([...Nr, ...Rr, ...Hr])], m = te(p.css, { dt: Oe });
  }
  return { primitive: { css: h, tokens: g }, semantic: { css: v, tokens: y }, global: { css: b, tokens: _ }, style: m };
}, getPreset({ name: t = "", preset: e = {}, options: n, params: r, set: i, defaults: o, selector: s }) {
  var l, a, u;
  let c, d, p;
  if (E(e) && n.transform !== "strict") {
    let f = t.replace("-directive", ""), h = e, { colorScheme: g, extend: v, css: y } = h, b = pe(h, ["colorScheme", "extend", "css"]), _ = v || {}, { colorScheme: m } = _, x = pe(_, ["colorScheme"]), P = g || {}, { dark: S } = P, L = pe(P, ["dark"]), R = m || {}, { dark: B } = R, V = pe(R, ["dark"]), F = E(b) ? this._toVariables({ [f]: ie(ie({}, b), x) }, n) : {}, J = E(L) ? this._toVariables({ [f]: ie(ie({}, L), V) }, n) : {}, Z = E(S) ? this._toVariables({ [f]: ie(ie({}, S), B) }, n) : {}, [K, G] = [(l = F.declarations) != null ? l : "", F.tokens || []], [w, $] = [(a = J.declarations) != null ? a : "", J.tokens || []], [H, Q] = [(u = Z.declarations) != null ? u : "", Z.tokens || []], oe = this.transformCSS(f, `${K}${w}`, "light", "variable", n, i, o, s), be = this.transformCSS(f, H, "dark", "variable", n, i, o, s);
    c = `${oe}${be}`, d = [.../* @__PURE__ */ new Set([...G, ...$, ...Q])], p = te(y, { dt: Oe });
  }
  return { css: c, tokens: d, style: p };
}, getPresetC({ name: t = "", theme: e = {}, params: n, set: r, defaults: i }) {
  var o;
  let { preset: s, options: l } = e, a = (o = s?.components) == null ? void 0 : o[t];
  return this.getPreset({ name: t, preset: a, options: l, params: n, set: r, defaults: i });
}, getPresetD({ name: t = "", theme: e = {}, params: n, set: r, defaults: i }) {
  var o, s;
  let l = t.replace("-directive", ""), { preset: a, options: u } = e, c = ((o = a?.components) == null ? void 0 : o[l]) || ((s = a?.directives) == null ? void 0 : s[l]);
  return this.getPreset({ name: l, preset: c, options: u, params: n, set: r, defaults: i });
}, applyDarkColorScheme(t) {
  return !(t.darkModeSelector === "none" || t.darkModeSelector === !1);
}, getColorSchemeOption(t, e) {
  var n;
  return this.applyDarkColorScheme(t) ? this.regex.resolve(t.darkModeSelector === !0 ? e.options.darkModeSelector : (n = t.darkModeSelector) != null ? n : e.options.darkModeSelector) : [];
}, getLayerOrder(t, e = {}, n, r) {
  let { cssLayer: i } = e;
  return i ? `@layer ${te(i.order || i.name || "primeui", n)}` : "";
}, getCommonStyleSheet({ name: t = "", theme: e = {}, params: n, props: r = {}, set: i, defaults: o }) {
  let s = this.getCommon({ name: t, theme: e, params: n, set: i, defaults: o }), l = Object.entries(r).reduce((a, [u, c]) => a.push(`${u}="${c}"`) && a, []).join(" ");
  return Object.entries(s || {}).reduce((a, [u, c]) => {
    if (ce(c) && Object.hasOwn(c, "css")) {
      let d = Fe(c.css), p = `${u}-variables`;
      a.push(`<style type="text/css" data-primevue-style-id="${p}" ${l}>${d}</style>`);
    }
    return a;
  }, []).join("");
}, getStyleSheet({ name: t = "", theme: e = {}, params: n, props: r = {}, set: i, defaults: o }) {
  var s;
  let l = { name: t, theme: e, params: n, set: i, defaults: o }, a = (s = t.includes("-directive") ? this.getPresetD(l) : this.getPresetC(l)) == null ? void 0 : s.css, u = Object.entries(r).reduce((c, [d, p]) => c.push(`${d}="${p}"`) && c, []).join(" ");
  return a ? `<style type="text/css" data-primevue-style-id="${t}-variables" ${u}>${Fe(a)}</style>` : "";
}, createTokens(t = {}, e, n = "", r = "", i = {}) {
  let o = function(l, a = {}, u = []) {
    if (u.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: l, path: this.path, paths: a, value: void 0 };
    u.push(this.path), a.name = this.path, a.binding || (a.binding = {});
    let c = this.value;
    if (typeof this.value == "string" && Ne.test(this.value)) {
      let d = this.value.trim().replace(Ne, (p) => {
        var f;
        let h = p.slice(1, -1), g = this.tokens[h];
        if (!g) return console.warn(`Token not found for path: ${h}`), "__UNRESOLVED__";
        let v = g.computed(l, a, u);
        return Array.isArray(v) && v.length === 2 ? `light-dark(${v[0].value},${v[1].value})` : (f = v?.value) != null ? f : "__UNRESOLVED__";
      });
      c = sr.test(d.replace(lr, "0")) ? `calc(${d})` : d;
    }
    return Ze(a.binding) && delete a.binding, u.pop(), { colorScheme: l, path: this.path, paths: a, value: c.includes("__UNRESOLVED__") ? void 0 : c };
  }, s = (l, a, u) => {
    Object.entries(l).forEach(([c, d]) => {
      let p = ke(c, e.variable.excludedKeyRegex) ? a : a ? `${a}.${on(c)}` : on(c), f = u ? `${u}.${c}` : c;
      ce(d) ? s(d, p, f) : (i[p] || (i[p] = { paths: [], computed: (h, g = {}, v = []) => {
        if (i[p].paths.length === 1) return i[p].paths[0].computed(i[p].paths[0].scheme, g.binding, v);
        if (h && h !== "none") for (let y = 0; y < i[p].paths.length; y++) {
          let b = i[p].paths[y];
          if (b.scheme === h) return b.computed(h, g.binding, v);
        }
        return i[p].paths.map((y) => y.computed(y.scheme, g[y.scheme], v));
      } }), i[p].paths.push({ path: f, value: d, scheme: f.includes("colorScheme.light") ? "light" : f.includes("colorScheme.dark") ? "dark" : "none", computed: o, tokens: i }));
    });
  };
  return s(t, n, r), i;
}, getTokenValue(t, e, n) {
  var r;
  let i = ((l) => l.split(".").filter((a) => !ke(a.toLowerCase(), n.variable.excludedKeyRegex)).join("."))(e), o = e.includes("colorScheme.light") ? "light" : e.includes("colorScheme.dark") ? "dark" : void 0, s = [(r = t[i]) == null ? void 0 : r.computed(o)].flat().filter((l) => l);
  return s.length === 1 ? s[0].value : s.reduce((l = {}, a) => {
    let u = a, { colorScheme: c } = u, d = pe(u, ["colorScheme"]);
    return l[c] = d, l;
  }, void 0);
}, getSelectorRule(t, e, n, r) {
  return n === "class" || n === "attr" ? Ie(E(e) ? `${t}${e},${t} ${e}` : t, r) : Ie(t, Ie(e ?? ":root,:host", r));
}, transformCSS(t, e, n, r, i = {}, o, s, l) {
  if (E(e)) {
    let { cssLayer: a } = i;
    if (r !== "style") {
      let u = this.getColorSchemeOption(i, s);
      e = n === "dark" ? u.reduce((c, { type: d, selector: p }) => (E(p) && (c += p.includes("[CSS]") ? p.replace("[CSS]", e) : this.getSelectorRule(p, l, d, e)), c), "") : Ie(l ?? ":root,:host", e);
    }
    if (a) {
      let u = { name: "primeui" };
      ce(a) && (u.name = te(a.name, { name: t, type: r })), E(u.name) && (e = Ie(`@layer ${u.name}`, e), o?.layerNames(u.name));
    }
    return e;
  }
  return "";
} }, j = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(t = {}) {
  let { theme: e } = t;
  e && (this._theme = bt(ie({}, e), { options: ie(ie({}, this.defaults.options), e.options) }), this._tokens = re.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
}, get theme() {
  return this._theme;
}, get preset() {
  var t;
  return ((t = this.theme) == null ? void 0 : t.preset) || {};
}, get options() {
  var t;
  return ((t = this.theme) == null ? void 0 : t.options) || {};
}, get tokens() {
  return this._tokens;
}, getTheme() {
  return this.theme;
}, setTheme(t) {
  this.update({ theme: t }), q.emit("theme:change", t);
}, getPreset() {
  return this.preset;
}, setPreset(t) {
  this._theme = bt(ie({}, this.theme), { preset: t }), this._tokens = re.createTokens(t, this.defaults), this.clearLoadedStyleNames(), q.emit("preset:change", t), q.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(t) {
  this._theme = bt(ie({}, this.theme), { options: t }), this.clearLoadedStyleNames(), q.emit("options:change", t), q.emit("theme:change", this.theme);
}, getLayerNames() {
  return [...this._layerNames];
}, setLayerNames(t) {
  this._layerNames.add(t);
}, getLoadedStyleNames() {
  return this._loadedStyleNames;
}, isStyleNameLoaded(t) {
  return this._loadedStyleNames.has(t);
}, setLoadedStyleName(t) {
  this._loadedStyleNames.add(t);
}, deleteLoadedStyleName(t) {
  this._loadedStyleNames.delete(t);
}, clearLoadedStyleNames() {
  this._loadedStyleNames.clear();
}, getTokenValue(t) {
  return re.getTokenValue(this.tokens, t, this.defaults);
}, getCommon(t = "", e) {
  return re.getCommon({ name: t, theme: this.theme, params: e, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getComponent(t = "", e) {
  let n = { name: t, theme: this.theme, params: e, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return re.getPresetC(n);
}, getDirective(t = "", e) {
  let n = { name: t, theme: this.theme, params: e, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return re.getPresetD(n);
}, getCustomPreset(t = "", e, n, r) {
  let i = { name: t, preset: e, options: this.options, selector: n, params: r, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return re.getPreset(i);
}, getLayerOrderCSS(t = "") {
  return re.getLayerOrder(t, this.options, { names: this.getLayerNames() }, this.defaults);
}, transformCSS(t = "", e, n = "style", r) {
  return re.transformCSS(t, e, r, n, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
}, getCommonStyleSheet(t = "", e, n = {}) {
  return re.getCommonStyleSheet({ name: t, theme: this.theme, params: e, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getStyleSheet(t, e, n = {}) {
  return re.getStyleSheet({ name: t, theme: this.theme, params: e, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, onStyleMounted(t) {
  this._loadingStyles.add(t);
}, onStyleUpdated(t) {
  this._loadingStyles.add(t);
}, onStyleLoaded(t, { name: e }) {
  this._loadingStyles.size && (this._loadingStyles.delete(e), q.emit(`theme:${e}:load`, t), !this._loadingStyles.size && q.emit("theme:load"));
} }, Y = {
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
function an(t, e) {
  var n = typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (!n) {
    if (Array.isArray(t) || (n = Eo(t)) || e) {
      n && (t = n);
      var r = 0, i = function() {
      };
      return { s: i, n: function() {
        return r >= t.length ? { done: !0 } : { done: !1, value: t[r++] };
      }, e: function(u) {
        throw u;
      }, f: i };
    }
    throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }
  var o, s = !0, l = !1;
  return { s: function() {
    n = n.call(t);
  }, n: function() {
    var u = n.next();
    return s = u.done, u;
  }, e: function(u) {
    l = !0, o = u;
  }, f: function() {
    try {
      s || n.return == null || n.return();
    } finally {
      if (l) throw o;
    }
  } };
}
function Eo(t, e) {
  if (t) {
    if (typeof t == "string") return sn(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? sn(t, e) : void 0;
  }
}
function sn(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
var Vo = {
  filter: function(e, n, r, i, o) {
    var s = [];
    if (!e)
      return s;
    var l = an(e), a;
    try {
      for (l.s(); !(a = l.n()).done; ) {
        var u = a.value;
        if (typeof u == "string") {
          if (this.filters[i](u, r, o)) {
            s.push(u);
            continue;
          }
        } else {
          var c = an(n), d;
          try {
            for (c.s(); !(d = c.n()).done; ) {
              var p = d.value, f = fe(u, p);
              if (this.filters[i](f, r, o)) {
                s.push(u);
                break;
              }
            }
          } catch (h) {
            c.e(h);
          } finally {
            c.f();
          }
        }
      }
    } catch (h) {
      l.e(h);
    } finally {
      l.f();
    }
    return s;
  },
  filters: {
    startsWith: function(e, n, r) {
      if (n == null || n === "")
        return !0;
      if (e == null)
        return !1;
      var i = ne(n.toString()).toLocaleLowerCase(r), o = ne(e.toString()).toLocaleLowerCase(r);
      return o.slice(0, i.length) === i;
    },
    contains: function(e, n, r) {
      if (n == null || n === "")
        return !0;
      if (e == null)
        return !1;
      var i = ne(n.toString()).toLocaleLowerCase(r), o = ne(e.toString()).toLocaleLowerCase(r);
      return o.indexOf(i) !== -1;
    },
    notContains: function(e, n, r) {
      if (n == null || n === "")
        return !0;
      if (e == null)
        return !1;
      var i = ne(n.toString()).toLocaleLowerCase(r), o = ne(e.toString()).toLocaleLowerCase(r);
      return o.indexOf(i) === -1;
    },
    endsWith: function(e, n, r) {
      if (n == null || n === "")
        return !0;
      if (e == null)
        return !1;
      var i = ne(n.toString()).toLocaleLowerCase(r), o = ne(e.toString()).toLocaleLowerCase(r);
      return o.indexOf(i, o.length - i.length) !== -1;
    },
    equals: function(e, n, r) {
      return n == null || n === "" ? !0 : e == null ? !1 : e.getTime && n.getTime ? e.getTime() === n.getTime() : ne(e.toString()).toLocaleLowerCase(r) == ne(n.toString()).toLocaleLowerCase(r);
    },
    notEquals: function(e, n, r) {
      return n == null || n === "" ? !1 : e == null ? !0 : e.getTime && n.getTime ? e.getTime() !== n.getTime() : ne(e.toString()).toLocaleLowerCase(r) != ne(n.toString()).toLocaleLowerCase(r);
    },
    in: function(e, n) {
      if (n == null || n.length === 0)
        return !0;
      for (var r = 0; r < n.length; r++)
        if (Yn(e, n[r]))
          return !0;
      return !1;
    },
    between: function(e, n) {
      return n == null || n[0] == null || n[1] == null ? !0 : e == null ? !1 : e.getTime ? n[0].getTime() <= e.getTime() && e.getTime() <= n[1].getTime() : n[0] <= e && e <= n[1];
    },
    lt: function(e, n) {
      return n == null ? !0 : e == null ? !1 : e.getTime && n.getTime ? e.getTime() < n.getTime() : e < n;
    },
    lte: function(e, n) {
      return n == null ? !0 : e == null ? !1 : e.getTime && n.getTime ? e.getTime() <= n.getTime() : e <= n;
    },
    gt: function(e, n) {
      return n == null ? !0 : e == null ? !1 : e.getTime && n.getTime ? e.getTime() > n.getTime() : e > n;
    },
    gte: function(e, n) {
      return n == null ? !0 : e == null ? !1 : e.getTime && n.getTime ? e.getTime() >= n.getTime() : e >= n;
    },
    dateIs: function(e, n) {
      return n == null ? !0 : e == null ? !1 : (typeof e == "string" && (e = new Date(e)), typeof n == "string" && (n = new Date(n)), e.toDateString() === n.toDateString());
    },
    dateIsNot: function(e, n) {
      return n == null ? !0 : e == null ? !1 : (typeof e == "string" && (e = new Date(e)), typeof n == "string" && (n = new Date(n)), e.toDateString() !== n.toDateString());
    },
    dateBefore: function(e, n) {
      return n == null ? !0 : e == null ? !1 : (typeof e == "string" && (e = new Date(e)), typeof n == "string" && (n = new Date(n)), e.getTime() < n.getTime());
    },
    dateAfter: function(e, n) {
      return n == null ? !0 : e == null ? !1 : (typeof e == "string" && (e = new Date(e)), typeof n == "string" && (n = new Date(n)), e.getTime() > n.getTime());
    }
  },
  register: function(e, n) {
    this.filters[e] = n;
  }
}, jo = `
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
function De(t) {
  "@babel/helpers - typeof";
  return De = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, De(t);
}
function ln(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(t, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function un(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? ln(Object(n), !0).forEach(function(r) {
      zo(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : ln(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function zo(t, e, n) {
  return (e = Mo(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Mo(t) {
  var e = Fo(t, "string");
  return De(e) == "symbol" ? e : e + "";
}
function Fo(t, e) {
  if (De(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (De(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
function No(t) {
  var e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  Yt() && Yt().components ? Mn(t) : e ? t() : Fn(t);
}
var Do = 0;
function Ro(t) {
  var e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = U(!1), r = U(t), i = U(null), o = ir() ? window.document : void 0, s = e.document, l = s === void 0 ? o : s, a = e.immediate, u = a === void 0 ? !0 : a, c = e.manual, d = c === void 0 ? !1 : c, p = e.name, f = p === void 0 ? "style_".concat(++Do) : p, h = e.id, g = h === void 0 ? void 0 : h, v = e.media, y = v === void 0 ? void 0 : v, b = e.nonce, _ = b === void 0 ? void 0 : b, m = e.first, x = m === void 0 ? !1 : m, P = e.onMounted, S = P === void 0 ? void 0 : P, L = e.onUpdated, R = L === void 0 ? void 0 : L, B = e.onLoad, V = B === void 0 ? void 0 : B, F = e.props, J = F === void 0 ? {} : F, Z = function() {
  }, K = function($) {
    var H = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (l) {
      var Q = un(un({}, J), H), oe = Q.name || f, be = Q.id || g, Xe = Q.nonce || _;
      i.value = l.querySelector('style[data-primevue-style-id="'.concat(oe, '"]')) || l.getElementById(be) || l.createElement("style"), i.value.isConnected || (r.value = $ || t, st(i.value, {
        type: "text/css",
        id: be,
        media: y,
        nonce: Xe
      }), x ? l.head.prepend(i.value) : l.head.appendChild(i.value), wo(i.value, "data-primevue-style-id", oe), st(i.value, Q), i.value.onload = function($e) {
        return V?.($e, {
          name: oe
        });
      }, S?.(oe)), !n.value && (Z = Te(r, function($e) {
        i.value.textContent = $e, R?.(oe);
      }, {
        immediate: !0
      }), n.value = !0);
    }
  }, G = function() {
    !l || !n.value || (Z(), lo(i.value) && l.head.removeChild(i.value), n.value = !1, i.value = null);
  };
  return u && !d && No(K), {
    id: g,
    name: f,
    el: i,
    css: r,
    unload: G,
    load: K,
    isLoaded: Qr(n)
  };
}
function Re(t) {
  "@babel/helpers - typeof";
  return Re = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Re(t);
}
var cn, dn, pn, fn;
function hn(t, e) {
  return Uo(t) || Ko(t, e) || Ho(t, e) || Bo();
}
function Bo() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ho(t, e) {
  if (t) {
    if (typeof t == "string") return mn(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? mn(t, e) : void 0;
  }
}
function mn(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function Ko(t, e) {
  var n = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (n != null) {
    var r, i, o, s, l = [], a = !0, u = !1;
    try {
      if (o = (n = n.call(t)).next, e !== 0) for (; !(a = (r = o.call(n)).done) && (l.push(r.value), l.length !== e); a = !0) ;
    } catch (c) {
      u = !0, i = c;
    } finally {
      try {
        if (!a && n.return != null && (s = n.return(), Object(s) !== s)) return;
      } finally {
        if (u) throw i;
      }
    }
    return l;
  }
}
function Uo(t) {
  if (Array.isArray(t)) return t;
}
function vn(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(t, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function wt(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? vn(Object(n), !0).forEach(function(r) {
      Wo(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : vn(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function Wo(t, e, n) {
  return (e = Go(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Go(t) {
  var e = qo(t, "string");
  return Re(e) == "symbol" ? e : e + "";
}
function qo(t, e) {
  if (Re(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (Re(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
function rt(t, e) {
  return e || (e = t.slice(0)), Object.freeze(Object.defineProperties(t, { raw: { value: Object.freeze(e) } }));
}
var Yo = function(e) {
  var n = e.dt;
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
}, Jo = {}, Zo = {}, z = {
  name: "base",
  css: Yo,
  style: jo,
  classes: Jo,
  inlineStyles: Zo,
  load: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(o) {
      return o;
    }, i = r(nt(cn || (cn = rt(["", ""])), e));
    return E(i) ? Ro(Fe(i), wt({
      name: this.name
    }, n)) : {};
  },
  loadCSS: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    return this.load(this.css, e);
  },
  loadStyle: function() {
    var e = this, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
    return this.load(this.style, n, function() {
      var i = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
      return j.transformCSS(n.name || e.name, "".concat(i).concat(nt(dn || (dn = rt(["", ""])), r)));
    });
  },
  getCommonTheme: function(e) {
    return j.getCommon(this.name, e);
  },
  getComponentTheme: function(e) {
    return j.getComponent(this.name, e);
  },
  getDirectiveTheme: function(e) {
    return j.getDirective(this.name, e);
  },
  getPresetTheme: function(e, n, r) {
    return j.getCustomPreset(this.name, e, n, r);
  },
  getLayerOrderThemeCSS: function() {
    return j.getLayerOrderCSS(this.name);
  },
  getStyleSheet: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.css) {
      var r = te(this.css, {
        dt: Oe
      }) || "", i = Fe(nt(pn || (pn = rt(["", "", ""])), r, e)), o = Object.entries(n).reduce(function(s, l) {
        var a = hn(l, 2), u = a[0], c = a[1];
        return s.push("".concat(u, '="').concat(c, '"')) && s;
      }, []).join(" ");
      return E(i) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(o, ">").concat(i, "</style>") : "";
    }
    return "";
  },
  getCommonThemeStyleSheet: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return j.getCommonStyleSheet(this.name, e, n);
  },
  getThemeStyleSheet: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = [j.getStyleSheet(this.name, e, n)];
    if (this.style) {
      var i = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), o = nt(fn || (fn = rt(["", ""])), te(this.style, {
        dt: Oe
      })), s = Fe(j.transformCSS(i, o)), l = Object.entries(n).reduce(function(a, u) {
        var c = hn(u, 2), d = c[0], p = c[1];
        return a.push("".concat(d, '="').concat(p, '"')) && a;
      }, []).join(" ");
      E(s) && r.push('<style type="text/css" data-primevue-style-id="'.concat(i, '" ').concat(l, ">").concat(s, "</style>"));
    }
    return r.join("");
  },
  extend: function(e) {
    return wt(wt({}, this), {}, {
      css: void 0,
      style: void 0
    }, e);
  }
}, ye = Rt();
function Be(t) {
  "@babel/helpers - typeof";
  return Be = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Be(t);
}
function gn(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(t, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function it(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? gn(Object(n), !0).forEach(function(r) {
      Qo(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : gn(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function Qo(t, e, n) {
  return (e = Xo(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Xo(t) {
  var e = ea(t, "string");
  return Be(e) == "symbol" ? e : e + "";
}
function ea(t, e) {
  if (Be(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (Be(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var ta = {
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
    text: [Y.STARTS_WITH, Y.CONTAINS, Y.NOT_CONTAINS, Y.ENDS_WITH, Y.EQUALS, Y.NOT_EQUALS],
    numeric: [Y.EQUALS, Y.NOT_EQUALS, Y.LESS_THAN, Y.LESS_THAN_OR_EQUAL_TO, Y.GREATER_THAN, Y.GREATER_THAN_OR_EQUAL_TO],
    date: [Y.DATE_IS, Y.DATE_IS_NOT, Y.DATE_BEFORE, Y.DATE_AFTER]
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
}, na = Symbol();
function ra(t, e) {
  var n = {
    config: Xr(e)
  };
  return t.config.globalProperties.$primevue = n, t.provide(na, n), ia(), oa(t, n), n;
}
var Ae = [];
function ia() {
  q.clear(), Ae.forEach(function(t) {
    return t?.();
  }), Ae = [];
}
function oa(t, e) {
  var n = U(!1), r = function() {
    var u;
    if (((u = e.config) === null || u === void 0 ? void 0 : u.theme) !== "none" && !j.isStyleNameLoaded("common")) {
      var c, d, p = ((c = z.getCommonTheme) === null || c === void 0 ? void 0 : c.call(z)) || {}, f = p.primitive, h = p.semantic, g = p.global, v = p.style, y = {
        nonce: (d = e.config) === null || d === void 0 || (d = d.csp) === null || d === void 0 ? void 0 : d.nonce
      };
      z.load(f?.css, it({
        name: "primitive-variables"
      }, y)), z.load(h?.css, it({
        name: "semantic-variables"
      }, y)), z.load(g?.css, it({
        name: "global-variables"
      }, y)), z.loadStyle(it({
        name: "global-style"
      }, y), v), j.setLoadedStyleName("common");
    }
  };
  q.on("theme:change", function(a) {
    n.value || (t.config.globalProperties.$primevue.config.theme = a, n.value = !0);
  });
  var i = Te(e.config, function(a, u) {
    ye.emit("config:change", {
      newValue: a,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), o = Te(function() {
    return e.config.ripple;
  }, function(a, u) {
    ye.emit("config:ripple:change", {
      newValue: a,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), s = Te(function() {
    return e.config.theme;
  }, function(a, u) {
    n.value || j.setTheme(a), e.config.unstyled || r(), n.value = !1, ye.emit("config:theme:change", {
      newValue: a,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !1
  }), l = Te(function() {
    return e.config.unstyled;
  }, function(a, u) {
    !a && e.config.theme && r(), ye.emit("config:unstyled:change", {
      newValue: a,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  });
  Ae.push(i), Ae.push(o), Ae.push(s), Ae.push(l);
}
var aa = {
  install: function(e, n) {
    var r = Qi(ta, n);
    ra(e, r);
  }
}, Ht = {
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
    this.mounted = ir();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function sa(t, e, n, r, i, o) {
  return o.inline ? M(t.$slots, "default", {
    key: 0
  }) : i.mounted ? (k(), me(Nn, {
    key: 1,
    to: n.appendTo
  }, [M(t.$slots, "default")], 8, ["to"])) : W("", !0);
}
Ht.render = sa;
var ge = {
  _loadedStyleNames: /* @__PURE__ */ new Set(),
  getLoadedStyleNames: function() {
    return this._loadedStyleNames;
  },
  isStyleNameLoaded: function(e) {
    return this._loadedStyleNames.has(e);
  },
  setLoadedStyleName: function(e) {
    this._loadedStyleNames.add(e);
  },
  deleteLoadedStyleName: function(e) {
    this._loadedStyleNames.delete(e);
  },
  clearLoadedStyleNames: function() {
    this._loadedStyleNames.clear();
  }
};
function la() {
  var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pc", e = ei();
  return "".concat(t).concat(e.replace("v-", "").replaceAll("-", "_"));
}
var yn = z.extend({
  name: "common"
});
function He(t) {
  "@babel/helpers - typeof";
  return He = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, He(t);
}
function ua(t) {
  return hr(t) || ca(t) || fr(t) || pr();
}
function ca(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function je(t, e) {
  return hr(t) || da(t, e) || fr(t, e) || pr();
}
function pr() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function fr(t, e) {
  if (t) {
    if (typeof t == "string") return _t(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? _t(t, e) : void 0;
  }
}
function _t(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function da(t, e) {
  var n = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (n != null) {
    var r, i, o, s, l = [], a = !0, u = !1;
    try {
      if (o = (n = n.call(t)).next, e === 0) {
        if (Object(n) !== n) return;
        a = !1;
      } else for (; !(a = (r = o.call(n)).done) && (l.push(r.value), l.length !== e); a = !0) ;
    } catch (c) {
      u = !0, i = c;
    } finally {
      try {
        if (!a && n.return != null && (s = n.return(), Object(s) !== s)) return;
      } finally {
        if (u) throw i;
      }
    }
    return l;
  }
}
function hr(t) {
  if (Array.isArray(t)) return t;
}
function bn(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(t, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function T(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? bn(Object(n), !0).forEach(function(r) {
      Me(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : bn(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function Me(t, e, n) {
  return (e = pa(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function pa(t) {
  var e = fa(t, "string");
  return He(e) == "symbol" ? e : e + "";
}
function fa(t, e) {
  if (He(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (He(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Qe = {
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
      handler: function(e) {
        q.off("theme:change", this._loadCoreStyles), e || (this._loadCoreStyles(), this._themeChangeListener(this._loadCoreStyles));
      }
    },
    dt: {
      immediate: !0,
      handler: function(e, n) {
        var r = this;
        q.off("theme:change", this._themeScopedListener), e ? (this._loadScopedThemeStyles(e), this._themeScopedListener = function() {
          return r._loadScopedThemeStyles(e);
        }, this._themeChangeListener(this._themeScopedListener)) : this._unloadScopedThemeStyles();
      }
    }
  },
  scopedStyleEl: void 0,
  rootEl: void 0,
  uid: void 0,
  $attrSelector: void 0,
  beforeCreate: function() {
    var e, n, r, i, o, s, l, a, u, c, d, p = (e = this.pt) === null || e === void 0 ? void 0 : e._usept, f = p ? (n = this.pt) === null || n === void 0 || (n = n.originalValue) === null || n === void 0 ? void 0 : n[this.$.type.name] : void 0, h = p ? (r = this.pt) === null || r === void 0 || (r = r.value) === null || r === void 0 ? void 0 : r[this.$.type.name] : this.pt;
    (i = h || f) === null || i === void 0 || (i = i.hooks) === null || i === void 0 || (o = i.onBeforeCreate) === null || o === void 0 || o.call(i);
    var g = (s = this.$primevueConfig) === null || s === void 0 || (s = s.pt) === null || s === void 0 ? void 0 : s._usept, v = g ? (l = this.$primevue) === null || l === void 0 || (l = l.config) === null || l === void 0 || (l = l.pt) === null || l === void 0 ? void 0 : l.originalValue : void 0, y = g ? (a = this.$primevue) === null || a === void 0 || (a = a.config) === null || a === void 0 || (a = a.pt) === null || a === void 0 ? void 0 : a.value : (u = this.$primevue) === null || u === void 0 || (u = u.config) === null || u === void 0 ? void 0 : u.pt;
    (c = y || v) === null || c === void 0 || (c = c[this.$.type.name]) === null || c === void 0 || (c = c.hooks) === null || c === void 0 || (d = c.onBeforeCreate) === null || d === void 0 || d.call(c), this.$attrSelector = la(), this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
  },
  created: function() {
    this._hook("onCreated");
  },
  beforeMount: function() {
    var e;
    this.rootEl = ft(Ee(this.$el) ? this.$el : (e = this.$el) === null || e === void 0 ? void 0 : e.parentElement, "[".concat(this.$attrSelector, "]")), this.rootEl && (this.rootEl.$pc = T({
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
    _hook: function(e) {
      if (!this.$options.hostName) {
        var n = this._usePT(this._getPT(this.pt, this.$.type.name), this._getOptionValue, "hooks.".concat(e)), r = this._useDefaultPT(this._getOptionValue, "hooks.".concat(e));
        n?.(), r?.();
      }
    },
    _mergeProps: function(e) {
      for (var n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), i = 1; i < n; i++)
        r[i - 1] = arguments[i];
      return pt(e) ? e.apply(void 0, r) : O.apply(void 0, r);
    },
    _load: function() {
      ge.isStyleNameLoaded("base") || (z.loadCSS(this.$styleOptions), this._loadGlobalStyles(), ge.setLoadedStyleName("base")), this._loadThemeStyles();
    },
    _loadStyles: function() {
      this._load(), this._themeChangeListener(this._load);
    },
    _loadCoreStyles: function() {
      var e, n;
      !ge.isStyleNameLoaded((e = this.$style) === null || e === void 0 ? void 0 : e.name) && (n = this.$style) !== null && n !== void 0 && n.name && (yn.loadCSS(this.$styleOptions), this.$options.style && this.$style.loadCSS(this.$styleOptions), ge.setLoadedStyleName(this.$style.name));
    },
    _loadGlobalStyles: function() {
      var e = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
      E(e) && z.load(e, T({
        name: "global"
      }, this.$styleOptions));
    },
    _loadThemeStyles: function() {
      var e, n;
      if (!(this.isUnstyled || this.$theme === "none")) {
        if (!j.isStyleNameLoaded("common")) {
          var r, i, o = ((r = this.$style) === null || r === void 0 || (i = r.getCommonTheme) === null || i === void 0 ? void 0 : i.call(r)) || {}, s = o.primitive, l = o.semantic, a = o.global, u = o.style;
          z.load(s?.css, T({
            name: "primitive-variables"
          }, this.$styleOptions)), z.load(l?.css, T({
            name: "semantic-variables"
          }, this.$styleOptions)), z.load(a?.css, T({
            name: "global-variables"
          }, this.$styleOptions)), z.loadStyle(T({
            name: "global-style"
          }, this.$styleOptions), u), j.setLoadedStyleName("common");
        }
        if (!j.isStyleNameLoaded((e = this.$style) === null || e === void 0 ? void 0 : e.name) && (n = this.$style) !== null && n !== void 0 && n.name) {
          var c, d, p, f, h = ((c = this.$style) === null || c === void 0 || (d = c.getComponentTheme) === null || d === void 0 ? void 0 : d.call(c)) || {}, g = h.css, v = h.style;
          (p = this.$style) === null || p === void 0 || p.load(g, T({
            name: "".concat(this.$style.name, "-variables")
          }, this.$styleOptions)), (f = this.$style) === null || f === void 0 || f.loadStyle(T({
            name: "".concat(this.$style.name, "-style")
          }, this.$styleOptions), v), j.setLoadedStyleName(this.$style.name);
        }
        if (!j.isStyleNameLoaded("layer-order")) {
          var y, b, _ = (y = this.$style) === null || y === void 0 || (b = y.getLayerOrderThemeCSS) === null || b === void 0 ? void 0 : b.call(y);
          z.load(_, T({
            name: "layer-order",
            first: !0
          }, this.$styleOptions)), j.setLoadedStyleName("layer-order");
        }
      }
    },
    _loadScopedThemeStyles: function(e) {
      var n, r, i, o = ((n = this.$style) === null || n === void 0 || (r = n.getPresetTheme) === null || r === void 0 ? void 0 : r.call(n, e, "[".concat(this.$attrSelector, "]"))) || {}, s = o.css, l = (i = this.$style) === null || i === void 0 ? void 0 : i.load(s, T({
        name: "".concat(this.$attrSelector, "-").concat(this.$style.name)
      }, this.$styleOptions));
      this.scopedStyleEl = l.el;
    },
    _unloadScopedThemeStyles: function() {
      var e;
      (e = this.scopedStyleEl) === null || e === void 0 || (e = e.value) === null || e === void 0 || e.remove();
    },
    _themeChangeListener: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
      };
      ge.clearLoadedStyleNames(), q.on("theme:change", e);
    },
    _removeThemeListeners: function() {
      q.off("theme:change", this._loadCoreStyles), q.off("theme:change", this._load), q.off("theme:change", this._themeScopedListener);
    },
    _getHostInstance: function(e) {
      return e ? this.$options.hostName ? e.$.type.name === this.$options.hostName ? e : this._getHostInstance(e.$parentInstance) : e.$parentInstance : void 0;
    },
    _getPropValue: function(e) {
      var n;
      return this[e] || ((n = this._getHostInstance(this)) === null || n === void 0 ? void 0 : n[e]);
    },
    _getOptionValue: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return Dt(e, n, r);
    },
    _getPTValue: function() {
      var e, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, o = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, s = /./g.test(r) && !!i[r.split(".")[0]], l = this._getPropValue("ptOptions") || ((e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.ptOptions) || {}, a = l.mergeSections, u = a === void 0 ? !0 : a, c = l.mergeProps, d = c === void 0 ? !1 : c, p = o ? s ? this._useGlobalPT(this._getPTClassValue, r, i) : this._useDefaultPT(this._getPTClassValue, r, i) : void 0, f = s ? void 0 : this._getPTSelf(n, this._getPTClassValue, r, T(T({}, i), {}, {
        global: p || {}
      })), h = this._getPTDatasets(r);
      return u || !u && f ? d ? this._mergeProps(d, p, f, h) : T(T(T({}, p), f), h) : T(T({}, f), h);
    },
    _getPTSelf: function() {
      for (var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), i = 1; i < n; i++)
        r[i - 1] = arguments[i];
      return O(
        this._usePT.apply(this, [this._getPT(e, this.$name)].concat(r)),
        // Exp; <component :pt="{}"
        this._usePT.apply(this, [this.$_attrsPT].concat(r))
        // Exp; <component :pt:[passthrough_key]:[attribute]="{value}" or <component :pt:[passthrough_key]="() =>{value}"
      );
    },
    _getPTDatasets: function() {
      var e, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", i = "data-pc-", o = r === "root" && E((e = this.pt) === null || e === void 0 ? void 0 : e["data-pc-section"]);
      return r !== "transition" && T(T({}, r === "root" && T(T(Me({}, "".concat(i, "name"), ue(o ? (n = this.pt) === null || n === void 0 ? void 0 : n["data-pc-section"] : this.$.type.name)), o && Me({}, "".concat(i, "extend"), ue(this.$.type.name))), {}, Me({}, "".concat(this.$attrSelector), ""))), {}, Me({}, "".concat(i, "section"), ue(r)));
    },
    _getPTClassValue: function() {
      var e = this._getOptionValue.apply(this, arguments);
      return ee(e) || Zn(e) ? {
        class: e
      } : e;
    },
    _getPT: function(e) {
      var n = this, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", i = arguments.length > 2 ? arguments[2] : void 0, o = function(l) {
        var a, u = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, c = i ? i(l) : l, d = ue(r), p = ue(n.$name);
        return (a = u ? d !== p ? c?.[d] : void 0 : c?.[d]) !== null && a !== void 0 ? a : c;
      };
      return e != null && e.hasOwnProperty("_usept") ? {
        _usept: e._usept,
        originalValue: o(e.originalValue),
        value: o(e.value)
      } : o(e, !0);
    },
    _usePT: function(e, n, r, i) {
      var o = function(g) {
        return n(g, r, i);
      };
      if (e != null && e.hasOwnProperty("_usept")) {
        var s, l = e._usept || ((s = this.$primevueConfig) === null || s === void 0 ? void 0 : s.ptOptions) || {}, a = l.mergeSections, u = a === void 0 ? !0 : a, c = l.mergeProps, d = c === void 0 ? !1 : c, p = o(e.originalValue), f = o(e.value);
        return p === void 0 && f === void 0 ? void 0 : ee(f) ? f : ee(p) ? p : u || !u && f ? d ? this._mergeProps(d, p, f) : T(T({}, p), f) : f;
      }
      return o(e);
    },
    _useGlobalPT: function(e, n, r) {
      return this._usePT(this.globalPT, e, n, r);
    },
    _useDefaultPT: function(e, n, r) {
      return this._usePT(this.defaultPT, e, n, r);
    },
    ptm: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this._getPTValue(this.pt, e, T(T({}, this.$params), n));
    },
    ptmi: function() {
      var e, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, i = O(this.$_attrsWithoutPT, this.ptm(n, r));
      return i?.hasOwnProperty("id") && ((e = i.id) !== null && e !== void 0 || (i.id = this.$id)), i;
    },
    ptmo: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return this._getPTValue(e, n, T({
        instance: this
      }, r), !1);
    },
    cx: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this.isUnstyled ? void 0 : this._getOptionValue(this.$style.classes, e, T(T({}, this.$params), n));
    },
    sx: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      if (n) {
        var i = this._getOptionValue(this.$style.inlineStyles, e, T(T({}, this.$params), r)), o = this._getOptionValue(yn.inlineStyles, e, T(T({}, this.$params), r));
        return [o, i];
      }
    }
  },
  computed: {
    globalPT: function() {
      var e, n = this;
      return this._getPT((e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.pt, void 0, function(r) {
        return te(r, {
          instance: n
        });
      });
    },
    defaultPT: function() {
      var e, n = this;
      return this._getPT((e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.pt, void 0, function(r) {
        return n._getOptionValue(r, n.$name, T({}, n.$params)) || te(r, T({}, n.$params));
      });
    },
    isUnstyled: function() {
      var e;
      return this.unstyled !== void 0 ? this.unstyled : (e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.unstyled;
    },
    $id: function() {
      return this.$attrs.id || this.uid;
    },
    $inProps: function() {
      var e, n = Object.keys(((e = this.$.vnode) === null || e === void 0 ? void 0 : e.props) || {});
      return Object.fromEntries(Object.entries(this.$props).filter(function(r) {
        var i = je(r, 1), o = i[0];
        return n?.includes(o);
      }));
    },
    $theme: function() {
      var e;
      return (e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.theme;
    },
    $style: function() {
      return T(T({
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
      var e;
      return {
        nonce: (e = this.$primevueConfig) === null || e === void 0 || (e = e.csp) === null || e === void 0 ? void 0 : e.nonce
      };
    },
    $primevueConfig: function() {
      var e;
      return (e = this.$primevue) === null || e === void 0 ? void 0 : e.config;
    },
    $name: function() {
      return this.$options.hostName || this.$.type.name;
    },
    $params: function() {
      var e = this._getHostInstance(this) || this.$parent;
      return {
        instance: this,
        props: this.$props,
        state: this.$data,
        attrs: this.$attrs,
        parent: {
          instance: e,
          props: e?.$props,
          state: e?.$data,
          attrs: e?.$attrs
        }
      };
    },
    $_attrsPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(e) {
        var n = je(e, 1), r = n[0];
        return r?.startsWith("pt:");
      }).reduce(function(e, n) {
        var r = je(n, 2), i = r[0], o = r[1], s = i.split(":"), l = ua(s), a = _t(l).slice(1);
        return a?.reduce(function(u, c, d, p) {
          return !u[c] && (u[c] = d === p.length - 1 ? o : {}), u[c];
        }, e), e;
      }, {});
    },
    $_attrsWithoutPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(e) {
        var n = je(e, 1), r = n[0];
        return !(r != null && r.startsWith("pt:"));
      }).reduce(function(e, n) {
        var r = je(n, 2), i = r[0], o = r[1];
        return e[i] = o, e;
      }, {});
    }
  }
}, ha = `
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
`, ma = z.extend({
  name: "baseicon",
  css: ha
});
function Ke(t) {
  "@babel/helpers - typeof";
  return Ke = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Ke(t);
}
function wn(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(t, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Sn(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? wn(Object(n), !0).forEach(function(r) {
      va(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : wn(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function va(t, e, n) {
  return (e = ga(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function ga(t) {
  var e = ya(t, "string");
  return Ke(e) == "symbol" ? e : e + "";
}
function ya(t, e) {
  if (Ke(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (Ke(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Ve = {
  name: "BaseIcon",
  extends: Qe,
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
  style: ma,
  provide: function() {
    return {
      $pcIcon: this,
      $parentInstance: this
    };
  },
  methods: {
    pti: function() {
      var e = Ze(this.label);
      return Sn(Sn({}, !this.isUnstyled && {
        class: ["p-icon", {
          "p-icon-spin": this.spin
        }]
      }), {}, {
        role: e ? void 0 : "img",
        "aria-label": e ? void 0 : this.label,
        "aria-hidden": e
      });
    }
  }
};
function Ue(t) {
  "@babel/helpers - typeof";
  return Ue = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Ue(t);
}
function xn(t, e) {
  return xa(t) || Sa(t, e) || wa(t, e) || ba();
}
function ba() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function wa(t, e) {
  if (t) {
    if (typeof t == "string") return kn(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? kn(t, e) : void 0;
  }
}
function kn(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function Sa(t, e) {
  var n = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (n != null) {
    var r, i, o, s, l = [], a = !0, u = !1;
    try {
      if (o = (n = n.call(t)).next, e !== 0) for (; !(a = (r = o.call(n)).done) && (l.push(r.value), l.length !== e); a = !0) ;
    } catch (c) {
      u = !0, i = c;
    } finally {
      try {
        if (!a && n.return != null && (s = n.return(), Object(s) !== s)) return;
      } finally {
        if (u) throw i;
      }
    }
    return l;
  }
}
function xa(t) {
  if (Array.isArray(t)) return t;
}
function On(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(t, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function A(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? On(Object(n), !0).forEach(function(r) {
      It(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : On(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function It(t, e, n) {
  return (e = ka(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function ka(t) {
  var e = Oa(t, "string");
  return Ue(e) == "symbol" ? e : e + "";
}
function Oa(t, e) {
  if (Ue(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (Ue(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var I = {
  _getMeta: function() {
    return [ce(arguments.length <= 0 ? void 0 : arguments[0]) || arguments.length <= 0 ? void 0 : arguments[0], te(ce(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getConfig: function(e, n) {
    var r, i, o;
    return (r = (e == null || (i = e.instance) === null || i === void 0 ? void 0 : i.$primevue) || (n == null || (o = n.ctx) === null || o === void 0 || (o = o.appContext) === null || o === void 0 || (o = o.config) === null || o === void 0 || (o = o.globalProperties) === null || o === void 0 ? void 0 : o.$primevue)) === null || r === void 0 ? void 0 : r.config;
  },
  _getOptionValue: Dt,
  _getPTValue: function() {
    var e, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, i = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", s = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, l = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, a = function() {
      var b = I._getOptionValue.apply(I, arguments);
      return ee(b) || Zn(b) ? {
        class: b
      } : b;
    }, u = ((e = r.binding) === null || e === void 0 || (e = e.value) === null || e === void 0 ? void 0 : e.ptOptions) || ((n = r.$primevueConfig) === null || n === void 0 ? void 0 : n.ptOptions) || {}, c = u.mergeSections, d = c === void 0 ? !0 : c, p = u.mergeProps, f = p === void 0 ? !1 : p, h = l ? I._useDefaultPT(r, r.defaultPT(), a, o, s) : void 0, g = I._usePT(r, I._getPT(i, r.$name), a, o, A(A({}, s), {}, {
      global: h || {}
    })), v = I._getPTDatasets(r, o);
    return d || !d && g ? f ? I._mergeProps(r, f, h, g, v) : A(A(A({}, h), g), v) : A(A({}, g), v);
  },
  _getPTDatasets: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = "data-pc-";
    return A(A({}, n === "root" && It({}, "".concat(r, "name"), ue(e.$name))), {}, It({}, "".concat(r, "section"), ue(n)));
  },
  _getPT: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 ? arguments[2] : void 0, i = function(s) {
      var l, a = r ? r(s) : s, u = ue(n);
      return (l = a?.[u]) !== null && l !== void 0 ? l : a;
    };
    return e && Object.hasOwn(e, "_usept") ? {
      _usept: e._usept,
      originalValue: i(e.originalValue),
      value: i(e.value)
    } : i(e);
  },
  _usePT: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = arguments.length > 2 ? arguments[2] : void 0, i = arguments.length > 3 ? arguments[3] : void 0, o = arguments.length > 4 ? arguments[4] : void 0, s = function(v) {
      return r(v, i, o);
    };
    if (n && Object.hasOwn(n, "_usept")) {
      var l, a = n._usept || ((l = e.$primevueConfig) === null || l === void 0 ? void 0 : l.ptOptions) || {}, u = a.mergeSections, c = u === void 0 ? !0 : u, d = a.mergeProps, p = d === void 0 ? !1 : d, f = s(n.originalValue), h = s(n.value);
      return f === void 0 && h === void 0 ? void 0 : ee(h) ? h : ee(f) ? f : c || !c && h ? p ? I._mergeProps(e, p, f, h) : A(A({}, f), h) : h;
    }
    return s(n);
  },
  _useDefaultPT: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 ? arguments[2] : void 0, i = arguments.length > 3 ? arguments[3] : void 0, o = arguments.length > 4 ? arguments[4] : void 0;
    return I._usePT(e, n, r, i, o);
  },
  _loadStyles: function() {
    var e, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 ? arguments[1] : void 0, i = arguments.length > 2 ? arguments[2] : void 0, o = I._getConfig(r, i), s = {
      nonce: o == null || (e = o.csp) === null || e === void 0 ? void 0 : e.nonce
    };
    I._loadCoreStyles(n, s), I._loadThemeStyles(n, s), I._loadScopedThemeStyles(n, s), I._removeThemeListeners(n), n.$loadStyles = function() {
      return I._loadThemeStyles(n, s);
    }, I._themeChangeListener(n.$loadStyles);
  },
  _loadCoreStyles: function() {
    var e, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, i = arguments.length > 1 ? arguments[1] : void 0;
    if (!ge.isStyleNameLoaded((e = r.$style) === null || e === void 0 ? void 0 : e.name) && (n = r.$style) !== null && n !== void 0 && n.name) {
      var o;
      z.loadCSS(i), (o = r.$style) === null || o === void 0 || o.loadCSS(i), ge.setLoadedStyleName(r.$style.name);
    }
  },
  _loadThemeStyles: function() {
    var e, n, r, i = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 ? arguments[1] : void 0;
    if (!(i != null && i.isUnstyled() || (i == null || (e = i.theme) === null || e === void 0 ? void 0 : e.call(i)) === "none")) {
      if (!j.isStyleNameLoaded("common")) {
        var s, l, a = ((s = i.$style) === null || s === void 0 || (l = s.getCommonTheme) === null || l === void 0 ? void 0 : l.call(s)) || {}, u = a.primitive, c = a.semantic, d = a.global, p = a.style;
        z.load(u?.css, A({
          name: "primitive-variables"
        }, o)), z.load(c?.css, A({
          name: "semantic-variables"
        }, o)), z.load(d?.css, A({
          name: "global-variables"
        }, o)), z.loadStyle(A({
          name: "global-style"
        }, o), p), j.setLoadedStyleName("common");
      }
      if (!j.isStyleNameLoaded((n = i.$style) === null || n === void 0 ? void 0 : n.name) && (r = i.$style) !== null && r !== void 0 && r.name) {
        var f, h, g, v, y = ((f = i.$style) === null || f === void 0 || (h = f.getDirectiveTheme) === null || h === void 0 ? void 0 : h.call(f)) || {}, b = y.css, _ = y.style;
        (g = i.$style) === null || g === void 0 || g.load(b, A({
          name: "".concat(i.$style.name, "-variables")
        }, o)), (v = i.$style) === null || v === void 0 || v.loadStyle(A({
          name: "".concat(i.$style.name, "-style")
        }, o), _), j.setLoadedStyleName(i.$style.name);
      }
      if (!j.isStyleNameLoaded("layer-order")) {
        var m, x, P = (m = i.$style) === null || m === void 0 || (x = m.getLayerOrderThemeCSS) === null || x === void 0 ? void 0 : x.call(m);
        z.load(P, A({
          name: "layer-order",
          first: !0
        }, o)), j.setLoadedStyleName("layer-order");
      }
    }
  },
  _loadScopedThemeStyles: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = e.preset();
    if (r && e.$attrSelector) {
      var i, o, s, l = ((i = e.$style) === null || i === void 0 || (o = i.getPresetTheme) === null || o === void 0 ? void 0 : o.call(i, r, "[".concat(e.$attrSelector, "]"))) || {}, a = l.css, u = (s = e.$style) === null || s === void 0 ? void 0 : s.load(a, A({
        name: "".concat(e.$attrSelector, "-").concat(e.$style.name)
      }, n));
      e.scopedStyleEl = u.el;
    }
  },
  _themeChangeListener: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
    };
    ge.clearLoadedStyleNames(), q.on("theme:change", e);
  },
  _removeThemeListeners: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    q.off("theme:change", e.$loadStyles), e.$loadStyles = void 0;
  },
  _hook: function(e, n, r, i, o, s) {
    var l, a, u = "on".concat(Xi(n)), c = I._getConfig(i, o), d = r?.$instance, p = I._usePT(d, I._getPT(i == null || (l = i.value) === null || l === void 0 ? void 0 : l.pt, e), I._getOptionValue, "hooks.".concat(u)), f = I._useDefaultPT(d, c == null || (a = c.pt) === null || a === void 0 || (a = a.directives) === null || a === void 0 ? void 0 : a[e], I._getOptionValue, "hooks.".concat(u)), h = {
      el: r,
      binding: i,
      vnode: o,
      prevVnode: s
    };
    p?.(d, h), f?.(d, h);
  },
  /* eslint-disable-next-line no-unused-vars */
  _mergeProps: function() {
    for (var e = arguments.length > 1 ? arguments[1] : void 0, n = arguments.length, r = new Array(n > 2 ? n - 2 : 0), i = 2; i < n; i++)
      r[i - 2] = arguments[i];
    return pt(e) ? e.apply(void 0, r) : O.apply(void 0, r);
  },
  _extend: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = function(l, a, u, c, d) {
      var p, f, h, g;
      a._$instances = a._$instances || {};
      var v = I._getConfig(u, c), y = a._$instances[e] || {}, b = Ze(y) ? A(A({}, n), n?.methods) : {};
      a._$instances[e] = A(A({}, y), {}, {
        /* new instance variables to pass in directive methods */
        $name: e,
        $host: a,
        $binding: u,
        $modifiers: u?.modifiers,
        $value: u?.value,
        $el: y.$el || a || void 0,
        $style: A({
          classes: void 0,
          inlineStyles: void 0,
          load: function() {
          },
          loadCSS: function() {
          },
          loadStyle: function() {
          }
        }, n?.style),
        $primevueConfig: v,
        $attrSelector: (p = a.$pd) === null || p === void 0 || (p = p[e]) === null || p === void 0 ? void 0 : p.attrSelector,
        /* computed instance variables */
        defaultPT: function() {
          return I._getPT(v?.pt, void 0, function(m) {
            var x;
            return m == null || (x = m.directives) === null || x === void 0 ? void 0 : x[e];
          });
        },
        isUnstyled: function() {
          var m, x;
          return ((m = a._$instances[e]) === null || m === void 0 || (m = m.$binding) === null || m === void 0 || (m = m.value) === null || m === void 0 ? void 0 : m.unstyled) !== void 0 ? (x = a._$instances[e]) === null || x === void 0 || (x = x.$binding) === null || x === void 0 || (x = x.value) === null || x === void 0 ? void 0 : x.unstyled : v?.unstyled;
        },
        theme: function() {
          var m;
          return (m = a._$instances[e]) === null || m === void 0 || (m = m.$primevueConfig) === null || m === void 0 ? void 0 : m.theme;
        },
        preset: function() {
          var m;
          return (m = a._$instances[e]) === null || m === void 0 || (m = m.$binding) === null || m === void 0 || (m = m.value) === null || m === void 0 ? void 0 : m.dt;
        },
        /* instance's methods */
        ptm: function() {
          var m, x = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", P = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return I._getPTValue(a._$instances[e], (m = a._$instances[e]) === null || m === void 0 || (m = m.$binding) === null || m === void 0 || (m = m.value) === null || m === void 0 ? void 0 : m.pt, x, A({}, P));
        },
        ptmo: function() {
          var m = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, x = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", P = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return I._getPTValue(a._$instances[e], m, x, P, !1);
        },
        cx: function() {
          var m, x, P = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", S = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return (m = a._$instances[e]) !== null && m !== void 0 && m.isUnstyled() ? void 0 : I._getOptionValue((x = a._$instances[e]) === null || x === void 0 || (x = x.$style) === null || x === void 0 ? void 0 : x.classes, P, A({}, S));
        },
        sx: function() {
          var m, x = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", P = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, S = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return P ? I._getOptionValue((m = a._$instances[e]) === null || m === void 0 || (m = m.$style) === null || m === void 0 ? void 0 : m.inlineStyles, x, A({}, S)) : void 0;
        }
      }, b), a.$instance = a._$instances[e], (f = (h = a.$instance)[l]) === null || f === void 0 || f.call(h, a, u, c, d), a["$".concat(e)] = a.$instance, I._hook(e, l, a, u, c, d), a.$pd || (a.$pd = {}), a.$pd[e] = A(A({}, (g = a.$pd) === null || g === void 0 ? void 0 : g[e]), {}, {
        name: e,
        instance: a._$instances[e]
      });
    }, i = function(l) {
      var a, u, c, d = l._$instances[e], p = d?.watch, f = function(v) {
        var y, b = v.newValue, _ = v.oldValue;
        return p == null || (y = p.config) === null || y === void 0 ? void 0 : y.call(d, b, _);
      }, h = function(v) {
        var y, b = v.newValue, _ = v.oldValue;
        return p == null || (y = p["config.ripple"]) === null || y === void 0 ? void 0 : y.call(d, b, _);
      };
      d.$watchersCallback = {
        config: f,
        "config.ripple": h
      }, p == null || (a = p.config) === null || a === void 0 || a.call(d, d?.$primevueConfig), ye.on("config:change", f), p == null || (u = p["config.ripple"]) === null || u === void 0 || u.call(d, d == null || (c = d.$primevueConfig) === null || c === void 0 ? void 0 : c.ripple), ye.on("config:ripple:change", h);
    }, o = function(l) {
      var a = l._$instances[e].$watchersCallback;
      a && (ye.off("config:change", a.config), ye.off("config:ripple:change", a["config.ripple"]), l._$instances[e].$watchersCallback = void 0);
    };
    return {
      created: function(l, a, u, c) {
        l.$pd || (l.$pd = {}), l.$pd[e] = {
          name: e,
          attrSelector: So("pd")
        }, r("created", l, a, u, c);
      },
      beforeMount: function(l, a, u, c) {
        var d;
        I._loadStyles((d = l.$pd[e]) === null || d === void 0 ? void 0 : d.instance, a, u), r("beforeMount", l, a, u, c), i(l);
      },
      mounted: function(l, a, u, c) {
        var d;
        I._loadStyles((d = l.$pd[e]) === null || d === void 0 ? void 0 : d.instance, a, u), r("mounted", l, a, u, c);
      },
      beforeUpdate: function(l, a, u, c) {
        r("beforeUpdate", l, a, u, c);
      },
      updated: function(l, a, u, c) {
        var d;
        I._loadStyles((d = l.$pd[e]) === null || d === void 0 ? void 0 : d.instance, a, u), r("updated", l, a, u, c);
      },
      beforeUnmount: function(l, a, u, c) {
        var d;
        o(l), I._removeThemeListeners((d = l.$pd[e]) === null || d === void 0 ? void 0 : d.instance), r("beforeUnmount", l, a, u, c);
      },
      unmounted: function(l, a, u, c) {
        var d;
        (d = l.$pd[e]) === null || d === void 0 || (d = d.instance) === null || d === void 0 || (d = d.scopedStyleEl) === null || d === void 0 || (d = d.value) === null || d === void 0 || d.remove(), r("unmounted", l, a, u, c);
      }
    };
  },
  extend: function() {
    var e = I._getMeta.apply(I, arguments), n = xn(e, 2), r = n[0], i = n[1];
    return A({
      extend: function() {
        var s = I._getMeta.apply(I, arguments), l = xn(s, 2), a = l[0], u = l[1];
        return I.extend(a, A(A(A({}, i), i?.methods), u));
      }
    }, I._extend(r, i));
  }
}, $a = `
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
`, Ca = {
  root: "p-ink"
}, _a = z.extend({
  name: "ripple-directive",
  style: $a,
  classes: Ca
}), Ia = I.extend({
  style: _a
});
function We(t) {
  "@babel/helpers - typeof";
  return We = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, We(t);
}
function Ta(t) {
  return Ea(t) || Aa(t) || La(t) || Pa();
}
function Pa() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function La(t, e) {
  if (t) {
    if (typeof t == "string") return Tt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Tt(t, e) : void 0;
  }
}
function Aa(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Ea(t) {
  if (Array.isArray(t)) return Tt(t);
}
function Tt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function $n(t, e, n) {
  return (e = Va(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Va(t) {
  var e = ja(t, "string");
  return We(e) == "symbol" ? e : e + "";
}
function ja(t, e) {
  if (We(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (We(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var za = Ia.extend("ripple", {
  watch: {
    "config.ripple": function(e) {
      e ? (this.createRipple(this.$host), this.bindEvents(this.$host), this.$host.setAttribute("data-pd-ripple", !0), this.$host.style.overflow = "hidden", this.$host.style.position = "relative") : (this.remove(this.$host), this.$host.removeAttribute("data-pd-ripple"));
    }
  },
  unmounted: function(e) {
    this.remove(e);
  },
  timeout: void 0,
  methods: {
    bindEvents: function(e) {
      e.addEventListener("mousedown", this.onMouseDown.bind(this));
    },
    unbindEvents: function(e) {
      e.removeEventListener("mousedown", this.onMouseDown.bind(this));
    },
    createRipple: function(e) {
      var n = this.getInk(e);
      n || (n = uo("span", $n($n({
        role: "presentation",
        "aria-hidden": !0,
        "data-p-ink": !0,
        "data-p-ink-active": !1,
        class: !this.isUnstyled() && this.cx("root"),
        onAnimationEnd: this.onAnimationEnd.bind(this)
      }, this.$attrSelector, ""), "p-bind", this.ptm("root"))), e.appendChild(n), this.$el = n);
    },
    remove: function(e) {
      var n = this.getInk(e);
      n && (this.$host.style.overflow = "", this.$host.style.position = "", this.unbindEvents(e), n.removeEventListener("animationend", this.onAnimationEnd), n.remove());
    },
    onMouseDown: function(e) {
      var n = this, r = e.currentTarget, i = this.getInk(r);
      if (!(!i || getComputedStyle(i, null).display === "none")) {
        if (!this.isUnstyled() && gt(i, "p-ink-active"), i.setAttribute("data-p-ink-active", "false"), !Se(i) && !xe(i)) {
          var o = Math.max(tr(r), vo(r));
          i.style.height = o + "px", i.style.width = o + "px";
        }
        var s = mo(r), l = e.pageX - s.left + document.body.scrollTop - xe(i) / 2, a = e.pageY - s.top + document.body.scrollLeft - Se(i) / 2;
        i.style.top = a + "px", i.style.left = l + "px", !this.isUnstyled() && to(i, "p-ink-active"), i.setAttribute("data-p-ink-active", "true"), this.timeout = setTimeout(function() {
          i && (!n.isUnstyled() && gt(i, "p-ink-active"), i.setAttribute("data-p-ink-active", "false"));
        }, 401);
      }
    },
    onAnimationEnd: function(e) {
      this.timeout && clearTimeout(this.timeout), !this.isUnstyled() && gt(e.currentTarget, "p-ink-active"), e.currentTarget.setAttribute("data-p-ink-active", "false");
    },
    getInk: function(e) {
      return e && e.children ? Ta(e.children).find(function(n) {
        return po(n, "data-pc-name") === "ripple";
      }) : void 0;
    }
  }
});
function Ge(t) {
  "@babel/helpers - typeof";
  return Ge = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Ge(t);
}
function Ma(t, e) {
  if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function");
}
function Fa(t, e) {
  for (var n = 0; n < e.length; n++) {
    var r = e[n];
    r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(t, Da(r.key), r);
  }
}
function Na(t, e, n) {
  return e && Fa(t.prototype, e), Object.defineProperty(t, "prototype", { writable: !1 }), t;
}
function Da(t) {
  var e = Ra(t, "string");
  return Ge(e) == "symbol" ? e : e + "";
}
function Ra(t, e) {
  if (Ge(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (Ge(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return String(t);
}
var Ba = /* @__PURE__ */ (function() {
  function t(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : function() {
    };
    Ma(this, t), this.element = e, this.listener = n;
  }
  return Na(t, [{
    key: "bindScrollListener",
    value: function() {
      this.scrollableParents = go(this.element);
      for (var n = 0; n < this.scrollableParents.length; n++)
        this.scrollableParents[n].addEventListener("scroll", this.listener);
    }
  }, {
    key: "unbindScrollListener",
    value: function() {
      if (this.scrollableParents)
        for (var n = 0; n < this.scrollableParents.length; n++)
          this.scrollableParents[n].removeEventListener("scroll", this.listener);
    }
  }, {
    key: "destroy",
    value: function() {
      this.unbindScrollListener(), this.element = null, this.listener = null, this.scrollableParents = null;
    }
  }]);
})(), Ha = Rt();
const Ka = "data-wippy-overlay-layer";
function mr() {
  return typeof window < "u" && typeof window.document < "u";
}
function vr() {
  return mr() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function Ua() {
  return vr() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const Wa = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let Ga = 0;
const ct = /* @__PURE__ */ new WeakMap();
function Cn(t, e) {
  const n = t.style;
  n.setProperty("position", "fixed", "important"), n.setProperty("inset", "auto", "important"), n.setProperty("margin", "0", "important"), n.setProperty("position-anchor", e), n.setProperty("position-area", "bottom span-right"), n.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), n.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), n.setProperty("max-width", "stretch", "important");
}
function qa(t, e) {
  if (!Wa.test(t.className))
    return;
  const n = t.style.cssText;
  Cn(t, e), t.getAttribute("popover") !== "manual" && t.setAttribute("popover", "manual");
  try {
    t.matches(":popover-open") || t.showPopover();
  } catch {
  }
  if (!t.matches(":popover-open")) {
    t.removeAttribute("popover"), t.style.cssText = n;
    return;
  }
  if (!ct.has(t)) {
    const r = new MutationObserver(() => {
      const i = t.style;
      (i.top !== "auto" || i.left !== "auto" || i.margin !== "0px" || i.getPropertyPriority("top") !== "important" || i.getPropertyPriority("left") !== "important" || i.getPropertyPriority("margin") !== "important" || i.getPropertyPriority("min-width") !== "important" || i.maxWidth !== "stretch" || i.getPropertyPriority("max-width") !== "important") && Cn(t, e);
    });
    r.observe(t, { attributes: !0, attributeFilter: ["style"] }), ct.set(t, r);
  }
}
function Kt(t) {
  const e = ct.get(t);
  e && (e.disconnect(), ct.delete(t));
}
function Ya(t) {
  const e = t && typeof t.getRootNode == "function" ? t.getRootNode() : null;
  return e instanceof ShadowRoot ? e : null;
}
function Pt(t) {
  t.style.top = "0px", t.style.left = "0px";
  const e = t.getBoundingClientRect();
  t.style.top = `${-window.scrollY - e.top}px`, t.style.left = `${-window.scrollX - e.left}px`;
}
const dt = /* @__PURE__ */ new Set(), Ut = /* @__PURE__ */ new WeakMap();
let _n = !1, Lt = !1;
function Ja() {
  Lt = !1;
  for (const t of dt) {
    if (!t.isConnected) {
      for (const e of Array.from(t.children))
        e instanceof HTMLElement && Kt(e);
      dt.delete(t), Ut.get(t)?.disconnect();
      continue;
    }
    t.childElementCount > 0 && Pt(t);
  }
}
function In() {
  Lt || (Lt = !0, requestAnimationFrame(Ja));
}
function Za(t) {
  const e = document.createElement("div");
  e.setAttribute(Ka, "");
  const n = vr();
  if (e.style.cssText = n ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", n && e.setAttribute("popover", "manual"), t.appendChild(e), n) {
    try {
      e.showPopover();
    } catch {
    }
    e.matches(":popover-open") || (e.removeAttribute("popover"), e.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  Pt(e);
  const r = new MutationObserver((i) => {
    const o = e.__wippyAnchorName;
    for (const s of i) {
      if (o)
        for (const l of Array.from(s.addedNodes))
          l instanceof HTMLElement && qa(l, o);
      for (const l of Array.from(s.removedNodes))
        l instanceof HTMLElement && Kt(l);
    }
    e.isConnected && e.childElementCount > 0 && Pt(e);
  });
  return r.observe(e, { childList: !0 }), Ut.set(e, r), dt.add(e), _n || (_n = !0, window.addEventListener("scroll", In, { capture: !0, passive: !0 }), window.addEventListener("resize", In, { passive: !0 })), e;
}
function Tn(t) {
  if (!(!t.hostRoot || t.layer) && (t.layer = Za(t.hostRoot), Ua())) {
    const e = t.$el ? t.$el.parentElement : null;
    e && (t.anchorName = `--wippy-a-${++Ga}`, t.anchorTrigger = e, e.style.setProperty("anchor-name", t.anchorName), t.layer.__wippyAnchorName = t.anchorName);
  }
}
function Pn(t) {
  if (t.anchorTrigger && (t.anchorTrigger.style.removeProperty("anchor-name"), t.anchorTrigger = null), t.anchorName = null, t.layer) {
    for (const e of Array.from(t.layer.children))
      e instanceof HTMLElement && Kt(e);
    dt.delete(t.layer), Ut.get(t.layer)?.disconnect(), t.layer.remove(), t.layer = null;
  }
}
let Ln = !1;
function Qa() {
  if (Ln)
    return;
  Ln = !0;
  const t = Ht;
  t.computed = t.computed || {}, t.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, t.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, t.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, t.mounted = function() {
    mr() && (this.hostRoot = Ya(this.$el), this.mounted = !0, this.hostRoot && (this.inline || Tn(this), this.$watch("inline", (e) => {
      e ? Pn(this) : Tn(this);
    })));
  }, t.render = function() {
    return this.inline ? M(this.$slots, "default", { key: 0 }) : this.mounted ? ti(Nn, { key: 1, to: this.resolvedTarget || document.body }, [
      M(this.$slots, "default")
    ]) : W("", !0);
  }, t.unmounted = function() {
    Pn(this);
  };
}
const Xa = {
  install: (t) => {
    Qa(), t.use(aa, { theme: "none" });
  }
};
var gr = {
  name: "BlankIcon",
  extends: Ve
};
function es(t) {
  return is(t) || rs(t) || ns(t) || ts();
}
function ts() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ns(t, e) {
  if (t) {
    if (typeof t == "string") return At(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? At(t, e) : void 0;
  }
}
function rs(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function is(t) {
  if (Array.isArray(t)) return At(t);
}
function At(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function os(t, e, n, r, i, o) {
  return k(), C("svg", O({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), es(e[0] || (e[0] = [D("rect", {
    width: "1",
    height: "1",
    fill: "currentColor",
    "fill-opacity": "0"
  }, null, -1)])), 16);
}
gr.render = os;
var yr = {
  name: "CheckIcon",
  extends: Ve
};
function as(t) {
  return cs(t) || us(t) || ls(t) || ss();
}
function ss() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ls(t, e) {
  if (t) {
    if (typeof t == "string") return Et(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Et(t, e) : void 0;
  }
}
function us(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function cs(t) {
  if (Array.isArray(t)) return Et(t);
}
function Et(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function ds(t, e, n, r, i, o) {
  return k(), C("svg", O({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), as(e[0] || (e[0] = [D("path", {
    d: "M4.86199 11.5948C4.78717 11.5923 4.71366 11.5745 4.64596 11.5426C4.57826 11.5107 4.51779 11.4652 4.46827 11.4091L0.753985 7.69483C0.683167 7.64891 0.623706 7.58751 0.580092 7.51525C0.536478 7.44299 0.509851 7.36177 0.502221 7.27771C0.49459 7.19366 0.506156 7.10897 0.536046 7.03004C0.565935 6.95111 0.613367 6.88 0.674759 6.82208C0.736151 6.76416 0.8099 6.72095 0.890436 6.69571C0.970973 6.67046 1.05619 6.66385 1.13966 6.67635C1.22313 6.68886 1.30266 6.72017 1.37226 6.76792C1.44186 6.81567 1.4997 6.8786 1.54141 6.95197L4.86199 10.2503L12.6397 2.49483C12.7444 2.42694 12.8689 2.39617 12.9932 2.40745C13.1174 2.41873 13.2343 2.47141 13.3251 2.55705C13.4159 2.64268 13.4753 2.75632 13.4938 2.87973C13.5123 3.00315 13.4888 3.1292 13.4271 3.23768L5.2557 11.4091C5.20618 11.4652 5.14571 11.5107 5.07801 11.5426C5.01031 11.5745 4.9368 11.5923 4.86199 11.5948Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
yr.render = ds;
var br = {
  name: "ChevronDownIcon",
  extends: Ve
};
function ps(t) {
  return vs(t) || ms(t) || hs(t) || fs();
}
function fs() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function hs(t, e) {
  if (t) {
    if (typeof t == "string") return Vt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Vt(t, e) : void 0;
  }
}
function ms(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function vs(t) {
  if (Array.isArray(t)) return Vt(t);
}
function Vt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function gs(t, e, n, r, i, o) {
  return k(), C("svg", O({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), ps(e[0] || (e[0] = [D("path", {
    d: "M7.01744 10.398C6.91269 10.3985 6.8089 10.378 6.71215 10.3379C6.61541 10.2977 6.52766 10.2386 6.45405 10.1641L1.13907 4.84913C1.03306 4.69404 0.985221 4.5065 1.00399 4.31958C1.02276 4.13266 1.10693 3.95838 1.24166 3.82747C1.37639 3.69655 1.55301 3.61742 1.74039 3.60402C1.92777 3.59062 2.11386 3.64382 2.26584 3.75424L7.01744 8.47394L11.769 3.75424C11.9189 3.65709 12.097 3.61306 12.2748 3.62921C12.4527 3.64535 12.6199 3.72073 12.7498 3.84328C12.8797 3.96582 12.9647 4.12842 12.9912 4.30502C13.0177 4.48162 12.9841 4.662 12.8958 4.81724L7.58083 10.1322C7.50996 10.2125 7.42344 10.2775 7.32656 10.3232C7.22968 10.3689 7.12449 10.3944 7.01744 10.398Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
br.render = gs;
var wr = {
  name: "SearchIcon",
  extends: Ve
};
function ys(t) {
  return xs(t) || Ss(t) || ws(t) || bs();
}
function bs() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ws(t, e) {
  if (t) {
    if (typeof t == "string") return jt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? jt(t, e) : void 0;
  }
}
function Ss(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function xs(t) {
  if (Array.isArray(t)) return jt(t);
}
function jt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function ks(t, e, n, r, i, o) {
  return k(), C("svg", O({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), ys(e[0] || (e[0] = [D("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M2.67602 11.0265C3.6661 11.688 4.83011 12.0411 6.02086 12.0411C6.81149 12.0411 7.59438 11.8854 8.32483 11.5828C8.87005 11.357 9.37808 11.0526 9.83317 10.6803L12.9769 13.8241C13.0323 13.8801 13.0983 13.9245 13.171 13.9548C13.2438 13.985 13.3219 14.0003 13.4007 14C13.4795 14.0003 13.5575 13.985 13.6303 13.9548C13.7031 13.9245 13.7691 13.8801 13.8244 13.8241C13.9367 13.7116 13.9998 13.5592 13.9998 13.4003C13.9998 13.2414 13.9367 13.089 13.8244 12.9765L10.6807 9.8328C11.053 9.37773 11.3573 8.86972 11.5831 8.32452C11.8857 7.59408 12.0414 6.81119 12.0414 6.02056C12.0414 4.8298 11.6883 3.66579 11.0268 2.67572C10.3652 1.68564 9.42494 0.913972 8.32483 0.45829C7.22472 0.00260857 6.01418 -0.116618 4.84631 0.115686C3.67844 0.34799 2.60568 0.921393 1.76369 1.76338C0.921698 2.60537 0.348296 3.67813 0.115991 4.84601C-0.116313 6.01388 0.00291375 7.22441 0.458595 8.32452C0.914277 9.42464 1.68595 10.3649 2.67602 11.0265ZM3.35565 2.0158C4.14456 1.48867 5.07206 1.20731 6.02086 1.20731C7.29317 1.20731 8.51338 1.71274 9.41304 2.6124C10.3127 3.51206 10.8181 4.73226 10.8181 6.00457C10.8181 6.95337 10.5368 7.88088 10.0096 8.66978C9.48251 9.45868 8.73328 10.0736 7.85669 10.4367C6.98011 10.7997 6.01554 10.8947 5.08496 10.7096C4.15439 10.5245 3.2996 10.0676 2.62869 9.39674C1.95778 8.72583 1.50089 7.87104 1.31579 6.94046C1.13068 6.00989 1.22568 5.04532 1.58878 4.16874C1.95187 3.29215 2.56675 2.54292 3.35565 2.0158Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
wr.render = ks;
var Wt = {
  name: "SpinnerIcon",
  extends: Ve
};
function Os(t) {
  return Is(t) || _s(t) || Cs(t) || $s();
}
function $s() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Cs(t, e) {
  if (t) {
    if (typeof t == "string") return zt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? zt(t, e) : void 0;
  }
}
function _s(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Is(t) {
  if (Array.isArray(t)) return zt(t);
}
function zt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function Ts(t, e, n, r, i, o) {
  return k(), C("svg", O({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Os(e[0] || (e[0] = [D("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Wt.render = Ts;
var Sr = {
  name: "TimesIcon",
  extends: Ve
};
function Ps(t) {
  return Vs(t) || Es(t) || As(t) || Ls();
}
function Ls() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function As(t, e) {
  if (t) {
    if (typeof t == "string") return Mt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Mt(t, e) : void 0;
  }
}
function Es(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Vs(t) {
  if (Array.isArray(t)) return Mt(t);
}
function Mt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function js(t, e, n, r, i, o) {
  return k(), C("svg", O({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Ps(e[0] || (e[0] = [D("path", {
    d: "M8.01186 7.00933L12.27 2.75116C12.341 2.68501 12.398 2.60524 12.4375 2.51661C12.4769 2.42798 12.4982 2.3323 12.4999 2.23529C12.5016 2.13827 12.4838 2.0419 12.4474 1.95194C12.4111 1.86197 12.357 1.78024 12.2884 1.71163C12.2198 1.64302 12.138 1.58893 12.0481 1.55259C11.9581 1.51625 11.8617 1.4984 11.7647 1.50011C11.6677 1.50182 11.572 1.52306 11.4834 1.56255C11.3948 1.60204 11.315 1.65898 11.2488 1.72997L6.99067 5.98814L2.7325 1.72997C2.59553 1.60234 2.41437 1.53286 2.22718 1.53616C2.03999 1.53946 1.8614 1.61529 1.72901 1.74767C1.59663 1.88006 1.5208 2.05865 1.5175 2.24584C1.5142 2.43303 1.58368 2.61419 1.71131 2.75116L5.96948 7.00933L1.71131 11.2675C1.576 11.403 1.5 11.5866 1.5 11.7781C1.5 11.9696 1.576 12.1532 1.71131 12.2887C1.84679 12.424 2.03043 12.5 2.2219 12.5C2.41338 12.5 2.59702 12.424 2.7325 12.2887L6.99067 8.03052L11.2488 12.2887C11.3843 12.424 11.568 12.5 11.7594 12.5C11.9509 12.5 12.1346 12.424 12.27 12.2887C12.4053 12.1532 12.4813 11.9696 12.4813 11.7781C12.4813 11.5866 12.4053 11.403 12.27 11.2675L8.01186 7.00933Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Sr.render = js;
var zs = `
    .p-iconfield {
        position: relative;
        display: block;
    }

    .p-inputicon {
        position: absolute;
        top: 50%;
        margin-top: calc(-1 * (dt('icon.size') / 2));
        color: dt('iconfield.icon.color');
        line-height: 1;
        z-index: 1;
    }

    .p-iconfield .p-inputicon:first-child {
        inset-inline-start: dt('form.field.padding.x');
    }

    .p-iconfield .p-inputicon:last-child {
        inset-inline-end: dt('form.field.padding.x');
    }

    .p-iconfield .p-inputtext:not(:first-child),
    .p-iconfield .p-inputwrapper:not(:first-child) .p-inputtext {
        padding-inline-start: calc((dt('form.field.padding.x') * 2) + dt('icon.size'));
    }

    .p-iconfield .p-inputtext:not(:last-child) {
        padding-inline-end: calc((dt('form.field.padding.x') * 2) + dt('icon.size'));
    }

    .p-iconfield:has(.p-inputfield-sm) .p-inputicon {
        font-size: dt('form.field.sm.font.size');
        width: dt('form.field.sm.font.size');
        height: dt('form.field.sm.font.size');
        margin-top: calc(-1 * (dt('form.field.sm.font.size') / 2));
    }

    .p-iconfield:has(.p-inputfield-lg) .p-inputicon {
        font-size: dt('form.field.lg.font.size');
        width: dt('form.field.lg.font.size');
        height: dt('form.field.lg.font.size');
        margin-top: calc(-1 * (dt('form.field.lg.font.size') / 2));
    }
`, Ms = {
  root: "p-iconfield"
}, Fs = z.extend({
  name: "iconfield",
  style: zs,
  classes: Ms
}), Ns = {
  name: "BaseIconField",
  extends: Qe,
  style: Fs,
  provide: function() {
    return {
      $pcIconField: this,
      $parentInstance: this
    };
  }
}, xr = {
  name: "IconField",
  extends: Ns,
  inheritAttrs: !1
};
function Ds(t, e, n, r, i, o) {
  return k(), C("div", O({
    class: t.cx("root")
  }, t.ptmi("root")), [M(t.$slots, "default")], 16);
}
xr.render = Ds;
var Rs = {
  root: "p-inputicon"
}, Bs = z.extend({
  name: "inputicon",
  classes: Rs
}), Hs = {
  name: "BaseInputIcon",
  extends: Qe,
  style: Bs,
  props: {
    class: null
  },
  provide: function() {
    return {
      $pcInputIcon: this,
      $parentInstance: this
    };
  }
}, kr = {
  name: "InputIcon",
  extends: Hs,
  inheritAttrs: !1,
  computed: {
    containerClass: function() {
      return [this.cx("root"), this.class];
    }
  }
};
function Ks(t, e, n, r, i, o) {
  return k(), C("span", O({
    class: o.containerClass
  }, t.ptmi("root"), {
    "aria-hidden": "true"
  }), [M(t.$slots, "default")], 16);
}
kr.render = Ks;
var Us = {
  name: "BaseEditableHolder",
  extends: Qe,
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
      handler: function(e) {
        this.d_value = e;
      }
    },
    defaultValue: function(e) {
      this.d_value = e;
    },
    $formName: {
      immediate: !0,
      handler: function(e) {
        var n, r;
        this.formField = ((n = this.$pcForm) === null || n === void 0 || (r = n.register) === null || r === void 0 ? void 0 : r.call(n, e, this.$formControl)) || {};
      }
    },
    $formControl: {
      immediate: !0,
      handler: function(e) {
        var n, r;
        this.formField = ((n = this.$pcForm) === null || n === void 0 || (r = n.register) === null || r === void 0 ? void 0 : r.call(n, this.$formName, e)) || {};
      }
    },
    $formDefaultValue: {
      immediate: !0,
      handler: function(e) {
        this.d_value !== e && (this.d_value = e);
      }
    },
    $formValue: {
      immediate: !1,
      handler: function(e) {
        var n;
        (n = this.$pcForm) !== null && n !== void 0 && n.getFieldState(this.$formName) && e !== this.d_value && (this.d_value = e);
      }
    }
  },
  formField: {},
  methods: {
    writeValue: function(e, n) {
      var r, i;
      this.controlled && (this.d_value = e, this.$emit("update:modelValue", e)), this.$emit("value-change", e), (r = (i = this.formField).onChange) === null || r === void 0 || r.call(i, {
        originalEvent: n,
        value: e
      });
    },
    // @todo move to @primeuix/utils
    findNonEmpty: function() {
      for (var e = arguments.length, n = new Array(e), r = 0; r < e; r++)
        n[r] = arguments[r];
      return n.find(E);
    }
  },
  computed: {
    $filled: function() {
      return E(this.d_value);
    },
    $invalid: function() {
      var e, n;
      return !this.$formNovalidate && this.findNonEmpty(this.invalid, (e = this.$pcFormField) === null || e === void 0 || (e = e.$field) === null || e === void 0 ? void 0 : e.invalid, (n = this.$pcForm) === null || n === void 0 || (n = n.getFieldState(this.$formName)) === null || n === void 0 ? void 0 : n.invalid);
    },
    $formName: function() {
      var e;
      return this.$formNovalidate ? void 0 : this.name || ((e = this.$formControl) === null || e === void 0 ? void 0 : e.name);
    },
    $formControl: function() {
      var e;
      return this.formControl || ((e = this.$pcFormField) === null || e === void 0 ? void 0 : e.formControl);
    },
    $formNovalidate: function() {
      var e;
      return (e = this.$formControl) === null || e === void 0 ? void 0 : e.novalidate;
    },
    $formDefaultValue: function() {
      var e, n;
      return this.findNonEmpty(this.d_value, (e = this.$pcFormField) === null || e === void 0 ? void 0 : e.initialValue, (n = this.$pcForm) === null || n === void 0 || (n = n.initialValues) === null || n === void 0 ? void 0 : n[this.$formName]);
    },
    $formValue: function() {
      var e, n;
      return this.findNonEmpty((e = this.$pcFormField) === null || e === void 0 || (e = e.$field) === null || e === void 0 ? void 0 : e.value, (n = this.$pcForm) === null || n === void 0 || (n = n.getFieldState(this.$formName)) === null || n === void 0 ? void 0 : n.value);
    },
    controlled: function() {
      return this.$inProps.hasOwnProperty("modelValue") || !this.$inProps.hasOwnProperty("modelValue") && !this.$inProps.hasOwnProperty("defaultValue");
    },
    // @deprecated use $filled instead
    filled: function() {
      return this.$filled;
    }
  }
}, Or = {
  name: "BaseInput",
  extends: Us,
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
      var e;
      return (e = this.variant) !== null && e !== void 0 ? e : this.$primevue.config.inputStyle || this.$primevue.config.inputVariant;
    },
    $fluid: function() {
      var e;
      return (e = this.fluid) !== null && e !== void 0 ? e : !!this.$pcFluid;
    },
    // @deprecated use $fluid instead
    hasFluid: function() {
      return this.$fluid;
    }
  }
}, Ws = `
    .p-inputtext {
        font-family: inherit;
        font-feature-settings: inherit;
        font-size: 1rem;
        color: dt('inputtext.color');
        background: dt('inputtext.background');
        padding-block: dt('inputtext.padding.y');
        padding-inline: dt('inputtext.padding.x');
        border: 1px solid dt('inputtext.border.color');
        transition:
            background dt('inputtext.transition.duration'),
            color dt('inputtext.transition.duration'),
            border-color dt('inputtext.transition.duration'),
            outline-color dt('inputtext.transition.duration'),
            box-shadow dt('inputtext.transition.duration');
        appearance: none;
        border-radius: dt('inputtext.border.radius');
        outline-color: transparent;
        box-shadow: dt('inputtext.shadow');
    }

    .p-inputtext:enabled:hover {
        border-color: dt('inputtext.hover.border.color');
    }

    .p-inputtext:enabled:focus {
        border-color: dt('inputtext.focus.border.color');
        box-shadow: dt('inputtext.focus.ring.shadow');
        outline: dt('inputtext.focus.ring.width') dt('inputtext.focus.ring.style') dt('inputtext.focus.ring.color');
        outline-offset: dt('inputtext.focus.ring.offset');
    }

    .p-inputtext.p-invalid {
        border-color: dt('inputtext.invalid.border.color');
    }

    .p-inputtext.p-variant-filled {
        background: dt('inputtext.filled.background');
    }

    .p-inputtext.p-variant-filled:enabled:hover {
        background: dt('inputtext.filled.hover.background');
    }

    .p-inputtext.p-variant-filled:enabled:focus {
        background: dt('inputtext.filled.focus.background');
    }

    .p-inputtext:disabled {
        opacity: 1;
        background: dt('inputtext.disabled.background');
        color: dt('inputtext.disabled.color');
    }

    .p-inputtext::placeholder {
        color: dt('inputtext.placeholder.color');
    }

    .p-inputtext.p-invalid::placeholder {
        color: dt('inputtext.invalid.placeholder.color');
    }

    .p-inputtext-sm {
        font-size: dt('inputtext.sm.font.size');
        padding-block: dt('inputtext.sm.padding.y');
        padding-inline: dt('inputtext.sm.padding.x');
    }

    .p-inputtext-lg {
        font-size: dt('inputtext.lg.font.size');
        padding-block: dt('inputtext.lg.padding.y');
        padding-inline: dt('inputtext.lg.padding.x');
    }

    .p-inputtext-fluid {
        width: 100%;
    }
`, Gs = {
  root: function(e) {
    var n = e.instance, r = e.props;
    return ["p-inputtext p-component", {
      "p-filled": n.$filled,
      "p-inputtext-sm p-inputfield-sm": r.size === "small",
      "p-inputtext-lg p-inputfield-lg": r.size === "large",
      "p-invalid": n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-inputtext-fluid": n.$fluid
    }];
  }
}, qs = z.extend({
  name: "inputtext",
  style: Ws,
  classes: Gs
}), Ys = {
  name: "BaseInputText",
  extends: Or,
  style: qs,
  provide: function() {
    return {
      $pcInputText: this,
      $parentInstance: this
    };
  }
};
function qe(t) {
  "@babel/helpers - typeof";
  return qe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, qe(t);
}
function Js(t, e, n) {
  return (e = Zs(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Zs(t) {
  var e = Qs(t, "string");
  return qe(e) == "symbol" ? e : e + "";
}
function Qs(t, e) {
  if (qe(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (qe(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var $r = {
  name: "InputText",
  extends: Ys,
  inheritAttrs: !1,
  methods: {
    onInput: function(e) {
      this.writeValue(e.target.value, e);
    }
  },
  computed: {
    attrs: function() {
      return O(this.ptmi("root", {
        context: {
          filled: this.$filled,
          disabled: this.disabled
        }
      }), this.formField);
    },
    dataP: function() {
      return Le(Js({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, Xs = ["value", "name", "disabled", "aria-invalid", "data-p"];
function el(t, e, n, r, i, o) {
  return k(), C("input", O({
    type: "text",
    class: t.cx("root"),
    value: t.d_value,
    name: t.name,
    disabled: t.disabled,
    "aria-invalid": t.$invalid || void 0,
    "data-p": o.dataP,
    onInput: e[0] || (e[0] = function() {
      return o.onInput && o.onInput.apply(o, arguments);
    })
  }, o.attrs), null, 16, Xs);
}
$r.render = el;
var tl = `
    .p-virtualscroller-loader {
        background: dt('virtualscroller.loader.mask.background');
        color: dt('virtualscroller.loader.mask.color');
    }

    .p-virtualscroller-loading-icon {
        font-size: dt('virtualscroller.loader.icon.size');
        width: dt('virtualscroller.loader.icon.size');
        height: dt('virtualscroller.loader.icon.size');
    }
`, nl = `
.p-virtualscroller {
    position: relative;
    overflow: auto;
    contain: strict;
    transform: translateZ(0);
    will-change: scroll-position;
    outline: 0 none;
}

.p-virtualscroller-content {
    position: absolute;
    top: 0;
    left: 0;
    min-height: 100%;
    min-width: 100%;
    will-change: transform;
}

.p-virtualscroller-spacer {
    position: absolute;
    top: 0;
    left: 0;
    height: 1px;
    width: 1px;
    transform-origin: 0 0;
    pointer-events: none;
}

.p-virtualscroller-loader {
    position: sticky;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.p-virtualscroller-loader-mask {
    display: flex;
    align-items: center;
    justify-content: center;
}

.p-virtualscroller-horizontal > .p-virtualscroller-content {
    display: flex;
}

.p-virtualscroller-inline .p-virtualscroller-content {
    position: static;
}

.p-virtualscroller .p-virtualscroller-loading {
    transform: none !important;
    min-height: 0;
    position: sticky;
    inset-block-start: 0;
    inset-inline-start: 0;
}
`, An = z.extend({
  name: "virtualscroller",
  css: nl,
  style: tl
}), rl = {
  name: "BaseVirtualScroller",
  extends: Qe,
  props: {
    id: {
      type: String,
      default: null
    },
    style: null,
    class: null,
    items: {
      type: Array,
      default: null
    },
    itemSize: {
      type: [Number, Array],
      default: 0
    },
    scrollHeight: null,
    scrollWidth: null,
    orientation: {
      type: String,
      default: "vertical"
    },
    numToleratedItems: {
      type: Number,
      default: null
    },
    delay: {
      type: Number,
      default: 0
    },
    resizeDelay: {
      type: Number,
      default: 10
    },
    lazy: {
      type: Boolean,
      default: !1
    },
    disabled: {
      type: Boolean,
      default: !1
    },
    loaderDisabled: {
      type: Boolean,
      default: !1
    },
    columns: {
      type: Array,
      default: null
    },
    loading: {
      type: Boolean,
      default: !1
    },
    showSpacer: {
      type: Boolean,
      default: !0
    },
    showLoader: {
      type: Boolean,
      default: !1
    },
    tabindex: {
      type: Number,
      default: 0
    },
    inline: {
      type: Boolean,
      default: !1
    },
    step: {
      type: Number,
      default: 0
    },
    appendOnly: {
      type: Boolean,
      default: !1
    },
    autoSize: {
      type: Boolean,
      default: !1
    }
  },
  style: An,
  provide: function() {
    return {
      $pcVirtualScroller: this,
      $parentInstance: this
    };
  },
  beforeMount: function() {
    var e;
    An.loadCSS({
      nonce: (e = this.$primevueConfig) === null || e === void 0 || (e = e.csp) === null || e === void 0 ? void 0 : e.nonce
    });
  }
};
function Ye(t) {
  "@babel/helpers - typeof";
  return Ye = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Ye(t);
}
function En(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(t, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function ze(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? En(Object(n), !0).forEach(function(r) {
      Cr(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : En(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function Cr(t, e, n) {
  return (e = il(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function il(t) {
  var e = ol(t, "string");
  return Ye(e) == "symbol" ? e : e + "";
}
function ol(t, e) {
  if (Ye(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (Ye(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var _r = {
  name: "VirtualScroller",
  extends: rl,
  inheritAttrs: !1,
  emits: ["update:numToleratedItems", "scroll", "scroll-index-change", "lazy-load"],
  data: function() {
    var e = this.isBoth();
    return {
      first: e ? {
        rows: 0,
        cols: 0
      } : 0,
      last: e ? {
        rows: 0,
        cols: 0
      } : 0,
      page: e ? {
        rows: 0,
        cols: 0
      } : 0,
      numItemsInViewport: e ? {
        rows: 0,
        cols: 0
      } : 0,
      lastScrollPos: e ? {
        top: 0,
        left: 0
      } : 0,
      d_numToleratedItems: this.numToleratedItems,
      d_loading: this.loading,
      loaderArr: [],
      spacerStyle: {},
      contentStyle: {}
    };
  },
  element: null,
  content: null,
  lastScrollPos: null,
  scrollTimeout: null,
  resizeTimeout: null,
  defaultWidth: 0,
  defaultHeight: 0,
  defaultContentWidth: 0,
  defaultContentHeight: 0,
  isRangeChanged: !1,
  lazyLoadState: {},
  resizeListener: null,
  resizeObserver: null,
  initialized: !1,
  watch: {
    numToleratedItems: function(e) {
      this.d_numToleratedItems = e;
    },
    loading: function(e, n) {
      this.lazy && e !== n && e !== this.d_loading && (this.d_loading = e);
    },
    items: {
      handler: function(e, n) {
        (!n || n.length !== (e || []).length) && (this.init(), this.calculateAutoSize());
      },
      deep: !0
    },
    itemSize: function() {
      this.init(), this.calculateAutoSize();
    },
    orientation: function() {
      this.lastScrollPos = this.isBoth() ? {
        top: 0,
        left: 0
      } : 0;
    },
    scrollHeight: function() {
      this.init(), this.calculateAutoSize();
    },
    scrollWidth: function() {
      this.init(), this.calculateAutoSize();
    }
  },
  mounted: function() {
    this.viewInit(), this.lastScrollPos = this.isBoth() ? {
      top: 0,
      left: 0
    } : 0, this.lazyLoadState = this.lazyLoadState || {};
  },
  updated: function() {
    !this.initialized && this.viewInit();
  },
  unmounted: function() {
    this.unbindResizeListener(), this.initialized = !1;
  },
  methods: {
    viewInit: function() {
      lt(this.element) && (this.setContentEl(this.content), this.init(), this.calculateAutoSize(), this.defaultWidth = xe(this.element), this.defaultHeight = Se(this.element), this.defaultContentWidth = xe(this.content), this.defaultContentHeight = Se(this.content), this.initialized = !0), this.element && this.bindResizeListener();
    },
    init: function() {
      this.disabled || (this.setSize(), this.calculateOptions(), this.setSpacerSize());
    },
    isVertical: function() {
      return this.orientation === "vertical";
    },
    isHorizontal: function() {
      return this.orientation === "horizontal";
    },
    isBoth: function() {
      return this.orientation === "both";
    },
    scrollTo: function(e) {
      this.element && this.element.scrollTo(e);
    },
    scrollToIndex: function(e) {
      var n = this, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "auto", i = this.isBoth(), o = this.isHorizontal(), s = i ? e.every(function(S) {
        return S > -1;
      }) : e > -1;
      if (s) {
        var l = this.first, a = this.element, u = a.scrollTop, c = u === void 0 ? 0 : u, d = a.scrollLeft, p = d === void 0 ? 0 : d, f = this.calculateNumItems(), h = f.numToleratedItems, g = this.getContentPosition(), v = this.itemSize, y = function() {
          var L = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, R = arguments.length > 1 ? arguments[1] : void 0;
          return L <= R ? 0 : L;
        }, b = function(L, R, B) {
          return L * R + B;
        }, _ = function() {
          var L = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, R = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return n.scrollTo({
            left: L,
            top: R,
            behavior: r
          });
        }, m = i ? {
          rows: 0,
          cols: 0
        } : 0, x = !1, P = !1;
        i ? (m = {
          rows: y(e[0], h[0]),
          cols: y(e[1], h[1])
        }, _(b(m.cols, v[1], g.left), b(m.rows, v[0], g.top)), P = this.lastScrollPos.top !== c || this.lastScrollPos.left !== p, x = m.rows !== l.rows || m.cols !== l.cols) : (m = y(e, h), o ? _(b(m, v, g.left), c) : _(p, b(m, v, g.top)), P = this.lastScrollPos !== (o ? p : c), x = m !== l), this.isRangeChanged = x, P && (this.first = m);
      }
    },
    scrollInView: function(e, n) {
      var r = this, i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "auto";
      if (n) {
        var o = this.isBoth(), s = this.isHorizontal(), l = o ? e.every(function(v) {
          return v > -1;
        }) : e > -1;
        if (l) {
          var a = this.getRenderedRange(), u = a.first, c = a.viewport, d = function() {
            var y = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, b = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
            return r.scrollTo({
              left: y,
              top: b,
              behavior: i
            });
          }, p = n === "to-start", f = n === "to-end";
          if (p) {
            if (o)
              c.first.rows - u.rows > e[0] ? d(c.first.cols * this.itemSize[1], (c.first.rows - 1) * this.itemSize[0]) : c.first.cols - u.cols > e[1] && d((c.first.cols - 1) * this.itemSize[1], c.first.rows * this.itemSize[0]);
            else if (c.first - u > e) {
              var h = (c.first - 1) * this.itemSize;
              s ? d(h, 0) : d(0, h);
            }
          } else if (f) {
            if (o)
              c.last.rows - u.rows <= e[0] + 1 ? d(c.first.cols * this.itemSize[1], (c.first.rows + 1) * this.itemSize[0]) : c.last.cols - u.cols <= e[1] + 1 && d((c.first.cols + 1) * this.itemSize[1], c.first.rows * this.itemSize[0]);
            else if (c.last - u <= e + 1) {
              var g = (c.first + 1) * this.itemSize;
              s ? d(g, 0) : d(0, g);
            }
          }
        }
      } else
        this.scrollToIndex(e, i);
    },
    getRenderedRange: function() {
      var e = function(d, p) {
        return Math.floor(d / (p || d));
      }, n = this.first, r = 0;
      if (this.element) {
        var i = this.isBoth(), o = this.isHorizontal(), s = this.element, l = s.scrollTop, a = s.scrollLeft;
        if (i)
          n = {
            rows: e(l, this.itemSize[0]),
            cols: e(a, this.itemSize[1])
          }, r = {
            rows: n.rows + this.numItemsInViewport.rows,
            cols: n.cols + this.numItemsInViewport.cols
          };
        else {
          var u = o ? a : l;
          n = e(u, this.itemSize), r = n + this.numItemsInViewport;
        }
      }
      return {
        first: this.first,
        last: this.last,
        viewport: {
          first: n,
          last: r
        }
      };
    },
    calculateNumItems: function() {
      var e = this.isBoth(), n = this.isHorizontal(), r = this.itemSize, i = this.getContentPosition(), o = this.element ? this.element.offsetWidth - i.left : 0, s = this.element ? this.element.offsetHeight - i.top : 0, l = function(p, f) {
        return Math.ceil(p / (f || p));
      }, a = function(p) {
        return Math.ceil(p / 2);
      }, u = e ? {
        rows: l(s, r[0]),
        cols: l(o, r[1])
      } : l(n ? o : s, r), c = this.d_numToleratedItems || (e ? [a(u.rows), a(u.cols)] : a(u));
      return {
        numItemsInViewport: u,
        numToleratedItems: c
      };
    },
    calculateOptions: function() {
      var e = this, n = this.isBoth(), r = this.first, i = this.calculateNumItems(), o = i.numItemsInViewport, s = i.numToleratedItems, l = function(c, d, p) {
        var f = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !1;
        return e.getLast(c + d + (c < p ? 2 : 3) * p, f);
      }, a = n ? {
        rows: l(r.rows, o.rows, s[0]),
        cols: l(r.cols, o.cols, s[1], !0)
      } : l(r, o, s);
      this.last = a, this.numItemsInViewport = o, this.d_numToleratedItems = s, this.$emit("update:numToleratedItems", this.d_numToleratedItems), this.showLoader && (this.loaderArr = n ? Array.from({
        length: o.rows
      }).map(function() {
        return Array.from({
          length: o.cols
        });
      }) : Array.from({
        length: o
      })), this.lazy && Promise.resolve().then(function() {
        var u;
        e.lazyLoadState = {
          first: e.step ? n ? {
            rows: 0,
            cols: r.cols
          } : 0 : r,
          last: Math.min(e.step ? e.step : a, ((u = e.items) === null || u === void 0 ? void 0 : u.length) || 0)
        }, e.$emit("lazy-load", e.lazyLoadState);
      });
    },
    calculateAutoSize: function() {
      var e = this;
      this.autoSize && !this.d_loading && Promise.resolve().then(function() {
        if (e.content) {
          var n = e.isBoth(), r = e.isHorizontal(), i = e.isVertical();
          e.content.style.minHeight = e.content.style.minWidth = "auto", e.content.style.position = "relative", e.element.style.contain = "none";
          var o = [xe(e.element), Se(e.element)], s = o[0], l = o[1];
          (n || r) && (e.element.style.width = s < e.defaultWidth ? s + "px" : e.scrollWidth || e.defaultWidth + "px"), (n || i) && (e.element.style.height = l < e.defaultHeight ? l + "px" : e.scrollHeight || e.defaultHeight + "px"), e.content.style.minHeight = e.content.style.minWidth = "", e.content.style.position = "", e.element.style.contain = "";
        }
      });
    },
    getLast: function() {
      var e, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, i = arguments.length > 1 ? arguments[1] : void 0;
      return this.items ? Math.min(i ? ((e = this.columns || this.items[0]) === null || e === void 0 ? void 0 : e.length) || 0 : ((n = this.items) === null || n === void 0 ? void 0 : n.length) || 0, r) : 0;
    },
    getContentPosition: function() {
      if (this.content) {
        var e = getComputedStyle(this.content), n = parseFloat(e.paddingLeft) + Math.max(parseFloat(e.left) || 0, 0), r = parseFloat(e.paddingRight) + Math.max(parseFloat(e.right) || 0, 0), i = parseFloat(e.paddingTop) + Math.max(parseFloat(e.top) || 0, 0), o = parseFloat(e.paddingBottom) + Math.max(parseFloat(e.bottom) || 0, 0);
        return {
          left: n,
          right: r,
          top: i,
          bottom: o,
          x: n + r,
          y: i + o
        };
      }
      return {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        x: 0,
        y: 0
      };
    },
    setSize: function() {
      var e = this;
      if (this.element) {
        var n = this.isBoth(), r = this.isHorizontal(), i = this.element.parentElement, o = this.scrollWidth || "".concat(this.element.offsetWidth || i.offsetWidth, "px"), s = this.scrollHeight || "".concat(this.element.offsetHeight || i.offsetHeight, "px"), l = function(u, c) {
          return e.element.style[u] = c;
        };
        n || r ? (l("height", s), l("width", o)) : l("height", s);
      }
    },
    setSpacerSize: function() {
      var e = this, n = this.items;
      if (n) {
        var r = this.isBoth(), i = this.isHorizontal(), o = this.getContentPosition(), s = function(a, u, c) {
          var d = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 0;
          return e.spacerStyle = ze(ze({}, e.spacerStyle), Cr({}, "".concat(a), (u || []).length * c + d + "px"));
        };
        r ? (s("height", n, this.itemSize[0], o.y), s("width", this.columns || n[1], this.itemSize[1], o.x)) : i ? s("width", this.columns || n, this.itemSize, o.x) : s("height", n, this.itemSize, o.y);
      }
    },
    setContentPosition: function(e) {
      var n = this;
      if (this.content && !this.appendOnly) {
        var r = this.isBoth(), i = this.isHorizontal(), o = e ? e.first : this.first, s = function(c, d) {
          return c * d;
        }, l = function() {
          var c = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, d = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return n.contentStyle = ze(ze({}, n.contentStyle), {
            transform: "translate3d(".concat(c, "px, ").concat(d, "px, 0)")
          });
        };
        if (r)
          l(s(o.cols, this.itemSize[1]), s(o.rows, this.itemSize[0]));
        else {
          var a = s(o, this.itemSize);
          i ? l(a, 0) : l(0, a);
        }
      }
    },
    onScrollPositionChange: function(e) {
      var n = this, r = e.target, i = this.isBoth(), o = this.isHorizontal(), s = this.getContentPosition(), l = function(V, F) {
        return V ? V > F ? V - F : V : 0;
      }, a = function(V, F) {
        return Math.floor(V / (F || V));
      }, u = function(V, F, J, Z, K, G) {
        return V <= K ? K : G ? J - Z - K : F + K - 1;
      }, c = function(V, F, J, Z, K, G, w, $) {
        if (V <= G) return 0;
        var H = Math.max(0, w ? V < F ? J : V - G : V > F ? J : V - 2 * G), Q = n.getLast(H, $);
        return H > Q ? Q - K : H;
      }, d = function(V, F, J, Z, K, G) {
        var w = F + Z + 2 * K;
        return V >= K && (w += K + 1), n.getLast(w, G);
      }, p = l(r.scrollTop, s.top), f = l(r.scrollLeft, s.left), h = i ? {
        rows: 0,
        cols: 0
      } : 0, g = this.last, v = !1, y = this.lastScrollPos;
      if (i) {
        var b = this.lastScrollPos.top <= p, _ = this.lastScrollPos.left <= f;
        if (!this.appendOnly || this.appendOnly && (b || _)) {
          var m = {
            rows: a(p, this.itemSize[0]),
            cols: a(f, this.itemSize[1])
          }, x = {
            rows: u(m.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], b),
            cols: u(m.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], _)
          };
          h = {
            rows: c(m.rows, x.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], b),
            cols: c(m.cols, x.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], _, !0)
          }, g = {
            rows: d(m.rows, h.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0]),
            cols: d(m.cols, h.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], !0)
          }, v = h.rows !== this.first.rows || g.rows !== this.last.rows || h.cols !== this.first.cols || g.cols !== this.last.cols || this.isRangeChanged, y = {
            top: p,
            left: f
          };
        }
      } else {
        var P = o ? f : p, S = this.lastScrollPos <= P;
        if (!this.appendOnly || this.appendOnly && S) {
          var L = a(P, this.itemSize), R = u(L, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, S);
          h = c(L, R, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, S), g = d(L, h, this.last, this.numItemsInViewport, this.d_numToleratedItems), v = h !== this.first || g !== this.last || this.isRangeChanged, y = P;
        }
      }
      return {
        first: h,
        last: g,
        isRangeChanged: v,
        scrollPos: y
      };
    },
    onScrollChange: function(e) {
      var n = this.onScrollPositionChange(e), r = n.first, i = n.last, o = n.isRangeChanged, s = n.scrollPos;
      if (o) {
        var l = {
          first: r,
          last: i
        };
        if (this.setContentPosition(l), this.first = r, this.last = i, this.lastScrollPos = s, this.$emit("scroll-index-change", l), this.lazy && this.isPageChanged(r)) {
          var a, u, c = {
            first: this.step ? Math.min(this.getPageByFirst(r) * this.step, (((a = this.items) === null || a === void 0 ? void 0 : a.length) || 0) - this.step) : r,
            last: Math.min(this.step ? (this.getPageByFirst(r) + 1) * this.step : i, ((u = this.items) === null || u === void 0 ? void 0 : u.length) || 0)
          }, d = this.lazyLoadState.first !== c.first || this.lazyLoadState.last !== c.last;
          d && this.$emit("lazy-load", c), this.lazyLoadState = c;
        }
      }
    },
    onScroll: function(e) {
      var n = this;
      if (this.$emit("scroll", e), this.delay) {
        if (this.scrollTimeout && clearTimeout(this.scrollTimeout), this.isPageChanged()) {
          if (!this.d_loading && this.showLoader) {
            var r = this.onScrollPositionChange(e), i = r.isRangeChanged, o = i || (this.step ? this.isPageChanged() : !1);
            o && (this.d_loading = !0);
          }
          this.scrollTimeout = setTimeout(function() {
            n.onScrollChange(e), n.d_loading && n.showLoader && (!n.lazy || n.loading === void 0) && (n.d_loading = !1, n.page = n.getPageByFirst());
          }, this.delay);
        }
      } else
        this.onScrollChange(e);
    },
    onResize: function() {
      var e = this;
      this.resizeTimeout && clearTimeout(this.resizeTimeout), this.resizeTimeout = setTimeout(function() {
        if (lt(e.element)) {
          var n = e.isBoth(), r = e.isVertical(), i = e.isHorizontal(), o = [xe(e.element), Se(e.element)], s = o[0], l = o[1], a = s !== e.defaultWidth, u = l !== e.defaultHeight, c = n ? a || u : i ? a : r ? u : !1;
          c && (e.d_numToleratedItems = e.numToleratedItems, e.defaultWidth = s, e.defaultHeight = l, e.defaultContentWidth = xe(e.content), e.defaultContentHeight = Se(e.content), e.init());
        }
      }, this.resizeDelay);
    },
    bindResizeListener: function() {
      var e = this;
      this.resizeListener || (this.resizeListener = this.onResize.bind(this), window.addEventListener("resize", this.resizeListener), window.addEventListener("orientationchange", this.resizeListener), this.resizeObserver = new ResizeObserver(function() {
        e.onResize();
      }), this.resizeObserver.observe(this.element));
    },
    unbindResizeListener: function() {
      this.resizeListener && (window.removeEventListener("resize", this.resizeListener), window.removeEventListener("orientationchange", this.resizeListener), this.resizeListener = null), this.resizeObserver && (this.resizeObserver.disconnect(), this.resizeObserver = null);
    },
    getOptions: function(e) {
      var n = (this.items || []).length, r = this.isBoth() ? this.first.rows + e : this.first + e;
      return {
        index: r,
        count: n,
        first: r === 0,
        last: r === n - 1,
        even: r % 2 === 0,
        odd: r % 2 !== 0
      };
    },
    getLoaderOptions: function(e, n) {
      var r = this.loaderArr.length;
      return ze({
        index: e,
        count: r,
        first: e === 0,
        last: e === r - 1,
        even: e % 2 === 0,
        odd: e % 2 !== 0
      }, n);
    },
    getPageByFirst: function(e) {
      return Math.floor(((e ?? this.first) + this.d_numToleratedItems * 4) / (this.step || 1));
    },
    isPageChanged: function(e) {
      return this.step && !this.lazy ? this.page !== this.getPageByFirst(e ?? this.first) : !0;
    },
    setContentEl: function(e) {
      this.content = e || this.content || ft(this.element, '[data-pc-section="content"]');
    },
    elementRef: function(e) {
      this.element = e;
    },
    contentRef: function(e) {
      this.content = e;
    }
  },
  computed: {
    containerClass: function() {
      return ["p-virtualscroller", this.class, {
        "p-virtualscroller-inline": this.inline,
        "p-virtualscroller-both p-both-scroll": this.isBoth(),
        "p-virtualscroller-horizontal p-horizontal-scroll": this.isHorizontal()
      }];
    },
    contentClass: function() {
      return ["p-virtualscroller-content", {
        "p-virtualscroller-loading": this.d_loading
      }];
    },
    loaderClass: function() {
      return ["p-virtualscroller-loader", {
        "p-virtualscroller-loader-mask": !this.$slots.loader
      }];
    },
    loadedItems: function() {
      var e = this;
      return this.items && !this.d_loading ? this.isBoth() ? this.items.slice(this.appendOnly ? 0 : this.first.rows, this.last.rows).map(function(n) {
        return e.columns ? n : n.slice(e.appendOnly ? 0 : e.first.cols, e.last.cols);
      }) : this.isHorizontal() && this.columns ? this.items : this.items.slice(this.appendOnly ? 0 : this.first, this.last) : [];
    },
    loadedRows: function() {
      return this.d_loading ? this.loaderDisabled ? this.loaderArr : [] : this.loadedItems;
    },
    loadedColumns: function() {
      if (this.columns) {
        var e = this.isBoth(), n = this.isHorizontal();
        if (e || n)
          return this.d_loading && this.loaderDisabled ? e ? this.loaderArr[0] : this.loaderArr : this.columns.slice(e ? this.first.cols : this.first, e ? this.last.cols : this.last);
      }
      return this.columns;
    }
  },
  components: {
    SpinnerIcon: Wt
  }
}, al = ["tabindex"];
function sl(t, e, n, r, i, o) {
  var s = se("SpinnerIcon");
  return t.disabled ? (k(), C(he, {
    key: 1
  }, [M(t.$slots, "default"), M(t.$slots, "content", {
    items: t.items,
    rows: t.items,
    columns: o.loadedColumns
  })], 64)) : (k(), C("div", O({
    key: 0,
    ref: o.elementRef,
    class: o.containerClass,
    tabindex: t.tabindex,
    style: t.style,
    onScroll: e[0] || (e[0] = function() {
      return o.onScroll && o.onScroll.apply(o, arguments);
    })
  }, t.ptmi("root")), [M(t.$slots, "content", {
    styleClass: o.contentClass,
    items: o.loadedItems,
    getItemOptions: o.getOptions,
    loading: i.d_loading,
    getLoaderOptions: o.getLoaderOptions,
    itemSize: t.itemSize,
    rows: o.loadedRows,
    columns: o.loadedColumns,
    contentRef: o.contentRef,
    spacerStyle: i.spacerStyle,
    contentStyle: i.contentStyle,
    vertical: o.isVertical(),
    horizontal: o.isHorizontal(),
    both: o.isBoth()
  }, function() {
    return [D("div", O({
      ref: o.contentRef,
      class: o.contentClass,
      style: i.contentStyle
    }, t.ptm("content")), [(k(!0), C(he, null, at(o.loadedItems, function(l, a) {
      return M(t.$slots, "item", {
        key: a,
        item: l,
        options: o.getOptions(a)
      });
    }), 128))], 16)];
  }), t.showSpacer ? (k(), C("div", O({
    key: 0,
    class: "p-virtualscroller-spacer",
    style: i.spacerStyle
  }, t.ptm("spacer")), null, 16)) : W("", !0), !t.loaderDisabled && t.showLoader && i.d_loading ? (k(), C("div", O({
    key: 1,
    class: o.loaderClass
  }, t.ptm("loader")), [t.$slots && t.$slots.loader ? (k(!0), C(he, {
    key: 0
  }, at(i.loaderArr, function(l, a) {
    return M(t.$slots, "loader", {
      key: a,
      options: o.getLoaderOptions(a, o.isBoth() && {
        numCols: t.d_numItemsInViewport.cols
      })
    });
  }), 128)) : W("", !0), M(t.$slots, "loadingicon", {}, function() {
    return [le(s, O({
      spin: "",
      class: "p-virtualscroller-loading-icon"
    }, t.ptm("loadingIcon")), null, 16)];
  })], 16)) : W("", !0)], 16, al));
}
_r.render = sl;
var ll = `
    .p-select {
        display: inline-flex;
        cursor: pointer;
        position: relative;
        user-select: none;
        background: dt('select.background');
        border: 1px solid dt('select.border.color');
        transition:
            background dt('select.transition.duration'),
            color dt('select.transition.duration'),
            border-color dt('select.transition.duration'),
            outline-color dt('select.transition.duration'),
            box-shadow dt('select.transition.duration');
        border-radius: dt('select.border.radius');
        outline-color: transparent;
        box-shadow: dt('select.shadow');
    }

    .p-select:not(.p-disabled):hover {
        border-color: dt('select.hover.border.color');
    }

    .p-select:not(.p-disabled).p-focus {
        border-color: dt('select.focus.border.color');
        box-shadow: dt('select.focus.ring.shadow');
        outline: dt('select.focus.ring.width') dt('select.focus.ring.style') dt('select.focus.ring.color');
        outline-offset: dt('select.focus.ring.offset');
    }

    .p-select.p-variant-filled {
        background: dt('select.filled.background');
    }

    .p-select.p-variant-filled:not(.p-disabled):hover {
        background: dt('select.filled.hover.background');
    }

    .p-select.p-variant-filled:not(.p-disabled).p-focus {
        background: dt('select.filled.focus.background');
    }

    .p-select.p-invalid {
        border-color: dt('select.invalid.border.color');
    }

    .p-select.p-disabled {
        opacity: 1;
        background: dt('select.disabled.background');
    }

    .p-select-clear-icon {
        align-self: center;
        color: dt('select.clear.icon.color');
        inset-inline-end: dt('select.dropdown.width');
    }

    .p-select-dropdown {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        background: transparent;
        color: dt('select.dropdown.color');
        width: dt('select.dropdown.width');
        border-start-end-radius: dt('select.border.radius');
        border-end-end-radius: dt('select.border.radius');
    }

    .p-select-label {
        display: block;
        white-space: nowrap;
        overflow: hidden;
        flex: 1 1 auto;
        width: 1%;
        padding: dt('select.padding.y') dt('select.padding.x');
        text-overflow: ellipsis;
        cursor: pointer;
        color: dt('select.color');
        background: transparent;
        border: 0 none;
        outline: 0 none;
        font-size: 1rem;
    }

    .p-select-label.p-placeholder {
        color: dt('select.placeholder.color');
    }

    .p-select.p-invalid .p-select-label.p-placeholder {
        color: dt('select.invalid.placeholder.color');
    }

    .p-select.p-disabled .p-select-label {
        color: dt('select.disabled.color');
    }

    .p-select-label-empty {
        overflow: hidden;
        opacity: 0;
    }

    input.p-select-label {
        cursor: default;
    }

    .p-select-overlay {
        position: absolute;
        top: 0;
        left: 0;
        background: dt('select.overlay.background');
        color: dt('select.overlay.color');
        border: 1px solid dt('select.overlay.border.color');
        border-radius: dt('select.overlay.border.radius');
        box-shadow: dt('select.overlay.shadow');
        min-width: 100%;
        transform-origin: inherit;
        will-change: transform;
    }

    .p-select-header {
        padding: dt('select.list.header.padding');
    }

    .p-select-filter {
        width: 100%;
    }

    .p-select-list-container {
        overflow: auto;
    }

    .p-select-option-group {
        cursor: auto;
        margin: 0;
        padding: dt('select.option.group.padding');
        background: dt('select.option.group.background');
        color: dt('select.option.group.color');
        font-weight: dt('select.option.group.font.weight');
    }

    .p-select-list {
        margin: 0;
        padding: 0;
        list-style-type: none;
        padding: dt('select.list.padding');
        gap: dt('select.list.gap');
        display: flex;
        flex-direction: column;
    }

    .p-select-option {
        cursor: pointer;
        font-weight: normal;
        white-space: nowrap;
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: center;
        padding: dt('select.option.padding');
        border: 0 none;
        color: dt('select.option.color');
        background: transparent;
        transition:
            background dt('select.transition.duration'),
            color dt('select.transition.duration'),
            border-color dt('select.transition.duration'),
            box-shadow dt('select.transition.duration'),
            outline-color dt('select.transition.duration');
        border-radius: dt('select.option.border.radius');
    }

    .p-select-option:not(.p-select-option-selected):not(.p-disabled).p-focus {
        background: dt('select.option.focus.background');
        color: dt('select.option.focus.color');
    }

    .p-select-option:not(.p-select-option-selected):not(.p-disabled):hover {
        background: dt('select.option.focus.background');
        color: dt('select.option.focus.color');
    }

    .p-select-option.p-select-option-selected {
        background: dt('select.option.selected.background');
        color: dt('select.option.selected.color');
    }

    .p-select-option.p-select-option-selected.p-focus {
        background: dt('select.option.selected.focus.background');
        color: dt('select.option.selected.focus.color');
    }
   
    .p-select-option-blank-icon {
        flex-shrink: 0;
    }

    .p-select-option-check-icon {
        position: relative;
        flex-shrink: 0;
        margin-inline-start: dt('select.checkmark.gutter.start');
        margin-inline-end: dt('select.checkmark.gutter.end');
        color: dt('select.checkmark.color');
    }

    .p-select-empty-message {
        padding: dt('select.empty.message.padding');
    }

    .p-select-fluid {
        display: flex;
        width: 100%;
    }

    .p-select-sm .p-select-label {
        font-size: dt('select.sm.font.size');
        padding-block: dt('select.sm.padding.y');
        padding-inline: dt('select.sm.padding.x');
    }

    .p-select-sm .p-select-dropdown .p-icon {
        font-size: dt('select.sm.font.size');
        width: dt('select.sm.font.size');
        height: dt('select.sm.font.size');
    }

    .p-select-lg .p-select-label {
        font-size: dt('select.lg.font.size');
        padding-block: dt('select.lg.padding.y');
        padding-inline: dt('select.lg.padding.x');
    }

    .p-select-lg .p-select-dropdown .p-icon {
        font-size: dt('select.lg.font.size');
        width: dt('select.lg.font.size');
        height: dt('select.lg.font.size');
    }

    .p-floatlabel-in .p-select-filter {
        padding-block-start: dt('select.padding.y');
        padding-block-end: dt('select.padding.y');
    }
`, ul = {
  root: function(e) {
    var n = e.instance, r = e.props, i = e.state;
    return ["p-select p-component p-inputwrapper", {
      "p-disabled": r.disabled,
      "p-invalid": n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-focus": i.focused,
      "p-inputwrapper-filled": n.$filled,
      "p-inputwrapper-focus": i.focused || i.overlayVisible,
      "p-select-open": i.overlayVisible,
      "p-select-fluid": n.$fluid,
      "p-select-sm p-inputfield-sm": r.size === "small",
      "p-select-lg p-inputfield-lg": r.size === "large"
    }];
  },
  label: function(e) {
    var n, r = e.instance, i = e.props;
    return ["p-select-label", {
      "p-placeholder": !i.editable && r.label === i.placeholder,
      "p-select-label-empty": !i.editable && !r.$slots.value && (r.label === "p-emptylabel" || ((n = r.label) === null || n === void 0 ? void 0 : n.length) === 0)
    }];
  },
  clearIcon: "p-select-clear-icon",
  dropdown: "p-select-dropdown",
  loadingicon: "p-select-loading-icon",
  dropdownIcon: "p-select-dropdown-icon",
  overlay: "p-select-overlay p-component",
  header: "p-select-header",
  pcFilter: "p-select-filter",
  listContainer: "p-select-list-container",
  list: "p-select-list",
  optionGroup: "p-select-option-group",
  optionGroupLabel: "p-select-option-group-label",
  option: function(e) {
    var n = e.instance, r = e.props, i = e.state, o = e.option, s = e.focusedOption;
    return ["p-select-option", {
      "p-select-option-selected": n.isSelected(o) && r.highlightOnSelect,
      "p-focus": i.focusedOptionIndex === s,
      "p-disabled": n.isOptionDisabled(o)
    }];
  },
  optionLabel: "p-select-option-label",
  optionCheckIcon: "p-select-option-check-icon",
  optionBlankIcon: "p-select-option-blank-icon",
  emptyMessage: "p-select-empty-message"
}, cl = z.extend({
  name: "select",
  style: ll,
  classes: ul
}), dl = {
  name: "BaseSelect",
  extends: Or,
  props: {
    options: Array,
    optionLabel: [String, Function],
    optionValue: [String, Function],
    optionDisabled: [String, Function],
    optionGroupLabel: [String, Function],
    optionGroupChildren: [String, Function],
    scrollHeight: {
      type: String,
      default: "14rem"
    },
    filter: Boolean,
    filterPlaceholder: String,
    filterLocale: String,
    filterMatchMode: {
      type: String,
      default: "contains"
    },
    filterFields: {
      type: Array,
      default: null
    },
    editable: Boolean,
    placeholder: {
      type: String,
      default: null
    },
    dataKey: null,
    showClear: {
      type: Boolean,
      default: !1
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
    labelId: {
      type: String,
      default: null
    },
    labelClass: {
      type: [String, Object],
      default: null
    },
    labelStyle: {
      type: Object,
      default: null
    },
    panelClass: {
      type: [String, Object],
      default: null
    },
    overlayStyle: {
      type: Object,
      default: null
    },
    overlayClass: {
      type: [String, Object],
      default: null
    },
    panelStyle: {
      type: Object,
      default: null
    },
    appendTo: {
      type: [String, Object],
      default: "body"
    },
    loading: {
      type: Boolean,
      default: !1
    },
    clearIcon: {
      type: String,
      default: void 0
    },
    dropdownIcon: {
      type: String,
      default: void 0
    },
    filterIcon: {
      type: String,
      default: void 0
    },
    loadingIcon: {
      type: String,
      default: void 0
    },
    resetFilterOnHide: {
      type: Boolean,
      default: !1
    },
    resetFilterOnClear: {
      type: Boolean,
      default: !1
    },
    virtualScrollerOptions: {
      type: Object,
      default: null
    },
    autoOptionFocus: {
      type: Boolean,
      default: !1
    },
    autoFilterFocus: {
      type: Boolean,
      default: !1
    },
    selectOnFocus: {
      type: Boolean,
      default: !1
    },
    focusOnHover: {
      type: Boolean,
      default: !0
    },
    highlightOnSelect: {
      type: Boolean,
      default: !0
    },
    checkmark: {
      type: Boolean,
      default: !1
    },
    filterMessage: {
      type: String,
      default: null
    },
    selectionMessage: {
      type: String,
      default: null
    },
    emptySelectionMessage: {
      type: String,
      default: null
    },
    emptyFilterMessage: {
      type: String,
      default: null
    },
    emptyMessage: {
      type: String,
      default: null
    },
    tabindex: {
      type: Number,
      default: 0
    },
    ariaLabel: {
      type: String,
      default: null
    },
    ariaLabelledby: {
      type: String,
      default: null
    }
  },
  style: cl,
  provide: function() {
    return {
      $pcSelect: this,
      $parentInstance: this
    };
  }
};
function Je(t) {
  "@babel/helpers - typeof";
  return Je = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Je(t);
}
function pl(t) {
  return vl(t) || ml(t) || hl(t) || fl();
}
function fl() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function hl(t, e) {
  if (t) {
    if (typeof t == "string") return Ft(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ft(t, e) : void 0;
  }
}
function ml(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function vl(t) {
  if (Array.isArray(t)) return Ft(t);
}
function Ft(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function Vn(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(t, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function jn(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Vn(Object(n), !0).forEach(function(r) {
      we(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Vn(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function we(t, e, n) {
  return (e = gl(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function gl(t) {
  var e = yl(t, "string");
  return Je(e) == "symbol" ? e : e + "";
}
function yl(t, e) {
  if (Je(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (Je(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Ir = {
  name: "Select",
  extends: dl,
  inheritAttrs: !1,
  emits: ["change", "focus", "blur", "before-show", "before-hide", "show", "hide", "filter"],
  outsideClickListener: null,
  scrollHandler: null,
  resizeListener: null,
  labelClickListener: null,
  matchMediaOrientationListener: null,
  overlay: null,
  list: null,
  virtualScroller: null,
  searchTimeout: null,
  searchValue: null,
  isModelValueChanged: !1,
  data: function() {
    return {
      clicked: !1,
      focused: !1,
      focusedOptionIndex: -1,
      filterValue: null,
      overlayVisible: !1,
      queryOrientation: null
    };
  },
  watch: {
    modelValue: function() {
      this.isModelValueChanged = !0;
    },
    options: function() {
      this.autoUpdateModel();
    }
  },
  mounted: function() {
    this.autoUpdateModel(), this.bindLabelClickListener(), this.bindMatchMediaOrientationListener();
  },
  updated: function() {
    this.overlayVisible && this.isModelValueChanged && this.scrollInView(this.findSelectedOptionIndex()), this.isModelValueChanged = !1;
  },
  beforeUnmount: function() {
    this.unbindOutsideClickListener(), this.unbindResizeListener(), this.unbindLabelClickListener(), this.unbindMatchMediaOrientationListener(), this.scrollHandler && (this.scrollHandler.destroy(), this.scrollHandler = null), this.overlay && (yt.clear(this.overlay), this.overlay = null);
  },
  methods: {
    getOptionIndex: function(e, n) {
      return this.virtualScrollerDisabled ? e : n && n(e).index;
    },
    getOptionLabel: function(e) {
      return this.optionLabel ? fe(e, this.optionLabel) : e;
    },
    getOptionValue: function(e) {
      return this.optionValue ? fe(e, this.optionValue) : e;
    },
    getOptionRenderKey: function(e, n) {
      return (this.dataKey ? fe(e, this.dataKey) : this.getOptionLabel(e)) + "_" + n;
    },
    getPTItemOptions: function(e, n, r, i) {
      return this.ptm(i, {
        context: {
          option: e,
          index: r,
          selected: this.isSelected(e),
          focused: this.focusedOptionIndex === this.getOptionIndex(r, n),
          disabled: this.isOptionDisabled(e)
        }
      });
    },
    isOptionDisabled: function(e) {
      return this.optionDisabled ? fe(e, this.optionDisabled) : !1;
    },
    isOptionGroup: function(e) {
      return this.optionGroupLabel && e.optionGroup && e.group;
    },
    getOptionGroupLabel: function(e) {
      return fe(e, this.optionGroupLabel);
    },
    getOptionGroupChildren: function(e) {
      return fe(e, this.optionGroupChildren);
    },
    getAriaPosInset: function(e) {
      var n = this;
      return (this.optionGroupLabel ? e - this.visibleOptions.slice(0, e).filter(function(r) {
        return n.isOptionGroup(r);
      }).length : e) + 1;
    },
    show: function(e) {
      this.$emit("before-show"), this.overlayVisible = !0, this.focusedOptionIndex = this.focusedOptionIndex !== -1 ? this.focusedOptionIndex : this.autoOptionFocus ? this.findFirstFocusedOptionIndex() : this.editable ? -1 : this.findSelectedOptionIndex(), e && de(this.$refs.focusInput);
    },
    hide: function(e) {
      var n = this, r = function() {
        n.$emit("before-hide"), n.overlayVisible = !1, n.clicked = !1, n.focusedOptionIndex = -1, n.searchValue = "", n.resetFilterOnHide && (n.filterValue = null), e && de(n.$refs.focusInput);
      };
      setTimeout(function() {
        r();
      }, 0);
    },
    onFocus: function(e) {
      this.disabled || (this.focused = !0, this.overlayVisible && (this.focusedOptionIndex = this.focusedOptionIndex !== -1 ? this.focusedOptionIndex : this.autoOptionFocus ? this.findFirstFocusedOptionIndex() : this.editable ? -1 : this.findSelectedOptionIndex(), this.scrollInView(this.focusedOptionIndex)), this.$emit("focus", e));
    },
    onBlur: function(e) {
      var n = this;
      setTimeout(function() {
        var r, i;
        n.focused = !1, n.focusedOptionIndex = -1, n.searchValue = "", n.$emit("blur", e), (r = (i = n.formField).onBlur) === null || r === void 0 || r.call(i, e);
      }, 100);
    },
    onKeyDown: function(e) {
      var n = this;
      if (this.disabled) {
        e.preventDefault();
        return;
      }
      if (yo())
        switch (e.code) {
          case "Backspace":
            this.onBackspaceKey(e, this.editable);
            break;
          case "Enter":
          case "NumpadDecimal":
            this.onEnterKey(e);
            break;
          default:
            e.preventDefault();
            return;
        }
      var r = e.metaKey || e.ctrlKey;
      switch (e.code) {
        case "ArrowDown":
          this.onArrowDownKey(e);
          break;
        case "ArrowUp":
          this.onArrowUpKey(e, this.editable);
          break;
        case "ArrowLeft":
        case "ArrowRight":
          this.onArrowLeftKey(e, this.editable);
          break;
        case "Home":
          this.onHomeKey(e, this.editable);
          break;
        case "End":
          this.onEndKey(e, this.editable);
          break;
        case "PageDown":
          this.onPageDownKey(e);
          break;
        case "PageUp":
          this.onPageUpKey(e);
          break;
        case "Space":
          this.onSpaceKey(e, this.editable);
          break;
        case "Enter":
        case "NumpadEnter":
          this.onEnterKey(e);
          break;
        case "Escape":
          this.onEscapeKey(e);
          break;
        case "Tab":
          this.onTabKey(e);
          break;
        case "Backspace":
          this.onBackspaceKey(e, this.editable);
          break;
        case "ShiftLeft":
        case "ShiftRight":
          break;
        default:
          !r && Zi(e.key) && (!this.overlayVisible && this.show(), !this.editable && this.searchOptions(e, e.key), this.filter && this.$nextTick(function() {
            n.$refs.filterInput && de(n.$refs.filterInput.$el);
          }));
          break;
      }
      this.clicked = !1;
    },
    onEditableInput: function(e) {
      var n = e.target.value;
      this.searchValue = "";
      var r = this.searchOptions(e, n);
      !r && (this.focusedOptionIndex = -1), this.updateModel(e, n), !this.overlayVisible && E(n) && this.show();
    },
    onContainerClick: function(e) {
      this.disabled || this.loading || e.target.tagName === "INPUT" || e.target.getAttribute("data-pc-section") === "clearicon" || e.target.closest('[data-pc-section="clearicon"]') || ((!this.overlay || !this.overlay.contains(e.target)) && (this.overlayVisible ? this.hide(!0) : this.show(!0)), this.clicked = !0);
    },
    onClearClick: function(e) {
      this.updateModel(e, null), this.resetFilterOnClear && (this.filterValue = null);
    },
    onFirstHiddenFocus: function(e) {
      var n = e.relatedTarget === this.$refs.focusInput ? fo(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      de(n);
    },
    onLastHiddenFocus: function(e) {
      var n = e.relatedTarget === this.$refs.focusInput ? ho(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      de(n);
    },
    onOptionSelect: function(e, n) {
      var r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0;
      if (this.overlayVisible) {
        var i = this.getOptionValue(n);
        this.updateModel(e, i), r && this.hide(!0);
      }
    },
    onOptionMouseMove: function(e, n) {
      this.focusOnHover && this.changeFocusedOptionIndex(e, n);
    },
    onFilterChange: function(e) {
      var n = e.target.value;
      this.filterValue = n, this.focusedOptionIndex = -1, this.$emit("filter", {
        originalEvent: e,
        value: n
      }), !this.virtualScrollerDisabled && this.virtualScroller.scrollToIndex(0);
    },
    onFilterKeyDown: function(e) {
      if (!e.isComposing)
        switch (e.code) {
          case "ArrowDown":
            this.onArrowDownKey(e);
            break;
          case "ArrowUp":
            this.onArrowUpKey(e, !0);
            break;
          case "ArrowLeft":
          case "ArrowRight":
            this.onArrowLeftKey(e, !0);
            break;
          case "Home":
            this.onHomeKey(e, !0);
            break;
          case "End":
            this.onEndKey(e, !0);
            break;
          case "Enter":
          case "NumpadEnter":
            this.onEnterKey(e);
            break;
          case "Escape":
            this.onEscapeKey(e);
            break;
          case "Tab":
            this.onTabKey(e);
            break;
        }
    },
    onFilterBlur: function() {
      this.focusedOptionIndex = -1;
    },
    onFilterUpdated: function() {
      this.overlayVisible && this.alignOverlay();
    },
    onOverlayClick: function(e) {
      Ha.emit("overlay-click", {
        originalEvent: e,
        target: this.$el
      });
    },
    onOverlayKeyDown: function(e) {
      switch (e.code) {
        case "Escape":
          this.onEscapeKey(e);
          break;
      }
    },
    onArrowDownKey: function(e) {
      if (!this.overlayVisible)
        this.show(), this.editable && this.changeFocusedOptionIndex(e, this.findSelectedOptionIndex());
      else {
        var n = this.focusedOptionIndex !== -1 ? this.findNextOptionIndex(this.focusedOptionIndex) : this.clicked ? this.findFirstOptionIndex() : this.findFirstFocusedOptionIndex();
        this.changeFocusedOptionIndex(e, n);
      }
      e.preventDefault();
    },
    onArrowUpKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (e.altKey && !n)
        this.focusedOptionIndex !== -1 && this.onOptionSelect(e, this.visibleOptions[this.focusedOptionIndex]), this.overlayVisible && this.hide(), e.preventDefault();
      else {
        var r = this.focusedOptionIndex !== -1 ? this.findPrevOptionIndex(this.focusedOptionIndex) : this.clicked ? this.findLastOptionIndex() : this.findLastFocusedOptionIndex();
        this.changeFocusedOptionIndex(e, r), !this.overlayVisible && this.show(), e.preventDefault();
      }
    },
    onArrowLeftKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n && (this.focusedOptionIndex = -1);
    },
    onHomeKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (n) {
        var r = e.currentTarget;
        e.shiftKey ? r.setSelectionRange(0, e.target.selectionStart) : (r.setSelectionRange(0, 0), this.focusedOptionIndex = -1);
      } else
        this.changeFocusedOptionIndex(e, this.findFirstOptionIndex()), !this.overlayVisible && this.show();
      e.preventDefault();
    },
    onEndKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (n) {
        var r = e.currentTarget;
        if (e.shiftKey)
          r.setSelectionRange(e.target.selectionStart, r.value.length);
        else {
          var i = r.value.length;
          r.setSelectionRange(i, i), this.focusedOptionIndex = -1;
        }
      } else
        this.changeFocusedOptionIndex(e, this.findLastOptionIndex()), !this.overlayVisible && this.show();
      e.preventDefault();
    },
    onPageUpKey: function(e) {
      this.scrollInView(0), e.preventDefault();
    },
    onPageDownKey: function(e) {
      this.scrollInView(this.visibleOptions.length - 1), e.preventDefault();
    },
    onEnterKey: function(e) {
      this.overlayVisible ? (this.focusedOptionIndex !== -1 && this.onOptionSelect(e, this.visibleOptions[this.focusedOptionIndex]), this.hide(!0)) : (this.focusedOptionIndex = -1, this.onArrowDownKey(e)), e.preventDefault();
    },
    onSpaceKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      !n && this.onEnterKey(e);
    },
    onEscapeKey: function(e) {
      this.overlayVisible && this.hide(!0), e.preventDefault(), e.stopPropagation();
    },
    onTabKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n || (this.overlayVisible && this.hasFocusableElements() ? (de(this.$refs.firstHiddenFocusableElementOnOverlay), e.preventDefault()) : (this.focusedOptionIndex !== -1 && this.onOptionSelect(e, this.visibleOptions[this.focusedOptionIndex]), this.overlayVisible && this.hide(this.filter)));
    },
    onBackspaceKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n && !this.overlayVisible && this.show();
    },
    onOverlayEnter: function(e) {
      var n = this;
      yt.set("overlay", e, this.$primevue.config.zIndex.overlay), ao(e, {
        position: "absolute",
        top: "0"
      }), this.alignOverlay(), this.scrollInView(), this.$attrSelector && e.setAttribute(this.$attrSelector, ""), setTimeout(function() {
        n.autoFilterFocus && n.filter && de(n.$refs.filterInput.$el), n.autoUpdateModel();
      }, 1);
    },
    onOverlayAfterEnter: function() {
      this.bindOutsideClickListener(), this.bindScrollListener(), this.bindResizeListener(), this.$emit("show");
    },
    onOverlayLeave: function(e) {
      var n = this;
      e.style.pointerEvents = "none", this.unbindOutsideClickListener(), this.unbindScrollListener(), this.unbindResizeListener(), this.autoFilterFocus && this.filter && !this.editable && this.$nextTick(function() {
        n.$refs.filterInput && de(n.$refs.filterInput.$el);
      }), this.$emit("hide"), this.overlay = null;
    },
    onOverlayAfterLeave: function(e) {
      yt.clear(e);
    },
    alignOverlay: function() {
      this.appendTo === "self" ? so(this.overlay, this.$el) : this.overlay && (this.overlay.style.minWidth = tr(this.$el) + "px", oo(this.overlay, this.$el));
    },
    bindOutsideClickListener: function() {
      var e = this;
      this.outsideClickListener || (this.outsideClickListener = function(n) {
        var r = n.composedPath();
        e.overlayVisible && e.overlay && !r.includes(e.$el) && !r.includes(e.overlay) && e.hide();
      }, document.addEventListener("click", this.outsideClickListener, !0));
    },
    unbindOutsideClickListener: function() {
      this.outsideClickListener && (document.removeEventListener("click", this.outsideClickListener, !0), this.outsideClickListener = null);
    },
    bindScrollListener: function() {
      var e = this;
      this.scrollHandler || (this.scrollHandler = new Ba(this.$refs.container, function() {
        e.overlayVisible && e.hide();
      })), this.scrollHandler.bindScrollListener();
    },
    unbindScrollListener: function() {
      this.scrollHandler && this.scrollHandler.unbindScrollListener();
    },
    bindResizeListener: function() {
      var e = this;
      this.resizeListener || (this.resizeListener = function() {
        e.overlayVisible && !bo() && e.hide();
      }, window.addEventListener("resize", this.resizeListener));
    },
    unbindResizeListener: function() {
      this.resizeListener && (window.removeEventListener("resize", this.resizeListener), this.resizeListener = null);
    },
    bindLabelClickListener: function() {
      var e = this;
      if (!this.editable && !this.labelClickListener) {
        var n = document.querySelector('label[for="'.concat(this.labelId, '"]'));
        n && lt(n) && (this.labelClickListener = function() {
          de(e.$refs.focusInput);
        }, n.addEventListener("click", this.labelClickListener));
      }
    },
    unbindLabelClickListener: function() {
      if (this.labelClickListener) {
        var e = document.querySelector('label[for="'.concat(this.labelId, '"]'));
        e && lt(e) && e.removeEventListener("click", this.labelClickListener);
      }
    },
    bindMatchMediaOrientationListener: function() {
      var e = this;
      if (!this.matchMediaOrientationListener) {
        var n = matchMedia("(orientation: portrait)");
        this.queryOrientation = n, this.matchMediaOrientationListener = function() {
          e.alignOverlay();
        }, this.queryOrientation.addEventListener("change", this.matchMediaOrientationListener);
      }
    },
    unbindMatchMediaOrientationListener: function() {
      this.matchMediaOrientationListener && (this.queryOrientation.removeEventListener("change", this.matchMediaOrientationListener), this.queryOrientation = null, this.matchMediaOrientationListener = null);
    },
    hasFocusableElements: function() {
      return Bt(this.overlay, ':not([data-p-hidden-focusable="true"])').length > 0;
    },
    isOptionExactMatched: function(e) {
      var n;
      return this.isValidOption(e) && typeof this.getOptionLabel(e) == "string" && ((n = this.getOptionLabel(e)) === null || n === void 0 ? void 0 : n.toLocaleLowerCase(this.filterLocale)) == this.searchValue.toLocaleLowerCase(this.filterLocale);
    },
    isOptionStartsWith: function(e) {
      var n;
      return this.isValidOption(e) && typeof this.getOptionLabel(e) == "string" && ((n = this.getOptionLabel(e)) === null || n === void 0 ? void 0 : n.toLocaleLowerCase(this.filterLocale).startsWith(this.searchValue.toLocaleLowerCase(this.filterLocale)));
    },
    isValidOption: function(e) {
      return E(e) && !(this.isOptionDisabled(e) || this.isOptionGroup(e));
    },
    isValidSelectedOption: function(e) {
      return this.isValidOption(e) && this.isSelected(e);
    },
    isSelected: function(e) {
      return Yn(this.d_value, this.getOptionValue(e), this.equalityKey);
    },
    findFirstOptionIndex: function() {
      var e = this;
      return this.visibleOptions.findIndex(function(n) {
        return e.isValidOption(n);
      });
    },
    findLastOptionIndex: function() {
      var e = this;
      return nn(this.visibleOptions, function(n) {
        return e.isValidOption(n);
      });
    },
    findNextOptionIndex: function(e) {
      var n = this, r = e < this.visibleOptions.length - 1 ? this.visibleOptions.slice(e + 1).findIndex(function(i) {
        return n.isValidOption(i);
      }) : -1;
      return r > -1 ? r + e + 1 : e;
    },
    findPrevOptionIndex: function(e) {
      var n = this, r = e > 0 ? nn(this.visibleOptions.slice(0, e), function(i) {
        return n.isValidOption(i);
      }) : -1;
      return r > -1 ? r : e;
    },
    findSelectedOptionIndex: function() {
      var e = this;
      return this.visibleOptions.findIndex(function(n) {
        return e.isValidSelectedOption(n);
      });
    },
    findFirstFocusedOptionIndex: function() {
      var e = this.findSelectedOptionIndex();
      return e < 0 ? this.findFirstOptionIndex() : e;
    },
    findLastFocusedOptionIndex: function() {
      var e = this.findSelectedOptionIndex();
      return e < 0 ? this.findLastOptionIndex() : e;
    },
    searchOptions: function(e, n) {
      var r = this;
      this.searchValue = (this.searchValue || "") + n;
      var i = -1, o = !1;
      return E(this.searchValue) && (i = this.visibleOptions.findIndex(function(s) {
        return r.isOptionExactMatched(s);
      }), i === -1 && (i = this.visibleOptions.findIndex(function(s) {
        return r.isOptionStartsWith(s);
      })), i !== -1 && (o = !0), i === -1 && this.focusedOptionIndex === -1 && (i = this.findFirstFocusedOptionIndex()), i !== -1 && this.changeFocusedOptionIndex(e, i)), this.searchTimeout && clearTimeout(this.searchTimeout), this.searchTimeout = setTimeout(function() {
        r.searchValue = "", r.searchTimeout = null;
      }, 500), o;
    },
    changeFocusedOptionIndex: function(e, n) {
      this.focusedOptionIndex !== n && (this.focusedOptionIndex = n, this.scrollInView(), this.selectOnFocus && this.onOptionSelect(e, this.visibleOptions[n], !1));
    },
    scrollInView: function() {
      var e = this, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : -1;
      this.$nextTick(function() {
        var r = n !== -1 ? "".concat(e.$id, "_").concat(n) : e.focusedOptionId, i = ft(e.list, 'li[id="'.concat(r, '"]'));
        i ? i.scrollIntoView && i.scrollIntoView({
          block: "nearest",
          inline: "nearest"
        }) : e.virtualScrollerDisabled || e.virtualScroller && e.virtualScroller.scrollToIndex(n !== -1 ? n : e.focusedOptionIndex);
      });
    },
    autoUpdateModel: function() {
      this.autoOptionFocus && (this.focusedOptionIndex = this.findFirstFocusedOptionIndex()), this.selectOnFocus && this.autoOptionFocus && !this.$filled && this.onOptionSelect(null, this.visibleOptions[this.focusedOptionIndex], !1);
    },
    updateModel: function(e, n) {
      this.writeValue(n, e), this.$emit("change", {
        originalEvent: e,
        value: n
      });
    },
    flatOptions: function(e) {
      var n = this;
      return (e || []).reduce(function(r, i, o) {
        r.push({
          optionGroup: i,
          group: !0,
          index: o
        });
        var s = n.getOptionGroupChildren(i);
        return s && s.forEach(function(l) {
          return r.push(l);
        }), r;
      }, []);
    },
    overlayRef: function(e) {
      this.overlay = e;
    },
    listRef: function(e, n) {
      this.list = e, n && n(e);
    },
    virtualScrollerRef: function(e) {
      this.virtualScroller = e;
    }
  },
  computed: {
    visibleOptions: function() {
      var e = this, n = this.optionGroupLabel ? this.flatOptions(this.options) : this.options || [];
      if (this.filterValue) {
        var r = Vo.filter(n, this.searchFields, this.filterValue, this.filterMatchMode, this.filterLocale);
        if (this.optionGroupLabel) {
          var i = this.options || [], o = [];
          return i.forEach(function(s) {
            var l = e.getOptionGroupChildren(s), a = l.filter(function(u) {
              return r.includes(u);
            });
            a.length > 0 && o.push(jn(jn({}, s), {}, we({}, typeof e.optionGroupChildren == "string" ? e.optionGroupChildren : "items", pl(a))));
          }), this.flatOptions(o);
        }
        return r;
      }
      return n;
    },
    // @deprecated use $filled instead
    hasSelectedOption: function() {
      return this.$filled;
    },
    label: function() {
      var e = this.findSelectedOptionIndex();
      return e !== -1 ? this.getOptionLabel(this.visibleOptions[e]) : this.placeholder || "p-emptylabel";
    },
    editableInputValue: function() {
      var e = this.findSelectedOptionIndex();
      return e !== -1 ? this.getOptionLabel(this.visibleOptions[e]) : this.d_value || "";
    },
    equalityKey: function() {
      return this.optionValue ? null : this.dataKey;
    },
    searchFields: function() {
      return this.filterFields || [this.optionLabel];
    },
    filterResultMessageText: function() {
      return E(this.visibleOptions) ? this.filterMessageText.replaceAll("{0}", this.visibleOptions.length) : this.emptyFilterMessageText;
    },
    filterMessageText: function() {
      return this.filterMessage || this.$primevue.config.locale.searchMessage || "";
    },
    emptyFilterMessageText: function() {
      return this.emptyFilterMessage || this.$primevue.config.locale.emptySearchMessage || this.$primevue.config.locale.emptyFilterMessage || "";
    },
    emptyMessageText: function() {
      return this.emptyMessage || this.$primevue.config.locale.emptyMessage || "";
    },
    selectionMessageText: function() {
      return this.selectionMessage || this.$primevue.config.locale.selectionMessage || "";
    },
    emptySelectionMessageText: function() {
      return this.emptySelectionMessage || this.$primevue.config.locale.emptySelectionMessage || "";
    },
    selectedMessageText: function() {
      return this.$filled ? this.selectionMessageText.replaceAll("{0}", "1") : this.emptySelectionMessageText;
    },
    focusedOptionId: function() {
      return this.focusedOptionIndex !== -1 ? "".concat(this.$id, "_").concat(this.focusedOptionIndex) : null;
    },
    ariaSetSize: function() {
      var e = this;
      return this.visibleOptions.filter(function(n) {
        return !e.isOptionGroup(n);
      }).length;
    },
    isClearIconVisible: function() {
      return this.showClear && this.d_value != null && !this.disabled && !this.loading;
    },
    virtualScrollerDisabled: function() {
      return !this.virtualScrollerOptions;
    },
    containerDataP: function() {
      return Le(we({
        invalid: this.$invalid,
        disabled: this.disabled,
        focus: this.focused,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    },
    labelDataP: function() {
      return Le(we(we({
        placeholder: !this.editable && this.label === this.placeholder,
        clearable: this.showClear,
        disabled: this.disabled,
        editable: this.editable
      }, this.size, this.size), "empty", !this.editable && !this.$slots.value && (this.label === "p-emptylabel" || this.label.length === 0)));
    },
    dropdownIconDataP: function() {
      return Le(we({}, this.size, this.size));
    },
    overlayDataP: function() {
      return Le(we({}, "portal-" + this.appendTo, "portal-" + this.appendTo));
    }
  },
  directives: {
    ripple: za
  },
  components: {
    InputText: $r,
    VirtualScroller: _r,
    Portal: Ht,
    InputIcon: kr,
    IconField: xr,
    TimesIcon: Sr,
    ChevronDownIcon: br,
    SpinnerIcon: Wt,
    SearchIcon: wr,
    CheckIcon: yr,
    BlankIcon: gr
  }
}, bl = ["id", "data-p"], wl = ["name", "id", "value", "placeholder", "tabindex", "disabled", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-invalid", "data-p"], Sl = ["name", "id", "tabindex", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-invalid", "aria-disabled", "data-p"], xl = ["data-p"], kl = ["id"], Ol = ["id"], $l = ["id", "aria-label", "aria-selected", "aria-disabled", "aria-setsize", "aria-posinset", "onMousedown", "onMousemove", "data-p-selected", "data-p-focused", "data-p-disabled"];
function Cl(t, e, n, r, i, o) {
  var s = se("SpinnerIcon"), l = se("InputText"), a = se("SearchIcon"), u = se("InputIcon"), c = se("IconField"), d = se("CheckIcon"), p = se("BlankIcon"), f = se("VirtualScroller"), h = se("Portal"), g = ni("ripple");
  return k(), C("div", O({
    ref: "container",
    id: t.$id,
    class: t.cx("root"),
    onClick: e[12] || (e[12] = function() {
      return o.onContainerClick && o.onContainerClick.apply(o, arguments);
    }),
    "data-p": o.containerDataP
  }, t.ptmi("root")), [t.editable ? (k(), C("input", O({
    key: 0,
    ref: "focusInput",
    name: t.name,
    id: t.labelId || t.inputId,
    type: "text",
    class: [t.cx("label"), t.inputClass, t.labelClass],
    style: [t.inputStyle, t.labelStyle],
    value: o.editableInputValue,
    placeholder: t.placeholder,
    tabindex: t.disabled ? -1 : t.tabindex,
    disabled: t.disabled,
    autocomplete: "off",
    role: "combobox",
    "aria-label": t.ariaLabel,
    "aria-labelledby": t.ariaLabelledby,
    "aria-haspopup": "listbox",
    "aria-expanded": i.overlayVisible,
    "aria-controls": i.overlayVisible ? t.$id + "_list" : void 0,
    "aria-activedescendant": i.focused ? o.focusedOptionId : void 0,
    "aria-invalid": t.invalid || void 0,
    onFocus: e[0] || (e[0] = function() {
      return o.onFocus && o.onFocus.apply(o, arguments);
    }),
    onBlur: e[1] || (e[1] = function() {
      return o.onBlur && o.onBlur.apply(o, arguments);
    }),
    onKeydown: e[2] || (e[2] = function() {
      return o.onKeyDown && o.onKeyDown.apply(o, arguments);
    }),
    onInput: e[3] || (e[3] = function() {
      return o.onEditableInput && o.onEditableInput.apply(o, arguments);
    }),
    "data-p": o.labelDataP
  }, t.ptm("label")), null, 16, wl)) : (k(), C("span", O({
    key: 1,
    ref: "focusInput",
    name: t.name,
    id: t.labelId || t.inputId,
    class: [t.cx("label"), t.inputClass, t.labelClass],
    style: [t.inputStyle, t.labelStyle],
    tabindex: t.disabled ? -1 : t.tabindex,
    role: "combobox",
    "aria-label": t.ariaLabel || (o.label === "p-emptylabel" ? void 0 : o.label),
    "aria-labelledby": t.ariaLabelledby,
    "aria-haspopup": "listbox",
    "aria-expanded": i.overlayVisible,
    "aria-controls": t.$id + "_list",
    "aria-activedescendant": i.focused ? o.focusedOptionId : void 0,
    "aria-invalid": t.invalid || void 0,
    "aria-disabled": t.disabled,
    onFocus: e[4] || (e[4] = function() {
      return o.onFocus && o.onFocus.apply(o, arguments);
    }),
    onBlur: e[5] || (e[5] = function() {
      return o.onBlur && o.onBlur.apply(o, arguments);
    }),
    onKeydown: e[6] || (e[6] = function() {
      return o.onKeyDown && o.onKeyDown.apply(o, arguments);
    }),
    "data-p": o.labelDataP
  }, t.ptm("label")), [M(t.$slots, "value", {
    value: t.d_value,
    placeholder: t.placeholder
  }, function() {
    var v;
    return [ve(X(o.label === "p-emptylabel" ? " " : (v = o.label) !== null && v !== void 0 ? v : "empty"), 1)];
  })], 16, Sl)), o.isClearIconVisible ? M(t.$slots, "clearicon", {
    key: 2,
    class: Pe(t.cx("clearIcon")),
    clearCallback: o.onClearClick
  }, function() {
    return [(k(), me(St(t.clearIcon ? "i" : "TimesIcon"), O({
      ref: "clearIcon",
      class: [t.cx("clearIcon"), t.clearIcon],
      onClick: o.onClearClick
    }, t.ptm("clearIcon"), {
      "data-pc-section": "clearicon"
    }), null, 16, ["class", "onClick"]))];
  }) : W("", !0), D("div", O({
    class: t.cx("dropdown")
  }, t.ptm("dropdown")), [t.loading ? M(t.$slots, "loadingicon", {
    key: 0,
    class: Pe(t.cx("loadingIcon"))
  }, function() {
    return [t.loadingIcon ? (k(), C("span", O({
      key: 0,
      class: [t.cx("loadingIcon"), "pi-spin", t.loadingIcon],
      "aria-hidden": "true"
    }, t.ptm("loadingIcon")), null, 16)) : (k(), me(s, O({
      key: 1,
      class: t.cx("loadingIcon"),
      spin: "",
      "aria-hidden": "true"
    }, t.ptm("loadingIcon")), null, 16, ["class"]))];
  }) : M(t.$slots, "dropdownicon", {
    key: 1,
    class: Pe(t.cx("dropdownIcon"))
  }, function() {
    return [(k(), me(St(t.dropdownIcon ? "span" : "ChevronDownIcon"), O({
      class: [t.cx("dropdownIcon"), t.dropdownIcon],
      "aria-hidden": "true",
      "data-p": o.dropdownIconDataP
    }, t.ptm("dropdownIcon")), null, 16, ["class", "data-p"]))];
  })], 16), le(h, {
    appendTo: t.appendTo
  }, {
    default: Ce(function() {
      return [le(ri, O({
        name: "p-anchored-overlay",
        onEnter: o.onOverlayEnter,
        onAfterEnter: o.onOverlayAfterEnter,
        onLeave: o.onOverlayLeave,
        onAfterLeave: o.onOverlayAfterLeave
      }, t.ptm("transition")), {
        default: Ce(function() {
          return [i.overlayVisible ? (k(), C("div", O({
            key: 0,
            ref: o.overlayRef,
            class: [t.cx("overlay"), t.panelClass, t.overlayClass],
            style: [t.panelStyle, t.overlayStyle],
            onClick: e[10] || (e[10] = function() {
              return o.onOverlayClick && o.onOverlayClick.apply(o, arguments);
            }),
            onKeydown: e[11] || (e[11] = function() {
              return o.onOverlayKeyDown && o.onOverlayKeyDown.apply(o, arguments);
            }),
            "data-p": o.overlayDataP
          }, t.ptm("overlay")), [D("span", O({
            ref: "firstHiddenFocusableElementOnOverlay",
            role: "presentation",
            "aria-hidden": "true",
            class: "p-hidden-accessible p-hidden-focusable",
            tabindex: 0,
            onFocus: e[7] || (e[7] = function() {
              return o.onFirstHiddenFocus && o.onFirstHiddenFocus.apply(o, arguments);
            })
          }, t.ptm("hiddenFirstFocusableEl"), {
            "data-p-hidden-accessible": !0,
            "data-p-hidden-focusable": !0
          }), null, 16), M(t.$slots, "header", {
            value: t.d_value,
            options: o.visibleOptions
          }), t.filter ? (k(), C("div", O({
            key: 0,
            class: t.cx("header")
          }, t.ptm("header")), [le(c, {
            unstyled: t.unstyled,
            pt: t.ptm("pcFilterContainer")
          }, {
            default: Ce(function() {
              return [le(l, {
                ref: "filterInput",
                type: "text",
                value: i.filterValue,
                onVnodeMounted: o.onFilterUpdated,
                onVnodeUpdated: o.onFilterUpdated,
                class: Pe(t.cx("pcFilter")),
                placeholder: t.filterPlaceholder,
                variant: t.variant,
                unstyled: t.unstyled,
                role: "searchbox",
                autocomplete: "off",
                "aria-owns": t.$id + "_list",
                "aria-activedescendant": o.focusedOptionId,
                onKeydown: o.onFilterKeyDown,
                onBlur: o.onFilterBlur,
                onInput: o.onFilterChange,
                pt: t.ptm("pcFilter"),
                formControl: {
                  novalidate: !0
                }
              }, null, 8, ["value", "onVnodeMounted", "onVnodeUpdated", "class", "placeholder", "variant", "unstyled", "aria-owns", "aria-activedescendant", "onKeydown", "onBlur", "onInput", "pt"]), le(u, {
                unstyled: t.unstyled,
                pt: t.ptm("pcFilterIconContainer")
              }, {
                default: Ce(function() {
                  return [M(t.$slots, "filtericon", {}, function() {
                    return [t.filterIcon ? (k(), C("span", O({
                      key: 0,
                      class: t.filterIcon
                    }, t.ptm("filterIcon")), null, 16)) : (k(), me(a, ii(O({
                      key: 1
                    }, t.ptm("filterIcon"))), null, 16))];
                  })];
                }),
                _: 3
              }, 8, ["unstyled", "pt"])];
            }),
            _: 3
          }, 8, ["unstyled", "pt"]), D("span", O({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, t.ptm("hiddenFilterResult"), {
            "data-p-hidden-accessible": !0
          }), X(o.filterResultMessageText), 17)], 16)) : W("", !0), D("div", O({
            class: t.cx("listContainer"),
            style: {
              "max-height": o.virtualScrollerDisabled ? t.scrollHeight : ""
            }
          }, t.ptm("listContainer")), [le(f, O({
            ref: o.virtualScrollerRef
          }, t.virtualScrollerOptions, {
            items: o.visibleOptions,
            style: {
              height: t.scrollHeight
            },
            tabindex: -1,
            disabled: o.virtualScrollerDisabled,
            pt: t.ptm("virtualScroller")
          }), oi({
            content: Ce(function(v) {
              var y = v.styleClass, b = v.contentRef, _ = v.items, m = v.getItemOptions, x = v.contentStyle, P = v.itemSize;
              return [D("ul", O({
                ref: function(L) {
                  return o.listRef(L, b);
                },
                id: t.$id + "_list",
                class: [t.cx("list"), y],
                style: x,
                role: "listbox"
              }, t.ptm("list")), [(k(!0), C(he, null, at(_, function(S, L) {
                return k(), C(he, {
                  key: o.getOptionRenderKey(S, o.getOptionIndex(L, m))
                }, [o.isOptionGroup(S) ? (k(), C("li", O({
                  key: 0,
                  id: t.$id + "_" + o.getOptionIndex(L, m),
                  style: {
                    height: P ? P + "px" : void 0
                  },
                  class: t.cx("optionGroup"),
                  role: "option"
                }, {
                  ref_for: !0
                }, t.ptm("optionGroup")), [M(t.$slots, "optiongroup", {
                  option: S.optionGroup,
                  index: o.getOptionIndex(L, m)
                }, function() {
                  return [D("span", O({
                    class: t.cx("optionGroupLabel")
                  }, {
                    ref_for: !0
                  }, t.ptm("optionGroupLabel")), X(o.getOptionGroupLabel(S.optionGroup)), 17)];
                })], 16, Ol)) : ot((k(), C("li", O({
                  key: 1,
                  id: t.$id + "_" + o.getOptionIndex(L, m),
                  class: t.cx("option", {
                    option: S,
                    focusedOption: o.getOptionIndex(L, m)
                  }),
                  style: {
                    height: P ? P + "px" : void 0
                  },
                  role: "option",
                  "aria-label": o.getOptionLabel(S),
                  "aria-selected": o.isSelected(S),
                  "aria-disabled": o.isOptionDisabled(S),
                  "aria-setsize": o.ariaSetSize,
                  "aria-posinset": o.getAriaPosInset(o.getOptionIndex(L, m)),
                  onMousedown: function(B) {
                    return o.onOptionSelect(B, S);
                  },
                  onMousemove: function(B) {
                    return o.onOptionMouseMove(B, o.getOptionIndex(L, m));
                  },
                  onClick: e[8] || (e[8] = ai(function() {
                  }, ["stop"])),
                  "data-p-selected": !t.checkmark && o.isSelected(S),
                  "data-p-focused": i.focusedOptionIndex === o.getOptionIndex(L, m),
                  "data-p-disabled": o.isOptionDisabled(S)
                }, {
                  ref_for: !0
                }, o.getPTItemOptions(S, m, L, "option")), [t.checkmark ? (k(), C(he, {
                  key: 0
                }, [o.isSelected(S) ? (k(), me(d, O({
                  key: 0,
                  class: t.cx("optionCheckIcon")
                }, {
                  ref_for: !0
                }, t.ptm("optionCheckIcon")), null, 16, ["class"])) : (k(), me(p, O({
                  key: 1,
                  class: t.cx("optionBlankIcon")
                }, {
                  ref_for: !0
                }, t.ptm("optionBlankIcon")), null, 16, ["class"]))], 64)) : W("", !0), M(t.$slots, "option", {
                  option: S,
                  selected: o.isSelected(S),
                  index: o.getOptionIndex(L, m)
                }, function() {
                  return [D("span", O({
                    class: t.cx("optionLabel")
                  }, {
                    ref_for: !0
                  }, t.ptm("optionLabel")), X(o.getOptionLabel(S)), 17)];
                })], 16, $l)), [[g]])], 64);
              }), 128)), i.filterValue && (!_ || _ && _.length === 0) ? (k(), C("li", O({
                key: 0,
                class: t.cx("emptyMessage"),
                role: "option"
              }, t.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [M(t.$slots, "emptyfilter", {}, function() {
                return [ve(X(o.emptyFilterMessageText), 1)];
              })], 16)) : !t.options || t.options && t.options.length === 0 ? (k(), C("li", O({
                key: 1,
                class: t.cx("emptyMessage"),
                role: "option"
              }, t.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [M(t.$slots, "empty", {}, function() {
                return [ve(X(o.emptyMessageText), 1)];
              })], 16)) : W("", !0)], 16, kl)];
            }),
            _: 2
          }, [t.$slots.loader ? {
            name: "loader",
            fn: Ce(function(v) {
              var y = v.options;
              return [M(t.$slots, "loader", {
                options: y
              })];
            }),
            key: "0"
          } : void 0]), 1040, ["items", "style", "disabled", "pt"])], 16), M(t.$slots, "footer", {
            value: t.d_value,
            options: o.visibleOptions
          }), !t.options || t.options && t.options.length === 0 ? (k(), C("span", O({
            key: 1,
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, t.ptm("hiddenEmptyMessage"), {
            "data-p-hidden-accessible": !0
          }), X(o.emptyMessageText), 17)) : W("", !0), D("span", O({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, t.ptm("hiddenSelectedMessage"), {
            "data-p-hidden-accessible": !0
          }), X(o.selectedMessageText), 17), D("span", O({
            ref: "lastHiddenFocusableElementOnOverlay",
            role: "presentation",
            "aria-hidden": "true",
            class: "p-hidden-accessible p-hidden-focusable",
            tabindex: 0,
            onFocus: e[9] || (e[9] = function() {
              return o.onLastHiddenFocus && o.onLastHiddenFocus.apply(o, arguments);
            })
          }, t.ptm("hiddenLastFocusableEl"), {
            "data-p-hidden-accessible": !0,
            "data-p-hidden-focusable": !0
          }), null, 16)], 16, xl)) : W("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onLeave", "onAfterLeave"])];
    }),
    _: 3
  }, 8, ["appendTo"])], 16, bl);
}
Ir.render = Cl;
const _l = () => Ri(), Il = () => Bi();
function Tl(t, e) {
  if (t && typeof t == "object") {
    const n = t, r = n.response?.data?.error;
    if (typeof r == "string") return r;
    if (r && typeof r == "object" && typeof r.message == "string")
      return r.message;
    if (typeof n.message == "string" && n.message) return n.message;
  }
  return e;
}
function Tr(t, e) {
  if (t && typeof t == "object") {
    const n = t;
    n.response?.status === 401 && Dn.handleError("auth-expired", n);
    const r = n.response?.data?.errors;
    if (Array.isArray(r) && r.length) return r.map(String).join("; ");
  }
  return Tl(t, e);
}
async function Pl(t) {
  try {
    const { data: e } = await Rn.post("/api/v1/transform/assist", t);
    if (e && (e.ok === !1 || e.success === !1)) throw new Error(e.error || "assist failed");
    return e || {};
  } catch (e) {
    throw new Error(Tr(e, "could not generate a transform"));
  }
}
async function Ll(t) {
  try {
    const { data: e } = await Rn.post("/api/v1/transform/validate", t);
    if (e && (e.ok === !1 || e.success === !1)) throw new Error(e.error || "validate failed");
    return e || {};
  } catch (e) {
    throw new Error(Tr(e, "could not validate the transform"));
  }
}
const Al = { class: "kx" }, El = { class: "kx-bar" }, Vl = ["disabled"], jl = {
  key: 0,
  role: "status"
}, zl = {
  key: 4,
  class: "kx-hint",
  "data-test": "auto-hint"
}, Ml = {
  key: 5,
  class: "kx-hint",
  "data-test": "passthrough"
}, Fl = {
  key: 6,
  class: "kx-rationale",
  "data-test": "rationale"
}, Nl = {
  key: 7,
  class: "kx-errors",
  "data-test": "verrors"
}, Dl = {
  key: 8,
  class: "kx-pre",
  "data-test": "output-preview"
}, Rl = {
  key: 9,
  class: "kx-err",
  "data-test": "error"
}, Bl = {
  key: 10,
  class: "kx-hint"
}, zn = "wc-model-picker", Hl = "class:fast", Kl = /* @__PURE__ */ si({
  __name: "assist",
  setup(t) {
    const e = _l(), n = Il();
    function r(w) {
      if (typeof w == "string") {
        const $ = w.trim();
        if (!$) return;
        try {
          return JSON.parse($);
        } catch {
          return $;
        }
      }
      return w;
    }
    function i(w) {
      const $ = r(w);
      return Array.isArray($) ? $ : [];
    }
    const o = ae(() => e.value), s = ae(() => r(o.value?.sourceSchema)), l = ae(() => r(o.value?.sinkSchema)), a = ae(() => o.value?.inputShape === "record" || o.value?.inputShape === "content" ? o.value.inputShape : void 0), u = ae(() => i(o.value?.samples)), c = ae(() => typeof o.value?.hint == "string" ? o.value.hint : void 0), d = ae(() => o.value?.disabled === !0), p = ae(() => s.value != null && l.value != null && a.value != null), f = [
      { value: "auto", label: "Auto (AI picks)" },
      { value: "expr", label: "Expression" },
      { value: "llm", label: "LLM" },
      { value: "code", label: "Code (Lua)" },
      { value: "none", label: "Pass through" }
    ], h = U("expr"), g = U(""), v = U(""), y = U(Hl), b = U(""), _ = U(void 0), m = U(!1), x = U(""), P = U(""), S = U(null);
    function L(w) {
      !w || typeof w.kind != "string" || (h.value = w.kind, w.kind === "expr" ? g.value = typeof w.expr == "string" ? w.expr : "" : w.kind === "llm" ? (v.value = typeof w.prompt == "string" ? w.prompt : "", typeof w.model == "string" && w.model && (y.value = w.model)) : w.kind === "code" && (b.value = typeof w.code == "string" ? w.code : "", _.value = Array.isArray(w.tool_ids) ? w.tool_ids : void 0));
    }
    L(r(o.value?.value)), Mn(() => {
      fi(zn, { timeoutMs: 8e3 }).catch((w) => {
        x.value = w instanceof Error ? w.message : String(w);
      });
    });
    function R() {
      switch (h.value) {
        case "expr":
          return { kind: "expr", expr: g.value.trim() };
        case "llm":
          return { kind: "llm", prompt: v.value.trim(), ...y.value.trim() ? { model: y.value.trim() } : {} };
        case "code":
          return { kind: "code", code: b.value, ..._.value ? { tool_ids: _.value } : {} };
        default:
          return { kind: "none" };
      }
    }
    const B = ae(() => {
      switch (h.value) {
        case "expr":
          return g.value.trim().length > 0;
        case "llm":
          return v.value.trim().length > 0;
        case "code":
          return b.value.trim().length > 0;
        default:
          return !0;
      }
    });
    let V, F = !1;
    Te([h, g, v, y, b], () => {
      const w = R();
      n("transform-confirmed", { transform: w, strategy: w.kind }), !F && (S.value = null, V && clearTimeout(V), h.value !== "none" && h.value !== "auto" && B.value && p.value && (V = setTimeout(Z, 500)));
    });
    async function J() {
      if (d.value || m.value || !p.value || !u.value.length || h.value === "none") return;
      m.value = !0, x.value = "", P.value = "", S.value = null;
      const w = h.value;
      try {
        const $ = await Pl({
          source_schema: s.value,
          sink_schema: l.value,
          input_shape: a.value,
          samples: u.value,
          hint: c.value,
          strategy: w
        });
        P.value = typeof $.rationale == "string" ? $.rationale : "", F = !0, $.transform && typeof $.transform.kind == "string" && L($.transform), await Fn(), F = !1, Array.isArray($.errors) && $.errors.length && !$.validated ? x.value = $.errors.join("; ") : $.validated && (S.value = { ok: !0, valid: !0, errors: [] });
      } catch ($) {
        x.value = $ instanceof Error ? $.message : "could not generate a transform";
      } finally {
        m.value = !1;
      }
    }
    async function Z() {
      if (!(!B.value || !p.value || !u.value.length))
        try {
          S.value = await Ll({
            transform: R(),
            sink_schema: l.value,
            input_shape: a.value,
            samples: u.value,
            source_schema: s.value
          });
        } catch (w) {
          x.value = w instanceof Error ? w.message : String(w);
        }
    }
    function K(w) {
      const $ = w.detail;
      typeof $ == "string" && $ && (y.value = $);
    }
    const G = ae(() => {
      const w = Array.isArray(S.value?.outputs) ? S.value.outputs[0] : void 0;
      if (w === void 0) return "";
      try {
        return JSON.stringify(w);
      } catch {
        return String(w);
      }
    });
    return (w, $) => (k(), C("div", Al, [
      D("div", El, [
        le(ht(Ir), {
          modelValue: h.value,
          "onUpdate:modelValue": $[0] || ($[0] = (H) => h.value = H),
          class: "kx-select",
          options: f,
          "option-label": "label",
          "option-value": "value",
          disabled: d.value,
          "aria-label": "Transform strategy",
          "data-test": "strategy"
        }, null, 8, ["modelValue", "disabled"]),
        h.value !== "none" ? (k(), C("button", {
          key: 0,
          class: "kx-gen",
          type: "button",
          disabled: d.value || m.value || !p.value || !u.value.length,
          "data-test": "generate",
          onClick: $[1] || ($[1] = (H) => J())
        }, [
          le(ht(Jt), {
            icon: m.value ? "tabler:loader-2" : "tabler:wand",
            class: Pe(m.value && "spin"),
            "aria-hidden": "true"
          }, null, 8, ["icon", "class"]),
          ve(" " + X(m.value ? "Generating…" : "Generate"), 1)
        ], 8, Vl)) : W("", !0),
        S.value ? (k(), C("span", {
          key: 1,
          class: Pe(["kx-status kx-tag-sm", S.value.valid ? "kx-ok" : "kx-bad"]),
          "data-test": "status"
        }, [
          le(ht(Jt), {
            icon: S.value.valid ? "tabler:circle-check" : "tabler:alert-triangle",
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          ve(" " + X(S.value.valid ? "Validated" : "Needs review"), 1)
        ], 2)) : W("", !0)
      ]),
      u.value.length ? W("", !0) : (k(), C("p", jl, "Provide real source samples to generate or validate a transform.")),
      h.value === "expr" ? ot((k(), C("textarea", {
        key: 1,
        "onUpdate:modelValue": $[2] || ($[2] = (H) => g.value = H),
        class: "kx-input kx-textarea",
        spellcheck: "false",
        placeholder: "{ content: payload.title }",
        "data-test": "expr-editor"
      }, null, 512)), [
        [mt, g.value]
      ]) : h.value === "llm" ? (k(), C(he, { key: 2 }, [
        ot(D("textarea", {
          "onUpdate:modelValue": $[3] || ($[3] = (H) => v.value = H),
          class: "kx-input kx-textarea",
          spellcheck: "false",
          placeholder: "Summarize the item as concise plain text.",
          "data-test": "llm-editor"
        }, null, 512), [
          [mt, v.value]
        ]),
        (k(), me(St(zn), {
          value: y.value,
          capability: "generate",
          onSelect: K
        }, null, 40, ["value"]))
      ], 64)) : h.value === "code" ? (k(), C(he, { key: 3 }, [
        ot(D("textarea", {
          "onUpdate:modelValue": $[4] || ($[4] = (H) => b.value = H),
          class: "kx-input kx-textarea kx-code",
          spellcheck: "false",
          placeholder: "return { content = __cx_args.payload.summary.overview }",
          "data-test": "code-editor"
        }, null, 512), [
          [mt, b.value]
        ]),
        $[5] || ($[5] = D("span", { class: "kx-hint" }, [
          ve("Item is "),
          D("code", null, "__cx_args"),
          ve(" ({ payload: … }); "),
          D("code", null, "return"),
          ve(" a table for the destination. Sandboxed: json / string / table / math.")
        ], -1))
      ], 64)) : h.value === "auto" ? (k(), C("p", zl, "Generate and the AI picks the best mapping — switch the selector to hand-write one.")) : (k(), C("p", Ml, "Items pass through to the destination unchanged.")),
      P.value ? (k(), C("p", Fl, X(P.value), 1)) : W("", !0),
      S.value && !S.value.valid && S.value.errors && S.value.errors.length ? (k(), C("ul", Nl, [
        (k(!0), C(he, null, at(S.value.errors, (H, Q) => (k(), C("li", { key: Q }, X(H), 1))), 128))
      ])) : W("", !0),
      G.value ? (k(), C("pre", Dl, X(G.value), 1)) : W("", !0),
      x.value ? (k(), C("div", Rl, X(x.value), 1)) : W("", !0),
      p.value ? W("", !0) : (k(), C("span", Bl, "Pick a source and destination to generate."))
    ]));
  }
}), Ul = ':root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}.spin{animation:kx-spin 1s linear infinite}@keyframes kx-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.spin{animation:none}}.kx-empty{text-align:center;padding:44px 24px;display:flex;flex-direction:column;align-items:center;gap:8px}.kx-empty-ico{width:56px;height:56px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);color:var(--p-primary-color);margin-bottom:4px}.kx-empty-ico svg{width:28px;height:28px}.kx-empty-title{font-size:15px;font-weight:700;color:var(--p-text-color);margin:0}.kx-empty-sub{font-size:13px;color:var(--p-text-muted-color);max-width:380px;margin:0}.kx-empty>.p-button{margin-top:6px}.kx-empty-actions{display:flex;gap:8px;margin-top:6px}.kx-loading{display:flex;align-items:center;gap:8px;color:var(--p-text-muted-color);font-size:13px;padding:24px}.kx-err{margin:0 20px 8px;padding:9px 12px;border-radius:10px;font-size:13px;background:color-mix(in srgb,var(--p-danger-500) 12%,transparent);color:var(--p-danger-600, var(--p-danger-500))}.kx-err.inline{margin:12px 0 0}.kx-tag-sm,.kx-tag-sm.kx-tag-sm{display:inline-flex;align-items:center;gap:4px;padding:1px 7px;border-radius:var(--kx-radius-tag, 6px);font-size:10.5px;font-weight:600;line-height:1.5;white-space:nowrap}.kx-tag-sm svg,.kx-tag-sm.kx-tag-sm svg{width:12px;height:12px}.kx-tag-caps,.kx-tag-caps.kx-tag-caps{display:inline-flex;align-items:center;gap:3px;padding:2px 6px;border-radius:var(--kx-radius-tag, 6px);font-size:9px;font-weight:700;line-height:1.5;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap}.kx-tag-caps svg,.kx-tag-caps.kx-tag-caps svg{width:11px;height:11px}:host,:root{--kx-surface-1: color-mix(in srgb, var(--p-content-background) 96%, var(--p-text-color) 4%);--kx-surface-2: color-mix(in srgb, var(--p-content-background) 92%, var(--p-text-color) 8%);--kx-surface-3: color-mix(in srgb, var(--p-content-background) 86%, var(--p-text-color) 14%);--kx-surface-4: color-mix(in srgb, var(--p-content-background) 78%, var(--p-text-color) 22%);--kx-border-strong: color-mix(in srgb, var(--p-content-border-color) 60%, var(--p-text-color) 40%);--kx-border-stronger: color-mix(in srgb, var(--p-content-border-color) 30%, var(--p-text-color) 70%);--kx-text-faint: color-mix(in srgb, var(--p-text-muted-color) 70%, var(--p-content-background) 30%);--kx-text-fainter: color-mix(in srgb, var(--p-text-muted-color) 45%, var(--p-content-background) 55%);--kx-wash-primary: color-mix(in srgb, var(--p-primary-color) 12%, var(--p-content-background) 88%);--kx-wash-success: color-mix(in srgb, var(--p-success-500) 12%, var(--p-content-background) 88%);--kx-wash-info: color-mix(in srgb, var(--p-info-500) 12%, var(--p-content-background) 88%);--kx-wash-warn: color-mix(in srgb, var(--p-warn-500) 12%, var(--p-content-background) 88%);--kx-wash-danger: color-mix(in srgb, var(--p-danger-500) 12%, var(--p-content-background) 88%);--kx-wash-help: color-mix(in srgb, var(--p-help-500) 12%, var(--p-content-background) 88%);--kx-font-heading: "Outfit", system-ui, sans-serif;--kx-font-body: "Inter", system-ui, sans-serif;--kx-radius-4: 4px;--kx-radius-6: 6px;--kx-radius-8: 8px;--kx-radius-10: 10px;--kx-radius-14: 14px;--kx-radius-16: 16px;--kx-radius-tag: var(--p-content-border-radius, 6px);--kx-control-height: 34px;--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .08);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .12);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .18);--kx-overlay-hover: color-mix(in srgb, var(--p-text-color) 7%, transparent);--kx-overlay-subtle: color-mix(in srgb, var(--p-text-color) 4%, transparent)}@media(prefers-color-scheme:dark){:host(:not(.w-theme-light)),:root:not(.w-theme-light){--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .35);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .45);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .6)}}:host(.w-theme-dark),:root.w-theme-dark{--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .35);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .45);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .6)}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}:host{display:block}*,*:before,*:after{box-sizing:border-box}.kx{font-family:inherit;color:var(--p-text-color);display:flex;flex-direction:column;gap:8px}.kx-bar{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.kx-select{height:36px;padding:0 10px;font:inherit;font-size:13px;color:var(--p-text-color);background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-tag, 8px);cursor:pointer}.kx-gen{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 12px;border:1px solid transparent;border-radius:var(--kx-radius-tag, 8px);font:inherit;font-size:12.5px;font-weight:600;background:var(--p-primary-color);color:var(--p-button-primary-color);cursor:pointer;transition:filter .15s,opacity .15s}.kx-gen:hover:not(:disabled){filter:brightness(1.05)}.kx-gen:disabled{opacity:.55;cursor:default}.kx-gen svg{width:15px;height:15px}.kx-status{margin-left:auto;text-transform:uppercase;letter-spacing:.02em}.kx-status svg{width:13px;height:13px}.kx-ok{color:var(--p-success-600, var(--p-success-500));background:color-mix(in srgb,var(--p-success-500) 14%,transparent)}.kx-bad{color:var(--p-warn-600, var(--p-warn-500));background:color-mix(in srgb,var(--p-warn-500) 14%,transparent)}.kx-input{height:36px;padding:0 10px;font:inherit;font-size:13px;color:var(--p-text-color);width:100%;background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-tag, 8px);transition:border-color .15s}.kx-input::placeholder{color:var(--p-text-muted-color)}.kx-textarea{height:auto;min-height:84px;padding:10px;resize:vertical;line-height:1.55;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12.5px;tab-size:2}.kx-code{min-height:120px}.kx-hint{font-size:12px;color:var(--p-text-muted-color)}.kx-hint code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px;padding:0 3px;border-radius:4px;background:color-mix(in srgb,var(--p-text-color) 8%,transparent)}.kx-rationale{margin:0;font-size:12.5px;line-height:1.5;color:var(--p-text-muted-color)}.kx-pre{margin:0;padding:10px;border-radius:var(--kx-radius-tag, 8px);overflow:auto;max-height:160px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;line-height:1.5;color:var(--p-text-color);background:color-mix(in srgb,var(--p-text-color) 5%,transparent)}.kx-errors{margin:0;padding:8px 12px 8px 26px;border-radius:var(--kx-radius-tag, 8px);font-size:12.5px;line-height:1.5;color:var(--p-danger-600, var(--p-danger-500));background:color-mix(in srgb,var(--p-danger-500) 10%,transparent)}.kx-err{margin:0}', Wl = { props: { type: "object", properties: { "source-schema": { type: "string", default: "", description: "Source item JSON schema (JSON string or object)." }, "sink-schema": { type: "string", default: "", description: "Sink/endpoint input JSON schema (JSON string or object)." }, "input-shape": { type: "string", default: "", description: "The sink's declared input shape, record or content; generation and validation shape each output into it." }, samples: { type: "string", default: "", description: "Optional JSON array of real source items to generate/validate the transform against." }, hint: { type: "string", default: "", description: "Optional freeform steer for the model." }, value: { type: "string", default: "", description: "Optional existing transform { kind, ... } (JSON string or object) to seed the builder for edit-back." }, disabled: { type: "boolean", default: !1, description: "Disable all builder actions." } } } }, Gl = {
  wippy: Wl
};
class ql extends Hi {
  static get wippyConfig() {
    return {
      propsSchema: Gl.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: Ul
    };
  }
  static get vueConfig() {
    return { rootComponent: Kl, plugins: [Xa] };
  }
}
hi(import.meta.url, ql);
//# sourceMappingURL=index.js.map
