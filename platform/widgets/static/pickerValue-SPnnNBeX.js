function s(r, e) {
  if (typeof r != "string" || !r.trim()) return "";
  const t = r.trim();
  if (t.startsWith("{"))
    try {
      const n = JSON.parse(t)[e];
      return typeof n == "string" ? n : n == null ? "" : String(n);
    } catch {
      return "";
    }
  return t;
}
function a(r) {
  if (Array.isArray(r)) return r.map(String).filter(Boolean);
  if (typeof r == "string") {
    const e = r.trim();
    if (!e) return [];
    if (e.startsWith("["))
      try {
        const t = JSON.parse(e);
        if (Array.isArray(t)) return t.map(String).filter(Boolean);
      } catch {
      }
    return e.split(",").map((t) => t.trim()).filter(Boolean);
  }
  return [];
}
export {
  a,
  s as p
};
//# sourceMappingURL=pickerValue-SPnnNBeX.js.map
