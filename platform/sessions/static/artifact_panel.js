import { a as te, u as ae, b as se, W as ne } from "./wc-runtime-BJD-5iaH.js";
import { P as ie } from "./primevue-plugin-CaP7wV_M.js";
import { defineComponent as oe, ref as p, computed as le, onMounted as re, onBeforeUnmount as ce, withDirectives as ue, openBlock as S, createElementBlock as A, createElementVNode as n, createVNode as I, unref as m, withCtx as q, toDisplayString as C, normalizeClass as j, createTextVNode as B, createCommentVNode as D, vShow as fe } from "vue";
import { Icon as E } from "@iconify/vue";
import { on as F, define as de } from "@wippy-fe/proxy";
import ve from "primevue/select";
import { a as y } from "./artifactPresentation-Dgf5Fs_k.js";
import { s as pe, a as me, A as ye } from "./hostRoute-C2evkQJy.js";
import { u as be } from "./useSessionsApi-DkMU6ZyM.js";
import { s as he } from "./styles-CKLWbXzy.js";
const _e = {
  class: "kx-artifact-panel",
  "aria-label": "Artifact preview"
}, ke = { class: "kx-artifact-panel-head" }, xe = { class: "kx-artifact-panel-title" }, we = { class: "kx-artifact-select-option" }, Ce = { class: "kx-artifact-select-option-title" }, ge = { class: "kx-artifact-select-option-sub" }, Se = { class: "kx-artifact-panel-actions" }, Ae = ["disabled"], Ie = ["disabled"], Te = {
  key: 0,
  class: "kx-artifact-panel-error",
  role: "alert"
}, Ee = ["disabled"], Ve = {
  class: "sr-only",
  "aria-live": "polite"
}, Le = {
  key: 1,
  class: "kx-artifact-panel-body"
}, je = ["id"], Ne = {
  key: 2,
  class: "kx-artifact-panel-empty"
}, Pe = /* @__PURE__ */ oe({
  __name: "ArtifactPanel",
  setup($) {
    const V = be(), N = te(), H = ae(), c = p([]), a = p(""), u = p(pe(window.location.pathname)), f = p(!!u.value), l = p(""), i = p(""), v = p(!1), T = [], L = /* @__PURE__ */ new Set();
    let d = null, b = 0, h = 0, _ = "";
    const k = le(() => c.value.find((e) => y(e) === a.value));
    function K(e) {
      if (!e || typeof e != "object") return "";
      const t = e;
      return String(t.uuid || t.artifactId || "");
    }
    function O(e) {
      if (!e || typeof e != "object") return "";
      const t = e;
      return String(t.sessionId || t.session_id || "");
    }
    async function P() {
      const e = u.value, t = ++b;
      if (!e) {
        c.value = [], a.value = "", f.value = !1, i.value = "";
        return;
      }
      f.value = !0, i.value = "";
      try {
        const s = await V.artifacts({ sessionId: e, limit: 100 });
        if (t !== b || e !== u.value) return;
        const r = k.value, o = s.artifacts.filter((w) => !w.session_id || w.session_id === e), x = r?.session_id === e && !o.some((w) => y(w) === a.value) ? [r, ...o] : o;
        c.value = x, !x.some((w) => y(w) === a.value) && !_ && (a.value = x[0] ? y(x[0]) : "");
      } catch (s) {
        if (t !== b || e !== u.value) return;
        a.value || (i.value = s.message || "Could not load artifacts");
      } finally {
        t === b && (f.value = !1);
      }
    }
    function g() {
      d && clearTimeout(d), d = setTimeout(() => {
        P();
      }, 150);
    }
    async function U(e) {
      if (!e) return;
      const t = u.value;
      if (!t) return;
      if (v.value = !1, i.value = "", c.value.some((o) => y(o) === e)) {
        h++, _ = "", a.value = e;
        return;
      }
      if (L.has(e)) return;
      const s = ++h;
      _ = e;
      const r = a.value;
      a.value = "", L.add(e);
      try {
        const o = await V.artifact(e);
        if (s !== h || t !== u.value) {
          a.value || (a.value = r);
          return;
        }
        if (o.session_id && o.session_id !== t) {
          a.value = r;
          return;
        }
        c.value = [o, ...c.value.filter((x) => y(x) !== e)], a.value = e;
      } catch (o) {
        s === h && (a.value || (a.value = r), i.value = o.message || "Could not load artifact details");
      } finally {
        L.delete(e), _ === e && (_ = "");
      }
    }
    function W(e) {
      e !== u.value && (u.value = e, b++, h++, d && (clearTimeout(d), d = null), c.value = [], a.value = "", _ = "", v.value = !1, i.value = "", f.value = !!e, e && g());
    }
    function z(e) {
      if (e.channel === "kickside:artifact-session") {
        const s = H?.layout.snapshot;
        if (!me(e.sourcePanelId, s, window.location.pathname)) return;
        W(O(e.payload));
        return;
      }
      if (e.channel !== "kickside:artifact-open") return;
      const t = K(e.payload);
      t && (U(t), g());
    }
    function M(e) {
      if (!e) return "Generation time unavailable";
      const t = new Date(e);
      return Number.isNaN(t.getTime()) ? "Generation time unavailable" : `Generated ${new Intl.DateTimeFormat(void 0, { dateStyle: "medium", timeStyle: "short" }).format(t)}`;
    }
    function J(e) {
      const t = String(e || "").toLowerCase();
      return t.includes("markdown") ? "md" : t.includes("html") ? "html" : t.includes("json") ? "json" : t.includes("javascript") ? "js" : t.includes("css") ? "css" : "txt";
    }
    function Q(e) {
      return `${String(e || "artifact").trim().replace(/[<>:"/\\|?*\u0000-\u001f]+/g, "-").replace(/[. ]+$/g, "") || "artifact"}.${J(k.value?.content_type)}`;
    }
    async function R() {
      if (!a.value) throw new Error("Select an artifact first");
      return V.artifactContent(a.value);
    }
    async function X() {
      l.value = "copy", i.value = "";
      try {
        await navigator.clipboard.writeText(await R()), v.value = !0, window.setTimeout(() => {
          v.value = !1;
        }, 1600);
      } catch (e) {
        i.value = e.message || "Could not copy artifact";
      } finally {
        l.value = "";
      }
    }
    async function Y() {
      l.value = "save", i.value = "";
      try {
        const e = await R(), t = new Blob([e], { type: k.value?.content_type || "text/plain;charset=utf-8" }), s = URL.createObjectURL(t), r = document.createElement("a");
        r.href = s, r.download = Q(k.value?.title), r.click(), URL.revokeObjectURL(s);
      } catch (e) {
        i.value = e.message || "Could not save artifact";
      } finally {
        l.value = "";
      }
    }
    function Z() {
      N?.broadcast("kickside:artifact-close", { panelId: ye });
    }
    const ee = se(g);
    return re(() => {
      const e = N?.subscribe(z);
      e && T.push(e), T.push(F("artifact:*", g)), T.push(F("session:*", g));
    }), ce(() => {
      T.forEach((e) => e()), b++, h++, d && clearTimeout(d);
    }), (e, t) => ue((S(), A("section", _e, [
      n("header", ke, [
        n("div", xe, [
          t[2] || (t[2] = n("label", {
            class: "sr-only",
            for: "artifact-panel-selector"
          }, "Artifact", -1)),
          I(m(ve), {
            "input-id": "artifact-panel-selector",
            modelValue: a.value,
            "onUpdate:modelValue": [
              t[0] || (t[0] = (s) => a.value = s),
              t[1] || (t[1] = (s) => U(s))
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
              n("span", {
                class: j(["kx-artifact-select-value", { "is-placeholder": !k.value }])
              }, C(k.value?.title || (f.value ? "Loading artifacts…" : "Select an artifact")), 3)
            ]),
            option: q(({ option: s }) => [
              n("span", we, [
                n("span", Ce, C(s.title || "Untitled artifact"), 1),
                n("span", ge, C(M(s.created_at)), 1)
              ])
            ]),
            _: 1
          }, 8, ["modelValue", "options", "option-value", "placeholder", "disabled"])
        ]),
        n("div", Se, [
          n("button", {
            type: "button",
            class: "kx-panel-action",
            disabled: !a.value || !!l.value,
            onClick: X
          }, [
            I(m(E), {
              icon: l.value === "copy" ? "tabler:loader-2" : v.value ? "tabler:check" : "tabler:copy",
              class: j({ spin: l.value === "copy" }),
              "aria-hidden": "true"
            }, null, 8, ["icon", "class"]),
            B(" " + C(v.value ? "Copied" : "Copy"), 1)
          ], 8, Ae),
          n("button", {
            type: "button",
            class: "kx-panel-action",
            disabled: !a.value || !!l.value,
            onClick: Y
          }, [
            I(m(E), {
              icon: l.value === "save" ? "tabler:loader-2" : "tabler:download",
              class: j({ spin: l.value === "save" }),
              "aria-hidden": "true"
            }, null, 8, ["icon", "class"]),
            t[3] || (t[3] = B(" Save ", -1))
          ], 8, Ie),
          n("button", {
            type: "button",
            class: "kx-panel-close",
            "aria-label": "Close artifact panel",
            onClick: Z
          }, [
            I(m(E), {
              icon: "tabler:x",
              "aria-hidden": "true"
            })
          ])
        ])
      ]),
      i.value ? (S(), A("div", Te, [
        n("span", null, C(i.value), 1),
        a.value ? D("", !0) : (S(), A("button", {
          key: 0,
          type: "button",
          class: "kx-artifact-panel-retry",
          disabled: f.value,
          onClick: P
        }, "Retry", 8, Ee))
      ])) : D("", !0),
      n("span", Ve, C(v.value ? "Artifact copied to clipboard" : ""), 1),
      a.value ? (S(), A("div", Le, [
        n("w-artifact", { id: a.value }, null, 8, je)
      ])) : (S(), A("div", Ne, [
        I(m(E), {
          icon: "tabler:file-description",
          "aria-hidden": "true"
        }),
        t[4] || (t[4] = n("span", null, "Select an artifact to preview it.", -1))
      ]))
    ], 512)), [
      [fe, m(ee) !== !1]
    ]);
  }
});
class G extends ne {
  static get wippyConfig() {
    return {
      propsSchema: { type: "object", properties: {} },
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: he
    };
  }
  static get vueConfig() {
    return { rootComponent: Pe, plugins: [ie] };
  }
}
async function We() {
  return G;
}
de(import.meta.url, G);
export {
  We as webComponent
};
//# sourceMappingURL=artifact_panel.js.map
