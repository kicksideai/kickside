import { a as ue, p as ce, b as Oe, w as pe, i as fe, _ as Be, c as Te, d as Pe, e as G, r as Re, g as Fe, h as Ve, W as He, s as Ue } from "./styles-DTSarnYW.js";
import { B as ae, s as Se, a as I, b as se, L as Ne, c as F, v as U, d as Ke, U as We, I as me, e as Ze, f as Ye, r as $e, g as Xe, h as Ge, R as qe, i as Je, j as Qe, C as et, k as tt, S as nt, l as ot, W as it, _ as at, p as st, P as rt } from "./package-BFVnrWK1.js";
import { openBlock as v, createElementBlock as C, mergeProps as D, createElementVNode as r, defineComponent as Le, computed as K, withModifiers as W, Fragment as P, createTextVNode as O, toDisplayString as S, createCommentVNode as $, createVNode as k, unref as h, watch as lt, onBeforeUnmount as dt, resolveComponent as be, resolveDirective as ut, createBlock as V, withCtx as E, Transition as ct, withDirectives as q, renderSlot as B, normalizeClass as z, resolveDynamicComponent as he, ref as A, vModelText as Q, renderList as pt, withKeys as ve, createSlots as ft } from "vue";
import { on as mt, api as bt, host as M, define as ht } from "@wippy-fe/proxy";
import { Icon as L } from "@iconify/vue";
function vt() {
  let e = [], t = (u, s, p = 999) => {
    let b = a(u, s, p), x = b.value + (b.key === u ? 0 : p) + 1;
    return e.push({ key: u, value: x }), x;
  }, n = (u) => {
    e = e.filter((s) => s.value !== u);
  }, o = (u, s) => a(u).value, a = (u, s, p = 0) => [...e].reverse().find((b) => !0) || { key: u, value: p }, i = (u) => u && parseInt(u.style.zIndex, 10) || 0;
  return { get: i, set: (u, s, p) => {
    s && (s.style.zIndex = String(t(u, !0, p)));
  }, clear: (u) => {
    u && (n(i(u)), u.style.zIndex = "");
  }, getCurrent: (u) => o(u) };
}
var ee = vt(), yt = `
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
`, gt = {
  root: "p-progressspinner",
  spin: "p-progressspinner-spin",
  circle: "p-progressspinner-circle"
}, kt = ae.extend({
  name: "progressspinner",
  style: yt,
  classes: gt
}), Ct = {
  name: "BaseProgressSpinner",
  extends: Se,
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
  style: kt,
  provide: function() {
    return {
      $pcProgressSpinner: this,
      $parentInstance: this
    };
  }
}, De = {
  name: "ProgressSpinner",
  extends: Ct,
  inheritAttrs: !1,
  computed: {
    svgStyle: function() {
      return {
        "animation-duration": this.animationDuration
      };
    }
  }
}, _t = ["fill", "stroke-width"];
function xt(e, t, n, o, a, i) {
  return v(), C("div", D({
    class: e.cx("root"),
    role: "progressbar"
  }, e.ptmi("root")), [(v(), C("svg", D({
    class: e.cx("spin"),
    viewBox: "25 25 50 50",
    style: i.svgStyle
  }, e.ptm("spin")), [r("circle", D({
    class: e.cx("circle"),
    cx: "50",
    cy: "50",
    r: "20",
    fill: e.fill,
    "stroke-width": e.strokeWidth,
    strokeMiterlimit: "10"
  }, e.ptm("circle")), null, 16, _t)], 16))], 16);
}
De.render = xt;
const wt = { key: 0 }, St = /* @__PURE__ */ Le({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(e) {
    const t = e, n = K(() => t.state.deletion_job === null || ["dead", "cancelled"].includes(t.state.deletion_job?.status || ""));
    return (o, a) => e.state.deleting_at ? (v(), C("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: a[1] || (a[1] = W(() => {
      }, ["stop"])),
      onKeydown: a[2] || (a[2] = W(() => {
      }, ["stop"]))
    }, [
      n.value ? (v(), C(P, { key: 0 }, [
        r("span", null, [
          a[3] || (a[3] = O("Deletion failed", -1)),
          e.state.deletion_job?.last_error ? (v(), C("span", wt, ": " + S(e.state.deletion_job.last_error), 1)) : $("", !0)
        ]),
        k(h(I), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: a[0] || (a[0] = W((i) => o.$emit("retry"), ["stop"]))
        })
      ], 64)) : (v(), C(P, { key: 1 }, [
        k(h(De), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        a[4] || (a[4] = r("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : $("", !0);
  }
});
function N(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function $t(e, t) {
  return e;
}
function Lt(e, t, n) {
  const o = N(e) ? e : {}, a = [
    o,
    N(o.data) ? o.data : null,
    N(o.payload) ? o.payload : null,
    N(o.detail) ? o.detail : null
  ].filter(Boolean);
  for (const i of a) {
    if (i.event !== "component.meta.changed" && i.event !== "component.deleting" && i.event !== "component.deleted") continue;
    const u = String(i.component_id || ""), s = String(o.topic || i.topic || "");
    if (!u && (!s.startsWith("component.") || s === "component.")) continue;
    const p = u || t || s.slice(10);
    return i.event === "component.deleting" && typeof i.deletion_job_id == "string" && i.deletion_job_id ? { event: i.event, component_id: p, deletion_job_id: i.deletion_job_id } : i.event !== "component.meta.changed" ? { event: i.event, component_id: p } : {
      event: "component.meta.changed",
      component_id: p,
      meta: $t(N(i.meta) ? i.meta : {}),
      deleted: Array.isArray(i.deleted) ? i.deleted.map(String) : []
    };
  }
  return null;
}
function Dt(e, t) {
  const n = Lt(e, t);
  return n && n.event !== "component.meta.changed" ? n : null;
}
function Et(e, t, n, o) {
  let a = !0;
  const i = /* @__PURE__ */ new Set(), u = /* @__PURE__ */ new Map();
  function s(y, f) {
    const g = e.value.find((J) => t(J) === y), c = u.get(y), _ = f?.job_id || c?.deletion_job_id || g?.deletion_job_id, T = c ? c.deletion_job_id : g?.deleting_at ? g.deletion_job_id : void 0;
    if ((c || g?.deleting_at) && _ === T) return;
    const R = {
      deleting_at: c?.deleting_at || g?.deleting_at || (/* @__PURE__ */ new Date()).toISOString(),
      deletion_job_id: _
    };
    u.set(y, R), g && (Object.assign(g, R), g.deletion_job = void 0);
  }
  async function p(y) {
    const f = t(y), g = u.get(f), c = () => a && e.value.includes(y) && u.get(f) === g;
    try {
      const { data: _ } = await bt.get(`/api/v1/components/${encodeURIComponent(f)}`);
      if (!_?.success) throw new Error(ue(_, "Could not read deletion progress"));
      c() && (y.deleting_at = g?.deleting_at || _.deleting_at, y.deletion_job_id = _.deletion_job_id, g && (g.deletion_job_id = y.deletion_job_id), y.deletion_job = _.deletion_job ?? null);
    } catch (_) {
      c() && M.handleError("other", { message: ue(_, "Could not read deletion progress") });
    }
  }
  let b = [];
  const x = lt(() => e.value, (y, f = []) => {
    const g = y.filter((c) => !i.has(t(c)));
    for (const c of f)
      i.has(t(c)) || g.some((_) => t(_) === t(c)) || c.deleting_at && o?.(t(c));
    if (g.length !== y.length) {
      e.value = g;
      return;
    }
    for (const c of y) {
      const _ = u.get(t(c));
      _ && (c.deletion_job_id !== _.deletion_job_id && (c.deletion_job = void 0), Object.assign(c, _));
      const T = f.find((R) => t(R) === t(c));
      c.deletion_job === void 0 && T?.deletion_job_id === c.deletion_job_id && (c.deletion_job = T?.deletion_job), c.deleting_at && !b.includes(c) && p(c);
    }
    b = y;
  }, { immediate: !0 }), w = mt("@message", (y) => {
    const f = Dt(y);
    if (!f) return;
    const g = e.value.find((c) => t(c) === f.component_id);
    f.event === "component.deleted" ? (g && !i.has(f.component_id) && o?.(f.component_id), i.add(f.component_id), u.delete(f.component_id), e.value = e.value.filter((c) => t(c) !== f.component_id)) : g && s(f.component_id, { job_id: f.deletion_job_id });
  });
  return dt(() => {
    a = !1, x(), typeof w == "function" && w();
  }), { acceptDeletion: s };
}
var Ee = {
  name: "TimesIcon",
  extends: se
};
function zt(e) {
  return At(e) || It(e) || Mt(e) || jt();
}
function jt() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Mt(e, t) {
  if (e) {
    if (typeof e == "string") return te(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? te(e, t) : void 0;
  }
}
function It(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function At(e) {
  if (Array.isArray(e)) return te(e);
}
function te(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function Ot(e, t, n, o, a, i) {
  return v(), C("svg", D({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), zt(t[0] || (t[0] = [r("path", {
    d: "M8.01186 7.00933L12.27 2.75116C12.341 2.68501 12.398 2.60524 12.4375 2.51661C12.4769 2.42798 12.4982 2.3323 12.4999 2.23529C12.5016 2.13827 12.4838 2.0419 12.4474 1.95194C12.4111 1.86197 12.357 1.78024 12.2884 1.71163C12.2198 1.64302 12.138 1.58893 12.0481 1.55259C11.9581 1.51625 11.8617 1.4984 11.7647 1.50011C11.6677 1.50182 11.572 1.52306 11.4834 1.56255C11.3948 1.60204 11.315 1.65898 11.2488 1.72997L6.99067 5.98814L2.7325 1.72997C2.59553 1.60234 2.41437 1.53286 2.22718 1.53616C2.03999 1.53946 1.8614 1.61529 1.72901 1.74767C1.59663 1.88006 1.5208 2.05865 1.5175 2.24584C1.5142 2.43303 1.58368 2.61419 1.71131 2.75116L5.96948 7.00933L1.71131 11.2675C1.576 11.403 1.5 11.5866 1.5 11.7781C1.5 11.9696 1.576 12.1532 1.71131 12.2887C1.84679 12.424 2.03043 12.5 2.2219 12.5C2.41338 12.5 2.59702 12.424 2.7325 12.2887L6.99067 8.03052L11.2488 12.2887C11.3843 12.424 11.568 12.5 11.7594 12.5C11.9509 12.5 12.1346 12.424 12.27 12.2887C12.4053 12.1532 12.4813 11.9696 12.4813 11.7781C12.4813 11.5866 12.4053 11.403 12.27 11.2675L8.01186 7.00933Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Ee.render = Ot;
var ze = {
  name: "WindowMaximizeIcon",
  extends: se
};
function Bt(e) {
  return Ft(e) || Rt(e) || Pt(e) || Tt();
}
function Tt() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Pt(e, t) {
  if (e) {
    if (typeof e == "string") return ne(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? ne(e, t) : void 0;
  }
}
function Rt(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Ft(e) {
  if (Array.isArray(e)) return ne(e);
}
function ne(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function Vt(e, t, n, o, a, i) {
  return v(), C("svg", D({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Bt(t[0] || (t[0] = [r("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14ZM9.77805 7.42192C9.89013 7.534 10.0415 7.59788 10.2 7.59995C10.3585 7.59788 10.5099 7.534 10.622 7.42192C10.7341 7.30985 10.798 7.15844 10.8 6.99995V3.94242C10.8066 3.90505 10.8096 3.86689 10.8089 3.82843C10.8079 3.77159 10.7988 3.7157 10.7824 3.6623C10.756 3.55552 10.701 3.45698 10.622 3.37798C10.5099 3.2659 10.3585 3.20202 10.2 3.19995H7.00002C6.84089 3.19995 6.68828 3.26317 6.57576 3.37569C6.46324 3.48821 6.40002 3.64082 6.40002 3.79995C6.40002 3.95908 6.46324 4.11169 6.57576 4.22422C6.68828 4.33674 6.84089 4.39995 7.00002 4.39995H8.80006L6.19997 7.00005C6.10158 7.11005 6.04718 7.25246 6.04718 7.40005C6.04718 7.54763 6.10158 7.69004 6.19997 7.80005C6.30202 7.91645 6.44561 7.98824 6.59997 8.00005C6.75432 7.98824 6.89791 7.91645 6.99997 7.80005L9.60002 5.26841V6.99995C9.6021 7.15844 9.66598 7.30985 9.77805 7.42192ZM1.4 14H3.8C4.17066 13.9979 4.52553 13.8498 4.78763 13.5877C5.04973 13.3256 5.1979 12.9707 5.2 12.6V10.2C5.1979 9.82939 5.04973 9.47452 4.78763 9.21242C4.52553 8.95032 4.17066 8.80215 3.8 8.80005H1.4C1.02934 8.80215 0.674468 8.95032 0.412371 9.21242C0.150274 9.47452 0.00210008 9.82939 0 10.2V12.6C0.00210008 12.9707 0.150274 13.3256 0.412371 13.5877C0.674468 13.8498 1.02934 13.9979 1.4 14ZM1.25858 10.0586C1.29609 10.0211 1.34696 10 1.4 10H3.8C3.85304 10 3.90391 10.0211 3.94142 10.0586C3.97893 10.0961 4 10.147 4 10.2V12.6C4 12.6531 3.97893 12.704 3.94142 12.7415C3.90391 12.779 3.85304 12.8 3.8 12.8H1.4C1.34696 12.8 1.29609 12.779 1.25858 12.7415C1.22107 12.704 1.2 12.6531 1.2 12.6V10.2C1.2 10.147 1.22107 10.0961 1.25858 10.0586Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
ze.render = Vt;
var je = {
  name: "WindowMinimizeIcon",
  extends: se
};
function Ht(e) {
  return Wt(e) || Kt(e) || Nt(e) || Ut();
}
function Ut() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Nt(e, t) {
  if (e) {
    if (typeof e == "string") return oe(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? oe(e, t) : void 0;
  }
}
function Kt(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Wt(e) {
  if (Array.isArray(e)) return oe(e);
}
function oe(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function Zt(e, t, n, o, a, i) {
  return v(), C("svg", D({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Ht(t[0] || (t[0] = [r("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0ZM6.368 7.952C6.44137 7.98326 6.52025 7.99958 6.6 8H9.8C9.95913 8 10.1117 7.93678 10.2243 7.82426C10.3368 7.71174 10.4 7.55913 10.4 7.4C10.4 7.24087 10.3368 7.08826 10.2243 6.97574C10.1117 6.86321 9.95913 6.8 9.8 6.8H8.048L10.624 4.224C10.73 4.11026 10.7877 3.95982 10.7849 3.80438C10.7822 3.64894 10.7192 3.50063 10.6093 3.3907C10.4994 3.28077 10.3511 3.2178 10.1956 3.21506C10.0402 3.21232 9.88974 3.27002 9.776 3.376L7.2 5.952V4.2C7.2 4.04087 7.13679 3.88826 7.02426 3.77574C6.91174 3.66321 6.75913 3.6 6.6 3.6C6.44087 3.6 6.28826 3.66321 6.17574 3.77574C6.06321 3.88826 6 4.04087 6 4.2V7.4C6.00042 7.47975 6.01674 7.55862 6.048 7.632C6.07656 7.70442 6.11971 7.7702 6.17475 7.82524C6.2298 7.88029 6.29558 7.92344 6.368 7.952ZM1.4 8.80005H3.8C4.17066 8.80215 4.52553 8.95032 4.78763 9.21242C5.04973 9.47452 5.1979 9.82939 5.2 10.2V12.6C5.1979 12.9707 5.04973 13.3256 4.78763 13.5877C4.52553 13.8498 4.17066 13.9979 3.8 14H1.4C1.02934 13.9979 0.674468 13.8498 0.412371 13.5877C0.150274 13.3256 0.00210008 12.9707 0 12.6V10.2C0.00210008 9.82939 0.150274 9.47452 0.412371 9.21242C0.674468 8.95032 1.02934 8.80215 1.4 8.80005ZM3.94142 12.7415C3.97893 12.704 4 12.6531 4 12.6V10.2C4 10.147 3.97893 10.0961 3.94142 10.0586C3.90391 10.0211 3.85304 10 3.8 10H1.4C1.34696 10 1.29609 10.0211 1.25858 10.0586C1.22107 10.0961 1.2 10.147 1.2 10.2V12.6C1.2 12.6531 1.22107 12.704 1.25858 12.7415C1.29609 12.779 1.34696 12.8 1.4 12.8H3.8C3.85304 12.8 3.90391 12.779 3.94142 12.7415Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
je.render = Zt;
var Yt = ae.extend({
  name: "focustrap-directive"
}), Xt = Ke.extend({
  style: Yt
});
function Z(e) {
  "@babel/helpers - typeof";
  return Z = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Z(e);
}
function ye(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(a) {
      return Object.getOwnPropertyDescriptor(e, a).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function ge(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? ye(Object(n), !0).forEach(function(o) {
      Gt(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : ye(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function Gt(e, t, n) {
  return (t = qt(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function qt(e) {
  var t = Jt(e, "string");
  return Z(t) == "symbol" ? t : t + "";
}
function Jt(e, t) {
  if (Z(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (Z(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Qt = Xt.extend("focustrap", {
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
      var o = this, a = n.value || {}, i = a.onFocusIn, u = a.onFocusOut;
      t.$_pfocustrap_mutationobserver = new MutationObserver(function(s) {
        s.forEach(function(p) {
          if (p.type === "childList" && !t.contains(document.activeElement)) {
            var b = function(w) {
              var y = me(w) ? me(w, o.getComputedSelector(t.$_pfocustrap_focusableselector)) ? w : U(t, o.getComputedSelector(t.$_pfocustrap_focusableselector)) : U(w);
              return Ze(y) ? y : w.nextSibling && b(w.nextSibling);
            };
            F(b(p.nextSibling));
          }
        });
      }), t.$_pfocustrap_mutationobserver.disconnect(), t.$_pfocustrap_mutationobserver.observe(t, {
        childList: !0
      }), t.$_pfocustrap_focusinlistener = function(s) {
        return i && i(s);
      }, t.$_pfocustrap_focusoutlistener = function(s) {
        return u && u(s);
      }, t.addEventListener("focusin", t.$_pfocustrap_focusinlistener), t.addEventListener("focusout", t.$_pfocustrap_focusoutlistener);
    },
    unbind: function(t) {
      t.$_pfocustrap_mutationobserver && t.$_pfocustrap_mutationobserver.disconnect(), t.$_pfocustrap_focusinlistener && t.removeEventListener("focusin", t.$_pfocustrap_focusinlistener) && (t.$_pfocustrap_focusinlistener = null), t.$_pfocustrap_focusoutlistener && t.removeEventListener("focusout", t.$_pfocustrap_focusoutlistener) && (t.$_pfocustrap_focusoutlistener = null);
    },
    autoFocus: function(t) {
      this.autoElementFocus(this.$el, {
        value: ge(ge({}, t), {}, {
          autoFocus: !0
        })
      });
    },
    autoElementFocus: function(t, n) {
      var o = n.value || {}, a = o.autoFocusSelector, i = a === void 0 ? "" : a, u = o.firstFocusableSelector, s = u === void 0 ? "" : u, p = o.autoFocus, b = p === void 0 ? !1 : p, x = U(t, "[autofocus]".concat(this.getComputedSelector(i)));
      b && !x && (x = U(t, this.getComputedSelector(s))), F(x);
    },
    onFirstHiddenElementFocus: function(t) {
      var n, o = t.currentTarget, a = t.relatedTarget, i = a === o.$_pfocustrap_lasthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(a)) ? U(o.parentElement, this.getComputedSelector(o.$_pfocustrap_focusableselector)) : o.$_pfocustrap_lasthiddenfocusableelement;
      F(i);
    },
    onLastHiddenElementFocus: function(t) {
      var n, o = t.currentTarget, a = t.relatedTarget, i = a === o.$_pfocustrap_firsthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(a)) ? Ne(o.parentElement, this.getComputedSelector(o.$_pfocustrap_focusableselector)) : o.$_pfocustrap_firsthiddenfocusableelement;
      F(i);
    },
    createHiddenFocusableElements: function(t, n) {
      var o = this, a = n.value || {}, i = a.tabIndex, u = i === void 0 ? 0 : i, s = a.firstFocusableSelector, p = s === void 0 ? "" : s, b = a.lastFocusableSelector, x = b === void 0 ? "" : b, w = function(c) {
        return We("span", {
          class: "p-hidden-accessible p-hidden-focusable",
          tabIndex: u,
          role: "presentation",
          "aria-hidden": !0,
          "data-p-hidden-accessible": !0,
          "data-p-hidden-focusable": !0,
          onFocus: c?.bind(o)
        });
      }, y = w(this.onFirstHiddenElementFocus), f = w(this.onLastHiddenElementFocus);
      y.$_pfocustrap_lasthiddenfocusableelement = f, y.$_pfocustrap_focusableselector = p, y.setAttribute("data-pc-section", "firstfocusableelement"), f.$_pfocustrap_firsthiddenfocusableelement = y, f.$_pfocustrap_focusableselector = x, f.setAttribute("data-pc-section", "lastfocusableelement"), t.prepend(y), t.append(f);
    }
  }
});
function ke() {
  Xe({
    variableName: $e("scrollbar.width").name
  });
}
function Ce() {
  Ye({
    variableName: $e("scrollbar.width").name
  });
}
var en = `
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
`, tn = {
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
}, nn = {
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
}, on = ae.extend({
  name: "dialog",
  style: en,
  classes: nn,
  inlineStyles: tn
}), an = {
  name: "BaseDialog",
  extends: Se,
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
  style: on,
  provide: function() {
    return {
      $pcDialog: this,
      $parentInstance: this
    };
  }
}, ie = {
  name: "Dialog",
  extends: an,
  inheritAttrs: !1,
  emits: ["update:visible", "show", "hide", "after-hide", "maximize", "unmaximize", "dragstart", "dragend"],
  provide: function() {
    var t = this;
    return {
      dialogRef: K(function() {
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
    this.unbindDocumentState(), this.unbindGlobalListeners(), this.destroyStyle(), this.mask && this.autoZIndex && ee.clear(this.mask), this.container = null, this.mask = null;
  },
  mounted: function() {
    this.breakpoints && this.createStyle();
  },
  methods: {
    close: function() {
      this.$emit("update:visible", !1);
    },
    onEnter: function() {
      this.$emit("show"), this.target = document.activeElement, this.enableDocumentSettings(), this.bindGlobalListeners(), this.autoZIndex && ee.set("modal", this.mask, this.baseZIndex || this.$primevue.config.zIndex.modal);
    },
    onAfterEnter: function() {
      this.focus();
    },
    onBeforeLeave: function() {
      this.modal && !this.isUnstyled && it(this.mask, "p-overlay-mask-leave-active"), this.dragging && this.documentDragEndListener && this.documentDragEndListener();
    },
    onLeave: function() {
      this.$emit("hide"), F(this.target), this.target = null, this.focusableClose = null, this.focusableMax = null;
    },
    onAfterLeave: function() {
      this.autoZIndex && ee.clear(this.mask), this.containerVisible = !1, this.unbindDocumentState(), this.unbindGlobalListeners(), this.$emit("after-hide");
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
      n || (n = this.$slots.header && t(this.headerContainer), n || (n = this.$slots.default && t(this.content), n || (this.maximizable ? (this.focusableMax = !0, n = this.maximizableButton) : (this.focusableClose = !0, n = this.closeButton)))), n && F(n, {
        focusVisible: !0
      });
    },
    maximize: function(t) {
      this.maximized ? (this.maximized = !1, this.$emit("unmaximize", t)) : (this.maximized = !0, this.$emit("maximize", t)), this.modal || (this.maximized ? ke() : Ce());
    },
    enableDocumentSettings: function() {
      (this.modal || !this.modal && this.blockScroll || this.maximizable && this.maximized) && ke();
    },
    unbindDocumentState: function() {
      (this.modal || !this.modal && this.blockScroll || this.maximizable && this.maximized) && Ce();
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
          var o = Qe(t.container), a = et(t.container), i = n.pageX - t.lastPageX, u = n.pageY - t.lastPageY, s = t.container.getBoundingClientRect(), p = s.left + i, b = s.top + u, x = tt(), w = getComputedStyle(t.container), y = parseFloat(w.marginLeft), f = parseFloat(w.marginTop);
          t.container.style.position = "fixed", t.keepInViewport ? (p >= t.minX && p + o < x.width && (t.lastPageX = n.pageX, t.container.style.left = p - y + "px"), b >= t.minY && b + a < x.height && (t.lastPageY = n.pageY, t.container.style.top = b - f + "px")) : (t.lastPageX = n.pageX, t.container.style.left = p - y + "px", t.lastPageY = n.pageY, t.container.style.top = b - f + "px");
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
    focustrap: Qt
  },
  components: {
    Button: I,
    Portal: Ge,
    WindowMinimizeIcon: je,
    WindowMaximizeIcon: ze,
    TimesIcon: Ee
  }
};
function Y(e) {
  "@babel/helpers - typeof";
  return Y = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Y(e);
}
function _e(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(a) {
      return Object.getOwnPropertyDescriptor(e, a).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function xe(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? _e(Object(n), !0).forEach(function(o) {
      sn(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : _e(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function sn(e, t, n) {
  return (t = rn(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function rn(e) {
  var t = ln(e, "string");
  return Y(t) == "symbol" ? t : t + "";
}
function ln(e, t) {
  if (Y(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (Y(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var dn = ["data-p"], un = ["aria-labelledby", "aria-modal", "data-p"], cn = ["id"], pn = ["data-p"];
function fn(e, t, n, o, a, i) {
  var u = be("Button"), s = be("Portal"), p = ut("focustrap");
  return v(), V(s, {
    appendTo: e.appendTo
  }, {
    default: E(function() {
      return [a.containerVisible ? (v(), C("div", D({
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
      }, e.ptm("mask")), [k(ct, D({
        name: "p-dialog",
        onEnter: i.onEnter,
        onAfterEnter: i.onAfterEnter,
        onBeforeLeave: i.onBeforeLeave,
        onLeave: i.onLeave,
        onAfterLeave: i.onAfterLeave,
        appear: ""
      }, e.ptm("transition")), {
        default: E(function() {
          return [e.visible ? q((v(), C("div", D({
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
            maximizeCallback: function(x) {
              return i.maximize(x);
            },
            initDragCallback: i.initDrag
          }) : (v(), C(P, {
            key: 1
          }, [e.showHeader ? (v(), C("div", D({
            key: 0,
            ref: i.headerContainerRef,
            class: e.cx("header"),
            onMousedown: t[0] || (t[0] = function() {
              return i.initDrag && i.initDrag.apply(i, arguments);
            })
          }, e.ptm("header")), [B(e.$slots, "header", {
            class: z(e.cx("title"))
          }, function() {
            return [e.header ? (v(), C("span", D({
              key: 0,
              id: i.ariaLabelledById,
              class: e.cx("title")
            }, e.ptm("title")), S(e.header), 17, cn)) : $("", !0)];
          }), r("div", D({
            class: e.cx("headerActions")
          }, e.ptm("headerActions")), [e.maximizable ? B(e.$slots, "maximizebutton", {
            key: 0,
            maximized: a.maximized,
            maximizeCallback: function(x) {
              return i.maximize(x);
            }
          }, function() {
            return [k(u, D({
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
              icon: E(function(b) {
                return [B(e.$slots, "maximizeicon", {
                  maximized: a.maximized
                }, function() {
                  return [(v(), V(he(i.maximizeIconComponent), D({
                    class: [b.class, a.maximized ? e.minimizeIcon : e.maximizeIcon]
                  }, e.ptm("pcMaximizeButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "tabindex", "unstyled", "pt"])];
          }) : $("", !0), e.closable ? B(e.$slots, "closebutton", {
            key: 1,
            closeCallback: i.close
          }, function() {
            return [k(u, D({
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
              icon: E(function(b) {
                return [B(e.$slots, "closeicon", {}, function() {
                  return [(v(), V(he(e.closeIcon ? "span" : "TimesIcon"), D({
                    class: [e.closeIcon, b.class]
                  }, e.ptm("pcCloseButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "aria-label", "unstyled", "pt"])];
          }) : $("", !0)], 16)], 16)) : $("", !0), r("div", D({
            ref: i.contentRef,
            class: [e.cx("content"), e.contentClass],
            style: e.contentStyle,
            "data-p": i.dataP
          }, xe(xe({}, e.contentProps), e.ptm("content"))), [B(e.$slots, "default")], 16, pn), e.footer || e.$slots.footer ? (v(), C("div", D({
            key: 1,
            ref: i.footerContainerRef,
            class: e.cx("footer")
          }, e.ptm("footer")), [B(e.$slots, "footer", {}, function() {
            return [O(S(e.footer), 1)];
          })], 16)) : $("", !0)], 64))], 16, un)), [[p, {
            disabled: !e.modal
          }]]) : $("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onBeforeLeave", "onLeave", "onAfterLeave"])], 16, dn)) : $("", !0)];
    }),
    _: 3
  }, 8, ["appendTo"]);
}
ie.render = fn;
function mn(e) {
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
function we(e, t) {
  const n = mn(e);
  if (n === null) return "";
  const o = t?.now ?? Date.now(), a = t?.suffix ?? !0, i = t?.maxUnit ?? "day", u = t?.future ?? !1, s = 6e4, p = 60 * s, b = 24 * p, x = 30 * b, w = 365 * b, y = o - n;
  if (u && y < 0) {
    const c = -y;
    return c < s ? "in <1m" : c < p ? `in ${Math.floor(c / s)}m` : c < b ? `in ${Math.floor(c / p)}h` : `in ${Math.floor(c / b)}d`;
  }
  const f = Math.max(0, y);
  if (f < s) return "just now";
  const g = a ? " ago" : "";
  return f < p ? `${Math.floor(f / s)}m${g}` : f < b ? `${Math.floor(f / p)}h${g}` : i === "year" ? f < x ? `${Math.floor(f / b)}d${g}` : f < w ? `${Math.floor(f / x)}mo${g}` : `${Math.floor(f / w)}y${g}` : `${Math.floor(f / b)}d${g}`;
}
const bn = { class: "kx" }, hn = { class: "kx-bar" }, vn = { class: "kx-count" }, yn = { class: "kx-bar-actions" }, gn = {
  key: 0,
  class: "kx-search"
}, kn = {
  key: 0,
  class: "kx-err"
}, Cn = { class: "kx-body" }, _n = {
  key: 0,
  class: "kx-loading"
}, xn = {
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
}, ao = /* @__PURE__ */ Le({
  __name: "Webhooks",
  setup(e) {
    const t = {
      header: { class: "kx-dialog-header" },
      content: { class: "kx-dialog-content" },
      footer: { class: "kx-dialog-footer" }
    }, n = A([]), o = A(!0), a = A(""), i = A(""), u = A(!1), s = A(null), p = A({ label: "", schemaText: "" }), b = A(""), x = A(!1), w = A(!1), y = K(() => {
      const m = i.value.trim().toLowerCase();
      return m ? n.value.filter((d) => (d.label || d.webhook_id).toLowerCase().includes(m)) : n.value;
    }), f = K(() => ce(p.value.schemaText).schema || (s.value?.schema ?? {}));
    async function g() {
      o.value = !0, a.value = "";
      try {
        n.value = await Ve();
      } catch (m) {
        a.value = G(m, "could not load webhooks");
      } finally {
        o.value = !1;
      }
    }
    function c(m) {
      return "POST /api/public/hooks/" + m;
    }
    function _(m) {
      return m.subscriber_count || 0;
    }
    function T() {
      u.value = !0;
    }
    function R() {
      u.value = !1;
    }
    async function J() {
      u.value = !1, await g();
    }
    function X(m) {
      s.value = m, p.value = { label: m.label || "", schemaText: Te(m.schema || {}) }, b.value = "", w.value = !1;
    }
    function H() {
      s.value = null;
    }
    const re = K({
      get: () => s.value !== null,
      set: (m) => {
        m || H();
      }
    });
    async function Me(m, d) {
      try {
        await navigator.clipboard.writeText(m), M.toast({ severity: "success", summary: "Copied", detail: d });
      } catch {
        M.toast({ severity: "warn", summary: "Copy failed", detail: "Select and copy manually." });
      }
    }
    async function Ie() {
      const m = s.value;
      if (!m) return;
      const d = ce(p.value.schemaText);
      if (d.error) {
        b.value = d.error;
        return;
      }
      x.value = !0, b.value = "";
      try {
        await Pe(m.webhook_id, { label: p.value.label.trim(), schema: d.schema }), M.toast({ severity: "success", summary: "Saved", detail: p.value.label.trim() || m.webhook_id }), H(), await g();
      } catch (l) {
        b.value = G(l, "save failed");
      } finally {
        x.value = !1;
      }
    }
    async function le(m) {
      if (await M.confirm({
        message: `Revoke “${m.label || m.webhook_id}”? The secret stops working and subscribed automations receive no further events. This can't be undone.`,
        header: "Revoke webhook",
        icon: "tabler:ban",
        acceptLabel: "Revoke",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      }))
        try {
          await Re(m.webhook_id), M.toast({ severity: "success", summary: "Revoked", detail: m.label || m.webhook_id }), s.value?.webhook_id === m.webhook_id && H(), await g();
        } catch (l) {
          a.value = G(l, "revoke failed"), M.toast({ severity: "error", summary: "Revoke failed", detail: a.value });
        }
    }
    async function de(m) {
      if (_(m) > 0) {
        M.toast({
          severity: "warn",
          summary: "In use",
          detail: `Used by ${_(m)} automation${_(m) === 1 ? "" : "s"}. Remove those first.`
        });
        return;
      }
      if (await M.confirm({
        message: `Remove “${m.label || m.webhook_id}”? This deletes the webhook and its endpoint. This can't be undone.`,
        header: "Remove webhook",
        icon: "tabler:trash",
        acceptLabel: "Remove",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      }))
        try {
          await Fe(m.webhook_id), Ae(m.webhook_id), M.toast({ severity: "success", summary: "Deletion accepted", detail: m.label || m.webhook_id }), s.value?.webhook_id === m.webhook_id && H(), await g();
        } catch (l) {
          a.value = G(l, "delete failed"), M.toast({ severity: "error", summary: "Remove failed", detail: a.value });
        }
    }
    Oe(g);
    const { acceptDeletion: Ae } = Et(n, (m) => m.webhook_id, void 0, g);
    return (m, d) => (v(), C("div", bn, [
      r("div", hn, [
        r("span", vn, S(n.value.length) + " webhook" + S(n.value.length !== 1 ? "s" : ""), 1),
        r("div", yn, [
          n.value.length ? (v(), C("div", gn, [
            k(h(L), {
              icon: "tabler:search",
              class: "kx-search-ico",
              "aria-hidden": "true"
            }),
            q(r("input", {
              "onUpdate:modelValue": d[0] || (d[0] = (l) => i.value = l),
              class: "kx-search-input",
              type: "text",
              placeholder: "Search webhooks…",
              "aria-label": "Search webhooks"
            }, null, 512), [
              [Q, i.value]
            ])
          ])) : $("", !0),
          k(h(I), {
            type: "button",
            label: "New webhook",
            onClick: T
          }, {
            icon: E(({ class: l }) => [
              k(h(L), {
                icon: "tabler:plus",
                class: z(l),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ])
      ]),
      a.value ? (v(), C("div", kn, S(a.value), 1)) : $("", !0),
      r("div", Cn, [
        o.value && !n.value.length ? (v(), C("div", _n, [
          k(h(L), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          d[10] || (d[10] = O(" Loading webhooks… ", -1))
        ])) : n.value.length ? y.value.length ? (v(), C("div", zn, [
          (v(!0), C(P, null, pt(y.value, (l) => (v(), C("div", {
            key: l.webhook_id,
            class: z(["kx-card", l.status === "revoked" && "is-revoked"]),
            tabindex: "0",
            role: "button",
            "aria-label": `Open ${l.label || "webhook"}`,
            onClick: (j) => !l.deleting_at && X(l),
            onKeydown: [
              ve((j) => !l.deleting_at && X(l), ["enter"]),
              ve(W((j) => !l.deleting_at && X(l), ["prevent"]), ["space"])
            ]
          }, [
            k(St, {
              state: l,
              onRetry: (j) => de(l)
            }, null, 8, ["state", "onRetry"]),
            r("div", Mn, [
              r("span", In, [
                k(h(L), {
                  icon: "tabler:webhook",
                  "aria-hidden": "true"
                })
              ]),
              r("div", An, [
                r("div", {
                  class: "kx-card-name",
                  title: l.label || "Webhook"
                }, S(l.label || "Webhook"), 9, On),
                r("div", Bn, [
                  r("span", {
                    class: z(["kx-chip kx-tag-sm", l.status === "active" ? "is-active" : "is-revoked"])
                  }, S(h(pe)(l.status)), 3),
                  _(l) > 0 ? (v(), C("span", {
                    key: 0,
                    class: "kx-chip kx-tag-sm is-count",
                    title: `Used by ${_(l)} automation(s)`
                  }, [
                    k(h(L), {
                      icon: "tabler:plug-connected",
                      "aria-hidden": "true"
                    }),
                    O(" " + S(_(l)) + " automation" + S(_(l) === 1 ? "" : "s"), 1)
                  ], 8, Tn)) : $("", !0)
                ])
              ]),
              r("div", {
                class: "kx-card-actions",
                onClick: d[2] || (d[2] = W(() => {
                }, ["stop"]))
              }, [
                k(h(I), {
                  type: "button",
                  severity: "secondary",
                  outlined: "",
                  size: "small",
                  title: "Open",
                  "aria-label": `Open ${l.label || "webhook"}`,
                  onClick: (j) => !l.deleting_at && X(l),
                  disabled: !!l.deleting_at
                }, {
                  icon: E(({ class: j }) => [
                    k(h(L), {
                      icon: "tabler:pencil",
                      class: z(j),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick", "disabled"]),
                l.status === "active" ? (v(), V(h(I), {
                  key: 0,
                  type: "button",
                  severity: "danger",
                  outlined: "",
                  size: "small",
                  title: "Revoke",
                  "aria-label": `Revoke ${l.label || "webhook"}`,
                  onClick: (j) => le(l),
                  disabled: !!l.deleting_at
                }, {
                  icon: E(({ class: j }) => [
                    k(h(L), {
                      icon: "tabler:ban",
                      class: z(j),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick", "disabled"])) : $("", !0),
                k(h(I), {
                  type: "button",
                  severity: "danger",
                  outlined: "",
                  size: "small",
                  title: "Remove",
                  "aria-label": `Remove ${l.label || "webhook"}`,
                  disabled: !!l.deleting_at || _(l) > 0,
                  onClick: (j) => de(l)
                }, {
                  icon: E(({ class: j }) => [
                    k(h(L), {
                      icon: "tabler:trash",
                      class: z(j),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "disabled", "onClick"])
              ])
            ]),
            r("div", {
              class: "kx-card-desc",
              title: c(l.webhook_id)
            }, S(c(l.webhook_id)), 9, Pn)
          ], 42, jn))), 128))
        ])) : (v(), C("div", $n, [
          r("div", Ln, [
            k(h(L), {
              icon: "tabler:mood-empty",
              "aria-hidden": "true"
            })
          ]),
          d[13] || (d[13] = r("div", { class: "kx-empty-title" }, "No matches", -1)),
          r("div", Dn, "Nothing matches “" + S(i.value) + "”. Try a different term or clear the search.", 1),
          r("div", En, [
            k(h(I), {
              type: "button",
              severity: "secondary",
              outlined: "",
              label: "Clear search",
              onClick: d[1] || (d[1] = (l) => i.value = "")
            }, {
              icon: E(({ class: l }) => [
                k(h(L), {
                  icon: "tabler:x",
                  class: z(l),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ])) : (v(), C("div", xn, [
          r("div", wn, [
            k(h(L), {
              icon: "tabler:webhook",
              "aria-hidden": "true"
            })
          ]),
          d[11] || (d[11] = r("div", { class: "kx-empty-title" }, "No webhooks yet", -1)),
          d[12] || (d[12] = r("div", { class: "kx-empty-sub" }, "A webhook gives an external service a secret URL to POST to. Each request becomes a trigger event your automations can act on.", -1)),
          r("div", Sn, [
            k(h(I), {
              type: "button",
              label: "New webhook",
              onClick: T
            }, {
              icon: E(({ class: l }) => [
                k(h(L), {
                  icon: "tabler:plus",
                  class: z(l),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ]))
      ]),
      k(h(ie), {
        visible: u.value,
        "onUpdate:visible": d[3] || (d[3] = (l) => u.value = l),
        modal: "",
        "dismissable-mask": !0,
        class: "kx-dialog",
        pt: t,
        "aria-label": "New webhook"
      }, {
        header: E(() => [
          r("span", Rn, [
            k(h(L), {
              icon: "tabler:webhook",
              "aria-hidden": "true"
            })
          ]),
          d[14] || (d[14] = r("span", { class: "kx-modal-head-text" }, [
            r("span", { class: "kx-modal-head-title" }, "New webhook"),
            r("span", { class: "kx-modal-head-sub" }, "Name it and set the payload it accepts — the secret is shown once.")
          ], -1))
        ]),
        default: E(() => [
          r("div", Fn, [
            k(at, {
              onCreated: J,
              onClose: R
            })
          ])
        ]),
        _: 1
      }, 8, ["visible"]),
      k(h(ie), {
        visible: re.value,
        "onUpdate:visible": d[9] || (d[9] = (l) => re.value = l),
        modal: "",
        class: "kx-dialog",
        pt: t,
        "aria-label": "Webhook detail"
      }, ft({
        default: E(() => [
          s.value ? (v(), C("div", Kn, [
            r("div", Wn, [
              d[15] || (d[15] = r("span", { class: "kx-field-lbl" }, [
                O("Endpoint URL "),
                r("span", { class: "kx-field-hint-inline" }, "— hand this to the sender")
              ], -1)),
              r("div", Zn, [
                r("code", null, S(h(fe)(s.value.webhook_id)), 1),
                r("button", {
                  type: "button",
                  class: "wh-copy",
                  title: "Copy URL",
                  "aria-label": "Copy URL",
                  onClick: d[4] || (d[4] = (l) => Me(h(fe)(s.value.webhook_id), "endpoint URL"))
                }, [
                  k(h(L), {
                    icon: "tabler:copy",
                    "aria-hidden": "true"
                  })
                ])
              ])
            ]),
            r("div", Yn, [
              d[17] || (d[17] = r("span", { class: "kx-field-lbl" }, "Secret", -1)),
              r("div", Xn, [
                r("code", null, [
                  O(S(s.value.secret_prefix || "Not available"), 1),
                  s.value.secret_prefix ? (v(), C("span", Gn, "…")) : $("", !0)
                ])
              ]),
              r("p", qn, [
                k(h(L), {
                  icon: "tabler:info-circle",
                  "aria-hidden": "true"
                }),
                d[16] || (d[16] = r("span", null, "The full secret is shown only when a webhook is created. To rotate it, revoke this webhook and create a new one.", -1))
              ])
            ]),
            r("dl", Jn, [
              s.value.created_at ? (v(), C(P, { key: 0 }, [
                d[18] || (d[18] = r("dt", null, "Created", -1)),
                r("dd", null, S(h(we)(s.value.created_at)), 1)
              ], 64)) : $("", !0),
              s.value.last_used_at ? (v(), C(P, { key: 1 }, [
                d[19] || (d[19] = r("dt", null, "Last received", -1)),
                r("dd", null, S(h(we)(s.value.last_used_at)), 1)
              ], 64)) : $("", !0),
              _(s.value) > 0 ? (v(), C(P, { key: 2 }, [
                d[20] || (d[20] = r("dt", null, "Used by", -1)),
                r("dd", null, S(_(s.value)) + " automation" + S(_(s.value) === 1 ? "" : "s"), 1)
              ], 64)) : $("", !0)
            ]),
            r("label", Qn, [
              d[21] || (d[21] = r("span", { class: "kx-field-lbl" }, [
                O("Name "),
                r("span", { class: "kx-field-hint-inline" }, "— shown in automation trigger pickers")
              ], -1)),
              q(r("input", {
                "onUpdate:modelValue": d[5] || (d[5] = (l) => p.value.label = l),
                class: "kx-input",
                type: "text",
                placeholder: "Customer events",
                disabled: s.value.status === "revoked",
                "data-test": "wh-name"
              }, null, 8, eo), [
                [Q, p.value.label]
              ])
            ]),
            r("div", to, [
              d[23] || (d[23] = r("span", { class: "kx-field-lbl" }, [
                O("Payload schema "),
                r("span", { class: "kx-field-hint-inline" }, "— the fields each inbound request must carry")
              ], -1)),
              k(Be, { schema: f.value }, null, 8, ["schema"]),
              r("div", no, [
                r("button", {
                  type: "button",
                  class: z(["wh-toggle", w.value && "is-open"]),
                  onClick: d[6] || (d[6] = (l) => w.value = !w.value)
                }, [
                  k(h(L), {
                    icon: "tabler:chevron-right",
                    "aria-hidden": "true"
                  }),
                  d[22] || (d[22] = O(" Edit as JSON Schema ", -1))
                ], 2),
                w.value ? q((v(), C("textarea", {
                  key: 0,
                  "onUpdate:modelValue": d[7] || (d[7] = (l) => p.value.schemaText = l),
                  class: "kx-input kx-textarea",
                  spellcheck: "false",
                  disabled: s.value.status === "revoked",
                  "data-test": "wh-schema"
                }, null, 8, oo)), [
                  [Q, p.value.schemaText]
                ]) : $("", !0)
              ])
            ]),
            b.value ? (v(), C("div", io, S(b.value), 1)) : $("", !0)
          ])) : $("", !0)
        ]),
        _: 2
      }, [
        s.value ? {
          name: "header",
          fn: E(() => [
            r("span", Vn, [
              k(h(L), {
                icon: "tabler:webhook",
                "aria-hidden": "true"
              })
            ]),
            r("span", Hn, [
              r("span", Un, S(s.value.label || "Webhook"), 1),
              r("span", Nn, S(c(s.value.webhook_id)), 1)
            ]),
            r("span", {
              class: z(["kx-chip kx-tag-sm", s.value.status === "active" ? "is-active" : "is-revoked"])
            }, S(h(pe)(s.value.status)), 3)
          ]),
          key: "0"
        } : void 0,
        s.value ? {
          name: "footer",
          fn: E(() => [
            s.value.status === "active" ? (v(), V(h(I), {
              key: 0,
              type: "button",
              severity: "danger",
              size: "small",
              class: "kx-foot-spacer",
              label: "Revoke",
              onClick: d[8] || (d[8] = (l) => le(s.value))
            }, {
              icon: E(({ class: l }) => [
                k(h(L), {
                  icon: "tabler:ban",
                  class: z(l),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })) : $("", !0),
            k(h(I), {
              type: "button",
              label: "Close",
              severity: "secondary",
              outlined: "",
              onClick: H
            }),
            s.value.status === "active" ? (v(), V(h(I), {
              key: 1,
              type: "button",
              label: "Save changes",
              loading: x.value,
              disabled: x.value,
              "data-test": "wh-save",
              onClick: Ie
            }, {
              icon: E(({ class: l }) => [
                k(h(L), {
                  icon: "tabler:device-floppy",
                  class: z(l),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }, 8, ["loading", "disabled"])) : $("", !0)
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
ht(import.meta.url, so);
//# sourceMappingURL=index.js.map
