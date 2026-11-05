import { B as Ne, C as Pe, c as Me, r as De, d as Te, b as J, e as Oe, W as Ae, s as Le, P as Re } from "./styles-tpVissSe.js";
import { openBlock as h, createElementBlock as g, mergeProps as ne, createElementVNode as i, defineComponent as ue, computed as q, withModifiers as oe, Fragment as H, createTextVNode as se, toDisplayString as E, createCommentVNode as P, createVNode as k, unref as c, watch as Be, onBeforeUnmount as pe, ref as $, withDirectives as Ie, vModelText as Ue, withCtx as le, renderList as ce, normalizeClass as Y, createBlock as Ve, nextTick as Ke } from "vue";
import { s as ze, a as re, _ as He } from "./ConnectionPicker.vue_vue_type_script_setup_true_lang-RKLMj11t.js";
import { on as fe, api as z, host as We, loadByTagName as Fe, define as Ge } from "@wippy-fe/proxy";
import { Icon as x } from "@iconify/vue";
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
function Xe(r, n, l, d, p, u) {
  return h(), g("div", ne({
    class: r.cx("root"),
    role: "progressbar"
  }, r.ptmi("root")), [(h(), g("svg", ne({
    class: r.cx("spin"),
    viewBox: "25 25 50 50",
    style: u.svgStyle
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
    const n = r, l = q(() => n.state.deletion_job === null || ["dead", "cancelled"].includes(n.state.deletion_job?.status || ""));
    return (d, p) => r.state.deleting_at ? (h(), g("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: p[1] || (p[1] = oe(() => {
      }, ["stop"])),
      onKeydown: p[2] || (p[2] = oe(() => {
      }, ["stop"]))
    }, [
      l.value ? (h(), g(H, { key: 0 }, [
        i("span", null, [
          p[3] || (p[3] = se("Deletion failed", -1)),
          r.state.deletion_job?.last_error ? (h(), g("span", et, ": " + E(r.state.deletion_job.last_error), 1)) : P("", !0)
        ]),
        k(c(re), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: p[0] || (p[0] = oe((u) => d.$emit("retry"), ["stop"]))
        })
      ], 64)) : (h(), g(H, { key: 1 }, [
        k(c(ve), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        p[4] || (p[4] = i("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : P("", !0);
  }
}), nt = (r, n) => {
  const l = r.__vccOpts || r;
  for (const [d, p] of n)
    l[d] = p;
  return l;
}, ot = /* @__PURE__ */ nt(tt, [["__scopeId", "data-v-69a579d4"]]);
function K(r) {
  return !!r && typeof r == "object" && !Array.isArray(r);
}
function st(r, n) {
  if (n == null) return n;
  switch (r) {
    case "boolean":
    case "checkbox":
      return typeof n == "boolean" ? n : n === "true" ? !0 : n === "false" ? !1 : n;
    case "number":
    case "integer": {
      if (typeof n == "number") return n;
      if (typeof n == "string" && n.trim() !== "") {
        const l = Number(n);
        if (!Number.isNaN(l)) return l;
      }
      return n;
    }
    case "object":
    case "array":
      if (typeof n == "string")
        try {
          const l = JSON.parse(n);
          if (l && typeof l == "object") return l;
        } catch {
        }
      return n;
    default:
      return n;
  }
}
function rt(r, n) {
  if (!n) return r;
  const l = {};
  for (const [d, p] of Object.entries(r))
    l[d] = st(n[d], p);
  return l;
}
function he(r, n, l) {
  if (n !== void 0 && !n) return null;
  const d = K(r) ? r : {}, p = [
    d,
    K(d.data) ? d.data : null,
    K(d.payload) ? d.payload : null,
    K(d.detail) ? d.detail : null
  ].filter(Boolean);
  for (const u of p) {
    if (u.event !== "component.meta.changed" && u.event !== "component.deleting" && u.event !== "component.deleted") continue;
    const w = String(u.component_id || ""), S = String(d.topic || u.topic || "");
    if (n === void 0) {
      if (!w && (!S.startsWith("component.") || S === "component.")) continue;
    } else if (w && w !== n || !w && S !== `component.${n}`) continue;
    const j = w || n || S.slice(10);
    return u.event !== "component.meta.changed" ? { event: u.event, component_id: j } : {
      event: "component.meta.changed",
      component_id: j,
      meta: rt(K(u.meta) ? u.meta : {}, l),
      deleted: Array.isArray(u.deleted) ? u.deleted.map(String) : []
    };
  }
  return null;
}
function it(r, n, l) {
  const d = he(r, n, l);
  return d?.event === "component.meta.changed" ? d : null;
}
function at(r, n) {
  const l = he(r, n);
  return l && l.event !== "component.meta.changed" ? l : null;
}
function lt(r, n, l) {
  if (!r) return null;
  const d = fe(`component.${r}`, (p) => {
    const u = it(p, r, l);
    u && n(u);
  });
  return typeof d == "function" ? d : null;
}
function de(r, n) {
  if (r && typeof r == "object") {
    const l = r, d = l.response?.data?.error;
    if (typeof d == "string") return d;
    if (d && typeof d == "object" && typeof d.message == "string")
      return d.message;
    if (typeof l.message == "string" && l.message) return l.message;
  }
  return n;
}
function ct(r, n, l) {
  let d = !0;
  const p = /* @__PURE__ */ new Set(), u = /* @__PURE__ */ new Map();
  function w(_, y) {
    const b = r.value.find((N) => n(N) === _), f = u.get(_), m = {
      deleting_at: f?.deleting_at || b?.deleting_at || (/* @__PURE__ */ new Date()).toISOString(),
      deletion_job_id: y?.job_id || f?.deletion_job_id || b?.deletion_job_id
    };
    u.set(_, m), b && (Object.assign(b, m), b.deletion_job = void 0);
  }
  async function S(_) {
    const y = n(_), b = u.get(y), f = () => d && r.value.includes(_) && u.get(y) === b;
    try {
      const { data: m } = await z.get(`/api/v1/components/${encodeURIComponent(y)}`);
      if (!m?.success) throw new Error(de(m, "Could not read deletion progress"));
      f() && (_.deleting_at = b?.deleting_at || m.deleting_at, _.deletion_job_id = m.deletion_job_id, b && (b.deletion_job_id = _.deletion_job_id), _.deletion_job = m.deletion_job ?? null);
    } catch (m) {
      f() && We.handleError("other", { message: de(m, "Could not read deletion progress") });
    }
  }
  const j = Be(() => r.value, (_, y = []) => {
    const b = _.filter((f) => !p.has(n(f)));
    for (const f of y) !p.has(n(f)) && b.some((m) => n(m) === n(f));
    if (b.length !== _.length) {
      r.value = b;
      return;
    }
    for (const f of _) {
      const m = u.get(n(f));
      m && (f.deletion_job_id !== m.deletion_job_id && (f.deletion_job = void 0), Object.assign(f, m));
      const N = y.find((A) => n(A) === n(f));
      f.deletion_job === void 0 && N?.deletion_job_id === f.deletion_job_id && (f.deletion_job = N?.deletion_job), f.deleting_at && S(f);
    }
  }, { immediate: !0 }), D = fe("@message", (_) => {
    const y = at(_);
    if (!y) return;
    const b = r.value.find((f) => n(f) === y.component_id);
    y.event === "component.deleted" ? (b && p.has(y.component_id), p.add(y.component_id), u.delete(y.component_id), r.value = r.value.filter((f) => n(f) !== y.component_id)) : b && (w(y.component_id), S(b));
  });
  return pe(() => {
    d = !1, j(), typeof D == "function" && D();
  }), { acceptDeletion: w };
}
function dt({ providers: r, connections: n, search: l, confirmId: d }) {
  const p = (o) => o.provider ?? "", u = (o) => o.title ?? o.name ?? o.oauth_provider ?? "Provider", w = (o) => o.icon || "tabler:plug", S = q(() => {
    const o = {};
    for (const a of r.value) {
      const C = p(a);
      C && (o[C] = a);
    }
    return o;
  });
  function j(o) {
    return o.icon || S.value[o.provider || ""]?.icon || "tabler:plug-connected";
  }
  function D(o) {
    return o.provider ? S.value[o.provider] : void 0;
  }
  function _(o) {
    return new Set((o.scopes_granted ?? []).filter((a) => typeof a == "string" && a.length > 0));
  }
  function y(o) {
    return new Set((o?.default_scopes ?? []).filter((a) => typeof a == "string" && a.length > 0));
  }
  function b(o) {
    return (o?.available_scopes ?? []).map((a) => a.scope).filter((a) => typeof a == "string" && a.length > 0);
  }
  function f(o) {
    const a = y(o);
    return b(o).some((C) => !a.has(C));
  }
  function m(o) {
    if (!o.oauth) return !1;
    const a = D(o);
    if (!f(a)) return !1;
    const C = _(o), O = y(a);
    if (C.size === 0 || O.size === 0) return !1;
    for (const Q of C)
      if (!O.has(Q)) return !1;
    return !0;
  }
  function N(o) {
    return De(o.connection_state, o.expires_at);
  }
  function A(o) {
    const a = N(o);
    return a === "connected" && m(o) ? "warn" : Me[a];
  }
  function Z(o) {
    const a = N(o);
    return a === "connected" && m(o) ? "Limited access" : Pe[a];
  }
  function I(o) {
    const a = Number(o.expires_at || 0);
    if (!a) return "";
    const C = a - Math.floor(Date.now() / 1e3);
    return C <= 0 ? "token expired" : C < 3600 ? `expires in ${Math.max(1, Math.floor(C / 60))}m` : C < 86400 ? `expires in ${Math.floor(C / 3600)}h` : `expires in ${Math.floor(C / 86400)}d`;
  }
  function U(o) {
    const a = [];
    if (o.provider && a.push(o.provider), o.oauth) {
      m(o) && a.push("sign-in only");
      const C = I(o);
      C && a.push(C), Number(o.scope_count || 0) > 0 && a.push(`${o.scope_count} scope${o.scope_count === 1 ? "" : "s"}`);
    }
    return a.join(" · ");
  }
  function T(o) {
    if (d.value === o.component_id) return "Click the check again to remove this connection.";
    const a = N(o);
    return a === "expired" ? "The stored access token is expired; reconnect or wait for refresh." : a === "needs_reauth" ? `Reauthorize this connection to restore access.${o.reauth_reason ? " " + o.reauth_reason : ""}` : a === "disabled" ? "This connection is disabled and will not be used." : m(o) ? "Reauthorize this connection to grant service scopes." : o.oauth ? "OAuth connection available for agents and automations." : "Connection available for agents and automations.";
  }
  function M(o) {
    const a = l.value.trim().toLowerCase();
    return !a || o.toLowerCase().includes(a);
  }
  const L = q(() => r.value.filter((o) => M(`${u(o)} ${o.description ?? ""} ${(o.classes ?? []).join(" ")}`))), W = q(() => n.value.filter((o) => M(`${o.name ?? ""} ${o.provider ?? ""}`)));
  return {
    providerKey: p,
    providerLabel: u,
    providerIcon: w,
    connIcon: j,
    providerForConnection: D,
    grantedScopeSet: _,
    defaultScopeSet: y,
    availableScopeValues: b,
    hasOptionalProviderScopes: f,
    hasSignInOnlyScopes: m,
    connectionState: N,
    statusClass: A,
    statusLabel: Z,
    expiryText: I,
    statusDetail: U,
    connectionDescription: T,
    filteredProviders: L,
    filteredConnections: W
  };
}
const ut = { class: "conn-page" }, pt = { class: "kx-head" }, ft = { class: "kx-head-icon" }, vt = { class: "kx-head-actions" }, ht = {
  class: "kx-search",
  role: "search"
}, _t = { class: "conn-body" }, mt = {
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
}, St = { class: "live-grid" }, xt = { class: "lc-top" }, $t = { class: "lc-ico" }, wt = { class: "lc-top-r" }, jt = ["title", "aria-label", "onClick", "disabled"], Et = ["title", "aria-label", "onClick", "disabled"], Nt = ["title", "aria-label", "onClick", "disabled"], Pt = { class: "lc-name" }, Mt = { class: "lc-desc" }, Dt = { class: "lc-primary" }, Tt = {
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
    const n = $([]), l = $([]), d = $(!0), p = $(!1), u = $(""), w = $(""), S = $(""), j = $(""), D = dt({ providers: l, connections: n, search: j, confirmId: S }), {
      providerKey: _,
      providerLabel: y,
      providerIcon: b,
      connIcon: f,
      statusClass: m,
      statusLabel: N,
      statusDetail: A,
      connectionDescription: Z,
      filteredProviders: I,
      filteredConnections: U
    } = D, T = $(0), M = $(!1), L = $(!1), W = $(void 0), o = $(void 0), a = $(!1), C = $(null), O = $(null);
    function Q(s) {
      return `/api/v1/connections?${new URLSearchParams({
        limit: String(Qt),
        offset: String(s)
      }).toString()}`;
    }
    async function ie(s) {
      const { data: e } = await z.get(Q(s));
      return e ?? { connections: [], total_count: 0, has_more: !1 };
    }
    async function F() {
      d.value = !0, u.value = "", w.value = "";
      try {
        const [s, e, t] = await Promise.all([
          ie(0),
          z.get("/api/v1/oauth/providers/discover"),
          z.get("/api/v1/connections/providers/discover")
        ]);
        n.value = s.connections ?? [], T.value = Number(s.total_count ?? n.value.length), M.value = !!s.has_more, ee(), l.value = me([
          ...e.data?.providers ?? [],
          ...t.data?.providers ?? []
        ]);
      } catch (s) {
        n.value.length ? u.value = J(s) : w.value = J(s), ee();
      } finally {
        d.value = !1;
      }
    }
    async function _e() {
      if (!(p.value || !M.value)) {
        p.value = !0, u.value = "";
        try {
          const s = await ie(n.value.length), e = s.connections ?? [];
          n.value = [...n.value, ...e], T.value = Number(s.total_count ?? T.value), M.value = !!s.has_more, ee();
        } catch (s) {
          u.value = J(s);
        } finally {
          p.value = !1;
        }
      }
    }
    function me(s) {
      const e = {};
      for (const t of s) {
        const v = _(t);
        v && (e[v] = e[v] ? { ...t, ...e[v] } : t);
      }
      return Object.values(e);
    }
    function ge(s) {
      return Array.isArray(s) ? s.filter((e) => typeof e == "string" && e.length > 0) : typeof s != "string" ? [] : s.split(/\s+/).filter(Boolean);
    }
    function ye(s, e, t = []) {
      const v = {};
      if (typeof e.title == "string" && (v.name = e.title), typeof e.provider == "string" && (v.provider = e.provider), typeof e.icon == "string" && (v.icon = e.icon), typeof e.connection_state == "string" && (v.connection_state = e.connection_state), typeof e.reauth_reason == "string" && (v.reauth_reason = e.reauth_reason), typeof e.expires_at == "number" && (v.expires_at = e.expires_at), typeof e.refresh_expires_at == "number" && (v.refresh_expires_at = e.refresh_expires_at), typeof e.last_token_refresh == "string" && (v.last_token_refresh = e.last_token_refresh), typeof e.scopes_granted == "string") {
        const V = ge(e.scopes_granted);
        v.scopes_granted = V, v.scope_count = V.length;
      }
      typeof e.oauth_connection == "boolean" && (v.oauth = e.oauth_connection);
      const B = { ...s, ...v };
      for (const V of t) {
        const Ee = V === "title" ? "name" : V;
        delete B[Ee];
      }
      return B;
    }
    const R = /* @__PURE__ */ new Map(), G = /* @__PURE__ */ new Set();
    let X = 0;
    function be(s, e) {
      n.value = n.value.map((t) => t.component_id === s ? ye(t, e.meta || {}, e.deleted || []) : t);
    }
    function ke() {
      X++, G.clear();
      for (const s of R.values()) s();
      R.clear();
    }
    function ee() {
      const s = new Set(n.value.map((t) => t.component_id).filter(Boolean));
      for (const [t, v] of R)
        s.has(t) || (v(), R.delete(t));
      const e = X;
      for (const t of s) {
        if (R.has(t) || G.has(t)) continue;
        G.add(t);
        const v = lt(t, (B) => be(t, B), Oe);
        if (G.delete(t), !!v) {
          if (e !== X || !n.value.some((B) => B.component_id === t)) {
            v();
            continue;
          }
          R.set(t, v);
        }
      }
    }
    function te(s, e) {
      W.value = s, o.value = e, L.value = !0;
    }
    async function Ce(s) {
      C.value = s, a.value = !0, await Ke(), await xe();
    }
    function Se() {
      a.value = !1, C.value = null;
    }
    async function xe() {
      const s = C.value;
      if (!O.value || !s) return;
      if (O.value.innerHTML = "", !customElements.get("kickside-share"))
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
      })), e.style.display = "block", e.addEventListener("close", Se), O.value.appendChild(e);
    }
    function $e(s) {
      if (!s.provider) return;
      const e = l.value.find((t) => _(t) === s.provider);
      te(s.provider, s.oauth || e?.create_ui_id ? { componentId: s.component_id, name: s.name } : void 0);
    }
    function we() {
      L.value = !1, o.value = void 0, n.value = [], F();
    }
    async function ae(s) {
      if (S.value !== s.component_id) {
        S.value = s.component_id;
        return;
      }
      S.value = "", u.value = "";
      try {
        const { data: e } = await z.delete(`/api/v1/connections/${encodeURIComponent(s.component_id)}`);
        if (!e?.success) throw new Error(e?.error || "delete failed");
        je(s.component_id, e), await F();
      } catch (e) {
        u.value = J(e);
      }
    }
    Te(F), pe(ke);
    const { acceptDeletion: je } = ct(n, (s) => s.component_id);
    return (s, e) => (h(), g("div", ut, [
      i("header", pt, [
        i("div", ft, [
          k(c(x), {
            icon: "tabler:plug-connected",
            "aria-hidden": "true"
          })
        ]),
        e[4] || (e[4] = i("div", { class: "kx-head-text" }, [
          i("h1", { class: "kx-title" }, "Connections"),
          i("p", { class: "kx-head-sub" }, "Connect external services and manage them here.")
        ], -1)),
        i("div", vt, [
          i("label", ht, [
            k(c(x), {
              icon: "tabler:search",
              class: "kx-search-ico",
              "aria-hidden": "true"
            }),
            Ie(i("input", {
              "onUpdate:modelValue": e[0] || (e[0] = (t) => j.value = t),
              class: "kx-search-input",
              type: "search",
              placeholder: "Search services",
              "aria-label": "Search services"
            }, null, 512), [
              [Ue, j.value]
            ]),
            j.value ? (h(), g("button", {
              key: 0,
              class: "kx-search-clear",
              onClick: e[1] || (e[1] = (t) => j.value = ""),
              "aria-label": "Clear search"
            }, [
              k(c(x), {
                icon: "tabler:x",
                "aria-hidden": "true"
              })
            ])) : P("", !0)
          ]),
          k(c(re), {
            label: "Connect app",
            onClick: e[2] || (e[2] = (t) => te())
          }, {
            icon: le(() => [
              k(c(x), {
                icon: "tabler:plus",
                "aria-hidden": "true"
              })
            ]),
            _: 1
          })
        ])
      ]),
      i("div", _t, [
        d.value && !n.value.length ? (h(), g("div", mt, "Loading…")) : w.value ? (h(), g("section", gt, [
          i("div", yt, [
            k(c(x), { icon: "tabler:plug-x" })
          ]),
          e[5] || (e[5] = i("div", { class: "e-title" }, "Couldn't load connections", -1)),
          i("div", bt, E(w.value), 1),
          k(c(re), {
            label: "Try again",
            class: "conn-retry",
            onClick: F
          }, {
            icon: le(() => [
              k(c(x), {
                icon: "tabler:refresh",
                "aria-hidden": "true"
              })
            ]),
            _: 1
          })
        ])) : (h(), g(H, { key: 2 }, [
          u.value ? (h(), g("div", kt, [
            k(c(x), { icon: "tabler:alert-circle" }),
            se(E(u.value), 1)
          ])) : P("", !0),
          c(U).length ? (h(), g("section", Ct, [
            e[8] || (e[8] = i("div", { class: "block-head" }, [
              i("h2", { class: "lt-section-header" }, "Your connections")
            ], -1)),
            i("div", St, [
              (h(!0), g(H, null, ce(c(U), (t) => (h(), g("div", {
                key: t.component_id,
                class: Y(["live-card s-live", `state-${c(m)(t)}`])
              }, [
                k(ot, {
                  state: t,
                  onRetry: (v) => {
                    S.value = t.component_id, ae(t);
                  }
                }, null, 8, ["state", "onRetry"]),
                i("div", xt, [
                  i("div", $t, [
                    k(c(x), {
                      icon: c(f)(t),
                      "aria-hidden": "true"
                    }, null, 8, ["icon"])
                  ]),
                  i("div", wt, [
                    i("button", {
                      class: "lc-add",
                      title: `Share ${t.name || t.provider}`,
                      "aria-label": `Share ${t.name || t.provider}`,
                      onClick: (v) => Ce(t),
                      disabled: !!t.deleting_at
                    }, [
                      k(c(x), { icon: "tabler:share" })
                    ], 8, jt),
                    i("button", {
                      class: "lc-add",
                      title: `Reconnect ${t.name || t.provider}`,
                      "aria-label": `Reconnect ${t.name || t.provider}`,
                      onClick: (v) => $e(t),
                      disabled: !!t.deleting_at
                    }, [
                      k(c(x), { icon: "tabler:refresh" })
                    ], 8, Et),
                    i("button", {
                      class: Y(["lc-add lc-danger", S.value === t.component_id && "armed"]),
                      title: S.value === t.component_id ? "Click again to remove" : `Remove ${t.name || t.provider}`,
                      "aria-label": `Remove ${t.name || t.provider}`,
                      onClick: (v) => ae(t),
                      disabled: !!t.deleting_at
                    }, [
                      k(c(x), {
                        icon: S.value === t.component_id ? "tabler:check" : "tabler:trash"
                      }, null, 8, ["icon"])
                    ], 10, Nt)
                  ])
                ]),
                i("div", Pt, E(t.name || t.provider || "Connection"), 1),
                i("div", Mt, E(c(Z)(t)), 1),
                i("div", {
                  class: Y(["lc-status", `state-${c(m)(t)}`])
                }, [
                  e[6] || (e[6] = i("span", { class: "dot" }, null, -1)),
                  i("span", Dt, E(c(N)(t)), 1),
                  c(A)(t) ? (h(), g("span", Tt, "· " + E(c(A)(t)), 1)) : P("", !0)
                ], 2)
              ], 2))), 128))
            ]),
            T.value || M.value ? (h(), g("div", Ot, [
              i("span", null, E(n.value.length) + " of " + E(T.value || n.value.length) + " loaded", 1),
              M.value ? (h(), g("button", {
                key: 0,
                class: "ghost-action",
                disabled: p.value,
                onClick: _e
              }, [
                k(c(x), {
                  icon: p.value ? "tabler:loader-2" : "tabler:chevron-down",
                  class: Y(p.value && "spin")
                }, null, 8, ["icon", "class"]),
                e[7] || (e[7] = se(" Load more ", -1))
              ], 8, At)) : P("", !0)
            ])) : P("", !0)
          ])) : !j.value && l.value.length ? (h(), g("section", Lt, [
            i("div", Rt, [
              k(c(x), { icon: "tabler:plug-connected" })
            ]),
            e[9] || (e[9] = i("div", { class: "e-title" }, "Connect your first app", -1)),
            e[10] || (e[10] = i("div", { class: "e-sub" }, "Pick a service below — your agents and automations will read events and act through it.", -1))
          ])) : P("", !0),
          c(I).length ? (h(), g("section", Bt, [
            i("div", It, [
              i("h2", Ut, E(c(U).length ? "Add another" : "Available services"), 1)
            ]),
            i("div", Vt, [
              (h(!0), g(H, null, ce(c(I), (t) => (h(), g("button", {
                key: c(_)(t),
                "data-provider-key": c(_)(t),
                class: "setup-card",
                onClick: (v) => te(c(_)(t))
              }, [
                i("div", zt, [
                  k(c(x), {
                    icon: c(b)(t),
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                i("div", Ht, [
                  i("div", Wt, E(c(y)(t)), 1),
                  i("div", Ft, E(t.description || `Set up ${c(y)(t)}`), 1)
                ]),
                k(c(x), {
                  icon: "tabler:arrow-right",
                  class: "setup-arrow",
                  "aria-hidden": "true"
                })
              ], 8, Kt))), 128))
            ])
          ])) : j.value ? (h(), g("section", Gt, [
            i("div", Jt, [
              k(c(x), { icon: "tabler:search-off" })
            ]),
            i("div", Yt, "No services match “" + E(j.value) + "”", 1)
          ])) : !l.value.length && !n.value.length ? (h(), g("section", qt, [
            i("div", Zt, [
              k(c(x), { icon: "tabler:plug-x" })
            ]),
            e[11] || (e[11] = i("div", { class: "e-title" }, "No providers available", -1)),
            e[12] || (e[12] = i("div", { class: "e-sub" }, "Install a provider module to add a connection here.", -1))
          ])) : P("", !0)
        ], 64))
      ]),
      L.value ? (h(), Ve(He, {
        key: 0,
        providers: l.value,
        provider: W.value,
        reauth: o.value,
        onClose: e[3] || (e[3] = (t) => L.value = !1),
        onConnected: we
      }, null, 8, ["providers", "provider", "reauth"])) : P("", !0),
      a.value ? (h(), g("div", {
        key: 1,
        ref_key: "shareHost",
        ref: O
      }, null, 512)) : P("", !0)
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
