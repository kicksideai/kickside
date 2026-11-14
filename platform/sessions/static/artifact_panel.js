import { a as Z, u as ee, b as te, W as ae } from "./wc-runtime-BJD-5iaH.js";
import { P as se } from "./primevue-plugin-CaP7wV_M.js";
import { defineComponent as ie, ref as v, computed as ne, onMounted as le, onBeforeUnmount as oe, withDirectives as re, openBlock as S, createElementBlock as A, createElementVNode as i, createVNode as I, unref as m, withCtx as q, toDisplayString as C, normalizeClass as N, createTextVNode as B, createCommentVNode as D, vShow as ce } from "vue";
import { Icon as E } from "@iconify/vue";
import { on as F, define as ue } from "@wippy-fe/proxy";
import fe from "primevue/select";
import { a as y } from "./artifactPresentation-Dgf5Fs_k.js";
import { s as de, a as pe, l as ve, e as me, b as ye, A as be } from "./hostRoute-CHFKAd6h.js";
import { u as he } from "./useSessionsApi-BQAm970o.js";
import { s as ke } from "./styles-BfuGB-97.js";
const _e = {
  class: "kx-artifact-panel",
  "aria-label": "Artifact preview"
}, xe = { class: "kx-artifact-panel-head" }, we = { class: "kx-artifact-panel-title" }, Ce = { class: "kx-artifact-select-option" }, ge = { class: "kx-artifact-select-option-title" }, Se = { class: "kx-artifact-select-option-sub" }, Ae = { class: "kx-artifact-panel-actions" }, Ie = ["disabled"], Te = ["disabled"], Ee = {
  key: 0,
  class: "kx-artifact-panel-error",
  role: "alert"
}, Ve = ["disabled"], Le = {
  class: "sr-only",
  "aria-live": "polite"
}, Ne = {
  key: 1,
  class: "kx-artifact-panel-body"
}, Pe = ["id"], Ue = {
  key: 2,
  class: "kx-artifact-panel-empty"
}, Re = /* @__PURE__ */ ie({
  __name: "ArtifactPanel",
  setup($) {
    const V = he(), P = Z(), H = ee(), c = v([]), a = v(""), u = v(de(window.location.pathname)), f = v(!!u.value), o = v(""), n = v(""), p = v(!1), T = [], L = /* @__PURE__ */ new Set();
    let d = null, b = 0, h = 0, k = "";
    const _ = ne(() => c.value.find((e) => y(e) === a.value));
    async function U() {
      const e = u.value, t = ++b;
      if (!e) {
        c.value = [], a.value = "", f.value = !1, n.value = "";
        return;
      }
      f.value = !0, n.value = "";
      try {
        const s = await V.artifacts({ sessionId: e, limit: 100 });
        if (t !== b || e !== u.value) return;
        const r = _.value, l = s.artifacts.filter((w) => !w.session_id || w.session_id === e), x = r?.session_id === e && !l.some((w) => y(w) === a.value) ? [r, ...l] : l;
        c.value = x, !x.some((w) => y(w) === a.value) && !k && (a.value = x[0] ? y(x[0]) : "");
      } catch (s) {
        if (t !== b || e !== u.value) return;
        a.value || (n.value = s.message || "Could not load artifacts");
      } finally {
        t === b && (f.value = !1);
      }
    }
    function g() {
      d && clearTimeout(d), d = setTimeout(() => {
        U();
      }, 150);
    }
    async function R(e) {
      if (!e) return;
      const t = u.value;
      if (!t) return;
      if (p.value = !1, n.value = "", c.value.some((l) => y(l) === e)) {
        h++, k = "", a.value = e;
        return;
      }
      if (L.has(e)) return;
      const s = ++h;
      k = e;
      const r = a.value;
      a.value = "", L.add(e);
      try {
        const l = await V.artifact(e);
        if (s !== h || t !== u.value) {
          a.value || (a.value = r);
          return;
        }
        if (l.session_id && l.session_id !== t) {
          a.value = r;
          return;
        }
        c.value = [l, ...c.value.filter((x) => y(x) !== e)], a.value = e;
      } catch (l) {
        s === h && (a.value || (a.value = r), n.value = l.message || "Could not load artifact details");
      } finally {
        L.delete(e), k === e && (k = "");
      }
    }
    function K(e) {
      e !== u.value && (u.value = e, b++, h++, d && (clearTimeout(d), d = null), c.value = [], a.value = "", k = "", p.value = !1, n.value = "", f.value = !!e, e && g());
    }
    function O(e) {
      if (e.channel === "kickside:artifact-session") {
        if (!pe(e.sourcePanelId, ve(H), window.location.pathname)) return;
        K(me(e.payload));
        return;
      }
      if (e.channel !== "kickside:artifact-open") return;
      const t = ye(e.payload);
      t && (R(t), g());
    }
    function W(e) {
      if (!e) return "Generation time unavailable";
      const t = new Date(e);
      return Number.isNaN(t.getTime()) ? "Generation time unavailable" : `Generated ${new Intl.DateTimeFormat(void 0, { dateStyle: "medium", timeStyle: "short" }).format(t)}`;
    }
    function z(e) {
      const t = String(e || "").toLowerCase();
      return t.includes("markdown") ? "md" : t.includes("html") ? "html" : t.includes("json") ? "json" : t.includes("javascript") ? "js" : t.includes("css") ? "css" : "txt";
    }
    function M(e) {
      return `${String(e || "artifact").trim().replace(/[<>:"/\\|?*\u0000-\u001f]+/g, "-").replace(/[. ]+$/g, "") || "artifact"}.${z(_.value?.content_type)}`;
    }
    async function j() {
      if (!a.value) throw new Error("Select an artifact first");
      return V.artifactContent(a.value);
    }
    async function J() {
      o.value = "copy", n.value = "";
      try {
        await navigator.clipboard.writeText(await j()), p.value = !0, window.setTimeout(() => {
          p.value = !1;
        }, 1600);
      } catch (e) {
        n.value = e.message || "Could not copy artifact";
      } finally {
        o.value = "";
      }
    }
    async function Q() {
      o.value = "save", n.value = "";
      try {
        const e = await j(), t = new Blob([e], { type: _.value?.content_type || "text/plain;charset=utf-8" }), s = URL.createObjectURL(t), r = document.createElement("a");
        r.href = s, r.download = M(_.value?.title), r.click(), URL.revokeObjectURL(s);
      } catch (e) {
        n.value = e.message || "Could not save artifact";
      } finally {
        o.value = "";
      }
    }
    function X() {
      P?.broadcast("kickside:artifact-close", { panelId: be });
    }
    const Y = te(g);
    return le(() => {
      const e = P?.subscribe(O);
      e && T.push(e), T.push(F("artifact:*", g)), T.push(F("session:*", g));
    }), oe(() => {
      T.forEach((e) => e()), b++, h++, d && clearTimeout(d);
    }), (e, t) => re((S(), A("section", _e, [
      i("header", xe, [
        i("div", we, [
          t[2] || (t[2] = i("label", {
            class: "sr-only",
            for: "artifact-panel-selector"
          }, "Artifact", -1)),
          I(m(fe), {
            "input-id": "artifact-panel-selector",
            modelValue: a.value,
            "onUpdate:modelValue": [
              t[0] || (t[0] = (s) => a.value = s),
              t[1] || (t[1] = (s) => R(s))
            ],
            class: "kx-artifact-panel-select",
            "overlay-class": "kx-artifact-panel-select-overlay",
            options: c.value,
            "option-label": "title",
            "option-value": m(y),
            placeholder: f.value ? "Loading artifacts…" : "Select an artifact",
            disabled: f.value
          }, {
            value: q(() => [
              i("span", {
                class: N(["kx-artifact-select-value", { "is-placeholder": !_.value }])
              }, C(_.value?.title || (f.value ? "Loading artifacts…" : "Select an artifact")), 3)
            ]),
            option: q(({ option: s }) => [
              i("span", Ce, [
                i("span", ge, C(s.title || "Untitled artifact"), 1),
                i("span", Se, C(W(s.created_at)), 1)
              ])
            ]),
            _: 1
          }, 8, ["modelValue", "options", "option-value", "placeholder", "disabled"])
        ]),
        i("div", Ae, [
          i("button", {
            type: "button",
            class: "kx-panel-action",
            disabled: !a.value || !!o.value,
            onClick: J
          }, [
            I(m(E), {
              icon: o.value === "copy" ? "tabler:loader-2" : p.value ? "tabler:check" : "tabler:copy",
              class: N({ spin: o.value === "copy" }),
              "aria-hidden": "true"
            }, null, 8, ["icon", "class"]),
            B(" " + C(p.value ? "Copied" : "Copy"), 1)
          ], 8, Ie),
          i("button", {
            type: "button",
            class: "kx-panel-action",
            disabled: !a.value || !!o.value,
            onClick: Q
          }, [
            I(m(E), {
              icon: o.value === "save" ? "tabler:loader-2" : "tabler:download",
              class: N({ spin: o.value === "save" }),
              "aria-hidden": "true"
            }, null, 8, ["icon", "class"]),
            t[3] || (t[3] = B(" Save ", -1))
          ], 8, Te),
          i("button", {
            type: "button",
            class: "kx-panel-close",
            "aria-label": "Close artifact panel",
            onClick: X
          }, [
            I(m(E), {
              icon: "tabler:x",
              "aria-hidden": "true"
            })
          ])
        ])
      ]),
      n.value ? (S(), A("div", Ee, [
        i("span", null, C(n.value), 1),
        a.value ? D("", !0) : (S(), A("button", {
          key: 0,
          type: "button",
          class: "kx-artifact-panel-retry",
          disabled: f.value,
          onClick: U
        }, "Retry", 8, Ve))
      ])) : D("", !0),
      i("span", Le, C(p.value ? "Artifact copied to clipboard" : ""), 1),
      a.value ? (S(), A("div", Ne, [
        i("w-artifact", { id: a.value }, null, 8, Pe)
      ])) : (S(), A("div", Ue, [
        I(m(E), {
          icon: "tabler:file-description",
          "aria-hidden": "true"
        }),
        t[4] || (t[4] = i("span", null, "Select an artifact to preview it.", -1))
      ]))
    ], 512)), [
      [ce, m(Y) !== !1]
    ]);
  }
});
class G extends ae {
  static get wippyConfig() {
    return {
      propsSchema: { type: "object", properties: {} },
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: ke
    };
  }
  static get vueConfig() {
    return { rootComponent: Re, plugins: [se] };
  }
}
async function ze() {
  return G;
}
ue(import.meta.url, G);
export {
  ze as webComponent
};
//# sourceMappingURL=artifact_panel.js.map
