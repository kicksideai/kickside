import { u as o } from "./wc-runtime-KO3cNuNo.js";
const a = () => o();
function i(r) {
  const e = r?.response?.data;
  if (e && typeof e == "object") {
    if (typeof e.error == "string" && e.error) return e.error;
    if (typeof e.message == "string" && e.message) return e.message;
  }
  return r instanceof Error ? r.message : String(r);
}
function c(r, e) {
  const n = r || "connected", t = Number(e || 0);
  return n === "connected" && t > 0 && t <= Math.floor(Date.now() / 1e3) ? "expired" : n;
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
//# sourceMappingURL=status-BfNJewNy.js.map
