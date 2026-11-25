import { u as Le, a as xe, W as $e } from "./wc-runtime-D-UdhneU.js";
import { defineComponent as He, onMounted as Ne, onBeforeUnmount as Fe, openBlock as Ke, createElementBlock as je, nextTick as Ue } from "vue";
import { getLayoutManager as We, on as ze, config as Je, define as Qe } from "@wippy-fe/proxy";
import { p as he, f as ye, A as te, C as i, g as O, l as Ve, d as Xe, h as H, j as ge, k as me, n as we, i as q, o as ne, M, m as se, q as N, r as be, c as oe, s as ve } from "./hostRoute-zAgJIcxb.js";
import { C as Ge, a as Ye, b as Ze, e as et, c as tt, s as nt } from "./chatStart-BnNVHJnO.js";
function st(w, k, r) {
  let c = null, u = "", l = "", g = 0;
  function h() {
    !c || !u || u !== k() || l === c.value || (l = c.value, g++, r.write(u, l));
  }
  function b() {
    const f = w.querySelector("textarea.chat-input__textarea"), d = k();
    if (f === c && d === u) {
      h();
      return;
    }
    const B = u;
    c = f, u = d;
    const m = ++g;
    if (!f || !d) return;
    l = f.value, B && B !== d && D(""), r.read(d).then((S) => {
      m === g && d === k() && S !== void 0 && D(S);
    });
    function D(S) {
      !f || f.value === S || (l = f.value = S, f.dispatchEvent(new Event("input", { bubbles: !0, composed: !0 })));
    }
  }
  const v = (f) => {
    f.target === c && h();
  };
  w.addEventListener("input", v);
  const R = new MutationObserver(b);
  return R.observe(w, { subtree: !0, childList: !0, attributes: !0, attributeFilter: ["disabled"] }), b(), {
    sync: b,
    dispose() {
      g++, R.disconnect(), w.removeEventListener("input", v);
    }
  };
}
const ot = 100;
function rt(w) {
  const k = w();
  let r = !!k;
  const c = /* @__PURE__ */ new Map();
  function u() {
    return r && k !== w() && (c.clear(), r = !1), r;
  }
  return {
    async read(l) {
      return u() ? c.get(l) ?? "" : void 0;
    },
    write(l, g) {
      if (u() && (c.delete(l), g && c.set(l, g), c.size > ot)) {
        const h = c.keys().next().value;
        h && c.delete(h);
      }
    }
  };
}
const at = { "aria-hidden": "true" }, Se = "chat-tab", Ce = "kickside:chat-draft", it = '[data-wippy-panel-mount="chat"] .layout-chat-wrapper', ct = /* @__PURE__ */ He({
  __name: "ChatCoordinator",
  setup(w) {
    const k = {
      kind: "builtin",
      id: "@HOST/panel-tab",
      chrome: !1,
      anchor: { right: 0, top: "50%" },
      position: { x: 0, y: 0 },
      size: { width: 48, height: 80 },
      props: { target: i, mode: "auto", label: "Open chat" }
    }, r = Le(), c = xe(), u = r ? We(r) : null, l = rt(() => Je.auth?.token);
    let g = null, h, b;
    const v = [], R = () => window.location.pathname + window.location.search + window.location.hash;
    let f = R(), d = he(f), B = "", m = null, D = "default", S = "|", ke = 0, W = !1, z = !1, J = "", o = null, L = null;
    const x = /* @__PURE__ */ new Map();
    function C(e) {
      return typeof e == "string" ? e : "";
    }
    function y() {
      return Ve(r);
    }
    function T() {
      if (!u) throw new Error("[kickside-chat-coordinator] used before it started");
      return u;
    }
    function A(e) {
      const t = Xe(e);
      return he(t ?? f);
    }
    function F(e) {
      return `${e.path}${e.search}${e.hash}`;
    }
    function Q(e) {
      const t = H(e, i);
      return `${C(t.sessionId)}|${t.startRequest ?? ""}`;
    }
    function _(e) {
      "sessionId" in e && (L = C(e.sessionId)), r?.layout.updatePanel(i, { props: e });
    }
    function Te(e) {
      const t = H(e, i);
      o && t.startRequest === o.request && !C(t.sessionId) && (o.seen = !0), L !== null && C(t.sessionId) === L && (L = null);
    }
    function V(e) {
      if (!e) return;
      const t = T();
      ge(me(e, t.activeBreakpoint, i)) ? t.openDrawer(i) : t.expandPanel(i);
    }
    function $(e) {
      if (!e) return;
      const t = T();
      ge(me(e, t.activeBreakpoint, i)) ? t.closeDrawer(i) : t.collapsePanel(i);
    }
    function X(e) {
      const t = T().activeBreakpoint;
      return {
        chat: we(e, t, i),
        artifact: we(e, t, te)
      };
    }
    function Ae(e) {
      const { chat: t, artifact: n } = X(e);
      if (t && n) {
        const s = !W;
        !z && !s ? T().closeDrawer(i) : s && T().closeDrawer(te);
      }
      W = t, z = n;
    }
    function re(e) {
      for (const [t, n] of Object.entries(e?.floating ?? {}))
        !q(n) || !q(n.props) || n.props.target !== i || x.has(t) || (x.set(t, JSON.parse(JSON.stringify(n))), r?.layout.removeFloating(t));
    }
    function G() {
      for (const [e, t] of x) r?.layout.addFloating(e, t);
      x.clear();
    }
    function ae(e, t) {
      m = { sessionId: e, from: t }, K();
    }
    function K() {
      if (!m) return;
      const { sessionId: e, from: t } = m, n = F(t);
      R() !== n || B !== n || (m = null, r?.navigate(`${oe(e)}${t.search}${t.hash}`, { replace: !0 }));
    }
    function ie(e, t) {
      !e || !q(e.context) || r?.setContext(e.context, t, e.source);
    }
    function ce(e, t) {
      return O(t.path) || e.sidebar === !1;
    }
    function Y(e, t, n) {
      c?.send(e.target, Ye, { id: e.id, state: t, error: n });
    }
    function P(e, t = "failed", n = "Chat start was cancelled.") {
      const s = o !== null != (e !== null), a = o;
      a?.controller.abort(), o = e, a?.screen && Y(a.screen, t, t === "failed" ? n : void 0), s && c?.broadcast(Ze, { pending: e !== null });
    }
    function j(e) {
      const t = o;
      t && (P(null, "failed", e), _({ startRequest: null, sessionId: t.previousSessionId || null }));
    }
    function _e(e, t) {
      const n = y(), s = A(n);
      if (ie(e.context, t), ce(e, s)) {
        j(), r?.navigate(oe(t));
        return;
      }
      P(null), _({ sessionId: t, startRequest: null }), V(n);
    }
    async function Pe(e) {
      let t;
      try {
        t = await et(e.token, e.controller.signal);
      } catch {
        if (o !== e) return;
        j("Could not start chat. Please try again."), e.screen || r?.toast({ severity: "error", summary: "Could not start chat" });
        return;
      }
      if (o !== e) {
        tt(t);
        return;
      }
      if (ie(e.context, t), e.screen?.firstMessage) {
        const s = e.screen.firstMessage, a = await nt(t, s);
        if (o !== e) return;
        a === "rejected" ? (l.write(t, s), r?.toast({ severity: "error", summary: "Could not send the first message", detail: "The text is still in your draft." })) : a === "unconfirmed" && r?.toast({ severity: "warn", summary: "First message delivery is unconfirmed", detail: "Check the chat history before sending it again." });
      }
      if (P(null, "finished"), e.fullPage) {
        _({ sessionId: e.previousSessionId || null, startRequest: null }), r?.navigate(oe(t));
        return;
      }
      _({ sessionId: t, startRequest: null });
      const n = A(y());
      N(n) && ae(t, n);
    }
    function ue(e, t, n) {
      const s = y(), a = A(s), p = ce(e, a), I = be(a.path);
      if (p && s && ne(s, T().activeBreakpoint, i) && $(s), !n && !o?.screen && o?.token === t && o)
        Object.assign(o, { fullPage: p, context: e.context, section: I });
      else {
        const U = o?.previousSessionId ?? L ?? C(H(s, i).sessionId), E = {
          token: t,
          controller: new AbortController(),
          request: ++ke,
          fullPage: p,
          context: e.context,
          section: I,
          previousSessionId: U,
          screen: n,
          seen: !1
        };
        P(E), n && Y(n, "accepted"), _({ startRequest: E.request, sessionId: null }), Pe(E);
      }
      p || V(s);
    }
    function Re() {
      return C(H(y(), i).sessionId);
    }
    function Z(e) {
      const t = ne(e, T().activeBreakpoint, i), n = t ? document.querySelector(it) : null;
      n !== g && (b?.dispose(), g = n, b = n ? st(n, Re, l) : void 0), !t || n ? (h?.disconnect(), h = void 0) : h || (h = new MutationObserver(() => {
        const s = y();
        s && Z(s);
      }), h.observe(document.body, { childList: !0, subtree: !0 })), b?.sync();
    }
    function le(e) {
      const t = y();
      return se(t) && ve(A(t).path) === e;
    }
    async function De(e) {
      if (e.sourcePanelId !== M || !q(e.payload)) return;
      const { kind: t, sessionId: n, requestId: s, draft: a } = e.payload;
      if (!(typeof n != "string" || !n || !le(n)) && (t === "write" && typeof a == "string" && l.write(n, a), t === "read" && typeof s == "number")) {
        const p = await l.read(n);
        le(n) && c?.send(M, Ce, { requestId: s, draft: p });
      }
    }
    function Ee(e) {
      if (e.channel === Ge) {
        const a = e.sourcePanelId;
        if (a !== M && a !== i || !q(e.payload)) return;
        const { id: p, token: I, message: ee } = e.payload;
        if (typeof p != "string" || !p || typeof I != "string" || !I || typeof ee != "string") return;
        const U = { id: p, target: a, firstMessage: ee.trim() }, E = y(), pe = A(E), Be = a === M ? se(E) && N(pe) : !O(pe.path);
        if (o || !Be) {
          Y(U, "failed", o ? "Another chat is starting." : "This chat screen is no longer active.");
          return;
        }
        ue({ sidebar: a === i }, I, U);
        return;
      }
      if (e.channel === Ce) {
        De(e);
        return;
      }
      if (e.channel !== "@HOST/intent" || !q(e.payload)) return;
      if (e.payload.intent === "routeChanged" && e.sourcePanelId === M && se(y()) && typeof e.payload.route == "string") {
        B = e.payload.route, K();
        return;
      }
      const t = e.payload, n = C(t.uuid), s = C(t.startToken);
      if (t.intent === "openSession" && n) {
        e.sourcePanelId === i ? (o && (P(null), _({ sessionId: n, startRequest: null })), Ue(() => b?.sync())) : _e(t, n);
        return;
      }
      t.intent === "startChat" && s && ue(t, s);
    }
    function Oe(e, t, n) {
      m && (N(t) ? m.from = t : m = null);
      let s = C(H(n, i).sessionId);
      o?.fullPage && (be(t.path) !== o.section || o.screen?.target === M && !N(t)) && (s = o.previousSessionId, j());
      const a = O(e.path), p = O(t.path);
      if (p && !a)
        $(n), re(n), s && N(t) && ae(s, t);
      else if (!p && a) {
        const I = ve(e.path);
        I && (P(null), _({ sessionId: I, startRequest: null })), $(n), G();
      }
    }
    function qe(e) {
      const t = Q(e);
      t !== S && (t === "|" && (o?.seen && P(null), m = null), S = t), Ae(e);
    }
    function fe(e) {
      const { chat: t, artifact: n } = X(e);
      return `${F(A(e))}#${Q(e)}#${t}#${n}`;
    }
    function de() {
      const e = y();
      if (!e) return;
      Te(e), Z(e);
      const t = fe(e);
      if (t === J) {
        K();
        return;
      }
      J = t;
      const n = d;
      d = A(e), F(n) !== F(d) && Oe(n, d, e), qe(e), K();
    }
    function Me() {
      const e = y();
      if (!e) return;
      const t = ye(e, T().activeBreakpoint), n = D;
      t !== n && (D = t, ne(e, n, i) && !O(d.path) ? V(e) : $(e));
    }
    return Ne(() => {
      const e = y();
      if (!r || !u || !c || !e) {
        console.error("[kickside-chat-coordinator] not started: needs a managed layout host with a layout manager, a layout bus and a layout snapshot", {
          host: !!r,
          manager: !!u,
          bus: !!c,
          snapshot: !!e
        });
        return;
      }
      d = A(e), D = ye(e, u.activeBreakpoint), S = Q(e);
      const { chat: t, artifact: n } = X(e);
      t && n && u.closeDrawer(te), W = t, z = n && !t, J = fe(e), e.floating?.[Se] || x.set(Se, k), O(d.path) ? ($(e), re(e)) : G(), Z(e), v.push(c.subscribe(Ee)), v.push(u.on("change", de)), v.push(u.on("breakpoint", Me)), v.push(ze("@history", ({ path: s }) => {
        f = s === window.location.pathname ? R() : s, de();
      }));
    }), Fe(() => {
      v.forEach((e) => e()), v.length = 0, h?.disconnect(), b?.dispose(), j(), G();
    }), (e, t) => (Ke(), je("span", at));
  }
});
class Ie extends $e {
  static get wippyConfig() {
    return { propsSchema: { type: "object", properties: {} } };
  }
  static get vueConfig() {
    return { rootComponent: ct };
  }
}
async function ht() {
  return Ie;
}
Qe(import.meta.url, Ie);
export {
  ht as webComponent
};
//# sourceMappingURL=chat_coordinator.js.map
