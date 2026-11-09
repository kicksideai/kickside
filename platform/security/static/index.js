import { hasInjectionContext as qr, inject as Hn, effectScope as Yr, ref as V, markRaw as Zr, onMounted as qt, onUnmounted as Kn, watch as Te, createApp as Qr, readonly as Jr, getCurrentInstance as Et, nextTick as Yt, reactive as Xr, renderSlot as Q, openBlock as f, createBlock as N, Teleport as Gn, createCommentVNode as A, useId as qn, mergeProps as E, h as eo, resolveDirective as Zt, withDirectives as De, resolveDynamicComponent as ze, withCtx as F, normalizeClass as ke, createElementBlock as y, createElementVNode as h, defineComponent as ie, createTextVNode as W, toDisplayString as R, resolveComponent as an, computed as ee, unref as b, createVNode as L, onBeforeUnmount as to, withModifiers as Ze, Fragment as Ce, renderList as Pe, vShow as sn } from "vue";
import { addCollection as no, Icon as te } from "@iconify/vue";
import { config as ln, addIcons as ro, on as oo, applyThemeMode as ft, host as Qt, hostCss as ao, loadCss as io, loadByTagName as so, api as Le, define as lo } from "@wippy-fe/proxy";
var Nt = "data-wippy-visible";
function dn(e) {
  const t = e.getAttribute(Nt);
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
function cn(e) {
  const t = e.startsWith("--") ? e : `--${e}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(t) ? t : null;
}
function mo(...e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of e)
    if (n)
      for (const [r, o] of Object.entries(n)) {
        if ((r === "@light" || r === "@dark") && o && typeof o == "object") {
          for (const [s, d] of Object.entries(o)) {
            const i = typeof d == "string" ? cn(s) : null;
            i && t.add(i);
          }
          continue;
        }
        const a = typeof o == "string" ? cn(r) : null;
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
function xo(e) {
  return e.replace(/-([a-z])/g, (t, n) => n.toUpperCase());
}
function ko(e, t, n) {
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
function Pt(e, t) {
  const n = {}, r = [];
  for (const [o, a] of Object.entries(t.properties)) {
    const s = e.getAttribute(o), d = xo(o);
    if (s === null) {
      a.default !== void 0 && (n[d] = a.default);
      continue;
    }
    const i = ko(o, s, a);
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
    super(), Z(this, "_internals"), Z(this, "_contentObserver", null), Z(this, "_initialized", !1), Z(this, "_container", null), Z(this, "_reactive", null), Z(this, "_lastProps", null), Z(this, "_lastErrors", []), Z(this, "_lastContent", null), Z(this, "_themeUnsub", null), Z(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = dn(this);
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
    return [.../* @__PURE__ */ new Set([...t, ...n, Nt])];
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
        const a = Pt(this, e.propsSchema);
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
          const c = ln?.theming, l = mo(
            c?.global?.cssVariables,
            c?.children?.cssVariables
          );
          ho(n, l);
        } catch {
        }
        if (e.customCss !== !1)
          try {
            const c = ln?.theming, l = [c?.global?.customCSS, c?.children?.customCSS].filter(Boolean).join(`
`);
            l && yo(n, l);
          } catch {
          }
        (e.hostCssKeys === void 0 || e.hostCssKeys.length > 0) && vo(n, e.hostCssKeys), r = document.createElement("div"), r.setAttribute("data-wippy-theme-root", "");
        const i = e.containerClasses ?? [];
        i.length > 0 && r.classList.add(...i), n.appendChild(r), this._container = r, ro(no);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = oo("@theme", (i) => this._applyTheme(i)));
      const { props: o, errors: a } = Pt(this, e.propsSchema);
      e.validateProps && a.push(...e.validateProps(o));
      const s = o;
      this._lastProps = s, this._lastErrors = a;
      let d = null;
      e.contentTemplate && (d = this._extractContent(e.contentTemplate), this._lastContent = d, this._contentObserver = new MutationObserver(() => {
        const i = this._extractContent(e.contentTemplate);
        this._lastContent = i, this._reactive?.notifyContent(i), this.onContentChanged(i);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(n, r, s, a, d, t), this._internals.states.delete("loading"), this._internals.states.add("ready"), t || (this._initialized = !0), this.onReady(), this.emitEvent("load");
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
  _applyTheme(e = Qt.getThemeMode?.()) {
    ft(e, this), this._container && ft(e, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), ft("auto", this), this._container && ft("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(e, t, n) {
    if (t === n)
      return;
    if (e === Nt) {
      const d = this._hostVisible, i = dn(this);
      if (i === d)
        return;
      this._hostVisible = i, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(i, d), this.onHostVisibilityChanged(i, d));
      return;
    }
    const r = this.constructor.wippyConfig, { props: o, errors: a } = Pt(this, r.propsSchema);
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
  const e = Yr(!0), t = e.run(() => V({}));
  let n = [], r = [];
  const o = Zr({
    install(a) {
      Jn(o), o._a = a, a.provide(Xn, o), a.config.globalProperties.$pinia = o, r.forEach((s) => n.push(s)), r = [];
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
    let s;
    try {
      s = Promise.resolve(e());
    } catch (i) {
      s = Promise.reject(i);
    }
    const d = s.finally(() => {
      if (r === d && (r = null, n && o))
        return o = !1, a();
    });
    return r = d, d;
  }
  return qt(() => (n = !0, a())), Kn(() => {
    n = !1, o = !1;
  }), Te(t, (s, d) => {
    if (n && d === !1 && s === !0)
      return a();
  }), t;
}
var Bo = class extends $o {
  constructor() {
    super(...arguments), Re(this, "_vueApp", null), Re(this, "_propsRef", V({})), Re(this, "_errorsRef", V([])), Re(this, "_contentRef", V(null)), Re(this, "_hostVisibilityRef", V(null)), Re(this, "_bridgeAbort", null);
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
    for (const c of r)
      this.emitEvent("invalid", { message: c });
    const d = new AbortController();
    this._bridgeAbort = d, this.reactive.props.subscribe((c, l) => {
      this._propsRef.value = c, this._errorsRef.value = [...l];
      for (const u of l)
        this.emitEvent("invalid", { message: u });
    }, { signal: d.signal }), this.reactive.content && this.reactive.content.subscribe((c) => {
      this._contentRef.value = c;
    }, { signal: d.signal }), this.reactive.hostVisibility.subscribe((c) => {
      this._hostVisibilityRef.value = c;
    }, { signal: d.signal });
    const i = (c) => {
      if (d.signal.aborted)
        return;
      const l = Co(), u = Qr(c.rootComponent);
      this._vueApp = u;
      const p = Po();
      if (c.piniaPlugins)
        for (const m of c.piniaPlugins)
          p.use(m);
      if (u.use(p), c.plugins)
        for (const m of c.plugins)
          u.use(m);
      u.provide(Lo, this._propsRef), u.provide(Eo, this._errorsRef), u.provide(Ao, this.emitEvent.bind(this)), u.provide(No, this._contentRef), u.provide(er, this._hostVisibilityRef), u.provide(jo, _o(this)), u.provide(zo, So(this)), u.provide(Io, Zn(this)), c.providers && c.providers(u, this), u.mount(t), l && Jn(l);
    };
    if (s.rootComponent)
      i(s);
    else if (s.lazyConfig) {
      const c = document.createElement("wippy-loading");
      c.setAttribute("no-bg", ""), t.appendChild(c), s.lazyConfig().then((l) => {
        d.signal.aborted || (c.remove(), i(l));
      }).catch((l) => {
        if (d.signal.aborted)
          return;
        const u = l instanceof Error ? l.message : String(l), p = document.createElement("wippy-error");
        p.setAttribute("title", "Failed to load"), p.setAttribute("message", u), c.replaceWith(p), this.emitEvent("error", { message: u });
      });
    } else
      throw new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._vueApp && (this._vueApp.unmount(), this._vueApp = null);
  }
}, Do = Object.defineProperty, un = Object.getOwnPropertySymbols, Mo = Object.prototype.hasOwnProperty, Fo = Object.prototype.propertyIsEnumerable, pn = (e, t, n) => t in e ? Do(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, Uo = (e, t) => {
  for (var n in t || (t = {})) Mo.call(t, n) && pn(e, n, t[n]);
  if (un) for (var n of un(t)) Fo.call(t, n) && pn(e, n, t[n]);
  return e;
};
function Ie(e) {
  return e == null || e === "" || Array.isArray(e) && e.length === 0 || !(e instanceof Date) && typeof e == "object" && Object.keys(e).length === 0;
}
function jt(e, t, n = /* @__PURE__ */ new WeakSet()) {
  if (e === t) return !0;
  if (!e || !t || typeof e != "object" || typeof t != "object" || n.has(e) || n.has(t)) return !1;
  n.add(e).add(t);
  let r = Array.isArray(e), o = Array.isArray(t), a, s, d;
  if (r && o) {
    if (s = e.length, s != t.length) return !1;
    for (a = s; a-- !== 0; ) if (!jt(e[a], t[a], n)) return !1;
    return !0;
  }
  if (r != o) return !1;
  let i = e instanceof Date, c = t instanceof Date;
  if (i != c) return !1;
  if (i && c) return e.getTime() == t.getTime();
  let l = e instanceof RegExp, u = t instanceof RegExp;
  if (l != u) return !1;
  if (l && u) return e.toString() == t.toString();
  let p = Object.keys(e);
  if (s = p.length, s !== Object.keys(t).length) return !1;
  for (a = s; a-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(t, p[a])) return !1;
  for (a = s; a-- !== 0; ) if (d = p[a], !jt(e[d], t[d], n)) return !1;
  return !0;
}
function Wo(e, t) {
  return jt(e, t);
}
function Jt(e) {
  return typeof e == "function" && "call" in e && "apply" in e;
}
function q(e) {
  return !Ie(e);
}
function fn(e, t) {
  return null;
}
function tr(e, t, n) {
  return n ? fn() === fn() : Wo(e, t);
}
function we(e, t = !0) {
  return e instanceof Object && e.constructor === Object && (t || Object.keys(e).length !== 0);
}
function nr(e = {}, t = {}) {
  let n = Uo({}, e);
  return Object.keys(t).forEach((r) => {
    let o = r;
    we(t[o]) && o in e && we(e[o]) ? n[o] = nr(e[o], t[o]) : n[o] = t[o];
  }), n;
}
function Ho(...e) {
  return e.reduce((t, n, r) => r === 0 ? n : nr(t, n), {});
}
function ue(e, ...t) {
  return Jt(e) ? e(...t) : e;
}
function de(e, t = !0) {
  return typeof e == "string" && (t || e !== "");
}
function xe(e) {
  return de(e) ? e.replace(/(-|_)/g, "").toLowerCase() : e;
}
function Xt(e, t = "", n = {}) {
  let r = xe(t).split("."), o = r.shift();
  if (o) {
    if (we(e)) {
      let a = Object.keys(e).find((s) => xe(s) === o) || "";
      return Xt(ue(e[a], n), r.join("."), n);
    }
    return;
  }
  return ue(e, n);
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
function Ge(e) {
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
function $e(...e) {
  if (e) {
    let t = [];
    for (let n = 0; n < e.length; n++) {
      let r = e[n];
      if (!r) continue;
      let o = typeof r;
      if (o === "string" || o === "number") t.push(r);
      else if (o === "object") {
        let a = Array.isArray(r) ? [$e(...r)] : Object.entries(r).map(([s, d]) => d ? s : void 0);
        t = a.length ? t.concat(a.filter((s) => !!s)) : t;
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
function Tt(e, t) {
  if (e && t) {
    let n = (r) => {
      e.classList ? e.classList.remove(r) : e.className = e.className.replace(new RegExp("(^|\\b)" + r.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [t].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function mn(e) {
  return e ? Math.abs(e.scrollLeft) : 0;
}
function bn(e) {
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
function gt(e, t = {}) {
  if (ut(e)) {
    let n = (r, o) => {
      var a, s;
      let d = (a = e?.$attrs) != null && a[r] ? [(s = e?.$attrs) == null ? void 0 : s[r]] : [];
      return [o].flat().reduce((i, c) => {
        if (c != null) {
          let l = typeof c;
          if (l === "string" || l === "number") i.push(c);
          else if (l === "object") {
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
        a ? e.addEventListener(a[1].toLowerCase(), o) : r === "p-bind" || r === "pBind" ? gt(e, o) : (o = r === "class" ? [...new Set(n("class", o))].join(" ").trim() : r === "style" ? n("style", o).join(";").trim() : o, (e.$attrs = e.$attrs || {}) && (e.$attrs[r] = o), e.setAttribute(r, o));
      }
    });
  }
}
function Xo(e, t = {}, ...n) {
  {
    let r = document.createElement(e);
    return gt(r, t), r.append(...n), r;
  }
}
function Qe(e, t) {
  return ut(e) ? e.matches(t) ? e : e.querySelector(t) : null;
}
function ea(e, t) {
  e && document.activeElement !== e && e.focus(t);
}
function We(e, t) {
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
function He(e) {
  if (e) {
    let t = e.getBoundingClientRect();
    return { top: t.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: t.left + (window.pageXOffset || mn(document.documentElement) || mn(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function sr(e, t) {
  return e ? e.offsetHeight : 0;
}
function qe(e) {
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
var mt = {};
function na(e = "pui_id_") {
  return Object.hasOwn(mt, e) || (mt[e] = 0), mt[e]++, `${e}${mt[e]}`;
}
var ra = Object.defineProperty, oa = Object.defineProperties, aa = Object.getOwnPropertyDescriptors, yt = Object.getOwnPropertySymbols, dr = Object.prototype.hasOwnProperty, cr = Object.prototype.propertyIsEnumerable, hn = (e, t, n) => t in e ? ra(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, ge = (e, t) => {
  for (var n in t || (t = {})) dr.call(t, n) && hn(e, n, t[n]);
  if (yt) for (var n of yt(t)) cr.call(t, n) && hn(e, n, t[n]);
  return e;
}, Ot = (e, t) => oa(e, aa(t)), _e = (e, t) => {
  var n = {};
  for (var r in e) dr.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
  if (e != null && yt) for (var r of yt(e)) t.indexOf(r) < 0 && cr.call(e, r) && (n[r] = e[r]);
  return n;
}, ia = ar(), ne = ia, Je = /{([^}]*)}/g, ur = /(\d+\s+[\+\-\*\/]\s+\d+)/g, pr = /var\([^)]+\)/g;
function vn(e) {
  return de(e) ? e.replace(/[A-Z]/g, (t, n) => n === 0 ? t : "." + t.toLowerCase()).toLowerCase() : e;
}
function sa(e) {
  return we(e) && e.hasOwnProperty("$value") && e.hasOwnProperty("$type") ? e.$value : e;
}
function la(e) {
  return e.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function It(e = "", t = "") {
  return la(`${de(e, !1) && de(t, !1) ? `${e}-` : e}${t}`);
}
function fr(e = "", t = "") {
  return `--${It(e, t)}`;
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
      let s = a.replaceAll(Je, (d) => {
        let i = d.replace(/{|}/g, "").split(".").filter((c) => !r.some((l) => Ne(c, l)));
        return `var(${fr(n, or(i.join("-")))}${q(o) ? `, ${o}` : ""})`;
      });
      return Ne(s.replace(pr, "0"), ur) ? `calc(${s})` : s;
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
  function n(s, d) {
    let i = [], c = 0, l = "", u = null, p = 0;
    for (; c <= s.length; ) {
      let m = s[c];
      if ((m === '"' || m === "'" || m === "`") && s[c - 1] !== "\\" && (u = u === m ? null : m), !u && (m === "(" && p++, m === ")" && p--, (m === "," || c === s.length) && p === 0)) {
        let x = l.trim();
        x.startsWith("dt(") ? i.push(br(x, d)) : i.push(r(x)), l = "", c++;
        continue;
      }
      m !== void 0 && (l += m), c++;
    }
    return i;
  }
  function r(s) {
    let d = s[0];
    if ((d === '"' || d === "'" || d === "`") && s[s.length - 1] === d) return s.slice(1, -1);
    let i = Number(s);
    return isNaN(i) ? s : i;
  }
  let o = [], a = [];
  for (let s = 0; s < e.length; s++) if (e[s] === "d" && e.slice(s, s + 3) === "dt(") a.push(s), s += 2;
  else if (e[s] === ")" && a.length > 0) {
    let d = a.pop();
    a.length === 0 && o.push([d, s]);
  }
  if (!o.length) return e;
  for (let s = o.length - 1; s >= 0; s--) {
    let [d, i] = o[s], c = e.slice(d + 3, i), l = n(c, t), u = t(...l);
    e = e.slice(0, d) + u + e.slice(i + 1);
  }
  return e;
}
var je = (...e) => ua(G.getTheme(), ...e), ua = (e = {}, t, n, r) => {
  if (t) {
    let { variable: o, options: a } = G.defaults || {}, { prefix: s, transform: d } = e?.options || a || {}, i = Ne(t, Je) ? t : `{${t}}`;
    return r === "value" || Ie(r) && d === "strict" ? G.getTokenValue(t) : mr(i, void 0, s, [o.excludedKeyRegex], n);
  }
  return "";
};
function bt(e, ...t) {
  if (e instanceof Array) {
    let n = e.reduce((r, o, a) => {
      var s;
      return r + o + ((s = ue(t[a], { dt: je })) != null ? s : "");
    }, "");
    return br(n, je);
  }
  return ue(e, { dt: je });
}
function pa(e, t = {}) {
  let n = G.defaults.variable, { prefix: r = n.prefix, selector: o = n.selector, excludedKeyRegex: a = n.excludedKeyRegex } = t, s = [], d = [], i = [{ node: e, path: r }];
  for (; i.length; ) {
    let { node: l, path: u } = i.pop();
    for (let p in l) {
      let m = l[p], x = sa(m), T = Ne(p, a) ? It(u) : It(u, or(p));
      if (we(x)) i.push({ node: x, path: T });
      else {
        let C = fr(T), _ = mr(x, T, r, [a]);
        ca(d, C, _);
        let O = T;
        r && O.startsWith(r + "-") && (O = O.slice(r.length + 1)), s.push(O.replace(/-/g, "."));
      }
    }
  }
  let c = d.join("");
  return { value: d, tokens: s, declarations: c, css: Ve(o, c) };
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
  var a, s, d, i, c, l, u;
  let { preset: p, options: m } = t, x, T, C, _, O, B, k;
  if (q(p) && m.transform !== "strict") {
    let { primitive: g, semantic: D, extend: I } = p, K = D || {}, { colorScheme: ae } = K, Y = _e(K, ["colorScheme"]), ce = I || {}, { colorScheme: pe } = ce, be = _e(ce, ["colorScheme"]), j = ae || {}, { dark: $ } = j, P = _e(j, ["dark"]), J = pe || {}, { dark: X } = J, Oe = _e(J, ["dark"]), he = q(g) ? this._toVariables({ primitive: g }, m) : {}, fe = q(Y) ? this._toVariables({ semantic: Y }, m) : {}, se = q(P) ? this._toVariables({ light: P }, m) : {}, w = q($) ? this._toVariables({ dark: $ }, m) : {}, v = q(be) ? this._toVariables({ semantic: be }, m) : {}, S = q(Oe) ? this._toVariables({ light: Oe }, m) : {}, re = q(X) ? this._toVariables({ dark: X }, m) : {}, [Me, pt] = [(a = he.declarations) != null ? a : "", he.tokens], [Er, Nr] = [(s = fe.declarations) != null ? s : "", fe.tokens || []], [jr, zr] = [(d = se.declarations) != null ? d : "", se.tokens || []], [Ir, Rr] = [(i = w.declarations) != null ? i : "", w.tokens || []], [Vr, Br] = [(c = v.declarations) != null ? c : "", v.tokens || []], [Dr, Mr] = [(l = S.declarations) != null ? l : "", S.tokens || []], [Fr, Ur] = [(u = re.declarations) != null ? u : "", re.tokens || []];
    x = this.transformCSS(e, Me, "light", "variable", m, r, o), T = pt;
    let Wr = this.transformCSS(e, `${Er}${jr}`, "light", "variable", m, r, o), Hr = this.transformCSS(e, `${Ir}`, "dark", "variable", m, r, o);
    C = `${Wr}${Hr}`, _ = [.../* @__PURE__ */ new Set([...Nr, ...zr, ...Rr])];
    let Kr = this.transformCSS(e, `${Vr}${Dr}color-scheme:light`, "light", "variable", m, r, o), Gr = this.transformCSS(e, `${Fr}color-scheme:dark`, "dark", "variable", m, r, o);
    O = `${Kr}${Gr}`, B = [.../* @__PURE__ */ new Set([...Br, ...Mr, ...Ur])], k = ue(p.css, { dt: je });
  }
  return { primitive: { css: x, tokens: T }, semantic: { css: C, tokens: _ }, global: { css: O, tokens: B }, style: k };
}, getPreset({ name: e = "", preset: t = {}, options: n, params: r, set: o, defaults: a, selector: s }) {
  var d, i, c;
  let l, u, p;
  if (q(t) && n.transform !== "strict") {
    let m = e.replace("-directive", ""), x = t, { colorScheme: T, extend: C, css: _ } = x, O = _e(x, ["colorScheme", "extend", "css"]), B = C || {}, { colorScheme: k } = B, g = _e(B, ["colorScheme"]), D = T || {}, { dark: I } = D, K = _e(D, ["dark"]), ae = k || {}, { dark: Y } = ae, ce = _e(ae, ["dark"]), pe = q(O) ? this._toVariables({ [m]: ge(ge({}, O), g) }, n) : {}, be = q(K) ? this._toVariables({ [m]: ge(ge({}, K), ce) }, n) : {}, j = q(I) ? this._toVariables({ [m]: ge(ge({}, I), Y) }, n) : {}, [$, P] = [(d = pe.declarations) != null ? d : "", pe.tokens || []], [J, X] = [(i = be.declarations) != null ? i : "", be.tokens || []], [Oe, he] = [(c = j.declarations) != null ? c : "", j.tokens || []], fe = this.transformCSS(m, `${$}${J}`, "light", "variable", n, o, a, s), se = this.transformCSS(m, Oe, "dark", "variable", n, o, a, s);
    l = `${fe}${se}`, u = [.../* @__PURE__ */ new Set([...P, ...X, ...he])], p = ue(_, { dt: je });
  }
  return { css: l, tokens: u, style: p };
}, getPresetC({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var a;
  let { preset: s, options: d } = t, i = (a = s?.components) == null ? void 0 : a[e];
  return this.getPreset({ name: e, preset: i, options: d, params: n, set: r, defaults: o });
}, getPresetD({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var a, s;
  let d = e.replace("-directive", ""), { preset: i, options: c } = t, l = ((a = i?.components) == null ? void 0 : a[d]) || ((s = i?.directives) == null ? void 0 : s[d]);
  return this.getPreset({ name: d, preset: l, options: c, params: n, set: r, defaults: o });
}, applyDarkColorScheme(e) {
  return !(e.darkModeSelector === "none" || e.darkModeSelector === !1);
}, getColorSchemeOption(e, t) {
  var n;
  return this.applyDarkColorScheme(e) ? this.regex.resolve(e.darkModeSelector === !0 ? t.options.darkModeSelector : (n = e.darkModeSelector) != null ? n : t.options.darkModeSelector) : [];
}, getLayerOrder(e, t = {}, n, r) {
  let { cssLayer: o } = t;
  return o ? `@layer ${ue(o.order || o.name || "primeui", n)}` : "";
}, getCommonStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: o, defaults: a }) {
  let s = this.getCommon({ name: e, theme: t, params: n, set: o, defaults: a }), d = Object.entries(r).reduce((i, [c, l]) => i.push(`${c}="${l}"`) && i, []).join(" ");
  return Object.entries(s || {}).reduce((i, [c, l]) => {
    if (we(l) && Object.hasOwn(l, "css")) {
      let u = Ge(l.css), p = `${c}-variables`;
      i.push(`<style type="text/css" data-primevue-style-id="${p}" ${d}>${u}</style>`);
    }
    return i;
  }, []).join("");
}, getStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: o, defaults: a }) {
  var s;
  let d = { name: e, theme: t, params: n, set: o, defaults: a }, i = (s = e.includes("-directive") ? this.getPresetD(d) : this.getPresetC(d)) == null ? void 0 : s.css, c = Object.entries(r).reduce((l, [u, p]) => l.push(`${u}="${p}"`) && l, []).join(" ");
  return i ? `<style type="text/css" data-primevue-style-id="${e}-variables" ${c}>${Ge(i)}</style>` : "";
}, createTokens(e = {}, t, n = "", r = "", o = {}) {
  let a = function(d, i = {}, c = []) {
    if (c.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: d, path: this.path, paths: i, value: void 0 };
    c.push(this.path), i.name = this.path, i.binding || (i.binding = {});
    let l = this.value;
    if (typeof this.value == "string" && Je.test(this.value)) {
      let u = this.value.trim().replace(Je, (p) => {
        var m;
        let x = p.slice(1, -1), T = this.tokens[x];
        if (!T) return console.warn(`Token not found for path: ${x}`), "__UNRESOLVED__";
        let C = T.computed(d, i, c);
        return Array.isArray(C) && C.length === 2 ? `light-dark(${C[0].value},${C[1].value})` : (m = C?.value) != null ? m : "__UNRESOLVED__";
      });
      l = ur.test(u.replace(pr, "0")) ? `calc(${u})` : u;
    }
    return Ie(i.binding) && delete i.binding, c.pop(), { colorScheme: d, path: this.path, paths: i, value: l.includes("__UNRESOLVED__") ? void 0 : l };
  }, s = (d, i, c) => {
    Object.entries(d).forEach(([l, u]) => {
      let p = Ne(l, t.variable.excludedKeyRegex) ? i : i ? `${i}.${vn(l)}` : vn(l), m = c ? `${c}.${l}` : l;
      we(u) ? s(u, p, m) : (o[p] || (o[p] = { paths: [], computed: (x, T = {}, C = []) => {
        if (o[p].paths.length === 1) return o[p].paths[0].computed(o[p].paths[0].scheme, T.binding, C);
        if (x && x !== "none") for (let _ = 0; _ < o[p].paths.length; _++) {
          let O = o[p].paths[_];
          if (O.scheme === x) return O.computed(x, T.binding, C);
        }
        return o[p].paths.map((_) => _.computed(_.scheme, T[_.scheme], C));
      } }), o[p].paths.push({ path: m, value: u, scheme: m.includes("colorScheme.light") ? "light" : m.includes("colorScheme.dark") ? "dark" : "none", computed: a, tokens: o }));
    });
  };
  return s(e, n, r), o;
}, getTokenValue(e, t, n) {
  var r;
  let o = ((d) => d.split(".").filter((i) => !Ne(i.toLowerCase(), n.variable.excludedKeyRegex)).join("."))(t), a = t.includes("colorScheme.light") ? "light" : t.includes("colorScheme.dark") ? "dark" : void 0, s = [(r = e[o]) == null ? void 0 : r.computed(a)].flat().filter((d) => d);
  return s.length === 1 ? s[0].value : s.reduce((d = {}, i) => {
    let c = i, { colorScheme: l } = c, u = _e(c, ["colorScheme"]);
    return d[l] = u, d;
  }, void 0);
}, getSelectorRule(e, t, n, r) {
  return n === "class" || n === "attr" ? Ve(q(t) ? `${e}${t},${e} ${t}` : e, r) : Ve(e, Ve(t ?? ":root,:host", r));
}, transformCSS(e, t, n, r, o = {}, a, s, d) {
  if (q(t)) {
    let { cssLayer: i } = o;
    if (r !== "style") {
      let c = this.getColorSchemeOption(o, s);
      t = n === "dark" ? c.reduce((l, { type: u, selector: p }) => (q(p) && (l += p.includes("[CSS]") ? p.replace("[CSS]", t) : this.getSelectorRule(p, d, u, t)), l), "") : Ve(d ?? ":root,:host", t);
    }
    if (i) {
      let c = { name: "primeui" };
      we(i) && (c.name = ue(i.name, { name: e, type: r })), q(c.name) && (t = Ve(`@layer ${c.name}`, t), a?.layerNames(c.name));
    }
    return t;
  }
  return "";
} }, G = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(e = {}) {
  let { theme: t } = e;
  t && (this._theme = Ot(ge({}, t), { options: ge(ge({}, this.defaults.options), t.options) }), this._tokens = ve.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
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
  this._theme = Ot(ge({}, this.theme), { preset: e }), this._tokens = ve.createTokens(e, this.defaults), this.clearLoadedStyleNames(), ne.emit("preset:change", e), ne.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(e) {
  this._theme = Ot(ge({}, this.theme), { options: e }), this.clearLoadedStyleNames(), ne.emit("options:change", e), ne.emit("theme:change", this.theme);
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
} }, oe = {
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
function gn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function yn(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? gn(Object(n), !0).forEach(function(r) {
      ma(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : gn(Object(n)).forEach(function(r) {
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
  Et() && Et().components ? qt(e) : t ? e() : Yt(e);
}
var ga = 0;
function ya(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = V(!1), r = V(e), o = V(null), a = lr() ? window.document : void 0, s = t.document, d = s === void 0 ? a : s, i = t.immediate, c = i === void 0 ? !0 : i, l = t.manual, u = l === void 0 ? !1 : l, p = t.name, m = p === void 0 ? "style_".concat(++ga) : p, x = t.id, T = x === void 0 ? void 0 : x, C = t.media, _ = C === void 0 ? void 0 : C, O = t.nonce, B = O === void 0 ? void 0 : O, k = t.first, g = k === void 0 ? !1 : k, D = t.onMounted, I = D === void 0 ? void 0 : D, K = t.onUpdated, ae = K === void 0 ? void 0 : K, Y = t.onLoad, ce = Y === void 0 ? void 0 : Y, pe = t.props, be = pe === void 0 ? {} : pe, j = function() {
  }, $ = function(X) {
    var Oe = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (d) {
      var he = yn(yn({}, be), Oe), fe = he.name || m, se = he.id || T, w = he.nonce || B;
      o.value = d.querySelector('style[data-primevue-style-id="'.concat(fe, '"]')) || d.getElementById(se) || d.createElement("style"), o.value.isConnected || (r.value = X || e, gt(o.value, {
        type: "text/css",
        id: se,
        media: _,
        nonce: w
      }), g ? d.head.prepend(o.value) : d.head.appendChild(o.value), ta(o.value, "data-primevue-style-id", fe), gt(o.value, he), o.value.onload = function(v) {
        return ce?.(v, {
          name: fe
        });
      }, I?.(fe)), !n.value && (j = Te(r, function(v) {
        o.value.textContent = v, ae?.(fe);
      }, {
        immediate: !0
      }), n.value = !0);
    }
  }, P = function() {
    !d || !n.value || (j(), Jo(o.value) && d.head.removeChild(o.value), n.value = !1, o.value = null);
  };
  return c && !u && va($), {
    id: T,
    name: m,
    el: o,
    css: r,
    unload: P,
    load: $,
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
var xn, kn, wn, $n;
function Sn(e, t) {
  return $a(e) || wa(e, t) || ka(e, t) || xa();
}
function xa() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ka(e, t) {
  if (e) {
    if (typeof e == "string") return _n(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? _n(e, t) : void 0;
  }
}
function _n(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function wa(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, o, a, s, d = [], i = !0, c = !1;
    try {
      if (a = (n = n.call(e)).next, t !== 0) for (; !(i = (r = a.call(n)).done) && (d.push(r.value), d.length !== t); i = !0) ;
    } catch (l) {
      c = !0, o = l;
    } finally {
      try {
        if (!i && n.return != null && (s = n.return(), Object(s) !== s)) return;
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
function At(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Cn(Object(n), !0).forEach(function(r) {
      Sa(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Cn(Object(n)).forEach(function(r) {
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
function ht(e, t) {
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
    }, o = r(bt(xn || (xn = ht(["", ""])), t));
    return q(o) ? ya(Ge(o), At({
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
      return G.transformCSS(n.name || t.name, "".concat(o).concat(bt(kn || (kn = ht(["", ""])), r)));
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
      var r = ue(this.css, {
        dt: je
      }) || "", o = Ge(bt(wn || (wn = ht(["", "", ""])), r, t)), a = Object.entries(n).reduce(function(s, d) {
        var i = Sn(d, 2), c = i[0], l = i[1];
        return s.push("".concat(c, '="').concat(l, '"')) && s;
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
      var o = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), a = bt($n || ($n = ht(["", ""])), ue(this.style, {
        dt: je
      })), s = Ge(G.transformCSS(o, a)), d = Object.entries(n).reduce(function(i, c) {
        var l = Sn(c, 2), u = l[0], p = l[1];
        return i.push("".concat(u, '="').concat(p, '"')) && i;
      }, []).join(" ");
      q(s) && r.push('<style type="text/css" data-primevue-style-id="'.concat(o, '" ').concat(d, ">").concat(s, "</style>"));
    }
    return r.join("");
  },
  extend: function(t) {
    return At(At({}, this), {}, {
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
function vt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Pn(Object(n), !0).forEach(function(r) {
      Aa(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Pn(Object(n)).forEach(function(r) {
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
    text: [oe.STARTS_WITH, oe.CONTAINS, oe.NOT_CONTAINS, oe.ENDS_WITH, oe.EQUALS, oe.NOT_EQUALS],
    numeric: [oe.EQUALS, oe.NOT_EQUALS, oe.LESS_THAN, oe.LESS_THAN_OR_EQUAL_TO, oe.GREATER_THAN, oe.GREATER_THAN_OR_EQUAL_TO],
    date: [oe.DATE_IS, oe.DATE_IS_NOT, oe.DATE_BEFORE, oe.DATE_AFTER]
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
  var n = V(!1), r = function() {
    var c;
    if (((c = t.config) === null || c === void 0 ? void 0 : c.theme) !== "none" && !G.isStyleNameLoaded("common")) {
      var l, u, p = ((l = H.getCommonTheme) === null || l === void 0 ? void 0 : l.call(H)) || {}, m = p.primitive, x = p.semantic, T = p.global, C = p.style, _ = {
        nonce: (u = t.config) === null || u === void 0 || (u = u.csp) === null || u === void 0 ? void 0 : u.nonce
      };
      H.load(m?.css, vt({
        name: "primitive-variables"
      }, _)), H.load(x?.css, vt({
        name: "semantic-variables"
      }, _)), H.load(T?.css, vt({
        name: "global-variables"
      }, _)), H.loadStyle(vt({
        name: "global-style"
      }, _), C), G.setLoadedStyleName("common");
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
  }), s = Te(function() {
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
  Be.push(o), Be.push(a), Be.push(s), Be.push(d);
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
  }) : o.mounted ? (f(), N(Gn, {
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
var Tn = H.extend({
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
function Fe(e, t) {
  return yr(e) || Ua(e, t) || gr(e, t) || vr();
}
function vr() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function gr(e, t) {
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
function Ua(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, o, a, s, d = [], i = !0, c = !1;
    try {
      if (a = (n = n.call(e)).next, t === 0) {
        if (Object(n) !== n) return;
        i = !1;
      } else for (; !(i = (r = a.call(n)).done) && (d.push(r.value), d.length !== t); i = !0) ;
    } catch (l) {
      c = !0, o = l;
    } finally {
      try {
        if (!i && n.return != null && (s = n.return(), Object(s) !== s)) return;
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
function M(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? On(Object(n), !0).forEach(function(r) {
      Ke(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : On(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Ke(e, t, n) {
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
var Se = {
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
    var t, n, r, o, a, s, d, i, c, l, u, p = (t = this.pt) === null || t === void 0 ? void 0 : t._usept, m = p ? (n = this.pt) === null || n === void 0 || (n = n.originalValue) === null || n === void 0 ? void 0 : n[this.$.type.name] : void 0, x = p ? (r = this.pt) === null || r === void 0 || (r = r.value) === null || r === void 0 ? void 0 : r[this.$.type.name] : this.pt;
    (o = x || m) === null || o === void 0 || (o = o.hooks) === null || o === void 0 || (a = o.onBeforeCreate) === null || a === void 0 || a.call(o);
    var T = (s = this.$primevueConfig) === null || s === void 0 || (s = s.pt) === null || s === void 0 ? void 0 : s._usept, C = T ? (d = this.$primevue) === null || d === void 0 || (d = d.config) === null || d === void 0 || (d = d.pt) === null || d === void 0 ? void 0 : d.originalValue : void 0, _ = T ? (i = this.$primevue) === null || i === void 0 || (i = i.config) === null || i === void 0 || (i = i.pt) === null || i === void 0 ? void 0 : i.value : (c = this.$primevue) === null || c === void 0 || (c = c.config) === null || c === void 0 ? void 0 : c.pt;
    (l = _ || C) === null || l === void 0 || (l = l[this.$.type.name]) === null || l === void 0 || (l = l.hooks) === null || l === void 0 || (u = l.onBeforeCreate) === null || u === void 0 || u.call(l), this.$attrSelector = Da(), this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
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
      return Jt(t) ? t.apply(void 0, r) : E.apply(void 0, r);
    },
    _load: function() {
      Ae.isStyleNameLoaded("base") || (H.loadCSS(this.$styleOptions), this._loadGlobalStyles(), Ae.setLoadedStyleName("base")), this._loadThemeStyles();
    },
    _loadStyles: function() {
      this._load(), this._themeChangeListener(this._load);
    },
    _loadCoreStyles: function() {
      var t, n;
      !Ae.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name && (Tn.loadCSS(this.$styleOptions), this.$options.style && this.$style.loadCSS(this.$styleOptions), Ae.setLoadedStyleName(this.$style.name));
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
          var r, o, a = ((r = this.$style) === null || r === void 0 || (o = r.getCommonTheme) === null || o === void 0 ? void 0 : o.call(r)) || {}, s = a.primitive, d = a.semantic, i = a.global, c = a.style;
          H.load(s?.css, M({
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
          var l, u, p, m, x = ((l = this.$style) === null || l === void 0 || (u = l.getComponentTheme) === null || u === void 0 ? void 0 : u.call(l)) || {}, T = x.css, C = x.style;
          (p = this.$style) === null || p === void 0 || p.load(T, M({
            name: "".concat(this.$style.name, "-variables")
          }, this.$styleOptions)), (m = this.$style) === null || m === void 0 || m.loadStyle(M({
            name: "".concat(this.$style.name, "-style")
          }, this.$styleOptions), C), G.setLoadedStyleName(this.$style.name);
        }
        if (!G.isStyleNameLoaded("layer-order")) {
          var _, O, B = (_ = this.$style) === null || _ === void 0 || (O = _.getLayerOrderThemeCSS) === null || O === void 0 ? void 0 : O.call(_);
          H.load(B, M({
            name: "layer-order",
            first: !0
          }, this.$styleOptions)), G.setLoadedStyleName("layer-order");
        }
      }
    },
    _loadScopedThemeStyles: function(t) {
      var n, r, o, a = ((n = this.$style) === null || n === void 0 || (r = n.getPresetTheme) === null || r === void 0 ? void 0 : r.call(n, t, "[".concat(this.$attrSelector, "]"))) || {}, s = a.css, d = (o = this.$style) === null || o === void 0 ? void 0 : o.load(s, M({
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
      return Xt(t, n, r);
    },
    _getPTValue: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, a = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, s = /./g.test(r) && !!o[r.split(".")[0]], d = this._getPropValue("ptOptions") || ((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.ptOptions) || {}, i = d.mergeSections, c = i === void 0 ? !0 : i, l = d.mergeProps, u = l === void 0 ? !1 : l, p = a ? s ? this._useGlobalPT(this._getPTClassValue, r, o) : this._useDefaultPT(this._getPTClassValue, r, o) : void 0, m = s ? void 0 : this._getPTSelf(n, this._getPTClassValue, r, M(M({}, o), {}, {
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
      return r !== "transition" && M(M({}, r === "root" && M(M(Ke({}, "".concat(o, "name"), xe(a ? (n = this.pt) === null || n === void 0 ? void 0 : n["data-pc-section"] : this.$.type.name)), a && Ke({}, "".concat(o, "extend"), xe(this.$.type.name))), {}, Ke({}, "".concat(this.$attrSelector), ""))), {}, Ke({}, "".concat(o, "section"), xe(r)));
    },
    _getPTClassValue: function() {
      var t = this._getOptionValue.apply(this, arguments);
      return de(t) || rr(t) ? {
        class: t
      } : t;
    },
    _getPT: function(t) {
      var n = this, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 ? arguments[2] : void 0, a = function(d) {
        var i, c = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, l = o ? o(d) : d, u = xe(r), p = xe(n.$name);
        return (i = c ? u !== p ? l?.[u] : void 0 : l?.[u]) !== null && i !== void 0 ? i : l;
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
        var s, d = t._usept || ((s = this.$primevueConfig) === null || s === void 0 ? void 0 : s.ptOptions) || {}, i = d.mergeSections, c = i === void 0 ? !0 : i, l = d.mergeProps, u = l === void 0 ? !1 : l, p = a(t.originalValue), m = a(t.value);
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
        var o = this._getOptionValue(this.$style.inlineStyles, t, M(M({}, this.$params), r)), a = this._getOptionValue(Tn.inlineStyles, t, M(M({}, this.$params), r));
        return [a, o];
      }
    }
  },
  computed: {
    globalPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(r) {
        return ue(r, {
          instance: n
        });
      });
    },
    defaultPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(r) {
        return n._getOptionValue(r, n.$name, M({}, n.$params)) || ue(r, M({}, n.$params));
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
        var n = Fe(t, 1), r = n[0];
        return r?.startsWith("pt:");
      }).reduce(function(t, n) {
        var r = Fe(n, 2), o = r[0], a = r[1], s = o.split(":"), d = Ma(s), i = Rt(d).slice(1);
        return i?.reduce(function(c, l, u, p) {
          return !c[l] && (c[l] = u === p.length - 1 ? a : {}), c[l];
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
function Ln(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? An(Object(n), !0).forEach(function(r) {
      qa(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : An(Object(n)).forEach(function(r) {
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
var Ct = {
  name: "BaseIcon",
  extends: Se,
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
      return Ln(Ln({}, !this.isUnstyled && {
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
function En(e, t) {
  return ei(e) || Xa(e, t) || Ja(e, t) || Qa();
}
function Qa() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ja(e, t) {
  if (e) {
    if (typeof e == "string") return Nn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Nn(e, t) : void 0;
  }
}
function Nn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Xa(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, o, a, s, d = [], i = !0, c = !1;
    try {
      if (a = (n = n.call(e)).next, t !== 0) for (; !(i = (r = a.call(n)).done) && (d.push(r.value), d.length !== t); i = !0) ;
    } catch (l) {
      c = !0, o = l;
    } finally {
      try {
        if (!i && n.return != null && (s = n.return(), Object(s) !== s)) return;
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
function U(e) {
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
var z = {
  _getMeta: function() {
    return [we(arguments.length <= 0 ? void 0 : arguments[0]) || arguments.length <= 0 ? void 0 : arguments[0], ue(we(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getConfig: function(t, n) {
    var r, o, a;
    return (r = (t == null || (o = t.instance) === null || o === void 0 ? void 0 : o.$primevue) || (n == null || (a = n.ctx) === null || a === void 0 || (a = a.appContext) === null || a === void 0 || (a = a.config) === null || a === void 0 || (a = a.globalProperties) === null || a === void 0 ? void 0 : a.$primevue)) === null || r === void 0 ? void 0 : r.config;
  },
  _getOptionValue: Xt,
  _getPTValue: function() {
    var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", s = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, d = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, i = function() {
      var O = z._getOptionValue.apply(z, arguments);
      return de(O) || rr(O) ? {
        class: O
      } : O;
    }, c = ((t = r.binding) === null || t === void 0 || (t = t.value) === null || t === void 0 ? void 0 : t.ptOptions) || ((n = r.$primevueConfig) === null || n === void 0 ? void 0 : n.ptOptions) || {}, l = c.mergeSections, u = l === void 0 ? !0 : l, p = c.mergeProps, m = p === void 0 ? !1 : p, x = d ? z._useDefaultPT(r, r.defaultPT(), i, a, s) : void 0, T = z._usePT(r, z._getPT(o, r.$name), i, a, U(U({}, s), {}, {
      global: x || {}
    })), C = z._getPTDatasets(r, a);
    return u || !u && T ? m ? z._mergeProps(r, m, x, T, C) : U(U(U({}, x), T), C) : U(U({}, T), C);
  },
  _getPTDatasets: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = "data-pc-";
    return U(U({}, n === "root" && Vt({}, "".concat(r, "name"), xe(t.$name))), {}, Vt({}, "".concat(r, "section"), xe(n)));
  },
  _getPT: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 ? arguments[2] : void 0, o = function(s) {
      var d, i = r ? r(s) : s, c = xe(n);
      return (d = i?.[c]) !== null && d !== void 0 ? d : i;
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
      var d, i = n._usept || ((d = t.$primevueConfig) === null || d === void 0 ? void 0 : d.ptOptions) || {}, c = i.mergeSections, l = c === void 0 ? !0 : c, u = i.mergeProps, p = u === void 0 ? !1 : u, m = s(n.originalValue), x = s(n.value);
      return m === void 0 && x === void 0 ? void 0 : de(x) ? x : de(m) ? m : l || !l && x ? p ? z._mergeProps(t, p, m, x) : U(U({}, m), x) : x;
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
    if (!Ae.isStyleNameLoaded((t = r.$style) === null || t === void 0 ? void 0 : t.name) && (n = r.$style) !== null && n !== void 0 && n.name) {
      var a;
      H.loadCSS(o), (a = r.$style) === null || a === void 0 || a.loadCSS(o), Ae.setLoadedStyleName(r.$style.name);
    }
  },
  _loadThemeStyles: function() {
    var t, n, r, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, a = arguments.length > 1 ? arguments[1] : void 0;
    if (!(o != null && o.isUnstyled() || (o == null || (t = o.theme) === null || t === void 0 ? void 0 : t.call(o)) === "none")) {
      if (!G.isStyleNameLoaded("common")) {
        var s, d, i = ((s = o.$style) === null || s === void 0 || (d = s.getCommonTheme) === null || d === void 0 ? void 0 : d.call(s)) || {}, c = i.primitive, l = i.semantic, u = i.global, p = i.style;
        H.load(c?.css, U({
          name: "primitive-variables"
        }, a)), H.load(l?.css, U({
          name: "semantic-variables"
        }, a)), H.load(u?.css, U({
          name: "global-variables"
        }, a)), H.loadStyle(U({
          name: "global-style"
        }, a), p), G.setLoadedStyleName("common");
      }
      if (!G.isStyleNameLoaded((n = o.$style) === null || n === void 0 ? void 0 : n.name) && (r = o.$style) !== null && r !== void 0 && r.name) {
        var m, x, T, C, _ = ((m = o.$style) === null || m === void 0 || (x = m.getDirectiveTheme) === null || x === void 0 ? void 0 : x.call(m)) || {}, O = _.css, B = _.style;
        (T = o.$style) === null || T === void 0 || T.load(O, U({
          name: "".concat(o.$style.name, "-variables")
        }, a)), (C = o.$style) === null || C === void 0 || C.loadStyle(U({
          name: "".concat(o.$style.name, "-style")
        }, a), B), G.setLoadedStyleName(o.$style.name);
      }
      if (!G.isStyleNameLoaded("layer-order")) {
        var k, g, D = (k = o.$style) === null || k === void 0 || (g = k.getLayerOrderThemeCSS) === null || g === void 0 ? void 0 : g.call(k);
        H.load(D, U({
          name: "layer-order",
          first: !0
        }, a)), G.setLoadedStyleName("layer-order");
      }
    }
  },
  _loadScopedThemeStyles: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = t.preset();
    if (r && t.$attrSelector) {
      var o, a, s, d = ((o = t.$style) === null || o === void 0 || (a = o.getPresetTheme) === null || a === void 0 ? void 0 : a.call(o, r, "[".concat(t.$attrSelector, "]"))) || {}, i = d.css, c = (s = t.$style) === null || s === void 0 ? void 0 : s.load(i, U({
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
  _hook: function(t, n, r, o, a, s) {
    var d, i, c = "on".concat(qo(n)), l = z._getConfig(o, a), u = r?.$instance, p = z._usePT(u, z._getPT(o == null || (d = o.value) === null || d === void 0 ? void 0 : d.pt, t), z._getOptionValue, "hooks.".concat(c)), m = z._useDefaultPT(u, l == null || (i = l.pt) === null || i === void 0 || (i = i.directives) === null || i === void 0 ? void 0 : i[t], z._getOptionValue, "hooks.".concat(c)), x = {
      el: r,
      binding: o,
      vnode: a,
      prevVnode: s
    };
    p?.(u, x), m?.(u, x);
  },
  /* eslint-disable-next-line no-unused-vars */
  _mergeProps: function() {
    for (var t = arguments.length > 1 ? arguments[1] : void 0, n = arguments.length, r = new Array(n > 2 ? n - 2 : 0), o = 2; o < n; o++)
      r[o - 2] = arguments[o];
    return Jt(t) ? t.apply(void 0, r) : E.apply(void 0, r);
  },
  _extend: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = function(d, i, c, l, u) {
      var p, m, x, T;
      i._$instances = i._$instances || {};
      var C = z._getConfig(c, l), _ = i._$instances[t] || {}, O = Ie(_) ? U(U({}, n), n?.methods) : {};
      i._$instances[t] = U(U({}, _), {}, {
        /* new instance variables to pass in directive methods */
        $name: t,
        $host: i,
        $binding: c,
        $modifiers: c?.modifiers,
        $value: c?.value,
        $el: _.$el || i || void 0,
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
        $primevueConfig: C,
        $attrSelector: (p = i.$pd) === null || p === void 0 || (p = p[t]) === null || p === void 0 ? void 0 : p.attrSelector,
        /* computed instance variables */
        defaultPT: function() {
          return z._getPT(C?.pt, void 0, function(k) {
            var g;
            return k == null || (g = k.directives) === null || g === void 0 ? void 0 : g[t];
          });
        },
        isUnstyled: function() {
          var k, g;
          return ((k = i._$instances[t]) === null || k === void 0 || (k = k.$binding) === null || k === void 0 || (k = k.value) === null || k === void 0 ? void 0 : k.unstyled) !== void 0 ? (g = i._$instances[t]) === null || g === void 0 || (g = g.$binding) === null || g === void 0 || (g = g.value) === null || g === void 0 ? void 0 : g.unstyled : C?.unstyled;
        },
        theme: function() {
          var k;
          return (k = i._$instances[t]) === null || k === void 0 || (k = k.$primevueConfig) === null || k === void 0 ? void 0 : k.theme;
        },
        preset: function() {
          var k;
          return (k = i._$instances[t]) === null || k === void 0 || (k = k.$binding) === null || k === void 0 || (k = k.value) === null || k === void 0 ? void 0 : k.dt;
        },
        /* instance's methods */
        ptm: function() {
          var k, g = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", D = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return z._getPTValue(i._$instances[t], (k = i._$instances[t]) === null || k === void 0 || (k = k.$binding) === null || k === void 0 || (k = k.value) === null || k === void 0 ? void 0 : k.pt, g, U({}, D));
        },
        ptmo: function() {
          var k = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, g = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", D = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return z._getPTValue(i._$instances[t], k, g, D, !1);
        },
        cx: function() {
          var k, g, D = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", I = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return (k = i._$instances[t]) !== null && k !== void 0 && k.isUnstyled() ? void 0 : z._getOptionValue((g = i._$instances[t]) === null || g === void 0 || (g = g.$style) === null || g === void 0 ? void 0 : g.classes, D, U({}, I));
        },
        sx: function() {
          var k, g = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", D = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, I = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return D ? z._getOptionValue((k = i._$instances[t]) === null || k === void 0 || (k = k.$style) === null || k === void 0 ? void 0 : k.inlineStyles, g, U({}, I)) : void 0;
        }
      }, O), i.$instance = i._$instances[t], (m = (x = i.$instance)[d]) === null || m === void 0 || m.call(x, i, c, l, u), i["$".concat(t)] = i.$instance, z._hook(t, d, i, c, l, u), i.$pd || (i.$pd = {}), i.$pd[t] = U(U({}, (T = i.$pd) === null || T === void 0 ? void 0 : T[t]), {}, {
        name: t,
        instance: i._$instances[t]
      });
    }, o = function(d) {
      var i, c, l, u = d._$instances[t], p = u?.watch, m = function(C) {
        var _, O = C.newValue, B = C.oldValue;
        return p == null || (_ = p.config) === null || _ === void 0 ? void 0 : _.call(u, O, B);
      }, x = function(C) {
        var _, O = C.newValue, B = C.oldValue;
        return p == null || (_ = p["config.ripple"]) === null || _ === void 0 ? void 0 : _.call(u, O, B);
      };
      u.$watchersCallback = {
        config: m,
        "config.ripple": x
      }, p == null || (i = p.config) === null || i === void 0 || i.call(u, u?.$primevueConfig), Ee.on("config:change", m), p == null || (c = p["config.ripple"]) === null || c === void 0 || c.call(u, u == null || (l = u.$primevueConfig) === null || l === void 0 ? void 0 : l.ripple), Ee.on("config:ripple:change", x);
    }, a = function(d) {
      var i = d._$instances[t].$watchersCallback;
      i && (Ee.off("config:change", i.config), Ee.off("config:ripple:change", i["config.ripple"]), d._$instances[t].$watchersCallback = void 0);
    };
    return {
      created: function(d, i, c, l) {
        d.$pd || (d.$pd = {}), d.$pd[t] = {
          name: t,
          attrSelector: na("pd")
        }, r("created", d, i, c, l);
      },
      beforeMount: function(d, i, c, l) {
        var u;
        z._loadStyles((u = d.$pd[t]) === null || u === void 0 ? void 0 : u.instance, i, c), r("beforeMount", d, i, c, l), o(d);
      },
      mounted: function(d, i, c, l) {
        var u;
        z._loadStyles((u = d.$pd[t]) === null || u === void 0 ? void 0 : u.instance, i, c), r("mounted", d, i, c, l);
      },
      beforeUpdate: function(d, i, c, l) {
        r("beforeUpdate", d, i, c, l);
      },
      updated: function(d, i, c, l) {
        var u;
        z._loadStyles((u = d.$pd[t]) === null || u === void 0 ? void 0 : u.instance, i, c), r("updated", d, i, c, l);
      },
      beforeUnmount: function(d, i, c, l) {
        var u;
        a(d), z._removeThemeListeners((u = d.$pd[t]) === null || u === void 0 ? void 0 : u.instance), r("beforeUnmount", d, i, c, l);
      },
      unmounted: function(d, i, c, l) {
        var u;
        (u = d.$pd[t]) === null || u === void 0 || (u = u.instance) === null || u === void 0 || (u = u.scopedStyleEl) === null || u === void 0 || (u = u.value) === null || u === void 0 || u.remove(), r("unmounted", d, i, c, l);
      }
    };
  },
  extend: function() {
    var t = z._getMeta.apply(z, arguments), n = En(t, 2), r = n[0], o = n[1];
    return U({
      extend: function() {
        var s = z._getMeta.apply(z, arguments), d = En(s, 2), i = d[0], c = d[1];
        return z.extend(i, U(U(U({}, o), o?.methods), c));
      }
    }, z._extend(r, o));
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
}), ii = z.extend({
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
    if (typeof e == "string") return Bt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Bt(e, t) : void 0;
  }
}
function ci(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function ui(e) {
  if (Array.isArray(e)) return Bt(e);
}
function Bt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function zn(e, t, n) {
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
var en = ii.extend("ripple", {
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
      n || (n = Xo("span", zn(zn({
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
        if (!this.isUnstyled() && Tt(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "false"), !zt(o) && !qe(o)) {
          var a = Math.max(ir(r), sr(r));
          o.style.height = a + "px", o.style.width = a + "px";
        }
        var s = He(r), d = t.pageX - s.left + document.body.scrollTop - qe(o) / 2, i = t.pageY - s.top + document.body.scrollLeft - zt(o) / 2;
        o.style.top = i + "px", o.style.left = d + "px", !this.isUnstyled() && Zo(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "true"), this.timeout = setTimeout(function() {
          o && (!n.isUnstyled() && Tt(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "false"));
        }, 401);
      }
    },
    onAnimationEnd: function(t) {
      this.timeout && clearTimeout(this.timeout), !this.isUnstyled() && Tt(t.currentTarget, "p-ink-active"), t.currentTarget.setAttribute("data-p-ink-active", "false");
    },
    getInk: function(t) {
      return t && t.children ? si(t.children).find(function(n) {
        return We(n, "data-pc-name") === "ripple";
      }) : void 0;
    }
  }
});
const mi = "data-wippy-overlay-layer";
function xr() {
  return typeof window < "u" && typeof window.document < "u";
}
function kr() {
  return xr() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function bi() {
  return kr() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const hi = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let vi = 0;
const xt = /* @__PURE__ */ new WeakMap();
function In(e, t) {
  const n = e.style;
  n.setProperty("position", "fixed", "important"), n.setProperty("inset", "auto", "important"), n.setProperty("margin", "0", "important"), n.setProperty("position-anchor", t), n.setProperty("position-area", "bottom span-right"), n.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), n.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), n.setProperty("max-width", "stretch", "important");
}
function gi(e, t) {
  if (!hi.test(e.className))
    return;
  const n = e.style.cssText;
  In(e, t), e.getAttribute("popover") !== "manual" && e.setAttribute("popover", "manual");
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
      (o.top !== "auto" || o.left !== "auto" || o.margin !== "0px" || o.getPropertyPriority("top") !== "important" || o.getPropertyPriority("left") !== "important" || o.getPropertyPriority("margin") !== "important" || o.getPropertyPriority("min-width") !== "important" || o.maxWidth !== "stretch" || o.getPropertyPriority("max-width") !== "important") && In(e, t);
    });
    r.observe(e, { attributes: !0, attributeFilter: ["style"] }), xt.set(e, r);
  }
}
function tn(e) {
  const t = xt.get(e);
  t && (t.disconnect(), xt.delete(e));
}
function yi(e) {
  const t = e && typeof e.getRootNode == "function" ? e.getRootNode() : null;
  return t instanceof ShadowRoot ? t : null;
}
function Dt(e) {
  e.style.top = "0px", e.style.left = "0px";
  const t = e.getBoundingClientRect();
  e.style.top = `${-window.scrollY - t.top}px`, e.style.left = `${-window.scrollX - t.left}px`;
}
const kt = /* @__PURE__ */ new Set(), nn = /* @__PURE__ */ new WeakMap();
let Rn = !1, Mt = !1;
function xi() {
  Mt = !1;
  for (const e of kt) {
    if (!e.isConnected) {
      for (const t of Array.from(e.children))
        t instanceof HTMLElement && tn(t);
      kt.delete(e), nn.get(e)?.disconnect();
      continue;
    }
    e.childElementCount > 0 && Dt(e);
  }
}
function Vn() {
  Mt || (Mt = !0, requestAnimationFrame(xi));
}
function ki(e) {
  const t = document.createElement("div");
  t.setAttribute(mi, "");
  const n = kr();
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
        for (const d of Array.from(s.addedNodes))
          d instanceof HTMLElement && gi(d, a);
      for (const d of Array.from(s.removedNodes))
        d instanceof HTMLElement && tn(d);
    }
    t.isConnected && t.childElementCount > 0 && Dt(t);
  });
  return r.observe(t, { childList: !0 }), nn.set(t, r), kt.add(t), Rn || (Rn = !0, window.addEventListener("scroll", Vn, { capture: !0, passive: !0 }), window.addEventListener("resize", Vn, { passive: !0 })), t;
}
function Bn(e) {
  if (!(!e.hostRoot || e.layer) && (e.layer = ki(e.hostRoot), bi())) {
    const t = e.$el ? e.$el.parentElement : null;
    t && (e.anchorName = `--wippy-a-${++vi}`, e.anchorTrigger = t, t.style.setProperty("anchor-name", e.anchorName), e.layer.__wippyAnchorName = e.anchorName);
  }
}
function Dn(e) {
  if (e.anchorTrigger && (e.anchorTrigger.style.removeProperty("anchor-name"), e.anchorTrigger = null), e.anchorName = null, e.layer) {
    for (const t of Array.from(e.layer.children))
      t instanceof HTMLElement && tn(t);
    kt.delete(e.layer), nn.get(e.layer)?.disconnect(), e.layer.remove(), e.layer = null;
  }
}
let Mn = !1;
function wi() {
  if (Mn)
    return;
  Mn = !0;
  const e = hr;
  e.computed = e.computed || {}, e.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, e.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, e.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, e.mounted = function() {
    xr() && (this.hostRoot = yi(this.$el), this.mounted = !0, this.hostRoot && (this.inline || Bn(this), this.$watch("inline", (t) => {
      t ? Dn(this) : Bn(this);
    })));
  }, e.render = function() {
    return this.inline ? Q(this.$slots, "default", { key: 0 }) : this.mounted ? eo(Gn, { key: 1, to: this.resolvedTarget || document.body }, [
      Q(this.$slots, "default")
    ]) : A("", !0);
  }, e.unmounted = function() {
    Dn(this);
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
  extends: Se,
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
}, Ft = {
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
      return r ? We(r, "data-p-disabled") || We(r, "data-pc-section") === "activebar" ? this.findNextTab(r) : Qe(r, '[data-pc-name="tab"]') : null;
    },
    findPrevTab: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, r = n ? t : t.previousElementSibling;
      return r ? We(r, "data-p-disabled") || We(r, "data-pc-section") === "activebar" ? this.findPrevTab(r) : Qe(r, '[data-pc-name="tab"]') : null;
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
      return $e({
        active: this.active
      });
    }
  },
  directives: {
    ripple: en
  }
};
function Pi(e, t, n, r, o, a) {
  var s = Zt("ripple");
  return e.asChild ? Q(e.$slots, "default", {
    key: 1,
    dataP: a.dataP,
    class: ke(e.cx("root")),
    active: a.active,
    a11yAttrs: a.a11yAttrs,
    onClick: a.onClick
  }) : De((f(), N(ze(e.as), E({
    key: 0,
    class: e.cx("root"),
    "data-p": a.dataP,
    onClick: a.onClick
  }, a.attrs), {
    default: F(function() {
      return [Q(e.$slots, "default")];
    }),
    _: 3
  }, 16, ["class", "data-p", "onClick"])), [[s]]);
}
Ft.render = Pi;
var wr = {
  name: "ChevronLeftIcon",
  extends: Ct
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
    if (typeof e == "string") return Ut(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ut(e, t) : void 0;
  }
}
function Li(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Ei(e) {
  if (Array.isArray(e)) return Ut(e);
}
function Ut(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Ni(e, t, n, r, o, a) {
  return f(), y("svg", E({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Ti(t[0] || (t[0] = [h("path", {
    d: "M9.61296 13C9.50997 13.0005 9.40792 12.9804 9.3128 12.9409C9.21767 12.9014 9.13139 12.8433 9.05902 12.7701L3.83313 7.54416C3.68634 7.39718 3.60388 7.19795 3.60388 6.99022C3.60388 6.78249 3.68634 6.58325 3.83313 6.43628L9.05902 1.21039C9.20762 1.07192 9.40416 0.996539 9.60724 1.00012C9.81032 1.00371 10.0041 1.08597 10.1477 1.22959C10.2913 1.37322 10.3736 1.56698 10.3772 1.77005C10.3808 1.97313 10.3054 2.16968 10.1669 2.31827L5.49496 6.99022L10.1669 11.6622C10.3137 11.8091 10.3962 12.0084 10.3962 12.2161C10.3962 12.4238 10.3137 12.6231 10.1669 12.7701C10.0945 12.8433 10.0083 12.9014 9.91313 12.9409C9.81801 12.9804 9.71596 13.0005 9.61296 13Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
wr.render = Ni;
var $r = {
  name: "ChevronRightIcon",
  extends: Ct
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
    if (typeof e == "string") return Wt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Wt(e, t) : void 0;
  }
}
function Ri(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Vi(e) {
  if (Array.isArray(e)) return Wt(e);
}
function Wt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Bi(e, t, n, r, o, a) {
  return f(), y("svg", E({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), ji(t[0] || (t[0] = [h("path", {
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
  extends: Se,
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
      var t = this.$refs.content, n = this.getVisibleButtonWidths(), r = qe(t) - n, o = Math.abs(t.scrollLeft), a = r * 0.8, s = o - a, d = Math.max(s, 0);
      t.scrollLeft = bn(t) ? -1 * d : d;
    },
    onNextButtonClick: function() {
      var t = this.$refs.content, n = this.getVisibleButtonWidths(), r = qe(t) - n, o = Math.abs(t.scrollLeft), a = r * 0.8, s = o + a, d = t.scrollWidth - r, i = Math.min(s, d);
      t.scrollLeft = bn(t) ? -1 * i : i;
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
        this.$pcTabs.isVertical() ? (r.style.height = sr(a) + "px", r.style.top = He(a).top - He(o).top + "px") : (r.style.width = ir(a) + "px", r.style.left = He(a).left - He(o).left + "px");
      }
    },
    updateButtonState: function() {
      var t = this.$refs, n = t.list, r = t.content, o = r.scrollTop, a = r.scrollWidth, s = r.scrollHeight, d = r.offsetWidth, i = r.offsetHeight, c = Math.abs(r.scrollLeft), l = [qe(r), zt(r)], u = l[0], p = l[1];
      this.$pcTabs.isVertical() ? (this.isPrevButtonEnabled = o !== 0, this.isNextButtonEnabled = n.offsetHeight >= i && parseInt(o) !== s - p) : (this.isPrevButtonEnabled = c !== 0, this.isNextButtonEnabled = n.offsetWidth >= d && parseInt(c) !== a - u);
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
      return $e({
        scrollable: this.$pcTabs.scrollable
      });
    }
  },
  components: {
    ChevronLeftIcon: wr,
    ChevronRightIcon: $r
  },
  directives: {
    ripple: en
  }
}, Ui = ["data-p"], Wi = ["aria-label", "tabindex"], Hi = ["data-p"], Ki = ["aria-orientation"], Gi = ["aria-label", "tabindex"];
function qi(e, t, n, r, o, a) {
  var s = Zt("ripple");
  return f(), y("div", E({
    ref: "list",
    class: e.cx("root"),
    "data-p": a.dataP
  }, e.ptmi("root")), [a.showNavigators && o.isPrevButtonEnabled ? De((f(), y("button", E({
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
  }), [(f(), N(ze(a.templates.previcon || "ChevronLeftIcon"), E({
    "aria-hidden": "true"
  }, e.ptm("prevIcon")), null, 16))], 16, Wi)), [[s]]) : A("", !0), h("div", E({
    ref: "content",
    class: e.cx("content"),
    onScroll: t[1] || (t[1] = function() {
      return a.onScroll && a.onScroll.apply(a, arguments);
    }),
    "data-p": a.dataP
  }, e.ptm("content")), [h("div", E({
    ref: "tabs",
    class: e.cx("tabList"),
    role: "tablist",
    "aria-orientation": a.$pcTabs.orientation || "horizontal"
  }, e.ptm("tabList")), [Q(e.$slots, "default"), h("span", E({
    ref: "inkbar",
    class: e.cx("activeBar"),
    role: "presentation",
    "aria-hidden": "true"
  }, e.ptm("activeBar")), null, 16)], 16, Ki)], 16, Hi), a.showNavigators && o.isNextButtonEnabled ? De((f(), y("button", E({
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
  }), [(f(), N(ze(a.templates.nexticon || "ChevronRightIcon"), E({
    "aria-hidden": "true"
  }, e.ptm("nextIcon")), null, 16))], 16, Gi)), [[s]]) : A("", !0)], 16, Ui);
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
  extends: Se,
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
  return f(), y("div", E({
    class: e.cx("root")
  }, e.ptmi("root")), [Q(e.$slots, "default")], 16);
}
_r.render = Xi;
const es = { class: "km-shell" }, ts = { class: "km-rail" }, ns = { class: "km-main" }, rs = /* @__PURE__ */ ie({
  __name: "Shell",
  setup(e) {
    return (t, n) => (f(), y("div", es, [
      h("aside", ts, [
        Q(t.$slots, "rail")
      ]),
      h("main", ns, [
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
    return (t, n) => (f(), y("div", os, [
      h("span", as, [
        W(R(e.title), 1),
        e.count !== void 0 ? (f(), y("b", is, R(e.count), 1)) : A("", !0)
      ]),
      h("div", ss, [
        Q(t.$slots, "actions")
      ])
    ]));
  }
});
var rn = {
  name: "SpinnerIcon",
  extends: Ct
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
    if (typeof e == "string") return Ht(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ht(e, t) : void 0;
  }
}
function ps(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function fs(e) {
  if (Array.isArray(e)) return Ht(e);
}
function Ht(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function ms(e, t, n, r, o, a) {
  return f(), y("svg", E({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), ds(t[0] || (t[0] = [h("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
rn.render = ms;
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
  extends: Se,
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
function Fn(e, t, n) {
  return (t = ys(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ys(e) {
  var t = xs(e, "string");
  return it(t) == "symbol" ? t : t + "";
}
function xs(e, t) {
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
      return $e(Fn(Fn({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, ks = ["data-p"];
function ws(e, t, n, r, o, a) {
  return f(), y("span", E({
    class: e.cx("root"),
    "data-p": a.dataP
  }, e.ptmi("root")), [Q(e.$slots, "default", {}, function() {
    return [W(R(e.value), 1)];
  })], 16, ks);
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
function ye(e, t, n) {
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
}, Ps = H.extend({
  name: "button",
  style: $s,
  classes: Cs
}), Ts = {
  name: "BaseButton",
  extends: Se,
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
var on = {
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
      return $e(le(le(le(le(le(le(le(le(le(le({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
    },
    dataIconP: function() {
      return $e(le(le({}, this.iconPos, this.iconPos), this.size, this.size));
    },
    dataLabelP: function() {
      return $e(le(le({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
    }
  },
  components: {
    SpinnerIcon: rn,
    Badge: Cr
  },
  directives: {
    ripple: en
  }
}, Ls = ["data-p"], Es = ["data-p"];
function Ns(e, t, n, r, o, a) {
  var s = an("SpinnerIcon"), d = an("Badge"), i = Zt("ripple");
  return e.asChild ? Q(e.$slots, "default", {
    key: 1,
    class: ke(e.cx("root")),
    a11yAttrs: a.a11yAttrs
  }) : De((f(), N(ze(e.as), E({
    key: 0,
    class: e.cx("root"),
    "data-p": a.dataP
  }, a.attrs), {
    default: F(function() {
      return [Q(e.$slots, "default", {}, function() {
        return [e.loading ? Q(e.$slots, "loadingicon", E({
          key: 0,
          class: [e.cx("loadingIcon"), e.cx("icon")]
        }, e.ptm("loadingIcon")), function() {
          return [e.loadingIcon ? (f(), y("span", E({
            key: 0,
            class: [e.cx("loadingIcon"), e.cx("icon"), e.loadingIcon]
          }, e.ptm("loadingIcon")), null, 16)) : (f(), N(s, E({
            key: 1,
            class: [e.cx("loadingIcon"), e.cx("icon")],
            spin: ""
          }, e.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : Q(e.$slots, "icon", E({
          key: 1,
          class: [e.cx("icon")]
        }, e.ptm("icon")), function() {
          return [e.icon ? (f(), y("span", E({
            key: 0,
            class: [e.cx("icon"), e.icon, e.iconClass],
            "data-p": a.dataIconP
          }, e.ptm("icon")), null, 16, Ls)) : A("", !0)];
        }), e.label ? (f(), y("span", E({
          key: 2,
          class: e.cx("label")
        }, e.ptm("label"), {
          "data-p": a.dataLabelP
        }), R(e.label), 17, Es)) : A("", !0), e.badge ? (f(), N(d, {
          key: 3,
          value: e.badge,
          class: ke(e.badgeClass),
          severity: e.badgeSeverity,
          unstyled: e.unstyled,
          pt: e.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : A("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[i]]);
}
on.render = Ns;
const wt = /* @__PURE__ */ ie({
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
    const n = e, r = t, o = Et(), a = ee(
      () => Object.prototype.hasOwnProperty.call(o?.vnode.props ?? {}, "active")
    ), s = ee(
      () => n.variant === "danger" ? "danger" : n.variant === "bordered" ? "secondary" : void 0
    ), d = ee(
      () => n.size === "sm" ? "small" : n.size === "lg" ? "large" : void 0
    );
    return (i, c) => (f(), N(b(on), {
      type: "button",
      severity: s.value,
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
      onClick: c[0] || (c[0] = (l) => r("click"))
    }, {
      icon: F(() => [
        L(b(te), {
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])
      ]),
      _: 1
    }, 8, ["severity", "text", "outlined", "size", "loading", "disabled", "pt"]));
  }
}), me = /* @__PURE__ */ ie({
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
    const n = e, r = t, o = ee(
      () => n.variant === "danger" ? "danger" : n.variant === "primary" ? void 0 : "secondary"
    );
    return (a, s) => (f(), N(b(on), {
      type: e.type,
      severity: o.value,
      outlined: e.variant === "ghost",
      loading: e.loading,
      disabled: e.disabled || e.loading,
      size: e.small ? "small" : void 0,
      onClick: s[0] || (s[0] = (d) => r("click"))
    }, {
      default: F(() => [
        e.loading ? (f(), N(b(rn), {
          key: 0,
          class: "p-button-loading-icon p-button-icon",
          spin: ""
        })) : A("", !0),
        e.icon && !e.loading ? (f(), N(b(te), {
          key: 1,
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : A("", !0),
        Q(a.$slots, "default")
      ]),
      _: 3
    }, 8, ["type", "severity", "outlined", "loading", "disabled", "size"]));
  }
}), js = { class: "km-search" }, zs = ["value", "placeholder"], Un = /* @__PURE__ */ ie({
  __name: "SearchField",
  props: {
    modelValue: {},
    placeholder: {}
  },
  emits: ["update:modelValue"],
  setup(e, { emit: t }) {
    const n = t;
    return (r, o) => (f(), y("div", js, [
      L(b(te), {
        icon: "tabler:search",
        class: "km-search-ico",
        "aria-hidden": "true"
      }),
      h("input", {
        class: "km-search-input",
        value: e.modelValue,
        placeholder: e.placeholder || "Search",
        onInput: o[0] || (o[0] = (a) => n("update:modelValue", a.target.value))
      }, null, 40, zs),
      e.modelValue ? (f(), y("button", {
        key: 0,
        class: "km-search-clear",
        "aria-label": "Clear search",
        onClick: o[1] || (o[1] = (a) => n("update:modelValue", ""))
      }, [
        L(b(te), {
          icon: "tabler:x",
          "aria-hidden": "true"
        })
      ])) : A("", !0)
    ]));
  }
}), Is = { class: "km-field" }, Rs = { class: "km-field-label" }, Vs = {
  key: 0,
  class: "km-field-help"
}, $t = /* @__PURE__ */ ie({
  __name: "FormField",
  props: {
    label: {},
    help: {}
  },
  setup(e) {
    return (t, n) => (f(), y("label", Is, [
      h("span", Rs, R(e.label), 1),
      Q(t.$slots, "default"),
      e.help ? (f(), y("small", Vs, R(e.help), 1)) : A("", !0)
    ]));
  }
}), Bs = ["type", "value", "placeholder", "readonly", "disabled", "autocomplete", "min", "max", "step"], Wn = /* @__PURE__ */ ie({
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
    return (o, a) => (f(), y("input", {
      class: ke(["km-input", e.mono && "mono"]),
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
  extends: Se,
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
      return $e(Ws({
        rounded: this.rounded
      }, this.severity, this.severity));
    }
  }
}, Gs = ["data-p"];
function qs(e, t, n, r, o, a) {
  return f(), y("span", E({
    class: e.cx("root"),
    "data-p": a.dataP
  }, e.ptmi("root")), [e.$slots.icon ? (f(), N(ze(e.$slots.icon), E({
    key: 0,
    class: e.cx("icon")
  }, e.ptm("icon")), null, 16, ["class"])) : e.icon ? (f(), y("span", E({
    key: 1,
    class: [e.cx("icon"), e.icon]
  }, e.ptm("icon")), null, 16)) : A("", !0), e.value != null || e.$slots.default ? Q(e.$slots, "default", {
    key: 2
  }, function() {
    return [h("span", E({
      class: e.cx("label")
    }, e.ptm("label")), R(e.value), 17)];
  }) : A("", !0)], 16, Gs);
}
Pr.render = qs;
const Ys = {
  key: 0,
  class: "km-pill-dot",
  "aria-hidden": "true"
}, St = /* @__PURE__ */ ie({
  __name: "Pill",
  props: {
    severity: { default: "secondary" },
    dot: { type: Boolean },
    icon: {}
  },
  setup(e) {
    return (t, n) => (f(), N(b(Pr), {
      severity: e.severity || void 0,
      class: "km-pill kx-tag-sm"
    }, {
      default: F(() => [
        e.dot ? (f(), y("span", Ys)) : e.icon ? (f(), N(b(te), {
          key: 1,
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : A("", !0),
        Q(t.$slots, "default")
      ]),
      _: 3
    }, 8, ["severity"]));
  }
}), Zs = { class: "km-notice-text" }, _t = /* @__PURE__ */ ie({
  __name: "Notice",
  props: {
    severity: { default: "info" }
  },
  emits: ["dismiss"],
  setup(e, { emit: t }) {
    const n = t, r = (o) => o === "danger" ? "tabler:alert-triangle" : o === "success" ? "tabler:circle-check" : "tabler:info-circle";
    return (o, a) => (f(), y("div", {
      class: ke(["km-notice", `is-${e.severity}`]),
      role: "status"
    }, [
      L(b(te), {
        icon: r(e.severity),
        "aria-hidden": "true"
      }, null, 8, ["icon"]),
      h("span", Zs, [
        Q(o.$slots, "default")
      ]),
      h("button", {
        class: "km-notice-x",
        "aria-label": "Dismiss",
        onClick: a[0] || (a[0] = (s) => n("dismiss"))
      }, [
        L(b(te), {
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
  extends: Se,
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
  return f(), y("div", E({
    class: e.cx("root"),
    role: "progressbar"
  }, e.ptmi("root")), [(f(), y("svg", E({
    class: e.cx("spin"),
    viewBox: "25 25 50 50",
    style: a.svgStyle
  }, e.ptm("spin")), [h("circle", E({
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
    return (t, n) => (f(), y("div", rl, [
      L(b(Tr), {
        style: { width: "22px", height: "22px", margin: "0" },
        "aria-label": e.label || "Loading"
      }, null, 8, ["aria-label"]),
      e.label ? (f(), y("span", ol, R(e.label), 1)) : A("", !0)
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
    return (r, o) => (f(), y("div", al, [
      L(b(te), {
        icon: e.icon,
        class: "km-empty-ico",
        "aria-hidden": "true"
      }, null, 8, ["icon"]),
      h("div", il, R(e.title), 1),
      e.hint ? (f(), y("p", sl, R(e.hint), 1)) : A("", !0),
      e.cta ? (f(), N(me, {
        key: 1,
        icon: e.ctaIcon,
        onClick: o[0] || (o[0] = (a) => n("cta"))
      }, {
        default: F(() => [
          W(R(e.cta), 1)
        ]),
        _: 1
      }, 8, ["icon"])) : A("", !0)
    ]));
  }
});
var Ar = {
  name: "TimesCircleIcon",
  extends: Ct
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
    if (typeof e == "string") return Kt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Kt(e, t) : void 0;
  }
}
function pl(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function fl(e) {
  if (Array.isArray(e)) return Kt(e);
}
function Kt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function ml(e, t, n, r, o, a) {
  return f(), y("svg", E({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), dl(t[0] || (t[0] = [h("path", {
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
  extends: Se,
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
      return $e({
        removable: this.removable
      });
    }
  },
  components: {
    TimesCircleIcon: Ar
  }
}, yl = ["aria-label", "data-p"], xl = ["src"];
function kl(e, t, n, r, o, a) {
  return o.visible ? (f(), y("div", E({
    key: 0,
    class: e.cx("root"),
    "aria-label": e.label
  }, e.ptmi("root"), {
    "data-p": a.dataP
  }), [Q(e.$slots, "default", {}, function() {
    return [e.image ? (f(), y("img", E({
      key: 0,
      src: e.image
    }, e.ptm("image"), {
      class: e.cx("image")
    }), null, 16, xl)) : e.$slots.icon ? (f(), N(ze(e.$slots.icon), E({
      key: 1,
      class: e.cx("icon")
    }, e.ptm("icon")), null, 16, ["class"])) : e.icon ? (f(), y("span", E({
      key: 2,
      class: [e.cx("icon"), e.icon]
    }, e.ptm("icon")), null, 16)) : A("", !0), e.label !== null ? (f(), y("div", E({
      key: 3,
      class: e.cx("label")
    }, e.ptm("label")), R(e.label), 17)) : A("", !0)];
  }), e.removable ? Q(e.$slots, "removeicon", {
    key: 0,
    removeCallback: a.close,
    keydownCallback: a.onKeydown
  }, function() {
    return [(f(), N(ze(e.removeIcon ? "span" : "TimesCircleIcon"), E({
      class: [e.cx("removeIcon"), e.removeIcon],
      onClick: a.close,
      onKeydown: a.onKeydown
    }, e.ptm("removeIcon")), null, 16, ["class", "onClick", "onKeydown"]))];
  }) : A("", !0)], 16, yl)) : A("", !0);
}
Lr.render = kl;
var wl = {
  name: "BaseEditableHolder",
  extends: Se,
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
var Gt = {
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
      return $e(Tl({
        invalid: this.$invalid,
        checked: this.checked,
        disabled: this.disabled,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, Ll = ["data-p-checked", "data-p-disabled", "data-p"], El = ["id", "value", "name", "checked", "tabindex", "disabled", "readonly", "aria-labelledby", "aria-label", "aria-invalid"], Nl = ["data-p"], jl = ["data-p"];
function zl(e, t, n, r, o, a) {
  return f(), y("div", E({
    class: e.cx("root")
  }, a.getPTOptions("root"), {
    "data-p-checked": a.checked,
    "data-p-disabled": e.disabled,
    "data-p": a.dataP
  }), [h("input", E({
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
  }, a.getPTOptions("input")), null, 16, El), h("div", E({
    class: e.cx("box")
  }, a.getPTOptions("box"), {
    "data-p": a.dataP
  }), [h("div", E({
    class: e.cx("icon")
  }, a.getPTOptions("icon"), {
    "data-p": a.dataP
  }), null, 16, jl)], 16, Nl)], 16, Ll);
}
Gt.render = zl;
const Il = { class: "kx-wcmount" }, Rl = {
  key: 0,
  class: "kx-wcmount-fail",
  role: "alert"
}, Lt = /* @__PURE__ */ ie({
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
    const n = e, r = t, o = V(null), a = V(!1);
    let s = null, d = 0;
    const i = /* @__PURE__ */ new Set();
    function c(g) {
      g.composedPath()[0] === s && (g.stopPropagation(), r("change", g.detail));
    }
    function l(g) {
      return g.composedPath()[0] !== s ? !1 : (g.stopPropagation(), !0);
    }
    function u(g) {
      l(g) && r("select", g.detail);
    }
    function p(g) {
      l(g) && r("created", g.detail);
    }
    function m(g) {
      l(g) && r("close", g.detail);
    }
    function x(g) {
      l(g) && r("error", g.detail);
    }
    function T(g) {
      if (typeof g == "string") return g;
      try {
        return JSON.stringify(g ?? {});
      } catch {
        return null;
      }
    }
    function C() {
      if (!s) return;
      const g = T(n.config);
      if (g !== null && s.setAttribute("config", g), n.schema !== void 0 && n.schema !== null) {
        const I = T(n.schema);
        I !== null && s.setAttribute("schema", I);
      }
      if (n.meta !== void 0 && n.meta !== null) {
        const I = T(n.meta);
        I !== null && s.setAttribute("meta", I);
      }
      n.provider && s.setAttribute("provider", n.provider), n.label && s.setAttribute("label", n.label);
      const D = n.attrs || {};
      for (const I of [...i])
        (!(I in D) || D[I] == null) && (s.removeAttribute(I), i.delete(I));
      for (const [I, K] of Object.entries(D)) {
        if (K == null) continue;
        const ae = typeof K == "object" ? T(K) : String(K);
        ae !== null && (s.setAttribute(I, ae), i.add(I));
      }
    }
    function _(g = s) {
      g && (g.removeEventListener("config-changed", c), g.removeEventListener("change", c), g.removeEventListener("select", u), g.removeEventListener("created", p), g.removeEventListener("close", m), g.removeEventListener("error", x), g === s && (s = null), i.clear());
    }
    async function O(g) {
      if (!customElements.get(g))
        try {
          await so(g, { timeoutMs: 8e3 });
        } catch {
        }
    }
    async function B() {
      const g = ++d, D = o.value, I = n.tag;
      if (a.value = !1, !!D && (_(), D.innerHTML = "", !!I))
        try {
          if (await O(I), g !== d || o.value !== D || n.tag !== I) return;
          const K = document.createElement(I);
          K.classList.add("kx-wcmount-surface"), s = K, C(), K.addEventListener("config-changed", c), K.addEventListener("change", c), K.addEventListener("select", u), K.addEventListener("created", p), K.addEventListener("close", m), K.addEventListener("error", x), K.style.display = "block", D.appendChild(K), a.value = !customElements.get(I);
        } catch {
          g === d && (a.value = !0);
        }
    }
    async function k() {
      a.value = !1, await Yt(), await B();
    }
    return qt(B), Te(() => n.tag, B), Te(() => [n.config, n.schema, n.meta, n.provider, n.label, n.attrs], C, { deep: !0 }), to(() => {
      d += 1, _();
    }), (g, D) => (f(), y("div", Il, [
      a.value ? (f(), y("div", Rl, [
        D[0] || (D[0] = h("span", null, "This setup panel couldn’t load.", -1)),
        h("button", {
          type: "button",
          onClick: k
        }, "Try again")
      ])) : (f(), y("div", {
        key: 1,
        ref_key: "host",
        ref: o
      }, null, 512))
    ]));
  }
});
function Ye(e, t) {
  const n = e?.response?.data ?? e?.data;
  return typeof n?.error == "string" && n.error ? n.error : typeof n?.message == "string" && n.message ? n.message : e instanceof Error ? e.message : t;
}
function Vl() {
  const e = V([]), t = V([]), n = V(!0), r = V(!1), o = V("");
  let a = 0;
  async function s() {
    const c = ++a;
    n.value = !0, o.value = "";
    try {
      const [l, u] = await Promise.all([
        Le.get("/api/v1/security/scopes"),
        Le.get("/api/v1/security/policies")
      ]);
      if (c !== a) return;
      e.value = l.data?.scopes ?? [], t.value = u.data?.policies ?? [];
    } catch (l) {
      c === a && (o.value = Ye(l, "failed to load security"));
    } finally {
      c === a && (n.value = !1);
    }
  }
  async function d(c) {
    r.value = !0, o.value = "";
    try {
      return await Le.post("/api/v1/security/scopes", c), await s(), !0;
    } catch (l) {
      return o.value = Ye(l, "failed to save scope"), !1;
    } finally {
      r.value = !1;
    }
  }
  async function i(c) {
    r.value = !0, o.value = "";
    try {
      return await Le.delete(`/api/v1/security/scopes?slug=${encodeURIComponent(c)}`), await s(), !0;
    } catch (l) {
      return o.value = Ye(l, "failed to delete scope"), !1;
    } finally {
      r.value = !1;
    }
  }
  return { scopes: e, policies: t, loading: n, saving: r, error: o, load: s, saveScope: d, deleteScope: i };
}
function Bl() {
  const e = V([]), t = V(!1), n = V(!1), r = V(""), o = V(""), a = V(null);
  let s = 0;
  async function d() {
    const l = ++s;
    t.value = !0, r.value = "";
    try {
      const { data: u } = await Le.get("/api/v1/security/delegations");
      if (u?.success !== !0 || !Array.isArray(u.delegations))
        throw new Error(u?.error || "Delegation inventory is unconfirmed");
      l === s && (e.value = u.delegations);
    } catch (u) {
      l === s && (r.value = Ye(u, "Could not load run-as permissions"));
    } finally {
      l === s && (t.value = !1);
    }
  }
  async function i() {
    if (!a.value || n.value) return;
    const l = a.value;
    n.value = !0, r.value = "", o.value = "";
    try {
      const { data: u } = l.method === "save" ? await Le.post("/api/v1/security/delegations", l.request) : await Le.delete("/api/v1/security/delegations", { data: l.request });
      if (u?.success !== !0) throw new Error(u?.error || "Run-as request is unconfirmed");
      a.value = null, o.value = l.method === "save" ? "Run-as permission saved" : "Run-as permission revoked", await d();
    } catch (u) {
      r.value = Ye(u, "Could not confirm run-as request");
      const p = u?.response?.status;
      p && p >= 400 && p < 500 && (a.value = null);
    } finally {
      n.value = !1;
    }
  }
  async function c(l, u) {
    a.value || n.value || (a.value = { method: l, request: {
      ...u,
      principal: { ...u.principal },
      ...u.groups ? { groups: [...u.groups].sort() } : {}
    } }, await i());
  }
  return { delegations: e, loading: t, saving: n, error: r, confirmation: o, pending: a, load: d, mutate: c, submit: i };
}
const Dl = {
  class: "ks-runas",
  "aria-label": "Run-as permissions"
}, Ml = { class: "ks-runas-head" }, Fl = { class: "ks-runas-acts" }, Ul = {
  key: 0,
  role: "alert"
}, Wl = { class: "ks-runas-form-head" }, Hl = ["disabled", "inert"], Kl = { class: "ks-runas-steps" }, Gl = {
  key: 0,
  class: "ks-runas-chips",
  "aria-label": "Selected groups"
}, ql = { class: "ks-runas-component-options" }, Yl = ["for"], Zl = ["for"], Ql = { class: "ks-runas-form-foot" }, Jl = {
  key: 3,
  class: "ks-runas-pending"
}, Xl = {
  key: 6,
  class: "ks-runas-list"
}, ed = { class: "ks-runas-grant-body" }, td = { class: "ks-runas-grant-line" }, nd = {
  key: 0,
  class: "ks-runas-who"
}, rd = { class: "ks-runas-verb" }, od = { class: "ks-runas-who" }, ad = { class: "ks-runas-grant-meta" }, id = { key: 0 }, sd = { key: 1 }, ld = { key: 2 }, dd = {
  key: 7,
  class: "ks-runas-empty"
}, cd = /* @__PURE__ */ ie({
  __name: "Delegations",
  props: {
    scopes: {}
  },
  setup(e, { expose: t }) {
    const n = e, r = Bl(), { delegations: o, loading: a, saving: s, error: d, confirmation: i, pending: c } = r, l = V(!1), u = V(!1), p = V(""), m = V(""), x = V(!0), T = qn(), C = V([]), _ = ee(() => s.value || !!c.value), O = ee(() => !!p.value && C.value.length > 0 && (x.value || !!m.value)), B = ee(() => {
      const j = {};
      for (const $ of n.scopes) j[$.id] = $.label || "Group unavailable";
      return j;
    }), k = V({});
    Te(o, async (j) => {
      const $ = [...new Set(j.map((P) => P.principal.id))].filter((P) => !k.value[P]);
      if ($.length)
        try {
          const { data: P } = await Le.post("/api/v1/principals/resolve", { refs: $.map((X) => ({ type: "user", id: X })) }), J = { ...k.value };
          for (const X of Array.isArray(P?.principals) ? P.principals : [])
            X && typeof X.id == "string" && typeof X.label == "string" && (J[X.id] = X.label);
          k.value = J;
        } catch (P) {
          d.value = P && typeof P == "object" && "message" in P ? String(P.message) : "Could not resolve account names";
        }
    });
    const g = ee(() => o.value.filter((j) => j.active)), D = ee(() => o.value.filter((j) => !j.active)), I = ee(() => u.value ? [...g.value, ...D.value] : g.value);
    function K(j, $) {
      if (!j || typeof j != "object") return;
      const P = j;
      _.value || P.type !== $ || typeof P.id != "string" || ($ === "user" ? p.value = P.id : P.id && !C.value.some((J) => J.id === P.id) && C.value.push({ id: P.id, label: typeof P.label == "string" ? P.label : P.id }));
    }
    function ae(j) {
      const $ = j && typeof j == "object" ? j.thread_id : void 0;
      !_.value && typeof $ == "string" && (m.value = $);
    }
    function Y(j) {
      d.value = j && typeof j == "object" && "message" in j ? String(j.message) : "Could not load the picker";
    }
    function ce() {
      p.value = "", m.value = "", x.value = !0, C.value = [], l.value = !0;
    }
    async function pe() {
      O.value && (await r.mutate("save", {
        principal: { kind: "user", id: p.value },
        root: x.value ? "*" : m.value,
        groups: C.value.map((j) => j.id)
      }), !d.value && !c.value && (l.value = !1));
    }
    async function be(j) {
      await Qt.confirm({
        header: "Revoke run-as permission?",
        message: `Members of ${j.groups.map((P) => B.value[P] || "Group unavailable").join(", ")} can no longer choose ${k.value[j.principal.id] || "Account unavailable"} in the Run as setting.`,
        icon: "tabler:user-off",
        acceptLabel: "Revoke",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      }) && await r.mutate("revoke", { principal: j.principal, root: j.root });
    }
    return t({ load: r.load }), (j, $) => (f(), y("section", Dl, [
      h("header", Ml, [
        $[10] || ($[10] = h("div", null, [
          h("h2", { class: "ks-runas-title" }, "Run-as permissions"),
          h("p", { class: "ks-runas-lede" }, [
            W(" Agents, automations and workflows run with the access of the account set in their "),
            h("b", null, "Run as"),
            W(" setting. A permission lets members of a group choose a specific account there, typically a bot account, so the component works with that account's access instead of their own. ")
          ])
        ], -1)),
        h("div", Fl, [
          L(b(wt), {
            icon: "tabler:refresh",
            label: "Refresh",
            disabled: b(a) || _.value,
            spin: b(a),
            onClick: b(r).load
          }, null, 8, ["disabled", "spin", "onClick"]),
          l.value ? A("", !0) : (f(), N(b(me), {
            key: 0,
            variant: "primary",
            small: "",
            icon: "tabler:plus",
            disabled: _.value,
            onClick: ce
          }, {
            default: F(() => [...$[9] || ($[9] = [
              W("New permission", -1)
            ])]),
            _: 1
          }, 8, ["disabled"]))
        ])
      ]),
      b(d) ? (f(), y("div", Ul, [
        L(b(_t), {
          severity: "danger",
          onDismiss: $[0] || ($[0] = (P) => d.value = "")
        }, {
          default: F(() => [
            W(R(b(d)), 1)
          ]),
          _: 1
        })
      ])) : A("", !0),
      b(i) ? (f(), N(b(_t), {
        key: 1,
        "data-test": "delegation-confirmation",
        severity: "success",
        onDismiss: $[1] || ($[1] = (P) => i.value = "")
      }, {
        default: F(() => [
          W(R(b(i)), 1)
        ]),
        _: 1
      })) : A("", !0),
      l.value ? (f(), y("form", {
        key: 2,
        class: "ks-runas-form",
        onSubmit: Ze(pe, ["prevent"])
      }, [
        h("div", Wl, [
          $[11] || ($[11] = h("span", null, "New run-as permission", -1)),
          L(b(wt), {
            icon: "tabler:x",
            label: "Cancel",
            disabled: _.value,
            onClick: $[2] || ($[2] = (P) => l.value = !1)
          }, null, 8, ["disabled"])
        ]),
        h("fieldset", {
          disabled: _.value,
          inert: _.value
        }, [
          h("ol", Kl, [
            h("li", null, [
              L(b($t), {
                label: "Account to run as",
                help: "The account whose access the component uses. Its group memberships decide what the component can do."
              }, {
                default: F(() => [
                  L(Lt, {
                    tag: "wc-principal-picker",
                    attrs: { kinds: "user", placeholder: "Choose an account…" },
                    config: { principal_id: p.value },
                    onChange: $[3] || ($[3] = (P) => K(P, "user")),
                    onError: Y
                  }, null, 8, ["config"])
                ]),
                _: 1
              })
            ]),
            h("li", null, [
              L(b($t), {
                label: "Who may choose it",
                help: "Members of these groups see this account in the Run as setting. Nobody's group membership changes."
              }, {
                default: F(() => [
                  L(Lt, {
                    tag: "wc-principal-picker",
                    attrs: { kinds: "group", placeholder: "Add a group…" },
                    config: {},
                    onChange: $[4] || ($[4] = (P) => K(P, "group")),
                    onError: Y
                  })
                ]),
                _: 1
              }),
              C.value.length ? (f(), y("div", Gl, [
                (f(!0), y(Ce, null, Pe(C.value, (P) => (f(), N(b(Lr), {
                  key: P.id,
                  label: P.label,
                  removable: !_.value,
                  pt: { removeIcon: { "aria-label": `Remove group ${P.label}` } },
                  onRemove: (J) => C.value = C.value.filter((X) => X.id !== P.id)
                }, null, 8, ["label", "removable", "pt", "onRemove"]))), 128))
              ])) : A("", !0)
            ]),
            h("li", null, [
              h("fieldset", null, [
                $[14] || ($[14] = h("legend", { class: "km-field-label" }, "On which components", -1)),
                h("div", ql, [
                  h("label", {
                    class: "ks-runas-component-option",
                    for: `${b(T)}-any`
                  }, [
                    L(b(Gt), {
                      modelValue: x.value,
                      "onUpdate:modelValue": $[5] || ($[5] = (P) => x.value = P),
                      "input-id": `${b(T)}-any`,
                      name: b(T),
                      value: !0,
                      disabled: _.value
                    }, null, 8, ["modelValue", "input-id", "name", "disabled"]),
                    $[12] || ($[12] = W(" Any component ", -1))
                  ], 8, Yl),
                  h("label", {
                    class: "ks-runas-component-option",
                    for: `${b(T)}-one`
                  }, [
                    L(b(Gt), {
                      modelValue: x.value,
                      "onUpdate:modelValue": $[6] || ($[6] = (P) => x.value = P),
                      "input-id": `${b(T)}-one`,
                      name: b(T),
                      value: !1,
                      disabled: _.value
                    }, null, 8, ["modelValue", "input-id", "name", "disabled"]),
                    $[13] || ($[13] = W(" One component ", -1))
                  ], 8, Zl)
                ]),
                $[15] || ($[15] = h("small", { class: "km-field-help" }, "The person choosing the account must also be able to manage the component.", -1))
              ]),
              x.value ? A("", !0) : (f(), N(Lt, {
                key: 0,
                class: "ks-runas-component",
                tag: "wc-component-picker",
                attrs: { source: "/api/v1/security/delegations/roots", title: "Component", placeholder: "Choose a component you manage…" },
                config: m.value ? { thread_id: m.value } : {},
                onChange: ae,
                onError: Y
              }, null, 8, ["config"]))
            ])
          ])
        ], 8, Hl),
        h("div", Ql, [
          L(b(me), {
            variant: "ghost",
            small: "",
            disabled: _.value,
            onClick: $[7] || ($[7] = (P) => l.value = !1)
          }, {
            default: F(() => [...$[16] || ($[16] = [
              W("Cancel", -1)
            ])]),
            _: 1
          }, 8, ["disabled"]),
          L(b(me), {
            variant: "primary",
            small: "",
            icon: "tabler:device-floppy",
            disabled: !O.value || _.value,
            loading: b(s),
            onClick: pe
          }, {
            default: F(() => [...$[17] || ($[17] = [
              W("Save permission", -1)
            ])]),
            _: 1
          }, 8, ["disabled", "loading"])
        ])
      ], 32)) : A("", !0),
      b(c) && !b(s) ? (f(), y("div", Jl, [
        $[19] || ($[19] = h("span", null, "We could not confirm whether the permission changed. Select Retry to check before making another change.", -1)),
        L(b(me), {
          small: "",
          onClick: b(r).submit
        }, {
          default: F(() => [...$[18] || ($[18] = [
            W("Retry", -1)
          ])]),
          _: 1
        }, 8, ["onClick"])
      ])) : A("", !0),
      D.value.length ? (f(), N(b(me), {
        key: 4,
        class: "ks-runas-history",
        variant: "ghost",
        small: "",
        "aria-expanded": u.value,
        onClick: $[8] || ($[8] = (P) => u.value = !u.value)
      }, {
        default: F(() => [
          W(R(u.value ? "Hide revoked permissions" : "Show revoked permissions"), 1)
        ]),
        _: 1
      }, 8, ["aria-expanded"])) : A("", !0),
      b(a) && !b(o).length ? (f(), N(b(Or), {
        key: 5,
        label: "Loading run-as permissions…"
      })) : I.value.length ? (f(), y("div", Xl, [
        (f(!0), y(Ce, null, Pe(I.value, (P) => (f(), y("article", {
          key: P.policy_id,
          class: ke(["ks-runas-grant", { revoked: !P.active }])
        }, [
          L(b(te), {
            class: "ks-runas-grant-icon",
            icon: "tabler:user-shield",
            "aria-hidden": "true"
          }),
          h("div", ed, [
            h("div", td, [
              P.active ? (f(), y("span", nd, R(P.groups.map((J) => B.value[J] || "Group unavailable").join(", ")), 1)) : A("", !0),
              h("span", rd, R(P.active ? "can run as" : "Permission to run as"), 1),
              h("span", od, R(k.value[P.principal.id] || "Account unavailable"), 1)
            ]),
            h("div", ad, [
              P.root === "*" ? (f(), y("span", id, "on any component they manage")) : P.root_label ? (f(), y("span", sd, [
                $[20] || ($[20] = W("on ", -1)),
                h("b", null, R(P.root_label), 1)
              ])) : (f(), y("span", ld, "on an unavailable component"))
            ])
          ]),
          P.active ? (f(), N(b(me), {
            key: 1,
            variant: "ghost",
            small: "",
            icon: "tabler:user-off",
            disabled: _.value,
            "aria-label": `Revoke run-as permission for ${k.value[P.principal.id] || "Account unavailable"}`,
            onClick: (J) => be(P)
          }, {
            default: F(() => [...$[22] || ($[22] = [
              W("Revoke", -1)
            ])]),
            _: 1
          }, 8, ["disabled", "aria-label", "onClick"])) : (f(), N(b(St), {
            key: 0,
            severity: "secondary"
          }, {
            default: F(() => [...$[21] || ($[21] = [
              W("revoked", -1)
            ])]),
            _: 1
          }))
        ], 2))), 128))
      ])) : !b(d) && !l.value ? (f(), y("div", dd, [
        L(b(te), {
          icon: "tabler:user-shield",
          "aria-hidden": "true"
        }),
        $[23] || ($[23] = h("b", null, "No active run-as permissions", -1)),
        $[24] || ($[24] = h("span", null, [
          W("Without an active permission, the Run as setting offers only "),
          h("b", null, "Me"),
          W(".")
        ], -1))
      ])) : A("", !0)
    ]));
  }
}), ud = ["draggable"], pd = { class: "ks-pcard-row" }, fd = { class: "ks-pcard-body" }, md = { class: "ks-pcard-head" }, bd = ["title"], hd = {
  key: 0,
  class: "ks-pcard-comment"
}, vd = ["aria-label"], gd = ["aria-label"], Ue = /* @__PURE__ */ ie({
  __name: "PolicyCard",
  props: {
    policy: {},
    mode: {}
  },
  emits: ["add", "remove"],
  setup(e, { emit: t }) {
    const n = e, r = t, o = ee(() => n.policy.title && n.policy.title !== n.policy.id ? n.policy.title : "Unnamed permission");
    function a(s) {
      n.mode === "locked" || !s.dataTransfer || (s.dataTransfer.setData("text/plain", n.policy.id), s.dataTransfer.effectAllowed = n.mode === "palette" ? "copy" : "move");
    }
    return (s, d) => (f(), y("div", {
      class: ke(["ks-pcard", e.mode]),
      draggable: e.mode !== "locked",
      onDragstart: a,
      onDblclick: d[2] || (d[2] = (i) => e.mode === "palette" && r("add"))
    }, [
      h("div", pd, [
        e.mode === "locked" ? (f(), N(b(te), {
          key: 0,
          icon: "tabler:lock",
          class: "ks-pcard-grip locked",
          "aria-hidden": "true"
        })) : (f(), N(b(te), {
          key: 1,
          icon: "tabler:grip-vertical",
          class: "ks-pcard-grip",
          "aria-hidden": "true"
        })),
        h("div", fd, [
          h("div", md, [
            e.policy.effect === "allow" || e.policy.effect === "deny" ? (f(), N(St, {
              key: 0,
              severity: e.policy.effect === "allow" ? "success" : "danger"
            }, {
              default: F(() => [
                W(R(e.policy.effect === "deny" ? "Blocks" : "Allows"), 1)
              ]),
              _: 1
            }, 8, ["severity"])) : A("", !0),
            h("span", {
              class: "ks-pcard-title",
              title: o.value
            }, R(o.value), 9, bd)
          ]),
          e.policy.comment ? (f(), y("div", hd, R(e.policy.comment), 1)) : A("", !0)
        ]),
        e.mode === "palette" ? (f(), y("button", {
          key: 2,
          class: "ks-pcard-act add",
          "aria-label": `Add permission ${o.value}`,
          onClick: d[0] || (d[0] = Ze((i) => r("add"), ["stop"]))
        }, [
          L(b(te), {
            icon: "tabler:plus",
            "aria-hidden": "true"
          })
        ], 8, vd)) : e.mode === "selected" ? (f(), y("button", {
          key: 3,
          class: "ks-pcard-act remove",
          "aria-label": `Remove permission ${o.value}`,
          onClick: d[1] || (d[1] = Ze((i) => r("remove"), ["stop"]))
        }, [
          L(b(te), {
            icon: "tabler:x",
            "aria-hidden": "true"
          })
        ], 8, gd)) : A("", !0)
      ])
    ], 42, ud));
  }
}), yd = { class: "ks" }, xd = { class: "ks-rail-search" }, kd = { class: "ks-rail-list" }, wd = {
  key: 0,
  class: "ks-rail-group"
}, $d = ["onClick"], Sd = { class: "ks-scope-name" }, _d = ["onClick"], Cd = { class: "ks-scope-name" }, Pd = {
  key: 0,
  class: "ks-builder"
}, Td = { class: "ks-builder-head" }, Od = { class: "ks-builder-title" }, Ad = { class: "ks-builder-acts" }, Ld = {
  key: 0,
  class: "ks-overlay-warn"
}, Ed = {
  key: 1,
  class: "ks-view-note"
}, Nd = { class: "ks-fields" }, jd = {
  key: 0,
  class: "ks-pane locked-pane"
}, zd = { class: "ks-pane-head" }, Id = { class: "ks-pane-sub" }, Rd = { class: "ks-pane-body" }, Vd = {
  key: 0,
  class: "ks-pane-empty"
}, Bd = { class: "ks-pane" }, Dd = { class: "ks-pane-search" }, Md = { class: "ks-pane-body" }, Fd = {
  key: 0,
  class: "ks-pane-empty"
}, Ud = { class: "ks-pane-head" }, Wd = { class: "ks-pane-sub" }, Hd = { class: "ks-pane-body" }, Kd = ["onDrop"], Gd = {
  key: 0,
  class: "ks-drop-hint"
}, qd = {
  key: 1,
  class: "ks-view"
}, Yd = { class: "ks-builder-head" }, Zd = { class: "ks-builder-title" }, Qd = { class: "ks-builder-acts" }, Jd = { class: "ks-pane-body ks-view-list" }, Xd = {
  key: 0,
  class: "ks-pane-empty"
}, ec = {
  key: 0,
  class: "ks-ext-block"
}, tc = { class: "ks-ext-head" }, nc = { class: "ks-pane-body ks-view-list" }, rc = /* @__PURE__ */ ie({
  __name: "Security",
  setup(e) {
    const t = Vl(), { scopes: n, policies: r, loading: o, saving: a, error: s } = t, d = V(""), i = V(""), c = V(null), l = V(null), u = V("scopes"), p = V(null), m = V(!1);
    async function x(w) {
      u.value = String(w), w === "delegations" && (m.value = !0, await Yt(), await p.value?.load());
    }
    Vo(async () => {
      await t.load(), u.value === "delegations" && await p.value?.load();
    });
    const T = ee(() => {
      const w = {};
      for (const v of r.value) w[v.id] = v;
      return w;
    }), C = ee(() => {
      const w = d.value.trim().toLowerCase(), v = (S) => !w || S.label.toLowerCase().includes(w) || S.id.toLowerCase().includes(w);
      return {
        custom: n.value.filter((S) => S.source === "custom" && v(S)),
        builtin: n.value.filter((S) => S.source !== "custom" && v(S))
      };
    }), _ = ee(() => n.value.find((w) => w.id === c.value) || null), O = ee(() => _.value && _.value.source !== "custom" ? _.value : null), B = ee(() => {
      if (!l.value) return [];
      const w = /* @__PURE__ */ new Set([...l.value.policies, ...l.value.base.map((S) => S.id)]), v = i.value.trim().toLowerCase();
      return r.value.filter((S) => !w.has(S.id) && (!v || (S.title || "").toLowerCase().includes(v) || S.id.toLowerCase().includes(v) || (S.comment || "").toLowerCase().includes(v)));
    }), k = ee(
      () => l.value ? l.value.policies.map((w) => T.value[w] || { id: w }) : []
    );
    function g(w) {
      c.value = w.id, l.value = w.source === "custom" ? { slug: w.slug || "", label: w.label, description: w.description, policies: w.policies.map((v) => v.id), enabled: w.enabled, isNew: !1, target: "", base: [] } : null;
    }
    function D() {
      c.value = null, l.value = { slug: Array.from(crypto.getRandomValues(new Uint8Array(16)), (w) => w.toString(16).padStart(2, "0")).join(""), label: "", description: "", policies: [], enabled: !0, isNew: !0, target: "", base: [] };
    }
    function I(w) {
      D(), Object.assign(l.value, {
        label: w.label ? `Copy of ${w.label}` : "",
        description: w.description,
        policies: [...w.policies.map((v) => v.id), ...(w.overlay_policies ?? []).map((v) => v.id)]
      });
    }
    function K(w) {
      return w.replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "");
    }
    function ae(w) {
      c.value = w.id, l.value = {
        slug: w.overlay_slug || K(w.id),
        label: w.label || se(w.id),
        description: w.description,
        policies: (w.overlay_policies ?? []).map((v) => v.id),
        enabled: !0,
        isNew: !w.overlay_slug,
        target: w.id,
        base: w.policies
      };
    }
    const Y = ee(() => !!l.value && l.value.target !== "");
    function ce(w) {
      l.value && !l.value.policies.includes(w) && l.value.policies.push(w);
    }
    function pe(w) {
      l.value && (l.value.policies = l.value.policies.filter((v) => v !== w));
    }
    function be(w) {
      const v = w.dataTransfer?.getData("text/plain");
      v && ce(v);
    }
    function j(w, v) {
      w.stopPropagation();
      const S = w.dataTransfer?.getData("text/plain");
      if (!S || !l.value || S === v) return;
      const re = l.value.policies, Me = re.indexOf(S);
      Me !== -1 && re.splice(Me, 1);
      const pt = re.indexOf(v);
      re.splice(pt === -1 ? re.length : pt, 0, S);
    }
    const $ = ee(() => l.value ? !l.value.isNew || l.value.target ? l.value.slug : `${K(l.value.label.normalize("NFKD").replace(/\p{M}/gu, "")).toLowerCase() || "role"}_${l.value.slug}` : ""), P = ee(() => !!l.value && l.value.label.trim() !== "" && l.value.policies.length > 0), J = V("");
    let X = null;
    Kn(() => {
      X && clearTimeout(X);
    });
    function Oe(w) {
      J.value = w, X && clearTimeout(X), X = setTimeout(() => {
        J.value = "";
      }, 3e3);
    }
    async function he() {
      if (!l.value || !P.value) return;
      const w = l.value, v = $.value, S = l.value.target, re = l.value.label.trim() || v;
      await t.saveScope({
        slug: v,
        target: S,
        label: l.value.label.trim(),
        description: l.value.description.trim(),
        policies: l.value.policies,
        enabled: l.value.enabled
      }) && (w.slug = v, w.isNew = !1, l.value === w && (c.value = S || `kickside.security.scopes:${v}`), Oe(`Saved “${re}”. The role will be available when assigning users.`));
    }
    async function fe() {
      if (!l.value || l.value.isNew) return;
      const w = Y.value;
      if (!await Qt.confirm({
        header: w ? "Remove extension?" : "Delete role?",
        message: w ? "This removes the added permissions. Users keep the role’s original permissions." : "This removes the custom role and its permissions.",
        icon: "tabler:trash",
        acceptLabel: w ? "Remove extension" : "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      })) return;
      await t.deleteScope(l.value.slug) && (l.value = null, c.value = null);
    }
    function se(w) {
      return w.includes(":") ? w.split(":").slice(-1)[0] : w;
    }
    return (w, v) => (f(), y("div", yd, [
      L(b(_r), {
        class: "ks-tabs",
        value: u.value,
        "onUpdate:value": x
      }, {
        default: F(() => [
          L(b(Sr), { pt: { tabList: { "aria-label": "Security administration" } } }, {
            default: F(() => [
              L(b(Ft), { value: "scopes" }, {
                default: F(() => [...v[11] || (v[11] = [
                  W("Roles", -1)
                ])]),
                _: 1
              }),
              L(b(Ft), {
                value: "delegations",
                "data-tab": "delegations"
              }, {
                default: F(() => [...v[12] || (v[12] = [
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
      m.value ? De((f(), N(cd, {
        key: 0,
        ref_key: "delegationPanel",
        ref: p,
        scopes: b(n)
      }, null, 8, ["scopes"])), [
        [sn, u.value === "delegations"]
      ]) : A("", !0),
      b(s) ? (f(), N(b(_t), {
        key: 1,
        severity: "danger",
        class: "ks-top-notice",
        onDismiss: v[0] || (v[0] = (S) => s.value = "")
      }, {
        default: F(() => [
          W(R(b(s)), 1)
        ]),
        _: 1
      })) : J.value ? (f(), N(b(_t), {
        key: 2,
        severity: "success",
        class: "ks-top-notice",
        onDismiss: v[1] || (v[1] = (S) => J.value = "")
      }, {
        default: F(() => [
          W(R(J.value), 1)
        ]),
        _: 1
      })) : A("", !0),
      u.value === "scopes" && b(o) && !b(n).length ? (f(), N(b(Or), {
        key: 3,
        label: "Loading security…"
      })) : De((f(), N(b(rs), { key: 4 }, {
        rail: F(() => [
          L(b(ls), {
            title: "Roles",
            count: b(n).length
          }, {
            actions: F(() => [
              L(b(wt), {
                icon: "tabler:plus",
                label: "New role",
                disabled: b(a),
                onClick: D
              }, null, 8, ["disabled"]),
              L(b(wt), {
                icon: "tabler:refresh",
                label: "Refresh",
                disabled: b(o),
                spin: b(o),
                onClick: b(t).load
              }, null, 8, ["disabled", "spin", "onClick"])
            ]),
            _: 1
          }, 8, ["count"]),
          h("div", xd, [
            L(b(Un), {
              modelValue: d.value,
              "onUpdate:modelValue": v[2] || (v[2] = (S) => d.value = S),
              placeholder: "Find a role…"
            }, null, 8, ["modelValue"])
          ]),
          h("div", kd, [
            C.value.custom.length ? (f(), y("div", wd, "Custom")) : A("", !0),
            (f(!0), y(Ce, null, Pe(C.value.custom, (S) => (f(), y("button", {
              key: S.id,
              class: ke(["ks-scope-row", { active: S.id === c.value }]),
              onClick: (re) => g(S)
            }, [
              h("span", Sd, R(S.label || se(S.id)), 1)
            ], 10, $d))), 128)),
            v[13] || (v[13] = h("div", { class: "ks-rail-group" }, "Default", -1)),
            (f(!0), y(Ce, null, Pe(C.value.builtin, (S) => (f(), y("button", {
              key: S.id,
              class: ke(["ks-scope-row", { active: S.id === c.value }]),
              onClick: (re) => g(S)
            }, [
              h("span", Cd, R(S.label || se(S.id)), 1)
            ], 10, _d))), 128))
          ])
        ]),
        default: F(() => [
          l.value ? (f(), y("div", Pd, [
            h("div", Td, [
              h("div", Od, [
                L(b(te), {
                  icon: Y.value ? "tabler:stack-2" : "tabler:shield-lock",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                h("span", null, R(Y.value ? `Extend ${l.value.label || se(l.value.target)}` : l.value.isNew ? "New role" : l.value.label || l.value.slug), 1),
                Y.value ? (f(), N(b(St), {
                  key: 0,
                  severity: "warn"
                }, {
                  default: F(() => [...v[14] || (v[14] = [
                    W("Additional permissions", -1)
                  ])]),
                  _: 1
                })) : A("", !0)
              ]),
              h("div", Ad, [
                !l.value.isNew && !Y.value && _.value ? (f(), N(b(me), {
                  key: 0,
                  variant: "soft",
                  small: "",
                  icon: "tabler:copy",
                  disabled: b(a),
                  onClick: v[3] || (v[3] = (S) => I(_.value))
                }, {
                  default: F(() => [...v[15] || (v[15] = [
                    W("Duplicate", -1)
                  ])]),
                  _: 1
                }, 8, ["disabled"])) : A("", !0),
                l.value.isNew ? A("", !0) : (f(), N(b(me), {
                  key: 1,
                  variant: "danger",
                  small: "",
                  icon: "tabler:trash",
                  disabled: b(a),
                  onClick: fe
                }, {
                  default: F(() => [
                    W(R(Y.value ? "Remove extension" : "Delete"), 1)
                  ]),
                  _: 1
                }, 8, ["disabled"])),
                L(b(me), {
                  variant: "primary",
                  small: "",
                  icon: "tabler:device-floppy",
                  loading: b(a),
                  disabled: !P.value,
                  onClick: he
                }, {
                  default: F(() => [
                    W(R(Y.value ? "Save extension" : "Save role"), 1)
                  ]),
                  _: 1
                }, 8, ["loading", "disabled"])
              ])
            ]),
            Y.value ? (f(), y("div", Ld, [
              L(b(te), {
                icon: "tabler:alert-triangle",
                "aria-hidden": "true"
              }),
              h("span", null, [
                v[16] || (v[16] = W("Adding permissions grants them to ", -1)),
                h("b", null, "everyone assigned " + R(_.value?.label || se(l.value.target)), 1),
                v[17] || (v[17] = W(". Original permissions cannot be removed here. To restrict access, create a new role with only the permissions needed.", -1))
              ])
            ])) : (f(), y("p", Ed, "Choose the permissions this role grants, then assign it in System → Users. To restrict a Member, assign this role instead of Member; other assigned roles may still grant access.")),
            h("div", Nd, [
              L(b($t), { label: "Name" }, {
                default: F(() => [
                  L(b(Wn), {
                    modelValue: l.value.label,
                    "onUpdate:modelValue": v[4] || (v[4] = (S) => l.value.label = S),
                    placeholder: "Reviewer"
                  }, null, 8, ["modelValue"])
                ]),
                _: 1
              }),
              L(b($t), { label: "Description" }, {
                default: F(() => [
                  L(b(Wn), {
                    modelValue: l.value.description,
                    "onUpdate:modelValue": v[5] || (v[5] = (S) => l.value.description = S),
                    placeholder: "Read-only reviewer role"
                  }, null, 8, ["modelValue"])
                ]),
                _: 1
              })
            ]),
            h("div", {
              class: ke(["ks-panes", { three: Y.value }])
            }, [
              Y.value ? (f(), y("section", jd, [
                h("header", zd, [
                  v[18] || (v[18] = h("span", null, "Original permissions", -1)),
                  h("span", Id, R(l.value.base.length) + " · locked", 1)
                ]),
                h("div", Rd, [
                  (f(!0), y(Ce, null, Pe(l.value.base, (S) => (f(), N(Ue, {
                    key: S.id,
                    policy: S,
                    mode: "locked"
                  }, null, 8, ["policy"]))), 128)),
                  l.value.base.length ? A("", !0) : (f(), y("div", Vd, "No original permissions."))
                ])
              ])) : A("", !0),
              h("section", Bd, [
                v[19] || (v[19] = h("header", { class: "ks-pane-head" }, [
                  h("span", null, "Available permissions"),
                  h("span", { class: "ks-pane-sub" }, "Click + to add")
                ], -1)),
                h("div", Dd, [
                  L(b(Un), {
                    modelValue: i.value,
                    "onUpdate:modelValue": v[6] || (v[6] = (S) => i.value = S),
                    placeholder: "Search permissions…"
                  }, null, 8, ["modelValue"])
                ]),
                h("div", Md, [
                  (f(!0), y(Ce, null, Pe(B.value, (S) => (f(), N(Ue, {
                    key: S.id,
                    policy: S,
                    mode: "palette",
                    onAdd: (re) => ce(S.id)
                  }, null, 8, ["policy", "onAdd"]))), 128)),
                  B.value.length ? A("", !0) : (f(), y("div", Fd, "No matching permissions."))
                ])
              ]),
              h("section", {
                class: "ks-pane drop",
                onDragover: v[8] || (v[8] = Ze(() => {
                }, ["prevent"])),
                onDrop: be
              }, [
                h("header", Ud, [
                  h("span", null, R(Y.value ? "Added by you" : "In this role"), 1),
                  h("span", Wd, R(l.value.policies.length) + " " + R(l.value.policies.length === 1 ? "permission" : "permissions"), 1)
                ]),
                h("div", Hd, [
                  (f(!0), y(Ce, null, Pe(k.value, (S) => (f(), y("div", {
                    key: S.id,
                    onDragover: v[7] || (v[7] = Ze(() => {
                    }, ["prevent"])),
                    onDrop: (re) => j(re, S.id)
                  }, [
                    L(Ue, {
                      policy: S,
                      mode: "selected",
                      onRemove: (re) => pe(S.id)
                    }, null, 8, ["policy", "onRemove"])
                  ], 40, Kd))), 128)),
                  l.value.policies.length ? A("", !0) : (f(), y("div", Gd, [
                    L(b(te), {
                      icon: "tabler:drag-drop",
                      "aria-hidden": "true"
                    }),
                    v[20] || (v[20] = h("span", null, "Use + on an available permission, or drag it here.", -1))
                  ]))
                ])
              ], 32)
            ], 2)
          ])) : O.value ? (f(), y("div", qd, [
            h("div", Yd, [
              h("div", Zd, [
                L(b(te), {
                  icon: "tabler:shield",
                  "aria-hidden": "true"
                }),
                h("span", null, R(O.value.label || se(O.value.id)), 1)
              ]),
              h("div", Qd, [
                L(b(me), {
                  variant: "primary",
                  small: "",
                  icon: "tabler:stack-2",
                  onClick: v[9] || (v[9] = (S) => ae(O.value))
                }, {
                  default: F(() => [
                    W(R(O.value.overlay_slug ? "Edit extension" : "Add permissions"), 1)
                  ]),
                  _: 1
                }),
                L(b(me), {
                  variant: "soft",
                  small: "",
                  icon: "tabler:copy",
                  onClick: v[10] || (v[10] = (S) => I(O.value))
                }, {
                  default: F(() => [...v[21] || (v[21] = [
                    W("Copy role", -1)
                  ])]),
                  _: 1
                })
              ])
            ]),
            v[23] || (v[23] = h("p", { class: "ks-view-note" }, " Included with the application. Adding permissions affects everyone with this role. For restricted access, create a new role with only the permissions needed and assign it in System → Users instead of this role. Other assigned roles may still grant access. ", -1)),
            h("div", Jd, [
              (f(!0), y(Ce, null, Pe(O.value.policies, (S) => (f(), N(Ue, {
                key: S.id,
                policy: S,
                mode: "locked"
              }, null, 8, ["policy"]))), 128)),
              O.value.policies.length ? A("", !0) : (f(), y("div", Xd, "No permissions in this role."))
            ]),
            O.value.overlay_policies && O.value.overlay_policies.length ? (f(), y("div", ec, [
              h("div", tc, [
                L(b(te), {
                  icon: "tabler:stack-2",
                  "aria-hidden": "true"
                }),
                v[22] || (v[22] = h("span", null, "Additional permissions", -1)),
                L(b(St), { severity: "warn" }, {
                  default: F(() => [
                    W(R(O.value.overlay_policies.length), 1)
                  ]),
                  _: 1
                })
              ]),
              h("div", nc, [
                (f(!0), y(Ce, null, Pe(O.value.overlay_policies, (S) => (f(), N(Ue, {
                  key: S.id,
                  policy: S,
                  mode: "locked"
                }, null, 8, ["policy"]))), 128))
              ])
            ])) : A("", !0)
          ])) : (f(), N(b(ll), {
            key: 2,
            icon: "tabler:shield-lock",
            title: "Roles",
            hint: "Choose a role to view its permissions, or create one with the permissions your team needs. Assign roles in System → Users.",
            cta: "New role",
            "cta-icon": "tabler:plus",
            onCta: D
          }))
        ]),
        _: 1
      }, 512)), [
        [sn, u.value === "scopes"]
      ])
    ]));
  }
}), oc = ':root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}.kx-tag-sm,.kx-tag-sm.kx-tag-sm{display:inline-flex;align-items:center;gap:4px;padding:1px 7px;border-radius:var(--kx-radius-tag, 6px);font-size:10.5px;font-weight:600;line-height:1.5;white-space:nowrap}.kx-tag-sm svg,.kx-tag-sm.kx-tag-sm svg{width:12px;height:12px}.kx-tag-caps,.kx-tag-caps.kx-tag-caps{display:inline-flex;align-items:center;gap:3px;padding:2px 6px;border-radius:var(--kx-radius-tag, 6px);font-size:9px;font-weight:700;line-height:1.5;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap}.kx-tag-caps svg,.kx-tag-caps.kx-tag-caps svg{width:11px;height:11px}:host,:root{--kx-surface-1: color-mix(in srgb, var(--p-content-background) 96%, var(--p-text-color) 4%);--kx-surface-2: color-mix(in srgb, var(--p-content-background) 92%, var(--p-text-color) 8%);--kx-surface-3: color-mix(in srgb, var(--p-content-background) 86%, var(--p-text-color) 14%);--kx-surface-4: color-mix(in srgb, var(--p-content-background) 78%, var(--p-text-color) 22%);--kx-border-strong: color-mix(in srgb, var(--p-content-border-color) 60%, var(--p-text-color) 40%);--kx-border-stronger: color-mix(in srgb, var(--p-content-border-color) 30%, var(--p-text-color) 70%);--kx-text-faint: color-mix(in srgb, var(--p-text-muted-color) 70%, var(--p-content-background) 30%);--kx-text-fainter: color-mix(in srgb, var(--p-text-muted-color) 45%, var(--p-content-background) 55%);--kx-wash-primary: color-mix(in srgb, var(--p-primary-color) 12%, var(--p-content-background) 88%);--kx-wash-success: color-mix(in srgb, var(--p-success-500) 12%, var(--p-content-background) 88%);--kx-wash-info: color-mix(in srgb, var(--p-info-500) 12%, var(--p-content-background) 88%);--kx-wash-warn: color-mix(in srgb, var(--p-warn-500) 12%, var(--p-content-background) 88%);--kx-wash-danger: color-mix(in srgb, var(--p-danger-500) 12%, var(--p-content-background) 88%);--kx-wash-help: color-mix(in srgb, var(--p-help-500) 12%, var(--p-content-background) 88%);--kx-font-heading: "Outfit", system-ui, sans-serif;--kx-font-body: "Inter", system-ui, sans-serif;--kx-radius-4: 4px;--kx-radius-6: 6px;--kx-radius-8: 8px;--kx-radius-10: 10px;--kx-radius-14: 14px;--kx-radius-16: 16px;--kx-radius-tag: var(--p-content-border-radius, 6px);--kx-control-height: 34px;--kx-control-height-sm: 30px;--kx-rail-width: 264px;--kx-reading-measure: 880px;--kx-row-height: 32px;--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .08);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .12);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .18);--kx-overlay-hover: color-mix(in srgb, var(--p-text-color) 7%, transparent);--kx-overlay-subtle: color-mix(in srgb, var(--p-text-color) 4%, transparent)}@media(prefers-color-scheme:dark){:host(:not(.w-theme-light)),:root:not(.w-theme-light){--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .35);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .45);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .6)}}:host(.w-theme-dark),:root.w-theme-dark{--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .35);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .45);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .6)}.kx-wcmount{display:block;width:100%;min-width:0;max-width:100%;overflow-x:clip;--p-border-radius: var(--wf-radius-sm, 8px);--p-content-border-radius: var(--wf-radius-sm, 8px)}.kx-wcmount .kx-wcmount-surface{display:block;width:100%;min-width:0;max-width:100%;box-sizing:border-box;color:inherit}.kx-wcmount-fail{display:flex;align-items:center;flex-wrap:wrap;gap:8px;font-size:12px;color:var(--p-danger-600, var(--p-danger-500));padding:9px 10px;border:1px solid color-mix(in srgb,var(--p-danger-500) 32%,transparent);border-radius:10px;background:color-mix(in srgb,var(--p-danger-500) 7%,transparent)}.kx-wcmount-fail>span{min-width:0;flex:1}.kx-wcmount-fail button{border:1px solid currentColor;border-radius:8px;padding:5px 9px;background:transparent;color:inherit;font:inherit;font-weight:600;cursor:pointer}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}:host{display:block;height:100%;min-height:0;--km-rail-w: 296px;--system-surface-gutter: var(--kickside-system-surface-gutter, 24px)}:host>div{height:100%;min-height:0}*,*:before,*:after{box-sizing:border-box}.km{height:100%;min-height:0;display:flex;flex-direction:column;background:var(--p-content-background);color:var(--p-text-color);font-family:inherit}.km-top-notice{width:calc(100% - (var(--system-surface-gutter) * 2));margin:12px 0 0 var(--system-surface-gutter)}.km-shell{flex:1;min-height:0;width:100%;margin:0;display:grid;grid-template-columns:var(--km-rail-w) minmax(0,1fr);border-left:1px solid var(--p-content-border-color);border-right:1px solid var(--p-content-border-color)}.km-rail{min-width:0;min-height:0;display:flex;flex-direction:column;border-right:1px solid var(--p-content-border-color)}.km-rail-body{flex:1;min-height:0;overflow:auto;padding:6px}.km-main{min-width:0;min-height:0;display:flex;flex-direction:column;overflow:hidden}.km-railhead{flex:0 0 auto;display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:48px;padding:0 8px 0 14px;border-bottom:1px solid var(--p-content-border-color)}.km-railhead-title{display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:760;letter-spacing:.03em;text-transform:uppercase;color:var(--p-text-muted-color)}.km-railhead-title b{min-width:18px;padding:1px 6px;border-radius:999px;background:var(--kx-overlay-subtle);color:var(--p-text-color);font-size:11px;font-weight:700;text-align:center}.km-railhead-acts{display:inline-flex;align-items:center;gap:2px}.km-input{width:100%;min-width:0;height:34px;padding:0 10px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);background:var(--p-content-background);color:var(--p-text-color);font:inherit;font-size:13px}.km-input:read-only{color:var(--p-text-muted-color);background:var(--kx-overlay-subtle)}.km-input:disabled{opacity:.6}.km-input.mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}.km-textarea{height:auto;min-height:120px;padding:9px 10px;line-height:1.45;resize:vertical}.km-search{position:relative;display:flex;align-items:center;min-width:0}.km-search-ico{position:absolute;left:9px;width:16px;height:16px;color:var(--p-text-muted-color);pointer-events:none}.km-search-input{width:100%;height:34px;padding:0 30px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);background:var(--p-content-background);color:var(--p-text-color);font:inherit;font-size:13px}.km-search-clear{position:absolute;right:6px;width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:6px;background:transparent;color:var(--p-text-muted-color);cursor:pointer}.km-search-clear:hover{color:var(--p-text-color);background:var(--kx-overlay-hover)}.km-search-clear svg{width:14px;height:14px}.km-select{position:relative;min-width:0;display:flex}.km-select-el{width:100%;height:34px;padding:0 30px 0 10px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);background:var(--p-content-background);color:var(--p-text-color);font:inherit;font-size:13px;cursor:pointer;appearance:none}.km-select-chev{position:absolute;right:9px;top:50%;transform:translateY(-50%);width:15px;height:15px;color:var(--p-text-muted-color);pointer-events:none}.km-field{min-width:0;display:flex;flex-direction:column;gap:5px}.km-field-label{color:var(--p-text-muted-color);font-size:11.5px;font-weight:680}.km-field-help{color:var(--p-text-muted-color);font-size:11.5px;line-height:1.35}.km-pill{max-width:190px;overflow:hidden;text-overflow:ellipsis}.km-pill-dot{width:6px;height:6px;border-radius:50%;background:currentColor}.km-notice{display:flex;align-items:center;gap:9px;padding:9px 10px 9px 12px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);font-size:13px}.km-notice svg{width:17px;height:17px;flex:0 0 auto}.km-notice-text{flex:1;min-width:0}.km-notice.is-info{color:var(--p-text-color);background:var(--kx-overlay-subtle)}.km-notice.is-danger{color:var(--p-text-color);border-color:color-mix(in srgb,var(--p-danger-500) 32%,var(--p-content-border-color));background:color-mix(in srgb,var(--p-danger-500) 9%,transparent)}.km-notice.is-success{color:var(--p-text-color);border-color:color-mix(in srgb,var(--p-success-500) 36%,var(--p-content-border-color));background:color-mix(in srgb,var(--p-success-500) 12%,transparent)}.km-notice-x{width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:6px;background:transparent;color:inherit;cursor:pointer;opacity:.7}.km-notice-x:hover{opacity:1;background:color-mix(in srgb,currentColor 12%,transparent)}.km-notice-x svg{width:14px;height:14px}.km-loading{display:flex;align-items:center;justify-content:center;gap:9px;padding:40px 20px;color:var(--p-text-muted-color);font-size:13px}.km-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:48px 24px;text-align:center}.km-empty-ico{width:30px;height:30px;color:var(--p-text-muted-color)}.km-empty-title{font-size:14px;font-weight:720}.km-empty-hint{margin:0;max-width:340px;color:var(--p-text-muted-color);font-size:12.5px;line-height:1.45}.km-empty .p-button{margin-top:4px}.km-plist{display:flex;flex-direction:column;gap:2px}.km-plist-all{width:100%;height:32px;display:flex;align-items:center;padding:0 10px;border:0;border-radius:var(--kx-radius-8);background:transparent;color:var(--p-text-muted-color);font:inherit;font-size:12.5px;font-weight:640;text-align:left;cursor:pointer}.km-plist-all:hover{background:var(--kx-overlay-hover);color:var(--p-text-color)}.km-plist-all.on{background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);color:var(--p-primary-color)}.km-plist-empty{display:flex;flex-direction:column;align-items:flex-start;gap:8px;padding:10px;color:var(--p-text-muted-color);font-size:12.5px}.km-plist-empty p{margin:0}.km-picker{display:flex;flex-direction:column;gap:18px}.km-picker-sec{display:flex;flex-direction:column;gap:7px}.km-picker-sec-title{color:var(--p-text-muted-color);font-size:11px;font-weight:760;letter-spacing:.03em;text-transform:uppercase}.km-picker-list{display:flex;flex-direction:column;gap:4px}.km-picker-item{display:grid;grid-template-columns:32px minmax(0,1fr) 16px;align-items:center;gap:11px;padding:9px 10px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);background:transparent;color:var(--p-text-color);font:inherit;text-align:left;cursor:pointer;transition:border-color .12s ease,background-color .12s ease}.km-picker-item:hover{border-color:color-mix(in srgb,var(--p-primary-color) 50%,var(--p-content-border-color));background:var(--kx-overlay-hover)}.km-picker-ico{width:32px;height:32px;display:inline-flex;align-items:center;justify-content:center;border-radius:var(--kx-radius-8);color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 11%,transparent)}.km-picker-ico svg{width:18px;height:18px}.km-picker-body{min-width:0;display:flex;flex-direction:column;gap:2px}.km-picker-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;font-weight:660}.km-picker-desc{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--p-text-muted-color);font-size:11.5px}.km-picker-go{width:16px;height:16px;color:var(--p-text-muted-color)}.km-form{display:flex;flex-direction:column;gap:16px}.km-editor-head{display:flex;align-items:center;gap:11px}.km-editor-head-text{min-width:0}.km-editor-head-title{font-size:14px;font-weight:740}.km-editor-head-sub{margin-top:2px;color:var(--p-text-muted-color);font-size:12px;line-height:1.4}.km-form-sec{display:flex;flex-direction:column;gap:10px}.km-form-sec+.km-form-sec{padding-top:16px;border-top:1px solid var(--p-content-border-color)}.km-form-sec-title{color:var(--p-text-muted-color);font-size:11px;font-weight:760;letter-spacing:.03em;text-transform:uppercase}.km-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}.km-form-grid.four{grid-template-columns:repeat(4,minmax(0,1fr))}.km-form-foot{position:sticky;bottom:-16px;display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px;margin:0 -16px -16px;padding:14px 16px;border-top:1px solid var(--p-content-border-color);background:var(--p-content-background)}.km-form-id{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11.5px;color:var(--p-text-muted-color)}.km-form-foot-sp{flex:1}.km-adv-toggle{display:inline-flex;align-items:center;gap:6px;padding:0;border:0;background:transparent;color:var(--p-text-muted-color);font:inherit;font-size:11px;font-weight:760;letter-spacing:.03em;text-transform:uppercase;cursor:pointer}.km-adv-toggle:hover{color:var(--p-text-color)}.km-adv-chev{width:14px;height:14px;transition:transform .15s ease}.km-adv-toggle.open .km-adv-chev{transform:rotate(90deg)}.km-adv-body{display:flex;flex-direction:column;gap:10px;margin-top:10px}.km-test-result{display:flex;align-items:center;gap:8px;padding:8px 11px;border-radius:var(--kx-radius-8);font-size:12.5px}.km-test-result svg{width:16px;height:16px;flex:0 0 auto}.km-test-result span{min-width:0;overflow-wrap:anywhere}.km-test-result.testing{color:var(--p-text-muted-color);background:var(--kx-overlay-subtle)}.km-test-result.ok{color:var(--p-success-600, var(--p-success-500));background:color-mix(in srgb,var(--p-success-500) 12%,transparent)}.km-test-result.fail{color:var(--p-danger-600, var(--p-danger-500));background:color-mix(in srgb,var(--p-danger-500) 10%,transparent)}.km-probe{border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);font-size:13px}.km-probe.ok{border-color:color-mix(in srgb,var(--p-success-500) 30%,var(--p-content-border-color));background:color-mix(in srgb,var(--p-success-500) 8%,transparent)}.km-probe.fail{border-color:color-mix(in srgb,var(--p-danger-500) 30%,var(--p-content-border-color));background:color-mix(in srgb,var(--p-danger-500) 8%,transparent)}.km-probe-head{display:flex;flex-wrap:wrap;align-items:center;gap:9px;padding:9px 10px 9px 12px}.km-probe-head>svg{width:17px;height:17px;flex:0 0 auto}.km-probe.ok .km-probe-head>svg{color:var(--p-success-600, var(--p-success-500))}.km-probe.fail .km-probe-head>svg{color:var(--p-danger-600, var(--p-danger-500))}.km-probe-msg{flex:1;min-width:0}.km-probe-time{flex:0 0 auto;padding:1px 7px;border-radius:var(--kx-radius-tag);background:var(--kx-overlay-subtle);color:var(--p-text-muted-color);font-size:11px;font-weight:700;font-variant-numeric:tabular-nums}.km-probe-adv-btn{flex:0 0 auto}.km-probe-x{width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;border:0;border-radius:6px;background:transparent;color:var(--p-text-muted-color);cursor:pointer;opacity:.7}.km-probe-x:hover{opacity:1;background:color-mix(in srgb,currentColor 12%,transparent)}.km-probe-x svg{width:14px;height:14px}.km-probe-adv{display:flex;flex-direction:column;gap:10px;padding:10px 12px 12px;border-top:1px solid var(--p-content-border-color)}.km-probe-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:6px 16px}.km-probe-kv{display:flex;align-items:baseline;gap:8px;min-width:0}.km-probe-kv span{flex:0 0 96px;color:var(--p-text-muted-color);font-size:11.5px}.km-probe-kv code{min-width:0;overflow:hidden;text-overflow:ellipsis;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11.5px}.km-probe-tokens{display:flex;flex-wrap:wrap;align-items:center;gap:6px}.km-probe-tokens-l{color:var(--p-text-muted-color);font-size:11.5px;margin-right:2px}.km-probe-tok{padding:1px 8px;border-radius:var(--kx-radius-tag);background:var(--kx-overlay-subtle);color:var(--p-text-muted-color);font-size:11px;font-variant-numeric:tabular-nums}.km-probe-tok b{color:var(--p-text-color);font-weight:700}.km-probe-out{display:flex;flex-direction:column;gap:4px}.km-probe-out span{color:var(--p-text-muted-color);font-size:11.5px;font-weight:700}.km-probe-out pre{margin:0;max-height:160px;overflow:auto;padding:9px 10px;border-radius:6px;background:var(--kx-overlay-subtle);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11.5px;line-height:1.45;white-space:pre-wrap;word-break:break-word}.km-tabs{flex:0 0 auto;display:flex;gap:2px;padding:0 12px;border-bottom:1px solid var(--p-content-border-color)}.km-tab{position:relative;display:inline-flex;align-items:center;gap:7px;height:44px;padding:0 12px;border:0;background:transparent;color:var(--p-text-muted-color);font:inherit;font-size:13px;font-weight:700;cursor:pointer}.km-tab:hover,.km-tab.on{color:var(--p-text-color)}.km-tab.on:after{content:"";position:absolute;left:8px;right:8px;bottom:-1px;height:2px;border-radius:2px 2px 0 0;background:var(--p-primary-color)}.km-tab b{min-width:18px;padding:0 6px;border-radius:999px;background:var(--kx-overlay-subtle);color:var(--p-text-muted-color);font-size:11px;font-weight:700;text-align:center}.km-tab.on b{background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.km-classes{flex:1;min-height:0;display:flex;flex-direction:column}.km-classes-list{display:flex;flex-direction:column;gap:10px;padding:14px 16px}.km-class{flex:0 0 auto;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);overflow:hidden}.km-class-head{display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--kx-overlay-subtle);border-bottom:1px solid var(--p-content-border-color)}.km-class-head-text{flex:1;min-width:0}.km-class-title{display:flex;align-items:center;gap:8px;font-size:13.5px;font-weight:720}.km-class-ref{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;font-weight:600;color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);padding:1px 6px;border-radius:6px}.km-class-desc{margin-top:3px;color:var(--p-text-muted-color);font-size:12px;line-height:1.4}.km-class-meta{display:flex;align-items:center;gap:8px;flex:0 0 auto}.km-class-count{color:var(--p-text-muted-color);font-size:11.5px;white-space:nowrap}.km-class-members{display:flex;flex-direction:column}.km-class-member{display:grid;grid-template-columns:58px minmax(0,1.2fr) minmax(0,1fr) auto;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid var(--p-content-border-color)}.km-class-member:last-child{border-bottom:0}.km-class-member.top{background:color-mix(in srgb,var(--p-success-500) 6%,transparent)}.km-class-rank{width:20px;height:20px;display:inline-flex;align-items:center;justify-content:center;border-radius:6px;background:var(--kx-overlay-subtle);color:var(--p-text-muted-color);font-size:11px;font-weight:700}.km-class-member-name{font-size:13px;font-weight:620;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.km-class-member-id{color:var(--p-text-muted-color);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.km-class-member-pri{color:var(--p-text-muted-color);font-size:11px;justify-self:end;white-space:nowrap}.km-class-empty{padding:12px;color:var(--p-text-muted-color);font-size:12px}@media(max-width:860px){.km-shell{grid-template-columns:1fr;grid-template-rows:auto minmax(0,1fr)}.km-rail{border-right:0;border-bottom:1px solid var(--p-content-border-color);max-height:40vh}.km-form-grid,.km-form-grid.four{grid-template-columns:1fr}.km-class-member{grid-template-columns:auto minmax(0,1fr) auto}.km-class-member-id{display:none}}@media(max-width:560px){.km-probe-grid{grid-template-columns:1fr}}.ks{height:100%;min-height:0;display:flex;flex-direction:column;color:var(--p-text-color);background:var(--p-content-background)}.ks-tabs{padding:0 var(--system-surface-gutter);flex:none}.ks-top-notice{margin:12px var(--system-surface-gutter)}.ks-rail-search{padding:8px 10px}.ks-rail-list{padding:0 8px 10px;overflow-y:auto}.ks-rail-group{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--p-text-muted-color);padding:10px 6px 4px}.ks-scope-row{width:100%;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;border:none;border-radius:var(--kx-radius-8);background:transparent;cursor:pointer;text-align:left;color:var(--p-text-color);transition:background .12s;font:inherit}.ks-scope-row:hover{background:var(--kx-overlay-hover)}.ks-scope-row.active{background:color-mix(in srgb,var(--p-primary-color) 14%,transparent)}.ks-scope-name{font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ks-scope-meta{flex:none;display:flex;align-items:center;gap:6px}.ks-scope-count{font-size:11px;font-weight:700;color:var(--p-text-muted-color);min-width:18px;text-align:right}.ks-builder,.ks-view{display:flex;flex-direction:column;height:100%;min-height:0;padding:16px var(--system-surface-gutter);gap:14px;overflow:auto}.ks-builder-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}.ks-builder-title{display:flex;align-items:center;gap:8px;font-size:16px;font-weight:700;color:var(--p-text-color)}.ks-builder-acts{display:flex;gap:8px;flex-wrap:wrap}.ks-fields{display:grid;grid-template-columns:minmax(180px,1fr) minmax(0,2fr);gap:12px}.ks-panes{flex:1;min-height:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.ks-pane{display:flex;flex-direction:column;min-height:0;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);background:var(--kx-overlay-subtle)}.ks-pane.drop{border-style:dashed}.ks-pane-head{display:flex;align-items:baseline;justify-content:space-between;gap:8px;padding:10px 12px 8px;font-size:13px;font-weight:700;color:var(--p-text-color)}.ks-pane-sub{font-size:11px;font-weight:500;color:var(--p-text-muted-color)}.ks-pane-search{padding:0 10px 8px}.ks-pane-body{flex:1;min-height:0;overflow-y:auto;padding:4px 10px 10px;display:flex;flex-direction:column;gap:8px}.ks-pane-empty{padding:16px 8px;font-size:12px;color:var(--p-text-muted-color);text-align:center}.ks-drop-hint{margin:auto;display:flex;flex-direction:column;align-items:center;gap:8px;padding:24px;color:var(--p-text-muted-color);font-size:13px;text-align:center}.ks-drop-hint svg{font-size:28px}.ks-view-note{font-size:12px;color:var(--p-text-muted-color);line-height:1.5;margin:0}.ks-view-list{border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);background:var(--kx-overlay-subtle);padding:4px 10px}.ks-pcard{display:flex;align-items:flex-start;gap:8px;padding:10px 10px 10px 6px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);background:var(--p-content-background);cursor:grab;transition:border-color .12s,box-shadow .12s,transform .08s}.ks-pcard:hover{border-color:var(--p-primary-color);box-shadow:0 1px 6px #0000000f}.ks-pcard:active{cursor:grabbing;transform:scale(.997)}.ks-pcard-grip{flex:none;margin-top:2px;color:var(--p-text-muted-color);font-size:15px}.ks-pcard-body{flex:1;min-width:0}.ks-pcard-head{display:flex;align-items:center;gap:8px}.ks-pcard-title{font-weight:600;font-size:13px;color:var(--p-text-color);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ks-pcard-comment{font-size:12px;color:var(--p-text-muted-color);margin-top:2px;line-height:1.35}.ks-pcard-act{flex:none;width:24px;height:24px;display:grid;place-items:center;border:none;border-radius:6px;cursor:pointer;background:transparent;color:var(--p-text-muted-color);transition:background .12s,color .12s}.ks-pcard-act.add:hover{background:color-mix(in srgb,var(--p-success-600) 12%,transparent);color:var(--p-success-700)}.ks-pcard-act.remove:hover{background:color-mix(in srgb,var(--p-danger-500) 12%,transparent);color:var(--p-danger-700)}.ks-pcard{flex-direction:column;align-items:stretch}.ks-pcard-row{width:100%;min-width:0;display:flex;align-items:flex-start;gap:8px}.ks-pcard.locked{cursor:default;opacity:.9}.ks-pcard.locked:hover{border-color:var(--p-content-border-color);box-shadow:none}.ks-pcard-grip.locked{color:var(--p-text-muted-color)}.ks-overlay-warn{display:flex;gap:10px;align-items:flex-start;padding:10px 12px;border-radius:var(--kx-radius-8);background:color-mix(in srgb,var(--p-warn-500) 12%,transparent);border:1px solid color-mix(in srgb,var(--p-warn-500) 40%,transparent);color:var(--p-text-color);font-size:12.5px;line-height:1.45}.ks-overlay-warn svg{flex:none;margin-top:1px;color:var(--p-warn-600);font-size:18px}.ks-panes.three{grid-template-columns:repeat(3,minmax(0,1fr))}.ks-pane.locked-pane{background:var(--kx-overlay-hover)}.ks-ext-block{margin-top:14px}.ks-ext-head{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700;color:var(--p-text-color);margin-bottom:6px}.ks-ext-head svg{color:var(--p-warn-600)}.ks-runas{flex:1;min-height:0;overflow:auto;padding:16px var(--system-surface-gutter);display:flex;flex-direction:column;gap:16px;color:var(--p-text-color)}.ks-runas>*{width:100%;max-width:860px}.ks-runas-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}.ks-runas-title{margin:0 0 6px;font-size:16px;font-weight:700}.ks-runas-lede{margin:0;max-width:640px;color:var(--p-text-muted-color);font-size:13px;line-height:1.5}.ks-runas-lede b{color:var(--p-text-color);font-weight:600}.ks-runas-acts{flex:0 0 auto;display:flex;align-items:center;gap:6px}.ks-runas-form{border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);background:var(--kx-overlay-subtle)}.ks-runas-form fieldset{border:0;margin:0;padding:0;min-width:0}.ks-runas-form-head{display:flex;align-items:center;justify-content:space-between;padding:10px 12px 10px 16px;border-bottom:1px solid var(--p-content-border-color);font-size:13px;font-weight:700}.ks-runas-form-foot{display:flex;justify-content:flex-end;gap:8px;padding:12px 16px;border-top:1px solid var(--p-content-border-color)}.ks-runas-steps{list-style:none;counter-reset:step;margin:0;padding:16px;display:flex;flex-direction:column;gap:18px}.ks-runas-steps>li{counter-increment:step;position:relative;padding-left:34px;display:flex;flex-direction:column;gap:8px}.ks-runas-steps>li:before{content:counter(step);position:absolute;left:0;top:0;width:22px;height:22px;border-radius:999px;display:grid;place-items:center;font-size:11.5px;font-weight:700;color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 14%,transparent)}.ks-runas-component-options{display:flex;flex-wrap:wrap;gap:8px 16px;margin:8px 0}.ks-runas-component-option{display:inline-flex;align-items:center;gap:8px;font-size:13px;cursor:pointer}.ks-runas-chips{display:flex;flex-wrap:wrap;gap:6px}.ks-runas-pending{display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:13px}.ks-runas-history{align-self:flex-start;width:auto}.ks-runas-list{display:flex;flex-direction:column;gap:8px}.ks-runas-grant{display:flex;align-items:center;gap:12px;padding:12px 14px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);background:var(--p-content-background)}.ks-runas-grant-icon{flex:0 0 auto;font-size:20px;color:var(--p-primary-color)}.ks-runas-grant.revoked .ks-runas-grant-icon{color:var(--p-text-muted-color)}.ks-runas-grant-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}.ks-runas-grant-line{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px;font-size:13.5px}.ks-runas-who{font-weight:650;overflow-wrap:anywhere}.ks-runas-verb{color:var(--p-text-muted-color)}.ks-runas-grant-meta{color:var(--p-text-muted-color);font-size:12px;overflow-wrap:anywhere}.ks-runas-grant-meta code{font-family:ui-monospace,Menlo,monospace;font-size:11px;padding:1px 5px;border-radius:4px;background:var(--kx-overlay-subtle)}.ks-runas-grant-meta b{color:var(--p-text-color);font-weight:600}.ks-runas-empty{display:flex;flex-direction:column;align-items:center;gap:8px;padding:40px 16px;text-align:center;border:1px dashed var(--p-content-border-color);border-radius:var(--kx-radius-10);color:var(--p-text-muted-color);font-size:13px}.ks-runas-empty>svg{font-size:28px}.ks-runas-empty b{color:var(--p-text-color)}@media(max-width:640px){.ks-runas{padding:16px}.ks-runas-head{flex-direction:column}.ks-runas-grant{flex-wrap:wrap}}@media(max-width:1100px){.ks-fields{grid-template-columns:1fr}.ks-panes,.ks-panes.three{flex:none;grid-template-columns:1fr}.ks-pane{min-height:180px}.ks-pane-body{max-height:360px}.ks-pane-head{flex-wrap:wrap}}', ac = { props: { type: "object", properties: {} } }, ic = {
  wippy: ac
};
class sc extends Bo {
  static get wippyConfig() {
    return {
      propsSchema: ic.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: oc
    };
  }
  static get vueConfig() {
    return { rootComponent: rc, plugins: [$i] };
  }
}
lo(import.meta.url, sc);
//# sourceMappingURL=index.js.map
