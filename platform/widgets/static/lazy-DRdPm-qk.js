import { Icon as i } from "@iconify/vue";
import { defineAsyncComponent as d, defineComponent as l, h as t, onMounted as s } from "vue";
const p = 3e4, a = "display:flex;align-items:center;justify-content:center;min-height:2rem;font-size:.875rem;", c = "position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;";
function u(n) {
  matchMedia("(prefers-reduced-motion: reduce)").matches || n.el.animate({ rotate: ["0deg", "360deg"] }, { duration: 1e3, iterations: 1 / 0 });
}
function f(n, e, o) {
  const r = o();
  s(() => r("error", { message: n, error: e }));
}
function h(n, e, o) {
  return d({
    loader: n,
    loadingComponent: {
      render: () => t("span", {
        role: "status",
        "aria-label": e.loading,
        style: `${a}color:var(--p-text-muted-color);`
      }, t("span", { style: "display:inline-flex;", onVnodeMounted: u }, t(i, { icon: "tabler:loader-2", "aria-hidden": "true" })))
    },
    errorComponent: l({
      props: { error: { type: Error, required: !0 } },
      setup(r) {
        return f(e.failed, r.error, o), () => t("span", {
          role: "alert",
          title: e.iconOnly ? e.failed : void 0,
          style: `${a}color:var(--p-danger-500);`
        }, e.iconOnly ? [t(i, { icon: "tabler:alert-circle", "aria-hidden": "true" }), t("span", { style: c }, e.failed)] : e.failed);
      }
    }),
    delay: 200,
    timeout: p,
    suspensible: !1
  });
}
export {
  h as l
};
//# sourceMappingURL=lazy-DRdPm-qk.js.map
