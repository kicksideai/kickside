import { a as le, p as ue, b as Oe, w as de, i as ce, _ as Be, c as Te, d as Pe, e as Y, r as je, g as Re, h as Fe, W as Ve, s as He } from "./styles-CJNXuerT.js";
import { B as ne, s as we, a as A, b as oe, L as Ue, c as j, v as V, d as Ne, U as Ke, I as pe, e as We, f as Ze, r as _e, g as Ye, h as Xe, R as Ge, i as qe, j as Je, C as Qe, k as et, S as tt, l as nt, W as ot, _ as at, p as it, P as st } from "./package-3RNWCFJe.js";
import { openBlock as b, createElementBlock as v, mergeProps as S, createElementVNode as r, defineComponent as Se, computed as U, withModifiers as N, Fragment as P, createTextVNode as B, toDisplayString as k, createCommentVNode as C, createVNode as h, unref as m, watch as rt, onBeforeUnmount as lt, resolveComponent as fe, resolveDirective as ut, createBlock as R, withCtx as $, Transition as dt, withDirectives as X, renderSlot as T, normalizeClass as E, resolveDynamicComponent as me, ref as O, vModelText as G, renderList as ct, withKeys as be, createSlots as pt } from "vue";
import { on as ft, api as mt, host as M, define as bt } from "@wippy-fe/proxy";
import { Icon as w } from "@iconify/vue";
function ht() {
  let e = [], t = (c, i, d = 999) => {
    let p = s(c, i, d), y = p.value + (p.key === c ? 0 : d) + 1;
    return e.push({ key: c, value: y }), y;
  }, n = (c) => {
    e = e.filter((i) => i.value !== c);
  }, o = (c, i) => s(c).value, s = (c, i, d = 0) => [...e].reverse().find((p) => !0) || { key: c, value: d }, a = (c) => c && parseInt(c.style.zIndex, 10) || 0;
  return { get: a, set: (c, i, d) => {
    i && (i.style.zIndex = String(t(c, !0, d)));
  }, clear: (c) => {
    c && (n(a(c)), c.style.zIndex = "");
  }, getCurrent: (c) => o(c) };
}
var q = ht(), vt = `
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
}, gt = ne.extend({
  name: "progressspinner",
  style: vt,
  classes: yt
}), kt = {
  name: "BaseProgressSpinner",
  extends: we,
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
function xt(e, t, n, o, s, a) {
  return b(), v("div", S({
    class: e.cx("root"),
    role: "progressbar"
  }, e.ptmi("root")), [(b(), v("svg", S({
    class: e.cx("spin"),
    viewBox: "25 25 50 50",
    style: a.svgStyle
  }, e.ptm("spin")), [r("circle", S({
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
const wt = { key: 0 }, _t = /* @__PURE__ */ Se({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(e) {
    const t = e, n = U(() => !t.state.deletion_job || ["dead", "cancelled"].includes(t.state.deletion_job.status));
    return (o, s) => e.state.deleting_at ? (b(), v("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: s[1] || (s[1] = N(() => {
      }, ["stop"])),
      onKeydown: s[2] || (s[2] = N(() => {
      }, ["stop"]))
    }, [
      n.value ? (b(), v(P, { key: 0 }, [
        r("span", null, [
          s[3] || (s[3] = B("Deletion failed", -1)),
          e.state.deletion_job?.last_error ? (b(), v("span", wt, ": " + k(e.state.deletion_job.last_error), 1)) : C("", !0)
        ]),
        h(m(A), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: s[0] || (s[0] = N((a) => o.$emit("retry"), ["stop"]))
        })
      ], 64)) : (b(), v(P, { key: 1 }, [
        h(m($e), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        s[4] || (s[4] = r("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : C("", !0);
  }
}), St = (e, t) => {
  const n = e.__vccOpts || e;
  for (const [o, s] of t)
    n[o] = s;
  return n;
}, $t = /* @__PURE__ */ St(_t, [["__scopeId", "data-v-13f5648e"]]);
function H(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function Lt(e, t) {
  return e;
}
function Dt(e, t, n) {
  const o = H(e) ? e : {}, s = [
    o,
    H(o.data) ? o.data : null,
    H(o.payload) ? o.payload : null,
    H(o.detail) ? o.detail : null
  ].filter(Boolean);
  for (const a of s) {
    if (a.event !== "component.meta.changed" && a.event !== "component.deleting" && a.event !== "component.deleted") continue;
    const c = String(a.component_id || ""), i = String(o.topic || a.topic || "");
    if (!c && (!i.startsWith("component.") || i === "component.")) continue;
    const d = c || t || i.slice(10);
    return a.event !== "component.meta.changed" ? { event: a.event, component_id: d } : {
      event: "component.meta.changed",
      component_id: d,
      meta: Lt(H(a.meta) ? a.meta : {}),
      deleted: Array.isArray(a.deleted) ? a.deleted.map(String) : []
    };
  }
  return null;
}
function Et(e, t) {
  const n = Dt(e, t);
  return n && n.event !== "component.meta.changed" ? n : null;
}
function zt(e, t, n) {
  let o = !0;
  async function s(i) {
    try {
      const { data: d } = await mt.get(`/api/v1/components/${encodeURIComponent(t(i))}`);
      if (!d?.success) throw new Error(le(d, "Could not read deletion progress"));
      o && e.value.includes(i) && (i.deleting_at = d.deleting_at, i.deletion_job_id = d.deletion_job_id, i.deletion_job = d.deletion_job);
    } catch (d) {
      o && e.value.includes(i) && M.handleError("other", { message: le(d, "Could not read deletion progress") });
    }
  }
  const a = rt(() => e.value, (i, d = []) => {
    for (const p of d) i.some((y) => t(y) === t(p));
    for (const p of i) p.deleting_at && s(p);
  }, { immediate: !0 }), c = ft("@message", (i) => {
    const d = Et(i);
    if (!d) return;
    const p = e.value.find((y) => t(y) === d.component_id);
    p && (d.event === "component.deleted" ? e.value = e.value.filter((y) => t(y) !== d.component_id) : s(p));
  });
  lt(() => {
    o = !1, a(), typeof c == "function" && c();
  });
}
var Le = {
  name: "TimesIcon",
  extends: oe
};
function It(e) {
  return Bt(e) || Ot(e) || At(e) || Mt();
}
function Mt() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function At(e, t) {
  if (e) {
    if (typeof e == "string") return J(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? J(e, t) : void 0;
  }
}
function Ot(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Bt(e) {
  if (Array.isArray(e)) return J(e);
}
function J(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function Tt(e, t, n, o, s, a) {
  return b(), v("svg", S({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), It(t[0] || (t[0] = [r("path", {
    d: "M8.01186 7.00933L12.27 2.75116C12.341 2.68501 12.398 2.60524 12.4375 2.51661C12.4769 2.42798 12.4982 2.3323 12.4999 2.23529C12.5016 2.13827 12.4838 2.0419 12.4474 1.95194C12.4111 1.86197 12.357 1.78024 12.2884 1.71163C12.2198 1.64302 12.138 1.58893 12.0481 1.55259C11.9581 1.51625 11.8617 1.4984 11.7647 1.50011C11.6677 1.50182 11.572 1.52306 11.4834 1.56255C11.3948 1.60204 11.315 1.65898 11.2488 1.72997L6.99067 5.98814L2.7325 1.72997C2.59553 1.60234 2.41437 1.53286 2.22718 1.53616C2.03999 1.53946 1.8614 1.61529 1.72901 1.74767C1.59663 1.88006 1.5208 2.05865 1.5175 2.24584C1.5142 2.43303 1.58368 2.61419 1.71131 2.75116L5.96948 7.00933L1.71131 11.2675C1.576 11.403 1.5 11.5866 1.5 11.7781C1.5 11.9696 1.576 12.1532 1.71131 12.2887C1.84679 12.424 2.03043 12.5 2.2219 12.5C2.41338 12.5 2.59702 12.424 2.7325 12.2887L6.99067 8.03052L11.2488 12.2887C11.3843 12.424 11.568 12.5 11.7594 12.5C11.9509 12.5 12.1346 12.424 12.27 12.2887C12.4053 12.1532 12.4813 11.9696 12.4813 11.7781C12.4813 11.5866 12.4053 11.403 12.27 11.2675L8.01186 7.00933Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Le.render = Tt;
var De = {
  name: "WindowMaximizeIcon",
  extends: oe
};
function Pt(e) {
  return Vt(e) || Ft(e) || Rt(e) || jt();
}
function jt() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Rt(e, t) {
  if (e) {
    if (typeof e == "string") return Q(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Q(e, t) : void 0;
  }
}
function Ft(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Vt(e) {
  if (Array.isArray(e)) return Q(e);
}
function Q(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function Ht(e, t, n, o, s, a) {
  return b(), v("svg", S({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Pt(t[0] || (t[0] = [r("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14ZM9.77805 7.42192C9.89013 7.534 10.0415 7.59788 10.2 7.59995C10.3585 7.59788 10.5099 7.534 10.622 7.42192C10.7341 7.30985 10.798 7.15844 10.8 6.99995V3.94242C10.8066 3.90505 10.8096 3.86689 10.8089 3.82843C10.8079 3.77159 10.7988 3.7157 10.7824 3.6623C10.756 3.55552 10.701 3.45698 10.622 3.37798C10.5099 3.2659 10.3585 3.20202 10.2 3.19995H7.00002C6.84089 3.19995 6.68828 3.26317 6.57576 3.37569C6.46324 3.48821 6.40002 3.64082 6.40002 3.79995C6.40002 3.95908 6.46324 4.11169 6.57576 4.22422C6.68828 4.33674 6.84089 4.39995 7.00002 4.39995H8.80006L6.19997 7.00005C6.10158 7.11005 6.04718 7.25246 6.04718 7.40005C6.04718 7.54763 6.10158 7.69004 6.19997 7.80005C6.30202 7.91645 6.44561 7.98824 6.59997 8.00005C6.75432 7.98824 6.89791 7.91645 6.99997 7.80005L9.60002 5.26841V6.99995C9.6021 7.15844 9.66598 7.30985 9.77805 7.42192ZM1.4 14H3.8C4.17066 13.9979 4.52553 13.8498 4.78763 13.5877C5.04973 13.3256 5.1979 12.9707 5.2 12.6V10.2C5.1979 9.82939 5.04973 9.47452 4.78763 9.21242C4.52553 8.95032 4.17066 8.80215 3.8 8.80005H1.4C1.02934 8.80215 0.674468 8.95032 0.412371 9.21242C0.150274 9.47452 0.00210008 9.82939 0 10.2V12.6C0.00210008 12.9707 0.150274 13.3256 0.412371 13.5877C0.674468 13.8498 1.02934 13.9979 1.4 14ZM1.25858 10.0586C1.29609 10.0211 1.34696 10 1.4 10H3.8C3.85304 10 3.90391 10.0211 3.94142 10.0586C3.97893 10.0961 4 10.147 4 10.2V12.6C4 12.6531 3.97893 12.704 3.94142 12.7415C3.90391 12.779 3.85304 12.8 3.8 12.8H1.4C1.34696 12.8 1.29609 12.779 1.25858 12.7415C1.22107 12.704 1.2 12.6531 1.2 12.6V10.2C1.2 10.147 1.22107 10.0961 1.25858 10.0586Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
De.render = Ht;
var Ee = {
  name: "WindowMinimizeIcon",
  extends: oe
};
function Ut(e) {
  return Zt(e) || Wt(e) || Kt(e) || Nt();
}
function Nt() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Kt(e, t) {
  if (e) {
    if (typeof e == "string") return ee(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? ee(e, t) : void 0;
  }
}
function Wt(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Zt(e) {
  if (Array.isArray(e)) return ee(e);
}
function ee(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function Yt(e, t, n, o, s, a) {
  return b(), v("svg", S({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Ut(t[0] || (t[0] = [r("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0ZM6.368 7.952C6.44137 7.98326 6.52025 7.99958 6.6 8H9.8C9.95913 8 10.1117 7.93678 10.2243 7.82426C10.3368 7.71174 10.4 7.55913 10.4 7.4C10.4 7.24087 10.3368 7.08826 10.2243 6.97574C10.1117 6.86321 9.95913 6.8 9.8 6.8H8.048L10.624 4.224C10.73 4.11026 10.7877 3.95982 10.7849 3.80438C10.7822 3.64894 10.7192 3.50063 10.6093 3.3907C10.4994 3.28077 10.3511 3.2178 10.1956 3.21506C10.0402 3.21232 9.88974 3.27002 9.776 3.376L7.2 5.952V4.2C7.2 4.04087 7.13679 3.88826 7.02426 3.77574C6.91174 3.66321 6.75913 3.6 6.6 3.6C6.44087 3.6 6.28826 3.66321 6.17574 3.77574C6.06321 3.88826 6 4.04087 6 4.2V7.4C6.00042 7.47975 6.01674 7.55862 6.048 7.632C6.07656 7.70442 6.11971 7.7702 6.17475 7.82524C6.2298 7.88029 6.29558 7.92344 6.368 7.952ZM1.4 8.80005H3.8C4.17066 8.80215 4.52553 8.95032 4.78763 9.21242C5.04973 9.47452 5.1979 9.82939 5.2 10.2V12.6C5.1979 12.9707 5.04973 13.3256 4.78763 13.5877C4.52553 13.8498 4.17066 13.9979 3.8 14H1.4C1.02934 13.9979 0.674468 13.8498 0.412371 13.5877C0.150274 13.3256 0.00210008 12.9707 0 12.6V10.2C0.00210008 9.82939 0.150274 9.47452 0.412371 9.21242C0.674468 8.95032 1.02934 8.80215 1.4 8.80005ZM3.94142 12.7415C3.97893 12.704 4 12.6531 4 12.6V10.2C4 10.147 3.97893 10.0961 3.94142 10.0586C3.90391 10.0211 3.85304 10 3.8 10H1.4C1.34696 10 1.29609 10.0211 1.25858 10.0586C1.22107 10.0961 1.2 10.147 1.2 10.2V12.6C1.2 12.6531 1.22107 12.704 1.25858 12.7415C1.29609 12.779 1.34696 12.8 1.4 12.8H3.8C3.85304 12.8 3.90391 12.779 3.94142 12.7415Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Ee.render = Yt;
var Xt = ne.extend({
  name: "focustrap-directive"
}), Gt = Ne.extend({
  style: Xt
});
function K(e) {
  "@babel/helpers - typeof";
  return K = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, K(e);
}
function he(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(s) {
      return Object.getOwnPropertyDescriptor(e, s).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function ve(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? he(Object(n), !0).forEach(function(o) {
      qt(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : he(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function qt(e, t, n) {
  return (t = Jt(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Jt(e) {
  var t = Qt(e, "string");
  return K(t) == "symbol" ? t : t + "";
}
function Qt(e, t) {
  if (K(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (K(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var en = Gt.extend("focustrap", {
  mounted: function(t, n) {
    var o = n.value || {}, s = o.disabled;
    s || (this.createHiddenFocusableElements(t, n), this.bind(t, n), this.autoElementFocus(t, n)), t.setAttribute("data-pd-focustrap", !0), this.$el = t;
  },
  updated: function(t, n) {
    var o = n.value || {}, s = o.disabled;
    s && this.unbind(t);
  },
  unmounted: function(t) {
    this.unbind(t);
  },
  methods: {
    getComputedSelector: function(t) {
      return ':not(.p-hidden-focusable):not([data-p-hidden-focusable="true"])'.concat(t ?? "");
    },
    bind: function(t, n) {
      var o = this, s = n.value || {}, a = s.onFocusIn, c = s.onFocusOut;
      t.$_pfocustrap_mutationobserver = new MutationObserver(function(i) {
        i.forEach(function(d) {
          if (d.type === "childList" && !t.contains(document.activeElement)) {
            var p = function(x) {
              var _ = pe(x) ? pe(x, o.getComputedSelector(t.$_pfocustrap_focusableselector)) ? x : V(t, o.getComputedSelector(t.$_pfocustrap_focusableselector)) : V(x);
              return We(_) ? _ : x.nextSibling && p(x.nextSibling);
            };
            j(p(d.nextSibling));
          }
        });
      }), t.$_pfocustrap_mutationobserver.disconnect(), t.$_pfocustrap_mutationobserver.observe(t, {
        childList: !0
      }), t.$_pfocustrap_focusinlistener = function(i) {
        return a && a(i);
      }, t.$_pfocustrap_focusoutlistener = function(i) {
        return c && c(i);
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
      var o = n.value || {}, s = o.autoFocusSelector, a = s === void 0 ? "" : s, c = o.firstFocusableSelector, i = c === void 0 ? "" : c, d = o.autoFocus, p = d === void 0 ? !1 : d, y = V(t, "[autofocus]".concat(this.getComputedSelector(a)));
      p && !y && (y = V(t, this.getComputedSelector(i))), j(y);
    },
    onFirstHiddenElementFocus: function(t) {
      var n, o = t.currentTarget, s = t.relatedTarget, a = s === o.$_pfocustrap_lasthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(s)) ? V(o.parentElement, this.getComputedSelector(o.$_pfocustrap_focusableselector)) : o.$_pfocustrap_lasthiddenfocusableelement;
      j(a);
    },
    onLastHiddenElementFocus: function(t) {
      var n, o = t.currentTarget, s = t.relatedTarget, a = s === o.$_pfocustrap_firsthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(s)) ? Ue(o.parentElement, this.getComputedSelector(o.$_pfocustrap_focusableselector)) : o.$_pfocustrap_firsthiddenfocusableelement;
      j(a);
    },
    createHiddenFocusableElements: function(t, n) {
      var o = this, s = n.value || {}, a = s.tabIndex, c = a === void 0 ? 0 : a, i = s.firstFocusableSelector, d = i === void 0 ? "" : i, p = s.lastFocusableSelector, y = p === void 0 ? "" : p, x = function(L) {
        return Ke("span", {
          class: "p-hidden-accessible p-hidden-focusable",
          tabIndex: c,
          role: "presentation",
          "aria-hidden": !0,
          "data-p-hidden-accessible": !0,
          "data-p-hidden-focusable": !0,
          onFocus: L?.bind(o)
        });
      }, _ = x(this.onFirstHiddenElementFocus), g = x(this.onLastHiddenElementFocus);
      _.$_pfocustrap_lasthiddenfocusableelement = g, _.$_pfocustrap_focusableselector = d, _.setAttribute("data-pc-section", "firstfocusableelement"), g.$_pfocustrap_firsthiddenfocusableelement = _, g.$_pfocustrap_focusableselector = y, g.setAttribute("data-pc-section", "lastfocusableelement"), t.prepend(_), t.append(g);
    }
  }
});
function ye() {
  Ye({
    variableName: _e("scrollbar.width").name
  });
}
function ge() {
  Ze({
    variableName: _e("scrollbar.width").name
  });
}
var tn = `
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
`, nn = {
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
}, on = {
  mask: function(t) {
    var n = t.props, o = ["left", "right", "top", "topleft", "topright", "bottom", "bottomleft", "bottomright"], s = o.find(function(a) {
      return a === n.position;
    });
    return ["p-dialog-mask", {
      "p-overlay-mask p-overlay-mask-enter-active": n.modal
    }, s ? "p-dialog-".concat(s) : ""];
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
}, an = ne.extend({
  name: "dialog",
  style: tn,
  classes: on,
  inlineStyles: nn
}), sn = {
  name: "BaseDialog",
  extends: we,
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
  style: an,
  provide: function() {
    return {
      $pcDialog: this,
      $parentInstance: this
    };
  }
}, te = {
  name: "Dialog",
  extends: sn,
  inheritAttrs: !1,
  emits: ["update:visible", "show", "hide", "after-hide", "maximize", "unmaximize", "dragstart", "dragend"],
  provide: function() {
    var t = this;
    return {
      dialogRef: U(function() {
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
    this.unbindDocumentState(), this.unbindGlobalListeners(), this.destroyStyle(), this.mask && this.autoZIndex && q.clear(this.mask), this.container = null, this.mask = null;
  },
  mounted: function() {
    this.breakpoints && this.createStyle();
  },
  methods: {
    close: function() {
      this.$emit("update:visible", !1);
    },
    onEnter: function() {
      this.$emit("show"), this.target = document.activeElement, this.enableDocumentSettings(), this.bindGlobalListeners(), this.autoZIndex && q.set("modal", this.mask, this.baseZIndex || this.$primevue.config.zIndex.modal);
    },
    onAfterEnter: function() {
      this.focus();
    },
    onBeforeLeave: function() {
      this.modal && !this.isUnstyled && ot(this.mask, "p-overlay-mask-leave-active"), this.dragging && this.documentDragEndListener && this.documentDragEndListener();
    },
    onLeave: function() {
      this.$emit("hide"), j(this.target), this.target = null, this.focusableClose = null, this.focusableMax = null;
    },
    onAfterLeave: function() {
      this.autoZIndex && q.clear(this.mask), this.containerVisible = !1, this.unbindDocumentState(), this.unbindGlobalListeners(), this.$emit("after-hide");
    },
    onMaskMouseDown: function(t) {
      this.maskMouseDownTarget = t.target;
    },
    onMaskMouseUp: function() {
      this.dismissableMask && this.modal && this.mask === this.maskMouseDownTarget && this.close();
    },
    focus: function() {
      var t = function(s) {
        return s && s.querySelector("[autofocus]");
      }, n = this.$slots.footer && t(this.footerContainer);
      n || (n = this.$slots.header && t(this.headerContainer), n || (n = this.$slots.default && t(this.content), n || (this.maximizable ? (this.focusableMax = !0, n = this.maximizableButton) : (this.focusableClose = !0, n = this.closeButton)))), n && j(n, {
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
        this.styleElement = document.createElement("style"), this.styleElement.type = "text/css", nt(this.styleElement, "nonce", (t = this.$primevue) === null || t === void 0 || (t = t.config) === null || t === void 0 || (t = t.csp) === null || t === void 0 ? void 0 : t.nonce), document.head.appendChild(this.styleElement);
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
      t.target.closest("div").getAttribute("data-pc-section") !== "headeractions" && this.draggable && (this.dragging = !0, this.lastPageX = t.pageX, this.lastPageY = t.pageY, this.container.style.margin = "0", document.body.setAttribute("data-p-unselectable-text", "true"), !this.isUnstyled && tt(document.body, {
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
          var o = Je(t.container), s = Qe(t.container), a = n.pageX - t.lastPageX, c = n.pageY - t.lastPageY, i = t.container.getBoundingClientRect(), d = i.left + a, p = i.top + c, y = et(), x = getComputedStyle(t.container), _ = parseFloat(x.marginLeft), g = parseFloat(x.marginTop);
          t.container.style.position = "fixed", t.keepInViewport ? (d >= t.minX && d + o < y.width && (t.lastPageX = n.pageX, t.container.style.left = d - _ + "px"), p >= t.minY && p + s < y.height && (t.lastPageY = n.pageY, t.container.style.top = p - g + "px")) : (t.lastPageX = n.pageX, t.container.style.left = d - _ + "px", t.lastPageY = n.pageY, t.container.style.top = p - g + "px");
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
      return qe({
        maximized: this.maximized,
        modal: this.modal
      });
    }
  },
  directives: {
    ripple: Ge,
    focustrap: en
  },
  components: {
    Button: A,
    Portal: Xe,
    WindowMinimizeIcon: Ee,
    WindowMaximizeIcon: De,
    TimesIcon: Le
  }
};
function W(e) {
  "@babel/helpers - typeof";
  return W = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, W(e);
}
function ke(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(s) {
      return Object.getOwnPropertyDescriptor(e, s).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function Ce(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? ke(Object(n), !0).forEach(function(o) {
      rn(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : ke(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function rn(e, t, n) {
  return (t = ln(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ln(e) {
  var t = un(e, "string");
  return W(t) == "symbol" ? t : t + "";
}
function un(e, t) {
  if (W(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (W(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var dn = ["data-p"], cn = ["aria-labelledby", "aria-modal", "data-p"], pn = ["id"], fn = ["data-p"];
function mn(e, t, n, o, s, a) {
  var c = fe("Button"), i = fe("Portal"), d = ut("focustrap");
  return b(), R(i, {
    appendTo: e.appendTo
  }, {
    default: $(function() {
      return [s.containerVisible ? (b(), v("div", S({
        key: 0,
        ref: a.maskRef,
        class: e.cx("mask"),
        style: e.sx("mask", !0, {
          position: e.position,
          modal: e.modal
        }),
        onMousedown: t[1] || (t[1] = function() {
          return a.onMaskMouseDown && a.onMaskMouseDown.apply(a, arguments);
        }),
        onMouseup: t[2] || (t[2] = function() {
          return a.onMaskMouseUp && a.onMaskMouseUp.apply(a, arguments);
        }),
        "data-p": a.dataP
      }, e.ptm("mask")), [h(dt, S({
        name: "p-dialog",
        onEnter: a.onEnter,
        onAfterEnter: a.onAfterEnter,
        onBeforeLeave: a.onBeforeLeave,
        onLeave: a.onLeave,
        onAfterLeave: a.onAfterLeave,
        appear: ""
      }, e.ptm("transition")), {
        default: $(function() {
          return [e.visible ? X((b(), v("div", S({
            key: 0,
            ref: a.containerRef,
            class: e.cx("root"),
            style: e.sx("root"),
            role: "dialog",
            "aria-labelledby": a.ariaLabelledById,
            "aria-modal": e.modal,
            "data-p": a.dataP
          }, e.ptmi("root")), [e.$slots.container ? T(e.$slots, "container", {
            key: 0,
            closeCallback: a.close,
            maximizeCallback: function(y) {
              return a.maximize(y);
            },
            initDragCallback: a.initDrag
          }) : (b(), v(P, {
            key: 1
          }, [e.showHeader ? (b(), v("div", S({
            key: 0,
            ref: a.headerContainerRef,
            class: e.cx("header"),
            onMousedown: t[0] || (t[0] = function() {
              return a.initDrag && a.initDrag.apply(a, arguments);
            })
          }, e.ptm("header")), [T(e.$slots, "header", {
            class: E(e.cx("title"))
          }, function() {
            return [e.header ? (b(), v("span", S({
              key: 0,
              id: a.ariaLabelledById,
              class: e.cx("title")
            }, e.ptm("title")), k(e.header), 17, pn)) : C("", !0)];
          }), r("div", S({
            class: e.cx("headerActions")
          }, e.ptm("headerActions")), [e.maximizable ? T(e.$slots, "maximizebutton", {
            key: 0,
            maximized: s.maximized,
            maximizeCallback: function(y) {
              return a.maximize(y);
            }
          }, function() {
            return [h(c, S({
              ref: a.maximizableRef,
              autofocus: s.focusableMax,
              class: e.cx("pcMaximizeButton"),
              onClick: a.maximize,
              tabindex: e.maximizable ? "0" : "-1",
              unstyled: e.unstyled
            }, e.maximizeButtonProps, {
              pt: e.ptm("pcMaximizeButton"),
              "data-pc-group-section": "headericon"
            }), {
              icon: $(function(p) {
                return [T(e.$slots, "maximizeicon", {
                  maximized: s.maximized
                }, function() {
                  return [(b(), R(me(a.maximizeIconComponent), S({
                    class: [p.class, s.maximized ? e.minimizeIcon : e.maximizeIcon]
                  }, e.ptm("pcMaximizeButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "tabindex", "unstyled", "pt"])];
          }) : C("", !0), e.closable ? T(e.$slots, "closebutton", {
            key: 1,
            closeCallback: a.close
          }, function() {
            return [h(c, S({
              ref: a.closeButtonRef,
              autofocus: s.focusableClose,
              class: e.cx("pcCloseButton"),
              onClick: a.close,
              "aria-label": a.closeAriaLabel,
              unstyled: e.unstyled
            }, e.closeButtonProps, {
              pt: e.ptm("pcCloseButton"),
              "data-pc-group-section": "headericon"
            }), {
              icon: $(function(p) {
                return [T(e.$slots, "closeicon", {}, function() {
                  return [(b(), R(me(e.closeIcon ? "span" : "TimesIcon"), S({
                    class: [e.closeIcon, p.class]
                  }, e.ptm("pcCloseButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "aria-label", "unstyled", "pt"])];
          }) : C("", !0)], 16)], 16)) : C("", !0), r("div", S({
            ref: a.contentRef,
            class: [e.cx("content"), e.contentClass],
            style: e.contentStyle,
            "data-p": a.dataP
          }, Ce(Ce({}, e.contentProps), e.ptm("content"))), [T(e.$slots, "default")], 16, fn), e.footer || e.$slots.footer ? (b(), v("div", S({
            key: 1,
            ref: a.footerContainerRef,
            class: e.cx("footer")
          }, e.ptm("footer")), [T(e.$slots, "footer", {}, function() {
            return [B(k(e.footer), 1)];
          })], 16)) : C("", !0)], 64))], 16, cn)), [[d, {
            disabled: !e.modal
          }]]) : C("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onBeforeLeave", "onLeave", "onAfterLeave"])], 16, dn)) : C("", !0)];
    }),
    _: 3
  }, 8, ["appendTo"]);
}
te.render = mn;
function bn(e) {
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
  const n = bn(e);
  if (n === null) return "";
  const o = t?.now ?? Date.now(), s = t?.suffix ?? !0, a = t?.maxUnit ?? "day", c = t?.future ?? !1, i = 6e4, d = 60 * i, p = 24 * d, y = 30 * p, x = 365 * p, _ = o - n;
  if (c && _ < 0) {
    const L = -_;
    return L < i ? "in <1m" : L < d ? `in ${Math.floor(L / i)}m` : L < p ? `in ${Math.floor(L / d)}h` : `in ${Math.floor(L / p)}d`;
  }
  const g = Math.max(0, _);
  if (g < i) return "just now";
  const D = s ? " ago" : "";
  return g < d ? `${Math.floor(g / i)}m${D}` : g < p ? `${Math.floor(g / d)}h${D}` : a === "year" ? g < y ? `${Math.floor(g / p)}d${D}` : g < x ? `${Math.floor(g / y)}mo${D}` : `${Math.floor(g / x)}y${D}` : `${Math.floor(g / p)}d${D}`;
}
const hn = { class: "kx" }, vn = { class: "kx-bar" }, yn = { class: "kx-count" }, gn = { class: "kx-bar-actions" }, kn = {
  key: 0,
  class: "kx-search"
}, Cn = {
  key: 0,
  class: "kx-err"
}, xn = { class: "kx-body" }, wn = {
  key: 0,
  class: "kx-loading"
}, _n = {
  key: 1,
  class: "kx-empty"
}, Sn = { class: "kx-empty-ico" }, $n = { class: "kx-empty-actions" }, Ln = {
  key: 2,
  class: "kx-empty"
}, Dn = { class: "kx-empty-ico" }, En = { class: "kx-empty-sub" }, zn = { class: "kx-empty-actions" }, In = {
  key: 3,
  class: "kx-grid"
}, Mn = ["aria-label", "onClick", "onKeydown"], An = { class: "kx-card-head" }, On = { class: "kx-ficon" }, Bn = { class: "kx-card-id" }, Tn = ["title"], Pn = { class: "kx-card-meta" }, jn = ["title"], Rn = ["title"], Fn = { class: "kx-modal-head-icon" }, Vn = { class: "kx-modal-body" }, Hn = { class: "kx-modal-head-icon" }, Un = { class: "kx-modal-head-text" }, Nn = { class: "kx-modal-head-title" }, Kn = { class: "kx-modal-head-sub" }, Wn = {
  key: 0,
  class: "kx-modal-body"
}, Zn = { class: "kx-field" }, Yn = { class: "wh-token" }, Xn = { class: "kx-field" }, Gn = { class: "wh-token" }, qn = { key: 0 }, Jn = { class: "wh-note" }, Qn = { class: "wh-facts" }, eo = { class: "kx-field" }, to = ["disabled"], no = { class: "kx-field wh-schema" }, oo = { class: "wh-schema-edit" }, ao = ["disabled"], io = {
  key: 0,
  class: "kx-err inline"
}, so = /* @__PURE__ */ Se({
  __name: "Webhooks",
  setup(e) {
    const t = {
      header: { class: "kx-dialog-header" },
      content: { class: "kx-dialog-content" },
      footer: { class: "kx-dialog-footer" }
    }, n = O([]), o = O(!0), s = O(""), a = O(""), c = O(!1), i = O(null), d = O({ label: "", schemaText: "" }), p = O(""), y = O(!1), x = O(!1), _ = U(() => {
      const f = a.value.trim().toLowerCase();
      return f ? n.value.filter((u) => (u.label || u.webhook_id).toLowerCase().includes(f)) : n.value;
    }), g = U(() => ue(d.value.schemaText).schema || (i.value?.schema ?? {}));
    async function D() {
      o.value = !0, s.value = "";
      try {
        n.value = await Fe();
      } catch (f) {
        s.value = Y(f, "could not load webhooks");
      } finally {
        o.value = !1;
      }
    }
    function L(f) {
      return "POST /api/public/hooks/" + f;
    }
    function I(f) {
      return f.subscriber_count || 0;
    }
    function ae() {
      c.value = !0;
    }
    function ze() {
      c.value = !1;
    }
    async function Ie() {
      c.value = !1, await D();
    }
    function Z(f) {
      i.value = f, d.value = { label: f.label || "", schemaText: Te(f.schema || {}) }, p.value = "", x.value = !1;
    }
    function F() {
      i.value = null;
    }
    const ie = U({
      get: () => i.value !== null,
      set: (f) => {
        f || F();
      }
    });
    async function Me(f, u) {
      try {
        await navigator.clipboard.writeText(f), M.toast({ severity: "success", summary: "Copied", detail: u });
      } catch {
        M.toast({ severity: "warn", summary: "Copy failed", detail: "Select and copy manually." });
      }
    }
    async function Ae() {
      const f = i.value;
      if (!f) return;
      const u = ue(d.value.schemaText);
      if (u.error) {
        p.value = u.error;
        return;
      }
      y.value = !0, p.value = "";
      try {
        await Pe(f.webhook_id, { label: d.value.label.trim(), schema: u.schema }), M.toast({ severity: "success", summary: "Saved", detail: d.value.label.trim() || f.webhook_id }), F(), await D();
      } catch (l) {
        p.value = Y(l, "save failed");
      } finally {
        y.value = !1;
      }
    }
    async function se(f) {
      if (await M.confirm({
        message: `Revoke “${f.label || f.webhook_id}”? The secret stops working and subscribed automations receive no further events. This can't be undone.`,
        header: "Revoke webhook",
        icon: "tabler:ban",
        acceptLabel: "Revoke",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      }))
        try {
          await je(f.webhook_id), M.toast({ severity: "success", summary: "Revoked", detail: f.label || f.webhook_id }), i.value?.webhook_id === f.webhook_id && F(), await D();
        } catch (l) {
          s.value = Y(l, "revoke failed"), M.toast({ severity: "error", summary: "Revoke failed", detail: s.value });
        }
    }
    async function re(f) {
      if (I(f) > 0) {
        M.toast({
          severity: "warn",
          summary: "In use",
          detail: `Used by ${I(f)} automation${I(f) === 1 ? "" : "s"}. Remove those first.`
        });
        return;
      }
      if (await M.confirm({
        message: `Remove “${f.label || f.webhook_id}”? This deletes the webhook and its endpoint. This can't be undone.`,
        header: "Remove webhook",
        icon: "tabler:trash",
        acceptLabel: "Remove",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      }))
        try {
          await Re(f.webhook_id), M.toast({ severity: "success", summary: "Deletion accepted", detail: f.label || f.webhook_id }), i.value?.webhook_id === f.webhook_id && F(), await D();
        } catch (l) {
          s.value = Y(l, "delete failed"), M.toast({ severity: "error", summary: "Remove failed", detail: s.value });
        }
    }
    return Oe(D), zt(n, (f) => f.webhook_id), (f, u) => (b(), v("div", hn, [
      r("div", vn, [
        r("span", yn, k(n.value.length) + " webhook" + k(n.value.length !== 1 ? "s" : ""), 1),
        r("div", gn, [
          n.value.length ? (b(), v("div", kn, [
            h(m(w), {
              icon: "tabler:search",
              class: "kx-search-ico",
              "aria-hidden": "true"
            }),
            X(r("input", {
              "onUpdate:modelValue": u[0] || (u[0] = (l) => a.value = l),
              class: "kx-search-input",
              type: "text",
              placeholder: "Search webhooks…",
              "aria-label": "Search webhooks"
            }, null, 512), [
              [G, a.value]
            ])
          ])) : C("", !0),
          h(m(A), {
            type: "button",
            label: "New webhook",
            onClick: ae
          }, {
            icon: $(({ class: l }) => [
              h(m(w), {
                icon: "tabler:plus",
                class: E(l),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ])
      ]),
      s.value ? (b(), v("div", Cn, k(s.value), 1)) : C("", !0),
      r("div", xn, [
        o.value && !n.value.length ? (b(), v("div", wn, [
          h(m(w), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          u[10] || (u[10] = B(" Loading webhooks… ", -1))
        ])) : n.value.length ? _.value.length ? (b(), v("div", In, [
          (b(!0), v(P, null, ct(_.value, (l) => (b(), v("div", {
            key: l.webhook_id,
            class: E(["kx-card", l.status === "revoked" && "is-revoked"]),
            tabindex: "0",
            role: "button",
            "aria-label": `Open ${l.label || "webhook"}`,
            onClick: (z) => !l.deleting_at && Z(l),
            onKeydown: [
              be((z) => !l.deleting_at && Z(l), ["enter"]),
              be(N((z) => !l.deleting_at && Z(l), ["prevent"]), ["space"])
            ]
          }, [
            h($t, {
              state: l,
              onRetry: (z) => re(l)
            }, null, 8, ["state", "onRetry"]),
            r("div", An, [
              r("span", On, [
                h(m(w), {
                  icon: "tabler:webhook",
                  "aria-hidden": "true"
                })
              ]),
              r("div", Bn, [
                r("div", {
                  class: "kx-card-name",
                  title: l.label || "Webhook"
                }, k(l.label || "Webhook"), 9, Tn),
                r("div", Pn, [
                  r("span", {
                    class: E(["kx-chip kx-tag-sm", l.status === "active" ? "is-active" : "is-revoked"])
                  }, k(m(de)(l.status)), 3),
                  I(l) > 0 ? (b(), v("span", {
                    key: 0,
                    class: "kx-chip kx-tag-sm is-count",
                    title: `Used by ${I(l)} automation(s)`
                  }, [
                    h(m(w), {
                      icon: "tabler:plug-connected",
                      "aria-hidden": "true"
                    }),
                    B(" " + k(I(l)) + " automation" + k(I(l) === 1 ? "" : "s"), 1)
                  ], 8, jn)) : C("", !0)
                ])
              ]),
              r("div", {
                class: "kx-card-actions",
                onClick: u[2] || (u[2] = N(() => {
                }, ["stop"]))
              }, [
                h(m(A), {
                  type: "button",
                  severity: "secondary",
                  outlined: "",
                  size: "small",
                  title: "Open",
                  "aria-label": `Open ${l.label || "webhook"}`,
                  onClick: (z) => !l.deleting_at && Z(l),
                  disabled: !!l.deleting_at
                }, {
                  icon: $(({ class: z }) => [
                    h(m(w), {
                      icon: "tabler:pencil",
                      class: E(z),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick", "disabled"]),
                l.status === "active" ? (b(), R(m(A), {
                  key: 0,
                  type: "button",
                  severity: "danger",
                  outlined: "",
                  size: "small",
                  title: "Revoke",
                  "aria-label": `Revoke ${l.label || "webhook"}`,
                  onClick: (z) => se(l),
                  disabled: !!l.deleting_at
                }, {
                  icon: $(({ class: z }) => [
                    h(m(w), {
                      icon: "tabler:ban",
                      class: E(z),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick", "disabled"])) : C("", !0),
                h(m(A), {
                  type: "button",
                  severity: "danger",
                  outlined: "",
                  size: "small",
                  title: "Remove",
                  "aria-label": `Remove ${l.label || "webhook"}`,
                  disabled: !!l.deleting_at || I(l) > 0,
                  onClick: (z) => re(l)
                }, {
                  icon: $(({ class: z }) => [
                    h(m(w), {
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
              title: L(l.webhook_id)
            }, k(L(l.webhook_id)), 9, Rn)
          ], 42, Mn))), 128))
        ])) : (b(), v("div", Ln, [
          r("div", Dn, [
            h(m(w), {
              icon: "tabler:mood-empty",
              "aria-hidden": "true"
            })
          ]),
          u[13] || (u[13] = r("div", { class: "kx-empty-title" }, "No matches", -1)),
          r("div", En, "Nothing matches “" + k(a.value) + "”. Try a different term or clear the search.", 1),
          r("div", zn, [
            h(m(A), {
              type: "button",
              severity: "secondary",
              outlined: "",
              label: "Clear search",
              onClick: u[1] || (u[1] = (l) => a.value = "")
            }, {
              icon: $(({ class: l }) => [
                h(m(w), {
                  icon: "tabler:x",
                  class: E(l),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ])) : (b(), v("div", _n, [
          r("div", Sn, [
            h(m(w), {
              icon: "tabler:webhook",
              "aria-hidden": "true"
            })
          ]),
          u[11] || (u[11] = r("div", { class: "kx-empty-title" }, "No webhooks yet", -1)),
          u[12] || (u[12] = r("div", { class: "kx-empty-sub" }, "A webhook gives an external service a secret URL to POST to. Each request becomes a trigger event your automations can act on.", -1)),
          r("div", $n, [
            h(m(A), {
              type: "button",
              label: "New webhook",
              onClick: ae
            }, {
              icon: $(({ class: l }) => [
                h(m(w), {
                  icon: "tabler:plus",
                  class: E(l),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ]))
      ]),
      h(m(te), {
        visible: c.value,
        "onUpdate:visible": u[3] || (u[3] = (l) => c.value = l),
        modal: "",
        "dismissable-mask": !0,
        class: "kx-dialog",
        pt: t,
        "aria-label": "New webhook"
      }, {
        header: $(() => [
          r("span", Fn, [
            h(m(w), {
              icon: "tabler:webhook",
              "aria-hidden": "true"
            })
          ]),
          u[14] || (u[14] = r("span", { class: "kx-modal-head-text" }, [
            r("span", { class: "kx-modal-head-title" }, "New webhook"),
            r("span", { class: "kx-modal-head-sub" }, "Name it and set the payload it accepts — the secret is shown once.")
          ], -1))
        ]),
        default: $(() => [
          r("div", Vn, [
            h(at, {
              onCreated: Ie,
              onClose: ze
            })
          ])
        ]),
        _: 1
      }, 8, ["visible"]),
      h(m(te), {
        visible: ie.value,
        "onUpdate:visible": u[9] || (u[9] = (l) => ie.value = l),
        modal: "",
        class: "kx-dialog",
        pt: t,
        "aria-label": "Webhook detail"
      }, pt({
        default: $(() => [
          i.value ? (b(), v("div", Wn, [
            r("div", Zn, [
              u[15] || (u[15] = r("span", { class: "kx-field-lbl" }, [
                B("Endpoint URL "),
                r("span", { class: "kx-field-hint-inline" }, "— hand this to the sender")
              ], -1)),
              r("div", Yn, [
                r("code", null, k(m(ce)(i.value.webhook_id)), 1),
                r("button", {
                  type: "button",
                  class: "wh-copy",
                  title: "Copy URL",
                  "aria-label": "Copy URL",
                  onClick: u[4] || (u[4] = (l) => Me(m(ce)(i.value.webhook_id), "endpoint URL"))
                }, [
                  h(m(w), {
                    icon: "tabler:copy",
                    "aria-hidden": "true"
                  })
                ])
              ])
            ]),
            r("div", Xn, [
              u[17] || (u[17] = r("span", { class: "kx-field-lbl" }, "Secret", -1)),
              r("div", Gn, [
                r("code", null, [
                  B(k(i.value.secret_prefix || "Not available"), 1),
                  i.value.secret_prefix ? (b(), v("span", qn, "…")) : C("", !0)
                ])
              ]),
              r("p", Jn, [
                h(m(w), {
                  icon: "tabler:info-circle",
                  "aria-hidden": "true"
                }),
                u[16] || (u[16] = r("span", null, "The full secret is shown only when a webhook is created. To rotate it, revoke this webhook and create a new one.", -1))
              ])
            ]),
            r("dl", Qn, [
              i.value.created_at ? (b(), v(P, { key: 0 }, [
                u[18] || (u[18] = r("dt", null, "Created", -1)),
                r("dd", null, k(m(xe)(i.value.created_at)), 1)
              ], 64)) : C("", !0),
              i.value.last_used_at ? (b(), v(P, { key: 1 }, [
                u[19] || (u[19] = r("dt", null, "Last received", -1)),
                r("dd", null, k(m(xe)(i.value.last_used_at)), 1)
              ], 64)) : C("", !0),
              I(i.value) > 0 ? (b(), v(P, { key: 2 }, [
                u[20] || (u[20] = r("dt", null, "Used by", -1)),
                r("dd", null, k(I(i.value)) + " automation" + k(I(i.value) === 1 ? "" : "s"), 1)
              ], 64)) : C("", !0)
            ]),
            r("label", eo, [
              u[21] || (u[21] = r("span", { class: "kx-field-lbl" }, [
                B("Name "),
                r("span", { class: "kx-field-hint-inline" }, "— shown in automation trigger pickers")
              ], -1)),
              X(r("input", {
                "onUpdate:modelValue": u[5] || (u[5] = (l) => d.value.label = l),
                class: "kx-input",
                type: "text",
                placeholder: "Customer events",
                disabled: i.value.status === "revoked",
                "data-test": "wh-name"
              }, null, 8, to), [
                [G, d.value.label]
              ])
            ]),
            r("div", no, [
              u[23] || (u[23] = r("span", { class: "kx-field-lbl" }, [
                B("Payload schema "),
                r("span", { class: "kx-field-hint-inline" }, "— the fields each inbound request must carry")
              ], -1)),
              h(Be, { schema: g.value }, null, 8, ["schema"]),
              r("div", oo, [
                r("button", {
                  type: "button",
                  class: E(["wh-toggle", x.value && "is-open"]),
                  onClick: u[6] || (u[6] = (l) => x.value = !x.value)
                }, [
                  h(m(w), {
                    icon: "tabler:chevron-right",
                    "aria-hidden": "true"
                  }),
                  u[22] || (u[22] = B(" Edit as JSON Schema ", -1))
                ], 2),
                x.value ? X((b(), v("textarea", {
                  key: 0,
                  "onUpdate:modelValue": u[7] || (u[7] = (l) => d.value.schemaText = l),
                  class: "kx-input kx-textarea",
                  spellcheck: "false",
                  disabled: i.value.status === "revoked",
                  "data-test": "wh-schema"
                }, null, 8, ao)), [
                  [G, d.value.schemaText]
                ]) : C("", !0)
              ])
            ]),
            p.value ? (b(), v("div", io, k(p.value), 1)) : C("", !0)
          ])) : C("", !0)
        ]),
        _: 2
      }, [
        i.value ? {
          name: "header",
          fn: $(() => [
            r("span", Hn, [
              h(m(w), {
                icon: "tabler:webhook",
                "aria-hidden": "true"
              })
            ]),
            r("span", Un, [
              r("span", Nn, k(i.value.label || "Webhook"), 1),
              r("span", Kn, k(L(i.value.webhook_id)), 1)
            ]),
            r("span", {
              class: E(["kx-chip kx-tag-sm", i.value.status === "active" ? "is-active" : "is-revoked"])
            }, k(m(de)(i.value.status)), 3)
          ]),
          key: "0"
        } : void 0,
        i.value ? {
          name: "footer",
          fn: $(() => [
            i.value.status === "active" ? (b(), R(m(A), {
              key: 0,
              type: "button",
              severity: "danger",
              size: "small",
              class: "kx-foot-spacer",
              label: "Revoke",
              onClick: u[8] || (u[8] = (l) => se(i.value))
            }, {
              icon: $(({ class: l }) => [
                h(m(w), {
                  icon: "tabler:ban",
                  class: E(l),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })) : C("", !0),
            h(m(A), {
              type: "button",
              label: "Close",
              severity: "secondary",
              outlined: "",
              onClick: F
            }),
            i.value.status === "active" ? (b(), R(m(A), {
              key: 1,
              type: "button",
              label: "Save changes",
              loading: y.value,
              disabled: y.value,
              "data-test": "wh-save",
              onClick: Ae
            }, {
              icon: $(({ class: l }) => [
                h(m(w), {
                  icon: "tabler:device-floppy",
                  class: E(l),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }, 8, ["loading", "disabled"])) : C("", !0)
          ]),
          key: "1"
        } : void 0
      ]), 1032, ["visible"])
    ]));
  }
});
class ro extends Ve {
  static get wippyConfig() {
    return {
      propsSchema: it.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: He
    };
  }
  static get vueConfig() {
    return { rootComponent: so, plugins: [st] };
  }
}
bt(import.meta.url, ro);
//# sourceMappingURL=index.js.map
