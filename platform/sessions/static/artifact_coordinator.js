import { u as E, a as P, b as D, W as L } from "./useSessionsApi-WrUiyRNa.js";
import { defineComponent as B, ref as j, onMounted as x, onBeforeUnmount as O, openBlock as W, createElementBlock as q } from "vue";
import { getLayoutManager as F, on as H, define as T } from "@wippy-fe/proxy";
import "@iconify/vue";
const U = { "aria-hidden": "true" }, r = "artifact", d = "artifact-modal", z = /* @__PURE__ */ B({
  __name: "ArtifactCoordinator",
  setup(w) {
    const S = { width: "80vw", height: "80vh" }, i = E(), c = P(), g = D(), s = i ? F(i) : null, u = [], a = j(b(window.location.pathname));
    let f = 0;
    function b(t) {
      if (!t.startsWith("/sessions/")) return "";
      const n = t.slice(10).split("/")[0] || "";
      try {
        return decodeURIComponent(n);
      } catch {
        return "";
      }
    }
    function k(t) {
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
      let e = "Artifact";
      try {
        const o = await g.artifact(t);
        o?.title && (e = o.title);
      } catch {
      }
      n === f && (i?.layout?.closeModal(d), i?.layout?.openModal(d, {
        kind: "artifact",
        id: t,
        title: e,
        dismissable: !0,
        size: S
      }));
    }
    function h(t, n, e) {
      if (n?.target === "modal") {
        m(t);
        return;
      }
      if (!(!!a.value && e !== r)) {
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
        const e = k(n);
        n?.intent === "openArtifact" && e && h(e, n, t.sourcePanelId);
        return;
      }
      t.channel === "kickside:artifact-close" && (p(), l());
    }
    function M(t) {
      if (!t || typeof t != "object") return;
      const n = t, [, e] = String(n.topic || "").split(":");
      if (e !== "sidebar") return;
      const o = String(n.data?.artifact_uuid || "");
      if (!o) return;
      const y = String(n.data?.session_id || "");
      y && y !== a.value || h(o, { reason: "arrival" });
    }
    return x(() => {
      const t = c?.subscribe(C);
      t && u.push(t), u.push(H("action:*", M));
    }), O(() => u.forEach((t) => t())), (t, n) => (W(), q("span", U));
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
