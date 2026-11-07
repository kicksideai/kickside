import { ref as w, defineComponent as Ae, computed as O, onMounted as Ee, watch as ye, onUnmounted as Ie, openBlock as i, createBlock as le, unref as s, withCtx as se, createElementVNode as a, createVNode as D, withDirectives as ie, vModelText as _e, createElementBlock as c, toDisplayString as h, createCommentVNode as I, Fragment as N, renderList as re, normalizeClass as xe, createTextVNode as P, withKeys as ge, withModifiers as we, vModelCheckbox as Pe, vModelDynamic as Ve, nextTick as Le } from "vue";
import { Icon as q } from "@iconify/vue";
import ze from "primevue/dialog";
import Me from "primevue/select";
import Ce from "primevue/button";
import { api as ue, loadByTagName as Oe } from "@wippy-fe/proxy";
import { a as fe } from "./status-BfNJewNy.js";
function $e({ provider: F, reauth: Y, open: J, connName: b, selectedScopes: K, isCredentialProvider: $, key: A, label: l, credentialPrivateContext: W, credentialValidationError: T, emitConnected: L }) {
  const d = w(!1), p = w(""), y = w("");
  let v = null, _ = null, G = null, V = "", E = "", R = !1, C = 0, z = !1;
  async function g(o) {
    const r = A(o);
    if (!r) return null;
    try {
      const { data: k } = await ue.get(`/api/v1/connections?provider=${encodeURIComponent(r)}&limit=100`), m = k?.connections ?? [], f = /* @__PURE__ */ new Map();
      for (const u of m)
        u.component_id && f.set(u.component_id, u.updated_at ?? "");
      return f;
    } catch {
      return null;
    }
  }
  async function U(o, r) {
    const k = A(o);
    if (k)
      try {
        const { data: m } = await ue.get(`/api/v1/connections?provider=${encodeURIComponent(k)}&limit=100`), x = (m?.connections ?? []).find((j) => j.component_id === r)?.scopes_granted ?? [];
        if (x.length) {
          const j = new Set(K.value);
          for (const ve of x) j.add(ve);
          K.value = j;
        }
      } catch {
      }
  }
  function Q(o) {
    if (o)
      try {
        o.close();
      } catch {
      }
  }
  function te(o) {
    const r = o.data;
    !r || r.type !== "oauth_result" || !v || o.source !== v || !V || o.origin !== V || !E || r.state_token !== E || (H(!0), V = "", E = "", y.value = "", d.value = !1, r.success ? (L(), J.value = !1) : p.value = r.error || "Authorization failed");
  }
  function H(o = !1) {
    _ && (clearInterval(_), _ = null), R && (window.removeEventListener("message", te), R = !1), o && Q(v), v = null;
  }
  function B(o = !0) {
    C += 1, H(o), V = "", E = "", y.value = "";
  }
  function ne(o) {
    if (typeof o != "string" || !o) return "";
    try {
      const r = new URL(o, window.location.href);
      return r.protocol === "http:" || r.protocol === "https:" ? r.origin : "";
    } catch {
      return "";
    }
  }
  async function oe(o) {
    const r = F.value;
    if (!r) {
      d.value = !1, p.value = "Authorization window closed before completion.";
      return;
    }
    const k = await g(r);
    if (z || o !== C || F.value !== r) return;
    if (!G || !k) {
      d.value = !1, y.value = "", p.value = "Authorization window closed before the app received confirmation.";
      return;
    }
    let m = !1;
    if (Y()?.componentId) {
      const f = Y().componentId, u = G.get(f), x = k.get(f);
      m = x !== void 0 && (u === void 0 || x !== u);
    } else
      for (const [f, u] of k.entries()) {
        const x = G.get(f);
        if (x === void 0 || u !== x) {
          m = !0;
          break;
        }
      }
    if (m) {
      L(), J.value = !1;
      return;
    }
    d.value = !1, y.value = "", p.value = "Authorization window closed before the app received confirmation.";
  }
  function ce(o) {
    _ = setInterval(() => {
      let r = !1;
      try {
        r = !v || v.closed;
      } catch {
        r = !1;
      }
      r && (H(), V = "", E = "", oe(o));
    }, 1e3);
  }
  function X(o) {
    R || (window.addEventListener("message", te), R = !0), ce(o);
  }
  async function Z() {
    const o = F.value;
    if (!o || d.value) return;
    if (d.value = !0, p.value = "", y.value = "", $.value) {
      const k = T();
      if (k) {
        p.value = k, d.value = !1;
        return;
      }
      try {
        const { data: m } = await ue.post("/api/v1/connections", {
          impl_id: o.impl_id || o.id,
          name: b.value.trim() || l(o),
          private_context: W(),
          validate: !0
        });
        if (!m?.success) {
          p.value = m?.error || "Failed to save connection", d.value = !1;
          return;
        }
        L(), J.value = !1;
      } catch (m) {
        p.value = fe(m), d.value = !1;
      }
      return;
    }
    B();
    const r = C;
    v = window.open("about:blank", "oauth_" + A(o), "width=520,height=680,menubar=no,toolbar=no,location=no,status=no");
    try {
      if (G = await g(o), z || r !== C) return;
      const k = { name: b.value.trim() || l(o), scopes: [...K.value] }, m = Y();
      m && (k.component_id = m.componentId);
      const { data: f } = await ue.post(`/api/v1/oauth/providers/${encodeURIComponent(A(o))}/init`, k);
      if (z || r !== C) return;
      if (!f?.success || !f.authorization_url) {
        B(), p.value = f?.error || "Failed to start authorization", d.value = !1;
        return;
      }
      const u = ne(f.redirect_uri), x = typeof f.state_token == "string" ? f.state_token : "";
      if (!u || !x) {
        B(), p.value = "Authorization response did not include a valid callback identity", d.value = !1;
        return;
      }
      V = u, E = x, v && !v.closed ? (X(r), v.location.href = f.authorization_url) : (v = null, y.value = f.authorization_url, d.value = !1);
    } catch (k) {
      if (z || r !== C) return;
      B(), p.value = fe(k), d.value = !1;
    }
  }
  function de() {
    if (!y.value || !F.value || !V || !E) return;
    const o = window.open(
      y.value,
      "oauth_" + A(F.value),
      "width=520,height=680,menubar=no,toolbar=no,location=no,status=no"
    );
    if (!o || o.closed) {
      Q(o), d.value = !1, p.value = "Popup blocked - allow popups and retry";
      return;
    }
    H(!0), v = o, y.value = "", p.value = "", d.value = !0, X(C);
  }
  function pe() {
    z = !0, B();
  }
  return { connecting: d, connectError: p, pendingAuthUrl: y, loadGrantedScopes: U, resetOAuthAttempt: B, doConnect: Z, openBlockedPopup: de, dispose: pe };
}
const Te = { class: "kx-modal-head-icon" }, Re = { class: "kx-modal-head-text" }, Be = { class: "kx-modal-head-title" }, De = { class: "kx-modal-head-sub" }, Ne = { class: "kx-2p" }, qe = { class: "kx-2p-l" }, Fe = {
  class: "kx-cat-search",
  role: "search"
}, Ke = {
  key: 0,
  class: "kx-cat-empty"
}, Ge = { class: "kx-cat-grp-lbl" }, He = { class: "kx-cat" }, je = ["data-provider-key", "disabled", "onClick"], We = { class: "kx-cat-ico" }, Ye = { class: "kx-cat-text" }, Je = { class: "kx-cat-name" }, Qe = { class: "kx-cat-desc" }, Xe = { class: "kx-2p-r" }, Ze = { class: "kx-2p-r-head" }, et = { class: "kx-2p-r-body" }, tt = {
  key: 0,
  class: "kx-cfg-empty"
}, nt = {
  key: 1,
  class: "kx-engine-wrap"
}, ot = {
  key: 0,
  class: "kx-cfg-state kx-engine-state",
  role: "status"
}, at = {
  key: 1,
  class: "kx-engine-error",
  role: "alert"
}, lt = {
  key: 2,
  class: "kx-form"
}, st = { class: "kx-2p-r-note" }, it = { class: "kx-field" }, rt = ["disabled"], ut = { class: "kx-field-lbl" }, ct = {
  key: 0,
  class: "kx-field-hint-inline"
}, dt = {
  key: 1,
  class: "kx-check"
}, pt = ["onUpdate:modelValue", "disabled"], vt = ["onUpdate:modelValue", "type", "placeholder", "aria-label", "disabled"], ft = {
  key: 3,
  class: "kx-field-hint-inline"
}, ht = {
  key: 0,
  class: "kx-field"
}, kt = { class: "kx-field-lbl" }, mt = { class: "kx-field-hint-inline" }, bt = ["checked", "disabled", "onChange"], yt = { class: "kx-scope-txt" }, _t = { class: "kx-scope-nm" }, xt = {
  key: 0,
  class: "kx-field-hint-inline"
}, gt = {
  key: 0,
  class: "kx-scope-desc"
}, wt = {
  key: 1,
  class: "kx-cfg-state warn"
}, Ct = {
  key: 2,
  class: "kx-cfg-state"
}, Ut = {
  key: 3,
  class: "kx-err inline"
}, Mt = /* @__PURE__ */ Ae({
  __name: "ConnectionPicker",
  props: {
    providers: {},
    provider: {},
    reauth: {}
  },
  emits: ["close", "connected"],
  setup(F, { emit: Y }) {
    const J = {
      header: { class: "kx-modal-head" },
      content: { class: "kx-dialog-content" },
      footer: { class: "kx-modal-foot" }
    }, b = F, K = Y, $ = w(!0), A = w(""), l = w(null), W = w(null);
    let T = null, L = 0;
    const d = w(!1), p = w(""), y = w(""), v = w(/* @__PURE__ */ new Set()), _ = w({}), G = w(null), V = w(null), E = O(() => !!b.reauth), R = O(() => !!(l.value && l.value.create_ui_id)), C = O(() => !!(l.value?.credential_schema && !l.value?.oauth_provider)), z = O(() => l.value?.credential_schema?.fields ?? []), g = (n) => n.provider ?? "", U = (n) => n.title ?? n.name ?? n.oauth_provider ?? "Provider", Q = (n) => n.icon || "tabler:plug", te = O(() => v.value.size), H = O(() => l.value ? `${E.value ? "Reconnect" : "Connect"} ${U(l.value)}` : "Connect an app"), B = O(() => l.value ? l.value.description || "Configure and connect this service." : "Pick a service — your agents and automations can then use it.");
    function ne(n) {
      return (n.group ?? "").trim() || "Other";
    }
    const oe = O(() => {
      const n = A.value.trim().toLowerCase();
      return n ? b.providers.filter((e) => U(e).toLowerCase().includes(n) || (e.description ?? "").toLowerCase().includes(n) || g(e).toLowerCase().includes(n) || ne(e).toLowerCase().includes(n)) : b.providers;
    }), ce = O(() => {
      const n = /* @__PURE__ */ new Map();
      for (const e of oe.value) {
        const t = ne(e);
        n.has(t) || n.set(t, []), n.get(t).push(e);
      }
      for (const e of n.values()) e.sort((t, S) => U(t).localeCompare(U(S)));
      return [...n.entries()].sort(([e], [t]) => e === "Other" ? 1 : t === "Other" ? -1 : e.localeCompare(t));
    });
    function X(n) {
      if (!(u.value || l.value && g(l.value) === g(n))) {
        Ue(), me(), l.value = n, y.value = "My " + U(n), v.value = new Set(n.default_scopes ?? []), _.value = {};
        for (const e of n.credential_schema?.fields ?? [])
          _.value[e.key] = e.type === "checkbox" ? !1 : "";
        x.value = "", j.value = "";
      }
    }
    function Z(n, e) {
      return (n.default_scopes ?? []).includes(e);
    }
    function de(n, e) {
      if (e) return;
      const t = new Set(v.value);
      t.has(n) ? t.delete(n) : t.add(n), v.value = t;
    }
    function pe(n) {
      return typeof n == "string" ? n : n.value ?? n.label ?? "";
    }
    function o(n) {
      return [
        { label: "", value: "" },
        ...(n.options || []).map((e) => ({
          label: typeof e == "string" ? e : e.label || e.value || "",
          value: pe(e)
        }))
      ];
    }
    function r(n) {
      return n.type === "password" ? "password" : n.type === "url" ? "url" : n.type === "email" ? "email" : "text";
    }
    function k() {
      const n = {};
      for (const e of z.value) {
        const t = _.value[e.key];
        n[e.key] = typeof t == "string" ? t.trim() : !!t;
      }
      return n;
    }
    function m() {
      for (const n of z.value) {
        const e = _.value[n.key];
        if (n.required && (e === void 0 || e === !1 || typeof e == "string" && e.trim() === ""))
          return `${n.label || n.key} is required`;
      }
      return "";
    }
    const f = $e({
      provider: l,
      reauth: () => b.reauth,
      open: $,
      connName: y,
      selectedScopes: v,
      isCredentialProvider: C,
      key: g,
      label: U,
      credentialPrivateContext: k,
      credentialValidationError: m,
      emitConnected: () => K("connected")
    }), {
      connecting: u,
      connectError: x,
      pendingAuthUrl: j,
      loadGrantedScopes: ve,
      resetOAuthAttempt: Ue,
      doConnect: ee,
      openBlockedPopup: he,
      dispose: Se
    } = f;
    async function ke() {
      const n = l.value;
      if (!n || !n.create_ui_id || !W.value) return;
      const e = ++L;
      d.value = !0, p.value = "";
      try {
        if (await Oe(n.create_ui_id, { timeoutMs: 8e3 }), e !== L || l.value !== n || !W.value) return;
        const t = document.createElement(n.create_ui_id);
        t.setAttribute("provider-id", g(n)), b.reauth && t.setAttribute("component-id", b.reauth.componentId), t.addEventListener("connection-saved", ae), t.addEventListener("oauth-result", ae), W.value.replaceChildren(t), T = t;
      } catch (t) {
        e === L && (p.value = "Failed to load setup UI: " + fe(t));
      } finally {
        e === L && (d.value = !1);
      }
    }
    function ae(n) {
      const e = n.detail;
      if (e && e.success === !1) {
        x.value = e.error || "Setup failed";
        return;
      }
      K("connected"), $.value = !1;
    }
    function me() {
      L++, d.value = !1, p.value = "", T && (T.removeEventListener("connection-saved", ae), T.removeEventListener("oauth-result", ae), T.remove(), T = null);
    }
    function be() {
      Le(() => {
        if (!l.value) {
          G.value?.focus();
          return;
        }
        if (R.value) {
          ke();
          return;
        }
        V.value?.focus();
      });
    }
    return Ee(() => {
      let n = !1;
      if (b.provider) {
        const e = b.providers.find((t) => g(t) === b.provider);
        e && (n = !0, X(e), b.reauth && (b.reauth.name && (y.value = b.reauth.name), ve(e, b.reauth.componentId)));
      }
      n || be();
    }), ye(l, be), Ie(() => {
      Se(), me();
    }), ye($, (n) => {
      n || K("close");
    }), (n, e) => (i(), le(s(ze), {
      visible: $.value,
      "onUpdate:visible": e[6] || (e[6] = (t) => $.value = t),
      modal: !0,
      "dismissable-mask": !0,
      "close-on-escape": !s(u),
      closable: !s(u),
      class: "kx-modal kx-modal-2p",
      pt: J,
      "aria-label": H.value
    }, {
      header: se(() => [
        a("span", Te, [
          D(s(q), {
            icon: l.value ? Q(l.value) : "tabler:plug-connected",
            "aria-hidden": "true"
          }, null, 8, ["icon"])
        ]),
        a("span", Re, [
          a("span", Be, h(H.value), 1),
          a("span", De, h(B.value), 1)
        ])
      ]),
      footer: se(() => [
        D(s(Ce), {
          label: "Cancel",
          severity: "secondary",
          outlined: "",
          disabled: s(u),
          onClick: e[5] || (e[5] = (t) => $.value = !1)
        }, null, 8, ["disabled"]),
        l.value && !R.value ? (i(), le(s(Ce), {
          key: 0,
          "data-connect": "",
          loading: s(u),
          disabled: s(u),
          label: s(u) ? C.value ? "Checking…" : "Waiting…" : l.value.credential_schema?.submit_label || (E.value ? "Reconnect" : "Connect"),
          onClick: s(ee)
        }, {
          icon: se(() => [
            D(s(q), {
              icon: "tabler:plug-connected",
              "aria-hidden": "true"
            })
          ]),
          _: 1
        }, 8, ["loading", "disabled", "label", "onClick"])) : I("", !0)
      ]),
      default: se(() => [
        a("div", Ne, [
          a("div", qe, [
            a("div", Fe, [
              D(s(q), {
                icon: "tabler:search",
                "aria-hidden": "true"
              }),
              ie(a("input", {
                ref_key: "searchInput",
                ref: G,
                "onUpdate:modelValue": e[0] || (e[0] = (t) => A.value = t),
                type: "text",
                placeholder: "Search apps…",
                "aria-label": "Search apps"
              }, null, 512), [
                [_e, A.value]
              ])
            ]),
            oe.value.length ? I("", !0) : (i(), c("div", Ke, h(A.value ? `No apps match “${A.value}”` : "No providers available. Install a provider module to add one."), 1)),
            (i(!0), c(N, null, re(ce.value, ([t, S]) => (i(), c(N, { key: t }, [
              a("div", Ge, h(t), 1),
              a("div", He, [
                (i(!0), c(N, null, re(S, (M) => (i(), c("button", {
                  key: g(M),
                  type: "button",
                  "data-provider-key": g(M),
                  class: xe(["kx-cat-card", { sel: l.value && g(l.value) === g(M) }]),
                  disabled: s(u),
                  onClick: (St) => X(M)
                }, [
                  a("span", We, [
                    D(s(q), {
                      icon: Q(M),
                      "aria-hidden": "true"
                    }, null, 8, ["icon"])
                  ]),
                  a("span", Ye, [
                    a("span", Je, h(U(M)), 1),
                    a("span", Qe, h(M.description || `Set up ${U(M)}`), 1)
                  ]),
                  l.value && g(l.value) === g(M) ? (i(), le(s(q), {
                    key: 0,
                    icon: "tabler:check",
                    class: "kx-cat-check",
                    "aria-hidden": "true"
                  })) : I("", !0)
                ], 10, je))), 128))
              ])
            ], 64))), 128))
          ]),
          a("div", Xe, [
            a("div", Ze, h(l.value ? "Configure" : ""), 1),
            a("div", et, [
              l.value ? R.value ? (i(), c("div", nt, [
                a("div", {
                  ref_key: "customHost",
                  ref: W,
                  class: "kx-engine-host"
                }, null, 512),
                d.value ? (i(), c("div", ot, [
                  D(s(q), {
                    icon: "tabler:loader-2",
                    class: "spin",
                    "aria-hidden": "true"
                  }),
                  e[8] || (e[8] = P(" Loading setup… ", -1))
                ])) : p.value ? (i(), c("div", at, [
                  a("span", null, h(p.value), 1),
                  a("button", {
                    type: "button",
                    onClick: ke
                  }, "Retry")
                ])) : I("", !0)
              ])) : (i(), c("div", lt, [
                a("p", st, [
                  C.value ? (i(), c(N, { key: 0 }, [
                    e[9] || (e[9] = P("Enter credentials for ", -1)),
                    a("strong", null, h(U(l.value)), 1),
                    e[10] || (e[10] = P(". The connection is checked before it is saved.", -1))
                  ], 64)) : E.value ? (i(), c(N, { key: 1 }, [
                    e[11] || (e[11] = P("Re-authorizing ", -1)),
                    a("strong", null, h(U(l.value)), 1),
                    e[12] || (e[12] = P(" — adjust the permissions below and reconnect to update this connection.", -1))
                  ], 64)) : (i(), c(N, { key: 2 }, [
                    e[13] || (e[13] = P("A popup opens for ", -1)),
                    a("strong", null, h(U(l.value)), 1),
                    e[14] || (e[14] = P(" authorization. Choose what to grant, then connect.", -1))
                  ], 64))
                ]),
                a("label", it, [
                  e[15] || (e[15] = a("span", { class: "kx-field-lbl" }, "Connection name", -1)),
                  ie(a("input", {
                    ref_key: "nameInput",
                    ref: V,
                    "onUpdate:modelValue": e[1] || (e[1] = (t) => y.value = t),
                    type: "text",
                    class: "kx-input",
                    "aria-label": "Connection name",
                    disabled: s(u),
                    onKeydown: e[2] || (e[2] = ge(we(
                      //@ts-ignore
                      (...t) => s(ee) && s(ee)(...t),
                      ["prevent"]
                    ), ["enter"]))
                  }, null, 40, rt), [
                    [_e, y.value]
                  ])
                ]),
                (i(!0), c(N, null, re(z.value, (t) => (i(), c("label", {
                  key: t.key,
                  class: "kx-field"
                }, [
                  a("span", ut, [
                    P(h(t.label || t.key), 1),
                    t.required ? (i(), c("span", ct, " — required")) : I("", !0)
                  ]),
                  t.type === "select" ? (i(), le(s(Me), {
                    key: 0,
                    class: "kx-select",
                    "model-value": _.value[t.key],
                    options: o(t),
                    "option-label": "label",
                    "option-value": "value",
                    disabled: s(u),
                    "aria-label": t.label || t.key,
                    "onUpdate:modelValue": (S) => _.value[t.key] = S
                  }, null, 8, ["model-value", "options", "disabled", "aria-label", "onUpdate:modelValue"])) : t.type === "checkbox" ? (i(), c("span", dt, [
                    ie(a("input", {
                      "onUpdate:modelValue": (S) => _.value[t.key] = S,
                      type: "checkbox",
                      disabled: s(u)
                    }, null, 8, pt), [
                      [Pe, _.value[t.key]]
                    ]),
                    a("span", null, h(_.value[t.key] ? "Enabled" : "Disabled"), 1)
                  ])) : ie((i(), c("input", {
                    key: 2,
                    "onUpdate:modelValue": (S) => _.value[t.key] = S,
                    type: r(t),
                    class: "kx-input",
                    placeholder: t.placeholder || "",
                    "aria-label": t.label || t.key,
                    disabled: s(u),
                    onKeydown: e[3] || (e[3] = ge(we(
                      //@ts-ignore
                      (...S) => s(ee) && s(ee)(...S),
                      ["prevent"]
                    ), ["enter"]))
                  }, null, 40, vt)), [
                    [Ve, _.value[t.key]]
                  ]),
                  t.help ? (i(), c("span", ft, h(t.help), 1)) : I("", !0)
                ]))), 128)),
                !C.value && l.value.available_scopes?.length ? (i(), c("div", ht, [
                  a("span", kt, [
                    e[16] || (e[16] = P("Permissions ", -1)),
                    a("span", mt, "— " + h(te.value) + " selected", 1)
                  ]),
                  a("div", {
                    class: xe(["kx-scopes", s(u) && "kx-disabled"])
                  }, [
                    (i(!0), c(N, null, re(l.value.available_scopes, (t) => (i(), c("label", {
                      key: t.scope,
                      class: "kx-scope"
                    }, [
                      a("input", {
                        type: "checkbox",
                        checked: v.value.has(t.scope),
                        disabled: Z(l.value, t.scope) || s(u),
                        onChange: (S) => de(t.scope, Z(l.value, t.scope))
                      }, null, 40, bt),
                      a("span", yt, [
                        a("span", _t, [
                          P(h(t.name || t.scope), 1),
                          Z(l.value, t.scope) ? (i(), c("span", xt, " — required")) : I("", !0)
                        ]),
                        t.description ? (i(), c("span", gt, h(t.description), 1)) : I("", !0)
                      ])
                    ]))), 128))
                  ], 2)
                ])) : I("", !0),
                s(j) ? (i(), c("div", wt, [
                  e[17] || (e[17] = a("span", null, "Your browser blocked the popup.", -1)),
                  a("button", {
                    onClick: e[4] || (e[4] = //@ts-ignore
                    (...t) => s(he) && s(he)(...t))
                  }, "Open authorization")
                ])) : s(u) ? (i(), c("div", Ct, [
                  D(s(q), {
                    icon: "tabler:loader-2",
                    class: "spin",
                    "aria-hidden": "true"
                  }),
                  P(" " + h(C.value ? "Checking connection…" : "Complete sign-in in the popup window…"), 1)
                ])) : I("", !0),
                s(x) ? (i(), c("div", Ut, h(s(x)), 1)) : I("", !0)
              ])) : (i(), c("div", tt, [
                D(s(q), {
                  icon: "tabler:plug",
                  "aria-hidden": "true"
                }),
                e[7] || (e[7] = a("span", null, "Select a service on the left to set it up.", -1))
              ]))
            ])
          ])
        ])
      ]),
      _: 1
    }, 8, ["visible", "close-on-escape", "closable", "aria-label"]));
  }
});
export {
  Mt as _
};
//# sourceMappingURL=ConnectionPicker.vue_vue_type_script_setup_true_lang-qkDdnskl.js.map
