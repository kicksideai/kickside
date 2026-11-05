import { u as _e, a as we, W as ke } from "./index-C70m2Vvt.js";
import { defineComponent as Ce, computed as m, reactive as Se, ref as $, watch as U, onMounted as xe, onBeforeUnmount as Ie, openBlock as i, createElementBlock as n, Fragment as A, createElementVNode as p, renderList as H, createBlock as W, unref as g, createCommentVNode as f, toDisplayString as h, withModifiers as Ke, createVNode as k, withDirectives as Ee, vModelText as $e, withCtx as Ae, createTextVNode as I, normalizeClass as ne, nextTick as Me } from "vue";
import { Icon as _ } from "@iconify/vue";
import { api as J, define as Te } from "@wippy-fe/proxy";
import { a as Pe } from "./pickerValue-SPnnNBeX.js";
import { e as ce } from "./errMsg-CxKGcp1F.js";
import { _ as Le } from "./AnchoredPanel.vue_vue_type_style_index_0_lang-DSLnUKFT.js";
import { s as Oe } from "./styles-DR8LFeMF.js";
const Re = () => _e(), qe = () => we();
function ue(r) {
  return r.drillId || r.value;
}
class Ne {
  constructor(e, l = "server") {
    this.fetchPage = e, this.declared = l, this.serverSearch = l === "server";
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
    return this.rows.filter((l) => l.label.toLowerCase().includes(e) || l.value.toLowerCase().includes(e) || l.description.toLowerCase().includes(e));
  }
  get parentId() {
    return this.trail.length ? this.trail[this.trail.length - 1].id : "";
  }
  // Point the pager at another source (or search mode) and forget everything
  // loaded from the previous one.
  configure(e, l) {
    this.fetchPage = e, this.declared = l, this.serverSearch = l === "server", this.trail = [], this.query = "", this.clear();
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
    const l = ++this.generation;
    this.loading = !0, this.error = null;
    const u = this.serverSearch && this.query ? this.query : "", d = {};
    u && (d.q = u), e && (d.cursor = e), this.parentId && (d.parentId = this.parentId);
    try {
      const c = await this.fetchPage(d);
      if (l !== this.generation) return;
      const C = new Set(this.rows.map(ue)), y = c.rows.filter((K) => !C.has(ue(K)));
      this.rows = [...this.rows, ...y], this.nextCursor = c.nextCursor || null, this.loaded = !0, this.failedCursor = null, this.loading = !1, typeof c.search == "boolean" && c.search !== this.serverSearch && (this.serverSearch = c.search, c.search && this.query && !u && await this.restart());
    } catch (c) {
      if (l !== this.generation) return;
      this.error = c, this.failedCursor = e, this.loading = !1;
    }
  }
}
function De(r, e) {
  return r.includes(e) ? r.filter((l) => l !== e) : [...r, e];
}
const Ue = ["items", "results", "rows", "data"];
function T(r) {
  return typeof r == "string" ? r : typeof r == "number" ? String(r) : "";
}
function de(r, e) {
  if (!r || typeof r != "object") return [];
  const l = r;
  if (e && Array.isArray(l[e])) return l[e];
  for (const u of Ue)
    if (Array.isArray(l[u])) return l[u];
  return [];
}
function Y(r, e, l) {
  const u = T(r[e.idKey]), d = T(r[e.drillKey]), c = T(r[e.labelKey]) || u || d;
  return {
    value: u,
    drillId: d,
    label: c,
    description: T(r[e.descKey]),
    icon: T(r[e.iconKey]),
    meta: e.metaKey ? T(r[e.metaKey]) : "",
    selectable: l.selectable && u !== "",
    drillable: l.drillable && d !== "",
    raw: r
  };
}
function he(r) {
  const e = r.next_cursor;
  return typeof e == "string" && e !== "" ? e : null;
}
function ze(r) {
  return async (e) => {
    const l = new URLSearchParams();
    e.q && l.set("q", e.q), l.set("limit", String(r.pageSize)), e.cursor && l.set("cursor", e.cursor), e.parentId && l.set("parent_id", e.parentId);
    const u = r.source.includes("?") ? "&" : "?", { data: d } = await J.get(`${r.source}${u}${l.toString()}`), c = d && typeof d == "object" ? d : {};
    return {
      rows: de(c, r.responseKey).map((y) => Y(y, r.keys, {
        selectable: y.selectable !== !1,
        drillable: y.drillable === !0
      })),
      nextCursor: he(c),
      search: typeof c.search == "boolean" ? c.search : void 0
    };
  };
}
class Ve extends Error {
}
function Be(r) {
  const e = r.discoverPath.replace("{id}", encodeURIComponent(r.connectionId));
  return async (l) => {
    const u = { limit: r.pageSize };
    l.q && (u.q = l.q), l.cursor && (u.cursor = l.cursor), l.parentId && (u.parent_id = l.parentId);
    const { data: d } = await J.post(e, u), c = d && typeof d == "object" ? d : {}, C = Array.isArray(c.resources) ? c.resources : [], y = Array.isArray(c.items) ? c.items : [];
    if (y.length !== C.length)
      throw new Ve("The connection answered a discovery page whose items do not match its resources.");
    return { rows: C.map((P, R) => Y(P, r.keys, {
      selectable: y[R].selectable === !0,
      drillable: y[R].drillable === !0
    })), nextCursor: he(c) };
  };
}
const je = { class: "ms-chip-label" }, Fe = ["title", "aria-label", "onClick"], Ge = ["placeholder", "aria-label", "aria-expanded"], He = ["aria-busy"], We = {
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
}, lt = ["aria-pressed", "onClick", "onMousemove"], ot = { class: "ms-row-main" }, it = { class: "ms-row-title" }, at = {
  key: 0,
  class: "ms-row-tag"
}, nt = {
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
  setup(r) {
    const e = Re(), l = qe(), u = m(() => e.value?.source || ""), d = m(() => e.value?.connectionId || ""), c = m(() => e.value?.discoverPath || "/api/v1/connections/{id}/discover_resources"), C = m(() => e.value?.search === "local" ? "local" : "server"), y = m(() => {
      const t = Number(e.value?.pageSize);
      return Number.isInteger(t) && t >= 1 ? Math.min(t, Ct) : kt;
    }), K = m(() => ({
      idKey: e.value?.idKey || "id",
      labelKey: e.value?.labelKey || "name",
      descKey: e.value?.descKey || "description",
      iconKey: e.value?.iconKey || "icon",
      metaKey: e.value?.metaKey || "",
      drillKey: e.value?.drillKey || "id"
    })), P = m(() => e.value?.responseKey || (d.value ? "resources" : "")), R = m(() => e.value?.unselectableHint || "This item cannot be selected."), z = m(() => e.value?.multi !== !1), Z = m(() => e.value?.placeholder || "Search…"), V = m(() => !!(d.value || u.value));
    function Q() {
      return d.value ? Be({ connectionId: d.value, discoverPath: c.value, pageSize: y.value, keys: K.value }) : ze({ source: u.value, responseKey: P.value, pageSize: y.value, keys: K.value });
    }
    const o = Se(new Ne(Q(), C.value)), v = $([]), M = $({}), S = $(!1), x = $(""), w = $(-1), X = $(null), q = $(null), E = m(() => o.visible), ee = m(() => o.error ? ce(o.error, "The list could not be loaded.") : ""), pe = m(() => {
      if (o.query) return `No matches for “${o.query}”.`;
      const t = o.trail[o.trail.length - 1];
      return t ? `Nothing in ${t.label}.` : "Nothing to choose from.";
    });
    function B(t) {
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
    function j(t) {
      return !!t && (t.selectable || t.drillable);
    }
    async function fe(t) {
      const a = t.filter((s) => !M.value[s]);
      if (!(d.value || !u.value || !a.length))
        try {
          const { data: s } = await J.get(`${u.value}?ids=${encodeURIComponent(a.join(","))}`);
          for (const b of de(s, P.value)) B(Y(b, K.value, { selectable: !0, drillable: !1 }));
        } catch (s) {
          l("error", { message: ce(s, "The selected items could not be resolved."), error: s });
        }
    }
    U(() => e.value?.selected, (t) => {
      v.value = Pe(t), fe(v.value);
    }, { immediate: !0 }), U(() => o.rows, (t) => {
      for (const a of t) a.value && D(a.value) && !M.value[a.value] && B(a);
    }), U(() => o.error, (t) => {
      t && l("error", { message: ee.value, error: t });
    });
    const me = m(() => JSON.stringify([u.value, d.value, c.value, C.value, y.value, K.value, P.value]));
    U(me, () => {
      o.configure(Q(), C.value), x.value = "", w.value = -1, S.value && V.value && o.search("");
    });
    let L = null;
    function ye() {
      ie(), w.value = -1, L && clearTimeout(L), o.serverSearch ? L = setTimeout(() => {
        o.search(x.value);
      }, St) : o.search(x.value);
    }
    function se(t) {
      t.selectable && (B(t), z.value ? (v.value = De(v.value, t.value), Me(() => q.value?.focus())) : (v.value = [t.value], x.value = "", S.value = !1), oe());
    }
    function F(t) {
      w.value = -1, o.drill(t);
    }
    function re(t) {
      w.value = -1, o.up(t);
    }
    function le(t) {
      v.value = v.value.filter((a) => a !== t), oe(), q.value?.focus();
    }
    function oe() {
      l("change", { selected: [...v.value], labels: v.value.map(N) });
    }
    function ie() {
      S.value || (S.value = !0), V.value && !o.loaded && !o.loading && !o.error && o.search(x.value);
    }
    function G() {
      ie(), q.value?.focus();
    }
    function ae(t) {
      const a = E.value;
      let s = w.value;
      for (let b = 0; b < a.length; b++)
        if (s = t === 1 ? Math.min(s + 1, a.length - 1) : Math.max(s - 1, 0), j(a[s])) {
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
        le(v.value[v.value.length - 1]);
        return;
      }
      if (!S.value && (t.key === "ArrowDown" || t.key === "Enter")) {
        G();
        return;
      }
      if (t.key === "ArrowDown")
        t.preventDefault(), ae(1);
      else if (t.key === "ArrowUp")
        t.preventDefault(), ae(-1);
      else if (t.key === "Enter") {
        t.preventDefault();
        const a = E.value[w.value] ?? E.value.find(j);
        j(a) && be(a);
      }
    }
    return xe(() => l("load", void 0)), Ie(() => {
      L && clearTimeout(L);
    }), (t, a) => (i(), n(A, null, [
      p("div", {
        ref_key: "ctrl",
        ref: X,
        class: "ms",
        onClick: G
      }, [
        (i(!0), n(A, null, H(v.value, (s) => (i(), n("span", {
          key: s,
          class: "ms-chip"
        }, [
          te(s) ? (i(), W(g(_), {
            key: 0,
            icon: te(s),
            class: "ms-chip-ico",
            "aria-hidden": "true"
          }, null, 8, ["icon"])) : f("", !0),
          p("span", je, h(N(s)), 1),
          p("button", {
            type: "button",
            class: "ms-chip-x",
            title: `Remove ${N(s)}`,
            "aria-label": `Remove ${N(s)}`,
            onClick: Ke((b) => le(s), ["stop"])
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
            "aria-busy": o.loading
          }, [
            o.trail.length ? (i(), n("nav", We, [
              p("button", {
                type: "button",
                class: "ms-crumb",
                onClick: a[1] || (a[1] = (s) => re(0))
              }, "All"),
              (i(!0), n(A, null, H(o.trail, (s, b) => (i(), n(A, {
                key: s.id
              }, [
                k(g(_), {
                  icon: "tabler:chevron-right",
                  class: "ms-crumb-sep",
                  "aria-hidden": "true"
                }),
                b < o.trail.length - 1 ? (i(), n("button", {
                  key: 0,
                  type: "button",
                  class: "ms-crumb",
                  onClick: (O) => re(b + 1)
                }, h(s.label), 9, Je)) : (i(), n("span", Ye, h(s.label), 1))
              ], 64))), 128))
            ])) : f("", !0),
            o.filtersLocally ? (i(), n("p", Ze, [
              I(" This source cannot search, so only the " + h(o.rows.length) + " loaded items are filtered.", 1),
              o.hasMore ? (i(), n(A, { key: 0 }, [
                I(" Load more to search further.")
              ], 64)) : f("", !0)
            ])) : f("", !0),
            o.error ? (i(), n("div", Qe, [
              k(g(_), {
                icon: "tabler:alert-circle",
                class: "ms-alert-ico",
                "aria-hidden": "true"
              }),
              p("span", Xe, h(ee.value), 1),
              p("button", {
                type: "button",
                class: "ms-link",
                onClick: a[2] || (a[2] = (s) => o.retry())
              }, "Try again")
            ])) : f("", !0),
            V.value ? o.loading && !o.rows.length ? (i(), n("div", tt, [
              k(g(_), {
                icon: "tabler:loader-2",
                class: "spin",
                "aria-hidden": "true"
              }),
              I(" " + h(o.query && o.serverSearch ? "Searching…" : "Loading…"), 1)
            ])) : o.loaded && !E.value.length && !o.error ? (i(), n("div", st, h(pe.value), 1)) : f("", !0) : (i(), n("div", et, "This picker has no source to list from.")),
            E.value.length ? (i(), n("div", rt, [
              (i(!0), n(A, null, H(E.value, (s, b) => (i(), n("div", {
                key: ve(s),
                class: "ms-item"
              }, [
                s.selectable ? (i(), n("button", {
                  key: 0,
                  type: "button",
                  class: ne(["ms-row", [D(s.value) && "ms-row-on", b === w.value && "ms-row-active"]]),
                  "aria-pressed": D(s.value),
                  onClick: (O) => se(s),
                  onMousemove: (O) => w.value = b
                }, [
                  k(g(_), {
                    icon: s.icon || "tabler:point",
                    class: "ms-row-ico",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"]),
                  p("span", ot, [
                    p("span", it, [
                      I(h(s.label) + " ", 1),
                      s.meta ? (i(), n("span", at, h(s.meta), 1)) : f("", !0)
                    ]),
                    s.description ? (i(), n("span", nt, h(s.description), 1)) : f("", !0)
                  ]),
                  D(s.value) ? (i(), W(g(_), {
                    key: 0,
                    icon: "tabler:check",
                    class: "ms-row-check",
                    "aria-hidden": "true"
                  })) : f("", !0)
                ], 42, lt)) : s.drillable ? (i(), n("button", {
                  key: 1,
                  type: "button",
                  class: ne(["ms-row", b === w.value && "ms-row-active"]),
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
                      s.meta ? (i(), n("span", ht, h(s.meta), 1)) : f("", !0)
                    ]),
                    s.description ? (i(), n("span", pt, h(s.description), 1)) : f("", !0)
                  ]),
                  k(g(_), {
                    icon: "tabler:chevron-right",
                    class: "ms-row-go",
                    "aria-hidden": "true"
                  })
                ], 42, ct)) : (i(), n("button", vt, [
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
                s.selectable && s.drillable ? (i(), n("button", {
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
            o.hasMore ? (i(), n("div", gt, [
              p("span", _t, [
                I(h(E.value.length) + " shown", 1),
                z.value ? (i(), n(A, { key: 0 }, [
                  I(" · " + h(v.value.length) + " selected", 1)
                ], 64)) : f("", !0)
              ]),
              p("button", {
                type: "button",
                class: "ms-more",
                disabled: o.loading,
                onClick: a[3] || (a[3] = (s) => o.loadMore())
              }, [
                o.loading ? (i(), W(g(_), {
                  key: 0,
                  icon: "tabler:loader-2",
                  class: "spin",
                  "aria-hidden": "true"
                })) : f("", !0),
                I(" " + h(o.loading ? "Loading…" : "Load more"), 1)
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
