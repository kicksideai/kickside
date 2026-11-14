import { W as d, a as l } from "./wc-runtime-h8e5VJvv.js";
import { s as p, P as c } from "./styles-Ce32aXEC.js";
import { Icon as r } from "@iconify/vue";
import { defineAsyncComponent as m, defineComponent as u, h as n, onMounted as f } from "vue";
import { define as y } from "@wippy-fe/proxy";
const g = 3e4, a = "display:flex;align-items:center;justify-content:center;min-height:2rem;font-size:.875rem;", h = "position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;";
function C(t) {
  matchMedia("(prefers-reduced-motion: reduce)").matches || t.el.animate({ rotate: ["0deg", "360deg"] }, { duration: 1e3, iterations: 1 / 0 });
}
function x(t, e, o) {
  const i = o();
  f(() => i("error", { message: t, error: e }));
}
function v(t, e, o) {
  return m({
    loader: t,
    loadingComponent: {
      render: () => n("span", {
        role: "status",
        "data-lazy-state": "loading",
        "aria-label": e.loading,
        style: `${a}color:var(--p-text-muted-color);`
      }, n("span", { style: "display:inline-flex;", onVnodeMounted: C }, n(r, { icon: "tabler:loader-2", "aria-hidden": "true" })))
    },
    errorComponent: u({
      props: { error: { type: Error, required: !0 } },
      setup(i) {
        return x(e.failed, i.error, o), () => n("span", {
          role: "alert",
          "data-lazy-state": "failed",
          title: e.iconOnly ? e.failed : void 0,
          style: `${a}color:var(--p-danger-500);`
        }, e.iconOnly ? [n(r, { icon: "tabler:alert-circle", "aria-hidden": "true" }), n("span", { style: h }, e.failed)] : e.failed);
      }
    }),
    delay: e.immediate ? 0 : 200,
    timeout: g,
    suspensible: !1
  });
}
const M = v(
  () => import("./SyncManage-BnJBHHpV.js"),
  { loading: "Loading data sync…", failed: "Could not load the data sync. Reload the page to try again." },
  l
), S = {
  type: "object",
  properties: {
    // Config-host convention: { id } names the installed data sync; value is its alias.
    config: { type: "object" },
    value: { type: "object" }
  }
};
class s extends d {
  static get wippyConfig() {
    return {
      propsSchema: S,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: p
    };
  }
  static get vueConfig() {
    return { rootComponent: M, plugins: [c] };
  }
}
async function V() {
  return s;
}
y(import.meta.url, s);
export {
  V as webComponent
};
//# sourceMappingURL=sync_manage.js.map
