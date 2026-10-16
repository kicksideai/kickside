import { u as Z, W as rr } from "./index-D52CRMw6.js";
import { B as ar, s as er, f as or, P as tr } from "./primevue-plugin-DzKV8Brb.js";
import { openBlock as i, createElementBlock as s, mergeProps as M, createBlock as I, resolveDynamicComponent as ir, createCommentVNode as h, renderSlot as sr, createElementVNode as e, toDisplayString as u, defineComponent as nr, ref as m, computed as pr, createVNode as _, unref as y, createTextVNode as V, Fragment as z, renderList as j, withModifiers as cr, withDirectives as k, vModelText as $, vModelCheckbox as A, vModelSelect as lr, normalizeClass as W } from "vue";
import { Icon as C } from "@iconify/vue";
import { api as P, host as ur, define as dr } from "@wippy-fe/proxy";
import { f as vr } from "./datetime--PfqsqnZ.js";
var gr = `
    .p-tag {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: dt('tag.primary.background');
        color: dt('tag.primary.color');
        font-size: dt('tag.font.size');
        font-weight: dt('tag.font.weight');
        padding: dt('tag.padding');
        border-radius: dt('tag.border.radius');
        gap: dt('tag.gap');
    }

    .p-tag-icon {
        font-size: dt('tag.icon.size');
        width: dt('tag.icon.size');
        height: dt('tag.icon.size');
    }

    .p-tag-rounded {
        border-radius: dt('tag.rounded.border.radius');
    }

    .p-tag-success {
        background: dt('tag.success.background');
        color: dt('tag.success.color');
    }

    .p-tag-info {
        background: dt('tag.info.background');
        color: dt('tag.info.color');
    }

    .p-tag-warn {
        background: dt('tag.warn.background');
        color: dt('tag.warn.color');
    }

    .p-tag-danger {
        background: dt('tag.danger.background');
        color: dt('tag.danger.color');
    }

    .p-tag-secondary {
        background: dt('tag.secondary.background');
        color: dt('tag.secondary.color');
    }

    .p-tag-contrast {
        background: dt('tag.contrast.background');
        color: dt('tag.contrast.color');
    }
`, mr = {
  root: function(n) {
    var p = n.props;
    return ["p-tag p-component", {
      "p-tag-info": p.severity === "info",
      "p-tag-success": p.severity === "success",
      "p-tag-warn": p.severity === "warn",
      "p-tag-danger": p.severity === "danger",
      "p-tag-secondary": p.severity === "secondary",
      "p-tag-contrast": p.severity === "contrast",
      "p-tag-rounded": p.rounded
    }];
  },
  icon: "p-tag-icon",
  label: "p-tag-label"
}, fr = ar.extend({
  name: "tag",
  style: gr,
  classes: mr
}), br = {
  name: "BaseTag",
  extends: er,
  props: {
    value: null,
    severity: null,
    rounded: Boolean,
    icon: String
  },
  style: fr,
  provide: function() {
    return {
      $pcTag: this,
      $parentInstance: this
    };
  }
};
function T(t) {
  "@babel/helpers - typeof";
  return T = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(n) {
    return typeof n;
  } : function(n) {
    return n && typeof Symbol == "function" && n.constructor === Symbol && n !== Symbol.prototype ? "symbol" : typeof n;
  }, T(t);
}
function hr(t, n, p) {
  return (n = yr(n)) in t ? Object.defineProperty(t, n, { value: p, enumerable: !0, configurable: !0, writable: !0 }) : t[n] = p, t;
}
function yr(t) {
  var n = wr(t, "string");
  return T(n) == "symbol" ? n : n + "";
}
function wr(t, n) {
  if (T(t) != "object" || !t) return t;
  var p = t[Symbol.toPrimitive];
  if (p !== void 0) {
    var d = p.call(t, n);
    if (T(d) != "object") return d;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (n === "string" ? String : Number)(t);
}
var N = {
  name: "Tag",
  extends: br,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return or(hr({
        rounded: this.rounded
      }, this.severity, this.severity));
    }
  }
}, kr = ["data-p"];
function xr(t, n, p, d, U, x) {
  return i(), s("span", M({
    class: t.cx("root"),
    "data-p": x.dataP
  }, t.ptmi("root")), [t.$slots.icon ? (i(), I(ir(t.$slots.icon), M({
    key: 0,
    class: t.cx("icon")
  }, t.ptm("icon")), null, 16, ["class"])) : t.icon ? (i(), s("span", M({
    key: 1,
    class: [t.cx("icon"), t.icon]
  }, t.ptm("icon")), null, 16)) : h("", !0), t.value != null || t.$slots.default ? sr(t.$slots, "default", {
    key: 2
  }, function() {
    return [e("span", M({
      class: t.cx("label")
    }, t.ptm("label")), u(t.value), 17)];
  }) : h("", !0)], 16, kr);
}
N.render = xr;
const _r = { class: "ku" }, zr = {
  class: "ku-bar",
  role: "tablist",
  "aria-label": "Account type"
}, Cr = ["aria-selected"], Sr = ["aria-selected"], $r = { class: "ku-bar" }, Ur = { class: "ku-count" }, Er = ["aria-label"], Dr = {
  key: 0,
  role: "alert",
  class: "ku-err"
}, Vr = {
  key: 1,
  class: "ku-err"
}, jr = ["id"], Pr = {
  key: 0,
  class: "ku-loading"
}, Tr = {
  key: 1,
  class: "ku-empty"
}, Br = { class: "ku-empty-title" }, Mr = ["aria-label"], Nr = {
  key: 2,
  class: "ku-list"
}, Fr = { class: "ku-avatar" }, Ar = { class: "ku-id" }, Ir = { class: "ku-name" }, Lr = { class: "ku-email" }, Kr = { class: "ku-meta" }, Or = { class: "ku-date" }, Rr = { class: "ku-actions" }, Wr = ["aria-label", "onClick"], qr = ["aria-label", "onClick"], Hr = ["aria-label"], Jr = {
  key: 0,
  class: "ku-field"
}, Gr = { class: "ku-field" }, Qr = {
  key: 1,
  class: "ku-field"
}, Xr = { class: "ku-field" }, Yr = {
  key: 0,
  class: "ku-check"
}, Zr = ["value"], ra = { class: "ku-check-label" }, aa = { class: "ku-check-id" }, ea = {
  key: 0,
  class: "ku-field"
}, oa = { class: "ku-field" }, ta = { class: "ku-field" }, ia = ["value"], sa = {
  key: 1,
  class: "ku-field"
}, na = { class: "ku-field" }, pa = ["value"], ca = { class: "ku-check-label" }, la = { class: "ku-check-id" }, ua = { class: "ku-bar" }, da = ["disabled"], va = ["disabled"], ga = /* @__PURE__ */ nr({
  __name: "users",
  setup(t) {
    const n = [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
      { label: "Suspended", value: "suspended" },
      { label: "Pending", value: "pending" }
    ], p = m([]), d = m("users"), U = m(!1), x = m([]), F = m(!1), g = m(""), B = m(""), f = m(!1), c = m({ email: "", full_name: "", password: "", groups: [] }), E = m(!0), w = m(!1), S = m(!1), l = m({ user_id: "", email: "", full_name: "", status: "", password: "", groups: [] }), b = pr(() => f.value ? d.value === "bots" : U.value);
    function q(o) {
      switch (o) {
        case "active":
          return "success";
        case "suspended":
          return "danger";
        case "pending":
          return "warn";
        default:
          return "secondary";
      }
    }
    function H(o) {
      return x.value.find((r) => r.id === o)?.label ?? o;
    }
    function J(o) {
      const r = x.value.find((a) => a.id === o);
      return o === "app.security:admin" ? "warn" : r && r.built_in === !1 ? "success" : "info";
    }
    function G(o) {
      return (o.full_name || o.email).split(" ").map((a) => a[0]).join("").toUpperCase().slice(0, 2);
    }
    async function D() {
      F.value = !0, g.value = "";
      try {
        const { data: o } = await P.get(d.value === "bots" ? "/api/v1/users/bots" : "/api/v1/users");
        p.value = o.success ? o.users || [] : [];
      } catch (o) {
        p.value = [], g.value = o instanceof Error ? o.message : "failed to load users";
      } finally {
        F.value = !1;
      }
    }
    async function Q() {
      B.value = "";
      try {
        const { data: o } = await P.get("/api/v1/users/assignable-scopes"), r = o.success ? o.scopes || [] : [];
        x.value = r.map((a) => ({
          id: a.id,
          label: a.label || a.id,
          description: a.description,
          built_in: a.source === "builtin"
        }));
      } catch (o) {
        x.value = [], B.value = o instanceof Error ? o.message : "failed to load security groups";
      }
    }
    async function L(o) {
      d.value = o, f.value = !1, S.value = !1, await D();
    }
    function K() {
      c.value = { email: "", full_name: "", password: "", groups: [] }, E.value = !0, S.value = !1, f.value = !0;
    }
    async function O() {
      if (!(b.value ? !c.value.full_name.trim() : !c.value.email || !c.value.password)) {
        w.value = !0, g.value = "";
        try {
          const o = b.value ? { full_name: c.value.full_name, groups: c.value.groups } : {
            email: c.value.email,
            full_name: c.value.full_name,
            password: c.value.password,
            ...E.value ? {} : { groups: c.value.groups }
          }, { data: r } = await P.post(
            b.value ? "/api/v1/users/bots" : "/api/v1/users",
            o
          );
          r.success && r.user ? (f.value = !1, await D()) : g.value = r.error || "failed to create user";
        } catch (o) {
          g.value = o instanceof Error ? o.message : "failed to create user";
        } finally {
          w.value = !1;
        }
      }
    }
    function X(o) {
      f.value = !1, U.value = o.bot_account === !0, l.value = {
        user_id: o.user_id,
        email: o.email,
        full_name: o.full_name,
        status: o.status,
        password: "",
        groups: [...o.security_groups]
      }, S.value = !0;
    }
    async function R() {
      const o = l.value.user_id;
      if (o) {
        w.value = !0, g.value = "";
        try {
          const r = {};
          !U.value && l.value.email && (r.email = l.value.email), l.value.full_name && (r.full_name = l.value.full_name), l.value.status && (r.status = l.value.status), !U.value && l.value.password && (r.password = l.value.password);
          const { data: a } = await P.put(`/api/v1/users/${o}`, { ...r, groups: l.value.groups });
          a.success ? (S.value = !1, await D()) : g.value = a.error || "failed to update user";
        } catch (r) {
          g.value = r instanceof Error ? r.message : "failed to update user";
        } finally {
          w.value = !1;
        }
      }
    }
    async function Y(o) {
      const r = o.full_name || o.email;
      if (await ur.confirm({
        header: o.bot_account ? "Disable bot" : "Delete user",
        message: o.bot_account ? `Disable “${r}”? This revokes access and retains the account and its history.` : `Delete “${r}”? This permanently removes the user and revokes all access.`,
        icon: "tabler:trash",
        acceptLabel: o.bot_account ? "Disable" : "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      })) {
        g.value = "";
        try {
          const { data: v } = await P.delete(`/api/v1/users/${o.user_id}`);
          v.success ? await D() : g.value = v.error || "failed to delete user";
        } catch (v) {
          g.value = v instanceof Error ? v.message : "failed to delete user";
        }
      }
    }
    return Z(async () => {
      await Q(), await D();
    }), (o, r) => (i(), s("div", _r, [
      e("div", zr, [
        e("button", {
          class: "ku-btn",
          role: "tab",
          "aria-selected": d.value === "users",
          "aria-controls": "users-accounts",
          onClick: r[0] || (r[0] = (a) => L("users"))
        }, "All users", 8, Cr),
        e("button", {
          class: "ku-btn",
          role: "tab",
          "aria-selected": d.value === "bots",
          "aria-controls": "users-bots",
          onClick: r[1] || (r[1] = (a) => L("bots"))
        }, "Bots", 8, Sr)
      ]),
      e("div", $r, [
        e("span", Ur, u(p.value.length) + " user" + u(p.value.length !== 1 ? "s" : ""), 1),
        e("button", {
          "aria-label": d.value === "bots" ? "Create bot" : "Create user",
          class: "ku-btn ku-btn-primary",
          onClick: K
        }, [
          _(y(C), {
            icon: "tabler:user-plus",
            "aria-hidden": "true"
          }),
          V(" " + u(d.value === "bots" ? "Create bot" : "Create user"), 1)
        ], 8, Er)
      ]),
      g.value ? (i(), s("div", Dr, u(g.value), 1)) : h("", !0),
      B.value ? (i(), s("div", Vr, u(B.value), 1)) : h("", !0),
      e("div", {
        class: "ku-body",
        role: "tabpanel",
        id: d.value === "bots" ? "users-bots" : "users-accounts"
      }, [
        F.value ? (i(), s("div", Pr, [
          _(y(C), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          r[14] || (r[14] = V(" Loading…", -1))
        ])) : p.value.length ? (i(), s("div", Nr, [
          (i(!0), s(z, null, j(p.value, (a) => (i(), s("div", {
            key: a.user_id,
            class: "ku-row"
          }, [
            e("span", Fr, u(G(a)), 1),
            e("div", Ar, [
              e("div", Ir, u(a.full_name || a.email), 1),
              e("div", Lr, u(a.email), 1)
            ]),
            e("div", Kr, [
              a.bot_account ? (i(), I(y(N), {
                key: 0,
                severity: "info",
                value: "Bot",
                class: "ku-badge kx-tag-sm"
              })) : h("", !0),
              _(y(N), {
                severity: q(a.status),
                value: a.status,
                class: "ku-badge kx-tag-sm"
              }, null, 8, ["severity", "value"]),
              (i(!0), s(z, null, j(a.security_groups, (v) => (i(), I(y(N), {
                key: v,
                severity: J(v),
                value: H(v),
                class: "ku-badge kx-tag-sm"
              }, null, 8, ["severity", "value"]))), 128))
            ]),
            e("span", Or, u(y(vr)(a.created_at, { month: "short", day: "numeric", year: "numeric" })), 1),
            e("div", Rr, [
              e("button", {
                class: "ku-icon-btn",
                "aria-label": `Edit ${a.full_name || a.email}`,
                onClick: (v) => X(a)
              }, [
                _(y(C), {
                  icon: "tabler:edit",
                  "aria-hidden": "true"
                })
              ], 8, Wr),
              e("button", {
                class: "ku-icon-btn ku-danger",
                "aria-label": `${a.bot_account ? "Disable" : "Delete"} ${a.full_name || a.email}`,
                onClick: (v) => Y(a)
              }, [
                _(y(C), {
                  icon: "tabler:trash",
                  "aria-hidden": "true"
                })
              ], 8, qr)
            ])
          ]))), 128))
        ])) : (i(), s("div", Tr, [
          e("div", Br, "No " + u(d.value === "bots" ? "bots" : "users") + " yet", 1),
          r[15] || (r[15] = e("div", { class: "ku-empty-sub" }, "Create your first user to grant access to the workspace.", -1)),
          e("button", {
            "aria-label": d.value === "bots" ? "Create bot" : "Create user",
            class: "ku-btn ku-btn-primary",
            onClick: K
          }, [
            _(y(C), {
              icon: "tabler:user-plus",
              "aria-hidden": "true"
            }),
            V(" " + u(d.value === "bots" ? "Create bot" : "Create user"), 1)
          ], 8, Mr)
        ]))
      ], 8, jr),
      f.value || S.value ? (i(), s("section", {
        key: 2,
        class: "ku-editor",
        role: "dialog",
        "aria-label": (f.value ? "Create " : "Edit ") + (b.value ? "bot" : "user")
      }, [
        e("h2", null, u(f.value ? "Create" : "Edit") + " " + u(b.value ? "bot" : "user"), 1),
        e("form", {
          class: "ku-form",
          onSubmit: r[12] || (r[12] = cr((a) => f.value ? O() : R(), ["prevent"]))
        }, [
          f.value ? (i(), s(z, { key: 0 }, [
            b.value ? h("", !0) : (i(), s("div", Jr, [
              r[16] || (r[16] = e("label", { class: "ku-label" }, "Email", -1)),
              k(e("input", {
                "onUpdate:modelValue": r[2] || (r[2] = (a) => c.value.email = a),
                type: "email",
                class: "ku-input",
                placeholder: "user@example.com"
              }, null, 512), [
                [$, c.value.email]
              ])
            ])),
            e("div", Gr, [
              r[17] || (r[17] = e("label", { class: "ku-label" }, "Full name", -1)),
              k(e("input", {
                "onUpdate:modelValue": r[3] || (r[3] = (a) => c.value.full_name = a),
                "aria-label": "Full name",
                type: "text",
                class: "ku-input",
                placeholder: "Jane Doe"
              }, null, 512), [
                [$, c.value.full_name]
              ])
            ]),
            b.value ? h("", !0) : (i(), s("div", Qr, [
              r[18] || (r[18] = e("label", { class: "ku-label" }, "Password", -1)),
              k(e("input", {
                "onUpdate:modelValue": r[4] || (r[4] = (a) => c.value.password = a),
                type: "password",
                class: "ku-input",
                placeholder: "Minimum 8 characters",
                autocomplete: "new-password"
              }, null, 512), [
                [$, c.value.password]
              ])
            ])),
            e("div", Xr, [
              r[20] || (r[20] = e("label", { class: "ku-label" }, "Security groups", -1)),
              b.value ? h("", !0) : (i(), s("label", Yr, [
                k(e("input", {
                  type: "checkbox",
                  "onUpdate:modelValue": r[5] || (r[5] = (a) => E.value = a),
                  "aria-label": "Use default membership"
                }, null, 512), [
                  [A, E.value]
                ]),
                r[19] || (r[19] = e("span", { class: "ku-check-label" }, "Use default membership", -1))
              ])),
              b.value || !E.value ? (i(!0), s(z, { key: 1 }, j(x.value, (a) => (i(), s("label", {
                key: a.id,
                class: "ku-check"
              }, [
                k(e("input", {
                  type: "checkbox",
                  "onUpdate:modelValue": r[6] || (r[6] = (v) => c.value.groups = v),
                  value: a.id
                }, null, 8, Zr), [
                  [A, c.value.groups]
                ]),
                e("span", ra, u(a.label), 1),
                e("span", aa, u(a.id), 1)
              ]))), 128)) : h("", !0)
            ])
          ], 64)) : (i(), s(z, { key: 1 }, [
            b.value ? h("", !0) : (i(), s("div", ea, [
              r[21] || (r[21] = e("label", { class: "ku-label" }, "Email", -1)),
              k(e("input", {
                "onUpdate:modelValue": r[7] || (r[7] = (a) => l.value.email = a),
                type: "email",
                class: "ku-input"
              }, null, 512), [
                [$, l.value.email]
              ])
            ])),
            e("div", oa, [
              r[22] || (r[22] = e("label", { class: "ku-label" }, "Full name", -1)),
              k(e("input", {
                "onUpdate:modelValue": r[8] || (r[8] = (a) => l.value.full_name = a),
                "aria-label": "Full name",
                type: "text",
                class: "ku-input"
              }, null, 512), [
                [$, l.value.full_name]
              ])
            ]),
            e("div", ta, [
              r[23] || (r[23] = e("label", { class: "ku-label" }, "Status", -1)),
              k(e("select", {
                "onUpdate:modelValue": r[9] || (r[9] = (a) => l.value.status = a),
                class: "ku-input",
                "aria-label": "Status"
              }, [
                (i(), s(z, null, j(n, (a) => e("option", {
                  key: a.value,
                  value: a.value
                }, u(a.label), 9, ia)), 64))
              ], 512), [
                [lr, l.value.status]
              ])
            ]),
            b.value ? h("", !0) : (i(), s("div", sa, [
              r[24] || (r[24] = e("label", { class: "ku-label" }, "New password", -1)),
              k(e("input", {
                "onUpdate:modelValue": r[10] || (r[10] = (a) => l.value.password = a),
                type: "password",
                class: "ku-input",
                placeholder: "Leave empty to keep current",
                autocomplete: "new-password"
              }, null, 512), [
                [$, l.value.password]
              ])
            ])),
            e("div", na, [
              r[25] || (r[25] = e("label", { class: "ku-label" }, "Security groups", -1)),
              (i(!0), s(z, null, j(x.value, (a) => (i(), s("label", {
                key: a.id,
                class: "ku-check"
              }, [
                k(e("input", {
                  type: "checkbox",
                  "onUpdate:modelValue": r[11] || (r[11] = (v) => l.value.groups = v),
                  value: a.id
                }, null, 8, pa), [
                  [A, l.value.groups]
                ]),
                e("span", ca, u(a.label), 1),
                e("span", la, u(a.id), 1)
              ]))), 128))
            ])
          ], 64))
        ], 32),
        e("div", ua, [
          e("button", {
            class: "ku-btn ku-btn-ghost",
            onClick: r[13] || (r[13] = (a) => {
              f.value = !1, S.value = !1;
            })
          }, "Cancel"),
          f.value ? (i(), s("button", {
            key: 0,
            class: "ku-btn ku-btn-primary",
            disabled: w.value || (b.value ? !c.value.full_name.trim() : !c.value.email || !c.value.password),
            onClick: O
          }, [
            _(y(C), {
              icon: w.value ? "tabler:loader-2" : "tabler:check",
              class: W(w.value && "spin"),
              "aria-hidden": "true"
            }, null, 8, ["icon", "class"]),
            r[26] || (r[26] = V(" Create ", -1))
          ], 8, da)) : (i(), s("button", {
            key: 1,
            class: "ku-btn ku-btn-primary",
            disabled: w.value,
            onClick: R
          }, [
            _(y(C), {
              icon: w.value ? "tabler:loader-2" : "tabler:device-floppy",
              class: W(w.value && "spin"),
              "aria-hidden": "true"
            }, null, 8, ["icon", "class"]),
            r[27] || (r[27] = V(" Save ", -1))
          ], 8, va))
        ])
      ], 8, Hr)) : h("", !0)
    ]));
  }
}), ma = ':root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}.spin{animation:kx-spin 1s linear infinite}@keyframes kx-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.spin{animation:none}}.kx-tag-sm,.kx-tag-sm.kx-tag-sm{display:inline-flex;align-items:center;gap:4px;padding:1px 7px;border-radius:var(--kx-radius-tag, 6px);font-size:10.5px;font-weight:600;line-height:1.5;white-space:nowrap}.kx-tag-sm svg,.kx-tag-sm.kx-tag-sm svg{width:12px;height:12px}.kx-tag-caps,.kx-tag-caps.kx-tag-caps{display:inline-flex;align-items:center;gap:3px;padding:2px 6px;border-radius:var(--kx-radius-tag, 6px);font-size:9px;font-weight:700;line-height:1.5;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap}.kx-tag-caps svg,.kx-tag-caps.kx-tag-caps svg{width:11px;height:11px}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}:host{display:block;height:100%;min-height:0}:host>div{height:100%;min-height:0}*,*:before,*:after{box-sizing:border-box}.ku{--system-surface-gutter: var(--kickside-system-surface-gutter, 24px);font-family:inherit;color:var(--p-text-color);background:var(--p-content-background);height:100%;display:flex;flex-direction:column;overflow-y:auto;overflow-x:hidden}.ku-bar{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;margin:0;padding:16px var(--system-surface-gutter) 10px;flex-wrap:wrap}.ku-count{font-size:12.5px;color:var(--p-text-muted-color)}.ku-err{width:calc(100% - (var(--system-surface-gutter) * 2));margin:0 0 8px var(--system-surface-gutter);padding:9px 12px;border-radius:10px;font-size:13px;background:color-mix(in srgb,var(--p-danger-500) 12%,transparent);color:var(--p-danger-600, var(--p-danger-500))}.ku-body{flex:1 0 auto;min-height:0;width:100%;margin:0;padding:6px var(--system-surface-gutter) 20px}.ku-loading{display:flex;align-items:center;gap:8px;color:var(--p-text-muted-color);font-size:13px;padding:24px}.ku-empty{text-align:center;padding:48px 24px;display:flex;flex-direction:column;align-items:center;gap:6px}.ku-empty-title{font-size:15px;font-weight:700;color:var(--p-text-color)}.ku-empty-sub{font-size:13px;color:var(--p-text-muted-color);margin-bottom:10px}.ku-list{display:flex;flex-direction:column;border:1px solid var(--p-content-border-color);border-radius:14px;overflow:hidden;background:var(--p-content-background);width:100%}.ku-row{display:grid;grid-template-columns:40px minmax(0,1.4fr) minmax(0,1.2fr) auto auto;align-items:center;gap:14px;padding:11px 16px;border-bottom:1px solid var(--p-content-border-color)}.ku-row:last-child{border-bottom:none}.ku-row:hover{background:color-mix(in srgb,var(--p-text-color) 6%,transparent)}.ku-avatar{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color);font-weight:700;font-size:13px}.ku-id{min-width:0}.ku-name{font-size:14px;font-weight:600;color:var(--p-text-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ku-email{font-size:12px;color:var(--p-text-muted-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ku-meta{display:flex;flex-wrap:wrap;gap:5px}.ku-badge{text-transform:capitalize}.ku-date{font-size:12px;color:var(--p-text-muted-color);white-space:nowrap}.ku-actions{display:flex;gap:6px;opacity:0;transition:opacity .15s}.ku-row:hover .ku-actions,.ku-row:focus-within .ku-actions{opacity:1}.ku-icon-btn{width:32px;height:32px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--p-content-border-color);background:transparent;color:var(--p-text-muted-color);cursor:pointer;transition:background .15s,color .15s}.ku-icon-btn:hover{color:var(--p-text-color);background:color-mix(in srgb,var(--p-text-color) 9%,transparent)}.ku-danger:hover{color:var(--p-danger-600, var(--p-danger-500));border-color:color-mix(in srgb,var(--p-danger-500) 40%,transparent)}.ku-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:34px;padding:0 14px;border-radius:8px;border:1px solid transparent;font:inherit;font-size:13px;font-weight:600;cursor:pointer;transition:filter .15s,background .15s,opacity .15s}.ku-btn:disabled{opacity:.45;cursor:default}.ku-btn-primary{background:var(--p-primary-color);color:var(--p-button-primary-color)}.ku-btn-primary:hover:not(:disabled){filter:brightness(1.05)}.ku-btn-ghost{background:transparent;border-color:var(--p-content-border-color);color:var(--p-text-color)}.ku-btn-ghost:hover{background:color-mix(in srgb,var(--p-text-color) 9%,transparent)}.ku-btn-danger{background:var(--p-danger-500);color:var(--p-button-danger-color)}.ku-btn-danger:hover:not(:disabled){background:var(--p-danger-600, color-mix(in srgb, var(--p-danger-500) 85%, var(--p-text-color)))}.ku-form{display:flex;flex-direction:column;gap:14px}.ku-field{display:flex;flex-direction:column;gap:6px}.ku-label{font-size:12px;font-weight:600;color:var(--p-text-muted-color)}.ku-input{width:100%;padding:8px 10px;font:inherit;font-size:13px;color:var(--p-text-color);background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:8px;transition:border-color .15s}.ku-check{display:flex;align-items:center;gap:8px;cursor:pointer}.ku-check input{accent-color:var(--p-primary-color)}.ku-check-label{font-size:13px;color:var(--p-text-color)}.ku-check-id{font-size:11px;color:var(--p-text-muted-color);font-family:ui-monospace,monospace}.ku-editor{margin:0 var(--system-surface-gutter) 20px;padding:16px;border:1px solid var(--p-content-border-color);border-radius:14px}.ku-editor h2{margin:0 0 12px;font-size:16px}', fa = { props: { type: "object", properties: {} } }, ba = {
  wippy: fa
};
class ha extends rr {
  static get wippyConfig() {
    return {
      propsSchema: ba.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: ma
    };
  }
  static get vueConfig() {
    return { rootComponent: ga, plugins: [tr] };
  }
}
dr(import.meta.url, ha);
//# sourceMappingURL=index.js.map
