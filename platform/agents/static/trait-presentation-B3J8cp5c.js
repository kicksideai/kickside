import { defineComponent as z, ref as x, watch as k, nextTick as L, onBeforeUnmount as $, openBlock as W, createElementBlock as B, normalizeStyle as S, renderSlot as _, createCommentVNode as R } from "vue";
const T = 2e3;
function H(t) {
  const o = t.margin ?? 8, e = t.gap ?? 4, s = Math.max(0, t.viewportWidth), n = Math.max(0, t.viewportHeight), a = Math.max(0, s - o * 2), l = Math.min(Math.max(0, t.requestedWidth), a), i = t.align === "right" ? t.anchor.right - l : t.anchor.left, d = Math.max(o, Math.min(i, s - o - l)), p = Math.max(0, n - t.anchor.bottom - e - o), v = Math.max(0, t.anchor.top - e - o), h = p < t.requestedMaxHeight && v > p ? "above" : "below", g = h === "above" ? v : p, f = Math.round(Math.min(Math.max(0, t.requestedMaxHeight), g)), u = Math.min(Math.max(0, t.panelHeight ?? f), f), r = h === "above" ? t.anchor.top - e - u : t.anchor.bottom + e, c = t.containingBlockOrigin ?? { left: 0, top: 0 };
  return {
    left: Math.round(d - c.left),
    width: Math.round(l),
    maxHeight: f,
    side: h,
    top: Math.round(r - c.top)
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
  setup(t, { emit: o }) {
    const e = t, s = o, n = x(null), a = x({ position: "fixed", visibility: "hidden" });
    function l() {
      const r = e.anchor, c = n.value;
      if (!r || !c) return;
      const b = r.getBoundingClientRect(), E = e.width === "anchor" ? Math.max(e.minWidth, b.width) : Math.max(e.minWidth, e.width), y = {
        anchor: b,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        requestedWidth: E,
        requestedMaxHeight: e.maxHeight,
        align: e.align,
        gap: e.gap
      }, M = H(y);
      Object.assign(c.style, {
        position: "fixed",
        left: "0px",
        top: "0px",
        right: "auto",
        bottom: "auto",
        width: `${M.width}px`,
        maxHeight: `${M.maxHeight}px`,
        visibility: "hidden"
      });
      const w = c.getBoundingClientRect(), m = H({
        ...y,
        containingBlockOrigin: { left: w.left, top: w.top },
        panelHeight: w.height
      }), O = {
        position: "fixed",
        left: `${m.left}px`,
        top: `${m.top}px`,
        width: `${m.width}px`,
        maxHeight: `${m.maxHeight}px`,
        "--anchored-panel-available-height": `${m.maxHeight}px`,
        margin: "0",
        zIndex: String(e.zIndex),
        visibility: "visible"
      };
      a.value = O;
    }
    let i = null, d = !1;
    function p() {
      d || !e.open || (d = !0, requestAnimationFrame(() => {
        d = !1, e.open && l();
      }));
    }
    function v() {
      typeof ResizeObserver > "u" || (i = new ResizeObserver(p), n.value && i.observe(n.value), e.anchor && i.observe(e.anchor));
    }
    function h() {
      i?.disconnect(), i = null, d = !1;
    }
    k(() => e.open, async (r) => {
      h(), r && (a.value = { position: "fixed", visibility: "hidden" }, await L(), l(), v());
    }, { immediate: !0 });
    function g(r) {
      if (!e.open) return;
      const c = r.composedPath();
      n.value && c.includes(n.value) || e.anchor && c.includes(e.anchor) || s("update:open", !1);
    }
    function f(r) {
      !e.open || r.key !== "Escape" || (r.preventDefault(), r.stopImmediatePropagation(), s("update:open", !1));
    }
    function u() {
      e.open && l();
    }
    return document.addEventListener("click", g), document.addEventListener("keydown", f, !0), window.addEventListener("resize", u), window.addEventListener("scroll", u, !0), $(() => {
      h(), document.removeEventListener("click", g), document.removeEventListener("keydown", f, !0), window.removeEventListener("resize", u), window.removeEventListener("scroll", u, !0);
    }), (r, c) => t.open ? (W(), B("div", {
      key: 0,
      ref_key: "panel",
      ref: n,
      class: "anchored-panel",
      style: S(a.value)
    }, [
      _(r.$slots, "default")
    ], 4)) : R("", !0);
  }
}), q = [
  { key: "tools", label: "tools" },
  { key: "behavior", label: "behavior" },
  { key: "memory", label: "memory" }
];
function P(t) {
  const o = x(/* @__PURE__ */ new Set()), e = (n) => o.value.has(n);
  function s(n) {
    const a = new Set(o.value);
    a.has(n) ? a.delete(n) : a.add(n), o.value = a;
  }
  return k(() => [...t()], (n) => {
    o.value = new Set([...o.value].filter((a) => n.includes(a)));
  }), { isTraitOpen: e, toggleTraitOpen: s };
}
function A(t) {
  const o = t.affects || {};
  return o.memory ? "memory" : o.behavior ? "behavior" : o.tools ? "tools" : "plain";
}
function D(t) {
  const o = t.affects || {};
  return q.filter((e) => o[e.key]);
}
function j(t, o) {
  const e = /* @__PURE__ */ new Map(), s = new Map(o.map((n) => [n.id, n]));
  for (const n of t.tool_details || []) s.set(n.id, n);
  for (const n of t.tools || []) {
    const a = new RegExp("^" + n.split("*").map((i) => i.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*") + "$"), l = [...s.values()].filter((i) => a.test(i.id));
    l.length || e.set(n, { id: n });
    for (const i of l) e.set(i.id, { id: i.id, tool: i });
  }
  return [...e.values()];
}
export {
  I as _,
  D as b,
  j as r,
  A as t,
  P as u
};
//# sourceMappingURL=trait-presentation-B3J8cp5c.js.map
