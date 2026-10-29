import { hasInjectionContext as G, inject as w, effectScope as q, ref as v, markRaw as Q, createApp as X, onMounted as $, onUnmounted as Z, watch as A, defineComponent as tt, onBeforeUnmount as et, openBlock as V, createElementBlock as P, createElementVNode as N, nextTick as st } from "vue";
import { addCollection as it } from "@iconify/vue";
import { config as H, addIcons as nt, on as rt, applyThemeMode as E, host as ot, hostCss as at, loadCss as lt, loadByTagName as ct } from "@wippy-fe/proxy";
var L = "data-wippy-visible";
function j(t) {
  const s = t.getAttribute(L);
  return s === "true" ? !0 : s === "false" ? !1 : null;
}
var ut = Object.defineProperty, ht = (t, s, e) => s in t ? ut(t, s, { enumerable: !0, configurable: !0, writable: !0, value: e }) : t[s] = e, h = (t, s, e) => ht(t, typeof s != "symbol" ? s + "" : s, e), pt = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], dt = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function U(t) {
  const s = t.startsWith("--") ? t : `--${t}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(s) ? s : null;
}
function ft(...t) {
  const s = /* @__PURE__ */ new Set();
  for (const e of t)
    if (e)
      for (const [i, n] of Object.entries(e)) {
        if ((i === "@light" || i === "@dark") && n && typeof n == "object") {
          for (const [o, l] of Object.entries(n)) {
            const u = typeof l == "string" ? U(o) : null;
            u && s.add(u);
          }
          continue;
        }
        const r = typeof n == "string" ? U(i) : null;
        r && s.add(r);
      }
  return [...s].sort();
}
function _t(t) {
  if (t.length === 0)
    return "";
  const s = t.map((e) => `  ${e}: inherit;`).join(`
`);
  return `${dt} {
${s}
}`;
}
function mt(t, s) {
  const e = _t(s);
  e && B(t, e, "@wippy-fe/css-variables-bridge");
}
function bt(t, s) {
  const i = (s ?? pt).map(async (n) => {
    const r = at[n];
    if (!r)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${n}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await lt(r);
    } catch (o) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${n}" (${r}):`, o), null;
    }
  });
  return Promise.all(i).then((n) => {
    for (const r of n) {
      if (!r)
        continue;
      const o = document.createElement("style");
      o.textContent = r, o.setAttribute("role", "@wippy-fe/host-css"), t.appendChild(o);
    }
  });
}
function vt(t, s) {
  const e = document.createElement("style");
  e.textContent = s, t.appendChild(e);
}
function B(t, s, e) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const n = new CSSStyleSheet();
    n.replaceSync(s), t.adoptedStyleSheets = [...t.adoptedStyleSheets, n];
    return;
  }
  const i = document.createElement("style");
  i.setAttribute("role", e), i.textContent = s, t.appendChild(i);
}
function yt(t, s) {
  B(t, s, "@wippy-fe/custom-css");
}
function W(t) {
  return t.__wippyHost ?? null;
}
function gt(t) {
  return t.replace(/-([a-z])/g, (s, e) => e.toUpperCase());
}
function Ct(t, s, e) {
  switch (e.type) {
    case "string":
      return { value: s };
    case "number": {
      const i = Number.parseFloat(s);
      return Number.isNaN(i) ? { value: void 0, error: `Invalid ${t}: expected a number` } : { value: i };
    }
    case "integer": {
      const i = Number.parseInt(s, 10);
      return Number.isNaN(i) ? { value: void 0, error: `Invalid ${t}: expected an integer` } : { value: i };
    }
    case "boolean":
      return { value: s !== "false" };
    case "array":
    case "object":
      try {
        const i = JSON.parse(s);
        return e.type === "array" && !Array.isArray(i) ? { value: void 0, error: `Invalid ${t}: expected a JSON array` } : { value: i };
      } catch {
        return { value: void 0, error: `Invalid ${t}: must be valid JSON` };
      }
    default:
      return { value: s };
  }
}
function R(t, s) {
  const e = {}, i = [];
  for (const [n, r] of Object.entries(s.properties)) {
    const o = t.getAttribute(n), l = gt(n);
    if (o === null) {
      r.default !== void 0 && (e[l] = r.default);
      continue;
    }
    const u = Ct(n, o, r);
    u.error ? i.push(u.error) : e[l] = u.value;
  }
  return { props: e, errors: i };
}
var Et = class {
  constructor(t, s) {
    h(this, "_props"), h(this, "_errors"), h(this, "_content"), h(this, "_hostVisibility"), h(this, "_propsListeners", /* @__PURE__ */ new Set()), h(this, "_contentListeners", /* @__PURE__ */ new Set()), h(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), h(this, "_disposed", !1), h(this, "_emitToDom"), h(this, "props"), h(this, "events"), h(this, "content"), h(this, "hostVisibility"), this._props = t.props, this._errors = t.errors, this._content = t.content, this._hostVisibility = t.hostVisibility, this._emitToDom = s;
    const e = this;
    this.props = {
      get value() {
        return e._props;
      },
      get errors() {
        return e._errors;
      },
      subscribe(i, n) {
        return e._subscribeProps(i, n);
      }
    }, this.events = {
      emit(i, n) {
        e._disposed || e._emitToDom(i, n);
      }
    }, this.content = t.hasContent ? {
      get value() {
        return e._content;
      },
      subscribe(i, n) {
        return e._subscribeContent(i, n);
      }
    } : null, this.hostVisibility = {
      get value() {
        return e._hostVisibility;
      },
      subscribe(i, n) {
        return e._subscribeHostVisibility(i, n);
      }
    };
  }
  /** @internal */
  notifyProps(t, s) {
    if (!this._disposed) {
      this._props = t, this._errors = s;
      for (const e of this._propsListeners)
        e(t, s);
    }
  }
  /** @internal */
  notifyContent(t) {
    if (!this._disposed) {
      this._content = t;
      for (const s of this._contentListeners)
        s(t);
    }
  }
  /** @internal */
  notifyHostVisibility(t, s) {
    if (!(this._disposed || t === s)) {
      this._hostVisibility = t;
      for (const e of this._hostVisibilityListeners)
        e(t, s);
    }
  }
  /** @internal */
  dispose() {
    this._disposed || (this._disposed = !0, this._propsListeners.clear(), this._contentListeners.clear(), this._hostVisibilityListeners.clear());
  }
  _subscribeProps(t, s) {
    if (this._disposed || s?.signal?.aborted)
      return () => {
      };
    this._propsListeners.add(t), s?.immediate && t(this._props, this._errors);
    const e = () => {
      this._propsListeners.delete(t), s?.signal?.removeEventListener("abort", e);
    };
    return s?.signal?.addEventListener("abort", e, { once: !0 }), e;
  }
  _subscribeContent(t, s) {
    if (this._disposed || s?.signal?.aborted)
      return () => {
      };
    this._contentListeners.add(t), s?.immediate && t(this._content);
    const e = () => {
      this._contentListeners.delete(t), s?.signal?.removeEventListener("abort", e);
    };
    return s?.signal?.addEventListener("abort", e, { once: !0 }), e;
  }
  _subscribeHostVisibility(t, s) {
    if (this._disposed || s?.signal?.aborted)
      return () => {
      };
    this._hostVisibilityListeners.add(t), s?.immediate && t(this._hostVisibility, this._hostVisibility);
    const e = () => {
      this._hostVisibilityListeners.delete(t), s?.signal?.removeEventListener("abort", e);
    };
    return s?.signal?.addEventListener("abort", e, { once: !0 }), e;
  }
}, wt = class extends HTMLElement {
  constructor() {
    super(), h(this, "_internals"), h(this, "_contentObserver", null), h(this, "_initialized", !1), h(this, "_container", null), h(this, "_reactive", null), h(this, "_lastProps", null), h(this, "_lastErrors", []), h(this, "_lastContent", null), h(this, "_themeUnsub", null), h(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = j(this);
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
    const t = this.wippyConfig, s = Object.keys(t.propsSchema.properties), e = t.extraObservedAttributes ?? [];
    return [.../* @__PURE__ */ new Set([...s, ...e, L])];
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
    return W(this);
  }
  /**
   * Emit a CustomEvent that bubbles and crosses shadow DOM boundaries.
   */
  emitEvent(t, s) {
    this.dispatchEvent(new CustomEvent(t, {
      bubbles: !0,
      composed: !0,
      detail: s
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
      const t = this.constructor.wippyConfig, s = !!t.contentTemplate;
      let e, i;
      if (this._lastProps !== null)
        e = this._lastProps, i = this._lastErrors;
      else {
        const r = R(this, t.propsSchema);
        t.validateProps && r.errors.push(...t.validateProps(r.props)), e = r.props, i = r.errors, this._lastProps = e, this._lastErrors = i;
      }
      const n = s ? this._lastContent ?? this._extractContent(t.contentTemplate) : null;
      s && this._lastContent === null && (this._lastContent = n), this._reactive = new Et(
        { props: e, errors: i, content: n, hasContent: s, hostVisibility: this._hostVisible },
        this.emitEvent.bind(this)
      );
    }
    return this._reactive;
  }
  // ── Lifecycle ──────────────────────────────────────────────
  connectedCallback() {
    this._internals.states.add("loading");
    try {
      const t = this.constructor.wippyConfig, s = this._initialized, e = this.shadowRoot ?? this.attachShadow({ mode: t.shadowMode ?? "open" });
      let i;
      if (s)
        i = this._container;
      else {
        this.onInit(e), t.inlineCss && vt(e, t.inlineCss);
        try {
          const c = H?.theming, p = ft(
            c?.global?.cssVariables,
            c?.children?.cssVariables
          );
          mt(e, p);
        } catch {
        }
        if (t.customCss !== !1)
          try {
            const c = H?.theming, p = [c?.global?.customCSS, c?.children?.customCSS].filter(Boolean).join(`
`);
            p && yt(e, p);
          } catch {
          }
        (t.hostCssKeys === void 0 || t.hostCssKeys.length > 0) && bt(e, t.hostCssKeys), i = document.createElement("div"), i.setAttribute("data-wippy-theme-root", "");
        const u = t.containerClasses ?? [];
        u.length > 0 && i.classList.add(...u), e.appendChild(i), this._container = i, nt(it);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = rt("@theme", (u) => this._applyTheme(u)));
      const { props: n, errors: r } = R(this, t.propsSchema);
      t.validateProps && r.push(...t.validateProps(n));
      const o = n;
      this._lastProps = o, this._lastErrors = r;
      let l = null;
      t.contentTemplate && (l = this._extractContent(t.contentTemplate), this._lastContent = l, this._contentObserver = new MutationObserver(() => {
        const u = this._extractContent(t.contentTemplate);
        this._lastContent = u, this._reactive?.notifyContent(u), this.onContentChanged(u);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(e, i, o, r, l, s), this._internals.states.delete("loading"), this._internals.states.add("ready"), s || (this._initialized = !0), this.onReady(), this.emitEvent("load");
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
  _applyTheme(t = ot.getThemeMode?.()) {
    E(t, this), this._container && E(t, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), E("auto", this), this._container && E("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(t, s, e) {
    if (s === e)
      return;
    if (t === L) {
      const l = this._hostVisible, u = j(this);
      if (u === l)
        return;
      this._hostVisible = u, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(u, l), this.onHostVisibilityChanged(u, l));
      return;
    }
    const i = this.constructor.wippyConfig, { props: n, errors: r } = R(this, i.propsSchema);
    i.validateProps && r.push(...i.validateProps(n));
    const o = n;
    this._lastProps = o, this._lastErrors = r, this._reactive?.notifyProps(o, r), this.onPropsChanged(o, r);
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
  onPropsChanged(t, s) {
  }
  /**
   * Called when the host changes logical activity. `null` means unmanaged.
   * This does not imply a DOM remount or a CSS/viewport visibility change.
   */
  onHostVisibilityChanged(t, s) {
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
function St(t) {
  return t.__wippyHostBus ?? null;
}
function Vt(t) {
  return t.dataset.wippyPanelId ?? null;
}
/*!
 * pinia v4.0.3
 * (c) 2026 Eduardo San Martin Morote
 * @license MIT
 */
let k;
const D = (t) => k = t, Pt = () => G() && w(M) || k, M = (
  /* istanbul ignore next */
  Symbol()
);
function Rt() {
  const t = q(!0), s = t.run(() => v({}));
  let e = [], i = [];
  const n = Q({
    install(r) {
      D(n), n._a = r, r.provide(M, n), r.config.globalProperties.$pinia = n, i.forEach((o) => e.push(o)), i = [];
    },
    use(r) {
      return this._a ? e.push(r) : i.push(r), this;
    },
    _p: e,
    _a: null,
    _e: t,
    _s: /* @__PURE__ */ new Map(),
    state: s
  });
  return n;
}
var At = Object.defineProperty, Lt = (t, s, e) => s in t ? At(t, s, { enumerable: !0, configurable: !0, writable: !0, value: e }) : t[s] = e, g = (t, s, e) => Lt(t, typeof s != "symbol" ? s + "" : s, e), z = /* @__PURE__ */ Symbol("wippy:emit"), F = /* @__PURE__ */ Symbol("wippy:props"), It = /* @__PURE__ */ Symbol("wippy:props_error"), Ot = /* @__PURE__ */ Symbol("wippy:content"), Tt = /* @__PURE__ */ Symbol("wippy:panel-id"), xt = /* @__PURE__ */ Symbol("wippy:layout-bus"), Nt = /* @__PURE__ */ Symbol("wippy:host"), K = /* @__PURE__ */ Symbol("wippy:host-visibility");
function Mt() {
  const t = w(F);
  if (!t)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return t;
}
function zt() {
  const t = w(z);
  if (!t)
    throw new Error("useEvents() must be called inside a WippyVueElement");
  return t;
}
function Ht() {
  const t = w(K);
  if (!t)
    throw new Error("useHostVisibility() must be called inside a WippyVueElement");
  return t;
}
function Ft(t) {
  const s = Ht();
  let e = !1, i = null, n = !1;
  function r() {
    if (i)
      return n = !0, i;
    let o;
    try {
      o = Promise.resolve(t());
    } catch (u) {
      o = Promise.reject(u);
    }
    const l = o.finally(() => {
      if (i === l && (i = null, e && n))
        return n = !1, r();
    });
    return i = l, l;
  }
  return $(() => (e = !0, r())), Z(() => {
    e = !1, n = !1;
  }), A(s, (o, l) => {
    if (e && l === !1 && o === !0)
      return r();
  }), s;
}
var Kt = class extends wt {
  constructor() {
    super(...arguments), g(this, "_vueApp", null), g(this, "_propsRef", v({})), g(this, "_errorsRef", v([])), g(this, "_contentRef", v(null)), g(this, "_hostVisibilityRef", v(null)), g(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  onMount(t, s, e, i, n, r) {
    const o = this.constructor.vueConfig;
    this._propsRef.value = e, this._errorsRef.value = i, this._contentRef.value = n ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const c of i)
      this.emitEvent("invalid", { message: c });
    const l = new AbortController();
    this._bridgeAbort = l, this.reactive.props.subscribe((c, p) => {
      this._propsRef.value = c, this._errorsRef.value = [...p];
      for (const d of p)
        this.emitEvent("invalid", { message: d });
    }, { signal: l.signal }), this.reactive.content && this.reactive.content.subscribe((c) => {
      this._contentRef.value = c;
    }, { signal: l.signal }), this.reactive.hostVisibility.subscribe((c) => {
      this._hostVisibilityRef.value = c;
    }, { signal: l.signal });
    const u = (c) => {
      if (l.signal.aborted)
        return;
      const p = Pt(), d = X(c.rootComponent);
      this._vueApp = d;
      const b = Rt();
      if (c.piniaPlugins)
        for (const y of c.piniaPlugins)
          b.use(y);
      if (d.use(b), c.plugins)
        for (const y of c.plugins)
          d.use(y);
      d.provide(F, this._propsRef), d.provide(It, this._errorsRef), d.provide(z, this.emitEvent.bind(this)), d.provide(Ot, this._contentRef), d.provide(K, this._hostVisibilityRef), d.provide(Tt, Vt(this)), d.provide(xt, St(this)), d.provide(Nt, W(this)), c.providers && c.providers(d, this), d.mount(s), p && D(p);
    };
    if (o.rootComponent)
      u(o);
    else if (o.lazyConfig) {
      const c = document.createElement("wippy-loading");
      c.setAttribute("no-bg", ""), s.appendChild(c), o.lazyConfig().then((p) => {
        l.signal.aborted || (c.remove(), u(p));
      }).catch((p) => {
        if (l.signal.aborted)
          return;
        const d = p instanceof Error ? p.message : String(p), b = document.createElement("wippy-error");
        b.setAttribute("title", "Failed to load"), b.setAttribute("message", d), c.replaceWith(b), this.emitEvent("error", { message: d });
      });
    } else
      throw new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._vueApp && (this._vueApp.unmount(), this._vueApp = null);
  }
};
const jt = { class: "kx-wcmount" }, Ut = {
  key: 0,
  class: "kx-wcmount-fail",
  role: "alert"
}, $t = /* @__PURE__ */ tt({
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
  setup(t, { emit: s }) {
    const e = t, i = s, n = v(null), r = v(!1);
    let o = null, l = 0;
    const u = /* @__PURE__ */ new Set();
    function c(a) {
      a.composedPath()[0] === o && (a.stopPropagation(), i("change", a.detail));
    }
    function p(a) {
      return a.composedPath()[0] !== o ? !1 : (a.stopPropagation(), !0);
    }
    function d(a) {
      p(a) && i("select", a.detail);
    }
    function b(a) {
      p(a) && i("created", a.detail);
    }
    function y(a) {
      p(a) && i("close", a.detail);
    }
    function I(a) {
      p(a) && i("error", a.detail);
    }
    function C(a) {
      if (typeof a == "string") return a;
      try {
        return JSON.stringify(a ?? {});
      } catch {
        return null;
      }
    }
    function O() {
      if (!o) return;
      const a = C(e.config);
      if (a !== null && o.setAttribute("config", a), e.schema !== void 0 && e.schema !== null) {
        const f = C(e.schema);
        f !== null && o.setAttribute("schema", f);
      }
      if (e.meta !== void 0 && e.meta !== null) {
        const f = C(e.meta);
        f !== null && o.setAttribute("meta", f);
      }
      e.provider && o.setAttribute("provider", e.provider), e.label && o.setAttribute("label", e.label);
      const m = e.attrs || {};
      for (const f of [...u])
        (!(f in m) || m[f] == null) && (o.removeAttribute(f), u.delete(f));
      for (const [f, _] of Object.entries(m)) {
        if (_ == null) continue;
        const x = typeof _ == "object" ? C(_) : String(_);
        x !== null && (o.setAttribute(f, x), u.add(f));
      }
    }
    function T(a = o) {
      a && (a.removeEventListener("config-changed", c), a.removeEventListener("change", c), a.removeEventListener("select", d), a.removeEventListener("created", b), a.removeEventListener("close", y), a.removeEventListener("error", I), a === o && (o = null), u.clear());
    }
    async function Y(a) {
      if (!customElements.get(a))
        try {
          await ct(a, { timeoutMs: 8e3 });
        } catch {
        }
    }
    async function S() {
      const a = ++l, m = n.value, f = e.tag;
      if (r.value = !1, !!m && (T(), m.innerHTML = "", !!f))
        try {
          if (await Y(f), a !== l || n.value !== m || e.tag !== f) return;
          const _ = document.createElement(f);
          _.classList.add("kx-wcmount-surface"), o = _, O(), _.addEventListener("config-changed", c), _.addEventListener("change", c), _.addEventListener("select", d), _.addEventListener("created", b), _.addEventListener("close", y), _.addEventListener("error", I), _.style.display = "block", m.appendChild(_), r.value = !customElements.get(f);
        } catch {
          a === l && (r.value = !0);
        }
    }
    async function J() {
      r.value = !1, await st(), await S();
    }
    return $(S), A(() => e.tag, S), A(() => [e.config, e.schema, e.meta, e.provider, e.label, e.attrs], O, { deep: !0 }), et(() => {
      l += 1, T();
    }), (a, m) => (V(), P("div", jt, [
      r.value ? (V(), P("div", Ut, [
        m[0] || (m[0] = N("span", null, "This setup panel couldn’t load.", -1)),
        N("button", {
          type: "button",
          onClick: J
        }, "Try again")
      ])) : (V(), P("div", {
        key: 1,
        ref_key: "host",
        ref: n
      }, null, 512))
    ]));
  }
}), Bt = (t, s) => {
  const e = t.__vccOpts || t;
  for (const [i, n] of s)
    e[i] = n;
  return e;
}, Yt = /* @__PURE__ */ Bt($t, [["__scopeId", "data-v-3d6a00f1"]]);
function Jt(t, s) {
  if (t && typeof t == "object") {
    const e = t, i = e.response?.data?.error;
    if (typeof i == "string") return i;
    if (i && typeof i == "object" && typeof i.message == "string")
      return i.message;
    if (typeof e.message == "string" && e.message) return e.message;
  }
  return s;
}
export {
  Yt as W,
  Bt as _,
  zt as a,
  Kt as b,
  Ft as c,
  Jt as e,
  Mt as u
};
//# sourceMappingURL=errMsg-BT807vrI.js.map
