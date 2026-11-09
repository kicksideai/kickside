import { B as W, w as K, f as G, n as z, g as H, t as Q, P as X } from "./index-DCyVY6h3.js";
import { openBlock as l, createElementBlock as d, mergeProps as S, createElementVNode as e, renderSlot as Y, defineComponent as Z, ref as k, computed as rr, onMounted as er, createCommentVNode as g, createVNode as b, unref as v, withCtx as P, createBlock as B, toDisplayString as ar, createTextVNode as C, Fragment as R } from "vue";
import { Icon as w } from "@iconify/vue";
import { api as O, define as tr } from "@wippy-fe/proxy";
var or = `
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
`, ir = {
  root: {
    position: "relative"
  }
}, nr = {
  root: function(c) {
    var u = c.instance, h = c.props;
    return ["p-toggleswitch p-component", {
      "p-toggleswitch-checked": u.checked,
      "p-disabled": h.disabled,
      "p-invalid": u.$invalid
    }];
  },
  input: "p-toggleswitch-input",
  slider: "p-toggleswitch-slider",
  handle: "p-toggleswitch-handle"
}, sr = W.extend({
  name: "toggleswitch",
  style: or,
  classes: nr,
  inlineStyles: ir
}), pr = {
  name: "BaseToggleSwitch",
  extends: K,
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
  style: sr,
  provide: function() {
    return {
      $pcToggleSwitch: this,
      $parentInstance: this
    };
  }
}, V = {
  name: "ToggleSwitch",
  extends: pr,
  inheritAttrs: !1,
  emits: ["change", "focus", "blur"],
  methods: {
    getPTOptions: function(c) {
      var u = c === "root" ? this.ptmi : this.ptm;
      return u(c, {
        context: {
          checked: this.checked,
          disabled: this.disabled
        }
      });
    },
    onChange: function(c) {
      if (!this.disabled && !this.readonly) {
        var u = this.checked ? this.falseValue : this.trueValue;
        this.writeValue(u, c), this.$emit("change", c);
      }
    },
    onFocus: function(c) {
      this.$emit("focus", c);
    },
    onBlur: function(c) {
      var u, h;
      this.$emit("blur", c), (u = (h = this.formField).onBlur) === null || u === void 0 || u.call(h, c);
    }
  },
  computed: {
    checked: function() {
      return this.d_value === this.trueValue;
    },
    dataP: function() {
      return G({
        checked: this.checked,
        disabled: this.disabled,
        invalid: this.$invalid
      });
    }
  }
}, cr = ["data-p-checked", "data-p-disabled", "data-p"], lr = ["id", "checked", "tabindex", "disabled", "readonly", "aria-checked", "aria-labelledby", "aria-label", "aria-invalid"], dr = ["data-p"], gr = ["data-p"];
function ur(n, c, u, h, f, o) {
  return l(), d("div", S({
    class: n.cx("root"),
    style: n.sx("root")
  }, o.getPTOptions("root"), {
    "data-p-checked": o.checked,
    "data-p-disabled": n.disabled,
    "data-p": o.dataP
  }), [e("input", S({
    id: n.inputId,
    type: "checkbox",
    role: "switch",
    class: [n.cx("input"), n.inputClass],
    style: n.inputStyle,
    checked: o.checked,
    tabindex: n.tabindex,
    disabled: n.disabled,
    readonly: n.readonly,
    "aria-checked": o.checked,
    "aria-labelledby": n.ariaLabelledby,
    "aria-label": n.ariaLabel,
    "aria-invalid": n.invalid || void 0,
    onFocus: c[0] || (c[0] = function() {
      return o.onFocus && o.onFocus.apply(o, arguments);
    }),
    onBlur: c[1] || (c[1] = function() {
      return o.onBlur && o.onBlur.apply(o, arguments);
    }),
    onChange: c[2] || (c[2] = function() {
      return o.onChange && o.onChange.apply(o, arguments);
    })
  }, o.getPTOptions("input")), null, 16, lr), e("div", S({
    class: n.cx("slider")
  }, o.getPTOptions("slider"), {
    "data-p": o.dataP
  }), [e("div", S({
    class: n.cx("handle")
  }, o.getPTOptions("handle"), {
    "data-p": o.dataP
  }), [Y(n.$slots, "handle", {
    checked: o.checked
  })], 16, gr)], 16, dr)], 16, cr);
}
V.render = ur;
const hr = { class: "ap" }, vr = { class: "ap-body" }, mr = { class: "ap-bar" }, br = {
  key: 0,
  class: "ap-dirty"
}, fr = {
  key: 0,
  class: "ap-msg ap-err"
}, wr = {
  key: 1,
  class: "ap-loading"
}, yr = {
  key: 2,
  class: "ap-cards"
}, xr = { class: "ap-card" }, kr = { class: "ap-h" }, _r = { class: "ap-unit" }, zr = ["value"], Sr = { class: "ap-unit" }, Cr = ["value"], Nr = {
  key: 0,
  class: "ap-card"
}, Pr = { class: "ap-h" }, Br = { class: "ap-toggle-row" }, Or = { class: "ap-field-grid" }, Mr = {
  key: 0,
  class: "ap-fg"
}, Tr = {
  key: 1,
  class: "ap-fg"
}, Ir = { class: "ap-unit" }, jr = ["value"], Er = {
  key: 2,
  class: "ap-fg"
}, Rr = { class: "ap-unit" }, Vr = ["value"], Fr = {
  key: 1,
  class: "ap-card"
}, Ar = { class: "ap-h" }, Dr = { class: "ap-field-grid" }, Lr = {
  key: 0,
  class: "ap-fg"
}, Ur = { class: "ap-unit" }, $r = ["value"], qr = {
  key: 1,
  class: "ap-fg"
}, Jr = { class: "ap-unit" }, Wr = ["value"], Kr = {
  key: 2,
  class: "ap-fg"
}, Gr = { class: "ap-unit" }, Hr = ["value"], Qr = {
  key: 3,
  class: "ap-fg"
}, Xr = { class: "ap-unit" }, Yr = ["value"], y = "kickside.uploads", x = "kickside.uploads.documents", s = "kickside.uploads.rasterize", Zr = /* @__PURE__ */ Z({
  __name: "storage-settings",
  setup(n) {
    const c = ["kickside.uploads", "kickside.uploads.documents", "kickside.uploads.rasterize"], u = k(!0), h = k(!1), f = k(""), o = k({}), p = k({});
    let M = "";
    const i = (t, r) => `${t}|${r}`, m = (t, r) => !!o.value[i(t, r)], T = (t, r) => o.value[i(t, r)]?.is_default !== !1, F = (t) => Math.round(Number(t) / (1024 * 1024) * 100) / 100, A = (t) => Math.round(Number(t) * 1024 * 1024), D = (t) => Math.round(Number(t) / 1e3 * 10) / 10, L = (t) => Math.round(Number(t) * 1e3);
    function U() {
      const t = {};
      for (const r of Object.values(o.value)) {
        const a = i(r.ns, r.key);
        a === i(x, "max_upload_bytes") ? t[a] = F(r.value) : a === i(y, "process_max_execution_ms") ? t[a] = D(r.value) : (r.value, t[a] = r.value);
      }
      p.value = t, M = JSON.stringify(t);
    }
    const N = rr(() => JSON.stringify(p.value) !== M);
    function I(t) {
      const r = p.value[t];
      if (t === i(x, "max_upload_bytes")) return A(r);
      if (t === i(y, "process_max_execution_ms")) return L(r);
      const a = o.value[t];
      return a && typeof a.value == "number" ? Math.trunc(Number(r)) : a && typeof a.value == "boolean" ? !!r : r;
    }
    function $(t) {
      const r = o.value[t];
      return r ? JSON.stringify(I(t)) !== JSON.stringify(r.value) : !1;
    }
    async function _() {
      u.value = !0, f.value = "";
      try {
        const t = await Promise.all(
          c.map((a) => O.get(`/api/v1/settings?namespace=${encodeURIComponent(a)}`).then((E) => E.data?.success ? E.data.settings : []).catch(() => []))
        ), r = {};
        for (const a of t.flat())
          r[i(a.namespace, a.key)] = { ns: a.namespace, key: a.key, value: a.value, is_default: a.is_default !== !1 };
        o.value = r, U();
      } catch (t) {
        f.value = t instanceof Error ? t.message : String(t);
      } finally {
        u.value = !1;
      }
    }
    async function q() {
      h.value = !0, f.value = "";
      try {
        for (const t of Object.keys(p.value)) {
          if (!$(t)) continue;
          const r = o.value[t], { data: a } = await O.put("/api/v1/settings", { namespace: r.ns, key: r.key, value: I(t) });
          if (!a?.success) throw new Error(a?.error || `could not save ${r.key}`);
        }
        await _();
      } catch (t) {
        f.value = t instanceof Error ? t.message : String(t);
      } finally {
        h.value = !1;
      }
    }
    async function j(t, r) {
      h.value = !0;
      try {
        await O.put("/api/v1/settings", { namespace: t, key: r, value: null }), await _();
      } catch (a) {
        f.value = a instanceof Error ? a.message : String(a);
      } finally {
        h.value = !1;
      }
    }
    const J = ["jpeg", "png", "webp"];
    return er(_), (t, r) => (l(), d("div", hr, [
      e("div", vr, [
        e("header", mr, [
          N.value ? (l(), d("span", br, "Unsaved changes")) : g("", !0),
          b(v(z), {
            type: "button",
            label: "Discard",
            severity: "secondary",
            outlined: "",
            disabled: !N.value || h.value,
            onClick: _
          }, null, 8, ["disabled"]),
          b(v(z), {
            type: "button",
            label: h.value ? "Saving…" : "Save",
            loading: h.value,
            disabled: !N.value || h.value,
            onClick: q
          }, {
            icon: P(() => [
              h.value ? g("", !0) : (l(), B(v(w), {
                key: 0,
                icon: "tabler:device-floppy",
                "aria-hidden": "true"
              }))
            ]),
            _: 1
          }, 8, ["label", "loading", "disabled"])
        ]),
        f.value ? (l(), d("div", fr, ar(f.value), 1)) : g("", !0),
        u.value ? (l(), d("div", wr, [
          b(v(w), {
            icon: "tabler:loader-2",
            class: "spin"
          }),
          r[12] || (r[12] = C(" Loading…", -1))
        ])) : (l(), d("div", yr, [
          e("section", xr, [
            e("header", kr, [
              b(v(w), {
                icon: "tabler:ruler-2",
                "aria-hidden": "true"
              }),
              r[13] || (r[13] = C(" Limits", -1))
            ]),
            r[20] || (r[20] = e("p", { class: "ap-sub" }, "Ceilings on what a single upload may cost.", -1)),
            m(x, "max_upload_bytes") ? (l(), d(R, { key: 0 }, [
              r[15] || (r[15] = e("label", { class: "ap-blabel" }, "Maximum document size", -1)),
              e("div", _r, [
                e("input", {
                  class: "ap-binput",
                  type: "number",
                  min: "1",
                  step: "1",
                  value: p.value[i(x, "max_upload_bytes")],
                  onInput: r[0] || (r[0] = (a) => p.value[i(x, "max_upload_bytes")] = Number(a.target.value))
                }, null, 40, zr),
                r[14] || (r[14] = e("span", { class: "ap-unit-suffix" }, "MB", -1)),
                T(x, "max_upload_bytes") ? g("", !0) : (l(), B(v(z), {
                  key: 0,
                  type: "button",
                  severity: "secondary",
                  text: "",
                  rounded: "",
                  title: "Reset to default",
                  "aria-label": "Reset to default",
                  onClick: r[1] || (r[1] = (a) => j(x, "max_upload_bytes"))
                }, {
                  icon: P(() => [
                    b(v(w), {
                      icon: "tabler:rotate",
                      "aria-hidden": "true"
                    })
                  ]),
                  _: 1
                }))
              ]),
              r[16] || (r[16] = e("p", { class: "ap-hint" }, "Larger documents are rejected at upload; clamped to the converter's hard ceiling.", -1))
            ], 64)) : g("", !0),
            m(y, "process_max_execution_ms") ? (l(), d(R, { key: 1 }, [
              r[18] || (r[18] = e("label", { class: "ap-blabel" }, "Processing time limit", -1)),
              e("div", Sr, [
                e("input", {
                  class: "ap-binput",
                  type: "number",
                  min: "1",
                  step: "1",
                  value: p.value[i(y, "process_max_execution_ms")],
                  onInput: r[2] || (r[2] = (a) => p.value[i(y, "process_max_execution_ms")] = Number(a.target.value))
                }, null, 40, Cr),
                r[17] || (r[17] = e("span", { class: "ap-unit-suffix" }, "sec", -1)),
                T(y, "process_max_execution_ms") ? g("", !0) : (l(), B(v(z), {
                  key: 0,
                  type: "button",
                  severity: "secondary",
                  text: "",
                  rounded: "",
                  title: "Reset to default",
                  "aria-label": "Reset to default",
                  onClick: r[3] || (r[3] = (a) => j(y, "process_max_execution_ms"))
                }, {
                  icon: P(() => [
                    b(v(w), {
                      icon: "tabler:rotate",
                      "aria-hidden": "true"
                    })
                  ]),
                  _: 1
                }))
              ]),
              r[19] || (r[19] = e("p", { class: "ap-hint" }, "A conversion/OCR run exceeding this is terminated by the job worker and retried.", -1))
            ], 64)) : g("", !0)
          ]),
          m(s, "rasterize_empty_enabled") ? (l(), d("section", Nr, [
            e("header", Pr, [
              b(v(w), {
                icon: "tabler:photo",
                "aria-hidden": "true"
              }),
              r[21] || (r[21] = C(" Page rasterization", -1))
            ]),
            r[28] || (r[28] = e("p", { class: "ap-sub" }, "Render empty or low-text documents to page images so vision captioning can embed them.", -1)),
            e("div", Br, [
              r[22] || (r[22] = e("div", { class: "ap-toggle-text" }, [
                e("span", { class: "ap-toggle-name" }, "Rasterize empty documents"),
                e("span", { class: "ap-toggle-desc" }, "Render pages when little or no text can be extracted.")
              ], -1)),
              b(v(V), {
                "model-value": !!p.value[i(s, "rasterize_empty_enabled")],
                "aria-label": "Rasterize empty documents",
                "onUpdate:modelValue": r[4] || (r[4] = (a) => p.value[i(s, "rasterize_empty_enabled")] = a)
              }, null, 8, ["model-value"])
            ]),
            e("div", Or, [
              m(s, "rasterize_format") ? (l(), d("div", Mr, [
                r[23] || (r[23] = e("label", { class: "ap-blabel" }, "Image format", -1)),
                b(v(H), {
                  class: "ap-select",
                  "model-value": p.value[i(s, "rasterize_format")],
                  options: J,
                  "onUpdate:modelValue": r[5] || (r[5] = (a) => p.value[i(s, "rasterize_format")] = a)
                }, null, 8, ["model-value"])
              ])) : g("", !0),
              m(s, "rasterize_dpi") ? (l(), d("div", Tr, [
                r[25] || (r[25] = e("label", { class: "ap-blabel" }, "Resolution", -1)),
                e("div", Ir, [
                  e("input", {
                    class: "ap-binput",
                    type: "number",
                    min: "36",
                    max: "600",
                    step: "1",
                    value: p.value[i(s, "rasterize_dpi")],
                    onInput: r[6] || (r[6] = (a) => p.value[i(s, "rasterize_dpi")] = Number(a.target.value))
                  }, null, 40, jr),
                  r[24] || (r[24] = e("span", { class: "ap-unit-suffix" }, "DPI", -1))
                ])
              ])) : g("", !0),
              m(s, "rasterize_quality") ? (l(), d("div", Er, [
                r[27] || (r[27] = e("label", { class: "ap-blabel" }, "JPEG/WEBP quality", -1)),
                e("div", Rr, [
                  e("input", {
                    class: "ap-binput",
                    type: "number",
                    min: "1",
                    max: "100",
                    step: "1",
                    value: p.value[i(s, "rasterize_quality")],
                    onInput: r[7] || (r[7] = (a) => p.value[i(s, "rasterize_quality")] = Number(a.target.value))
                  }, null, 40, Vr),
                  r[26] || (r[26] = e("span", { class: "ap-unit-suffix" }, "%", -1))
                ])
              ])) : g("", !0)
            ])
          ])) : g("", !0),
          m(s, "rasterize_max_text_bytes") ? (l(), d("section", Fr, [
            e("header", Ar, [
              b(v(w), {
                icon: "tabler:adjustments-alt",
                "aria-hidden": "true"
              }),
              r[29] || (r[29] = C(" Rasterization thresholds", -1))
            ]),
            r[38] || (r[38] = e("p", { class: "ap-sub" }, "When a document is treated as sparse and how rendering is bounded.", -1)),
            e("div", Dr, [
              m(s, "rasterize_max_text_bytes") ? (l(), d("div", Lr, [
                r[31] || (r[31] = e("label", { class: "ap-blabel" }, "Sparse-text threshold", -1)),
                e("div", Ur, [
                  e("input", {
                    class: "ap-binput",
                    type: "number",
                    min: "0",
                    step: "1",
                    value: p.value[i(s, "rasterize_max_text_bytes")],
                    onInput: r[8] || (r[8] = (a) => p.value[i(s, "rasterize_max_text_bytes")] = Number(a.target.value))
                  }, null, 40, $r),
                  r[30] || (r[30] = e("span", { class: "ap-unit-suffix" }, "B/page", -1))
                ])
              ])) : g("", !0),
              m(s, "rasterize_min_source_bytes") ? (l(), d("div", qr, [
                r[33] || (r[33] = e("label", { class: "ap-blabel" }, "Minimum source size", -1)),
                e("div", Jr, [
                  e("input", {
                    class: "ap-binput",
                    type: "number",
                    min: "0",
                    step: "1",
                    value: p.value[i(s, "rasterize_min_source_bytes")],
                    onInput: r[9] || (r[9] = (a) => p.value[i(s, "rasterize_min_source_bytes")] = Number(a.target.value))
                  }, null, 40, Wr),
                  r[32] || (r[32] = e("span", { class: "ap-unit-suffix" }, "bytes", -1))
                ])
              ])) : g("", !0),
              m(s, "rasterize_min_page_bytes") ? (l(), d("div", Kr, [
                r[35] || (r[35] = e("label", { class: "ap-blabel" }, "Full-page image threshold", -1)),
                e("div", Gr, [
                  e("input", {
                    class: "ap-binput",
                    type: "number",
                    min: "0",
                    step: "1",
                    value: p.value[i(s, "rasterize_min_page_bytes")],
                    onInput: r[10] || (r[10] = (a) => p.value[i(s, "rasterize_min_page_bytes")] = Number(a.target.value))
                  }, null, 40, Hr),
                  r[34] || (r[34] = e("span", { class: "ap-unit-suffix" }, "bytes", -1))
                ])
              ])) : g("", !0),
              m(s, "rasterize_batch_pages") ? (l(), d("div", Qr, [
                r[37] || (r[37] = e("label", { class: "ap-blabel" }, "Pages per render batch", -1)),
                e("div", Xr, [
                  e("input", {
                    class: "ap-binput",
                    type: "number",
                    min: "1",
                    max: "256",
                    step: "1",
                    value: p.value[i(s, "rasterize_batch_pages")],
                    onInput: r[11] || (r[11] = (a) => p.value[i(s, "rasterize_batch_pages")] = Number(a.target.value))
                  }, null, 40, Yr),
                  r[36] || (r[36] = e("span", { class: "ap-unit-suffix" }, "pages", -1))
                ])
              ])) : g("", !0)
            ])
          ])) : g("", !0)
        ]))
      ])
    ]));
  }
}), re = ':root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}.spin{animation:kx-spin 1s linear infinite}@keyframes kx-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.spin{animation:none}}.kx-tag-sm,.kx-tag-sm.kx-tag-sm{display:inline-flex;align-items:center;gap:4px;padding:1px 7px;border-radius:var(--kx-radius-tag, 6px);font-size:10.5px;font-weight:600;line-height:1.5;white-space:nowrap}.kx-tag-sm svg,.kx-tag-sm.kx-tag-sm svg{width:12px;height:12px}.kx-tag-caps,.kx-tag-caps.kx-tag-caps{display:inline-flex;align-items:center;gap:3px;padding:2px 6px;border-radius:var(--kx-radius-tag, 6px);font-size:9px;font-weight:700;line-height:1.5;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap}.kx-tag-caps svg,.kx-tag-caps.kx-tag-caps svg{width:11px;height:11px}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}:host{display:block;height:100%;min-height:0}:host>div{height:100%;min-height:0}*,*:before,*:after{box-sizing:border-box}:host{--system-surface-gutter: var(--kickside-system-surface-gutter, 24px)}.ap{display:flex;flex-direction:column;height:100%;min-height:0;color:var(--p-text-color);background:var(--p-content-background)}.ap-body{flex:1;overflow-y:auto;padding:0 0 28px}.ap-bar{display:flex;align-items:center;justify-content:flex-end;gap:10px;width:100%;padding:12px var(--system-surface-gutter);background:var(--p-content-background);position:sticky;top:0;z-index:3;border-bottom:1px solid var(--p-content-border-color)}.ap-dirty{display:inline-flex;align-items:center;height:34px;font-size:12px;font-weight:600;color:var(--p-warn-600, var(--p-warn-500));background:color-mix(in srgb,var(--p-warn-500) 16%,transparent);padding:0 11px;border-radius:8px;margin-right:auto}.ap-msg{margin:12px var(--system-surface-gutter) 0;padding:9px 12px;border-radius:8px;font-size:13px}.ap-err{background:color-mix(in srgb,var(--p-danger-500) 12%,transparent);color:var(--p-danger-600, var(--p-danger-500))}.ap-loading{display:flex;align-items:center;gap:8px;color:var(--p-text-muted-color);font-size:13px;padding:24px}.ap-cards{display:flex;flex-direction:column;gap:16px;padding:16px var(--system-surface-gutter) 0}.ap-card{background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:14px;padding:16px 18px}.ap-h{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:800;color:var(--p-text-color);letter-spacing:-.2px}.ap-h svg{width:17px;height:17px;color:var(--p-text-muted-color)}.ap-sub{font-size:12.5px;color:var(--p-text-muted-color);margin:4px 0 12px}.ap-blabel{display:block;font-size:11.5px;font-weight:700;color:var(--p-text-muted-color);text-transform:uppercase;letter-spacing:.04em;margin:12px 0 6px}.ap-binput{width:100%;height:34px;padding:0 12px;border-radius:8px;border:1px solid var(--p-content-border-color);background:var(--p-content-background);color:var(--p-text-color);font:inherit;font-size:13px;box-sizing:border-box}.ap-select{width:100%}.ap-hint{font-size:11.5px;color:var(--p-text-muted-color);margin:8px 0 0}.ap-unit{display:flex;align-items:center;gap:8px}.ap-unit .ap-binput{flex:1;min-width:0}.ap-unit-suffix{font-size:12px;font-weight:600;color:var(--p-text-muted-color);flex:0 0 auto;min-width:34px}.ap-toggle-row{display:flex;align-items:center;gap:16px;margin-top:8px}.ap-toggle-text{display:flex;flex-direction:column;gap:2px;flex:1;min-width:0}.ap-toggle-name{font-size:13px;font-weight:600;color:var(--p-text-color)}.ap-toggle-desc{font-size:12px;color:var(--p-text-muted-color)}.ap-field-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px 14px;margin-top:14px}.ap-fg{min-width:0}.ap-fg .ap-blabel{margin-top:0}', ee = { type: "object", properties: {} };
class ae extends Q {
  static get wippyConfig() {
    return {
      propsSchema: ee,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: re
    };
  }
  static get vueConfig() {
    return { rootComponent: Zr, plugins: [X] };
  }
}
tr(import.meta.url, ae);
//# sourceMappingURL=settings.js.map
