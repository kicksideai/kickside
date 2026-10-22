function o(s, t) {
  if (s && typeof s == "object") {
    const r = s, e = r.response?.data?.error;
    if (typeof e == "string") return e;
    if (e && typeof e == "object" && typeof e.message == "string")
      return e.message;
    if (typeof r.message == "string" && r.message) return r.message;
  }
  return t;
}
export {
  o as e
};
//# sourceMappingURL=errMsg-CxKGcp1F.js.map
