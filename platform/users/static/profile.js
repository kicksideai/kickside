import { a as q, b as H, W as $ } from "./index-D52CRMw6.js";
import { e as G, P as J } from "./index-CKAvFXRR.js";
import { defineComponent as Q, computed as m, ref as d, onMounted as X, onUnmounted as Z, openBlock as s, createBlock as ee, unref as x, withCtx as te, createElementBlock as l, createVNode as g, createTextVNode as v, toDisplayString as n, createElementVNode as t, normalizeClass as A, Fragment as L, createCommentVNode as w, withDirectives as _, vModelText as z } from "vue";
import { Icon as k } from "@iconify/vue";
import { api as N, host as D, define as oe } from "@wippy-fe/proxy";
import { e as ae } from "./errMsg-CxKGcp1F.js";
import { f as re } from "./datetime--PfqsqnZ.js";
const ie = {
  key: 0,
  class: "kxp-state"
}, ne = {
  key: 1,
  class: "kxp-state kxp-state-err"
}, se = {
  key: 2,
  class: "kxp-body"
}, le = { class: "kxp-id" }, pe = { class: "kxp-avatar" }, de = { class: "kxp-id-text" }, ue = { class: "kxp-name" }, ce = { class: "kxp-email" }, fe = { class: "kxp-fields" }, me = { class: "kxp-field" }, xe = { class: "kxp-field" }, we = { class: "kxp-field" }, be = {
  key: 0,
  class: "kxp-field"
}, ge = { class: "kxp-cap" }, ve = {
  key: 1,
  class: "kxp-field"
}, ke = { class: "kxp-foot" }, he = { class: "kxp-form" }, ye = { class: "kxp-input-group" }, _e = { class: "kxp-input-group" }, ze = ["value"], Ce = { class: "kxp-input-group" }, Ee = { class: "kxp-input-group" }, je = {
  key: 0,
  class: "kxp-err"
}, Se = { class: "kxp-foot" }, Pe = ["disabled"], Ue = ["disabled"], Me = /* @__PURE__ */ Q({
  __name: "profile",
  setup(I) {
    const R = q(), b = H(), C = m(() => !!(R.value.config || {}).readonly), a = d(null), h = d(!0), f = d(""), u = d(!1), c = d(!1), p = d(""), i = d({ full_name: "", password: "", confirm: "" }), E = m(() => a.value?.full_name?.trim() || a.value?.email || "Your account"), T = m(() => {
      const o = a.value?.full_name?.trim();
      return o ? o.split(/\s+/).map((e) => e[0]).join("").toUpperCase().slice(0, 2) : (a.value?.email || "?").charAt(0).toUpperCase();
    }), j = m(() => a.value?.is_admin ? "Administrator" : "Member"), B = {
      active: "Active",
      inactive: "Inactive",
      suspended: "Suspended",
      pending: "Pending"
    }, F = m(() => {
      const o = a.value?.status || "";
      return B[o] ?? o;
    }), S = (o) => re(o, { year: "numeric", month: "long", day: "numeric" });
    function P(o, e) {
      if (o && typeof o == "object") {
        const r = o;
        r.response?.status === 401 && D.handleError?.("auth-expired", r);
      }
      return ae(o, e);
    }
    async function O() {
      h.value = !0, f.value = "";
      try {
        const { data: o } = await N.get("/api/v1/user/me");
        if (!o?.success || !o.user) throw new Error(o?.error || "could not load profile");
        a.value = {
          full_name: o.user.full_name || "",
          email: o.user.email || "",
          status: o.user.status || "",
          created_at: o.user.created_at ?? null,
          is_admin: !!o.security?.is_admin,
          groups: Array.isArray(o.security?.groups) ? o.security.groups : []
        }, b("load", void 0);
      } catch (o) {
        f.value = P(o, "could not load profile"), b("error", { message: f.value, error: o });
      } finally {
        h.value = !1;
      }
    }
    function K() {
      C.value || !a.value || (i.value = { full_name: a.value.full_name, password: "", confirm: "" }, p.value = "", u.value = !0);
    }
    function U() {
      u.value = !1, p.value = "";
    }
    async function W() {
      if (!a.value) return;
      p.value = "";
      const o = i.value.full_name.trim();
      if (!o) {
        p.value = "Name cannot be empty.";
        return;
      }
      if (i.value.password && i.value.password !== i.value.confirm) {
        p.value = "Passwords do not match.";
        return;
      }
      const e = {};
      if (o !== a.value.full_name && (e.full_name = o), i.value.password && (e.password = i.value.password), !Object.keys(e).length) {
        u.value = !1;
        return;
      }
      c.value = !0;
      try {
        const { data: r } = await N.put("/api/v1/user/me", e);
        if (!r?.success) throw new Error(r?.error || "save failed");
        e.full_name && (a.value.full_name = e.full_name), u.value = !1, b("updated", { full_name: a.value.full_name }), D.toast?.({ severity: "success", summary: "Profile updated", detail: E.value });
      } catch (r) {
        p.value = P(r, "save failed");
      } finally {
        c.value = !1;
      }
    }
    const y = d(!0);
    function M() {
      b("close", void 0);
    }
    function Y(o) {
      o || M();
    }
    function V(o) {
      o.key === "Escape" && (u.value ? U() : y.value = !1);
    }
    return X(() => {
      O(), window.addEventListener("keydown", V);
    }), Z(() => {
      window.removeEventListener("keydown", V);
    }), (o, e) => (s(), ee(x(G), {
      visible: y.value,
      "onUpdate:visible": [
        e[3] || (e[3] = (r) => y.value = r),
        Y
      ],
      modal: "",
      header: u.value ? "Edit profile" : "Profile",
      "dismissable-mask": !0,
      "close-on-escape": !1,
      style: { width: "460px", maxWidth: "calc(100vw - 48px)" },
      "aria-label": "Profile",
      class: "kxp-dialog"
    }, {
      default: te(() => [
        h.value ? (s(), l("div", ie, [
          g(x(k), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          e[4] || (e[4] = v(" Loading…", -1))
        ])) : f.value ? (s(), l("div", ne, [
          g(x(k), {
            icon: "tabler:alert-triangle",
            "aria-hidden": "true"
          }),
          v(" " + n(f.value), 1)
        ])) : a.value ? (s(), l("div", se, [
          t("div", le, [
            t("span", pe, n(T.value), 1),
            t("div", de, [
              t("div", ue, n(E.value), 1),
              t("div", ce, n(a.value.email), 1)
            ]),
            t("span", {
              class: A(["kxp-role", a.value.is_admin && "kxp-role-admin"])
            }, n(j.value), 3)
          ]),
          u.value ? (s(), l(L, { key: 1 }, [
            t("div", he, [
              t("label", ye, [
                e[11] || (e[11] = t("span", { class: "kxp-label" }, "Full name", -1)),
                _(t("input", {
                  "onUpdate:modelValue": e[0] || (e[0] = (r) => i.value.full_name = r),
                  class: "kxp-input",
                  type: "text",
                  placeholder: "Your name"
                }, null, 512), [
                  [z, i.value.full_name]
                ])
              ]),
              t("label", _e, [
                e[12] || (e[12] = t("span", { class: "kxp-label" }, "Email", -1)),
                t("input", {
                  value: a.value.email,
                  class: "kxp-input",
                  type: "email",
                  disabled: ""
                }, null, 8, ze),
                e[13] || (e[13] = t("span", { class: "kxp-hint" }, "Email is managed by an administrator.", -1))
              ]),
              e[16] || (e[16] = t("div", { class: "kxp-divider" }, [
                t("span", null, "Change password")
              ], -1)),
              t("label", Ce, [
                e[14] || (e[14] = t("span", { class: "kxp-label" }, "New password", -1)),
                _(t("input", {
                  "onUpdate:modelValue": e[1] || (e[1] = (r) => i.value.password = r),
                  class: "kxp-input",
                  type: "password",
                  autocomplete: "new-password",
                  placeholder: "Leave blank to keep current"
                }, null, 512), [
                  [z, i.value.password]
                ])
              ]),
              t("label", Ee, [
                e[15] || (e[15] = t("span", { class: "kxp-label" }, "Confirm password", -1)),
                _(t("input", {
                  "onUpdate:modelValue": e[2] || (e[2] = (r) => i.value.confirm = r),
                  class: "kxp-input",
                  type: "password",
                  autocomplete: "new-password",
                  placeholder: "Re-enter new password"
                }, null, 512), [
                  [z, i.value.confirm]
                ])
              ])
            ]),
            p.value ? (s(), l("div", je, n(p.value), 1)) : w("", !0),
            t("div", Se, [
              t("button", {
                class: "kxp-btn kxp-btn-ghost",
                disabled: c.value,
                onClick: U
              }, "Cancel", 8, Pe),
              t("button", {
                class: "kxp-btn kxp-btn-primary",
                disabled: c.value,
                onClick: W
              }, [
                g(x(k), {
                  icon: c.value ? "tabler:loader-2" : "tabler:check",
                  class: A(c.value && "spin"),
                  "aria-hidden": "true"
                }, null, 8, ["icon", "class"]),
                e[17] || (e[17] = v(" Save changes ", -1))
              ], 8, Ue)
            ])
          ], 64)) : (s(), l(L, { key: 0 }, [
            t("dl", fe, [
              t("div", me, [
                e[5] || (e[5] = t("dt", null, "Full name", -1)),
                t("dd", null, n(a.value.full_name || "—"), 1)
              ]),
              t("div", xe, [
                e[6] || (e[6] = t("dt", null, "Email", -1)),
                t("dd", null, n(a.value.email), 1)
              ]),
              t("div", we, [
                e[7] || (e[7] = t("dt", null, "Role", -1)),
                t("dd", null, n(j.value), 1)
              ]),
              a.value.status ? (s(), l("div", be, [
                e[8] || (e[8] = t("dt", null, "Status", -1)),
                t("dd", ge, n(F.value), 1)
              ])) : w("", !0),
              S(a.value.created_at) ? (s(), l("div", ve, [
                e[9] || (e[9] = t("dt", null, "Member since", -1)),
                t("dd", null, n(S(a.value.created_at)), 1)
              ])) : w("", !0)
            ]),
            t("div", ke, [
              t("button", {
                class: "kxp-btn kxp-btn-ghost",
                onClick: M
              }, "Close"),
              C.value ? w("", !0) : (s(), l("button", {
                key: 0,
                class: "kxp-btn kxp-btn-primary",
                onClick: K
              }, [
                g(x(k), {
                  icon: "tabler:pencil",
                  "aria-hidden": "true"
                }),
                e[10] || (e[10] = v(" Edit profile ", -1))
              ]))
            ])
          ], 64))
        ])) : w("", !0)
      ]),
      _: 1
    }, 8, ["visible", "header"]));
  }
}), Ve = '.spin{animation:kx-spin 1s linear infinite}@keyframes kx-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.spin{animation:none}}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}:host{display:block;font-family:Inter,system-ui,sans-serif;color:var(--p-text-color)}:host *,:host *:before,:host *:after{box-sizing:border-box}.kxp-state{display:flex;align-items:center;justify-content:center;gap:8px;padding:40px 16px;color:var(--p-text-muted-color);font-size:13px}.kxp-state-err{color:var(--p-danger-600, var(--p-danger-500))}.kxp-body{padding:18px;display:flex;flex-direction:column;gap:16px}.kxp-id{display:flex;align-items:center;gap:12px}.kxp-avatar{width:48px;height:48px;border-radius:50%;flex:none;display:inline-flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.kxp-id-text{min-width:0;flex:1}.kxp-name{font-size:16px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kxp-email{font-size:12.5px;color:var(--p-text-muted-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kxp-role{flex:none;font-size:11px;font-weight:700;padding:3px 8px;border-radius:999px;background:color-mix(in srgb,var(--p-text-color) 8%,transparent);color:var(--p-text-muted-color)}.kxp-role-admin{background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.kxp-fields{margin:0;display:flex;flex-direction:column;gap:2px}.kxp-field{display:flex;align-items:baseline;gap:12px;padding:9px 0;border-bottom:1px solid color-mix(in srgb,var(--p-content-border-color) 60%,transparent)}.kxp-field:last-child{border-bottom:none}.kxp-field dt{flex:none;width:110px;font-size:12.5px;color:var(--p-text-muted-color)}.kxp-field dd{margin:0;flex:1;min-width:0;font-size:13.5px;color:var(--p-text-color);word-break:break-word}.kxp-cap{text-transform:capitalize}.kxp-form{display:flex;flex-direction:column;gap:12px}.kxp-input-group{display:flex;flex-direction:column;gap:5px}.kxp-label{font-size:12.5px;font-weight:600;color:var(--p-text-color)}.kxp-input{width:100%;height:36px;padding:0 11px;font:inherit;font-size:13px;color:var(--p-text-color);background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:8px;outline:none;transition:border-color .15s,box-shadow .15s}.kxp-input:disabled{opacity:.6;cursor:not-allowed}.kxp-hint{font-size:11.5px;color:var(--p-text-muted-color)}.kxp-divider{display:flex;align-items:center;gap:10px;margin:4px 0 0;color:var(--p-text-muted-color);font-size:11.5px;font-weight:600;text-transform:uppercase;letter-spacing:.04em}.kxp-divider:before,.kxp-divider:after{content:"";flex:1;height:1px;background:var(--p-content-border-color)}.kxp-err{padding:9px 12px;border-radius:8px;font-size:12.5px;background:color-mix(in srgb,var(--p-danger-500) 12%,transparent);color:var(--p-danger-600, var(--p-danger-500))}.kxp-foot{display:flex;justify-content:flex-end;gap:8px;padding-top:4px}.kxp-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:36px;padding:0 14px;border-radius:8px;border:1px solid transparent;font:inherit;font-size:13px;font-weight:600;cursor:pointer;transition:filter .15s,background .15s,opacity .15s}.kxp-btn:disabled{opacity:.55;cursor:default}.kxp-btn svg{width:15px;height:15px}.kxp-btn-primary{background:var(--p-primary-color);color:var(--p-button-primary-color)}.kxp-btn-primary:hover:not(:disabled){filter:brightness(1.05)}.kxp-btn-ghost{background:transparent;border-color:var(--p-content-border-color);color:var(--p-text-color)}.kxp-btn-ghost:hover:not(:disabled){background:color-mix(in srgb,var(--p-text-color) 8%,transparent)}', Ae = {
  type: "object",
  properties: {
    config: {
      type: "object",
      description: "Optional: { readonly } to force the read-only view."
    }
  }
};
class Le extends $ {
  static get wippyConfig() {
    return {
      propsSchema: Ae,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: Ve
    };
  }
  static get vueConfig() {
    return { rootComponent: Me, plugins: [J] };
  }
}
oe(import.meta.url, Le);
//# sourceMappingURL=profile.js.map
