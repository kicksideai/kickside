import { C as be, c as ke, r as Ce, d as xe, b as X, e as Se, W as $e, s as we, P as Ne } from "./styles-FbmmpE4z.js";
import { computed as ee, defineComponent as Ee, ref as y, onBeforeUnmount as Te, openBlock as v, createElementBlock as h, createElementVNode as i, createVNode as _, unref as a, withDirectives as Me, vModelText as Pe, createCommentVNode as $, withCtx as oe, toDisplayString as k, Fragment as te, createTextVNode as se, renderList as re, normalizeClass as G, createBlock as Le, nextTick as Ae } from "vue";
import { Icon as m } from "@iconify/vue";
import { s as ie, _ as Oe } from "./ConnectionPicker.vue_vue_type_script_setup_true_lang-kTT7ighW.js";
import { on as Re, api as J, loadByTagName as Be, define as Ie } from "@wippy-fe/proxy";
function V(p) {
  return !!p && typeof p == "object" && !Array.isArray(p);
}
function Ve(p, s) {
  if (s == null) return s;
  switch (p) {
    case "boolean":
    case "checkbox":
      return typeof s == "boolean" ? s : s === "true" ? !0 : s === "false" ? !1 : s;
    case "number":
    case "integer": {
      if (typeof s == "number") return s;
      if (typeof s == "string" && s.trim() !== "") {
        const l = Number(s);
        if (!Number.isNaN(l)) return l;
      }
      return s;
    }
    case "object":
    case "array":
      if (typeof s == "string")
        try {
          const l = JSON.parse(s);
          if (l && typeof l == "object") return l;
        } catch {
        }
      return s;
    default:
      return s;
  }
}
function Ue(p, s) {
  if (!s) return p;
  const l = {};
  for (const [f, g] of Object.entries(p))
    l[f] = Ve(s[f], g);
  return l;
}
function je(p, s, l) {
  if (!s) return null;
  const f = V(p) ? p : {}, g = [
    f,
    V(f.data) ? f.data : null,
    V(f.payload) ? f.payload : null,
    V(f.detail) ? f.detail : null
  ].filter(Boolean);
  for (const u of g) {
    if (u.event !== "component.meta.changed") continue;
    const C = String(u.component_id || ""), b = String(f.topic || u.topic || "");
    if (!(C && C !== s) && !(!C && b !== `component.${s}`))
      return {
        event: "component.meta.changed",
        component_id: C || s,
        meta: Ue(V(u.meta) ? u.meta : {}, l),
        deleted: Array.isArray(u.deleted) ? u.deleted.map(String) : []
      };
  }
  return null;
}
function De(p, s, l) {
  if (!p) return null;
  const f = Re(`component.${p}`, (g) => {
    const u = je(g, p, l);
    u && s(u);
  });
  return typeof f == "function" ? f : null;
}
function Ke({ providers: p, connections: s, search: l, confirmId: f }) {
  const g = (t) => t.provider ?? "", u = (t) => t.title ?? t.name ?? t.oauth_provider ?? "Provider", C = (t) => t.icon || "tabler:plug", b = ee(() => {
    const t = {};
    for (const r of p.value) {
      const d = g(r);
      d && (t[d] = r);
    }
    return t;
  });
  function x(t) {
    return t.icon || b.value[t.provider || ""]?.icon || "tabler:plug-connected";
  }
  function U(t) {
    return t.provider ? b.value[t.provider] : void 0;
  }
  function w(t) {
    return new Set((t.scopes_granted ?? []).filter((r) => typeof r == "string" && r.length > 0));
  }
  function M(t) {
    return new Set((t?.default_scopes ?? []).filter((r) => typeof r == "string" && r.length > 0));
  }
  function j(t) {
    return (t?.available_scopes ?? []).map((r) => r.scope).filter((r) => typeof r == "string" && r.length > 0);
  }
  function D(t) {
    const r = M(t);
    return j(t).some((d) => !r.has(d));
  }
  function N(t) {
    if (!t.oauth) return !1;
    const r = U(t);
    if (!D(r)) return !1;
    const d = w(t), T = M(r);
    if (d.size === 0 || T.size === 0) return !1;
    for (const Y of d)
      if (!T.has(Y)) return !1;
    return !0;
  }
  function P(t) {
    return Ce(t.connection_state, t.expires_at);
  }
  function K(t) {
    const r = P(t);
    return r === "connected" && N(t) ? "warn" : ke[r];
  }
  function W(t) {
    const r = P(t);
    return r === "connected" && N(t) ? "Limited access" : be[r];
  }
  function R(t) {
    const r = Number(t.expires_at || 0);
    if (!r) return "";
    const d = r - Math.floor(Date.now() / 1e3);
    return d <= 0 ? "token expired" : d < 3600 ? `expires in ${Math.max(1, Math.floor(d / 60))}m` : d < 86400 ? `expires in ${Math.floor(d / 3600)}h` : `expires in ${Math.floor(d / 86400)}d`;
  }
  function B(t) {
    const r = [];
    if (t.provider && r.push(t.provider), t.oauth) {
      N(t) && r.push("sign-in only");
      const d = R(t);
      d && r.push(d), Number(t.scope_count || 0) > 0 && r.push(`${t.scope_count} scope${t.scope_count === 1 ? "" : "s"}`);
    }
    return r.join(" · ");
  }
  function E(t) {
    if (f.value === t.component_id) return "Click the check again to remove this connection.";
    const r = P(t);
    return r === "expired" ? "The stored access token is expired; reconnect or wait for refresh." : r === "needs_reauth" ? `Reauthorize this connection to restore access.${t.reauth_reason ? " " + t.reauth_reason : ""}` : r === "disabled" ? "This connection is disabled and will not be used." : N(t) ? "Reauthorize this connection to grant service scopes." : t.oauth ? "OAuth connection available for agents and automations." : "Connection available for agents and automations.";
  }
  function S(t) {
    const r = l.value.trim().toLowerCase();
    return !r || t.toLowerCase().includes(r);
  }
  const L = ee(() => p.value.filter((t) => S(`${u(t)} ${t.description ?? ""} ${(t.classes ?? []).join(" ")}`))), z = ee(() => s.value.filter((t) => S(`${t.name ?? ""} ${t.provider ?? ""}`)));
  return {
    providerKey: g,
    providerLabel: u,
    providerIcon: C,
    connIcon: x,
    providerForConnection: U,
    grantedScopeSet: w,
    defaultScopeSet: M,
    availableScopeValues: j,
    hasOptionalProviderScopes: D,
    hasSignInOnlyScopes: N,
    connectionState: P,
    statusClass: K,
    statusLabel: W,
    expiryText: R,
    statusDetail: B,
    connectionDescription: E,
    filteredProviders: L,
    filteredConnections: z
  };
}
const ze = { class: "conn-page" }, He = { class: "kx-head" }, Fe = { class: "kx-head-icon" }, Ge = { class: "kx-head-actions" }, Je = {
  class: "kx-search",
  role: "search"
}, We = { class: "conn-body" }, Ye = {
  key: 0,
  class: "conn-loading"
}, qe = {
  key: 1,
  class: "conn-empty au d1"
}, Ze = { class: "lt-empty-hero is-danger" }, Qe = { class: "e-sub" }, Xe = {
  key: 0,
  class: "msg err au"
}, et = {
  key: 1,
  class: "block au d1"
}, tt = { class: "live-grid" }, nt = { class: "lc-top" }, ot = { class: "lc-ico" }, st = { class: "lc-top-r" }, rt = ["title", "aria-label", "onClick"], it = ["title", "aria-label", "onClick"], at = ["title", "aria-label", "onClick"], ct = { class: "lc-name" }, lt = { class: "lc-desc" }, ut = { class: "lc-primary" }, dt = {
  key: 0,
  class: "lc-secondary"
}, pt = {
  key: 0,
  class: "list-foot"
}, ft = ["disabled"], vt = {
  key: 2,
  class: "conn-empty au d1"
}, ht = { class: "lt-empty-hero is-success" }, _t = {
  key: 3,
  class: "block au d2"
}, mt = { class: "block-head" }, yt = { class: "lt-section-header" }, gt = { class: "setup-grid" }, bt = ["data-provider-key", "onClick"], kt = { class: "setup-ico" }, Ct = { class: "setup-text" }, xt = { class: "setup-name" }, St = { class: "setup-desc" }, $t = {
  key: 4,
  class: "conn-empty au d1"
}, wt = { class: "lt-empty-hero is-info" }, Nt = { class: "e-title" }, Et = {
  key: 5,
  class: "conn-empty au d2"
}, Tt = { class: "lt-empty-hero is-info" }, Mt = 100, Pt = /* @__PURE__ */ Ee({
  __name: "connections",
  setup(p) {
    const s = y([]), l = y([]), f = y(!0), g = y(!1), u = y(""), C = y(""), b = y(""), x = y(""), U = Ke({ providers: l, connections: s, search: x, confirmId: b }), {
      providerKey: w,
      providerLabel: M,
      providerIcon: j,
      connIcon: D,
      statusClass: N,
      statusLabel: P,
      statusDetail: K,
      connectionDescription: W,
      filteredProviders: R,
      filteredConnections: B
    } = U, E = y(0), S = y(!1), L = y(!1), z = y(void 0), t = y(void 0), r = y(!1), d = y(null), T = y(null);
    function Y(o) {
      return `/api/v1/connections?${new URLSearchParams({
        limit: String(Mt),
        offset: String(o)
      }).toString()}`;
    }
    async function ne(o) {
      const { data: e } = await J.get(Y(o));
      return e ?? { connections: [], total_count: 0, has_more: !1 };
    }
    async function H() {
      f.value = !0, u.value = "", C.value = "";
      try {
        const [o, e, n] = await Promise.all([
          ne(0),
          J.get("/api/v1/oauth/providers/discover"),
          J.get("/api/v1/connections/providers/discover")
        ]);
        s.value = o.connections ?? [], E.value = Number(o.total_count ?? s.value.length), S.value = !!o.has_more, Z(), l.value = ce([
          ...e.data?.providers ?? [],
          ...n.data?.providers ?? []
        ]);
      } catch (o) {
        C.value = X(o), s.value = [], l.value = [], E.value = 0, S.value = !1, Z();
      } finally {
        f.value = !1;
      }
    }
    async function ae() {
      if (!(g.value || !S.value)) {
        g.value = !0, u.value = "";
        try {
          const o = await ne(s.value.length), e = o.connections ?? [];
          s.value = [...s.value, ...e], E.value = Number(o.total_count ?? E.value), S.value = !!o.has_more, Z();
        } catch (o) {
          u.value = X(o);
        } finally {
          g.value = !1;
        }
      }
    }
    function ce(o) {
      const e = {};
      for (const n of o) {
        const c = w(n);
        c && (e[c] = e[c] ? { ...n, ...e[c] } : n);
      }
      return Object.values(e);
    }
    function le(o) {
      return Array.isArray(o) ? o.filter((e) => typeof e == "string" && e.length > 0) : typeof o != "string" ? [] : o.split(/\s+/).filter(Boolean);
    }
    function ue(o, e, n = []) {
      const c = {};
      if (typeof e.title == "string" && (c.name = e.title), typeof e.provider == "string" && (c.provider = e.provider), typeof e.icon == "string" && (c.icon = e.icon), typeof e.connection_state == "string" && (c.connection_state = e.connection_state), typeof e.reauth_reason == "string" && (c.reauth_reason = e.reauth_reason), typeof e.expires_at == "number" && (c.expires_at = e.expires_at), typeof e.refresh_expires_at == "number" && (c.refresh_expires_at = e.refresh_expires_at), typeof e.last_token_refresh == "string" && (c.last_token_refresh = e.last_token_refresh), typeof e.scopes_granted == "string") {
        const I = le(e.scopes_granted);
        c.scopes_granted = I, c.scope_count = I.length;
      }
      typeof e.oauth_connection == "boolean" && (c.oauth = e.oauth_connection);
      const O = { ...o, ...c };
      for (const I of n) {
        const ge = I === "title" ? "name" : I;
        delete O[ge];
      }
      return O;
    }
    const A = /* @__PURE__ */ new Map(), F = /* @__PURE__ */ new Set();
    let q = 0;
    function de(o, e) {
      s.value = s.value.map((n) => n.component_id === o ? ue(n, e.meta || {}, e.deleted || []) : n);
    }
    function pe() {
      q++, F.clear();
      for (const o of A.values()) o();
      A.clear();
    }
    function Z() {
      const o = new Set(s.value.map((n) => n.component_id).filter(Boolean));
      for (const [n, c] of A)
        o.has(n) || (c(), A.delete(n));
      const e = q;
      for (const n of o) {
        if (A.has(n) || F.has(n)) continue;
        F.add(n);
        const c = De(n, (O) => de(n, O), Se);
        if (F.delete(n), !!c) {
          if (e !== q || !s.value.some((O) => O.component_id === n)) {
            c();
            continue;
          }
          A.set(n, c);
        }
      }
    }
    function Q(o, e) {
      z.value = o, t.value = e, L.value = !0;
    }
    async function fe(o) {
      d.value = o, r.value = !0, await Ae(), await he();
    }
    function ve() {
      r.value = !1, d.value = null;
    }
    async function he() {
      const o = d.value;
      if (!T.value || !o) return;
      if (T.value.innerHTML = "", !customElements.get("kickside-share"))
        try {
          await Be("kickside-share", { timeoutMs: 8e3 });
        } catch {
        }
      const e = document.createElement("kickside-share");
      e.setAttribute("config", JSON.stringify({
        resource_id: o.component_id,
        access_url: `/api/v1/component-access/grants/${encodeURIComponent(o.component_id)}`,
        share_url: `/api/v1/component-access/share/${encodeURIComponent(o.component_id)}`,
        title: o.name || o.provider || "Connection"
      })), e.style.display = "block", e.addEventListener("close", ve), T.value.appendChild(e);
    }
    function _e(o) {
      if (!o.provider) return;
      const e = l.value.find((n) => w(n) === o.provider);
      Q(o.provider, o.oauth || e?.create_ui_id ? { componentId: o.component_id, name: o.name } : void 0);
    }
    function me() {
      L.value = !1, t.value = void 0, s.value = [], H();
    }
    async function ye(o) {
      if (b.value !== o.component_id) {
        b.value = o.component_id;
        return;
      }
      b.value = "", u.value = "";
      try {
        const { data: e } = await J.delete(`/api/v1/connections/${encodeURIComponent(o.component_id)}`);
        if (!e?.success) throw new Error(e?.error || "delete failed");
        await H();
      } catch (e) {
        u.value = X(e);
      }
    }
    return xe(H), Te(pe), (o, e) => (v(), h("div", ze, [
      i("header", He, [
        i("div", Fe, [
          _(a(m), {
            icon: "tabler:plug-connected",
            "aria-hidden": "true"
          })
        ]),
        e[4] || (e[4] = i("div", { class: "kx-head-text" }, [
          i("h1", { class: "kx-title" }, "Connections"),
          i("p", { class: "kx-head-sub" }, "Connect external services and manage them here.")
        ], -1)),
        i("div", Ge, [
          i("label", Je, [
            _(a(m), {
              icon: "tabler:search",
              class: "kx-search-ico",
              "aria-hidden": "true"
            }),
            Me(i("input", {
              "onUpdate:modelValue": e[0] || (e[0] = (n) => x.value = n),
              class: "kx-search-input",
              type: "search",
              placeholder: "Search services",
              "aria-label": "Search services"
            }, null, 512), [
              [Pe, x.value]
            ]),
            x.value ? (v(), h("button", {
              key: 0,
              class: "kx-search-clear",
              onClick: e[1] || (e[1] = (n) => x.value = ""),
              "aria-label": "Clear search"
            }, [
              _(a(m), {
                icon: "tabler:x",
                "aria-hidden": "true"
              })
            ])) : $("", !0)
          ]),
          _(a(ie), {
            label: "Connect app",
            onClick: e[2] || (e[2] = (n) => Q())
          }, {
            icon: oe(() => [
              _(a(m), {
                icon: "tabler:plus",
                "aria-hidden": "true"
              })
            ]),
            _: 1
          })
        ])
      ]),
      i("div", We, [
        f.value ? (v(), h("div", Ye, "Loading…")) : C.value ? (v(), h("section", qe, [
          i("div", Ze, [
            _(a(m), { icon: "tabler:plug-x" })
          ]),
          e[5] || (e[5] = i("div", { class: "e-title" }, "Couldn't load connections", -1)),
          i("div", Qe, k(C.value), 1),
          _(a(ie), {
            label: "Try again",
            class: "conn-retry",
            onClick: H
          }, {
            icon: oe(() => [
              _(a(m), {
                icon: "tabler:refresh",
                "aria-hidden": "true"
              })
            ]),
            _: 1
          })
        ])) : (v(), h(te, { key: 2 }, [
          u.value ? (v(), h("div", Xe, [
            _(a(m), { icon: "tabler:alert-circle" }),
            se(k(u.value), 1)
          ])) : $("", !0),
          a(B).length ? (v(), h("section", et, [
            e[8] || (e[8] = i("div", { class: "block-head" }, [
              i("h2", { class: "lt-section-header" }, "Your connections")
            ], -1)),
            i("div", tt, [
              (v(!0), h(te, null, re(a(B), (n) => (v(), h("div", {
                key: n.component_id,
                class: G(["live-card s-live", `state-${a(N)(n)}`])
              }, [
                i("div", nt, [
                  i("div", ot, [
                    _(a(m), {
                      icon: a(D)(n),
                      "aria-hidden": "true"
                    }, null, 8, ["icon"])
                  ]),
                  i("div", st, [
                    i("button", {
                      class: "lc-add",
                      title: `Share ${n.name || n.provider}`,
                      "aria-label": `Share ${n.name || n.provider}`,
                      onClick: (c) => fe(n)
                    }, [
                      _(a(m), { icon: "tabler:share" })
                    ], 8, rt),
                    i("button", {
                      class: "lc-add",
                      title: `Reconnect ${n.name || n.provider}`,
                      "aria-label": `Reconnect ${n.name || n.provider}`,
                      onClick: (c) => _e(n)
                    }, [
                      _(a(m), { icon: "tabler:refresh" })
                    ], 8, it),
                    i("button", {
                      class: G(["lc-add lc-danger", b.value === n.component_id && "armed"]),
                      title: b.value === n.component_id ? "Click again to remove" : `Remove ${n.name || n.provider}`,
                      "aria-label": `Remove ${n.name || n.provider}`,
                      onClick: (c) => ye(n)
                    }, [
                      _(a(m), {
                        icon: b.value === n.component_id ? "tabler:check" : "tabler:trash"
                      }, null, 8, ["icon"])
                    ], 10, at)
                  ])
                ]),
                i("div", ct, k(n.name || n.provider || "Connection"), 1),
                i("div", lt, k(a(W)(n)), 1),
                i("div", {
                  class: G(["lc-status", `state-${a(N)(n)}`])
                }, [
                  e[6] || (e[6] = i("span", { class: "dot" }, null, -1)),
                  i("span", ut, k(a(P)(n)), 1),
                  a(K)(n) ? (v(), h("span", dt, "· " + k(a(K)(n)), 1)) : $("", !0)
                ], 2)
              ], 2))), 128))
            ]),
            E.value || S.value ? (v(), h("div", pt, [
              i("span", null, k(s.value.length) + " of " + k(E.value || s.value.length) + " loaded", 1),
              S.value ? (v(), h("button", {
                key: 0,
                class: "ghost-action",
                disabled: g.value,
                onClick: ae
              }, [
                _(a(m), {
                  icon: g.value ? "tabler:loader-2" : "tabler:chevron-down",
                  class: G(g.value && "spin")
                }, null, 8, ["icon", "class"]),
                e[7] || (e[7] = se(" Load more ", -1))
              ], 8, ft)) : $("", !0)
            ])) : $("", !0)
          ])) : !x.value && l.value.length ? (v(), h("section", vt, [
            i("div", ht, [
              _(a(m), { icon: "tabler:plug-connected" })
            ]),
            e[9] || (e[9] = i("div", { class: "e-title" }, "Connect your first app", -1)),
            e[10] || (e[10] = i("div", { class: "e-sub" }, "Pick a service below — your agents and automations will read events and act through it.", -1))
          ])) : $("", !0),
          a(R).length ? (v(), h("section", _t, [
            i("div", mt, [
              i("h2", yt, k(a(B).length ? "Add another" : "Available services"), 1)
            ]),
            i("div", gt, [
              (v(!0), h(te, null, re(a(R), (n) => (v(), h("button", {
                key: a(w)(n),
                "data-provider-key": a(w)(n),
                class: "setup-card",
                onClick: (c) => Q(a(w)(n))
              }, [
                i("div", kt, [
                  _(a(m), {
                    icon: a(j)(n),
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                i("div", Ct, [
                  i("div", xt, k(a(M)(n)), 1),
                  i("div", St, k(n.description || `Set up ${a(M)(n)}`), 1)
                ]),
                _(a(m), {
                  icon: "tabler:arrow-right",
                  class: "setup-arrow",
                  "aria-hidden": "true"
                })
              ], 8, bt))), 128))
            ])
          ])) : x.value ? (v(), h("section", $t, [
            i("div", wt, [
              _(a(m), { icon: "tabler:search-off" })
            ]),
            i("div", Nt, "No services match “" + k(x.value) + "”", 1)
          ])) : !l.value.length && !s.value.length ? (v(), h("section", Et, [
            i("div", Tt, [
              _(a(m), { icon: "tabler:plug-x" })
            ]),
            e[11] || (e[11] = i("div", { class: "e-title" }, "No providers available", -1)),
            e[12] || (e[12] = i("div", { class: "e-sub" }, "Install a provider module to add a connection here.", -1))
          ])) : $("", !0)
        ], 64))
      ]),
      L.value ? (v(), Le(Oe, {
        key: 0,
        providers: l.value,
        provider: z.value,
        reauth: t.value,
        onClose: e[3] || (e[3] = (n) => L.value = !1),
        onConnected: me
      }, null, 8, ["providers", "provider", "reauth"])) : $("", !0),
      r.value ? (v(), h("div", {
        key: 1,
        ref_key: "shareHost",
        ref: T
      }, null, 512)) : $("", !0)
    ]));
  }
}), Lt = { props: { type: "object", properties: {} } }, At = {
  wippy: Lt
};
class Ot extends $e {
  static get wippyConfig() {
    return {
      propsSchema: At.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: we
    };
  }
  static get vueConfig() {
    return { rootComponent: Pt, plugins: [Ne] };
  }
}
Ie(import.meta.url, Ot);
//# sourceMappingURL=index.js.map
