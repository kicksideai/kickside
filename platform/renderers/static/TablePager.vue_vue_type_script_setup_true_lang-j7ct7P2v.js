import { shallowRef as h, ref as k, onBeforeUnmount as P, defineComponent as M, computed as x, openBlock as y, createElementBlock as $, createElementVNode as t, toDisplayString as r, unref as g, createTextVNode as w } from "vue";
function O() {
  const e = h(null), o = k(!1), l = k("");
  let u = null, s = 0;
  function c() {
    s++, u?.terminate(), u = null, e.value = null, o.value = !1, l.value = "";
  }
  function m() {
    c(), u = new Worker(new URL(
      /* @vite-ignore */
      "" + new URL("assets/preview.worker-D4Xg9bh0.js", import.meta.url).href,
      import.meta.url
    ), { type: "module" }), u.onmessage = (n) => {
      n.data.id === s && ("error" in n.data ? l.value = n.data.error : e.value = n.data.result, o.value = !1);
    }, u.onerror = (n) => {
      l.value = n.message || "Preview worker failed", o.value = !1;
    };
  }
  function b(n, z = []) {
    if (!u) throw new Error("Preview worker is not initialized");
    o.value = !0, l.value = "", u.postMessage(n, z);
  }
  function d(n) {
    m(), b({ id: ++s, action: "markdown", source: n });
  }
  function a(n) {
    m(), b({ id: ++s, action: "workbook", bytes: n }, [n]);
  }
  function i(n, z) {
    b({ id: ++s, action: "page", table: n, page: z });
  }
  return P(c), { result: e, loading: o, error: l, clear: c, markdown: d, workbook: a, page: i };
}
const v = 25, f = 20;
function C(e, o, l) {
  return Math.max(0, Math.min(Number.isFinite(e) ? Math.floor(e) : 0, Math.max(0, Math.ceil(o / l) - 1)));
}
const N = ["aria-label"], E = { class: "preview-axis" }, R = ["disabled", "aria-label"], L = ["max", "value", "disabled", "aria-label"], S = ["disabled", "aria-label"], B = { class: "preview-axis" }, U = ["disabled", "aria-label"], A = ["max", "value", "disabled", "aria-label"], D = ["disabled", "aria-label"], T = /* @__PURE__ */ M({
  __name: "TablePager",
  props: {
    size: {},
    page: {},
    busy: { type: Boolean }
  },
  emits: ["change"],
  setup(e, { emit: o }) {
    const l = e, u = o, s = x(() => Math.max(1, Math.ceil(l.size.rows / v))), c = x(() => Math.max(1, Math.ceil(l.size.columns / f)));
    function m(d, a) {
      const i = d === "row" ? l.size.rows : l.size.columns, n = d === "row" ? v : f;
      u("change", { ...l.page, [d]: C(a, i, n) });
    }
    function b(d, a) {
      m(d, Number(a.target.value) - 1);
    }
    return (d, a) => (y(), $("nav", {
      class: "preview-pager",
      "aria-label": `${e.size.name} pages`
    }, [
      t("strong", null, r(e.size.name), 1),
      t("div", E, [
        t("span", null, "Rows " + r(e.size.rows ? e.page.row * g(v) + 1 : 0) + "–" + r(Math.min((e.page.row + 1) * g(v), e.size.rows)) + " of " + r(e.size.rows.toLocaleString()), 1),
        t("button", {
          disabled: e.busy || e.page.row === 0,
          "aria-label": `${e.size.name} previous rows`,
          onClick: a[0] || (a[0] = (i) => m("row", e.page.row - 1))
        }, "Previous", 8, R),
        t("label", null, [
          a[6] || (a[6] = w("Page ", -1)),
          t("input", {
            type: "number",
            min: "1",
            max: s.value,
            value: e.page.row + 1,
            disabled: e.busy,
            "aria-label": `${e.size.name} row page`,
            onChange: a[1] || (a[1] = (i) => b("row", i))
          }, null, 40, L),
          w(" of " + r(s.value), 1)
        ]),
        t("button", {
          disabled: e.busy || e.page.row + 1 >= s.value,
          "aria-label": `${e.size.name} next rows`,
          onClick: a[2] || (a[2] = (i) => m("row", e.page.row + 1))
        }, "Next", 8, S)
      ]),
      t("div", B, [
        t("span", null, "Columns " + r(e.size.columns ? e.page.column * g(f) + 1 : 0) + "–" + r(Math.min((e.page.column + 1) * g(f), e.size.columns)) + " of " + r(e.size.columns.toLocaleString()), 1),
        t("button", {
          disabled: e.busy || e.page.column === 0,
          "aria-label": `${e.size.name} previous columns`,
          onClick: a[3] || (a[3] = (i) => m("column", e.page.column - 1))
        }, "Previous", 8, U),
        t("label", null, [
          a[7] || (a[7] = w("Page ", -1)),
          t("input", {
            type: "number",
            min: "1",
            max: c.value,
            value: e.page.column + 1,
            disabled: e.busy,
            "aria-label": `${e.size.name} column page`,
            onChange: a[4] || (a[4] = (i) => b("column", i))
          }, null, 40, A),
          w(" of " + r(c.value), 1)
        ]),
        t("button", {
          disabled: e.busy || e.page.column + 1 >= c.value,
          "aria-label": `${e.size.name} next columns`,
          onClick: a[5] || (a[5] = (i) => m("column", e.page.column + 1))
        }, "Next", 8, D)
      ])
    ], 8, N));
  }
});
export {
  T as _,
  O as u
};
//# sourceMappingURL=TablePager.vue_vue_type_script_setup_true_lang-j7ct7P2v.js.map
