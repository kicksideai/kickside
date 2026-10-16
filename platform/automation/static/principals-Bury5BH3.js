import { api as s } from "@wippy-fe/proxy";
function i(r) {
  const o = r && typeof r == "object" ? r : {};
  return Array.isArray(o.principals) ? o.principals.filter((e) => {
    if (!e || typeof e != "object") return !1;
    const t = e;
    return (t.type === "user" || t.type === "group") && typeof t.id == "string" && typeof t.label == "string";
  }) : [];
}
function n(r, o) {
  const e = r && typeof r == "object" ? r : {};
  if (e.success === !1) {
    const t = typeof e.error == "string" && e.error.trim() ? e.error : `${o} failed`;
    throw new Error(t);
  }
  return e;
}
async function c(r) {
  if (!r.length) return [];
  const { data: o } = await s.post("/api/v1/principals/resolve", { refs: r });
  return i(n(o, "Principal resolution"));
}
export {
  c as r
};
//# sourceMappingURL=principals-Bury5BH3.js.map
