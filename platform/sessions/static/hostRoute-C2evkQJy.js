const a = "main", y = "chat", S = "artifact", c = "app.views:main";
function r(n) {
  return typeof n == "object" && n !== null;
}
function d(n) {
  const s = n.indexOf("#"), t = s >= 0 ? n.slice(s) : "", e = s >= 0 ? n.slice(0, s) : n, i = e.indexOf("?");
  return {
    path: i >= 0 ? e.slice(0, i) : e,
    search: i >= 0 ? e.slice(i) : "",
    hash: t
  };
}
function o(n) {
  return n === "/sessions" || n.startsWith("/sessions/");
}
function u(n) {
  if (!n.startsWith("/sessions/")) return "";
  const s = n.slice(10).split("/")[0] || "";
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}
function _(n) {
  return n.split("/")[1] ?? "";
}
function I(n) {
  return `/sessions/${encodeURIComponent(n)}`;
}
function A(n) {
  return o(n.path) && !u(n.path) && new URLSearchParams(n.search).get("view") === "artifacts";
}
function O(n) {
  return o(n.path) && !u(n.path) && !A(n);
}
function P(n) {
  const s = n?.panels?.[a];
  return !r(s) || s.kind !== "page" || s.id !== c ? null : typeof s.route == "string" && s.route.startsWith("/") ? s.route : null;
}
function m(n) {
  const s = n?.panels?.[a];
  return r(s) && s.kind === "page" && s.id === c;
}
function w(n, s) {
  return m(n) ? o(d(P(n) ?? s).path) : !1;
}
function R(n, s, t) {
  return n === a && w(s, t);
}
function f(n, s) {
  if (!Array.isArray(n)) return null;
  for (const t of n) {
    if (!r(t)) continue;
    if (typeof t.panel == "string") {
      if (t.panel === s) return t;
      continue;
    }
    const e = f(t.children, s);
    if (e) return e;
  }
  return null;
}
function g(n, s) {
  return s && n.layouts?.[s] ? s : "default";
}
function p(n, s, t) {
  const e = n.layouts?.[g(n, s)];
  return r(e) ? f(e.children, t) : null;
}
function l(n) {
  return !!n?.display && n.display.startsWith("drawer-");
}
function h(n, s) {
  const t = n.panels?.[s];
  return r(t) && t.drawerOpen === !0;
}
function D(n, s, t) {
  const e = p(n, s, t);
  return e ? l(e) ? h(n, t) : !e.collapsed : !1;
}
function C(n, s, t) {
  return l(p(n, s, t)) && h(n, t);
}
function N(n, s) {
  const t = n?.panels?.[s];
  return r(t) && r(t.props) ? t.props : {};
}
export {
  S as A,
  y as C,
  R as a,
  p as b,
  C as c,
  o as d,
  N as e,
  r as f,
  D as g,
  I as h,
  l as i,
  _ as j,
  O as k,
  g as l,
  P as m,
  d as p,
  u as s
};
//# sourceMappingURL=hostRoute-C2evkQJy.js.map
