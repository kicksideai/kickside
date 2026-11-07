import { P as se } from "./primevue-plugin-CaP7wV_M.js";
import { defineComponent as te, ref as m, computed as N, openBlock as t, createElementBlock as u, createVNode as r, unref as o, withCtx as b, createTextVNode as I, createElementVNode as l, toDisplayString as c, normalizeClass as S, createCommentVNode as y, Fragment as w, renderList as F, createBlock as A, withModifiers as oe, withDirectives as _, vModelText as T, vModelCheckbox as R, vModelSelect as ue } from "vue";
import { Icon as h } from "@iconify/vue";
import { api as L, host as ie } from "@wippy-fe/proxy";
import { b as ne } from "./wc-runtime-KO3cNuNo.js";
import O from "primevue/tag";
import C from "primevue/button";
import re from "primevue/dialog";
import J from "primevue/tab";
import de from "primevue/tablist";
import ce from "primevue/tabs";
import { f as ve } from "./datetime--PfqsqnZ.js";
const pe = { class: "ku" }, me = { class: "ku-bar" }, be = { class: "ku-count" }, fe = {
  key: 0,
  role: "alert",
  class: "kx-err"
}, ke = {
  key: 1,
  class: "kx-err"
}, ye = ["id"], _e = {
  key: 0,
  class: "kx-loading"
}, ge = {
  key: 1,
  class: "ku-empty kx-empty"
}, he = { class: "kx-empty-ico" }, we = { class: "kx-empty-title" }, Ce = { class: "kx-empty-sub" }, xe = { class: "kx-empty-actions" }, Ue = {
  key: 2,
  class: "ku-list"
}, De = ["aria-label"], Ve = { class: "ku-account" }, Se = { class: "ku-avatar" }, Te = { class: "ku-id" }, Ee = { class: "ku-name" }, $e = { class: "ku-email" }, Be = { class: "ku-meta" }, Fe = { class: "ku-date" }, Le = { class: "ku-actions" }, Me = { class: "kx-modal-head-icon" }, Ae = { class: "kx-modal-head-text" }, Pe = { class: "kx-modal-head-title" }, Ne = {
  key: 0,
  class: "ku-field"
}, Ie = { class: "ku-field" }, Re = {
  key: 1,
  class: "ku-field"
}, Oe = { class: "ku-field" }, ze = {
  key: 0,
  class: "ku-check"
}, je = ["value"], Ge = { class: "ku-check-label" }, He = {
  key: 0,
  class: "ku-field"
}, Je = { class: "ku-field" }, qe = { class: "ku-field" }, Ke = ["value"], Qe = {
  key: 1,
  class: "ku-field"
}, We = { class: "ku-field" }, Xe = ["value"], Ye = { class: "ku-check-label" }, Ze = {
  key: 2,
  role: "alert",
  class: "kx-err inline"
}, ea = {
  key: 3,
  class: "kx-err inline"
}, aa = /* @__PURE__ */ te({
  __name: "users",
  setup(la) {
    const q = [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
      { label: "Suspended", value: "suspended" },
      { label: "Pending", value: "pending" }
    ], K = {
      header: { class: "kx-dialog-header" },
      content: { class: "kx-dialog-content" },
      footer: { class: "kx-dialog-footer" }
    }, x = m([]), p = m("users"), M = m(!1), U = m([]), P = m(!1), v = m(""), D = m(""), k = m(!1), i = m({ email: "", full_name: "", password: "", groups: [] }), E = m(!0), g = m(!1), V = m(!1), n = m({ user_id: "", email: "", full_name: "", status: "", password: "", groups: [] }), $ = N({
      get: () => k.value || V.value,
      set: (s) => {
        s || (k.value = !1, V.value = !1);
      }
    }), z = N(() => (k.value ? "Create " : "Edit ") + (f.value ? "bot" : "user")), f = N(() => k.value ? p.value === "bots" : M.value);
    function Q(s) {
      switch (s) {
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
    function W(s) {
      return U.value.find((e) => e.id === s)?.label ?? s;
    }
    function X(s) {
      const e = U.value.find((a) => a.id === s);
      return s === "app.security:admin" ? "warn" : e && e.built_in === !1 ? "success" : "info";
    }
    function Y(s) {
      return (s.full_name || s.email).split(" ").map((a) => a[0]).join("").toUpperCase().slice(0, 2);
    }
    async function B() {
      P.value = !0, v.value = "";
      try {
        const { data: s } = await L.get(p.value === "bots" ? "/api/v1/users/bots" : "/api/v1/users");
        x.value = s.success ? s.users || [] : [];
      } catch (s) {
        x.value = [], v.value = s instanceof Error ? s.message : "failed to load users";
      } finally {
        P.value = !1;
      }
    }
    async function Z() {
      D.value = "";
      try {
        const { data: s } = await L.get("/api/v1/users/assignable-scopes"), e = s.success ? s.scopes || [] : [];
        U.value = e.map((a) => ({
          id: a.id,
          label: a.label || a.id,
          description: a.description,
          built_in: a.source === "builtin"
        }));
      } catch (s) {
        U.value = [], D.value = s instanceof Error ? s.message : "failed to load roles";
      }
    }
    async function ee(s) {
      p.value = s, k.value = !1, V.value = !1, await B();
    }
    function j() {
      i.value = { email: "", full_name: "", password: "", groups: [] }, E.value = !0, V.value = !1, k.value = !0;
    }
    async function G() {
      if (!(f.value ? !i.value.full_name.trim() : !i.value.email || !i.value.password)) {
        g.value = !0, v.value = "";
        try {
          const s = f.value ? { full_name: i.value.full_name, groups: i.value.groups } : {
            email: i.value.email,
            full_name: i.value.full_name,
            password: i.value.password,
            ...E.value ? {} : { groups: i.value.groups }
          }, { data: e } = await L.post(
            f.value ? "/api/v1/users/bots" : "/api/v1/users",
            s
          );
          e.success && e.user ? (k.value = !1, await B()) : v.value = e.error || "failed to create user";
        } catch (s) {
          v.value = s instanceof Error ? s.message : "failed to create user";
        } finally {
          g.value = !1;
        }
      }
    }
    function ae(s) {
      k.value = !1, M.value = s.bot_account === !0, n.value = {
        user_id: s.user_id,
        email: s.email,
        full_name: s.full_name,
        status: s.status,
        password: "",
        groups: [...s.security_groups]
      }, V.value = !0;
    }
    async function H() {
      const s = n.value.user_id;
      if (s) {
        g.value = !0, v.value = "";
        try {
          const e = {};
          !M.value && n.value.email && (e.email = n.value.email), n.value.full_name && (e.full_name = n.value.full_name), n.value.status && (e.status = n.value.status), !M.value && n.value.password && (e.password = n.value.password);
          const { data: a } = await L.put(`/api/v1/users/${s}`, { ...e, groups: n.value.groups });
          a.success ? (V.value = !1, await B()) : v.value = a.error || "failed to update user";
        } catch (e) {
          v.value = e instanceof Error ? e.message : "failed to update user";
        } finally {
          g.value = !1;
        }
      }
    }
    async function le(s) {
      const e = s.full_name || s.email;
      if (await ie.confirm({
        header: s.bot_account ? "Disable bot" : "Delete user",
        message: s.bot_account ? `Disable “${e}”? This revokes access and retains the account and its history.` : `Delete “${e}”? This permanently removes the user and revokes all access.`,
        icon: "tabler:trash",
        acceptLabel: s.bot_account ? "Disable" : "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      })) {
        v.value = "";
        try {
          const { data: d } = await L.delete(`/api/v1/users/${s.user_id}`);
          d.success ? await B() : v.value = d.error || "failed to delete user";
        } catch (d) {
          v.value = d instanceof Error ? d.message : "failed to delete user";
        }
      }
    }
    return ne(async () => {
      await Z(), await B();
    }), (s, e) => (t(), u("div", pe, [
      r(o(ce), {
        class: "ku-tabs",
        value: p.value,
        "onUpdate:value": e[0] || (e[0] = (a) => ee(a))
      }, {
        default: b(() => [
          r(o(de), { pt: { tabList: { "aria-label": "Account type" } } }, {
            default: b(() => [
              r(o(J), {
                value: "users",
                "aria-controls": "users-accounts"
              }, {
                default: b(() => [...e[14] || (e[14] = [
                  I("All users", -1)
                ])]),
                _: 1
              }),
              r(o(J), {
                value: "bots",
                "aria-controls": "users-bots"
              }, {
                default: b(() => [...e[15] || (e[15] = [
                  I("Bots", -1)
                ])]),
                _: 1
              })
            ]),
            _: 1
          })
        ]),
        _: 1
      }, 8, ["value"]),
      l("div", me, [
        l("span", be, c(x.value.length) + " " + c(p.value === "bots" ? "bot" : "user") + c(x.value.length !== 1 ? "s" : ""), 1),
        r(o(C), {
          type: "button",
          "aria-label": p.value === "bots" ? "Create bot" : "Create user",
          class: "ku-btn-primary",
          label: p.value === "bots" ? "Create bot" : "Create user",
          onClick: j
        }, {
          icon: b(({ class: a }) => [
            r(o(h), {
              icon: "tabler:user-plus",
              class: S(a),
              "aria-hidden": "true"
            }, null, 8, ["class"])
          ]),
          _: 1
        }, 8, ["aria-label", "label"])
      ]),
      v.value && !$.value ? (t(), u("div", fe, c(v.value), 1)) : y("", !0),
      D.value && !$.value ? (t(), u("div", ke, c(D.value), 1)) : y("", !0),
      l("div", {
        class: "ku-body",
        role: "tabpanel",
        id: p.value === "bots" ? "users-bots" : "users-accounts"
      }, [
        P.value ? (t(), u("div", _e, [
          r(o(h), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          e[16] || (e[16] = I(" Loading…", -1))
        ])) : x.value.length ? (t(), u("div", Ue, [
          l("table", {
            class: "ku-table",
            "aria-label": p.value === "bots" ? "Bots" : "All users"
          }, [
            e[17] || (e[17] = l("thead", null, [
              l("tr", null, [
                l("th", { scope: "col" }, "Account"),
                l("th", { scope: "col" }, "Status"),
                l("th", { scope: "col" }, "Roles"),
                l("th", { scope: "col" }, "Created"),
                l("th", { scope: "col" }, [
                  l("span", { class: "sr-only" }, "Actions")
                ])
              ])
            ], -1)),
            l("tbody", null, [
              (t(!0), u(w, null, F(x.value, (a) => (t(), u("tr", {
                key: a.user_id,
                class: "ku-row"
              }, [
                l("td", null, [
                  l("div", Ve, [
                    l("span", Se, c(Y(a)), 1),
                    l("div", Te, [
                      l("div", Ee, c(a.full_name || a.email), 1),
                      l("div", $e, c(a.email), 1)
                    ]),
                    a.bot_account ? (t(), A(o(O), {
                      key: 0,
                      severity: "info",
                      value: "Bot",
                      class: "ku-badge kx-tag-sm"
                    })) : y("", !0)
                  ])
                ]),
                l("td", null, [
                  r(o(O), {
                    severity: Q(a.status),
                    value: a.status,
                    class: "ku-badge kx-tag-sm"
                  }, null, 8, ["severity", "value"])
                ]),
                l("td", null, [
                  l("div", Be, [
                    (t(!0), u(w, null, F(a.security_groups, (d) => (t(), A(o(O), {
                      key: d,
                      severity: X(d),
                      value: W(d),
                      class: "ku-badge kx-tag-sm"
                    }, null, 8, ["severity", "value"]))), 128))
                  ])
                ]),
                l("td", Fe, c(o(ve)(a.created_at, { month: "short", day: "numeric", year: "numeric" })), 1),
                l("td", null, [
                  l("div", Le, [
                    r(o(C), {
                      type: "button",
                      severity: "secondary",
                      outlined: "",
                      size: "small",
                      "aria-label": `Edit ${a.full_name || a.email}`,
                      onClick: (d) => ae(a)
                    }, {
                      icon: b(({ class: d }) => [
                        r(o(h), {
                          icon: "tabler:edit",
                          class: S(d),
                          "aria-hidden": "true"
                        }, null, 8, ["class"])
                      ]),
                      _: 1
                    }, 8, ["aria-label", "onClick"]),
                    r(o(C), {
                      type: "button",
                      severity: "danger",
                      outlined: "",
                      size: "small",
                      "aria-label": `${a.bot_account ? "Disable" : "Delete"} ${a.full_name || a.email}`,
                      onClick: (d) => le(a)
                    }, {
                      icon: b(({ class: d }) => [
                        r(o(h), {
                          icon: "tabler:trash",
                          class: S(d),
                          "aria-hidden": "true"
                        }, null, 8, ["class"])
                      ]),
                      _: 1
                    }, 8, ["aria-label", "onClick"])
                  ])
                ])
              ]))), 128))
            ])
          ], 8, De)
        ])) : (t(), u("div", ge, [
          l("div", he, [
            r(o(h), {
              icon: p.value === "bots" ? "tabler:robot" : "tabler:users",
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ]),
          l("div", we, "No " + c(p.value === "bots" ? "bots" : "users") + " yet", 1),
          l("div", Ce, c(p.value === "bots" ? "Create a bot account and choose its roles." : "Create your first user to grant access to the workspace."), 1),
          l("div", xe, [
            r(o(C), {
              type: "button",
              "aria-label": p.value === "bots" ? "Create bot" : "Create user",
              class: "ku-btn-primary",
              label: p.value === "bots" ? "Create bot" : "Create user",
              onClick: j
            }, {
              icon: b(({ class: a }) => [
                r(o(h), {
                  icon: "tabler:user-plus",
                  class: S(a),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }, 8, ["aria-label", "label"])
          ])
        ]))
      ], 8, ye),
      r(o(re), {
        visible: $.value,
        "onUpdate:visible": e[13] || (e[13] = (a) => $.value = a),
        modal: "",
        class: "kx-dialog",
        pt: K,
        "aria-label": z.value
      }, {
        header: b(() => [
          l("span", Me, [
            r(o(h), {
              icon: f.value ? "tabler:robot" : "tabler:user",
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ]),
          l("span", Ae, [
            l("span", Pe, c(z.value), 1)
          ])
        ]),
        footer: b(() => [
          r(o(C), {
            type: "button",
            label: "Cancel",
            severity: "secondary",
            outlined: "",
            disabled: g.value,
            onClick: e[12] || (e[12] = (a) => $.value = !1)
          }, null, 8, ["disabled"]),
          k.value ? (t(), A(o(C), {
            key: 0,
            type: "button",
            label: "Create",
            class: "ku-btn-primary",
            loading: g.value,
            disabled: g.value || (f.value ? !i.value.full_name.trim() : !i.value.email || !i.value.password),
            onClick: G
          }, {
            icon: b(({ class: a }) => [
              r(o(h), {
                icon: "tabler:check",
                class: S(a),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          }, 8, ["loading", "disabled"])) : (t(), A(o(C), {
            key: 1,
            type: "button",
            label: "Save",
            class: "ku-btn-primary",
            loading: g.value,
            disabled: g.value,
            onClick: H
          }, {
            icon: b(({ class: a }) => [
              r(o(h), {
                icon: "tabler:device-floppy",
                class: S(a),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          }, 8, ["loading", "disabled"]))
        ]),
        default: b(() => [
          l("form", {
            class: "ku-form",
            onSubmit: e[11] || (e[11] = oe((a) => k.value ? G() : H(), ["prevent"]))
          }, [
            k.value ? (t(), u(w, { key: 0 }, [
              f.value ? y("", !0) : (t(), u("div", Ne, [
                e[18] || (e[18] = l("label", {
                  class: "ku-label",
                  for: "account-email"
                }, "Email", -1)),
                _(l("input", {
                  id: "account-email",
                  "onUpdate:modelValue": e[1] || (e[1] = (a) => i.value.email = a),
                  type: "email",
                  class: "ku-input",
                  placeholder: "user@example.com"
                }, null, 512), [
                  [T, i.value.email]
                ])
              ])),
              l("div", Ie, [
                e[19] || (e[19] = l("label", {
                  class: "ku-label",
                  for: "account-name"
                }, "Full name", -1)),
                _(l("input", {
                  id: "account-name",
                  "onUpdate:modelValue": e[2] || (e[2] = (a) => i.value.full_name = a),
                  "aria-label": "Full name",
                  type: "text",
                  class: "ku-input",
                  placeholder: "Jane Doe"
                }, null, 512), [
                  [T, i.value.full_name]
                ])
              ]),
              f.value ? y("", !0) : (t(), u("div", Re, [
                e[20] || (e[20] = l("label", {
                  class: "ku-label",
                  for: "account-password"
                }, "Password", -1)),
                _(l("input", {
                  id: "account-password",
                  "onUpdate:modelValue": e[3] || (e[3] = (a) => i.value.password = a),
                  type: "password",
                  class: "ku-input",
                  placeholder: "Minimum 8 characters",
                  autocomplete: "new-password"
                }, null, 512), [
                  [T, i.value.password]
                ])
              ])),
              l("div", Oe, [
                e[22] || (e[22] = l("label", { class: "ku-label" }, "Roles", -1)),
                f.value ? y("", !0) : (t(), u("label", ze, [
                  _(l("input", {
                    type: "checkbox",
                    "onUpdate:modelValue": e[4] || (e[4] = (a) => E.value = a),
                    "aria-label": "Use the default Member role"
                  }, null, 512), [
                    [R, E.value]
                  ]),
                  e[21] || (e[21] = l("span", { class: "ku-check-label" }, "Use the default Member role", -1))
                ])),
                f.value || !E.value ? (t(!0), u(w, { key: 1 }, F(U.value, (a) => (t(), u("label", {
                  key: a.id,
                  class: "ku-check"
                }, [
                  _(l("input", {
                    type: "checkbox",
                    "onUpdate:modelValue": e[5] || (e[5] = (d) => i.value.groups = d),
                    value: a.id
                  }, null, 8, je), [
                    [R, i.value.groups]
                  ]),
                  l("span", Ge, c(a.label), 1)
                ]))), 128)) : y("", !0)
              ])
            ], 64)) : (t(), u(w, { key: 1 }, [
              f.value ? y("", !0) : (t(), u("div", He, [
                e[23] || (e[23] = l("label", {
                  class: "ku-label",
                  for: "account-email"
                }, "Email", -1)),
                _(l("input", {
                  id: "account-email",
                  "onUpdate:modelValue": e[6] || (e[6] = (a) => n.value.email = a),
                  type: "email",
                  class: "ku-input"
                }, null, 512), [
                  [T, n.value.email]
                ])
              ])),
              l("div", Je, [
                e[24] || (e[24] = l("label", {
                  class: "ku-label",
                  for: "account-name"
                }, "Full name", -1)),
                _(l("input", {
                  id: "account-name",
                  "onUpdate:modelValue": e[7] || (e[7] = (a) => n.value.full_name = a),
                  "aria-label": "Full name",
                  type: "text",
                  class: "ku-input"
                }, null, 512), [
                  [T, n.value.full_name]
                ])
              ]),
              l("div", qe, [
                e[25] || (e[25] = l("label", { class: "ku-label" }, "Status", -1)),
                _(l("select", {
                  "onUpdate:modelValue": e[8] || (e[8] = (a) => n.value.status = a),
                  class: "ku-input",
                  "aria-label": "Status"
                }, [
                  (t(), u(w, null, F(q, (a) => l("option", {
                    key: a.value,
                    value: a.value
                  }, c(a.label), 9, Ke)), 64))
                ], 512), [
                  [ue, n.value.status]
                ])
              ]),
              f.value ? y("", !0) : (t(), u("div", Qe, [
                e[26] || (e[26] = l("label", {
                  class: "ku-label",
                  for: "account-password"
                }, "New password", -1)),
                _(l("input", {
                  id: "account-password",
                  "onUpdate:modelValue": e[9] || (e[9] = (a) => n.value.password = a),
                  type: "password",
                  class: "ku-input",
                  placeholder: "Leave empty to keep current",
                  autocomplete: "new-password"
                }, null, 512), [
                  [T, n.value.password]
                ])
              ])),
              l("div", We, [
                e[27] || (e[27] = l("label", { class: "ku-label" }, "Roles", -1)),
                (t(!0), u(w, null, F(U.value, (a) => (t(), u("label", {
                  key: a.id,
                  class: "ku-check"
                }, [
                  _(l("input", {
                    type: "checkbox",
                    "onUpdate:modelValue": e[10] || (e[10] = (d) => n.value.groups = d),
                    value: a.id
                  }, null, 8, Xe), [
                    [R, n.value.groups]
                  ]),
                  l("span", Ye, c(a.label), 1)
                ]))), 128))
              ])
            ], 64)),
            e[28] || (e[28] = l("p", { class: "ku-role-help" }, "Permissions from all assigned roles apply. For restricted access, create a custom role in System → Security and assign it instead of Member.", -1)),
            v.value ? (t(), u("div", Ze, c(v.value), 1)) : y("", !0),
            D.value ? (t(), u("div", ea, c(D.value), 1)) : y("", !0)
          ], 32)
        ]),
        _: 1
      }, 8, ["visible", "aria-label"])
    ]));
  }
}), ba = {
  rootComponent: aa,
  plugins: [se]
};
export {
  ba as mountConfig
};
//# sourceMappingURL=index-mount-DXHEwMWi.js.map
