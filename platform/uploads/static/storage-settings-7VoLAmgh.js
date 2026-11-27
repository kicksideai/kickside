import { openBlock as u, createElementBlock as c, mergeProps as z, createElementVNode as t, renderSlot as H, defineComponent as K, ref as _, computed as Q, onMounted as X, createCommentVNode as p, createVNode as m, unref as b, withCtx as O, createBlock as P, toDisplayString as Y, createTextVNode as S, Fragment as M } from "vue";
import { Icon as f } from "@iconify/vue";
import { e as Z, d as N, c as V } from "./index-DIIaMBV6.js";
import { B as ee, f as te } from "./wc-runtime-C8fLLL_9.js";
import { api as B } from "@wippy-fe/proxy";
var se = `
    .p-toggleswitch {
        display: inline-block;
        width: dt('toggleswitch.width');
        height: dt('toggleswitch.height');
    }

    .p-toggleswitch-input {
        cursor: pointer;
        appearance: none;
        position: absolute;
        top: 0;
        inset-inline-start: 0;
        width: 100%;
        height: 100%;
        padding: 0;
        margin: 0;
        opacity: 0;
        z-index: 1;
        outline: 0 none;
        border-radius: dt('toggleswitch.border.radius');
    }

    .p-toggleswitch-slider {
        cursor: pointer;
        width: 100%;
        height: 100%;
        border-width: dt('toggleswitch.border.width');
        border-style: solid;
        border-color: dt('toggleswitch.border.color');
        background: dt('toggleswitch.background');
        transition:
            background dt('toggleswitch.transition.duration'),
            color dt('toggleswitch.transition.duration'),
            border-color dt('toggleswitch.transition.duration'),
            outline-color dt('toggleswitch.transition.duration'),
            box-shadow dt('toggleswitch.transition.duration');
        border-radius: dt('toggleswitch.border.radius');
        outline-color: transparent;
        box-shadow: dt('toggleswitch.shadow');
    }

    .p-toggleswitch-handle {
        position: absolute;
        top: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        background: dt('toggleswitch.handle.background');
        color: dt('toggleswitch.handle.color');
        width: dt('toggleswitch.handle.size');
        height: dt('toggleswitch.handle.size');
        inset-inline-start: dt('toggleswitch.gap');
        margin-block-start: calc(-1 * calc(dt('toggleswitch.handle.size') / 2));
        border-radius: dt('toggleswitch.handle.border.radius');
        transition:
            background dt('toggleswitch.transition.duration'),
            color dt('toggleswitch.transition.duration'),
            inset-inline-start dt('toggleswitch.slide.duration'),
            box-shadow dt('toggleswitch.slide.duration');
    }

    .p-toggleswitch.p-toggleswitch-checked .p-toggleswitch-slider {
        background: dt('toggleswitch.checked.background');
        border-color: dt('toggleswitch.checked.border.color');
    }

    .p-toggleswitch.p-toggleswitch-checked .p-toggleswitch-handle {
        background: dt('toggleswitch.handle.checked.background');
        color: dt('toggleswitch.handle.checked.color');
        inset-inline-start: calc(dt('toggleswitch.width') - calc(dt('toggleswitch.handle.size') + dt('toggleswitch.gap')));
    }

    .p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:hover) .p-toggleswitch-slider {
        background: dt('toggleswitch.hover.background');
        border-color: dt('toggleswitch.hover.border.color');
    }

    .p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:hover) .p-toggleswitch-handle {
        background: dt('toggleswitch.handle.hover.background');
        color: dt('toggleswitch.handle.hover.color');
    }

    .p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:hover).p-toggleswitch-checked .p-toggleswitch-slider {
        background: dt('toggleswitch.checked.hover.background');
        border-color: dt('toggleswitch.checked.hover.border.color');
    }

    .p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:hover).p-toggleswitch-checked .p-toggleswitch-handle {
        background: dt('toggleswitch.handle.checked.hover.background');
        color: dt('toggleswitch.handle.checked.hover.color');
    }

    .p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:focus-visible) .p-toggleswitch-slider {
        box-shadow: dt('toggleswitch.focus.ring.shadow');
        outline: dt('toggleswitch.focus.ring.width') dt('toggleswitch.focus.ring.style') dt('toggleswitch.focus.ring.color');
        outline-offset: dt('toggleswitch.focus.ring.offset');
    }

    .p-toggleswitch.p-invalid > .p-toggleswitch-slider {
        border-color: dt('toggleswitch.invalid.border.color');
    }

    .p-toggleswitch.p-disabled {
        opacity: 1;
    }

    .p-toggleswitch.p-disabled .p-toggleswitch-slider {
        background: dt('toggleswitch.disabled.background');
    }

    .p-toggleswitch.p-disabled .p-toggleswitch-handle {
        background: dt('toggleswitch.handle.disabled.background');
    }
`, ae = {
  root: {
    position: "relative"
  }
}, ne = {
  root: function(d) {
    var g = d.instance, h = d.props;
    return ["p-toggleswitch p-component", {
      "p-toggleswitch-checked": g.checked,
      "p-disabled": h.disabled,
      "p-invalid": g.$invalid
    }];
  },
  input: "p-toggleswitch-input",
  slider: "p-toggleswitch-slider",
  handle: "p-toggleswitch-handle"
}, le = ee.extend({
  name: "toggleswitch",
  style: se,
  classes: ne,
  inlineStyles: ae
}), ie = {
  name: "BaseToggleSwitch",
  extends: Z,
  props: {
    trueValue: {
      type: null,
      default: !0
    },
    falseValue: {
      type: null,
      default: !1
    },
    readonly: {
      type: Boolean,
      default: !1
    },
    tabindex: {
      type: Number,
      default: null
    },
    inputId: {
      type: String,
      default: null
    },
    inputClass: {
      type: [String, Object],
      default: null
    },
    inputStyle: {
      type: Object,
      default: null
    },
    ariaLabelledby: {
      type: String,
      default: null
    },
    ariaLabel: {
      type: String,
      default: null
    }
  },
  style: le,
  provide: function() {
    return {
      $pcToggleSwitch: this,
      $parentInstance: this
    };
  }
}, A = {
  name: "ToggleSwitch",
  extends: ie,
  inheritAttrs: !1,
  emits: ["change", "focus", "blur"],
  methods: {
    getPTOptions: function(d) {
      var g = d === "root" ? this.ptmi : this.ptm;
      return g(d, {
        context: {
          checked: this.checked,
          disabled: this.disabled
        }
      });
    },
    onChange: function(d) {
      if (!this.disabled && !this.readonly) {
        var g = this.checked ? this.falseValue : this.trueValue;
        this.writeValue(g, d), this.$emit("change", d);
      }
    },
    onFocus: function(d) {
      this.$emit("focus", d);
    },
    onBlur: function(d) {
      var g, h;
      this.$emit("blur", d), (g = (h = this.formField).onBlur) === null || g === void 0 || g.call(h, d);
    }
  },
  computed: {
    checked: function() {
      return this.d_value === this.trueValue;
    },
    dataP: function() {
      return te({
        checked: this.checked,
        disabled: this.disabled,
        invalid: this.$invalid
      });
    }
  }
}, oe = ["data-p-checked", "data-p-disabled", "data-p"], re = ["id", "checked", "tabindex", "disabled", "readonly", "aria-checked", "aria-labelledby", "aria-label", "aria-invalid"], de = ["data-p"], ue = ["data-p"];
function ce(r, d, g, h, y, l) {
  return u(), c("div", z({
    class: r.cx("root"),
    style: r.sx("root")
  }, l.getPTOptions("root"), {
    "data-p-checked": l.checked,
    "data-p-disabled": r.disabled,
    "data-p": l.dataP
  }), [t("input", z({
    id: r.inputId,
    type: "checkbox",
    role: "switch",
    class: [r.cx("input"), r.inputClass],
    style: r.inputStyle,
    checked: l.checked,
    tabindex: r.tabindex,
    disabled: r.disabled,
    readonly: r.readonly,
    "aria-checked": l.checked,
    "aria-labelledby": r.ariaLabelledby,
    "aria-label": r.ariaLabel,
    "aria-invalid": r.invalid || void 0,
    onFocus: d[0] || (d[0] = function() {
      return l.onFocus && l.onFocus.apply(l, arguments);
    }),
    onBlur: d[1] || (d[1] = function() {
      return l.onBlur && l.onBlur.apply(l, arguments);
    }),
    onChange: d[2] || (d[2] = function() {
      return l.onChange && l.onChange.apply(l, arguments);
    })
  }, l.getPTOptions("input")), null, 16, re), t("div", z({
    class: r.cx("slider")
  }, l.getPTOptions("slider"), {
    "data-p": l.dataP
  }), [t("div", z({
    class: r.cx("handle")
  }, l.getPTOptions("handle"), {
    "data-p": l.dataP
  }), [H(r.$slots, "handle", {
    checked: l.checked
  })], 16, ue)], 16, de)], 16, oe);
}
A.render = ce;
const pe = { class: "ap" }, ge = { class: "ap-body" }, he = { class: "ap-bar" }, be = {
  key: 0,
  class: "ap-dirty"
}, ve = {
  key: 0,
  class: "ap-msg ap-err"
}, me = {
  key: 1,
  class: "ap-loading"
}, ye = {
  key: 2,
  class: "ap-cards"
}, fe = { class: "ap-card" }, we = { class: "ap-h" }, ke = { class: "ap-unit" }, _e = ["value"], xe = { class: "ap-unit" }, ze = ["value"], Se = {
  key: 0,
  class: "ap-card"
}, Ne = { class: "ap-h" }, Ce = { class: "ap-toggle-row" }, Oe = { class: "ap-field-grid" }, Pe = {
  key: 0,
  class: "ap-fg"
}, Be = {
  key: 1,
  class: "ap-fg"
}, Re = {
  key: 2,
  class: "ap-fg"
}, Te = { class: "ap-unit" }, Ie = ["value"], Fe = {
  key: 3,
  class: "ap-fg"
}, Ee = { class: "ap-unit" }, Me = ["value"], Ve = {
  key: 1,
  class: "ap-card"
}, Ae = { class: "ap-h" }, je = { class: "ap-field-grid" }, Le = {
  key: 0,
  class: "ap-fg"
}, $e = { class: "ap-unit" }, De = ["value"], Ue = {
  key: 1,
  class: "ap-fg"
}, Je = { class: "ap-unit" }, qe = ["value"], Ge = {
  key: 2,
  class: "ap-fg"
}, We = { class: "ap-unit" }, He = ["value"], Ke = {
  key: 3,
  class: "ap-fg"
}, Qe = { class: "ap-unit" }, Xe = ["value"], w = "kickside.uploads", k = "kickside.uploads.documents", i = "kickside.uploads.rasterize", at = /* @__PURE__ */ K({
  __name: "storage-settings",
  setup(r) {
    const d = ["kickside.uploads", "kickside.uploads.documents", "kickside.uploads.rasterize"], g = _(!0), h = _(!1), y = _(""), l = _({}), o = _({});
    let R = "";
    const n = (a, e) => `${a}|${e}`, v = (a, e) => !!l.value[n(a, e)], T = (a, e) => l.value[n(a, e)]?.is_default !== !1, j = (a) => Math.round(Number(a) / (1024 * 1024) * 100) / 100, L = (a) => Math.round(Number(a) * 1024 * 1024), $ = (a) => Math.round(Number(a) / 1e3 * 10) / 10, D = (a) => Math.round(Number(a) * 1e3);
    function U() {
      const a = {};
      for (const e of Object.values(l.value)) {
        const s = n(e.ns, e.key);
        s === n(k, "max_upload_bytes") ? a[s] = j(e.value) : s === n(w, "process_max_execution_ms") ? a[s] = $(e.value) : (e.value, a[s] = e.value);
      }
      o.value = a, R = JSON.stringify(a);
    }
    const C = Q(() => JSON.stringify(o.value) !== R);
    function I(a) {
      const e = o.value[a];
      if (a === n(k, "max_upload_bytes")) return L(e);
      if (a === n(w, "process_max_execution_ms")) return D(e);
      const s = l.value[a];
      return s && typeof s.value == "number" ? Math.trunc(Number(e)) : s && typeof s.value == "boolean" ? !!e : e;
    }
    function J(a) {
      const e = l.value[a];
      return e ? JSON.stringify(I(a)) !== JSON.stringify(e.value) : !1;
    }
    async function x() {
      g.value = !0, y.value = "";
      try {
        const a = await Promise.all(
          d.map((s) => B.get(`/api/v1/settings?namespace=${encodeURIComponent(s)}`).then((E) => E.data?.success ? E.data.settings : []).catch(() => []))
        ), e = {};
        for (const s of a.flat())
          e[n(s.namespace, s.key)] = { ns: s.namespace, key: s.key, value: s.value, is_default: s.is_default !== !1 };
        l.value = e, U();
      } catch (a) {
        y.value = a instanceof Error ? a.message : String(a);
      } finally {
        g.value = !1;
      }
    }
    async function q() {
      h.value = !0, y.value = "";
      try {
        for (const a of Object.keys(o.value)) {
          if (!J(a)) continue;
          const e = l.value[a], { data: s } = await B.put("/api/v1/settings", { namespace: e.ns, key: e.key, value: I(a) });
          if (!s?.success) throw new Error(s?.error || `could not save ${e.key}`);
        }
        await x();
      } catch (a) {
        y.value = a instanceof Error ? a.message : String(a);
      } finally {
        h.value = !1;
      }
    }
    async function F(a, e) {
      h.value = !0;
      try {
        await B.put("/api/v1/settings", { namespace: a, key: e, value: null }), await x();
      } catch (s) {
        y.value = s instanceof Error ? s.message : String(s);
      } finally {
        h.value = !1;
      }
    }
    const G = ["jpeg", "png", "webp"], W = ["sparse", "all"];
    return X(x), (a, e) => (u(), c("div", pe, [
      t("div", ge, [
        t("header", he, [
          C.value ? (u(), c("span", be, "Unsaved changes")) : p("", !0),
          m(b(N), {
            type: "button",
            label: "Discard",
            severity: "secondary",
            outlined: "",
            disabled: !C.value || h.value,
            onClick: x
          }, null, 8, ["disabled"]),
          m(b(N), {
            type: "button",
            label: h.value ? "Saving…" : "Save",
            loading: h.value,
            disabled: !C.value || h.value,
            onClick: q
          }, {
            icon: O(() => [
              h.value ? p("", !0) : (u(), P(b(f), {
                key: 0,
                icon: "tabler:device-floppy",
                "aria-hidden": "true"
              }))
            ]),
            _: 1
          }, 8, ["label", "loading", "disabled"])
        ]),
        y.value ? (u(), c("div", ve, Y(y.value), 1)) : p("", !0),
        g.value ? (u(), c("div", me, [
          m(b(f), {
            icon: "tabler:loader-2",
            class: "spin"
          }),
          e[13] || (e[13] = S(" Loading…", -1))
        ])) : (u(), c("div", ye, [
          t("section", fe, [
            t("header", we, [
              m(b(f), {
                icon: "tabler:ruler-2",
                "aria-hidden": "true"
              }),
              e[14] || (e[14] = S(" Limits", -1))
            ]),
            e[21] || (e[21] = t("p", { class: "ap-sub" }, "Ceilings on what a single upload may cost.", -1)),
            v(k, "max_upload_bytes") ? (u(), c(M, { key: 0 }, [
              e[16] || (e[16] = t("label", { class: "ap-blabel" }, "Maximum document size", -1)),
              t("div", ke, [
                t("input", {
                  class: "ap-binput",
                  type: "number",
                  min: "1",
                  step: "1",
                  value: o.value[n(k, "max_upload_bytes")],
                  onInput: e[0] || (e[0] = (s) => o.value[n(k, "max_upload_bytes")] = Number(s.target.value))
                }, null, 40, _e),
                e[15] || (e[15] = t("span", { class: "ap-unit-suffix" }, "MB", -1)),
                T(k, "max_upload_bytes") ? p("", !0) : (u(), P(b(N), {
                  key: 0,
                  type: "button",
                  severity: "secondary",
                  text: "",
                  rounded: "",
                  title: "Reset to default",
                  "aria-label": "Reset to default",
                  onClick: e[1] || (e[1] = (s) => F(k, "max_upload_bytes"))
                }, {
                  icon: O(() => [
                    m(b(f), {
                      icon: "tabler:rotate",
                      "aria-hidden": "true"
                    })
                  ]),
                  _: 1
                }))
              ]),
              e[17] || (e[17] = t("p", { class: "ap-hint" }, "Larger documents are rejected at upload; clamped to the converter's hard ceiling.", -1))
            ], 64)) : p("", !0),
            v(w, "process_max_execution_ms") ? (u(), c(M, { key: 1 }, [
              e[19] || (e[19] = t("label", { class: "ap-blabel" }, "Processing time limit", -1)),
              t("div", xe, [
                t("input", {
                  class: "ap-binput",
                  type: "number",
                  min: "1",
                  step: "1",
                  value: o.value[n(w, "process_max_execution_ms")],
                  onInput: e[2] || (e[2] = (s) => o.value[n(w, "process_max_execution_ms")] = Number(s.target.value))
                }, null, 40, ze),
                e[18] || (e[18] = t("span", { class: "ap-unit-suffix" }, "sec", -1)),
                T(w, "process_max_execution_ms") ? p("", !0) : (u(), P(b(N), {
                  key: 0,
                  type: "button",
                  severity: "secondary",
                  text: "",
                  rounded: "",
                  title: "Reset to default",
                  "aria-label": "Reset to default",
                  onClick: e[3] || (e[3] = (s) => F(w, "process_max_execution_ms"))
                }, {
                  icon: O(() => [
                    m(b(f), {
                      icon: "tabler:rotate",
                      "aria-hidden": "true"
                    })
                  ]),
                  _: 1
                }))
              ]),
              e[20] || (e[20] = t("p", { class: "ap-hint" }, "A conversion/OCR run exceeding this is terminated by the job worker and retried.", -1))
            ], 64)) : p("", !0)
          ]),
          v(i, "rasterize_empty_enabled") ? (u(), c("section", Se, [
            t("header", Ne, [
              m(b(f), {
                icon: "tabler:photo",
                "aria-hidden": "true"
              }),
              e[22] || (e[22] = S(" Page rasterization", -1))
            ]),
            e[31] || (e[31] = t("p", { class: "ap-sub" }, "Choose which document pages to render for OCR across every upload on this installation.", -1)),
            t("div", Ce, [
              e[23] || (e[23] = t("div", { class: "ap-toggle-text" }, [
                t("span", { class: "ap-toggle-name" }, "Rasterize empty documents"),
                t("span", { class: "ap-toggle-desc" }, "Render document pages using the Pages to OCR selection.")
              ], -1)),
              m(b(A), {
                "model-value": !!o.value[n(i, "rasterize_empty_enabled")],
                "aria-label": "Rasterize empty documents",
                "onUpdate:modelValue": e[4] || (e[4] = (s) => o.value[n(i, "rasterize_empty_enabled")] = s)
              }, null, 8, ["model-value"])
            ]),
            t("div", Oe, [
              v(i, "rasterize_page_selection") ? (u(), c("div", Pe, [
                e[24] || (e[24] = t("label", { class: "ap-blabel" }, "Pages to OCR", -1)),
                m(b(V), {
                  class: "ap-select",
                  "model-value": o.value[n(i, "rasterize_page_selection")],
                  options: W,
                  "onUpdate:modelValue": e[5] || (e[5] = (s) => o.value[n(i, "rasterize_page_selection")] = s)
                }, null, 8, ["model-value"]),
                e[25] || (e[25] = t("p", { class: "ap-hint" }, "Applies to every upload on this installation. All pages runs OCR even on pages that already have text, with more model calls and slower processing. Failed or blank OCR keeps the page’s existing text.", -1))
              ])) : p("", !0),
              v(i, "rasterize_format") ? (u(), c("div", Be, [
                e[26] || (e[26] = t("label", { class: "ap-blabel" }, "Image format", -1)),
                m(b(V), {
                  class: "ap-select",
                  "model-value": o.value[n(i, "rasterize_format")],
                  options: G,
                  "onUpdate:modelValue": e[6] || (e[6] = (s) => o.value[n(i, "rasterize_format")] = s)
                }, null, 8, ["model-value"])
              ])) : p("", !0),
              v(i, "rasterize_dpi") ? (u(), c("div", Re, [
                e[28] || (e[28] = t("label", { class: "ap-blabel" }, "Resolution", -1)),
                t("div", Te, [
                  t("input", {
                    class: "ap-binput",
                    type: "number",
                    min: "36",
                    max: "600",
                    step: "1",
                    value: o.value[n(i, "rasterize_dpi")],
                    onInput: e[7] || (e[7] = (s) => o.value[n(i, "rasterize_dpi")] = Number(s.target.value))
                  }, null, 40, Ie),
                  e[27] || (e[27] = t("span", { class: "ap-unit-suffix" }, "DPI", -1))
                ])
              ])) : p("", !0),
              v(i, "rasterize_quality") ? (u(), c("div", Fe, [
                e[30] || (e[30] = t("label", { class: "ap-blabel" }, "JPEG/WEBP quality", -1)),
                t("div", Ee, [
                  t("input", {
                    class: "ap-binput",
                    type: "number",
                    min: "1",
                    max: "100",
                    step: "1",
                    value: o.value[n(i, "rasterize_quality")],
                    onInput: e[8] || (e[8] = (s) => o.value[n(i, "rasterize_quality")] = Number(s.target.value))
                  }, null, 40, Me),
                  e[29] || (e[29] = t("span", { class: "ap-unit-suffix" }, "%", -1))
                ])
              ])) : p("", !0)
            ])
          ])) : p("", !0),
          v(i, "rasterize_max_text_bytes") ? (u(), c("section", Ve, [
            t("header", Ae, [
              m(b(f), {
                icon: "tabler:adjustments-alt",
                "aria-hidden": "true"
              }),
              e[32] || (e[32] = S(" Rasterization thresholds", -1))
            ]),
            e[41] || (e[41] = t("p", { class: "ap-sub" }, "When a document is treated as sparse and how rendering is bounded.", -1)),
            t("div", je, [
              v(i, "rasterize_max_text_bytes") ? (u(), c("div", Le, [
                e[34] || (e[34] = t("label", { class: "ap-blabel" }, "Sparse-text threshold", -1)),
                t("div", $e, [
                  t("input", {
                    class: "ap-binput",
                    type: "number",
                    min: "0",
                    step: "1",
                    value: o.value[n(i, "rasterize_max_text_bytes")],
                    onInput: e[9] || (e[9] = (s) => o.value[n(i, "rasterize_max_text_bytes")] = Number(s.target.value))
                  }, null, 40, De),
                  e[33] || (e[33] = t("span", { class: "ap-unit-suffix" }, "B/page", -1))
                ])
              ])) : p("", !0),
              v(i, "rasterize_min_source_bytes") ? (u(), c("div", Ue, [
                e[36] || (e[36] = t("label", { class: "ap-blabel" }, "Minimum source size", -1)),
                t("div", Je, [
                  t("input", {
                    class: "ap-binput",
                    type: "number",
                    min: "0",
                    step: "1",
                    value: o.value[n(i, "rasterize_min_source_bytes")],
                    onInput: e[10] || (e[10] = (s) => o.value[n(i, "rasterize_min_source_bytes")] = Number(s.target.value))
                  }, null, 40, qe),
                  e[35] || (e[35] = t("span", { class: "ap-unit-suffix" }, "bytes", -1))
                ])
              ])) : p("", !0),
              v(i, "rasterize_min_page_bytes") ? (u(), c("div", Ge, [
                e[38] || (e[38] = t("label", { class: "ap-blabel" }, "Full-page image threshold", -1)),
                t("div", We, [
                  t("input", {
                    class: "ap-binput",
                    type: "number",
                    min: "0",
                    step: "1",
                    value: o.value[n(i, "rasterize_min_page_bytes")],
                    onInput: e[11] || (e[11] = (s) => o.value[n(i, "rasterize_min_page_bytes")] = Number(s.target.value))
                  }, null, 40, He),
                  e[37] || (e[37] = t("span", { class: "ap-unit-suffix" }, "bytes", -1))
                ])
              ])) : p("", !0),
              v(i, "rasterize_batch_pages") ? (u(), c("div", Ke, [
                e[40] || (e[40] = t("label", { class: "ap-blabel" }, "Pages per render batch", -1)),
                t("div", Qe, [
                  t("input", {
                    class: "ap-binput",
                    type: "number",
                    min: "1",
                    max: "256",
                    step: "1",
                    value: o.value[n(i, "rasterize_batch_pages")],
                    onInput: e[12] || (e[12] = (s) => o.value[n(i, "rasterize_batch_pages")] = Number(s.target.value))
                  }, null, 40, Xe),
                  e[39] || (e[39] = t("span", { class: "ap-unit-suffix" }, "pages", -1))
                ])
              ])) : p("", !0)
            ])
          ])) : p("", !0)
        ]))
      ])
    ]));
  }
});
export {
  at as default
};
//# sourceMappingURL=storage-settings-7VoLAmgh.js.map
