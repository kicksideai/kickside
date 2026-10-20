import { u as b, a as P, b as w, e as g, _ as I, W as A, s as M, P as N } from "./styles-ENbzq8HT.js";
import { computed as f, watch as h, defineComponent as T, ref as c, onMounted as x, openBlock as m, createElementBlock as d, withModifiers as O, toDisplayString as V, createCommentVNode as R, createVNode as j, unref as B } from "vue";
import { loadByTagName as _, api as F, define as L } from "@wippy-fe/proxy";
import "@iconify/vue";
function k(n) {
  if (n == null || n === "") return {};
  const e = typeof n == "string" ? JSON.parse(n) : n;
  if (!e || typeof e != "object" || Array.isArray(e)) throw new Error("Install input must be an object.");
  return e;
}
function U(n) {
  return f(() => {
    const e = n.value;
    return e ? (typeof e.parentId == "string" ? e.parentId : "").trim() : "";
  });
}
function z(n, e, r) {
  h(
    () => n.value?.submitNonce,
    (s, l) => {
      s == null || s === "" || s === l || r?.value || e();
    }
  );
}
const G = {
  key: 0,
  class: "kx-2p-r-note"
}, H = {
  key: 0,
  class: "kx-alert",
  role: "alert"
}, K = "kickside.sync:sync", W = "wc-schema-form", D = "kickside-transform-assist", J = /* @__PURE__ */ T({
  __name: "SyncCreate",
  setup(n) {
    const e = b(), r = P(), s = w({ managed: !1 }), l = c(!0), u = c(!1);
    h(u, (o) => r("submit-state", { saving: o }));
    const i = c(""), p = c(""), v = c(!1);
    z(e, y, u);
    const C = f(() => e.value.typeId || K), E = U(e), S = f(() => e.value.generationPolicy);
    async function y() {
      if (l.value || u.value) return;
      if (p.value) {
        r("automation-installed", { success: !1, error: p.value });
        return;
      }
      const o = s.validationError.value;
      if (o) {
        i.value = o, r("automation-installed", { success: !1, error: o });
        return;
      }
      u.value = !0, i.value = "";
      try {
        const { data: t } = await F.post(
          "/api/v1/automations",
          { type: C.value, parent_id: E.value || void 0, input: s.currentInput() }
        );
        if (!t?.success) {
          const a = typeof t?.error == "string" ? t.error : t?.error?.message;
          throw new Error(a || "install failed");
        }
        r("automation-installed", { success: !0, id: t.id }), r("created", { id: t.id });
      } catch (t) {
        const a = g(t, "install failed");
        i.value = a, r("automation-installed", { success: !1, error: a });
      } finally {
        u.value = !1;
      }
    }
    return x(async () => {
      try {
        await Promise.all([
          _(W, { timeoutMs: 8e3 }),
          _(D, { timeoutMs: 8e3 })
        ]);
        const o = await s.loadCatalog();
        if (o) throw new Error(o);
        const t = k(e.value.input);
        if (typeof t.sink_port == "string") {
          if (!s.sinks.value.some((a) => a.id === t.sink_port))
            throw new Error("The selected destination is unavailable.");
          s.sinkId.value = t.sink_port, s.sinkConfig.value = k(t.sink_config), v.value = !0;
        }
      } catch (o) {
        p.value = g(o, "Unable to initialize the sync form."), i.value = p.value;
      } finally {
        l.value = !1;
      }
    }), (o, t) => l.value ? (m(), d("div", G, "Loading catalog…")) : (m(), d("form", {
      key: 1,
      class: "kx-flow",
      onSubmit: O(y, ["prevent"])
    }, [
      i.value ? (m(), d("p", H, V(i.value), 1)) : R("", !0),
      j(I, {
        form: B(s),
        "generation-policy": S.value,
        "destination-locked": v.value
      }, null, 8, ["form", "generation-policy", "destination-locked"])
    ], 32));
  }
}), Y = {
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
class $ extends A {
  static get wippyConfig() {
    return {
      propsSchema: Y,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: M
    };
  }
  static get vueConfig() {
    return { rootComponent: J, plugins: [N] };
  }
}
L(import.meta.url, $);
//# sourceMappingURL=sync_create.js.map
