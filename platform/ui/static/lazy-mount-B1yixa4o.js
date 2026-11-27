import { s as Ke, a as ke, B as ge, b as Tt, O as Ft, Y as Ht, C as At, c as gt, P as hn, I as Dt, D as Bt, x as Ie, d as Se, f as me, z as Pt, e as Ee, R as Oe, T as Le, g as fn, F as gn, M as vt, k as vn, h as mn, i as ce, v as bn, S as yn, L as wn, j as kn, $ as In, J as Sn, p as we, u as Cn, m as On } from "./wc-runtime-BZVedRCy.js";
import { defineComponent as it, ref as R, onMounted as Et, watch as Ge, onBeforeUnmount as Rt, openBlock as c, createElementBlock as v, resolveComponent as oe, mergeProps as w, createCommentVNode as F, createVNode as S, withCtx as he, Transition as Kt, createElementVNode as r, computed as ee, renderSlot as K, Fragment as J, renderList as fe, resolveDirective as Ln, createTextVNode as A, toDisplayString as E, normalizeClass as te, createBlock as se, resolveDynamicComponent as mt, normalizeProps as xn, createSlots as $n, withDirectives as We, withModifiers as pe, useModel as Vn, unref as s, vModelText as bt } from "vue";
import { Icon as z } from "@iconify/vue";
import { loadByTagName as zn, api as Xe, host as Be, on as Mn } from "@wippy-fe/proxy";
import Tn from "markdown-it";
const yt = /* @__PURE__ */ it({
  __name: "IconField",
  props: {
    modelValue: {},
    fallback: {}
  },
  emits: ["update:modelValue"],
  setup(t, { emit: e }) {
    const n = t, i = e, l = R(null);
    let o = null;
    function d(h) {
      i("update:modelValue", h.detail || "");
    }
    async function u() {
      if (l.value) {
        o && o.removeEventListener("select", d), l.value.innerHTML = "";
        try {
          customElements.get("wc-icon-picker") || await zn("wc-icon-picker", { timeoutMs: 8e3 });
        } catch {
        }
        l.value && (o = document.createElement("wc-icon-picker"), o.setAttribute("value", n.modelValue || ""), n.fallback && o.setAttribute("fallback", n.fallback), o.addEventListener("select", d), l.value.appendChild(o));
      }
    }
    return Et(u), Ge(() => n.modelValue, (h) => {
      o && o.getAttribute("value") !== h && o.setAttribute("value", h || "");
    }), Rt(() => {
      o && o.removeEventListener("select", d);
    }), (h, k) => (c(), v("div", {
      ref_key: "host",
      ref: l,
      class: "wc-iconfield"
    }, null, 512));
  }
});
var ot = {
  name: "BaseEditableHolder",
  extends: Ke,
  emits: ["update:modelValue", "value-change"],
  props: {
    modelValue: {
      type: null,
      default: void 0
    },
    defaultValue: {
      type: null,
      default: void 0
    },
    name: {
      type: String,
      default: void 0
    },
    invalid: {
      type: Boolean,
      default: void 0
    },
    disabled: {
      type: Boolean,
      default: !1
    },
    formControl: {
      type: Object,
      default: void 0
    }
  },
  inject: {
    $parentInstance: {
      default: void 0
    },
    $pcForm: {
      default: void 0
    },
    $pcFormField: {
      default: void 0
    }
  },
  data: function() {
    return {
      d_value: this.defaultValue !== void 0 ? this.defaultValue : this.modelValue
    };
  },
  watch: {
    modelValue: {
      deep: !0,
      handler: function(e) {
        this.d_value = e;
      }
    },
    defaultValue: function(e) {
      this.d_value = e;
    },
    $formName: {
      immediate: !0,
      handler: function(e) {
        var n, i;
        this.formField = ((n = this.$pcForm) === null || n === void 0 || (i = n.register) === null || i === void 0 ? void 0 : i.call(n, e, this.$formControl)) || {};
      }
    },
    $formControl: {
      immediate: !0,
      handler: function(e) {
        var n, i;
        this.formField = ((n = this.$pcForm) === null || n === void 0 || (i = n.register) === null || i === void 0 ? void 0 : i.call(n, this.$formName, e)) || {};
      }
    },
    $formDefaultValue: {
      immediate: !0,
      handler: function(e) {
        this.d_value !== e && (this.d_value = e);
      }
    },
    $formValue: {
      immediate: !1,
      handler: function(e) {
        var n;
        (n = this.$pcForm) !== null && n !== void 0 && n.getFieldState(this.$formName) && e !== this.d_value && (this.d_value = e);
      }
    }
  },
  formField: {},
  methods: {
    writeValue: function(e, n) {
      var i, l;
      this.controlled && (this.d_value = e, this.$emit("update:modelValue", e)), this.$emit("value-change", e), (i = (l = this.formField).onChange) === null || i === void 0 || i.call(l, {
        originalEvent: n,
        value: e
      });
    },
    // @todo move to @primeuix/utils
    findNonEmpty: function() {
      for (var e = arguments.length, n = new Array(e), i = 0; i < e; i++)
        n[i] = arguments[i];
      return n.find(ke);
    }
  },
  computed: {
    $filled: function() {
      return ke(this.d_value);
    },
    $invalid: function() {
      var e, n;
      return !this.$formNovalidate && this.findNonEmpty(this.invalid, (e = this.$pcFormField) === null || e === void 0 || (e = e.$field) === null || e === void 0 ? void 0 : e.invalid, (n = this.$pcForm) === null || n === void 0 || (n = n.getFieldState(this.$formName)) === null || n === void 0 ? void 0 : n.invalid);
    },
    $formName: function() {
      var e;
      return this.$formNovalidate ? void 0 : this.name || ((e = this.$formControl) === null || e === void 0 ? void 0 : e.name);
    },
    $formControl: function() {
      var e;
      return this.formControl || ((e = this.$pcFormField) === null || e === void 0 ? void 0 : e.formControl);
    },
    $formNovalidate: function() {
      var e;
      return (e = this.$formControl) === null || e === void 0 ? void 0 : e.novalidate;
    },
    $formDefaultValue: function() {
      var e, n;
      return this.findNonEmpty(this.d_value, (e = this.$pcFormField) === null || e === void 0 ? void 0 : e.initialValue, (n = this.$pcForm) === null || n === void 0 || (n = n.initialValues) === null || n === void 0 ? void 0 : n[this.$formName]);
    },
    $formValue: function() {
      var e, n;
      return this.findNonEmpty((e = this.$pcFormField) === null || e === void 0 || (e = e.$field) === null || e === void 0 ? void 0 : e.value, (n = this.$pcForm) === null || n === void 0 || (n = n.getFieldState(this.$formName)) === null || n === void 0 ? void 0 : n.value);
    },
    controlled: function() {
      return this.$inProps.hasOwnProperty("modelValue") || !this.$inProps.hasOwnProperty("modelValue") && !this.$inProps.hasOwnProperty("defaultValue");
    },
    // @deprecated use $filled instead
    filled: function() {
      return this.$filled;
    }
  }
}, Fn = `
    .p-colorpicker {
        display: inline-block;
        position: relative;
    }

    .p-colorpicker-dragging {
        cursor: pointer;
    }

    .p-colorpicker-preview {
        width: dt('colorpicker.preview.width');
        height: dt('colorpicker.preview.height');
        padding: 0;
        border: 0 none;
        border-radius: dt('colorpicker.preview.border.radius');
        transition:
            background dt('colorpicker.transition.duration'),
            color dt('colorpicker.transition.duration'),
            border-color dt('colorpicker.transition.duration'),
            outline-color dt('colorpicker.transition.duration'),
            box-shadow dt('colorpicker.transition.duration');
        outline-color: transparent;
        cursor: pointer;
    }

    .p-colorpicker-preview:enabled:focus-visible {
        border-color: dt('colorpicker.preview.focus.border.color');
        box-shadow: dt('colorpicker.preview.focus.ring.shadow');
        outline: dt('colorpicker.preview.focus.ring.width') dt('colorpicker.preview.focus.ring.style') dt('colorpicker.preview.focus.ring.color');
        outline-offset: dt('colorpicker.preview.focus.ring.offset');
    }

    .p-colorpicker-panel {
        background: dt('colorpicker.panel.background');
        border: 1px solid dt('colorpicker.panel.border.color');
        border-radius: dt('colorpicker.panel.border.radius');
        box-shadow: dt('colorpicker.panel.shadow');
        width: 193px;
        height: 166px;
        position: absolute;
        top: 0;
        left: 0;
    }

    .p-colorpicker-panel-inline {
        box-shadow: none;
        position: static;
    }

    .p-colorpicker-content {
        position: relative;
    }

    .p-colorpicker-color-selector {
        width: 150px;
        height: 150px;
        inset-block-start: 8px;
        inset-inline-start: 8px;
        position: absolute;
    }

    .p-colorpicker-color-background {
        width: 100%;
        height: 100%;
        background: linear-gradient(to top, #000 0%, rgba(0, 0, 0, 0) 100%), linear-gradient(to right, #fff 0%, rgba(255, 255, 255, 0) 100%);
    }

    .p-colorpicker-color-handle {
        position: absolute;
        inset-block-start: 0px;
        inset-inline-start: 150px;
        border-radius: 100%;
        width: 10px;
        height: 10px;
        border-width: 1px;
        border-style: solid;
        margin: -5px 0 0 -5px;
        cursor: pointer;
        opacity: 0.85;
        border-color: dt('colorpicker.handle.color');
    }

    .p-colorpicker-hue {
        width: 17px;
        height: 150px;
        inset-block-start: 8px;
        inset-inline-start: 167px;
        position: absolute;
        opacity: 0.85;
        background: linear-gradient(0deg, red 0, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, red);
    }

    .p-colorpicker-hue-handle {
        position: absolute;
        inset-block-start: 150px;
        inset-inline-start: 0px;
        width: 21px;
        margin-inline-start: -2px;
        margin-block-start: -5px;
        height: 10px;
        border-width: 2px;
        border-style: solid;
        opacity: 0.85;
        cursor: pointer;
        border-color: dt('colorpicker.handle.color');
    }
`, Hn = {
  root: "p-colorpicker p-component",
  preview: function(e) {
    var n = e.props;
    return ["p-colorpicker-preview", {
      "p-disabled": n.disabled
    }];
  },
  panel: function(e) {
    var n = e.instance, i = e.props;
    return ["p-colorpicker-panel", {
      "p-colorpicker-panel-inline": i.inline,
      "p-disabled": i.disabled,
      "p-invalid": n.$invalid
    }];
  },
  colorSelector: "p-colorpicker-color-selector",
  colorBackground: "p-colorpicker-color-background",
  colorHandle: "p-colorpicker-color-handle",
  hue: "p-colorpicker-hue",
  hueHandle: "p-colorpicker-hue-handle"
}, An = ge.extend({
  name: "colorpicker",
  style: Fn,
  classes: Hn
}), Dn = {
  name: "BaseColorPicker",
  extends: ot,
  props: {
    defaultColor: {
      type: null,
      default: "ff0000"
    },
    inline: {
      type: Boolean,
      default: !1
    },
    format: {
      type: String,
      default: "hex"
    },
    tabindex: {
      type: String,
      default: null
    },
    autoZIndex: {
      type: Boolean,
      default: !0
    },
    baseZIndex: {
      type: Number,
      default: 0
    },
    appendTo: {
      type: [String, Object],
      default: "body"
    },
    inputId: {
      type: String,
      default: null
    },
    panelClass: null,
    overlayClass: null
  },
  style: An,
  provide: function() {
    return {
      $pcColorPicker: this,
      $parentInstance: this
    };
  }
}, jt = {
  name: "ColorPicker",
  extends: Dn,
  inheritAttrs: !1,
  emits: ["change", "show", "hide"],
  data: function() {
    return {
      overlayVisible: !1
    };
  },
  hsbValue: null,
  localHue: null,
  outsideClickListener: null,
  documentMouseMoveListener: null,
  documentMouseUpListener: null,
  scrollHandler: null,
  resizeListener: null,
  hueDragging: null,
  colorDragging: null,
  selfUpdate: null,
  picker: null,
  colorSelector: null,
  colorHandle: null,
  hueView: null,
  hueHandle: null,
  watch: {
    modelValue: {
      immediate: !0,
      handler: function(e) {
        this.hsbValue = this.toHSB(e), this.selfUpdate ? this.selfUpdate = !1 : this.updateUI();
      }
    }
  },
  beforeUnmount: function() {
    this.unbindOutsideClickListener(), this.unbindDragListeners(), this.unbindResizeListener(), this.scrollHandler && (this.scrollHandler.destroy(), this.scrollHandler = null), this.picker && this.autoZIndex && Ie.clear(this.picker), this.clearRefs();
  },
  mounted: function() {
    this.updateUI();
  },
  methods: {
    pickColor: function(e) {
      var n = this.colorSelector.getBoundingClientRect(), i = n.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), l = n.left + document.body.scrollLeft, o = Math.floor(100 * Math.max(0, Math.min(150, (e.pageX || e.changedTouches[0].pageX) - l)) / 150), d = Math.floor(100 * (150 - Math.max(0, Math.min(150, (e.pageY || e.changedTouches[0].pageY) - i))) / 150);
      this.hsbValue = this.validateHSB({
        h: this.localHue,
        s: o,
        b: d
      }), this.selfUpdate = !0, this.updateColorHandle(), this.updateInput(), this.updateModel(e);
    },
    pickHue: function(e) {
      var n = this.hueView.getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0);
      this.localHue = Math.floor(360 * (150 - Math.max(0, Math.min(150, (e.pageY || e.changedTouches[0].pageY) - n))) / 150), this.hsbValue = this.validateHSB({
        h: this.localHue,
        s: this.hsbValue.s,
        b: this.hsbValue.b
      }), this.selfUpdate = !0, this.updateColorSelector(), this.updateHue(), this.updateModel(e), this.updateInput();
    },
    updateModel: function(e) {
      var n = this.d_value;
      switch (this.format) {
        case "hex":
          n = this.HSBtoHEX(this.hsbValue);
          break;
        case "rgb":
          n = this.HSBtoRGB(this.hsbValue);
          break;
        case "hsb":
          n = this.hsbValue;
          break;
      }
      this.writeValue(n, e), this.$emit("change", {
        event: e,
        value: n
      });
    },
    updateColorSelector: function() {
      if (this.colorSelector) {
        var e = this.validateHSB({
          h: this.hsbValue.h,
          s: 100,
          b: 100
        });
        this.colorSelector.style.backgroundColor = "#" + this.HSBtoHEX(e);
      }
    },
    updateColorHandle: function() {
      this.colorHandle && (this.colorHandle.style.left = Math.floor(150 * this.hsbValue.s / 100) + "px", this.colorHandle.style.top = Math.floor(150 * (100 - this.hsbValue.b) / 100) + "px");
    },
    updateHue: function() {
      this.hueHandle && (this.hueHandle.style.top = Math.floor(150 - 150 * this.hsbValue.h / 360) + "px");
    },
    updateInput: function() {
      this.$refs.input && (this.$refs.input.style.backgroundColor = "#" + this.HSBtoHEX(this.hsbValue));
    },
    updateUI: function() {
      this.updateHue(), this.updateColorHandle(), this.updateInput(), this.updateColorSelector();
    },
    validateHSB: function(e) {
      return {
        h: Math.min(360, Math.max(0, e.h)),
        s: Math.min(100, Math.max(0, e.s)),
        b: Math.min(100, Math.max(0, e.b))
      };
    },
    validateRGB: function(e) {
      return {
        r: Math.min(255, Math.max(0, e.r)),
        g: Math.min(255, Math.max(0, e.g)),
        b: Math.min(255, Math.max(0, e.b))
      };
    },
    validateHEX: function(e) {
      var n = 6 - e.length;
      if (n > 0) {
        for (var i = [], l = 0; l < n; l++)
          i.push("0");
        i.push(e), e = i.join("");
      }
      return e;
    },
    HEXtoRGB: function(e) {
      var n = parseInt(e.indexOf("#") > -1 ? e.substring(1) : e, 16);
      return {
        r: n >> 16,
        g: (n & 65280) >> 8,
        b: n & 255
      };
    },
    HEXtoHSB: function(e) {
      return this.RGBtoHSB(this.HEXtoRGB(e));
    },
    RGBtoHSB: function(e) {
      var n = {
        h: 0,
        s: 0,
        b: 0
      }, i = Math.min(e.r, e.g, e.b), l = Math.max(e.r, e.g, e.b), o = l - i;
      return n.b = l, n.s = l !== 0 ? 255 * o / l : 0, n.s !== 0 ? e.r === l ? n.h = (e.g - e.b) / o : e.g === l ? n.h = 2 + (e.b - e.r) / o : n.h = 4 + (e.r - e.g) / o : n.h = -1, n.h *= 60, n.h < 0 && (n.h += 360), n.s *= 100 / 255, n.b *= 100 / 255, n;
    },
    HSBtoRGB: function(e) {
      var n = {
        r: null,
        g: null,
        b: null
      }, i = Math.round(e.h), l = Math.round(e.s * 255 / 100), o = Math.round(e.b * 255 / 100);
      if (l === 0)
        n = {
          r: o,
          g: o,
          b: o
        };
      else {
        var d = o, u = (255 - l) * o / 255, h = (d - u) * (i % 60) / 60;
        i === 360 && (i = 0), i < 60 ? (n.r = d, n.b = u, n.g = u + h) : i < 120 ? (n.g = d, n.b = u, n.r = d - h) : i < 180 ? (n.g = d, n.r = u, n.b = u + h) : i < 240 ? (n.b = d, n.r = u, n.g = d - h) : i < 300 ? (n.b = d, n.g = u, n.r = u + h) : i < 360 ? (n.r = d, n.g = u, n.b = d - h) : (n.r = 0, n.g = 0, n.b = 0);
      }
      return {
        r: Math.round(n.r),
        g: Math.round(n.g),
        b: Math.round(n.b)
      };
    },
    RGBtoHEX: function(e) {
      var n = [e.r.toString(16), e.g.toString(16), e.b.toString(16)];
      for (var i in n)
        n[i].length === 1 && (n[i] = "0" + n[i]);
      return n.join("");
    },
    HSBtoHEX: function(e) {
      return this.RGBtoHEX(this.HSBtoRGB(e));
    },
    toHSB: function(e) {
      var n;
      if (e)
        switch (this.format) {
          case "hex":
            n = this.HEXtoHSB(e);
            break;
          case "rgb":
            n = this.RGBtoHSB(e);
            break;
          case "hsb":
            n = e;
            break;
        }
      else
        n = this.HEXtoHSB(this.defaultColor);
      return n.s === 0 || n.b === 0 ? n.h = this.localHue : this.localHue = n.h, n;
    },
    onOverlayEnter: function(e) {
      this.updateUI(), this.alignOverlay(), this.bindOutsideClickListener(), this.bindScrollListener(), this.bindResizeListener(), this.autoZIndex && Ie.set("overlay", e, this.baseZIndex || this.$primevue.config.zIndex.overlay), this.$attrSelector && e.setAttribute(this.$attrSelector, ""), this.$emit("show");
    },
    onOverlayLeave: function() {
      this.unbindOutsideClickListener(), this.unbindScrollListener(), this.unbindResizeListener(), this.clearRefs(), this.$emit("hide");
    },
    onOverlayAfterLeave: function(e) {
      this.autoZIndex && Ie.clear(e);
    },
    alignOverlay: function() {
      this.appendTo === "self" ? Dt(this.picker, this.$refs.input) : Bt(this.picker, this.$refs.input);
    },
    onInputClick: function() {
      this.disabled || (this.overlayVisible = !this.overlayVisible);
    },
    onInputKeydown: function(e) {
      switch (e.code) {
        case "Space":
          this.overlayVisible = !this.overlayVisible, e.preventDefault();
          break;
        case "Escape":
        case "Tab":
          this.overlayVisible = !1;
          break;
      }
    },
    onInputBlur: function(e) {
      var n, i;
      (n = (i = this.formField).onBlur) === null || n === void 0 || n.call(i);
    },
    onColorMousedown: function(e) {
      this.disabled || (this.bindDragListeners(), this.onColorDragStart(e));
    },
    onColorDragStart: function(e) {
      this.disabled || (this.colorDragging = !0, this.pickColor(e), this.$el.setAttribute("p-colorpicker-dragging", "true"), !this.isUnstyled && gt(this.$el, "p-colorpicker-dragging"), e.preventDefault());
    },
    onDrag: function(e) {
      this.colorDragging && (this.pickColor(e), e.preventDefault()), this.hueDragging && (this.pickHue(e), e.preventDefault());
    },
    onDragEnd: function() {
      this.colorDragging = !1, this.hueDragging = !1, this.$el.setAttribute("p-colorpicker-dragging", "false"), !this.isUnstyled && hn(this.$el, "p-colorpicker-dragging"), this.unbindDragListeners();
    },
    onHueMousedown: function(e) {
      this.disabled || (this.bindDragListeners(), this.onHueDragStart(e));
    },
    onHueDragStart: function(e) {
      this.disabled || (this.hueDragging = !0, this.pickHue(e), !this.isUnstyled && gt(this.$el, "p-colorpicker-dragging"), e.preventDefault());
    },
    isInputClicked: function(e) {
      return this.$refs.input && this.$refs.input.isSameNode(e.target);
    },
    bindDragListeners: function() {
      this.bindDocumentMouseMoveListener(), this.bindDocumentMouseUpListener();
    },
    unbindDragListeners: function() {
      this.unbindDocumentMouseMoveListener(), this.unbindDocumentMouseUpListener();
    },
    bindOutsideClickListener: function() {
      var e = this;
      this.outsideClickListener || (this.outsideClickListener = function(n) {
        e.overlayVisible && e.picker && !e.picker.contains(n.target) && !e.isInputClicked(n) && (e.overlayVisible = !1);
      }, document.addEventListener("click", this.outsideClickListener, !0));
    },
    unbindOutsideClickListener: function() {
      this.outsideClickListener && (document.removeEventListener("click", this.outsideClickListener, !0), this.outsideClickListener = null);
    },
    bindScrollListener: function() {
      var e = this;
      this.scrollHandler || (this.scrollHandler = new At(this.$refs.container, function() {
        e.overlayVisible && (e.overlayVisible = !1);
      })), this.scrollHandler.bindScrollListener();
    },
    unbindScrollListener: function() {
      this.scrollHandler && this.scrollHandler.unbindScrollListener();
    },
    bindResizeListener: function() {
      var e = this;
      this.resizeListener || (this.resizeListener = function() {
        e.overlayVisible && !Ht() && (e.overlayVisible = !1);
      }, window.addEventListener("resize", this.resizeListener));
    },
    unbindResizeListener: function() {
      this.resizeListener && (window.removeEventListener("resize", this.resizeListener), this.resizeListener = null);
    },
    bindDocumentMouseMoveListener: function() {
      this.documentMouseMoveListener || (this.documentMouseMoveListener = this.onDrag.bind(this), document.addEventListener("mousemove", this.documentMouseMoveListener));
    },
    unbindDocumentMouseMoveListener: function() {
      this.documentMouseMoveListener && (document.removeEventListener("mousemove", this.documentMouseMoveListener), this.documentMouseMoveListener = null);
    },
    bindDocumentMouseUpListener: function() {
      this.documentMouseUpListener || (this.documentMouseUpListener = this.onDragEnd.bind(this), document.addEventListener("mouseup", this.documentMouseUpListener));
    },
    unbindDocumentMouseUpListener: function() {
      this.documentMouseUpListener && (document.removeEventListener("mouseup", this.documentMouseUpListener), this.documentMouseUpListener = null);
    },
    pickerRef: function(e) {
      this.picker = e;
    },
    colorSelectorRef: function(e) {
      this.colorSelector = e;
    },
    colorHandleRef: function(e) {
      this.colorHandle = e;
    },
    hueViewRef: function(e) {
      this.hueView = e;
    },
    hueHandleRef: function(e) {
      this.hueHandle = e;
    },
    clearRefs: function() {
      this.picker = null, this.colorSelector = null, this.colorHandle = null, this.hueView = null, this.hueHandle = null;
    },
    onOverlayClick: function(e) {
      Ft.emit("overlay-click", {
        originalEvent: e,
        target: this.$el
      });
    }
  },
  components: {
    Portal: Tt
  }
};
function Ve(t) {
  "@babel/helpers - typeof";
  return Ve = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Ve(t);
}
function wt(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(t);
    e && (i = i.filter(function(l) {
      return Object.getOwnPropertyDescriptor(t, l).enumerable;
    })), n.push.apply(n, i);
  }
  return n;
}
function kt(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? wt(Object(n), !0).forEach(function(i) {
      Bn(t, i, n[i]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : wt(Object(n)).forEach(function(i) {
      Object.defineProperty(t, i, Object.getOwnPropertyDescriptor(n, i));
    });
  }
  return t;
}
function Bn(t, e, n) {
  return (e = Pn(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Pn(t) {
  var e = En(t, "string");
  return Ve(e) == "symbol" ? e : e + "";
}
function En(t, e) {
  if (Ve(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(t, e);
    if (Ve(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Rn = ["id", "tabindex", "disabled"];
function Kn(t, e, n, i, l, o) {
  var d = oe("Portal");
  return c(), v("div", w({
    ref: "container",
    class: t.cx("root")
  }, t.ptmi("root")), [t.inline ? F("", !0) : (c(), v("input", w({
    key: 0,
    ref: "input",
    id: t.inputId,
    type: "text",
    class: t.cx("preview"),
    readonly: "",
    tabindex: t.tabindex,
    disabled: t.disabled,
    onClick: e[0] || (e[0] = function() {
      return o.onInputClick && o.onInputClick.apply(o, arguments);
    }),
    onKeydown: e[1] || (e[1] = function() {
      return o.onInputKeydown && o.onInputKeydown.apply(o, arguments);
    }),
    onBlur: e[2] || (e[2] = function() {
      return o.onInputBlur && o.onInputBlur.apply(o, arguments);
    })
  }, t.ptm("preview")), null, 16, Rn)), S(d, {
    appendTo: t.appendTo,
    disabled: t.inline
  }, {
    default: he(function() {
      return [S(Kt, w({
        name: "p-anchored-overlay",
        onEnter: o.onOverlayEnter,
        onLeave: o.onOverlayLeave,
        onAfterLeave: o.onOverlayAfterLeave
      }, t.ptm("transition")), {
        default: he(function() {
          return [t.inline || l.overlayVisible ? (c(), v("div", w({
            key: 0,
            ref: o.pickerRef,
            class: [t.cx("panel"), t.panelClass, t.overlayClass],
            onClick: e[11] || (e[11] = function() {
              return o.onOverlayClick && o.onOverlayClick.apply(o, arguments);
            })
          }, kt(kt({}, t.ptm("panel")), t.ptm("overlay"))), [r("div", w({
            class: t.cx("content")
          }, t.ptm("content")), [r("div", w({
            ref: o.colorSelectorRef,
            class: t.cx("colorSelector"),
            onMousedown: e[3] || (e[3] = function(u) {
              return o.onColorMousedown(u);
            }),
            onTouchstart: e[4] || (e[4] = function(u) {
              return o.onColorDragStart(u);
            }),
            onTouchmove: e[5] || (e[5] = function(u) {
              return o.onDrag(u);
            }),
            onTouchend: e[6] || (e[6] = function(u) {
              return o.onDragEnd();
            })
          }, t.ptm("colorSelector")), [r("div", w({
            class: t.cx("colorBackground")
          }, t.ptm("colorBackground")), [r("div", w({
            ref: o.colorHandleRef,
            class: t.cx("colorHandle")
          }, t.ptm("colorHandle")), null, 16)], 16)], 16), r("div", w({
            ref: o.hueViewRef,
            class: t.cx("hue"),
            onMousedown: e[7] || (e[7] = function(u) {
              return o.onHueMousedown(u);
            }),
            onTouchstart: e[8] || (e[8] = function(u) {
              return o.onHueDragStart(u);
            }),
            onTouchmove: e[9] || (e[9] = function(u) {
              return o.onDrag(u);
            }),
            onTouchend: e[10] || (e[10] = function(u) {
              return o.onDragEnd();
            })
          }, t.ptm("hue")), [r("div", w({
            ref: o.hueHandleRef,
            class: t.cx("hueHandle")
          }, t.ptm("hueHandle")), null, 16)], 16)], 16)], 16)) : F("", !0)];
        }),
        _: 1
      }, 16, ["onEnter", "onLeave", "onAfterLeave"])];
    }),
    _: 1
  }, 8, ["appendTo", "disabled"])], 16);
}
jt.render = Kn;
const It = "#d63a22", lt = "--p-primary";
function jn(t) {
  const e = /^rgba?\(([^)]+)\)/i.exec((t || "").trim());
  if (!e) return null;
  const n = e[1].split(",").map((l) => parseFloat(l.trim()));
  if (n.length < 3 || n.slice(0, 3).some((l) => Number.isNaN(l))) return null;
  const i = (l) => Math.max(0, Math.min(255, Math.round(l))).toString(16).padStart(2, "0");
  return `#${i(n[0])}${i(n[1])}${i(n[2])}`;
}
function rt(t) {
  let e = (t || "").trim().replace(/^#/, "");
  return e.length === 3 && (e = e[0] + e[0] + e[1] + e[1] + e[2] + e[2]), /^[0-9a-fA-F]{6}$/.test(e) ? `#${e.toLowerCase()}` : null;
}
function St(t) {
  const e = rt(t);
  if (!e) return null;
  const n = e.slice(1);
  return {
    r: parseInt(n.slice(0, 2), 16),
    g: parseInt(n.slice(2, 4), 16),
    b: parseInt(n.slice(4, 6), 16)
  };
}
function qe(t, e) {
  const n = rt(t);
  if (!n) return "";
  const i = `${lt}: ${n};`;
  return e === ":host" ? `:host { ${i} }` : [
    `:root { ${i} }`,
    `@media (prefers-color-scheme: dark) { :root:not(.w-theme-light) { ${i} } }`,
    `:root.w-theme-dark, .w-theme-dark { ${i} }`,
    `@media (prefers-color-scheme: light) { :root:not(.w-theme-dark) { ${i} } }`,
    `:root.w-theme-light, .w-theme-light { ${i} }`
  ].join(`
`);
}
function _n(t, e) {
  if (!t || typeof t != "object") return "";
  const n = t[lt];
  return typeof n == "string" ? qe(n, e) : "";
}
const Un = { r: 255, g: 255, b: 255 }, Nn = { r: 12, g: 14, b: 18 }, Gn = 2, Wn = 2;
function Ct(t) {
  const e = (n) => {
    const i = n / 255;
    return i <= 0.03928 ? i / 12.92 : Math.pow((i + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * e(t.r) + 0.7152 * e(t.g) + 0.0722 * e(t.b);
}
function Ot(t, e) {
  const n = Ct(t), i = Ct(e);
  return (Math.max(n, i) + 0.05) / (Math.min(n, i) + 0.05);
}
function Xn(t, e = typeof document < "u" ? document : void 0) {
  const n = rt(t);
  if (!n) return null;
  if (!e || !e.body || !e.defaultView) return St(n);
  const i = e.createElement("span");
  i.style.setProperty(lt, n), i.style.color = "var(--p-primary-color)", i.style.display = "none", e.body.appendChild(i);
  const l = e.defaultView.getComputedStyle(i).color;
  return i.remove(), St(jn(l) || n);
}
function qn(t) {
  const e = Xn(t);
  if (!e) return null;
  const n = Ot(e, Un), i = Ot(e, Nn), l = n >= Gn, o = i >= Wn;
  let d = "";
  return !l && !o ? d = "This tone is too low-contrast - buttons and accents would be unreadable in both light and dark mode." : l ? o || (d = "This tone is too dark - accents would be invisible against the dark background.") : d = "This tone is too light - white button text and accents would be unreadable in light mode.", { ok: l && o, onLight: n, onDark: i, reason: d };
}
function Zn({ items: t, categories: e, overrides: n, home: i }) {
  const l = (f) => f.route_name || f.id;
  function o(f, p) {
    const O = l(f), N = { ...n.value[O] || {} };
    for (const [Q, ie] of Object.entries(p))
      ie === void 0 || ie === "" ? delete N[Q] : N[Q] = ie;
    n.value = { ...n.value, [O]: N };
  }
  function d(f, p) {
    o(f, { hidden: p || void 0 }), f.hidden = p;
  }
  function u(f, p) {
    o(f, { category: p }), f.category = p;
  }
  function h(f, p) {
    o(f, { order: p }), f.order = p;
  }
  function k(f, p) {
    const O = p.replace(/^\s+/, "");
    f.label = O, o(f, { label: O || void 0 });
  }
  function b(f, p) {
    const O = (p || "").trim();
    f.icon = O, o(f, { icon: O || void 0 });
  }
  function $(f) {
    const p = n.value[l(f)];
    return !!p && (p.label !== void 0 || p.icon !== void 0);
  }
  const I = ee(() => [...e.value].sort((f, p) => f.order - p.order));
  function m(f) {
    return t.value.filter((p) => !p.hidden && (p.category || "") === f).sort((p, O) => p.order - O.order || p.label.localeCompare(O.label));
  }
  const g = ee(() => {
    const f = [];
    f.push({ key: "", label: "Ungrouped", real: !1 });
    for (const O of I.value) f.push({ key: O.key, label: O.label || O.key, real: !0 });
    const p = /* @__PURE__ */ new Set(["", ...e.value.map((O) => O.key)]);
    for (const O of t.value)
      O.category && !p.has(O.category) && (p.add(O.category), f.push({ key: O.category, label: O.category, real: !1 }));
    return f;
  }), P = ee(() => t.value.filter((f) => f.hidden)), M = (f) => e.value.find((p) => p.key === f), x = R(null), j = R(null), _ = R(null), C = (f) => t.value.find((p) => p.id === f);
  function Z(f, p) {
    x.value = f.id, p.dataTransfer && (p.dataTransfer.effectAllowed = "move", p.dataTransfer.setData("text/plain", f.id));
  }
  function D() {
    x.value = null, j.value = null, _.value = null;
  }
  function T(f) {
    const p = x.value ? C(x.value) : null;
    if (!p || p.id === f.id) return D();
    const O = f.category || "", N = m(O).filter((ie) => ie.id !== p.id), Q = N.indexOf(f);
    N.splice(Q < 0 ? N.length : Q, 0, p), u(p, O), N.forEach((ie, de) => h(ie, de * 10)), D();
  }
  function H(f) {
    const p = x.value ? C(x.value) : null;
    if (!p) return D();
    const O = m(f).filter((N) => N.id !== p.id);
    O.push(p), u(p, f), O.forEach((N, Q) => h(N, Q * 10)), D();
  }
  function U(f, p) {
    j.value = f, p.dataTransfer && (p.dataTransfer.effectAllowed = "move", p.dataTransfer.setData("text/plain", "cat:" + f));
  }
  function G(f) {
    const p = j.value;
    if (!p || p === f) return D();
    const O = [...I.value], N = O.findIndex((de) => de.key === p), Q = O.findIndex((de) => de.key === f);
    if (N < 0 || Q < 0) return D();
    const [ie] = O.splice(N, 1);
    O.splice(Q, 0, ie), O.forEach((de, je) => {
      const be = e.value.find((_e) => _e.key === de.key);
      be && (be.order = je * 10);
    }), D();
  }
  let B = 0;
  function W() {
    B += 1;
    const f = I.value[I.value.length - 1];
    e.value.push({ key: "cat_" + Date.now().toString(36) + "_" + B, label: "New category", icon: "tabler:folder", order: (f?.order ?? 0) + 10 });
  }
  function ne(f) {
    for (const p of t.value) p.category === f && u(p, "");
    e.value = e.value.filter((p) => p.key !== f);
  }
  function Y(f, p) {
    const O = M(f);
    O && (O.label = p);
  }
  function X(f, p) {
    const O = M(f);
    O && (O.icon = (p || "").trim() || void 0);
  }
  function q(f) {
    return !!i.value && i.value === f.path;
  }
  function le(f) {
    i.value = q(f) ? "" : f.path;
  }
  return {
    itemKey: l,
    patchOverride: o,
    setHidden: d,
    setCategory: u,
    setOrder: h,
    setLabel: k,
    setIcon: b,
    hasOverride: $,
    orderedCats: I,
    itemsOf: m,
    editorGroups: g,
    hiddenItems: P,
    catByKey: M,
    dragItemId: x,
    dragCatKey: j,
    overGroup: _,
    onItemDragStart: Z,
    endDrag: D,
    onItemDrop: T,
    onGroupDrop: H,
    onCatDragStart: U,
    onCatDrop: G,
    addCategory: W,
    removeCategory: ne,
    renameCategory: Y,
    setCatIcon: X,
    isHome: q,
    setHome: le
  };
}
function Yn({ logoUrl: t, error: e, apiError: n }) {
  const i = R(!1);
  async function l(d) {
    const u = d.target, h = u.files && u.files[0];
    if (h) {
      if (!h.type.startsWith("image/")) {
        e.value = "Logo must be an image", u.value = "";
        return;
      }
      if (h.size > 2 * 1024 * 1024) {
        e.value = "Logo too large (max 2 MB)", u.value = "";
        return;
      }
      i.value = !0, e.value = "";
      try {
        const k = new FormData();
        k.append("logo", h);
        const { data: b } = await Xe.post("/api/v1/nav/logo", k, { headers: { "Content-Type": "multipart/form-data" } });
        if (!b.success || !b.url) throw new Error(b.error || "upload failed");
        t.value = b.url;
      } catch (k) {
        e.value = n(k, "upload failed");
      } finally {
        i.value = !1, u.value = "";
      }
    }
  }
  function o() {
    t.value = "";
  }
  return { uploadingLogo: i, uploadLogo: l, removeLogo: o };
}
var _t = {
  name: "BlankIcon",
  extends: Se
};
function Jn(t) {
  return ni(t) || ti(t) || ei(t) || Qn();
}
function Qn() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ei(t, e) {
  if (t) {
    if (typeof t == "string") return Ze(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ze(t, e) : void 0;
  }
}
function ti(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function ni(t) {
  if (Array.isArray(t)) return Ze(t);
}
function Ze(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, i = Array(e); n < e; n++) i[n] = t[n];
  return i;
}
function ii(t, e, n, i, l, o) {
  return c(), v("svg", w({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Jn(e[0] || (e[0] = [r("rect", {
    width: "1",
    height: "1",
    fill: "currentColor",
    "fill-opacity": "0"
  }, null, -1)])), 16);
}
_t.render = ii;
var Ut = {
  name: "CheckIcon",
  extends: Se
};
function oi(t) {
  return si(t) || ai(t) || ri(t) || li();
}
function li() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ri(t, e) {
  if (t) {
    if (typeof t == "string") return Ye(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ye(t, e) : void 0;
  }
}
function ai(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function si(t) {
  if (Array.isArray(t)) return Ye(t);
}
function Ye(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, i = Array(e); n < e; n++) i[n] = t[n];
  return i;
}
function di(t, e, n, i, l, o) {
  return c(), v("svg", w({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), oi(e[0] || (e[0] = [r("path", {
    d: "M4.86199 11.5948C4.78717 11.5923 4.71366 11.5745 4.64596 11.5426C4.57826 11.5107 4.51779 11.4652 4.46827 11.4091L0.753985 7.69483C0.683167 7.64891 0.623706 7.58751 0.580092 7.51525C0.536478 7.44299 0.509851 7.36177 0.502221 7.27771C0.49459 7.19366 0.506156 7.10897 0.536046 7.03004C0.565935 6.95111 0.613367 6.88 0.674759 6.82208C0.736151 6.76416 0.8099 6.72095 0.890436 6.69571C0.970973 6.67046 1.05619 6.66385 1.13966 6.67635C1.22313 6.68886 1.30266 6.72017 1.37226 6.76792C1.44186 6.81567 1.4997 6.8786 1.54141 6.95197L4.86199 10.2503L12.6397 2.49483C12.7444 2.42694 12.8689 2.39617 12.9932 2.40745C13.1174 2.41873 13.2343 2.47141 13.3251 2.55705C13.4159 2.64268 13.4753 2.75632 13.4938 2.87973C13.5123 3.00315 13.4888 3.1292 13.4271 3.23768L5.2557 11.4091C5.20618 11.4652 5.14571 11.5107 5.07801 11.5426C5.01031 11.5745 4.9368 11.5923 4.86199 11.5948Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Ut.render = di;
var Nt = {
  name: "ChevronDownIcon",
  extends: Se
};
function ui(t) {
  return fi(t) || hi(t) || pi(t) || ci();
}
function ci() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function pi(t, e) {
  if (t) {
    if (typeof t == "string") return Je(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Je(t, e) : void 0;
  }
}
function hi(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function fi(t) {
  if (Array.isArray(t)) return Je(t);
}
function Je(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, i = Array(e); n < e; n++) i[n] = t[n];
  return i;
}
function gi(t, e, n, i, l, o) {
  return c(), v("svg", w({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), ui(e[0] || (e[0] = [r("path", {
    d: "M7.01744 10.398C6.91269 10.3985 6.8089 10.378 6.71215 10.3379C6.61541 10.2977 6.52766 10.2386 6.45405 10.1641L1.13907 4.84913C1.03306 4.69404 0.985221 4.5065 1.00399 4.31958C1.02276 4.13266 1.10693 3.95838 1.24166 3.82747C1.37639 3.69655 1.55301 3.61742 1.74039 3.60402C1.92777 3.59062 2.11386 3.64382 2.26584 3.75424L7.01744 8.47394L11.769 3.75424C11.9189 3.65709 12.097 3.61306 12.2748 3.62921C12.4527 3.64535 12.6199 3.72073 12.7498 3.84328C12.8797 3.96582 12.9647 4.12842 12.9912 4.30502C13.0177 4.48162 12.9841 4.662 12.8958 4.81724L7.58083 10.1322C7.50996 10.2125 7.42344 10.2775 7.32656 10.3232C7.22968 10.3689 7.12449 10.3944 7.01744 10.398Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Nt.render = gi;
var Gt = {
  name: "SearchIcon",
  extends: Se
};
function vi(t) {
  return wi(t) || yi(t) || bi(t) || mi();
}
function mi() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function bi(t, e) {
  if (t) {
    if (typeof t == "string") return Qe(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Qe(t, e) : void 0;
  }
}
function yi(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function wi(t) {
  if (Array.isArray(t)) return Qe(t);
}
function Qe(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, i = Array(e); n < e; n++) i[n] = t[n];
  return i;
}
function ki(t, e, n, i, l, o) {
  return c(), v("svg", w({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), vi(e[0] || (e[0] = [r("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M2.67602 11.0265C3.6661 11.688 4.83011 12.0411 6.02086 12.0411C6.81149 12.0411 7.59438 11.8854 8.32483 11.5828C8.87005 11.357 9.37808 11.0526 9.83317 10.6803L12.9769 13.8241C13.0323 13.8801 13.0983 13.9245 13.171 13.9548C13.2438 13.985 13.3219 14.0003 13.4007 14C13.4795 14.0003 13.5575 13.985 13.6303 13.9548C13.7031 13.9245 13.7691 13.8801 13.8244 13.8241C13.9367 13.7116 13.9998 13.5592 13.9998 13.4003C13.9998 13.2414 13.9367 13.089 13.8244 12.9765L10.6807 9.8328C11.053 9.37773 11.3573 8.86972 11.5831 8.32452C11.8857 7.59408 12.0414 6.81119 12.0414 6.02056C12.0414 4.8298 11.6883 3.66579 11.0268 2.67572C10.3652 1.68564 9.42494 0.913972 8.32483 0.45829C7.22472 0.00260857 6.01418 -0.116618 4.84631 0.115686C3.67844 0.34799 2.60568 0.921393 1.76369 1.76338C0.921698 2.60537 0.348296 3.67813 0.115991 4.84601C-0.116313 6.01388 0.00291375 7.22441 0.458595 8.32452C0.914277 9.42464 1.68595 10.3649 2.67602 11.0265ZM3.35565 2.0158C4.14456 1.48867 5.07206 1.20731 6.02086 1.20731C7.29317 1.20731 8.51338 1.71274 9.41304 2.6124C10.3127 3.51206 10.8181 4.73226 10.8181 6.00457C10.8181 6.95337 10.5368 7.88088 10.0096 8.66978C9.48251 9.45868 8.73328 10.0736 7.85669 10.4367C6.98011 10.7997 6.01554 10.8947 5.08496 10.7096C4.15439 10.5245 3.2996 10.0676 2.62869 9.39674C1.95778 8.72583 1.50089 7.87104 1.31579 6.94046C1.13068 6.00989 1.22568 5.04532 1.58878 4.16874C1.95187 3.29215 2.56675 2.54292 3.35565 2.0158Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Gt.render = ki;
var at = {
  name: "SpinnerIcon",
  extends: Se
};
function Ii(t) {
  return Li(t) || Oi(t) || Ci(t) || Si();
}
function Si() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ci(t, e) {
  if (t) {
    if (typeof t == "string") return et(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? et(t, e) : void 0;
  }
}
function Oi(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Li(t) {
  if (Array.isArray(t)) return et(t);
}
function et(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, i = Array(e); n < e; n++) i[n] = t[n];
  return i;
}
function xi(t, e, n, i, l, o) {
  return c(), v("svg", w({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Ii(e[0] || (e[0] = [r("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
at.render = xi;
var Wt = {
  name: "TimesIcon",
  extends: Se
};
function $i(t) {
  return Ti(t) || Mi(t) || zi(t) || Vi();
}
function Vi() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function zi(t, e) {
  if (t) {
    if (typeof t == "string") return tt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? tt(t, e) : void 0;
  }
}
function Mi(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Ti(t) {
  if (Array.isArray(t)) return tt(t);
}
function tt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, i = Array(e); n < e; n++) i[n] = t[n];
  return i;
}
function Fi(t, e, n, i, l, o) {
  return c(), v("svg", w({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), $i(e[0] || (e[0] = [r("path", {
    d: "M8.01186 7.00933L12.27 2.75116C12.341 2.68501 12.398 2.60524 12.4375 2.51661C12.4769 2.42798 12.4982 2.3323 12.4999 2.23529C12.5016 2.13827 12.4838 2.0419 12.4474 1.95194C12.4111 1.86197 12.357 1.78024 12.2884 1.71163C12.2198 1.64302 12.138 1.58893 12.0481 1.55259C11.9581 1.51625 11.8617 1.4984 11.7647 1.50011C11.6677 1.50182 11.572 1.52306 11.4834 1.56255C11.3948 1.60204 11.315 1.65898 11.2488 1.72997L6.99067 5.98814L2.7325 1.72997C2.59553 1.60234 2.41437 1.53286 2.22718 1.53616C2.03999 1.53946 1.8614 1.61529 1.72901 1.74767C1.59663 1.88006 1.5208 2.05865 1.5175 2.24584C1.5142 2.43303 1.58368 2.61419 1.71131 2.75116L5.96948 7.00933L1.71131 11.2675C1.576 11.403 1.5 11.5866 1.5 11.7781C1.5 11.9696 1.576 12.1532 1.71131 12.2887C1.84679 12.424 2.03043 12.5 2.2219 12.5C2.41338 12.5 2.59702 12.424 2.7325 12.2887L6.99067 8.03052L11.2488 12.2887C11.3843 12.424 11.568 12.5 11.7594 12.5C11.9509 12.5 12.1346 12.424 12.27 12.2887C12.4053 12.1532 12.4813 11.9696 12.4813 11.7781C12.4813 11.5866 12.4053 11.403 12.27 11.2675L8.01186 7.00933Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Wt.render = Fi;
var Hi = `
    .p-iconfield {
        position: relative;
        display: block;
    }

    .p-inputicon {
        position: absolute;
        top: 50%;
        margin-top: calc(-1 * (dt('icon.size') / 2));
        color: dt('iconfield.icon.color');
        line-height: 1;
        z-index: 1;
    }

    .p-iconfield .p-inputicon:first-child {
        inset-inline-start: dt('form.field.padding.x');
    }

    .p-iconfield .p-inputicon:last-child {
        inset-inline-end: dt('form.field.padding.x');
    }

    .p-iconfield .p-inputtext:not(:first-child),
    .p-iconfield .p-inputwrapper:not(:first-child) .p-inputtext {
        padding-inline-start: calc((dt('form.field.padding.x') * 2) + dt('icon.size'));
    }

    .p-iconfield .p-inputtext:not(:last-child) {
        padding-inline-end: calc((dt('form.field.padding.x') * 2) + dt('icon.size'));
    }

    .p-iconfield:has(.p-inputfield-sm) .p-inputicon {
        font-size: dt('form.field.sm.font.size');
        width: dt('form.field.sm.font.size');
        height: dt('form.field.sm.font.size');
        margin-top: calc(-1 * (dt('form.field.sm.font.size') / 2));
    }

    .p-iconfield:has(.p-inputfield-lg) .p-inputicon {
        font-size: dt('form.field.lg.font.size');
        width: dt('form.field.lg.font.size');
        height: dt('form.field.lg.font.size');
        margin-top: calc(-1 * (dt('form.field.lg.font.size') / 2));
    }
`, Ai = {
  root: "p-iconfield"
}, Di = ge.extend({
  name: "iconfield",
  style: Hi,
  classes: Ai
}), Bi = {
  name: "BaseIconField",
  extends: Ke,
  style: Di,
  provide: function() {
    return {
      $pcIconField: this,
      $parentInstance: this
    };
  }
}, Xt = {
  name: "IconField",
  extends: Bi,
  inheritAttrs: !1
};
function Pi(t, e, n, i, l, o) {
  return c(), v("div", w({
    class: t.cx("root")
  }, t.ptmi("root")), [K(t.$slots, "default")], 16);
}
Xt.render = Pi;
var Ei = {
  root: "p-inputicon"
}, Ri = ge.extend({
  name: "inputicon",
  classes: Ei
}), Ki = {
  name: "BaseInputIcon",
  extends: Ke,
  style: Ri,
  props: {
    class: null
  },
  provide: function() {
    return {
      $pcInputIcon: this,
      $parentInstance: this
    };
  }
}, qt = {
  name: "InputIcon",
  extends: Ki,
  inheritAttrs: !1,
  computed: {
    containerClass: function() {
      return [this.cx("root"), this.class];
    }
  }
};
function ji(t, e, n, i, l, o) {
  return c(), v("span", w({
    class: o.containerClass
  }, t.ptmi("root"), {
    "aria-hidden": "true"
  }), [K(t.$slots, "default")], 16);
}
qt.render = ji;
var st = {
  name: "BaseInput",
  extends: ot,
  props: {
    size: {
      type: String,
      default: null
    },
    fluid: {
      type: Boolean,
      default: null
    },
    variant: {
      type: String,
      default: null
    }
  },
  inject: {
    $parentInstance: {
      default: void 0
    },
    $pcFluid: {
      default: void 0
    }
  },
  computed: {
    $variant: function() {
      var e;
      return (e = this.variant) !== null && e !== void 0 ? e : this.$primevue.config.inputStyle || this.$primevue.config.inputVariant;
    },
    $fluid: function() {
      var e;
      return (e = this.fluid) !== null && e !== void 0 ? e : !!this.$pcFluid;
    },
    // @deprecated use $fluid instead
    hasFluid: function() {
      return this.$fluid;
    }
  }
}, _i = `
    .p-inputtext {
        font-family: inherit;
        font-feature-settings: inherit;
        font-size: 1rem;
        color: dt('inputtext.color');
        background: dt('inputtext.background');
        padding-block: dt('inputtext.padding.y');
        padding-inline: dt('inputtext.padding.x');
        border: 1px solid dt('inputtext.border.color');
        transition:
            background dt('inputtext.transition.duration'),
            color dt('inputtext.transition.duration'),
            border-color dt('inputtext.transition.duration'),
            outline-color dt('inputtext.transition.duration'),
            box-shadow dt('inputtext.transition.duration');
        appearance: none;
        border-radius: dt('inputtext.border.radius');
        outline-color: transparent;
        box-shadow: dt('inputtext.shadow');
    }

    .p-inputtext:enabled:hover {
        border-color: dt('inputtext.hover.border.color');
    }

    .p-inputtext:enabled:focus {
        border-color: dt('inputtext.focus.border.color');
        box-shadow: dt('inputtext.focus.ring.shadow');
        outline: dt('inputtext.focus.ring.width') dt('inputtext.focus.ring.style') dt('inputtext.focus.ring.color');
        outline-offset: dt('inputtext.focus.ring.offset');
    }

    .p-inputtext.p-invalid {
        border-color: dt('inputtext.invalid.border.color');
    }

    .p-inputtext.p-variant-filled {
        background: dt('inputtext.filled.background');
    }

    .p-inputtext.p-variant-filled:enabled:hover {
        background: dt('inputtext.filled.hover.background');
    }

    .p-inputtext.p-variant-filled:enabled:focus {
        background: dt('inputtext.filled.focus.background');
    }

    .p-inputtext:disabled {
        opacity: 1;
        background: dt('inputtext.disabled.background');
        color: dt('inputtext.disabled.color');
    }

    .p-inputtext::placeholder {
        color: dt('inputtext.placeholder.color');
    }

    .p-inputtext.p-invalid::placeholder {
        color: dt('inputtext.invalid.placeholder.color');
    }

    .p-inputtext-sm {
        font-size: dt('inputtext.sm.font.size');
        padding-block: dt('inputtext.sm.padding.y');
        padding-inline: dt('inputtext.sm.padding.x');
    }

    .p-inputtext-lg {
        font-size: dt('inputtext.lg.font.size');
        padding-block: dt('inputtext.lg.padding.y');
        padding-inline: dt('inputtext.lg.padding.x');
    }

    .p-inputtext-fluid {
        width: 100%;
    }
`, Ui = {
  root: function(e) {
    var n = e.instance, i = e.props;
    return ["p-inputtext p-component", {
      "p-filled": n.$filled,
      "p-inputtext-sm p-inputfield-sm": i.size === "small",
      "p-inputtext-lg p-inputfield-lg": i.size === "large",
      "p-invalid": n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-inputtext-fluid": n.$fluid
    }];
  }
}, Ni = ge.extend({
  name: "inputtext",
  style: _i,
  classes: Ui
}), Gi = {
  name: "BaseInputText",
  extends: st,
  style: Ni,
  provide: function() {
    return {
      $pcInputText: this,
      $parentInstance: this
    };
  }
};
function ze(t) {
  "@babel/helpers - typeof";
  return ze = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, ze(t);
}
function Wi(t, e, n) {
  return (e = Xi(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Xi(t) {
  var e = qi(t, "string");
  return ze(e) == "symbol" ? e : e + "";
}
function qi(t, e) {
  if (ze(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(t, e);
    if (ze(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Zt = {
  name: "InputText",
  extends: Gi,
  inheritAttrs: !1,
  methods: {
    onInput: function(e) {
      this.writeValue(e.target.value, e);
    }
  },
  computed: {
    attrs: function() {
      return w(this.ptmi("root", {
        context: {
          filled: this.$filled,
          disabled: this.disabled
        }
      }), this.formField);
    },
    dataP: function() {
      return me(Wi({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, Zi = ["value", "name", "disabled", "aria-invalid", "data-p"];
function Yi(t, e, n, i, l, o) {
  return c(), v("input", w({
    type: "text",
    class: t.cx("root"),
    value: t.d_value,
    name: t.name,
    disabled: t.disabled,
    "aria-invalid": t.$invalid || void 0,
    "data-p": o.dataP,
    onInput: e[0] || (e[0] = function() {
      return o.onInput && o.onInput.apply(o, arguments);
    })
  }, o.attrs), null, 16, Zi);
}
Zt.render = Yi;
var Ji = `
    .p-virtualscroller-loader {
        background: dt('virtualscroller.loader.mask.background');
        color: dt('virtualscroller.loader.mask.color');
    }

    .p-virtualscroller-loading-icon {
        font-size: dt('virtualscroller.loader.icon.size');
        width: dt('virtualscroller.loader.icon.size');
        height: dt('virtualscroller.loader.icon.size');
    }
`, Qi = `
.p-virtualscroller {
    position: relative;
    overflow: auto;
    contain: strict;
    transform: translateZ(0);
    will-change: scroll-position;
    outline: 0 none;
}

.p-virtualscroller-content {
    position: absolute;
    top: 0;
    left: 0;
    min-height: 100%;
    min-width: 100%;
    will-change: transform;
}

.p-virtualscroller-spacer {
    position: absolute;
    top: 0;
    left: 0;
    height: 1px;
    width: 1px;
    transform-origin: 0 0;
    pointer-events: none;
}

.p-virtualscroller-loader {
    position: sticky;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.p-virtualscroller-loader-mask {
    display: flex;
    align-items: center;
    justify-content: center;
}

.p-virtualscroller-horizontal > .p-virtualscroller-content {
    display: flex;
}

.p-virtualscroller-inline .p-virtualscroller-content {
    position: static;
}

.p-virtualscroller .p-virtualscroller-loading {
    transform: none !important;
    min-height: 0;
    position: sticky;
    inset-block-start: 0;
    inset-inline-start: 0;
}
`, Lt = ge.extend({
  name: "virtualscroller",
  css: Qi,
  style: Ji
}), eo = {
  name: "BaseVirtualScroller",
  extends: Ke,
  props: {
    id: {
      type: String,
      default: null
    },
    style: null,
    class: null,
    items: {
      type: Array,
      default: null
    },
    itemSize: {
      type: [Number, Array],
      default: 0
    },
    scrollHeight: null,
    scrollWidth: null,
    orientation: {
      type: String,
      default: "vertical"
    },
    numToleratedItems: {
      type: Number,
      default: null
    },
    delay: {
      type: Number,
      default: 0
    },
    resizeDelay: {
      type: Number,
      default: 10
    },
    lazy: {
      type: Boolean,
      default: !1
    },
    disabled: {
      type: Boolean,
      default: !1
    },
    loaderDisabled: {
      type: Boolean,
      default: !1
    },
    columns: {
      type: Array,
      default: null
    },
    loading: {
      type: Boolean,
      default: !1
    },
    showSpacer: {
      type: Boolean,
      default: !0
    },
    showLoader: {
      type: Boolean,
      default: !1
    },
    tabindex: {
      type: Number,
      default: 0
    },
    inline: {
      type: Boolean,
      default: !1
    },
    step: {
      type: Number,
      default: 0
    },
    appendOnly: {
      type: Boolean,
      default: !1
    },
    autoSize: {
      type: Boolean,
      default: !1
    }
  },
  style: Lt,
  provide: function() {
    return {
      $pcVirtualScroller: this,
      $parentInstance: this
    };
  },
  beforeMount: function() {
    var e;
    Lt.loadCSS({
      nonce: (e = this.$primevueConfig) === null || e === void 0 || (e = e.csp) === null || e === void 0 ? void 0 : e.nonce
    });
  }
};
function Me(t) {
  "@babel/helpers - typeof";
  return Me = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Me(t);
}
function xt(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(t);
    e && (i = i.filter(function(l) {
      return Object.getOwnPropertyDescriptor(t, l).enumerable;
    })), n.push.apply(n, i);
  }
  return n;
}
function xe(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? xt(Object(n), !0).forEach(function(i) {
      Yt(t, i, n[i]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : xt(Object(n)).forEach(function(i) {
      Object.defineProperty(t, i, Object.getOwnPropertyDescriptor(n, i));
    });
  }
  return t;
}
function Yt(t, e, n) {
  return (e = to(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function to(t) {
  var e = no(t, "string");
  return Me(e) == "symbol" ? e : e + "";
}
function no(t, e) {
  if (Me(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(t, e);
    if (Me(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Jt = {
  name: "VirtualScroller",
  extends: eo,
  inheritAttrs: !1,
  emits: ["update:numToleratedItems", "scroll", "scroll-index-change", "lazy-load"],
  data: function() {
    var e = this.isBoth();
    return {
      first: e ? {
        rows: 0,
        cols: 0
      } : 0,
      last: e ? {
        rows: 0,
        cols: 0
      } : 0,
      page: e ? {
        rows: 0,
        cols: 0
      } : 0,
      numItemsInViewport: e ? {
        rows: 0,
        cols: 0
      } : 0,
      lastScrollPos: e ? {
        top: 0,
        left: 0
      } : 0,
      d_numToleratedItems: this.numToleratedItems,
      d_loading: this.loading,
      loaderArr: [],
      spacerStyle: {},
      contentStyle: {}
    };
  },
  element: null,
  content: null,
  lastScrollPos: null,
  scrollTimeout: null,
  resizeTimeout: null,
  defaultWidth: 0,
  defaultHeight: 0,
  defaultContentWidth: 0,
  defaultContentHeight: 0,
  isRangeChanged: !1,
  lazyLoadState: {},
  resizeListener: null,
  resizeObserver: null,
  initialized: !1,
  watch: {
    numToleratedItems: function(e) {
      this.d_numToleratedItems = e;
    },
    loading: function(e, n) {
      this.lazy && e !== n && e !== this.d_loading && (this.d_loading = e);
    },
    items: {
      handler: function(e, n) {
        (!n || n.length !== (e || []).length) && (this.init(), this.calculateAutoSize());
      },
      deep: !0
    },
    itemSize: function() {
      this.init(), this.calculateAutoSize();
    },
    orientation: function() {
      this.lastScrollPos = this.isBoth() ? {
        top: 0,
        left: 0
      } : 0;
    },
    scrollHeight: function() {
      this.init(), this.calculateAutoSize();
    },
    scrollWidth: function() {
      this.init(), this.calculateAutoSize();
    }
  },
  mounted: function() {
    this.viewInit(), this.lastScrollPos = this.isBoth() ? {
      top: 0,
      left: 0
    } : 0, this.lazyLoadState = this.lazyLoadState || {};
  },
  updated: function() {
    !this.initialized && this.viewInit();
  },
  unmounted: function() {
    this.unbindResizeListener(), this.initialized = !1;
  },
  methods: {
    viewInit: function() {
      Ee(this.element) && (this.setContentEl(this.content), this.init(), this.calculateAutoSize(), this.defaultWidth = Oe(this.element), this.defaultHeight = Le(this.element), this.defaultContentWidth = Oe(this.content), this.defaultContentHeight = Le(this.content), this.initialized = !0), this.element && this.bindResizeListener();
    },
    init: function() {
      this.disabled || (this.setSize(), this.calculateOptions(), this.setSpacerSize());
    },
    isVertical: function() {
      return this.orientation === "vertical";
    },
    isHorizontal: function() {
      return this.orientation === "horizontal";
    },
    isBoth: function() {
      return this.orientation === "both";
    },
    scrollTo: function(e) {
      this.element && this.element.scrollTo(e);
    },
    scrollToIndex: function(e) {
      var n = this, i = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "auto", l = this.isBoth(), o = this.isHorizontal(), d = l ? e.every(function(T) {
        return T > -1;
      }) : e > -1;
      if (d) {
        var u = this.first, h = this.element, k = h.scrollTop, b = k === void 0 ? 0 : k, $ = h.scrollLeft, I = $ === void 0 ? 0 : $, m = this.calculateNumItems(), g = m.numToleratedItems, P = this.getContentPosition(), M = this.itemSize, x = function() {
          var H = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, U = arguments.length > 1 ? arguments[1] : void 0;
          return H <= U ? 0 : H;
        }, j = function(H, U, G) {
          return H * U + G;
        }, _ = function() {
          var H = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, U = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return n.scrollTo({
            left: H,
            top: U,
            behavior: i
          });
        }, C = l ? {
          rows: 0,
          cols: 0
        } : 0, Z = !1, D = !1;
        l ? (C = {
          rows: x(e[0], g[0]),
          cols: x(e[1], g[1])
        }, _(j(C.cols, M[1], P.left), j(C.rows, M[0], P.top)), D = this.lastScrollPos.top !== b || this.lastScrollPos.left !== I, Z = C.rows !== u.rows || C.cols !== u.cols) : (C = x(e, g), o ? _(j(C, M, P.left), b) : _(I, j(C, M, P.top)), D = this.lastScrollPos !== (o ? I : b), Z = C !== u), this.isRangeChanged = Z, D && (this.first = C);
      }
    },
    scrollInView: function(e, n) {
      var i = this, l = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "auto";
      if (n) {
        var o = this.isBoth(), d = this.isHorizontal(), u = o ? e.every(function(M) {
          return M > -1;
        }) : e > -1;
        if (u) {
          var h = this.getRenderedRange(), k = h.first, b = h.viewport, $ = function() {
            var x = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, j = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
            return i.scrollTo({
              left: x,
              top: j,
              behavior: l
            });
          }, I = n === "to-start", m = n === "to-end";
          if (I) {
            if (o)
              b.first.rows - k.rows > e[0] ? $(b.first.cols * this.itemSize[1], (b.first.rows - 1) * this.itemSize[0]) : b.first.cols - k.cols > e[1] && $((b.first.cols - 1) * this.itemSize[1], b.first.rows * this.itemSize[0]);
            else if (b.first - k > e) {
              var g = (b.first - 1) * this.itemSize;
              d ? $(g, 0) : $(0, g);
            }
          } else if (m) {
            if (o)
              b.last.rows - k.rows <= e[0] + 1 ? $(b.first.cols * this.itemSize[1], (b.first.rows + 1) * this.itemSize[0]) : b.last.cols - k.cols <= e[1] + 1 && $((b.first.cols + 1) * this.itemSize[1], b.first.rows * this.itemSize[0]);
            else if (b.last - k <= e + 1) {
              var P = (b.first + 1) * this.itemSize;
              d ? $(P, 0) : $(0, P);
            }
          }
        }
      } else
        this.scrollToIndex(e, l);
    },
    getRenderedRange: function() {
      var e = function($, I) {
        return Math.floor($ / (I || $));
      }, n = this.first, i = 0;
      if (this.element) {
        var l = this.isBoth(), o = this.isHorizontal(), d = this.element, u = d.scrollTop, h = d.scrollLeft;
        if (l)
          n = {
            rows: e(u, this.itemSize[0]),
            cols: e(h, this.itemSize[1])
          }, i = {
            rows: n.rows + this.numItemsInViewport.rows,
            cols: n.cols + this.numItemsInViewport.cols
          };
        else {
          var k = o ? h : u;
          n = e(k, this.itemSize), i = n + this.numItemsInViewport;
        }
      }
      return {
        first: this.first,
        last: this.last,
        viewport: {
          first: n,
          last: i
        }
      };
    },
    calculateNumItems: function() {
      var e = this.isBoth(), n = this.isHorizontal(), i = this.itemSize, l = this.getContentPosition(), o = this.element ? this.element.offsetWidth - l.left : 0, d = this.element ? this.element.offsetHeight - l.top : 0, u = function(I, m) {
        return Math.ceil(I / (m || I));
      }, h = function(I) {
        return Math.ceil(I / 2);
      }, k = e ? {
        rows: u(d, i[0]),
        cols: u(o, i[1])
      } : u(n ? o : d, i), b = this.d_numToleratedItems || (e ? [h(k.rows), h(k.cols)] : h(k));
      return {
        numItemsInViewport: k,
        numToleratedItems: b
      };
    },
    calculateOptions: function() {
      var e = this, n = this.isBoth(), i = this.first, l = this.calculateNumItems(), o = l.numItemsInViewport, d = l.numToleratedItems, u = function(b, $, I) {
        var m = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !1;
        return e.getLast(b + $ + (b < I ? 2 : 3) * I, m);
      }, h = n ? {
        rows: u(i.rows, o.rows, d[0]),
        cols: u(i.cols, o.cols, d[1], !0)
      } : u(i, o, d);
      this.last = h, this.numItemsInViewport = o, this.d_numToleratedItems = d, this.$emit("update:numToleratedItems", this.d_numToleratedItems), this.showLoader && (this.loaderArr = n ? Array.from({
        length: o.rows
      }).map(function() {
        return Array.from({
          length: o.cols
        });
      }) : Array.from({
        length: o
      })), this.lazy && Promise.resolve().then(function() {
        var k;
        e.lazyLoadState = {
          first: e.step ? n ? {
            rows: 0,
            cols: i.cols
          } : 0 : i,
          last: Math.min(e.step ? e.step : h, ((k = e.items) === null || k === void 0 ? void 0 : k.length) || 0)
        }, e.$emit("lazy-load", e.lazyLoadState);
      });
    },
    calculateAutoSize: function() {
      var e = this;
      this.autoSize && !this.d_loading && Promise.resolve().then(function() {
        if (e.content) {
          var n = e.isBoth(), i = e.isHorizontal(), l = e.isVertical();
          e.content.style.minHeight = e.content.style.minWidth = "auto", e.content.style.position = "relative", e.element.style.contain = "none";
          var o = [Oe(e.element), Le(e.element)], d = o[0], u = o[1];
          (n || i) && (e.element.style.width = d < e.defaultWidth ? d + "px" : e.scrollWidth || e.defaultWidth + "px"), (n || l) && (e.element.style.height = u < e.defaultHeight ? u + "px" : e.scrollHeight || e.defaultHeight + "px"), e.content.style.minHeight = e.content.style.minWidth = "", e.content.style.position = "", e.element.style.contain = "";
        }
      });
    },
    getLast: function() {
      var e, n, i = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, l = arguments.length > 1 ? arguments[1] : void 0;
      return this.items ? Math.min(l ? ((e = this.columns || this.items[0]) === null || e === void 0 ? void 0 : e.length) || 0 : ((n = this.items) === null || n === void 0 ? void 0 : n.length) || 0, i) : 0;
    },
    getContentPosition: function() {
      if (this.content) {
        var e = getComputedStyle(this.content), n = parseFloat(e.paddingLeft) + Math.max(parseFloat(e.left) || 0, 0), i = parseFloat(e.paddingRight) + Math.max(parseFloat(e.right) || 0, 0), l = parseFloat(e.paddingTop) + Math.max(parseFloat(e.top) || 0, 0), o = parseFloat(e.paddingBottom) + Math.max(parseFloat(e.bottom) || 0, 0);
        return {
          left: n,
          right: i,
          top: l,
          bottom: o,
          x: n + i,
          y: l + o
        };
      }
      return {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        x: 0,
        y: 0
      };
    },
    setSize: function() {
      var e = this;
      if (this.element) {
        var n = this.isBoth(), i = this.isHorizontal(), l = this.element.parentElement, o = this.scrollWidth || "".concat(this.element.offsetWidth || l.offsetWidth, "px"), d = this.scrollHeight || "".concat(this.element.offsetHeight || l.offsetHeight, "px"), u = function(k, b) {
          return e.element.style[k] = b;
        };
        n || i ? (u("height", d), u("width", o)) : u("height", d);
      }
    },
    setSpacerSize: function() {
      var e = this, n = this.items;
      if (n) {
        var i = this.isBoth(), l = this.isHorizontal(), o = this.getContentPosition(), d = function(h, k, b) {
          var $ = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 0;
          return e.spacerStyle = xe(xe({}, e.spacerStyle), Yt({}, "".concat(h), (k || []).length * b + $ + "px"));
        };
        i ? (d("height", n, this.itemSize[0], o.y), d("width", this.columns || n[1], this.itemSize[1], o.x)) : l ? d("width", this.columns || n, this.itemSize, o.x) : d("height", n, this.itemSize, o.y);
      }
    },
    setContentPosition: function(e) {
      var n = this;
      if (this.content && !this.appendOnly) {
        var i = this.isBoth(), l = this.isHorizontal(), o = e ? e.first : this.first, d = function(b, $) {
          return b * $;
        }, u = function() {
          var b = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, $ = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return n.contentStyle = xe(xe({}, n.contentStyle), {
            transform: "translate3d(".concat(b, "px, ").concat($, "px, 0)")
          });
        };
        if (i)
          u(d(o.cols, this.itemSize[1]), d(o.rows, this.itemSize[0]));
        else {
          var h = d(o, this.itemSize);
          l ? u(h, 0) : u(0, h);
        }
      }
    },
    onScrollPositionChange: function(e) {
      var n = this, i = e.target, l = this.isBoth(), o = this.isHorizontal(), d = this.getContentPosition(), u = function(B, W) {
        return B ? B > W ? B - W : B : 0;
      }, h = function(B, W) {
        return Math.floor(B / (W || B));
      }, k = function(B, W, ne, Y, X, q) {
        return B <= X ? X : q ? ne - Y - X : W + X - 1;
      }, b = function(B, W, ne, Y, X, q, le, f) {
        if (B <= q) return 0;
        var p = Math.max(0, le ? B < W ? ne : B - q : B > W ? ne : B - 2 * q), O = n.getLast(p, f);
        return p > O ? O - X : p;
      }, $ = function(B, W, ne, Y, X, q) {
        var le = W + Y + 2 * X;
        return B >= X && (le += X + 1), n.getLast(le, q);
      }, I = u(i.scrollTop, d.top), m = u(i.scrollLeft, d.left), g = l ? {
        rows: 0,
        cols: 0
      } : 0, P = this.last, M = !1, x = this.lastScrollPos;
      if (l) {
        var j = this.lastScrollPos.top <= I, _ = this.lastScrollPos.left <= m;
        if (!this.appendOnly || this.appendOnly && (j || _)) {
          var C = {
            rows: h(I, this.itemSize[0]),
            cols: h(m, this.itemSize[1])
          }, Z = {
            rows: k(C.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], j),
            cols: k(C.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], _)
          };
          g = {
            rows: b(C.rows, Z.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], j),
            cols: b(C.cols, Z.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], _, !0)
          }, P = {
            rows: $(C.rows, g.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0]),
            cols: $(C.cols, g.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], !0)
          }, M = g.rows !== this.first.rows || P.rows !== this.last.rows || g.cols !== this.first.cols || P.cols !== this.last.cols || this.isRangeChanged, x = {
            top: I,
            left: m
          };
        }
      } else {
        var D = o ? m : I, T = this.lastScrollPos <= D;
        if (!this.appendOnly || this.appendOnly && T) {
          var H = h(D, this.itemSize), U = k(H, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, T);
          g = b(H, U, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, T), P = $(H, g, this.last, this.numItemsInViewport, this.d_numToleratedItems), M = g !== this.first || P !== this.last || this.isRangeChanged, x = D;
        }
      }
      return {
        first: g,
        last: P,
        isRangeChanged: M,
        scrollPos: x
      };
    },
    onScrollChange: function(e) {
      var n = this.onScrollPositionChange(e), i = n.first, l = n.last, o = n.isRangeChanged, d = n.scrollPos;
      if (o) {
        var u = {
          first: i,
          last: l
        };
        if (this.setContentPosition(u), this.first = i, this.last = l, this.lastScrollPos = d, this.$emit("scroll-index-change", u), this.lazy && this.isPageChanged(i)) {
          var h, k, b = {
            first: this.step ? Math.min(this.getPageByFirst(i) * this.step, (((h = this.items) === null || h === void 0 ? void 0 : h.length) || 0) - this.step) : i,
            last: Math.min(this.step ? (this.getPageByFirst(i) + 1) * this.step : l, ((k = this.items) === null || k === void 0 ? void 0 : k.length) || 0)
          }, $ = this.lazyLoadState.first !== b.first || this.lazyLoadState.last !== b.last;
          $ && this.$emit("lazy-load", b), this.lazyLoadState = b;
        }
      }
    },
    onScroll: function(e) {
      var n = this;
      if (this.$emit("scroll", e), this.delay) {
        if (this.scrollTimeout && clearTimeout(this.scrollTimeout), this.isPageChanged()) {
          if (!this.d_loading && this.showLoader) {
            var i = this.onScrollPositionChange(e), l = i.isRangeChanged, o = l || (this.step ? this.isPageChanged() : !1);
            o && (this.d_loading = !0);
          }
          this.scrollTimeout = setTimeout(function() {
            n.onScrollChange(e), n.d_loading && n.showLoader && (!n.lazy || n.loading === void 0) && (n.d_loading = !1, n.page = n.getPageByFirst());
          }, this.delay);
        }
      } else
        this.onScrollChange(e);
    },
    onResize: function() {
      var e = this;
      this.resizeTimeout && clearTimeout(this.resizeTimeout), this.resizeTimeout = setTimeout(function() {
        if (Ee(e.element)) {
          var n = e.isBoth(), i = e.isVertical(), l = e.isHorizontal(), o = [Oe(e.element), Le(e.element)], d = o[0], u = o[1], h = d !== e.defaultWidth, k = u !== e.defaultHeight, b = n ? h || k : l ? h : i ? k : !1;
          b && (e.d_numToleratedItems = e.numToleratedItems, e.defaultWidth = d, e.defaultHeight = u, e.defaultContentWidth = Oe(e.content), e.defaultContentHeight = Le(e.content), e.init());
        }
      }, this.resizeDelay);
    },
    bindResizeListener: function() {
      var e = this;
      this.resizeListener || (this.resizeListener = this.onResize.bind(this), window.addEventListener("resize", this.resizeListener), window.addEventListener("orientationchange", this.resizeListener), this.resizeObserver = new ResizeObserver(function() {
        e.onResize();
      }), this.resizeObserver.observe(this.element));
    },
    unbindResizeListener: function() {
      this.resizeListener && (window.removeEventListener("resize", this.resizeListener), window.removeEventListener("orientationchange", this.resizeListener), this.resizeListener = null), this.resizeObserver && (this.resizeObserver.disconnect(), this.resizeObserver = null);
    },
    getOptions: function(e) {
      var n = (this.items || []).length, i = this.isBoth() ? this.first.rows + e : this.first + e;
      return {
        index: i,
        count: n,
        first: i === 0,
        last: i === n - 1,
        even: i % 2 === 0,
        odd: i % 2 !== 0
      };
    },
    getLoaderOptions: function(e, n) {
      var i = this.loaderArr.length;
      return xe({
        index: e,
        count: i,
        first: e === 0,
        last: e === i - 1,
        even: e % 2 === 0,
        odd: e % 2 !== 0
      }, n);
    },
    getPageByFirst: function(e) {
      return Math.floor(((e ?? this.first) + this.d_numToleratedItems * 4) / (this.step || 1));
    },
    isPageChanged: function(e) {
      return this.step && !this.lazy ? this.page !== this.getPageByFirst(e ?? this.first) : !0;
    },
    setContentEl: function(e) {
      this.content = e || this.content || Pt(this.element, '[data-pc-section="content"]');
    },
    elementRef: function(e) {
      this.element = e;
    },
    contentRef: function(e) {
      this.content = e;
    }
  },
  computed: {
    containerClass: function() {
      return ["p-virtualscroller", this.class, {
        "p-virtualscroller-inline": this.inline,
        "p-virtualscroller-both p-both-scroll": this.isBoth(),
        "p-virtualscroller-horizontal p-horizontal-scroll": this.isHorizontal()
      }];
    },
    contentClass: function() {
      return ["p-virtualscroller-content", {
        "p-virtualscroller-loading": this.d_loading
      }];
    },
    loaderClass: function() {
      return ["p-virtualscroller-loader", {
        "p-virtualscroller-loader-mask": !this.$slots.loader
      }];
    },
    loadedItems: function() {
      var e = this;
      return this.items && !this.d_loading ? this.isBoth() ? this.items.slice(this.appendOnly ? 0 : this.first.rows, this.last.rows).map(function(n) {
        return e.columns ? n : n.slice(e.appendOnly ? 0 : e.first.cols, e.last.cols);
      }) : this.isHorizontal() && this.columns ? this.items : this.items.slice(this.appendOnly ? 0 : this.first, this.last) : [];
    },
    loadedRows: function() {
      return this.d_loading ? this.loaderDisabled ? this.loaderArr : [] : this.loadedItems;
    },
    loadedColumns: function() {
      if (this.columns) {
        var e = this.isBoth(), n = this.isHorizontal();
        if (e || n)
          return this.d_loading && this.loaderDisabled ? e ? this.loaderArr[0] : this.loaderArr : this.columns.slice(e ? this.first.cols : this.first, e ? this.last.cols : this.last);
      }
      return this.columns;
    }
  },
  components: {
    SpinnerIcon: at
  }
}, io = ["tabindex"];
function oo(t, e, n, i, l, o) {
  var d = oe("SpinnerIcon");
  return t.disabled ? (c(), v(J, {
    key: 1
  }, [K(t.$slots, "default"), K(t.$slots, "content", {
    items: t.items,
    rows: t.items,
    columns: o.loadedColumns
  })], 64)) : (c(), v("div", w({
    key: 0,
    ref: o.elementRef,
    class: o.containerClass,
    tabindex: t.tabindex,
    style: t.style,
    onScroll: e[0] || (e[0] = function() {
      return o.onScroll && o.onScroll.apply(o, arguments);
    })
  }, t.ptmi("root")), [K(t.$slots, "content", {
    styleClass: o.contentClass,
    items: o.loadedItems,
    getItemOptions: o.getOptions,
    loading: l.d_loading,
    getLoaderOptions: o.getLoaderOptions,
    itemSize: t.itemSize,
    rows: o.loadedRows,
    columns: o.loadedColumns,
    contentRef: o.contentRef,
    spacerStyle: l.spacerStyle,
    contentStyle: l.contentStyle,
    vertical: o.isVertical(),
    horizontal: o.isHorizontal(),
    both: o.isBoth()
  }, function() {
    return [r("div", w({
      ref: o.contentRef,
      class: o.contentClass,
      style: l.contentStyle
    }, t.ptm("content")), [(c(!0), v(J, null, fe(o.loadedItems, function(u, h) {
      return K(t.$slots, "item", {
        key: h,
        item: u,
        options: o.getOptions(h)
      });
    }), 128))], 16)];
  }), t.showSpacer ? (c(), v("div", w({
    key: 0,
    class: "p-virtualscroller-spacer",
    style: l.spacerStyle
  }, t.ptm("spacer")), null, 16)) : F("", !0), !t.loaderDisabled && t.showLoader && l.d_loading ? (c(), v("div", w({
    key: 1,
    class: o.loaderClass
  }, t.ptm("loader")), [t.$slots && t.$slots.loader ? (c(!0), v(J, {
    key: 0
  }, fe(l.loaderArr, function(u, h) {
    return K(t.$slots, "loader", {
      key: h,
      options: o.getLoaderOptions(h, o.isBoth() && {
        numCols: t.d_numItemsInViewport.cols
      })
    });
  }), 128)) : F("", !0), K(t.$slots, "loadingicon", {}, function() {
    return [S(d, w({
      spin: "",
      class: "p-virtualscroller-loading-icon"
    }, t.ptm("loadingIcon")), null, 16)];
  })], 16)) : F("", !0)], 16, io));
}
Jt.render = oo;
var lo = `
    .p-select {
        display: inline-flex;
        cursor: pointer;
        position: relative;
        user-select: none;
        background: dt('select.background');
        border: 1px solid dt('select.border.color');
        transition:
            background dt('select.transition.duration'),
            color dt('select.transition.duration'),
            border-color dt('select.transition.duration'),
            outline-color dt('select.transition.duration'),
            box-shadow dt('select.transition.duration');
        border-radius: dt('select.border.radius');
        outline-color: transparent;
        box-shadow: dt('select.shadow');
    }

    .p-select:not(.p-disabled):hover {
        border-color: dt('select.hover.border.color');
    }

    .p-select:not(.p-disabled).p-focus {
        border-color: dt('select.focus.border.color');
        box-shadow: dt('select.focus.ring.shadow');
        outline: dt('select.focus.ring.width') dt('select.focus.ring.style') dt('select.focus.ring.color');
        outline-offset: dt('select.focus.ring.offset');
    }

    .p-select.p-variant-filled {
        background: dt('select.filled.background');
    }

    .p-select.p-variant-filled:not(.p-disabled):hover {
        background: dt('select.filled.hover.background');
    }

    .p-select.p-variant-filled:not(.p-disabled).p-focus {
        background: dt('select.filled.focus.background');
    }

    .p-select.p-invalid {
        border-color: dt('select.invalid.border.color');
    }

    .p-select.p-disabled {
        opacity: 1;
        background: dt('select.disabled.background');
    }

    .p-select-clear-icon {
        align-self: center;
        color: dt('select.clear.icon.color');
        inset-inline-end: dt('select.dropdown.width');
    }

    .p-select-dropdown {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        background: transparent;
        color: dt('select.dropdown.color');
        width: dt('select.dropdown.width');
        border-start-end-radius: dt('select.border.radius');
        border-end-end-radius: dt('select.border.radius');
    }

    .p-select-label {
        display: block;
        white-space: nowrap;
        overflow: hidden;
        flex: 1 1 auto;
        width: 1%;
        padding: dt('select.padding.y') dt('select.padding.x');
        text-overflow: ellipsis;
        cursor: pointer;
        color: dt('select.color');
        background: transparent;
        border: 0 none;
        outline: 0 none;
        font-size: 1rem;
    }

    .p-select-label.p-placeholder {
        color: dt('select.placeholder.color');
    }

    .p-select.p-invalid .p-select-label.p-placeholder {
        color: dt('select.invalid.placeholder.color');
    }

    .p-select.p-disabled .p-select-label {
        color: dt('select.disabled.color');
    }

    .p-select-label-empty {
        overflow: hidden;
        opacity: 0;
    }

    input.p-select-label {
        cursor: default;
    }

    .p-select-overlay {
        position: absolute;
        top: 0;
        left: 0;
        background: dt('select.overlay.background');
        color: dt('select.overlay.color');
        border: 1px solid dt('select.overlay.border.color');
        border-radius: dt('select.overlay.border.radius');
        box-shadow: dt('select.overlay.shadow');
        min-width: 100%;
        transform-origin: inherit;
        will-change: transform;
    }

    .p-select-header {
        padding: dt('select.list.header.padding');
    }

    .p-select-filter {
        width: 100%;
    }

    .p-select-list-container {
        overflow: auto;
    }

    .p-select-option-group {
        cursor: auto;
        margin: 0;
        padding: dt('select.option.group.padding');
        background: dt('select.option.group.background');
        color: dt('select.option.group.color');
        font-weight: dt('select.option.group.font.weight');
    }

    .p-select-list {
        margin: 0;
        padding: 0;
        list-style-type: none;
        padding: dt('select.list.padding');
        gap: dt('select.list.gap');
        display: flex;
        flex-direction: column;
    }

    .p-select-option {
        cursor: pointer;
        font-weight: normal;
        white-space: nowrap;
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: center;
        padding: dt('select.option.padding');
        border: 0 none;
        color: dt('select.option.color');
        background: transparent;
        transition:
            background dt('select.transition.duration'),
            color dt('select.transition.duration'),
            border-color dt('select.transition.duration'),
            box-shadow dt('select.transition.duration'),
            outline-color dt('select.transition.duration');
        border-radius: dt('select.option.border.radius');
    }

    .p-select-option:not(.p-select-option-selected):not(.p-disabled).p-focus {
        background: dt('select.option.focus.background');
        color: dt('select.option.focus.color');
    }

    .p-select-option:not(.p-select-option-selected):not(.p-disabled):hover {
        background: dt('select.option.focus.background');
        color: dt('select.option.focus.color');
    }

    .p-select-option.p-select-option-selected {
        background: dt('select.option.selected.background');
        color: dt('select.option.selected.color');
    }

    .p-select-option.p-select-option-selected.p-focus {
        background: dt('select.option.selected.focus.background');
        color: dt('select.option.selected.focus.color');
    }
   
    .p-select-option-blank-icon {
        flex-shrink: 0;
    }

    .p-select-option-check-icon {
        position: relative;
        flex-shrink: 0;
        margin-inline-start: dt('select.checkmark.gutter.start');
        margin-inline-end: dt('select.checkmark.gutter.end');
        color: dt('select.checkmark.color');
    }

    .p-select-empty-message {
        padding: dt('select.empty.message.padding');
    }

    .p-select-fluid {
        display: flex;
        width: 100%;
    }

    .p-select-sm .p-select-label {
        font-size: dt('select.sm.font.size');
        padding-block: dt('select.sm.padding.y');
        padding-inline: dt('select.sm.padding.x');
    }

    .p-select-sm .p-select-dropdown .p-icon {
        font-size: dt('select.sm.font.size');
        width: dt('select.sm.font.size');
        height: dt('select.sm.font.size');
    }

    .p-select-lg .p-select-label {
        font-size: dt('select.lg.font.size');
        padding-block: dt('select.lg.padding.y');
        padding-inline: dt('select.lg.padding.x');
    }

    .p-select-lg .p-select-dropdown .p-icon {
        font-size: dt('select.lg.font.size');
        width: dt('select.lg.font.size');
        height: dt('select.lg.font.size');
    }

    .p-floatlabel-in .p-select-filter {
        padding-block-start: dt('select.padding.y');
        padding-block-end: dt('select.padding.y');
    }
`, ro = {
  root: function(e) {
    var n = e.instance, i = e.props, l = e.state;
    return ["p-select p-component p-inputwrapper", {
      "p-disabled": i.disabled,
      "p-invalid": n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-focus": l.focused,
      "p-inputwrapper-filled": n.$filled,
      "p-inputwrapper-focus": l.focused || l.overlayVisible,
      "p-select-open": l.overlayVisible,
      "p-select-fluid": n.$fluid,
      "p-select-sm p-inputfield-sm": i.size === "small",
      "p-select-lg p-inputfield-lg": i.size === "large"
    }];
  },
  label: function(e) {
    var n, i = e.instance, l = e.props;
    return ["p-select-label", {
      "p-placeholder": !l.editable && i.label === l.placeholder,
      "p-select-label-empty": !l.editable && !i.$slots.value && (i.label === "p-emptylabel" || ((n = i.label) === null || n === void 0 ? void 0 : n.length) === 0)
    }];
  },
  clearIcon: "p-select-clear-icon",
  dropdown: "p-select-dropdown",
  loadingicon: "p-select-loading-icon",
  dropdownIcon: "p-select-dropdown-icon",
  overlay: "p-select-overlay p-component",
  header: "p-select-header",
  pcFilter: "p-select-filter",
  listContainer: "p-select-list-container",
  list: "p-select-list",
  optionGroup: "p-select-option-group",
  optionGroupLabel: "p-select-option-group-label",
  option: function(e) {
    var n = e.instance, i = e.props, l = e.state, o = e.option, d = e.focusedOption;
    return ["p-select-option", {
      "p-select-option-selected": n.isSelected(o) && i.highlightOnSelect,
      "p-focus": l.focusedOptionIndex === d,
      "p-disabled": n.isOptionDisabled(o)
    }];
  },
  optionLabel: "p-select-option-label",
  optionCheckIcon: "p-select-option-check-icon",
  optionBlankIcon: "p-select-option-blank-icon",
  emptyMessage: "p-select-empty-message"
}, ao = ge.extend({
  name: "select",
  style: lo,
  classes: ro
}), so = {
  name: "BaseSelect",
  extends: st,
  props: {
    options: Array,
    optionLabel: [String, Function],
    optionValue: [String, Function],
    optionDisabled: [String, Function],
    optionGroupLabel: [String, Function],
    optionGroupChildren: [String, Function],
    scrollHeight: {
      type: String,
      default: "14rem"
    },
    filter: Boolean,
    filterPlaceholder: String,
    filterLocale: String,
    filterMatchMode: {
      type: String,
      default: "contains"
    },
    filterFields: {
      type: Array,
      default: null
    },
    editable: Boolean,
    placeholder: {
      type: String,
      default: null
    },
    dataKey: null,
    showClear: {
      type: Boolean,
      default: !1
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
    labelId: {
      type: String,
      default: null
    },
    labelClass: {
      type: [String, Object],
      default: null
    },
    labelStyle: {
      type: Object,
      default: null
    },
    panelClass: {
      type: [String, Object],
      default: null
    },
    overlayStyle: {
      type: Object,
      default: null
    },
    overlayClass: {
      type: [String, Object],
      default: null
    },
    panelStyle: {
      type: Object,
      default: null
    },
    appendTo: {
      type: [String, Object],
      default: "body"
    },
    loading: {
      type: Boolean,
      default: !1
    },
    clearIcon: {
      type: String,
      default: void 0
    },
    dropdownIcon: {
      type: String,
      default: void 0
    },
    filterIcon: {
      type: String,
      default: void 0
    },
    loadingIcon: {
      type: String,
      default: void 0
    },
    resetFilterOnHide: {
      type: Boolean,
      default: !1
    },
    resetFilterOnClear: {
      type: Boolean,
      default: !1
    },
    virtualScrollerOptions: {
      type: Object,
      default: null
    },
    autoOptionFocus: {
      type: Boolean,
      default: !1
    },
    autoFilterFocus: {
      type: Boolean,
      default: !1
    },
    selectOnFocus: {
      type: Boolean,
      default: !1
    },
    focusOnHover: {
      type: Boolean,
      default: !0
    },
    highlightOnSelect: {
      type: Boolean,
      default: !0
    },
    checkmark: {
      type: Boolean,
      default: !1
    },
    filterMessage: {
      type: String,
      default: null
    },
    selectionMessage: {
      type: String,
      default: null
    },
    emptySelectionMessage: {
      type: String,
      default: null
    },
    emptyFilterMessage: {
      type: String,
      default: null
    },
    emptyMessage: {
      type: String,
      default: null
    },
    tabindex: {
      type: Number,
      default: 0
    },
    ariaLabel: {
      type: String,
      default: null
    },
    ariaLabelledby: {
      type: String,
      default: null
    }
  },
  style: ao,
  provide: function() {
    return {
      $pcSelect: this,
      $parentInstance: this
    };
  }
};
function Te(t) {
  "@babel/helpers - typeof";
  return Te = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Te(t);
}
function uo(t) {
  return fo(t) || ho(t) || po(t) || co();
}
function co() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function po(t, e) {
  if (t) {
    if (typeof t == "string") return nt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? nt(t, e) : void 0;
  }
}
function ho(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function fo(t) {
  if (Array.isArray(t)) return nt(t);
}
function nt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, i = Array(e); n < e; n++) i[n] = t[n];
  return i;
}
function $t(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(t);
    e && (i = i.filter(function(l) {
      return Object.getOwnPropertyDescriptor(t, l).enumerable;
    })), n.push.apply(n, i);
  }
  return n;
}
function Vt(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? $t(Object(n), !0).forEach(function(i) {
      ve(t, i, n[i]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : $t(Object(n)).forEach(function(i) {
      Object.defineProperty(t, i, Object.getOwnPropertyDescriptor(n, i));
    });
  }
  return t;
}
function ve(t, e, n) {
  return (e = go(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function go(t) {
  var e = vo(t, "string");
  return Te(e) == "symbol" ? e : e + "";
}
function vo(t, e) {
  if (Te(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(t, e);
    if (Te(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var $e = {
  name: "Select",
  extends: so,
  inheritAttrs: !1,
  emits: ["change", "focus", "blur", "before-show", "before-hide", "show", "hide", "filter"],
  outsideClickListener: null,
  scrollHandler: null,
  resizeListener: null,
  labelClickListener: null,
  matchMediaOrientationListener: null,
  overlay: null,
  list: null,
  virtualScroller: null,
  searchTimeout: null,
  searchValue: null,
  isModelValueChanged: !1,
  data: function() {
    return {
      clicked: !1,
      focused: !1,
      focusedOptionIndex: -1,
      filterValue: null,
      overlayVisible: !1,
      queryOrientation: null
    };
  },
  watch: {
    modelValue: function() {
      this.isModelValueChanged = !0;
    },
    options: function() {
      this.autoUpdateModel();
    }
  },
  mounted: function() {
    this.autoUpdateModel(), this.bindLabelClickListener(), this.bindMatchMediaOrientationListener();
  },
  updated: function() {
    this.overlayVisible && this.isModelValueChanged && this.scrollInView(this.findSelectedOptionIndex()), this.isModelValueChanged = !1;
  },
  beforeUnmount: function() {
    this.unbindOutsideClickListener(), this.unbindResizeListener(), this.unbindLabelClickListener(), this.unbindMatchMediaOrientationListener(), this.scrollHandler && (this.scrollHandler.destroy(), this.scrollHandler = null), this.overlay && (Ie.clear(this.overlay), this.overlay = null);
  },
  methods: {
    getOptionIndex: function(e, n) {
      return this.virtualScrollerDisabled ? e : n && n(e).index;
    },
    getOptionLabel: function(e) {
      return this.optionLabel ? we(e, this.optionLabel) : e;
    },
    getOptionValue: function(e) {
      return this.optionValue ? we(e, this.optionValue) : e;
    },
    getOptionRenderKey: function(e, n) {
      return (this.dataKey ? we(e, this.dataKey) : this.getOptionLabel(e)) + "_" + n;
    },
    getPTItemOptions: function(e, n, i, l) {
      return this.ptm(l, {
        context: {
          option: e,
          index: i,
          selected: this.isSelected(e),
          focused: this.focusedOptionIndex === this.getOptionIndex(i, n),
          disabled: this.isOptionDisabled(e)
        }
      });
    },
    isOptionDisabled: function(e) {
      return this.optionDisabled ? we(e, this.optionDisabled) : !1;
    },
    isOptionGroup: function(e) {
      return this.optionGroupLabel && e.optionGroup && e.group;
    },
    getOptionGroupLabel: function(e) {
      return we(e, this.optionGroupLabel);
    },
    getOptionGroupChildren: function(e) {
      return we(e, this.optionGroupChildren);
    },
    getAriaPosInset: function(e) {
      var n = this;
      return (this.optionGroupLabel ? e - this.visibleOptions.slice(0, e).filter(function(i) {
        return n.isOptionGroup(i);
      }).length : e) + 1;
    },
    show: function(e) {
      this.$emit("before-show"), this.overlayVisible = !0, this.focusedOptionIndex = this.focusedOptionIndex !== -1 ? this.focusedOptionIndex : this.autoOptionFocus ? this.findFirstFocusedOptionIndex() : this.editable ? -1 : this.findSelectedOptionIndex(), e && ce(this.$refs.focusInput);
    },
    hide: function(e) {
      var n = this, i = function() {
        n.$emit("before-hide"), n.overlayVisible = !1, n.clicked = !1, n.focusedOptionIndex = -1, n.searchValue = "", n.resetFilterOnHide && (n.filterValue = null), e && ce(n.$refs.focusInput);
      };
      setTimeout(function() {
        i();
      }, 0);
    },
    onFocus: function(e) {
      this.disabled || (this.focused = !0, this.overlayVisible && (this.focusedOptionIndex = this.focusedOptionIndex !== -1 ? this.focusedOptionIndex : this.autoOptionFocus ? this.findFirstFocusedOptionIndex() : this.editable ? -1 : this.findSelectedOptionIndex(), this.scrollInView(this.focusedOptionIndex)), this.$emit("focus", e));
    },
    onBlur: function(e) {
      var n = this;
      setTimeout(function() {
        var i, l;
        n.focused = !1, n.focusedOptionIndex = -1, n.searchValue = "", n.$emit("blur", e), (i = (l = n.formField).onBlur) === null || i === void 0 || i.call(l, e);
      }, 100);
    },
    onKeyDown: function(e) {
      var n = this;
      if (this.disabled) {
        e.preventDefault();
        return;
      }
      if (In())
        switch (e.code) {
          case "Backspace":
            this.onBackspaceKey(e, this.editable);
            break;
          case "Enter":
          case "NumpadDecimal":
            this.onEnterKey(e);
            break;
          default:
            e.preventDefault();
            return;
        }
      var i = e.metaKey || e.ctrlKey;
      switch (e.code) {
        case "ArrowDown":
          this.onArrowDownKey(e);
          break;
        case "ArrowUp":
          this.onArrowUpKey(e, this.editable);
          break;
        case "ArrowLeft":
        case "ArrowRight":
          this.onArrowLeftKey(e, this.editable);
          break;
        case "Home":
          this.onHomeKey(e, this.editable);
          break;
        case "End":
          this.onEndKey(e, this.editable);
          break;
        case "PageDown":
          this.onPageDownKey(e);
          break;
        case "PageUp":
          this.onPageUpKey(e);
          break;
        case "Space":
          this.onSpaceKey(e, this.editable);
          break;
        case "Enter":
        case "NumpadEnter":
          this.onEnterKey(e);
          break;
        case "Escape":
          this.onEscapeKey(e);
          break;
        case "Tab":
          this.onTabKey(e);
          break;
        case "Backspace":
          this.onBackspaceKey(e, this.editable);
          break;
        case "ShiftLeft":
        case "ShiftRight":
          break;
        default:
          !i && Sn(e.key) && (!this.overlayVisible && this.show(), !this.editable && this.searchOptions(e, e.key), this.filter && this.$nextTick(function() {
            n.$refs.filterInput && ce(n.$refs.filterInput.$el);
          }));
          break;
      }
      this.clicked = !1;
    },
    onEditableInput: function(e) {
      var n = e.target.value;
      this.searchValue = "";
      var i = this.searchOptions(e, n);
      !i && (this.focusedOptionIndex = -1), this.updateModel(e, n), !this.overlayVisible && ke(n) && this.show();
    },
    onContainerClick: function(e) {
      this.disabled || this.loading || e.target.tagName === "INPUT" || e.target.getAttribute("data-pc-section") === "clearicon" || e.target.closest('[data-pc-section="clearicon"]') || ((!this.overlay || !this.overlay.contains(e.target)) && (this.overlayVisible ? this.hide(!0) : this.show(!0)), this.clicked = !0);
    },
    onClearClick: function(e) {
      this.updateModel(e, null), this.resetFilterOnClear && (this.filterValue = null);
    },
    onFirstHiddenFocus: function(e) {
      var n = e.relatedTarget === this.$refs.focusInput ? kn(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      ce(n);
    },
    onLastHiddenFocus: function(e) {
      var n = e.relatedTarget === this.$refs.focusInput ? wn(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      ce(n);
    },
    onOptionSelect: function(e, n) {
      var i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0;
      if (this.overlayVisible) {
        var l = this.getOptionValue(n);
        this.updateModel(e, l), i && this.hide(!0);
      }
    },
    onOptionMouseMove: function(e, n) {
      this.focusOnHover && this.changeFocusedOptionIndex(e, n);
    },
    onFilterChange: function(e) {
      var n = e.target.value;
      this.filterValue = n, this.focusedOptionIndex = -1, this.$emit("filter", {
        originalEvent: e,
        value: n
      }), !this.virtualScrollerDisabled && this.virtualScroller.scrollToIndex(0);
    },
    onFilterKeyDown: function(e) {
      if (!e.isComposing)
        switch (e.code) {
          case "ArrowDown":
            this.onArrowDownKey(e);
            break;
          case "ArrowUp":
            this.onArrowUpKey(e, !0);
            break;
          case "ArrowLeft":
          case "ArrowRight":
            this.onArrowLeftKey(e, !0);
            break;
          case "Home":
            this.onHomeKey(e, !0);
            break;
          case "End":
            this.onEndKey(e, !0);
            break;
          case "Enter":
          case "NumpadEnter":
            this.onEnterKey(e);
            break;
          case "Escape":
            this.onEscapeKey(e);
            break;
          case "Tab":
            this.onTabKey(e);
            break;
        }
    },
    onFilterBlur: function() {
      this.focusedOptionIndex = -1;
    },
    onFilterUpdated: function() {
      this.overlayVisible && this.alignOverlay();
    },
    onOverlayClick: function(e) {
      Ft.emit("overlay-click", {
        originalEvent: e,
        target: this.$el
      });
    },
    onOverlayKeyDown: function(e) {
      switch (e.code) {
        case "Escape":
          this.onEscapeKey(e);
          break;
      }
    },
    onArrowDownKey: function(e) {
      if (!this.overlayVisible)
        this.show(), this.editable && this.changeFocusedOptionIndex(e, this.findSelectedOptionIndex());
      else {
        var n = this.focusedOptionIndex !== -1 ? this.findNextOptionIndex(this.focusedOptionIndex) : this.clicked ? this.findFirstOptionIndex() : this.findFirstFocusedOptionIndex();
        this.changeFocusedOptionIndex(e, n);
      }
      e.preventDefault();
    },
    onArrowUpKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (e.altKey && !n)
        this.focusedOptionIndex !== -1 && this.onOptionSelect(e, this.visibleOptions[this.focusedOptionIndex]), this.overlayVisible && this.hide(), e.preventDefault();
      else {
        var i = this.focusedOptionIndex !== -1 ? this.findPrevOptionIndex(this.focusedOptionIndex) : this.clicked ? this.findLastOptionIndex() : this.findLastFocusedOptionIndex();
        this.changeFocusedOptionIndex(e, i), !this.overlayVisible && this.show(), e.preventDefault();
      }
    },
    onArrowLeftKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n && (this.focusedOptionIndex = -1);
    },
    onHomeKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (n) {
        var i = e.currentTarget;
        e.shiftKey ? i.setSelectionRange(0, e.target.selectionStart) : (i.setSelectionRange(0, 0), this.focusedOptionIndex = -1);
      } else
        this.changeFocusedOptionIndex(e, this.findFirstOptionIndex()), !this.overlayVisible && this.show();
      e.preventDefault();
    },
    onEndKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (n) {
        var i = e.currentTarget;
        if (e.shiftKey)
          i.setSelectionRange(e.target.selectionStart, i.value.length);
        else {
          var l = i.value.length;
          i.setSelectionRange(l, l), this.focusedOptionIndex = -1;
        }
      } else
        this.changeFocusedOptionIndex(e, this.findLastOptionIndex()), !this.overlayVisible && this.show();
      e.preventDefault();
    },
    onPageUpKey: function(e) {
      this.scrollInView(0), e.preventDefault();
    },
    onPageDownKey: function(e) {
      this.scrollInView(this.visibleOptions.length - 1), e.preventDefault();
    },
    onEnterKey: function(e) {
      this.overlayVisible ? (this.focusedOptionIndex !== -1 && this.onOptionSelect(e, this.visibleOptions[this.focusedOptionIndex]), this.hide(!0)) : (this.focusedOptionIndex = -1, this.onArrowDownKey(e)), e.preventDefault();
    },
    onSpaceKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      !n && this.onEnterKey(e);
    },
    onEscapeKey: function(e) {
      this.overlayVisible && this.hide(!0), e.preventDefault(), e.stopPropagation();
    },
    onTabKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n || (this.overlayVisible && this.hasFocusableElements() ? (ce(this.$refs.firstHiddenFocusableElementOnOverlay), e.preventDefault()) : (this.focusedOptionIndex !== -1 && this.onOptionSelect(e, this.visibleOptions[this.focusedOptionIndex]), this.overlayVisible && this.hide(this.filter)));
    },
    onBackspaceKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n && !this.overlayVisible && this.show();
    },
    onOverlayEnter: function(e) {
      var n = this;
      Ie.set("overlay", e, this.$primevue.config.zIndex.overlay), yn(e, {
        position: "absolute",
        top: "0"
      }), this.alignOverlay(), this.scrollInView(), this.$attrSelector && e.setAttribute(this.$attrSelector, ""), setTimeout(function() {
        n.autoFilterFocus && n.filter && ce(n.$refs.filterInput.$el), n.autoUpdateModel();
      }, 1);
    },
    onOverlayAfterEnter: function() {
      this.bindOutsideClickListener(), this.bindScrollListener(), this.bindResizeListener(), this.$emit("show");
    },
    onOverlayLeave: function(e) {
      var n = this;
      e.style.pointerEvents = "none", this.unbindOutsideClickListener(), this.unbindScrollListener(), this.unbindResizeListener(), this.autoFilterFocus && this.filter && !this.editable && this.$nextTick(function() {
        n.$refs.filterInput && ce(n.$refs.filterInput.$el);
      }), this.$emit("hide"), this.overlay = null;
    },
    onOverlayAfterLeave: function(e) {
      Ie.clear(e);
    },
    alignOverlay: function() {
      this.appendTo === "self" ? Dt(this.overlay, this.$el) : this.overlay && (this.overlay.style.minWidth = bn(this.$el) + "px", Bt(this.overlay, this.$el));
    },
    bindOutsideClickListener: function() {
      var e = this;
      this.outsideClickListener || (this.outsideClickListener = function(n) {
        var i = n.composedPath();
        e.overlayVisible && e.overlay && !i.includes(e.$el) && !i.includes(e.overlay) && e.hide();
      }, document.addEventListener("click", this.outsideClickListener, !0));
    },
    unbindOutsideClickListener: function() {
      this.outsideClickListener && (document.removeEventListener("click", this.outsideClickListener, !0), this.outsideClickListener = null);
    },
    bindScrollListener: function() {
      var e = this;
      this.scrollHandler || (this.scrollHandler = new At(this.$refs.container, function() {
        e.overlayVisible && e.hide();
      })), this.scrollHandler.bindScrollListener();
    },
    unbindScrollListener: function() {
      this.scrollHandler && this.scrollHandler.unbindScrollListener();
    },
    bindResizeListener: function() {
      var e = this;
      this.resizeListener || (this.resizeListener = function() {
        e.overlayVisible && !Ht() && e.hide();
      }, window.addEventListener("resize", this.resizeListener));
    },
    unbindResizeListener: function() {
      this.resizeListener && (window.removeEventListener("resize", this.resizeListener), this.resizeListener = null);
    },
    bindLabelClickListener: function() {
      var e = this;
      if (!this.editable && !this.labelClickListener) {
        var n = document.querySelector('label[for="'.concat(this.labelId, '"]'));
        n && Ee(n) && (this.labelClickListener = function() {
          ce(e.$refs.focusInput);
        }, n.addEventListener("click", this.labelClickListener));
      }
    },
    unbindLabelClickListener: function() {
      if (this.labelClickListener) {
        var e = document.querySelector('label[for="'.concat(this.labelId, '"]'));
        e && Ee(e) && e.removeEventListener("click", this.labelClickListener);
      }
    },
    bindMatchMediaOrientationListener: function() {
      var e = this;
      if (!this.matchMediaOrientationListener) {
        var n = matchMedia("(orientation: portrait)");
        this.queryOrientation = n, this.matchMediaOrientationListener = function() {
          e.alignOverlay();
        }, this.queryOrientation.addEventListener("change", this.matchMediaOrientationListener);
      }
    },
    unbindMatchMediaOrientationListener: function() {
      this.matchMediaOrientationListener && (this.queryOrientation.removeEventListener("change", this.matchMediaOrientationListener), this.queryOrientation = null, this.matchMediaOrientationListener = null);
    },
    hasFocusableElements: function() {
      return mn(this.overlay, ':not([data-p-hidden-focusable="true"])').length > 0;
    },
    isOptionExactMatched: function(e) {
      var n;
      return this.isValidOption(e) && typeof this.getOptionLabel(e) == "string" && ((n = this.getOptionLabel(e)) === null || n === void 0 ? void 0 : n.toLocaleLowerCase(this.filterLocale)) == this.searchValue.toLocaleLowerCase(this.filterLocale);
    },
    isOptionStartsWith: function(e) {
      var n;
      return this.isValidOption(e) && typeof this.getOptionLabel(e) == "string" && ((n = this.getOptionLabel(e)) === null || n === void 0 ? void 0 : n.toLocaleLowerCase(this.filterLocale).startsWith(this.searchValue.toLocaleLowerCase(this.filterLocale)));
    },
    isValidOption: function(e) {
      return ke(e) && !(this.isOptionDisabled(e) || this.isOptionGroup(e));
    },
    isValidSelectedOption: function(e) {
      return this.isValidOption(e) && this.isSelected(e);
    },
    isSelected: function(e) {
      return vn(this.d_value, this.getOptionValue(e), this.equalityKey);
    },
    findFirstOptionIndex: function() {
      var e = this;
      return this.visibleOptions.findIndex(function(n) {
        return e.isValidOption(n);
      });
    },
    findLastOptionIndex: function() {
      var e = this;
      return vt(this.visibleOptions, function(n) {
        return e.isValidOption(n);
      });
    },
    findNextOptionIndex: function(e) {
      var n = this, i = e < this.visibleOptions.length - 1 ? this.visibleOptions.slice(e + 1).findIndex(function(l) {
        return n.isValidOption(l);
      }) : -1;
      return i > -1 ? i + e + 1 : e;
    },
    findPrevOptionIndex: function(e) {
      var n = this, i = e > 0 ? vt(this.visibleOptions.slice(0, e), function(l) {
        return n.isValidOption(l);
      }) : -1;
      return i > -1 ? i : e;
    },
    findSelectedOptionIndex: function() {
      var e = this;
      return this.visibleOptions.findIndex(function(n) {
        return e.isValidSelectedOption(n);
      });
    },
    findFirstFocusedOptionIndex: function() {
      var e = this.findSelectedOptionIndex();
      return e < 0 ? this.findFirstOptionIndex() : e;
    },
    findLastFocusedOptionIndex: function() {
      var e = this.findSelectedOptionIndex();
      return e < 0 ? this.findLastOptionIndex() : e;
    },
    searchOptions: function(e, n) {
      var i = this;
      this.searchValue = (this.searchValue || "") + n;
      var l = -1, o = !1;
      return ke(this.searchValue) && (l = this.visibleOptions.findIndex(function(d) {
        return i.isOptionExactMatched(d);
      }), l === -1 && (l = this.visibleOptions.findIndex(function(d) {
        return i.isOptionStartsWith(d);
      })), l !== -1 && (o = !0), l === -1 && this.focusedOptionIndex === -1 && (l = this.findFirstFocusedOptionIndex()), l !== -1 && this.changeFocusedOptionIndex(e, l)), this.searchTimeout && clearTimeout(this.searchTimeout), this.searchTimeout = setTimeout(function() {
        i.searchValue = "", i.searchTimeout = null;
      }, 500), o;
    },
    changeFocusedOptionIndex: function(e, n) {
      this.focusedOptionIndex !== n && (this.focusedOptionIndex = n, this.scrollInView(), this.selectOnFocus && this.onOptionSelect(e, this.visibleOptions[n], !1));
    },
    scrollInView: function() {
      var e = this, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : -1;
      this.$nextTick(function() {
        var i = n !== -1 ? "".concat(e.$id, "_").concat(n) : e.focusedOptionId, l = Pt(e.list, 'li[id="'.concat(i, '"]'));
        l ? l.scrollIntoView && l.scrollIntoView({
          block: "nearest",
          inline: "nearest"
        }) : e.virtualScrollerDisabled || e.virtualScroller && e.virtualScroller.scrollToIndex(n !== -1 ? n : e.focusedOptionIndex);
      });
    },
    autoUpdateModel: function() {
      this.autoOptionFocus && (this.focusedOptionIndex = this.findFirstFocusedOptionIndex()), this.selectOnFocus && this.autoOptionFocus && !this.$filled && this.onOptionSelect(null, this.visibleOptions[this.focusedOptionIndex], !1);
    },
    updateModel: function(e, n) {
      this.writeValue(n, e), this.$emit("change", {
        originalEvent: e,
        value: n
      });
    },
    flatOptions: function(e) {
      var n = this;
      return (e || []).reduce(function(i, l, o) {
        i.push({
          optionGroup: l,
          group: !0,
          index: o
        });
        var d = n.getOptionGroupChildren(l);
        return d && d.forEach(function(u) {
          return i.push(u);
        }), i;
      }, []);
    },
    overlayRef: function(e) {
      this.overlay = e;
    },
    listRef: function(e, n) {
      this.list = e, n && n(e);
    },
    virtualScrollerRef: function(e) {
      this.virtualScroller = e;
    }
  },
  computed: {
    visibleOptions: function() {
      var e = this, n = this.optionGroupLabel ? this.flatOptions(this.options) : this.options || [];
      if (this.filterValue) {
        var i = gn.filter(n, this.searchFields, this.filterValue, this.filterMatchMode, this.filterLocale);
        if (this.optionGroupLabel) {
          var l = this.options || [], o = [];
          return l.forEach(function(d) {
            var u = e.getOptionGroupChildren(d), h = u.filter(function(k) {
              return i.includes(k);
            });
            h.length > 0 && o.push(Vt(Vt({}, d), {}, ve({}, typeof e.optionGroupChildren == "string" ? e.optionGroupChildren : "items", uo(h))));
          }), this.flatOptions(o);
        }
        return i;
      }
      return n;
    },
    // @deprecated use $filled instead
    hasSelectedOption: function() {
      return this.$filled;
    },
    label: function() {
      var e = this.findSelectedOptionIndex();
      return e !== -1 ? this.getOptionLabel(this.visibleOptions[e]) : this.placeholder || "p-emptylabel";
    },
    editableInputValue: function() {
      var e = this.findSelectedOptionIndex();
      return e !== -1 ? this.getOptionLabel(this.visibleOptions[e]) : this.d_value || "";
    },
    equalityKey: function() {
      return this.optionValue ? null : this.dataKey;
    },
    searchFields: function() {
      return this.filterFields || [this.optionLabel];
    },
    filterResultMessageText: function() {
      return ke(this.visibleOptions) ? this.filterMessageText.replaceAll("{0}", this.visibleOptions.length) : this.emptyFilterMessageText;
    },
    filterMessageText: function() {
      return this.filterMessage || this.$primevue.config.locale.searchMessage || "";
    },
    emptyFilterMessageText: function() {
      return this.emptyFilterMessage || this.$primevue.config.locale.emptySearchMessage || this.$primevue.config.locale.emptyFilterMessage || "";
    },
    emptyMessageText: function() {
      return this.emptyMessage || this.$primevue.config.locale.emptyMessage || "";
    },
    selectionMessageText: function() {
      return this.selectionMessage || this.$primevue.config.locale.selectionMessage || "";
    },
    emptySelectionMessageText: function() {
      return this.emptySelectionMessage || this.$primevue.config.locale.emptySelectionMessage || "";
    },
    selectedMessageText: function() {
      return this.$filled ? this.selectionMessageText.replaceAll("{0}", "1") : this.emptySelectionMessageText;
    },
    focusedOptionId: function() {
      return this.focusedOptionIndex !== -1 ? "".concat(this.$id, "_").concat(this.focusedOptionIndex) : null;
    },
    ariaSetSize: function() {
      var e = this;
      return this.visibleOptions.filter(function(n) {
        return !e.isOptionGroup(n);
      }).length;
    },
    isClearIconVisible: function() {
      return this.showClear && this.d_value != null && !this.disabled && !this.loading;
    },
    virtualScrollerDisabled: function() {
      return !this.virtualScrollerOptions;
    },
    containerDataP: function() {
      return me(ve({
        invalid: this.$invalid,
        disabled: this.disabled,
        focus: this.focused,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    },
    labelDataP: function() {
      return me(ve(ve({
        placeholder: !this.editable && this.label === this.placeholder,
        clearable: this.showClear,
        disabled: this.disabled,
        editable: this.editable
      }, this.size, this.size), "empty", !this.editable && !this.$slots.value && (this.label === "p-emptylabel" || this.label.length === 0)));
    },
    dropdownIconDataP: function() {
      return me(ve({}, this.size, this.size));
    },
    overlayDataP: function() {
      return me(ve({}, "portal-" + this.appendTo, "portal-" + this.appendTo));
    }
  },
  directives: {
    ripple: fn
  },
  components: {
    InputText: Zt,
    VirtualScroller: Jt,
    Portal: Tt,
    InputIcon: qt,
    IconField: Xt,
    TimesIcon: Wt,
    ChevronDownIcon: Nt,
    SpinnerIcon: at,
    SearchIcon: Gt,
    CheckIcon: Ut,
    BlankIcon: _t
  }
}, mo = ["id", "data-p"], bo = ["name", "id", "value", "placeholder", "tabindex", "disabled", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-invalid", "data-p"], yo = ["name", "id", "tabindex", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-invalid", "aria-disabled", "data-p"], wo = ["data-p"], ko = ["id"], Io = ["id"], So = ["id", "aria-label", "aria-selected", "aria-disabled", "aria-setsize", "aria-posinset", "onMousedown", "onMousemove", "data-p-selected", "data-p-focused", "data-p-disabled"];
function Co(t, e, n, i, l, o) {
  var d = oe("SpinnerIcon"), u = oe("InputText"), h = oe("SearchIcon"), k = oe("InputIcon"), b = oe("IconField"), $ = oe("CheckIcon"), I = oe("BlankIcon"), m = oe("VirtualScroller"), g = oe("Portal"), P = Ln("ripple");
  return c(), v("div", w({
    ref: "container",
    id: t.$id,
    class: t.cx("root"),
    onClick: e[12] || (e[12] = function() {
      return o.onContainerClick && o.onContainerClick.apply(o, arguments);
    }),
    "data-p": o.containerDataP
  }, t.ptmi("root")), [t.editable ? (c(), v("input", w({
    key: 0,
    ref: "focusInput",
    name: t.name,
    id: t.labelId || t.inputId,
    type: "text",
    class: [t.cx("label"), t.inputClass, t.labelClass],
    style: [t.inputStyle, t.labelStyle],
    value: o.editableInputValue,
    placeholder: t.placeholder,
    tabindex: t.disabled ? -1 : t.tabindex,
    disabled: t.disabled,
    autocomplete: "off",
    role: "combobox",
    "aria-label": t.ariaLabel,
    "aria-labelledby": t.ariaLabelledby,
    "aria-haspopup": "listbox",
    "aria-expanded": l.overlayVisible,
    "aria-controls": l.overlayVisible ? t.$id + "_list" : void 0,
    "aria-activedescendant": l.focused ? o.focusedOptionId : void 0,
    "aria-invalid": t.invalid || void 0,
    onFocus: e[0] || (e[0] = function() {
      return o.onFocus && o.onFocus.apply(o, arguments);
    }),
    onBlur: e[1] || (e[1] = function() {
      return o.onBlur && o.onBlur.apply(o, arguments);
    }),
    onKeydown: e[2] || (e[2] = function() {
      return o.onKeyDown && o.onKeyDown.apply(o, arguments);
    }),
    onInput: e[3] || (e[3] = function() {
      return o.onEditableInput && o.onEditableInput.apply(o, arguments);
    }),
    "data-p": o.labelDataP
  }, t.ptm("label")), null, 16, bo)) : (c(), v("span", w({
    key: 1,
    ref: "focusInput",
    name: t.name,
    id: t.labelId || t.inputId,
    class: [t.cx("label"), t.inputClass, t.labelClass],
    style: [t.inputStyle, t.labelStyle],
    tabindex: t.disabled ? -1 : t.tabindex,
    role: "combobox",
    "aria-label": t.ariaLabel || (o.label === "p-emptylabel" ? void 0 : o.label),
    "aria-labelledby": t.ariaLabelledby,
    "aria-haspopup": "listbox",
    "aria-expanded": l.overlayVisible,
    "aria-controls": t.$id + "_list",
    "aria-activedescendant": l.focused ? o.focusedOptionId : void 0,
    "aria-invalid": t.invalid || void 0,
    "aria-disabled": t.disabled,
    onFocus: e[4] || (e[4] = function() {
      return o.onFocus && o.onFocus.apply(o, arguments);
    }),
    onBlur: e[5] || (e[5] = function() {
      return o.onBlur && o.onBlur.apply(o, arguments);
    }),
    onKeydown: e[6] || (e[6] = function() {
      return o.onKeyDown && o.onKeyDown.apply(o, arguments);
    }),
    "data-p": o.labelDataP
  }, t.ptm("label")), [K(t.$slots, "value", {
    value: t.d_value,
    placeholder: t.placeholder
  }, function() {
    var M;
    return [A(E(o.label === "p-emptylabel" ? " " : (M = o.label) !== null && M !== void 0 ? M : "empty"), 1)];
  })], 16, yo)), o.isClearIconVisible ? K(t.$slots, "clearicon", {
    key: 2,
    class: te(t.cx("clearIcon")),
    clearCallback: o.onClearClick
  }, function() {
    return [(c(), se(mt(t.clearIcon ? "i" : "TimesIcon"), w({
      ref: "clearIcon",
      class: [t.cx("clearIcon"), t.clearIcon],
      onClick: o.onClearClick
    }, t.ptm("clearIcon"), {
      "data-pc-section": "clearicon"
    }), null, 16, ["class", "onClick"]))];
  }) : F("", !0), r("div", w({
    class: t.cx("dropdown")
  }, t.ptm("dropdown")), [t.loading ? K(t.$slots, "loadingicon", {
    key: 0,
    class: te(t.cx("loadingIcon"))
  }, function() {
    return [t.loadingIcon ? (c(), v("span", w({
      key: 0,
      class: [t.cx("loadingIcon"), "pi-spin", t.loadingIcon],
      "aria-hidden": "true"
    }, t.ptm("loadingIcon")), null, 16)) : (c(), se(d, w({
      key: 1,
      class: t.cx("loadingIcon"),
      spin: "",
      "aria-hidden": "true"
    }, t.ptm("loadingIcon")), null, 16, ["class"]))];
  }) : K(t.$slots, "dropdownicon", {
    key: 1,
    class: te(t.cx("dropdownIcon"))
  }, function() {
    return [(c(), se(mt(t.dropdownIcon ? "span" : "ChevronDownIcon"), w({
      class: [t.cx("dropdownIcon"), t.dropdownIcon],
      "aria-hidden": "true",
      "data-p": o.dropdownIconDataP
    }, t.ptm("dropdownIcon")), null, 16, ["class", "data-p"]))];
  })], 16), S(g, {
    appendTo: t.appendTo
  }, {
    default: he(function() {
      return [S(Kt, w({
        name: "p-anchored-overlay",
        onEnter: o.onOverlayEnter,
        onAfterEnter: o.onOverlayAfterEnter,
        onLeave: o.onOverlayLeave,
        onAfterLeave: o.onOverlayAfterLeave
      }, t.ptm("transition")), {
        default: he(function() {
          return [l.overlayVisible ? (c(), v("div", w({
            key: 0,
            ref: o.overlayRef,
            class: [t.cx("overlay"), t.panelClass, t.overlayClass],
            style: [t.panelStyle, t.overlayStyle],
            onClick: e[10] || (e[10] = function() {
              return o.onOverlayClick && o.onOverlayClick.apply(o, arguments);
            }),
            onKeydown: e[11] || (e[11] = function() {
              return o.onOverlayKeyDown && o.onOverlayKeyDown.apply(o, arguments);
            }),
            "data-p": o.overlayDataP
          }, t.ptm("overlay")), [r("span", w({
            ref: "firstHiddenFocusableElementOnOverlay",
            role: "presentation",
            "aria-hidden": "true",
            class: "p-hidden-accessible p-hidden-focusable",
            tabindex: 0,
            onFocus: e[7] || (e[7] = function() {
              return o.onFirstHiddenFocus && o.onFirstHiddenFocus.apply(o, arguments);
            })
          }, t.ptm("hiddenFirstFocusableEl"), {
            "data-p-hidden-accessible": !0,
            "data-p-hidden-focusable": !0
          }), null, 16), K(t.$slots, "header", {
            value: t.d_value,
            options: o.visibleOptions
          }), t.filter ? (c(), v("div", w({
            key: 0,
            class: t.cx("header")
          }, t.ptm("header")), [S(b, {
            unstyled: t.unstyled,
            pt: t.ptm("pcFilterContainer")
          }, {
            default: he(function() {
              return [S(u, {
                ref: "filterInput",
                type: "text",
                value: l.filterValue,
                onVnodeMounted: o.onFilterUpdated,
                onVnodeUpdated: o.onFilterUpdated,
                class: te(t.cx("pcFilter")),
                placeholder: t.filterPlaceholder,
                variant: t.variant,
                unstyled: t.unstyled,
                role: "searchbox",
                autocomplete: "off",
                "aria-owns": t.$id + "_list",
                "aria-activedescendant": o.focusedOptionId,
                onKeydown: o.onFilterKeyDown,
                onBlur: o.onFilterBlur,
                onInput: o.onFilterChange,
                pt: t.ptm("pcFilter"),
                formControl: {
                  novalidate: !0
                }
              }, null, 8, ["value", "onVnodeMounted", "onVnodeUpdated", "class", "placeholder", "variant", "unstyled", "aria-owns", "aria-activedescendant", "onKeydown", "onBlur", "onInput", "pt"]), S(k, {
                unstyled: t.unstyled,
                pt: t.ptm("pcFilterIconContainer")
              }, {
                default: he(function() {
                  return [K(t.$slots, "filtericon", {}, function() {
                    return [t.filterIcon ? (c(), v("span", w({
                      key: 0,
                      class: t.filterIcon
                    }, t.ptm("filterIcon")), null, 16)) : (c(), se(h, xn(w({
                      key: 1
                    }, t.ptm("filterIcon"))), null, 16))];
                  })];
                }),
                _: 3
              }, 8, ["unstyled", "pt"])];
            }),
            _: 3
          }, 8, ["unstyled", "pt"]), r("span", w({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, t.ptm("hiddenFilterResult"), {
            "data-p-hidden-accessible": !0
          }), E(o.filterResultMessageText), 17)], 16)) : F("", !0), r("div", w({
            class: t.cx("listContainer"),
            style: {
              "max-height": o.virtualScrollerDisabled ? t.scrollHeight : ""
            }
          }, t.ptm("listContainer")), [S(m, w({
            ref: o.virtualScrollerRef
          }, t.virtualScrollerOptions, {
            items: o.visibleOptions,
            style: {
              height: t.scrollHeight
            },
            tabindex: -1,
            disabled: o.virtualScrollerDisabled,
            pt: t.ptm("virtualScroller")
          }), $n({
            content: he(function(M) {
              var x = M.styleClass, j = M.contentRef, _ = M.items, C = M.getItemOptions, Z = M.contentStyle, D = M.itemSize;
              return [r("ul", w({
                ref: function(H) {
                  return o.listRef(H, j);
                },
                id: t.$id + "_list",
                class: [t.cx("list"), x],
                style: Z,
                role: "listbox"
              }, t.ptm("list")), [(c(!0), v(J, null, fe(_, function(T, H) {
                return c(), v(J, {
                  key: o.getOptionRenderKey(T, o.getOptionIndex(H, C))
                }, [o.isOptionGroup(T) ? (c(), v("li", w({
                  key: 0,
                  id: t.$id + "_" + o.getOptionIndex(H, C),
                  style: {
                    height: D ? D + "px" : void 0
                  },
                  class: t.cx("optionGroup"),
                  role: "option"
                }, {
                  ref_for: !0
                }, t.ptm("optionGroup")), [K(t.$slots, "optiongroup", {
                  option: T.optionGroup,
                  index: o.getOptionIndex(H, C)
                }, function() {
                  return [r("span", w({
                    class: t.cx("optionGroupLabel")
                  }, {
                    ref_for: !0
                  }, t.ptm("optionGroupLabel")), E(o.getOptionGroupLabel(T.optionGroup)), 17)];
                })], 16, Io)) : We((c(), v("li", w({
                  key: 1,
                  id: t.$id + "_" + o.getOptionIndex(H, C),
                  class: t.cx("option", {
                    option: T,
                    focusedOption: o.getOptionIndex(H, C)
                  }),
                  style: {
                    height: D ? D + "px" : void 0
                  },
                  role: "option",
                  "aria-label": o.getOptionLabel(T),
                  "aria-selected": o.isSelected(T),
                  "aria-disabled": o.isOptionDisabled(T),
                  "aria-setsize": o.ariaSetSize,
                  "aria-posinset": o.getAriaPosInset(o.getOptionIndex(H, C)),
                  onMousedown: function(G) {
                    return o.onOptionSelect(G, T);
                  },
                  onMousemove: function(G) {
                    return o.onOptionMouseMove(G, o.getOptionIndex(H, C));
                  },
                  onClick: e[8] || (e[8] = pe(function() {
                  }, ["stop"])),
                  "data-p-selected": !t.checkmark && o.isSelected(T),
                  "data-p-focused": l.focusedOptionIndex === o.getOptionIndex(H, C),
                  "data-p-disabled": o.isOptionDisabled(T)
                }, {
                  ref_for: !0
                }, o.getPTItemOptions(T, C, H, "option")), [t.checkmark ? (c(), v(J, {
                  key: 0
                }, [o.isSelected(T) ? (c(), se($, w({
                  key: 0,
                  class: t.cx("optionCheckIcon")
                }, {
                  ref_for: !0
                }, t.ptm("optionCheckIcon")), null, 16, ["class"])) : (c(), se(I, w({
                  key: 1,
                  class: t.cx("optionBlankIcon")
                }, {
                  ref_for: !0
                }, t.ptm("optionBlankIcon")), null, 16, ["class"]))], 64)) : F("", !0), K(t.$slots, "option", {
                  option: T,
                  selected: o.isSelected(T),
                  index: o.getOptionIndex(H, C)
                }, function() {
                  return [r("span", w({
                    class: t.cx("optionLabel")
                  }, {
                    ref_for: !0
                  }, t.ptm("optionLabel")), E(o.getOptionLabel(T)), 17)];
                })], 16, So)), [[P]])], 64);
              }), 128)), l.filterValue && (!_ || _ && _.length === 0) ? (c(), v("li", w({
                key: 0,
                class: t.cx("emptyMessage"),
                role: "option"
              }, t.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [K(t.$slots, "emptyfilter", {}, function() {
                return [A(E(o.emptyFilterMessageText), 1)];
              })], 16)) : !t.options || t.options && t.options.length === 0 ? (c(), v("li", w({
                key: 1,
                class: t.cx("emptyMessage"),
                role: "option"
              }, t.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [K(t.$slots, "empty", {}, function() {
                return [A(E(o.emptyMessageText), 1)];
              })], 16)) : F("", !0)], 16, ko)];
            }),
            _: 2
          }, [t.$slots.loader ? {
            name: "loader",
            fn: he(function(M) {
              var x = M.options;
              return [K(t.$slots, "loader", {
                options: x
              })];
            }),
            key: "0"
          } : void 0]), 1040, ["items", "style", "disabled", "pt"])], 16), K(t.$slots, "footer", {
            value: t.d_value,
            options: o.visibleOptions
          }), !t.options || t.options && t.options.length === 0 ? (c(), v("span", w({
            key: 1,
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, t.ptm("hiddenEmptyMessage"), {
            "data-p-hidden-accessible": !0
          }), E(o.emptyMessageText), 17)) : F("", !0), r("span", w({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, t.ptm("hiddenSelectedMessage"), {
            "data-p-hidden-accessible": !0
          }), E(o.selectedMessageText), 17), r("span", w({
            ref: "lastHiddenFocusableElementOnOverlay",
            role: "presentation",
            "aria-hidden": "true",
            class: "p-hidden-accessible p-hidden-focusable",
            tabindex: 0,
            onFocus: e[9] || (e[9] = function() {
              return o.onLastHiddenFocus && o.onLastHiddenFocus.apply(o, arguments);
            })
          }, t.ptm("hiddenLastFocusableEl"), {
            "data-p-hidden-accessible": !0,
            "data-p-hidden-focusable": !0
          }), null, 16)], 16, wo)) : F("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onLeave", "onAfterLeave"])];
    }),
    _: 3
  }, 8, ["appendTo"])], 16, mo);
}
$e.render = Co;
var Oo = `
    .p-textarea {
        font-family: inherit;
        font-feature-settings: inherit;
        font-size: 1rem;
        color: dt('textarea.color');
        background: dt('textarea.background');
        padding-block: dt('textarea.padding.y');
        padding-inline: dt('textarea.padding.x');
        border: 1px solid dt('textarea.border.color');
        transition:
            background dt('textarea.transition.duration'),
            color dt('textarea.transition.duration'),
            border-color dt('textarea.transition.duration'),
            outline-color dt('textarea.transition.duration'),
            box-shadow dt('textarea.transition.duration');
        appearance: none;
        border-radius: dt('textarea.border.radius');
        outline-color: transparent;
        box-shadow: dt('textarea.shadow');
    }

    .p-textarea:enabled:hover {
        border-color: dt('textarea.hover.border.color');
    }

    .p-textarea:enabled:focus {
        border-color: dt('textarea.focus.border.color');
        box-shadow: dt('textarea.focus.ring.shadow');
        outline: dt('textarea.focus.ring.width') dt('textarea.focus.ring.style') dt('textarea.focus.ring.color');
        outline-offset: dt('textarea.focus.ring.offset');
    }

    .p-textarea.p-invalid {
        border-color: dt('textarea.invalid.border.color');
    }

    .p-textarea.p-variant-filled {
        background: dt('textarea.filled.background');
    }

    .p-textarea.p-variant-filled:enabled:hover {
        background: dt('textarea.filled.hover.background');
    }

    .p-textarea.p-variant-filled:enabled:focus {
        background: dt('textarea.filled.focus.background');
    }

    .p-textarea:disabled {
        opacity: 1;
        background: dt('textarea.disabled.background');
        color: dt('textarea.disabled.color');
    }

    .p-textarea::placeholder {
        color: dt('textarea.placeholder.color');
    }

    .p-textarea.p-invalid::placeholder {
        color: dt('textarea.invalid.placeholder.color');
    }

    .p-textarea-fluid {
        width: 100%;
    }

    .p-textarea-resizable {
        overflow: hidden;
        resize: none;
    }

    .p-textarea-sm {
        font-size: dt('textarea.sm.font.size');
        padding-block: dt('textarea.sm.padding.y');
        padding-inline: dt('textarea.sm.padding.x');
    }

    .p-textarea-lg {
        font-size: dt('textarea.lg.font.size');
        padding-block: dt('textarea.lg.padding.y');
        padding-inline: dt('textarea.lg.padding.x');
    }
`, Lo = {
  root: function(e) {
    var n = e.instance, i = e.props;
    return ["p-textarea p-component", {
      "p-filled": n.$filled,
      "p-textarea-resizable ": i.autoResize,
      "p-textarea-sm p-inputfield-sm": i.size === "small",
      "p-textarea-lg p-inputfield-lg": i.size === "large",
      "p-invalid": n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-textarea-fluid": n.$fluid
    }];
  }
}, xo = ge.extend({
  name: "textarea",
  style: Oo,
  classes: Lo
}), $o = {
  name: "BaseTextarea",
  extends: st,
  props: {
    autoResize: Boolean
  },
  style: xo,
  provide: function() {
    return {
      $pcTextarea: this,
      $parentInstance: this
    };
  }
};
function Fe(t) {
  "@babel/helpers - typeof";
  return Fe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Fe(t);
}
function Vo(t, e, n) {
  return (e = zo(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function zo(t) {
  var e = Mo(t, "string");
  return Fe(e) == "symbol" ? e : e + "";
}
function Mo(t, e) {
  if (Fe(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(t, e);
    if (Fe(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Qt = {
  name: "Textarea",
  extends: $o,
  inheritAttrs: !1,
  observer: null,
  mounted: function() {
    var e = this;
    this.autoResize && (this.observer = new ResizeObserver(function() {
      requestAnimationFrame(function() {
        e.resize();
      });
    }), this.observer.observe(this.$el));
  },
  updated: function() {
    this.autoResize && this.resize();
  },
  beforeUnmount: function() {
    this.observer && this.observer.disconnect();
  },
  methods: {
    resize: function() {
      if (this.$el.offsetParent) {
        var e = this.$el.style.height, n = parseInt(e) || 0, i = this.$el.scrollHeight, l = !n || i > n, o = n && i < n;
        o ? (this.$el.style.height = "auto", this.$el.style.height = "".concat(this.$el.scrollHeight, "px")) : l && (this.$el.style.height = "".concat(i, "px"));
      }
    },
    onInput: function(e) {
      this.autoResize && this.resize(), this.writeValue(e.target.value, e);
    }
  },
  computed: {
    attrs: function() {
      return w(this.ptmi("root", {
        context: {
          filled: this.$filled,
          disabled: this.disabled
        }
      }), this.formField);
    },
    dataP: function() {
      return me(Vo({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, To = ["value", "name", "disabled", "aria-invalid", "data-p"];
function Fo(t, e, n, i, l, o) {
  return c(), v("textarea", w({
    class: t.cx("root"),
    value: t.d_value,
    name: t.name,
    disabled: t.disabled,
    "aria-invalid": t.invalid || void 0,
    "data-p": o.dataP,
    onInput: e[0] || (e[0] = function() {
      return o.onInput && o.onInput.apply(o, arguments);
    })
  }, o.attrs), null, 16, To);
}
Qt.render = Fo;
var Ho = `
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
`, Ao = {
  root: {
    position: "relative"
  }
}, Do = {
  root: function(e) {
    var n = e.instance, i = e.props;
    return ["p-toggleswitch p-component", {
      "p-toggleswitch-checked": n.checked,
      "p-disabled": i.disabled,
      "p-invalid": n.$invalid
    }];
  },
  input: "p-toggleswitch-input",
  slider: "p-toggleswitch-slider",
  handle: "p-toggleswitch-handle"
}, Bo = ge.extend({
  name: "toggleswitch",
  style: Ho,
  classes: Do,
  inlineStyles: Ao
}), Po = {
  name: "BaseToggleSwitch",
  extends: ot,
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
  style: Bo,
  provide: function() {
    return {
      $pcToggleSwitch: this,
      $parentInstance: this
    };
  }
}, Pe = {
  name: "ToggleSwitch",
  extends: Po,
  inheritAttrs: !1,
  emits: ["change", "focus", "blur"],
  methods: {
    getPTOptions: function(e) {
      var n = e === "root" ? this.ptmi : this.ptm;
      return n(e, {
        context: {
          checked: this.checked,
          disabled: this.disabled
        }
      });
    },
    onChange: function(e) {
      if (!this.disabled && !this.readonly) {
        var n = this.checked ? this.falseValue : this.trueValue;
        this.writeValue(n, e), this.$emit("change", e);
      }
    },
    onFocus: function(e) {
      this.$emit("focus", e);
    },
    onBlur: function(e) {
      var n, i;
      this.$emit("blur", e), (n = (i = this.formField).onBlur) === null || n === void 0 || n.call(i, e);
    }
  },
  computed: {
    checked: function() {
      return this.d_value === this.trueValue;
    },
    dataP: function() {
      return me({
        checked: this.checked,
        disabled: this.disabled,
        invalid: this.$invalid
      });
    }
  }
}, Eo = ["data-p-checked", "data-p-disabled", "data-p"], Ro = ["id", "checked", "tabindex", "disabled", "readonly", "aria-checked", "aria-labelledby", "aria-label", "aria-invalid"], Ko = ["data-p"], jo = ["data-p"];
function _o(t, e, n, i, l, o) {
  return c(), v("div", w({
    class: t.cx("root"),
    style: t.sx("root")
  }, o.getPTOptions("root"), {
    "data-p-checked": o.checked,
    "data-p-disabled": t.disabled,
    "data-p": o.dataP
  }), [r("input", w({
    id: t.inputId,
    type: "checkbox",
    role: "switch",
    class: [t.cx("input"), t.inputClass],
    style: t.inputStyle,
    checked: o.checked,
    tabindex: t.tabindex,
    disabled: t.disabled,
    readonly: t.readonly,
    "aria-checked": o.checked,
    "aria-labelledby": t.ariaLabelledby,
    "aria-label": t.ariaLabel,
    "aria-invalid": t.invalid || void 0,
    onFocus: e[0] || (e[0] = function() {
      return o.onFocus && o.onFocus.apply(o, arguments);
    }),
    onBlur: e[1] || (e[1] = function() {
      return o.onBlur && o.onBlur.apply(o, arguments);
    }),
    onChange: e[2] || (e[2] = function() {
      return o.onChange && o.onChange.apply(o, arguments);
    })
  }, o.getPTOptions("input")), null, 16, Ro), r("div", w({
    class: t.cx("slider")
  }, o.getPTOptions("slider"), {
    "data-p": o.dataP
  }), [r("div", w({
    class: t.cx("handle")
  }, o.getPTOptions("handle"), {
    "data-p": o.dataP
  }), [K(t.$slots, "handle", {
    checked: o.checked
  })], 16, jo)], 16, Ko)], 16, Eo);
}
Pe.render = _o;
const Re = new Tn({ html: !1, linkify: !0 }), Uo = Re.validateLink.bind(Re);
Re.validateLink = (t) => {
  if (t.startsWith("//") || t.includes("\\") || !Uo(t)) return !1;
  const e = /^[a-z][a-z0-9+.-]*:/i.exec(t)?.[0].toLowerCase();
  return e === void 0 || e === "http:" || e === "https:" || e === "mailto:";
};
function No(t) {
  return Re.render(t);
}
function Go(t, e) {
  if (t.button !== 0 || t.defaultPrevented || t.metaKey || t.ctrlKey || t.altKey || t.shiftKey) return;
  const i = (t.target instanceof Element ? t.target.closest("a[href]") : null)?.getAttribute("href");
  i?.startsWith("/") && !i.startsWith("//") && (t.preventDefault(), e(i));
}
const Wo = {
  class: "ap-card chat-appearance",
  "aria-labelledby": "chat-appearance-heading"
}, Xo = { class: "chat-settings chat-nav-settings" }, qo = {
  class: "chat-settings-title",
  "aria-hidden": "true"
}, Zo = { class: "chat-settings-icon" }, Yo = { class: "chat-nav-controls" }, Jo = { class: "chat-nav-visibility" }, Qo = { class: "chat-field chat-placement" }, el = { class: "chat-profile-grid" }, tl = { class: "chat-settings-legend" }, nl = {
  class: "chat-settings-title",
  "aria-hidden": "true"
}, il = { class: "chat-settings-icon" }, ol = { class: "chat-setting-toggles" }, ll = { class: "chat-setting-toggle" }, rl = ["for"], al = { class: "chat-setting-toggle" }, sl = ["for"], dl = { class: "chat-intro-options" }, ul = { class: "chat-field" }, cl = ["id"], pl = {
  key: 0,
  class: "chat-field"
}, hl = ["id"], fl = { class: "chat-field" }, gl = { class: "chat-preview" }, vl = ["data-alignment", "innerHTML"], ml = { class: "chat-field" }, bl = ["id"], yl = {
  key: 1,
  class: "chat-field"
}, wl = ["^selected", "onChange"], kl = {
  key: 2,
  class: "chat-field"
}, Il = ["^selected", "onChange"], Sl = /* @__PURE__ */ it({
  __name: "ChatAppearance",
  props: {
    modelValue: { required: !0 },
    modelModifiers: {}
  },
  emits: ["update:modelValue"],
  setup(t) {
    const e = Vn(t, "modelValue"), n = [
      { key: "sessions", label: "Sessions page", icon: "tabler:messages" },
      { key: "sidebar", label: "Sidebar chat", icon: "tabler:layout-sidebar-right" }
    ], i = [{ label: "First", value: "first" }, { label: "Last", value: "last" }], l = [
      { label: "Default", value: "default" },
      { label: "Custom Markdown", value: "markdown" },
      { label: "Hidden", value: "hidden" }
    ], o = [
      { label: "Left", value: "left" },
      { label: "Center", value: "center" },
      { label: "Right", value: "right" }
    ], d = [{ label: "All available agents", value: "all" }, { label: "Selected agents", value: "selected" }], u = ee(() => Object.fromEntries(n.map(({ key: I }) => {
      const m = e.value[I];
      return [I, m.intro === "markdown" ? No(m.markdown) : ""];
    })));
    function h(I) {
      const m = I.detail?.selected;
      return Array.isArray(m) ? m.filter((g) => typeof g == "string") : void 0;
    }
    function k(I, m) {
      m ? I.allowed_agents = I.default_agent ? [I.default_agent] : [] : delete I.allowed_agents;
    }
    function b(I, m) {
      const g = h(m);
      g && (I.allowed_agents = g);
    }
    function $(I, m) {
      const g = h(m);
      g?.[0] ? I.default_agent = g[0] : g && delete I.default_agent;
    }
    return (I, m) => (c(), v("section", Wo, [
      m[11] || (m[11] = r("h2", {
        id: "chat-appearance-heading",
        class: "ap-h"
      }, "Chat", -1)),
      r("fieldset", Xo, [
        m[6] || (m[6] = r("legend", { class: "chat-settings-legend" }, "Main navigation", -1)),
        r("div", qo, [
          r("span", Zo, [
            S(s(z), { icon: "tabler:menu-2" })
          ]),
          m[3] || (m[3] = A(" Main navigation ", -1))
        ]),
        r("div", Yo, [
          r("div", Jo, [
            S(s(Pe), {
              modelValue: e.value.navigation.visible,
              "onUpdate:modelValue": m[0] || (m[0] = (g) => e.value.navigation.visible = g),
              "input-id": "chat-nav-visible"
            }, null, 8, ["modelValue"]),
            m[4] || (m[4] = r("label", { for: "chat-nav-visible" }, "Show New chat", -1))
          ]),
          r("div", Qo, [
            m[5] || (m[5] = r("span", { id: "chat-placement-label" }, "Placement", -1)),
            S(s($e), {
              modelValue: e.value.navigation.placement,
              "onUpdate:modelValue": m[1] || (m[1] = (g) => e.value.navigation.placement = g),
              options: i,
              "option-label": "label",
              "option-value": "value",
              disabled: !e.value.navigation.visible,
              "aria-labelledby": "chat-placement-label",
              fluid: ""
            }, null, 8, ["modelValue", "disabled"])
          ])
        ])
      ]),
      r("div", el, [
        (c(), v(J, null, fe(n, ({ key: g, label: P, icon: M }) => r("fieldset", {
          key: g,
          class: "chat-settings"
        }, [
          r("legend", tl, E(P), 1),
          r("div", nl, [
            r("span", il, [
              S(s(z), { icon: M }, null, 8, ["icon"])
            ]),
            A(" " + E(P), 1)
          ]),
          r("div", ol, [
            r("div", ll, [
              r("label", {
                for: `chat-${g}-message`
              }, "Show message field", 8, rl),
              S(s(Pe), {
                modelValue: e.value[g].show_message,
                "onUpdate:modelValue": (x) => e.value[g].show_message = x,
                "input-id": `chat-${g}-message`
              }, null, 8, ["modelValue", "onUpdate:modelValue", "input-id"])
            ]),
            r("div", al, [
              r("label", {
                for: `chat-${g}-picker`
              }, "Show agent picker", 8, sl),
              S(s(Pe), {
                modelValue: e.value[g].show_agent_picker,
                "onUpdate:modelValue": (x) => e.value[g].show_agent_picker = x,
                "input-id": `chat-${g}-picker`
              }, null, 8, ["modelValue", "onUpdate:modelValue", "input-id"])
            ])
          ]),
          r("div", dl, [
            r("div", ul, [
              r("span", {
                id: `chat-${g}-intro-label`
              }, "Intro", 8, cl),
              S(s($e), {
                modelValue: e.value[g].intro,
                "onUpdate:modelValue": (x) => e.value[g].intro = x,
                options: l,
                "option-label": "label",
                "option-value": "value",
                "aria-labelledby": `chat-${g}-intro-label`,
                fluid: ""
              }, null, 8, ["modelValue", "onUpdate:modelValue", "aria-labelledby"])
            ]),
            e.value[g].intro === "markdown" ? (c(), v("div", pl, [
              r("span", {
                id: `chat-${g}-alignment-label`
              }, "Text alignment", 8, hl),
              S(s($e), {
                modelValue: e.value[g].markdown_alignment,
                "onUpdate:modelValue": (x) => e.value[g].markdown_alignment = x,
                options: o,
                "option-label": "label",
                "option-value": "value",
                "aria-labelledby": `chat-${g}-alignment-label`,
                fluid: ""
              }, null, 8, ["modelValue", "onUpdate:modelValue", "aria-labelledby"])
            ])) : F("", !0)
          ]),
          e.value[g].intro === "markdown" ? (c(), v(J, { key: 0 }, [
            r("label", fl, [
              m[7] || (m[7] = r("span", null, "Intro Markdown", -1)),
              S(s(Qt), {
                modelValue: e.value[g].markdown,
                "onUpdate:modelValue": (x) => e.value[g].markdown = x,
                rows: "4",
                fluid: ""
              }, null, 8, ["modelValue", "onUpdate:modelValue"])
            ]),
            r("details", gl, [
              m[8] || (m[8] = r("summary", null, "Preview intro", -1)),
              r("div", {
                class: "kx-chat-intro-markdown",
                "data-alignment": e.value[g].markdown_alignment,
                innerHTML: u.value[g],
                onClick: m[2] || (m[2] = (x) => s(Go)(x, s(Be).navigate))
              }, null, 8, vl)
            ])
          ], 64)) : F("", !0),
          r("div", ml, [
            r("span", {
              id: `chat-${g}-available-label`
            }, "Available agents", 8, bl),
            S(s($e), {
              "model-value": e.value[g].allowed_agents === void 0 ? "all" : "selected",
              options: d,
              "option-label": "label",
              "option-value": "value",
              "aria-labelledby": `chat-${g}-available-label`,
              fluid: "",
              "onUpdate:modelValue": (x) => k(e.value[g], x === "selected")
            }, null, 8, ["model-value", "aria-labelledby", "onUpdate:modelValue"])
          ]),
          e.value[g].allowed_agents ? (c(), v("div", yl, [
            m[9] || (m[9] = r("span", null, "Allowed agents", -1)),
            r("wc-agent-picker", {
              "^selected": JSON.stringify(e.value[g].allowed_agents),
              placeholder: "Search for agents to allow",
              onChange: pe((x) => b(e.value[g], x), ["stop"])
            }, null, 40, wl)
          ])) : F("", !0),
          e.value[g].show_agent_picker ? F("", !0) : (c(), v("div", kl, [
            m[10] || (m[10] = r("span", null, "Default agent", -1)),
            r("wc-agent-picker", {
              multi: "false",
              "^selected": JSON.stringify(e.value[g].default_agent ? [e.value[g].default_agent] : []),
              placeholder: "Select the default agent",
              onChange: pe((x) => $(e.value[g], x), ["stop"])
            }, null, 40, Il)
          ]))
        ])), 64))
      ])
    ]));
  }
});
function zt(t) {
  return { intro: "default", markdown: "", markdown_alignment: "left", show_message: t === "sessions", show_agent_picker: !0 };
}
function Mt(t) {
  return {
    navigation: { visible: !0, placement: "first", ...t?.navigation },
    sessions: { ...zt("sessions"), ...t?.sessions },
    sidebar: { ...zt("sidebar"), ...t?.sidebar }
  };
}
function Cl(t) {
  for (const [e, n] of [["Sessions page", t.sessions], ["Sidebar chat", t.sidebar]]) {
    if (n.intro === "markdown" && !n.markdown.trim()) return e + " needs a Markdown intro.";
    if (new TextEncoder().encode(n.markdown).byteLength > 32768) return e + " intro exceeds 32 KiB.";
    if (n.allowed_agents && (n.allowed_agents.length === 0 || n.allowed_agents.length > 100))
      return e + " needs between 1 and 100 selected agents.";
    if (!n.show_agent_picker) {
      if (!n.default_agent) return e + " needs a default agent.";
      if (n.allowed_agents && !n.allowed_agents.includes(n.default_agent))
        return e + " must include the default agent in its selected agents.";
    }
  }
  return "";
}
const Ol = { class: "ap" }, Ll = { class: "ap-body" }, xl = { class: "ap-bar" }, $l = {
  key: 0,
  class: "ap-dirty ap-dirty-warn"
}, Vl = {
  key: 1,
  class: "ap-dirty ap-dirty-warn",
  role: "status"
}, zl = {
  key: 2,
  class: "ap-dirty"
}, Ml = ["disabled"], Tl = ["disabled"], Fl = {
  key: 0,
  class: "ap-msg ap-err"
}, Hl = {
  key: 1,
  class: "ap-loading"
}, Al = {
  key: 2,
  class: "ap-grid"
}, Dl = { class: "ap-side" }, Bl = { class: "ap-card" }, Pl = { class: "ap-h" }, El = { class: "ap-logo" }, Rl = { class: "ap-logo-prev" }, Kl = ["src"], jl = { class: "ap-logo-actions" }, _l = ["accept", "disabled"], Ul = { class: "ap-hint" }, Nl = { class: "ap-tone" }, Gl = ["placeholder"], Wl = {
  key: 0,
  class: "ap-tone-warn",
  role: "alert"
}, Xl = {
  class: "ap-theme-modes",
  role: "group",
  "aria-label": "Color scheme"
}, ql = ["aria-pressed", "onClick"], Zl = { class: "ap-card" }, Yl = { class: "ap-h" }, Jl = { class: "ap-layouts" }, Ql = { class: "ap-lo-name" }, er = { class: "ap-lo-name" }, tr = { class: "ap-card ap-legend" }, nr = { class: "ap-h" }, ir = { class: "ap-tips" }, or = { class: "ap-content" }, lr = { class: "ap-card ap-structure" }, rr = { class: "ap-h" }, ar = ["onDragover", "onDragleave", "onDrop"], sr = ["onDrop"], dr = ["onDragstart"], ur = {
  key: 1,
  class: "ap-grip ap-grip-ghost",
  "aria-hidden": "true"
}, cr = ["value", "onInput"], pr = { class: "ap-tile ap-tile-muted" }, hr = { class: "ap-field ap-field-strong ap-field-static" }, fr = { class: "ap-count" }, gr = ["onClick"], vr = {
  key: 0,
  class: "ap-drop-hint"
}, mr = ["onDrop"], br = ["onDragstart"], yr = ["value", "onInput"], wr = { class: "ap-path" }, kr = {
  key: 0,
  class: "ap-pill kx-tag-sm"
}, Ir = {
  key: 1,
  class: "ap-pill kx-tag-sm ap-pill-home"
}, Sr = ["aria-label", "title", "onClick"], Cr = ["onClick"], Or = {
  key: 0,
  class: "ap-hidden"
}, Lr = {
  key: 0,
  class: "ap-hidden-list"
}, xr = { class: "ap-tile" }, $r = { class: "ap-field ap-field-strong ap-field-static" }, Vr = ["onClick"], zr = /* @__PURE__ */ it({
  __name: "appearance",
  setup(t) {
    const e = R(!0), n = R(!1), i = R("");
    function l(L, a) {
      return L?.response?.data?.error || L?.message || a;
    }
    const o = R("vertical"), d = R(Be.getThemeMode?.() ?? "auto"), u = R([]), h = R([]), k = R({}), b = R(!1), $ = R(""), I = R(""), m = R(), g = ee(() => m.value?.formats.flatMap((L) => [L.mime, ...L.extensions.map((a) => `.${a}`)]).join(",")), P = ee(() => m.value ? `${m.value.formats.map((L) => L.label).join(", ")} · up to ${m.value.max_bytes / 1048576} MB.` : ""), M = Yn({ logoUrl: I, error: i, apiError: l }), { uploadingLogo: x, uploadLogo: j, removeLogo: _ } = M, C = R(""), Z = R(It), D = ee({
      // PrimeVue's <ColorPicker format="hex"> exchanges a BARE rrggbb string, while the stored
      // setting and the hex text field both keep the #-prefixed form — so strip on the way in
      // and re-add on the way out. Falling back to defaultTone keeps the swatch showing the live
      // theme tone while the setting is unset.
      get: () => (C.value || Z.value).trim().replace(/^#/, ""),
      set: (L) => {
        const a = String(L ?? "").replace(/^#/, "");
        C.value = a ? `#${a}` : "";
      }
    });
    function T() {
      C.value = "";
    }
    function H(L) {
      d.value = L, Be.setThemeMode(L);
    }
    const U = ee(() => C.value.trim() ? qn(C.value) : null), G = ee(() => !!C.value.trim() && U.value === null), B = ee(() => G.value || !!U.value && !U.value.ok), W = ee(() => G.value ? "Enter a valid hex color, e.g. #2563eb." : U.value && !U.value.ok ? U.value.reason : ""), ne = R(""), Y = R(Mt());
    let X = "";
    const q = ee(() => Cl(Y.value)), le = R(""), f = () => JSON.stringify({
      layout: o.value,
      cats: h.value,
      overrides: k.value,
      title: $.value,
      logo: I.value,
      home: ne.value,
      tone: C.value,
      chat: Y.value,
      pos: u.value.map((L) => [L.id, L.category, L.order, !!L.hidden])
    }), p = ee(() => f() !== le.value);
    async function O() {
      e.value = !0, i.value = "";
      try {
        const { data: L } = await Xe.get("/api/v1/nav/list?manage=1");
        if (!L.success) throw new Error(L.error || "failed to load nav");
        m.value = L.logo_upload, u.value = (L.items ?? []).map((V) => ({ ...V })), o.value = L.layout === "horizontal" ? "horizontal" : "vertical";
        const a = L.config ?? {};
        Y.value = Mt(a.chat_appearance), X = JSON.stringify(Y.value), h.value = Array.isArray(a.categories) ? a.categories.map((V) => ({ ...V })) : [], k.value = a.overrides && typeof a.overrides == "object" ? structuredClone(a.overrides) : {}, $.value = typeof a.title == "string" ? a.title : "", I.value = typeof a.logo_url == "string" ? a.logo_url : "";
        const y = typeof a.primary_color == "string" ? a.primary_color : "";
        re = y, C.value = y, ne.value = typeof L.home == "string" ? L.home : typeof a.home == "string" ? a.home : "", le.value = f();
      } catch (L) {
        i.value = l(L, "failed to load");
      } finally {
        e.value = !1;
      }
    }
    const N = Zn({ items: u, categories: h, overrides: k, home: ne }), {
      setHidden: Q,
      setLabel: ie,
      setIcon: de,
      hasOverride: je,
      itemsOf: be,
      editorGroups: _e,
      hiddenItems: Ue,
      catByKey: dt,
      dragItemId: en,
      overGroup: He,
      onItemDragStart: tn,
      endDrag: Ae,
      onItemDrop: nn,
      onGroupDrop: ut,
      onCatDragStart: on,
      onCatDrop: ln,
      addCategory: ct,
      removeCategory: rn,
      renameCategory: an,
      setCatIcon: sn,
      isHome: Ce,
      setHome: dn
    } = N;
    let ue = null, Ne = !1, re = null, pt = null;
    async function un() {
      try {
        const L = await fetch("/app/css-variables.facade.json", { cache: "no-store" });
        if (!L.ok) return;
        const a = await L.json();
        if (a && typeof a == "object") {
          pt = a;
          const y = a["--p-primary"];
          typeof y == "string" && (Z.value = y), re !== null && !Ne && !C.value.trim() && De.value !== !1 && ye("");
        }
      } catch {
      }
    }
    function ht(L, a) {
      return qe(L, a) || _n(pt, a) || qe(It, a);
    }
    function ye(L) {
      window.dispatchEvent(new CustomEvent("kickside:tone-apply", {
        detail: { hostCss: ht(L, ":root"), shadowCss: ht(L, ":host") }
      }));
    }
    Rt(() => {
      Ne = !0, ue && clearTimeout(ue), re !== null && ye(re), ft?.();
    });
    async function cn() {
      if (B.value || q.value) return;
      const L = f(), a = C.value, y = JSON.stringify(Y.value);
      n.value = !0, i.value = "";
      try {
        const { data: V } = await Xe.put("/api/v1/nav/config", {
          layout: o.value,
          overrides: k.value,
          categories: h.value,
          title: $.value,
          logo_url: I.value,
          home: ne.value,
          primary_color: C.value,
          ...y !== X ? { chat_appearance: JSON.parse(y) } : {}
        });
        if (!V.success) throw new Error(V.error || "save failed");
        le.value = L, X = y, re = a, ye(Ne || De.value === !1 ? re : C.value);
      } catch (V) {
        i.value = l(V, "save failed");
      } finally {
        n.value = !1;
      }
    }
    let ft = null;
    Et(() => {
      d.value = Be.getThemeMode?.() ?? "auto", ft = Mn("@theme", (L) => {
        d.value = L;
      }), un();
    });
    async function pn() {
      re !== null && p.value || await O();
    }
    const De = Cn(pn);
    return Ge(C, (L) => {
      ue && clearTimeout(ue), ue = null, !(re === null || De.value === !1) && (ue = setTimeout(() => ye(L), 90));
    }), Ge(De, (L, a) => {
      re !== null && (a === !0 && L === !1 ? (ue && clearTimeout(ue), ue = null, ye(re)) : a === !1 && L === !0 && p.value && ye(C.value));
    }), (L, a) => (c(), v("div", Ol, [
      r("div", Ll, [
        r("header", xl, [
          B.value ? (c(), v("span", $l, E(G.value ? "Invalid color" : "Tone unreadable"), 1)) : q.value ? (c(), v("span", Vl, E(q.value), 1)) : p.value ? (c(), v("span", zl, "Unsaved changes")) : F("", !0),
          r("button", {
            class: "ap-btn ap-btn-ghost",
            disabled: !p.value || n.value,
            onClick: O
          }, "Discard", 8, Ml),
          r("button", {
            class: "ap-btn ap-btn-primary",
            disabled: !p.value || n.value || B.value || !!q.value,
            onClick: cn
          }, [
            S(s(z), {
              icon: n.value ? "tabler:loader-2" : "tabler:device-floppy",
              class: te(n.value && "spin"),
              "aria-hidden": "true"
            }, null, 8, ["icon", "class"]),
            A(" " + E(n.value ? "Saving…" : "Save"), 1)
          ], 8, Tl)
        ]),
        i.value ? (c(), v("div", Fl, E(i.value), 1)) : F("", !0),
        e.value ? (c(), v("div", Hl, [
          S(s(z), {
            icon: "tabler:loader-2",
            class: "spin"
          }),
          a[14] || (a[14] = A(" Loading…", -1))
        ])) : (c(), v("div", Al, [
          r("aside", Dl, [
            r("section", Bl, [
              r("header", Pl, [
                S(s(z), {
                  icon: "tabler:photo",
                  "aria-hidden": "true"
                }),
                a[15] || (a[15] = A(" Branding", -1))
              ]),
              a[18] || (a[18] = r("p", { class: "ap-sub" }, "Title and logo apply to everyone on this installation — header, login page, and browser tab.", -1)),
              a[19] || (a[19] = r("label", { class: "ap-blabel" }, "Title", -1)),
              We(r("input", {
                "onUpdate:modelValue": a[0] || (a[0] = (y) => $.value = y),
                class: "ap-binput",
                type: "text",
                maxlength: "60",
                placeholder: "KickSide"
              }, null, 512), [
                [bt, $.value]
              ]),
              a[20] || (a[20] = r("label", { class: "ap-blabel" }, "Logo", -1)),
              r("div", El, [
                r("span", Rl, [
                  I.value ? (c(), v("img", {
                    key: 0,
                    src: I.value,
                    alt: "Logo preview"
                  }, null, 8, Kl)) : (c(), se(s(z), {
                    key: 1,
                    icon: "tabler:photo",
                    "aria-hidden": "true"
                  }))
                ]),
                r("div", jl, [
                  r("label", {
                    class: te(["ap-btn ap-btn-ghost", s(x) && "ap-btn-busy"])
                  }, [
                    S(s(z), {
                      icon: s(x) ? "tabler:loader-2" : "tabler:upload",
                      class: te(s(x) && "spin"),
                      "aria-hidden": "true"
                    }, null, 8, ["icon", "class"]),
                    A(" " + E(s(x) ? "Uploading…" : "Upload") + " ", 1),
                    r("input", {
                      type: "file",
                      accept: g.value,
                      class: "ap-file",
                      disabled: s(x) || !m.value,
                      onChange: a[1] || (a[1] = //@ts-ignore
                      (...y) => s(j) && s(j)(...y))
                    }, null, 40, _l)
                  ], 2),
                  I.value ? (c(), v("button", {
                    key: 0,
                    class: "ap-btn ap-btn-ghost ap-danger",
                    onClick: a[2] || (a[2] = //@ts-ignore
                    (...y) => s(_) && s(_)(...y))
                  }, [
                    S(s(z), {
                      icon: "tabler:trash",
                      "aria-hidden": "true"
                    }),
                    a[16] || (a[16] = A(" Remove ", -1))
                  ])) : F("", !0)
                ])
              ]),
              r("p", Ul, E(P.value), 1),
              a[21] || (a[21] = r("label", { class: "ap-blabel" }, "Base tone", -1)),
              r("div", Nl, [
                S(s(jt), {
                  modelValue: D.value,
                  "onUpdate:modelValue": a[3] || (a[3] = (y) => D.value = y),
                  format: "hex",
                  class: "ap-tone-swatch",
                  pt: { preview: { class: "ap-tone-preview", "aria-label": "Base tone color", "data-testid": "appearance-base-tone-picker" } }
                }, null, 8, ["modelValue"]),
                We(r("input", {
                  "onUpdate:modelValue": a[4] || (a[4] = (y) => C.value = y),
                  class: "ap-binput ap-tone-hex",
                  type: "text",
                  maxlength: "7",
                  placeholder: Z.value,
                  "aria-label": "Base tone hex"
                }, null, 8, Gl), [
                  [bt, C.value]
                ]),
                C.value ? (c(), v("button", {
                  key: 0,
                  class: "ap-btn ap-btn-ghost",
                  onClick: T
                }, [
                  S(s(z), {
                    icon: "tabler:rotate",
                    "aria-hidden": "true"
                  }),
                  a[17] || (a[17] = A(" Reset", -1))
                ])) : F("", !0)
              ]),
              W.value ? (c(), v("p", Wl, [
                S(s(z), {
                  icon: "tabler:alert-triangle",
                  "aria-hidden": "true"
                }),
                A(" " + E(W.value), 1)
              ])) : F("", !0),
              a[22] || (a[22] = r("p", { class: "ap-hint" }, "Primary color for buttons, links and accents. Applies across the app instantly.", -1)),
              a[23] || (a[23] = r("label", { class: "ap-blabel" }, "Color scheme", -1)),
              r("div", Xl, [
                (c(), v(J, null, fe([
                  { mode: "auto", label: "Auto", icon: "tabler:device-desktop" },
                  { mode: "light", label: "Light", icon: "tabler:sun" },
                  { mode: "dark", label: "Dark", icon: "tabler:moon" }
                ], (y) => r("button", {
                  key: y.mode,
                  type: "button",
                  class: te(["ap-theme-mode", d.value === y.mode && "ap-theme-mode-on"]),
                  "aria-pressed": d.value === y.mode,
                  onClick: (V) => H(y.mode)
                }, [
                  S(s(z), {
                    icon: y.icon,
                    "aria-hidden": "true"
                  }, null, 8, ["icon"]),
                  A(" " + E(y.label), 1)
                ], 10, ql)), 64))
              ]),
              a[24] || (a[24] = r("p", { class: "ap-hint" }, "Auto follows your browser or operating system setting. Changes apply immediately.", -1))
            ]),
            r("section", Zl, [
              r("header", Yl, [
                S(s(z), {
                  icon: "tabler:layout-2",
                  "aria-hidden": "true"
                }),
                a[25] || (a[25] = A(" Layout", -1))
              ]),
              a[32] || (a[32] = r("p", { class: "ap-sub" }, "Where navigation sits.", -1)),
              r("div", Jl, [
                r("button", {
                  class: te(["ap-lo", o.value === "vertical" && "ap-lo-on"]),
                  onClick: a[5] || (a[5] = (y) => o.value = "vertical")
                }, [
                  a[27] || (a[27] = r("span", { class: "mock mock-v" }, [
                    r("span", { class: "mock-rail" }, [
                      r("i"),
                      r("i"),
                      r("i")
                    ]),
                    r("span", { class: "mock-fill" })
                  ], -1)),
                  r("span", Ql, [
                    a[26] || (a[26] = A("Vertical ", -1)),
                    o.value === "vertical" ? (c(), se(s(z), {
                      key: 0,
                      icon: "tabler:circle-check-filled",
                      "aria-hidden": "true"
                    })) : F("", !0)
                  ]),
                  a[28] || (a[28] = r("span", { class: "ap-lo-desc" }, "Sidebar rail", -1))
                ], 2),
                r("button", {
                  class: te(["ap-lo", o.value === "horizontal" && "ap-lo-on"]),
                  onClick: a[6] || (a[6] = (y) => o.value = "horizontal")
                }, [
                  a[30] || (a[30] = r("span", { class: "mock mock-h" }, [
                    r("span", { class: "mock-top" }, [
                      r("i"),
                      r("i"),
                      r("i")
                    ]),
                    r("span", { class: "mock-fill" })
                  ], -1)),
                  r("span", er, [
                    a[29] || (a[29] = A("Horizontal ", -1)),
                    o.value === "horizontal" ? (c(), se(s(z), {
                      key: 0,
                      icon: "tabler:circle-check-filled",
                      "aria-hidden": "true"
                    })) : F("", !0)
                  ]),
                  a[31] || (a[31] = r("span", { class: "ap-lo-desc" }, "Top bar", -1))
                ], 2)
              ])
            ]),
            r("section", tr, [
              r("header", nr, [
                S(s(z), {
                  icon: "tabler:info-circle",
                  "aria-hidden": "true"
                }),
                a[33] || (a[33] = A(" How it works", -1))
              ]),
              r("ul", ir, [
                r("li", null, [
                  S(s(z), {
                    icon: "tabler:grip-vertical",
                    "aria-hidden": "true"
                  }),
                  a[34] || (a[34] = A(" Drag to reorder or move between categories.", -1))
                ]),
                r("li", null, [
                  S(s(z), {
                    icon: "tabler:cursor-text",
                    "aria-hidden": "true"
                  }),
                  a[35] || (a[35] = A(" Click a label to rename it.", -1))
                ]),
                r("li", null, [
                  S(s(z), {
                    icon: "tabler:mood-smile",
                    "aria-hidden": "true"
                  }),
                  a[36] || (a[36] = A(" Click an icon to pick a new Tabler glyph.", -1))
                ]),
                r("li", null, [
                  S(s(z), {
                    icon: "tabler:eye-off",
                    "aria-hidden": "true"
                  }),
                  a[37] || (a[37] = A(" Hide a surface without removing its module.", -1))
                ])
              ])
            ])
          ]),
          r("div", or, [
            S(Sl, {
              modelValue: Y.value,
              "onUpdate:modelValue": a[7] || (a[7] = (y) => Y.value = y)
            }, null, 8, ["modelValue"]),
            r("section", lr, [
              r("header", rr, [
                S(s(z), {
                  icon: "tabler:sitemap",
                  "aria-hidden": "true"
                }),
                a[39] || (a[39] = A(" Structure ", -1)),
                r("button", {
                  class: "ap-btn ap-btn-ghost ap-add",
                  onClick: a[8] || (a[8] = //@ts-ignore
                  (...y) => s(ct) && s(ct)(...y))
                }, [
                  S(s(z), {
                    icon: "tabler:folder-plus",
                    "aria-hidden": "true"
                  }),
                  a[38] || (a[38] = A(" Add category", -1))
                ])
              ]),
              (c(!0), v(J, null, fe(s(_e), (y) => (c(), v("div", {
                key: y.key || "_root",
                class: te(["ap-group", s(He) === y.key && "ap-group-over"]),
                onDragover: pe((V) => He.value = y.key, ["prevent"]),
                onDragleave: (V) => s(He) === y.key && (He.value = null),
                onDrop: pe((V) => s(ut)(y.key), ["prevent"])
              }, [
                r("div", {
                  class: "ap-group-head",
                  onDragover: a[10] || (a[10] = pe(() => {
                  }, ["prevent"])),
                  onDrop: pe((V) => y.real ? s(ln)(y.key) : s(ut)(y.key), ["prevent", "stop"])
                }, [
                  y.real ? (c(), v("span", {
                    key: 0,
                    class: "ap-grip ap-grip-cat",
                    draggable: "true",
                    title: "Drag to reorder category",
                    onDragstart: (V) => s(on)(y.key, V),
                    onDragend: a[9] || (a[9] = //@ts-ignore
                    (...V) => s(Ae) && s(Ae)(...V))
                  }, [
                    S(s(z), {
                      icon: "tabler:grip-vertical",
                      "aria-hidden": "true"
                    })
                  ], 40, dr)) : (c(), v("span", ur)),
                  y.real ? (c(), v(J, { key: 2 }, [
                    S(yt, {
                      "model-value": s(dt)(y.key)?.icon || "",
                      fallback: "tabler:folder",
                      "onUpdate:modelValue": (V) => s(sn)(y.key, V)
                    }, null, 8, ["model-value", "onUpdate:modelValue"]),
                    r("input", {
                      value: s(dt)(y.key)?.label,
                      class: "ap-field ap-field-strong",
                      "aria-label": "Category name",
                      placeholder: "Category name",
                      onInput: (V) => s(an)(y.key, V.target.value)
                    }, null, 40, cr)
                  ], 64)) : (c(), v(J, { key: 3 }, [
                    r("span", pr, [
                      S(s(z), {
                        icon: "tabler:layout-list",
                        "aria-hidden": "true"
                      })
                    ]),
                    r("span", hr, E(y.label), 1)
                  ], 64)),
                  r("span", fr, E(s(be)(y.key).length), 1),
                  y.real ? (c(), v("button", {
                    key: 4,
                    class: "ap-icon-btn ap-danger",
                    "aria-label": "Remove category",
                    title: "Remove category",
                    onClick: (V) => s(rn)(y.key)
                  }, [
                    S(s(z), {
                      icon: "tabler:trash",
                      "aria-hidden": "true"
                    })
                  ], 8, gr)) : F("", !0)
                ], 40, sr),
                s(be)(y.key).length === 0 ? (c(), v("div", vr, "Drag a surface here")) : F("", !0),
                (c(!0), v(J, null, fe(s(be)(y.key), (V) => (c(), v("div", {
                  key: V.id,
                  class: te(["ap-row", s(en) === V.id && "ap-row-dragging"]),
                  onDragover: a[12] || (a[12] = pe(() => {
                  }, ["prevent", "stop"])),
                  onDrop: pe((ae) => s(nn)(V), ["prevent", "stop"])
                }, [
                  r("span", {
                    class: "ap-grip",
                    draggable: "true",
                    title: "Drag to reorder or move",
                    onDragstart: (ae) => s(tn)(V, ae),
                    onDragend: a[11] || (a[11] = //@ts-ignore
                    (...ae) => s(Ae) && s(Ae)(...ae))
                  }, [
                    S(s(z), {
                      icon: "tabler:grip-vertical",
                      "aria-hidden": "true"
                    })
                  ], 40, br),
                  S(yt, {
                    "model-value": V.icon || "",
                    fallback: "tabler:square",
                    "onUpdate:modelValue": (ae) => s(de)(V, ae)
                  }, null, 8, ["model-value", "onUpdate:modelValue"]),
                  r("input", {
                    value: V.label,
                    class: "ap-field ap-field-strong",
                    "aria-label": "Surface label",
                    placeholder: "Label",
                    onInput: (ae) => s(ie)(V, ae.target.value)
                  }, null, 40, yr),
                  r("span", wr, E(V.path), 1),
                  V.source === "custom" ? (c(), v("span", kr, "custom")) : F("", !0),
                  s(Ce)(V) ? (c(), v("span", Ir, [
                    S(s(z), {
                      icon: "tabler:home",
                      "aria-hidden": "true"
                    }),
                    a[40] || (a[40] = A(" home", -1))
                  ])) : F("", !0),
                  s(je)(V) ? (c(), se(s(z), {
                    key: 2,
                    icon: "tabler:pencil",
                    class: "ap-edited",
                    title: "Customized — reset the field to revert",
                    "aria-hidden": "true"
                  })) : F("", !0),
                  r("button", {
                    class: te(["ap-icon-btn", s(Ce)(V) && "ap-home-on"]),
                    "aria-label": s(Ce)(V) ? "Home page (click to unset)" : "Set as home page",
                    title: s(Ce)(V) ? "Home page — click to unset" : "Set as home page",
                    onClick: (ae) => s(dn)(V)
                  }, [
                    S(s(z), {
                      icon: s(Ce)(V) ? "tabler:home-filled" : "tabler:home",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"])
                  ], 10, Sr),
                  r("button", {
                    class: "ap-icon-btn",
                    "aria-label": "Hide",
                    title: "Hide",
                    onClick: (ae) => s(Q)(V, !0)
                  }, [
                    S(s(z), {
                      icon: "tabler:eye",
                      "aria-hidden": "true"
                    })
                  ], 8, Cr)
                ], 42, mr))), 128))
              ], 42, ar))), 128)),
              s(Ue).length ? (c(), v("div", Or, [
                r("button", {
                  class: "ap-hidden-h",
                  onClick: a[13] || (a[13] = (y) => b.value = !b.value)
                }, [
                  S(s(z), {
                    icon: b.value ? "tabler:chevron-down" : "tabler:chevron-right",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"]),
                  S(s(z), {
                    icon: "tabler:eye-off",
                    "aria-hidden": "true"
                  }),
                  A(" Hidden (" + E(s(Ue).length) + ") ", 1)
                ]),
                b.value ? (c(), v("div", Lr, [
                  (c(!0), v(J, null, fe(s(Ue), (y) => (c(), v("div", {
                    key: y.id,
                    class: "ap-row ap-row-off"
                  }, [
                    a[41] || (a[41] = r("span", {
                      class: "ap-grip ap-grip-ghost",
                      "aria-hidden": "true"
                    }, null, -1)),
                    r("span", xr, [
                      S(s(z), {
                        icon: y.icon || "tabler:square",
                        "aria-hidden": "true"
                      }, null, 8, ["icon"])
                    ]),
                    r("span", $r, E(y.label), 1),
                    r("button", {
                      class: "ap-icon-btn",
                      "aria-label": "Show",
                      title: "Show",
                      onClick: (V) => s(Q)(y, !1)
                    }, [
                      S(s(z), {
                        icon: "tabler:eye-plus",
                        "aria-hidden": "true"
                      })
                    ], 8, Vr)
                  ]))), 128))
                ])) : F("", !0)
              ])) : F("", !0)
            ])
          ])
        ]))
      ])
    ]));
  }
}), Dr = {
  rootComponent: zr,
  plugins: [On]
};
export {
  Dr as mountConfig
};
//# sourceMappingURL=lazy-mount-B1yixa4o.js.map
