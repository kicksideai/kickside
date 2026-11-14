import { P as oe } from "./primevue-plugin-CaP7wV_M.js";
import { defineComponent as H, openBlock as t, createElementBlock as u, createElementVNode as s, createVNode as n, unref as o, toDisplayString as v, renderSlot as ue, createTextVNode as J, createCommentVNode as b, createBlock as C, createSlots as ne, withCtx as p, normalizeClass as F, Fragment as U, renderList as N, mergeProps as ie, ref as y, computed as z, withModifiers as re, withDirectives as g, vModelText as B, vModelCheckbox as j, vModelSelect as ce } from "vue";
import { Icon as x } from "@iconify/vue";
import D from "primevue/button";
import de from "primevue/tab";
import ve from "primevue/tablist";
import pe from "primevue/tabs";
import { api as A, host as me } from "@wippy-fe/proxy";
import { b as be } from "./wc-runtime-KO3cNuNo.js";
import G from "primevue/tag";
import fe from "primevue/dialog";
import ke from "primevue/datatable";
import I from "primevue/column";
import { f as ye } from "./datetime--PfqsqnZ.js";
const _e = { class: "kx-empty" }, he = { class: "kx-empty-ico" }, ge = { class: "kx-empty-title" }, we = {
  key: 0,
  class: "kx-empty-sub"
}, xe = /* @__PURE__ */ H({
  __name: "EmptyState",
  props: {
    icon: {},
    title: {},
    hint: {},
    cta: {},
    ctaIcon: {}
  },
  emits: ["cta"],
  setup(f) {
    return ($, S) => (t(), u("div", _e, [
      s("div", he, [
        n(o(x), {
          icon: f.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])
      ]),
      s("div", ge, v(f.title), 1),
      f.hint || $.$slots.hint ? (t(), u("p", we, [
        ue($.$slots, "hint", {}, () => [
          J(v(f.hint), 1)
        ])
      ])) : b("", !0),
      f.cta ? (t(), C(o(D), {
        key: 1,
        label: f.cta,
        onClick: S[0] || (S[0] = (c) => $.$emit("cta"))
      }, ne({ _: 2 }, [
        f.ctaIcon ? {
          name: "icon",
          fn: p(({ class: c }) => [
            n(o(x), {
              icon: f.ctaIcon,
              class: F(c),
              "aria-hidden": "true"
            }, null, 8, ["icon", "class"])
          ]),
          key: "0"
        } : void 0
      ]), 1032, ["label"])) : b("", !0)
    ]));
  }
}), Ce = {
  key: 0,
  class: "kx-system-tab-count"
}, $e = /* @__PURE__ */ H({
  __name: "SystemTabs",
  props: {
    value: {},
    label: {},
    items: {}
  },
  emits: ["update:value"],
  setup(f) {
    return ($, S) => (t(), C(o(pe), {
      class: "kx-system-tabs",
      "data-kx-separator": "surface",
      value: f.value,
      "onUpdate:value": S[0] || (S[0] = (c) => $.$emit("update:value", String(c)))
    }, {
      default: p(() => [
        n(o(ve), {
          pt: { tabList: { "aria-label": f.label } }
        }, {
          default: p(() => [
            (t(!0), u(U, null, N(f.items, (c) => (t(), C(o(de), ie({
              key: c.value,
              value: c.value
            }, { ref_for: !0 }, c.controls ? { "aria-controls": c.controls } : {}), {
              default: p(() => [
                J(v(c.label), 1),
                c.count !== void 0 ? (t(), u("b", Ce, v(c.count), 1)) : b("", !0)
              ]),
              _: 2
            }, 1040, ["value"]))), 128))
          ]),
          _: 1
        }, 8, ["pt"])
      ]),
      _: 1
    }, 8, ["value"]));
  }
}), Se = { class: "ku" }, Ue = { class: "kx-system-pane" }, De = { class: "kx-system-tools" }, Te = { class: "ku-bar kx-system-toolbar" }, Ve = { class: "ku-count" }, Ee = {
  key: 0,
  role: "alert",
  class: "kx-err"
}, Be = {
  key: 1,
  class: "kx-err"
}, Fe = ["id"], Le = {
  key: 0,
  class: "kx-loading"
}, Me = { class: "ku-account" }, Pe = { class: "ku-avatar" }, Ae = { class: "ku-id" }, Ie = { class: "ku-name" }, Ne = { class: "ku-email" }, Re = { class: "ku-meta" }, Oe = { class: "ku-date" }, ze = { class: "ku-actions" }, je = { class: "kx-modal-head-icon" }, Ge = { class: "kx-modal-head-text" }, He = { class: "kx-modal-head-title" }, Je = {
  key: 0,
  class: "ku-field"
}, qe = { class: "ku-field" }, Ke = {
  key: 1,
  class: "ku-field"
}, Qe = { class: "ku-field" }, We = {
  key: 0,
  class: "ku-check"
}, Xe = ["value"], Ye = { class: "ku-check-label" }, Ze = {
  key: 0,
  class: "ku-field"
}, ea = { class: "ku-field" }, aa = { class: "ku-field" }, la = ["value"], sa = {
  key: 1,
  class: "ku-field"
}, ta = { class: "ku-field" }, oa = ["value"], ua = { class: "ku-check-label" }, na = {
  key: 2,
  role: "alert",
  class: "kx-err inline"
}, ia = {
  key: 3,
  class: "kx-err inline"
}, ra = /* @__PURE__ */ H({
  __name: "users",
  setup(f) {
    const $ = [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
      { label: "Suspended", value: "suspended" },
      { label: "Pending", value: "pending" }
    ], S = {
      header: { class: "kx-dialog-header" },
      content: { class: "kx-dialog-content" },
      footer: { class: "kx-dialog-footer" }
    }, c = y([]), k = y("users"), R = y(!1), T = y([]), O = y(!1), m = y(""), V = y(""), h = y(!1), i = y({ email: "", full_name: "", password: "", groups: [] }), L = y(!0), w = y(!1), E = y(!1), r = y({ user_id: "", email: "", full_name: "", status: "", password: "", groups: [] }), M = z({
      get: () => h.value || E.value,
      set: (l) => {
        l || (h.value = !1, E.value = !1);
      }
    }), q = z(() => (h.value ? "Create " : "Edit ") + (_.value ? "bot" : "user")), _ = z(() => h.value ? k.value === "bots" : R.value);
    function X(l) {
      switch (l) {
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
    function Y(l) {
      return T.value.find((e) => e.id === l)?.label ?? l;
    }
    function Z(l) {
      const e = T.value.find((a) => a.id === l);
      return l === "app.security:admin" ? "warn" : e && e.built_in === !1 ? "success" : "info";
    }
    function ee(l) {
      return (l.full_name || l.email).split(" ").map((a) => a[0]).join("").toUpperCase().slice(0, 2);
    }
    async function P() {
      O.value = !0, m.value = "";
      try {
        const { data: l } = await A.get(k.value === "bots" ? "/api/v1/users/bots" : "/api/v1/users");
        c.value = l.success ? l.users || [] : [];
      } catch (l) {
        c.value = [], m.value = l instanceof Error ? l.message : "failed to load users";
      } finally {
        O.value = !1;
      }
    }
    async function ae() {
      V.value = "";
      try {
        const { data: l } = await A.get("/api/v1/users/assignable-scopes"), e = l.success ? l.scopes || [] : [];
        T.value = e.map((a) => ({
          id: a.id,
          label: a.label || a.id,
          description: a.description,
          built_in: a.source === "builtin"
        }));
      } catch (l) {
        T.value = [], V.value = l instanceof Error ? l.message : "failed to load roles";
      }
    }
    async function le(l) {
      k.value = l, h.value = !1, E.value = !1, await P();
    }
    function K() {
      i.value = { email: "", full_name: "", password: "", groups: [] }, L.value = !0, E.value = !1, h.value = !0;
    }
    async function Q() {
      if (!(_.value ? !i.value.full_name.trim() : !i.value.email || !i.value.password)) {
        w.value = !0, m.value = "";
        try {
          const l = _.value ? { full_name: i.value.full_name, groups: i.value.groups } : {
            email: i.value.email,
            full_name: i.value.full_name,
            password: i.value.password,
            ...L.value ? {} : { groups: i.value.groups }
          }, { data: e } = await A.post(
            _.value ? "/api/v1/users/bots" : "/api/v1/users",
            l
          );
          e.success && e.user ? (h.value = !1, await P()) : m.value = e.error || "failed to create user";
        } catch (l) {
          m.value = l instanceof Error ? l.message : "failed to create user";
        } finally {
          w.value = !1;
        }
      }
    }
    function se(l) {
      h.value = !1, R.value = l.bot_account === !0, r.value = {
        user_id: l.user_id,
        email: l.email,
        full_name: l.full_name,
        status: l.status,
        password: "",
        groups: [...l.security_groups]
      }, E.value = !0;
    }
    async function W() {
      const l = r.value.user_id;
      if (l) {
        w.value = !0, m.value = "";
        try {
          const e = {};
          !R.value && r.value.email && (e.email = r.value.email), r.value.full_name && (e.full_name = r.value.full_name), r.value.status && (e.status = r.value.status), !R.value && r.value.password && (e.password = r.value.password);
          const { data: a } = await A.put(`/api/v1/users/${l}`, { ...e, groups: r.value.groups });
          a.success ? (E.value = !1, await P()) : m.value = a.error || "failed to update user";
        } catch (e) {
          m.value = e instanceof Error ? e.message : "failed to update user";
        } finally {
          w.value = !1;
        }
      }
    }
    async function te(l) {
      const e = l.full_name || l.email;
      if (await me.confirm({
        header: l.bot_account ? "Disable bot" : "Delete user",
        message: l.bot_account ? `Disable “${e}”? This revokes access and retains the account and its history.` : `Delete “${e}”? This permanently removes the user and revokes all access.`,
        icon: "tabler:trash",
        acceptLabel: l.bot_account ? "Disable" : "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      })) {
        m.value = "";
        try {
          const { data: d } = await A.delete(`/api/v1/users/${l.user_id}`);
          d.success ? await P() : m.value = d.error || "failed to delete user";
        } catch (d) {
          m.value = d instanceof Error ? d.message : "failed to delete user";
        }
      }
    }
    return be(async () => {
      await ae(), await P();
    }), (l, e) => (t(), u("div", Se, [
      n($e, {
        value: k.value,
        label: "Account type",
        items: [
          { value: "users", label: "All users", controls: "users-accounts" },
          { value: "bots", label: "Bots", controls: "users-bots" }
        ],
        "onUpdate:value": e[0] || (e[0] = (a) => le(a))
      }, null, 8, ["value"]),
      s("div", Ue, [
        s("div", De, [
          s("div", Te, [
            s("span", Ve, v(c.value.length) + " " + v(k.value === "bots" ? "bot" : "user") + v(c.value.length !== 1 ? "s" : ""), 1),
            n(o(D), {
              type: "button",
              "aria-label": k.value === "bots" ? "Create bot" : "Create user",
              class: "ku-btn-primary",
              label: k.value === "bots" ? "Create bot" : "Create user",
              onClick: K
            }, {
              icon: p(({ class: a }) => [
                n(o(x), {
                  icon: "tabler:user-plus",
                  class: F(a),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }, 8, ["aria-label", "label"])
          ]),
          m.value && !M.value ? (t(), u("div", Ee, v(m.value), 1)) : b("", !0),
          V.value && !M.value ? (t(), u("div", Be, v(V.value), 1)) : b("", !0)
        ]),
        s("div", {
          class: "ku-body kx-system-body",
          role: "tabpanel",
          id: k.value === "bots" ? "users-bots" : "users-accounts"
        }, [
          O.value ? (t(), u("div", Le, [
            n(o(x), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            e[14] || (e[14] = J(" Loading…", -1))
          ])) : c.value.length ? (t(), C(o(ke), {
            key: 2,
            value: c.value,
            "data-key": "user_id",
            class: "ku-list",
            "row-class": () => "ku-row",
            pt: { table: { "aria-label": k.value === "bots" ? "Bots" : "All users" } }
          }, {
            default: p(() => [
              n(o(I), { header: "Account" }, {
                body: p(({ data: a }) => [
                  s("div", Me, [
                    s("span", Pe, v(ee(a)), 1),
                    s("div", Ae, [
                      s("div", Ie, v(a.full_name || a.email), 1),
                      s("div", Ne, v(a.email), 1)
                    ]),
                    a.bot_account ? (t(), C(o(G), {
                      key: 0,
                      severity: "info",
                      value: "Bot",
                      class: "ku-badge kx-tag-sm"
                    })) : b("", !0)
                  ])
                ]),
                _: 1
              }),
              n(o(I), { header: "Status" }, {
                body: p(({ data: a }) => [
                  n(o(G), {
                    severity: X(a.status),
                    value: a.status,
                    class: "ku-badge kx-tag-sm"
                  }, null, 8, ["severity", "value"])
                ]),
                _: 1
              }),
              n(o(I), { header: "Roles" }, {
                body: p(({ data: a }) => [
                  s("div", Re, [
                    (t(!0), u(U, null, N(a.security_groups, (d) => (t(), C(o(G), {
                      key: d,
                      severity: Z(d),
                      value: Y(d),
                      class: "ku-badge kx-tag-sm"
                    }, null, 8, ["severity", "value"]))), 128))
                  ])
                ]),
                _: 1
              }),
              n(o(I), { header: "Created" }, {
                body: p(({ data: a }) => [
                  s("span", Oe, v(o(ye)(a.created_at, { month: "short", day: "numeric", year: "numeric" })), 1)
                ]),
                _: 1
              }),
              n(o(I), { header: "Actions" }, {
                body: p(({ data: a }) => [
                  s("div", ze, [
                    n(o(D), {
                      type: "button",
                      severity: "secondary",
                      outlined: "",
                      size: "small",
                      "aria-label": `Edit ${a.full_name || a.email}`,
                      onClick: (d) => se(a)
                    }, {
                      icon: p(({ class: d }) => [
                        n(o(x), {
                          icon: "tabler:edit",
                          class: F(d),
                          "aria-hidden": "true"
                        }, null, 8, ["class"])
                      ]),
                      _: 1
                    }, 8, ["aria-label", "onClick"]),
                    n(o(D), {
                      type: "button",
                      severity: "danger",
                      outlined: "",
                      size: "small",
                      "aria-label": `${a.bot_account ? "Disable" : "Delete"} ${a.full_name || a.email}`,
                      onClick: (d) => te(a)
                    }, {
                      icon: p(({ class: d }) => [
                        n(o(x), {
                          icon: "tabler:trash",
                          class: F(d),
                          "aria-hidden": "true"
                        }, null, 8, ["class"])
                      ]),
                      _: 1
                    }, 8, ["aria-label", "onClick"])
                  ])
                ]),
                _: 1
              })
            ]),
            _: 1
          }, 8, ["value", "pt"])) : (t(), C(xe, {
            key: 1,
            icon: k.value === "bots" ? "tabler:robot" : "tabler:users",
            title: k.value === "bots" ? "No bots yet" : "No users yet",
            hint: k.value === "bots" ? "Create a bot account and choose its roles." : "Create your first user to grant access to the workspace.",
            cta: k.value === "bots" ? "Create bot" : "Create user",
            "cta-icon": "tabler:user-plus",
            onCta: K
          }, null, 8, ["icon", "title", "hint", "cta"]))
        ], 8, Fe)
      ]),
      n(o(fe), {
        visible: M.value,
        "onUpdate:visible": e[13] || (e[13] = (a) => M.value = a),
        modal: "",
        class: "kx-dialog",
        pt: S,
        "aria-label": q.value
      }, {
        header: p(() => [
          s("span", je, [
            n(o(x), {
              icon: _.value ? "tabler:robot" : "tabler:user",
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ]),
          s("span", Ge, [
            s("span", He, v(q.value), 1)
          ])
        ]),
        footer: p(() => [
          n(o(D), {
            type: "button",
            label: "Cancel",
            severity: "secondary",
            outlined: "",
            disabled: w.value,
            onClick: e[12] || (e[12] = (a) => M.value = !1)
          }, null, 8, ["disabled"]),
          h.value ? (t(), C(o(D), {
            key: 0,
            type: "button",
            label: "Create",
            class: "ku-btn-primary",
            loading: w.value,
            disabled: w.value || (_.value ? !i.value.full_name.trim() : !i.value.email || !i.value.password),
            onClick: Q
          }, {
            icon: p(({ class: a }) => [
              n(o(x), {
                icon: "tabler:check",
                class: F(a),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          }, 8, ["loading", "disabled"])) : (t(), C(o(D), {
            key: 1,
            type: "button",
            label: "Save",
            class: "ku-btn-primary",
            loading: w.value,
            disabled: w.value,
            onClick: W
          }, {
            icon: p(({ class: a }) => [
              n(o(x), {
                icon: "tabler:device-floppy",
                class: F(a),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          }, 8, ["loading", "disabled"]))
        ]),
        default: p(() => [
          s("form", {
            class: "ku-form",
            onSubmit: e[11] || (e[11] = re((a) => h.value ? Q() : W(), ["prevent"]))
          }, [
            h.value ? (t(), u(U, { key: 0 }, [
              _.value ? b("", !0) : (t(), u("div", Je, [
                e[15] || (e[15] = s("label", {
                  class: "ku-label",
                  for: "account-email"
                }, "Email", -1)),
                g(s("input", {
                  id: "account-email",
                  "onUpdate:modelValue": e[1] || (e[1] = (a) => i.value.email = a),
                  type: "email",
                  class: "ku-input",
                  placeholder: "user@example.com"
                }, null, 512), [
                  [B, i.value.email]
                ])
              ])),
              s("div", qe, [
                e[16] || (e[16] = s("label", {
                  class: "ku-label",
                  for: "account-name"
                }, "Full name", -1)),
                g(s("input", {
                  id: "account-name",
                  "onUpdate:modelValue": e[2] || (e[2] = (a) => i.value.full_name = a),
                  "aria-label": "Full name",
                  type: "text",
                  class: "ku-input",
                  placeholder: "Jane Doe"
                }, null, 512), [
                  [B, i.value.full_name]
                ])
              ]),
              _.value ? b("", !0) : (t(), u("div", Ke, [
                e[17] || (e[17] = s("label", {
                  class: "ku-label",
                  for: "account-password"
                }, "Password", -1)),
                g(s("input", {
                  id: "account-password",
                  "onUpdate:modelValue": e[3] || (e[3] = (a) => i.value.password = a),
                  type: "password",
                  class: "ku-input",
                  placeholder: "Minimum 8 characters",
                  autocomplete: "new-password"
                }, null, 512), [
                  [B, i.value.password]
                ])
              ])),
              s("div", Qe, [
                e[19] || (e[19] = s("label", { class: "ku-label" }, "Roles", -1)),
                _.value ? b("", !0) : (t(), u("label", We, [
                  g(s("input", {
                    type: "checkbox",
                    "onUpdate:modelValue": e[4] || (e[4] = (a) => L.value = a),
                    "aria-label": "Use the default Member role"
                  }, null, 512), [
                    [j, L.value]
                  ]),
                  e[18] || (e[18] = s("span", { class: "ku-check-label" }, "Use the default Member role", -1))
                ])),
                _.value || !L.value ? (t(!0), u(U, { key: 1 }, N(T.value, (a) => (t(), u("label", {
                  key: a.id,
                  class: "ku-check"
                }, [
                  g(s("input", {
                    type: "checkbox",
                    "onUpdate:modelValue": e[5] || (e[5] = (d) => i.value.groups = d),
                    value: a.id
                  }, null, 8, Xe), [
                    [j, i.value.groups]
                  ]),
                  s("span", Ye, v(a.label), 1)
                ]))), 128)) : b("", !0)
              ])
            ], 64)) : (t(), u(U, { key: 1 }, [
              _.value ? b("", !0) : (t(), u("div", Ze, [
                e[20] || (e[20] = s("label", {
                  class: "ku-label",
                  for: "account-email"
                }, "Email", -1)),
                g(s("input", {
                  id: "account-email",
                  "onUpdate:modelValue": e[6] || (e[6] = (a) => r.value.email = a),
                  type: "email",
                  class: "ku-input"
                }, null, 512), [
                  [B, r.value.email]
                ])
              ])),
              s("div", ea, [
                e[21] || (e[21] = s("label", {
                  class: "ku-label",
                  for: "account-name"
                }, "Full name", -1)),
                g(s("input", {
                  id: "account-name",
                  "onUpdate:modelValue": e[7] || (e[7] = (a) => r.value.full_name = a),
                  "aria-label": "Full name",
                  type: "text",
                  class: "ku-input"
                }, null, 512), [
                  [B, r.value.full_name]
                ])
              ]),
              s("div", aa, [
                e[22] || (e[22] = s("label", { class: "ku-label" }, "Status", -1)),
                g(s("select", {
                  "onUpdate:modelValue": e[8] || (e[8] = (a) => r.value.status = a),
                  class: "ku-input",
                  "aria-label": "Status"
                }, [
                  (t(), u(U, null, N($, (a) => s("option", {
                    key: a.value,
                    value: a.value
                  }, v(a.label), 9, la)), 64))
                ], 512), [
                  [ce, r.value.status]
                ])
              ]),
              _.value ? b("", !0) : (t(), u("div", sa, [
                e[23] || (e[23] = s("label", {
                  class: "ku-label",
                  for: "account-password"
                }, "New password", -1)),
                g(s("input", {
                  id: "account-password",
                  "onUpdate:modelValue": e[9] || (e[9] = (a) => r.value.password = a),
                  type: "password",
                  class: "ku-input",
                  placeholder: "Leave empty to keep current",
                  autocomplete: "new-password"
                }, null, 512), [
                  [B, r.value.password]
                ])
              ])),
              s("div", ta, [
                e[24] || (e[24] = s("label", { class: "ku-label" }, "Roles", -1)),
                (t(!0), u(U, null, N(T.value, (a) => (t(), u("label", {
                  key: a.id,
                  class: "ku-check"
                }, [
                  g(s("input", {
                    type: "checkbox",
                    "onUpdate:modelValue": e[10] || (e[10] = (d) => r.value.groups = d),
                    value: a.id
                  }, null, 8, oa), [
                    [j, r.value.groups]
                  ]),
                  s("span", ua, v(a.label), 1)
                ]))), 128))
              ])
            ], 64)),
            e[25] || (e[25] = s("p", { class: "ku-role-help" }, "Permissions from all assigned roles apply. For restricted access, create a custom role in System → Security and assign it instead of Member.", -1)),
            m.value ? (t(), u("div", na, v(m.value), 1)) : b("", !0),
            V.value ? (t(), u("div", ia, v(V.value), 1)) : b("", !0)
          ], 32)
        ]),
        _: 1
      }, 8, ["visible", "aria-label"])
    ]));
  }
}), Ca = {
  rootComponent: ra,
  plugins: [oe]
};
export {
  Ca as mountConfig
};
//# sourceMappingURL=index-mount-CT8xILML.js.map
