import { hasInjectionContext as nr, inject as He, effectScope as rr, ref as F, markRaw as or, createApp as ir, onMounted as Xt, onUnmounted as sr, watch as ce, readonly as ar, getCurrentInstance as ft, nextTick as lr, reactive as ur, renderSlot as Ve, openBlock as en, createBlock as dr, Teleport as tn, createCommentVNode as nn, useId as cr, mergeProps as he, createElementBlock as mr, createElementVNode as pr, h as fr } from "vue";
import { addCollection as hr } from "@iconify/vue";
import { config as ht, addIcons as gr, on as vr, applyThemeMode as ke, host as yr, hostCss as br, loadCss as _r } from "@wippy-fe/proxy";
var Ye = "data-wippy-visible";
function gt(e) {
  const t = e.getAttribute(Ye);
  return t === "true" ? !0 : t === "false" ? !1 : null;
}
var Sr = Object.defineProperty, rn = (e) => {
  throw TypeError(e);
}, $r = (e, t, n) => t in e ? Sr(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, P = (e, t, n) => $r(e, typeof t != "symbol" ? t + "" : t, n), on = (e, t, n) => t.has(e) || rn("Cannot " + n), wr = (e, t, n) => (on(e, t, "read from private field"), n ? n.call(e) : t.get(e)), Tr = (e, t, n) => t.has(e) ? rn("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, n), Cr = (e, t, n, r) => (on(e, t, "write to private field"), t.set(e, n), n), xr = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], Pr = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function vt(e) {
  const t = e.startsWith("--") ? e : `--${e}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(t) ? t : null;
}
function Or(...e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of e)
    if (n)
      for (const [r, o] of Object.entries(n)) {
        if ((r === "@light" || r === "@dark") && o && typeof o == "object") {
          for (const [a, l] of Object.entries(o)) {
            const i = typeof l == "string" ? vt(a) : null;
            i && t.add(i);
          }
          continue;
        }
        const s = typeof o == "string" ? vt(r) : null;
        s && t.add(s);
      }
  return [...t].sort();
}
function kr(e) {
  if (e.length === 0)
    return "";
  const t = e.map((n) => `  ${n}: inherit;`).join(`
`);
  return `${Pr} {
${t}
}`;
}
function Er(e, t) {
  const n = kr(t);
  n && sn(e, n, "@wippy-fe/css-variables-bridge");
}
function Lr(e, t) {
  const r = (t ?? xr).map(async (o) => {
    const s = br[o];
    if (!s)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${o}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await _r(s);
    } catch (a) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${o}" (${s}):`, a), null;
    }
  });
  return Promise.all(r).then((o) => {
    for (const s of o) {
      if (!s)
        continue;
      const a = document.createElement("style");
      a.textContent = s, a.setAttribute("role", "@wippy-fe/host-css"), e.appendChild(a);
    }
  });
}
function Ar(e, t) {
  const n = document.createElement("style");
  n.textContent = t, e.appendChild(n);
}
function sn(e, t, n) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const o = new CSSStyleSheet();
    o.replaceSync(t), e.adoptedStyleSheets = [...e.adoptedStyleSheets, o];
    return;
  }
  const r = document.createElement("style");
  r.setAttribute("role", n), r.textContent = t, e.appendChild(r);
}
function jr(e, t) {
  sn(e, t, "@wippy-fe/custom-css");
}
function an(e) {
  return e.__wippyHost ?? null;
}
function Nr(e) {
  return e.replace(/-([a-z])/g, (t, n) => n.toUpperCase());
}
function Ir(e, t, n) {
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
function Fe(e, t) {
  const n = {}, r = [];
  for (const [o, s] of Object.entries(t.properties)) {
    const a = e.getAttribute(o), l = Nr(o);
    if (a === null) {
      s.default !== void 0 && (n[l] = s.default);
      continue;
    }
    const i = Ir(o, a, s);
    i.error ? r.push(i.error) : n[l] = i.value;
  }
  return { props: n, errors: r };
}
var Rr = class {
  constructor(e, t) {
    P(this, "_props"), P(this, "_errors"), P(this, "_content"), P(this, "_hostVisibility"), P(this, "_propsListeners", /* @__PURE__ */ new Set()), P(this, "_contentListeners", /* @__PURE__ */ new Set()), P(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), P(this, "_disposed", !1), P(this, "_emitToDom"), P(this, "props"), P(this, "events"), P(this, "content"), P(this, "hostVisibility"), this._props = e.props, this._errors = e.errors, this._content = e.content, this._hostVisibility = e.hostVisibility, this._emitToDom = t;
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
}, Re, Vr = class extends HTMLElement {
  constructor() {
    super(), P(this, "_internals"), P(this, "_contentObserver", null), P(this, "_initialized", !1), P(this, "_container", null), Tr(this, Re, null), P(this, "_attachment", 0), P(this, "_reactive", null), P(this, "_lastProps", null), P(this, "_lastErrors", []), P(this, "_lastContent", null), P(this, "_themeUnsub", null), P(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = gt(this);
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
    return [.../* @__PURE__ */ new Set([...t, ...n, Ye])];
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
    return an(this);
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
        const s = Fe(this, e.propsSchema);
        e.validateProps && s.errors.push(...e.validateProps(s.props)), n = s.props, r = s.errors, this._lastProps = n, this._lastErrors = r;
      }
      const o = t ? this._lastContent ?? this._extractContent(e.contentTemplate) : null;
      t && this._lastContent === null && (this._lastContent = o), this._reactive = new Rr(
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
      const t = this.constructor.wippyConfig, n = this._initialized, r = wr(this, Re) ?? Cr(this, Re, this.shadowRoot ?? this.attachShadow({ mode: t.shadowMode ?? "open" }));
      let o;
      if (this._container)
        o = this._container;
      else {
        if (this.onInit(r), e !== this._attachment)
          return;
        t.inlineCss && Ar(r, t.inlineCss);
        try {
          const c = ht?.theming, d = Or(
            c?.global?.cssVariables,
            c?.children?.cssVariables
          );
          Er(r, d);
        } catch {
        }
        if (t.customCss !== !1)
          try {
            const c = ht?.theming, d = [c?.global?.customCSS, c?.children?.customCSS].filter(Boolean).join(`
`);
            d && jr(r, d);
          } catch {
          }
        (t.hostCssKeys === void 0 || t.hostCssKeys.length > 0) && Lr(r, t.hostCssKeys), o = document.createElement("div"), o.setAttribute("data-wippy-theme-root", "");
        const u = t.containerClasses ?? [];
        u.length > 0 && o.classList.add(...u), r.appendChild(o), this._container = o, gr(hr);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = vr("@theme", (u) => this._applyTheme(u)));
      const { props: s, errors: a } = Fe(this, t.propsSchema);
      t.validateProps && a.push(...t.validateProps(s));
      const l = s;
      this._lastProps = l, this._lastErrors = a;
      let i = null;
      if (t.contentTemplate && (i = this._extractContent(t.contentTemplate), this._lastContent = i, this._contentObserver = new MutationObserver(() => {
        const u = this._extractContent(t.contentTemplate);
        this._lastContent = u, this._reactive?.notifyContent(u), this.onContentChanged(u);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(r, o, l, a, i, n), e !== this._attachment)
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
  _applyTheme(e = yr.getThemeMode?.()) {
    ke(e, this), this._container && ke(e, this._container);
  }
  disconnectedCallback() {
    const e = ++this._attachment;
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), ke("auto", this), this._container && ke("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), e === this._attachment && (this.emitEvent("unload"), e === this._attachment && (this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus));
  }
  attributeChangedCallback(e, t, n) {
    if (t === n)
      return;
    if (e === Ye) {
      const l = this._hostVisible, i = gt(this);
      if (i === l)
        return;
      this._hostVisible = i, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(i, l), this.onHostVisibilityChanged(i, l));
      return;
    }
    const r = this.constructor.wippyConfig, { props: o, errors: s } = Fe(this, r.propsSchema);
    r.validateProps && s.push(...r.validateProps(o));
    const a = o;
    this._lastProps = a, this._lastErrors = s, this._reactive?.notifyProps(a, s), this.onPropsChanged(a, s);
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
Re = /* @__PURE__ */ new WeakMap();
function Dr(e) {
  return e.__wippyHostBus ?? null;
}
function Mr(e) {
  return e.dataset.wippyPanelId ?? null;
}
/*!
 * pinia v4.0.3
 * (c) 2026 Eduardo San Martin Morote
 * @license MIT
 */
let ln;
const un = (e) => ln = e, Wr = () => nr() && He(dn) || ln, dn = (
  /* istanbul ignore next */
  Symbol()
);
function Br() {
  const e = rr(!0), t = e.run(() => F({}));
  let n = [], r = [];
  const o = or({
    install(s) {
      un(o), o._a = s, s.provide(dn, o), s.config.globalProperties.$pinia = o, r.forEach((a) => n.push(a)), r = [];
    },
    use(s) {
      return this._a ? n.push(s) : r.push(s), this;
    },
    _p: n,
    _a: null,
    _e: e,
    _s: /* @__PURE__ */ new Map(),
    state: t
  });
  return o;
}
var Hr = Object.defineProperty, Ur = (e, t, n) => t in e ? Hr(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, H = (e, t, n) => Ur(e, typeof t != "symbol" ? t + "" : t, n);
function ps(e, t) {
  return { lazyConfig: e, mountLifecycle: !0, lazyUi: t };
}
function yt(e, t, n) {
  const r = e.createElement("div"), o = n ? t.failed : t.loading;
  r.dataset.lazyState = n ? "failed" : "loading", r.setAttribute("role", n ? "alert" : "status"), r.setAttribute("aria-label", o), r.style.cssText = "display:grid;place-items:center;text-align:center;";
  const s = t.surface === "page";
  if (r.style.cssText += s ? "block-size:100%;min-block-size:0;" : "min-block-size:2rem;font-size:.875rem;", n)
    r.style.color = "var(--p-danger-500, currentColor)", r.textContent = !s && t.iconOnly ? "⚠" : o, !s && t.iconOnly && (r.title = o);
  else {
    const a = e.createElement("style");
    a.textContent = '@media (prefers-reduced-motion: no-preference) { [data-lazy-state="loading"] > [data-wippy-spinner] { animation: wippy-lazy-spin 1s linear infinite; } } @keyframes wippy-lazy-spin { to { transform: rotate(1turn); } }';
    const l = e.createElement("span");
    l.dataset.wippySpinner = "", l.setAttribute("aria-hidden", "true"), l.style.cssText = "display:block;box-sizing:border-box;inline-size:1em;block-size:1em;border:2px solid var(--p-surface-300, currentColor);border-top-color:var(--p-primary-color, currentColor);border-radius:50%;", l.style.fontSize = s ? "2rem" : "1em", r.append(a, l);
  }
  return r;
}
var cn = /* @__PURE__ */ Symbol("wippy:emit"), mn = /* @__PURE__ */ Symbol("wippy:props"), Fr = /* @__PURE__ */ Symbol("wippy:props_error"), zr = /* @__PURE__ */ Symbol("wippy:content"), Kr = /* @__PURE__ */ Symbol("wippy:panel-id"), Yr = /* @__PURE__ */ Symbol("wippy:layout-bus"), qr = /* @__PURE__ */ Symbol("wippy:host"), pn = /* @__PURE__ */ Symbol("wippy:host-visibility");
function fs() {
  const e = He(mn);
  if (!e)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return e;
}
function hs() {
  const e = He(cn);
  if (!e)
    throw new Error("useEvents() must be called inside a WippyVueElement");
  return e;
}
function Gr() {
  const e = He(pn);
  if (!e)
    throw new Error("useHostVisibility() must be called inside a WippyVueElement");
  return e;
}
function gs(e) {
  const t = Gr();
  let n = !1, r = null, o = !1;
  function s() {
    if (r)
      return o = !0, r;
    let a;
    try {
      a = Promise.resolve(e());
    } catch (i) {
      a = Promise.reject(i);
    }
    const l = a.finally(() => {
      if (r === l && (r = null, n && o))
        return o = !1, s();
    });
    return r = l, l;
  }
  return Xt(() => (n = !0, s())), sr(() => {
    n = !1, o = !1;
  }), ce(t, (a, l) => {
    if (n && l === !1 && a === !0)
      return s();
  }), t;
}
var Ee = /* @__PURE__ */ new WeakMap();
function bt(e, t) {
  const n = Ee.get(e);
  if (n)
    return n;
  const r = Promise.resolve().then(t);
  return Ee.set(e, r), r.catch(() => {
    Ee.get(e) === r && Ee.delete(e);
  }), r;
}
var vs = class extends Vr {
  constructor() {
    super(...arguments), H(this, "_vueApp", null), H(this, "_mountingApp", !1), H(this, "_mountState", "idle"), H(this, "_feedback", null), H(this, "_propsRef", F({})), H(this, "_errorsRef", F([])), H(this, "_contentRef", F(null)), H(this, "_hostVisibilityRef", F(null)), H(this, "_bridgeAbort", null);
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
    e.mountLifecycle && !e.rootComponent && e.lazyConfig && await bt(this, e.lazyConfig);
  }
  /** Undefined on configurations that use only the legacy load event. */
  get wippyMountState() {
    return this.constructor.vueConfig.mountLifecycle ? this._mountState : void 0;
  }
  onMount(e, t, n, r, o, s) {
    const a = this.constructor, l = a.vueConfig, i = new AbortController();
    this._bridgeAbort = i;
    const u = () => !i.signal.aborted && this._bridgeAbort === i;
    this._mountState = "mounting", this._propsRef.value = n, this._errorsRef.value = r, this._contentRef.value = o ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const d of r)
      if (this.emitEvent("invalid", { message: d }), !u())
        return;
    this.reactive.props.subscribe((d, m) => {
      this._propsRef.value = d, this._errorsRef.value = [...m];
      for (const p of m)
        this.emitEvent("invalid", { message: p });
    }, { signal: i.signal }), this.reactive.content && this.reactive.content.subscribe((d) => {
      this._contentRef.value = d;
    }, { signal: i.signal }), this.reactive.hostVisibility.subscribe((d) => {
      this._hostVisibilityRef.value = d;
    }, { signal: i.signal });
    const c = (d) => {
      if (!u())
        return;
      const m = Wr(), p = ir(d.rootComponent);
      let f = !1, v = !1, g, y;
      this._mountingApp = !0;
      try {
        const _ = Br();
        if (d.piniaPlugins)
          for (const $ of d.piniaPlugins)
            _.use($);
        p.use(_);
        for (const $ of d.plugins ?? [])
          p.use($);
        if (p.provide(mn, this._propsRef), p.provide(Fr, this._errorsRef), p.provide(cn, this.emitEvent.bind(this)), p.provide(zr, this._contentRef), p.provide(pn, this._hostVisibilityRef), p.provide(Kr, Mr(this)), p.provide(Yr, Dr(this)), p.provide(qr, an(this)), d.providers?.(p, this), !u())
          return;
        if (y = p.config.errorHandler, l.mountLifecycle && (p.config.errorHandler = ($, h, b) => {
          v || (g = $), v = !0, y?.($, h, b);
        }), p.mount(t), f = !0, v)
          throw g;
        u() && (this._vueApp = p);
      } finally {
        l.mountLifecycle && f && (p.config.errorHandler = y);
        try {
          f && (v || !u()) && p.unmount();
        } finally {
          un(m), this._mountingApp = !1;
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
            c(l);
          } catch (d) {
            u() && (this._mountState = "failed", this.emitEvent("error", { message: d instanceof Error ? d.message : String(d), error: d }));
          }
        });
        return;
      }
      try {
        c(l);
      } catch (d) {
        if (u())
          throw this._mountState = "failed", d;
      }
    } else if (l.lazyConfig) {
      const d = t.ownerDocument, m = l.lazyUi;
      m?.surface === "page" && (t.style.blockSize = "100%", t.style.minBlockSize = "0");
      let p = !1, f, v;
      const g = () => {
        clearTimeout(f), clearTimeout(v), this._feedback?.remove(), this._feedback = null;
      };
      i.signal.addEventListener("abort", g, { once: !0 });
      const y = () => {
        if (!u() || p)
          return;
        const b = m ? yt(d, m, !1) : d.createElement("wippy-loading");
        b.setAttribute("no-bg", ""), this._feedback = b, t.appendChild(b);
      }, _ = (b) => {
        if (!u())
          return;
        p = !0, g(), this._mountState = "failed";
        const k = m?.failed ?? (b instanceof Error ? b.message : String(b)), E = m ? yt(d, m, !0) : d.createElement("wippy-error");
        m || (E.setAttribute("title", "Failed to load"), E.setAttribute("message", k)), this._feedback = E, t.appendChild(E), this.emitEvent("error", m ? { message: k, error: b } : { message: k });
      }, $ = m?.delay ?? (m?.surface === "compact" ? 200 : 0);
      $ > 0 ? f = setTimeout(y, $) : y(), m && (v = setTimeout(() => _(new Error("The component did not load in time.")), m.timeout ?? 3e4)), (l.mountLifecycle ? bt(a, l.lazyConfig) : l.lazyConfig()).then((b) => {
        !u() || p || (p = !0, g(), c(b));
      }, (b) => {
        p || _(b);
      }).catch(_);
    } else
      throw this._mountState = "failed", new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._mountState = "idle", this._feedback?.remove(), this._feedback = null;
    const e = this._vueApp;
    this._vueApp = null, e?.unmount();
  }
}, Jr = Object.defineProperty, _t = Object.getOwnPropertySymbols, Qr = Object.prototype.hasOwnProperty, Zr = Object.prototype.propertyIsEnumerable, St = (e, t, n) => t in e ? Jr(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, Xr = (e, t) => {
  for (var n in t || (t = {})) Qr.call(t, n) && St(e, n, t[n]);
  if (_t) for (var n of _t(t)) Zr.call(t, n) && St(e, n, t[n]);
  return e;
};
function Pe(e) {
  return e == null || e === "" || Array.isArray(e) && e.length === 0 || !(e instanceof Date) && typeof e == "object" && Object.keys(e).length === 0;
}
function qe(e, t, n = /* @__PURE__ */ new WeakSet()) {
  if (e === t) return !0;
  if (!e || !t || typeof e != "object" || typeof t != "object" || n.has(e) || n.has(t)) return !1;
  n.add(e).add(t);
  let r = Array.isArray(e), o = Array.isArray(t), s, a, l;
  if (r && o) {
    if (a = e.length, a != t.length) return !1;
    for (s = a; s-- !== 0; ) if (!qe(e[s], t[s], n)) return !1;
    return !0;
  }
  if (r != o) return !1;
  let i = e instanceof Date, u = t instanceof Date;
  if (i != u) return !1;
  if (i && u) return e.getTime() == t.getTime();
  let c = e instanceof RegExp, d = t instanceof RegExp;
  if (c != d) return !1;
  if (c && d) return e.toString() == t.toString();
  let m = Object.keys(e);
  if (a = m.length, a !== Object.keys(t).length) return !1;
  for (s = a; s-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(t, m[s])) return !1;
  for (s = a; s-- !== 0; ) if (l = m[s], !qe(e[l], t[l], n)) return !1;
  return !0;
}
function eo(e, t) {
  return qe(e, t);
}
function Ue(e) {
  return typeof e == "function" && "call" in e && "apply" in e;
}
function x(e) {
  return !Pe(e);
}
function Ge(e, t) {
  if (!e || !t) return null;
  try {
    let n = e[t];
    if (x(n)) return n;
  } catch {
  }
  if (Object.keys(e).length) {
    if (Ue(t)) return t(e);
    if (t.indexOf(".") === -1) return e[t];
    {
      let n = t.split("."), r = e;
      for (let o = 0, s = n.length; o < s; ++o) {
        if (r == null) return null;
        r = r[n[o]];
      }
      return r;
    }
  }
  return null;
}
function to(e, t, n) {
  return n ? Ge(e, n) === Ge(t, n) : eo(e, t);
}
function W(e, t = !0) {
  return e instanceof Object && e.constructor === Object && (t || Object.keys(e).length !== 0);
}
function fn(e = {}, t = {}) {
  let n = Xr({}, e);
  return Object.keys(t).forEach((r) => {
    let o = r;
    W(t[o]) && o in e && W(e[o]) ? n[o] = fn(e[o], t[o]) : n[o] = t[o];
  }), n;
}
function no(...e) {
  return e.reduce((t, n, r) => r === 0 ? n : fn(t, n), {});
}
function ys(e, t) {
  let n = -1;
  if (x(e)) try {
    n = e.findLastIndex(t);
  } catch {
    n = e.lastIndexOf([...e].reverse().find(t));
  }
  return n;
}
function N(e, ...t) {
  return Ue(e) ? e(...t) : e;
}
function j(e, t = !0) {
  return typeof e == "string" && (t || e !== "");
}
function M(e) {
  return j(e) ? e.replace(/(-|_)/g, "").toLowerCase() : e;
}
function lt(e, t = "", n = {}) {
  let r = M(t).split("."), o = r.shift();
  if (o) {
    if (W(e)) {
      let s = Object.keys(e).find((a) => M(a) === o) || "";
      return lt(N(e[s], n), r.join("."), n);
    }
    return;
  }
  return N(e, n);
}
function hn(e, t = !0) {
  return Array.isArray(e) && (t || e.length !== 0);
}
function ro(e) {
  return x(e) && !isNaN(e);
}
function bs(e = "") {
  return x(e) && e.length === 1 && !!e.match(/\S| /);
}
function re(e, t) {
  if (t) {
    let n = t.test(e);
    return t.lastIndex = 0, n;
  }
  return !1;
}
function oo(...e) {
  return no(...e);
}
function ge(e) {
  return e && e.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function I(e) {
  if (e && /[\xC0-\xFF\u0100-\u017E]/.test(e)) {
    let t = { A: /[\xC0-\xC5\u0100\u0102\u0104]/g, AE: /[\xC6]/g, C: /[\xC7\u0106\u0108\u010A\u010C]/g, D: /[\xD0\u010E\u0110]/g, E: /[\xC8-\xCB\u0112\u0114\u0116\u0118\u011A]/g, G: /[\u011C\u011E\u0120\u0122]/g, H: /[\u0124\u0126]/g, I: /[\xCC-\xCF\u0128\u012A\u012C\u012E\u0130]/g, IJ: /[\u0132]/g, J: /[\u0134]/g, K: /[\u0136]/g, L: /[\u0139\u013B\u013D\u013F\u0141]/g, N: /[\xD1\u0143\u0145\u0147\u014A]/g, O: /[\xD2-\xD6\xD8\u014C\u014E\u0150]/g, OE: /[\u0152]/g, R: /[\u0154\u0156\u0158]/g, S: /[\u015A\u015C\u015E\u0160]/g, T: /[\u0162\u0164\u0166]/g, U: /[\xD9-\xDC\u0168\u016A\u016C\u016E\u0170\u0172]/g, W: /[\u0174]/g, Y: /[\xDD\u0176\u0178]/g, Z: /[\u0179\u017B\u017D]/g, a: /[\xE0-\xE5\u0101\u0103\u0105]/g, ae: /[\xE6]/g, c: /[\xE7\u0107\u0109\u010B\u010D]/g, d: /[\u010F\u0111]/g, e: /[\xE8-\xEB\u0113\u0115\u0117\u0119\u011B]/g, g: /[\u011D\u011F\u0121\u0123]/g, i: /[\xEC-\xEF\u0129\u012B\u012D\u012F\u0131]/g, ij: /[\u0133]/g, j: /[\u0135]/g, k: /[\u0137,\u0138]/g, l: /[\u013A\u013C\u013E\u0140\u0142]/g, n: /[\xF1\u0144\u0146\u0148\u014B]/g, p: /[\xFE]/g, o: /[\xF2-\xF6\xF8\u014D\u014F\u0151]/g, oe: /[\u0153]/g, r: /[\u0155\u0157\u0159]/g, s: /[\u015B\u015D\u015F\u0161]/g, t: /[\u0163\u0165\u0167]/g, u: /[\xF9-\xFC\u0169\u016B\u016D\u016F\u0171\u0173]/g, w: /[\u0175]/g, y: /[\xFD\xFF\u0177]/g, z: /[\u017A\u017C\u017E]/g };
    for (let n in t) e = e.replace(t[n], n);
  }
  return e;
}
function io(e) {
  return j(e, !1) ? e[0].toUpperCase() + e.slice(1) : e;
}
function gn(e) {
  return j(e) ? e.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : e;
}
function ut() {
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
function so(...e) {
  if (e) {
    let t = [];
    for (let n = 0; n < e.length; n++) {
      let r = e[n];
      if (!r) continue;
      let o = typeof r;
      if (o === "string" || o === "number") t.push(r);
      else if (o === "object") {
        let s = Array.isArray(r) ? [so(...r)] : Object.entries(r).map(([a, l]) => l ? a : void 0);
        t = s.length ? t.concat(s.filter((a) => !!a)) : t;
      }
    }
    return t.join(" ").trim();
  }
}
function ao(e, t) {
  return e ? e.classList ? e.classList.contains(t) : new RegExp("(^| )" + t + "( |$)", "gi").test(e.className) : !1;
}
function Je(e, t) {
  if (e && t) {
    let n = (r) => {
      ao(e, r) || (e.classList ? e.classList.add(r) : e.className += " " + r);
    };
    [t].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function lo() {
  return window.innerWidth - document.documentElement.offsetWidth;
}
function _s(e) {
  typeof e == "string" ? Je(document.body, e || "p-overflow-hidden") : (e != null && e.variableName && document.body.style.setProperty(e.variableName, lo() + "px"), Je(document.body, e?.className || "p-overflow-hidden"));
}
function ve(e, t) {
  if (e && t) {
    let n = (r) => {
      e.classList ? e.classList.remove(r) : e.className = e.className.replace(new RegExp("(^|\\b)" + r.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [t].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function Ss(e) {
  typeof e == "string" ? ve(document.body, e || "p-overflow-hidden") : (e != null && e.variableName && document.body.style.removeProperty(e.variableName), ve(document.body, e?.className || "p-overflow-hidden"));
}
function Qe(e) {
  for (let t of document?.styleSheets) try {
    for (let n of t?.cssRules) for (let r of n?.style) if (e.test(r)) return { name: r, value: n.style.getPropertyValue(r).trim() };
  } catch {
  }
  return null;
}
function vn(e) {
  let t = { width: 0, height: 0 };
  if (e) {
    let [n, r] = [e.style.visibility, e.style.display], o = e.getBoundingClientRect();
    e.style.visibility = "hidden", e.style.display = "block", t.width = o.width || e.offsetWidth, t.height = o.height || e.offsetHeight, e.style.display = r, e.style.visibility = n;
  }
  return t;
}
function yn() {
  let e = window, t = document, n = t.documentElement, r = t.getElementsByTagName("body")[0], o = e.innerWidth || n.clientWidth || r.clientWidth, s = e.innerHeight || n.clientHeight || r.clientHeight;
  return { width: o, height: s };
}
function Ze(e) {
  return e ? Math.abs(e.scrollLeft) : 0;
}
function uo() {
  let e = document.documentElement;
  return (window.pageXOffset || Ze(e)) - (e.clientLeft || 0);
}
function co() {
  let e = document.documentElement;
  return (window.pageYOffset || e.scrollTop) - (e.clientTop || 0);
}
function mo(e) {
  return e ? getComputedStyle(e).direction === "rtl" : !1;
}
function $s(e, t, n = !0) {
  var r, o, s, a;
  if (e) {
    let l = e.offsetParent ? { width: e.offsetWidth, height: e.offsetHeight } : vn(e), i = l.height, u = l.width, c = t.offsetHeight, d = t.offsetWidth, m = t.getBoundingClientRect(), p = co(), f = uo(), v = yn(), g, y, _ = "top";
    m.top + c + i > v.height ? (g = m.top + p - i, _ = "bottom", g < 0 && (g = p)) : g = c + m.top + p, m.left + u > v.width ? y = Math.max(0, m.left + f + d - u) : y = m.left + f, mo(e) ? e.style.insetInlineEnd = y + "px" : e.style.insetInlineStart = y + "px", e.style.top = g + "px", e.style.transformOrigin = _, n && (e.style.marginTop = _ === "bottom" ? `calc(${(o = (r = Qe(/-anchor-gutter$/)) == null ? void 0 : r.value) != null ? o : "2px"} * -1)` : (a = (s = Qe(/-anchor-gutter$/)) == null ? void 0 : s.value) != null ? a : "");
  }
}
function ws(e, t) {
  e && (typeof t == "string" ? e.style.cssText = t : Object.entries(t || {}).forEach(([n, r]) => e.style[n] = r));
}
function po(e, t) {
  return e instanceof HTMLElement ? e.offsetWidth : 0;
}
function Ts(e, t, n = !0, r = void 0) {
  var o;
  if (e) {
    let s = e.offsetParent ? { width: e.offsetWidth, height: e.offsetHeight } : vn(e), a = t.offsetHeight, l = t.getBoundingClientRect(), i = yn(), u, c, d = r ?? "top";
    if (!r && l.top + a + s.height > i.height ? (u = -1 * s.height, d = "bottom", l.top + u < 0 && (u = -1 * l.top)) : u = a, s.width > i.width ? c = l.left * -1 : l.left + s.width > i.width ? c = (l.left + s.width - i.width) * -1 : c = 0, e.style.top = u + "px", e.style.insetInlineStart = c + "px", e.style.transformOrigin = d, n) {
      let m = (o = Qe(/-anchor-gutter$/)) == null ? void 0 : o.value;
      e.style.marginTop = d === "bottom" ? `calc(${m ?? "2px"} * -1)` : m ?? "";
    }
  }
}
function bn(e) {
  if (e) {
    let t = e.parentNode;
    return t && t instanceof ShadowRoot && t.host && (t = t.host), t;
  }
  return null;
}
function fo(e) {
  return !!(e !== null && typeof e < "u" && e.nodeName && bn(e));
}
function ie(e) {
  return typeof Element < "u" ? e instanceof Element : e !== null && typeof e == "object" && e.nodeType === 1 && typeof e.nodeName == "string";
}
function Cs() {
  if (window.getSelection) {
    let e = window.getSelection() || {};
    e.empty ? e.empty() : e.removeAllRanges && e.rangeCount > 0 && e.getRangeAt(0).getClientRects().length > 0 && e.removeAllRanges();
  }
}
function De(e, t = {}) {
  if (ie(e)) {
    let n = (r, o) => {
      var s, a;
      let l = (s = e?.$attrs) != null && s[r] ? [(a = e?.$attrs) == null ? void 0 : a[r]] : [];
      return [o].flat().reduce((i, u) => {
        if (u != null) {
          let c = typeof u;
          if (c === "string" || c === "number") i.push(u);
          else if (c === "object") {
            let d = Array.isArray(u) ? n(r, u) : Object.entries(u).map(([m, p]) => r === "style" && (p || p === 0) ? `${m.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}:${p}` : p ? m : void 0);
            i = d.length ? i.concat(d.filter((m) => !!m)) : i;
          }
        }
        return i;
      }, l);
    };
    Object.entries(t).forEach(([r, o]) => {
      if (o != null) {
        let s = r.match(/^on(.+)/);
        s ? e.addEventListener(s[1].toLowerCase(), o) : r === "p-bind" || r === "pBind" ? De(e, o) : (o = r === "class" ? [...new Set(n("class", o))].join(" ").trim() : r === "style" ? n("style", o).join(";").trim() : o, (e.$attrs = e.$attrs || {}) && (e.$attrs[r] = o), e.setAttribute(r, o));
      }
    });
  }
}
function ho(e, t = {}, ...n) {
  {
    let r = document.createElement(e);
    return De(r, t), r.append(...n), r;
  }
}
function go(e, t) {
  return ie(e) ? Array.from(e.querySelectorAll(t)) : [];
}
function _n(e, t) {
  return ie(e) ? e.matches(t) ? e : e.querySelector(t) : null;
}
function xs(e, t) {
  e && document.activeElement !== e && e.focus(t);
}
function vo(e, t) {
  if (ie(e)) {
    let n = e.getAttribute(t);
    return isNaN(n) ? n === "true" || n === "false" ? n === "true" : n : +n;
  }
}
function Sn(e, t = "") {
  let n = go(e, `button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [href]:not([tabindex = "-1"]):not([style*="display:none"]):not([hidden])${t},
            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t}`), r = [];
  for (let o of n) getComputedStyle(o).display != "none" && getComputedStyle(o).visibility != "hidden" && r.push(o);
  return r;
}
function Ps(e, t) {
  let n = Sn(e, t);
  return n.length > 0 ? n[0] : null;
}
function $t(e) {
  if (e) {
    let t = e.offsetHeight, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingTop) + parseFloat(n.paddingBottom) + parseFloat(n.borderTopWidth) + parseFloat(n.borderBottomWidth), t;
  }
  return 0;
}
function Os(e, t) {
  let n = Sn(e, t);
  return n.length > 0 ? n[n.length - 1] : null;
}
function yo(e) {
  if (e) {
    let t = e.getBoundingClientRect();
    return { top: t.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: t.left + (window.pageXOffset || Ze(document.documentElement) || Ze(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function bo(e, t) {
  return e ? e.offsetHeight : 0;
}
function $n(e, t = []) {
  let n = bn(e);
  return n === null ? t : $n(n, t.concat([n]));
}
function _o(e) {
  let t = [];
  if (e) {
    let n = $n(e), r = /(auto|scroll)/, o = (s) => {
      try {
        let a = window.getComputedStyle(s, null);
        return r.test(a.getPropertyValue("overflow")) || r.test(a.getPropertyValue("overflowX")) || r.test(a.getPropertyValue("overflowY"));
      } catch {
        return !1;
      }
    };
    for (let s of n) {
      let a = s.nodeType === 1 && s.dataset.scrollselectors;
      if (a) {
        let l = a.split(",");
        for (let i of l) {
          let u = _n(s, i);
          u && o(u) && t.push(u);
        }
      }
      s.nodeType !== 9 && o(s) && t.push(s);
    }
  }
  return t;
}
function ks() {
  if (window.getSelection) return window.getSelection().toString();
  if (document.getSelection) return document.getSelection().toString();
}
function wt(e) {
  if (e) {
    let t = e.offsetWidth, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingLeft) + parseFloat(n.paddingRight) + parseFloat(n.borderLeftWidth) + parseFloat(n.borderRightWidth), t;
  }
  return 0;
}
function Es() {
  return /(android)/i.test(navigator.userAgent);
}
function wn() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function Ls(e, t = "") {
  return ie(e) ? e.matches(`button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [href][clientHeight][clientWidth]:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t}`) : !1;
}
function As(e) {
  return !!(e && e.offsetParent != null);
}
function js() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}
function So(e, t = "", n) {
  ie(e) && n !== null && n !== void 0 && e.setAttribute(t, n);
}
var Le = {};
function $o(e = "pui_id_") {
  return Object.hasOwn(Le, e) || (Le[e] = 0), Le[e]++, `${e}${Le[e]}`;
}
function wo() {
  let e = [], t = (a, l, i = 999) => {
    let u = o(a, l, i), c = u.value + (u.key === a ? 0 : i) + 1;
    return e.push({ key: a, value: c }), c;
  }, n = (a) => {
    e = e.filter((l) => l.value !== a);
  }, r = (a, l) => o(a).value, o = (a, l, i = 0) => [...e].reverse().find((u) => !0) || { key: a, value: i }, s = (a) => a && parseInt(a.style.zIndex, 10) || 0;
  return { get: s, set: (a, l, i) => {
    l && (l.style.zIndex = String(t(a, !0, i)));
  }, clear: (a) => {
    a && (n(s(a)), a.style.zIndex = "");
  }, getCurrent: (a) => r(a) };
}
var Ns = wo(), To = Object.defineProperty, Co = Object.defineProperties, xo = Object.getOwnPropertyDescriptors, Me = Object.getOwnPropertySymbols, Tn = Object.prototype.hasOwnProperty, Cn = Object.prototype.propertyIsEnumerable, Tt = (e, t, n) => t in e ? To(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, V = (e, t) => {
  for (var n in t || (t = {})) Tn.call(t, n) && Tt(e, n, t[n]);
  if (Me) for (var n of Me(t)) Cn.call(t, n) && Tt(e, n, t[n]);
  return e;
}, ze = (e, t) => Co(e, xo(t)), U = (e, t) => {
  var n = {};
  for (var r in e) Tn.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
  if (e != null && Me) for (var r of Me(e)) t.indexOf(r) < 0 && Cn.call(e, r) && (n[r] = e[r]);
  return n;
}, Po = ut(), L = Po, ye = /{([^}]*)}/g, xn = /(\d+\s+[\+\-\*\/]\s+\d+)/g, Pn = /var\([^)]+\)/g;
function Ct(e) {
  return j(e) ? e.replace(/[A-Z]/g, (t, n) => n === 0 ? t : "." + t.toLowerCase()).toLowerCase() : e;
}
function Oo(e) {
  return W(e) && e.hasOwnProperty("$value") && e.hasOwnProperty("$type") ? e.$value : e;
}
function ko(e) {
  return e.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function Xe(e = "", t = "") {
  return ko(`${j(e, !1) && j(t, !1) ? `${e}-` : e}${t}`);
}
function On(e = "", t = "") {
  return `--${Xe(e, t)}`;
}
function Eo(e = "") {
  let t = (e.match(/{/g) || []).length, n = (e.match(/}/g) || []).length;
  return (t + n) % 2 !== 0;
}
function kn(e, t = "", n = "", r = [], o) {
  if (j(e)) {
    let s = e.trim();
    if (Eo(s)) return;
    if (re(s, ye)) {
      let a = s.replaceAll(ye, (l) => {
        let i = l.replace(/{|}/g, "").split(".").filter((u) => !r.some((c) => re(u, c)));
        return `var(${On(n, gn(i.join("-")))}${x(o) ? `, ${o}` : ""})`;
      });
      return re(a.replace(Pn, "0"), xn) ? `calc(${a})` : a;
    }
    return s;
  } else if (ro(e)) return e;
}
function Lo(e, t, n) {
  j(t, !1) && e.push(`${t}:${n};`);
}
function de(e, t) {
  return e ? `${e}{${t}}` : "";
}
function En(e, t) {
  if (e.indexOf("dt(") === -1) return e;
  function n(a, l) {
    let i = [], u = 0, c = "", d = null, m = 0;
    for (; u <= a.length; ) {
      let p = a[u];
      if ((p === '"' || p === "'" || p === "`") && a[u - 1] !== "\\" && (d = d === p ? null : p), !d && (p === "(" && m++, p === ")" && m--, (p === "," || u === a.length) && m === 0)) {
        let f = c.trim();
        f.startsWith("dt(") ? i.push(En(f, l)) : i.push(r(f)), c = "", u++;
        continue;
      }
      p !== void 0 && (c += p), u++;
    }
    return i;
  }
  function r(a) {
    let l = a[0];
    if ((l === '"' || l === "'" || l === "`") && a[a.length - 1] === l) return a.slice(1, -1);
    let i = Number(a);
    return isNaN(i) ? a : i;
  }
  let o = [], s = [];
  for (let a = 0; a < e.length; a++) if (e[a] === "d" && e.slice(a, a + 3) === "dt(") s.push(a), a += 2;
  else if (e[a] === ")" && s.length > 0) {
    let l = s.pop();
    s.length === 0 && o.push([l, a]);
  }
  if (!o.length) return e;
  for (let a = o.length - 1; a >= 0; a--) {
    let [l, i] = o[a], u = e.slice(l + 3, i), c = n(u, t), d = t(...c);
    e = e.slice(0, l) + d + e.slice(i + 1);
  }
  return e;
}
var Is = (e) => {
  var t;
  let n = C.getTheme(), r = et(n, e, void 0, "variable"), o = (t = r?.match(/--[\w-]+/g)) == null ? void 0 : t[0], s = et(n, e, void 0, "value");
  return { name: o, variable: r, value: s };
}, oe = (...e) => et(C.getTheme(), ...e), et = (e = {}, t, n, r) => {
  if (t) {
    let { variable: o, options: s } = C.defaults || {}, { prefix: a, transform: l } = e?.options || s || {}, i = re(t, ye) ? t : `{${t}}`;
    return r === "value" || Pe(r) && l === "strict" ? C.getTokenValue(t) : kn(i, void 0, a, [o.excludedKeyRegex], n);
  }
  return "";
};
function Ae(e, ...t) {
  if (e instanceof Array) {
    let n = e.reduce((r, o, s) => {
      var a;
      return r + o + ((a = N(t[s], { dt: oe })) != null ? a : "");
    }, "");
    return En(n, oe);
  }
  return N(e, { dt: oe });
}
function Ao(e, t = {}) {
  let n = C.defaults.variable, { prefix: r = n.prefix, selector: o = n.selector, excludedKeyRegex: s = n.excludedKeyRegex } = t, a = [], l = [], i = [{ node: e, path: r }];
  for (; i.length; ) {
    let { node: c, path: d } = i.pop();
    for (let m in c) {
      let p = c[m], f = Oo(p), v = re(m, s) ? Xe(d) : Xe(d, gn(m));
      if (W(f)) i.push({ node: f, path: v });
      else {
        let g = On(v), y = kn(f, v, r, [s]);
        Lo(l, g, y);
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
  return Ao(e, { prefix: t?.prefix });
}, getCommon({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var s, a, l, i, u, c, d;
  let { preset: m, options: p } = t, f, v, g, y, _, $, h;
  if (x(m) && p.transform !== "strict") {
    let { primitive: b, semantic: k, extend: E } = m, z = k || {}, { colorScheme: K } = z, Q = U(z, ["colorScheme"]), Y = E || {}, { colorScheme: Z } = Y, X = U(Y, ["colorScheme"]), q = K || {}, { dark: ee } = q, se = U(q, ["dark"]), te = Z || {}, { dark: ae } = te, le = U(te, ["dark"]), B = x(b) ? this._toVariables({ primitive: b }, p) : {}, D = x(Q) ? this._toVariables({ semantic: Q }, p) : {}, ne = x(se) ? this._toVariables({ light: se }, p) : {}, Oe = x(ee) ? this._toVariables({ dark: ee }, p) : {}, ue = x(X) ? this._toVariables({ semantic: X }, p) : {}, mt = x(le) ? this._toVariables({ light: le }, p) : {}, pt = x(ae) ? this._toVariables({ dark: ae }, p) : {}, [Dn, Mn] = [(s = B.declarations) != null ? s : "", B.tokens], [Wn, Bn] = [(a = D.declarations) != null ? a : "", D.tokens || []], [Hn, Un] = [(l = ne.declarations) != null ? l : "", ne.tokens || []], [Fn, zn] = [(i = Oe.declarations) != null ? i : "", Oe.tokens || []], [Kn, Yn] = [(u = ue.declarations) != null ? u : "", ue.tokens || []], [qn, Gn] = [(c = mt.declarations) != null ? c : "", mt.tokens || []], [Jn, Qn] = [(d = pt.declarations) != null ? d : "", pt.tokens || []];
    f = this.transformCSS(e, Dn, "light", "variable", p, r, o), v = Mn;
    let Zn = this.transformCSS(e, `${Wn}${Hn}`, "light", "variable", p, r, o), Xn = this.transformCSS(e, `${Fn}`, "dark", "variable", p, r, o);
    g = `${Zn}${Xn}`, y = [.../* @__PURE__ */ new Set([...Bn, ...Un, ...zn])];
    let er = this.transformCSS(e, `${Kn}${qn}color-scheme:light`, "light", "variable", p, r, o), tr = this.transformCSS(e, `${Jn}color-scheme:dark`, "dark", "variable", p, r, o);
    _ = `${er}${tr}`, $ = [.../* @__PURE__ */ new Set([...Yn, ...Gn, ...Qn])], h = N(m.css, { dt: oe });
  }
  return { primitive: { css: f, tokens: v }, semantic: { css: g, tokens: y }, global: { css: _, tokens: $ }, style: h };
}, getPreset({ name: e = "", preset: t = {}, options: n, params: r, set: o, defaults: s, selector: a }) {
  var l, i, u;
  let c, d, m;
  if (x(t) && n.transform !== "strict") {
    let p = e.replace("-directive", ""), f = t, { colorScheme: v, extend: g, css: y } = f, _ = U(f, ["colorScheme", "extend", "css"]), $ = g || {}, { colorScheme: h } = $, b = U($, ["colorScheme"]), k = v || {}, { dark: E } = k, z = U(k, ["dark"]), K = h || {}, { dark: Q } = K, Y = U(K, ["dark"]), Z = x(_) ? this._toVariables({ [p]: V(V({}, _), b) }, n) : {}, X = x(z) ? this._toVariables({ [p]: V(V({}, z), Y) }, n) : {}, q = x(E) ? this._toVariables({ [p]: V(V({}, E), Q) }, n) : {}, [ee, se] = [(l = Z.declarations) != null ? l : "", Z.tokens || []], [te, ae] = [(i = X.declarations) != null ? i : "", X.tokens || []], [le, B] = [(u = q.declarations) != null ? u : "", q.tokens || []], D = this.transformCSS(p, `${ee}${te}`, "light", "variable", n, o, s, a), ne = this.transformCSS(p, le, "dark", "variable", n, o, s, a);
    c = `${D}${ne}`, d = [.../* @__PURE__ */ new Set([...se, ...ae, ...B])], m = N(y, { dt: oe });
  }
  return { css: c, tokens: d, style: m };
}, getPresetC({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var s;
  let { preset: a, options: l } = t, i = (s = a?.components) == null ? void 0 : s[e];
  return this.getPreset({ name: e, preset: i, options: l, params: n, set: r, defaults: o });
}, getPresetD({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var s, a;
  let l = e.replace("-directive", ""), { preset: i, options: u } = t, c = ((s = i?.components) == null ? void 0 : s[l]) || ((a = i?.directives) == null ? void 0 : a[l]);
  return this.getPreset({ name: l, preset: c, options: u, params: n, set: r, defaults: o });
}, applyDarkColorScheme(e) {
  return !(e.darkModeSelector === "none" || e.darkModeSelector === !1);
}, getColorSchemeOption(e, t) {
  var n;
  return this.applyDarkColorScheme(e) ? this.regex.resolve(e.darkModeSelector === !0 ? t.options.darkModeSelector : (n = e.darkModeSelector) != null ? n : t.options.darkModeSelector) : [];
}, getLayerOrder(e, t = {}, n, r) {
  let { cssLayer: o } = t;
  return o ? `@layer ${N(o.order || o.name || "primeui", n)}` : "";
}, getCommonStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: o, defaults: s }) {
  let a = this.getCommon({ name: e, theme: t, params: n, set: o, defaults: s }), l = Object.entries(r).reduce((i, [u, c]) => i.push(`${u}="${c}"`) && i, []).join(" ");
  return Object.entries(a || {}).reduce((i, [u, c]) => {
    if (W(c) && Object.hasOwn(c, "css")) {
      let d = ge(c.css), m = `${u}-variables`;
      i.push(`<style type="text/css" data-primevue-style-id="${m}" ${l}>${d}</style>`);
    }
    return i;
  }, []).join("");
}, getStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: o, defaults: s }) {
  var a;
  let l = { name: e, theme: t, params: n, set: o, defaults: s }, i = (a = e.includes("-directive") ? this.getPresetD(l) : this.getPresetC(l)) == null ? void 0 : a.css, u = Object.entries(r).reduce((c, [d, m]) => c.push(`${d}="${m}"`) && c, []).join(" ");
  return i ? `<style type="text/css" data-primevue-style-id="${e}-variables" ${u}>${ge(i)}</style>` : "";
}, createTokens(e = {}, t, n = "", r = "", o = {}) {
  let s = function(l, i = {}, u = []) {
    if (u.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: l, path: this.path, paths: i, value: void 0 };
    u.push(this.path), i.name = this.path, i.binding || (i.binding = {});
    let c = this.value;
    if (typeof this.value == "string" && ye.test(this.value)) {
      let d = this.value.trim().replace(ye, (m) => {
        var p;
        let f = m.slice(1, -1), v = this.tokens[f];
        if (!v) return console.warn(`Token not found for path: ${f}`), "__UNRESOLVED__";
        let g = v.computed(l, i, u);
        return Array.isArray(g) && g.length === 2 ? `light-dark(${g[0].value},${g[1].value})` : (p = g?.value) != null ? p : "__UNRESOLVED__";
      });
      c = xn.test(d.replace(Pn, "0")) ? `calc(${d})` : d;
    }
    return Pe(i.binding) && delete i.binding, u.pop(), { colorScheme: l, path: this.path, paths: i, value: c.includes("__UNRESOLVED__") ? void 0 : c };
  }, a = (l, i, u) => {
    Object.entries(l).forEach(([c, d]) => {
      let m = re(c, t.variable.excludedKeyRegex) ? i : i ? `${i}.${Ct(c)}` : Ct(c), p = u ? `${u}.${c}` : c;
      W(d) ? a(d, m, p) : (o[m] || (o[m] = { paths: [], computed: (f, v = {}, g = []) => {
        if (o[m].paths.length === 1) return o[m].paths[0].computed(o[m].paths[0].scheme, v.binding, g);
        if (f && f !== "none") for (let y = 0; y < o[m].paths.length; y++) {
          let _ = o[m].paths[y];
          if (_.scheme === f) return _.computed(f, v.binding, g);
        }
        return o[m].paths.map((y) => y.computed(y.scheme, v[y.scheme], g));
      } }), o[m].paths.push({ path: p, value: d, scheme: p.includes("colorScheme.light") ? "light" : p.includes("colorScheme.dark") ? "dark" : "none", computed: s, tokens: o }));
    });
  };
  return a(e, n, r), o;
}, getTokenValue(e, t, n) {
  var r;
  let o = ((l) => l.split(".").filter((i) => !re(i.toLowerCase(), n.variable.excludedKeyRegex)).join("."))(t), s = t.includes("colorScheme.light") ? "light" : t.includes("colorScheme.dark") ? "dark" : void 0, a = [(r = e[o]) == null ? void 0 : r.computed(s)].flat().filter((l) => l);
  return a.length === 1 ? a[0].value : a.reduce((l = {}, i) => {
    let u = i, { colorScheme: c } = u, d = U(u, ["colorScheme"]);
    return l[c] = d, l;
  }, void 0);
}, getSelectorRule(e, t, n, r) {
  return n === "class" || n === "attr" ? de(x(t) ? `${e}${t},${e} ${t}` : e, r) : de(e, de(t ?? ":root,:host", r));
}, transformCSS(e, t, n, r, o = {}, s, a, l) {
  if (x(t)) {
    let { cssLayer: i } = o;
    if (r !== "style") {
      let u = this.getColorSchemeOption(o, a);
      t = n === "dark" ? u.reduce((c, { type: d, selector: m }) => (x(m) && (c += m.includes("[CSS]") ? m.replace("[CSS]", t) : this.getSelectorRule(m, l, d, t)), c), "") : de(l ?? ":root,:host", t);
    }
    if (i) {
      let u = { name: "primeui" };
      W(i) && (u.name = N(i.name, { name: e, type: r })), x(u.name) && (t = de(`@layer ${u.name}`, t), s?.layerNames(u.name));
    }
    return t;
  }
  return "";
} }, C = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(e = {}) {
  let { theme: t } = e;
  t && (this._theme = ze(V({}, t), { options: V(V({}, this.defaults.options), t.options) }), this._tokens = R.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
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
  this.update({ theme: e }), L.emit("theme:change", e);
}, getPreset() {
  return this.preset;
}, setPreset(e) {
  this._theme = ze(V({}, this.theme), { preset: e }), this._tokens = R.createTokens(e, this.defaults), this.clearLoadedStyleNames(), L.emit("preset:change", e), L.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(e) {
  this._theme = ze(V({}, this.theme), { options: e }), this.clearLoadedStyleNames(), L.emit("options:change", e), L.emit("theme:change", this.theme);
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
  this._loadingStyles.size && (this._loadingStyles.delete(t), L.emit(`theme:${t}:load`, e), !this._loadingStyles.size && L.emit("theme:load"));
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
function xt(e, t) {
  var n = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (!n) {
    if (Array.isArray(e) || (n = jo(e)) || t) {
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
  var s, a = !0, l = !1;
  return { s: function() {
    n = n.call(e);
  }, n: function() {
    var u = n.next();
    return a = u.done, u;
  }, e: function(u) {
    l = !0, s = u;
  }, f: function() {
    try {
      a || n.return == null || n.return();
    } finally {
      if (l) throw s;
    }
  } };
}
function jo(e, t) {
  if (e) {
    if (typeof e == "string") return Pt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Pt(e, t) : void 0;
  }
}
function Pt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
var Rs = {
  filter: function(t, n, r, o, s) {
    var a = [];
    if (!t)
      return a;
    var l = xt(t), i;
    try {
      for (l.s(); !(i = l.n()).done; ) {
        var u = i.value;
        if (typeof u == "string") {
          if (this.filters[o](u, r, s)) {
            a.push(u);
            continue;
          }
        } else {
          var c = xt(n), d;
          try {
            for (c.s(); !(d = c.n()).done; ) {
              var m = d.value, p = Ge(u, m);
              if (this.filters[o](p, r, s)) {
                a.push(u);
                break;
              }
            }
          } catch (f) {
            c.e(f);
          } finally {
            c.f();
          }
        }
      }
    } catch (f) {
      l.e(f);
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
      var o = I(n.toString()).toLocaleLowerCase(r), s = I(t.toString()).toLocaleLowerCase(r);
      return s.slice(0, o.length) === o;
    },
    contains: function(t, n, r) {
      if (n == null || n === "")
        return !0;
      if (t == null)
        return !1;
      var o = I(n.toString()).toLocaleLowerCase(r), s = I(t.toString()).toLocaleLowerCase(r);
      return s.indexOf(o) !== -1;
    },
    notContains: function(t, n, r) {
      if (n == null || n === "")
        return !0;
      if (t == null)
        return !1;
      var o = I(n.toString()).toLocaleLowerCase(r), s = I(t.toString()).toLocaleLowerCase(r);
      return s.indexOf(o) === -1;
    },
    endsWith: function(t, n, r) {
      if (n == null || n === "")
        return !0;
      if (t == null)
        return !1;
      var o = I(n.toString()).toLocaleLowerCase(r), s = I(t.toString()).toLocaleLowerCase(r);
      return s.indexOf(o, s.length - o.length) !== -1;
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
        if (to(t, n[r]))
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
}, No = `
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
function be(e) {
  "@babel/helpers - typeof";
  return be = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, be(e);
}
function Ot(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function kt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Ot(Object(n), !0).forEach(function(r) {
      Io(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Ot(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Io(e, t, n) {
  return (t = Ro(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ro(e) {
  var t = Vo(e, "string");
  return be(t) == "symbol" ? t : t + "";
}
function Vo(e, t) {
  if (be(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (be(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function Do(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  ft() && ft().components ? Xt(e) : t ? e() : lr(e);
}
var Mo = 0;
function Wo(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = F(!1), r = F(e), o = F(null), s = wn() ? window.document : void 0, a = t.document, l = a === void 0 ? s : a, i = t.immediate, u = i === void 0 ? !0 : i, c = t.manual, d = c === void 0 ? !1 : c, m = t.name, p = m === void 0 ? "style_".concat(++Mo) : m, f = t.id, v = f === void 0 ? void 0 : f, g = t.media, y = g === void 0 ? void 0 : g, _ = t.nonce, $ = _ === void 0 ? void 0 : _, h = t.first, b = h === void 0 ? !1 : h, k = t.onMounted, E = k === void 0 ? void 0 : k, z = t.onUpdated, K = z === void 0 ? void 0 : z, Q = t.onLoad, Y = Q === void 0 ? void 0 : Q, Z = t.props, X = Z === void 0 ? {} : Z, q = function() {
  }, ee = function(ae) {
    var le = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (l) {
      var B = kt(kt({}, X), le), D = B.name || p, ne = B.id || v, Oe = B.nonce || $;
      o.value = l.querySelector('style[data-primevue-style-id="'.concat(D, '"]')) || l.getElementById(ne) || l.createElement("style"), o.value.isConnected || (r.value = ae || e, De(o.value, {
        type: "text/css",
        id: ne,
        media: y,
        nonce: Oe
      }), b ? l.head.prepend(o.value) : l.head.appendChild(o.value), So(o.value, "data-primevue-style-id", D), De(o.value, B), o.value.onload = function(ue) {
        return Y?.(ue, {
          name: D
        });
      }, E?.(D)), !n.value && (q = ce(r, function(ue) {
        o.value.textContent = ue, K?.(D);
      }, {
        immediate: !0
      }), n.value = !0);
    }
  }, se = function() {
    !l || !n.value || (q(), fo(o.value) && l.head.removeChild(o.value), n.value = !1, o.value = null);
  };
  return u && !d && Do(ee), {
    id: v,
    name: p,
    el: o,
    css: r,
    unload: se,
    load: ee,
    isLoaded: ar(n)
  };
}
function _e(e) {
  "@babel/helpers - typeof";
  return _e = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, _e(e);
}
var Et, Lt, At, jt;
function Nt(e, t) {
  return Fo(e) || Uo(e, t) || Ho(e, t) || Bo();
}
function Bo() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ho(e, t) {
  if (e) {
    if (typeof e == "string") return It(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? It(e, t) : void 0;
  }
}
function It(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Uo(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, o, s, a, l = [], i = !0, u = !1;
    try {
      if (s = (n = n.call(e)).next, t !== 0) for (; !(i = (r = s.call(n)).done) && (l.push(r.value), l.length !== t); i = !0) ;
    } catch (c) {
      u = !0, o = c;
    } finally {
      try {
        if (!i && n.return != null && (a = n.return(), Object(a) !== a)) return;
      } finally {
        if (u) throw o;
      }
    }
    return l;
  }
}
function Fo(e) {
  if (Array.isArray(e)) return e;
}
function Rt(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Ke(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Rt(Object(n), !0).forEach(function(r) {
      zo(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Rt(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function zo(e, t, n) {
  return (t = Ko(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ko(e) {
  var t = Yo(e, "string");
  return _e(t) == "symbol" ? t : t + "";
}
function Yo(e, t) {
  if (_e(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (_e(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function je(e, t) {
  return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var qo = function(t) {
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
}, Go = {}, Jo = {}, O = {
  name: "base",
  css: qo,
  style: No,
  classes: Go,
  inlineStyles: Jo,
  load: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(s) {
      return s;
    }, o = r(Ae(Et || (Et = je(["", ""])), t));
    return x(o) ? Wo(ge(o), Ke({
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
      return C.transformCSS(n.name || t.name, "".concat(o).concat(Ae(Lt || (Lt = je(["", ""])), r)));
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
        dt: oe
      }) || "", o = ge(Ae(At || (At = je(["", "", ""])), r, t)), s = Object.entries(n).reduce(function(a, l) {
        var i = Nt(l, 2), u = i[0], c = i[1];
        return a.push("".concat(u, '="').concat(c, '"')) && a;
      }, []).join(" ");
      return x(o) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(s, ">").concat(o, "</style>") : "";
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
      var o = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), s = Ae(jt || (jt = je(["", ""])), N(this.style, {
        dt: oe
      })), a = ge(C.transformCSS(o, s)), l = Object.entries(n).reduce(function(i, u) {
        var c = Nt(u, 2), d = c[0], m = c[1];
        return i.push("".concat(d, '="').concat(m, '"')) && i;
      }, []).join(" ");
      x(a) && r.push('<style type="text/css" data-primevue-style-id="'.concat(o, '" ').concat(l, ">").concat(a, "</style>"));
    }
    return r.join("");
  },
  extend: function(t) {
    return Ke(Ke({}, this), {}, {
      css: void 0,
      style: void 0
    }, t);
  }
}, J = ut();
function Se(e) {
  "@babel/helpers - typeof";
  return Se = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Se(e);
}
function Vt(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Ne(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Vt(Object(n), !0).forEach(function(r) {
      Qo(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Vt(Object(n)).forEach(function(r) {
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
var ei = {
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
}, ti = Symbol();
function ni(e, t) {
  var n = {
    config: ur(t)
  };
  return e.config.globalProperties.$primevue = n, e.provide(ti, n), ri(), oi(e, n), n;
}
var me = [];
function ri() {
  L.clear(), me.forEach(function(e) {
    return e?.();
  }), me = [];
}
function oi(e, t) {
  var n = F(!1), r = function() {
    var u;
    if (((u = t.config) === null || u === void 0 ? void 0 : u.theme) !== "none" && !C.isStyleNameLoaded("common")) {
      var c, d, m = ((c = O.getCommonTheme) === null || c === void 0 ? void 0 : c.call(O)) || {}, p = m.primitive, f = m.semantic, v = m.global, g = m.style, y = {
        nonce: (d = t.config) === null || d === void 0 || (d = d.csp) === null || d === void 0 ? void 0 : d.nonce
      };
      O.load(p?.css, Ne({
        name: "primitive-variables"
      }, y)), O.load(f?.css, Ne({
        name: "semantic-variables"
      }, y)), O.load(v?.css, Ne({
        name: "global-variables"
      }, y)), O.loadStyle(Ne({
        name: "global-style"
      }, y), g), C.setLoadedStyleName("common");
    }
  };
  L.on("theme:change", function(i) {
    n.value || (e.config.globalProperties.$primevue.config.theme = i, n.value = !0);
  });
  var o = ce(t.config, function(i, u) {
    J.emit("config:change", {
      newValue: i,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), s = ce(function() {
    return t.config.ripple;
  }, function(i, u) {
    J.emit("config:ripple:change", {
      newValue: i,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), a = ce(function() {
    return t.config.theme;
  }, function(i, u) {
    n.value || C.setTheme(i), t.config.unstyled || r(), n.value = !1, J.emit("config:theme:change", {
      newValue: i,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !1
  }), l = ce(function() {
    return t.config.unstyled;
  }, function(i, u) {
    !i && t.config.theme && r(), J.emit("config:unstyled:change", {
      newValue: i,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  });
  me.push(o), me.push(s), me.push(a), me.push(l);
}
var ii = {
  install: function(t, n) {
    var r = oo(ei, n);
    ni(t, r);
  }
}, Ln = {
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
    this.mounted = wn();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function si(e, t, n, r, o, s) {
  return s.inline ? Ve(e.$slots, "default", {
    key: 0
  }) : o.mounted ? (en(), dr(tn, {
    key: 1,
    to: n.appendTo
  }, [Ve(e.$slots, "default")], 8, ["to"])) : nn("", !0);
}
Ln.render = si;
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
function ai() {
  var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pc", t = cr();
  return "".concat(e).concat(t.replace("v-", "").replaceAll("-", "_"));
}
var Dt = O.extend({
  name: "common"
});
function $e(e) {
  "@babel/helpers - typeof";
  return $e = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, $e(e);
}
function li(e) {
  return Nn(e) || ui(e) || jn(e) || An();
}
function ui(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function pe(e, t) {
  return Nn(e) || di(e, t) || jn(e, t) || An();
}
function An() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function jn(e, t) {
  if (e) {
    if (typeof e == "string") return tt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? tt(e, t) : void 0;
  }
}
function tt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function di(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, o, s, a, l = [], i = !0, u = !1;
    try {
      if (s = (n = n.call(e)).next, t === 0) {
        if (Object(n) !== n) return;
        i = !1;
      } else for (; !(i = (r = s.call(n)).done) && (l.push(r.value), l.length !== t); i = !0) ;
    } catch (c) {
      u = !0, o = c;
    } finally {
      try {
        if (!i && n.return != null && (a = n.return(), Object(a) !== a)) return;
      } finally {
        if (u) throw o;
      }
    }
    return l;
  }
}
function Nn(e) {
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
function w(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Mt(Object(n), !0).forEach(function(r) {
      fe(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Mt(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function fe(e, t, n) {
  return (t = ci(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ci(e) {
  var t = mi(e, "string");
  return $e(t) == "symbol" ? t : t + "";
}
function mi(e, t) {
  if ($e(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if ($e(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var pi = {
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
        L.off("theme:change", this._loadCoreStyles), t || (this._loadCoreStyles(), this._themeChangeListener(this._loadCoreStyles));
      }
    },
    dt: {
      immediate: !0,
      handler: function(t, n) {
        var r = this;
        L.off("theme:change", this._themeScopedListener), t ? (this._loadScopedThemeStyles(t), this._themeScopedListener = function() {
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
    var t, n, r, o, s, a, l, i, u, c, d, m = (t = this.pt) === null || t === void 0 ? void 0 : t._usept, p = m ? (n = this.pt) === null || n === void 0 || (n = n.originalValue) === null || n === void 0 ? void 0 : n[this.$.type.name] : void 0, f = m ? (r = this.pt) === null || r === void 0 || (r = r.value) === null || r === void 0 ? void 0 : r[this.$.type.name] : this.pt;
    (o = f || p) === null || o === void 0 || (o = o.hooks) === null || o === void 0 || (s = o.onBeforeCreate) === null || s === void 0 || s.call(o);
    var v = (a = this.$primevueConfig) === null || a === void 0 || (a = a.pt) === null || a === void 0 ? void 0 : a._usept, g = v ? (l = this.$primevue) === null || l === void 0 || (l = l.config) === null || l === void 0 || (l = l.pt) === null || l === void 0 ? void 0 : l.originalValue : void 0, y = v ? (i = this.$primevue) === null || i === void 0 || (i = i.config) === null || i === void 0 || (i = i.pt) === null || i === void 0 ? void 0 : i.value : (u = this.$primevue) === null || u === void 0 || (u = u.config) === null || u === void 0 ? void 0 : u.pt;
    (c = y || g) === null || c === void 0 || (c = c[this.$.type.name]) === null || c === void 0 || (c = c.hooks) === null || c === void 0 || (d = c.onBeforeCreate) === null || d === void 0 || d.call(c), this.$attrSelector = ai(), this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
  },
  created: function() {
    this._hook("onCreated");
  },
  beforeMount: function() {
    var t;
    this.rootEl = _n(ie(this.$el) ? this.$el : (t = this.$el) === null || t === void 0 ? void 0 : t.parentElement, "[".concat(this.$attrSelector, "]")), this.rootEl && (this.rootEl.$pc = w({
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
      return Ue(t) ? t.apply(void 0, r) : he.apply(void 0, r);
    },
    _load: function() {
      G.isStyleNameLoaded("base") || (O.loadCSS(this.$styleOptions), this._loadGlobalStyles(), G.setLoadedStyleName("base")), this._loadThemeStyles();
    },
    _loadStyles: function() {
      this._load(), this._themeChangeListener(this._load);
    },
    _loadCoreStyles: function() {
      var t, n;
      !G.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name && (Dt.loadCSS(this.$styleOptions), this.$options.style && this.$style.loadCSS(this.$styleOptions), G.setLoadedStyleName(this.$style.name));
    },
    _loadGlobalStyles: function() {
      var t = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
      x(t) && O.load(t, w({
        name: "global"
      }, this.$styleOptions));
    },
    _loadThemeStyles: function() {
      var t, n;
      if (!(this.isUnstyled || this.$theme === "none")) {
        if (!C.isStyleNameLoaded("common")) {
          var r, o, s = ((r = this.$style) === null || r === void 0 || (o = r.getCommonTheme) === null || o === void 0 ? void 0 : o.call(r)) || {}, a = s.primitive, l = s.semantic, i = s.global, u = s.style;
          O.load(a?.css, w({
            name: "primitive-variables"
          }, this.$styleOptions)), O.load(l?.css, w({
            name: "semantic-variables"
          }, this.$styleOptions)), O.load(i?.css, w({
            name: "global-variables"
          }, this.$styleOptions)), O.loadStyle(w({
            name: "global-style"
          }, this.$styleOptions), u), C.setLoadedStyleName("common");
        }
        if (!C.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name) {
          var c, d, m, p, f = ((c = this.$style) === null || c === void 0 || (d = c.getComponentTheme) === null || d === void 0 ? void 0 : d.call(c)) || {}, v = f.css, g = f.style;
          (m = this.$style) === null || m === void 0 || m.load(v, w({
            name: "".concat(this.$style.name, "-variables")
          }, this.$styleOptions)), (p = this.$style) === null || p === void 0 || p.loadStyle(w({
            name: "".concat(this.$style.name, "-style")
          }, this.$styleOptions), g), C.setLoadedStyleName(this.$style.name);
        }
        if (!C.isStyleNameLoaded("layer-order")) {
          var y, _, $ = (y = this.$style) === null || y === void 0 || (_ = y.getLayerOrderThemeCSS) === null || _ === void 0 ? void 0 : _.call(y);
          O.load($, w({
            name: "layer-order",
            first: !0
          }, this.$styleOptions)), C.setLoadedStyleName("layer-order");
        }
      }
    },
    _loadScopedThemeStyles: function(t) {
      var n, r, o, s = ((n = this.$style) === null || n === void 0 || (r = n.getPresetTheme) === null || r === void 0 ? void 0 : r.call(n, t, "[".concat(this.$attrSelector, "]"))) || {}, a = s.css, l = (o = this.$style) === null || o === void 0 ? void 0 : o.load(a, w({
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
      G.clearLoadedStyleNames(), L.on("theme:change", t);
    },
    _removeThemeListeners: function() {
      L.off("theme:change", this._loadCoreStyles), L.off("theme:change", this._load), L.off("theme:change", this._themeScopedListener);
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
      return lt(t, n, r);
    },
    _getPTValue: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, s = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, a = /./g.test(r) && !!o[r.split(".")[0]], l = this._getPropValue("ptOptions") || ((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.ptOptions) || {}, i = l.mergeSections, u = i === void 0 ? !0 : i, c = l.mergeProps, d = c === void 0 ? !1 : c, m = s ? a ? this._useGlobalPT(this._getPTClassValue, r, o) : this._useDefaultPT(this._getPTClassValue, r, o) : void 0, p = a ? void 0 : this._getPTSelf(n, this._getPTClassValue, r, w(w({}, o), {}, {
        global: m || {}
      })), f = this._getPTDatasets(r);
      return u || !u && p ? d ? this._mergeProps(d, m, p, f) : w(w(w({}, m), p), f) : w(w({}, p), f);
    },
    _getPTSelf: function() {
      for (var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), o = 1; o < n; o++)
        r[o - 1] = arguments[o];
      return he(
        this._usePT.apply(this, [this._getPT(t, this.$name)].concat(r)),
        // Exp; <component :pt="{}"
        this._usePT.apply(this, [this.$_attrsPT].concat(r))
        // Exp; <component :pt:[passthrough_key]:[attribute]="{value}" or <component :pt:[passthrough_key]="() =>{value}"
      );
    },
    _getPTDatasets: function() {
      var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", o = "data-pc-", s = r === "root" && x((t = this.pt) === null || t === void 0 ? void 0 : t["data-pc-section"]);
      return r !== "transition" && w(w({}, r === "root" && w(w(fe({}, "".concat(o, "name"), M(s ? (n = this.pt) === null || n === void 0 ? void 0 : n["data-pc-section"] : this.$.type.name)), s && fe({}, "".concat(o, "extend"), M(this.$.type.name))), {}, fe({}, "".concat(this.$attrSelector), ""))), {}, fe({}, "".concat(o, "section"), M(r)));
    },
    _getPTClassValue: function() {
      var t = this._getOptionValue.apply(this, arguments);
      return j(t) || hn(t) ? {
        class: t
      } : t;
    },
    _getPT: function(t) {
      var n = this, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 ? arguments[2] : void 0, s = function(l) {
        var i, u = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, c = o ? o(l) : l, d = M(r), m = M(n.$name);
        return (i = u ? d !== m ? c?.[d] : void 0 : c?.[d]) !== null && i !== void 0 ? i : c;
      };
      return t != null && t.hasOwnProperty("_usept") ? {
        _usept: t._usept,
        originalValue: s(t.originalValue),
        value: s(t.value)
      } : s(t, !0);
    },
    _usePT: function(t, n, r, o) {
      var s = function(v) {
        return n(v, r, o);
      };
      if (t != null && t.hasOwnProperty("_usept")) {
        var a, l = t._usept || ((a = this.$primevueConfig) === null || a === void 0 ? void 0 : a.ptOptions) || {}, i = l.mergeSections, u = i === void 0 ? !0 : i, c = l.mergeProps, d = c === void 0 ? !1 : c, m = s(t.originalValue), p = s(t.value);
        return m === void 0 && p === void 0 ? void 0 : j(p) ? p : j(m) ? m : u || !u && p ? d ? this._mergeProps(d, m, p) : w(w({}, m), p) : p;
      }
      return s(t);
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
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = he(this.$_attrsWithoutPT, this.ptm(n, r));
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
        var o = this._getOptionValue(this.$style.inlineStyles, t, w(w({}, this.$params), r)), s = this._getOptionValue(Dt.inlineStyles, t, w(w({}, this.$params), r));
        return [s, o];
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
        var o = pe(r, 1), s = o[0];
        return n?.includes(s);
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
        var r = pe(n, 2), o = r[0], s = r[1], a = o.split(":"), l = li(a), i = tt(l).slice(1);
        return i?.reduce(function(u, c, d, m) {
          return !u[c] && (u[c] = d === m.length - 1 ? s : {}), u[c];
        }, t), t;
      }, {});
    },
    $_attrsWithoutPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(t) {
        var n = pe(t, 1), r = n[0];
        return !(r != null && r.startsWith("pt:"));
      }).reduce(function(t, n) {
        var r = pe(n, 2), o = r[0], s = r[1];
        return t[o] = s, t;
      }, {});
    }
  }
}, fi = `
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
`, hi = {
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
O.extend({
  name: "contextmenu",
  style: fi,
  classes: hi
});
var gi = `
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
`, vi = O.extend({
  name: "baseicon",
  css: gi
});
function we(e) {
  "@babel/helpers - typeof";
  return we = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, we(e);
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
function Bt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Wt(Object(n), !0).forEach(function(r) {
      yi(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Wt(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function yi(e, t, n) {
  return (t = bi(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function bi(e) {
  var t = _i(e, "string");
  return we(t) == "symbol" ? t : t + "";
}
function _i(e, t) {
  if (we(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (we(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Si = {
  name: "BaseIcon",
  extends: pi,
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
  style: vi,
  provide: function() {
    return {
      $pcIcon: this,
      $parentInstance: this
    };
  },
  methods: {
    pti: function() {
      var t = Pe(this.label);
      return Bt(Bt({}, !this.isUnstyled && {
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
}, $i = {
  name: "AngleRightIcon",
  extends: Si
};
function wi(e) {
  return Pi(e) || xi(e) || Ci(e) || Ti();
}
function Ti() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ci(e, t) {
  if (e) {
    if (typeof e == "string") return nt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? nt(e, t) : void 0;
  }
}
function xi(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Pi(e) {
  if (Array.isArray(e)) return nt(e);
}
function nt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Oi(e, t, n, r, o, s) {
  return en(), mr("svg", he({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), wi(t[0] || (t[0] = [pr("path", {
    d: "M5.25 11.1728C5.14929 11.1694 5.05033 11.1455 4.9592 11.1025C4.86806 11.0595 4.78666 10.9984 4.72 10.9228C4.57955 10.7822 4.50066 10.5916 4.50066 10.3928C4.50066 10.1941 4.57955 10.0035 4.72 9.86283L7.72 6.86283L4.72 3.86283C4.66067 3.71882 4.64765 3.55991 4.68275 3.40816C4.71785 3.25642 4.79932 3.11936 4.91585 3.01602C5.03238 2.91268 5.17819 2.84819 5.33305 2.83149C5.4879 2.81479 5.64411 2.84671 5.78 2.92283L9.28 6.42283C9.42045 6.56346 9.49934 6.75408 9.49934 6.95283C9.49934 7.15158 9.42045 7.34221 9.28 7.48283L5.78 10.9228C5.71333 10.9984 5.63193 11.0595 5.5408 11.1025C5.44966 11.1455 5.35071 11.1694 5.25 11.1728Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
$i.render = Oi;
function Te(e) {
  "@babel/helpers - typeof";
  return Te = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Te(e);
}
function Ht(e, t) {
  return Ai(e) || Li(e, t) || Ei(e, t) || ki();
}
function ki() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ei(e, t) {
  if (e) {
    if (typeof e == "string") return Ut(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ut(e, t) : void 0;
  }
}
function Ut(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Li(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, o, s, a, l = [], i = !0, u = !1;
    try {
      if (s = (n = n.call(e)).next, t !== 0) for (; !(i = (r = s.call(n)).done) && (l.push(r.value), l.length !== t); i = !0) ;
    } catch (c) {
      u = !0, o = c;
    } finally {
      try {
        if (!i && n.return != null && (a = n.return(), Object(a) !== a)) return;
      } finally {
        if (u) throw o;
      }
    }
    return l;
  }
}
function Ai(e) {
  if (Array.isArray(e)) return e;
}
function Ft(e, t) {
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
    t % 2 ? Ft(Object(n), !0).forEach(function(r) {
      rt(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Ft(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function rt(e, t, n) {
  return (t = ji(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ji(e) {
  var t = Ni(e, "string");
  return Te(t) == "symbol" ? t : t + "";
}
function Ni(e, t) {
  if (Te(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Te(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var S = {
  _getMeta: function() {
    return [W(arguments.length <= 0 ? void 0 : arguments[0]) || arguments.length <= 0 ? void 0 : arguments[0], N(W(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getConfig: function(t, n) {
    var r, o, s;
    return (r = (t == null || (o = t.instance) === null || o === void 0 ? void 0 : o.$primevue) || (n == null || (s = n.ctx) === null || s === void 0 || (s = s.appContext) === null || s === void 0 || (s = s.config) === null || s === void 0 || (s = s.globalProperties) === null || s === void 0 ? void 0 : s.$primevue)) === null || r === void 0 ? void 0 : r.config;
  },
  _getOptionValue: lt,
  _getPTValue: function() {
    var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, s = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", a = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, l = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, i = function() {
      var _ = S._getOptionValue.apply(S, arguments);
      return j(_) || hn(_) ? {
        class: _
      } : _;
    }, u = ((t = r.binding) === null || t === void 0 || (t = t.value) === null || t === void 0 ? void 0 : t.ptOptions) || ((n = r.$primevueConfig) === null || n === void 0 ? void 0 : n.ptOptions) || {}, c = u.mergeSections, d = c === void 0 ? !0 : c, m = u.mergeProps, p = m === void 0 ? !1 : m, f = l ? S._useDefaultPT(r, r.defaultPT(), i, s, a) : void 0, v = S._usePT(r, S._getPT(o, r.$name), i, s, T(T({}, a), {}, {
      global: f || {}
    })), g = S._getPTDatasets(r, s);
    return d || !d && v ? p ? S._mergeProps(r, p, f, v, g) : T(T(T({}, f), v), g) : T(T({}, v), g);
  },
  _getPTDatasets: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = "data-pc-";
    return T(T({}, n === "root" && rt({}, "".concat(r, "name"), M(t.$name))), {}, rt({}, "".concat(r, "section"), M(n)));
  },
  _getPT: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 ? arguments[2] : void 0, o = function(a) {
      var l, i = r ? r(a) : a, u = M(n);
      return (l = i?.[u]) !== null && l !== void 0 ? l : i;
    };
    return t && Object.hasOwn(t, "_usept") ? {
      _usept: t._usept,
      originalValue: o(t.originalValue),
      value: o(t.value)
    } : o(t);
  },
  _usePT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = arguments.length > 2 ? arguments[2] : void 0, o = arguments.length > 3 ? arguments[3] : void 0, s = arguments.length > 4 ? arguments[4] : void 0, a = function(g) {
      return r(g, o, s);
    };
    if (n && Object.hasOwn(n, "_usept")) {
      var l, i = n._usept || ((l = t.$primevueConfig) === null || l === void 0 ? void 0 : l.ptOptions) || {}, u = i.mergeSections, c = u === void 0 ? !0 : u, d = i.mergeProps, m = d === void 0 ? !1 : d, p = a(n.originalValue), f = a(n.value);
      return p === void 0 && f === void 0 ? void 0 : j(f) ? f : j(p) ? p : c || !c && f ? m ? S._mergeProps(t, m, p, f) : T(T({}, p), f) : f;
    }
    return a(n);
  },
  _useDefaultPT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 ? arguments[2] : void 0, o = arguments.length > 3 ? arguments[3] : void 0, s = arguments.length > 4 ? arguments[4] : void 0;
    return S._usePT(t, n, r, o, s);
  },
  _loadStyles: function() {
    var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 ? arguments[1] : void 0, o = arguments.length > 2 ? arguments[2] : void 0, s = S._getConfig(r, o), a = {
      nonce: s == null || (t = s.csp) === null || t === void 0 ? void 0 : t.nonce
    };
    S._loadCoreStyles(n, a), S._loadThemeStyles(n, a), S._loadScopedThemeStyles(n, a), S._removeThemeListeners(n), n.$loadStyles = function() {
      return S._loadThemeStyles(n, a);
    }, S._themeChangeListener(n.$loadStyles);
  },
  _loadCoreStyles: function() {
    var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 ? arguments[1] : void 0;
    if (!G.isStyleNameLoaded((t = r.$style) === null || t === void 0 ? void 0 : t.name) && (n = r.$style) !== null && n !== void 0 && n.name) {
      var s;
      O.loadCSS(o), (s = r.$style) === null || s === void 0 || s.loadCSS(o), G.setLoadedStyleName(r.$style.name);
    }
  },
  _loadThemeStyles: function() {
    var t, n, r, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, s = arguments.length > 1 ? arguments[1] : void 0;
    if (!(o != null && o.isUnstyled() || (o == null || (t = o.theme) === null || t === void 0 ? void 0 : t.call(o)) === "none")) {
      if (!C.isStyleNameLoaded("common")) {
        var a, l, i = ((a = o.$style) === null || a === void 0 || (l = a.getCommonTheme) === null || l === void 0 ? void 0 : l.call(a)) || {}, u = i.primitive, c = i.semantic, d = i.global, m = i.style;
        O.load(u?.css, T({
          name: "primitive-variables"
        }, s)), O.load(c?.css, T({
          name: "semantic-variables"
        }, s)), O.load(d?.css, T({
          name: "global-variables"
        }, s)), O.loadStyle(T({
          name: "global-style"
        }, s), m), C.setLoadedStyleName("common");
      }
      if (!C.isStyleNameLoaded((n = o.$style) === null || n === void 0 ? void 0 : n.name) && (r = o.$style) !== null && r !== void 0 && r.name) {
        var p, f, v, g, y = ((p = o.$style) === null || p === void 0 || (f = p.getDirectiveTheme) === null || f === void 0 ? void 0 : f.call(p)) || {}, _ = y.css, $ = y.style;
        (v = o.$style) === null || v === void 0 || v.load(_, T({
          name: "".concat(o.$style.name, "-variables")
        }, s)), (g = o.$style) === null || g === void 0 || g.loadStyle(T({
          name: "".concat(o.$style.name, "-style")
        }, s), $), C.setLoadedStyleName(o.$style.name);
      }
      if (!C.isStyleNameLoaded("layer-order")) {
        var h, b, k = (h = o.$style) === null || h === void 0 || (b = h.getLayerOrderThemeCSS) === null || b === void 0 ? void 0 : b.call(h);
        O.load(k, T({
          name: "layer-order",
          first: !0
        }, s)), C.setLoadedStyleName("layer-order");
      }
    }
  },
  _loadScopedThemeStyles: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = t.preset();
    if (r && t.$attrSelector) {
      var o, s, a, l = ((o = t.$style) === null || o === void 0 || (s = o.getPresetTheme) === null || s === void 0 ? void 0 : s.call(o, r, "[".concat(t.$attrSelector, "]"))) || {}, i = l.css, u = (a = t.$style) === null || a === void 0 ? void 0 : a.load(i, T({
        name: "".concat(t.$attrSelector, "-").concat(t.$style.name)
      }, n));
      t.scopedStyleEl = u.el;
    }
  },
  _themeChangeListener: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
    };
    G.clearLoadedStyleNames(), L.on("theme:change", t);
  },
  _removeThemeListeners: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    L.off("theme:change", t.$loadStyles), t.$loadStyles = void 0;
  },
  _hook: function(t, n, r, o, s, a) {
    var l, i, u = "on".concat(io(n)), c = S._getConfig(o, s), d = r?.$instance, m = S._usePT(d, S._getPT(o == null || (l = o.value) === null || l === void 0 ? void 0 : l.pt, t), S._getOptionValue, "hooks.".concat(u)), p = S._useDefaultPT(d, c == null || (i = c.pt) === null || i === void 0 || (i = i.directives) === null || i === void 0 ? void 0 : i[t], S._getOptionValue, "hooks.".concat(u)), f = {
      el: r,
      binding: o,
      vnode: s,
      prevVnode: a
    };
    m?.(d, f), p?.(d, f);
  },
  /* eslint-disable-next-line no-unused-vars */
  _mergeProps: function() {
    for (var t = arguments.length > 1 ? arguments[1] : void 0, n = arguments.length, r = new Array(n > 2 ? n - 2 : 0), o = 2; o < n; o++)
      r[o - 2] = arguments[o];
    return Ue(t) ? t.apply(void 0, r) : he.apply(void 0, r);
  },
  _extend: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = function(l, i, u, c, d) {
      var m, p, f, v;
      i._$instances = i._$instances || {};
      var g = S._getConfig(u, c), y = i._$instances[t] || {}, _ = Pe(y) ? T(T({}, n), n?.methods) : {};
      i._$instances[t] = T(T({}, y), {}, {
        /* new instance variables to pass in directive methods */
        $name: t,
        $host: i,
        $binding: u,
        $modifiers: u?.modifiers,
        $value: u?.value,
        $el: y.$el || i || void 0,
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
        $attrSelector: (m = i.$pd) === null || m === void 0 || (m = m[t]) === null || m === void 0 ? void 0 : m.attrSelector,
        /* computed instance variables */
        defaultPT: function() {
          return S._getPT(g?.pt, void 0, function(h) {
            var b;
            return h == null || (b = h.directives) === null || b === void 0 ? void 0 : b[t];
          });
        },
        isUnstyled: function() {
          var h, b;
          return ((h = i._$instances[t]) === null || h === void 0 || (h = h.$binding) === null || h === void 0 || (h = h.value) === null || h === void 0 ? void 0 : h.unstyled) !== void 0 ? (b = i._$instances[t]) === null || b === void 0 || (b = b.$binding) === null || b === void 0 || (b = b.value) === null || b === void 0 ? void 0 : b.unstyled : g?.unstyled;
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
          var h, b = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", k = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return S._getPTValue(i._$instances[t], (h = i._$instances[t]) === null || h === void 0 || (h = h.$binding) === null || h === void 0 || (h = h.value) === null || h === void 0 ? void 0 : h.pt, b, T({}, k));
        },
        ptmo: function() {
          var h = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, b = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", k = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return S._getPTValue(i._$instances[t], h, b, k, !1);
        },
        cx: function() {
          var h, b, k = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", E = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return (h = i._$instances[t]) !== null && h !== void 0 && h.isUnstyled() ? void 0 : S._getOptionValue((b = i._$instances[t]) === null || b === void 0 || (b = b.$style) === null || b === void 0 ? void 0 : b.classes, k, T({}, E));
        },
        sx: function() {
          var h, b = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", k = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, E = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return k ? S._getOptionValue((h = i._$instances[t]) === null || h === void 0 || (h = h.$style) === null || h === void 0 ? void 0 : h.inlineStyles, b, T({}, E)) : void 0;
        }
      }, _), i.$instance = i._$instances[t], (p = (f = i.$instance)[l]) === null || p === void 0 || p.call(f, i, u, c, d), i["$".concat(t)] = i.$instance, S._hook(t, l, i, u, c, d), i.$pd || (i.$pd = {}), i.$pd[t] = T(T({}, (v = i.$pd) === null || v === void 0 ? void 0 : v[t]), {}, {
        name: t,
        instance: i._$instances[t]
      });
    }, o = function(l) {
      var i, u, c, d = l._$instances[t], m = d?.watch, p = function(g) {
        var y, _ = g.newValue, $ = g.oldValue;
        return m == null || (y = m.config) === null || y === void 0 ? void 0 : y.call(d, _, $);
      }, f = function(g) {
        var y, _ = g.newValue, $ = g.oldValue;
        return m == null || (y = m["config.ripple"]) === null || y === void 0 ? void 0 : y.call(d, _, $);
      };
      d.$watchersCallback = {
        config: p,
        "config.ripple": f
      }, m == null || (i = m.config) === null || i === void 0 || i.call(d, d?.$primevueConfig), J.on("config:change", p), m == null || (u = m["config.ripple"]) === null || u === void 0 || u.call(d, d == null || (c = d.$primevueConfig) === null || c === void 0 ? void 0 : c.ripple), J.on("config:ripple:change", f);
    }, s = function(l) {
      var i = l._$instances[t].$watchersCallback;
      i && (J.off("config:change", i.config), J.off("config:ripple:change", i["config.ripple"]), l._$instances[t].$watchersCallback = void 0);
    };
    return {
      created: function(l, i, u, c) {
        l.$pd || (l.$pd = {}), l.$pd[t] = {
          name: t,
          attrSelector: $o("pd")
        }, r("created", l, i, u, c);
      },
      beforeMount: function(l, i, u, c) {
        var d;
        S._loadStyles((d = l.$pd[t]) === null || d === void 0 ? void 0 : d.instance, i, u), r("beforeMount", l, i, u, c), o(l);
      },
      mounted: function(l, i, u, c) {
        var d;
        S._loadStyles((d = l.$pd[t]) === null || d === void 0 ? void 0 : d.instance, i, u), r("mounted", l, i, u, c);
      },
      beforeUpdate: function(l, i, u, c) {
        r("beforeUpdate", l, i, u, c);
      },
      updated: function(l, i, u, c) {
        var d;
        S._loadStyles((d = l.$pd[t]) === null || d === void 0 ? void 0 : d.instance, i, u), r("updated", l, i, u, c);
      },
      beforeUnmount: function(l, i, u, c) {
        var d;
        s(l), S._removeThemeListeners((d = l.$pd[t]) === null || d === void 0 ? void 0 : d.instance), r("beforeUnmount", l, i, u, c);
      },
      unmounted: function(l, i, u, c) {
        var d;
        (d = l.$pd[t]) === null || d === void 0 || (d = d.instance) === null || d === void 0 || (d = d.scopedStyleEl) === null || d === void 0 || (d = d.value) === null || d === void 0 || d.remove(), r("unmounted", l, i, u, c);
      }
    };
  },
  extend: function() {
    var t = S._getMeta.apply(S, arguments), n = Ht(t, 2), r = n[0], o = n[1];
    return T({
      extend: function() {
        var a = S._getMeta.apply(S, arguments), l = Ht(a, 2), i = l[0], u = l[1];
        return S.extend(i, T(T(T({}, o), o?.methods), u));
      }
    }, S._extend(r, o));
  }
}, Ii = `
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
`, Ri = {
  root: "p-ink"
}, Vi = O.extend({
  name: "ripple-directive",
  style: Ii,
  classes: Ri
}), Di = S.extend({
  style: Vi
});
function Ce(e) {
  "@babel/helpers - typeof";
  return Ce = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ce(e);
}
function Mi(e) {
  return Ui(e) || Hi(e) || Bi(e) || Wi();
}
function Wi() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Bi(e, t) {
  if (e) {
    if (typeof e == "string") return ot(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? ot(e, t) : void 0;
  }
}
function Hi(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Ui(e) {
  if (Array.isArray(e)) return ot(e);
}
function ot(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function zt(e, t, n) {
  return (t = Fi(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Fi(e) {
  var t = zi(e, "string");
  return Ce(t) == "symbol" ? t : t + "";
}
function zi(e, t) {
  if (Ce(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Ce(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Vs = Di.extend("ripple", {
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
      n || (n = ho("span", zt(zt({
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
        if (!this.isUnstyled() && ve(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "false"), !$t(o) && !wt(o)) {
          var s = Math.max(po(r), bo(r));
          o.style.height = s + "px", o.style.width = s + "px";
        }
        var a = yo(r), l = t.pageX - a.left + document.body.scrollTop - wt(o) / 2, i = t.pageY - a.top + document.body.scrollLeft - $t(o) / 2;
        o.style.top = i + "px", o.style.left = l + "px", !this.isUnstyled() && Je(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "true"), this.timeout = setTimeout(function() {
          o && (!n.isUnstyled() && ve(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "false"));
        }, 401);
      }
    },
    onAnimationEnd: function(t) {
      this.timeout && clearTimeout(this.timeout), !this.isUnstyled() && ve(t.currentTarget, "p-ink-active"), t.currentTarget.setAttribute("data-p-ink-active", "false");
    },
    getInk: function(t) {
      return t && t.children ? Mi(t.children).find(function(n) {
        return vo(n, "data-pc-name") === "ripple";
      }) : void 0;
    }
  }
});
function xe(e) {
  "@babel/helpers - typeof";
  return xe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, xe(e);
}
function Ki(e, t) {
  if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
}
function Yi(e, t) {
  for (var n = 0; n < t.length; n++) {
    var r = t[n];
    r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, Gi(r.key), r);
  }
}
function qi(e, t, n) {
  return t && Yi(e.prototype, t), Object.defineProperty(e, "prototype", { writable: !1 }), e;
}
function Gi(e) {
  var t = Ji(e, "string");
  return xe(t) == "symbol" ? t : t + "";
}
function Ji(e, t) {
  if (xe(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (xe(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return String(e);
}
var Ds = /* @__PURE__ */ (function() {
  function e(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : function() {
    };
    Ki(this, e), this.element = t, this.listener = n;
  }
  return qi(e, [{
    key: "bindScrollListener",
    value: function() {
      this.scrollableParents = _o(this.element);
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
})(), Ms = ut(), Qi = `
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
`, Zi = {
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
  style: Qi,
  classes: Zi
});
const Xi = "data-wippy-overlay-layer";
function In() {
  return typeof window < "u" && typeof window.document < "u";
}
function Rn() {
  return In() && typeof HTMLElement < "u" && "popover" in HTMLElement.prototype;
}
function es() {
  return Rn() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const ts = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let ns = 0;
const We = /* @__PURE__ */ new WeakMap();
function Kt(e, t) {
  const n = e.style;
  n.setProperty("position", "fixed", "important"), n.setProperty("inset", "auto", "important"), n.setProperty("margin", "0", "important"), n.setProperty("position-anchor", t), n.setProperty("position-area", "bottom span-right"), n.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), n.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), n.setProperty("max-width", "stretch", "important");
}
function rs(e, t) {
  if (!ts.test(e.className))
    return;
  const n = e.style.cssText;
  Kt(e, t), e.getAttribute("popover") !== "manual" && e.setAttribute("popover", "manual");
  try {
    e.matches(":popover-open") || e.showPopover();
  } catch {
  }
  if (!e.matches(":popover-open")) {
    e.removeAttribute("popover"), e.style.cssText = n;
    return;
  }
  if (!We.has(e)) {
    const r = new MutationObserver(() => {
      const o = e.style;
      (o.top !== "auto" || o.left !== "auto" || o.margin !== "0px" || o.getPropertyPriority("top") !== "important" || o.getPropertyPriority("left") !== "important" || o.getPropertyPriority("margin") !== "important" || o.getPropertyPriority("min-width") !== "important" || o.maxWidth !== "stretch" || o.getPropertyPriority("max-width") !== "important") && Kt(e, t);
    });
    r.observe(e, { attributes: !0, attributeFilter: ["style"] }), We.set(e, r);
  }
}
function dt(e) {
  const t = We.get(e);
  t && (t.disconnect(), We.delete(e));
}
function os(e) {
  const t = e && typeof e.getRootNode == "function" ? e.getRootNode() : null;
  return t instanceof ShadowRoot ? t : null;
}
function it(e) {
  e.style.top = "0px", e.style.left = "0px";
  const t = e.getBoundingClientRect();
  e.style.top = `${-window.scrollY - t.top}px`, e.style.left = `${-window.scrollX - t.left}px`;
}
const Be = /* @__PURE__ */ new Set(), ct = /* @__PURE__ */ new WeakMap();
let Yt = !1, st = !1;
const qt = ["w-theme-dark", "w-theme-light"], Ie = "data-wippy-theme-root", at = /* @__PURE__ */ new WeakMap();
function is(e) {
  const t = [];
  let n = e ? e.parentNode : null;
  for (; n && n.nodeType === 1; )
    t.push(n), n = n.parentNode;
  return t;
}
function ss(e, t, n) {
  const r = [...is(t), n.host], o = () => {
    let a;
    for (const l of r) {
      if (qt.some((i) => l.classList.contains(i))) {
        a = l;
        break;
      }
      if (l.hasAttribute(Ie))
        break;
    }
    for (const l of qt)
      e.classList.toggle(l, !!(a && a.classList.contains(l)));
    a ? e.setAttribute(Ie, "") : e.removeAttribute(Ie);
  };
  o();
  const s = new MutationObserver(o);
  for (const a of r)
    s.observe(a, { attributes: !0, attributeFilter: ["class", Ie] });
  at.set(e, s);
}
function Vn(e) {
  at.get(e)?.disconnect(), at.delete(e);
}
function as() {
  st = !1;
  for (const e of Be) {
    if (!e.isConnected) {
      for (const t of Array.from(e.children))
        t instanceof HTMLElement && dt(t);
      Be.delete(e), ct.get(e)?.disconnect(), Vn(e);
      continue;
    }
    e.childElementCount > 0 && it(e);
  }
}
function Gt() {
  st || (st = !0, requestAnimationFrame(as));
}
function ls(e) {
  const t = document.createElement("div");
  t.setAttribute(Xi, "");
  const n = Rn();
  if (t.style.cssText = n ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", n && t.setAttribute("popover", "manual"), e.appendChild(t), n) {
    try {
      t.showPopover();
    } catch {
    }
    t.matches(":popover-open") || (t.removeAttribute("popover"), t.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  it(t);
  const r = new MutationObserver((o) => {
    const s = t.__wippyAnchorName;
    for (const a of o) {
      if (s)
        for (const l of Array.from(a.addedNodes))
          l instanceof HTMLElement && rs(l, s);
      for (const l of Array.from(a.removedNodes))
        l instanceof HTMLElement && dt(l);
    }
    t.isConnected && t.childElementCount > 0 && it(t);
  });
  return r.observe(t, { childList: !0 }), ct.set(t, r), Be.add(t), Yt || (Yt = !0, window.addEventListener("scroll", Gt, { capture: !0, passive: !0 }), window.addEventListener("resize", Gt, { passive: !0 })), t;
}
function Jt(e) {
  if (!(!e.hostRoot || e.layer) && (e.layer = ls(e.hostRoot), ss(e.layer, e.$el, e.hostRoot), es())) {
    const t = e.$el ? e.$el.parentElement : null;
    t && (e.anchorName = `--wippy-a-${++ns}`, e.anchorTrigger = t, t.style.setProperty("anchor-name", e.anchorName), e.layer.__wippyAnchorName = e.anchorName);
  }
}
function Qt(e) {
  if (e.anchorTrigger && (e.anchorTrigger.style.removeProperty("anchor-name"), e.anchorTrigger = null), e.anchorName = null, e.layer) {
    for (const t of Array.from(e.layer.children))
      t instanceof HTMLElement && dt(t);
    Be.delete(e.layer), ct.get(e.layer)?.disconnect(), Vn(e.layer), e.layer.remove(), e.layer = null;
  }
}
let Zt = !1;
function us() {
  if (Zt)
    return;
  Zt = !0;
  const e = Ln;
  e.computed = e.computed || {}, e.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, e.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, e.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, e.mounted = function() {
    In() && (this.hostRoot = os(this.$el), this.mounted = !0, this.hostRoot && (this.inline || Jt(this), this.$watch("inline", (t) => {
      t ? Qt(this) : Jt(this);
    })));
  }, e.render = function() {
    return this.inline ? Ve(this.$slots, "default", { key: 0 }) : this.mounted ? fr(tn, { key: 1, to: this.resolvedTarget || document.body }, [
      Ve(this.$slots, "default")
    ]) : nn("", !0);
  }, e.unmounted = function() {
    Qt(this);
  };
}
const Ws = {
  install: (e) => {
    us(), e.use(ii, { theme: "none" });
  }
};
export {
  Es as $,
  Ts as A,
  O as B,
  Ds as C,
  po as D,
  $s as E,
  Rs as F,
  Ge as G,
  Ls as I,
  bs as J,
  Os as L,
  ks as M,
  Ms as O,
  Ws as P,
  Vs as R,
  ws as S,
  $t as T,
  ho as U,
  vs as W,
  js as Y,
  So as _,
  Si as a,
  Pe as b,
  x as c,
  $i as d,
  xs as e,
  so as f,
  S as g,
  Ss as h,
  _s as i,
  Ln as j,
  Je as k,
  ps as l,
  hs as m,
  gs as n,
  As as o,
  Cs as p,
  wt as q,
  Is as r,
  pi as s,
  ys as t,
  fs as u,
  Ps as v,
  to as w,
  Ns as x,
  Sn as y,
  _n as z
};
//# sourceMappingURL=wc-runtime-C8fLLL_9.js.map
