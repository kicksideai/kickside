function u(t) {
  if (!t) return null;
  let e;
  if (typeof t == "number")
    e = t;
  else {
    const n = t.trim();
    if (/^\d+$/.test(n))
      e = Number(n);
    else {
      const r = Date.parse(n);
      return Number.isNaN(r) ? null : r;
    }
  }
  return Number.isFinite(e) ? e < 1e12 ? e * 1e3 : e : null;
}
function i(t, e) {
  const n = u(t);
  return n === null ? "" : new Date(n).toLocaleDateString(void 0, e);
}
export {
  i as f
};
//# sourceMappingURL=datetime--PfqsqnZ.js.map
