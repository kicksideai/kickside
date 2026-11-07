import { defineComponent as C, ref as l, onMounted as W, onBeforeUnmount as B, openBlock as r, createElementBlock as c, createElementVNode as o, createVNode as v, unref as u, createBlock as N, withCtx as x, createTextVNode as I, toDisplayString as L, createCommentVNode as S, nextTick as w } from "vue";
import { Icon as T } from "@iconify/vue";
import { loadByTagName as V } from "@wippy-fe/proxy";
import { a as M, u as A } from "./wc-runtime-KO3cNuNo.js";
import H from "primevue/message";
import P from "primevue/progressspinner";
const j = { class: "cw-root" }, q = { class: "cw-head" }, D = { class: "cw-head-icon" }, O = {
  key: 1,
  class: "cw-state"
}, U = {
  key: 2,
  class: "cw-section",
  "aria-label": "Event Workflows"
}, X = /* @__PURE__ */ C({
  __name: "ComponentWorkflows",
  setup(z) {
    const d = M(), k = A(), m = l(null), a = l(!0), s = l("");
    let i = null;
    function f() {
      return String(d.value?.componentInstanceId || d.value?.["component-instance-id"] || "").trim();
    }
    function p(t) {
      const e = t.detail;
      e?.route && k("navigate", { route: e.route });
    }
    async function y(t, e, g) {
      if (!t) return null;
      await V(e, { timeoutMs: 8e3 });
      const n = document.createElement(e);
      for (const [b, E] of Object.entries(g)) n.setAttribute(b, E);
      return n.addEventListener("navigate", p), n.style.display = "block", t.replaceChildren(n), n;
    }
    async function _() {
      if (!f()) {
        s.value = "Component is required.", a.value = !1;
        return;
      }
      a.value = !1, await w(), await h();
    }
    async function h() {
      const t = f();
      if (!(!t || a.value))
        try {
          await w(), i || (i = await y(m.value, "kickside-automation-manager", {
            "component-id": t,
            mode: "component"
          }));
        } catch {
          s.value = "Workflow controls could not load. Try refreshing this page.";
        }
    }
    return W(_), B(() => {
      i?.removeEventListener("navigate", p);
    }), (t, e) => (r(), c("div", j, [
      o("header", q, [
        o("span", D, [
          v(u(T), {
            icon: "tabler:route",
            "aria-hidden": "true"
          })
        ]),
        e[0] || (e[0] = o("span", { class: "cw-head-copy" }, [
          o("h1", null, "Workflows"),
          o("p", null, "Connect component events to typed Blocks or published Workflows.")
        ], -1))
      ]),
      s.value ? (r(), N(u(H), {
        key: 0,
        class: "cw-feedback",
        severity: "error",
        closable: !1
      }, {
        default: x(() => [
          I(L(s.value), 1)
        ]),
        _: 1
      })) : S("", !0),
      a.value ? (r(), c("div", O, [
        v(u(P), {
          class: "cw-spinner",
          "stroke-width": "4",
          "aria-label": "Loading Workflows"
        }),
        e[1] || (e[1] = o("span", null, "Loading Workflows…", -1))
      ])) : (r(), c("section", U, [
        o("div", {
          ref_key: "automationsHost",
          ref: m,
          class: "cw-host"
        }, null, 512)
      ]))
    ]));
  }
});
export {
  X as default
};
