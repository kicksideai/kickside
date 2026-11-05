import { B as Pe, C as je, c as Me, r as De, d as Te, b as J, e as Ae, W as Le, s as Oe, P as Re } from "./styles-tpVissSe.js";
import { openBlock as h, createElementBlock as m, mergeProps as ne, createElementVNode as i, defineComponent as ue, computed as q, withModifiers as oe, Fragment as z, createTextVNode as se, toDisplayString as E, createCommentVNode as N, createVNode as _, unref as d, watch as Be, onBeforeUnmount as pe, ref as $, withDirectives as Ie, vModelText as Ue, withCtx as le, renderList as ce, normalizeClass as Y, createBlock as Ve, nextTick as Ke } from "vue";
import { s as ze, a as re, _ as He } from "./ConnectionPicker.vue_vue_type_script_setup_true_lang-RKLMj11t.js";
import { on as fe, api as K, host as We, loadByTagName as Fe, define as Ge } from "@wippy-fe/proxy";
import { Icon as S } from "@iconify/vue";
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
}, qe = Pe.extend({
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
function Xe(r, n, l, c, u, p) {
  return h(), m("div", ne({
    class: r.cx("root"),
    role: "progressbar"
  }, r.ptmi("root")), [(h(), m("svg", ne({
    class: r.cx("spin"),
    viewBox: "25 25 50 50",
    style: p.svgStyle
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
    return (c, u) => r.state.deleting_at ? (h(), m("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: u[1] || (u[1] = oe(() => {
      }, ["stop"])),
      onKeydown: u[2] || (u[2] = oe(() => {
      }, ["stop"]))
    }, [
      l.value ? (h(), m(z, { key: 0 }, [
        i("span", null, [
          u[3] || (u[3] = se("Deletion failed", -1)),
          r.state.deletion_job?.last_error ? (h(), m("span", et, ": " + E(r.state.deletion_job.last_error), 1)) : N("", !0)
        ]),
        _(d(re), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: u[0] || (u[0] = oe((p) => c.$emit("retry"), ["stop"]))
        })
      ], 64)) : (h(), m(z, { key: 1 }, [
        _(d(ve), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        u[4] || (u[4] = i("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : N("", !0);
  }
}), nt = (r, n) => {
  const l = r.__vccOpts || r;
  for (const [c, u] of n)
    l[c] = u;
  return l;
}, ot = /* @__PURE__ */ nt(tt, [["__scopeId", "data-v-69a579d4"]]);
function V(r) {
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
  for (const [c, u] of Object.entries(r))
    l[c] = st(n[c], u);
  return l;
}
function he(r, n, l) {
  if (n !== void 0 && !n) return null;
  const c = V(r) ? r : {}, u = [
    c,
    V(c.data) ? c.data : null,
    V(c.payload) ? c.payload : null,
    V(c.detail) ? c.detail : null
  ].filter(Boolean);
  for (const p of u) {
    if (p.event !== "component.meta.changed" && p.event !== "component.deleting" && p.event !== "component.deleted") continue;
    const w = String(p.component_id || ""), k = String(c.topic || p.topic || "");
    if (n === void 0) {
      if (!w && (!k.startsWith("component.") || k === "component.")) continue;
    } else if (w && w !== n || !w && k !== `component.${n}`) continue;
    const x = w || n || k.slice(10);
    return p.event !== "component.meta.changed" ? { event: p.event, component_id: x } : {
      event: "component.meta.changed",
      component_id: x,
      meta: rt(V(p.meta) ? p.meta : {}, l),
      deleted: Array.isArray(p.deleted) ? p.deleted.map(String) : []
    };
  }
  return null;
}
function it(r, n, l) {
  const c = he(r, n, l);
  return c?.event === "component.meta.changed" ? c : null;
}
function at(r, n) {
  const l = he(r, n);
  return l && l.event !== "component.meta.changed" ? l : null;
}
function lt(r, n, l) {
  if (!r) return null;
  const c = fe(`component.${r}`, (u) => {
    const p = it(u, r, l);
    p && n(p);
  });
  return typeof c == "function" ? c : null;
}
function de(r, n) {
  if (r && typeof r == "object") {
    const l = r, c = l.response?.data?.error;
    if (typeof c == "string") return c;
    if (c && typeof c == "object" && typeof c.message == "string")
      return c.message;
    if (typeof l.message == "string" && l.message) return l.message;
  }
  return n;
}
function ct(r, n, l) {
  let c = !0;
  const u = /* @__PURE__ */ new Set();
  function p(b, f) {
    const g = r.value.find((C) => n(C) === b);
    g && (g.deleting_at = g.deleting_at || (/* @__PURE__ */ new Date()).toISOString(), g.deletion_job_id = f?.job_id || g.deletion_job_id, g.deletion_job = void 0);
  }
  async function w(b) {
    b.deletion_job = void 0;
    try {
      const { data: f } = await K.get(`/api/v1/components/${encodeURIComponent(n(b))}`);
      if (!f?.success) throw new Error(de(f, "Could not read deletion progress"));
      c && r.value.includes(b) && (b.deleting_at = f.deleting_at, b.deletion_job_id = f.deletion_job_id, b.deletion_job = f.deletion_job ?? null);
    } catch (f) {
      c && r.value.includes(b) && We.handleError("other", { message: de(f, "Could not read deletion progress") });
    }
  }
  const k = Be(() => r.value, (b, f = []) => {
    const g = b.filter((C) => !u.has(n(C)));
    for (const C of f) !u.has(n(C)) && g.some((T) => n(T) === n(C));
    if (g.length !== b.length) {
      r.value = g;
      return;
    }
    for (const C of b) C.deleting_at && w(C);
  }, { immediate: !0 }), x = fe("@message", (b) => {
    const f = at(b);
    if (!f) return;
    const g = r.value.find((C) => n(C) === f.component_id);
    f.event === "component.deleted" ? (g && u.has(f.component_id), u.add(f.component_id), r.value = r.value.filter((C) => n(C) !== f.component_id)) : g && (p(f.component_id), w(g));
  });
  return pe(() => {
    c = !1, k(), typeof x == "function" && x();
  }), { acceptDeletion: p };
}
function dt({ providers: r, connections: n, search: l, confirmId: c }) {
  const u = (o) => o.provider ?? "", p = (o) => o.title ?? o.name ?? o.oauth_provider ?? "Provider", w = (o) => o.icon || "tabler:plug", k = q(() => {
    const o = {};
    for (const a of r.value) {
      const y = u(a);
      y && (o[y] = a);
    }
    return o;
  });
  function x(o) {
    return o.icon || k.value[o.provider || ""]?.icon || "tabler:plug-connected";
  }
  function b(o) {
    return o.provider ? k.value[o.provider] : void 0;
  }
  function f(o) {
    return new Set((o.scopes_granted ?? []).filter((a) => typeof a == "string" && a.length > 0));
  }
  function g(o) {
    return new Set((o?.default_scopes ?? []).filter((a) => typeof a == "string" && a.length > 0));
  }
  function C(o) {
    return (o?.available_scopes ?? []).map((a) => a.scope).filter((a) => typeof a == "string" && a.length > 0);
  }
  function T(o) {
    const a = g(o);
    return C(o).some((y) => !a.has(y));
  }
  function P(o) {
    if (!o.oauth) return !1;
    const a = b(o);
    if (!T(a)) return !1;
    const y = f(o), D = g(a);
    if (y.size === 0 || D.size === 0) return !1;
    for (const Q of y)
      if (!D.has(Q)) return !1;
    return !0;
  }
  function A(o) {
    return De(o.connection_state, o.expires_at);
  }
  function H(o) {
    const a = A(o);
    return a === "connected" && P(o) ? "warn" : Me[a];
  }
  function Z(o) {
    const a = A(o);
    return a === "connected" && P(o) ? "Limited access" : je[a];
  }
  function B(o) {
    const a = Number(o.expires_at || 0);
    if (!a) return "";
    const y = a - Math.floor(Date.now() / 1e3);
    return y <= 0 ? "token expired" : y < 3600 ? `expires in ${Math.max(1, Math.floor(y / 60))}m` : y < 86400 ? `expires in ${Math.floor(y / 3600)}h` : `expires in ${Math.floor(y / 86400)}d`;
  }
  function I(o) {
    const a = [];
    if (o.provider && a.push(o.provider), o.oauth) {
      P(o) && a.push("sign-in only");
      const y = B(o);
      y && a.push(y), Number(o.scope_count || 0) > 0 && a.push(`${o.scope_count} scope${o.scope_count === 1 ? "" : "s"}`);
    }
    return a.join(" · ");
  }
  function M(o) {
    if (c.value === o.component_id) return "Click the check again to remove this connection.";
    const a = A(o);
    return a === "expired" ? "The stored access token is expired; reconnect or wait for refresh." : a === "needs_reauth" ? `Reauthorize this connection to restore access.${o.reauth_reason ? " " + o.reauth_reason : ""}` : a === "disabled" ? "This connection is disabled and will not be used." : P(o) ? "Reauthorize this connection to grant service scopes." : o.oauth ? "OAuth connection available for agents and automations." : "Connection available for agents and automations.";
  }
  function j(o) {
    const a = l.value.trim().toLowerCase();
    return !a || o.toLowerCase().includes(a);
  }
  const L = q(() => r.value.filter((o) => j(`${p(o)} ${o.description ?? ""} ${(o.classes ?? []).join(" ")}`))), W = q(() => n.value.filter((o) => j(`${o.name ?? ""} ${o.provider ?? ""}`)));
  return {
    providerKey: u,
    providerLabel: p,
    providerIcon: w,
    connIcon: x,
    providerForConnection: b,
    grantedScopeSet: f,
    defaultScopeSet: g,
    availableScopeValues: C,
    hasOptionalProviderScopes: T,
    hasSignInOnlyScopes: P,
    connectionState: A,
    statusClass: H,
    statusLabel: Z,
    expiryText: B,
    statusDetail: I,
    connectionDescription: M,
    filteredProviders: L,
    filteredConnections: W
  };
}
const ut = { class: "conn-page" }, pt = { class: "kx-head" }, ft = { class: "kx-head-icon" }, vt = { class: "kx-head-actions" }, ht = {
  class: "kx-search",
  role: "search"
}, mt = { class: "conn-body" }, _t = {
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
}, St = { class: "live-grid" }, xt = { class: "lc-top" }, $t = { class: "lc-ico" }, wt = { class: "lc-top-r" }, Et = ["title", "aria-label", "onClick", "disabled"], Nt = ["title", "aria-label", "onClick", "disabled"], Pt = ["title", "aria-label", "onClick", "disabled"], jt = { class: "lc-name" }, Mt = { class: "lc-desc" }, Dt = { class: "lc-primary" }, Tt = {
  key: 0,
  class: "lc-secondary"
}, At = {
  key: 0,
  class: "list-foot"
}, Lt = ["disabled"], Ot = {
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
    const n = $([]), l = $([]), c = $(!0), u = $(!1), p = $(""), w = $(""), k = $(""), x = $(""), b = dt({ providers: l, connections: n, search: x, confirmId: k }), {
      providerKey: f,
      providerLabel: g,
      providerIcon: C,
      connIcon: T,
      statusClass: P,
      statusLabel: A,
      statusDetail: H,
      connectionDescription: Z,
      filteredProviders: B,
      filteredConnections: I
    } = b, M = $(0), j = $(!1), L = $(!1), W = $(void 0), o = $(void 0), a = $(!1), y = $(null), D = $(null);
    function Q(s) {
      return `/api/v1/connections?${new URLSearchParams({
        limit: String(Qt),
        offset: String(s)
      }).toString()}`;
    }
    async function ie(s) {
      const { data: e } = await K.get(Q(s));
      return e ?? { connections: [], total_count: 0, has_more: !1 };
    }
    async function F() {
      c.value = !0, p.value = "", w.value = "";
      try {
        const [s, e, t] = await Promise.all([
          ie(0),
          K.get("/api/v1/oauth/providers/discover"),
          K.get("/api/v1/connections/providers/discover")
        ]);
        n.value = s.connections ?? [], M.value = Number(s.total_count ?? n.value.length), j.value = !!s.has_more, ee(), l.value = _e([
          ...e.data?.providers ?? [],
          ...t.data?.providers ?? []
        ]);
      } catch (s) {
        n.value.length ? p.value = J(s) : w.value = J(s), ee();
      } finally {
        c.value = !1;
      }
    }
    async function me() {
      if (!(u.value || !j.value)) {
        u.value = !0, p.value = "";
        try {
          const s = await ie(n.value.length), e = s.connections ?? [];
          n.value = [...n.value, ...e], M.value = Number(s.total_count ?? M.value), j.value = !!s.has_more, ee();
        } catch (s) {
          p.value = J(s);
        } finally {
          u.value = !1;
        }
      }
    }
    function _e(s) {
      const e = {};
      for (const t of s) {
        const v = f(t);
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
        const U = ge(e.scopes_granted);
        v.scopes_granted = U, v.scope_count = U.length;
      }
      typeof e.oauth_connection == "boolean" && (v.oauth = e.oauth_connection);
      const R = { ...s, ...v };
      for (const U of t) {
        const Ne = U === "title" ? "name" : U;
        delete R[Ne];
      }
      return R;
    }
    const O = /* @__PURE__ */ new Map(), G = /* @__PURE__ */ new Set();
    let X = 0;
    function be(s, e) {
      n.value = n.value.map((t) => t.component_id === s ? ye(t, e.meta || {}, e.deleted || []) : t);
    }
    function ke() {
      X++, G.clear();
      for (const s of O.values()) s();
      O.clear();
    }
    function ee() {
      const s = new Set(n.value.map((t) => t.component_id).filter(Boolean));
      for (const [t, v] of O)
        s.has(t) || (v(), O.delete(t));
      const e = X;
      for (const t of s) {
        if (O.has(t) || G.has(t)) continue;
        G.add(t);
        const v = lt(t, (R) => be(t, R), Ae);
        if (G.delete(t), !!v) {
          if (e !== X || !n.value.some((R) => R.component_id === t)) {
            v();
            continue;
          }
          O.set(t, v);
        }
      }
    }
    function te(s, e) {
      W.value = s, o.value = e, L.value = !0;
    }
    async function Ce(s) {
      y.value = s, a.value = !0, await Ke(), await xe();
    }
    function Se() {
      a.value = !1, y.value = null;
    }
    async function xe() {
      const s = y.value;
      if (!D.value || !s) return;
      if (D.value.innerHTML = "", !customElements.get("kickside-share"))
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
      })), e.style.display = "block", e.addEventListener("close", Se), D.value.appendChild(e);
    }
    function $e(s) {
      if (!s.provider) return;
      const e = l.value.find((t) => f(t) === s.provider);
      te(s.provider, s.oauth || e?.create_ui_id ? { componentId: s.component_id, name: s.name } : void 0);
    }
    function we() {
      L.value = !1, o.value = void 0, n.value = [], F();
    }
    async function ae(s) {
      if (k.value !== s.component_id) {
        k.value = s.component_id;
        return;
      }
      k.value = "", p.value = "";
      try {
        const { data: e } = await K.delete(`/api/v1/connections/${encodeURIComponent(s.component_id)}`);
        if (!e?.success) throw new Error(e?.error || "delete failed");
        Ee(s.component_id, e), await F();
      } catch (e) {
        p.value = J(e);
      }
    }
    Te(F), pe(ke);
    const { acceptDeletion: Ee } = ct(n, (s) => s.component_id);
    return (s, e) => (h(), m("div", ut, [
      i("header", pt, [
        i("div", ft, [
          _(d(S), {
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
            _(d(S), {
              icon: "tabler:search",
              class: "kx-search-ico",
              "aria-hidden": "true"
            }),
            Ie(i("input", {
              "onUpdate:modelValue": e[0] || (e[0] = (t) => x.value = t),
              class: "kx-search-input",
              type: "search",
              placeholder: "Search services",
              "aria-label": "Search services"
            }, null, 512), [
              [Ue, x.value]
            ]),
            x.value ? (h(), m("button", {
              key: 0,
              class: "kx-search-clear",
              onClick: e[1] || (e[1] = (t) => x.value = ""),
              "aria-label": "Clear search"
            }, [
              _(d(S), {
                icon: "tabler:x",
                "aria-hidden": "true"
              })
            ])) : N("", !0)
          ]),
          _(d(re), {
            label: "Connect app",
            onClick: e[2] || (e[2] = (t) => te())
          }, {
            icon: le(() => [
              _(d(S), {
                icon: "tabler:plus",
                "aria-hidden": "true"
              })
            ]),
            _: 1
          })
        ])
      ]),
      i("div", mt, [
        c.value && !n.value.length ? (h(), m("div", _t, "Loading…")) : w.value ? (h(), m("section", gt, [
          i("div", yt, [
            _(d(S), { icon: "tabler:plug-x" })
          ]),
          e[5] || (e[5] = i("div", { class: "e-title" }, "Couldn't load connections", -1)),
          i("div", bt, E(w.value), 1),
          _(d(re), {
            label: "Try again",
            class: "conn-retry",
            onClick: F
          }, {
            icon: le(() => [
              _(d(S), {
                icon: "tabler:refresh",
                "aria-hidden": "true"
              })
            ]),
            _: 1
          })
        ])) : (h(), m(z, { key: 2 }, [
          p.value ? (h(), m("div", kt, [
            _(d(S), { icon: "tabler:alert-circle" }),
            se(E(p.value), 1)
          ])) : N("", !0),
          d(I).length ? (h(), m("section", Ct, [
            e[8] || (e[8] = i("div", { class: "block-head" }, [
              i("h2", { class: "lt-section-header" }, "Your connections")
            ], -1)),
            i("div", St, [
              (h(!0), m(z, null, ce(d(I), (t) => (h(), m("div", {
                key: t.component_id,
                class: Y(["live-card s-live", `state-${d(P)(t)}`])
              }, [
                _(ot, {
                  state: t,
                  onRetry: (v) => {
                    k.value = t.component_id, ae(t);
                  }
                }, null, 8, ["state", "onRetry"]),
                i("div", xt, [
                  i("div", $t, [
                    _(d(S), {
                      icon: d(T)(t),
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
                      _(d(S), { icon: "tabler:share" })
                    ], 8, Et),
                    i("button", {
                      class: "lc-add",
                      title: `Reconnect ${t.name || t.provider}`,
                      "aria-label": `Reconnect ${t.name || t.provider}`,
                      onClick: (v) => $e(t),
                      disabled: !!t.deleting_at
                    }, [
                      _(d(S), { icon: "tabler:refresh" })
                    ], 8, Nt),
                    i("button", {
                      class: Y(["lc-add lc-danger", k.value === t.component_id && "armed"]),
                      title: k.value === t.component_id ? "Click again to remove" : `Remove ${t.name || t.provider}`,
                      "aria-label": `Remove ${t.name || t.provider}`,
                      onClick: (v) => ae(t),
                      disabled: !!t.deleting_at
                    }, [
                      _(d(S), {
                        icon: k.value === t.component_id ? "tabler:check" : "tabler:trash"
                      }, null, 8, ["icon"])
                    ], 10, Pt)
                  ])
                ]),
                i("div", jt, E(t.name || t.provider || "Connection"), 1),
                i("div", Mt, E(d(Z)(t)), 1),
                i("div", {
                  class: Y(["lc-status", `state-${d(P)(t)}`])
                }, [
                  e[6] || (e[6] = i("span", { class: "dot" }, null, -1)),
                  i("span", Dt, E(d(A)(t)), 1),
                  d(H)(t) ? (h(), m("span", Tt, "· " + E(d(H)(t)), 1)) : N("", !0)
                ], 2)
              ], 2))), 128))
            ]),
            M.value || j.value ? (h(), m("div", At, [
              i("span", null, E(n.value.length) + " of " + E(M.value || n.value.length) + " loaded", 1),
              j.value ? (h(), m("button", {
                key: 0,
                class: "ghost-action",
                disabled: u.value,
                onClick: me
              }, [
                _(d(S), {
                  icon: u.value ? "tabler:loader-2" : "tabler:chevron-down",
                  class: Y(u.value && "spin")
                }, null, 8, ["icon", "class"]),
                e[7] || (e[7] = se(" Load more ", -1))
              ], 8, Lt)) : N("", !0)
            ])) : N("", !0)
          ])) : !x.value && l.value.length ? (h(), m("section", Ot, [
            i("div", Rt, [
              _(d(S), { icon: "tabler:plug-connected" })
            ]),
            e[9] || (e[9] = i("div", { class: "e-title" }, "Connect your first app", -1)),
            e[10] || (e[10] = i("div", { class: "e-sub" }, "Pick a service below — your agents and automations will read events and act through it.", -1))
          ])) : N("", !0),
          d(B).length ? (h(), m("section", Bt, [
            i("div", It, [
              i("h2", Ut, E(d(I).length ? "Add another" : "Available services"), 1)
            ]),
            i("div", Vt, [
              (h(!0), m(z, null, ce(d(B), (t) => (h(), m("button", {
                key: d(f)(t),
                "data-provider-key": d(f)(t),
                class: "setup-card",
                onClick: (v) => te(d(f)(t))
              }, [
                i("div", zt, [
                  _(d(S), {
                    icon: d(C)(t),
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                i("div", Ht, [
                  i("div", Wt, E(d(g)(t)), 1),
                  i("div", Ft, E(t.description || `Set up ${d(g)(t)}`), 1)
                ]),
                _(d(S), {
                  icon: "tabler:arrow-right",
                  class: "setup-arrow",
                  "aria-hidden": "true"
                })
              ], 8, Kt))), 128))
            ])
          ])) : x.value ? (h(), m("section", Gt, [
            i("div", Jt, [
              _(d(S), { icon: "tabler:search-off" })
            ]),
            i("div", Yt, "No services match “" + E(x.value) + "”", 1)
          ])) : !l.value.length && !n.value.length ? (h(), m("section", qt, [
            i("div", Zt, [
              _(d(S), { icon: "tabler:plug-x" })
            ]),
            e[11] || (e[11] = i("div", { class: "e-title" }, "No providers available", -1)),
            e[12] || (e[12] = i("div", { class: "e-sub" }, "Install a provider module to add a connection here.", -1))
          ])) : N("", !0)
        ], 64))
      ]),
      L.value ? (h(), Ve(He, {
        key: 0,
        providers: l.value,
        provider: W.value,
        reauth: o.value,
        onClose: e[3] || (e[3] = (t) => L.value = !1),
        onConnected: we
      }, null, 8, ["providers", "provider", "reauth"])) : N("", !0),
      a.value ? (h(), m("div", {
        key: 1,
        ref_key: "shareHost",
        ref: D
      }, null, 512)) : N("", !0)
    ]));
  }
}), en = { props: { type: "object", properties: {} } }, tn = {
  wippy: en
};
class nn extends Le {
  static get wippyConfig() {
    return {
      propsSchema: tn.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: Oe
    };
  }
  static get vueConfig() {
    return { rootComponent: Xt, plugins: [Re] };
  }
}
Ge(import.meta.url, nn);
//# sourceMappingURL=index.js.map
