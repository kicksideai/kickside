import { u as q, W as R, s as G } from "./styles-ciEHWahf.js";
import { defineComponent as I, ref as m, watch as X, onBeforeUnmount as K, openBlock as i, createElementBlock as l, createVNode as E, unref as F, createElementVNode as c, createCommentVNode as A, toDisplayString as O, Fragment as Y, renderList as z, nextTick as H } from "vue";
import { Icon as B } from "@iconify/vue";
import { api as J, define as Q } from "@wippy-fe/proxy";
const Z = { class: "pdfv" }, ee = {
  key: 0,
  class: "rv-state"
}, te = {
  key: 1,
  class: "rv-state err"
}, re = ["data-page"], T = 50 * 1024 * 1024, oe = 300, ae = 1.3, ne = /* @__PURE__ */ I({
  __name: "RenderPdf",
  setup(U) {
    const b = q();
    let v = null;
    async function V() {
      if (v) return v;
      const [e, t] = await Promise.all([
        import("./pdf-DgI7wR7H.js"),
        import("./pdf.worker-DEfE5EQJ.js")
      ]);
      return e.GlobalWorkerOptions.workerSrc = t.default, v = e, e;
    }
    const u = m(null), y = m(!1), s = m(""), g = m([]);
    let a = 0, h = null;
    async function C() {
      const e = h;
      h = null, e?.destroy && await e.destroy();
    }
    async function $() {
      const e = b.value?.sourceUrl;
      a += 1;
      const t = a;
      if (g.value = [], s.value = "", !!e) {
        y.value = !0;
        try {
          const r = await V();
          await C();
          const { data: S } = await J.get(e, { responseType: "arraybuffer" });
          if (t !== a) return;
          const k = S?.byteLength ?? 0;
          if (k > T) {
            s.value = `PDF is too large to preview (${(k / 1048576).toFixed(0)} MB; limit ${T / 1048576} MB).`;
            return;
          }
          const w = await r.getDocument({ data: new Uint8Array(S) }).promise;
          h = w;
          const N = Math.min(w.numPages, oe);
          g.value = Array.from({ length: N }, (d, x) => x + 1), await H();
          const W = u.value?.querySelectorAll(".pdfv-page[data-page]") || [], D = ((u.value?.parentElement || u.value)?.clientWidth || 0) - 2;
          for (const d of W) {
            if (t !== a) return;
            const x = Number(d.dataset.page || 0), p = await w.getPage(x), j = p.getViewport({ scale: 1 }), L = D > 0 ? Math.max(0.4, Math.min(2, D / j.width)) : ae, f = p.getViewport({ scale: L }), _ = Math.floor(f.width), P = Math.floor(f.height), o = d.querySelector("canvas"), M = o?.getContext("2d");
            if (!o || !M) continue;
            o.width = _, o.height = P, o.style.width = `${_}px`, o.style.height = `${P}px`, await p.render({ canvas: o, canvasContext: M, viewport: f }).promise;
            const n = d.querySelector(".textLayer");
            n && (n.replaceChildren(), n.style.width = `${_}px`, n.style.height = `${P}px`, n.style.setProperty("--scale-factor", String(L)), await new r.TextLayer({
              textContentSource: p.streamTextContent(),
              container: n,
              viewport: f
            }).render());
          }
        } catch (r) {
          s.value = r?.response?.data?.error || r?.message || "could not load PDF";
        } finally {
          t === a && (y.value = !1);
        }
      }
    }
    return X(() => b.value?.sourceUrl, () => {
      $();
    }, { immediate: !0 }), K(() => {
      a += 1, C();
    }), (e, t) => (i(), l("div", Z, [
      y.value ? (i(), l("div", ee, [
        E(F(B), {
          icon: "tabler:loader-2",
          class: "spin",
          "aria-hidden": "true"
        }),
        t[0] || (t[0] = c("span", null, "Loading PDF…", -1))
      ])) : A("", !0),
      s.value ? (i(), l("div", te, [
        E(F(B), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        c("span", null, O(s.value), 1)
      ])) : A("", !0),
      c("div", {
        ref_key: "holder",
        ref: u,
        class: "pdfv-pages"
      }, [
        (i(!0), l(Y, null, z(g.value, (r) => (i(), l("div", {
          key: r,
          class: "pdfv-page",
          "data-page": r
        }, [...t[1] || (t[1] = [
          c("canvas", null, null, -1),
          c("div", { class: "textLayer" }, null, -1)
        ])], 8, re))), 128))
      ], 512)
    ]));
  }
}), se = {
  type: "object",
  properties: {
    "source-url": { type: "string", default: "", description: "URL to fetch the PDF bytes from (auth via proxy)." }
  }
};
class ie extends R {
  static get wippyConfig() {
    return {
      propsSchema: se,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: G
    };
  }
  static get vueConfig() {
    return { rootComponent: ne };
  }
}
Q(import.meta.url, ie);
//# sourceMappingURL=render-pdf.js.map
