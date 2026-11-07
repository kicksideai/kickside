import { defineComponent as d, ref as c, onMounted as _, openBlock as a, createElementBlock as r, createElementVNode as t, createVNode as m, unref as v, toDisplayString as i, createTextVNode as p } from "vue";
import { api as h } from "@wippy-fe/proxy";
import { Icon as f } from "@iconify/vue";
const y = { class: "st" }, g = { class: "st-head" }, b = { class: "st-head-icon" }, k = { class: "st-title" }, C = {
  key: 0,
  class: "st-state"
}, w = {
  key: 1,
  class: "st-state st-error"
}, E = {
  key: 2,
  class: "st-body"
}, N = { class: "st-card" }, x = { class: "st-count" }, V = /* @__PURE__ */ d({
  __name: "starter",
  setup(B) {
    const e = c(null), l = c(!0), o = c("");
    async function u() {
      l.value = !0, o.value = "";
      try {
        const { data: s } = await h.get("/api/v1/starter/status");
        if (!s?.success) throw new Error(s?.error || "Could not load starter status.");
        e.value = { module: String(s.module), count: Number(s.count) || 0 };
      } catch (s) {
        e.value = null, o.value = s instanceof Error ? s.message : "Could not load starter status.";
      } finally {
        l.value = !1;
      }
    }
    return _(u), (s, n) => (a(), r("div", y, [
      t("div", g, [
        t("div", b, [
          m(v(f), { icon: "tabler:terminal-2" })
        ]),
        t("div", null, [
          t("h1", k, i(e.value?.module ?? "acme/starter"), 1),
          n[0] || (n[0] = t("p", { class: "st-sub" }, "Log entries written through the starter sink.", -1))
        ])
      ]),
      l.value ? (a(), r("div", C, "Loading…")) : o.value ? (a(), r("div", w, [
        p(i(o.value) + " ", 1),
        t("button", {
          class: "st-retry",
          type: "button",
          onClick: u
        }, "Retry")
      ])) : (a(), r("div", E, [
        t("div", N, [
          t("span", x, i(e.value?.count ?? 0), 1),
          n[1] || (n[1] = t("span", { class: "st-count-label" }, "log entries", -1))
        ])
      ]))
    ]));
  }
}), I = {
  rootComponent: V
};
export {
  I as mountConfig
};
//# sourceMappingURL=lazy-mount-DW9RDvwh.js.map
