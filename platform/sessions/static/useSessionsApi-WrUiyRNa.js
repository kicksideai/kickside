import { hasInjectionContext as j, inject as v, effectScope as B, ref as g, markRaw as D, createApp as W, onMounted as z, onUnmounted as M, watch as K } from "vue";
import { addCollection as k } from "@iconify/vue";
import { config as S, addIcons as Y, on as J, applyThemeMode as C, host as q, hostCss as G, loadCss as Q, api as _ } from "@wippy-fe/proxy";
var E = "data-wippy-visible";
function V(t) {
  const e = t.getAttribute(E);
  return e === "true" ? !0 : e === "false" ? !1 : null;
}
var X = Object.defineProperty, Z = (t, e, s) => e in t ? X(t, e, { enumerable: !0, configurable: !0, writable: !0, value: s }) : t[e] = s, d = (t, e, s) => Z(t, typeof e != "symbol" ? e + "" : e, s), tt = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], et = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function P(t) {
  const e = t.startsWith("--") ? t : `--${t}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(e) ? e : null;
}
function st(...t) {
  const e = /* @__PURE__ */ new Set();
  for (const s of t)
    if (s)
      for (const [i, r] of Object.entries(s)) {
        if ((i === "@light" || i === "@dark") && r && typeof r == "object") {
          for (const [c, u] of Object.entries(r)) {
            const p = typeof u == "string" ? P(c) : null;
            p && e.add(p);
          }
          continue;
        }
        const a = typeof r == "string" ? P(i) : null;
        a && e.add(a);
      }
  return [...e].sort();
}
function it(t) {
  if (t.length === 0)
    return "";
  const e = t.map((s) => `  ${s}: inherit;`).join(`
`);
  return `${et} {
${e}
}`;
}
function rt(t, e) {
  const s = it(e);
  s && R(t, s, "@wippy-fe/css-variables-bridge");
}
function nt(t, e) {
  const i = (e ?? tt).map(async (r) => {
    const a = G[r];
    if (!a)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${r}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await Q(a);
    } catch (c) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${r}" (${a}):`, c), null;
    }
  });
  return Promise.all(i).then((r) => {
    for (const a of r) {
      if (!a)
        continue;
      const c = document.createElement("style");
      c.textContent = a, c.setAttribute("role", "@wippy-fe/host-css"), t.appendChild(c);
    }
  });
}
function ot(t, e) {
  const s = document.createElement("style");
  s.textContent = e, t.appendChild(s);
}
function R(t, e, s) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const r = new CSSStyleSheet();
    r.replaceSync(e), t.adoptedStyleSheets = [...t.adoptedStyleSheets, r];
    return;
  }
  const i = document.createElement("style");
  i.setAttribute("role", s), i.textContent = e, t.appendChild(i);
}
function at(t, e) {
  R(t, e, "@wippy-fe/custom-css");
}
function I(t) {
  return t.__wippyHost ?? null;
}
function lt(t) {
  return t.replace(/-([a-z])/g, (e, s) => s.toUpperCase());
}
function ct(t, e, s) {
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
function w(t, e) {
  const s = {}, i = [];
  for (const [r, a] of Object.entries(e.properties)) {
    const c = t.getAttribute(r), u = lt(r);
    if (c === null) {
      a.default !== void 0 && (s[u] = a.default);
      continue;
    }
    const p = ct(r, c, a);
    p.error ? i.push(p.error) : s[u] = p.value;
  }
  return { props: s, errors: i };
}
var ut = class {
  constructor(t, e) {
    d(this, "_props"), d(this, "_errors"), d(this, "_content"), d(this, "_hostVisibility"), d(this, "_propsListeners", /* @__PURE__ */ new Set()), d(this, "_contentListeners", /* @__PURE__ */ new Set()), d(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), d(this, "_disposed", !1), d(this, "_emitToDom"), d(this, "props"), d(this, "events"), d(this, "content"), d(this, "hostVisibility"), this._props = t.props, this._errors = t.errors, this._content = t.content, this._hostVisibility = t.hostVisibility, this._emitToDom = e;
    const s = this;
    this.props = {
      get value() {
        return s._props;
      },
      get errors() {
        return s._errors;
      },
      subscribe(i, r) {
        return s._subscribeProps(i, r);
      }
    }, this.events = {
      emit(i, r) {
        s._disposed || s._emitToDom(i, r);
      }
    }, this.content = t.hasContent ? {
      get value() {
        return s._content;
      },
      subscribe(i, r) {
        return s._subscribeContent(i, r);
      }
    } : null, this.hostVisibility = {
      get value() {
        return s._hostVisibility;
      },
      subscribe(i, r) {
        return s._subscribeHostVisibility(i, r);
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
}, ht = class extends HTMLElement {
  constructor() {
    super(), d(this, "_internals"), d(this, "_contentObserver", null), d(this, "_initialized", !1), d(this, "_container", null), d(this, "_reactive", null), d(this, "_lastProps", null), d(this, "_lastErrors", []), d(this, "_lastContent", null), d(this, "_themeUnsub", null), d(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = V(this);
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
    return [.../* @__PURE__ */ new Set([...e, ...s, E])];
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
    return I(this);
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
        const a = w(this, t.propsSchema);
        t.validateProps && a.errors.push(...t.validateProps(a.props)), s = a.props, i = a.errors, this._lastProps = s, this._lastErrors = i;
      }
      const r = e ? this._lastContent ?? this._extractContent(t.contentTemplate) : null;
      e && this._lastContent === null && (this._lastContent = r), this._reactive = new ut(
        { props: s, errors: i, content: r, hasContent: e, hostVisibility: this._hostVisible },
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
        this.onInit(s), t.inlineCss && ot(s, t.inlineCss);
        try {
          const h = S?.theming, f = st(
            h?.global?.cssVariables,
            h?.children?.cssVariables
          );
          rt(s, f);
        } catch {
        }
        if (t.customCss !== !1)
          try {
            const h = S?.theming, f = [h?.global?.customCSS, h?.children?.customCSS].filter(Boolean).join(`
`);
            f && at(s, f);
          } catch {
          }
        (t.hostCssKeys === void 0 || t.hostCssKeys.length > 0) && nt(s, t.hostCssKeys), i = document.createElement("div"), i.setAttribute("data-wippy-theme-root", "");
        const p = t.containerClasses ?? [];
        p.length > 0 && i.classList.add(...p), s.appendChild(i), this._container = i, Y(k);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = J("@theme", (p) => this._applyTheme(p)));
      const { props: r, errors: a } = w(this, t.propsSchema);
      t.validateProps && a.push(...t.validateProps(r));
      const c = r;
      this._lastProps = c, this._lastErrors = a;
      let u = null;
      t.contentTemplate && (u = this._extractContent(t.contentTemplate), this._lastContent = u, this._contentObserver = new MutationObserver(() => {
        const p = this._extractContent(t.contentTemplate);
        this._lastContent = p, this._reactive?.notifyContent(p), this.onContentChanged(p);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(s, i, c, a, u, e), this._internals.states.delete("loading"), this._internals.states.add("ready"), e || (this._initialized = !0), this.onReady(), this.emitEvent("load");
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
  _applyTheme(t = q.getThemeMode?.()) {
    C(t, this), this._container && C(t, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), C("auto", this), this._container && C("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(t, e, s) {
    if (e === s)
      return;
    if (t === E) {
      const u = this._hostVisible, p = V(this);
      if (p === u)
        return;
      this._hostVisible = p, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(p, u), this.onHostVisibilityChanged(p, u));
      return;
    }
    const i = this.constructor.wippyConfig, { props: r, errors: a } = w(this, i.propsSchema);
    i.validateProps && a.push(...i.validateProps(r));
    const c = r;
    this._lastProps = c, this._lastErrors = a, this._reactive?.notifyProps(c, a), this.onPropsChanged(c, a);
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
function pt(t) {
  return t.__wippyHostBus ?? null;
}
function dt(t) {
  return t.dataset.wippyPanelId ?? null;
}
/*!
 * pinia v4.0.3
 * (c) 2026 Eduardo San Martin Morote
 * @license MIT
 */
let A;
const O = (t) => A = t, ft = () => j() && v($) || A, $ = (
  /* istanbul ignore next */
  Symbol()
);
function _t() {
  const t = B(!0), e = t.run(() => g({}));
  let s = [], i = [];
  const r = D({
    install(a) {
      O(r), r._a = a, a.provide($, r), a.config.globalProperties.$pinia = r, i.forEach((c) => s.push(c)), i = [];
    },
    use(a) {
      return this._a ? s.push(a) : i.push(a), this;
    },
    _p: s,
    _a: null,
    _e: t,
    _s: /* @__PURE__ */ new Map(),
    state: e
  });
  return r;
}
var bt = Object.defineProperty, mt = (t, e, s) => e in t ? bt(t, e, { enumerable: !0, configurable: !0, writable: !0, value: s }) : t[e] = s, y = (t, e, s) => mt(t, typeof e != "symbol" ? e + "" : e, s), L = /* @__PURE__ */ Symbol("wippy:emit"), T = /* @__PURE__ */ Symbol("wippy:props"), yt = /* @__PURE__ */ Symbol("wippy:props_error"), vt = /* @__PURE__ */ Symbol("wippy:content"), gt = /* @__PURE__ */ Symbol("wippy:panel-id"), U = /* @__PURE__ */ Symbol("wippy:layout-bus"), H = /* @__PURE__ */ Symbol("wippy:host"), N = /* @__PURE__ */ Symbol("wippy:host-visibility");
function Vt() {
  const t = v(T);
  if (!t)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return t;
}
function Pt() {
  const t = v(L);
  if (!t)
    throw new Error("useEvents() must be called inside a WippyVueElement");
  return t;
}
function Rt() {
  return v(U, null);
}
function It() {
  return v(H, null);
}
function Ct() {
  const t = v(N);
  if (!t)
    throw new Error("useHostVisibility() must be called inside a WippyVueElement");
  return t;
}
function At(t) {
  const e = Ct();
  let s = !1, i = null, r = !1;
  function a() {
    if (i)
      return r = !0, i;
    let c;
    try {
      c = Promise.resolve(t());
    } catch (p) {
      c = Promise.reject(p);
    }
    const u = c.finally(() => {
      if (i === u && (i = null, s && r))
        return r = !1, a();
    });
    return i = u, u;
  }
  return z(() => (s = !0, a())), M(() => {
    s = !1, r = !1;
  }), K(e, (c, u) => {
    if (s && u === !1 && c === !0)
      return a();
  }), e;
}
var Ot = class extends ht {
  constructor() {
    super(...arguments), y(this, "_vueApp", null), y(this, "_propsRef", g({})), y(this, "_errorsRef", g([])), y(this, "_contentRef", g(null)), y(this, "_hostVisibilityRef", g(null)), y(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  onMount(t, e, s, i, r, a) {
    const c = this.constructor.vueConfig;
    this._propsRef.value = s, this._errorsRef.value = i, this._contentRef.value = r ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const h of i)
      this.emitEvent("invalid", { message: h });
    const u = new AbortController();
    this._bridgeAbort = u, this.reactive.props.subscribe((h, f) => {
      this._propsRef.value = h, this._errorsRef.value = [...f];
      for (const n of f)
        this.emitEvent("invalid", { message: n });
    }, { signal: u.signal }), this.reactive.content && this.reactive.content.subscribe((h) => {
      this._contentRef.value = h;
    }, { signal: u.signal }), this.reactive.hostVisibility.subscribe((h) => {
      this._hostVisibilityRef.value = h;
    }, { signal: u.signal });
    const p = (h) => {
      if (u.signal.aborted)
        return;
      const f = ft(), n = W(h.rootComponent);
      this._vueApp = n;
      const l = _t();
      if (h.piniaPlugins)
        for (const o of h.piniaPlugins)
          l.use(o);
      if (n.use(l), h.plugins)
        for (const o of h.plugins)
          n.use(o);
      n.provide(T, this._propsRef), n.provide(yt, this._errorsRef), n.provide(L, this.emitEvent.bind(this)), n.provide(vt, this._contentRef), n.provide(N, this._hostVisibilityRef), n.provide(gt, dt(this)), n.provide(U, pt(this)), n.provide(H, I(this)), h.providers && h.providers(n, this), n.mount(e), f && O(f);
    };
    if (c.rootComponent)
      p(c);
    else if (c.lazyConfig) {
      const h = document.createElement("wippy-loading");
      h.setAttribute("no-bg", ""), e.appendChild(h), c.lazyConfig().then((f) => {
        u.signal.aborted || (h.remove(), p(f));
      }).catch((f) => {
        if (u.signal.aborted)
          return;
        const n = f instanceof Error ? f.message : String(f), l = document.createElement("wippy-error");
        l.setAttribute("title", "Failed to load"), l.setAttribute("message", n), h.replaceWith(l), this.emitEvent("error", { message: n });
      });
    } else
      throw new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._vueApp && (this._vueApp.unmount(), this._vueApp = null);
  }
};
const b = "/api/v1";
function $t() {
  async function t(n, l) {
    const { data: o } = await _.get(`${b}/sessions?limit=${n}&offset=${l}`);
    if (!o?.success) throw new Error(o?.error || "Failed to load sessions");
    return { sessions: o.sessions || [], total: o.count || 0 };
  }
  async function e() {
    try {
      const { data: n } = await _.get(`${b}/user-agents`), l = {};
      for (const o of n?.agents || [])
        o.id && o.title && (l[o.id] = o.title);
      return l;
    } catch {
      return {};
    }
  }
  async function s() {
    try {
      const { data: n } = await _.get(`${b}/connections/providers/badges`), l = /* @__PURE__ */ Object.create(null);
      for (const o of n?.providers || []) {
        const m = typeof o.provider == "string" ? o.provider.trim().toLowerCase() : "";
        if (!m) continue;
        const x = typeof o.title == "string" && o.title.trim() ? o.title.trim() : m, F = typeof o.icon == "string" && o.icon.trim() ? o.icon.trim() : "tabler:plug-connected";
        l[m] = { icon: F, label: x };
      }
      return l;
    } catch {
      return /* @__PURE__ */ Object.create(null);
    }
  }
  async function i(n, l = 30) {
    const o = `${b}/sessions/messages?session_id=${encodeURIComponent(n)}&limit=${l}`, { data: m } = await _.get(o);
    if (!m?.success) throw new Error(m?.error || "Failed to load messages");
    return m.messages || [];
  }
  async function r(n, l) {
    const { data: o } = await _.post(`${b}/sessions/rename`, {
      session_id: n,
      title: l
    });
    if (!o?.success) throw new Error(o?.error || "Failed to rename session");
  }
  async function a(n) {
    const l = `${b}/sessions/delete?session_id=${encodeURIComponent(n)}`, { data: o } = await _.delete(l);
    if (!o?.success) throw new Error(o?.error || "Failed to delete session");
  }
  async function c(n, l) {
    const { data: o } = await _.post(`${b}/sessions/favorite`, {
      session_id: n,
      favorite: l
    });
    if (!o?.success) throw new Error(o?.error || "Failed to update favorite");
  }
  async function u(n, l) {
    const { data: o } = await _.post(`${b}/sessions/start-token`, { agent: n, model: l });
    if (!o?.success || !o.token) throw new Error(o?.error || "Failed to start a new chat");
    return o.token;
  }
  async function p(n = {}) {
    const l = new URLSearchParams();
    l.set("limit", String(n.limit || 48)), n.sessionId && l.set("session_id", n.sessionId), n.cursor && l.set("cursor", n.cursor);
    const { data: o } = await _.get(`${b}/artifacts?${l.toString()}`);
    if (!o?.success) throw new Error(o?.error || "Failed to load artifacts");
    return {
      artifacts: o.artifacts || [],
      hasMore: o.pagination?.has_more === !0,
      nextCursor: o.pagination?.next_cursor || ""
    };
  }
  async function h(n) {
    const { data: l } = await _.get(`${b}/artifact/${encodeURIComponent(n)}`);
    if (!l?.uuid) throw new Error(l?.error || "Failed to load artifact");
    return { ...l, artifact_id: l.artifact_id || l.uuid };
  }
  async function f(n) {
    const { data: l } = await _.get(`${b}/artifact/${encodeURIComponent(n)}/content`, {
      responseType: "text"
    });
    return typeof l == "string" ? l : JSON.stringify(l, null, 2);
  }
  return { list: t, messages: i, rename: r, remove: a, setFavorite: c, startToken: u, agentTitles: e, providerBadges: s, artifacts: p, artifact: h, artifactContent: f };
}
export {
  Ot as W,
  Rt as a,
  $t as b,
  At as c,
  Pt as d,
  Vt as e,
  It as u
};
//# sourceMappingURL=useSessionsApi-WrUiyRNa.js.map
