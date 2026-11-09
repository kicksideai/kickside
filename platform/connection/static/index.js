import { B as Ne, C as Pe, c as Me, r as Te, d as Oe, b as G, e as De, W as Le, s as Ae, P as Re } from "./styles-Bx2Y_Hv8.js";
import { openBlock as h, createElementBlock as m, mergeProps as ne, createElementVNode as r, defineComponent as ue, computed as Z, withModifiers as oe, Fragment as W, createTextVNode as se, toDisplayString as P, createCommentVNode as M, createVNode as y, unref as c, watch as Be, onBeforeUnmount as pe, ref as w, withDirectives as Ie, vModelText as Ve, withCtx as ce, renderList as de, normalizeClass as J, createBlock as Ue, nextTick as Ke } from "vue";
import { s as ze, a as ie, _ as He } from "./ConnectionPicker.vue_vue_type_script_setup_true_lang-BySRXbJq.js";
import { on as fe, api as Y, loadByTagName as We, define as qe } from "@wippy-fe/proxy";
import { Icon as $ } from "@iconify/vue";
var Fe = `
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
`, Ge = {
  root: "p-progressspinner",
  spin: "p-progressspinner-spin",
  circle: "p-progressspinner-circle"
}, Je = Ne.extend({
  name: "progressspinner",
  style: Fe,
  classes: Ge
}), Ye = {
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
  style: Je,
  provide: function() {
    return {
      $pcProgressSpinner: this,
      $parentInstance: this
    };
  }
}, ve = {
  name: "ProgressSpinner",
  extends: Ye,
  inheritAttrs: !1,
  computed: {
    svgStyle: function() {
      return {
        "animation-duration": this.animationDuration
      };
    }
  }
}, Ze = ["fill", "stroke-width"];
function Qe(i, n, p, f, u, l) {
  return h(), m("div", ne({
    class: i.cx("root"),
    role: "progressbar"
  }, i.ptmi("root")), [(h(), m("svg", ne({
    class: i.cx("spin"),
    viewBox: "25 25 50 50",
    style: l.svgStyle
  }, i.ptm("spin")), [r("circle", ne({
    class: i.cx("circle"),
    cx: "50",
    cy: "50",
    r: "20",
    fill: i.fill,
    "stroke-width": i.strokeWidth,
    strokeMiterlimit: "10"
  }, i.ptm("circle")), null, 16, Ze)], 16))], 16);
}
ve.render = Qe;
const Xe = { key: 0 }, et = /* @__PURE__ */ ue({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(i) {
    const n = i, p = Z(() => n.state.deletion_job === null || ["dead", "cancelled"].includes(n.state.deletion_job?.status || ""));
    return (f, u) => i.state.deleting_at ? (h(), m("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: u[1] || (u[1] = oe(() => {
      }, ["stop"])),
      onKeydown: u[2] || (u[2] = oe(() => {
      }, ["stop"]))
    }, [
      p.value ? (h(), m(W, { key: 0 }, [
        r("span", null, [
          u[3] || (u[3] = se("Deletion failed", -1)),
          i.state.deletion_job?.last_error ? (h(), m("span", Xe, ": " + P(i.state.deletion_job.last_error), 1)) : M("", !0)
        ]),
        y(c(ie), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: u[0] || (u[0] = oe((l) => f.$emit("retry"), ["stop"]))
        })
      ], 64)) : (h(), m(W, { key: 1 }, [
        y(c(ve), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        u[4] || (u[4] = r("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : M("", !0);
  }
});
function H(i) {
  return !!i && typeof i == "object" && !Array.isArray(i);
}
function tt(i, n) {
  if (n == null) return n;
  switch (i) {
    case "boolean":
    case "checkbox":
      return typeof n == "boolean" ? n : n === "true" ? !0 : n === "false" ? !1 : n;
    case "number":
    case "integer": {
      if (typeof n == "number") return n;
      if (typeof n == "string" && n.trim() !== "") {
        const p = Number(n);
        if (!Number.isNaN(p)) return p;
      }
      return n;
    }
    case "object":
    case "array":
      if (typeof n == "string")
        try {
          const p = JSON.parse(n);
          if (p && typeof p == "object") return p;
        } catch {
        }
      return n;
    default:
      return n;
  }
}
function nt(i, n) {
  if (!n) return i;
  const p = {};
  for (const [f, u] of Object.entries(i))
    p[f] = tt(n[f], u);
  return p;
}
function he(i, n, p) {
  if (n !== void 0 && !n) return null;
  const f = H(i) ? i : {}, u = [
    f,
    H(f.data) ? f.data : null,
    H(f.payload) ? f.payload : null,
    H(f.detail) ? f.detail : null
  ].filter(Boolean);
  for (const l of u) {
    if (l.event !== "component.meta.changed" && l.event !== "component.deleting" && l.event !== "component.deleted") continue;
    const j = String(l.component_id || ""), C = String(f.topic || l.topic || "");
    if (n === void 0) {
      if (!j && (!C.startsWith("component.") || C === "component.")) continue;
    } else if (j && j !== n || !j && C !== `component.${n}`) continue;
    const S = j || n || C.slice(10);
    return l.event === "component.deleting" && typeof l.deletion_job_id == "string" && l.deletion_job_id ? { event: l.event, component_id: S, deletion_job_id: l.deletion_job_id } : l.event !== "component.meta.changed" ? { event: l.event, component_id: S } : {
      event: "component.meta.changed",
      component_id: S,
      meta: nt(H(l.meta) ? l.meta : {}, p),
      deleted: Array.isArray(l.deleted) ? l.deleted.map(String) : []
    };
  }
  return null;
}
function ot(i, n, p) {
  const f = he(i, n, p);
  return f?.event === "component.meta.changed" ? f : null;
}
function st(i, n) {
  const p = he(i, n);
  return p && p.event !== "component.meta.changed" ? p : null;
}
function it(i, n, p) {
  if (!i) return null;
  const f = fe(`component.${i}`, (u) => {
    const l = ot(u, i, p);
    l && n(l);
  });
  return typeof f == "function" ? f : null;
}
function rt(i, n, p, f) {
  const u = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Map();
  function j(E, _) {
    const g = i.value.find((T) => n(T) === E), d = l.get(E), b = _?.job_id || d?.state.deletion_job_id || g?.deletion_job_id, N = d ? d.state.deletion_job_id : g?.deleting_at ? g.deletion_job_id : void 0;
    if ((d || g?.deleting_at) && b === N || b && d?.superseded.has(b)) return;
    const x = {
      deleting_at: d?.state.deleting_at || g?.deleting_at || (/* @__PURE__ */ new Date()).toISOString(),
      deletion_job_id: b
    }, D = new Set(d?.superseded);
    for (const T of [d?.state.deletion_job_id, g?.deletion_job_id])
      T && T !== b && D.add(T);
    l.set(E, { state: x, superseded: D }), g && (Object.assign(g, x), g.deletion_job = void 0);
  }
  const C = Be(() => i.value, (E, _ = []) => {
    const g = E.filter((d) => !u.has(n(d)));
    for (const d of _)
      u.has(n(d)) || g.some((b) => n(b) === n(d)) || d.deleting_at && f?.(n(d));
    if (g.length !== E.length) {
      i.value = g;
      return;
    }
    for (const d of E) {
      d.deleting_at && d.deletion_job === void 0 && !_.includes(d) && (d.deletion_job = null);
      const b = l.get(n(d));
      if (b) {
        const x = d.deletion_job_id;
        d.deleting_at && x && x !== b.state.deletion_job_id && !b.superseded.has(x) && (b.state.deletion_job_id && b.superseded.add(b.state.deletion_job_id), b.state.deletion_job_id = x), x !== b.state.deletion_job_id && (d.deletion_job = void 0), Object.assign(d, b.state);
      }
      const N = _.find((x) => n(x) === n(d));
      d.deletion_job === void 0 && N?.deletion_job_id === d.deletion_job_id && (d.deletion_job = N?.deletion_job);
    }
  }, { immediate: !0 }), S = fe("@message", (E) => {
    const _ = st(E);
    if (!_) return;
    const g = i.value.find((d) => n(d) === _.component_id);
    _.event === "component.deleted" ? (g && !u.has(_.component_id) && f?.(_.component_id), u.add(_.component_id), l.delete(_.component_id), i.value = i.value.filter((d) => n(d) !== _.component_id)) : g && j(_.component_id, { job_id: _.deletion_job_id });
  });
  return pe(() => {
    C(), typeof S == "function" && S();
  }), { acceptDeletion: j };
}
function at() {
  let i = 0;
  return () => {
    const n = ++i;
    return () => n === i;
  };
}
function lt({ providers: i, connections: n, search: p, confirmId: f }) {
  const u = (o) => o.provider ?? "", l = (o) => o.title ?? o.name ?? o.oauth_provider ?? "Provider", j = (o) => o.icon || "tabler:plug", C = Z(() => {
    const o = {};
    for (const a of i.value) {
      const k = u(a);
      k && (o[k] = a);
    }
    return o;
  });
  function S(o) {
    return o.icon || C.value[o.provider || ""]?.icon || "tabler:plug-connected";
  }
  function E(o) {
    return o.provider ? C.value[o.provider] : void 0;
  }
  function _(o) {
    return new Set((o.scopes_granted ?? []).filter((a) => typeof a == "string" && a.length > 0));
  }
  function g(o) {
    return new Set((o?.default_scopes ?? []).filter((a) => typeof a == "string" && a.length > 0));
  }
  function d(o) {
    return (o?.available_scopes ?? []).map((a) => a.scope).filter((a) => typeof a == "string" && a.length > 0);
  }
  function b(o) {
    const a = g(o);
    return d(o).some((k) => !a.has(k));
  }
  function N(o) {
    if (!o.oauth) return !1;
    const a = E(o);
    if (!b(a)) return !1;
    const k = _(o), A = g(a);
    if (k.size === 0 || A.size === 0) return !1;
    for (const Q of k)
      if (!A.has(Q)) return !1;
    return !0;
  }
  function x(o) {
    return Te(o.connection_state, o.expires_at);
  }
  function D(o) {
    const a = x(o);
    return a === "connected" && N(o) ? "warn" : Me[a];
  }
  function T(o) {
    const a = x(o);
    return a === "connected" && N(o) ? "Limited access" : Pe[a];
  }
  function V(o) {
    const a = Number(o.expires_at || 0);
    if (!a) return "";
    const k = a - Math.floor(Date.now() / 1e3);
    return k <= 0 ? "token expired" : k < 3600 ? `expires in ${Math.max(1, Math.floor(k / 60))}m` : k < 86400 ? `expires in ${Math.floor(k / 3600)}h` : `expires in ${Math.floor(k / 86400)}d`;
  }
  function U(o) {
    const a = [];
    if (o.provider && a.push(o.provider), o.oauth) {
      N(o) && a.push("sign-in only");
      const k = V(o);
      k && a.push(k), Number(o.scope_count || 0) > 0 && a.push(`${o.scope_count} scope${o.scope_count === 1 ? "" : "s"}`);
    }
    return a.join(" · ");
  }
  function L(o) {
    if (f.value === o.component_id) return "Click the check again to remove this connection.";
    const a = x(o);
    return a === "expired" ? "The stored access token is expired; reconnect or wait for refresh." : a === "needs_reauth" ? `Reauthorize this connection to restore access.${o.reauth_reason ? " " + o.reauth_reason : ""}` : a === "disabled" ? "This connection is disabled and will not be used." : N(o) ? "Reauthorize this connection to grant service scopes." : o.oauth ? "OAuth connection available for agents and automations." : "Connection available for agents and automations.";
  }
  function O(o) {
    const a = p.value.trim().toLowerCase();
    return !a || o.toLowerCase().includes(a);
  }
  const R = Z(() => i.value.filter((o) => O(`${l(o)} ${o.description ?? ""} ${(o.classes ?? []).join(" ")}`))), q = Z(() => n.value.filter((o) => O(`${o.name ?? ""} ${o.provider ?? ""}`)));
  return {
    providerKey: u,
    providerLabel: l,
    providerIcon: j,
    connIcon: S,
    providerForConnection: E,
    grantedScopeSet: _,
    defaultScopeSet: g,
    availableScopeValues: d,
    hasOptionalProviderScopes: b,
    hasSignInOnlyScopes: N,
    connectionState: x,
    statusClass: D,
    statusLabel: T,
    expiryText: V,
    statusDetail: U,
    connectionDescription: L,
    filteredProviders: R,
    filteredConnections: q
  };
}
const ct = { class: "conn-page" }, dt = { class: "kx-head" }, ut = { class: "kx-head-icon" }, pt = { class: "kx-head-actions" }, ft = {
  class: "kx-search",
  role: "search"
}, vt = { class: "conn-body" }, ht = {
  key: 0,
  class: "conn-loading"
}, _t = {
  key: 1,
  class: "conn-empty au d1"
}, mt = { class: "lt-empty-hero is-danger" }, gt = { class: "e-sub" }, bt = {
  key: 0,
  class: "msg err au"
}, yt = {
  key: 1,
  class: "block au d1"
}, kt = { class: "live-grid" }, Ct = { class: "lc-top" }, St = { class: "lc-ico" }, xt = { class: "lc-top-r" }, $t = ["title", "aria-label", "onClick", "disabled"], wt = ["title", "aria-label", "onClick", "disabled"], jt = ["title", "aria-label", "onClick", "disabled"], Et = { class: "lc-name" }, Nt = { class: "lc-desc" }, Pt = { class: "lc-primary" }, Mt = {
  key: 0,
  class: "lc-secondary"
}, Tt = {
  key: 0,
  class: "list-foot"
}, Ot = ["disabled"], Dt = {
  key: 2,
  class: "conn-empty au d1"
}, Lt = { class: "lt-empty-hero is-success" }, At = {
  key: 3,
  class: "block au d2"
}, Rt = { class: "block-head" }, Bt = { class: "lt-section-header" }, It = { class: "setup-grid" }, Vt = ["data-provider-key", "onClick"], Ut = { class: "setup-ico" }, Kt = { class: "setup-text" }, zt = { class: "setup-name" }, Ht = { class: "setup-desc" }, Wt = {
  key: 4,
  class: "conn-empty au d1"
}, qt = { class: "lt-empty-hero is-info" }, Ft = { class: "e-title" }, Gt = {
  key: 5,
  class: "conn-empty au d2"
}, Jt = { class: "lt-empty-hero is-info" }, Yt = 100, Zt = /* @__PURE__ */ ue({
  __name: "connections",
  setup(i) {
    const n = w([]), p = w([]), f = w(!0), u = w(!1), l = w(""), j = w(""), C = w(""), S = w(""), E = lt({ providers: p, connections: n, search: S, confirmId: C }), {
      providerKey: _,
      providerLabel: g,
      providerIcon: d,
      connIcon: b,
      statusClass: N,
      statusLabel: x,
      statusDetail: D,
      connectionDescription: T,
      filteredProviders: V,
      filteredConnections: U
    } = E, L = w(0), O = w(!1), R = w(!1), q = w(void 0), o = w(void 0), a = w(!1), k = w(null), A = w(null);
    function Q(s) {
      return `/api/v1/connections?${new URLSearchParams({
        limit: String(Yt),
        offset: String(s)
      }).toString()}`;
    }
    async function re(s) {
      const { data: e } = await Y.get(Q(s));
      if (!e?.success) throw Object.assign(new Error("Could not load connections."), { response: { data: e } });
      return e;
    }
    const ae = at();
    async function K() {
      const s = ae();
      f.value = !0, u.value = !1, l.value = "", j.value = "";
      try {
        const [e, t, v] = await Promise.all([
          re(0),
          Y.get("/api/v1/oauth/providers/discover"),
          Y.get("/api/v1/connections/providers/discover")
        ]);
        if (!s()) return;
        n.value = e.connections ?? [], L.value = Number(e.total_count ?? n.value.length), O.value = !!e.has_more, ee(), p.value = me([
          ...t.data?.providers ?? [],
          ...v.data?.providers ?? []
        ]);
      } catch (e) {
        if (!s()) return;
        n.value.length ? l.value = G(e) : j.value = G(e), ee();
      } finally {
        s() && (f.value = !1);
      }
    }
    async function _e() {
      if (f.value || u.value || !O.value) return;
      const s = ae();
      u.value = !0, l.value = "";
      try {
        const e = await re(n.value.length);
        if (!s()) return;
        const t = e.connections ?? [];
        n.value = [...n.value, ...t], L.value = Number(e.total_count ?? L.value), O.value = !!e.has_more, ee();
      } catch (e) {
        s() && (l.value = G(e));
      } finally {
        s() && (u.value = !1);
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
    function be(s, e, t = []) {
      const v = {};
      if (typeof e.title == "string" && (v.name = e.title), typeof e.provider == "string" && (v.provider = e.provider), typeof e.icon == "string" && (v.icon = e.icon), typeof e.connection_state == "string" && (v.connection_state = e.connection_state), typeof e.reauth_reason == "string" && (v.reauth_reason = e.reauth_reason), typeof e.expires_at == "number" && (v.expires_at = e.expires_at), typeof e.refresh_expires_at == "number" && (v.refresh_expires_at = e.refresh_expires_at), typeof e.last_token_refresh == "string" && (v.last_token_refresh = e.last_token_refresh), typeof e.scopes_granted == "string") {
        const z = ge(e.scopes_granted);
        v.scopes_granted = z, v.scope_count = z.length;
      }
      typeof e.oauth_connection == "boolean" && (v.oauth = e.oauth_connection);
      const I = { ...s, ...v };
      for (const z of t) {
        const Ee = z === "title" ? "name" : z;
        delete I[Ee];
      }
      return I;
    }
    const B = /* @__PURE__ */ new Map(), F = /* @__PURE__ */ new Set();
    let X = 0;
    function ye(s, e) {
      n.value = n.value.map((t) => t.component_id === s ? be(t, e.meta || {}, e.deleted || []) : t);
    }
    function ke() {
      X++, F.clear();
      for (const s of B.values()) s();
      B.clear();
    }
    function ee() {
      const s = new Set(n.value.map((t) => t.component_id).filter(Boolean));
      for (const [t, v] of B)
        s.has(t) || (v(), B.delete(t));
      const e = X;
      for (const t of s) {
        if (B.has(t) || F.has(t)) continue;
        F.add(t);
        const v = it(t, (I) => ye(t, I), De);
        if (F.delete(t), !!v) {
          if (e !== X || !n.value.some((I) => I.component_id === t)) {
            v();
            continue;
          }
          B.set(t, v);
        }
      }
    }
    function te(s, e) {
      q.value = s, o.value = e, R.value = !0;
    }
    async function Ce(s) {
      k.value = s, a.value = !0, await Ke(), await xe();
    }
    function Se() {
      a.value = !1, k.value = null;
    }
    async function xe() {
      const s = k.value;
      if (!A.value || !s) return;
      if (A.value.innerHTML = "", !customElements.get("kickside-share"))
        try {
          await We("kickside-share", { timeoutMs: 8e3 });
        } catch {
        }
      const e = document.createElement("kickside-share");
      e.setAttribute("config", JSON.stringify({
        resource_id: s.component_id,
        access_url: `/api/v1/component-access/grants/${encodeURIComponent(s.component_id)}`,
        share_url: `/api/v1/component-access/share/${encodeURIComponent(s.component_id)}`,
        title: s.name || s.provider || "Connection"
      })), e.style.display = "block", e.addEventListener("close", Se), A.value.appendChild(e);
    }
    function $e(s) {
      if (!s.provider) return;
      const e = p.value.find((t) => _(t) === s.provider);
      te(s.provider, s.oauth || e?.create_ui_id ? { componentId: s.component_id, name: s.name } : void 0);
    }
    function we() {
      R.value = !1, o.value = void 0, n.value = [], K();
    }
    async function le(s) {
      if (C.value !== s.component_id) {
        C.value = s.component_id;
        return;
      }
      C.value = "", l.value = "";
      try {
        const { data: e } = await Y.delete(`/api/v1/connections/${encodeURIComponent(s.component_id)}`);
        if (!e?.success) throw new Error(e?.error || "delete failed");
        je(s.component_id, e), await K();
      } catch (e) {
        l.value = G(e);
      }
    }
    Oe(K), pe(ke);
    const { acceptDeletion: je } = rt(n, (s) => s.component_id, void 0, K);
    return (s, e) => (h(), m("div", ct, [
      r("header", dt, [
        r("div", ut, [
          y(c($), {
            icon: "tabler:plug-connected",
            "aria-hidden": "true"
          })
        ]),
        e[4] || (e[4] = r("div", { class: "kx-head-text" }, [
          r("h1", { class: "kx-title" }, "Connections"),
          r("p", { class: "kx-head-sub" }, "Connect external services and manage them here.")
        ], -1)),
        r("div", pt, [
          r("label", ft, [
            y(c($), {
              icon: "tabler:search",
              class: "kx-search-ico",
              "aria-hidden": "true"
            }),
            Ie(r("input", {
              "onUpdate:modelValue": e[0] || (e[0] = (t) => S.value = t),
              class: "kx-search-input",
              type: "search",
              placeholder: "Search services",
              "aria-label": "Search services"
            }, null, 512), [
              [Ve, S.value]
            ]),
            S.value ? (h(), m("button", {
              key: 0,
              class: "kx-search-clear",
              onClick: e[1] || (e[1] = (t) => S.value = ""),
              "aria-label": "Clear search"
            }, [
              y(c($), {
                icon: "tabler:x",
                "aria-hidden": "true"
              })
            ])) : M("", !0)
          ]),
          y(c(ie), {
            label: "Connect app",
            onClick: e[2] || (e[2] = (t) => te())
          }, {
            icon: ce(() => [
              y(c($), {
                icon: "tabler:plus",
                "aria-hidden": "true"
              })
            ]),
            _: 1
          })
        ])
      ]),
      r("div", vt, [
        f.value && !n.value.length ? (h(), m("div", ht, "Loading…")) : j.value ? (h(), m("section", _t, [
          r("div", mt, [
            y(c($), { icon: "tabler:plug-x" })
          ]),
          e[5] || (e[5] = r("div", { class: "e-title" }, "Couldn't load connections", -1)),
          r("div", gt, P(j.value), 1),
          y(c(ie), {
            label: "Try again",
            class: "conn-retry",
            onClick: K
          }, {
            icon: ce(() => [
              y(c($), {
                icon: "tabler:refresh",
                "aria-hidden": "true"
              })
            ]),
            _: 1
          })
        ])) : (h(), m(W, { key: 2 }, [
          l.value ? (h(), m("div", bt, [
            y(c($), { icon: "tabler:alert-circle" }),
            se(P(l.value), 1)
          ])) : M("", !0),
          c(U).length ? (h(), m("section", yt, [
            e[8] || (e[8] = r("div", { class: "block-head" }, [
              r("h2", { class: "lt-section-header" }, "Your connections")
            ], -1)),
            r("div", kt, [
              (h(!0), m(W, null, de(c(U), (t) => (h(), m("div", {
                key: t.component_id,
                class: J(["live-card s-live", `state-${c(N)(t)}`])
              }, [
                y(et, {
                  state: t,
                  onRetry: (v) => {
                    C.value = t.component_id, le(t);
                  }
                }, null, 8, ["state", "onRetry"]),
                r("div", Ct, [
                  r("div", St, [
                    y(c($), {
                      icon: c(b)(t),
                      "aria-hidden": "true"
                    }, null, 8, ["icon"])
                  ]),
                  r("div", xt, [
                    r("button", {
                      class: "lc-add",
                      title: `Share ${t.name || t.provider}`,
                      "aria-label": `Share ${t.name || t.provider}`,
                      onClick: (v) => Ce(t),
                      disabled: !!t.deleting_at
                    }, [
                      y(c($), { icon: "tabler:share" })
                    ], 8, $t),
                    r("button", {
                      class: "lc-add",
                      title: `Reconnect ${t.name || t.provider}`,
                      "aria-label": `Reconnect ${t.name || t.provider}`,
                      onClick: (v) => $e(t),
                      disabled: !!t.deleting_at
                    }, [
                      y(c($), { icon: "tabler:refresh" })
                    ], 8, wt),
                    r("button", {
                      class: J(["lc-add lc-danger", C.value === t.component_id && "armed"]),
                      title: C.value === t.component_id ? "Click again to remove" : `Remove ${t.name || t.provider}`,
                      "aria-label": `Remove ${t.name || t.provider}`,
                      onClick: (v) => le(t),
                      disabled: !!t.deleting_at
                    }, [
                      y(c($), {
                        icon: C.value === t.component_id ? "tabler:check" : "tabler:trash"
                      }, null, 8, ["icon"])
                    ], 10, jt)
                  ])
                ]),
                r("div", Et, P(t.name || t.provider || "Connection"), 1),
                r("div", Nt, P(c(T)(t)), 1),
                r("div", {
                  class: J(["lc-status", `state-${c(N)(t)}`])
                }, [
                  e[6] || (e[6] = r("span", { class: "dot" }, null, -1)),
                  r("span", Pt, P(c(x)(t)), 1),
                  c(D)(t) ? (h(), m("span", Mt, "· " + P(c(D)(t)), 1)) : M("", !0)
                ], 2)
              ], 2))), 128))
            ]),
            L.value || O.value ? (h(), m("div", Tt, [
              r("span", null, P(n.value.length) + " of " + P(L.value || n.value.length) + " loaded", 1),
              O.value ? (h(), m("button", {
                key: 0,
                class: "ghost-action",
                disabled: f.value || u.value,
                onClick: _e
              }, [
                y(c($), {
                  icon: u.value ? "tabler:loader-2" : "tabler:chevron-down",
                  class: J(u.value && "spin")
                }, null, 8, ["icon", "class"]),
                e[7] || (e[7] = se(" Load more ", -1))
              ], 8, Ot)) : M("", !0)
            ])) : M("", !0)
          ])) : !S.value && p.value.length ? (h(), m("section", Dt, [
            r("div", Lt, [
              y(c($), { icon: "tabler:plug-connected" })
            ]),
            e[9] || (e[9] = r("div", { class: "e-title" }, "Connect your first app", -1)),
            e[10] || (e[10] = r("div", { class: "e-sub" }, "Pick a service below — your agents and automations will read events and act through it.", -1))
          ])) : M("", !0),
          c(V).length ? (h(), m("section", At, [
            r("div", Rt, [
              r("h2", Bt, P(c(U).length ? "Add another" : "Available services"), 1)
            ]),
            r("div", It, [
              (h(!0), m(W, null, de(c(V), (t) => (h(), m("button", {
                key: c(_)(t),
                "data-provider-key": c(_)(t),
                class: "setup-card",
                onClick: (v) => te(c(_)(t))
              }, [
                r("div", Ut, [
                  y(c($), {
                    icon: c(d)(t),
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                r("div", Kt, [
                  r("div", zt, P(c(g)(t)), 1),
                  r("div", Ht, P(t.description || `Set up ${c(g)(t)}`), 1)
                ]),
                y(c($), {
                  icon: "tabler:arrow-right",
                  class: "setup-arrow",
                  "aria-hidden": "true"
                })
              ], 8, Vt))), 128))
            ])
          ])) : S.value ? (h(), m("section", Wt, [
            r("div", qt, [
              y(c($), { icon: "tabler:search-off" })
            ]),
            r("div", Ft, "No services match “" + P(S.value) + "”", 1)
          ])) : !p.value.length && !n.value.length ? (h(), m("section", Gt, [
            r("div", Jt, [
              y(c($), { icon: "tabler:plug-x" })
            ]),
            e[11] || (e[11] = r("div", { class: "e-title" }, "No providers available", -1)),
            e[12] || (e[12] = r("div", { class: "e-sub" }, "Install a provider module to add a connection here.", -1))
          ])) : M("", !0)
        ], 64))
      ]),
      R.value ? (h(), Ue(He, {
        key: 0,
        providers: p.value,
        provider: q.value,
        reauth: o.value,
        onClose: e[3] || (e[3] = (t) => R.value = !1),
        onConnected: we
      }, null, 8, ["providers", "provider", "reauth"])) : M("", !0),
      a.value ? (h(), m("div", {
        key: 1,
        ref_key: "shareHost",
        ref: A
      }, null, 512)) : M("", !0)
    ]));
  }
}), Qt = { props: { type: "object", properties: {} } }, Xt = {
  wippy: Qt
};
class en extends Le {
  static get wippyConfig() {
    return {
      propsSchema: Xt.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: Ae
    };
  }
  static get vueConfig() {
    return { rootComponent: Zt, plugins: [Re] };
  }
}
qe(import.meta.url, en);
//# sourceMappingURL=index.js.map
