import { defineComponent as ie, ref as h, onMounted as se, watch as q, onBeforeUnmount as ce, openBlock as i, createElementBlock as r, computed as w, createBlock as ne, unref as u, withCtx as U, createElementVNode as l, createVNode as v, withDirectives as B, vModelText as D, createTextVNode as O, toDisplayString as m, createCommentVNode as C, Fragment as F, renderList as le, normalizeClass as G, vShow as _e, nextTick as ae } from "vue";
import { Icon as _ } from "@iconify/vue";
import $ from "primevue/button";
import he from "primevue/dialog";
import xe from "primevue/select";
import { loadByTagName as z } from "@wippy-fe/proxy";
function we(f, S) {
  if (f && typeof f == "object") {
    const g = f, o = g.response?.data?.error;
    if (typeof o == "string") return o;
    if (o && typeof o == "object" && typeof o.message == "string")
      return o.message;
    if (typeof g.message == "string" && g.message) return g.message;
  }
  return S;
}
const Ce = /* @__PURE__ */ ie({
  __name: "IconField",
  props: {
    modelValue: {},
    fallback: {}
  },
  emits: ["update:modelValue"],
  setup(f, { emit: S }) {
    const g = f, o = S, y = h(null);
    let s = null;
    function p(a) {
      o("update:modelValue", a.detail || "");
    }
    async function E() {
      if (y.value) {
        s && s.removeEventListener("select", p), y.value.innerHTML = "";
        try {
          customElements.get("wc-icon-picker") || await z("wc-icon-picker", { timeoutMs: 8e3 });
        } catch {
        }
        y.value && (s = document.createElement("wc-icon-picker"), s.setAttribute("value", g.modelValue || ""), g.fallback && s.setAttribute("fallback", g.fallback), s.addEventListener("select", p), y.value.appendChild(s));
      }
    }
    return se(E), q(() => g.modelValue, (a) => {
      s && s.getAttribute("value") !== a && s.setAttribute("value", a || "");
    }), ce(() => {
      s && s.removeEventListener("select", p);
    }), (a, k) => (i(), r("div", {
      ref_key: "host",
      ref: y,
      class: "wc-iconfield"
    }, null, 512));
  }
}), Ee = { class: "kx-modal-head-icon" }, Ne = { class: "kx-modal-head-text" }, Ve = { class: "kx-modal-head-title" }, Se = { class: "kx-modal-head-sub" }, Le = { class: "kx-2p" }, Ue = { class: "kx-2p-l" }, Ie = { class: "kx-form" }, Be = { class: "kx-field" }, Me = { class: "kx-name-row" }, Te = { class: "kx-field" }, je = {
  key: 0,
  class: "kx-field"
}, Ae = { class: "kx-type sel kx-type-fixed" }, De = { class: "kx-type-name" }, Oe = { class: "kx-type-desc" }, Fe = {
  key: 1,
  class: "kx-field"
}, Ge = {
  key: 0,
  class: "kx-cat-search"
}, $e = { class: "kx-cat" }, qe = ["onClick"], ze = { class: "kx-cat-ico" }, He = { class: "kx-cat-text" }, Ke = { class: "kx-cat-name" }, Pe = { class: "kx-cat-desc" }, Je = {
  class: "kx-notice kx-notice-error",
  style: { margin: "0" }
}, We = {
  key: 1,
  class: "kx-notice",
  style: { margin: "0" }
}, Qe = {
  key: 2,
  class: "kx-cat-empty"
}, Re = { class: "kx-2p-r" }, Xe = { class: "kx-2p-r-body" }, Ye = {
  key: 0,
  class: "kx-form"
}, Ze = {
  key: 0,
  class: "kx-field"
}, et = ["value"], tt = {
  key: 1,
  class: "kx-field"
}, nt = { class: "kx-options" }, lt = { class: "kx-field-lbl" }, at = {
  key: 0,
  class: "kx-field-hint-inline"
}, ot = {
  key: 1,
  class: "kx-check"
}, it = ["checked", "onChange"], st = ["type", "min", "max", "step", "value", "onInput"], ct = {
  key: 2,
  class: "kx-2p-r-note"
}, rt = {
  key: 0,
  class: "kx-err inline kx-foot-err"
}, oe = "No knowledge engine installed. Install a KB engine to create and browse knowledge bases.", kt = /* @__PURE__ */ ie({
  __name: "KbDialog",
  props: {
    open: { type: Boolean },
    api: {},
    engines: {},
    models: {},
    target: {},
    parentId: {},
    loadError: {}
  },
  emits: ["close", "saved", "retry"],
  setup(f, { emit: S }) {
    const g = {
      header: { class: "kx-modal-head" },
      content: { class: "kx-dialog-content" },
      footer: { class: "kx-modal-foot" }
    }, o = f, y = S, s = h(!1), p = h(""), E = h(""), a = h({ name: "", description: "", icon: "", kb_type: "" }), k = h({ embedding_model: "", config: {} }), c = w(() => !!o.target);
    function re(n) {
      return o.engines.find((e) => e.kb_type === n);
    }
    const b = w(() => re(a.value.kb_type)), M = w(() => !!b.value?.create_ui_id), H = w(() => {
      const n = E.value.trim().toLowerCase();
      return n ? o.engines.filter((e) => (e.label || "").toLowerCase().includes(n) || (e.description || "").toLowerCase().includes(n) || (e.kb_type || "").toLowerCase().includes(n)) : o.engines;
    }), de = w(() => !c.value && o.engines.length > 6), x = h({}), I = h(""), T = w(() => {
      const n = b.value?.config_schema?.properties || {};
      return Object.entries(n).map(([e, t]) => ({ key: e, ...t })).sort((e, t) => (e.order ?? 100) - (t.order ?? 100) || e.key.localeCompare(t.key));
    });
    function K(n) {
      const e = { ...n?.default_config || {} }, t = n?.config_schema?.properties || {};
      for (const [d, N] of Object.entries(t))
        e[d] === void 0 && N.default !== void 0 && (e[d] = N.default);
      return e;
    }
    function ue(n) {
      return n.replace(/[_-]+/g, " ").replace(/\b\w/g, (e) => e.toUpperCase());
    }
    function pe(n) {
      return n.target?.value ?? "";
    }
    function ve(n) {
      return n.target?.checked === !0;
    }
    function P(n) {
      const e = x.value[n];
      return e == null ? "" : String(e);
    }
    function J(n) {
      return x.value[n] === !0;
    }
    function j(n, e) {
      if (n.type === "boolean")
        x.value[n.key] = e === !0;
      else if (n.type === "integer") {
        const t = Number.parseInt(String(e), 10);
        x.value[n.key] = Number.isNaN(t) ? void 0 : t;
      } else if (n.type === "number") {
        const t = Number.parseFloat(String(e));
        x.value[n.key] = Number.isNaN(t) ? void 0 : t;
      } else
        x.value[n.key] = String(e);
      A();
    }
    function me(n) {
      return (n.options || n.enum || []).map((t) => {
        if (t && typeof t == "object") {
          const d = String(t.value);
          return { label: t.label || d, value: d };
        }
        return { label: String(t), value: String(t) };
      });
    }
    function A() {
      k.value = { embedding_model: I.value, config: { ...x.value } };
    }
    function ge(n) {
      I.value = n.detail || "", A();
    }
    const W = h(null);
    let L = null, Q = 0;
    function R(n) {
      const e = n.detail;
      e && typeof e == "object" && (k.value = {
        embedding_model: typeof e.embedding_model == "string" ? e.embedding_model : k.value.embedding_model,
        config: e.config && typeof e.config == "object" ? { ...e.config } : k.value.config
      });
    }
    function V() {
      L && (L.removeEventListener("config-changed", R), L.remove(), L = null);
    }
    async function ke() {
      const n = ++Q;
      V();
      const e = b.value, t = e?.create_ui_id, d = W.value;
      if (!t || !d) return;
      try {
        await z(t, { timeoutMs: 8e3 });
      } catch {
      }
      if (n !== Q) return;
      d.replaceChildren();
      const N = document.createElement(t), te = { ...c.value ? o.target?.config || {} : K(e) };
      e?.config_schema && (te.config_schema = e.config_schema);
      try {
        N.setAttribute("config", JSON.stringify({
          id: c.value ? o.target?.id : void 0,
          kb_type: a.value.kb_type,
          embedding_model: c.value && o.target?.embedding_model || "",
          config: te,
          edit: c.value
        }));
      } catch {
      }
      N.addEventListener("config-changed", R), d.appendChild(N), L = N;
    }
    async function X() {
      M.value ? (await ae(), ke()) : (V(), x.value = c.value && o.target?.config ? { ...o.target.config } : K(b.value), I.value = c.value ? "" : o.models[0]?.name || "", A());
    }
    q(() => a.value.kb_type, X);
    function fe() {
      if (p.value = "", E.value = "", o.target) {
        const n = o.target;
        a.value = { name: n.name || "", description: n.description || "", icon: n.icon || "", kb_type: n.kb_type || "" };
      } else {
        const n = o.engines[0]?.kb_type || "";
        a.value = { name: "", description: "", icon: "", kb_type: n };
      }
      k.value = { embedding_model: "", config: {} }, ae(() => {
        X();
      });
    }
    q(() => o.open, (n) => {
      n ? fe() : V();
    }), ce(V), se(() => {
      z("wc-model-picker", { timeoutMs: 8e3 }).catch(() => {
      });
    });
    function Y() {
      V(), y("close");
    }
    const Z = w({
      get: () => o.open,
      set: (n) => {
        n || Y();
      }
    }), be = w(() => !a.value.name.trim() || !a.value.kb_type ? !1 : c.value ? !0 : !!k.value.embedding_model);
    async function ye() {
      if (!a.value.name.trim()) {
        p.value = "Name is required.";
        return;
      }
      if (!c.value && !k.value.embedding_model) {
        p.value = "An embedding model is required. None are available — install a model provider first.";
        return;
      }
      s.value = !0, p.value = "";
      try {
        if (c.value && o.target) {
          const { data: n } = await o.api.put(`/api/v1/knowledge/${o.target.id}`, {
            name: a.value.name,
            description: a.value.description,
            icon: a.value.icon,
            config: k.value.config
          });
          if (!n?.success) {
            p.value = n?.error || "save failed";
            return;
          }
        } else {
          const { data: n } = await o.api.post("/api/v1/knowledge/create", {
            name: a.value.name,
            description: a.value.description,
            icon: a.value.icon,
            kb_type: a.value.kb_type,
            embedding_model: k.value.embedding_model,
            config: k.value.config,
            parent_id: o.parentId || ""
          });
          if (!n?.success) {
            const e = n?.error || "create failed";
            p.value = ee(e) ? oe : e;
            return;
          }
        }
        V(), y("saved");
      } catch (n) {
        const e = we(n, c.value ? "save failed" : "create failed");
        p.value = ee(e) ? oe : e;
      } finally {
        s.value = !1;
      }
    }
    function ee(n) {
      const e = n.toLowerCase();
      return e.includes("no implementation") || e.includes("no engine") || e.includes("contract unavailable") || e.includes("not found") && e.includes("binding");
    }
    return (n, e) => (i(), ne(u(he), {
      visible: Z.value,
      "onUpdate:visible": e[5] || (e[5] = (t) => Z.value = t),
      modal: "",
      "dismissable-mask": !0,
      class: "kx-dialog",
      pt: g,
      "aria-label": c.value ? "Edit knowledge base" : "New knowledge base"
    }, {
      header: U(() => [
        l("span", Ee, [
          v(u(_), {
            icon: a.value.icon || b.value?.icon || "tabler:books",
            "aria-hidden": "true"
          }, null, 8, ["icon"])
        ]),
        l("span", Ne, [
          l("span", Ve, m(c.value ? "Edit knowledge base" : "New knowledge base"), 1),
          l("span", Se, m(a.value.description.trim() || "A collection your agents search and reason over."), 1)
        ])
      ]),
      footer: U(() => [
        p.value ? (i(), r("div", rt, m(p.value), 1)) : C("", !0),
        v(u($), {
          type: "button",
          label: "Cancel",
          severity: "secondary",
          outlined: "",
          disabled: s.value,
          onClick: Y
        }, null, 8, ["disabled"]),
        v(u($), {
          type: "button",
          label: s.value ? c.value ? "Saving…" : "Creating…" : c.value ? "Save changes" : "Create",
          loading: s.value,
          disabled: s.value || !be.value,
          onClick: ye
        }, {
          icon: U(({ class: t }) => [
            v(u(_), {
              icon: c.value ? "tabler:device-floppy" : "tabler:check",
              class: G(t),
              "aria-hidden": "true"
            }, null, 8, ["icon", "class"])
          ]),
          _: 1
        }, 8, ["label", "loading", "disabled"])
      ]),
      default: U(() => [
        l("div", Le, [
          l("div", Ue, [
            l("div", Ie, [
              l("div", Be, [
                e[6] || (e[6] = l("span", { class: "kx-field-lbl" }, "Name", -1)),
                l("div", Me, [
                  v(Ce, {
                    class: "kx-name-icon",
                    modelValue: a.value.icon,
                    "onUpdate:modelValue": e[0] || (e[0] = (t) => a.value.icon = t),
                    fallback: b.value?.icon || "tabler:books"
                  }, null, 8, ["modelValue", "fallback"]),
                  B(l("input", {
                    "onUpdate:modelValue": e[1] || (e[1] = (t) => a.value.name = t),
                    class: "kx-input",
                    type: "text",
                    placeholder: "e.g. Product docs"
                  }, null, 512), [
                    [D, a.value.name]
                  ])
                ])
              ]),
              l("label", Te, [
                e[7] || (e[7] = l("span", { class: "kx-field-lbl" }, [
                  O("Description "),
                  l("span", { class: "kx-field-hint-inline" }, "— optional")
                ], -1)),
                B(l("textarea", {
                  "onUpdate:modelValue": e[2] || (e[2] = (t) => a.value.description = t),
                  class: "kx-input kx-textarea",
                  rows: "3",
                  placeholder: "What this knowledge base holds."
                }, null, 512), [
                  [D, a.value.description]
                ])
              ]),
              c.value && b.value ? (i(), r("div", je, [
                e[8] || (e[8] = l("span", { class: "kx-field-lbl" }, "Type", -1)),
                l("div", Ae, [
                  l("span", De, [
                    v(u(_), {
                      icon: b.value.icon || "tabler:database",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"]),
                    O(m(b.value.label), 1)
                  ]),
                  l("span", Oe, m(b.value.description), 1)
                ])
              ])) : (i(), r("div", Fe, [
                e[10] || (e[10] = l("span", { class: "kx-field-lbl" }, "Type", -1)),
                de.value ? (i(), r("div", Ge, [
                  v(u(_), {
                    icon: "tabler:search",
                    "aria-hidden": "true"
                  }),
                  B(l("input", {
                    "onUpdate:modelValue": e[3] || (e[3] = (t) => E.value = t),
                    type: "text",
                    placeholder: "Search types…",
                    "aria-label": "Search knowledge base types"
                  }, null, 512), [
                    [D, E.value]
                  ])
                ])) : C("", !0),
                l("div", $e, [
                  (i(!0), r(F, null, le(H.value, (t) => (i(), r("button", {
                    key: t.kb_type,
                    type: "button",
                    class: G(["kx-cat-card", { sel: a.value.kb_type === t.kb_type }]),
                    onClick: (d) => a.value.kb_type = t.kb_type
                  }, [
                    l("span", ze, [
                      v(u(_), {
                        icon: t.icon || "tabler:database",
                        "aria-hidden": "true"
                      }, null, 8, ["icon"])
                    ]),
                    l("span", He, [
                      l("span", Ke, m(t.label), 1),
                      l("span", Pe, m(t.description), 1)
                    ]),
                    v(u(_), {
                      icon: "tabler:check",
                      class: "kx-cat-check",
                      "aria-hidden": "true"
                    })
                  ], 10, qe))), 128)),
                  f.loadError ? (i(), r(F, { key: 0 }, [
                    l("div", Je, [
                      v(u(_), {
                        icon: "tabler:alert-triangle",
                        "aria-hidden": "true"
                      }),
                      l("span", null, "Couldn't load knowledge engines. " + m(f.loadError), 1)
                    ]),
                    v(u($), {
                      type: "button",
                      size: "small",
                      severity: "secondary",
                      outlined: "",
                      class: "kx-cat-retry",
                      label: "Try again",
                      onClick: e[4] || (e[4] = (t) => y("retry"))
                    }, {
                      icon: U(({ class: t }) => [
                        v(u(_), {
                          icon: "tabler:refresh",
                          class: G(t),
                          "aria-hidden": "true"
                        }, null, 8, ["class"])
                      ]),
                      _: 1
                    })
                  ], 64)) : f.engines.length ? H.value.length ? C("", !0) : (i(), r("div", Qe, "No types match “" + m(E.value) + "”.", 1)) : (i(), r("div", We, [
                    v(u(_), {
                      icon: "tabler:info-circle",
                      "aria-hidden": "true"
                    }),
                    e[9] || (e[9] = l("span", null, "No knowledge engine installed. Install a KB engine to create knowledge bases.", -1))
                  ]))
                ])
              ]))
            ])
          ]),
          l("div", Re, [
            e[13] || (e[13] = l("div", { class: "kx-2p-r-head" }, "Configuration", -1)),
            l("div", Xe, [
              B(l("div", {
                ref_key: "customHost",
                ref: W,
                class: "kx-engine-host"
              }, null, 512), [
                [_e, M.value]
              ]),
              M.value ? C("", !0) : (i(), r("div", Ye, [
                c.value ? C("", !0) : (i(), r("div", Ze, [
                  e[11] || (e[11] = l("span", { class: "kx-field-lbl" }, "Embedding model", -1)),
                  l("wc-model-picker", {
                    value: I.value,
                    capability: "embed",
                    onSelect: ge
                  }, null, 40, et)
                ])),
                T.value.length ? (i(), r("div", tt, [
                  e[12] || (e[12] = l("span", { class: "kx-field-lbl" }, "Options", -1)),
                  l("div", nt, [
                    (i(!0), r(F, null, le(T.value, (t) => (i(), r("label", {
                      key: t.key,
                      class: "kx-option"
                    }, [
                      l("span", lt, [
                        O(m(t.label || ue(t.key)) + " ", 1),
                        t.description ? (i(), r("span", at, "— " + m(t.description), 1)) : C("", !0)
                      ]),
                      t.enum && t.enum.length || t.options && t.options.length ? (i(), ne(u(xe), {
                        key: 0,
                        class: "kx-select",
                        "model-value": P(t.key),
                        options: me(t),
                        "option-label": "label",
                        "option-value": "value",
                        "onUpdate:modelValue": (d) => j(t, d)
                      }, null, 8, ["model-value", "options", "onUpdate:modelValue"])) : t.type === "boolean" ? (i(), r("label", ot, [
                        l("input", {
                          type: "checkbox",
                          checked: J(t.key),
                          onChange: (d) => j(t, ve(d))
                        }, null, 40, it),
                        l("span", null, m(J(t.key) ? "Enabled" : "Disabled"), 1)
                      ])) : (i(), r("input", {
                        key: 2,
                        class: "kx-input",
                        type: t.type === "integer" || t.type === "number" ? "number" : "text",
                        min: t.minimum,
                        max: t.maximum,
                        step: t.type === "integer" ? 1 : void 0,
                        value: P(t.key),
                        onInput: (d) => j(t, pe(d))
                      }, null, 40, st))
                    ]))), 128))
                  ])
                ])) : C("", !0),
                c.value && !T.value.length ? (i(), r("p", ct, "This knowledge base type has no editable configuration.")) : C("", !0)
              ]))
            ])
          ])
        ])
      ]),
      _: 1
    }, 8, ["visible", "aria-label"]));
  }
});
export {
  kt as _,
  we as e
};
//# sourceMappingURL=KbDialog.vue_vue_type_script_setup_true_lang-CKB3002V.js.map
