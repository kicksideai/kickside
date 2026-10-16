import { u as E, W as U, s as B } from "./styles-ciEHWahf.js";
import { defineComponent as R, ref as S, onBeforeUnmount as V, watch as z, openBlock as r, createElementBlock as a, unref as e, createVNode as v, createElementVNode as u, createCommentVNode as m, toDisplayString as y, Fragment as f, renderList as g, normalizeClass as N } from "vue";
import { Icon as k } from "@iconify/vue";
import { api as q, define as L } from "@wippy-fe/proxy";
import { u as P, _ as T } from "./TablePager.vue_vue_type_script_setup_true_lang-j7ct7P2v.js";
const W = { class: "xlsxv" }, X = {
  key: 0,
  class: "rv-state"
}, $ = {
  key: 1,
  class: "rv-state err"
}, j = {
  key: 0,
  class: "xlsxv-tabs",
  role: "tablist"
}, A = ["aria-selected", "disabled", "onClick"], D = ["aria-busy"], F = ["aria-label"], I = /* @__PURE__ */ R({
  __name: "RenderXlsx",
  setup(x) {
    const h = E(), l = P(), { result: t, loading: c, error: b } = l, d = S(!1);
    let i = 0;
    V(() => {
      i++;
    });
    async function C() {
      const p = ++i;
      l.clear(), d.value = !1;
      const o = h.value?.sourceUrl;
      if (o) {
        d.value = !0;
        try {
          const { data: s } = await q.get(o, { responseType: "arraybuffer" });
          if (p !== i) return;
          if (!(s instanceof ArrayBuffer)) throw new Error("Spreadsheet response must contain workbook bytes");
          l.workbook(s);
        } catch (s) {
          if (p !== i) return;
          b.value = s instanceof Error ? s.message : "Could not read spreadsheet";
        } finally {
          p === i && (d.value = !1);
        }
      }
    }
    return z(() => h.value?.sourceUrl, C, { immediate: !0 }), (p, o) => (r(), a("div", W, [
      d.value || e(c) && !e(t) ? (r(), a("div", X, [
        v(e(k), {
          icon: "tabler:loader-2",
          class: "spin",
          "aria-hidden": "true"
        }),
        o[1] || (o[1] = u("span", null, "Reading spreadsheet…", -1))
      ])) : m("", !0),
      e(b) ? (r(), a("div", $, [
        v(e(k), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        u("span", null, y(e(b)), 1)
      ])) : m("", !0),
      e(t)?.kind === "workbook" && e(t).tables.length ? (r(), a(f, { key: 2 }, [
        e(t).tables.length > 1 ? (r(), a("div", j, [
          (r(!0), a(f, null, g(e(t).tables, (s, n) => (r(), a("button", {
            key: s.name,
            class: N(["xlsxv-tab", { on: n === e(t).active }]),
            role: "tab",
            "aria-selected": n === e(t).active,
            disabled: e(c),
            onClick: (_) => e(l).page(n, e(t).pages[n])
          }, y(s.name), 11, A))), 128))
        ])) : m("", !0),
        v(T, {
          size: e(t).tables[e(t).active],
          page: e(t).pages[e(t).active],
          busy: e(c),
          onChange: o[0] || (o[0] = (s) => e(l).page(e(t).active, s))
        }, null, 8, ["size", "page", "busy"]),
        u("div", {
          class: "xlsxv-sheet",
          "aria-busy": e(c)
        }, [
          u("table", {
            "aria-label": e(t).tables[e(t).active].name
          }, [
            u("tbody", null, [
              (r(!0), a(f, null, g(e(t).cells, (s, n) => (r(), a("tr", { key: n }, [
                (r(!0), a(f, null, g(s, (_, w) => (r(), a("td", { key: w }, y(_), 1))), 128))
              ]))), 128))
            ])
          ], 8, F)
        ], 8, D)
      ], 64)) : m("", !0)
    ]));
  }
}), K = {
  type: "object",
  properties: {
    "source-url": { type: "string", default: "", description: "URL to fetch the workbook bytes from (auth via proxy)." }
  }
};
class G extends U {
  static get wippyConfig() {
    return {
      propsSchema: K,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: B
    };
  }
  static get vueConfig() {
    return { rootComponent: I };
  }
}
L(import.meta.url, G);
//# sourceMappingURL=render-xlsx.js.map
