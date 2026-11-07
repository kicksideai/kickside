import { u as P, a as I, W as A } from "./wc-runtime-h8e5VJvv.js";
import { s as M, P as N } from "./styles-C_e6PZ5y.js";
import { computed as v, watch as h, defineComponent as T, ref as c, onMounted as x, openBlock as m, createElementBlock as f, withModifiers as O, toDisplayString as V, createCommentVNode as R, createVNode as j, unref as B } from "vue";
import { loadByTagName as _, api as F, define as L } from "@wippy-fe/proxy";
import { u as U, e as k, _ as z } from "./SyncPipeline.vue_vue_type_script_setup_true_lang-CoUNQyHE.js";
import "@iconify/vue";
function d(r) {
  if (r == null || r === "") return {};
  const t = typeof r == "string" ? JSON.parse(r) : r;
  if (!t || typeof t != "object" || Array.isArray(t)) throw new Error("Install input must be an object.");
  return t;
}
function G(r) {
  return v(() => {
    const t = r.value;
    return t ? (typeof t.parentId == "string" ? t.parentId : "").trim() : "";
  });
}
function H(r, t, s) {
  h(
    () => r.value?.submitNonce,
    (n, l) => {
      n == null || n === "" || n === l || s?.value || t();
    }
  );
}
const K = {
  key: 0,
  class: "kx-2p-r-note"
}, W = {
  key: 0,
  class: "kx-alert",
  role: "alert"
}, D = "kickside.sync:sync", J = "wc-schema-form", Y = "kickside-transform-assist", $ = /* @__PURE__ */ T({
  __name: "SyncCreate",
  setup(r) {
    const t = P(), s = I(), n = U({ managed: !1 }), l = c(!0), u = c(!1);
    h(u, (o) => s("submit-state", { saving: o }));
    const a = c(""), p = c(""), g = c(!1);
    H(t, y, u);
    const E = v(() => t.value.typeId || D), S = G(t), b = v(() => t.value.generationPolicy);
    async function y() {
      if (l.value || u.value) return;
      if (p.value) {
        s("automation-installed", { success: !1, error: p.value });
        return;
      }
      const o = n.validationError.value;
      if (o) {
        a.value = o, s("automation-installed", { success: !1, error: o });
        return;
      }
      u.value = !0, a.value = "";
      try {
        const { data: e } = await F.post(
          "/api/v1/automations",
          { type: E.value, parent_id: S.value || void 0, input: n.currentInput() }
        );
        if (!e?.success) {
          const i = typeof e?.error == "string" ? e.error : e?.error?.message;
          throw new Error(i || "install failed");
        }
        s("automation-installed", { success: !0, id: e.id }), s("created", { id: e.id });
      } catch (e) {
        const i = k(e, "install failed");
        a.value = i, s("automation-installed", { success: !1, error: i });
      } finally {
        u.value = !1;
      }
    }
    return x(async () => {
      try {
        await Promise.all([
          _(J, { timeoutMs: 8e3 }),
          _(Y, { timeoutMs: 8e3 })
        ]);
        const o = await n.loadCatalog();
        if (o) throw new Error(o);
        const e = d(t.value.input);
        if (typeof e.title == "string" && (n.title.value = e.title), e.trigger !== void 0) {
          const i = d(e.trigger);
          if (!n.sources.value.some((w) => w.id === i.source))
            throw new Error("The selected source is unavailable.");
          n.triggerSeed.value = i;
        }
        if (typeof e.sink_port == "string") {
          if (!n.sinks.value.some((i) => i.id === e.sink_port))
            throw new Error("The selected destination is unavailable.");
          n.sinkId.value = e.sink_port, n.sinkConfig.value = d(e.sink_config), g.value = !0;
        }
      } catch (o) {
        p.value = k(o, "Unable to initialize the sync form."), a.value = p.value;
      } finally {
        l.value = !1;
      }
    }), (o, e) => l.value ? (m(), f("div", K, "Loading catalog…")) : (m(), f("form", {
      key: 1,
      class: "kx-flow",
      onSubmit: O(y, ["prevent"])
    }, [
      a.value ? (m(), f("p", W, V(a.value), 1)) : R("", !0),
      j(z, {
        form: B(n),
        "generation-policy": b.value,
        "destination-locked": g.value
      }, null, 8, ["form", "generation-policy", "destination-locked"])
    ], 32));
  }
}), q = {
  type: "object",
  properties: {
    input: { type: "string" },
    "type-id": { type: "string" },
    "parent-id": { type: "string" },
    // The automation manager's inbound submit command: it bumps this observed
    // attribute and the form watches it, instead of reaching into the shadow root.
    "submit-nonce": { type: "string" }
  }
};
class C extends A {
  static get wippyConfig() {
    return {
      propsSchema: q,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: M
    };
  }
  static get vueConfig() {
    return { rootComponent: $, plugins: [N] };
  }
}
async function re() {
  return C;
}
L(import.meta.url, C);
export {
  re as webComponent
};
//# sourceMappingURL=sync_create.js.map
