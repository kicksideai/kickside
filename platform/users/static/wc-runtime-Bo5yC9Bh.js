import { hasInjectionContext as ar, inject as He, effectScope as lr, ref as F, markRaw as ur, createApp as cr, onMounted as rn, onUnmounted as dr, watch as me, readonly as mr, getCurrentInstance as vt, nextTick as fr, reactive as pr, renderSlot as De, openBlock as on, createBlock as hr, Teleport as sn, createCommentVNode as an, useId as gr, mergeProps as ge, createElementBlock as vr, createElementVNode as yr, h as br } from "vue";
import { addCollection as _r } from "@iconify/vue";
import { config as yt, addIcons as Sr, on as $r, applyThemeMode as Ee, host as wr, hostCss as Tr, loadCss as Cr } from "@wippy-fe/proxy";
var qe = "data-wippy-visible";
function bt(e) {
  const t = e.getAttribute(qe);
  return t === "true" ? !0 : t === "false" ? !1 : null;
}
var Pr = Object.defineProperty, ln = (e) => {
  throw TypeError(e);
}, Or = (e, t, n) => t in e ? Pr(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, O = (e, t, n) => Or(e, typeof t != "symbol" ? t + "" : t, n), un = (e, t, n) => t.has(e) || ln("Cannot " + n), xr = (e, t, n) => (un(e, t, "read from private field"), n ? n.call(e) : t.get(e)), kr = (e, t, n) => t.has(e) ? ln("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, n), Er = (e, t, n, r) => (un(e, t, "write to private field"), t.set(e, n), n), Ar = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], Lr = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function _t(e) {
  const t = e.startsWith("--") ? e : `--${e}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(t) ? t : null;
}
function jr(...e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of e)
    if (n)
      for (const [r, o] of Object.entries(n)) {
        if ((r === "@light" || r === "@dark") && o && typeof o == "object") {
          for (const [a, l] of Object.entries(o)) {
            const s = typeof l == "string" ? _t(a) : null;
            s && t.add(s);
          }
          continue;
        }
        const i = typeof o == "string" ? _t(r) : null;
        i && t.add(i);
      }
  return [...t].sort();
}
function Nr(e) {
  if (e.length === 0)
    return "";
  const t = e.map((n) => `  ${n}: inherit;`).join(`
`);
  return `${Lr} {
${t}
}`;
}
function Ir(e, t) {
  const n = Nr(t);
  n && cn(e, n, "@wippy-fe/css-variables-bridge");
}
function Rr(e, t) {
  const r = (t ?? Ar).map(async (o) => {
    const i = Tr[o];
    if (!i)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${o}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await Cr(i);
    } catch (a) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${o}" (${i}):`, a), null;
    }
  });
  return Promise.all(r).then((o) => {
    for (const i of o) {
      if (!i)
        continue;
      const a = document.createElement("style");
      a.textContent = i, a.setAttribute("role", "@wippy-fe/host-css"), e.appendChild(a);
    }
  });
}
function Vr(e, t) {
  const n = document.createElement("style");
  n.textContent = t, e.appendChild(n);
}
function cn(e, t, n) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const o = new CSSStyleSheet();
    o.replaceSync(t), e.adoptedStyleSheets = [...e.adoptedStyleSheets, o];
    return;
  }
  const r = document.createElement("style");
  r.setAttribute("role", n), r.textContent = t, e.appendChild(r);
}
function Dr(e, t) {
  cn(e, t, "@wippy-fe/custom-css");
}
function dn(e) {
  return e.__wippyHost ?? null;
}
function Mr(e) {
  return e.replace(/-([a-z])/g, (t, n) => n.toUpperCase());
}
function Br(e, t, n) {
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
function ze(e, t) {
  const n = {}, r = [];
  for (const [o, i] of Object.entries(t.properties)) {
    const a = e.getAttribute(o), l = Mr(o);
    if (a === null) {
      i.default !== void 0 && (n[l] = i.default);
      continue;
    }
    const s = Br(o, a, i);
    s.error ? r.push(s.error) : n[l] = s.value;
  }
  return { props: n, errors: r };
}
var Ur = class {
  constructor(e, t) {
    O(this, "_props"), O(this, "_errors"), O(this, "_content"), O(this, "_hostVisibility"), O(this, "_propsListeners", /* @__PURE__ */ new Set()), O(this, "_contentListeners", /* @__PURE__ */ new Set()), O(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), O(this, "_disposed", !1), O(this, "_emitToDom"), O(this, "props"), O(this, "events"), O(this, "content"), O(this, "hostVisibility"), this._props = e.props, this._errors = e.errors, this._content = e.content, this._hostVisibility = e.hostVisibility, this._emitToDom = t;
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
}, Ve, Wr = class extends HTMLElement {
  constructor() {
    super(), O(this, "_internals"), O(this, "_contentObserver", null), O(this, "_initialized", !1), O(this, "_container", null), kr(this, Ve, null), O(this, "_attachment", 0), O(this, "_reactive", null), O(this, "_lastProps", null), O(this, "_lastErrors", []), O(this, "_lastContent", null), O(this, "_themeUnsub", null), O(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = bt(this);
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
    return dn(this);
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
        const i = ze(this, e.propsSchema);
        e.validateProps && i.errors.push(...e.validateProps(i.props)), n = i.props, r = i.errors, this._lastProps = n, this._lastErrors = r;
      }
      const o = t ? this._lastContent ?? this._extractContent(e.contentTemplate) : null;
      t && this._lastContent === null && (this._lastContent = o), this._reactive = new Ur(
        { props: n, errors: r, content: o, hasContent: t, hostVisibility: this._hostVisible },
        this.emitEvent.bind(this)
      );
    }
    return this._reactive;
  }
  // ── Lifecycle ──────────────────────────────────────────────
  connectedCallback() {
    const e = ++this._attachment;
    this._internals.states.add("loading");
    try {
      const t = this.constructor.wippyConfig, n = this._initialized, r = xr(this, Ve) ?? Er(this, Ve, this.shadowRoot ?? this.attachShadow({ mode: t.shadowMode ?? "open" }));
      let o;
      if (this._container)
        o = this._container;
      else {
        if (this.onInit(r), e !== this._attachment)
          return;
        t.inlineCss && Vr(r, t.inlineCss);
        try {
          const d = yt?.theming, c = jr(
            d?.global?.cssVariables,
            d?.children?.cssVariables
          );
          Ir(r, c);
        } catch {
        }
        if (t.customCss !== !1)
          try {
            const d = yt?.theming, c = [d?.global?.customCSS, d?.children?.customCSS].filter(Boolean).join(`
`);
            c && Dr(r, c);
          } catch {
          }
        (t.hostCssKeys === void 0 || t.hostCssKeys.length > 0) && Rr(r, t.hostCssKeys), o = document.createElement("div"), o.setAttribute("data-wippy-theme-root", "");
        const u = t.containerClasses ?? [];
        u.length > 0 && o.classList.add(...u), r.appendChild(o), this._container = o, Sr(_r);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = $r("@theme", (u) => this._applyTheme(u)));
      const { props: i, errors: a } = ze(this, t.propsSchema);
      t.validateProps && a.push(...t.validateProps(i));
      const l = i;
      this._lastProps = l, this._lastErrors = a;
      let s = null;
      if (t.contentTemplate && (s = this._extractContent(t.contentTemplate), this._lastContent = s, this._contentObserver = new MutationObserver(() => {
        const u = this._extractContent(t.contentTemplate);
        this._lastContent = u, this._reactive?.notifyContent(u), this.onContentChanged(u);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(r, o, l, a, s, n), e !== this._attachment)
        return;
      this._internals.states.delete("loading"), this._internals.states.add("ready"), n || (this._initialized = !0), this.onReady(), e === this._attachment && this.emitEvent("load");
    } catch (t) {
      if (e !== this._attachment || (this.onError(t), e !== this._attachment))
        return;
      this._internals.states.delete("loading"), this._internals.states.add("error"), this.emitEvent("error", {
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
  _applyTheme(e = wr.getThemeMode?.()) {
    Ee(e, this), this._container && Ee(e, this._container);
  }
  disconnectedCallback() {
    const e = ++this._attachment;
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), Ee("auto", this), this._container && Ee("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), e === this._attachment && (this.emitEvent("unload"), e === this._attachment && (this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus));
  }
  attributeChangedCallback(e, t, n) {
    if (t === n)
      return;
    if (e === qe) {
      const l = this._hostVisible, s = bt(this);
      if (s === l)
        return;
      this._hostVisible = s, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(s, l), this.onHostVisibilityChanged(s, l));
      return;
    }
    const r = this.constructor.wippyConfig, { props: o, errors: i } = ze(this, r.propsSchema);
    r.validateProps && i.push(...r.validateProps(o));
    const a = o;
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
   *
   * A template keeps its children in one of two places. Parsed HTML (page
   * markup, `innerHTML`) puts them in `template.content`, a DocumentFragment.
   * DOM APIs add them as the template element's own child nodes and leave
   * `template.content` empty: that is how a Vue SFC sets
   * `<template data-type="...">{{ text }}</template>`. The content fragment is
   * read first, then the element's own children. Only text is returned, never
   * markup, in both cases.
   */
  _extractContent(e) {
    const t = this.querySelector(`template[data-type="${e}"]`);
    return t ? t.content.textContent?.trim() || t.textContent?.trim() || "" : null;
  }
  /** Called when child `<template>` content changes. Override to update framework state. */
  onContentChanged(e) {
  }
};
Ve = /* @__PURE__ */ new WeakMap();
function Hr(e) {
  return e.__wippyHostBus ?? null;
}
function Fr(e) {
  return e.dataset.wippyPanelId ?? null;
}
/*!
 * pinia v4.0.3
 * (c) 2026 Eduardo San Martin Morote
 * @license MIT
 */
let mn;
const fn = (e) => mn = e, zr = () => ar() && He(pn) || mn, pn = (
  /* istanbul ignore next */
  Symbol()
);
function Kr() {
  const e = lr(!0), t = e.run(() => F({}));
  let n = [], r = [];
  const o = ur({
    install(i) {
      fn(o), o._a = i, i.provide(pn, o), i.config.globalProperties.$pinia = o, r.forEach((a) => n.push(a)), r = [];
    },
    use(i) {
      return this._a ? n.push(i) : r.push(i), this;
    },
    _p: n,
    _a: null,
    _e: e,
    _s: /* @__PURE__ */ new Map(),
    state: t
  });
  return o;
}
var Yr = Object.defineProperty, qr = (e, t, n) => t in e ? Yr(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, W = (e, t, n) => qr(e, typeof t != "symbol" ? t + "" : t, n);
function xs(e, t) {
  return { lazyConfig: e, mountLifecycle: !0, lazyUi: t };
}
function St(e, t, n) {
  const r = e.createElement("div"), o = n ? t.failed : t.loading;
  r.dataset.lazyState = n ? "failed" : "loading", r.setAttribute("role", n ? "alert" : "status"), r.setAttribute("aria-label", o), r.style.cssText = "display:grid;place-items:center;text-align:center;";
  const i = t.surface === "page";
  if (r.style.cssText += i ? "block-size:100%;min-block-size:0;" : "min-block-size:2rem;font-size:.875rem;", n)
    r.style.color = "var(--p-danger-500, currentColor)", r.textContent = !i && t.iconOnly ? "⚠" : o, !i && t.iconOnly && (r.title = o);
  else {
    const a = e.createElement("style");
    a.textContent = '@media (prefers-reduced-motion: no-preference) { [data-lazy-state="loading"] > [data-wippy-spinner] { animation: wippy-lazy-spin 1s linear infinite; } } @keyframes wippy-lazy-spin { to { transform: rotate(1turn); } }';
    const l = e.createElement("span");
    l.dataset.wippySpinner = "", l.setAttribute("aria-hidden", "true"), l.style.cssText = "display:block;box-sizing:border-box;inline-size:1em;block-size:1em;border:2px solid var(--p-surface-300, currentColor);border-top-color:var(--p-primary-color, currentColor);border-radius:50%;", l.style.fontSize = i ? "2rem" : "1em", r.append(a, l);
  }
  return r;
}
var hn = /* @__PURE__ */ Symbol("wippy:emit"), gn = /* @__PURE__ */ Symbol("wippy:props"), Gr = /* @__PURE__ */ Symbol("wippy:props_error"), Jr = /* @__PURE__ */ Symbol("wippy:content"), Qr = /* @__PURE__ */ Symbol("wippy:panel-id"), Zr = /* @__PURE__ */ Symbol("wippy:layout-bus"), Xr = /* @__PURE__ */ Symbol("wippy:host"), vn = /* @__PURE__ */ Symbol("wippy:host-visibility");
function ks() {
  const e = He(gn);
  if (!e)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return e;
}
function Es() {
  const e = He(hn);
  if (!e)
    throw new Error("useEvents() must be called inside a WippyVueElement");
  return e;
}
function eo() {
  const e = He(vn);
  if (!e)
    throw new Error("useHostVisibility() must be called inside a WippyVueElement");
  return e;
}
function As(e) {
  const t = eo();
  let n = !1, r = null, o = !1;
  function i() {
    if (r)
      return o = !0, r;
    let a;
    try {
      a = Promise.resolve(e());
    } catch (s) {
      a = Promise.reject(s);
    }
    const l = a.finally(() => {
      if (r === l && (r = null, n && o))
        return o = !1, i();
    });
    return r = l, l;
  }
  return rn(() => (n = !0, i())), dr(() => {
    n = !1, o = !1;
  }), me(t, (a, l) => {
    if (n && l === !1 && a === !0)
      return i();
  }), t;
}
var Ae = /* @__PURE__ */ new WeakMap();
function $t(e, t) {
  const n = Ae.get(e);
  if (n)
    return n;
  const r = Promise.resolve().then(t);
  return Ae.set(e, r), r.catch(() => {
    Ae.get(e) === r && Ae.delete(e);
  }), r;
}
var Ls = class extends Wr {
  constructor() {
    super(...arguments), W(this, "_vueApp", null), W(this, "_mountingApp", !1), W(this, "_mountState", "idle"), W(this, "_feedback", null), W(this, "_propsRef", F({})), W(this, "_errorsRef", F([])), W(this, "_contentRef", F(null)), W(this, "_hostVisibilityRef", F(null)), W(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  /** Prepare the implementation without creating a Vue or Pinia instance. */
  static async preloadImplementation() {
    const e = this.vueConfig;
    e.mountLifecycle && !e.rootComponent && e.lazyConfig && await $t(this, e.lazyConfig);
  }
  /** Undefined on configurations that use only the legacy load event. */
  get wippyMountState() {
    return this.constructor.vueConfig.mountLifecycle ? this._mountState : void 0;
  }
  onMount(e, t, n, r, o, i) {
    const a = this.constructor, l = a.vueConfig, s = new AbortController();
    this._bridgeAbort = s;
    const u = () => !s.signal.aborted && this._bridgeAbort === s;
    this._mountState = "mounting", this._propsRef.value = n, this._errorsRef.value = r, this._contentRef.value = o ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const c of r)
      if (this.emitEvent("invalid", { message: c }), !u())
        return;
    this.reactive.props.subscribe((c, m) => {
      this._propsRef.value = c, this._errorsRef.value = [...m];
      for (const f of m)
        this.emitEvent("invalid", { message: f });
    }, { signal: s.signal }), this.reactive.content && this.reactive.content.subscribe((c) => {
      this._contentRef.value = c;
    }, { signal: s.signal }), this.reactive.hostVisibility.subscribe((c) => {
      this._hostVisibilityRef.value = c;
    }, { signal: s.signal });
    const d = (c) => {
      if (!u())
        return;
      const m = zr(), f = cr(c.rootComponent);
      let p = !1, v = !1, g, y;
      this._mountingApp = !0;
      try {
        const _ = Kr();
        if (c.piniaPlugins)
          for (const $ of c.piniaPlugins)
            _.use($);
        f.use(_);
        for (const $ of c.plugins ?? [])
          f.use($);
        if (f.provide(gn, this._propsRef), f.provide(Gr, this._errorsRef), f.provide(hn, this.emitEvent.bind(this)), f.provide(Jr, this._contentRef), f.provide(vn, this._hostVisibilityRef), f.provide(Qr, Fr(this)), f.provide(Zr, Hr(this)), f.provide(Xr, dn(this)), c.providers?.(f, this), !u())
          return;
        if (y = f.config.errorHandler, l.mountLifecycle && (f.config.errorHandler = ($, h, b) => {
          v || (g = $), v = !0, y?.($, h, b);
        }), f.mount(t), p = !0, v)
          throw g;
        u() && (this._vueApp = f);
      } finally {
        l.mountLifecycle && p && (f.config.errorHandler = y);
        try {
          p && (v || !u()) && f.unmount();
        } finally {
          fn(m), this._mountingApp = !1;
        }
      }
      l.mountLifecycle && queueMicrotask(() => {
        u() && this.isConnected && (this._mountState = "mounted", this.dispatchEvent(new Event("wippy-mounted")));
      });
    };
    if (l.rootComponent) {
      if (this._mountingApp && l.mountLifecycle) {
        queueMicrotask(() => {
          try {
            d(l);
          } catch (c) {
            u() && (this._mountState = "failed", this.emitEvent("error", { message: c instanceof Error ? c.message : String(c), error: c }));
          }
        });
        return;
      }
      try {
        d(l);
      } catch (c) {
        if (u())
          throw this._mountState = "failed", c;
      }
    } else if (l.lazyConfig) {
      const c = t.ownerDocument, m = l.lazyUi;
      m?.surface === "page" && (t.style.blockSize = "100%", t.style.minBlockSize = "0");
      let f = !1, p, v;
      const g = () => {
        clearTimeout(p), clearTimeout(v), this._feedback?.remove(), this._feedback = null;
      };
      s.signal.addEventListener("abort", g, { once: !0 });
      const y = () => {
        if (!u() || f)
          return;
        const b = m ? St(c, m, !1) : c.createElement("wippy-loading");
        b.setAttribute("no-bg", ""), this._feedback = b, t.appendChild(b);
      }, _ = (b) => {
        if (!u())
          return;
        f = !0, g(), this._mountState = "failed";
        const k = m?.failed ?? (b instanceof Error ? b.message : String(b)), E = m ? St(c, m, !0) : c.createElement("wippy-error");
        m || (E.setAttribute("title", "Failed to load"), E.setAttribute("message", k)), this._feedback = E, t.appendChild(E), this.emitEvent("error", m ? { message: k, error: b } : { message: k });
      }, $ = m?.delay ?? (m?.surface === "compact" ? 200 : 0);
      $ > 0 ? p = setTimeout(y, $) : y(), m && (v = setTimeout(() => _(new Error("The component did not load in time.")), m.timeout ?? 3e4)), (l.mountLifecycle ? $t(a, l.lazyConfig) : l.lazyConfig()).then((b) => {
        !u() || f || (f = !0, g(), d(b));
      }, (b) => {
        f || _(b);
      }).catch(_);
    } else
      throw this._mountState = "failed", new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._mountState = "idle", this._feedback?.remove(), this._feedback = null;
    const e = this._vueApp;
    this._vueApp = null, e?.unmount();
  }
}, to = Object.defineProperty, wt = Object.getOwnPropertySymbols, no = Object.prototype.hasOwnProperty, ro = Object.prototype.propertyIsEnumerable, Tt = (e, t, n) => t in e ? to(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, oo = (e, t) => {
  for (var n in t || (t = {})) no.call(t, n) && Tt(e, n, t[n]);
  if (wt) for (var n of wt(t)) ro.call(t, n) && Tt(e, n, t[n]);
  return e;
};
function z(e) {
  return e == null || e === "" || Array.isArray(e) && e.length === 0 || !(e instanceof Date) && typeof e == "object" && Object.keys(e).length === 0;
}
function io(e, t, n, r = 1) {
  let o = -1, i = z(e), a = z(t);
  return i && a ? o = 0 : i ? o = r : a ? o = -r : typeof e == "string" && typeof t == "string" ? o = n(e, t) : o = e < t ? -1 : e > t ? 1 : 0, o;
}
function Ge(e, t, n = /* @__PURE__ */ new WeakSet()) {
  if (e === t) return !0;
  if (!e || !t || typeof e != "object" || typeof t != "object" || n.has(e) || n.has(t)) return !1;
  n.add(e).add(t);
  let r = Array.isArray(e), o = Array.isArray(t), i, a, l;
  if (r && o) {
    if (a = e.length, a != t.length) return !1;
    for (i = a; i-- !== 0; ) if (!Ge(e[i], t[i], n)) return !1;
    return !0;
  }
  if (r != o) return !1;
  let s = e instanceof Date, u = t instanceof Date;
  if (s != u) return !1;
  if (s && u) return e.getTime() == t.getTime();
  let d = e instanceof RegExp, c = t instanceof RegExp;
  if (d != c) return !1;
  if (d && c) return e.toString() == t.toString();
  let m = Object.keys(e);
  if (a = m.length, a !== Object.keys(t).length) return !1;
  for (i = a; i-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(t, m[i])) return !1;
  for (i = a; i-- !== 0; ) if (l = m[i], !Ge(e[l], t[l], n)) return !1;
  return !0;
}
function so(e, t) {
  return Ge(e, t);
}
function Fe(e) {
  return typeof e == "function" && "call" in e && "apply" in e;
}
function P(e) {
  return !z(e);
}
function Je(e, t) {
  if (!e || !t) return null;
  try {
    let n = e[t];
    if (P(n)) return n;
  } catch {
  }
  if (Object.keys(e).length) {
    if (Fe(t)) return t(e);
    if (t.indexOf(".") === -1) return e[t];
    {
      let n = t.split("."), r = e;
      for (let o = 0, i = n.length; o < i; ++o) {
        if (r == null) return null;
        r = r[n[o]];
      }
      return r;
    }
  }
  return null;
}
function yn(e, t, n) {
  return n ? Je(e, n) === Je(t, n) : so(e, t);
}
function js(e, t) {
  if (e != null && t && t.length) {
    for (let n of t) if (yn(e, n)) return !0;
  }
  return !1;
}
function B(e, t = !0) {
  return e instanceof Object && e.constructor === Object && (t || Object.keys(e).length !== 0);
}
function bn(e = {}, t = {}) {
  let n = oo({}, e);
  return Object.keys(t).forEach((r) => {
    let o = r;
    B(t[o]) && o in e && B(e[o]) ? n[o] = bn(e[o], t[o]) : n[o] = t[o];
  }), n;
}
function ao(...e) {
  return e.reduce((t, n, r) => r === 0 ? n : bn(t, n), {});
}
function Ns(e, t) {
  let n = -1;
  if (t) {
    for (let r = 0; r < t.length; r++) if (t[r] === e) {
      n = r;
      break;
    }
  }
  return n;
}
function Is(e, t) {
  let n = -1;
  if (P(e)) try {
    n = e.findLastIndex(t);
  } catch {
    n = e.lastIndexOf([...e].reverse().find(t));
  }
  return n;
}
function N(e, ...t) {
  return Fe(e) ? e(...t) : e;
}
function j(e, t = !0) {
  return typeof e == "string" && (t || e !== "");
}
function M(e) {
  return j(e) ? e.replace(/(-|_)/g, "").toLowerCase() : e;
}
function ct(e, t = "", n = {}) {
  let r = M(t).split("."), o = r.shift();
  if (o) {
    if (B(e)) {
      let i = Object.keys(e).find((a) => M(a) === o) || "";
      return ct(N(e[i], n), r.join("."), n);
    }
    return;
  }
  return N(e, n);
}
function _n(e, t = !0) {
  return Array.isArray(e) && (t || e.length !== 0);
}
function lo(e) {
  return P(e) && !isNaN(e);
}
function Rs(e = "") {
  return P(e) && e.length === 1 && !!e.match(/\S| /);
}
function Vs() {
  return new Intl.Collator(void 0, { numeric: !0 }).compare;
}
function oe(e, t) {
  if (t) {
    let n = t.test(e);
    return t.lastIndex = 0, n;
  }
  return !1;
}
function uo(...e) {
  return ao(...e);
}
function ve(e) {
  return e && e.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function I(e) {
  if (e && /[\xC0-\xFF\u0100-\u017E]/.test(e)) {
    let t = { A: /[\xC0-\xC5\u0100\u0102\u0104]/g, AE: /[\xC6]/g, C: /[\xC7\u0106\u0108\u010A\u010C]/g, D: /[\xD0\u010E\u0110]/g, E: /[\xC8-\xCB\u0112\u0114\u0116\u0118\u011A]/g, G: /[\u011C\u011E\u0120\u0122]/g, H: /[\u0124\u0126]/g, I: /[\xCC-\xCF\u0128\u012A\u012C\u012E\u0130]/g, IJ: /[\u0132]/g, J: /[\u0134]/g, K: /[\u0136]/g, L: /[\u0139\u013B\u013D\u013F\u0141]/g, N: /[\xD1\u0143\u0145\u0147\u014A]/g, O: /[\xD2-\xD6\xD8\u014C\u014E\u0150]/g, OE: /[\u0152]/g, R: /[\u0154\u0156\u0158]/g, S: /[\u015A\u015C\u015E\u0160]/g, T: /[\u0162\u0164\u0166]/g, U: /[\xD9-\xDC\u0168\u016A\u016C\u016E\u0170\u0172]/g, W: /[\u0174]/g, Y: /[\xDD\u0176\u0178]/g, Z: /[\u0179\u017B\u017D]/g, a: /[\xE0-\xE5\u0101\u0103\u0105]/g, ae: /[\xE6]/g, c: /[\xE7\u0107\u0109\u010B\u010D]/g, d: /[\u010F\u0111]/g, e: /[\xE8-\xEB\u0113\u0115\u0117\u0119\u011B]/g, g: /[\u011D\u011F\u0121\u0123]/g, i: /[\xEC-\xEF\u0129\u012B\u012D\u012F\u0131]/g, ij: /[\u0133]/g, j: /[\u0135]/g, k: /[\u0137,\u0138]/g, l: /[\u013A\u013C\u013E\u0140\u0142]/g, n: /[\xF1\u0144\u0146\u0148\u014B]/g, p: /[\xFE]/g, o: /[\xF2-\xF6\xF8\u014D\u014F\u0151]/g, oe: /[\u0153]/g, r: /[\u0155\u0157\u0159]/g, s: /[\u015B\u015D\u015F\u0161]/g, t: /[\u0163\u0165\u0167]/g, u: /[\xF9-\xFC\u0169\u016B\u016D\u016F\u0171\u0173]/g, w: /[\u0175]/g, y: /[\xFD\xFF\u0177]/g, z: /[\u017A\u017C\u017E]/g };
    for (let n in t) e = e.replace(t[n], n);
  }
  return e;
}
function Ds(e, t, n) {
  e && t !== n && (n >= e.length && (n %= e.length, t %= e.length), e.splice(n, 0, e.splice(t, 1)[0]));
}
function Ms(e, t, n = 1, r, o = 1) {
  let i = io(e, t, r, n), a = n;
  return (z(e) || z(t)) && (a = o === 1 ? n : o), a * i;
}
function co(e) {
  return j(e, !1) ? e[0].toUpperCase() + e.slice(1) : e;
}
function Sn(e) {
  return j(e) ? e.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : e;
}
function dt() {
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
function mo(...e) {
  if (e) {
    let t = [];
    for (let n = 0; n < e.length; n++) {
      let r = e[n];
      if (!r) continue;
      let o = typeof r;
      if (o === "string" || o === "number") t.push(r);
      else if (o === "object") {
        let i = Array.isArray(r) ? [mo(...r)] : Object.entries(r).map(([a, l]) => l ? a : void 0);
        t = i.length ? t.concat(i.filter((a) => !!a)) : t;
      }
    }
    return t.join(" ").trim();
  }
}
function fo(e, t) {
  return e ? e.classList ? e.classList.contains(t) : new RegExp("(^| )" + t + "( |$)", "gi").test(e.className) : !1;
}
function Qe(e, t) {
  if (e && t) {
    let n = (r) => {
      fo(e, r) || (e.classList ? e.classList.add(r) : e.className += " " + r);
    };
    [t].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function po() {
  return window.innerWidth - document.documentElement.offsetWidth;
}
function Bs(e) {
  typeof e == "string" ? Qe(document.body, e || "p-overflow-hidden") : (e != null && e.variableName && document.body.style.setProperty(e.variableName, po() + "px"), Qe(document.body, e?.className || "p-overflow-hidden"));
}
function ho(e) {
  if (e) {
    let t = document.createElement("a");
    if (t.download !== void 0) {
      let { name: n, src: r } = e;
      return t.setAttribute("href", r), t.setAttribute("download", n), t.style.display = "none", document.body.appendChild(t), t.click(), document.body.removeChild(t), !0;
    }
  }
  return !1;
}
function Us(e, t) {
  let n = new Blob([e], { type: "application/csv;charset=utf-8;" });
  window.navigator.msSaveOrOpenBlob ? navigator.msSaveOrOpenBlob(n, t + ".csv") : ho({ name: t + ".csv", src: URL.createObjectURL(n) }) || (e = "data:text/csv;charset=utf-8," + e, window.open(encodeURI(e)));
}
function ye(e, t) {
  if (e && t) {
    let n = (r) => {
      e.classList ? e.classList.remove(r) : e.className = e.className.replace(new RegExp("(^|\\b)" + r.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [t].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function Ws(e) {
  typeof e == "string" ? ye(document.body, e || "p-overflow-hidden") : (e != null && e.variableName && document.body.style.removeProperty(e.variableName), ye(document.body, e?.className || "p-overflow-hidden"));
}
function Ze(e) {
  for (let t of document?.styleSheets) try {
    for (let n of t?.cssRules) for (let r of n?.style) if (e.test(r)) return { name: r, value: n.style.getPropertyValue(r).trim() };
  } catch {
  }
  return null;
}
function $n(e) {
  let t = { width: 0, height: 0 };
  if (e) {
    let [n, r] = [e.style.visibility, e.style.display], o = e.getBoundingClientRect();
    e.style.visibility = "hidden", e.style.display = "block", t.width = o.width || e.offsetWidth, t.height = o.height || e.offsetHeight, e.style.display = r, e.style.visibility = n;
  }
  return t;
}
function wn() {
  let e = window, t = document, n = t.documentElement, r = t.getElementsByTagName("body")[0], o = e.innerWidth || n.clientWidth || r.clientWidth, i = e.innerHeight || n.clientHeight || r.clientHeight;
  return { width: o, height: i };
}
function Xe(e) {
  return e ? Math.abs(e.scrollLeft) : 0;
}
function go() {
  let e = document.documentElement;
  return (window.pageXOffset || Xe(e)) - (e.clientLeft || 0);
}
function vo() {
  let e = document.documentElement;
  return (window.pageYOffset || e.scrollTop) - (e.clientTop || 0);
}
function yo(e) {
  return e ? getComputedStyle(e).direction === "rtl" : !1;
}
function Hs(e, t, n = !0) {
  var r, o, i, a;
  if (e) {
    let l = e.offsetParent ? { width: e.offsetWidth, height: e.offsetHeight } : $n(e), s = l.height, u = l.width, d = t.offsetHeight, c = t.offsetWidth, m = t.getBoundingClientRect(), f = vo(), p = go(), v = wn(), g, y, _ = "top";
    m.top + d + s > v.height ? (g = m.top + f - s, _ = "bottom", g < 0 && (g = f)) : g = d + m.top + f, m.left + u > v.width ? y = Math.max(0, m.left + p + c - u) : y = m.left + p, yo(e) ? e.style.insetInlineEnd = y + "px" : e.style.insetInlineStart = y + "px", e.style.top = g + "px", e.style.transformOrigin = _, n && (e.style.marginTop = _ === "bottom" ? `calc(${(o = (r = Ze(/-anchor-gutter$/)) == null ? void 0 : r.value) != null ? o : "2px"} * -1)` : (a = (i = Ze(/-anchor-gutter$/)) == null ? void 0 : i.value) != null ? a : "");
  }
}
function Fs(e, t) {
  e && (typeof t == "string" ? e.style.cssText = t : Object.entries(t || {}).forEach(([n, r]) => e.style[n] = r));
}
function bo(e, t) {
  return e instanceof HTMLElement ? e.offsetWidth : 0;
}
function zs(e, t, n = !0, r = void 0) {
  var o;
  if (e) {
    let i = e.offsetParent ? { width: e.offsetWidth, height: e.offsetHeight } : $n(e), a = t.offsetHeight, l = t.getBoundingClientRect(), s = wn(), u, d, c = r ?? "top";
    if (!r && l.top + a + i.height > s.height ? (u = -1 * i.height, c = "bottom", l.top + u < 0 && (u = -1 * l.top)) : u = a, i.width > s.width ? d = l.left * -1 : l.left + i.width > s.width ? d = (l.left + i.width - s.width) * -1 : d = 0, e.style.top = u + "px", e.style.insetInlineStart = d + "px", e.style.transformOrigin = c, n) {
      let m = (o = Ze(/-anchor-gutter$/)) == null ? void 0 : o.value;
      e.style.marginTop = c === "bottom" ? `calc(${m ?? "2px"} * -1)` : m ?? "";
    }
  }
}
function mt(e) {
  if (e) {
    let t = e.parentNode;
    return t && t instanceof ShadowRoot && t.host && (t = t.host), t;
  }
  return null;
}
function _o(e) {
  return !!(e !== null && typeof e < "u" && e.nodeName && mt(e));
}
function se(e) {
  return typeof Element < "u" ? e instanceof Element : e !== null && typeof e == "object" && e.nodeType === 1 && typeof e.nodeName == "string";
}
function Ks() {
  if (window.getSelection) {
    let e = window.getSelection() || {};
    e.empty ? e.empty() : e.removeAllRanges && e.rangeCount > 0 && e.getRangeAt(0).getClientRects().length > 0 && e.removeAllRanges();
  }
}
function Me(e, t = {}) {
  if (se(e)) {
    let n = (r, o) => {
      var i, a;
      let l = (i = e?.$attrs) != null && i[r] ? [(a = e?.$attrs) == null ? void 0 : a[r]] : [];
      return [o].flat().reduce((s, u) => {
        if (u != null) {
          let d = typeof u;
          if (d === "string" || d === "number") s.push(u);
          else if (d === "object") {
            let c = Array.isArray(u) ? n(r, u) : Object.entries(u).map(([m, f]) => r === "style" && (f || f === 0) ? `${m.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}:${f}` : f ? m : void 0);
            s = c.length ? s.concat(c.filter((m) => !!m)) : s;
          }
        }
        return s;
      }, l);
    };
    Object.entries(t).forEach(([r, o]) => {
      if (o != null) {
        let i = r.match(/^on(.+)/);
        i ? e.addEventListener(i[1].toLowerCase(), o) : r === "p-bind" || r === "pBind" ? Me(e, o) : (o = r === "class" ? [...new Set(n("class", o))].join(" ").trim() : r === "style" ? n("style", o).join(";").trim() : o, (e.$attrs = e.$attrs || {}) && (e.$attrs[r] = o), e.setAttribute(r, o));
      }
    });
  }
}
function So(e, t = {}, ...n) {
  {
    let r = document.createElement(e);
    return Me(r, t), r.append(...n), r;
  }
}
function $o(e, t) {
  return se(e) ? Array.from(e.querySelectorAll(t)) : [];
}
function Tn(e, t) {
  return se(e) ? e.matches(t) ? e : e.querySelector(t) : null;
}
function Ys(e, t) {
  e && document.activeElement !== e && e.focus(t);
}
function wo(e, t) {
  if (se(e)) {
    let n = e.getAttribute(t);
    return isNaN(n) ? n === "true" || n === "false" ? n === "true" : n : +n;
  }
}
function Cn(e, t = "") {
  let n = $o(e, `button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [href]:not([tabindex = "-1"]):not([style*="display:none"]):not([hidden])${t},
            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t}`), r = [];
  for (let o of n) getComputedStyle(o).display != "none" && getComputedStyle(o).visibility != "hidden" && r.push(o);
  return r;
}
function qs(e, t) {
  let n = Cn(e, t);
  return n.length > 0 ? n[0] : null;
}
function Ct(e) {
  if (e) {
    let t = e.offsetHeight, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingTop) + parseFloat(n.paddingBottom) + parseFloat(n.borderTopWidth) + parseFloat(n.borderBottomWidth), t;
  }
  return 0;
}
function Gs(e) {
  if (e) {
    let [t, n] = [e.style.visibility, e.style.display];
    e.style.visibility = "hidden", e.style.display = "block";
    let r = e.offsetHeight;
    return e.style.display = n, e.style.visibility = t, r;
  }
  return 0;
}
function Js(e) {
  if (e) {
    let [t, n] = [e.style.visibility, e.style.display];
    e.style.visibility = "hidden", e.style.display = "block";
    let r = e.offsetWidth;
    return e.style.display = n, e.style.visibility = t, r;
  }
  return 0;
}
function Qs(e) {
  var t;
  if (e) {
    let n = (t = mt(e)) == null ? void 0 : t.childNodes, r = 0;
    if (n) for (let o = 0; o < n.length; o++) {
      if (n[o] === e) return r;
      n[o].nodeType === 1 && r++;
    }
  }
  return -1;
}
function Zs(e, t) {
  let n = Cn(e, t);
  return n.length > 0 ? n[n.length - 1] : null;
}
function Xs(e, t) {
  let n = e.nextElementSibling;
  for (; n; ) {
    if (n.matches(t)) return n;
    n = n.nextElementSibling;
  }
  return null;
}
function To(e) {
  if (e) {
    let t = e.getBoundingClientRect();
    return { top: t.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: t.left + (window.pageXOffset || Xe(document.documentElement) || Xe(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function Co(e, t) {
  return e ? e.offsetHeight : 0;
}
function Pn(e, t = []) {
  let n = mt(e);
  return n === null ? t : Pn(n, t.concat([n]));
}
function ea(e, t) {
  let n = e.previousElementSibling;
  for (; n; ) {
    if (n.matches(t)) return n;
    n = n.previousElementSibling;
  }
  return null;
}
function Po(e) {
  let t = [];
  if (e) {
    let n = Pn(e), r = /(auto|scroll)/, o = (i) => {
      try {
        let a = window.getComputedStyle(i, null);
        return r.test(a.getPropertyValue("overflow")) || r.test(a.getPropertyValue("overflowX")) || r.test(a.getPropertyValue("overflowY"));
      } catch {
        return !1;
      }
    };
    for (let i of n) {
      let a = i.nodeType === 1 && i.dataset.scrollselectors;
      if (a) {
        let l = a.split(",");
        for (let s of l) {
          let u = Tn(i, s);
          u && o(u) && t.push(u);
        }
      }
      i.nodeType !== 9 && o(i) && t.push(i);
    }
  }
  return t;
}
function ta() {
  if (window.getSelection) return window.getSelection().toString();
  if (document.getSelection) return document.getSelection().toString();
}
function Pt(e) {
  if (e) {
    let t = e.offsetWidth, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingLeft) + parseFloat(n.paddingRight) + parseFloat(n.borderLeftWidth) + parseFloat(n.borderRightWidth), t;
  }
  return 0;
}
function na(e, t, n) {
  let r = e[t];
  typeof r == "function" && r.apply(e, []);
}
function ra() {
  return /(android)/i.test(navigator.userAgent);
}
function oa(e) {
  if (e) {
    let t = e.nodeName, n = e.parentElement && e.parentElement.nodeName;
    return t === "INPUT" || t === "TEXTAREA" || t === "BUTTON" || t === "A" || n === "INPUT" || n === "TEXTAREA" || n === "BUTTON" || n === "A" || !!e.closest(".p-button, .p-checkbox, .p-radiobutton");
  }
  return !1;
}
function On() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function ia(e, t = "") {
  return se(e) ? e.matches(`button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [href][clientHeight][clientWidth]:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t}`) : !1;
}
function sa(e) {
  return !!(e && e.offsetParent != null);
}
function aa() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}
function Oo(e, t = "", n) {
  se(e) && n !== null && n !== void 0 && e.setAttribute(t, n);
}
var Le = {};
function xo(e = "pui_id_") {
  return Object.hasOwn(Le, e) || (Le[e] = 0), Le[e]++, `${e}${Le[e]}`;
}
function ko() {
  let e = [], t = (a, l, s = 999) => {
    let u = o(a, l, s), d = u.value + (u.key === a ? 0 : s) + 1;
    return e.push({ key: a, value: d }), d;
  }, n = (a) => {
    e = e.filter((l) => l.value !== a);
  }, r = (a, l) => o(a).value, o = (a, l, s = 0) => [...e].reverse().find((u) => !0) || { key: a, value: s }, i = (a) => a && parseInt(a.style.zIndex, 10) || 0;
  return { get: i, set: (a, l, s) => {
    l && (l.style.zIndex = String(t(a, !0, s)));
  }, clear: (a) => {
    a && (n(i(a)), a.style.zIndex = "");
  }, getCurrent: (a) => r(a) };
}
var la = ko(), Eo = Object.defineProperty, Ao = Object.defineProperties, Lo = Object.getOwnPropertyDescriptors, Be = Object.getOwnPropertySymbols, xn = Object.prototype.hasOwnProperty, kn = Object.prototype.propertyIsEnumerable, Ot = (e, t, n) => t in e ? Eo(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, V = (e, t) => {
  for (var n in t || (t = {})) xn.call(t, n) && Ot(e, n, t[n]);
  if (Be) for (var n of Be(t)) kn.call(t, n) && Ot(e, n, t[n]);
  return e;
}, Ke = (e, t) => Ao(e, Lo(t)), H = (e, t) => {
  var n = {};
  for (var r in e) xn.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
  if (e != null && Be) for (var r of Be(e)) t.indexOf(r) < 0 && kn.call(e, r) && (n[r] = e[r]);
  return n;
}, jo = dt(), A = jo, be = /{([^}]*)}/g, En = /(\d+\s+[\+\-\*\/]\s+\d+)/g, An = /var\([^)]+\)/g;
function xt(e) {
  return j(e) ? e.replace(/[A-Z]/g, (t, n) => n === 0 ? t : "." + t.toLowerCase()).toLowerCase() : e;
}
function No(e) {
  return B(e) && e.hasOwnProperty("$value") && e.hasOwnProperty("$type") ? e.$value : e;
}
function Io(e) {
  return e.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function et(e = "", t = "") {
  return Io(`${j(e, !1) && j(t, !1) ? `${e}-` : e}${t}`);
}
function Ln(e = "", t = "") {
  return `--${et(e, t)}`;
}
function Ro(e = "") {
  let t = (e.match(/{/g) || []).length, n = (e.match(/}/g) || []).length;
  return (t + n) % 2 !== 0;
}
function jn(e, t = "", n = "", r = [], o) {
  if (j(e)) {
    let i = e.trim();
    if (Ro(i)) return;
    if (oe(i, be)) {
      let a = i.replaceAll(be, (l) => {
        let s = l.replace(/{|}/g, "").split(".").filter((u) => !r.some((d) => oe(u, d)));
        return `var(${Ln(n, Sn(s.join("-")))}${P(o) ? `, ${o}` : ""})`;
      });
      return oe(a.replace(An, "0"), En) ? `calc(${a})` : a;
    }
    return i;
  } else if (lo(e)) return e;
}
function Vo(e, t, n) {
  j(t, !1) && e.push(`${t}:${n};`);
}
function de(e, t) {
  return e ? `${e}{${t}}` : "";
}
function Nn(e, t) {
  if (e.indexOf("dt(") === -1) return e;
  function n(a, l) {
    let s = [], u = 0, d = "", c = null, m = 0;
    for (; u <= a.length; ) {
      let f = a[u];
      if ((f === '"' || f === "'" || f === "`") && a[u - 1] !== "\\" && (c = c === f ? null : f), !c && (f === "(" && m++, f === ")" && m--, (f === "," || u === a.length) && m === 0)) {
        let p = d.trim();
        p.startsWith("dt(") ? s.push(Nn(p, l)) : s.push(r(p)), d = "", u++;
        continue;
      }
      f !== void 0 && (d += f), u++;
    }
    return s;
  }
  function r(a) {
    let l = a[0];
    if ((l === '"' || l === "'" || l === "`") && a[a.length - 1] === l) return a.slice(1, -1);
    let s = Number(a);
    return isNaN(s) ? a : s;
  }
  let o = [], i = [];
  for (let a = 0; a < e.length; a++) if (e[a] === "d" && e.slice(a, a + 3) === "dt(") i.push(a), a += 2;
  else if (e[a] === ")" && i.length > 0) {
    let l = i.pop();
    i.length === 0 && o.push([l, a]);
  }
  if (!o.length) return e;
  for (let a = o.length - 1; a >= 0; a--) {
    let [l, s] = o[a], u = e.slice(l + 3, s), d = n(u, t), c = t(...d);
    e = e.slice(0, l) + c + e.slice(s + 1);
  }
  return e;
}
var ua = (e) => {
  var t;
  let n = C.getTheme(), r = tt(n, e, void 0, "variable"), o = (t = r?.match(/--[\w-]+/g)) == null ? void 0 : t[0], i = tt(n, e, void 0, "value");
  return { name: o, variable: r, value: i };
}, ie = (...e) => tt(C.getTheme(), ...e), tt = (e = {}, t, n, r) => {
  if (t) {
    let { variable: o, options: i } = C.defaults || {}, { prefix: a, transform: l } = e?.options || i || {}, s = oe(t, be) ? t : `{${t}}`;
    return r === "value" || z(r) && l === "strict" ? C.getTokenValue(t) : jn(s, void 0, a, [o.excludedKeyRegex], n);
  }
  return "";
};
function je(e, ...t) {
  if (e instanceof Array) {
    let n = e.reduce((r, o, i) => {
      var a;
      return r + o + ((a = N(t[i], { dt: ie })) != null ? a : "");
    }, "");
    return Nn(n, ie);
  }
  return N(e, { dt: ie });
}
function Do(e, t = {}) {
  let n = C.defaults.variable, { prefix: r = n.prefix, selector: o = n.selector, excludedKeyRegex: i = n.excludedKeyRegex } = t, a = [], l = [], s = [{ node: e, path: r }];
  for (; s.length; ) {
    let { node: d, path: c } = s.pop();
    for (let m in d) {
      let f = d[m], p = No(f), v = oe(m, i) ? et(c) : et(c, Sn(m));
      if (B(p)) s.push({ node: p, path: v });
      else {
        let g = Ln(v), y = jn(p, v, r, [i]);
        Vo(l, g, y);
        let _ = v;
        r && _.startsWith(r + "-") && (_ = _.slice(r.length + 1)), a.push(_.replace(/-/g, "."));
      }
    }
  }
  let u = l.join("");
  return { value: l, tokens: a, declarations: u, css: de(o, u) };
}
var R = { regex: { rules: { class: { pattern: /^\.([a-zA-Z][\w-]*)$/, resolve(e) {
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
  return Do(e, { prefix: t?.prefix });
}, getCommon({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var i, a, l, s, u, d, c;
  let { preset: m, options: f } = t, p, v, g, y, _, $, h;
  if (P(m) && f.transform !== "strict") {
    let { primitive: b, semantic: k, extend: E } = m, K = k || {}, { colorScheme: Y } = K, Z = H(K, ["colorScheme"]), q = E || {}, { colorScheme: X } = q, ee = H(q, ["colorScheme"]), G = Y || {}, { dark: te } = G, ae = H(G, ["dark"]), ne = X || {}, { dark: le } = ne, ue = H(ne, ["dark"]), U = P(b) ? this._toVariables({ primitive: b }, f) : {}, D = P(Z) ? this._toVariables({ semantic: Z }, f) : {}, re = P(ae) ? this._toVariables({ light: ae }, f) : {}, ke = P(te) ? this._toVariables({ dark: te }, f) : {}, ce = P(ee) ? this._toVariables({ semantic: ee }, f) : {}, ht = P(ue) ? this._toVariables({ light: ue }, f) : {}, gt = P(le) ? this._toVariables({ dark: le }, f) : {}, [Hn, Fn] = [(i = U.declarations) != null ? i : "", U.tokens], [zn, Kn] = [(a = D.declarations) != null ? a : "", D.tokens || []], [Yn, qn] = [(l = re.declarations) != null ? l : "", re.tokens || []], [Gn, Jn] = [(s = ke.declarations) != null ? s : "", ke.tokens || []], [Qn, Zn] = [(u = ce.declarations) != null ? u : "", ce.tokens || []], [Xn, er] = [(d = ht.declarations) != null ? d : "", ht.tokens || []], [tr, nr] = [(c = gt.declarations) != null ? c : "", gt.tokens || []];
    p = this.transformCSS(e, Hn, "light", "variable", f, r, o), v = Fn;
    let rr = this.transformCSS(e, `${zn}${Yn}`, "light", "variable", f, r, o), or = this.transformCSS(e, `${Gn}`, "dark", "variable", f, r, o);
    g = `${rr}${or}`, y = [.../* @__PURE__ */ new Set([...Kn, ...qn, ...Jn])];
    let ir = this.transformCSS(e, `${Qn}${Xn}color-scheme:light`, "light", "variable", f, r, o), sr = this.transformCSS(e, `${tr}color-scheme:dark`, "dark", "variable", f, r, o);
    _ = `${ir}${sr}`, $ = [.../* @__PURE__ */ new Set([...Zn, ...er, ...nr])], h = N(m.css, { dt: ie });
  }
  return { primitive: { css: p, tokens: v }, semantic: { css: g, tokens: y }, global: { css: _, tokens: $ }, style: h };
}, getPreset({ name: e = "", preset: t = {}, options: n, params: r, set: o, defaults: i, selector: a }) {
  var l, s, u;
  let d, c, m;
  if (P(t) && n.transform !== "strict") {
    let f = e.replace("-directive", ""), p = t, { colorScheme: v, extend: g, css: y } = p, _ = H(p, ["colorScheme", "extend", "css"]), $ = g || {}, { colorScheme: h } = $, b = H($, ["colorScheme"]), k = v || {}, { dark: E } = k, K = H(k, ["dark"]), Y = h || {}, { dark: Z } = Y, q = H(Y, ["dark"]), X = P(_) ? this._toVariables({ [f]: V(V({}, _), b) }, n) : {}, ee = P(K) ? this._toVariables({ [f]: V(V({}, K), q) }, n) : {}, G = P(E) ? this._toVariables({ [f]: V(V({}, E), Z) }, n) : {}, [te, ae] = [(l = X.declarations) != null ? l : "", X.tokens || []], [ne, le] = [(s = ee.declarations) != null ? s : "", ee.tokens || []], [ue, U] = [(u = G.declarations) != null ? u : "", G.tokens || []], D = this.transformCSS(f, `${te}${ne}`, "light", "variable", n, o, i, a), re = this.transformCSS(f, ue, "dark", "variable", n, o, i, a);
    d = `${D}${re}`, c = [.../* @__PURE__ */ new Set([...ae, ...le, ...U])], m = N(y, { dt: ie });
  }
  return { css: d, tokens: c, style: m };
}, getPresetC({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var i;
  let { preset: a, options: l } = t, s = (i = a?.components) == null ? void 0 : i[e];
  return this.getPreset({ name: e, preset: s, options: l, params: n, set: r, defaults: o });
}, getPresetD({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var i, a;
  let l = e.replace("-directive", ""), { preset: s, options: u } = t, d = ((i = s?.components) == null ? void 0 : i[l]) || ((a = s?.directives) == null ? void 0 : a[l]);
  return this.getPreset({ name: l, preset: d, options: u, params: n, set: r, defaults: o });
}, applyDarkColorScheme(e) {
  return !(e.darkModeSelector === "none" || e.darkModeSelector === !1);
}, getColorSchemeOption(e, t) {
  var n;
  return this.applyDarkColorScheme(e) ? this.regex.resolve(e.darkModeSelector === !0 ? t.options.darkModeSelector : (n = e.darkModeSelector) != null ? n : t.options.darkModeSelector) : [];
}, getLayerOrder(e, t = {}, n, r) {
  let { cssLayer: o } = t;
  return o ? `@layer ${N(o.order || o.name || "primeui", n)}` : "";
}, getCommonStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: o, defaults: i }) {
  let a = this.getCommon({ name: e, theme: t, params: n, set: o, defaults: i }), l = Object.entries(r).reduce((s, [u, d]) => s.push(`${u}="${d}"`) && s, []).join(" ");
  return Object.entries(a || {}).reduce((s, [u, d]) => {
    if (B(d) && Object.hasOwn(d, "css")) {
      let c = ve(d.css), m = `${u}-variables`;
      s.push(`<style type="text/css" data-primevue-style-id="${m}" ${l}>${c}</style>`);
    }
    return s;
  }, []).join("");
}, getStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: o, defaults: i }) {
  var a;
  let l = { name: e, theme: t, params: n, set: o, defaults: i }, s = (a = e.includes("-directive") ? this.getPresetD(l) : this.getPresetC(l)) == null ? void 0 : a.css, u = Object.entries(r).reduce((d, [c, m]) => d.push(`${c}="${m}"`) && d, []).join(" ");
  return s ? `<style type="text/css" data-primevue-style-id="${e}-variables" ${u}>${ve(s)}</style>` : "";
}, createTokens(e = {}, t, n = "", r = "", o = {}) {
  let i = function(l, s = {}, u = []) {
    if (u.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: l, path: this.path, paths: s, value: void 0 };
    u.push(this.path), s.name = this.path, s.binding || (s.binding = {});
    let d = this.value;
    if (typeof this.value == "string" && be.test(this.value)) {
      let c = this.value.trim().replace(be, (m) => {
        var f;
        let p = m.slice(1, -1), v = this.tokens[p];
        if (!v) return console.warn(`Token not found for path: ${p}`), "__UNRESOLVED__";
        let g = v.computed(l, s, u);
        return Array.isArray(g) && g.length === 2 ? `light-dark(${g[0].value},${g[1].value})` : (f = g?.value) != null ? f : "__UNRESOLVED__";
      });
      d = En.test(c.replace(An, "0")) ? `calc(${c})` : c;
    }
    return z(s.binding) && delete s.binding, u.pop(), { colorScheme: l, path: this.path, paths: s, value: d.includes("__UNRESOLVED__") ? void 0 : d };
  }, a = (l, s, u) => {
    Object.entries(l).forEach(([d, c]) => {
      let m = oe(d, t.variable.excludedKeyRegex) ? s : s ? `${s}.${xt(d)}` : xt(d), f = u ? `${u}.${d}` : d;
      B(c) ? a(c, m, f) : (o[m] || (o[m] = { paths: [], computed: (p, v = {}, g = []) => {
        if (o[m].paths.length === 1) return o[m].paths[0].computed(o[m].paths[0].scheme, v.binding, g);
        if (p && p !== "none") for (let y = 0; y < o[m].paths.length; y++) {
          let _ = o[m].paths[y];
          if (_.scheme === p) return _.computed(p, v.binding, g);
        }
        return o[m].paths.map((y) => y.computed(y.scheme, v[y.scheme], g));
      } }), o[m].paths.push({ path: f, value: c, scheme: f.includes("colorScheme.light") ? "light" : f.includes("colorScheme.dark") ? "dark" : "none", computed: i, tokens: o }));
    });
  };
  return a(e, n, r), o;
}, getTokenValue(e, t, n) {
  var r;
  let o = ((l) => l.split(".").filter((s) => !oe(s.toLowerCase(), n.variable.excludedKeyRegex)).join("."))(t), i = t.includes("colorScheme.light") ? "light" : t.includes("colorScheme.dark") ? "dark" : void 0, a = [(r = e[o]) == null ? void 0 : r.computed(i)].flat().filter((l) => l);
  return a.length === 1 ? a[0].value : a.reduce((l = {}, s) => {
    let u = s, { colorScheme: d } = u, c = H(u, ["colorScheme"]);
    return l[d] = c, l;
  }, void 0);
}, getSelectorRule(e, t, n, r) {
  return n === "class" || n === "attr" ? de(P(t) ? `${e}${t},${e} ${t}` : e, r) : de(e, de(t ?? ":root,:host", r));
}, transformCSS(e, t, n, r, o = {}, i, a, l) {
  if (P(t)) {
    let { cssLayer: s } = o;
    if (r !== "style") {
      let u = this.getColorSchemeOption(o, a);
      t = n === "dark" ? u.reduce((d, { type: c, selector: m }) => (P(m) && (d += m.includes("[CSS]") ? m.replace("[CSS]", t) : this.getSelectorRule(m, l, c, t)), d), "") : de(l ?? ":root,:host", t);
    }
    if (s) {
      let u = { name: "primeui" };
      B(s) && (u.name = N(s.name, { name: e, type: r })), P(u.name) && (t = de(`@layer ${u.name}`, t), i?.layerNames(u.name));
    }
    return t;
  }
  return "";
} }, C = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(e = {}) {
  let { theme: t } = e;
  t && (this._theme = Ke(V({}, t), { options: V(V({}, this.defaults.options), t.options) }), this._tokens = R.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
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
  this.update({ theme: e }), A.emit("theme:change", e);
}, getPreset() {
  return this.preset;
}, setPreset(e) {
  this._theme = Ke(V({}, this.theme), { preset: e }), this._tokens = R.createTokens(e, this.defaults), this.clearLoadedStyleNames(), A.emit("preset:change", e), A.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(e) {
  this._theme = Ke(V({}, this.theme), { options: e }), this.clearLoadedStyleNames(), A.emit("options:change", e), A.emit("theme:change", this.theme);
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
  return R.getTokenValue(this.tokens, e, this.defaults);
}, getCommon(e = "", t) {
  return R.getCommon({ name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getComponent(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return R.getPresetC(n);
}, getDirective(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return R.getPresetD(n);
}, getCustomPreset(e = "", t, n, r) {
  let o = { name: e, preset: t, options: this.options, selector: n, params: r, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return R.getPreset(o);
}, getLayerOrderCSS(e = "") {
  return R.getLayerOrder(e, this.options, { names: this.getLayerNames() }, this.defaults);
}, transformCSS(e = "", t, n = "style", r) {
  return R.transformCSS(e, t, r, n, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
}, getCommonStyleSheet(e = "", t, n = {}) {
  return R.getCommonStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getStyleSheet(e, t, n = {}) {
  return R.getStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, onStyleMounted(e) {
  this._loadingStyles.add(e);
}, onStyleUpdated(e) {
  this._loadingStyles.add(e);
}, onStyleLoaded(e, { name: t }) {
  this._loadingStyles.size && (this._loadingStyles.delete(t), A.emit(`theme:${t}:load`, e), !this._loadingStyles.size && A.emit("theme:load"));
} }, L = {
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
}, ca = {
  AND: "and",
  OR: "or"
};
function kt(e, t) {
  var n = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (!n) {
    if (Array.isArray(e) || (n = Mo(e)) || t) {
      n && (e = n);
      var r = 0, o = function() {
      };
      return { s: o, n: function() {
        return r >= e.length ? { done: !0 } : { done: !1, value: e[r++] };
      }, e: function(u) {
        throw u;
      }, f: o };
    }
    throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }
  var i, a = !0, l = !1;
  return { s: function() {
    n = n.call(e);
  }, n: function() {
    var u = n.next();
    return a = u.done, u;
  }, e: function(u) {
    l = !0, i = u;
  }, f: function() {
    try {
      a || n.return == null || n.return();
    } finally {
      if (l) throw i;
    }
  } };
}
function Mo(e, t) {
  if (e) {
    if (typeof e == "string") return Et(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Et(e, t) : void 0;
  }
}
function Et(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
var da = {
  filter: function(t, n, r, o, i) {
    var a = [];
    if (!t)
      return a;
    var l = kt(t), s;
    try {
      for (l.s(); !(s = l.n()).done; ) {
        var u = s.value;
        if (typeof u == "string") {
          if (this.filters[o](u, r, i)) {
            a.push(u);
            continue;
          }
        } else {
          var d = kt(n), c;
          try {
            for (d.s(); !(c = d.n()).done; ) {
              var m = c.value, f = Je(u, m);
              if (this.filters[o](f, r, i)) {
                a.push(u);
                break;
              }
            }
          } catch (p) {
            d.e(p);
          } finally {
            d.f();
          }
        }
      }
    } catch (p) {
      l.e(p);
    } finally {
      l.f();
    }
    return a;
  },
  filters: {
    startsWith: function(t, n, r) {
      if (n == null || n === "")
        return !0;
      if (t == null)
        return !1;
      var o = I(n.toString()).toLocaleLowerCase(r), i = I(t.toString()).toLocaleLowerCase(r);
      return i.slice(0, o.length) === o;
    },
    contains: function(t, n, r) {
      if (n == null || n === "")
        return !0;
      if (t == null)
        return !1;
      var o = I(n.toString()).toLocaleLowerCase(r), i = I(t.toString()).toLocaleLowerCase(r);
      return i.indexOf(o) !== -1;
    },
    notContains: function(t, n, r) {
      if (n == null || n === "")
        return !0;
      if (t == null)
        return !1;
      var o = I(n.toString()).toLocaleLowerCase(r), i = I(t.toString()).toLocaleLowerCase(r);
      return i.indexOf(o) === -1;
    },
    endsWith: function(t, n, r) {
      if (n == null || n === "")
        return !0;
      if (t == null)
        return !1;
      var o = I(n.toString()).toLocaleLowerCase(r), i = I(t.toString()).toLocaleLowerCase(r);
      return i.indexOf(o, i.length - o.length) !== -1;
    },
    equals: function(t, n, r) {
      return n == null || n === "" ? !0 : t == null ? !1 : t.getTime && n.getTime ? t.getTime() === n.getTime() : I(t.toString()).toLocaleLowerCase(r) == I(n.toString()).toLocaleLowerCase(r);
    },
    notEquals: function(t, n, r) {
      return n == null || n === "" ? !1 : t == null ? !0 : t.getTime && n.getTime ? t.getTime() !== n.getTime() : I(t.toString()).toLocaleLowerCase(r) != I(n.toString()).toLocaleLowerCase(r);
    },
    in: function(t, n) {
      if (n == null || n.length === 0)
        return !0;
      for (var r = 0; r < n.length; r++)
        if (yn(t, n[r]))
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
}, Bo = `
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
function _e(e) {
  "@babel/helpers - typeof";
  return _e = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, _e(e);
}
function At(e, t) {
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
    t % 2 ? At(Object(n), !0).forEach(function(r) {
      Uo(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : At(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Uo(e, t, n) {
  return (t = Wo(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Wo(e) {
  var t = Ho(e, "string");
  return _e(t) == "symbol" ? t : t + "";
}
function Ho(e, t) {
  if (_e(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (_e(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function Fo(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  vt() && vt().components ? rn(e) : t ? e() : fr(e);
}
var zo = 0;
function Ko(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = F(!1), r = F(e), o = F(null), i = On() ? window.document : void 0, a = t.document, l = a === void 0 ? i : a, s = t.immediate, u = s === void 0 ? !0 : s, d = t.manual, c = d === void 0 ? !1 : d, m = t.name, f = m === void 0 ? "style_".concat(++zo) : m, p = t.id, v = p === void 0 ? void 0 : p, g = t.media, y = g === void 0 ? void 0 : g, _ = t.nonce, $ = _ === void 0 ? void 0 : _, h = t.first, b = h === void 0 ? !1 : h, k = t.onMounted, E = k === void 0 ? void 0 : k, K = t.onUpdated, Y = K === void 0 ? void 0 : K, Z = t.onLoad, q = Z === void 0 ? void 0 : Z, X = t.props, ee = X === void 0 ? {} : X, G = function() {
  }, te = function(le) {
    var ue = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (l) {
      var U = Lt(Lt({}, ee), ue), D = U.name || f, re = U.id || v, ke = U.nonce || $;
      o.value = l.querySelector('style[data-primevue-style-id="'.concat(D, '"]')) || l.getElementById(re) || l.createElement("style"), o.value.isConnected || (r.value = le || e, Me(o.value, {
        type: "text/css",
        id: re,
        media: y,
        nonce: ke
      }), b ? l.head.prepend(o.value) : l.head.appendChild(o.value), Oo(o.value, "data-primevue-style-id", D), Me(o.value, U), o.value.onload = function(ce) {
        return q?.(ce, {
          name: D
        });
      }, E?.(D)), !n.value && (G = me(r, function(ce) {
        o.value.textContent = ce, Y?.(D);
      }, {
        immediate: !0
      }), n.value = !0);
    }
  }, ae = function() {
    !l || !n.value || (G(), _o(o.value) && l.head.removeChild(o.value), n.value = !1, o.value = null);
  };
  return u && !c && Fo(te), {
    id: v,
    name: f,
    el: o,
    css: r,
    unload: ae,
    load: te,
    isLoaded: mr(n)
  };
}
function Se(e) {
  "@babel/helpers - typeof";
  return Se = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Se(e);
}
var jt, Nt, It, Rt;
function Vt(e, t) {
  return Jo(e) || Go(e, t) || qo(e, t) || Yo();
}
function Yo() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function qo(e, t) {
  if (e) {
    if (typeof e == "string") return Dt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Dt(e, t) : void 0;
  }
}
function Dt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Go(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, o, i, a, l = [], s = !0, u = !1;
    try {
      if (i = (n = n.call(e)).next, t !== 0) for (; !(s = (r = i.call(n)).done) && (l.push(r.value), l.length !== t); s = !0) ;
    } catch (d) {
      u = !0, o = d;
    } finally {
      try {
        if (!s && n.return != null && (a = n.return(), Object(a) !== a)) return;
      } finally {
        if (u) throw o;
      }
    }
    return l;
  }
}
function Jo(e) {
  if (Array.isArray(e)) return e;
}
function Mt(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Ye(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Mt(Object(n), !0).forEach(function(r) {
      Qo(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Mt(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Qo(e, t, n) {
  return (t = Zo(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Zo(e) {
  var t = Xo(e, "string");
  return Se(t) == "symbol" ? t : t + "";
}
function Xo(e, t) {
  if (Se(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Se(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function Ne(e, t) {
  return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var ei = function(t) {
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
}, ti = {}, ni = {}, x = {
  name: "base",
  css: ei,
  style: Bo,
  classes: ti,
  inlineStyles: ni,
  load: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(i) {
      return i;
    }, o = r(je(jt || (jt = Ne(["", ""])), t));
    return P(o) ? Ko(ve(o), Ye({
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
      return C.transformCSS(n.name || t.name, "".concat(o).concat(je(Nt || (Nt = Ne(["", ""])), r)));
    });
  },
  getCommonTheme: function(t) {
    return C.getCommon(this.name, t);
  },
  getComponentTheme: function(t) {
    return C.getComponent(this.name, t);
  },
  getDirectiveTheme: function(t) {
    return C.getDirective(this.name, t);
  },
  getPresetTheme: function(t, n, r) {
    return C.getCustomPreset(this.name, t, n, r);
  },
  getLayerOrderThemeCSS: function() {
    return C.getLayerOrderCSS(this.name);
  },
  getStyleSheet: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.css) {
      var r = N(this.css, {
        dt: ie
      }) || "", o = ve(je(It || (It = Ne(["", "", ""])), r, t)), i = Object.entries(n).reduce(function(a, l) {
        var s = Vt(l, 2), u = s[0], d = s[1];
        return a.push("".concat(u, '="').concat(d, '"')) && a;
      }, []).join(" ");
      return P(o) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(i, ">").concat(o, "</style>") : "";
    }
    return "";
  },
  getCommonThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return C.getCommonStyleSheet(this.name, t, n);
  },
  getThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = [C.getStyleSheet(this.name, t, n)];
    if (this.style) {
      var o = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), i = je(Rt || (Rt = Ne(["", ""])), N(this.style, {
        dt: ie
      })), a = ve(C.transformCSS(o, i)), l = Object.entries(n).reduce(function(s, u) {
        var d = Vt(u, 2), c = d[0], m = d[1];
        return s.push("".concat(c, '="').concat(m, '"')) && s;
      }, []).join(" ");
      P(a) && r.push('<style type="text/css" data-primevue-style-id="'.concat(o, '" ').concat(l, ">").concat(a, "</style>"));
    }
    return r.join("");
  },
  extend: function(t) {
    return Ye(Ye({}, this), {}, {
      css: void 0,
      style: void 0
    }, t);
  }
}, Q = dt();
function $e(e) {
  "@babel/helpers - typeof";
  return $e = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, $e(e);
}
function Bt(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Ie(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Bt(Object(n), !0).forEach(function(r) {
      ri(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Bt(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function ri(e, t, n) {
  return (t = oi(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function oi(e) {
  var t = ii(e, "string");
  return $e(t) == "symbol" ? t : t + "";
}
function ii(e, t) {
  if ($e(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if ($e(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var si = {
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
    text: [L.STARTS_WITH, L.CONTAINS, L.NOT_CONTAINS, L.ENDS_WITH, L.EQUALS, L.NOT_EQUALS],
    numeric: [L.EQUALS, L.NOT_EQUALS, L.LESS_THAN, L.LESS_THAN_OR_EQUAL_TO, L.GREATER_THAN, L.GREATER_THAN_OR_EQUAL_TO],
    date: [L.DATE_IS, L.DATE_IS_NOT, L.DATE_BEFORE, L.DATE_AFTER]
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
}, ai = Symbol();
function li(e, t) {
  var n = {
    config: pr(t)
  };
  return e.config.globalProperties.$primevue = n, e.provide(ai, n), ui(), ci(e, n), n;
}
var fe = [];
function ui() {
  A.clear(), fe.forEach(function(e) {
    return e?.();
  }), fe = [];
}
function ci(e, t) {
  var n = F(!1), r = function() {
    var u;
    if (((u = t.config) === null || u === void 0 ? void 0 : u.theme) !== "none" && !C.isStyleNameLoaded("common")) {
      var d, c, m = ((d = x.getCommonTheme) === null || d === void 0 ? void 0 : d.call(x)) || {}, f = m.primitive, p = m.semantic, v = m.global, g = m.style, y = {
        nonce: (c = t.config) === null || c === void 0 || (c = c.csp) === null || c === void 0 ? void 0 : c.nonce
      };
      x.load(f?.css, Ie({
        name: "primitive-variables"
      }, y)), x.load(p?.css, Ie({
        name: "semantic-variables"
      }, y)), x.load(v?.css, Ie({
        name: "global-variables"
      }, y)), x.loadStyle(Ie({
        name: "global-style"
      }, y), g), C.setLoadedStyleName("common");
    }
  };
  A.on("theme:change", function(s) {
    n.value || (e.config.globalProperties.$primevue.config.theme = s, n.value = !0);
  });
  var o = me(t.config, function(s, u) {
    Q.emit("config:change", {
      newValue: s,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), i = me(function() {
    return t.config.ripple;
  }, function(s, u) {
    Q.emit("config:ripple:change", {
      newValue: s,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), a = me(function() {
    return t.config.theme;
  }, function(s, u) {
    n.value || C.setTheme(s), t.config.unstyled || r(), n.value = !1, Q.emit("config:theme:change", {
      newValue: s,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !1
  }), l = me(function() {
    return t.config.unstyled;
  }, function(s, u) {
    !s && t.config.theme && r(), Q.emit("config:unstyled:change", {
      newValue: s,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  });
  fe.push(o), fe.push(i), fe.push(a), fe.push(l);
}
var di = {
  install: function(t, n) {
    var r = uo(si, n);
    li(t, r);
  }
}, In = {
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
    this.mounted = On();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function mi(e, t, n, r, o, i) {
  return i.inline ? De(e.$slots, "default", {
    key: 0
  }) : o.mounted ? (on(), hr(sn, {
    key: 1,
    to: n.appendTo
  }, [De(e.$slots, "default")], 8, ["to"])) : an("", !0);
}
In.render = mi;
var J = {
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
function fi() {
  var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pc", t = gr();
  return "".concat(e).concat(t.replace("v-", "").replaceAll("-", "_"));
}
var Ut = x.extend({
  name: "common"
});
function we(e) {
  "@babel/helpers - typeof";
  return we = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, we(e);
}
function pi(e) {
  return Dn(e) || hi(e) || Vn(e) || Rn();
}
function hi(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function pe(e, t) {
  return Dn(e) || gi(e, t) || Vn(e, t) || Rn();
}
function Rn() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Vn(e, t) {
  if (e) {
    if (typeof e == "string") return nt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? nt(e, t) : void 0;
  }
}
function nt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function gi(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, o, i, a, l = [], s = !0, u = !1;
    try {
      if (i = (n = n.call(e)).next, t === 0) {
        if (Object(n) !== n) return;
        s = !1;
      } else for (; !(s = (r = i.call(n)).done) && (l.push(r.value), l.length !== t); s = !0) ;
    } catch (d) {
      u = !0, o = d;
    } finally {
      try {
        if (!s && n.return != null && (a = n.return(), Object(a) !== a)) return;
      } finally {
        if (u) throw o;
      }
    }
    return l;
  }
}
function Dn(e) {
  if (Array.isArray(e)) return e;
}
function Wt(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function w(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Wt(Object(n), !0).forEach(function(r) {
      he(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Wt(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function he(e, t, n) {
  return (t = vi(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function vi(e) {
  var t = yi(e, "string");
  return we(t) == "symbol" ? t : t + "";
}
function yi(e, t) {
  if (we(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (we(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var bi = {
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
        A.off("theme:change", this._loadCoreStyles), t || (this._loadCoreStyles(), this._themeChangeListener(this._loadCoreStyles));
      }
    },
    dt: {
      immediate: !0,
      handler: function(t, n) {
        var r = this;
        A.off("theme:change", this._themeScopedListener), t ? (this._loadScopedThemeStyles(t), this._themeScopedListener = function() {
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
    var t, n, r, o, i, a, l, s, u, d, c, m = (t = this.pt) === null || t === void 0 ? void 0 : t._usept, f = m ? (n = this.pt) === null || n === void 0 || (n = n.originalValue) === null || n === void 0 ? void 0 : n[this.$.type.name] : void 0, p = m ? (r = this.pt) === null || r === void 0 || (r = r.value) === null || r === void 0 ? void 0 : r[this.$.type.name] : this.pt;
    (o = p || f) === null || o === void 0 || (o = o.hooks) === null || o === void 0 || (i = o.onBeforeCreate) === null || i === void 0 || i.call(o);
    var v = (a = this.$primevueConfig) === null || a === void 0 || (a = a.pt) === null || a === void 0 ? void 0 : a._usept, g = v ? (l = this.$primevue) === null || l === void 0 || (l = l.config) === null || l === void 0 || (l = l.pt) === null || l === void 0 ? void 0 : l.originalValue : void 0, y = v ? (s = this.$primevue) === null || s === void 0 || (s = s.config) === null || s === void 0 || (s = s.pt) === null || s === void 0 ? void 0 : s.value : (u = this.$primevue) === null || u === void 0 || (u = u.config) === null || u === void 0 ? void 0 : u.pt;
    (d = y || g) === null || d === void 0 || (d = d[this.$.type.name]) === null || d === void 0 || (d = d.hooks) === null || d === void 0 || (c = d.onBeforeCreate) === null || c === void 0 || c.call(d), this.$attrSelector = fi(), this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
  },
  created: function() {
    this._hook("onCreated");
  },
  beforeMount: function() {
    var t;
    this.rootEl = Tn(se(this.$el) ? this.$el : (t = this.$el) === null || t === void 0 ? void 0 : t.parentElement, "[".concat(this.$attrSelector, "]")), this.rootEl && (this.rootEl.$pc = w({
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
      return Fe(t) ? t.apply(void 0, r) : ge.apply(void 0, r);
    },
    _load: function() {
      J.isStyleNameLoaded("base") || (x.loadCSS(this.$styleOptions), this._loadGlobalStyles(), J.setLoadedStyleName("base")), this._loadThemeStyles();
    },
    _loadStyles: function() {
      this._load(), this._themeChangeListener(this._load);
    },
    _loadCoreStyles: function() {
      var t, n;
      !J.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name && (Ut.loadCSS(this.$styleOptions), this.$options.style && this.$style.loadCSS(this.$styleOptions), J.setLoadedStyleName(this.$style.name));
    },
    _loadGlobalStyles: function() {
      var t = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
      P(t) && x.load(t, w({
        name: "global"
      }, this.$styleOptions));
    },
    _loadThemeStyles: function() {
      var t, n;
      if (!(this.isUnstyled || this.$theme === "none")) {
        if (!C.isStyleNameLoaded("common")) {
          var r, o, i = ((r = this.$style) === null || r === void 0 || (o = r.getCommonTheme) === null || o === void 0 ? void 0 : o.call(r)) || {}, a = i.primitive, l = i.semantic, s = i.global, u = i.style;
          x.load(a?.css, w({
            name: "primitive-variables"
          }, this.$styleOptions)), x.load(l?.css, w({
            name: "semantic-variables"
          }, this.$styleOptions)), x.load(s?.css, w({
            name: "global-variables"
          }, this.$styleOptions)), x.loadStyle(w({
            name: "global-style"
          }, this.$styleOptions), u), C.setLoadedStyleName("common");
        }
        if (!C.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name) {
          var d, c, m, f, p = ((d = this.$style) === null || d === void 0 || (c = d.getComponentTheme) === null || c === void 0 ? void 0 : c.call(d)) || {}, v = p.css, g = p.style;
          (m = this.$style) === null || m === void 0 || m.load(v, w({
            name: "".concat(this.$style.name, "-variables")
          }, this.$styleOptions)), (f = this.$style) === null || f === void 0 || f.loadStyle(w({
            name: "".concat(this.$style.name, "-style")
          }, this.$styleOptions), g), C.setLoadedStyleName(this.$style.name);
        }
        if (!C.isStyleNameLoaded("layer-order")) {
          var y, _, $ = (y = this.$style) === null || y === void 0 || (_ = y.getLayerOrderThemeCSS) === null || _ === void 0 ? void 0 : _.call(y);
          x.load($, w({
            name: "layer-order",
            first: !0
          }, this.$styleOptions)), C.setLoadedStyleName("layer-order");
        }
      }
    },
    _loadScopedThemeStyles: function(t) {
      var n, r, o, i = ((n = this.$style) === null || n === void 0 || (r = n.getPresetTheme) === null || r === void 0 ? void 0 : r.call(n, t, "[".concat(this.$attrSelector, "]"))) || {}, a = i.css, l = (o = this.$style) === null || o === void 0 ? void 0 : o.load(a, w({
        name: "".concat(this.$attrSelector, "-").concat(this.$style.name)
      }, this.$styleOptions));
      this.scopedStyleEl = l.el;
    },
    _unloadScopedThemeStyles: function() {
      var t;
      (t = this.scopedStyleEl) === null || t === void 0 || (t = t.value) === null || t === void 0 || t.remove();
    },
    _themeChangeListener: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
      };
      J.clearLoadedStyleNames(), A.on("theme:change", t);
    },
    _removeThemeListeners: function() {
      A.off("theme:change", this._loadCoreStyles), A.off("theme:change", this._load), A.off("theme:change", this._themeScopedListener);
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
      return ct(t, n, r);
    },
    _getPTValue: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, i = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, a = /./g.test(r) && !!o[r.split(".")[0]], l = this._getPropValue("ptOptions") || ((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.ptOptions) || {}, s = l.mergeSections, u = s === void 0 ? !0 : s, d = l.mergeProps, c = d === void 0 ? !1 : d, m = i ? a ? this._useGlobalPT(this._getPTClassValue, r, o) : this._useDefaultPT(this._getPTClassValue, r, o) : void 0, f = a ? void 0 : this._getPTSelf(n, this._getPTClassValue, r, w(w({}, o), {}, {
        global: m || {}
      })), p = this._getPTDatasets(r);
      return u || !u && f ? c ? this._mergeProps(c, m, f, p) : w(w(w({}, m), f), p) : w(w({}, f), p);
    },
    _getPTSelf: function() {
      for (var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), o = 1; o < n; o++)
        r[o - 1] = arguments[o];
      return ge(
        this._usePT.apply(this, [this._getPT(t, this.$name)].concat(r)),
        // Exp; <component :pt="{}"
        this._usePT.apply(this, [this.$_attrsPT].concat(r))
        // Exp; <component :pt:[passthrough_key]:[attribute]="{value}" or <component :pt:[passthrough_key]="() =>{value}"
      );
    },
    _getPTDatasets: function() {
      var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", o = "data-pc-", i = r === "root" && P((t = this.pt) === null || t === void 0 ? void 0 : t["data-pc-section"]);
      return r !== "transition" && w(w({}, r === "root" && w(w(he({}, "".concat(o, "name"), M(i ? (n = this.pt) === null || n === void 0 ? void 0 : n["data-pc-section"] : this.$.type.name)), i && he({}, "".concat(o, "extend"), M(this.$.type.name))), {}, he({}, "".concat(this.$attrSelector), ""))), {}, he({}, "".concat(o, "section"), M(r)));
    },
    _getPTClassValue: function() {
      var t = this._getOptionValue.apply(this, arguments);
      return j(t) || _n(t) ? {
        class: t
      } : t;
    },
    _getPT: function(t) {
      var n = this, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 ? arguments[2] : void 0, i = function(l) {
        var s, u = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, d = o ? o(l) : l, c = M(r), m = M(n.$name);
        return (s = u ? c !== m ? d?.[c] : void 0 : d?.[c]) !== null && s !== void 0 ? s : d;
      };
      return t != null && t.hasOwnProperty("_usept") ? {
        _usept: t._usept,
        originalValue: i(t.originalValue),
        value: i(t.value)
      } : i(t, !0);
    },
    _usePT: function(t, n, r, o) {
      var i = function(v) {
        return n(v, r, o);
      };
      if (t != null && t.hasOwnProperty("_usept")) {
        var a, l = t._usept || ((a = this.$primevueConfig) === null || a === void 0 ? void 0 : a.ptOptions) || {}, s = l.mergeSections, u = s === void 0 ? !0 : s, d = l.mergeProps, c = d === void 0 ? !1 : d, m = i(t.originalValue), f = i(t.value);
        return m === void 0 && f === void 0 ? void 0 : j(f) ? f : j(m) ? m : u || !u && f ? c ? this._mergeProps(c, m, f) : w(w({}, m), f) : f;
      }
      return i(t);
    },
    _useGlobalPT: function(t, n, r) {
      return this._usePT(this.globalPT, t, n, r);
    },
    _useDefaultPT: function(t, n, r) {
      return this._usePT(this.defaultPT, t, n, r);
    },
    ptm: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this._getPTValue(this.pt, t, w(w({}, this.$params), n));
    },
    ptmi: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = ge(this.$_attrsWithoutPT, this.ptm(n, r));
      return o?.hasOwnProperty("id") && ((t = o.id) !== null && t !== void 0 || (o.id = this.$id)), o;
    },
    ptmo: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return this._getPTValue(t, n, w({
        instance: this
      }, r), !1);
    },
    cx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this.isUnstyled ? void 0 : this._getOptionValue(this.$style.classes, t, w(w({}, this.$params), n));
    },
    sx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      if (n) {
        var o = this._getOptionValue(this.$style.inlineStyles, t, w(w({}, this.$params), r)), i = this._getOptionValue(Ut.inlineStyles, t, w(w({}, this.$params), r));
        return [i, o];
      }
    }
  },
  computed: {
    globalPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(r) {
        return N(r, {
          instance: n
        });
      });
    },
    defaultPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(r) {
        return n._getOptionValue(r, n.$name, w({}, n.$params)) || N(r, w({}, n.$params));
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
        var o = pe(r, 1), i = o[0];
        return n?.includes(i);
      }));
    },
    $theme: function() {
      var t;
      return (t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.theme;
    },
    $style: function() {
      return w(w({
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
        var n = pe(t, 1), r = n[0];
        return r?.startsWith("pt:");
      }).reduce(function(t, n) {
        var r = pe(n, 2), o = r[0], i = r[1], a = o.split(":"), l = pi(a), s = nt(l).slice(1);
        return s?.reduce(function(u, d, c, m) {
          return !u[d] && (u[d] = c === m.length - 1 ? i : {}), u[d];
        }, t), t;
      }, {});
    },
    $_attrsWithoutPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(t) {
        var n = pe(t, 1), r = n[0];
        return !(r != null && r.startsWith("pt:"));
      }).reduce(function(t, n) {
        var r = pe(n, 2), o = r[0], i = r[1];
        return t[o] = i, t;
      }, {});
    }
  }
}, _i = `
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
`, Si = {
  root: function(t) {
    var n = t.instance;
    return ["p-contextmenu p-component", {
      "p-contextmenu-mobile": n.queryMatches
    }];
  },
  rootList: "p-contextmenu-root-list",
  item: function(t) {
    var n = t.instance, r = t.processedItem;
    return ["p-contextmenu-item", {
      "p-contextmenu-item-active": n.isItemActive(r),
      "p-focus": n.isItemFocused(r),
      "p-disabled": n.isItemDisabled(r)
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
x.extend({
  name: "contextmenu",
  style: _i,
  classes: Si
});
var $i = `
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
`, wi = x.extend({
  name: "baseicon",
  css: $i
});
function Te(e) {
  "@babel/helpers - typeof";
  return Te = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Te(e);
}
function Ht(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Ft(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Ht(Object(n), !0).forEach(function(r) {
      Ti(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Ht(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Ti(e, t, n) {
  return (t = Ci(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ci(e) {
  var t = Pi(e, "string");
  return Te(t) == "symbol" ? t : t + "";
}
function Pi(e, t) {
  if (Te(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Te(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Oi = {
  name: "BaseIcon",
  extends: bi,
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
  style: wi,
  provide: function() {
    return {
      $pcIcon: this,
      $parentInstance: this
    };
  },
  methods: {
    pti: function() {
      var t = z(this.label);
      return Ft(Ft({}, !this.isUnstyled && {
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
}, xi = {
  name: "AngleRightIcon",
  extends: Oi
};
function ki(e) {
  return ji(e) || Li(e) || Ai(e) || Ei();
}
function Ei() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ai(e, t) {
  if (e) {
    if (typeof e == "string") return rt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? rt(e, t) : void 0;
  }
}
function Li(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function ji(e) {
  if (Array.isArray(e)) return rt(e);
}
function rt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Ni(e, t, n, r, o, i) {
  return on(), vr("svg", ge({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), ki(t[0] || (t[0] = [yr("path", {
    d: "M5.25 11.1728C5.14929 11.1694 5.05033 11.1455 4.9592 11.1025C4.86806 11.0595 4.78666 10.9984 4.72 10.9228C4.57955 10.7822 4.50066 10.5916 4.50066 10.3928C4.50066 10.1941 4.57955 10.0035 4.72 9.86283L7.72 6.86283L4.72 3.86283C4.66067 3.71882 4.64765 3.55991 4.68275 3.40816C4.71785 3.25642 4.79932 3.11936 4.91585 3.01602C5.03238 2.91268 5.17819 2.84819 5.33305 2.83149C5.4879 2.81479 5.64411 2.84671 5.78 2.92283L9.28 6.42283C9.42045 6.56346 9.49934 6.75408 9.49934 6.95283C9.49934 7.15158 9.42045 7.34221 9.28 7.48283L5.78 10.9228C5.71333 10.9984 5.63193 11.0595 5.5408 11.1025C5.44966 11.1455 5.35071 11.1694 5.25 11.1728Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
xi.render = Ni;
function Ce(e) {
  "@babel/helpers - typeof";
  return Ce = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ce(e);
}
function zt(e, t) {
  return Di(e) || Vi(e, t) || Ri(e, t) || Ii();
}
function Ii() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ri(e, t) {
  if (e) {
    if (typeof e == "string") return Kt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Kt(e, t) : void 0;
  }
}
function Kt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Vi(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, o, i, a, l = [], s = !0, u = !1;
    try {
      if (i = (n = n.call(e)).next, t !== 0) for (; !(s = (r = i.call(n)).done) && (l.push(r.value), l.length !== t); s = !0) ;
    } catch (d) {
      u = !0, o = d;
    } finally {
      try {
        if (!s && n.return != null && (a = n.return(), Object(a) !== a)) return;
      } finally {
        if (u) throw o;
      }
    }
    return l;
  }
}
function Di(e) {
  if (Array.isArray(e)) return e;
}
function Yt(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function T(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Yt(Object(n), !0).forEach(function(r) {
      ot(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Yt(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function ot(e, t, n) {
  return (t = Mi(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Mi(e) {
  var t = Bi(e, "string");
  return Ce(t) == "symbol" ? t : t + "";
}
function Bi(e, t) {
  if (Ce(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Ce(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var S = {
  _getMeta: function() {
    return [B(arguments.length <= 0 ? void 0 : arguments[0]) || arguments.length <= 0 ? void 0 : arguments[0], N(B(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getConfig: function(t, n) {
    var r, o, i;
    return (r = (t == null || (o = t.instance) === null || o === void 0 ? void 0 : o.$primevue) || (n == null || (i = n.ctx) === null || i === void 0 || (i = i.appContext) === null || i === void 0 || (i = i.config) === null || i === void 0 || (i = i.globalProperties) === null || i === void 0 ? void 0 : i.$primevue)) === null || r === void 0 ? void 0 : r.config;
  },
  _getOptionValue: ct,
  _getPTValue: function() {
    var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", a = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, l = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, s = function() {
      var _ = S._getOptionValue.apply(S, arguments);
      return j(_) || _n(_) ? {
        class: _
      } : _;
    }, u = ((t = r.binding) === null || t === void 0 || (t = t.value) === null || t === void 0 ? void 0 : t.ptOptions) || ((n = r.$primevueConfig) === null || n === void 0 ? void 0 : n.ptOptions) || {}, d = u.mergeSections, c = d === void 0 ? !0 : d, m = u.mergeProps, f = m === void 0 ? !1 : m, p = l ? S._useDefaultPT(r, r.defaultPT(), s, i, a) : void 0, v = S._usePT(r, S._getPT(o, r.$name), s, i, T(T({}, a), {}, {
      global: p || {}
    })), g = S._getPTDatasets(r, i);
    return c || !c && v ? f ? S._mergeProps(r, f, p, v, g) : T(T(T({}, p), v), g) : T(T({}, v), g);
  },
  _getPTDatasets: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = "data-pc-";
    return T(T({}, n === "root" && ot({}, "".concat(r, "name"), M(t.$name))), {}, ot({}, "".concat(r, "section"), M(n)));
  },
  _getPT: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 ? arguments[2] : void 0, o = function(a) {
      var l, s = r ? r(a) : a, u = M(n);
      return (l = s?.[u]) !== null && l !== void 0 ? l : s;
    };
    return t && Object.hasOwn(t, "_usept") ? {
      _usept: t._usept,
      originalValue: o(t.originalValue),
      value: o(t.value)
    } : o(t);
  },
  _usePT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = arguments.length > 2 ? arguments[2] : void 0, o = arguments.length > 3 ? arguments[3] : void 0, i = arguments.length > 4 ? arguments[4] : void 0, a = function(g) {
      return r(g, o, i);
    };
    if (n && Object.hasOwn(n, "_usept")) {
      var l, s = n._usept || ((l = t.$primevueConfig) === null || l === void 0 ? void 0 : l.ptOptions) || {}, u = s.mergeSections, d = u === void 0 ? !0 : u, c = s.mergeProps, m = c === void 0 ? !1 : c, f = a(n.originalValue), p = a(n.value);
      return f === void 0 && p === void 0 ? void 0 : j(p) ? p : j(f) ? f : d || !d && p ? m ? S._mergeProps(t, m, f, p) : T(T({}, f), p) : p;
    }
    return a(n);
  },
  _useDefaultPT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 ? arguments[2] : void 0, o = arguments.length > 3 ? arguments[3] : void 0, i = arguments.length > 4 ? arguments[4] : void 0;
    return S._usePT(t, n, r, o, i);
  },
  _loadStyles: function() {
    var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 ? arguments[1] : void 0, o = arguments.length > 2 ? arguments[2] : void 0, i = S._getConfig(r, o), a = {
      nonce: i == null || (t = i.csp) === null || t === void 0 ? void 0 : t.nonce
    };
    S._loadCoreStyles(n, a), S._loadThemeStyles(n, a), S._loadScopedThemeStyles(n, a), S._removeThemeListeners(n), n.$loadStyles = function() {
      return S._loadThemeStyles(n, a);
    }, S._themeChangeListener(n.$loadStyles);
  },
  _loadCoreStyles: function() {
    var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 ? arguments[1] : void 0;
    if (!J.isStyleNameLoaded((t = r.$style) === null || t === void 0 ? void 0 : t.name) && (n = r.$style) !== null && n !== void 0 && n.name) {
      var i;
      x.loadCSS(o), (i = r.$style) === null || i === void 0 || i.loadCSS(o), J.setLoadedStyleName(r.$style.name);
    }
  },
  _loadThemeStyles: function() {
    var t, n, r, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, i = arguments.length > 1 ? arguments[1] : void 0;
    if (!(o != null && o.isUnstyled() || (o == null || (t = o.theme) === null || t === void 0 ? void 0 : t.call(o)) === "none")) {
      if (!C.isStyleNameLoaded("common")) {
        var a, l, s = ((a = o.$style) === null || a === void 0 || (l = a.getCommonTheme) === null || l === void 0 ? void 0 : l.call(a)) || {}, u = s.primitive, d = s.semantic, c = s.global, m = s.style;
        x.load(u?.css, T({
          name: "primitive-variables"
        }, i)), x.load(d?.css, T({
          name: "semantic-variables"
        }, i)), x.load(c?.css, T({
          name: "global-variables"
        }, i)), x.loadStyle(T({
          name: "global-style"
        }, i), m), C.setLoadedStyleName("common");
      }
      if (!C.isStyleNameLoaded((n = o.$style) === null || n === void 0 ? void 0 : n.name) && (r = o.$style) !== null && r !== void 0 && r.name) {
        var f, p, v, g, y = ((f = o.$style) === null || f === void 0 || (p = f.getDirectiveTheme) === null || p === void 0 ? void 0 : p.call(f)) || {}, _ = y.css, $ = y.style;
        (v = o.$style) === null || v === void 0 || v.load(_, T({
          name: "".concat(o.$style.name, "-variables")
        }, i)), (g = o.$style) === null || g === void 0 || g.loadStyle(T({
          name: "".concat(o.$style.name, "-style")
        }, i), $), C.setLoadedStyleName(o.$style.name);
      }
      if (!C.isStyleNameLoaded("layer-order")) {
        var h, b, k = (h = o.$style) === null || h === void 0 || (b = h.getLayerOrderThemeCSS) === null || b === void 0 ? void 0 : b.call(h);
        x.load(k, T({
          name: "layer-order",
          first: !0
        }, i)), C.setLoadedStyleName("layer-order");
      }
    }
  },
  _loadScopedThemeStyles: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = t.preset();
    if (r && t.$attrSelector) {
      var o, i, a, l = ((o = t.$style) === null || o === void 0 || (i = o.getPresetTheme) === null || i === void 0 ? void 0 : i.call(o, r, "[".concat(t.$attrSelector, "]"))) || {}, s = l.css, u = (a = t.$style) === null || a === void 0 ? void 0 : a.load(s, T({
        name: "".concat(t.$attrSelector, "-").concat(t.$style.name)
      }, n));
      t.scopedStyleEl = u.el;
    }
  },
  _themeChangeListener: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
    };
    J.clearLoadedStyleNames(), A.on("theme:change", t);
  },
  _removeThemeListeners: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    A.off("theme:change", t.$loadStyles), t.$loadStyles = void 0;
  },
  _hook: function(t, n, r, o, i, a) {
    var l, s, u = "on".concat(co(n)), d = S._getConfig(o, i), c = r?.$instance, m = S._usePT(c, S._getPT(o == null || (l = o.value) === null || l === void 0 ? void 0 : l.pt, t), S._getOptionValue, "hooks.".concat(u)), f = S._useDefaultPT(c, d == null || (s = d.pt) === null || s === void 0 || (s = s.directives) === null || s === void 0 ? void 0 : s[t], S._getOptionValue, "hooks.".concat(u)), p = {
      el: r,
      binding: o,
      vnode: i,
      prevVnode: a
    };
    m?.(c, p), f?.(c, p);
  },
  /* eslint-disable-next-line no-unused-vars */
  _mergeProps: function() {
    for (var t = arguments.length > 1 ? arguments[1] : void 0, n = arguments.length, r = new Array(n > 2 ? n - 2 : 0), o = 2; o < n; o++)
      r[o - 2] = arguments[o];
    return Fe(t) ? t.apply(void 0, r) : ge.apply(void 0, r);
  },
  _extend: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = function(l, s, u, d, c) {
      var m, f, p, v;
      s._$instances = s._$instances || {};
      var g = S._getConfig(u, d), y = s._$instances[t] || {}, _ = z(y) ? T(T({}, n), n?.methods) : {};
      s._$instances[t] = T(T({}, y), {}, {
        /* new instance variables to pass in directive methods */
        $name: t,
        $host: s,
        $binding: u,
        $modifiers: u?.modifiers,
        $value: u?.value,
        $el: y.$el || s || void 0,
        $style: T({
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
        $attrSelector: (m = s.$pd) === null || m === void 0 || (m = m[t]) === null || m === void 0 ? void 0 : m.attrSelector,
        /* computed instance variables */
        defaultPT: function() {
          return S._getPT(g?.pt, void 0, function(h) {
            var b;
            return h == null || (b = h.directives) === null || b === void 0 ? void 0 : b[t];
          });
        },
        isUnstyled: function() {
          var h, b;
          return ((h = s._$instances[t]) === null || h === void 0 || (h = h.$binding) === null || h === void 0 || (h = h.value) === null || h === void 0 ? void 0 : h.unstyled) !== void 0 ? (b = s._$instances[t]) === null || b === void 0 || (b = b.$binding) === null || b === void 0 || (b = b.value) === null || b === void 0 ? void 0 : b.unstyled : g?.unstyled;
        },
        theme: function() {
          var h;
          return (h = s._$instances[t]) === null || h === void 0 || (h = h.$primevueConfig) === null || h === void 0 ? void 0 : h.theme;
        },
        preset: function() {
          var h;
          return (h = s._$instances[t]) === null || h === void 0 || (h = h.$binding) === null || h === void 0 || (h = h.value) === null || h === void 0 ? void 0 : h.dt;
        },
        /* instance's methods */
        ptm: function() {
          var h, b = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", k = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return S._getPTValue(s._$instances[t], (h = s._$instances[t]) === null || h === void 0 || (h = h.$binding) === null || h === void 0 || (h = h.value) === null || h === void 0 ? void 0 : h.pt, b, T({}, k));
        },
        ptmo: function() {
          var h = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, b = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", k = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return S._getPTValue(s._$instances[t], h, b, k, !1);
        },
        cx: function() {
          var h, b, k = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", E = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return (h = s._$instances[t]) !== null && h !== void 0 && h.isUnstyled() ? void 0 : S._getOptionValue((b = s._$instances[t]) === null || b === void 0 || (b = b.$style) === null || b === void 0 ? void 0 : b.classes, k, T({}, E));
        },
        sx: function() {
          var h, b = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", k = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, E = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return k ? S._getOptionValue((h = s._$instances[t]) === null || h === void 0 || (h = h.$style) === null || h === void 0 ? void 0 : h.inlineStyles, b, T({}, E)) : void 0;
        }
      }, _), s.$instance = s._$instances[t], (f = (p = s.$instance)[l]) === null || f === void 0 || f.call(p, s, u, d, c), s["$".concat(t)] = s.$instance, S._hook(t, l, s, u, d, c), s.$pd || (s.$pd = {}), s.$pd[t] = T(T({}, (v = s.$pd) === null || v === void 0 ? void 0 : v[t]), {}, {
        name: t,
        instance: s._$instances[t]
      });
    }, o = function(l) {
      var s, u, d, c = l._$instances[t], m = c?.watch, f = function(g) {
        var y, _ = g.newValue, $ = g.oldValue;
        return m == null || (y = m.config) === null || y === void 0 ? void 0 : y.call(c, _, $);
      }, p = function(g) {
        var y, _ = g.newValue, $ = g.oldValue;
        return m == null || (y = m["config.ripple"]) === null || y === void 0 ? void 0 : y.call(c, _, $);
      };
      c.$watchersCallback = {
        config: f,
        "config.ripple": p
      }, m == null || (s = m.config) === null || s === void 0 || s.call(c, c?.$primevueConfig), Q.on("config:change", f), m == null || (u = m["config.ripple"]) === null || u === void 0 || u.call(c, c == null || (d = c.$primevueConfig) === null || d === void 0 ? void 0 : d.ripple), Q.on("config:ripple:change", p);
    }, i = function(l) {
      var s = l._$instances[t].$watchersCallback;
      s && (Q.off("config:change", s.config), Q.off("config:ripple:change", s["config.ripple"]), l._$instances[t].$watchersCallback = void 0);
    };
    return {
      created: function(l, s, u, d) {
        l.$pd || (l.$pd = {}), l.$pd[t] = {
          name: t,
          attrSelector: xo("pd")
        }, r("created", l, s, u, d);
      },
      beforeMount: function(l, s, u, d) {
        var c;
        S._loadStyles((c = l.$pd[t]) === null || c === void 0 ? void 0 : c.instance, s, u), r("beforeMount", l, s, u, d), o(l);
      },
      mounted: function(l, s, u, d) {
        var c;
        S._loadStyles((c = l.$pd[t]) === null || c === void 0 ? void 0 : c.instance, s, u), r("mounted", l, s, u, d);
      },
      beforeUpdate: function(l, s, u, d) {
        r("beforeUpdate", l, s, u, d);
      },
      updated: function(l, s, u, d) {
        var c;
        S._loadStyles((c = l.$pd[t]) === null || c === void 0 ? void 0 : c.instance, s, u), r("updated", l, s, u, d);
      },
      beforeUnmount: function(l, s, u, d) {
        var c;
        i(l), S._removeThemeListeners((c = l.$pd[t]) === null || c === void 0 ? void 0 : c.instance), r("beforeUnmount", l, s, u, d);
      },
      unmounted: function(l, s, u, d) {
        var c;
        (c = l.$pd[t]) === null || c === void 0 || (c = c.instance) === null || c === void 0 || (c = c.scopedStyleEl) === null || c === void 0 || (c = c.value) === null || c === void 0 || c.remove(), r("unmounted", l, s, u, d);
      }
    };
  },
  extend: function() {
    var t = S._getMeta.apply(S, arguments), n = zt(t, 2), r = n[0], o = n[1];
    return T({
      extend: function() {
        var a = S._getMeta.apply(S, arguments), l = zt(a, 2), s = l[0], u = l[1];
        return S.extend(s, T(T(T({}, o), o?.methods), u));
      }
    }, S._extend(r, o));
  }
}, Ui = `
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
`, Wi = {
  root: "p-ink"
}, Hi = x.extend({
  name: "ripple-directive",
  style: Ui,
  classes: Wi
}), Fi = S.extend({
  style: Hi
});
function Pe(e) {
  "@babel/helpers - typeof";
  return Pe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Pe(e);
}
function zi(e) {
  return Gi(e) || qi(e) || Yi(e) || Ki();
}
function Ki() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Yi(e, t) {
  if (e) {
    if (typeof e == "string") return it(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? it(e, t) : void 0;
  }
}
function qi(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Gi(e) {
  if (Array.isArray(e)) return it(e);
}
function it(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function qt(e, t, n) {
  return (t = Ji(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ji(e) {
  var t = Qi(e, "string");
  return Pe(t) == "symbol" ? t : t + "";
}
function Qi(e, t) {
  if (Pe(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Pe(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var ma = Fi.extend("ripple", {
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
      n || (n = So("span", qt(qt({
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
        if (!this.isUnstyled() && ye(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "false"), !Ct(o) && !Pt(o)) {
          var i = Math.max(bo(r), Co(r));
          o.style.height = i + "px", o.style.width = i + "px";
        }
        var a = To(r), l = t.pageX - a.left + document.body.scrollTop - Pt(o) / 2, s = t.pageY - a.top + document.body.scrollLeft - Ct(o) / 2;
        o.style.top = s + "px", o.style.left = l + "px", !this.isUnstyled() && Qe(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "true"), this.timeout = setTimeout(function() {
          o && (!n.isUnstyled() && ye(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "false"));
        }, 401);
      }
    },
    onAnimationEnd: function(t) {
      this.timeout && clearTimeout(this.timeout), !this.isUnstyled() && ye(t.currentTarget, "p-ink-active"), t.currentTarget.setAttribute("data-p-ink-active", "false");
    },
    getInk: function(t) {
      return t && t.children ? zi(t.children).find(function(n) {
        return wo(n, "data-pc-name") === "ripple";
      }) : void 0;
    }
  }
});
function Oe(e) {
  "@babel/helpers - typeof";
  return Oe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Oe(e);
}
function Zi(e, t) {
  if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
}
function Xi(e, t) {
  for (var n = 0; n < t.length; n++) {
    var r = t[n];
    r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, ts(r.key), r);
  }
}
function es(e, t, n) {
  return t && Xi(e.prototype, t), Object.defineProperty(e, "prototype", { writable: !1 }), e;
}
function ts(e) {
  var t = ns(e, "string");
  return Oe(t) == "symbol" ? t : t + "";
}
function ns(e, t) {
  if (Oe(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Oe(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return String(e);
}
var fa = /* @__PURE__ */ (function() {
  function e(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : function() {
    };
    Zi(this, e), this.element = t, this.listener = n;
  }
  return es(e, [{
    key: "bindScrollListener",
    value: function() {
      this.scrollableParents = Po(this.element);
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
})();
function xe(e) {
  "@babel/helpers - typeof";
  return xe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, xe(e);
}
function rs(e) {
  return as(e) || ss(e) || is(e) || os();
}
function os() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function is(e, t) {
  if (e) {
    if (typeof e == "string") return st(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? st(e, t) : void 0;
  }
}
function ss(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function as(e) {
  if (Array.isArray(e)) return st(e);
}
function st(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function ls(e, t) {
  if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
}
function us(e, t) {
  for (var n = 0; n < t.length; n++) {
    var r = t[n];
    r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, Mn(r.key), r);
  }
}
function cs(e, t, n) {
  return t && us(e.prototype, t), Object.defineProperty(e, "prototype", { writable: !1 }), e;
}
function Gt(e, t, n) {
  return (t = Mn(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Mn(e) {
  var t = ds(e, "string");
  return xe(t) == "symbol" ? t : t + "";
}
function ds(e, t) {
  if (xe(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (xe(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return String(e);
}
var pa = /* @__PURE__ */ (function() {
  function e(t) {
    var n = t.init, r = t.type;
    ls(this, e), Gt(this, "helpers", void 0), Gt(this, "type", void 0), this.helpers = new Set(n), this.type = r;
  }
  return cs(e, [{
    key: "add",
    value: function(n) {
      this.helpers.add(n);
    }
  }, {
    key: "update",
    value: function() {
    }
  }, {
    key: "delete",
    value: function(n) {
      this.helpers.delete(n);
    }
  }, {
    key: "clear",
    value: function() {
      this.helpers.clear();
    }
  }, {
    key: "get",
    value: function(n, r) {
      var o = this._get(n, r), i = o ? this._recursive(rs(this.helpers), o) : null;
      return P(i) ? i : null;
    }
  }, {
    key: "_isMatched",
    value: function(n, r) {
      var o, i = n?.parent;
      return (i == null || (o = i.vnode) === null || o === void 0 ? void 0 : o.key) === r || i && this._isMatched(i, r) || !1;
    }
  }, {
    key: "_get",
    value: function(n, r) {
      var o, i;
      return ((o = r || n?.$slots) === null || o === void 0 || (i = o.default) === null || i === void 0 ? void 0 : i.call(o)) || null;
    }
  }, {
    key: "_recursive",
    value: function() {
      var n = this, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [], o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : [], i = [];
      return o.forEach(function(a) {
        a.children instanceof Array ? i = i.concat(n._recursive(r, a.children)) : a.type.name === n.type ? i.push(a) : P(a.key) && (i = i.concat(r.filter(function(l) {
          return n._isMatched(l, a.key);
        }).map(function(l) {
          return l.vnode;
        })));
      }), i;
    }
  }]);
})();
function ha(e, t) {
  if (e) {
    var n = e.props;
    if (n) {
      var r = t.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase(), o = Object.prototype.hasOwnProperty.call(n, r) ? r : t;
      return e.type.extends.props[t].type === Boolean && n[o] === "" ? !0 : n[o];
    }
  }
  return null;
}
var ga = dt(), ms = `
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
`, fs = {
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
x.extend({
  name: "menu",
  style: ms,
  classes: fs
});
const ps = "data-wippy-overlay-layer";
function Bn() {
  return typeof window < "u" && typeof window.document < "u";
}
function Un() {
  return Bn() && typeof HTMLElement < "u" && "popover" in HTMLElement.prototype;
}
function hs() {
  return Un() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const gs = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let vs = 0;
const Ue = /* @__PURE__ */ new WeakMap();
function Jt(e, t) {
  const n = e.style;
  n.setProperty("position", "fixed", "important"), n.setProperty("inset", "auto", "important"), n.setProperty("margin", "0", "important"), n.setProperty("position-anchor", t), n.setProperty("position-area", "bottom span-right"), n.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), n.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), n.setProperty("max-width", "stretch", "important");
}
function ys(e, t) {
  if (!gs.test(e.className))
    return;
  const n = e.style.cssText;
  Jt(e, t), e.getAttribute("popover") !== "manual" && e.setAttribute("popover", "manual");
  try {
    e.matches(":popover-open") || e.showPopover();
  } catch {
  }
  if (!e.matches(":popover-open")) {
    e.removeAttribute("popover"), e.style.cssText = n;
    return;
  }
  if (!Ue.has(e)) {
    const r = new MutationObserver(() => {
      const o = e.style;
      (o.top !== "auto" || o.left !== "auto" || o.margin !== "0px" || o.getPropertyPriority("top") !== "important" || o.getPropertyPriority("left") !== "important" || o.getPropertyPriority("margin") !== "important" || o.getPropertyPriority("min-width") !== "important" || o.maxWidth !== "stretch" || o.getPropertyPriority("max-width") !== "important") && Jt(e, t);
    });
    r.observe(e, { attributes: !0, attributeFilter: ["style"] }), Ue.set(e, r);
  }
}
function ft(e) {
  const t = Ue.get(e);
  t && (t.disconnect(), Ue.delete(e));
}
function bs(e) {
  const t = e && typeof e.getRootNode == "function" ? e.getRootNode() : null;
  return t instanceof ShadowRoot ? t : null;
}
function at(e) {
  e.style.top = "0px", e.style.left = "0px";
  const t = e.getBoundingClientRect();
  e.style.top = `${-window.scrollY - t.top}px`, e.style.left = `${-window.scrollX - t.left}px`;
}
const We = /* @__PURE__ */ new Set(), pt = /* @__PURE__ */ new WeakMap();
let Qt = !1, lt = !1;
const Zt = ["w-theme-dark", "w-theme-light"], Re = "data-wippy-theme-root", ut = /* @__PURE__ */ new WeakMap();
function _s(e) {
  const t = [];
  let n = e ? e.parentNode : null;
  for (; n && n.nodeType === 1; )
    t.push(n), n = n.parentNode;
  return t;
}
function Ss(e, t, n) {
  const r = [..._s(t), n.host], o = () => {
    let a;
    for (const l of r) {
      if (Zt.some((s) => l.classList.contains(s))) {
        a = l;
        break;
      }
      if (l.hasAttribute(Re))
        break;
    }
    for (const l of Zt)
      e.classList.toggle(l, !!(a && a.classList.contains(l)));
    a ? e.setAttribute(Re, "") : e.removeAttribute(Re);
  };
  o();
  const i = new MutationObserver(o);
  for (const a of r)
    i.observe(a, { attributes: !0, attributeFilter: ["class", Re] });
  ut.set(e, i);
}
function Wn(e) {
  ut.get(e)?.disconnect(), ut.delete(e);
}
function $s() {
  lt = !1;
  for (const e of We) {
    if (!e.isConnected) {
      for (const t of Array.from(e.children))
        t instanceof HTMLElement && ft(t);
      We.delete(e), pt.get(e)?.disconnect(), Wn(e);
      continue;
    }
    e.childElementCount > 0 && at(e);
  }
}
function Xt() {
  lt || (lt = !0, requestAnimationFrame($s));
}
function ws(e) {
  const t = document.createElement("div");
  t.setAttribute(ps, "");
  const n = Un();
  if (t.style.cssText = n ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", n && t.setAttribute("popover", "manual"), e.appendChild(t), n) {
    try {
      t.showPopover();
    } catch {
    }
    t.matches(":popover-open") || (t.removeAttribute("popover"), t.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  at(t);
  const r = new MutationObserver((o) => {
    const i = t.__wippyAnchorName;
    for (const a of o) {
      if (i)
        for (const l of Array.from(a.addedNodes))
          l instanceof HTMLElement && ys(l, i);
      for (const l of Array.from(a.removedNodes))
        l instanceof HTMLElement && ft(l);
    }
    t.isConnected && t.childElementCount > 0 && at(t);
  });
  return r.observe(t, { childList: !0 }), pt.set(t, r), We.add(t), Qt || (Qt = !0, window.addEventListener("scroll", Xt, { capture: !0, passive: !0 }), window.addEventListener("resize", Xt, { passive: !0 })), t;
}
function en(e) {
  if (!(!e.hostRoot || e.layer) && (e.layer = ws(e.hostRoot), Ss(e.layer, e.$el, e.hostRoot), hs())) {
    const t = e.$el ? e.$el.parentElement : null;
    t && (e.anchorName = `--wippy-a-${++vs}`, e.anchorTrigger = t, t.style.setProperty("anchor-name", e.anchorName), e.layer.__wippyAnchorName = e.anchorName);
  }
}
function tn(e) {
  if (e.anchorTrigger && (e.anchorTrigger.style.removeProperty("anchor-name"), e.anchorTrigger = null), e.anchorName = null, e.layer) {
    for (const t of Array.from(e.layer.children))
      t instanceof HTMLElement && ft(t);
    We.delete(e.layer), pt.get(e.layer)?.disconnect(), Wn(e.layer), e.layer.remove(), e.layer = null;
  }
}
let nn = !1;
function Ts() {
  if (nn)
    return;
  nn = !0;
  const e = In;
  e.computed = e.computed || {}, e.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, e.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, e.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, e.mounted = function() {
    Bn() && (this.hostRoot = bs(this.$el), this.mounted = !0, this.hostRoot && (this.inline || en(this), this.$watch("inline", (t) => {
      t ? tn(this) : en(this);
    })));
  }, e.render = function() {
    return this.inline ? De(this.$slots, "default", { key: 0 }) : this.mounted ? br(sn, { key: 1, to: this.resolvedTarget || document.body }, [
      De(this.$slots, "default")
    ]) : an("", !0);
  }, e.unmounted = function() {
    tn(this);
  };
}
const va = {
  install: (e) => {
    Ts(), e.use(di, { theme: "none" });
  }
};
export {
  ra as $,
  ye as A,
  x as B,
  Co as C,
  Hs as D,
  Qe as E,
  da as F,
  Js as G,
  Qs as H,
  zs as I,
  Rs as J,
  To as K,
  Zs as L,
  Is as M,
  Gs as N,
  ga as O,
  va as P,
  wo as Q,
  ma as R,
  Fs as S,
  Ct as T,
  Us as U,
  yo as V,
  Ls as W,
  Ns as X,
  aa as Y,
  oa as Z,
  Oo as _,
  Es as a,
  L as a0,
  ca as a1,
  Vs as a2,
  Ms as a3,
  ha as a4,
  pa as a5,
  Xs as a6,
  ea as a7,
  na as a8,
  As as a9,
  S as aa,
  So as ab,
  ia as ac,
  Ws as ad,
  ua as ae,
  Bs as af,
  wn as ag,
  Ys as b,
  Oi as c,
  Pt as d,
  P as e,
  mo as f,
  sa as g,
  In as h,
  Cn as i,
  fa as j,
  yn as k,
  xs as l,
  qs as m,
  Ks as n,
  ta as o,
  Je as p,
  z as q,
  xi as r,
  bi as s,
  js as t,
  ks as u,
  bo as v,
  $o as w,
  la as x,
  Ds as y,
  Tn as z
};
//# sourceMappingURL=wc-runtime-Bo5yC9Bh.js.map
