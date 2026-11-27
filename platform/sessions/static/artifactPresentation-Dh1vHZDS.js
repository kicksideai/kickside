import { s as l } from "./wc-runtime-D-UdhneU.js";
import { openBlock as s, createElementBlock as f, mergeProps as c, createElementVNode as C } from "vue";
var m = {
  name: "SpinnerIcon",
  extends: l
};
function p(t) {
  return g(t) || h(t) || y(t) || d();
}
function d() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function y(t, r) {
  if (t) {
    if (typeof t == "string") return u(t, r);
    var e = {}.toString.call(t).slice(8, -1);
    return e === "Object" && t.constructor && (e = t.constructor.name), e === "Map" || e === "Set" ? Array.from(t) : e === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e) ? u(t, r) : void 0;
  }
}
function h(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function g(t) {
  if (Array.isArray(t)) return u(t);
}
function u(t, r) {
  (r == null || r > t.length) && (r = t.length);
  for (var e = 0, n = Array(r); e < r; e++) n[e] = t[e];
  return n;
}
function b(t, r, e, n, o, a) {
  return s(), f("svg", c({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), p(r[0] || (r[0] = [C("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
m.render = b;
function v(t) {
  return t.uuid || t.artifact_id;
}
function $(t) {
  const r = t.updated_at || t.created_at;
  if (!r) return "";
  const e = new Date(r).getTime();
  if (Number.isNaN(e)) return "";
  const n = Math.max(0, Date.now() - e), o = 6e4, a = 60 * o, i = 24 * a;
  return n < o ? "just now" : n < a ? `${Math.floor(n / o)}m ago` : n < i ? `${Math.floor(n / a)}h ago` : n < 7 * i ? `${Math.floor(n / i)}d ago` : new Date(r).toLocaleDateString();
}
export {
  v as a,
  $ as b,
  m as s
};
//# sourceMappingURL=artifactPresentation-Dh1vHZDS.js.map
