import { u as R, W as G } from "./wc-runtime-h8e5VJvv.js";
import { defineComponent as I, ref as y, watch as X, onBeforeUnmount as K, openBlock as l, createElementBlock as c, createVNode as E, unref as F, createElementVNode as u, createCommentVNode as A, toDisplayString as O, Fragment as Y, renderList as z, nextTick as H } from "vue";
import { Icon as B } from "@iconify/vue";
import { api as J, define as Q } from "@wippy-fe/proxy";
import { s as Z } from "./styles-HTuIrRec.js";
const ee = { class: "pdfv" }, te = {
  key: 0,
  class: "rv-state"
}, re = {
  key: 1,
  class: "rv-state err"
}, oe = ["data-page"], T = 50 * 1024 * 1024, ne = 300, ae = 1.3, se = /* @__PURE__ */ I({
  __name: "RenderPdf",
  setup(V) {
    const P = R();
    let v = null;
    async function $() {
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
    async function N() {
      const e = P.value?.sourceUrl;
      o += 1;
      const t = o;
      if (h.value = [], s.value = "", !!e) {
        g.value = !0;
        try {
          const r = await $();
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
          const W = Math.min(x.numPages, ne);
          h.value = Array.from({ length: W }, (n, _) => _ + 1), await H();
          const j = d.value?.querySelectorAll(".pdfv-page[data-page]") || [], k = ((d.value?.parentElement || d.value)?.clientWidth || 0) - 2;
          for (const n of j) {
            if (t !== o) return;
            const _ = Number(n.dataset.page || 0), p = await x.getPage(_), q = p.getViewport({ scale: 1 }), D = k > 0 ? Math.max(0.4, Math.min(2, k / q.width)) : ae, f = p.getViewport({ scale: D }), m = Math.floor(f.width), L = Math.floor(f.height), i = n.querySelector("canvas"), M = i?.getContext("2d");
            if (!i || !M) continue;
            i.width = m, i.height = L, n.style.width = `${m}px`, n.style.setProperty("--pdf-width", `${m}px`), await p.render({ canvas: i, canvasContext: M, viewport: f }).promise;
            const a = n.querySelector(".textLayer");
            a && (a.replaceChildren(), a.style.width = `${m}px`, a.style.height = `${L}px`, a.style.setProperty("--total-scale-factor", String(D)), await new r.TextLayer({
              textContentSource: p.streamTextContent(),
              container: a,
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
      N();
    }, { immediate: !0 }), K(() => {
      o += 1, b();
    }), (e, t) => (l(), c("div", ee, [
      g.value ? (l(), c("div", te, [
        E(F(B), {
          icon: "tabler:loader-2",
          class: "spin",
          "aria-hidden": "true"
        }),
        t[0] || (t[0] = u("span", null, "Loading PDF…", -1))
      ])) : A("", !0),
      s.value ? (l(), c("div", re, [
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
        (l(!0), c(Y, null, z(h.value, (r) => (l(), c("div", {
          key: r,
          class: "pdfv-page",
          "data-page": r
        }, [...t[1] || (t[1] = [
          u("canvas", null, null, -1),
          u("div", { class: "textLayer" }, null, -1)
        ])], 8, oe))), 128))
      ], 512)
    ]));
  }
}), ie = {
  type: "object",
  properties: {
    "source-url": { type: "string", default: "", description: "URL to fetch the PDF bytes from (auth via proxy)." }
  }
};
class U extends G {
  static get wippyConfig() {
    return {
      propsSchema: ie,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: Z
    };
  }
  static get vueConfig() {
    return { rootComponent: se };
  }
}
async function ye() {
  return U;
}
Q(import.meta.url, U);
export {
  ye as webComponent
};
//# sourceMappingURL=render-pdf.js.map
