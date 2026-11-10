import { defineComponent as z, ref as H, watch as L, nextTick as W, onBeforeUnmount as B, openBlock as _, createElementBlock as $, normalizeStyle as q, renderSlot as O, createCommentVNode as R } from "vue";
const C = 2e3;
function y(t) {
  const a = t.margin ?? 8, e = t.gap ?? 4, m = Math.max(0, t.viewportWidth), i = Math.max(0, t.viewportHeight), p = Math.max(0, m - a * 2), r = Math.min(Math.max(0, t.requestedWidth), p), s = t.align === "right" ? t.anchor.right - r : t.anchor.left, c = Math.max(a, Math.min(s, m - a - r)), u = Math.max(0, i - t.anchor.bottom - e - a), g = Math.max(0, t.anchor.top - e - a), l = u < t.requestedMaxHeight && g > u ? "above" : "below", v = l === "above" ? g : u, d = Math.round(Math.min(Math.max(0, t.requestedMaxHeight), v)), h = Math.min(Math.max(0, t.panelHeight ?? d), d), n = l === "above" ? t.anchor.top - e - h : t.anchor.bottom + e, o = t.containingBlockOrigin ?? { left: 0, top: 0 };
  return {
    left: Math.round(c - o.left),
    width: Math.round(r),
    maxHeight: d,
    side: l,
    top: Math.round(n - o.top)
  };
}
const P = /* @__PURE__ */ z({
  __name: "AnchoredPanel",
  props: {
    open: { type: Boolean },
    anchor: {},
    align: { default: "left" },
    width: { default: "anchor" },
    minWidth: { default: 0 },
    maxHeight: { default: 340 },
    gap: { default: 4 },
    zIndex: { default: C }
  },
  emits: ["update:open"],
  setup(t, { emit: a }) {
    const e = t, m = a, i = H(null), p = H({ position: "fixed", visibility: "hidden" });
    function r() {
      const n = e.anchor, o = i.value;
      if (!n || !o) return;
      const w = n.getBoundingClientRect(), k = e.width === "anchor" ? Math.max(e.minWidth, w.width) : Math.max(e.minWidth, e.width), b = {
        anchor: w,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        requestedWidth: k,
        requestedMaxHeight: e.maxHeight,
        align: e.align,
        gap: e.gap
      }, M = y(b);
      Object.assign(o.style, {
        position: "fixed",
        left: "0px",
        top: "0px",
        right: "auto",
        bottom: "auto",
        width: `${M.width}px`,
        maxHeight: `${M.maxHeight}px`,
        visibility: "hidden"
      });
      const x = o.getBoundingClientRect(), f = y({
        ...b,
        containingBlockOrigin: { left: x.left, top: x.top },
        panelHeight: x.height
      }), E = {
        position: "fixed",
        left: `${f.left}px`,
        top: `${f.top}px`,
        width: `${f.width}px`,
        maxHeight: `${f.maxHeight}px`,
        "--anchored-panel-available-height": `${f.maxHeight}px`,
        margin: "0",
        zIndex: String(e.zIndex),
        visibility: "visible"
      };
      p.value = E;
    }
    let s = null, c = !1;
    function u() {
      c || !e.open || (c = !0, requestAnimationFrame(() => {
        c = !1, e.open && r();
      }));
    }
    function g() {
      typeof ResizeObserver > "u" || (s = new ResizeObserver(u), i.value && s.observe(i.value), e.anchor && s.observe(e.anchor));
    }
    function l() {
      s?.disconnect(), s = null, c = !1;
    }
    L(() => e.open, async (n) => {
      l(), n && (p.value = { position: "fixed", visibility: "hidden" }, await W(), r(), g());
    }, { immediate: !0 });
    function v(n) {
      if (!e.open) return;
      const o = n.composedPath();
      i.value && o.includes(i.value) || e.anchor && o.includes(e.anchor) || m("update:open", !1);
    }
    function d(n) {
      !e.open || n.key !== "Escape" || (n.preventDefault(), n.stopImmediatePropagation(), m("update:open", !1));
    }
    function h() {
      e.open && r();
    }
    return document.addEventListener("click", v), document.addEventListener("keydown", d, !0), window.addEventListener("resize", h), window.addEventListener("scroll", h, !0), B(() => {
      l(), document.removeEventListener("click", v), document.removeEventListener("keydown", d, !0), window.removeEventListener("resize", h), window.removeEventListener("scroll", h, !0);
    }), (n, o) => t.open ? (_(), $("div", {
      key: 0,
      ref_key: "panel",
      ref: i,
      class: "anchored-panel",
      style: q(p.value)
    }, [
      O(n.$slots, "default")
    ], 4)) : R("", !0);
  }
});
export {
  P as _
};
//# sourceMappingURL=AnchoredPanel.vue_vue_type_script_setup_true_lang-CU5LLZRq.js.map
