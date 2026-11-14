const o = "main", g = "chat", w = "artifact", c = "app.views:main";
function r(n) {
  return typeof n == "object" && n !== null;
}
function _(n) {
  return n?.layout.snapshot ?? null;
}
function y(n) {
  if (!r(n)) return "";
  const t = n;
  return String(t.uuid || t.artifactId || "");
}
function O(n) {
  if (!r(n)) return "";
  const t = n;
  return String(t.sessionId || t.session_id || "");
}
function d(n) {
  const t = n.indexOf("#"), s = t >= 0 ? n.slice(t) : "", e = t >= 0 ? n.slice(0, t) : n, i = e.indexOf("?");
  return {
    path: i >= 0 ? e.slice(0, i) : e,
    search: i >= 0 ? e.slice(i) : "",
    hash: s
  };
}
function a(n) {
  return n === "/sessions" || n.startsWith("/sessions/");
}
function u(n) {
  if (!n.startsWith("/sessions/")) return "";
  const t = n.slice(10).split("/")[0] || "";
  try {
    return decodeURIComponent(t);
  } catch {
    return t;
  }
}
function R(n) {
  return n.split("/")[1] ?? "";
}
function D(n) {
  return `/sessions/${encodeURIComponent(n)}`;
}
function A(n) {
  return a(n.path) && !u(n.path) && new URLSearchParams(n.search).get("view") === "artifacts";
}
function C(n) {
  return a(n.path) && !u(n.path) && !A(n);
}
function P(n) {
  const t = n?.panels?.[o];
  return !r(t) || t.kind !== "page" || t.id !== c ? null : typeof t.route == "string" && t.route.startsWith("/") ? t.route : null;
}
function m(n) {
  const t = n?.panels?.[o];
  return r(t) && t.kind === "page" && t.id === c;
}
function S(n, t) {
  return m(n) ? a(d(P(n) ?? t).path) : !1;
}
function N(n, t, s) {
  return n === o && S(t, s);
}
function f(n, t) {
  if (!Array.isArray(n)) return null;
  for (const s of n) {
    if (!r(s)) continue;
    if (typeof s.panel == "string") {
      if (s.panel === t) return s;
      continue;
    }
    const e = f(s.children, t);
    if (e) return e;
  }
  return null;
}
function I(n, t) {
  return t && n.layouts?.[t] ? t : "default";
}
function p(n, t, s) {
  const e = n.layouts?.[I(n, t)];
  return r(e) ? f(e.children, s) : null;
}
function l(n) {
  return !!n?.display && n.display.startsWith("drawer-");
}
function h(n, t) {
  const s = n.panels?.[t];
  return r(s) && s.drawerOpen === !0;
}
function E(n, t, s) {
  const e = p(n, t, s);
  return e ? l(e) ? h(n, s) : !e.collapsed : !1;
}
function L(n, t, s) {
  return l(p(n, t, s)) && h(n, s);
}
function W(n, t) {
  const s = n?.panels?.[t];
  return r(s) && r(s.props) ? s.props : {};
}
export {
  w as A,
  g as C,
  N as a,
  y as b,
  I as c,
  W as d,
  O as e,
  l as f,
  p as g,
  L as h,
  a as i,
  r as j,
  E as k,
  _ as l,
  P as m,
  D as n,
  R as o,
  d as p,
  C as q,
  u as s
};
//# sourceMappingURL=hostRoute-CHFKAd6h.js.map
