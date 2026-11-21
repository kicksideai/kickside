import { B as oe, s as xe, a as ie, L as Oe, b as R, v as V, c as Be, U as Te, I as de, d as Pe, e as Re, r as we, f as Fe, g as He, R as Ve, h as Ue, i as Ne, C as Ke, j as We, S as Ze, _ as Ye, x as q, k as Xe, m as Ge, P as qe } from "./wc-runtime-BQHcLGi8.js";
import { openBlock as v, createElementBlock as k, mergeProps as $, createElementVNode as s, defineComponent as Se, computed as N, withModifiers as K, Fragment as T, createTextVNode as O, toDisplayString as x, createCommentVNode as w, createVNode as g, unref as h, watch as Je, onBeforeUnmount as Qe, resolveComponent as ue, resolveDirective as et, createBlock as F, withCtx as D, Transition as tt, withDirectives as G, renderSlot as B, normalizeClass as j, resolveDynamicComponent as ce, ref as A, vModelText as J, renderList as nt, withKeys as fe, createSlots as ot } from "vue";
import { s as M, _ as it } from "./WebhookCreate.vue_vue_type_script_setup_true_lang-R-emZFX0.js";
import { on as at, host as I } from "@wippy-fe/proxy";
import { Icon as S } from "@iconify/vue";
import { p as pe, w as me, i as be, _ as st, a as rt, u as lt, e as X, r as dt, d as ut, b as ct } from "./WebhookSchema.vue_vue_type_script_setup_true_lang-voPtjawU.js";
var ft = `
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
`, pt = {
  root: "p-progressspinner",
  spin: "p-progressspinner-spin",
  circle: "p-progressspinner-circle"
}, mt = oe.extend({
  name: "progressspinner",
  style: ft,
  classes: pt
}), bt = {
  name: "BaseProgressSpinner",
  extends: xe,
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
  style: mt,
  provide: function() {
    return {
      $pcProgressSpinner: this,
      $parentInstance: this
    };
  }
}, $e = {
  name: "ProgressSpinner",
  extends: bt,
  inheritAttrs: !1,
  computed: {
    svgStyle: function() {
      return {
        "animation-duration": this.animationDuration
      };
    }
  }
}, ht = ["fill", "stroke-width"];
function vt(e, t, n, o, a, i) {
  return v(), k("div", $({
    class: e.cx("root"),
    role: "progressbar"
  }, e.ptmi("root")), [(v(), k("svg", $({
    class: e.cx("spin"),
    viewBox: "25 25 50 50",
    style: i.svgStyle
  }, e.ptm("spin")), [s("circle", $({
    class: e.cx("circle"),
    cx: "50",
    cy: "50",
    r: "20",
    fill: e.fill,
    "stroke-width": e.strokeWidth,
    strokeMiterlimit: "10"
  }, e.ptm("circle")), null, 16, ht)], 16))], 16);
}
$e.render = vt;
const yt = { key: 0 }, gt = /* @__PURE__ */ Se({
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
        s("span", null, [
          a[3] || (a[3] = O("Deletion failed", -1)),
          e.state.deletion_job?.last_error ? (v(), k("span", yt, ": " + x(e.state.deletion_job.last_error), 1)) : w("", !0)
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
        a[4] || (a[4] = s("span", null, "Deleting…", -1))
      ], 64))
    ], 32)) : w("", !0);
  }
});
function U(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function kt(e, t) {
  return e;
}
function Ct(e, t, n) {
  const o = U(e) ? e : {}, a = [
    o,
    U(o.data) ? o.data : null,
    U(o.payload) ? o.payload : null,
    U(o.detail) ? o.detail : null
  ].filter(Boolean);
  for (const i of a) {
    if (i.event !== "component.meta.changed" && i.event !== "component.deleting" && i.event !== "component.deleted") continue;
    const _ = String(i.component_id || ""), d = String(o.topic || i.topic || "");
    if (!_ && (!d.startsWith("component.") || d === "component.")) continue;
    const y = _ || t || d.slice(10);
    return i.event === "component.deleting" && typeof i.deletion_job_id == "string" && i.deletion_job_id ? { event: i.event, component_id: y, deletion_job_id: i.deletion_job_id } : i.event !== "component.meta.changed" ? { event: i.event, component_id: y } : {
      event: "component.meta.changed",
      component_id: y,
      meta: kt(U(i.meta) ? i.meta : {}),
      deleted: Array.isArray(i.deleted) ? i.deleted.map(String) : []
    };
  }
  return null;
}
function _t(e, t) {
  const n = Ct(e, t);
  return n && n.event !== "component.meta.changed" ? n : null;
}
function xt(e, t, n, o) {
  const a = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Map();
  function _(f, m) {
    const b = e.value.find((L) => t(L) === f), u = i.get(f), p = m?.job_id || u?.state.deletion_job_id || b?.deletion_job_id, E = u ? u.state.deletion_job_id : b?.deleting_at ? b.deletion_job_id : void 0;
    if ((u || b?.deleting_at) && p === E || p && u?.superseded.has(p)) return;
    const C = {
      deleting_at: u?.state.deleting_at || b?.deleting_at || (/* @__PURE__ */ new Date()).toISOString(),
      deletion_job_id: p
    }, P = new Set(u?.superseded);
    for (const L of [u?.state.deletion_job_id, b?.deletion_job_id])
      L && L !== p && P.add(L);
    i.set(f, { state: C, superseded: P }), b && (Object.assign(b, C), b.deletion_job = void 0);
  }
  const d = Je(() => e.value, (f, m = []) => {
    const b = f.filter((u) => !a.has(t(u)));
    for (const u of m)
      a.has(t(u)) || b.some((p) => t(p) === t(u)) || u.deleting_at && o?.(t(u));
    if (b.length !== f.length) {
      e.value = b;
      return;
    }
    for (const u of f) {
      u.deleting_at && u.deletion_job === void 0 && !m.includes(u) && (u.deletion_job = null);
      const p = i.get(t(u));
      if (p) {
        const C = u.deletion_job_id;
        u.deleting_at && C && C !== p.state.deletion_job_id && !p.superseded.has(C) && (p.state.deletion_job_id && p.superseded.add(p.state.deletion_job_id), p.state.deletion_job_id = C), C !== p.state.deletion_job_id && (u.deletion_job = void 0), Object.assign(u, p.state);
      }
      const E = m.find((C) => t(C) === t(u));
      u.deletion_job === void 0 && E?.deletion_job_id === u.deletion_job_id && (u.deletion_job = E?.deletion_job);
    }
  }, { immediate: !0 }), y = at("@message", (f) => {
    const m = _t(f);
    if (!m) return;
    const b = e.value.find((u) => t(u) === m.component_id);
    m.event === "component.deleted" ? (b && !a.has(m.component_id) && o?.(m.component_id), a.add(m.component_id), i.delete(m.component_id), e.value = e.value.filter((u) => t(u) !== m.component_id)) : b && _(m.component_id, { job_id: m.deletion_job_id });
  });
  return Qe(() => {
    d(), typeof y == "function" && y();
  }), { acceptDeletion: _ };
}
var Le = {
  name: "TimesIcon",
  extends: ie
};
function wt(e) {
  return Dt(e) || Lt(e) || $t(e) || St();
}
function St() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function $t(e, t) {
  if (e) {
    if (typeof e == "string") return Q(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Q(e, t) : void 0;
  }
}
function Lt(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Dt(e) {
  if (Array.isArray(e)) return Q(e);
}
function Q(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function Et(e, t, n, o, a, i) {
  return v(), k("svg", $({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), wt(t[0] || (t[0] = [s("path", {
    d: "M8.01186 7.00933L12.27 2.75116C12.341 2.68501 12.398 2.60524 12.4375 2.51661C12.4769 2.42798 12.4982 2.3323 12.4999 2.23529C12.5016 2.13827 12.4838 2.0419 12.4474 1.95194C12.4111 1.86197 12.357 1.78024 12.2884 1.71163C12.2198 1.64302 12.138 1.58893 12.0481 1.55259C11.9581 1.51625 11.8617 1.4984 11.7647 1.50011C11.6677 1.50182 11.572 1.52306 11.4834 1.56255C11.3948 1.60204 11.315 1.65898 11.2488 1.72997L6.99067 5.98814L2.7325 1.72997C2.59553 1.60234 2.41437 1.53286 2.22718 1.53616C2.03999 1.53946 1.8614 1.61529 1.72901 1.74767C1.59663 1.88006 1.5208 2.05865 1.5175 2.24584C1.5142 2.43303 1.58368 2.61419 1.71131 2.75116L5.96948 7.00933L1.71131 11.2675C1.576 11.403 1.5 11.5866 1.5 11.7781C1.5 11.9696 1.576 12.1532 1.71131 12.2887C1.84679 12.424 2.03043 12.5 2.2219 12.5C2.41338 12.5 2.59702 12.424 2.7325 12.2887L6.99067 8.03052L11.2488 12.2887C11.3843 12.424 11.568 12.5 11.7594 12.5C11.9509 12.5 12.1346 12.424 12.27 12.2887C12.4053 12.1532 12.4813 11.9696 12.4813 11.7781C12.4813 11.5866 12.4053 11.403 12.27 11.2675L8.01186 7.00933Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Le.render = Et;
var De = {
  name: "WindowMaximizeIcon",
  extends: ie
};
function jt(e) {
  return It(e) || At(e) || Mt(e) || zt();
}
function zt() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Mt(e, t) {
  if (e) {
    if (typeof e == "string") return ee(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? ee(e, t) : void 0;
  }
}
function At(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function It(e) {
  if (Array.isArray(e)) return ee(e);
}
function ee(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function Ot(e, t, n, o, a, i) {
  return v(), k("svg", $({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), jt(t[0] || (t[0] = [s("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14ZM9.77805 7.42192C9.89013 7.534 10.0415 7.59788 10.2 7.59995C10.3585 7.59788 10.5099 7.534 10.622 7.42192C10.7341 7.30985 10.798 7.15844 10.8 6.99995V3.94242C10.8066 3.90505 10.8096 3.86689 10.8089 3.82843C10.8079 3.77159 10.7988 3.7157 10.7824 3.6623C10.756 3.55552 10.701 3.45698 10.622 3.37798C10.5099 3.2659 10.3585 3.20202 10.2 3.19995H7.00002C6.84089 3.19995 6.68828 3.26317 6.57576 3.37569C6.46324 3.48821 6.40002 3.64082 6.40002 3.79995C6.40002 3.95908 6.46324 4.11169 6.57576 4.22422C6.68828 4.33674 6.84089 4.39995 7.00002 4.39995H8.80006L6.19997 7.00005C6.10158 7.11005 6.04718 7.25246 6.04718 7.40005C6.04718 7.54763 6.10158 7.69004 6.19997 7.80005C6.30202 7.91645 6.44561 7.98824 6.59997 8.00005C6.75432 7.98824 6.89791 7.91645 6.99997 7.80005L9.60002 5.26841V6.99995C9.6021 7.15844 9.66598 7.30985 9.77805 7.42192ZM1.4 14H3.8C4.17066 13.9979 4.52553 13.8498 4.78763 13.5877C5.04973 13.3256 5.1979 12.9707 5.2 12.6V10.2C5.1979 9.82939 5.04973 9.47452 4.78763 9.21242C4.52553 8.95032 4.17066 8.80215 3.8 8.80005H1.4C1.02934 8.80215 0.674468 8.95032 0.412371 9.21242C0.150274 9.47452 0.00210008 9.82939 0 10.2V12.6C0.00210008 12.9707 0.150274 13.3256 0.412371 13.5877C0.674468 13.8498 1.02934 13.9979 1.4 14ZM1.25858 10.0586C1.29609 10.0211 1.34696 10 1.4 10H3.8C3.85304 10 3.90391 10.0211 3.94142 10.0586C3.97893 10.0961 4 10.147 4 10.2V12.6C4 12.6531 3.97893 12.704 3.94142 12.7415C3.90391 12.779 3.85304 12.8 3.8 12.8H1.4C1.34696 12.8 1.29609 12.779 1.25858 12.7415C1.22107 12.704 1.2 12.6531 1.2 12.6V10.2C1.2 10.147 1.22107 10.0961 1.25858 10.0586Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
De.render = Ot;
var Ee = {
  name: "WindowMinimizeIcon",
  extends: ie
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
    if (typeof e == "string") return te(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? te(e, t) : void 0;
  }
}
function Rt(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Ft(e) {
  if (Array.isArray(e)) return te(e);
}
function te(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function Ht(e, t, n, o, a, i) {
  return v(), k("svg", $({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Bt(t[0] || (t[0] = [s("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0ZM6.368 7.952C6.44137 7.98326 6.52025 7.99958 6.6 8H9.8C9.95913 8 10.1117 7.93678 10.2243 7.82426C10.3368 7.71174 10.4 7.55913 10.4 7.4C10.4 7.24087 10.3368 7.08826 10.2243 6.97574C10.1117 6.86321 9.95913 6.8 9.8 6.8H8.048L10.624 4.224C10.73 4.11026 10.7877 3.95982 10.7849 3.80438C10.7822 3.64894 10.7192 3.50063 10.6093 3.3907C10.4994 3.28077 10.3511 3.2178 10.1956 3.21506C10.0402 3.21232 9.88974 3.27002 9.776 3.376L7.2 5.952V4.2C7.2 4.04087 7.13679 3.88826 7.02426 3.77574C6.91174 3.66321 6.75913 3.6 6.6 3.6C6.44087 3.6 6.28826 3.66321 6.17574 3.77574C6.06321 3.88826 6 4.04087 6 4.2V7.4C6.00042 7.47975 6.01674 7.55862 6.048 7.632C6.07656 7.70442 6.11971 7.7702 6.17475 7.82524C6.2298 7.88029 6.29558 7.92344 6.368 7.952ZM1.4 8.80005H3.8C4.17066 8.80215 4.52553 8.95032 4.78763 9.21242C5.04973 9.47452 5.1979 9.82939 5.2 10.2V12.6C5.1979 12.9707 5.04973 13.3256 4.78763 13.5877C4.52553 13.8498 4.17066 13.9979 3.8 14H1.4C1.02934 13.9979 0.674468 13.8498 0.412371 13.5877C0.150274 13.3256 0.00210008 12.9707 0 12.6V10.2C0.00210008 9.82939 0.150274 9.47452 0.412371 9.21242C0.674468 8.95032 1.02934 8.80215 1.4 8.80005ZM3.94142 12.7415C3.97893 12.704 4 12.6531 4 12.6V10.2C4 10.147 3.97893 10.0961 3.94142 10.0586C3.90391 10.0211 3.85304 10 3.8 10H1.4C1.34696 10 1.29609 10.0211 1.25858 10.0586C1.22107 10.0961 1.2 10.147 1.2 10.2V12.6C1.2 12.6531 1.22107 12.704 1.25858 12.7415C1.29609 12.779 1.34696 12.8 1.4 12.8H3.8C3.85304 12.8 3.90391 12.779 3.94142 12.7415Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Ee.render = Ht;
var Vt = oe.extend({
  name: "focustrap-directive"
}), Ut = Be.extend({
  style: Vt
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
      Nt(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : he(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function Nt(e, t, n) {
  return (t = Kt(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Kt(e) {
  var t = Wt(e, "string");
  return W(t) == "symbol" ? t : t + "";
}
function Wt(e, t) {
  if (W(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (W(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Zt = Ut.extend("focustrap", {
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
      var o = this, a = n.value || {}, i = a.onFocusIn, _ = a.onFocusOut;
      t.$_pfocustrap_mutationobserver = new MutationObserver(function(d) {
        d.forEach(function(y) {
          if (y.type === "childList" && !t.contains(document.activeElement)) {
            var f = function(b) {
              var u = de(b) ? de(b, o.getComputedSelector(t.$_pfocustrap_focusableselector)) ? b : V(t, o.getComputedSelector(t.$_pfocustrap_focusableselector)) : V(b);
              return Pe(u) ? u : b.nextSibling && f(b.nextSibling);
            };
            R(f(y.nextSibling));
          }
        });
      }), t.$_pfocustrap_mutationobserver.disconnect(), t.$_pfocustrap_mutationobserver.observe(t, {
        childList: !0
      }), t.$_pfocustrap_focusinlistener = function(d) {
        return i && i(d);
      }, t.$_pfocustrap_focusoutlistener = function(d) {
        return _ && _(d);
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
      var o = n.value || {}, a = o.autoFocusSelector, i = a === void 0 ? "" : a, _ = o.firstFocusableSelector, d = _ === void 0 ? "" : _, y = o.autoFocus, f = y === void 0 ? !1 : y, m = V(t, "[autofocus]".concat(this.getComputedSelector(i)));
      f && !m && (m = V(t, this.getComputedSelector(d))), R(m);
    },
    onFirstHiddenElementFocus: function(t) {
      var n, o = t.currentTarget, a = t.relatedTarget, i = a === o.$_pfocustrap_lasthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(a)) ? V(o.parentElement, this.getComputedSelector(o.$_pfocustrap_focusableselector)) : o.$_pfocustrap_lasthiddenfocusableelement;
      R(i);
    },
    onLastHiddenElementFocus: function(t) {
      var n, o = t.currentTarget, a = t.relatedTarget, i = a === o.$_pfocustrap_firsthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(a)) ? Oe(o.parentElement, this.getComputedSelector(o.$_pfocustrap_focusableselector)) : o.$_pfocustrap_firsthiddenfocusableelement;
      R(i);
    },
    createHiddenFocusableElements: function(t, n) {
      var o = this, a = n.value || {}, i = a.tabIndex, _ = i === void 0 ? 0 : i, d = a.firstFocusableSelector, y = d === void 0 ? "" : d, f = a.lastFocusableSelector, m = f === void 0 ? "" : f, b = function(C) {
        return Te("span", {
          class: "p-hidden-accessible p-hidden-focusable",
          tabIndex: _,
          role: "presentation",
          "aria-hidden": !0,
          "data-p-hidden-accessible": !0,
          "data-p-hidden-focusable": !0,
          onFocus: C?.bind(o)
        });
      }, u = b(this.onFirstHiddenElementFocus), p = b(this.onLastHiddenElementFocus);
      u.$_pfocustrap_lasthiddenfocusableelement = p, u.$_pfocustrap_focusableselector = y, u.setAttribute("data-pc-section", "firstfocusableelement"), p.$_pfocustrap_firsthiddenfocusableelement = u, p.$_pfocustrap_focusableselector = m, p.setAttribute("data-pc-section", "lastfocusableelement"), t.prepend(u), t.append(p);
    }
  }
});
function ye() {
  Fe({
    variableName: we("scrollbar.width").name
  });
}
function ge() {
  Re({
    variableName: we("scrollbar.width").name
  });
}
var Yt = `
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
`, Xt = {
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
}, Gt = {
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
}, qt = oe.extend({
  name: "dialog",
  style: Yt,
  classes: Gt,
  inlineStyles: Xt
}), Jt = {
  name: "BaseDialog",
  extends: xe,
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
  style: qt,
  provide: function() {
    return {
      $pcDialog: this,
      $parentInstance: this
    };
  }
}, ne = {
  name: "Dialog",
  extends: Jt,
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
      this.modal && !this.isUnstyled && Xe(this.mask, "p-overlay-mask-leave-active"), this.dragging && this.documentDragEndListener && this.documentDragEndListener();
    },
    onLeave: function() {
      this.$emit("hide"), R(this.target), this.target = null, this.focusableClose = null, this.focusableMax = null;
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
      var t = function(a) {
        return a && a.querySelector("[autofocus]");
      }, n = this.$slots.footer && t(this.footerContainer);
      n || (n = this.$slots.header && t(this.headerContainer), n || (n = this.$slots.default && t(this.content), n || (this.maximizable ? (this.focusableMax = !0, n = this.maximizableButton) : (this.focusableClose = !0, n = this.closeButton)))), n && R(n, {
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
        this.styleElement = document.createElement("style"), this.styleElement.type = "text/css", Ye(this.styleElement, "nonce", (t = this.$primevue) === null || t === void 0 || (t = t.config) === null || t === void 0 || (t = t.csp) === null || t === void 0 ? void 0 : t.nonce), document.head.appendChild(this.styleElement);
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
      t.target.closest("div").getAttribute("data-pc-section") !== "headeractions" && this.draggable && (this.dragging = !0, this.lastPageX = t.pageX, this.lastPageY = t.pageY, this.container.style.margin = "0", document.body.setAttribute("data-p-unselectable-text", "true"), !this.isUnstyled && Ze(document.body, {
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
          var o = Ne(t.container), a = Ke(t.container), i = n.pageX - t.lastPageX, _ = n.pageY - t.lastPageY, d = t.container.getBoundingClientRect(), y = d.left + i, f = d.top + _, m = We(), b = getComputedStyle(t.container), u = parseFloat(b.marginLeft), p = parseFloat(b.marginTop);
          t.container.style.position = "fixed", t.keepInViewport ? (y >= t.minX && y + o < m.width && (t.lastPageX = n.pageX, t.container.style.left = y - u + "px"), f >= t.minY && f + a < m.height && (t.lastPageY = n.pageY, t.container.style.top = f - p + "px")) : (t.lastPageX = n.pageX, t.container.style.left = y - u + "px", t.lastPageY = n.pageY, t.container.style.top = f - p + "px");
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
      return Ue({
        maximized: this.maximized,
        modal: this.modal
      });
    }
  },
  directives: {
    ripple: Ve,
    focustrap: Zt
  },
  components: {
    Button: M,
    Portal: He,
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
      Qt(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : ke(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function Qt(e, t, n) {
  return (t = en(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function en(e) {
  var t = tn(e, "string");
  return Z(t) == "symbol" ? t : t + "";
}
function tn(e, t) {
  if (Z(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (Z(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var nn = ["data-p"], on = ["aria-labelledby", "aria-modal", "data-p"], an = ["id"], sn = ["data-p"];
function rn(e, t, n, o, a, i) {
  var _ = ue("Button"), d = ue("Portal"), y = et("focustrap");
  return v(), F(d, {
    appendTo: e.appendTo
  }, {
    default: D(function() {
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
      }, e.ptm("mask")), [g(tt, $({
        name: "p-dialog",
        onEnter: i.onEnter,
        onAfterEnter: i.onAfterEnter,
        onBeforeLeave: i.onBeforeLeave,
        onLeave: i.onLeave,
        onAfterLeave: i.onAfterLeave,
        appear: ""
      }, e.ptm("transition")), {
        default: D(function() {
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
            maximizeCallback: function(m) {
              return i.maximize(m);
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
            class: j(e.cx("title"))
          }, function() {
            return [e.header ? (v(), k("span", $({
              key: 0,
              id: i.ariaLabelledById,
              class: e.cx("title")
            }, e.ptm("title")), x(e.header), 17, an)) : w("", !0)];
          }), s("div", $({
            class: e.cx("headerActions")
          }, e.ptm("headerActions")), [e.maximizable ? B(e.$slots, "maximizebutton", {
            key: 0,
            maximized: a.maximized,
            maximizeCallback: function(m) {
              return i.maximize(m);
            }
          }, function() {
            return [g(_, $({
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
              icon: D(function(f) {
                return [B(e.$slots, "maximizeicon", {
                  maximized: a.maximized
                }, function() {
                  return [(v(), F(ce(i.maximizeIconComponent), $({
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
            return [g(_, $({
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
              icon: D(function(f) {
                return [B(e.$slots, "closeicon", {}, function() {
                  return [(v(), F(ce(e.closeIcon ? "span" : "TimesIcon"), $({
                    class: [e.closeIcon, f.class]
                  }, e.ptm("pcCloseButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "aria-label", "unstyled", "pt"])];
          }) : w("", !0)], 16)], 16)) : w("", !0), s("div", $({
            ref: i.contentRef,
            class: [e.cx("content"), e.contentClass],
            style: e.contentStyle,
            "data-p": i.dataP
          }, Ce(Ce({}, e.contentProps), e.ptm("content"))), [B(e.$slots, "default")], 16, sn), e.footer || e.$slots.footer ? (v(), k("div", $({
            key: 1,
            ref: i.footerContainerRef,
            class: e.cx("footer")
          }, e.ptm("footer")), [B(e.$slots, "footer", {}, function() {
            return [O(x(e.footer), 1)];
          })], 16)) : w("", !0)], 64))], 16, on)), [[y, {
            disabled: !e.modal
          }]]) : w("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onBeforeLeave", "onLeave", "onAfterLeave"])], 16, nn)) : w("", !0)];
    }),
    _: 3
  }, 8, ["appendTo"]);
}
ne.render = rn;
function ln(e) {
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
function _e(e, t) {
  const n = ln(e);
  if (n === null) return "";
  const o = t?.now ?? Date.now(), a = t?.suffix ?? !0, i = t?.maxUnit ?? "day", _ = t?.future ?? !1, d = 6e4, y = 60 * d, f = 24 * y, m = 30 * f, b = 365 * f, u = o - n;
  if (_ && u < 0) {
    const C = -u;
    return C < d ? "in <1m" : C < y ? `in ${Math.floor(C / d)}m` : C < f ? `in ${Math.floor(C / y)}h` : `in ${Math.floor(C / f)}d`;
  }
  const p = Math.max(0, u);
  if (p < d) return "just now";
  const E = a ? " ago" : "";
  return p < y ? `${Math.floor(p / d)}m${E}` : p < f ? `${Math.floor(p / y)}h${E}` : i === "year" ? p < m ? `${Math.floor(p / f)}d${E}` : p < b ? `${Math.floor(p / m)}mo${E}` : `${Math.floor(p / b)}y${E}` : `${Math.floor(p / f)}d${E}`;
}
function dn() {
  let e = 0;
  return () => {
    const t = ++e;
    return () => t === e;
  };
}
const un = { class: "kx" }, cn = { class: "kx-bar" }, fn = { class: "kx-count" }, pn = { class: "kx-bar-actions" }, mn = {
  key: 0,
  class: "kx-search"
}, bn = {
  key: 0,
  class: "kx-err"
}, hn = { class: "kx-body" }, vn = {
  key: 0,
  class: "kx-loading"
}, yn = {
  key: 1,
  class: "kx-empty"
}, gn = { class: "kx-empty-ico" }, kn = { class: "kx-empty-actions" }, Cn = {
  key: 2,
  class: "kx-empty"
}, _n = { class: "kx-empty-ico" }, xn = { class: "kx-empty-sub" }, wn = { class: "kx-empty-actions" }, Sn = {
  key: 3,
  class: "kx-grid"
}, $n = ["aria-label", "onClick", "onKeydown"], Ln = { class: "kx-card-head" }, Dn = { class: "kx-ficon" }, En = { class: "kx-card-id" }, jn = ["title"], zn = { class: "kx-card-meta" }, Mn = ["title"], An = ["title"], In = { class: "kx-modal-head-icon" }, On = { class: "kx-modal-body" }, Bn = { class: "kx-modal-head-icon" }, Tn = { class: "kx-modal-head-text" }, Pn = { class: "kx-modal-head-title" }, Rn = { class: "kx-modal-head-sub" }, Fn = {
  key: 0,
  class: "kx-modal-body"
}, Hn = { class: "kx-field" }, Vn = { class: "wh-token" }, Un = { class: "kx-field" }, Nn = { class: "wh-token" }, Kn = { key: 0 }, Wn = { class: "wh-note" }, Zn = { class: "wh-facts" }, Yn = { class: "kx-field" }, Xn = ["disabled"], Gn = { class: "kx-field wh-schema" }, qn = { class: "wh-schema-edit" }, Jn = ["disabled"], Qn = {
  key: 0,
  class: "kx-err inline"
}, eo = /* @__PURE__ */ Se({
  __name: "Webhooks",
  setup(e) {
    const t = {
      header: { class: "kx-dialog-header" },
      content: { class: "kx-dialog-content" },
      footer: { class: "kx-dialog-footer" }
    }, n = A([]), o = A(!0), a = A(""), i = A(""), _ = A(!1), d = A(null), y = A({ label: "", schemaText: "" }), f = A(""), m = A(!1), b = A(!1), u = N(() => {
      const c = i.value.trim().toLowerCase();
      return c ? n.value.filter((r) => (r.label || r.webhook_id).toLowerCase().includes(c)) : n.value;
    }), p = N(() => pe(y.value.schemaText).schema || (d.value?.schema ?? {})), E = dn();
    async function C() {
      const c = E();
      o.value = !0, a.value = "";
      try {
        const r = await ct();
        c() && (n.value = r);
      } catch (r) {
        c() && (a.value = X(r, "could not load webhooks"));
      } finally {
        c() && (o.value = !1);
      }
    }
    function P(c) {
      return "POST /api/public/hooks/" + c;
    }
    function L(c) {
      return c.subscriber_count || 0;
    }
    function ae() {
      _.value = !0;
    }
    function je() {
      _.value = !1;
    }
    async function ze() {
      _.value = !1, await C();
    }
    function Y(c) {
      d.value = c, y.value = { label: c.label || "", schemaText: rt(c.schema || {}) }, f.value = "", b.value = !1;
    }
    function H() {
      d.value = null;
    }
    const se = N({
      get: () => d.value !== null,
      set: (c) => {
        c || H();
      }
    });
    async function Me(c, r) {
      try {
        await navigator.clipboard.writeText(c), I.toast({ severity: "success", summary: "Copied", detail: r });
      } catch {
        I.toast({ severity: "warn", summary: "Copy failed", detail: "Select and copy manually." });
      }
    }
    async function Ae() {
      const c = d.value;
      if (!c) return;
      const r = pe(y.value.schemaText);
      if (r.error) {
        f.value = r.error;
        return;
      }
      m.value = !0, f.value = "";
      try {
        await lt(c.webhook_id, { label: y.value.label.trim(), schema: r.schema }), I.toast({ severity: "success", summary: "Saved", detail: y.value.label.trim() || c.webhook_id }), H(), await C();
      } catch (l) {
        f.value = X(l, "save failed");
      } finally {
        m.value = !1;
      }
    }
    async function re(c) {
      if (await I.confirm({
        message: `Revoke “${c.label || c.webhook_id}”? The secret stops working and subscribed automations receive no further events. This can't be undone.`,
        header: "Revoke webhook",
        icon: "tabler:ban",
        acceptLabel: "Revoke",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      }))
        try {
          await dt(c.webhook_id), I.toast({ severity: "success", summary: "Revoked", detail: c.label || c.webhook_id }), d.value?.webhook_id === c.webhook_id && H(), await C();
        } catch (l) {
          a.value = X(l, "revoke failed"), I.toast({ severity: "error", summary: "Revoke failed", detail: a.value });
        }
    }
    async function le(c) {
      if (L(c) > 0) {
        I.toast({
          severity: "warn",
          summary: "In use",
          detail: `Used by ${L(c)} automation${L(c) === 1 ? "" : "s"}. Remove those first.`
        });
        return;
      }
      if (await I.confirm({
        message: `Remove “${c.label || c.webhook_id}”? This deletes the webhook and its endpoint. This can't be undone.`,
        header: "Remove webhook",
        icon: "tabler:trash",
        acceptLabel: "Remove",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      }))
        try {
          await ut(c.webhook_id), Ie(c.webhook_id), I.toast({ severity: "success", summary: "Deletion accepted", detail: c.label || c.webhook_id }), d.value?.webhook_id === c.webhook_id && H(), await C();
        } catch (l) {
          a.value = X(l, "delete failed"), I.toast({ severity: "error", summary: "Remove failed", detail: a.value });
        }
    }
    Ge(C);
    const { acceptDeletion: Ie } = xt(n, (c) => c.webhook_id, void 0, C);
    return (c, r) => (v(), k("div", un, [
      s("div", cn, [
        s("span", fn, x(n.value.length) + " webhook" + x(n.value.length !== 1 ? "s" : ""), 1),
        s("div", pn, [
          n.value.length ? (v(), k("div", mn, [
            g(h(S), {
              icon: "tabler:search",
              class: "kx-search-ico",
              "aria-hidden": "true"
            }),
            G(s("input", {
              "onUpdate:modelValue": r[0] || (r[0] = (l) => i.value = l),
              class: "kx-search-input",
              type: "text",
              placeholder: "Search webhooks…",
              "aria-label": "Search webhooks"
            }, null, 512), [
              [J, i.value]
            ])
          ])) : w("", !0),
          g(h(M), {
            type: "button",
            label: "New webhook",
            onClick: ae
          }, {
            icon: D(({ class: l }) => [
              g(h(S), {
                icon: "tabler:plus",
                class: j(l),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ])
      ]),
      a.value ? (v(), k("div", bn, x(a.value), 1)) : w("", !0),
      s("div", hn, [
        o.value && !n.value.length ? (v(), k("div", vn, [
          g(h(S), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          r[10] || (r[10] = O(" Loading webhooks… ", -1))
        ])) : n.value.length ? u.value.length ? (v(), k("div", Sn, [
          (v(!0), k(T, null, nt(u.value, (l) => (v(), k("div", {
            key: l.webhook_id,
            class: j(["kx-card", l.status === "revoked" && "is-revoked"]),
            tabindex: "0",
            role: "button",
            "aria-label": `Open ${l.label || "webhook"}`,
            onClick: (z) => !l.deleting_at && Y(l),
            onKeydown: [
              fe((z) => !l.deleting_at && Y(l), ["enter"]),
              fe(K((z) => !l.deleting_at && Y(l), ["prevent"]), ["space"])
            ]
          }, [
            g(gt, {
              state: l,
              onRetry: (z) => le(l)
            }, null, 8, ["state", "onRetry"]),
            s("div", Ln, [
              s("span", Dn, [
                g(h(S), {
                  icon: "tabler:webhook",
                  "aria-hidden": "true"
                })
              ]),
              s("div", En, [
                s("div", {
                  class: "kx-card-name",
                  title: l.label || "Webhook"
                }, x(l.label || "Webhook"), 9, jn),
                s("div", zn, [
                  s("span", {
                    class: j(["kx-chip kx-tag-sm", l.status === "active" ? "is-active" : "is-revoked"])
                  }, x(h(me)(l.status)), 3),
                  L(l) > 0 ? (v(), k("span", {
                    key: 0,
                    class: "kx-chip kx-tag-sm is-count",
                    title: `Used by ${L(l)} automation(s)`
                  }, [
                    g(h(S), {
                      icon: "tabler:plug-connected",
                      "aria-hidden": "true"
                    }),
                    O(" " + x(L(l)) + " automation" + x(L(l) === 1 ? "" : "s"), 1)
                  ], 8, Mn)) : w("", !0)
                ])
              ]),
              s("div", {
                class: "kx-card-actions",
                onClick: r[2] || (r[2] = K(() => {
                }, ["stop"]))
              }, [
                g(h(M), {
                  type: "button",
                  severity: "secondary",
                  outlined: "",
                  size: "small",
                  title: "Open",
                  "aria-label": `Open ${l.label || "webhook"}`,
                  onClick: (z) => !l.deleting_at && Y(l),
                  disabled: !!l.deleting_at
                }, {
                  icon: D(({ class: z }) => [
                    g(h(S), {
                      icon: "tabler:pencil",
                      class: j(z),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick", "disabled"]),
                l.status === "active" ? (v(), F(h(M), {
                  key: 0,
                  type: "button",
                  severity: "danger",
                  outlined: "",
                  size: "small",
                  title: "Revoke",
                  "aria-label": `Revoke ${l.label || "webhook"}`,
                  onClick: (z) => re(l),
                  disabled: !!l.deleting_at
                }, {
                  icon: D(({ class: z }) => [
                    g(h(S), {
                      icon: "tabler:ban",
                      class: j(z),
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
                  "aria-label": `Remove ${l.label || "webhook"}`,
                  disabled: !!l.deleting_at || L(l) > 0,
                  onClick: (z) => le(l)
                }, {
                  icon: D(({ class: z }) => [
                    g(h(S), {
                      icon: "tabler:trash",
                      class: j(z),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "disabled", "onClick"])
              ])
            ]),
            s("div", {
              class: "kx-card-desc",
              title: P(l.webhook_id)
            }, x(P(l.webhook_id)), 9, An)
          ], 42, $n))), 128))
        ])) : (v(), k("div", Cn, [
          s("div", _n, [
            g(h(S), {
              icon: "tabler:mood-empty",
              "aria-hidden": "true"
            })
          ]),
          r[13] || (r[13] = s("div", { class: "kx-empty-title" }, "No matches", -1)),
          s("div", xn, "Nothing matches “" + x(i.value) + "”. Try a different term or clear the search.", 1),
          s("div", wn, [
            g(h(M), {
              type: "button",
              severity: "secondary",
              outlined: "",
              label: "Clear search",
              onClick: r[1] || (r[1] = (l) => i.value = "")
            }, {
              icon: D(({ class: l }) => [
                g(h(S), {
                  icon: "tabler:x",
                  class: j(l),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ])) : (v(), k("div", yn, [
          s("div", gn, [
            g(h(S), {
              icon: "tabler:webhook",
              "aria-hidden": "true"
            })
          ]),
          r[11] || (r[11] = s("div", { class: "kx-empty-title" }, "No webhooks yet", -1)),
          r[12] || (r[12] = s("div", { class: "kx-empty-sub" }, "A webhook gives an external service a secret URL to POST to. Each request becomes a trigger event your automations can act on.", -1)),
          s("div", kn, [
            g(h(M), {
              type: "button",
              label: "New webhook",
              onClick: ae
            }, {
              icon: D(({ class: l }) => [
                g(h(S), {
                  icon: "tabler:plus",
                  class: j(l),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ]))
      ]),
      g(h(ne), {
        visible: _.value,
        "onUpdate:visible": r[3] || (r[3] = (l) => _.value = l),
        modal: "",
        "dismissable-mask": !0,
        class: "kx-dialog",
        pt: t,
        "aria-label": "New webhook"
      }, {
        header: D(() => [
          s("span", In, [
            g(h(S), {
              icon: "tabler:webhook",
              "aria-hidden": "true"
            })
          ]),
          r[14] || (r[14] = s("span", { class: "kx-modal-head-text" }, [
            s("span", { class: "kx-modal-head-title" }, "New webhook"),
            s("span", { class: "kx-modal-head-sub" }, "Name it and set the payload it accepts — the secret is shown once.")
          ], -1))
        ]),
        default: D(() => [
          s("div", On, [
            g(it, {
              onCreated: ze,
              onClose: je
            })
          ])
        ]),
        _: 1
      }, 8, ["visible"]),
      g(h(ne), {
        visible: se.value,
        "onUpdate:visible": r[9] || (r[9] = (l) => se.value = l),
        modal: "",
        class: "kx-dialog",
        pt: t,
        "aria-label": "Webhook detail"
      }, ot({
        default: D(() => [
          d.value ? (v(), k("div", Fn, [
            s("div", Hn, [
              r[15] || (r[15] = s("span", { class: "kx-field-lbl" }, [
                O("Endpoint URL "),
                s("span", { class: "kx-field-hint-inline" }, "— hand this to the sender")
              ], -1)),
              s("div", Vn, [
                s("code", null, x(h(be)(d.value.webhook_id)), 1),
                s("button", {
                  type: "button",
                  class: "wh-copy",
                  title: "Copy URL",
                  "aria-label": "Copy URL",
                  onClick: r[4] || (r[4] = (l) => Me(h(be)(d.value.webhook_id), "endpoint URL"))
                }, [
                  g(h(S), {
                    icon: "tabler:copy",
                    "aria-hidden": "true"
                  })
                ])
              ])
            ]),
            s("div", Un, [
              r[17] || (r[17] = s("span", { class: "kx-field-lbl" }, "Secret", -1)),
              s("div", Nn, [
                s("code", null, [
                  O(x(d.value.secret_prefix || "Not available"), 1),
                  d.value.secret_prefix ? (v(), k("span", Kn, "…")) : w("", !0)
                ])
              ]),
              s("p", Wn, [
                g(h(S), {
                  icon: "tabler:info-circle",
                  "aria-hidden": "true"
                }),
                r[16] || (r[16] = s("span", null, "The full secret is shown only when a webhook is created. To rotate it, revoke this webhook and create a new one.", -1))
              ])
            ]),
            s("dl", Zn, [
              d.value.created_at ? (v(), k(T, { key: 0 }, [
                r[18] || (r[18] = s("dt", null, "Created", -1)),
                s("dd", null, x(h(_e)(d.value.created_at)), 1)
              ], 64)) : w("", !0),
              d.value.last_used_at ? (v(), k(T, { key: 1 }, [
                r[19] || (r[19] = s("dt", null, "Last received", -1)),
                s("dd", null, x(h(_e)(d.value.last_used_at)), 1)
              ], 64)) : w("", !0),
              L(d.value) > 0 ? (v(), k(T, { key: 2 }, [
                r[20] || (r[20] = s("dt", null, "Used by", -1)),
                s("dd", null, x(L(d.value)) + " automation" + x(L(d.value) === 1 ? "" : "s"), 1)
              ], 64)) : w("", !0)
            ]),
            s("label", Yn, [
              r[21] || (r[21] = s("span", { class: "kx-field-lbl" }, [
                O("Name "),
                s("span", { class: "kx-field-hint-inline" }, "— shown in automation trigger pickers")
              ], -1)),
              G(s("input", {
                "onUpdate:modelValue": r[5] || (r[5] = (l) => y.value.label = l),
                class: "kx-input",
                type: "text",
                placeholder: "Customer events",
                disabled: d.value.status === "revoked",
                "data-test": "wh-name"
              }, null, 8, Xn), [
                [J, y.value.label]
              ])
            ]),
            s("div", Gn, [
              r[23] || (r[23] = s("span", { class: "kx-field-lbl" }, [
                O("Payload schema "),
                s("span", { class: "kx-field-hint-inline" }, "— the fields each inbound request must carry")
              ], -1)),
              g(st, { schema: p.value }, null, 8, ["schema"]),
              s("div", qn, [
                s("button", {
                  type: "button",
                  class: j(["wh-toggle", b.value && "is-open"]),
                  onClick: r[6] || (r[6] = (l) => b.value = !b.value)
                }, [
                  g(h(S), {
                    icon: "tabler:chevron-right",
                    "aria-hidden": "true"
                  }),
                  r[22] || (r[22] = O(" Edit as JSON Schema ", -1))
                ], 2),
                b.value ? G((v(), k("textarea", {
                  key: 0,
                  "onUpdate:modelValue": r[7] || (r[7] = (l) => y.value.schemaText = l),
                  class: "kx-input kx-textarea",
                  spellcheck: "false",
                  disabled: d.value.status === "revoked",
                  "data-test": "wh-schema"
                }, null, 8, Jn)), [
                  [J, y.value.schemaText]
                ]) : w("", !0)
              ])
            ]),
            f.value ? (v(), k("div", Qn, x(f.value), 1)) : w("", !0)
          ])) : w("", !0)
        ]),
        _: 2
      }, [
        d.value ? {
          name: "header",
          fn: D(() => [
            s("span", Bn, [
              g(h(S), {
                icon: "tabler:webhook",
                "aria-hidden": "true"
              })
            ]),
            s("span", Tn, [
              s("span", Pn, x(d.value.label || "Webhook"), 1),
              s("span", Rn, x(P(d.value.webhook_id)), 1)
            ]),
            s("span", {
              class: j(["kx-chip kx-tag-sm", d.value.status === "active" ? "is-active" : "is-revoked"])
            }, x(h(me)(d.value.status)), 3)
          ]),
          key: "0"
        } : void 0,
        d.value ? {
          name: "footer",
          fn: D(() => [
            d.value.status === "active" ? (v(), F(h(M), {
              key: 0,
              type: "button",
              severity: "danger",
              size: "small",
              class: "kx-foot-spacer",
              label: "Revoke",
              onClick: r[8] || (r[8] = (l) => re(d.value))
            }, {
              icon: D(({ class: l }) => [
                g(h(S), {
                  icon: "tabler:ban",
                  class: j(l),
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
              onClick: H
            }),
            d.value.status === "active" ? (v(), F(h(M), {
              key: 1,
              type: "button",
              label: "Save changes",
              loading: m.value,
              disabled: m.value,
              "data-test": "wh-save",
              onClick: Ae
            }, {
              icon: D(({ class: l }) => [
                g(h(S), {
                  icon: "tabler:device-floppy",
                  class: j(l),
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
}), ro = {
  rootComponent: eo,
  plugins: [qe]
};
export {
  ro as mountConfig
};
//# sourceMappingURL=lazy-mount-DRd6B8d1.js.map
