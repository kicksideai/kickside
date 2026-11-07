import { P as we } from "./primevue-plugin-CaP7wV_M.js";
import { defineComponent as de, computed as Z, openBlock as h, createElementBlock as g, withModifiers as ne, Fragment as F, createElementVNode as r, createTextVNode as oe, toDisplayString as E, createCommentVNode as N, createVNode as y, unref as c, watch as Ee, onBeforeUnmount as ue, ref as w, withDirectives as Ne, vModelText as Me, withCtx as ae, renderList as le, normalizeClass as q, createBlock as De, nextTick as Pe } from "vue";
import se from "primevue/button";
import Te from "primevue/progressspinner";
import { on as fe, api as K, host as Oe, loadByTagName as Le } from "@wippy-fe/proxy";
import { Icon as j } from "@iconify/vue";
import { b as Ae } from "./wc-runtime-KO3cNuNo.js";
import { C as Re, b as Be, r as Ie, a as W, c as Ue } from "./status-BfNJewNy.js";
import { _ as Ve } from "./ConnectionPicker.vue_vue_type_script_setup_true_lang-qkDdnskl.js";
const ze = { key: 0 }, He = /* @__PURE__ */ de({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(a) {
    const n = a, l = Z(() => n.state.deletion_job === null || ["dead", "cancelled"].includes(n.state.deletion_job?.status || ""));
    return (f, p) => a.state.deleting_at ? (h(), g("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: p[1] || (p[1] = ne(() => {
      }, ["stop"])),
      onKeydown: p[2] || (p[2] = ne(() => {
      }, ["stop"]))
    }, [
      l.value ? (h(), g(F, { key: 0 }, [
        r("span", null, [
          p[3] || (p[3] = oe("Deletion failed", -1)),
          a.state.deletion_job?.last_error ? (h(), g("span", ze, ": " + E(a.state.deletion_job.last_error), 1)) : N("", !0)
        ]),
        y(c(se), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: p[0] || (p[0] = ne((d) => f.$emit("retry"), ["stop"]))
        })
      ], 64)) : (h(), g(F, { key: 1 }, [
        y(c(Te), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        p[4] || (p[4] = r("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : N("", !0);
  }
}), Ke = (a, n) => {
  const l = a.__vccOpts || a;
  for (const [f, p] of n)
    l[f] = p;
  return l;
}, Fe = /* @__PURE__ */ Ke(He, [["__scopeId", "data-v-63c136c7"]]);
function H(a) {
  return !!a && typeof a == "object" && !Array.isArray(a);
}
function Ge(a, n) {
  if (n == null) return n;
  switch (a) {
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
function Je(a, n) {
  if (!n) return a;
  const l = {};
  for (const [f, p] of Object.entries(a))
    l[f] = Ge(n[f], p);
  return l;
}
function pe(a, n, l) {
  if (n !== void 0 && !n) return null;
  const f = H(a) ? a : {}, p = [
    f,
    H(f.data) ? f.data : null,
    H(f.payload) ? f.payload : null,
    H(f.detail) ? f.detail : null
  ].filter(Boolean);
  for (const d of p) {
    if (d.event !== "component.meta.changed" && d.event !== "component.deleting" && d.event !== "component.deleted") continue;
    const S = String(d.component_id || ""), x = String(f.topic || d.topic || "");
    if (n === void 0) {
      if (!S && (!x.startsWith("component.") || x === "component.")) continue;
    } else if (S && S !== n || !S && x !== `component.${n}`) continue;
    const $ = S || n || x.slice(10);
    return d.event === "component.deleting" && typeof d.deletion_job_id == "string" && d.deletion_job_id ? { event: d.event, component_id: $, deletion_job_id: d.deletion_job_id } : d.event !== "component.meta.changed" ? { event: d.event, component_id: $ } : {
      event: "component.meta.changed",
      component_id: $,
      meta: Je(H(d.meta) ? d.meta : {}, l),
      deleted: Array.isArray(d.deleted) ? d.deleted.map(String) : []
    };
  }
  return null;
}
function Ye(a, n, l) {
  const f = pe(a, n, l);
  return f?.event === "component.meta.changed" ? f : null;
}
function qe(a, n) {
  const l = pe(a, n);
  return l && l.event !== "component.meta.changed" ? l : null;
}
function We(a, n, l) {
  if (!a) return null;
  const f = fe(`component.${a}`, (p) => {
    const d = Ye(p, a, l);
    d && n(d);
  });
  return typeof f == "function" ? f : null;
}
function ce(a, n) {
  if (a && typeof a == "object") {
    const l = a, f = l.response?.data?.error;
    if (typeof f == "string") return f;
    if (f && typeof f == "object" && typeof f.message == "string")
      return f.message;
    if (typeof l.message == "string" && l.message) return l.message;
  }
  return n;
}
function Ze(a, n, l, f) {
  let p = !0;
  const d = /* @__PURE__ */ new Set(), S = /* @__PURE__ */ new Map();
  function x(b, m) {
    const v = a.value.find((A) => n(A) === b), u = S.get(b), k = m?.job_id || u?.deletion_job_id || v?.deletion_job_id, T = u ? u.deletion_job_id : v?.deleting_at ? v.deletion_job_id : void 0;
    if ((u || v?.deleting_at) && k === T) return;
    const D = {
      deleting_at: u?.deleting_at || v?.deleting_at || (/* @__PURE__ */ new Date()).toISOString(),
      deletion_job_id: k
    };
    S.set(b, D), v && (Object.assign(v, D), v.deletion_job = void 0);
  }
  async function $(b) {
    const m = n(b), v = S.get(m), u = () => p && a.value.includes(b) && S.get(m) === v;
    try {
      const { data: k } = await K.get(`/api/v1/components/${encodeURIComponent(m)}`);
      if (!k?.success) throw new Error(ce(k, "Could not read deletion progress"));
      u() && (b.deleting_at = v?.deleting_at || k.deleting_at, b.deletion_job_id = k.deletion_job_id, v && (v.deletion_job_id = b.deletion_job_id), b.deletion_job = k.deletion_job ?? null);
    } catch (k) {
      u() && Oe.handleError("other", { message: ce(k, "Could not read deletion progress") });
    }
  }
  let L = [];
  const M = Ee(() => a.value, (b, m = []) => {
    const v = b.filter((u) => !d.has(n(u)));
    for (const u of m)
      d.has(n(u)) || v.some((k) => n(k) === n(u)) || u.deleting_at;
    if (v.length !== b.length) {
      a.value = v;
      return;
    }
    for (const u of b) {
      const k = S.get(n(u));
      k && (u.deletion_job_id !== k.deletion_job_id && (u.deletion_job = void 0), Object.assign(u, k));
      const T = m.find((D) => n(D) === n(u));
      u.deletion_job === void 0 && T?.deletion_job_id === u.deletion_job_id && (u.deletion_job = T?.deletion_job), u.deleting_at && !L.includes(u) && $(u);
    }
    L = b;
  }, { immediate: !0 }), P = fe("@message", (b) => {
    const m = qe(b);
    if (!m) return;
    const v = a.value.find((u) => n(u) === m.component_id);
    m.event === "component.deleted" ? (v && d.has(m.component_id), d.add(m.component_id), S.delete(m.component_id), a.value = a.value.filter((u) => n(u) !== m.component_id)) : v && x(m.component_id, { job_id: m.deletion_job_id });
  });
  return ue(() => {
    p = !1, M(), typeof P == "function" && P();
  }), { acceptDeletion: x };
}
function Qe({ providers: a, connections: n, search: l, confirmId: f }) {
  const p = (o) => o.provider ?? "", d = (o) => o.title ?? o.name ?? o.oauth_provider ?? "Provider", S = (o) => o.icon || "tabler:plug", x = Z(() => {
    const o = {};
    for (const i of a.value) {
      const C = p(i);
      C && (o[C] = i);
    }
    return o;
  });
  function $(o) {
    return o.icon || x.value[o.provider || ""]?.icon || "tabler:plug-connected";
  }
  function L(o) {
    return o.provider ? x.value[o.provider] : void 0;
  }
  function M(o) {
    return new Set((o.scopes_granted ?? []).filter((i) => typeof i == "string" && i.length > 0));
  }
  function P(o) {
    return new Set((o?.default_scopes ?? []).filter((i) => typeof i == "string" && i.length > 0));
  }
  function b(o) {
    return (o?.available_scopes ?? []).map((i) => i.scope).filter((i) => typeof i == "string" && i.length > 0);
  }
  function m(o) {
    const i = P(o);
    return b(o).some((C) => !i.has(C));
  }
  function v(o) {
    if (!o.oauth) return !1;
    const i = L(o);
    if (!m(i)) return !1;
    const C = M(o), B = P(i);
    if (C.size === 0 || B.size === 0) return !1;
    for (const Q of C)
      if (!B.has(Q)) return !1;
    return !0;
  }
  function u(o) {
    return Ie(o.connection_state, o.expires_at);
  }
  function k(o) {
    const i = u(o);
    return i === "connected" && v(o) ? "warn" : Be[i];
  }
  function T(o) {
    const i = u(o);
    return i === "connected" && v(o) ? "Limited access" : Re[i];
  }
  function D(o) {
    const i = Number(o.expires_at || 0);
    if (!i) return "";
    const C = i - Math.floor(Date.now() / 1e3);
    return C <= 0 ? "token expired" : C < 3600 ? `expires in ${Math.max(1, Math.floor(C / 60))}m` : C < 86400 ? `expires in ${Math.floor(C / 3600)}h` : `expires in ${Math.floor(C / 86400)}d`;
  }
  function A(o) {
    const i = [];
    if (o.provider && i.push(o.provider), o.oauth) {
      v(o) && i.push("sign-in only");
      const C = D(o);
      C && i.push(C), Number(o.scope_count || 0) > 0 && i.push(`${o.scope_count} scope${o.scope_count === 1 ? "" : "s"}`);
    }
    return i.join(" · ");
  }
  function R(o) {
    if (f.value === o.component_id) return "Click the check again to remove this connection.";
    const i = u(o);
    return i === "expired" ? "The stored access token is expired; reconnect or wait for refresh." : i === "needs_reauth" ? `Reauthorize this connection to restore access.${o.reauth_reason ? " " + o.reauth_reason : ""}` : i === "disabled" ? "This connection is disabled and will not be used." : v(o) ? "Reauthorize this connection to grant service scopes." : o.oauth ? "OAuth connection available for agents and automations." : "Connection available for agents and automations.";
  }
  function O(o) {
    const i = l.value.trim().toLowerCase();
    return !i || o.toLowerCase().includes(i);
  }
  const I = Z(() => a.value.filter((o) => O(`${d(o)} ${o.description ?? ""} ${(o.classes ?? []).join(" ")}`))), G = Z(() => n.value.filter((o) => O(`${o.name ?? ""} ${o.provider ?? ""}`)));
  return {
    providerKey: p,
    providerLabel: d,
    providerIcon: S,
    connIcon: $,
    providerForConnection: L,
    grantedScopeSet: M,
    defaultScopeSet: P,
    availableScopeValues: b,
    hasOptionalProviderScopes: m,
    hasSignInOnlyScopes: v,
    connectionState: u,
    statusClass: k,
    statusLabel: T,
    expiryText: D,
    statusDetail: A,
    connectionDescription: R,
    filteredProviders: I,
    filteredConnections: G
  };
}
const Xe = { class: "conn-page" }, et = { class: "kx-head" }, tt = { class: "kx-head-icon" }, nt = { class: "kx-head-actions" }, ot = {
  class: "kx-search",
  role: "search"
}, st = { class: "conn-body" }, it = {
  key: 0,
  class: "conn-loading"
}, rt = {
  key: 1,
  class: "conn-empty au d1"
}, at = { class: "lt-empty-hero is-danger" }, lt = { class: "e-sub" }, ct = {
  key: 0,
  class: "msg err au"
}, dt = {
  key: 1,
  class: "block au d1"
}, ut = { class: "live-grid" }, ft = { class: "lc-top" }, pt = { class: "lc-ico" }, vt = { class: "lc-top-r" }, _t = ["title", "aria-label", "onClick", "disabled"], ht = ["title", "aria-label", "onClick", "disabled"], mt = ["title", "aria-label", "onClick", "disabled"], gt = { class: "lc-name" }, bt = { class: "lc-desc" }, yt = { class: "lc-primary" }, kt = {
  key: 0,
  class: "lc-secondary"
}, Ct = {
  key: 0,
  class: "list-foot"
}, St = ["disabled"], xt = {
  key: 2,
  class: "conn-empty au d1"
}, jt = { class: "lt-empty-hero is-success" }, $t = {
  key: 3,
  class: "block au d2"
}, wt = { class: "block-head" }, Et = { class: "lt-section-header" }, Nt = { class: "setup-grid" }, Mt = ["data-provider-key", "onClick"], Dt = { class: "setup-ico" }, Pt = { class: "setup-text" }, Tt = { class: "setup-name" }, Ot = { class: "setup-desc" }, Lt = {
  key: 4,
  class: "conn-empty au d1"
}, At = { class: "lt-empty-hero is-info" }, Rt = { class: "e-title" }, Bt = {
  key: 5,
  class: "conn-empty au d2"
}, It = { class: "lt-empty-hero is-info" }, Ut = 100, Vt = /* @__PURE__ */ de({
  __name: "connections",
  setup(a) {
    const n = w([]), l = w([]), f = w(!0), p = w(!1), d = w(""), S = w(""), x = w(""), $ = w(""), L = Qe({ providers: l, connections: n, search: $, confirmId: x }), {
      providerKey: M,
      providerLabel: P,
      providerIcon: b,
      connIcon: m,
      statusClass: v,
      statusLabel: u,
      statusDetail: k,
      connectionDescription: T,
      filteredProviders: D,
      filteredConnections: A
    } = L, R = w(0), O = w(!1), I = w(!1), G = w(void 0), o = w(void 0), i = w(!1), C = w(null), B = w(null);
    function Q(s) {
      return `/api/v1/connections?${new URLSearchParams({
        limit: String(Ut),
        offset: String(s)
      }).toString()}`;
    }
    async function ie(s) {
      const { data: e } = await K.get(Q(s));
      return e ?? { connections: [], total_count: 0, has_more: !1 };
    }
    async function J() {
      f.value = !0, d.value = "", S.value = "";
      try {
        const [s, e, t] = await Promise.all([
          ie(0),
          K.get("/api/v1/oauth/providers/discover"),
          K.get("/api/v1/connections/providers/discover")
        ]);
        n.value = s.connections ?? [], R.value = Number(s.total_count ?? n.value.length), O.value = !!s.has_more, ee(), l.value = _e([
          ...e.data?.providers ?? [],
          ...t.data?.providers ?? []
        ]);
      } catch (s) {
        n.value.length ? d.value = W(s) : S.value = W(s), ee();
      } finally {
        f.value = !1;
      }
    }
    async function ve() {
      if (!(p.value || !O.value)) {
        p.value = !0, d.value = "";
        try {
          const s = await ie(n.value.length), e = s.connections ?? [];
          n.value = [...n.value, ...e], R.value = Number(s.total_count ?? R.value), O.value = !!s.has_more, ee();
        } catch (s) {
          d.value = W(s);
        } finally {
          p.value = !1;
        }
      }
    }
    function _e(s) {
      const e = {};
      for (const t of s) {
        const _ = M(t);
        _ && (e[_] = e[_] ? { ...t, ...e[_] } : t);
      }
      return Object.values(e);
    }
    function he(s) {
      return Array.isArray(s) ? s.filter((e) => typeof e == "string" && e.length > 0) : typeof s != "string" ? [] : s.split(/\s+/).filter(Boolean);
    }
    function me(s, e, t = []) {
      const _ = {};
      if (typeof e.title == "string" && (_.name = e.title), typeof e.provider == "string" && (_.provider = e.provider), typeof e.icon == "string" && (_.icon = e.icon), typeof e.connection_state == "string" && (_.connection_state = e.connection_state), typeof e.reauth_reason == "string" && (_.reauth_reason = e.reauth_reason), typeof e.expires_at == "number" && (_.expires_at = e.expires_at), typeof e.refresh_expires_at == "number" && (_.refresh_expires_at = e.refresh_expires_at), typeof e.last_token_refresh == "string" && (_.last_token_refresh = e.last_token_refresh), typeof e.scopes_granted == "string") {
        const z = he(e.scopes_granted);
        _.scopes_granted = z, _.scope_count = z.length;
      }
      typeof e.oauth_connection == "boolean" && (_.oauth = e.oauth_connection);
      const V = { ...s, ..._ };
      for (const z of t) {
        const $e = z === "title" ? "name" : z;
        delete V[$e];
      }
      return V;
    }
    const U = /* @__PURE__ */ new Map(), Y = /* @__PURE__ */ new Set();
    let X = 0;
    function ge(s, e) {
      n.value = n.value.map((t) => t.component_id === s ? me(t, e.meta || {}, e.deleted || []) : t);
    }
    function be() {
      X++, Y.clear();
      for (const s of U.values()) s();
      U.clear();
    }
    function ee() {
      const s = new Set(n.value.map((t) => t.component_id).filter(Boolean));
      for (const [t, _] of U)
        s.has(t) || (_(), U.delete(t));
      const e = X;
      for (const t of s) {
        if (U.has(t) || Y.has(t)) continue;
        Y.add(t);
        const _ = We(t, (V) => ge(t, V), Ue);
        if (Y.delete(t), !!_) {
          if (e !== X || !n.value.some((V) => V.component_id === t)) {
            _();
            continue;
          }
          U.set(t, _);
        }
      }
    }
    function te(s, e) {
      G.value = s, o.value = e, I.value = !0;
    }
    async function ye(s) {
      C.value = s, i.value = !0, await Pe(), await Ce();
    }
    function ke() {
      i.value = !1, C.value = null;
    }
    async function Ce() {
      const s = C.value;
      if (!B.value || !s) return;
      if (B.value.innerHTML = "", !customElements.get("kickside-share"))
        try {
          await Le("kickside-share", { timeoutMs: 8e3 });
        } catch {
        }
      const e = document.createElement("kickside-share");
      e.setAttribute("config", JSON.stringify({
        resource_id: s.component_id,
        access_url: `/api/v1/component-access/grants/${encodeURIComponent(s.component_id)}`,
        share_url: `/api/v1/component-access/share/${encodeURIComponent(s.component_id)}`,
        title: s.name || s.provider || "Connection"
      })), e.style.display = "block", e.addEventListener("close", ke), B.value.appendChild(e);
    }
    function Se(s) {
      if (!s.provider) return;
      const e = l.value.find((t) => M(t) === s.provider);
      te(s.provider, s.oauth || e?.create_ui_id ? { componentId: s.component_id, name: s.name } : void 0);
    }
    function xe() {
      I.value = !1, o.value = void 0, n.value = [], J();
    }
    async function re(s) {
      if (x.value !== s.component_id) {
        x.value = s.component_id;
        return;
      }
      x.value = "", d.value = "";
      try {
        const { data: e } = await K.delete(`/api/v1/connections/${encodeURIComponent(s.component_id)}`);
        if (!e?.success) throw new Error(e?.error || "delete failed");
        je(s.component_id, e), await J();
      } catch (e) {
        d.value = W(e);
      }
    }
    Ae(J), ue(be);
    const { acceptDeletion: je } = Ze(n, (s) => s.component_id);
    return (s, e) => (h(), g("div", Xe, [
      r("header", et, [
        r("div", tt, [
          y(c(j), {
            icon: "tabler:plug-connected",
            "aria-hidden": "true"
          })
        ]),
        e[4] || (e[4] = r("div", { class: "kx-head-text" }, [
          r("h1", { class: "kx-title" }, "Connections"),
          r("p", { class: "kx-head-sub" }, "Connect external services and manage them here.")
        ], -1)),
        r("div", nt, [
          r("label", ot, [
            y(c(j), {
              icon: "tabler:search",
              class: "kx-search-ico",
              "aria-hidden": "true"
            }),
            Ne(r("input", {
              "onUpdate:modelValue": e[0] || (e[0] = (t) => $.value = t),
              class: "kx-search-input",
              type: "search",
              placeholder: "Search services",
              "aria-label": "Search services"
            }, null, 512), [
              [Me, $.value]
            ]),
            $.value ? (h(), g("button", {
              key: 0,
              class: "kx-search-clear",
              onClick: e[1] || (e[1] = (t) => $.value = ""),
              "aria-label": "Clear search"
            }, [
              y(c(j), {
                icon: "tabler:x",
                "aria-hidden": "true"
              })
            ])) : N("", !0)
          ]),
          y(c(se), {
            label: "Connect app",
            onClick: e[2] || (e[2] = (t) => te())
          }, {
            icon: ae(() => [
              y(c(j), {
                icon: "tabler:plus",
                "aria-hidden": "true"
              })
            ]),
            _: 1
          })
        ])
      ]),
      r("div", st, [
        f.value && !n.value.length ? (h(), g("div", it, "Loading…")) : S.value ? (h(), g("section", rt, [
          r("div", at, [
            y(c(j), { icon: "tabler:plug-x" })
          ]),
          e[5] || (e[5] = r("div", { class: "e-title" }, "Couldn't load connections", -1)),
          r("div", lt, E(S.value), 1),
          y(c(se), {
            label: "Try again",
            class: "conn-retry",
            onClick: J
          }, {
            icon: ae(() => [
              y(c(j), {
                icon: "tabler:refresh",
                "aria-hidden": "true"
              })
            ]),
            _: 1
          })
        ])) : (h(), g(F, { key: 2 }, [
          d.value ? (h(), g("div", ct, [
            y(c(j), { icon: "tabler:alert-circle" }),
            oe(E(d.value), 1)
          ])) : N("", !0),
          c(A).length ? (h(), g("section", dt, [
            e[8] || (e[8] = r("div", { class: "block-head" }, [
              r("h2", { class: "lt-section-header" }, "Your connections")
            ], -1)),
            r("div", ut, [
              (h(!0), g(F, null, le(c(A), (t) => (h(), g("div", {
                key: t.component_id,
                class: q(["live-card s-live", `state-${c(v)(t)}`])
              }, [
                y(Fe, {
                  state: t,
                  onRetry: (_) => {
                    x.value = t.component_id, re(t);
                  }
                }, null, 8, ["state", "onRetry"]),
                r("div", ft, [
                  r("div", pt, [
                    y(c(j), {
                      icon: c(m)(t),
                      "aria-hidden": "true"
                    }, null, 8, ["icon"])
                  ]),
                  r("div", vt, [
                    r("button", {
                      class: "lc-add",
                      title: `Share ${t.name || t.provider}`,
                      "aria-label": `Share ${t.name || t.provider}`,
                      onClick: (_) => ye(t),
                      disabled: !!t.deleting_at
                    }, [
                      y(c(j), { icon: "tabler:share" })
                    ], 8, _t),
                    r("button", {
                      class: "lc-add",
                      title: `Reconnect ${t.name || t.provider}`,
                      "aria-label": `Reconnect ${t.name || t.provider}`,
                      onClick: (_) => Se(t),
                      disabled: !!t.deleting_at
                    }, [
                      y(c(j), { icon: "tabler:refresh" })
                    ], 8, ht),
                    r("button", {
                      class: q(["lc-add lc-danger", x.value === t.component_id && "armed"]),
                      title: x.value === t.component_id ? "Click again to remove" : `Remove ${t.name || t.provider}`,
                      "aria-label": `Remove ${t.name || t.provider}`,
                      onClick: (_) => re(t),
                      disabled: !!t.deleting_at
                    }, [
                      y(c(j), {
                        icon: x.value === t.component_id ? "tabler:check" : "tabler:trash"
                      }, null, 8, ["icon"])
                    ], 10, mt)
                  ])
                ]),
                r("div", gt, E(t.name || t.provider || "Connection"), 1),
                r("div", bt, E(c(T)(t)), 1),
                r("div", {
                  class: q(["lc-status", `state-${c(v)(t)}`])
                }, [
                  e[6] || (e[6] = r("span", { class: "dot" }, null, -1)),
                  r("span", yt, E(c(u)(t)), 1),
                  c(k)(t) ? (h(), g("span", kt, "· " + E(c(k)(t)), 1)) : N("", !0)
                ], 2)
              ], 2))), 128))
            ]),
            R.value || O.value ? (h(), g("div", Ct, [
              r("span", null, E(n.value.length) + " of " + E(R.value || n.value.length) + " loaded", 1),
              O.value ? (h(), g("button", {
                key: 0,
                class: "ghost-action",
                disabled: p.value,
                onClick: ve
              }, [
                y(c(j), {
                  icon: p.value ? "tabler:loader-2" : "tabler:chevron-down",
                  class: q(p.value && "spin")
                }, null, 8, ["icon", "class"]),
                e[7] || (e[7] = oe(" Load more ", -1))
              ], 8, St)) : N("", !0)
            ])) : N("", !0)
          ])) : !$.value && l.value.length ? (h(), g("section", xt, [
            r("div", jt, [
              y(c(j), { icon: "tabler:plug-connected" })
            ]),
            e[9] || (e[9] = r("div", { class: "e-title" }, "Connect your first app", -1)),
            e[10] || (e[10] = r("div", { class: "e-sub" }, "Pick a service below — your agents and automations will read events and act through it.", -1))
          ])) : N("", !0),
          c(D).length ? (h(), g("section", $t, [
            r("div", wt, [
              r("h2", Et, E(c(A).length ? "Add another" : "Available services"), 1)
            ]),
            r("div", Nt, [
              (h(!0), g(F, null, le(c(D), (t) => (h(), g("button", {
                key: c(M)(t),
                "data-provider-key": c(M)(t),
                class: "setup-card",
                onClick: (_) => te(c(M)(t))
              }, [
                r("div", Dt, [
                  y(c(j), {
                    icon: c(b)(t),
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                r("div", Pt, [
                  r("div", Tt, E(c(P)(t)), 1),
                  r("div", Ot, E(t.description || `Set up ${c(P)(t)}`), 1)
                ]),
                y(c(j), {
                  icon: "tabler:arrow-right",
                  class: "setup-arrow",
                  "aria-hidden": "true"
                })
              ], 8, Mt))), 128))
            ])
          ])) : $.value ? (h(), g("section", Lt, [
            r("div", At, [
              y(c(j), { icon: "tabler:search-off" })
            ]),
            r("div", Rt, "No services match “" + E($.value) + "”", 1)
          ])) : !l.value.length && !n.value.length ? (h(), g("section", Bt, [
            r("div", It, [
              y(c(j), { icon: "tabler:plug-x" })
            ]),
            e[11] || (e[11] = r("div", { class: "e-title" }, "No providers available", -1)),
            e[12] || (e[12] = r("div", { class: "e-sub" }, "Install a provider module to add a connection here.", -1))
          ])) : N("", !0)
        ], 64))
      ]),
      I.value ? (h(), De(Ve, {
        key: 0,
        providers: l.value,
        provider: G.value,
        reauth: o.value,
        onClose: e[3] || (e[3] = (t) => I.value = !1),
        onConnected: xe
      }, null, 8, ["providers", "provider", "reauth"])) : N("", !0),
      i.value ? (h(), g("div", {
        key: 1,
        ref_key: "shareHost",
        ref: B
      }, null, 512)) : N("", !0)
    ]));
  }
}), Zt = {
  rootComponent: Vt,
  plugins: [we]
};
export {
  Zt as mountConfig
};
//# sourceMappingURL=lazy-mount-BbScdQga.js.map
