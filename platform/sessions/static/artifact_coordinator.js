import { u as E, a as P, b as D, W as L } from "./useSessionsApi-WrUiyRNa.js";
import { defineComponent as B, ref as j, onMounted as x, onBeforeUnmount as O, openBlock as W, createElementBlock as q } from "vue";
import { getLayoutManager as F, on as H, define as T } from "@wippy-fe/proxy";
import "@iconify/vue";
const U = { "aria-hidden": "true" }, r = "artifact", f = "artifact-modal", z = /* @__PURE__ */ B({
  __name: "ArtifactCoordinator",
  setup(w) {
    const g = { width: "80vw", height: "80vh" }, i = E(), l = P(), S = D(), s = i ? F(i) : null, c = [], a = j(b(window.location.pathname));
    let u = 0;
    function b(t) {
      if (!t.startsWith("/sessions/")) return "";
      const n = t.slice(10).split("/")[0] || "";
      try {
        return decodeURIComponent(n);
      } catch {
        return "";
      }
    }
    function A(t) {
      if (!t || typeof t != "object") return "";
      const n = t;
      return String(n.uuid || n.artifactId || "");
    }
    function k(t) {
      if (!t || typeof t != "object") return "";
      const n = t;
      return String(n.sessionId || n.session_id || "");
    }
    function v() {
      s?.expandPanel(r), s?.openDrawer(r);
    }
    function d() {
      s?.closeDrawer(r), s?.collapsePanel(r);
    }
    function p() {
      u++, i?.layout?.closeModal(f);
    }
    async function m(t) {
      const n = ++u;
      let o = "Artifact";
      try {
        const e = await S.artifact(t);
        e?.title && (o = e.title);
      } catch {
      }
      n === u && (i?.layout?.closeModal(f), i?.layout?.openModal(f, {
        kind: "artifact",
        id: t,
        title: o,
        dismissable: !0,
        size: g
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
      v(), window.setTimeout(() => l?.broadcast("kickside:artifact-open", { uuid: t }), 0);
    }
    function I(t) {
      p(), t !== a.value && (a.value = t, d());
    }
    function M(t) {
      if (t.channel === "kickside:artifact-session") {
        I(k(t.payload));
        return;
      }
      if (t.channel === "@HOST/intent") {
        const n = t.payload, o = A(n);
        n?.intent === "openArtifact" && o && h(o, n, t.sourcePanelId);
        return;
      }
      t.channel === "kickside:artifact-close" && (p(), d());
    }
    function C(t) {
      if (!t || typeof t != "object") return;
      const n = t, [, o] = String(n.topic || "").split(":");
      if (o !== "sidebar") return;
      const e = String(n.data?.artifact_uuid || "");
      if (!e) return;
      const y = String(n.data?.session_id || "");
      y && y !== a.value || h(e, { reason: "arrival" });
    }
    return x(() => {
      const t = l?.subscribe(M);
      t && c.push(t), c.push(H("action:*", C));
    }), O(() => c.forEach((t) => t())), (t, n) => (W(), q("span", U));
  }
});
class _ extends L {
  static get wippyConfig() {
    return { propsSchema: { type: "object", properties: {} } };
  }
  static get vueConfig() {
    return { rootComponent: z };
  }
}
async function Z() {
  return _;
}
T(import.meta.url, _);
export {
  Z as webComponent
};
//# sourceMappingURL=artifact_coordinator.js.map
