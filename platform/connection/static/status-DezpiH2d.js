import { u as o } from "./wc-runtime-KO3cNuNo.js";
const a = () => o();
function i(t) {
  const e = t?.response?.data;
  if (e && typeof e == "object") {
    if (typeof e.error == "string" && e.error) return e.error;
    const r = e.error;
    if (r && typeof r == "object" && typeof r.message == "string" && r.message) return r.message;
    if (typeof e.message == "string" && e.message) return e.message;
  }
  return t instanceof Error ? t.message : String(t);
}
function c(t, e) {
  const r = t || "connected", n = Number(e || 0);
  return r === "connected" && n > 0 && n <= Math.floor(Date.now() / 1e3) ? "expired" : r;
}
const d = {
  connected: "Connected",
  expired: "Token expired",
  needs_reauth: "Reconnect required",
  disabled: "Disabled",
  error: "Unavailable"
}, u = {
  connected: "ok",
  expired: "bad",
  needs_reauth: "bad",
  disabled: "muted",
  error: "warn"
}, p = {
  expires_at: "integer",
  refresh_expires_at: "integer",
  oauth_connection: "boolean"
};
export {
  d as C,
  i as a,
  u as b,
  p as c,
  c as r,
  a as u
};
//# sourceMappingURL=status-DezpiH2d.js.map
