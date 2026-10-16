function u(a) {
  return a.uuid || a.artifact_id;
}
function f(a) {
  const e = a.updated_at || a.created_at;
  if (!e) return "";
  const i = new Date(e).getTime();
  if (Number.isNaN(i)) return "";
  const t = Math.max(0, Date.now() - i), r = 6e4, n = 60 * r, o = 24 * n;
  return t < r ? "just now" : t < n ? `${Math.floor(t / r)}m ago` : t < o ? `${Math.floor(t / n)}h ago` : t < 7 * o ? `${Math.floor(t / o)}d ago` : new Date(e).toLocaleDateString();
}
export {
  u as a,
  f as b
};
//# sourceMappingURL=artifactPresentation-Dgf5Fs_k.js.map
