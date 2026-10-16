import { a, b as u } from "./index-D52CRMw6.js";
import { on as p } from "@wippy-fe/proxy";
const g = () => a(), h = () => u();
function i(n) {
  return !!n && typeof n == "object" && !Array.isArray(n);
}
function d(n, t) {
  if (t == null) return t;
  switch (n) {
    case "boolean":
    case "checkbox":
      return typeof t == "boolean" ? t : t === "true" ? !0 : t === "false" ? !1 : t;
    case "number":
    case "integer": {
      if (typeof t == "number") return t;
      if (typeof t == "string" && t.trim() !== "") {
        const r = Number(t);
        if (!Number.isNaN(r)) return r;
      }
      return t;
    }
    case "object":
    case "array":
      if (typeof t == "string")
        try {
          const r = JSON.parse(t);
          if (r && typeof r == "object") return r;
        } catch {
        }
      return t;
    default:
      return t;
  }
}
function m(n, t) {
  if (!t) return n;
  const r = {};
  for (const [e, c] of Object.entries(n))
    r[e] = d(t[e], c);
  return r;
}
function y(n, t, r) {
  if (!t) return null;
  const e = i(n) ? n : {}, c = [
    e,
    i(e.data) ? e.data : null,
    i(e.payload) ? e.payload : null,
    i(e.detail) ? e.detail : null
  ].filter(Boolean);
  for (const o of c) {
    if (o.event !== "component.meta.changed") continue;
    const s = String(o.component_id || ""), f = String(e.topic || o.topic || "");
    if (!(s && s !== t) && !(!s && f !== `component.${t}`))
      return {
        event: "component.meta.changed",
        component_id: s || t,
        meta: m(i(o.meta) ? o.meta : {}, r),
        deleted: Array.isArray(o.deleted) ? o.deleted.map(String) : []
      };
  }
  return null;
}
function N(n, t, r) {
  if (!n) return null;
  const e = p(`component.${n}`, (c) => {
    const o = y(c, n, r);
    o && t(o);
  });
  return typeof e == "function" ? e : null;
}
export {
  h as a,
  N as s,
  g as u
};
//# sourceMappingURL=componentRealtime-Bs_cyDpl.js.map
