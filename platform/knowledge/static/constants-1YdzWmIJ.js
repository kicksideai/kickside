import { on as p } from "@wippy-fe/proxy";
import { a as m, b as d } from "./index-D52CRMw6.js";
function s(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function l(e, t) {
  if (t == null) return t;
  switch (e) {
    case "boolean":
    case "checkbox":
      return typeof t == "boolean" ? t : t === "true" ? !0 : t === "false" ? !1 : t;
    case "number":
    case "integer": {
      if (typeof t == "number") return t;
      if (typeof t == "string" && t.trim() !== "") {
        const n = Number(t);
        if (!Number.isNaN(n)) return n;
      }
      return t;
    }
    case "object":
    case "array":
      if (typeof t == "string")
        try {
          const n = JSON.parse(t);
          if (n && typeof n == "object") return n;
        } catch {
        }
      return t;
    default:
      return t;
  }
}
function b(e, t) {
  if (!t) return e;
  const n = {};
  for (const [o, c] of Object.entries(e))
    n[o] = l(t[o], c);
  return n;
}
function u(e, t, n) {
  if (t !== void 0 && !t) return null;
  const o = s(e) ? e : {}, c = [
    o,
    s(o.data) ? o.data : null,
    s(o.payload) ? o.payload : null,
    s(o.detail) ? o.detail : null
  ].filter(Boolean);
  for (const r of c) {
    if (r.event !== "component.meta.changed" && r.event !== "component.deleting" && r.event !== "component.deleted") continue;
    const i = String(r.component_id || ""), f = String(o.topic || r.topic || "");
    if (t === void 0) {
      if (!i && (!f.startsWith("component.") || f === "component.")) continue;
    } else if (i && i !== t || !i && f !== `component.${t}`) continue;
    const a = i || t || f.slice(10);
    return r.event !== "component.meta.changed" ? { event: r.event, component_id: a } : {
      event: "component.meta.changed",
      component_id: a,
      meta: b(s(r.meta) ? r.meta : {}, n),
      deleted: Array.isArray(r.deleted) ? r.deleted.map(String) : []
    };
  }
  return null;
}
function y(e, t, n) {
  const o = u(e, t, n);
  return o?.event === "component.meta.changed" ? o : null;
}
function E(e, t) {
  const n = u(e, t);
  return n && n.event !== "component.meta.changed" ? n : null;
}
function N(e, t, n) {
  if (!e) return null;
  const o = p(`component.${e}`, (c) => {
    const r = y(c, e, n);
    r && t(r);
  });
  return typeof o == "function" ? o : null;
}
const j = () => m(), A = () => d();
export {
  y as a,
  A as b,
  E as c,
  N as s,
  j as u
};
//# sourceMappingURL=constants-1YdzWmIJ.js.map
