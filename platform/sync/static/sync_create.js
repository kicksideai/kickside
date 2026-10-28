import { u as w, a as P, b as I, e as _, _ as A, W as M, s as N, P as T } from "./styles-BnOsQQko.js";
import { computed as v, watch as h, defineComponent as x, ref as c, onMounted as O, openBlock as d, createElementBlock as f, withModifiers as V, toDisplayString as R, createCommentVNode as j, createVNode as B, unref as F } from "vue";
import { loadByTagName as k, api as L, define as U } from "@wippy-fe/proxy";
import "@iconify/vue";
function m(s) {
  if (s == null || s === "") return {};
  const t = typeof s == "string" ? JSON.parse(s) : s;
  if (!t || typeof t != "object" || Array.isArray(t)) throw new Error("Install input must be an object.");
  return t;
}
function z(s) {
  return v(() => {
    const t = s.value;
    return t ? (typeof t.parentId == "string" ? t.parentId : "").trim() : "";
  });
}
function G(s, t, i) {
  h(
    () => s.value?.submitNonce,
    (n, l) => {
      n == null || n === "" || n === l || i?.value || t();
    }
  );
}
const H = {
  key: 0,
  class: "kx-2p-r-note"
}, K = {
  key: 0,
  class: "kx-alert",
  role: "alert"
}, W = "kickside.sync:sync", D = "wc-schema-form", J = "kickside-transform-assist", Y = /* @__PURE__ */ x({
  __name: "SyncCreate",
  setup(s) {
    const t = w(), i = P(), n = I({ managed: !1 }), l = c(!0), u = c(!1);
    h(u, (r) => i("submit-state", { saving: r }));
    const a = c(""), p = c(""), g = c(!1);
    G(t, y, u);
    const C = v(() => t.value.typeId || W), E = z(t), S = v(() => t.value.generationPolicy);
    async function y() {
      if (l.value || u.value) return;
      if (p.value) {
        i("automation-installed", { success: !1, error: p.value });
        return;
      }
      const r = n.validationError.value;
      if (r) {
        a.value = r, i("automation-installed", { success: !1, error: r });
        return;
      }
      u.value = !0, a.value = "";
      try {
        const { data: e } = await L.post(
          "/api/v1/automations",
          { type: C.value, parent_id: E.value || void 0, input: n.currentInput() }
        );
        if (!e?.success) {
          const o = typeof e?.error == "string" ? e.error : e?.error?.message;
          throw new Error(o || "install failed");
        }
        i("automation-installed", { success: !0, id: e.id }), i("created", { id: e.id });
      } catch (e) {
        const o = _(e, "install failed");
        a.value = o, i("automation-installed", { success: !1, error: o });
      } finally {
        u.value = !1;
      }
    }
    return O(async () => {
      try {
        await Promise.all([
          k(D, { timeoutMs: 8e3 }),
          k(J, { timeoutMs: 8e3 })
        ]);
        const r = await n.loadCatalog();
        if (r) throw new Error(r);
        const e = m(t.value.input);
        if (typeof e.title == "string" && (n.title.value = e.title), e.trigger !== void 0) {
          const o = m(e.trigger);
          if (!n.sources.value.some((b) => b.id === o.source))
            throw new Error("The selected source is unavailable.");
          n.triggerSeed.value = o;
        }
        if (typeof e.sink_port == "string") {
          if (!n.sinks.value.some((o) => o.id === e.sink_port))
            throw new Error("The selected destination is unavailable.");
          n.sinkId.value = e.sink_port, n.sinkConfig.value = m(e.sink_config), g.value = !0;
        }
      } catch (r) {
        p.value = _(r, "Unable to initialize the sync form."), a.value = p.value;
      } finally {
        l.value = !1;
      }
    }), (r, e) => l.value ? (d(), f("div", H, "Loading catalog…")) : (d(), f("form", {
      key: 1,
      class: "kx-flow",
      onSubmit: V(y, ["prevent"])
    }, [
      a.value ? (d(), f("p", K, R(a.value), 1)) : j("", !0),
      B(A, {
        form: F(n),
        "generation-policy": S.value,
        "destination-locked": g.value
      }, null, 8, ["form", "generation-policy", "destination-locked"])
    ], 32));
  }
}), $ = {
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
class q extends M {
  static get wippyConfig() {
    return {
      propsSchema: $,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: N
    };
  }
  static get vueConfig() {
    return { rootComponent: Y, plugins: [T] };
  }
}
U(import.meta.url, q);
//# sourceMappingURL=sync_create.js.map
