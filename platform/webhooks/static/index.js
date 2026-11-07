import { a as ue, p as ce, b as Be, w as fe, i as pe, _ as Te, c as Pe, d as Re, e as G, r as Fe, g as Ve, h as He, W as Ue, s as Ne } from "./styles-DTSarnYW.js";
import { B as ae, s as Se, a as A, b as se, L as Ke, c as F, v as U, d as We, U as Ze, I as me, e as Ye, f as Xe, r as $e, g as Ge, h as qe, R as Je, i as Qe, j as et, C as tt, k as nt, S as ot, l as it, W as at, _ as st, p as rt, P as lt } from "./package-BFVnrWK1.js";
import { openBlock as v, createElementBlock as k, mergeProps as D, createElementVNode as r, defineComponent as Le, computed as K, withModifiers as W, Fragment as R, createTextVNode as B, toDisplayString as w, createCommentVNode as S, createVNode as g, unref as h, watch as dt, onBeforeUnmount as ut, resolveComponent as be, resolveDirective as ct, createBlock as V, withCtx as E, Transition as ft, withDirectives as q, renderSlot as T, normalizeClass as j, resolveDynamicComponent as he, ref as O, vModelText as Q, renderList as pt, withKeys as ve, createSlots as mt } from "vue";
import { on as bt, api as ht, host as I, define as vt } from "@wippy-fe/proxy";
import { Icon as L } from "@iconify/vue";
function yt() {
  let e = [], t = (u, s, p = 999) => {
    let b = a(u, s, p), _ = b.value + (b.key === u ? 0 : p) + 1;
    return e.push({ key: u, value: _ }), _;
  }, n = (u) => {
    e = e.filter((s) => s.value !== u);
  }, o = (u, s) => a(u).value, a = (u, s, p = 0) => [...e].reverse().find((b) => !0) || { key: u, value: p }, i = (u) => u && parseInt(u.style.zIndex, 10) || 0;
  return { get: i, set: (u, s, p) => {
    s && (s.style.zIndex = String(t(u, !0, p)));
  }, clear: (u) => {
    u && (n(i(u)), u.style.zIndex = "");
  }, getCurrent: (u) => o(u) };
}
var ee = yt(), gt = `
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
`, kt = {
  root: "p-progressspinner",
  spin: "p-progressspinner-spin",
  circle: "p-progressspinner-circle"
}, Ct = ae.extend({
  name: "progressspinner",
  style: gt,
  classes: kt
}), _t = {
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
  style: Ct,
  provide: function() {
    return {
      $pcProgressSpinner: this,
      $parentInstance: this
    };
  }
}, De = {
  name: "ProgressSpinner",
  extends: _t,
  inheritAttrs: !1,
  computed: {
    svgStyle: function() {
      return {
        "animation-duration": this.animationDuration
      };
    }
  }
}, xt = ["fill", "stroke-width"];
function wt(e, t, n, o, a, i) {
  return v(), k("div", D({
    class: e.cx("root"),
    role: "progressbar"
  }, e.ptmi("root")), [(v(), k("svg", D({
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
  }, e.ptm("circle")), null, 16, xt)], 16))], 16);
}
De.render = wt;
const St = { key: 0 }, $t = /* @__PURE__ */ Le({
  __name: "ComponentDeletion",
  props: {
    state: {}
  },
  emits: ["retry"],
  setup(e) {
    const t = e, n = K(() => t.state.deletion_job === null || ["dead", "cancelled"].includes(t.state.deletion_job?.status || ""));
    return (o, a) => e.state.deleting_at ? (v(), k("span", {
      key: 0,
      class: "component-deletion",
      role: "status",
      onClick: a[1] || (a[1] = W(() => {
      }, ["stop"])),
      onKeydown: a[2] || (a[2] = W(() => {
      }, ["stop"]))
    }, [
      n.value ? (v(), k(R, { key: 0 }, [
        r("span", null, [
          a[3] || (a[3] = B("Deletion failed", -1)),
          e.state.deletion_job?.last_error ? (v(), k("span", St, ": " + w(e.state.deletion_job.last_error), 1)) : S("", !0)
        ]),
        g(h(A), {
          label: "Retry deletion",
          severity: "secondary",
          size: "small",
          outlined: "",
          onClick: a[0] || (a[0] = W((i) => o.$emit("retry"), ["stop"]))
        })
      ], 64)) : (v(), k(R, { key: 1 }, [
        g(h(De), {
          class: "component-deletion-spinner",
          "aria-label": "Deletion in progress"
        }),
        a[4] || (a[4] = r("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : S("", !0);
  }
});
function N(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function Lt(e, t) {
  return e;
}
function Dt(e, t, n) {
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
      meta: Lt(N(i.meta) ? i.meta : {}),
      deleted: Array.isArray(i.deleted) ? i.deleted.map(String) : []
    };
  }
  return null;
}
function Et(e, t) {
  const n = Dt(e, t);
  return n && n.event !== "component.meta.changed" ? n : null;
}
function zt(e, t, n, o) {
  let a = !0;
  const i = /* @__PURE__ */ new Set(), u = /* @__PURE__ */ new Map();
  function s(y, m) {
    const C = e.value.find((J) => t(J) === y), c = u.get(y), $ = m?.job_id || c?.deletion_job_id || C?.deletion_job_id, z = c ? c.deletion_job_id : C?.deleting_at ? C.deletion_job_id : void 0;
    if ((c || C?.deleting_at) && $ === z) return;
    const P = {
      deleting_at: c?.deleting_at || C?.deleting_at || (/* @__PURE__ */ new Date()).toISOString(),
      deletion_job_id: $
    };
    u.set(y, P), C && (Object.assign(C, P), C.deletion_job = void 0);
  }
  async function p(y) {
    const m = t(y), C = u.get(m), c = () => a && e.value.includes(y) && u.get(m) === C;
    try {
      const { data: $ } = await ht.get(`/api/v1/components/${encodeURIComponent(m)}`);
      if (!$?.success) throw new Error(ue($, "Could not read deletion progress"));
      c() && (y.deleting_at = C?.deleting_at || $.deleting_at, y.deletion_job_id = $.deletion_job_id, C && (C.deletion_job_id = y.deletion_job_id), y.deletion_job = $.deletion_job ?? null);
    } catch ($) {
      c() && I.handleError("other", { message: ue($, "Could not read deletion progress") });
    }
  }
  let b = [];
  const _ = dt(() => e.value, (y, m = []) => {
    const C = y.filter((c) => !i.has(t(c)));
    for (const c of m)
      i.has(t(c)) || C.some(($) => t($) === t(c)) || c.deleting_at && o?.(t(c));
    if (C.length !== y.length) {
      e.value = C;
      return;
    }
    for (const c of y) {
      const $ = u.get(t(c));
      $ && (c.deletion_job_id !== $.deletion_job_id && (c.deletion_job = void 0), Object.assign(c, $));
      const z = m.find((P) => t(P) === t(c));
      c.deletion_job === void 0 && z?.deletion_job_id === c.deletion_job_id && (c.deletion_job = z?.deletion_job), c.deleting_at && !b.includes(c) && p(c);
    }
    b = y;
  }, { immediate: !0 }), x = bt("@message", (y) => {
    const m = Et(y);
    if (!m) return;
    const C = e.value.find((c) => t(c) === m.component_id);
    m.event === "component.deleted" ? (C && !i.has(m.component_id) && o?.(m.component_id), i.add(m.component_id), u.delete(m.component_id), e.value = e.value.filter((c) => t(c) !== m.component_id)) : C && s(m.component_id, { job_id: m.deletion_job_id });
  });
  return ut(() => {
    a = !1, _(), typeof x == "function" && x();
  }), { acceptDeletion: s };
}
var Ee = {
  name: "TimesIcon",
  extends: se
};
function jt(e) {
  return Ot(e) || At(e) || It(e) || Mt();
}
function Mt() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function It(e, t) {
  if (e) {
    if (typeof e == "string") return te(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? te(e, t) : void 0;
  }
}
function At(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Ot(e) {
  if (Array.isArray(e)) return te(e);
}
function te(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function Bt(e, t, n, o, a, i) {
  return v(), k("svg", D({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), jt(t[0] || (t[0] = [r("path", {
    d: "M8.01186 7.00933L12.27 2.75116C12.341 2.68501 12.398 2.60524 12.4375 2.51661C12.4769 2.42798 12.4982 2.3323 12.4999 2.23529C12.5016 2.13827 12.4838 2.0419 12.4474 1.95194C12.4111 1.86197 12.357 1.78024 12.2884 1.71163C12.2198 1.64302 12.138 1.58893 12.0481 1.55259C11.9581 1.51625 11.8617 1.4984 11.7647 1.50011C11.6677 1.50182 11.572 1.52306 11.4834 1.56255C11.3948 1.60204 11.315 1.65898 11.2488 1.72997L6.99067 5.98814L2.7325 1.72997C2.59553 1.60234 2.41437 1.53286 2.22718 1.53616C2.03999 1.53946 1.8614 1.61529 1.72901 1.74767C1.59663 1.88006 1.5208 2.05865 1.5175 2.24584C1.5142 2.43303 1.58368 2.61419 1.71131 2.75116L5.96948 7.00933L1.71131 11.2675C1.576 11.403 1.5 11.5866 1.5 11.7781C1.5 11.9696 1.576 12.1532 1.71131 12.2887C1.84679 12.424 2.03043 12.5 2.2219 12.5C2.41338 12.5 2.59702 12.424 2.7325 12.2887L6.99067 8.03052L11.2488 12.2887C11.3843 12.424 11.568 12.5 11.7594 12.5C11.9509 12.5 12.1346 12.424 12.27 12.2887C12.4053 12.1532 12.4813 11.9696 12.4813 11.7781C12.4813 11.5866 12.4053 11.403 12.27 11.2675L8.01186 7.00933Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Ee.render = Bt;
var ze = {
  name: "WindowMaximizeIcon",
  extends: se
};
function Tt(e) {
  return Vt(e) || Ft(e) || Rt(e) || Pt();
}
function Pt() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Rt(e, t) {
  if (e) {
    if (typeof e == "string") return ne(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? ne(e, t) : void 0;
  }
}
function Ft(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Vt(e) {
  if (Array.isArray(e)) return ne(e);
}
function ne(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function Ht(e, t, n, o, a, i) {
  return v(), k("svg", D({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Tt(t[0] || (t[0] = [r("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14ZM9.77805 7.42192C9.89013 7.534 10.0415 7.59788 10.2 7.59995C10.3585 7.59788 10.5099 7.534 10.622 7.42192C10.7341 7.30985 10.798 7.15844 10.8 6.99995V3.94242C10.8066 3.90505 10.8096 3.86689 10.8089 3.82843C10.8079 3.77159 10.7988 3.7157 10.7824 3.6623C10.756 3.55552 10.701 3.45698 10.622 3.37798C10.5099 3.2659 10.3585 3.20202 10.2 3.19995H7.00002C6.84089 3.19995 6.68828 3.26317 6.57576 3.37569C6.46324 3.48821 6.40002 3.64082 6.40002 3.79995C6.40002 3.95908 6.46324 4.11169 6.57576 4.22422C6.68828 4.33674 6.84089 4.39995 7.00002 4.39995H8.80006L6.19997 7.00005C6.10158 7.11005 6.04718 7.25246 6.04718 7.40005C6.04718 7.54763 6.10158 7.69004 6.19997 7.80005C6.30202 7.91645 6.44561 7.98824 6.59997 8.00005C6.75432 7.98824 6.89791 7.91645 6.99997 7.80005L9.60002 5.26841V6.99995C9.6021 7.15844 9.66598 7.30985 9.77805 7.42192ZM1.4 14H3.8C4.17066 13.9979 4.52553 13.8498 4.78763 13.5877C5.04973 13.3256 5.1979 12.9707 5.2 12.6V10.2C5.1979 9.82939 5.04973 9.47452 4.78763 9.21242C4.52553 8.95032 4.17066 8.80215 3.8 8.80005H1.4C1.02934 8.80215 0.674468 8.95032 0.412371 9.21242C0.150274 9.47452 0.00210008 9.82939 0 10.2V12.6C0.00210008 12.9707 0.150274 13.3256 0.412371 13.5877C0.674468 13.8498 1.02934 13.9979 1.4 14ZM1.25858 10.0586C1.29609 10.0211 1.34696 10 1.4 10H3.8C3.85304 10 3.90391 10.0211 3.94142 10.0586C3.97893 10.0961 4 10.147 4 10.2V12.6C4 12.6531 3.97893 12.704 3.94142 12.7415C3.90391 12.779 3.85304 12.8 3.8 12.8H1.4C1.34696 12.8 1.29609 12.779 1.25858 12.7415C1.22107 12.704 1.2 12.6531 1.2 12.6V10.2C1.2 10.147 1.22107 10.0961 1.25858 10.0586Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
ze.render = Ht;
var je = {
  name: "WindowMinimizeIcon",
  extends: se
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
    if (typeof e == "string") return oe(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? oe(e, t) : void 0;
  }
}
function Wt(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Zt(e) {
  if (Array.isArray(e)) return oe(e);
}
function oe(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function Yt(e, t, n, o, a, i) {
  return v(), k("svg", D({
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
je.render = Yt;
var Xt = ae.extend({
  name: "focustrap-directive"
}), Gt = We.extend({
  style: Xt
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
      qt(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : ye(Object(n)).forEach(function(o) {
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
  return Z(t) == "symbol" ? t : t + "";
}
function Qt(e, t) {
  if (Z(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (Z(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var en = Gt.extend("focustrap", {
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
            var b = function(x) {
              var y = me(x) ? me(x, o.getComputedSelector(t.$_pfocustrap_focusableselector)) ? x : U(t, o.getComputedSelector(t.$_pfocustrap_focusableselector)) : U(x);
              return Ye(y) ? y : x.nextSibling && b(x.nextSibling);
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
      var o = n.value || {}, a = o.autoFocusSelector, i = a === void 0 ? "" : a, u = o.firstFocusableSelector, s = u === void 0 ? "" : u, p = o.autoFocus, b = p === void 0 ? !1 : p, _ = U(t, "[autofocus]".concat(this.getComputedSelector(i)));
      b && !_ && (_ = U(t, this.getComputedSelector(s))), F(_);
    },
    onFirstHiddenElementFocus: function(t) {
      var n, o = t.currentTarget, a = t.relatedTarget, i = a === o.$_pfocustrap_lasthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(a)) ? U(o.parentElement, this.getComputedSelector(o.$_pfocustrap_focusableselector)) : o.$_pfocustrap_lasthiddenfocusableelement;
      F(i);
    },
    onLastHiddenElementFocus: function(t) {
      var n, o = t.currentTarget, a = t.relatedTarget, i = a === o.$_pfocustrap_firsthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(a)) ? Ke(o.parentElement, this.getComputedSelector(o.$_pfocustrap_focusableselector)) : o.$_pfocustrap_firsthiddenfocusableelement;
      F(i);
    },
    createHiddenFocusableElements: function(t, n) {
      var o = this, a = n.value || {}, i = a.tabIndex, u = i === void 0 ? 0 : i, s = a.firstFocusableSelector, p = s === void 0 ? "" : s, b = a.lastFocusableSelector, _ = b === void 0 ? "" : b, x = function(c) {
        return Ze("span", {
          class: "p-hidden-accessible p-hidden-focusable",
          tabIndex: u,
          role: "presentation",
          "aria-hidden": !0,
          "data-p-hidden-accessible": !0,
          "data-p-hidden-focusable": !0,
          onFocus: c?.bind(o)
        });
      }, y = x(this.onFirstHiddenElementFocus), m = x(this.onLastHiddenElementFocus);
      y.$_pfocustrap_lasthiddenfocusableelement = m, y.$_pfocustrap_focusableselector = p, y.setAttribute("data-pc-section", "firstfocusableelement"), m.$_pfocustrap_firsthiddenfocusableelement = y, m.$_pfocustrap_focusableselector = _, m.setAttribute("data-pc-section", "lastfocusableelement"), t.prepend(y), t.append(m);
    }
  }
});
function ke() {
  Ge({
    variableName: $e("scrollbar.width").name
  });
}
function Ce() {
  Xe({
    variableName: $e("scrollbar.width").name
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
}, an = ae.extend({
  name: "dialog",
  style: tn,
  classes: on,
  inlineStyles: nn
}), sn = {
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
  style: an,
  provide: function() {
    return {
      $pcDialog: this,
      $parentInstance: this
    };
  }
}, ie = {
  name: "Dialog",
  extends: sn,
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
      this.modal && !this.isUnstyled && at(this.mask, "p-overlay-mask-leave-active"), this.dragging && this.documentDragEndListener && this.documentDragEndListener();
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
        this.styleElement = document.createElement("style"), this.styleElement.type = "text/css", it(this.styleElement, "nonce", (t = this.$primevue) === null || t === void 0 || (t = t.config) === null || t === void 0 || (t = t.csp) === null || t === void 0 ? void 0 : t.nonce), document.head.appendChild(this.styleElement);
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
      t.target.closest("div").getAttribute("data-pc-section") !== "headeractions" && this.draggable && (this.dragging = !0, this.lastPageX = t.pageX, this.lastPageY = t.pageY, this.container.style.margin = "0", document.body.setAttribute("data-p-unselectable-text", "true"), !this.isUnstyled && ot(document.body, {
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
          var o = et(t.container), a = tt(t.container), i = n.pageX - t.lastPageX, u = n.pageY - t.lastPageY, s = t.container.getBoundingClientRect(), p = s.left + i, b = s.top + u, _ = nt(), x = getComputedStyle(t.container), y = parseFloat(x.marginLeft), m = parseFloat(x.marginTop);
          t.container.style.position = "fixed", t.keepInViewport ? (p >= t.minX && p + o < _.width && (t.lastPageX = n.pageX, t.container.style.left = p - y + "px"), b >= t.minY && b + a < _.height && (t.lastPageY = n.pageY, t.container.style.top = b - m + "px")) : (t.lastPageX = n.pageX, t.container.style.left = p - y + "px", t.lastPageY = n.pageY, t.container.style.top = b - m + "px");
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
      return Qe({
        maximized: this.maximized,
        modal: this.modal
      });
    }
  },
  directives: {
    ripple: Je,
    focustrap: en
  },
  components: {
    Button: A,
    Portal: qe,
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
      rn(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : _e(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function rn(e, t, n) {
  return (t = ln(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ln(e) {
  var t = dn(e, "string");
  return Y(t) == "symbol" ? t : t + "";
}
function dn(e, t) {
  if (Y(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (Y(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var un = ["data-p"], cn = ["aria-labelledby", "aria-modal", "data-p"], fn = ["id"], pn = ["data-p"];
function mn(e, t, n, o, a, i) {
  var u = be("Button"), s = be("Portal"), p = ct("focustrap");
  return v(), V(s, {
    appendTo: e.appendTo
  }, {
    default: E(function() {
      return [a.containerVisible ? (v(), k("div", D({
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
      }, e.ptm("mask")), [g(ft, D({
        name: "p-dialog",
        onEnter: i.onEnter,
        onAfterEnter: i.onAfterEnter,
        onBeforeLeave: i.onBeforeLeave,
        onLeave: i.onLeave,
        onAfterLeave: i.onAfterLeave,
        appear: ""
      }, e.ptm("transition")), {
        default: E(function() {
          return [e.visible ? q((v(), k("div", D({
            key: 0,
            ref: i.containerRef,
            class: e.cx("root"),
            style: e.sx("root"),
            role: "dialog",
            "aria-labelledby": i.ariaLabelledById,
            "aria-modal": e.modal,
            "data-p": i.dataP
          }, e.ptmi("root")), [e.$slots.container ? T(e.$slots, "container", {
            key: 0,
            closeCallback: i.close,
            maximizeCallback: function(_) {
              return i.maximize(_);
            },
            initDragCallback: i.initDrag
          }) : (v(), k(R, {
            key: 1
          }, [e.showHeader ? (v(), k("div", D({
            key: 0,
            ref: i.headerContainerRef,
            class: e.cx("header"),
            onMousedown: t[0] || (t[0] = function() {
              return i.initDrag && i.initDrag.apply(i, arguments);
            })
          }, e.ptm("header")), [T(e.$slots, "header", {
            class: j(e.cx("title"))
          }, function() {
            return [e.header ? (v(), k("span", D({
              key: 0,
              id: i.ariaLabelledById,
              class: e.cx("title")
            }, e.ptm("title")), w(e.header), 17, fn)) : S("", !0)];
          }), r("div", D({
            class: e.cx("headerActions")
          }, e.ptm("headerActions")), [e.maximizable ? T(e.$slots, "maximizebutton", {
            key: 0,
            maximized: a.maximized,
            maximizeCallback: function(_) {
              return i.maximize(_);
            }
          }, function() {
            return [g(u, D({
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
                return [T(e.$slots, "maximizeicon", {
                  maximized: a.maximized
                }, function() {
                  return [(v(), V(he(i.maximizeIconComponent), D({
                    class: [b.class, a.maximized ? e.minimizeIcon : e.maximizeIcon]
                  }, e.ptm("pcMaximizeButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "tabindex", "unstyled", "pt"])];
          }) : S("", !0), e.closable ? T(e.$slots, "closebutton", {
            key: 1,
            closeCallback: i.close
          }, function() {
            return [g(u, D({
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
                return [T(e.$slots, "closeicon", {}, function() {
                  return [(v(), V(he(e.closeIcon ? "span" : "TimesIcon"), D({
                    class: [e.closeIcon, b.class]
                  }, e.ptm("pcCloseButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "aria-label", "unstyled", "pt"])];
          }) : S("", !0)], 16)], 16)) : S("", !0), r("div", D({
            ref: i.contentRef,
            class: [e.cx("content"), e.contentClass],
            style: e.contentStyle,
            "data-p": i.dataP
          }, xe(xe({}, e.contentProps), e.ptm("content"))), [T(e.$slots, "default")], 16, pn), e.footer || e.$slots.footer ? (v(), k("div", D({
            key: 1,
            ref: i.footerContainerRef,
            class: e.cx("footer")
          }, e.ptm("footer")), [T(e.$slots, "footer", {}, function() {
            return [B(w(e.footer), 1)];
          })], 16)) : S("", !0)], 64))], 16, cn)), [[p, {
            disabled: !e.modal
          }]]) : S("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onBeforeLeave", "onLeave", "onAfterLeave"])], 16, un)) : S("", !0)];
    }),
    _: 3
  }, 8, ["appendTo"]);
}
ie.render = mn;
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
function we(e, t) {
  const n = bn(e);
  if (n === null) return "";
  const o = t?.now ?? Date.now(), a = t?.suffix ?? !0, i = t?.maxUnit ?? "day", u = t?.future ?? !1, s = 6e4, p = 60 * s, b = 24 * p, _ = 30 * b, x = 365 * b, y = o - n;
  if (u && y < 0) {
    const c = -y;
    return c < s ? "in <1m" : c < p ? `in ${Math.floor(c / s)}m` : c < b ? `in ${Math.floor(c / p)}h` : `in ${Math.floor(c / b)}d`;
  }
  const m = Math.max(0, y);
  if (m < s) return "just now";
  const C = a ? " ago" : "";
  return m < p ? `${Math.floor(m / s)}m${C}` : m < b ? `${Math.floor(m / p)}h${C}` : i === "year" ? m < _ ? `${Math.floor(m / b)}d${C}` : m < x ? `${Math.floor(m / _)}mo${C}` : `${Math.floor(m / x)}y${C}` : `${Math.floor(m / b)}d${C}`;
}
function hn() {
  let e = 0;
  return () => {
    const t = ++e;
    return () => t === e;
  };
}
const vn = { class: "kx" }, yn = { class: "kx-bar" }, gn = { class: "kx-count" }, kn = { class: "kx-bar-actions" }, Cn = {
  key: 0,
  class: "kx-search"
}, _n = {
  key: 0,
  class: "kx-err"
}, xn = { class: "kx-body" }, wn = {
  key: 0,
  class: "kx-loading"
}, Sn = {
  key: 1,
  class: "kx-empty"
}, $n = { class: "kx-empty-ico" }, Ln = { class: "kx-empty-actions" }, Dn = {
  key: 2,
  class: "kx-empty"
}, En = { class: "kx-empty-ico" }, zn = { class: "kx-empty-sub" }, jn = { class: "kx-empty-actions" }, Mn = {
  key: 3,
  class: "kx-grid"
}, In = ["aria-label", "onClick", "onKeydown"], An = { class: "kx-card-head" }, On = { class: "kx-ficon" }, Bn = { class: "kx-card-id" }, Tn = ["title"], Pn = { class: "kx-card-meta" }, Rn = ["title"], Fn = ["title"], Vn = { class: "kx-modal-head-icon" }, Hn = { class: "kx-modal-body" }, Un = { class: "kx-modal-head-icon" }, Nn = { class: "kx-modal-head-text" }, Kn = { class: "kx-modal-head-title" }, Wn = { class: "kx-modal-head-sub" }, Zn = {
  key: 0,
  class: "kx-modal-body"
}, Yn = { class: "kx-field" }, Xn = { class: "wh-token" }, Gn = { class: "kx-field" }, qn = { class: "wh-token" }, Jn = { key: 0 }, Qn = { class: "wh-note" }, eo = { class: "wh-facts" }, to = { class: "kx-field" }, no = ["disabled"], oo = { class: "kx-field wh-schema" }, io = { class: "wh-schema-edit" }, ao = ["disabled"], so = {
  key: 0,
  class: "kx-err inline"
}, ro = /* @__PURE__ */ Le({
  __name: "Webhooks",
  setup(e) {
    const t = {
      header: { class: "kx-dialog-header" },
      content: { class: "kx-dialog-content" },
      footer: { class: "kx-dialog-footer" }
    }, n = O([]), o = O(!0), a = O(""), i = O(""), u = O(!1), s = O(null), p = O({ label: "", schemaText: "" }), b = O(""), _ = O(!1), x = O(!1), y = K(() => {
      const f = i.value.trim().toLowerCase();
      return f ? n.value.filter((l) => (l.label || l.webhook_id).toLowerCase().includes(f)) : n.value;
    }), m = K(() => ce(p.value.schemaText).schema || (s.value?.schema ?? {})), C = hn();
    async function c() {
      const f = C();
      o.value = !0, a.value = "";
      try {
        const l = await He();
        f() && (n.value = l);
      } catch (l) {
        f() && (a.value = G(l, "could not load webhooks"));
      } finally {
        f() && (o.value = !1);
      }
    }
    function $(f) {
      return "POST /api/public/hooks/" + f;
    }
    function z(f) {
      return f.subscriber_count || 0;
    }
    function P() {
      u.value = !0;
    }
    function J() {
      u.value = !1;
    }
    async function Me() {
      u.value = !1, await c();
    }
    function X(f) {
      s.value = f, p.value = { label: f.label || "", schemaText: Pe(f.schema || {}) }, b.value = "", x.value = !1;
    }
    function H() {
      s.value = null;
    }
    const re = K({
      get: () => s.value !== null,
      set: (f) => {
        f || H();
      }
    });
    async function Ie(f, l) {
      try {
        await navigator.clipboard.writeText(f), I.toast({ severity: "success", summary: "Copied", detail: l });
      } catch {
        I.toast({ severity: "warn", summary: "Copy failed", detail: "Select and copy manually." });
      }
    }
    async function Ae() {
      const f = s.value;
      if (!f) return;
      const l = ce(p.value.schemaText);
      if (l.error) {
        b.value = l.error;
        return;
      }
      _.value = !0, b.value = "";
      try {
        await Re(f.webhook_id, { label: p.value.label.trim(), schema: l.schema }), I.toast({ severity: "success", summary: "Saved", detail: p.value.label.trim() || f.webhook_id }), H(), await c();
      } catch (d) {
        b.value = G(d, "save failed");
      } finally {
        _.value = !1;
      }
    }
    async function le(f) {
      if (await I.confirm({
        message: `Revoke “${f.label || f.webhook_id}”? The secret stops working and subscribed automations receive no further events. This can't be undone.`,
        header: "Revoke webhook",
        icon: "tabler:ban",
        acceptLabel: "Revoke",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      }))
        try {
          await Fe(f.webhook_id), I.toast({ severity: "success", summary: "Revoked", detail: f.label || f.webhook_id }), s.value?.webhook_id === f.webhook_id && H(), await c();
        } catch (d) {
          a.value = G(d, "revoke failed"), I.toast({ severity: "error", summary: "Revoke failed", detail: a.value });
        }
    }
    async function de(f) {
      if (z(f) > 0) {
        I.toast({
          severity: "warn",
          summary: "In use",
          detail: `Used by ${z(f)} automation${z(f) === 1 ? "" : "s"}. Remove those first.`
        });
        return;
      }
      if (await I.confirm({
        message: `Remove “${f.label || f.webhook_id}”? This deletes the webhook and its endpoint. This can't be undone.`,
        header: "Remove webhook",
        icon: "tabler:trash",
        acceptLabel: "Remove",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      }))
        try {
          await Ve(f.webhook_id), Oe(f.webhook_id), I.toast({ severity: "success", summary: "Deletion accepted", detail: f.label || f.webhook_id }), s.value?.webhook_id === f.webhook_id && H(), await c();
        } catch (d) {
          a.value = G(d, "delete failed"), I.toast({ severity: "error", summary: "Remove failed", detail: a.value });
        }
    }
    Be(c);
    const { acceptDeletion: Oe } = zt(n, (f) => f.webhook_id, void 0, c);
    return (f, l) => (v(), k("div", vn, [
      r("div", yn, [
        r("span", gn, w(n.value.length) + " webhook" + w(n.value.length !== 1 ? "s" : ""), 1),
        r("div", kn, [
          n.value.length ? (v(), k("div", Cn, [
            g(h(L), {
              icon: "tabler:search",
              class: "kx-search-ico",
              "aria-hidden": "true"
            }),
            q(r("input", {
              "onUpdate:modelValue": l[0] || (l[0] = (d) => i.value = d),
              class: "kx-search-input",
              type: "text",
              placeholder: "Search webhooks…",
              "aria-label": "Search webhooks"
            }, null, 512), [
              [Q, i.value]
            ])
          ])) : S("", !0),
          g(h(A), {
            type: "button",
            label: "New webhook",
            onClick: P
          }, {
            icon: E(({ class: d }) => [
              g(h(L), {
                icon: "tabler:plus",
                class: j(d),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ])
      ]),
      a.value ? (v(), k("div", _n, w(a.value), 1)) : S("", !0),
      r("div", xn, [
        o.value && !n.value.length ? (v(), k("div", wn, [
          g(h(L), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          l[10] || (l[10] = B(" Loading webhooks… ", -1))
        ])) : n.value.length ? y.value.length ? (v(), k("div", Mn, [
          (v(!0), k(R, null, pt(y.value, (d) => (v(), k("div", {
            key: d.webhook_id,
            class: j(["kx-card", d.status === "revoked" && "is-revoked"]),
            tabindex: "0",
            role: "button",
            "aria-label": `Open ${d.label || "webhook"}`,
            onClick: (M) => !d.deleting_at && X(d),
            onKeydown: [
              ve((M) => !d.deleting_at && X(d), ["enter"]),
              ve(W((M) => !d.deleting_at && X(d), ["prevent"]), ["space"])
            ]
          }, [
            g($t, {
              state: d,
              onRetry: (M) => de(d)
            }, null, 8, ["state", "onRetry"]),
            r("div", An, [
              r("span", On, [
                g(h(L), {
                  icon: "tabler:webhook",
                  "aria-hidden": "true"
                })
              ]),
              r("div", Bn, [
                r("div", {
                  class: "kx-card-name",
                  title: d.label || "Webhook"
                }, w(d.label || "Webhook"), 9, Tn),
                r("div", Pn, [
                  r("span", {
                    class: j(["kx-chip kx-tag-sm", d.status === "active" ? "is-active" : "is-revoked"])
                  }, w(h(fe)(d.status)), 3),
                  z(d) > 0 ? (v(), k("span", {
                    key: 0,
                    class: "kx-chip kx-tag-sm is-count",
                    title: `Used by ${z(d)} automation(s)`
                  }, [
                    g(h(L), {
                      icon: "tabler:plug-connected",
                      "aria-hidden": "true"
                    }),
                    B(" " + w(z(d)) + " automation" + w(z(d) === 1 ? "" : "s"), 1)
                  ], 8, Rn)) : S("", !0)
                ])
              ]),
              r("div", {
                class: "kx-card-actions",
                onClick: l[2] || (l[2] = W(() => {
                }, ["stop"]))
              }, [
                g(h(A), {
                  type: "button",
                  severity: "secondary",
                  outlined: "",
                  size: "small",
                  title: "Open",
                  "aria-label": `Open ${d.label || "webhook"}`,
                  onClick: (M) => !d.deleting_at && X(d),
                  disabled: !!d.deleting_at
                }, {
                  icon: E(({ class: M }) => [
                    g(h(L), {
                      icon: "tabler:pencil",
                      class: j(M),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick", "disabled"]),
                d.status === "active" ? (v(), V(h(A), {
                  key: 0,
                  type: "button",
                  severity: "danger",
                  outlined: "",
                  size: "small",
                  title: "Revoke",
                  "aria-label": `Revoke ${d.label || "webhook"}`,
                  onClick: (M) => le(d),
                  disabled: !!d.deleting_at
                }, {
                  icon: E(({ class: M }) => [
                    g(h(L), {
                      icon: "tabler:ban",
                      class: j(M),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick", "disabled"])) : S("", !0),
                g(h(A), {
                  type: "button",
                  severity: "danger",
                  outlined: "",
                  size: "small",
                  title: "Remove",
                  "aria-label": `Remove ${d.label || "webhook"}`,
                  disabled: !!d.deleting_at || z(d) > 0,
                  onClick: (M) => de(d)
                }, {
                  icon: E(({ class: M }) => [
                    g(h(L), {
                      icon: "tabler:trash",
                      class: j(M),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "disabled", "onClick"])
              ])
            ]),
            r("div", {
              class: "kx-card-desc",
              title: $(d.webhook_id)
            }, w($(d.webhook_id)), 9, Fn)
          ], 42, In))), 128))
        ])) : (v(), k("div", Dn, [
          r("div", En, [
            g(h(L), {
              icon: "tabler:mood-empty",
              "aria-hidden": "true"
            })
          ]),
          l[13] || (l[13] = r("div", { class: "kx-empty-title" }, "No matches", -1)),
          r("div", zn, "Nothing matches “" + w(i.value) + "”. Try a different term or clear the search.", 1),
          r("div", jn, [
            g(h(A), {
              type: "button",
              severity: "secondary",
              outlined: "",
              label: "Clear search",
              onClick: l[1] || (l[1] = (d) => i.value = "")
            }, {
              icon: E(({ class: d }) => [
                g(h(L), {
                  icon: "tabler:x",
                  class: j(d),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ])) : (v(), k("div", Sn, [
          r("div", $n, [
            g(h(L), {
              icon: "tabler:webhook",
              "aria-hidden": "true"
            })
          ]),
          l[11] || (l[11] = r("div", { class: "kx-empty-title" }, "No webhooks yet", -1)),
          l[12] || (l[12] = r("div", { class: "kx-empty-sub" }, "A webhook gives an external service a secret URL to POST to. Each request becomes a trigger event your automations can act on.", -1)),
          r("div", Ln, [
            g(h(A), {
              type: "button",
              label: "New webhook",
              onClick: P
            }, {
              icon: E(({ class: d }) => [
                g(h(L), {
                  icon: "tabler:plus",
                  class: j(d),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ]))
      ]),
      g(h(ie), {
        visible: u.value,
        "onUpdate:visible": l[3] || (l[3] = (d) => u.value = d),
        modal: "",
        "dismissable-mask": !0,
        class: "kx-dialog",
        pt: t,
        "aria-label": "New webhook"
      }, {
        header: E(() => [
          r("span", Vn, [
            g(h(L), {
              icon: "tabler:webhook",
              "aria-hidden": "true"
            })
          ]),
          l[14] || (l[14] = r("span", { class: "kx-modal-head-text" }, [
            r("span", { class: "kx-modal-head-title" }, "New webhook"),
            r("span", { class: "kx-modal-head-sub" }, "Name it and set the payload it accepts — the secret is shown once.")
          ], -1))
        ]),
        default: E(() => [
          r("div", Hn, [
            g(st, {
              onCreated: Me,
              onClose: J
            })
          ])
        ]),
        _: 1
      }, 8, ["visible"]),
      g(h(ie), {
        visible: re.value,
        "onUpdate:visible": l[9] || (l[9] = (d) => re.value = d),
        modal: "",
        class: "kx-dialog",
        pt: t,
        "aria-label": "Webhook detail"
      }, mt({
        default: E(() => [
          s.value ? (v(), k("div", Zn, [
            r("div", Yn, [
              l[15] || (l[15] = r("span", { class: "kx-field-lbl" }, [
                B("Endpoint URL "),
                r("span", { class: "kx-field-hint-inline" }, "— hand this to the sender")
              ], -1)),
              r("div", Xn, [
                r("code", null, w(h(pe)(s.value.webhook_id)), 1),
                r("button", {
                  type: "button",
                  class: "wh-copy",
                  title: "Copy URL",
                  "aria-label": "Copy URL",
                  onClick: l[4] || (l[4] = (d) => Ie(h(pe)(s.value.webhook_id), "endpoint URL"))
                }, [
                  g(h(L), {
                    icon: "tabler:copy",
                    "aria-hidden": "true"
                  })
                ])
              ])
            ]),
            r("div", Gn, [
              l[17] || (l[17] = r("span", { class: "kx-field-lbl" }, "Secret", -1)),
              r("div", qn, [
                r("code", null, [
                  B(w(s.value.secret_prefix || "Not available"), 1),
                  s.value.secret_prefix ? (v(), k("span", Jn, "…")) : S("", !0)
                ])
              ]),
              r("p", Qn, [
                g(h(L), {
                  icon: "tabler:info-circle",
                  "aria-hidden": "true"
                }),
                l[16] || (l[16] = r("span", null, "The full secret is shown only when a webhook is created. To rotate it, revoke this webhook and create a new one.", -1))
              ])
            ]),
            r("dl", eo, [
              s.value.created_at ? (v(), k(R, { key: 0 }, [
                l[18] || (l[18] = r("dt", null, "Created", -1)),
                r("dd", null, w(h(we)(s.value.created_at)), 1)
              ], 64)) : S("", !0),
              s.value.last_used_at ? (v(), k(R, { key: 1 }, [
                l[19] || (l[19] = r("dt", null, "Last received", -1)),
                r("dd", null, w(h(we)(s.value.last_used_at)), 1)
              ], 64)) : S("", !0),
              z(s.value) > 0 ? (v(), k(R, { key: 2 }, [
                l[20] || (l[20] = r("dt", null, "Used by", -1)),
                r("dd", null, w(z(s.value)) + " automation" + w(z(s.value) === 1 ? "" : "s"), 1)
              ], 64)) : S("", !0)
            ]),
            r("label", to, [
              l[21] || (l[21] = r("span", { class: "kx-field-lbl" }, [
                B("Name "),
                r("span", { class: "kx-field-hint-inline" }, "— shown in automation trigger pickers")
              ], -1)),
              q(r("input", {
                "onUpdate:modelValue": l[5] || (l[5] = (d) => p.value.label = d),
                class: "kx-input",
                type: "text",
                placeholder: "Customer events",
                disabled: s.value.status === "revoked",
                "data-test": "wh-name"
              }, null, 8, no), [
                [Q, p.value.label]
              ])
            ]),
            r("div", oo, [
              l[23] || (l[23] = r("span", { class: "kx-field-lbl" }, [
                B("Payload schema "),
                r("span", { class: "kx-field-hint-inline" }, "— the fields each inbound request must carry")
              ], -1)),
              g(Te, { schema: m.value }, null, 8, ["schema"]),
              r("div", io, [
                r("button", {
                  type: "button",
                  class: j(["wh-toggle", x.value && "is-open"]),
                  onClick: l[6] || (l[6] = (d) => x.value = !x.value)
                }, [
                  g(h(L), {
                    icon: "tabler:chevron-right",
                    "aria-hidden": "true"
                  }),
                  l[22] || (l[22] = B(" Edit as JSON Schema ", -1))
                ], 2),
                x.value ? q((v(), k("textarea", {
                  key: 0,
                  "onUpdate:modelValue": l[7] || (l[7] = (d) => p.value.schemaText = d),
                  class: "kx-input kx-textarea",
                  spellcheck: "false",
                  disabled: s.value.status === "revoked",
                  "data-test": "wh-schema"
                }, null, 8, ao)), [
                  [Q, p.value.schemaText]
                ]) : S("", !0)
              ])
            ]),
            b.value ? (v(), k("div", so, w(b.value), 1)) : S("", !0)
          ])) : S("", !0)
        ]),
        _: 2
      }, [
        s.value ? {
          name: "header",
          fn: E(() => [
            r("span", Un, [
              g(h(L), {
                icon: "tabler:webhook",
                "aria-hidden": "true"
              })
            ]),
            r("span", Nn, [
              r("span", Kn, w(s.value.label || "Webhook"), 1),
              r("span", Wn, w($(s.value.webhook_id)), 1)
            ]),
            r("span", {
              class: j(["kx-chip kx-tag-sm", s.value.status === "active" ? "is-active" : "is-revoked"])
            }, w(h(fe)(s.value.status)), 3)
          ]),
          key: "0"
        } : void 0,
        s.value ? {
          name: "footer",
          fn: E(() => [
            s.value.status === "active" ? (v(), V(h(A), {
              key: 0,
              type: "button",
              severity: "danger",
              size: "small",
              class: "kx-foot-spacer",
              label: "Revoke",
              onClick: l[8] || (l[8] = (d) => le(s.value))
            }, {
              icon: E(({ class: d }) => [
                g(h(L), {
                  icon: "tabler:ban",
                  class: j(d),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })) : S("", !0),
            g(h(A), {
              type: "button",
              label: "Close",
              severity: "secondary",
              outlined: "",
              onClick: H
            }),
            s.value.status === "active" ? (v(), V(h(A), {
              key: 1,
              type: "button",
              label: "Save changes",
              loading: _.value,
              disabled: _.value,
              "data-test": "wh-save",
              onClick: Ae
            }, {
              icon: E(({ class: d }) => [
                g(h(L), {
                  icon: "tabler:device-floppy",
                  class: j(d),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }, 8, ["loading", "disabled"])) : S("", !0)
          ]),
          key: "1"
        } : void 0
      ]), 1032, ["visible"])
    ]));
  }
});
class lo extends Ue {
  static get wippyConfig() {
    return {
      propsSchema: rt.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: Ne
    };
  }
  static get vueConfig() {
    return { rootComponent: ro, plugins: [lt] };
  }
}
vt(import.meta.url, lo);
//# sourceMappingURL=index.js.map
