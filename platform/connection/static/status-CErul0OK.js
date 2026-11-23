import { u as o } from "./wc-runtime-Bcuhsx-0.js";
const i = () => o();
function c(r) {
  const e = r?.response?.data;
  if (e && typeof e == "object") {
    if (typeof e.error == "string" && e.error) return e.error;
    const n = e.error;
    if (n && typeof n == "object" && typeof n.message == "string" && n.message) return n.message;
    if (typeof e.message == "string" && e.message) return e.message;
  }
  return r instanceof Error ? r.message : String(r);
}
function u(r, e) {
  const n = r || "connected";
  if (!Object.hasOwn(s, n)) return "unknown";
  const t = Number(e || 0);
  return n === "connected" && t > 0 && t <= Math.floor(Date.now() / 1e3) ? "expired" : n;
}
const s = {
  connected: "Connected",
  expired: "Token expired",
  needs_reauth: "Reconnect required",
  disabled: "Disabled",
  error: "Unavailable",
  unknown: "Status unknown"
}, d = {
  connected: "ok",
  expired: "bad",
  needs_reauth: "bad",
  disabled: "muted",
  error: "warn",
  unknown: "muted"
}, f = {
  expires_at: "integer",
  refresh_expires_at: "integer",
  oauth_connection: "boolean"
};
export {
  s as C,
  c as a,
  d as b,
  f as c,
  u as r,
  i as u
};
//# sourceMappingURL=status-CErul0OK.js.map
