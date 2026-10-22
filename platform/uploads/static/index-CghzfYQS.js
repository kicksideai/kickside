import { hasInjectionContext as Yo, inject as Nn, effectScope as Zo, ref as he, markRaw as Jo, onMounted as Mn, onUnmounted as Qo, watch as Ae, createApp as Xo, readonly as er, getCurrentInstance as Jt, nextTick as tr, reactive as nr, renderSlot as A, openBlock as $, createBlock as ae, Teleport as Dn, createCommentVNode as W, useId as or, mergeProps as y, h as rr, createElementBlock as I, createElementVNode as H, createTextVNode as ut, toDisplayString as se, resolveComponent as ee, resolveDirective as Rn, withDirectives as Bn, resolveDynamicComponent as $t, withCtx as ye, normalizeClass as Ee, Fragment as je, renderList as Ot, createVNode as Se, Transition as ir, normalizeProps as sr, createSlots as ar, withModifiers as lr } from "vue";
import { addCollection as ur } from "@iconify/vue";
import { config as Qt, addIcons as dr, on as cr, applyThemeMode as rt, host as pr, hostCss as fr, loadCss as hr } from "@wippy-fe/proxy";
var Ct = "data-wippy-visible";
function Xt(t) {
  const e = t.getAttribute(Ct);
  return e === "true" ? !0 : e === "false" ? !1 : null;
}
var mr = Object.defineProperty, br = (t, e, n) => e in t ? mr(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n, z = (t, e, n) => br(t, typeof e != "symbol" ? e + "" : e, n), gr = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], vr = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function en(t) {
  const e = t.startsWith("--") ? t : `--${t}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(e) ? e : null;
}
function yr(...t) {
  const e = /* @__PURE__ */ new Set();
  for (const n of t)
    if (n)
      for (const [o, r] of Object.entries(n)) {
        if ((o === "@light" || o === "@dark") && r && typeof r == "object") {
          for (const [a, l] of Object.entries(r)) {
            const s = typeof l == "string" ? en(a) : null;
            s && e.add(s);
          }
          continue;
        }
        const i = typeof r == "string" ? en(o) : null;
        i && e.add(i);
      }
  return [...e].sort();
}
function Sr(t) {
  if (t.length === 0)
    return "";
  const e = t.map((n) => `  ${n}: inherit;`).join(`
`);
  return `${vr} {
${e}
}`;
}
function wr(t, e) {
  const n = Sr(e);
  n && Hn(t, n, "@wippy-fe/css-variables-bridge");
}
function $r(t, e) {
  const o = (e ?? gr).map(async (r) => {
    const i = fr[r];
    if (!i)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${r}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await hr(i);
    } catch (a) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${r}" (${i}):`, a), null;
    }
  });
  return Promise.all(o).then((r) => {
    for (const i of r) {
      if (!i)
        continue;
      const a = document.createElement("style");
      a.textContent = i, a.setAttribute("role", "@wippy-fe/host-css"), t.appendChild(a);
    }
  });
}
function Or(t, e) {
  const n = document.createElement("style");
  n.textContent = e, t.appendChild(n);
}
function Hn(t, e, n) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const r = new CSSStyleSheet();
    r.replaceSync(e), t.adoptedStyleSheets = [...t.adoptedStyleSheets, r];
    return;
  }
  const o = document.createElement("style");
  o.setAttribute("role", n), o.textContent = e, t.appendChild(o);
}
function Cr(t, e) {
  Hn(t, e, "@wippy-fe/custom-css");
}
function Kn(t) {
  return t.__wippyHost ?? null;
}
function kr(t) {
  return t.replace(/-([a-z])/g, (e, n) => n.toUpperCase());
}
function _r(t, e, n) {
  switch (n.type) {
    case "string":
      return { value: e };
    case "number": {
      const o = Number.parseFloat(e);
      return Number.isNaN(o) ? { value: void 0, error: `Invalid ${t}: expected a number` } : { value: o };
    }
    case "integer": {
      const o = Number.parseInt(e, 10);
      return Number.isNaN(o) ? { value: void 0, error: `Invalid ${t}: expected an integer` } : { value: o };
    }
    case "boolean":
      return { value: e !== "false" };
    case "array":
    case "object":
      try {
        const o = JSON.parse(e);
        return n.type === "array" && !Array.isArray(o) ? { value: void 0, error: `Invalid ${t}: expected a JSON array` } : { value: o };
      } catch {
        return { value: void 0, error: `Invalid ${t}: must be valid JSON` };
      }
    default:
      return { value: e };
  }
}
function vt(t, e) {
  const n = {}, o = [];
  for (const [r, i] of Object.entries(e.properties)) {
    const a = t.getAttribute(r), l = kr(r);
    if (a === null) {
      i.default !== void 0 && (n[l] = i.default);
      continue;
    }
    const s = _r(r, a, i);
    s.error ? o.push(s.error) : n[l] = s.value;
  }
  return { props: n, errors: o };
}
var Ir = class {
  constructor(t, e) {
    z(this, "_props"), z(this, "_errors"), z(this, "_content"), z(this, "_hostVisibility"), z(this, "_propsListeners", /* @__PURE__ */ new Set()), z(this, "_contentListeners", /* @__PURE__ */ new Set()), z(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), z(this, "_disposed", !1), z(this, "_emitToDom"), z(this, "props"), z(this, "events"), z(this, "content"), z(this, "hostVisibility"), this._props = t.props, this._errors = t.errors, this._content = t.content, this._hostVisibility = t.hostVisibility, this._emitToDom = e;
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
    }, this.content = t.hasContent ? {
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
}, Tr = class extends HTMLElement {
  constructor() {
    super(), z(this, "_internals"), z(this, "_contentObserver", null), z(this, "_initialized", !1), z(this, "_container", null), z(this, "_reactive", null), z(this, "_lastProps", null), z(this, "_lastErrors", []), z(this, "_lastContent", null), z(this, "_themeUnsub", null), z(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = Xt(this);
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
    return [.../* @__PURE__ */ new Set([...e, ...n, Ct])];
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
    return Kn(this);
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
      let n, o;
      if (this._lastProps !== null)
        n = this._lastProps, o = this._lastErrors;
      else {
        const i = vt(this, t.propsSchema);
        t.validateProps && i.errors.push(...t.validateProps(i.props)), n = i.props, o = i.errors, this._lastProps = n, this._lastErrors = o;
      }
      const r = e ? this._lastContent ?? this._extractContent(t.contentTemplate) : null;
      e && this._lastContent === null && (this._lastContent = r), this._reactive = new Ir(
        { props: n, errors: o, content: r, hasContent: e, hostVisibility: this._hostVisible },
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
      let o;
      if (e)
        o = this._container;
      else {
        this.onInit(n), t.inlineCss && Or(n, t.inlineCss);
        try {
          const u = Qt?.theming, d = yr(
            u?.global?.cssVariables,
            u?.children?.cssVariables
          );
          wr(n, d);
        } catch {
        }
        if (t.customCss !== !1)
          try {
            const u = Qt?.theming, d = [u?.global?.customCSS, u?.children?.customCSS].filter(Boolean).join(`
`);
            d && Cr(n, d);
          } catch {
          }
        (t.hostCssKeys === void 0 || t.hostCssKeys.length > 0) && $r(n, t.hostCssKeys), o = document.createElement("div"), o.setAttribute("data-wippy-theme-root", "");
        const s = t.containerClasses ?? [];
        s.length > 0 && o.classList.add(...s), n.appendChild(o), this._container = o, dr(ur);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = cr("@theme", (s) => this._applyTheme(s)));
      const { props: r, errors: i } = vt(this, t.propsSchema);
      t.validateProps && i.push(...t.validateProps(r));
      const a = r;
      this._lastProps = a, this._lastErrors = i;
      let l = null;
      t.contentTemplate && (l = this._extractContent(t.contentTemplate), this._lastContent = l, this._contentObserver = new MutationObserver(() => {
        const s = this._extractContent(t.contentTemplate);
        this._lastContent = s, this._reactive?.notifyContent(s), this.onContentChanged(s);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(n, o, a, i, l, e), this._internals.states.delete("loading"), this._internals.states.add("ready"), e || (this._initialized = !0), this.onReady(), this.emitEvent("load");
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
  _applyTheme(t = pr.getThemeMode?.()) {
    rt(t, this), this._container && rt(t, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), rt("auto", this), this._container && rt("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(t, e, n) {
    if (e === n)
      return;
    if (t === Ct) {
      const l = this._hostVisible, s = Xt(this);
      if (s === l)
        return;
      this._hostVisible = s, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(s, l), this.onHostVisibilityChanged(s, l));
      return;
    }
    const o = this.constructor.wippyConfig, { props: r, errors: i } = vt(this, o.propsSchema);
    o.validateProps && i.push(...o.validateProps(r));
    const a = r;
    this._lastProps = a, this._lastErrors = i, this._reactive?.notifyProps(a, i), this.onPropsChanged(a, i);
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
function Pr(t) {
  return t.__wippyHostBus ?? null;
}
function xr(t) {
  return t.dataset.wippyPanelId ?? null;
}
/*!
 * pinia v4.0.3
 * (c) 2026 Eduardo San Martin Morote
 * @license MIT
 */
let Un;
const Wn = (t) => Un = t, Lr = () => Yo() && Nn(Gn) || Un, Gn = (
  /* istanbul ignore next */
  Symbol()
);
function Ar() {
  const t = Zo(!0), e = t.run(() => he({}));
  let n = [], o = [];
  const r = Jo({
    install(i) {
      Wn(r), r._a = i, i.provide(Gn, r), i.config.globalProperties.$pinia = r, o.forEach((a) => n.push(a)), o = [];
    },
    use(i) {
      return this._a ? n.push(i) : o.push(i), this;
    },
    _p: n,
    _a: null,
    _e: t,
    _s: /* @__PURE__ */ new Map(),
    state: e
  });
  return r;
}
var Er = Object.defineProperty, Vr = (t, e, n) => e in t ? Er(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n, xe = (t, e, n) => Vr(t, typeof e != "symbol" ? e + "" : e, n), jr = /* @__PURE__ */ Symbol("wippy:emit"), zr = /* @__PURE__ */ Symbol("wippy:props"), Fr = /* @__PURE__ */ Symbol("wippy:props_error"), Nr = /* @__PURE__ */ Symbol("wippy:content"), Mr = /* @__PURE__ */ Symbol("wippy:panel-id"), Dr = /* @__PURE__ */ Symbol("wippy:layout-bus"), Rr = /* @__PURE__ */ Symbol("wippy:host"), qn = /* @__PURE__ */ Symbol("wippy:host-visibility");
function Br() {
  const t = Nn(qn);
  if (!t)
    throw new Error("useHostVisibility() must be called inside a WippyVueElement");
  return t;
}
function Wl(t) {
  const e = Br();
  let n = !1, o = null, r = !1;
  function i() {
    if (o)
      return r = !0, o;
    let a;
    try {
      a = Promise.resolve(t());
    } catch (s) {
      a = Promise.reject(s);
    }
    const l = a.finally(() => {
      if (o === l && (o = null, n && r))
        return r = !1, i();
    });
    return o = l, l;
  }
  return Mn(() => (n = !0, i())), Qo(() => {
    n = !1, r = !1;
  }), Ae(e, (a, l) => {
    if (n && l === !1 && a === !0)
      return i();
  }), e;
}
var Gl = class extends Tr {
  constructor() {
    super(...arguments), xe(this, "_vueApp", null), xe(this, "_propsRef", he({})), xe(this, "_errorsRef", he([])), xe(this, "_contentRef", he(null)), xe(this, "_hostVisibilityRef", he(null)), xe(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  onMount(t, e, n, o, r, i) {
    const a = this.constructor.vueConfig;
    this._propsRef.value = n, this._errorsRef.value = o, this._contentRef.value = r ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const u of o)
      this.emitEvent("invalid", { message: u });
    const l = new AbortController();
    this._bridgeAbort = l, this.reactive.props.subscribe((u, d) => {
      this._propsRef.value = u, this._errorsRef.value = [...d];
      for (const c of d)
        this.emitEvent("invalid", { message: c });
    }, { signal: l.signal }), this.reactive.content && this.reactive.content.subscribe((u) => {
      this._contentRef.value = u;
    }, { signal: l.signal }), this.reactive.hostVisibility.subscribe((u) => {
      this._hostVisibilityRef.value = u;
    }, { signal: l.signal });
    const s = (u) => {
      if (l.signal.aborted)
        return;
      const d = Lr(), c = Xo(u.rootComponent);
      this._vueApp = c;
      const p = Ar();
      if (u.piniaPlugins)
        for (const f of u.piniaPlugins)
          p.use(f);
      if (c.use(p), u.plugins)
        for (const f of u.plugins)
          c.use(f);
      c.provide(zr, this._propsRef), c.provide(Fr, this._errorsRef), c.provide(jr, this.emitEvent.bind(this)), c.provide(Nr, this._contentRef), c.provide(qn, this._hostVisibilityRef), c.provide(Mr, xr(this)), c.provide(Dr, Pr(this)), c.provide(Rr, Kn(this)), u.providers && u.providers(c, this), c.mount(e), d && Wn(d);
    };
    if (a.rootComponent)
      s(a);
    else if (a.lazyConfig) {
      const u = document.createElement("wippy-loading");
      u.setAttribute("no-bg", ""), e.appendChild(u), a.lazyConfig().then((d) => {
        l.signal.aborted || (u.remove(), s(d));
      }).catch((d) => {
        if (l.signal.aborted)
          return;
        const c = d instanceof Error ? d.message : String(d), p = document.createElement("wippy-error");
        p.setAttribute("title", "Failed to load"), p.setAttribute("message", c), u.replaceWith(p), this.emitEvent("error", { message: c });
      });
    } else
      throw new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._vueApp && (this._vueApp.unmount(), this._vueApp = null);
  }
}, Hr = Object.defineProperty, tn = Object.getOwnPropertySymbols, Kr = Object.prototype.hasOwnProperty, Ur = Object.prototype.propertyIsEnumerable, nn = (t, e, n) => e in t ? Hr(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n, Wr = (t, e) => {
  for (var n in e || (e = {})) Kr.call(e, n) && nn(t, n, e[n]);
  if (tn) for (var n of tn(e)) Ur.call(e, n) && nn(t, n, e[n]);
  return t;
};
function _e(t) {
  return t == null || t === "" || Array.isArray(t) && t.length === 0 || !(t instanceof Date) && typeof t == "object" && Object.keys(t).length === 0;
}
function kt(t, e, n = /* @__PURE__ */ new WeakSet()) {
  if (t === e) return !0;
  if (!t || !e || typeof t != "object" || typeof e != "object" || n.has(t) || n.has(e)) return !1;
  n.add(t).add(e);
  let o = Array.isArray(t), r = Array.isArray(e), i, a, l;
  if (o && r) {
    if (a = t.length, a != e.length) return !1;
    for (i = a; i-- !== 0; ) if (!kt(t[i], e[i], n)) return !1;
    return !0;
  }
  if (o != r) return !1;
  let s = t instanceof Date, u = e instanceof Date;
  if (s != u) return !1;
  if (s && u) return t.getTime() == e.getTime();
  let d = t instanceof RegExp, c = e instanceof RegExp;
  if (d != c) return !1;
  if (d && c) return t.toString() == e.toString();
  let p = Object.keys(t);
  if (a = p.length, a !== Object.keys(e).length) return !1;
  for (i = a; i-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(e, p[i])) return !1;
  for (i = a; i-- !== 0; ) if (l = p[i], !kt(t[l], e[l], n)) return !1;
  return !0;
}
function Gr(t, e) {
  return kt(t, e);
}
function mt(t) {
  return typeof t == "function" && "call" in t && "apply" in t;
}
function P(t) {
  return !_e(t);
}
function fe(t, e) {
  if (!t || !e) return null;
  try {
    let n = t[e];
    if (P(n)) return n;
  } catch {
  }
  if (Object.keys(t).length) {
    if (mt(e)) return e(t);
    if (e.indexOf(".") === -1) return t[e];
    {
      let n = e.split("."), o = t;
      for (let r = 0, i = n.length; r < i; ++r) {
        if (o == null) return null;
        o = o[n[r]];
      }
      return o;
    }
  }
  return null;
}
function Yn(t, e, n) {
  return n ? fe(t, n) === fe(e, n) : Gr(t, e);
}
function de(t, e = !0) {
  return t instanceof Object && t.constructor === Object && (e || Object.keys(t).length !== 0);
}
function Zn(t = {}, e = {}) {
  let n = Wr({}, t);
  return Object.keys(e).forEach((o) => {
    let r = o;
    de(e[r]) && r in t && de(t[r]) ? n[r] = Zn(t[r], e[r]) : n[r] = e[r];
  }), n;
}
function qr(...t) {
  return t.reduce((e, n, o) => o === 0 ? n : Zn(e, n), {});
}
function on(t, e) {
  let n = -1;
  if (P(t)) try {
    n = t.findLastIndex(e);
  } catch {
    n = t.lastIndexOf([...t].reverse().find(e));
  }
  return n;
}
function Z(t, ...e) {
  return mt(t) ? t(...e) : t;
}
function G(t, e = !0) {
  return typeof t == "string" && (e || t !== "");
}
function le(t) {
  return G(t) ? t.replace(/(-|_)/g, "").toLowerCase() : t;
}
function Ht(t, e = "", n = {}) {
  let o = le(e).split("."), r = o.shift();
  if (r) {
    if (de(t)) {
      let i = Object.keys(t).find((a) => le(a) === r) || "";
      return Ht(Z(t[i], n), o.join("."), n);
    }
    return;
  }
  return Z(t, n);
}
function Jn(t, e = !0) {
  return Array.isArray(t) && (e || t.length !== 0);
}
function Yr(t) {
  return P(t) && !isNaN(t);
}
function Zr(t = "") {
  return P(t) && t.length === 1 && !!t.match(/\S| /);
}
function Ce(t, e) {
  if (e) {
    let n = e.test(t);
    return e.lastIndex = 0, n;
  }
  return !1;
}
function Jr(...t) {
  return qr(...t);
}
function De(t) {
  return t && t.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function X(t) {
  if (t && /[\xC0-\xFF\u0100-\u017E]/.test(t)) {
    let e = { A: /[\xC0-\xC5\u0100\u0102\u0104]/g, AE: /[\xC6]/g, C: /[\xC7\u0106\u0108\u010A\u010C]/g, D: /[\xD0\u010E\u0110]/g, E: /[\xC8-\xCB\u0112\u0114\u0116\u0118\u011A]/g, G: /[\u011C\u011E\u0120\u0122]/g, H: /[\u0124\u0126]/g, I: /[\xCC-\xCF\u0128\u012A\u012C\u012E\u0130]/g, IJ: /[\u0132]/g, J: /[\u0134]/g, K: /[\u0136]/g, L: /[\u0139\u013B\u013D\u013F\u0141]/g, N: /[\xD1\u0143\u0145\u0147\u014A]/g, O: /[\xD2-\xD6\xD8\u014C\u014E\u0150]/g, OE: /[\u0152]/g, R: /[\u0154\u0156\u0158]/g, S: /[\u015A\u015C\u015E\u0160]/g, T: /[\u0162\u0164\u0166]/g, U: /[\xD9-\xDC\u0168\u016A\u016C\u016E\u0170\u0172]/g, W: /[\u0174]/g, Y: /[\xDD\u0176\u0178]/g, Z: /[\u0179\u017B\u017D]/g, a: /[\xE0-\xE5\u0101\u0103\u0105]/g, ae: /[\xE6]/g, c: /[\xE7\u0107\u0109\u010B\u010D]/g, d: /[\u010F\u0111]/g, e: /[\xE8-\xEB\u0113\u0115\u0117\u0119\u011B]/g, g: /[\u011D\u011F\u0121\u0123]/g, i: /[\xEC-\xEF\u0129\u012B\u012D\u012F\u0131]/g, ij: /[\u0133]/g, j: /[\u0135]/g, k: /[\u0137,\u0138]/g, l: /[\u013A\u013C\u013E\u0140\u0142]/g, n: /[\xF1\u0144\u0146\u0148\u014B]/g, p: /[\xFE]/g, o: /[\xF2-\xF6\xF8\u014D\u014F\u0151]/g, oe: /[\u0153]/g, r: /[\u0155\u0157\u0159]/g, s: /[\u015B\u015D\u015F\u0161]/g, t: /[\u0163\u0165\u0167]/g, u: /[\xF9-\xFC\u0169\u016B\u016D\u016F\u0171\u0173]/g, w: /[\u0175]/g, y: /[\xFD\xFF\u0177]/g, z: /[\u017A\u017C\u017E]/g };
    for (let n in e) t = t.replace(e[n], n);
  }
  return t;
}
function Qr(t) {
  return G(t, !1) ? t[0].toUpperCase() + t.slice(1) : t;
}
function Qn(t) {
  return G(t) ? t.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : t;
}
function Kt() {
  let t = /* @__PURE__ */ new Map();
  return { on(e, n) {
    let o = t.get(e);
    return o ? o.push(n) : o = [n], t.set(e, o), this;
  }, off(e, n) {
    let o = t.get(e);
    return o && o.splice(o.indexOf(n) >>> 0, 1), this;
  }, emit(e, n) {
    let o = t.get(e);
    o && o.forEach((r) => {
      r(n);
    });
  }, clear() {
    t.clear();
  } };
}
function ue(...t) {
  if (t) {
    let e = [];
    for (let n = 0; n < t.length; n++) {
      let o = t[n];
      if (!o) continue;
      let r = typeof o;
      if (r === "string" || r === "number") e.push(o);
      else if (r === "object") {
        let i = Array.isArray(o) ? [ue(...o)] : Object.entries(o).map(([a, l]) => l ? a : void 0);
        e = i.length ? e.concat(i.filter((a) => !!a)) : e;
      }
    }
    return e.join(" ").trim();
  }
}
function Xr(t, e) {
  return t ? t.classList ? t.classList.contains(e) : new RegExp("(^| )" + e + "( |$)", "gi").test(t.className) : !1;
}
function _t(t, e) {
  if (t && e) {
    let n = (o) => {
      Xr(t, o) || (t.classList ? t.classList.add(o) : t.className += " " + o);
    };
    [e].flat().filter(Boolean).forEach((o) => o.split(" ").forEach(n));
  }
}
function ei() {
  return window.innerWidth - document.documentElement.offsetWidth;
}
function ql(t) {
  typeof t == "string" ? _t(document.body, t || "p-overflow-hidden") : (t != null && t.variableName && document.body.style.setProperty(t.variableName, ei() + "px"), _t(document.body, t?.className || "p-overflow-hidden"));
}
function Re(t, e) {
  if (t && e) {
    let n = (o) => {
      t.classList ? t.classList.remove(o) : t.className = t.className.replace(new RegExp("(^|\\b)" + o.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [e].flat().filter(Boolean).forEach((o) => o.split(" ").forEach(n));
  }
}
function Yl(t) {
  typeof t == "string" ? Re(document.body, t || "p-overflow-hidden") : (t != null && t.variableName && document.body.style.removeProperty(t.variableName), Re(document.body, t?.className || "p-overflow-hidden"));
}
function It(t) {
  for (let e of document?.styleSheets) try {
    for (let n of e?.cssRules) for (let o of n?.style) if (t.test(o)) return { name: o, value: n.style.getPropertyValue(o).trim() };
  } catch {
  }
  return null;
}
function Xn(t) {
  let e = { width: 0, height: 0 };
  if (t) {
    let [n, o] = [t.style.visibility, t.style.display], r = t.getBoundingClientRect();
    t.style.visibility = "hidden", t.style.display = "block", e.width = r.width || t.offsetWidth, e.height = r.height || t.offsetHeight, t.style.display = o, t.style.visibility = n;
  }
  return e;
}
function eo() {
  let t = window, e = document, n = e.documentElement, o = e.getElementsByTagName("body")[0], r = t.innerWidth || n.clientWidth || o.clientWidth, i = t.innerHeight || n.clientHeight || o.clientHeight;
  return { width: r, height: i };
}
function Tt(t) {
  return t ? Math.abs(t.scrollLeft) : 0;
}
function ti() {
  let t = document.documentElement;
  return (window.pageXOffset || Tt(t)) - (t.clientLeft || 0);
}
function ni() {
  let t = document.documentElement;
  return (window.pageYOffset || t.scrollTop) - (t.clientTop || 0);
}
function oi(t) {
  return t ? getComputedStyle(t).direction === "rtl" : !1;
}
function ri(t, e, n = !0) {
  var o, r, i, a;
  if (t) {
    let l = t.offsetParent ? { width: t.offsetWidth, height: t.offsetHeight } : Xn(t), s = l.height, u = l.width, d = e.offsetHeight, c = e.offsetWidth, p = e.getBoundingClientRect(), f = ni(), m = ti(), g = eo(), b, v, S = "top";
    p.top + d + s > g.height ? (b = p.top + f - s, S = "bottom", b < 0 && (b = f)) : b = d + p.top + f, p.left + u > g.width ? v = Math.max(0, p.left + m + c - u) : v = p.left + m, oi(t) ? t.style.insetInlineEnd = v + "px" : t.style.insetInlineStart = v + "px", t.style.top = b + "px", t.style.transformOrigin = S, n && (t.style.marginTop = S === "bottom" ? `calc(${(r = (o = It(/-anchor-gutter$/)) == null ? void 0 : o.value) != null ? r : "2px"} * -1)` : (a = (i = It(/-anchor-gutter$/)) == null ? void 0 : i.value) != null ? a : "");
  }
}
function ii(t, e) {
  t && (typeof e == "string" ? t.style.cssText = e : Object.entries(e || {}).forEach(([n, o]) => t.style[n] = o));
}
function to(t, e) {
  return t instanceof HTMLElement ? t.offsetWidth : 0;
}
function si(t, e, n = !0, o = void 0) {
  var r;
  if (t) {
    let i = t.offsetParent ? { width: t.offsetWidth, height: t.offsetHeight } : Xn(t), a = e.offsetHeight, l = e.getBoundingClientRect(), s = eo(), u, d, c = o ?? "top";
    if (!o && l.top + a + i.height > s.height ? (u = -1 * i.height, c = "bottom", l.top + u < 0 && (u = -1 * l.top)) : u = a, i.width > s.width ? d = l.left * -1 : l.left + i.width > s.width ? d = (l.left + i.width - s.width) * -1 : d = 0, t.style.top = u + "px", t.style.insetInlineStart = d + "px", t.style.transformOrigin = c, n) {
      let p = (r = It(/-anchor-gutter$/)) == null ? void 0 : r.value;
      t.style.marginTop = c === "bottom" ? `calc(${p ?? "2px"} * -1)` : p ?? "";
    }
  }
}
function no(t) {
  if (t) {
    let e = t.parentNode;
    return e && e instanceof ShadowRoot && e.host && (e = e.host), e;
  }
  return null;
}
function ai(t) {
  return !!(t !== null && typeof t < "u" && t.nodeName && no(t));
}
function Ie(t) {
  return typeof Element < "u" ? t instanceof Element : t !== null && typeof t == "object" && t.nodeType === 1 && typeof t.nodeName == "string";
}
function Zl() {
  if (window.getSelection) {
    let t = window.getSelection() || {};
    t.empty ? t.empty() : t.removeAllRanges && t.rangeCount > 0 && t.getRangeAt(0).getClientRects().length > 0 && t.removeAllRanges();
  }
}
function dt(t, e = {}) {
  if (Ie(t)) {
    let n = (o, r) => {
      var i, a;
      let l = (i = t?.$attrs) != null && i[o] ? [(a = t?.$attrs) == null ? void 0 : a[o]] : [];
      return [r].flat().reduce((s, u) => {
        if (u != null) {
          let d = typeof u;
          if (d === "string" || d === "number") s.push(u);
          else if (d === "object") {
            let c = Array.isArray(u) ? n(o, u) : Object.entries(u).map(([p, f]) => o === "style" && (f || f === 0) ? `${p.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}:${f}` : f ? p : void 0);
            s = c.length ? s.concat(c.filter((p) => !!p)) : s;
          }
        }
        return s;
      }, l);
    };
    Object.entries(e).forEach(([o, r]) => {
      if (r != null) {
        let i = o.match(/^on(.+)/);
        i ? t.addEventListener(i[1].toLowerCase(), r) : o === "p-bind" || o === "pBind" ? dt(t, r) : (r = o === "class" ? [...new Set(n("class", r))].join(" ").trim() : o === "style" ? n("style", r).join(";").trim() : r, (t.$attrs = t.$attrs || {}) && (t.$attrs[o] = r), t.setAttribute(o, r));
      }
    });
  }
}
function li(t, e = {}, ...n) {
  {
    let o = document.createElement(t);
    return dt(o, e), o.append(...n), o;
  }
}
function ui(t, e) {
  return Ie(t) ? Array.from(t.querySelectorAll(e)) : [];
}
function bt(t, e) {
  return Ie(t) ? t.matches(e) ? t : t.querySelector(e) : null;
}
function ce(t, e) {
  t && document.activeElement !== t && t.focus(e);
}
function di(t, e) {
  if (Ie(t)) {
    let n = t.getAttribute(e);
    return isNaN(n) ? n === "true" || n === "false" ? n === "true" : n : +n;
  }
}
function Ut(t, e = "") {
  let n = ui(t, `button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            [href]:not([tabindex = "-1"]):not([style*="display:none"]):not([hidden])${e},
            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e}`), o = [];
  for (let r of n) getComputedStyle(r).display != "none" && getComputedStyle(r).visibility != "hidden" && o.push(r);
  return o;
}
function ci(t, e) {
  let n = Ut(t, e);
  return n.length > 0 ? n[0] : null;
}
function $e(t) {
  if (t) {
    let e = t.offsetHeight, n = getComputedStyle(t);
    return e -= parseFloat(n.paddingTop) + parseFloat(n.paddingBottom) + parseFloat(n.borderTopWidth) + parseFloat(n.borderBottomWidth), e;
  }
  return 0;
}
function pi(t, e) {
  let n = Ut(t, e);
  return n.length > 0 ? n[n.length - 1] : null;
}
function fi(t) {
  if (t) {
    let e = t.getBoundingClientRect();
    return { top: e.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: e.left + (window.pageXOffset || Tt(document.documentElement) || Tt(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function hi(t, e) {
  return t ? t.offsetHeight : 0;
}
function oo(t, e = []) {
  let n = no(t);
  return n === null ? e : oo(n, e.concat([n]));
}
function mi(t) {
  let e = [];
  if (t) {
    let n = oo(t), o = /(auto|scroll)/, r = (i) => {
      try {
        let a = window.getComputedStyle(i, null);
        return o.test(a.getPropertyValue("overflow")) || o.test(a.getPropertyValue("overflowX")) || o.test(a.getPropertyValue("overflowY"));
      } catch {
        return !1;
      }
    };
    for (let i of n) {
      let a = i.nodeType === 1 && i.dataset.scrollselectors;
      if (a) {
        let l = a.split(",");
        for (let s of l) {
          let u = bt(i, s);
          u && r(u) && e.push(u);
        }
      }
      i.nodeType !== 9 && r(i) && e.push(i);
    }
  }
  return e;
}
function Jl() {
  if (window.getSelection) return window.getSelection().toString();
  if (document.getSelection) return document.getSelection().toString();
}
function Oe(t) {
  if (t) {
    let e = t.offsetWidth, n = getComputedStyle(t);
    return e -= parseFloat(n.paddingLeft) + parseFloat(n.paddingRight) + parseFloat(n.borderLeftWidth) + parseFloat(n.borderRightWidth), e;
  }
  return 0;
}
function bi() {
  return /(android)/i.test(navigator.userAgent);
}
function ro() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function Ql(t, e = "") {
  return Ie(t) ? t.matches(`button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            [href][clientHeight][clientWidth]:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e}`) : !1;
}
function ct(t) {
  return !!(t && t.offsetParent != null);
}
function gi() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}
function vi(t, e = "", n) {
  Ie(t) && n !== null && n !== void 0 && t.setAttribute(e, n);
}
var it = {};
function yi(t = "pui_id_") {
  return Object.hasOwn(it, t) || (it[t] = 0), it[t]++, `${t}${it[t]}`;
}
function Si() {
  let t = [], e = (a, l, s = 999) => {
    let u = r(a, l, s), d = u.value + (u.key === a ? 0 : s) + 1;
    return t.push({ key: a, value: d }), d;
  }, n = (a) => {
    t = t.filter((l) => l.value !== a);
  }, o = (a, l) => r(a).value, r = (a, l, s = 0) => [...t].reverse().find((u) => !0) || { key: a, value: s }, i = (a) => a && parseInt(a.style.zIndex, 10) || 0;
  return { get: i, set: (a, l, s) => {
    l && (l.style.zIndex = String(e(a, !0, s)));
  }, clear: (a) => {
    a && (n(i(a)), a.style.zIndex = "");
  }, getCurrent: (a) => o(a) };
}
var yt = Si(), wi = Object.defineProperty, $i = Object.defineProperties, Oi = Object.getOwnPropertyDescriptors, pt = Object.getOwnPropertySymbols, io = Object.prototype.hasOwnProperty, so = Object.prototype.propertyIsEnumerable, rn = (t, e, n) => e in t ? wi(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n, ne = (t, e) => {
  for (var n in e || (e = {})) io.call(e, n) && rn(t, n, e[n]);
  if (pt) for (var n of pt(e)) so.call(e, n) && rn(t, n, e[n]);
  return t;
}, St = (t, e) => $i(t, Oi(e)), pe = (t, e) => {
  var n = {};
  for (var o in t) io.call(t, o) && e.indexOf(o) < 0 && (n[o] = t[o]);
  if (t != null && pt) for (var o of pt(t)) e.indexOf(o) < 0 && so.call(t, o) && (n[o] = t[o]);
  return n;
}, Ci = Kt(), R = Ci, Be = /{([^}]*)}/g, ao = /(\d+\s+[\+\-\*\/]\s+\d+)/g, lo = /var\([^)]+\)/g;
function sn(t) {
  return G(t) ? t.replace(/[A-Z]/g, (e, n) => n === 0 ? e : "." + e.toLowerCase()).toLowerCase() : t;
}
function ki(t) {
  return de(t) && t.hasOwnProperty("$value") && t.hasOwnProperty("$type") ? t.$value : t;
}
function _i(t) {
  return t.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function Pt(t = "", e = "") {
  return _i(`${G(t, !1) && G(e, !1) ? `${t}-` : t}${e}`);
}
function uo(t = "", e = "") {
  return `--${Pt(t, e)}`;
}
function Ii(t = "") {
  let e = (t.match(/{/g) || []).length, n = (t.match(/}/g) || []).length;
  return (e + n) % 2 !== 0;
}
function co(t, e = "", n = "", o = [], r) {
  if (G(t)) {
    let i = t.trim();
    if (Ii(i)) return;
    if (Ce(i, Be)) {
      let a = i.replaceAll(Be, (l) => {
        let s = l.replace(/{|}/g, "").split(".").filter((u) => !o.some((d) => Ce(u, d)));
        return `var(${uo(n, Qn(s.join("-")))}${P(r) ? `, ${r}` : ""})`;
      });
      return Ce(a.replace(lo, "0"), ao) ? `calc(${a})` : a;
    }
    return i;
  } else if (Yr(t)) return t;
}
function Ti(t, e, n) {
  G(e, !1) && t.push(`${e}:${n};`);
}
function Le(t, e) {
  return t ? `${t}{${e}}` : "";
}
function po(t, e) {
  if (t.indexOf("dt(") === -1) return t;
  function n(a, l) {
    let s = [], u = 0, d = "", c = null, p = 0;
    for (; u <= a.length; ) {
      let f = a[u];
      if ((f === '"' || f === "'" || f === "`") && a[u - 1] !== "\\" && (c = c === f ? null : f), !c && (f === "(" && p++, f === ")" && p--, (f === "," || u === a.length) && p === 0)) {
        let m = d.trim();
        m.startsWith("dt(") ? s.push(po(m, l)) : s.push(o(m)), d = "", u++;
        continue;
      }
      f !== void 0 && (d += f), u++;
    }
    return s;
  }
  function o(a) {
    let l = a[0];
    if ((l === '"' || l === "'" || l === "`") && a[a.length - 1] === l) return a.slice(1, -1);
    let s = Number(a);
    return isNaN(s) ? a : s;
  }
  let r = [], i = [];
  for (let a = 0; a < t.length; a++) if (t[a] === "d" && t.slice(a, a + 3) === "dt(") i.push(a), a += 2;
  else if (t[a] === ")" && i.length > 0) {
    let l = i.pop();
    i.length === 0 && r.push([l, a]);
  }
  if (!r.length) return t;
  for (let a = r.length - 1; a >= 0; a--) {
    let [l, s] = r[a], u = t.slice(l + 3, s), d = n(u, e), c = e(...d);
    t = t.slice(0, l) + c + t.slice(s + 1);
  }
  return t;
}
var Xl = (t) => {
  var e;
  let n = E.getTheme(), o = xt(n, t, void 0, "variable"), r = (e = o?.match(/--[\w-]+/g)) == null ? void 0 : e[0], i = xt(n, t, void 0, "value");
  return { name: r, variable: o, value: i };
}, ke = (...t) => xt(E.getTheme(), ...t), xt = (t = {}, e, n, o) => {
  if (e) {
    let { variable: r, options: i } = E.defaults || {}, { prefix: a, transform: l } = t?.options || i || {}, s = Ce(e, Be) ? e : `{${e}}`;
    return o === "value" || _e(o) && l === "strict" ? E.getTokenValue(e) : co(s, void 0, a, [r.excludedKeyRegex], n);
  }
  return "";
};
function st(t, ...e) {
  if (t instanceof Array) {
    let n = t.reduce((o, r, i) => {
      var a;
      return o + r + ((a = Z(e[i], { dt: ke })) != null ? a : "");
    }, "");
    return po(n, ke);
  }
  return Z(t, { dt: ke });
}
function Pi(t, e = {}) {
  let n = E.defaults.variable, { prefix: o = n.prefix, selector: r = n.selector, excludedKeyRegex: i = n.excludedKeyRegex } = e, a = [], l = [], s = [{ node: t, path: o }];
  for (; s.length; ) {
    let { node: d, path: c } = s.pop();
    for (let p in d) {
      let f = d[p], m = ki(f), g = Ce(p, i) ? Pt(c) : Pt(c, Qn(p));
      if (de(m)) s.push({ node: m, path: g });
      else {
        let b = uo(g), v = co(m, g, o, [i]);
        Ti(l, b, v);
        let S = g;
        o && S.startsWith(o + "-") && (S = S.slice(o.length + 1)), a.push(S.replace(/-/g, "."));
      }
    }
  }
  let u = l.join("");
  return { value: l, tokens: a, declarations: u, css: Le(r, u) };
}
var te = { regex: { rules: { class: { pattern: /^\.([a-zA-Z][\w-]*)$/, resolve(t) {
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
    var o;
    return (o = e.map((r) => r.resolve(n)).find((r) => r.matched)) != null ? o : this.rules.custom.resolve(n);
  });
} }, _toVariables(t, e) {
  return Pi(t, { prefix: e?.prefix });
}, getCommon({ name: t = "", theme: e = {}, params: n, set: o, defaults: r }) {
  var i, a, l, s, u, d, c;
  let { preset: p, options: f } = e, m, g, b, v, S, C, h;
  if (P(p) && f.transform !== "strict") {
    let { primitive: w, semantic: L, extend: k } = p, x = L || {}, { colorScheme: N } = x, M = pe(x, ["colorScheme"]), j = k || {}, { colorScheme: F } = j, q = pe(j, ["colorScheme"]), Y = N || {}, { dark: D } = Y, K = pe(Y, ["dark"]), J = F || {}, { dark: me } = J, oe = pe(J, ["dark"]), Q = P(w) ? this._toVariables({ primitive: w }, f) : {}, re = P(M) ? this._toVariables({ semantic: M }, f) : {}, ve = P(K) ? this._toVariables({ light: K }, f) : {}, ot = P(D) ? this._toVariables({ dark: D }, f) : {}, Pe = P(q) ? this._toVariables({ semantic: q }, f) : {}, Yt = P(oe) ? this._toVariables({ light: oe }, f) : {}, Zt = P(me) ? this._toVariables({ dark: me }, f) : {}, [Lo, Ao] = [(i = Q.declarations) != null ? i : "", Q.tokens], [Eo, Vo] = [(a = re.declarations) != null ? a : "", re.tokens || []], [jo, zo] = [(l = ve.declarations) != null ? l : "", ve.tokens || []], [Fo, No] = [(s = ot.declarations) != null ? s : "", ot.tokens || []], [Mo, Do] = [(u = Pe.declarations) != null ? u : "", Pe.tokens || []], [Ro, Bo] = [(d = Yt.declarations) != null ? d : "", Yt.tokens || []], [Ho, Ko] = [(c = Zt.declarations) != null ? c : "", Zt.tokens || []];
    m = this.transformCSS(t, Lo, "light", "variable", f, o, r), g = Ao;
    let Uo = this.transformCSS(t, `${Eo}${jo}`, "light", "variable", f, o, r), Wo = this.transformCSS(t, `${Fo}`, "dark", "variable", f, o, r);
    b = `${Uo}${Wo}`, v = [.../* @__PURE__ */ new Set([...Vo, ...zo, ...No])];
    let Go = this.transformCSS(t, `${Mo}${Ro}color-scheme:light`, "light", "variable", f, o, r), qo = this.transformCSS(t, `${Ho}color-scheme:dark`, "dark", "variable", f, o, r);
    S = `${Go}${qo}`, C = [.../* @__PURE__ */ new Set([...Do, ...Bo, ...Ko])], h = Z(p.css, { dt: ke });
  }
  return { primitive: { css: m, tokens: g }, semantic: { css: b, tokens: v }, global: { css: S, tokens: C }, style: h };
}, getPreset({ name: t = "", preset: e = {}, options: n, params: o, set: r, defaults: i, selector: a }) {
  var l, s, u;
  let d, c, p;
  if (P(e) && n.transform !== "strict") {
    let f = t.replace("-directive", ""), m = e, { colorScheme: g, extend: b, css: v } = m, S = pe(m, ["colorScheme", "extend", "css"]), C = b || {}, { colorScheme: h } = C, w = pe(C, ["colorScheme"]), L = g || {}, { dark: k } = L, x = pe(L, ["dark"]), N = h || {}, { dark: M } = N, j = pe(N, ["dark"]), F = P(S) ? this._toVariables({ [f]: ne(ne({}, S), w) }, n) : {}, q = P(x) ? this._toVariables({ [f]: ne(ne({}, x), j) }, n) : {}, Y = P(k) ? this._toVariables({ [f]: ne(ne({}, k), M) }, n) : {}, [D, K] = [(l = F.declarations) != null ? l : "", F.tokens || []], [J, me] = [(s = q.declarations) != null ? s : "", q.tokens || []], [oe, Q] = [(u = Y.declarations) != null ? u : "", Y.tokens || []], re = this.transformCSS(f, `${D}${J}`, "light", "variable", n, r, i, a), ve = this.transformCSS(f, oe, "dark", "variable", n, r, i, a);
    d = `${re}${ve}`, c = [.../* @__PURE__ */ new Set([...K, ...me, ...Q])], p = Z(v, { dt: ke });
  }
  return { css: d, tokens: c, style: p };
}, getPresetC({ name: t = "", theme: e = {}, params: n, set: o, defaults: r }) {
  var i;
  let { preset: a, options: l } = e, s = (i = a?.components) == null ? void 0 : i[t];
  return this.getPreset({ name: t, preset: s, options: l, params: n, set: o, defaults: r });
}, getPresetD({ name: t = "", theme: e = {}, params: n, set: o, defaults: r }) {
  var i, a;
  let l = t.replace("-directive", ""), { preset: s, options: u } = e, d = ((i = s?.components) == null ? void 0 : i[l]) || ((a = s?.directives) == null ? void 0 : a[l]);
  return this.getPreset({ name: l, preset: d, options: u, params: n, set: o, defaults: r });
}, applyDarkColorScheme(t) {
  return !(t.darkModeSelector === "none" || t.darkModeSelector === !1);
}, getColorSchemeOption(t, e) {
  var n;
  return this.applyDarkColorScheme(t) ? this.regex.resolve(t.darkModeSelector === !0 ? e.options.darkModeSelector : (n = t.darkModeSelector) != null ? n : e.options.darkModeSelector) : [];
}, getLayerOrder(t, e = {}, n, o) {
  let { cssLayer: r } = e;
  return r ? `@layer ${Z(r.order || r.name || "primeui", n)}` : "";
}, getCommonStyleSheet({ name: t = "", theme: e = {}, params: n, props: o = {}, set: r, defaults: i }) {
  let a = this.getCommon({ name: t, theme: e, params: n, set: r, defaults: i }), l = Object.entries(o).reduce((s, [u, d]) => s.push(`${u}="${d}"`) && s, []).join(" ");
  return Object.entries(a || {}).reduce((s, [u, d]) => {
    if (de(d) && Object.hasOwn(d, "css")) {
      let c = De(d.css), p = `${u}-variables`;
      s.push(`<style type="text/css" data-primevue-style-id="${p}" ${l}>${c}</style>`);
    }
    return s;
  }, []).join("");
}, getStyleSheet({ name: t = "", theme: e = {}, params: n, props: o = {}, set: r, defaults: i }) {
  var a;
  let l = { name: t, theme: e, params: n, set: r, defaults: i }, s = (a = t.includes("-directive") ? this.getPresetD(l) : this.getPresetC(l)) == null ? void 0 : a.css, u = Object.entries(o).reduce((d, [c, p]) => d.push(`${c}="${p}"`) && d, []).join(" ");
  return s ? `<style type="text/css" data-primevue-style-id="${t}-variables" ${u}>${De(s)}</style>` : "";
}, createTokens(t = {}, e, n = "", o = "", r = {}) {
  let i = function(l, s = {}, u = []) {
    if (u.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: l, path: this.path, paths: s, value: void 0 };
    u.push(this.path), s.name = this.path, s.binding || (s.binding = {});
    let d = this.value;
    if (typeof this.value == "string" && Be.test(this.value)) {
      let c = this.value.trim().replace(Be, (p) => {
        var f;
        let m = p.slice(1, -1), g = this.tokens[m];
        if (!g) return console.warn(`Token not found for path: ${m}`), "__UNRESOLVED__";
        let b = g.computed(l, s, u);
        return Array.isArray(b) && b.length === 2 ? `light-dark(${b[0].value},${b[1].value})` : (f = b?.value) != null ? f : "__UNRESOLVED__";
      });
      d = ao.test(c.replace(lo, "0")) ? `calc(${c})` : c;
    }
    return _e(s.binding) && delete s.binding, u.pop(), { colorScheme: l, path: this.path, paths: s, value: d.includes("__UNRESOLVED__") ? void 0 : d };
  }, a = (l, s, u) => {
    Object.entries(l).forEach(([d, c]) => {
      let p = Ce(d, e.variable.excludedKeyRegex) ? s : s ? `${s}.${sn(d)}` : sn(d), f = u ? `${u}.${d}` : d;
      de(c) ? a(c, p, f) : (r[p] || (r[p] = { paths: [], computed: (m, g = {}, b = []) => {
        if (r[p].paths.length === 1) return r[p].paths[0].computed(r[p].paths[0].scheme, g.binding, b);
        if (m && m !== "none") for (let v = 0; v < r[p].paths.length; v++) {
          let S = r[p].paths[v];
          if (S.scheme === m) return S.computed(m, g.binding, b);
        }
        return r[p].paths.map((v) => v.computed(v.scheme, g[v.scheme], b));
      } }), r[p].paths.push({ path: f, value: c, scheme: f.includes("colorScheme.light") ? "light" : f.includes("colorScheme.dark") ? "dark" : "none", computed: i, tokens: r }));
    });
  };
  return a(t, n, o), r;
}, getTokenValue(t, e, n) {
  var o;
  let r = ((l) => l.split(".").filter((s) => !Ce(s.toLowerCase(), n.variable.excludedKeyRegex)).join("."))(e), i = e.includes("colorScheme.light") ? "light" : e.includes("colorScheme.dark") ? "dark" : void 0, a = [(o = t[r]) == null ? void 0 : o.computed(i)].flat().filter((l) => l);
  return a.length === 1 ? a[0].value : a.reduce((l = {}, s) => {
    let u = s, { colorScheme: d } = u, c = pe(u, ["colorScheme"]);
    return l[d] = c, l;
  }, void 0);
}, getSelectorRule(t, e, n, o) {
  return n === "class" || n === "attr" ? Le(P(e) ? `${t}${e},${t} ${e}` : t, o) : Le(t, Le(e ?? ":root,:host", o));
}, transformCSS(t, e, n, o, r = {}, i, a, l) {
  if (P(e)) {
    let { cssLayer: s } = r;
    if (o !== "style") {
      let u = this.getColorSchemeOption(r, a);
      e = n === "dark" ? u.reduce((d, { type: c, selector: p }) => (P(p) && (d += p.includes("[CSS]") ? p.replace("[CSS]", e) : this.getSelectorRule(p, l, c, e)), d), "") : Le(l ?? ":root,:host", e);
    }
    if (s) {
      let u = { name: "primeui" };
      de(s) && (u.name = Z(s.name, { name: t, type: o })), P(u.name) && (e = Le(`@layer ${u.name}`, e), i?.layerNames(u.name));
    }
    return e;
  }
  return "";
} }, E = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(t = {}) {
  let { theme: e } = t;
  e && (this._theme = St(ne({}, e), { options: ne(ne({}, this.defaults.options), e.options) }), this._tokens = te.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
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
  this.update({ theme: t }), R.emit("theme:change", t);
}, getPreset() {
  return this.preset;
}, setPreset(t) {
  this._theme = St(ne({}, this.theme), { preset: t }), this._tokens = te.createTokens(t, this.defaults), this.clearLoadedStyleNames(), R.emit("preset:change", t), R.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(t) {
  this._theme = St(ne({}, this.theme), { options: t }), this.clearLoadedStyleNames(), R.emit("options:change", t), R.emit("theme:change", this.theme);
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
  return te.getTokenValue(this.tokens, t, this.defaults);
}, getCommon(t = "", e) {
  return te.getCommon({ name: t, theme: this.theme, params: e, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getComponent(t = "", e) {
  let n = { name: t, theme: this.theme, params: e, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return te.getPresetC(n);
}, getDirective(t = "", e) {
  let n = { name: t, theme: this.theme, params: e, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return te.getPresetD(n);
}, getCustomPreset(t = "", e, n, o) {
  let r = { name: t, preset: e, options: this.options, selector: n, params: o, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return te.getPreset(r);
}, getLayerOrderCSS(t = "") {
  return te.getLayerOrder(t, this.options, { names: this.getLayerNames() }, this.defaults);
}, transformCSS(t = "", e, n = "style", o) {
  return te.transformCSS(t, e, o, n, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
}, getCommonStyleSheet(t = "", e, n = {}) {
  return te.getCommonStyleSheet({ name: t, theme: this.theme, params: e, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getStyleSheet(t, e, n = {}) {
  return te.getStyleSheet({ name: t, theme: this.theme, params: e, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, onStyleMounted(t) {
  this._loadingStyles.add(t);
}, onStyleUpdated(t) {
  this._loadingStyles.add(t);
}, onStyleLoaded(t, { name: e }) {
  this._loadingStyles.size && (this._loadingStyles.delete(e), R.emit(`theme:${e}:load`, t), !this._loadingStyles.size && R.emit("theme:load"));
} }, B = {
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
    if (Array.isArray(t) || (n = xi(t)) || e) {
      n && (t = n);
      var o = 0, r = function() {
      };
      return { s: r, n: function() {
        return o >= t.length ? { done: !0 } : { done: !1, value: t[o++] };
      }, e: function(u) {
        throw u;
      }, f: r };
    }
    throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }
  var i, a = !0, l = !1;
  return { s: function() {
    n = n.call(t);
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
function xi(t, e) {
  if (t) {
    if (typeof t == "string") return ln(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? ln(t, e) : void 0;
  }
}
function ln(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
var Li = {
  filter: function(e, n, o, r, i) {
    var a = [];
    if (!e)
      return a;
    var l = an(e), s;
    try {
      for (l.s(); !(s = l.n()).done; ) {
        var u = s.value;
        if (typeof u == "string") {
          if (this.filters[r](u, o, i)) {
            a.push(u);
            continue;
          }
        } else {
          var d = an(n), c;
          try {
            for (d.s(); !(c = d.n()).done; ) {
              var p = c.value, f = fe(u, p);
              if (this.filters[r](f, o, i)) {
                a.push(u);
                break;
              }
            }
          } catch (m) {
            d.e(m);
          } finally {
            d.f();
          }
        }
      }
    } catch (m) {
      l.e(m);
    } finally {
      l.f();
    }
    return a;
  },
  filters: {
    startsWith: function(e, n, o) {
      if (n == null || n === "")
        return !0;
      if (e == null)
        return !1;
      var r = X(n.toString()).toLocaleLowerCase(o), i = X(e.toString()).toLocaleLowerCase(o);
      return i.slice(0, r.length) === r;
    },
    contains: function(e, n, o) {
      if (n == null || n === "")
        return !0;
      if (e == null)
        return !1;
      var r = X(n.toString()).toLocaleLowerCase(o), i = X(e.toString()).toLocaleLowerCase(o);
      return i.indexOf(r) !== -1;
    },
    notContains: function(e, n, o) {
      if (n == null || n === "")
        return !0;
      if (e == null)
        return !1;
      var r = X(n.toString()).toLocaleLowerCase(o), i = X(e.toString()).toLocaleLowerCase(o);
      return i.indexOf(r) === -1;
    },
    endsWith: function(e, n, o) {
      if (n == null || n === "")
        return !0;
      if (e == null)
        return !1;
      var r = X(n.toString()).toLocaleLowerCase(o), i = X(e.toString()).toLocaleLowerCase(o);
      return i.indexOf(r, i.length - r.length) !== -1;
    },
    equals: function(e, n, o) {
      return n == null || n === "" ? !0 : e == null ? !1 : e.getTime && n.getTime ? e.getTime() === n.getTime() : X(e.toString()).toLocaleLowerCase(o) == X(n.toString()).toLocaleLowerCase(o);
    },
    notEquals: function(e, n, o) {
      return n == null || n === "" ? !1 : e == null ? !0 : e.getTime && n.getTime ? e.getTime() !== n.getTime() : X(e.toString()).toLocaleLowerCase(o) != X(n.toString()).toLocaleLowerCase(o);
    },
    in: function(e, n) {
      if (n == null || n.length === 0)
        return !0;
      for (var o = 0; o < n.length; o++)
        if (Yn(e, n[o]))
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
}, Ai = `
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
function He(t) {
  "@babel/helpers - typeof";
  return He = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, He(t);
}
function un(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    e && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(t, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function dn(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? un(Object(n), !0).forEach(function(o) {
      Ei(t, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : un(Object(n)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return t;
}
function Ei(t, e, n) {
  return (e = Vi(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Vi(t) {
  var e = ji(t, "string");
  return He(e) == "symbol" ? e : e + "";
}
function ji(t, e) {
  if (He(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (He(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
function zi(t) {
  var e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  Jt() && Jt().components ? Mn(t) : e ? t() : tr(t);
}
var Fi = 0;
function Ni(t) {
  var e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = he(!1), o = he(t), r = he(null), i = ro() ? window.document : void 0, a = e.document, l = a === void 0 ? i : a, s = e.immediate, u = s === void 0 ? !0 : s, d = e.manual, c = d === void 0 ? !1 : d, p = e.name, f = p === void 0 ? "style_".concat(++Fi) : p, m = e.id, g = m === void 0 ? void 0 : m, b = e.media, v = b === void 0 ? void 0 : b, S = e.nonce, C = S === void 0 ? void 0 : S, h = e.first, w = h === void 0 ? !1 : h, L = e.onMounted, k = L === void 0 ? void 0 : L, x = e.onUpdated, N = x === void 0 ? void 0 : x, M = e.onLoad, j = M === void 0 ? void 0 : M, F = e.props, q = F === void 0 ? {} : F, Y = function() {
  }, D = function(me) {
    var oe = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (l) {
      var Q = dn(dn({}, q), oe), re = Q.name || f, ve = Q.id || g, ot = Q.nonce || C;
      r.value = l.querySelector('style[data-primevue-style-id="'.concat(re, '"]')) || l.getElementById(ve) || l.createElement("style"), r.value.isConnected || (o.value = me || t, dt(r.value, {
        type: "text/css",
        id: ve,
        media: v,
        nonce: ot
      }), w ? l.head.prepend(r.value) : l.head.appendChild(r.value), vi(r.value, "data-primevue-style-id", re), dt(r.value, Q), r.value.onload = function(Pe) {
        return j?.(Pe, {
          name: re
        });
      }, k?.(re)), !n.value && (Y = Ae(o, function(Pe) {
        r.value.textContent = Pe, N?.(re);
      }, {
        immediate: !0
      }), n.value = !0);
    }
  }, K = function() {
    !l || !n.value || (Y(), ai(r.value) && l.head.removeChild(r.value), n.value = !1, r.value = null);
  };
  return u && !c && zi(D), {
    id: g,
    name: f,
    el: r,
    css: o,
    unload: K,
    load: D,
    isLoaded: er(n)
  };
}
function Ke(t) {
  "@babel/helpers - typeof";
  return Ke = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Ke(t);
}
var cn, pn, fn, hn;
function mn(t, e) {
  return Bi(t) || Ri(t, e) || Di(t, e) || Mi();
}
function Mi() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Di(t, e) {
  if (t) {
    if (typeof t == "string") return bn(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? bn(t, e) : void 0;
  }
}
function bn(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function Ri(t, e) {
  var n = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (n != null) {
    var o, r, i, a, l = [], s = !0, u = !1;
    try {
      if (i = (n = n.call(t)).next, e !== 0) for (; !(s = (o = i.call(n)).done) && (l.push(o.value), l.length !== e); s = !0) ;
    } catch (d) {
      u = !0, r = d;
    } finally {
      try {
        if (!s && n.return != null && (a = n.return(), Object(a) !== a)) return;
      } finally {
        if (u) throw r;
      }
    }
    return l;
  }
}
function Bi(t) {
  if (Array.isArray(t)) return t;
}
function gn(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    e && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(t, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function wt(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? gn(Object(n), !0).forEach(function(o) {
      Hi(t, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : gn(Object(n)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return t;
}
function Hi(t, e, n) {
  return (e = Ki(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Ki(t) {
  var e = Ui(t, "string");
  return Ke(e) == "symbol" ? e : e + "";
}
function Ui(t, e) {
  if (Ke(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (Ke(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
function at(t, e) {
  return e || (e = t.slice(0)), Object.freeze(Object.defineProperties(t, { raw: { value: Object.freeze(e) } }));
}
var Wi = function(e) {
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
}, Gi = {}, qi = {}, V = {
  name: "base",
  css: Wi,
  style: Ai,
  classes: Gi,
  inlineStyles: qi,
  load: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(i) {
      return i;
    }, r = o(st(cn || (cn = at(["", ""])), e));
    return P(r) ? Ni(De(r), wt({
      name: this.name
    }, n)) : {};
  },
  loadCSS: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    return this.load(this.css, e);
  },
  loadStyle: function() {
    var e = this, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
    return this.load(this.style, n, function() {
      var r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
      return E.transformCSS(n.name || e.name, "".concat(r).concat(st(pn || (pn = at(["", ""])), o)));
    });
  },
  getCommonTheme: function(e) {
    return E.getCommon(this.name, e);
  },
  getComponentTheme: function(e) {
    return E.getComponent(this.name, e);
  },
  getDirectiveTheme: function(e) {
    return E.getDirective(this.name, e);
  },
  getPresetTheme: function(e, n, o) {
    return E.getCustomPreset(this.name, e, n, o);
  },
  getLayerOrderThemeCSS: function() {
    return E.getLayerOrderCSS(this.name);
  },
  getStyleSheet: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.css) {
      var o = Z(this.css, {
        dt: ke
      }) || "", r = De(st(fn || (fn = at(["", "", ""])), o, e)), i = Object.entries(n).reduce(function(a, l) {
        var s = mn(l, 2), u = s[0], d = s[1];
        return a.push("".concat(u, '="').concat(d, '"')) && a;
      }, []).join(" ");
      return P(r) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(i, ">").concat(r, "</style>") : "";
    }
    return "";
  },
  getCommonThemeStyleSheet: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return E.getCommonStyleSheet(this.name, e, n);
  },
  getThemeStyleSheet: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = [E.getStyleSheet(this.name, e, n)];
    if (this.style) {
      var r = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), i = st(hn || (hn = at(["", ""])), Z(this.style, {
        dt: ke
      })), a = De(E.transformCSS(r, i)), l = Object.entries(n).reduce(function(s, u) {
        var d = mn(u, 2), c = d[0], p = d[1];
        return s.push("".concat(c, '="').concat(p, '"')) && s;
      }, []).join(" ");
      P(a) && o.push('<style type="text/css" data-primevue-style-id="'.concat(r, '" ').concat(l, ">").concat(a, "</style>"));
    }
    return o.join("");
  },
  extend: function(e) {
    return wt(wt({}, this), {}, {
      css: void 0,
      style: void 0
    }, e);
  }
}, ge = Kt();
function Ue(t) {
  "@babel/helpers - typeof";
  return Ue = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Ue(t);
}
function vn(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    e && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(t, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function lt(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? vn(Object(n), !0).forEach(function(o) {
      Yi(t, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : vn(Object(n)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return t;
}
function Yi(t, e, n) {
  return (e = Zi(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Zi(t) {
  var e = Ji(t, "string");
  return Ue(e) == "symbol" ? e : e + "";
}
function Ji(t, e) {
  if (Ue(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (Ue(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Qi = {
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
    text: [B.STARTS_WITH, B.CONTAINS, B.NOT_CONTAINS, B.ENDS_WITH, B.EQUALS, B.NOT_EQUALS],
    numeric: [B.EQUALS, B.NOT_EQUALS, B.LESS_THAN, B.LESS_THAN_OR_EQUAL_TO, B.GREATER_THAN, B.GREATER_THAN_OR_EQUAL_TO],
    date: [B.DATE_IS, B.DATE_IS_NOT, B.DATE_BEFORE, B.DATE_AFTER]
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
}, Xi = Symbol();
function es(t, e) {
  var n = {
    config: nr(e)
  };
  return t.config.globalProperties.$primevue = n, t.provide(Xi, n), ts(), ns(t, n), n;
}
var Ve = [];
function ts() {
  R.clear(), Ve.forEach(function(t) {
    return t?.();
  }), Ve = [];
}
function ns(t, e) {
  var n = he(!1), o = function() {
    var u;
    if (((u = e.config) === null || u === void 0 ? void 0 : u.theme) !== "none" && !E.isStyleNameLoaded("common")) {
      var d, c, p = ((d = V.getCommonTheme) === null || d === void 0 ? void 0 : d.call(V)) || {}, f = p.primitive, m = p.semantic, g = p.global, b = p.style, v = {
        nonce: (c = e.config) === null || c === void 0 || (c = c.csp) === null || c === void 0 ? void 0 : c.nonce
      };
      V.load(f?.css, lt({
        name: "primitive-variables"
      }, v)), V.load(m?.css, lt({
        name: "semantic-variables"
      }, v)), V.load(g?.css, lt({
        name: "global-variables"
      }, v)), V.loadStyle(lt({
        name: "global-style"
      }, v), b), E.setLoadedStyleName("common");
    }
  };
  R.on("theme:change", function(s) {
    n.value || (t.config.globalProperties.$primevue.config.theme = s, n.value = !0);
  });
  var r = Ae(e.config, function(s, u) {
    ge.emit("config:change", {
      newValue: s,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), i = Ae(function() {
    return e.config.ripple;
  }, function(s, u) {
    ge.emit("config:ripple:change", {
      newValue: s,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), a = Ae(function() {
    return e.config.theme;
  }, function(s, u) {
    n.value || E.setTheme(s), e.config.unstyled || o(), n.value = !1, ge.emit("config:theme:change", {
      newValue: s,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !1
  }), l = Ae(function() {
    return e.config.unstyled;
  }, function(s, u) {
    !s && e.config.theme && o(), ge.emit("config:unstyled:change", {
      newValue: s,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  });
  Ve.push(r), Ve.push(i), Ve.push(a), Ve.push(l);
}
var os = {
  install: function(e, n) {
    var o = Jr(Qi, n);
    es(e, o);
  }
}, Wt = {
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
    this.mounted = ro();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function rs(t, e, n, o, r, i) {
  return i.inline ? A(t.$slots, "default", {
    key: 0
  }) : r.mounted ? ($(), ae(Dn, {
    key: 1,
    to: n.appendTo
  }, [A(t.$slots, "default")], 8, ["to"])) : W("", !0);
}
Wt.render = rs;
var be = {
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
function is() {
  var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pc", e = or();
  return "".concat(t).concat(e.replace("v-", "").replaceAll("-", "_"));
}
var yn = V.extend({
  name: "common"
});
function We(t) {
  "@babel/helpers - typeof";
  return We = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, We(t);
}
function ss(t) {
  return mo(t) || as(t) || ho(t) || fo();
}
function as(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Fe(t, e) {
  return mo(t) || ls(t, e) || ho(t, e) || fo();
}
function fo() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ho(t, e) {
  if (t) {
    if (typeof t == "string") return Lt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Lt(t, e) : void 0;
  }
}
function Lt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function ls(t, e) {
  var n = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (n != null) {
    var o, r, i, a, l = [], s = !0, u = !1;
    try {
      if (i = (n = n.call(t)).next, e === 0) {
        if (Object(n) !== n) return;
        s = !1;
      } else for (; !(s = (o = i.call(n)).done) && (l.push(o.value), l.length !== e); s = !0) ;
    } catch (d) {
      u = !0, r = d;
    } finally {
      try {
        if (!s && n.return != null && (a = n.return(), Object(a) !== a)) return;
      } finally {
        if (u) throw r;
      }
    }
    return l;
  }
}
function mo(t) {
  if (Array.isArray(t)) return t;
}
function Sn(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    e && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(t, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function _(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Sn(Object(n), !0).forEach(function(o) {
      Me(t, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Sn(Object(n)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return t;
}
function Me(t, e, n) {
  return (e = us(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function us(t) {
  var e = ds(t, "string");
  return We(e) == "symbol" ? e : e + "";
}
function ds(t, e) {
  if (We(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (We(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Te = {
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
        R.off("theme:change", this._loadCoreStyles), e || (this._loadCoreStyles(), this._themeChangeListener(this._loadCoreStyles));
      }
    },
    dt: {
      immediate: !0,
      handler: function(e, n) {
        var o = this;
        R.off("theme:change", this._themeScopedListener), e ? (this._loadScopedThemeStyles(e), this._themeScopedListener = function() {
          return o._loadScopedThemeStyles(e);
        }, this._themeChangeListener(this._themeScopedListener)) : this._unloadScopedThemeStyles();
      }
    }
  },
  scopedStyleEl: void 0,
  rootEl: void 0,
  uid: void 0,
  $attrSelector: void 0,
  beforeCreate: function() {
    var e, n, o, r, i, a, l, s, u, d, c, p = (e = this.pt) === null || e === void 0 ? void 0 : e._usept, f = p ? (n = this.pt) === null || n === void 0 || (n = n.originalValue) === null || n === void 0 ? void 0 : n[this.$.type.name] : void 0, m = p ? (o = this.pt) === null || o === void 0 || (o = o.value) === null || o === void 0 ? void 0 : o[this.$.type.name] : this.pt;
    (r = m || f) === null || r === void 0 || (r = r.hooks) === null || r === void 0 || (i = r.onBeforeCreate) === null || i === void 0 || i.call(r);
    var g = (a = this.$primevueConfig) === null || a === void 0 || (a = a.pt) === null || a === void 0 ? void 0 : a._usept, b = g ? (l = this.$primevue) === null || l === void 0 || (l = l.config) === null || l === void 0 || (l = l.pt) === null || l === void 0 ? void 0 : l.originalValue : void 0, v = g ? (s = this.$primevue) === null || s === void 0 || (s = s.config) === null || s === void 0 || (s = s.pt) === null || s === void 0 ? void 0 : s.value : (u = this.$primevue) === null || u === void 0 || (u = u.config) === null || u === void 0 ? void 0 : u.pt;
    (d = v || b) === null || d === void 0 || (d = d[this.$.type.name]) === null || d === void 0 || (d = d.hooks) === null || d === void 0 || (c = d.onBeforeCreate) === null || c === void 0 || c.call(d), this.$attrSelector = is(), this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
  },
  created: function() {
    this._hook("onCreated");
  },
  beforeMount: function() {
    var e;
    this.rootEl = bt(Ie(this.$el) ? this.$el : (e = this.$el) === null || e === void 0 ? void 0 : e.parentElement, "[".concat(this.$attrSelector, "]")), this.rootEl && (this.rootEl.$pc = _({
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
        var n = this._usePT(this._getPT(this.pt, this.$.type.name), this._getOptionValue, "hooks.".concat(e)), o = this._useDefaultPT(this._getOptionValue, "hooks.".concat(e));
        n?.(), o?.();
      }
    },
    _mergeProps: function(e) {
      for (var n = arguments.length, o = new Array(n > 1 ? n - 1 : 0), r = 1; r < n; r++)
        o[r - 1] = arguments[r];
      return mt(e) ? e.apply(void 0, o) : y.apply(void 0, o);
    },
    _load: function() {
      be.isStyleNameLoaded("base") || (V.loadCSS(this.$styleOptions), this._loadGlobalStyles(), be.setLoadedStyleName("base")), this._loadThemeStyles();
    },
    _loadStyles: function() {
      this._load(), this._themeChangeListener(this._load);
    },
    _loadCoreStyles: function() {
      var e, n;
      !be.isStyleNameLoaded((e = this.$style) === null || e === void 0 ? void 0 : e.name) && (n = this.$style) !== null && n !== void 0 && n.name && (yn.loadCSS(this.$styleOptions), this.$options.style && this.$style.loadCSS(this.$styleOptions), be.setLoadedStyleName(this.$style.name));
    },
    _loadGlobalStyles: function() {
      var e = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
      P(e) && V.load(e, _({
        name: "global"
      }, this.$styleOptions));
    },
    _loadThemeStyles: function() {
      var e, n;
      if (!(this.isUnstyled || this.$theme === "none")) {
        if (!E.isStyleNameLoaded("common")) {
          var o, r, i = ((o = this.$style) === null || o === void 0 || (r = o.getCommonTheme) === null || r === void 0 ? void 0 : r.call(o)) || {}, a = i.primitive, l = i.semantic, s = i.global, u = i.style;
          V.load(a?.css, _({
            name: "primitive-variables"
          }, this.$styleOptions)), V.load(l?.css, _({
            name: "semantic-variables"
          }, this.$styleOptions)), V.load(s?.css, _({
            name: "global-variables"
          }, this.$styleOptions)), V.loadStyle(_({
            name: "global-style"
          }, this.$styleOptions), u), E.setLoadedStyleName("common");
        }
        if (!E.isStyleNameLoaded((e = this.$style) === null || e === void 0 ? void 0 : e.name) && (n = this.$style) !== null && n !== void 0 && n.name) {
          var d, c, p, f, m = ((d = this.$style) === null || d === void 0 || (c = d.getComponentTheme) === null || c === void 0 ? void 0 : c.call(d)) || {}, g = m.css, b = m.style;
          (p = this.$style) === null || p === void 0 || p.load(g, _({
            name: "".concat(this.$style.name, "-variables")
          }, this.$styleOptions)), (f = this.$style) === null || f === void 0 || f.loadStyle(_({
            name: "".concat(this.$style.name, "-style")
          }, this.$styleOptions), b), E.setLoadedStyleName(this.$style.name);
        }
        if (!E.isStyleNameLoaded("layer-order")) {
          var v, S, C = (v = this.$style) === null || v === void 0 || (S = v.getLayerOrderThemeCSS) === null || S === void 0 ? void 0 : S.call(v);
          V.load(C, _({
            name: "layer-order",
            first: !0
          }, this.$styleOptions)), E.setLoadedStyleName("layer-order");
        }
      }
    },
    _loadScopedThemeStyles: function(e) {
      var n, o, r, i = ((n = this.$style) === null || n === void 0 || (o = n.getPresetTheme) === null || o === void 0 ? void 0 : o.call(n, e, "[".concat(this.$attrSelector, "]"))) || {}, a = i.css, l = (r = this.$style) === null || r === void 0 ? void 0 : r.load(a, _({
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
      be.clearLoadedStyleNames(), R.on("theme:change", e);
    },
    _removeThemeListeners: function() {
      R.off("theme:change", this._loadCoreStyles), R.off("theme:change", this._load), R.off("theme:change", this._themeScopedListener);
    },
    _getHostInstance: function(e) {
      return e ? this.$options.hostName ? e.$.type.name === this.$options.hostName ? e : this._getHostInstance(e.$parentInstance) : e.$parentInstance : void 0;
    },
    _getPropValue: function(e) {
      var n;
      return this[e] || ((n = this._getHostInstance(this)) === null || n === void 0 ? void 0 : n[e]);
    },
    _getOptionValue: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return Ht(e, n, o);
    },
    _getPTValue: function() {
      var e, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, i = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, a = /./g.test(o) && !!r[o.split(".")[0]], l = this._getPropValue("ptOptions") || ((e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.ptOptions) || {}, s = l.mergeSections, u = s === void 0 ? !0 : s, d = l.mergeProps, c = d === void 0 ? !1 : d, p = i ? a ? this._useGlobalPT(this._getPTClassValue, o, r) : this._useDefaultPT(this._getPTClassValue, o, r) : void 0, f = a ? void 0 : this._getPTSelf(n, this._getPTClassValue, o, _(_({}, r), {}, {
        global: p || {}
      })), m = this._getPTDatasets(o);
      return u || !u && f ? c ? this._mergeProps(c, p, f, m) : _(_(_({}, p), f), m) : _(_({}, f), m);
    },
    _getPTSelf: function() {
      for (var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length, o = new Array(n > 1 ? n - 1 : 0), r = 1; r < n; r++)
        o[r - 1] = arguments[r];
      return y(
        this._usePT.apply(this, [this._getPT(e, this.$name)].concat(o)),
        // Exp; <component :pt="{}"
        this._usePT.apply(this, [this.$_attrsPT].concat(o))
        // Exp; <component :pt:[passthrough_key]:[attribute]="{value}" or <component :pt:[passthrough_key]="() =>{value}"
      );
    },
    _getPTDatasets: function() {
      var e, n, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = "data-pc-", i = o === "root" && P((e = this.pt) === null || e === void 0 ? void 0 : e["data-pc-section"]);
      return o !== "transition" && _(_({}, o === "root" && _(_(Me({}, "".concat(r, "name"), le(i ? (n = this.pt) === null || n === void 0 ? void 0 : n["data-pc-section"] : this.$.type.name)), i && Me({}, "".concat(r, "extend"), le(this.$.type.name))), {}, Me({}, "".concat(this.$attrSelector), ""))), {}, Me({}, "".concat(r, "section"), le(o)));
    },
    _getPTClassValue: function() {
      var e = this._getOptionValue.apply(this, arguments);
      return G(e) || Jn(e) ? {
        class: e
      } : e;
    },
    _getPT: function(e) {
      var n = this, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 ? arguments[2] : void 0, i = function(l) {
        var s, u = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, d = r ? r(l) : l, c = le(o), p = le(n.$name);
        return (s = u ? c !== p ? d?.[c] : void 0 : d?.[c]) !== null && s !== void 0 ? s : d;
      };
      return e != null && e.hasOwnProperty("_usept") ? {
        _usept: e._usept,
        originalValue: i(e.originalValue),
        value: i(e.value)
      } : i(e, !0);
    },
    _usePT: function(e, n, o, r) {
      var i = function(g) {
        return n(g, o, r);
      };
      if (e != null && e.hasOwnProperty("_usept")) {
        var a, l = e._usept || ((a = this.$primevueConfig) === null || a === void 0 ? void 0 : a.ptOptions) || {}, s = l.mergeSections, u = s === void 0 ? !0 : s, d = l.mergeProps, c = d === void 0 ? !1 : d, p = i(e.originalValue), f = i(e.value);
        return p === void 0 && f === void 0 ? void 0 : G(f) ? f : G(p) ? p : u || !u && f ? c ? this._mergeProps(c, p, f) : _(_({}, p), f) : f;
      }
      return i(e);
    },
    _useGlobalPT: function(e, n, o) {
      return this._usePT(this.globalPT, e, n, o);
    },
    _useDefaultPT: function(e, n, o) {
      return this._usePT(this.defaultPT, e, n, o);
    },
    ptm: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this._getPTValue(this.pt, e, _(_({}, this.$params), n));
    },
    ptmi: function() {
      var e, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = y(this.$_attrsWithoutPT, this.ptm(n, o));
      return r?.hasOwnProperty("id") && ((e = r.id) !== null && e !== void 0 || (r.id = this.$id)), r;
    },
    ptmo: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return this._getPTValue(e, n, _({
        instance: this
      }, o), !1);
    },
    cx: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this.isUnstyled ? void 0 : this._getOptionValue(this.$style.classes, e, _(_({}, this.$params), n));
    },
    sx: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      if (n) {
        var r = this._getOptionValue(this.$style.inlineStyles, e, _(_({}, this.$params), o)), i = this._getOptionValue(yn.inlineStyles, e, _(_({}, this.$params), o));
        return [i, r];
      }
    }
  },
  computed: {
    globalPT: function() {
      var e, n = this;
      return this._getPT((e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.pt, void 0, function(o) {
        return Z(o, {
          instance: n
        });
      });
    },
    defaultPT: function() {
      var e, n = this;
      return this._getPT((e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.pt, void 0, function(o) {
        return n._getOptionValue(o, n.$name, _({}, n.$params)) || Z(o, _({}, n.$params));
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
      return Object.fromEntries(Object.entries(this.$props).filter(function(o) {
        var r = Fe(o, 1), i = r[0];
        return n?.includes(i);
      }));
    },
    $theme: function() {
      var e;
      return (e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.theme;
    },
    $style: function() {
      return _(_({
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
        var n = Fe(e, 1), o = n[0];
        return o?.startsWith("pt:");
      }).reduce(function(e, n) {
        var o = Fe(n, 2), r = o[0], i = o[1], a = r.split(":"), l = ss(a), s = Lt(l).slice(1);
        return s?.reduce(function(u, d, c, p) {
          return !u[d] && (u[d] = c === p.length - 1 ? i : {}), u[d];
        }, e), e;
      }, {});
    },
    $_attrsWithoutPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(e) {
        var n = Fe(e, 1), o = n[0];
        return !(o != null && o.startsWith("pt:"));
      }).reduce(function(e, n) {
        var o = Fe(n, 2), r = o[0], i = o[1];
        return e[r] = i, e;
      }, {});
    }
  }
}, cs = `
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
`, ps = V.extend({
  name: "baseicon",
  css: cs
});
function Ge(t) {
  "@babel/helpers - typeof";
  return Ge = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Ge(t);
}
function wn(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    e && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(t, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function $n(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? wn(Object(n), !0).forEach(function(o) {
      fs(t, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : wn(Object(n)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return t;
}
function fs(t, e, n) {
  return (e = hs(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function hs(t) {
  var e = ms(t, "string");
  return Ge(e) == "symbol" ? e : e + "";
}
function ms(t, e) {
  if (Ge(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (Ge(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var ze = {
  name: "BaseIcon",
  extends: Te,
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
  style: ps,
  provide: function() {
    return {
      $pcIcon: this,
      $parentInstance: this
    };
  },
  methods: {
    pti: function() {
      var e = _e(this.label);
      return $n($n({}, !this.isUnstyled && {
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
function qe(t) {
  "@babel/helpers - typeof";
  return qe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, qe(t);
}
function On(t, e) {
  return ys(t) || vs(t, e) || gs(t, e) || bs();
}
function bs() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function gs(t, e) {
  if (t) {
    if (typeof t == "string") return Cn(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Cn(t, e) : void 0;
  }
}
function Cn(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function vs(t, e) {
  var n = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (n != null) {
    var o, r, i, a, l = [], s = !0, u = !1;
    try {
      if (i = (n = n.call(t)).next, e !== 0) for (; !(s = (o = i.call(n)).done) && (l.push(o.value), l.length !== e); s = !0) ;
    } catch (d) {
      u = !0, r = d;
    } finally {
      try {
        if (!s && n.return != null && (a = n.return(), Object(a) !== a)) return;
      } finally {
        if (u) throw r;
      }
    }
    return l;
  }
}
function ys(t) {
  if (Array.isArray(t)) return t;
}
function kn(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    e && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(t, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function T(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? kn(Object(n), !0).forEach(function(o) {
      At(t, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : kn(Object(n)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return t;
}
function At(t, e, n) {
  return (e = Ss(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Ss(t) {
  var e = ws(t, "string");
  return qe(e) == "symbol" ? e : e + "";
}
function ws(t, e) {
  if (qe(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (qe(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var O = {
  _getMeta: function() {
    return [de(arguments.length <= 0 ? void 0 : arguments[0]) || arguments.length <= 0 ? void 0 : arguments[0], Z(de(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getConfig: function(e, n) {
    var o, r, i;
    return (o = (e == null || (r = e.instance) === null || r === void 0 ? void 0 : r.$primevue) || (n == null || (i = n.ctx) === null || i === void 0 || (i = i.appContext) === null || i === void 0 || (i = i.config) === null || i === void 0 || (i = i.globalProperties) === null || i === void 0 ? void 0 : i.$primevue)) === null || o === void 0 ? void 0 : o.config;
  },
  _getOptionValue: Ht,
  _getPTValue: function() {
    var e, n, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", a = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, l = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, s = function() {
      var S = O._getOptionValue.apply(O, arguments);
      return G(S) || Jn(S) ? {
        class: S
      } : S;
    }, u = ((e = o.binding) === null || e === void 0 || (e = e.value) === null || e === void 0 ? void 0 : e.ptOptions) || ((n = o.$primevueConfig) === null || n === void 0 ? void 0 : n.ptOptions) || {}, d = u.mergeSections, c = d === void 0 ? !0 : d, p = u.mergeProps, f = p === void 0 ? !1 : p, m = l ? O._useDefaultPT(o, o.defaultPT(), s, i, a) : void 0, g = O._usePT(o, O._getPT(r, o.$name), s, i, T(T({}, a), {}, {
      global: m || {}
    })), b = O._getPTDatasets(o, i);
    return c || !c && g ? f ? O._mergeProps(o, f, m, g, b) : T(T(T({}, m), g), b) : T(T({}, g), b);
  },
  _getPTDatasets: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = "data-pc-";
    return T(T({}, n === "root" && At({}, "".concat(o, "name"), le(e.$name))), {}, At({}, "".concat(o, "section"), le(n)));
  },
  _getPT: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 ? arguments[2] : void 0, r = function(a) {
      var l, s = o ? o(a) : a, u = le(n);
      return (l = s?.[u]) !== null && l !== void 0 ? l : s;
    };
    return e && Object.hasOwn(e, "_usept") ? {
      _usept: e._usept,
      originalValue: r(e.originalValue),
      value: r(e.value)
    } : r(e);
  },
  _usePT: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, o = arguments.length > 2 ? arguments[2] : void 0, r = arguments.length > 3 ? arguments[3] : void 0, i = arguments.length > 4 ? arguments[4] : void 0, a = function(b) {
      return o(b, r, i);
    };
    if (n && Object.hasOwn(n, "_usept")) {
      var l, s = n._usept || ((l = e.$primevueConfig) === null || l === void 0 ? void 0 : l.ptOptions) || {}, u = s.mergeSections, d = u === void 0 ? !0 : u, c = s.mergeProps, p = c === void 0 ? !1 : c, f = a(n.originalValue), m = a(n.value);
      return f === void 0 && m === void 0 ? void 0 : G(m) ? m : G(f) ? f : d || !d && m ? p ? O._mergeProps(e, p, f, m) : T(T({}, f), m) : m;
    }
    return a(n);
  },
  _useDefaultPT: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = arguments.length > 2 ? arguments[2] : void 0, r = arguments.length > 3 ? arguments[3] : void 0, i = arguments.length > 4 ? arguments[4] : void 0;
    return O._usePT(e, n, o, r, i);
  },
  _loadStyles: function() {
    var e, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 ? arguments[1] : void 0, r = arguments.length > 2 ? arguments[2] : void 0, i = O._getConfig(o, r), a = {
      nonce: i == null || (e = i.csp) === null || e === void 0 ? void 0 : e.nonce
    };
    O._loadCoreStyles(n, a), O._loadThemeStyles(n, a), O._loadScopedThemeStyles(n, a), O._removeThemeListeners(n), n.$loadStyles = function() {
      return O._loadThemeStyles(n, a);
    }, O._themeChangeListener(n.$loadStyles);
  },
  _loadCoreStyles: function() {
    var e, n, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 ? arguments[1] : void 0;
    if (!be.isStyleNameLoaded((e = o.$style) === null || e === void 0 ? void 0 : e.name) && (n = o.$style) !== null && n !== void 0 && n.name) {
      var i;
      V.loadCSS(r), (i = o.$style) === null || i === void 0 || i.loadCSS(r), be.setLoadedStyleName(o.$style.name);
    }
  },
  _loadThemeStyles: function() {
    var e, n, o, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, i = arguments.length > 1 ? arguments[1] : void 0;
    if (!(r != null && r.isUnstyled() || (r == null || (e = r.theme) === null || e === void 0 ? void 0 : e.call(r)) === "none")) {
      if (!E.isStyleNameLoaded("common")) {
        var a, l, s = ((a = r.$style) === null || a === void 0 || (l = a.getCommonTheme) === null || l === void 0 ? void 0 : l.call(a)) || {}, u = s.primitive, d = s.semantic, c = s.global, p = s.style;
        V.load(u?.css, T({
          name: "primitive-variables"
        }, i)), V.load(d?.css, T({
          name: "semantic-variables"
        }, i)), V.load(c?.css, T({
          name: "global-variables"
        }, i)), V.loadStyle(T({
          name: "global-style"
        }, i), p), E.setLoadedStyleName("common");
      }
      if (!E.isStyleNameLoaded((n = r.$style) === null || n === void 0 ? void 0 : n.name) && (o = r.$style) !== null && o !== void 0 && o.name) {
        var f, m, g, b, v = ((f = r.$style) === null || f === void 0 || (m = f.getDirectiveTheme) === null || m === void 0 ? void 0 : m.call(f)) || {}, S = v.css, C = v.style;
        (g = r.$style) === null || g === void 0 || g.load(S, T({
          name: "".concat(r.$style.name, "-variables")
        }, i)), (b = r.$style) === null || b === void 0 || b.loadStyle(T({
          name: "".concat(r.$style.name, "-style")
        }, i), C), E.setLoadedStyleName(r.$style.name);
      }
      if (!E.isStyleNameLoaded("layer-order")) {
        var h, w, L = (h = r.$style) === null || h === void 0 || (w = h.getLayerOrderThemeCSS) === null || w === void 0 ? void 0 : w.call(h);
        V.load(L, T({
          name: "layer-order",
          first: !0
        }, i)), E.setLoadedStyleName("layer-order");
      }
    }
  },
  _loadScopedThemeStyles: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, o = e.preset();
    if (o && e.$attrSelector) {
      var r, i, a, l = ((r = e.$style) === null || r === void 0 || (i = r.getPresetTheme) === null || i === void 0 ? void 0 : i.call(r, o, "[".concat(e.$attrSelector, "]"))) || {}, s = l.css, u = (a = e.$style) === null || a === void 0 ? void 0 : a.load(s, T({
        name: "".concat(e.$attrSelector, "-").concat(e.$style.name)
      }, n));
      e.scopedStyleEl = u.el;
    }
  },
  _themeChangeListener: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
    };
    be.clearLoadedStyleNames(), R.on("theme:change", e);
  },
  _removeThemeListeners: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    R.off("theme:change", e.$loadStyles), e.$loadStyles = void 0;
  },
  _hook: function(e, n, o, r, i, a) {
    var l, s, u = "on".concat(Qr(n)), d = O._getConfig(r, i), c = o?.$instance, p = O._usePT(c, O._getPT(r == null || (l = r.value) === null || l === void 0 ? void 0 : l.pt, e), O._getOptionValue, "hooks.".concat(u)), f = O._useDefaultPT(c, d == null || (s = d.pt) === null || s === void 0 || (s = s.directives) === null || s === void 0 ? void 0 : s[e], O._getOptionValue, "hooks.".concat(u)), m = {
      el: o,
      binding: r,
      vnode: i,
      prevVnode: a
    };
    p?.(c, m), f?.(c, m);
  },
  /* eslint-disable-next-line no-unused-vars */
  _mergeProps: function() {
    for (var e = arguments.length > 1 ? arguments[1] : void 0, n = arguments.length, o = new Array(n > 2 ? n - 2 : 0), r = 2; r < n; r++)
      o[r - 2] = arguments[r];
    return mt(e) ? e.apply(void 0, o) : y.apply(void 0, o);
  },
  _extend: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = function(l, s, u, d, c) {
      var p, f, m, g;
      s._$instances = s._$instances || {};
      var b = O._getConfig(u, d), v = s._$instances[e] || {}, S = _e(v) ? T(T({}, n), n?.methods) : {};
      s._$instances[e] = T(T({}, v), {}, {
        /* new instance variables to pass in directive methods */
        $name: e,
        $host: s,
        $binding: u,
        $modifiers: u?.modifiers,
        $value: u?.value,
        $el: v.$el || s || void 0,
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
        $primevueConfig: b,
        $attrSelector: (p = s.$pd) === null || p === void 0 || (p = p[e]) === null || p === void 0 ? void 0 : p.attrSelector,
        /* computed instance variables */
        defaultPT: function() {
          return O._getPT(b?.pt, void 0, function(h) {
            var w;
            return h == null || (w = h.directives) === null || w === void 0 ? void 0 : w[e];
          });
        },
        isUnstyled: function() {
          var h, w;
          return ((h = s._$instances[e]) === null || h === void 0 || (h = h.$binding) === null || h === void 0 || (h = h.value) === null || h === void 0 ? void 0 : h.unstyled) !== void 0 ? (w = s._$instances[e]) === null || w === void 0 || (w = w.$binding) === null || w === void 0 || (w = w.value) === null || w === void 0 ? void 0 : w.unstyled : b?.unstyled;
        },
        theme: function() {
          var h;
          return (h = s._$instances[e]) === null || h === void 0 || (h = h.$primevueConfig) === null || h === void 0 ? void 0 : h.theme;
        },
        preset: function() {
          var h;
          return (h = s._$instances[e]) === null || h === void 0 || (h = h.$binding) === null || h === void 0 || (h = h.value) === null || h === void 0 ? void 0 : h.dt;
        },
        /* instance's methods */
        ptm: function() {
          var h, w = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", L = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return O._getPTValue(s._$instances[e], (h = s._$instances[e]) === null || h === void 0 || (h = h.$binding) === null || h === void 0 || (h = h.value) === null || h === void 0 ? void 0 : h.pt, w, T({}, L));
        },
        ptmo: function() {
          var h = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, w = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", L = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return O._getPTValue(s._$instances[e], h, w, L, !1);
        },
        cx: function() {
          var h, w, L = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", k = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return (h = s._$instances[e]) !== null && h !== void 0 && h.isUnstyled() ? void 0 : O._getOptionValue((w = s._$instances[e]) === null || w === void 0 || (w = w.$style) === null || w === void 0 ? void 0 : w.classes, L, T({}, k));
        },
        sx: function() {
          var h, w = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", L = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, k = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return L ? O._getOptionValue((h = s._$instances[e]) === null || h === void 0 || (h = h.$style) === null || h === void 0 ? void 0 : h.inlineStyles, w, T({}, k)) : void 0;
        }
      }, S), s.$instance = s._$instances[e], (f = (m = s.$instance)[l]) === null || f === void 0 || f.call(m, s, u, d, c), s["$".concat(e)] = s.$instance, O._hook(e, l, s, u, d, c), s.$pd || (s.$pd = {}), s.$pd[e] = T(T({}, (g = s.$pd) === null || g === void 0 ? void 0 : g[e]), {}, {
        name: e,
        instance: s._$instances[e]
      });
    }, r = function(l) {
      var s, u, d, c = l._$instances[e], p = c?.watch, f = function(b) {
        var v, S = b.newValue, C = b.oldValue;
        return p == null || (v = p.config) === null || v === void 0 ? void 0 : v.call(c, S, C);
      }, m = function(b) {
        var v, S = b.newValue, C = b.oldValue;
        return p == null || (v = p["config.ripple"]) === null || v === void 0 ? void 0 : v.call(c, S, C);
      };
      c.$watchersCallback = {
        config: f,
        "config.ripple": m
      }, p == null || (s = p.config) === null || s === void 0 || s.call(c, c?.$primevueConfig), ge.on("config:change", f), p == null || (u = p["config.ripple"]) === null || u === void 0 || u.call(c, c == null || (d = c.$primevueConfig) === null || d === void 0 ? void 0 : d.ripple), ge.on("config:ripple:change", m);
    }, i = function(l) {
      var s = l._$instances[e].$watchersCallback;
      s && (ge.off("config:change", s.config), ge.off("config:ripple:change", s["config.ripple"]), l._$instances[e].$watchersCallback = void 0);
    };
    return {
      created: function(l, s, u, d) {
        l.$pd || (l.$pd = {}), l.$pd[e] = {
          name: e,
          attrSelector: yi("pd")
        }, o("created", l, s, u, d);
      },
      beforeMount: function(l, s, u, d) {
        var c;
        O._loadStyles((c = l.$pd[e]) === null || c === void 0 ? void 0 : c.instance, s, u), o("beforeMount", l, s, u, d), r(l);
      },
      mounted: function(l, s, u, d) {
        var c;
        O._loadStyles((c = l.$pd[e]) === null || c === void 0 ? void 0 : c.instance, s, u), o("mounted", l, s, u, d);
      },
      beforeUpdate: function(l, s, u, d) {
        o("beforeUpdate", l, s, u, d);
      },
      updated: function(l, s, u, d) {
        var c;
        O._loadStyles((c = l.$pd[e]) === null || c === void 0 ? void 0 : c.instance, s, u), o("updated", l, s, u, d);
      },
      beforeUnmount: function(l, s, u, d) {
        var c;
        i(l), O._removeThemeListeners((c = l.$pd[e]) === null || c === void 0 ? void 0 : c.instance), o("beforeUnmount", l, s, u, d);
      },
      unmounted: function(l, s, u, d) {
        var c;
        (c = l.$pd[e]) === null || c === void 0 || (c = c.instance) === null || c === void 0 || (c = c.scopedStyleEl) === null || c === void 0 || (c = c.value) === null || c === void 0 || c.remove(), o("unmounted", l, s, u, d);
      }
    };
  },
  extend: function() {
    var e = O._getMeta.apply(O, arguments), n = On(e, 2), o = n[0], r = n[1];
    return T({
      extend: function() {
        var a = O._getMeta.apply(O, arguments), l = On(a, 2), s = l[0], u = l[1];
        return O.extend(s, T(T(T({}, r), r?.methods), u));
      }
    }, O._extend(o, r));
  }
}, $s = `
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
`, Os = {
  root: "p-ink"
}, Cs = V.extend({
  name: "ripple-directive",
  style: $s,
  classes: Os
}), ks = O.extend({
  style: Cs
});
function Ye(t) {
  "@babel/helpers - typeof";
  return Ye = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Ye(t);
}
function _s(t) {
  return xs(t) || Ps(t) || Ts(t) || Is();
}
function Is() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ts(t, e) {
  if (t) {
    if (typeof t == "string") return Et(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Et(t, e) : void 0;
  }
}
function Ps(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function xs(t) {
  if (Array.isArray(t)) return Et(t);
}
function Et(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function _n(t, e, n) {
  return (e = Ls(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Ls(t) {
  var e = As(t, "string");
  return Ye(e) == "symbol" ? e : e + "";
}
function As(t, e) {
  if (Ye(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (Ye(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var bo = ks.extend("ripple", {
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
      n || (n = li("span", _n(_n({
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
      var n = this, o = e.currentTarget, r = this.getInk(o);
      if (!(!r || getComputedStyle(r, null).display === "none")) {
        if (!this.isUnstyled() && Re(r, "p-ink-active"), r.setAttribute("data-p-ink-active", "false"), !$e(r) && !Oe(r)) {
          var i = Math.max(to(o), hi(o));
          r.style.height = i + "px", r.style.width = i + "px";
        }
        var a = fi(o), l = e.pageX - a.left + document.body.scrollTop - Oe(r) / 2, s = e.pageY - a.top + document.body.scrollLeft - $e(r) / 2;
        r.style.top = s + "px", r.style.left = l + "px", !this.isUnstyled() && _t(r, "p-ink-active"), r.setAttribute("data-p-ink-active", "true"), this.timeout = setTimeout(function() {
          r && (!n.isUnstyled() && Re(r, "p-ink-active"), r.setAttribute("data-p-ink-active", "false"));
        }, 401);
      }
    },
    onAnimationEnd: function(e) {
      this.timeout && clearTimeout(this.timeout), !this.isUnstyled() && Re(e.currentTarget, "p-ink-active"), e.currentTarget.setAttribute("data-p-ink-active", "false");
    },
    getInk: function(e) {
      return e && e.children ? _s(e.children).find(function(n) {
        return di(n, "data-pc-name") === "ripple";
      }) : void 0;
    }
  }
});
function Ze(t) {
  "@babel/helpers - typeof";
  return Ze = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Ze(t);
}
function Es(t, e) {
  if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function");
}
function Vs(t, e) {
  for (var n = 0; n < e.length; n++) {
    var o = e[n];
    o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(t, zs(o.key), o);
  }
}
function js(t, e, n) {
  return e && Vs(t.prototype, e), Object.defineProperty(t, "prototype", { writable: !1 }), t;
}
function zs(t) {
  var e = Fs(t, "string");
  return Ze(e) == "symbol" ? e : e + "";
}
function Fs(t, e) {
  if (Ze(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (Ze(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return String(t);
}
var Ns = /* @__PURE__ */ (function() {
  function t(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : function() {
    };
    Es(this, t), this.element = e, this.listener = n;
  }
  return js(t, [{
    key: "bindScrollListener",
    value: function() {
      this.scrollableParents = mi(this.element);
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
})(), Ms = Kt();
const Ds = "data-wippy-overlay-layer";
function go() {
  return typeof window < "u" && typeof window.document < "u";
}
function vo() {
  return go() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function Rs() {
  return vo() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const Bs = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let Hs = 0;
const ft = /* @__PURE__ */ new WeakMap();
function In(t, e) {
  const n = t.style;
  n.setProperty("position", "fixed", "important"), n.setProperty("inset", "auto", "important"), n.setProperty("margin", "0", "important"), n.setProperty("position-anchor", e), n.setProperty("position-area", "bottom span-right"), n.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), n.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), n.setProperty("max-width", "stretch", "important");
}
function Ks(t, e) {
  if (!Bs.test(t.className))
    return;
  const n = t.style.cssText;
  In(t, e), t.getAttribute("popover") !== "manual" && t.setAttribute("popover", "manual");
  try {
    t.matches(":popover-open") || t.showPopover();
  } catch {
  }
  if (!t.matches(":popover-open")) {
    t.removeAttribute("popover"), t.style.cssText = n;
    return;
  }
  if (!ft.has(t)) {
    const o = new MutationObserver(() => {
      const r = t.style;
      (r.top !== "auto" || r.left !== "auto" || r.margin !== "0px" || r.getPropertyPriority("top") !== "important" || r.getPropertyPriority("left") !== "important" || r.getPropertyPriority("margin") !== "important" || r.getPropertyPriority("min-width") !== "important" || r.maxWidth !== "stretch" || r.getPropertyPriority("max-width") !== "important") && In(t, e);
    });
    o.observe(t, { attributes: !0, attributeFilter: ["style"] }), ft.set(t, o);
  }
}
function Gt(t) {
  const e = ft.get(t);
  e && (e.disconnect(), ft.delete(t));
}
function Us(t) {
  const e = t && typeof t.getRootNode == "function" ? t.getRootNode() : null;
  return e instanceof ShadowRoot ? e : null;
}
function Vt(t) {
  t.style.top = "0px", t.style.left = "0px";
  const e = t.getBoundingClientRect();
  t.style.top = `${-window.scrollY - e.top}px`, t.style.left = `${-window.scrollX - e.left}px`;
}
const ht = /* @__PURE__ */ new Set(), qt = /* @__PURE__ */ new WeakMap();
let Tn = !1, jt = !1;
function Ws() {
  jt = !1;
  for (const t of ht) {
    if (!t.isConnected) {
      for (const e of Array.from(t.children))
        e instanceof HTMLElement && Gt(e);
      ht.delete(t), qt.get(t)?.disconnect();
      continue;
    }
    t.childElementCount > 0 && Vt(t);
  }
}
function Pn() {
  jt || (jt = !0, requestAnimationFrame(Ws));
}
function Gs(t) {
  const e = document.createElement("div");
  e.setAttribute(Ds, "");
  const n = vo();
  if (e.style.cssText = n ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", n && e.setAttribute("popover", "manual"), t.appendChild(e), n) {
    try {
      e.showPopover();
    } catch {
    }
    e.matches(":popover-open") || (e.removeAttribute("popover"), e.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  Vt(e);
  const o = new MutationObserver((r) => {
    const i = e.__wippyAnchorName;
    for (const a of r) {
      if (i)
        for (const l of Array.from(a.addedNodes))
          l instanceof HTMLElement && Ks(l, i);
      for (const l of Array.from(a.removedNodes))
        l instanceof HTMLElement && Gt(l);
    }
    e.isConnected && e.childElementCount > 0 && Vt(e);
  });
  return o.observe(e, { childList: !0 }), qt.set(e, o), ht.add(e), Tn || (Tn = !0, window.addEventListener("scroll", Pn, { capture: !0, passive: !0 }), window.addEventListener("resize", Pn, { passive: !0 })), e;
}
function xn(t) {
  if (!(!t.hostRoot || t.layer) && (t.layer = Gs(t.hostRoot), Rs())) {
    const e = t.$el ? t.$el.parentElement : null;
    e && (t.anchorName = `--wippy-a-${++Hs}`, t.anchorTrigger = e, e.style.setProperty("anchor-name", t.anchorName), t.layer.__wippyAnchorName = t.anchorName);
  }
}
function Ln(t) {
  if (t.anchorTrigger && (t.anchorTrigger.style.removeProperty("anchor-name"), t.anchorTrigger = null), t.anchorName = null, t.layer) {
    for (const e of Array.from(t.layer.children))
      e instanceof HTMLElement && Gt(e);
    ht.delete(t.layer), qt.get(t.layer)?.disconnect(), t.layer.remove(), t.layer = null;
  }
}
let An = !1;
function qs() {
  if (An)
    return;
  An = !0;
  const t = Wt;
  t.computed = t.computed || {}, t.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, t.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, t.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, t.mounted = function() {
    go() && (this.hostRoot = Us(this.$el), this.mounted = !0, this.hostRoot && (this.inline || xn(this), this.$watch("inline", (e) => {
      e ? Ln(this) : xn(this);
    })));
  }, t.render = function() {
    return this.inline ? A(this.$slots, "default", { key: 0 }) : this.mounted ? rr(Dn, { key: 1, to: this.resolvedTarget || document.body }, [
      A(this.$slots, "default")
    ]) : W("", !0);
  }, t.unmounted = function() {
    Ln(this);
  };
}
const eu = {
  install: (t) => {
    qs(), t.use(os, { theme: "none" });
  }
};
var gt = {
  name: "SpinnerIcon",
  extends: ze
};
function Ys(t) {
  return Xs(t) || Qs(t) || Js(t) || Zs();
}
function Zs() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Js(t, e) {
  if (t) {
    if (typeof t == "string") return zt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? zt(t, e) : void 0;
  }
}
function Qs(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Xs(t) {
  if (Array.isArray(t)) return zt(t);
}
function zt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function ea(t, e, n, o, r, i) {
  return $(), I("svg", y({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Ys(e[0] || (e[0] = [H("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
gt.render = ea;
var ta = `
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
`, na = {
  root: function(e) {
    var n = e.props, o = e.instance;
    return ["p-badge p-component", {
      "p-badge-circle": P(n.value) && String(n.value).length === 1,
      "p-badge-dot": _e(n.value) && !o.$slots.default,
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
}, oa = V.extend({
  name: "badge",
  style: ta,
  classes: na
}), ra = {
  name: "BaseBadge",
  extends: Te,
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
  style: oa,
  provide: function() {
    return {
      $pcBadge: this,
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
function En(t, e, n) {
  return (e = ia(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function ia(t) {
  var e = sa(t, "string");
  return Je(e) == "symbol" ? e : e + "";
}
function sa(t, e) {
  if (Je(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (Je(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var yo = {
  name: "Badge",
  extends: ra,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return ue(En(En({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, aa = ["data-p"];
function la(t, e, n, o, r, i) {
  return $(), I("span", y({
    class: t.cx("root"),
    "data-p": i.dataP
  }, t.ptmi("root")), [A(t.$slots, "default", {}, function() {
    return [ut(se(t.value), 1)];
  })], 16, aa);
}
yo.render = la;
var ua = `
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
function Qe(t) {
  "@babel/helpers - typeof";
  return Qe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Qe(t);
}
function ie(t, e, n) {
  return (e = da(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function da(t) {
  var e = ca(t, "string");
  return Qe(e) == "symbol" ? e : e + "";
}
function ca(t, e) {
  if (Qe(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (Qe(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var pa = {
  root: function(e) {
    var n = e.instance, o = e.props;
    return ["p-button p-component", ie(ie(ie(ie(ie(ie(ie(ie(ie({
      "p-button-icon-only": n.hasIcon && !o.label && !o.badge,
      "p-button-vertical": (o.iconPos === "top" || o.iconPos === "bottom") && o.label,
      "p-button-loading": o.loading,
      "p-button-link": o.link || o.variant === "link"
    }, "p-button-".concat(o.severity), o.severity), "p-button-raised", o.raised), "p-button-rounded", o.rounded), "p-button-text", o.text || o.variant === "text"), "p-button-outlined", o.outlined || o.variant === "outlined"), "p-button-sm", o.size === "small"), "p-button-lg", o.size === "large"), "p-button-plain", o.plain), "p-button-fluid", n.hasFluid)];
  },
  loadingIcon: "p-button-loading-icon",
  icon: function(e) {
    var n = e.props;
    return ["p-button-icon", ie({}, "p-button-icon-".concat(n.iconPos), n.label)];
  },
  label: "p-button-label"
}, fa = V.extend({
  name: "button",
  style: ua,
  classes: pa
}), ha = {
  name: "BaseButton",
  extends: Te,
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
  style: fa,
  provide: function() {
    return {
      $pcButton: this,
      $parentInstance: this
    };
  }
};
function Xe(t) {
  "@babel/helpers - typeof";
  return Xe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Xe(t);
}
function U(t, e, n) {
  return (e = ma(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function ma(t) {
  var e = ba(t, "string");
  return Xe(e) == "symbol" ? e : e + "";
}
function ba(t, e) {
  if (Xe(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (Xe(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var ga = {
  name: "Button",
  extends: ha,
  inheritAttrs: !1,
  inject: {
    $pcFluid: {
      default: null
    }
  },
  methods: {
    getPTOptions: function(e) {
      var n = e === "root" ? this.ptmi : this.ptm;
      return n(e, {
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
      return y(this.asAttrs, this.a11yAttrs, this.getPTOptions("root"));
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
      return _e(this.fluid) ? !!this.$pcFluid : this.fluid;
    },
    dataP: function() {
      return ue(U(U(U(U(U(U(U(U(U(U({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
    },
    dataIconP: function() {
      return ue(U(U({}, this.iconPos, this.iconPos), this.size, this.size));
    },
    dataLabelP: function() {
      return ue(U(U({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
    }
  },
  components: {
    SpinnerIcon: gt,
    Badge: yo
  },
  directives: {
    ripple: bo
  }
}, va = ["data-p"], ya = ["data-p"];
function Sa(t, e, n, o, r, i) {
  var a = ee("SpinnerIcon"), l = ee("Badge"), s = Rn("ripple");
  return t.asChild ? A(t.$slots, "default", {
    key: 1,
    class: Ee(t.cx("root")),
    a11yAttrs: i.a11yAttrs
  }) : Bn(($(), ae($t(t.as), y({
    key: 0,
    class: t.cx("root"),
    "data-p": i.dataP
  }, i.attrs), {
    default: ye(function() {
      return [A(t.$slots, "default", {}, function() {
        return [t.loading ? A(t.$slots, "loadingicon", y({
          key: 0,
          class: [t.cx("loadingIcon"), t.cx("icon")]
        }, t.ptm("loadingIcon")), function() {
          return [t.loadingIcon ? ($(), I("span", y({
            key: 0,
            class: [t.cx("loadingIcon"), t.cx("icon"), t.loadingIcon]
          }, t.ptm("loadingIcon")), null, 16)) : ($(), ae(a, y({
            key: 1,
            class: [t.cx("loadingIcon"), t.cx("icon")],
            spin: ""
          }, t.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : A(t.$slots, "icon", y({
          key: 1,
          class: [t.cx("icon")]
        }, t.ptm("icon")), function() {
          return [t.icon ? ($(), I("span", y({
            key: 0,
            class: [t.cx("icon"), t.icon, t.iconClass],
            "data-p": i.dataIconP
          }, t.ptm("icon")), null, 16, va)) : W("", !0)];
        }), t.label ? ($(), I("span", y({
          key: 2,
          class: t.cx("label")
        }, t.ptm("label"), {
          "data-p": i.dataLabelP
        }), se(t.label), 17, ya)) : W("", !0), t.badge ? ($(), ae(l, {
          key: 3,
          value: t.badge,
          class: Ee(t.badgeClass),
          severity: t.badgeSeverity,
          unstyled: t.unstyled,
          pt: t.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : W("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[s]]);
}
ga.render = Sa;
var wa = {
  name: "BaseEditableHolder",
  extends: Te,
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
        var n, o;
        this.formField = ((n = this.$pcForm) === null || n === void 0 || (o = n.register) === null || o === void 0 ? void 0 : o.call(n, e, this.$formControl)) || {};
      }
    },
    $formControl: {
      immediate: !0,
      handler: function(e) {
        var n, o;
        this.formField = ((n = this.$pcForm) === null || n === void 0 || (o = n.register) === null || o === void 0 ? void 0 : o.call(n, this.$formName, e)) || {};
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
      var o, r;
      this.controlled && (this.d_value = e, this.$emit("update:modelValue", e)), this.$emit("value-change", e), (o = (r = this.formField).onChange) === null || o === void 0 || o.call(r, {
        originalEvent: n,
        value: e
      });
    },
    // @todo move to @primeuix/utils
    findNonEmpty: function() {
      for (var e = arguments.length, n = new Array(e), o = 0; o < e; o++)
        n[o] = arguments[o];
      return n.find(P);
    }
  },
  computed: {
    $filled: function() {
      return P(this.d_value);
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
}, So = {
  name: "BaseInput",
  extends: wa,
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
}, $a = `
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
`, Oa = {
  root: function(e) {
    var n = e.instance, o = e.props;
    return ["p-inputtext p-component", {
      "p-filled": n.$filled,
      "p-inputtext-sm p-inputfield-sm": o.size === "small",
      "p-inputtext-lg p-inputfield-lg": o.size === "large",
      "p-invalid": n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-inputtext-fluid": n.$fluid
    }];
  }
}, Ca = V.extend({
  name: "inputtext",
  style: $a,
  classes: Oa
}), ka = {
  name: "BaseInputText",
  extends: So,
  style: Ca,
  provide: function() {
    return {
      $pcInputText: this,
      $parentInstance: this
    };
  }
};
function et(t) {
  "@babel/helpers - typeof";
  return et = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, et(t);
}
function _a(t, e, n) {
  return (e = Ia(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Ia(t) {
  var e = Ta(t, "string");
  return et(e) == "symbol" ? e : e + "";
}
function Ta(t, e) {
  if (et(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (et(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var wo = {
  name: "InputText",
  extends: ka,
  inheritAttrs: !1,
  methods: {
    onInput: function(e) {
      this.writeValue(e.target.value, e);
    }
  },
  computed: {
    attrs: function() {
      return y(this.ptmi("root", {
        context: {
          filled: this.$filled,
          disabled: this.disabled
        }
      }), this.formField);
    },
    dataP: function() {
      return ue(_a({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, Pa = ["value", "name", "disabled", "aria-invalid", "data-p"];
function xa(t, e, n, o, r, i) {
  return $(), I("input", y({
    type: "text",
    class: t.cx("root"),
    value: t.d_value,
    name: t.name,
    disabled: t.disabled,
    "aria-invalid": t.$invalid || void 0,
    "data-p": i.dataP,
    onInput: e[0] || (e[0] = function() {
      return i.onInput && i.onInput.apply(i, arguments);
    })
  }, i.attrs), null, 16, Pa);
}
wo.render = xa;
var $o = {
  name: "BlankIcon",
  extends: ze
};
function La(t) {
  return ja(t) || Va(t) || Ea(t) || Aa();
}
function Aa() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ea(t, e) {
  if (t) {
    if (typeof t == "string") return Ft(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ft(t, e) : void 0;
  }
}
function Va(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function ja(t) {
  if (Array.isArray(t)) return Ft(t);
}
function Ft(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function za(t, e, n, o, r, i) {
  return $(), I("svg", y({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), La(e[0] || (e[0] = [H("rect", {
    width: "1",
    height: "1",
    fill: "currentColor",
    "fill-opacity": "0"
  }, null, -1)])), 16);
}
$o.render = za;
var Oo = {
  name: "CheckIcon",
  extends: ze
};
function Fa(t) {
  return Ra(t) || Da(t) || Ma(t) || Na();
}
function Na() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ma(t, e) {
  if (t) {
    if (typeof t == "string") return Nt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Nt(t, e) : void 0;
  }
}
function Da(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Ra(t) {
  if (Array.isArray(t)) return Nt(t);
}
function Nt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function Ba(t, e, n, o, r, i) {
  return $(), I("svg", y({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Fa(e[0] || (e[0] = [H("path", {
    d: "M4.86199 11.5948C4.78717 11.5923 4.71366 11.5745 4.64596 11.5426C4.57826 11.5107 4.51779 11.4652 4.46827 11.4091L0.753985 7.69483C0.683167 7.64891 0.623706 7.58751 0.580092 7.51525C0.536478 7.44299 0.509851 7.36177 0.502221 7.27771C0.49459 7.19366 0.506156 7.10897 0.536046 7.03004C0.565935 6.95111 0.613367 6.88 0.674759 6.82208C0.736151 6.76416 0.8099 6.72095 0.890436 6.69571C0.970973 6.67046 1.05619 6.66385 1.13966 6.67635C1.22313 6.68886 1.30266 6.72017 1.37226 6.76792C1.44186 6.81567 1.4997 6.8786 1.54141 6.95197L4.86199 10.2503L12.6397 2.49483C12.7444 2.42694 12.8689 2.39617 12.9932 2.40745C13.1174 2.41873 13.2343 2.47141 13.3251 2.55705C13.4159 2.64268 13.4753 2.75632 13.4938 2.87973C13.5123 3.00315 13.4888 3.1292 13.4271 3.23768L5.2557 11.4091C5.20618 11.4652 5.14571 11.5107 5.07801 11.5426C5.01031 11.5745 4.9368 11.5923 4.86199 11.5948Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Oo.render = Ba;
var Co = {
  name: "ChevronDownIcon",
  extends: ze
};
function Ha(t) {
  return Ga(t) || Wa(t) || Ua(t) || Ka();
}
function Ka() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ua(t, e) {
  if (t) {
    if (typeof t == "string") return Mt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Mt(t, e) : void 0;
  }
}
function Wa(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Ga(t) {
  if (Array.isArray(t)) return Mt(t);
}
function Mt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function qa(t, e, n, o, r, i) {
  return $(), I("svg", y({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Ha(e[0] || (e[0] = [H("path", {
    d: "M7.01744 10.398C6.91269 10.3985 6.8089 10.378 6.71215 10.3379C6.61541 10.2977 6.52766 10.2386 6.45405 10.1641L1.13907 4.84913C1.03306 4.69404 0.985221 4.5065 1.00399 4.31958C1.02276 4.13266 1.10693 3.95838 1.24166 3.82747C1.37639 3.69655 1.55301 3.61742 1.74039 3.60402C1.92777 3.59062 2.11386 3.64382 2.26584 3.75424L7.01744 8.47394L11.769 3.75424C11.9189 3.65709 12.097 3.61306 12.2748 3.62921C12.4527 3.64535 12.6199 3.72073 12.7498 3.84328C12.8797 3.96582 12.9647 4.12842 12.9912 4.30502C13.0177 4.48162 12.9841 4.662 12.8958 4.81724L7.58083 10.1322C7.50996 10.2125 7.42344 10.2775 7.32656 10.3232C7.22968 10.3689 7.12449 10.3944 7.01744 10.398Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Co.render = qa;
var ko = {
  name: "SearchIcon",
  extends: ze
};
function Ya(t) {
  return Xa(t) || Qa(t) || Ja(t) || Za();
}
function Za() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ja(t, e) {
  if (t) {
    if (typeof t == "string") return Dt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Dt(t, e) : void 0;
  }
}
function Qa(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Xa(t) {
  if (Array.isArray(t)) return Dt(t);
}
function Dt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function el(t, e, n, o, r, i) {
  return $(), I("svg", y({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Ya(e[0] || (e[0] = [H("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M2.67602 11.0265C3.6661 11.688 4.83011 12.0411 6.02086 12.0411C6.81149 12.0411 7.59438 11.8854 8.32483 11.5828C8.87005 11.357 9.37808 11.0526 9.83317 10.6803L12.9769 13.8241C13.0323 13.8801 13.0983 13.9245 13.171 13.9548C13.2438 13.985 13.3219 14.0003 13.4007 14C13.4795 14.0003 13.5575 13.985 13.6303 13.9548C13.7031 13.9245 13.7691 13.8801 13.8244 13.8241C13.9367 13.7116 13.9998 13.5592 13.9998 13.4003C13.9998 13.2414 13.9367 13.089 13.8244 12.9765L10.6807 9.8328C11.053 9.37773 11.3573 8.86972 11.5831 8.32452C11.8857 7.59408 12.0414 6.81119 12.0414 6.02056C12.0414 4.8298 11.6883 3.66579 11.0268 2.67572C10.3652 1.68564 9.42494 0.913972 8.32483 0.45829C7.22472 0.00260857 6.01418 -0.116618 4.84631 0.115686C3.67844 0.34799 2.60568 0.921393 1.76369 1.76338C0.921698 2.60537 0.348296 3.67813 0.115991 4.84601C-0.116313 6.01388 0.00291375 7.22441 0.458595 8.32452C0.914277 9.42464 1.68595 10.3649 2.67602 11.0265ZM3.35565 2.0158C4.14456 1.48867 5.07206 1.20731 6.02086 1.20731C7.29317 1.20731 8.51338 1.71274 9.41304 2.6124C10.3127 3.51206 10.8181 4.73226 10.8181 6.00457C10.8181 6.95337 10.5368 7.88088 10.0096 8.66978C9.48251 9.45868 8.73328 10.0736 7.85669 10.4367C6.98011 10.7997 6.01554 10.8947 5.08496 10.7096C4.15439 10.5245 3.2996 10.0676 2.62869 9.39674C1.95778 8.72583 1.50089 7.87104 1.31579 6.94046C1.13068 6.00989 1.22568 5.04532 1.58878 4.16874C1.95187 3.29215 2.56675 2.54292 3.35565 2.0158Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
ko.render = el;
var _o = {
  name: "TimesIcon",
  extends: ze
};
function tl(t) {
  return il(t) || rl(t) || ol(t) || nl();
}
function nl() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ol(t, e) {
  if (t) {
    if (typeof t == "string") return Rt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Rt(t, e) : void 0;
  }
}
function rl(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function il(t) {
  if (Array.isArray(t)) return Rt(t);
}
function Rt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function sl(t, e, n, o, r, i) {
  return $(), I("svg", y({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), tl(e[0] || (e[0] = [H("path", {
    d: "M8.01186 7.00933L12.27 2.75116C12.341 2.68501 12.398 2.60524 12.4375 2.51661C12.4769 2.42798 12.4982 2.3323 12.4999 2.23529C12.5016 2.13827 12.4838 2.0419 12.4474 1.95194C12.4111 1.86197 12.357 1.78024 12.2884 1.71163C12.2198 1.64302 12.138 1.58893 12.0481 1.55259C11.9581 1.51625 11.8617 1.4984 11.7647 1.50011C11.6677 1.50182 11.572 1.52306 11.4834 1.56255C11.3948 1.60204 11.315 1.65898 11.2488 1.72997L6.99067 5.98814L2.7325 1.72997C2.59553 1.60234 2.41437 1.53286 2.22718 1.53616C2.03999 1.53946 1.8614 1.61529 1.72901 1.74767C1.59663 1.88006 1.5208 2.05865 1.5175 2.24584C1.5142 2.43303 1.58368 2.61419 1.71131 2.75116L5.96948 7.00933L1.71131 11.2675C1.576 11.403 1.5 11.5866 1.5 11.7781C1.5 11.9696 1.576 12.1532 1.71131 12.2887C1.84679 12.424 2.03043 12.5 2.2219 12.5C2.41338 12.5 2.59702 12.424 2.7325 12.2887L6.99067 8.03052L11.2488 12.2887C11.3843 12.424 11.568 12.5 11.7594 12.5C11.9509 12.5 12.1346 12.424 12.27 12.2887C12.4053 12.1532 12.4813 11.9696 12.4813 11.7781C12.4813 11.5866 12.4053 11.403 12.27 11.2675L8.01186 7.00933Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
_o.render = sl;
var al = `
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
`, ll = {
  root: "p-iconfield"
}, ul = V.extend({
  name: "iconfield",
  style: al,
  classes: ll
}), dl = {
  name: "BaseIconField",
  extends: Te,
  style: ul,
  provide: function() {
    return {
      $pcIconField: this,
      $parentInstance: this
    };
  }
}, Io = {
  name: "IconField",
  extends: dl,
  inheritAttrs: !1
};
function cl(t, e, n, o, r, i) {
  return $(), I("div", y({
    class: t.cx("root")
  }, t.ptmi("root")), [A(t.$slots, "default")], 16);
}
Io.render = cl;
var pl = {
  root: "p-inputicon"
}, fl = V.extend({
  name: "inputicon",
  classes: pl
}), hl = {
  name: "BaseInputIcon",
  extends: Te,
  style: fl,
  props: {
    class: null
  },
  provide: function() {
    return {
      $pcInputIcon: this,
      $parentInstance: this
    };
  }
}, To = {
  name: "InputIcon",
  extends: hl,
  inheritAttrs: !1,
  computed: {
    containerClass: function() {
      return [this.cx("root"), this.class];
    }
  }
};
function ml(t, e, n, o, r, i) {
  return $(), I("span", y({
    class: i.containerClass
  }, t.ptmi("root"), {
    "aria-hidden": "true"
  }), [A(t.$slots, "default")], 16);
}
To.render = ml;
var bl = `
    .p-virtualscroller-loader {
        background: dt('virtualscroller.loader.mask.background');
        color: dt('virtualscroller.loader.mask.color');
    }

    .p-virtualscroller-loading-icon {
        font-size: dt('virtualscroller.loader.icon.size');
        width: dt('virtualscroller.loader.icon.size');
        height: dt('virtualscroller.loader.icon.size');
    }
`, gl = `
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
`, Vn = V.extend({
  name: "virtualscroller",
  css: gl,
  style: bl
}), vl = {
  name: "BaseVirtualScroller",
  extends: Te,
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
  style: Vn,
  provide: function() {
    return {
      $pcVirtualScroller: this,
      $parentInstance: this
    };
  },
  beforeMount: function() {
    var e;
    Vn.loadCSS({
      nonce: (e = this.$primevueConfig) === null || e === void 0 || (e = e.csp) === null || e === void 0 ? void 0 : e.nonce
    });
  }
};
function tt(t) {
  "@babel/helpers - typeof";
  return tt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, tt(t);
}
function jn(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    e && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(t, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function Ne(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? jn(Object(n), !0).forEach(function(o) {
      Po(t, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : jn(Object(n)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return t;
}
function Po(t, e, n) {
  return (e = yl(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function yl(t) {
  var e = Sl(t, "string");
  return tt(e) == "symbol" ? e : e + "";
}
function Sl(t, e) {
  if (tt(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (tt(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var xo = {
  name: "VirtualScroller",
  extends: vl,
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
      ct(this.element) && (this.setContentEl(this.content), this.init(), this.calculateAutoSize(), this.defaultWidth = Oe(this.element), this.defaultHeight = $e(this.element), this.defaultContentWidth = Oe(this.content), this.defaultContentHeight = $e(this.content), this.initialized = !0), this.element && this.bindResizeListener();
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
      var n = this, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "auto", r = this.isBoth(), i = this.isHorizontal(), a = r ? e.every(function(k) {
        return k > -1;
      }) : e > -1;
      if (a) {
        var l = this.first, s = this.element, u = s.scrollTop, d = u === void 0 ? 0 : u, c = s.scrollLeft, p = c === void 0 ? 0 : c, f = this.calculateNumItems(), m = f.numToleratedItems, g = this.getContentPosition(), b = this.itemSize, v = function() {
          var x = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, N = arguments.length > 1 ? arguments[1] : void 0;
          return x <= N ? 0 : x;
        }, S = function(x, N, M) {
          return x * N + M;
        }, C = function() {
          var x = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, N = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return n.scrollTo({
            left: x,
            top: N,
            behavior: o
          });
        }, h = r ? {
          rows: 0,
          cols: 0
        } : 0, w = !1, L = !1;
        r ? (h = {
          rows: v(e[0], m[0]),
          cols: v(e[1], m[1])
        }, C(S(h.cols, b[1], g.left), S(h.rows, b[0], g.top)), L = this.lastScrollPos.top !== d || this.lastScrollPos.left !== p, w = h.rows !== l.rows || h.cols !== l.cols) : (h = v(e, m), i ? C(S(h, b, g.left), d) : C(p, S(h, b, g.top)), L = this.lastScrollPos !== (i ? p : d), w = h !== l), this.isRangeChanged = w, L && (this.first = h);
      }
    },
    scrollInView: function(e, n) {
      var o = this, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "auto";
      if (n) {
        var i = this.isBoth(), a = this.isHorizontal(), l = i ? e.every(function(b) {
          return b > -1;
        }) : e > -1;
        if (l) {
          var s = this.getRenderedRange(), u = s.first, d = s.viewport, c = function() {
            var v = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, S = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
            return o.scrollTo({
              left: v,
              top: S,
              behavior: r
            });
          }, p = n === "to-start", f = n === "to-end";
          if (p) {
            if (i)
              d.first.rows - u.rows > e[0] ? c(d.first.cols * this.itemSize[1], (d.first.rows - 1) * this.itemSize[0]) : d.first.cols - u.cols > e[1] && c((d.first.cols - 1) * this.itemSize[1], d.first.rows * this.itemSize[0]);
            else if (d.first - u > e) {
              var m = (d.first - 1) * this.itemSize;
              a ? c(m, 0) : c(0, m);
            }
          } else if (f) {
            if (i)
              d.last.rows - u.rows <= e[0] + 1 ? c(d.first.cols * this.itemSize[1], (d.first.rows + 1) * this.itemSize[0]) : d.last.cols - u.cols <= e[1] + 1 && c((d.first.cols + 1) * this.itemSize[1], d.first.rows * this.itemSize[0]);
            else if (d.last - u <= e + 1) {
              var g = (d.first + 1) * this.itemSize;
              a ? c(g, 0) : c(0, g);
            }
          }
        }
      } else
        this.scrollToIndex(e, r);
    },
    getRenderedRange: function() {
      var e = function(c, p) {
        return Math.floor(c / (p || c));
      }, n = this.first, o = 0;
      if (this.element) {
        var r = this.isBoth(), i = this.isHorizontal(), a = this.element, l = a.scrollTop, s = a.scrollLeft;
        if (r)
          n = {
            rows: e(l, this.itemSize[0]),
            cols: e(s, this.itemSize[1])
          }, o = {
            rows: n.rows + this.numItemsInViewport.rows,
            cols: n.cols + this.numItemsInViewport.cols
          };
        else {
          var u = i ? s : l;
          n = e(u, this.itemSize), o = n + this.numItemsInViewport;
        }
      }
      return {
        first: this.first,
        last: this.last,
        viewport: {
          first: n,
          last: o
        }
      };
    },
    calculateNumItems: function() {
      var e = this.isBoth(), n = this.isHorizontal(), o = this.itemSize, r = this.getContentPosition(), i = this.element ? this.element.offsetWidth - r.left : 0, a = this.element ? this.element.offsetHeight - r.top : 0, l = function(p, f) {
        return Math.ceil(p / (f || p));
      }, s = function(p) {
        return Math.ceil(p / 2);
      }, u = e ? {
        rows: l(a, o[0]),
        cols: l(i, o[1])
      } : l(n ? i : a, o), d = this.d_numToleratedItems || (e ? [s(u.rows), s(u.cols)] : s(u));
      return {
        numItemsInViewport: u,
        numToleratedItems: d
      };
    },
    calculateOptions: function() {
      var e = this, n = this.isBoth(), o = this.first, r = this.calculateNumItems(), i = r.numItemsInViewport, a = r.numToleratedItems, l = function(d, c, p) {
        var f = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !1;
        return e.getLast(d + c + (d < p ? 2 : 3) * p, f);
      }, s = n ? {
        rows: l(o.rows, i.rows, a[0]),
        cols: l(o.cols, i.cols, a[1], !0)
      } : l(o, i, a);
      this.last = s, this.numItemsInViewport = i, this.d_numToleratedItems = a, this.$emit("update:numToleratedItems", this.d_numToleratedItems), this.showLoader && (this.loaderArr = n ? Array.from({
        length: i.rows
      }).map(function() {
        return Array.from({
          length: i.cols
        });
      }) : Array.from({
        length: i
      })), this.lazy && Promise.resolve().then(function() {
        var u;
        e.lazyLoadState = {
          first: e.step ? n ? {
            rows: 0,
            cols: o.cols
          } : 0 : o,
          last: Math.min(e.step ? e.step : s, ((u = e.items) === null || u === void 0 ? void 0 : u.length) || 0)
        }, e.$emit("lazy-load", e.lazyLoadState);
      });
    },
    calculateAutoSize: function() {
      var e = this;
      this.autoSize && !this.d_loading && Promise.resolve().then(function() {
        if (e.content) {
          var n = e.isBoth(), o = e.isHorizontal(), r = e.isVertical();
          e.content.style.minHeight = e.content.style.minWidth = "auto", e.content.style.position = "relative", e.element.style.contain = "none";
          var i = [Oe(e.element), $e(e.element)], a = i[0], l = i[1];
          (n || o) && (e.element.style.width = a < e.defaultWidth ? a + "px" : e.scrollWidth || e.defaultWidth + "px"), (n || r) && (e.element.style.height = l < e.defaultHeight ? l + "px" : e.scrollHeight || e.defaultHeight + "px"), e.content.style.minHeight = e.content.style.minWidth = "", e.content.style.position = "", e.element.style.contain = "";
        }
      });
    },
    getLast: function() {
      var e, n, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, r = arguments.length > 1 ? arguments[1] : void 0;
      return this.items ? Math.min(r ? ((e = this.columns || this.items[0]) === null || e === void 0 ? void 0 : e.length) || 0 : ((n = this.items) === null || n === void 0 ? void 0 : n.length) || 0, o) : 0;
    },
    getContentPosition: function() {
      if (this.content) {
        var e = getComputedStyle(this.content), n = parseFloat(e.paddingLeft) + Math.max(parseFloat(e.left) || 0, 0), o = parseFloat(e.paddingRight) + Math.max(parseFloat(e.right) || 0, 0), r = parseFloat(e.paddingTop) + Math.max(parseFloat(e.top) || 0, 0), i = parseFloat(e.paddingBottom) + Math.max(parseFloat(e.bottom) || 0, 0);
        return {
          left: n,
          right: o,
          top: r,
          bottom: i,
          x: n + o,
          y: r + i
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
        var n = this.isBoth(), o = this.isHorizontal(), r = this.element.parentElement, i = this.scrollWidth || "".concat(this.element.offsetWidth || r.offsetWidth, "px"), a = this.scrollHeight || "".concat(this.element.offsetHeight || r.offsetHeight, "px"), l = function(u, d) {
          return e.element.style[u] = d;
        };
        n || o ? (l("height", a), l("width", i)) : l("height", a);
      }
    },
    setSpacerSize: function() {
      var e = this, n = this.items;
      if (n) {
        var o = this.isBoth(), r = this.isHorizontal(), i = this.getContentPosition(), a = function(s, u, d) {
          var c = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 0;
          return e.spacerStyle = Ne(Ne({}, e.spacerStyle), Po({}, "".concat(s), (u || []).length * d + c + "px"));
        };
        o ? (a("height", n, this.itemSize[0], i.y), a("width", this.columns || n[1], this.itemSize[1], i.x)) : r ? a("width", this.columns || n, this.itemSize, i.x) : a("height", n, this.itemSize, i.y);
      }
    },
    setContentPosition: function(e) {
      var n = this;
      if (this.content && !this.appendOnly) {
        var o = this.isBoth(), r = this.isHorizontal(), i = e ? e.first : this.first, a = function(d, c) {
          return d * c;
        }, l = function() {
          var d = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, c = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return n.contentStyle = Ne(Ne({}, n.contentStyle), {
            transform: "translate3d(".concat(d, "px, ").concat(c, "px, 0)")
          });
        };
        if (o)
          l(a(i.cols, this.itemSize[1]), a(i.rows, this.itemSize[0]));
        else {
          var s = a(i, this.itemSize);
          r ? l(s, 0) : l(0, s);
        }
      }
    },
    onScrollPositionChange: function(e) {
      var n = this, o = e.target, r = this.isBoth(), i = this.isHorizontal(), a = this.getContentPosition(), l = function(j, F) {
        return j ? j > F ? j - F : j : 0;
      }, s = function(j, F) {
        return Math.floor(j / (F || j));
      }, u = function(j, F, q, Y, D, K) {
        return j <= D ? D : K ? q - Y - D : F + D - 1;
      }, d = function(j, F, q, Y, D, K, J, me) {
        if (j <= K) return 0;
        var oe = Math.max(0, J ? j < F ? q : j - K : j > F ? q : j - 2 * K), Q = n.getLast(oe, me);
        return oe > Q ? Q - D : oe;
      }, c = function(j, F, q, Y, D, K) {
        var J = F + Y + 2 * D;
        return j >= D && (J += D + 1), n.getLast(J, K);
      }, p = l(o.scrollTop, a.top), f = l(o.scrollLeft, a.left), m = r ? {
        rows: 0,
        cols: 0
      } : 0, g = this.last, b = !1, v = this.lastScrollPos;
      if (r) {
        var S = this.lastScrollPos.top <= p, C = this.lastScrollPos.left <= f;
        if (!this.appendOnly || this.appendOnly && (S || C)) {
          var h = {
            rows: s(p, this.itemSize[0]),
            cols: s(f, this.itemSize[1])
          }, w = {
            rows: u(h.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], S),
            cols: u(h.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], C)
          };
          m = {
            rows: d(h.rows, w.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], S),
            cols: d(h.cols, w.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], C, !0)
          }, g = {
            rows: c(h.rows, m.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0]),
            cols: c(h.cols, m.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], !0)
          }, b = m.rows !== this.first.rows || g.rows !== this.last.rows || m.cols !== this.first.cols || g.cols !== this.last.cols || this.isRangeChanged, v = {
            top: p,
            left: f
          };
        }
      } else {
        var L = i ? f : p, k = this.lastScrollPos <= L;
        if (!this.appendOnly || this.appendOnly && k) {
          var x = s(L, this.itemSize), N = u(x, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, k);
          m = d(x, N, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, k), g = c(x, m, this.last, this.numItemsInViewport, this.d_numToleratedItems), b = m !== this.first || g !== this.last || this.isRangeChanged, v = L;
        }
      }
      return {
        first: m,
        last: g,
        isRangeChanged: b,
        scrollPos: v
      };
    },
    onScrollChange: function(e) {
      var n = this.onScrollPositionChange(e), o = n.first, r = n.last, i = n.isRangeChanged, a = n.scrollPos;
      if (i) {
        var l = {
          first: o,
          last: r
        };
        if (this.setContentPosition(l), this.first = o, this.last = r, this.lastScrollPos = a, this.$emit("scroll-index-change", l), this.lazy && this.isPageChanged(o)) {
          var s, u, d = {
            first: this.step ? Math.min(this.getPageByFirst(o) * this.step, (((s = this.items) === null || s === void 0 ? void 0 : s.length) || 0) - this.step) : o,
            last: Math.min(this.step ? (this.getPageByFirst(o) + 1) * this.step : r, ((u = this.items) === null || u === void 0 ? void 0 : u.length) || 0)
          }, c = this.lazyLoadState.first !== d.first || this.lazyLoadState.last !== d.last;
          c && this.$emit("lazy-load", d), this.lazyLoadState = d;
        }
      }
    },
    onScroll: function(e) {
      var n = this;
      if (this.$emit("scroll", e), this.delay) {
        if (this.scrollTimeout && clearTimeout(this.scrollTimeout), this.isPageChanged()) {
          if (!this.d_loading && this.showLoader) {
            var o = this.onScrollPositionChange(e), r = o.isRangeChanged, i = r || (this.step ? this.isPageChanged() : !1);
            i && (this.d_loading = !0);
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
        if (ct(e.element)) {
          var n = e.isBoth(), o = e.isVertical(), r = e.isHorizontal(), i = [Oe(e.element), $e(e.element)], a = i[0], l = i[1], s = a !== e.defaultWidth, u = l !== e.defaultHeight, d = n ? s || u : r ? s : o ? u : !1;
          d && (e.d_numToleratedItems = e.numToleratedItems, e.defaultWidth = a, e.defaultHeight = l, e.defaultContentWidth = Oe(e.content), e.defaultContentHeight = $e(e.content), e.init());
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
      var n = (this.items || []).length, o = this.isBoth() ? this.first.rows + e : this.first + e;
      return {
        index: o,
        count: n,
        first: o === 0,
        last: o === n - 1,
        even: o % 2 === 0,
        odd: o % 2 !== 0
      };
    },
    getLoaderOptions: function(e, n) {
      var o = this.loaderArr.length;
      return Ne({
        index: e,
        count: o,
        first: e === 0,
        last: e === o - 1,
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
      this.content = e || this.content || bt(this.element, '[data-pc-section="content"]');
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
    SpinnerIcon: gt
  }
}, wl = ["tabindex"];
function $l(t, e, n, o, r, i) {
  var a = ee("SpinnerIcon");
  return t.disabled ? ($(), I(je, {
    key: 1
  }, [A(t.$slots, "default"), A(t.$slots, "content", {
    items: t.items,
    rows: t.items,
    columns: i.loadedColumns
  })], 64)) : ($(), I("div", y({
    key: 0,
    ref: i.elementRef,
    class: i.containerClass,
    tabindex: t.tabindex,
    style: t.style,
    onScroll: e[0] || (e[0] = function() {
      return i.onScroll && i.onScroll.apply(i, arguments);
    })
  }, t.ptmi("root")), [A(t.$slots, "content", {
    styleClass: i.contentClass,
    items: i.loadedItems,
    getItemOptions: i.getOptions,
    loading: r.d_loading,
    getLoaderOptions: i.getLoaderOptions,
    itemSize: t.itemSize,
    rows: i.loadedRows,
    columns: i.loadedColumns,
    contentRef: i.contentRef,
    spacerStyle: r.spacerStyle,
    contentStyle: r.contentStyle,
    vertical: i.isVertical(),
    horizontal: i.isHorizontal(),
    both: i.isBoth()
  }, function() {
    return [H("div", y({
      ref: i.contentRef,
      class: i.contentClass,
      style: r.contentStyle
    }, t.ptm("content")), [($(!0), I(je, null, Ot(i.loadedItems, function(l, s) {
      return A(t.$slots, "item", {
        key: s,
        item: l,
        options: i.getOptions(s)
      });
    }), 128))], 16)];
  }), t.showSpacer ? ($(), I("div", y({
    key: 0,
    class: "p-virtualscroller-spacer",
    style: r.spacerStyle
  }, t.ptm("spacer")), null, 16)) : W("", !0), !t.loaderDisabled && t.showLoader && r.d_loading ? ($(), I("div", y({
    key: 1,
    class: i.loaderClass
  }, t.ptm("loader")), [t.$slots && t.$slots.loader ? ($(!0), I(je, {
    key: 0
  }, Ot(r.loaderArr, function(l, s) {
    return A(t.$slots, "loader", {
      key: s,
      options: i.getLoaderOptions(s, i.isBoth() && {
        numCols: t.d_numItemsInViewport.cols
      })
    });
  }), 128)) : W("", !0), A(t.$slots, "loadingicon", {}, function() {
    return [Se(a, y({
      spin: "",
      class: "p-virtualscroller-loading-icon"
    }, t.ptm("loadingIcon")), null, 16)];
  })], 16)) : W("", !0)], 16, wl));
}
xo.render = $l;
var Ol = `
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
`, Cl = {
  root: function(e) {
    var n = e.instance, o = e.props, r = e.state;
    return ["p-select p-component p-inputwrapper", {
      "p-disabled": o.disabled,
      "p-invalid": n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-focus": r.focused,
      "p-inputwrapper-filled": n.$filled,
      "p-inputwrapper-focus": r.focused || r.overlayVisible,
      "p-select-open": r.overlayVisible,
      "p-select-fluid": n.$fluid,
      "p-select-sm p-inputfield-sm": o.size === "small",
      "p-select-lg p-inputfield-lg": o.size === "large"
    }];
  },
  label: function(e) {
    var n, o = e.instance, r = e.props;
    return ["p-select-label", {
      "p-placeholder": !r.editable && o.label === r.placeholder,
      "p-select-label-empty": !r.editable && !o.$slots.value && (o.label === "p-emptylabel" || ((n = o.label) === null || n === void 0 ? void 0 : n.length) === 0)
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
    var n = e.instance, o = e.props, r = e.state, i = e.option, a = e.focusedOption;
    return ["p-select-option", {
      "p-select-option-selected": n.isSelected(i) && o.highlightOnSelect,
      "p-focus": r.focusedOptionIndex === a,
      "p-disabled": n.isOptionDisabled(i)
    }];
  },
  optionLabel: "p-select-option-label",
  optionCheckIcon: "p-select-option-check-icon",
  optionBlankIcon: "p-select-option-blank-icon",
  emptyMessage: "p-select-empty-message"
}, kl = V.extend({
  name: "select",
  style: Ol,
  classes: Cl
}), _l = {
  name: "BaseSelect",
  extends: So,
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
  style: kl,
  provide: function() {
    return {
      $pcSelect: this,
      $parentInstance: this
    };
  }
};
function nt(t) {
  "@babel/helpers - typeof";
  return nt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, nt(t);
}
function Il(t) {
  return Ll(t) || xl(t) || Pl(t) || Tl();
}
function Tl() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Pl(t, e) {
  if (t) {
    if (typeof t == "string") return Bt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Bt(t, e) : void 0;
  }
}
function xl(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Ll(t) {
  if (Array.isArray(t)) return Bt(t);
}
function Bt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function zn(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    e && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(t, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function Fn(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? zn(Object(n), !0).forEach(function(o) {
      we(t, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : zn(Object(n)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return t;
}
function we(t, e, n) {
  return (e = Al(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Al(t) {
  var e = El(t, "string");
  return nt(e) == "symbol" ? e : e + "";
}
function El(t, e) {
  if (nt(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (nt(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Vl = {
  name: "Select",
  extends: _l,
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
    getPTItemOptions: function(e, n, o, r) {
      return this.ptm(r, {
        context: {
          option: e,
          index: o,
          selected: this.isSelected(e),
          focused: this.focusedOptionIndex === this.getOptionIndex(o, n),
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
      return (this.optionGroupLabel ? e - this.visibleOptions.slice(0, e).filter(function(o) {
        return n.isOptionGroup(o);
      }).length : e) + 1;
    },
    show: function(e) {
      this.$emit("before-show"), this.overlayVisible = !0, this.focusedOptionIndex = this.focusedOptionIndex !== -1 ? this.focusedOptionIndex : this.autoOptionFocus ? this.findFirstFocusedOptionIndex() : this.editable ? -1 : this.findSelectedOptionIndex(), e && ce(this.$refs.focusInput);
    },
    hide: function(e) {
      var n = this, o = function() {
        n.$emit("before-hide"), n.overlayVisible = !1, n.clicked = !1, n.focusedOptionIndex = -1, n.searchValue = "", n.resetFilterOnHide && (n.filterValue = null), e && ce(n.$refs.focusInput);
      };
      setTimeout(function() {
        o();
      }, 0);
    },
    onFocus: function(e) {
      this.disabled || (this.focused = !0, this.overlayVisible && (this.focusedOptionIndex = this.focusedOptionIndex !== -1 ? this.focusedOptionIndex : this.autoOptionFocus ? this.findFirstFocusedOptionIndex() : this.editable ? -1 : this.findSelectedOptionIndex(), this.scrollInView(this.focusedOptionIndex)), this.$emit("focus", e));
    },
    onBlur: function(e) {
      var n = this;
      setTimeout(function() {
        var o, r;
        n.focused = !1, n.focusedOptionIndex = -1, n.searchValue = "", n.$emit("blur", e), (o = (r = n.formField).onBlur) === null || o === void 0 || o.call(r, e);
      }, 100);
    },
    onKeyDown: function(e) {
      var n = this;
      if (this.disabled) {
        e.preventDefault();
        return;
      }
      if (bi())
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
      var o = e.metaKey || e.ctrlKey;
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
          !o && Zr(e.key) && (!this.overlayVisible && this.show(), !this.editable && this.searchOptions(e, e.key), this.filter && this.$nextTick(function() {
            n.$refs.filterInput && ce(n.$refs.filterInput.$el);
          }));
          break;
      }
      this.clicked = !1;
    },
    onEditableInput: function(e) {
      var n = e.target.value;
      this.searchValue = "";
      var o = this.searchOptions(e, n);
      !o && (this.focusedOptionIndex = -1), this.updateModel(e, n), !this.overlayVisible && P(n) && this.show();
    },
    onContainerClick: function(e) {
      this.disabled || this.loading || e.target.tagName === "INPUT" || e.target.getAttribute("data-pc-section") === "clearicon" || e.target.closest('[data-pc-section="clearicon"]') || ((!this.overlay || !this.overlay.contains(e.target)) && (this.overlayVisible ? this.hide(!0) : this.show(!0)), this.clicked = !0);
    },
    onClearClick: function(e) {
      this.updateModel(e, null), this.resetFilterOnClear && (this.filterValue = null);
    },
    onFirstHiddenFocus: function(e) {
      var n = e.relatedTarget === this.$refs.focusInput ? ci(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      ce(n);
    },
    onLastHiddenFocus: function(e) {
      var n = e.relatedTarget === this.$refs.focusInput ? pi(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      ce(n);
    },
    onOptionSelect: function(e, n) {
      var o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0;
      if (this.overlayVisible) {
        var r = this.getOptionValue(n);
        this.updateModel(e, r), o && this.hide(!0);
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
      Ms.emit("overlay-click", {
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
        var o = this.focusedOptionIndex !== -1 ? this.findPrevOptionIndex(this.focusedOptionIndex) : this.clicked ? this.findLastOptionIndex() : this.findLastFocusedOptionIndex();
        this.changeFocusedOptionIndex(e, o), !this.overlayVisible && this.show(), e.preventDefault();
      }
    },
    onArrowLeftKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n && (this.focusedOptionIndex = -1);
    },
    onHomeKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (n) {
        var o = e.currentTarget;
        e.shiftKey ? o.setSelectionRange(0, e.target.selectionStart) : (o.setSelectionRange(0, 0), this.focusedOptionIndex = -1);
      } else
        this.changeFocusedOptionIndex(e, this.findFirstOptionIndex()), !this.overlayVisible && this.show();
      e.preventDefault();
    },
    onEndKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (n) {
        var o = e.currentTarget;
        if (e.shiftKey)
          o.setSelectionRange(e.target.selectionStart, o.value.length);
        else {
          var r = o.value.length;
          o.setSelectionRange(r, r), this.focusedOptionIndex = -1;
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
      n || (this.overlayVisible && this.hasFocusableElements() ? (ce(this.$refs.firstHiddenFocusableElementOnOverlay), e.preventDefault()) : (this.focusedOptionIndex !== -1 && this.onOptionSelect(e, this.visibleOptions[this.focusedOptionIndex]), this.overlayVisible && this.hide(this.filter)));
    },
    onBackspaceKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n && !this.overlayVisible && this.show();
    },
    onOverlayEnter: function(e) {
      var n = this;
      yt.set("overlay", e, this.$primevue.config.zIndex.overlay), ii(e, {
        position: "absolute",
        top: "0"
      }), this.alignOverlay(), this.scrollInView(), this.$attrSelector && e.setAttribute(this.$attrSelector, ""), setTimeout(function() {
        n.autoFilterFocus && n.filter && ce(n.$refs.filterInput.$el), n.autoUpdateModel();
      }, 1);
    },
    onOverlayAfterEnter: function() {
      this.bindOutsideClickListener(), this.bindScrollListener(), this.bindResizeListener(), this.$emit("show");
    },
    onOverlayLeave: function(e) {
      var n = this;
      e.style.pointerEvents = "none", this.unbindOutsideClickListener(), this.unbindScrollListener(), this.unbindResizeListener(), this.autoFilterFocus && this.filter && !this.editable && this.$nextTick(function() {
        n.$refs.filterInput && ce(n.$refs.filterInput.$el);
      }), this.$emit("hide"), this.overlay = null;
    },
    onOverlayAfterLeave: function(e) {
      yt.clear(e);
    },
    alignOverlay: function() {
      this.appendTo === "self" ? si(this.overlay, this.$el) : this.overlay && (this.overlay.style.minWidth = to(this.$el) + "px", ri(this.overlay, this.$el));
    },
    bindOutsideClickListener: function() {
      var e = this;
      this.outsideClickListener || (this.outsideClickListener = function(n) {
        var o = n.composedPath();
        e.overlayVisible && e.overlay && !o.includes(e.$el) && !o.includes(e.overlay) && e.hide();
      }, document.addEventListener("click", this.outsideClickListener, !0));
    },
    unbindOutsideClickListener: function() {
      this.outsideClickListener && (document.removeEventListener("click", this.outsideClickListener, !0), this.outsideClickListener = null);
    },
    bindScrollListener: function() {
      var e = this;
      this.scrollHandler || (this.scrollHandler = new Ns(this.$refs.container, function() {
        e.overlayVisible && e.hide();
      })), this.scrollHandler.bindScrollListener();
    },
    unbindScrollListener: function() {
      this.scrollHandler && this.scrollHandler.unbindScrollListener();
    },
    bindResizeListener: function() {
      var e = this;
      this.resizeListener || (this.resizeListener = function() {
        e.overlayVisible && !gi() && e.hide();
      }, window.addEventListener("resize", this.resizeListener));
    },
    unbindResizeListener: function() {
      this.resizeListener && (window.removeEventListener("resize", this.resizeListener), this.resizeListener = null);
    },
    bindLabelClickListener: function() {
      var e = this;
      if (!this.editable && !this.labelClickListener) {
        var n = document.querySelector('label[for="'.concat(this.labelId, '"]'));
        n && ct(n) && (this.labelClickListener = function() {
          ce(e.$refs.focusInput);
        }, n.addEventListener("click", this.labelClickListener));
      }
    },
    unbindLabelClickListener: function() {
      if (this.labelClickListener) {
        var e = document.querySelector('label[for="'.concat(this.labelId, '"]'));
        e && ct(e) && e.removeEventListener("click", this.labelClickListener);
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
      return Ut(this.overlay, ':not([data-p-hidden-focusable="true"])').length > 0;
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
      return P(e) && !(this.isOptionDisabled(e) || this.isOptionGroup(e));
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
      return on(this.visibleOptions, function(n) {
        return e.isValidOption(n);
      });
    },
    findNextOptionIndex: function(e) {
      var n = this, o = e < this.visibleOptions.length - 1 ? this.visibleOptions.slice(e + 1).findIndex(function(r) {
        return n.isValidOption(r);
      }) : -1;
      return o > -1 ? o + e + 1 : e;
    },
    findPrevOptionIndex: function(e) {
      var n = this, o = e > 0 ? on(this.visibleOptions.slice(0, e), function(r) {
        return n.isValidOption(r);
      }) : -1;
      return o > -1 ? o : e;
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
      var o = this;
      this.searchValue = (this.searchValue || "") + n;
      var r = -1, i = !1;
      return P(this.searchValue) && (r = this.visibleOptions.findIndex(function(a) {
        return o.isOptionExactMatched(a);
      }), r === -1 && (r = this.visibleOptions.findIndex(function(a) {
        return o.isOptionStartsWith(a);
      })), r !== -1 && (i = !0), r === -1 && this.focusedOptionIndex === -1 && (r = this.findFirstFocusedOptionIndex()), r !== -1 && this.changeFocusedOptionIndex(e, r)), this.searchTimeout && clearTimeout(this.searchTimeout), this.searchTimeout = setTimeout(function() {
        o.searchValue = "", o.searchTimeout = null;
      }, 500), i;
    },
    changeFocusedOptionIndex: function(e, n) {
      this.focusedOptionIndex !== n && (this.focusedOptionIndex = n, this.scrollInView(), this.selectOnFocus && this.onOptionSelect(e, this.visibleOptions[n], !1));
    },
    scrollInView: function() {
      var e = this, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : -1;
      this.$nextTick(function() {
        var o = n !== -1 ? "".concat(e.$id, "_").concat(n) : e.focusedOptionId, r = bt(e.list, 'li[id="'.concat(o, '"]'));
        r ? r.scrollIntoView && r.scrollIntoView({
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
      return (e || []).reduce(function(o, r, i) {
        o.push({
          optionGroup: r,
          group: !0,
          index: i
        });
        var a = n.getOptionGroupChildren(r);
        return a && a.forEach(function(l) {
          return o.push(l);
        }), o;
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
        var o = Li.filter(n, this.searchFields, this.filterValue, this.filterMatchMode, this.filterLocale);
        if (this.optionGroupLabel) {
          var r = this.options || [], i = [];
          return r.forEach(function(a) {
            var l = e.getOptionGroupChildren(a), s = l.filter(function(u) {
              return o.includes(u);
            });
            s.length > 0 && i.push(Fn(Fn({}, a), {}, we({}, typeof e.optionGroupChildren == "string" ? e.optionGroupChildren : "items", Il(s))));
          }), this.flatOptions(i);
        }
        return o;
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
      return P(this.visibleOptions) ? this.filterMessageText.replaceAll("{0}", this.visibleOptions.length) : this.emptyFilterMessageText;
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
      return ue(we({
        invalid: this.$invalid,
        disabled: this.disabled,
        focus: this.focused,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    },
    labelDataP: function() {
      return ue(we(we({
        placeholder: !this.editable && this.label === this.placeholder,
        clearable: this.showClear,
        disabled: this.disabled,
        editable: this.editable
      }, this.size, this.size), "empty", !this.editable && !this.$slots.value && (this.label === "p-emptylabel" || this.label.length === 0)));
    },
    dropdownIconDataP: function() {
      return ue(we({}, this.size, this.size));
    },
    overlayDataP: function() {
      return ue(we({}, "portal-" + this.appendTo, "portal-" + this.appendTo));
    }
  },
  directives: {
    ripple: bo
  },
  components: {
    InputText: wo,
    VirtualScroller: xo,
    Portal: Wt,
    InputIcon: To,
    IconField: Io,
    TimesIcon: _o,
    ChevronDownIcon: Co,
    SpinnerIcon: gt,
    SearchIcon: ko,
    CheckIcon: Oo,
    BlankIcon: $o
  }
}, jl = ["id", "data-p"], zl = ["name", "id", "value", "placeholder", "tabindex", "disabled", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-invalid", "data-p"], Fl = ["name", "id", "tabindex", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-invalid", "aria-disabled", "data-p"], Nl = ["data-p"], Ml = ["id"], Dl = ["id"], Rl = ["id", "aria-label", "aria-selected", "aria-disabled", "aria-setsize", "aria-posinset", "onMousedown", "onMousemove", "data-p-selected", "data-p-focused", "data-p-disabled"];
function Bl(t, e, n, o, r, i) {
  var a = ee("SpinnerIcon"), l = ee("InputText"), s = ee("SearchIcon"), u = ee("InputIcon"), d = ee("IconField"), c = ee("CheckIcon"), p = ee("BlankIcon"), f = ee("VirtualScroller"), m = ee("Portal"), g = Rn("ripple");
  return $(), I("div", y({
    ref: "container",
    id: t.$id,
    class: t.cx("root"),
    onClick: e[12] || (e[12] = function() {
      return i.onContainerClick && i.onContainerClick.apply(i, arguments);
    }),
    "data-p": i.containerDataP
  }, t.ptmi("root")), [t.editable ? ($(), I("input", y({
    key: 0,
    ref: "focusInput",
    name: t.name,
    id: t.labelId || t.inputId,
    type: "text",
    class: [t.cx("label"), t.inputClass, t.labelClass],
    style: [t.inputStyle, t.labelStyle],
    value: i.editableInputValue,
    placeholder: t.placeholder,
    tabindex: t.disabled ? -1 : t.tabindex,
    disabled: t.disabled,
    autocomplete: "off",
    role: "combobox",
    "aria-label": t.ariaLabel,
    "aria-labelledby": t.ariaLabelledby,
    "aria-haspopup": "listbox",
    "aria-expanded": r.overlayVisible,
    "aria-controls": r.overlayVisible ? t.$id + "_list" : void 0,
    "aria-activedescendant": r.focused ? i.focusedOptionId : void 0,
    "aria-invalid": t.invalid || void 0,
    onFocus: e[0] || (e[0] = function() {
      return i.onFocus && i.onFocus.apply(i, arguments);
    }),
    onBlur: e[1] || (e[1] = function() {
      return i.onBlur && i.onBlur.apply(i, arguments);
    }),
    onKeydown: e[2] || (e[2] = function() {
      return i.onKeyDown && i.onKeyDown.apply(i, arguments);
    }),
    onInput: e[3] || (e[3] = function() {
      return i.onEditableInput && i.onEditableInput.apply(i, arguments);
    }),
    "data-p": i.labelDataP
  }, t.ptm("label")), null, 16, zl)) : ($(), I("span", y({
    key: 1,
    ref: "focusInput",
    name: t.name,
    id: t.labelId || t.inputId,
    class: [t.cx("label"), t.inputClass, t.labelClass],
    style: [t.inputStyle, t.labelStyle],
    tabindex: t.disabled ? -1 : t.tabindex,
    role: "combobox",
    "aria-label": t.ariaLabel || (i.label === "p-emptylabel" ? void 0 : i.label),
    "aria-labelledby": t.ariaLabelledby,
    "aria-haspopup": "listbox",
    "aria-expanded": r.overlayVisible,
    "aria-controls": t.$id + "_list",
    "aria-activedescendant": r.focused ? i.focusedOptionId : void 0,
    "aria-invalid": t.invalid || void 0,
    "aria-disabled": t.disabled,
    onFocus: e[4] || (e[4] = function() {
      return i.onFocus && i.onFocus.apply(i, arguments);
    }),
    onBlur: e[5] || (e[5] = function() {
      return i.onBlur && i.onBlur.apply(i, arguments);
    }),
    onKeydown: e[6] || (e[6] = function() {
      return i.onKeyDown && i.onKeyDown.apply(i, arguments);
    }),
    "data-p": i.labelDataP
  }, t.ptm("label")), [A(t.$slots, "value", {
    value: t.d_value,
    placeholder: t.placeholder
  }, function() {
    var b;
    return [ut(se(i.label === "p-emptylabel" ? " " : (b = i.label) !== null && b !== void 0 ? b : "empty"), 1)];
  })], 16, Fl)), i.isClearIconVisible ? A(t.$slots, "clearicon", {
    key: 2,
    class: Ee(t.cx("clearIcon")),
    clearCallback: i.onClearClick
  }, function() {
    return [($(), ae($t(t.clearIcon ? "i" : "TimesIcon"), y({
      ref: "clearIcon",
      class: [t.cx("clearIcon"), t.clearIcon],
      onClick: i.onClearClick
    }, t.ptm("clearIcon"), {
      "data-pc-section": "clearicon"
    }), null, 16, ["class", "onClick"]))];
  }) : W("", !0), H("div", y({
    class: t.cx("dropdown")
  }, t.ptm("dropdown")), [t.loading ? A(t.$slots, "loadingicon", {
    key: 0,
    class: Ee(t.cx("loadingIcon"))
  }, function() {
    return [t.loadingIcon ? ($(), I("span", y({
      key: 0,
      class: [t.cx("loadingIcon"), "pi-spin", t.loadingIcon],
      "aria-hidden": "true"
    }, t.ptm("loadingIcon")), null, 16)) : ($(), ae(a, y({
      key: 1,
      class: t.cx("loadingIcon"),
      spin: "",
      "aria-hidden": "true"
    }, t.ptm("loadingIcon")), null, 16, ["class"]))];
  }) : A(t.$slots, "dropdownicon", {
    key: 1,
    class: Ee(t.cx("dropdownIcon"))
  }, function() {
    return [($(), ae($t(t.dropdownIcon ? "span" : "ChevronDownIcon"), y({
      class: [t.cx("dropdownIcon"), t.dropdownIcon],
      "aria-hidden": "true",
      "data-p": i.dropdownIconDataP
    }, t.ptm("dropdownIcon")), null, 16, ["class", "data-p"]))];
  })], 16), Se(m, {
    appendTo: t.appendTo
  }, {
    default: ye(function() {
      return [Se(ir, y({
        name: "p-anchored-overlay",
        onEnter: i.onOverlayEnter,
        onAfterEnter: i.onOverlayAfterEnter,
        onLeave: i.onOverlayLeave,
        onAfterLeave: i.onOverlayAfterLeave
      }, t.ptm("transition")), {
        default: ye(function() {
          return [r.overlayVisible ? ($(), I("div", y({
            key: 0,
            ref: i.overlayRef,
            class: [t.cx("overlay"), t.panelClass, t.overlayClass],
            style: [t.panelStyle, t.overlayStyle],
            onClick: e[10] || (e[10] = function() {
              return i.onOverlayClick && i.onOverlayClick.apply(i, arguments);
            }),
            onKeydown: e[11] || (e[11] = function() {
              return i.onOverlayKeyDown && i.onOverlayKeyDown.apply(i, arguments);
            }),
            "data-p": i.overlayDataP
          }, t.ptm("overlay")), [H("span", y({
            ref: "firstHiddenFocusableElementOnOverlay",
            role: "presentation",
            "aria-hidden": "true",
            class: "p-hidden-accessible p-hidden-focusable",
            tabindex: 0,
            onFocus: e[7] || (e[7] = function() {
              return i.onFirstHiddenFocus && i.onFirstHiddenFocus.apply(i, arguments);
            })
          }, t.ptm("hiddenFirstFocusableEl"), {
            "data-p-hidden-accessible": !0,
            "data-p-hidden-focusable": !0
          }), null, 16), A(t.$slots, "header", {
            value: t.d_value,
            options: i.visibleOptions
          }), t.filter ? ($(), I("div", y({
            key: 0,
            class: t.cx("header")
          }, t.ptm("header")), [Se(d, {
            unstyled: t.unstyled,
            pt: t.ptm("pcFilterContainer")
          }, {
            default: ye(function() {
              return [Se(l, {
                ref: "filterInput",
                type: "text",
                value: r.filterValue,
                onVnodeMounted: i.onFilterUpdated,
                onVnodeUpdated: i.onFilterUpdated,
                class: Ee(t.cx("pcFilter")),
                placeholder: t.filterPlaceholder,
                variant: t.variant,
                unstyled: t.unstyled,
                role: "searchbox",
                autocomplete: "off",
                "aria-owns": t.$id + "_list",
                "aria-activedescendant": i.focusedOptionId,
                onKeydown: i.onFilterKeyDown,
                onBlur: i.onFilterBlur,
                onInput: i.onFilterChange,
                pt: t.ptm("pcFilter"),
                formControl: {
                  novalidate: !0
                }
              }, null, 8, ["value", "onVnodeMounted", "onVnodeUpdated", "class", "placeholder", "variant", "unstyled", "aria-owns", "aria-activedescendant", "onKeydown", "onBlur", "onInput", "pt"]), Se(u, {
                unstyled: t.unstyled,
                pt: t.ptm("pcFilterIconContainer")
              }, {
                default: ye(function() {
                  return [A(t.$slots, "filtericon", {}, function() {
                    return [t.filterIcon ? ($(), I("span", y({
                      key: 0,
                      class: t.filterIcon
                    }, t.ptm("filterIcon")), null, 16)) : ($(), ae(s, sr(y({
                      key: 1
                    }, t.ptm("filterIcon"))), null, 16))];
                  })];
                }),
                _: 3
              }, 8, ["unstyled", "pt"])];
            }),
            _: 3
          }, 8, ["unstyled", "pt"]), H("span", y({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, t.ptm("hiddenFilterResult"), {
            "data-p-hidden-accessible": !0
          }), se(i.filterResultMessageText), 17)], 16)) : W("", !0), H("div", y({
            class: t.cx("listContainer"),
            style: {
              "max-height": i.virtualScrollerDisabled ? t.scrollHeight : ""
            }
          }, t.ptm("listContainer")), [Se(f, y({
            ref: i.virtualScrollerRef
          }, t.virtualScrollerOptions, {
            items: i.visibleOptions,
            style: {
              height: t.scrollHeight
            },
            tabindex: -1,
            disabled: i.virtualScrollerDisabled,
            pt: t.ptm("virtualScroller")
          }), ar({
            content: ye(function(b) {
              var v = b.styleClass, S = b.contentRef, C = b.items, h = b.getItemOptions, w = b.contentStyle, L = b.itemSize;
              return [H("ul", y({
                ref: function(x) {
                  return i.listRef(x, S);
                },
                id: t.$id + "_list",
                class: [t.cx("list"), v],
                style: w,
                role: "listbox"
              }, t.ptm("list")), [($(!0), I(je, null, Ot(C, function(k, x) {
                return $(), I(je, {
                  key: i.getOptionRenderKey(k, i.getOptionIndex(x, h))
                }, [i.isOptionGroup(k) ? ($(), I("li", y({
                  key: 0,
                  id: t.$id + "_" + i.getOptionIndex(x, h),
                  style: {
                    height: L ? L + "px" : void 0
                  },
                  class: t.cx("optionGroup"),
                  role: "option"
                }, {
                  ref_for: !0
                }, t.ptm("optionGroup")), [A(t.$slots, "optiongroup", {
                  option: k.optionGroup,
                  index: i.getOptionIndex(x, h)
                }, function() {
                  return [H("span", y({
                    class: t.cx("optionGroupLabel")
                  }, {
                    ref_for: !0
                  }, t.ptm("optionGroupLabel")), se(i.getOptionGroupLabel(k.optionGroup)), 17)];
                })], 16, Dl)) : Bn(($(), I("li", y({
                  key: 1,
                  id: t.$id + "_" + i.getOptionIndex(x, h),
                  class: t.cx("option", {
                    option: k,
                    focusedOption: i.getOptionIndex(x, h)
                  }),
                  style: {
                    height: L ? L + "px" : void 0
                  },
                  role: "option",
                  "aria-label": i.getOptionLabel(k),
                  "aria-selected": i.isSelected(k),
                  "aria-disabled": i.isOptionDisabled(k),
                  "aria-setsize": i.ariaSetSize,
                  "aria-posinset": i.getAriaPosInset(i.getOptionIndex(x, h)),
                  onMousedown: function(M) {
                    return i.onOptionSelect(M, k);
                  },
                  onMousemove: function(M) {
                    return i.onOptionMouseMove(M, i.getOptionIndex(x, h));
                  },
                  onClick: e[8] || (e[8] = lr(function() {
                  }, ["stop"])),
                  "data-p-selected": !t.checkmark && i.isSelected(k),
                  "data-p-focused": r.focusedOptionIndex === i.getOptionIndex(x, h),
                  "data-p-disabled": i.isOptionDisabled(k)
                }, {
                  ref_for: !0
                }, i.getPTItemOptions(k, h, x, "option")), [t.checkmark ? ($(), I(je, {
                  key: 0
                }, [i.isSelected(k) ? ($(), ae(c, y({
                  key: 0,
                  class: t.cx("optionCheckIcon")
                }, {
                  ref_for: !0
                }, t.ptm("optionCheckIcon")), null, 16, ["class"])) : ($(), ae(p, y({
                  key: 1,
                  class: t.cx("optionBlankIcon")
                }, {
                  ref_for: !0
                }, t.ptm("optionBlankIcon")), null, 16, ["class"]))], 64)) : W("", !0), A(t.$slots, "option", {
                  option: k,
                  selected: i.isSelected(k),
                  index: i.getOptionIndex(x, h)
                }, function() {
                  return [H("span", y({
                    class: t.cx("optionLabel")
                  }, {
                    ref_for: !0
                  }, t.ptm("optionLabel")), se(i.getOptionLabel(k)), 17)];
                })], 16, Rl)), [[g]])], 64);
              }), 128)), r.filterValue && (!C || C && C.length === 0) ? ($(), I("li", y({
                key: 0,
                class: t.cx("emptyMessage"),
                role: "option"
              }, t.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [A(t.$slots, "emptyfilter", {}, function() {
                return [ut(se(i.emptyFilterMessageText), 1)];
              })], 16)) : !t.options || t.options && t.options.length === 0 ? ($(), I("li", y({
                key: 1,
                class: t.cx("emptyMessage"),
                role: "option"
              }, t.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [A(t.$slots, "empty", {}, function() {
                return [ut(se(i.emptyMessageText), 1)];
              })], 16)) : W("", !0)], 16, Ml)];
            }),
            _: 2
          }, [t.$slots.loader ? {
            name: "loader",
            fn: ye(function(b) {
              var v = b.options;
              return [A(t.$slots, "loader", {
                options: v
              })];
            }),
            key: "0"
          } : void 0]), 1040, ["items", "style", "disabled", "pt"])], 16), A(t.$slots, "footer", {
            value: t.d_value,
            options: i.visibleOptions
          }), !t.options || t.options && t.options.length === 0 ? ($(), I("span", y({
            key: 1,
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, t.ptm("hiddenEmptyMessage"), {
            "data-p-hidden-accessible": !0
          }), se(i.emptyMessageText), 17)) : W("", !0), H("span", y({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, t.ptm("hiddenSelectedMessage"), {
            "data-p-hidden-accessible": !0
          }), se(i.selectedMessageText), 17), H("span", y({
            ref: "lastHiddenFocusableElementOnOverlay",
            role: "presentation",
            "aria-hidden": "true",
            class: "p-hidden-accessible p-hidden-focusable",
            tabindex: 0,
            onFocus: e[9] || (e[9] = function() {
              return i.onLastHiddenFocus && i.onLastHiddenFocus.apply(i, arguments);
            })
          }, t.ptm("hiddenLastFocusableEl"), {
            "data-p-hidden-accessible": !0,
            "data-p-hidden-focusable": !0
          }), null, 16)], 16, Nl)) : W("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onLeave", "onAfterLeave"])];
    }),
    _: 3
  }, 8, ["appendTo"])], 16, jl);
}
Vl.render = Bl;
export {
  V as B,
  Ql as I,
  pi as L,
  Jl as M,
  eu as P,
  bo as R,
  li as U,
  _t as W,
  vi as _,
  Te as a,
  _o as b,
  wo as c,
  So as d,
  P as e,
  ue as f,
  Vl as g,
  ce as h,
  O as i,
  Yl as j,
  ql as k,
  _e as l,
  Wt as m,
  ga as n,
  Gl as o,
  Zl as p,
  wa as q,
  Xl as r,
  ze as s,
  Wl as u,
  ci as v,
  yt as x
};
//# sourceMappingURL=index-CghzfYQS.js.map
