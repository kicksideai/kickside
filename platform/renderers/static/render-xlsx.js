import { u as U, W as B } from "./wc-runtime-h8e5VJvv.js";
import { defineComponent as R, ref as S, onBeforeUnmount as V, watch as z, openBlock as s, createElementBlock as a, unref as e, createVNode as v, createElementVNode as u, createCommentVNode as m, toDisplayString as y, Fragment as f, renderList as g, normalizeClass as N } from "vue";
import { Icon as k } from "@iconify/vue";
import { api as q, define as L } from "@wippy-fe/proxy";
import { u as P, _ as T } from "./TablePager.vue_vue_type_script_setup_true_lang-j7ct7P2v.js";
import { s as W } from "./styles-HTuIrRec.js";
const X = { class: "xlsxv" }, $ = {
  key: 0,
  class: "rv-state"
}, j = {
  key: 1,
  class: "rv-state err"
}, A = {
  key: 0,
  class: "xlsxv-tabs",
  role: "tablist"
}, D = ["aria-selected", "disabled", "onClick"], F = ["aria-busy"], I = ["aria-label"], K = /* @__PURE__ */ R({
  __name: "RenderXlsx",
  setup(C) {
    const h = U(), l = P(), { result: t, loading: c, error: b } = l, d = S(!1);
    let i = 0;
    V(() => {
      i++;
    });
    async function w() {
      const p = ++i;
      l.clear(), d.value = !1;
      const o = h.value?.sourceUrl;
      if (o) {
        d.value = !0;
        try {
          const { data: r } = await q.get(o, { responseType: "arraybuffer" });
          if (p !== i) return;
          if (!(r instanceof ArrayBuffer)) throw new Error("Spreadsheet response must contain workbook bytes");
          l.workbook(r);
        } catch (r) {
          if (p !== i) return;
          b.value = r instanceof Error ? r.message : "Could not read spreadsheet";
        } finally {
          p === i && (d.value = !1);
        }
      }
    }
    return z(() => h.value?.sourceUrl, w, { immediate: !0 }), (p, o) => (s(), a("div", X, [
      d.value || e(c) && !e(t) ? (s(), a("div", $, [
        v(e(k), {
          icon: "tabler:loader-2",
          class: "spin",
          "aria-hidden": "true"
        }),
        o[1] || (o[1] = u("span", null, "Reading spreadsheet…", -1))
      ])) : m("", !0),
      e(b) ? (s(), a("div", j, [
        v(e(k), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        u("span", null, y(e(b)), 1)
      ])) : m("", !0),
      e(t)?.kind === "workbook" && e(t).tables.length ? (s(), a(f, { key: 2 }, [
        e(t).tables.length > 1 ? (s(), a("div", A, [
          (s(!0), a(f, null, g(e(t).tables, (r, n) => (s(), a("button", {
            key: r.name,
            class: N(["xlsxv-tab", { on: n === e(t).active }]),
            role: "tab",
            "aria-selected": n === e(t).active,
            disabled: e(c),
            onClick: (_) => e(l).page(n, e(t).pages[n])
          }, y(r.name), 11, D))), 128))
        ])) : m("", !0),
        v(T, {
          size: e(t).tables[e(t).active],
          page: e(t).pages[e(t).active],
          busy: e(c),
          onChange: o[0] || (o[0] = (r) => e(l).page(e(t).active, r))
        }, null, 8, ["size", "page", "busy"]),
        u("div", {
          class: "xlsxv-sheet",
          "aria-busy": e(c)
        }, [
          u("table", {
            "aria-label": e(t).tables[e(t).active].name
          }, [
            u("tbody", null, [
              (s(!0), a(f, null, g(e(t).cells, (r, n) => (s(), a("tr", { key: n }, [
                (s(!0), a(f, null, g(r, (_, E) => (s(), a("td", { key: E }, y(_), 1))), 128))
              ]))), 128))
            ])
          ], 8, I)
        ], 8, F)
      ], 64)) : m("", !0)
    ]));
  }
}), G = {
  type: "object",
  properties: {
    "source-url": { type: "string", default: "", description: "URL to fetch the workbook bytes from (auth via proxy)." }
  }
};
class x extends B {
  static get wippyConfig() {
    return {
      propsSchema: G,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: W
    };
  }
  static get vueConfig() {
    return { rootComponent: K };
  }
}
async function Z() {
  return x;
}
L(import.meta.url, x);
export {
  Z as webComponent
};
//# sourceMappingURL=render-xlsx.js.map
