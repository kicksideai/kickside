import { W as T, e as $, _ as j, u as F, a as K, b as G } from "./errMsg-CFwf-kA2.js";
import { defineComponent as W, ref as l, computed as H, watch as J, onBeforeUnmount as O, openBlock as c, createElementBlock as v, createCommentVNode as m, Fragment as A, createElementVNode as f, toDisplayString as x, createVNode as Q, createTextVNode as X, createBlock as Y, unref as I } from "vue";
import { api as L, define as Z } from "@wippy-fe/proxy";
import { r as ee } from "./principals-Bury5BH3.js";
import { s as te } from "./execution-identity-editor-BMqd4DxB.js";
import "@iconify/vue";
const ne = {
  "aria-label": "Execution account",
  class: "kx-identity-editor"
}, oe = {
  key: 0,
  role: "status"
}, re = { "aria-label": "Runs as" }, ae = { "aria-label": "Authorized by" }, ie = ["disabled"], ue = {
  key: 2,
  role: "alert"
}, se = {
  key: 3,
  role: "status"
}, le = {
  key: 4,
  role: "status"
}, ce = /* @__PURE__ */ W({
  __name: "ExecutionIdentityEditor",
  props: {
    root: {}
  },
  emits: ["changed", "error"],
  setup(h, { emit: k }) {
    const d = h, C = k, n = l(null), o = l(null), i = l(!1), y = l(!1), p = l(""), g = l(!1), b = l(!1), z = l(""), U = l("");
    let r = 0, _ = null;
    const N = H(() => !!n.value && !!o.value && !i.value && !y.value && b.value);
    function w(t) {
      p.value = $(t, "Could not change the run-as account"), C("error", { message: p.value, error: t });
    }
    async function V(t) {
      const { data: e } = await L.get("/api/v1/automations/" + encodeURIComponent(t) + "/identity");
      if (!e.success || !e.identity?.principal?.id || !Number.isInteger(e.identity.identity_generation) || e.identity.identity_generation < 0) throw new Error("Could not read the run-as account");
      const u = e.identity, E = [u.principal, u.authorized_by].filter((a) => !!a).filter((a) => a.kind === "user" || a.kind === "group").map((a) => ({ type: a.kind, id: a.id })), P = await ee(E);
      function B(a) {
        return P.find((S) => S.type === a?.kind && S.id === a?.id)?.label || "Account unavailable";
      }
      return { identity: u, executor: B(u.principal), authorizer: B(u.authorized_by) };
    }
    function R(t) {
      n.value = t.identity, o.value = t.identity.principal, z.value = t.executor, U.value = t.authorizer;
    }
    async function q() {
      const t = ++r;
      if (n.value = null, o.value = null, y.value = !1, p.value = "", g.value = !1, b.value = !1, _ = null, !d.root) {
        i.value = !1;
        return;
      }
      i.value = !0;
      try {
        const e = await V(d.root);
        if (t !== r) return;
        R(e);
      } catch (e) {
        t === r && w(e);
      } finally {
        t === r && (i.value = !1);
      }
    }
    function D(t) {
      const e = t;
      !e?.principal || e.principal.kind !== "user" || !e.principal.id || i.value || y.value || (o.value = { kind: "user", id: e.principal.id }, _ = null, p.value = "", g.value = !1, b.value = !0);
    }
    async function M() {
      if (!N.value || !n.value || !o.value) return;
      const t = r, e = d.root;
      _ ||= { id: crypto.randomUUID(), principal: { ...o.value }, generation: n.value.identity_generation };
      const u = _;
      i.value = !0, p.value = "", g.value = !1;
      try {
        const { data: s } = await L.post(
          "/api/v1/automations/" + encodeURIComponent(e) + "/identity",
          {
            principal: u.principal,
            request_id: u.id,
            expected_identity_generation: u.generation
          }
        );
        if (t !== r) return;
        if (!s.success) throw new Error(s.error?.message || "Could not save the run-as account");
        if (s.state === "pending") {
          y.value = !0;
          return;
        }
        if (s.state !== "succeeded" || !Number.isInteger(s.identity_generation)) throw new Error("Identity change is not confirmed");
        const E = await V(e);
        if (t !== r) return;
        if (E.identity.identity_generation < s.identity_generation) throw new Error("Execution account confirmation is stale");
        R(E), g.value = !0, _ = null, b.value = !1, C("changed");
      } catch (s) {
        t === r && w(s);
      } finally {
        t === r && (i.value = !1);
      }
    }
    return J(() => d.root, () => {
      q();
    }, { immediate: !0 }), O(() => {
      r += 1;
    }), (t, e) => (c(), v("section", ne, [
      i.value && !n.value ? (c(), v("p", oe, "Loading run-as account…")) : m("", !0),
      n.value ? (c(), v(A, { key: 1 }, [
        f("dl", null, [
          e[1] || (e[1] = f("dt", null, "Runs as", -1)),
          f("dd", re, x(z.value), 1),
          n.value.authorized_by ? (c(), v(A, { key: 0 }, [
            e[0] || (e[0] = f("dt", null, "Authorized by", -1)),
            f("dd", ae, x(U.value), 1)
          ], 64)) : m("", !0)
        ]),
        Q(T, {
          tag: "wc-run-as-picker",
          attrs: { root: h.root, value: o.value?.id, disabled: i.value || y.value },
          onChange: D,
          onError: w
        }, null, 8, ["attrs"]),
        f("button", {
          type: "button",
          class: "p-button p-button-secondary",
          disabled: !N.value,
          onClick: M
        }, "Save run-as account", 8, ie)
      ], 64)) : m("", !0),
      p.value ? (c(), v("p", ue, x(p.value), 1)) : m("", !0),
      g.value ? (c(), v("p", se, "Run-as account saved")) : m("", !0),
      y.value ? (c(), v("div", le, [
        e[2] || (e[2] = X(" Identity change is pending. ", -1)),
        f("button", {
          type: "button",
          class: "p-button p-button-secondary",
          onClick: q
        }, "Check account")
      ])) : m("", !0)
    ]));
  }
}), de = /* @__PURE__ */ j(ce, [["__scopeId", "data-v-55f06e2d"]]), pe = /* @__PURE__ */ W({
  __name: "ExecutionIdentityEditorElement",
  setup(h) {
    const k = F(), d = K();
    return (C, n) => (c(), Y(de, {
      root: I(k).root || "",
      onChanged: n[0] || (n[0] = (o) => I(d)("change", void 0)),
      onError: n[1] || (n[1] = (o) => I(d)("error", o))
    }, null, 8, ["root"]));
  }
}), ve = { type: "object", properties: { root: { type: "string", default: "" } } };
class fe extends G {
  static get wippyConfig() {
    return { propsSchema: ve, hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"], inlineCss: te };
  }
  static get vueConfig() {
    return { rootComponent: pe };
  }
}
Z(import.meta.url, fe);
//# sourceMappingURL=execution_identity_editor.js.map
