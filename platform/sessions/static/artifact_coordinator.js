import { u as B, a as x, W as R } from "./wc-runtime-BJD-5iaH.js";
import { defineComponent as T, ref as O, onMounted as j, onBeforeUnmount as q, openBlock as F, createElementBlock as H } from "vue";
import { getLayoutManager as W, on as g, define as z } from "@wippy-fe/proxy";
import { s as P, p as K, m as N, l as b, a as U, e as V, b as Z, A as r } from "./hostRoute-CHFKAd6h.js";
import { u as G } from "./useSessionsApi-BQAm970o.js";
import "@iconify/vue";
const J = { "aria-hidden": "true" }, p = "artifact-modal", Q = /* @__PURE__ */ T({
  __name: "ArtifactCoordinator",
  setup(I) {
    const M = { width: "80vw", height: "80vh" }, e = B(), d = x(), C = G(), a = e ? W(e) : null, s = [];
    let u = window.location.pathname;
    function m() {
      return K(N(b(e)) ?? u).path;
    }
    let l = m();
    const c = O(P(l));
    let f = 0;
    function E() {
      a?.expandPanel(r), a?.openDrawer(r);
    }
    function h() {
      a?.closeDrawer(r), a?.collapsePanel(r);
    }
    function y() {
      f++, e?.layout?.closeModal(p);
    }
    async function A(t) {
      const o = ++f;
      let n = "Artifact";
      try {
        const i = await C.artifact(t);
        i?.title && (n = i.title);
      } catch {
      }
      o === f && (e?.layout?.closeModal(p), e?.layout?.openModal(p, {
        kind: "artifact",
        id: t,
        title: n,
        dismissable: !0,
        size: M
      }));
    }
    function _(t, o, n) {
      if (o?.target === "modal") {
        A(t);
        return;
      }
      if (!(!!c.value && n !== r)) {
        if (o?.reason === "arrival") return;
        A(t);
        return;
      }
      E(), window.setTimeout(() => d?.broadcast("kickside:artifact-open", { uuid: t }), 0);
    }
    function w(t) {
      y(), t !== c.value && (c.value = t, h());
    }
    function S() {
      const t = m();
      t !== l && (l = t, w(P(t)));
    }
    function D(t) {
      if (t.channel === "kickside:artifact-session") {
        if (!U(t.sourcePanelId, b(e), u)) return;
        w(V(t.payload));
        return;
      }
      if (t.channel === "@HOST/intent") {
        const o = t.payload, n = Z(o);
        o?.intent === "openArtifact" && n && _(n, o, t.sourcePanelId);
        return;
      }
      t.channel === "kickside:artifact-close" && (y(), h());
    }
    function L(t) {
      if (!t || typeof t != "object") return;
      const o = t, [, n] = String(o.topic || "").split(":");
      if (n !== "sidebar") return;
      const i = String(o.data?.artifact_uuid || "");
      if (!i) return;
      const v = String(o.data?.session_id || "");
      v && v !== c.value || _(i, { reason: "arrival" });
    }
    return j(() => {
      const t = d?.subscribe(D);
      t && s.push(t), s.push(g("action:*", L)), s.push(g("@history", ({ path: o }) => {
        u = o, S();
      })), a && s.push(a.on("change", S));
    }), q(() => s.forEach((t) => t())), (t, o) => (F(), H("span", J));
  }
});
class k extends R {
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
z(import.meta.url, k);
export {
  et as webComponent
};
//# sourceMappingURL=artifact_coordinator.js.map
