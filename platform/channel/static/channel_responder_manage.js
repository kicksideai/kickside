import { W as l, a as d } from "./wc-runtime-h8e5VJvv.js";
import { s as p, P as c } from "./styles-CemDhX8n.js";
import { Icon as i } from "@iconify/vue";
import { defineAsyncComponent as m, defineComponent as u, h as n, onMounted as f } from "vue";
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
  return m({
    loader: t,
    loadingComponent: {
      render: () => n("span", {
        role: "status",
        "data-lazy-state": "loading",
        "aria-label": e.loading,
        style: `${a}color:var(--p-text-muted-color);`
      }, n("span", { style: "display:inline-flex;", onVnodeMounted: C }, n(i, { icon: "tabler:loader-2", "aria-hidden": "true" })))
    },
    errorComponent: u({
      props: { error: { type: Error, required: !0 } },
      setup(r) {
        return x(e.failed, r.error, o), () => n("span", {
          role: "alert",
          "data-lazy-state": "failed",
          title: e.iconOnly ? e.failed : void 0,
          style: `${a}color:var(--p-danger-500);`
        }, e.iconOnly ? [n(i, { icon: "tabler:alert-circle", "aria-hidden": "true" }), n("span", { style: h }, e.failed)] : e.failed);
      }
    }),
    delay: e.immediate ? 0 : 200,
    timeout: g,
    suspensible: !1
  });
}
const M = v(
  () => import("./ChannelResponderManage-CdTSTs83.js"),
  { loading: "Loading channel responder settings…", failed: "Could not load the channel responder settings. Reload the page to try again." },
  d
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
      inlineCss: p
    };
  }
  static get vueConfig() {
    return { rootComponent: M, plugins: [c] };
  }
}
async function R() {
  return s;
}
y(import.meta.url, s);
export {
  R as webComponent
};
//# sourceMappingURL=channel_responder_manage.js.map
