import { defineComponent as D, ref as l, computed as $, watch as F, onBeforeUnmount as T, openBlock as c, createElementBlock as v, createCommentVNode as m, Fragment as L, createElementVNode as f, toDisplayString as C, createVNode as j, createTextVNode as G, createBlock as H, unref as I } from "vue";
import { a as J, u as K } from "./wc-runtime-KO3cNuNo.js";
import { api as S } from "@wippy-fe/proxy";
import { W as O, e as Q } from "./WcMount-Dv75Gn1l.js";
import { r as X } from "./principals-Bury5BH3.js";
const Y = {
  "aria-label": "Execution account",
  class: "kx-identity-editor"
}, Z = {
  key: 0,
  role: "status"
}, ee = { "aria-label": "Runs as" }, te = { "aria-label": "Authorized by" }, ne = ["disabled"], oe = {
  key: 2,
  role: "alert"
}, ae = {
  key: 3,
  role: "status"
}, re = {
  key: 4,
  role: "status"
}, ie = /* @__PURE__ */ D({
  __name: "ExecutionIdentityEditor",
  props: {
    root: {}
  },
  emits: ["changed", "error"],
  setup(k, { emit: E }) {
    const d = k, w = E, n = l(null), o = l(null), i = l(!1), y = l(!1), p = l(""), g = l(!1), h = l(!1), z = l(""), N = l("");
    let a = 0, _ = null;
    const R = $(() => !!n.value && !!o.value && !i.value && !y.value && h.value);
    function x(t) {
      p.value = Q(t, "Could not change the run-as account"), w("error", { message: p.value, error: t });
    }
    async function U(t) {
      const { data: e } = await S.get("/api/v1/automations/" + encodeURIComponent(t) + "/identity");
      if (!e.success || !e.identity?.principal?.id || !Number.isInteger(e.identity.identity_generation) || e.identity.identity_generation < 0) throw new Error("Could not read the run-as account");
      const u = e.identity, b = [u.principal, u.authorized_by].filter((r) => !!r).filter((r) => r.kind === "user" || r.kind === "group").map((r) => ({ type: r.kind, id: r.id })), W = await X(b);
      function V(r) {
        return W.find((A) => A.type === r?.kind && A.id === r?.id)?.label || "Account unavailable";
      }
      return { identity: u, executor: V(u.principal), authorizer: V(u.authorized_by) };
    }
    function q(t) {
      n.value = t.identity, o.value = t.identity.principal, z.value = t.executor, N.value = t.authorizer;
    }
    async function B() {
      const t = ++a;
      if (n.value = null, o.value = null, y.value = !1, p.value = "", g.value = !1, h.value = !1, _ = null, !d.root) {
        i.value = !1;
        return;
      }
      i.value = !0;
      try {
        const e = await U(d.root);
        if (t !== a) return;
        q(e);
      } catch (e) {
        t === a && x(e);
      } finally {
        t === a && (i.value = !1);
      }
    }
    function M(t) {
      const e = t;
      !e?.principal || e.principal.kind !== "user" || !e.principal.id || i.value || y.value || (o.value = { kind: "user", id: e.principal.id }, _ = null, p.value = "", g.value = !1, h.value = !0);
    }
    async function P() {
      if (!R.value || !n.value || !o.value) return;
      const t = a, e = d.root;
      _ ||= { id: crypto.randomUUID(), principal: { ...o.value }, generation: n.value.identity_generation };
      const u = _;
      i.value = !0, p.value = "", g.value = !1;
      try {
        const { data: s } = await S.post(
          "/api/v1/automations/" + encodeURIComponent(e) + "/identity",
          {
            principal: u.principal,
            request_id: u.id,
            expected_identity_generation: u.generation
          }
        );
        if (t !== a) return;
        if (!s.success) throw new Error(s.error?.message || "Could not save the run-as account");
        if (s.state === "pending") {
          y.value = !0;
          return;
        }
        if (s.state !== "succeeded" || !Number.isInteger(s.identity_generation)) throw new Error("Identity change is not confirmed");
        const b = await U(e);
        if (t !== a) return;
        if (b.identity.identity_generation < s.identity_generation) throw new Error("Execution account confirmation is stale");
        q(b), g.value = !0, _ = null, h.value = !1, w("changed");
      } catch (s) {
        t === a && x(s);
      } finally {
        t === a && (i.value = !1);
      }
    }
    return F(() => d.root, () => {
      B();
    }, { immediate: !0 }), T(() => {
      a += 1;
    }), (t, e) => (c(), v("section", Y, [
      i.value && !n.value ? (c(), v("p", Z, "Loading run-as account…")) : m("", !0),
      n.value ? (c(), v(L, { key: 1 }, [
        f("dl", null, [
          e[1] || (e[1] = f("dt", null, "Runs as", -1)),
          f("dd", ee, C(z.value), 1),
          n.value.authorized_by ? (c(), v(L, { key: 0 }, [
            e[0] || (e[0] = f("dt", null, "Authorized by", -1)),
            f("dd", te, C(N.value), 1)
          ], 64)) : m("", !0)
        ]),
        j(O, {
          tag: "wc-run-as-picker",
          attrs: { root: k.root, value: o.value?.id, disabled: i.value || y.value },
          onChange: M,
          onError: x
        }, null, 8, ["attrs"]),
        f("button", {
          type: "button",
          class: "p-button p-button-secondary",
          disabled: !R.value,
          onClick: P
        }, "Save run-as account", 8, ne)
      ], 64)) : m("", !0),
      p.value ? (c(), v("p", oe, C(p.value), 1)) : m("", !0),
      g.value ? (c(), v("p", ae, "Run-as account saved")) : m("", !0),
      y.value ? (c(), v("div", re, [
        e[2] || (e[2] = G(" Identity change is pending. ", -1)),
        f("button", {
          type: "button",
          class: "p-button p-button-secondary",
          onClick: B
        }, "Check account")
      ])) : m("", !0)
    ]));
  }
}), pe = /* @__PURE__ */ D({
  __name: "ExecutionIdentityEditorElement",
  setup(k) {
    const E = J(), d = K();
    return (w, n) => (c(), H(ie, {
      root: I(E).root || "",
      onChanged: n[0] || (n[0] = (o) => I(d)("change", void 0)),
      onError: n[1] || (n[1] = (o) => I(d)("error", o))
    }, null, 8, ["root"]));
  }
});
export {
  pe as default
};
//# sourceMappingURL=ExecutionIdentityEditorElement-OU0eCKIx.js.map
