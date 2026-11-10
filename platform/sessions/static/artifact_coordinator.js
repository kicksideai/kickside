import { u as x, a as F, W as R } from "./wc-runtime-BJD-5iaH.js";
import { defineComponent as H, ref as O, onMounted as q, onBeforeUnmount as N, openBlock as W, createElementBlock as z } from "vue";
import { getLayoutManager as K, on as I, define as U } from "@wippy-fe/proxy";
import { s as P, p as V, m as Z, a as G, A as s, i as J, b as Q, C as k } from "./hostRoute-C2evkQJy.js";
import { u as X } from "./useSessionsApi-DkMU6ZyM.js";
import "@iconify/vue";
const Y = { "aria-hidden": "true" }, d = "artifact-modal", $ = /* @__PURE__ */ H({
  __name: "ArtifactCoordinator",
  setup(C) {
    const D = { width: "80vw", height: "80vh" }, a = x(), m = F(), M = X(), n = a ? K(a) : null, r = [];
    let u = window.location.pathname;
    function f() {
      return a?.layout.snapshot ?? null;
    }
    function h() {
      return V(Z(f()) ?? u).path;
    }
    let l = h();
    const c = O(P(l));
    let p = 0;
    function E(t) {
      if (!t || typeof t != "object") return "";
      const o = t;
      return String(o.uuid || o.artifactId || "");
    }
    function L(t) {
      if (!t || typeof t != "object") return "";
      const o = t;
      return String(o.sessionId || o.session_id || "");
    }
    function B() {
      n?.expandPanel(s), n?.openDrawer(s);
      const t = f();
      n && t && J(Q(t, n.activeBreakpoint, k)) && n.closeDrawer(k);
    }
    function y() {
      n?.closeDrawer(s), n?.collapsePanel(s);
    }
    function _() {
      p++, a?.layout?.closeModal(d);
    }
    async function A(t) {
      const o = ++p;
      let e = "Artifact";
      try {
        const i = await M.artifact(t);
        i?.title && (e = i.title);
      } catch {
      }
      o === p && (a?.layout?.closeModal(d), a?.layout?.openModal(d, {
        kind: "artifact",
        id: t,
        title: e,
        dismissable: !0,
        size: D
      }));
    }
    function w(t, o, e) {
      if (o?.target === "modal") {
        A(t);
        return;
      }
      if (!(!!c.value && e !== s)) {
        if (o?.reason === "arrival") return;
        A(t);
        return;
      }
      B(), window.setTimeout(() => m?.broadcast("kickside:artifact-open", { uuid: t }), 0);
    }
    function S(t) {
      _(), t !== c.value && (c.value = t, y());
    }
    function g() {
      const t = h();
      t !== l && (l = t, S(P(t)));
    }
    function T(t) {
      if (t.channel === "kickside:artifact-session") {
        if (!G(t.sourcePanelId, f(), u)) return;
        S(L(t.payload));
        return;
      }
      if (t.channel === "@HOST/intent") {
        const o = t.payload, e = E(o);
        o?.intent === "openArtifact" && e && w(e, o, t.sourcePanelId);
        return;
      }
      t.channel === "kickside:artifact-close" && (_(), y());
    }
    function j(t) {
      if (!t || typeof t != "object") return;
      const o = t, [, e] = String(o.topic || "").split(":");
      if (e !== "sidebar") return;
      const i = String(o.data?.artifact_uuid || "");
      if (!i) return;
      const b = String(o.data?.session_id || "");
      b && b !== c.value || w(i, { reason: "arrival" });
    }
    return q(() => {
      const t = m?.subscribe(T);
      t && r.push(t), r.push(I("action:*", j)), r.push(I("@history", ({ path: o }) => {
        u = o, g();
      })), n && r.push(n.on("change", g));
    }), N(() => r.forEach((t) => t())), (t, o) => (W(), z("span", Y));
  }
});
class v extends R {
  static get wippyConfig() {
    return { propsSchema: { type: "object", properties: {} } };
  }
  static get vueConfig() {
    return { rootComponent: $ };
  }
}
async function rt() {
  return v;
}
U(import.meta.url, v);
export {
  rt as webComponent
};
//# sourceMappingURL=artifact_coordinator.js.map
