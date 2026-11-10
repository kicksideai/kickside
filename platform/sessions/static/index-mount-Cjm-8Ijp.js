import { P as Re } from "./primevue-plugin-CaP7wV_M.js";
import { defineComponent as de, ref as m, computed as g, onMounted as pe, onBeforeUnmount as ke, openBlock as o, createElementBlock as u, normalizeClass as M, createElementVNode as a, createVNode as l, unref as r, withDirectives as he, withKeys as le, withModifiers as re, vModelText as ge, toDisplayString as _, createCommentVNode as S, createTextVNode as H, withCtx as U, nextTick as ue, createBlock as be, Fragment as z, renderList as ce, watch as fe } from "vue";
import { Icon as d } from "@iconify/vue";
import W from "primevue/button";
import { on as De, host as Ne } from "@wippy-fe/proxy";
import { b as Le } from "./wc-runtime-BJD-5iaH.js";
import { a as Pe, u as Ae } from "./constants-C0dj8rIt.js";
import { u as Te } from "./useSessionsApi-DkMU6ZyM.js";
import Oe from "primevue/drawer";
const Be = ["title", "aria-label"], Ue = {
  key: 0,
  class: "kx-row-main kx-row-main-edit"
}, Fe = ["onKeydown"], Ve = ["aria-current"], je = ["title"], Ie = { class: "kx-row-meta" }, Ke = {
  key: 0,
  class: "kx-row-agent"
}, qe = { key: 1 }, ze = ["title"], We = {
  key: 3,
  class: "kx-sub-bad"
}, He = { class: "kx-row-end" }, Je = ["disabled"], Ge = /* @__PURE__ */ de({
  __name: "SessionRow",
  props: {
    session: {},
    agent: {},
    favorite: { type: Boolean },
    active: { type: Boolean },
    providers: {}
  },
  emits: ["resume", "restart", "preview", "delete", "favorite", "rename"],
  setup(h, { emit: J }) {
    const f = h, C = J, y = m(!1), E = m(""), N = m(null), p = m(null), $ = m(null), x = m(null), b = m(!1), K = g(() => f.session.title?.trim() || "Untitled chat"), F = g(() => {
      const i = f.session.meta, n = i && typeof i == "object" ? i.provider : void 0, c = typeof n == "string" ? n.trim().toLowerCase() : "", v = f.providers;
      return c && v && Object.hasOwn(v, c) ? v[c] : c ? { icon: "tabler:plug-connected", label: c } : (f.session.kind || "").toUpperCase() === "DM" ? { icon: "tabler:message-dots", label: "Direct message" } : { icon: "tabler:message-circle", label: "Chat" };
    }), G = g(() => (f.session.status || "idle").toLowerCase()), V = g(() => G.value === "failed" || G.value === "error"), T = g(() => {
      const i = f.session.meta?.tokens;
      if (!i || typeof i != "object") return null;
      const n = (I) => typeof i[I] == "number" ? i[I] : 0, c = n("total_tokens") || n("prompt_tokens") + n("completion_tokens") + n("thinking_tokens");
      if (!c) return null;
      const v = [];
      return n("prompt_tokens") && v.push(`${n("prompt_tokens").toLocaleString()} in`), n("completion_tokens") && v.push(`${n("completion_tokens").toLocaleString()} out`), n("thinking_tokens") && v.push(`${n("thinking_tokens").toLocaleString()} thinking`), {
        label: q(c),
        title: `${c.toLocaleString()} tokens${v.length ? ` (${v.join(" · ")})` : ""}`
      };
    });
    function q(i) {
      return i >= 1e6 ? `${(i / 1e6).toFixed(i >= 1e7 ? 0 : 1)}M` : i >= 1e3 ? `${(i / 1e3).toFixed(i >= 1e4 ? 0 : 1)}k` : String(i);
    }
    const L = g(() => {
      const i = f.session.last_message_date || f.session.start_date;
      if (!i) return "";
      const n = new Date(i).getTime();
      if (Number.isNaN(n)) return "";
      const c = Date.now() - n, v = 6e4, I = 36e5, B = 864e5;
      return c < v ? "just now" : c < I ? `${Math.floor(c / v)}m ago` : c < B ? `${Math.floor(c / I)}h ago` : c < 7 * B ? `${Math.floor(c / B)}d ago` : new Date(i).toLocaleDateString();
    });
    async function R() {
      b.value = !1, E.value = f.session.title || "", y.value = !0, await ue(), N.value?.focus(), N.value?.select();
    }
    function X() {
      const i = E.value.trim();
      y.value = !1, i && i !== (f.session.title || "") && C("rename", i);
    }
    function j() {
      y.value = !1;
    }
    function O() {
      y.value || C("resume");
    }
    async function Z() {
      b.value = !0, await ue(), x.value?.querySelector('[role="menuitem"]:not(:disabled)')?.focus();
    }
    function P(i = !1) {
      b.value = !1, i && ue(() => $.value?.focus());
    }
    function D() {
      b.value ? P() : Z();
    }
    function w(i) {
      const n = [...x.value?.querySelectorAll('[role="menuitem"]:not(:disabled)') || []];
      if (!n.length) return;
      const c = Math.max(0, n.indexOf(document.activeElement));
      let v = c;
      if (i.key === "ArrowDown") v = (c + 1) % n.length;
      else if (i.key === "ArrowUp") v = (c - 1 + n.length) % n.length;
      else if (i.key === "Home") v = 0;
      else if (i.key === "End") v = n.length - 1;
      else if (i.key === "Escape") {
        i.preventDefault(), P(!0);
        return;
      } else return;
      i.preventDefault(), n[v]?.focus();
    }
    function A(i) {
      P(), C(i === "restart" ? "restart" : i === "preview" ? "preview" : "delete");
    }
    function Y(i) {
      b.value && p.value && !i.composedPath().includes(p.value) && P();
    }
    return pe(() => document.addEventListener("click", Y)), ke(() => document.removeEventListener("click", Y)), (i, n) => (o(), u("div", {
      ref_key: "rowEl",
      ref: p,
      class: M(["kx-row", { "kx-row-edit": y.value, "kx-row-active": h.active }])
    }, [
      a("span", {
        class: "kx-src",
        title: F.value.label,
        "aria-label": F.value.label,
        role: "img"
      }, [
        l(r(d), {
          icon: F.value.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])
      ], 8, Be),
      y.value ? (o(), u("div", Ue, [
        he(a("input", {
          ref_key: "inputEl",
          ref: N,
          "onUpdate:modelValue": n[0] || (n[0] = (c) => E.value = c),
          class: "kx-edit",
          "aria-label": "Rename chat",
          onKeydown: [
            le(re(X, ["prevent"]), ["enter"]),
            le(re(j, ["prevent"]), ["esc"])
          ],
          onBlur: X
        }, null, 40, Fe), [
          [ge, E.value]
        ])
      ])) : (o(), u("button", {
        key: 1,
        type: "button",
        class: "kx-row-main",
        "aria-current": h.active ? "page" : void 0,
        onClick: O
      }, [
        a("span", {
          class: "kx-name",
          title: K.value
        }, _(K.value), 9, je),
        a("span", Ie, [
          h.agent ? (o(), u("span", Ke, _(h.agent), 1)) : S("", !0),
          L.value ? (o(), u("span", qe, _(L.value), 1)) : S("", !0),
          T.value ? (o(), u("span", {
            key: 2,
            class: "kx-tok",
            title: T.value.title
          }, [
            l(r(d), {
              icon: "tabler:coins",
              "aria-hidden": "true"
            }),
            H(_(T.value.label), 1)
          ], 8, ze)) : S("", !0),
          V.value ? (o(), u("span", We, "failed")) : S("", !0)
        ])
      ], 8, Ve)),
      a("div", He, [
        l(r(W), {
          type: "button",
          severity: "secondary",
          text: "",
          class: M(["kx-fav", { "kx-fav-on": h.favorite }]),
          title: h.favorite ? "Remove from favorites" : "Add to favorites",
          "aria-label": h.favorite ? "Remove from favorites" : "Add to favorites",
          "aria-pressed": h.favorite,
          onClick: n[1] || (n[1] = (c) => C("favorite"))
        }, {
          icon: U(({ class: c }) => [
            l(r(d), {
              icon: h.favorite ? "tabler:star-filled" : "tabler:star",
              class: M(c),
              "aria-hidden": "true"
            }, null, 8, ["icon", "class"])
          ]),
          _: 1
        }, 8, ["class", "title", "aria-label", "aria-pressed"]),
        l(r(W), {
          ref_key: "menuTrigger",
          ref: $,
          type: "button",
          severity: "secondary",
          text: "",
          class: "kx-menu-trigger",
          title: "Session actions",
          "aria-label": "Session actions",
          "aria-haspopup": "menu",
          "aria-expanded": b.value,
          onClick: D,
          onKeydown: le(re(Z, ["prevent"]), ["arrow-down"])
        }, {
          icon: U(({ class: c }) => [
            l(r(d), {
              icon: "tabler:dots-vertical",
              class: M(c),
              "aria-hidden": "true"
            }, null, 8, ["class"])
          ]),
          _: 1
        }, 8, ["aria-expanded", "onKeydown"]),
        b.value ? (o(), u("div", {
          key: 0,
          ref_key: "menuEl",
          ref: x,
          class: "kx-row-menu",
          role: "menu",
          "aria-label": "Session actions",
          onKeydown: w
        }, [
          a("button", {
            type: "button",
            class: "kx-menu-item",
            role: "menuitem",
            onClick: n[2] || (n[2] = (c) => A("restart"))
          }, [
            l(r(d), {
              icon: "tabler:refresh",
              "aria-hidden": "true"
            }),
            n[5] || (n[5] = a("span", null, "Restart as new chat", -1))
          ]),
          a("button", {
            type: "button",
            class: "kx-menu-item",
            role: "menuitem",
            onClick: n[3] || (n[3] = (c) => A("preview"))
          }, [
            l(r(d), {
              icon: "tabler:eye",
              "aria-hidden": "true"
            }),
            n[6] || (n[6] = a("span", null, "Preview messages", -1))
          ]),
          a("button", {
            type: "button",
            class: "kx-menu-item",
            role: "menuitem",
            disabled: y.value,
            onClick: R
          }, [
            l(r(d), {
              icon: "tabler:pencil",
              "aria-hidden": "true"
            }),
            n[7] || (n[7] = a("span", null, "Rename", -1))
          ], 8, Je),
          a("button", {
            type: "button",
            class: "kx-menu-item kx-menu-item-danger",
            role: "menuitem",
            onClick: n[4] || (n[4] = (c) => A("delete"))
          }, [
            l(r(d), {
              icon: "tabler:trash",
              "aria-hidden": "true"
            }),
            n[8] || (n[8] = a("span", null, "Delete", -1))
          ])
        ], 544)) : S("", !0)
      ])
    ], 2));
  }
}), Xe = { class: "kx-drawer-title" }, Ze = { class: "kx-drawer-b" }, Qe = {
  key: 0,
  class: "kx-drawer-state"
}, Ye = {
  key: 1,
  class: "kx-drawer-state err"
}, et = {
  key: 2,
  class: "kx-drawer-state"
}, tt = {
  key: 3,
  class: "kx-msgs"
}, st = { class: "kx-msg-role" }, at = { class: "kx-msg-body" }, nt = /* @__PURE__ */ de({
  __name: "MessagesDrawer",
  props: {
    open: { type: Boolean },
    title: {},
    messages: {},
    loading: { type: Boolean },
    error: {}
  },
  emits: ["close"],
  setup(h, { emit: J }) {
    const f = h, C = J;
    function y(p) {
      p || C("close");
    }
    function E(p) {
      if (!p.data) return "";
      try {
        const $ = JSON.parse(p.data);
        if (typeof $ == "string") return $;
        if ($ && typeof $ == "object") {
          const x = $, b = x.text ?? x.content ?? x.message;
          return typeof b == "string" ? b : JSON.stringify($, null, 2);
        }
      } catch {
      }
      return p.data;
    }
    const N = g(
      () => f.messages.map((p) => ({
        id: p.message_id,
        role: (p.type || "message").replace(/_/g, " "),
        body: E(p),
        user: /user/i.test(p.type || "")
      }))
    );
    return (p, $) => (o(), be(r(Oe), {
      visible: h.open,
      position: "right",
      modal: !0,
      dismissable: !0,
      "close-on-escape": !0,
      style: { width: "min(560px, calc(100vw - 36px))" },
      "aria-label": `Messages — ${h.title}`,
      "onUpdate:visible": y
    }, {
      header: U(() => [
        a("span", Xe, [
          l(r(d), {
            icon: "tabler:messages",
            "aria-hidden": "true"
          }),
          H(_(h.title), 1)
        ])
      ]),
      default: U(() => [
        a("div", Ze, [
          h.loading ? (o(), u("div", Qe, [
            l(r(d), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            $[0] || ($[0] = H(" Loading messages… ", -1))
          ])) : h.error ? (o(), u("div", Ye, _(h.error), 1)) : N.value.length ? (o(), u("ol", tt, [
            (o(!0), u(z, null, ce(N.value, (x) => (o(), u("li", {
              key: x.id,
              class: M(["kx-msg", { "kx-msg-user": x.user }])
            }, [
              a("span", st, _(x.role), 1),
              a("pre", at, _(x.body), 1)
            ], 2))), 128))
          ])) : (o(), u("div", et, "No messages yet."))
        ])
      ]),
      _: 1
    }, 8, ["visible", "aria-label"]));
  }
}), it = {
  key: 0,
  class: "kx-side-head"
}, ot = ["aria-current"], lt = {
  key: 2,
  class: "kx-head"
}, rt = { class: "kx-head-icon" }, ut = { class: "kx-head-actions" }, ct = { class: "kx-search" }, dt = ["aria-pressed", "disabled", "title"], vt = { class: "kx-body" }, mt = {
  key: 0,
  class: "kx-side-section-title"
}, ft = {
  key: 1,
  class: "kx-err"
}, pt = {
  key: 2,
  class: "kx-loading"
}, kt = {
  key: 3,
  class: "kx-empty"
}, ht = { class: "kx-empty-ico" }, gt = { class: "kx-empty-sub" }, bt = {
  key: 4,
  class: "kx-empty"
}, yt = { class: "kx-empty-ico" }, xt = {
  key: 5,
  class: "kx-empty"
}, wt = {
  key: 6,
  class: "kx-empty"
}, _t = { class: "kx-list" }, $t = {
  key: 0,
  class: "kx-pager",
  "aria-label": "Pagination"
}, Ct = { class: "kx-pager-info" }, Mt = { class: "kx-pager-ctrls" }, St = ["disabled"], Et = {
  key: 0,
  class: "kx-pager-gap"
}, Rt = ["onClick"], Dt = ["disabled"], Nt = 300, Q = 25, Lt = /* @__PURE__ */ de({
  __name: "sessions",
  setup(h) {
    const J = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, f = Te(), C = Pe(), y = Ae(), E = g(() => C.value?.mode === "sidebar"), N = g(() => C.value?.mode === "navigation"), p = g(() => E.value || N.value), $ = g(() => C.value?.activeSessionId || ""), x = g(() => !!C.value?.artifactsActive), b = m([]), K = m(0), F = m({}), G = m({}), V = m(!0), T = m(""), q = m(""), L = m(""), R = m(!1), X = [];
    let j = null;
    function O(s) {
      return !!s.public_meta?.favorite;
    }
    function Z(s) {
      const e = s.current_agent || "";
      if (!e) return "";
      const t = e.replace(/^user_agent:/, "");
      if (F.value[t]) return F.value[t];
      if (e.startsWith("user_agent:")) return "";
      const k = e.includes(":") ? e.split(":").pop() || "" : t;
      return J.test(k) ? "" : k;
    }
    const P = g(() => b.value.filter(O).length), D = g(() => {
      const s = L.value.trim().toLowerCase();
      return [...b.value.filter((t) => R.value && !O(t) ? !1 : s ? (t.title || "").toLowerCase().includes(s) || Z(t).toLowerCase().includes(s) : !0)].sort((t, k) => Number(O(k)) - Number(O(t)));
    }), w = m(1);
    fe([L, R], () => {
      w.value = 1;
    });
    const A = g(() => Math.max(1, Math.ceil(D.value.length / Q)));
    fe(A, (s) => {
      w.value > s && (w.value = s);
    });
    const Y = g(() => {
      const s = (w.value - 1) * Q;
      return D.value.slice(s, s + Q);
    }), i = g(() => D.value.length ? (w.value - 1) * Q + 1 : 0), n = g(() => Math.min(D.value.length, w.value * Q)), c = g(() => I(w.value, A.value));
    function v(s) {
      w.value = Math.max(1, Math.min(A.value, s));
    }
    function I(s, e) {
      if (e <= 7) return Array.from({ length: e }, (te, Ee) => Ee + 1);
      const t = [1], k = Math.max(2, s - 1), oe = Math.min(e - 1, s + 1);
      k > 2 && t.push("…");
      for (let te = k; te <= oe; te++) t.push(te);
      return oe < e - 1 && t.push("…"), t.push(e), t;
    }
    async function B() {
      V.value = !0, T.value = "";
      try {
        const [{ sessions: s, total: e }, t, k] = await Promise.all([
          f.list(Nt, 0),
          f.agentTitles(),
          f.providerBadges()
        ]);
        b.value = s, K.value = e, F.value = t, G.value = k;
      } catch (s) {
        T.value = s.message;
      } finally {
        V.value = !1;
      }
    }
    function ye() {
      j && clearTimeout(j), j = setTimeout(() => {
        B();
      }, 150);
    }
    function ee(s) {
      q.value = s.message;
    }
    async function xe(s) {
      const e = !O(s);
      s.public_meta = { ...s.public_meta || {}, favorite: e };
      try {
        await f.setFavorite(s.session_id, e);
      } catch (t) {
        s.public_meta = { ...s.public_meta || {}, favorite: !e }, ee(t);
      }
    }
    function we(s) {
      y("session-select", { sessionId: s.session_id }), y("kickside-chat-open", { kind: "session", sessionId: s.session_id });
    }
    async function _e(s) {
      try {
        const e = await f.startToken(s.current_agent, s.current_model);
        y("kickside-chat-open", { kind: "start", startToken: e });
      } catch (e) {
        ee(e);
      }
    }
    function ve() {
      y("new-chat", void 0);
    }
    function $e() {
      y("artifacts-open", void 0);
    }
    async function Ce(s, e) {
      const t = s.title;
      s.title = e;
      try {
        await f.rename(s.session_id, e);
      } catch (k) {
        s.title = t, ee(k);
      }
    }
    async function Me(s) {
      if (await Ne.confirm({
        header: "Delete session",
        message: `Delete “${s.title?.trim() || "Untitled chat"}” and its messages? This can’t be undone.`,
        icon: "tabler:alert-triangle",
        acceptLabel: "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      }))
        try {
          await f.remove(s.session_id), b.value = b.value.filter((t) => t.session_id !== s.session_id), K.value = Math.max(0, K.value - 1);
        } catch (t) {
          ee(t);
        }
    }
    const se = m(!1), me = m(""), ae = m([]), ne = m(!1), ie = m("");
    async function Se(s) {
      se.value = !0, me.value = s.title?.trim() || "Untitled chat", ae.value = [], ie.value = "", ne.value = !0;
      try {
        ae.value = await f.messages(s.session_id);
      } catch (e) {
        ie.value = e.message;
      } finally {
        ne.value = !1;
      }
    }
    return Le(B), pe(() => X.push(De("session:*", ye))), ke(() => {
      X.forEach((s) => s()), j && clearTimeout(j);
    }), (s, e) => (o(), u("div", {
      class: M(["kx", { "kx-sidebar": p.value }])
    }, [
      E.value ? (o(), u("header", it, [
        e[7] || (e[7] = a("h1", { class: "kx-side-title" }, "Sessions", -1)),
        l(r(W), {
          type: "button",
          class: "kx-side-new",
          size: "small",
          label: "New chat",
          onClick: ve
        }, {
          icon: U(({ class: t }) => [
            l(r(d), {
              icon: "tabler:plus",
              class: M(t),
              "aria-hidden": "true"
            }, null, 8, ["class"])
          ]),
          _: 1
        })
      ])) : S("", !0),
      E.value ? (o(), u("button", {
        key: 1,
        type: "button",
        class: M(["kx-side-artifacts", { "is-active": x.value }]),
        "aria-current": x.value ? "page" : void 0,
        onClick: $e
      }, [
        l(r(d), {
          icon: "tabler:binary-tree-2",
          "aria-hidden": "true"
        }),
        e[8] || (e[8] = a("span", null, "Artifacts", -1)),
        l(r(d), {
          icon: "tabler:chevron-right",
          class: "kx-side-artifacts-caret",
          "aria-hidden": "true"
        })
      ], 10, ot)) : N.value ? S("", !0) : (o(), u("header", lt, [
        a("span", rt, [
          l(r(d), {
            icon: "tabler:messages",
            "aria-hidden": "true"
          })
        ]),
        e[11] || (e[11] = a("div", { class: "kx-head-text" }, [
          a("h1", { class: "kx-title" }, "Sessions"),
          a("p", { class: "kx-head-sub" }, "Resume, restart, rename, and review your chats.")
        ], -1)),
        a("div", ut, [
          l(r(W), {
            type: "button",
            size: "small",
            label: "New chat",
            onClick: ve
          }, {
            icon: U(({ class: t }) => [
              l(r(d), {
                icon: "tabler:plus",
                class: M(t),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          }),
          a("label", ct, [
            e[9] || (e[9] = a("span", { class: "sr-only" }, "Search sessions", -1)),
            l(r(d), {
              icon: "tabler:search",
              class: "kx-search-ico",
              "aria-hidden": "true"
            }),
            he(a("input", {
              "onUpdate:modelValue": e[0] || (e[0] = (t) => L.value = t),
              class: "kx-search-input",
              type: "search",
              placeholder: "Search sessions"
            }, null, 512), [
              [ge, L.value]
            ]),
            L.value ? (o(), u("button", {
              key: 0,
              class: "kx-search-clear",
              "aria-label": "Clear search",
              onClick: e[1] || (e[1] = (t) => L.value = "")
            }, [
              l(r(d), {
                icon: "tabler:x",
                "aria-hidden": "true"
              })
            ])) : S("", !0)
          ]),
          a("button", {
            class: M(["kx-toggle", { "kx-toggle-on": R.value }]),
            "aria-pressed": R.value,
            disabled: !P.value,
            title: P.value ? "Show only favorites" : "No favorites yet",
            onClick: e[2] || (e[2] = (t) => R.value = !R.value)
          }, [
            l(r(d), {
              icon: R.value ? "tabler:star-filled" : "tabler:star",
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            a("span", null, [
              e[10] || (e[10] = H("Favorites", -1)),
              P.value ? (o(), u(z, { key: 0 }, [
                H(" · " + _(P.value), 1)
              ], 64)) : S("", !0)
            ])
          ], 10, dt),
          l(r(W), {
            type: "button",
            severity: "secondary",
            outlined: "",
            title: "Refresh",
            "aria-label": "Refresh",
            loading: V.value,
            disabled: V.value,
            onClick: B
          }, {
            icon: U(({ class: t }) => [
              l(r(d), {
                icon: "tabler:refresh",
                class: M(t),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          }, 8, ["loading", "disabled"])
        ])
      ])),
      a("div", vt, [
        p.value ? (o(), u("div", mt, "Chats and tasks")) : S("", !0),
        q.value ? (o(), u("div", ft, [
          l(r(d), {
            icon: "tabler:alert-triangle",
            "aria-hidden": "true"
          }),
          a("span", null, _(q.value), 1),
          a("button", {
            class: "kx-err-x",
            "aria-label": "Dismiss",
            onClick: e[3] || (e[3] = (t) => q.value = "")
          }, [
            l(r(d), {
              icon: "tabler:x",
              "aria-hidden": "true"
            })
          ])
        ])) : S("", !0),
        V.value ? (o(), u("div", pt, [
          l(r(d), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          e[12] || (e[12] = H(" Loading… ", -1))
        ])) : T.value ? (o(), u("div", kt, [
          a("div", ht, [
            l(r(d), {
              icon: "tabler:alert-triangle",
              "aria-hidden": "true"
            })
          ]),
          e[13] || (e[13] = a("div", { class: "kx-empty-title" }, "Couldn’t load sessions", -1)),
          a("div", gt, _(T.value), 1),
          l(r(W), {
            type: "button",
            label: "Retry",
            onClick: B
          }, {
            icon: U(({ class: t }) => [
              l(r(d), {
                icon: "tabler:refresh",
                class: M(t),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ])) : b.value.length ? R.value && !D.value.length ? (o(), u("div", xt, [...e[16] || (e[16] = [
          a("div", { class: "kx-empty-title" }, "No favorites", -1),
          a("div", { class: "kx-empty-sub" }, "Star a session to pin it to the top and find it here.", -1)
        ])])) : D.value.length ? (o(), u(z, { key: 7 }, [
          a("div", _t, [
            (o(!0), u(z, null, ce(p.value ? D.value : Y.value, (t) => (o(), be(Ge, {
              key: t.session_id,
              session: t,
              agent: Z(t),
              providers: G.value,
              favorite: O(t),
              active: t.session_id === $.value,
              onResume: (k) => we(t),
              onRestart: (k) => _e(t),
              onPreview: (k) => Se(t),
              onFavorite: (k) => xe(t),
              onRename: (k) => Ce(t, k),
              onDelete: (k) => Me(t)
            }, null, 8, ["session", "agent", "providers", "favorite", "active", "onResume", "onRestart", "onPreview", "onFavorite", "onRename", "onDelete"]))), 128))
          ]),
          !p.value && A.value > 1 ? (o(), u("nav", $t, [
            a("span", Ct, _(i.value) + "–" + _(n.value) + " of " + _(D.value.length), 1),
            a("div", Mt, [
              a("button", {
                class: "kx-pager-btn",
                disabled: w.value <= 1,
                "aria-label": "Previous page",
                onClick: e[4] || (e[4] = (t) => v(w.value - 1))
              }, [
                l(r(d), {
                  icon: "tabler:chevron-left",
                  "aria-hidden": "true"
                })
              ], 8, St),
              (o(!0), u(z, null, ce(c.value, (t, k) => (o(), u(z, { key: k }, [
                t === "…" ? (o(), u("span", Et, "…")) : (o(), u("button", {
                  key: 1,
                  class: M(["kx-pager-num", { "kx-pager-cur": t === w.value }]),
                  onClick: (oe) => v(t)
                }, _(t), 11, Rt))
              ], 64))), 128)),
              a("button", {
                class: "kx-pager-btn",
                disabled: w.value >= A.value,
                "aria-label": "Next page",
                onClick: e[5] || (e[5] = (t) => v(w.value + 1))
              }, [
                l(r(d), {
                  icon: "tabler:chevron-right",
                  "aria-hidden": "true"
                })
              ], 8, Dt)
            ])
          ])) : S("", !0)
        ], 64)) : (o(), u("div", wt, [...e[17] || (e[17] = [
          a("div", { class: "kx-empty-title" }, "No matches", -1),
          a("div", { class: "kx-empty-sub" }, "No sessions match the current search.", -1)
        ])])) : (o(), u("div", bt, [
          a("div", yt, [
            l(r(d), {
              icon: "tabler:message-plus",
              "aria-hidden": "true"
            })
          ]),
          e[14] || (e[14] = a("div", { class: "kx-empty-title" }, "No sessions yet", -1)),
          e[15] || (e[15] = a("div", { class: "kx-empty-sub" }, "Chats you start will show up here, ready to resume or restart.", -1))
        ]))
      ]),
      l(nt, {
        open: se.value,
        title: me.value,
        messages: ae.value,
        loading: ne.value,
        error: ie.value,
        onClose: e[6] || (e[6] = (t) => se.value = !1)
      }, null, 8, ["open", "title", "messages", "loading", "error"])
    ], 2));
  }
}), It = {
  rootComponent: Lt,
  plugins: [Re]
};
export {
  It as mountConfig
};
//# sourceMappingURL=index-mount-Cjm-8Ijp.js.map
