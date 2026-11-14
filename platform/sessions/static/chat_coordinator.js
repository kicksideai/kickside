import { u as ft, a as pt, W as ht } from "./wc-runtime-BJD-5iaH.js";
import { defineComponent as dt, onMounted as gt, onBeforeUnmount as kt, openBlock as mt, createElementBlock as yt } from "vue";
import { getLayoutManager as Pt, on as wt, define as Ct } from "@wippy-fe/proxy";
import { p as W, c as U, A as F, i as C, l as St, m as vt, d as S, f as V, g as z, C as a, h as G, j as b, k as Q, n as I, o as X, q as Y, s as Tt } from "./hostRoute-CHFKAd6h.js";
import "@iconify/vue";
const bt = { "aria-hidden": "true" }, It = "kickside:chat-start", _t = /* @__PURE__ */ dt({
  __name: "ChatCoordinator",
  setup(tt) {
    const r = ft(), v = pt(), c = r ? Pt(r) : null, h = [];
    let _ = window.location.pathname, l = W(_), $ = "default", B = "|", D = !1, A = !1, O = "", s = null, k = null;
    const T = /* @__PURE__ */ new Map();
    function i(t) {
      return typeof t == "string" ? t : "";
    }
    function f() {
      return St(r);
    }
    function p() {
      if (!c) throw new Error("[kickside-chat-coordinator] used before it started");
      return c;
    }
    function d(t) {
      const n = vt(t);
      return W(n ?? _);
    }
    function E(t) {
      return `${t.path}${t.search}`;
    }
    function L(t) {
      const n = S(t, a);
      return `${i(n.sessionId)}|${i(n.startToken)}`;
    }
    function m(t) {
      "sessionId" in t && (k = i(t.sessionId)), r?.layout.updatePanel(a, { props: t });
    }
    function nt(t) {
      const n = S(t, a);
      s && i(n.startToken) === s.token && !i(n.sessionId) && (s.seen = !0), k !== null && i(n.sessionId) === k && (k = null);
    }
    function N(t) {
      if (!t) return;
      const n = p();
      V(z(t, n.activeBreakpoint, a)) ? n.openDrawer(a) : n.expandPanel(a);
    }
    function y(t) {
      if (!t) return;
      const n = p();
      V(z(t, n.activeBreakpoint, a)) ? n.closeDrawer(a) : n.collapsePanel(a);
    }
    function x(t) {
      const n = p().activeBreakpoint;
      return {
        chat: G(t, n, a),
        artifact: G(t, n, F)
      };
    }
    function et(t) {
      const { chat: n, artifact: e } = x(t);
      if (n && e) {
        const o = !D;
        !A && !o ? p().closeDrawer(a) : o && p().closeDrawer(F);
      }
      D = n, A = e;
    }
    function K(t) {
      for (const [n, e] of Object.entries(t?.floating ?? {}))
        !b(e) || !b(e.props) || e.props.target !== a || T.has(n) || (T.set(n, JSON.parse(JSON.stringify(e))), r?.layout.removeFloating(n));
    }
    function M() {
      for (const [t, n] of T) r?.layout.addFloating(t, n);
      T.clear();
    }
    function H(t, n) {
      !t || !b(t.context) || r?.setContext(t.context, n, t.source);
    }
    function j(t, n) {
      return C(n.path) || t.sidebar === !1;
    }
    function g(t) {
      const n = s !== null != (t !== null);
      s = t, n && v?.broadcast(It, { pending: t !== null });
    }
    function R() {
      const t = s;
      t && (g(null), m({ startToken: null, sessionId: t.previousSessionId || null }));
    }
    function ot(t, n) {
      const e = f(), o = d(e);
      if (H(t.context, n), j(t, o)) {
        R(), r?.navigate(I(n));
        return;
      }
      g(null), m({ sessionId: n, startToken: null }), N(e);
    }
    function st(t, n) {
      const e = f(), o = d(e), u = j(t, o), P = X(o.path), w = s !== null && s.token === n;
      if (s && w)
        s = { ...s, fullPage: u, context: t.context, section: P };
      else {
        const lt = s ? s.previousSessionId : k ?? i(S(e, a).sessionId);
        g({ token: n, fullPage: u, context: t.context, section: P, previousSessionId: lt, seen: !1 });
      }
      u && e && Q(e, p().activeBreakpoint, a) && y(e), w || m({ startToken: n, sessionId: null }), u || N(e);
    }
    function at(t) {
      const n = s;
      if (!n) return;
      const e = i(S(f(), a).startToken);
      if (e && e !== n.token) return;
      if (g(null), e !== n.token) {
        n.seen || m({ sessionId: t, startToken: null });
        return;
      }
      if (H(n.context, t), n.fullPage) {
        r?.navigate(I(t));
        return;
      }
      const o = d(f());
      Y(o) && r?.navigate(`${I(t)}${o.search}${o.hash}`);
    }
    function rt(t) {
      if (t.channel !== "@HOST/intent" || !b(t.payload)) return;
      const n = t.payload, e = i(n.uuid), o = i(n.startToken);
      if (n.intent === "openSession" && e) {
        t.sourcePanelId === a ? at(e) : ot(n, e);
        return;
      }
      n.intent === "startChat" && o && st(n, o);
    }
    function it(t, n, e) {
      let o = i(S(e, a).sessionId);
      s?.fullPage && X(n.path) !== s.section && (o = s.previousSessionId, R());
      const u = C(t.path), P = C(n.path);
      if (P && !u)
        y(e), K(e), o && Y(n) && r?.navigate(`${I(o)}${n.search}${n.hash}`);
      else if (!P && u) {
        const w = Tt(t.path);
        w && (g(null), m({ sessionId: w, startToken: null })), y(e), M();
      }
    }
    function ct(t) {
      const n = L(t);
      n !== B && (n === "|" && s?.seen && g(null), B = n), et(t);
    }
    function q(t) {
      const { chat: n, artifact: e } = x(t);
      return `${E(d(t))}#${L(t)}#${n}#${e}`;
    }
    function J() {
      const t = f();
      if (!t) return;
      nt(t);
      const n = q(t);
      if (n === O) return;
      O = n;
      const e = l;
      l = d(t), E(e) !== E(l) && it(e, l, t), ct(t);
    }
    function ut() {
      const t = f();
      if (!t) return;
      const n = U(t, p().activeBreakpoint), e = $;
      n !== e && ($ = n, Q(t, e, a) && !C(l.path) ? N(t) : y(t));
    }
    return gt(() => {
      const t = f();
      if (!r || !c || !v || !t) {
        console.error("[kickside-chat-coordinator] not started: needs a managed layout host with a layout manager, a layout bus and a layout snapshot", {
          host: !!r,
          manager: !!c,
          bus: !!v,
          snapshot: !!t
        });
        return;
      }
      l = d(t), $ = U(t, c.activeBreakpoint), B = L(t);
      const { chat: n, artifact: e } = x(t);
      n && e && c.closeDrawer(F), D = n, A = e && !n, O = q(t), C(l.path) && (y(t), K(t)), h.push(v.subscribe(rt)), h.push(c.on("change", J)), h.push(c.on("breakpoint", ut)), h.push(wt("@history", ({ path: o }) => {
        _ = o, J();
      }));
    }), kt(() => {
      h.forEach((t) => t()), h.length = 0, R(), M();
    }), (t, n) => (mt(), yt("span", bt));
  }
});
class Z extends ht {
  static get wippyConfig() {
    return { propsSchema: { type: "object", properties: {} } };
  }
  static get vueConfig() {
    return { rootComponent: _t };
  }
}
async function Et() {
  return Z;
}
Ct(import.meta.url, Z);
export {
  Et as webComponent
};
//# sourceMappingURL=chat_coordinator.js.map
