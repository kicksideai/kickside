import { p as ue, a as Oe, w as de, i as ce, _ as Be, b as Te, c as Pe, e as X, r as Re, d as Fe, g as Ve, W as He, s as Ue } from "./styles-CeEd04d7.js";
import { B as oe, s as _e, a as M, b as ie, L as Ne, c as P, v as H, d as Ke, U as We, I as fe, e as Ze, f as Ye, r as we, g as Xe, h as Ge, R as qe, i as Je, j as Qe, C as et, k as tt, S as nt, l as ot, W as it, _ as at, p as st, P as rt } from "./package-BMx0qiGW.js";
import { openBlock as v, createElementBlock as k, mergeProps as $, createElementVNode as r, defineComponent as Se, computed as N, withModifiers as K, Fragment as T, createTextVNode as O, toDisplayString as _, createCommentVNode as w, createVNode as g, unref as h, watch as lt, onBeforeUnmount as ut, resolveComponent as pe, resolveDirective as dt, createBlock as R, withCtx as L, Transition as ct, withDirectives as G, renderSlot as B, normalizeClass as E, resolveDynamicComponent as me, ref as I, vModelText as q, renderList as ft, withKeys as be, createSlots as pt } from "vue";
import { on as mt, host as A, define as bt } from "@wippy-fe/proxy";
import { Icon as S } from "@iconify/vue";
function ht() {
  let e = [], t = (c, s, p = 999) => {
    let f = a(c, s, p), b = f.value + (f.key === c ? 0 : p) + 1;
    return e.push({ key: c, value: b }), b;
  }, n = (c) => {
    e = e.filter((s) => s.value !== c);
  }, o = (c, s) => a(c).value, a = (c, s, p = 0) => [...e].reverse().find((f) => !0) || { key: c, value: p }, i = (c) => c && parseInt(c.style.zIndex, 10) || 0;
  return { get: i, set: (c, s, p) => {
    s && (s.style.zIndex = String(t(c, !0, p)));
  }, clear: (c) => {
    c && (n(i(c)), c.style.zIndex = "");
  }, getCurrent: (c) => o(c) };
}
var J = ht(), vt = `
    .p-progressspinner {
        position: relative;
        margin: 0 auto;
        width: 100px;
        height: 100px;
        display: inline-block;
    }

    .p-progressspinner::before {
        content: '';
        display: block;
        padding-top: 100%;
    }

    .p-progressspinner-spin {
        height: 100%;
        transform-origin: center center;
        width: 100%;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        margin: auto;
        animation: p-progressspinner-rotate 2s linear infinite;
    }

    .p-progressspinner-circle {
        stroke-dasharray: 89, 200;
        stroke-dashoffset: 0;
        stroke: dt('progressspinner.colorOne');
        animation:
            p-progressspinner-dash 1.5s ease-in-out infinite,
            p-progressspinner-color 6s ease-in-out infinite;
        stroke-linecap: round;
    }

    @keyframes p-progressspinner-rotate {
        100% {
            transform: rotate(360deg);
        }
    }
    @keyframes p-progressspinner-dash {
        0% {
            stroke-dasharray: 1, 200;
            stroke-dashoffset: 0;
        }
        50% {
            stroke-dasharray: 89, 200;
            stroke-dashoffset: -35px;
        }
        100% {
            stroke-dasharray: 89, 200;
            stroke-dashoffset: -124px;
        }
    }
    @keyframes p-progressspinner-color {
        100%,
        0% {
            stroke: dt('progressspinner.color.one');
        }
        40% {
            stroke: dt('progressspinner.color.two');
        }
        66% {
            stroke: dt('progressspinner.color.three');
        }
        80%,
        90% {
            stroke: dt('progressspinner.color.four');
        }
    }
`, yt = {
  root: "p-progressspinner",
  spin: "p-progressspinner-spin",
  circle: "p-progressspinner-circle"
}, gt = oe.extend({
  name: "progressspinner",
  style: vt,
  classes: yt
}), kt = {
  name: "BaseProgressSpinner",
  extends: _e,
  props: {
    strokeWidth: {
      type: String,
      default: "2"
    },
    fill: {
      type: String,
      default: "none"
    },
    animationDuration: {
      type: String,
      default: "2s"
    }
  },
  style: gt,
  provide: function() {
    return {
      $pcProgressSpinner: this,
      $parentInstance: this
    };
  }
}, $e = {
  name: "ProgressSpinner",
  extends: kt,
  inheritAttrs: !1,
  computed: {
    svgStyle: function() {
      return {
        "animation-duration": this.animationDuration
      };
    }
  }
}, Ct = ["fill", "stroke-width"];
function xt(e, t, n, o, a, i) {
  return v(), k("div", $({
    class: e.cx("root"),
    role: "progressbar"
  }, e.ptmi("root")), [(v(), k("svg", $({
    class: e.cx("spin"),
    viewBox: "25 25 50 50",
    style: i.svgStyle
  }, e.ptm("spin")), [r("circle", $({
    class: e.cx("circle"),
    cx: "50",
    cy: "50",
    r: "20",
    fill: e.fill,
    "stroke-width": e.strokeWidth,
    strokeMiterlimit: "10"
  }, e.ptm("circle")), null, 16, Ct)], 16))], 16);
}
$e.render = xt;
const _t = { key: 0 }, wt = /* @__PURE__ */ Se({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(e) {
    const t = e, n = N(() => t.state.deletion_job === null || ["dead", "cancelled"].includes(t.state.deletion_job?.status || ""));
    return (o, a) => e.state.deleting_at ? (v(), k("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: a[1] || (a[1] = K(() => {
      }, ["stop"])),
      onKeydown: a[2] || (a[2] = K(() => {
      }, ["stop"]))
    }, [
      n.value ? (v(), k(T, { key: 0 }, [
        r("span", null, [
          a[3] || (a[3] = O("Deletion failed", -1)),
          e.state.deletion_job?.last_error ? (v(), k("span", _t, ": " + _(e.state.deletion_job.last_error), 1)) : w("", !0)
        ]),
        g(h(M), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: a[0] || (a[0] = K((i) => o.$emit("retry"), ["stop"]))
        })
      ], 64)) : (v(), k(T, { key: 1 }, [
        g(h($e), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        a[4] || (a[4] = r("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : w("", !0);
  }
});
function U(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function St(e, t) {
  return e;
}
function $t(e, t, n) {
  const o = U(e) ? e : {}, a = [
    o,
    U(o.data) ? o.data : null,
    U(o.payload) ? o.payload : null,
    U(o.detail) ? o.detail : null
  ].filter(Boolean);
  for (const i of a) {
    if (i.event !== "component.meta.changed" && i.event !== "component.deleting" && i.event !== "component.deleted") continue;
    const c = String(i.component_id || ""), s = String(o.topic || i.topic || "");
    if (!c && (!s.startsWith("component.") || s === "component.")) continue;
    const p = c || t || s.slice(10);
    return i.event === "component.deleting" && typeof i.deletion_job_id == "string" && i.deletion_job_id ? { event: i.event, component_id: p, deletion_job_id: i.deletion_job_id } : i.event !== "component.meta.changed" ? { event: i.event, component_id: p } : {
      event: "component.meta.changed",
      component_id: p,
      meta: St(U(i.meta) ? i.meta : {}),
      deleted: Array.isArray(i.deleted) ? i.deleted.map(String) : []
    };
  }
  return null;
}
function Lt(e, t) {
  const n = $t(e, t);
  return n && n.event !== "component.meta.changed" ? n : null;
}
function Dt(e, t, n, o) {
  const a = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Map();
  function c(f, b) {
    const y = e.value.find((F) => t(F) === f), d = i.get(f), C = b?.job_id || d?.deletion_job_id || y?.deletion_job_id, D = d ? d.deletion_job_id : y?.deleting_at ? y.deletion_job_id : void 0;
    if ((d || y?.deleting_at) && C === D) return;
    const x = {
      deleting_at: d?.deleting_at || y?.deleting_at || (/* @__PURE__ */ new Date()).toISOString(),
      deletion_job_id: C
    };
    i.set(f, x), y && (Object.assign(y, x), y.deletion_job = void 0);
  }
  const s = lt(() => e.value, (f, b = []) => {
    const y = f.filter((d) => !a.has(t(d)));
    for (const d of b)
      a.has(t(d)) || y.some((C) => t(C) === t(d)) || d.deleting_at && o?.(t(d));
    if (y.length !== f.length) {
      e.value = y;
      return;
    }
    for (const d of f) {
      d.deleting_at && d.deletion_job === void 0 && !b.includes(d) && (d.deletion_job = null);
      const C = i.get(t(d));
      C && (d.deletion_job_id !== C.deletion_job_id && (d.deletion_job = void 0), Object.assign(d, C));
      const D = b.find((x) => t(x) === t(d));
      d.deletion_job === void 0 && D?.deletion_job_id === d.deletion_job_id && (d.deletion_job = D?.deletion_job);
    }
  }, { immediate: !0 }), p = mt("@message", (f) => {
    const b = Lt(f);
    if (!b) return;
    const y = e.value.find((d) => t(d) === b.component_id);
    b.event === "component.deleted" ? (y && !a.has(b.component_id) && o?.(b.component_id), a.add(b.component_id), i.delete(b.component_id), e.value = e.value.filter((d) => t(d) !== b.component_id)) : y && c(b.component_id, { job_id: b.deletion_job_id });
  });
  return ut(() => {
    s(), typeof p == "function" && p();
  }), { acceptDeletion: c };
}
var Le = {
  name: "TimesIcon",
  extends: ie
};
function Et(e) {
  return It(e) || Mt(e) || jt(e) || zt();
}
function zt() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function jt(e, t) {
  if (e) {
    if (typeof e == "string") return Q(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Q(e, t) : void 0;
  }
}
function Mt(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function It(e) {
  if (Array.isArray(e)) return Q(e);
}
function Q(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function At(e, t, n, o, a, i) {
  return v(), k("svg", $({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Et(t[0] || (t[0] = [r("path", {
    d: "M8.01186 7.00933L12.27 2.75116C12.341 2.68501 12.398 2.60524 12.4375 2.51661C12.4769 2.42798 12.4982 2.3323 12.4999 2.23529C12.5016 2.13827 12.4838 2.0419 12.4474 1.95194C12.4111 1.86197 12.357 1.78024 12.2884 1.71163C12.2198 1.64302 12.138 1.58893 12.0481 1.55259C11.9581 1.51625 11.8617 1.4984 11.7647 1.50011C11.6677 1.50182 11.572 1.52306 11.4834 1.56255C11.3948 1.60204 11.315 1.65898 11.2488 1.72997L6.99067 5.98814L2.7325 1.72997C2.59553 1.60234 2.41437 1.53286 2.22718 1.53616C2.03999 1.53946 1.8614 1.61529 1.72901 1.74767C1.59663 1.88006 1.5208 2.05865 1.5175 2.24584C1.5142 2.43303 1.58368 2.61419 1.71131 2.75116L5.96948 7.00933L1.71131 11.2675C1.576 11.403 1.5 11.5866 1.5 11.7781C1.5 11.9696 1.576 12.1532 1.71131 12.2887C1.84679 12.424 2.03043 12.5 2.2219 12.5C2.41338 12.5 2.59702 12.424 2.7325 12.2887L6.99067 8.03052L11.2488 12.2887C11.3843 12.424 11.568 12.5 11.7594 12.5C11.9509 12.5 12.1346 12.424 12.27 12.2887C12.4053 12.1532 12.4813 11.9696 12.4813 11.7781C12.4813 11.5866 12.4053 11.403 12.27 11.2675L8.01186 7.00933Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Le.render = At;
var De = {
  name: "WindowMaximizeIcon",
  extends: ie
};
function Ot(e) {
  return Rt(e) || Pt(e) || Tt(e) || Bt();
}
function Bt() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Tt(e, t) {
  if (e) {
    if (typeof e == "string") return ee(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? ee(e, t) : void 0;
  }
}
function Pt(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Rt(e) {
  if (Array.isArray(e)) return ee(e);
}
function ee(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function Ft(e, t, n, o, a, i) {
  return v(), k("svg", $({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Ot(t[0] || (t[0] = [r("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14ZM9.77805 7.42192C9.89013 7.534 10.0415 7.59788 10.2 7.59995C10.3585 7.59788 10.5099 7.534 10.622 7.42192C10.7341 7.30985 10.798 7.15844 10.8 6.99995V3.94242C10.8066 3.90505 10.8096 3.86689 10.8089 3.82843C10.8079 3.77159 10.7988 3.7157 10.7824 3.6623C10.756 3.55552 10.701 3.45698 10.622 3.37798C10.5099 3.2659 10.3585 3.20202 10.2 3.19995H7.00002C6.84089 3.19995 6.68828 3.26317 6.57576 3.37569C6.46324 3.48821 6.40002 3.64082 6.40002 3.79995C6.40002 3.95908 6.46324 4.11169 6.57576 4.22422C6.68828 4.33674 6.84089 4.39995 7.00002 4.39995H8.80006L6.19997 7.00005C6.10158 7.11005 6.04718 7.25246 6.04718 7.40005C6.04718 7.54763 6.10158 7.69004 6.19997 7.80005C6.30202 7.91645 6.44561 7.98824 6.59997 8.00005C6.75432 7.98824 6.89791 7.91645 6.99997 7.80005L9.60002 5.26841V6.99995C9.6021 7.15844 9.66598 7.30985 9.77805 7.42192ZM1.4 14H3.8C4.17066 13.9979 4.52553 13.8498 4.78763 13.5877C5.04973 13.3256 5.1979 12.9707 5.2 12.6V10.2C5.1979 9.82939 5.04973 9.47452 4.78763 9.21242C4.52553 8.95032 4.17066 8.80215 3.8 8.80005H1.4C1.02934 8.80215 0.674468 8.95032 0.412371 9.21242C0.150274 9.47452 0.00210008 9.82939 0 10.2V12.6C0.00210008 12.9707 0.150274 13.3256 0.412371 13.5877C0.674468 13.8498 1.02934 13.9979 1.4 14ZM1.25858 10.0586C1.29609 10.0211 1.34696 10 1.4 10H3.8C3.85304 10 3.90391 10.0211 3.94142 10.0586C3.97893 10.0961 4 10.147 4 10.2V12.6C4 12.6531 3.97893 12.704 3.94142 12.7415C3.90391 12.779 3.85304 12.8 3.8 12.8H1.4C1.34696 12.8 1.29609 12.779 1.25858 12.7415C1.22107 12.704 1.2 12.6531 1.2 12.6V10.2C1.2 10.147 1.22107 10.0961 1.25858 10.0586Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
De.render = Ft;
var Ee = {
  name: "WindowMinimizeIcon",
  extends: ie
};
function Vt(e) {
  return Kt(e) || Nt(e) || Ut(e) || Ht();
}
function Ht() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ut(e, t) {
  if (e) {
    if (typeof e == "string") return te(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? te(e, t) : void 0;
  }
}
function Nt(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Kt(e) {
  if (Array.isArray(e)) return te(e);
}
function te(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function Wt(e, t, n, o, a, i) {
  return v(), k("svg", $({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Vt(t[0] || (t[0] = [r("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0ZM6.368 7.952C6.44137 7.98326 6.52025 7.99958 6.6 8H9.8C9.95913 8 10.1117 7.93678 10.2243 7.82426C10.3368 7.71174 10.4 7.55913 10.4 7.4C10.4 7.24087 10.3368 7.08826 10.2243 6.97574C10.1117 6.86321 9.95913 6.8 9.8 6.8H8.048L10.624 4.224C10.73 4.11026 10.7877 3.95982 10.7849 3.80438C10.7822 3.64894 10.7192 3.50063 10.6093 3.3907C10.4994 3.28077 10.3511 3.2178 10.1956 3.21506C10.0402 3.21232 9.88974 3.27002 9.776 3.376L7.2 5.952V4.2C7.2 4.04087 7.13679 3.88826 7.02426 3.77574C6.91174 3.66321 6.75913 3.6 6.6 3.6C6.44087 3.6 6.28826 3.66321 6.17574 3.77574C6.06321 3.88826 6 4.04087 6 4.2V7.4C6.00042 7.47975 6.01674 7.55862 6.048 7.632C6.07656 7.70442 6.11971 7.7702 6.17475 7.82524C6.2298 7.88029 6.29558 7.92344 6.368 7.952ZM1.4 8.80005H3.8C4.17066 8.80215 4.52553 8.95032 4.78763 9.21242C5.04973 9.47452 5.1979 9.82939 5.2 10.2V12.6C5.1979 12.9707 5.04973 13.3256 4.78763 13.5877C4.52553 13.8498 4.17066 13.9979 3.8 14H1.4C1.02934 13.9979 0.674468 13.8498 0.412371 13.5877C0.150274 13.3256 0.00210008 12.9707 0 12.6V10.2C0.00210008 9.82939 0.150274 9.47452 0.412371 9.21242C0.674468 8.95032 1.02934 8.80215 1.4 8.80005ZM3.94142 12.7415C3.97893 12.704 4 12.6531 4 12.6V10.2C4 10.147 3.97893 10.0961 3.94142 10.0586C3.90391 10.0211 3.85304 10 3.8 10H1.4C1.34696 10 1.29609 10.0211 1.25858 10.0586C1.22107 10.0961 1.2 10.147 1.2 10.2V12.6C1.2 12.6531 1.22107 12.704 1.25858 12.7415C1.29609 12.779 1.34696 12.8 1.4 12.8H3.8C3.85304 12.8 3.90391 12.779 3.94142 12.7415Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Ee.render = Wt;
var Zt = oe.extend({
  name: "focustrap-directive"
}), Yt = Ke.extend({
  style: Zt
});
function W(e) {
  "@babel/helpers - typeof";
  return W = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, W(e);
}
function he(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(a) {
      return Object.getOwnPropertyDescriptor(e, a).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function ve(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? he(Object(n), !0).forEach(function(o) {
      Xt(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : he(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function Xt(e, t, n) {
  return (t = Gt(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Gt(e) {
  var t = qt(e, "string");
  return W(t) == "symbol" ? t : t + "";
}
function qt(e, t) {
  if (W(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (W(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Jt = Yt.extend("focustrap", {
  mounted: function(t, n) {
    var o = n.value || {}, a = o.disabled;
    a || (this.createHiddenFocusableElements(t, n), this.bind(t, n), this.autoElementFocus(t, n)), t.setAttribute("data-pd-focustrap", !0), this.$el = t;
  },
  updated: function(t, n) {
    var o = n.value || {}, a = o.disabled;
    a && this.unbind(t);
  },
  unmounted: function(t) {
    this.unbind(t);
  },
  methods: {
    getComputedSelector: function(t) {
      return ':not(.p-hidden-focusable):not([data-p-hidden-focusable="true"])'.concat(t ?? "");
    },
    bind: function(t, n) {
      var o = this, a = n.value || {}, i = a.onFocusIn, c = a.onFocusOut;
      t.$_pfocustrap_mutationobserver = new MutationObserver(function(s) {
        s.forEach(function(p) {
          if (p.type === "childList" && !t.contains(document.activeElement)) {
            var f = function(y) {
              var d = fe(y) ? fe(y, o.getComputedSelector(t.$_pfocustrap_focusableselector)) ? y : H(t, o.getComputedSelector(t.$_pfocustrap_focusableselector)) : H(y);
              return Ze(d) ? d : y.nextSibling && f(y.nextSibling);
            };
            P(f(p.nextSibling));
          }
        });
      }), t.$_pfocustrap_mutationobserver.disconnect(), t.$_pfocustrap_mutationobserver.observe(t, {
        childList: !0
      }), t.$_pfocustrap_focusinlistener = function(s) {
        return i && i(s);
      }, t.$_pfocustrap_focusoutlistener = function(s) {
        return c && c(s);
      }, t.addEventListener("focusin", t.$_pfocustrap_focusinlistener), t.addEventListener("focusout", t.$_pfocustrap_focusoutlistener);
    },
    unbind: function(t) {
      t.$_pfocustrap_mutationobserver && t.$_pfocustrap_mutationobserver.disconnect(), t.$_pfocustrap_focusinlistener && t.removeEventListener("focusin", t.$_pfocustrap_focusinlistener) && (t.$_pfocustrap_focusinlistener = null), t.$_pfocustrap_focusoutlistener && t.removeEventListener("focusout", t.$_pfocustrap_focusoutlistener) && (t.$_pfocustrap_focusoutlistener = null);
    },
    autoFocus: function(t) {
      this.autoElementFocus(this.$el, {
        value: ve(ve({}, t), {}, {
          autoFocus: !0
        })
      });
    },
    autoElementFocus: function(t, n) {
      var o = n.value || {}, a = o.autoFocusSelector, i = a === void 0 ? "" : a, c = o.firstFocusableSelector, s = c === void 0 ? "" : c, p = o.autoFocus, f = p === void 0 ? !1 : p, b = H(t, "[autofocus]".concat(this.getComputedSelector(i)));
      f && !b && (b = H(t, this.getComputedSelector(s))), P(b);
    },
    onFirstHiddenElementFocus: function(t) {
      var n, o = t.currentTarget, a = t.relatedTarget, i = a === o.$_pfocustrap_lasthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(a)) ? H(o.parentElement, this.getComputedSelector(o.$_pfocustrap_focusableselector)) : o.$_pfocustrap_lasthiddenfocusableelement;
      P(i);
    },
    onLastHiddenElementFocus: function(t) {
      var n, o = t.currentTarget, a = t.relatedTarget, i = a === o.$_pfocustrap_firsthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(a)) ? Ne(o.parentElement, this.getComputedSelector(o.$_pfocustrap_focusableselector)) : o.$_pfocustrap_firsthiddenfocusableelement;
      P(i);
    },
    createHiddenFocusableElements: function(t, n) {
      var o = this, a = n.value || {}, i = a.tabIndex, c = i === void 0 ? 0 : i, s = a.firstFocusableSelector, p = s === void 0 ? "" : s, f = a.lastFocusableSelector, b = f === void 0 ? "" : f, y = function(x) {
        return We("span", {
          class: "p-hidden-accessible p-hidden-focusable",
          tabIndex: c,
          role: "presentation",
          "aria-hidden": !0,
          "data-p-hidden-accessible": !0,
          "data-p-hidden-focusable": !0,
          onFocus: x?.bind(o)
        });
      }, d = y(this.onFirstHiddenElementFocus), C = y(this.onLastHiddenElementFocus);
      d.$_pfocustrap_lasthiddenfocusableelement = C, d.$_pfocustrap_focusableselector = p, d.setAttribute("data-pc-section", "firstfocusableelement"), C.$_pfocustrap_firsthiddenfocusableelement = d, C.$_pfocustrap_focusableselector = b, C.setAttribute("data-pc-section", "lastfocusableelement"), t.prepend(d), t.append(C);
    }
  }
});
function ye() {
  Xe({
    variableName: we("scrollbar.width").name
  });
}
function ge() {
  Ye({
    variableName: we("scrollbar.width").name
  });
}
var Qt = `
    .p-dialog {
        max-height: 90%;
        transform: scale(1);
        border-radius: dt('dialog.border.radius');
        box-shadow: dt('dialog.shadow');
        background: dt('dialog.background');
        border: 1px solid dt('dialog.border.color');
        color: dt('dialog.color');
        will-change: transform;
    }

    .p-dialog-content {
        overflow-y: auto;
        padding: dt('dialog.content.padding');
        flex-grow: 1;
    }

    .p-dialog-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-shrink: 0;
        padding: dt('dialog.header.padding');
    }

    .p-dialog-title {
        font-weight: dt('dialog.title.font.weight');
        font-size: dt('dialog.title.font.size');
    }

    .p-dialog-footer {
        flex-shrink: 0;
        padding: dt('dialog.footer.padding');
        display: flex;
        justify-content: flex-end;
        gap: dt('dialog.footer.gap');
    }

    .p-dialog-header-actions {
        display: flex;
        align-items: center;
        gap: dt('dialog.header.gap');
    }

    .p-dialog-top .p-dialog,
    .p-dialog-bottom .p-dialog,
    .p-dialog-left .p-dialog,
    .p-dialog-right .p-dialog,
    .p-dialog-topleft .p-dialog,
    .p-dialog-topright .p-dialog,
    .p-dialog-bottomleft .p-dialog,
    .p-dialog-bottomright .p-dialog {
        margin: 1rem;
    }

    .p-dialog-maximized {
        width: 100vw !important;
        height: 100vh !important;
        top: 0px !important;
        left: 0px !important;
        max-height: 100%;
        height: 100%;
        border-radius: 0;
    }

    .p-dialog .p-resizable-handle {
        position: absolute;
        font-size: 0.1px;
        display: block;
        cursor: se-resize;
        width: 12px;
        height: 12px;
        right: 1px;
        bottom: 1px;
    }

    .p-dialog-enter-active {
        animation: p-animate-dialog-enter 300ms cubic-bezier(.19,1,.22,1);
    }

    .p-dialog-leave-active {
        animation: p-animate-dialog-leave 300ms cubic-bezier(.19,1,.22,1);
    }

    @keyframes p-animate-dialog-enter {
        from {
            opacity: 0;
            transform: scale(0.93);
        }
    }

    @keyframes p-animate-dialog-leave {
        to {
            opacity: 0;
            transform: scale(0.93);
        }
    }
`, en = {
  mask: function(t) {
    var n = t.position, o = t.modal;
    return {
      position: "fixed",
      height: "100%",
      width: "100%",
      left: 0,
      top: 0,
      display: "flex",
      justifyContent: n === "left" || n === "topleft" || n === "bottomleft" ? "flex-start" : n === "right" || n === "topright" || n === "bottomright" ? "flex-end" : "center",
      alignItems: n === "top" || n === "topleft" || n === "topright" ? "flex-start" : n === "bottom" || n === "bottomleft" || n === "bottomright" ? "flex-end" : "center",
      pointerEvents: o ? "auto" : "none"
    };
  },
  root: {
    display: "flex",
    flexDirection: "column",
    pointerEvents: "auto"
  }
}, tn = {
  mask: function(t) {
    var n = t.props, o = ["left", "right", "top", "topleft", "topright", "bottom", "bottomleft", "bottomright"], a = o.find(function(i) {
      return i === n.position;
    });
    return ["p-dialog-mask", {
      "p-overlay-mask p-overlay-mask-enter-active": n.modal
    }, a ? "p-dialog-".concat(a) : ""];
  },
  root: function(t) {
    var n = t.props, o = t.instance;
    return ["p-dialog p-component", {
      "p-dialog-maximized": n.maximizable && o.maximized
    }];
  },
  header: "p-dialog-header",
  title: "p-dialog-title",
  headerActions: "p-dialog-header-actions",
  pcMaximizeButton: "p-dialog-maximize-button",
  pcCloseButton: "p-dialog-close-button",
  content: "p-dialog-content",
  footer: "p-dialog-footer"
}, nn = oe.extend({
  name: "dialog",
  style: Qt,
  classes: tn,
  inlineStyles: en
}), on = {
  name: "BaseDialog",
  extends: _e,
  props: {
    header: {
      type: null,
      default: null
    },
    footer: {
      type: null,
      default: null
    },
    visible: {
      type: Boolean,
      default: !1
    },
    modal: {
      type: Boolean,
      default: null
    },
    contentStyle: {
      type: null,
      default: null
    },
    contentClass: {
      type: String,
      default: null
    },
    contentProps: {
      type: null,
      default: null
    },
    maximizable: {
      type: Boolean,
      default: !1
    },
    dismissableMask: {
      type: Boolean,
      default: !1
    },
    closable: {
      type: Boolean,
      default: !0
    },
    closeOnEscape: {
      type: Boolean,
      default: !0
    },
    showHeader: {
      type: Boolean,
      default: !0
    },
    blockScroll: {
      type: Boolean,
      default: !1
    },
    baseZIndex: {
      type: Number,
      default: 0
    },
    autoZIndex: {
      type: Boolean,
      default: !0
    },
    position: {
      type: String,
      default: "center"
    },
    breakpoints: {
      type: Object,
      default: null
    },
    draggable: {
      type: Boolean,
      default: !0
    },
    keepInViewport: {
      type: Boolean,
      default: !0
    },
    minX: {
      type: Number,
      default: 0
    },
    minY: {
      type: Number,
      default: 0
    },
    appendTo: {
      type: [String, Object],
      default: "body"
    },
    closeIcon: {
      type: String,
      default: void 0
    },
    maximizeIcon: {
      type: String,
      default: void 0
    },
    minimizeIcon: {
      type: String,
      default: void 0
    },
    closeButtonProps: {
      type: Object,
      default: function() {
        return {
          severity: "secondary",
          text: !0,
          rounded: !0
        };
      }
    },
    maximizeButtonProps: {
      type: Object,
      default: function() {
        return {
          severity: "secondary",
          text: !0,
          rounded: !0
        };
      }
    },
    _instance: null
  },
  style: nn,
  provide: function() {
    return {
      $pcDialog: this,
      $parentInstance: this
    };
  }
}, ne = {
  name: "Dialog",
  extends: on,
  inheritAttrs: !1,
  emits: ["update:visible", "show", "hide", "after-hide", "maximize", "unmaximize", "dragstart", "dragend"],
  provide: function() {
    var t = this;
    return {
      dialogRef: N(function() {
        return t._instance;
      })
    };
  },
  data: function() {
    return {
      containerVisible: this.visible,
      maximized: !1,
      focusableMax: null,
      focusableClose: null,
      target: null
    };
  },
  documentKeydownListener: null,
  container: null,
  mask: null,
  content: null,
  headerContainer: null,
  footerContainer: null,
  maximizableButton: null,
  closeButton: null,
  styleElement: null,
  dragging: null,
  documentDragListener: null,
  documentDragEndListener: null,
  lastPageX: null,
  lastPageY: null,
  maskMouseDownTarget: null,
  updated: function() {
    this.visible && (this.containerVisible = this.visible);
  },
  beforeUnmount: function() {
    this.unbindDocumentState(), this.unbindGlobalListeners(), this.destroyStyle(), this.mask && this.autoZIndex && J.clear(this.mask), this.container = null, this.mask = null;
  },
  mounted: function() {
    this.breakpoints && this.createStyle();
  },
  methods: {
    close: function() {
      this.$emit("update:visible", !1);
    },
    onEnter: function() {
      this.$emit("show"), this.target = document.activeElement, this.enableDocumentSettings(), this.bindGlobalListeners(), this.autoZIndex && J.set("modal", this.mask, this.baseZIndex || this.$primevue.config.zIndex.modal);
    },
    onAfterEnter: function() {
      this.focus();
    },
    onBeforeLeave: function() {
      this.modal && !this.isUnstyled && it(this.mask, "p-overlay-mask-leave-active"), this.dragging && this.documentDragEndListener && this.documentDragEndListener();
    },
    onLeave: function() {
      this.$emit("hide"), P(this.target), this.target = null, this.focusableClose = null, this.focusableMax = null;
    },
    onAfterLeave: function() {
      this.autoZIndex && J.clear(this.mask), this.containerVisible = !1, this.unbindDocumentState(), this.unbindGlobalListeners(), this.$emit("after-hide");
    },
    onMaskMouseDown: function(t) {
      this.maskMouseDownTarget = t.target;
    },
    onMaskMouseUp: function() {
      this.dismissableMask && this.modal && this.mask === this.maskMouseDownTarget && this.close();
    },
    focus: function() {
      var t = function(a) {
        return a && a.querySelector("[autofocus]");
      }, n = this.$slots.footer && t(this.footerContainer);
      n || (n = this.$slots.header && t(this.headerContainer), n || (n = this.$slots.default && t(this.content), n || (this.maximizable ? (this.focusableMax = !0, n = this.maximizableButton) : (this.focusableClose = !0, n = this.closeButton)))), n && P(n, {
        focusVisible: !0
      });
    },
    maximize: function(t) {
      this.maximized ? (this.maximized = !1, this.$emit("unmaximize", t)) : (this.maximized = !0, this.$emit("maximize", t)), this.modal || (this.maximized ? ye() : ge());
    },
    enableDocumentSettings: function() {
      (this.modal || !this.modal && this.blockScroll || this.maximizable && this.maximized) && ye();
    },
    unbindDocumentState: function() {
      (this.modal || !this.modal && this.blockScroll || this.maximizable && this.maximized) && ge();
    },
    onKeyDown: function(t) {
      t.code === "Escape" && this.closeOnEscape && !t.isComposing && this.close();
    },
    bindDocumentKeyDownListener: function() {
      this.documentKeydownListener || (this.documentKeydownListener = this.onKeyDown.bind(this), window.document.addEventListener("keydown", this.documentKeydownListener));
    },
    unbindDocumentKeyDownListener: function() {
      this.documentKeydownListener && (window.document.removeEventListener("keydown", this.documentKeydownListener), this.documentKeydownListener = null);
    },
    containerRef: function(t) {
      this.container = t;
    },
    maskRef: function(t) {
      this.mask = t;
    },
    contentRef: function(t) {
      this.content = t;
    },
    headerContainerRef: function(t) {
      this.headerContainer = t;
    },
    footerContainerRef: function(t) {
      this.footerContainer = t;
    },
    maximizableRef: function(t) {
      this.maximizableButton = t ? t.$el : void 0;
    },
    closeButtonRef: function(t) {
      this.closeButton = t ? t.$el : void 0;
    },
    createStyle: function() {
      if (!this.styleElement && !this.isUnstyled) {
        var t;
        this.styleElement = document.createElement("style"), this.styleElement.type = "text/css", ot(this.styleElement, "nonce", (t = this.$primevue) === null || t === void 0 || (t = t.config) === null || t === void 0 || (t = t.csp) === null || t === void 0 ? void 0 : t.nonce), document.head.appendChild(this.styleElement);
        var n = "";
        for (var o in this.breakpoints)
          n += `
                        @media screen and (max-width: `.concat(o, `) {
                            .p-dialog[`).concat(this.$attrSelector, `] {
                                width: `).concat(this.breakpoints[o], ` !important;
                            }
                        }
                    `);
        this.styleElement.innerHTML = n;
      }
    },
    destroyStyle: function() {
      this.styleElement && (document.head.removeChild(this.styleElement), this.styleElement = null);
    },
    initDrag: function(t) {
      t.target.closest("div").getAttribute("data-pc-section") !== "headeractions" && this.draggable && (this.dragging = !0, this.lastPageX = t.pageX, this.lastPageY = t.pageY, this.container.style.margin = "0", document.body.setAttribute("data-p-unselectable-text", "true"), !this.isUnstyled && nt(document.body, {
        "user-select": "none"
      }), this.$emit("dragstart", t));
    },
    bindGlobalListeners: function() {
      this.draggable && (this.bindDocumentDragListener(), this.bindDocumentDragEndListener()), this.closeOnEscape && this.bindDocumentKeyDownListener();
    },
    unbindGlobalListeners: function() {
      this.unbindDocumentDragListener(), this.unbindDocumentDragEndListener(), this.unbindDocumentKeyDownListener();
    },
    bindDocumentDragListener: function() {
      var t = this;
      this.documentDragListener = function(n) {
        if (t.dragging) {
          var o = Qe(t.container), a = et(t.container), i = n.pageX - t.lastPageX, c = n.pageY - t.lastPageY, s = t.container.getBoundingClientRect(), p = s.left + i, f = s.top + c, b = tt(), y = getComputedStyle(t.container), d = parseFloat(y.marginLeft), C = parseFloat(y.marginTop);
          t.container.style.position = "fixed", t.keepInViewport ? (p >= t.minX && p + o < b.width && (t.lastPageX = n.pageX, t.container.style.left = p - d + "px"), f >= t.minY && f + a < b.height && (t.lastPageY = n.pageY, t.container.style.top = f - C + "px")) : (t.lastPageX = n.pageX, t.container.style.left = p - d + "px", t.lastPageY = n.pageY, t.container.style.top = f - C + "px");
        }
      }, window.document.addEventListener("mousemove", this.documentDragListener);
    },
    unbindDocumentDragListener: function() {
      this.documentDragListener && (window.document.removeEventListener("mousemove", this.documentDragListener), this.documentDragListener = null);
    },
    bindDocumentDragEndListener: function() {
      var t = this;
      this.documentDragEndListener = function(n) {
        t.dragging && (t.dragging = !1, document.body.removeAttribute("data-p-unselectable-text"), !t.isUnstyled && (document.body.style["user-select"] = ""), t.$emit("dragend", n));
      }, window.document.addEventListener("mouseup", this.documentDragEndListener);
    },
    unbindDocumentDragEndListener: function() {
      this.documentDragEndListener && (window.document.removeEventListener("mouseup", this.documentDragEndListener), this.documentDragEndListener = null);
    }
  },
  computed: {
    maximizeIconComponent: function() {
      return this.maximized ? this.minimizeIcon ? "span" : "WindowMinimizeIcon" : this.maximizeIcon ? "span" : "WindowMaximizeIcon";
    },
    ariaLabelledById: function() {
      return this.header != null || this.$attrs["aria-labelledby"] !== null ? this.$id + "_header" : null;
    },
    closeAriaLabel: function() {
      return this.$primevue.config.locale.aria ? this.$primevue.config.locale.aria.close : void 0;
    },
    dataP: function() {
      return Je({
        maximized: this.maximized,
        modal: this.modal
      });
    }
  },
  directives: {
    ripple: qe,
    focustrap: Jt
  },
  components: {
    Button: M,
    Portal: Ge,
    WindowMinimizeIcon: Ee,
    WindowMaximizeIcon: De,
    TimesIcon: Le
  }
};
function Z(e) {
  "@babel/helpers - typeof";
  return Z = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Z(e);
}
function ke(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(a) {
      return Object.getOwnPropertyDescriptor(e, a).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function Ce(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? ke(Object(n), !0).forEach(function(o) {
      an(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : ke(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function an(e, t, n) {
  return (t = sn(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function sn(e) {
  var t = rn(e, "string");
  return Z(t) == "symbol" ? t : t + "";
}
function rn(e, t) {
  if (Z(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (Z(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var ln = ["data-p"], un = ["aria-labelledby", "aria-modal", "data-p"], dn = ["id"], cn = ["data-p"];
function fn(e, t, n, o, a, i) {
  var c = pe("Button"), s = pe("Portal"), p = dt("focustrap");
  return v(), R(s, {
    appendTo: e.appendTo
  }, {
    default: L(function() {
      return [a.containerVisible ? (v(), k("div", $({
        key: 0,
        ref: i.maskRef,
        class: e.cx("mask"),
        style: e.sx("mask", !0, {
          position: e.position,
          modal: e.modal
        }),
        onMousedown: t[1] || (t[1] = function() {
          return i.onMaskMouseDown && i.onMaskMouseDown.apply(i, arguments);
        }),
        onMouseup: t[2] || (t[2] = function() {
          return i.onMaskMouseUp && i.onMaskMouseUp.apply(i, arguments);
        }),
        "data-p": i.dataP
      }, e.ptm("mask")), [g(ct, $({
        name: "p-dialog",
        onEnter: i.onEnter,
        onAfterEnter: i.onAfterEnter,
        onBeforeLeave: i.onBeforeLeave,
        onLeave: i.onLeave,
        onAfterLeave: i.onAfterLeave,
        appear: ""
      }, e.ptm("transition")), {
        default: L(function() {
          return [e.visible ? G((v(), k("div", $({
            key: 0,
            ref: i.containerRef,
            class: e.cx("root"),
            style: e.sx("root"),
            role: "dialog",
            "aria-labelledby": i.ariaLabelledById,
            "aria-modal": e.modal,
            "data-p": i.dataP
          }, e.ptmi("root")), [e.$slots.container ? B(e.$slots, "container", {
            key: 0,
            closeCallback: i.close,
            maximizeCallback: function(b) {
              return i.maximize(b);
            },
            initDragCallback: i.initDrag
          }) : (v(), k(T, {
            key: 1
          }, [e.showHeader ? (v(), k("div", $({
            key: 0,
            ref: i.headerContainerRef,
            class: e.cx("header"),
            onMousedown: t[0] || (t[0] = function() {
              return i.initDrag && i.initDrag.apply(i, arguments);
            })
          }, e.ptm("header")), [B(e.$slots, "header", {
            class: E(e.cx("title"))
          }, function() {
            return [e.header ? (v(), k("span", $({
              key: 0,
              id: i.ariaLabelledById,
              class: e.cx("title")
            }, e.ptm("title")), _(e.header), 17, dn)) : w("", !0)];
          }), r("div", $({
            class: e.cx("headerActions")
          }, e.ptm("headerActions")), [e.maximizable ? B(e.$slots, "maximizebutton", {
            key: 0,
            maximized: a.maximized,
            maximizeCallback: function(b) {
              return i.maximize(b);
            }
          }, function() {
            return [g(c, $({
              ref: i.maximizableRef,
              autofocus: a.focusableMax,
              class: e.cx("pcMaximizeButton"),
              onClick: i.maximize,
              tabindex: e.maximizable ? "0" : "-1",
              unstyled: e.unstyled
            }, e.maximizeButtonProps, {
              pt: e.ptm("pcMaximizeButton"),
              "data-pc-group-section": "headericon"
            }), {
              icon: L(function(f) {
                return [B(e.$slots, "maximizeicon", {
                  maximized: a.maximized
                }, function() {
                  return [(v(), R(me(i.maximizeIconComponent), $({
                    class: [f.class, a.maximized ? e.minimizeIcon : e.maximizeIcon]
                  }, e.ptm("pcMaximizeButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "tabindex", "unstyled", "pt"])];
          }) : w("", !0), e.closable ? B(e.$slots, "closebutton", {
            key: 1,
            closeCallback: i.close
          }, function() {
            return [g(c, $({
              ref: i.closeButtonRef,
              autofocus: a.focusableClose,
              class: e.cx("pcCloseButton"),
              onClick: i.close,
              "aria-label": i.closeAriaLabel,
              unstyled: e.unstyled
            }, e.closeButtonProps, {
              pt: e.ptm("pcCloseButton"),
              "data-pc-group-section": "headericon"
            }), {
              icon: L(function(f) {
                return [B(e.$slots, "closeicon", {}, function() {
                  return [(v(), R(me(e.closeIcon ? "span" : "TimesIcon"), $({
                    class: [e.closeIcon, f.class]
                  }, e.ptm("pcCloseButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "aria-label", "unstyled", "pt"])];
          }) : w("", !0)], 16)], 16)) : w("", !0), r("div", $({
            ref: i.contentRef,
            class: [e.cx("content"), e.contentClass],
            style: e.contentStyle,
            "data-p": i.dataP
          }, Ce(Ce({}, e.contentProps), e.ptm("content"))), [B(e.$slots, "default")], 16, cn), e.footer || e.$slots.footer ? (v(), k("div", $({
            key: 1,
            ref: i.footerContainerRef,
            class: e.cx("footer")
          }, e.ptm("footer")), [B(e.$slots, "footer", {}, function() {
            return [O(_(e.footer), 1)];
          })], 16)) : w("", !0)], 64))], 16, un)), [[p, {
            disabled: !e.modal
          }]]) : w("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onBeforeLeave", "onLeave", "onAfterLeave"])], 16, ln)) : w("", !0)];
    }),
    _: 3
  }, 8, ["appendTo"]);
}
ne.render = fn;
function pn(e) {
  if (!e) return null;
  let t;
  if (typeof e == "number")
    t = e;
  else {
    const n = e.trim();
    if (/^\d+$/.test(n))
      t = Number(n);
    else {
      const o = Date.parse(n);
      return Number.isNaN(o) ? null : o;
    }
  }
  return Number.isFinite(t) ? t < 1e12 ? t * 1e3 : t : null;
}
function xe(e, t) {
  const n = pn(e);
  if (n === null) return "";
  const o = t?.now ?? Date.now(), a = t?.suffix ?? !0, i = t?.maxUnit ?? "day", c = t?.future ?? !1, s = 6e4, p = 60 * s, f = 24 * p, b = 30 * f, y = 365 * f, d = o - n;
  if (c && d < 0) {
    const x = -d;
    return x < s ? "in <1m" : x < p ? `in ${Math.floor(x / s)}m` : x < f ? `in ${Math.floor(x / p)}h` : `in ${Math.floor(x / f)}d`;
  }
  const C = Math.max(0, d);
  if (C < s) return "just now";
  const D = a ? " ago" : "";
  return C < p ? `${Math.floor(C / s)}m${D}` : C < f ? `${Math.floor(C / p)}h${D}` : i === "year" ? C < b ? `${Math.floor(C / f)}d${D}` : C < y ? `${Math.floor(C / b)}mo${D}` : `${Math.floor(C / y)}y${D}` : `${Math.floor(C / f)}d${D}`;
}
function mn() {
  let e = 0;
  return () => {
    const t = ++e;
    return () => t === e;
  };
}
const bn = { class: "kx" }, hn = { class: "kx-bar" }, vn = { class: "kx-count" }, yn = { class: "kx-bar-actions" }, gn = {
  key: 0,
  class: "kx-search"
}, kn = {
  key: 0,
  class: "kx-err"
}, Cn = { class: "kx-body" }, xn = {
  key: 0,
  class: "kx-loading"
}, _n = {
  key: 1,
  class: "kx-empty"
}, wn = { class: "kx-empty-ico" }, Sn = { class: "kx-empty-actions" }, $n = {
  key: 2,
  class: "kx-empty"
}, Ln = { class: "kx-empty-ico" }, Dn = { class: "kx-empty-sub" }, En = { class: "kx-empty-actions" }, zn = {
  key: 3,
  class: "kx-grid"
}, jn = ["aria-label", "onClick", "onKeydown"], Mn = { class: "kx-card-head" }, In = { class: "kx-ficon" }, An = { class: "kx-card-id" }, On = ["title"], Bn = { class: "kx-card-meta" }, Tn = ["title"], Pn = ["title"], Rn = { class: "kx-modal-head-icon" }, Fn = { class: "kx-modal-body" }, Vn = { class: "kx-modal-head-icon" }, Hn = { class: "kx-modal-head-text" }, Un = { class: "kx-modal-head-title" }, Nn = { class: "kx-modal-head-sub" }, Kn = {
  key: 0,
  class: "kx-modal-body"
}, Wn = { class: "kx-field" }, Zn = { class: "wh-token" }, Yn = { class: "kx-field" }, Xn = { class: "wh-token" }, Gn = { key: 0 }, qn = { class: "wh-note" }, Jn = { class: "wh-facts" }, Qn = { class: "kx-field" }, eo = ["disabled"], to = { class: "kx-field wh-schema" }, no = { class: "wh-schema-edit" }, oo = ["disabled"], io = {
  key: 0,
  class: "kx-err inline"
}, ao = /* @__PURE__ */ Se({
  __name: "Webhooks",
  setup(e) {
    const t = {
      header: { class: "kx-dialog-header" },
      content: { class: "kx-dialog-content" },
      footer: { class: "kx-dialog-footer" }
    }, n = I([]), o = I(!0), a = I(""), i = I(""), c = I(!1), s = I(null), p = I({ label: "", schemaText: "" }), f = I(""), b = I(!1), y = I(!1), d = N(() => {
      const m = i.value.trim().toLowerCase();
      return m ? n.value.filter((l) => (l.label || l.webhook_id).toLowerCase().includes(m)) : n.value;
    }), C = N(() => ue(p.value.schemaText).schema || (s.value?.schema ?? {})), D = mn();
    async function x() {
      const m = D();
      o.value = !0, a.value = "";
      try {
        const l = await Ve();
        m() && (n.value = l);
      } catch (l) {
        m() && (a.value = X(l, "could not load webhooks"));
      } finally {
        m() && (o.value = !1);
      }
    }
    function F(m) {
      return "POST /api/public/hooks/" + m;
    }
    function j(m) {
      return m.subscriber_count || 0;
    }
    function ae() {
      c.value = !0;
    }
    function ze() {
      c.value = !1;
    }
    async function je() {
      c.value = !1, await x();
    }
    function Y(m) {
      s.value = m, p.value = { label: m.label || "", schemaText: Te(m.schema || {}) }, f.value = "", y.value = !1;
    }
    function V() {
      s.value = null;
    }
    const se = N({
      get: () => s.value !== null,
      set: (m) => {
        m || V();
      }
    });
    async function Me(m, l) {
      try {
        await navigator.clipboard.writeText(m), A.toast({ severity: "success", summary: "Copied", detail: l });
      } catch {
        A.toast({ severity: "warn", summary: "Copy failed", detail: "Select and copy manually." });
      }
    }
    async function Ie() {
      const m = s.value;
      if (!m) return;
      const l = ue(p.value.schemaText);
      if (l.error) {
        f.value = l.error;
        return;
      }
      b.value = !0, f.value = "";
      try {
        await Pe(m.webhook_id, { label: p.value.label.trim(), schema: l.schema }), A.toast({ severity: "success", summary: "Saved", detail: p.value.label.trim() || m.webhook_id }), V(), await x();
      } catch (u) {
        f.value = X(u, "save failed");
      } finally {
        b.value = !1;
      }
    }
    async function re(m) {
      if (await A.confirm({
        message: `Revoke “${m.label || m.webhook_id}”? The secret stops working and subscribed automations receive no further events. This can't be undone.`,
        header: "Revoke webhook",
        icon: "tabler:ban",
        acceptLabel: "Revoke",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      }))
        try {
          await Re(m.webhook_id), A.toast({ severity: "success", summary: "Revoked", detail: m.label || m.webhook_id }), s.value?.webhook_id === m.webhook_id && V(), await x();
        } catch (u) {
          a.value = X(u, "revoke failed"), A.toast({ severity: "error", summary: "Revoke failed", detail: a.value });
        }
    }
    async function le(m) {
      if (j(m) > 0) {
        A.toast({
          severity: "warn",
          summary: "In use",
          detail: `Used by ${j(m)} automation${j(m) === 1 ? "" : "s"}. Remove those first.`
        });
        return;
      }
      if (await A.confirm({
        message: `Remove “${m.label || m.webhook_id}”? This deletes the webhook and its endpoint. This can't be undone.`,
        header: "Remove webhook",
        icon: "tabler:trash",
        acceptLabel: "Remove",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      }))
        try {
          await Fe(m.webhook_id), Ae(m.webhook_id), A.toast({ severity: "success", summary: "Deletion accepted", detail: m.label || m.webhook_id }), s.value?.webhook_id === m.webhook_id && V(), await x();
        } catch (u) {
          a.value = X(u, "delete failed"), A.toast({ severity: "error", summary: "Remove failed", detail: a.value });
        }
    }
    Oe(x);
    const { acceptDeletion: Ae } = Dt(n, (m) => m.webhook_id, void 0, x);
    return (m, l) => (v(), k("div", bn, [
      r("div", hn, [
        r("span", vn, _(n.value.length) + " webhook" + _(n.value.length !== 1 ? "s" : ""), 1),
        r("div", yn, [
          n.value.length ? (v(), k("div", gn, [
            g(h(S), {
              icon: "tabler:search",
              class: "kx-search-ico",
              "aria-hidden": "true"
            }),
            G(r("input", {
              "onUpdate:modelValue": l[0] || (l[0] = (u) => i.value = u),
              class: "kx-search-input",
              type: "text",
              placeholder: "Search webhooks…",
              "aria-label": "Search webhooks"
            }, null, 512), [
              [q, i.value]
            ])
          ])) : w("", !0),
          g(h(M), {
            type: "button",
            label: "New webhook",
            onClick: ae
          }, {
            icon: L(({ class: u }) => [
              g(h(S), {
                icon: "tabler:plus",
                class: E(u),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ])
      ]),
      a.value ? (v(), k("div", kn, _(a.value), 1)) : w("", !0),
      r("div", Cn, [
        o.value && !n.value.length ? (v(), k("div", xn, [
          g(h(S), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          l[10] || (l[10] = O(" Loading webhooks… ", -1))
        ])) : n.value.length ? d.value.length ? (v(), k("div", zn, [
          (v(!0), k(T, null, ft(d.value, (u) => (v(), k("div", {
            key: u.webhook_id,
            class: E(["kx-card", u.status === "revoked" && "is-revoked"]),
            tabindex: "0",
            role: "button",
            "aria-label": `Open ${u.label || "webhook"}`,
            onClick: (z) => !u.deleting_at && Y(u),
            onKeydown: [
              be((z) => !u.deleting_at && Y(u), ["enter"]),
              be(K((z) => !u.deleting_at && Y(u), ["prevent"]), ["space"])
            ]
          }, [
            g(wt, {
              state: u,
              onRetry: (z) => le(u)
            }, null, 8, ["state", "onRetry"]),
            r("div", Mn, [
              r("span", In, [
                g(h(S), {
                  icon: "tabler:webhook",
                  "aria-hidden": "true"
                })
              ]),
              r("div", An, [
                r("div", {
                  class: "kx-card-name",
                  title: u.label || "Webhook"
                }, _(u.label || "Webhook"), 9, On),
                r("div", Bn, [
                  r("span", {
                    class: E(["kx-chip kx-tag-sm", u.status === "active" ? "is-active" : "is-revoked"])
                  }, _(h(de)(u.status)), 3),
                  j(u) > 0 ? (v(), k("span", {
                    key: 0,
                    class: "kx-chip kx-tag-sm is-count",
                    title: `Used by ${j(u)} automation(s)`
                  }, [
                    g(h(S), {
                      icon: "tabler:plug-connected",
                      "aria-hidden": "true"
                    }),
                    O(" " + _(j(u)) + " automation" + _(j(u) === 1 ? "" : "s"), 1)
                  ], 8, Tn)) : w("", !0)
                ])
              ]),
              r("div", {
                class: "kx-card-actions",
                onClick: l[2] || (l[2] = K(() => {
                }, ["stop"]))
              }, [
                g(h(M), {
                  type: "button",
                  severity: "secondary",
                  outlined: "",
                  size: "small",
                  title: "Open",
                  "aria-label": `Open ${u.label || "webhook"}`,
                  onClick: (z) => !u.deleting_at && Y(u),
                  disabled: !!u.deleting_at
                }, {
                  icon: L(({ class: z }) => [
                    g(h(S), {
                      icon: "tabler:pencil",
                      class: E(z),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick", "disabled"]),
                u.status === "active" ? (v(), R(h(M), {
                  key: 0,
                  type: "button",
                  severity: "danger",
                  outlined: "",
                  size: "small",
                  title: "Revoke",
                  "aria-label": `Revoke ${u.label || "webhook"}`,
                  onClick: (z) => re(u),
                  disabled: !!u.deleting_at
                }, {
                  icon: L(({ class: z }) => [
                    g(h(S), {
                      icon: "tabler:ban",
                      class: E(z),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick", "disabled"])) : w("", !0),
                g(h(M), {
                  type: "button",
                  severity: "danger",
                  outlined: "",
                  size: "small",
                  title: "Remove",
                  "aria-label": `Remove ${u.label || "webhook"}`,
                  disabled: !!u.deleting_at || j(u) > 0,
                  onClick: (z) => le(u)
                }, {
                  icon: L(({ class: z }) => [
                    g(h(S), {
                      icon: "tabler:trash",
                      class: E(z),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "disabled", "onClick"])
              ])
            ]),
            r("div", {
              class: "kx-card-desc",
              title: F(u.webhook_id)
            }, _(F(u.webhook_id)), 9, Pn)
          ], 42, jn))), 128))
        ])) : (v(), k("div", $n, [
          r("div", Ln, [
            g(h(S), {
              icon: "tabler:mood-empty",
              "aria-hidden": "true"
            })
          ]),
          l[13] || (l[13] = r("div", { class: "kx-empty-title" }, "No matches", -1)),
          r("div", Dn, "Nothing matches “" + _(i.value) + "”. Try a different term or clear the search.", 1),
          r("div", En, [
            g(h(M), {
              type: "button",
              severity: "secondary",
              outlined: "",
              label: "Clear search",
              onClick: l[1] || (l[1] = (u) => i.value = "")
            }, {
              icon: L(({ class: u }) => [
                g(h(S), {
                  icon: "tabler:x",
                  class: E(u),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ])) : (v(), k("div", _n, [
          r("div", wn, [
            g(h(S), {
              icon: "tabler:webhook",
              "aria-hidden": "true"
            })
          ]),
          l[11] || (l[11] = r("div", { class: "kx-empty-title" }, "No webhooks yet", -1)),
          l[12] || (l[12] = r("div", { class: "kx-empty-sub" }, "A webhook gives an external service a secret URL to POST to. Each request becomes a trigger event your automations can act on.", -1)),
          r("div", Sn, [
            g(h(M), {
              type: "button",
              label: "New webhook",
              onClick: ae
            }, {
              icon: L(({ class: u }) => [
                g(h(S), {
                  icon: "tabler:plus",
                  class: E(u),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ]))
      ]),
      g(h(ne), {
        visible: c.value,
        "onUpdate:visible": l[3] || (l[3] = (u) => c.value = u),
        modal: "",
        "dismissable-mask": !0,
        class: "kx-dialog",
        pt: t,
        "aria-label": "New webhook"
      }, {
        header: L(() => [
          r("span", Rn, [
            g(h(S), {
              icon: "tabler:webhook",
              "aria-hidden": "true"
            })
          ]),
          l[14] || (l[14] = r("span", { class: "kx-modal-head-text" }, [
            r("span", { class: "kx-modal-head-title" }, "New webhook"),
            r("span", { class: "kx-modal-head-sub" }, "Name it and set the payload it accepts — the secret is shown once.")
          ], -1))
        ]),
        default: L(() => [
          r("div", Fn, [
            g(at, {
              onCreated: je,
              onClose: ze
            })
          ])
        ]),
        _: 1
      }, 8, ["visible"]),
      g(h(ne), {
        visible: se.value,
        "onUpdate:visible": l[9] || (l[9] = (u) => se.value = u),
        modal: "",
        class: "kx-dialog",
        pt: t,
        "aria-label": "Webhook detail"
      }, pt({
        default: L(() => [
          s.value ? (v(), k("div", Kn, [
            r("div", Wn, [
              l[15] || (l[15] = r("span", { class: "kx-field-lbl" }, [
                O("Endpoint URL "),
                r("span", { class: "kx-field-hint-inline" }, "— hand this to the sender")
              ], -1)),
              r("div", Zn, [
                r("code", null, _(h(ce)(s.value.webhook_id)), 1),
                r("button", {
                  type: "button",
                  class: "wh-copy",
                  title: "Copy URL",
                  "aria-label": "Copy URL",
                  onClick: l[4] || (l[4] = (u) => Me(h(ce)(s.value.webhook_id), "endpoint URL"))
                }, [
                  g(h(S), {
                    icon: "tabler:copy",
                    "aria-hidden": "true"
                  })
                ])
              ])
            ]),
            r("div", Yn, [
              l[17] || (l[17] = r("span", { class: "kx-field-lbl" }, "Secret", -1)),
              r("div", Xn, [
                r("code", null, [
                  O(_(s.value.secret_prefix || "Not available"), 1),
                  s.value.secret_prefix ? (v(), k("span", Gn, "…")) : w("", !0)
                ])
              ]),
              r("p", qn, [
                g(h(S), {
                  icon: "tabler:info-circle",
                  "aria-hidden": "true"
                }),
                l[16] || (l[16] = r("span", null, "The full secret is shown only when a webhook is created. To rotate it, revoke this webhook and create a new one.", -1))
              ])
            ]),
            r("dl", Jn, [
              s.value.created_at ? (v(), k(T, { key: 0 }, [
                l[18] || (l[18] = r("dt", null, "Created", -1)),
                r("dd", null, _(h(xe)(s.value.created_at)), 1)
              ], 64)) : w("", !0),
              s.value.last_used_at ? (v(), k(T, { key: 1 }, [
                l[19] || (l[19] = r("dt", null, "Last received", -1)),
                r("dd", null, _(h(xe)(s.value.last_used_at)), 1)
              ], 64)) : w("", !0),
              j(s.value) > 0 ? (v(), k(T, { key: 2 }, [
                l[20] || (l[20] = r("dt", null, "Used by", -1)),
                r("dd", null, _(j(s.value)) + " automation" + _(j(s.value) === 1 ? "" : "s"), 1)
              ], 64)) : w("", !0)
            ]),
            r("label", Qn, [
              l[21] || (l[21] = r("span", { class: "kx-field-lbl" }, [
                O("Name "),
                r("span", { class: "kx-field-hint-inline" }, "— shown in automation trigger pickers")
              ], -1)),
              G(r("input", {
                "onUpdate:modelValue": l[5] || (l[5] = (u) => p.value.label = u),
                class: "kx-input",
                type: "text",
                placeholder: "Customer events",
                disabled: s.value.status === "revoked",
                "data-test": "wh-name"
              }, null, 8, eo), [
                [q, p.value.label]
              ])
            ]),
            r("div", to, [
              l[23] || (l[23] = r("span", { class: "kx-field-lbl" }, [
                O("Payload schema "),
                r("span", { class: "kx-field-hint-inline" }, "— the fields each inbound request must carry")
              ], -1)),
              g(Be, { schema: C.value }, null, 8, ["schema"]),
              r("div", no, [
                r("button", {
                  type: "button",
                  class: E(["wh-toggle", y.value && "is-open"]),
                  onClick: l[6] || (l[6] = (u) => y.value = !y.value)
                }, [
                  g(h(S), {
                    icon: "tabler:chevron-right",
                    "aria-hidden": "true"
                  }),
                  l[22] || (l[22] = O(" Edit as JSON Schema ", -1))
                ], 2),
                y.value ? G((v(), k("textarea", {
                  key: 0,
                  "onUpdate:modelValue": l[7] || (l[7] = (u) => p.value.schemaText = u),
                  class: "kx-input kx-textarea",
                  spellcheck: "false",
                  disabled: s.value.status === "revoked",
                  "data-test": "wh-schema"
                }, null, 8, oo)), [
                  [q, p.value.schemaText]
                ]) : w("", !0)
              ])
            ]),
            f.value ? (v(), k("div", io, _(f.value), 1)) : w("", !0)
          ])) : w("", !0)
        ]),
        _: 2
      }, [
        s.value ? {
          name: "header",
          fn: L(() => [
            r("span", Vn, [
              g(h(S), {
                icon: "tabler:webhook",
                "aria-hidden": "true"
              })
            ]),
            r("span", Hn, [
              r("span", Un, _(s.value.label || "Webhook"), 1),
              r("span", Nn, _(F(s.value.webhook_id)), 1)
            ]),
            r("span", {
              class: E(["kx-chip kx-tag-sm", s.value.status === "active" ? "is-active" : "is-revoked"])
            }, _(h(de)(s.value.status)), 3)
          ]),
          key: "0"
        } : void 0,
        s.value ? {
          name: "footer",
          fn: L(() => [
            s.value.status === "active" ? (v(), R(h(M), {
              key: 0,
              type: "button",
              severity: "danger",
              size: "small",
              class: "kx-foot-spacer",
              label: "Revoke",
              onClick: l[8] || (l[8] = (u) => re(s.value))
            }, {
              icon: L(({ class: u }) => [
                g(h(S), {
                  icon: "tabler:ban",
                  class: E(u),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })) : w("", !0),
            g(h(M), {
              type: "button",
              label: "Close",
              severity: "secondary",
              outlined: "",
              onClick: V
            }),
            s.value.status === "active" ? (v(), R(h(M), {
              key: 1,
              type: "button",
              label: "Save changes",
              loading: b.value,
              disabled: b.value,
              "data-test": "wh-save",
              onClick: Ie
            }, {
              icon: L(({ class: u }) => [
                g(h(S), {
                  icon: "tabler:device-floppy",
                  class: E(u),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }, 8, ["loading", "disabled"])) : w("", !0)
          ]),
          key: "1"
        } : void 0
      ]), 1032, ["visible"])
    ]));
  }
});
class so extends He {
  static get wippyConfig() {
    return {
      propsSchema: st.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: Ue
    };
  }
  static get vueConfig() {
    return { rootComponent: ao, plugins: [rt] };
  }
}
bt(import.meta.url, so);
//# sourceMappingURL=index.js.map
