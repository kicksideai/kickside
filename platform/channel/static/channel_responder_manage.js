import { W as l, a as p } from "./wc-runtime-h8e5VJvv.js";
import { s as d, P as c } from "./styles-CcS7s8Kk.js";
import { Icon as i } from "@iconify/vue";
import { defineAsyncComponent as u, defineComponent as m, h as n, onMounted as f } from "vue";
import { define as y } from "@wippy-fe/proxy";
const g = 3e4, a = "display:flex;align-items:center;justify-content:center;min-height:2rem;font-size:.875rem;", h = "position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;";
function C(t) {
  matchMedia("(prefers-reduced-motion: reduce)").matches || t.el.animate({ rotate: ["0deg", "360deg"] }, { duration: 1e3, iterations: 1 / 0 });
}
function x(t, e, o) {
  const r = o();
  f(() => r("error", { message: t, error: e }));
}
function v(t, e, o) {
  return u({
    loader: t,
    loadingComponent: {
      render: () => n("span", {
        role: "status",
        "aria-label": e.loading,
        style: `${a}color:var(--p-text-muted-color);`
      }, n("span", { style: "display:inline-flex;", onVnodeMounted: C }, n(i, { icon: "tabler:loader-2", "aria-hidden": "true" })))
    },
    errorComponent: m({
      props: { error: { type: Error, required: !0 } },
      setup(r) {
        return x(e.failed, r.error, o), () => n("span", {
          role: "alert",
          title: e.iconOnly ? e.failed : void 0,
          style: `${a}color:var(--p-danger-500);`
        }, e.iconOnly ? [n(i, { icon: "tabler:alert-circle", "aria-hidden": "true" }), n("span", { style: h }, e.failed)] : e.failed);
      }
    }),
    delay: 200,
    timeout: g,
    suspensible: !1
  });
}
const M = v(
  () => import("./ChannelResponderManage-Bxvw2mP1.js"),
  { loading: "Loading channel responder settings…", failed: "Could not load the channel responder settings. Reload the page to try again." },
  p
), w = {
  type: "object",
  properties: {
    config: { type: "object" },
    value: { type: "object" }
  }
};
class s extends l {
  static get wippyConfig() {
    return {
      propsSchema: w,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: d
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
//# sourceMappingURL=channel_responder_manage.js.map
