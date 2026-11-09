import { u as q, W as R, s as G } from "./styles-C28Y9Spn.js";
import { defineComponent as I, ref as y, watch as X, onBeforeUnmount as K, openBlock as i, createElementBlock as c, createVNode as E, unref as F, createElementVNode as u, createCommentVNode as A, toDisplayString as O, Fragment as Y, renderList as z, nextTick as H } from "vue";
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
    const P = q();
    let v = null;
    async function V() {
      if (v) return v;
      const [e, t] = await Promise.all([
        import("./pdf-DgI7wR7H.js"),
        import("./pdf.worker-DEfE5EQJ.js")
      ]);
      return e.GlobalWorkerOptions.workerSrc = t.default, v = e, e;
    }
    const d = y(null), g = y(!1), s = y(""), h = y([]);
    let o = 0, w = null;
    async function b() {
      const e = w;
      w = null, e?.destroy && await e.destroy();
    }
    async function $() {
      const e = P.value?.sourceUrl;
      o += 1;
      const t = o;
      if (h.value = [], s.value = "", !!e) {
        g.value = !0;
        try {
          const r = await V();
          await b();
          const { data: C } = await J.get(e, { responseType: "arraybuffer" });
          if (t !== o) return;
          const S = C?.byteLength ?? 0;
          if (S > T) {
            s.value = `PDF is too large to preview (${(S / 1048576).toFixed(0)} MB; limit ${T / 1048576} MB).`;
            return;
          }
          const x = await r.getDocument({ data: new Uint8Array(C) }).promise;
          w = x;
          const N = Math.min(x.numPages, oe);
          h.value = Array.from({ length: N }, (a, _) => _ + 1), await H();
          const W = d.value?.querySelectorAll(".pdfv-page[data-page]") || [], k = ((d.value?.parentElement || d.value)?.clientWidth || 0) - 2;
          for (const a of W) {
            if (t !== o) return;
            const _ = Number(a.dataset.page || 0), p = await x.getPage(_), j = p.getViewport({ scale: 1 }), D = k > 0 ? Math.max(0.4, Math.min(2, k / j.width)) : ae, f = p.getViewport({ scale: D }), m = Math.floor(f.width), L = Math.floor(f.height), l = a.querySelector("canvas"), M = l?.getContext("2d");
            if (!l || !M) continue;
            l.width = m, l.height = L, a.style.width = `${m}px`, a.style.setProperty("--pdf-width", `${m}px`), await p.render({ canvas: l, canvasContext: M, viewport: f }).promise;
            const n = a.querySelector(".textLayer");
            n && (n.replaceChildren(), n.style.width = `${m}px`, n.style.height = `${L}px`, n.style.setProperty("--total-scale-factor", String(D)), await new r.TextLayer({
              textContentSource: p.streamTextContent(),
              container: n,
              viewport: f
            }).render());
          }
        } catch (r) {
          s.value = r?.response?.data?.error || r?.message || "could not load PDF";
        } finally {
          t === o && (g.value = !1);
        }
      }
    }
    return X(() => P.value?.sourceUrl, () => {
      $();
    }, { immediate: !0 }), K(() => {
      o += 1, b();
    }), (e, t) => (i(), c("div", Z, [
      g.value ? (i(), c("div", ee, [
        E(F(B), {
          icon: "tabler:loader-2",
          class: "spin",
          "aria-hidden": "true"
        }),
        t[0] || (t[0] = u("span", null, "Loading PDF…", -1))
      ])) : A("", !0),
      s.value ? (i(), c("div", te, [
        E(F(B), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        u("span", null, O(s.value), 1)
      ])) : A("", !0),
      u("div", {
        ref_key: "holder",
        ref: d,
        class: "pdfv-pages"
      }, [
        (i(!0), c(Y, null, z(h.value, (r) => (i(), c("div", {
          key: r,
          class: "pdfv-page",
          "data-page": r
        }, [...t[1] || (t[1] = [
          u("canvas", null, null, -1),
          u("div", { class: "textLayer" }, null, -1)
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
class le extends R {
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
Q(import.meta.url, le);
//# sourceMappingURL=render-pdf.js.map
