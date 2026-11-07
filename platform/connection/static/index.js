import { B as Ne, C as Pe, c as Me, r as Te, d as De, b as Y, e as Oe, W as Ae, s as Le, P as Re } from "./styles-tpVissSe.js";
import { openBlock as h, createElementBlock as m, mergeProps as ne, createElementVNode as i, defineComponent as ue, computed as Z, withModifiers as oe, Fragment as F, createTextVNode as se, toDisplayString as E, createCommentVNode as N, createVNode as b, unref as d, watch as Be, onBeforeUnmount as pe, ref as w, withDirectives as Ie, vModelText as Ue, withCtx as le, renderList as ce, normalizeClass as q, createBlock as Ve, nextTick as Ke } from "vue";
import { s as ze, a as re, _ as He } from "./ConnectionPicker.vue_vue_type_script_setup_true_lang-RKLMj11t.js";
import { on as fe, api as W, host as We, loadByTagName as Fe, define as Ge } from "@wippy-fe/proxy";
import { Icon as $ } from "@iconify/vue";
var Je = `
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
`, Ye = {
  root: "p-progressspinner",
  spin: "p-progressspinner-spin",
  circle: "p-progressspinner-circle"
}, qe = Ne.extend({
  name: "progressspinner",
  style: Je,
  classes: Ye
}), Ze = {
  name: "BaseProgressSpinner",
  extends: ze,
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
  style: qe,
  provide: function() {
    return {
      $pcProgressSpinner: this,
      $parentInstance: this
    };
  }
}, ve = {
  name: "ProgressSpinner",
  extends: Ze,
  inheritAttrs: !1,
  computed: {
    svgStyle: function() {
      return {
        "animation-duration": this.animationDuration
      };
    }
  }
}, Qe = ["fill", "stroke-width"];
function Xe(r, t, l, u, f, c) {
  return h(), m("div", ne({
    class: r.cx("root"),
    role: "progressbar"
  }, r.ptmi("root")), [(h(), m("svg", ne({
    class: r.cx("spin"),
    viewBox: "25 25 50 50",
    style: c.svgStyle
  }, r.ptm("spin")), [i("circle", ne({
    class: r.cx("circle"),
    cx: "50",
    cy: "50",
    r: "20",
    fill: r.fill,
    "stroke-width": r.strokeWidth,
    strokeMiterlimit: "10"
  }, r.ptm("circle")), null, 16, Qe)], 16))], 16);
}
ve.render = Xe;
const et = { key: 0 }, tt = /* @__PURE__ */ ue({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(r) {
    const t = r, l = Z(() => t.state.deletion_job === null || ["dead", "cancelled"].includes(t.state.deletion_job?.status || ""));
    return (u, f) => r.state.deleting_at ? (h(), m("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: f[1] || (f[1] = oe(() => {
      }, ["stop"])),
      onKeydown: f[2] || (f[2] = oe(() => {
      }, ["stop"]))
    }, [
      l.value ? (h(), m(F, { key: 0 }, [
        i("span", null, [
          f[3] || (f[3] = se("Deletion failed", -1)),
          r.state.deletion_job?.last_error ? (h(), m("span", et, ": " + E(r.state.deletion_job.last_error), 1)) : N("", !0)
        ]),
        b(d(re), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: f[0] || (f[0] = oe((c) => u.$emit("retry"), ["stop"]))
        })
      ], 64)) : (h(), m(F, { key: 1 }, [
        b(d(ve), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        f[4] || (f[4] = i("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : N("", !0);
  }
}), nt = (r, t) => {
  const l = r.__vccOpts || r;
  for (const [u, f] of t)
    l[u] = f;
  return l;
}, ot = /* @__PURE__ */ nt(tt, [["__scopeId", "data-v-63c136c7"]]);
function H(r) {
  return !!r && typeof r == "object" && !Array.isArray(r);
}
function st(r, t) {
  if (t == null) return t;
  switch (r) {
    case "boolean":
    case "checkbox":
      return typeof t == "boolean" ? t : t === "true" ? !0 : t === "false" ? !1 : t;
    case "number":
    case "integer": {
      if (typeof t == "number") return t;
      if (typeof t == "string" && t.trim() !== "") {
        const l = Number(t);
        if (!Number.isNaN(l)) return l;
      }
      return t;
    }
    case "object":
    case "array":
      if (typeof t == "string")
        try {
          const l = JSON.parse(t);
          if (l && typeof l == "object") return l;
        } catch {
        }
      return t;
    default:
      return t;
  }
}
function rt(r, t) {
  if (!t) return r;
  const l = {};
  for (const [u, f] of Object.entries(r))
    l[u] = st(t[u], f);
  return l;
}
function _e(r, t, l) {
  if (t !== void 0 && !t) return null;
  const u = H(r) ? r : {}, f = [
    u,
    H(u.data) ? u.data : null,
    H(u.payload) ? u.payload : null,
    H(u.detail) ? u.detail : null
  ].filter(Boolean);
  for (const c of f) {
    if (c.event !== "component.meta.changed" && c.event !== "component.deleting" && c.event !== "component.deleted") continue;
    const S = String(c.component_id || ""), x = String(u.topic || c.topic || "");
    if (t === void 0) {
      if (!S && (!x.startsWith("component.") || x === "component.")) continue;
    } else if (S && S !== t || !S && x !== `component.${t}`) continue;
    const j = S || t || x.slice(10);
    return c.event === "component.deleting" && typeof c.deletion_job_id == "string" && c.deletion_job_id ? { event: c.event, component_id: j, deletion_job_id: c.deletion_job_id } : c.event !== "component.meta.changed" ? { event: c.event, component_id: j } : {
      event: "component.meta.changed",
      component_id: j,
      meta: rt(H(c.meta) ? c.meta : {}, l),
      deleted: Array.isArray(c.deleted) ? c.deleted.map(String) : []
    };
  }
  return null;
}
function it(r, t, l) {
  const u = _e(r, t, l);
  return u?.event === "component.meta.changed" ? u : null;
}
function at(r, t) {
  const l = _e(r, t);
  return l && l.event !== "component.meta.changed" ? l : null;
}
function lt(r, t, l) {
  if (!r) return null;
  const u = fe(`component.${r}`, (f) => {
    const c = it(f, r, l);
    c && t(c);
  });
  return typeof u == "function" ? u : null;
}
function de(r, t) {
  if (r && typeof r == "object") {
    const l = r, u = l.response?.data?.error;
    if (typeof u == "string") return u;
    if (u && typeof u == "object" && typeof u.message == "string")
      return u.message;
    if (typeof l.message == "string" && l.message) return l.message;
  }
  return t;
}
function ct(r, t, l, u) {
  let f = !0;
  const c = /* @__PURE__ */ new Set(), S = /* @__PURE__ */ new Map();
  function x(y, g) {
    const v = r.value.find((L) => t(L) === y), p = S.get(y), k = g?.job_id || p?.deletion_job_id || v?.deletion_job_id, D = p ? p.deletion_job_id : v?.deleting_at ? v.deletion_job_id : void 0;
    if ((p || v?.deleting_at) && k === D) return;
    const M = {
      deleting_at: p?.deleting_at || v?.deleting_at || (/* @__PURE__ */ new Date()).toISOString(),
      deletion_job_id: k
    };
    S.set(y, M), v && (Object.assign(v, M), v.deletion_job = void 0);
  }
  async function j(y) {
    const g = t(y), v = S.get(g), p = () => f && r.value.includes(y) && S.get(g) === v;
    try {
      const { data: k } = await W.get(`/api/v1/components/${encodeURIComponent(g)}`);
      if (!k?.success) throw new Error(de(k, "Could not read deletion progress"));
      p() && (y.deleting_at = v?.deleting_at || k.deleting_at, y.deletion_job_id = k.deletion_job_id, v && (v.deletion_job_id = y.deletion_job_id), y.deletion_job = k.deletion_job ?? null);
    } catch (k) {
      p() && We.handleError("other", { message: de(k, "Could not read deletion progress") });
    }
  }
  let A = [];
  const P = Be(() => r.value, (y, g = []) => {
    const v = y.filter((p) => !c.has(t(p)));
    for (const p of g)
      c.has(t(p)) || v.some((k) => t(k) === t(p)) || p.deleting_at && u?.(t(p));
    if (v.length !== y.length) {
      r.value = v;
      return;
    }
    for (const p of y) {
      const k = S.get(t(p));
      k && (p.deletion_job_id !== k.deletion_job_id && (p.deletion_job = void 0), Object.assign(p, k));
      const D = g.find((M) => t(M) === t(p));
      p.deletion_job === void 0 && D?.deletion_job_id === p.deletion_job_id && (p.deletion_job = D?.deletion_job), p.deleting_at && !A.includes(p) && j(p);
    }
    A = y;
  }, { immediate: !0 }), T = fe("@message", (y) => {
    const g = at(y);
    if (!g) return;
    const v = r.value.find((p) => t(p) === g.component_id);
    g.event === "component.deleted" ? (v && !c.has(g.component_id) && u?.(g.component_id), c.add(g.component_id), S.delete(g.component_id), r.value = r.value.filter((p) => t(p) !== g.component_id)) : v && x(g.component_id, { job_id: g.deletion_job_id });
  });
  return pe(() => {
    f = !1, P(), typeof T == "function" && T();
  }), { acceptDeletion: x };
}
function dt({ providers: r, connections: t, search: l, confirmId: u }) {
  const f = (o) => o.provider ?? "", c = (o) => o.title ?? o.name ?? o.oauth_provider ?? "Provider", S = (o) => o.icon || "tabler:plug", x = Z(() => {
    const o = {};
    for (const a of r.value) {
      const C = f(a);
      C && (o[C] = a);
    }
    return o;
  });
  function j(o) {
    return o.icon || x.value[o.provider || ""]?.icon || "tabler:plug-connected";
  }
  function A(o) {
    return o.provider ? x.value[o.provider] : void 0;
  }
  function P(o) {
    return new Set((o.scopes_granted ?? []).filter((a) => typeof a == "string" && a.length > 0));
  }
  function T(o) {
    return new Set((o?.default_scopes ?? []).filter((a) => typeof a == "string" && a.length > 0));
  }
  function y(o) {
    return (o?.available_scopes ?? []).map((a) => a.scope).filter((a) => typeof a == "string" && a.length > 0);
  }
  function g(o) {
    const a = T(o);
    return y(o).some((C) => !a.has(C));
  }
  function v(o) {
    if (!o.oauth) return !1;
    const a = A(o);
    if (!g(a)) return !1;
    const C = P(o), B = T(a);
    if (C.size === 0 || B.size === 0) return !1;
    for (const Q of C)
      if (!B.has(Q)) return !1;
    return !0;
  }
  function p(o) {
    return Te(o.connection_state, o.expires_at);
  }
  function k(o) {
    const a = p(o);
    return a === "connected" && v(o) ? "warn" : Me[a];
  }
  function D(o) {
    const a = p(o);
    return a === "connected" && v(o) ? "Limited access" : Pe[a];
  }
  function M(o) {
    const a = Number(o.expires_at || 0);
    if (!a) return "";
    const C = a - Math.floor(Date.now() / 1e3);
    return C <= 0 ? "token expired" : C < 3600 ? `expires in ${Math.max(1, Math.floor(C / 60))}m` : C < 86400 ? `expires in ${Math.floor(C / 3600)}h` : `expires in ${Math.floor(C / 86400)}d`;
  }
  function L(o) {
    const a = [];
    if (o.provider && a.push(o.provider), o.oauth) {
      v(o) && a.push("sign-in only");
      const C = M(o);
      C && a.push(C), Number(o.scope_count || 0) > 0 && a.push(`${o.scope_count} scope${o.scope_count === 1 ? "" : "s"}`);
    }
    return a.join(" · ");
  }
  function R(o) {
    if (u.value === o.component_id) return "Click the check again to remove this connection.";
    const a = p(o);
    return a === "expired" ? "The stored access token is expired; reconnect or wait for refresh." : a === "needs_reauth" ? `Reauthorize this connection to restore access.${o.reauth_reason ? " " + o.reauth_reason : ""}` : a === "disabled" ? "This connection is disabled and will not be used." : v(o) ? "Reauthorize this connection to grant service scopes." : o.oauth ? "OAuth connection available for agents and automations." : "Connection available for agents and automations.";
  }
  function O(o) {
    const a = l.value.trim().toLowerCase();
    return !a || o.toLowerCase().includes(a);
  }
  const I = Z(() => r.value.filter((o) => O(`${c(o)} ${o.description ?? ""} ${(o.classes ?? []).join(" ")}`))), G = Z(() => t.value.filter((o) => O(`${o.name ?? ""} ${o.provider ?? ""}`)));
  return {
    providerKey: f,
    providerLabel: c,
    providerIcon: S,
    connIcon: j,
    providerForConnection: A,
    grantedScopeSet: P,
    defaultScopeSet: T,
    availableScopeValues: y,
    hasOptionalProviderScopes: g,
    hasSignInOnlyScopes: v,
    connectionState: p,
    statusClass: k,
    statusLabel: D,
    expiryText: M,
    statusDetail: L,
    connectionDescription: R,
    filteredProviders: I,
    filteredConnections: G
  };
}
const ut = { class: "conn-page" }, pt = { class: "kx-head" }, ft = { class: "kx-head-icon" }, vt = { class: "kx-head-actions" }, _t = {
  class: "kx-search",
  role: "search"
}, ht = { class: "conn-body" }, mt = {
  key: 0,
  class: "conn-loading"
}, gt = {
  key: 1,
  class: "conn-empty au d1"
}, yt = { class: "lt-empty-hero is-danger" }, bt = { class: "e-sub" }, kt = {
  key: 0,
  class: "msg err au"
}, Ct = {
  key: 1,
  class: "block au d1"
}, St = { class: "live-grid" }, xt = { class: "lc-top" }, $t = { class: "lc-ico" }, jt = { class: "lc-top-r" }, wt = ["title", "aria-label", "onClick", "disabled"], Et = ["title", "aria-label", "onClick", "disabled"], Nt = ["title", "aria-label", "onClick", "disabled"], Pt = { class: "lc-name" }, Mt = { class: "lc-desc" }, Tt = { class: "lc-primary" }, Dt = {
  key: 0,
  class: "lc-secondary"
}, Ot = {
  key: 0,
  class: "list-foot"
}, At = ["disabled"], Lt = {
  key: 2,
  class: "conn-empty au d1"
}, Rt = { class: "lt-empty-hero is-success" }, Bt = {
  key: 3,
  class: "block au d2"
}, It = { class: "block-head" }, Ut = { class: "lt-section-header" }, Vt = { class: "setup-grid" }, Kt = ["data-provider-key", "onClick"], zt = { class: "setup-ico" }, Ht = { class: "setup-text" }, Wt = { class: "setup-name" }, Ft = { class: "setup-desc" }, Gt = {
  key: 4,
  class: "conn-empty au d1"
}, Jt = { class: "lt-empty-hero is-info" }, Yt = { class: "e-title" }, qt = {
  key: 5,
  class: "conn-empty au d2"
}, Zt = { class: "lt-empty-hero is-info" }, Qt = 100, Xt = /* @__PURE__ */ ue({
  __name: "connections",
  setup(r) {
    const t = w([]), l = w([]), u = w(!0), f = w(!1), c = w(""), S = w(""), x = w(""), j = w(""), A = dt({ providers: l, connections: t, search: j, confirmId: x }), {
      providerKey: P,
      providerLabel: T,
      providerIcon: y,
      connIcon: g,
      statusClass: v,
      statusLabel: p,
      statusDetail: k,
      connectionDescription: D,
      filteredProviders: M,
      filteredConnections: L
    } = A, R = w(0), O = w(!1), I = w(!1), G = w(void 0), o = w(void 0), a = w(!1), C = w(null), B = w(null);
    function Q(s) {
      return `/api/v1/connections?${new URLSearchParams({
        limit: String(Qt),
        offset: String(s)
      }).toString()}`;
    }
    async function ie(s) {
      const { data: e } = await W.get(Q(s));
      return e ?? { connections: [], total_count: 0, has_more: !1 };
    }
    async function K() {
      u.value = !0, c.value = "", S.value = "";
      try {
        const [s, e, n] = await Promise.all([
          ie(0),
          W.get("/api/v1/oauth/providers/discover"),
          W.get("/api/v1/connections/providers/discover")
        ]);
        t.value = s.connections ?? [], R.value = Number(s.total_count ?? t.value.length), O.value = !!s.has_more, ee(), l.value = me([
          ...e.data?.providers ?? [],
          ...n.data?.providers ?? []
        ]);
      } catch (s) {
        t.value.length ? c.value = Y(s) : S.value = Y(s), ee();
      } finally {
        u.value = !1;
      }
    }
    async function he() {
      if (!(f.value || !O.value)) {
        f.value = !0, c.value = "";
        try {
          const s = await ie(t.value.length), e = s.connections ?? [];
          t.value = [...t.value, ...e], R.value = Number(s.total_count ?? R.value), O.value = !!s.has_more, ee();
        } catch (s) {
          c.value = Y(s);
        } finally {
          f.value = !1;
        }
      }
    }
    function me(s) {
      const e = {};
      for (const n of s) {
        const _ = P(n);
        _ && (e[_] = e[_] ? { ...n, ...e[_] } : n);
      }
      return Object.values(e);
    }
    function ge(s) {
      return Array.isArray(s) ? s.filter((e) => typeof e == "string" && e.length > 0) : typeof s != "string" ? [] : s.split(/\s+/).filter(Boolean);
    }
    function ye(s, e, n = []) {
      const _ = {};
      if (typeof e.title == "string" && (_.name = e.title), typeof e.provider == "string" && (_.provider = e.provider), typeof e.icon == "string" && (_.icon = e.icon), typeof e.connection_state == "string" && (_.connection_state = e.connection_state), typeof e.reauth_reason == "string" && (_.reauth_reason = e.reauth_reason), typeof e.expires_at == "number" && (_.expires_at = e.expires_at), typeof e.refresh_expires_at == "number" && (_.refresh_expires_at = e.refresh_expires_at), typeof e.last_token_refresh == "string" && (_.last_token_refresh = e.last_token_refresh), typeof e.scopes_granted == "string") {
        const z = ge(e.scopes_granted);
        _.scopes_granted = z, _.scope_count = z.length;
      }
      typeof e.oauth_connection == "boolean" && (_.oauth = e.oauth_connection);
      const V = { ...s, ..._ };
      for (const z of n) {
        const Ee = z === "title" ? "name" : z;
        delete V[Ee];
      }
      return V;
    }
    const U = /* @__PURE__ */ new Map(), J = /* @__PURE__ */ new Set();
    let X = 0;
    function be(s, e) {
      t.value = t.value.map((n) => n.component_id === s ? ye(n, e.meta || {}, e.deleted || []) : n);
    }
    function ke() {
      X++, J.clear();
      for (const s of U.values()) s();
      U.clear();
    }
    function ee() {
      const s = new Set(t.value.map((n) => n.component_id).filter(Boolean));
      for (const [n, _] of U)
        s.has(n) || (_(), U.delete(n));
      const e = X;
      for (const n of s) {
        if (U.has(n) || J.has(n)) continue;
        J.add(n);
        const _ = lt(n, (V) => be(n, V), Oe);
        if (J.delete(n), !!_) {
          if (e !== X || !t.value.some((V) => V.component_id === n)) {
            _();
            continue;
          }
          U.set(n, _);
        }
      }
    }
    function te(s, e) {
      G.value = s, o.value = e, I.value = !0;
    }
    async function Ce(s) {
      C.value = s, a.value = !0, await Ke(), await xe();
    }
    function Se() {
      a.value = !1, C.value = null;
    }
    async function xe() {
      const s = C.value;
      if (!B.value || !s) return;
      if (B.value.innerHTML = "", !customElements.get("kickside-share"))
        try {
          await Fe("kickside-share", { timeoutMs: 8e3 });
        } catch {
        }
      const e = document.createElement("kickside-share");
      e.setAttribute("config", JSON.stringify({
        resource_id: s.component_id,
        access_url: `/api/v1/component-access/grants/${encodeURIComponent(s.component_id)}`,
        share_url: `/api/v1/component-access/share/${encodeURIComponent(s.component_id)}`,
        title: s.name || s.provider || "Connection"
      })), e.style.display = "block", e.addEventListener("close", Se), B.value.appendChild(e);
    }
    function $e(s) {
      if (!s.provider) return;
      const e = l.value.find((n) => P(n) === s.provider);
      te(s.provider, s.oauth || e?.create_ui_id ? { componentId: s.component_id, name: s.name } : void 0);
    }
    function je() {
      I.value = !1, o.value = void 0, t.value = [], K();
    }
    async function ae(s) {
      if (x.value !== s.component_id) {
        x.value = s.component_id;
        return;
      }
      x.value = "", c.value = "";
      try {
        const { data: e } = await W.delete(`/api/v1/connections/${encodeURIComponent(s.component_id)}`);
        if (!e?.success) throw new Error(e?.error || "delete failed");
        we(s.component_id, e), await K();
      } catch (e) {
        c.value = Y(e);
      }
    }
    De(K), pe(ke);
    const { acceptDeletion: we } = ct(t, (s) => s.component_id, void 0, K);
    return (s, e) => (h(), m("div", ut, [
      i("header", pt, [
        i("div", ft, [
          b(d($), {
            icon: "tabler:plug-connected",
            "aria-hidden": "true"
          })
        ]),
        e[4] || (e[4] = i("div", { class: "kx-head-text" }, [
          i("h1", { class: "kx-title" }, "Connections"),
          i("p", { class: "kx-head-sub" }, "Connect external services and manage them here.")
        ], -1)),
        i("div", vt, [
          i("label", _t, [
            b(d($), {
              icon: "tabler:search",
              class: "kx-search-ico",
              "aria-hidden": "true"
            }),
            Ie(i("input", {
              "onUpdate:modelValue": e[0] || (e[0] = (n) => j.value = n),
              class: "kx-search-input",
              type: "search",
              placeholder: "Search services",
              "aria-label": "Search services"
            }, null, 512), [
              [Ue, j.value]
            ]),
            j.value ? (h(), m("button", {
              key: 0,
              class: "kx-search-clear",
              onClick: e[1] || (e[1] = (n) => j.value = ""),
              "aria-label": "Clear search"
            }, [
              b(d($), {
                icon: "tabler:x",
                "aria-hidden": "true"
              })
            ])) : N("", !0)
          ]),
          b(d(re), {
            label: "Connect app",
            onClick: e[2] || (e[2] = (n) => te())
          }, {
            icon: le(() => [
              b(d($), {
                icon: "tabler:plus",
                "aria-hidden": "true"
              })
            ]),
            _: 1
          })
        ])
      ]),
      i("div", ht, [
        u.value && !t.value.length ? (h(), m("div", mt, "Loading…")) : S.value ? (h(), m("section", gt, [
          i("div", yt, [
            b(d($), { icon: "tabler:plug-x" })
          ]),
          e[5] || (e[5] = i("div", { class: "e-title" }, "Couldn't load connections", -1)),
          i("div", bt, E(S.value), 1),
          b(d(re), {
            label: "Try again",
            class: "conn-retry",
            onClick: K
          }, {
            icon: le(() => [
              b(d($), {
                icon: "tabler:refresh",
                "aria-hidden": "true"
              })
            ]),
            _: 1
          })
        ])) : (h(), m(F, { key: 2 }, [
          c.value ? (h(), m("div", kt, [
            b(d($), { icon: "tabler:alert-circle" }),
            se(E(c.value), 1)
          ])) : N("", !0),
          d(L).length ? (h(), m("section", Ct, [
            e[8] || (e[8] = i("div", { class: "block-head" }, [
              i("h2", { class: "lt-section-header" }, "Your connections")
            ], -1)),
            i("div", St, [
              (h(!0), m(F, null, ce(d(L), (n) => (h(), m("div", {
                key: n.component_id,
                class: q(["live-card s-live", `state-${d(v)(n)}`])
              }, [
                b(ot, {
                  state: n,
                  onRetry: (_) => {
                    x.value = n.component_id, ae(n);
                  }
                }, null, 8, ["state", "onRetry"]),
                i("div", xt, [
                  i("div", $t, [
                    b(d($), {
                      icon: d(g)(n),
                      "aria-hidden": "true"
                    }, null, 8, ["icon"])
                  ]),
                  i("div", jt, [
                    i("button", {
                      class: "lc-add",
                      title: `Share ${n.name || n.provider}`,
                      "aria-label": `Share ${n.name || n.provider}`,
                      onClick: (_) => Ce(n),
                      disabled: !!n.deleting_at
                    }, [
                      b(d($), { icon: "tabler:share" })
                    ], 8, wt),
                    i("button", {
                      class: "lc-add",
                      title: `Reconnect ${n.name || n.provider}`,
                      "aria-label": `Reconnect ${n.name || n.provider}`,
                      onClick: (_) => $e(n),
                      disabled: !!n.deleting_at
                    }, [
                      b(d($), { icon: "tabler:refresh" })
                    ], 8, Et),
                    i("button", {
                      class: q(["lc-add lc-danger", x.value === n.component_id && "armed"]),
                      title: x.value === n.component_id ? "Click again to remove" : `Remove ${n.name || n.provider}`,
                      "aria-label": `Remove ${n.name || n.provider}`,
                      onClick: (_) => ae(n),
                      disabled: !!n.deleting_at
                    }, [
                      b(d($), {
                        icon: x.value === n.component_id ? "tabler:check" : "tabler:trash"
                      }, null, 8, ["icon"])
                    ], 10, Nt)
                  ])
                ]),
                i("div", Pt, E(n.name || n.provider || "Connection"), 1),
                i("div", Mt, E(d(D)(n)), 1),
                i("div", {
                  class: q(["lc-status", `state-${d(v)(n)}`])
                }, [
                  e[6] || (e[6] = i("span", { class: "dot" }, null, -1)),
                  i("span", Tt, E(d(p)(n)), 1),
                  d(k)(n) ? (h(), m("span", Dt, "· " + E(d(k)(n)), 1)) : N("", !0)
                ], 2)
              ], 2))), 128))
            ]),
            R.value || O.value ? (h(), m("div", Ot, [
              i("span", null, E(t.value.length) + " of " + E(R.value || t.value.length) + " loaded", 1),
              O.value ? (h(), m("button", {
                key: 0,
                class: "ghost-action",
                disabled: f.value,
                onClick: he
              }, [
                b(d($), {
                  icon: f.value ? "tabler:loader-2" : "tabler:chevron-down",
                  class: q(f.value && "spin")
                }, null, 8, ["icon", "class"]),
                e[7] || (e[7] = se(" Load more ", -1))
              ], 8, At)) : N("", !0)
            ])) : N("", !0)
          ])) : !j.value && l.value.length ? (h(), m("section", Lt, [
            i("div", Rt, [
              b(d($), { icon: "tabler:plug-connected" })
            ]),
            e[9] || (e[9] = i("div", { class: "e-title" }, "Connect your first app", -1)),
            e[10] || (e[10] = i("div", { class: "e-sub" }, "Pick a service below — your agents and automations will read events and act through it.", -1))
          ])) : N("", !0),
          d(M).length ? (h(), m("section", Bt, [
            i("div", It, [
              i("h2", Ut, E(d(L).length ? "Add another" : "Available services"), 1)
            ]),
            i("div", Vt, [
              (h(!0), m(F, null, ce(d(M), (n) => (h(), m("button", {
                key: d(P)(n),
                "data-provider-key": d(P)(n),
                class: "setup-card",
                onClick: (_) => te(d(P)(n))
              }, [
                i("div", zt, [
                  b(d($), {
                    icon: d(y)(n),
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                i("div", Ht, [
                  i("div", Wt, E(d(T)(n)), 1),
                  i("div", Ft, E(n.description || `Set up ${d(T)(n)}`), 1)
                ]),
                b(d($), {
                  icon: "tabler:arrow-right",
                  class: "setup-arrow",
                  "aria-hidden": "true"
                })
              ], 8, Kt))), 128))
            ])
          ])) : j.value ? (h(), m("section", Gt, [
            i("div", Jt, [
              b(d($), { icon: "tabler:search-off" })
            ]),
            i("div", Yt, "No services match “" + E(j.value) + "”", 1)
          ])) : !l.value.length && !t.value.length ? (h(), m("section", qt, [
            i("div", Zt, [
              b(d($), { icon: "tabler:plug-x" })
            ]),
            e[11] || (e[11] = i("div", { class: "e-title" }, "No providers available", -1)),
            e[12] || (e[12] = i("div", { class: "e-sub" }, "Install a provider module to add a connection here.", -1))
          ])) : N("", !0)
        ], 64))
      ]),
      I.value ? (h(), Ve(He, {
        key: 0,
        providers: l.value,
        provider: G.value,
        reauth: o.value,
        onClose: e[3] || (e[3] = (n) => I.value = !1),
        onConnected: je
      }, null, 8, ["providers", "provider", "reauth"])) : N("", !0),
      a.value ? (h(), m("div", {
        key: 1,
        ref_key: "shareHost",
        ref: B
      }, null, 512)) : N("", !0)
    ]));
  }
}), en = { props: { type: "object", properties: {} } }, tn = {
  wippy: en
};
class nn extends Ae {
  static get wippyConfig() {
    return {
      propsSchema: tn.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: Le
    };
  }
  static get vueConfig() {
    return { rootComponent: Xt, plugins: [Re] };
  }
}
Ge(import.meta.url, nn);
//# sourceMappingURL=index.js.map
