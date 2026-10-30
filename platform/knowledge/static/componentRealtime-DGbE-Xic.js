import { a, b as u } from "./index-D52CRMw6.js";
import { on as p } from "@wippy-fe/proxy";
const g = () => a(), h = () => u();
function s(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function m(e, t) {
  if (t == null) return t;
  switch (e) {
    case "boolean":
    case "checkbox":
      return typeof t == "boolean" ? t : t === "true" ? !0 : t === "false" ? !1 : t;
    case "number":
    case "integer": {
      if (typeof t == "number") return t;
      if (typeof t == "string" && t.trim() !== "") {
        const o = Number(t);
        if (!Number.isNaN(o)) return o;
      }
      return t;
    }
    case "object":
    case "array":
      if (typeof t == "string")
        try {
          const o = JSON.parse(t);
          if (o && typeof o == "object") return o;
        } catch {
        }
      return t;
    default:
      return t;
  }
}
function d(e, t) {
  if (!t) return e;
  const o = {};
  for (const [n, i] of Object.entries(e))
    o[n] = m(t[n], i);
  return o;
}
function l(e, t, o) {
  if (t !== void 0 && !t) return null;
  const n = s(e) ? e : {}, i = [
    n,
    s(n.data) ? n.data : null,
    s(n.payload) ? n.payload : null,
    s(n.detail) ? n.detail : null
  ].filter(Boolean);
  for (const r of i) {
    if (r.event !== "component.meta.changed") continue;
    const c = String(r.component_id || ""), f = String(n.topic || r.topic || "");
    if (t === void 0) {
      if (!c && (!f.startsWith("component.") || f === "component.")) continue;
    } else if (c && c !== t || !c && f !== `component.${t}`) continue;
    return {
      event: "component.meta.changed",
      component_id: c || t || f.slice(10),
      meta: d(s(r.meta) ? r.meta : {}, o),
      deleted: Array.isArray(r.deleted) ? r.deleted.map(String) : []
    };
  }
  return null;
}
function N(e, t, o) {
  if (!e) return null;
  const n = p(`component.${e}`, (i) => {
    const r = l(i, e, o);
    r && t(r);
  });
  return typeof n == "function" ? n : null;
}
export {
  h as a,
  l as c,
  N as s,
  g as u
};
//# sourceMappingURL=componentRealtime-DGbE-Xic.js.map
