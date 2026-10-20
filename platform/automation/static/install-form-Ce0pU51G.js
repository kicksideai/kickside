import { computed as a } from "vue";
function l(t) {
  return a(() => {
    const e = t.value;
    return e ? (typeof e.parentId == "string" ? e.parentId : "").trim() : "";
  });
}
function c(t) {
  if (t == null || t === "") return {};
  const e = typeof t == "string" ? JSON.parse(t) : t;
  if (!e || typeof e != "object" || Array.isArray(e)) throw new Error("Install input must be an object.");
  return e;
}
function o(t) {
  const e = t.inputs?.properties || {};
  return Object.entries(e);
}
function u(t, e) {
  return (t.inputs?.required || []).includes(e);
}
function y(t) {
  return t.type === "password" || t.format === "password" || t.sensitive === !0 ? "password" : "text";
}
function d(t) {
  const e = {};
  for (const [r, n] of o(t))
    n.default !== void 0 ? e[r] = n.default : n.type === "boolean" ? e[r] = !1 : e[r] = "";
  return e;
}
function b(t, e) {
  for (const r of t.inputs?.required || []) {
    const n = e[r];
    if (n === "" || n === void 0 || n === null)
      return `${t.inputs?.properties?.[r]?.title || r} is required.`;
  }
  for (const [r, n] of o(t)) {
    const s = e[r];
    if (s === "" || s === void 0 || n.type !== "object" && n.type !== "array") continue;
    let i = s;
    if (typeof s == "string")
      try {
        i = JSON.parse(s);
      } catch {
        return `${n.title || r} must be a JSON ${n.type}.`;
      }
    if (n.type === "array" ? !Array.isArray(i) : i === null || typeof i != "object" || Array.isArray(i))
      return `${n.title || r} must be a JSON ${n.type}.`;
  }
  return "";
}
function m(t, e) {
  const r = {};
  for (const [n, s] of Object.entries(e)) {
    if (s === "" && !u(t, n)) continue;
    const i = t.inputs?.properties?.[n];
    r[n] = (i?.type === "object" || i?.type === "array") && typeof s == "string" ? JSON.parse(s) : s;
  }
  return r;
}
function p(t, e) {
  return t.enum_labels?.[e] || e;
}
function v(t, e, r) {
  const n = (r.enum || []).map((s) => ({ label: p(r, s), value: s }));
  return u(t, e) ? n : [{ label: "—", value: "" }, ...n];
}
export {
  y as a,
  m as b,
  c,
  d,
  v as e,
  o as f,
  u as i,
  l as u,
  b as v
};
//# sourceMappingURL=install-form-Ce0pU51G.js.map
