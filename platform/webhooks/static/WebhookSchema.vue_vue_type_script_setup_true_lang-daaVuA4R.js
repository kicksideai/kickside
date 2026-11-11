import { ref as m, defineComponent as k, computed as _, openBlock as s, createElementBlock as c, Fragment as v, renderList as E, createElementVNode as f, toDisplayString as h, createCommentVNode as w } from "vue";
import { api as a, host as g } from "@wippy-fe/proxy";
function S(e, t) {
  if (e && typeof e == "object") {
    const o = e, r = o.response?.data?.error;
    if (typeof r == "string") return r;
    if (r && typeof r == "object" && typeof r.message == "string")
      return r.message;
    if (typeof o.message == "string" && o.message) return o.message;
  }
  return t;
}
const A = {
  active: "Active",
  revoked: "Revoked"
};
function P(e) {
  return e ? A[e] ?? e : "";
}
const j = {
  "Component not found or insufficient access to delete": "This webhook could not be found — it may already have been removed. Refresh the list."
};
function R(e) {
  return j[e] ?? e;
}
function i(e, t) {
  if (e && typeof e == "object") {
    const o = e;
    o.response?.status === 401 && g.handleError("auth-expired", o);
  }
  return S(e, t);
}
async function L() {
  try {
    const e = [];
    let t;
    do {
      const o = "/api/v1/webhooks" + (t ? "?cursor=" + encodeURIComponent(t) : ""), { data: r } = await a.get(o);
      if (!r?.success) throw new Error(r?.error || "failed to load webhooks");
      e.push(...r.webhooks), t = r.next_cursor;
    } while (t);
    return e;
  } catch (e) {
    throw new Error(i(e, "could not load webhooks"));
  }
}
async function T(e) {
  return (await L()).find((o) => o.webhook_id === e) || null;
}
async function D(e) {
  try {
    const { data: t } = await a.post("/api/v1/webhooks", e);
    if (!t?.success || !t.webhook) throw new Error(t?.error || "create failed");
    return t.webhook;
  } catch (t) {
    throw new Error(i(t, "could not create webhook"));
  }
}
async function F(e) {
  try {
    const { data: t } = await a.post("/api/v1/webhooks/" + encodeURIComponent(e) + "/revoke", {});
    if (!t?.success) throw new Error(t?.error || "revoke failed");
  } catch (t) {
    throw new Error(i(t, "could not revoke webhook"));
  }
}
async function M(e) {
  try {
    const { data: t } = await a.delete("/api/v1/webhooks/" + encodeURIComponent(e));
    if (!t?.success) throw new Error(t?.error || "delete failed");
  } catch (t) {
    throw new Error(R(i(t, "could not delete webhook")));
  }
}
async function H(e, t) {
  try {
    const { data: o } = await a.patch("/api/v1/webhooks/" + encodeURIComponent(e), t);
    if (!o?.success || !o.webhook) throw new Error(o?.error || "update failed");
    return o.webhook;
  } catch (o) {
    throw new Error(i(o, "could not update webhook"));
  }
}
const b = m("");
let y = !1;
async function U() {
  if (!y) {
    y = !0;
    try {
      const o = (await import("/api/public/env/public.js")).default, r = o && typeof o.PUBLIC_API_URL == "string" ? o.PUBLIC_API_URL : "";
      r && (b.value = r.replace(/\/+$/, ""));
    } catch {
    }
  }
}
function K(e) {
  U();
  const t = "/api/public/hooks/" + e, o = b.value || window.location.origin;
  try {
    return new URL(t, o).toString();
  } catch {
    return t;
  }
}
const l = {
  type: "object",
  additionalProperties: !0,
  properties: {}
};
function V(e) {
  try {
    return JSON.stringify(e || l, null, 2);
  } catch {
    return JSON.stringify(l, null, 2);
  }
}
function $(e) {
  const t = e.trim();
  if (!t) return { schema: l };
  try {
    const o = JSON.parse(t);
    return !o || typeof o != "object" || Array.isArray(o) ? { error: "Schema must be a JSON object." } : { schema: o };
  } catch (o) {
    return { error: o instanceof Error ? o.message : "Invalid JSON schema." };
  }
}
function C(e) {
  if (!e || typeof e != "object") return [];
  const t = e, o = t.properties;
  if (!o || typeof o != "object") return [];
  const r = Array.isArray(t.required) ? t.required.map(String) : [];
  return Object.entries(o).map(([p, n]) => {
    const d = n && typeof n == "object" ? n : {}, u = d.type;
    return {
      key: p,
      type: Array.isArray(u) ? u.join(" | ") : typeof u == "string" ? u : "any",
      required: r.includes(p),
      description: typeof d.description == "string" ? d.description : void 0
    };
  });
}
const B = {
  key: 0,
  class: "wh-schema-fields"
}, O = { class: "wh-field-key" }, q = { class: "wh-field-type" }, I = {
  key: 0,
  class: "wh-field-req"
}, N = ["title"], W = {
  key: 1,
  class: "wh-schema-any"
}, z = /* @__PURE__ */ k({
  __name: "WebhookSchema",
  props: {
    schema: {}
  },
  setup(e) {
    const t = e, o = _(() => C(t.schema || {}));
    return (r, p) => o.value.length ? (s(), c("div", B, [
      (s(!0), c(v, null, E(o.value, (n) => (s(), c("div", {
        key: n.key,
        class: "wh-field-row"
      }, [
        f("span", O, h(n.key), 1),
        f("span", q, h(n.type), 1),
        n.required ? (s(), c("span", I, "required")) : w("", !0),
        n.description ? (s(), c("span", {
          key: 1,
          class: "wh-field-desc",
          title: n.description
        }, h(n.description), 9, N)) : w("", !0)
      ]))), 128))
    ])) : (s(), c("div", W, "Accepts any JSON object — no fields are required."));
  }
});
export {
  l as D,
  z as _,
  V as a,
  L as b,
  D as c,
  M as d,
  i as e,
  T as f,
  K as i,
  $ as p,
  F as r,
  H as u,
  P as w
};
//# sourceMappingURL=WebhookSchema.vue_vue_type_script_setup_true_lang-daaVuA4R.js.map
