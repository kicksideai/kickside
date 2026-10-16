import { u as _e, a as we, W as ke } from "./index-C70m2Vvt.js";
import { defineComponent as Ce, computed as m, reactive as Se, ref as $, watch as U, onMounted as xe, onBeforeUnmount as Ie, openBlock as i, createElementBlock as c, Fragment as A, createElementVNode as p, renderList as H, createBlock as W, unref as g, createCommentVNode as f, toDisplayString as h, withModifiers as Ke, createVNode as k, withDirectives as Ee, vModelText as $e, withCtx as Ae, createTextVNode as I, normalizeClass as ae, nextTick as Me } from "vue";
import { Icon as _ } from "@iconify/vue";
import { api as J, define as Te } from "@wippy-fe/proxy";
import { a as Pe } from "./pickerValue-SPnnNBeX.js";
import { _ as Le } from "./AnchoredPanel.vue_vue_type_style_index_0_lang-DSLnUKFT.js";
import { s as Oe } from "./styles-DR8LFeMF.js";
const Re = () => _e(), qe = () => we();
function ce(o, e) {
  if (o && typeof o == "object") {
    const r = o, n = r.response?.data?.error;
    if (typeof n == "string") return n;
    if (n && typeof n == "object" && typeof n.message == "string")
      return n.message;
    if (typeof r.message == "string" && r.message) return r.message;
  }
  return e;
}
function ue(o) {
  return o.drillId || o.value;
}
class Ne {
  constructor(e, r = "server") {
    this.fetchPage = e, this.declared = r, this.serverSearch = r === "server";
  }
  rows = [];
  query = "";
  nextCursor = null;
  loading = !1;
  loaded = !1;
  error = null;
  serverSearch;
  // The containers drilled into, outermost first.
  trail = [];
  generation = 0;
  failedCursor = null;
  get hasMore() {
    return this.nextCursor !== null;
  }
  // The search text is applied to the loaded rows here, not by the source.
  get filtersLocally() {
    return !this.serverSearch && this.query !== "";
  }
  get visible() {
    if (!this.filtersLocally) return this.rows;
    const e = this.query.toLowerCase();
    return this.rows.filter((r) => r.label.toLowerCase().includes(e) || r.value.toLowerCase().includes(e) || r.description.toLowerCase().includes(e));
  }
  get parentId() {
    return this.trail.length ? this.trail[this.trail.length - 1].id : "";
  }
  // Point the pager at another source (or search mode) and forget everything
  // loaded from the previous one.
  configure(e, r) {
    this.fetchPage = e, this.declared = r, this.serverSearch = r === "server", this.trail = [], this.query = "", this.clear();
  }
  // Start over at the current level for a search text (empty lists
  // everything). A source that cannot search keeps its loaded rows and only
  // filters them.
  search(e) {
    return this.query = e.trim(), !this.serverSearch && this.loaded ? Promise.resolve() : this.restart();
  }
  drill(e) {
    return !e.drillable || !e.drillId ? Promise.resolve() : (this.trail = [...this.trail, { id: e.drillId, label: e.label }], this.restart());
  }
  // Go back to the level at `depth` (0 is the top).
  up(e) {
    return e < 0 || e >= this.trail.length ? Promise.resolve() : (this.trail = this.trail.slice(0, e), this.restart());
  }
  loadMore() {
    return this.loading || this.nextCursor === null ? Promise.resolve() : this.load(this.nextCursor);
  }
  // Repeat the request that failed: the next page when rows are already
  // loaded, the first page of the level otherwise.
  retry() {
    return this.failedCursor !== null && this.rows.length ? this.load(this.failedCursor) : this.restart();
  }
  restart() {
    return this.clear(), this.load(null);
  }
  clear() {
    this.generation++, this.rows = [], this.nextCursor = null, this.loaded = !1, this.loading = !1, this.error = null, this.failedCursor = null;
  }
  async load(e) {
    const r = ++this.generation;
    this.loading = !0, this.error = null;
    const n = this.serverSearch && this.query ? this.query : "", d = {};
    n && (d.q = n), e && (d.cursor = e), this.parentId && (d.parentId = this.parentId);
    try {
      const u = await this.fetchPage(d);
      if (r !== this.generation) return;
      const C = new Set(this.rows.map(ue)), y = u.rows.filter((K) => !C.has(ue(K)));
      this.rows = [...this.rows, ...y], this.nextCursor = u.nextCursor || null, this.loaded = !0, this.failedCursor = null, this.loading = !1, typeof u.search == "boolean" && u.search !== this.serverSearch && (this.serverSearch = u.search, u.search && this.query && !n && await this.restart());
    } catch (u) {
      if (r !== this.generation) return;
      this.error = u, this.failedCursor = e, this.loading = !1;
    }
  }
}
function De(o, e) {
  return o.includes(e) ? o.filter((r) => r !== e) : [...o, e];
}
const Ue = ["items", "results", "rows", "data"];
function T(o) {
  return typeof o == "string" ? o : typeof o == "number" ? String(o) : "";
}
function de(o, e) {
  if (!o || typeof o != "object") return [];
  const r = o;
  if (e && Array.isArray(r[e])) return r[e];
  for (const n of Ue)
    if (Array.isArray(r[n])) return r[n];
  return [];
}
function Y(o, e, r) {
  const n = T(o[e.idKey]), d = T(o[e.drillKey]), u = T(o[e.labelKey]) || n || d;
  return {
    value: n,
    drillId: d,
    label: u,
    description: T(o[e.descKey]),
    icon: T(o[e.iconKey]),
    meta: e.metaKey ? T(o[e.metaKey]) : "",
    selectable: r.selectable && n !== "",
    drillable: r.drillable && d !== "",
    raw: o
  };
}
function he(o) {
  const e = o.next_cursor;
  return typeof e == "string" && e !== "" ? e : null;
}
function ze(o) {
  return async (e) => {
    const r = new URLSearchParams();
    e.q && r.set("q", e.q), r.set("limit", String(o.pageSize)), e.cursor && r.set("cursor", e.cursor), e.parentId && r.set("parent_id", e.parentId);
    const n = o.source.includes("?") ? "&" : "?", { data: d } = await J.get(`${o.source}${n}${r.toString()}`), u = d && typeof d == "object" ? d : {};
    return {
      rows: de(u, o.responseKey).map((y) => Y(y, o.keys, {
        selectable: y.selectable !== !1,
        drillable: y.drillable === !0
      })),
      nextCursor: he(u),
      search: typeof u.search == "boolean" ? u.search : void 0
    };
  };
}
class Ve extends Error {
}
function je(o) {
  const e = o.discoverPath.replace("{id}", encodeURIComponent(o.connectionId));
  return async (r) => {
    const n = { limit: o.pageSize };
    r.q && (n.q = r.q), r.cursor && (n.cursor = r.cursor), r.parentId && (n.parent_id = r.parentId);
    const { data: d } = await J.post(e, n), u = d && typeof d == "object" ? d : {}, C = Array.isArray(u.resources) ? u.resources : [], y = Array.isArray(u.items) ? u.items : [];
    if (y.length !== C.length)
      throw new Ve("The connection answered a discovery page whose items do not match its resources.");
    return { rows: C.map((P, R) => Y(P, o.keys, {
      selectable: y[R].selectable === !0,
      drillable: y[R].drillable === !0
    })), nextCursor: he(u) };
  };
}
const Be = { class: "ms-chip-label" }, Fe = ["title", "aria-label", "onClick"], Ge = ["placeholder", "aria-label", "aria-expanded"], He = ["aria-busy"], We = {
  key: 0,
  class: "ms-crumbs",
  "aria-label": "Location"
}, Je = ["onClick"], Ye = {
  key: 1,
  class: "ms-crumb ms-crumb-here",
  "aria-current": "location"
}, Ze = {
  key: 1,
  class: "ms-hint",
  role: "status"
}, Qe = {
  key: 2,
  class: "ms-alert",
  role: "alert"
}, Xe = { class: "ms-alert-text" }, et = {
  key: 3,
  class: "ms-state"
}, tt = {
  key: 4,
  class: "ms-state",
  role: "status"
}, st = {
  key: 5,
  class: "ms-state"
}, rt = {
  key: 6,
  class: "ms-list",
  role: "group",
  "aria-label": "Results"
}, ot = ["aria-pressed", "onClick", "onMousemove"], lt = { class: "ms-row-main" }, nt = { class: "ms-row-title" }, it = {
  key: 0,
  class: "ms-row-tag"
}, at = {
  key: 0,
  class: "ms-row-sub"
}, ct = ["aria-label", "onClick", "onMousemove"], ut = { class: "ms-row-main" }, dt = { class: "ms-row-title" }, ht = {
  key: 0,
  class: "ms-row-tag"
}, pt = {
  key: 0,
  class: "ms-row-sub"
}, vt = {
  key: 2,
  type: "button",
  class: "ms-row ms-row-off",
  disabled: ""
}, ft = { class: "ms-row-main" }, mt = { class: "ms-row-title" }, yt = { class: "ms-row-sub" }, bt = ["title", "aria-label", "onClick"], gt = {
  key: 7,
  class: "ms-foot"
}, _t = { class: "ms-count" }, wt = ["disabled"], kt = 20, Ct = 1e3, St = 180, xt = /* @__PURE__ */ Ce({
  __name: "MultiSelect",
  setup(o) {
    const e = Re(), r = qe(), n = m(() => e.value?.source || ""), d = m(() => e.value?.connectionId || ""), u = m(() => e.value?.discoverPath || "/api/v1/connections/{id}/discover_resources"), C = m(() => e.value?.search === "local" ? "local" : "server"), y = m(() => {
      const t = Number(e.value?.pageSize);
      return Number.isInteger(t) && t >= 1 ? Math.min(t, Ct) : kt;
    }), K = m(() => ({
      idKey: e.value?.idKey || "id",
      labelKey: e.value?.labelKey || "name",
      descKey: e.value?.descKey || "description",
      iconKey: e.value?.iconKey || "icon",
      metaKey: e.value?.metaKey || "",
      drillKey: e.value?.drillKey || "id"
    })), P = m(() => e.value?.responseKey || (d.value ? "resources" : "")), R = m(() => e.value?.unselectableHint || "This item cannot be selected."), z = m(() => e.value?.multi !== !1), Z = m(() => e.value?.placeholder || "Search…"), V = m(() => !!(d.value || n.value));
    function Q() {
      return d.value ? je({ connectionId: d.value, discoverPath: u.value, pageSize: y.value, keys: K.value }) : ze({ source: n.value, responseKey: P.value, pageSize: y.value, keys: K.value });
    }
    const l = Se(new Ne(Q(), C.value)), v = $([]), M = $({}), S = $(!1), x = $(""), w = $(-1), X = $(null), q = $(null), E = m(() => l.visible), ee = m(() => l.error ? ce(l.error, "The list could not be loaded.") : ""), pe = m(() => {
      if (l.query) return `No matches for “${l.query}”.`;
      const t = l.trail[l.trail.length - 1];
      return t ? `Nothing in ${t.label}.` : "Nothing to choose from.";
    });
    function j(t) {
      t.value && (M.value = { ...M.value, [t.value]: { label: t.label, icon: t.icon } });
    }
    function N(t) {
      return M.value[t]?.label || t;
    }
    function te(t) {
      return M.value[t]?.icon || "";
    }
    function D(t) {
      return v.value.includes(t);
    }
    function ve(t) {
      return t.drillId || t.value;
    }
    function B(t) {
      return !!t && (t.selectable || t.drillable);
    }
    async function fe(t) {
      const a = t.filter((s) => !M.value[s]);
      if (!(d.value || !n.value || !a.length))
        try {
          const { data: s } = await J.get(`${n.value}?ids=${encodeURIComponent(a.join(","))}`);
          for (const b of de(s, P.value)) j(Y(b, K.value, { selectable: !0, drillable: !1 }));
        } catch (s) {
          r("error", { message: ce(s, "The selected items could not be resolved."), error: s });
        }
    }
    U(() => e.value?.selected, (t) => {
      v.value = Pe(t), fe(v.value);
    }, { immediate: !0 }), U(() => l.rows, (t) => {
      for (const a of t) a.value && D(a.value) && !M.value[a.value] && j(a);
    }), U(() => l.error, (t) => {
      t && r("error", { message: ee.value, error: t });
    });
    const me = m(() => JSON.stringify([n.value, d.value, u.value, C.value, y.value, K.value, P.value]));
    U(me, () => {
      l.configure(Q(), C.value), x.value = "", w.value = -1, S.value && V.value && l.search("");
    });
    let L = null;
    function ye() {
      ne(), w.value = -1, L && clearTimeout(L), l.serverSearch ? L = setTimeout(() => {
        l.search(x.value);
      }, St) : l.search(x.value);
    }
    function se(t) {
      t.selectable && (j(t), z.value ? (v.value = De(v.value, t.value), Me(() => q.value?.focus())) : (v.value = [t.value], x.value = "", S.value = !1), le());
    }
    function F(t) {
      w.value = -1, l.drill(t);
    }
    function re(t) {
      w.value = -1, l.up(t);
    }
    function oe(t) {
      v.value = v.value.filter((a) => a !== t), le(), q.value?.focus();
    }
    function le() {
      r("change", { selected: [...v.value], labels: v.value.map(N) });
    }
    function ne() {
      S.value || (S.value = !0), V.value && !l.loaded && !l.loading && !l.error && l.search(x.value);
    }
    function G() {
      ne(), q.value?.focus();
    }
    function ie(t) {
      const a = E.value;
      let s = w.value;
      for (let b = 0; b < a.length; b++)
        if (s = t === 1 ? Math.min(s + 1, a.length - 1) : Math.max(s - 1, 0), B(a[s])) {
          w.value = s;
          return;
        }
    }
    function be(t) {
      t.selectable ? se(t) : t.drillable && F(t);
    }
    function ge(t) {
      if (t.key === "Escape") {
        S.value = !1;
        return;
      }
      if (t.key === "Backspace" && !x.value && v.value.length) {
        oe(v.value[v.value.length - 1]);
        return;
      }
      if (!S.value && (t.key === "ArrowDown" || t.key === "Enter")) {
        G();
        return;
      }
      if (t.key === "ArrowDown")
        t.preventDefault(), ie(1);
      else if (t.key === "ArrowUp")
        t.preventDefault(), ie(-1);
      else if (t.key === "Enter") {
        t.preventDefault();
        const a = E.value[w.value] ?? E.value.find(B);
        B(a) && be(a);
      }
    }
    return xe(() => r("load", void 0)), Ie(() => {
      L && clearTimeout(L);
    }), (t, a) => (i(), c(A, null, [
      p("div", {
        ref_key: "ctrl",
        ref: X,
        class: "ms",
        onClick: G
      }, [
        (i(!0), c(A, null, H(v.value, (s) => (i(), c("span", {
          key: s,
          class: "ms-chip"
        }, [
          te(s) ? (i(), W(g(_), {
            key: 0,
            icon: te(s),
            class: "ms-chip-ico",
            "aria-hidden": "true"
          }, null, 8, ["icon"])) : f("", !0),
          p("span", Be, h(N(s)), 1),
          p("button", {
            type: "button",
            class: "ms-chip-x",
            title: `Remove ${N(s)}`,
            "aria-label": `Remove ${N(s)}`,
            onClick: Ke((b) => oe(s), ["stop"])
          }, [
            k(g(_), {
              icon: "tabler:x",
              "aria-hidden": "true"
            })
          ], 8, Fe)
        ]))), 128)),
        Ee(p("input", {
          ref_key: "inputEl",
          ref: q,
          "onUpdate:modelValue": a[0] || (a[0] = (s) => x.value = s),
          class: "ms-input",
          type: "text",
          placeholder: v.value.length && z.value ? "" : Z.value,
          "aria-label": Z.value,
          "aria-expanded": S.value,
          spellcheck: "false",
          autocomplete: "off",
          onFocus: G,
          onInput: ye,
          onKeydown: ge
        }, null, 40, Ge), [
          [$e, x.value]
        ])
      ], 512),
      k(Le, {
        open: S.value,
        "onUpdate:open": a[4] || (a[4] = (s) => S.value = s),
        anchor: X.value,
        "min-width": 260,
        "max-height": 340
      }, {
        default: Ae(() => [
          p("div", {
            class: "ms-pop",
            "aria-busy": l.loading
          }, [
            l.trail.length ? (i(), c("nav", We, [
              p("button", {
                type: "button",
                class: "ms-crumb",
                onClick: a[1] || (a[1] = (s) => re(0))
              }, "All"),
              (i(!0), c(A, null, H(l.trail, (s, b) => (i(), c(A, {
                key: s.id
              }, [
                k(g(_), {
                  icon: "tabler:chevron-right",
                  class: "ms-crumb-sep",
                  "aria-hidden": "true"
                }),
                b < l.trail.length - 1 ? (i(), c("button", {
                  key: 0,
                  type: "button",
                  class: "ms-crumb",
                  onClick: (O) => re(b + 1)
                }, h(s.label), 9, Je)) : (i(), c("span", Ye, h(s.label), 1))
              ], 64))), 128))
            ])) : f("", !0),
            l.filtersLocally ? (i(), c("p", Ze, [
              I(" This source cannot search, so only the " + h(l.rows.length) + " loaded items are filtered.", 1),
              l.hasMore ? (i(), c(A, { key: 0 }, [
                I(" Load more to search further.")
              ], 64)) : f("", !0)
            ])) : f("", !0),
            l.error ? (i(), c("div", Qe, [
              k(g(_), {
                icon: "tabler:alert-circle",
                class: "ms-alert-ico",
                "aria-hidden": "true"
              }),
              p("span", Xe, h(ee.value), 1),
              p("button", {
                type: "button",
                class: "ms-link",
                onClick: a[2] || (a[2] = (s) => l.retry())
              }, "Try again")
            ])) : f("", !0),
            V.value ? l.loading && !l.rows.length ? (i(), c("div", tt, [
              k(g(_), {
                icon: "tabler:loader-2",
                class: "spin",
                "aria-hidden": "true"
              }),
              I(" " + h(l.query && l.serverSearch ? "Searching…" : "Loading…"), 1)
            ])) : l.loaded && !E.value.length && !l.error ? (i(), c("div", st, h(pe.value), 1)) : f("", !0) : (i(), c("div", et, "This picker has no source to list from.")),
            E.value.length ? (i(), c("div", rt, [
              (i(!0), c(A, null, H(E.value, (s, b) => (i(), c("div", {
                key: ve(s),
                class: "ms-item"
              }, [
                s.selectable ? (i(), c("button", {
                  key: 0,
                  type: "button",
                  class: ae(["ms-row", [D(s.value) && "ms-row-on", b === w.value && "ms-row-active"]]),
                  "aria-pressed": D(s.value),
                  onClick: (O) => se(s),
                  onMousemove: (O) => w.value = b
                }, [
                  k(g(_), {
                    icon: s.icon || "tabler:point",
                    class: "ms-row-ico",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"]),
                  p("span", lt, [
                    p("span", nt, [
                      I(h(s.label) + " ", 1),
                      s.meta ? (i(), c("span", it, h(s.meta), 1)) : f("", !0)
                    ]),
                    s.description ? (i(), c("span", at, h(s.description), 1)) : f("", !0)
                  ]),
                  D(s.value) ? (i(), W(g(_), {
                    key: 0,
                    icon: "tabler:check",
                    class: "ms-row-check",
                    "aria-hidden": "true"
                  })) : f("", !0)
                ], 42, ot)) : s.drillable ? (i(), c("button", {
                  key: 1,
                  type: "button",
                  class: ae(["ms-row", b === w.value && "ms-row-active"]),
                  "aria-label": `Open ${s.label}`,
                  onClick: (O) => F(s),
                  onMousemove: (O) => w.value = b
                }, [
                  k(g(_), {
                    icon: s.icon || "tabler:folder",
                    class: "ms-row-ico",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"]),
                  p("span", ut, [
                    p("span", dt, [
                      I(h(s.label) + " ", 1),
                      s.meta ? (i(), c("span", ht, h(s.meta), 1)) : f("", !0)
                    ]),
                    s.description ? (i(), c("span", pt, h(s.description), 1)) : f("", !0)
                  ]),
                  k(g(_), {
                    icon: "tabler:chevron-right",
                    class: "ms-row-go",
                    "aria-hidden": "true"
                  })
                ], 42, ct)) : (i(), c("button", vt, [
                  k(g(_), {
                    icon: s.icon || "tabler:point",
                    class: "ms-row-ico",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"]),
                  p("span", ft, [
                    p("span", mt, h(s.label), 1),
                    p("span", yt, h(R.value), 1)
                  ])
                ])),
                s.selectable && s.drillable ? (i(), c("button", {
                  key: 3,
                  type: "button",
                  class: "ms-row-drill",
                  title: `Open ${s.label}`,
                  "aria-label": `Open ${s.label}`,
                  onClick: (O) => F(s)
                }, [
                  k(g(_), {
                    icon: "tabler:chevron-right",
                    "aria-hidden": "true"
                  })
                ], 8, bt)) : f("", !0)
              ]))), 128))
            ])) : f("", !0),
            l.hasMore ? (i(), c("div", gt, [
              p("span", _t, [
                I(h(E.value.length) + " shown", 1),
                z.value ? (i(), c(A, { key: 0 }, [
                  I(" · " + h(v.value.length) + " selected", 1)
                ], 64)) : f("", !0)
              ]),
              p("button", {
                type: "button",
                class: "ms-more",
                disabled: l.loading,
                onClick: a[3] || (a[3] = (s) => l.loadMore())
              }, [
                l.loading ? (i(), W(g(_), {
                  key: 0,
                  icon: "tabler:loader-2",
                  class: "spin",
                  "aria-hidden": "true"
                })) : f("", !0),
                I(" " + h(l.loading ? "Loading…" : "Load more"), 1)
              ], 8, wt)
            ])) : f("", !0)
          ], 8, He)
        ]),
        _: 1
      }, 8, ["open", "anchor"])
    ], 64));
  }
}), It = {
  type: "object",
  properties: {
    source: { type: "string", default: "", description: "List endpoint the picker pages through: GET ?q=&limit=&cursor=&parent_id=, rows under response-key, next_cursor for the following page, optional boolean search declaring server-side search. ?ids=<csv> resolves preselected chips." },
    "connection-id": { type: "string", default: "", description: "Connection component id whose discovery lists the rows (replaces source). Rows are the provider's resources; selectable/drillable come from the discovery envelope." },
    "discover-path": { type: "string", default: "/api/v1/connections/{id}/discover_resources", description: "POST endpoint template for a connection's discovery; {id} is the connection id, the body carries q, limit, cursor, parent_id." },
    search: { type: "string", default: "server", description: "server sends the search text to the source; local filters the loaded pages and says so. A source answering a boolean search overrides it." },
    "page-size": { type: "integer", default: 20, description: "Rows requested per page (1-1000)." },
    "drill-key": { type: "string", default: "id", description: "Row field sent as parent_id when a drillable row is opened." },
    "unselectable-hint": { type: "string", default: "This item cannot be selected.", description: "Reason shown on rows the source marks non-selectable (and not drillable)." },
    "id-key": { type: "string", default: "id", description: "Item field used as the selected value (e.g. id, skill_id, full_path)." },
    "label-key": { type: "string", default: "name", description: "Item field shown as the label (e.g. name, title)." },
    "desc-key": { type: "string", default: "description", description: "Item field shown as the secondary description line." },
    "icon-key": { type: "string", default: "icon", description: "Item field holding a Tabler icon name." },
    "meta-key": { type: "string", default: "", description: "Optional item field shown as a small tag next to the label." },
    selected: { type: "string", default: "", description: "Initially selected ids — a JSON array string, a CSV string, or a single id." },
    multi: { type: "boolean", default: !0, description: "Allow multiple selections (chips). When false, a pick replaces the selection." },
    placeholder: { type: "string", default: "Search…", description: "Search input placeholder." },
    "response-key": { type: "string", default: "", description: "Field on the JSON response holding the rows array. Auto-detected (items/skills/traits/results/rows/data) when empty." }
  }
};
class Kt extends ke {
  static get wippyConfig() {
    return {
      propsSchema: It,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: Oe
    };
  }
  static get vueConfig() {
    return { rootComponent: xt };
  }
}
Te(import.meta.url, Kt);
//# sourceMappingURL=multiselect.js.map
