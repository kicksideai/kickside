import { a as te, b as ae, W as ne } from "./wc-runtime-BJD-5iaH.js";
import { P as se } from "./primevue-plugin-CaP7wV_M.js";
import { defineComponent as ie, ref as p, computed as le, onMounted as oe, onBeforeUnmount as re, withDirectives as ce, openBlock as S, createElementBlock as A, createElementVNode as s, createVNode as I, unref as m, withCtx as q, toDisplayString as w, normalizeClass as j, createTextVNode as B, createCommentVNode as D, vShow as ue } from "vue";
import { Icon as E } from "@iconify/vue";
import { on as G, define as fe } from "@wippy-fe/proxy";
import de from "primevue/select";
import { a as b } from "./artifactPresentation-Dgf5Fs_k.js";
import { u as ve } from "./useSessionsApi-P7vRdJK6.js";
import { s as pe } from "./styles-B4tHWzmY.js";
const me = {
  class: "kx-artifact-panel",
  "aria-label": "Artifact preview"
}, be = { class: "kx-artifact-panel-head" }, ye = { class: "kx-artifact-panel-title" }, he = { class: "kx-artifact-select-option" }, ke = { class: "kx-artifact-select-option-title" }, _e = { class: "kx-artifact-select-option-sub" }, xe = { class: "kx-artifact-panel-actions" }, ge = ["disabled"], we = ["disabled"], Ce = {
  key: 0,
  class: "kx-artifact-panel-error",
  role: "alert"
}, Se = ["disabled"], Ae = {
  class: "sr-only",
  "aria-live": "polite"
}, Ie = {
  key: 1,
  class: "kx-artifact-panel-body"
}, Ve = ["id"], Ee = {
  key: 2,
  class: "kx-artifact-panel-empty"
}, Te = /* @__PURE__ */ ie({
  __name: "ArtifactPanel",
  setup(F) {
    const T = ve(), L = te(), c = p([]), a = p(""), u = p(O(window.location.pathname)), f = p(!!u.value), o = p(""), i = p(""), v = p(!1), V = [], U = /* @__PURE__ */ new Set();
    let d = null, y = 0, h = 0, k = "";
    const _ = le(() => c.value.find((e) => b(e) === a.value));
    function W(e) {
      if (!e || typeof e != "object") return "";
      const t = e;
      return String(t.uuid || t.artifactId || "");
    }
    function K(e) {
      if (!e || typeof e != "object") return "";
      const t = e;
      return String(t.sessionId || t.session_id || "");
    }
    function O(e) {
      if (!e.startsWith("/sessions/")) return "";
      const t = e.slice(10).split("/")[0] || "";
      try {
        return decodeURIComponent(t);
      } catch {
        return "";
      }
    }
    async function N() {
      const e = u.value, t = ++y;
      if (!e) {
        c.value = [], a.value = "", f.value = !1, i.value = "";
        return;
      }
      f.value = !0, i.value = "";
      try {
        const n = await T.artifacts({ sessionId: e, limit: 100 });
        if (t !== y || e !== u.value) return;
        const r = _.value, l = n.artifacts.filter((g) => !g.session_id || g.session_id === e), x = r?.session_id === e && !l.some((g) => b(g) === a.value) ? [r, ...l] : l;
        c.value = x, !x.some((g) => b(g) === a.value) && !k && (a.value = x[0] ? b(x[0]) : "");
      } catch (n) {
        if (t !== y || e !== u.value) return;
        a.value || (i.value = n.message || "Could not load artifacts");
      } finally {
        t === y && (f.value = !1);
      }
    }
    function C() {
      d && clearTimeout(d), d = setTimeout(() => {
        N();
      }, 150);
    }
    async function R(e) {
      if (!e) return;
      const t = u.value;
      if (!t) return;
      if (v.value = !1, i.value = "", c.value.some((l) => b(l) === e)) {
        h++, k = "", a.value = e;
        return;
      }
      if (U.has(e)) return;
      const n = ++h;
      k = e;
      const r = a.value;
      a.value = "", U.add(e);
      try {
        const l = await T.artifact(e);
        if (n !== h || t !== u.value) {
          a.value || (a.value = r);
          return;
        }
        if (l.session_id && l.session_id !== t) {
          a.value = r;
          return;
        }
        c.value = [l, ...c.value.filter((x) => b(x) !== e)], a.value = e;
      } catch (l) {
        n === h && (a.value || (a.value = r), i.value = l.message || "Could not load artifact details");
      } finally {
        U.delete(e), k === e && (k = "");
      }
    }
    function z(e) {
      e !== u.value && (u.value = e, y++, h++, d && (clearTimeout(d), d = null), c.value = [], a.value = "", k = "", v.value = !1, i.value = "", f.value = !!e, e && C());
    }
    function H(e) {
      if (e.channel === "kickside:artifact-session") {
        z(K(e.payload));
        return;
      }
      if (e.channel !== "kickside:artifact-open") return;
      const t = W(e.payload);
      t && (R(t), C());
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
      return `${String(e || "artifact").trim().replace(/[<>:"/\\|?*\u0000-\u001f]+/g, "-").replace(/[. ]+$/g, "") || "artifact"}.${J(_.value?.content_type)}`;
    }
    async function P() {
      if (!a.value) throw new Error("Select an artifact first");
      return T.artifactContent(a.value);
    }
    async function X() {
      o.value = "copy", i.value = "";
      try {
        await navigator.clipboard.writeText(await P()), v.value = !0, window.setTimeout(() => {
          v.value = !1;
        }, 1600);
      } catch (e) {
        i.value = e.message || "Could not copy artifact";
      } finally {
        o.value = "";
      }
    }
    async function Y() {
      o.value = "save", i.value = "";
      try {
        const e = await P(), t = new Blob([e], { type: _.value?.content_type || "text/plain;charset=utf-8" }), n = URL.createObjectURL(t), r = document.createElement("a");
        r.href = n, r.download = Q(_.value?.title), r.click(), URL.revokeObjectURL(n);
      } catch (e) {
        i.value = e.message || "Could not save artifact";
      } finally {
        o.value = "";
      }
    }
    function Z() {
      L?.broadcast("kickside:artifact-close", { panelId: "artifact" });
    }
    const ee = ae(C);
    return oe(() => {
      const e = L?.subscribe(H);
      e && V.push(e), V.push(G("artifact:*", C)), V.push(G("session:*", C));
    }), re(() => {
      V.forEach((e) => e()), y++, h++, d && clearTimeout(d);
    }), (e, t) => ce((S(), A("section", me, [
      s("header", be, [
        s("div", ye, [
          t[2] || (t[2] = s("label", {
            class: "sr-only",
            for: "artifact-panel-selector"
          }, "Artifact", -1)),
          I(m(de), {
            "input-id": "artifact-panel-selector",
            modelValue: a.value,
            "onUpdate:modelValue": [
              t[0] || (t[0] = (n) => a.value = n),
              t[1] || (t[1] = (n) => R(n))
            ],
            class: "kx-artifact-panel-select",
            "overlay-class": "kx-artifact-panel-select-overlay",
            options: c.value,
            "option-label": "title",
            "option-value": m(b),
            placeholder: f.value ? "Loading artifacts…" : "Select an artifact",
            disabled: f.value
          }, {
            value: q(() => [
              s("span", {
                class: j(["kx-artifact-select-value", { "is-placeholder": !_.value }])
              }, w(_.value?.title || (f.value ? "Loading artifacts…" : "Select an artifact")), 3)
            ]),
            option: q(({ option: n }) => [
              s("span", he, [
                s("span", ke, w(n.title || "Untitled artifact"), 1),
                s("span", _e, w(M(n.created_at)), 1)
              ])
            ]),
            _: 1
          }, 8, ["modelValue", "options", "option-value", "placeholder", "disabled"])
        ]),
        s("div", xe, [
          s("button", {
            type: "button",
            class: "kx-panel-action",
            disabled: !a.value || !!o.value,
            onClick: X
          }, [
            I(m(E), {
              icon: o.value === "copy" ? "tabler:loader-2" : v.value ? "tabler:check" : "tabler:copy",
              class: j({ spin: o.value === "copy" }),
              "aria-hidden": "true"
            }, null, 8, ["icon", "class"]),
            B(" " + w(v.value ? "Copied" : "Copy"), 1)
          ], 8, ge),
          s("button", {
            type: "button",
            class: "kx-panel-action",
            disabled: !a.value || !!o.value,
            onClick: Y
          }, [
            I(m(E), {
              icon: o.value === "save" ? "tabler:loader-2" : "tabler:download",
              class: j({ spin: o.value === "save" }),
              "aria-hidden": "true"
            }, null, 8, ["icon", "class"]),
            t[3] || (t[3] = B(" Save ", -1))
          ], 8, we),
          s("button", {
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
      i.value ? (S(), A("div", Ce, [
        s("span", null, w(i.value), 1),
        a.value ? D("", !0) : (S(), A("button", {
          key: 0,
          type: "button",
          class: "kx-artifact-panel-retry",
          disabled: f.value,
          onClick: N
        }, "Retry", 8, Se))
      ])) : D("", !0),
      s("span", Ae, w(v.value ? "Artifact copied to clipboard" : ""), 1),
      a.value ? (S(), A("div", Ie, [
        s("w-artifact", { id: a.value }, null, 8, Ve)
      ])) : (S(), A("div", Ee, [
        I(m(E), {
          icon: "tabler:file-description",
          "aria-hidden": "true"
        }),
        t[4] || (t[4] = s("span", null, "Select an artifact to preview it.", -1))
      ]))
    ], 512)), [
      [ue, m(ee) !== !1]
    ]);
  }
});
class $ extends ne {
  static get wippyConfig() {
    return {
      propsSchema: { type: "object", properties: {} },
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: pe
    };
  }
  static get vueConfig() {
    return { rootComponent: Te, plugins: [se] };
  }
}
async function $e() {
  return $;
}
fe(import.meta.url, $);
export {
  $e as webComponent
};
//# sourceMappingURL=artifact_panel.js.map
