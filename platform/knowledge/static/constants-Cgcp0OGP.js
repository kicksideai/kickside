import { on as d } from "@wippy-fe/proxy";
import { a as p, b as m } from "./index-D52CRMw6.js";
function s(t) {
  return !!t && typeof t == "object" && !Array.isArray(t);
}
function l(t, e) {
  if (e == null) return e;
  switch (t) {
    case "boolean":
    case "checkbox":
      return typeof e == "boolean" ? e : e === "true" ? !0 : e === "false" ? !1 : e;
    case "number":
    case "integer": {
      if (typeof e == "number") return e;
      if (typeof e == "string" && e.trim() !== "") {
        const n = Number(e);
        if (!Number.isNaN(n)) return n;
      }
      return e;
    }
    case "object":
    case "array":
      if (typeof e == "string")
        try {
          const n = JSON.parse(e);
          if (n && typeof n == "object") return n;
        } catch {
        }
      return e;
    default:
      return e;
  }
}
function b(t, e) {
  if (!e) return t;
  const n = {};
  for (const [r, i] of Object.entries(t))
    n[r] = l(e[r], i);
  return n;
}
function u(t, e, n) {
  if (e !== void 0 && !e) return null;
  const r = s(t) ? t : {}, i = [
    r,
    s(r.data) ? r.data : null,
    s(r.payload) ? r.payload : null,
    s(r.detail) ? r.detail : null
  ].filter(Boolean);
  for (const o of i) {
    if (o.event !== "component.meta.changed" && o.event !== "component.deleting" && o.event !== "component.deleted") continue;
    const c = String(o.component_id || ""), f = String(r.topic || o.topic || "");
    if (e === void 0) {
      if (!c && (!f.startsWith("component.") || f === "component.")) continue;
    } else if (c && c !== e || !c && f !== `component.${e}`) continue;
    const a = c || e || f.slice(10);
    return o.event === "component.deleting" && typeof o.deletion_job_id == "string" && o.deletion_job_id ? { event: o.event, component_id: a, deletion_job_id: o.deletion_job_id } : o.event !== "component.meta.changed" ? { event: o.event, component_id: a } : {
      event: "component.meta.changed",
      component_id: a,
      meta: b(s(o.meta) ? o.meta : {}, n),
      deleted: Array.isArray(o.deleted) ? o.deleted.map(String) : []
    };
  }
  return null;
}
function y(t, e, n) {
  const r = u(t, e, n);
  return r?.event === "component.meta.changed" ? r : null;
}
function _(t, e) {
  const n = u(t, e);
  return n && n.event !== "component.meta.changed" ? n : null;
}
function j(t, e, n) {
  if (!t) return null;
  const r = d(`component.${t}`, (i) => {
    const o = y(i, t, n);
    o && e(o);
  });
  return typeof r == "function" ? r : null;
}
const v = () => p(), E = () => m();
export {
  y as a,
  E as b,
  _ as c,
  j as s,
  v as u
};
//# sourceMappingURL=constants-Cgcp0OGP.js.map
