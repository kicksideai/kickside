import { u as it, a as ct, W as ut } from "./wc-runtime-BJD-5iaH.js";
import { defineComponent as lt, onMounted as ft, onBeforeUnmount as pt, openBlock as ht, createElementBlock as dt } from "vue";
import { getLayoutManager as gt, on as mt, define as yt } from "@wippy-fe/proxy";
import { p as M, l as J, i as m, m as kt, b as w, c as W, d as U, C as s, e as V, f as S, g as q, h as b, j as z, k as G, s as Pt, A as Q } from "./hostRoute-CVDsnWuq.js";
import "@iconify/vue";
const Ct = { "aria-hidden": "true" }, vt = "kickside:chat-start", wt = /* @__PURE__ */ lt({
  __name: "ChatCoordinator",
  setup(Y) {
    const a = it(), y = ct(), o = a ? gt(a) : null, f = [];
    let T = window.location.pathname, c = M(T), _ = "default", $ = "|", B = !1, I = !1, A = "", i = null;
    const k = /* @__PURE__ */ new Map();
    function u(t) {
      return typeof t == "string" ? t : "";
    }
    function l() {
      return a?.layout.snapshot ?? null;
    }
    function p(t) {
      const n = kt(t);
      return M(n ?? T);
    }
    function D(t) {
      return `${t.path}${t.search}`;
    }
    function E(t) {
      const n = w(t, s);
      return `${u(n.sessionId)}|${u(n.startToken)}`;
    }
    function P(t) {
      a?.layout.updatePanel(s, { props: t });
    }
    function L(t) {
      !o || !t || (W(U(t, o.activeBreakpoint, s)) ? o.openDrawer(s) : o.expandPanel(s));
    }
    function d(t) {
      !o || !t || (W(U(t, o.activeBreakpoint, s)) ? o.closeDrawer(s) : o.collapsePanel(s));
    }
    function C(t) {
      const n = o?.activeBreakpoint;
      return {
        chat: V(t, n, s),
        artifact: V(t, n, Q)
      };
    }
    function Z(t) {
      if (!o) return;
      const { chat: n, artifact: e } = C(t);
      n && e && (!I && B ? o.closeDrawer(s) : o.closeDrawer(Q)), B = n, I = e;
    }
    function O(t) {
      for (const [n, e] of Object.entries(t?.floating ?? {}))
        !S(e) || !S(e.props) || e.props.target !== s || k.has(n) || (k.set(n, JSON.parse(JSON.stringify(e))), a?.layout.removeFloating(n));
    }
    function R() {
      for (const [t, n] of k) a?.layout.addFloating(t, n);
      k.clear();
    }
    function F(t, n) {
      !t || !S(t.context) || a?.setContext(t.context, n, t.source);
    }
    function K(t, n) {
      return m(n.path) || t.sidebar === !1;
    }
    function g(t) {
      const n = i !== null != (t !== null);
      i = t, n && y?.broadcast(vt, { pending: t !== null });
    }
    function N() {
      const t = i;
      t && (g(null), P({ startToken: null, sessionId: t.previousSessionId || null }));
    }
    function tt(t, n) {
      const e = l(), r = p(e);
      if (F(t.context, n), K(t, r)) {
        N(), a?.navigate(b(n));
        return;
      }
      g(null), P({ sessionId: n, startToken: null }), L(e);
    }
    function nt(t, n) {
      const e = l(), r = p(e), h = K(t, r), v = i ? i.previousSessionId : u(w(e, s).sessionId);
      g({ token: n, fullPage: h, context: t.context, section: z(r.path), previousSessionId: v }), h && o && e && q(e, o.activeBreakpoint, s) && d(e), P({ startToken: n, sessionId: null }), h || L(e);
    }
    function et(t) {
      const n = i;
      if (!n || (g(null), u(w(l(), s).startToken) !== n.token)) return;
      if (F(n.context, t), n.fullPage) {
        a?.navigate(b(t));
        return;
      }
      const e = p(l());
      G(e) && a?.navigate(`${b(t)}${e.search}${e.hash}`);
    }
    function ot(t) {
      if (t.channel !== "@HOST/intent" || !S(t.payload)) return;
      const n = t.payload, e = u(n.uuid), r = u(n.startToken);
      if (n.intent === "openSession" && e) {
        t.sourcePanelId === s ? et(e) : tt(n, e);
        return;
      }
      n.intent === "startChat" && r && nt(n, r);
    }
    function st(t, n, e) {
      let r = u(w(e, s).sessionId);
      i?.fullPage && z(n.path) !== i.section && (r = i.previousSessionId, N());
      const h = m(t.path), v = m(n.path);
      if (v && !h)
        d(e), O(e), r && G(n) && a?.navigate(`${b(r)}${n.search}${n.hash}`);
      else if (!v && h) {
        const j = Pt(t.path);
        j && P({ sessionId: j, startToken: null }), d(e), R();
      }
    }
    function at(t) {
      if (!o) return;
      const n = E(t);
      n !== $ && (n === "|" && g(null), $ = n), Z(t);
    }
    function x(t) {
      const { chat: n, artifact: e } = C(t);
      return `${D(p(t))}#${E(t)}#${n}#${e}`;
    }
    function H() {
      const t = l();
      if (!t) return;
      const n = x(t);
      if (n === A) return;
      A = n;
      const e = c;
      c = p(t), D(e) !== D(c) && st(e, c, t), at(t);
    }
    function rt() {
      const t = l();
      if (!o || !t) return;
      const n = J(t, o.activeBreakpoint), e = _;
      n !== e && (_ = n, q(t, e, s) && !m(c.path) ? L(t) : d(t));
    }
    return ft(() => {
      const t = l();
      if (!a || !o || !y || !t) {
        console.error("[kickside-chat-coordinator] not started: needs a managed layout host with a layout manager, a layout bus and a layout snapshot", {
          host: !!a,
          manager: !!o,
          bus: !!y,
          snapshot: !!t
        });
        return;
      }
      c = p(t), _ = J(t, o.activeBreakpoint), $ = E(t), B = C(t).chat, I = C(t).artifact, A = x(t), m(c.path) && (d(t), O(t)), f.push(y.subscribe(ot)), f.push(o.on("change", H)), f.push(o.on("breakpoint", rt)), f.push(mt("@history", ({ path: n }) => {
        T = n, H();
      }));
    }), pt(() => {
      f.forEach((t) => t()), f.length = 0, N(), R();
    }), (t, n) => (ht(), dt("span", Ct));
  }
});
class X extends ut {
  static get wippyConfig() {
    return { propsSchema: { type: "object", properties: {} } };
  }
  static get vueConfig() {
    return { rootComponent: wt };
  }
}
async function Bt() {
  return X;
}
yt(import.meta.url, X);
export {
  Bt as webComponent
};
//# sourceMappingURL=chat_coordinator.js.map
