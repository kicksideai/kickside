import { u as E, a as P, W as D } from "./wc-runtime-BJD-5iaH.js";
import { defineComponent as L, ref as B, onMounted as j, onBeforeUnmount as x, openBlock as O, createElementBlock as W } from "vue";
import { getLayoutManager as q, on as F, define as H } from "@wippy-fe/proxy";
import { u as T } from "./useSessionsApi-P7vRdJK6.js";
import "@iconify/vue";
const U = { "aria-hidden": "true" }, r = "artifact", d = "artifact-modal", z = /* @__PURE__ */ L({
  __name: "ArtifactCoordinator",
  setup(w) {
    const S = { width: "80vw", height: "80vh" }, i = E(), c = P(), g = T(), s = i ? q(i) : null, u = [], a = B(k(window.location.pathname));
    let f = 0;
    function k(t) {
      if (!t.startsWith("/sessions/")) return "";
      const n = t.slice(10).split("/")[0] || "";
      try {
        return decodeURIComponent(n);
      } catch {
        return "";
      }
    }
    function b(t) {
      if (!t || typeof t != "object") return "";
      const n = t;
      return String(n.uuid || n.artifactId || "");
    }
    function A(t) {
      if (!t || typeof t != "object") return "";
      const n = t;
      return String(n.sessionId || n.session_id || "");
    }
    function v() {
      s?.expandPanel(r), s?.openDrawer(r);
    }
    function l() {
      s?.closeDrawer(r), s?.collapsePanel(r);
    }
    function p() {
      f++, i?.layout?.closeModal(d);
    }
    async function m(t) {
      const n = ++f;
      let o = "Artifact";
      try {
        const e = await g.artifact(t);
        e?.title && (o = e.title);
      } catch {
      }
      n === f && (i?.layout?.closeModal(d), i?.layout?.openModal(d, {
        kind: "artifact",
        id: t,
        title: o,
        dismissable: !0,
        size: S
      }));
    }
    function h(t, n, o) {
      if (n?.target === "modal") {
        m(t);
        return;
      }
      if (!(!!a.value && o !== r)) {
        if (n?.reason === "arrival") return;
        m(t);
        return;
      }
      v(), window.setTimeout(() => c?.broadcast("kickside:artifact-open", { uuid: t }), 0);
    }
    function I(t) {
      p(), t !== a.value && (a.value = t, l());
    }
    function C(t) {
      if (t.channel === "kickside:artifact-session") {
        I(A(t.payload));
        return;
      }
      if (t.channel === "@HOST/intent") {
        const n = t.payload;
        if (n?.intent === "startChat" || n?.intent === "openSession") {
          c?.send("main", "kickside:chat-open", n);
          return;
        }
        const o = b(n);
        n?.intent === "openArtifact" && o && h(o, n, t.sourcePanelId);
        return;
      }
      t.channel === "kickside:artifact-close" && (p(), l());
    }
    function M(t) {
      if (!t || typeof t != "object") return;
      const n = t, [, o] = String(n.topic || "").split(":");
      if (o !== "sidebar") return;
      const e = String(n.data?.artifact_uuid || "");
      if (!e) return;
      const y = String(n.data?.session_id || "");
      y && y !== a.value || h(e, { reason: "arrival" });
    }
    return j(() => {
      const t = c?.subscribe(C);
      t && u.push(t), u.push(F("action:*", M));
    }), x(() => u.forEach((t) => t())), (t, n) => (O(), W("span", U));
  }
});
class _ extends D {
  static get wippyConfig() {
    return { propsSchema: { type: "object", properties: {} } };
  }
  static get vueConfig() {
    return { rootComponent: z };
  }
}
async function G() {
  return _;
}
H(import.meta.url, _);
export {
  G as webComponent
};
//# sourceMappingURL=artifact_coordinator.js.map
