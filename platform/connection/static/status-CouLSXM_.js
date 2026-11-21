import { a as o } from "./wc-runtime-P07ojyjC.js";
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
}, p = {
  connected: "ok",
  expired: "bad",
  needs_reauth: "bad",
  disabled: "muted",
  error: "warn"
}, u = {
  expires_at: "integer",
  refresh_expires_at: "integer",
  oauth_connection: "boolean"
};
export {
  d as C,
  i as a,
  p as b,
  u as c,
  c as r,
  a as u
};
//# sourceMappingURL=status-CouLSXM_.js.map
