import { u as at, a as rt, W as it } from "./wc-runtime-BJD-5iaH.js";
import { defineComponent as ct, onMounted as ut, onBeforeUnmount as lt, openBlock as pt, createElementBlock as ft } from "vue";
import { getLayoutManager as ht, on as dt, define as gt } from "@wippy-fe/proxy";
import { p as j, l as M, c as C, d as m, m as mt, e as S, i as J, b as W, C as s, f as T, g as U, h as b, j as V, k as q, s as yt, A as z } from "./hostRoute-C2evkQJy.js";
import "@iconify/vue";
const kt = { "aria-hidden": "true" }, Pt = "kickside:chat-start", vt = /* @__PURE__ */ ct({
  __name: "ChatCoordinator",
  setup(Q) {
    const a = at(), y = rt(), o = a ? ht(a) : null, p = [];
    let w = window.location.pathname, c = j(w), B = "default", _ = "|", $ = !1, I = "", i = null;
    const k = /* @__PURE__ */ new Map();
    function u(t) {
      return typeof t == "string" ? t : "";
    }
    function l() {
      return a?.layout.snapshot ?? null;
    }
    function f(t) {
      const n = mt(t);
      return j(n ?? w);
    }
    function A(t) {
      return `${t.path}${t.search}`;
    }
    function D(t) {
      const n = S(t, s);
      return `${u(n.sessionId)}|${u(n.startToken)}`;
    }
    function P(t) {
      a?.layout.updatePanel(s, { props: t });
    }
    function E(t) {
      !o || !t || (J(W(t, o.activeBreakpoint, s)) ? o.openDrawer(s) : o.expandPanel(s));
    }
    function d(t) {
      !o || !t || (J(W(t, o.activeBreakpoint, s)) ? o.closeDrawer(s) : o.collapsePanel(s));
    }
    function X(t) {
      o && C(t, o.activeBreakpoint, z) && o.closeDrawer(z);
    }
    function N(t) {
      for (const [n, e] of Object.entries(t?.floating ?? {}))
        !T(e) || !T(e.props) || e.props.target !== s || k.has(n) || (k.set(n, JSON.parse(JSON.stringify(e))), a?.layout.removeFloating(n));
    }
    function O() {
      for (const [t, n] of k) a?.layout.addFloating(t, n);
      k.clear();
    }
    function R(t, n) {
      !t || !T(t.context) || a?.setContext(t.context, n, t.source);
    }
    function F(t, n) {
      return m(n.path) || t.sidebar === !1;
    }
    function g(t) {
      const n = i !== null != (t !== null);
      i = t, n && y?.broadcast(Pt, { pending: t !== null });
    }
    function L() {
      const t = i;
      t && (g(null), P({ startToken: null, sessionId: t.previousSessionId || null }));
    }
    function Y(t, n) {
      const e = l(), r = f(e);
      if (R(t.context, n), F(t, r)) {
        L(), a?.navigate(b(n));
        return;
      }
      g(null), P({ sessionId: n, startToken: null }), E(e);
    }
    function Z(t, n) {
      const e = l(), r = f(e), h = F(t, r), v = i ? i.previousSessionId : u(S(e, s).sessionId);
      g({ token: n, fullPage: h, context: t.context, section: V(r.path), previousSessionId: v }), h && o && e && U(e, o.activeBreakpoint, s) && d(e), P({ startToken: n, sessionId: null }), h || E(e);
    }
    function tt(t) {
      const n = i;
      if (!n || (g(null), u(S(l(), s).startToken) !== n.token)) return;
      if (R(n.context, t), n.fullPage) {
        a?.navigate(b(t));
        return;
      }
      const e = f(l());
      q(e) && a?.navigate(`${b(t)}${e.search}${e.hash}`);
    }
    function nt(t) {
      if (t.channel !== "@HOST/intent" || !T(t.payload)) return;
      const n = t.payload, e = u(n.uuid), r = u(n.startToken);
      if (n.intent === "openSession" && e) {
        t.sourcePanelId === s ? tt(e) : Y(n, e);
        return;
      }
      n.intent === "startChat" && r && Z(n, r);
    }
    function et(t, n, e) {
      let r = u(S(e, s).sessionId);
      i?.fullPage && V(n.path) !== i.section && (r = i.previousSessionId, L());
      const h = m(t.path), v = m(n.path);
      if (v && !h)
        d(e), N(e), r && q(n) && a?.navigate(`${b(r)}${n.search}${n.hash}`);
      else if (!v && h) {
        const H = yt(t.path);
        H && P({ sessionId: H, startToken: null }), d(e), O();
      }
    }
    function ot(t) {
      if (!o) return;
      const n = D(t);
      n !== _ && (n === "|" && g(null), _ = n);
      const e = C(t, o.activeBreakpoint, s);
      e && !$ && X(t), $ = e;
    }
    function K(t) {
      const n = o ? C(t, o.activeBreakpoint, s) : !1;
      return `${A(f(t))}#${D(t)}#${n}`;
    }
    function x() {
      const t = l();
      if (!t) return;
      const n = K(t);
      if (n === I) return;
      I = n;
      const e = c;
      c = f(t), A(e) !== A(c) && et(e, c, t), ot(t);
    }
    function st() {
      const t = l();
      if (!o || !t) return;
      const n = M(t, o.activeBreakpoint), e = B;
      n !== e && (B = n, U(t, e, s) && !m(c.path) ? E(t) : d(t));
    }
    return ut(() => {
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
      c = f(t), B = M(t, o.activeBreakpoint), _ = D(t), $ = C(t, o.activeBreakpoint, s), I = K(t), m(c.path) && (d(t), N(t)), p.push(y.subscribe(nt)), p.push(o.on("change", x)), p.push(o.on("breakpoint", st)), p.push(dt("@history", ({ path: n }) => {
        w = n, x();
      }));
    }), lt(() => {
      p.forEach((t) => t()), p.length = 0, L(), O();
    }), (t, n) => (pt(), ft("span", kt));
  }
});
class G extends it {
  static get wippyConfig() {
    return { propsSchema: { type: "object", properties: {} } };
  }
  static get vueConfig() {
    return { rootComponent: vt };
  }
}
async function Bt() {
  return G;
}
gt(import.meta.url, G);
export {
  Bt as webComponent
};
//# sourceMappingURL=chat_coordinator.js.map
