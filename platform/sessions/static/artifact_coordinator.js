import { u as x, a as R, W as T } from "./wc-runtime-BJD-5iaH.js";
import { defineComponent as F, ref as O, onMounted as q, onBeforeUnmount as H, openBlock as W, createElementBlock as z } from "vue";
import { getLayoutManager as K, on as I, define as N } from "@wippy-fe/proxy";
import { s as P, p as U, m as V, a as Z, A as s } from "./hostRoute-CVDsnWuq.js";
import { u as G } from "./useSessionsApi-BQAm970o.js";
import "@iconify/vue";
const J = { "aria-hidden": "true" }, p = "artifact-modal", Q = /* @__PURE__ */ F({
  __name: "ArtifactCoordinator",
  setup(v) {
    const M = { width: "80vw", height: "80vh" }, e = x(), d = R(), C = G(), i = e ? K(e) : null, r = [];
    let u = window.location.pathname;
    function m() {
      return e?.layout.snapshot ?? null;
    }
    function h() {
      return U(V(m()) ?? u).path;
    }
    let f = h();
    const c = O(P(f));
    let l = 0;
    function E(t) {
      if (!t || typeof t != "object") return "";
      const n = t;
      return String(n.uuid || n.artifactId || "");
    }
    function L(t) {
      if (!t || typeof t != "object") return "";
      const n = t;
      return String(n.sessionId || n.session_id || "");
    }
    function D() {
      i?.expandPanel(s), i?.openDrawer(s);
    }
    function y() {
      i?.closeDrawer(s), i?.collapsePanel(s);
    }
    function _() {
      l++, e?.layout?.closeModal(p);
    }
    async function A(t) {
      const n = ++l;
      let o = "Artifact";
      try {
        const a = await C.artifact(t);
        a?.title && (o = a.title);
      } catch {
      }
      n === l && (e?.layout?.closeModal(p), e?.layout?.openModal(p, {
        kind: "artifact",
        id: t,
        title: o,
        dismissable: !0,
        size: M
      }));
    }
    function w(t, n, o) {
      if (n?.target === "modal") {
        A(t);
        return;
      }
      if (!(!!c.value && o !== s)) {
        if (n?.reason === "arrival") return;
        A(t);
        return;
      }
      D(), window.setTimeout(() => d?.broadcast("kickside:artifact-open", { uuid: t }), 0);
    }
    function S(t) {
      _(), t !== c.value && (c.value = t, y());
    }
    function g() {
      const t = h();
      t !== f && (f = t, S(P(t)));
    }
    function B(t) {
      if (t.channel === "kickside:artifact-session") {
        if (!Z(t.sourcePanelId, m(), u)) return;
        S(L(t.payload));
        return;
      }
      if (t.channel === "@HOST/intent") {
        const n = t.payload, o = E(n);
        n?.intent === "openArtifact" && o && w(o, n, t.sourcePanelId);
        return;
      }
      t.channel === "kickside:artifact-close" && (_(), y());
    }
    function j(t) {
      if (!t || typeof t != "object") return;
      const n = t, [, o] = String(n.topic || "").split(":");
      if (o !== "sidebar") return;
      const a = String(n.data?.artifact_uuid || "");
      if (!a) return;
      const b = String(n.data?.session_id || "");
      b && b !== c.value || w(a, { reason: "arrival" });
    }
    return q(() => {
      const t = d?.subscribe(B);
      t && r.push(t), r.push(I("action:*", j)), r.push(I("@history", ({ path: n }) => {
        u = n, g();
      })), i && r.push(i.on("change", g));
    }), H(() => r.forEach((t) => t())), (t, n) => (W(), z("span", J));
  }
});
class k extends T {
  static get wippyConfig() {
    return { propsSchema: { type: "object", properties: {} } };
  }
  static get vueConfig() {
    return { rootComponent: Q };
  }
}
async function et() {
  return k;
}
N(import.meta.url, k);
export {
  et as webComponent
};
//# sourceMappingURL=artifact_coordinator.js.map
