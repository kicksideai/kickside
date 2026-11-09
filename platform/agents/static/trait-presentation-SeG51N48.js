import { defineComponent as z, ref as x, watch as L, nextTick as $, onBeforeUnmount as W, openBlock as B, createElementBlock as C, normalizeStyle as O, renderSlot as R, createCommentVNode as S } from "vue";
const T = 2e3;
function H(t) {
  const n = t.margin ?? 8, e = t.gap ?? 4, o = Math.max(0, t.viewportWidth), i = Math.max(0, t.viewportHeight), l = Math.max(0, o - n * 2), a = Math.min(Math.max(0, t.requestedWidth), l), c = t.align === "right" ? t.anchor.right - a : t.anchor.left, d = Math.max(n, Math.min(c, o - n - a)), m = Math.max(0, i - t.anchor.bottom - e - n), v = Math.max(0, t.anchor.top - e - n), h = m < t.requestedMaxHeight && v > m ? "above" : "below", g = h === "above" ? v : m, f = Math.round(Math.min(Math.max(0, t.requestedMaxHeight), g)), u = Math.min(Math.max(0, t.panelHeight ?? f), f), r = h === "above" ? t.anchor.top - e - u : t.anchor.bottom + e, s = t.containingBlockOrigin ?? { left: 0, top: 0 };
  return {
    left: Math.round(d - s.left),
    width: Math.round(a),
    maxHeight: f,
    side: h,
    top: Math.round(r - s.top)
  };
}
const I = /* @__PURE__ */ z({
  __name: "AnchoredPanel",
  props: {
    open: { type: Boolean },
    anchor: {},
    align: { default: "left" },
    width: { default: "anchor" },
    minWidth: { default: 0 },
    maxHeight: { default: 340 },
    gap: { default: 4 },
    zIndex: { default: T }
  },
  emits: ["update:open"],
  setup(t, { emit: n }) {
    const e = t, o = n, i = x(null), l = x({ position: "fixed", visibility: "hidden" });
    function a() {
      const r = e.anchor, s = i.value;
      if (!r || !s) return;
      const b = r.getBoundingClientRect(), k = e.width === "anchor" ? Math.max(e.minWidth, b.width) : Math.max(e.minWidth, e.width), y = {
        anchor: b,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        requestedWidth: k,
        requestedMaxHeight: e.maxHeight,
        align: e.align,
        gap: e.gap
      }, M = H(y);
      Object.assign(s.style, {
        position: "fixed",
        left: "0px",
        top: "0px",
        right: "auto",
        bottom: "auto",
        width: `${M.width}px`,
        maxHeight: `${M.maxHeight}px`,
        visibility: "hidden"
      });
      const w = s.getBoundingClientRect(), p = H({
        ...y,
        containingBlockOrigin: { left: w.left, top: w.top },
        panelHeight: w.height
      }), E = {
        position: "fixed",
        left: `${p.left}px`,
        top: `${p.top}px`,
        width: `${p.width}px`,
        maxHeight: `${p.maxHeight}px`,
        "--anchored-panel-available-height": `${p.maxHeight}px`,
        margin: "0",
        zIndex: String(e.zIndex),
        visibility: "visible"
      };
      l.value = E;
    }
    let c = null, d = !1;
    function m() {
      d || !e.open || (d = !0, requestAnimationFrame(() => {
        d = !1, e.open && a();
      }));
    }
    function v() {
      typeof ResizeObserver > "u" || (c = new ResizeObserver(m), i.value && c.observe(i.value), e.anchor && c.observe(e.anchor));
    }
    function h() {
      c?.disconnect(), c = null, d = !1;
    }
    L(() => e.open, async (r) => {
      h(), r && (l.value = { position: "fixed", visibility: "hidden" }, await $(), a(), v());
    }, { immediate: !0 });
    function g(r) {
      if (!e.open) return;
      const s = r.composedPath();
      i.value && s.includes(i.value) || e.anchor && s.includes(e.anchor) || o("update:open", !1);
    }
    function f(r) {
      e.open && r.key === "Escape" && o("update:open", !1);
    }
    function u() {
      e.open && a();
    }
    return document.addEventListener("click", g), document.addEventListener("keydown", f), window.addEventListener("resize", u), window.addEventListener("scroll", u, !0), W(() => {
      h(), document.removeEventListener("click", g), document.removeEventListener("keydown", f), window.removeEventListener("resize", u), window.removeEventListener("scroll", u, !0);
    }), (r, s) => t.open ? (B(), C("div", {
      key: 0,
      ref_key: "panel",
      ref: i,
      class: "anchored-panel",
      style: O(l.value)
    }, [
      R(r.$slots, "default")
    ], 4)) : S("", !0);
  }
}), _ = [
  { key: "tools", label: "tools" },
  { key: "behavior", label: "behavior" },
  { key: "memory", label: "memory" }
];
function A() {
  const t = x(/* @__PURE__ */ new Set()), n = (o) => t.value.has(o);
  function e(o) {
    const i = new Set(t.value);
    i.has(o) ? i.delete(o) : i.add(o), t.value = i;
  }
  return { collapsedTraits: t, isTraitCollapsed: n, toggleTraitCollapsed: e };
}
function P(t) {
  const n = t.affects || {};
  return n.memory ? "memory" : n.behavior ? "behavior" : n.tools ? "tools" : "plain";
}
function D(t) {
  const n = t.affects || {};
  return _.filter((e) => n[e.key]);
}
function j(t, n) {
  const e = /* @__PURE__ */ new Map();
  for (const o of t.tools || []) {
    const i = new RegExp("^" + o.split("*").map((a) => a.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*") + "$"), l = n.filter((a) => i.test(a.id));
    l.length || e.set(o, { id: o });
    for (const a of l) e.set(a.id, { id: a.id, tool: a });
  }
  return [...e.values()];
}
export {
  I as _,
  D as b,
  j as r,
  P as t,
  A as u
};
//# sourceMappingURL=trait-presentation-SeG51N48.js.map
