import { u as D, a as B, W as q } from "./wc-runtime-D-UdhneU.js";
import { defineComponent as H, ref as N, onMounted as R, onBeforeUnmount as O, openBlock as j, createElementBlock as F } from "vue";
import { getLayoutManager as W, on as z, define as K } from "@wippy-fe/proxy";
import { s as b, a as U, l as h, e as V, i as p, C as Z, b as G, m as J, M as Q, c as X, A as i } from "./hostRoute-zAgJIcxb.js";
import { e as Y, c as $ } from "./chatStart-BnNVHJnO.js";
import { u as tt } from "./useHostRoute-CdzDcqsP.js";
import { u as et } from "./useSessionsApi-BIuCYu5K.js";
const ot = { "aria-hidden": "true" }, y = "artifact-modal", at = /* @__PURE__ */ H({
  __name: "ArtifactCoordinator",
  setup(w) {
    const I = { width: "80vw", height: "80vh" }, a = D(), d = B(), P = et(), r = a ? W(a) : null, m = [], g = tt(a, ({ path: t }) => k(b(t))), c = N(b(g.initialPath));
    let u = 0, l = 0, f;
    function M() {
      r?.expandPanel(i), r?.openDrawer(i);
    }
    function A() {
      r?.closeDrawer(i), r?.collapsePanel(i);
    }
    function _() {
      u++, a?.layout?.closeModal(y);
    }
    async function S(t) {
      const e = ++u;
      let o = "Artifact";
      try {
        const n = await P.artifact(t);
        n?.title && (o = n.title);
      } catch {
      }
      e === u && (a?.layout?.closeModal(y), a?.layout?.openModal(y, {
        kind: "artifact",
        id: t,
        title: o,
        dismissable: !0,
        size: I
      }));
    }
    function C(t, e, o) {
      if (e?.target === "modal") {
        S(t);
        return;
      }
      if (!(!!c.value && o !== i)) {
        if (e?.reason === "arrival") return;
        S(t);
        return;
      }
      M(), window.setTimeout(() => d?.broadcast("kickside:artifact-open", { uuid: t }), 0);
    }
    function k(t) {
      _(), t !== c.value && (c.value = t, A());
    }
    async function x(t) {
      const e = ++l;
      f?.abort();
      let o = typeof t.uuid == "string" ? t.uuid : "";
      if (t.intent === "startChat") {
        if (typeof t.startToken != "string" || !t.startToken) return;
        try {
          f = new AbortController(), o = await Y(t.startToken, f.signal);
        } catch {
          e === l && a?.toast({ severity: "error", summary: "Could not start chat" });
          return;
        }
        if (e !== l) {
          $(o);
          return;
        }
      }
      if (!o) return;
      const n = t.context;
      if (p(n) && p(n.context)) {
        const s = n.source, T = p(s) && typeof s.uuid == "string" && (s.type === "page" || s.type === "artifact") ? { type: s.type, uuid: s.uuid } : void 0;
        a?.setContext(n.context, o, T);
      }
      J(h(a)) ? d?.send(Q, "kickside:chat-open", {
        intent: "openSession",
        uuid: o,
        sidebar: t.sidebar === !0
      }) : a?.navigate(X(o));
    }
    function E(t) {
      if (t.channel === "kickside:artifact-session") {
        if (!U(t.sourcePanelId, h(a), g.hostPath())) return;
        k(V(t.payload));
        return;
      }
      if (t.channel === "@HOST/intent") {
        if (!p(t.payload)) return;
        const e = t.payload;
        if (e.intent === "startChat" || e.intent === "openSession") {
          h(a)?.panels?.[Z] || x(e);
          return;
        }
        const o = G(e);
        e?.intent === "openArtifact" && o && C(o, e, t.sourcePanelId);
        return;
      }
      t.channel === "kickside:artifact-close" && (_(), A());
    }
    function L(t) {
      if (!t || typeof t != "object") return;
      const e = t, [, o] = String(e.topic || "").split(":");
      if (o !== "sidebar") return;
      const n = String(e.data?.artifact_uuid || "");
      if (!n) return;
      const s = String(e.data?.session_id || "");
      s && s !== c.value || C(n, { reason: "arrival" });
    }
    return R(() => {
      const t = d?.subscribe(E);
      t && m.push(t), m.push(z("action:*", L));
    }), O(() => {
      l++, f?.abort(), u++, m.forEach((t) => t());
    }), (t, e) => (j(), F("span", ot));
  }
});
class v extends q {
  static get wippyConfig() {
    return { propsSchema: { type: "object", properties: {} } };
  }
  static get vueConfig() {
    return { rootComponent: at };
  }
}
async function ft() {
  return v;
}
K(import.meta.url, v);
export {
  ft as webComponent
};
//# sourceMappingURL=artifact_coordinator.js.map
