import { g as yl } from "./_commonjsHelpers-DaMA6jEr.js";
var Zd = Object.defineProperty, p = (e, t) => Zd(e, "name", { value: t, configurable: !0 }), sx = (e, t) => {
  for (var r in t)
    Zd(e, r, { get: t[r], enumerable: !0 });
}, co = { exports: {} }, ox = co.exports, ac;
function ax() {
  return ac || (ac = 1, (function(e, t) {
    (function(r, i) {
      e.exports = i();
    })(ox, (function() {
      var r = 1e3, i = 6e4, s = 36e5, o = "millisecond", a = "second", n = "minute", l = "hour", c = "day", h = "week", u = "month", d = "quarter", f = "year", m = "date", y = "Invalid Date", x = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/, C = /\[([^\]]+)]|YYYY|YY|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g, k = { name: "en", weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"), months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"), ordinal: function(O) {
        var D = ["th", "st", "nd", "rd"], B = O % 100;
        return "[" + O + (D[(B - 20) % 10] || D[B] || D[0]) + "]";
      } }, T = function(O, D, B) {
        var q = String(O);
        return !q || q.length >= D ? O : "" + Array(D + 1 - q.length).join(B) + O;
      }, _ = { s: T, z: function(O) {
        var D = -O.utcOffset(), B = Math.abs(D), q = Math.floor(B / 60), I = B % 60;
        return (D <= 0 ? "+" : "-") + T(q, 2, "0") + ":" + T(I, 2, "0");
      }, m: function O(D, B) {
        if (D.date() < B.date()) return -O(B, D);
        var q = 12 * (B.year() - D.year()) + (B.month() - D.month()), I = D.clone().add(q, u), it = B - I < 0, Q = D.clone().add(q + (it ? -1 : 1), u);
        return +(-(q + (B - I) / (it ? I - Q : Q - I)) || 0);
      }, a: function(O) {
        return O < 0 ? Math.ceil(O) || 0 : Math.floor(O);
      }, p: function(O) {
        return { M: u, y: f, w: h, d: c, D: m, h: l, m: n, s: a, ms: o, Q: d }[O] || String(O || "").toLowerCase().replace(/s$/, "");
      }, u: function(O) {
        return O === void 0;
      } }, v = "en", L = {};
      L[v] = k;
      var A = "$isDayjsObject", F = function(O) {
        return O instanceof st || !(!O || !O[A]);
      }, G = function O(D, B, q) {
        var I;
        if (!D) return v;
        if (typeof D == "string") {
          var it = D.toLowerCase();
          L[it] && (I = it), B && (L[it] = B, I = it);
          var Q = D.split("-");
          if (!I && Q.length > 1) return O(Q[0]);
        } else {
          var mt = D.name;
          L[mt] = D, I = mt;
        }
        return !q && I && (v = I), I || !q && v;
      }, Y = function(O, D) {
        if (F(O)) return O.clone();
        var B = typeof D == "object" ? D : {};
        return B.date = O, B.args = arguments, new st(B);
      }, N = _;
      N.l = G, N.i = F, N.w = function(O, D) {
        return Y(O, { locale: D.$L, utc: D.$u, x: D.$x, $offset: D.$offset });
      };
      var st = (function() {
        function O(B) {
          this.$L = G(B.locale, null, !0), this.parse(B), this.$x = this.$x || B.x || {}, this[A] = !0;
        }
        var D = O.prototype;
        return D.parse = function(B) {
          this.$d = (function(q) {
            var I = q.date, it = q.utc;
            if (I === null) return /* @__PURE__ */ new Date(NaN);
            if (N.u(I)) return /* @__PURE__ */ new Date();
            if (I instanceof Date) return new Date(I);
            if (typeof I == "string" && !/Z$/i.test(I)) {
              var Q = I.match(x);
              if (Q) {
                var mt = Q[2] - 1 || 0, St = (Q[7] || "0").substring(0, 3);
                return it ? new Date(Date.UTC(Q[1], mt, Q[3] || 1, Q[4] || 0, Q[5] || 0, Q[6] || 0, St)) : new Date(Q[1], mt, Q[3] || 1, Q[4] || 0, Q[5] || 0, Q[6] || 0, St);
              }
            }
            return new Date(I);
          })(B), this.init();
        }, D.init = function() {
          var B = this.$d;
          this.$y = B.getFullYear(), this.$M = B.getMonth(), this.$D = B.getDate(), this.$W = B.getDay(), this.$H = B.getHours(), this.$m = B.getMinutes(), this.$s = B.getSeconds(), this.$ms = B.getMilliseconds();
        }, D.$utils = function() {
          return N;
        }, D.isValid = function() {
          return this.$d.toString() !== y;
        }, D.isSame = function(B, q) {
          var I = Y(B);
          return this.startOf(q) <= I && I <= this.endOf(q);
        }, D.isAfter = function(B, q) {
          return Y(B) < this.startOf(q);
        }, D.isBefore = function(B, q) {
          return this.endOf(q) < Y(B);
        }, D.$g = function(B, q, I) {
          return N.u(B) ? this[q] : this.set(I, B);
        }, D.unix = function() {
          return Math.floor(this.valueOf() / 1e3);
        }, D.valueOf = function() {
          return this.$d.getTime();
        }, D.startOf = function(B, q) {
          var I = this, it = !!N.u(q) || q, Q = N.p(B), mt = function(Bt, Nt) {
            var zt = N.w(I.$u ? Date.UTC(I.$y, Nt, Bt) : new Date(I.$y, Nt, Bt), I);
            return it ? zt : zt.endOf(c);
          }, St = function(Bt, Nt) {
            return N.w(I.toDate()[Bt].apply(I.toDate("s"), (it ? [0, 0, 0, 0] : [23, 59, 59, 999]).slice(Nt)), I);
          }, Tt = this.$W, ft = this.$M, Lt = this.$D, gt = "set" + (this.$u ? "UTC" : "");
          switch (Q) {
            case f:
              return it ? mt(1, 0) : mt(31, 11);
            case u:
              return it ? mt(1, ft) : mt(0, ft + 1);
            case h:
              var wt = this.$locale().weekStart || 0, Et = (Tt < wt ? Tt + 7 : Tt) - wt;
              return mt(it ? Lt - Et : Lt + (6 - Et), ft);
            case c:
            case m:
              return St(gt + "Hours", 0);
            case l:
              return St(gt + "Minutes", 1);
            case n:
              return St(gt + "Seconds", 2);
            case a:
              return St(gt + "Milliseconds", 3);
            default:
              return this.clone();
          }
        }, D.endOf = function(B) {
          return this.startOf(B, !1);
        }, D.$set = function(B, q) {
          var I, it = N.p(B), Q = "set" + (this.$u ? "UTC" : ""), mt = (I = {}, I[c] = Q + "Date", I[m] = Q + "Date", I[u] = Q + "Month", I[f] = Q + "FullYear", I[l] = Q + "Hours", I[n] = Q + "Minutes", I[a] = Q + "Seconds", I[o] = Q + "Milliseconds", I)[it], St = it === c ? this.$D + (q - this.$W) : q;
          if (it === u || it === f) {
            var Tt = this.clone().set(m, 1);
            Tt.$d[mt](St), Tt.init(), this.$d = Tt.set(m, Math.min(this.$D, Tt.daysInMonth())).$d;
          } else mt && this.$d[mt](St);
          return this.init(), this;
        }, D.set = function(B, q) {
          return this.clone().$set(B, q);
        }, D.get = function(B) {
          return this[N.p(B)]();
        }, D.add = function(B, q) {
          var I, it = this;
          B = Number(B);
          var Q = N.p(q), mt = function(ft) {
            var Lt = Y(it);
            return N.w(Lt.date(Lt.date() + Math.round(ft * B)), it);
          };
          if (Q === u) return this.set(u, this.$M + B);
          if (Q === f) return this.set(f, this.$y + B);
          if (Q === c) return mt(1);
          if (Q === h) return mt(7);
          var St = (I = {}, I[n] = i, I[l] = s, I[a] = r, I)[Q] || 1, Tt = this.$d.getTime() + B * St;
          return N.w(Tt, this);
        }, D.subtract = function(B, q) {
          return this.add(-1 * B, q);
        }, D.format = function(B) {
          var q = this, I = this.$locale();
          if (!this.isValid()) return I.invalidDate || y;
          var it = B || "YYYY-MM-DDTHH:mm:ssZ", Q = N.z(this), mt = this.$H, St = this.$m, Tt = this.$M, ft = I.weekdays, Lt = I.months, gt = I.meridiem, wt = function(Nt, zt, ae, we) {
            return Nt && (Nt[zt] || Nt(q, it)) || ae[zt].slice(0, we);
          }, Et = function(Nt) {
            return N.s(mt % 12 || 12, Nt, "0");
          }, Bt = gt || function(Nt, zt, ae) {
            var we = Nt < 12 ? "AM" : "PM";
            return ae ? we.toLowerCase() : we;
          };
          return it.replace(C, (function(Nt, zt) {
            return zt || (function(ae) {
              switch (ae) {
                case "YY":
                  return String(q.$y).slice(-2);
                case "YYYY":
                  return N.s(q.$y, 4, "0");
                case "M":
                  return Tt + 1;
                case "MM":
                  return N.s(Tt + 1, 2, "0");
                case "MMM":
                  return wt(I.monthsShort, Tt, Lt, 3);
                case "MMMM":
                  return wt(Lt, Tt);
                case "D":
                  return q.$D;
                case "DD":
                  return N.s(q.$D, 2, "0");
                case "d":
                  return String(q.$W);
                case "dd":
                  return wt(I.weekdaysMin, q.$W, ft, 2);
                case "ddd":
                  return wt(I.weekdaysShort, q.$W, ft, 3);
                case "dddd":
                  return ft[q.$W];
                case "H":
                  return String(mt);
                case "HH":
                  return N.s(mt, 2, "0");
                case "h":
                  return Et(1);
                case "hh":
                  return Et(2);
                case "a":
                  return Bt(mt, St, !0);
                case "A":
                  return Bt(mt, St, !1);
                case "m":
                  return String(St);
                case "mm":
                  return N.s(St, 2, "0");
                case "s":
                  return String(q.$s);
                case "ss":
                  return N.s(q.$s, 2, "0");
                case "SSS":
                  return N.s(q.$ms, 3, "0");
                case "Z":
                  return Q;
              }
              return null;
            })(Nt) || Q.replace(":", "");
          }));
        }, D.utcOffset = function() {
          return 15 * -Math.round(this.$d.getTimezoneOffset() / 15);
        }, D.diff = function(B, q, I) {
          var it, Q = this, mt = N.p(q), St = Y(B), Tt = (St.utcOffset() - this.utcOffset()) * i, ft = this - St, Lt = function() {
            return N.m(Q, St);
          };
          switch (mt) {
            case f:
              it = Lt() / 12;
              break;
            case u:
              it = Lt();
              break;
            case d:
              it = Lt() / 3;
              break;
            case h:
              it = (ft - Tt) / 6048e5;
              break;
            case c:
              it = (ft - Tt) / 864e5;
              break;
            case l:
              it = ft / s;
              break;
            case n:
              it = ft / i;
              break;
            case a:
              it = ft / r;
              break;
            default:
              it = ft;
          }
          return I ? it : N.a(it);
        }, D.daysInMonth = function() {
          return this.endOf(u).$D;
        }, D.$locale = function() {
          return L[this.$L];
        }, D.locale = function(B, q) {
          if (!B) return this.$L;
          var I = this.clone(), it = G(B, q, !0);
          return it && (I.$L = it), I;
        }, D.clone = function() {
          return N.w(this.$d, this);
        }, D.toDate = function() {
          return new Date(this.valueOf());
        }, D.toJSON = function() {
          return this.isValid() ? this.toISOString() : null;
        }, D.toISOString = function() {
          return this.$d.toISOString();
        }, D.toString = function() {
          return this.$d.toUTCString();
        }, O;
      })(), U = st.prototype;
      return Y.prototype = U, [["$ms", o], ["$s", a], ["$m", n], ["$H", l], ["$W", c], ["$M", u], ["$y", f], ["$D", m]].forEach((function(O) {
        U[O[1]] = function(D) {
          return this.$g(D, O[0], O[1]);
        };
      })), Y.extend = function(O, D) {
        return O.$i || (O(D, st, Y), O.$i = !0), Y;
      }, Y.locale = G, Y.isDayjs = F, Y.unix = function(O) {
        return Y(1e3 * O);
      }, Y.en = L[v], Y.Ls = L, Y.p = {}, Y;
    }));
  })(co)), co.exports;
}
var nx = ax();
const lx = /* @__PURE__ */ yl(nx);
var mr = {
  trace: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
  fatal: 5
}, R = {
  trace: /* @__PURE__ */ p((...e) => {
  }, "trace"),
  debug: /* @__PURE__ */ p((...e) => {
  }, "debug"),
  info: /* @__PURE__ */ p((...e) => {
  }, "info"),
  warn: /* @__PURE__ */ p((...e) => {
  }, "warn"),
  error: /* @__PURE__ */ p((...e) => {
  }, "error"),
  fatal: /* @__PURE__ */ p((...e) => {
  }, "fatal")
}, xl = /* @__PURE__ */ p(function(e = "fatal") {
  let t = mr.fatal;
  typeof e == "string" ? e.toLowerCase() in mr && (t = mr[e]) : typeof e == "number" && (t = e), R.trace = () => {
  }, R.debug = () => {
  }, R.info = () => {
  }, R.warn = () => {
  }, R.error = () => {
  }, R.fatal = () => {
  }, t <= mr.fatal && (R.fatal = console.error ? console.error.bind(console, Ie("FATAL"), "color: orange") : console.log.bind(console, "\x1B[35m", Ie("FATAL"))), t <= mr.error && (R.error = console.error ? console.error.bind(console, Ie("ERROR"), "color: orange") : console.log.bind(console, "\x1B[31m", Ie("ERROR"))), t <= mr.warn && (R.warn = console.warn ? console.warn.bind(console, Ie("WARN"), "color: orange") : console.log.bind(console, "\x1B[33m", Ie("WARN"))), t <= mr.info && (R.info = console.info ? console.info.bind(console, Ie("INFO"), "color: lightblue") : console.log.bind(console, "\x1B[34m", Ie("INFO"))), t <= mr.debug && (R.debug = console.debug ? console.debug.bind(console, Ie("DEBUG"), "color: lightgreen") : console.log.bind(console, "\x1B[32m", Ie("DEBUG"))), t <= mr.trace && (R.trace = console.debug ? console.debug.bind(console, Ie("TRACE"), "color: lightgreen") : console.log.bind(console, "\x1B[32m", Ie("TRACE")));
}, "setLogLevel"), Ie = /* @__PURE__ */ p((e) => `%c${lx().format("ss.SSS")} : ${e} : `, "format");
const uo = {
  /* CLAMP */
  min: {
    r: 0,
    g: 0,
    b: 0,
    s: 0,
    l: 0,
    a: 0
  },
  max: {
    r: 255,
    g: 255,
    b: 255,
    h: 360,
    s: 100,
    l: 100,
    a: 1
  },
  clamp: {
    r: (e) => e >= 255 ? 255 : e < 0 ? 0 : e,
    g: (e) => e >= 255 ? 255 : e < 0 ? 0 : e,
    b: (e) => e >= 255 ? 255 : e < 0 ? 0 : e,
    h: (e) => e % 360,
    s: (e) => e >= 100 ? 100 : e < 0 ? 0 : e,
    l: (e) => e >= 100 ? 100 : e < 0 ? 0 : e,
    a: (e) => e >= 1 ? 1 : e < 0 ? 0 : e
  },
  /* CONVERSION */
  //SOURCE: https://planetcalc.com/7779
  toLinear: (e) => {
    const t = e / 255;
    return e > 0.03928 ? Math.pow((t + 0.055) / 1.055, 2.4) : t / 12.92;
  },
  //SOURCE: https://gist.github.com/mjackson/5311256
  hue2rgb: (e, t, r) => (r < 0 && (r += 1), r > 1 && (r -= 1), r < 1 / 6 ? e + (t - e) * 6 * r : r < 1 / 2 ? t : r < 2 / 3 ? e + (t - e) * (2 / 3 - r) * 6 : e),
  hsl2rgb: ({ h: e, s: t, l: r }, i) => {
    if (!t)
      return r * 2.55;
    e /= 360, t /= 100, r /= 100;
    const s = r < 0.5 ? r * (1 + t) : r + t - r * t, o = 2 * r - s;
    switch (i) {
      case "r":
        return uo.hue2rgb(o, s, e + 1 / 3) * 255;
      case "g":
        return uo.hue2rgb(o, s, e) * 255;
      case "b":
        return uo.hue2rgb(o, s, e - 1 / 3) * 255;
    }
  },
  rgb2hsl: ({ r: e, g: t, b: r }, i) => {
    e /= 255, t /= 255, r /= 255;
    const s = Math.max(e, t, r), o = Math.min(e, t, r), a = (s + o) / 2;
    if (i === "l")
      return a * 100;
    if (s === o)
      return 0;
    const n = s - o, l = a > 0.5 ? n / (2 - s - o) : n / (s + o);
    if (i === "s")
      return l * 100;
    switch (s) {
      case e:
        return ((t - r) / n + (t < r ? 6 : 0)) * 60;
      case t:
        return ((r - e) / n + 2) * 60;
      case r:
        return ((e - t) / n + 4) * 60;
      default:
        return -1;
    }
  }
}, hx = {
  /* API */
  clamp: (e, t, r) => t > r ? Math.min(t, Math.max(r, e)) : Math.min(r, Math.max(t, e)),
  round: (e) => Math.round(e * 1e10) / 1e10
}, cx = {
  /* API */
  dec2hex: (e) => {
    const t = Math.round(e).toString(16);
    return t.length > 1 ? t : `0${t}`;
  }
}, Ft = {
  channel: uo,
  lang: hx,
  unit: cx
}, Dr = {};
for (let e = 0; e <= 255; e++)
  Dr[e] = Ft.unit.dec2hex(e);
const de = {
  ALL: 0,
  RGB: 1,
  HSL: 2
};
let ux = class {
  constructor() {
    this.type = de.ALL;
  }
  /* API */
  get() {
    return this.type;
  }
  set(t) {
    if (this.type && this.type !== t)
      throw new Error("Cannot change both RGB and HSL channels at the same time");
    this.type = t;
  }
  reset() {
    this.type = de.ALL;
  }
  is(t) {
    return this.type === t;
  }
};
class dx {
  /* CONSTRUCTOR */
  constructor(t, r) {
    this.color = r, this.changed = !1, this.data = t, this.type = new ux();
  }
  /* API */
  set(t, r) {
    return this.color = r, this.changed = !1, this.data = t, this.type.type = de.ALL, this;
  }
  /* HELPERS */
  _ensureHSL() {
    const t = this.data, { h: r, s: i, l: s } = t;
    r === void 0 && (t.h = Ft.channel.rgb2hsl(t, "h")), i === void 0 && (t.s = Ft.channel.rgb2hsl(t, "s")), s === void 0 && (t.l = Ft.channel.rgb2hsl(t, "l"));
  }
  _ensureRGB() {
    const t = this.data, { r, g: i, b: s } = t;
    r === void 0 && (t.r = Ft.channel.hsl2rgb(t, "r")), i === void 0 && (t.g = Ft.channel.hsl2rgb(t, "g")), s === void 0 && (t.b = Ft.channel.hsl2rgb(t, "b"));
  }
  /* GETTERS */
  get r() {
    const t = this.data, r = t.r;
    return !this.type.is(de.HSL) && r !== void 0 ? r : (this._ensureHSL(), Ft.channel.hsl2rgb(t, "r"));
  }
  get g() {
    const t = this.data, r = t.g;
    return !this.type.is(de.HSL) && r !== void 0 ? r : (this._ensureHSL(), Ft.channel.hsl2rgb(t, "g"));
  }
  get b() {
    const t = this.data, r = t.b;
    return !this.type.is(de.HSL) && r !== void 0 ? r : (this._ensureHSL(), Ft.channel.hsl2rgb(t, "b"));
  }
  get h() {
    const t = this.data, r = t.h;
    return !this.type.is(de.RGB) && r !== void 0 ? r : (this._ensureRGB(), Ft.channel.rgb2hsl(t, "h"));
  }
  get s() {
    const t = this.data, r = t.s;
    return !this.type.is(de.RGB) && r !== void 0 ? r : (this._ensureRGB(), Ft.channel.rgb2hsl(t, "s"));
  }
  get l() {
    const t = this.data, r = t.l;
    return !this.type.is(de.RGB) && r !== void 0 ? r : (this._ensureRGB(), Ft.channel.rgb2hsl(t, "l"));
  }
  get a() {
    return this.data.a;
  }
  /* SETTERS */
  set r(t) {
    this.type.set(de.RGB), this.changed = !0, this.data.r = t;
  }
  set g(t) {
    this.type.set(de.RGB), this.changed = !0, this.data.g = t;
  }
  set b(t) {
    this.type.set(de.RGB), this.changed = !0, this.data.b = t;
  }
  set h(t) {
    this.type.set(de.HSL), this.changed = !0, this.data.h = t;
  }
  set s(t) {
    this.type.set(de.HSL), this.changed = !0, this.data.s = t;
  }
  set l(t) {
    this.type.set(de.HSL), this.changed = !0, this.data.l = t;
  }
  set a(t) {
    this.changed = !0, this.data.a = t;
  }
}
const Ko = new dx({ r: 0, g: 0, b: 0, a: 0 }, "transparent"), Bi = {
  /* VARIABLES */
  re: /^#((?:[a-f0-9]{2}){2,4}|[a-f0-9]{3})$/i,
  /* API */
  parse: (e) => {
    if (e.charCodeAt(0) !== 35)
      return;
    const t = e.match(Bi.re);
    if (!t)
      return;
    const r = t[1], i = parseInt(r, 16), s = r.length, o = s % 4 === 0, a = s > 4, n = a ? 1 : 17, l = a ? 8 : 4, c = o ? 0 : -1, h = a ? 255 : 15;
    return Ko.set({
      r: (i >> l * (c + 3) & h) * n,
      g: (i >> l * (c + 2) & h) * n,
      b: (i >> l * (c + 1) & h) * n,
      a: o ? (i & h) * n / 255 : 1
    }, e);
  },
  stringify: (e) => {
    const { r: t, g: r, b: i, a: s } = e;
    return s < 1 ? `#${Dr[Math.round(t)]}${Dr[Math.round(r)]}${Dr[Math.round(i)]}${Dr[Math.round(s * 255)]}` : `#${Dr[Math.round(t)]}${Dr[Math.round(r)]}${Dr[Math.round(i)]}`;
  }
}, Kr = {
  /* VARIABLES */
  re: /^hsla?\(\s*?(-?(?:\d+(?:\.\d+)?|(?:\.\d+))(?:e-?\d+)?(?:deg|grad|rad|turn)?)\s*?(?:,|\s)\s*?(-?(?:\d+(?:\.\d+)?|(?:\.\d+))(?:e-?\d+)?%)\s*?(?:,|\s)\s*?(-?(?:\d+(?:\.\d+)?|(?:\.\d+))(?:e-?\d+)?%)(?:\s*?(?:,|\/)\s*?\+?(-?(?:\d+(?:\.\d+)?|(?:\.\d+))(?:e-?\d+)?(%)?))?\s*?\)$/i,
  hueRe: /^(.+?)(deg|grad|rad|turn)$/i,
  /* HELPERS */
  _hue2deg: (e) => {
    const t = e.match(Kr.hueRe);
    if (t) {
      const [, r, i] = t;
      switch (i) {
        case "grad":
          return Ft.channel.clamp.h(parseFloat(r) * 0.9);
        case "rad":
          return Ft.channel.clamp.h(parseFloat(r) * 180 / Math.PI);
        case "turn":
          return Ft.channel.clamp.h(parseFloat(r) * 360);
      }
    }
    return Ft.channel.clamp.h(parseFloat(e));
  },
  /* API */
  parse: (e) => {
    const t = e.charCodeAt(0);
    if (t !== 104 && t !== 72)
      return;
    const r = e.match(Kr.re);
    if (!r)
      return;
    const [, i, s, o, a, n] = r;
    return Ko.set({
      h: Kr._hue2deg(i),
      s: Ft.channel.clamp.s(parseFloat(s)),
      l: Ft.channel.clamp.l(parseFloat(o)),
      a: a ? Ft.channel.clamp.a(n ? parseFloat(a) / 100 : parseFloat(a)) : 1
    }, e);
  },
  stringify: (e) => {
    const { h: t, s: r, l: i, a: s } = e;
    return s < 1 ? `hsla(${Ft.lang.round(t)}, ${Ft.lang.round(r)}%, ${Ft.lang.round(i)}%, ${s})` : `hsl(${Ft.lang.round(t)}, ${Ft.lang.round(r)}%, ${Ft.lang.round(i)}%)`;
  }
}, ms = {
  /* VARIABLES */
  colors: {
    aliceblue: "#f0f8ff",
    antiquewhite: "#faebd7",
    aqua: "#00ffff",
    aquamarine: "#7fffd4",
    azure: "#f0ffff",
    beige: "#f5f5dc",
    bisque: "#ffe4c4",
    black: "#000000",
    blanchedalmond: "#ffebcd",
    blue: "#0000ff",
    blueviolet: "#8a2be2",
    brown: "#a52a2a",
    burlywood: "#deb887",
    cadetblue: "#5f9ea0",
    chartreuse: "#7fff00",
    chocolate: "#d2691e",
    coral: "#ff7f50",
    cornflowerblue: "#6495ed",
    cornsilk: "#fff8dc",
    crimson: "#dc143c",
    cyanaqua: "#00ffff",
    darkblue: "#00008b",
    darkcyan: "#008b8b",
    darkgoldenrod: "#b8860b",
    darkgray: "#a9a9a9",
    darkgreen: "#006400",
    darkgrey: "#a9a9a9",
    darkkhaki: "#bdb76b",
    darkmagenta: "#8b008b",
    darkolivegreen: "#556b2f",
    darkorange: "#ff8c00",
    darkorchid: "#9932cc",
    darkred: "#8b0000",
    darksalmon: "#e9967a",
    darkseagreen: "#8fbc8f",
    darkslateblue: "#483d8b",
    darkslategray: "#2f4f4f",
    darkslategrey: "#2f4f4f",
    darkturquoise: "#00ced1",
    darkviolet: "#9400d3",
    deeppink: "#ff1493",
    deepskyblue: "#00bfff",
    dimgray: "#696969",
    dimgrey: "#696969",
    dodgerblue: "#1e90ff",
    firebrick: "#b22222",
    floralwhite: "#fffaf0",
    forestgreen: "#228b22",
    fuchsia: "#ff00ff",
    gainsboro: "#dcdcdc",
    ghostwhite: "#f8f8ff",
    gold: "#ffd700",
    goldenrod: "#daa520",
    gray: "#808080",
    green: "#008000",
    greenyellow: "#adff2f",
    grey: "#808080",
    honeydew: "#f0fff0",
    hotpink: "#ff69b4",
    indianred: "#cd5c5c",
    indigo: "#4b0082",
    ivory: "#fffff0",
    khaki: "#f0e68c",
    lavender: "#e6e6fa",
    lavenderblush: "#fff0f5",
    lawngreen: "#7cfc00",
    lemonchiffon: "#fffacd",
    lightblue: "#add8e6",
    lightcoral: "#f08080",
    lightcyan: "#e0ffff",
    lightgoldenrodyellow: "#fafad2",
    lightgray: "#d3d3d3",
    lightgreen: "#90ee90",
    lightgrey: "#d3d3d3",
    lightpink: "#ffb6c1",
    lightsalmon: "#ffa07a",
    lightseagreen: "#20b2aa",
    lightskyblue: "#87cefa",
    lightslategray: "#778899",
    lightslategrey: "#778899",
    lightsteelblue: "#b0c4de",
    lightyellow: "#ffffe0",
    lime: "#00ff00",
    limegreen: "#32cd32",
    linen: "#faf0e6",
    magenta: "#ff00ff",
    maroon: "#800000",
    mediumaquamarine: "#66cdaa",
    mediumblue: "#0000cd",
    mediumorchid: "#ba55d3",
    mediumpurple: "#9370db",
    mediumseagreen: "#3cb371",
    mediumslateblue: "#7b68ee",
    mediumspringgreen: "#00fa9a",
    mediumturquoise: "#48d1cc",
    mediumvioletred: "#c71585",
    midnightblue: "#191970",
    mintcream: "#f5fffa",
    mistyrose: "#ffe4e1",
    moccasin: "#ffe4b5",
    navajowhite: "#ffdead",
    navy: "#000080",
    oldlace: "#fdf5e6",
    olive: "#808000",
    olivedrab: "#6b8e23",
    orange: "#ffa500",
    orangered: "#ff4500",
    orchid: "#da70d6",
    palegoldenrod: "#eee8aa",
    palegreen: "#98fb98",
    paleturquoise: "#afeeee",
    palevioletred: "#db7093",
    papayawhip: "#ffefd5",
    peachpuff: "#ffdab9",
    peru: "#cd853f",
    pink: "#ffc0cb",
    plum: "#dda0dd",
    powderblue: "#b0e0e6",
    purple: "#800080",
    rebeccapurple: "#663399",
    red: "#ff0000",
    rosybrown: "#bc8f8f",
    royalblue: "#4169e1",
    saddlebrown: "#8b4513",
    salmon: "#fa8072",
    sandybrown: "#f4a460",
    seagreen: "#2e8b57",
    seashell: "#fff5ee",
    sienna: "#a0522d",
    silver: "#c0c0c0",
    skyblue: "#87ceeb",
    slateblue: "#6a5acd",
    slategray: "#708090",
    slategrey: "#708090",
    snow: "#fffafa",
    springgreen: "#00ff7f",
    tan: "#d2b48c",
    teal: "#008080",
    thistle: "#d8bfd8",
    transparent: "#00000000",
    turquoise: "#40e0d0",
    violet: "#ee82ee",
    wheat: "#f5deb3",
    white: "#ffffff",
    whitesmoke: "#f5f5f5",
    yellow: "#ffff00",
    yellowgreen: "#9acd32"
  },
  /* API */
  parse: (e) => {
    e = e.toLowerCase();
    const t = ms.colors[e];
    if (t)
      return Bi.parse(t);
  },
  stringify: (e) => {
    const t = Bi.stringify(e);
    for (const r in ms.colors)
      if (ms.colors[r] === t)
        return r;
  }
}, os = {
  /* VARIABLES */
  re: /^rgba?\(\s*?(-?(?:\d+(?:\.\d+)?|(?:\.\d+))(?:e\d+)?(%?))\s*?(?:,|\s)\s*?(-?(?:\d+(?:\.\d+)?|(?:\.\d+))(?:e\d+)?(%?))\s*?(?:,|\s)\s*?(-?(?:\d+(?:\.\d+)?|(?:\.\d+))(?:e\d+)?(%?))(?:\s*?(?:,|\/)\s*?\+?(-?(?:\d+(?:\.\d+)?|(?:\.\d+))(?:e\d+)?(%?)))?\s*?\)$/i,
  /* API */
  parse: (e) => {
    const t = e.charCodeAt(0);
    if (t !== 114 && t !== 82)
      return;
    const r = e.match(os.re);
    if (!r)
      return;
    const [, i, s, o, a, n, l, c, h] = r;
    return Ko.set({
      r: Ft.channel.clamp.r(s ? parseFloat(i) * 2.55 : parseFloat(i)),
      g: Ft.channel.clamp.g(a ? parseFloat(o) * 2.55 : parseFloat(o)),
      b: Ft.channel.clamp.b(l ? parseFloat(n) * 2.55 : parseFloat(n)),
      a: c ? Ft.channel.clamp.a(h ? parseFloat(c) / 100 : parseFloat(c)) : 1
    }, e);
  },
  stringify: (e) => {
    const { r: t, g: r, b: i, a: s } = e;
    return s < 1 ? `rgba(${Ft.lang.round(t)}, ${Ft.lang.round(r)}, ${Ft.lang.round(i)}, ${Ft.lang.round(s)})` : `rgb(${Ft.lang.round(t)}, ${Ft.lang.round(r)}, ${Ft.lang.round(i)})`;
  }
}, ar = {
  /* VARIABLES */
  format: {
    keyword: ms,
    hex: Bi,
    rgb: os,
    rgba: os,
    hsl: Kr,
    hsla: Kr
  },
  /* API */
  parse: (e) => {
    if (typeof e != "string")
      return e;
    const t = Bi.parse(e) || os.parse(e) || Kr.parse(e) || ms.parse(e);
    if (t)
      return t;
    throw new Error(`Unsupported color format: "${e}"`);
  },
  stringify: (e) => !e.changed && e.color ? e.color : e.type.is(de.HSL) || e.data.r === void 0 ? Kr.stringify(e) : e.a < 1 || !Number.isInteger(e.r) || !Number.isInteger(e.g) || !Number.isInteger(e.b) ? os.stringify(e) : Bi.stringify(e)
}, Kd = (e, t) => {
  const r = ar.parse(e);
  for (const i in t)
    r[i] = Ft.channel.clamp[i](t[i]);
  return ar.stringify(r);
}, Nr = (e, t, r = 0, i = 1) => {
  if (typeof e != "number")
    return Kd(e, { a: t });
  const s = Ko.set({
    r: Ft.channel.clamp.r(e),
    g: Ft.channel.clamp.g(t),
    b: Ft.channel.clamp.b(r),
    a: Ft.channel.clamp.a(i)
  });
  return ar.stringify(s);
}, fx = (e) => {
  const { r: t, g: r, b: i } = ar.parse(e), s = 0.2126 * Ft.channel.toLinear(t) + 0.7152 * Ft.channel.toLinear(r) + 0.0722 * Ft.channel.toLinear(i);
  return Ft.lang.round(s);
}, px = (e) => fx(e) >= 0.5, Ge = (e) => !px(e), Qd = (e, t, r) => {
  const i = ar.parse(e), s = i[t], o = Ft.channel.clamp[t](s + r);
  return s !== o && (i[t] = o), ar.stringify(i);
}, z = (e, t) => Qd(e, "l", t), W = (e, t) => Qd(e, "l", -t), b = (e, t) => {
  const r = ar.parse(e), i = {};
  for (const s in t)
    t[s] && (i[s] = r[s] + t[s]);
  return Kd(e, i);
}, gx = (e, t, r = 50) => {
  const { r: i, g: s, b: o, a } = ar.parse(e), { r: n, g: l, b: c, a: h } = ar.parse(t), u = r / 100, d = u * 2 - 1, f = a - h, y = ((d * f === -1 ? d : (d + f) / (1 + d * f)) + 1) / 2, x = 1 - y, C = i * y + n * x, k = s * y + l * x, T = o * y + c * x, _ = a * u + h * (1 - u);
  return Nr(C, k, T, _);
}, E = (e, t = 100) => {
  const r = ar.parse(e);
  return r.r = 255 - r.r, r.g = 255 - r.g, r.b = 255 - r.b, gx(r, e, t);
};
/*! @license DOMPurify 3.4.16 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.4.16/LICENSE */
function nc(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, i = Array(t); r < t; r++) i[r] = e[r];
  return i;
}
function mx(e) {
  if (Array.isArray(e)) return e;
}
function yx(e, t) {
  var r = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (r != null) {
    var i, s, o, a, n = [], l = !0, c = !1;
    try {
      if (o = (r = r.call(e)).next, t !== 0) for (; !(l = (i = o.call(r)).done) && (n.push(i.value), n.length !== t); l = !0) ;
    } catch (h) {
      c = !0, s = h;
    } finally {
      try {
        if (!l && r.return != null && (a = r.return(), Object(a) !== a)) return;
      } finally {
        if (c) throw s;
      }
    }
    return n;
  }
}
function xx() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
/*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */
function Cx(e, t) {
  return mx(e) || yx(e, t) || bx(e, t) || xx();
}
function bx(e, t) {
  if (e) {
    if (typeof e == "string") return nc(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return r === "Object" && e.constructor && (r = e.constructor.name), r === "Map" || r === "Set" ? Array.from(e) : r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? nc(e, t) : void 0;
  }
}
const Jd = Object.entries, lc = Object.setPrototypeOf, kx = Object.isFrozen, wx = Object.getPrototypeOf, Tx = Object.getOwnPropertyDescriptor;
let ie = Object.freeze, oe = Object.seal, wi = Object.create, tf = typeof Reflect < "u" && Reflect, Bn = tf.apply, Ln = tf.construct;
ie || (ie = function(t) {
  return t;
});
oe || (oe = function(t) {
  return t;
});
Bn || (Bn = function(t, r) {
  for (var i = arguments.length, s = new Array(i > 2 ? i - 2 : 0), o = 2; o < i; o++) s[o - 2] = arguments[o];
  return t.apply(r, s);
});
Ln || (Ln = function(t) {
  for (var r = arguments.length, i = new Array(r > 1 ? r - 1 : 0), s = 1; s < r; s++) i[s - 1] = arguments[s];
  return new t(...i);
});
const Xr = ee(Array.prototype.forEach), Sx = ee(Array.prototype.lastIndexOf), hc = ee(Array.prototype.pop), Xi = ee(Array.prototype.push), _x = ee(Array.prototype.splice), Li = Array.isArray, as = ee(String.prototype.toLowerCase), Aa = ee(String.prototype.toString), cc = ee(String.prototype.match), Vi = ee(String.prototype.replace), uc = ee(String.prototype.indexOf), vx = ee(String.prototype.trim), Bx = ee(Number.prototype.toString), Lx = ee(Boolean.prototype.toString), dc = typeof BigInt > "u" ? null : ee(BigInt.prototype.toString), fc = typeof Symbol > "u" ? null : ee(Symbol.prototype.toString), _e = ee(Object.prototype.hasOwnProperty), Zi = ee(Object.prototype.toString), ue = ee(RegExp.prototype.test), Mr = Fx(TypeError);
function ee(e) {
  return function(t) {
    t instanceof RegExp && (t.lastIndex = 0);
    for (var r = arguments.length, i = new Array(r > 1 ? r - 1 : 0), s = 1; s < r; s++) i[s - 1] = arguments[s];
    return Bn(e, t, i);
  };
}
function Fx(e) {
  return function() {
    for (var t = arguments.length, r = new Array(t), i = 0; i < t; i++) r[i] = arguments[i];
    return Ln(e, r);
  };
}
function qt(e, t) {
  let r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : as;
  if (lc && lc(e, null), !Li(t)) return e;
  let i = t.length;
  for (; i--; ) {
    let s = t[i];
    if (typeof s == "string") {
      const o = r(s);
      o !== s && (kx(t) || (t[i] = o), s = o);
    }
    e[s] = !0;
  }
  return e;
}
function Ax(e) {
  for (let t = 0; t < e.length; t++) _e(e, t) || (e[t] = null);
  return e;
}
function $e(e) {
  const t = wi(null);
  for (const i of Jd(e)) {
    var r = Cx(i, 2);
    const s = r[0], o = r[1];
    _e(e, s) && (Li(o) ? t[s] = Ax(o) : o && typeof o == "object" && o.constructor === Object ? t[s] = $e(o) : t[s] = o);
  }
  return t;
}
function Ex(e) {
  switch (typeof e) {
    case "string":
      return e;
    case "number":
      return Bx(e);
    case "boolean":
      return Lx(e);
    case "bigint":
      return dc ? dc(e) : "0";
    case "symbol":
      return fc ? fc(e) : "Symbol()";
    case "undefined":
      return Zi(e);
    case "function":
    case "object": {
      if (e === null) return Zi(e);
      const t = e, r = Pe(t, "toString");
      if (typeof r == "function") {
        const i = r(t);
        return typeof i == "string" ? i : Zi(i);
      }
      return Zi(e);
    }
    default:
      return Zi(e);
  }
}
function Pe(e, t) {
  for (; e !== null; ) {
    const i = Tx(e, t);
    if (i) {
      if (i.get) return ee(i.get);
      if (typeof i.value == "function") return ee(i.value);
    }
    e = wx(e);
  }
  function r() {
    return null;
  }
  return r;
}
function Mx(e) {
  try {
    return ue(e, ""), !0;
  } catch {
    return !1;
  }
}
const pc = ie([
  "a",
  "abbr",
  "acronym",
  "address",
  "area",
  "article",
  "aside",
  "audio",
  "b",
  "bdi",
  "bdo",
  "big",
  "blink",
  "blockquote",
  "body",
  "br",
  "button",
  "canvas",
  "caption",
  "center",
  "cite",
  "code",
  "col",
  "colgroup",
  "content",
  "data",
  "datalist",
  "dd",
  "decorator",
  "del",
  "details",
  "dfn",
  "dialog",
  "dir",
  "div",
  "dl",
  "dt",
  "element",
  "em",
  "fieldset",
  "figcaption",
  "figure",
  "font",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hgroup",
  "hr",
  "html",
  "i",
  "img",
  "input",
  "ins",
  "kbd",
  "label",
  "legend",
  "li",
  "main",
  "map",
  "mark",
  "marquee",
  "menu",
  "menuitem",
  "meter",
  "nav",
  "nobr",
  "ol",
  "optgroup",
  "option",
  "output",
  "p",
  "picture",
  "pre",
  "progress",
  "q",
  "rp",
  "rt",
  "ruby",
  "s",
  "samp",
  "search",
  "section",
  "select",
  "shadow",
  "slot",
  "small",
  "source",
  "spacer",
  "span",
  "strike",
  "strong",
  "style",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "template",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "tr",
  "track",
  "tt",
  "u",
  "ul",
  "var",
  "video",
  "wbr"
]), Ea = ie([
  "svg",
  "a",
  "altglyph",
  "altglyphdef",
  "altglyphitem",
  "animatecolor",
  "animatemotion",
  "animatetransform",
  "circle",
  "clippath",
  "defs",
  "desc",
  "ellipse",
  "enterkeyhint",
  "exportparts",
  "filter",
  "font",
  "g",
  "glyph",
  "glyphref",
  "hkern",
  "image",
  "inputmode",
  "line",
  "lineargradient",
  "marker",
  "mask",
  "metadata",
  "mpath",
  "part",
  "path",
  "pattern",
  "polygon",
  "polyline",
  "radialgradient",
  "rect",
  "stop",
  "style",
  "switch",
  "symbol",
  "text",
  "textpath",
  "title",
  "tref",
  "tspan",
  "view",
  "vkern"
]), Ma = ie([
  "feBlend",
  "feColorMatrix",
  "feComponentTransfer",
  "feComposite",
  "feConvolveMatrix",
  "feDiffuseLighting",
  "feDisplacementMap",
  "feDistantLight",
  "feDropShadow",
  "feFlood",
  "feFuncA",
  "feFuncB",
  "feFuncG",
  "feFuncR",
  "feGaussianBlur",
  "feImage",
  "feMerge",
  "feMergeNode",
  "feMorphology",
  "feOffset",
  "fePointLight",
  "feSpecularLighting",
  "feSpotLight",
  "feTile",
  "feTurbulence"
]), $x = ie([
  "animate",
  "color-profile",
  "cursor",
  "discard",
  "font-face",
  "font-face-format",
  "font-face-name",
  "font-face-src",
  "font-face-uri",
  "foreignobject",
  "hatch",
  "hatchpath",
  "mesh",
  "meshgradient",
  "meshpatch",
  "meshrow",
  "missing-glyph",
  "script",
  "set",
  "solidcolor",
  "unknown",
  "use"
]), $a = ie([
  "math",
  "menclose",
  "merror",
  "mfenced",
  "mfrac",
  "mglyph",
  "mi",
  "mlabeledtr",
  "mmultiscripts",
  "mn",
  "mo",
  "mover",
  "mpadded",
  "mphantom",
  "mroot",
  "mrow",
  "ms",
  "mspace",
  "msqrt",
  "mstyle",
  "msub",
  "msup",
  "msubsup",
  "mtable",
  "mtd",
  "mtext",
  "mtr",
  "munder",
  "munderover",
  "mprescripts"
]), Ox = ie([
  "maction",
  "maligngroup",
  "malignmark",
  "mlongdiv",
  "mscarries",
  "mscarry",
  "msgroup",
  "mstack",
  "msline",
  "msrow",
  "semantics",
  "annotation",
  "annotation-xml",
  "mprescripts",
  "none"
]), gc = ie(["#text"]), mc = ie([
  "accept",
  "action",
  "align",
  "alt",
  "autocapitalize",
  "autocomplete",
  "autopictureinpicture",
  "autoplay",
  "background",
  "bgcolor",
  "border",
  "capture",
  "cellpadding",
  "cellspacing",
  "checked",
  "cite",
  "class",
  "clear",
  "color",
  "cols",
  "colspan",
  "command",
  "commandfor",
  "controls",
  "controlslist",
  "coords",
  "crossorigin",
  "datetime",
  "decoding",
  "default",
  "dir",
  "disabled",
  "disablepictureinpicture",
  "disableremoteplayback",
  "download",
  "draggable",
  "enctype",
  "enterkeyhint",
  "exportparts",
  "face",
  "for",
  "headers",
  "height",
  "hidden",
  "high",
  "href",
  "hreflang",
  "id",
  "inert",
  "inputmode",
  "integrity",
  "ismap",
  "kind",
  "label",
  "lang",
  "list",
  "loading",
  "loop",
  "low",
  "max",
  "maxlength",
  "media",
  "method",
  "min",
  "minlength",
  "multiple",
  "muted",
  "name",
  "nonce",
  "noshade",
  "novalidate",
  "nowrap",
  "open",
  "optimum",
  "part",
  "pattern",
  "placeholder",
  "playsinline",
  "popover",
  "popovertarget",
  "popovertargetaction",
  "poster",
  "preload",
  "pubdate",
  "radiogroup",
  "readonly",
  "rel",
  "required",
  "rev",
  "reversed",
  "role",
  "rows",
  "rowspan",
  "spellcheck",
  "scope",
  "selected",
  "shape",
  "size",
  "sizes",
  "slot",
  "span",
  "srclang",
  "start",
  "src",
  "srcset",
  "step",
  "style",
  "summary",
  "tabindex",
  "title",
  "translate",
  "type",
  "usemap",
  "valign",
  "value",
  "width",
  "wrap",
  "xmlns"
]), Oa = ie([
  "accent-height",
  "accumulate",
  "additive",
  "alignment-baseline",
  "amplitude",
  "ascent",
  "attributename",
  "attributetype",
  "azimuth",
  "basefrequency",
  "baseline-shift",
  "begin",
  "bias",
  "by",
  "class",
  "clip",
  "clippathunits",
  "clip-path",
  "clip-rule",
  "color",
  "color-interpolation",
  "color-interpolation-filters",
  "color-profile",
  "color-rendering",
  "cx",
  "cy",
  "d",
  "dx",
  "dy",
  "diffuseconstant",
  "direction",
  "display",
  "divisor",
  "dominant-baseline",
  "dur",
  "edgemode",
  "elevation",
  "end",
  "exponent",
  "fill",
  "fill-opacity",
  "fill-rule",
  "filter",
  "filterunits",
  "flood-color",
  "flood-opacity",
  "font-family",
  "font-size",
  "font-size-adjust",
  "font-stretch",
  "font-style",
  "font-variant",
  "font-weight",
  "fx",
  "fy",
  "g1",
  "g2",
  "glyph-name",
  "glyphref",
  "gradientunits",
  "gradienttransform",
  "height",
  "href",
  "id",
  "image-rendering",
  "in",
  "in2",
  "intercept",
  "k",
  "k1",
  "k2",
  "k3",
  "k4",
  "kerning",
  "keypoints",
  "keysplines",
  "keytimes",
  "lang",
  "lengthadjust",
  "letter-spacing",
  "kernelmatrix",
  "kernelunitlength",
  "lighting-color",
  "local",
  "marker-end",
  "marker-mid",
  "marker-start",
  "markerheight",
  "markerunits",
  "markerwidth",
  "maskcontentunits",
  "maskunits",
  "max",
  "mask",
  "mask-type",
  "media",
  "method",
  "mode",
  "min",
  "name",
  "numoctaves",
  "offset",
  "operator",
  "opacity",
  "order",
  "orient",
  "orientation",
  "origin",
  "overflow",
  "paint-order",
  "path",
  "pathlength",
  "patterncontentunits",
  "patterntransform",
  "patternunits",
  "pointer-events",
  "points",
  "preservealpha",
  "preserveaspectratio",
  "primitiveunits",
  "r",
  "rx",
  "ry",
  "radius",
  "refx",
  "refy",
  "repeatcount",
  "repeatdur",
  "restart",
  "result",
  "rotate",
  "scale",
  "seed",
  "shape-rendering",
  "slope",
  "specularconstant",
  "specularexponent",
  "spreadmethod",
  "startoffset",
  "stddeviation",
  "stitchtiles",
  "stop-color",
  "stop-opacity",
  "stroke-dasharray",
  "stroke-dashoffset",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-miterlimit",
  "stroke-opacity",
  "stroke",
  "stroke-width",
  "style",
  "surfacescale",
  "systemlanguage",
  "tabindex",
  "tablevalues",
  "targetx",
  "targety",
  "transform",
  "transform-origin",
  "text-anchor",
  "text-decoration",
  "text-orientation",
  "text-rendering",
  "textlength",
  "type",
  "u1",
  "u2",
  "unicode",
  "values",
  "vector-effect",
  "viewbox",
  "visibility",
  "version",
  "vert-adv-y",
  "vert-origin-x",
  "vert-origin-y",
  "width",
  "word-spacing",
  "wrap",
  "writing-mode",
  "xchannelselector",
  "ychannelselector",
  "x",
  "x1",
  "x2",
  "xmlns",
  "y",
  "y1",
  "y2",
  "z",
  "zoomandpan"
]), yc = ie([
  "accent",
  "accentunder",
  "align",
  "bevelled",
  "close",
  "columnalign",
  "columnlines",
  "columnspacing",
  "columnspan",
  "denomalign",
  "depth",
  "dir",
  "display",
  "displaystyle",
  "encoding",
  "fence",
  "frame",
  "height",
  "href",
  "id",
  "largeop",
  "length",
  "linethickness",
  "lquote",
  "lspace",
  "mathbackground",
  "mathcolor",
  "mathsize",
  "mathvariant",
  "maxsize",
  "minsize",
  "movablelimits",
  "notation",
  "numalign",
  "open",
  "rowalign",
  "rowlines",
  "rowspacing",
  "rowspan",
  "rspace",
  "rquote",
  "scriptlevel",
  "scriptminsize",
  "scriptsizemultiplier",
  "selection",
  "separator",
  "separators",
  "stretchy",
  "subscriptshift",
  "supscriptshift",
  "symmetric",
  "voffset",
  "width",
  "xmlns"
]), Vs = ie([
  "xlink:href",
  "xml:id",
  "xlink:title",
  "xml:space",
  "xmlns:xlink"
]), Dx = oe(/{{[\w\W]*|^[\w\W]*}}/g), Ix = oe(/<%[\w\W]*|^[\w\W]*%>/g), Px = oe(/\${[\w\W]*/g), Rx = oe(/^data-[\-\w.\u00B7-\uFFFF]+$/), Nx = oe(/^aria-[\-\w]+$/), xc = oe(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i), qx = oe(/^(?:\w+script|data):/i), zx = oe(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g), Wx = oe(/^html$/i), Hx = oe(/^[a-z][.\w]*(-[.\w]+)+$/i), Cc = oe(/<[/\w!]/g), bc = oe(/<[/\w]/g), Yx = oe(/<\/no(script|embed|frames)/i), Ux = oe(/\/>/i), Ee = {
  element: 1,
  attribute: 2,
  text: 3,
  cdataSection: 4,
  entityReference: 5,
  entityNode: 6,
  processingInstruction: 7,
  comment: 8,
  document: 9,
  documentType: 10,
  documentFragment: 11,
  notation: 12
}, ef = [
  "style",
  "script",
  "xmp",
  "iframe",
  "noembed",
  "noframes",
  "plaintext",
  "noscript"
], jx = ie(qt({}, ef)), Gx = (function() {
  const e = {};
  return Xr(ef, (t) => {
    e[t] = oe(new RegExp("</" + t + "(?=[\\t\\n\\f\\r />])", "i"));
  }), ie(e);
})(), Xx = function() {
  return typeof window > "u" ? null : window;
}, Vx = function(t, r) {
  if (typeof t != "object" || typeof t.createPolicy != "function") return null;
  let i = null;
  const s = "data-tt-policy-suffix";
  r && r.hasAttribute(s) && (i = r.getAttribute(s));
  const o = "dompurify" + (i ? "#" + i : "");
  try {
    return t.createPolicy(o, {
      createHTML(a) {
        return a;
      },
      createScriptURL(a) {
        return a;
      }
    });
  } catch {
    return console.warn("TrustedTypes policy " + o + " could not be created."), null;
  }
}, kc = function() {
  return {
    afterSanitizeAttributes: [],
    afterSanitizeElements: [],
    afterSanitizeShadowDOM: [],
    beforeSanitizeAttributes: [],
    beforeSanitizeElements: [],
    beforeSanitizeShadowDOM: [],
    uponSanitizeAttribute: [],
    uponSanitizeElement: [],
    uponSanitizeShadowNode: []
  };
}, $r = function(t, r, i, s) {
  return _e(t, r) && Li(t[r]) ? qt(s.base ? $e(s.base) : {}, t[r], s.transform) : i;
}, Da = function(t, r, i) {
  const s = _e(t, r) ? t[r] : void 0;
  return s && typeof s == "object" ? $e(s) : i();
};
function rf() {
  let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : Xx();
  const t = (ot) => rf(ot);
  if (t.version = "3.4.16", t.removed = [], !e || !e.document || e.document.nodeType !== Ee.document || !e.Element)
    return t.isSupported = !1, t;
  let r = e.document;
  const i = r, s = i.currentScript;
  e.DocumentFragment;
  const o = e.HTMLTemplateElement, a = e.Node, n = e.Element, l = e.NodeFilter;
  e.NamedNodeMap === void 0 && (e.NamedNodeMap || e.MozNamedAttrMap), e.HTMLFormElement;
  const c = e.DOMParser, h = e.trustedTypes, u = n.prototype, d = Pe(u, "cloneNode"), f = Pe(u, "remove"), m = Pe(u, "removeAttributeNode"), y = Pe(u, "nextSibling"), x = Pe(u, "childNodes"), C = Pe(u, "parentNode"), k = Pe(u, "shadowRoot"), T = Pe(u, "attributes"), _ = a && a.prototype ? Pe(a.prototype, "nodeType") : null, v = a && a.prototype ? Pe(a.prototype, "nodeName") : null, L = a && a.prototype ? Pe(a.prototype, "ownerDocument") : null, A = function(S) {
    return _ ? _(S) : S.nodeType;
  }, F = function(S) {
    return v ? v(S) : S.nodeName;
  };
  if (typeof o == "function") {
    const ot = r.createElement("template");
    ot.content && ot.content.ownerDocument && (r = ot.content.ownerDocument);
  }
  let G, Y = "", N, st = !1, U = 0;
  const O = function() {
    if (U > 0) throw Mr('A configured TRUSTED_TYPES_POLICY callback (createHTML or createScriptURL) must not call DOMPurify.sanitize, as that causes infinite recursion. Do not pass a policy whose callbacks wrap DOMPurify as TRUSTED_TYPES_POLICY; see the "DOMPurify and Trusted Types" section of the README.');
  }, D = function(S) {
    O(), U++;
    try {
      return G.createHTML(S);
    } finally {
      U--;
    }
  }, B = function(S) {
    O(), U++;
    try {
      return G.createScriptURL(S);
    } finally {
      U--;
    }
  }, q = function() {
    return st || (N = Vx(h, s), st = !0), N;
  }, I = r, it = I.implementation, Q = I.createNodeIterator, mt = I.createDocumentFragment, St = I.getElementsByTagName, Tt = i.importNode;
  let ft = kc();
  t.isSupported = typeof Jd == "function" && typeof C == "function" && it && it.createHTMLDocument !== void 0;
  const Lt = Dx, gt = Ix, wt = Px, Et = Rx, Bt = Nx, Nt = qx, zt = zx, ae = Hx;
  let we = xc, Dt = null;
  const fr = qt({}, [
    ...pc,
    ...Ea,
    ...Ma,
    ...$a,
    ...gc
  ]);
  let Ht = null;
  const Te = qt({}, [
    ...mc,
    ...Oa,
    ...yc,
    ...Vs
  ]);
  let ne = Object.seal(wi(null, {
    tagNameCheck: {
      writable: !0,
      configurable: !1,
      enumerable: !0,
      value: null
    },
    attributeNameCheck: {
      writable: !0,
      configurable: !1,
      enumerable: !0,
      value: null
    },
    allowCustomizedBuiltInElements: {
      writable: !0,
      configurable: !1,
      enumerable: !0,
      value: !1
    }
  })), ze = null, pr = null;
  const ye = Object.seal(wi(null, {
    tagCheck: {
      writable: !0,
      configurable: !1,
      enumerable: !0,
      value: null
    },
    attributeCheck: {
      writable: !0,
      configurable: !1,
      enumerable: !0,
      value: null
    }
  }));
  let Fr = !0, xe = !0, Ar = !1, gr = !0, Ce = !1, Fe = !0, g = !1, M = !1, j = null, V = null, H = !1, et = !1, w = !1, P = !1, J = !0, X = !1;
  const Z = "user-content-";
  let tt = !0, K = !1, ht = {}, lt = null;
  const yt = qt({}, [
    "annotation-xml",
    "audio",
    "colgroup",
    "desc",
    "foreignobject",
    "head",
    "iframe",
    "math",
    "mi",
    "mn",
    "mo",
    "ms",
    "mtext",
    "noembed",
    "noframes",
    "noscript",
    "plaintext",
    "script",
    "selectedcontent",
    "style",
    "svg",
    "template",
    "thead",
    "title",
    "video",
    "xmp"
  ]);
  let bt = null;
  const Mt = qt({}, [
    "audio",
    "video",
    "img",
    "source",
    "image",
    "track"
  ]);
  let Ut = null;
  const Ui = qt({}, [
    "alt",
    "class",
    "for",
    "id",
    "label",
    "name",
    "pattern",
    "placeholder",
    "role",
    "summary",
    "title",
    "value",
    "style",
    "xmlns"
  ]), Ze = "http://www.w3.org/1998/Math/MathML", Ke = "http://www.w3.org/2000/svg", Qe = "http://www.w3.org/1999/xhtml";
  let fi = Qe, wa = !1, Ta = null;
  const W0 = qt({}, [
    Ze,
    Ke,
    Qe
  ], Aa), Uh = ie([
    "mi",
    "mo",
    "mn",
    "ms",
    "mtext"
  ]);
  let Sa = qt({}, Uh);
  const jh = ie(["annotation-xml"]);
  let _a = qt({}, jh);
  const H0 = qt({}, [
    "title",
    "style",
    "font",
    "a",
    "script"
  ]);
  let ji = null;
  const Y0 = ["application/xhtml+xml", "text/html"], U0 = "text/html";
  let Kt = null, pi = null;
  const j0 = r.createElement("form"), Gh = function(S) {
    return S instanceof RegExp || S instanceof Function;
  }, va = function() {
    let S = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    if (pi && pi === S) return;
    (!S || typeof S != "object") && (S = {}), S = $e(S), ji = Y0.indexOf(S.PARSER_MEDIA_TYPE) === -1 ? U0 : S.PARSER_MEDIA_TYPE, Kt = ji === "application/xhtml+xml" ? Aa : as, Dt = $r(S, "ALLOWED_TAGS", fr, { transform: Kt }), Ht = $r(S, "ALLOWED_ATTR", Te, { transform: Kt }), Ta = $r(S, "ALLOWED_NAMESPACES", W0, { transform: Aa }), Ut = $r(S, "ADD_URI_SAFE_ATTR", Ui, {
      transform: Kt,
      base: Ui
    }), bt = $r(S, "ADD_DATA_URI_TAGS", Mt, {
      transform: Kt,
      base: Mt
    }), lt = $r(S, "FORBID_CONTENTS", yt, { transform: Kt }), ze = $r(S, "FORBID_TAGS", $e({}), { transform: Kt }), pr = $r(S, "FORBID_ATTR", $e({}), { transform: Kt }), ht = _e(S, "USE_PROFILES") ? S.USE_PROFILES && typeof S.USE_PROFILES == "object" ? $e(S.USE_PROFILES) : S.USE_PROFILES : !1, Fr = S.ALLOW_ARIA_ATTR !== !1, xe = S.ALLOW_DATA_ATTR !== !1, Ar = S.ALLOW_UNKNOWN_PROTOCOLS || !1, gr = S.ALLOW_SELF_CLOSE_IN_ATTR !== !1, Ce = S.SAFE_FOR_TEMPLATES || !1, Fe = S.SAFE_FOR_XML !== !1, g = S.WHOLE_DOCUMENT || !1, et = S.RETURN_DOM || !1, w = S.RETURN_DOM_FRAGMENT || !1, P = S.RETURN_TRUSTED_TYPE || !1, H = S.FORCE_BODY || !1, J = S.SANITIZE_DOM !== !1, X = S.SANITIZE_NAMED_PROPS || !1, tt = S.KEEP_CONTENT !== !1, K = S.IN_PLACE || !1, we = Mx(S.ALLOWED_URI_REGEXP) ? S.ALLOWED_URI_REGEXP : xc, fi = typeof S.NAMESPACE == "string" ? S.NAMESPACE : Qe, Sa = Da(S, "MATHML_TEXT_INTEGRATION_POINTS", () => qt({}, Uh)), _a = Da(S, "HTML_INTEGRATION_POINTS", () => qt({}, jh));
    const $ = Da(S, "CUSTOM_ELEMENT_HANDLING", () => wi(null));
    if (ne = wi(null), _e($, "tagNameCheck") && Gh($.tagNameCheck) && (ne.tagNameCheck = $.tagNameCheck), _e($, "attributeNameCheck") && Gh($.attributeNameCheck) && (ne.attributeNameCheck = $.attributeNameCheck), _e($, "allowCustomizedBuiltInElements") && typeof $.allowCustomizedBuiltInElements == "boolean" && (ne.allowCustomizedBuiltInElements = $.allowCustomizedBuiltInElements), oe(ne), Ce && (xe = !1), w && (et = !0), ht && (Dt = qt({}, gc), Ht = wi(null), ht.html === !0 && (qt(Dt, pc), qt(Ht, mc)), ht.svg === !0 && (qt(Dt, Ea), qt(Ht, Oa), qt(Ht, Vs)), ht.svgFilters === !0 && (qt(Dt, Ma), qt(Ht, Oa), qt(Ht, Vs)), ht.mathMl === !0 && (qt(Dt, $a), qt(Ht, yc), qt(Ht, Vs))), ye.tagCheck = null, ye.attributeCheck = null, _e(S, "ADD_TAGS") && (typeof S.ADD_TAGS == "function" ? ye.tagCheck = S.ADD_TAGS : Li(S.ADD_TAGS) && (Dt === fr && (Dt = $e(Dt)), qt(Dt, S.ADD_TAGS, Kt))), _e(S, "ADD_ATTR") && (typeof S.ADD_ATTR == "function" ? ye.attributeCheck = S.ADD_ATTR : Li(S.ADD_ATTR) && (Ht === Te && (Ht = $e(Ht)), qt(Ht, S.ADD_ATTR, Kt))), _e(S, "ADD_FORBID_CONTENTS") && Li(S.ADD_FORBID_CONTENTS) && (lt === yt && (lt = $e(lt)), qt(lt, S.ADD_FORBID_CONTENTS, Kt)), tt && (Dt["#text"] = !0), g && qt(Dt, [
      "html",
      "head",
      "body"
    ]), Dt.table && (qt(Dt, ["tbody"]), delete ze.tbody), S.TRUSTED_TYPES_POLICY) {
      if (typeof S.TRUSTED_TYPES_POLICY.createHTML != "function") throw Mr('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
      if (typeof S.TRUSTED_TYPES_POLICY.createScriptURL != "function") throw Mr('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');
      const rt = G;
      G = S.TRUSTED_TYPES_POLICY;
      try {
        Y = D("");
      } catch (at) {
        throw G = rt, at;
      }
    } else S.TRUSTED_TYPES_POLICY === null ? (G = void 0, Y = "") : (G === void 0 && (G = q()), G && typeof Y == "string" && (Y = D("")));
    ie && ie(S), pi = S;
  }, Xh = qt({}, [
    ...Ea,
    ...Ma,
    ...$x
  ]), Vh = qt({}, [...$a, ...Ox]), G0 = function(S, $, rt) {
    return $.namespaceURI === Qe ? S === "svg" : $.namespaceURI === Ze ? S === "svg" && (rt === "annotation-xml" || Sa[rt]) : !!Xh[S];
  }, X0 = function(S, $, rt) {
    return $.namespaceURI === Qe ? S === "math" : $.namespaceURI === Ke ? S === "math" && _a[rt] : !!Vh[S];
  }, V0 = function(S, $, rt) {
    return $.namespaceURI === Ke && !_a[rt] || $.namespaceURI === Ze && !Sa[rt] ? !1 : !Vh[S] && (H0[S] || !Xh[S]);
  }, Z0 = function(S) {
    let $ = C(S);
    (!$ || !$.tagName) && ($ = {
      namespaceURI: fi,
      tagName: "template"
    });
    const rt = as(S.tagName), at = as($.tagName);
    return Ta[S.namespaceURI] ? S.namespaceURI === Ke ? G0(rt, $, at) : S.namespaceURI === Ze ? X0(rt, $, at) : S.namespaceURI === Qe ? V0(rt, $, at) : !!(ji === "application/xhtml+xml" && Ta[S.namespaceURI]) : !1;
  }, Er = function(S) {
    Xi(t.removed, { element: S });
    try {
      C(S).removeChild(S);
    } catch {
      if (f(S), !C(S)) throw Mr("a node selected for removal could not be detached from its tree and cannot be safely returned; refusing to sanitize in place");
    }
  }, Zh = function(S, $, rt) {
    try {
      m(S, $);
    } catch {
      try {
        S.removeAttribute(rt);
      } catch {
      }
    }
  }, Hs = function(S) {
    Ys(S);
    const $ = x(S);
    if ($) {
      const at = [];
      Xr($, (kt) => {
        Xi(at, kt);
      }), Xr(at, (kt) => {
        try {
          f(kt);
        } catch {
        }
      });
    }
    const rt = T(S);
    if (rt) for (let at = rt.length - 1; at >= 0; --at) {
      const kt = rt[at], Ot = kt && kt.name;
      typeof Ot == "string" && Zh(S, kt, Ot);
    }
  }, Yr = function(S, $, rt) {
    if (!rt) try {
      rt = $.getAttributeNode(S);
    } catch {
      rt = null;
    }
    Xi(t.removed, {
      attribute: rt || null,
      from: $
    });
    try {
      rt ? m($, rt) : $.removeAttribute(S);
    } catch {
      try {
        $.removeAttribute(S);
      } catch {
      }
    }
    if (S === "is")
      if (et || w) try {
        Er($);
      } catch {
      }
      else try {
        $.setAttribute(S, "");
      } catch {
      }
  }, K0 = function(S) {
    const $ = T(S);
    if ($)
      for (let rt = $.length - 1; rt >= 0; --rt) {
        const at = $[rt], kt = at && at.name;
        typeof kt != "string" || Ht[Kt(kt)] || Zh(S, at, kt);
      }
  }, Ys = function(S) {
    const $ = [S];
    for (; $.length > 0; ) {
      const rt = $.pop();
      A(rt) === Ee.element && K0(rt);
      const at = x(rt);
      if (at) for (let kt = at.length - 1; kt >= 0; --kt) $.push(at[kt]);
    }
  }, Kh = function(S, $) {
    return Fe ? S === "patchsrc" ? !0 : S === "for" && $ !== "label" && $ !== "output" : !1;
  }, Q0 = function(S) {
    if (!Fe) return;
    const $ = [S];
    for (; $.length > 0; ) {
      const rt = $.pop(), at = A(rt);
      if (at === Ee.processingInstruction || at === Ee.comment && ue(bc, rt.data)) {
        try {
          f(rt);
        } catch {
        }
        continue;
      }
      if (at === Ee.element) {
        const Ot = rt, Rt = Kt(F(rt));
        try {
          Ot.hasAttribute && Ot.hasAttribute("patchsrc") && Ot.removeAttribute("patchsrc"), Ot.hasAttribute && Ot.hasAttribute("for") && Kh("for", Rt) && Ot.removeAttribute("for");
        } catch {
        }
      }
      const kt = x(rt);
      if (kt) for (let Ot = kt.length - 1; Ot >= 0; --Ot) $.push(kt[Ot]);
    }
  }, Qh = function(S) {
    let $ = null, rt = null;
    if (H) S = "<remove></remove>" + S;
    else {
      const Ot = cc(S, /^[\r\n\t ]+/);
      rt = Ot && Ot[0];
    }
    ji === "application/xhtml+xml" && fi === Qe && (S = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + S + "</body></html>");
    const at = G ? D(S) : S;
    if (fi === Qe) try {
      $ = new c().parseFromString(at, ji);
    } catch {
    }
    if (!$ || !$.documentElement) {
      $ = it.createDocument(fi, "template", null);
      try {
        $.documentElement.innerHTML = wa ? Y : at;
      } catch {
      }
    }
    const kt = $.body || $.documentElement;
    return S && rt && kt.insertBefore(r.createTextNode(rt), kt.childNodes[0] || null), fi === Qe ? St.call($, g ? "html" : "body")[0] : g ? $.documentElement : kt;
  }, Jh = function(S) {
    const $ = L ? L(S) : S.ownerDocument;
    return Q.call($ || S, S, l.SHOW_ELEMENT | l.SHOW_COMMENT | l.SHOW_TEXT | l.SHOW_PROCESSING_INSTRUCTION | l.SHOW_CDATA_SECTION, null);
  }, Us = function(S) {
    return S = Vi(S, Lt, " "), S = Vi(S, gt, " "), S = Vi(S, wt, " "), S;
  }, Ba = function(S) {
    var $;
    S.normalize();
    const rt = L ? L(S) : S.ownerDocument, at = Q.call(rt || S, S, l.SHOW_TEXT | l.SHOW_COMMENT | l.SHOW_CDATA_SECTION | l.SHOW_PROCESSING_INSTRUCTION, null);
    let kt = at.nextNode();
    for (; kt; )
      kt.data = Us(kt.data), kt = at.nextNode();
    const Ot = ($ = S.querySelectorAll) === null || $ === void 0 ? void 0 : $.call(S, "template");
    Ot && Xr(Ot, (Rt) => {
      gi(Rt.content) && Ba(Rt.content);
    });
  }, js = function(S) {
    const $ = v ? v(S) : null;
    return typeof $ != "string" || Kt($) !== "form" ? !1 : typeof S.nodeName != "string" || typeof S.textContent != "string" || typeof S.removeChild != "function" || S.attributes !== T(S) || typeof S.removeAttribute != "function" || typeof S.removeAttributeNode != "function" || typeof S.getAttributeNode != "function" || typeof S.setAttribute != "function" || typeof S.namespaceURI != "string" || typeof S.insertBefore != "function" || typeof S.hasChildNodes != "function" || S.nodeType !== _(S) || S.childNodes !== x(S);
  }, gi = function(S) {
    if (!_ || typeof S != "object" || S === null) return !1;
    try {
      return _(S) === Ee.documentFragment;
    } catch {
      return !1;
    }
  }, Gi = function(S) {
    if (!_ || typeof S != "object" || S === null) return !1;
    try {
      return typeof _(S) == "number";
    } catch {
      return !1;
    }
  };
  function Je(ot, S, $) {
    ot.length !== 0 && Xr(ot, (rt) => {
      rt.call(t, S, $, pi);
    });
  }
  const J0 = function(S, $) {
    return !!(Fe && S.hasChildNodes() && !Gi(S.firstElementChild) && ue(Cc, S.textContent) && ue(Cc, S.innerHTML) || Fe && S.namespaceURI === Qe && jx[$] && (Gi(S.firstElementChild) || typeof S.textContent == "string" && ue(Gx[$], S.textContent)) || S.nodeType === Ee.processingInstruction || Fe && S.nodeType === Ee.comment && ue(bc, S.data));
  }, Gs = function(S, $) {
    if (S instanceof RegExp) return ue(S, $);
    if (S instanceof Function) {
      for (var rt = arguments.length, at = new Array(rt > 2 ? rt - 2 : 0), kt = 2; kt < rt; kt++) at[kt - 2] = arguments[kt];
      return !!S($, ...at);
    }
    return !1;
  }, tx = function(S, $, rt) {
    if (!ze[$] && ic($) && Gs(ne.tagNameCheck, $)) return !1;
    if (tt && !lt[$]) {
      const at = C(S), kt = x(S);
      if (kt && at) {
        const Ot = kt.length;
        for (let Rt = Ot - 1; Rt >= 0; --Rt) {
          const Vt = S === rt ? d(kt[Rt], !0) : kt[Rt];
          at.insertBefore(Vt, y(S));
        }
      }
    }
    return Er(S), !0;
  }, tc = function(S, $, rt, at) {
    return S.length === 0 ? $ : $ === rt || $ === at ? $e($) : $;
  }, mi = function(S, $) {
    return S === $ || C(S) !== null ? !1 : (K && Ys(S), !0);
  }, ec = function(S, $) {
    if (Je(ft.beforeSanitizeElements, S, null), mi(S, $)) return !0;
    if (js(S))
      return Er(S), !0;
    const rt = Kt(F(S));
    if (Dt = tc(ft.uponSanitizeElement, Dt, fr, j), Je(ft.uponSanitizeElement, S, {
      tagName: rt,
      allowedTags: Dt
    }), mi(S, $)) return !0;
    if (J0(S, rt))
      return Er(S), !0;
    if (ze[rt] || !(ye.tagCheck instanceof Function && ye.tagCheck(rt)) && !Dt[rt]) {
      const at = tx(S, rt, $);
      return at === !1 && (Je(ft.afterSanitizeElements, S, null), mi(S, $)) ? !0 : at;
    }
    if (A(S) === Ee.element && !Z0(S) || (rt === "noscript" || rt === "noembed" || rt === "noframes") && ue(Yx, S.innerHTML))
      return Er(S), !0;
    if (Ce && S.nodeType === Ee.text) {
      const at = Us(S.textContent);
      S.textContent !== at && (Xi(t.removed, { element: S.cloneNode() }), S.textContent = at);
    }
    return Je(ft.afterSanitizeElements, S, null), mi(S, $);
  }, rc = function(S, $, rt) {
    if (pr[$] || Kh($, S) || J && ($ === "id" || $ === "name") && (rt in r || rt in j0)) return !1;
    const at = Ht[$] || ye.attributeCheck instanceof Function && ye.attributeCheck($, S);
    return xe && ue(Et, $) || Fr && ue(Bt, $) ? !0 : at ? Ut[$] || ue(we, Vi(rt, zt, "")) || ($ === "src" || $ === "xlink:href" || $ === "href") && S !== "script" && uc(rt, "data:") === 0 && bt[S] || Ar && !ue(Nt, Vi(rt, zt, "")) ? !0 : !rt : ic(S) && Gs(ne.tagNameCheck, S) && Gs(ne.attributeNameCheck, $, S) || $ === "is" && ne.allowCustomizedBuiltInElements && Gs(ne.tagNameCheck, rt);
  }, ex = qt({}, [
    "annotation-xml",
    "color-profile",
    "font-face",
    "font-face-format",
    "font-face-name",
    "font-face-src",
    "font-face-uri",
    "missing-glyph"
  ]), ic = function(S) {
    return !ex[as(S)] && ue(ae, S);
  }, rx = function(S, $, rt, at) {
    if (G && typeof h == "object" && typeof h.getAttributeType == "function" && !rt) switch (h.getAttributeType(S, $)) {
      case "TrustedHTML":
        return D(at);
      case "TrustedScriptURL":
        return B(at);
    }
    return at;
  }, ix = function(S, $, rt, at) {
    try {
      return rt ? S.setAttributeNS(rt, $, at) : S.setAttribute($, at), js(S) ? (Er(S), !1) : !0;
    } catch {
      return Yr($, S), !1;
    }
  }, sc = function(S, $) {
    if (Je(ft.beforeSanitizeAttributes, S, null), mi(S, $)) return;
    const rt = S.attributes;
    if (!rt || js(S)) return;
    Ht = tc(ft.uponSanitizeAttribute, Ht, Te, V);
    const at = {
      attrName: "",
      attrValue: "",
      keepAttr: !0,
      allowedAttributes: Ht,
      forceKeepAttr: void 0
    };
    let kt = rt.length;
    const Ot = Kt(S.nodeName);
    for (; kt--; ) {
      const Rt = rt[kt], Vt = Rt.name, De = Rt.namespaceURI, Ae = Rt.value, yi = Kt(Vt), Fa = Ae;
      let be = Vt === "value" ? Fa : vx(Fa), oc = !1;
      if (at.attrName = yi, at.attrValue = be, at.keepAttr = !0, at.forceKeepAttr = void 0, Je(ft.uponSanitizeAttribute, S, at), be = at.attrValue, X && (yi === "id" || yi === "name") && uc(be, Z) !== 0 && (Yr(Vt, S, Rt), be = Z + be, oc = !0), Fe && ue(/((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i, be)) {
        Yr(Vt, S, Rt);
        continue;
      }
      if (yi === "attributename" && cc(be, "href")) {
        Yr(Vt, S, Rt);
        continue;
      }
      if (!at.forceKeepAttr) {
        if (!at.keepAttr) {
          Yr(Vt, S, Rt);
          continue;
        }
        if (!gr && ue(Ux, be)) {
          Yr(Vt, S, Rt);
          continue;
        }
        if (Ce && (be = Us(be)), !rc(Ot, yi, be)) {
          Yr(Vt, S, Rt);
          continue;
        }
        be = rx(Ot, yi, De, be), be !== Fa && ix(S, Vt, De, be) && oc && hc(t.removed);
      }
    }
    Je(ft.afterSanitizeAttributes, S, null), mi(S, $);
  }, Xs = function(S) {
    let $ = null;
    const rt = Jh(S);
    for (Je(ft.beforeSanitizeShadowDOM, S, null); $ = rt.nextNode(); )
      if (Je(ft.uponSanitizeShadowNode, $, null), ec($, S), sc($, S), gi($.content) && Xs($.content), A($) === Ee.element) {
        const at = k($);
        gi(at) && (La(at), Xs(at));
      }
    Je(ft.afterSanitizeShadowDOM, S, null);
  }, La = function(S) {
    const $ = [{
      node: S,
      shadow: null
    }];
    for (; $.length > 0; ) {
      const rt = $.pop();
      if (rt.shadow) {
        Xs(rt.shadow);
        continue;
      }
      const at = rt.node, kt = A(at) === Ee.element, Ot = x(at);
      if (Ot) for (let Rt = Ot.length - 1; Rt >= 0; --Rt) $.push({
        node: Ot[Rt],
        shadow: null
      });
      if (kt) {
        const Rt = v ? v(at) : null;
        if (typeof Rt == "string" && Kt(Rt) === "template") {
          const Vt = at.content;
          gi(Vt) && $.push({
            node: Vt,
            shadow: null
          });
        }
      }
      if (kt) {
        const Rt = k(at);
        gi(Rt) && $.push({
          node: null,
          shadow: Rt
        }, {
          node: Rt,
          shadow: null
        });
      }
    }
  };
  return t.sanitize = function(ot) {
    let S = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, $ = null, rt = null, at = null, kt = null;
    if (wa = !ot, wa && (ot = "<!-->"), typeof ot != "string" && !Gi(ot) && (ot = Ex(ot), typeof ot != "string"))
      throw Mr("dirty is not a string, aborting");
    if (!t.isSupported) return ot;
    M ? (Dt = j, Ht = V) : va(S), (ft.uponSanitizeElement.length > 0 || ft.uponSanitizeAttribute.length > 0) && (Dt = $e(Dt)), ft.uponSanitizeAttribute.length > 0 && (Ht = $e(Ht)), t.removed = [];
    const Ot = K && typeof ot != "string" && Gi(ot);
    if (Ot) {
      Q0(ot);
      const De = F(ot);
      if (typeof De == "string") {
        const Ae = Kt(De);
        if (!Dt[Ae] || ze[Ae])
          throw Hs(ot), Mr("root node is forbidden and cannot be sanitized in-place");
      }
      if (js(ot))
        throw Hs(ot), Mr("root node is clobbered and cannot be sanitized in-place");
      try {
        La(ot);
      } catch (Ae) {
        throw Hs(ot), Ae;
      }
    } else if (Gi(ot))
      $ = Qh("<!---->"), rt = $.ownerDocument.importNode(ot, !0), rt.nodeType === Ee.element && rt.nodeName === "BODY" || rt.nodeName === "HTML" ? $ = rt : $.appendChild(rt), La($);
    else {
      if (!et && !Ce && !g && ot.indexOf("<") === -1) return G && P ? D(ot) : ot;
      if ($ = Qh(ot), !$) return et ? null : P ? Y : "";
    }
    $ && H && Er($.firstChild);
    const Rt = Ot ? ot : $;
    try {
      const De = Jh(Rt);
      for (; at = De.nextNode(); )
        ec(at, Rt), sc(at, Rt), gi(at.content) && Xs(at.content);
    } catch (De) {
      throw Ot && (Hs(ot), Xr(t.removed, (Ae) => {
        Ae.element && Ys(Ae.element);
      })), De;
    }
    if (Ot) {
      let De = !1;
      if (Xr(t.removed, (Ae) => {
        Ae.element && (Ae.element === ot && (De = !0), Ys(Ae.element));
      }), De) throw Mr("a node selected for removal could not be safely returned; refusing to sanitize in place");
      return Ce && Ba(ot), ot;
    }
    if (et) {
      if (Ce && Ba($), w)
        for (kt = mt.call($.ownerDocument); $.firstChild; ) kt.appendChild($.firstChild);
      else kt = $;
      return (Ht.shadowroot || Ht.shadowrootmode) && (kt = Tt.call(i, kt, !0)), kt;
    }
    let Vt = g ? $.outerHTML : $.innerHTML;
    return g && Dt["!doctype"] && $.ownerDocument && $.ownerDocument.doctype && $.ownerDocument.doctype.name && ue(Wx, $.ownerDocument.doctype.name) && (Vt = "<!DOCTYPE " + $.ownerDocument.doctype.name + `>
` + Vt), Ce && (Vt = Us(Vt)), G && P ? D(Vt) : Vt;
  }, t.setConfig = function() {
    let ot = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    va(ot), M = !0, j = Dt, V = Ht;
  }, t.clearConfig = function() {
    pi = null, M = !1, j = null, V = null, G = N, Y = "";
  }, t.isValidAttribute = function(ot, S, $) {
    pi || va({});
    const rt = Kt(ot), at = Kt(S);
    return rc(rt, at, $);
  }, t.addHook = function(ot, S) {
    typeof S == "function" && _e(ft, ot) && Xi(ft[ot], S);
  }, t.removeHook = function(ot, S) {
    if (_e(ft, ot)) {
      if (S !== void 0) {
        const $ = Sx(ft[ot], S);
        return $ === -1 ? void 0 : _x(ft[ot], $, 1)[0];
      }
      return hc(ft[ot]);
    }
  }, t.removeHooks = function(ot) {
    _e(ft, ot) && (ft[ot] = []);
  }, t.removeAllHooks = function() {
    ft = kc();
  }, t;
}
var Mi = rf(), Fn = /* @__PURE__ */ p((e, t, { depth: r = 2 } = {}) => {
  const i = { depth: r };
  if (Array.isArray(t) && !Array.isArray(e))
    return t.forEach((s) => Fn(e, s, i)), e;
  if (Array.isArray(t) && Array.isArray(e))
    return t.forEach((s) => {
      e.includes(s) || e.push(s);
    }), e;
  if (e == null || r <= 0)
    return e != null && typeof e == "object" && typeof t == "object" ? Object.assign(e, t) : t;
  if (t != null && typeof e == "object" && typeof t == "object") {
    const s = e;
    Object.entries(t).forEach(([o, a]) => {
      if (typeof a == "object") {
        if (a === null)
          return;
        Object.hasOwn(e, o) || Object.defineProperty(e, o, {
          value: void 0,
          writable: !0,
          enumerable: !0,
          configurable: !0
        }), s[o] === void 0 && (s[o] = Array.isArray(a) ? [] : {}), typeof s[o] == "object" && (s[o] = Fn(s[o], a, { depth: r - 1 }));
      } else typeof s[o] != "object" && (Object.hasOwn(e, o) ? s[o] = a : Object.defineProperty(e, o, {
        value: a,
        writable: !0,
        enumerable: !0,
        configurable: !0
      }));
    });
  }
  return e;
}, "assignWithDepth"), se = Fn, lr = "#ffffff", hr = "#f2f2f2", vt = /* @__PURE__ */ p((e, t) => t ? b(e, { s: -40, l: 10 }) : b(e, { s: -40, l: -10 }), "mkBorder"), Zx = class {
  static {
    p(this, "Theme");
  }
  constructor() {
    this.background = "#f4f4f4", this.primaryColor = "#fff4dd", this.noteBkgColor = "#fff5ad", this.noteTextColor = "#333", this.THEME_COLOR_LIMIT = 12, this.radius = 5, this.strokeWidth = 1, this.fontFamily = '"trebuchet ms", verdana, arial, sans-serif', this.fontSize = "16px", this.useGradient = !0, this.dropShadow = "drop-shadow( 1px 2px 2px rgba(185,185,185,1))";
  }
  updateColors() {
    if (this.primaryTextColor = this.primaryTextColor || (this.darkMode ? "#eee" : "#333"), this.secondaryColor = this.secondaryColor || b(this.primaryColor, { h: -120 }), this.tertiaryColor = this.tertiaryColor || b(this.primaryColor, { h: 180, l: 5 }), this.primaryBorderColor = this.primaryBorderColor || vt(this.primaryColor, this.darkMode), this.secondaryBorderColor = this.secondaryBorderColor || vt(this.secondaryColor, this.darkMode), this.tertiaryBorderColor = this.tertiaryBorderColor || vt(this.tertiaryColor, this.darkMode), this.noteBorderColor = this.noteBorderColor || vt(this.noteBkgColor, this.darkMode), this.noteBkgColor = this.noteBkgColor || "#fff5ad", this.noteTextColor = this.noteTextColor || "#333", this.secondaryTextColor = this.secondaryTextColor || E(this.secondaryColor), this.tertiaryTextColor = this.tertiaryTextColor || E(this.tertiaryColor), this.lineColor = this.lineColor || E(this.background), this.arrowheadColor = this.arrowheadColor || E(this.background), this.textColor = this.textColor || this.primaryTextColor, this.border2 = this.border2 || this.tertiaryBorderColor, this.nodeBkg = this.nodeBkg || this.primaryColor, this.mainBkg = this.mainBkg || this.primaryColor, this.nodeBorder = this.nodeBorder || this.primaryBorderColor, this.clusterBkg = this.clusterBkg || this.tertiaryColor, this.clusterBorder = this.clusterBorder || this.tertiaryBorderColor, this.defaultLinkColor = this.defaultLinkColor || this.lineColor, this.titleColor = this.titleColor || this.tertiaryTextColor, this.edgeLabelBackground = this.edgeLabelBackground || (this.darkMode ? W(this.secondaryColor, 30) : this.secondaryColor), this.nodeTextColor = this.nodeTextColor || this.primaryTextColor, this.actorBorder = this.actorBorder || this.primaryBorderColor, this.actorBkg = this.actorBkg || this.mainBkg, this.actorTextColor = this.actorTextColor || this.primaryTextColor, this.actorLineColor = this.actorLineColor || this.actorBorder, this.labelBoxBkgColor = this.labelBoxBkgColor || this.actorBkg, this.signalColor = this.signalColor || this.textColor, this.signalTextColor = this.signalTextColor || this.textColor, this.labelBoxBorderColor = this.labelBoxBorderColor || this.actorBorder, this.labelTextColor = this.labelTextColor || this.actorTextColor, this.loopTextColor = this.loopTextColor || this.actorTextColor, this.activationBorderColor = this.activationBorderColor || W(this.secondaryColor, 10), this.activationBkgColor = this.activationBkgColor || this.secondaryColor, this.sequenceNumberColor = this.sequenceNumberColor || E(this.lineColor), this.rectBkgColor = this.rectBkgColor || this.tertiaryColor, this.sectionBkgColor = this.sectionBkgColor || this.tertiaryColor, this.altSectionBkgColor = this.altSectionBkgColor || "white", this.sectionBkgColor = this.sectionBkgColor || this.secondaryColor, this.sectionBkgColor2 = this.sectionBkgColor2 || this.primaryColor, this.excludeBkgColor = this.excludeBkgColor || "#eeeeee", this.taskBorderColor = this.taskBorderColor || this.primaryBorderColor, this.taskBkgColor = this.taskBkgColor || this.primaryColor, this.activeTaskBorderColor = this.activeTaskBorderColor || this.primaryColor, this.activeTaskBkgColor = this.activeTaskBkgColor || z(this.primaryColor, 23), this.gridColor = this.gridColor || "lightgrey", this.doneTaskBkgColor = this.doneTaskBkgColor || "lightgrey", this.doneTaskBorderColor = this.doneTaskBorderColor || "grey", this.critBorderColor = this.critBorderColor || "#ff8888", this.critBkgColor = this.critBkgColor || "red", this.todayLineColor = this.todayLineColor || "red", this.vertLineColor = this.vertLineColor || "navy", this.taskTextColor = this.taskTextColor || this.textColor, this.taskTextOutsideColor = this.taskTextOutsideColor || this.textColor, this.taskTextLightColor = this.taskTextLightColor || this.textColor, this.taskTextColor = this.taskTextColor || this.primaryTextColor, this.taskTextDarkColor = this.taskTextDarkColor || this.textColor, this.taskTextClickableColor = this.taskTextClickableColor || "#003163", this.noteFontWeight = this.noteFontWeight || "normal", this.fontWeight = this.fontWeight || "normal", this.personBorder = this.personBorder || this.primaryBorderColor, this.personBkg = this.personBkg || this.mainBkg, this.darkMode ? (this.rowOdd = this.rowOdd || W(this.mainBkg, 5) || "#ffffff", this.rowEven = this.rowEven || W(this.mainBkg, 10)) : (this.rowOdd = this.rowOdd || z(this.mainBkg, 75) || "#ffffff", this.rowEven = this.rowEven || z(this.mainBkg, 5)), this.transitionColor = this.transitionColor || this.lineColor, this.transitionLabelColor = this.transitionLabelColor || this.textColor, this.stateLabelColor = this.stateLabelColor || this.stateBkg || this.primaryTextColor, this.stateBkg = this.stateBkg || this.mainBkg, this.labelBackgroundColor = this.labelBackgroundColor || this.stateBkg, this.compositeBackground = this.compositeBackground || this.background || this.tertiaryColor, this.altBackground = this.altBackground || this.tertiaryColor, this.compositeTitleBackground = this.compositeTitleBackground || this.mainBkg, this.compositeBorder = this.compositeBorder || this.nodeBorder, this.innerEndBackground = this.nodeBorder, this.errorBkgColor = this.errorBkgColor || this.tertiaryColor, this.errorTextColor = this.errorTextColor || this.tertiaryTextColor, this.transitionColor = this.transitionColor || this.lineColor, this.specialStateColor = this.lineColor, this.cScale0 = this.cScale0 || this.primaryColor, this.cScale1 = this.cScale1 || this.secondaryColor, this.cScale2 = this.cScale2 || this.tertiaryColor, this.cScale3 = this.cScale3 || b(this.primaryColor, { h: 30 }), this.cScale4 = this.cScale4 || b(this.primaryColor, { h: 60 }), this.cScale5 = this.cScale5 || b(this.primaryColor, { h: 90 }), this.cScale6 = this.cScale6 || b(this.primaryColor, { h: 120 }), this.cScale7 = this.cScale7 || b(this.primaryColor, { h: 150 }), this.cScale8 = this.cScale8 || b(this.primaryColor, { h: 210, l: 150 }), this.cScale9 = this.cScale9 || b(this.primaryColor, { h: 270 }), this.cScale10 = this.cScale10 || b(this.primaryColor, { h: 300 }), this.cScale11 = this.cScale11 || b(this.primaryColor, { h: 330 }), this.darkMode)
      for (let t = 0; t < this.THEME_COLOR_LIMIT; t++)
        this["cScale" + t] = W(this["cScale" + t], 75);
    else
      for (let t = 0; t < this.THEME_COLOR_LIMIT; t++)
        this["cScale" + t] = W(this["cScale" + t], 25);
    for (let t = 0; t < this.THEME_COLOR_LIMIT; t++)
      this["cScaleInv" + t] = this["cScaleInv" + t] || E(this["cScale" + t]);
    for (let t = 0; t < this.THEME_COLOR_LIMIT; t++)
      this.darkMode ? this["cScalePeer" + t] = this["cScalePeer" + t] || z(this["cScale" + t], 10) : this["cScalePeer" + t] = this["cScalePeer" + t] || W(this["cScale" + t], 10);
    this.scaleLabelColor = this.scaleLabelColor || this.labelTextColor;
    for (let t = 0; t < this.THEME_COLOR_LIMIT; t++)
      this["cScaleLabel" + t] = this["cScaleLabel" + t] || this.scaleLabelColor;
    const e = this.darkMode ? -4 : -1;
    for (let t = 0; t < 5; t++)
      this["surface" + t] = this["surface" + t] || b(this.mainBkg, { h: 180, s: -15, l: e * (5 + t * 3) }), this["surfacePeer" + t] = this["surfacePeer" + t] || b(this.mainBkg, { h: 180, s: -15, l: e * (8 + t * 3) });
    this.classText = this.classText || this.textColor, this.fillType0 = this.fillType0 || this.primaryColor, this.fillType1 = this.fillType1 || this.secondaryColor, this.fillType2 = this.fillType2 || b(this.primaryColor, { h: 64 }), this.fillType3 = this.fillType3 || b(this.secondaryColor, { h: 64 }), this.fillType4 = this.fillType4 || b(this.primaryColor, { h: -64 }), this.fillType5 = this.fillType5 || b(this.secondaryColor, { h: -64 }), this.fillType6 = this.fillType6 || b(this.primaryColor, { h: 128 }), this.fillType7 = this.fillType7 || b(this.secondaryColor, { h: 128 }), this.pie1 = this.pie1 || this.primaryColor, this.pie2 = this.pie2 || this.secondaryColor, this.pie3 = this.pie3 || this.tertiaryColor, this.pie4 = this.pie4 || b(this.primaryColor, { l: -10 }), this.pie5 = this.pie5 || b(this.secondaryColor, { l: -10 }), this.pie6 = this.pie6 || b(this.tertiaryColor, { l: -10 }), this.pie7 = this.pie7 || b(this.primaryColor, { h: 60, l: -10 }), this.pie8 = this.pie8 || b(this.primaryColor, { h: -60, l: -10 }), this.pie9 = this.pie9 || b(this.primaryColor, { h: 120, l: 0 }), this.pie10 = this.pie10 || b(this.primaryColor, { h: 60, l: -20 }), this.pie11 = this.pie11 || b(this.primaryColor, { h: -60, l: -20 }), this.pie12 = this.pie12 || b(this.primaryColor, { h: 120, l: -10 }), this.pieTitleTextSize = this.pieTitleTextSize || "25px", this.pieTitleTextColor = this.pieTitleTextColor || this.taskTextDarkColor, this.pieSectionTextSize = this.pieSectionTextSize || "17px", this.pieSectionTextColor = this.pieSectionTextColor || this.textColor, this.pieLegendTextSize = this.pieLegendTextSize || "17px", this.pieLegendTextColor = this.pieLegendTextColor || this.taskTextDarkColor, this.pieStrokeColor = this.pieStrokeColor || "black", this.pieStrokeWidth = this.pieStrokeWidth || "2px", this.pieOuterStrokeWidth = this.pieOuterStrokeWidth || "2px", this.pieOuterStrokeColor = this.pieOuterStrokeColor || "black", this.pieOpacity = this.pieOpacity || "0.7", this.venn1 = this.venn1 ?? b(this.primaryColor, { l: -30 }), this.venn2 = this.venn2 ?? b(this.secondaryColor, { l: -30 }), this.venn3 = this.venn3 ?? b(this.tertiaryColor, { l: -30 }), this.venn4 = this.venn4 ?? b(this.primaryColor, { h: 60, l: -30 }), this.venn5 = this.venn5 ?? b(this.primaryColor, { h: -60, l: -30 }), this.venn6 = this.venn6 ?? b(this.secondaryColor, { h: 60, l: -30 }), this.venn7 = this.venn7 ?? b(this.primaryColor, { h: 120, l: -30 }), this.venn8 = this.venn8 ?? b(this.secondaryColor, { h: 120, l: -30 }), this.vennTitleTextColor = this.vennTitleTextColor ?? this.titleColor, this.vennSetTextColor = this.vennSetTextColor ?? this.textColor, this.cynefin = {
      domainFontSize: this.cynefin?.domainFontSize || 16,
      itemFontSize: this.cynefin?.itemFontSize || 12,
      boundaryColor: this.cynefin?.boundaryColor || this.lineColor,
      boundaryWidth: this.cynefin?.boundaryWidth || 2,
      cliffColor: this.cynefin?.cliffColor || "#8B0000",
      cliffWidth: this.cynefin?.cliffWidth || 4,
      arrowColor: this.cynefin?.arrowColor || this.lineColor,
      arrowWidth: this.cynefin?.arrowWidth || 2,
      complexBg: this.cynefin?.complexBg || "#E8F5E9",
      complicatedBg: this.cynefin?.complicatedBg || "#E3F2FD",
      chaoticBg: this.cynefin?.chaoticBg || "#FBE9E7",
      clearBg: this.cynefin?.clearBg || "#FFF8E1",
      confusionBg: this.cynefin?.confusionBg || "#F3E5F5",
      textColor: this.cynefin?.textColor || this.textColor,
      labelColor: this.cynefin?.labelColor || this.primaryTextColor
    }, this.radar = {
      axisColor: this.radar?.axisColor || this.lineColor,
      axisStrokeWidth: this.radar?.axisStrokeWidth || 2,
      axisLabelFontSize: this.radar?.axisLabelFontSize || 12,
      curveOpacity: this.radar?.curveOpacity || 0.5,
      curveStrokeWidth: this.radar?.curveStrokeWidth || 2,
      graticuleColor: this.radar?.graticuleColor || "#DEDEDE",
      graticuleStrokeWidth: this.radar?.graticuleStrokeWidth || 1,
      graticuleOpacity: this.radar?.graticuleOpacity || 0.3,
      legendBoxSize: this.radar?.legendBoxSize || 12,
      legendFontSize: this.radar?.legendFontSize || 12
    }, this.wardleyEvolutionColor = this.wardleyEvolutionColor || "#dc3545", this.wardley = {
      backgroundColor: this.wardley?.backgroundColor || this.background,
      axisColor: this.wardley?.axisColor || this.lineColor,
      axisTextColor: this.wardley?.axisTextColor || this.primaryTextColor,
      gridColor: this.wardley?.gridColor || this.gridColor,
      componentFill: this.wardley?.componentFill || this.background,
      componentStroke: this.wardley?.componentStroke || this.lineColor,
      componentLabelColor: this.wardley?.componentLabelColor || this.primaryTextColor,
      linkStroke: this.wardley?.linkStroke || this.lineColor,
      evolutionStroke: this.wardley?.evolutionStroke || this.wardleyEvolutionColor,
      annotationStroke: this.wardley?.annotationStroke || this.lineColor,
      annotationTextColor: this.wardley?.annotationTextColor || this.primaryTextColor,
      annotationFill: this.wardley?.annotationFill || this.background
    }, this.archEdgeColor = this.archEdgeColor || "#777", this.archEdgeArrowColor = this.archEdgeArrowColor || "#777", this.archEdgeWidth = this.archEdgeWidth || "3", this.archGroupBorderColor = this.archGroupBorderColor || "#000", this.archGroupBorderWidth = this.archGroupBorderWidth || "2px", this.quadrant1Fill = this.quadrant1Fill || this.primaryColor, this.quadrant2Fill = this.quadrant2Fill || b(this.primaryColor, { r: 5, g: 5, b: 5 }), this.quadrant3Fill = this.quadrant3Fill || b(this.primaryColor, { r: 10, g: 10, b: 10 }), this.quadrant4Fill = this.quadrant4Fill || b(this.primaryColor, { r: 15, g: 15, b: 15 }), this.quadrant1TextFill = this.quadrant1TextFill || this.primaryTextColor, this.quadrant2TextFill = this.quadrant2TextFill || b(this.primaryTextColor, { r: -5, g: -5, b: -5 }), this.quadrant3TextFill = this.quadrant3TextFill || b(this.primaryTextColor, { r: -10, g: -10, b: -10 }), this.quadrant4TextFill = this.quadrant4TextFill || b(this.primaryTextColor, { r: -15, g: -15, b: -15 }), this.quadrantPointFill = this.quadrantPointFill || Ge(this.quadrant1Fill) ? z(this.quadrant1Fill) : W(this.quadrant1Fill), this.quadrantPointTextFill = this.quadrantPointTextFill || this.primaryTextColor, this.quadrantXAxisTextFill = this.quadrantXAxisTextFill || this.primaryTextColor, this.quadrantYAxisTextFill = this.quadrantYAxisTextFill || this.primaryTextColor, this.quadrantInternalBorderStrokeFill = this.quadrantInternalBorderStrokeFill || this.primaryBorderColor, this.quadrantExternalBorderStrokeFill = this.quadrantExternalBorderStrokeFill || this.primaryBorderColor, this.quadrantTitleFill = this.quadrantTitleFill || this.primaryTextColor, this.xyChart = {
      backgroundColor: this.xyChart?.backgroundColor || this.background,
      titleColor: this.xyChart?.titleColor || this.primaryTextColor,
      dataLabelColor: this.xyChart?.dataLabelColor || this.primaryTextColor,
      legendTextColor: this.xyChart?.legendTextColor || this.primaryTextColor,
      xAxisTitleColor: this.xyChart?.xAxisTitleColor || this.primaryTextColor,
      xAxisLabelColor: this.xyChart?.xAxisLabelColor || this.primaryTextColor,
      xAxisTickColor: this.xyChart?.xAxisTickColor || this.primaryTextColor,
      xAxisLineColor: this.xyChart?.xAxisLineColor || this.primaryTextColor,
      yAxisTitleColor: this.xyChart?.yAxisTitleColor || this.primaryTextColor,
      yAxisLabelColor: this.xyChart?.yAxisLabelColor || this.primaryTextColor,
      yAxisTickColor: this.xyChart?.yAxisTickColor || this.primaryTextColor,
      yAxisLineColor: this.xyChart?.yAxisLineColor || this.primaryTextColor,
      plotColorPalette: this.xyChart?.plotColorPalette || "#FFF4DD,#FFD8B1,#FFA07A,#ECEFF1,#D6DBDF,#C3E0A8,#FFB6A4,#FFD74D,#738FA7,#FFFFF0"
    }, this.requirementBackground = this.requirementBackground || this.primaryColor, this.requirementBorderColor = this.requirementBorderColor || this.primaryBorderColor, this.requirementBorderSize = this.requirementBorderSize || "1", this.requirementTextColor = this.requirementTextColor || this.primaryTextColor, this.relationColor = this.relationColor || this.lineColor, this.relationLabelBackground = this.relationLabelBackground || (this.darkMode ? W(this.secondaryColor, 30) : this.secondaryColor), this.relationLabelColor = this.relationLabelColor || this.actorTextColor, this.git0 = this.git0 || this.primaryColor, this.git1 = this.git1 || this.secondaryColor, this.git2 = this.git2 || this.tertiaryColor, this.git3 = this.git3 || b(this.primaryColor, { h: -30 }), this.git4 = this.git4 || b(this.primaryColor, { h: -60 }), this.git5 = this.git5 || b(this.primaryColor, { h: -90 }), this.git6 = this.git6 || b(this.primaryColor, { h: 60 }), this.git7 = this.git7 || b(this.primaryColor, { h: 120 }), this.darkMode ? (this.git0 = z(this.git0, 25), this.git1 = z(this.git1, 25), this.git2 = z(this.git2, 25), this.git3 = z(this.git3, 25), this.git4 = z(this.git4, 25), this.git5 = z(this.git5, 25), this.git6 = z(this.git6, 25), this.git7 = z(this.git7, 25)) : (this.git0 = W(this.git0, 25), this.git1 = W(this.git1, 25), this.git2 = W(this.git2, 25), this.git3 = W(this.git3, 25), this.git4 = W(this.git4, 25), this.git5 = W(this.git5, 25), this.git6 = W(this.git6, 25), this.git7 = W(this.git7, 25)), this.gitInv0 = this.gitInv0 || E(this.git0), this.gitInv1 = this.gitInv1 || E(this.git1), this.gitInv2 = this.gitInv2 || E(this.git2), this.gitInv3 = this.gitInv3 || E(this.git3), this.gitInv4 = this.gitInv4 || E(this.git4), this.gitInv5 = this.gitInv5 || E(this.git5), this.gitInv6 = this.gitInv6 || E(this.git6), this.gitInv7 = this.gitInv7 || E(this.git7), this.branchLabelColor = this.branchLabelColor || (this.darkMode ? "black" : this.labelTextColor), this.gitBranchLabel0 = this.gitBranchLabel0 || this.branchLabelColor, this.gitBranchLabel1 = this.gitBranchLabel1 || this.branchLabelColor, this.gitBranchLabel2 = this.gitBranchLabel2 || this.branchLabelColor, this.gitBranchLabel3 = this.gitBranchLabel3 || this.branchLabelColor, this.gitBranchLabel4 = this.gitBranchLabel4 || this.branchLabelColor, this.gitBranchLabel5 = this.gitBranchLabel5 || this.branchLabelColor, this.gitBranchLabel6 = this.gitBranchLabel6 || this.branchLabelColor, this.gitBranchLabel7 = this.gitBranchLabel7 || this.branchLabelColor, this.tagLabelColor = this.tagLabelColor || this.primaryTextColor, this.tagLabelBackground = this.tagLabelBackground || this.primaryColor, this.tagLabelBorder = this.tagBorder || this.primaryBorderColor, this.tagLabelFontSize = this.tagLabelFontSize || "10px", this.commitLabelColor = this.commitLabelColor || this.secondaryTextColor, this.commitLabelBackground = this.commitLabelBackground || this.secondaryColor, this.commitLabelFontSize = this.commitLabelFontSize || "10px", this.emUiFill = this.emUiFill || "white", this.emUiStroke = this.emUiStroke || "#dbdada", this.emProcessorFill = this.emProcessorFill || "#edb3f6", this.emProcessorStroke = this.emProcessorStroke || "#b88cbf", this.emReadModelFill = this.emReadModelFill || "#d3f1a2", this.emReadModelStroke = this.emReadModelStroke || "#a3b732", this.emCommandFill = this.emCommandFill || "#bcd6fe", this.emCommandStroke = this.emCommandStroke || "#679ac3", this.emEventFill = this.emEventFill || "#ffb778", this.emEventStroke = this.emEventStroke || "#c19a0f", this.emSwimlaneBackgroundOdd = this.emSwimlaneBackgroundOdd || "rgb(250,250,250)", this.emSwimlaneBackgroundStroke = this.emSwimlaneBackgroundStroke || "rgb(240,240,240)", this.emArrowhead = this.emArrowhead || this.lineColor, this.emRelationStroke = this.emRelationStroke || this.lineColor, this.attributeBackgroundColorOdd = this.attributeBackgroundColorOdd || lr, this.attributeBackgroundColorEven = this.attributeBackgroundColorEven || hr, this.gradientStart = this.primaryBorderColor, this.gradientStop = this.secondaryBorderColor;
  }
  calculate(e) {
    if (typeof e != "object") {
      this.updateColors();
      return;
    }
    const t = Object.keys(e);
    t.forEach((r) => {
      this[r] = e[r];
    }), this.updateColors(), t.forEach((r) => {
      this[r] = e[r];
    });
  }
}, Kx = /* @__PURE__ */ p((e) => {
  const t = new Zx();
  return t.calculate(e), t;
}, "getThemeVariables"), Qx = class {
  static {
    p(this, "Theme");
  }
  constructor() {
    this.background = "#333", this.primaryColor = "#1f2020", this.secondaryColor = z(this.primaryColor, 16), this.tertiaryColor = b(this.primaryColor, { h: -160 }), this.primaryBorderColor = E(this.background), this.secondaryBorderColor = vt(this.secondaryColor, this.darkMode), this.tertiaryBorderColor = vt(this.tertiaryColor, this.darkMode), this.primaryTextColor = E(this.primaryColor), this.secondaryTextColor = E(this.secondaryColor), this.tertiaryTextColor = E(this.tertiaryColor), this.lineColor = E(this.background), this.textColor = E(this.background), this.mainBkg = "#1f2020", this.secondBkg = "calculated", this.mainContrastColor = "lightgrey", this.darkTextColor = z(E("#323D47"), 10), this.lineColor = "calculated", this.border1 = "#ccc", this.border2 = Nr(255, 255, 255, 0.25), this.arrowheadColor = "calculated", this.fontFamily = '"trebuchet ms", verdana, arial, sans-serif', this.fontSize = "16px", this.labelBackground = "#181818", this.textColor = "#ccc", this.THEME_COLOR_LIMIT = 12, this.radius = 5, this.strokeWidth = 1, this.nodeBkg = "calculated", this.nodeBorder = "calculated", this.clusterBkg = "calculated", this.clusterBorder = "calculated", this.defaultLinkColor = "calculated", this.titleColor = "#F9FFFE", this.edgeLabelBackground = "calculated", this.actorBorder = "calculated", this.actorBkg = "calculated", this.actorTextColor = "calculated", this.actorLineColor = "calculated", this.signalColor = "calculated", this.signalTextColor = "calculated", this.labelBoxBkgColor = "calculated", this.labelBoxBorderColor = "calculated", this.labelTextColor = "calculated", this.loopTextColor = "calculated", this.noteBorderColor = "calculated", this.noteBkgColor = "#fff5ad", this.noteTextColor = "calculated", this.activationBorderColor = "calculated", this.activationBkgColor = "calculated", this.sequenceNumberColor = "black", this.clusterBkg = "#302F3D", this.sectionBkgColor = W("#EAE8D9", 30), this.altSectionBkgColor = "calculated", this.sectionBkgColor2 = "#EAE8D9", this.excludeBkgColor = W(this.sectionBkgColor, 10), this.taskBorderColor = Nr(255, 255, 255, 70), this.taskBkgColor = "calculated", this.taskTextColor = "calculated", this.taskTextLightColor = "calculated", this.taskTextOutsideColor = "calculated", this.taskTextClickableColor = "#003163", this.activeTaskBorderColor = Nr(255, 255, 255, 50), this.activeTaskBkgColor = "#81B1DB", this.gridColor = "calculated", this.doneTaskBkgColor = "calculated", this.doneTaskBorderColor = "grey", this.critBorderColor = "#E83737", this.critBkgColor = "#E83737", this.taskTextDarkColor = "calculated", this.todayLineColor = "#DB5757", this.vertLineColor = "#00BFFF", this.personBorder = this.primaryBorderColor, this.personBkg = this.mainBkg, this.archEdgeColor = "calculated", this.archEdgeArrowColor = "calculated", this.archEdgeWidth = "3", this.archGroupBorderColor = this.primaryBorderColor, this.archGroupBorderWidth = "2px", this.rowOdd = this.rowOdd || z(this.mainBkg, 5) || "#ffffff", this.rowEven = this.rowEven || W(this.mainBkg, 10), this.labelColor = "calculated", this.errorBkgColor = "#a44141", this.errorTextColor = "#ddd", this.useGradient = !0, this.gradientStart = this.primaryBorderColor, this.gradientStop = this.secondaryBorderColor, this.dropShadow = "drop-shadow( 1px 2px 2px rgba(185,185,185,1))", this.noteFontWeight = this.noteFontWeight || "normal", this.fontWeight = this.fontWeight || "normal";
  }
  updateColors() {
    this.secondBkg = z(this.mainBkg, 16), this.lineColor = this.mainContrastColor, this.arrowheadColor = this.mainContrastColor, this.nodeBkg = this.mainBkg, this.nodeBorder = this.border1, this.clusterBkg = this.secondBkg, this.clusterBorder = this.border2, this.defaultLinkColor = this.lineColor, this.edgeLabelBackground = z(this.labelBackground, 25), this.actorBorder = this.border1, this.actorBkg = this.mainBkg, this.actorTextColor = this.mainContrastColor, this.actorLineColor = this.actorBorder, this.signalColor = this.mainContrastColor, this.signalTextColor = this.mainContrastColor, this.labelBoxBkgColor = this.actorBkg, this.labelBoxBorderColor = this.actorBorder, this.labelTextColor = this.mainContrastColor, this.loopTextColor = this.mainContrastColor, this.noteBorderColor = this.secondaryBorderColor, this.noteBkgColor = this.secondBkg, this.noteTextColor = this.secondaryTextColor, this.activationBorderColor = this.border1, this.activationBkgColor = this.secondBkg, this.rectBkgColor = this.rectBkgColor || this.tertiaryColor, this.altSectionBkgColor = this.background, this.taskBkgColor = z(this.mainBkg, 23), this.taskTextColor = this.darkTextColor, this.taskTextLightColor = this.mainContrastColor, this.taskTextOutsideColor = this.taskTextLightColor, this.gridColor = this.mainContrastColor, this.doneTaskBkgColor = this.mainContrastColor, this.taskTextDarkColor = E(this.doneTaskBkgColor), this.archEdgeColor = this.lineColor, this.archEdgeArrowColor = this.lineColor, this.transitionColor = this.transitionColor || this.lineColor, this.transitionLabelColor = this.transitionLabelColor || this.textColor, this.stateLabelColor = this.stateLabelColor || this.stateBkg || this.primaryTextColor, this.stateBkg = this.stateBkg || this.mainBkg, this.labelBackgroundColor = this.labelBackgroundColor || this.stateBkg, this.compositeBackground = this.compositeBackground || this.background || this.tertiaryColor, this.altBackground = this.altBackground || "#555", this.compositeTitleBackground = this.compositeTitleBackground || this.mainBkg, this.compositeBorder = this.compositeBorder || this.nodeBorder, this.innerEndBackground = this.primaryBorderColor, this.specialStateColor = "#f4f4f4", this.errorBkgColor = this.errorBkgColor || this.tertiaryColor, this.errorTextColor = this.errorTextColor || this.tertiaryTextColor, this.fillType0 = this.primaryColor, this.fillType1 = this.secondaryColor, this.fillType2 = b(this.primaryColor, { h: 64 }), this.fillType3 = b(this.secondaryColor, { h: 64 }), this.fillType4 = b(this.primaryColor, { h: -64 }), this.fillType5 = b(this.secondaryColor, { h: -64 }), this.fillType6 = b(this.primaryColor, { h: 128 }), this.fillType7 = b(this.secondaryColor, { h: 128 }), this.cScale1 = this.cScale1 || "#0b0000", this.cScale2 = this.cScale2 || "#4d1037", this.cScale3 = this.cScale3 || "#3f5258", this.cScale4 = this.cScale4 || "#4f2f1b", this.cScale5 = this.cScale5 || "#6e0a0a", this.cScale6 = this.cScale6 || "#3b0048", this.cScale7 = this.cScale7 || "#995a01", this.cScale8 = this.cScale8 || "#154706", this.cScale9 = this.cScale9 || "#161722", this.cScale10 = this.cScale10 || "#00296f", this.cScale11 = this.cScale11 || "#01629c", this.cScale12 = this.cScale12 || "#010029", this.cScale0 = this.cScale0 || this.primaryColor, this.cScale1 = this.cScale1 || this.secondaryColor, this.cScale2 = this.cScale2 || this.tertiaryColor, this.cScale3 = this.cScale3 || b(this.primaryColor, { h: 30 }), this.cScale4 = this.cScale4 || b(this.primaryColor, { h: 60 }), this.cScale5 = this.cScale5 || b(this.primaryColor, { h: 90 }), this.cScale6 = this.cScale6 || b(this.primaryColor, { h: 120 }), this.cScale7 = this.cScale7 || b(this.primaryColor, { h: 150 }), this.cScale8 = this.cScale8 || b(this.primaryColor, { h: 210 }), this.cScale9 = this.cScale9 || b(this.primaryColor, { h: 270 }), this.cScale10 = this.cScale10 || b(this.primaryColor, { h: 300 }), this.cScale11 = this.cScale11 || b(this.primaryColor, { h: 330 });
    for (let e = 0; e < this.THEME_COLOR_LIMIT; e++)
      this["cScaleInv" + e] = this["cScaleInv" + e] || E(this["cScale" + e]);
    for (let e = 0; e < this.THEME_COLOR_LIMIT; e++)
      this["cScalePeer" + e] = this["cScalePeer" + e] || z(this["cScale" + e], 10);
    for (let e = 0; e < 5; e++)
      this["surface" + e] = this["surface" + e] || b(this.mainBkg, { h: 30, s: -30, l: -(-10 + e * 4) }), this["surfacePeer" + e] = this["surfacePeer" + e] || b(this.mainBkg, { h: 30, s: -30, l: -(-7 + e * 4) });
    this.scaleLabelColor = this.scaleLabelColor || (this.darkMode ? "black" : this.labelTextColor);
    for (let e = 0; e < this.THEME_COLOR_LIMIT; e++)
      this["cScaleLabel" + e] = this["cScaleLabel" + e] || this.scaleLabelColor;
    for (let e = 0; e < this.THEME_COLOR_LIMIT; e++)
      this["pie" + e] = this["cScale" + e];
    this.pieTitleTextSize = this.pieTitleTextSize || "25px", this.pieTitleTextColor = this.pieTitleTextColor || this.mainContrastColor, this.pieSectionTextSize = this.pieSectionTextSize || "17px", this.pieSectionTextColor = this.pieSectionTextColor || this.textColor, this.pieLegendTextSize = this.pieLegendTextSize || "17px", this.pieLegendTextColor = this.pieLegendTextColor || this.mainContrastColor, this.pieStrokeColor = this.pieStrokeColor || "black", this.pieStrokeWidth = this.pieStrokeWidth || "2px", this.pieOuterStrokeWidth = this.pieOuterStrokeWidth || "2px", this.pieOuterStrokeColor = this.pieOuterStrokeColor || "black", this.pieOpacity = this.pieOpacity || "0.7";
    for (let e = 0; e < 8; e++)
      this["venn" + (e + 1)] = this["venn" + (e + 1)] ?? z(this["cScale" + e], 30);
    this.vennTitleTextColor = this.vennTitleTextColor ?? this.titleColor, this.vennSetTextColor = this.vennSetTextColor ?? this.textColor, this.cynefin = {
      domainFontSize: this.cynefin?.domainFontSize || 16,
      itemFontSize: this.cynefin?.itemFontSize || 12,
      boundaryColor: this.cynefin?.boundaryColor || this.lineColor,
      boundaryWidth: this.cynefin?.boundaryWidth || 2,
      cliffColor: this.cynefin?.cliffColor || "#FF6B6B",
      cliffWidth: this.cynefin?.cliffWidth || 4,
      arrowColor: this.cynefin?.arrowColor || this.lineColor,
      arrowWidth: this.cynefin?.arrowWidth || 2,
      complexBg: this.cynefin?.complexBg || "#1B5E20",
      complicatedBg: this.cynefin?.complicatedBg || "#0D47A1",
      chaoticBg: this.cynefin?.chaoticBg || "#BF360C",
      clearBg: this.cynefin?.clearBg || "#F57F17",
      confusionBg: this.cynefin?.confusionBg || "#4A148C",
      textColor: this.cynefin?.textColor || this.textColor,
      labelColor: this.cynefin?.labelColor || this.primaryTextColor
    }, this.quadrant1Fill = this.quadrant1Fill || this.primaryColor, this.quadrant2Fill = this.quadrant2Fill || b(this.primaryColor, { r: 5, g: 5, b: 5 }), this.quadrant3Fill = this.quadrant3Fill || b(this.primaryColor, { r: 10, g: 10, b: 10 }), this.quadrant4Fill = this.quadrant4Fill || b(this.primaryColor, { r: 15, g: 15, b: 15 }), this.quadrant1TextFill = this.quadrant1TextFill || this.primaryTextColor, this.quadrant2TextFill = this.quadrant2TextFill || b(this.primaryTextColor, { r: -5, g: -5, b: -5 }), this.quadrant3TextFill = this.quadrant3TextFill || b(this.primaryTextColor, { r: -10, g: -10, b: -10 }), this.quadrant4TextFill = this.quadrant4TextFill || b(this.primaryTextColor, { r: -15, g: -15, b: -15 }), this.quadrantPointFill = this.quadrantPointFill || Ge(this.quadrant1Fill) ? z(this.quadrant1Fill) : W(this.quadrant1Fill), this.quadrantPointTextFill = this.quadrantPointTextFill || this.primaryTextColor, this.quadrantXAxisTextFill = this.quadrantXAxisTextFill || this.primaryTextColor, this.quadrantYAxisTextFill = this.quadrantYAxisTextFill || this.primaryTextColor, this.quadrantInternalBorderStrokeFill = this.quadrantInternalBorderStrokeFill || this.primaryBorderColor, this.quadrantExternalBorderStrokeFill = this.quadrantExternalBorderStrokeFill || this.primaryBorderColor, this.quadrantTitleFill = this.quadrantTitleFill || this.primaryTextColor, this.xyChart = {
      backgroundColor: this.xyChart?.backgroundColor || this.background,
      titleColor: this.xyChart?.titleColor || this.primaryTextColor,
      dataLabelColor: this.xyChart?.dataLabelColor || this.primaryTextColor,
      legendTextColor: this.xyChart?.legendTextColor || this.primaryTextColor,
      xAxisTitleColor: this.xyChart?.xAxisTitleColor || this.primaryTextColor,
      xAxisLabelColor: this.xyChart?.xAxisLabelColor || this.primaryTextColor,
      xAxisTickColor: this.xyChart?.xAxisTickColor || this.primaryTextColor,
      xAxisLineColor: this.xyChart?.xAxisLineColor || this.primaryTextColor,
      yAxisTitleColor: this.xyChart?.yAxisTitleColor || this.primaryTextColor,
      yAxisLabelColor: this.xyChart?.yAxisLabelColor || this.primaryTextColor,
      yAxisTickColor: this.xyChart?.yAxisTickColor || this.primaryTextColor,
      yAxisLineColor: this.xyChart?.yAxisLineColor || this.primaryTextColor,
      plotColorPalette: this.xyChart?.plotColorPalette || "#3498db,#2ecc71,#e74c3c,#f1c40f,#bdc3c7,#ffffff,#34495e,#9b59b6,#1abc9c,#e67e22"
    }, this.packet = {
      startByteColor: this.primaryTextColor,
      endByteColor: this.primaryTextColor,
      labelColor: this.primaryTextColor,
      titleColor: this.primaryTextColor,
      blockStrokeColor: this.primaryTextColor,
      blockFillColor: this.background
    }, this.radar = {
      axisColor: this.radar?.axisColor || this.lineColor,
      axisStrokeWidth: this.radar?.axisStrokeWidth || 2,
      axisLabelFontSize: this.radar?.axisLabelFontSize || 12,
      curveOpacity: this.radar?.curveOpacity || 0.5,
      curveStrokeWidth: this.radar?.curveStrokeWidth || 2,
      graticuleColor: this.radar?.graticuleColor || "#DEDEDE",
      graticuleStrokeWidth: this.radar?.graticuleStrokeWidth || 1,
      graticuleOpacity: this.radar?.graticuleOpacity || 0.3,
      legendBoxSize: this.radar?.legendBoxSize || 12,
      legendFontSize: this.radar?.legendFontSize || 12
    }, this.wardleyEvolutionColor = this.wardleyEvolutionColor || "#ff6b6b", this.wardley = {
      backgroundColor: this.wardley?.backgroundColor || this.background,
      axisColor: this.wardley?.axisColor || this.lineColor,
      axisTextColor: this.wardley?.axisTextColor || this.primaryTextColor,
      gridColor: this.wardley?.gridColor || this.gridColor,
      componentFill: this.wardley?.componentFill || this.mainBkg,
      componentStroke: this.wardley?.componentStroke || this.lineColor,
      componentLabelColor: this.wardley?.componentLabelColor || this.primaryTextColor,
      linkStroke: this.wardley?.linkStroke || this.lineColor,
      evolutionStroke: this.wardley?.evolutionStroke || this.wardleyEvolutionColor,
      annotationStroke: this.wardley?.annotationStroke || this.lineColor,
      annotationTextColor: this.wardley?.annotationTextColor || this.primaryTextColor,
      annotationFill: this.wardley?.annotationFill || this.mainBkg
    }, this.classText = this.primaryTextColor, this.requirementBackground = this.requirementBackground || this.primaryColor, this.requirementBorderColor = this.requirementBorderColor || this.primaryBorderColor, this.requirementBorderSize = this.requirementBorderSize || "1", this.requirementTextColor = this.requirementTextColor || this.primaryTextColor, this.relationColor = this.relationColor || this.lineColor, this.relationLabelBackground = this.relationLabelBackground || (this.darkMode ? W(this.secondaryColor, 30) : this.secondaryColor), this.relationLabelColor = this.relationLabelColor || this.actorTextColor, this.git0 = z(this.secondaryColor, 20), this.git1 = z(this.pie2 || this.secondaryColor, 20), this.git2 = z(this.pie3 || this.tertiaryColor, 20), this.git3 = z(this.pie4 || b(this.primaryColor, { h: -30 }), 20), this.git4 = z(this.pie5 || b(this.primaryColor, { h: -60 }), 20), this.git5 = z(this.pie6 || b(this.primaryColor, { h: -90 }), 10), this.git6 = z(this.pie7 || b(this.primaryColor, { h: 60 }), 10), this.git7 = z(this.pie8 || b(this.primaryColor, { h: 120 }), 20), this.gitInv0 = this.gitInv0 || E(this.git0), this.gitInv1 = this.gitInv1 || E(this.git1), this.gitInv2 = this.gitInv2 || E(this.git2), this.gitInv3 = this.gitInv3 || E(this.git3), this.gitInv4 = this.gitInv4 || E(this.git4), this.gitInv5 = this.gitInv5 || E(this.git5), this.gitInv6 = this.gitInv6 || E(this.git6), this.gitInv7 = this.gitInv7 || E(this.git7), this.gitBranchLabel0 = this.gitBranchLabel0 || E(this.labelTextColor), this.gitBranchLabel1 = this.gitBranchLabel1 || this.labelTextColor, this.gitBranchLabel2 = this.gitBranchLabel2 || this.labelTextColor, this.gitBranchLabel3 = this.gitBranchLabel3 || E(this.labelTextColor), this.gitBranchLabel4 = this.gitBranchLabel4 || this.labelTextColor, this.gitBranchLabel5 = this.gitBranchLabel5 || this.labelTextColor, this.gitBranchLabel6 = this.gitBranchLabel6 || this.labelTextColor, this.gitBranchLabel7 = this.gitBranchLabel7 || this.labelTextColor, this.tagLabelColor = this.tagLabelColor || this.primaryTextColor, this.tagLabelBackground = this.tagLabelBackground || this.primaryColor, this.tagLabelBorder = this.tagBorder || this.primaryBorderColor, this.tagLabelFontSize = this.tagLabelFontSize || "10px", this.commitLabelColor = this.commitLabelColor || this.secondaryTextColor, this.commitLabelBackground = this.commitLabelBackground || this.secondaryColor, this.commitLabelFontSize = this.commitLabelFontSize || "10px", this.emUiFill = this.emUiFill || "#2d2d2d", this.emUiStroke = this.emUiStroke || "#555", this.emProcessorFill = this.emProcessorFill || z("#5a3d5c", 10), this.emProcessorStroke = this.emProcessorStroke || "#8a6d8c", this.emReadModelFill = this.emReadModelFill || z("#3d5a2d", 10), this.emReadModelStroke = this.emReadModelStroke || "#6d8c5c", this.emCommandFill = this.emCommandFill || z("#2d3d5a", 10), this.emCommandStroke = this.emCommandStroke || "#5c6d8c", this.emEventFill = this.emEventFill || z("#5a452d", 10), this.emEventStroke = this.emEventStroke || "#8c755c", this.emSwimlaneBackgroundOdd = this.emSwimlaneBackgroundOdd || z(this.background, 5), this.emSwimlaneBackgroundStroke = this.emSwimlaneBackgroundStroke || z(this.background, 12), this.emArrowhead = this.emArrowhead || this.lineColor, this.emRelationStroke = this.emRelationStroke || this.lineColor, this.attributeBackgroundColorOdd = this.attributeBackgroundColorOdd || z(this.background, 12), this.attributeBackgroundColorEven = this.attributeBackgroundColorEven || z(this.background, 2), this.nodeBorder = this.nodeBorder || "#999";
  }
  calculate(e) {
    if (typeof e != "object") {
      this.updateColors();
      return;
    }
    const t = Object.keys(e);
    t.forEach((r) => {
      this[r] = e[r];
    }), this.updateColors(), t.forEach((r) => {
      this[r] = e[r];
    });
  }
}, Jx = /* @__PURE__ */ p((e) => {
  const t = new Qx();
  return t.calculate(e), t;
}, "getThemeVariables"), tC = class {
  static {
    p(this, "Theme");
  }
  constructor() {
    this.background = "#f4f4f4", this.primaryColor = "#ECECFF", this.secondaryColor = b(this.primaryColor, { h: 120 }), this.secondaryColor = "#ffffde", this.tertiaryColor = b(this.primaryColor, { h: -160 }), this.primaryBorderColor = vt(this.primaryColor, this.darkMode), this.secondaryBorderColor = vt(this.secondaryColor, this.darkMode), this.tertiaryBorderColor = vt(this.tertiaryColor, this.darkMode), this.primaryTextColor = E(this.primaryColor), this.secondaryTextColor = E(this.secondaryColor), this.tertiaryTextColor = E(this.tertiaryColor), this.lineColor = E(this.background), this.textColor = E(this.background), this.background = "white", this.mainBkg = "#ECECFF", this.secondBkg = "#ffffde", this.lineColor = "#333333", this.border1 = "#9370DB", this.primaryBorderColor = vt(this.primaryColor, this.darkMode), this.border2 = "#aaaa33", this.arrowheadColor = "#333333", this.fontFamily = '"trebuchet ms", verdana, arial, sans-serif', this.fontSize = "16px", this.labelBackground = "rgba(232,232,232, 0.8)", this.textColor = "#333", this.THEME_COLOR_LIMIT = 12, this.radius = 5, this.strokeWidth = 1, this.nodeBkg = "calculated", this.nodeBorder = "calculated", this.clusterBkg = "calculated", this.clusterBorder = "calculated", this.defaultLinkColor = "calculated", this.titleColor = "calculated", this.edgeLabelBackground = "calculated", this.actorBorder = "calculated", this.actorBkg = "calculated", this.actorTextColor = "black", this.actorLineColor = "calculated", this.signalColor = "calculated", this.signalTextColor = "calculated", this.labelBoxBkgColor = "calculated", this.labelBoxBorderColor = "calculated", this.labelTextColor = "calculated", this.loopTextColor = "calculated", this.noteBorderColor = "calculated", this.noteBkgColor = "#fff5ad", this.noteTextColor = "calculated", this.activationBorderColor = "#666", this.activationBkgColor = "#f4f4f4", this.sequenceNumberColor = "white", this.clusterBkg = "#FBFBFF", this.sectionBkgColor = "calculated", this.altSectionBkgColor = "calculated", this.sectionBkgColor2 = "calculated", this.excludeBkgColor = "#eeeeee", this.taskBorderColor = "calculated", this.taskBkgColor = "calculated", this.taskTextLightColor = "calculated", this.taskTextColor = this.taskTextLightColor, this.taskTextDarkColor = "calculated", this.taskTextOutsideColor = this.taskTextDarkColor, this.taskTextClickableColor = "calculated", this.activeTaskBorderColor = "calculated", this.activeTaskBkgColor = "calculated", this.gridColor = "calculated", this.doneTaskBkgColor = "calculated", this.doneTaskBorderColor = "calculated", this.critBorderColor = "calculated", this.critBkgColor = "calculated", this.todayLineColor = "calculated", this.vertLineColor = "calculated", this.sectionBkgColor = Nr(102, 102, 255, 0.49), this.altSectionBkgColor = "white", this.sectionBkgColor2 = "#fff400", this.taskBorderColor = "#534fbc", this.taskBkgColor = "#8a90dd", this.taskTextLightColor = "white", this.taskTextColor = "calculated", this.taskTextDarkColor = "black", this.taskTextOutsideColor = "calculated", this.taskTextClickableColor = "#003163", this.activeTaskBorderColor = "#534fbc", this.activeTaskBkgColor = "#bfc7ff", this.gridColor = "lightgrey", this.doneTaskBkgColor = "lightgrey", this.doneTaskBorderColor = "grey", this.critBorderColor = "#ff8888", this.critBkgColor = "red", this.todayLineColor = "red", this.vertLineColor = "navy", this.noteFontWeight = this.noteFontWeight || "normal", this.fontWeight = this.fontWeight || "normal", this.personBorder = this.primaryBorderColor, this.personBkg = this.mainBkg, this.archEdgeColor = "calculated", this.archEdgeArrowColor = "calculated", this.archEdgeWidth = "3", this.archGroupBorderColor = this.primaryBorderColor, this.archGroupBorderWidth = "2px", this.rowOdd = "calculated", this.rowEven = "calculated", this.labelColor = "black", this.errorBkgColor = "#552222", this.errorTextColor = "#552222", this.useGradient = !1, this.gradientStart = this.primaryBorderColor, this.gradientStop = this.secondaryBorderColor, this.dropShadow = "drop-shadow(1px 2px 2px rgba(185, 185, 185, 1))", this.updateColors();
  }
  updateColors() {
    this.cScale0 = this.cScale0 || this.primaryColor, this.cScale1 = this.cScale1 || this.secondaryColor, this.cScale2 = this.cScale2 || this.tertiaryColor, this.cScale3 = this.cScale3 || b(this.primaryColor, { h: 30 }), this.cScale4 = this.cScale4 || b(this.primaryColor, { h: 60 }), this.cScale5 = this.cScale5 || b(this.primaryColor, { h: 90 }), this.cScale6 = this.cScale6 || b(this.primaryColor, { h: 120 }), this.cScale7 = this.cScale7 || b(this.primaryColor, { h: 150 }), this.cScale8 = this.cScale8 || b(this.primaryColor, { h: 210 }), this.cScale9 = this.cScale9 || b(this.primaryColor, { h: 270 }), this.cScale10 = this.cScale10 || b(this.primaryColor, { h: 300 }), this.cScale11 = this.cScale11 || b(this.primaryColor, { h: 330 }), this.cScalePeer1 = this.cScalePeer1 || W(this.secondaryColor, 45), this.cScalePeer2 = this.cScalePeer2 || W(this.tertiaryColor, 40);
    for (let e = 0; e < this.THEME_COLOR_LIMIT; e++)
      this["cScale" + e] = W(this["cScale" + e], 10), this["cScalePeer" + e] = this["cScalePeer" + e] || W(this["cScale" + e], 25);
    for (let e = 0; e < this.THEME_COLOR_LIMIT; e++)
      this["cScaleInv" + e] = this["cScaleInv" + e] || b(this["cScale" + e], { h: 180 });
    for (let e = 0; e < 5; e++)
      this["surface" + e] = this["surface" + e] || b(this.mainBkg, { h: 30, l: -(5 + e * 5) }), this["surfacePeer" + e] = this["surfacePeer" + e] || b(this.mainBkg, { h: 30, l: -(7 + e * 5) });
    if (this.scaleLabelColor = this.scaleLabelColor !== "calculated" && this.scaleLabelColor ? this.scaleLabelColor : this.labelTextColor, this.labelTextColor !== "calculated") {
      this.cScaleLabel0 = this.cScaleLabel0 || E(this.labelTextColor), this.cScaleLabel3 = this.cScaleLabel3 || E(this.labelTextColor);
      for (let e = 0; e < this.THEME_COLOR_LIMIT; e++)
        this["cScaleLabel" + e] = this["cScaleLabel" + e] || this.labelTextColor;
    }
    this.nodeBkg = this.mainBkg, this.nodeBorder = this.border1, this.clusterBkg = this.secondBkg, this.clusterBorder = this.border2, this.defaultLinkColor = this.lineColor, this.titleColor = this.textColor, this.edgeLabelBackground = this.labelBackground, this.actorBorder = this.border1, this.actorBkg = this.mainBkg, this.labelBoxBkgColor = this.actorBkg, this.signalColor = this.textColor, this.signalTextColor = this.textColor, this.labelBoxBorderColor = this.actorBorder, this.labelTextColor = this.actorTextColor, this.loopTextColor = this.actorTextColor, this.noteBorderColor = this.border2, this.noteTextColor = this.actorTextColor, this.actorLineColor = this.actorBorder, this.rectBkgColor = this.rectBkgColor || this.tertiaryColor, this.taskTextColor = this.taskTextLightColor, this.taskTextOutsideColor = this.taskTextDarkColor, this.archEdgeColor = this.lineColor, this.archEdgeArrowColor = this.lineColor, this.rowOdd = this.rowOdd || z(this.primaryColor, 75) || "#ffffff", this.rowEven = this.rowEven || z(this.primaryColor, 1), this.transitionColor = this.transitionColor || this.lineColor, this.transitionLabelColor = this.transitionLabelColor || this.textColor, this.stateLabelColor = this.stateLabelColor || this.stateBkg || this.primaryTextColor, this.stateBkg = this.stateBkg || this.mainBkg, this.labelBackgroundColor = this.labelBackgroundColor || this.stateBkg, this.compositeBackground = this.compositeBackground || this.background || this.tertiaryColor, this.altBackground = this.altBackground || "#f0f0f0", this.compositeTitleBackground = this.compositeTitleBackground || this.mainBkg, this.compositeBorder = this.compositeBorder || this.nodeBorder, this.innerEndBackground = this.nodeBorder, this.specialStateColor = this.lineColor, this.errorBkgColor = this.errorBkgColor || this.tertiaryColor, this.errorTextColor = this.errorTextColor || this.tertiaryTextColor, this.transitionColor = this.transitionColor || this.lineColor, this.classText = this.primaryTextColor, this.fillType0 = this.primaryColor, this.fillType1 = this.secondaryColor, this.fillType2 = b(this.primaryColor, { h: 64 }), this.fillType3 = b(this.secondaryColor, { h: 64 }), this.fillType4 = b(this.primaryColor, { h: -64 }), this.fillType5 = b(this.secondaryColor, { h: -64 }), this.fillType6 = b(this.primaryColor, { h: 128 }), this.fillType7 = b(this.secondaryColor, { h: 128 }), this.pie1 = this.pie1 || this.primaryColor, this.pie2 = this.pie2 || this.secondaryColor, this.pie3 = this.pie3 || b(this.tertiaryColor, { l: -40 }), this.pie4 = this.pie4 || b(this.primaryColor, { l: -10 }), this.pie5 = this.pie5 || b(this.secondaryColor, { l: -30 }), this.pie6 = this.pie6 || b(this.tertiaryColor, { l: -20 }), this.pie7 = this.pie7 || b(this.primaryColor, { h: 60, l: -20 }), this.pie8 = this.pie8 || b(this.primaryColor, { h: -60, l: -40 }), this.pie9 = this.pie9 || b(this.primaryColor, { h: 120, l: -40 }), this.pie10 = this.pie10 || b(this.primaryColor, { h: 60, l: -40 }), this.pie11 = this.pie11 || b(this.primaryColor, { h: -90, l: -40 }), this.pie12 = this.pie12 || b(this.primaryColor, { h: 120, l: -30 }), this.pieTitleTextSize = this.pieTitleTextSize || "25px", this.pieTitleTextColor = this.pieTitleTextColor || this.taskTextDarkColor, this.pieSectionTextSize = this.pieSectionTextSize || "17px", this.pieSectionTextColor = this.pieSectionTextColor || this.textColor, this.pieLegendTextSize = this.pieLegendTextSize || "17px", this.pieLegendTextColor = this.pieLegendTextColor || this.taskTextDarkColor, this.pieStrokeColor = this.pieStrokeColor || "black", this.pieStrokeWidth = this.pieStrokeWidth || "2px", this.pieOuterStrokeWidth = this.pieOuterStrokeWidth || "2px", this.pieOuterStrokeColor = this.pieOuterStrokeColor || "black", this.pieOpacity = this.pieOpacity || "0.7", this.venn1 = this.venn1 ?? b(this.primaryColor, { l: -30 }), this.venn2 = this.venn2 ?? b(this.secondaryColor, { l: -30 }), this.venn3 = this.venn3 ?? b(this.tertiaryColor, { l: -40 }), this.venn4 = this.venn4 ?? b(this.primaryColor, { h: 60, l: -30 }), this.venn5 = this.venn5 ?? b(this.primaryColor, { h: -60, l: -30 }), this.venn6 = this.venn6 ?? b(this.secondaryColor, { h: 60, l: -30 }), this.venn7 = this.venn7 ?? b(this.primaryColor, { h: 120, l: -30 }), this.venn8 = this.venn8 ?? b(this.secondaryColor, { h: 120, l: -30 }), this.vennTitleTextColor = this.vennTitleTextColor ?? this.titleColor, this.vennSetTextColor = this.vennSetTextColor ?? this.textColor, this.cynefin = {
      domainFontSize: this.cynefin?.domainFontSize || 16,
      itemFontSize: this.cynefin?.itemFontSize || 12,
      boundaryColor: this.cynefin?.boundaryColor || this.lineColor,
      boundaryWidth: this.cynefin?.boundaryWidth || 2,
      cliffColor: this.cynefin?.cliffColor || "#8B0000",
      cliffWidth: this.cynefin?.cliffWidth || 4,
      arrowColor: this.cynefin?.arrowColor || this.lineColor,
      arrowWidth: this.cynefin?.arrowWidth || 2,
      complexBg: this.cynefin?.complexBg || "#E8F5E9",
      complicatedBg: this.cynefin?.complicatedBg || "#E3F2FD",
      chaoticBg: this.cynefin?.chaoticBg || "#FBE9E7",
      clearBg: this.cynefin?.clearBg || "#FFF8E1",
      confusionBg: this.cynefin?.confusionBg || "#F3E5F5",
      textColor: this.cynefin?.textColor || this.textColor,
      labelColor: this.cynefin?.labelColor || this.primaryTextColor
    }, this.quadrant1Fill = this.quadrant1Fill || this.primaryColor, this.quadrant2Fill = this.quadrant2Fill || b(this.primaryColor, { r: 5, g: 5, b: 5 }), this.quadrant3Fill = this.quadrant3Fill || b(this.primaryColor, { r: 10, g: 10, b: 10 }), this.quadrant4Fill = this.quadrant4Fill || b(this.primaryColor, { r: 15, g: 15, b: 15 }), this.quadrant1TextFill = this.quadrant1TextFill || this.primaryTextColor, this.quadrant2TextFill = this.quadrant2TextFill || b(this.primaryTextColor, { r: -5, g: -5, b: -5 }), this.quadrant3TextFill = this.quadrant3TextFill || b(this.primaryTextColor, { r: -10, g: -10, b: -10 }), this.quadrant4TextFill = this.quadrant4TextFill || b(this.primaryTextColor, { r: -15, g: -15, b: -15 }), this.quadrantPointFill = this.quadrantPointFill || Ge(this.quadrant1Fill) ? z(this.quadrant1Fill) : W(this.quadrant1Fill), this.quadrantPointTextFill = this.quadrantPointTextFill || this.primaryTextColor, this.quadrantXAxisTextFill = this.quadrantXAxisTextFill || this.primaryTextColor, this.quadrantYAxisTextFill = this.quadrantYAxisTextFill || this.primaryTextColor, this.quadrantInternalBorderStrokeFill = this.quadrantInternalBorderStrokeFill || this.primaryBorderColor, this.quadrantExternalBorderStrokeFill = this.quadrantExternalBorderStrokeFill || this.primaryBorderColor, this.quadrantTitleFill = this.quadrantTitleFill || this.primaryTextColor, this.radar = {
      axisColor: this.radar?.axisColor || this.lineColor,
      axisStrokeWidth: this.radar?.axisStrokeWidth || 2,
      axisLabelFontSize: this.radar?.axisLabelFontSize || 12,
      curveOpacity: this.radar?.curveOpacity || 0.5,
      curveStrokeWidth: this.radar?.curveStrokeWidth || 2,
      graticuleColor: this.radar?.graticuleColor || "#DEDEDE",
      graticuleStrokeWidth: this.radar?.graticuleStrokeWidth || 1,
      graticuleOpacity: this.radar?.graticuleOpacity || 0.3,
      legendBoxSize: this.radar?.legendBoxSize || 12,
      legendFontSize: this.radar?.legendFontSize || 12
    }, this.wardleyEvolutionColor = this.wardleyEvolutionColor || "#dc3545", this.wardley = {
      backgroundColor: this.wardley?.backgroundColor || this.background,
      axisColor: this.wardley?.axisColor || this.lineColor,
      axisTextColor: this.wardley?.axisTextColor || this.primaryTextColor,
      gridColor: this.wardley?.gridColor || this.gridColor,
      componentFill: this.wardley?.componentFill || this.background,
      componentStroke: this.wardley?.componentStroke || this.lineColor,
      componentLabelColor: this.wardley?.componentLabelColor || this.primaryTextColor,
      linkStroke: this.wardley?.linkStroke || this.lineColor,
      evolutionStroke: this.wardley?.evolutionStroke || this.wardleyEvolutionColor,
      annotationStroke: this.wardley?.annotationStroke || this.lineColor,
      annotationTextColor: this.wardley?.annotationTextColor || this.primaryTextColor,
      annotationFill: this.wardley?.annotationFill || this.background
    }, this.xyChart = {
      backgroundColor: this.xyChart?.backgroundColor || this.background,
      titleColor: this.xyChart?.titleColor || this.primaryTextColor,
      dataLabelColor: this.xyChart?.dataLabelColor || this.primaryTextColor,
      legendTextColor: this.xyChart?.legendTextColor || this.primaryTextColor,
      xAxisTitleColor: this.xyChart?.xAxisTitleColor || this.primaryTextColor,
      xAxisLabelColor: this.xyChart?.xAxisLabelColor || this.primaryTextColor,
      xAxisTickColor: this.xyChart?.xAxisTickColor || this.primaryTextColor,
      xAxisLineColor: this.xyChart?.xAxisLineColor || this.primaryTextColor,
      yAxisTitleColor: this.xyChart?.yAxisTitleColor || this.primaryTextColor,
      yAxisLabelColor: this.xyChart?.yAxisLabelColor || this.primaryTextColor,
      yAxisTickColor: this.xyChart?.yAxisTickColor || this.primaryTextColor,
      yAxisLineColor: this.xyChart?.yAxisLineColor || this.primaryTextColor,
      plotColorPalette: this.xyChart?.plotColorPalette || "#ECECFF,#8493A6,#FFC3A0,#DCDDE1,#B8E994,#D1A36F,#C3CDE6,#FFB6C1,#496078,#F8F3E3"
    }, this.requirementBackground = this.requirementBackground || this.primaryColor, this.requirementBorderColor = this.requirementBorderColor || this.primaryBorderColor, this.requirementBorderSize = this.requirementBorderSize || "1", this.requirementTextColor = this.requirementTextColor || this.primaryTextColor, this.relationColor = this.relationColor || this.lineColor, this.relationLabelBackground = this.relationLabelBackground || this.labelBackground, this.relationLabelColor = this.relationLabelColor || this.actorTextColor, this.git0 = this.git0 || this.primaryColor, this.git1 = this.git1 || this.secondaryColor, this.git2 = this.git2 || this.tertiaryColor, this.git3 = this.git3 || b(this.primaryColor, { h: -30 }), this.git4 = this.git4 || b(this.primaryColor, { h: -60 }), this.git5 = this.git5 || b(this.primaryColor, { h: -90 }), this.git6 = this.git6 || b(this.primaryColor, { h: 60 }), this.git7 = this.git7 || b(this.primaryColor, { h: 120 }), this.darkMode ? (this.git0 = z(this.git0, 25), this.git1 = z(this.git1, 25), this.git2 = z(this.git2, 25), this.git3 = z(this.git3, 25), this.git4 = z(this.git4, 25), this.git5 = z(this.git5, 25), this.git6 = z(this.git6, 25), this.git7 = z(this.git7, 25)) : (this.git0 = W(this.git0, 25), this.git1 = W(this.git1, 25), this.git2 = W(this.git2, 25), this.git3 = W(this.git3, 25), this.git4 = W(this.git4, 25), this.git5 = W(this.git5, 25), this.git6 = W(this.git6, 25), this.git7 = W(this.git7, 25)), this.gitInv0 = this.gitInv0 || W(E(this.git0), 25), this.gitInv1 = this.gitInv1 || E(this.git1), this.gitInv2 = this.gitInv2 || E(this.git2), this.gitInv3 = this.gitInv3 || E(this.git3), this.gitInv4 = this.gitInv4 || E(this.git4), this.gitInv5 = this.gitInv5 || E(this.git5), this.gitInv6 = this.gitInv6 || E(this.git6), this.gitInv7 = this.gitInv7 || E(this.git7), this.gitBranchLabel0 = this.gitBranchLabel0 || E(this.labelTextColor), this.gitBranchLabel1 = this.gitBranchLabel1 || this.labelTextColor, this.gitBranchLabel2 = this.gitBranchLabel2 || this.labelTextColor, this.gitBranchLabel3 = this.gitBranchLabel3 || E(this.labelTextColor), this.gitBranchLabel4 = this.gitBranchLabel4 || this.labelTextColor, this.gitBranchLabel5 = this.gitBranchLabel5 || this.labelTextColor, this.gitBranchLabel6 = this.gitBranchLabel6 || this.labelTextColor, this.gitBranchLabel7 = this.gitBranchLabel7 || this.labelTextColor, this.tagLabelColor = this.tagLabelColor || this.primaryTextColor, this.tagLabelBackground = this.tagLabelBackground || this.primaryColor, this.tagLabelBorder = this.tagBorder || this.primaryBorderColor, this.tagLabelFontSize = this.tagLabelFontSize || "10px", this.commitLabelColor = this.commitLabelColor || this.secondaryTextColor, this.commitLabelBackground = this.commitLabelBackground || this.secondaryColor, this.commitLabelFontSize = this.commitLabelFontSize || "10px", this.emUiFill = this.emUiFill || "white", this.emUiStroke = this.emUiStroke || "#dbdada", this.emProcessorFill = this.emProcessorFill || "#edb3f6", this.emProcessorStroke = this.emProcessorStroke || "#b88cbf", this.emReadModelFill = this.emReadModelFill || "#d3f1a2", this.emReadModelStroke = this.emReadModelStroke || "#a3b732", this.emCommandFill = this.emCommandFill || "#bcd6fe", this.emCommandStroke = this.emCommandStroke || "#679ac3", this.emEventFill = this.emEventFill || "#ffb778", this.emEventStroke = this.emEventStroke || "#c19a0f", this.emSwimlaneBackgroundOdd = this.emSwimlaneBackgroundOdd || "rgb(250,250,250)", this.emSwimlaneBackgroundStroke = this.emSwimlaneBackgroundStroke || "rgb(240,240,240)", this.emArrowhead = this.emArrowhead || this.lineColor, this.emRelationStroke = this.emRelationStroke || this.lineColor, this.attributeBackgroundColorOdd = this.attributeBackgroundColorOdd || lr, this.attributeBackgroundColorEven = this.attributeBackgroundColorEven || hr;
  }
  calculate(e) {
    if (Object.keys(this).forEach((r) => {
      this[r] === "calculated" && (this[r] = void 0);
    }), typeof e != "object") {
      this.updateColors();
      return;
    }
    const t = Object.keys(e);
    t.forEach((r) => {
      this[r] = e[r];
    }), this.updateColors(), t.forEach((r) => {
      this[r] = e[r];
    });
  }
}, eC = /* @__PURE__ */ p((e) => {
  const t = new tC();
  return t.calculate(e), t;
}, "getThemeVariables"), rC = class {
  static {
    p(this, "Theme");
  }
  constructor() {
    this.background = "#f4f4f4", this.primaryColor = "#cde498", this.secondaryColor = "#cdffb2", this.background = "white", this.mainBkg = "#cde498", this.secondBkg = "#cdffb2", this.lineColor = "green", this.border1 = "#13540c", this.border2 = "#6eaa49", this.arrowheadColor = "green", this.fontFamily = '"trebuchet ms", verdana, arial, sans-serif', this.fontSize = "16px", this.tertiaryColor = z("#cde498", 10), this.primaryBorderColor = vt(this.primaryColor, this.darkMode), this.secondaryBorderColor = vt(this.secondaryColor, this.darkMode), this.tertiaryBorderColor = vt(this.tertiaryColor, this.darkMode), this.primaryTextColor = E(this.primaryColor), this.secondaryTextColor = E(this.secondaryColor), this.tertiaryTextColor = E(this.primaryColor), this.lineColor = E(this.background), this.textColor = E(this.background), this.THEME_COLOR_LIMIT = 12, this.radius = 5, this.strokeWidth = 1, this.nodeBkg = "calculated", this.nodeBorder = "calculated", this.clusterBkg = "calculated", this.clusterBorder = "calculated", this.defaultLinkColor = "calculated", this.titleColor = "#333", this.edgeLabelBackground = "#e8e8e8", this.actorBorder = "calculated", this.actorBkg = "calculated", this.actorTextColor = "black", this.actorLineColor = "calculated", this.signalColor = "#333", this.signalTextColor = "#333", this.labelBoxBkgColor = "calculated", this.labelBoxBorderColor = "#326932", this.labelTextColor = "calculated", this.loopTextColor = "calculated", this.noteBorderColor = "calculated", this.noteBkgColor = "#fff5ad", this.noteTextColor = "calculated", this.activationBorderColor = "#666", this.activationBkgColor = "#f4f4f4", this.sequenceNumberColor = "white", this.sectionBkgColor = "#6eaa49", this.altSectionBkgColor = "white", this.sectionBkgColor2 = "#6eaa49", this.excludeBkgColor = "#eeeeee", this.taskBorderColor = "calculated", this.taskBkgColor = "#487e3a", this.taskTextLightColor = "white", this.taskTextColor = "calculated", this.taskTextDarkColor = "black", this.taskTextOutsideColor = "calculated", this.taskTextClickableColor = "#003163", this.activeTaskBorderColor = "calculated", this.activeTaskBkgColor = "calculated", this.gridColor = "lightgrey", this.doneTaskBkgColor = "lightgrey", this.doneTaskBorderColor = "grey", this.critBorderColor = "#ff8888", this.critBkgColor = "red", this.todayLineColor = "red", this.vertLineColor = "#00BFFF", this.personBorder = this.primaryBorderColor, this.personBkg = this.mainBkg, this.archEdgeColor = "calculated", this.archEdgeArrowColor = "calculated", this.archEdgeWidth = "3", this.archGroupBorderColor = this.primaryBorderColor, this.archGroupBorderWidth = "2px", this.noteFontWeight = "normal", this.fontWeight = "normal", this.labelColor = "black", this.errorBkgColor = "#552222", this.errorTextColor = "#552222", this.useGradient = !0, this.gradientStart = this.primaryBorderColor, this.gradientStop = this.secondaryBorderColor, this.dropShadow = "drop-shadow( 1px 2px 2px rgba(185,185,185,0.5))";
  }
  updateColors() {
    this.actorBorder = W(this.mainBkg, 20), this.actorBkg = this.mainBkg, this.labelBoxBkgColor = this.actorBkg, this.labelTextColor = this.actorTextColor, this.loopTextColor = this.actorTextColor, this.noteBorderColor = this.border2, this.noteTextColor = this.actorTextColor, this.actorLineColor = this.actorBorder, this.rectBkgColor = this.rectBkgColor || this.tertiaryColor, this.cScale0 = this.cScale0 || this.primaryColor, this.cScale1 = this.cScale1 || this.secondaryColor, this.cScale2 = this.cScale2 || this.tertiaryColor, this.cScale3 = this.cScale3 || b(this.primaryColor, { h: 30 }), this.cScale4 = this.cScale4 || b(this.primaryColor, { h: 60 }), this.cScale5 = this.cScale5 || b(this.primaryColor, { h: 90 }), this.cScale6 = this.cScale6 || b(this.primaryColor, { h: 120 }), this.cScale7 = this.cScale7 || b(this.primaryColor, { h: 150 }), this.cScale8 = this.cScale8 || b(this.primaryColor, { h: 210 }), this.cScale9 = this.cScale9 || b(this.primaryColor, { h: 270 }), this.cScale10 = this.cScale10 || b(this.primaryColor, { h: 300 }), this.cScale11 = this.cScale11 || b(this.primaryColor, { h: 330 }), this.cScalePeer1 = this.cScalePeer1 || W(this.secondaryColor, 45), this.cScalePeer2 = this.cScalePeer2 || W(this.tertiaryColor, 40);
    for (let e = 0; e < this.THEME_COLOR_LIMIT; e++)
      this["cScale" + e] = W(this["cScale" + e], 10), this["cScalePeer" + e] = this["cScalePeer" + e] || W(this["cScale" + e], 25);
    for (let e = 0; e < this.THEME_COLOR_LIMIT; e++)
      this["cScaleInv" + e] = this["cScaleInv" + e] || b(this["cScale" + e], { h: 180 });
    this.scaleLabelColor = this.scaleLabelColor !== "calculated" && this.scaleLabelColor ? this.scaleLabelColor : this.labelTextColor;
    for (let e = 0; e < this.THEME_COLOR_LIMIT; e++)
      this["cScaleLabel" + e] = this["cScaleLabel" + e] || this.scaleLabelColor;
    for (let e = 0; e < 5; e++)
      this["surface" + e] = this["surface" + e] || b(this.mainBkg, { h: 30, s: -30, l: -(5 + e * 5) }), this["surfacePeer" + e] = this["surfacePeer" + e] || b(this.mainBkg, { h: 30, s: -30, l: -(8 + e * 5) });
    this.nodeBkg = this.mainBkg, this.nodeBorder = this.border1, this.clusterBkg = this.secondBkg, this.clusterBorder = this.border2, this.defaultLinkColor = this.lineColor, this.taskBorderColor = this.border1, this.taskTextColor = this.taskTextLightColor, this.taskTextOutsideColor = this.taskTextDarkColor, this.activeTaskBorderColor = this.taskBorderColor, this.activeTaskBkgColor = this.mainBkg, this.archEdgeColor = this.lineColor, this.archEdgeArrowColor = this.lineColor, this.rowOdd = this.rowOdd || z(this.mainBkg, 75) || "#ffffff", this.rowEven = this.rowEven || z(this.mainBkg, 20), this.transitionColor = this.transitionColor || this.lineColor, this.transitionLabelColor = this.transitionLabelColor || this.textColor, this.stateLabelColor = this.stateLabelColor || this.stateBkg || this.primaryTextColor, this.stateBkg = this.stateBkg || this.mainBkg, this.labelBackgroundColor = this.labelBackgroundColor || this.stateBkg, this.compositeBackground = this.compositeBackground || this.background || this.tertiaryColor, this.altBackground = this.altBackground || "#f0f0f0", this.compositeTitleBackground = this.compositeTitleBackground || this.mainBkg, this.compositeBorder = this.compositeBorder || this.nodeBorder, this.innerEndBackground = this.primaryBorderColor, this.specialStateColor = this.lineColor, this.errorBkgColor = this.errorBkgColor || this.tertiaryColor, this.errorTextColor = this.errorTextColor || this.tertiaryTextColor, this.transitionColor = this.transitionColor || this.lineColor, this.classText = this.primaryTextColor, this.fillType0 = this.primaryColor, this.fillType1 = this.secondaryColor, this.fillType2 = b(this.primaryColor, { h: 64 }), this.fillType3 = b(this.secondaryColor, { h: 64 }), this.fillType4 = b(this.primaryColor, { h: -64 }), this.fillType5 = b(this.secondaryColor, { h: -64 }), this.fillType6 = b(this.primaryColor, { h: 128 }), this.fillType7 = b(this.secondaryColor, { h: 128 }), this.pie1 = this.pie1 || this.primaryColor, this.pie2 = this.pie2 || this.secondaryColor, this.pie3 = this.pie3 || this.tertiaryColor, this.pie4 = this.pie4 || b(this.primaryColor, { l: -30 }), this.pie5 = this.pie5 || b(this.secondaryColor, { l: -30 }), this.pie6 = this.pie6 || b(this.tertiaryColor, { h: 40, l: -40 }), this.pie7 = this.pie7 || b(this.primaryColor, { h: 60, l: -10 }), this.pie8 = this.pie8 || b(this.primaryColor, { h: -60, l: -10 }), this.pie9 = this.pie9 || b(this.primaryColor, { h: 120, l: 0 }), this.pie10 = this.pie10 || b(this.primaryColor, { h: 60, l: -50 }), this.pie11 = this.pie11 || b(this.primaryColor, { h: -60, l: -50 }), this.pie12 = this.pie12 || b(this.primaryColor, { h: 120, l: -50 }), this.pieTitleTextSize = this.pieTitleTextSize || "25px", this.pieTitleTextColor = this.pieTitleTextColor || this.taskTextDarkColor, this.pieSectionTextSize = this.pieSectionTextSize || "17px", this.pieSectionTextColor = this.pieSectionTextColor || this.textColor, this.pieLegendTextSize = this.pieLegendTextSize || "17px", this.pieLegendTextColor = this.pieLegendTextColor || this.taskTextDarkColor, this.pieStrokeColor = this.pieStrokeColor || "black", this.pieStrokeWidth = this.pieStrokeWidth || "2px", this.pieOuterStrokeWidth = this.pieOuterStrokeWidth || "2px", this.pieOuterStrokeColor = this.pieOuterStrokeColor || "black", this.pieOpacity = this.pieOpacity || "0.7", this.venn1 = this.venn1 ?? b(this.primaryColor, { l: -30 }), this.venn2 = this.venn2 ?? b(this.secondaryColor, { l: -30 }), this.venn3 = this.venn3 ?? b(this.tertiaryColor, { l: -30 }), this.venn4 = this.venn4 ?? b(this.primaryColor, { h: 60, l: -30 }), this.venn5 = this.venn5 ?? b(this.primaryColor, { h: -60, l: -30 }), this.venn6 = this.venn6 ?? b(this.secondaryColor, { h: 60, l: -30 }), this.venn7 = this.venn7 ?? b(this.primaryColor, { h: 120, l: -30 }), this.venn8 = this.venn8 ?? b(this.secondaryColor, { h: 120, l: -30 }), this.vennTitleTextColor = this.vennTitleTextColor ?? this.titleColor, this.vennSetTextColor = this.vennSetTextColor ?? this.textColor, this.cynefin = {
      domainFontSize: this.cynefin?.domainFontSize || 16,
      itemFontSize: this.cynefin?.itemFontSize || 12,
      boundaryColor: this.cynefin?.boundaryColor || this.lineColor,
      boundaryWidth: this.cynefin?.boundaryWidth || 2,
      cliffColor: this.cynefin?.cliffColor || "#8B4513",
      cliffWidth: this.cynefin?.cliffWidth || 4,
      arrowColor: this.cynefin?.arrowColor || this.lineColor,
      arrowWidth: this.cynefin?.arrowWidth || 2,
      complexBg: this.cynefin?.complexBg || "#C8E6C9",
      complicatedBg: this.cynefin?.complicatedBg || "#DCEDC8",
      chaoticBg: this.cynefin?.chaoticBg || "#FFE0B2",
      clearBg: this.cynefin?.clearBg || "#FFF9C4",
      confusionBg: this.cynefin?.confusionBg || "#D7CCC8",
      textColor: this.cynefin?.textColor || this.textColor,
      labelColor: this.cynefin?.labelColor || this.primaryTextColor
    }, this.quadrant1Fill = this.quadrant1Fill || this.primaryColor, this.quadrant2Fill = this.quadrant2Fill || b(this.primaryColor, { r: 5, g: 5, b: 5 }), this.quadrant3Fill = this.quadrant3Fill || b(this.primaryColor, { r: 10, g: 10, b: 10 }), this.quadrant4Fill = this.quadrant4Fill || b(this.primaryColor, { r: 15, g: 15, b: 15 }), this.quadrant1TextFill = this.quadrant1TextFill || this.primaryTextColor, this.quadrant2TextFill = this.quadrant2TextFill || b(this.primaryTextColor, { r: -5, g: -5, b: -5 }), this.quadrant3TextFill = this.quadrant3TextFill || b(this.primaryTextColor, { r: -10, g: -10, b: -10 }), this.quadrant4TextFill = this.quadrant4TextFill || b(this.primaryTextColor, { r: -15, g: -15, b: -15 }), this.quadrantPointFill = this.quadrantPointFill || Ge(this.quadrant1Fill) ? z(this.quadrant1Fill) : W(this.quadrant1Fill), this.quadrantPointTextFill = this.quadrantPointTextFill || this.primaryTextColor, this.quadrantXAxisTextFill = this.quadrantXAxisTextFill || this.primaryTextColor, this.quadrantYAxisTextFill = this.quadrantYAxisTextFill || this.primaryTextColor, this.quadrantInternalBorderStrokeFill = this.quadrantInternalBorderStrokeFill || this.primaryBorderColor, this.quadrantExternalBorderStrokeFill = this.quadrantExternalBorderStrokeFill || this.primaryBorderColor, this.quadrantTitleFill = this.quadrantTitleFill || this.primaryTextColor, this.packet = {
      startByteColor: this.primaryTextColor,
      endByteColor: this.primaryTextColor,
      labelColor: this.primaryTextColor,
      titleColor: this.primaryTextColor,
      blockStrokeColor: this.primaryTextColor,
      blockFillColor: this.mainBkg
    }, this.radar = {
      axisColor: this.radar?.axisColor || this.lineColor,
      axisStrokeWidth: this.radar?.axisStrokeWidth || 2,
      axisLabelFontSize: this.radar?.axisLabelFontSize || 12,
      curveOpacity: this.radar?.curveOpacity || 0.5,
      curveStrokeWidth: this.radar?.curveStrokeWidth || 2,
      graticuleColor: this.radar?.graticuleColor || "#DEDEDE",
      graticuleStrokeWidth: this.radar?.graticuleStrokeWidth || 1,
      graticuleOpacity: this.radar?.graticuleOpacity || 0.3,
      legendBoxSize: this.radar?.legendBoxSize || 12,
      legendFontSize: this.radar?.legendFontSize || 12
    }, this.wardleyEvolutionColor = this.wardleyEvolutionColor || "#dc3545", this.wardley = {
      backgroundColor: this.wardley?.backgroundColor || this.background,
      axisColor: this.wardley?.axisColor || this.lineColor,
      axisTextColor: this.wardley?.axisTextColor || this.primaryTextColor,
      gridColor: this.wardley?.gridColor || this.gridColor,
      componentFill: this.wardley?.componentFill || this.background,
      componentStroke: this.wardley?.componentStroke || this.lineColor,
      componentLabelColor: this.wardley?.componentLabelColor || this.primaryTextColor,
      linkStroke: this.wardley?.linkStroke || this.lineColor,
      evolutionStroke: this.wardley?.evolutionStroke || this.wardleyEvolutionColor,
      annotationStroke: this.wardley?.annotationStroke || this.lineColor,
      annotationTextColor: this.wardley?.annotationTextColor || this.primaryTextColor,
      annotationFill: this.wardley?.annotationFill || this.background
    }, this.xyChart = {
      backgroundColor: this.xyChart?.backgroundColor || this.background,
      titleColor: this.xyChart?.titleColor || this.primaryTextColor,
      dataLabelColor: this.xyChart?.dataLabelColor || this.primaryTextColor,
      legendTextColor: this.xyChart?.legendTextColor || this.primaryTextColor,
      xAxisTitleColor: this.xyChart?.xAxisTitleColor || this.primaryTextColor,
      xAxisLabelColor: this.xyChart?.xAxisLabelColor || this.primaryTextColor,
      xAxisTickColor: this.xyChart?.xAxisTickColor || this.primaryTextColor,
      xAxisLineColor: this.xyChart?.xAxisLineColor || this.primaryTextColor,
      yAxisTitleColor: this.xyChart?.yAxisTitleColor || this.primaryTextColor,
      yAxisLabelColor: this.xyChart?.yAxisLabelColor || this.primaryTextColor,
      yAxisTickColor: this.xyChart?.yAxisTickColor || this.primaryTextColor,
      yAxisLineColor: this.xyChart?.yAxisLineColor || this.primaryTextColor,
      plotColorPalette: this.xyChart?.plotColorPalette || "#CDE498,#FF6B6B,#A0D2DB,#D7BDE2,#F0F0F0,#FFC3A0,#7FD8BE,#FF9A8B,#FAF3E0,#FFF176"
    }, this.requirementBackground = this.requirementBackground || this.primaryColor, this.requirementBorderColor = this.requirementBorderColor || this.primaryBorderColor, this.requirementBorderSize = this.requirementBorderSize || "1", this.requirementTextColor = this.requirementTextColor || this.primaryTextColor, this.relationColor = this.relationColor || this.lineColor, this.relationLabelBackground = this.relationLabelBackground || this.edgeLabelBackground, this.relationLabelColor = this.relationLabelColor || this.actorTextColor, this.git0 = this.git0 || this.primaryColor, this.git1 = this.git1 || this.secondaryColor, this.git2 = this.git2 || this.tertiaryColor, this.git3 = this.git3 || b(this.primaryColor, { h: -30 }), this.git4 = this.git4 || b(this.primaryColor, { h: -60 }), this.git5 = this.git5 || b(this.primaryColor, { h: -90 }), this.git6 = this.git6 || b(this.primaryColor, { h: 60 }), this.git7 = this.git7 || b(this.primaryColor, { h: 120 }), this.darkMode ? (this.git0 = z(this.git0, 25), this.git1 = z(this.git1, 25), this.git2 = z(this.git2, 25), this.git3 = z(this.git3, 25), this.git4 = z(this.git4, 25), this.git5 = z(this.git5, 25), this.git6 = z(this.git6, 25), this.git7 = z(this.git7, 25)) : (this.git0 = W(this.git0, 25), this.git1 = W(this.git1, 25), this.git2 = W(this.git2, 25), this.git3 = W(this.git3, 25), this.git4 = W(this.git4, 25), this.git5 = W(this.git5, 25), this.git6 = W(this.git6, 25), this.git7 = W(this.git7, 25)), this.gitInv0 = this.gitInv0 || E(this.git0), this.gitInv1 = this.gitInv1 || E(this.git1), this.gitInv2 = this.gitInv2 || E(this.git2), this.gitInv3 = this.gitInv3 || E(this.git3), this.gitInv4 = this.gitInv4 || E(this.git4), this.gitInv5 = this.gitInv5 || E(this.git5), this.gitInv6 = this.gitInv6 || E(this.git6), this.gitInv7 = this.gitInv7 || E(this.git7), this.gitBranchLabel0 = this.gitBranchLabel0 || E(this.labelTextColor), this.gitBranchLabel1 = this.gitBranchLabel1 || this.labelTextColor, this.gitBranchLabel2 = this.gitBranchLabel2 || this.labelTextColor, this.gitBranchLabel3 = this.gitBranchLabel3 || E(this.labelTextColor), this.gitBranchLabel4 = this.gitBranchLabel4 || this.labelTextColor, this.gitBranchLabel5 = this.gitBranchLabel5 || this.labelTextColor, this.gitBranchLabel6 = this.gitBranchLabel6 || this.labelTextColor, this.gitBranchLabel7 = this.gitBranchLabel7 || this.labelTextColor, this.tagLabelColor = this.tagLabelColor || this.primaryTextColor, this.tagLabelBackground = this.tagLabelBackground || this.primaryColor, this.tagLabelBorder = this.tagBorder || this.primaryBorderColor, this.tagLabelFontSize = this.tagLabelFontSize || "10px", this.commitLabelColor = this.commitLabelColor || this.secondaryTextColor, this.commitLabelBackground = this.commitLabelBackground || this.secondaryColor, this.commitLabelFontSize = this.commitLabelFontSize || "10px", this.emUiFill = this.emUiFill || "white", this.emUiStroke = this.emUiStroke || "#dbdada", this.emProcessorFill = this.emProcessorFill || "#edb3f6", this.emProcessorStroke = this.emProcessorStroke || "#b88cbf", this.emReadModelFill = this.emReadModelFill || "#d3f1a2", this.emReadModelStroke = this.emReadModelStroke || "#a3b732", this.emCommandFill = this.emCommandFill || "#bcd6fe", this.emCommandStroke = this.emCommandStroke || "#679ac3", this.emEventFill = this.emEventFill || "#ffb778", this.emEventStroke = this.emEventStroke || "#c19a0f", this.emSwimlaneBackgroundOdd = this.emSwimlaneBackgroundOdd || "rgb(250,250,250)", this.emSwimlaneBackgroundStroke = this.emSwimlaneBackgroundStroke || "rgb(240,240,240)", this.emArrowhead = this.emArrowhead || this.lineColor, this.emRelationStroke = this.emRelationStroke || this.lineColor, this.attributeBackgroundColorOdd = this.attributeBackgroundColorOdd || lr, this.attributeBackgroundColorEven = this.attributeBackgroundColorEven || hr;
  }
  calculate(e) {
    if (typeof e != "object") {
      this.updateColors();
      return;
    }
    const t = Object.keys(e);
    t.forEach((r) => {
      this[r] = e[r];
    }), this.updateColors(), t.forEach((r) => {
      this[r] = e[r];
    });
  }
}, iC = /* @__PURE__ */ p((e) => {
  const t = new rC();
  return t.calculate(e), t;
}, "getThemeVariables"), sC = class {
  static {
    p(this, "Theme");
  }
  constructor() {
    this.primaryColor = "#eee", this.contrast = "#707070", this.secondaryColor = z(this.contrast, 55), this.background = "#ffffff", this.tertiaryColor = b(this.primaryColor, { h: -160 }), this.primaryBorderColor = vt(this.primaryColor, this.darkMode), this.secondaryBorderColor = vt(this.secondaryColor, this.darkMode), this.tertiaryBorderColor = vt(this.tertiaryColor, this.darkMode), this.primaryTextColor = E(this.primaryColor), this.secondaryTextColor = E(this.secondaryColor), this.tertiaryTextColor = E(this.tertiaryColor), this.lineColor = E(this.background), this.textColor = E(this.background), this.mainBkg = "#eee", this.secondBkg = "calculated", this.lineColor = "#666", this.border1 = "#999", this.border2 = "calculated", this.note = "#ffa", this.text = "#333", this.critical = "#d42", this.done = "#bbb", this.arrowheadColor = "#333333", this.fontFamily = '"trebuchet ms", verdana, arial, sans-serif', this.fontSize = "16px", this.THEME_COLOR_LIMIT = 12, this.radius = 5, this.strokeWidth = 1, this.nodeBkg = "calculated", this.nodeBorder = "calculated", this.clusterBkg = "calculated", this.clusterBorder = "calculated", this.defaultLinkColor = "calculated", this.titleColor = "calculated", this.edgeLabelBackground = "white", this.actorBorder = "calculated", this.actorBkg = "calculated", this.actorTextColor = "calculated", this.actorLineColor = this.actorBorder, this.signalColor = "calculated", this.signalTextColor = "calculated", this.labelBoxBkgColor = "calculated", this.labelBoxBorderColor = "calculated", this.labelTextColor = "calculated", this.loopTextColor = "calculated", this.noteBorderColor = "calculated", this.noteBkgColor = "calculated", this.noteTextColor = "calculated", this.activationBorderColor = "#666", this.activationBkgColor = "#f4f4f4", this.sequenceNumberColor = "white", this.sectionBkgColor = "calculated", this.altSectionBkgColor = "white", this.sectionBkgColor2 = "calculated", this.excludeBkgColor = "#eeeeee", this.taskBorderColor = "calculated", this.taskBkgColor = "calculated", this.taskTextLightColor = "white", this.taskTextColor = "calculated", this.taskTextDarkColor = "calculated", this.taskTextOutsideColor = "calculated", this.taskTextClickableColor = "#003163", this.activeTaskBorderColor = "calculated", this.activeTaskBkgColor = "calculated", this.gridColor = "calculated", this.doneTaskBkgColor = "calculated", this.doneTaskBorderColor = "calculated", this.critBkgColor = "calculated", this.critBorderColor = "calculated", this.todayLineColor = "calculated", this.vertLineColor = "calculated", this.personBorder = this.primaryBorderColor, this.personBkg = this.mainBkg, this.archEdgeColor = "calculated", this.archEdgeArrowColor = "calculated", this.archEdgeWidth = "3", this.archGroupBorderColor = this.primaryBorderColor, this.archGroupBorderWidth = "2px", this.noteFontWeight = "normal", this.fontWeight = "normal", this.rowOdd = this.rowOdd || z(this.mainBkg, 75) || "#ffffff", this.rowEven = this.rowEven || "#f4f4f4", this.labelColor = "black", this.errorBkgColor = "#552222", this.errorTextColor = "#552222", this.useGradient = !0, this.gradientStart = this.primaryBorderColor, this.gradientStop = this.secondaryBorderColor, this.dropShadow = "drop-shadow( 1px 2px 2px rgba(185,185,185,1))";
  }
  updateColors() {
    this.secondBkg = z(this.contrast, 55), this.border2 = this.contrast, this.actorBorder = z(this.border1, 23), this.actorBkg = this.mainBkg, this.actorTextColor = this.text, this.actorLineColor = this.actorBorder, this.rectBkgColor = this.rectBkgColor || this.tertiaryColor, this.signalColor = this.text, this.signalTextColor = this.text, this.labelBoxBkgColor = this.actorBkg, this.labelBoxBorderColor = this.actorBorder, this.labelTextColor = this.text, this.loopTextColor = this.text, this.noteBorderColor = "#999", this.noteBkgColor = "#666", this.noteTextColor = "#fff", this.cScale0 = this.cScale0 || "#555", this.cScale1 = this.cScale1 || "#F4F4F4", this.cScale2 = this.cScale2 || "#555", this.cScale3 = this.cScale3 || "#BBB", this.cScale4 = this.cScale4 || "#777", this.cScale5 = this.cScale5 || "#999", this.cScale6 = this.cScale6 || "#DDD", this.cScale7 = this.cScale7 || "#FFF", this.cScale8 = this.cScale8 || "#DDD", this.cScale9 = this.cScale9 || "#BBB", this.cScale10 = this.cScale10 || "#999", this.cScale11 = this.cScale11 || "#777";
    for (let e = 0; e < this.THEME_COLOR_LIMIT; e++)
      this["cScaleInv" + e] = this["cScaleInv" + e] || E(this["cScale" + e]);
    for (let e = 0; e < this.THEME_COLOR_LIMIT; e++)
      this.darkMode ? this["cScalePeer" + e] = this["cScalePeer" + e] || z(this["cScale" + e], 10) : this["cScalePeer" + e] = this["cScalePeer" + e] || W(this["cScale" + e], 10);
    this.scaleLabelColor = this.scaleLabelColor || (this.darkMode ? "black" : this.labelTextColor), this.cScaleLabel0 = this.cScaleLabel0 || this.cScale1, this.cScaleLabel2 = this.cScaleLabel2 || this.cScale1;
    for (let e = 0; e < this.THEME_COLOR_LIMIT; e++)
      this["cScaleLabel" + e] = this["cScaleLabel" + e] || this.scaleLabelColor;
    for (let e = 0; e < 5; e++)
      this["surface" + e] = this["surface" + e] || b(this.mainBkg, { l: -(5 + e * 5) }), this["surfacePeer" + e] = this["surfacePeer" + e] || b(this.mainBkg, { l: -(8 + e * 5) });
    this.nodeBkg = this.mainBkg, this.nodeBorder = this.border1, this.clusterBkg = this.secondBkg, this.clusterBorder = this.border2, this.defaultLinkColor = this.lineColor, this.titleColor = this.text, this.sectionBkgColor = z(this.contrast, 30), this.sectionBkgColor2 = z(this.contrast, 30), this.taskBorderColor = W(this.contrast, 10), this.taskBkgColor = this.contrast, this.taskTextColor = this.taskTextLightColor, this.taskTextDarkColor = this.text, this.taskTextOutsideColor = this.taskTextDarkColor, this.activeTaskBorderColor = this.taskBorderColor, this.activeTaskBkgColor = this.mainBkg, this.gridColor = z(this.border1, 30), this.doneTaskBkgColor = this.done, this.doneTaskBorderColor = this.lineColor, this.critBkgColor = this.critical, this.critBorderColor = W(this.critBkgColor, 10), this.todayLineColor = this.critBkgColor, this.vertLineColor = this.critBkgColor, this.archEdgeColor = this.lineColor, this.archEdgeArrowColor = this.lineColor, this.transitionColor = this.transitionColor || "#000", this.transitionLabelColor = this.transitionLabelColor || this.textColor, this.stateLabelColor = this.stateLabelColor || this.stateBkg || this.primaryTextColor, this.stateBkg = this.stateBkg || this.mainBkg, this.labelBackgroundColor = this.labelBackgroundColor || this.stateBkg, this.compositeBackground = this.compositeBackground || this.background || this.tertiaryColor, this.altBackground = this.altBackground || "#f4f4f4", this.compositeTitleBackground = this.compositeTitleBackground || this.mainBkg, this.stateBorder = this.stateBorder || "#000", this.innerEndBackground = this.primaryBorderColor, this.specialStateColor = "#222", this.errorBkgColor = this.errorBkgColor || this.tertiaryColor, this.errorTextColor = this.errorTextColor || this.tertiaryTextColor, this.classText = this.primaryTextColor, this.fillType0 = this.primaryColor, this.fillType1 = this.secondaryColor, this.fillType2 = b(this.primaryColor, { h: 64 }), this.fillType3 = b(this.secondaryColor, { h: 64 }), this.fillType4 = b(this.primaryColor, { h: -64 }), this.fillType5 = b(this.secondaryColor, { h: -64 }), this.fillType6 = b(this.primaryColor, { h: 128 }), this.fillType7 = b(this.secondaryColor, { h: 128 });
    for (let e = 0; e < this.THEME_COLOR_LIMIT; e++)
      this["pie" + e] = this["cScale" + e];
    this.pie12 = this.pie0, this.pieTitleTextSize = this.pieTitleTextSize || "25px", this.pieTitleTextColor = this.pieTitleTextColor || this.taskTextDarkColor, this.pieSectionTextSize = this.pieSectionTextSize || "17px", this.pieSectionTextColor = this.pieSectionTextColor || this.textColor, this.pieLegendTextSize = this.pieLegendTextSize || "17px", this.pieLegendTextColor = this.pieLegendTextColor || this.taskTextDarkColor, this.pieStrokeColor = this.pieStrokeColor || "black", this.pieStrokeWidth = this.pieStrokeWidth || "2px", this.pieOuterStrokeWidth = this.pieOuterStrokeWidth || "2px", this.pieOuterStrokeColor = this.pieOuterStrokeColor || "black", this.pieOpacity = this.pieOpacity || "0.7";
    for (let e = 0; e < 8; e++)
      this["venn" + (e + 1)] = this["venn" + (e + 1)] ?? this["cScale" + e];
    this.vennTitleTextColor = this.vennTitleTextColor ?? this.titleColor, this.vennSetTextColor = this.vennSetTextColor ?? this.textColor, this.cynefin = {
      domainFontSize: this.cynefin?.domainFontSize || 16,
      itemFontSize: this.cynefin?.itemFontSize || 12,
      boundaryColor: this.cynefin?.boundaryColor || this.lineColor,
      boundaryWidth: this.cynefin?.boundaryWidth || 2,
      cliffColor: this.cynefin?.cliffColor || "#8B0000",
      cliffWidth: this.cynefin?.cliffWidth || 4,
      arrowColor: this.cynefin?.arrowColor || this.lineColor,
      arrowWidth: this.cynefin?.arrowWidth || 2,
      complexBg: this.cynefin?.complexBg || "#E8F5E9",
      complicatedBg: this.cynefin?.complicatedBg || "#E3F2FD",
      chaoticBg: this.cynefin?.chaoticBg || "#FBE9E7",
      clearBg: this.cynefin?.clearBg || "#FFF8E1",
      confusionBg: this.cynefin?.confusionBg || "#F3E5F5",
      textColor: this.cynefin?.textColor || this.textColor,
      labelColor: this.cynefin?.labelColor || this.primaryTextColor
    }, this.quadrant1Fill = this.quadrant1Fill || this.primaryColor, this.quadrant2Fill = this.quadrant2Fill || b(this.primaryColor, { r: 5, g: 5, b: 5 }), this.quadrant3Fill = this.quadrant3Fill || b(this.primaryColor, { r: 10, g: 10, b: 10 }), this.quadrant4Fill = this.quadrant4Fill || b(this.primaryColor, { r: 15, g: 15, b: 15 }), this.quadrant1TextFill = this.quadrant1TextFill || this.primaryTextColor, this.quadrant2TextFill = this.quadrant2TextFill || b(this.primaryTextColor, { r: -5, g: -5, b: -5 }), this.quadrant3TextFill = this.quadrant3TextFill || b(this.primaryTextColor, { r: -10, g: -10, b: -10 }), this.quadrant4TextFill = this.quadrant4TextFill || b(this.primaryTextColor, { r: -15, g: -15, b: -15 }), this.quadrantPointFill = this.quadrantPointFill || Ge(this.quadrant1Fill) ? z(this.quadrant1Fill) : W(this.quadrant1Fill), this.quadrantPointTextFill = this.quadrantPointTextFill || this.primaryTextColor, this.quadrantXAxisTextFill = this.quadrantXAxisTextFill || this.primaryTextColor, this.quadrantYAxisTextFill = this.quadrantYAxisTextFill || this.primaryTextColor, this.quadrantInternalBorderStrokeFill = this.quadrantInternalBorderStrokeFill || this.primaryBorderColor, this.quadrantExternalBorderStrokeFill = this.quadrantExternalBorderStrokeFill || this.primaryBorderColor, this.quadrantTitleFill = this.quadrantTitleFill || this.primaryTextColor, this.xyChart = {
      backgroundColor: this.xyChart?.backgroundColor || this.background,
      titleColor: this.xyChart?.titleColor || this.primaryTextColor,
      dataLabelColor: this.xyChart?.dataLabelColor || this.primaryTextColor,
      legendTextColor: this.xyChart?.legendTextColor || this.primaryTextColor,
      xAxisTitleColor: this.xyChart?.xAxisTitleColor || this.primaryTextColor,
      xAxisLabelColor: this.xyChart?.xAxisLabelColor || this.primaryTextColor,
      xAxisTickColor: this.xyChart?.xAxisTickColor || this.primaryTextColor,
      xAxisLineColor: this.xyChart?.xAxisLineColor || this.primaryTextColor,
      yAxisTitleColor: this.xyChart?.yAxisTitleColor || this.primaryTextColor,
      yAxisLabelColor: this.xyChart?.yAxisLabelColor || this.primaryTextColor,
      yAxisTickColor: this.xyChart?.yAxisTickColor || this.primaryTextColor,
      yAxisLineColor: this.xyChart?.yAxisLineColor || this.primaryTextColor,
      plotColorPalette: this.xyChart?.plotColorPalette || "#EEE,#6BB8E4,#8ACB88,#C7ACD6,#E8DCC2,#FFB2A8,#FFF380,#7E8D91,#FFD8B1,#FAF3E0"
    }, this.radar = {
      axisColor: this.radar?.axisColor || this.lineColor,
      axisStrokeWidth: this.radar?.axisStrokeWidth || 2,
      axisLabelFontSize: this.radar?.axisLabelFontSize || 12,
      curveOpacity: this.radar?.curveOpacity || 0.5,
      curveStrokeWidth: this.radar?.curveStrokeWidth || 2,
      graticuleColor: this.radar?.graticuleColor || "#DEDEDE",
      graticuleStrokeWidth: this.radar?.graticuleStrokeWidth || 1,
      graticuleOpacity: this.radar?.graticuleOpacity || 0.3,
      legendBoxSize: this.radar?.legendBoxSize || 12,
      legendFontSize: this.radar?.legendFontSize || 12
    }, this.wardleyEvolutionColor = this.wardleyEvolutionColor || "#dc3545", this.wardley = {
      backgroundColor: this.wardley?.backgroundColor || this.background,
      axisColor: this.wardley?.axisColor || this.lineColor,
      axisTextColor: this.wardley?.axisTextColor || this.primaryTextColor,
      gridColor: this.wardley?.gridColor || this.gridColor,
      componentFill: this.wardley?.componentFill || this.background,
      componentStroke: this.wardley?.componentStroke || this.lineColor,
      componentLabelColor: this.wardley?.componentLabelColor || this.primaryTextColor,
      linkStroke: this.wardley?.linkStroke || this.lineColor,
      evolutionStroke: this.wardley?.evolutionStroke || this.wardleyEvolutionColor,
      annotationStroke: this.wardley?.annotationStroke || this.lineColor,
      annotationTextColor: this.wardley?.annotationTextColor || this.primaryTextColor,
      annotationFill: this.wardley?.annotationFill || this.background
    }, this.requirementBackground = this.requirementBackground || this.primaryColor, this.requirementBorderColor = this.requirementBorderColor || this.primaryBorderColor, this.requirementBorderSize = this.requirementBorderSize || "1", this.requirementTextColor = this.requirementTextColor || this.primaryTextColor, this.relationColor = this.relationColor || this.lineColor, this.relationLabelBackground = this.relationLabelBackground || this.edgeLabelBackground, this.relationLabelColor = this.relationLabelColor || this.actorTextColor, this.git0 = W(this.pie1, 25) || this.primaryColor, this.git1 = this.pie2 || this.secondaryColor, this.git2 = this.pie3 || this.tertiaryColor, this.git3 = this.pie4 || b(this.primaryColor, { h: -30 }), this.git4 = this.pie5 || b(this.primaryColor, { h: -60 }), this.git5 = this.pie6 || b(this.primaryColor, { h: -90 }), this.git6 = this.pie7 || b(this.primaryColor, { h: 60 }), this.git7 = this.pie8 || b(this.primaryColor, { h: 120 }), this.gitInv0 = this.gitInv0 || E(this.git0), this.gitInv1 = this.gitInv1 || E(this.git1), this.gitInv2 = this.gitInv2 || E(this.git2), this.gitInv3 = this.gitInv3 || E(this.git3), this.gitInv4 = this.gitInv4 || E(this.git4), this.gitInv5 = this.gitInv5 || E(this.git5), this.gitInv6 = this.gitInv6 || E(this.git6), this.gitInv7 = this.gitInv7 || E(this.git7), this.branchLabelColor = this.branchLabelColor || this.labelTextColor, this.gitBranchLabel0 = this.branchLabelColor, this.gitBranchLabel1 = "white", this.gitBranchLabel2 = this.branchLabelColor, this.gitBranchLabel3 = "white", this.gitBranchLabel4 = this.branchLabelColor, this.gitBranchLabel5 = this.branchLabelColor, this.gitBranchLabel6 = this.branchLabelColor, this.gitBranchLabel7 = this.branchLabelColor, this.tagLabelColor = this.tagLabelColor || this.primaryTextColor, this.tagLabelBackground = this.tagLabelBackground || this.primaryColor, this.tagLabelBorder = this.tagBorder || this.primaryBorderColor, this.tagLabelFontSize = this.tagLabelFontSize || "10px", this.commitLabelColor = this.commitLabelColor || this.secondaryTextColor, this.commitLabelBackground = this.commitLabelBackground || this.secondaryColor, this.commitLabelFontSize = this.commitLabelFontSize || "10px", this.emUiFill = this.emUiFill || "white", this.emUiStroke = this.emUiStroke || "#dbdada", this.emProcessorFill = this.emProcessorFill || "#edb3f6", this.emProcessorStroke = this.emProcessorStroke || "#b88cbf", this.emReadModelFill = this.emReadModelFill || "#d3f1a2", this.emReadModelStroke = this.emReadModelStroke || "#a3b732", this.emCommandFill = this.emCommandFill || "#bcd6fe", this.emCommandStroke = this.emCommandStroke || "#679ac3", this.emEventFill = this.emEventFill || "#ffb778", this.emEventStroke = this.emEventStroke || "#c19a0f", this.emSwimlaneBackgroundOdd = this.emSwimlaneBackgroundOdd || "rgb(250,250,250)", this.emSwimlaneBackgroundStroke = this.emSwimlaneBackgroundStroke || "rgb(240,240,240)", this.emArrowhead = this.emArrowhead || this.lineColor, this.emRelationStroke = this.emRelationStroke || this.lineColor, this.attributeBackgroundColorOdd = this.attributeBackgroundColorOdd || lr, this.attributeBackgroundColorEven = this.attributeBackgroundColorEven || hr;
  }
  calculate(e) {
    if (typeof e != "object") {
      this.updateColors();
      return;
    }
    const t = Object.keys(e);
    t.forEach((r) => {
      this[r] = e[r];
    }), this.updateColors(), t.forEach((r) => {
      this[r] = e[r];
    });
  }
}, oC = /* @__PURE__ */ p((e) => {
  const t = new sC();
  return t.calculate(e), t;
}, "getThemeVariables"), aC = class {
  static {
    p(this, "Theme");
  }
  constructor() {
    this.background = "#ffffff", this.primaryColor = "#cccccc", this.mainBkg = "#ffffff", this.noteBkgColor = "#fff5ad", this.noteTextColor = "#333", this.THEME_COLOR_LIMIT = 12, this.radius = 3, this.strokeWidth = 2, this.primaryBorderColor = vt(this.primaryColor, this.darkMode), this.fontFamily = "arial, sans-serif", this.fontSize = "14px", this.nodeBorder = "#000000", this.stateBorder = "#000000", this.useGradient = !0, this.gradientStart = "#0042eb", this.gradientStop = "#eb0042", this.dropShadow = "drop-shadow( 0px 1px 2px rgba(0, 0, 0, 0.25));", this.tertiaryColor = "#ffffff", this.archEdgeColor = "calculated", this.archEdgeArrowColor = "calculated", this.archEdgeWidth = "3", this.archGroupBorderColor = this.primaryBorderColor, this.archGroupBorderWidth = "2px", this.noteFontWeight = "normal", this.fontWeight = "normal";
  }
  updateColors() {
    this.primaryTextColor = this.primaryTextColor || (this.darkMode ? "#eee" : "#333"), this.secondaryColor = this.secondaryColor || b(this.primaryColor, { h: -120 }), this.tertiaryColor = this.tertiaryColor || b(this.primaryColor, { h: 180, l: 5 }), this.primaryBorderColor = this.primaryBorderColor || vt(this.primaryColor, this.darkMode), this.secondaryBorderColor = this.secondaryBorderColor || vt(this.secondaryColor, this.darkMode), this.tertiaryBorderColor = this.tertiaryBorderColor || vt(this.tertiaryColor, this.darkMode), this.noteBorderColor = this.noteBorderColor || vt(this.noteBkgColor, this.darkMode), this.noteBkgColor = this.noteBkgColor || "#fff5ad", this.noteTextColor = this.noteTextColor || "#333", this.secondaryTextColor = this.secondaryTextColor || E(this.secondaryColor), this.tertiaryTextColor = this.tertiaryTextColor || E(this.tertiaryColor), this.lineColor = this.lineColor || E(this.background), this.arrowheadColor = this.arrowheadColor || E(this.background), this.textColor = this.textColor || this.primaryTextColor, this.border2 = this.border2 || this.tertiaryBorderColor, this.nodeBkg = this.nodeBkg || this.primaryColor, this.mainBkg = this.mainBkg || this.primaryColor, this.nodeBorder = this.nodeBorder || this.primaryBorderColor, this.clusterBkg = this.clusterBkg || this.tertiaryColor, this.clusterBorder = this.clusterBorder || this.tertiaryBorderColor, this.defaultLinkColor = this.defaultLinkColor || this.lineColor, this.titleColor = this.titleColor || this.tertiaryTextColor, this.edgeLabelBackground = this.edgeLabelBackground || (this.darkMode ? W(this.secondaryColor, 30) : this.secondaryColor), this.nodeTextColor = this.nodeTextColor || this.primaryTextColor, this.actorBorder = this.actorBorder || this.primaryBorderColor, this.actorBkg = this.actorBkg || this.mainBkg, this.actorTextColor = this.actorTextColor || this.primaryTextColor, this.actorLineColor = this.actorLineColor || this.actorBorder, this.labelBoxBkgColor = this.labelBoxBkgColor || this.actorBkg, this.signalColor = this.signalColor || this.textColor, this.signalTextColor = this.signalTextColor || this.textColor, this.labelBoxBorderColor = this.labelBoxBorderColor || this.actorBorder, this.labelTextColor = this.labelTextColor || this.actorTextColor, this.loopTextColor = this.loopTextColor || this.actorTextColor, this.activationBorderColor = this.activationBorderColor || W(this.secondaryColor, 10), this.activationBkgColor = this.activationBkgColor || this.secondaryColor, this.sequenceNumberColor = this.sequenceNumberColor || E(this.lineColor), this.rectBkgColor = this.rectBkgColor || this.tertiaryColor;
    const e = "#ECECFE", t = "#E9E9F1", r = b(e, { h: 180, l: 5 });
    if (this.sectionBkgColor = this.sectionBkgColor || r, this.altSectionBkgColor = this.altSectionBkgColor || "white", this.sectionBkgColor = this.sectionBkgColor || t, this.sectionBkgColor2 = this.sectionBkgColor2 || e, this.excludeBkgColor = this.excludeBkgColor || "#eeeeee", this.taskBorderColor = this.taskBorderColor || this.primaryBorderColor, this.taskBkgColor = this.taskBkgColor || e, this.activeTaskBorderColor = this.activeTaskBorderColor || e, this.activeTaskBkgColor = this.activeTaskBkgColor || z(e, 23), this.gridColor = this.gridColor || "lightgrey", this.doneTaskBkgColor = this.doneTaskBkgColor || "lightgrey", this.doneTaskBorderColor = this.doneTaskBorderColor || "grey", this.critBorderColor = this.critBorderColor || "#ff8888", this.critBkgColor = this.critBkgColor || "red", this.todayLineColor = this.todayLineColor || "red", this.taskTextColor = this.taskTextColor || this.textColor, this.taskTextOutsideColor = this.taskTextOutsideColor || this.textColor, this.vertLineColor = this.vertLineColor || this.primaryBorderColor, this.taskTextLightColor = this.taskTextLightColor || this.textColor, this.taskTextColor = this.taskTextColor || this.primaryTextColor, this.taskTextDarkColor = this.taskTextDarkColor || this.textColor, this.taskTextClickableColor = this.taskTextClickableColor || "#003163", this.archEdgeColor = this.lineColor, this.archEdgeArrowColor = this.lineColor, this.personBorder = this.personBorder || this.primaryBorderColor, this.personBkg = this.personBkg || this.mainBkg, this.transitionColor = this.transitionColor || this.lineColor, this.transitionLabelColor = this.transitionLabelColor || this.textColor, this.stateLabelColor = this.stateLabelColor || this.stateBkg || this.primaryTextColor, this.stateBkg = this.stateBkg || this.mainBkg, this.labelBackgroundColor = this.labelBackgroundColor || this.stateBkg, this.compositeBackground = this.compositeBackground || this.background || this.tertiaryColor, this.altBackground = this.altBackground || "#f0f0f0", this.compositeTitleBackground = this.compositeTitleBackground || this.mainBkg, this.compositeBorder = this.compositeBorder || this.nodeBorder, this.innerEndBackground = this.nodeBorder, this.errorBkgColor = this.errorBkgColor || this.tertiaryColor, this.errorTextColor = this.errorTextColor || this.tertiaryTextColor, this.transitionColor = this.transitionColor || this.lineColor, this.specialStateColor = this.lineColor, this.cScale0 = this.cScale0 || e, this.cScale1 = this.cScale1 || t, this.cScale2 = this.cScale2 || r, this.cScale3 = this.cScale3 || b(e, { h: 30 }), this.cScale4 = this.cScale4 || b(e, { h: 60 }), this.cScale5 = this.cScale5 || b(e, { h: 90 }), this.cScale6 = this.cScale6 || b(e, { h: 120 }), this.cScale7 = this.cScale7 || b(e, { h: 150 }), this.cScale8 = this.cScale8 || b(e, { h: 210, l: 150 }), this.cScale9 = this.cScale9 || b(e, { h: 270 }), this.cScale10 = this.cScale10 || b(e, { h: 300 }), this.cScale11 = this.cScale11 || b(e, { h: 330 }), this.darkMode)
      for (let s = 0; s < this.THEME_COLOR_LIMIT; s++)
        this["cScale" + s] = W(this["cScale" + s], 75);
    else
      for (let s = 0; s < this.THEME_COLOR_LIMIT; s++)
        this["cScale" + s] = W(this["cScale" + s], 25);
    for (let s = 0; s < this.THEME_COLOR_LIMIT; s++)
      this["cScaleInv" + s] = this["cScaleInv" + s] || E(this["cScale" + s]);
    for (let s = 0; s < this.THEME_COLOR_LIMIT; s++)
      this.darkMode ? this["cScalePeer" + s] = this["cScalePeer" + s] || z(this["cScale" + s], 10) : this["cScalePeer" + s] = this["cScalePeer" + s] || W(this["cScale" + s], 10);
    this.scaleLabelColor = this.scaleLabelColor || this.labelTextColor;
    for (let s = 0; s < this.THEME_COLOR_LIMIT; s++)
      this["cScaleLabel" + s] = this["cScaleLabel" + s] || this.scaleLabelColor;
    const i = this.darkMode ? -4 : -1;
    for (let s = 0; s < 5; s++)
      this["surface" + s] = this["surface" + s] || b(this.mainBkg, { h: 180, s: -15, l: i * (5 + s * 3) }), this["surfacePeer" + s] = this["surfacePeer" + s] || b(this.mainBkg, { h: 180, s: -15, l: i * (8 + s * 3) });
    this.classText = this.classText || this.textColor, this.fillType0 = this.fillType0 || e, this.fillType1 = this.fillType1 || t, this.fillType2 = this.fillType2 || b(e, { h: 64 }), this.fillType3 = this.fillType3 || b(t, { h: 64 }), this.fillType4 = this.fillType4 || b(e, { h: -64 }), this.fillType5 = this.fillType5 || b(t, { h: -64 }), this.fillType6 = this.fillType6 || b(e, { h: 128 }), this.fillType7 = this.fillType7 || b(t, { h: 128 }), this.pie1 = this.pie1 || e, this.pie2 = this.pie2 || t, this.pie3 = this.pie3 || r, this.pie4 = this.pie4 || b(e, { l: -10 }), this.pie5 = this.pie5 || b(t, { l: -10 }), this.pie6 = this.pie6 || b(r, { l: -10 }), this.pie7 = this.pie7 || b(e, { h: 60, l: -10 }), this.pie8 = this.pie8 || b(e, { h: -60, l: -10 }), this.pie9 = this.pie9 || b(e, { h: 120, l: 0 }), this.pie10 = this.pie10 || b(e, { h: 60, l: -20 }), this.pie11 = this.pie11 || b(e, { h: -60, l: -20 }), this.pie12 = this.pie12 || b(e, { h: 120, l: -10 }), this.pieTitleTextSize = this.pieTitleTextSize || "25px", this.pieTitleTextColor = this.pieTitleTextColor || this.taskTextDarkColor, this.pieSectionTextSize = this.pieSectionTextSize || "17px", this.pieSectionTextColor = this.pieSectionTextColor || this.textColor, this.pieLegendTextSize = this.pieLegendTextSize || "17px", this.pieLegendTextColor = this.pieLegendTextColor || this.taskTextDarkColor, this.pieStrokeColor = this.pieStrokeColor || "black", this.pieStrokeWidth = this.pieStrokeWidth || "2px", this.pieOuterStrokeWidth = this.pieOuterStrokeWidth || "2px", this.pieOuterStrokeColor = this.pieOuterStrokeColor || "black", this.pieOpacity = this.pieOpacity || "0.7", this.vennTitleTextColor = this.vennTitleTextColor ?? this.titleColor, this.vennSetTextColor = this.vennSetTextColor ?? this.textColor, this.quadrant1Fill = this.quadrant1Fill || e, this.quadrant2Fill = this.quadrant2Fill || b(e, { r: 5, g: 5, b: 5 }), this.quadrant3Fill = this.quadrant3Fill || b(e, { r: 10, g: 10, b: 10 }), this.quadrant4Fill = this.quadrant4Fill || b(e, { r: 15, g: 15, b: 15 }), this.quadrant1TextFill = this.quadrant1TextFill || this.primaryTextColor, this.quadrant2TextFill = this.quadrant2TextFill || b(this.primaryTextColor, { r: -5, g: -5, b: -5 }), this.quadrant3TextFill = this.quadrant3TextFill || b(this.primaryTextColor, { r: -10, g: -10, b: -10 }), this.quadrant4TextFill = this.quadrant4TextFill || b(this.primaryTextColor, { r: -15, g: -15, b: -15 }), this.quadrantPointFill = this.quadrantPointFill || Ge(this.quadrant1Fill) ? z(this.quadrant1Fill) : W(this.quadrant1Fill), this.quadrantPointTextFill = this.quadrantPointTextFill || this.primaryTextColor, this.quadrantXAxisTextFill = this.quadrantXAxisTextFill || this.primaryTextColor, this.quadrantYAxisTextFill = this.quadrantYAxisTextFill || this.primaryTextColor, this.quadrantInternalBorderStrokeFill = this.quadrantInternalBorderStrokeFill || this.primaryBorderColor, this.quadrantExternalBorderStrokeFill = this.quadrantExternalBorderStrokeFill || this.primaryBorderColor, this.quadrantTitleFill = this.quadrantTitleFill || this.primaryTextColor, this.xyChart = {
      backgroundColor: this.xyChart?.backgroundColor || this.background,
      titleColor: this.xyChart?.titleColor || this.primaryTextColor,
      legendTextColor: this.xyChart?.legendTextColor || this.primaryTextColor,
      xAxisTitleColor: this.xyChart?.xAxisTitleColor || this.primaryTextColor,
      xAxisLabelColor: this.xyChart?.xAxisLabelColor || this.primaryTextColor,
      xAxisTickColor: this.xyChart?.xAxisTickColor || this.primaryTextColor,
      xAxisLineColor: this.xyChart?.xAxisLineColor || this.primaryTextColor,
      yAxisTitleColor: this.xyChart?.yAxisTitleColor || this.primaryTextColor,
      yAxisLabelColor: this.xyChart?.yAxisLabelColor || this.primaryTextColor,
      yAxisTickColor: this.xyChart?.yAxisTickColor || this.primaryTextColor,
      yAxisLineColor: this.xyChart?.yAxisLineColor || this.primaryTextColor,
      plotColorPalette: this.xyChart?.plotColorPalette || "#FFF4DD,#FFD8B1,#FFA07A,#ECEFF1,#D6DBDF,#C3E0A8,#FFB6A4,#FFD74D,#738FA7,#FFFFF0"
    }, this.requirementBackground = this.requirementBackground || e, this.requirementBorderColor = this.requirementBorderColor || this.primaryBorderColor, this.requirementBorderSize = this.requirementBorderSize || "1", this.requirementTextColor = this.requirementTextColor || this.primaryTextColor, this.relationColor = this.relationColor || this.lineColor, this.relationLabelBackground = this.relationLabelBackground || (this.darkMode ? W(this.secondaryColor, 30) : this.secondaryColor), this.relationLabelColor = this.relationLabelColor || this.actorTextColor, this.git0 = this.git0 || e, this.git1 = this.git1 || t, this.git2 = this.git2 || r, this.git3 = this.git3 || b(e, { h: -30 }), this.git4 = this.git4 || b(e, { h: -60 }), this.git5 = this.git5 || b(e, { h: -90 }), this.git6 = this.git6 || b(e, { h: 60 }), this.git7 = this.git7 || b(e, { h: 120 }), this.darkMode ? (this.git0 = z(this.git0, 25), this.git1 = z(this.git1, 25), this.git2 = z(this.git2, 25), this.git3 = z(this.git3, 25), this.git4 = z(this.git4, 25), this.git5 = z(this.git5, 25), this.git6 = z(this.git6, 25), this.git7 = z(this.git7, 25)) : (this.git0 = W(this.git0, 25), this.git1 = W(this.git1, 25), this.git2 = W(this.git2, 25), this.git3 = W(this.git3, 25), this.git4 = W(this.git4, 25), this.git5 = W(this.git5, 25), this.git6 = W(this.git6, 25), this.git7 = W(this.git7, 25)), this.gitInv0 = this.gitInv0 || E(this.git0), this.gitInv1 = this.gitInv1 || E(this.git1), this.gitInv2 = this.gitInv2 || E(this.git2), this.gitInv3 = this.gitInv3 || E(this.git3), this.gitInv4 = this.gitInv4 || E(this.git4), this.gitInv5 = this.gitInv5 || E(this.git5), this.gitInv6 = this.gitInv6 || E(this.git6), this.gitInv7 = this.gitInv7 || E(this.git7), this.branchLabelColor = this.branchLabelColor || (this.darkMode ? "black" : this.labelTextColor), this.gitBranchLabel0 = this.gitBranchLabel0 || this.branchLabelColor, this.gitBranchLabel1 = this.gitBranchLabel1 || this.branchLabelColor, this.gitBranchLabel2 = this.gitBranchLabel2 || this.branchLabelColor, this.gitBranchLabel3 = this.gitBranchLabel3 || this.branchLabelColor, this.gitBranchLabel4 = this.gitBranchLabel4 || this.branchLabelColor, this.gitBranchLabel5 = this.gitBranchLabel5 || this.branchLabelColor, this.gitBranchLabel6 = this.gitBranchLabel6 || this.branchLabelColor, this.gitBranchLabel7 = this.gitBranchLabel7 || this.branchLabelColor, this.tagLabelColor = this.tagLabelColor || this.primaryTextColor, this.tagLabelBackground = this.tagLabelBackground || this.primaryColor, this.tagLabelBorder = this.tagBorder || this.primaryBorderColor, this.tagLabelFontSize = this.tagLabelFontSize || "10px", this.commitLabelColor = this.commitLabelColor || this.secondaryTextColor, this.commitLabelBackground = this.commitLabelBackground || this.secondaryColor, this.commitLabelFontSize = this.commitLabelFontSize || "10px", this.attributeBackgroundColorOdd = this.attributeBackgroundColorOdd || lr, this.attributeBackgroundColorEven = this.attributeBackgroundColorEven || hr;
  }
  calculate(e) {
    if (typeof e != "object") {
      this.updateColors();
      return;
    }
    const t = Object.keys(e);
    t.forEach((r) => {
      this[r] = e[r];
    }), this.updateColors(), t.forEach((r) => {
      this[r] = e[r];
    });
  }
}, nC = /* @__PURE__ */ p((e) => {
  const t = new aC();
  return t.calculate(e), t;
}, "getThemeVariables"), lC = class {
  static {
    p(this, "Theme");
  }
  constructor() {
    this.background = "#333", this.primaryColor = "#1f2020", this.secondaryColor = z(this.primaryColor, 16), this.tertiaryColor = b(this.primaryColor, { h: -160 }), this.primaryBorderColor = E(this.background), this.secondaryBorderColor = vt(this.secondaryColor, this.darkMode), this.tertiaryBorderColor = vt(this.tertiaryColor, this.darkMode), this.primaryTextColor = E(this.primaryColor), this.secondaryTextColor = E(this.secondaryColor), this.tertiaryTextColor = E(this.tertiaryColor), this.mainBkg = "#2a2020", this.secondBkg = "calculated", this.mainContrastColor = "lightgrey", this.darkTextColor = z(E("#323D47"), 10), this.border1 = "#ccc", this.border2 = Nr(255, 255, 255, 0.25), this.arrowheadColor = E(this.background), this.fontFamily = "arial, sans-serif", this.fontSize = "14px", this.labelBackground = "#181818", this.textColor = "#ccc", this.THEME_COLOR_LIMIT = 12, this.radius = 3, this.strokeWidth = 1, this.noteBkgColor = "#fff5ad", this.noteTextColor = "#333", this.THEME_COLOR_LIMIT = 12, this.fontFamily = "arial, sans-serif", this.fontSize = "14px", this.useGradient = !0, this.gradientStart = "#0042eb", this.gradientStop = "#eb0042", this.dropShadow = "drop-shadow( 1px 2px 2px rgba(185,185,185,0.2))", this.archEdgeColor = "calculated", this.archEdgeArrowColor = "calculated", this.archEdgeWidth = "3", this.archGroupBorderColor = this.primaryBorderColor, this.archGroupBorderWidth = "2px", this.noteFontWeight = "normal", this.fontWeight = "normal";
  }
  updateColors() {
    if (this.primaryTextColor = this.primaryTextColor || (this.darkMode ? "#eee" : "#333"), this.secondaryColor = this.secondaryColor || b(this.primaryColor, { h: -120 }), this.tertiaryColor = this.tertiaryColor || b(this.primaryColor, { h: 180, l: 5 }), this.primaryBorderColor = this.primaryBorderColor || vt(this.primaryColor, this.darkMode), this.secondaryBorderColor = this.secondaryBorderColor || vt(this.secondaryColor, this.darkMode), this.tertiaryBorderColor = this.tertiaryBorderColor || vt(this.tertiaryColor, this.darkMode), this.noteBorderColor = this.noteBorderColor || vt(this.noteBkgColor, this.darkMode), this.noteBkgColor = this.noteBkgColor || "#fff5ad", this.noteTextColor = this.noteTextColor || "#333", this.secondaryTextColor = this.secondaryTextColor || E(this.secondaryColor), this.tertiaryTextColor = this.tertiaryTextColor || E(this.tertiaryColor), this.lineColor = this.lineColor || E(this.background), this.arrowheadColor = this.arrowheadColor || E(this.background), this.textColor = this.textColor || this.primaryTextColor, this.border2 = this.border2 || this.tertiaryBorderColor, this.nodeBkg = this.nodeBkg || this.primaryColor, this.mainBkg = this.mainBkg || this.primaryColor, this.nodeBorder = this.nodeBorder || this.border1, this.clusterBkg = this.clusterBkg || this.tertiaryColor, this.clusterBorder = this.clusterBorder || this.tertiaryBorderColor, this.defaultLinkColor = this.defaultLinkColor || this.lineColor, this.titleColor = this.titleColor || this.tertiaryTextColor, this.edgeLabelBackground = this.edgeLabelBackground || (this.darkMode ? W(this.secondaryColor, 30) : this.secondaryColor), this.nodeTextColor = this.nodeTextColor || this.primaryTextColor, this.actorBorder = this.actorBorder || this.primaryBorderColor, this.actorBkg = this.actorBkg || this.mainBkg, this.actorTextColor = this.actorTextColor || this.primaryTextColor, this.actorLineColor = this.actorLineColor || this.actorBorder, this.labelBoxBkgColor = this.labelBoxBkgColor || this.actorBkg, this.signalColor = this.signalColor || this.textColor, this.signalTextColor = this.signalTextColor || this.textColor, this.labelBoxBorderColor = this.labelBoxBorderColor || this.actorBorder, this.labelTextColor = this.labelTextColor || this.actorTextColor, this.loopTextColor = this.loopTextColor || this.actorTextColor, this.activationBorderColor = this.activationBorderColor || W(this.secondaryColor, 10), this.activationBkgColor = this.activationBkgColor || this.secondaryColor, this.sequenceNumberColor = this.sequenceNumberColor || E(this.lineColor), this.rectBkgColor = this.rectBkgColor || this.tertiaryColor, this.sectionBkgColor = this.sectionBkgColor || this.tertiaryColor, this.altSectionBkgColor = this.altSectionBkgColor || "white", this.sectionBkgColor = this.sectionBkgColor || this.secondaryColor, this.sectionBkgColor2 = this.sectionBkgColor2 || this.primaryColor, this.excludeBkgColor = this.excludeBkgColor || "#eeeeee", this.taskBorderColor = this.taskBorderColor || this.primaryBorderColor, this.taskBkgColor = this.taskBkgColor || this.primaryColor, this.activeTaskBorderColor = this.activeTaskBorderColor || this.primaryColor, this.activeTaskBkgColor = this.activeTaskBkgColor || z(this.primaryColor, 23), this.gridColor = this.gridColor || "lightgrey", this.doneTaskBkgColor = this.doneTaskBkgColor || "lightgrey", this.doneTaskBorderColor = this.doneTaskBorderColor || "grey", this.critBorderColor = this.critBorderColor || "#ff8888", this.critBkgColor = this.critBkgColor || "red", this.todayLineColor = this.todayLineColor || "red", this.vertLineColor = this.vertLineColor || this.primaryBorderColor, this.taskTextColor = this.taskTextColor || this.textColor, this.taskTextOutsideColor = this.taskTextOutsideColor || this.textColor, this.taskTextLightColor = this.taskTextLightColor || this.textColor, this.taskTextColor = this.taskTextColor || this.primaryTextColor, this.taskTextDarkColor = this.taskTextDarkColor || this.textColor, this.taskTextClickableColor = this.taskTextClickableColor || "#003163", this.archEdgeColor = this.lineColor, this.archEdgeArrowColor = this.lineColor, this.personBorder = this.personBorder || this.primaryBorderColor, this.personBkg = this.personBkg || this.mainBkg, this.transitionColor = this.transitionColor || this.lineColor, this.transitionLabelColor = this.transitionLabelColor || this.textColor, this.stateLabelColor = this.stateLabelColor || this.stateBkg || this.primaryTextColor, this.stateBkg = this.stateBkg || this.mainBkg, this.labelBackgroundColor = this.labelBackgroundColor || this.stateBkg, this.compositeBackground = this.compositeBackground || this.background || this.tertiaryColor, this.altBackground = this.altBackground || "#f0f0f0", this.compositeTitleBackground = this.compositeTitleBackground || this.mainBkg, this.compositeBorder = this.compositeBorder || this.nodeBorder, this.innerEndBackground = this.nodeBorder, this.errorBkgColor = this.errorBkgColor || this.tertiaryColor, this.errorTextColor = this.errorTextColor || this.tertiaryTextColor, this.transitionColor = this.transitionColor || this.lineColor, this.specialStateColor = this.lineColor, this.cScale0 = this.cScale0 || this.primaryColor, this.cScale1 = this.cScale1 || this.secondaryColor, this.cScale2 = this.cScale2 || this.tertiaryColor, this.cScale3 = this.cScale3 || b(this.primaryColor, { h: 30 }), this.cScale4 = this.cScale4 || b(this.primaryColor, { h: 60 }), this.cScale5 = this.cScale5 || b(this.primaryColor, { h: 90 }), this.cScale6 = this.cScale6 || b(this.primaryColor, { h: 120 }), this.cScale7 = this.cScale7 || b(this.primaryColor, { h: 150 }), this.cScale8 = this.cScale8 || b(this.primaryColor, { h: 210, l: 150 }), this.cScale9 = this.cScale9 || b(this.primaryColor, { h: 270 }), this.cScale10 = this.cScale10 || b(this.primaryColor, { h: 300 }), this.cScale11 = this.cScale11 || b(this.primaryColor, { h: 330 }), this.darkMode)
      for (let t = 0; t < this.THEME_COLOR_LIMIT; t++)
        this["cScale" + t] = W(this["cScale" + t], 75);
    else
      for (let t = 0; t < this.THEME_COLOR_LIMIT; t++)
        this["cScale" + t] = W(this["cScale" + t], 25);
    for (let t = 0; t < this.THEME_COLOR_LIMIT; t++)
      this["cScaleInv" + t] = this["cScaleInv" + t] || E(this["cScale" + t]);
    for (let t = 0; t < this.THEME_COLOR_LIMIT; t++)
      this.darkMode ? this["cScalePeer" + t] = this["cScalePeer" + t] || z(this["cScale" + t], 10) : this["cScalePeer" + t] = this["cScalePeer" + t] || W(this["cScale" + t], 10);
    this.scaleLabelColor = this.scaleLabelColor || this.labelTextColor;
    for (let t = 0; t < this.THEME_COLOR_LIMIT; t++)
      this["cScaleLabel" + t] = this["cScaleLabel" + t] || this.scaleLabelColor;
    const e = this.darkMode ? -4 : -1;
    for (let t = 0; t < 5; t++)
      this["surface" + t] = this["surface" + t] || b(this.mainBkg, { h: 180, s: -15, l: e * (5 + t * 3) }), this["surfacePeer" + t] = this["surfacePeer" + t] || b(this.mainBkg, { h: 180, s: -15, l: e * (8 + t * 3) });
    this.classText = this.classText || this.textColor, this.fillType0 = this.fillType0 || this.primaryColor, this.fillType1 = this.fillType1 || this.secondaryColor, this.fillType2 = this.fillType2 || b(this.primaryColor, { h: 64 }), this.fillType3 = this.fillType3 || b(this.secondaryColor, { h: 64 }), this.fillType4 = this.fillType4 || b(this.primaryColor, { h: -64 }), this.fillType5 = this.fillType5 || b(this.secondaryColor, { h: -64 }), this.fillType6 = this.fillType6 || b(this.primaryColor, { h: 128 }), this.fillType7 = this.fillType7 || b(this.secondaryColor, { h: 128 }), this.pie1 = this.pie1 || this.primaryColor, this.pie2 = this.pie2 || this.secondaryColor, this.pie3 = this.pie3 || this.tertiaryColor, this.pie4 = this.pie4 || b(this.primaryColor, { l: -10 }), this.pie5 = this.pie5 || b(this.secondaryColor, { l: -10 }), this.pie6 = this.pie6 || b(this.tertiaryColor, { l: -10 }), this.pie7 = this.pie7 || b(this.primaryColor, { h: 60, l: -10 }), this.pie8 = this.pie8 || b(this.primaryColor, { h: -60, l: -10 }), this.pie9 = this.pie9 || b(this.primaryColor, { h: 120, l: 0 }), this.pie10 = this.pie10 || b(this.primaryColor, { h: 60, l: -20 }), this.pie11 = this.pie11 || b(this.primaryColor, { h: -60, l: -20 }), this.pie12 = this.pie12 || b(this.primaryColor, { h: 120, l: -10 }), this.pieTitleTextSize = this.pieTitleTextSize || "25px", this.pieTitleTextColor = this.pieTitleTextColor || this.taskTextDarkColor, this.pieSectionTextSize = this.pieSectionTextSize || "17px", this.pieSectionTextColor = this.pieSectionTextColor || this.textColor, this.pieLegendTextSize = this.pieLegendTextSize || "17px", this.pieLegendTextColor = this.pieLegendTextColor || this.taskTextDarkColor, this.pieStrokeColor = this.pieStrokeColor || "black", this.pieStrokeWidth = this.pieStrokeWidth || "2px", this.pieOuterStrokeWidth = this.pieOuterStrokeWidth || "2px", this.pieOuterStrokeColor = this.pieOuterStrokeColor || "black", this.pieOpacity = this.pieOpacity || "0.7", this.vennTitleTextColor = this.vennTitleTextColor ?? this.titleColor, this.vennSetTextColor = this.vennSetTextColor ?? this.textColor, this.quadrant1Fill = this.quadrant1Fill || this.primaryColor, this.quadrant2Fill = this.quadrant2Fill || b(this.primaryColor, { r: 5, g: 5, b: 5 }), this.quadrant3Fill = this.quadrant3Fill || b(this.primaryColor, { r: 10, g: 10, b: 10 }), this.quadrant4Fill = this.quadrant4Fill || b(this.primaryColor, { r: 15, g: 15, b: 15 }), this.quadrant1TextFill = this.quadrant1TextFill || this.primaryTextColor, this.quadrant2TextFill = this.quadrant2TextFill || b(this.primaryTextColor, { r: -5, g: -5, b: -5 }), this.quadrant3TextFill = this.quadrant3TextFill || b(this.primaryTextColor, { r: -10, g: -10, b: -10 }), this.quadrant4TextFill = this.quadrant4TextFill || b(this.primaryTextColor, { r: -15, g: -15, b: -15 }), this.quadrantPointFill = this.quadrantPointFill || Ge(this.quadrant1Fill) ? z(this.quadrant1Fill) : W(this.quadrant1Fill), this.quadrantPointTextFill = this.quadrantPointTextFill || this.primaryTextColor, this.quadrantXAxisTextFill = this.quadrantXAxisTextFill || this.primaryTextColor, this.quadrantYAxisTextFill = this.quadrantYAxisTextFill || this.primaryTextColor, this.quadrantInternalBorderStrokeFill = this.quadrantInternalBorderStrokeFill || this.primaryBorderColor, this.quadrantExternalBorderStrokeFill = this.quadrantExternalBorderStrokeFill || this.primaryBorderColor, this.quadrantTitleFill = this.quadrantTitleFill || this.primaryTextColor, this.xyChart = {
      backgroundColor: this.xyChart?.backgroundColor || this.background,
      titleColor: this.xyChart?.titleColor || this.primaryTextColor,
      legendTextColor: this.xyChart?.legendTextColor || this.primaryTextColor,
      xAxisTitleColor: this.xyChart?.xAxisTitleColor || this.primaryTextColor,
      xAxisLabelColor: this.xyChart?.xAxisLabelColor || this.primaryTextColor,
      xAxisTickColor: this.xyChart?.xAxisTickColor || this.primaryTextColor,
      xAxisLineColor: this.xyChart?.xAxisLineColor || this.primaryTextColor,
      yAxisTitleColor: this.xyChart?.yAxisTitleColor || this.primaryTextColor,
      yAxisLabelColor: this.xyChart?.yAxisLabelColor || this.primaryTextColor,
      yAxisTickColor: this.xyChart?.yAxisTickColor || this.primaryTextColor,
      yAxisLineColor: this.xyChart?.yAxisLineColor || this.primaryTextColor,
      plotColorPalette: this.xyChart?.plotColorPalette || "#FFF4DD,#FFD8B1,#FFA07A,#ECEFF1,#D6DBDF,#C3E0A8,#FFB6A4,#FFD74D,#738FA7,#FFFFF0"
    }, this.requirementBackground = this.requirementBackground || this.primaryColor, this.requirementBorderColor = this.requirementBorderColor || this.primaryBorderColor, this.requirementBorderSize = this.requirementBorderSize || "1", this.requirementTextColor = this.requirementTextColor || this.primaryTextColor, this.relationColor = this.relationColor || this.lineColor, this.relationLabelBackground = this.relationLabelBackground || (this.darkMode ? W(this.secondaryColor, 30) : this.secondaryColor), this.relationLabelColor = this.relationLabelColor || this.actorTextColor, this.git0 = this.git0 || "#0b0000", this.git1 = this.git1 || "#4d1037", this.git2 = this.git2 || "#3f5258", this.git3 = this.git3 || "#4f2f1b", this.git4 = this.git4 || "#6e0a0a", this.git5 = this.git5 || "#3b0048", this.git6 = this.git6 || "#995a01", this.git7 = this.git7 || "#154706", this.gitDarkMode = !0, this.gitDarkMode ? (this.git0 = z(this.git0, 25), this.git1 = z(this.git1, 25), this.git2 = z(this.git2, 25), this.git3 = z(this.git3, 25), this.git4 = z(this.git4, 25), this.git5 = z(this.git5, 25), this.git6 = z(this.git6, 25), this.git7 = z(this.git7, 25)) : (this.git0 = W(this.git0, 25), this.git1 = W(this.git1, 25), this.git2 = W(this.git2, 25), this.git3 = W(this.git3, 25), this.git4 = W(this.git4, 25), this.git5 = W(this.git5, 25), this.git6 = W(this.git6, 25), this.git7 = W(this.git7, 25)), this.gitInv0 = this.gitInv0 || E(this.git0), this.gitInv1 = this.gitInv1 || E(this.git1), this.gitInv2 = this.gitInv2 || E(this.git2), this.gitInv3 = this.gitInv3 || E(this.git3), this.gitInv4 = this.gitInv4 || E(this.git4), this.gitInv5 = this.gitInv5 || E(this.git5), this.gitInv6 = this.gitInv6 || E(this.git6), this.gitInv7 = this.gitInv7 || E(this.git7), this.branchLabelColor = this.branchLabelColor || (this.darkMode ? "black" : this.labelTextColor), this.gitBranchLabel0 = this.gitBranchLabel0 || this.branchLabelColor, this.gitBranchLabel1 = this.gitBranchLabel1 || this.branchLabelColor, this.gitBranchLabel2 = this.gitBranchLabel2 || this.branchLabelColor, this.gitBranchLabel3 = this.gitBranchLabel3 || this.branchLabelColor, this.gitBranchLabel4 = this.gitBranchLabel4 || this.branchLabelColor, this.gitBranchLabel5 = this.gitBranchLabel5 || this.branchLabelColor, this.gitBranchLabel6 = this.gitBranchLabel6 || this.branchLabelColor, this.gitBranchLabel7 = this.gitBranchLabel7 || this.branchLabelColor, this.tagLabelColor = this.tagLabelColor || this.primaryTextColor, this.tagLabelBackground = this.tagLabelBackground || this.primaryColor, this.tagLabelBorder = this.tagBorder || this.primaryBorderColor, this.tagLabelFontSize = this.tagLabelFontSize || "10px", this.commitLabelColor = this.commitLabelColor || this.secondaryTextColor, this.commitLabelBackground = this.commitLabelBackground || this.secondaryColor, this.commitLabelFontSize = this.commitLabelFontSize || "10px", this.attributeBackgroundColorOdd = this.attributeBackgroundColorOdd || lr, this.attributeBackgroundColorEven = this.attributeBackgroundColorEven || hr;
  }
  calculate(e) {
    if (typeof e != "object") {
      this.updateColors();
      return;
    }
    const t = Object.keys(e);
    t.forEach((r) => {
      this[r] = e[r];
    }), this.updateColors(), t.forEach((r) => {
      this[r] = e[r];
    });
  }
}, hC = /* @__PURE__ */ p((e) => {
  const t = new lC();
  return t.calculate(e), t;
}, "getThemeVariables"), cC = class {
  static {
    p(this, "Theme");
  }
  constructor() {
    this.background = "#ffffff", this.primaryColor = "#cccccc", this.mainBkg = "#ffffff", this.noteBkgColor = "#fff5ad", this.noteTextColor = "#28253D", this.THEME_COLOR_LIMIT = 12, this.radius = 12, this.strokeWidth = 2, this.primaryBorderColor = vt("#28253D", this.darkMode), this.fontFamily = '"Recursive Variable", arial, sans-serif', this.fontSize = "14px", this.nodeBorder = "#28253D", this.stateBorder = "#28253D", this.useGradient = !1, this.gradientStart = "#0042eb", this.gradientStop = "#eb0042", this.dropShadow = "url(#drop-shadow)", this.nodeShadow = !0, this.tertiaryColor = "#ffffff", this.clusterBkg = "#F9F9FB", this.clusterBorder = "#BDBCCC", this.noteBorderColor = "#FACC15", this.archEdgeColor = "calculated", this.archEdgeArrowColor = "calculated", this.archEdgeWidth = "3", this.archGroupBorderColor = this.primaryBorderColor, this.archGroupBorderWidth = "2px", this.actorBorder = "#28253D", this.filterColor = "#000000";
  }
  updateColors() {
    this.primaryTextColor = this.primaryTextColor || (this.darkMode ? "#eee" : "#28253D"), this.secondaryColor = this.secondaryColor || b(this.primaryColor, { h: -120 }), this.tertiaryColor = this.tertiaryColor || b(this.primaryColor, { h: 180, l: 5 }), this.primaryBorderColor = this.primaryBorderColor || vt(this.primaryColor, this.darkMode), this.secondaryBorderColor = this.secondaryBorderColor || vt(this.secondaryColor, this.darkMode), this.tertiaryBorderColor = this.tertiaryBorderColor || vt(this.tertiaryColor, this.darkMode), this.noteBorderColor = this.noteBorderColor || vt(this.noteBkgColor, this.darkMode), this.noteBkgColor = this.noteBkgColor || "#FEF9C3", this.noteTextColor = this.noteTextColor || "#28253D", this.secondaryTextColor = this.secondaryTextColor || E(this.secondaryColor), this.tertiaryTextColor = this.tertiaryTextColor || E(this.tertiaryColor), this.lineColor = this.lineColor || E(this.background), this.arrowheadColor = this.arrowheadColor || E(this.background), this.textColor = this.textColor || this.primaryTextColor, this.border2 = this.border2 || this.tertiaryBorderColor, this.nodeBkg = this.nodeBkg || this.primaryColor, this.mainBkg = this.mainBkg || this.primaryColor, this.nodeBorder = this.nodeBorder || this.primaryBorderColor, this.clusterBkg = this.clusterBkg || this.tertiaryColor, this.clusterBorder = this.clusterBorder || this.tertiaryBorderColor, this.defaultLinkColor = this.defaultLinkColor || this.lineColor, this.titleColor = this.titleColor || this.tertiaryTextColor, this.edgeLabelBackground = this.edgeLabelBackground || (this.darkMode ? W(this.secondaryColor, 30) : this.secondaryColor), this.nodeTextColor = this.nodeTextColor || this.primaryTextColor, this.noteFontWeight = 600, this.actorBorder = this.actorBorder || this.primaryBorderColor, this.actorBkg = this.actorBkg || this.mainBkg, this.actorTextColor = this.actorTextColor || this.primaryTextColor, this.actorLineColor = this.actorLineColor || this.actorBorder, this.labelBoxBkgColor = this.labelBoxBkgColor || this.actorBkg, this.signalColor = this.signalColor || this.textColor, this.signalTextColor = this.signalTextColor || this.textColor, this.labelBoxBorderColor = this.labelBoxBorderColor || this.actorBorder, this.labelTextColor = this.labelTextColor || this.actorTextColor, this.loopTextColor = this.loopTextColor || this.actorTextColor, this.activationBorderColor = this.activationBorderColor || W(this.secondaryColor, 10), this.activationBkgColor = this.activationBkgColor || this.secondaryColor, this.sequenceNumberColor = this.sequenceNumberColor || E(this.lineColor), this.rectBkgColor = this.rectBkgColor || this.tertiaryColor;
    const e = "#ECECFE", t = "#E9E9F1", r = b(e, { h: 180, l: 5 });
    this.sectionBkgColor = this.sectionBkgColor || r, this.altSectionBkgColor = this.altSectionBkgColor || "white", this.sectionBkgColor = this.sectionBkgColor || t, this.sectionBkgColor2 = this.sectionBkgColor2 || e, this.excludeBkgColor = this.excludeBkgColor || "#eeeeee", this.taskBorderColor = this.taskBorderColor || this.primaryBorderColor, this.taskBkgColor = this.taskBkgColor || e, this.activeTaskBorderColor = this.activeTaskBorderColor || e, this.activeTaskBkgColor = this.activeTaskBkgColor || z(e, 23), this.gridColor = this.gridColor || "lightgrey", this.doneTaskBkgColor = this.doneTaskBkgColor || "lightgrey", this.doneTaskBorderColor = this.doneTaskBorderColor || "grey", this.critBorderColor = this.critBorderColor || "#ff8888", this.critBkgColor = this.critBkgColor || "red", this.todayLineColor = this.todayLineColor || "red", this.taskTextColor = this.taskTextColor || this.textColor, this.vertLineColor = this.vertLineColor || this.primaryBorderColor, this.taskTextOutsideColor = this.taskTextOutsideColor || this.textColor, this.taskTextLightColor = this.taskTextLightColor || this.textColor, this.taskTextColor = this.taskTextColor || this.primaryTextColor, this.taskTextDarkColor = this.taskTextDarkColor || this.textColor, this.taskTextClickableColor = this.taskTextClickableColor || "#003163", this.archEdgeColor = this.lineColor, this.archEdgeArrowColor = this.lineColor, this.personBorder = this.personBorder || this.primaryBorderColor, this.personBkg = this.personBkg || this.mainBkg, this.transitionColor = this.transitionColor || this.lineColor, this.transitionLabelColor = this.transitionLabelColor || this.textColor, this.stateLabelColor = this.stateLabelColor || this.stateBkg || this.primaryTextColor, this.compositeTitleBackground = "#F9F9FB", this.altBackground = "#F9F9FB", this.stateEdgeLabelBackground = "#FFFFFF", this.fontWeight = 600, this.stateBkg = this.stateBkg || this.mainBkg, this.labelBackgroundColor = this.labelBackgroundColor || this.stateBkg, this.compositeBackground = this.compositeBackground || this.background || this.tertiaryColor, this.altBackground = this.altBackground || "#f0f0f0", this.compositeTitleBackground = this.compositeTitleBackground || this.mainBkg, this.compositeBorder = this.compositeBorder || this.nodeBorder, this.innerEndBackground = this.nodeBorder, this.errorBkgColor = this.errorBkgColor || this.tertiaryColor, this.errorTextColor = this.errorTextColor || this.tertiaryTextColor, this.transitionColor = this.transitionColor || this.lineColor, this.specialStateColor = this.lineColor;
    for (let s = 0; s < this.THEME_COLOR_LIMIT; s++)
      this["cScale" + s] = this.mainBkg;
    if (this.darkMode)
      for (let s = 0; s < this.THEME_COLOR_LIMIT; s++)
        this["cScale" + s] = W(this["cScale" + s], 75);
    else
      for (let s = 0; s < this.THEME_COLOR_LIMIT; s++)
        this["cScale" + s] = W(this["cScale" + s], 25);
    for (let s = 0; s < this.THEME_COLOR_LIMIT; s++)
      this["cScaleInv" + s] = this["cScaleInv" + s] || E(this["cScale" + s]);
    for (let s = 0; s < this.THEME_COLOR_LIMIT; s++)
      this.darkMode ? this["cScalePeer" + s] = this["cScalePeer" + s] || z(this["cScale" + s], 10) : this["cScalePeer" + s] = this["cScalePeer" + s] || W(this["cScale" + s], 10);
    this.scaleLabelColor = this.scaleLabelColor || this.labelTextColor;
    for (let s = 0; s < this.THEME_COLOR_LIMIT; s++)
      this["cScaleLabel" + s] = this["cScaleLabel" + s] || this.scaleLabelColor;
    const i = this.darkMode ? -4 : -1;
    for (let s = 0; s < 5; s++)
      this["surface" + s] = this["surface" + s] || b(this.mainBkg, { h: 180, s: -15, l: i * (5 + s * 3) }), this["surfacePeer" + s] = this["surfacePeer" + s] || b(this.mainBkg, { h: 180, s: -15, l: i * (8 + s * 3) });
    this.classText = this.classText || this.textColor, this.fillType0 = this.fillType0 || e, this.fillType1 = this.fillType1 || t, this.fillType2 = this.fillType2 || b(e, { h: 64 }), this.fillType3 = this.fillType3 || b(t, { h: 64 }), this.fillType4 = this.fillType4 || b(e, { h: -64 }), this.fillType5 = this.fillType5 || b(t, { h: -64 }), this.fillType6 = this.fillType6 || b(e, { h: 128 }), this.fillType7 = this.fillType7 || b(t, { h: 128 }), this.pie1 = this.pie1 || e, this.pie2 = this.pie2 || t, this.pie3 = this.pie3 || r, this.pie4 = this.pie4 || b(e, { l: -10 }), this.pie5 = this.pie5 || b(t, { l: -10 }), this.pie6 = this.pie6 || b(r, { l: -10 }), this.pie7 = this.pie7 || b(e, { h: 60, l: -10 }), this.pie8 = this.pie8 || b(e, { h: -60, l: -10 }), this.pie9 = this.pie9 || b(e, { h: 120, l: 0 }), this.pie10 = this.pie10 || b(e, { h: 60, l: -20 }), this.pie11 = this.pie11 || b(e, { h: -60, l: -20 }), this.pie12 = this.pie12 || b(e, { h: 120, l: -10 }), this.pieTitleTextSize = this.pieTitleTextSize || "25px", this.pieTitleTextColor = this.pieTitleTextColor || this.taskTextDarkColor, this.pieSectionTextSize = this.pieSectionTextSize || "17px", this.pieSectionTextColor = this.pieSectionTextColor || this.textColor, this.pieLegendTextSize = this.pieLegendTextSize || "17px", this.pieLegendTextColor = this.pieLegendTextColor || this.taskTextDarkColor, this.pieStrokeColor = this.pieStrokeColor || "black", this.pieStrokeWidth = this.pieStrokeWidth || "2px", this.pieOuterStrokeWidth = this.pieOuterStrokeWidth || "2px", this.pieOuterStrokeColor = this.pieOuterStrokeColor || "black", this.pieOpacity = this.pieOpacity || "0.7", this.vennTitleTextColor = this.vennTitleTextColor ?? this.titleColor, this.vennSetTextColor = this.vennSetTextColor ?? this.textColor, this.quadrant1Fill = this.quadrant1Fill || e, this.quadrant2Fill = this.quadrant2Fill || b(e, { r: 5, g: 5, b: 5 }), this.quadrant3Fill = this.quadrant3Fill || b(e, { r: 10, g: 10, b: 10 }), this.quadrant4Fill = this.quadrant4Fill || b(e, { r: 15, g: 15, b: 15 }), this.quadrant1TextFill = this.quadrant1TextFill || this.primaryTextColor, this.quadrant2TextFill = this.quadrant2TextFill || b(this.primaryTextColor, { r: -5, g: -5, b: -5 }), this.quadrant3TextFill = this.quadrant3TextFill || b(this.primaryTextColor, { r: -10, g: -10, b: -10 }), this.quadrant4TextFill = this.quadrant4TextFill || b(this.primaryTextColor, { r: -15, g: -15, b: -15 }), this.quadrantPointFill = this.quadrantPointFill || Ge(this.quadrant1Fill) ? z(this.quadrant1Fill) : W(this.quadrant1Fill), this.quadrantPointTextFill = this.quadrantPointTextFill || this.primaryTextColor, this.quadrantXAxisTextFill = this.quadrantXAxisTextFill || this.primaryTextColor, this.quadrantYAxisTextFill = this.quadrantYAxisTextFill || this.primaryTextColor, this.quadrantInternalBorderStrokeFill = this.quadrantInternalBorderStrokeFill || this.primaryBorderColor, this.quadrantExternalBorderStrokeFill = this.quadrantExternalBorderStrokeFill || this.primaryBorderColor, this.quadrantTitleFill = this.quadrantTitleFill || this.primaryTextColor, this.xyChart = {
      backgroundColor: this.xyChart?.backgroundColor || this.background,
      titleColor: this.xyChart?.titleColor || this.primaryTextColor,
      legendTextColor: this.xyChart?.legendTextColor || this.primaryTextColor,
      xAxisTitleColor: this.xyChart?.xAxisTitleColor || this.primaryTextColor,
      xAxisLabelColor: this.xyChart?.xAxisLabelColor || this.primaryTextColor,
      xAxisTickColor: this.xyChart?.xAxisTickColor || this.primaryTextColor,
      xAxisLineColor: this.xyChart?.xAxisLineColor || this.primaryTextColor,
      yAxisTitleColor: this.xyChart?.yAxisTitleColor || this.primaryTextColor,
      yAxisLabelColor: this.xyChart?.yAxisLabelColor || this.primaryTextColor,
      yAxisTickColor: this.xyChart?.yAxisTickColor || this.primaryTextColor,
      yAxisLineColor: this.xyChart?.yAxisLineColor || this.primaryTextColor,
      plotColorPalette: this.xyChart?.plotColorPalette || "#FFF4DD,#FFD8B1,#FFA07A,#ECEFF1,#D6DBDF,#C3E0A8,#FFB6A4,#FFD74D,#738FA7,#FFFFF0"
    }, this.requirementBackground = this.requirementBackground || e, this.requirementBorderColor = this.requirementBorderColor || this.primaryBorderColor, this.requirementBorderSize = this.requirementBorderSize || "1", this.requirementTextColor = this.requirementTextColor || this.primaryTextColor, this.relationColor = this.relationColor || this.lineColor, this.relationLabelBackground = this.relationLabelBackground || (this.darkMode ? W(this.secondaryColor, 30) : this.secondaryColor), this.relationLabelColor = this.relationLabelColor || this.actorTextColor, this.requirementEdgeLabelBackground = "#FFFFFF", this.git0 = this.git0 || e, this.git1 = this.git1 || t, this.git2 = this.git2 || r, this.git3 = this.git3 || b(e, { h: -30 }), this.git4 = this.git4 || b(e, { h: -60 }), this.git5 = this.git5 || b(e, { h: -90 }), this.git6 = this.git6 || b(e, { h: 60 }), this.git7 = this.git7 || b(e, { h: 120 }), this.darkMode ? (this.git0 = z(this.git0, 25), this.git1 = z(this.git1, 25), this.git2 = z(this.git2, 25), this.git3 = z(this.git3, 25), this.git4 = z(this.git4, 25), this.git5 = z(this.git5, 25), this.git6 = z(this.git6, 25), this.git7 = z(this.git7, 25)) : (this.git0 = W(this.git0, 25), this.git1 = W(this.git1, 25), this.git2 = W(this.git2, 25), this.git3 = W(this.git3, 25), this.git4 = W(this.git4, 25), this.git5 = W(this.git5, 25), this.git6 = W(this.git6, 25), this.git7 = W(this.git7, 25)), this.gitInv0 = this.gitInv0 || E(this.git0), this.gitInv1 = this.gitInv1 || E(this.git1), this.gitInv2 = this.gitInv2 || E(this.git2), this.gitInv3 = this.gitInv3 || E(this.git3), this.gitInv4 = this.gitInv4 || E(this.git4), this.gitInv5 = this.gitInv5 || E(this.git5), this.gitInv6 = this.gitInv6 || E(this.git6), this.gitInv7 = this.gitInv7 || E(this.git7), this.branchLabelColor = this.branchLabelColor || (this.darkMode ? "black" : this.labelTextColor), this.gitBranchLabel0 = this.gitBranchLabel0 || this.branchLabelColor, this.gitBranchLabel1 = this.gitBranchLabel1 || this.branchLabelColor, this.gitBranchLabel2 = this.gitBranchLabel2 || this.branchLabelColor, this.gitBranchLabel3 = this.gitBranchLabel3 || this.branchLabelColor, this.gitBranchLabel4 = this.gitBranchLabel4 || this.branchLabelColor, this.gitBranchLabel5 = this.gitBranchLabel5 || this.branchLabelColor, this.gitBranchLabel6 = this.gitBranchLabel6 || this.branchLabelColor, this.gitBranchLabel7 = this.gitBranchLabel7 || this.branchLabelColor, this.tagLabelColor = this.tagLabelColor || this.primaryTextColor, this.tagLabelBackground = this.tagLabelBackground || this.primaryColor, this.tagLabelBorder = this.tagBorder || this.primaryBorderColor, this.tagLabelFontSize = this.tagLabelFontSize || "10px", this.commitLabelColor = this.commitLabelColor || this.secondaryTextColor, this.commitLabelBackground = this.commitLabelBackground || this.secondaryColor, this.commitLabelFontSize = this.commitLabelFontSize || "10px", this.commitLineColor = this.commitLineColor ?? "#BDBCCC", this.erEdgeLabelBackground = "#FFFFFF", this.attributeBackgroundColorOdd = this.attributeBackgroundColorOdd || lr, this.attributeBackgroundColorEven = this.attributeBackgroundColorEven || hr;
  }
  calculate(e) {
    if (typeof e != "object") {
      this.updateColors();
      return;
    }
    const t = Object.keys(e);
    t.forEach((r) => {
      this[r] = e[r];
    }), this.updateColors(), t.forEach((r) => {
      this[r] = e[r];
    });
  }
}, uC = /* @__PURE__ */ p((e) => {
  const t = new cC();
  return t.calculate(e), t;
}, "getThemeVariables"), dC = class {
  static {
    p(this, "Theme");
  }
  constructor() {
    this.background = "#333", this.primaryColor = "#1f2020", this.secondaryColor = z(this.primaryColor, 16), this.tertiaryColor = b(this.primaryColor, { h: -160 }), this.primaryBorderColor = E(this.background), this.secondaryBorderColor = vt(this.secondaryColor, this.darkMode), this.tertiaryBorderColor = vt(this.tertiaryColor, this.darkMode), this.primaryTextColor = E(this.primaryColor), this.secondaryTextColor = E(this.secondaryColor), this.tertiaryTextColor = E(this.tertiaryColor), this.mainBkg = "#111113", this.secondBkg = "calculated", this.mainContrastColor = "lightgrey", this.darkTextColor = z(E("#323D47"), 10), this.border1 = "#ccc", this.border2 = Nr(255, 255, 255, 0.25), this.arrowheadColor = E(this.background), this.fontFamily = '"Recursive Variable", arial, sans-serif', this.fontSize = "14px", this.labelBackground = "#111113", this.textColor = "#ccc", this.THEME_COLOR_LIMIT = 12, this.radius = 12, this.strokeWidth = 2, this.noteBkgColor = this.noteBkgColor ?? "#FEF9C3", this.noteTextColor = this.noteTextColor ?? "#28253D", this.THEME_COLOR_LIMIT = 12, this.fontFamily = '"Recursive Variable", arial, sans-serif', this.fontSize = "14px", this.nodeBorder = "#FFFFFF", this.stateBorder = "#FFFFFF", this.useGradient = !1, this.gradientStart = "#0042eb", this.gradientStop = "#eb0042", this.dropShadow = "url(#drop-shadow)", this.nodeShadow = !0, this.archEdgeColor = "calculated", this.archEdgeArrowColor = "calculated", this.archEdgeWidth = "3", this.archGroupBorderColor = this.primaryBorderColor, this.archGroupBorderWidth = "2px", this.clusterBkg = "#1E1A2E", this.clusterBorder = "#BDBCCC", this.noteBorderColor = "#FACC15", this.noteFontWeight = 600, this.filterColor = "#FFFFFF";
  }
  updateColors() {
    if (this.primaryTextColor = this.primaryTextColor || (this.darkMode ? "#eee" : "#FFFFFF"), this.secondaryColor = this.secondaryColor || b(this.primaryColor, { h: -120 }), this.tertiaryColor = this.tertiaryColor || b(this.primaryColor, { h: 180, l: 5 }), this.primaryBorderColor = this.primaryBorderColor || vt(this.primaryColor, this.darkMode), this.secondaryBorderColor = this.secondaryBorderColor || vt(this.secondaryColor, this.darkMode), this.tertiaryBorderColor = this.tertiaryBorderColor || vt(this.tertiaryColor, this.darkMode), this.noteBorderColor = this.noteBorderColor || vt(this.noteBkgColor, this.darkMode), this.noteBkgColor = this.noteBkgColor || "#fff5ad", this.noteTextColor = this.noteTextColor || "#FFFFFF", this.secondaryTextColor = this.secondaryTextColor || E(this.secondaryColor), this.tertiaryTextColor = this.tertiaryTextColor || E(this.tertiaryColor), this.lineColor = this.lineColor || E(this.background), this.arrowheadColor = this.arrowheadColor || E(this.background), this.textColor = this.textColor || this.primaryTextColor, this.border2 = this.border2 || this.tertiaryBorderColor, this.nodeBkg = this.nodeBkg || this.primaryColor, this.mainBkg = this.mainBkg || this.primaryColor, this.nodeBorder = this.nodeBorder || this.border1, this.clusterBkg = this.clusterBkg || this.tertiaryColor, this.clusterBorder = this.clusterBorder || this.tertiaryBorderColor, this.defaultLinkColor = this.defaultLinkColor || this.lineColor, this.titleColor = this.titleColor || this.tertiaryTextColor, this.edgeLabelBackground = this.edgeLabelBackground || (this.darkMode ? W(this.secondaryColor, 30) : this.secondaryColor), this.nodeTextColor = this.nodeTextColor || this.primaryTextColor, this.actorBorder = "#FFFFFF", this.signalColor = "#FFFFFF", this.labelBoxBorderColor = "#BDBCCC", this.actorBorder = this.actorBorder || this.primaryBorderColor, this.actorBkg = this.actorBkg || this.mainBkg, this.actorTextColor = this.actorTextColor || this.primaryTextColor, this.actorLineColor = this.actorLineColor || this.actorBorder, this.labelBoxBkgColor = this.labelBoxBkgColor || this.actorBkg, this.signalColor = this.signalColor || this.textColor, this.signalTextColor = this.signalTextColor || this.textColor, this.labelBoxBorderColor = this.labelBoxBorderColor || this.actorBorder, this.labelTextColor = this.labelTextColor || this.actorTextColor, this.loopTextColor = this.loopTextColor || this.actorTextColor, this.activationBorderColor = this.activationBorderColor || W(this.secondaryColor, 10), this.activationBkgColor = this.activationBkgColor || this.secondaryColor, this.sequenceNumberColor = this.sequenceNumberColor || E(this.lineColor), this.rectBkgColor = this.rectBkgColor || this.tertiaryColor, this.sectionBkgColor = this.sectionBkgColor || this.tertiaryColor, this.altSectionBkgColor = this.altSectionBkgColor || "white", this.sectionBkgColor = this.sectionBkgColor || this.secondaryColor, this.sectionBkgColor2 = this.sectionBkgColor2 || this.primaryColor, this.excludeBkgColor = this.excludeBkgColor || "#eeeeee", this.taskBorderColor = this.taskBorderColor || this.primaryBorderColor, this.taskBkgColor = this.taskBkgColor || this.primaryColor, this.activeTaskBorderColor = this.activeTaskBorderColor || this.primaryColor, this.activeTaskBkgColor = this.activeTaskBkgColor || z(this.primaryColor, 23), this.gridColor = this.gridColor || "lightgrey", this.doneTaskBkgColor = this.doneTaskBkgColor || "lightgrey", this.doneTaskBorderColor = this.doneTaskBorderColor || "grey", this.critBorderColor = this.critBorderColor || "#ff8888", this.critBkgColor = this.critBkgColor || "red", this.todayLineColor = this.todayLineColor || "red", this.taskTextColor = this.taskTextColor || this.textColor, this.taskTextOutsideColor = this.taskTextOutsideColor || this.textColor, this.taskTextLightColor = this.taskTextLightColor || this.textColor, this.taskTextColor = this.taskTextColor || this.primaryTextColor, this.taskTextDarkColor = this.taskTextDarkColor || this.textColor, this.taskTextClickableColor = this.taskTextClickableColor || "#003163", this.archEdgeColor = this.lineColor, this.archEdgeArrowColor = this.lineColor, this.personBorder = this.personBorder || this.primaryBorderColor, this.personBkg = this.personBkg || this.mainBkg, this.transitionColor = this.transitionColor || this.lineColor, this.transitionLabelColor = this.transitionLabelColor || this.textColor, this.stateLabelColor = this.stateLabelColor || this.stateBkg || this.primaryTextColor, this.vertLineColor = this.vertLineColor || this.primaryBorderColor, this.compositeBackground = "#16141F", this.altBackground = "#16141F", this.compositeTitleBackground = "#16141F", this.stateEdgeLabelBackground = "#16141F", this.fontWeight = 600, this.stateBkg = this.stateBkg || this.mainBkg, this.labelBackgroundColor = this.labelBackgroundColor || this.stateBkg, this.compositeBackground = this.compositeBackground || this.background || this.tertiaryColor, this.altBackground = this.altBackground || "#f0f0f0", this.compositeTitleBackground = this.compositeTitleBackground || this.mainBkg, this.compositeBorder = this.compositeBorder || this.nodeBorder, this.innerEndBackground = this.nodeBorder, this.errorBkgColor = this.errorBkgColor || this.tertiaryColor, this.errorTextColor = this.errorTextColor || this.tertiaryTextColor, this.transitionColor = this.transitionColor || this.lineColor, this.specialStateColor = this.lineColor, this.cScale0 = this.cScale0 || this.primaryColor, this.cScale1 = this.cScale1 || this.secondaryColor, this.cScale2 = this.cScale2 || this.tertiaryColor, this.cScale3 = this.cScale3 || b(this.primaryColor, { h: 30 }), this.cScale4 = this.cScale4 || b(this.primaryColor, { h: 60 }), this.cScale5 = this.cScale5 || b(this.primaryColor, { h: 90 }), this.cScale6 = this.cScale6 || b(this.primaryColor, { h: 120 }), this.cScale7 = this.cScale7 || b(this.primaryColor, { h: 150 }), this.cScale8 = this.cScale8 || b(this.primaryColor, { h: 210, l: 150 }), this.cScale9 = this.cScale9 || b(this.primaryColor, { h: 270 }), this.cScale10 = this.cScale10 || b(this.primaryColor, { h: 300 }), this.cScale11 = this.cScale11 || b(this.primaryColor, { h: 330 }), this.darkMode)
      for (let t = 0; t < this.THEME_COLOR_LIMIT; t++)
        this["cScale" + t] = W(this["cScale" + t], 75);
    else
      for (let t = 0; t < this.THEME_COLOR_LIMIT; t++)
        this["cScale" + t] = W(this["cScale" + t], 25);
    for (let t = 0; t < this.THEME_COLOR_LIMIT; t++)
      this["cScaleInv" + t] = this["cScaleInv" + t] || E(this["cScale" + t]);
    for (let t = 0; t < this.THEME_COLOR_LIMIT; t++)
      this.darkMode ? this["cScalePeer" + t] = this["cScalePeer" + t] || z(this["cScale" + t], 10) : this["cScalePeer" + t] = this["cScalePeer" + t] || W(this["cScale" + t], 10);
    this.scaleLabelColor = this.scaleLabelColor || this.labelTextColor;
    for (let t = 0; t < this.THEME_COLOR_LIMIT; t++)
      this["cScaleLabel" + t] = this["cScaleLabel" + t] || this.scaleLabelColor;
    const e = this.darkMode ? -4 : -1;
    for (let t = 0; t < 5; t++)
      this["surface" + t] = this["surface" + t] || b(this.mainBkg, { h: 180, s: -15, l: e * (5 + t * 3) }), this["surfacePeer" + t] = this["surfacePeer" + t] || b(this.mainBkg, { h: 180, s: -15, l: e * (8 + t * 3) });
    this.classText = this.classText || this.textColor, this.fillType0 = this.fillType0 || this.primaryColor, this.fillType1 = this.fillType1 || this.secondaryColor, this.fillType2 = this.fillType2 || b(this.primaryColor, { h: 64 }), this.fillType3 = this.fillType3 || b(this.secondaryColor, { h: 64 }), this.fillType4 = this.fillType4 || b(this.primaryColor, { h: -64 }), this.fillType5 = this.fillType5 || b(this.secondaryColor, { h: -64 }), this.fillType6 = this.fillType6 || b(this.primaryColor, { h: 128 }), this.fillType7 = this.fillType7 || b(this.secondaryColor, { h: 128 }), this.pie1 = this.pie1 || this.primaryColor, this.pie2 = this.pie2 || this.secondaryColor, this.pie3 = this.pie3 || this.tertiaryColor, this.pie4 = this.pie4 || b(this.primaryColor, { l: -10 }), this.pie5 = this.pie5 || b(this.secondaryColor, { l: -10 }), this.pie6 = this.pie6 || b(this.tertiaryColor, { l: -10 }), this.pie7 = this.pie7 || b(this.primaryColor, { h: 60, l: -10 }), this.pie8 = this.pie8 || b(this.primaryColor, { h: -60, l: -10 }), this.pie9 = this.pie9 || b(this.primaryColor, { h: 120, l: 0 }), this.pie10 = this.pie10 || b(this.primaryColor, { h: 60, l: -20 }), this.pie11 = this.pie11 || b(this.primaryColor, { h: -60, l: -20 }), this.pie12 = this.pie12 || b(this.primaryColor, { h: 120, l: -10 }), this.pieTitleTextSize = this.pieTitleTextSize || "25px", this.pieTitleTextColor = this.pieTitleTextColor || this.taskTextDarkColor, this.pieSectionTextSize = this.pieSectionTextSize || "17px", this.pieSectionTextColor = this.pieSectionTextColor || this.textColor, this.pieLegendTextSize = this.pieLegendTextSize || "17px", this.pieLegendTextColor = this.pieLegendTextColor || this.taskTextDarkColor, this.pieStrokeColor = this.pieStrokeColor || "black", this.pieStrokeWidth = this.pieStrokeWidth || "2px", this.pieOuterStrokeWidth = this.pieOuterStrokeWidth || "2px", this.pieOuterStrokeColor = this.pieOuterStrokeColor || "black", this.pieOpacity = this.pieOpacity || "0.7", this.vennTitleTextColor = this.vennTitleTextColor ?? this.titleColor, this.vennSetTextColor = this.vennSetTextColor ?? this.textColor, this.quadrant1Fill = this.quadrant1Fill || this.primaryColor, this.quadrant2Fill = this.quadrant2Fill || b(this.primaryColor, { r: 5, g: 5, b: 5 }), this.quadrant3Fill = this.quadrant3Fill || b(this.primaryColor, { r: 10, g: 10, b: 10 }), this.quadrant4Fill = this.quadrant4Fill || b(this.primaryColor, { r: 15, g: 15, b: 15 }), this.quadrant1TextFill = this.quadrant1TextFill || this.primaryTextColor, this.quadrant2TextFill = this.quadrant2TextFill || b(this.primaryTextColor, { r: -5, g: -5, b: -5 }), this.quadrant3TextFill = this.quadrant3TextFill || b(this.primaryTextColor, { r: -10, g: -10, b: -10 }), this.quadrant4TextFill = this.quadrant4TextFill || b(this.primaryTextColor, { r: -15, g: -15, b: -15 }), this.quadrantPointFill = this.quadrantPointFill || Ge(this.quadrant1Fill) ? z(this.quadrant1Fill) : W(this.quadrant1Fill), this.quadrantPointTextFill = this.quadrantPointTextFill || this.primaryTextColor, this.quadrantXAxisTextFill = this.quadrantXAxisTextFill || this.primaryTextColor, this.quadrantYAxisTextFill = this.quadrantYAxisTextFill || this.primaryTextColor, this.quadrantInternalBorderStrokeFill = this.quadrantInternalBorderStrokeFill || this.primaryBorderColor, this.quadrantExternalBorderStrokeFill = this.quadrantExternalBorderStrokeFill || this.primaryBorderColor, this.quadrantTitleFill = this.quadrantTitleFill || this.primaryTextColor, this.xyChart = {
      backgroundColor: this.xyChart?.backgroundColor || this.background,
      titleColor: this.xyChart?.titleColor || this.primaryTextColor,
      legendTextColor: this.xyChart?.legendTextColor || this.primaryTextColor,
      xAxisTitleColor: this.xyChart?.xAxisTitleColor || this.primaryTextColor,
      xAxisLabelColor: this.xyChart?.xAxisLabelColor || this.primaryTextColor,
      xAxisTickColor: this.xyChart?.xAxisTickColor || this.primaryTextColor,
      xAxisLineColor: this.xyChart?.xAxisLineColor || this.primaryTextColor,
      yAxisTitleColor: this.xyChart?.yAxisTitleColor || this.primaryTextColor,
      yAxisLabelColor: this.xyChart?.yAxisLabelColor || this.primaryTextColor,
      yAxisTickColor: this.xyChart?.yAxisTickColor || this.primaryTextColor,
      yAxisLineColor: this.xyChart?.yAxisLineColor || this.primaryTextColor,
      plotColorPalette: this.xyChart?.plotColorPalette || "#FFF4DD,#FFD8B1,#FFA07A,#ECEFF1,#D6DBDF,#C3E0A8,#FFB6A4,#FFD74D,#738FA7,#FFFFF0"
    }, this.requirementBackground = this.requirementBackground || this.primaryColor, this.requirementBorderColor = this.requirementBorderColor || this.primaryBorderColor, this.requirementBorderSize = this.requirementBorderSize || "1", this.requirementTextColor = this.requirementTextColor || this.primaryTextColor, this.relationColor = this.relationColor || this.lineColor, this.relationLabelBackground = this.relationLabelBackground || (this.darkMode ? W(this.secondaryColor, 30) : this.secondaryColor), this.relationLabelColor = this.relationLabelColor || this.actorTextColor, this.requirementEdgeLabelBackground = "#16141F", this.git0 = this.git0 || this.primaryColor, this.git1 = this.git1 || this.secondaryColor, this.git2 = this.git2 || this.tertiaryColor, this.git3 = this.git3 || b(this.primaryColor, { h: -30 }), this.git4 = this.git4 || b(this.primaryColor, { h: -60 }), this.git5 = this.git5 || b(this.primaryColor, { h: -90 }), this.git6 = this.git6 || b(this.primaryColor, { h: 60 }), this.git7 = this.git7 || b(this.primaryColor, { h: 120 }), this.darkMode ? (this.git0 = z(this.git0, 25), this.git1 = z(this.git1, 25), this.git2 = z(this.git2, 25), this.git3 = z(this.git3, 25), this.git4 = z(this.git4, 25), this.git5 = z(this.git5, 25), this.git6 = z(this.git6, 25), this.git7 = z(this.git7, 25)) : (this.git0 = W(this.git0, 25), this.git1 = W(this.git1, 25), this.git2 = W(this.git2, 25), this.git3 = W(this.git3, 25), this.git4 = W(this.git4, 25), this.git5 = W(this.git5, 25), this.git6 = W(this.git6, 25), this.git7 = W(this.git7, 25)), this.gitInv0 = this.gitInv0 || E(this.git0), this.gitInv1 = this.gitInv1 || E(this.git1), this.gitInv2 = this.gitInv2 || E(this.git2), this.gitInv3 = this.gitInv3 || E(this.git3), this.gitInv4 = this.gitInv4 || E(this.git4), this.gitInv5 = this.gitInv5 || E(this.git5), this.gitInv6 = this.gitInv6 || E(this.git6), this.gitInv7 = this.gitInv7 || E(this.git7), this.branchLabelColor = this.branchLabelColor || (this.darkMode ? "black" : this.labelTextColor), this.gitBranchLabel0 = this.gitBranchLabel0 || this.branchLabelColor, this.gitBranchLabel1 = this.gitBranchLabel1 || this.branchLabelColor, this.gitBranchLabel2 = this.gitBranchLabel2 || this.branchLabelColor, this.gitBranchLabel3 = this.gitBranchLabel3 || this.branchLabelColor, this.gitBranchLabel4 = this.gitBranchLabel4 || this.branchLabelColor, this.gitBranchLabel5 = this.gitBranchLabel5 || this.branchLabelColor, this.gitBranchLabel6 = this.gitBranchLabel6 || this.branchLabelColor, this.gitBranchLabel7 = this.gitBranchLabel7 || this.branchLabelColor, this.tagLabelColor = this.tagLabelColor || this.primaryTextColor, this.tagLabelBackground = this.tagLabelBackground || this.primaryColor, this.tagLabelBorder = this.tagBorder || this.primaryBorderColor, this.tagLabelFontSize = this.tagLabelFontSize || "10px", this.commitLabelColor = this.commitLabelColor || this.secondaryTextColor, this.commitLabelBackground = this.commitLabelBackground || this.secondaryColor, this.commitLabelFontSize = this.commitLabelFontSize || "10px", this.commitLineColor = this.commitLineColor ?? "#BDBCCC", this.erEdgeLabelBackground = "#16141F", this.attributeBackgroundColorOdd = this.attributeBackgroundColorOdd || lr, this.attributeBackgroundColorEven = this.attributeBackgroundColorEven || hr;
  }
  calculate(e) {
    if (typeof e != "object") {
      this.updateColors();
      return;
    }
    const t = Object.keys(e);
    t.forEach((r) => {
      this[r] = e[r];
    }), this.updateColors(), t.forEach((r) => {
      this[r] = e[r];
    });
  }
}, fC = /* @__PURE__ */ p((e) => {
  const t = new dC();
  return t.calculate(e), t;
}, "getThemeVariables"), pC = class {
  static {
    p(this, "Theme");
  }
  constructor() {
    this.background = "#ffffff", this.primaryColor = "#cccccc", this.mainBkg = "#ffffff", this.noteBkgColor = "#fff5ad", this.noteTextColor = "#28253D", this.THEME_COLOR_LIMIT = 12, this.radius = 12, this.strokeWidth = 2, this.primaryBorderColor = vt(this.primaryColor, this.darkMode), this.fontFamily = '"Recursive Variable", arial, sans-serif', this.fontSize = "14px", this.nodeBorder = "#28253D", this.stateBorder = "#28253D", this.useGradient = !1, this.gradientStart = "#0042eb", this.gradientStop = "#eb0042", this.dropShadow = "url(#drop-shadow)", this.nodeShadow = !0, this.tertiaryColor = "#ffffff", this.archEdgeColor = "calculated", this.archEdgeArrowColor = "calculated", this.archEdgeWidth = "3", this.archGroupBorderColor = this.primaryBorderColor, this.archGroupBorderWidth = "2px", this.actorBorder = "#28253D", this.noteBorderColor = "#FACC15", this.noteFontWeight = 600, this.borderColorArray = [
      "#E879F9",
      //Fuchsia-400
      "#2DD4BF",
      //Teal-400
      "#FB923C",
      //Orange-400
      "#22D3EE",
      // Cyan-400
      "#4ADE80",
      // Green-400
      "#A78BFA",
      //Violet-400
      "#F87171",
      //red-400
      "#FACC15",
      //yellow-400
      "#818CF8",
      //indigo-400
      "#A3E635 ",
      //Lime-400
      "#38BDF8",
      //Sky-400
      "#FB7185"
      //Rose-400
    ], this.bkgColorArray = [
      "#FDF4FF",
      //Fuchsia-50
      "#F0FDFA",
      //Teal-50
      "#FFF7ED",
      //Orange-50
      "#ECFEFF",
      // Cyan-50
      "#F0FDF4",
      // Green-50
      "#F5F3FF",
      //Violet-50
      "#FEF2F2",
      //red-50
      "#FEFCE8",
      //yellow-50
      "#EEF2FF",
      //indigo-50
      "#F7FEE7",
      //Lime-50
      "#F0F9FF",
      //Sky-50
      "#FFF1F2"
      //Rose-50
    ], this.filterColor = "#000000";
  }
  updateColors() {
    this.primaryTextColor = this.primaryTextColor || (this.darkMode ? "#eee" : "#28253D"), this.secondaryColor = this.secondaryColor || b(this.primaryColor, { h: -120 }), this.tertiaryColor = this.tertiaryColor || b(this.primaryColor, { h: 180, l: 5 }), this.primaryBorderColor = this.primaryBorderColor || vt(this.primaryColor, this.darkMode), this.secondaryBorderColor = this.secondaryBorderColor || vt(this.secondaryColor, this.darkMode), this.tertiaryBorderColor = this.tertiaryBorderColor || vt(this.tertiaryColor, this.darkMode), this.noteBorderColor = this.noteBorderColor || vt(this.noteBkgColor, this.darkMode), this.noteBkgColor = this.noteBkgColor || "#fff5ad", this.noteTextColor = this.noteTextColor || "#28253D", this.secondaryTextColor = this.secondaryTextColor || E(this.secondaryColor), this.tertiaryTextColor = this.tertiaryTextColor || E(this.tertiaryColor), this.lineColor = this.lineColor || E(this.background), this.arrowheadColor = this.arrowheadColor || E(this.background), this.textColor = this.textColor || this.primaryTextColor, this.border2 = this.border2 || this.tertiaryBorderColor, this.nodeBkg = this.nodeBkg || this.primaryColor, this.mainBkg = this.mainBkg || this.primaryColor, this.nodeBorder = this.nodeBorder || this.primaryBorderColor, this.clusterBkg = this.clusterBkg || this.tertiaryColor, this.clusterBorder = this.clusterBorder || this.tertiaryBorderColor, this.defaultLinkColor = this.defaultLinkColor || this.lineColor, this.titleColor = this.titleColor || this.tertiaryTextColor, this.edgeLabelBackground = this.edgeLabelBackground || (this.darkMode ? W(this.secondaryColor, 30) : this.secondaryColor), this.nodeTextColor = this.nodeTextColor || this.primaryTextColor, this.actorBorder = this.actorBorder || this.primaryBorderColor, this.actorBkg = this.actorBkg || this.mainBkg, this.actorTextColor = this.actorTextColor || this.primaryTextColor, this.actorLineColor = this.actorLineColor || this.actorBorder, this.labelBoxBkgColor = this.labelBoxBkgColor || this.actorBkg, this.signalColor = this.signalColor || this.textColor, this.signalTextColor = this.signalTextColor || this.textColor, this.labelBoxBorderColor = this.labelBoxBorderColor || this.actorBorder, this.labelTextColor = this.labelTextColor || this.actorTextColor, this.loopTextColor = this.loopTextColor || this.actorTextColor, this.activationBorderColor = this.activationBorderColor || W(this.secondaryColor, 10), this.activationBkgColor = this.activationBkgColor || this.secondaryColor, this.sequenceNumberColor = this.sequenceNumberColor || E(this.lineColor), this.rectBkgColor = this.rectBkgColor || this.tertiaryColor;
    const e = "#ECECFE", t = "#E9E9F1", r = b(e, { h: 180, l: 5 });
    this.sectionBkgColor = this.sectionBkgColor || r, this.altSectionBkgColor = this.altSectionBkgColor || "white", this.sectionBkgColor = this.sectionBkgColor || t, this.sectionBkgColor2 = this.sectionBkgColor2 || e, this.excludeBkgColor = this.excludeBkgColor || "#eeeeee", this.taskBorderColor = this.taskBorderColor || this.primaryBorderColor, this.taskBkgColor = this.taskBkgColor || e, this.activeTaskBorderColor = this.activeTaskBorderColor || e, this.activeTaskBkgColor = this.activeTaskBkgColor || z(e, 23), this.gridColor = this.gridColor || "lightgrey", this.doneTaskBkgColor = this.doneTaskBkgColor || "lightgrey", this.doneTaskBorderColor = this.doneTaskBorderColor || "grey", this.critBorderColor = this.critBorderColor || "#ff8888", this.critBkgColor = this.critBkgColor || "red", this.todayLineColor = this.todayLineColor || "red", this.taskTextColor = this.taskTextColor || this.textColor, this.vertLineColor = this.vertLineColor || this.primaryBorderColor, this.taskTextOutsideColor = this.taskTextOutsideColor || this.textColor, this.taskTextLightColor = this.taskTextLightColor || this.textColor, this.taskTextColor = this.taskTextColor || this.primaryTextColor, this.taskTextDarkColor = this.taskTextDarkColor || this.textColor, this.taskTextClickableColor = this.taskTextClickableColor || "#003163", this.archEdgeColor = this.lineColor, this.archEdgeArrowColor = this.lineColor, this.personBorder = this.personBorder || this.primaryBorderColor, this.personBkg = this.personBkg || this.mainBkg, this.transitionColor = this.transitionColor || this.lineColor, this.transitionLabelColor = this.transitionLabelColor || this.textColor, this.stateLabelColor = this.stateLabelColor || this.stateBkg || this.primaryTextColor, this.stateBkg = this.stateBkg || this.mainBkg, this.labelBackgroundColor = this.labelBackgroundColor || this.stateBkg, this.compositeBackground = this.compositeBackground || this.background || this.tertiaryColor, this.altBackground = this.altBackground || "#f0f0f0", this.compositeTitleBackground = this.compositeTitleBackground || this.mainBkg, this.compositeBorder = this.compositeBorder || this.nodeBorder, this.innerEndBackground = this.nodeBorder, this.errorBkgColor = this.errorBkgColor || this.tertiaryColor, this.errorTextColor = this.errorTextColor || this.tertiaryTextColor, this.transitionColor = this.transitionColor || this.lineColor, this.specialStateColor = this.lineColor, this.cScale0 = this.cScale0 || "#f4a8ff", this.cScale1 = this.cScale1 || "#46ecd5", this.cScale2 = this.cScale2 || "#ffb86a", this.cScale3 = this.cScale3 || "#dab2ff", this.cScale4 = this.cScale4 || "#7bf1a8", this.cScale5 = this.cScale5 || "#c4b4ff", this.cScale6 = this.cScale6 || "#ffa2a2", this.cScale7 = this.cScale7 || "#ffdf20", this.cScale8 = this.cScale8 || "#a3b3ff", this.cScale9 = this.cScale9 || "#bbf451", this.cScale10 = this.cScale10 || "#74d4ff", this.cScale11 = this.cScale11 || "#ffa1ad";
    for (let s = 0; s < this.THEME_COLOR_LIMIT; s++)
      this["cScaleInv" + s] = this["cScaleInv" + s] || E(this["cScale" + s]);
    for (let s = 0; s < this.THEME_COLOR_LIMIT; s++)
      this.darkMode ? this["cScalePeer" + s] = this["cScalePeer" + s] || z(this["cScale" + s], 10) : this["cScalePeer" + s] = this["cScalePeer" + s] || W(this["cScale" + s], 10);
    this.scaleLabelColor = this.scaleLabelColor || this.labelTextColor;
    for (let s = 0; s < this.THEME_COLOR_LIMIT; s++)
      this["cScaleLabel" + s] = this["cScaleLabel" + s] || this.scaleLabelColor;
    const i = this.darkMode ? -4 : -1;
    for (let s = 0; s < 5; s++)
      this["surface" + s] = this["surface" + s] || b(this.mainBkg, { h: 180, s: -15, l: i * (5 + s * 3) }), this["surfacePeer" + s] = this["surfacePeer" + s] || b(this.mainBkg, { h: 180, s: -15, l: i * (8 + s * 3) });
    this.classText = this.classText || this.textColor, this.fillType0 = this.fillType0 || e, this.fillType1 = this.fillType1 || t, this.fillType2 = this.fillType2 || b(e, { h: 64 }), this.fillType3 = this.fillType3 || b(t, { h: 64 }), this.fillType4 = this.fillType4 || b(e, { h: -64 }), this.fillType5 = this.fillType5 || b(t, { h: -64 }), this.fillType6 = this.fillType6 || b(e, { h: 128 }), this.fillType7 = this.fillType7 || b(t, { h: 128 }), this.pie1 = this.pie1 || e, this.pie2 = this.pie2 || t, this.pie3 = this.pie3 || r, this.pie4 = this.pie4 || b(e, { l: -10 }), this.pie5 = this.pie5 || b(t, { l: -10 }), this.pie6 = this.pie6 || b(r, { l: -10 }), this.pie7 = this.pie7 || b(e, { h: 60, l: -10 }), this.pie8 = this.pie8 || b(e, { h: -60, l: -10 }), this.pie9 = this.pie9 || b(e, { h: 120, l: 0 }), this.pie10 = this.pie10 || b(e, { h: 60, l: -20 }), this.pie11 = this.pie11 || b(e, { h: -60, l: -20 }), this.pie12 = this.pie12 || b(e, { h: 120, l: -10 }), this.pieTitleTextSize = this.pieTitleTextSize || "25px", this.pieTitleTextColor = this.pieTitleTextColor || this.taskTextDarkColor, this.pieSectionTextSize = this.pieSectionTextSize || "17px", this.pieSectionTextColor = this.pieSectionTextColor || this.textColor, this.pieLegendTextSize = this.pieLegendTextSize || "17px", this.pieLegendTextColor = this.pieLegendTextColor || this.taskTextDarkColor, this.pieStrokeColor = this.pieStrokeColor || "black", this.pieStrokeWidth = this.pieStrokeWidth || "2px", this.pieOuterStrokeWidth = this.pieOuterStrokeWidth || "2px", this.pieOuterStrokeColor = this.pieOuterStrokeColor || "black", this.pieOpacity = this.pieOpacity || "0.7", this.vennTitleTextColor = this.vennTitleTextColor ?? this.titleColor, this.vennSetTextColor = this.vennSetTextColor ?? this.textColor, this.quadrant1Fill = this.quadrant1Fill || e, this.quadrant2Fill = this.quadrant2Fill || b(e, { r: 5, g: 5, b: 5 }), this.quadrant3Fill = this.quadrant3Fill || b(e, { r: 10, g: 10, b: 10 }), this.quadrant4Fill = this.quadrant4Fill || b(e, { r: 15, g: 15, b: 15 }), this.quadrant1TextFill = this.quadrant1TextFill || this.primaryTextColor, this.quadrant2TextFill = this.quadrant2TextFill || b(this.primaryTextColor, { r: -5, g: -5, b: -5 }), this.quadrant3TextFill = this.quadrant3TextFill || b(this.primaryTextColor, { r: -10, g: -10, b: -10 }), this.quadrant4TextFill = this.quadrant4TextFill || b(this.primaryTextColor, { r: -15, g: -15, b: -15 }), this.quadrantPointFill = this.quadrantPointFill || Ge(this.quadrant1Fill) ? z(this.quadrant1Fill) : W(this.quadrant1Fill), this.quadrantPointTextFill = this.quadrantPointTextFill || this.primaryTextColor, this.quadrantXAxisTextFill = this.quadrantXAxisTextFill || this.primaryTextColor, this.quadrantYAxisTextFill = this.quadrantYAxisTextFill || this.primaryTextColor, this.quadrantInternalBorderStrokeFill = this.quadrantInternalBorderStrokeFill || this.primaryBorderColor, this.quadrantExternalBorderStrokeFill = this.quadrantExternalBorderStrokeFill || this.primaryBorderColor, this.quadrantTitleFill = this.quadrantTitleFill || this.primaryTextColor, this.xyChart = {
      backgroundColor: this.xyChart?.backgroundColor || this.background,
      titleColor: this.xyChart?.titleColor || this.primaryTextColor,
      legendTextColor: this.xyChart?.legendTextColor || this.primaryTextColor,
      xAxisTitleColor: this.xyChart?.xAxisTitleColor || this.primaryTextColor,
      xAxisLabelColor: this.xyChart?.xAxisLabelColor || this.primaryTextColor,
      xAxisTickColor: this.xyChart?.xAxisTickColor || this.primaryTextColor,
      xAxisLineColor: this.xyChart?.xAxisLineColor || this.primaryTextColor,
      yAxisTitleColor: this.xyChart?.yAxisTitleColor || this.primaryTextColor,
      yAxisLabelColor: this.xyChart?.yAxisLabelColor || this.primaryTextColor,
      yAxisTickColor: this.xyChart?.yAxisTickColor || this.primaryTextColor,
      yAxisLineColor: this.xyChart?.yAxisLineColor || this.primaryTextColor,
      plotColorPalette: this.xyChart?.plotColorPalette || "#FFF4DD,#FFD8B1,#FFA07A,#ECEFF1,#D6DBDF,#C3E0A8,#FFB6A4,#FFD74D,#738FA7,#FFFFF0"
    }, this.requirementBackground = this.requirementBackground || e, this.requirementBorderColor = this.requirementBorderColor || this.primaryBorderColor, this.requirementBorderSize = this.requirementBorderSize || "1", this.requirementTextColor = this.requirementTextColor || this.primaryTextColor, this.relationColor = this.relationColor || this.lineColor, this.relationLabelBackground = this.relationLabelBackground || (this.darkMode ? W(this.secondaryColor, 30) : this.secondaryColor), this.relationLabelColor = this.relationLabelColor || this.actorTextColor, this.git0 = this.git0 || e, this.git1 = this.git1 || t, this.git2 = this.git2 || r, this.git3 = this.git3 || b(e, { h: -30 }), this.git4 = this.git4 || b(e, { h: -60 }), this.git5 = this.git5 || b(e, { h: -90 }), this.git6 = this.git6 || b(e, { h: 60 }), this.git7 = this.git7 || b(e, { h: 120 }), this.darkMode ? (this.git0 = z(this.git0, 25), this.git1 = z(this.git1, 25), this.git2 = z(this.git2, 25), this.git3 = z(this.git3, 25), this.git4 = z(this.git4, 25), this.git5 = z(this.git5, 25), this.git6 = z(this.git6, 25), this.git7 = z(this.git7, 25)) : (this.git0 = W(this.git0, 25), this.git1 = W(this.git1, 25), this.git2 = W(this.git2, 25), this.git3 = W(this.git3, 25), this.git4 = W(this.git4, 25), this.git5 = W(this.git5, 25), this.git6 = W(this.git6, 25), this.git7 = W(this.git7, 25)), this.gitInv0 = this.gitInv0 || E(this.git0), this.gitInv1 = this.gitInv1 || E(this.git1), this.gitInv2 = this.gitInv2 || E(this.git2), this.gitInv3 = this.gitInv3 || E(this.git3), this.gitInv4 = this.gitInv4 || E(this.git4), this.gitInv5 = this.gitInv5 || E(this.git5), this.gitInv6 = this.gitInv6 || E(this.git6), this.gitInv7 = this.gitInv7 || E(this.git7), this.branchLabelColor = this.branchLabelColor || (this.darkMode ? "black" : this.labelTextColor), this.gitBranchLabel0 = this.gitBranchLabel0 || this.branchLabelColor, this.gitBranchLabel1 = this.gitBranchLabel1 || this.branchLabelColor, this.gitBranchLabel2 = this.gitBranchLabel2 || this.branchLabelColor, this.gitBranchLabel3 = this.gitBranchLabel3 || this.branchLabelColor, this.gitBranchLabel4 = this.gitBranchLabel4 || this.branchLabelColor, this.gitBranchLabel5 = this.gitBranchLabel5 || this.branchLabelColor, this.gitBranchLabel6 = this.gitBranchLabel6 || this.branchLabelColor, this.gitBranchLabel7 = this.gitBranchLabel7 || this.branchLabelColor, this.tagLabelColor = this.tagLabelColor || this.primaryTextColor, this.tagLabelBackground = this.tagLabelBackground || this.primaryColor, this.tagLabelBorder = this.tagBorder || this.primaryBorderColor, this.tagLabelFontSize = this.tagLabelFontSize || "10px", this.commitLabelColor = this.commitLabelColor || this.secondaryTextColor, this.commitLabelBackground = this.commitLabelBackground || this.secondaryColor, this.commitLineColor = this.commitLineColor ?? "#BDBCCC", this.commitLabelFontSize = this.commitLabelFontSize || "10px", this.fontWeight = 600, this.erEdgeLabelBackground = "#FFFFFF", this.attributeBackgroundColorOdd = this.attributeBackgroundColorOdd || lr, this.attributeBackgroundColorEven = this.attributeBackgroundColorEven || hr;
  }
  calculate(e) {
    if (typeof e != "object") {
      this.updateColors();
      return;
    }
    const t = Object.keys(e);
    t.forEach((r) => {
      this[r] = e[r];
    }), this.updateColors(), t.forEach((r) => {
      this[r] = e[r];
    });
  }
}, gC = /* @__PURE__ */ p((e) => {
  const t = new pC();
  return t.calculate(e), t;
}, "getThemeVariables"), mC = class {
  static {
    p(this, "Theme");
  }
  constructor() {
    this.background = "#333", this.primaryColor = "#1f2020", this.secondaryColor = z(this.primaryColor, 16), this.tertiaryColor = b(this.primaryColor, { h: -160 }), this.primaryBorderColor = E(this.background), this.secondaryBorderColor = vt(this.secondaryColor, this.darkMode), this.tertiaryBorderColor = vt(this.tertiaryColor, this.darkMode), this.primaryTextColor = E(this.primaryColor), this.secondaryTextColor = E(this.secondaryColor), this.tertiaryTextColor = E(this.tertiaryColor), this.mainBkg = "#111113", this.secondBkg = "calculated", this.mainContrastColor = "lightgrey", this.darkTextColor = z(E("#323D47"), 10), this.border1 = "#ccc", this.border2 = Nr(255, 255, 255, 0.25), this.arrowheadColor = E(this.background), this.fontFamily = '"Recursive Variable", arial, sans-serif', this.fontSize = "14px", this.labelBackground = "#111113", this.textColor = "#ccc", this.THEME_COLOR_LIMIT = 12, this.radius = 12, this.strokeWidth = 2, this.noteBkgColor = this.noteBkgColor ?? "#FEF9C3", this.noteTextColor = this.noteTextColor ?? "#28253D", this.THEME_COLOR_LIMIT = 12, this.fontFamily = '"Recursive Variable", arial, sans-serif', this.fontSize = "14px", this.nodeBorder = "#FFFFFF", this.stateBorder = "#FFFFFF", this.useGradient = !1, this.gradientStart = "#0042eb", this.gradientStop = "#eb0042", this.dropShadow = "url(#drop-shadow)", this.nodeShadow = !0, this.archEdgeColor = "calculated", this.archEdgeArrowColor = "calculated", this.archEdgeWidth = "3", this.archGroupBorderColor = this.primaryBorderColor, this.archGroupBorderWidth = "2px", this.clusterBkg = "#1E1A2E", this.clusterBorder = "#BDBCCC", this.noteBorderColor = "#FACC15", this.noteFontWeight = 600, this.borderColorArray = [
      "#E879F9",
      //Fuchsia-400
      "#2DD4BF",
      //Teal-400
      "#FB923C",
      //Orange-400
      "#22D3EE",
      // Cyan-400
      "#4ADE80",
      // Green-400
      "#A78BFA",
      //Violet-400
      "#F87171",
      //red-400
      "#FACC15",
      //yellow-400
      "#818CF8",
      //indigo-400
      "#A3E635 ",
      //Lime-400
      "#38BDF8",
      //Sky-400
      "#FB7185"
      //Rose-400
    ], this.bkgColorArray = [], this.filterColor = "#FFFFFF";
  }
  updateColors() {
    this.primaryTextColor = this.primaryTextColor || (this.darkMode ? "#eee" : "#FFFFFF"), this.secondaryColor = this.secondaryColor || b(this.primaryColor, { h: -120 }), this.tertiaryColor = this.tertiaryColor || b(this.primaryColor, { h: 180, l: 5 }), this.primaryBorderColor = this.primaryBorderColor || vt(this.primaryColor, this.darkMode), this.secondaryBorderColor = this.secondaryBorderColor || vt(this.secondaryColor, this.darkMode), this.tertiaryBorderColor = this.tertiaryBorderColor || vt(this.tertiaryColor, this.darkMode), this.noteBorderColor = this.noteBorderColor || vt(this.noteBkgColor, this.darkMode), this.noteBkgColor = this.noteBkgColor || "#fff5ad", this.noteTextColor = this.noteTextColor || "#FFFFFF", this.secondaryTextColor = this.secondaryTextColor || E(this.secondaryColor), this.tertiaryTextColor = this.tertiaryTextColor || E(this.tertiaryColor), this.lineColor = this.lineColor || E(this.background), this.arrowheadColor = this.arrowheadColor || E(this.background), this.textColor = this.textColor || this.primaryTextColor, this.border2 = this.border2 || this.tertiaryBorderColor, this.nodeBkg = this.nodeBkg || this.primaryColor, this.mainBkg = this.mainBkg || this.primaryColor, this.nodeBorder = this.nodeBorder || this.border1, this.clusterBkg = this.clusterBkg || this.tertiaryColor, this.clusterBorder = this.clusterBorder || this.tertiaryBorderColor, this.defaultLinkColor = this.defaultLinkColor || this.lineColor, this.titleColor = this.titleColor || this.tertiaryTextColor, this.edgeLabelBackground = this.edgeLabelBackground || (this.darkMode ? W(this.secondaryColor, 30) : this.secondaryColor), this.nodeTextColor = this.nodeTextColor || this.primaryTextColor, this.actorBorder = "#FFFFFF", this.signalColor = "#FFFFFF", this.labelBoxBorderColor = "#BDBCCC", this.actorBorder = this.actorBorder || this.primaryBorderColor, this.actorBkg = this.actorBkg || this.mainBkg, this.actorTextColor = this.actorTextColor || this.primaryTextColor, this.actorLineColor = this.actorLineColor || this.actorBorder, this.labelBoxBkgColor = this.labelBoxBkgColor || this.actorBkg, this.signalColor = this.signalColor || this.textColor, this.signalTextColor = this.signalTextColor || this.textColor, this.labelBoxBorderColor = this.labelBoxBorderColor || this.actorBorder, this.labelTextColor = this.labelTextColor || this.actorTextColor, this.loopTextColor = this.loopTextColor || this.actorTextColor, this.activationBorderColor = this.activationBorderColor || W(this.secondaryColor, 10), this.activationBkgColor = this.activationBkgColor || this.secondaryColor, this.sequenceNumberColor = this.sequenceNumberColor || E(this.lineColor), this.rectBkgColor = this.rectBkgColor || this.tertiaryColor, this.rootLabelColor = "#FFFFFF", this.sectionBkgColor = this.sectionBkgColor || this.tertiaryColor, this.altSectionBkgColor = this.altSectionBkgColor || "white", this.sectionBkgColor = this.sectionBkgColor || this.secondaryColor, this.sectionBkgColor2 = this.sectionBkgColor2 || this.primaryColor, this.excludeBkgColor = this.excludeBkgColor || "#eeeeee", this.taskBorderColor = this.taskBorderColor || this.primaryBorderColor, this.taskBkgColor = this.taskBkgColor || this.primaryColor, this.activeTaskBorderColor = this.activeTaskBorderColor || this.primaryColor, this.activeTaskBkgColor = this.activeTaskBkgColor || z(this.primaryColor, 23), this.gridColor = this.gridColor || "lightgrey", this.doneTaskBkgColor = this.doneTaskBkgColor || "lightgrey", this.doneTaskBorderColor = this.doneTaskBorderColor || "grey", this.critBorderColor = this.critBorderColor || "#ff8888", this.critBkgColor = this.critBkgColor || "red", this.todayLineColor = this.todayLineColor || "red", this.taskTextColor = this.taskTextColor || this.textColor, this.vertLineColor = this.vertLineColor || this.primaryBorderColor, this.taskTextOutsideColor = this.taskTextOutsideColor || this.textColor, this.taskTextLightColor = this.taskTextLightColor || this.textColor, this.taskTextColor = this.taskTextColor || this.primaryTextColor, this.taskTextDarkColor = this.taskTextDarkColor || this.textColor, this.taskTextClickableColor = this.taskTextClickableColor || "#003163", this.archEdgeColor = this.lineColor, this.archEdgeArrowColor = this.lineColor, this.personBorder = this.personBorder || this.primaryBorderColor, this.personBkg = this.personBkg || this.mainBkg, this.transitionColor = this.transitionColor || this.lineColor, this.transitionLabelColor = this.transitionLabelColor || this.textColor, this.stateLabelColor = this.stateLabelColor || this.stateBkg || this.primaryTextColor, this.stateBkg = this.stateBkg || this.mainBkg, this.labelBackgroundColor = this.labelBackgroundColor || this.stateBkg, this.compositeBackground = this.compositeBackground || this.background || this.tertiaryColor, this.altBackground = this.altBackground || "#f0f0f0", this.compositeTitleBackground = this.compositeTitleBackground || this.mainBkg, this.compositeBorder = this.compositeBorder || this.nodeBorder, this.innerEndBackground = this.nodeBorder, this.errorBkgColor = this.errorBkgColor || this.tertiaryColor, this.errorTextColor = this.errorTextColor || this.tertiaryTextColor, this.transitionColor = this.transitionColor || this.lineColor, this.specialStateColor = this.lineColor, this.cScale0 = this.cScale0 || "#f4a8ff", this.cScale1 = this.cScale1 || "#46ecd5", this.cScale2 = this.cScale2 || "#ffb86a", this.cScale3 = this.cScale3 || "#dab2ff", this.cScale4 = this.cScale4 || "#7bf1a8", this.cScale5 = this.cScale5 || "#c4b4ff", this.cScale6 = this.cScale6 || "#ffa2a2", this.cScale7 = this.cScale7 || "#ffdf20", this.cScale8 = this.cScale8 || "#a3b3ff", this.cScale9 = this.cScale9 || "#bbf451", this.cScale10 = this.cScale10 || "#74d4ff", this.cScale11 = this.cScale11 || "#ffa1ad";
    for (let t = 0; t < this.THEME_COLOR_LIMIT; t++)
      this["cScaleInv" + t] = this["cScaleInv" + t] || E(this["cScale" + t]);
    for (let t = 0; t < this.THEME_COLOR_LIMIT; t++)
      this.darkMode ? this["cScalePeer" + t] = this["cScalePeer" + t] || z(this["cScale" + t], 10) : this["cScalePeer" + t] = this["cScalePeer" + t] || W(this["cScale" + t], 10);
    this.scaleLabelColor = this.scaleLabelColor || this.labelTextColor;
    for (let t = 0; t < this.THEME_COLOR_LIMIT; t++)
      this["cScaleLabel" + t] = W(this["cScale" + t], 75);
    const e = this.darkMode ? -4 : -1;
    for (let t = 0; t < 5; t++)
      this["surface" + t] = this["surface" + t] || b(this.mainBkg, { h: 180, s: -15, l: e * (5 + t * 3) }), this["surfacePeer" + t] = this["surfacePeer" + t] || b(this.mainBkg, { h: 180, s: -15, l: e * (8 + t * 3) });
    this.classText = this.classText || this.textColor, this.fillType0 = this.fillType0 || this.primaryColor, this.fillType1 = this.fillType1 || this.secondaryColor, this.fillType2 = this.fillType2 || b(this.primaryColor, { h: 64 }), this.fillType3 = this.fillType3 || b(this.secondaryColor, { h: 64 }), this.fillType4 = this.fillType4 || b(this.primaryColor, { h: -64 }), this.fillType5 = this.fillType5 || b(this.secondaryColor, { h: -64 }), this.fillType6 = this.fillType6 || b(this.primaryColor, { h: 128 }), this.fillType7 = this.fillType7 || b(this.secondaryColor, { h: 128 }), this.pie1 = this.pie1 || this.primaryColor, this.pie2 = this.pie2 || this.secondaryColor, this.pie3 = this.pie3 || this.tertiaryColor, this.pie4 = this.pie4 || b(this.primaryColor, { l: -10 }), this.pie5 = this.pie5 || b(this.secondaryColor, { l: -10 }), this.pie6 = this.pie6 || b(this.tertiaryColor, { l: -10 }), this.pie7 = this.pie7 || b(this.primaryColor, { h: 60, l: -10 }), this.pie8 = this.pie8 || b(this.primaryColor, { h: -60, l: -10 }), this.pie9 = this.pie9 || b(this.primaryColor, { h: 120, l: 0 }), this.pie10 = this.pie10 || b(this.primaryColor, { h: 60, l: -20 }), this.pie11 = this.pie11 || b(this.primaryColor, { h: -60, l: -20 }), this.pie12 = this.pie12 || b(this.primaryColor, { h: 120, l: -10 }), this.pieTitleTextSize = this.pieTitleTextSize || "25px", this.pieTitleTextColor = this.pieTitleTextColor || this.taskTextDarkColor, this.pieSectionTextSize = this.pieSectionTextSize || "17px", this.pieSectionTextColor = this.pieSectionTextColor || this.textColor, this.pieLegendTextSize = this.pieLegendTextSize || "17px", this.pieLegendTextColor = this.pieLegendTextColor || this.taskTextDarkColor, this.pieStrokeColor = this.pieStrokeColor || "black", this.pieStrokeWidth = this.pieStrokeWidth || "2px", this.pieOuterStrokeWidth = this.pieOuterStrokeWidth || "2px", this.pieOuterStrokeColor = this.pieOuterStrokeColor || "black", this.pieOpacity = this.pieOpacity || "0.7", this.vennTitleTextColor = this.vennTitleTextColor ?? this.titleColor, this.vennSetTextColor = this.vennSetTextColor ?? this.textColor, this.quadrant1Fill = this.quadrant1Fill || this.primaryColor, this.quadrant2Fill = this.quadrant2Fill || b(this.primaryColor, { r: 5, g: 5, b: 5 }), this.quadrant3Fill = this.quadrant3Fill || b(this.primaryColor, { r: 10, g: 10, b: 10 }), this.quadrant4Fill = this.quadrant4Fill || b(this.primaryColor, { r: 15, g: 15, b: 15 }), this.quadrant1TextFill = this.quadrant1TextFill || this.primaryTextColor, this.quadrant2TextFill = this.quadrant2TextFill || b(this.primaryTextColor, { r: -5, g: -5, b: -5 }), this.quadrant3TextFill = this.quadrant3TextFill || b(this.primaryTextColor, { r: -10, g: -10, b: -10 }), this.quadrant4TextFill = this.quadrant4TextFill || b(this.primaryTextColor, { r: -15, g: -15, b: -15 }), this.quadrantPointFill = this.quadrantPointFill || Ge(this.quadrant1Fill) ? z(this.quadrant1Fill) : W(this.quadrant1Fill), this.quadrantPointTextFill = this.quadrantPointTextFill || this.primaryTextColor, this.quadrantXAxisTextFill = this.quadrantXAxisTextFill || this.primaryTextColor, this.quadrantYAxisTextFill = this.quadrantYAxisTextFill || this.primaryTextColor, this.quadrantInternalBorderStrokeFill = this.quadrantInternalBorderStrokeFill || this.primaryBorderColor, this.quadrantExternalBorderStrokeFill = this.quadrantExternalBorderStrokeFill || this.primaryBorderColor, this.quadrantTitleFill = this.quadrantTitleFill || this.primaryTextColor, this.xyChart = {
      backgroundColor: this.xyChart?.backgroundColor || this.background,
      titleColor: this.xyChart?.titleColor || this.primaryTextColor,
      legendTextColor: this.xyChart?.legendTextColor || this.primaryTextColor,
      xAxisTitleColor: this.xyChart?.xAxisTitleColor || this.primaryTextColor,
      xAxisLabelColor: this.xyChart?.xAxisLabelColor || this.primaryTextColor,
      xAxisTickColor: this.xyChart?.xAxisTickColor || this.primaryTextColor,
      xAxisLineColor: this.xyChart?.xAxisLineColor || this.primaryTextColor,
      yAxisTitleColor: this.xyChart?.yAxisTitleColor || this.primaryTextColor,
      yAxisLabelColor: this.xyChart?.yAxisLabelColor || this.primaryTextColor,
      yAxisTickColor: this.xyChart?.yAxisTickColor || this.primaryTextColor,
      yAxisLineColor: this.xyChart?.yAxisLineColor || this.primaryTextColor,
      plotColorPalette: this.xyChart?.plotColorPalette || "#FFF4DD,#FFD8B1,#FFA07A,#ECEFF1,#D6DBDF,#C3E0A8,#FFB6A4,#FFD74D,#738FA7,#FFFFF0"
    }, this.requirementBackground = this.requirementBackground || this.primaryColor, this.requirementBorderColor = this.requirementBorderColor || this.primaryBorderColor, this.requirementBorderSize = this.requirementBorderSize || "1", this.requirementTextColor = this.requirementTextColor || this.primaryTextColor, this.relationColor = this.relationColor || this.lineColor, this.relationLabelBackground = this.relationLabelBackground || (this.darkMode ? W(this.secondaryColor, 30) : this.secondaryColor), this.relationLabelColor = this.relationLabelColor || this.actorTextColor, this.git0 = this.git0 || this.primaryColor, this.git1 = this.git1 || this.secondaryColor, this.git2 = this.git2 || this.tertiaryColor, this.git3 = this.git3 || b(this.primaryColor, { h: -30 }), this.git4 = this.git4 || b(this.primaryColor, { h: -60 }), this.git5 = this.git5 || b(this.primaryColor, { h: -90 }), this.git6 = this.git6 || b(this.primaryColor, { h: 60 }), this.git7 = this.git7 || b(this.primaryColor, { h: 120 }), this.darkMode ? (this.git0 = z(this.git0, 25), this.git1 = z(this.git1, 25), this.git2 = z(this.git2, 25), this.git3 = z(this.git3, 25), this.git4 = z(this.git4, 25), this.git5 = z(this.git5, 25), this.git6 = z(this.git6, 25), this.git7 = z(this.git7, 25)) : (this.git0 = W(this.git0, 25), this.git1 = W(this.git1, 25), this.git2 = W(this.git2, 25), this.git3 = W(this.git3, 25), this.git4 = W(this.git4, 25), this.git5 = W(this.git5, 25), this.git6 = W(this.git6, 25), this.git7 = W(this.git7, 25)), this.gitInv0 = this.gitInv0 || E(this.git0), this.gitInv1 = this.gitInv1 || E(this.git1), this.gitInv2 = this.gitInv2 || E(this.git2), this.gitInv3 = this.gitInv3 || E(this.git3), this.gitInv4 = this.gitInv4 || E(this.git4), this.gitInv5 = this.gitInv5 || E(this.git5), this.gitInv6 = this.gitInv6 || E(this.git6), this.gitInv7 = this.gitInv7 || E(this.git7), this.branchLabelColor = this.branchLabelColor || (this.darkMode ? "black" : this.labelTextColor), this.gitBranchLabel0 = this.gitBranchLabel0 || this.branchLabelColor, this.gitBranchLabel1 = this.gitBranchLabel1 || this.branchLabelColor, this.gitBranchLabel2 = this.gitBranchLabel2 || this.branchLabelColor, this.gitBranchLabel3 = this.gitBranchLabel3 || this.branchLabelColor, this.gitBranchLabel4 = this.gitBranchLabel4 || this.branchLabelColor, this.gitBranchLabel5 = this.gitBranchLabel5 || this.branchLabelColor, this.gitBranchLabel6 = this.gitBranchLabel6 || this.branchLabelColor, this.gitBranchLabel7 = this.gitBranchLabel7 || this.branchLabelColor, this.tagLabelColor = this.tagLabelColor || this.primaryTextColor, this.tagLabelBackground = this.tagLabelBackground || this.primaryColor, this.tagLabelBorder = this.tagBorder || this.primaryBorderColor, this.tagLabelFontSize = this.tagLabelFontSize || "10px", this.commitLabelColor = this.commitLabelColor || this.secondaryTextColor, this.commitLabelBackground = this.commitLabelBackground || this.secondaryColor, this.commitLabelFontSize = this.commitLabelFontSize || "10px", this.commitLineColor = this.commitLineColor ?? "#BDBCCC", this.fontWeight = 600, this.erEdgeLabelBackground = "#16141F", this.attributeBackgroundColorOdd = this.attributeBackgroundColorOdd || lr, this.attributeBackgroundColorEven = this.attributeBackgroundColorEven || hr;
  }
  calculate(e) {
    if (typeof e != "object") {
      this.updateColors();
      return;
    }
    const t = Object.keys(e);
    t.forEach((r) => {
      this[r] = e[r];
    }), this.updateColors(), t.forEach((r) => {
      this[r] = e[r];
    });
  }
}, yC = /* @__PURE__ */ p((e) => {
  const t = new mC();
  return t.calculate(e), t;
}, "getThemeVariables"), kr = {
  base: {
    getThemeVariables: Kx
  },
  dark: {
    getThemeVariables: Jx
  },
  default: {
    getThemeVariables: eC
  },
  forest: {
    getThemeVariables: iC
  },
  neutral: {
    getThemeVariables: oC
  },
  neo: {
    getThemeVariables: nC
  },
  "neo-dark": {
    getThemeVariables: hC
  },
  redux: {
    getThemeVariables: uC
  },
  "redux-dark": {
    getThemeVariables: fC
  },
  "redux-color": {
    getThemeVariables: gC
  },
  "redux-dark-color": {
    getThemeVariables: yC
  }
}, le = {
  flowchart: {
    useMaxWidth: !0,
    titleTopMargin: 25,
    subGraphTitleMargin: {
      top: 0,
      bottom: 0
    },
    diagramPadding: 8,
    htmlLabels: null,
    nodeSpacing: 50,
    rankSpacing: 50,
    curve: "basis",
    padding: 15,
    defaultRenderer: "dagre-wrapper",
    wrappingWidth: 200,
    inheritDir: !1
  },
  swimlane: {
    useMaxWidth: !0,
    lineHops: "arc",
    ignoreCrossLaneEdges: !0,
    optimizeRanksByCrossings: !0,
    automaticLaneOrdering: !1
  },
  sequence: {
    useMaxWidth: !0,
    hideUnusedParticipants: !1,
    activationWidth: 10,
    diagramMarginX: 50,
    diagramMarginY: 10,
    actorMargin: 50,
    width: 150,
    height: 65,
    boxMargin: 10,
    boxTextMargin: 5,
    noteMargin: 10,
    messageMargin: 35,
    messageAlign: "center",
    mirrorActors: !0,
    forceMenus: !1,
    bottomMarginAdj: 1,
    rightAngles: !1,
    showSequenceNumbers: !1,
    actorFontSize: 14,
    actorFontFamily: '"Open Sans", sans-serif',
    actorFontWeight: 400,
    noteFontSize: 14,
    noteFontFamily: '"trebuchet ms", verdana, arial, sans-serif',
    noteFontWeight: 400,
    noteAlign: "center",
    messageFontSize: 16,
    messageFontFamily: '"trebuchet ms", verdana, arial, sans-serif',
    messageFontWeight: 400,
    wrap: !1,
    wrapPadding: 10,
    labelBoxWidth: 50,
    labelBoxHeight: 20
  },
  gantt: {
    useMaxWidth: !0,
    titleTopMargin: 25,
    barHeight: 20,
    barGap: 4,
    topPadding: 50,
    rightPadding: 75,
    leftPadding: 75,
    gridLineStartPadding: 35,
    fontSize: 11,
    sectionFontSize: 11,
    numberSectionStyles: 4,
    axisFormat: "%Y-%m-%d",
    topAxis: !1,
    displayMode: "",
    weekday: "sunday"
  },
  journey: {
    useMaxWidth: !0,
    diagramMarginX: 50,
    diagramMarginY: 10,
    leftMargin: 150,
    maxLabelWidth: 360,
    width: 150,
    height: 50,
    boxMargin: 10,
    boxTextMargin: 5,
    noteMargin: 10,
    messageMargin: 35,
    messageAlign: "center",
    bottomMarginAdj: 1,
    rightAngles: !1,
    taskFontSize: 14,
    taskFontFamily: '"Open Sans", sans-serif',
    taskMargin: 50,
    activationWidth: 10,
    textPlacement: "fo",
    actorColours: [
      "#8FBC8F",
      "#7CFC00",
      "#00FFFF",
      "#20B2AA",
      "#B0E0E6",
      "#FFFFE0"
    ],
    sectionFills: [
      "#191970",
      "#8B008B",
      "#4B0082",
      "#2F4F4F",
      "#800000",
      "#8B4513",
      "#00008B"
    ],
    sectionColours: [
      "#fff"
    ],
    titleColor: "",
    titleFontFamily: '"trebuchet ms", verdana, arial, sans-serif',
    titleFontSize: "4ex"
  },
  class: {
    useMaxWidth: !0,
    titleTopMargin: 25,
    arrowMarkerAbsolute: !1,
    dividerMargin: 10,
    padding: 5,
    textHeight: 10,
    defaultRenderer: "dagre-wrapper",
    htmlLabels: !1,
    hideEmptyMembersBox: !1,
    hierarchicalNamespaces: !0
  },
  state: {
    useMaxWidth: !0,
    titleTopMargin: 25,
    dividerMargin: 10,
    sizeUnit: 5,
    padding: 8,
    textHeight: 10,
    titleShift: -15,
    noteMargin: 10,
    forkWidth: 70,
    forkHeight: 7,
    miniPadding: 2,
    fontSizeFactor: 5.02,
    fontSize: 24,
    labelHeight: 16,
    edgeLengthFactor: "20",
    compositTitleSize: 35,
    radius: 5,
    defaultRenderer: "dagre-wrapper"
  },
  er: {
    useMaxWidth: !0,
    titleTopMargin: 25,
    diagramPadding: 20,
    layoutDirection: "TB",
    minEntityWidth: 100,
    minEntityHeight: 75,
    entityPadding: 15,
    nodeSpacing: 140,
    rankSpacing: 80,
    stroke: "gray",
    fill: "honeydew",
    fontSize: 12
  },
  pie: {
    useMaxWidth: !0,
    textPosition: 0.75,
    donutHole: 0,
    legendPosition: "right",
    highlightSlice: ""
  },
  quadrantChart: {
    useMaxWidth: !0,
    chartWidth: 500,
    chartHeight: 500,
    titleFontSize: 20,
    titlePadding: 10,
    quadrantPadding: 5,
    xAxisLabelPadding: 5,
    yAxisLabelPadding: 5,
    xAxisLabelFontSize: 16,
    yAxisLabelFontSize: 16,
    quadrantLabelFontSize: 16,
    quadrantTextTopPadding: 5,
    pointTextPadding: 5,
    pointLabelFontSize: 12,
    pointRadius: 5,
    xAxisPosition: "top",
    yAxisPosition: "left",
    quadrantInternalBorderStrokeWidth: 1,
    quadrantExternalBorderStrokeWidth: 2
  },
  xyChart: {
    useMaxWidth: !0,
    width: 700,
    height: 500,
    titleFontSize: 20,
    titlePadding: 10,
    showDataLabel: !1,
    showDataLabelOutsideBar: !1,
    showTitle: !0,
    showLegend: !0,
    legendFontSize: 14,
    legendPadding: 10,
    xAxis: {
      $ref: "#/$defs/XYChartAxisConfig",
      showLabel: !0,
      labelFontSize: 14,
      labelPadding: 5,
      showTitle: !0,
      titleFontSize: 16,
      titlePadding: 5,
      showTick: !0,
      tickLength: 5,
      tickWidth: 2,
      showAxisLine: !0,
      axisLineWidth: 2,
      labelRotation: 0
    },
    yAxis: {
      $ref: "#/$defs/XYChartAxisConfig",
      showLabel: !0,
      labelFontSize: 14,
      labelPadding: 5,
      showTitle: !0,
      titleFontSize: 16,
      titlePadding: 5,
      showTick: !0,
      tickLength: 5,
      tickWidth: 2,
      showAxisLine: !0,
      axisLineWidth: 2,
      labelRotation: 0
    },
    chartOrientation: "vertical",
    plotReservedSpacePercent: 50
  },
  requirement: {
    useMaxWidth: !0,
    rect_fill: "#f9f9f9",
    text_color: "#333",
    rect_border_size: "0.5px",
    rect_border_color: "#bbb",
    rect_min_width: 200,
    rect_min_height: 200,
    fontSize: 14,
    rect_padding: 10,
    line_height: 20
  },
  mindmap: {
    useMaxWidth: !0,
    padding: 10,
    maxNodeWidth: 200,
    layoutAlgorithm: "cose-bilkent"
  },
  ishikawa: {
    useMaxWidth: !0,
    diagramPadding: 20
  },
  kanban: {
    useMaxWidth: !0,
    padding: 8,
    sectionWidth: 200,
    ticketBaseUrl: ""
  },
  timeline: {
    useMaxWidth: !0,
    diagramMarginX: 50,
    diagramMarginY: 10,
    leftMargin: 150,
    width: 150,
    height: 50,
    boxMargin: 10,
    boxTextMargin: 5,
    noteMargin: 10,
    messageMargin: 35,
    messageAlign: "center",
    bottomMarginAdj: 1,
    rightAngles: !1,
    taskFontSize: 14,
    taskFontFamily: '"Open Sans", sans-serif',
    taskMargin: 50,
    activationWidth: 10,
    textPlacement: "fo",
    actorColours: [
      "#8FBC8F",
      "#7CFC00",
      "#00FFFF",
      "#20B2AA",
      "#B0E0E6",
      "#FFFFE0"
    ],
    sectionFills: [
      "#191970",
      "#8B008B",
      "#4B0082",
      "#2F4F4F",
      "#800000",
      "#8B4513",
      "#00008B"
    ],
    sectionColours: [
      "#fff"
    ],
    disableMulticolor: !1
  },
  gitGraph: {
    useMaxWidth: !0,
    titleTopMargin: 25,
    diagramPadding: 8,
    nodeLabel: {
      width: 75,
      height: 100,
      x: -25,
      y: 0
    },
    mainBranchName: "main",
    mainBranchOrder: 0,
    showCommitLabel: !0,
    showBranches: !0,
    rotateCommitLabel: !0,
    parallelCommits: !1,
    arrowMarkerAbsolute: !1
  },
  c4: {
    useMaxWidth: !0,
    diagramMarginX: 50,
    diagramMarginY: 10,
    c4ShapeMargin: 50,
    c4ShapePadding: 20,
    width: 216,
    height: 60,
    boxMargin: 10,
    c4ShapeInRow: 4,
    nextLinePaddingX: 0,
    c4BoundaryInRow: 2,
    personFontSize: 14,
    personFontFamily: '"Open Sans", sans-serif',
    personFontWeight: "normal",
    external_personFontSize: 14,
    external_personFontFamily: '"Open Sans", sans-serif',
    external_personFontWeight: "normal",
    systemFontSize: 14,
    systemFontFamily: '"Open Sans", sans-serif',
    systemFontWeight: "normal",
    external_systemFontSize: 14,
    external_systemFontFamily: '"Open Sans", sans-serif',
    external_systemFontWeight: "normal",
    system_dbFontSize: 14,
    system_dbFontFamily: '"Open Sans", sans-serif',
    system_dbFontWeight: "normal",
    external_system_dbFontSize: 14,
    external_system_dbFontFamily: '"Open Sans", sans-serif',
    external_system_dbFontWeight: "normal",
    system_queueFontSize: 14,
    system_queueFontFamily: '"Open Sans", sans-serif',
    system_queueFontWeight: "normal",
    external_system_queueFontSize: 14,
    external_system_queueFontFamily: '"Open Sans", sans-serif',
    external_system_queueFontWeight: "normal",
    boundaryFontSize: 14,
    boundaryFontFamily: '"Open Sans", sans-serif',
    boundaryFontWeight: "normal",
    messageFontSize: 12,
    messageFontFamily: '"Open Sans", sans-serif',
    messageFontWeight: "normal",
    containerFontSize: 14,
    containerFontFamily: '"Open Sans", sans-serif',
    containerFontWeight: "normal",
    external_containerFontSize: 14,
    external_containerFontFamily: '"Open Sans", sans-serif',
    external_containerFontWeight: "normal",
    container_dbFontSize: 14,
    container_dbFontFamily: '"Open Sans", sans-serif',
    container_dbFontWeight: "normal",
    external_container_dbFontSize: 14,
    external_container_dbFontFamily: '"Open Sans", sans-serif',
    external_container_dbFontWeight: "normal",
    container_queueFontSize: 14,
    container_queueFontFamily: '"Open Sans", sans-serif',
    container_queueFontWeight: "normal",
    external_container_queueFontSize: 14,
    external_container_queueFontFamily: '"Open Sans", sans-serif',
    external_container_queueFontWeight: "normal",
    componentFontSize: 14,
    componentFontFamily: '"Open Sans", sans-serif',
    componentFontWeight: "normal",
    external_componentFontSize: 14,
    external_componentFontFamily: '"Open Sans", sans-serif',
    external_componentFontWeight: "normal",
    component_dbFontSize: 14,
    component_dbFontFamily: '"Open Sans", sans-serif',
    component_dbFontWeight: "normal",
    external_component_dbFontSize: 14,
    external_component_dbFontFamily: '"Open Sans", sans-serif',
    external_component_dbFontWeight: "normal",
    component_queueFontSize: 14,
    component_queueFontFamily: '"Open Sans", sans-serif',
    component_queueFontWeight: "normal",
    external_component_queueFontSize: 14,
    external_component_queueFontFamily: '"Open Sans", sans-serif',
    external_component_queueFontWeight: "normal",
    wrap: !0,
    wrapPadding: 10,
    person_bg_color: "#08427B",
    person_border_color: "#073B6F",
    external_person_bg_color: "#686868",
    external_person_border_color: "#8A8A8A",
    system_bg_color: "#1168BD",
    system_border_color: "#3C7FC0",
    system_db_bg_color: "#1168BD",
    system_db_border_color: "#3C7FC0",
    system_queue_bg_color: "#1168BD",
    system_queue_border_color: "#3C7FC0",
    external_system_bg_color: "#999999",
    external_system_border_color: "#8A8A8A",
    external_system_db_bg_color: "#999999",
    external_system_db_border_color: "#8A8A8A",
    external_system_queue_bg_color: "#999999",
    external_system_queue_border_color: "#8A8A8A",
    container_bg_color: "#438DD5",
    container_border_color: "#3C7FC0",
    container_db_bg_color: "#438DD5",
    container_db_border_color: "#3C7FC0",
    container_queue_bg_color: "#438DD5",
    container_queue_border_color: "#3C7FC0",
    external_container_bg_color: "#B3B3B3",
    external_container_border_color: "#A6A6A6",
    external_container_db_bg_color: "#B3B3B3",
    external_container_db_border_color: "#A6A6A6",
    external_container_queue_bg_color: "#B3B3B3",
    external_container_queue_border_color: "#A6A6A6",
    component_bg_color: "#85BBF0",
    component_border_color: "#78A8D8",
    component_db_bg_color: "#85BBF0",
    component_db_border_color: "#78A8D8",
    component_queue_bg_color: "#85BBF0",
    component_queue_border_color: "#78A8D8",
    external_component_bg_color: "#CCCCCC",
    external_component_border_color: "#BFBFBF",
    external_component_db_bg_color: "#CCCCCC",
    external_component_db_border_color: "#BFBFBF",
    external_component_queue_bg_color: "#CCCCCC",
    external_component_queue_border_color: "#BFBFBF"
  },
  sankey: {
    useMaxWidth: !0,
    width: 600,
    height: 400,
    linkColor: "gradient",
    nodeAlignment: "justify",
    showValues: !0,
    prefix: "",
    suffix: "",
    nodeWidth: 10,
    nodePadding: 12,
    labelStyle: "legacy"
  },
  block: {
    useMaxWidth: !0,
    padding: 8
  },
  packet: {
    useMaxWidth: !0,
    rowHeight: 32,
    bitWidth: 32,
    bitsPerRow: 32,
    showBits: !0,
    paddingX: 5,
    paddingY: 5
  },
  treeView: {
    useMaxWidth: !0,
    rowIndent: 10,
    paddingX: 5,
    paddingY: 5,
    lineThickness: 1,
    showIcons: !1,
    defaultIconPack: "",
    filenameIcons: {},
    extensionIcons: {}
  },
  architecture: {
    useMaxWidth: !0,
    padding: 40,
    iconSize: 80,
    fontSize: 16,
    randomize: !1,
    nodeSeparation: 75,
    idealEdgeLengthMultiplier: 1.5,
    edgeElasticity: 0.45,
    numIter: 2500,
    seed: 1
  },
  eventmodeling: {
    useMaxWidth: !0,
    padding: 30,
    rowHeight: 32
  },
  radar: {
    useMaxWidth: !0,
    width: 600,
    height: 600,
    marginTop: 50,
    marginRight: 50,
    marginBottom: 50,
    marginLeft: 50,
    axisScaleFactor: 1,
    axisLabelFactor: 1.05,
    curveTension: 0.17
  },
  venn: {
    useMaxWidth: !0,
    width: 800,
    height: 450,
    padding: 8,
    useDebugLayout: !1
  },
  cynefin: {
    useMaxWidth: !0,
    width: 800,
    height: 600,
    padding: 40,
    showDomainDescriptions: !0,
    boundaryAmplitude: 8,
    seed: 0
  },
  theme: "default",
  look: "classic",
  handDrawnSeed: 0,
  layout: "dagre",
  maxTextSize: 5e4,
  maxEdges: 500,
  darkMode: !1,
  fontFamily: '"trebuchet ms", verdana, arial, sans-serif;',
  logLevel: 5,
  securityLevel: "strict",
  startOnLoad: !0,
  arrowMarkerAbsolute: !1,
  secure: [
    "secure",
    "securityLevel",
    "startOnLoad",
    "maxTextSize",
    "suppressErrorRendering",
    "maxEdges"
  ],
  legacyMathML: !1,
  forceLegacyMathML: !1,
  deterministicIds: !1,
  fontSize: 16,
  markdownAutoWrap: !0,
  suppressErrorRendering: !1
}, sf = {
  ...le,
  // Set, even though they're `undefined` so that `configKeys` finds these keys
  // TODO: Should we replace these with `null` so that they can go in the JSON Schema?
  deterministicIDSeed: void 0,
  elk: {
    // mergeEdges is needed here to be considered
    mergeEdges: !1,
    nodePlacementStrategy: "BRANDES_KOEPF",
    nodePlacementAlignment: "NONE",
    forceNodeModelOrder: !1,
    considerModelOrder: "NODES_AND_EDGES",
    keepEntryNodeOnTop: !1
  },
  themeCSS: void 0,
  // add non-JSON default config values
  themeVariables: kr.default.getThemeVariables(),
  sequence: {
    ...le.sequence,
    messageFont: /* @__PURE__ */ p(function() {
      return {
        fontFamily: this.messageFontFamily,
        fontSize: this.messageFontSize,
        fontWeight: this.messageFontWeight
      };
    }, "messageFont"),
    noteFont: /* @__PURE__ */ p(function() {
      return {
        fontFamily: this.noteFontFamily,
        fontSize: this.noteFontSize,
        fontWeight: this.noteFontWeight
      };
    }, "noteFont"),
    actorFont: /* @__PURE__ */ p(function() {
      return {
        fontFamily: this.actorFontFamily,
        fontSize: this.actorFontSize,
        fontWeight: this.actorFontWeight
      };
    }, "actorFont")
  },
  class: {
    defaultRenderer: "dagre-wrapper",
    hideEmptyMembersBox: !1,
    hierarchicalNamespaces: !0
    // `padding` is intentionally left undefined so the unified (v2) renderer keeps
    // its own node sizing — setting the schema default of 5 here would change class
    // node dimensions.
  },
  gantt: {
    ...le.gantt,
    tickInterval: void 0,
    useWidth: void 0
    // can probably be removed since `configKeys` already includes this
  },
  c4: {
    ...le.c4,
    useWidth: void 0,
    personFont: /* @__PURE__ */ p(function() {
      return {
        fontFamily: this.personFontFamily,
        fontSize: this.personFontSize,
        fontWeight: this.personFontWeight
      };
    }, "personFont"),
    flowchart: {
      ...le.flowchart,
      inheritDir: !1
      // default to legacy behavior
    },
    external_personFont: /* @__PURE__ */ p(function() {
      return {
        fontFamily: this.external_personFontFamily,
        fontSize: this.external_personFontSize,
        fontWeight: this.external_personFontWeight
      };
    }, "external_personFont"),
    systemFont: /* @__PURE__ */ p(function() {
      return {
        fontFamily: this.systemFontFamily,
        fontSize: this.systemFontSize,
        fontWeight: this.systemFontWeight
      };
    }, "systemFont"),
    external_systemFont: /* @__PURE__ */ p(function() {
      return {
        fontFamily: this.external_systemFontFamily,
        fontSize: this.external_systemFontSize,
        fontWeight: this.external_systemFontWeight
      };
    }, "external_systemFont"),
    system_dbFont: /* @__PURE__ */ p(function() {
      return {
        fontFamily: this.system_dbFontFamily,
        fontSize: this.system_dbFontSize,
        fontWeight: this.system_dbFontWeight
      };
    }, "system_dbFont"),
    external_system_dbFont: /* @__PURE__ */ p(function() {
      return {
        fontFamily: this.external_system_dbFontFamily,
        fontSize: this.external_system_dbFontSize,
        fontWeight: this.external_system_dbFontWeight
      };
    }, "external_system_dbFont"),
    system_queueFont: /* @__PURE__ */ p(function() {
      return {
        fontFamily: this.system_queueFontFamily,
        fontSize: this.system_queueFontSize,
        fontWeight: this.system_queueFontWeight
      };
    }, "system_queueFont"),
    external_system_queueFont: /* @__PURE__ */ p(function() {
      return {
        fontFamily: this.external_system_queueFontFamily,
        fontSize: this.external_system_queueFontSize,
        fontWeight: this.external_system_queueFontWeight
      };
    }, "external_system_queueFont"),
    containerFont: /* @__PURE__ */ p(function() {
      return {
        fontFamily: this.containerFontFamily,
        fontSize: this.containerFontSize,
        fontWeight: this.containerFontWeight
      };
    }, "containerFont"),
    external_containerFont: /* @__PURE__ */ p(function() {
      return {
        fontFamily: this.external_containerFontFamily,
        fontSize: this.external_containerFontSize,
        fontWeight: this.external_containerFontWeight
      };
    }, "external_containerFont"),
    container_dbFont: /* @__PURE__ */ p(function() {
      return {
        fontFamily: this.container_dbFontFamily,
        fontSize: this.container_dbFontSize,
        fontWeight: this.container_dbFontWeight
      };
    }, "container_dbFont"),
    external_container_dbFont: /* @__PURE__ */ p(function() {
      return {
        fontFamily: this.external_container_dbFontFamily,
        fontSize: this.external_container_dbFontSize,
        fontWeight: this.external_container_dbFontWeight
      };
    }, "external_container_dbFont"),
    container_queueFont: /* @__PURE__ */ p(function() {
      return {
        fontFamily: this.container_queueFontFamily,
        fontSize: this.container_queueFontSize,
        fontWeight: this.container_queueFontWeight
      };
    }, "container_queueFont"),
    external_container_queueFont: /* @__PURE__ */ p(function() {
      return {
        fontFamily: this.external_container_queueFontFamily,
        fontSize: this.external_container_queueFontSize,
        fontWeight: this.external_container_queueFontWeight
      };
    }, "external_container_queueFont"),
    componentFont: /* @__PURE__ */ p(function() {
      return {
        fontFamily: this.componentFontFamily,
        fontSize: this.componentFontSize,
        fontWeight: this.componentFontWeight
      };
    }, "componentFont"),
    external_componentFont: /* @__PURE__ */ p(function() {
      return {
        fontFamily: this.external_componentFontFamily,
        fontSize: this.external_componentFontSize,
        fontWeight: this.external_componentFontWeight
      };
    }, "external_componentFont"),
    component_dbFont: /* @__PURE__ */ p(function() {
      return {
        fontFamily: this.component_dbFontFamily,
        fontSize: this.component_dbFontSize,
        fontWeight: this.component_dbFontWeight
      };
    }, "component_dbFont"),
    external_component_dbFont: /* @__PURE__ */ p(function() {
      return {
        fontFamily: this.external_component_dbFontFamily,
        fontSize: this.external_component_dbFontSize,
        fontWeight: this.external_component_dbFontWeight
      };
    }, "external_component_dbFont"),
    component_queueFont: /* @__PURE__ */ p(function() {
      return {
        fontFamily: this.component_queueFontFamily,
        fontSize: this.component_queueFontSize,
        fontWeight: this.component_queueFontWeight
      };
    }, "component_queueFont"),
    external_component_queueFont: /* @__PURE__ */ p(function() {
      return {
        fontFamily: this.external_component_queueFontFamily,
        fontSize: this.external_component_queueFontSize,
        fontWeight: this.external_component_queueFontWeight
      };
    }, "external_component_queueFont"),
    boundaryFont: /* @__PURE__ */ p(function() {
      return {
        fontFamily: this.boundaryFontFamily,
        fontSize: this.boundaryFontSize,
        fontWeight: this.boundaryFontWeight
      };
    }, "boundaryFont"),
    messageFont: /* @__PURE__ */ p(function() {
      return {
        fontFamily: this.messageFontFamily,
        fontSize: this.messageFontSize,
        fontWeight: this.messageFontWeight
      };
    }, "messageFont")
  },
  pie: {
    ...le.pie,
    useWidth: 984
  },
  xyChart: {
    ...le.xyChart,
    useWidth: void 0
  },
  requirement: {
    ...le.requirement,
    useWidth: void 0
  },
  packet: {
    ...le.packet
  },
  eventmodeling: {
    ...le.eventmodeling
  },
  treeView: {
    ...le.treeView,
    useWidth: void 0
  },
  radar: {
    ...le.radar
  },
  railroad: {
    ...le.railroad,
    // Railroad colors and typography derive from the active theme unless explicitly overridden.
    fontSize: void 0,
    fontFamily: void 0,
    terminalFill: void 0,
    terminalStroke: void 0,
    terminalTextColor: void 0,
    nonTerminalFill: void 0,
    nonTerminalStroke: void 0,
    nonTerminalTextColor: void 0,
    lineColor: void 0,
    markerFill: void 0,
    commentFill: void 0,
    commentStroke: void 0,
    commentTextColor: void 0,
    specialFill: void 0,
    specialStroke: void 0,
    ruleNameColor: void 0
  },
  ishikawa: {
    ...le.ishikawa
  },
  sankey: {
    ...le.sankey,
    // Set so that `configKeys` includes this key for sanitizeDirective
    nodeColors: void 0
  },
  treemap: {
    useMaxWidth: !0,
    padding: 10,
    diagramPadding: 8,
    showValues: !0,
    nodeWidth: 100,
    nodeHeight: 40,
    borderWidth: 1,
    valueFontSize: 12,
    labelFontSize: 14,
    valueFormat: ","
  },
  venn: {
    ...le.venn
  },
  cynefin: {
    ...le.cynefin
  }
}, of = /* @__PURE__ */ p((e, t = "") => Object.keys(e).reduce((r, i) => Array.isArray(e[i]) ? r : typeof e[i] == "object" && e[i] !== null ? [...r, t + i, ...of(e[i], "")] : [...r, t + i], []), "keyify"), xC = new Set(of(sf, "")), af = sf, CC = {
  // CSS colors (sankey)
  nodeColors: /^#[\da-f]{3,8}$|^rgb\([\d\s%,.]+\)$|^hsl\([\d\s%,.]+\)$|^[a-z]+$/i,
  // iconify icon references (treeView filenameIcons/extensionIcons)
  filenameIcons: /^[\w-]+(?::[\w-]+)?$/,
  extensionIcons: /^[\w-]+(?::[\w-]+)?$/
}, bC = /* @__PURE__ */ p((e, t) => {
  for (const r of Object.keys(e)) {
    const i = e[r];
    (r.startsWith("__") || r.includes("proto") || r.includes("constr") || typeof i != "string" || !t.test(i)) && (R.debug("sanitize deleting dictionary entry:", r, i), delete e[r]);
  }
}, "sanitizeDictionaryConfig"), So = /* @__PURE__ */ p((e) => {
  if (R.debug("sanitizeDirective called with", e), !(typeof e != "object" || e == null)) {
    if (Array.isArray(e)) {
      e.forEach((t) => So(t));
      return;
    }
    for (const t of Object.keys(e)) {
      if (R.debug("Checking key", t), t.startsWith("__") || t.includes("proto") || t.includes("constr") || !xC.has(t) || e[t] == null) {
        R.debug("sanitize deleting key: ", t), delete e[t];
        continue;
      }
      if (typeof e[t] == "object") {
        const i = CC[t];
        i ? bC(e[t], i) : (R.debug("sanitizing object", t), So(e[t]));
        continue;
      }
      const r = ["themeCSS", "fontFamily", "altFontFamily"];
      for (const i of r)
        t.includes(i) && (R.debug("sanitizing css option", t), e[t] = nf(e[t]));
    }
    if (e.themeVariables)
      for (const t of Object.keys(e.themeVariables)) {
        const r = e.themeVariables[t];
        r?.match && !r.match(/^[\d "#%(),.;A-Za-z]+$/) && (e.themeVariables[t] = "");
      }
    R.debug("After sanitization", e);
  }
}, "sanitizeDirective"), nf = /* @__PURE__ */ p((e) => {
  let t = 0, r = 0;
  for (const i of e) {
    if (t < r)
      return "{ /* ERROR: Unbalanced CSS */ }";
    i === "{" ? t++ : i === "}" && r++;
  }
  return t !== r ? "{ /* ERROR: Unbalanced CSS */ }" : e;
}, "sanitizeCss"), $i = Object.freeze(af), cr = /* @__PURE__ */ p((e) => !(e === !1 || ["false", "null", "0"].includes(String(e).trim().toLowerCase())), "evaluate"), ve = se({}, $i), _o, ei = [], ys = se({}, $i), Os = /* @__PURE__ */ p((e, t) => {
  let r = se({}, e), i = {};
  for (const s of t)
    cf(s), i = se(i, s);
  if (r = se(r, i), i.theme && i.theme in kr) {
    const s = se({}, _o), o = se(
      s.themeVariables || {},
      i.themeVariables
    );
    r.theme && r.theme in kr && (r.themeVariables = kr[r.theme].getThemeVariables(o));
  }
  return ys = r, vC(ys), ys;
}, "updateCurrentConfig"), kC = /* @__PURE__ */ p((e) => (ve = se({}, $i), ve = se(ve, e), e.theme && kr[e.theme] && (ve.themeVariables = kr[e.theme].getThemeVariables(e.themeVariables)), Os(ve, ei), ve), "setSiteConfig"), wC = /* @__PURE__ */ p((e) => {
  _o = se({}, e);
}, "saveConfigFromInitialize"), TC = /* @__PURE__ */ p((e) => (ve = se(ve, e), Os(ve, ei), ve), "updateSiteConfig"), lf = /* @__PURE__ */ p(() => se({}, ve), "getSiteConfig"), hf = /* @__PURE__ */ p((e) => (Os(ys, [e]), Xt()), "setConfig"), Xt = /* @__PURE__ */ p(() => se({}, ys), "getConfig"), cf = /* @__PURE__ */ p((e) => {
  e && (["secure", ...ve.secure ?? []].forEach((t) => {
    Object.hasOwn(e, t) && (R.debug(`Denied attempt to modify a secure key ${t}`, e[t]), delete e[t]);
  }), Object.keys(e).forEach((t) => {
    t.startsWith("__") && delete e[t];
  }), Object.keys(e).forEach((t) => {
    typeof e[t] == "string" && (e[t].includes("<") || e[t].includes(">") || e[t].includes("url(data:")) && delete e[t], typeof e[t] == "object" && cf(e[t]);
  }));
}, "sanitize"), SC = /* @__PURE__ */ p((e) => {
  So(e), e.fontFamily && !e.themeVariables?.fontFamily && (e.themeVariables = {
    ...e.themeVariables,
    fontFamily: e.fontFamily
  }), ei.push(e), Os(ve, ei);
}, "addDirective"), vo = /* @__PURE__ */ p((e = ve) => {
  ei = [], Os(e, ei);
}, "reset"), _C = {
  LAZY_LOAD_DEPRECATED: "The configuration options lazyLoadedDiagrams and loadExternalDiagramsAtStartup are deprecated. Please use registerExternalDiagrams instead.",
  FLOWCHART_HTML_LABELS_DEPRECATED: "flowchart.htmlLabels is deprecated. Please use global htmlLabels instead."
}, wc = {}, uf = /* @__PURE__ */ p((e) => {
  wc[e] || (R.warn(_C[e]), wc[e] = !0);
}, "issueWarning"), vC = /* @__PURE__ */ p((e) => {
  e && (e.lazyLoadedDiagrams || e.loadExternalDiagramsAtStartup) && uf("LAZY_LOAD_DEPRECATED");
}, "checkConfig"), C5 = /* @__PURE__ */ p(() => {
  let e = {};
  _o && (e = se(e, _o));
  for (const t of ei)
    e = se(e, t);
  return e;
}, "getUserDefinedConfig"), ge = /* @__PURE__ */ p((e) => (e.flowchart?.htmlLabels != null && uf("FLOWCHART_HTML_LABELS_DEPRECATED"), cr(e.htmlLabels ?? e.flowchart?.htmlLabels ?? !0)), "getEffectiveHtmlLabels"), df = /^([^\S\n\r]*)-{3}\s*[\n\r](.*?)[\n\r]\1-{3}\s*[\n\r]+/s, xs = /%{2}{\s*(?:(\w+)\s*:|(\w+))\s*(?:(\w+)|((?:(?!}%{2}).|\r?\n)*))?\s*(?:}%{2})?/gi, BC = /\s*%%.*\n/gm, ff = class extends Error {
  static {
    p(this, "UnknownDiagramError");
  }
  constructor(e) {
    super(e), this.name = "UnknownDiagramError";
  }
}, ri = {}, Cl = /* @__PURE__ */ p(function(e, t) {
  e = e.replace(df, "").replace(xs, "").replace(BC, `
`);
  for (const [r, { detector: i }] of Object.entries(ri))
    if (i(e, t))
      return r;
  throw new ff(
    `No diagram type detected matching given configuration for text: ${e}`
  );
}, "detectType"), An = /* @__PURE__ */ p((...e) => {
  for (const { id: t, detector: r, loader: i } of e)
    pf(t, r, i);
}, "registerLazyLoadedDiagrams"), pf = /* @__PURE__ */ p((e, t, r) => {
  ri[e] && R.warn(`Detector with key ${e} already exists. Overwriting.`), ri[e] = { detector: t, loader: r }, R.debug(`Detector with key ${e} added${r ? " with loader" : ""}`);
}, "addDetector"), LC = /* @__PURE__ */ p((e) => ri[e].loader, "getDiagramLoader"), Ds = /<br\s*\/?>/gi, FC = /* @__PURE__ */ p((e) => e ? yf(e).replace(/\\n/g, "#br#").split("#br#") : [""], "getRows"), AC = /* @__PURE__ */ (() => {
  let e = !1;
  return () => {
    e || (gf(), e = !0);
  };
})();
function gf() {
  const e = "data-temp-href-target";
  Mi.addHook("beforeSanitizeAttributes", (t) => {
    t.tagName === "A" && t.hasAttribute("target") && t.setAttribute(e, t.getAttribute("target") ?? "");
  }), Mi.addHook("afterSanitizeAttributes", (t) => {
    t.tagName === "A" && t.hasAttribute(e) && (t.setAttribute("target", t.getAttribute(e) ?? ""), t.removeAttribute(e), t.getAttribute("target") === "_blank" && t.setAttribute("rel", "noopener"));
  });
}
p(gf, "setupDompurifyHooks");
var mf = /* @__PURE__ */ p((e) => (AC(), Mi.sanitize(e)), "removeScript"), Tc = /* @__PURE__ */ p((e, t) => {
  if (ge(t)) {
    const r = t.securityLevel;
    r === "antiscript" || r === "strict" || r === "sandbox" ? e = mf(e) : r !== "loose" && (e = yf(e), e = e.replace(/</g, "&lt;").replace(/>/g, "&gt;"), e = e.replace(/=/g, "&equals;"), e = OC(e));
  }
  return e;
}, "sanitizeMore"), Re = /* @__PURE__ */ p((e, t) => e && (t.dompurifyConfig ? e = Mi.sanitize(Tc(e, t), t.dompurifyConfig).toString() : e = Mi.sanitize(Tc(e, t), {
  FORBID_TAGS: ["style"]
}).toString(), e), "sanitizeText"), EC = /* @__PURE__ */ p((e, t) => typeof e == "string" ? Re(e, t) : e.flat().map((r) => Re(r, t)), "sanitizeTextOrArray"), MC = /* @__PURE__ */ p((e) => Ds.test(e), "hasBreaks"), $C = /* @__PURE__ */ p((e) => e.split(Ds), "splitBreaks"), OC = /* @__PURE__ */ p((e) => e.replace(/#br#/g, "<br/>"), "placeholderToBreak"), yf = /* @__PURE__ */ p((e) => e.replace(Ds, "#br#"), "breakToPlaceholder"), DC = /* @__PURE__ */ p((e) => {
  let t = "";
  return e && (t = window.location.protocol + "//" + window.location.host + window.location.pathname + window.location.search, t = CSS.escape(t)), t;
}, "getUrl"), IC = /* @__PURE__ */ p(function(...e) {
  const t = e.filter((r) => !isNaN(r));
  return Math.max(...t);
}, "getMax"), PC = /* @__PURE__ */ p(function(...e) {
  const t = e.filter((r) => !isNaN(r));
  return Math.min(...t);
}, "getMin"), Sc = /* @__PURE__ */ p(function(e) {
  const t = e.split(/(,)/), r = [];
  for (let i = 0; i < t.length; i++) {
    let s = t[i];
    if (s === "," && i > 0 && i + 1 < t.length) {
      const o = t[i - 1], a = t[i + 1];
      RC(o, a) && (s = o + "," + a, i++, r.pop());
    }
    r.push(NC(s));
  }
  return r.join("");
}, "parseGenericTypes"), En = /* @__PURE__ */ p((e, t) => Math.max(0, e.split(t).length - 1), "countOccurrence"), RC = /* @__PURE__ */ p((e, t) => {
  const r = En(e, "~"), i = En(t, "~");
  return r === 1 && i === 1;
}, "shouldCombineSets"), NC = /* @__PURE__ */ p((e) => {
  const t = En(e, "~");
  let r = !1;
  if (t <= 1)
    return e;
  t % 2 !== 0 && e.startsWith("~") && (e = e.substring(1), r = !0);
  const i = [...e];
  let s = i.indexOf("~"), o = i.lastIndexOf("~");
  for (; s !== -1 && o !== -1 && s !== o; )
    i[s] = "<", i[o] = ">", s = i.indexOf("~"), o = i.lastIndexOf("~");
  return r && i.unshift("~"), i.join("");
}, "processSet"), _c = /* @__PURE__ */ p(() => window.MathMLElement !== void 0, "isMathMLSupported"), Mn = /\$\$(.*?)\$\$/g, Ts = /* @__PURE__ */ p((e) => (e.match(Mn)?.length ?? 0) > 0, "hasKatex"), b5 = /* @__PURE__ */ p(async (e, t) => {
  const r = document.createElement("div");
  r.innerHTML = await xf(e, t), r.id = "katex-temp", r.style.visibility = "hidden", r.style.position = "absolute", r.style.top = "0", document.querySelector("body")?.insertAdjacentElement("beforeend", r);
  const s = { width: r.clientWidth, height: r.clientHeight };
  return r.remove(), s;
}, "calculateMathMLDimensions"), qC = /* @__PURE__ */ p(async (e, t) => {
  if (!Ts(e))
    return e;
  if (!(_c() || t.legacyMathML || t.forceLegacyMathML))
    return e.replace(Mn, "MathML is unsupported in this environment.");
  {
    const { default: r } = await import("./katex-DoRnZ_sp.js"), i = t.forceLegacyMathML || !_c() && t.legacyMathML ? "htmlAndMathml" : "mathml";
    return e.split(Ds).map(
      (s) => Ts(s) ? `<div style="display: flex; align-items: center; justify-content: center; white-space: nowrap;">${s}</div>` : `<div>${s}</div>`
    ).join("").replace(
      Mn,
      (s, o) => r.renderToString(o, {
        throwOnError: !0,
        displayMode: !0,
        output: i
      }).replace(/\n/g, " ").replace(/<annotation.*<\/annotation>/g, "")
    );
  }
}, "renderKatexUnsanitized"), xf = /* @__PURE__ */ p(async (e, t) => Re(await qC(e, t), t), "renderKatexSanitized"), Is = {
  getRows: FC,
  sanitizeText: Re,
  sanitizeTextOrArray: EC,
  hasBreaks: MC,
  splitBreaks: $C,
  lineBreakRegex: Ds,
  removeScript: mf,
  getUrl: DC,
  evaluate: cr,
  getMax: IC,
  getMin: PC
}, zC = /* @__PURE__ */ p(function(e, t) {
  for (let r of t)
    e.attr(r[0], r[1]);
}, "d3Attrs"), WC = /* @__PURE__ */ p(function(e, t, r) {
  let i = /* @__PURE__ */ new Map();
  return r ? (i.set("width", "100%"), i.set("style", `max-width: ${t}px;`)) : (i.set("height", e), i.set("width", t)), i;
}, "calculateSvgSizeAttrs"), Cf = /* @__PURE__ */ p(function(e, t, r, i) {
  const s = WC(t, r, i);
  zC(e, s);
}, "configureSvgSize"), HC = /* @__PURE__ */ p(function(e, t, r, i) {
  const s = t.node().getBBox(), o = s.width, a = s.height;
  R.info(`SVG bounds: ${o}x${a}`, s);
  let n = 0, l = 0;
  R.info(`Graph bounds: ${n}x${l}`, e), n = o + r * 2, l = a + r * 2, R.info(`Calculated bounds: ${n}x${l}`), Cf(t, l, n, i);
  const c = `${s.x - r} ${s.y - r} ${s.width + 2 * r} ${s.height + 2 * r}`;
  t.attr("viewBox", c);
}, "setupGraphViewbox"), fo = {};
function $n(e) {
  return [...e.cssRules].map((t) => t.cssText).join(`
`);
}
p($n, "cssStyleSheetToString");
var YC = /* @__PURE__ */ p((e, t, r, i) => {
  let s = "";
  return e in fo && fo[e] ? s = fo[e]({ ...r, svgId: i }) : R.warn(`No theme found for ${e}`), `& {
    font-family: ${r.fontFamily};
    font-size: ${r.fontSize};
    fill: ${r.textColor}
  }
  @keyframes edge-animation-frame {
    from {
      stroke-dashoffset: 0;
    }
  }
  @keyframes dash {
    to {
      stroke-dashoffset: 0;
    }
  }
  & .edge-animation-slow {
    stroke-dasharray: 9,5 !important;
    stroke-dashoffset: 900;
    animation: dash 50s linear infinite;
    stroke-linecap: round;
  }
  & .edge-animation-fast {
    stroke-dasharray: 9,5 !important;
    stroke-dashoffset: 900;
    animation: dash 20s linear infinite;
    stroke-linecap: round;
  }
  /* Classes common for multiple diagrams */

  & .error-icon {
    fill: ${r.errorBkgColor};
  }
  & .error-text {
    fill: ${r.errorTextColor};
    stroke: ${r.errorTextColor};
  }

  & .edge-thickness-normal {
    stroke-width: ${r.strokeWidth ?? 1}px;
  }
  & .edge-thickness-thick {
    stroke-width: 3.5px
  }
  & .edge-pattern-solid {
    stroke-dasharray: 0;
  }
  & .edge-thickness-invisible {
    stroke-width: 0;
    fill: none;
  }
  & .edge-pattern-dashed{
    stroke-dasharray: 3;
  }
  .edge-pattern-dotted {
    stroke-dasharray: 2;
  }

  & .marker {
    fill: ${r.lineColor};
    stroke: ${r.lineColor};
  }
  & .marker.cross {
    stroke: ${r.lineColor};
  }

  & svg {
    font-family: ${r.fontFamily};
    font-size: ${r.fontSize};
  }
   & p {
    margin: 0
   }

  ${s}
  .node .neo-node {
    stroke: ${r.nodeBorder};
  }

  [data-look="neo"].node rect, [data-look="neo"].cluster rect, [data-look="neo"].node polygon {
    stroke: ${r.useGradient ? "url(" + i + "-gradient)" : r.nodeBorder};
    filter: ${r.dropShadow ? r.dropShadow.replace("url(#drop-shadow)", `url(${i}-drop-shadow)`) : "none"};
  }
  [data-look="neo"].swimlane.cluster rect {
    filter: none;
  }


  [data-look="neo"].node path {
    stroke: ${r.useGradient ? "url(" + i + "-gradient)" : r.nodeBorder};
    stroke-width: ${r.strokeWidth ?? 1}px;
  }

  [data-look="neo"].node .outer-path {
    filter: ${r.dropShadow ? r.dropShadow.replace("url(#drop-shadow)", `url(${i}-drop-shadow)`) : "none"};
  }

  [data-look="neo"].node .neo-line path {
    stroke: ${r.nodeBorder};
    filter: none;
  }

  [data-look="neo"].node circle{
    stroke: ${r.useGradient ? "url(" + i + "-gradient)" : r.nodeBorder};
    filter: ${r.dropShadow ? r.dropShadow.replace("url(#drop-shadow)", `url(${i}-drop-shadow)`) : "none"};
  }

  [data-look="neo"].node circle .state-start{
    fill: #000000;
  }

  [data-look="neo"].icon-shape .icon {
    fill: ${r.useGradient ? "url(" + i + "-gradient)" : r.nodeBorder};
    filter: ${r.dropShadow ? r.dropShadow.replace("url(#drop-shadow)", `url(${i}-drop-shadow)`) : "none"};
  }

    [data-look="neo"].icon-shape .icon-neo path {
    stroke: ${r.useGradient ? "url(" + i + "-gradient)" : r.nodeBorder};
    filter: ${r.dropShadow ? r.dropShadow.replace("url(#drop-shadow)", `url(${i}-drop-shadow)`) : "none"};
  }

  ${t}
`;
}, "getStyles"), UC = /* @__PURE__ */ p((e, t) => {
  t !== void 0 && (fo[e] = t);
}, "addStylesForDiagram"), jC = YC, bf = {};
sx(bf, {
  clear: () => GC,
  getAccDescription: () => KC,
  getAccTitle: () => VC,
  getDiagramTitle: () => JC,
  setAccDescription: () => ZC,
  setAccTitle: () => XC,
  setDiagramTitle: () => QC
});
var bl = "", kl = "", wl = "", Tl = /* @__PURE__ */ p((e) => Re(e, Xt()), "sanitizeText"), GC = /* @__PURE__ */ p(() => {
  bl = "", wl = "", kl = "";
}, "clear"), XC = /* @__PURE__ */ p((e) => {
  bl = Tl(e).replace(/^\s+/g, "");
}, "setAccTitle"), VC = /* @__PURE__ */ p(() => bl, "getAccTitle"), ZC = /* @__PURE__ */ p((e) => {
  wl = Tl(e).replace(/\n\s+/g, `
`);
}, "setAccDescription"), KC = /* @__PURE__ */ p(() => wl, "getAccDescription"), QC = /* @__PURE__ */ p((e) => {
  kl = Tl(e);
}, "setDiagramTitle"), JC = /* @__PURE__ */ p(() => kl, "getDiagramTitle"), vc = R, tb = xl, $t = Xt, k5 = hf, w5 = $i, Sl = /* @__PURE__ */ p((e) => Re(e, $t()), "sanitizeText"), eb = HC, rb = /* @__PURE__ */ p(() => bf, "getCommonDb"), Bo = {}, Lo = /* @__PURE__ */ p((e, t, r) => {
  Bo[e] && vc.warn(`Diagram with id ${e} already registered. Overwriting.`), Bo[e] = t, r && pf(e, r), UC(e, t.styles), t.injectUtils?.(
    vc,
    tb,
    $t,
    Sl,
    eb,
    rb(),
    () => {
    }
  );
}, "registerDiagram"), On = /* @__PURE__ */ p((e) => {
  if (e in Bo)
    return Bo[e];
  throw new ib(e);
}, "getDiagram"), ib = class extends Error {
  static {
    p(this, "DiagramNotFoundError");
  }
  constructor(e) {
    super(`Diagram ${e} not found.`);
  }
}, sb = { value: () => {
} };
function kf() {
  for (var e = 0, t = arguments.length, r = {}, i; e < t; ++e) {
    if (!(i = arguments[e] + "") || i in r || /[\s.]/.test(i)) throw new Error("illegal type: " + i);
    r[i] = [];
  }
  return new po(r);
}
function po(e) {
  this._ = e;
}
function ob(e, t) {
  return e.trim().split(/^|\s+/).map(function(r) {
    var i = "", s = r.indexOf(".");
    if (s >= 0 && (i = r.slice(s + 1), r = r.slice(0, s)), r && !t.hasOwnProperty(r)) throw new Error("unknown type: " + r);
    return { type: r, name: i };
  });
}
po.prototype = kf.prototype = {
  constructor: po,
  on: function(e, t) {
    var r = this._, i = ob(e + "", r), s, o = -1, a = i.length;
    if (arguments.length < 2) {
      for (; ++o < a; ) if ((s = (e = i[o]).type) && (s = ab(r[s], e.name))) return s;
      return;
    }
    if (t != null && typeof t != "function") throw new Error("invalid callback: " + t);
    for (; ++o < a; )
      if (s = (e = i[o]).type) r[s] = Bc(r[s], e.name, t);
      else if (t == null) for (s in r) r[s] = Bc(r[s], e.name, null);
    return this;
  },
  copy: function() {
    var e = {}, t = this._;
    for (var r in t) e[r] = t[r].slice();
    return new po(e);
  },
  call: function(e, t) {
    if ((s = arguments.length - 2) > 0) for (var r = new Array(s), i = 0, s, o; i < s; ++i) r[i] = arguments[i + 2];
    if (!this._.hasOwnProperty(e)) throw new Error("unknown type: " + e);
    for (o = this._[e], i = 0, s = o.length; i < s; ++i) o[i].value.apply(t, r);
  },
  apply: function(e, t, r) {
    if (!this._.hasOwnProperty(e)) throw new Error("unknown type: " + e);
    for (var i = this._[e], s = 0, o = i.length; s < o; ++s) i[s].value.apply(t, r);
  }
};
function ab(e, t) {
  for (var r = 0, i = e.length, s; r < i; ++r)
    if ((s = e[r]).name === t)
      return s.value;
}
function Bc(e, t, r) {
  for (var i = 0, s = e.length; i < s; ++i)
    if (e[i].name === t) {
      e[i] = sb, e = e.slice(0, i).concat(e.slice(i + 1));
      break;
    }
  return r != null && e.push({ name: t, value: r }), e;
}
var Dn = "http://www.w3.org/1999/xhtml";
const Lc = {
  svg: "http://www.w3.org/2000/svg",
  xhtml: Dn,
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};
function Qo(e) {
  var t = e += "", r = t.indexOf(":");
  return r >= 0 && (t = e.slice(0, r)) !== "xmlns" && (e = e.slice(r + 1)), Lc.hasOwnProperty(t) ? { space: Lc[t], local: e } : e;
}
function nb(e) {
  return function() {
    var t = this.ownerDocument, r = this.namespaceURI;
    return r === Dn && t.documentElement.namespaceURI === Dn ? t.createElement(e) : t.createElementNS(r, e);
  };
}
function lb(e) {
  return function() {
    return this.ownerDocument.createElementNS(e.space, e.local);
  };
}
function wf(e) {
  var t = Qo(e);
  return (t.local ? lb : nb)(t);
}
function hb() {
}
function _l(e) {
  return e == null ? hb : function() {
    return this.querySelector(e);
  };
}
function cb(e) {
  typeof e != "function" && (e = _l(e));
  for (var t = this._groups, r = t.length, i = new Array(r), s = 0; s < r; ++s)
    for (var o = t[s], a = o.length, n = i[s] = new Array(a), l, c, h = 0; h < a; ++h)
      (l = o[h]) && (c = e.call(l, l.__data__, h, o)) && ("__data__" in l && (c.__data__ = l.__data__), n[h] = c);
  return new Oe(i, this._parents);
}
function ub(e) {
  return e == null ? [] : Array.isArray(e) ? e : Array.from(e);
}
function db() {
  return [];
}
function Tf(e) {
  return e == null ? db : function() {
    return this.querySelectorAll(e);
  };
}
function fb(e) {
  return function() {
    return ub(e.apply(this, arguments));
  };
}
function pb(e) {
  typeof e == "function" ? e = fb(e) : e = Tf(e);
  for (var t = this._groups, r = t.length, i = [], s = [], o = 0; o < r; ++o)
    for (var a = t[o], n = a.length, l, c = 0; c < n; ++c)
      (l = a[c]) && (i.push(e.call(l, l.__data__, c, a)), s.push(l));
  return new Oe(i, s);
}
function Sf(e) {
  return function() {
    return this.matches(e);
  };
}
function _f(e) {
  return function(t) {
    return t.matches(e);
  };
}
var gb = Array.prototype.find;
function mb(e) {
  return function() {
    return gb.call(this.children, e);
  };
}
function yb() {
  return this.firstElementChild;
}
function xb(e) {
  return this.select(e == null ? yb : mb(typeof e == "function" ? e : _f(e)));
}
var Cb = Array.prototype.filter;
function bb() {
  return Array.from(this.children);
}
function kb(e) {
  return function() {
    return Cb.call(this.children, e);
  };
}
function wb(e) {
  return this.selectAll(e == null ? bb : kb(typeof e == "function" ? e : _f(e)));
}
function Tb(e) {
  typeof e != "function" && (e = Sf(e));
  for (var t = this._groups, r = t.length, i = new Array(r), s = 0; s < r; ++s)
    for (var o = t[s], a = o.length, n = i[s] = [], l, c = 0; c < a; ++c)
      (l = o[c]) && e.call(l, l.__data__, c, o) && n.push(l);
  return new Oe(i, this._parents);
}
function vf(e) {
  return new Array(e.length);
}
function Sb() {
  return new Oe(this._enter || this._groups.map(vf), this._parents);
}
function Fo(e, t) {
  this.ownerDocument = e.ownerDocument, this.namespaceURI = e.namespaceURI, this._next = null, this._parent = e, this.__data__ = t;
}
Fo.prototype = {
  constructor: Fo,
  appendChild: function(e) {
    return this._parent.insertBefore(e, this._next);
  },
  insertBefore: function(e, t) {
    return this._parent.insertBefore(e, t);
  },
  querySelector: function(e) {
    return this._parent.querySelector(e);
  },
  querySelectorAll: function(e) {
    return this._parent.querySelectorAll(e);
  }
};
function _b(e) {
  return function() {
    return e;
  };
}
function vb(e, t, r, i, s, o) {
  for (var a = 0, n, l = t.length, c = o.length; a < c; ++a)
    (n = t[a]) ? (n.__data__ = o[a], i[a] = n) : r[a] = new Fo(e, o[a]);
  for (; a < l; ++a)
    (n = t[a]) && (s[a] = n);
}
function Bb(e, t, r, i, s, o, a) {
  var n, l, c = /* @__PURE__ */ new Map(), h = t.length, u = o.length, d = new Array(h), f;
  for (n = 0; n < h; ++n)
    (l = t[n]) && (d[n] = f = a.call(l, l.__data__, n, t) + "", c.has(f) ? s[n] = l : c.set(f, l));
  for (n = 0; n < u; ++n)
    f = a.call(e, o[n], n, o) + "", (l = c.get(f)) ? (i[n] = l, l.__data__ = o[n], c.delete(f)) : r[n] = new Fo(e, o[n]);
  for (n = 0; n < h; ++n)
    (l = t[n]) && c.get(d[n]) === l && (s[n] = l);
}
function Lb(e) {
  return e.__data__;
}
function Fb(e, t) {
  if (!arguments.length) return Array.from(this, Lb);
  var r = t ? Bb : vb, i = this._parents, s = this._groups;
  typeof e != "function" && (e = _b(e));
  for (var o = s.length, a = new Array(o), n = new Array(o), l = new Array(o), c = 0; c < o; ++c) {
    var h = i[c], u = s[c], d = u.length, f = Ab(e.call(h, h && h.__data__, c, i)), m = f.length, y = n[c] = new Array(m), x = a[c] = new Array(m), C = l[c] = new Array(d);
    r(h, u, y, x, C, f, t);
    for (var k = 0, T = 0, _, v; k < m; ++k)
      if (_ = y[k]) {
        for (k >= T && (T = k + 1); !(v = x[T]) && ++T < m; ) ;
        _._next = v || null;
      }
  }
  return a = new Oe(a, i), a._enter = n, a._exit = l, a;
}
function Ab(e) {
  return typeof e == "object" && "length" in e ? e : Array.from(e);
}
function Eb() {
  return new Oe(this._exit || this._groups.map(vf), this._parents);
}
function Mb(e, t, r) {
  var i = this.enter(), s = this, o = this.exit();
  return typeof e == "function" ? (i = e(i), i && (i = i.selection())) : i = i.append(e + ""), t != null && (s = t(s), s && (s = s.selection())), r == null ? o.remove() : r(o), i && s ? i.merge(s).order() : s;
}
function $b(e) {
  for (var t = e.selection ? e.selection() : e, r = this._groups, i = t._groups, s = r.length, o = i.length, a = Math.min(s, o), n = new Array(s), l = 0; l < a; ++l)
    for (var c = r[l], h = i[l], u = c.length, d = n[l] = new Array(u), f, m = 0; m < u; ++m)
      (f = c[m] || h[m]) && (d[m] = f);
  for (; l < s; ++l)
    n[l] = r[l];
  return new Oe(n, this._parents);
}
function Ob() {
  for (var e = this._groups, t = -1, r = e.length; ++t < r; )
    for (var i = e[t], s = i.length - 1, o = i[s], a; --s >= 0; )
      (a = i[s]) && (o && a.compareDocumentPosition(o) ^ 4 && o.parentNode.insertBefore(a, o), o = a);
  return this;
}
function Db(e) {
  e || (e = Ib);
  function t(u, d) {
    return u && d ? e(u.__data__, d.__data__) : !u - !d;
  }
  for (var r = this._groups, i = r.length, s = new Array(i), o = 0; o < i; ++o) {
    for (var a = r[o], n = a.length, l = s[o] = new Array(n), c, h = 0; h < n; ++h)
      (c = a[h]) && (l[h] = c);
    l.sort(t);
  }
  return new Oe(s, this._parents).order();
}
function Ib(e, t) {
  return e < t ? -1 : e > t ? 1 : e >= t ? 0 : NaN;
}
function Pb() {
  var e = arguments[0];
  return arguments[0] = this, e.apply(null, arguments), this;
}
function Rb() {
  return Array.from(this);
}
function Nb() {
  for (var e = this._groups, t = 0, r = e.length; t < r; ++t)
    for (var i = e[t], s = 0, o = i.length; s < o; ++s) {
      var a = i[s];
      if (a) return a;
    }
  return null;
}
function qb() {
  let e = 0;
  for (const t of this) ++e;
  return e;
}
function zb() {
  return !this.node();
}
function Wb(e) {
  for (var t = this._groups, r = 0, i = t.length; r < i; ++r)
    for (var s = t[r], o = 0, a = s.length, n; o < a; ++o)
      (n = s[o]) && e.call(n, n.__data__, o, s);
  return this;
}
function Hb(e) {
  return function() {
    this.removeAttribute(e);
  };
}
function Yb(e) {
  return function() {
    this.removeAttributeNS(e.space, e.local);
  };
}
function Ub(e, t) {
  return function() {
    this.setAttribute(e, t);
  };
}
function jb(e, t) {
  return function() {
    this.setAttributeNS(e.space, e.local, t);
  };
}
function Gb(e, t) {
  return function() {
    var r = t.apply(this, arguments);
    r == null ? this.removeAttribute(e) : this.setAttribute(e, r);
  };
}
function Xb(e, t) {
  return function() {
    var r = t.apply(this, arguments);
    r == null ? this.removeAttributeNS(e.space, e.local) : this.setAttributeNS(e.space, e.local, r);
  };
}
function Vb(e, t) {
  var r = Qo(e);
  if (arguments.length < 2) {
    var i = this.node();
    return r.local ? i.getAttributeNS(r.space, r.local) : i.getAttribute(r);
  }
  return this.each((t == null ? r.local ? Yb : Hb : typeof t == "function" ? r.local ? Xb : Gb : r.local ? jb : Ub)(r, t));
}
function Bf(e) {
  return e.ownerDocument && e.ownerDocument.defaultView || e.document && e || e.defaultView;
}
function Zb(e) {
  return function() {
    this.style.removeProperty(e);
  };
}
function Kb(e, t, r) {
  return function() {
    this.style.setProperty(e, t, r);
  };
}
function Qb(e, t, r) {
  return function() {
    var i = t.apply(this, arguments);
    i == null ? this.style.removeProperty(e) : this.style.setProperty(e, i, r);
  };
}
function Jb(e, t, r) {
  return arguments.length > 1 ? this.each((t == null ? Zb : typeof t == "function" ? Qb : Kb)(e, t, r ?? "")) : Oi(this.node(), e);
}
function Oi(e, t) {
  return e.style.getPropertyValue(t) || Bf(e).getComputedStyle(e, null).getPropertyValue(t);
}
function t1(e) {
  return function() {
    delete this[e];
  };
}
function e1(e, t) {
  return function() {
    this[e] = t;
  };
}
function r1(e, t) {
  return function() {
    var r = t.apply(this, arguments);
    r == null ? delete this[e] : this[e] = r;
  };
}
function i1(e, t) {
  return arguments.length > 1 ? this.each((t == null ? t1 : typeof t == "function" ? r1 : e1)(e, t)) : this.node()[e];
}
function Lf(e) {
  return e.trim().split(/^|\s+/);
}
function vl(e) {
  return e.classList || new Ff(e);
}
function Ff(e) {
  this._node = e, this._names = Lf(e.getAttribute("class") || "");
}
Ff.prototype = {
  add: function(e) {
    var t = this._names.indexOf(e);
    t < 0 && (this._names.push(e), this._node.setAttribute("class", this._names.join(" ")));
  },
  remove: function(e) {
    var t = this._names.indexOf(e);
    t >= 0 && (this._names.splice(t, 1), this._node.setAttribute("class", this._names.join(" ")));
  },
  contains: function(e) {
    return this._names.indexOf(e) >= 0;
  }
};
function Af(e, t) {
  for (var r = vl(e), i = -1, s = t.length; ++i < s; ) r.add(t[i]);
}
function Ef(e, t) {
  for (var r = vl(e), i = -1, s = t.length; ++i < s; ) r.remove(t[i]);
}
function s1(e) {
  return function() {
    Af(this, e);
  };
}
function o1(e) {
  return function() {
    Ef(this, e);
  };
}
function a1(e, t) {
  return function() {
    (t.apply(this, arguments) ? Af : Ef)(this, e);
  };
}
function n1(e, t) {
  var r = Lf(e + "");
  if (arguments.length < 2) {
    for (var i = vl(this.node()), s = -1, o = r.length; ++s < o; ) if (!i.contains(r[s])) return !1;
    return !0;
  }
  return this.each((typeof t == "function" ? a1 : t ? s1 : o1)(r, t));
}
function l1() {
  this.textContent = "";
}
function h1(e) {
  return function() {
    this.textContent = e;
  };
}
function c1(e) {
  return function() {
    var t = e.apply(this, arguments);
    this.textContent = t ?? "";
  };
}
function u1(e) {
  return arguments.length ? this.each(e == null ? l1 : (typeof e == "function" ? c1 : h1)(e)) : this.node().textContent;
}
function d1() {
  this.innerHTML = "";
}
function f1(e) {
  return function() {
    this.innerHTML = e;
  };
}
function p1(e) {
  return function() {
    var t = e.apply(this, arguments);
    this.innerHTML = t ?? "";
  };
}
function g1(e) {
  return arguments.length ? this.each(e == null ? d1 : (typeof e == "function" ? p1 : f1)(e)) : this.node().innerHTML;
}
function m1() {
  this.nextSibling && this.parentNode.appendChild(this);
}
function y1() {
  return this.each(m1);
}
function x1() {
  this.previousSibling && this.parentNode.insertBefore(this, this.parentNode.firstChild);
}
function C1() {
  return this.each(x1);
}
function b1(e) {
  var t = typeof e == "function" ? e : wf(e);
  return this.select(function() {
    return this.appendChild(t.apply(this, arguments));
  });
}
function k1() {
  return null;
}
function w1(e, t) {
  var r = typeof e == "function" ? e : wf(e), i = t == null ? k1 : typeof t == "function" ? t : _l(t);
  return this.select(function() {
    return this.insertBefore(r.apply(this, arguments), i.apply(this, arguments) || null);
  });
}
function T1() {
  var e = this.parentNode;
  e && e.removeChild(this);
}
function S1() {
  return this.each(T1);
}
function _1() {
  var e = this.cloneNode(!1), t = this.parentNode;
  return t ? t.insertBefore(e, this.nextSibling) : e;
}
function v1() {
  var e = this.cloneNode(!0), t = this.parentNode;
  return t ? t.insertBefore(e, this.nextSibling) : e;
}
function B1(e) {
  return this.select(e ? v1 : _1);
}
function L1(e) {
  return arguments.length ? this.property("__data__", e) : this.node().__data__;
}
function F1(e) {
  return function(t) {
    e.call(this, t, this.__data__);
  };
}
function A1(e) {
  return e.trim().split(/^|\s+/).map(function(t) {
    var r = "", i = t.indexOf(".");
    return i >= 0 && (r = t.slice(i + 1), t = t.slice(0, i)), { type: t, name: r };
  });
}
function E1(e) {
  return function() {
    var t = this.__on;
    if (t) {
      for (var r = 0, i = -1, s = t.length, o; r < s; ++r)
        o = t[r], (!e.type || o.type === e.type) && o.name === e.name ? this.removeEventListener(o.type, o.listener, o.options) : t[++i] = o;
      ++i ? t.length = i : delete this.__on;
    }
  };
}
function M1(e, t, r) {
  return function() {
    var i = this.__on, s, o = F1(t);
    if (i) {
      for (var a = 0, n = i.length; a < n; ++a)
        if ((s = i[a]).type === e.type && s.name === e.name) {
          this.removeEventListener(s.type, s.listener, s.options), this.addEventListener(s.type, s.listener = o, s.options = r), s.value = t;
          return;
        }
    }
    this.addEventListener(e.type, o, r), s = { type: e.type, name: e.name, value: t, listener: o, options: r }, i ? i.push(s) : this.__on = [s];
  };
}
function $1(e, t, r) {
  var i = A1(e + ""), s, o = i.length, a;
  if (arguments.length < 2) {
    var n = this.node().__on;
    if (n) {
      for (var l = 0, c = n.length, h; l < c; ++l)
        for (s = 0, h = n[l]; s < o; ++s)
          if ((a = i[s]).type === h.type && a.name === h.name)
            return h.value;
    }
    return;
  }
  for (n = t ? M1 : E1, s = 0; s < o; ++s) this.each(n(i[s], t, r));
  return this;
}
function Mf(e, t, r) {
  var i = Bf(e), s = i.CustomEvent;
  typeof s == "function" ? s = new s(t, r) : (s = i.document.createEvent("Event"), r ? (s.initEvent(t, r.bubbles, r.cancelable), s.detail = r.detail) : s.initEvent(t, !1, !1)), e.dispatchEvent(s);
}
function O1(e, t) {
  return function() {
    return Mf(this, e, t);
  };
}
function D1(e, t) {
  return function() {
    return Mf(this, e, t.apply(this, arguments));
  };
}
function I1(e, t) {
  return this.each((typeof t == "function" ? D1 : O1)(e, t));
}
function* P1() {
  for (var e = this._groups, t = 0, r = e.length; t < r; ++t)
    for (var i = e[t], s = 0, o = i.length, a; s < o; ++s)
      (a = i[s]) && (yield a);
}
var $f = [null];
function Oe(e, t) {
  this._groups = e, this._parents = t;
}
function Ps() {
  return new Oe([[document.documentElement]], $f);
}
function R1() {
  return this;
}
Oe.prototype = Ps.prototype = {
  constructor: Oe,
  select: cb,
  selectAll: pb,
  selectChild: xb,
  selectChildren: wb,
  filter: Tb,
  data: Fb,
  enter: Sb,
  exit: Eb,
  join: Mb,
  merge: $b,
  selection: R1,
  order: Ob,
  sort: Db,
  call: Pb,
  nodes: Rb,
  node: Nb,
  size: qb,
  empty: zb,
  each: Wb,
  attr: Vb,
  style: Jb,
  property: i1,
  classed: n1,
  text: u1,
  html: g1,
  raise: y1,
  lower: C1,
  append: b1,
  insert: w1,
  remove: S1,
  clone: B1,
  datum: L1,
  on: $1,
  dispatch: I1,
  [Symbol.iterator]: P1
};
function At(e) {
  return typeof e == "string" ? new Oe([[document.querySelector(e)]], [document.documentElement]) : new Oe([[e]], $f);
}
function Bl(e, t, r) {
  e.prototype = t.prototype = r, r.constructor = e;
}
function Of(e, t) {
  var r = Object.create(e.prototype);
  for (var i in t) r[i] = t[i];
  return r;
}
function Rs() {
}
var Ss = 0.7, Ao = 1 / Ss, Fi = "\\s*([+-]?\\d+)\\s*", _s = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*", or = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*", N1 = /^#([0-9a-f]{3,8})$/, q1 = new RegExp(`^rgb\\(${Fi},${Fi},${Fi}\\)$`), z1 = new RegExp(`^rgb\\(${or},${or},${or}\\)$`), W1 = new RegExp(`^rgba\\(${Fi},${Fi},${Fi},${_s}\\)$`), H1 = new RegExp(`^rgba\\(${or},${or},${or},${_s}\\)$`), Y1 = new RegExp(`^hsl\\(${_s},${or},${or}\\)$`), U1 = new RegExp(`^hsla\\(${_s},${or},${or},${_s}\\)$`), Fc = {
  aliceblue: 15792383,
  antiquewhite: 16444375,
  aqua: 65535,
  aquamarine: 8388564,
  azure: 15794175,
  beige: 16119260,
  bisque: 16770244,
  black: 0,
  blanchedalmond: 16772045,
  blue: 255,
  blueviolet: 9055202,
  brown: 10824234,
  burlywood: 14596231,
  cadetblue: 6266528,
  chartreuse: 8388352,
  chocolate: 13789470,
  coral: 16744272,
  cornflowerblue: 6591981,
  cornsilk: 16775388,
  crimson: 14423100,
  cyan: 65535,
  darkblue: 139,
  darkcyan: 35723,
  darkgoldenrod: 12092939,
  darkgray: 11119017,
  darkgreen: 25600,
  darkgrey: 11119017,
  darkkhaki: 12433259,
  darkmagenta: 9109643,
  darkolivegreen: 5597999,
  darkorange: 16747520,
  darkorchid: 10040012,
  darkred: 9109504,
  darksalmon: 15308410,
  darkseagreen: 9419919,
  darkslateblue: 4734347,
  darkslategray: 3100495,
  darkslategrey: 3100495,
  darkturquoise: 52945,
  darkviolet: 9699539,
  deeppink: 16716947,
  deepskyblue: 49151,
  dimgray: 6908265,
  dimgrey: 6908265,
  dodgerblue: 2003199,
  firebrick: 11674146,
  floralwhite: 16775920,
  forestgreen: 2263842,
  fuchsia: 16711935,
  gainsboro: 14474460,
  ghostwhite: 16316671,
  gold: 16766720,
  goldenrod: 14329120,
  gray: 8421504,
  green: 32768,
  greenyellow: 11403055,
  grey: 8421504,
  honeydew: 15794160,
  hotpink: 16738740,
  indianred: 13458524,
  indigo: 4915330,
  ivory: 16777200,
  khaki: 15787660,
  lavender: 15132410,
  lavenderblush: 16773365,
  lawngreen: 8190976,
  lemonchiffon: 16775885,
  lightblue: 11393254,
  lightcoral: 15761536,
  lightcyan: 14745599,
  lightgoldenrodyellow: 16448210,
  lightgray: 13882323,
  lightgreen: 9498256,
  lightgrey: 13882323,
  lightpink: 16758465,
  lightsalmon: 16752762,
  lightseagreen: 2142890,
  lightskyblue: 8900346,
  lightslategray: 7833753,
  lightslategrey: 7833753,
  lightsteelblue: 11584734,
  lightyellow: 16777184,
  lime: 65280,
  limegreen: 3329330,
  linen: 16445670,
  magenta: 16711935,
  maroon: 8388608,
  mediumaquamarine: 6737322,
  mediumblue: 205,
  mediumorchid: 12211667,
  mediumpurple: 9662683,
  mediumseagreen: 3978097,
  mediumslateblue: 8087790,
  mediumspringgreen: 64154,
  mediumturquoise: 4772300,
  mediumvioletred: 13047173,
  midnightblue: 1644912,
  mintcream: 16121850,
  mistyrose: 16770273,
  moccasin: 16770229,
  navajowhite: 16768685,
  navy: 128,
  oldlace: 16643558,
  olive: 8421376,
  olivedrab: 7048739,
  orange: 16753920,
  orangered: 16729344,
  orchid: 14315734,
  palegoldenrod: 15657130,
  palegreen: 10025880,
  paleturquoise: 11529966,
  palevioletred: 14381203,
  papayawhip: 16773077,
  peachpuff: 16767673,
  peru: 13468991,
  pink: 16761035,
  plum: 14524637,
  powderblue: 11591910,
  purple: 8388736,
  rebeccapurple: 6697881,
  red: 16711680,
  rosybrown: 12357519,
  royalblue: 4286945,
  saddlebrown: 9127187,
  salmon: 16416882,
  sandybrown: 16032864,
  seagreen: 3050327,
  seashell: 16774638,
  sienna: 10506797,
  silver: 12632256,
  skyblue: 8900331,
  slateblue: 6970061,
  slategray: 7372944,
  slategrey: 7372944,
  snow: 16775930,
  springgreen: 65407,
  steelblue: 4620980,
  tan: 13808780,
  teal: 32896,
  thistle: 14204888,
  tomato: 16737095,
  turquoise: 4251856,
  violet: 15631086,
  wheat: 16113331,
  white: 16777215,
  whitesmoke: 16119285,
  yellow: 16776960,
  yellowgreen: 10145074
};
Bl(Rs, vs, {
  copy(e) {
    return Object.assign(new this.constructor(), this, e);
  },
  displayable() {
    return this.rgb().displayable();
  },
  hex: Ac,
  // Deprecated! Use color.formatHex.
  formatHex: Ac,
  formatHex8: j1,
  formatHsl: G1,
  formatRgb: Ec,
  toString: Ec
});
function Ac() {
  return this.rgb().formatHex();
}
function j1() {
  return this.rgb().formatHex8();
}
function G1() {
  return Df(this).formatHsl();
}
function Ec() {
  return this.rgb().formatRgb();
}
function vs(e) {
  var t, r;
  return e = (e + "").trim().toLowerCase(), (t = N1.exec(e)) ? (r = t[1].length, t = parseInt(t[1], 16), r === 6 ? Mc(t) : r === 3 ? new Be(t >> 8 & 15 | t >> 4 & 240, t >> 4 & 15 | t & 240, (t & 15) << 4 | t & 15, 1) : r === 8 ? Zs(t >> 24 & 255, t >> 16 & 255, t >> 8 & 255, (t & 255) / 255) : r === 4 ? Zs(t >> 12 & 15 | t >> 8 & 240, t >> 8 & 15 | t >> 4 & 240, t >> 4 & 15 | t & 240, ((t & 15) << 4 | t & 15) / 255) : null) : (t = q1.exec(e)) ? new Be(t[1], t[2], t[3], 1) : (t = z1.exec(e)) ? new Be(t[1] * 255 / 100, t[2] * 255 / 100, t[3] * 255 / 100, 1) : (t = W1.exec(e)) ? Zs(t[1], t[2], t[3], t[4]) : (t = H1.exec(e)) ? Zs(t[1] * 255 / 100, t[2] * 255 / 100, t[3] * 255 / 100, t[4]) : (t = Y1.exec(e)) ? Dc(t[1], t[2] / 100, t[3] / 100, 1) : (t = U1.exec(e)) ? Dc(t[1], t[2] / 100, t[3] / 100, t[4]) : Fc.hasOwnProperty(e) ? Mc(Fc[e]) : e === "transparent" ? new Be(NaN, NaN, NaN, 0) : null;
}
function Mc(e) {
  return new Be(e >> 16 & 255, e >> 8 & 255, e & 255, 1);
}
function Zs(e, t, r, i) {
  return i <= 0 && (e = t = r = NaN), new Be(e, t, r, i);
}
function X1(e) {
  return e instanceof Rs || (e = vs(e)), e ? (e = e.rgb(), new Be(e.r, e.g, e.b, e.opacity)) : new Be();
}
function In(e, t, r, i) {
  return arguments.length === 1 ? X1(e) : new Be(e, t, r, i ?? 1);
}
function Be(e, t, r, i) {
  this.r = +e, this.g = +t, this.b = +r, this.opacity = +i;
}
Bl(Be, In, Of(Rs, {
  brighter(e) {
    return e = e == null ? Ao : Math.pow(Ao, e), new Be(this.r * e, this.g * e, this.b * e, this.opacity);
  },
  darker(e) {
    return e = e == null ? Ss : Math.pow(Ss, e), new Be(this.r * e, this.g * e, this.b * e, this.opacity);
  },
  rgb() {
    return this;
  },
  clamp() {
    return new Be(ti(this.r), ti(this.g), ti(this.b), Eo(this.opacity));
  },
  displayable() {
    return -0.5 <= this.r && this.r < 255.5 && -0.5 <= this.g && this.g < 255.5 && -0.5 <= this.b && this.b < 255.5 && 0 <= this.opacity && this.opacity <= 1;
  },
  hex: $c,
  // Deprecated! Use color.formatHex.
  formatHex: $c,
  formatHex8: V1,
  formatRgb: Oc,
  toString: Oc
}));
function $c() {
  return `#${Qr(this.r)}${Qr(this.g)}${Qr(this.b)}`;
}
function V1() {
  return `#${Qr(this.r)}${Qr(this.g)}${Qr(this.b)}${Qr((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}
function Oc() {
  const e = Eo(this.opacity);
  return `${e === 1 ? "rgb(" : "rgba("}${ti(this.r)}, ${ti(this.g)}, ${ti(this.b)}${e === 1 ? ")" : `, ${e})`}`;
}
function Eo(e) {
  return isNaN(e) ? 1 : Math.max(0, Math.min(1, e));
}
function ti(e) {
  return Math.max(0, Math.min(255, Math.round(e) || 0));
}
function Qr(e) {
  return e = ti(e), (e < 16 ? "0" : "") + e.toString(16);
}
function Dc(e, t, r, i) {
  return i <= 0 ? e = t = r = NaN : r <= 0 || r >= 1 ? e = t = NaN : t <= 0 && (e = NaN), new Ue(e, t, r, i);
}
function Df(e) {
  if (e instanceof Ue) return new Ue(e.h, e.s, e.l, e.opacity);
  if (e instanceof Rs || (e = vs(e)), !e) return new Ue();
  if (e instanceof Ue) return e;
  e = e.rgb();
  var t = e.r / 255, r = e.g / 255, i = e.b / 255, s = Math.min(t, r, i), o = Math.max(t, r, i), a = NaN, n = o - s, l = (o + s) / 2;
  return n ? (t === o ? a = (r - i) / n + (r < i) * 6 : r === o ? a = (i - t) / n + 2 : a = (t - r) / n + 4, n /= l < 0.5 ? o + s : 2 - o - s, a *= 60) : n = l > 0 && l < 1 ? 0 : a, new Ue(a, n, l, e.opacity);
}
function Z1(e, t, r, i) {
  return arguments.length === 1 ? Df(e) : new Ue(e, t, r, i ?? 1);
}
function Ue(e, t, r, i) {
  this.h = +e, this.s = +t, this.l = +r, this.opacity = +i;
}
Bl(Ue, Z1, Of(Rs, {
  brighter(e) {
    return e = e == null ? Ao : Math.pow(Ao, e), new Ue(this.h, this.s, this.l * e, this.opacity);
  },
  darker(e) {
    return e = e == null ? Ss : Math.pow(Ss, e), new Ue(this.h, this.s, this.l * e, this.opacity);
  },
  rgb() {
    var e = this.h % 360 + (this.h < 0) * 360, t = isNaN(e) || isNaN(this.s) ? 0 : this.s, r = this.l, i = r + (r < 0.5 ? r : 1 - r) * t, s = 2 * r - i;
    return new Be(
      Ia(e >= 240 ? e - 240 : e + 120, s, i),
      Ia(e, s, i),
      Ia(e < 120 ? e + 240 : e - 120, s, i),
      this.opacity
    );
  },
  clamp() {
    return new Ue(Ic(this.h), Ks(this.s), Ks(this.l), Eo(this.opacity));
  },
  displayable() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && 0 <= this.l && this.l <= 1 && 0 <= this.opacity && this.opacity <= 1;
  },
  formatHsl() {
    const e = Eo(this.opacity);
    return `${e === 1 ? "hsl(" : "hsla("}${Ic(this.h)}, ${Ks(this.s) * 100}%, ${Ks(this.l) * 100}%${e === 1 ? ")" : `, ${e})`}`;
  }
}));
function Ic(e) {
  return e = (e || 0) % 360, e < 0 ? e + 360 : e;
}
function Ks(e) {
  return Math.max(0, Math.min(1, e || 0));
}
function Ia(e, t, r) {
  return (e < 60 ? t + (r - t) * e / 60 : e < 180 ? r : e < 240 ? t + (r - t) * (240 - e) / 60 : t) * 255;
}
const Ll = (e) => () => e;
function If(e, t) {
  return function(r) {
    return e + r * t;
  };
}
function K1(e, t, r) {
  return e = Math.pow(e, r), t = Math.pow(t, r) - e, r = 1 / r, function(i) {
    return Math.pow(e + i * t, r);
  };
}
function T5(e, t) {
  var r = t - e;
  return r ? If(e, r > 180 || r < -180 ? r - 360 * Math.round(r / 360) : r) : Ll(isNaN(e) ? t : e);
}
function Q1(e) {
  return (e = +e) == 1 ? Pf : function(t, r) {
    return r - t ? K1(t, r, e) : Ll(isNaN(t) ? r : t);
  };
}
function Pf(e, t) {
  var r = t - e;
  return r ? If(e, r) : Ll(isNaN(e) ? t : e);
}
const Pc = (function e(t) {
  var r = Q1(t);
  function i(s, o) {
    var a = r((s = In(s)).r, (o = In(o)).r), n = r(s.g, o.g), l = r(s.b, o.b), c = Pf(s.opacity, o.opacity);
    return function(h) {
      return s.r = a(h), s.g = n(h), s.b = l(h), s.opacity = c(h), s + "";
    };
  }
  return i.gamma = e, i;
})(1);
function Ir(e, t) {
  return e = +e, t = +t, function(r) {
    return e * (1 - r) + t * r;
  };
}
var Pn = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g, Pa = new RegExp(Pn.source, "g");
function J1(e) {
  return function() {
    return e;
  };
}
function tk(e) {
  return function(t) {
    return e(t) + "";
  };
}
function ek(e, t) {
  var r = Pn.lastIndex = Pa.lastIndex = 0, i, s, o, a = -1, n = [], l = [];
  for (e = e + "", t = t + ""; (i = Pn.exec(e)) && (s = Pa.exec(t)); )
    (o = s.index) > r && (o = t.slice(r, o), n[a] ? n[a] += o : n[++a] = o), (i = i[0]) === (s = s[0]) ? n[a] ? n[a] += s : n[++a] = s : (n[++a] = null, l.push({ i: a, x: Ir(i, s) })), r = Pa.lastIndex;
  return r < t.length && (o = t.slice(r), n[a] ? n[a] += o : n[++a] = o), n.length < 2 ? l[0] ? tk(l[0].x) : J1(t) : (t = l.length, function(c) {
    for (var h = 0, u; h < t; ++h) n[(u = l[h]).i] = u.x(c);
    return n.join("");
  });
}
var Rc = 180 / Math.PI, Rn = {
  translateX: 0,
  translateY: 0,
  rotate: 0,
  skewX: 0,
  scaleX: 1,
  scaleY: 1
};
function Rf(e, t, r, i, s, o) {
  var a, n, l;
  return (a = Math.sqrt(e * e + t * t)) && (e /= a, t /= a), (l = e * r + t * i) && (r -= e * l, i -= t * l), (n = Math.sqrt(r * r + i * i)) && (r /= n, i /= n, l /= n), e * i < t * r && (e = -e, t = -t, l = -l, a = -a), {
    translateX: s,
    translateY: o,
    rotate: Math.atan2(t, e) * Rc,
    skewX: Math.atan(l) * Rc,
    scaleX: a,
    scaleY: n
  };
}
var Qs;
function rk(e) {
  const t = new (typeof DOMMatrix == "function" ? DOMMatrix : WebKitCSSMatrix)(e + "");
  return t.isIdentity ? Rn : Rf(t.a, t.b, t.c, t.d, t.e, t.f);
}
function ik(e) {
  return e == null || (Qs || (Qs = document.createElementNS("http://www.w3.org/2000/svg", "g")), Qs.setAttribute("transform", e), !(e = Qs.transform.baseVal.consolidate())) ? Rn : (e = e.matrix, Rf(e.a, e.b, e.c, e.d, e.e, e.f));
}
function Nf(e, t, r, i) {
  function s(c) {
    return c.length ? c.pop() + " " : "";
  }
  function o(c, h, u, d, f, m) {
    if (c !== u || h !== d) {
      var y = f.push("translate(", null, t, null, r);
      m.push({ i: y - 4, x: Ir(c, u) }, { i: y - 2, x: Ir(h, d) });
    } else (u || d) && f.push("translate(" + u + t + d + r);
  }
  function a(c, h, u, d) {
    c !== h ? (c - h > 180 ? h += 360 : h - c > 180 && (c += 360), d.push({ i: u.push(s(u) + "rotate(", null, i) - 2, x: Ir(c, h) })) : h && u.push(s(u) + "rotate(" + h + i);
  }
  function n(c, h, u, d) {
    c !== h ? d.push({ i: u.push(s(u) + "skewX(", null, i) - 2, x: Ir(c, h) }) : h && u.push(s(u) + "skewX(" + h + i);
  }
  function l(c, h, u, d, f, m) {
    if (c !== u || h !== d) {
      var y = f.push(s(f) + "scale(", null, ",", null, ")");
      m.push({ i: y - 4, x: Ir(c, u) }, { i: y - 2, x: Ir(h, d) });
    } else (u !== 1 || d !== 1) && f.push(s(f) + "scale(" + u + "," + d + ")");
  }
  return function(c, h) {
    var u = [], d = [];
    return c = e(c), h = e(h), o(c.translateX, c.translateY, h.translateX, h.translateY, u, d), a(c.rotate, h.rotate, u, d), n(c.skewX, h.skewX, u, d), l(c.scaleX, c.scaleY, h.scaleX, h.scaleY, u, d), c = h = null, function(f) {
      for (var m = -1, y = d.length, x; ++m < y; ) u[(x = d[m]).i] = x.x(f);
      return u.join("");
    };
  };
}
var sk = Nf(rk, "px, ", "px)", "deg)"), ok = Nf(ik, ", ", ")", ")"), Di = 0, ns = 0, Ki = 0, qf = 1e3, Mo, ls, $o = 0, ii = 0, Jo = 0, Bs = typeof performance == "object" && performance.now ? performance : Date, zf = typeof window == "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(e) {
  setTimeout(e, 17);
};
function Fl() {
  return ii || (zf(ak), ii = Bs.now() + Jo);
}
function ak() {
  ii = 0;
}
function Oo() {
  this._call = this._time = this._next = null;
}
Oo.prototype = Wf.prototype = {
  constructor: Oo,
  restart: function(e, t, r) {
    if (typeof e != "function") throw new TypeError("callback is not a function");
    r = (r == null ? Fl() : +r) + (t == null ? 0 : +t), !this._next && ls !== this && (ls ? ls._next = this : Mo = this, ls = this), this._call = e, this._time = r, Nn();
  },
  stop: function() {
    this._call && (this._call = null, this._time = 1 / 0, Nn());
  }
};
function Wf(e, t, r) {
  var i = new Oo();
  return i.restart(e, t, r), i;
}
function nk() {
  Fl(), ++Di;
  for (var e = Mo, t; e; )
    (t = ii - e._time) >= 0 && e._call.call(void 0, t), e = e._next;
  --Di;
}
function Nc() {
  ii = ($o = Bs.now()) + Jo, Di = ns = 0;
  try {
    nk();
  } finally {
    Di = 0, hk(), ii = 0;
  }
}
function lk() {
  var e = Bs.now(), t = e - $o;
  t > qf && (Jo -= t, $o = e);
}
function hk() {
  for (var e, t = Mo, r, i = 1 / 0; t; )
    t._call ? (i > t._time && (i = t._time), e = t, t = t._next) : (r = t._next, t._next = null, t = e ? e._next = r : Mo = r);
  ls = e, Nn(i);
}
function Nn(e) {
  if (!Di) {
    ns && (ns = clearTimeout(ns));
    var t = e - ii;
    t > 24 ? (e < 1 / 0 && (ns = setTimeout(Nc, e - Bs.now() - Jo)), Ki && (Ki = clearInterval(Ki))) : (Ki || ($o = Bs.now(), Ki = setInterval(lk, qf)), Di = 1, zf(Nc));
  }
}
function qc(e, t, r) {
  var i = new Oo();
  return t = t == null ? 0 : +t, i.restart((s) => {
    i.stop(), e(s + t);
  }, t, r), i;
}
var ck = kf("start", "end", "cancel", "interrupt"), uk = [], Hf = 0, zc = 1, qn = 2, go = 3, Wc = 4, zn = 5, mo = 6;
function ta(e, t, r, i, s, o) {
  var a = e.__transition;
  if (!a) e.__transition = {};
  else if (r in a) return;
  dk(e, r, {
    name: t,
    index: i,
    // For context during callback.
    group: s,
    // For context during callback.
    on: ck,
    tween: uk,
    time: o.time,
    delay: o.delay,
    duration: o.duration,
    ease: o.ease,
    timer: null,
    state: Hf
  });
}
function Al(e, t) {
  var r = Xe(e, t);
  if (r.state > Hf) throw new Error("too late; already scheduled");
  return r;
}
function ur(e, t) {
  var r = Xe(e, t);
  if (r.state > go) throw new Error("too late; already running");
  return r;
}
function Xe(e, t) {
  var r = e.__transition;
  if (!r || !(r = r[t])) throw new Error("transition not found");
  return r;
}
function dk(e, t, r) {
  var i = e.__transition, s;
  i[t] = r, r.timer = Wf(o, 0, r.time);
  function o(c) {
    r.state = zc, r.timer.restart(a, r.delay, r.time), r.delay <= c && a(c - r.delay);
  }
  function a(c) {
    var h, u, d, f;
    if (r.state !== zc) return l();
    for (h in i)
      if (f = i[h], f.name === r.name) {
        if (f.state === go) return qc(a);
        f.state === Wc ? (f.state = mo, f.timer.stop(), f.on.call("interrupt", e, e.__data__, f.index, f.group), delete i[h]) : +h < t && (f.state = mo, f.timer.stop(), f.on.call("cancel", e, e.__data__, f.index, f.group), delete i[h]);
      }
    if (qc(function() {
      r.state === go && (r.state = Wc, r.timer.restart(n, r.delay, r.time), n(c));
    }), r.state = qn, r.on.call("start", e, e.__data__, r.index, r.group), r.state === qn) {
      for (r.state = go, s = new Array(d = r.tween.length), h = 0, u = -1; h < d; ++h)
        (f = r.tween[h].value.call(e, e.__data__, r.index, r.group)) && (s[++u] = f);
      s.length = u + 1;
    }
  }
  function n(c) {
    for (var h = c < r.duration ? r.ease.call(null, c / r.duration) : (r.timer.restart(l), r.state = zn, 1), u = -1, d = s.length; ++u < d; )
      s[u].call(e, h);
    r.state === zn && (r.on.call("end", e, e.__data__, r.index, r.group), l());
  }
  function l() {
    r.state = mo, r.timer.stop(), delete i[t];
    for (var c in i) return;
    delete e.__transition;
  }
}
function fk(e, t) {
  var r = e.__transition, i, s, o = !0, a;
  if (r) {
    t = t == null ? null : t + "";
    for (a in r) {
      if ((i = r[a]).name !== t) {
        o = !1;
        continue;
      }
      s = i.state > qn && i.state < zn, i.state = mo, i.timer.stop(), i.on.call(s ? "interrupt" : "cancel", e, e.__data__, i.index, i.group), delete r[a];
    }
    o && delete e.__transition;
  }
}
function pk(e) {
  return this.each(function() {
    fk(this, e);
  });
}
function gk(e, t) {
  var r, i;
  return function() {
    var s = ur(this, e), o = s.tween;
    if (o !== r) {
      i = r = o;
      for (var a = 0, n = i.length; a < n; ++a)
        if (i[a].name === t) {
          i = i.slice(), i.splice(a, 1);
          break;
        }
    }
    s.tween = i;
  };
}
function mk(e, t, r) {
  var i, s;
  if (typeof r != "function") throw new Error();
  return function() {
    var o = ur(this, e), a = o.tween;
    if (a !== i) {
      s = (i = a).slice();
      for (var n = { name: t, value: r }, l = 0, c = s.length; l < c; ++l)
        if (s[l].name === t) {
          s[l] = n;
          break;
        }
      l === c && s.push(n);
    }
    o.tween = s;
  };
}
function yk(e, t) {
  var r = this._id;
  if (e += "", arguments.length < 2) {
    for (var i = Xe(this.node(), r).tween, s = 0, o = i.length, a; s < o; ++s)
      if ((a = i[s]).name === e)
        return a.value;
    return null;
  }
  return this.each((t == null ? gk : mk)(r, e, t));
}
function El(e, t, r) {
  var i = e._id;
  return e.each(function() {
    var s = ur(this, i);
    (s.value || (s.value = {}))[t] = r.apply(this, arguments);
  }), function(s) {
    return Xe(s, i).value[t];
  };
}
function Yf(e, t) {
  var r;
  return (typeof t == "number" ? Ir : t instanceof vs ? Pc : (r = vs(t)) ? (t = r, Pc) : ek)(e, t);
}
function xk(e) {
  return function() {
    this.removeAttribute(e);
  };
}
function Ck(e) {
  return function() {
    this.removeAttributeNS(e.space, e.local);
  };
}
function bk(e, t, r) {
  var i, s = r + "", o;
  return function() {
    var a = this.getAttribute(e);
    return a === s ? null : a === i ? o : o = t(i = a, r);
  };
}
function kk(e, t, r) {
  var i, s = r + "", o;
  return function() {
    var a = this.getAttributeNS(e.space, e.local);
    return a === s ? null : a === i ? o : o = t(i = a, r);
  };
}
function wk(e, t, r) {
  var i, s, o;
  return function() {
    var a, n = r(this), l;
    return n == null ? void this.removeAttribute(e) : (a = this.getAttribute(e), l = n + "", a === l ? null : a === i && l === s ? o : (s = l, o = t(i = a, n)));
  };
}
function Tk(e, t, r) {
  var i, s, o;
  return function() {
    var a, n = r(this), l;
    return n == null ? void this.removeAttributeNS(e.space, e.local) : (a = this.getAttributeNS(e.space, e.local), l = n + "", a === l ? null : a === i && l === s ? o : (s = l, o = t(i = a, n)));
  };
}
function Sk(e, t) {
  var r = Qo(e), i = r === "transform" ? ok : Yf;
  return this.attrTween(e, typeof t == "function" ? (r.local ? Tk : wk)(r, i, El(this, "attr." + e, t)) : t == null ? (r.local ? Ck : xk)(r) : (r.local ? kk : bk)(r, i, t));
}
function _k(e, t) {
  return function(r) {
    this.setAttribute(e, t.call(this, r));
  };
}
function vk(e, t) {
  return function(r) {
    this.setAttributeNS(e.space, e.local, t.call(this, r));
  };
}
function Bk(e, t) {
  var r, i;
  function s() {
    var o = t.apply(this, arguments);
    return o !== i && (r = (i = o) && vk(e, o)), r;
  }
  return s._value = t, s;
}
function Lk(e, t) {
  var r, i;
  function s() {
    var o = t.apply(this, arguments);
    return o !== i && (r = (i = o) && _k(e, o)), r;
  }
  return s._value = t, s;
}
function Fk(e, t) {
  var r = "attr." + e;
  if (arguments.length < 2) return (r = this.tween(r)) && r._value;
  if (t == null) return this.tween(r, null);
  if (typeof t != "function") throw new Error();
  var i = Qo(e);
  return this.tween(r, (i.local ? Bk : Lk)(i, t));
}
function Ak(e, t) {
  return function() {
    Al(this, e).delay = +t.apply(this, arguments);
  };
}
function Ek(e, t) {
  return t = +t, function() {
    Al(this, e).delay = t;
  };
}
function Mk(e) {
  var t = this._id;
  return arguments.length ? this.each((typeof e == "function" ? Ak : Ek)(t, e)) : Xe(this.node(), t).delay;
}
function $k(e, t) {
  return function() {
    ur(this, e).duration = +t.apply(this, arguments);
  };
}
function Ok(e, t) {
  return t = +t, function() {
    ur(this, e).duration = t;
  };
}
function Dk(e) {
  var t = this._id;
  return arguments.length ? this.each((typeof e == "function" ? $k : Ok)(t, e)) : Xe(this.node(), t).duration;
}
function Ik(e, t) {
  if (typeof t != "function") throw new Error();
  return function() {
    ur(this, e).ease = t;
  };
}
function Pk(e) {
  var t = this._id;
  return arguments.length ? this.each(Ik(t, e)) : Xe(this.node(), t).ease;
}
function Rk(e, t) {
  return function() {
    var r = t.apply(this, arguments);
    if (typeof r != "function") throw new Error();
    ur(this, e).ease = r;
  };
}
function Nk(e) {
  if (typeof e != "function") throw new Error();
  return this.each(Rk(this._id, e));
}
function qk(e) {
  typeof e != "function" && (e = Sf(e));
  for (var t = this._groups, r = t.length, i = new Array(r), s = 0; s < r; ++s)
    for (var o = t[s], a = o.length, n = i[s] = [], l, c = 0; c < a; ++c)
      (l = o[c]) && e.call(l, l.__data__, c, o) && n.push(l);
  return new Tr(i, this._parents, this._name, this._id);
}
function zk(e) {
  if (e._id !== this._id) throw new Error();
  for (var t = this._groups, r = e._groups, i = t.length, s = r.length, o = Math.min(i, s), a = new Array(i), n = 0; n < o; ++n)
    for (var l = t[n], c = r[n], h = l.length, u = a[n] = new Array(h), d, f = 0; f < h; ++f)
      (d = l[f] || c[f]) && (u[f] = d);
  for (; n < i; ++n)
    a[n] = t[n];
  return new Tr(a, this._parents, this._name, this._id);
}
function Wk(e) {
  return (e + "").trim().split(/^|\s+/).every(function(t) {
    var r = t.indexOf(".");
    return r >= 0 && (t = t.slice(0, r)), !t || t === "start";
  });
}
function Hk(e, t, r) {
  var i, s, o = Wk(t) ? Al : ur;
  return function() {
    var a = o(this, e), n = a.on;
    n !== i && (s = (i = n).copy()).on(t, r), a.on = s;
  };
}
function Yk(e, t) {
  var r = this._id;
  return arguments.length < 2 ? Xe(this.node(), r).on.on(e) : this.each(Hk(r, e, t));
}
function Uk(e) {
  return function() {
    var t = this.parentNode;
    for (var r in this.__transition) if (+r !== e) return;
    t && t.removeChild(this);
  };
}
function jk() {
  return this.on("end.remove", Uk(this._id));
}
function Gk(e) {
  var t = this._name, r = this._id;
  typeof e != "function" && (e = _l(e));
  for (var i = this._groups, s = i.length, o = new Array(s), a = 0; a < s; ++a)
    for (var n = i[a], l = n.length, c = o[a] = new Array(l), h, u, d = 0; d < l; ++d)
      (h = n[d]) && (u = e.call(h, h.__data__, d, n)) && ("__data__" in h && (u.__data__ = h.__data__), c[d] = u, ta(c[d], t, r, d, c, Xe(h, r)));
  return new Tr(o, this._parents, t, r);
}
function Xk(e) {
  var t = this._name, r = this._id;
  typeof e != "function" && (e = Tf(e));
  for (var i = this._groups, s = i.length, o = [], a = [], n = 0; n < s; ++n)
    for (var l = i[n], c = l.length, h, u = 0; u < c; ++u)
      if (h = l[u]) {
        for (var d = e.call(h, h.__data__, u, l), f, m = Xe(h, r), y = 0, x = d.length; y < x; ++y)
          (f = d[y]) && ta(f, t, r, y, d, m);
        o.push(d), a.push(h);
      }
  return new Tr(o, a, t, r);
}
var Vk = Ps.prototype.constructor;
function Zk() {
  return new Vk(this._groups, this._parents);
}
function Kk(e, t) {
  var r, i, s;
  return function() {
    var o = Oi(this, e), a = (this.style.removeProperty(e), Oi(this, e));
    return o === a ? null : o === r && a === i ? s : s = t(r = o, i = a);
  };
}
function Uf(e) {
  return function() {
    this.style.removeProperty(e);
  };
}
function Qk(e, t, r) {
  var i, s = r + "", o;
  return function() {
    var a = Oi(this, e);
    return a === s ? null : a === i ? o : o = t(i = a, r);
  };
}
function Jk(e, t, r) {
  var i, s, o;
  return function() {
    var a = Oi(this, e), n = r(this), l = n + "";
    return n == null && (l = n = (this.style.removeProperty(e), Oi(this, e))), a === l ? null : a === i && l === s ? o : (s = l, o = t(i = a, n));
  };
}
function t2(e, t) {
  var r, i, s, o = "style." + t, a = "end." + o, n;
  return function() {
    var l = ur(this, e), c = l.on, h = l.value[o] == null ? n || (n = Uf(t)) : void 0;
    (c !== r || s !== h) && (i = (r = c).copy()).on(a, s = h), l.on = i;
  };
}
function e2(e, t, r) {
  var i = (e += "") == "transform" ? sk : Yf;
  return t == null ? this.styleTween(e, Kk(e, i)).on("end.style." + e, Uf(e)) : typeof t == "function" ? this.styleTween(e, Jk(e, i, El(this, "style." + e, t))).each(t2(this._id, e)) : this.styleTween(e, Qk(e, i, t), r).on("end.style." + e, null);
}
function r2(e, t, r) {
  return function(i) {
    this.style.setProperty(e, t.call(this, i), r);
  };
}
function i2(e, t, r) {
  var i, s;
  function o() {
    var a = t.apply(this, arguments);
    return a !== s && (i = (s = a) && r2(e, a, r)), i;
  }
  return o._value = t, o;
}
function s2(e, t, r) {
  var i = "style." + (e += "");
  if (arguments.length < 2) return (i = this.tween(i)) && i._value;
  if (t == null) return this.tween(i, null);
  if (typeof t != "function") throw new Error();
  return this.tween(i, i2(e, t, r ?? ""));
}
function o2(e) {
  return function() {
    this.textContent = e;
  };
}
function a2(e) {
  return function() {
    var t = e(this);
    this.textContent = t ?? "";
  };
}
function n2(e) {
  return this.tween("text", typeof e == "function" ? a2(El(this, "text", e)) : o2(e == null ? "" : e + ""));
}
function l2(e) {
  return function(t) {
    this.textContent = e.call(this, t);
  };
}
function h2(e) {
  var t, r;
  function i() {
    var s = e.apply(this, arguments);
    return s !== r && (t = (r = s) && l2(s)), t;
  }
  return i._value = e, i;
}
function c2(e) {
  var t = "text";
  if (arguments.length < 1) return (t = this.tween(t)) && t._value;
  if (e == null) return this.tween(t, null);
  if (typeof e != "function") throw new Error();
  return this.tween(t, h2(e));
}
function u2() {
  for (var e = this._name, t = this._id, r = jf(), i = this._groups, s = i.length, o = 0; o < s; ++o)
    for (var a = i[o], n = a.length, l, c = 0; c < n; ++c)
      if (l = a[c]) {
        var h = Xe(l, t);
        ta(l, e, r, c, a, {
          time: h.time + h.delay + h.duration,
          delay: 0,
          duration: h.duration,
          ease: h.ease
        });
      }
  return new Tr(i, this._parents, e, r);
}
function d2() {
  var e, t, r = this, i = r._id, s = r.size();
  return new Promise(function(o, a) {
    var n = { value: a }, l = { value: function() {
      --s === 0 && o();
    } };
    r.each(function() {
      var c = ur(this, i), h = c.on;
      h !== e && (t = (e = h).copy(), t._.cancel.push(n), t._.interrupt.push(n), t._.end.push(l)), c.on = t;
    }), s === 0 && o();
  });
}
var f2 = 0;
function Tr(e, t, r, i) {
  this._groups = e, this._parents = t, this._name = r, this._id = i;
}
function jf() {
  return ++f2;
}
var yr = Ps.prototype;
Tr.prototype = {
  constructor: Tr,
  select: Gk,
  selectAll: Xk,
  selectChild: yr.selectChild,
  selectChildren: yr.selectChildren,
  filter: qk,
  merge: zk,
  selection: Zk,
  transition: u2,
  call: yr.call,
  nodes: yr.nodes,
  node: yr.node,
  size: yr.size,
  empty: yr.empty,
  each: yr.each,
  on: Yk,
  attr: Sk,
  attrTween: Fk,
  style: e2,
  styleTween: s2,
  text: n2,
  textTween: c2,
  remove: jk,
  tween: yk,
  delay: Mk,
  duration: Dk,
  ease: Pk,
  easeVarying: Nk,
  end: d2,
  [Symbol.iterator]: yr[Symbol.iterator]
};
function p2(e) {
  return ((e *= 2) <= 1 ? e * e * e : (e -= 2) * e * e + 2) / 2;
}
var g2 = {
  time: null,
  // Set on use.
  delay: 0,
  duration: 250,
  ease: p2
};
function m2(e, t) {
  for (var r; !(r = e.__transition) || !(r = r[t]); )
    if (!(e = e.parentNode))
      throw new Error(`transition ${t} not found`);
  return r;
}
function y2(e) {
  var t, r;
  e instanceof Tr ? (t = e._id, e = e._name) : (t = jf(), (r = g2).time = Fl(), e = e == null ? null : e + "");
  for (var i = this._groups, s = i.length, o = 0; o < s; ++o)
    for (var a = i[o], n = a.length, l, c = 0; c < n; ++c)
      (l = a[c]) && ta(l, e, t, c, a, r || m2(l, t));
  return new Tr(i, this._parents, e, t);
}
Ps.prototype.interrupt = pk;
Ps.prototype.transition = y2;
const Wn = Math.PI, Hn = 2 * Wn, Vr = 1e-6, x2 = Hn - Vr;
function Gf(e) {
  this._ += e[0];
  for (let t = 1, r = e.length; t < r; ++t)
    this._ += arguments[t] + e[t];
}
function C2(e) {
  let t = Math.floor(e);
  if (!(t >= 0)) throw new Error(`invalid digits: ${e}`);
  if (t > 15) return Gf;
  const r = 10 ** t;
  return function(i) {
    this._ += i[0];
    for (let s = 1, o = i.length; s < o; ++s)
      this._ += Math.round(arguments[s] * r) / r + i[s];
  };
}
class b2 {
  constructor(t) {
    this._x0 = this._y0 = // start of current subpath
    this._x1 = this._y1 = null, this._ = "", this._append = t == null ? Gf : C2(t);
  }
  moveTo(t, r) {
    this._append`M${this._x0 = this._x1 = +t},${this._y0 = this._y1 = +r}`;
  }
  closePath() {
    this._x1 !== null && (this._x1 = this._x0, this._y1 = this._y0, this._append`Z`);
  }
  lineTo(t, r) {
    this._append`L${this._x1 = +t},${this._y1 = +r}`;
  }
  quadraticCurveTo(t, r, i, s) {
    this._append`Q${+t},${+r},${this._x1 = +i},${this._y1 = +s}`;
  }
  bezierCurveTo(t, r, i, s, o, a) {
    this._append`C${+t},${+r},${+i},${+s},${this._x1 = +o},${this._y1 = +a}`;
  }
  arcTo(t, r, i, s, o) {
    if (t = +t, r = +r, i = +i, s = +s, o = +o, o < 0) throw new Error(`negative radius: ${o}`);
    let a = this._x1, n = this._y1, l = i - t, c = s - r, h = a - t, u = n - r, d = h * h + u * u;
    if (this._x1 === null)
      this._append`M${this._x1 = t},${this._y1 = r}`;
    else if (d > Vr) if (!(Math.abs(u * l - c * h) > Vr) || !o)
      this._append`L${this._x1 = t},${this._y1 = r}`;
    else {
      let f = i - a, m = s - n, y = l * l + c * c, x = f * f + m * m, C = Math.sqrt(y), k = Math.sqrt(d), T = o * Math.tan((Wn - Math.acos((y + d - x) / (2 * C * k))) / 2), _ = T / k, v = T / C;
      Math.abs(_ - 1) > Vr && this._append`L${t + _ * h},${r + _ * u}`, this._append`A${o},${o},0,0,${+(u * f > h * m)},${this._x1 = t + v * l},${this._y1 = r + v * c}`;
    }
  }
  arc(t, r, i, s, o, a) {
    if (t = +t, r = +r, i = +i, a = !!a, i < 0) throw new Error(`negative radius: ${i}`);
    let n = i * Math.cos(s), l = i * Math.sin(s), c = t + n, h = r + l, u = 1 ^ a, d = a ? s - o : o - s;
    this._x1 === null ? this._append`M${c},${h}` : (Math.abs(this._x1 - c) > Vr || Math.abs(this._y1 - h) > Vr) && this._append`L${c},${h}`, i && (d < 0 && (d = d % Hn + Hn), d > x2 ? this._append`A${i},${i},0,1,${u},${t - n},${r - l}A${i},${i},0,1,${u},${this._x1 = c},${this._y1 = h}` : d > Vr && this._append`A${i},${i},0,${+(d >= Wn)},${u},${this._x1 = t + i * Math.cos(o)},${this._y1 = r + i * Math.sin(o)}`);
  }
  rect(t, r, i, s) {
    this._append`M${this._x0 = this._x1 = +t},${this._y0 = this._y1 = +r}h${i = +i}v${+s}h${-i}Z`;
  }
  toString() {
    return this._;
  }
}
function xi(e) {
  return function() {
    return e;
  };
}
const S5 = Math.abs, _5 = Math.atan2, v5 = Math.cos, B5 = Math.max, L5 = Math.min, F5 = Math.sin, A5 = Math.sqrt, Hc = 1e-12, Ml = Math.PI, Yc = Ml / 2, E5 = 2 * Ml;
function M5(e) {
  return e > 1 ? 0 : e < -1 ? Ml : Math.acos(e);
}
function $5(e) {
  return e >= 1 ? Yc : e <= -1 ? -Yc : Math.asin(e);
}
function k2(e) {
  let t = 3;
  return e.digits = function(r) {
    if (!arguments.length) return t;
    if (r == null)
      t = null;
    else {
      const i = Math.floor(r);
      if (!(i >= 0)) throw new RangeError(`invalid digits: ${r}`);
      t = i;
    }
    return e;
  }, () => new b2(t);
}
function w2(e) {
  return typeof e == "object" && "length" in e ? e : Array.from(e);
}
function Xf(e) {
  this._context = e;
}
Xf.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._point = 0;
  },
  lineEnd: function() {
    (this._line || this._line !== 0 && this._point === 1) && this._context.closePath(), this._line = 1 - this._line;
  },
  point: function(e, t) {
    switch (e = +e, t = +t, this._point) {
      case 0:
        this._point = 1, this._line ? this._context.lineTo(e, t) : this._context.moveTo(e, t);
        break;
      case 1:
        this._point = 2;
      // falls through
      default:
        this._context.lineTo(e, t);
        break;
    }
  }
};
function Cs(e) {
  return new Xf(e);
}
function T2(e) {
  return e[0];
}
function S2(e) {
  return e[1];
}
function _2(e, t) {
  var r = xi(!0), i = null, s = Cs, o = null, a = k2(n);
  e = typeof e == "function" ? e : e === void 0 ? T2 : xi(e), t = typeof t == "function" ? t : t === void 0 ? S2 : xi(t);
  function n(l) {
    var c, h = (l = w2(l)).length, u, d = !1, f;
    for (i == null && (o = s(f = a())), c = 0; c <= h; ++c)
      !(c < h && r(u = l[c], c, l)) === d && ((d = !d) ? o.lineStart() : o.lineEnd()), d && o.point(+e(u, c, l), +t(u, c, l));
    if (f) return o = null, f + "" || null;
  }
  return n.x = function(l) {
    return arguments.length ? (e = typeof l == "function" ? l : xi(+l), n) : e;
  }, n.y = function(l) {
    return arguments.length ? (t = typeof l == "function" ? l : xi(+l), n) : t;
  }, n.defined = function(l) {
    return arguments.length ? (r = typeof l == "function" ? l : xi(!!l), n) : r;
  }, n.curve = function(l) {
    return arguments.length ? (s = l, i != null && (o = s(i)), n) : s;
  }, n.context = function(l) {
    return arguments.length ? (l == null ? i = o = null : o = s(i = l), n) : i;
  }, n;
}
class Vf {
  constructor(t, r) {
    this._context = t, this._x = r;
  }
  areaStart() {
    this._line = 0;
  }
  areaEnd() {
    this._line = NaN;
  }
  lineStart() {
    this._point = 0;
  }
  lineEnd() {
    (this._line || this._line !== 0 && this._point === 1) && this._context.closePath(), this._line = 1 - this._line;
  }
  point(t, r) {
    switch (t = +t, r = +r, this._point) {
      case 0: {
        this._point = 1, this._line ? this._context.lineTo(t, r) : this._context.moveTo(t, r);
        break;
      }
      case 1:
        this._point = 2;
      // falls through
      default: {
        this._x ? this._context.bezierCurveTo(this._x0 = (this._x0 + t) / 2, this._y0, this._x0, r, t, r) : this._context.bezierCurveTo(this._x0, this._y0 = (this._y0 + r) / 2, t, this._y0, t, r);
        break;
      }
    }
    this._x0 = t, this._y0 = r;
  }
}
function Zf(e) {
  return new Vf(e, !0);
}
function Kf(e) {
  return new Vf(e, !1);
}
function qr() {
}
function Do(e, t, r) {
  e._context.bezierCurveTo(
    (2 * e._x0 + e._x1) / 3,
    (2 * e._y0 + e._y1) / 3,
    (e._x0 + 2 * e._x1) / 3,
    (e._y0 + 2 * e._y1) / 3,
    (e._x0 + 4 * e._x1 + t) / 6,
    (e._y0 + 4 * e._y1 + r) / 6
  );
}
function ea(e) {
  this._context = e;
}
ea.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x0 = this._x1 = this._y0 = this._y1 = NaN, this._point = 0;
  },
  lineEnd: function() {
    switch (this._point) {
      case 3:
        Do(this, this._x1, this._y1);
      // falls through
      case 2:
        this._context.lineTo(this._x1, this._y1);
        break;
    }
    (this._line || this._line !== 0 && this._point === 1) && this._context.closePath(), this._line = 1 - this._line;
  },
  point: function(e, t) {
    switch (e = +e, t = +t, this._point) {
      case 0:
        this._point = 1, this._line ? this._context.lineTo(e, t) : this._context.moveTo(e, t);
        break;
      case 1:
        this._point = 2;
        break;
      case 2:
        this._point = 3, this._context.lineTo((5 * this._x0 + this._x1) / 6, (5 * this._y0 + this._y1) / 6);
      // falls through
      default:
        Do(this, e, t);
        break;
    }
    this._x0 = this._x1, this._x1 = e, this._y0 = this._y1, this._y1 = t;
  }
};
function Yn(e) {
  return new ea(e);
}
function Qf(e) {
  this._context = e;
}
Qf.prototype = {
  areaStart: qr,
  areaEnd: qr,
  lineStart: function() {
    this._x0 = this._x1 = this._x2 = this._x3 = this._x4 = this._y0 = this._y1 = this._y2 = this._y3 = this._y4 = NaN, this._point = 0;
  },
  lineEnd: function() {
    switch (this._point) {
      case 1: {
        this._context.moveTo(this._x2, this._y2), this._context.closePath();
        break;
      }
      case 2: {
        this._context.moveTo((this._x2 + 2 * this._x3) / 3, (this._y2 + 2 * this._y3) / 3), this._context.lineTo((this._x3 + 2 * this._x2) / 3, (this._y3 + 2 * this._y2) / 3), this._context.closePath();
        break;
      }
      case 3: {
        this.point(this._x2, this._y2), this.point(this._x3, this._y3), this.point(this._x4, this._y4);
        break;
      }
    }
  },
  point: function(e, t) {
    switch (e = +e, t = +t, this._point) {
      case 0:
        this._point = 1, this._x2 = e, this._y2 = t;
        break;
      case 1:
        this._point = 2, this._x3 = e, this._y3 = t;
        break;
      case 2:
        this._point = 3, this._x4 = e, this._y4 = t, this._context.moveTo((this._x0 + 4 * this._x1 + e) / 6, (this._y0 + 4 * this._y1 + t) / 6);
        break;
      default:
        Do(this, e, t);
        break;
    }
    this._x0 = this._x1, this._x1 = e, this._y0 = this._y1, this._y1 = t;
  }
};
function v2(e) {
  return new Qf(e);
}
function Jf(e) {
  this._context = e;
}
Jf.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x0 = this._x1 = this._y0 = this._y1 = NaN, this._point = 0;
  },
  lineEnd: function() {
    (this._line || this._line !== 0 && this._point === 3) && this._context.closePath(), this._line = 1 - this._line;
  },
  point: function(e, t) {
    switch (e = +e, t = +t, this._point) {
      case 0:
        this._point = 1;
        break;
      case 1:
        this._point = 2;
        break;
      case 2:
        this._point = 3;
        var r = (this._x0 + 4 * this._x1 + e) / 6, i = (this._y0 + 4 * this._y1 + t) / 6;
        this._line ? this._context.lineTo(r, i) : this._context.moveTo(r, i);
        break;
      case 3:
        this._point = 4;
      // falls through
      default:
        Do(this, e, t);
        break;
    }
    this._x0 = this._x1, this._x1 = e, this._y0 = this._y1, this._y1 = t;
  }
};
function B2(e) {
  return new Jf(e);
}
function tp(e, t) {
  this._basis = new ea(e), this._beta = t;
}
tp.prototype = {
  lineStart: function() {
    this._x = [], this._y = [], this._basis.lineStart();
  },
  lineEnd: function() {
    var e = this._x, t = this._y, r = e.length - 1;
    if (r > 0)
      for (var i = e[0], s = t[0], o = e[r] - i, a = t[r] - s, n = -1, l; ++n <= r; )
        l = n / r, this._basis.point(
          this._beta * e[n] + (1 - this._beta) * (i + l * o),
          this._beta * t[n] + (1 - this._beta) * (s + l * a)
        );
    this._x = this._y = null, this._basis.lineEnd();
  },
  point: function(e, t) {
    this._x.push(+e), this._y.push(+t);
  }
};
const L2 = (function e(t) {
  function r(i) {
    return t === 1 ? new ea(i) : new tp(i, t);
  }
  return r.beta = function(i) {
    return e(+i);
  }, r;
})(0.85);
function Io(e, t, r) {
  e._context.bezierCurveTo(
    e._x1 + e._k * (e._x2 - e._x0),
    e._y1 + e._k * (e._y2 - e._y0),
    e._x2 + e._k * (e._x1 - t),
    e._y2 + e._k * (e._y1 - r),
    e._x2,
    e._y2
  );
}
function $l(e, t) {
  this._context = e, this._k = (1 - t) / 6;
}
$l.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x0 = this._x1 = this._x2 = this._y0 = this._y1 = this._y2 = NaN, this._point = 0;
  },
  lineEnd: function() {
    switch (this._point) {
      case 2:
        this._context.lineTo(this._x2, this._y2);
        break;
      case 3:
        Io(this, this._x1, this._y1);
        break;
    }
    (this._line || this._line !== 0 && this._point === 1) && this._context.closePath(), this._line = 1 - this._line;
  },
  point: function(e, t) {
    switch (e = +e, t = +t, this._point) {
      case 0:
        this._point = 1, this._line ? this._context.lineTo(e, t) : this._context.moveTo(e, t);
        break;
      case 1:
        this._point = 2, this._x1 = e, this._y1 = t;
        break;
      case 2:
        this._point = 3;
      // falls through
      default:
        Io(this, e, t);
        break;
    }
    this._x0 = this._x1, this._x1 = this._x2, this._x2 = e, this._y0 = this._y1, this._y1 = this._y2, this._y2 = t;
  }
};
const ep = (function e(t) {
  function r(i) {
    return new $l(i, t);
  }
  return r.tension = function(i) {
    return e(+i);
  }, r;
})(0);
function Ol(e, t) {
  this._context = e, this._k = (1 - t) / 6;
}
Ol.prototype = {
  areaStart: qr,
  areaEnd: qr,
  lineStart: function() {
    this._x0 = this._x1 = this._x2 = this._x3 = this._x4 = this._x5 = this._y0 = this._y1 = this._y2 = this._y3 = this._y4 = this._y5 = NaN, this._point = 0;
  },
  lineEnd: function() {
    switch (this._point) {
      case 1: {
        this._context.moveTo(this._x3, this._y3), this._context.closePath();
        break;
      }
      case 2: {
        this._context.lineTo(this._x3, this._y3), this._context.closePath();
        break;
      }
      case 3: {
        this.point(this._x3, this._y3), this.point(this._x4, this._y4), this.point(this._x5, this._y5);
        break;
      }
    }
  },
  point: function(e, t) {
    switch (e = +e, t = +t, this._point) {
      case 0:
        this._point = 1, this._x3 = e, this._y3 = t;
        break;
      case 1:
        this._point = 2, this._context.moveTo(this._x4 = e, this._y4 = t);
        break;
      case 2:
        this._point = 3, this._x5 = e, this._y5 = t;
        break;
      default:
        Io(this, e, t);
        break;
    }
    this._x0 = this._x1, this._x1 = this._x2, this._x2 = e, this._y0 = this._y1, this._y1 = this._y2, this._y2 = t;
  }
};
const F2 = (function e(t) {
  function r(i) {
    return new Ol(i, t);
  }
  return r.tension = function(i) {
    return e(+i);
  }, r;
})(0);
function Dl(e, t) {
  this._context = e, this._k = (1 - t) / 6;
}
Dl.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x0 = this._x1 = this._x2 = this._y0 = this._y1 = this._y2 = NaN, this._point = 0;
  },
  lineEnd: function() {
    (this._line || this._line !== 0 && this._point === 3) && this._context.closePath(), this._line = 1 - this._line;
  },
  point: function(e, t) {
    switch (e = +e, t = +t, this._point) {
      case 0:
        this._point = 1;
        break;
      case 1:
        this._point = 2;
        break;
      case 2:
        this._point = 3, this._line ? this._context.lineTo(this._x2, this._y2) : this._context.moveTo(this._x2, this._y2);
        break;
      case 3:
        this._point = 4;
      // falls through
      default:
        Io(this, e, t);
        break;
    }
    this._x0 = this._x1, this._x1 = this._x2, this._x2 = e, this._y0 = this._y1, this._y1 = this._y2, this._y2 = t;
  }
};
const A2 = (function e(t) {
  function r(i) {
    return new Dl(i, t);
  }
  return r.tension = function(i) {
    return e(+i);
  }, r;
})(0);
function Il(e, t, r) {
  var i = e._x1, s = e._y1, o = e._x2, a = e._y2;
  if (e._l01_a > Hc) {
    var n = 2 * e._l01_2a + 3 * e._l01_a * e._l12_a + e._l12_2a, l = 3 * e._l01_a * (e._l01_a + e._l12_a);
    i = (i * n - e._x0 * e._l12_2a + e._x2 * e._l01_2a) / l, s = (s * n - e._y0 * e._l12_2a + e._y2 * e._l01_2a) / l;
  }
  if (e._l23_a > Hc) {
    var c = 2 * e._l23_2a + 3 * e._l23_a * e._l12_a + e._l12_2a, h = 3 * e._l23_a * (e._l23_a + e._l12_a);
    o = (o * c + e._x1 * e._l23_2a - t * e._l12_2a) / h, a = (a * c + e._y1 * e._l23_2a - r * e._l12_2a) / h;
  }
  e._context.bezierCurveTo(i, s, o, a, e._x2, e._y2);
}
function rp(e, t) {
  this._context = e, this._alpha = t;
}
rp.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x0 = this._x1 = this._x2 = this._y0 = this._y1 = this._y2 = NaN, this._l01_a = this._l12_a = this._l23_a = this._l01_2a = this._l12_2a = this._l23_2a = this._point = 0;
  },
  lineEnd: function() {
    switch (this._point) {
      case 2:
        this._context.lineTo(this._x2, this._y2);
        break;
      case 3:
        this.point(this._x2, this._y2);
        break;
    }
    (this._line || this._line !== 0 && this._point === 1) && this._context.closePath(), this._line = 1 - this._line;
  },
  point: function(e, t) {
    if (e = +e, t = +t, this._point) {
      var r = this._x2 - e, i = this._y2 - t;
      this._l23_a = Math.sqrt(this._l23_2a = Math.pow(r * r + i * i, this._alpha));
    }
    switch (this._point) {
      case 0:
        this._point = 1, this._line ? this._context.lineTo(e, t) : this._context.moveTo(e, t);
        break;
      case 1:
        this._point = 2;
        break;
      case 2:
        this._point = 3;
      // falls through
      default:
        Il(this, e, t);
        break;
    }
    this._l01_a = this._l12_a, this._l12_a = this._l23_a, this._l01_2a = this._l12_2a, this._l12_2a = this._l23_2a, this._x0 = this._x1, this._x1 = this._x2, this._x2 = e, this._y0 = this._y1, this._y1 = this._y2, this._y2 = t;
  }
};
const ip = (function e(t) {
  function r(i) {
    return t ? new rp(i, t) : new $l(i, 0);
  }
  return r.alpha = function(i) {
    return e(+i);
  }, r;
})(0.5);
function sp(e, t) {
  this._context = e, this._alpha = t;
}
sp.prototype = {
  areaStart: qr,
  areaEnd: qr,
  lineStart: function() {
    this._x0 = this._x1 = this._x2 = this._x3 = this._x4 = this._x5 = this._y0 = this._y1 = this._y2 = this._y3 = this._y4 = this._y5 = NaN, this._l01_a = this._l12_a = this._l23_a = this._l01_2a = this._l12_2a = this._l23_2a = this._point = 0;
  },
  lineEnd: function() {
    switch (this._point) {
      case 1: {
        this._context.moveTo(this._x3, this._y3), this._context.closePath();
        break;
      }
      case 2: {
        this._context.lineTo(this._x3, this._y3), this._context.closePath();
        break;
      }
      case 3: {
        this.point(this._x3, this._y3), this.point(this._x4, this._y4), this.point(this._x5, this._y5);
        break;
      }
    }
  },
  point: function(e, t) {
    if (e = +e, t = +t, this._point) {
      var r = this._x2 - e, i = this._y2 - t;
      this._l23_a = Math.sqrt(this._l23_2a = Math.pow(r * r + i * i, this._alpha));
    }
    switch (this._point) {
      case 0:
        this._point = 1, this._x3 = e, this._y3 = t;
        break;
      case 1:
        this._point = 2, this._context.moveTo(this._x4 = e, this._y4 = t);
        break;
      case 2:
        this._point = 3, this._x5 = e, this._y5 = t;
        break;
      default:
        Il(this, e, t);
        break;
    }
    this._l01_a = this._l12_a, this._l12_a = this._l23_a, this._l01_2a = this._l12_2a, this._l12_2a = this._l23_2a, this._x0 = this._x1, this._x1 = this._x2, this._x2 = e, this._y0 = this._y1, this._y1 = this._y2, this._y2 = t;
  }
};
const E2 = (function e(t) {
  function r(i) {
    return t ? new sp(i, t) : new Ol(i, 0);
  }
  return r.alpha = function(i) {
    return e(+i);
  }, r;
})(0.5);
function op(e, t) {
  this._context = e, this._alpha = t;
}
op.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x0 = this._x1 = this._x2 = this._y0 = this._y1 = this._y2 = NaN, this._l01_a = this._l12_a = this._l23_a = this._l01_2a = this._l12_2a = this._l23_2a = this._point = 0;
  },
  lineEnd: function() {
    (this._line || this._line !== 0 && this._point === 3) && this._context.closePath(), this._line = 1 - this._line;
  },
  point: function(e, t) {
    if (e = +e, t = +t, this._point) {
      var r = this._x2 - e, i = this._y2 - t;
      this._l23_a = Math.sqrt(this._l23_2a = Math.pow(r * r + i * i, this._alpha));
    }
    switch (this._point) {
      case 0:
        this._point = 1;
        break;
      case 1:
        this._point = 2;
        break;
      case 2:
        this._point = 3, this._line ? this._context.lineTo(this._x2, this._y2) : this._context.moveTo(this._x2, this._y2);
        break;
      case 3:
        this._point = 4;
      // falls through
      default:
        Il(this, e, t);
        break;
    }
    this._l01_a = this._l12_a, this._l12_a = this._l23_a, this._l01_2a = this._l12_2a, this._l12_2a = this._l23_2a, this._x0 = this._x1, this._x1 = this._x2, this._x2 = e, this._y0 = this._y1, this._y1 = this._y2, this._y2 = t;
  }
};
const M2 = (function e(t) {
  function r(i) {
    return t ? new op(i, t) : new Dl(i, 0);
  }
  return r.alpha = function(i) {
    return e(+i);
  }, r;
})(0.5);
function ap(e) {
  this._context = e;
}
ap.prototype = {
  areaStart: qr,
  areaEnd: qr,
  lineStart: function() {
    this._point = 0;
  },
  lineEnd: function() {
    this._point && this._context.closePath();
  },
  point: function(e, t) {
    e = +e, t = +t, this._point ? this._context.lineTo(e, t) : (this._point = 1, this._context.moveTo(e, t));
  }
};
function $2(e) {
  return new ap(e);
}
function Uc(e) {
  return e < 0 ? -1 : 1;
}
function jc(e, t, r) {
  var i = e._x1 - e._x0, s = t - e._x1, o = (e._y1 - e._y0) / (i || s < 0 && -0), a = (r - e._y1) / (s || i < 0 && -0), n = (o * s + a * i) / (i + s);
  return (Uc(o) + Uc(a)) * Math.min(Math.abs(o), Math.abs(a), 0.5 * Math.abs(n)) || 0;
}
function Gc(e, t) {
  var r = e._x1 - e._x0;
  return r ? (3 * (e._y1 - e._y0) / r - t) / 2 : t;
}
function Ra(e, t, r) {
  var i = e._x0, s = e._y0, o = e._x1, a = e._y1, n = (o - i) / 3;
  e._context.bezierCurveTo(i + n, s + n * t, o - n, a - n * r, o, a);
}
function Po(e) {
  this._context = e;
}
Po.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x0 = this._x1 = this._y0 = this._y1 = this._t0 = NaN, this._point = 0;
  },
  lineEnd: function() {
    switch (this._point) {
      case 2:
        this._context.lineTo(this._x1, this._y1);
        break;
      case 3:
        Ra(this, this._t0, Gc(this, this._t0));
        break;
    }
    (this._line || this._line !== 0 && this._point === 1) && this._context.closePath(), this._line = 1 - this._line;
  },
  point: function(e, t) {
    var r = NaN;
    if (e = +e, t = +t, !(e === this._x1 && t === this._y1)) {
      switch (this._point) {
        case 0:
          this._point = 1, this._line ? this._context.lineTo(e, t) : this._context.moveTo(e, t);
          break;
        case 1:
          this._point = 2;
          break;
        case 2:
          this._point = 3, Ra(this, Gc(this, r = jc(this, e, t)), r);
          break;
        default:
          Ra(this, this._t0, r = jc(this, e, t));
          break;
      }
      this._x0 = this._x1, this._x1 = e, this._y0 = this._y1, this._y1 = t, this._t0 = r;
    }
  }
};
function np(e) {
  this._context = new lp(e);
}
(np.prototype = Object.create(Po.prototype)).point = function(e, t) {
  Po.prototype.point.call(this, t, e);
};
function lp(e) {
  this._context = e;
}
lp.prototype = {
  moveTo: function(e, t) {
    this._context.moveTo(t, e);
  },
  closePath: function() {
    this._context.closePath();
  },
  lineTo: function(e, t) {
    this._context.lineTo(t, e);
  },
  bezierCurveTo: function(e, t, r, i, s, o) {
    this._context.bezierCurveTo(t, e, i, r, o, s);
  }
};
function hp(e) {
  return new Po(e);
}
function cp(e) {
  return new np(e);
}
function up(e) {
  this._context = e;
}
up.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x = [], this._y = [];
  },
  lineEnd: function() {
    var e = this._x, t = this._y, r = e.length;
    if (r)
      if (this._line ? this._context.lineTo(e[0], t[0]) : this._context.moveTo(e[0], t[0]), r === 2)
        this._context.lineTo(e[1], t[1]);
      else
        for (var i = Xc(e), s = Xc(t), o = 0, a = 1; a < r; ++o, ++a)
          this._context.bezierCurveTo(i[0][o], s[0][o], i[1][o], s[1][o], e[a], t[a]);
    (this._line || this._line !== 0 && r === 1) && this._context.closePath(), this._line = 1 - this._line, this._x = this._y = null;
  },
  point: function(e, t) {
    this._x.push(+e), this._y.push(+t);
  }
};
function Xc(e) {
  var t, r = e.length - 1, i, s = new Array(r), o = new Array(r), a = new Array(r);
  for (s[0] = 0, o[0] = 2, a[0] = e[0] + 2 * e[1], t = 1; t < r - 1; ++t) s[t] = 1, o[t] = 4, a[t] = 4 * e[t] + 2 * e[t + 1];
  for (s[r - 1] = 2, o[r - 1] = 7, a[r - 1] = 8 * e[r - 1] + e[r], t = 1; t < r; ++t) i = s[t] / o[t - 1], o[t] -= i, a[t] -= i * a[t - 1];
  for (s[r - 1] = a[r - 1] / o[r - 1], t = r - 2; t >= 0; --t) s[t] = (a[t] - s[t + 1]) / o[t];
  for (o[r - 1] = (e[r] + s[r - 1]) / 2, t = 0; t < r - 1; ++t) o[t] = 2 * e[t + 1] - s[t + 1];
  return [s, o];
}
function dp(e) {
  return new up(e);
}
function ra(e, t) {
  this._context = e, this._t = t;
}
ra.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x = this._y = NaN, this._point = 0;
  },
  lineEnd: function() {
    0 < this._t && this._t < 1 && this._point === 2 && this._context.lineTo(this._x, this._y), (this._line || this._line !== 0 && this._point === 1) && this._context.closePath(), this._line >= 0 && (this._t = 1 - this._t, this._line = 1 - this._line);
  },
  point: function(e, t) {
    switch (e = +e, t = +t, this._point) {
      case 0:
        this._point = 1, this._line ? this._context.lineTo(e, t) : this._context.moveTo(e, t);
        break;
      case 1:
        this._point = 2;
      // falls through
      default: {
        if (this._t <= 0)
          this._context.lineTo(this._x, t), this._context.lineTo(e, t);
        else {
          var r = this._x * (1 - this._t) + e * this._t;
          this._context.lineTo(r, this._y), this._context.lineTo(r, t);
        }
        break;
      }
    }
    this._x = e, this._y = t;
  }
};
function fp(e) {
  return new ra(e, 0.5);
}
function pp(e) {
  return new ra(e, 0);
}
function gp(e) {
  return new ra(e, 1);
}
function hs(e, t, r) {
  this.k = e, this.x = t, this.y = r;
}
hs.prototype = {
  constructor: hs,
  scale: function(e) {
    return e === 1 ? this : new hs(this.k * e, this.x, this.y);
  },
  translate: function(e, t) {
    return e === 0 & t === 0 ? this : new hs(this.k, this.x + this.k * e, this.y + this.k * t);
  },
  apply: function(e) {
    return [e[0] * this.k + this.x, e[1] * this.k + this.y];
  },
  applyX: function(e) {
    return e * this.k + this.x;
  },
  applyY: function(e) {
    return e * this.k + this.y;
  },
  invert: function(e) {
    return [(e[0] - this.x) / this.k, (e[1] - this.y) / this.k];
  },
  invertX: function(e) {
    return (e - this.x) / this.k;
  },
  invertY: function(e) {
    return (e - this.y) / this.k;
  },
  rescaleX: function(e) {
    return e.copy().domain(e.range().map(this.invertX, this).map(e.invert, e));
  },
  rescaleY: function(e) {
    return e.copy().domain(e.range().map(this.invertY, this).map(e.invert, e));
  },
  toString: function() {
    return "translate(" + this.x + "," + this.y + ") scale(" + this.k + ")";
  }
};
hs.prototype;
var O2 = /* @__PURE__ */ p((e) => {
  const { securityLevel: t } = $t();
  let r = At("body");
  if (t === "sandbox") {
    const o = At(`#i${e}`).node()?.contentDocument ?? document;
    r = At(o.body);
  }
  return r.select(`#${e}`);
}, "selectSvgElement"), D2 = /* @__PURE__ */ p((e) => {
  const { handDrawnSeed: t } = $t();
  return {
    fill: e,
    hachureAngle: 120,
    // angle of hachure,
    hachureGap: 4,
    fillWeight: 2,
    roughness: 0.7,
    stroke: e,
    seed: t
  };
}, "solidStateFill"), I2 = /* @__PURE__ */ p((e) => Array.isArray(e) ? e : e ? e.split(";").map((t) => t.trim()).filter(Boolean) : [], "normalizeStyleList"), Ni = /* @__PURE__ */ p((e) => {
  const t = P2([
    ...e.cssCompiledStyles || [],
    ...e.cssStyles || [],
    ...I2(e.labelStyle)
  ]);
  return { stylesMap: t, stylesArray: [...t] };
}, "compileStyles"), P2 = /* @__PURE__ */ p((e) => {
  const t = /* @__PURE__ */ new Map();
  return e.forEach((r) => {
    const [i, s] = r.split(":");
    t.set(i.trim(), s?.trim());
  }), t;
}, "styles2Map"), mp = /* @__PURE__ */ p((e) => e === "color" || e === "font-size" || e === "font-family" || e === "font-weight" || e === "font-style" || e === "text-decoration" || e === "text-align" || e === "text-transform" || e === "line-height" || e === "letter-spacing" || e === "word-spacing" || e === "text-shadow" || e === "text-overflow" || e === "white-space" || e === "word-wrap" || e === "word-break" || e === "overflow-wrap" || e === "hyphens", "isLabelStyle"), pt = /* @__PURE__ */ p((e) => {
  const { stylesArray: t } = Ni(e), r = [], i = [], s = [], o = [];
  return t.forEach((a) => {
    const n = a[0];
    mp(n) ? r.push(a.join(":") + " !important") : (i.push(a.join(":") + " !important"), n.includes("stroke") && s.push(a.join(":") + " !important"), n === "fill" && o.push(a.join(":") + " !important"));
  }), {
    labelStyles: r.join(";"),
    nodeStyles: i.join(";"),
    stylesArray: t,
    borderStyles: s,
    backgroundStyles: o
  };
}, "styles2String"), ct = /* @__PURE__ */ p((e, t) => {
  const { themeVariables: r, handDrawnSeed: i } = $t(), { nodeBorder: s, mainBkg: o } = r, { stylesMap: a } = Ni(e);
  return Object.assign(
    {
      roughness: 0.7,
      fill: a.get("fill") || o,
      fillStyle: "hachure",
      // solid fill
      fillWeight: 4,
      hachureGap: 5.2,
      stroke: a.get("stroke") || s,
      seed: i,
      strokeWidth: a.get("stroke-width")?.replace("px", "") || 1.3,
      fillLineDash: [0, 0],
      strokeLineDash: R2(a.get("stroke-dasharray"))
    },
    t
  );
}, "userNodeOverrides"), R2 = /* @__PURE__ */ p((e) => {
  if (!e)
    return [0, 0];
  const t = e.trim().split(/\s+/).map(Number);
  if (t.length === 1) {
    const s = isNaN(t[0]) ? 0 : t[0];
    return [s, s];
  }
  const r = isNaN(t[0]) ? 0 : t[0], i = isNaN(t[1]) ? 0 : t[1];
  return [r, i];
}, "getStrokeDashArray");
const N2 = Object.freeze({
  left: 0,
  top: 0,
  width: 16,
  height: 16
}), Ro = Object.freeze({
  rotate: 0,
  vFlip: !1,
  hFlip: !1
}), yp = Object.freeze({
  ...N2,
  ...Ro
}), q2 = Object.freeze({
  ...yp,
  body: "",
  hidden: !1
}), z2 = Object.freeze({
  width: null,
  height: null
}), W2 = Object.freeze({
  ...z2,
  ...Ro
}), H2 = (e, t, r, i = "") => {
  const s = e.split(":");
  if (e.slice(0, 1) === "@") {
    if (s.length < 2 || s.length > 3) return null;
    i = s.shift().slice(1);
  }
  if (s.length > 3 || !s.length) return null;
  if (s.length > 1) {
    const n = s.pop(), l = s.pop(), c = {
      provider: s.length > 0 ? s[0] : i,
      prefix: l,
      name: n
    };
    return Na(c) ? c : null;
  }
  const o = s[0], a = o.split("-");
  if (a.length > 1) {
    const n = {
      provider: i,
      prefix: a.shift(),
      name: a.join("-")
    };
    return Na(n) ? n : null;
  }
  if (r && i === "") {
    const n = {
      provider: i,
      prefix: "",
      name: o
    };
    return Na(n, r) ? n : null;
  }
  return null;
}, Na = (e, t) => e ? !!((t && e.prefix === "" || e.prefix) && e.name) : !1;
function Y2(e, t) {
  const r = {};
  !e.hFlip != !t.hFlip && (r.hFlip = !0), !e.vFlip != !t.vFlip && (r.vFlip = !0);
  const i = ((e.rotate || 0) + (t.rotate || 0)) % 4;
  return i && (r.rotate = i), r;
}
function Vc(e, t) {
  const r = Y2(e, t);
  for (const i in q2) i in Ro ? i in e && !(i in r) && (r[i] = Ro[i]) : i in t ? r[i] = t[i] : i in e && (r[i] = e[i]);
  return r;
}
function U2(e, t) {
  const r = e.icons, i = e.aliases || /* @__PURE__ */ Object.create(null), s = /* @__PURE__ */ Object.create(null);
  function o(a) {
    if (r[a]) return s[a] = [];
    if (!(a in s)) {
      s[a] = null;
      const n = i[a] && i[a].parent, l = n && o(n);
      l && (s[a] = [n].concat(l));
    }
    return s[a];
  }
  return (t || Object.keys(r).concat(Object.keys(i))).forEach(o), s;
}
function Zc(e, t, r) {
  const i = e.icons, s = e.aliases || /* @__PURE__ */ Object.create(null);
  let o = {};
  function a(n) {
    o = Vc(i[n] || s[n], o);
  }
  return a(t), r.forEach(a), Vc(e, o);
}
function j2(e, t) {
  if (e.icons[t]) return Zc(e, t, []);
  const r = U2(e, [t])[t];
  return r ? Zc(e, t, r) : null;
}
const G2 = /(-?[0-9.]*[0-9]+[0-9.]*)/g, X2 = /^-?[0-9.]*[0-9]+[0-9.]*$/g;
function Kc(e, t, r) {
  if (t === 1) return e;
  if (r = r || 100, typeof e == "number") return Math.ceil(e * t * r) / r;
  if (typeof e != "string") return e;
  const i = e.split(G2);
  if (i === null || !i.length) return e;
  const s = [];
  let o = i.shift(), a = X2.test(o);
  for (; ; ) {
    if (a) {
      const n = parseFloat(o);
      isNaN(n) ? s.push(o) : s.push(Math.ceil(n * t * r) / r);
    } else s.push(o);
    if (o = i.shift(), o === void 0) return s.join("");
    a = !a;
  }
}
function V2(e, t = "defs") {
  let r = "";
  const i = e.indexOf("<" + t);
  for (; i >= 0; ) {
    const s = e.indexOf(">", i), o = e.indexOf("</" + t);
    if (s === -1 || o === -1) break;
    const a = e.indexOf(">", o);
    if (a === -1) break;
    r += e.slice(s + 1, o).trim(), e = e.slice(0, i).trim() + e.slice(a + 1);
  }
  return {
    defs: r,
    content: e
  };
}
function Z2(e, t) {
  return e ? "<defs>" + e + "</defs>" + t : t;
}
function K2(e, t, r) {
  const i = V2(e);
  return Z2(i.defs, t + i.content + r);
}
const Q2 = (e) => e === "unset" || e === "undefined" || e === "none";
function J2(e, t) {
  const r = {
    ...yp,
    ...e
  }, i = {
    ...W2,
    ...t
  }, s = {
    left: r.left,
    top: r.top,
    width: r.width,
    height: r.height
  };
  let o = r.body;
  [r, i].forEach((y) => {
    const x = [], C = y.hFlip, k = y.vFlip;
    let T = y.rotate;
    C ? k ? T += 2 : (x.push("translate(" + (s.width + s.left).toString() + " " + (0 - s.top).toString() + ")"), x.push("scale(-1 1)"), s.top = s.left = 0) : k && (x.push("translate(" + (0 - s.left).toString() + " " + (s.height + s.top).toString() + ")"), x.push("scale(1 -1)"), s.top = s.left = 0);
    let _;
    switch (T < 0 && (T -= Math.floor(T / 4) * 4), T = T % 4, T) {
      case 1:
        _ = s.height / 2 + s.top, x.unshift("rotate(90 " + _.toString() + " " + _.toString() + ")");
        break;
      case 2:
        x.unshift("rotate(180 " + (s.width / 2 + s.left).toString() + " " + (s.height / 2 + s.top).toString() + ")");
        break;
      case 3:
        _ = s.width / 2 + s.left, x.unshift("rotate(-90 " + _.toString() + " " + _.toString() + ")");
    }
    T % 2 === 1 && (s.left !== s.top && (_ = s.left, s.left = s.top, s.top = _), s.width !== s.height && (_ = s.width, s.width = s.height, s.height = _)), x.length && (o = K2(o, '<g transform="' + x.join(" ") + '">', "</g>"));
  });
  const a = i.width, n = i.height, l = s.width, c = s.height;
  let h, u;
  a === null ? (u = n === null ? "1em" : n === "auto" ? c : n, h = Kc(u, l / c)) : (h = a === "auto" ? l : a, u = n === null ? Kc(h, c / l) : n === "auto" ? c : n);
  const d = {}, f = (y, x) => {
    Q2(x) || (d[y] = x.toString());
  };
  f("width", h), f("height", u);
  const m = [
    s.left,
    s.top,
    l,
    c
  ];
  return d.viewBox = m.join(" "), {
    attributes: d,
    viewBox: m,
    body: o
  };
}
const tw = /\sid="(\S+)"/g, Qc = /* @__PURE__ */ new Map();
function ew(e) {
  e = e.replace(/[0-9]+$/, "") || "a";
  const t = Qc.get(e) || 0;
  return Qc.set(e, t + 1), t ? `${e}${t}` : e;
}
function rw(e) {
  const t = [];
  let r;
  for (; r = tw.exec(e); ) t.push(r[1]);
  if (!t.length) return e;
  const i = "suffix" + (Math.random() * 16777216 | Date.now()).toString(16);
  return t.forEach((s) => {
    const o = ew(s), a = s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    e = e.replace(new RegExp('([#;"])(' + a + ')([")]|\\.[a-z])', "g"), "$1" + o + i + "$3");
  }), e = e.replace(new RegExp(i, "g"), ""), e;
}
function iw(e, t) {
  let r = e.indexOf("xlink:") === -1 ? "" : ' xmlns:xlink="http://www.w3.org/1999/xlink"';
  for (const i in t) r += " " + i + '="' + t[i] + '"';
  return '<svg xmlns="http://www.w3.org/2000/svg"' + r + ">" + e + "</svg>";
}
var sw = {
  body: '<g><rect width="80" height="80" style="fill: #087ebf; stroke-width: 0px;"/><text transform="translate(21.16 64.67)" style="fill: #fff; font-family: ArialMT, Arial; font-size: 67.75px;"><tspan x="0" y="0">?</tspan></text></g>',
  height: 80,
  width: 80
}, Un = /* @__PURE__ */ new Map(), xp = /* @__PURE__ */ new Map(), ow = /* @__PURE__ */ p((e) => {
  for (const t of e) {
    if (!t.name)
      throw new Error(
        'Invalid icon loader. Must have a "name" property with non-empty string value.'
      );
    if (R.debug("Registering icon pack:", t.name), "loader" in t)
      xp.set(t.name, t.loader);
    else if ("icons" in t)
      Un.set(t.name, t.icons);
    else
      throw R.error("Invalid icon loader:", t), new Error('Invalid icon loader. Must have either "icons" or "loader" property.');
  }
}, "registerIconPacks"), Cp = /* @__PURE__ */ p(async (e, t) => {
  const r = H2(e, !0, t !== void 0);
  if (!r)
    throw new Error(`Invalid icon name: ${e}`);
  const i = r.prefix || t;
  if (!i)
    throw new Error(`Icon name must contain a prefix: ${e}`);
  let s = Un.get(i);
  if (!s) {
    const a = xp.get(i);
    if (!a)
      throw new Error(`Icon set not found: ${r.prefix}`);
    try {
      s = { ...await a(), prefix: i }, Un.set(i, s);
    } catch (n) {
      throw R.error(n), new Error(`Failed to load icon set: ${r.prefix}`);
    }
  }
  const o = j2(s, r.name);
  if (!o)
    throw new Error(`Icon not found: ${e}`);
  return o;
}, "getRegisteredIconData"), aw = /* @__PURE__ */ p(async (e) => {
  try {
    return await Cp(e), !0;
  } catch {
    return !1;
  }
}, "isIconAvailable"), Ns = /* @__PURE__ */ p(async (e, t, r) => {
  let i;
  try {
    i = await Cp(e, t?.fallbackPrefix);
  } catch (a) {
    R.error(a), i = sw;
  }
  const s = J2(i, t), o = iw(rw(s.body), {
    ...s.attributes,
    ...r
  });
  return Re(o, Xt());
}, "getIconSVG"), Js = {}, re = {}, Jc;
function nw() {
  return Jc || (Jc = 1, Object.defineProperty(re, "__esModule", { value: !0 }), re.BLANK_URL = re.relativeFirstCharacters = re.whitespaceEscapeCharsRegex = re.urlSchemeRegex = re.ctrlCharactersRegex = re.htmlCtrlEntityRegex = re.htmlEntitiesRegex = re.invalidProtocolRegex = void 0, re.invalidProtocolRegex = /^([^\w]*)(javascript|data|vbscript)/im, re.htmlEntitiesRegex = /&#(\w+)(^\w|;)?/g, re.htmlCtrlEntityRegex = /&(newline|tab);/gi, re.ctrlCharactersRegex = /[\u0000-\u001F\u007F-\u009F\u2000-\u200D\uFEFF]/gim, re.urlSchemeRegex = /^.+(:|&colon;)/gim, re.whitespaceEscapeCharsRegex = /(\\|%5[cC])((%(6[eE]|72|74))|[nrt])/g, re.relativeFirstCharacters = [".", "/"], re.BLANK_URL = "about:blank"), re;
}
var tu;
function lw() {
  if (tu) return Js;
  tu = 1, Object.defineProperty(Js, "__esModule", { value: !0 }), Js.sanitizeUrl = o;
  var e = nw();
  function t(a) {
    return e.relativeFirstCharacters.indexOf(a[0]) > -1;
  }
  function r(a) {
    var n = a.replace(e.ctrlCharactersRegex, "");
    return n.replace(e.htmlEntitiesRegex, function(l, c) {
      return String.fromCharCode(c);
    });
  }
  function i(a) {
    return URL.canParse(a);
  }
  function s(a) {
    try {
      return decodeURIComponent(a);
    } catch {
      return a;
    }
  }
  function o(a) {
    if (!a)
      return e.BLANK_URL;
    var n, l = s(a.trim());
    do
      l = r(l).replace(e.htmlCtrlEntityRegex, "").replace(e.ctrlCharactersRegex, "").replace(e.whitespaceEscapeCharsRegex, "").trim(), l = s(l), n = l.match(e.ctrlCharactersRegex) || l.match(e.htmlEntitiesRegex) || l.match(e.htmlCtrlEntityRegex) || l.match(e.whitespaceEscapeCharsRegex);
    while (n && n.length > 0);
    var c = l;
    if (!c)
      return e.BLANK_URL;
    if (t(c))
      return c;
    var h = c.trimStart(), u = h.match(e.urlSchemeRegex);
    if (!u)
      return c;
    var d = u[0].toLowerCase().trim();
    if (e.invalidProtocolRegex.test(d))
      return e.BLANK_URL;
    var f = h.replace(/\\/g, "/");
    if (d === "mailto:" || d.includes("://"))
      return f;
    if (d === "http:" || d === "https:") {
      if (!i(f))
        return e.BLANK_URL;
      var m = new URL(f);
      return m.protocol = m.protocol.toLowerCase(), m.hostname = m.hostname.toLowerCase(), m.toString();
    }
    return f;
  }
  return Js;
}
var hw = lw();
function qa(e) {
  if (typeof e != "object" || e == null) return !1;
  if (Object.getPrototypeOf(e) === null) return !0;
  if (Object.prototype.toString.call(e) !== "[object Object]") {
    const r = e[Symbol.toStringTag];
    return r == null || !Object.getOwnPropertyDescriptor(e, Symbol.toStringTag)?.writable ? !1 : e.toString() === `[object ${r}]`;
  }
  let t = e;
  for (; Object.getPrototypeOf(t) !== null; ) t = Object.getPrototypeOf(t);
  return Object.getPrototypeOf(e) === t;
}
function cw() {
}
function bp(e) {
  return Object.getOwnPropertySymbols(e).filter((t) => Object.prototype.propertyIsEnumerable.call(e, t));
}
function Pl(e) {
  return e == null ? e === void 0 ? "[object Undefined]" : "[object Null]" : Object.prototype.toString.call(e);
}
const uw = "[object RegExp]", kp = "[object String]", wp = "[object Number]", Tp = "[object Boolean]", Sp = "[object Arguments]", dw = "[object Symbol]", fw = "[object Date]", pw = "[object Map]", gw = "[object Set]", mw = "[object Array]", yw = "[object ArrayBuffer]", xw = "[object Object]", Cw = "[object DataView]", bw = "[object Uint8Array]", kw = "[object Uint8ClampedArray]", ww = "[object Uint16Array]", Tw = "[object Uint32Array]", Sw = "[object Int8Array]", _w = "[object Int16Array]", vw = "[object Int32Array]", Bw = "[object Float32Array]", Lw = "[object Float64Array]", eu = typeof globalThis == "object" && globalThis || typeof window == "object" && window || typeof self == "object" && self || typeof global == "object" && global || /* @__PURE__ */ (function() {
  return this;
})();
function Rl(e) {
  return typeof eu.Buffer < "u" && eu.Buffer.isBuffer(e);
}
function Fw(e) {
  return Number.isSafeInteger(e) && e >= 0;
}
function _p(e) {
  return e != null && typeof e != "function" && Fw(e.length);
}
function Aw(e) {
  return e === "__proto__";
}
function Nl(e) {
  return e == null || typeof e != "object" && typeof e != "function";
}
function ql(e) {
  return ArrayBuffer.isView(e) && !(e instanceof DataView);
}
function Ew(e, t) {
  return vi(e, void 0, e, /* @__PURE__ */ new Map(), t);
}
function vi(e, t, r, i = /* @__PURE__ */ new Map(), s = void 0) {
  const o = s?.(e, t, r, i);
  if (o !== void 0) return o;
  if (Nl(e)) return e;
  if (i.has(e)) return i.get(e);
  if (Array.isArray(e)) {
    const a = new Array(e.length);
    i.set(e, a);
    for (let n = 0; n < e.length; n++) a[n] = vi(e[n], n, r, i, s);
    return Object.hasOwn(e, "index") && (a.index = e.index), Object.hasOwn(e, "input") && (a.input = e.input), a;
  }
  if (e instanceof Date) return new Date(e.getTime());
  if (e instanceof RegExp) {
    const a = new RegExp(e.source, e.flags);
    return a.lastIndex = e.lastIndex, a;
  }
  if (e instanceof Map) {
    const a = /* @__PURE__ */ new Map();
    i.set(e, a);
    for (const [n, l] of e) a.set(n, vi(l, n, r, i, s));
    return a;
  }
  if (e instanceof Set) {
    const a = /* @__PURE__ */ new Set();
    i.set(e, a);
    for (const n of e) a.add(vi(n, void 0, r, i, s));
    return a;
  }
  if (Rl(e)) return e.subarray();
  if (ql(e)) {
    const a = new (Object.getPrototypeOf(e)).constructor(e.length);
    i.set(e, a);
    for (let n = 0; n < e.length; n++) a[n] = vi(e[n], n, r, i, s);
    return a;
  }
  if (e instanceof ArrayBuffer || typeof SharedArrayBuffer < "u" && e instanceof SharedArrayBuffer) return e.slice(0);
  if (e instanceof DataView) {
    const a = new DataView(e.buffer.slice(0), e.byteOffset, e.byteLength);
    return i.set(e, a), We(a, e, r, i, s), a;
  }
  if (typeof File < "u" && e instanceof File) {
    const a = new File([e], e.name, { type: e.type });
    return i.set(e, a), We(a, e, r, i, s), a;
  }
  if (typeof Blob < "u" && e instanceof Blob) {
    const a = new Blob([e], { type: e.type });
    return i.set(e, a), We(a, e, r, i, s), a;
  }
  if (e instanceof Error) {
    const a = structuredClone(e);
    return i.set(e, a), a.message = e.message, a.name = e.name, a.stack = e.stack, a.cause = e.cause, a.constructor = e.constructor, We(a, e, r, i, s), a;
  }
  if (e instanceof Boolean) {
    const a = new Boolean(e.valueOf());
    return i.set(e, a), We(a, e, r, i, s), a;
  }
  if (e instanceof Number) {
    const a = new Number(e.valueOf());
    return i.set(e, a), We(a, e, r, i, s), a;
  }
  if (e instanceof String) {
    const a = new String(e.valueOf());
    return i.set(e, a), We(a, e, r, i, s), a;
  }
  if (typeof e == "object" && Mw(e)) {
    const a = Object.create(Object.getPrototypeOf(e));
    return i.set(e, a), We(a, e, r, i, s), a;
  }
  return e;
}
function We(e, t, r = e, i, s) {
  const o = [...Object.keys(t), ...bp(t)];
  for (let a = 0; a < o.length; a++) {
    const n = o[a], l = Object.getOwnPropertyDescriptor(e, n);
    (l == null || l.writable) && (e[n] = vi(t[n], n, r, i, s));
  }
}
function Mw(e) {
  switch (Pl(e)) {
    case Sp:
    case mw:
    case yw:
    case Cw:
    case Tp:
    case fw:
    case Bw:
    case Lw:
    case Sw:
    case _w:
    case vw:
    case pw:
    case wp:
    case xw:
    case uw:
    case gw:
    case kp:
    case dw:
    case bw:
    case kw:
    case ww:
    case Tw:
      return !0;
    default:
      return !1;
  }
}
function $w(e, t) {
  return Ew(e, (r, i, s, o) => {
    if (typeof e == "object") {
      if (Pl(e) === "[object Object]" && typeof e.constructor != "function") {
        const a = {};
        return o.set(e, a), We(a, e, s, o), a;
      }
      switch (Object.prototype.toString.call(e)) {
        case wp:
        case kp:
        case Tp: {
          const a = new e.constructor(e?.valueOf());
          return We(a, e), a;
        }
        case Sp: {
          const a = {};
          return We(a, e), a.length = e.length, a[Symbol.iterator] = e[Symbol.iterator], a;
        }
        default:
          return;
      }
    }
  });
}
function ru(e) {
  return $w(e);
}
function jn(e) {
  return e !== null && typeof e == "object" && Pl(e) === "[object Arguments]";
}
function Gn(e) {
  return typeof e == "object" && e !== null;
}
function Ow(e) {
  return Gn(e) && _p(e);
}
function yo(e) {
  return ql(e);
}
function Dw(e) {
  const t = e?.constructor;
  return e === (typeof t == "function" ? t.prototype : Object.prototype);
}
function qs(e, t) {
  if (typeof e != "function" || t != null && typeof t != "function") throw new TypeError("Expected a function");
  const r = function(...i) {
    const s = t ? t.apply(this, i) : i[0], o = r.cache;
    if (o.has(s)) return o.get(s);
    const a = e.apply(this, i);
    return r.cache = o.set(s, a) || o, a;
  };
  return r.cache = new (qs.Cache || Map)(), r;
}
qs.Cache = Map;
function Iw(e) {
  if (Nl(e)) return e;
  if (Array.isArray(e) || ql(e) || e instanceof ArrayBuffer || typeof SharedArrayBuffer < "u" && e instanceof SharedArrayBuffer) return e.slice(0);
  const t = Object.getPrototypeOf(e);
  if (t == null) return Object.assign(Object.create(t), e);
  const r = t.constructor;
  if (e instanceof Date || e instanceof Map || e instanceof Set) return new r(e);
  if (e instanceof RegExp) {
    const i = new r(e);
    return i.lastIndex = e.lastIndex, i;
  }
  if (e instanceof DataView) return new r(e.buffer.slice(0));
  if (e instanceof Error) {
    let i;
    return e instanceof AggregateError ? i = new r(e.errors, e.message, { cause: e.cause }) : i = new r(e.message, { cause: e.cause }), i.stack = e.stack, Object.assign(i, e), i;
  }
  return typeof File < "u" && e instanceof File ? new r([e], e.name, {
    type: e.type,
    lastModified: e.lastModified
  }) : typeof e == "object" ? Object.assign(Object.create(t), e) : e;
}
function Pw(e, ...t) {
  const r = t.slice(0, -1), i = t[t.length - 1];
  let s = e;
  for (let o = 0; o < r.length; o++) {
    const a = r[o];
    s = xo(s, a, i, /* @__PURE__ */ new Map());
  }
  return s;
}
function xo(e, t, r, i) {
  if (Nl(e) && (e = Object(e)), t == null || typeof t != "object") return e;
  if (i.has(t)) return Iw(i.get(t));
  if (i.set(t, e), Array.isArray(t)) {
    t = t.slice();
    for (let o = 0; o < t.length; o++) o in t || (t[o] = void 0);
  }
  const s = [...Object.keys(t), ...bp(t)];
  for (let o = 0; o < s.length; o++) {
    const a = s[o];
    if (Aw(a)) continue;
    let n = t[a], l = e[a];
    if (jn(n) && (n = { ...n }), jn(l) && (l = { ...l }), Rl(n) && (n = ru(n)), Array.isArray(n)) if (Array.isArray(l)) {
      const h = [], u = Reflect.ownKeys(l);
      for (let d = 0; d < u.length; d++) {
        const f = u[d];
        h[f] = l[f];
      }
      l = h;
    } else if (Ow(l)) {
      const h = [];
      for (let u = 0; u < l.length; u++) h[u] = l[u];
      l = h;
    } else l = [];
    const c = r(l, n, a, e, t, i);
    c !== void 0 ? e[a] = c : Array.isArray(n) || Gn(l) && Gn(n) && (qa(l) || qa(n) || yo(l) || yo(n)) ? e[a] = xo(l, n, r, i) : l == null && qa(n) ? e[a] = xo({}, n, r, i) : l == null && yo(n) ? e[a] = ru(n) : (l === void 0 || n !== void 0) && (e[a] = n);
  }
  return e;
}
function Rw(e, ...t) {
  return Pw(e, ...t, cw);
}
function iu(e) {
  if (e == null) return !0;
  if (_p(e))
    return typeof e.splice != "function" && typeof e != "string" && !Rl(e) && !yo(e) && !jn(e) ? !1 : e.length === 0;
  if (typeof e == "object" || typeof e == "function") {
    if (e instanceof Map || e instanceof Set) return e.size === 0;
    const t = Object.keys(e);
    return Dw(e) ? t.filter((r) => r !== "constructor").length === 0 : t.length === 0;
  }
  return !0;
}
var Nw = "​", qw = {
  curveBasis: Yn,
  curveBasisClosed: v2,
  curveBasisOpen: B2,
  curveBumpX: Zf,
  curveBumpY: Kf,
  curveBundle: L2,
  curveCardinalClosed: F2,
  curveCardinalOpen: A2,
  curveCardinal: ep,
  curveCatmullRomClosed: E2,
  curveCatmullRomOpen: M2,
  curveCatmullRom: ip,
  curveLinear: Cs,
  curveLinearClosed: $2,
  curveMonotoneX: hp,
  curveMonotoneY: cp,
  curveNatural: dp,
  curveStep: fp,
  curveStepAfter: gp,
  curveStepBefore: pp
}, zw = /\s*(?:(\w+)(?=:):|(\w+))\s*(?:(\w+)|((?:(?!}%{2}).|\r?\n)*))?\s*(?:}%{2})?/gi, Ww = /* @__PURE__ */ p(function(e, t) {
  const r = vp(e, /(?:init\b)|(?:initialize\b)/);
  let i = {};
  if (Array.isArray(r)) {
    const a = r.map((n) => n.args);
    So(a), i = se(i, [...a]);
  } else
    i = r.args;
  if (!i)
    return;
  let s = Cl(e, t);
  const o = "config";
  return i[o] !== void 0 && (s === "flowchart-v2" && (s = "flowchart"), i[s] = i[o], delete i[o]), i;
}, "detectInit"), vp = /* @__PURE__ */ p(function(e, t = null) {
  try {
    const r = new RegExp(
      `[%]{2}(?![{]${zw.source})(?=[}][%]{2}).*
`,
      "ig"
    );
    e = e.trim().replace(r, "").replace(/'/gm, '"'), R.debug(
      `Detecting diagram directive${t !== null ? " type:" + t : ""} based on the text:${e}`
    );
    let i;
    const s = [];
    for (; (i = xs.exec(e)) !== null; )
      if (i.index === xs.lastIndex && xs.lastIndex++, i && !t || t && i[1]?.match(t) || t && i[2]?.match(t)) {
        const o = i[1] ? i[1] : i[2], a = i[3] ? i[3].trim() : i[4] ? JSON.parse(i[4].trim()) : null;
        s.push({ type: o, args: a });
      }
    return s.length === 0 ? { type: e, args: null } : s.length === 1 ? s[0] : s;
  } catch (r) {
    return R.error(
      `ERROR: ${r.message} - Unable to parse directive type: '${t}' based on the text: '${e}'`
    ), { type: void 0, args: null };
  }
}, "detectDirective"), Hw = /* @__PURE__ */ p(function(e) {
  return e.replace(xs, "");
}, "removeDirectives"), Yw = /* @__PURE__ */ p(function(e, t) {
  for (const [r, i] of t.entries())
    if (i.match(e))
      return r;
  return -1;
}, "isSubstringInArray");
function zl(e, t) {
  if (!e)
    return t;
  const r = `curve${e.charAt(0).toUpperCase() + e.slice(1)}`;
  return qw[r] ?? t;
}
p(zl, "interpolateToCurve");
function Bp(e, t) {
  const r = e.trim();
  if (r)
    return t.securityLevel !== "loose" ? hw.sanitizeUrl(r) : r;
}
p(Bp, "formatUrl");
var Uw = /* @__PURE__ */ p((e, ...t) => {
  const r = e.split("."), i = r.length - 1, s = r[i];
  let o = window;
  for (let a = 0; a < i; a++)
    if (o = o[r[a]], !o) {
      R.error(`Function name: ${e} not found in window`);
      return;
    }
  o[s](...t);
}, "runFunc");
function Wl(e, t) {
  return !e || !t ? 0 : Math.sqrt(Math.pow(t.x - e.x, 2) + Math.pow(t.y - e.y, 2));
}
p(Wl, "distance");
function Lp(e) {
  let t, r = 0;
  e.forEach((s) => {
    r += Wl(s, t), t = s;
  });
  const i = r / 2;
  return Hl(e, i);
}
p(Lp, "traverseEdge");
function Fp(e) {
  return e.length === 1 ? e[0] : Lp(e);
}
p(Fp, "calcLabelPosition");
var su = /* @__PURE__ */ p((e, t = 2) => {
  const r = Math.pow(10, t);
  return Math.round(e * r) / r;
}, "roundNumber"), Hl = /* @__PURE__ */ p((e, t) => {
  let r, i = t;
  for (const s of e) {
    if (r) {
      const o = Wl(s, r);
      if (o === 0)
        return r;
      if (o < i)
        i -= o;
      else {
        const a = i / o;
        if (a <= 0)
          return r;
        if (a >= 1)
          return { x: s.x, y: s.y };
        if (a > 0 && a < 1)
          return {
            x: su((1 - a) * r.x + a * s.x, 5),
            y: su((1 - a) * r.y + a * s.y, 5)
          };
      }
    }
    r = s;
  }
  throw new Error("Could not find a suitable point for the given distance");
}, "calculatePoint"), jw = /* @__PURE__ */ p((e, t, r) => {
  R.info(`our points ${JSON.stringify(t)}`), t[0] !== r && (t = t.reverse());
  const s = Hl(t, 25), o = e ? 10 : 5, a = Math.atan2(t[0].y - s.y, t[0].x - s.x), n = { x: 0, y: 0 };
  return n.x = Math.sin(a) * o + (t[0].x + s.x) / 2, n.y = -Math.cos(a) * o + (t[0].y + s.y) / 2, n;
}, "calcCardinalityPosition");
function Ap(e, t, r) {
  const i = structuredClone(r);
  R.info("our points", i), t !== "start_left" && t !== "start_right" && i.reverse();
  const s = 25 + e, o = Hl(i, s), a = 10 + e * 0.5, n = Math.atan2(i[0].y - o.y, i[0].x - o.x), l = { x: 0, y: 0 };
  return t === "start_left" ? (l.x = Math.sin(n + Math.PI) * a + (i[0].x + o.x) / 2, l.y = -Math.cos(n + Math.PI) * a + (i[0].y + o.y) / 2) : t === "end_right" ? (l.x = Math.sin(n - Math.PI) * a + (i[0].x + o.x) / 2 - 5, l.y = -Math.cos(n - Math.PI) * a + (i[0].y + o.y) / 2 - 5) : t === "end_left" ? (l.x = Math.sin(n) * a + (i[0].x + o.x) / 2 - 5, l.y = -Math.cos(n) * a + (i[0].y + o.y) / 2 - 5) : (l.x = Math.sin(n) * a + (i[0].x + o.x) / 2, l.y = -Math.cos(n) * a + (i[0].y + o.y) / 2), l;
}
p(Ap, "calcTerminalLabelPosition");
function Ep(e) {
  let t = "", r = "";
  for (const i of e)
    i !== void 0 && (i.startsWith("color:") || i.startsWith("text-align:") ? r = r + i + ";" : t = t + i + ";");
  return { style: t, labelStyle: r };
}
p(Ep, "getStylesFromArray");
var ou = 0, Gw = /* @__PURE__ */ p(() => (ou++, "id-" + Math.random().toString(36).substr(2, 12) + "-" + ou), "generateId");
function Mp(e) {
  let t = "";
  const r = "0123456789abcdef", i = r.length;
  for (let s = 0; s < e; s++)
    t += r.charAt(Math.floor(Math.random() * i));
  return t;
}
p(Mp, "makeRandomHex");
var Xw = /* @__PURE__ */ p((e) => Mp(e.length), "random"), Vw = /* @__PURE__ */ p(function() {
  return {
    x: 0,
    y: 0,
    fill: void 0,
    anchor: "start",
    style: "#666",
    width: 100,
    height: 100,
    textMargin: 0,
    rx: 0,
    ry: 0,
    valign: void 0,
    text: ""
  };
}, "getTextObj"), Zw = /* @__PURE__ */ p(function(e, t) {
  const r = t.text.replace(Is.lineBreakRegex, " "), [, i] = ia(t.fontSize), s = e.append("text");
  s.attr("x", t.x), s.attr("y", t.y), s.style("text-anchor", t.anchor), s.style("font-family", t.fontFamily), s.style("font-size", i), s.style("font-weight", t.fontWeight), s.attr("fill", t.fill), t.class !== void 0 && s.attr("class", t.class);
  const o = s.append("tspan");
  return o.attr("x", t.x + t.textMargin * 2), o.attr("fill", t.fill), o.text(r), s;
}, "drawSimpleText"), Kw = qs(
  (e, t, r) => {
    if (!e || (r = Object.assign(
      { fontSize: 12, fontWeight: 400, fontFamily: "Arial", joinWith: "<br/>" },
      r
    ), Is.lineBreakRegex.test(e)))
      return e;
    const i = e.split(" ").filter(Boolean), s = [];
    let o = "";
    return i.forEach((a, n) => {
      const l = Sr(`${a} `, r), c = Sr(o, r);
      if (l > t) {
        const { hyphenatedStrings: d, remainingWord: f } = Qw(a, t, "-", r);
        s.push(o, ...d), o = f;
      } else c + l >= t ? (s.push(o), o = a) : o = [o, a].filter(Boolean).join(" ");
      n + 1 === i.length && s.push(o);
    }), s.filter((a) => a !== "").join(r.joinWith);
  },
  (e, t, r) => `${e}${t}${r.fontSize}${r.fontWeight}${r.fontFamily}${r.joinWith}`
), Qw = qs(
  (e, t, r = "-", i) => {
    i = Object.assign(
      { fontSize: 12, fontWeight: 400, fontFamily: "Arial", margin: 0 },
      i
    );
    const s = [...e], o = [];
    let a = "";
    return s.forEach((n, l) => {
      const c = `${a}${n}`;
      if (Sr(c, i) >= t) {
        const u = l + 1, d = s.length === u, f = `${c}${r}`;
        o.push(d ? c : f), a = "";
      } else
        a = c;
    }), { hyphenatedStrings: o, remainingWord: a };
  },
  (e, t, r = "-", i) => `${e}${t}${r}${i.fontSize}${i.fontWeight}${i.fontFamily}`
);
function $p(e, t) {
  return Yl(e, t).height;
}
p($p, "calculateTextHeight");
function Sr(e, t) {
  return Yl(e, t).width;
}
p(Sr, "calculateTextWidth");
var Yl = qs(
  (e, t) => {
    const { fontSize: r = 12, fontFamily: i = "Arial", fontWeight: s = 400 } = t;
    if (!e)
      return { width: 0, height: 0 };
    const [, o] = ia(r), a = ["sans-serif", i], n = e.split(Is.lineBreakRegex), l = [], c = At("body");
    if (!c.remove)
      return { width: 0, height: 0, lineHeight: 0 };
    const h = c.append("svg");
    for (const d of a) {
      let f = 0;
      const m = { width: 0, height: 0, lineHeight: 0 };
      for (const y of n) {
        const x = Vw();
        x.text = y || Nw;
        const C = Zw(h, x).style("font-size", o).style("font-weight", s).style("font-family", d), k = (C._groups || C)[0][0].getBBox();
        if (k.width === 0 && k.height === 0)
          throw new Error("svg element not in render tree");
        m.width = Math.round(Math.max(m.width, k.width)), f = Math.round(k.height), m.height += f, m.lineHeight = Math.round(Math.max(m.lineHeight, f));
      }
      l.push(m);
    }
    h.remove();
    const u = isNaN(l[1].height) || isNaN(l[1].width) || isNaN(l[1].lineHeight) || l[0].height > l[1].height && l[0].width > l[1].width && l[0].lineHeight > l[1].lineHeight ? 0 : 1;
    return l[u];
  },
  (e, t) => `${e}${t.fontSize}${t.fontWeight}${t.fontFamily}`
), Jw = class {
  constructor(e = !1, t) {
    this.count = 0, this.count = t ? t.length : 0, this.next = e ? () => this.count++ : () => Date.now();
  }
  static {
    p(this, "InitIDGenerator");
  }
}, to, tT = /* @__PURE__ */ p(function(e) {
  return to = to || document.createElement("div"), e = escape(e).replace(/%26/g, "&").replace(/%23/g, "#").replace(/%3B/g, ";"), to.innerHTML = e, unescape(to.textContent);
}, "entityDecode");
function Ul(e) {
  return "str" in e;
}
p(Ul, "isDetailedError");
var eT = /* @__PURE__ */ p((e, t, r, i) => {
  if (!i)
    return;
  const s = e.node()?.getBBox();
  s && e.append("text").text(i).attr("text-anchor", "middle").attr("x", s.x + s.width / 2).attr("y", -r).attr("class", t);
}, "insertTitle"), ia = /* @__PURE__ */ p((e) => {
  if (typeof e == "number")
    return [e, e + "px"];
  const t = parseInt(e ?? "", 10);
  return Number.isNaN(t) ? [void 0, void 0] : e === String(t) ? [t, e + "px"] : [t, e];
}, "parseFontSize");
function jl(e, t) {
  return Rw({}, e, t);
}
p(jl, "cleanAndMerge");
var pe = {
  assignWithDepth: se,
  wrapLabel: Kw,
  calculateTextHeight: $p,
  calculateTextWidth: Sr,
  calculateTextDimensions: Yl,
  cleanAndMerge: jl,
  detectInit: Ww,
  detectDirective: vp,
  isSubstringInArray: Yw,
  interpolateToCurve: zl,
  calcLabelPosition: Fp,
  calcCardinalityPosition: jw,
  calcTerminalLabelPosition: Ap,
  formatUrl: Bp,
  getStylesFromArray: Ep,
  generateId: Gw,
  random: Xw,
  runFunc: Uw,
  entityDecode: tT,
  insertTitle: eT,
  isLabelCoordinateInPath: Op,
  parseFontSize: ia,
  InitIDGenerator: Jw
}, rT = /* @__PURE__ */ p(function(e) {
  let t = e;
  return t = t.replace(/style.*:\S*#.*;/g, function(r) {
    return r.substring(0, r.length - 1);
  }), t = t.replace(/classDef.*:\S*#.*;/g, function(r) {
    return r.substring(0, r.length - 1);
  }), t = t.replace(/#\w+;/g, function(r) {
    const i = r.substring(1, r.length - 1);
    return /^\+?\d+$/.test(i) ? "ﬂ°°" + i + "¶ß" : "ﬂ°" + i + "¶ß";
  }), t;
}, "encodeEntities"), zr = /* @__PURE__ */ p(function(e) {
  return e.replace(/ﬂ°°/g, "&#").replace(/ﬂ°/g, "&").replace(/¶ß/g, ";");
}, "decodeEntities"), O5 = /* @__PURE__ */ p((e, t, {
  counter: r = 0,
  prefix: i,
  suffix: s
}, o) => o || `${i ? `${i}_` : ""}${e}_${t}_${r}${s ? `_${s}` : ""}`, "getEdgeId");
function te(e) {
  return e ?? null;
}
p(te, "handleUndefinedAttr");
function Op(e, t) {
  const r = Math.round(e.x), i = Math.round(e.y), s = t.replace(
    /(\d+\.\d+)/g,
    (o) => Math.round(parseFloat(o)).toString()
  );
  return s.includes(r.toString()) || s.includes(i.toString());
}
p(Op, "isLabelCoordinateInPath");
var Co = { exports: {} }, au = Co.exports, nu;
function iT() {
  return nu || (nu = 1, (function(e) {
    (function(t) {
      var r = function() {
      }, i = t.requestAnimationFrame || t.webkitRequestAnimationFrame || t.mozRequestAnimationFrame || t.msRequestAnimationFrame || function(h) {
        return setTimeout(h, 16);
      };
      function s() {
        var h = this;
        h.reads = [], h.writes = [], h.raf = i.bind(t);
      }
      s.prototype = {
        constructor: s,
        /**
         * We run this inside a try catch
         * so that if any jobs error, we
         * are able to recover and continue
         * to flush the batch until it's empty.
         *
         * @param {Array} tasks
         */
        runTasks: function(h) {
          for (var u; u = h.shift(); ) u();
        },
        /**
         * Adds a job to the read batch and
         * schedules a new frame if need be.
         *
         * @param  {Function} fn
         * @param  {Object} ctx the context to be bound to `fn` (optional).
         * @public
         */
        measure: function(h, u) {
          var d = u ? h.bind(u) : h;
          return this.reads.push(d), o(this), d;
        },
        /**
         * Adds a job to the
         * write batch and schedules
         * a new frame if need be.
         *
         * @param  {Function} fn
         * @param  {Object} ctx the context to be bound to `fn` (optional).
         * @public
         */
        mutate: function(h, u) {
          var d = u ? h.bind(u) : h;
          return this.writes.push(d), o(this), d;
        },
        /**
         * Clears a scheduled 'read' or 'write' task.
         *
         * @param {Object} task
         * @return {Boolean} success
         * @public
         */
        clear: function(h) {
          return n(this.reads, h) || n(this.writes, h);
        },
        /**
         * Extend this FastDom with some
         * custom functionality.
         *
         * Because fastdom must *always* be a
         * singleton, we're actually extending
         * the fastdom instance. This means tasks
         * scheduled by an extension still enter
         * fastdom's global task queue.
         *
         * The 'super' instance can be accessed
         * from `this.fastdom`.
         *
         * @example
         *
         * var myFastdom = fastdom.extend({
         *   initialize: function() {
         *     // runs on creation
         *   },
         *
         *   // override a method
         *   measure: function(fn) {
         *     // do extra stuff ...
         *
         *     // then call the original
         *     return this.fastdom.measure(fn);
         *   },
         *
         *   ...
         * });
         *
         * @param  {Object} props  properties to mixin
         * @return {FastDom}
         */
        extend: function(h) {
          if (typeof h != "object") throw new Error("expected object");
          var u = Object.create(this);
          return l(u, h), u.fastdom = this, u.initialize && u.initialize(), u;
        },
        // override this with a function
        // to prevent Errors in console
        // when tasks throw
        catch: null
      };
      function o(h) {
        h.scheduled || (h.scheduled = !0, h.raf(a.bind(null, h)));
      }
      function a(h) {
        var u = h.writes, d = h.reads, f;
        try {
          r("flushing reads", d.length), h.runTasks(d), r("flushing writes", u.length), h.runTasks(u);
        } catch (m) {
          f = m;
        }
        if (h.scheduled = !1, (d.length || u.length) && o(h), f)
          if (r("task errored", f.message), h.catch) h.catch(f);
          else throw f;
      }
      function n(h, u) {
        var d = h.indexOf(u);
        return !!~d && !!h.splice(d, 1);
      }
      function l(h, u) {
        for (var d in u)
          u.hasOwnProperty(d) && (h[d] = u[d]);
      }
      var c = t.fastdom = t.fastdom || new s();
      e.exports = c;
    })(typeof window < "u" ? window : typeof au < "u" ? au : globalThis);
  })(Co)), Co.exports;
}
var sT = iT();
const oT = /* @__PURE__ */ yl(sT);
var za = { exports: {} }, lu;
function aT() {
  return lu || (lu = 1, (function(e) {
    (function() {
      var t = {
        initialize: function() {
          this._tasks = /* @__PURE__ */ new Map();
        },
        mutate: function(i, s) {
          return r(this, "mutate", i, s);
        },
        measure: function(i, s) {
          return r(this, "measure", i, s);
        },
        clear: function(i) {
          var s = this._tasks, o = s.get(i);
          this.fastdom.clear(o), s.delete(i);
        }
      };
      function r(i, s, o, a) {
        var n = i._tasks, l = i.fastdom, c, h = new Promise(function(u, d) {
          c = l[s](function() {
            n.delete(h);
            try {
              u(a ? o.call(a) : o());
            } catch (f) {
              d(f);
            }
          }, a);
        });
        return n.set(h, c), h;
      }
      e.exports = t;
    })();
  })(za)), za.exports;
}
var nT = aT();
const lT = /* @__PURE__ */ yl(nT);
function Gl() {
  return { async: !1, breaks: !1, extensions: null, gfm: !0, hooks: null, pedantic: !1, renderer: null, silent: !1, tokenizer: null, walkTokens: null };
}
var hi = Gl();
function Dp(e) {
  hi = e;
}
var bs = { exec: () => null };
function Wt(e, t = "") {
  let r = typeof e == "string" ? e : e.source, i = { replace: (s, o) => {
    let a = typeof o == "string" ? o : o.source;
    return a = a.replace(ke.caret, "$1"), r = r.replace(s, a), i;
  }, getRegex: () => new RegExp(r, t) };
  return i;
}
var hT = (() => {
  try {
    return !!new RegExp("(?<=1)(?<!1)");
  } catch {
    return !1;
  }
})(), ke = { codeRemoveIndent: /^(?: {1,4}| {0,3}\t)/gm, outputLinkReplace: /\\([\[\]])/g, indentCodeCompensation: /^(\s+)(?:```)/, beginningSpace: /^\s+/, endingHash: /#$/, startingSpaceChar: /^ /, endingSpaceChar: / $/, nonSpaceChar: /[^ ]/, newLineCharGlobal: /\n/g, tabCharGlobal: /\t/g, multipleSpaceGlobal: /\s+/g, blankLine: /^[ \t]*$/, doubleBlankLine: /\n[ \t]*\n[ \t]*$/, blockquoteStart: /^ {0,3}>/, blockquoteSetextReplace: /\n {0,3}((?:=+|-+) *)(?=\n|$)/g, blockquoteSetextReplace2: /^ {0,3}>[ \t]?/gm, listReplaceTabs: /^\t+/, listReplaceNesting: /^ {1,4}(?=( {4})*[^ ])/g, listIsTask: /^\[[ xX]\] /, listReplaceTask: /^\[[ xX]\] +/, anyLine: /\n.*\n/, hrefBrackets: /^<(.*)>$/, tableDelimiter: /[:|]/, tableAlignChars: /^\||\| *$/g, tableRowBlankLine: /\n[ \t]*$/, tableAlignRight: /^ *-+: *$/, tableAlignCenter: /^ *:-+: *$/, tableAlignLeft: /^ *:-+ *$/, startATag: /^<a /i, endATag: /^<\/a>/i, startPreScriptTag: /^<(pre|code|kbd|script)(\s|>)/i, endPreScriptTag: /^<\/(pre|code|kbd|script)(\s|>)/i, startAngleBracket: /^</, endAngleBracket: />$/, pedanticHrefTitle: /^([^'"]*[^\s])\s+(['"])(.*)\2/, unicodeAlphaNumeric: /[\p{L}\p{N}]/u, escapeTest: /[&<>"']/, escapeReplace: /[&<>"']/g, escapeTestNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/, escapeReplaceNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g, unescapeTest: /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig, caret: /(^|[^\[])\^/g, percentDecode: /%25/g, findPipe: /\|/g, splitPipe: / \|/, slashPipe: /\\\|/g, carriageReturn: /\r\n|\r/g, spaceLine: /^ +$/gm, notSpaceStart: /^\S*/, endingNewline: /\n$/, listItemRegex: (e) => new RegExp(`^( {0,3}${e})((?:[	 ][^\\n]*)?(?:\\n|$))`), nextBulletRegex: (e) => new RegExp(`^ {0,${Math.min(3, e - 1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`), hrRegex: (e) => new RegExp(`^ {0,${Math.min(3, e - 1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`), fencesBeginRegex: (e) => new RegExp(`^ {0,${Math.min(3, e - 1)}}(?:\`\`\`|~~~)`), headingBeginRegex: (e) => new RegExp(`^ {0,${Math.min(3, e - 1)}}#`), htmlBeginRegex: (e) => new RegExp(`^ {0,${Math.min(3, e - 1)}}<(?:[a-z].*>|!--)`, "i") }, cT = /^(?:[ \t]*(?:\n|$))+/, uT = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/, dT = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/, zs = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/, fT = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/, Xl = /(?:[*+-]|\d{1,9}[.)])/, Ip = /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/, Pp = Wt(Ip).replace(/bull/g, Xl).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/\|table/g, "").getRegex(), pT = Wt(Ip).replace(/bull/g, Xl).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(), Vl = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/, gT = /^[^\n]+/, Zl = /(?!\s*\])(?:\\[\s\S]|[^\[\]\\])+/, mT = Wt(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label", Zl).replace("title", /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(), yT = Wt(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g, Xl).getRegex(), sa = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul", Kl = /<!--(?:-?>|[\s\S]*?(?:-->|$))/, xT = Wt("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))", "i").replace("comment", Kl).replace("tag", sa).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(), Rp = Wt(Vl).replace("hr", zs).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", sa).getRegex(), CT = Wt(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph", Rp).getRegex(), Ql = { blockquote: CT, code: uT, def: mT, fences: dT, heading: fT, hr: zs, html: xT, lheading: Pp, list: yT, newline: cT, paragraph: Rp, table: bs, text: gT }, hu = Wt("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr", zs).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", "(?: {4}| {0,3}	)[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", sa).getRegex(), bT = { ...Ql, lheading: pT, table: hu, paragraph: Wt(Vl).replace("hr", zs).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", hu).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", sa).getRegex() }, kT = { ...Ql, html: Wt(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment", Kl).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(), def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/, heading: /^(#{1,6})(.*)(?:\n+|$)/, fences: bs, lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/, paragraph: Wt(Vl).replace("hr", zs).replace("heading", ` *#{1,6} *[^
]`).replace("lheading", Pp).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex() }, wT = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/, TT = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/, Np = /^( {2,}|\\)\n(?!\s*$)/, ST = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/, oa = /[\p{P}\p{S}]/u, Jl = /[\s\p{P}\p{S}]/u, qp = /[^\s\p{P}\p{S}]/u, _T = Wt(/^((?![*_])punctSpace)/, "u").replace(/punctSpace/g, Jl).getRegex(), zp = /(?!~)[\p{P}\p{S}]/u, vT = /(?!~)[\s\p{P}\p{S}]/u, BT = /(?:[^\s\p{P}\p{S}]|~)/u, LT = Wt(/link|precode-code|html/, "g").replace("link", /\[(?:[^\[\]`]|(?<a>`+)[^`]+\k<a>(?!`))*?\]\((?:\\[\s\S]|[^\\\(\)]|\((?:\\[\s\S]|[^\\\(\)])*\))*\)/).replace("precode-", hT ? "(?<!`)()" : "(^^|[^`])").replace("code", /(?<b>`+)[^`]+\k<b>(?!`)/).replace("html", /<(?! )[^<>]*?>/).getRegex(), Wp = /^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/, FT = Wt(Wp, "u").replace(/punct/g, oa).getRegex(), AT = Wt(Wp, "u").replace(/punct/g, zp).getRegex(), Hp = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)", ET = Wt(Hp, "gu").replace(/notPunctSpace/g, qp).replace(/punctSpace/g, Jl).replace(/punct/g, oa).getRegex(), MT = Wt(Hp, "gu").replace(/notPunctSpace/g, BT).replace(/punctSpace/g, vT).replace(/punct/g, zp).getRegex(), $T = Wt("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)", "gu").replace(/notPunctSpace/g, qp).replace(/punctSpace/g, Jl).replace(/punct/g, oa).getRegex(), OT = Wt(/\\(punct)/, "gu").replace(/punct/g, oa).getRegex(), DT = Wt(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(), IT = Wt(Kl).replace("(?:-->|$)", "-->").getRegex(), PT = Wt("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment", IT).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(), No = /(?:\[(?:\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+[^`]*?`+(?!`)|[^\[\]\\`])*?/, RT = Wt(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]*(?:\n[ \t]*)?)(title))?\s*\)/).replace("label", No).replace("href", /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title", /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(), Yp = Wt(/^!?\[(label)\]\[(ref)\]/).replace("label", No).replace("ref", Zl).getRegex(), Up = Wt(/^!?\[(ref)\](?:\[\])?/).replace("ref", Zl).getRegex(), NT = Wt("reflink|nolink(?!\\()", "g").replace("reflink", Yp).replace("nolink", Up).getRegex(), cu = /[hH][tT][tT][pP][sS]?|[fF][tT][pP]/, th = { _backpedal: bs, anyPunctuation: OT, autolink: DT, blockSkip: LT, br: Np, code: TT, del: bs, emStrongLDelim: FT, emStrongRDelimAst: ET, emStrongRDelimUnd: $T, escape: wT, link: RT, nolink: Up, punctuation: _T, reflink: Yp, reflinkSearch: NT, tag: PT, text: ST, url: bs }, qT = { ...th, link: Wt(/^!?\[(label)\]\((.*?)\)/).replace("label", No).getRegex(), reflink: Wt(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", No).getRegex() }, Xn = { ...th, emStrongRDelimAst: MT, emStrongLDelim: AT, url: Wt(/^((?:protocol):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/).replace("protocol", cu).replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(), _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/, del: /^(~~?)(?=[^\s~])((?:\\[\s\S]|[^\\])*?(?:\\[\s\S]|[^\s~\\]))\1(?=[^~]|$)/, text: Wt(/^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|protocol:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/).replace("protocol", cu).getRegex() }, zT = { ...Xn, br: Wt(Np).replace("{2,}", "*").getRegex(), text: Wt(Xn.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex() }, eo = { normal: Ql, gfm: bT, pedantic: kT }, Qi = { normal: th, gfm: Xn, breaks: zT, pedantic: qT }, WT = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }, uu = (e) => WT[e];
function tr(e, t) {
  if (t) {
    if (ke.escapeTest.test(e)) return e.replace(ke.escapeReplace, uu);
  } else if (ke.escapeTestNoEncode.test(e)) return e.replace(ke.escapeReplaceNoEncode, uu);
  return e;
}
function du(e) {
  try {
    e = encodeURI(e).replace(ke.percentDecode, "%");
  } catch {
    return null;
  }
  return e;
}
function fu(e, t) {
  let r = e.replace(ke.findPipe, (o, a, n) => {
    let l = !1, c = a;
    for (; --c >= 0 && n[c] === "\\"; ) l = !l;
    return l ? "|" : " |";
  }), i = r.split(ke.splitPipe), s = 0;
  if (i[0].trim() || i.shift(), i.length > 0 && !i.at(-1)?.trim() && i.pop(), t) if (i.length > t) i.splice(t);
  else for (; i.length < t; ) i.push("");
  for (; s < i.length; s++) i[s] = i[s].trim().replace(ke.slashPipe, "|");
  return i;
}
function Ji(e, t, r) {
  let i = e.length;
  if (i === 0) return "";
  let s = 0;
  for (; s < i && e.charAt(i - s - 1) === t; )
    s++;
  return e.slice(0, i - s);
}
function HT(e, t) {
  if (e.indexOf(t[1]) === -1) return -1;
  let r = 0;
  for (let i = 0; i < e.length; i++) if (e[i] === "\\") i++;
  else if (e[i] === t[0]) r++;
  else if (e[i] === t[1] && (r--, r < 0)) return i;
  return r > 0 ? -2 : -1;
}
function pu(e, t, r, i, s) {
  let o = t.href, a = t.title || null, n = e[1].replace(s.other.outputLinkReplace, "$1");
  i.state.inLink = !0;
  let l = { type: e[0].charAt(0) === "!" ? "image" : "link", raw: r, href: o, title: a, text: n, tokens: i.inlineTokens(n) };
  return i.state.inLink = !1, l;
}
function YT(e, t, r) {
  let i = e.match(r.other.indentCodeCompensation);
  if (i === null) return t;
  let s = i[1];
  return t.split(`
`).map((o) => {
    let a = o.match(r.other.beginningSpace);
    if (a === null) return o;
    let [n] = a;
    return n.length >= s.length ? o.slice(s.length) : o;
  }).join(`
`);
}
var qo = class {
  options;
  rules;
  lexer;
  constructor(t) {
    this.options = t || hi;
  }
  space(t) {
    let r = this.rules.block.newline.exec(t);
    if (r && r[0].length > 0) return { type: "space", raw: r[0] };
  }
  code(t) {
    let r = this.rules.block.code.exec(t);
    if (r) {
      let i = r[0].replace(this.rules.other.codeRemoveIndent, "");
      return { type: "code", raw: r[0], codeBlockStyle: "indented", text: this.options.pedantic ? i : Ji(i, `
`) };
    }
  }
  fences(t) {
    let r = this.rules.block.fences.exec(t);
    if (r) {
      let i = r[0], s = YT(i, r[3] || "", this.rules);
      return { type: "code", raw: i, lang: r[2] ? r[2].trim().replace(this.rules.inline.anyPunctuation, "$1") : r[2], text: s };
    }
  }
  heading(t) {
    let r = this.rules.block.heading.exec(t);
    if (r) {
      let i = r[2].trim();
      if (this.rules.other.endingHash.test(i)) {
        let s = Ji(i, "#");
        (this.options.pedantic || !s || this.rules.other.endingSpaceChar.test(s)) && (i = s.trim());
      }
      return { type: "heading", raw: r[0], depth: r[1].length, text: i, tokens: this.lexer.inline(i) };
    }
  }
  hr(t) {
    let r = this.rules.block.hr.exec(t);
    if (r) return { type: "hr", raw: Ji(r[0], `
`) };
  }
  blockquote(t) {
    let r = this.rules.block.blockquote.exec(t);
    if (r) {
      let i = Ji(r[0], `
`).split(`
`), s = "", o = "", a = [];
      for (; i.length > 0; ) {
        let n = !1, l = [], c;
        for (c = 0; c < i.length; c++) if (this.rules.other.blockquoteStart.test(i[c])) l.push(i[c]), n = !0;
        else if (!n) l.push(i[c]);
        else break;
        i = i.slice(c);
        let h = l.join(`
`), u = h.replace(this.rules.other.blockquoteSetextReplace, `
    $1`).replace(this.rules.other.blockquoteSetextReplace2, "");
        s = s ? `${s}
${h}` : h, o = o ? `${o}
${u}` : u;
        let d = this.lexer.state.top;
        if (this.lexer.state.top = !0, this.lexer.blockTokens(u, a, !0), this.lexer.state.top = d, i.length === 0) break;
        let f = a.at(-1);
        if (f?.type === "code") break;
        if (f?.type === "blockquote") {
          let m = f, y = m.raw + `
` + i.join(`
`), x = this.blockquote(y);
          a[a.length - 1] = x, s = s.substring(0, s.length - m.raw.length) + x.raw, o = o.substring(0, o.length - m.text.length) + x.text;
          break;
        } else if (f?.type === "list") {
          let m = f, y = m.raw + `
` + i.join(`
`), x = this.list(y);
          a[a.length - 1] = x, s = s.substring(0, s.length - f.raw.length) + x.raw, o = o.substring(0, o.length - m.raw.length) + x.raw, i = y.substring(a.at(-1).raw.length).split(`
`);
          continue;
        }
      }
      return { type: "blockquote", raw: s, tokens: a, text: o };
    }
  }
  list(t) {
    let r = this.rules.block.list.exec(t);
    if (r) {
      let i = r[1].trim(), s = i.length > 1, o = { type: "list", raw: "", ordered: s, start: s ? +i.slice(0, -1) : "", loose: !1, items: [] };
      i = s ? `\\d{1,9}\\${i.slice(-1)}` : `\\${i}`, this.options.pedantic && (i = s ? i : "[*+-]");
      let a = this.rules.other.listItemRegex(i), n = !1;
      for (; t; ) {
        let c = !1, h = "", u = "";
        if (!(r = a.exec(t)) || this.rules.block.hr.test(t)) break;
        h = r[0], t = t.substring(h.length);
        let d = r[2].split(`
`, 1)[0].replace(this.rules.other.listReplaceTabs, (k) => " ".repeat(3 * k.length)), f = t.split(`
`, 1)[0], m = !d.trim(), y = 0;
        if (this.options.pedantic ? (y = 2, u = d.trimStart()) : m ? y = r[1].length + 1 : (y = r[2].search(this.rules.other.nonSpaceChar), y = y > 4 ? 1 : y, u = d.slice(y), y += r[1].length), m && this.rules.other.blankLine.test(f) && (h += f + `
`, t = t.substring(f.length + 1), c = !0), !c) {
          let k = this.rules.other.nextBulletRegex(y), T = this.rules.other.hrRegex(y), _ = this.rules.other.fencesBeginRegex(y), v = this.rules.other.headingBeginRegex(y), L = this.rules.other.htmlBeginRegex(y);
          for (; t; ) {
            let A = t.split(`
`, 1)[0], F;
            if (f = A, this.options.pedantic ? (f = f.replace(this.rules.other.listReplaceNesting, "  "), F = f) : F = f.replace(this.rules.other.tabCharGlobal, "    "), _.test(f) || v.test(f) || L.test(f) || k.test(f) || T.test(f)) break;
            if (F.search(this.rules.other.nonSpaceChar) >= y || !f.trim()) u += `
` + F.slice(y);
            else {
              if (m || d.replace(this.rules.other.tabCharGlobal, "    ").search(this.rules.other.nonSpaceChar) >= 4 || _.test(d) || v.test(d) || T.test(d)) break;
              u += `
` + f;
            }
            !m && !f.trim() && (m = !0), h += A + `
`, t = t.substring(A.length + 1), d = F.slice(y);
          }
        }
        o.loose || (n ? o.loose = !0 : this.rules.other.doubleBlankLine.test(h) && (n = !0));
        let x = null, C;
        this.options.gfm && (x = this.rules.other.listIsTask.exec(u), x && (C = x[0] !== "[ ] ", u = u.replace(this.rules.other.listReplaceTask, ""))), o.items.push({ type: "list_item", raw: h, task: !!x, checked: C, loose: !1, text: u, tokens: [] }), o.raw += h;
      }
      let l = o.items.at(-1);
      if (l) l.raw = l.raw.trimEnd(), l.text = l.text.trimEnd();
      else return;
      o.raw = o.raw.trimEnd();
      for (let c = 0; c < o.items.length; c++) if (this.lexer.state.top = !1, o.items[c].tokens = this.lexer.blockTokens(o.items[c].text, []), !o.loose) {
        let h = o.items[c].tokens.filter((d) => d.type === "space"), u = h.length > 0 && h.some((d) => this.rules.other.anyLine.test(d.raw));
        o.loose = u;
      }
      if (o.loose) for (let c = 0; c < o.items.length; c++) o.items[c].loose = !0;
      return o;
    }
  }
  html(t) {
    let r = this.rules.block.html.exec(t);
    if (r) return { type: "html", block: !0, raw: r[0], pre: r[1] === "pre" || r[1] === "script" || r[1] === "style", text: r[0] };
  }
  def(t) {
    let r = this.rules.block.def.exec(t);
    if (r) {
      let i = r[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal, " "), s = r[2] ? r[2].replace(this.rules.other.hrefBrackets, "$1").replace(this.rules.inline.anyPunctuation, "$1") : "", o = r[3] ? r[3].substring(1, r[3].length - 1).replace(this.rules.inline.anyPunctuation, "$1") : r[3];
      return { type: "def", tag: i, raw: r[0], href: s, title: o };
    }
  }
  table(t) {
    let r = this.rules.block.table.exec(t);
    if (!r || !this.rules.other.tableDelimiter.test(r[2])) return;
    let i = fu(r[1]), s = r[2].replace(this.rules.other.tableAlignChars, "").split("|"), o = r[3]?.trim() ? r[3].replace(this.rules.other.tableRowBlankLine, "").split(`
`) : [], a = { type: "table", raw: r[0], header: [], align: [], rows: [] };
    if (i.length === s.length) {
      for (let n of s) this.rules.other.tableAlignRight.test(n) ? a.align.push("right") : this.rules.other.tableAlignCenter.test(n) ? a.align.push("center") : this.rules.other.tableAlignLeft.test(n) ? a.align.push("left") : a.align.push(null);
      for (let n = 0; n < i.length; n++) a.header.push({ text: i[n], tokens: this.lexer.inline(i[n]), header: !0, align: a.align[n] });
      for (let n of o) a.rows.push(fu(n, a.header.length).map((l, c) => ({ text: l, tokens: this.lexer.inline(l), header: !1, align: a.align[c] })));
      return a;
    }
  }
  lheading(t) {
    let r = this.rules.block.lheading.exec(t);
    if (r) return { type: "heading", raw: r[0], depth: r[2].charAt(0) === "=" ? 1 : 2, text: r[1], tokens: this.lexer.inline(r[1]) };
  }
  paragraph(t) {
    let r = this.rules.block.paragraph.exec(t);
    if (r) {
      let i = r[1].charAt(r[1].length - 1) === `
` ? r[1].slice(0, -1) : r[1];
      return { type: "paragraph", raw: r[0], text: i, tokens: this.lexer.inline(i) };
    }
  }
  text(t) {
    let r = this.rules.block.text.exec(t);
    if (r) return { type: "text", raw: r[0], text: r[0], tokens: this.lexer.inline(r[0]) };
  }
  escape(t) {
    let r = this.rules.inline.escape.exec(t);
    if (r) return { type: "escape", raw: r[0], text: r[1] };
  }
  tag(t) {
    let r = this.rules.inline.tag.exec(t);
    if (r) return !this.lexer.state.inLink && this.rules.other.startATag.test(r[0]) ? this.lexer.state.inLink = !0 : this.lexer.state.inLink && this.rules.other.endATag.test(r[0]) && (this.lexer.state.inLink = !1), !this.lexer.state.inRawBlock && this.rules.other.startPreScriptTag.test(r[0]) ? this.lexer.state.inRawBlock = !0 : this.lexer.state.inRawBlock && this.rules.other.endPreScriptTag.test(r[0]) && (this.lexer.state.inRawBlock = !1), { type: "html", raw: r[0], inLink: this.lexer.state.inLink, inRawBlock: this.lexer.state.inRawBlock, block: !1, text: r[0] };
  }
  link(t) {
    let r = this.rules.inline.link.exec(t);
    if (r) {
      let i = r[2].trim();
      if (!this.options.pedantic && this.rules.other.startAngleBracket.test(i)) {
        if (!this.rules.other.endAngleBracket.test(i)) return;
        let a = Ji(i.slice(0, -1), "\\");
        if ((i.length - a.length) % 2 === 0) return;
      } else {
        let a = HT(r[2], "()");
        if (a === -2) return;
        if (a > -1) {
          let n = (r[0].indexOf("!") === 0 ? 5 : 4) + r[1].length + a;
          r[2] = r[2].substring(0, a), r[0] = r[0].substring(0, n).trim(), r[3] = "";
        }
      }
      let s = r[2], o = "";
      if (this.options.pedantic) {
        let a = this.rules.other.pedanticHrefTitle.exec(s);
        a && (s = a[1], o = a[3]);
      } else o = r[3] ? r[3].slice(1, -1) : "";
      return s = s.trim(), this.rules.other.startAngleBracket.test(s) && (this.options.pedantic && !this.rules.other.endAngleBracket.test(i) ? s = s.slice(1) : s = s.slice(1, -1)), pu(r, { href: s && s.replace(this.rules.inline.anyPunctuation, "$1"), title: o && o.replace(this.rules.inline.anyPunctuation, "$1") }, r[0], this.lexer, this.rules);
    }
  }
  reflink(t, r) {
    let i;
    if ((i = this.rules.inline.reflink.exec(t)) || (i = this.rules.inline.nolink.exec(t))) {
      let s = (i[2] || i[1]).replace(this.rules.other.multipleSpaceGlobal, " "), o = r[s.toLowerCase()];
      if (!o) {
        let a = i[0].charAt(0);
        return { type: "text", raw: a, text: a };
      }
      return pu(i, o, i[0], this.lexer, this.rules);
    }
  }
  emStrong(t, r, i = "") {
    let s = this.rules.inline.emStrongLDelim.exec(t);
    if (!(!s || s[3] && i.match(this.rules.other.unicodeAlphaNumeric)) && (!(s[1] || s[2]) || !i || this.rules.inline.punctuation.exec(i))) {
      let o = [...s[0]].length - 1, a, n, l = o, c = 0, h = s[0][0] === "*" ? this.rules.inline.emStrongRDelimAst : this.rules.inline.emStrongRDelimUnd;
      for (h.lastIndex = 0, r = r.slice(-1 * t.length + o); (s = h.exec(r)) != null; ) {
        if (a = s[1] || s[2] || s[3] || s[4] || s[5] || s[6], !a) continue;
        if (n = [...a].length, s[3] || s[4]) {
          l += n;
          continue;
        } else if ((s[5] || s[6]) && o % 3 && !((o + n) % 3)) {
          c += n;
          continue;
        }
        if (l -= n, l > 0) continue;
        n = Math.min(n, n + l + c);
        let u = [...s[0]][0].length, d = t.slice(0, o + s.index + u + n);
        if (Math.min(o, n) % 2) {
          let m = d.slice(1, -1);
          return { type: "em", raw: d, text: m, tokens: this.lexer.inlineTokens(m) };
        }
        let f = d.slice(2, -2);
        return { type: "strong", raw: d, text: f, tokens: this.lexer.inlineTokens(f) };
      }
    }
  }
  codespan(t) {
    let r = this.rules.inline.code.exec(t);
    if (r) {
      let i = r[2].replace(this.rules.other.newLineCharGlobal, " "), s = this.rules.other.nonSpaceChar.test(i), o = this.rules.other.startingSpaceChar.test(i) && this.rules.other.endingSpaceChar.test(i);
      return s && o && (i = i.substring(1, i.length - 1)), { type: "codespan", raw: r[0], text: i };
    }
  }
  br(t) {
    let r = this.rules.inline.br.exec(t);
    if (r) return { type: "br", raw: r[0] };
  }
  del(t) {
    let r = this.rules.inline.del.exec(t);
    if (r) return { type: "del", raw: r[0], text: r[2], tokens: this.lexer.inlineTokens(r[2]) };
  }
  autolink(t) {
    let r = this.rules.inline.autolink.exec(t);
    if (r) {
      let i, s;
      return r[2] === "@" ? (i = r[1], s = "mailto:" + i) : (i = r[1], s = i), { type: "link", raw: r[0], text: i, href: s, tokens: [{ type: "text", raw: i, text: i }] };
    }
  }
  url(t) {
    let r;
    if (r = this.rules.inline.url.exec(t)) {
      let i, s;
      if (r[2] === "@") i = r[0], s = "mailto:" + i;
      else {
        let o;
        do
          o = r[0], r[0] = this.rules.inline._backpedal.exec(r[0])?.[0] ?? "";
        while (o !== r[0]);
        i = r[0], r[1] === "www." ? s = "http://" + r[0] : s = r[0];
      }
      return { type: "link", raw: r[0], text: i, href: s, tokens: [{ type: "text", raw: i, text: i }] };
    }
  }
  inlineText(t) {
    let r = this.rules.inline.text.exec(t);
    if (r) {
      let i = this.lexer.state.inRawBlock;
      return { type: "text", raw: r[0], text: r[0], escaped: i };
    }
  }
}, He = class Vn {
  tokens;
  options;
  state;
  tokenizer;
  inlineQueue;
  constructor(t) {
    this.tokens = [], this.tokens.links = /* @__PURE__ */ Object.create(null), this.options = t || hi, this.options.tokenizer = this.options.tokenizer || new qo(), this.tokenizer = this.options.tokenizer, this.tokenizer.options = this.options, this.tokenizer.lexer = this, this.inlineQueue = [], this.state = { inLink: !1, inRawBlock: !1, top: !0 };
    let r = { other: ke, block: eo.normal, inline: Qi.normal };
    this.options.pedantic ? (r.block = eo.pedantic, r.inline = Qi.pedantic) : this.options.gfm && (r.block = eo.gfm, this.options.breaks ? r.inline = Qi.breaks : r.inline = Qi.gfm), this.tokenizer.rules = r;
  }
  static get rules() {
    return { block: eo, inline: Qi };
  }
  static lex(t, r) {
    return new Vn(r).lex(t);
  }
  static lexInline(t, r) {
    return new Vn(r).inlineTokens(t);
  }
  lex(t) {
    t = t.replace(ke.carriageReturn, `
`), this.blockTokens(t, this.tokens);
    for (let r = 0; r < this.inlineQueue.length; r++) {
      let i = this.inlineQueue[r];
      this.inlineTokens(i.src, i.tokens);
    }
    return this.inlineQueue = [], this.tokens;
  }
  blockTokens(t, r = [], i = !1) {
    for (this.options.pedantic && (t = t.replace(ke.tabCharGlobal, "    ").replace(ke.spaceLine, "")); t; ) {
      let s;
      if (this.options.extensions?.block?.some((a) => (s = a.call({ lexer: this }, t, r)) ? (t = t.substring(s.raw.length), r.push(s), !0) : !1)) continue;
      if (s = this.tokenizer.space(t)) {
        t = t.substring(s.raw.length);
        let a = r.at(-1);
        s.raw.length === 1 && a !== void 0 ? a.raw += `
` : r.push(s);
        continue;
      }
      if (s = this.tokenizer.code(t)) {
        t = t.substring(s.raw.length);
        let a = r.at(-1);
        a?.type === "paragraph" || a?.type === "text" ? (a.raw += (a.raw.endsWith(`
`) ? "" : `
`) + s.raw, a.text += `
` + s.text, this.inlineQueue.at(-1).src = a.text) : r.push(s);
        continue;
      }
      if (s = this.tokenizer.fences(t)) {
        t = t.substring(s.raw.length), r.push(s);
        continue;
      }
      if (s = this.tokenizer.heading(t)) {
        t = t.substring(s.raw.length), r.push(s);
        continue;
      }
      if (s = this.tokenizer.hr(t)) {
        t = t.substring(s.raw.length), r.push(s);
        continue;
      }
      if (s = this.tokenizer.blockquote(t)) {
        t = t.substring(s.raw.length), r.push(s);
        continue;
      }
      if (s = this.tokenizer.list(t)) {
        t = t.substring(s.raw.length), r.push(s);
        continue;
      }
      if (s = this.tokenizer.html(t)) {
        t = t.substring(s.raw.length), r.push(s);
        continue;
      }
      if (s = this.tokenizer.def(t)) {
        t = t.substring(s.raw.length);
        let a = r.at(-1);
        a?.type === "paragraph" || a?.type === "text" ? (a.raw += (a.raw.endsWith(`
`) ? "" : `
`) + s.raw, a.text += `
` + s.raw, this.inlineQueue.at(-1).src = a.text) : this.tokens.links[s.tag] || (this.tokens.links[s.tag] = { href: s.href, title: s.title }, r.push(s));
        continue;
      }
      if (s = this.tokenizer.table(t)) {
        t = t.substring(s.raw.length), r.push(s);
        continue;
      }
      if (s = this.tokenizer.lheading(t)) {
        t = t.substring(s.raw.length), r.push(s);
        continue;
      }
      let o = t;
      if (this.options.extensions?.startBlock) {
        let a = 1 / 0, n = t.slice(1), l;
        this.options.extensions.startBlock.forEach((c) => {
          l = c.call({ lexer: this }, n), typeof l == "number" && l >= 0 && (a = Math.min(a, l));
        }), a < 1 / 0 && a >= 0 && (o = t.substring(0, a + 1));
      }
      if (this.state.top && (s = this.tokenizer.paragraph(o))) {
        let a = r.at(-1);
        i && a?.type === "paragraph" ? (a.raw += (a.raw.endsWith(`
`) ? "" : `
`) + s.raw, a.text += `
` + s.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = a.text) : r.push(s), i = o.length !== t.length, t = t.substring(s.raw.length);
        continue;
      }
      if (s = this.tokenizer.text(t)) {
        t = t.substring(s.raw.length);
        let a = r.at(-1);
        a?.type === "text" ? (a.raw += (a.raw.endsWith(`
`) ? "" : `
`) + s.raw, a.text += `
` + s.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = a.text) : r.push(s);
        continue;
      }
      if (t) {
        let a = "Infinite loop on byte: " + t.charCodeAt(0);
        if (this.options.silent) {
          console.error(a);
          break;
        } else throw new Error(a);
      }
    }
    return this.state.top = !0, r;
  }
  inline(t, r = []) {
    return this.inlineQueue.push({ src: t, tokens: r }), r;
  }
  inlineTokens(t, r = []) {
    let i = t, s = null;
    if (this.tokens.links) {
      let l = Object.keys(this.tokens.links);
      if (l.length > 0) for (; (s = this.tokenizer.rules.inline.reflinkSearch.exec(i)) != null; ) l.includes(s[0].slice(s[0].lastIndexOf("[") + 1, -1)) && (i = i.slice(0, s.index) + "[" + "a".repeat(s[0].length - 2) + "]" + i.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex));
    }
    for (; (s = this.tokenizer.rules.inline.anyPunctuation.exec(i)) != null; ) i = i.slice(0, s.index) + "++" + i.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);
    let o;
    for (; (s = this.tokenizer.rules.inline.blockSkip.exec(i)) != null; ) o = s[2] ? s[2].length : 0, i = i.slice(0, s.index + o) + "[" + "a".repeat(s[0].length - o - 2) + "]" + i.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);
    i = this.options.hooks?.emStrongMask?.call({ lexer: this }, i) ?? i;
    let a = !1, n = "";
    for (; t; ) {
      a || (n = ""), a = !1;
      let l;
      if (this.options.extensions?.inline?.some((h) => (l = h.call({ lexer: this }, t, r)) ? (t = t.substring(l.raw.length), r.push(l), !0) : !1)) continue;
      if (l = this.tokenizer.escape(t)) {
        t = t.substring(l.raw.length), r.push(l);
        continue;
      }
      if (l = this.tokenizer.tag(t)) {
        t = t.substring(l.raw.length), r.push(l);
        continue;
      }
      if (l = this.tokenizer.link(t)) {
        t = t.substring(l.raw.length), r.push(l);
        continue;
      }
      if (l = this.tokenizer.reflink(t, this.tokens.links)) {
        t = t.substring(l.raw.length);
        let h = r.at(-1);
        l.type === "text" && h?.type === "text" ? (h.raw += l.raw, h.text += l.text) : r.push(l);
        continue;
      }
      if (l = this.tokenizer.emStrong(t, i, n)) {
        t = t.substring(l.raw.length), r.push(l);
        continue;
      }
      if (l = this.tokenizer.codespan(t)) {
        t = t.substring(l.raw.length), r.push(l);
        continue;
      }
      if (l = this.tokenizer.br(t)) {
        t = t.substring(l.raw.length), r.push(l);
        continue;
      }
      if (l = this.tokenizer.del(t)) {
        t = t.substring(l.raw.length), r.push(l);
        continue;
      }
      if (l = this.tokenizer.autolink(t)) {
        t = t.substring(l.raw.length), r.push(l);
        continue;
      }
      if (!this.state.inLink && (l = this.tokenizer.url(t))) {
        t = t.substring(l.raw.length), r.push(l);
        continue;
      }
      let c = t;
      if (this.options.extensions?.startInline) {
        let h = 1 / 0, u = t.slice(1), d;
        this.options.extensions.startInline.forEach((f) => {
          d = f.call({ lexer: this }, u), typeof d == "number" && d >= 0 && (h = Math.min(h, d));
        }), h < 1 / 0 && h >= 0 && (c = t.substring(0, h + 1));
      }
      if (l = this.tokenizer.inlineText(c)) {
        t = t.substring(l.raw.length), l.raw.slice(-1) !== "_" && (n = l.raw.slice(-1)), a = !0;
        let h = r.at(-1);
        h?.type === "text" ? (h.raw += l.raw, h.text += l.text) : r.push(l);
        continue;
      }
      if (t) {
        let h = "Infinite loop on byte: " + t.charCodeAt(0);
        if (this.options.silent) {
          console.error(h);
          break;
        } else throw new Error(h);
      }
    }
    return r;
  }
}, zo = class {
  options;
  parser;
  constructor(t) {
    this.options = t || hi;
  }
  space(t) {
    return "";
  }
  code({ text: t, lang: r, escaped: i }) {
    let s = (r || "").match(ke.notSpaceStart)?.[0], o = t.replace(ke.endingNewline, "") + `
`;
    return s ? '<pre><code class="language-' + tr(s) + '">' + (i ? o : tr(o, !0)) + `</code></pre>
` : "<pre><code>" + (i ? o : tr(o, !0)) + `</code></pre>
`;
  }
  blockquote({ tokens: t }) {
    return `<blockquote>
${this.parser.parse(t)}</blockquote>
`;
  }
  html({ text: t }) {
    return t;
  }
  def(t) {
    return "";
  }
  heading({ tokens: t, depth: r }) {
    return `<h${r}>${this.parser.parseInline(t)}</h${r}>
`;
  }
  hr(t) {
    return `<hr>
`;
  }
  list(t) {
    let r = t.ordered, i = t.start, s = "";
    for (let n = 0; n < t.items.length; n++) {
      let l = t.items[n];
      s += this.listitem(l);
    }
    let o = r ? "ol" : "ul", a = r && i !== 1 ? ' start="' + i + '"' : "";
    return "<" + o + a + `>
` + s + "</" + o + `>
`;
  }
  listitem(t) {
    let r = "";
    if (t.task) {
      let i = this.checkbox({ checked: !!t.checked });
      t.loose ? t.tokens[0]?.type === "paragraph" ? (t.tokens[0].text = i + " " + t.tokens[0].text, t.tokens[0].tokens && t.tokens[0].tokens.length > 0 && t.tokens[0].tokens[0].type === "text" && (t.tokens[0].tokens[0].text = i + " " + tr(t.tokens[0].tokens[0].text), t.tokens[0].tokens[0].escaped = !0)) : t.tokens.unshift({ type: "text", raw: i + " ", text: i + " ", escaped: !0 }) : r += i + " ";
    }
    return r += this.parser.parse(t.tokens, !!t.loose), `<li>${r}</li>
`;
  }
  checkbox({ checked: t }) {
    return "<input " + (t ? 'checked="" ' : "") + 'disabled="" type="checkbox">';
  }
  paragraph({ tokens: t }) {
    return `<p>${this.parser.parseInline(t)}</p>
`;
  }
  table(t) {
    let r = "", i = "";
    for (let o = 0; o < t.header.length; o++) i += this.tablecell(t.header[o]);
    r += this.tablerow({ text: i });
    let s = "";
    for (let o = 0; o < t.rows.length; o++) {
      let a = t.rows[o];
      i = "";
      for (let n = 0; n < a.length; n++) i += this.tablecell(a[n]);
      s += this.tablerow({ text: i });
    }
    return s && (s = `<tbody>${s}</tbody>`), `<table>
<thead>
` + r + `</thead>
` + s + `</table>
`;
  }
  tablerow({ text: t }) {
    return `<tr>
${t}</tr>
`;
  }
  tablecell(t) {
    let r = this.parser.parseInline(t.tokens), i = t.header ? "th" : "td";
    return (t.align ? `<${i} align="${t.align}">` : `<${i}>`) + r + `</${i}>
`;
  }
  strong({ tokens: t }) {
    return `<strong>${this.parser.parseInline(t)}</strong>`;
  }
  em({ tokens: t }) {
    return `<em>${this.parser.parseInline(t)}</em>`;
  }
  codespan({ text: t }) {
    return `<code>${tr(t, !0)}</code>`;
  }
  br(t) {
    return "<br>";
  }
  del({ tokens: t }) {
    return `<del>${this.parser.parseInline(t)}</del>`;
  }
  link({ href: t, title: r, tokens: i }) {
    let s = this.parser.parseInline(i), o = du(t);
    if (o === null) return s;
    t = o;
    let a = '<a href="' + t + '"';
    return r && (a += ' title="' + tr(r) + '"'), a += ">" + s + "</a>", a;
  }
  image({ href: t, title: r, text: i, tokens: s }) {
    s && (i = this.parser.parseInline(s, this.parser.textRenderer));
    let o = du(t);
    if (o === null) return tr(i);
    t = o;
    let a = `<img src="${t}" alt="${i}"`;
    return r && (a += ` title="${tr(r)}"`), a += ">", a;
  }
  text(t) {
    return "tokens" in t && t.tokens ? this.parser.parseInline(t.tokens) : "escaped" in t && t.escaped ? t.text : tr(t.text);
  }
}, eh = class {
  strong({ text: t }) {
    return t;
  }
  em({ text: t }) {
    return t;
  }
  codespan({ text: t }) {
    return t;
  }
  del({ text: t }) {
    return t;
  }
  html({ text: t }) {
    return t;
  }
  text({ text: t }) {
    return t;
  }
  link({ text: t }) {
    return "" + t;
  }
  image({ text: t }) {
    return "" + t;
  }
  br() {
    return "";
  }
}, Ye = class Zn {
  options;
  renderer;
  textRenderer;
  constructor(t) {
    this.options = t || hi, this.options.renderer = this.options.renderer || new zo(), this.renderer = this.options.renderer, this.renderer.options = this.options, this.renderer.parser = this, this.textRenderer = new eh();
  }
  static parse(t, r) {
    return new Zn(r).parse(t);
  }
  static parseInline(t, r) {
    return new Zn(r).parseInline(t);
  }
  parse(t, r = !0) {
    let i = "";
    for (let s = 0; s < t.length; s++) {
      let o = t[s];
      if (this.options.extensions?.renderers?.[o.type]) {
        let n = o, l = this.options.extensions.renderers[n.type].call({ parser: this }, n);
        if (l !== !1 || !["space", "hr", "heading", "code", "table", "blockquote", "list", "html", "def", "paragraph", "text"].includes(n.type)) {
          i += l || "";
          continue;
        }
      }
      let a = o;
      switch (a.type) {
        case "space": {
          i += this.renderer.space(a);
          continue;
        }
        case "hr": {
          i += this.renderer.hr(a);
          continue;
        }
        case "heading": {
          i += this.renderer.heading(a);
          continue;
        }
        case "code": {
          i += this.renderer.code(a);
          continue;
        }
        case "table": {
          i += this.renderer.table(a);
          continue;
        }
        case "blockquote": {
          i += this.renderer.blockquote(a);
          continue;
        }
        case "list": {
          i += this.renderer.list(a);
          continue;
        }
        case "html": {
          i += this.renderer.html(a);
          continue;
        }
        case "def": {
          i += this.renderer.def(a);
          continue;
        }
        case "paragraph": {
          i += this.renderer.paragraph(a);
          continue;
        }
        case "text": {
          let n = a, l = this.renderer.text(n);
          for (; s + 1 < t.length && t[s + 1].type === "text"; ) n = t[++s], l += `
` + this.renderer.text(n);
          r ? i += this.renderer.paragraph({ type: "paragraph", raw: l, text: l, tokens: [{ type: "text", raw: l, text: l, escaped: !0 }] }) : i += l;
          continue;
        }
        default: {
          let n = 'Token with "' + a.type + '" type was not found.';
          if (this.options.silent) return console.error(n), "";
          throw new Error(n);
        }
      }
    }
    return i;
  }
  parseInline(t, r = this.renderer) {
    let i = "";
    for (let s = 0; s < t.length; s++) {
      let o = t[s];
      if (this.options.extensions?.renderers?.[o.type]) {
        let n = this.options.extensions.renderers[o.type].call({ parser: this }, o);
        if (n !== !1 || !["escape", "html", "link", "image", "strong", "em", "codespan", "br", "del", "text"].includes(o.type)) {
          i += n || "";
          continue;
        }
      }
      let a = o;
      switch (a.type) {
        case "escape": {
          i += r.text(a);
          break;
        }
        case "html": {
          i += r.html(a);
          break;
        }
        case "link": {
          i += r.link(a);
          break;
        }
        case "image": {
          i += r.image(a);
          break;
        }
        case "strong": {
          i += r.strong(a);
          break;
        }
        case "em": {
          i += r.em(a);
          break;
        }
        case "codespan": {
          i += r.codespan(a);
          break;
        }
        case "br": {
          i += r.br(a);
          break;
        }
        case "del": {
          i += r.del(a);
          break;
        }
        case "text": {
          i += r.text(a);
          break;
        }
        default: {
          let n = 'Token with "' + a.type + '" type was not found.';
          if (this.options.silent) return console.error(n), "";
          throw new Error(n);
        }
      }
    }
    return i;
  }
}, cs = class {
  options;
  block;
  constructor(t) {
    this.options = t || hi;
  }
  static passThroughHooks = /* @__PURE__ */ new Set(["preprocess", "postprocess", "processAllTokens", "emStrongMask"]);
  static passThroughHooksRespectAsync = /* @__PURE__ */ new Set(["preprocess", "postprocess", "processAllTokens"]);
  preprocess(t) {
    return t;
  }
  postprocess(t) {
    return t;
  }
  processAllTokens(t) {
    return t;
  }
  emStrongMask(t) {
    return t;
  }
  provideLexer() {
    return this.block ? He.lex : He.lexInline;
  }
  provideParser() {
    return this.block ? Ye.parse : Ye.parseInline;
  }
}, UT = class {
  defaults = Gl();
  options = this.setOptions;
  parse = this.parseMarkdown(!0);
  parseInline = this.parseMarkdown(!1);
  Parser = Ye;
  Renderer = zo;
  TextRenderer = eh;
  Lexer = He;
  Tokenizer = qo;
  Hooks = cs;
  constructor(...t) {
    this.use(...t);
  }
  walkTokens(t, r) {
    let i = [];
    for (let s of t) switch (i = i.concat(r.call(this, s)), s.type) {
      case "table": {
        let o = s;
        for (let a of o.header) i = i.concat(this.walkTokens(a.tokens, r));
        for (let a of o.rows) for (let n of a) i = i.concat(this.walkTokens(n.tokens, r));
        break;
      }
      case "list": {
        let o = s;
        i = i.concat(this.walkTokens(o.items, r));
        break;
      }
      default: {
        let o = s;
        this.defaults.extensions?.childTokens?.[o.type] ? this.defaults.extensions.childTokens[o.type].forEach((a) => {
          let n = o[a].flat(1 / 0);
          i = i.concat(this.walkTokens(n, r));
        }) : o.tokens && (i = i.concat(this.walkTokens(o.tokens, r)));
      }
    }
    return i;
  }
  use(...t) {
    let r = this.defaults.extensions || { renderers: {}, childTokens: {} };
    return t.forEach((i) => {
      let s = { ...i };
      if (s.async = this.defaults.async || s.async || !1, i.extensions && (i.extensions.forEach((o) => {
        if (!o.name) throw new Error("extension name required");
        if ("renderer" in o) {
          let a = r.renderers[o.name];
          a ? r.renderers[o.name] = function(...n) {
            let l = o.renderer.apply(this, n);
            return l === !1 && (l = a.apply(this, n)), l;
          } : r.renderers[o.name] = o.renderer;
        }
        if ("tokenizer" in o) {
          if (!o.level || o.level !== "block" && o.level !== "inline") throw new Error("extension level must be 'block' or 'inline'");
          let a = r[o.level];
          a ? a.unshift(o.tokenizer) : r[o.level] = [o.tokenizer], o.start && (o.level === "block" ? r.startBlock ? r.startBlock.push(o.start) : r.startBlock = [o.start] : o.level === "inline" && (r.startInline ? r.startInline.push(o.start) : r.startInline = [o.start]));
        }
        "childTokens" in o && o.childTokens && (r.childTokens[o.name] = o.childTokens);
      }), s.extensions = r), i.renderer) {
        let o = this.defaults.renderer || new zo(this.defaults);
        for (let a in i.renderer) {
          if (!(a in o)) throw new Error(`renderer '${a}' does not exist`);
          if (["options", "parser"].includes(a)) continue;
          let n = a, l = i.renderer[n], c = o[n];
          o[n] = (...h) => {
            let u = l.apply(o, h);
            return u === !1 && (u = c.apply(o, h)), u || "";
          };
        }
        s.renderer = o;
      }
      if (i.tokenizer) {
        let o = this.defaults.tokenizer || new qo(this.defaults);
        for (let a in i.tokenizer) {
          if (!(a in o)) throw new Error(`tokenizer '${a}' does not exist`);
          if (["options", "rules", "lexer"].includes(a)) continue;
          let n = a, l = i.tokenizer[n], c = o[n];
          o[n] = (...h) => {
            let u = l.apply(o, h);
            return u === !1 && (u = c.apply(o, h)), u;
          };
        }
        s.tokenizer = o;
      }
      if (i.hooks) {
        let o = this.defaults.hooks || new cs();
        for (let a in i.hooks) {
          if (!(a in o)) throw new Error(`hook '${a}' does not exist`);
          if (["options", "block"].includes(a)) continue;
          let n = a, l = i.hooks[n], c = o[n];
          cs.passThroughHooks.has(a) ? o[n] = (h) => {
            if (this.defaults.async && cs.passThroughHooksRespectAsync.has(a)) return (async () => {
              let d = await l.call(o, h);
              return c.call(o, d);
            })();
            let u = l.call(o, h);
            return c.call(o, u);
          } : o[n] = (...h) => {
            if (this.defaults.async) return (async () => {
              let d = await l.apply(o, h);
              return d === !1 && (d = await c.apply(o, h)), d;
            })();
            let u = l.apply(o, h);
            return u === !1 && (u = c.apply(o, h)), u;
          };
        }
        s.hooks = o;
      }
      if (i.walkTokens) {
        let o = this.defaults.walkTokens, a = i.walkTokens;
        s.walkTokens = function(n) {
          let l = [];
          return l.push(a.call(this, n)), o && (l = l.concat(o.call(this, n))), l;
        };
      }
      this.defaults = { ...this.defaults, ...s };
    }), this;
  }
  setOptions(t) {
    return this.defaults = { ...this.defaults, ...t }, this;
  }
  lexer(t, r) {
    return He.lex(t, r ?? this.defaults);
  }
  parser(t, r) {
    return Ye.parse(t, r ?? this.defaults);
  }
  parseMarkdown(t) {
    return (r, i) => {
      let s = { ...i }, o = { ...this.defaults, ...s }, a = this.onError(!!o.silent, !!o.async);
      if (this.defaults.async === !0 && s.async === !1) return a(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));
      if (typeof r > "u" || r === null) return a(new Error("marked(): input parameter is undefined or null"));
      if (typeof r != "string") return a(new Error("marked(): input parameter is of type " + Object.prototype.toString.call(r) + ", string expected"));
      if (o.hooks && (o.hooks.options = o, o.hooks.block = t), o.async) return (async () => {
        let n = o.hooks ? await o.hooks.preprocess(r) : r, l = await (o.hooks ? await o.hooks.provideLexer() : t ? He.lex : He.lexInline)(n, o), c = o.hooks ? await o.hooks.processAllTokens(l) : l;
        o.walkTokens && await Promise.all(this.walkTokens(c, o.walkTokens));
        let h = await (o.hooks ? await o.hooks.provideParser() : t ? Ye.parse : Ye.parseInline)(c, o);
        return o.hooks ? await o.hooks.postprocess(h) : h;
      })().catch(a);
      try {
        o.hooks && (r = o.hooks.preprocess(r));
        let n = (o.hooks ? o.hooks.provideLexer() : t ? He.lex : He.lexInline)(r, o);
        o.hooks && (n = o.hooks.processAllTokens(n)), o.walkTokens && this.walkTokens(n, o.walkTokens);
        let l = (o.hooks ? o.hooks.provideParser() : t ? Ye.parse : Ye.parseInline)(n, o);
        return o.hooks && (l = o.hooks.postprocess(l)), l;
      } catch (n) {
        return a(n);
      }
    };
  }
  onError(t, r) {
    return (i) => {
      if (i.message += `
Please report this to https://github.com/markedjs/marked.`, t) {
        let s = "<p>An error occurred:</p><pre>" + tr(i.message + "", !0) + "</pre>";
        return r ? Promise.resolve(s) : s;
      }
      if (r) return Promise.reject(i);
      throw i;
    };
  }
}, si = new UT();
function Yt(e, t) {
  return si.parse(e, t);
}
Yt.options = Yt.setOptions = function(e) {
  return si.setOptions(e), Yt.defaults = si.defaults, Dp(Yt.defaults), Yt;
};
Yt.getDefaults = Gl;
Yt.defaults = hi;
Yt.use = function(...e) {
  return si.use(...e), Yt.defaults = si.defaults, Dp(Yt.defaults), Yt;
};
Yt.walkTokens = function(e, t) {
  return si.walkTokens(e, t);
};
Yt.parseInline = si.parseInline;
Yt.Parser = Ye;
Yt.parser = Ye.parse;
Yt.Renderer = zo;
Yt.TextRenderer = eh;
Yt.Lexer = He;
Yt.lexer = He.lex;
Yt.Tokenizer = qo;
Yt.Hooks = cs;
Yt.parse = Yt;
Yt.options;
Yt.setOptions;
Yt.use;
Yt.walkTokens;
Yt.parseInline;
Ye.parse;
He.lex;
function jp(e) {
  for (var t = [], r = 1; r < arguments.length; r++)
    t[r - 1] = arguments[r];
  var i = Array.from(typeof e == "string" ? [e] : e);
  i[i.length - 1] = i[i.length - 1].replace(/\r?\n([\t ]*)$/, "");
  var s = i.reduce(function(n, l) {
    var c = l.match(/\n([\t ]+|(?!\s).)/g);
    return c ? n.concat(c.map(function(h) {
      var u, d;
      return (d = (u = h.match(/[\t ]/g)) === null || u === void 0 ? void 0 : u.length) !== null && d !== void 0 ? d : 0;
    })) : n;
  }, []);
  if (s.length) {
    var o = new RegExp(`
[	 ]{`.concat(Math.min.apply(Math, s), "}"), "g");
    i = i.map(function(n) {
      return n.replace(o, `
`);
    });
  }
  i[0] = i[0].replace(/^\r?\n/, "");
  var a = i[0];
  return t.forEach(function(n, l) {
    var c = a.match(/(?:^|\n)( *)$/), h = c ? c[1] : "", u = n;
    typeof n == "string" && n.includes(`
`) && (u = String(n).split(`
`).map(function(d, f) {
      return f === 0 ? d : "".concat(h).concat(d);
    }).join(`
`)), a += u + i[l + 1];
  }), a;
}
var Kn = typeof performance < "u" && typeof performance.now == "function", Ci = /* @__PURE__ */ p(() => Kn ? performance.now() : 0, "now"), Wa = "🧜 ", jT = "Mermaid render", GT = "Mermaid", XT = {
  parse: "tertiary",
  prepare: "secondary",
  measure: "primary",
  layout: "primary-dark",
  layoutCore: "error",
  draw: "primary-light",
  paint: "secondary-dark",
  serialize: "tertiary-dark",
  render: "primary-light"
};
(class {
  constructor() {
    this.enabled = !1, this.autoPrint = !0, this.records = [], this.maxRecords = 200, this.roots = [], this.stack = [], this.buckets = {};
  }
  static {
    p(this, "Profiler");
  }
  enable() {
    return this.enabled = !0, this;
  }
  disable() {
    return this.enabled = !1, this;
  }
  /** Begin a new top-level measurement (one per diagram render). */
  start(e) {
    this.enabled && (this.roots = [], this.stack = [], this.buckets = {}, this.begin(e));
  }
  /**
   * Accumulate the wall-clock of a synchronous sub-operation into a named bucket,
   * summed over every call within the render — for hot operations that run too
   * often to be individual tree spans (e.g. per-node `getBBox`). Returns the
   * function's result. No-op (just calls `fn`) unless enabled.
   */
  tickSync(e, t) {
    if (!this.enabled)
      return t();
    const r = Ci();
    try {
      return t();
    } finally {
      this.buckets[e] = (this.buckets[e] ?? 0) + (Ci() - r);
    }
  }
  /**
   * Async variant of {@link tickSync}. WARNING: only meaningful for operations
   * that run one-at-a-time. Do NOT use it for calls awaited concurrently (e.g.
   * `Promise.all(nodes.map(...))`) — their wall-clocks overlap and the summed
   * bucket balloons far past the real elapsed time. For concurrent CPU
   * attribution use a DevTools CPU profile instead.
   */
  async tick(e, t) {
    if (!this.enabled)
      return t();
    const r = Ci();
    try {
      return await t();
    } finally {
      this.buckets[e] = (this.buckets[e] ?? 0) + (Ci() - r);
    }
  }
  /** End the current top-level measurement and optionally print a summary. */
  stop() {
    if (!this.enabled)
      return;
    for (; this.stack.length > 0; )
      this.end();
    const e = this.roots.at(-1), t = this.runLabel ?? e?.name;
    return e && (this.records.push({ label: t ?? e.name, tree: e, buckets: { ...this.buckets } }), this.records.length > this.maxRecords && this.records.splice(0, this.records.length - this.maxRecords), this.autoPrint && this.printSummary(e, t)), this.runLabel = void 0, e;
  }
  /** Open a child span. Pair with {@link end}. No-op unless enabled. */
  begin(e) {
    if (!this.enabled)
      return;
    const t = { name: e, start: Ci(), duration: -1, children: [] }, r = this.stack.at(-1);
    if (r ? r.children.push(t) : this.roots.push(t), this.stack.push(t), Kn && typeof performance.mark == "function")
      try {
        performance.mark(`${Wa}${e} ▶`);
      } catch {
      }
  }
  /** Close the most recently opened span. No-op unless enabled. */
  end() {
    if (!this.enabled)
      return;
    const e = this.stack.pop();
    if (!e)
      return;
    const t = Ci();
    if (e.duration = t - e.start, Kn && typeof performance.measure == "function")
      try {
        performance.measure(`${Wa}${e.name}`, {
          start: e.start,
          end: t,
          detail: {
            devtools: {
              dataType: "track-entry",
              track: jT,
              trackGroup: GT,
              color: XT[e.name] ?? "primary",
              tooltipText: `${e.name} — ${e.duration.toFixed(1)} ms`
            }
          }
        });
      } catch {
      }
  }
  /**
   * Measure an async phase. Returns the wrapped function's result and rethrows
   * any error after closing the span, so instrumentation never swallows
   * failures or leaks an open span. No measurement overhead unless enabled.
   */
  async span(e, t) {
    if (!this.enabled)
      return t();
    this.begin(e);
    try {
      return await t();
    } finally {
      this.end();
    }
  }
  /** The most recent completed render tree, or `undefined`. */
  report() {
    return this.records.at(-1)?.tree ?? this.roots.at(-1);
  }
  /** Drop all collected records and any in-progress spans. */
  clear() {
    this.records.length = 0, this.roots = [], this.stack = [], this.runLabel = void 0;
  }
  reset() {
    this.roots = [], this.stack = [];
  }
  printSummary(e = this.report(), t) {
    if (!e)
      return;
    const r = e.duration, i = t && t !== e.name ? `${e.name} [${t}]` : e.name, s = ["ms        %    phase"], o = /* @__PURE__ */ p((n, l) => {
      const c = "  ".repeat(l), h = n.duration.toFixed(1).padStart(8), u = r > 0 ? `${(n.duration / r * 100).toFixed(0).padStart(3)}%` : "   -";
      s.push(`${h}  ${u}  ${c}${n.name}`);
      for (const d of n.children)
        o(d, l + 1);
      if (n.children.length > 0) {
        const d = n.children.reduce((m, y) => m + y.duration, 0), f = n.duration - d;
        if (f > 0.5) {
          const m = f.toFixed(1).padStart(8);
          s.push(`${m}       ${c}  (self)`);
        }
      }
    }, "walk");
    o(e, 0);
    const a = Object.keys(this.buckets);
    if (a.length > 0) {
      s.push("—— buckets (summed) ——");
      for (const n of a)
        s.push(`${this.buckets[n].toFixed(1).padStart(8)}       ${n}`);
    }
    console.log(`${Wa}mermaid render profile · ${i}
${s.join(`
`)}`);
  }
});
globalThis.injected ??= {
  includeLargeFeatures: !0,
  profiling: !1,
  version: "0.0.0"
};
var VT = (
  // @ts-expect-error -- fastdom types aren't yet ESM-compatible, we need this hack
  oT.extend({
    /**
     * `requestAnimationFrame` is too slow compared to `queueMicrotask`.
     */
    raf(e) {
      typeof queueMicrotask == "function" ? queueMicrotask(e) : setTimeout(e, 0);
    }
  }).extend(lT)
), oi = VT;
function Gp(e, { markdownAutoWrap: t }) {
  const i = e.replace(/<br\/>/g, `
`).replace(/\n{2,}/g, `
`);
  return jp(i);
}
p(Gp, "preprocessMarkdown");
function Xp(e) {
  return e.split(/\\n|\n|<br\s*\/?>/gi).map(
    (t) => t.trim().match(/<[^>]+>|[^\s<>]+/g)?.map((r) => ({ content: r, type: "normal" })) ?? []
  );
}
p(Xp, "nonMarkdownToLines");
function Vp(e, t = {}) {
  const r = Gp(e, t), i = Yt.lexer(r), s = [[]];
  let o = 0;
  function a(n, l = "normal") {
    n.type === "text" ? n.text.split(`
`).forEach((h, u) => {
      u !== 0 && (o++, s.push([])), h.split(" ").forEach((d) => {
        d = d.replace(/&#39;/g, "'"), d && s[o].push({ content: d, type: l });
      });
    }) : n.type === "strong" || n.type === "em" ? n.tokens.forEach((c) => {
      a(c, n.type);
    }) : n.type === "html" && s[o].push({ content: n.text, type: "normal" });
  }
  return p(a, "processNode"), i.forEach((n) => {
    n.type === "paragraph" ? n.tokens?.forEach((l) => {
      a(l);
    }) : n.type === "html" ? s[o].push({ content: n.text, type: "normal" }) : s[o].push({ content: n.raw, type: "normal" });
  }), s;
}
p(Vp, "markdownToLines");
function Zp(e) {
  return e ? `<p>${/**
  * Replace new lines with <br /> tags.
  *
  * Unlike in markdown text, `\n` sequences are treated as line breaks here.
  */
  e.replace(/\\n|\n/g, "<br />")}</p>` : "";
}
p(Zp, "nonMarkdownToHTML");
function Kp(e, { markdownAutoWrap: t } = {}) {
  const r = Yt.lexer(e);
  function i(s) {
    return s.type === "text" ? t === !1 ? s.text.replace(/\n */g, "<br/>").replace(/ /g, "&nbsp;") : s.text.replace(/\n */g, "<br/>") : s.type === "strong" ? `<strong>${s.tokens?.map(i).join("")}</strong>` : s.type === "em" ? `<em>${s.tokens?.map(i).join("")}</em>` : s.type === "paragraph" ? `<p>${s.tokens?.map(i).join("")}</p>` : s.type === "space" ? "" : s.type === "html" ? `${s.text}` : s.type === "escape" ? s.text : (R.warn(`Unsupported markdown: ${s.type}`), s.raw);
  }
  return p(i, "output"), r.map(i).join("");
}
p(Kp, "markdownToHTML");
function Qp(e) {
  return Intl.Segmenter ? [...new Intl.Segmenter().segment(e)].map((t) => t.segment) : [...e];
}
p(Qp, "splitTextToChars");
function Jp(e, t) {
  const r = Qp(t.content);
  return rh(e, [], r, t.type);
}
p(Jp, "splitWordToFitWidth");
function rh(e, t, r, i) {
  if (r.length === 0)
    return [
      { content: t.join(""), type: i },
      { content: "", type: i }
    ];
  const [s, ...o] = r, a = [...t, s];
  return e([{ content: a.join(""), type: i }]) ? rh(e, a, o, i) : (t.length === 0 && s && (t.push(s), r.shift()), [
    { content: t.join(""), type: i },
    { content: r.join(""), type: i }
  ]);
}
p(rh, "splitWordToFitWidthRecursion");
function tg(e, t) {
  if (e.some(({ content: r }) => r.includes(`
`)))
    throw new Error("splitLineToFitWidth does not support newlines in the line");
  return Wo(e, t);
}
p(tg, "splitLineToFitWidth");
function Wo(e, t, r = [], i = []) {
  if (e.length === 0)
    return i.length > 0 && r.push(i), r.length > 0 ? r : [];
  let s = "";
  e[0].content === " " && (s = " ", e.shift());
  const o = e.shift() ?? { content: " ", type: "normal" }, a = [...i];
  if (s !== "" && a.push({ content: s, type: "normal" }), a.push(o), t(a))
    return Wo(e, t, r, a);
  if (i.length > 0)
    r.push(i), e.unshift(o);
  else if (o.content) {
    const [n, l] = Jp(t, o);
    r.push([n]), l.content && e.unshift(l);
  }
  return Wo(e, t, r);
}
p(Wo, "splitLineToFitWidthRecursion");
function Qn(e, t) {
  t && e.attr("style", t);
}
p(Qn, "applyStyle");
var gu = 16384;
async function eg(e, t, r, i, s = !1, o = Xt()) {
  const a = e.append("foreignObject");
  a.attr("width", `${Math.min(10 * r, gu)}px`), a.attr("height", `${Math.min(10 * r, gu)}px`);
  const n = a.append("xhtml:div"), l = Ts(t.label) ? await xf(t.label.replace(Is.lineBreakRegex, `
`), o) : Re(t.label, o), c = t.isNode ? "nodeLabel" : "edgeLabel", h = n.append("span");
  return h.html(l), Qn(h, t.labelStyle), h.attr("class", `${c} ${i}`), Qn(n, t.labelStyle), n.style("display", "table-cell"), n.style("white-space", "nowrap"), n.style("line-height", "1.5"), r !== Number.POSITIVE_INFINITY && (n.style("max-width", r + "px"), n.style("text-align", "center")), n.attr("xmlns", "http://www.w3.org/1999/xhtml"), s && n.attr("class", "labelBkg"), (await oi.measure(() => n.node().getBoundingClientRect())).width === r && (n.style("display", "table"), n.style("white-space", "break-spaces"), n.style("width", r + "px")), a.node();
}
p(eg, "addHtmlSpan");
function aa(e, t, r, i = !1) {
  const s = e.append("tspan").attr("class", "text-outer-tspan").attr("x", 0).attr("y", t * r - 0.1 + "em").attr("dy", r + "em");
  return i && s.attr("text-anchor", "middle"), s;
}
p(aa, "createTspan");
function rg(e, t, r) {
  const i = e.append("text"), s = aa(i, 1, t);
  na(s, r);
  const o = s.node().getComputedTextLength();
  return i.remove(), o;
}
p(rg, "computeWidthOfText");
function ZT(e, t, r) {
  const i = e.append("text"), s = aa(i, 1, t);
  na(s, [{ content: r, type: "normal" }]);
  const o = s.node()?.getBoundingClientRect();
  return o && i.remove(), o;
}
p(ZT, "computeDimensionOfText");
function ig(e, t, r, i = !1, s = !1) {
  const a = t.append("g"), n = a.insert("rect").attr("class", "background").attr("style", "stroke: none"), l = a.append("text").attr("y", "-10.1");
  s && l.attr("text-anchor", "middle");
  let c = 0;
  for (const h of r) {
    const u = /* @__PURE__ */ p((f) => rg(a, 1.1, f) <= e, "checkWidth"), d = u(h) ? [h] : tg(h, u);
    for (const f of d) {
      const m = aa(l, c, 1.1, s);
      na(m, f), c++;
    }
  }
  if (i) {
    const h = l.node().getBBox(), u = 2;
    return n.attr("x", h.x - u).attr("y", h.y - u).attr("width", h.width + 2 * u).attr("height", h.height + 2 * u), a.node();
  } else
    return l.node();
}
p(ig, "createFormattedText");
function Jn(e) {
  const t = /&(amp|lt|gt);/g;
  return e.replace(t, (r, i) => {
    switch (i) {
      case "amp":
        return "&";
      case "lt":
        return "<";
      case "gt":
        return ">";
      default:
        return r;
    }
  });
}
p(Jn, "decodeHTMLEntities");
function na(e, t) {
  e.text(""), t.forEach((r, i) => {
    const s = e.append("tspan").attr("font-style", r.type === "em" ? "italic" : "normal").attr("class", "text-inner-tspan").attr("font-weight", r.type === "strong" ? "bold" : "normal");
    i === 0 ? s.text(Jn(r.content)) : s.text(" " + Jn(r.content));
  });
}
p(na, "updateTextContentAndStyles");
async function sg(e, t = {}) {
  const r = [];
  e.replace(/(fa[bklrs]?):fa-([\w-]+)/g, (s, o, a) => (r.push(
    (async () => {
      const n = `${o}:${a}`;
      return await aw(n) ? await Ns(n, void 0, { class: "label-icon" }) : `<i class='${Re(s, t).replace(":", " ")}'></i>`;
    })()
  ), s));
  const i = await Promise.all(r);
  return e.replace(/(fa[bklrs]?):fa-([\w-]+)/g, () => i.shift() ?? "");
}
p(sg, "replaceIconSubstring");
var Ve = /* @__PURE__ */ p(async (e, t = "", {
  style: r = "",
  isTitle: i = !1,
  classes: s = "",
  useHtmlLabels: o = !0,
  markdown: a = !0,
  isNode: n = !0,
  /**
   * The width to wrap the text within. Set to `Number.POSITIVE_INFINITY` for no wrapping.
   */
  width: l = 200,
  addSvgBackground: c = !1
} = {}, h) => {
  if (R.debug(
    "XYZ createText",
    t,
    r,
    i,
    s,
    o,
    n,
    "addSvgBackground: ",
    c
  ), o) {
    const u = a ? Kp(t, h) : Zp(t), d = await sg(zr(u), h), f = t.replace(/\\\\/g, "\\"), m = {
      isNode: n,
      label: Ts(t) ? f : d,
      labelStyle: r.replace("fill:", "color:")
    };
    return await eg(e, m, l, s, c, h);
  } else {
    const u = zr(t.replace(/<br\s*\/?>/g, "<br/>")), d = a ? Vp(u.replace("<br>", "<br/>"), h) : Xp(u), f = ig(
      l,
      e,
      d,
      t ? c : !1,
      !n
    );
    if (n) {
      /stroke:/.exec(r) && (r = r.replace("stroke:", "lineColor:"));
      const m = r.replace(/stroke:[^;]+;?/g, "").replace(/stroke-width:[^;]+;?/g, "").replace(/fill:[^;]+;?/g, "").replace(/color:/g, "fill:");
      At(f).attr("style", m);
    } else {
      const m = r.replace(/stroke:[^;]+;?/g, "").replace(/stroke-width:[^;]+;?/g, "").replace(/fill:[^;]+;?/g, "").replace(/background:/g, "fill:");
      At(f).select("rect").attr("style", m.replace(/background:/g, "fill:"));
      const y = r.replace(/stroke:[^;]+;?/g, "").replace(/stroke-width:[^;]+;?/g, "").replace(/fill:[^;]+;?/g, "").replace(/color:/g, "fill:");
      At(f).select("text").attr("style", y);
    }
    return i ? At(f).selectAll("tspan.text-outer-tspan").classed("title-row", !0) : At(f).selectAll("tspan.text-outer-tspan").classed("row", !0), f;
  }
}, "createText");
function Ha(e, t, r) {
  if (e && e.length) {
    const [i, s] = t, o = Math.PI / 180 * r, a = Math.cos(o), n = Math.sin(o);
    for (const l of e) {
      const [c, h] = l;
      l[0] = (c - i) * a - (h - s) * n + i, l[1] = (c - i) * n + (h - s) * a + s;
    }
  }
}
function KT(e, t) {
  return e[0] === t[0] && e[1] === t[1];
}
function QT(e, t, r, i = 1) {
  const s = r, o = Math.max(t, 0.1), a = e[0] && e[0][0] && typeof e[0][0] == "number" ? [e] : e, n = [0, 0];
  if (s) for (const c of a) Ha(c, n, s);
  const l = (function(c, h, u) {
    const d = [];
    for (const k of c) {
      const T = [...k];
      KT(T[0], T[T.length - 1]) || T.push([T[0][0], T[0][1]]), T.length > 2 && d.push(T);
    }
    const f = [];
    h = Math.max(h, 0.1);
    const m = [];
    for (const k of d) for (let T = 0; T < k.length - 1; T++) {
      const _ = k[T], v = k[T + 1];
      if (_[1] !== v[1]) {
        const L = Math.min(_[1], v[1]);
        m.push({ ymin: L, ymax: Math.max(_[1], v[1]), x: L === _[1] ? _[0] : v[0], islope: (v[0] - _[0]) / (v[1] - _[1]) });
      }
    }
    if (m.sort(((k, T) => k.ymin < T.ymin ? -1 : k.ymin > T.ymin ? 1 : k.x < T.x ? -1 : k.x > T.x ? 1 : k.ymax === T.ymax ? 0 : (k.ymax - T.ymax) / Math.abs(k.ymax - T.ymax))), !m.length) return f;
    let y = [], x = m[0].ymin, C = 0;
    for (; y.length || m.length; ) {
      if (m.length) {
        let k = -1;
        for (let T = 0; T < m.length && !(m[T].ymin > x); T++) k = T;
        m.splice(0, k + 1).forEach(((T) => {
          y.push({ s: x, edge: T });
        }));
      }
      if (y = y.filter(((k) => !(k.edge.ymax <= x))), y.sort(((k, T) => k.edge.x === T.edge.x ? 0 : (k.edge.x - T.edge.x) / Math.abs(k.edge.x - T.edge.x))), (u !== 1 || C % h == 0) && y.length > 1) for (let k = 0; k < y.length; k += 2) {
        const T = k + 1;
        if (T >= y.length) break;
        const _ = y[k].edge, v = y[T].edge;
        f.push([[Math.round(_.x), x], [Math.round(v.x), x]]);
      }
      x += u, y.forEach(((k) => {
        k.edge.x = k.edge.x + u * k.edge.islope;
      })), C++;
    }
    return f;
  })(a, o, i);
  if (s) {
    for (const c of a) Ha(c, n, -s);
    (function(c, h, u) {
      const d = [];
      c.forEach(((f) => d.push(...f))), Ha(d, h, u);
    })(l, n, -s);
  }
  return l;
}
function Ws(e, t) {
  var r;
  const i = t.hachureAngle + 90;
  let s = t.hachureGap;
  s < 0 && (s = 4 * t.strokeWidth), s = Math.round(Math.max(s, 0.1));
  let o = 1;
  return t.roughness >= 1 && (((r = t.randomizer) === null || r === void 0 ? void 0 : r.next()) || Math.random()) > 0.7 && (o = s), QT(e, s, i, o || 1);
}
class ih {
  constructor(t) {
    this.helper = t;
  }
  fillPolygons(t, r) {
    return this._fillPolygons(t, r);
  }
  _fillPolygons(t, r) {
    const i = Ws(t, r);
    return { type: "fillSketch", ops: this.renderLines(i, r) };
  }
  renderLines(t, r) {
    const i = [];
    for (const s of t) i.push(...this.helper.doubleLineOps(s[0][0], s[0][1], s[1][0], s[1][1], r));
    return i;
  }
}
function la(e) {
  const t = e[0], r = e[1];
  return Math.sqrt(Math.pow(t[0] - r[0], 2) + Math.pow(t[1] - r[1], 2));
}
class JT extends ih {
  fillPolygons(t, r) {
    let i = r.hachureGap;
    i < 0 && (i = 4 * r.strokeWidth), i = Math.max(i, 0.1);
    const s = Ws(t, Object.assign({}, r, { hachureGap: i })), o = Math.PI / 180 * r.hachureAngle, a = [], n = 0.5 * i * Math.cos(o), l = 0.5 * i * Math.sin(o);
    for (const [c, h] of s) la([c, h]) && a.push([[c[0] - n, c[1] + l], [...h]], [[c[0] + n, c[1] - l], [...h]]);
    return { type: "fillSketch", ops: this.renderLines(a, r) };
  }
}
class tS extends ih {
  fillPolygons(t, r) {
    const i = this._fillPolygons(t, r), s = Object.assign({}, r, { hachureAngle: r.hachureAngle + 90 }), o = this._fillPolygons(t, s);
    return i.ops = i.ops.concat(o.ops), i;
  }
}
class eS {
  constructor(t) {
    this.helper = t;
  }
  fillPolygons(t, r) {
    const i = Ws(t, r = Object.assign({}, r, { hachureAngle: 0 }));
    return this.dotsOnLines(i, r);
  }
  dotsOnLines(t, r) {
    const i = [];
    let s = r.hachureGap;
    s < 0 && (s = 4 * r.strokeWidth), s = Math.max(s, 0.1);
    let o = r.fillWeight;
    o < 0 && (o = r.strokeWidth / 2);
    const a = s / 4;
    for (const n of t) {
      const l = la(n), c = l / s, h = Math.ceil(c) - 1, u = l - h * s, d = (n[0][0] + n[1][0]) / 2 - s / 4, f = Math.min(n[0][1], n[1][1]);
      for (let m = 0; m < h; m++) {
        const y = f + u + m * s, x = d - a + 2 * Math.random() * a, C = y - a + 2 * Math.random() * a, k = this.helper.ellipse(x, C, o, o, r);
        i.push(...k.ops);
      }
    }
    return { type: "fillSketch", ops: i };
  }
}
class rS {
  constructor(t) {
    this.helper = t;
  }
  fillPolygons(t, r) {
    const i = Ws(t, r);
    return { type: "fillSketch", ops: this.dashedLine(i, r) };
  }
  dashedLine(t, r) {
    const i = r.dashOffset < 0 ? r.hachureGap < 0 ? 4 * r.strokeWidth : r.hachureGap : r.dashOffset, s = r.dashGap < 0 ? r.hachureGap < 0 ? 4 * r.strokeWidth : r.hachureGap : r.dashGap, o = [];
    return t.forEach(((a) => {
      const n = la(a), l = Math.floor(n / (i + s)), c = (n + s - l * (i + s)) / 2;
      let h = a[0], u = a[1];
      h[0] > u[0] && (h = a[1], u = a[0]);
      const d = Math.atan((u[1] - h[1]) / (u[0] - h[0]));
      for (let f = 0; f < l; f++) {
        const m = f * (i + s), y = m + i, x = [h[0] + m * Math.cos(d) + c * Math.cos(d), h[1] + m * Math.sin(d) + c * Math.sin(d)], C = [h[0] + y * Math.cos(d) + c * Math.cos(d), h[1] + y * Math.sin(d) + c * Math.sin(d)];
        o.push(...this.helper.doubleLineOps(x[0], x[1], C[0], C[1], r));
      }
    })), o;
  }
}
class iS {
  constructor(t) {
    this.helper = t;
  }
  fillPolygons(t, r) {
    const i = r.hachureGap < 0 ? 4 * r.strokeWidth : r.hachureGap, s = r.zigzagOffset < 0 ? i : r.zigzagOffset, o = Ws(t, r = Object.assign({}, r, { hachureGap: i + s }));
    return { type: "fillSketch", ops: this.zigzagLines(o, s, r) };
  }
  zigzagLines(t, r, i) {
    const s = [];
    return t.forEach(((o) => {
      const a = la(o), n = Math.round(a / (2 * r));
      let l = o[0], c = o[1];
      l[0] > c[0] && (l = o[1], c = o[0]);
      const h = Math.atan((c[1] - l[1]) / (c[0] - l[0]));
      for (let u = 0; u < n; u++) {
        const d = 2 * u * r, f = 2 * (u + 1) * r, m = Math.sqrt(2 * Math.pow(r, 2)), y = [l[0] + d * Math.cos(h), l[1] + d * Math.sin(h)], x = [l[0] + f * Math.cos(h), l[1] + f * Math.sin(h)], C = [y[0] + m * Math.cos(h + Math.PI / 4), y[1] + m * Math.sin(h + Math.PI / 4)];
        s.push(...this.helper.doubleLineOps(y[0], y[1], C[0], C[1], i), ...this.helper.doubleLineOps(C[0], C[1], x[0], x[1], i));
      }
    })), s;
  }
}
const Se = {};
class sS {
  constructor(t) {
    this.seed = t;
  }
  next() {
    return this.seed ? (2 ** 31 - 1 & (this.seed = Math.imul(48271, this.seed))) / 2 ** 31 : Math.random();
  }
}
const oS = 0, Ya = 1, mu = 2, ro = { A: 7, a: 7, C: 6, c: 6, H: 1, h: 1, L: 2, l: 2, M: 2, m: 2, Q: 4, q: 4, S: 4, s: 4, T: 2, t: 2, V: 1, v: 1, Z: 0, z: 0 };
function Ua(e, t) {
  return e.type === t;
}
function sh(e) {
  const t = [], r = (function(a) {
    const n = new Array();
    for (; a !== ""; ) if (a.match(/^([ \t\r\n,]+)/)) a = a.substr(RegExp.$1.length);
    else if (a.match(/^([aAcChHlLmMqQsStTvVzZ])/)) n[n.length] = { type: oS, text: RegExp.$1 }, a = a.substr(RegExp.$1.length);
    else {
      if (!a.match(/^(([-+]?[0-9]+(\.[0-9]*)?|[-+]?\.[0-9]+)([eE][-+]?[0-9]+)?)/)) return [];
      n[n.length] = { type: Ya, text: `${parseFloat(RegExp.$1)}` }, a = a.substr(RegExp.$1.length);
    }
    return n[n.length] = { type: mu, text: "" }, n;
  })(e);
  let i = "BOD", s = 0, o = r[s];
  for (; !Ua(o, mu); ) {
    let a = 0;
    const n = [];
    if (i === "BOD") {
      if (o.text !== "M" && o.text !== "m") return sh("M0,0" + e);
      s++, a = ro[o.text], i = o.text;
    } else Ua(o, Ya) ? a = ro[i] : (s++, a = ro[o.text], i = o.text);
    if (!(s + a < r.length)) throw new Error("Path data ended short");
    for (let l = s; l < s + a; l++) {
      const c = r[l];
      if (!Ua(c, Ya)) throw new Error("Param not a number: " + i + "," + c.text);
      n[n.length] = +c.text;
    }
    if (typeof ro[i] != "number") throw new Error("Bad segment: " + i);
    {
      const l = { key: i, data: n };
      t.push(l), s += a, o = r[s], i === "M" && (i = "L"), i === "m" && (i = "l");
    }
  }
  return t;
}
function og(e) {
  let t = 0, r = 0, i = 0, s = 0;
  const o = [];
  for (const { key: a, data: n } of e) switch (a) {
    case "M":
      o.push({ key: "M", data: [...n] }), [t, r] = n, [i, s] = n;
      break;
    case "m":
      t += n[0], r += n[1], o.push({ key: "M", data: [t, r] }), i = t, s = r;
      break;
    case "L":
      o.push({ key: "L", data: [...n] }), [t, r] = n;
      break;
    case "l":
      t += n[0], r += n[1], o.push({ key: "L", data: [t, r] });
      break;
    case "C":
      o.push({ key: "C", data: [...n] }), t = n[4], r = n[5];
      break;
    case "c": {
      const l = n.map(((c, h) => h % 2 ? c + r : c + t));
      o.push({ key: "C", data: l }), t = l[4], r = l[5];
      break;
    }
    case "Q":
      o.push({ key: "Q", data: [...n] }), t = n[2], r = n[3];
      break;
    case "q": {
      const l = n.map(((c, h) => h % 2 ? c + r : c + t));
      o.push({ key: "Q", data: l }), t = l[2], r = l[3];
      break;
    }
    case "A":
      o.push({ key: "A", data: [...n] }), t = n[5], r = n[6];
      break;
    case "a":
      t += n[5], r += n[6], o.push({ key: "A", data: [n[0], n[1], n[2], n[3], n[4], t, r] });
      break;
    case "H":
      o.push({ key: "H", data: [...n] }), t = n[0];
      break;
    case "h":
      t += n[0], o.push({ key: "H", data: [t] });
      break;
    case "V":
      o.push({ key: "V", data: [...n] }), r = n[0];
      break;
    case "v":
      r += n[0], o.push({ key: "V", data: [r] });
      break;
    case "S":
      o.push({ key: "S", data: [...n] }), t = n[2], r = n[3];
      break;
    case "s": {
      const l = n.map(((c, h) => h % 2 ? c + r : c + t));
      o.push({ key: "S", data: l }), t = l[2], r = l[3];
      break;
    }
    case "T":
      o.push({ key: "T", data: [...n] }), t = n[0], r = n[1];
      break;
    case "t":
      t += n[0], r += n[1], o.push({ key: "T", data: [t, r] });
      break;
    case "Z":
    case "z":
      o.push({ key: "Z", data: [] }), t = i, r = s;
  }
  return o;
}
function ag(e) {
  const t = [];
  let r = "", i = 0, s = 0, o = 0, a = 0, n = 0, l = 0;
  for (const { key: c, data: h } of e) {
    switch (c) {
      case "M":
        t.push({ key: "M", data: [...h] }), [i, s] = h, [o, a] = h;
        break;
      case "C":
        t.push({ key: "C", data: [...h] }), i = h[4], s = h[5], n = h[2], l = h[3];
        break;
      case "L":
        t.push({ key: "L", data: [...h] }), [i, s] = h;
        break;
      case "H":
        i = h[0], t.push({ key: "L", data: [i, s] });
        break;
      case "V":
        s = h[0], t.push({ key: "L", data: [i, s] });
        break;
      case "S": {
        let u = 0, d = 0;
        r === "C" || r === "S" ? (u = i + (i - n), d = s + (s - l)) : (u = i, d = s), t.push({ key: "C", data: [u, d, ...h] }), n = h[0], l = h[1], i = h[2], s = h[3];
        break;
      }
      case "T": {
        const [u, d] = h;
        let f = 0, m = 0;
        r === "Q" || r === "T" ? (f = i + (i - n), m = s + (s - l)) : (f = i, m = s);
        const y = i + 2 * (f - i) / 3, x = s + 2 * (m - s) / 3, C = u + 2 * (f - u) / 3, k = d + 2 * (m - d) / 3;
        t.push({ key: "C", data: [y, x, C, k, u, d] }), n = f, l = m, i = u, s = d;
        break;
      }
      case "Q": {
        const [u, d, f, m] = h, y = i + 2 * (u - i) / 3, x = s + 2 * (d - s) / 3, C = f + 2 * (u - f) / 3, k = m + 2 * (d - m) / 3;
        t.push({ key: "C", data: [y, x, C, k, f, m] }), n = u, l = d, i = f, s = m;
        break;
      }
      case "A": {
        const u = Math.abs(h[0]), d = Math.abs(h[1]), f = h[2], m = h[3], y = h[4], x = h[5], C = h[6];
        u === 0 || d === 0 ? (t.push({ key: "C", data: [i, s, x, C, x, C] }), i = x, s = C) : (i !== x || s !== C) && (ng(i, s, x, C, u, d, f, m, y).forEach((function(k) {
          t.push({ key: "C", data: k });
        })), i = x, s = C);
        break;
      }
      case "Z":
        t.push({ key: "Z", data: [] }), i = o, s = a;
    }
    r = c;
  }
  return t;
}
function ts(e, t, r) {
  return [e * Math.cos(r) - t * Math.sin(r), e * Math.sin(r) + t * Math.cos(r)];
}
function ng(e, t, r, i, s, o, a, n, l, c) {
  const h = (u = a, Math.PI * u / 180);
  var u;
  let d = [], f = 0, m = 0, y = 0, x = 0;
  if (c) [f, m, y, x] = c;
  else {
    [e, t] = ts(e, t, -h), [r, i] = ts(r, i, -h);
    const U = (e - r) / 2, O = (t - i) / 2;
    let D = U * U / (s * s) + O * O / (o * o);
    D > 1 && (D = Math.sqrt(D), s *= D, o *= D);
    const B = s * s, q = o * o, I = B * q - B * O * O - q * U * U, it = B * O * O + q * U * U, Q = (n === l ? -1 : 1) * Math.sqrt(Math.abs(I / it));
    y = Q * s * O / o + (e + r) / 2, x = Q * -o * U / s + (t + i) / 2, f = Math.asin(parseFloat(((t - x) / o).toFixed(9))), m = Math.asin(parseFloat(((i - x) / o).toFixed(9))), e < y && (f = Math.PI - f), r < y && (m = Math.PI - m), f < 0 && (f = 2 * Math.PI + f), m < 0 && (m = 2 * Math.PI + m), l && f > m && (f -= 2 * Math.PI), !l && m > f && (m -= 2 * Math.PI);
  }
  let C = m - f;
  if (Math.abs(C) > 120 * Math.PI / 180) {
    const U = m, O = r, D = i;
    m = l && m > f ? f + 120 * Math.PI / 180 * 1 : f + 120 * Math.PI / 180 * -1, d = ng(r = y + s * Math.cos(m), i = x + o * Math.sin(m), O, D, s, o, a, 0, l, [m, U, y, x]);
  }
  C = m - f;
  const k = Math.cos(f), T = Math.sin(f), _ = Math.cos(m), v = Math.sin(m), L = Math.tan(C / 4), A = 4 / 3 * s * L, F = 4 / 3 * o * L, G = [e, t], Y = [e + A * T, t - F * k], N = [r + A * v, i - F * _], st = [r, i];
  if (Y[0] = 2 * G[0] - Y[0], Y[1] = 2 * G[1] - Y[1], c) return [Y, N, st].concat(d);
  {
    d = [Y, N, st].concat(d);
    const U = [];
    for (let O = 0; O < d.length; O += 3) {
      const D = ts(d[O][0], d[O][1], h), B = ts(d[O + 1][0], d[O + 1][1], h), q = ts(d[O + 2][0], d[O + 2][1], h);
      U.push([D[0], D[1], B[0], B[1], q[0], q[1]]);
    }
    return U;
  }
}
const aS = { randOffset: function(e, t) {
  return _t(e, t);
}, randOffsetWithRange: function(e, t, r) {
  return Ho(e, t, r);
}, ellipse: function(e, t, r, i, s) {
  const o = hg(r, i, s);
  return tl(e, t, s, o).opset;
}, doubleLineOps: function(e, t, r, i, s) {
  return Wr(e, t, r, i, s, !0);
} };
function lg(e, t, r, i, s) {
  return { type: "path", ops: Wr(e, t, r, i, s) };
}
function bo(e, t, r) {
  const i = (e || []).length;
  if (i > 2) {
    const s = [];
    for (let o = 0; o < i - 1; o++) s.push(...Wr(e[o][0], e[o][1], e[o + 1][0], e[o + 1][1], r));
    return t && s.push(...Wr(e[i - 1][0], e[i - 1][1], e[0][0], e[0][1], r)), { type: "path", ops: s };
  }
  return i === 2 ? lg(e[0][0], e[0][1], e[1][0], e[1][1], r) : { type: "path", ops: [] };
}
function nS(e, t, r, i, s) {
  return (function(o, a) {
    return bo(o, !0, a);
  })([[e, t], [e + r, t], [e + r, t + i], [e, t + i]], s);
}
function yu(e, t) {
  if (e.length) {
    const r = typeof e[0][0] == "number" ? [e] : e, i = io(r[0], 1 * (1 + 0.2 * t.roughness), t), s = t.disableMultiStroke ? [] : io(r[0], 1.5 * (1 + 0.22 * t.roughness), bu(t));
    for (let o = 1; o < r.length; o++) {
      const a = r[o];
      if (a.length) {
        const n = io(a, 1 * (1 + 0.2 * t.roughness), t), l = t.disableMultiStroke ? [] : io(a, 1.5 * (1 + 0.22 * t.roughness), bu(t));
        for (const c of n) c.op !== "move" && i.push(c);
        for (const c of l) c.op !== "move" && s.push(c);
      }
    }
    return { type: "path", ops: i.concat(s) };
  }
  return { type: "path", ops: [] };
}
function hg(e, t, r) {
  const i = Math.sqrt(2 * Math.PI * Math.sqrt((Math.pow(e / 2, 2) + Math.pow(t / 2, 2)) / 2)), s = Math.ceil(Math.max(r.curveStepCount, r.curveStepCount / Math.sqrt(200) * i)), o = 2 * Math.PI / s;
  let a = Math.abs(e / 2), n = Math.abs(t / 2);
  const l = 1 - r.curveFitting;
  return a += _t(a * l, r), n += _t(n * l, r), { increment: o, rx: a, ry: n };
}
function tl(e, t, r, i) {
  const [s, o] = ku(i.increment, e, t, i.rx, i.ry, 1, i.increment * Ho(0.1, Ho(0.4, 1, r), r), r);
  let a = Yo(s, null, r);
  if (!r.disableMultiStroke && r.roughness !== 0) {
    const [n] = ku(i.increment, e, t, i.rx, i.ry, 1.5, 0, r), l = Yo(n, null, r);
    a = a.concat(l);
  }
  return { estimatedPoints: o, opset: { type: "path", ops: a } };
}
function xu(e, t, r, i, s, o, a, n, l) {
  const c = e, h = t;
  let u = Math.abs(r / 2), d = Math.abs(i / 2);
  u += _t(0.01 * u, l), d += _t(0.01 * d, l);
  let f = s, m = o;
  for (; f < 0; ) f += 2 * Math.PI, m += 2 * Math.PI;
  m - f > 2 * Math.PI && (f = 0, m = 2 * Math.PI);
  const y = 2 * Math.PI / l.curveStepCount, x = Math.min(y / 2, (m - f) / 2), C = wu(x, c, h, u, d, f, m, 1, l);
  if (!l.disableMultiStroke) {
    const k = wu(x, c, h, u, d, f, m, 1.5, l);
    C.push(...k);
  }
  return a && (n ? C.push(...Wr(c, h, c + u * Math.cos(f), h + d * Math.sin(f), l), ...Wr(c, h, c + u * Math.cos(m), h + d * Math.sin(m), l)) : C.push({ op: "lineTo", data: [c, h] }, { op: "lineTo", data: [c + u * Math.cos(f), h + d * Math.sin(f)] })), { type: "path", ops: C };
}
function Cu(e, t) {
  const r = ag(og(sh(e))), i = [];
  let s = [0, 0], o = [0, 0];
  for (const { key: a, data: n } of r) switch (a) {
    case "M":
      o = [n[0], n[1]], s = [n[0], n[1]];
      break;
    case "L":
      i.push(...Wr(o[0], o[1], n[0], n[1], t)), o = [n[0], n[1]];
      break;
    case "C": {
      const [l, c, h, u, d, f] = n;
      i.push(...lS(l, c, h, u, d, f, o, t)), o = [d, f];
      break;
    }
    case "Z":
      i.push(...Wr(o[0], o[1], s[0], s[1], t)), o = [s[0], s[1]];
  }
  return { type: "path", ops: i };
}
function ja(e, t) {
  const r = [];
  for (const i of e) if (i.length) {
    const s = t.maxRandomnessOffset || 0, o = i.length;
    if (o > 2) {
      r.push({ op: "move", data: [i[0][0] + _t(s, t), i[0][1] + _t(s, t)] });
      for (let a = 1; a < o; a++) r.push({ op: "lineTo", data: [i[a][0] + _t(s, t), i[a][1] + _t(s, t)] });
    }
  }
  return { type: "fillPath", ops: r };
}
function bi(e, t) {
  return (function(r, i) {
    let s = r.fillStyle || "hachure";
    if (!Se[s]) switch (s) {
      case "zigzag":
        Se[s] || (Se[s] = new JT(i));
        break;
      case "cross-hatch":
        Se[s] || (Se[s] = new tS(i));
        break;
      case "dots":
        Se[s] || (Se[s] = new eS(i));
        break;
      case "dashed":
        Se[s] || (Se[s] = new rS(i));
        break;
      case "zigzag-line":
        Se[s] || (Se[s] = new iS(i));
        break;
      default:
        s = "hachure", Se[s] || (Se[s] = new ih(i));
    }
    return Se[s];
  })(t, aS).fillPolygons(e, t);
}
function bu(e) {
  const t = Object.assign({}, e);
  return t.randomizer = void 0, e.seed && (t.seed = e.seed + 1), t;
}
function cg(e) {
  return e.randomizer || (e.randomizer = new sS(e.seed || 0)), e.randomizer.next();
}
function Ho(e, t, r, i = 1) {
  return r.roughness * i * (cg(r) * (t - e) + e);
}
function _t(e, t, r = 1) {
  return Ho(-e, e, t, r);
}
function Wr(e, t, r, i, s, o = !1) {
  const a = o ? s.disableMultiStrokeFill : s.disableMultiStroke, n = el(e, t, r, i, s, !0, !1);
  if (a) return n;
  const l = el(e, t, r, i, s, !0, !0);
  return n.concat(l);
}
function el(e, t, r, i, s, o, a) {
  const n = Math.pow(e - r, 2) + Math.pow(t - i, 2), l = Math.sqrt(n);
  let c = 1;
  c = l < 200 ? 1 : l > 500 ? 0.4 : -16668e-7 * l + 1.233334;
  let h = s.maxRandomnessOffset || 0;
  h * h * 100 > n && (h = l / 10);
  const u = h / 2, d = 0.2 + 0.2 * cg(s);
  let f = s.bowing * s.maxRandomnessOffset * (i - t) / 200, m = s.bowing * s.maxRandomnessOffset * (e - r) / 200;
  f = _t(f, s, c), m = _t(m, s, c);
  const y = [], x = () => _t(u, s, c), C = () => _t(h, s, c), k = s.preserveVertices;
  return a ? y.push({ op: "move", data: [e + (k ? 0 : x()), t + (k ? 0 : x())] }) : y.push({ op: "move", data: [e + (k ? 0 : _t(h, s, c)), t + (k ? 0 : _t(h, s, c))] }), a ? y.push({ op: "bcurveTo", data: [f + e + (r - e) * d + x(), m + t + (i - t) * d + x(), f + e + 2 * (r - e) * d + x(), m + t + 2 * (i - t) * d + x(), r + (k ? 0 : x()), i + (k ? 0 : x())] }) : y.push({ op: "bcurveTo", data: [f + e + (r - e) * d + C(), m + t + (i - t) * d + C(), f + e + 2 * (r - e) * d + C(), m + t + 2 * (i - t) * d + C(), r + (k ? 0 : C()), i + (k ? 0 : C())] }), y;
}
function io(e, t, r) {
  if (!e.length) return [];
  const i = [];
  i.push([e[0][0] + _t(t, r), e[0][1] + _t(t, r)]), i.push([e[0][0] + _t(t, r), e[0][1] + _t(t, r)]);
  for (let s = 1; s < e.length; s++) i.push([e[s][0] + _t(t, r), e[s][1] + _t(t, r)]), s === e.length - 1 && i.push([e[s][0] + _t(t, r), e[s][1] + _t(t, r)]);
  return Yo(i, null, r);
}
function Yo(e, t, r) {
  const i = e.length, s = [];
  if (i > 3) {
    const o = [], a = 1 - r.curveTightness;
    s.push({ op: "move", data: [e[1][0], e[1][1]] });
    for (let n = 1; n + 2 < i; n++) {
      const l = e[n];
      o[0] = [l[0], l[1]], o[1] = [l[0] + (a * e[n + 1][0] - a * e[n - 1][0]) / 6, l[1] + (a * e[n + 1][1] - a * e[n - 1][1]) / 6], o[2] = [e[n + 1][0] + (a * e[n][0] - a * e[n + 2][0]) / 6, e[n + 1][1] + (a * e[n][1] - a * e[n + 2][1]) / 6], o[3] = [e[n + 1][0], e[n + 1][1]], s.push({ op: "bcurveTo", data: [o[1][0], o[1][1], o[2][0], o[2][1], o[3][0], o[3][1]] });
    }
  } else i === 3 ? (s.push({ op: "move", data: [e[1][0], e[1][1]] }), s.push({ op: "bcurveTo", data: [e[1][0], e[1][1], e[2][0], e[2][1], e[2][0], e[2][1]] })) : i === 2 && s.push(...el(e[0][0], e[0][1], e[1][0], e[1][1], r, !0, !0));
  return s;
}
function ku(e, t, r, i, s, o, a, n) {
  const l = [], c = [];
  if (n.roughness === 0) {
    e /= 4, c.push([t + i * Math.cos(-e), r + s * Math.sin(-e)]);
    for (let h = 0; h <= 2 * Math.PI; h += e) {
      const u = [t + i * Math.cos(h), r + s * Math.sin(h)];
      l.push(u), c.push(u);
    }
    c.push([t + i * Math.cos(0), r + s * Math.sin(0)]), c.push([t + i * Math.cos(e), r + s * Math.sin(e)]);
  } else {
    const h = _t(0.5, n) - Math.PI / 2;
    c.push([_t(o, n) + t + 0.9 * i * Math.cos(h - e), _t(o, n) + r + 0.9 * s * Math.sin(h - e)]);
    const u = 2 * Math.PI + h - 0.01;
    for (let d = h; d < u; d += e) {
      const f = [_t(o, n) + t + i * Math.cos(d), _t(o, n) + r + s * Math.sin(d)];
      l.push(f), c.push(f);
    }
    c.push([_t(o, n) + t + i * Math.cos(h + 2 * Math.PI + 0.5 * a), _t(o, n) + r + s * Math.sin(h + 2 * Math.PI + 0.5 * a)]), c.push([_t(o, n) + t + 0.98 * i * Math.cos(h + a), _t(o, n) + r + 0.98 * s * Math.sin(h + a)]), c.push([_t(o, n) + t + 0.9 * i * Math.cos(h + 0.5 * a), _t(o, n) + r + 0.9 * s * Math.sin(h + 0.5 * a)]);
  }
  return [c, l];
}
function wu(e, t, r, i, s, o, a, n, l) {
  const c = o + _t(0.1, l), h = [];
  h.push([_t(n, l) + t + 0.9 * i * Math.cos(c - e), _t(n, l) + r + 0.9 * s * Math.sin(c - e)]);
  for (let u = c; u <= a; u += e) h.push([_t(n, l) + t + i * Math.cos(u), _t(n, l) + r + s * Math.sin(u)]);
  return h.push([t + i * Math.cos(a), r + s * Math.sin(a)]), h.push([t + i * Math.cos(a), r + s * Math.sin(a)]), Yo(h, null, l);
}
function lS(e, t, r, i, s, o, a, n) {
  const l = [], c = [n.maxRandomnessOffset || 1, (n.maxRandomnessOffset || 1) + 0.3];
  let h = [0, 0];
  const u = n.disableMultiStroke ? 1 : 2, d = n.preserveVertices;
  for (let f = 0; f < u; f++) f === 0 ? l.push({ op: "move", data: [a[0], a[1]] }) : l.push({ op: "move", data: [a[0] + (d ? 0 : _t(c[0], n)), a[1] + (d ? 0 : _t(c[0], n))] }), h = d ? [s, o] : [s + _t(c[f], n), o + _t(c[f], n)], l.push({ op: "bcurveTo", data: [e + _t(c[f], n), t + _t(c[f], n), r + _t(c[f], n), i + _t(c[f], n), h[0], h[1]] });
  return l;
}
function es(e) {
  return [...e];
}
function Tu(e, t = 0) {
  const r = e.length;
  if (r < 3) throw new Error("A curve must have at least three points.");
  const i = [];
  if (r === 3) i.push(es(e[0]), es(e[1]), es(e[2]), es(e[2]));
  else {
    const s = [];
    s.push(e[0], e[0]);
    for (let n = 1; n < e.length; n++) s.push(e[n]), n === e.length - 1 && s.push(e[n]);
    const o = [], a = 1 - t;
    i.push(es(s[0]));
    for (let n = 1; n + 2 < s.length; n++) {
      const l = s[n];
      o[0] = [l[0], l[1]], o[1] = [l[0] + (a * s[n + 1][0] - a * s[n - 1][0]) / 6, l[1] + (a * s[n + 1][1] - a * s[n - 1][1]) / 6], o[2] = [s[n + 1][0] + (a * s[n][0] - a * s[n + 2][0]) / 6, s[n + 1][1] + (a * s[n][1] - a * s[n + 2][1]) / 6], o[3] = [s[n + 1][0], s[n + 1][1]], i.push(o[1], o[2], o[3]);
    }
  }
  return i;
}
function ko(e, t) {
  return Math.pow(e[0] - t[0], 2) + Math.pow(e[1] - t[1], 2);
}
function hS(e, t, r) {
  const i = ko(t, r);
  if (i === 0) return ko(e, t);
  let s = ((e[0] - t[0]) * (r[0] - t[0]) + (e[1] - t[1]) * (r[1] - t[1])) / i;
  return s = Math.max(0, Math.min(1, s)), ko(e, Zr(t, r, s));
}
function Zr(e, t, r) {
  return [e[0] + (t[0] - e[0]) * r, e[1] + (t[1] - e[1]) * r];
}
function rl(e, t, r, i) {
  const s = i || [];
  if ((function(n, l) {
    const c = n[l + 0], h = n[l + 1], u = n[l + 2], d = n[l + 3];
    let f = 3 * h[0] - 2 * c[0] - d[0];
    f *= f;
    let m = 3 * h[1] - 2 * c[1] - d[1];
    m *= m;
    let y = 3 * u[0] - 2 * d[0] - c[0];
    y *= y;
    let x = 3 * u[1] - 2 * d[1] - c[1];
    return x *= x, f < y && (f = y), m < x && (m = x), f + m;
  })(e, t) < r) {
    const n = e[t + 0];
    s.length ? (o = s[s.length - 1], a = n, Math.sqrt(ko(o, a)) > 1 && s.push(n)) : s.push(n), s.push(e[t + 3]);
  } else {
    const l = e[t + 0], c = e[t + 1], h = e[t + 2], u = e[t + 3], d = Zr(l, c, 0.5), f = Zr(c, h, 0.5), m = Zr(h, u, 0.5), y = Zr(d, f, 0.5), x = Zr(f, m, 0.5), C = Zr(y, x, 0.5);
    rl([l, d, y, C], 0, r, s), rl([C, x, m, u], 0, r, s);
  }
  var o, a;
  return s;
}
function cS(e, t) {
  return Uo(e, 0, e.length, t);
}
function Uo(e, t, r, i, s) {
  const o = s || [], a = e[t], n = e[r - 1];
  let l = 0, c = 1;
  for (let h = t + 1; h < r - 1; ++h) {
    const u = hS(e[h], a, n);
    u > l && (l = u, c = h);
  }
  return Math.sqrt(l) > i ? (Uo(e, t, c + 1, i, o), Uo(e, c, r, i, o)) : (o.length || o.push(a), o.push(n)), o;
}
function Ga(e, t = 0.15, r) {
  const i = [], s = (e.length - 1) / 3;
  for (let o = 0; o < s; o++)
    rl(e, 3 * o, t, i);
  return r && r > 0 ? Uo(i, 0, i.length, r) : i;
}
const Me = "none";
class jo {
  constructor(t) {
    this.defaultOptions = { maxRandomnessOffset: 2, roughness: 1, bowing: 1, stroke: "#000", strokeWidth: 1, curveTightness: 0, curveFitting: 0.95, curveStepCount: 9, fillStyle: "hachure", fillWeight: -1, hachureAngle: -41, hachureGap: -1, dashOffset: -1, dashGap: -1, zigzagOffset: -1, seed: 0, disableMultiStroke: !1, disableMultiStrokeFill: !1, preserveVertices: !1, fillShapeRoughnessGain: 0.8 }, this.config = t || {}, this.config.options && (this.defaultOptions = this._o(this.config.options));
  }
  static newSeed() {
    return Math.floor(Math.random() * 2 ** 31);
  }
  _o(t) {
    return t ? Object.assign({}, this.defaultOptions, t) : this.defaultOptions;
  }
  _d(t, r, i) {
    return { shape: t, sets: r || [], options: i || this.defaultOptions };
  }
  line(t, r, i, s, o) {
    const a = this._o(o);
    return this._d("line", [lg(t, r, i, s, a)], a);
  }
  rectangle(t, r, i, s, o) {
    const a = this._o(o), n = [], l = nS(t, r, i, s, a);
    if (a.fill) {
      const c = [[t, r], [t + i, r], [t + i, r + s], [t, r + s]];
      a.fillStyle === "solid" ? n.push(ja([c], a)) : n.push(bi([c], a));
    }
    return a.stroke !== Me && n.push(l), this._d("rectangle", n, a);
  }
  ellipse(t, r, i, s, o) {
    const a = this._o(o), n = [], l = hg(i, s, a), c = tl(t, r, a, l);
    if (a.fill) if (a.fillStyle === "solid") {
      const h = tl(t, r, a, l).opset;
      h.type = "fillPath", n.push(h);
    } else n.push(bi([c.estimatedPoints], a));
    return a.stroke !== Me && n.push(c.opset), this._d("ellipse", n, a);
  }
  circle(t, r, i, s) {
    const o = this.ellipse(t, r, i, i, s);
    return o.shape = "circle", o;
  }
  linearPath(t, r) {
    const i = this._o(r);
    return this._d("linearPath", [bo(t, !1, i)], i);
  }
  arc(t, r, i, s, o, a, n = !1, l) {
    const c = this._o(l), h = [], u = xu(t, r, i, s, o, a, n, !0, c);
    if (n && c.fill) if (c.fillStyle === "solid") {
      const d = Object.assign({}, c);
      d.disableMultiStroke = !0;
      const f = xu(t, r, i, s, o, a, !0, !1, d);
      f.type = "fillPath", h.push(f);
    } else h.push((function(d, f, m, y, x, C, k) {
      const T = d, _ = f;
      let v = Math.abs(m / 2), L = Math.abs(y / 2);
      v += _t(0.01 * v, k), L += _t(0.01 * L, k);
      let A = x, F = C;
      for (; A < 0; ) A += 2 * Math.PI, F += 2 * Math.PI;
      F - A > 2 * Math.PI && (A = 0, F = 2 * Math.PI);
      const G = (F - A) / k.curveStepCount, Y = [];
      for (let N = A; N <= F; N += G) Y.push([T + v * Math.cos(N), _ + L * Math.sin(N)]);
      return Y.push([T + v * Math.cos(F), _ + L * Math.sin(F)]), Y.push([T, _]), bi([Y], k);
    })(t, r, i, s, o, a, c));
    return c.stroke !== Me && h.push(u), this._d("arc", h, c);
  }
  curve(t, r) {
    const i = this._o(r), s = [], o = yu(t, i);
    if (i.fill && i.fill !== Me) if (i.fillStyle === "solid") {
      const a = yu(t, Object.assign(Object.assign({}, i), { disableMultiStroke: !0, roughness: i.roughness ? i.roughness + i.fillShapeRoughnessGain : 0 }));
      s.push({ type: "fillPath", ops: this._mergedShape(a.ops) });
    } else {
      const a = [], n = t;
      if (n.length) {
        const l = typeof n[0][0] == "number" ? [n] : n;
        for (const c of l) c.length < 3 ? a.push(...c) : c.length === 3 ? a.push(...Ga(Tu([c[0], c[0], c[1], c[2]]), 10, (1 + i.roughness) / 2)) : a.push(...Ga(Tu(c), 10, (1 + i.roughness) / 2));
      }
      a.length && s.push(bi([a], i));
    }
    return i.stroke !== Me && s.push(o), this._d("curve", s, i);
  }
  polygon(t, r) {
    const i = this._o(r), s = [], o = bo(t, !0, i);
    return i.fill && (i.fillStyle === "solid" ? s.push(ja([t], i)) : s.push(bi([t], i))), i.stroke !== Me && s.push(o), this._d("polygon", s, i);
  }
  path(t, r) {
    const i = this._o(r), s = [];
    if (!t) return this._d("path", s, i);
    t = (t || "").replace(/\n/g, " ").replace(/(-\s)/g, "-").replace("/(ss)/g", " ");
    const o = i.fill && i.fill !== "transparent" && i.fill !== Me, a = i.stroke !== Me, n = !!(i.simplification && i.simplification < 1), l = (function(h, u, d) {
      const f = ag(og(sh(h))), m = [];
      let y = [], x = [0, 0], C = [];
      const k = () => {
        C.length >= 4 && y.push(...Ga(C, u)), C = [];
      }, T = () => {
        k(), y.length && (m.push(y), y = []);
      };
      for (const { key: v, data: L } of f) switch (v) {
        case "M":
          T(), x = [L[0], L[1]], y.push(x);
          break;
        case "L":
          k(), y.push([L[0], L[1]]);
          break;
        case "C":
          if (!C.length) {
            const A = y.length ? y[y.length - 1] : x;
            C.push([A[0], A[1]]);
          }
          C.push([L[0], L[1]]), C.push([L[2], L[3]]), C.push([L[4], L[5]]);
          break;
        case "Z":
          k(), y.push([x[0], x[1]]);
      }
      if (T(), !d) return m;
      const _ = [];
      for (const v of m) {
        const L = cS(v, d);
        L.length && _.push(L);
      }
      return _;
    })(t, 1, n ? 4 - 4 * (i.simplification || 1) : (1 + i.roughness) / 2), c = Cu(t, i);
    if (o) if (i.fillStyle === "solid") if (l.length === 1) {
      const h = Cu(t, Object.assign(Object.assign({}, i), { disableMultiStroke: !0, roughness: i.roughness ? i.roughness + i.fillShapeRoughnessGain : 0 }));
      s.push({ type: "fillPath", ops: this._mergedShape(h.ops) });
    } else s.push(ja(l, i));
    else s.push(bi(l, i));
    return a && (n ? l.forEach(((h) => {
      s.push(bo(h, !1, i));
    })) : s.push(c)), this._d("path", s, i);
  }
  opsToPath(t, r) {
    let i = "";
    for (const s of t.ops) {
      const o = typeof r == "number" && r >= 0 ? s.data.map(((a) => +a.toFixed(r))) : s.data;
      switch (s.op) {
        case "move":
          i += `M${o[0]} ${o[1]} `;
          break;
        case "bcurveTo":
          i += `C${o[0]} ${o[1]}, ${o[2]} ${o[3]}, ${o[4]} ${o[5]} `;
          break;
        case "lineTo":
          i += `L${o[0]} ${o[1]} `;
      }
    }
    return i.trim();
  }
  toPaths(t) {
    const r = t.sets || [], i = t.options || this.defaultOptions, s = [];
    for (const o of r) {
      let a = null;
      switch (o.type) {
        case "path":
          a = { d: this.opsToPath(o), stroke: i.stroke, strokeWidth: i.strokeWidth, fill: Me };
          break;
        case "fillPath":
          a = { d: this.opsToPath(o), stroke: Me, strokeWidth: 0, fill: i.fill || Me };
          break;
        case "fillSketch":
          a = this.fillSketch(o, i);
      }
      a && s.push(a);
    }
    return s;
  }
  fillSketch(t, r) {
    let i = r.fillWeight;
    return i < 0 && (i = r.strokeWidth / 2), { d: this.opsToPath(t), stroke: r.fill || Me, strokeWidth: i, fill: Me };
  }
  _mergedShape(t) {
    return t.filter(((r, i) => i === 0 || r.op !== "move"));
  }
}
class uS {
  constructor(t, r) {
    this.canvas = t, this.ctx = this.canvas.getContext("2d"), this.gen = new jo(r);
  }
  draw(t) {
    const r = t.sets || [], i = t.options || this.getDefaultOptions(), s = this.ctx, o = t.options.fixedDecimalPlaceDigits;
    for (const a of r) switch (a.type) {
      case "path":
        s.save(), s.strokeStyle = i.stroke === "none" ? "transparent" : i.stroke, s.lineWidth = i.strokeWidth, i.strokeLineDash && s.setLineDash(i.strokeLineDash), i.strokeLineDashOffset && (s.lineDashOffset = i.strokeLineDashOffset), this._drawToContext(s, a, o), s.restore();
        break;
      case "fillPath": {
        s.save(), s.fillStyle = i.fill || "";
        const n = t.shape === "curve" || t.shape === "polygon" || t.shape === "path" ? "evenodd" : "nonzero";
        this._drawToContext(s, a, o, n), s.restore();
        break;
      }
      case "fillSketch":
        this.fillSketch(s, a, i);
    }
  }
  fillSketch(t, r, i) {
    let s = i.fillWeight;
    s < 0 && (s = i.strokeWidth / 2), t.save(), i.fillLineDash && t.setLineDash(i.fillLineDash), i.fillLineDashOffset && (t.lineDashOffset = i.fillLineDashOffset), t.strokeStyle = i.fill || "", t.lineWidth = s, this._drawToContext(t, r, i.fixedDecimalPlaceDigits), t.restore();
  }
  _drawToContext(t, r, i, s = "nonzero") {
    t.beginPath();
    for (const o of r.ops) {
      const a = typeof i == "number" && i >= 0 ? o.data.map(((n) => +n.toFixed(i))) : o.data;
      switch (o.op) {
        case "move":
          t.moveTo(a[0], a[1]);
          break;
        case "bcurveTo":
          t.bezierCurveTo(a[0], a[1], a[2], a[3], a[4], a[5]);
          break;
        case "lineTo":
          t.lineTo(a[0], a[1]);
      }
    }
    r.type === "fillPath" ? t.fill(s) : t.stroke();
  }
  get generator() {
    return this.gen;
  }
  getDefaultOptions() {
    return this.gen.defaultOptions;
  }
  line(t, r, i, s, o) {
    const a = this.gen.line(t, r, i, s, o);
    return this.draw(a), a;
  }
  rectangle(t, r, i, s, o) {
    const a = this.gen.rectangle(t, r, i, s, o);
    return this.draw(a), a;
  }
  ellipse(t, r, i, s, o) {
    const a = this.gen.ellipse(t, r, i, s, o);
    return this.draw(a), a;
  }
  circle(t, r, i, s) {
    const o = this.gen.circle(t, r, i, s);
    return this.draw(o), o;
  }
  linearPath(t, r) {
    const i = this.gen.linearPath(t, r);
    return this.draw(i), i;
  }
  polygon(t, r) {
    const i = this.gen.polygon(t, r);
    return this.draw(i), i;
  }
  arc(t, r, i, s, o, a, n = !1, l) {
    const c = this.gen.arc(t, r, i, s, o, a, n, l);
    return this.draw(c), c;
  }
  curve(t, r) {
    const i = this.gen.curve(t, r);
    return this.draw(i), i;
  }
  path(t, r) {
    const i = this.gen.path(t, r);
    return this.draw(i), i;
  }
}
const so = "http://www.w3.org/2000/svg";
class dS {
  constructor(t, r) {
    this.svg = t, this.gen = new jo(r);
  }
  draw(t) {
    const r = t.sets || [], i = t.options || this.getDefaultOptions(), s = this.svg.ownerDocument || window.document, o = s.createElementNS(so, "g"), a = t.options.fixedDecimalPlaceDigits;
    for (const n of r) {
      let l = null;
      switch (n.type) {
        case "path":
          l = s.createElementNS(so, "path"), l.setAttribute("d", this.opsToPath(n, a)), l.setAttribute("stroke", i.stroke), l.setAttribute("stroke-width", i.strokeWidth + ""), l.setAttribute("fill", "none"), i.strokeLineDash && l.setAttribute("stroke-dasharray", i.strokeLineDash.join(" ").trim()), i.strokeLineDashOffset && l.setAttribute("stroke-dashoffset", `${i.strokeLineDashOffset}`);
          break;
        case "fillPath":
          l = s.createElementNS(so, "path"), l.setAttribute("d", this.opsToPath(n, a)), l.setAttribute("stroke", "none"), l.setAttribute("stroke-width", "0"), l.setAttribute("fill", i.fill || ""), t.shape !== "curve" && t.shape !== "polygon" || l.setAttribute("fill-rule", "evenodd");
          break;
        case "fillSketch":
          l = this.fillSketch(s, n, i);
      }
      l && o.appendChild(l);
    }
    return o;
  }
  fillSketch(t, r, i) {
    let s = i.fillWeight;
    s < 0 && (s = i.strokeWidth / 2);
    const o = t.createElementNS(so, "path");
    return o.setAttribute("d", this.opsToPath(r, i.fixedDecimalPlaceDigits)), o.setAttribute("stroke", i.fill || ""), o.setAttribute("stroke-width", s + ""), o.setAttribute("fill", "none"), i.fillLineDash && o.setAttribute("stroke-dasharray", i.fillLineDash.join(" ").trim()), i.fillLineDashOffset && o.setAttribute("stroke-dashoffset", `${i.fillLineDashOffset}`), o;
  }
  get generator() {
    return this.gen;
  }
  getDefaultOptions() {
    return this.gen.defaultOptions;
  }
  opsToPath(t, r) {
    return this.gen.opsToPath(t, r);
  }
  line(t, r, i, s, o) {
    const a = this.gen.line(t, r, i, s, o);
    return this.draw(a);
  }
  rectangle(t, r, i, s, o) {
    const a = this.gen.rectangle(t, r, i, s, o);
    return this.draw(a);
  }
  ellipse(t, r, i, s, o) {
    const a = this.gen.ellipse(t, r, i, s, o);
    return this.draw(a);
  }
  circle(t, r, i, s) {
    const o = this.gen.circle(t, r, i, s);
    return this.draw(o);
  }
  linearPath(t, r) {
    const i = this.gen.linearPath(t, r);
    return this.draw(i);
  }
  polygon(t, r) {
    const i = this.gen.polygon(t, r);
    return this.draw(i);
  }
  arc(t, r, i, s, o, a, n = !1, l) {
    const c = this.gen.arc(t, r, i, s, o, a, n, l);
    return this.draw(c);
  }
  curve(t, r) {
    const i = this.gen.curve(t, r);
    return this.draw(i);
  }
  path(t, r) {
    const i = this.gen.path(t, r);
    return this.draw(i);
  }
}
var ut = { canvas: (e, t) => new uS(e, t), svg: (e, t) => new dS(e, t), generator: (e) => new jo(e), newSeed: () => jo.newSeed() }, fS = 1, pS = 3;
async function oh(e) {
  const t = e.getElementsByTagName("img");
  if (!t || t.length === 0)
    return;
  const r = !ah(e);
  await Promise.all(
    [...t].map(
      (i) => new Promise((s) => {
        function o() {
          if (i.style.display = "flex", i.style.flexDirection = "column", r) {
            const a = $t().fontSize ? $t().fontSize : window.getComputedStyle(document.body).fontSize, n = 5, [l = af.fontSize] = ia(a), c = l * n + "px";
            i.style.minWidth = c, i.style.maxWidth = c;
          } else
            i.style.width = "100%";
          s(i);
        }
        p(o, "setupImage"), setTimeout(() => {
          i.complete && o();
        }), i.addEventListener("error", o), i.addEventListener("load", o);
      })
    )
  );
}
p(oh, "configureLabelImages");
function ah(e) {
  return e.nodeType === pS ? e.textContent?.trim() !== "" : e.nodeType !== fS || e.tagName.toLowerCase() === "img" ? !1 : [...e.childNodes].some(ah);
}
p(ah, "hasTextBesidesImages");
var Su = 3, gS = 32, mS = /* @__PURE__ */ p(async (e, t, r) => {
  const i = $t(), s = e.insert("g").attr("class", r ?? "node default").attr("id", t.domId || t.id), o = s.insert("g").attr("class", "label").attr("style", te(t.labelStyle)), n = [
    { text: typeof t.label == "string" ? t.label : t.label?.[0] ?? "", cssClass: "c4-name" },
    { text: t.stereotype, cssClass: "c4-type" },
    ...(t.description ?? []).map((C) => ({ text: C, cssClass: "c4-descr" }))
  ].filter((C) => C.text), l = t.width ? Math.max(t.width - 2 * (t.padding ?? 0), gS) : $t().flowchart?.wrappingWidth ?? 200, h = i.c4?.wrap ?? !0 ? l : Number.POSITIVE_INFINITY, u = await Promise.all(
    n.map(async (C) => {
      const k = o.append("g").attr("class", C.cssClass), T = await Ve(
        k,
        Re(zr(C.text ?? ""), i),
        {
          useHtmlLabels: !1,
          markdown: !1,
          isNode: !0,
          width: h,
          style: t.labelStyle
        },
        i
      );
      return At(T).selectAll("tspan.text-outer-tspan").attr("text-anchor", "middle"), At(T).selectAll("tspan.text-inner-tspan").attr("font-weight", null).attr("font-style", null), { el: k, box: k.node().getBBox() };
    })
  ), d = Math.max(...u.map(({ box: C }) => C.width), 0);
  let f = 0;
  for (const { el: C, box: k } of u)
    C.attr("transform", `translate(${d / 2 - k.x - k.width / 2}, ${f - k.y})`), f += k.height + Su;
  const m = u.length > 0 ? f - Su : 0;
  o.insert("rect", ":first-child"), o.attr("transform", `translate(${-d / 2}, ${-m / 2})`);
  const y = o.node().getBBox(), x = (t.padding ?? 0) / 2;
  return { shapeSvg: s, bbox: y, halfPadding: x, label: o };
}, "c4LabelHelper"), xt = /* @__PURE__ */ p(async (e, t, r) => {
  if (t.stereotype !== void 0)
    return mS(e, t, r);
  let i;
  const s = t.useHtmlLabels || cr($t()?.htmlLabels);
  r ? i = r : i = "node default";
  const o = e.insert("g").attr("class", i).attr("id", t.domId || t.id), a = o.insert("g").attr("class", "label").attr("style", te(t.labelStyle));
  let n;
  t.label === void 0 ? n = "" : n = typeof t.label == "string" ? t.label : t.label[0];
  const l = !!t.icon || !!t.img, c = t.labelType === "markdown", h = await Ve(
    a,
    Re(zr(n), $t()),
    {
      useHtmlLabels: s,
      width: t.width || t.wrappingWidth || $t().flowchart?.wrappingWidth,
      classes: c ? "markdown-node-label" : "",
      style: t.labelStyle,
      addSvgBackground: l,
      markdown: c
    },
    $t()
  ), u = (t?.padding ?? 0) / 2;
  let d;
  if (s) {
    const f = h.children[0], m = At(h);
    await oh(f), d = await oi.measure(
      () => f.getBoundingClientRect()
    ), m.attr("width", d.width), m.attr("height", d.height);
  } else
    d = await oi.measure(
      () => h.getBBox()
    );
  return s ? a.attr("transform", "translate(" + -d.width / 2 + ", " + -d.height / 2 + ")") : a.attr("transform", "translate(0, " + -d.height / 2 + ")"), t.centerLabel && a.attr("transform", "translate(" + -d.width / 2 + ", " + -d.height / 2 + ")"), a.insert("rect", ":first-child"), { shapeSvg: o, bbox: d, halfPadding: u, label: a };
}, "labelHelper"), Xa = /* @__PURE__ */ p(async (e, t, r) => {
  const i = r.useHtmlLabels ?? ge($t()), s = e.insert("g").attr("class", "label").attr("style", r.labelStyle || ""), o = await Ve(s, Re(zr(t), $t()), {
    useHtmlLabels: i,
    width: r.width || $t()?.flowchart?.wrappingWidth,
    style: r.labelStyle,
    addSvgBackground: !!r.icon || !!r.img
  }), a = r.padding / 2;
  let n;
  if (ge($t())) {
    const l = o.children[0], c = At(o);
    n = await oi.measure(
      () => l.getBoundingClientRect()
    ), c.attr("width", n.width), c.attr("height", n.height);
  } else
    n = await oi.measure(
      () => o.getBBox()
    );
  return i ? s.attr("transform", "translate(" + -n.width / 2 + ", " + -n.height / 2 + ")") : s.attr("transform", "translate(0, " + -n.height / 2 + ")"), r.centerLabel && s.attr("transform", "translate(" + -n.width / 2 + ", " + -n.height / 2 + ")"), s.insert("rect", ":first-child"), { shapeSvg: e, bbox: n, halfPadding: a, label: s };
}, "insertLabel"), dt = /* @__PURE__ */ p((e, t, r) => {
  if (r) {
    e.width = r.width, e.height = r.height;
    return;
  }
  const i = t.node().getBBox();
  e.width = i.width, e.height = i.height;
}, "updateNodeBounds"), Ct = /* @__PURE__ */ p((e, t) => (e.look === "handDrawn" ? "rough-node" : "node") + " " + e.cssClasses + " " + (t || ""), "getNodeClasses");
function Pt(e) {
  const t = e.map((r, i) => `${i === 0 ? "M" : "L"}${r.x},${r.y}`);
  return t.push("Z"), t.join(" ");
}
p(Pt, "createPathFromPoints");
function Hr(e, t, r, i, s, o) {
  const a = [], l = r - e, c = i - t, h = l / o, u = 2 * Math.PI / h, d = t + c / 2;
  for (let f = 0; f <= 50; f++) {
    const m = f / 50, y = e + m * l, x = d + s * Math.sin(u * (y - e));
    a.push({ x: y, y: x });
  }
  return a;
}
p(Hr, "generateFullSineWavePoints");
function sr(e, t, r, i, s, o) {
  const a = [], n = s * Math.PI / 180, h = (o * Math.PI / 180 - n) / (i - 1);
  for (let u = 0; u < i; u++) {
    const d = n + u * h, f = e + r * Math.cos(d), m = t + r * Math.sin(d);
    a.push({ x: -f, y: -m });
  }
  return a;
}
p(sr, "generateCirclePoints");
function il(e) {
  const t = Array.from(e.childNodes).filter(
    (l) => l.tagName === "path"
  ), r = document.createElementNS("http://www.w3.org/2000/svg", "path"), i = t.map((l) => l.getAttribute("d")).filter((l) => l !== null).join(" ");
  r.setAttribute("d", i);
  const s = t.find((l) => l.getAttribute("fill") !== "none"), o = t.find((l) => l.getAttribute("stroke") !== "none"), a = /* @__PURE__ */ p((l, c) => l?.getAttribute(c) ?? void 0, "getAttr");
  if (s) {
    const l = {
      fill: a(s, "fill"),
      "fill-opacity": a(s, "fill-opacity") ?? "1"
    };
    Object.entries(l).forEach(([c, h]) => {
      h && r.setAttribute(c, h);
    });
  }
  if (o) {
    const l = {
      stroke: a(o, "stroke"),
      "stroke-width": a(o, "stroke-width") ?? "1",
      "stroke-opacity": a(o, "stroke-opacity") ?? "1"
    };
    Object.entries(l).forEach(([c, h]) => {
      h && r.setAttribute(c, h);
    });
  }
  const n = document.createElementNS("http://www.w3.org/2000/svg", "g");
  return n.appendChild(r), n;
}
p(il, "mergePaths");
var yS = /* @__PURE__ */ p((e, t) => {
  var r = e.x, i = e.y, s = t.x - r, o = t.y - i, a = e.width / 2, n = e.height / 2, l, c;
  return Math.abs(o) * a > Math.abs(s) * n ? (o < 0 && (n = -n), l = o === 0 ? 0 : n * s / o, c = n) : (s < 0 && (a = -a), l = a, c = s === 0 ? 0 : a * o / s), { x: r + l, y: i + c };
}, "intersectRect"), ci = yS, qe = /* @__PURE__ */ p((e, t, r, i, s) => [
  "M",
  e + s,
  t,
  // Move to the first point
  "H",
  e + r - s,
  // Draw horizontal line to the beginning of the right corner
  "A",
  s,
  s,
  0,
  0,
  1,
  e + r,
  t + s,
  // Draw arc to the right top corner
  "V",
  t + i - s,
  // Draw vertical line down to the beginning of the right bottom corner
  "A",
  s,
  s,
  0,
  0,
  1,
  e + r - s,
  t + i,
  // Draw arc to the right bottom corner
  "H",
  e + s,
  // Draw horizontal line to the beginning of the left bottom corner
  "A",
  s,
  s,
  0,
  0,
  1,
  e,
  t + i - s,
  // Draw arc to the left bottom corner
  "V",
  t + s,
  // Draw vertical line up to the beginning of the left top corner
  "A",
  s,
  s,
  0,
  0,
  1,
  e + s,
  t,
  // Draw arc to the left top corner
  "Z"
  // Close the path
].join(" "), "createRoundedRectPathD"), xS = /* @__PURE__ */ p(async (e, t, r, i = !1, s = !1) => {
  let o = t || "";
  typeof o == "object" && (o = o[0]);
  const a = $t(), n = ge(a);
  return await Ve(
    e,
    o,
    {
      style: r,
      isTitle: i,
      useHtmlLabels: n,
      markdown: !1,
      isNode: s,
      width: Number.POSITIVE_INFINITY
    },
    a
  );
}, "createLabel"), Pr = xS;
function ug(e, t) {
  return e.intersect(t);
}
p(ug, "intersectNode");
var CS = ug;
function dg(e, t, r, i) {
  var s = e.x, o = e.y, a = s - i.x, n = o - i.y, l = Math.sqrt(t * t * n * n + r * r * a * a), c = Math.abs(t * r * a / l);
  i.x < s && (c = -c);
  var h = Math.abs(t * r * n / l);
  return i.y < o && (h = -h), { x: s + c, y: o + h };
}
p(dg, "intersectEllipse");
var fg = dg;
function pg(e, t, r) {
  return fg(e, t, t, r);
}
p(pg, "intersectCircle");
var bS = pg;
function gg(e, t, r, i) {
  {
    const s = t.y - e.y, o = e.x - t.x, a = t.x * e.y - e.x * t.y, n = s * r.x + o * r.y + a, l = s * i.x + o * i.y + a, c = 1e-6;
    if (n !== 0 && l !== 0 && sl(n, l))
      return;
    const h = i.y - r.y, u = r.x - i.x, d = i.x * r.y - r.x * i.y, f = h * e.x + u * e.y + d, m = h * t.x + u * t.y + d;
    if (Math.abs(f) < c && Math.abs(m) < c && sl(f, m))
      return;
    const y = s * u - h * o;
    if (y === 0)
      return;
    const x = Math.abs(y / 2);
    let C = o * d - u * a;
    const k = C < 0 ? (C - x) / y : (C + x) / y;
    C = h * a - s * d;
    const T = C < 0 ? (C - x) / y : (C + x) / y;
    return { x: k, y: T };
  }
}
p(gg, "intersectLine");
function sl(e, t) {
  return e * t > 0;
}
p(sl, "sameSign");
var kS = gg;
function mg(e, t, r) {
  let i = e.x, s = e.y, o = [], a = Number.POSITIVE_INFINITY, n = Number.POSITIVE_INFINITY;
  typeof t.forEach == "function" ? t.forEach(function(h) {
    a = Math.min(a, h.x), n = Math.min(n, h.y);
  }) : (a = Math.min(a, t.x), n = Math.min(n, t.y));
  let l = i - e.width / 2 - a, c = s - e.height / 2 - n;
  for (let h = 0; h < t.length; h++) {
    let u = t[h], d = t[h < t.length - 1 ? h + 1 : 0], f = kS(
      e,
      r,
      { x: l + u.x, y: c + u.y },
      { x: l + d.x, y: c + d.y }
    );
    f && o.push(f);
  }
  return o.length ? (o.length > 1 && o.sort(function(h, u) {
    let d = h.x - r.x, f = h.y - r.y, m = Math.sqrt(d * d + f * f), y = u.x - r.x, x = u.y - r.y, C = Math.sqrt(y * y + x * x);
    return m < C ? -1 : m === C ? 0 : 1;
  }), o[0]) : e;
}
p(mg, "intersectPolygon");
var wS = mg, nt = {
  node: CS,
  circle: bS,
  ellipse: fg,
  polygon: wS,
  rect: ci
};
function yg(e, t) {
  const { labelStyles: r } = pt(t);
  t.labelStyle = r;
  const i = Ct(t);
  let s = i;
  i || (s = "anchor");
  const o = e.insert("g").attr("class", s).attr("id", t.domId || t.id), a = 1, { cssStyles: n } = t, l = ut.svg(o), c = ct(t, { fill: "black", stroke: "none", fillStyle: "solid" });
  t.look !== "handDrawn" && (c.roughness = 0);
  const h = l.circle(0, 0, a * 2, c), u = o.insert(() => h, ":first-child");
  return u.attr("class", "anchor").attr("style", te(n)), dt(t, u), t.intersect = function(d) {
    return R.info("Circle intersect", t, a, d), nt.circle(t, a, d);
  }, o;
}
p(yg, "anchor");
function ol(e, t, r, i, s, o, a) {
  const l = (e + r) / 2, c = (t + i) / 2, h = Math.atan2(i - t, r - e), u = (r - e) / 2, d = (i - t) / 2, f = u / s, m = d / o, y = Math.sqrt(f ** 2 + m ** 2);
  if (y > 1)
    throw new Error("The given radii are too small to create an arc between the points.");
  const x = Math.sqrt(1 - y ** 2), C = l + x * o * Math.sin(h) * (a ? -1 : 1), k = c - x * s * Math.cos(h) * (a ? -1 : 1), T = Math.atan2((t - k) / o, (e - C) / s);
  let v = Math.atan2((i - k) / o, (r - C) / s) - T;
  a && v < 0 && (v += 2 * Math.PI), !a && v > 0 && (v -= 2 * Math.PI);
  const L = [];
  for (let A = 0; A < 20; A++) {
    const F = A / 19, G = T + F * v, Y = C + s * Math.cos(G), N = k + o * Math.sin(G);
    L.push({ x: Y, y: N });
  }
  return L;
}
p(ol, "generateArcPoints");
function xg(e, t, r) {
  const [i, s] = [t, r].sort((o, a) => a - o);
  return s * (1 - Math.sqrt(1 - (e / i / 2) ** 2));
}
p(xg, "calculateArcSagitta");
async function Cg(e, t) {
  const { labelStyles: r, nodeStyles: i } = pt(t);
  t.labelStyle = r;
  const s = t.padding ?? 0, o = t.look === "neo" ? 16 : s, a = t.look === "neo" ? 12 : s, n = /* @__PURE__ */ p((G) => G + a, "calcTotalHeight"), l = /* @__PURE__ */ p((G) => {
    const Y = G / 2;
    return [Y / (2.5 + G / 50), Y];
  }, "calcEllipseRadius"), { shapeSvg: c, bbox: h } = await xt(e, t, Ct(t)), u = n(t?.height ? t?.height : h.height), [d, f] = l(u), m = xg(u, d, f), x = (t?.width ? t?.width : h.width) + o * 2 + m - m, C = u, { cssStyles: k } = t, T = [
    { x: x / 2, y: -C / 2 },
    { x: -x / 2, y: -C / 2 },
    ...ol(-x / 2, -C / 2, -x / 2, C / 2, d, f, !1),
    { x: x / 2, y: C / 2 },
    ...ol(x / 2, C / 2, x / 2, -C / 2, d, f, !0)
  ], _ = ut.svg(c), v = ct(t, {});
  t.look !== "handDrawn" && (v.roughness = 0, v.fillStyle = "solid");
  const L = Pt(T), A = _.path(L, v), F = c.insert(() => A, ":first-child");
  return F.attr("class", "basic label-container outer-path"), k && t.look !== "handDrawn" && F.selectAll("path").attr("style", k), i && t.look !== "handDrawn" && F.selectAll("path").attr("style", i), F.attr("transform", `translate(${d / 2}, 0)`), dt(t, F), t.intersect = function(G) {
    return nt.polygon(t, T, G);
  }, c;
}
p(Cg, "bowTieRect");
async function bg(e, t, { config: { themeVariables: r } }) {
  const { labelStyles: i, nodeStyles: s } = pt(t);
  t.labelStyle = i;
  const { shapeSvg: o, bbox: a, label: n } = await xt(e, t, Ct(t)), l = r?.nodeBorder ?? r?.lineColor ?? "currentColor", c = t.padding ?? 12, h = Math.max(a.width + c * 2, t.width ?? 0, 80), u = Math.max(Math.min(h * 0.08, 12), 5), d = Math.max(a.height + c * 2 + u, t.height ?? 0), f = -d / 2 + u, m = d / 2, y = h * 0.72, x = [
    `M${-h / 2},${f}`,
    `L${-y / 2},${m}`,
    `A${y / 2},${u} 0 0 0 ${y / 2},${m}`,
    `L${h / 2},${f}`,
    `A${h / 2},${u} 0 0 0 ${-h / 2},${f}`,
    "Z"
  ].join(" "), { cssStyles: C } = t, k = o.insert("g", ":first-child").attr("class", "basic label-container");
  if (t.look === "handDrawn") {
    const F = ut.svg(o).path(x, ct(t, {}));
    k.node()?.appendChild(F), C && k.attr("style", C);
  } else
    k.append("path").attr("d", x).attr("style", s);
  k.append("ellipse").attr("cx", 0).attr("cy", f).attr("rx", h / 2).attr("ry", u).attr("style", `fill:none;stroke:${l};stroke-width:1px`), dt(t, k);
  const T = f + (m - f) / 2;
  n.attr(
    "transform",
    `translate(${-(a.width / 2) - (a.x - (a.left ?? 0))}, ${T - a.height / 2 - (a.y - (a.top ?? 0))})`
  );
  const _ = 12, v = /* @__PURE__ */ p((A, F, G) => Array.from({ length: _ + 1 }, (Y, N) => {
    const st = Math.PI - N * Math.PI / _;
    return { x: A * Math.cos(st), y: F + G * u * Math.sin(st) };
  }), "arc"), L = [...v(h / 2, f, -1), ...v(y / 2, m, 1).reverse()];
  return t.intersect = function(A) {
    return nt.polygon(t, L, A);
  }, o;
}
p(bg, "bucket");
var _u = 20, vu = 8, TS = 80, Va = 8;
async function kg(e, t) {
  const { themeVariables: r } = $t(), i = r.clusterBkg, s = r.clusterBorder, { nodeStyles: o } = pt(t), { shapeSvg: a, bbox: n } = await xt(e, t, Ct(t)), l = t.padding ?? 8, c = n.height, h = Math.max(n.width + l * 2, TS, t?.width ?? 0), u = Math.max(
    c + vu + _u + l * 2,
    t?.height ?? 0
  ), d = -h / 2, f = -u / 2, m = -28 / 2, y = a.select(".label");
  y && (t.useHtmlLabels ?? ge($t()) ? y.attr("transform", `translate(${-n.width / 2}, ${-n.height / 2 + m})`) : y.attr("transform", `translate(0, ${-n.height / 2 + m})`));
  let x;
  if (t.look === "handDrawn") {
    const v = ut.svg(a), L = ct(t, {
      fill: i,
      stroke: s,
      fillStyle: "solid"
    }), A = v.path(
      qe(d, f, h, u, Va),
      L
    );
    x = a.insert(() => A, ":first-child"), x.attr("class", "basic label-container collapsed-group").attr("style", te(t.cssStyles));
  } else
    x = a.insert("rect", ":first-child"), x.attr("class", "basic label-container collapsed-group").attr("style", o).attr("rx", Va).attr("ry", Va).attr("x", d).attr("y", f).attr("width", h).attr("height", u).attr("fill", i).attr("stroke", s);
  const C = f + l + c + vu;
  a.append("line").attr("class", "collapsed-separator").attr("x1", d + 8).attr("y1", C).attr("x2", d + h - 8).attr("y2", C).attr("stroke", s).attr("stroke-dasharray", "3, 3");
  const k = C + _u / 2, T = 2.5, _ = 10;
  for (let v = -1; v <= 1; v++)
    a.append("circle").attr("class", "collapsed-indicator").attr("cx", v * _).attr("cy", k).attr("r", T).attr("fill", s);
  return dt(t, x), t.calcIntersect = function(v, L) {
    return nt.rect(v, L);
  }, t.intersect = function(v) {
    return nt.rect(t, v);
  }, a;
}
p(kg, "collapsedGroup");
function dr(e, t, r, i) {
  return e.insert("polygon", ":first-child").attr(
    "points",
    i.map(function(s) {
      return s.x + "," + s.y;
    }).join(" ")
  ).attr("class", "label-container").attr("transform", "translate(" + -t / 2 + "," + r / 2 + ")");
}
p(dr, "insertPolygonShape");
var SS = ["right", "left", "up", "down"], nh = "point", _S = /* @__PURE__ */ p((e) => {
  const t = /* @__PURE__ */ new Set();
  for (const r of e)
    switch (r) {
      case "x":
        t.add("right"), t.add("left");
        break;
      case "y":
        t.add("up"), t.add("down");
        break;
      default:
        t.add(r);
        break;
    }
  return t;
}, "expandAndDeduplicateDirections"), vS = /* @__PURE__ */ p((e) => SS.filter((t) => e.has(t)).join("|") || nh, "getDirectionKey"), Bu = {
  "right|left|up|down": /* @__PURE__ */ p(({ height: e, midpoint: t, padding: r, width: i }) => [
    { x: 0, y: 0 },
    { x: t, y: 0 },
    { x: i / 2, y: 2 * r },
    { x: i - t, y: 0 },
    { x: i, y: 0 },
    { x: i, y: -e / 3 },
    { x: i + 2 * r, y: -e / 2 },
    { x: i, y: -2 * e / 3 },
    { x: i, y: -e },
    { x: i - t, y: -e },
    { x: i / 2, y: -e - 2 * r },
    { x: t, y: -e },
    { x: 0, y: -e },
    { x: 0, y: -2 * e / 3 },
    { x: -2 * r, y: -e / 2 },
    { x: 0, y: -e / 3 }
  ], "right|left|up|down"),
  "right|left|up": /* @__PURE__ */ p(({ height: e, midpoint: t, width: r }) => [
    { x: t, y: 0 },
    { x: r - t, y: 0 },
    { x: r, y: -e / 2 },
    { x: r - t, y: -e },
    { x: t, y: -e },
    { x: 0, y: -e / 2 }
  ], "right|left|up"),
  "right|left|down": /* @__PURE__ */ p(({ height: e, midpoint: t, width: r }) => [
    { x: 0, y: 0 },
    { x: t, y: -e },
    { x: r - t, y: -e },
    { x: r, y: 0 }
  ], "right|left|down"),
  "right|up|down": /* @__PURE__ */ p(({ height: e, midpoint: t, width: r }) => [
    { x: 0, y: 0 },
    { x: r, y: -t },
    { x: r, y: -e + t },
    { x: 0, y: -e }
  ], "right|up|down"),
  "left|up|down": /* @__PURE__ */ p(({ height: e, midpoint: t, width: r }) => [
    { x: r, y: 0 },
    { x: 0, y: -t },
    { x: 0, y: -e + t },
    { x: r, y: -e }
  ], "left|up|down"),
  "right|left": /* @__PURE__ */ p(({ height: e, midpoint: t, padding: r, width: i }) => [
    { x: t, y: 0 },
    { x: t, y: -r },
    { x: i - t, y: -r },
    { x: i - t, y: 0 },
    { x: i, y: -e / 2 },
    { x: i - t, y: -e },
    { x: i - t, y: -e + r },
    { x: t, y: -e + r },
    { x: t, y: -e },
    { x: 0, y: -e / 2 }
  ], "right|left"),
  "up|down": /* @__PURE__ */ p(({ height: e, midpoint: t, padding: r, width: i }) => [
    { x: i / 2, y: 0 },
    { x: 0, y: -r },
    { x: t, y: -r },
    { x: t, y: -e + r },
    { x: 0, y: -e + r },
    { x: i / 2, y: -e },
    { x: i, y: -e + r },
    { x: i - t, y: -e + r },
    { x: i - t, y: -r },
    { x: i, y: -r }
  ], "up|down"),
  "right|up": /* @__PURE__ */ p(({ height: e, midpoint: t, width: r }) => [
    { x: 0, y: 0 },
    { x: r, y: -t },
    { x: 0, y: -e }
  ], "right|up"),
  "right|down": /* @__PURE__ */ p(({ height: e, width: t }) => [
    { x: 0, y: 0 },
    { x: t, y: 0 },
    { x: 0, y: -e }
  ], "right|down"),
  "left|up": /* @__PURE__ */ p(({ height: e, midpoint: t, width: r }) => [
    { x: r, y: 0 },
    { x: 0, y: -t },
    { x: r, y: -e }
  ], "left|up"),
  "left|down": /* @__PURE__ */ p(({ height: e, width: t }) => [
    { x: t, y: 0 },
    { x: 0, y: 0 },
    { x: t, y: -e }
  ], "left|down"),
  right: /* @__PURE__ */ p(({ height: e, midpoint: t, padding: r, width: i }) => [
    { x: t, y: -r },
    { x: t, y: -r },
    { x: i - t, y: -r },
    { x: i - t, y: 0 },
    { x: i, y: -e / 2 },
    { x: i - t, y: -e },
    { x: i - t, y: -e + r },
    { x: t, y: -e + r },
    { x: t, y: -e + r }
  ], "right"),
  left: /* @__PURE__ */ p(({ height: e, midpoint: t, padding: r, width: i }) => [
    { x: t, y: 0 },
    { x: t, y: -r },
    { x: i - t, y: -r },
    { x: i - t, y: -e + r },
    { x: t, y: -e + r },
    { x: t, y: -e },
    { x: 0, y: -e / 2 }
  ], "left"),
  up: /* @__PURE__ */ p(({ height: e, midpoint: t, padding: r, width: i }) => [
    { x: t, y: -r },
    { x: t, y: -e + r },
    { x: 0, y: -e + r },
    { x: i / 2, y: -e },
    { x: i, y: -e + r },
    { x: i - t, y: -e + r },
    { x: i - t, y: -r }
  ], "up"),
  down: /* @__PURE__ */ p(({ height: e, midpoint: t, padding: r, width: i }) => [
    { x: i / 2, y: 0 },
    { x: 0, y: -r },
    { x: t, y: -r },
    { x: t, y: -e + r },
    { x: i - t, y: -e + r },
    { x: i - t, y: -r },
    { x: i, y: -r }
  ], "down"),
  [nh]: () => [{ x: 0, y: 0 }]
}, BS = /* @__PURE__ */ p((e, t, r, i) => {
  const s = _S(e), o = (r.padding ?? 0) / 2, a = t.height + 4 * o, n = a / 2, l = i ?? t.width + 2 * n + 2 * o, c = vS(s);
  return (Bu[c] ?? Bu[nh])({ height: a, midpoint: n, padding: o, width: l });
}, "getArrowPoints");
async function wg(e, t) {
  const r = t, { shapeSvg: i, bbox: s } = await xt(e, r, Ct(r)), o = r.padding ?? 0, a = s.height + 2 * o, n = a / 2, l = s.width + 2 * n + o, c = r.width ?? 0, u = r.positioned && (r.widthInColumns ?? 1) > 1 && c > l ? c : l, d = BS(r.directions ?? [], s, r, u), f = dr(i, u, a, d);
  return f.attr("style", r.style ?? null), dt(r, f), r.intersect = function(m) {
    return nt.polygon(r, d, m);
  }, i;
}
p(wg, "block_arrow");
async function Tg(e, t, { config: { themeVariables: r } }) {
  const { labelStyles: i, nodeStyles: s } = pt(t);
  t.labelStyle = i;
  const { shapeSvg: o, bbox: a, label: n } = await xt(e, t, Ct(t)), l = r?.nodeBorder ?? r?.lineColor ?? "currentColor", c = t.padding ?? 12, h = 18, u = 12, d = Math.max(a.width + c * 2, t.width ?? 0, 90), f = Math.max(a.height + c * 2 + h, t.height ?? 0), m = -f / 2, { cssStyles: y } = t, x = o.insert("g", ":first-child").attr("class", "basic label-container");
  if (t.look === "handDrawn") {
    const T = ut.svg(o).path(
      qe(-d / 2, m, d, f, u),
      ct(t, {})
    );
    x.node()?.appendChild(T), y && x.attr("style", y);
  } else
    x.append("rect").attr("x", -d / 2).attr("y", m).attr("width", d).attr("height", f).attr("rx", u).attr("ry", u).attr("style", s);
  x.append("line").attr("x1", -d / 2).attr("y1", m + h).attr("x2", d / 2).attr("y2", m + h).attr("style", `stroke:${l};stroke-width:1px`);
  for (let k = 0; k < 3; k++)
    x.append("circle").attr("cx", -d / 2 + 12 + k * 9).attr("cy", m + h / 2).attr("r", 2.5).attr("style", `fill:${l};stroke:none`);
  x.append("rect").attr("class", "browser-address-bar").attr("x", -d / 2 + 44).attr("y", m + 4).attr("width", Math.max(d - 56, 10)).attr("height", h - 8).attr("rx", 3).attr("ry", 3).attr("style", `fill:none;stroke:${l};stroke-width:1px;opacity:0.6`), dt(t, x);
  const C = m + h + (f - h) / 2;
  return n.attr(
    "transform",
    `translate(${-(a.width / 2) - (a.x - (a.left ?? 0))}, ${C - a.height / 2 - (a.y - (a.top ?? 0))})`
  ), t.intersect = function(k) {
    return nt.rect(t, k);
  }, o;
}
p(Tg, "browser");
var oo = 12;
async function Sg(e, t) {
  const { labelStyles: r, nodeStyles: i } = pt(t);
  t.labelStyle = r;
  const s = t.padding ?? 0, o = t.look === "neo" ? 28 : s, a = t.look === "neo" ? 24 : s, { shapeSvg: n, bbox: l } = await xt(e, t, Ct(t)), c = (t?.width ?? l.width) + (t.look === "neo" ? o * 2 : o + oo), h = (t?.height ?? l.height) + (t.look === "neo" ? a * 2 : a), u = 0, d = c, f = -h, m = 0, y = [
    { x: u + oo, y: f },
    { x: d, y: f },
    { x: d, y: m },
    { x: u, y: m },
    { x: u, y: f + oo },
    { x: u + oo, y: f }
  ];
  let x;
  const { cssStyles: C } = t;
  if (t.look === "handDrawn") {
    const k = ut.svg(n), T = ct(t, {}), _ = Pt(y), v = k.path(_, T);
    x = n.insert(() => v, ":first-child").attr("transform", `translate(${-c / 2}, ${h / 2})`), C && x.attr("style", C);
  } else
    x = dr(n, c, h, y);
  return i && x.attr("style", i), dt(t, x), t.intersect = function(k) {
    return nt.polygon(t, y, k);
  }, n;
}
p(Sg, "card");
function _g(e, t) {
  const { nodeStyles: r } = pt(t);
  t.label = "";
  const i = e.insert("g").attr("class", Ct(t)).attr("id", t.domId ?? t.id), { cssStyles: s } = t, o = Math.max(28, t.width ?? 0), a = [
    { x: 0, y: o / 2 },
    { x: o / 2, y: 0 },
    { x: 0, y: -o / 2 },
    { x: -o / 2, y: 0 }
  ], n = ut.svg(i), l = ct(t, {});
  t.look !== "handDrawn" && (l.roughness = 0, l.fillStyle = "solid");
  const c = Pt(a), h = n.path(c, l), u = i.insert(() => h, ":first-child");
  return s && t.look !== "handDrawn" && u.selectAll("path").attr("style", s), r && t.look !== "handDrawn" && u.selectAll("path").attr("style", r), t.width = 28, t.height = 28, t.intersect = function(d) {
    return nt.polygon(t, a, d);
  }, i;
}
p(_g, "choice");
async function lh(e, t, r) {
  const { labelStyles: i, nodeStyles: s } = pt(t);
  t.labelStyle = i;
  const { shapeSvg: o, bbox: a, halfPadding: n } = await xt(e, t, Ct(t)), l = 16, c = r?.padding ?? n, h = t.look === "neo" ? a.width / 2 + l * 2 : a.width / 2 + c;
  let u;
  const { cssStyles: d } = t;
  if (t.look === "handDrawn") {
    const f = ut.svg(o), m = ct(t, {}), y = f.circle(0, 0, h * 2, m);
    u = o.insert(() => y, ":first-child"), u.attr("class", "basic label-container").attr("style", te(d));
  } else
    u = o.insert("circle", ":first-child").attr("class", "basic label-container").attr("style", s).attr("r", h).attr("cx", 0).attr("cy", 0);
  return dt(t, u), t.calcIntersect = function(f, m) {
    const y = f.width / 2;
    return nt.circle(f, y, m);
  }, t.intersect = function(f) {
    return R.info("Circle intersect", t, h, f), nt.circle(t, h, f);
  }, o;
}
p(lh, "circle");
async function vg(e, t) {
  const r = t, i = ["node", r.cssClasses, r.class].filter(Boolean).join(" "), { shapeSvg: s, bbox: o, halfPadding: a } = await xt(e, r, i), n = s.insert("rect", ":first-child"), l = r.padding ?? 0, c = r.positioned ? r.width ?? 0 : o.width + l, h = r.positioned ? r.height ?? 0 : o.height + l, u = r.positioned ? -c / 2 : -o.width / 2 - a, d = r.positioned ? -h / 2 : -o.height / 2 - a;
  return n.attr("class", "basic cluster composite label-container").attr("style", r.style ?? null).attr("rx", r.rx ?? null).attr("ry", r.ry ?? null).attr("x", u).attr("y", d).attr("width", c).attr("height", h), dt(r, n), r.intersect = function(f) {
    return nt.rect(r, f);
  }, s;
}
p(vg, "composite");
async function Bg(e, t, { config: { themeVariables: r } }) {
  const { labelStyles: i, nodeStyles: s } = pt(t);
  t.labelStyle = i;
  const { shapeSvg: o, bbox: a, label: n } = await xt(e, t, Ct(t)), l = r?.nodeBorder ?? r?.lineColor ?? "currentColor", c = t.padding ?? 12, h = 20, u = 12, d = Math.max(a.width + c * 2, t.width ?? 0, 90), f = Math.max(a.height + c * 2 + h, t.height ?? 0), m = -f / 2, { cssStyles: y } = t, x = o.insert("g", ":first-child").attr("class", "basic label-container");
  if (t.look === "handDrawn") {
    const T = ut.svg(o).path(
      qe(-d / 2, m, d, f, u),
      ct(t, {})
    );
    x.node()?.appendChild(T), y && x.attr("style", y);
  } else
    x.append("rect").attr("x", -d / 2).attr("y", m).attr("width", d).attr("height", f).attr("rx", u).attr("ry", u).attr("style", s);
  x.append("text").attr("x", -d / 2 + 12).attr("y", m + 16).attr("class", "console-glyph").attr("style", `font-family:monospace;font-weight:bold;font-size:14px;fill:${l}`).text(">_"), dt(t, x);
  const C = m + h + (f - h) / 2;
  return n.attr(
    "transform",
    `translate(${-(a.width / 2) - (a.x - (a.left ?? 0))}, ${C - a.height / 2 - (a.y - (a.top ?? 0))})`
  ), t.intersect = function(k) {
    return nt.rect(t, k);
  }, o;
}
p(Bg, "consoleWindow");
function Lg(e) {
  const t = Math.cos(Math.PI / 4), r = Math.sin(Math.PI / 4), i = e * 2, s = { x: i / 2 * t, y: i / 2 * r }, o = { x: -(i / 2) * t, y: i / 2 * r }, a = { x: -(i / 2) * t, y: -(i / 2) * r }, n = { x: i / 2 * t, y: -(i / 2) * r };
  return `M ${o.x},${o.y} L ${n.x},${n.y}
                   M ${s.x},${s.y} L ${a.x},${a.y}`;
}
p(Lg, "createLine");
function Fg(e, t) {
  const { labelStyles: r, nodeStyles: i } = pt(t);
  t.labelStyle = r, t.label = "";
  const s = e.insert("g").attr("class", Ct(t)).attr("id", t.domId ?? t.id), o = Math.max(30, t?.width ?? 0), { cssStyles: a } = t, n = ut.svg(s), l = ct(t, {});
  t.look !== "handDrawn" && (l.roughness = 0, l.fillStyle = "solid");
  const c = n.circle(0, 0, o * 2, l), h = Lg(o), u = n.path(h, l), d = s.insert(() => c, ":first-child");
  return d.insert(() => u), d.attr("class", "outer-path"), a && t.look !== "handDrawn" && d.selectAll("path").attr("style", a), i && t.look !== "handDrawn" && d.selectAll("path").attr("style", i), dt(t, d), t.intersect = function(f) {
    return R.info("crossedCircle intersect", t, { radius: o, point: f }), nt.circle(t, o, f);
  }, s;
}
p(Fg, "crossedCircle");
function xr(e, t, r, i = 100, s = 0, o = 180) {
  const a = [], n = s * Math.PI / 180, h = (o * Math.PI / 180 - n) / (i - 1);
  for (let u = 0; u < i; u++) {
    const d = n + u * h, f = e + r * Math.cos(d), m = t + r * Math.sin(d);
    a.push({ x: -f, y: -m });
  }
  return a;
}
p(xr, "generateCirclePoints");
async function Ag(e, t) {
  const { labelStyles: r, nodeStyles: i } = pt(t);
  t.labelStyle = r;
  const { shapeSvg: s, bbox: o, label: a } = await xt(e, t, Ct(t)), n = t.look === "neo" ? 18 : t.padding ?? 0, l = t.look === "neo" ? 12 : t.padding ?? 0, c = o.width + n, h = o.height + l, u = Math.max(5, h * 0.1), { cssStyles: d } = t, f = [
    ...xr(c / 2, -h / 2, u, 30, -90, 0),
    { x: -c / 2 - u, y: u },
    ...xr(c / 2 + u * 2, -u, u, 20, -180, -270),
    ...xr(c / 2 + u * 2, u, u, 20, -90, -180),
    { x: -c / 2 - u, y: -h / 2 },
    ...xr(c / 2, h / 2, u, 20, 0, 90)
  ], m = [
    { x: c / 2, y: -h / 2 - u },
    { x: -c / 2, y: -h / 2 - u },
    ...xr(c / 2, -h / 2, u, 20, -90, 0),
    { x: -c / 2 - u, y: -u },
    ...xr(c / 2 + c * 0.1, -u, u, 20, -180, -270),
    ...xr(c / 2 + c * 0.1, u, u, 20, -90, -180),
    { x: -c / 2 - u, y: h / 2 },
    ...xr(c / 2, h / 2, u, 20, 0, 90),
    { x: -c / 2, y: h / 2 + u },
    { x: c / 2, y: h / 2 + u }
  ], y = ut.svg(s), x = ct(t, { fill: "none" });
  t.look !== "handDrawn" && (x.roughness = 0, x.fillStyle = "solid");
  const k = Pt(f).replace("Z", ""), T = y.path(k, x), _ = Pt(m), v = y.path(_, { ...x }), L = s.insert("g", ":first-child");
  return L.insert(() => v, ":first-child").attr("stroke-opacity", 0), L.insert(() => T, ":first-child"), L.attr("class", "text"), d && t.look !== "handDrawn" && L.selectAll("path").attr("style", d), i && t.look !== "handDrawn" && L.selectAll("path").attr("style", i), L.attr("transform", `translate(${u}, 0)`), a.attr(
    "transform",
    `translate(${-c / 2 + u - (o.x - (o.left ?? 0))},${-h / 2 + (t.padding ?? 0) / 2 - (o.y - (o.top ?? 0))})`
  ), dt(t, L), t.intersect = function(A) {
    return nt.polygon(t, m, A);
  }, s;
}
p(Ag, "curlyBraceLeft");
function Cr(e, t, r, i = 100, s = 0, o = 180) {
  const a = [], n = s * Math.PI / 180, h = (o * Math.PI / 180 - n) / (i - 1);
  for (let u = 0; u < i; u++) {
    const d = n + u * h, f = e + r * Math.cos(d), m = t + r * Math.sin(d);
    a.push({ x: f, y: m });
  }
  return a;
}
p(Cr, "generateCirclePoints");
async function Eg(e, t) {
  const { labelStyles: r, nodeStyles: i } = pt(t);
  t.labelStyle = r;
  const { shapeSvg: s, bbox: o, label: a } = await xt(e, t, Ct(t)), n = t.look === "neo" ? 18 : t.padding ?? 0, l = t.look === "neo" ? 12 : t.padding ?? 0, c = o.width + (t.look === "neo" ? n * 2 : n), h = o.height + (t.look === "neo" ? l * 2 : l), u = Math.max(5, h * 0.1), { cssStyles: d } = t, f = [
    ...Cr(c / 2, -h / 2, u, 20, -90, 0),
    { x: c / 2 + u, y: -u },
    ...Cr(c / 2 + u * 2, -u, u, 20, -180, -270),
    ...Cr(c / 2 + u * 2, u, u, 20, -90, -180),
    { x: c / 2 + u, y: h / 2 },
    ...Cr(c / 2, h / 2, u, 20, 0, 90)
  ], m = [
    { x: -c / 2, y: -h / 2 - u },
    { x: c / 2, y: -h / 2 - u },
    ...Cr(c / 2, -h / 2, u, 20, -90, 0),
    { x: c / 2 + u, y: -u },
    ...Cr(c / 2 + u * 2, -u, u, 20, -180, -270),
    ...Cr(c / 2 + u * 2, u, u, 20, -90, -180),
    { x: c / 2 + u, y: h / 2 },
    ...Cr(c / 2, h / 2, u, 20, 0, 90),
    { x: c / 2, y: h / 2 + u },
    { x: -c / 2, y: h / 2 + u }
  ], y = ut.svg(s), x = ct(t, { fill: "none" });
  t.look !== "handDrawn" && (x.roughness = 0, x.fillStyle = "solid");
  const k = Pt(f).replace("Z", ""), T = y.path(k, x), _ = Pt(m), v = y.path(_, { ...x }), L = s.insert("g", ":first-child");
  return L.insert(() => v, ":first-child").attr("stroke-opacity", 0), L.insert(() => T, ":first-child"), L.attr("class", "text"), d && t.look !== "handDrawn" && L.selectAll("path").attr("style", d), i && t.look !== "handDrawn" && L.selectAll("path").attr("style", i), L.attr("transform", `translate(${-u}, 0)`), a.attr(
    "transform",
    `translate(${-c / 2 + (t.padding ?? 0) / 2 - (o.x - (o.left ?? 0))},${-h / 2 + (t.padding ?? 0) / 2 - (o.y - (o.top ?? 0))})`
  ), dt(t, L), t.intersect = function(A) {
    return nt.polygon(t, m, A);
  }, s;
}
p(Eg, "curlyBraceRight");
function he(e, t, r, i = 100, s = 0, o = 180) {
  const a = [], n = s * Math.PI / 180, h = (o * Math.PI / 180 - n) / (i - 1);
  for (let u = 0; u < i; u++) {
    const d = n + u * h, f = e + r * Math.cos(d), m = t + r * Math.sin(d);
    a.push({ x: -f, y: -m });
  }
  return a;
}
p(he, "generateCirclePoints");
async function Mg(e, t) {
  const { labelStyles: r, nodeStyles: i } = pt(t);
  t.labelStyle = r;
  const { shapeSvg: s, bbox: o, label: a } = await xt(e, t, Ct(t)), n = t.look === "neo" ? 18 : t.padding ?? 0, l = t.look === "neo" ? 12 : t.padding ?? 0, c = o.width + (t.look === "neo" ? n * 2 : n), h = o.height + (t.look === "neo" ? l * 2 : l), u = Math.max(5, h * 0.1), { cssStyles: d } = t, f = [
    ...he(c / 2, -h / 2, u, 30, -90, 0),
    { x: -c / 2 - u, y: u },
    ...he(c / 2 + u * 2, -u, u, 20, -180, -270),
    ...he(c / 2 + u * 2, u, u, 20, -90, -180),
    { x: -c / 2 - u, y: -h / 2 },
    ...he(c / 2, h / 2, u, 20, 0, 90)
  ], m = [
    ...he(-c / 2 + u + u / 2, -h / 2, u, 20, -90, -180),
    { x: c / 2 - u / 2, y: u },
    ...he(-c / 2 - u / 2, -u, u, 20, 0, 90),
    ...he(-c / 2 - u / 2, u, u, 20, -90, 0),
    { x: c / 2 - u / 2, y: -u },
    ...he(-c / 2 + u + u / 2, h / 2, u, 30, -180, -270)
  ], y = [
    { x: c / 2, y: -h / 2 - u },
    { x: -c / 2, y: -h / 2 - u },
    ...he(c / 2, -h / 2, u, 20, -90, 0),
    { x: -c / 2 - u, y: -u },
    ...he(c / 2 + u * 2, -u, u, 20, -180, -270),
    ...he(c / 2 + u * 2, u, u, 20, -90, -180),
    { x: -c / 2 - u, y: h / 2 },
    ...he(c / 2, h / 2, u, 20, 0, 90),
    { x: -c / 2, y: h / 2 + u },
    { x: c / 2 - u - u / 2, y: h / 2 + u },
    ...he(-c / 2 + u + u / 2, -h / 2, u, 20, -90, -180),
    { x: c / 2 - u / 2, y: u },
    ...he(-c / 2 - u / 2, -u, u, 20, 0, 90),
    ...he(-c / 2 - u / 2, u, u, 20, -90, 0),
    { x: c / 2 - u / 2, y: -u },
    ...he(-c / 2 + u + u / 2, h / 2, u, 30, -180, -270)
  ], x = ut.svg(s), C = ct(t, { fill: "none" });
  t.look !== "handDrawn" && (C.roughness = 0, C.fillStyle = "solid");
  const T = Pt(f).replace("Z", ""), _ = x.path(T, C), L = Pt(m).replace("Z", ""), A = x.path(L, C), F = Pt(y), G = x.path(F, { ...C }), Y = s.insert("g", ":first-child");
  return Y.insert(() => G, ":first-child").attr("stroke-opacity", 0), Y.insert(() => _, ":first-child"), Y.insert(() => A, ":first-child"), Y.attr("class", "text"), d && t.look !== "handDrawn" && Y.selectAll("path").attr("style", d), i && t.look !== "handDrawn" && Y.selectAll("path").attr("style", i), Y.attr("transform", `translate(${u - u / 4}, 0)`), a.attr(
    "transform",
    `translate(${-c / 2 + (t.padding ?? 0) / 2 - (o.x - (o.left ?? 0))},${-h / 2 + (t.padding ?? 0) / 2 - (o.y - (o.top ?? 0))})`
  ), dt(t, Y), t.intersect = function(N) {
    return nt.polygon(t, y, N);
  }, s;
}
p(Mg, "curlyBraces");
async function $g(e, t) {
  const { labelStyles: r, nodeStyles: i } = pt(t);
  t.labelStyle = r;
  const s = t.padding ?? 0, o = t.look === "neo" ? 16 : s, a = t.look === "neo" ? 12 : s, n = 20, l = 5, { shapeSvg: c, bbox: h } = await xt(e, t, Ct(t)), u = Math.max(n, (h.width + o * 2) * 1.25, t?.width ?? 0), d = Math.max(l, h.height + a * 2, t?.height ?? 0), f = d / 2, { cssStyles: m } = t, y = ut.svg(c), x = ct(t, {});
  t.look !== "handDrawn" && (x.roughness = 0, x.fillStyle = "solid");
  const C = u, k = d, T = C - f, _ = k / 4, v = [
    { x: T, y: 0 },
    { x: _, y: 0 },
    { x: 0, y: k / 2 },
    { x: _, y: k },
    { x: T, y: k },
    ...sr(-T, -k / 2, f, 50, 270, 90)
  ], L = Pt(v), A = y.path(L, x), F = c.insert(() => A, ":first-child");
  return F.attr("class", "basic label-container outer-path"), m && t.look !== "handDrawn" && F.selectChildren("path").attr("style", m), i && t.look !== "handDrawn" && F.selectChildren("path").attr("style", i), F.attr("transform", `translate(${-u / 2}, ${-d / 2})`), dt(t, F), t.intersect = function(G) {
    return nt.polygon(t, v, G);
  }, c;
}
p($g, "curvedTrapezoid");
async function Og(e, t) {
  const { labelStyles: r, nodeStyles: i } = pt(t);
  t.labelStyle = r;
  const { shapeSvg: s, bbox: o, label: a } = await xt(e, t, Ct(t)), n = t.padding ?? 20, l = Math.max(o.width + n * 2, t.width ?? 0, 100), c = Math.min(Math.max(l * 0.23, 16), 56), h = c * 0.27, u = Math.max(
    o.height + n * 2,
    t.height ? t.height - (2 * c - h) : 0
  ), d = Math.min(l * 0.177, u * 0.45), f = u + 2 * c - h, m = -f / 2, y = m + 2 * c - h, x = s.insert("g", ":first-child").attr("class", "basic label-container"), { cssStyles: C } = t;
  if (t.look === "handDrawn") {
    const F = ut.svg(s), G = ct(t, {}), Y = F.path(
      qe(-l / 2, y, l, u, d),
      G
    ), N = F.circle(0, m + c, c * 2, G);
    x.insert(() => N, ":first-child"), x.insert(() => Y, ":first-child"), C && x.attr("style", C);
  } else
    x.append("rect").attr("x", -l / 2).attr("y", y).attr("width", l).attr("height", u).attr("rx", d).attr("ry", d).attr("style", i), x.append("circle").attr("cx", 0).attr("cy", m + c).attr("r", c).attr("style", i);
  dt(t, x);
  const k = y + u / 2;
  a.attr(
    "transform",
    `translate(${-(o.width / 2) - (o.x - (o.left ?? 0))}, ${k - o.height / 2 - (o.y - (o.top ?? 0))})`
  );
  const T = m + c, _ = Math.asin(Math.min(1, (y - T) / c)) * 180 / Math.PI, A = [
    ...sr(
      0,
      -T,
      c,
      24,
      180 + _,
      -_
    ),
    ...sr(-(-l / 2 + d), -(y + d), d, 12, 90, 0),
    ...sr(
      -(-l / 2 + d),
      -(f / 2 - d),
      d,
      12,
      360,
      270
    ),
    ...sr(
      -(l / 2 - d),
      -(f / 2 - d),
      d,
      12,
      270,
      180
    ),
    ...sr(
      -(l / 2 - d),
      -(y + d),
      d,
      12,
      180,
      90
    )
  ];
  return t.intersect = function(F) {
    return nt.polygon(t, A, F);
  }, s;
}
p(Og, "person");
var LS = /* @__PURE__ */ p((e, t, r, i, s, o) => [
  `M${e},${t + o}`,
  `a${s},${o} 0,0,0 ${r},0`,
  `a${s},${o} 0,0,0 ${-r},0`,
  `l0,${i}`,
  `a${s},${o} 0,0,0 ${r},0`,
  `l0,${-i}`
].join(" "), "createCylinderPathD"), FS = /* @__PURE__ */ p((e, t, r, i, s, o) => [
  `M${e},${t + o}`,
  `M${e + r},${t + o}`,
  `a${s},${o} 0,0,0 ${-r},0`,
  `l0,${i}`,
  `a${s},${o} 0,0,0 ${r},0`,
  `l0,${-i}`
].join(" "), "createOuterCylinderPathD"), AS = /* @__PURE__ */ p((e, t, r, i, s, o) => [`M${e - r / 2},${-i / 2}`, `a${s},${o} 0,0,0 ${r},0`].join(" "), "createInnerCylinderPathD"), Lu = 8, Fu = 8;
async function Dg(e, t) {
  const { labelStyles: r, nodeStyles: i } = pt(t);
  t.labelStyle = r;
  const s = t.padding ?? 0, o = t.look === "neo" ? 24 : s, a = t.look === "neo" ? 24 : s, n = t.width ?? 0;
  if (t.width && (t.width = t.width - a, t.width < Fu && (t.width = Fu)), t.height) {
    const k = n / 2 / (2.5 + n / 50);
    t.height = t.height - o - k * 3, t.height < Lu && (t.height = Lu);
  }
  const { shapeSvg: l, bbox: c, label: h } = await xt(e, t, Ct(t)), u = Math.max(t.width ?? 0, c.width) + a, d = u / 2, f = d / (2.5 + u / 50), m = Math.max(t.height ?? 0, c.height) + o + f;
  let y;
  const { cssStyles: x } = t;
  if (t.look === "handDrawn") {
    const C = ut.svg(l), k = FS(0, 0, u, m, d, f), T = AS(0, f, u, m, d, f), _ = ct(t, {}), v = C.path(k, _), L = C.path(T, ct(t, { fill: "none" }));
    y = l.insert(() => L, ":first-child"), y = l.insert(() => v, ":first-child"), y.attr("class", "basic label-container"), x && y.attr("style", x);
  } else {
    const C = LS(0, 0, u, m, d, f);
    y = l.insert("path", ":first-child").attr("d", C).attr("class", "basic label-container outer-path").attr("style", te(x)).attr("style", i);
  }
  return y.attr("label-offset-y", f), y.attr("transform", `translate(${-u / 2}, ${-(m / 2 + f)})`), dt(t, y), h.attr(
    "transform",
    `translate(${-(c.width / 2) - (c.x - (c.left ?? 0))}, ${-(c.height / 2) + (t.padding ?? 0) / 1.5 - (c.y - (c.top ?? 0))})`
  ), t.intersect = function(C) {
    const k = nt.rect(t, C), T = k.x - (t.x ?? 0);
    if (d != 0 && (Math.abs(T) < (t.width ?? 0) / 2 || Math.abs(T) == (t.width ?? 0) / 2 && Math.abs(k.y - (t.y ?? 0)) > (t.height ?? 0) / 2 - f)) {
      let _ = f * f * (1 - T * T / (d * d));
      _ > 0 && (_ = Math.sqrt(_)), _ = f - _, C.y - (t.y ?? 0) > 0 && (_ = -_), k.y += _;
    }
    return k;
  }, l;
}
p(Dg, "cylinder");
async function qi(e, t, r) {
  const { labelStyles: i, nodeStyles: s } = pt(t);
  t.labelStyle = i;
  const { shapeSvg: o, bbox: a } = await xt(e, t, Ct(t)), n = Math.max(a.width + r.labelPaddingX * 2, t?.width || 0), l = Math.max(a.height + r.labelPaddingY * 2, t?.height || 0), c = -n / 2, h = -l / 2;
  let u, { rx: d, ry: f } = t;
  const { cssStyles: m } = t;
  if (r?.rx && r.ry && (d = r.rx, f = r.ry), t.look === "handDrawn") {
    const y = ut.svg(o), x = ct(t, {}), C = d || f ? y.path(qe(c, h, n, l, d || 0), x) : y.rectangle(c, h, n, l, x);
    u = o.insert(() => C, ":first-child"), u.attr("class", "basic label-container").attr("style", te(m));
  } else
    u = o.insert("rect", ":first-child"), u.attr("class", "basic label-container").attr("style", s).attr("rx", te(d)).attr("ry", te(f)).attr("x", c).attr("y", h).attr("width", n).attr("height", l);
  return dt(
    t,
    u,
    t.look === "handDrawn" ? void 0 : { width: n, height: l }
  ), t.calcIntersect = function(y, x) {
    return nt.rect(y, x);
  }, t.intersect = function(y) {
    return nt.rect(t, y);
  }, o;
}
p(qi, "drawRect");
async function Ig(e, t) {
  const { cssClasses: r, labelPaddingX: i, labelPaddingY: s, padding: o, width: a, height: n } = t, l = {
    rx: 0,
    ry: 0,
    labelPaddingX: i ?? (o ?? 0) * 2,
    labelPaddingY: s ?? o ?? 0
  }, c = await qi(e, t, l);
  if (t.look === "handDrawn") {
    const f = ut.svg(c), m = ct(t, {}), y = c.select(".basic.label-container > path:nth-child(2)"), x = y.node();
    if (!x)
      return c;
    let C = null;
    if (x instanceof SVGGraphicsElement)
      C = x.getBBox();
    else
      return c;
    return c.insert(
      () => f.line(C.x, C.y, C.x + C.width, C.y, m),
      ".basic.label-container g.label"
    ), c.insert(
      () => f.line(
        C.x,
        C.y + C.height,
        C.x + C.width,
        C.y + C.height,
        m
      ),
      ".basic.label-container g.label"
    ), y.remove(), c;
  }
  const h = c.select(".basic.label-container"), u = (Number(h.attr("width")) || a) ?? 0, d = (Number(h.attr("height")) || n) ?? 0;
  return u > 0 && d > 0 && h.attr("stroke-dasharray", `${u} ${d}`), c;
}
p(Ig, "datastore");
async function Pg(e, t) {
  const { labelStyles: r, nodeStyles: i } = pt(t);
  t.labelStyle = r;
  const s = t.look === "neo" ? 16 : t.padding ?? 0, o = t.look === "neo" ? 16 : t.padding ?? 0, { shapeSvg: a, bbox: n, label: l } = await xt(e, t, Ct(t)), c = n.width + s, h = n.height + o, u = h * 0.2, d = -c / 2, f = -h / 2 - u / 2, { cssStyles: m } = t, y = ut.svg(a), x = ct(t, {});
  t.look !== "handDrawn" && (x.roughness = 0, x.fillStyle = "solid");
  const C = [
    { x: d, y: f + u },
    { x: -d, y: f + u },
    { x: -d, y: -f },
    { x: d, y: -f },
    { x: d, y: f },
    { x: -d, y: f },
    { x: -d, y: f + u }
  ], k = y.polygon(
    C.map((_) => [_.x, _.y]),
    x
  ), T = a.insert(() => k, ":first-child");
  return T.attr("class", "basic label-container outer-path"), m && t.look !== "handDrawn" && T.selectAll("path").attr("style", m), i && t.look !== "handDrawn" && T.selectAll("path").attr("style", i), l.attr(
    "transform",
    `translate(${d + (t.padding ?? 0) / 2 - (n.x - (n.left ?? 0))}, ${f + u + (t.padding ?? 0) / 2 - (n.y - (n.top ?? 0))})`
  ), dt(t, T), t.intersect = function(_) {
    return nt.rect(t, _);
  }, a;
}
p(Pg, "dividedRectangle");
async function Rg(e, t) {
  const { labelStyles: r, nodeStyles: i } = pt(t), s = t.look === "neo" ? 12 : 5;
  t.labelStyle = r;
  const o = t.padding ?? 0, a = t.look === "neo" ? 16 : o, { shapeSvg: n, bbox: l } = await xt(e, t, Ct(t)), c = (t?.width ? t?.width / 2 : l.width / 2) + (a ?? 0), h = c - s;
  let u;
  const { cssStyles: d } = t;
  if (t.look === "handDrawn") {
    const f = ut.svg(n), m = ct(t, { roughness: 0.2, strokeWidth: 2.5 }), y = ct(t, { roughness: 0.2, strokeWidth: 1.5 }), x = f.circle(0, 0, c * 2, m), C = f.circle(0, 0, h * 2, y);
    u = n.insert("g", ":first-child"), u.attr("class", te(t.cssClasses)).attr("style", te(d)), u.node()?.appendChild(x), u.node()?.appendChild(C);
  } else {
    u = n.insert("g", ":first-child");
    const f = u.insert("circle", ":first-child"), m = u.insert("circle");
    u.attr("class", "basic label-container").attr("style", i), f.attr("class", "outer-circle").attr("style", i).attr("r", c).attr("cx", 0).attr("cy", 0), m.attr("class", "inner-circle").attr("style", i).attr("r", h).attr("cx", 0).attr("cy", 0);
  }
  return dt(t, u), t.intersect = function(f) {
    return R.info("DoubleCircle intersect", t, c, f), nt.circle(t, c, f);
  }, n;
}
p(Rg, "doublecircle");
function Ng(e, t, { config: { themeVariables: r } }) {
  const { labelStyles: i, nodeStyles: s } = pt(t);
  t.label = "", t.labelStyle = i;
  const o = e.insert("g").attr("class", Ct(t)).attr("id", t.domId ?? t.id), a = 7, { cssStyles: n } = t, l = ut.svg(o), { nodeBorder: c } = r, h = ct(t, { fillStyle: "solid" });
  t.look !== "handDrawn" && (h.roughness = 0);
  const u = l.circle(0, 0, a * 2, h), d = o.insert(() => u, ":first-child");
  return d.selectAll("path").attr("style", `fill: ${c} !important;`), n && n.length > 0 && t.look !== "handDrawn" && d.selectAll("path").attr("style", n), s && t.look !== "handDrawn" && d.selectAll("path").attr("style", s), dt(t, d), t.intersect = function(f) {
    return R.info("filledCircle intersect", t, { radius: a, point: f }), nt.circle(t, a, f);
  }, o;
}
p(Ng, "filledCircle");
var Au = 10, Eu = 10;
async function qg(e, t) {
  const { labelStyles: r, nodeStyles: i } = pt(t);
  t.labelStyle = r;
  const s = t.padding ?? 0, o = t.look === "neo" ? s * 2 : s;
  (t.width || t.height) && (t.height = t?.height ?? 0, t.height < Au && (t.height = Au), t.width = (t?.width ?? 0) - o - o / 2, t.width < Eu && (t.width = Eu));
  const { shapeSvg: a, bbox: n, label: l } = await xt(e, t, Ct(t)), c = (t?.width ? t?.width : n.width) + (o ?? 0), h = t?.height ? t?.height : c + n.height, u = h, d = [
    { x: 0, y: -h },
    { x: u, y: -h },
    { x: u / 2, y: 0 }
  ], { cssStyles: f } = t, m = ut.svg(a), y = ct(t, {});
  t.look !== "handDrawn" && (y.roughness = 0, y.fillStyle = "solid");
  const x = Pt(d), C = m.path(x, y), k = a.insert(() => C, ":first-child").attr("transform", `translate(${-h / 2}, ${h / 2})`).attr("class", "outer-path");
  return f && t.look !== "handDrawn" && k.selectChildren("path").attr("style", f), i && t.look !== "handDrawn" && k.selectChildren("path").attr("style", i), t.width = c, t.height = h, dt(t, k), l.attr(
    "transform",
    `translate(${-n.width / 2 - (n.x - (n.left ?? 0))}, ${-h / 2 + (t.padding ?? 0) / 2 + (n.y - (n.top ?? 0))})`
  ), t.intersect = function(T) {
    return R.info("Triangle intersect", t, d, T), nt.polygon(t, d, T);
  }, a;
}
p(qg, "flippedTriangle");
async function zg(e, t) {
  const { labelStyles: r, nodeStyles: i } = pt(t);
  t.labelStyle = r;
  const { shapeSvg: s, bbox: o, label: a } = await xt(e, t, Ct(t)), n = t.padding ?? 12, l = Math.max(o.width + n * 2, t.width ?? 0, 90), c = o.height + n * 2, h = Math.max(Math.min(c * 0.16, 14), 8), u = Math.max(c + h, t.height ?? 0), d = u - h, f = Math.max(l * 0.38, 28), m = -u / 2, y = [
    { x: -l / 2, y: m },
    { x: -l / 2 + f, y: m },
    { x: -l / 2 + f, y: m + h },
    { x: l / 2, y: m + h },
    { x: l / 2, y: u / 2 },
    { x: -l / 2, y: u / 2 }
  ], x = [
    `M${y[0].x},${y[0].y}`,
    ...y.slice(1).map((_) => `L${_.x},${_.y}`),
    "Z"
  ].join(" "), { cssStyles: C } = t;
  let k;
  if (t.look === "handDrawn") {
    const v = ut.svg(s).path(x, ct(t, {}));
    k = s.insert(() => v, ":first-child").attr("class", "basic label-container"), C && k.attr("style", C);
  } else
    k = s.insert("path", ":first-child").attr("d", x).attr("class", "basic label-container").attr("style", i);
  t.look === "handDrawn" ? dt(t, k) : dt(t, k, { width: l, height: u });
  const T = m + h + d / 2;
  return a.attr(
    "transform",
    `translate(${-(o.width / 2) - (o.x - (o.left ?? 0))}, ${T - o.height / 2 - (o.y - (o.top ?? 0))})`
  ), t.intersect = function(_) {
    return nt.polygon(t, y, _);
  }, s;
}
p(zg, "folder");
function Wg(e, t, { dir: r, config: { state: i, themeVariables: s } }) {
  const { nodeStyles: o } = pt(t);
  t.label = "";
  const a = e.insert("g").attr("class", Ct(t)).attr("id", t.domId ?? t.id), { cssStyles: n } = t;
  let l = Math.max(70, t?.width ?? 0), c = Math.max(10, t?.height ?? 0);
  r === "LR" && (l = Math.max(10, t?.width ?? 0), c = Math.max(70, t?.height ?? 0));
  const h = -1 * l / 2, u = -1 * c / 2, d = ut.svg(a), f = ct(t, {
    stroke: s.lineColor,
    fill: s.lineColor
  });
  t.look !== "handDrawn" && (f.roughness = 0, f.fillStyle = "solid");
  const m = d.rectangle(h, u, l, c, f), y = a.insert(() => m, ":first-child");
  n && t.look !== "handDrawn" && y.selectAll("path").attr("style", n), o && t.look !== "handDrawn" && y.selectAll("path").attr("style", o), dt(t, y);
  const x = i?.padding ?? 0;
  return t.width && t.height && (t.width += x / 2 || 0, t.height += x / 2 || 0), t.intersect = function(C) {
    return nt.rect(t, C);
  }, a;
}
p(Wg, "forkJoin");
async function Hg(e, t) {
  const { labelStyles: r, nodeStyles: i } = pt(t);
  t.labelStyle = r;
  const s = 15, o = 10, a = t.look === "neo" ? 16 : t.padding ?? 0, n = t.look === "neo" ? 12 : t.padding ?? 0;
  (t.width || t.height) && (t.height = (t?.height ?? 0) - n * 2, t.height < o && (t.height = o), t.width = (t?.width ?? 0) - a * 2, t.width < s && (t.width = s));
  const { shapeSvg: l, bbox: c } = await xt(e, t, Ct(t)), h = (t?.width ? t?.width : Math.max(s, c.width)) + a * 2, u = (t?.height ? t?.height : Math.max(o, c.height)) + n * 2, d = u / 2, { cssStyles: f } = t, m = ut.svg(l), y = ct(t, {});
  t.look !== "handDrawn" && (y.roughness = 0, y.fillStyle = "solid");
  const x = [
    { x: -h / 2, y: -u / 2 },
    { x: h / 2 - d, y: -u / 2 },
    ...sr(-h / 2 + d, 0, d, 50, 90, 270),
    { x: h / 2 - d, y: u / 2 },
    { x: -h / 2, y: u / 2 }
  ], C = Pt(x), k = m.path(C, y), T = l.insert(() => k, ":first-child");
  return T.attr("class", "basic label-container outer-path"), f && t.look !== "handDrawn" && T.selectChildren("path").attr("style", f), i && t.look !== "handDrawn" && T.selectChildren("path").attr("style", i), dt(t, T), t.intersect = function(_) {
    return R.info("Pill intersect", t, { radius: d, point: _ }), nt.polygon(t, x, _);
  }, l;
}
p(Hg, "halfRoundedRectangle");
var ES = /* @__PURE__ */ p((e, t, r, i, s) => [
  `M${e + s},${t}`,
  `L${e + r - s},${t}`,
  `L${e + r},${t - i / 2}`,
  `L${e + r - s},${t - i}`,
  `L${e + s},${t - i}`,
  `L${e},${t - i / 2}`,
  "Z"
].join(" "), "createHexagonPathD");
async function Yg(e, t) {
  const { labelStyles: r, nodeStyles: i } = pt(t), s = t.look === "neo" ? 3.5 : 4;
  t.labelStyle = r;
  const o = t.padding ?? 0, a = 70, n = 32, l = t.look === "neo" ? a : o, c = t.look === "neo" ? n : o;
  if (t.width || t.height) {
    const T = (t.height ?? 0) / s;
    t.width = (t?.width ?? 0) - 2 * T - c, t.height = (t.height ?? 0) - l;
  }
  const { shapeSvg: h, bbox: u } = await xt(e, t, Ct(t)), d = (t?.height ? t?.height : u.height) + l, f = d / s, m = (t?.width ? t?.width : u.width) + 2 * f + c, y = [
    { x: f, y: 0 },
    { x: m - f, y: 0 },
    { x: m, y: -d / 2 },
    { x: m - f, y: -d },
    { x: f, y: -d },
    { x: 0, y: -d / 2 }
  ];
  let x;
  const { cssStyles: C } = t;
  if (t.look === "handDrawn") {
    const k = ut.svg(h), T = ct(t, {}), _ = ES(0, 0, m, d, f), v = k.path(_, T);
    x = h.insert(() => v, ":first-child").attr("transform", `translate(${-m / 2}, ${d / 2})`), C && x.attr("style", C);
  } else
    x = dr(h, m, d, y);
  return i && x.attr("style", i), t.width = m, t.height = d, dt(t, x), t.intersect = function(k) {
    return nt.polygon(t, y, k);
  }, h;
}
p(Yg, "hexagon");
async function Ug(e, t) {
  const { labelStyles: r, nodeStyles: i } = pt(t);
  t.label = "", t.labelStyle = r;
  const { shapeSvg: s } = await xt(e, t, Ct(t)), o = Math.max(30, t?.width ?? 0), a = Math.max(30, t?.height ?? 0), { cssStyles: n } = t, l = ut.svg(s), c = ct(t, {});
  t.look !== "handDrawn" && (c.roughness = 0, c.fillStyle = "solid");
  const h = [
    { x: 0, y: 0 },
    { x: o, y: 0 },
    { x: 0, y: a },
    { x: o, y: a }
  ], u = Pt(h), d = l.path(u, c), f = s.insert(() => d, ":first-child");
  return f.attr("class", "basic label-container outer-path"), n && t.look !== "handDrawn" && f.selectChildren("path").attr("style", n), i && t.look !== "handDrawn" && f.selectChildren("path").attr("style", i), f.attr("transform", `translate(${-o / 2}, ${-a / 2})`), dt(t, f), t.intersect = function(m) {
    return R.info("Pill intersect", t, { points: h }), nt.polygon(t, h, m);
  }, s;
}
p(Ug, "hourglass");
async function jg(e, t, { config: { themeVariables: r, flowchart: i } }) {
  const { labelStyles: s } = pt(t);
  t.labelStyle = s;
  const o = t.assetHeight ?? 48, a = t.assetWidth ?? 48, n = Math.max(o, a), l = i?.wrappingWidth;
  t.width = Math.max(n, l ?? 0);
  const { shapeSvg: c, bbox: h, label: u } = await xt(e, t, "icon-shape default"), d = t.pos === "t", f = n, m = n, { nodeBorder: y } = r, { stylesMap: x } = Ni(t), C = -m / 2, k = -f / 2, T = t.label ? 8 : 0, _ = ut.svg(c), v = ct(t, { stroke: "none", fill: "none" });
  t.look !== "handDrawn" && (v.roughness = 0, v.fillStyle = "solid");
  const L = _.rectangle(C, k, m, f, v), A = Math.max(m, h.width), F = f + h.height + T, G = _.rectangle(-A / 2, -F / 2, A, F, {
    ...v,
    fill: "transparent",
    stroke: "none"
  }), Y = c.insert(() => L, ":first-child"), N = c.insert(() => G);
  if (t.icon) {
    const st = c.append("g");
    st.html(
      `<g>${await Ns(t.icon, {
        height: n,
        width: n,
        fallbackPrefix: ""
      })}</g>`
    );
    const U = st.node().getBBox(), O = U.width, D = U.height, B = U.x, q = U.y;
    st.attr(
      "transform",
      `translate(${-O / 2 - B},${d ? h.height / 2 + T / 2 - D / 2 - q : -h.height / 2 - T / 2 - D / 2 - q})`
    ), st.attr("style", `color: ${x.get("stroke") ?? y};`);
  }
  return u.attr(
    "transform",
    `translate(${-h.width / 2 - (h.x - (h.left ?? 0))},${d ? -F / 2 : F / 2 - h.height})`
  ), Y.attr(
    "transform",
    `translate(0,${d ? h.height / 2 + T / 2 : -h.height / 2 - T / 2})`
  ), dt(t, N), t.intersect = function(st) {
    if (R.info("iconSquare intersect", t, st), !t.label)
      return nt.rect(t, st);
    const U = t.x ?? 0, O = t.y ?? 0, D = t.height ?? 0;
    let B = [];
    return d ? B = [
      { x: U - h.width / 2, y: O - D / 2 },
      { x: U + h.width / 2, y: O - D / 2 },
      { x: U + h.width / 2, y: O - D / 2 + h.height + T },
      { x: U + m / 2, y: O - D / 2 + h.height + T },
      { x: U + m / 2, y: O + D / 2 },
      { x: U - m / 2, y: O + D / 2 },
      { x: U - m / 2, y: O - D / 2 + h.height + T },
      { x: U - h.width / 2, y: O - D / 2 + h.height + T }
    ] : B = [
      { x: U - m / 2, y: O - D / 2 },
      { x: U + m / 2, y: O - D / 2 },
      { x: U + m / 2, y: O - D / 2 + f },
      { x: U + h.width / 2, y: O - D / 2 + f },
      { x: U + h.width / 2 / 2, y: O + D / 2 },
      { x: U - h.width / 2, y: O + D / 2 },
      { x: U - h.width / 2, y: O - D / 2 + f },
      { x: U - m / 2, y: O - D / 2 + f }
    ], nt.polygon(t, B, st);
  }, c;
}
p(jg, "icon");
async function Gg(e, t, { config: { themeVariables: r, flowchart: i } }) {
  const { labelStyles: s } = pt(t);
  t.labelStyle = s;
  const o = t.assetHeight ?? 48, a = t.assetWidth ?? 48, n = Math.max(o, a), l = i?.wrappingWidth;
  t.width = Math.max(n, l ?? 0);
  const { shapeSvg: c, bbox: h, label: u } = await xt(e, t, "icon-shape default"), d = 20, f = t.label ? 8 : 0, m = t.pos === "t", { nodeBorder: y, mainBkg: x } = r, { stylesMap: C } = Ni(t), k = ut.svg(c), T = ct(t, {});
  t.look !== "handDrawn" && (T.roughness = 0, T.fillStyle = "solid");
  const _ = C.get("fill");
  T.stroke = _ ?? x;
  const v = c.append("g");
  t.icon && v.html(
    `<g>${await Ns(t.icon, {
      height: n,
      width: n,
      fallbackPrefix: ""
    })}</g>`
  );
  const L = v.node().getBBox(), A = L.width, F = L.height, G = L.x, Y = L.y, N = Math.max(A, F) * Math.SQRT2 + d * 2, st = k.circle(0, 0, N, T), U = Math.max(N, h.width), O = N + h.height + f, D = k.rectangle(-U / 2, -O / 2, U, O, {
    ...T,
    fill: "transparent",
    stroke: "none"
  }), B = c.insert(() => st, ":first-child"), q = c.insert(() => D);
  return v.attr(
    "transform",
    `translate(${-A / 2 - G},${m ? h.height / 2 + f / 2 - F / 2 - Y : -h.height / 2 - f / 2 - F / 2 - Y})`
  ), v.attr("style", `color: ${C.get("stroke") ?? y};`), u.attr(
    "transform",
    `translate(${-h.width / 2 - (h.x - (h.left ?? 0))},${m ? -O / 2 : O / 2 - h.height})`
  ), B.attr(
    "transform",
    `translate(0,${m ? h.height / 2 + f / 2 : -h.height / 2 - f / 2})`
  ), dt(t, q), t.intersect = function(I) {
    return R.info("iconSquare intersect", t, I), nt.rect(t, I);
  }, c;
}
p(Gg, "iconCircle");
async function Xg(e, t, { config: { themeVariables: r, flowchart: i } }) {
  const { labelStyles: s } = pt(t);
  t.labelStyle = s;
  const o = t.assetHeight ?? 48, a = t.assetWidth ?? 48, n = Math.max(o, a), l = i?.wrappingWidth;
  t.width = Math.max(n, l ?? 0);
  const { shapeSvg: c, bbox: h, halfPadding: u, label: d } = await xt(
    e,
    t,
    "icon-shape default"
  ), f = t.pos === "t", m = n + u * 2, y = n + u * 2, { nodeBorder: x, mainBkg: C } = r, { stylesMap: k } = Ni(t), T = -y / 2, _ = -m / 2, v = t.label ? 8 : 0, L = ut.svg(c), A = ct(t, {});
  t.look !== "handDrawn" && (A.roughness = 0, A.fillStyle = "solid");
  const F = k.get("fill");
  A.stroke = F ?? C;
  const G = L.path(qe(T, _, y, m, 5), A), Y = Math.max(y, h.width), N = m + h.height + v, st = L.rectangle(-Y / 2, -N / 2, Y, N, {
    ...A,
    fill: "transparent",
    stroke: "none"
  }), U = c.insert(() => G, ":first-child").attr("class", "icon-shape2"), O = c.insert(() => st);
  if (t.icon) {
    const D = c.append("g");
    D.html(
      `<g>${await Ns(t.icon, {
        height: n,
        width: n,
        fallbackPrefix: ""
      })}</g>`
    );
    const B = D.node().getBBox(), q = B.width, I = B.height, it = B.x, Q = B.y;
    D.attr(
      "transform",
      `translate(${-q / 2 - it},${f ? h.height / 2 + v / 2 - I / 2 - Q : -h.height / 2 - v / 2 - I / 2 - Q})`
    ), D.attr("style", `color: ${k.get("stroke") ?? x};`);
  }
  return d.attr(
    "transform",
    `translate(${-h.width / 2 - (h.x - (h.left ?? 0))},${f ? -N / 2 : N / 2 - h.height})`
  ), U.attr(
    "transform",
    `translate(0,${f ? h.height / 2 + v / 2 : -h.height / 2 - v / 2})`
  ), dt(t, O), t.intersect = function(D) {
    if (R.info("iconSquare intersect", t, D), !t.label)
      return nt.rect(t, D);
    const B = t.x ?? 0, q = t.y ?? 0, I = t.height ?? 0;
    let it = [];
    return f ? it = [
      { x: B - h.width / 2, y: q - I / 2 },
      { x: B + h.width / 2, y: q - I / 2 },
      { x: B + h.width / 2, y: q - I / 2 + h.height + v },
      { x: B + y / 2, y: q - I / 2 + h.height + v },
      { x: B + y / 2, y: q + I / 2 },
      { x: B - y / 2, y: q + I / 2 },
      { x: B - y / 2, y: q - I / 2 + h.height + v },
      { x: B - h.width / 2, y: q - I / 2 + h.height + v }
    ] : it = [
      { x: B - y / 2, y: q - I / 2 },
      { x: B + y / 2, y: q - I / 2 },
      { x: B + y / 2, y: q - I / 2 + m },
      { x: B + h.width / 2, y: q - I / 2 + m },
      { x: B + h.width / 2 / 2, y: q + I / 2 },
      { x: B - h.width / 2, y: q + I / 2 },
      { x: B - h.width / 2, y: q - I / 2 + m },
      { x: B - y / 2, y: q - I / 2 + m }
    ], nt.polygon(t, it, D);
  }, c;
}
p(Xg, "iconRounded");
async function Vg(e, t, { config: { themeVariables: r, flowchart: i } }) {
  const { labelStyles: s } = pt(t);
  t.labelStyle = s;
  const o = t.assetHeight ?? 48, a = t.assetWidth ?? 48, n = Math.max(o, a), l = i?.wrappingWidth;
  t.width = Math.max(n, l ?? 0);
  const { shapeSvg: c, bbox: h, halfPadding: u, label: d } = await xt(
    e,
    t,
    "icon-shape default"
  ), f = t.pos === "t", m = n + u * 2, y = n + u * 2, { nodeBorder: x, mainBkg: C } = r, { stylesMap: k } = Ni(t), T = -y / 2, _ = -m / 2, v = t.label ? 8 : 0, L = ut.svg(c), A = ct(t, {});
  t.look !== "handDrawn" && (A.roughness = 0, A.fillStyle = "solid");
  const F = k.get("fill");
  A.stroke = F ?? C;
  const G = L.path(qe(T, _, y, m, 0.1), A), Y = Math.max(y, h.width), N = m + h.height + v, st = L.rectangle(-Y / 2, -N / 2, Y, N, {
    ...A,
    fill: "transparent",
    stroke: "none"
  }), U = c.insert(() => G, ":first-child"), O = c.insert(() => st);
  if (t.icon) {
    const D = c.append("g");
    D.html(
      `<g>${await Ns(t.icon, {
        height: n,
        width: n,
        fallbackPrefix: ""
      })}</g>`
    );
    const B = D.node().getBBox(), q = B.width, I = B.height, it = B.x, Q = B.y;
    D.attr(
      "transform",
      `translate(${-q / 2 - it},${f ? h.height / 2 + v / 2 - I / 2 - Q : -h.height / 2 - v / 2 - I / 2 - Q})`
    ), D.attr("style", `color: ${k.get("stroke") ?? x};`);
  }
  return d.attr(
    "transform",
    `translate(${-h.width / 2 - (h.x - (h.left ?? 0))},${f ? -N / 2 : N / 2 - h.height})`
  ), U.attr(
    "transform",
    `translate(0,${f ? h.height / 2 + v / 2 : -h.height / 2 - v / 2})`
  ), dt(t, O), t.intersect = function(D) {
    if (R.info("iconSquare intersect", t, D), !t.label)
      return nt.rect(t, D);
    const B = t.x ?? 0, q = t.y ?? 0, I = t.height ?? 0;
    let it = [];
    return f ? it = [
      { x: B - h.width / 2, y: q - I / 2 },
      { x: B + h.width / 2, y: q - I / 2 },
      { x: B + h.width / 2, y: q - I / 2 + h.height + v },
      { x: B + y / 2, y: q - I / 2 + h.height + v },
      { x: B + y / 2, y: q + I / 2 },
      { x: B - y / 2, y: q + I / 2 },
      { x: B - y / 2, y: q - I / 2 + h.height + v },
      { x: B - h.width / 2, y: q - I / 2 + h.height + v }
    ] : it = [
      { x: B - y / 2, y: q - I / 2 },
      { x: B + y / 2, y: q - I / 2 },
      { x: B + y / 2, y: q - I / 2 + m },
      { x: B + h.width / 2, y: q - I / 2 + m },
      { x: B + h.width / 2 / 2, y: q + I / 2 },
      { x: B - h.width / 2, y: q + I / 2 },
      { x: B - h.width / 2, y: q - I / 2 + m },
      { x: B - y / 2, y: q - I / 2 + m }
    ], nt.polygon(t, it, D);
  }, c;
}
p(Vg, "iconSquare");
async function Zg(e, t, { config: { flowchart: r } }) {
  const i = new Image();
  i.src = t?.img ?? "", await i.decode();
  const s = Number(i.naturalWidth.toString().replace("px", "")), o = Number(i.naturalHeight.toString().replace("px", ""));
  t.imageAspectRatio = s / o;
  const { labelStyles: a } = pt(t);
  t.labelStyle = a;
  const n = r?.wrappingWidth;
  t.defaultWidth = r?.wrappingWidth;
  const l = Math.max(
    t.label ? n ?? 0 : 0,
    t?.assetWidth ?? s
  ), c = t.constraint === "on" && t?.assetHeight ? t.assetHeight * t.imageAspectRatio : l, h = t.constraint === "on" ? c / t.imageAspectRatio : t?.assetHeight ?? o;
  t.width = Math.max(c, n ?? 0);
  const { shapeSvg: u, bbox: d, label: f } = await xt(e, t, "image-shape default"), m = t.pos === "t", y = -c / 2, x = -h / 2, C = t.label ? 8 : 0, k = ut.svg(u), T = ct(t, {});
  t.look !== "handDrawn" && (T.roughness = 0, T.fillStyle = "solid");
  const _ = k.rectangle(y, x, c, h, T), v = Math.max(c, d.width), L = h + d.height + C, A = k.rectangle(-v / 2, -L / 2, v, L, {
    ...T,
    fill: "none",
    stroke: "none"
  }), F = u.insert(() => _, ":first-child"), G = u.insert(() => A);
  if (t.img) {
    const Y = u.append("image");
    Y.attr("href", t.img), Y.attr("width", c), Y.attr("height", h), Y.attr("preserveAspectRatio", "none"), Y.attr(
      "transform",
      `translate(${-c / 2},${m ? L / 2 - h : -L / 2})`
    );
  }
  return f.attr(
    "transform",
    `translate(${-d.width / 2 - (d.x - (d.left ?? 0))},${m ? -h / 2 - d.height / 2 - C / 2 : h / 2 - d.height / 2 + C / 2})`
  ), F.attr(
    "transform",
    `translate(0,${m ? d.height / 2 + C / 2 : -d.height / 2 - C / 2})`
  ), dt(t, G), t.intersect = function(Y) {
    if (R.info("iconSquare intersect", t, Y), !t.label)
      return nt.rect(t, Y);
    const N = t.x ?? 0, st = t.y ?? 0, U = t.height ?? 0;
    let O = [];
    return m ? O = [
      { x: N - d.width / 2, y: st - U / 2 },
      { x: N + d.width / 2, y: st - U / 2 },
      { x: N + d.width / 2, y: st - U / 2 + d.height + C },
      { x: N + c / 2, y: st - U / 2 + d.height + C },
      { x: N + c / 2, y: st + U / 2 },
      { x: N - c / 2, y: st + U / 2 },
      { x: N - c / 2, y: st - U / 2 + d.height + C },
      { x: N - d.width / 2, y: st - U / 2 + d.height + C }
    ] : O = [
      { x: N - c / 2, y: st - U / 2 },
      { x: N + c / 2, y: st - U / 2 },
      { x: N + c / 2, y: st - U / 2 + h },
      { x: N + d.width / 2, y: st - U / 2 + h },
      { x: N + d.width / 2 / 2, y: st + U / 2 },
      { x: N - d.width / 2, y: st + U / 2 },
      { x: N - d.width / 2, y: st - U / 2 + h },
      { x: N - c / 2, y: st - U / 2 + h }
    ], nt.polygon(t, O, Y);
  }, u;
}
p(Zg, "imageSquare");
async function Kg(e, t) {
  const { labelStyles: r, nodeStyles: i } = pt(t);
  t.labelStyle = r;
  const s = t.padding ?? 0, o = s, a = t.look === "neo" ? s * 2 : s, { shapeSvg: n, bbox: l } = await xt(e, t, Ct(t)), c = Math.max(l.height + o * 2, t.height ?? 0), h = Math.max(l.width + a * 2, (t.width ?? 0) - c), u = [
    { x: 0, y: 0 },
    { x: h, y: 0 },
    { x: h + 3 * c / 6, y: -c },
    { x: -3 * c / 6, y: -c }
  ];
  let d;
  const { cssStyles: f } = t;
  if (t.look === "handDrawn") {
    const m = ut.svg(n), y = ct(t, {}), x = Pt(u), C = m.path(x, y);
    d = n.insert(() => C, ":first-child").attr("transform", `translate(${-h / 2}, ${c / 2})`), f && d.attr("style", f);
  } else
    d = dr(n, h, c, u);
  return i && d.attr("style", i), t.width = h, t.height = c, dt(t, d), t.intersect = function(m) {
    return nt.polygon(t, u, m);
  }, n;
}
p(Kg, "inv_trapezoid");
async function Qg(e, t) {
  const { shapeSvg: r, bbox: i, label: s } = await xt(e, t, "label"), o = r.insert("rect", ":first-child");
  return o.attr("width", 0.1).attr("height", 0.1), r.attr("class", "label edgeLabel"), s.attr(
    "transform",
    `translate(${-(i.width / 2) - (i.x - (i.left ?? 0))}, ${-(i.height / 2) - (i.y - (i.top ?? 0))})`
  ), dt(t, o), t.intersect = function(l) {
    return nt.rect(t, l);
  }, r;
}
p(Qg, "labelRect");
async function Jg(e, t) {
  const { labelStyles: r, nodeStyles: i } = pt(t);
  t.labelStyle = r;
  const s = t.padding ?? 0, o = s, a = t.look === "neo" ? s * 2 : s, { shapeSvg: n, bbox: l } = await xt(e, t, Ct(t)), c = Math.max(l.height + o, t.height ?? 0), h = Math.max(l.width + a, (t.width ?? 0) - c), u = [
    { x: 0, y: 0 },
    { x: h + 3 * c / 6, y: 0 },
    { x: h, y: -c },
    { x: -(3 * c) / 6, y: -c }
  ];
  let d;
  const { cssStyles: f } = t;
  if (t.look === "handDrawn") {
    const m = ut.svg(n), y = ct(t, {}), x = Pt(u), C = m.path(x, y);
    d = n.insert(() => C, ":first-child").attr("transform", `translate(${-h / 2}, ${c / 2})`), f && d.attr("style", f);
  } else
    d = dr(n, h, c, u);
  return i && d.attr("style", i), t.width = h, t.height = c, dt(t, d), t.intersect = function(m) {
    return nt.polygon(t, u, m);
  }, n;
}
p(Jg, "lean_left");
async function tm(e, t) {
  const { labelStyles: r, nodeStyles: i } = pt(t);
  t.labelStyle = r;
  const s = t.padding ?? 0, o = s, a = t.look === "neo" ? s * 2 : s, { shapeSvg: n, bbox: l } = await xt(e, t, Ct(t)), c = Math.max(l.height + o, t.height ?? 0), h = Math.max(l.width + a, (t.width ?? 0) - c), u = [
    { x: -3 * c / 6, y: 0 },
    { x: h, y: 0 },
    { x: h + 3 * c / 6, y: -c },
    { x: 0, y: -c }
  ];
  let d;
  const { cssStyles: f } = t;
  if (t.look === "handDrawn") {
    const m = ut.svg(n), y = ct(t, {}), x = Pt(u), C = m.path(x, y);
    d = n.insert(() => C, ":first-child").attr("transform", `translate(${-h / 2}, ${c / 2})`), f && d.attr("style", f);
  } else
    d = dr(n, h, c, u);
  return i && d.attr("style", i), t.width = h, t.height = c, dt(t, d), t.intersect = function(m) {
    return nt.polygon(t, u, m);
  }, n;
}
p(tm, "lean_right");
function em(e, t) {
  const { labelStyles: r, nodeStyles: i } = pt(t);
  t.label = "", t.labelStyle = r;
  const s = e.insert("g").attr("class", Ct(t)).attr("id", t.domId ?? t.id), { cssStyles: o } = t, a = Math.max(35, t?.width ?? 0), n = Math.max(35, t?.height ?? 0), l = 7, c = [
    { x: a, y: 0 },
    { x: 0, y: n + l / 2 },
    { x: a - 2 * l, y: n + l / 2 },
    { x: 0, y: 2 * n },
    { x: a, y: n - l / 2 },
    { x: 2 * l, y: n - l / 2 }
  ], h = ut.svg(s), u = ct(t, {});
  t.look !== "handDrawn" && (u.roughness = 0, u.fillStyle = "solid");
  const d = Pt(c), f = h.path(d, u), m = s.insert(() => f, ":first-child");
  return m.attr("class", "outer-path"), o && t.look !== "handDrawn" && m.selectAll("path").attr("style", o), i && t.look !== "handDrawn" && m.selectAll("path").attr("style", i), m.attr("transform", `translate(-${a / 2},${-n})`), dt(t, m), t.intersect = function(y) {
    return R.info("lightningBolt intersect", t, y), nt.polygon(t, c, y);
  }, s;
}
p(em, "lightningBolt");
var MS = /* @__PURE__ */ p((e, t, r, i, s, o, a) => [
  `M${e},${t + o}`,
  `a${s},${o} 0,0,0 ${r},0`,
  `a${s},${o} 0,0,0 ${-r},0`,
  `l0,${i}`,
  `a${s},${o} 0,0,0 ${r},0`,
  `l0,${-i}`,
  `M${e},${t + o + a}`,
  `a${s},${o} 0,0,0 ${r},0`
].join(" "), "createCylinderPathD"), $S = /* @__PURE__ */ p((e, t, r, i, s, o, a) => [
  `M${e},${t + o}`,
  `M${e + r},${t + o}`,
  `a${s},${o} 0,0,0 ${-r},0`,
  `l0,${i}`,
  `a${s},${o} 0,0,0 ${r},0`,
  `l0,${-i}`,
  `M${e},${t + o + a}`,
  `a${s},${o} 0,0,0 ${r},0`
].join(" "), "createOuterCylinderPathD"), OS = /* @__PURE__ */ p((e, t, r, i, s, o) => [`M${e - r / 2},${-i / 2}`, `a${s},${o} 0,0,0 ${r},0`].join(" "), "createInnerCylinderPathD"), Mu = 10, $u = 10;
async function rm(e, t) {
  const { labelStyles: r, nodeStyles: i } = pt(t);
  t.labelStyle = r;
  const s = t.padding ?? 0, o = t.look === "neo" ? 16 : s, a = t.look === "neo" ? 24 : s;
  if (t.width || t.height) {
    const C = t.width ?? 0;
    t.width = (t.width ?? 0) - o, t.width < $u && (t.width = $u);
    const T = C / 2 / (2.5 + C / 50);
    t.height = (t.height ?? 0) - a - T * 3, t.height < Mu && (t.height = Mu);
  }
  const { shapeSvg: n, bbox: l, label: c } = await xt(e, t, Ct(t)), h = (t?.width ? t?.width : l.width) + o * 2, u = h / 2, d = u / (2.5 + h / 50), f = (t?.height ? t?.height : l.height) + d + a * 2, m = f * 0.1;
  let y;
  const { cssStyles: x } = t;
  if (t.look === "handDrawn") {
    const C = ut.svg(n), k = $S(0, 0, h, f, u, d, m), T = OS(0, d, h, f, u, d), _ = ct(t, {}), v = C.path(k, _), L = C.path(T, _);
    n.insert(() => L, ":first-child").attr("class", "line"), y = n.insert(() => v, ":first-child"), y.attr("class", "basic label-container"), x && y.attr("style", x);
  } else {
    const C = MS(0, 0, h, f, u, d, m);
    y = n.insert("path", ":first-child").attr("d", C).attr("class", "basic label-container outer-path").attr("style", te(x)).attr("style", i);
  }
  return y.attr("label-offset-y", d), y.attr("transform", `translate(${-h / 2}, ${-(f / 2 + d)})`), dt(t, y), c.attr(
    "transform",
    `translate(${-(l.width / 2) - (l.x - (l.left ?? 0))}, ${-(l.height / 2) + d - (l.y - (l.top ?? 0))})`
  ), t.intersect = function(C) {
    const k = nt.rect(t, C), T = k.x - (t.x ?? 0);
    if (u != 0 && (Math.abs(T) < (t.width ?? 0) / 2 || Math.abs(T) == (t.width ?? 0) / 2 && Math.abs(k.y - (t.y ?? 0)) > (t.height ?? 0) / 2 - d)) {
      let _ = d * d * (1 - T * T / (u * u));
      _ > 0 && (_ = Math.sqrt(_)), _ = d - _, C.y - (t.y ?? 0) > 0 && (_ = -_), k.y += _;
    }
    return k;
  }, n;
}
p(rm, "linedCylinder");
async function im(e, t) {
  const { labelStyles: r, nodeStyles: i } = pt(t);
  t.labelStyle = r;
  const s = t.padding ?? 0, o = t.look === "neo" ? 16 : s, a = t.look === "neo" ? 12 : s;
  if (t.width || t.height) {
    const _ = t.width;
    t.width = (_ ?? 0) * 10 / 11 - o * 2, t.width < 10 && (t.width = 10), t.height = (t?.height ?? 0) - a * 2, t.height < 10 && (t.height = 10);
  }
  const { shapeSvg: n, bbox: l, label: c } = await xt(e, t, Ct(t)), h = (t?.width ? t?.width : l.width) + (o ?? 0) * 2, u = (t?.height ? t?.height : l.height) + (a ?? 0) * 2, d = t.look === "neo" ? u / 4 : u / 8, f = u + d, { cssStyles: m } = t, y = ut.svg(n), x = ct(t, {});
  t.look !== "handDrawn" && (x.roughness = 0, x.fillStyle = "solid");
  const C = [
    { x: -h / 2 - h / 2 * 0.1, y: -f / 2 },
    { x: -h / 2 - h / 2 * 0.1, y: f / 2 },
    ...Hr(
      -h / 2 - h / 2 * 0.1,
      f / 2,
      h / 2 + h / 2 * 0.1,
      f / 2,
      d,
      0.8
    ),
    { x: h / 2 + h / 2 * 0.1, y: -f / 2 },
    { x: -h / 2 - h / 2 * 0.1, y: -f / 2 },
    { x: -h / 2, y: -f / 2 },
    { x: -h / 2, y: f / 2 * 1.1 },
    { x: -h / 2, y: -f / 2 }
  ], k = y.polygon(
    C.map((_) => [_.x, _.y]),
    x
  ), T = n.insert(() => k, ":first-child");
  return T.attr("class", "basic label-container outer-path"), m && t.look !== "handDrawn" && T.selectAll("path").attr("style", m), i && t.look !== "handDrawn" && T.selectAll("path").attr("style", i), T.attr("transform", `translate(0,${-d / 2})`), c.attr(
    "transform",
    `translate(${-h / 2 + (t.padding ?? 0) + h / 2 * 0.1 / 2 - (l.x - (l.left ?? 0))},${-u / 2 + (t.padding ?? 0) - d / 2 - (l.y - (l.top ?? 0))})`
  ), dt(t, T), t.intersect = function(_) {
    return nt.polygon(t, C, _);
  }, n;
}
p(im, "linedWaveEdgedRect");
async function sm(e, t) {
  const { labelStyles: r, nodeStyles: i } = pt(t);
  t.labelStyle = r;
  const s = t.padding ?? 0, o = t.look === "neo" ? 16 : s, a = t.look === "neo" ? 12 : s, n = t.look === "neo" ? 10 : 5;
  (t.width || t.height) && (t.width = Math.max((t?.width ?? 0) - o * 2 - 2 * n, 10), t.height = Math.max((t?.height ?? 0) - a * 2 - 2 * n, 10));
  const { shapeSvg: l, bbox: c, label: h } = await xt(e, t, Ct(t)), u = (t?.width ? t?.width : c.width) + o * 2 + 2 * n, d = (t?.height ? t?.height : c.height) + a * 2 + 2 * n, f = u - 2 * n, m = d - 2 * n, y = -f / 2, x = -m / 2, { cssStyles: C } = t, k = ut.svg(l), T = ct(t, {}), _ = [
    { x: y - n, y: x + n },
    { x: y - n, y: x + m + n },
    { x: y + f - n, y: x + m + n },
    { x: y + f - n, y: x + m },
    { x: y + f, y: x + m },
    { x: y + f, y: x + m - n },
    { x: y + f + n, y: x + m - n },
    { x: y + f + n, y: x - n },
    { x: y + n, y: x - n },
    { x: y + n, y: x },
    { x: y, y: x },
    { x: y, y: x + n }
  ], v = [
    { x: y, y: x + n },
    { x: y + f - n, y: x + n },
    { x: y + f - n, y: x + m },
    { x: y + f, y: x + m },
    { x: y + f, y: x },
    { x: y, y: x }
  ];
  t.look !== "handDrawn" && (T.roughness = 0, T.fillStyle = "solid");
  const L = Pt(_);
  let A = k.path(L, T);
  const F = Pt(v);
  let G = k.path(F, T);
  t.look !== "handDrawn" && (A = il(A), G = il(G));
  const Y = l.insert("g", ":first-child");
  return Y.insert(() => A), Y.insert(() => G), Y.attr("class", "basic label-container outer-path"), C && t.look !== "handDrawn" && Y.selectAll("path").attr("style", C), i && t.look !== "handDrawn" && Y.selectAll("path").attr("style", i), h.attr(
    "transform",
    `translate(${-(c.width / 2) - n - (c.x - (c.left ?? 0))}, ${-(c.height / 2) + n - (c.y - (c.top ?? 0))})`
  ), dt(t, Y), t.intersect = function(N) {
    return nt.polygon(t, _, N);
  }, l;
}
p(sm, "multiRect");
async function om(e, t) {
  const { labelStyles: r, nodeStyles: i } = pt(t);
  t.labelStyle = r;
  const { shapeSvg: s, bbox: o, label: a } = await xt(e, t, Ct(t)), n = t.padding ?? 0, l = t.look === "neo" ? 16 : n, c = t.look === "neo" ? 12 : n;
  let h = !0;
  (t.width || t.height) && (h = !1, t.width = (t?.width ?? 0) - l * 2, t.height = (t?.height ?? 0) - c * 3);
  const u = Math.max(o.width, t?.width ?? 0) + l * 2, d = Math.max(o.height, t?.height ?? 0) + c * 3, f = t.look === "neo" ? d / 4 : d / 8, m = d + (h ? f / 2 : -f / 2), y = -u / 2, x = -m / 2, C = 10, { cssStyles: k } = t, T = Hr(
    y - C,
    x + m + C,
    y + u - C,
    x + m + C,
    f,
    0.8
  ), _ = T?.[T.length - 1], v = [
    { x: y - C, y: x + C },
    { x: y - C, y: x + m + C },
    ...T,
    { x: y + u - C, y: _.y - C },
    { x: y + u, y: _.y - C },
    { x: y + u, y: _.y - 2 * C },
    { x: y + u + C, y: _.y - 2 * C },
    { x: y + u + C, y: x - C },
    { x: y + C, y: x - C },
    { x: y + C, y: x },
    { x: y, y: x },
    { x: y, y: x + C }
  ], L = [
    { x: y, y: x + C },
    { x: y + u - C, y: x + C },
    { x: y + u - C, y: _.y - C },
    { x: y + u, y: _.y - C },
    { x: y + u, y: x },
    { x: y, y: x }
  ], A = ut.svg(s), F = ct(t, {});
  t.look !== "handDrawn" && (F.roughness = 0, F.fillStyle = "solid");
  const G = Pt(v), Y = A.path(G, F), N = Pt(L), st = A.path(N, F), U = s.insert(() => Y, ":first-child");
  return U.insert(() => st), U.attr("class", "basic label-container outer-path"), k && t.look !== "handDrawn" && U.selectAll("path").attr("style", k), i && t.look !== "handDrawn" && U.selectAll("path").attr("style", i), U.attr("transform", `translate(0,${-f / 2})`), a.attr(
    "transform",
    `translate(${-(o.width / 2) - C - (o.x - (o.left ?? 0))}, ${-(o.height / 2) + C - f / 2 - (o.y - (o.top ?? 0))})`
  ), dt(t, U), t.intersect = function(O) {
    return nt.polygon(t, v, O);
  }, s;
}
p(om, "multiWaveEdgedRectangle");
async function am(e, t, { config: { themeVariables: r } }) {
  const { labelStyles: i, nodeStyles: s } = pt(t);
  t.labelStyle = i, t.useHtmlLabels || ge(Xt()) || (t.centerLabel = !0);
  const { shapeSvg: a, bbox: n, label: l } = await xt(e, t, Ct(t)), c = Math.max(n.width + (t.padding ?? 0) * 2, t?.width ?? 0), h = Math.max(n.height + (t.padding ?? 0) * 2, t?.height ?? 0), u = -c / 2, d = -h / 2, { cssStyles: f } = t, m = ut.svg(a), y = ct(t, {
    fill: r.noteBkgColor,
    stroke: r.noteBorderColor
  });
  t.look !== "handDrawn" && (y.roughness = 0, y.fillStyle = "solid");
  const x = m.rectangle(u, d, c, h, y), C = a.insert(() => x, ":first-child");
  return C.attr("class", "basic label-container outer-path"), l.attr("class", "label noteLabel"), f && t.look !== "handDrawn" && C.selectAll("path").attr("style", f), s && t.look !== "handDrawn" && C.selectAll("path").attr("style", s), l.attr(
    "transform",
    `translate(${-n.width / 2 - (n.x - (n.left ?? 0))}, ${-(n.height / 2) - (n.y - (n.top ?? 0))})`
  ), dt(t, C), t.intersect = function(k) {
    return nt.rect(t, k);
  }, a;
}
p(am, "note");
var DS = /* @__PURE__ */ p((e, t, r) => [
  `M${e + r / 2},${t}`,
  `L${e + r},${t - r / 2}`,
  `L${e + r / 2},${t - r}`,
  `L${e},${t - r / 2}`,
  "Z"
].join(" "), "createDecisionBoxPathD");
async function nm(e, t) {
  const { labelStyles: r, nodeStyles: i } = pt(t);
  t.labelStyle = r;
  const { shapeSvg: s, bbox: o } = await xt(e, t, Ct(t)), a = o.width + (t.padding ?? 0), n = o.height + (t.padding ?? 0), l = a + n, c = 0.5, h = [
    { x: l / 2, y: 0 },
    { x: l, y: -l / 2 },
    { x: l / 2, y: -l },
    { x: 0, y: -l / 2 }
  ];
  let u;
  const { cssStyles: d } = t;
  if (t.look === "handDrawn") {
    const f = ut.svg(s), m = ct(t, {}), y = DS(0, 0, l), x = f.path(y, m);
    u = s.insert(() => x, ":first-child").attr("transform", `translate(${-l / 2 + c}, ${l / 2})`), d && u.attr("style", d);
  } else
    u = dr(s, l, l, h), u.attr("transform", `translate(${-l / 2 + c}, ${l / 2})`);
  return i && u.attr("style", i), dt(t, u), t.calcIntersect = function(f, m) {
    const y = f.width, x = [
      { x: y / 2, y: 0 },
      { x: y, y: -y / 2 },
      { x: y / 2, y: -y },
      { x: 0, y: -y / 2 }
    ], C = nt.polygon(f, x, m);
    return { x: C.x - 0.5, y: C.y - 0.5 };
  }, t.intersect = function(f) {
    return this.calcIntersect(t, f);
  }, s;
}
p(nm, "question");
async function lm(e, t) {
  const { labelStyles: r, nodeStyles: i } = pt(t);
  t.labelStyle = r;
  const s = t.padding ?? 0, o = t.look === "neo" ? 21 : s ?? 0, a = t.look === "neo" ? 12 : s ?? 0, { shapeSvg: n, bbox: l, label: c } = await xt(e, t, Ct(t)), h = l.width + (t.look === "neo" ? o * 2 : o), u = Math.max(
    l.height + (t.look === "neo" ? a * 2 : a),
    t.height ?? 0
  ), d = u / 4, m = -Math.max(h, (t.width ?? 0) - d) / 2, y = -u / 2, x = y / 2, C = [
    { x: m + x, y },
    { x: m, y: 0 },
    { x: m + x, y: -y },
    { x: -m, y: -y },
    { x: -m, y }
  ], { cssStyles: k } = t, T = ut.svg(n), _ = ct(t, {});
  t.look !== "handDrawn" && (_.roughness = 0, _.fillStyle = "solid");
  const v = Pt(C), L = T.path(v, _), A = n.insert(() => L, ":first-child");
  return A.attr("class", "basic label-container outer-path"), k && t.look !== "handDrawn" && A.selectAll("path").attr("style", k), i && t.look !== "handDrawn" && A.selectAll("path").attr("style", i), A.attr("transform", `translate(${-x / 2},0)`), c.attr(
    "transform",
    `translate(${-x / 2 - l.width / 2 - (l.x - (l.left ?? 0))}, ${-(l.height / 2) - (l.y - (l.top ?? 0))})`
  ), dt(t, A), t.intersect = function(F) {
    return nt.polygon(t, C, F);
  }, n;
}
p(lm, "rect_left_inv_arrow");
async function hm(e, t) {
  const { labelStyles: r, nodeStyles: i } = pt(t);
  t.labelStyle = r;
  let s;
  t.cssClasses ? s = "node " + t.cssClasses : s = "node default";
  const o = e.insert("g").attr("class", s).attr("id", t.domId || t.id), a = o.insert("g"), n = o.insert("g").attr("class", "label").attr("style", i), l = t.description, c = t.label, h = await Pr(n, c, t.labelStyle, !0, !0);
  let u = { width: 0, height: 0 };
  if (ge($t())) {
    const F = h.children[0], G = At(h);
    u = F.getBoundingClientRect(), G.attr("width", u.width), G.attr("height", u.height);
  }
  R.info("Text 2", l);
  const d = l || [], f = h.getBBox(), m = await Pr(
    n,
    Array.isArray(d) ? d.join("<br/>") : d,
    t.labelStyle,
    !0,
    !0
  ), y = m.children[0], x = At(m);
  u = y.getBoundingClientRect(), x.attr("width", u.width), x.attr("height", u.height);
  const C = (t.padding || 0) / 2;
  At(m).attr(
    "transform",
    "translate( " + (u.width > f.width ? 0 : (f.width - u.width) / 2) + ", " + (f.height + C + 5) + ")"
  ), At(h).attr(
    "transform",
    "translate( " + (u.width < f.width ? 0 : -(f.width - u.width) / 2) + ", 0)"
  ), u = n.node().getBBox(), n.attr(
    "transform",
    "translate(" + -u.width / 2 + ", " + (-u.height / 2 - C + 3) + ")"
  );
  const k = u.width + (t.padding || 0), T = u.height + (t.padding || 0), _ = -u.width / 2 - C, v = -u.height / 2 - C;
  let L, A;
  if (t.look === "handDrawn") {
    const F = ut.svg(o), G = ct(t, {}), Y = F.path(
      qe(_, v, k, T, t.rx || 0),
      G
    ), N = F.line(
      -u.width / 2 - C,
      -u.height / 2 - C + f.height + C,
      u.width / 2 + C,
      -u.height / 2 - C + f.height + C,
      G
    );
    A = o.insert(() => (R.debug("Rough node insert CXC", Y), N), ":first-child"), L = o.insert(() => (R.debug("Rough node insert CXC", Y), Y), ":first-child");
  } else
    L = a.insert("rect", ":first-child"), A = a.insert("line"), L.attr("class", "outer title-state").attr("style", i).attr("x", -u.width / 2 - C).attr("y", -u.height / 2 - C).attr("width", u.width + (t.padding || 0)).attr("height", u.height + (t.padding || 0)), A.attr("class", "divider").attr("x1", -u.width / 2 - C).attr("x2", u.width / 2 + C).attr("y1", -u.height / 2 - C + f.height + C).attr("y2", -u.height / 2 - C + f.height + C);
  return dt(t, L), t.intersect = function(F) {
    return nt.rect(t, F);
  }, o;
}
p(hm, "rectWithTitle");
async function cm(e, t, { config: { themeVariables: r } }) {
  const i = r?.radius ?? 5, s = {
    rx: i,
    ry: i,
    labelPaddingX: (t?.padding ?? 0) * 1,
    labelPaddingY: (t?.padding ?? 0) * 1
  };
  return qi(e, t, s);
}
p(cm, "roundedRect");
var Ur = 8;
async function um(e, t) {
  const { labelStyles: r, nodeStyles: i } = pt(t);
  t.labelStyle = r;
  const s = t.look === "neo" ? 16 : t.padding ?? 0, o = t.look === "neo" ? 12 : t.padding ?? 0, { shapeSvg: a, bbox: n, label: l } = await xt(e, t, Ct(t)), c = (t?.width ?? n.width) + s * 2 + (t.look === "neo" ? Ur : Ur * 2), h = (t?.height ?? n.height) + o * 2, u = c - Ur, d = h, f = Ur - c / 2, m = -h / 2, { cssStyles: y } = t, x = ut.svg(a), C = ct(t, {});
  t.look !== "handDrawn" && (C.roughness = 0, C.fillStyle = "solid");
  const k = [
    { x: f, y: m },
    { x: f + u, y: m },
    { x: f + u, y: m + d },
    { x: f - Ur, y: m + d },
    { x: f - Ur, y: m },
    { x: f, y: m },
    { x: f, y: m + d }
  ], T = x.polygon(
    k.map((v) => [v.x, v.y]),
    C
  ), _ = a.insert(() => T, ":first-child");
  return _.attr("class", "basic label-container outer-path").attr("style", te(y)), i && t.look !== "handDrawn" && _.selectAll("path").attr("style", i), y && t.look !== "handDrawn" && _.selectAll("path").attr("style", i), l.attr(
    "transform",
    `translate(${Ur / 2 - n.width / 2 - (n.x - (n.left ?? 0))}, ${-(n.height / 2) - (n.y - (n.top ?? 0))})`
  ), dt(t, _), t.intersect = function(v) {
    return nt.rect(t, v);
  }, a;
}
p(um, "shadedProcess");
async function dm(e, t) {
  const { labelStyles: r, nodeStyles: i } = pt(t);
  t.labelStyle = r;
  const s = t.padding ?? 0, o = t.look === "neo" ? 16 : s, a = t.look === "neo" ? 12 : s;
  (t.width || t.height) && (t.width = Math.max((t?.width ?? 0) - o * 2, 10), t.height = Math.max((t?.height ?? 0) / 1.5 - a * 2, 10));
  const { shapeSvg: n, bbox: l, label: c } = await xt(e, t, Ct(t)), h = (t?.width ? t?.width : l.width) + o * 2, u = ((t?.height ? t?.height : l.height) + a * 2) * 1.5, d = h, f = u / 1.5, m = -d / 2, y = -f / 2, { cssStyles: x } = t, C = ut.svg(n), k = ct(t, {});
  t.look !== "handDrawn" && (k.roughness = 0, k.fillStyle = "solid");
  const T = [
    { x: m, y },
    { x: m, y: y + f },
    { x: m + d, y: y + f },
    { x: m + d, y: y - f / 2 }
  ], _ = Pt(T), v = C.path(_, k), L = n.insert(() => v, ":first-child");
  return L.attr("class", "basic label-container  outer-path"), x && t.look !== "handDrawn" && L.selectChildren("path").attr("style", x), i && t.look !== "handDrawn" && L.selectChildren("path").attr("style", i), L.attr("transform", `translate(0, ${f / 4})`), c.attr(
    "transform",
    `translate(${-d / 2 + (t.padding ?? 0) - (l.x - (l.left ?? 0))}, ${-f / 4 + (t.padding ?? 0) - (l.y - (l.top ?? 0))})`
  ), dt(t, L), t.intersect = function(A) {
    return nt.polygon(t, T, A);
  }, n;
}
p(dm, "slopedRect");
async function fm(e, t) {
  const r = t.padding ?? 0, i = t.look === "neo" ? 16 : r * 2, s = t.look === "neo" ? 12 : r, o = {
    rx: 0,
    ry: 0,
    labelPaddingX: t.labelPaddingX ?? i,
    labelPaddingY: s
  };
  return qi(e, t, o);
}
p(fm, "squareRect");
async function pm(e, t) {
  const { labelStyles: r, nodeStyles: i } = pt(t);
  t.labelStyle = r;
  const s = t.padding ?? 0, o = t.look === "neo" ? 20 : s, a = t.look === "neo" ? 12 : s, { shapeSvg: n, bbox: l } = await xt(e, t, Ct(t)), c = l.height + (t.look === "neo" ? a * 2 : a), h = l.width + c / 4 + (t.look === "neo" ? o * 2 : o), u = c / 2, { cssStyles: d } = t, f = ut.svg(n), m = ct(t, {});
  t.look !== "handDrawn" && (m.roughness = 0, m.fillStyle = "solid");
  const y = [
    { x: -h / 2 + u, y: -c / 2 },
    { x: h / 2 - u, y: -c / 2 },
    ...sr(-h / 2 + u, 0, u, 50, 90, 270),
    { x: h / 2 - u, y: c / 2 },
    ...sr(h / 2 - u, 0, u, 50, 270, 450)
  ], x = Pt(y), C = f.path(x, m), k = n.insert(() => C, ":first-child");
  return k.attr("class", "basic label-container outer-path"), d && t.look !== "handDrawn" && k.selectChildren("path").attr("style", d), i && t.look !== "handDrawn" && k.selectChildren("path").attr("style", i), dt(t, k), t.intersect = function(T) {
    return nt.polygon(t, y, T);
  }, n;
}
p(pm, "stadium");
async function gm(e, t) {
  const r = {
    rx: t.look === "neo" ? 3 : 5,
    ry: t.look === "neo" ? 3 : 5
  };
  return qi(e, t, r);
}
p(gm, "state");
function mm(e, t, { config: { themeVariables: r } }) {
  const { labelStyles: i, nodeStyles: s } = pt(t);
  t.labelStyle = i;
  const { cssStyles: o } = t, { lineColor: a, stateBorder: n, nodeBorder: l, nodeShadow: c } = r;
  (t.width || t.height) && ((t.width ?? 0) < 14 && (t.width = 14), (t.height ?? 0) < 14 && (t.height = 14)), t.width || (t.width = 14), t.height || (t.height = 14);
  const h = e.insert("g").attr("class", "node default").attr("id", t.domId ?? t.id), u = ut.svg(h), d = ct(t, {});
  t.look !== "handDrawn" && (d.roughness = 0, d.fillStyle = "solid");
  const f = u.circle(0, 0, t.width, {
    ...d,
    stroke: a,
    strokeWidth: 2
  }), m = n ?? l, y = (t.width ?? 0) * 5 / 14, x = u.circle(0, 0, y, {
    ...d,
    fill: m,
    stroke: m,
    strokeWidth: 2,
    fillStyle: "solid"
  }), C = h.insert(() => f, ":first-child");
  if (C.insert(() => x), t.look !== "handDrawn" && C.attr("class", "outer-path"), o && C.selectAll("path").attr("style", o), s && C.selectAll("path").attr("style", s), t.width < 25 && c && t.look !== "handDrawn") {
    const k = e.node()?.ownerSVGElement?.id ?? "", T = k ? `${k}-drop-shadow-small` : "drop-shadow-small";
    C.attr("style", `filter:url(#${T})`);
  }
  return dt(t, C), t.intersect = function(k) {
    return nt.circle(t, (t.width ?? 0) / 2, k);
  }, h;
}
p(mm, "stateEnd");
function ym(e, t, { config: { themeVariables: r } }) {
  const { lineColor: i, nodeShadow: s } = r;
  (t.width || t.height) && ((t.width ?? 0) < 14 && (t.width = 14), (t.height ?? 0) < 14 && (t.height = 14)), t.width || (t.width = 14), t.height || (t.height = 14);
  const o = e.insert("g").attr("class", "node default").attr("id", t.domId || t.id);
  let a;
  if (t.look === "handDrawn") {
    const l = ut.svg(o).circle(0, 0, t.width, D2(i));
    a = o.insert(() => l), a.attr("class", "state-start").attr("r", (t.width ?? 7) / 2).attr("width", t.width ?? 14).attr("height", t.height ?? 14);
  } else
    a = o.insert("circle", ":first-child"), a.attr("class", "state-start").attr("r", (t.width ?? 7) / 2).attr("width", t.width ?? 14).attr("height", t.height ?? 14);
  if (t.width < 25 && s && t.look !== "handDrawn") {
    const n = e.node()?.ownerSVGElement?.id ?? "", l = n ? `${n}-drop-shadow-small` : "drop-shadow-small";
    a.attr("style", `filter:url(#${l})`);
  }
  return dt(t, a), t.intersect = function(n) {
    return nt.circle(t, (t.width ?? 7) / 2, n);
  }, o;
}
p(ym, "stateStart");
var ki = 8;
async function xm(e, t) {
  const { labelStyles: r, nodeStyles: i } = pt(t);
  t.labelStyle = r;
  const s = t?.padding ?? 8, o = t.look === "neo" ? 28 : s, a = t.look === "neo" ? 12 : s, { shapeSvg: n, bbox: l } = await xt(e, t, Ct(t)), c = Math.max(l.width + 2 * ki + o, t.width ?? 0), h = Math.max(l.height + a, t.height ?? 0), u = c - 2 * ki, d = h, f = -c / 2, m = -h / 2, y = [
    { x: 0, y: 0 },
    { x: u, y: 0 },
    { x: u, y: -d },
    { x: 0, y: -d },
    { x: 0, y: 0 },
    { x: -8, y: 0 },
    { x: u + 8, y: 0 },
    { x: u + 8, y: -d },
    { x: -8, y: -d },
    { x: -8, y: 0 }
  ];
  if (t.look === "handDrawn") {
    const x = ut.svg(n), C = ct(t, {}), k = x.rectangle(f, m, u + 16, d, C), T = x.line(f + ki, m, f + ki, m + d, C), _ = x.line(f + ki + u, m, f + ki + u, m + d, C);
    n.insert(() => T, ":first-child"), n.insert(() => _, ":first-child");
    const v = n.insert(() => k, ":first-child"), { cssStyles: L } = t;
    v.attr("class", "basic label-container").attr("style", te(L)), dt(t, v);
  } else {
    const x = dr(n, u, d, y);
    i && x.attr("style", i), dt(t, x);
  }
  return t.intersect = function(x) {
    return nt.polygon(t, y, x);
  }, n;
}
p(xm, "subroutine");
var Za = 0.2;
async function Cm(e, t) {
  const { labelStyles: r, nodeStyles: i } = pt(t);
  t.labelStyle = r;
  const s = t.padding ?? 0, o = t.look === "neo" ? 16 : s, a = t.look === "neo" ? 12 : s;
  (t.width || t.height) && (t.height = Math.max((t?.height ?? 0) - a * 2, 10), t.width = Math.max(
    (t?.width ?? 0) - o * 2 - Za * (t.height + a * 2),
    10
  ));
  const { shapeSvg: n, bbox: l } = await xt(e, t, Ct(t)), c = (t?.height ? t?.height : l.height) + a * 2, h = Za * c, u = Za * c, f = (t?.width ? t?.width : l.width) + o * 2 + h - h, m = c, y = -f / 2, x = -m / 2, { cssStyles: C } = t, k = ut.svg(n), T = ct(t, {}), _ = [
    { x: y - h / 2, y: x },
    { x: y + f + h / 2, y: x },
    { x: y + f + h / 2, y: x + m },
    { x: y - h / 2, y: x + m }
  ], v = [
    { x: y + f - h / 2, y: x + m },
    { x: y + f + h / 2, y: x + m },
    { x: y + f + h / 2, y: x + m - u }
  ];
  t.look !== "handDrawn" && (T.roughness = 0, T.fillStyle = "solid");
  const L = Pt(_), A = k.path(L, T), F = Pt(v), G = k.path(F, { ...T, fillStyle: "solid" }), Y = n.insert(() => G, ":first-child");
  return Y.insert(() => A, ":first-child"), Y.attr("class", "basic label-container outer-path"), C && t.look !== "handDrawn" && Y.selectAll("path").attr("style", C), i && t.look !== "handDrawn" && Y.selectAll("path").attr("style", i), dt(t, Y), t.intersect = function(N) {
    return nt.polygon(t, _, N);
  }, n;
}
p(Cm, "taggedRect");
async function bm(e, t) {
  const { labelStyles: r, nodeStyles: i } = pt(t);
  t.labelStyle = r;
  const { shapeSvg: s, bbox: o, label: a } = await xt(e, t, Ct(t)), n = Math.max(o.width + (t.padding ?? 0) * 2, t?.width ?? 0), l = Math.max(o.height + (t.padding ?? 0) * 2, t?.height ?? 0), c = l / 8, h = 0.2 * n, u = 0.2 * l, d = l + c, { cssStyles: f } = t, m = ut.svg(s), y = ct(t, {});
  t.look !== "handDrawn" && (y.roughness = 0, y.fillStyle = "solid");
  const x = [
    { x: -n / 2 - n / 2 * 0.1, y: d / 2 },
    ...Hr(
      -n / 2 - n / 2 * 0.1,
      d / 2,
      n / 2 + n / 2 * 0.1,
      d / 2,
      c,
      0.8
    ),
    { x: n / 2 + n / 2 * 0.1, y: -d / 2 },
    { x: -n / 2 - n / 2 * 0.1, y: -d / 2 }
  ], C = -n / 2 + n / 2 * 0.1, k = -d / 2 - u * 0.4, T = [
    { x: C + n - h, y: (k + l) * 1.3 },
    { x: C + n, y: k + l - u },
    { x: C + n, y: (k + l) * 0.9 },
    ...Hr(
      C + n,
      (k + l) * 1.25,
      C + n - h,
      (k + l) * 1.3,
      -l * 0.02,
      0.5
    )
  ], _ = Pt(x), v = m.path(_, y), L = Pt(T), A = m.path(L, {
    ...y,
    fillStyle: "solid"
  }), F = s.insert(() => A, ":first-child");
  return F.insert(() => v, ":first-child"), F.attr("class", "basic label-container outer-path"), f && t.look !== "handDrawn" && F.selectAll("path").attr("style", f), i && t.look !== "handDrawn" && F.selectAll("path").attr("style", i), F.attr("transform", `translate(0,${-c / 2})`), a.attr(
    "transform",
    `translate(${-n / 2 + (t.padding ?? 0) - (o.x - (o.left ?? 0))},${-l / 2 + (t.padding ?? 0) - c / 2 - (o.y - (o.top ?? 0))})`
  ), dt(t, F), t.intersect = function(G) {
    return nt.polygon(t, x, G);
  }, s;
}
p(bm, "taggedWaveEdgedRectangle");
async function km(e, t) {
  const { labelStyles: r, nodeStyles: i } = pt(t);
  t.labelStyle = r;
  const { shapeSvg: s, bbox: o } = await xt(e, t, Ct(t)), a = Math.max(o.width + (t.padding ?? 0), t?.width || 0), n = Math.max(o.height + (t.padding ?? 0), t?.height || 0), l = -a / 2, c = -n / 2, h = s.insert("rect", ":first-child");
  return h.attr("class", "text").attr("style", i).attr("rx", 0).attr("ry", 0).attr("x", l).attr("y", c).attr("width", a).attr("height", n), dt(t, h), t.intersect = function(u) {
    return nt.rect(t, u);
  }, s;
}
p(km, "text");
var IS = /* @__PURE__ */ p((e, t, r, i, s, o) => `M${e},${t}
    a${s},${o} 0,0,1 0,${-i}
    l${r},0
    a${s},${o} 0,0,1 0,${i}
    M${r},${-i}
    a${s},${o} 0,0,0 0,${i}
    l${-r},0`, "createCylinderPathD"), PS = /* @__PURE__ */ p((e, t, r, i, s, o) => [
  `M${e},${t}`,
  `M${e + r},${t}`,
  `a${s},${o} 0,0,0 0,${-i}`,
  `l${-r},0`,
  `a${s},${o} 0,0,0 0,${i}`,
  `l${r},0`
].join(" "), "createOuterCylinderPathD"), RS = /* @__PURE__ */ p((e, t, r, i, s, o) => [`M${e + r / 2},${-i / 2}`, `a${s},${o} 0,0,0 0,${i}`].join(" "), "createInnerCylinderPathD"), Ou = 5, Du = 10;
async function wm(e, t) {
  const { labelStyles: r, nodeStyles: i } = pt(t);
  t.labelStyle = r;
  const s = t.padding ?? 0, o = t.look === "neo" ? 12 : s / 2, a = t.height ?? 0;
  if (t.height && (t.height = t.height - o, t.height < Ou && (t.height = Ou)), t.width) {
    const C = a / 2 / (2.5 + a / 50);
    t.width = t.width - o - C * 3, t.width < Du && (t.width = Du);
  }
  const { shapeSvg: n, bbox: l, label: c } = await xt(e, t, Ct(t)), h = Math.max(t.height ?? 0, l.height) + o, u = h / 2, d = u / (2.5 + h / 50), f = Math.max(t.width ?? 0, l.width) + d + o, { cssStyles: m } = t;
  let y;
  if (t.look === "handDrawn") {
    const x = ut.svg(n), C = PS(0, 0, f, h, d, u), k = RS(0, 0, f, h, d, u), T = x.path(C, ct(t, {})), _ = x.path(k, ct(t, { fill: "none" }));
    y = n.insert(() => _, ":first-child"), y = n.insert(() => T, ":first-child"), y.attr("class", "basic label-container"), m && y.attr("style", m);
  } else {
    const x = IS(0, 0, f, h, d, u);
    y = n.insert("path", ":first-child").attr("d", x).attr("class", "basic label-container").attr("style", te(m)).attr("style", i), y.attr("class", "basic label-container outer-path"), m && y.selectAll("path").attr("style", m), i && y.selectAll("path").attr("style", i);
  }
  return y.attr("label-offset-x", d), y.attr("transform", `translate(${-f / 2}, ${h / 2} )`), c.attr(
    "transform",
    `translate(${-(l.width / 2) - d - (l.x - (l.left ?? 0))}, ${-(l.height / 2) - (l.y - (l.top ?? 0))})`
  ), dt(t, y), t.intersect = function(x) {
    const C = nt.rect(t, x), k = C.y - (t.y ?? 0);
    if (u != 0 && (Math.abs(k) < (t.height ?? 0) / 2 || Math.abs(k) == (t.height ?? 0) / 2 && Math.abs(C.x - (t.x ?? 0)) > (t.width ?? 0) / 2 - d)) {
      let T = d * d * (1 - k * k / (u * u));
      T != 0 && (T = Math.sqrt(Math.abs(T))), T = d - T, x.x - (t.x ?? 0) > 0 && (T = -T), C.x += T;
    }
    return C;
  }, n;
}
p(wm, "tiltedCylinder");
async function Tm(e, t) {
  const { labelStyles: r, nodeStyles: i } = pt(t);
  t.labelStyle = r;
  const s = t.padding ?? 0, o = (t.look === "neo", s), a = t.look === "neo" ? s * 2 : s, { shapeSvg: n, bbox: l } = await xt(e, t, Ct(t)), c = Math.max(l.height + o, t.height ?? 0), h = Math.max(l.width + a, (t.width ?? 0) - c), u = [
    { x: -3 * c / 6, y: 0 },
    { x: h + 3 * c / 6, y: 0 },
    { x: h, y: -c },
    { x: 0, y: -c }
  ];
  let d;
  const { cssStyles: f } = t;
  if (t.look === "handDrawn") {
    const m = ut.svg(n), y = ct(t, {}), x = Pt(u), C = m.path(x, y);
    d = n.insert(() => C, ":first-child").attr("transform", `translate(${-h / 2}, ${c / 2})`), f && d.attr("style", f);
  } else
    d = dr(n, h, c, u);
  return i && d.attr("style", i), t.width = h, t.height = c, dt(t, d), t.intersect = function(m) {
    return nt.polygon(t, u, m);
  }, n;
}
p(Tm, "trapezoid");
async function Sm(e, t) {
  const { labelStyles: r, nodeStyles: i } = pt(t);
  t.labelStyle = r;
  const s = t.padding ?? 0, o = t.look === "neo" ? 16 : s, a = t.look === "neo" ? 12 : s, n = 15, l = 5;
  (t.width || t.height) && (t.height = (t.height ?? 0) - a * 2, t.height < l && (t.height = l), t.width = (t.width ?? 0) - o * 2, t.width < n && (t.width = n));
  const { shapeSvg: c, bbox: h } = await xt(e, t, Ct(t)), u = (t?.width ? t?.width : h.width) + o * 2, d = (t?.height ? t?.height : h.height) + a * 2, { cssStyles: f } = t, m = ut.svg(c), y = ct(t, {});
  t.look !== "handDrawn" && (y.roughness = 0, y.fillStyle = "solid");
  const x = [
    { x: -u / 2 * 0.8, y: -d / 2 },
    { x: u / 2 * 0.8, y: -d / 2 },
    { x: u / 2, y: -d / 2 * 0.6 },
    { x: u / 2, y: d / 2 },
    { x: -u / 2, y: d / 2 },
    { x: -u / 2, y: -d / 2 * 0.6 }
  ], C = Pt(x), k = m.path(C, y), T = c.insert(() => k, ":first-child");
  return T.attr("class", "basic label-container outer-path"), f && t.look !== "handDrawn" && T.selectChildren("path").attr("style", f), i && t.look !== "handDrawn" && T.selectChildren("path").attr("style", i), dt(t, T), t.intersect = function(_) {
    return nt.polygon(t, x, _);
  }, c;
}
p(Sm, "trapezoidalPentagon");
var Iu = 10, Pu = 10;
async function _m(e, t) {
  const { labelStyles: r, nodeStyles: i } = pt(t);
  t.labelStyle = r;
  const s = t.padding ?? 0, o = t.look === "neo" ? s * 2 : s;
  (t.width || t.height) && (t.width = ((t?.width ?? 0) - o) / 2, t.width < Pu && (t.width = Pu), t.height = t?.height ?? 0, t.height < Iu && (t.height = Iu));
  const { shapeSvg: a, bbox: n, label: l } = await xt(e, t, Ct(t)), c = cr($t().flowchart?.htmlLabels), h = (t?.width ? t?.width : n.width) + o, u = t?.height ? t?.height : h + n.height, d = u, f = [
    { x: 0, y: 0 },
    { x: d, y: 0 },
    { x: d / 2, y: -u }
  ], { cssStyles: m } = t, y = ut.svg(a), x = ct(t, {});
  t.look !== "handDrawn" && (x.roughness = 0, x.fillStyle = "solid");
  const C = Pt(f), k = y.path(C, x), T = a.insert(() => k, ":first-child").attr("transform", `translate(${-u / 2}, ${u / 2})`).attr("class", "outer-path");
  return m && t.look !== "handDrawn" && T.selectChildren("path").attr("style", m), i && t.look !== "handDrawn" && T.selectChildren("path").attr("style", i), t.width = h, t.height = u, dt(t, T), l.attr(
    "transform",
    `translate(${-n.width / 2 - (n.x - (n.left ?? 0))}, ${u / 2 - (n.height + (t.padding ?? 0) / (c ? 2 : 1) - (n.y - (n.top ?? 0)))})`
  ), t.intersect = function(_) {
    return R.info("Triangle intersect", t, f, _), nt.polygon(t, f, _);
  }, a;
}
p(_m, "triangle");
async function vm(e, t) {
  const { labelStyles: r, nodeStyles: i } = pt(t);
  t.labelStyle = r;
  const s = t.padding ?? 0, o = t.look === "neo" ? 16 : s, a = t.look === "neo" ? 12 : s;
  let n = !0;
  (t.width || t.height) && (n = !1, t.width = (t?.width ?? 0) - o * 2, t.width < 10 && (t.width = 10), t.height = (t?.height ?? 0) - a * 2, t.height < 10 && (t.height = 10));
  const { shapeSvg: l, bbox: c, label: h } = await xt(e, t, Ct(t)), u = (t?.width ? t?.width : c.width) + (o ?? 0) * 2, d = (t?.height ? t?.height : c.height) + (a ?? 0) * 2, f = t.look === "neo" ? d / 4 : d / 8, m = d + (n ? f : -f), { cssStyles: y } = t, C = 14 - u, k = C > 0 ? C / 2 : 0, T = ut.svg(l), _ = ct(t, {});
  t.look !== "handDrawn" && (_.roughness = 0, _.fillStyle = "solid");
  const v = [
    { x: -u / 2 - k, y: m / 2 },
    ...Hr(
      -u / 2 - k,
      m / 2,
      u / 2 + k,
      m / 2,
      f,
      0.8
    ),
    { x: u / 2 + k, y: -m / 2 },
    { x: -u / 2 - k, y: -m / 2 }
  ], L = Pt(v), A = T.path(L, _), F = l.insert(() => A, ":first-child");
  return F.attr("class", "basic label-container outer-path"), y && t.look !== "handDrawn" && F.selectAll("path").attr("style", y), i && t.look !== "handDrawn" && F.selectAll("path").attr("style", i), F.attr("transform", `translate(0,${-f / 2})`), h.attr(
    "transform",
    `translate(${-u / 2 + (t.padding ?? 0) - (c.x - (c.left ?? 0))},${-d / 2 + (t.padding ?? 0) - f - (c.y - (c.top ?? 0))})`
  ), dt(t, F), t.intersect = function(G) {
    return nt.polygon(t, v, G);
  }, l;
}
p(vm, "waveEdgedRectangle");
async function Bm(e, t) {
  const { labelStyles: r, nodeStyles: i } = pt(t);
  t.labelStyle = r;
  const s = t.padding ?? 0, o = t.look === "neo" ? 16 : s, a = t.look === "neo" ? 20 : s;
  if (t.width || t.height) {
    t.width = t?.width ?? 0, t.width < 20 && (t.width = 20), t.height = t?.height ?? 0, t.height < 10 && (t.height = 10);
    const _ = Math.min(t.height * 0.2, t.height / 4);
    t.height = Math.ceil(t.height - a - _ * (20 / 9)), t.width = t.width - o * 2;
  }
  const { shapeSvg: n, bbox: l } = await xt(e, t, Ct(t)), c = (t?.width ? t?.width : l.width) + o * 2, h = (t?.height ? t?.height : l.height) + a, u = h / 8, d = h + u * 2, { cssStyles: f } = t, m = ut.svg(n), y = ct(t, {});
  t.look !== "handDrawn" && (y.roughness = 0, y.fillStyle = "solid");
  const x = [
    { x: -c / 2, y: d / 2 },
    ...Hr(-c / 2, d / 2, c / 2, d / 2, u, 1),
    { x: c / 2, y: -d / 2 },
    ...Hr(c / 2, -d / 2, -c / 2, -d / 2, u, -1)
  ], C = Pt(x), k = m.path(C, y), T = n.insert(() => k, ":first-child");
  return T.attr("class", "basic label-container"), f && t.look !== "handDrawn" && T.selectAll("path").attr("style", f), i && t.look !== "handDrawn" && T.selectAll("path").attr("style", i), dt(t, T), t.intersect = function(_) {
    return nt.polygon(t, x, _);
  }, n;
}
p(Bm, "waveRectangle");
var Zt = 10;
async function Lm(e, t) {
  const { labelStyles: r, nodeStyles: i } = pt(t);
  t.labelStyle = r;
  const s = t.look === "neo" ? 16 : t.padding ?? 0, o = t.look === "neo" ? 12 : t.padding ?? 0;
  (t.width || t.height) && (t.width = Math.max((t?.width ?? 0) - s * 2 - Zt, 10), t.height = Math.max((t?.height ?? 0) - o * 2 - Zt, 10));
  const { shapeSvg: a, bbox: n, label: l } = await xt(e, t, Ct(t)), c = (t?.width ? t?.width : n.width) + s * 2 + Zt, h = (t?.height ? t?.height : n.height) + o * 2 + Zt, u = c - Zt, d = h - Zt, f = -u / 2, m = -d / 2, { cssStyles: y } = t, x = ut.svg(a), C = ct(t, {}), k = [
    { x: f - Zt, y: m - Zt },
    { x: f - Zt, y: m + d },
    { x: f + u, y: m + d },
    { x: f + u, y: m - Zt }
  ], T = `M${f - Zt},${m - Zt} L${f + u},${m - Zt} L${f + u},${m + d} L${f - Zt},${m + d} L${f - Zt},${m - Zt}
                M${f - Zt},${m} L${f + u},${m}
                M${f},${m - Zt} L${f},${m + d}`;
  t.look !== "handDrawn" && (C.roughness = 0, C.fillStyle = "solid");
  const _ = x.path(T, C), v = a.insert(() => _, ":first-child");
  return v.attr("transform", `translate(${Zt / 2}, ${Zt / 2})`), v.attr("class", "basic label-container outer-path"), y && t.look !== "handDrawn" && v.selectAll("path").attr("style", y), i && t.look !== "handDrawn" && v.selectAll("path").attr("style", i), l.attr(
    "transform",
    `translate(${-(n.width / 2) + Zt / 2 - (n.x - (n.left ?? 0))}, ${-(n.height / 2) + Zt / 2 - (n.y - (n.top ?? 0))})`
  ), dt(t, v), t.intersect = function(L) {
    return nt.polygon(t, k, L);
  }, a;
}
p(Lm, "windowPane");
var Ru = /* @__PURE__ */ new Set(["redux-color", "redux-dark-color"]), NS = /* @__PURE__ */ new Set(["redux", "redux-dark", "redux-color", "redux-dark-color"]);
async function hh(e, t) {
  const r = t;
  r.alias && (t.label = r.alias);
  const { theme: i, themeVariables: s } = Xt(), { rowEven: o, rowOdd: a, nodeBorder: n, borderColorArray: l } = s;
  if (t.look === "handDrawn") {
    const { themeVariables: gt } = Xt(), { background: wt } = gt, Et = {
      ...t,
      id: t.id + "-background",
      domId: (t.domId || t.id) + "-background",
      look: "default",
      cssStyles: ["stroke: none", `fill: ${wt}`]
    };
    await hh(e, Et);
  }
  const c = Xt();
  t.useHtmlLabels = c.htmlLabels;
  let h = c.er?.diagramPadding ?? 10, u = c.er?.entityPadding ?? 6;
  const { cssStyles: d } = t, { labelStyles: f, nodeStyles: m } = pt(t);
  if (r.attributes.length === 0 && t.label) {
    const gt = {
      rx: 0,
      ry: 0,
      labelPaddingX: h,
      labelPaddingY: h * 1.5
    };
    Sr(t.label, c) + gt.labelPaddingX * 2 < c.er.minEntityWidth && (t.width = c.er.minEntityWidth);
    const wt = await qi(e, t, gt);
    if (i != null && Ru.has(i)) {
      const Et = r.colorIndex ?? 0;
      wt.attr("data-color-id", `color-${Et % l.length}`);
    }
    if (!cr(c.htmlLabels)) {
      const Et = wt.select("text"), Bt = Et.node()?.getBBox();
      Et.attr("transform", `translate(${-Bt.width / 2}, 0)`);
    }
    return wt;
  }
  c.htmlLabels || (h *= 1.25, u *= 1.25);
  let y = Ct(t);
  y || (y = "node default");
  const x = e.insert("g").attr("class", y).attr("id", t.domId || t.id), C = await Ti(x, t.label ?? "", c, 0, 0, ["name"], f);
  C.height += u;
  let k = 0;
  const T = [], _ = [];
  let v = 0, L = 0, A = 0, F = 0, G = !0, Y = !0;
  for (const gt of r.attributes) {
    const wt = await Ti(
      x,
      gt.type,
      c,
      0,
      k,
      ["attribute-type"],
      f
    );
    v = Math.max(v, wt.width + h);
    const Et = await Ti(
      x,
      gt.name,
      c,
      0,
      k,
      ["attribute-name"],
      f
    );
    L = Math.max(L, Et.width + h);
    const Bt = await Ti(
      x,
      gt.keys.join(),
      c,
      0,
      k,
      ["attribute-keys"],
      f
    );
    A = Math.max(A, Bt.width + h);
    const Nt = await Ti(
      x,
      gt.comment,
      c,
      0,
      k,
      ["attribute-comment"],
      f
    );
    F = Math.max(F, Nt.width + h);
    const zt = Math.max(wt.height, Et.height, Bt.height, Nt.height) + u;
    _.push({ yOffset: k, rowHeight: zt }), k += zt;
  }
  let N = 4;
  A <= h && (G = !1, A = 0, N--), F <= h && (Y = !1, F = 0, N--);
  const st = x.node().getBBox();
  if (C.width + h * 2 - (v + L + A + F) > 0) {
    const gt = C.width + h * 2 - (v + L + A + F);
    v += gt / N, L += gt / N, A > 0 && (A += gt / N), F > 0 && (F += gt / N);
  }
  const U = v + L + A + F, O = ut.svg(x), D = ct(t, {});
  t.look !== "handDrawn" && (D.roughness = 0, D.fillStyle = "solid");
  let B = 0;
  _.length > 0 && (B = _.reduce((gt, wt) => gt + (wt?.rowHeight ?? 0), 0));
  const q = Math.max(st.width + h * 2, t?.width || 0, U), I = Math.max((B ?? 0) + C.height, t?.height || 0), it = -q / 2, Q = -I / 2;
  if (x.selectAll("g:not(:first-child)").each((gt, wt, Et) => {
    const Bt = At(Et[wt]), Nt = Bt.attr("transform");
    let zt = 0, ae = 0;
    if (Nt) {
      const Dt = RegExp(/translate\(([^,]+),([^)]+)\)/).exec(Nt);
      Dt && (zt = parseFloat(Dt[1]), ae = parseFloat(Dt[2]), Bt.attr("class").includes("attribute-name") ? zt += v : Bt.attr("class").includes("attribute-keys") ? zt += v + L : Bt.attr("class").includes("attribute-comment") && (zt += v + L + A));
    }
    Bt.attr(
      "transform",
      `translate(${it + h / 2 + zt}, ${ae + Q + C.height + u / 2})`
    );
  }), x.select(".name").attr("transform", "translate(" + -C.width / 2 + ", " + (Q + u / 2) + ")"), i != null && Ru.has(i)) {
    const gt = r.colorIndex ?? 0;
    x.attr("data-color-id", `color-${gt % l.length}`);
  }
  const mt = O.rectangle(it, Q, q, I, D), St = x.insert(() => mt, ":first-child").attr("class", "outer-path").attr("style", d.join(""));
  T.push(0);
  for (const [gt, wt] of _.entries()) {
    const Bt = (gt + 1) % 2 === 0 && wt.yOffset !== 0, Nt = O.rectangle(it, C.height + Q + wt?.yOffset, q, wt?.rowHeight, {
      ...D,
      fill: Bt ? o : a,
      stroke: n
    });
    x.insert(() => Nt, "g.label").attr("style", d.join("")).attr("class", `row-rect-${Bt ? "even" : "odd"}`);
  }
  const Tt = 1e-4;
  let ft = Si(it, C.height + Q, q + it, C.height + Q, Tt), Lt = O.polygon(
    ft.map((gt) => [gt.x, gt.y]),
    D
  );
  if (x.insert(() => Lt).attr("class", "divider"), ft = Si(v + it, C.height + Q, v + it, I + Q, Tt), Lt = O.polygon(
    ft.map((gt) => [gt.x, gt.y]),
    D
  ), x.insert(() => Lt).attr("class", "divider"), G) {
    const gt = v + L + it;
    ft = Si(gt, C.height + Q, gt, I + Q, Tt), Lt = O.polygon(
      ft.map((wt) => [wt.x, wt.y]),
      D
    ), x.insert(() => Lt).attr("class", "divider");
  }
  if (Y) {
    const gt = v + L + A + it;
    ft = Si(gt, C.height + Q, gt, I + Q, Tt), Lt = O.polygon(
      ft.map((wt) => [wt.x, wt.y]),
      D
    ), x.insert(() => Lt).attr("class", "divider");
  }
  for (const gt of T) {
    const wt = C.height + Q + gt;
    ft = Si(it, wt, q + it, wt, Tt), Lt = O.polygon(
      ft.map((Et) => [Et.x, Et.y]),
      D
    ), x.insert(() => Lt).attr("class", "divider");
  }
  if (dt(t, St), m && t.look !== "handDrawn")
    if (i != null && NS.has(i))
      x.selectAll("path").attr("style", m);
    else {
      const wt = m.split(";")?.filter((Et) => Et.includes("stroke"))?.map((Et) => `${Et}`).join("; ");
      x.selectAll("path").attr("style", wt ?? ""), x.selectAll(".row-rect-even path").attr("style", m);
    }
  return t.intersect = function(gt) {
    return nt.rect(t, gt);
  }, x;
}
p(hh, "erBox");
async function Ti(e, t, r, i = 0, s = 0, o = [], a = "") {
  const n = e.insert("g").attr("class", `label ${o.join(" ")}`).attr("transform", `translate(${i}, ${s})`).attr("style", a);
  t !== Sc(t) && (t = Sc(t), t = t.replaceAll("<", "&lt;").replaceAll(">", "&gt;"));
  const l = n.node().appendChild(
    await Ve(
      n,
      t,
      {
        width: Sr(t, r) + 100,
        style: a,
        useHtmlLabels: r.htmlLabels
      },
      r
    )
  );
  if (t.includes("&lt;") || t.includes("&gt;")) {
    let h = l.children[0];
    for (h.textContent = h.textContent.replaceAll("&lt;", "<").replaceAll("&gt;", ">"); h.childNodes[0]; )
      h = h.childNodes[0], h.textContent = h.textContent.replaceAll("&lt;", "<").replaceAll("&gt;", ">");
  }
  let c = l.getBBox();
  if (cr(r.htmlLabels)) {
    const h = l.children[0];
    h.style.textAlign = "start";
    const u = At(l);
    c = h.getBoundingClientRect(), u.attr("width", c.width), u.attr("height", c.height);
  }
  return c;
}
p(Ti, "addText");
function Si(e, t, r, i, s) {
  return e === r ? [
    { x: e - s / 2, y: t },
    { x: e + s / 2, y: t },
    { x: r + s / 2, y: i },
    { x: r - s / 2, y: i }
  ] : [
    { x: e, y: t - s / 2 },
    { x: e, y: t + s / 2 },
    { x: r, y: i + s / 2 },
    { x: r, y: i - s / 2 }
  ];
}
p(Si, "lineToPolygon");
async function Fm(e, t, r, i, s = r.class.padding ?? 12) {
  const o = i ? 0 : 3, a = e.insert("g").attr("class", Ct(t)).attr("id", t.domId || t.id);
  let n = null, l = null, c = null, h = null, u = 0, d = 0, f = 0;
  if (n = a.insert("g").attr("class", "annotation-group text"), t.annotations.length > 0) {
    const k = t.annotations[0];
    await us(n, { text: `«${k}»` }, 0), u = n.node().getBBox().height;
  }
  l = a.insert("g").attr("class", "label-group text"), await us(l, t, 0, ["font-weight: bolder"]);
  const m = l.node().getBBox();
  d = m.height, c = a.insert("g").attr("class", "members-group text");
  let y = 0;
  for (const k of t.members) {
    const T = await us(c, k, y, [k.parseClassifier()]);
    y += T + o;
  }
  f = c.node().getBBox().height, f <= 0 && (f = s / 2), h = a.insert("g").attr("class", "methods-group text");
  let x = 0;
  for (const k of t.methods) {
    const T = await us(h, k, x, [k.parseClassifier()]);
    x += T + o;
  }
  let C = a.node().getBBox();
  if (n !== null) {
    const k = n.node().getBBox();
    n.attr("transform", `translate(${-k.width / 2})`);
  }
  return l.attr("transform", `translate(${-m.width / 2}, ${u})`), C = a.node().getBBox(), c.attr(
    "transform",
    `translate(0, ${u + d + s * 2})`
  ), C = a.node().getBBox(), h.attr(
    "transform",
    `translate(0, ${u + d + (f ? f + s * 4 : s * 2)})`
  ), C = a.node().getBBox(), { shapeSvg: a, bbox: C };
}
p(Fm, "textHelper");
async function us(e, t, r, i = []) {
  const s = e.insert("g").attr("class", "label").attr("style", i.join("; ")), o = Xt();
  let a = "useHtmlLabels" in t ? t.useHtmlLabels : cr(o.htmlLabels) ?? !0, n = "";
  "text" in t ? n = t.text : n = t.label, !a && n.startsWith("\\") && (n = n.substring(1)), Ts(n) && (a = !0);
  const l = await Ve(
    s,
    Sl(zr(n)),
    {
      width: Sr(n, o) + 50,
      // Add room for error when splitting text into multiple lines
      classes: "markdown-node-label",
      useHtmlLabels: a
    },
    o
  );
  let c, h = 1;
  if (a) {
    const u = l.children[0], d = At(l);
    h = u.innerHTML.split("<br>").length, u.innerHTML.includes("</math>") && (h += u.innerHTML.split("<mrow>").length - 1), await oh(u), c = u.getBoundingClientRect(), d.attr("width", c.width), d.attr("height", c.height);
  } else {
    i.includes("font-weight: bolder") && At(l).selectAll("tspan").attr("font-weight", ""), h = l.children.length;
    const u = l.children[0];
    (l.textContent === "" || l.textContent.includes("&gt")) && (u.textContent = n[0] + n.substring(1).replaceAll("&gt;", ">").replaceAll("&lt;", "<").trim(), n[1] === " " && (u.textContent = u.textContent[0] + " " + u.textContent.substring(1))), u.textContent === "undefined" && (u.textContent = ""), c = l.getBBox();
  }
  return s.attr("transform", "translate(0," + (-c.height / (2 * h) + r) + ")"), c.height;
}
p(us, "addText");
async function Am(e, t) {
  const r = $t(), { themeVariables: i } = r, { useGradient: s } = i, o = r.class.padding ?? 12, a = o, n = t.useHtmlLabels ?? cr(r.htmlLabels) ?? !0, l = t;
  l.annotations = l.annotations ?? [], l.members = l.members ?? [], l.methods = l.methods ?? [];
  const { shapeSvg: c, bbox: h } = await Fm(e, t, r, n, a), { labelStyles: u, nodeStyles: d } = pt(t);
  t.labelStyle = u, t.cssStyles = l.styles || "";
  const f = l.styles?.join(";") || d || "";
  t.cssStyles || (t.cssStyles = f.replaceAll("!important", "").split(";"));
  const m = l.members.length === 0 && l.methods.length === 0 && !r.class?.hideEmptyMembersBox, y = ut.svg(c), x = ct(t, {});
  t.look !== "handDrawn" && (x.roughness = 0, x.fillStyle = "solid");
  const C = Math.max(t.width ?? 0, h.width);
  let k = Math.max(t.height ?? 0, h.height);
  const T = (t.height ?? 0) > h.height;
  l.members.length === 0 && l.methods.length === 0 ? k += a : l.members.length > 0 && l.methods.length === 0 && (k += a * 2);
  const _ = -C / 2, v = -k / 2;
  let L = m ? o * 2 : l.members.length === 0 && l.methods.length === 0 ? -o : 0;
  T && (L = o * 2);
  const A = y.rectangle(
    _ - o,
    v - o - (m ? o : l.members.length === 0 && l.methods.length === 0 ? -o / 2 : 0),
    C + 2 * o,
    k + 2 * o + L,
    x
  ), F = c.insert(() => A, ":first-child");
  F.attr("class", "basic label-container outer-path");
  const G = F.node().getBBox(), Y = c.select(".annotation-group").node().getBBox().height - (m ? o / 2 : 0) || 0, N = c.select(".label-group").node().getBBox().height - (m ? o / 2 : 0) || 0, st = c.select(".members-group").node().getBBox().height - (m ? o / 2 : 0) || 0, U = (Y + N + v + o - (v - o - (m ? o : l.members.length === 0 && l.methods.length === 0 ? -o / 2 : 0))) / 2;
  if (c.selectAll(".text").each((O, D, B) => {
    const q = At(B[D]), I = q.attr("transform");
    let it = 0;
    if (I) {
      const Tt = RegExp(/translate\(([^,]+),([^)]+)\)/).exec(I);
      Tt && (it = parseFloat(Tt[2]));
    }
    let Q = it + v + o - (m ? o : l.members.length === 0 && l.methods.length === 0 ? -o / 2 : 0);
    if (q.attr("class").includes("methods-group")) {
      const St = Math.max(st, a / 2);
      T ? Q = Math.max(
        U,
        Y + N + St + v + a * 2 + o
      ) + a * 2 : Q = Y + N + St + v + a * 4 + o;
    }
    l.members.length === 0 && l.methods.length === 0 && r.class?.hideEmptyMembersBox && (l.annotations.length > 0 ? Q = it - a : Q = it), n || (Q -= 4);
    let mt = _;
    (q.attr("class").includes("label-group") || q.attr("class").includes("annotation-group")) && (mt = -q.node()?.getBBox().width / 2 || 0, c.selectAll("text").each(function(St, Tt, ft) {
      window.getComputedStyle(ft[Tt]).textAnchor === "middle" && (mt = 0);
    })), q.attr("transform", `translate(${mt}, ${Q})`);
  }), l.members.length > 0 || l.methods.length > 0 || m) {
    const O = Y + N + v + o, D = y.line(
      G.x,
      O,
      G.x + G.width,
      O + 1e-3,
      x
    );
    c.insert(() => D).attr("class", `divider${t.look === "neo" && !s ? " neo-line" : ""}`).attr("style", f);
  }
  if (m || l.members.length > 0 || l.methods.length > 0) {
    const O = Y + N + st + v + a * 2 + o, D = y.line(
      G.x,
      T ? Math.max(U, O) : O,
      G.x + G.width,
      (T ? Math.max(U, O) : O) + 1e-3,
      x
    );
    c.insert(() => D).attr("class", `divider${t.look === "neo" && !s ? " neo-line" : ""}`).attr("style", f);
  }
  if (l.look !== "handDrawn" && c.selectAll("path").attr("style", f), F.select(":nth-child(2)").attr("style", f), c.selectAll(".divider").select("path").attr("style", f), t.labelStyle ? c.selectAll("span").attr("style", t.labelStyle) : c.selectAll("span").attr("style", f), !n) {
    const O = RegExp(/color\s*:\s*([^;]*)/), D = O.exec(f);
    if (D) {
      const B = D[0].replace("color", "fill");
      c.selectAll("tspan").attr("style", B);
    } else if (u) {
      const B = O.exec(u);
      if (B) {
        const q = B[0].replace("color", "fill");
        c.selectAll("tspan").attr("style", q);
      }
    }
  }
  return dt(t, F), t.intersect = function(O) {
    return nt.rect(t, O);
  }, c;
}
p(Am, "classBox");
async function Em(e, t) {
  const { labelStyles: r, nodeStyles: i } = pt(t);
  t.labelStyle = r;
  const s = t, o = t, a = 20, n = 20, l = "verifyMethod" in t, c = Ct(t), h = $t(), { themeVariables: u } = h, { borderColorArray: d, requirementEdgeLabelBackground: f } = u, m = h.layout === "elk" ? "start" : "center", y = e.insert("g").attr("class", c).attr("id", t.domId ?? t.id);
  let x;
  l ? x = await er(
    y,
    `&lt;&lt;${s.type}&gt;&gt;`,
    0,
    t.labelStyle
  ) : x = await er(y, "&lt;&lt;Element&gt;&gt;", 0, t.labelStyle);
  let C = x;
  const k = await er(
    y,
    s.name,
    C,
    t.labelStyle + "; font-weight: bold;"
  );
  if (C += k + n, l) {
    const N = await er(
      y,
      `${s.requirementId ? `ID: ${s.requirementId}` : ""}`,
      C,
      t.labelStyle,
      m
    );
    C += N;
    const st = await er(
      y,
      `${s.text ? `Text: ${s.text}` : ""}`,
      C,
      t.labelStyle,
      m
    );
    C += st;
    const U = await er(
      y,
      `${s.risk ? `Risk: ${s.risk}` : ""}`,
      C,
      t.labelStyle,
      m
    );
    C += U, await er(
      y,
      `${s.verifyMethod ? `Verification: ${s.verifyMethod}` : ""}`,
      C,
      t.labelStyle,
      m
    );
  } else {
    const N = await er(
      y,
      `${o.type ? `Type: ${o.type}` : ""}`,
      C,
      t.labelStyle,
      m
    );
    C += N, await er(
      y,
      `${o.docRef ? `Doc Ref: ${o.docRef}` : ""}`,
      C,
      t.labelStyle,
      m
    );
  }
  const T = (y.node()?.getBBox().width ?? 200) + a, _ = (y.node()?.getBBox().height ?? 200) + a, v = -T / 2, L = -_ / 2, A = ut.svg(y), F = ct(t, {});
  t.look !== "handDrawn" && (F.roughness = 0, F.fillStyle = "solid");
  const G = A.rectangle(v, L, T, _, F), Y = y.insert(() => G, ":first-child");
  if (Y.attr("class", "basic label-container outer-path").attr("style", i), d?.length) {
    const N = t.colorIndex ?? 0;
    y.attr("data-color-id", `color-${N % d.length}`);
  }
  if (y.selectAll(".label").each((N, st, U) => {
    const O = At(U[st]), D = O.attr("transform");
    let B = 0, q = 0;
    if (D) {
      const mt = RegExp(/translate\(([^,]+),([^)]+)\)/).exec(D);
      mt && (B = parseFloat(mt[1]), q = parseFloat(mt[2]));
    }
    const I = q - _ / 2;
    let it = v + a / 2;
    (st === 0 || st === 1) && (it = B), O.attr("transform", `translate(${it}, ${I + a})`);
  }), C > x + k + n) {
    const N = L + x + k + n;
    let st;
    if (t.look === "neo") {
      const D = [
        [v, N],
        [v + T, N],
        [v + T, N + 1e-3],
        [v, N + 1e-3]
      ];
      st = A.polygon(D, F);
    } else
      st = A.line(v, N, v + T, N, F);
    y.insert(() => st).attr("class", "divider");
  }
  return dt(t, Y), t.intersect = function(N) {
    return nt.rect(t, N);
  }, i && t.look !== "handDrawn" && (f || d?.length) && y.selectAll("path").attr("style", i), y;
}
p(Em, "requirementBox");
async function er(e, t, r, i = "", s = "center") {
  if (t === "")
    return 0;
  const o = e.insert("g").attr("class", "label").attr("style", i), a = $t(), n = a.htmlLabels ?? !0, l = await Ve(
    o,
    Sl(zr(t)),
    {
      width: Sr(t, a) + 50,
      // Add room for error when splitting text into multiple lines
      classes: "markdown-node-label",
      useHtmlLabels: n,
      style: i
    },
    a
  );
  let c;
  if (n) {
    const h = l.children[0], u = At(l);
    s === "start" && At(h).style("text-align", "left"), c = h.getBoundingClientRect(), u.attr("width", c.width), u.attr("height", c.height);
  } else {
    const h = l.children[0];
    for (const u of h.children)
      i && u.setAttribute("style", i);
    if (s === "start") {
      h.setAttribute("text-anchor", "start");
      for (const u of h.children)
        u.setAttribute("text-anchor", "start");
    }
    c = l.getBBox(), c.height += 6;
  }
  return o.attr("transform", `translate(${-c.width / 2},${-c.height / 2 + r})`), c.height;
}
p(er, "addText");
var qS = /* @__PURE__ */ p((e) => {
  switch (e) {
    case "Very High":
      return "red";
    case "High":
      return "orange";
    case "Medium":
      return null;
    // no stroke
    case "Low":
      return "blue";
    case "Very Low":
      return "lightblue";
  }
}, "colorFromPriority");
async function Mm(e, t, { config: r }) {
  const { labelStyles: i, nodeStyles: s } = pt(t);
  t.labelStyle = i || "";
  const o = 10, a = t.width;
  t.width = (t.width ?? 200) - 10;
  const {
    shapeSvg: n,
    bbox: l,
    label: c
  } = await xt(e, t, Ct(t)), h = t.padding || 10;
  let u = "", d;
  "ticket" in t && t.ticket && r?.kanban?.ticketBaseUrl && (u = r?.kanban?.ticketBaseUrl.replace("#TICKET#", t.ticket), d = n.insert("svg:a", ":first-child").attr("class", "kanban-ticket-link").attr("xlink:href", u).attr("target", "_blank"));
  const f = {
    useHtmlLabels: t.useHtmlLabels,
    labelStyle: t.labelStyle || "",
    width: t.width,
    img: t.img,
    padding: t.padding || 8,
    centerLabel: !1
  };
  let m, y;
  d ? { label: m, bbox: y } = await Xa(
    d,
    "ticket" in t && t.ticket || "",
    f
  ) : { label: m, bbox: y } = await Xa(
    n,
    "ticket" in t && t.ticket || "",
    f
  );
  const { label: x, bbox: C } = await Xa(
    n,
    "assigned" in t && t.assigned || "",
    f
  );
  t.width = a;
  const k = 10, T = t?.width || 0, _ = Math.max(y.height, C.height) / 2, v = Math.max(l.height + k * 2, t?.height || 0) + _, L = -T / 2, A = -v / 2;
  c.attr(
    "transform",
    "translate(" + (h - T / 2) + ", " + (-_ - l.height / 2) + ")"
  ), m.attr(
    "transform",
    "translate(" + (h - T / 2) + ", " + (-_ + l.height / 2) + ")"
  ), x.attr(
    "transform",
    "translate(" + (h + T / 2 - C.width - 2 * o) + ", " + (-_ + l.height / 2) + ")"
  );
  let F;
  const { rx: G, ry: Y } = t, { cssStyles: N } = t;
  if (t.look === "handDrawn") {
    const st = ut.svg(n), U = ct(t, {}), O = G || Y ? st.path(qe(L, A, T, v, G || 0), U) : st.rectangle(L, A, T, v, U);
    F = n.insert(() => O, ":first-child"), F.attr("class", "basic label-container").attr("style", N || null);
  } else {
    F = n.insert("rect", ":first-child"), F.attr("class", "basic label-container __APA__").attr("style", s).attr("rx", G ?? 5).attr("ry", Y ?? 5).attr("x", L).attr("y", A).attr("width", T).attr("height", v);
    const st = "priority" in t && t.priority;
    if (st) {
      const U = n.append("line"), O = L + 2, D = A + Math.floor((G ?? 0) / 2), B = A + v - Math.floor((G ?? 0) / 2);
      U.attr("x1", O).attr("y1", D).attr("x2", O).attr("y2", B).attr("stroke-width", "4").attr("stroke", qS(st));
    }
  }
  return dt(t, F), t.height = v, t.intersect = function(st) {
    return nt.rect(t, st);
  }, n;
}
p(Mm, "kanbanItem");
async function $m(e, t) {
  const { labelStyles: r, nodeStyles: i } = pt(t);
  t.labelStyle = r;
  const { shapeSvg: s, bbox: o, halfPadding: a, label: n } = await xt(
    e,
    t,
    Ct(t)
  ), l = o.width + 10 * a, c = o.height + 8 * a, h = 0.15 * l, { cssStyles: u } = t, d = o.width + 20, f = o.height + 20, m = Math.max(l, d), y = Math.max(c, f);
  n.attr("transform", `translate(${-o.width / 2}, ${-o.height / 2})`);
  let x;
  const C = `M0 0 
    a${h},${h} 1 0,0 ${m * 0.25},${-1 * y * 0.1}
    a${h},${h} 1 0,0 ${m * 0.25},0
    a${h},${h} 1 0,0 ${m * 0.25},0
    a${h},${h} 1 0,0 ${m * 0.25},${y * 0.1}

    a${h},${h} 1 0,0 ${m * 0.15},${y * 0.33}
    a${h * 0.8},${h * 0.8} 1 0,0 0,${y * 0.34}
    a${h},${h} 1 0,0 ${-1 * m * 0.15},${y * 0.33}

    a${h},${h} 1 0,0 ${-1 * m * 0.25},${y * 0.15}
    a${h},${h} 1 0,0 ${-1 * m * 0.25},0
    a${h},${h} 1 0,0 ${-1 * m * 0.25},0
    a${h},${h} 1 0,0 ${-1 * m * 0.25},${-1 * y * 0.15}

    a${h},${h} 1 0,0 ${-1 * m * 0.1},${-1 * y * 0.33}
    a${h * 0.8},${h * 0.8} 1 0,0 0,${-1 * y * 0.34}
    a${h},${h} 1 0,0 ${m * 0.1},${-1 * y * 0.33}
  H0 V0 Z`;
  if (t.look === "handDrawn") {
    const k = ut.svg(s), T = ct(t, {}), _ = k.path(C, T);
    x = s.insert(() => _, ":first-child"), x.attr("class", "basic label-container").attr("style", te(u));
  } else
    x = s.insert("path", ":first-child").attr("class", "basic label-container").attr("style", i).attr("d", C);
  return x.attr("transform", `translate(${-m / 2}, ${-y / 2})`), dt(t, x), t.calcIntersect = function(k, T) {
    return nt.rect(k, T);
  }, t.intersect = function(k) {
    return R.info("Bang intersect", t, k), nt.rect(t, k);
  }, s;
}
p($m, "bang");
async function Om(e, t) {
  const { labelStyles: r, nodeStyles: i } = pt(t);
  t.labelStyle = r;
  const { shapeSvg: s, bbox: o, halfPadding: a, label: n } = await xt(
    e,
    t,
    Ct(t)
  ), l = o.width + 2 * a, c = o.height + 2 * a, h = 0.15 * l, u = 0.25 * l, d = 0.35 * l, f = 0.2 * l, { cssStyles: m } = t;
  let y;
  const x = `M0 0 
    a${h},${h} 0 0,1 ${l * 0.25},${-1 * l * 0.1}
    a${d},${d} 1 0,1 ${l * 0.4},${-1 * l * 0.1}
    a${u},${u} 1 0,1 ${l * 0.35},${l * 0.2}

    a${h},${h} 1 0,1 ${l * 0.15},${c * 0.35}
    a${f},${f} 1 0,1 ${-1 * l * 0.15},${c * 0.65}

    a${u},${h} 1 0,1 ${-1 * l * 0.25},${l * 0.15}
    a${d},${d} 1 0,1 ${-1 * l * 0.5},0
    a${h},${h} 1 0,1 ${-1 * l * 0.25},${-1 * l * 0.15}

    a${h},${h} 1 0,1 ${-1 * l * 0.1},${-1 * c * 0.35}
    a${f},${f} 1 0,1 ${l * 0.1},${-1 * c * 0.65}
  H0 V0 Z`;
  if (t.look === "handDrawn") {
    const C = ut.svg(s), k = ct(t, {}), T = C.path(x, k);
    y = s.insert(() => T, ":first-child"), y.attr("class", "basic label-container").attr("style", te(m));
  } else
    y = s.insert("path", ":first-child").attr("class", "basic label-container").attr("style", i).attr("d", x);
  return n.attr("transform", `translate(${-o.width / 2}, ${-o.height / 2})`), y.attr("transform", `translate(${-l / 2}, ${-c / 2})`), dt(t, y), t.calcIntersect = function(C, k) {
    return nt.rect(C, k);
  }, t.intersect = function(C) {
    return R.info("Cloud intersect", t, C), nt.rect(t, C);
  }, s;
}
p(Om, "cloud");
async function Dm(e, t) {
  const { labelStyles: r, nodeStyles: i } = pt(t);
  t.labelStyle = r;
  const { shapeSvg: s, bbox: o, halfPadding: a, label: n } = await xt(
    e,
    t,
    Ct(t)
  ), l = o.width + 8 * a, c = o.height + 2 * a, h = 5, u = t.look === "neo" ? `
    M${-l / 2} ${c / 2 - h}
    v${-c + 2 * h}
    q0,-${h} ${h},-${h}
    h${l - 2 * h}
    q${h},0 ${h},${h}
    v${c - h}
    H${-l / 2}
    Z
  ` : `
    M${-l / 2} ${c / 2 - h}
    v${-c + 2 * h}
    q0,-${h} ${h},-${h}
    h${l - 2 * h}
    q${h},0 ${h},${h}
    v${c - 2 * h}
    q0,${h} ${-h},${h}
    h${-(l - 2 * h)}
    q${-h},0 ${-h},${-h}
    Z
  `;
  if (!t.domId)
    throw new Error(
      `defaultMindmapNode: node "${t.id}" is missing a domId — was render.ts domId prefixing skipped?`
    );
  const d = s.append("path").attr("id", t.domId).attr("class", "node-bkg node-" + t.type).attr("style", i).attr("d", u);
  return s.append("line").attr("class", "node-line-").attr("x1", -l / 2).attr("y1", c / 2).attr("x2", l / 2).attr("y2", c / 2), n.attr("transform", `translate(${-o.width / 2}, ${-o.height / 2})`), s.append(() => n.node()), dt(t, d), t.calcIntersect = function(f, m) {
    return nt.rect(f, m);
  }, t.intersect = function(f) {
    return nt.rect(t, f);
  }, s;
}
p(Dm, "defaultMindmapNode");
async function Im(e, t) {
  const r = {
    padding: t.padding ?? 0
  };
  return lh(e, t, r);
}
p(Im, "mindmapCircle");
var zS = [
  {
    semanticName: "Process",
    name: "Rectangle",
    shortName: "rect",
    description: "Standard process shape",
    aliases: ["proc", "process", "rectangle"],
    internalAliases: ["squareRect"],
    handler: fm
  },
  {
    semanticName: "Event",
    name: "Rounded Rectangle",
    shortName: "rounded",
    description: "Represents an event",
    aliases: ["event"],
    internalAliases: ["roundedRect"],
    handler: cm
  },
  {
    semanticName: "Terminal Point",
    name: "Stadium",
    shortName: "stadium",
    description: "Terminal point",
    aliases: ["terminal", "pill"],
    handler: pm
  },
  {
    semanticName: "Subprocess",
    name: "Framed Rectangle",
    shortName: "fr-rect",
    description: "Subprocess",
    aliases: ["subprocess", "subproc", "framed-rectangle", "subroutine"],
    handler: xm
  },
  {
    semanticName: "Database",
    name: "Cylinder",
    shortName: "cyl",
    description: "Database storage",
    aliases: ["db", "database", "cylinder"],
    handler: Dg
  },
  {
    semanticName: "Data Store",
    name: "Data Store",
    shortName: "datastore",
    description: "Data flow diagram data store",
    aliases: ["data-store"],
    handler: Ig
  },
  {
    semanticName: "Folder",
    name: "Folder",
    shortName: "folder",
    description: "Folder or directory",
    aliases: ["directory"],
    handler: zg
  },
  {
    semanticName: "Bucket",
    name: "Bucket",
    shortName: "bucket",
    description: "Object storage bucket",
    handler: bg
  },
  {
    semanticName: "Console",
    name: "Console (terminal window)",
    shortName: "console",
    description: "Terminal or console window",
    handler: Bg
  },
  {
    semanticName: "Browser",
    name: "Browser",
    shortName: "browser",
    description: "Browser window",
    handler: Tg
  },
  {
    semanticName: "Person",
    name: "Person",
    shortName: "person",
    description: "Person (circular head above a rounded body)",
    handler: Og
  },
  {
    semanticName: "Start",
    name: "Circle",
    shortName: "circle",
    description: "Starting point",
    aliases: ["circ"],
    handler: lh
  },
  {
    semanticName: "Bang",
    name: "Bang",
    shortName: "bang",
    description: "Bang",
    aliases: ["bang"],
    handler: $m
  },
  {
    semanticName: "Cloud",
    name: "Cloud",
    shortName: "cloud",
    description: "cloud",
    aliases: ["cloud"],
    handler: Om
  },
  {
    semanticName: "Decision",
    name: "Diamond",
    shortName: "diam",
    description: "Decision-making step",
    aliases: ["decision", "diamond", "question"],
    handler: nm
  },
  {
    semanticName: "Prepare Conditional",
    name: "Hexagon",
    shortName: "hex",
    description: "Preparation or condition step",
    aliases: ["hexagon", "prepare"],
    handler: Yg
  },
  {
    semanticName: "Data Input/Output",
    name: "Lean Right",
    shortName: "lean-r",
    description: "Represents input or output",
    aliases: ["lean-right", "in-out"],
    internalAliases: ["lean_right"],
    handler: tm
  },
  {
    semanticName: "Data Input/Output",
    name: "Lean Left",
    shortName: "lean-l",
    description: "Represents output or input",
    aliases: ["lean-left", "out-in"],
    internalAliases: ["lean_left"],
    handler: Jg
  },
  {
    semanticName: "Priority Action",
    name: "Trapezoid Base Bottom",
    shortName: "trap-b",
    description: "Priority action",
    aliases: ["priority", "trapezoid-bottom", "trapezoid"],
    handler: Tm
  },
  {
    semanticName: "Manual Operation",
    name: "Trapezoid Base Top",
    shortName: "trap-t",
    description: "Represents a manual task",
    aliases: ["manual", "trapezoid-top", "inv-trapezoid"],
    internalAliases: ["inv_trapezoid"],
    handler: Kg
  },
  {
    semanticName: "Stop",
    name: "Double Circle",
    shortName: "dbl-circ",
    description: "Represents a stop point",
    aliases: ["double-circle"],
    internalAliases: ["doublecircle"],
    handler: Rg
  },
  {
    semanticName: "Text Block",
    name: "Text Block",
    shortName: "text",
    description: "Text block",
    handler: km
  },
  {
    semanticName: "Card",
    name: "Notched Rectangle",
    shortName: "notch-rect",
    description: "Represents a card",
    aliases: ["card", "notched-rectangle"],
    handler: Sg
  },
  {
    semanticName: "Lined/Shaded Process",
    name: "Lined Rectangle",
    shortName: "lin-rect",
    description: "Lined process shape",
    aliases: ["lined-rectangle", "lined-process", "lin-proc", "shaded-process"],
    handler: um
  },
  {
    semanticName: "Start",
    name: "Small Circle",
    shortName: "sm-circ",
    description: "Small starting point",
    aliases: ["start", "small-circle"],
    internalAliases: ["stateStart"],
    handler: ym
  },
  {
    semanticName: "Stop",
    name: "Framed Circle",
    shortName: "fr-circ",
    description: "Stop point",
    aliases: ["stop", "framed-circle"],
    internalAliases: ["stateEnd"],
    handler: mm
  },
  {
    semanticName: "Fork/Join",
    name: "Filled Rectangle",
    shortName: "fork",
    description: "Fork or join in process flow",
    aliases: ["join"],
    internalAliases: ["forkJoin"],
    handler: Wg
  },
  {
    semanticName: "Collate",
    name: "Hourglass",
    shortName: "hourglass",
    description: "Represents a collate operation",
    aliases: ["hourglass", "collate"],
    handler: Ug
  },
  {
    semanticName: "Comment",
    name: "Curly Brace",
    shortName: "brace",
    description: "Adds a comment",
    aliases: ["comment", "brace-l"],
    handler: Ag
  },
  {
    semanticName: "Comment Right",
    name: "Curly Brace",
    shortName: "brace-r",
    description: "Adds a comment",
    handler: Eg
  },
  {
    semanticName: "Comment with braces on both sides",
    name: "Curly Braces",
    shortName: "braces",
    description: "Adds a comment",
    handler: Mg
  },
  {
    semanticName: "Com Link",
    name: "Lightning Bolt",
    shortName: "bolt",
    description: "Communication link",
    aliases: ["com-link", "lightning-bolt"],
    handler: em
  },
  {
    semanticName: "Document",
    name: "Document",
    shortName: "doc",
    description: "Represents a document",
    aliases: ["doc", "document"],
    handler: vm
  },
  {
    semanticName: "Delay",
    name: "Half-Rounded Rectangle",
    shortName: "delay",
    description: "Represents a delay",
    aliases: ["half-rounded-rectangle"],
    handler: Hg
  },
  {
    semanticName: "Direct Access Storage",
    name: "Horizontal Cylinder",
    shortName: "h-cyl",
    description: "Direct access storage",
    aliases: ["das", "horizontal-cylinder"],
    handler: wm
  },
  {
    semanticName: "Disk Storage",
    name: "Lined Cylinder",
    shortName: "lin-cyl",
    description: "Disk storage",
    aliases: ["disk", "lined-cylinder"],
    handler: rm
  },
  {
    semanticName: "Display",
    name: "Curved Trapezoid",
    shortName: "curv-trap",
    description: "Represents a display",
    aliases: ["curved-trapezoid", "display"],
    handler: $g
  },
  {
    semanticName: "Divided Process",
    name: "Divided Rectangle",
    shortName: "div-rect",
    description: "Divided process shape",
    aliases: ["div-proc", "divided-rectangle", "divided-process"],
    handler: Pg
  },
  {
    semanticName: "Extract",
    name: "Triangle",
    shortName: "tri",
    description: "Extraction process",
    aliases: ["extract", "triangle"],
    handler: _m
  },
  {
    semanticName: "Internal Storage",
    name: "Window Pane",
    shortName: "win-pane",
    description: "Internal storage",
    aliases: ["internal-storage", "window-pane"],
    handler: Lm
  },
  {
    semanticName: "Junction",
    name: "Filled Circle",
    shortName: "f-circ",
    description: "Junction point",
    aliases: ["junction", "filled-circle"],
    handler: Ng
  },
  {
    semanticName: "Loop Limit",
    name: "Trapezoidal Pentagon",
    shortName: "notch-pent",
    description: "Loop limit step",
    aliases: ["loop-limit", "notched-pentagon"],
    handler: Sm
  },
  {
    semanticName: "Manual File",
    name: "Flipped Triangle",
    shortName: "flip-tri",
    description: "Manual file operation",
    aliases: ["manual-file", "flipped-triangle"],
    handler: qg
  },
  {
    semanticName: "Manual Input",
    name: "Sloped Rectangle",
    shortName: "sl-rect",
    description: "Manual input step",
    aliases: ["manual-input", "sloped-rectangle"],
    handler: dm
  },
  {
    semanticName: "Multi-Document",
    name: "Stacked Document",
    shortName: "docs",
    description: "Multiple documents",
    aliases: ["documents", "st-doc", "stacked-document"],
    handler: om
  },
  {
    semanticName: "Multi-Process",
    name: "Stacked Rectangle",
    shortName: "st-rect",
    description: "Multiple processes",
    aliases: ["procs", "processes", "stacked-rectangle"],
    handler: sm
  },
  {
    semanticName: "Stored Data",
    name: "Bow Tie Rectangle",
    shortName: "bow-rect",
    description: "Stored data",
    aliases: ["stored-data", "bow-tie-rectangle"],
    handler: Cg
  },
  {
    semanticName: "Summary",
    name: "Crossed Circle",
    shortName: "cross-circ",
    description: "Summary",
    aliases: ["summary", "crossed-circle"],
    handler: Fg
  },
  {
    semanticName: "Tagged Document",
    name: "Tagged Document",
    shortName: "tag-doc",
    description: "Tagged document",
    aliases: ["tag-doc", "tagged-document"],
    handler: bm
  },
  {
    semanticName: "Tagged Process",
    name: "Tagged Rectangle",
    shortName: "tag-rect",
    description: "Tagged process",
    aliases: ["tagged-rectangle", "tag-proc", "tagged-process"],
    handler: Cm
  },
  {
    semanticName: "Paper Tape",
    name: "Flag",
    shortName: "flag",
    description: "Paper tape",
    aliases: ["paper-tape"],
    handler: Bm
  },
  {
    semanticName: "Odd",
    name: "Odd",
    shortName: "odd",
    description: "Odd shape",
    internalAliases: ["rect_left_inv_arrow"],
    handler: lm
  },
  {
    semanticName: "Lined Document",
    name: "Lined Document",
    shortName: "lin-doc",
    description: "Lined document",
    aliases: ["lined-document"],
    handler: im
  }
], WS = /* @__PURE__ */ p(() => {
  const t = [
    ...Object.entries({
      // States
      state: gm,
      choice: _g,
      note: am,
      // Rectangles
      composite: vg,
      rectWithTitle: hm,
      labelRect: Qg,
      block_arrow: wg,
      // Collapsed subgraph (flowchart `@{ view: collapsed }`)
      collapsedGroup: kg,
      // Icons
      iconSquare: Vg,
      iconCircle: Gg,
      icon: jg,
      iconRounded: Xg,
      imageSquare: Zg,
      anchor: yg,
      // Kanban diagram
      kanbanItem: Mm,
      //Mindmap diagram
      mindmapCircle: Im,
      defaultMindmapNode: Dm,
      // class diagram
      classBox: Am,
      // er diagram
      erBox: hh,
      // Requirement diagram
      requirementBox: Em
    }),
    ...zS.flatMap((r) => [
      r.shortName,
      ..."aliases" in r ? r.aliases : [],
      ..."internalAliases" in r ? r.internalAliases : []
    ].map((s) => [s, r.handler]))
  ];
  return Object.fromEntries(t);
}, "generateShapeMap"), Pm = WS();
function HS(e) {
  return e in Pm;
}
p(HS, "isValidShape");
var ha = /* @__PURE__ */ p(({
  flowchart: e
}) => {
  const t = e?.subGraphTitleMargin?.top ?? 0, r = e?.subGraphTitleMargin?.bottom ?? 0, i = t + r;
  return {
    subGraphTitleTopMargin: t,
    subGraphTitleBottomMargin: r,
    subGraphTitleTotalMargin: i
  };
}, "getSubGraphTitleMargins"), ca = /* @__PURE__ */ new Map();
async function ch(e, t, r) {
  let i, s;
  t.shape === "rect" && (t.rx && t.ry ? t.shape = "roundedRect" : t.shape = "squareRect");
  const o = t.shape ? Pm[t.shape] : void 0;
  if (!o)
    throw new Error(`No such shape: ${t.shape}. Please check your syntax.`);
  if (t.link) {
    let a;
    r.config.securityLevel === "sandbox" ? a = "_top" : t.linkTarget && (a = t.linkTarget || "_blank"), i = e.insert("svg:a").attr("xlink:href", t.link).attr("target", a ?? null), s = await o(i, t, r);
  } else
    s = await o(e, t, r), i = s;
  return i.attr("data-look", te(t.look)), t.tooltip && s.attr("title", t.tooltip), ca.set(t.id, i), t.haveCallback && i.attr("class", i.attr("class") + " clickable"), i;
}
p(ch, "insertNode");
var q5 = /* @__PURE__ */ p((e, t) => {
  ca.set(t.id, e);
}, "setNodeElem"), YS = /* @__PURE__ */ p(() => {
  ca.clear();
}, "clear"), Nu = /* @__PURE__ */ p((e) => {
  const t = ca.get(e.id);
  R.trace(
    "Transforming node",
    e.diff,
    e,
    "translate(" + (e.x - e.width / 2 - 5) + ", " + e.width / 2 + ")"
  );
  const r = 8, i = e.diff || 0;
  return e.clusterNode ? t.attr(
    "transform",
    "translate(" + (e.x + i - e.width / 2) + ", " + (e.y - e.height / 2 - r) + ")"
  ) : t.attr("transform", "translate(" + e.x + ", " + e.y + ")"), i;
}, "positionNode"), US = /* @__PURE__ */ p(async (e, t) => {
  const r = $t(), { themeVariables: i, handDrawnSeed: s } = r, { clusterBkg: o, clusterBorder: a } = i, n = a, { labelStyles: l, nodeStyles: c, borderStyles: h, backgroundStyles: u } = pt(t), d = e.insert("g").attr("class", "cluster swimlane " + (t.cssClasses || "")).attr("id", t.id).attr("data-id", t.id).attr("data-et", "cluster").attr("data-look", t.look), f = cr(r.flowchart.htmlLabels), m = t.direction === "LR", y = d.insert("g").attr("class", "cluster-label swimlane-label"), x = await Ve(y, t.label, {
    style: t.labelStyle,
    useHtmlLabels: f,
    isNode: !0,
    width: t.width
  });
  let C = x.getBBox();
  if (f) {
    const U = x.children[0], O = At(x);
    C = U.getBoundingClientRect(), O.attr("width", C.width), O.attr("height", C.height);
  }
  const k = t.padding ?? 0, T = t.width <= C.width + k ? C.width + k : t.width;
  t.width <= C.width + k ? t.diff = (T - t.width) / 2 - k : t.diff = -k;
  const _ = t.height, v = t.y - _ / 2, L = t.y + _ / 2, A = t.x - T / 2, F = t.swimlaneContentTop !== void 0 ? t.swimlaneContentTop : v + _ / 3, G = m ? 4 : 0, Y = C.height + 2 * G;
  let N, st;
  if (m) {
    const U = Math.max(Y, C.height + 2 * G), O = A + U, D = Math.max(0, T - U);
    if (t.look === "handDrawn") {
      const I = ut.svg(d), it = ct(t, {
        roughness: 0.7,
        fill: o,
        stroke: n,
        fillWeight: 3,
        seed: s
      }), Q = ct(t, {
        roughness: 0.7,
        fill: "none",
        stroke: n,
        seed: s
      }), mt = I.rectangle(A, v, U, _, it);
      N = d.insert(() => mt, ":first-child");
      const St = I.rectangle(O, v, D, _, Q);
      st = d.insert(() => St, ":first-child"), N.select("path:nth-child(2)").attr("style", h.join(";")), N.select("path").attr("style", u.join(";").replace("fill", "stroke"));
    } else
      N = d.insert("rect", ":first-child"), st = d.insert("rect", ":first-child"), N.attr("class", "swimlane-title").attr("style", c).attr("x", A).attr("y", v).attr("width", U).attr("height", _).attr("fill", o).attr("stroke", n), st.attr("class", "swimlane-body").attr("style", c).attr("x", O).attr("y", v).attr("width", D).attr("height", _).attr("fill", "none").attr("stroke", n);
    const B = A + U / 2, q = t.y;
    y.attr(
      "transform",
      `translate(${B}, ${q}) rotate(-90) translate(${-C.width / 2}, ${-C.height / 2})`
    );
  } else {
    const U = Math.max(0, F - v), O = Math.min(Y, U), D = v + O, B = Math.max(0, L - D), q = t.x - T / 2;
    if (t.look === "handDrawn") {
      const Q = ut.svg(d), mt = ct(t, {
        roughness: 0.7,
        fill: o,
        stroke: n,
        fillWeight: 3,
        seed: s
      }), St = ct(t, {
        roughness: 0.7,
        fill: "none",
        stroke: n,
        seed: s
      }), Tt = Q.rectangle(q, v, T, O, mt);
      N = d.insert(() => Tt, ":first-child");
      const ft = Q.rectangle(q, D, T, B, St);
      st = d.insert(() => ft, ":first-child"), N.select("path:nth-child(2)").attr("style", h.join(";")), N.select("path").attr("style", u.join(";").replace("fill", "stroke"));
    } else
      N = d.insert("rect", ":first-child"), st = d.insert("rect", ":first-child"), N.attr("class", "swimlane-title").attr("style", c).attr("x", q).attr("y", v).attr("width", T).attr("height", O).attr("fill", o).attr("stroke", n), st.attr("class", "swimlane-body").attr("style", c).attr("x", q).attr("y", D).attr("width", T).attr("height", B).attr("fill", "none").attr("stroke", n);
    const I = t.x - C.width / 2, it = v + (O - C.height) / 2;
    y.attr("transform", `translate(${I}, ${it})`);
  }
  if (R.trace("Swimlane data ", t, JSON.stringify(t)), l) {
    const U = y.select("span");
    U && U.attr("style", l);
  }
  return t.offsetX = 0, t.width = T, t.height = _, t.offsetY = C.height - k / 2, t.intersect = function(U) {
    return ci(t, U);
  }, { cluster: d, labelBBox: C };
}, "swimlane"), Rm = /* @__PURE__ */ p(async (e, t) => {
  R.info("Creating subgraph rect for ", t.id, t);
  const r = $t(), { themeVariables: i, handDrawnSeed: s } = r, { clusterBkg: o, clusterBorder: a } = i, { labelStyles: n, nodeStyles: l, borderStyles: c, backgroundStyles: h } = pt(t), u = e.insert("g").attr("class", "cluster " + t.cssClasses).attr("id", t.domId).attr("data-look", t.look), d = ge(r), f = u.insert("g").attr("class", "cluster-label ");
  let m;
  t.labelType === "markdown" ? m = await Ve(f, t.label, {
    style: t.labelStyle,
    useHtmlLabels: d,
    isNode: !0,
    width: t.width
  }) : m = await Pr(f, t.label, t.labelStyle || "", !1, !0);
  let y = m.getBBox();
  if (ge(r)) {
    const A = m.children[0], F = At(m);
    y = A.getBoundingClientRect(), F.attr("width", y.width), F.attr("height", y.height);
  }
  const x = t.width <= y.width + t.padding ? y.width + t.padding : t.width;
  t.width <= y.width + t.padding ? t.diff = (x - t.width) / 2 - t.padding : t.diff = -t.padding;
  const C = t.height, k = t.x - x / 2, T = t.y - C / 2;
  R.trace("Data ", t, JSON.stringify(t));
  let _;
  if (t.look === "handDrawn") {
    const A = ut.svg(u), F = ct(t, {
      roughness: 0.7,
      fill: o,
      // fill: 'red',
      stroke: a,
      fillWeight: 3,
      seed: s
    }), G = A.path(qe(k, T, x, C, 0), F);
    _ = u.insert(() => (R.debug("Rough node insert CXC", G), G), ":first-child"), _.select("path:nth-child(2)").attr("style", c.join(";")), _.select("path").attr("style", h.join(";").replace("fill", "stroke"));
  } else
    _ = u.insert("rect", ":first-child"), _.attr("style", l).attr("rx", t.rx).attr("ry", t.ry).attr("x", k).attr("y", T).attr("width", x).attr("height", C);
  const { subGraphTitleTopMargin: v } = ha(r);
  if (f.attr(
    "transform",
    // This puts the label on top of the box instead of inside it
    `translate(${t.x - y.width / 2}, ${t.y - t.height / 2 + v})`
  ), n) {
    const A = f.select("span");
    A && A.attr("style", n);
  }
  const L = _.node().getBBox();
  return t.offsetX = 0, t.width = L.width, t.height = L.height, t.offsetY = y.height - t.padding / 2, t.intersect = function(A) {
    return ci(t, A);
  }, { cluster: u, labelBBox: y };
}, "rect"), jS = /* @__PURE__ */ p((e, t) => {
  const r = e.insert("g").attr("class", "note-cluster").attr("id", t.domId), i = r.insert("rect", ":first-child"), s = 0 * t.padding, o = s / 2;
  i.attr("rx", t.rx).attr("ry", t.ry).attr("x", t.x - t.width / 2 - o).attr("y", t.y - t.height / 2 - o).attr("width", t.width + s).attr("height", t.height + s).attr("fill", "none");
  const a = i.node().getBBox();
  return t.width = a.width, t.height = a.height, t.intersect = function(n) {
    return ci(t, n);
  }, { cluster: r, labelBBox: { width: 0, height: 0 } };
}, "noteGroup"), GS = /* @__PURE__ */ p(async (e, t) => {
  const r = $t(), { themeVariables: i, handDrawnSeed: s } = r, { altBackground: o, compositeBackground: a, compositeTitleBackground: n, nodeBorder: l } = i, c = e.insert("g").attr("class", t.cssClasses).attr("id", t.domId).attr("data-id", t.id).attr("data-look", t.look), h = c.insert("g", ":first-child"), u = c.insert("g").attr("class", "cluster-label");
  let d = c.append("rect");
  const f = await Pr(u, t.label, t.labelStyle, void 0, !0);
  let m = f.getBBox();
  if (ge(r)) {
    const G = f.children[0], Y = At(f);
    m = G.getBoundingClientRect(), Y.attr("width", m.width), Y.attr("height", m.height);
  }
  const y = 0 * t.padding, x = y / 2, C = (t.width <= m.width + t.padding ? m.width + t.padding : t.width) + y;
  t.width <= m.width + t.padding ? t.diff = (C - t.width) / 2 - t.padding : t.diff = -t.padding;
  const k = t.height + y, T = t.height + y - m.height - 6, _ = t.x - C / 2, v = t.y - k / 2;
  t.width = C;
  const L = t.y - t.height / 2 - x + m.height + 2;
  let A;
  if (t.look === "handDrawn") {
    const G = t.cssClasses.includes("statediagram-cluster-alt"), Y = ut.svg(c), N = t.rx || t.ry ? Y.path(qe(_, v, C, k, 10), {
      roughness: 0.7,
      fill: n,
      fillStyle: "solid",
      stroke: l,
      seed: s
    }) : Y.rectangle(_, v, C, k, { seed: s });
    A = c.insert(() => N, ":first-child");
    const st = Y.rectangle(_, L, C, T, {
      fill: G ? o : a,
      fillStyle: G ? "hachure" : "solid",
      stroke: l,
      seed: s
    });
    A = c.insert(() => N, ":first-child"), d = c.insert(() => st);
  } else
    A = h.insert("rect", ":first-child"), A.attr("class", "outer").attr("x", _).attr("y", v).attr("width", C).attr("height", k).attr("data-look", t.look), d.attr("class", "inner").attr("x", _).attr("y", L).attr("width", C).attr("height", T);
  u.attr(
    "transform",
    `translate(${t.x - m.width / 2}, ${v + 1 - (ge(r) ? 0 : 3)})`
  );
  const F = A.node().getBBox();
  return t.height = F.height, t.offsetX = 0, t.offsetY = m.height - t.padding / 2, t.labelBBox = m, t.intersect = function(G) {
    return ci(t, G);
  }, { cluster: c, labelBBox: m };
}, "roundedWithTitle"), XS = /* @__PURE__ */ p(async (e, t) => {
  R.info("Creating subgraph rect for ", t.id, t);
  const r = $t(), { themeVariables: i, handDrawnSeed: s } = r, { clusterBkg: o, clusterBorder: a } = i, { labelStyles: n, nodeStyles: l, borderStyles: c, backgroundStyles: h } = pt(t), u = e.insert("g").attr("class", "cluster " + t.cssClasses).attr("id", t.domId).attr("data-look", t.look), d = ge(r), f = u.insert("g").attr("class", "cluster-label "), m = await Ve(f, t.label, {
    style: t.labelStyle,
    useHtmlLabels: d,
    isNode: !0,
    width: t.width
  });
  let y = m.getBBox();
  if (ge(r)) {
    const A = m.children[0], F = At(m);
    y = A.getBoundingClientRect(), F.attr("width", y.width), F.attr("height", y.height);
  }
  const x = t.width <= y.width + t.padding ? y.width + t.padding : t.width;
  t.width <= y.width + t.padding ? t.diff = (x - t.width) / 2 - t.padding : t.diff = -t.padding;
  const C = t.height, k = t.x - x / 2, T = t.y - C / 2;
  R.trace("Data ", t, JSON.stringify(t));
  let _;
  if (t.look === "handDrawn") {
    const A = ut.svg(u), F = ct(t, {
      roughness: 0.7,
      fill: o,
      // fill: 'red',
      stroke: a,
      fillWeight: 4,
      seed: s
    }), G = A.path(qe(k, T, x, C, t.rx), F);
    _ = u.insert(() => (R.debug("Rough node insert CXC", G), G), ":first-child"), _.select("path:nth-child(2)").attr("style", c.join(";")), _.select("path").attr("style", h.join(";").replace("fill", "stroke"));
  } else
    _ = u.insert("rect", ":first-child"), _.attr("style", l).attr("rx", t.rx).attr("ry", t.ry).attr("x", k).attr("y", T).attr("width", x).attr("height", C);
  const { subGraphTitleTopMargin: v } = ha(r);
  if (f.attr(
    "transform",
    // This puts the label on top of the box instead of inside it
    `translate(${t.x - y.width / 2}, ${t.y - t.height / 2 + v})`
  ), n) {
    const A = f.select("span");
    A && A.attr("style", n);
  }
  const L = _.node().getBBox();
  return t.offsetX = 0, t.width = L.width, t.height = L.height, t.offsetY = y.height - t.padding / 2, t.intersect = function(A) {
    return ci(t, A);
  }, { cluster: u, labelBBox: y };
}, "kanbanSection"), VS = /* @__PURE__ */ p((e, t) => {
  const r = $t(), { themeVariables: i, handDrawnSeed: s } = r, { nodeBorder: o } = i, a = e.insert("g").attr("class", t.cssClasses).attr("id", t.domId).attr("data-look", t.look), n = a.insert("g", ":first-child"), l = 0 * t.padding, c = t.width + l;
  t.diff = -t.padding;
  const h = t.height + l, u = t.x - c / 2, d = t.y - h / 2;
  t.width = c;
  let f;
  if (t.look === "handDrawn") {
    const x = ut.svg(a).rectangle(u, d, c, h, {
      fill: "lightgrey",
      roughness: 0.5,
      strokeLineDash: [5],
      stroke: o,
      seed: s
    });
    f = a.insert(() => x, ":first-child");
  } else {
    f = n.insert("rect", ":first-child");
    let y = "outer";
    t.look, y = "divider", f.attr("class", y).attr("x", u).attr("y", d).attr("width", c).attr("height", h).attr("data-look", t.look);
  }
  const m = f.node().getBBox();
  return t.height = m.height, t.offsetX = 0, t.offsetY = 0, t.intersect = function(y) {
    return ci(t, y);
  }, { cluster: a, labelBBox: {} };
}, "divider"), ZS = Rm, KS = {
  rect: Rm,
  squareRect: ZS,
  roundedWithTitle: GS,
  noteGroup: jS,
  divider: VS,
  kanbanSection: XS,
  swimlane: US
}, Nm = /* @__PURE__ */ new Map(), qm = /* @__PURE__ */ p(async (e, t) => {
  const r = t.shape || "rect", i = await KS[r](e, t);
  return Nm.set(t.id, i), i;
}, "insertCluster"), QS = /* @__PURE__ */ p(() => {
  Nm = /* @__PURE__ */ new Map();
}, "clear"), rs = /* @__PURE__ */ p((e, t) => {
  if (t)
    return "translate(" + -e.width / 2 + ", " + -e.height / 2 + ")";
  const r = e.x ?? 0, i = e.y ?? 0;
  return "translate(" + -(r + e.width / 2) + ", " + -(i + e.height / 2) + ")";
}, "computeLabelTransform"), fe = {
  aggregation: 17.25,
  extension: 17.25,
  composition: 17.25,
  dependency: 6,
  lollipop: 13.5,
  arrow_point: 4,
  arrow_barb: 0,
  arrow_barb_neo: 5.5
  //arrow_cross: 24,
}, qu = {
  arrow_point: 4,
  arrow_cross: 12.5,
  arrow_circle: 12.5
};
function ds(e, t) {
  if (e === void 0 || t === void 0)
    return { angle: 0, deltaX: 0, deltaY: 0 };
  e = Gt(e), t = Gt(t);
  const [r, i] = [e.x, e.y], [s, o] = [t.x, t.y], a = s - r, n = o - i;
  return { angle: Math.atan(n / a), deltaX: a, deltaY: n };
}
p(ds, "calculateDeltaAndAngle");
var Gt = /* @__PURE__ */ p((e) => Array.isArray(e) ? { x: e[0], y: e[1] } : e, "pointTransformer"), JS = /* @__PURE__ */ p((e) => ({
  x: /* @__PURE__ */ p(function(t, r, i) {
    let s = 0;
    const o = Gt(i[0]).x < Gt(i[i.length - 1]).x ? "left" : "right";
    if (r === 0 && Object.hasOwn(fe, e.arrowTypeStart)) {
      const { angle: f, deltaX: m } = ds(i[0], i[1]);
      s = fe[e.arrowTypeStart] * Math.cos(f) * (m >= 0 ? 1 : -1);
    } else if (r === i.length - 1 && Object.hasOwn(fe, e.arrowTypeEnd)) {
      const { angle: f, deltaX: m } = ds(
        i[i.length - 1],
        i[i.length - 2]
      );
      s = fe[e.arrowTypeEnd] * Math.cos(f) * (m >= 0 ? 1 : -1);
    }
    const a = Math.abs(
      Gt(t).x - Gt(i[i.length - 1]).x
    ), n = Math.abs(
      Gt(t).y - Gt(i[i.length - 1]).y
    ), l = Math.abs(Gt(t).x - Gt(i[0]).x), c = Math.abs(Gt(t).y - Gt(i[0]).y), h = fe[e.arrowTypeStart], u = fe[e.arrowTypeEnd], d = 1;
    if (a < u && a > 0 && n < u) {
      let f = u + d - a;
      f *= o === "right" ? -1 : 1, s -= f;
    }
    if (l < h && l > 0 && c < h) {
      let f = h + d - l;
      f *= o === "right" ? -1 : 1, s += f;
    }
    return Gt(t).x + s;
  }, "x"),
  y: /* @__PURE__ */ p(function(t, r, i) {
    let s = 0;
    const o = Gt(i[0]).y < Gt(i[i.length - 1]).y ? "down" : "up";
    if (r === 0 && Object.hasOwn(fe, e.arrowTypeStart)) {
      const { angle: f, deltaY: m } = ds(i[0], i[1]);
      s = fe[e.arrowTypeStart] * Math.abs(Math.sin(f)) * (m >= 0 ? 1 : -1);
    } else if (r === i.length - 1 && Object.hasOwn(fe, e.arrowTypeEnd)) {
      const { angle: f, deltaY: m } = ds(
        i[i.length - 1],
        i[i.length - 2]
      );
      s = fe[e.arrowTypeEnd] * Math.abs(Math.sin(f)) * (m >= 0 ? 1 : -1);
    }
    const a = Math.abs(
      Gt(t).y - Gt(i[i.length - 1]).y
    ), n = Math.abs(
      Gt(t).x - Gt(i[i.length - 1]).x
    ), l = Math.abs(Gt(t).y - Gt(i[0]).y), c = Math.abs(Gt(t).x - Gt(i[0]).x), h = fe[e.arrowTypeStart], u = fe[e.arrowTypeEnd], d = 1;
    if (a < u && a > 0 && n < u) {
      let f = u + d - a;
      f *= o === "up" ? -1 : 1, s -= f;
    }
    if (l < h && l > 0 && c < h) {
      let f = h + d - l;
      f *= o === "up" ? -1 : 1, s += f;
    }
    return Gt(t).y + s;
  }, "y")
}), "getLineFunctionsWithOffset"), t_ = /* @__PURE__ */ p((e, t, r, i, s, o = !1, a) => {
  t.arrowTypeStart && zu(
    e,
    "start",
    t.arrowTypeStart,
    r,
    i,
    s,
    o,
    a
  ), t.arrowTypeEnd && zu(e, "end", t.arrowTypeEnd, r, i, s, o, a);
}, "addEdgeMarkers"), e_ = {
  arrow_cross: { type: "cross", fill: !1 },
  arrow_point: { type: "point", fill: !0 },
  arrow_barb: { type: "barb", fill: !0 },
  arrow_barb_neo: { type: "barb", fill: !0 },
  arrow_circle: { type: "circle", fill: !1 },
  aggregation: { type: "aggregation", fill: !1 },
  extension: { type: "extension", fill: !1 },
  composition: { type: "composition", fill: !0 },
  dependency: { type: "dependency", fill: !0 },
  lollipop: { type: "lollipop", fill: !1 },
  only_one: { type: "onlyOne", fill: !1 },
  zero_or_one: { type: "zeroOrOne", fill: !1 },
  one_or_more: { type: "oneOrMore", fill: !1 },
  zero_or_more: { type: "zeroOrMore", fill: !1 },
  requirement_arrow: { type: "requirement_arrow", fill: !1 },
  requirement_contains: { type: "requirement_contains", fill: !1 }
}, r_ = [
  "cross",
  "point",
  "circle",
  "lollipop",
  "aggregation",
  "extension",
  "composition",
  "dependency",
  "barb"
], zu = /* @__PURE__ */ p((e, t, r, i, s, o, a = !1, n) => {
  if (!r || r === "none")
    return;
  const l = e_[r], c = l && r_.includes(l.type);
  if (!l) {
    R.warn(`Unknown arrow type: ${r}`);
    return;
  }
  const h = l.type, f = `${s}_${o}-${h}${t === "start" ? "Start" : "End"}${a && c ? "-margin" : ""}`;
  if (n && n.trim() !== "") {
    const m = n.replace(/[^\dA-Za-z]/g, "_"), y = `${f}_${m}`;
    if (!document.getElementById(y)) {
      const x = document.getElementById(f);
      if (x) {
        const C = x.cloneNode(!0);
        C.id = y, C.querySelectorAll("path, circle, line").forEach((T) => {
          T.setAttribute("stroke", n), l.fill && T.setAttribute("fill", n);
        }), x.parentNode?.appendChild(C);
      }
    }
    e.attr(`marker-${t}`, `url(${i}#${y})`);
  } else
    e.attr(`marker-${t}`, `url(${i}#${f})`);
}, "addEdgeMarker"), i_ = /* @__PURE__ */ p((e) => typeof e == "string" ? e : $t()?.flowchart?.curve, "resolveEdgeCurveType"), Ii = /* @__PURE__ */ new Map(), Qt = /* @__PURE__ */ new Map(), s_ = /* @__PURE__ */ p(() => {
  Ii.clear(), Qt.clear();
}, "clear"), zm = /* @__PURE__ */ p((e) => !!(e.label || e.startLabelLeft || e.startLabelRight || e.endLabelLeft || e.endLabelRight), "hasEdgeLabel"), is = /* @__PURE__ */ p((e) => e ? typeof e == "string" ? e : e.reduce((t, r) => t + ";" + r, "") : "", "getLabelStyles"), uh = /* @__PURE__ */ p(async (e, t) => {
  const r = $t();
  let i = ge(r);
  const { labelStyles: s } = pt(t);
  t.labelStyle = s;
  const o = e.insert("g").attr("class", "edgeLabel"), a = o.insert("g").attr("class", "label").attr("data-id", t.id), n = t.labelType === "markdown", c = await Ve(
    e,
    t.label,
    {
      style: is(t.labelStyle),
      useHtmlLabels: i,
      addSvgBackground: !0,
      isNode: !1,
      markdown: n,
      // Plain text edge labels should auto-wrap, markdown edge labels respect markdownAutoWrap config
      width: n ? void 0 : void 0
    },
    r
  );
  a.node().appendChild(c), R.info("abc82", t, t.labelType);
  let h, u;
  if (i) {
    const f = c.children[0], m = At(c);
    h = await oi.measure(() => f.getBoundingClientRect()), u = h, m.attr("width", h.width), m.attr("height", h.height);
  } else {
    const f = At(c).select("text").node();
    await oi.measure(() => {
      h = c.getBBox(), f && typeof f.getBBox == "function" ? u = f.getBBox() : u = h;
    });
  }
  a.attr("transform", rs(u, i)), Ii.set(t.id, o), t.width = h.width, t.height = h.height;
  let d;
  if (t.startLabelLeft) {
    const f = e.insert("g").attr("class", "edgeTerminals"), m = f.insert("g").attr("class", "inner"), y = await Pr(
      m,
      t.startLabelLeft,
      is(t.labelStyle) || "",
      !1,
      !1
    );
    d = y;
    let x = y.getBBox();
    if (i) {
      const C = y.children[0], k = At(y);
      x = C.getBoundingClientRect(), k.attr("width", x.width), k.attr("height", x.height);
    }
    m.attr("transform", rs(x, i)), Qt.get(t.id) || Qt.set(t.id, {}), Qt.get(t.id).startLeft = f, fs(d, t.startLabelLeft);
  }
  if (t.startLabelRight) {
    const f = e.insert("g").attr("class", "edgeTerminals"), m = f.insert("g").attr("class", "inner"), y = await Pr(
      m,
      t.startLabelRight,
      is(t.labelStyle) || "",
      !1,
      !1
    );
    d = y;
    let x = y.getBBox();
    if (i) {
      const C = y.children[0], k = At(y);
      x = C.getBoundingClientRect(), k.attr("width", x.width), k.attr("height", x.height);
    }
    m.attr("transform", rs(x, i)), Qt.get(t.id) || Qt.set(t.id, {}), Qt.get(t.id).startRight = f, fs(d, t.startLabelRight);
  }
  if (t.endLabelLeft) {
    const f = e.insert("g").attr("class", "edgeTerminals"), m = f.insert("g").attr("class", "inner"), y = await Pr(
      f,
      t.endLabelLeft,
      is(t.labelStyle) || "",
      !1,
      !1
    );
    d = y;
    let x = y.getBBox();
    if (i) {
      const C = y.children[0], k = At(y);
      x = C.getBoundingClientRect(), k.attr("width", x.width), k.attr("height", x.height);
    }
    m.attr("transform", rs(x, i)), Qt.get(t.id) || Qt.set(t.id, {}), Qt.get(t.id).endLeft = f, fs(d, t.endLabelLeft);
  }
  if (t.endLabelRight) {
    const f = e.insert("g").attr("class", "edgeTerminals"), m = f.insert("g").attr("class", "inner"), y = await Pr(
      f,
      t.endLabelRight,
      is(t.labelStyle) || "",
      !1,
      !1
    );
    d = y;
    let x = y.getBBox();
    if (i) {
      const C = y.children[0], k = At(y);
      x = C.getBoundingClientRect(), k.attr("width", x.width), k.attr("height", x.height);
    }
    m.attr("transform", rs(x, i)), Qt.get(t.id) || Qt.set(t.id, {}), Qt.get(t.id).endRight = f, fs(d, t.endLabelRight);
  }
  return c;
}, "insertEdgeLabel");
function fs(e, t) {
  ge($t()) && e && (e.style.width = t.length * 9 + "px", e.style.height = "12px");
}
p(fs, "setTerminalWidth");
var o_ = /* @__PURE__ */ p((e, t) => {
  R.debug("Moving label abc88 ", e.id, e.label, Ii.get(e.id), t);
  let r = t.updatedPath ? t.updatedPath : t.originalPath;
  const i = $t(), { subGraphTitleTotalMargin: s } = ha(i);
  if (e.label) {
    const o = Ii.get(e.id);
    let a = e.x, n = e.y;
    if (r) {
      const l = pe.calcLabelPosition(r);
      R.debug(
        "Moving label " + e.label + " from (",
        a,
        ",",
        n,
        ") to (",
        l.x,
        ",",
        l.y,
        ") abc88"
      ), t.updatedPath && (a = l.x, n = l.y);
    }
    o.attr("transform", `translate(${a}, ${n + s / 2})`);
  }
  if (e.startLabelLeft) {
    const o = Qt.get(e.id).startLeft;
    let a = e.x, n = e.y;
    if (r) {
      const l = pe.calcTerminalLabelPosition(e.arrowTypeStart ? 10 : 0, "start_left", r);
      a = l.x, n = l.y;
    }
    o.attr("transform", `translate(${a}, ${n})`);
  }
  if (e.startLabelRight) {
    const o = Qt.get(e.id).startRight;
    let a = e.x, n = e.y;
    if (r) {
      const l = pe.calcTerminalLabelPosition(
        e.arrowTypeStart ? 10 : 0,
        "start_right",
        r
      );
      a = l.x, n = l.y;
    }
    o.attr("transform", `translate(${a}, ${n})`);
  }
  if (e.endLabelLeft) {
    const o = Qt.get(e.id).endLeft;
    let a = e.x, n = e.y;
    if (r) {
      const l = pe.calcTerminalLabelPosition(e.arrowTypeEnd ? 10 : 0, "end_left", r);
      a = l.x, n = l.y;
    }
    o.attr("transform", `translate(${a}, ${n})`);
  }
  if (e.endLabelRight) {
    const o = Qt.get(e.id).endRight;
    let a = e.x, n = e.y;
    if (r) {
      const l = pe.calcTerminalLabelPosition(e.arrowTypeEnd ? 10 : 0, "end_right", r);
      a = l.x, n = l.y;
    }
    o.attr("transform", `translate(${a}, ${n})`);
  }
}, "positionEdgeLabel"), a_ = /* @__PURE__ */ p((e, t) => {
  if (!e?.isLabelEdge || !e?.id?.endsWith("-to-label") || !Array.isArray(t) || t.length !== 2)
    return t;
  const [r, i] = t, s = Math.abs(i.x - r.x), o = Math.abs(i.y - r.y);
  return s < 1e-3 || o < 1e-3 ? t : o >= s ? [r, { x: r.x, y: i.y }, i] : [r, { x: i.x, y: r.y }, i];
}, "orthogonalizeToLabelClippedPoints"), n_ = /* @__PURE__ */ p((e, t) => {
  const r = e.x, i = e.y, s = Math.abs(t.x - r), o = Math.abs(t.y - i), a = e.width / 2, n = e.height / 2;
  return s >= a || o >= n;
}, "outsideNode"), l_ = /* @__PURE__ */ p((e, t, r) => {
  R.debug(`intersection calc abc89:
  outsidePoint: ${JSON.stringify(t)}
  insidePoint : ${JSON.stringify(r)}
  node        : x:${e.x} y:${e.y} w:${e.width} h:${e.height}`);
  const i = e.x, s = e.y, o = Math.abs(i - r.x), a = e.width / 2;
  let n = r.x < t.x ? a - o : a + o;
  const l = e.height / 2, c = Math.abs(t.y - r.y), h = Math.abs(t.x - r.x);
  if (Math.abs(s - t.y) * a > Math.abs(i - t.x) * l) {
    let u = r.y < t.y ? t.y - l - s : s - l - t.y;
    n = h * u / c;
    const d = {
      x: r.x < t.x ? r.x + n : r.x - h + n,
      y: r.y < t.y ? r.y + c - u : r.y - c + u
    };
    return n === 0 && (d.x = t.x, d.y = t.y), h === 0 && (d.x = t.x), c === 0 && (d.y = t.y), R.debug(`abc89 top/bottom calc, Q ${c}, q ${u}, R ${h}, r ${n}`, d), d;
  } else {
    r.x < t.x ? n = t.x - a - i : n = i - a - t.x;
    let u = c * n / h, d = r.x < t.x ? r.x + h - n : r.x - h + n, f = r.y < t.y ? r.y + u : r.y - u;
    return R.debug(`sides calc abc89, Q ${c}, q ${u}, R ${h}, r ${n}`, { _x: d, _y: f }), n === 0 && (d = t.x, f = t.y), h === 0 && (d = t.x), c === 0 && (f = t.y), { x: d, y: f };
  }
}, "intersection"), Wu = /* @__PURE__ */ p((e, t) => {
  R.warn("abc88 cutPathAtIntersect", e, t);
  let r = [], i = e[0], s = !1;
  return e.forEach((o) => {
    if (R.info("abc88 checking point", o, t), !n_(t, o) && !s) {
      const a = l_(t, i, o);
      R.debug("abc88 inside", o, i, a), R.debug("abc88 intersection", a, t);
      let n = !1;
      r.forEach((l) => {
        n = n || l.x === a.x && l.y === a.y;
      }), r.some((l) => l.x === a.x && l.y === a.y) ? R.warn("abc88 no intersect", a, r) : r.push(a), s = !0;
    } else
      R.warn("abc88 outside", o, i), i = o, s || r.push(o);
  }), R.debug("returning points", r), r;
}, "cutPathAtIntersect");
function Wm(e) {
  const t = [], r = [];
  for (let i = 1; i < e.length - 1; i++) {
    const s = e[i - 1], o = e[i], a = e[i + 1];
    (s.x === o.x && o.y === a.y && Math.abs(o.x - a.x) > 5 && Math.abs(o.y - s.y) > 5 || s.y === o.y && o.x === a.x && Math.abs(o.x - s.x) > 5 && Math.abs(o.y - a.y) > 5) && (t.push(o), r.push(i));
  }
  return { cornerPoints: t, cornerPointPositions: r };
}
p(Wm, "extractCornerPoints");
var Hu = /* @__PURE__ */ p(function(e, t, r) {
  const i = t.x - e.x, s = t.y - e.y, o = Math.sqrt(i * i + s * s), a = r / o;
  return { x: t.x - a * i, y: t.y - a * s };
}, "findAdjacentPoint"), h_ = /* @__PURE__ */ p(function(e) {
  const { cornerPointPositions: t } = Wm(e), r = [];
  for (let i = 0; i < e.length; i++)
    if (t.includes(i)) {
      const s = e[i - 1], o = e[i + 1], a = e[i], n = Hu(s, a, 5), l = Hu(o, a, 5), c = l.x - n.x, h = l.y - n.y;
      r.push(n);
      const u = Math.sqrt(2) * 2;
      let d = { x: a.x, y: a.y };
      if (Math.abs(o.x - s.x) > 10 && Math.abs(o.y - s.y) >= 10) {
        R.debug(
          "Corner point fixing",
          Math.abs(o.x - s.x),
          Math.abs(o.y - s.y)
        );
        const f = 5;
        a.x === n.x ? d = {
          x: c < 0 ? n.x - f + u : n.x + f - u,
          y: h < 0 ? n.y - u : n.y + u
        } : d = {
          x: c < 0 ? n.x - u : n.x + u,
          y: h < 0 ? n.y - f + u : n.y + f - u
        };
      } else
        R.debug(
          "Corner point skipping fixing",
          Math.abs(o.x - s.x),
          Math.abs(o.y - s.y)
        );
      r.push(d, l);
    } else
      r.push(e[i]);
  return r;
}, "fixCorners"), c_ = /* @__PURE__ */ p((e, t, r) => {
  const i = e - t - r, s = 2, o = 2, a = s + o, n = Math.floor(i / a), l = Number.isFinite(n) ? Math.max(0, n) : 0, c = Array(l).fill(`${s} ${o}`).join(" ");
  return `0 ${t} ${c} ${r}`;
}, "generateDashArray"), Hm = /* @__PURE__ */ p(function(e, t, r, i, s, o, a, n = !1) {
  if (!a)
    throw new Error(
      `insertEdge: missing diagramId for edge "${t.id}" — edge IDs require a diagram prefix for uniqueness`
    );
  const { handDrawnSeed: l, layout: c } = $t();
  let h = t.points, u = !1;
  const d = s;
  var f = o;
  const m = [];
  for (const I in t.cssCompiledStyles)
    mp(I) || m.push(t.cssCompiledStyles[I]);
  if (c === "swimlane") {
    if (f.intersect && d.intersect && Array.isArray(h) && h.length >= 2)
      if (h.length === 2)
        h = [d.intersect(h[0]), f.intersect(h[1])];
      else {
        const I = h.slice(1, -1), it = I[0], Q = I[I.length - 1], mt = 0.5, St = Math.abs(h[h.length - 1].x - Q.x) < mt && Math.abs(h[h.length - 1].y - Q.y) < mt, Tt = d.intersect(it), ft = St ? Q : f.intersect(Q), Lt = Math.abs(ft.x - Q.x) < mt && Math.abs(ft.y - Q.y) < mt, wt = Math.abs(Tt.x - it.x) < mt && Math.abs(Tt.y - it.y) < mt ? [] : [Tt], Et = Lt ? [] : [ft];
        h = [...wt, ...I, ...Et];
      }
    h = a_(t, h);
  } else f.intersect && d.intersect && !n && (h = h.slice(1, t.points.length - 1), h.unshift(d.intersect(h[0])), h.push(f.intersect(h[h.length - 1])));
  const y = btoa(JSON.stringify(h));
  t.toCluster && (R.info("to cluster abc88", r.get(t.toCluster)), h = Wu(t.points, r.get(t.toCluster).node), u = !0), t.fromCluster && (R.debug(
    "from cluster abc88",
    r.get(t.fromCluster),
    JSON.stringify(h, null, 2)
  ), h = Wu(h.reverse(), r.get(t.fromCluster).node).reverse(), u = !0);
  let x = h.filter((I) => !Number.isNaN(I.y));
  const C = i_(t.curve);
  C !== "rounded" && (x = h_(x));
  let k = Cs;
  switch (C) {
    case "linear":
      k = Cs;
      break;
    case "basis":
      k = Yn;
      break;
    case "cardinal":
      k = ep;
      break;
    case "bumpX":
      k = Zf;
      break;
    case "bumpY":
      k = Kf;
      break;
    case "catmullRom":
      k = ip;
      break;
    case "monotoneX":
      k = hp;
      break;
    case "monotoneY":
      k = cp;
      break;
    case "natural":
      k = dp;
      break;
    case "step":
      k = fp;
      break;
    case "stepAfter":
      k = gp;
      break;
    case "stepBefore":
      k = pp;
      break;
    case "rounded":
      k = Cs;
      break;
    default:
      k = Yn;
  }
  const { x: T, y: _ } = JS(t), v = _2().x(T).y(_).curve(k);
  let L;
  switch (t.thickness) {
    case "normal":
      L = "edge-thickness-normal";
      break;
    case "thick":
      L = "edge-thickness-thick";
      break;
    case "invisible":
      L = "edge-thickness-invisible";
      break;
    default:
      L = "edge-thickness-normal";
  }
  switch (t.pattern) {
    case "solid":
      L += " edge-pattern-solid";
      break;
    case "dotted":
      L += " edge-pattern-dotted";
      break;
    case "dashed":
      L += " edge-pattern-dashed";
      break;
    default:
      L += " edge-pattern-solid";
  }
  let A, F = C === "rounded" ? Ym(Um(x, t), 5) : v(x);
  const G = Array.isArray(t.style) ? t.style : [t.style];
  let Y = G.find((I) => I?.startsWith("stroke:")), N = "";
  t.animate && (N = "edge-animation-fast"), t.animation && (N = "edge-animation-" + t.animation);
  let st = !1;
  if (t.look === "handDrawn") {
    const I = ut.svg(e);
    Object.assign([], x);
    const it = I.path(F, {
      roughness: 0.3,
      seed: l
    });
    L += " transition", A = At(it).select("path").attr("id", `${a}-${t.id}`).attr(
      "class",
      " " + L + (t.classes ? " " + t.classes : "") + (N ? " " + N : "")
    ).attr("style", G ? G.reduce((mt, St) => mt + ";" + St, "") : "");
    let Q = A.attr("d");
    A.attr("d", Q), e.node().appendChild(A.node());
  } else {
    const I = m.join(";"), it = G ? G.reduce((Lt, gt) => Lt + gt + ";", "") : "", Q = (I ? I + ";" + it + ";" : it) + ";" + (G ? G.reduce((Lt, gt) => Lt + ";" + gt, "") : "");
    A = e.append("path").attr("d", F).attr("id", `${a}-${t.id}`).attr(
      "class",
      " " + L + (t.classes ? " " + t.classes : "") + (N ? " " + N : "")
    ).attr("style", Q), Y = Q.match(/stroke:([^;]+)/)?.[1], st = t.animate === !0 || !!t.animation || I.includes("animation");
    const mt = A.node(), St = typeof mt.getTotalLength == "function" ? mt.getTotalLength() : 0, Tt = qu[t.arrowTypeStart] || 0, ft = qu[t.arrowTypeEnd] || 0;
    if (t.look === "neo" && !st) {
      const gt = `stroke-dasharray: ${t.pattern === "dotted" || t.pattern === "dashed" ? c_(St, Tt, ft) : `0 ${Tt} ${St - Tt - ft} ${ft}`}; stroke-dashoffset: 0;`;
      A.attr("style", gt + A.attr("style"));
    }
  }
  A.attr("data-edge", !0), A.attr("data-et", "edge"), A.attr("data-id", t.id), A.attr("data-points", y), A.attr("data-look", te(t.look)), t.showPoints && x.forEach((I) => {
    e.append("circle").style("stroke", "red").style("fill", "red").attr("r", 1).attr("cx", I.x).attr("cy", I.y);
  });
  let U = "";
  ($t().flowchart.arrowMarkerAbsolute || $t().state.arrowMarkerAbsolute) && (U = window.location.protocol + "//" + window.location.host + window.location.pathname + window.location.search, U = U.replace(/\(/g, "\\(").replace(/\)/g, "\\)")), R.info("arrowTypeStart", t.arrowTypeStart), R.info("arrowTypeEnd", t.arrowTypeEnd);
  const O = !st && t?.look === "neo";
  t_(A, t, U, a, i, O, Y);
  const D = Math.floor(h.length / 2), B = h[D];
  pe.isLabelCoordinateInPath(B, A.attr("d")) || (u = !0);
  let q = {};
  return u && (q.updatedPath = h), q.originalPath = t.points, q;
}, "insertEdge");
function Ym(e, t) {
  if (e.length < 2)
    return "";
  let r = "";
  const i = e.length, s = 1e-5;
  for (let o = 0; o < i; o++) {
    const a = e[o], n = e[o - 1], l = e[o + 1];
    if (o === 0)
      r += `M${a.x},${a.y}`;
    else if (o === i - 1)
      r += `L${a.x},${a.y}`;
    else {
      const c = a.x - n.x, h = a.y - n.y, u = l.x - a.x, d = l.y - a.y, f = Math.hypot(c, h), m = Math.hypot(u, d);
      if (f < s || m < s) {
        r += `L${a.x},${a.y}`;
        continue;
      }
      const y = c / f, x = h / f, C = u / m, k = d / m, T = y * C + x * k, _ = Math.max(-1, Math.min(1, T)), v = Math.acos(_);
      if (v < s || Math.abs(Math.PI - v) < s) {
        r += `L${a.x},${a.y}`;
        continue;
      }
      const L = Math.min(t / Math.sin(v / 2), f / 2, m / 2), A = a.x - y * L, F = a.y - x * L, G = a.x + C * L, Y = a.y + k * L;
      r += `L${A},${F}`, r += `Q${a.x},${a.y} ${G},${Y}`;
    }
  }
  return r;
}
p(Ym, "generateRoundedPath");
function al(e, t) {
  if (!e || !t)
    return { angle: 0, deltaX: 0, deltaY: 0 };
  const r = t.x - e.x, i = t.y - e.y;
  return { angle: Math.atan2(i, r), deltaX: r, deltaY: i };
}
p(al, "calculateDeltaAndAngle");
function Um(e, t) {
  const r = e.map((s) => ({ ...s }));
  if (e.length >= 2 && fe[t.arrowTypeStart]) {
    const s = fe[t.arrowTypeStart], o = e[0], a = e[1], { angle: n } = al(o, a), l = s * Math.cos(n), c = s * Math.sin(n);
    r[0].x = o.x + l, r[0].y = o.y + c;
  }
  const i = e.length;
  if (i >= 2 && fe[t.arrowTypeEnd]) {
    const s = fe[t.arrowTypeEnd], o = e[i - 1], a = e[i - 2], { angle: n } = al(a, o), l = s * Math.cos(n), c = s * Math.sin(n);
    r[i - 1].x = o.x - l, r[i - 1].y = o.y - c;
  }
  return r;
}
p(Um, "applyMarkerOffsetsToPoints");
var u_ = /* @__PURE__ */ p((e, t, r, i) => {
  t.forEach((s) => {
    O_[s](e, r, i);
  });
}, "insertMarkers"), d_ = /* @__PURE__ */ p((e, t, r) => {
  R.trace("Making markers for ", r), e.append("defs").append("marker").attr("id", r + "_" + t + "-extensionStart").attr("class", "marker extension " + t).attr("refX", 18).attr("refY", 7).attr("markerWidth", 20).attr("markerHeight", 28).attr("orient", "auto").attr("markerUnits", "userSpaceOnUse").append("path").attr("d", "M 1,7 L18,13 V 1 Z"), e.append("defs").append("marker").attr("id", r + "_" + t + "-extensionEnd").attr("class", "marker extension " + t).attr("refX", 1).attr("refY", 7).attr("markerWidth", 20).attr("markerHeight", 28).attr("orient", "auto").attr("markerUnits", "userSpaceOnUse").append("path").attr("d", "M 1,1 V 13 L18,7 Z"), e.append("marker").attr("id", r + "_" + t + "-extensionStart-margin").attr("class", "marker extension " + t).attr("refX", 18).attr("refY", 7).attr("markerWidth", 20).attr("markerHeight", 28).attr("orient", "auto").attr("markerUnits", "userSpaceOnUse").attr("viewBox", "0 0 20 14").append("polygon").attr("points", "10,7 18,13 18,1").style("stroke-width", 2).style("stroke-dasharray", "0"), e.append("defs").append("marker").attr("id", r + "_" + t + "-extensionEnd-margin").attr("class", "marker extension " + t).attr("refX", 9).attr("refY", 7).attr("markerWidth", 20).attr("markerHeight", 28).attr("orient", "auto").attr("markerUnits", "userSpaceOnUse").attr("viewBox", "0 0 20 14").append("polygon").attr("points", "10,1 10,13 18,7").style("stroke-width", 2).style("stroke-dasharray", "0");
}, "extension"), f_ = /* @__PURE__ */ p((e, t, r) => {
  e.append("defs").append("marker").attr("id", r + "_" + t + "-compositionStart").attr("class", "marker composition " + t).attr("refX", 18).attr("refY", 7).attr("markerWidth", 190).attr("markerHeight", 240).attr("orient", "auto").attr("markerUnits", "userSpaceOnUse").append("path").attr("d", "M 18,7 L9,13 L1,7 L9,1 Z"), e.append("defs").append("marker").attr("id", r + "_" + t + "-compositionEnd").attr("class", "marker composition " + t).attr("refX", 1).attr("refY", 7).attr("markerWidth", 20).attr("markerHeight", 28).attr("orient", "auto").attr("markerUnits", "userSpaceOnUse").append("path").attr("d", "M 18,7 L9,13 L1,7 L9,1 Z"), e.append("defs").append("marker").attr("id", r + "_" + t + "-compositionStart-margin").attr("class", "marker composition " + t).attr("refX", 15).attr("refY", 7).attr("markerWidth", 190).attr("markerHeight", 240).attr("orient", "auto").attr("markerUnits", "userSpaceOnUse").append("path").style("stroke-width", 0).attr("viewBox", "0 0 15 15").attr("d", "M 18,7 L9,13 L1,7 L9,1 Z"), e.append("defs").append("marker").attr("id", r + "_" + t + "-compositionEnd-margin").attr("class", "marker composition " + t).attr("refX", 3.5).attr("refY", 7).attr("markerWidth", 20).attr("markerHeight", 28).attr("orient", "auto").attr("markerUnits", "userSpaceOnUse").append("path").style("stroke-width", 0).attr("d", "M 18,7 L9,13 L1,7 L9,1 Z");
}, "composition"), p_ = /* @__PURE__ */ p((e, t, r) => {
  e.append("defs").append("marker").attr("id", r + "_" + t + "-aggregationStart").attr("class", "marker aggregation " + t).attr("refX", 18).attr("refY", 7).attr("markerWidth", 190).attr("markerHeight", 240).attr("orient", "auto").attr("markerUnits", "userSpaceOnUse").append("path").attr("d", "M 18,7 L9,13 L1,7 L9,1 Z"), e.append("defs").append("marker").attr("id", r + "_" + t + "-aggregationEnd").attr("class", "marker aggregation " + t).attr("refX", 1).attr("refY", 7).attr("markerWidth", 20).attr("markerHeight", 28).attr("orient", "auto").attr("markerUnits", "userSpaceOnUse").append("path").attr("d", "M 18,7 L9,13 L1,7 L9,1 Z"), e.append("defs").append("marker").attr("id", r + "_" + t + "-aggregationStart-margin").attr("class", "marker aggregation " + t).attr("refX", 15).attr("refY", 7).attr("markerWidth", 190).attr("markerHeight", 240).attr("orient", "auto").attr("markerUnits", "userSpaceOnUse").append("path").style("stroke-width", 2).attr("d", "M 18,7 L9,13 L1,7 L9,1 Z"), e.append("defs").append("marker").attr("id", r + "_" + t + "-aggregationEnd-margin").attr("class", "marker aggregation " + t).attr("refX", 1).attr("refY", 7).attr("markerWidth", 20).attr("markerHeight", 28).attr("orient", "auto").attr("markerUnits", "userSpaceOnUse").append("path").style("stroke-width", 2).attr("d", "M 18,7 L9,13 L1,7 L9,1 Z");
}, "aggregation"), g_ = /* @__PURE__ */ p((e, t, r) => {
  e.append("defs").append("marker").attr("id", r + "_" + t + "-dependencyStart").attr("class", "marker dependency " + t).attr("refX", 6).attr("refY", 7).attr("markerWidth", 190).attr("markerHeight", 240).attr("orient", "auto").attr("markerUnits", "userSpaceOnUse").append("path").attr("d", "M 5,7 L9,13 L1,7 L9,1 Z"), e.append("defs").append("marker").attr("id", r + "_" + t + "-dependencyEnd").attr("class", "marker dependency " + t).attr("refX", 13).attr("refY", 7).attr("markerWidth", 20).attr("markerHeight", 28).attr("orient", "auto").attr("markerUnits", "userSpaceOnUse").append("path").attr("d", "M 18,7 L9,13 L14,7 L9,1 Z"), e.append("defs").append("marker").attr("id", r + "_" + t + "-dependencyStart-margin").attr("class", "marker dependency " + t).attr("refX", 4).attr("refY", 7).attr("markerWidth", 190).attr("markerHeight", 240).attr("orient", "auto").attr("markerUnits", "userSpaceOnUse").append("path").style("stroke-width", 0).attr("d", "M 5,7 L9,13 L1,7 L9,1 Z"), e.append("defs").append("marker").attr("id", r + "_" + t + "-dependencyEnd-margin").attr("class", "marker dependency " + t).attr("refX", 16).attr("refY", 7).attr("markerWidth", 20).attr("markerHeight", 28).attr("orient", "auto").attr("markerUnits", "userSpaceOnUse").append("path").style("stroke-width", 0).attr("d", "M 18,7 L9,13 L14,7 L9,1 Z");
}, "dependency"), m_ = /* @__PURE__ */ p((e, t, r) => {
  e.append("defs").append("marker").attr("id", r + "_" + t + "-lollipopStart").attr("class", "marker lollipop " + t).attr("refX", 13).attr("refY", 7).attr("markerWidth", 190).attr("markerHeight", 240).attr("orient", "auto").attr("markerUnits", "userSpaceOnUse").append("circle").attr("fill", "transparent").attr("cx", 7).attr("cy", 7).attr("r", 6), e.append("defs").append("marker").attr("id", r + "_" + t + "-lollipopEnd").attr("class", "marker lollipop " + t).attr("refX", 1).attr("refY", 7).attr("markerWidth", 190).attr("markerHeight", 240).attr("orient", "auto").attr("markerUnits", "userSpaceOnUse").append("circle").attr("fill", "transparent").attr("cx", 7).attr("cy", 7).attr("r", 6), e.append("defs").append("marker").attr("id", r + "_" + t + "-lollipopStart-margin").attr("class", "marker lollipop " + t).attr("refX", 13).attr("refY", 7).attr("markerWidth", 190).attr("markerHeight", 240).attr("orient", "auto").attr("markerUnits", "userSpaceOnUse").append("circle").attr("fill", "transparent").attr("cx", 7).attr("cy", 7).attr("r", 6).attr("stroke-width", 2), e.append("defs").append("marker").attr("id", r + "_" + t + "-lollipopEnd-margin").attr("class", "marker lollipop " + t).attr("refX", 1).attr("refY", 7).attr("markerWidth", 190).attr("markerHeight", 240).attr("orient", "auto").attr("markerUnits", "userSpaceOnUse").append("circle").attr("fill", "transparent").attr("cx", 7).attr("cy", 7).attr("r", 6).attr("stroke-width", 2);
}, "lollipop"), y_ = /* @__PURE__ */ p((e, t, r) => {
  e.append("marker").attr("id", r + "_" + t + "-pointEnd").attr("class", "marker " + t).attr("viewBox", "0 0 10 10").attr("refX", 5).attr("refY", 5).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 8).attr("markerHeight", 8).attr("orient", "auto").append("path").attr("d", "M 0 0 L 10 5 L 0 10 z").attr("class", "arrowMarkerPath").style("stroke-width", 1).style("stroke-dasharray", "1,0"), e.append("marker").attr("id", r + "_" + t + "-pointStart").attr("class", "marker " + t).attr("viewBox", "0 0 10 10").attr("refX", 4.5).attr("refY", 5).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 8).attr("markerHeight", 8).attr("orient", "auto").append("path").attr("d", "M 0 5 L 10 10 L 10 0 z").attr("class", "arrowMarkerPath").style("stroke-width", 1).style("stroke-dasharray", "1,0"), e.append("marker").attr("id", r + "_" + t + "-pointEnd-margin").attr("class", "marker " + t).attr("viewBox", "0 0 11.5 14").attr("refX", 11.5).attr("refY", 7).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 10.5).attr("markerHeight", 14).attr("orient", "auto").append("path").attr("d", "M 0 0 L 11.5 7 L 0 14 z").attr("class", "arrowMarkerPath").style("stroke-width", 0).style("stroke-dasharray", "1,0"), e.append("marker").attr("id", r + "_" + t + "-pointStart-margin").attr("class", "marker " + t).attr("viewBox", "0 0 11.5 14").attr("refX", 1).attr("refY", 7).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 11.5).attr("markerHeight", 14).attr("orient", "auto").append("polygon").attr("points", "0,7 11.5,14 11.5,0").attr("class", "arrowMarkerPath").style("stroke-width", 0).style("stroke-dasharray", "1,0");
}, "point"), x_ = /* @__PURE__ */ p((e, t, r) => {
  e.append("marker").attr("id", r + "_" + t + "-circleEnd").attr("class", "marker " + t).attr("viewBox", "0 0 10 10").attr("refX", 11).attr("refY", 5).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 11).attr("markerHeight", 11).attr("orient", "auto").append("circle").attr("cx", "5").attr("cy", "5").attr("r", "5").attr("class", "arrowMarkerPath").style("stroke-width", 1).style("stroke-dasharray", "1,0"), e.append("marker").attr("id", r + "_" + t + "-circleStart").attr("class", "marker " + t).attr("viewBox", "0 0 10 10").attr("refX", -1).attr("refY", 5).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 11).attr("markerHeight", 11).attr("orient", "auto").append("circle").attr("cx", "5").attr("cy", "5").attr("r", "5").attr("class", "arrowMarkerPath").style("stroke-width", 1).style("stroke-dasharray", "1,0"), e.append("marker").attr("id", r + "_" + t + "-circleEnd-margin").attr("class", "marker " + t).attr("viewBox", "0 0 10 10").attr("refY", 5).attr("refX", 12.25).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 14).attr("markerHeight", 14).attr("orient", "auto").append("circle").attr("cx", "5").attr("cy", "5").attr("r", "5").attr("class", "arrowMarkerPath").style("stroke-width", 0).style("stroke-dasharray", "1,0"), e.append("marker").attr("id", r + "_" + t + "-circleStart-margin").attr("class", "marker " + t).attr("viewBox", "0 0 10 10").attr("refX", -2).attr("refY", 5).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 14).attr("markerHeight", 14).attr("orient", "auto").append("circle").attr("cx", "5").attr("cy", "5").attr("r", "5").attr("class", "arrowMarkerPath").style("stroke-width", 0).style("stroke-dasharray", "1,0");
}, "circle"), C_ = /* @__PURE__ */ p((e, t, r) => {
  e.append("marker").attr("id", r + "_" + t + "-crossEnd").attr("class", "marker cross " + t).attr("viewBox", "0 0 11 11").attr("refX", 12).attr("refY", 5.2).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 11).attr("markerHeight", 11).attr("orient", "auto").append("path").attr("d", "M 1,1 l 9,9 M 10,1 l -9,9").attr("class", "arrowMarkerPath").style("stroke-width", 2).style("stroke-dasharray", "1,0"), e.append("marker").attr("id", r + "_" + t + "-crossStart").attr("class", "marker cross " + t).attr("viewBox", "0 0 11 11").attr("refX", -1).attr("refY", 5.2).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 11).attr("markerHeight", 11).attr("orient", "auto").append("path").attr("d", "M 1,1 l 9,9 M 10,1 l -9,9").attr("class", "arrowMarkerPath").style("stroke-width", 2).style("stroke-dasharray", "1,0"), e.append("marker").attr("id", r + "_" + t + "-crossEnd-margin").attr("class", "marker cross " + t).attr("viewBox", "0 0 15 15").attr("refX", 17.7).attr("refY", 7.5).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 12).attr("markerHeight", 12).attr("orient", "auto").append("path").attr("d", "M 1,1 L 14,14 M 1,14 L 14,1").attr("class", "arrowMarkerPath").style("stroke-width", 2.5), e.append("marker").attr("id", r + "_" + t + "-crossStart-margin").attr("class", "marker cross " + t).attr("viewBox", "0 0 15 15").attr("refX", -3.5).attr("refY", 7.5).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 12).attr("markerHeight", 12).attr("orient", "auto").append("path").attr("d", "M 1,1 L 14,14 M 1,14 L 14,1").attr("class", "arrowMarkerPath").style("stroke-width", 2.5).style("stroke-dasharray", "1,0");
}, "cross"), b_ = /* @__PURE__ */ p((e, t, r) => {
  e.append("defs").append("marker").attr("id", r + "_" + t + "-barbEnd").attr("refX", 19).attr("refY", 7).attr("markerWidth", 20).attr("markerHeight", 14).attr("markerUnits", "userSpaceOnUse").attr("orient", "auto").append("path").attr("d", "M 19,7 L9,13 L14,7 L9,1 Z");
}, "barb"), k_ = /* @__PURE__ */ p((e, t, r) => {
  const i = Xt(), { themeVariables: s } = i, { transitionColor: o } = s;
  e.append("defs").append("marker").attr("id", r + "_" + t + "-barbEnd").attr("refX", 19).attr("refY", 7).attr("markerWidth", 20).attr("markerHeight", 14).attr("markerUnits", "strokeWidth").attr("orient", "auto").append("path").attr("d", "M 19,7 L11,14 L13,7 L11,0 Z"), e.append("defs").append("marker").attr("id", r + "_" + t + "-barbEnd-margin").attr("refX", 17).attr("refY", 7).attr("markerWidth", 20).attr("markerHeight", 14).attr("markerUnits", "userSpaceOnUse").attr("orient", "auto").append("path").attr("d", "M 19,7 L11,14 L13,7 L11,0 Z").attr("fill", `${o}`);
}, "barbNeo"), w_ = /* @__PURE__ */ p((e, t, r) => {
  e.append("defs").append("marker").attr("id", r + "_" + t + "-onlyOneStart").attr("class", "marker onlyOne " + t).attr("refX", 0).attr("refY", 9).attr("markerWidth", 18).attr("markerHeight", 18).attr("orient", "auto").append("path").attr("d", "M9,0 L9,18 M15,0 L15,18"), e.append("defs").append("marker").attr("id", r + "_" + t + "-onlyOneEnd").attr("class", "marker onlyOne " + t).attr("refX", 18).attr("refY", 9).attr("markerWidth", 18).attr("markerHeight", 18).attr("orient", "auto").append("path").attr("d", "M3,0 L3,18 M9,0 L9,18");
}, "only_one"), T_ = /* @__PURE__ */ p((e, t, r) => {
  const i = e.append("defs").append("marker").attr("id", r + "_" + t + "-zeroOrOneStart").attr("class", "marker zeroOrOne " + t).attr("refX", 0).attr("refY", 9).attr("markerWidth", 30).attr("markerHeight", 18).attr("orient", "auto");
  i.append("circle").attr("fill", "white").attr("cx", 21).attr("cy", 9).attr("r", 6), i.append("path").attr("d", "M9,0 L9,18");
  const s = e.append("defs").append("marker").attr("id", r + "_" + t + "-zeroOrOneEnd").attr("class", "marker zeroOrOne " + t).attr("refX", 30).attr("refY", 9).attr("markerWidth", 30).attr("markerHeight", 18).attr("orient", "auto");
  s.append("circle").attr("fill", "white").attr("cx", 9).attr("cy", 9).attr("r", 6), s.append("path").attr("d", "M21,0 L21,18");
}, "zero_or_one"), S_ = /* @__PURE__ */ p((e, t, r) => {
  e.append("defs").append("marker").attr("id", r + "_" + t + "-oneOrMoreStart").attr("class", "marker oneOrMore " + t).attr("refX", 18).attr("refY", 18).attr("markerWidth", 45).attr("markerHeight", 36).attr("orient", "auto").append("path").attr("d", "M0,18 Q 18,0 36,18 Q 18,36 0,18 M42,9 L42,27"), e.append("defs").append("marker").attr("id", r + "_" + t + "-oneOrMoreEnd").attr("class", "marker oneOrMore " + t).attr("refX", 27).attr("refY", 18).attr("markerWidth", 45).attr("markerHeight", 36).attr("orient", "auto").append("path").attr("d", "M3,9 L3,27 M9,18 Q27,0 45,18 Q27,36 9,18");
}, "one_or_more"), __ = /* @__PURE__ */ p((e, t, r) => {
  const i = e.append("defs").append("marker").attr("id", r + "_" + t + "-zeroOrMoreStart").attr("class", "marker zeroOrMore " + t).attr("refX", 18).attr("refY", 18).attr("markerWidth", 57).attr("markerHeight", 36).attr("orient", "auto");
  i.append("circle").attr("fill", "white").attr("cx", 48).attr("cy", 18).attr("r", 6), i.append("path").attr("d", "M0,18 Q18,0 36,18 Q18,36 0,18");
  const s = e.append("defs").append("marker").attr("id", r + "_" + t + "-zeroOrMoreEnd").attr("class", "marker zeroOrMore " + t).attr("refX", 39).attr("refY", 18).attr("markerWidth", 57).attr("markerHeight", 36).attr("orient", "auto");
  s.append("circle").attr("fill", "white").attr("cx", 9).attr("cy", 18).attr("r", 6), s.append("path").attr("d", "M21,18 Q39,0 57,18 Q39,36 21,18");
}, "zero_or_more"), v_ = /* @__PURE__ */ p((e, t, r) => {
  const i = Xt(), { themeVariables: s } = i, { strokeWidth: o } = s;
  e.append("defs").append("marker").attr("id", r + "_" + t + "-onlyOneStart").attr("class", "marker onlyOne " + t).attr("refX", 0).attr("refY", 9).attr("markerWidth", 18).attr("markerHeight", 18).attr("orient", "auto").attr("markerUnits", "userSpaceOnUse").append("path").attr("d", "M9,0 L9,18 M15,0 L15,18").attr("stroke-width", `${o}`), e.append("defs").append("marker").attr("id", r + "_" + t + "-onlyOneEnd").attr("class", "marker onlyOne " + t).attr("refX", 18).attr("refY", 9).attr("markerWidth", 18).attr("markerHeight", 18).attr("orient", "auto").attr("markerUnits", "userSpaceOnUse").append("path").attr("d", "M3,0 L3,18 M9,0 L9,18").attr("stroke-width", `${o}`);
}, "only_one_neo"), B_ = /* @__PURE__ */ p((e, t, r) => {
  const i = Xt(), { themeVariables: s } = i, { strokeWidth: o, mainBkg: a } = s, n = e.append("defs").append("marker").attr("id", r + "_" + t + "-zeroOrOneStart").attr("class", "marker zeroOrOne " + t).attr("refX", 0).attr("refY", 9).attr("markerWidth", 30).attr("markerHeight", 18).attr("orient", "auto").attr("markerUnits", "userSpaceOnUse");
  n.append("circle").attr("fill", a ?? "white").attr("cx", 21).attr("cy", 9).attr("stroke-width", `${o}`).attr("r", 6), n.append("path").attr("d", "M9,0 L9,18").attr("stroke-width", `${o}`);
  const l = e.append("defs").append("marker").attr("id", r + "_" + t + "-zeroOrOneEnd").attr("class", "marker zeroOrOne " + t).attr("refX", 30).attr("refY", 9).attr("markerWidth", 30).attr("markerHeight", 18).attr("markerUnits", "userSpaceOnUse").attr("orient", "auto");
  l.append("circle").attr("fill", a ?? "white").attr("cx", 9).attr("cy", 9).attr("stroke-width", `${o}`).attr("r", 6), l.append("path").attr("d", "M21,0 L21,18").attr("stroke-width", `${o}`);
}, "zero_or_one_neo"), L_ = /* @__PURE__ */ p((e, t, r) => {
  const i = Xt(), { themeVariables: s } = i, { strokeWidth: o } = s;
  e.append("defs").append("marker").attr("id", r + "_" + t + "-oneOrMoreStart").attr("class", "marker oneOrMore " + t).attr("refX", 18).attr("refY", 18).attr("markerWidth", 45).attr("markerHeight", 36).attr("orient", "auto").attr("markerUnits", "userSpaceOnUse").append("path").attr("d", "M0,18 Q 18,0 36,18 Q 18,36 0,18 M42,9 L42,27").attr("stroke-width", `${o}`), e.append("defs").append("marker").attr("id", r + "_" + t + "-oneOrMoreEnd").attr("class", "marker oneOrMore " + t).attr("refX", 27).attr("refY", 18).attr("markerWidth", 45).attr("markerHeight", 36).attr("markerUnits", "userSpaceOnUse").attr("orient", "auto").append("path").attr("d", "M3,9 L3,27 M9,18 Q27,0 45,18 Q27,36 9,18").attr("stroke-width", `${o}`);
}, "one_or_more_neo"), F_ = /* @__PURE__ */ p((e, t, r) => {
  const i = Xt(), { themeVariables: s } = i, { strokeWidth: o, mainBkg: a } = s, n = e.append("defs").append("marker").attr("id", r + "_" + t + "-zeroOrMoreStart").attr("class", "marker zeroOrMore " + t).attr("refX", 18).attr("refY", 18).attr("markerWidth", 57).attr("markerHeight", 36).attr("markerUnits", "userSpaceOnUse").attr("orient", "auto");
  n.append("circle").attr("fill", a ?? "white").attr("cx", 45.5).attr("cy", 18).attr("r", 6).attr("stroke-width", `${o}`), n.append("path").attr("d", "M0,18 Q18,0 36,18 Q18,36 0,18").attr("stroke-width", `${o}`);
  const l = e.append("defs").append("marker").attr("id", r + "_" + t + "-zeroOrMoreEnd").attr("class", "marker zeroOrMore " + t).attr("refX", 39).attr("refY", 18).attr("markerWidth", 57).attr("markerHeight", 36).attr("orient", "auto").attr("markerUnits", "userSpaceOnUse");
  l.append("circle").attr("fill", a ?? "white").attr("cx", 11).attr("cy", 18).attr("r", 6).attr("stroke-width", `${o}`), l.append("path").attr("d", "M21,18 Q39,0 57,18 Q39,36 21,18").attr("stroke-width", `${o}`);
}, "zero_or_more_neo"), A_ = /* @__PURE__ */ p((e, t, r) => {
  e.append("defs").append("marker").attr("id", r + "_" + t + "-requirement_arrowEnd").attr("refX", 20).attr("refY", 10).attr("markerWidth", 20).attr("markerHeight", 20).attr("orient", "auto").append("path").attr(
    "d",
    `M0,0
      L20,10
      M20,10
      L0,20`
  );
}, "requirement_arrow"), E_ = /* @__PURE__ */ p((e, t, r) => {
  const i = Xt(), { themeVariables: s } = i, { strokeWidth: o } = s;
  e.append("defs").append("marker").attr("id", r + "_" + t + "-requirement_arrowEnd").attr("refX", 20).attr("refY", 10).attr("markerWidth", 20).attr("markerHeight", 20).attr("orient", "auto").attr("markerUnits", "userSpaceOnUse").attr("stroke-width", `${o}`).attr("viewBox", "0 0 25 20").append("path").attr(
    "d",
    `M0,0
      L20,10
      M20,10
      L0,20`
  ).attr("stroke-linejoin", "miter");
}, "requirement_arrow_neo"), M_ = /* @__PURE__ */ p((e, t, r) => {
  const i = e.append("defs").append("marker").attr("id", r + "_" + t + "-requirement_containsStart").attr("refX", 0).attr("refY", 10).attr("markerWidth", 20).attr("markerHeight", 20).attr("orient", "auto").append("g");
  i.append("circle").attr("cx", 10).attr("cy", 10).attr("r", 9).attr("fill", "none"), i.append("line").attr("x1", 1).attr("x2", 19).attr("y1", 10).attr("y2", 10), i.append("line").attr("y1", 1).attr("y2", 19).attr("x1", 10).attr("x2", 10);
}, "requirement_contains"), $_ = /* @__PURE__ */ p((e, t, r) => {
  const i = Xt(), { themeVariables: s } = i, { strokeWidth: o } = s, a = e.append("defs").append("marker").attr("id", r + "_" + t + "-requirement_containsStart").attr("refX", 0).attr("refY", 10).attr("markerWidth", 20).attr("markerHeight", 20).attr("orient", "auto").attr("markerUnits", "userSpaceOnUse").append("g");
  a.append("circle").attr("cx", 10).attr("cy", 10).attr("r", 9).attr("fill", "none"), a.append("line").attr("x1", 1).attr("x2", 19).attr("y1", 10).attr("y2", 10), a.append("line").attr("y1", 1).attr("y2", 19).attr("x1", 10).attr("x2", 10), a.selectAll("*").attr("stroke-width", `${o}`);
}, "requirement_contains_neo"), O_ = {
  extension: d_,
  composition: f_,
  aggregation: p_,
  dependency: g_,
  lollipop: m_,
  point: y_,
  circle: x_,
  cross: C_,
  barb: b_,
  barbNeo: k_,
  only_one: w_,
  zero_or_one: T_,
  one_or_more: S_,
  zero_or_more: __,
  only_one_neo: v_,
  zero_or_one_neo: B_,
  one_or_more_neo: L_,
  zero_or_more_neo: F_,
  requirement_arrow: A_,
  requirement_contains: M_,
  requirement_arrow_neo: E_,
  requirement_contains_neo: $_
}, jm = u_, Gm = typeof global == "object" && global && global.Object === Object && global, D_ = typeof self == "object" && self && self.Object === Object && self, vr = Gm || D_ || Function("return this")(), nr = vr.Symbol, Xm = Object.prototype, I_ = Xm.hasOwnProperty, P_ = Xm.toString, ss = nr ? nr.toStringTag : void 0;
function R_(e) {
  var t = I_.call(e, ss), r = e[ss];
  try {
    e[ss] = void 0;
    var i = !0;
  } catch {
  }
  var s = P_.call(e);
  return i && (t ? e[ss] = r : delete e[ss]), s;
}
var N_ = Object.prototype, q_ = N_.toString;
function z_(e) {
  return q_.call(e);
}
var W_ = "[object Null]", H_ = "[object Undefined]", Yu = nr ? nr.toStringTag : void 0;
function zi(e) {
  return e == null ? e === void 0 ? H_ : W_ : Yu && Yu in Object(e) ? R_(e) : z_(e);
}
function ai(e) {
  return e != null && typeof e == "object";
}
var Y_ = "[object Symbol]";
function dh(e) {
  return typeof e == "symbol" || ai(e) && zi(e) == Y_;
}
function Vm(e, t) {
  for (var r = -1, i = e == null ? 0 : e.length, s = Array(i); ++r < i; )
    s[r] = t(e[r], r, e);
  return s;
}
var Le = Array.isArray, Uu = nr ? nr.prototype : void 0, ju = Uu ? Uu.toString : void 0;
function Zm(e) {
  if (typeof e == "string")
    return e;
  if (Le(e))
    return Vm(e, Zm) + "";
  if (dh(e))
    return ju ? ju.call(e) : "";
  var t = e + "";
  return t == "0" && 1 / e == -1 / 0 ? "-0" : t;
}
function fh(e) {
  var t = typeof e;
  return e != null && (t == "object" || t == "function");
}
function ua(e) {
  return e;
}
var U_ = "[object AsyncFunction]", j_ = "[object Function]", G_ = "[object GeneratorFunction]", X_ = "[object Proxy]";
function Go(e) {
  if (!fh(e))
    return !1;
  var t = zi(e);
  return t == j_ || t == G_ || t == U_ || t == X_;
}
var Ka = vr["__core-js_shared__"], Gu = (function() {
  var e = /[^.]+$/.exec(Ka && Ka.keys && Ka.keys.IE_PROTO || "");
  return e ? "Symbol(src)_1." + e : "";
})();
function V_(e) {
  return !!Gu && Gu in e;
}
var Z_ = Function.prototype, K_ = Z_.toString;
function ui(e) {
  if (e != null) {
    try {
      return K_.call(e);
    } catch {
    }
    try {
      return e + "";
    } catch {
    }
  }
  return "";
}
var Q_ = /[\\^$.*+?()[\]{}|]/g, J_ = /^\[object .+?Constructor\]$/, tv = Function.prototype, ev = Object.prototype, rv = tv.toString, iv = ev.hasOwnProperty, sv = RegExp(
  "^" + rv.call(iv).replace(Q_, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
);
function ov(e) {
  if (!fh(e) || V_(e))
    return !1;
  var t = Go(e) ? sv : J_;
  return t.test(ui(e));
}
function av(e, t) {
  return e?.[t];
}
function di(e, t) {
  var r = av(e, t);
  return ov(r) ? r : void 0;
}
var nl = di(vr, "WeakMap");
function nv(e, t, r) {
  switch (r.length) {
    case 0:
      return e.call(t);
    case 1:
      return e.call(t, r[0]);
    case 2:
      return e.call(t, r[0], r[1]);
    case 3:
      return e.call(t, r[0], r[1], r[2]);
  }
  return e.apply(t, r);
}
function lv() {
}
var hv = 800, cv = 16, uv = Date.now;
function dv(e) {
  var t = 0, r = 0;
  return function() {
    var i = uv(), s = cv - (i - r);
    if (r = i, s > 0) {
      if (++t >= hv)
        return arguments[0];
    } else
      t = 0;
    return e.apply(void 0, arguments);
  };
}
function ps(e) {
  return function() {
    return e;
  };
}
var Xu = (function() {
  try {
    var e = di(Object, "defineProperty");
    return e({}, "", {}), e;
  } catch {
  }
})(), fv = Xu ? function(e, t) {
  return Xu(e, "toString", {
    configurable: !0,
    enumerable: !1,
    value: ps(t),
    writable: !0
  });
} : ua, pv = dv(fv);
function gv(e, t) {
  for (var r = -1, i = e == null ? 0 : e.length; ++r < i && t(e[r], r, e) !== !1; )
    ;
  return e;
}
function mv(e, t, r, i) {
  for (var s = e.length, o = r + -1; ++o < s; )
    if (t(e[o], o, e))
      return o;
  return -1;
}
function yv(e) {
  return e !== e;
}
function xv(e, t, r) {
  for (var i = r - 1, s = e.length; ++i < s; )
    if (e[i] === t)
      return i;
  return -1;
}
function Cv(e, t, r) {
  return t === t ? xv(e, t, r) : mv(e, yv, r);
}
function bv(e, t) {
  var r = e == null ? 0 : e.length;
  return !!r && Cv(e, t, 0) > -1;
}
var kv = 9007199254740991, wv = /^(?:0|[1-9]\d*)$/;
function Km(e, t) {
  var r = typeof e;
  return t = t ?? kv, !!t && (r == "number" || r != "symbol" && wv.test(e)) && e > -1 && e % 1 == 0 && e < t;
}
function Qm(e, t) {
  return e === t || e !== e && t !== t;
}
var Vu = Math.max;
function Tv(e, t, r) {
  return t = Vu(t === void 0 ? e.length - 1 : t, 0), function() {
    for (var i = arguments, s = -1, o = Vu(i.length - t, 0), a = Array(o); ++s < o; )
      a[s] = i[t + s];
    s = -1;
    for (var n = Array(t + 1); ++s < t; )
      n[s] = i[s];
    return n[t] = r(a), nv(e, this, n);
  };
}
function Sv(e, t) {
  return pv(Tv(e, t, ua), e + "");
}
var _v = 9007199254740991;
function ph(e) {
  return typeof e == "number" && e > -1 && e % 1 == 0 && e <= _v;
}
function da(e) {
  return e != null && ph(e.length) && !Go(e);
}
var vv = Object.prototype;
function Jm(e) {
  var t = e && e.constructor, r = typeof t == "function" && t.prototype || vv;
  return e === r;
}
function Bv(e, t) {
  for (var r = -1, i = Array(e); ++r < e; )
    i[r] = t(r);
  return i;
}
var Lv = "[object Arguments]";
function Zu(e) {
  return ai(e) && zi(e) == Lv;
}
var ty = Object.prototype, Fv = ty.hasOwnProperty, Av = ty.propertyIsEnumerable, fa = Zu(/* @__PURE__ */ (function() {
  return arguments;
})()) ? Zu : function(e) {
  return ai(e) && Fv.call(e, "callee") && !Av.call(e, "callee");
};
function Ev() {
  return !1;
}
var ey = typeof exports == "object" && exports && !exports.nodeType && exports, Ku = ey && typeof module == "object" && module && !module.nodeType && module, Mv = Ku && Ku.exports === ey, Qu = Mv ? vr.Buffer : void 0, $v = Qu ? Qu.isBuffer : void 0, Xo = $v || Ev, Ov = "[object Arguments]", Dv = "[object Array]", Iv = "[object Boolean]", Pv = "[object Date]", Rv = "[object Error]", Nv = "[object Function]", qv = "[object Map]", zv = "[object Number]", Wv = "[object Object]", Hv = "[object RegExp]", Yv = "[object Set]", Uv = "[object String]", jv = "[object WeakMap]", Gv = "[object ArrayBuffer]", Xv = "[object DataView]", Vv = "[object Float32Array]", Zv = "[object Float64Array]", Kv = "[object Int8Array]", Qv = "[object Int16Array]", Jv = "[object Int32Array]", tB = "[object Uint8Array]", eB = "[object Uint8ClampedArray]", rB = "[object Uint16Array]", iB = "[object Uint32Array]", jt = {};
jt[Vv] = jt[Zv] = jt[Kv] = jt[Qv] = jt[Jv] = jt[tB] = jt[eB] = jt[rB] = jt[iB] = !0;
jt[Ov] = jt[Dv] = jt[Gv] = jt[Iv] = jt[Xv] = jt[Pv] = jt[Rv] = jt[Nv] = jt[qv] = jt[zv] = jt[Wv] = jt[Hv] = jt[Yv] = jt[Uv] = jt[jv] = !1;
function sB(e) {
  return ai(e) && ph(e.length) && !!jt[zi(e)];
}
function oB(e) {
  return function(t) {
    return e(t);
  };
}
var ry = typeof exports == "object" && exports && !exports.nodeType && exports, ks = ry && typeof module == "object" && module && !module.nodeType && module, aB = ks && ks.exports === ry, Qa = aB && Gm.process, Ju = (function() {
  try {
    var e = ks && ks.require && ks.require("util").types;
    return e || Qa && Qa.binding && Qa.binding("util");
  } catch {
  }
})(), td = Ju && Ju.isTypedArray, gh = td ? oB(td) : sB, nB = Object.prototype, lB = nB.hasOwnProperty;
function hB(e, t) {
  var r = Le(e), i = !r && fa(e), s = !r && !i && Xo(e), o = !r && !i && !s && gh(e), a = r || i || s || o, n = a ? Bv(e.length, String) : [], l = n.length;
  for (var c in e)
    (t || lB.call(e, c)) && !(a && // Safari 9 has enumerable `arguments.length` in strict mode.
    (c == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
    s && (c == "offset" || c == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
    o && (c == "buffer" || c == "byteLength" || c == "byteOffset") || // Skip index properties.
    Km(c, l))) && n.push(c);
  return n;
}
function cB(e, t) {
  return function(r) {
    return e(t(r));
  };
}
var uB = cB(Object.keys, Object), dB = Object.prototype, fB = dB.hasOwnProperty;
function iy(e) {
  if (!Jm(e))
    return uB(e);
  var t = [];
  for (var r in Object(e))
    fB.call(e, r) && r != "constructor" && t.push(r);
  return t;
}
function ir(e) {
  return da(e) ? hB(e) : iy(e);
}
var pB = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, gB = /^\w*$/;
function mh(e, t) {
  if (Le(e))
    return !1;
  var r = typeof e;
  return r == "number" || r == "symbol" || r == "boolean" || e == null || dh(e) ? !0 : gB.test(e) || !pB.test(e) || t != null && e in Object(t);
}
var Ls = di(Object, "create");
function mB() {
  this.__data__ = Ls ? Ls(null) : {}, this.size = 0;
}
function yB(e) {
  var t = this.has(e) && delete this.__data__[e];
  return this.size -= t ? 1 : 0, t;
}
var xB = "__lodash_hash_undefined__", CB = Object.prototype, bB = CB.hasOwnProperty;
function kB(e) {
  var t = this.__data__;
  if (Ls) {
    var r = t[e];
    return r === xB ? void 0 : r;
  }
  return bB.call(t, e) ? t[e] : void 0;
}
var wB = Object.prototype, TB = wB.hasOwnProperty;
function SB(e) {
  var t = this.__data__;
  return Ls ? t[e] !== void 0 : TB.call(t, e);
}
var _B = "__lodash_hash_undefined__";
function vB(e, t) {
  var r = this.__data__;
  return this.size += this.has(e) ? 0 : 1, r[e] = Ls && t === void 0 ? _B : t, this;
}
function ni(e) {
  var t = -1, r = e == null ? 0 : e.length;
  for (this.clear(); ++t < r; ) {
    var i = e[t];
    this.set(i[0], i[1]);
  }
}
ni.prototype.clear = mB;
ni.prototype.delete = yB;
ni.prototype.get = kB;
ni.prototype.has = SB;
ni.prototype.set = vB;
function BB() {
  this.__data__ = [], this.size = 0;
}
function pa(e, t) {
  for (var r = e.length; r--; )
    if (Qm(e[r][0], t))
      return r;
  return -1;
}
var LB = Array.prototype, FB = LB.splice;
function AB(e) {
  var t = this.__data__, r = pa(t, e);
  if (r < 0)
    return !1;
  var i = t.length - 1;
  return r == i ? t.pop() : FB.call(t, r, 1), --this.size, !0;
}
function EB(e) {
  var t = this.__data__, r = pa(t, e);
  return r < 0 ? void 0 : t[r][1];
}
function MB(e) {
  return pa(this.__data__, e) > -1;
}
function $B(e, t) {
  var r = this.__data__, i = pa(r, e);
  return i < 0 ? (++this.size, r.push([e, t])) : r[i][1] = t, this;
}
function Br(e) {
  var t = -1, r = e == null ? 0 : e.length;
  for (this.clear(); ++t < r; ) {
    var i = e[t];
    this.set(i[0], i[1]);
  }
}
Br.prototype.clear = BB;
Br.prototype.delete = AB;
Br.prototype.get = EB;
Br.prototype.has = MB;
Br.prototype.set = $B;
var Fs = di(vr, "Map");
function OB() {
  this.size = 0, this.__data__ = {
    hash: new ni(),
    map: new (Fs || Br)(),
    string: new ni()
  };
}
function DB(e) {
  var t = typeof e;
  return t == "string" || t == "number" || t == "symbol" || t == "boolean" ? e !== "__proto__" : e === null;
}
function ga(e, t) {
  var r = e.__data__;
  return DB(t) ? r[typeof t == "string" ? "string" : "hash"] : r.map;
}
function IB(e) {
  var t = ga(this, e).delete(e);
  return this.size -= t ? 1 : 0, t;
}
function PB(e) {
  return ga(this, e).get(e);
}
function RB(e) {
  return ga(this, e).has(e);
}
function NB(e, t) {
  var r = ga(this, e), i = r.size;
  return r.set(e, t), this.size += r.size == i ? 0 : 1, this;
}
function Lr(e) {
  var t = -1, r = e == null ? 0 : e.length;
  for (this.clear(); ++t < r; ) {
    var i = e[t];
    this.set(i[0], i[1]);
  }
}
Lr.prototype.clear = OB;
Lr.prototype.delete = IB;
Lr.prototype.get = PB;
Lr.prototype.has = RB;
Lr.prototype.set = NB;
var qB = "Expected a function";
function yh(e, t) {
  if (typeof e != "function" || t != null && typeof t != "function")
    throw new TypeError(qB);
  var r = function() {
    var i = arguments, s = t ? t.apply(this, i) : i[0], o = r.cache;
    if (o.has(s))
      return o.get(s);
    var a = e.apply(this, i);
    return r.cache = o.set(s, a) || o, a;
  };
  return r.cache = new (yh.Cache || Lr)(), r;
}
yh.Cache = Lr;
var zB = 500;
function WB(e) {
  var t = yh(e, function(i) {
    return r.size === zB && r.clear(), i;
  }), r = t.cache;
  return t;
}
var HB = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g, YB = /\\(\\)?/g, UB = WB(function(e) {
  var t = [];
  return e.charCodeAt(0) === 46 && t.push(""), e.replace(HB, function(r, i, s, o) {
    t.push(s ? o.replace(YB, "$1") : i || r);
  }), t;
});
function jB(e) {
  return e == null ? "" : Zm(e);
}
function sy(e, t) {
  return Le(e) ? e : mh(e, t) ? [e] : UB(jB(e));
}
function ma(e) {
  if (typeof e == "string" || dh(e))
    return e;
  var t = e + "";
  return t == "0" && 1 / e == -1 / 0 ? "-0" : t;
}
function oy(e, t) {
  t = sy(t, e);
  for (var r = 0, i = t.length; e != null && r < i; )
    e = e[ma(t[r++])];
  return r && r == i ? e : void 0;
}
function GB(e, t, r) {
  var i = e == null ? void 0 : oy(e, t);
  return i === void 0 ? r : i;
}
function ay(e, t) {
  for (var r = -1, i = t.length, s = e.length; ++r < i; )
    e[s + r] = t[r];
  return e;
}
var ed = nr ? nr.isConcatSpreadable : void 0;
function XB(e) {
  return Le(e) || fa(e) || !!(ed && e && e[ed]);
}
function VB(e, t, r, i, s) {
  var o = -1, a = e.length;
  for (r || (r = XB), s || (s = []); ++o < a; ) {
    var n = e[o];
    r(n) ? ay(s, n) : i || (s[s.length] = n);
  }
  return s;
}
function ZB(e, t, r, i) {
  var s = -1, o = e == null ? 0 : e.length;
  for (i && o && (r = e[++s]); ++s < o; )
    r = t(r, e[s], s, e);
  return r;
}
function KB() {
  this.__data__ = new Br(), this.size = 0;
}
function QB(e) {
  var t = this.__data__, r = t.delete(e);
  return this.size = t.size, r;
}
function JB(e) {
  return this.__data__.get(e);
}
function tL(e) {
  return this.__data__.has(e);
}
var eL = 200;
function rL(e, t) {
  var r = this.__data__;
  if (r instanceof Br) {
    var i = r.__data__;
    if (!Fs || i.length < eL - 1)
      return i.push([e, t]), this.size = ++r.size, this;
    r = this.__data__ = new Lr(i);
  }
  return r.set(e, t), this.size = r.size, this;
}
function wr(e) {
  var t = this.__data__ = new Br(e);
  this.size = t.size;
}
wr.prototype.clear = KB;
wr.prototype.delete = QB;
wr.prototype.get = JB;
wr.prototype.has = tL;
wr.prototype.set = rL;
function ny(e, t) {
  for (var r = -1, i = e == null ? 0 : e.length, s = 0, o = []; ++r < i; ) {
    var a = e[r];
    t(a, r, e) && (o[s++] = a);
  }
  return o;
}
function iL() {
  return [];
}
var sL = Object.prototype, oL = sL.propertyIsEnumerable, rd = Object.getOwnPropertySymbols, aL = rd ? function(e) {
  return e == null ? [] : (e = Object(e), ny(rd(e), function(t) {
    return oL.call(e, t);
  }));
} : iL;
function nL(e, t, r) {
  var i = t(e);
  return Le(e) ? i : ay(i, r(e));
}
function id(e) {
  return nL(e, ir, aL);
}
var ll = di(vr, "DataView"), hl = di(vr, "Promise"), Ai = di(vr, "Set"), sd = "[object Map]", lL = "[object Object]", od = "[object Promise]", ad = "[object Set]", nd = "[object WeakMap]", ld = "[object DataView]", hL = ui(ll), cL = ui(Fs), uL = ui(hl), dL = ui(Ai), fL = ui(nl), br = zi;
(ll && br(new ll(new ArrayBuffer(1))) != ld || Fs && br(new Fs()) != sd || hl && br(hl.resolve()) != od || Ai && br(new Ai()) != ad || nl && br(new nl()) != nd) && (br = function(e) {
  var t = zi(e), r = t == lL ? e.constructor : void 0, i = r ? ui(r) : "";
  if (i)
    switch (i) {
      case hL:
        return ld;
      case cL:
        return sd;
      case uL:
        return od;
      case dL:
        return ad;
      case fL:
        return nd;
    }
  return t;
});
var hd = vr.Uint8Array, pL = "__lodash_hash_undefined__";
function gL(e) {
  return this.__data__.set(e, pL), this;
}
function mL(e) {
  return this.__data__.has(e);
}
function As(e) {
  var t = -1, r = e == null ? 0 : e.length;
  for (this.__data__ = new Lr(); ++t < r; )
    this.add(e[t]);
}
As.prototype.add = As.prototype.push = gL;
As.prototype.has = mL;
function yL(e, t) {
  for (var r = -1, i = e == null ? 0 : e.length; ++r < i; )
    if (t(e[r], r, e))
      return !0;
  return !1;
}
function ly(e, t) {
  return e.has(t);
}
var xL = 1, CL = 2;
function hy(e, t, r, i, s, o) {
  var a = r & xL, n = e.length, l = t.length;
  if (n != l && !(a && l > n))
    return !1;
  var c = o.get(e), h = o.get(t);
  if (c && h)
    return c == t && h == e;
  var u = -1, d = !0, f = r & CL ? new As() : void 0;
  for (o.set(e, t), o.set(t, e); ++u < n; ) {
    var m = e[u], y = t[u];
    if (i)
      var x = a ? i(y, m, u, t, e, o) : i(m, y, u, e, t, o);
    if (x !== void 0) {
      if (x)
        continue;
      d = !1;
      break;
    }
    if (f) {
      if (!yL(t, function(C, k) {
        if (!ly(f, k) && (m === C || s(m, C, r, i, o)))
          return f.push(k);
      })) {
        d = !1;
        break;
      }
    } else if (!(m === y || s(m, y, r, i, o))) {
      d = !1;
      break;
    }
  }
  return o.delete(e), o.delete(t), d;
}
function bL(e) {
  var t = -1, r = Array(e.size);
  return e.forEach(function(i, s) {
    r[++t] = [s, i];
  }), r;
}
function xh(e) {
  var t = -1, r = Array(e.size);
  return e.forEach(function(i) {
    r[++t] = i;
  }), r;
}
var kL = 1, wL = 2, TL = "[object Boolean]", SL = "[object Date]", _L = "[object Error]", vL = "[object Map]", BL = "[object Number]", LL = "[object RegExp]", FL = "[object Set]", AL = "[object String]", EL = "[object Symbol]", ML = "[object ArrayBuffer]", $L = "[object DataView]", cd = nr ? nr.prototype : void 0, Ja = cd ? cd.valueOf : void 0;
function OL(e, t, r, i, s, o, a) {
  switch (r) {
    case $L:
      if (e.byteLength != t.byteLength || e.byteOffset != t.byteOffset)
        return !1;
      e = e.buffer, t = t.buffer;
    case ML:
      return !(e.byteLength != t.byteLength || !o(new hd(e), new hd(t)));
    case TL:
    case SL:
    case BL:
      return Qm(+e, +t);
    case _L:
      return e.name == t.name && e.message == t.message;
    case LL:
    case AL:
      return e == t + "";
    case vL:
      var n = bL;
    case FL:
      var l = i & kL;
      if (n || (n = xh), e.size != t.size && !l)
        return !1;
      var c = a.get(e);
      if (c)
        return c == t;
      i |= wL, a.set(e, t);
      var h = hy(n(e), n(t), i, s, o, a);
      return a.delete(e), h;
    case EL:
      if (Ja)
        return Ja.call(e) == Ja.call(t);
  }
  return !1;
}
var DL = 1, IL = Object.prototype, PL = IL.hasOwnProperty;
function RL(e, t, r, i, s, o) {
  var a = r & DL, n = id(e), l = n.length, c = id(t), h = c.length;
  if (l != h && !a)
    return !1;
  for (var u = l; u--; ) {
    var d = n[u];
    if (!(a ? d in t : PL.call(t, d)))
      return !1;
  }
  var f = o.get(e), m = o.get(t);
  if (f && m)
    return f == t && m == e;
  var y = !0;
  o.set(e, t), o.set(t, e);
  for (var x = a; ++u < l; ) {
    d = n[u];
    var C = e[d], k = t[d];
    if (i)
      var T = a ? i(k, C, d, t, e, o) : i(C, k, d, e, t, o);
    if (!(T === void 0 ? C === k || s(C, k, r, i, o) : T)) {
      y = !1;
      break;
    }
    x || (x = d == "constructor");
  }
  if (y && !x) {
    var _ = e.constructor, v = t.constructor;
    _ != v && "constructor" in e && "constructor" in t && !(typeof _ == "function" && _ instanceof _ && typeof v == "function" && v instanceof v) && (y = !1);
  }
  return o.delete(e), o.delete(t), y;
}
var NL = 1, ud = "[object Arguments]", dd = "[object Array]", ao = "[object Object]", qL = Object.prototype, fd = qL.hasOwnProperty;
function zL(e, t, r, i, s, o) {
  var a = Le(e), n = Le(t), l = a ? dd : br(e), c = n ? dd : br(t);
  l = l == ud ? ao : l, c = c == ud ? ao : c;
  var h = l == ao, u = c == ao, d = l == c;
  if (d && Xo(e)) {
    if (!Xo(t))
      return !1;
    a = !0, h = !1;
  }
  if (d && !h)
    return o || (o = new wr()), a || gh(e) ? hy(e, t, r, i, s, o) : OL(e, t, l, r, i, s, o);
  if (!(r & NL)) {
    var f = h && fd.call(e, "__wrapped__"), m = u && fd.call(t, "__wrapped__");
    if (f || m) {
      var y = f ? e.value() : e, x = m ? t.value() : t;
      return o || (o = new wr()), s(y, x, r, i, o);
    }
  }
  return d ? (o || (o = new wr()), RL(e, t, r, i, s, o)) : !1;
}
function Ch(e, t, r, i, s) {
  return e === t ? !0 : e == null || t == null || !ai(e) && !ai(t) ? e !== e && t !== t : zL(e, t, r, i, Ch, s);
}
var WL = 1, HL = 2;
function YL(e, t, r, i) {
  var s = r.length, o = s;
  if (e == null)
    return !o;
  for (e = Object(e); s--; ) {
    var a = r[s];
    if (a[2] ? a[1] !== e[a[0]] : !(a[0] in e))
      return !1;
  }
  for (; ++s < o; ) {
    a = r[s];
    var n = a[0], l = e[n], c = a[1];
    if (a[2]) {
      if (l === void 0 && !(n in e))
        return !1;
    } else {
      var h = new wr(), u;
      if (!(u === void 0 ? Ch(c, l, WL | HL, i, h) : u))
        return !1;
    }
  }
  return !0;
}
function cy(e) {
  return e === e && !fh(e);
}
function UL(e) {
  for (var t = ir(e), r = t.length; r--; ) {
    var i = t[r], s = e[i];
    t[r] = [i, s, cy(s)];
  }
  return t;
}
function uy(e, t) {
  return function(r) {
    return r == null ? !1 : r[e] === t && (t !== void 0 || e in Object(r));
  };
}
function jL(e) {
  var t = UL(e);
  return t.length == 1 && t[0][2] ? uy(t[0][0], t[0][1]) : function(r) {
    return r === e || YL(r, e, t);
  };
}
function GL(e, t) {
  return e != null && t in Object(e);
}
function XL(e, t, r) {
  t = sy(t, e);
  for (var i = -1, s = t.length, o = !1; ++i < s; ) {
    var a = ma(t[i]);
    if (!(o = e != null && r(e, a)))
      break;
    e = e[a];
  }
  return o || ++i != s ? o : (s = e == null ? 0 : e.length, !!s && ph(s) && Km(a, s) && (Le(e) || fa(e)));
}
function VL(e, t) {
  return e != null && XL(e, t, GL);
}
var ZL = 1, KL = 2;
function QL(e, t) {
  return mh(e) && cy(t) ? uy(ma(e), t) : function(r) {
    var i = GB(r, e);
    return i === void 0 && i === t ? VL(r, e) : Ch(t, i, ZL | KL);
  };
}
function JL(e) {
  return function(t) {
    return t?.[e];
  };
}
function tF(e) {
  return function(t) {
    return oy(t, e);
  };
}
function eF(e) {
  return mh(e) ? JL(ma(e)) : tF(e);
}
function dy(e) {
  return typeof e == "function" ? e : e == null ? ua : typeof e == "object" ? Le(e) ? QL(e[0], e[1]) : jL(e) : eF(e);
}
function rF(e) {
  return function(t, r, i) {
    for (var s = -1, o = Object(t), a = i(t), n = a.length; n--; ) {
      var l = a[++s];
      if (r(o[l], l, o) === !1)
        break;
    }
    return t;
  };
}
var iF = rF();
function sF(e, t) {
  return e && iF(e, t, ir);
}
function oF(e, t) {
  return function(r, i) {
    if (r == null)
      return r;
    if (!da(r))
      return e(r, i);
    for (var s = r.length, o = -1, a = Object(r); ++o < s && i(a[o], o, a) !== !1; )
      ;
    return r;
  };
}
var bh = oF(sF);
function aF(e) {
  return ai(e) && da(e);
}
function nF(e) {
  return typeof e == "function" ? e : ua;
}
function jr(e, t) {
  var r = Le(e) ? gv : bh;
  return r(e, nF(t));
}
function lF(e, t) {
  var r = [];
  return bh(e, function(i, s, o) {
    t(i, s, o) && r.push(i);
  }), r;
}
function no(e, t) {
  var r = Le(e) ? ny : lF;
  return r(e, dy(t));
}
function hF(e, t) {
  return Vm(t, function(r) {
    return e[r];
  });
}
function tn(e) {
  return e == null ? [] : hF(e, ir(e));
}
var cF = "[object Map]", uF = "[object Set]", dF = Object.prototype, fF = dF.hasOwnProperty;
function pd(e) {
  if (e == null)
    return !0;
  if (da(e) && (Le(e) || typeof e == "string" || typeof e.splice == "function" || Xo(e) || gh(e) || fa(e)))
    return !e.length;
  var t = br(e);
  if (t == cF || t == uF)
    return !e.size;
  if (Jm(e))
    return !iy(e).length;
  for (var r in e)
    if (fF.call(e, r))
      return !1;
  return !0;
}
function _i(e) {
  return e === void 0;
}
function pF(e, t, r, i, s) {
  return s(e, function(o, a, n) {
    r = i ? (i = !1, o) : t(r, o, a, n);
  }), r;
}
function gF(e, t, r) {
  var i = Le(e) ? ZB : pF, s = arguments.length < 3;
  return i(e, dy(t), r, s, bh);
}
var mF = 1 / 0, yF = Ai && 1 / xh(new Ai([, -0]))[1] == mF ? function(e) {
  return new Ai(e);
} : lv, xF = 200;
function CF(e, t, r) {
  var i = -1, s = bv, o = e.length, a = !0, n = [], l = n;
  if (o >= xF) {
    var c = yF(e);
    if (c)
      return xh(c);
    a = !1, s = ly, l = new As();
  } else
    l = n;
  t:
    for (; ++i < o; ) {
      var h = e[i], u = h;
      if (h = h !== 0 ? h : 0, a && u === u) {
        for (var d = l.length; d--; )
          if (l[d] === u)
            continue t;
        n.push(h);
      } else s(l, u, r) || (l !== n && l.push(u), n.push(h));
    }
  return n;
}
var bF = Sv(function(e) {
  return CF(VB(e, 1, aF, !0));
}), kF = "\0", Gr = "\0", gd = "";
class ya {
  /**
   * @param {GraphOptions} [opts] - Graph options.
   */
  constructor(t = {}) {
    this._isDirected = Object.prototype.hasOwnProperty.call(t, "directed") ? t.directed : !0, this._isMultigraph = Object.prototype.hasOwnProperty.call(t, "multigraph") ? t.multigraph : !1, this._isCompound = Object.prototype.hasOwnProperty.call(t, "compound") ? t.compound : !1, this._label = void 0, this._defaultNodeLabelFn = ps(void 0), this._defaultEdgeLabelFn = ps(void 0), this._nodes = {}, this._isCompound && (this._parent = {}, this._children = {}, this._children[Gr] = {}), this._in = {}, this._preds = {}, this._out = {}, this._sucs = {}, this._edgeObjs = {}, this._edgeLabels = {};
  }
  /* === Graph functions ========= */
  /**
   *
   * @returns {boolean} `true` if the graph is [directed](https://en.wikipedia.org/wiki/Directed_graph).
   * A directed graph treats the order of nodes in an edge as significant whereas an
   * [undirected](https://en.wikipedia.org/wiki/Graph_(mathematics)#Undirected_graph)
   * graph does not.
   * This example demonstrates the difference:
   *
   * @example
   *
   * ```js
   * var directed = new Graph({ directed: true });
   * directed.setEdge("a", "b", "my-label");
   * directed.edge("a", "b"); // returns "my-label"
   * directed.edge("b", "a"); // returns undefined
   *
   * var undirected = new Graph({ directed: false });
   * undirected.setEdge("a", "b", "my-label");
   * undirected.edge("a", "b"); // returns "my-label"
   * undirected.edge("b", "a"); // returns "my-label"
   * ```
   */
  isDirected() {
    return this._isDirected;
  }
  /**
   * @returns {boolean} `true` if the graph is a multigraph.
   */
  isMultigraph() {
    return this._isMultigraph;
  }
  /**
   * @returns {boolean} `true` if the graph is compound.
   */
  isCompound() {
    return this._isCompound;
  }
  /**
   * Sets the label for the graph to `label`.
   *
   * @param {GraphLabel} label - Label for the graph.
   * @returns {this}
   */
  setGraph(t) {
    return this._label = t, this;
  }
  /**
   * @returns {GraphLabel | undefined} the currently assigned label for the graph.
   * If no label has been assigned, returns `undefined`.
   *
   * @example
   *
   * ```js
   * var g = new Graph();
   * g.graph(); // returns undefined
   * g.setGraph("graph-label");
   *  g.graph(); // returns "graph-label"
   * ```
   */
  graph() {
    return this._label;
  }
  /* === Node functions ========== */
  /**
   * Sets a new default value that is assigned to nodes that are created without
   * a label.
   *
   * @param {typeof this._defaultNodeLabelFn | NodeLabel} newDefault - If a function,
   * it is called with the id of the node being created.
   * Otherwise, it is assigned as the label directly.
   * @returns {this}
   */
  setDefaultNodeLabel(t) {
    return Go(t) || (t = ps(t)), this._defaultNodeLabelFn = t, this;
  }
  /**
   * @returns {number} the number of nodes in the graph.
   */
  nodeCount() {
    return this._nodeCount;
  }
  /**
   * @returns {NodeID[]} the ids of the nodes in the graph.
   *
   * @remarks
   * Use {@link node()} to get the label for each node.
   * Takes `O(|V|)` time.
   */
  nodes() {
    return ir(this._nodes);
  }
  /**
   * @returns {NodeID[]} those nodes in the graph that have no in-edges.
   * @remarks Takes `O(|V|)` time.
   */
  sources() {
    var t = this;
    return no(this.nodes(), function(r) {
      return pd(t._in[r]);
    });
  }
  /**
   * @returns {NodeID[]} those nodes in the graph that have no out-edges.
   * @remarks Takes `O(|V|)` time.
   */
  sinks() {
    var t = this;
    return no(this.nodes(), function(r) {
      return pd(t._out[r]);
    });
  }
  /**
   * Invokes setNode method for each node in `vs` list.
   *
   * @param {Collection<NodeID | number>} vs - List of node IDs to create/set.
   * @param {NodeLabel} [value] - If set, update all nodes with this value.
   * @returns {this}
   * @remarks Complexity: O(|names|).
   */
  setNodes(t, r) {
    var i = arguments, s = this;
    return jr(t, function(o) {
      i.length > 1 ? s.setNode(o, r) : s.setNode(o);
    }), this;
  }
  /**
   * Creates or updates the value for the node `v` in the graph.
   *
   * @param {NodeID | number} v - ID of the node to create/set.
   * @param {NodeLabel} [value] - If supplied, it is set as the value for the node.
   * If not supplied and the node was created by this call then
   * {@link setDefaultNodeLabel} will be used to set the node's value.
   * @returns {this} the graph, allowing this to be chained with other functions.
   * @remarks Takes `O(1)` time.
   */
  setNode(t, r) {
    return Object.prototype.hasOwnProperty.call(this._nodes, t) ? (arguments.length > 1 && (this._nodes[t] = r), this) : (this._nodes[t] = arguments.length > 1 ? r : this._defaultNodeLabelFn(t), this._isCompound && (this._parent[t] = Gr, this._children[t] = {}, this._children[Gr][t] = !0), this._in[t] = {}, this._preds[t] = {}, this._out[t] = {}, this._sucs[t] = {}, ++this._nodeCount, this);
  }
  /**
   * Gets the label of node with specified name.
   *
   * @param {NodeID | number} v - Node ID.
   * @returns {NodeLabel | undefined} the label assigned to the node with the id `v`
   * if it is in the graph.
   * Otherwise returns `undefined`.
   * @remarks Takes `O(1)` time.
   */
  node(t) {
    return this._nodes[t];
  }
  /**
   * Detects whether graph has a node with specified name or not.
   *
   * @param {NodeID | number} v - Node ID.
   * @returns {boolean} Returns `true` the graph has a node with the id.
   * @remarks Takes `O(1)` time.
   */
  hasNode(t) {
    return Object.prototype.hasOwnProperty.call(this._nodes, t);
  }
  /**
   * Remove the node with the id `v` in the graph or do nothing if the node is
   * not in the graph.
   *
   * If the node was removed this function also removes any incident edges.
   *
   * @param {NodeID | number} v - Node ID to remove.
   * @returns {this} the graph, allowing this to be chained with other functions.
   * @remarks Takes `O(|E|)` time.
   */
  removeNode(t) {
    if (Object.prototype.hasOwnProperty.call(this._nodes, t)) {
      var r = (i) => this.removeEdge(this._edgeObjs[i]);
      delete this._nodes[t], this._isCompound && (this._removeFromParentsChildList(t), delete this._parent[t], jr(this.children(t), (i) => {
        this.setParent(i);
      }), delete this._children[t]), jr(ir(this._in[t]), r), delete this._in[t], delete this._preds[t], jr(ir(this._out[t]), r), delete this._out[t], delete this._sucs[t], --this._nodeCount;
    }
    return this;
  }
  /**
   * Sets the parent for `v` to `parent` if it is defined or removes the parent
   * for `v` if `parent` is undefined.
   *
   * @param {NodeID | number} v - Node ID to set the parent for.
   * @param {NodeID | number} [parent] - Parent node ID. If not defined, removes the parent.
   * @returns {this} the graph, allowing this to be chained with other functions.
   * @throws if the graph is not compound.
   * @throws if setting the parent would create a cycle.
   * @remarks Takes `O(1)` time.
   */
  setParent(t, r) {
    if (!this._isCompound)
      throw new Error("Cannot set parent in a non-compound graph");
    if (_i(r))
      r = Gr;
    else {
      r += "";
      for (var i = r; !_i(i); i = this.parent(i))
        if (i === t)
          throw new Error("Setting " + r + " as parent of " + t + " would create a cycle");
      this.setNode(r);
    }
    return this.setNode(t), this._removeFromParentsChildList(t), this._parent[t] = r, this._children[r][t] = !0, this;
  }
  /**
   * @private
   * @param {NodeID | number} v - Node ID.
   */
  _removeFromParentsChildList(t) {
    delete this._children[this._parent[t]][t];
  }
  /**
   * Get parent node for node `v`.
   *
   * @param {NodeID | number} v - Node ID.
   * @returns {NodeID | undefined} the node that is a parent of node `v`
   * or `undefined` if node `v` does not have a parent or is not a member of
   * the graph.
   * Always returns `undefined` for graphs that are not compound.
   * @remarks Takes `O(1)` time.
   */
  parent(t) {
    if (this._isCompound) {
      var r = this._parent[t];
      if (r !== Gr)
        return r;
    }
  }
  /**
   * Gets list of direct children of node v.
   *
   * @param {NodeID | number} [v] - Node ID. If not specified, gets nodes
   * with no parent (top-level nodes).
   * @returns {NodeID[] | undefined} all nodes that are children of node `v` or
   * `undefined` if node `v` is not in the graph.
   * Always returns `[]` for graphs that are not compound.
   * @remarks Takes `O(|V|)` time.
   */
  children(t) {
    if (_i(t) && (t = Gr), this._isCompound) {
      var r = this._children[t];
      if (r)
        return ir(r);
    } else {
      if (t === Gr)
        return this.nodes();
      if (this.hasNode(t))
        return [];
    }
  }
  /**
   * @param {NodeID | number} v - Node ID.
   * @returns {NodeID[] | undefined} all nodes that are predecessors of the
   * specified node or `undefined` if node `v` is not in the graph.
   * @remarks
   * Behavior is undefined for undirected graphs - use {@link neighbors} instead.
   * Takes `O(|V|)` time.
   */
  predecessors(t) {
    var r = this._preds[t];
    if (r)
      return ir(r);
  }
  /**
   * @param {NodeID | number} v - Node ID.
   * @returns {NodeID[] | undefined} all nodes that are successors of the
   * specified node or `undefined` if node `v` is not in the graph.
   * @remarks
   * Behavior is undefined for undirected graphs - use {@link neighbors} instead.
   * Takes `O(|V|)` time.
   */
  successors(t) {
    var r = this._sucs[t];
    if (r)
      return ir(r);
  }
  /**
   * @param {NodeID | number} v - Node ID.
   * @returns {NodeID[] | undefined} all nodes that are predecessors or
   * successors of the specified node
   * or `undefined` if node `v` is not in the graph.
   * @remarks Takes `O(|V|)` time.
   */
  neighbors(t) {
    var r = this.predecessors(t);
    if (r)
      return bF(r, this.successors(t));
  }
  /**
   * @param {NodeID | number} v - Node ID.
   * @returns {boolean} True if the node is a leaf (has no successors), false otherwise.
   */
  isLeaf(t) {
    var r;
    return this.isDirected() ? r = this.successors(t) : r = this.neighbors(t), r.length === 0;
  }
  /**
     * Creates new graph with nodes filtered via `filter`.
     * Edges incident to rejected node
     * are also removed.
     * 
     * In case of compound graph, if parent is rejected by `filter`,
     * than all its children are rejected too.
  
     * @param {(v: NodeID) => boolean} filter - Function that returns `true` for nodes to keep.
     * @returns {Graph<GraphLabel, NodeLabel, EdgeLabel>} A new graph containing only the nodes for which `filter` returns `true`.
     * @remarks Average-case complexity: O(|E|+|V|).
     */
  filterNodes(t) {
    var r = new this.constructor({
      directed: this._isDirected,
      multigraph: this._isMultigraph,
      compound: this._isCompound
    });
    r.setGraph(this.graph());
    var i = this;
    jr(this._nodes, function(a, n) {
      t(n) && r.setNode(n, a);
    }), jr(this._edgeObjs, function(a) {
      r.hasNode(a.v) && r.hasNode(a.w) && r.setEdge(a, i.edge(a));
    });
    var s = {};
    function o(a) {
      var n = i.parent(a);
      return n === void 0 || r.hasNode(n) ? (s[a] = n, n) : n in s ? s[n] : o(n);
    }
    return this._isCompound && jr(r.nodes(), function(a) {
      r.setParent(a, o(a));
    }), r;
  }
  /* === Edge functions ========== */
  /**
   * Sets a new default value that is assigned to edges that are created without
   * a label.
   *
   * @param {typeof this._defaultEdgeLabelFn | EdgeLabel} newDefault - If a function,
   * it is called with the parameters `(v, w, name)`.
   * Otherwise, it is assigned as the label directly.
   * @returns {this}
   */
  setDefaultEdgeLabel(t) {
    return Go(t) || (t = ps(t)), this._defaultEdgeLabelFn = t, this;
  }
  /**
   * @returns {number} the number of edges in the graph.
   * @remarks Complexity: O(1).
   */
  edgeCount() {
    return this._edgeCount;
  }
  /**
   * Gets edges of the graph.
   *
   * @returns {EdgeObj[]} the {@link EdgeObj} for each edge in the graph.
   *
   * @remarks
   * In case of compound graph subgraphs are not considered.
   * Use {@link edge()} to get the label for each edge.
   * Takes `O(|E|)` time.
   */
  edges() {
    return tn(this._edgeObjs);
  }
  /**
   * Establish an edges path over the nodes in nodes list.
   *
   * If some edge is already exists, it will update its label, otherwise it will
   * create an edge between pair of nodes with label provided or default label
   * if no label provided.
   *
   * @param {Collection<NodeID>} vs - List of node IDs to create edges between.
   * @param {EdgeLabel} [value] - If set, update all edges with this value.
   * @returns {this}
   * @remarks Complexity: O(|nodes|).
   */
  setPath(t, r) {
    var i = this, s = arguments;
    return gF(t, function(o, a) {
      return s.length > 1 ? i.setEdge(o, a, r) : i.setEdge(o, a), a;
    }), this;
  }
  /**
   * Creates or updates the label for the edge (`v`, `w`) with the optionally
   * supplied `name`.
   *
   * @overload
   * @param {EdgeObj} arg0 - Edge object.
   * @param {EdgeLabel} [value] - If supplied, it is set as the label for the edge.
   * If not supplied and the edge was created by this call then
   * {@link setDefaultEdgeLabel} will be used to assign the edge's label.
   * @returns {this} the graph, allowing this to be chained with other functions.
   * @remarks Takes `O(1)` time.
   */
  /**
   * Creates or updates the label for the edge (`v`, `w`) with the optionally
   * supplied `name`.
   *
   * @overload
   * @param {NodeID | number} v - Source node ID. Number values will be coerced to strings.
   * @param {NodeID | number} w - Target node ID. Number values will be coerced to strings.
   * @param {EdgeLabel} [value] - If supplied, it is set as the label for the edge.
   * If not supplied and the edge was created by this call then
   * {@link setDefaultEdgeLabel} will be used to assign the edge's label.
   * @param {string | number} [name] - Edge name. Only useful with multigraphs.
   * @returns {this} the graph, allowing this to be chained with other functions.
   * @remarks Takes `O(1)` time.
   */
  setEdge() {
    var t, r, i, s, o = !1, a = arguments[0];
    typeof a == "object" && a !== null && "v" in a ? (t = a.v, r = a.w, i = a.name, arguments.length === 2 && (s = arguments[1], o = !0)) : (t = a, r = arguments[1], i = arguments[3], arguments.length > 2 && (s = arguments[2], o = !0)), t = "" + t, r = "" + r, _i(i) || (i = "" + i);
    var n = gs(this._isDirected, t, r, i);
    if (Object.prototype.hasOwnProperty.call(this._edgeLabels, n))
      return o && (this._edgeLabels[n] = s), this;
    if (!_i(i) && !this._isMultigraph)
      throw new Error("Cannot set a named edge when isMultigraph = false");
    this.setNode(t), this.setNode(r), this._edgeLabels[n] = o ? s : this._defaultEdgeLabelFn(t, r, i);
    var l = wF(this._isDirected, t, r, i);
    return t = l.v, r = l.w, Object.freeze(l), this._edgeObjs[n] = l, md(this._preds[r], t), md(this._sucs[t], r), this._in[r][n] = l, this._out[t][n] = l, this._edgeCount++, this;
  }
  /**
   * Gets the label for the specified edge.
   *
   * @overload
   * @param {EdgeObj} v - Edge object.
   * @returns {EdgeLabel | undefined} the label for the edge (`v`, `w`) if the
   * graph has an edge between `v` and `w` with the optional `name`.
   * Returned `undefined` if there is no such edge in the graph.
   * @remarks
   * `v` and `w` can be interchanged for undirected graphs.
   * Takes `O(1)` time.
   */
  /**
   * Gets the label for the specified edge.
   *
   * @overload
   * @param {NodeID | number} v - Source node ID.
   * @param {NodeID | number} w - Target node ID.
   * @param {string | number} [name] - Edge name. Only useful with multigraphs.
   * @returns {EdgeLabel | undefined} the label for the edge (`v`, `w`) if the
   * graph has an edge between `v` and `w` with the optional `name`.
   * Returned `undefined` if there is no such edge in the graph.
   * @remarks
   * `v` and `w` can be interchanged for undirected graphs.
   * Takes `O(1)` time.
   */
  edge(t, r, i) {
    var s = arguments.length === 1 ? en(this._isDirected, arguments[0]) : gs(this._isDirected, t, r, i);
    return this._edgeLabels[s];
  }
  /**
   * Detects whether the graph contains specified edge or not.
   *
   * @overload
   * @param {EdgeObj} v - Edge object.
   * @returns {boolean} `true` if the graph has an edge between `v` and `w`
   * with the optional `name`.
   * @remarks
   * `v` and `w` can be interchanged for undirected graphs.
   * No subgraphs are considered.
   * Takes `O(1)` time.
   */
  /**
   * Detects whether the graph contains specified edge or not.
   *
   * @overload
   * @param {NodeID | number} v - Source node ID.
   * @param {NodeID | number} w - Target node ID.
   * @param {string | number} [name] - Edge name. Only useful with multigraphs.
   * @returns {boolean} `true` if the graph has an edge between `v` and `w`
   * with the optional `name`.
   * @remarks
   * `v` and `w` can be interchanged for undirected graphs.
   * No subgraphs are considered.
   * Takes `O(1)` time.
   */
  hasEdge(t, r, i) {
    var s = arguments.length === 1 ? en(this._isDirected, arguments[0]) : gs(this._isDirected, t, r, i);
    return Object.prototype.hasOwnProperty.call(this._edgeLabels, s);
  }
  /**
   * Removes the edge (`v`, `w`) if the graph has an edge between `v` and `w`
   * with the optional `name`. If not this function does nothing.
   *
   * @overload
   * @param {EdgeObj} v - Edge object.
   * @returns {this}
   * @remarks
   * `v` and `w` can be interchanged for undirected graphs.
   * No subgraphs are considered.
   * Takes `O(1)` time.
   */
  /**
   * Removes the edge (`v`, `w`) if the graph has an edge between `v` and `w`
   * with the optional `name`. If not this function does nothing.
   *
   * @overload
   * @param {NodeID | number} v - Source node ID.
   * @param {NodeID | number} w - Target node ID.
   * @param {string | number} [name] - Edge name. Only useful with multigraphs.
   * @returns {this}
   * @remarks
   * `v` and `w` can be interchanged for undirected graphs.
   * Takes `O(1)` time.
   */
  removeEdge(t, r, i) {
    var s = arguments.length === 1 ? en(this._isDirected, arguments[0]) : gs(this._isDirected, t, r, i), o = this._edgeObjs[s];
    return o && (t = o.v, r = o.w, delete this._edgeLabels[s], delete this._edgeObjs[s], yd(this._preds[r], t), yd(this._sucs[t], r), delete this._in[r][s], delete this._out[t][s], this._edgeCount--), this;
  }
  /**
   * @param {NodeID | number} v - Target node ID.
   * @param {NodeID | number} [u] - Optionally filters edges down to just those
   * coming from node `u`.
   * @returns {EdgeObj[] | undefined} all edges that point to the node `v`.
   * Returns `undefined` if node `v` is not in the graph.
   * @remarks
   * Behavior is undefined for undirected graphs - use {@link nodeEdges} instead.
   * Takes `O(|E|)` time.
   */
  inEdges(t, r) {
    var i = this._in[t];
    if (i) {
      var s = tn(i);
      return r ? no(s, function(o) {
        return o.v === r;
      }) : s;
    }
  }
  /**
   * @param {NodeID | number} v - Target node ID.
   * @param {NodeID | number} [w] - Optionally filters edges down to just those
   * that point to `w`.
   * @returns {EdgeObj[] | undefined} all edges that point to the node `v`.
   * Returns `undefined` if node `v` is not in the graph.
   * @remarks
   * Behavior is undefined for undirected graphs - use {@link nodeEdges} instead.
   * Takes `O(|E|)` time.
   */
  outEdges(t, r) {
    var i = this._out[t];
    if (i) {
      var s = tn(i);
      return r ? no(s, function(o) {
        return o.w === r;
      }) : s;
    }
  }
  /**
   * @param {NodeID | number} v - Target Node ID.
   * @param {NodeID | number} [w] - If set, filters those edges down to just
   * those between nodes `v` and `w` regardless of direction
   * @returns {EdgeObj[] | undefined} all edges to or from node `v` regardless
   * of direction. Returns `undefined` if node `v` is not in the graph.
   * @remarks Takes `O(|E|)` time.
   */
  nodeEdges(t, r) {
    var i = this.inEdges(t, r);
    if (i)
      return i.concat(this.outEdges(t, r));
  }
}
ya.prototype._nodeCount = 0;
ya.prototype._edgeCount = 0;
function md(e, t) {
  e[t] ? e[t]++ : e[t] = 1;
}
function yd(e, t) {
  --e[t] || delete e[t];
}
function gs(e, t, r, i) {
  var s = "" + t, o = "" + r;
  if (!e && s > o) {
    var a = s;
    s = o, o = a;
  }
  return s + gd + o + gd + (_i(i) ? kF : i);
}
function wF(e, t, r, i) {
  var s = "" + t, o = "" + r;
  if (!e && s > o) {
    var a = s;
    s = o, o = a;
  }
  var n = { v: s, w: o };
  return i && (n.name = i), n;
}
function en(e, t) {
  return gs(e, t.v, t.w, t.name);
}
function fy(e, { edgePathsClass: t = "edges edgePaths" } = {}) {
  const r = e.insert("g").attr("class", "root"), i = r.insert("g").attr("class", "clusters"), s = r.insert("g").attr("class", t), o = r.insert("g").attr("class", "edgeLabels"), a = r.insert("g").attr("class", "nodes");
  return { clusters: i, edgePaths: s, edgeLabels: o, nodes: a, rootGroups: r };
}
p(fy, "createLayoutElementGroups");
async function py(e, t) {
  if (t.label) {
    const { shapeSvg: r, bbox: i } = await xt(e, t);
    t.labelBBox = { width: i.width, height: i.height }, r.remove();
  } else
    t.labelBBox = { width: 0, height: 0 };
}
p(py, "measureGroupLabel");
async function gy(e, t, r) {
  const i = await ch(e, t, r), s = i.node()?.getBBox() ?? { width: 0, height: 0 };
  return t.width = s.width, t.height = s.height, i;
}
p(gy, "insertMeasuredNode");
async function my(e, t) {
  const r = new ya({
    multigraph: !0,
    compound: !0
  }), i = [...t.edges], s = $t(), o = fy(e), { edgeLabels: a, nodes: n } = o, l = /* @__PURE__ */ new Map(), c = e.node() != null;
  await Promise.all(
    t.nodes.map(async (h) => {
      if (h.isGroup)
        c && await py(n, h), r.setNode(h.id, { ...h });
      else {
        if (c) {
          const u = await gy(n, h, {
            config: s,
            dir: h.dir
          });
          l.set(h.id, u);
        }
        r.setNode(h.id, { ...h });
      }
    })
  );
  for (const h of i)
    c && zm(h) && await uh(a, h), r.setEdge(h.start, h.end, { ...h }, h.id), t.edges.some((d) => d.id === h.id) || t.edges.push(h);
  if (globalThis.mermaidCaptureSizes) {
    const { captureNodeSizes: h } = await import("./sizeCapture-INFHLROL-CpnVyqC3.js");
    h(e, t);
  }
  return {
    graph: r,
    groups: o,
    nodeElements: l
  };
}
p(my, "createGraphWithElements");
var It = /* @__PURE__ */ new Map(), Jr = /* @__PURE__ */ new Map(), yy = /* @__PURE__ */ new Map(), TF = /* @__PURE__ */ p(() => {
  Jr.clear(), yy.clear(), It.clear();
}, "clear"), Es = /* @__PURE__ */ p((e, t) => {
  const r = Jr.get(t) || [];
  return R.trace("In isDescendant", t, " ", e, " = ", r.includes(e)), r.includes(e);
}, "isDescendant"), SF = /* @__PURE__ */ p((e, t) => {
  const r = Jr.get(t) || [];
  return R.info("Descendants of ", t, " is ", r), R.info("Edge is ", e), e.v === t || e.w === t ? !1 : r ? r.includes(e.v) || Es(e.v, t) || Es(e.w, t) || r.includes(e.w) : (R.debug("Tilt, ", t, ",not in descendants"), !1);
}, "edgeInCluster"), xy = /* @__PURE__ */ p((e, t, r, i) => {
  R.debug(
    "Copying children of ",
    e,
    "root",
    i,
    "data",
    t.node(e),
    i
  );
  const s = t.children(e) || [];
  e !== i && s.push(e), R.debug("Copying (nodes) clusterId", e, "nodes", s), s.forEach((o) => {
    if (t.children(o).length > 0)
      xy(o, t, r, i);
    else {
      const a = t.node(o);
      R.info("cp ", o, " to ", i, " with parent ", e), r.setNode(o, a), i !== t.parent(o) && (R.debug("Setting parent", o, t.parent(o)), r.setParent(o, t.parent(o))), e !== i && o !== e ? (R.debug("Setting parent", o, e), r.setParent(o, e)) : (R.info("In copy ", e, "root", i, "data", t.node(e), i), R.debug(
        "Not Setting parent for node=",
        o,
        "cluster!==rootId",
        e !== i,
        "node!==clusterId",
        o !== e
      ));
      const n = t.edges(o);
      R.debug("Copying Edges", n), n.forEach((l) => {
        R.info("Edge", l);
        const c = t.edge(l.v, l.w, l.name);
        R.info("Edge data", c, i);
        try {
          SF(l, i) ? (R.info("Copying as ", l.v, l.w, c, l.name), r.setEdge(l.v, l.w, c, l.name), R.info("newGraph edges ", r.edges(), r.edge(r.edges()[0]))) : R.info(
            "Skipping copy of edge ",
            l.v,
            "-->",
            l.w,
            " rootId: ",
            i,
            " clusterId:",
            e
          );
        } catch (h) {
          R.error(h);
        }
      });
    }
    R.debug("Removing node", o), t.removeNode(o);
  });
}, "copy"), Cy = /* @__PURE__ */ p((e, t) => {
  const r = t.children(e);
  let i = [...r];
  for (const s of r)
    yy.set(s, e), i = [...i, ...Cy(s, t)];
  return i;
}, "extractDescendants"), _F = /* @__PURE__ */ p((e, t, r) => {
  const i = e.edges().filter((l) => l.v === t || l.w === t), s = e.edges().filter((l) => l.v === r || l.w === r), o = i.map((l) => ({ v: l.v === t ? r : l.v, w: l.w === t ? t : l.w })), a = s.map((l) => ({ v: l.v, w: l.w }));
  return o.filter((l) => a.some((c) => l.v === c.v && l.w === c.w));
}, "findCommonEdges"), Vo = /* @__PURE__ */ p((e, t, r) => {
  const i = t.children(e);
  if (R.trace("Searching children of id ", e, i), i.length < 1)
    return e;
  let s;
  for (const o of i) {
    const a = Vo(o, t, r), n = _F(t, r, a);
    if (a)
      if (n.length > 0)
        s = a;
      else
        return a;
  }
  return s;
}, "findNonClusterChild"), xd = /* @__PURE__ */ p((e) => !It.has(e) || !It.get(e).externalConnections ? e : It.has(e) ? It.get(e).id : e, "getAnchorId"), z5 = /* @__PURE__ */ p((e, t) => {
  if (!e || t > 10) {
    R.debug("Opting out, no graph ");
    return;
  } else
    R.debug("Opting in, graph ");
  e.nodes().forEach(function(r) {
    e.children(r).length > 0 && (R.debug(
      "Cluster identified",
      r,
      " Replacement id in edges: ",
      Vo(r, e, r)
    ), Jr.set(r, Cy(r, e)), It.set(r, { id: Vo(r, e, r), clusterData: e.node(r) }));
  }), e.nodes().forEach(function(r) {
    const i = e.children(r), s = e.edges();
    i.length > 0 ? (R.debug("Cluster identified", r, Jr), s.forEach((o) => {
      const a = Es(o.v, r), n = Es(o.w, r);
      a ^ n && (R.debug("Edge: ", o, " leaves cluster ", r), R.debug("Descendants of XXX ", r, ": ", Jr.get(r)), It.get(r).externalConnections = !0);
    })) : R.debug("Not a cluster ", r, Jr);
  });
  for (let r of It.keys()) {
    const i = It.get(r).id, s = e.parent(i);
    s !== r && It.has(s) && !It.get(s).externalConnections && (It.get(r).id = s);
    const o = e.edges().some((a) => a.v === r);
    if (i && It.get(r)?.externalConnections && o && wy(e, i, r)) {
      const a = vF(e, r, e.parent(i));
      a && (It.get(r).id = a);
    }
  }
  e.edges().forEach(function(r) {
    const i = e.edge(r);
    R.debug("Edge " + r.v + " -> " + r.w + ": " + JSON.stringify(r)), R.debug("Edge " + r.v + " -> " + r.w + ": " + JSON.stringify(e.edge(r)));
    let s = r.v, o = r.w;
    if (R.debug(
      "Fix XXX",
      It,
      "ids:",
      r.v,
      r.w,
      "Translating: ",
      It.get(r.v),
      " --- ",
      It.get(r.w)
    ), It.get(r.v) || It.get(r.w)) {
      if (R.debug("Fixing and trying - removing XXX", r.v, r.w, r.name), s = xd(r.v), o = xd(r.w), e.removeEdge(r.v, r.w, r.name), s !== r.v) {
        const a = e.parent(s);
        It.get(a).externalConnections = !0, i.fromCluster = r.v;
      }
      if (o !== r.w) {
        const a = e.parent(o);
        It.get(a).externalConnections = !0, i.toCluster = r.w;
      }
      R.debug("Fix Replacing with XXX", s, o, r.name), e.setEdge(s, o, i, r.name);
    }
  }), by(e, 0), R.trace(It);
}, "adjustClustersAndEdges"), by = /* @__PURE__ */ p((e, t) => {
  if (t > 10) {
    R.error("Bailing out");
    return;
  }
  let r = e.nodes(), i = !1;
  for (const s of r) {
    const o = e.children(s);
    i = i || o.length > 0;
  }
  if (!i) {
    R.debug("Done, no node has children", e.nodes());
    return;
  }
  R.debug("Nodes = ", r, t);
  for (const s of r)
    if (R.debug(
      "Extracting node",
      s,
      It,
      It.has(s) && !It.get(s).externalConnections,
      !e.parent(s),
      e.node(s),
      e.children("D"),
      " Depth ",
      t
    ), !It.has(s))
      R.debug("Not a cluster", s, t);
    else if (!It.get(s).externalConnections && e.children(s) && e.children(s).length > 0) {
      R.debug(
        "Cluster without external connections, without a parent and with children",
        s,
        t
      );
      let a = e.graph().rankdir === "TB" ? "LR" : "TB";
      It.get(s)?.clusterData?.dir && (a = It.get(s).clusterData.dir, R.debug("Fixing dir", It.get(s).clusterData.dir, a));
      const n = new ya({
        multigraph: !0,
        compound: !0
      }).setGraph({
        rankdir: a,
        nodesep: 50,
        ranksep: 50,
        marginx: 8,
        marginy: 8
      }).setDefaultEdgeLabel(function() {
        return {};
      });
      xy(s, e, n, s), e.setNode(s, {
        clusterNode: !0,
        id: s,
        clusterData: It.get(s).clusterData,
        label: It.get(s).label,
        graph: n
      });
    } else
      R.debug(
        "Cluster ** ",
        s,
        " **not meeting the criteria !externalConnections:",
        !It.get(s).externalConnections,
        " no parent: ",
        !e.parent(s),
        " children ",
        e.children(s) && e.children(s).length > 0,
        e.children("D"),
        t
      ), R.debug(It);
  r = e.nodes(), R.debug("New list of nodes", r);
  for (const s of r) {
    const o = e.node(s);
    R.debug(" Now next level", s, o), o?.clusterNode && by(o.graph, t + 1);
  }
}, "extractor"), ky = /* @__PURE__ */ p((e, t) => {
  if (t.length === 0)
    return [];
  let r = Object.assign([], t);
  return t.forEach((i) => {
    const s = e.children(i), o = ky(e, s);
    r = [...r, ...o];
  }), r;
}, "sorter"), W5 = /* @__PURE__ */ p((e) => ky(e, e.children()), "sortNodesByHierarchy"), wy = /* @__PURE__ */ p((e, t, r) => {
  let i = e.parent(t);
  for (; i && i !== r; ) {
    const s = It.get(i);
    if (s && !s.externalConnections)
      return !0;
    i = e.parent(i);
  }
  return !1;
}, "isNodeInExtractableCluster"), vF = /* @__PURE__ */ p((e, t, r) => {
  const i = e.children(t) ?? [];
  for (const s of i) {
    if (s === r || Es(s, r))
      continue;
    const o = Vo(s, e, t);
    if (o && !wy(e, o, t))
      return o;
  }
  return null;
}, "findSafeAnchorNode");
function Ty({
  prepareLayout: e,
  measureLayout: t,
  runLayoutCore: r,
  paintLayout: i,
  afterPaint: s,
  paintOptions: o
}) {
  const a = t ?? wh;
  return /* @__PURE__ */ p(async function(l, c, h, u) {
    const d = c.select("g");
    (h?.insertMarkers ?? jm)(
      d,
      l.markers,
      l.type,
      l.diagramId
    ), kh();
    const f = {
      element: d,
      // root SVG <g>
      helpers: h,
      // Mermaid helper functions
      options: u
      // { algorithm: "elk.layered" }
    };
    f.preparedLayout = await e?.(l, f);
    const m = await a(l, f), y = await r(l, f), x = {
      ...f,
      measure: m
    };
    i ? await i(l, x, y) : await Th(
      l,
      x,
      o
    ), await s?.(l, x, y);
  }, "render");
}
p(Ty, "createCommonLayoutRenderer");
function kh() {
  YS(), s_(), QS(), TF();
}
p(kh, "clearLayoutRenderState");
async function wh(e, { element: t }) {
  return await my(t, e);
}
p(wh, "defaultMeasureLayout");
async function Th(e, t, r = {}) {
  const { measure: i } = t, { groups: s } = i;
  for (const a of r.getNodes?.(e, t) ?? e.nodes)
    r.skipNode?.(a, t) || await Sy(s, a, t, r);
  const o = vy(e.nodes);
  for (const a of e.edges)
    By(a, r) || await Ly(s, a, o, e, r, t);
}
p(Th, "paintLayoutData");
async function Sy(e, t, r, i) {
  t.clusterNode ? Nu(t) : _y(t, r, i) ? await qm(e.clusters, t) : Nu(t);
}
p(Sy, "paintLayoutNode");
function _y(e, t, r) {
  return e.isGroup === !0 && (r.isCluster?.(e, t) ?? !0);
}
p(_y, "shouldPaintAsCluster");
function vy(e) {
  const t = /* @__PURE__ */ new Map();
  for (const r of e)
    r?.id && t.set(r.id, r);
  return t;
}
p(vy, "buildNodeLookup");
function By(e, t) {
  return e.isLayoutOnly || !!t.skipEdge?.(e);
}
p(By, "shouldSkipPaintEdge");
async function Ly(e, t, r, i, s, o) {
  const a = Hm(
    e.edgePaths,
    { ...t },
    s.clusterDb ?? /* @__PURE__ */ new Map(),
    i.type,
    cl(t.start, t, r, o, s),
    cl(t.end, t, r, o, s),
    i.diagramId,
    Fy(t, s)
  );
  zm(t) && (Ii.has(t.id) || await uh(e.edgeLabels, t), Ay(t, a));
}
p(Ly, "paintLayoutEdge");
function cl(e, t, r, i, s) {
  return s.getEdgeNode?.(e, t, i) ?? (e ? r.get(e) ?? {} : {});
}
p(cl, "getRenderedNode");
function Fy(e, t) {
  return typeof t.skipIntersect == "function" ? t.skipIntersect(e) : t.skipIntersect ?? !1;
}
p(Fy, "shouldSkipIntersect");
function Ay(e, t) {
  const r = t?.updatedPath ?? t?.originalPath, i = Xt(), { subGraphTitleTotalMargin: s } = ha({
    flowchart: i.flowchart ?? {}
  });
  if (e.label) {
    const o = Ii.get(e.id);
    let a = e.x, n = e.y;
    if (r) {
      const l = pe.calcLabelPosition(r);
      R.debug(
        "Moving label " + e.label + " from (",
        a,
        ",",
        n,
        ") to (",
        l.x,
        ",",
        l.y,
        ") abc88"
      ), t?.updatedPath && (a = l.x, n = l.y);
    }
    o.attr("transform", `translate(${a}, ${n + s / 2})`);
  }
  if (e?.startLabelLeft) {
    const o = Qt.get(e.id).startLeft;
    let a = e?.x, n = e?.y;
    if (r) {
      const l = pe.calcTerminalLabelPosition(e.arrowTypeStart ? 10 : 0, "start_left", r);
      a = l.x, n = l.y;
    }
    o.attr("transform", `translate(${a}, ${n})`);
  }
  if (e.startLabelRight) {
    const o = Qt.get(e.id).startRight;
    let a = e.x, n = e.y;
    if (r) {
      const l = pe.calcTerminalLabelPosition(
        e.arrowTypeStart ? 10 : 0,
        "start_right",
        r
      );
      a = l.x, n = l.y;
    }
    o.attr("transform", `translate(${a}, ${n})`);
  }
  if (e.endLabelLeft) {
    const o = Qt.get(e.id).endLeft;
    let a = e.x, n = e.y;
    if (r) {
      const l = pe.calcTerminalLabelPosition(e.arrowTypeEnd ? 10 : 0, "end_left", r);
      a = l.x, n = l.y;
    }
    o.attr("transform", `translate(${a}, ${n})`);
  }
  if (e.endLabelRight) {
    const o = Qt.get(e.id).endRight;
    let a = e.x, n = e.y;
    if (r) {
      const l = pe.calcTerminalLabelPosition(e.arrowTypeEnd ? 10 : 0, "end_right", r);
      a = l.x, n = l.y;
    }
    o.attr("transform", `translate(${a}, ${n})`);
  }
}
p(Ay, "positionRenderedEdgeLabel");
function Ey(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
p(Ey, "getDefaultExportFromCjs");
var ce = {}, lo = {}, Or = {}, Cd;
function Wi() {
  if (Cd) return Or;
  Cd = 1;
  function e(a) {
    return typeof a > "u" || a === null;
  }
  p(e, "isNothing");
  function t(a) {
    return typeof a == "object" && a !== null;
  }
  p(t, "isObject");
  function r(a) {
    return Array.isArray(a) ? a : e(a) ? [] : [a];
  }
  p(r, "toArray");
  function i(a, n) {
    if (n) {
      const l = Object.keys(n);
      for (let c = 0, h = l.length; c < h; c += 1) {
        const u = l[c];
        a[u] = n[u];
      }
    }
    return a;
  }
  p(i, "extend");
  function s(a, n) {
    let l = "";
    for (let c = 0; c < n; c += 1)
      l += a;
    return l;
  }
  p(s, "repeat");
  function o(a) {
    return a === 0 && Number.NEGATIVE_INFINITY === 1 / a;
  }
  return p(o, "isNegativeZero"), Or.isNothing = e, Or.isObject = t, Or.toArray = r, Or.repeat = s, Or.isNegativeZero = o, Or.extend = i, Or;
}
p(Wi, "requireCommon");
var rn, bd;
function Hi() {
  if (bd) return rn;
  bd = 1;
  function e(r, i) {
    let s = "";
    const o = r.reason || "(unknown reason)";
    return r.mark ? (r.mark.name && (s += 'in "' + r.mark.name + '" '), s += "(" + (r.mark.line + 1) + ":" + (r.mark.column + 1) + ")", !i && r.mark.snippet && (s += `

` + r.mark.snippet), o + " " + s) : o;
  }
  p(e, "formatError");
  function t(r, i) {
    Error.call(this), this.name = "YAMLException", this.reason = r, this.mark = i, this.message = e(this, !1), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack || "";
  }
  return p(t, "YAMLException2"), t.prototype = Object.create(Error.prototype), t.prototype.constructor = t, t.prototype.toString = /* @__PURE__ */ p(function(i) {
    return this.name + ": " + e(this, i);
  }, "toString"), rn = t, rn;
}
p(Hi, "requireException");
var sn, kd;
function My() {
  if (kd) return sn;
  kd = 1;
  const e = Wi();
  function t(s, o, a, n, l) {
    let c = "", h = "";
    const u = Math.floor(l / 2) - 1;
    return n - o > u && (c = " ... ", o = n - u + c.length), a - n > u && (h = " ...", a = n + u - h.length), {
      str: c + s.slice(o, a).replace(/\t/g, "→") + h,
      pos: n - o + c.length
      // relative position
    };
  }
  p(t, "getLine");
  function r(s, o) {
    return e.repeat(" ", o - s.length) + s;
  }
  p(r, "padStart");
  function i(s, o) {
    if (o = Object.create(o || null), !s.buffer) return null;
    o.maxLength || (o.maxLength = 79), typeof o.indent != "number" && (o.indent = 1), typeof o.linesBefore != "number" && (o.linesBefore = 3), typeof o.linesAfter != "number" && (o.linesAfter = 2);
    const a = /\r?\n|\r|\0/g, n = [0], l = [];
    let c, h = -1;
    for (; c = a.exec(s.buffer); )
      l.push(c.index), n.push(c.index + c[0].length), s.position <= c.index && h < 0 && (h = n.length - 2);
    h < 0 && (h = n.length - 1);
    let u = "";
    const d = Math.min(s.line + o.linesAfter, l.length).toString().length, f = o.maxLength - (o.indent + d + 3);
    for (let y = 1; y <= o.linesBefore && !(h - y < 0); y++) {
      const x = t(
        s.buffer,
        n[h - y],
        l[h - y],
        s.position - (n[h] - n[h - y]),
        f
      );
      u = e.repeat(" ", o.indent) + r((s.line - y + 1).toString(), d) + " | " + x.str + `
` + u;
    }
    const m = t(s.buffer, n[h], l[h], s.position, f);
    u += e.repeat(" ", o.indent) + r((s.line + 1).toString(), d) + " | " + m.str + `
`, u += e.repeat("-", o.indent + d + 3 + m.pos) + `^
`;
    for (let y = 1; y <= o.linesAfter && !(h + y >= l.length); y++) {
      const x = t(
        s.buffer,
        n[h + y],
        l[h + y],
        s.position - (n[h] - n[h + y]),
        f
      );
      u += e.repeat(" ", o.indent) + r((s.line + y + 1).toString(), d) + " | " + x.str + `
`;
    }
    return u.replace(/\n$/, "");
  }
  return p(i, "makeSnippet"), sn = i, sn;
}
p(My, "requireSnippet");
var on, wd;
function me() {
  if (wd) return on;
  wd = 1;
  const e = Hi(), t = [
    "kind",
    "multi",
    "resolve",
    "construct",
    "instanceOf",
    "predicate",
    "represent",
    "representName",
    "defaultStyle",
    "styleAliases"
  ], r = [
    "scalar",
    "sequence",
    "mapping"
  ];
  function i(o) {
    const a = {};
    return o !== null && Object.keys(o).forEach(function(n) {
      o[n].forEach(function(l) {
        a[String(l)] = n;
      });
    }), a;
  }
  p(i, "compileStyleAliases");
  function s(o, a) {
    if (a = a || {}, Object.keys(a).forEach(function(n) {
      if (t.indexOf(n) === -1)
        throw new e('Unknown option "' + n + '" is met in definition of "' + o + '" YAML type.');
    }), this.options = a, this.tag = o, this.kind = a.kind || null, this.resolve = a.resolve || function() {
      return !0;
    }, this.construct = a.construct || function(n) {
      return n;
    }, this.instanceOf = a.instanceOf || null, this.predicate = a.predicate || null, this.represent = a.represent || null, this.representName = a.representName || null, this.defaultStyle = a.defaultStyle || null, this.multi = a.multi || !1, this.styleAliases = i(a.styleAliases || null), r.indexOf(this.kind) === -1)
      throw new e('Unknown kind "' + this.kind + '" is specified for "' + o + '" YAML type.');
  }
  return p(s, "Type2"), on = s, on;
}
p(me, "requireType");
var an, Td;
function Sh() {
  if (Td) return an;
  Td = 1;
  const e = Hi(), t = me();
  function r(o, a) {
    const n = [];
    return o[a].forEach(function(l) {
      let c = n.length;
      n.forEach(function(h, u) {
        h.tag === l.tag && h.kind === l.kind && h.multi === l.multi && (c = u);
      }), n[c] = l;
    }), n;
  }
  p(r, "compileList");
  function i() {
    const o = {
      scalar: {},
      sequence: {},
      mapping: {},
      fallback: {},
      multi: {
        scalar: [],
        sequence: [],
        mapping: [],
        fallback: []
      }
    };
    function a(n) {
      n.multi ? (o.multi[n.kind].push(n), o.multi.fallback.push(n)) : o[n.kind][n.tag] = o.fallback[n.tag] = n;
    }
    p(a, "collectType");
    for (let n = 0, l = arguments.length; n < l; n += 1)
      arguments[n].forEach(a);
    return o;
  }
  p(i, "compileMap");
  function s(o) {
    return this.extend(o);
  }
  return p(s, "Schema2"), s.prototype.extend = /* @__PURE__ */ p(function(a) {
    let n = [], l = [];
    if (a instanceof t)
      l.push(a);
    else if (Array.isArray(a))
      l = l.concat(a);
    else if (a && (Array.isArray(a.implicit) || Array.isArray(a.explicit)))
      a.implicit && (n = n.concat(a.implicit)), a.explicit && (l = l.concat(a.explicit));
    else
      throw new e("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");
    n.forEach(function(h) {
      if (!(h instanceof t))
        throw new e("Specified list of YAML types (or a single Type object) contains a non-Type object.");
      if (h.loadKind && h.loadKind !== "scalar")
        throw new e("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
      if (h.multi)
        throw new e("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.");
    }), l.forEach(function(h) {
      if (!(h instanceof t))
        throw new e("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    });
    const c = Object.create(s.prototype);
    return c.implicit = (this.implicit || []).concat(n), c.explicit = (this.explicit || []).concat(l), c.compiledImplicit = r(c, "implicit"), c.compiledExplicit = r(c, "explicit"), c.compiledTypeMap = i(c.compiledImplicit, c.compiledExplicit), c;
  }, "extend"), an = s, an;
}
p(Sh, "requireSchema");
var nn, Sd;
function _h() {
  if (Sd) return nn;
  Sd = 1;
  const e = me();
  return nn = new e("tag:yaml.org,2002:str", {
    kind: "scalar",
    construct: /* @__PURE__ */ p(function(t) {
      return t !== null ? t : "";
    }, "construct")
  }), nn;
}
p(_h, "requireStr");
var ln, _d;
function vh() {
  if (_d) return ln;
  _d = 1;
  const e = me();
  return ln = new e("tag:yaml.org,2002:seq", {
    kind: "sequence",
    construct: /* @__PURE__ */ p(function(t) {
      return t !== null ? t : [];
    }, "construct")
  }), ln;
}
p(vh, "requireSeq");
var hn, vd;
function Bh() {
  if (vd) return hn;
  vd = 1;
  const e = me();
  return hn = new e("tag:yaml.org,2002:map", {
    kind: "mapping",
    construct: /* @__PURE__ */ p(function(t) {
      return t !== null ? t : {};
    }, "construct")
  }), hn;
}
p(Bh, "requireMap");
var cn, Bd;
function Lh() {
  if (Bd) return cn;
  Bd = 1;
  const e = Sh();
  return cn = new e({
    explicit: [
      _h(),
      vh(),
      Bh()
    ]
  }), cn;
}
p(Lh, "requireFailsafe");
var un, Ld;
function Fh() {
  if (Ld) return un;
  Ld = 1;
  const e = me();
  function t(s) {
    if (s === null) return !0;
    const o = s.length;
    return o === 1 && s === "~" || o === 4 && (s === "null" || s === "Null" || s === "NULL");
  }
  p(t, "resolveYamlNull");
  function r() {
    return null;
  }
  p(r, "constructYamlNull");
  function i(s) {
    return s === null;
  }
  return p(i, "isNull"), un = new e("tag:yaml.org,2002:null", {
    kind: "scalar",
    resolve: t,
    construct: r,
    predicate: i,
    represent: {
      canonical: /* @__PURE__ */ p(function() {
        return "~";
      }, "canonical"),
      lowercase: /* @__PURE__ */ p(function() {
        return "null";
      }, "lowercase"),
      uppercase: /* @__PURE__ */ p(function() {
        return "NULL";
      }, "uppercase"),
      camelcase: /* @__PURE__ */ p(function() {
        return "Null";
      }, "camelcase"),
      empty: /* @__PURE__ */ p(function() {
        return "";
      }, "empty")
    },
    defaultStyle: "lowercase"
  }), un;
}
p(Fh, "require_null");
var dn, Fd;
function Ah() {
  if (Fd) return dn;
  Fd = 1;
  const e = me();
  function t(s) {
    if (s === null) return !1;
    const o = s.length;
    return o === 4 && (s === "true" || s === "True" || s === "TRUE") || o === 5 && (s === "false" || s === "False" || s === "FALSE");
  }
  p(t, "resolveYamlBoolean");
  function r(s) {
    return s === "true" || s === "True" || s === "TRUE";
  }
  p(r, "constructYamlBoolean");
  function i(s) {
    return Object.prototype.toString.call(s) === "[object Boolean]";
  }
  return p(i, "isBoolean"), dn = new e("tag:yaml.org,2002:bool", {
    kind: "scalar",
    resolve: t,
    construct: r,
    predicate: i,
    represent: {
      lowercase: /* @__PURE__ */ p(function(s) {
        return s ? "true" : "false";
      }, "lowercase"),
      uppercase: /* @__PURE__ */ p(function(s) {
        return s ? "TRUE" : "FALSE";
      }, "uppercase"),
      camelcase: /* @__PURE__ */ p(function(s) {
        return s ? "True" : "False";
      }, "camelcase")
    },
    defaultStyle: "lowercase"
  }), dn;
}
p(Ah, "requireBool");
var fn, Ad;
function Eh() {
  if (Ad) return fn;
  Ad = 1;
  const e = Wi(), t = me();
  function r(c) {
    return c >= 48 && c <= 57 || c >= 65 && c <= 70 || c >= 97 && c <= 102;
  }
  p(r, "isHexCode");
  function i(c) {
    return c >= 48 && c <= 55;
  }
  p(i, "isOctCode");
  function s(c) {
    return c >= 48 && c <= 57;
  }
  p(s, "isDecCode");
  function o(c) {
    if (c === null) return !1;
    const h = c.length;
    let u = 0, d = !1;
    if (!h) return !1;
    let f = c[u];
    if ((f === "-" || f === "+") && (f = c[++u]), f === "0") {
      if (u + 1 === h) return !0;
      if (f = c[++u], f === "b") {
        for (u++; u < h; u++) {
          if (f = c[u], f !== "0" && f !== "1") return !1;
          d = !0;
        }
        return d && isFinite(a(c));
      }
      if (f === "x") {
        for (u++; u < h; u++) {
          if (!r(c.charCodeAt(u))) return !1;
          d = !0;
        }
        return d && isFinite(a(c));
      }
      if (f === "o") {
        for (u++; u < h; u++) {
          if (!i(c.charCodeAt(u))) return !1;
          d = !0;
        }
        return d && isFinite(a(c));
      }
    }
    for (; u < h; u++) {
      if (!s(c.charCodeAt(u)))
        return !1;
      d = !0;
    }
    return d ? isFinite(a(c)) : !1;
  }
  p(o, "resolveYamlInteger");
  function a(c) {
    let h = c, u = 1, d = h[0];
    if ((d === "-" || d === "+") && (d === "-" && (u = -1), h = h.slice(1), d = h[0]), h === "0") return 0;
    if (d === "0") {
      if (h[1] === "b") return u * parseInt(h.slice(2), 2);
      if (h[1] === "x") return u * parseInt(h.slice(2), 16);
      if (h[1] === "o") return u * parseInt(h.slice(2), 8);
    }
    return u * parseInt(h, 10);
  }
  p(a, "parseYamlInteger");
  function n(c) {
    return a(c);
  }
  p(n, "constructYamlInteger");
  function l(c) {
    return Object.prototype.toString.call(c) === "[object Number]" && c % 1 === 0 && !e.isNegativeZero(c);
  }
  return p(l, "isInteger"), fn = new t("tag:yaml.org,2002:int", {
    kind: "scalar",
    resolve: o,
    construct: n,
    predicate: l,
    represent: {
      binary: /* @__PURE__ */ p(function(c) {
        return c >= 0 ? "0b" + c.toString(2) : "-0b" + c.toString(2).slice(1);
      }, "binary"),
      octal: /* @__PURE__ */ p(function(c) {
        return c >= 0 ? "0o" + c.toString(8) : "-0o" + c.toString(8).slice(1);
      }, "octal"),
      decimal: /* @__PURE__ */ p(function(c) {
        return c.toString(10);
      }, "decimal"),
      hexadecimal: /* @__PURE__ */ p(function(c) {
        return c >= 0 ? "0x" + c.toString(16).toUpperCase() : "-0x" + c.toString(16).toUpperCase().slice(1);
      }, "hexadecimal")
    },
    defaultStyle: "decimal",
    styleAliases: {
      binary: [2, "bin"],
      octal: [8, "oct"],
      decimal: [10, "dec"],
      hexadecimal: [16, "hex"]
    }
  }), fn;
}
p(Eh, "requireInt");
var pn, Ed;
function Mh() {
  if (Ed) return pn;
  Ed = 1;
  const e = Wi(), t = me(), r = new RegExp(
    // 2.5e4, 2.5 and integers
    "^(?:[-+]?(?:[0-9]+)(?:\\.[0-9]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$"
  ), i = new RegExp(
    "^(?:[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$"
  );
  function s(c) {
    return c === null || !r.test(c) ? !1 : isFinite(parseFloat(c, 10)) ? !0 : i.test(c);
  }
  p(s, "resolveYamlFloat");
  function o(c) {
    let h = c.toLowerCase();
    const u = h[0] === "-" ? -1 : 1;
    return "+-".indexOf(h[0]) >= 0 && (h = h.slice(1)), h === ".inf" ? u === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY : h === ".nan" ? NaN : u * parseFloat(h, 10);
  }
  p(o, "constructYamlFloat");
  const a = /^[-+]?[0-9]+e/;
  function n(c, h) {
    if (isNaN(c))
      switch (h) {
        case "lowercase":
          return ".nan";
        case "uppercase":
          return ".NAN";
        case "camelcase":
          return ".NaN";
      }
    else if (Number.POSITIVE_INFINITY === c)
      switch (h) {
        case "lowercase":
          return ".inf";
        case "uppercase":
          return ".INF";
        case "camelcase":
          return ".Inf";
      }
    else if (Number.NEGATIVE_INFINITY === c)
      switch (h) {
        case "lowercase":
          return "-.inf";
        case "uppercase":
          return "-.INF";
        case "camelcase":
          return "-.Inf";
      }
    else if (e.isNegativeZero(c))
      return "-0.0";
    const u = c.toString(10);
    return a.test(u) ? u.replace("e", ".e") : u;
  }
  p(n, "representYamlFloat");
  function l(c) {
    return Object.prototype.toString.call(c) === "[object Number]" && (c % 1 !== 0 || e.isNegativeZero(c));
  }
  return p(l, "isFloat"), pn = new t("tag:yaml.org,2002:float", {
    kind: "scalar",
    resolve: s,
    construct: o,
    predicate: l,
    represent: n,
    defaultStyle: "lowercase"
  }), pn;
}
p(Mh, "requireFloat");
var gn, Md;
function $h() {
  return Md || (Md = 1, gn = Lh().extend({
    implicit: [
      Fh(),
      Ah(),
      Eh(),
      Mh()
    ]
  })), gn;
}
p($h, "requireJson");
var mn, $d;
function Oh() {
  return $d || ($d = 1, mn = $h()), mn;
}
p(Oh, "requireCore");
var yn, Od;
function Dh() {
  if (Od) return yn;
  Od = 1;
  const e = me(), t = new RegExp(
    "^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"
  ), r = new RegExp(
    "^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$"
  );
  function i(a) {
    return a === null ? !1 : t.exec(a) !== null || r.exec(a) !== null;
  }
  p(i, "resolveYamlTimestamp");
  function s(a) {
    let n = 0, l = null, c = t.exec(a);
    if (c === null && (c = r.exec(a)), c === null) throw new Error("Date resolve error");
    const h = +c[1], u = +c[2] - 1, d = +c[3];
    if (!c[4])
      return new Date(Date.UTC(h, u, d));
    const f = +c[4], m = +c[5], y = +c[6];
    if (c[7]) {
      for (n = c[7].slice(0, 3); n.length < 3; )
        n += "0";
      n = +n;
    }
    if (c[9]) {
      const C = +c[10], k = +(c[11] || 0);
      l = (C * 60 + k) * 6e4, c[9] === "-" && (l = -l);
    }
    const x = new Date(Date.UTC(h, u, d, f, m, y, n));
    return l && x.setTime(x.getTime() - l), x;
  }
  p(s, "constructYamlTimestamp");
  function o(a) {
    return a.toISOString();
  }
  return p(o, "representYamlTimestamp"), yn = new e("tag:yaml.org,2002:timestamp", {
    kind: "scalar",
    resolve: i,
    construct: s,
    instanceOf: Date,
    represent: o
  }), yn;
}
p(Dh, "requireTimestamp");
var xn, Dd;
function Ih() {
  if (Dd) return xn;
  Dd = 1;
  const e = me();
  function t(r) {
    return r === "<<" || r === null;
  }
  return p(t, "resolveYamlMerge"), xn = new e("tag:yaml.org,2002:merge", {
    kind: "scalar",
    resolve: t
  }), xn;
}
p(Ih, "requireMerge");
var Cn, Id;
function Ph() {
  if (Id) return Cn;
  Id = 1;
  const e = me(), t = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;
  function r(a) {
    if (a === null) return !1;
    let n = 0;
    const l = a.length, c = t;
    for (let h = 0; h < l; h++) {
      const u = c.indexOf(a.charAt(h));
      if (!(u > 64)) {
        if (u < 0) return !1;
        n += 6;
      }
    }
    return n % 8 === 0;
  }
  p(r, "resolveYamlBinary");
  function i(a) {
    const n = a.replace(/[\r\n=]/g, ""), l = n.length, c = t;
    let h = 0;
    const u = [];
    for (let f = 0; f < l; f++)
      f % 4 === 0 && f && (u.push(h >> 16 & 255), u.push(h >> 8 & 255), u.push(h & 255)), h = h << 6 | c.indexOf(n.charAt(f));
    const d = l % 4 * 6;
    return d === 0 ? (u.push(h >> 16 & 255), u.push(h >> 8 & 255), u.push(h & 255)) : d === 18 ? (u.push(h >> 10 & 255), u.push(h >> 2 & 255)) : d === 12 && u.push(h >> 4 & 255), new Uint8Array(u);
  }
  p(i, "constructYamlBinary");
  function s(a) {
    let n = "", l = 0;
    const c = a.length, h = t;
    for (let d = 0; d < c; d++)
      d % 3 === 0 && d && (n += h[l >> 18 & 63], n += h[l >> 12 & 63], n += h[l >> 6 & 63], n += h[l & 63]), l = (l << 8) + a[d];
    const u = c % 3;
    return u === 0 ? (n += h[l >> 18 & 63], n += h[l >> 12 & 63], n += h[l >> 6 & 63], n += h[l & 63]) : u === 2 ? (n += h[l >> 10 & 63], n += h[l >> 4 & 63], n += h[l << 2 & 63], n += h[64]) : u === 1 && (n += h[l >> 2 & 63], n += h[l << 4 & 63], n += h[64], n += h[64]), n;
  }
  p(s, "representYamlBinary");
  function o(a) {
    return Object.prototype.toString.call(a) === "[object Uint8Array]";
  }
  return p(o, "isBinary"), Cn = new e("tag:yaml.org,2002:binary", {
    kind: "scalar",
    resolve: r,
    construct: i,
    predicate: o,
    represent: s
  }), Cn;
}
p(Ph, "requireBinary");
var bn, Pd;
function Rh() {
  if (Pd) return bn;
  Pd = 1;
  const e = me(), t = Object.prototype.hasOwnProperty, r = Object.prototype.toString;
  function i(o) {
    if (o === null) return !0;
    const a = [], n = o;
    for (let l = 0, c = n.length; l < c; l += 1) {
      const h = n[l];
      let u = !1;
      if (r.call(h) !== "[object Object]") return !1;
      let d;
      for (d in h)
        if (t.call(h, d))
          if (!u) u = !0;
          else return !1;
      if (!u) return !1;
      if (a.indexOf(d) === -1) a.push(d);
      else return !1;
    }
    return !0;
  }
  p(i, "resolveYamlOmap");
  function s(o) {
    return o !== null ? o : [];
  }
  return p(s, "constructYamlOmap"), bn = new e("tag:yaml.org,2002:omap", {
    kind: "sequence",
    resolve: i,
    construct: s
  }), bn;
}
p(Rh, "requireOmap");
var kn, Rd;
function Nh() {
  if (Rd) return kn;
  Rd = 1;
  const e = me(), t = Object.prototype.toString;
  function r(s) {
    if (s === null) return !0;
    const o = s, a = new Array(o.length);
    for (let n = 0, l = o.length; n < l; n += 1) {
      const c = o[n];
      if (t.call(c) !== "[object Object]") return !1;
      const h = Object.keys(c);
      if (h.length !== 1) return !1;
      a[n] = [h[0], c[h[0]]];
    }
    return !0;
  }
  p(r, "resolveYamlPairs");
  function i(s) {
    if (s === null) return [];
    const o = s, a = new Array(o.length);
    for (let n = 0, l = o.length; n < l; n += 1) {
      const c = o[n], h = Object.keys(c);
      a[n] = [h[0], c[h[0]]];
    }
    return a;
  }
  return p(i, "constructYamlPairs"), kn = new e("tag:yaml.org,2002:pairs", {
    kind: "sequence",
    resolve: r,
    construct: i
  }), kn;
}
p(Nh, "requirePairs");
var wn, Nd;
function qh() {
  if (Nd) return wn;
  Nd = 1;
  const e = me(), t = Object.prototype.hasOwnProperty;
  function r(s) {
    if (s === null) return !0;
    const o = s;
    for (const a in o)
      if (t.call(o, a) && o[a] !== null)
        return !1;
    return !0;
  }
  p(r, "resolveYamlSet");
  function i(s) {
    return s !== null ? s : {};
  }
  return p(i, "constructYamlSet"), wn = new e("tag:yaml.org,2002:set", {
    kind: "mapping",
    resolve: r,
    construct: i
  }), wn;
}
p(qh, "requireSet");
var Tn, qd;
function xa() {
  return qd || (qd = 1, Tn = Oh().extend({
    implicit: [
      Dh(),
      Ih()
    ],
    explicit: [
      Ph(),
      Rh(),
      Nh(),
      qh()
    ]
  })), Tn;
}
p(xa, "require_default");
var zd;
function $y() {
  if (zd) return lo;
  zd = 1;
  const e = Wi(), t = Hi(), r = My(), i = xa(), s = Object.prototype.hasOwnProperty, o = 1, a = 2, n = 3, l = 4, c = 1, h = 2, u = 3, d = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/, f = /[\x85\u2028\u2029]/, m = /[,\[\]{}]/, y = /^(?:!|!!|![0-9A-Za-z-]+!)$/, x = /^(?:!|[^,\[\]{}])(?:%[0-9a-f]{2}|[0-9a-z\-#;/?:@&=+$,_.!~*'()\[\]])*$/i;
  function C(g) {
    return Object.prototype.toString.call(g);
  }
  p(C, "_class");
  function k(g) {
    return g === 10 || g === 13;
  }
  p(k, "isEol");
  function T(g) {
    return g === 9 || g === 32;
  }
  p(T, "isWhiteSpace");
  function _(g) {
    return g === 9 || g === 32 || g === 10 || g === 13;
  }
  p(_, "isWsOrEol");
  function v(g) {
    return g === 44 || g === 91 || g === 93 || g === 123 || g === 125;
  }
  p(v, "isFlowIndicator");
  function L(g) {
    if (g >= 48 && g <= 57)
      return g - 48;
    const M = g | 32;
    return M >= 97 && M <= 102 ? M - 97 + 10 : -1;
  }
  p(L, "fromHexCode");
  function A(g) {
    return g === 120 ? 2 : g === 117 ? 4 : g === 85 ? 8 : 0;
  }
  p(A, "escapedHexLen");
  function F(g) {
    return g >= 48 && g <= 57 ? g - 48 : -1;
  }
  p(F, "fromDecimalCode");
  function G(g) {
    switch (g) {
      case 48:
        return "\0";
      case 97:
        return "\x07";
      case 98:
        return "\b";
      case 116:
        return "	";
      case 9:
        return "	";
      case 110:
        return `
`;
      case 118:
        return "\v";
      case 102:
        return "\f";
      case 114:
        return "\r";
      case 101:
        return "\x1B";
      case 32:
        return " ";
      case 34:
        return '"';
      case 47:
        return "/";
      case 92:
        return "\\";
      case 78:
        return "";
      case 95:
        return " ";
      case 76:
        return "\u2028";
      case 80:
        return "\u2029";
      default:
        return "";
    }
  }
  p(G, "simpleEscapeSequence");
  function Y(g) {
    return g <= 65535 ? String.fromCharCode(g) : String.fromCharCode(
      (g - 65536 >> 10) + 55296,
      (g - 65536 & 1023) + 56320
    );
  }
  p(Y, "charFromCodepoint");
  function N(g, M, j) {
    M === "__proto__" ? Object.defineProperty(g, M, {
      configurable: !0,
      enumerable: !0,
      writable: !0,
      value: j
    }) : g[M] = j;
  }
  p(N, "setProperty");
  const st = new Array(256), U = new Array(256);
  for (let g = 0; g < 256; g++)
    st[g] = G(g) ? 1 : 0, U[g] = G(g);
  function O(g, M) {
    this.input = g, this.filename = M.filename || null, this.schema = M.schema || i, this.onWarning = M.onWarning || null, this.legacy = M.legacy || !1, this.json = M.json || !1, this.listener = M.listener || null, this.maxDepth = typeof M.maxDepth == "number" ? M.maxDepth : 100, this.maxTotalMergeKeys = typeof M.maxTotalMergeKeys == "number" ? M.maxTotalMergeKeys : 1e4, this.implicitTypes = this.schema.compiledImplicit, this.typeMap = this.schema.compiledTypeMap, this.length = g.length, this.position = 0, this.line = 0, this.lineStart = 0, this.lineIndent = 0, this.depth = 0, this.totalMergeKeys = 0, this.firstTabInLine = -1, this.documents = [], this.anchorMapTransactions = [];
  }
  p(O, "State");
  function D(g, M) {
    const j = {
      name: g.filename,
      buffer: g.input.slice(0, -1),
      // omit trailing \0
      position: g.position,
      line: g.line,
      column: g.position - g.lineStart
    };
    return j.snippet = r(j), new t(M, j);
  }
  p(D, "generateError");
  function B(g, M) {
    throw D(g, M);
  }
  p(B, "throwError");
  function q(g, M) {
    g.onWarning && g.onWarning.call(null, D(g, M));
  }
  p(q, "throwWarning");
  function I(g, M, j) {
    const V = g.anchorMapTransactions;
    if (V.length !== 0) {
      const H = V[V.length - 1];
      s.call(H, M) || (H[M] = {
        existed: s.call(g.anchorMap, M),
        value: g.anchorMap[M]
      });
    }
    g.anchorMap[M] = j;
  }
  p(I, "storeAnchor");
  function it(g) {
    g.anchorMapTransactions.push(/* @__PURE__ */ Object.create(null));
  }
  p(it, "beginAnchorTransaction");
  function Q(g) {
    const M = g.anchorMapTransactions.pop(), j = g.anchorMapTransactions;
    if (j.length === 0) return;
    const V = j[j.length - 1], H = Object.keys(M);
    for (let et = 0, w = H.length; et < w; et += 1) {
      const P = H[et];
      s.call(V, P) || (V[P] = M[P]);
    }
  }
  p(Q, "commitAnchorTransaction");
  function mt(g) {
    const M = g.anchorMapTransactions.pop(), j = Object.keys(M);
    for (let V = j.length - 1; V >= 0; V -= 1) {
      const H = M[j[V]];
      H.existed ? g.anchorMap[j[V]] = H.value : delete g.anchorMap[j[V]];
    }
  }
  p(mt, "rollbackAnchorTransaction");
  function St(g) {
    return {
      position: g.position,
      line: g.line,
      lineStart: g.lineStart,
      lineIndent: g.lineIndent,
      firstTabInLine: g.firstTabInLine,
      tag: g.tag,
      anchor: g.anchor,
      kind: g.kind,
      result: g.result
    };
  }
  p(St, "snapshotState");
  function Tt(g, M) {
    g.position = M.position, g.line = M.line, g.lineStart = M.lineStart, g.lineIndent = M.lineIndent, g.firstTabInLine = M.firstTabInLine, g.tag = M.tag, g.anchor = M.anchor, g.kind = M.kind, g.result = M.result;
  }
  p(Tt, "restoreState");
  const ft = {
    YAML: /* @__PURE__ */ p(function(M, j, V) {
      M.version !== null && B(M, "duplication of %YAML directive"), V.length !== 1 && B(M, "YAML directive accepts exactly one argument");
      const H = /^([0-9]+)\.([0-9]+)$/.exec(V[0]);
      H === null && B(M, "ill-formed argument of the YAML directive");
      const et = parseInt(H[1], 10), w = parseInt(H[2], 10);
      et !== 1 && B(M, "unacceptable YAML version of the document"), M.version = V[0], M.checkLineBreaks = w < 2, w !== 1 && w !== 2 && q(M, "unsupported YAML version of the document");
    }, "handleYamlDirective"),
    TAG: /* @__PURE__ */ p(function(M, j, V) {
      let H;
      V.length !== 2 && B(M, "TAG directive accepts exactly two arguments");
      const et = V[0];
      H = V[1], y.test(et) || B(M, "ill-formed tag handle (first argument) of the TAG directive"), s.call(M.tagMap, et) && B(M, 'there is a previously declared suffix for "' + et + '" tag handle'), x.test(H) || B(M, "ill-formed tag prefix (second argument) of the TAG directive");
      try {
        H = decodeURIComponent(H);
      } catch {
        B(M, "tag prefix is malformed: " + H);
      }
      M.tagMap[et] = H;
    }, "handleTagDirective")
  };
  function Lt(g, M, j, V) {
    if (M < j) {
      const H = g.input.slice(M, j);
      if (V)
        for (let et = 0, w = H.length; et < w; et += 1) {
          const P = H.charCodeAt(et);
          P === 9 || P >= 32 && P <= 1114111 || B(g, "expected valid JSON character");
        }
      else d.test(H) && B(g, "the stream contains non-printable characters");
      g.result += H;
    }
  }
  p(Lt, "captureSegment");
  function gt(g, M, j, V) {
    e.isObject(j) || B(g, "cannot merge mappings; the provided source object is unacceptable");
    const H = Object.keys(j);
    for (let et = 0, w = H.length; et < w; et += 1) {
      const P = H[et];
      g.maxTotalMergeKeys !== -1 && ++g.totalMergeKeys > g.maxTotalMergeKeys && B(g, "merge keys exceeded maxTotalMergeKeys (" + g.maxTotalMergeKeys + ")"), s.call(M, P) || (N(M, P, j[P]), V[P] = !0);
    }
  }
  p(gt, "mergeMappings");
  function wt(g, M, j, V, H, et, w, P, J) {
    if (Array.isArray(H)) {
      H = Array.prototype.slice.call(H);
      for (let X = 0, Z = H.length; X < Z; X += 1)
        Array.isArray(H[X]) && B(g, "nested arrays are not supported inside keys"), typeof H == "object" && C(H[X]) === "[object Object]" && (H[X] = "[object Object]");
    }
    if (typeof H == "object" && C(H) === "[object Object]" && (H = "[object Object]"), H = String(H), M === null && (M = {}), V === "tag:yaml.org,2002:merge")
      if (Array.isArray(et))
        for (let X = 0, Z = et.length; X < Z; X += 1)
          gt(g, M, et[X], j);
      else
        gt(g, M, et, j);
    else
      !g.json && !s.call(j, H) && s.call(M, H) && (g.line = w || g.line, g.lineStart = P || g.lineStart, g.position = J || g.position, B(g, "duplicated mapping key")), N(M, H, et), delete j[H];
    return M;
  }
  p(wt, "storeMappingPair");
  function Et(g) {
    const M = g.input.charCodeAt(g.position);
    M === 10 ? g.position++ : M === 13 ? (g.position++, g.input.charCodeAt(g.position) === 10 && g.position++) : B(g, "a line break is expected"), g.line += 1, g.lineStart = g.position, g.firstTabInLine = -1;
  }
  p(Et, "readLineBreak");
  function Bt(g, M, j) {
    let V = 0, H = g.input.charCodeAt(g.position);
    for (; H !== 0; ) {
      for (; T(H); )
        H === 9 && g.firstTabInLine === -1 && (g.firstTabInLine = g.position), H = g.input.charCodeAt(++g.position);
      if (M && H === 35)
        do
          H = g.input.charCodeAt(++g.position);
        while (H !== 10 && H !== 13 && H !== 0);
      if (k(H))
        for (Et(g), H = g.input.charCodeAt(g.position), V++, g.lineIndent = 0; H === 32; )
          g.lineIndent++, H = g.input.charCodeAt(++g.position);
      else
        break;
    }
    return j !== -1 && V !== 0 && g.lineIndent < j && q(g, "deficient indentation"), V;
  }
  p(Bt, "skipSeparationSpace");
  function Nt(g) {
    let M = g.position, j = g.input.charCodeAt(M);
    return !!((j === 45 || j === 46) && j === g.input.charCodeAt(M + 1) && j === g.input.charCodeAt(M + 2) && (M += 3, j = g.input.charCodeAt(M), j === 0 || _(j)));
  }
  p(Nt, "testDocumentSeparator");
  function zt(g, M) {
    M === 1 ? g.result += " " : M > 1 && (g.result += e.repeat(`
`, M - 1));
  }
  p(zt, "writeFoldedLines");
  function ae(g, M, j) {
    let V, H, et, w, P, J;
    const X = g.kind, Z = g.result;
    let tt = g.input.charCodeAt(g.position);
    if (_(tt) || v(tt) || tt === 35 || tt === 38 || tt === 42 || tt === 33 || tt === 124 || tt === 62 || tt === 39 || tt === 34 || tt === 37 || tt === 64 || tt === 96)
      return !1;
    if (tt === 63 || tt === 45) {
      const K = g.input.charCodeAt(g.position + 1);
      if (_(K) || j && v(K))
        return !1;
    }
    for (g.kind = "scalar", g.result = "", V = H = g.position, et = !1; tt !== 0; ) {
      if (tt === 58) {
        const K = g.input.charCodeAt(g.position + 1);
        if (_(K) || j && v(K))
          break;
      } else if (tt === 35) {
        const K = g.input.charCodeAt(g.position - 1);
        if (_(K))
          break;
      } else {
        if (g.position === g.lineStart && Nt(g) || j && v(tt))
          break;
        if (k(tt))
          if (w = g.line, P = g.lineStart, J = g.lineIndent, Bt(g, !1, -1), g.lineIndent >= M) {
            et = !0, tt = g.input.charCodeAt(g.position);
            continue;
          } else {
            g.position = H, g.line = w, g.lineStart = P, g.lineIndent = J;
            break;
          }
      }
      et && (Lt(g, V, H, !1), zt(g, g.line - w), V = H = g.position, et = !1), T(tt) || (H = g.position + 1), tt = g.input.charCodeAt(++g.position);
    }
    return Lt(g, V, H, !1), g.result ? !0 : (g.kind = X, g.result = Z, !1);
  }
  p(ae, "readPlainScalar");
  function we(g, M) {
    let j, V, H = g.input.charCodeAt(g.position);
    if (H !== 39)
      return !1;
    for (g.kind = "scalar", g.result = "", g.position++, j = V = g.position; (H = g.input.charCodeAt(g.position)) !== 0; )
      if (H === 39)
        if (Lt(g, j, g.position, !0), H = g.input.charCodeAt(++g.position), H === 39)
          j = g.position, g.position++, V = g.position;
        else
          return !0;
      else k(H) ? (Lt(g, j, V, !0), zt(g, Bt(g, !1, M)), j = V = g.position) : g.position === g.lineStart && Nt(g) ? B(g, "unexpected end of the document within a single quoted scalar") : (g.position++, T(H) || (V = g.position));
    B(g, "unexpected end of the stream within a single quoted scalar");
  }
  p(we, "readSingleQuotedScalar");
  function Dt(g, M) {
    let j, V, H, et = g.input.charCodeAt(g.position);
    if (et !== 34)
      return !1;
    for (g.kind = "scalar", g.result = "", g.position++, j = V = g.position; (et = g.input.charCodeAt(g.position)) !== 0; ) {
      if (et === 34)
        return Lt(g, j, g.position, !0), g.position++, !0;
      if (et === 92) {
        if (Lt(g, j, g.position, !0), et = g.input.charCodeAt(++g.position), k(et))
          Bt(g, !1, M);
        else if (et < 256 && st[et])
          g.result += U[et], g.position++;
        else if ((H = A(et)) > 0) {
          let w = H, P = 0;
          for (; w > 0; w--)
            et = g.input.charCodeAt(++g.position), (H = L(et)) >= 0 ? P = (P << 4) + H : B(g, "expected hexadecimal character");
          g.result += Y(P), g.position++;
        } else
          B(g, "unknown escape sequence");
        j = V = g.position;
      } else k(et) ? (Lt(g, j, V, !0), zt(g, Bt(g, !1, M)), j = V = g.position) : g.position === g.lineStart && Nt(g) ? B(g, "unexpected end of the document within a double quoted scalar") : (g.position++, T(et) || (V = g.position));
    }
    B(g, "unexpected end of the stream within a double quoted scalar");
  }
  p(Dt, "readDoubleQuotedScalar");
  function fr(g, M) {
    let j = !0, V, H, et;
    const w = g.tag;
    let P;
    const J = g.anchor;
    let X, Z, tt, K;
    const ht = /* @__PURE__ */ Object.create(null);
    let lt, yt, bt, Mt = g.input.charCodeAt(g.position);
    if (Mt === 91)
      X = 93, K = !1, P = [];
    else if (Mt === 123)
      X = 125, K = !0, P = {};
    else
      return !1;
    for (g.anchor !== null && I(g, g.anchor, P), Mt = g.input.charCodeAt(++g.position); Mt !== 0; ) {
      if (Bt(g, !0, M), Mt = g.input.charCodeAt(g.position), Mt === X)
        return g.position++, g.tag = w, g.anchor = J, g.kind = K ? "mapping" : "sequence", g.result = P, !0;
      if (j ? Mt === 44 && B(g, "expected the node content, but found ','") : B(g, "missed comma between flow collection entries"), yt = lt = bt = null, Z = tt = !1, Mt === 63) {
        const Ut = g.input.charCodeAt(g.position + 1);
        _(Ut) && (Z = tt = !0, g.position++, Bt(g, !0, M));
      }
      V = g.line, H = g.lineStart, et = g.position, xe(g, M, o, !1, !0), yt = g.tag, lt = g.result, Bt(g, !0, M), Mt = g.input.charCodeAt(g.position), (tt || g.line === V) && Mt === 58 && (Z = !0, Mt = g.input.charCodeAt(++g.position), Bt(g, !0, M), xe(g, M, o, !1, !0), bt = g.result), K ? wt(g, P, ht, yt, lt, bt, V, H, et) : Z ? P.push(wt(g, null, ht, yt, lt, bt, V, H, et)) : P.push(lt), Bt(g, !0, M), Mt = g.input.charCodeAt(g.position), Mt === 44 ? (j = !0, Mt = g.input.charCodeAt(++g.position)) : j = !1;
    }
    B(g, "unexpected end of the stream within a flow collection");
  }
  p(fr, "readFlowCollection");
  function Ht(g, M) {
    let j, V = c, H = !1, et = !1, w = M, P = 0, J = !1, X, Z = g.input.charCodeAt(g.position);
    if (Z === 124)
      j = !1;
    else if (Z === 62)
      j = !0;
    else
      return !1;
    for (g.kind = "scalar", g.result = ""; Z !== 0; )
      if (Z = g.input.charCodeAt(++g.position), Z === 43 || Z === 45)
        c === V ? V = Z === 43 ? u : h : B(g, "repeat of a chomping mode identifier");
      else if ((X = F(Z)) >= 0)
        X === 0 ? B(g, "bad explicit indentation width of a block scalar; it cannot be less than one") : et ? B(g, "repeat of an indentation width identifier") : (w = M + X - 1, et = !0);
      else
        break;
    if (T(Z)) {
      do
        Z = g.input.charCodeAt(++g.position);
      while (T(Z));
      if (Z === 35)
        do
          Z = g.input.charCodeAt(++g.position);
        while (!k(Z) && Z !== 0);
    }
    for (; Z !== 0; ) {
      for (Et(g), g.lineIndent = 0, Z = g.input.charCodeAt(g.position); (!et || g.lineIndent < w) && Z === 32; )
        g.lineIndent++, Z = g.input.charCodeAt(++g.position);
      if (!et && g.lineIndent > w && (w = g.lineIndent), k(Z)) {
        P++;
        continue;
      }
      if (!et && w === 0 && B(g, "missing indentation for block scalar"), g.lineIndent < w) {
        V === u ? g.result += e.repeat(`
`, H ? 1 + P : P) : V === c && H && (g.result += `
`);
        break;
      }
      j ? T(Z) ? (J = !0, g.result += e.repeat(`
`, H ? 1 + P : P)) : J ? (J = !1, g.result += e.repeat(`
`, P + 1)) : P === 0 ? H && (g.result += " ") : g.result += e.repeat(`
`, P) : g.result += e.repeat(`
`, H ? 1 + P : P), H = !0, et = !0, P = 0;
      const tt = g.position;
      for (; !k(Z) && Z !== 0; )
        Z = g.input.charCodeAt(++g.position);
      Lt(g, tt, g.position, !1);
    }
    return !0;
  }
  p(Ht, "readBlockScalar");
  function Te(g, M) {
    const j = g.tag, V = g.anchor, H = [];
    let et = !1;
    if (g.firstTabInLine !== -1) return !1;
    g.anchor !== null && I(g, g.anchor, H);
    let w = g.input.charCodeAt(g.position);
    for (; w !== 0 && (g.firstTabInLine !== -1 && (g.position = g.firstTabInLine, B(g, "tab characters must not be used in indentation")), w === 45); ) {
      const P = g.input.charCodeAt(g.position + 1);
      if (!_(P))
        break;
      if (et = !0, g.position++, Bt(g, !0, -1) && g.lineIndent <= M) {
        H.push(null), w = g.input.charCodeAt(g.position);
        continue;
      }
      const J = g.line;
      if (xe(g, M, n, !1, !0), H.push(g.result), Bt(g, !0, -1), w = g.input.charCodeAt(g.position), (g.line === J || g.lineIndent > M) && w !== 0)
        B(g, "bad indentation of a sequence entry");
      else if (g.lineIndent < M)
        break;
    }
    return et ? (g.tag = j, g.anchor = V, g.kind = "sequence", g.result = H, !0) : !1;
  }
  p(Te, "readBlockSequence");
  function ne(g, M, j) {
    let V, H, et, w;
    const P = g.tag, J = g.anchor, X = {}, Z = /* @__PURE__ */ Object.create(null);
    let tt = null, K = null, ht = null, lt = !1, yt = !1;
    if (g.firstTabInLine !== -1) return !1;
    g.anchor !== null && I(g, g.anchor, X);
    let bt = g.input.charCodeAt(g.position);
    for (; bt !== 0; ) {
      !lt && g.firstTabInLine !== -1 && (g.position = g.firstTabInLine, B(g, "tab characters must not be used in indentation"));
      const Mt = g.input.charCodeAt(g.position + 1), Ut = g.line;
      if ((bt === 63 || bt === 58) && _(Mt))
        bt === 63 ? (lt && (wt(g, X, Z, tt, K, null, H, et, w), tt = K = ht = null), yt = !0, lt = !0, V = !0) : lt ? (lt = !1, V = !0) : B(g, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"), g.position += 1, bt = Mt;
      else {
        if (H = g.line, et = g.lineStart, w = g.position, !xe(g, j, a, !1, !0))
          break;
        if (g.line === Ut) {
          for (bt = g.input.charCodeAt(g.position); T(bt); )
            bt = g.input.charCodeAt(++g.position);
          if (bt === 58)
            bt = g.input.charCodeAt(++g.position), _(bt) || B(g, "a whitespace character is expected after the key-value separator within a block mapping"), lt && (wt(g, X, Z, tt, K, null, H, et, w), tt = K = ht = null), yt = !0, lt = !1, V = !1, tt = g.tag, K = g.result;
          else if (yt)
            B(g, "can not read an implicit mapping pair; a colon is missed");
          else
            return g.tag = P, g.anchor = J, !0;
        } else if (yt)
          B(g, "can not read a block mapping entry; a multiline key may not be an implicit key");
        else
          return g.tag = P, g.anchor = J, !0;
      }
      if ((g.line === Ut || g.lineIndent > M) && (lt && (H = g.line, et = g.lineStart, w = g.position), xe(g, M, l, !0, V) && (lt ? K = g.result : ht = g.result), lt || (wt(g, X, Z, tt, K, ht, H, et, w), tt = K = ht = null), Bt(g, !0, -1), bt = g.input.charCodeAt(g.position)), (g.line === Ut || g.lineIndent > M) && bt !== 0)
        B(g, "bad indentation of a mapping entry");
      else if (g.lineIndent < M)
        break;
    }
    return lt && wt(g, X, Z, tt, K, null, H, et, w), yt && (g.tag = P, g.anchor = J, g.kind = "mapping", g.result = X), yt;
  }
  p(ne, "readBlockMapping");
  function ze(g) {
    let M = !1, j = !1, V, H, et = g.input.charCodeAt(g.position);
    if (et !== 33) return !1;
    g.tag !== null && B(g, "duplication of a tag property"), et = g.input.charCodeAt(++g.position), et === 60 ? (M = !0, et = g.input.charCodeAt(++g.position)) : et === 33 ? (j = !0, V = "!!", et = g.input.charCodeAt(++g.position)) : V = "!";
    let w = g.position;
    if (M) {
      do
        et = g.input.charCodeAt(++g.position);
      while (et !== 0 && et !== 62);
      g.position < g.length ? (H = g.input.slice(w, g.position), et = g.input.charCodeAt(++g.position)) : B(g, "unexpected end of the stream within a verbatim tag");
    } else {
      for (; et !== 0 && !_(et); )
        et === 33 && (j ? B(g, "tag suffix cannot contain exclamation marks") : (V = g.input.slice(w - 1, g.position + 1), y.test(V) || B(g, "named tag handle cannot contain such characters"), j = !0, w = g.position + 1)), et = g.input.charCodeAt(++g.position);
      H = g.input.slice(w, g.position), m.test(H) && B(g, "tag suffix cannot contain flow indicator characters");
    }
    H && !x.test(H) && B(g, "tag name cannot contain such characters: " + H);
    try {
      H = decodeURIComponent(H);
    } catch {
      B(g, "tag name is malformed: " + H);
    }
    return M ? g.tag = H : s.call(g.tagMap, V) ? g.tag = g.tagMap[V] + H : V === "!" ? g.tag = "!" + H : V === "!!" ? g.tag = "tag:yaml.org,2002:" + H : B(g, 'undeclared tag handle "' + V + '"'), !0;
  }
  p(ze, "readTagProperty");
  function pr(g) {
    let M = g.input.charCodeAt(g.position);
    if (M !== 38) return !1;
    g.anchor !== null && B(g, "duplication of an anchor property"), M = g.input.charCodeAt(++g.position);
    const j = g.position;
    for (; M !== 0 && !_(M) && !v(M); )
      M = g.input.charCodeAt(++g.position);
    return g.position === j && B(g, "name of an anchor node must contain at least one character"), g.anchor = g.input.slice(j, g.position), !0;
  }
  p(pr, "readAnchorProperty");
  function ye(g) {
    let M = g.input.charCodeAt(g.position);
    if (M !== 42) return !1;
    M = g.input.charCodeAt(++g.position);
    const j = g.position;
    for (; M !== 0 && !_(M) && !v(M); )
      M = g.input.charCodeAt(++g.position);
    g.position === j && B(g, "name of an alias node must contain at least one character");
    const V = g.input.slice(j, g.position);
    return s.call(g.anchorMap, V) || B(g, 'unidentified alias "' + V + '"'), g.result = g.anchorMap[V], Bt(g, !0, -1), !0;
  }
  p(ye, "readAlias");
  function Fr(g, M, j, V) {
    const H = St(g);
    return it(g), Tt(g, M), g.tag = null, g.anchor = null, g.kind = null, g.result = null, ne(g, j, V) && g.kind === "mapping" ? (Q(g), !0) : (mt(g), Tt(g, H), !1);
  }
  p(Fr, "tryReadBlockMappingFromProperty");
  function xe(g, M, j, V, H) {
    let et, w, P = 1, J = !1, X = !1, Z = null, tt, K, ht;
    g.depth >= g.maxDepth && B(g, "nesting exceeded maxDepth (" + g.maxDepth + ")"), g.depth += 1, g.listener !== null && g.listener("open", g), g.tag = null, g.anchor = null, g.kind = null, g.result = null;
    const lt = et = w = l === j || n === j;
    if (V && Bt(g, !0, -1) && (J = !0, g.lineIndent > M ? P = 1 : g.lineIndent === M ? P = 0 : g.lineIndent < M && (P = -1)), P === 1)
      for (; ; ) {
        const yt = g.input.charCodeAt(g.position), bt = St(g);
        if (J && (yt === 33 && g.tag !== null || yt === 38 && g.anchor !== null) || !ze(g) && !pr(g))
          break;
        Z === null && (Z = bt), Bt(g, !0, -1) ? (J = !0, w = lt, g.lineIndent > M ? P = 1 : g.lineIndent === M ? P = 0 : g.lineIndent < M && (P = -1)) : w = !1;
      }
    if (w && (w = J || H), P === 1 || l === j)
      if (o === j || a === j ? K = M : K = M + 1, ht = g.position - g.lineStart, P === 1)
        if (w && (Te(g, ht) || ne(g, ht, K)) || fr(g, K))
          X = !0;
        else {
          const yt = g.input.charCodeAt(g.position);
          Z !== null && lt && !w && yt !== 124 && yt !== 62 && Fr(
            g,
            Z,
            Z.position - Z.lineStart,
            K
          ) || et && Ht(g, K) || we(g, K) || Dt(g, K) ? X = !0 : ye(g) ? (X = !0, (g.tag !== null || g.anchor !== null) && B(g, "alias node should not have any properties")) : ae(g, K, o === j) && (X = !0, g.tag === null && (g.tag = "?")), g.anchor !== null && I(g, g.anchor, g.result);
        }
      else P === 0 && (X = w && Te(g, ht));
    if (g.tag === null)
      g.anchor !== null && I(g, g.anchor, g.result);
    else if (g.tag === "?") {
      g.result !== null && g.kind !== "scalar" && B(g, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + g.kind + '"');
      for (let yt = 0, bt = g.implicitTypes.length; yt < bt; yt += 1)
        if (tt = g.implicitTypes[yt], tt.resolve(g.result)) {
          g.result = tt.construct(g.result), g.tag = tt.tag, g.anchor !== null && I(g, g.anchor, g.result);
          break;
        }
    } else if (g.tag !== "!") {
      if (s.call(g.typeMap[g.kind || "fallback"], g.tag))
        tt = g.typeMap[g.kind || "fallback"][g.tag];
      else {
        tt = null;
        const yt = g.typeMap.multi[g.kind || "fallback"];
        for (let bt = 0, Mt = yt.length; bt < Mt; bt += 1)
          if (g.tag.slice(0, yt[bt].tag.length) === yt[bt].tag) {
            tt = yt[bt];
            break;
          }
      }
      tt || B(g, "unknown tag !<" + g.tag + ">"), g.result !== null && tt.kind !== g.kind && B(g, "unacceptable node kind for !<" + g.tag + '> tag; it should be "' + tt.kind + '", not "' + g.kind + '"'), tt.resolve(g.result, g.tag) ? (g.result = tt.construct(g.result, g.tag), g.anchor !== null && I(g, g.anchor, g.result)) : B(g, "cannot resolve a node with !<" + g.tag + "> explicit tag");
    }
    return g.listener !== null && g.listener("close", g), g.depth -= 1, g.tag !== null || g.anchor !== null || X;
  }
  p(xe, "composeNode");
  function Ar(g) {
    const M = g.position;
    let j = !1, V;
    for (g.version = null, g.checkLineBreaks = g.legacy, g.tagMap = /* @__PURE__ */ Object.create(null), g.anchorMap = /* @__PURE__ */ Object.create(null); (V = g.input.charCodeAt(g.position)) !== 0 && (Bt(g, !0, -1), V = g.input.charCodeAt(g.position), !(g.lineIndent > 0 || V !== 37)); ) {
      j = !0, V = g.input.charCodeAt(++g.position);
      let H = g.position;
      for (; V !== 0 && !_(V); )
        V = g.input.charCodeAt(++g.position);
      const et = g.input.slice(H, g.position), w = [];
      for (et.length < 1 && B(g, "directive name must not be less than one character in length"); V !== 0; ) {
        for (; T(V); )
          V = g.input.charCodeAt(++g.position);
        if (V === 35) {
          do
            V = g.input.charCodeAt(++g.position);
          while (V !== 0 && !k(V));
          break;
        }
        if (k(V)) break;
        for (H = g.position; V !== 0 && !_(V); )
          V = g.input.charCodeAt(++g.position);
        w.push(g.input.slice(H, g.position));
      }
      V !== 0 && Et(g), s.call(ft, et) ? ft[et](g, et, w) : q(g, 'unknown document directive "' + et + '"');
    }
    if (Bt(g, !0, -1), g.lineIndent === 0 && g.input.charCodeAt(g.position) === 45 && g.input.charCodeAt(g.position + 1) === 45 && g.input.charCodeAt(g.position + 2) === 45 ? (g.position += 3, Bt(g, !0, -1)) : j && B(g, "directives end mark is expected"), xe(g, g.lineIndent - 1, l, !1, !0), Bt(g, !0, -1), g.checkLineBreaks && f.test(g.input.slice(M, g.position)) && q(g, "non-ASCII line breaks are interpreted as content"), g.documents.push(g.result), g.position === g.lineStart && Nt(g)) {
      g.input.charCodeAt(g.position) === 46 && (g.position += 3, Bt(g, !0, -1));
      return;
    }
    g.position < g.length - 1 && B(g, "end of the stream or a document separator is expected");
  }
  p(Ar, "readDocument");
  function gr(g, M) {
    g = String(g), M = M || {}, g.length !== 0 && (g.charCodeAt(g.length - 1) !== 10 && g.charCodeAt(g.length - 1) !== 13 && (g += `
`), g.charCodeAt(0) === 65279 && (g = g.slice(1)));
    const j = new O(g, M), V = g.indexOf("\0");
    for (V !== -1 && (j.position = V, B(j, "null byte is not allowed in input")), j.input += "\0"; j.input.charCodeAt(j.position) === 32; )
      j.lineIndent += 1, j.position += 1;
    for (; j.position < j.length - 1; )
      Ar(j);
    return j.documents;
  }
  p(gr, "loadDocuments");
  function Ce(g, M, j) {
    M !== null && typeof M == "object" && typeof j > "u" && (j = M, M = null);
    const V = gr(g, j);
    if (typeof M != "function")
      return V;
    for (let H = 0, et = V.length; H < et; H += 1)
      M(V[H]);
  }
  p(Ce, "loadAll2");
  function Fe(g, M) {
    const j = gr(g, M);
    if (j.length !== 0) {
      if (j.length === 1)
        return j[0];
      throw new t("expected a single document in the stream, but found more");
    }
  }
  return p(Fe, "load2"), lo.loadAll = Ce, lo.load = Fe, lo;
}
p($y, "requireLoader");
var Sn = {}, Wd;
function Oy() {
  if (Wd) return Sn;
  Wd = 1;
  const e = Wi(), t = Hi(), r = xa(), i = Object.prototype.toString, s = Object.prototype.hasOwnProperty, o = 65279, a = 9, n = 10, l = 13, c = 32, h = 33, u = 34, d = 35, f = 37, m = 38, y = 39, x = 42, C = 44, k = 45, T = 58, _ = 61, v = 62, L = 63, A = 64, F = 91, G = 93, Y = 96, N = 123, st = 124, U = 125, O = {};
  O[0] = "\\0", O[7] = "\\a", O[8] = "\\b", O[9] = "\\t", O[10] = "\\n", O[11] = "\\v", O[12] = "\\f", O[13] = "\\r", O[27] = "\\e", O[34] = '\\"', O[92] = "\\\\", O[133] = "\\N", O[160] = "\\_", O[8232] = "\\L", O[8233] = "\\P";
  const D = [
    "y",
    "Y",
    "yes",
    "Yes",
    "YES",
    "on",
    "On",
    "ON",
    "n",
    "N",
    "no",
    "No",
    "NO",
    "off",
    "Off",
    "OFF"
  ], B = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;
  function q(w, P) {
    if (P === null) return {};
    const J = {}, X = Object.keys(P);
    for (let Z = 0, tt = X.length; Z < tt; Z += 1) {
      let K = X[Z], ht = String(P[K]);
      K.slice(0, 2) === "!!" && (K = "tag:yaml.org,2002:" + K.slice(2));
      const lt = w.compiledTypeMap.fallback[K];
      lt && s.call(lt.styleAliases, ht) && (ht = lt.styleAliases[ht]), J[K] = ht;
    }
    return J;
  }
  p(q, "compileStyleMap");
  function I(w) {
    let P, J;
    const X = w.toString(16).toUpperCase();
    if (w <= 255)
      P = "x", J = 2;
    else if (w <= 65535)
      P = "u", J = 4;
    else if (w <= 4294967295)
      P = "U", J = 8;
    else
      throw new t("code point within a string may not be greater than 0xFFFFFFFF");
    return "\\" + P + e.repeat("0", J - X.length) + X;
  }
  p(I, "encodeHex");
  const it = 1, Q = 2;
  function mt(w) {
    this.schema = w.schema || r, this.indent = Math.max(1, w.indent || 2), this.noArrayIndent = w.noArrayIndent || !1, this.skipInvalid = w.skipInvalid || !1, this.flowLevel = e.isNothing(w.flowLevel) ? -1 : w.flowLevel, this.styleMap = q(this.schema, w.styles || null), this.sortKeys = w.sortKeys || !1, this.lineWidth = w.lineWidth || 80, this.noRefs = w.noRefs || !1, this.noCompatMode = w.noCompatMode || !1, this.condenseFlow = w.condenseFlow || !1, this.quotingType = w.quotingType === '"' ? Q : it, this.forceQuotes = w.forceQuotes || !1, this.replacer = typeof w.replacer == "function" ? w.replacer : null, this.implicitTypes = this.schema.compiledImplicit, this.explicitTypes = this.schema.compiledExplicit, this.tag = null, this.result = "", this.duplicates = [], this.usedDuplicates = null;
  }
  p(mt, "State");
  function St(w, P) {
    const J = e.repeat(" ", P);
    let X = 0, Z = "";
    const tt = w.length;
    for (; X < tt; ) {
      let K;
      const ht = w.indexOf(`
`, X);
      ht === -1 ? (K = w.slice(X), X = tt) : (K = w.slice(X, ht + 1), X = ht + 1), K.length && K !== `
` && (Z += J), Z += K;
    }
    return Z;
  }
  p(St, "indentString");
  function Tt(w, P) {
    return `
` + e.repeat(" ", w.indent * P);
  }
  p(Tt, "generateNextLine");
  function ft(w, P) {
    for (let J = 0, X = w.implicitTypes.length; J < X; J += 1)
      if (w.implicitTypes[J].resolve(P))
        return !0;
    return !1;
  }
  p(ft, "testImplicitResolving");
  function Lt(w) {
    return w === c || w === a;
  }
  p(Lt, "isWhitespace");
  function gt(w) {
    return w >= 32 && w <= 126 || w >= 161 && w <= 55295 && w !== 8232 && w !== 8233 || w >= 57344 && w <= 65533 && w !== o || w >= 65536 && w <= 1114111;
  }
  p(gt, "isPrintable");
  function wt(w) {
    return gt(w) && w !== o && // - b-char
    w !== l && w !== n;
  }
  p(wt, "isNsCharOrWhitespace");
  function Et(w, P, J) {
    const X = wt(w), Z = X && !Lt(w);
    return (
      // ns-plain-safe
      (J ? X : X && // - c-flow-indicator
      w !== C && w !== F && w !== G && w !== N && w !== U) && // ns-plain-char
      w !== d && // false on '#'
      !(P === T && !Z) || // false on ': '
      wt(P) && !Lt(P) && w === d || // change to true on '[^ ]#'
      P === T && Z
    );
  }
  p(Et, "isPlainSafe");
  function Bt(w) {
    return gt(w) && w !== o && !Lt(w) && // - s-white
    // - (c-indicator ::=
    // “-” | “?” | “:” | “,” | “[” | “]” | “{” | “}”
    w !== k && w !== L && w !== T && w !== C && w !== F && w !== G && w !== N && w !== U && // | “#” | “&” | “*” | “!” | “|” | “=” | “>” | “'” | “"”
    w !== d && w !== m && w !== x && w !== h && w !== st && w !== _ && w !== v && w !== y && w !== u && // | “%” | “@” | “`”)
    w !== f && w !== A && w !== Y;
  }
  p(Bt, "isPlainSafeFirst");
  function Nt(w) {
    return !Lt(w) && w !== T;
  }
  p(Nt, "isPlainSafeLast");
  function zt(w, P) {
    const J = w.charCodeAt(P);
    let X;
    return J >= 55296 && J <= 56319 && P + 1 < w.length && (X = w.charCodeAt(P + 1), X >= 56320 && X <= 57343) ? (J - 55296) * 1024 + X - 56320 + 65536 : J;
  }
  p(zt, "codePointAt");
  function ae(w) {
    return /^\n* /.test(w);
  }
  p(ae, "needIndentIndicator");
  const we = 1, Dt = 2, fr = 3, Ht = 4, Te = 5;
  function ne(w, P, J, X, Z, tt, K, ht) {
    let lt, yt = 0, bt = null, Mt = !1, Ut = !1;
    const Ui = X !== -1;
    let Ze = -1, Ke = Bt(zt(w, 0)) && Nt(zt(w, w.length - 1));
    if (P || K)
      for (lt = 0; lt < w.length; yt >= 65536 ? lt += 2 : lt++) {
        if (yt = zt(w, lt), !gt(yt))
          return Te;
        Ke = Ke && Et(yt, bt, ht), bt = yt;
      }
    else {
      for (lt = 0; lt < w.length; yt >= 65536 ? lt += 2 : lt++) {
        if (yt = zt(w, lt), yt === n)
          Mt = !0, Ui && (Ut = Ut || // Foldable line = too long, and not more-indented.
          lt - Ze - 1 > X && w[Ze + 1] !== " ", Ze = lt);
        else if (!gt(yt))
          return Te;
        Ke = Ke && Et(yt, bt, ht), bt = yt;
      }
      Ut = Ut || Ui && lt - Ze - 1 > X && w[Ze + 1] !== " ";
    }
    return !Mt && !Ut ? Ke && !K && !Z(w) ? we : tt === Q ? Te : Dt : J > 9 && ae(w) ? Te : K ? tt === Q ? Te : Dt : Ut ? Ht : fr;
  }
  p(ne, "chooseScalarStyle");
  function ze(w, P, J, X, Z) {
    w.dump = (function() {
      if (P.length === 0)
        return w.quotingType === Q ? '""' : "''";
      if (!w.noCompatMode && (D.indexOf(P) !== -1 || B.test(P)))
        return w.quotingType === Q ? '"' + P + '"' : "'" + P + "'";
      const tt = w.indent * Math.max(1, J), K = w.lineWidth === -1 ? -1 : Math.max(Math.min(w.lineWidth, 40), w.lineWidth - tt), ht = X || // No block styles in flow mode.
      w.flowLevel > -1 && J >= w.flowLevel;
      function lt(yt) {
        return ft(w, yt);
      }
      switch (p(lt, "testAmbiguity"), ne(
        P,
        ht,
        w.indent,
        K,
        lt,
        w.quotingType,
        w.forceQuotes && !X,
        Z
      )) {
        case we:
          return P;
        case Dt:
          return "'" + P.replace(/'/g, "''") + "'";
        case fr:
          return "|" + pr(P, w.indent) + ye(St(P, tt));
        case Ht:
          return ">" + pr(P, w.indent) + ye(St(Fr(P, K), tt));
        case Te:
          return '"' + Ar(P) + '"';
        default:
          throw new t("impossible error: invalid scalar style");
      }
    })();
  }
  p(ze, "writeScalar");
  function pr(w, P) {
    const J = ae(w) ? String(P) : "", X = w[w.length - 1] === `
`, tt = X && (w[w.length - 2] === `
` || w === `
`) ? "+" : X ? "" : "-";
    return J + tt + `
`;
  }
  p(pr, "blockHeader");
  function ye(w) {
    return w[w.length - 1] === `
` ? w.slice(0, -1) : w;
  }
  p(ye, "dropEndingNewline");
  function Fr(w, P) {
    const J = /(\n+)([^\n]*)/g;
    let X = (function() {
      let ht = w.indexOf(`
`);
      return ht = ht !== -1 ? ht : w.length, J.lastIndex = ht, xe(w.slice(0, ht), P);
    })(), Z = w[0] === `
` || w[0] === " ", tt, K;
    for (; K = J.exec(w); ) {
      const ht = K[1], lt = K[2];
      tt = lt[0] === " ", X += ht + (!Z && !tt && lt !== "" ? `
` : "") + xe(lt, P), Z = tt;
    }
    return X;
  }
  p(Fr, "foldString");
  function xe(w, P) {
    if (w === "" || w[0] === " ") return w;
    const J = / [^ ]/g;
    let X, Z = 0, tt, K = 0, ht = 0, lt = "";
    for (; X = J.exec(w); )
      ht = X.index, ht - Z > P && (tt = K > Z ? K : ht, lt += `
` + w.slice(Z, tt), Z = tt + 1), K = ht;
    return lt += `
`, w.length - Z > P && K > Z ? lt += w.slice(Z, K) + `
` + w.slice(K + 1) : lt += w.slice(Z), lt.slice(1);
  }
  p(xe, "foldLine");
  function Ar(w) {
    let P = "", J = 0;
    for (let X = 0; X < w.length; J >= 65536 ? X += 2 : X++) {
      J = zt(w, X);
      const Z = O[J];
      !Z && gt(J) ? (P += w[X], J >= 65536 && (P += w[X + 1])) : P += Z || I(J);
    }
    return P;
  }
  p(Ar, "escapeString");
  function gr(w, P, J) {
    let X = "";
    const Z = w.tag;
    for (let tt = 0, K = J.length; tt < K; tt += 1) {
      let ht = J[tt];
      w.replacer && (ht = w.replacer.call(J, String(tt), ht)), (j(w, P, ht, !1, !1) || typeof ht > "u" && j(w, P, null, !1, !1)) && (X !== "" && (X += "," + (w.condenseFlow ? "" : " ")), X += w.dump);
    }
    w.tag = Z, w.dump = "[" + X + "]";
  }
  p(gr, "writeFlowSequence");
  function Ce(w, P, J, X) {
    let Z = "";
    const tt = w.tag;
    for (let K = 0, ht = J.length; K < ht; K += 1) {
      let lt = J[K];
      w.replacer && (lt = w.replacer.call(J, String(K), lt)), (j(w, P + 1, lt, !0, !0, !1, !0) || typeof lt > "u" && j(w, P + 1, null, !0, !0, !1, !0)) && ((!X || Z !== "") && (Z += Tt(w, P)), w.dump && n === w.dump.charCodeAt(0) ? Z += "-" : Z += "- ", Z += w.dump);
    }
    w.tag = tt, w.dump = Z || "[]";
  }
  p(Ce, "writeBlockSequence");
  function Fe(w, P, J) {
    let X = "";
    const Z = w.tag, tt = Object.keys(J);
    for (let K = 0, ht = tt.length; K < ht; K += 1) {
      let lt = "";
      X !== "" && (lt += ", "), w.condenseFlow && (lt += '"');
      const yt = tt[K];
      let bt = J[yt];
      w.replacer && (bt = w.replacer.call(J, yt, bt)), j(w, P, yt, !1, !1) && (w.dump.length > 1024 && (lt += "? "), lt += w.dump + (w.condenseFlow ? '"' : "") + ":" + (w.condenseFlow ? "" : " "), j(w, P, bt, !1, !1) && (lt += w.dump, X += lt));
    }
    w.tag = Z, w.dump = "{" + X + "}";
  }
  p(Fe, "writeFlowMapping");
  function g(w, P, J, X) {
    let Z = "";
    const tt = w.tag, K = Object.keys(J);
    if (w.sortKeys === !0)
      K.sort();
    else if (typeof w.sortKeys == "function")
      K.sort(w.sortKeys);
    else if (w.sortKeys)
      throw new t("sortKeys must be a boolean or a function");
    for (let ht = 0, lt = K.length; ht < lt; ht += 1) {
      let yt = "";
      (!X || Z !== "") && (yt += Tt(w, P));
      const bt = K[ht];
      let Mt = J[bt];
      if (w.replacer && (Mt = w.replacer.call(J, bt, Mt)), !j(w, P + 1, bt, !0, !0, !0))
        continue;
      const Ut = w.tag !== null && w.tag !== "?" || w.dump && w.dump.length > 1024;
      Ut && (w.dump && n === w.dump.charCodeAt(0) ? yt += "?" : yt += "? "), yt += w.dump, Ut && (yt += Tt(w, P)), j(w, P + 1, Mt, !0, Ut) && (w.dump && n === w.dump.charCodeAt(0) ? yt += ":" : yt += ": ", yt += w.dump, Z += yt);
    }
    w.tag = tt, w.dump = Z || "{}";
  }
  p(g, "writeBlockMapping");
  function M(w, P, J) {
    const X = J ? w.explicitTypes : w.implicitTypes;
    for (let Z = 0, tt = X.length; Z < tt; Z += 1) {
      const K = X[Z];
      if ((K.instanceOf || K.predicate) && (!K.instanceOf || typeof P == "object" && P instanceof K.instanceOf) && (!K.predicate || K.predicate(P))) {
        if (J ? K.multi && K.representName ? w.tag = K.representName(P) : w.tag = K.tag : w.tag = "?", K.represent) {
          const ht = w.styleMap[K.tag] || K.defaultStyle;
          let lt;
          if (i.call(K.represent) === "[object Function]")
            lt = K.represent(P, ht);
          else if (s.call(K.represent, ht))
            lt = K.represent[ht](P, ht);
          else
            throw new t("!<" + K.tag + '> tag resolver accepts not "' + ht + '" style');
          w.dump = lt;
        }
        return !0;
      }
    }
    return !1;
  }
  p(M, "detectType");
  function j(w, P, J, X, Z, tt, K) {
    w.tag = null, w.dump = J, M(w, J, !1) || M(w, J, !0);
    const ht = i.call(w.dump), lt = X;
    X && (X = w.flowLevel < 0 || w.flowLevel > P);
    const yt = ht === "[object Object]" || ht === "[object Array]";
    let bt, Mt;
    if (yt && (bt = w.duplicates.indexOf(J), Mt = bt !== -1), (w.tag !== null && w.tag !== "?" || Mt || w.indent !== 2 && P > 0) && (Z = !1), Mt && w.usedDuplicates[bt])
      w.dump = "*ref_" + bt;
    else {
      if (yt && Mt && !w.usedDuplicates[bt] && (w.usedDuplicates[bt] = !0), ht === "[object Object]")
        X && Object.keys(w.dump).length !== 0 ? (g(w, P, w.dump, Z), Mt && (w.dump = "&ref_" + bt + w.dump)) : (Fe(w, P, w.dump), Mt && (w.dump = "&ref_" + bt + " " + w.dump));
      else if (ht === "[object Array]")
        X && w.dump.length !== 0 ? (w.noArrayIndent && !K && P > 0 ? Ce(w, P - 1, w.dump, Z) : Ce(w, P, w.dump, Z), Mt && (w.dump = "&ref_" + bt + w.dump)) : (gr(w, P, w.dump), Mt && (w.dump = "&ref_" + bt + " " + w.dump));
      else if (ht === "[object String]")
        w.tag !== "?" && ze(w, w.dump, P, tt, lt);
      else {
        if (ht === "[object Undefined]")
          return !1;
        if (w.skipInvalid) return !1;
        throw new t("unacceptable kind of an object to dump " + ht);
      }
      if (w.tag !== null && w.tag !== "?") {
        let Ut = encodeURI(
          w.tag[0] === "!" ? w.tag.slice(1) : w.tag
        ).replace(/!/g, "%21");
        w.tag[0] === "!" ? Ut = "!" + Ut : Ut.slice(0, 18) === "tag:yaml.org,2002:" ? Ut = "!!" + Ut.slice(18) : Ut = "!<" + Ut + ">", w.dump = Ut + " " + w.dump;
      }
    }
    return !0;
  }
  p(j, "writeNode");
  function V(w, P) {
    const J = [], X = [];
    H(w, J, X);
    const Z = X.length;
    for (let tt = 0; tt < Z; tt += 1)
      P.duplicates.push(J[X[tt]]);
    P.usedDuplicates = new Array(Z);
  }
  p(V, "getDuplicateReferences");
  function H(w, P, J) {
    if (w !== null && typeof w == "object") {
      const X = P.indexOf(w);
      if (X !== -1)
        J.indexOf(X) === -1 && J.push(X);
      else if (P.push(w), Array.isArray(w))
        for (let Z = 0, tt = w.length; Z < tt; Z += 1)
          H(w[Z], P, J);
      else {
        const Z = Object.keys(w);
        for (let tt = 0, K = Z.length; tt < K; tt += 1)
          H(w[Z[tt]], P, J);
      }
    }
  }
  p(H, "inspectNode");
  function et(w, P) {
    P = P || {};
    const J = new mt(P);
    J.noRefs || V(w, J);
    let X = w;
    return J.replacer && (X = J.replacer.call({ "": X }, "", X)), j(J, 0, X, !0, !0) ? J.dump + `
` : "";
  }
  return p(et, "dump2"), Sn.dump = et, Sn;
}
p(Oy, "requireDumper");
var Hd;
function Dy() {
  if (Hd) return ce;
  Hd = 1;
  const e = $y(), t = Oy();
  function r(i, s) {
    return function() {
      throw new Error("Function yaml." + i + " is removed in js-yaml 4. Use yaml." + s + " instead, which is now safe by default.");
    };
  }
  return p(r, "renamed"), ce.Type = me(), ce.Schema = Sh(), ce.FAILSAFE_SCHEMA = Lh(), ce.JSON_SCHEMA = $h(), ce.CORE_SCHEMA = Oh(), ce.DEFAULT_SCHEMA = xa(), ce.load = e.load, ce.loadAll = e.loadAll, ce.dump = t.dump, ce.YAMLException = Hi(), ce.types = {
    binary: Ph(),
    float: Mh(),
    map: Bh(),
    null: Fh(),
    pairs: Nh(),
    set: qh(),
    timestamp: Dh(),
    bool: Ah(),
    int: Eh(),
    merge: Ih(),
    omap: Rh(),
    seq: vh(),
    str: _h()
  }, ce.safeLoad = r("safeLoad", "load"), ce.safeLoadAll = r("safeLoadAll", "loadAll"), ce.safeDump = r("safeDump", "dump"), ce;
}
p(Dy, "requireJsYaml");
var BF = Dy(), LF = /* @__PURE__ */ Ey(BF), {
  Type: H5,
  Schema: Y5,
  FAILSAFE_SCHEMA: U5,
  JSON_SCHEMA: FF,
  CORE_SCHEMA: j5,
  DEFAULT_SCHEMA: G5,
  load: AF,
  loadAll: X5,
  dump: V5,
  YAMLException: Z5,
  types: K5,
  safeLoad: Q5,
  safeLoadAll: J5,
  safeDump: t3
} = LF, EF = {
  common: Is,
  getConfig: Xt,
  insertCluster: qm,
  insertEdge: Hm,
  insertEdgeLabel: uh,
  insertMarkers: jm,
  insertNode: ch,
  interpolateToCurve: zl,
  labelHelper: xt,
  log: R,
  positionEdgeLabel: o_
}, Ms = {}, Iy = /* @__PURE__ */ p((e) => {
  for (const t of e)
    Ms[t.name] = t;
}, "registerLayoutLoaders"), MF = /* @__PURE__ */ p(() => {
  Iy([
    {
      name: "dagre",
      loader: /* @__PURE__ */ p(async () => await import("./dagre-GXQ25YYZ-CPLKe7k3.js"), "loader")
    },
    {
      name: "swimlane",
      loader: /* @__PURE__ */ p(async () => await import("./swimlanes-42K2YHIH-4IILurED.js"), "loader")
    },
    {
      name: "cose-bilkent",
      loader: /* @__PURE__ */ p(async () => await import("./cose-bilkent-JH36ORCC-COQCeNTS.js"), "loader")
    }
  ]);
}, "registerDefaultLayoutLoaders");
MF();
var e3 = /* @__PURE__ */ p(async (e, t) => {
  if (!(e.layoutAlgorithm in Ms))
    throw new Error(`Unknown layout algorithm: ${e.layoutAlgorithm}`);
  if (e.diagramId)
    for (const h of e.nodes) {
      const u = h.domId || h.id;
      h.domId = `${e.diagramId}-${u}`;
    }
  const r = Ms[e.layoutAlgorithm], i = await r.loader(), { theme: s, themeVariables: o } = e.config, { useGradient: a, gradientStart: n, gradientStop: l } = o, c = t.attr("id");
  if (t.append("defs").append("filter").attr("id", `${c}-drop-shadow`).attr("height", "130%").attr("width", "130%").append("feDropShadow").attr("dx", "4").attr("dy", "4").attr("stdDeviation", 0).attr("flood-opacity", "0.06").attr("flood-color", `${s?.includes("dark") ? "#FFFFFF" : "#000000"}`), t.append("defs").append("filter").attr("id", `${c}-drop-shadow-small`).attr("height", "150%").attr("width", "150%").append("feDropShadow").attr("dx", "2").attr("dy", "2").attr("stdDeviation", 0).attr("flood-opacity", "0.06").attr("flood-color", `${s?.includes("dark") ? "#FFFFFF" : "#000000"}`), a) {
    const h = t.append("linearGradient").attr("id", t.attr("id") + "-gradient").attr("gradientUnits", "objectBoundingBox").attr("x1", "0%").attr("y1", "0%").attr("x2", "100%").attr("y2", "0%");
    h.append("svg:stop").attr("offset", "0%").attr("stop-color", n).attr("stop-opacity", 1), h.append("svg:stop").attr("offset", "100%").attr("stop-color", l).attr("stop-opacity", 1);
  }
  return i.render(e, t, EF, {
    algorithm: r.algorithm
  });
}, "render"), r3 = /* @__PURE__ */ p((e = "", { fallback: t = "dagre" } = {}) => {
  if (e in Ms)
    return e;
  if (t in Ms)
    return R.warn(`Layout algorithm ${e} is not registered. Using ${t} as fallback.`), t;
  throw new Error(`Both layout algorithms ${e} and ${t} are not registered.`);
}, "getRegisteredLayoutAlgorithm"), zh = "comm", Py = "rule", Ry = "decl", $F = "@media", OF = "@import", DF = "@supports", IF = "@namespace", ul = "@keyframes", Ny = "@layer", PF = "@scope", RF = Math.abs, ws = String.fromCharCode;
function qy(e) {
  return e.trim();
}
function dl(e, t, r) {
  return e.replace(t, r);
}
function Ei(e, t) {
  return e.charCodeAt(t) | 0;
}
function Pi(e, t, r) {
  return e.slice(t, r);
}
function rr(e) {
  return e.length;
}
function zy(e) {
  return e.length;
}
function ho(e, t) {
  return t.push(e), e;
}
var Ca = 1, Ri = 1, Wy = 0, Ne = 0, Jt = 0, Yi = "";
function Wh(e, t, r, i, s, o, a, n) {
  return { value: e, root: t, parent: r, type: i, props: s, children: o, line: Ca, column: Ri, length: a, return: "", siblings: n };
}
function NF() {
  return Jt;
}
function qF() {
  return Jt = Ne > 0 ? Ei(Yi, --Ne) : 0, Ri--, Jt === 10 && (Ri = 1, Ca--), Jt;
}
function je() {
  return Jt = Ne < Wy ? Ei(Yi, Ne++) : 0, Ri++, Jt === 10 && (Ri = 1, Ca++), Jt;
}
function Rr() {
  return Ei(Yi, Ne);
}
function wo() {
  return Ne;
}
function ba(e, t) {
  return Pi(Yi, e, t);
}
function $s(e) {
  switch (e) {
    // \0 \t \n \r \s whitespace token
    case 0:
    case 9:
    case 10:
    case 13:
    case 32:
      return 5;
    // ! + , / > @ ~ isolate token
    case 33:
    case 43:
    case 44:
    case 47:
    case 62:
    case 64:
    case 126:
    // ; { } breakpoint token
    case 59:
    case 123:
    case 125:
      return 4;
    // : accompanied token
    case 58:
      return 3;
    // " ' ( [ opening delimit token
    case 34:
    case 39:
    case 40:
    case 91:
      return 2;
    // ) ] closing delimit token
    case 41:
    case 93:
      return 1;
  }
  return 0;
}
function zF(e) {
  return Ca = Ri = 1, Wy = rr(Yi = e), Ne = 0, [];
}
function WF(e) {
  return Yi = "", e;
}
function _n(e) {
  return qy(ba(Ne - 1, fl(e === 91 ? e + 2 : e === 40 ? e + 1 : e)));
}
function HF(e) {
  for (; (Jt = Rr()) && Jt < 33; )
    je();
  return $s(e) > 2 || $s(Jt) > 3 ? "" : " ";
}
function YF(e, t) {
  for (; --t && je() && !(Jt < 48 || Jt > 102 || Jt > 57 && Jt < 65 || Jt > 70 && Jt < 97); )
    ;
  return ba(e, wo() + (t < 6 && Rr() == 32 && je() == 32));
}
function fl(e) {
  for (; je(); )
    switch (Jt) {
      // ] ) " '
      case e:
        return Ne;
      // " '
      case 34:
      case 39:
        e !== 34 && e !== 39 && fl(Jt);
        break;
      // (
      case 40:
        e === 41 && fl(e);
        break;
      // \
      case 92:
        je();
        break;
    }
  return Ne;
}
function UF(e, t) {
  for (; je() && e + Jt !== 57; )
    if (e + Jt === 84 && Rr() === 47)
      break;
  return "/*" + ba(t, Ne - 1) + "*" + ws(e === 47 ? e : je());
}
function jF(e) {
  for (; !$s(Rr()); )
    je();
  return ba(e, Ne);
}
function GF(e) {
  return WF(To("", null, null, null, [""], e = zF(e), 0, [0], e));
}
function To(e, t, r, i, s, o, a, n, l) {
  for (var c = 0, h = 0, u = a, d = 0, f = 0, m = 0, y = 1, x = 1, C = 1, k = 0, T = 0, _ = "", v = s, L = o, A = i, F = _; x; )
    switch (m = T, T = je()) {
      // (
      case 40:
        m != 108 && Ei(F, u - 1) == 58 ? (k++, F += "(") : F += _n(T);
        break;
      // )
      case 41:
        k--, F += ")";
        break;
      // " ' [
      case 34:
      case 39:
      case 91:
        F += _n(T);
        break;
      // \t \n \r \s
      case 9:
      case 10:
      case 13:
      case 32:
        if (k > 0) {
          F += ws(T);
          break;
        }
        F += HF(m);
        break;
      // \
      case 92:
        F += YF(wo() - 1, 7);
        continue;
      // /
      case 47:
        switch (Rr()) {
          case 42:
          case 47:
            ho(XF(UF(je(), wo()), t, r, l), l), ($s(m || 1) == 5 || $s(Rr() || 1) == 5) && rr(F) && Pi(F, -1, void 0) !== " " && (F += " ");
            break;
          default:
            F += "/";
        }
        break;
      // {
      case 123 * y:
        n[c++] = rr(F) * C;
      // } ; \0
      case 125 * y:
      case 59:
      case 0:
        if (k > 0 && T) {
          F += ws(T);
          break;
        }
        switch (T) {
          // \0 }
          case 0:
          case 125:
            x = 0;
          // ;
          case 59 + h:
            C == -1 && (F = dl(F, /\f/g, "")), f > 0 && (rr(F) - u || y === 0) && ho(f > 32 ? Ud(F + ";", i, r, u - 1, l) : Ud(dl(F, " ", "") + ";", i, r, u - 2, l), l);
            break;
          // @ ;
          case 59:
            F += ";";
          // { rule/at-rule
          default:
            if (ho(A = Yd(F, t, r, c, h, s, n, _, v = [], L = [], u, o), o), T === 123)
              if (h === 0)
                To(F, t, A, A, v, o, u, n, L);
              else {
                switch (d) {
                  // c(ontainer)
                  case 99:
                    if (Ei(F, 3) === 110) break;
                  // l(ayer)
                  case 108:
                    if (Ei(F, 2) === 97) break;
                  default:
                    h = 0;
                  // d(ocument) m(edia) s(upports)
                  case 100:
                  case 109:
                  case 115:
                }
                h ? To(e, A, A, i && ho(Yd(e, A, A, 0, 0, s, n, _, s, v = [], u, L), L), s, L, u, n, i ? v : L) : To(F, A, A, A, [""], L, 0, n, L);
              }
        }
        c = h = f = 0, y = C = 1, _ = F = "", u = a;
        break;
      // :
      case 58:
        u = 1 + rr(F), f = m;
      default:
        if (y < 1) {
          if (T == 123)
            --y;
          else if (T == 125 && y++ == 0 && qF() == 125)
            continue;
        }
        switch (F += ws(T), T * y) {
          // &
          case 38:
            C = h > 0 ? 1 : (F += "\f", -1);
            break;
          // ,
          case 44:
            if (k > 0) break;
            n[c++] = (rr(F) - 1) * C, C = 1;
            break;
          // @
          case 64:
            Rr() === 45 && (F += _n(je())), d = Rr(), h = u = rr(_ = F += jF(wo())), T++;
            break;
          // -
          case 45:
            m === 45 && rr(F) == 2 && (y = 0);
        }
    }
  return o;
}
function Yd(e, t, r, i, s, o, a, n, l, c, h, u) {
  for (var d = s - 1, f = s === 0 ? o : [""], m = zy(f), y = 0, x = 0, C = 0; y < i; ++y)
    for (var k = 0, T = Pi(e, d + 1, d = RF(x = a[y])), _ = e; k < m; ++k)
      (_ = qy(x > 0 ? f[k] + " " + T : dl(T, /&\f/g, f[k]))) && (l[C++] = _);
  return Wh(e, t, r, s === 0 ? Py : n, l, c, h, u);
}
function XF(e, t, r, i) {
  return Wh(e, t, r, zh, ws(NF()), Pi(e, 2, -2), 0, i);
}
function Ud(e, t, r, i, s) {
  return Wh(e, t, r, Ry, Pi(e, 0, i), Pi(e, i + 1, -1), i, s);
}
function pl(e, t) {
  for (var r = "", i = 0; i < e.length; i++)
    r += t(e[i], i, e, t) || "";
  return r;
}
function VF(e, t, r, i) {
  switch (e.type) {
    case Ny:
      if (e.children.length) break;
    case OF:
    case IF:
    case Ry:
      return e.return = e.return || e.value;
    case zh:
      return "";
    case ul:
      return e.return = e.value + "{" + pl(e.children, i) + "}";
    case Py:
      if (!rr(e.value = e.props.join(","))) return "";
  }
  return rr(r = pl(e.children, i)) ? e.return = e.value + "{" + r + "}" : "";
}
function ZF(e) {
  var t = zy(e);
  return function(r, i, s, o) {
    for (var a = "", n = 0; n < t; n++)
      a += e[n](r, i, s, o) || "";
    return a;
  };
}
var Hy = "c4", KF = /* @__PURE__ */ p((e) => /^\s*C4Context|C4Container|C4Component|C4Dynamic|C4Deployment/.test(e), "detector"), QF = /* @__PURE__ */ p(async () => {
  const { diagram: e } = await import("./c4Diagram-7LVT6UL2-BuFIPiRB.js");
  return { id: Hy, diagram: e };
}, "loader"), JF = {
  id: Hy,
  detector: KF,
  loader: QF
}, tA = JF, Yy = "flowchart", eA = /* @__PURE__ */ p((e, t) => t?.flowchart?.defaultRenderer === "dagre-wrapper" || t?.flowchart?.defaultRenderer === "elk" ? !1 : /^\s*graph/.test(e), "detector"), rA = /* @__PURE__ */ p(async () => {
  const { diagram: e } = await import("./flowDiagram-HODETNUW-BfgdGhCg.js").then((t) => t.f);
  return { id: Yy, diagram: e };
}, "loader"), iA = {
  id: Yy,
  detector: eA,
  loader: rA
}, sA = iA, Uy = "flowchart-v2", oA = /* @__PURE__ */ p((e, t) => t?.flowchart?.defaultRenderer === "dagre-d3" ? !1 : (t?.flowchart?.defaultRenderer === "elk" && (t.layout = "elk"), /^\s*graph/.test(e) && t?.flowchart?.defaultRenderer === "dagre-wrapper" ? !0 : /^\s*flowchart/.test(e)), "detector"), aA = /* @__PURE__ */ p(async () => {
  const { diagram: e } = await import("./flowDiagram-HODETNUW-BfgdGhCg.js").then((t) => t.f);
  return { id: Uy, diagram: e };
}, "loader"), nA = {
  id: Uy,
  detector: oA,
  loader: aA
}, lA = nA, jy = "swimlane", hA = /* @__PURE__ */ p((e) => /^\s*swimlane-beta\b/.test(e), "detector"), cA = /* @__PURE__ */ p(async () => {
  const { diagram: e } = await import("./swimlanesDiagram-VR7AAH4N-CvOY2xOQ.js");
  return { id: jy, diagram: e };
}, "loader"), uA = {
  id: jy,
  detector: hA,
  loader: cA
}, dA = uA, Gy = "er", fA = /* @__PURE__ */ p((e) => /^\s*erDiagram/.test(e), "detector"), pA = /* @__PURE__ */ p(async () => {
  const { diagram: e } = await import("./erDiagram-RLTQ6QDP-DVp1NRWo.js");
  return { id: Gy, diagram: e };
}, "loader"), gA = {
  id: Gy,
  detector: fA,
  loader: pA
}, mA = gA, Xy = "gitGraph", yA = /* @__PURE__ */ p((e) => /^\s*gitGraph/.test(e), "detector"), xA = /* @__PURE__ */ p(async () => {
  const { diagram: e } = await import("./gitGraphDiagram-WWUBYQGX-Dp6m7rlB.js");
  return { id: Xy, diagram: e };
}, "loader"), CA = {
  id: Xy,
  detector: yA,
  loader: xA
}, bA = CA, Vy = "gantt", kA = /* @__PURE__ */ p((e) => /^\s*gantt/.test(e), "detector"), wA = /* @__PURE__ */ p(async () => {
  const { diagram: e } = await import("./ganttDiagram-EL5Y4UJY-D0ffDDjj.js");
  return { id: Vy, diagram: e };
}, "loader"), TA = {
  id: Vy,
  detector: kA,
  loader: wA
}, SA = TA, Zy = "info", _A = /* @__PURE__ */ p((e) => /^\s*info/.test(e), "detector"), vA = /* @__PURE__ */ p(async () => {
  const { diagram: e } = await import("./infoDiagram-27XIBGKW-BMMGMmyF.js");
  return { id: Zy, diagram: e };
}, "loader"), BA = {
  id: Zy,
  detector: _A,
  loader: vA
}, Ky = "pie", LA = /* @__PURE__ */ p((e) => /^\s*pie/.test(e), "detector"), FA = /* @__PURE__ */ p(async () => {
  const { diagram: e } = await import("./pieDiagram-E7YTZNPT-IOL3mw84.js");
  return { id: Ky, diagram: e };
}, "loader"), AA = {
  id: Ky,
  detector: LA,
  loader: FA
}, Qy = "quadrantChart", EA = /* @__PURE__ */ p((e) => /^\s*quadrantChart/.test(e), "detector"), MA = /* @__PURE__ */ p(async () => {
  const { diagram: e } = await import("./quadrantDiagram-AXDQQJYC-DnVaYiQb.js");
  return { id: Qy, diagram: e };
}, "loader"), $A = {
  id: Qy,
  detector: EA,
  loader: MA
}, OA = $A, Jy = "xychart", DA = /* @__PURE__ */ p((e) => /^\s*xychart(-beta)?/.test(e), "detector"), IA = /* @__PURE__ */ p(async () => {
  const { diagram: e } = await import("./xychartDiagram-S5SC5T6Z-C_uYB2aZ.js");
  return { id: Jy, diagram: e };
}, "loader"), PA = {
  id: Jy,
  detector: DA,
  loader: IA
}, RA = PA, t0 = "requirement", NA = /* @__PURE__ */ p((e) => /^\s*requirement(Diagram)?/.test(e), "detector"), qA = /* @__PURE__ */ p(async () => {
  const { diagram: e } = await import("./requirementDiagram-BXWQKSXE-DVE0hb-0.js");
  return { id: t0, diagram: e };
}, "loader"), zA = {
  id: t0,
  detector: NA,
  loader: qA
}, WA = zA, e0 = "sequence", HA = /* @__PURE__ */ p((e) => /^\s*sequenceDiagram/.test(e), "detector"), YA = /* @__PURE__ */ p(async () => {
  const { diagram: e } = await import("./sequenceDiagram-WJ2MYXX4-BKlQ2y3y.js");
  return { id: e0, diagram: e };
}, "loader"), UA = {
  id: e0,
  detector: HA,
  loader: YA
}, jA = UA, r0 = "class", GA = /* @__PURE__ */ p((e, t) => t?.class?.defaultRenderer === "dagre-wrapper" ? !1 : /^\s*classDiagram/.test(e), "detector"), XA = /* @__PURE__ */ p(async () => {
  const { diagram: e } = await import("./classDiagram-ZZMXUADV-DmsJr_FP.js");
  return { id: r0, diagram: e };
}, "loader"), VA = {
  id: r0,
  detector: GA,
  loader: XA
}, ZA = VA, i0 = "classDiagram", KA = /* @__PURE__ */ p((e, t) => /^\s*classDiagram/.test(e) && t?.class?.defaultRenderer === "dagre-wrapper" ? !0 : /^\s*classDiagram-v2/.test(e), "detector"), QA = /* @__PURE__ */ p(async () => {
  const { diagram: e } = await import("./classDiagram-v2-VYDZK3BY-DmsJr_FP.js");
  return { id: i0, diagram: e };
}, "loader"), JA = {
  id: i0,
  detector: KA,
  loader: QA
}, tE = JA, s0 = "state", eE = /* @__PURE__ */ p((e, t) => t?.state?.defaultRenderer === "dagre-wrapper" ? !1 : /^\s*stateDiagram/.test(e), "detector"), rE = /* @__PURE__ */ p(async () => {
  const { diagram: e } = await import("./stateDiagram-D77RDMKH-DohlIVgy.js");
  return { id: s0, diagram: e };
}, "loader"), iE = {
  id: s0,
  detector: eE,
  loader: rE
}, sE = iE, o0 = "stateDiagram", oE = /* @__PURE__ */ p((e, t) => !!(/^\s*stateDiagram-v2/.test(e) || /^\s*stateDiagram/.test(e) && t?.state?.defaultRenderer === "dagre-wrapper"), "detector"), aE = /* @__PURE__ */ p(async () => {
  const { diagram: e } = await import("./stateDiagram-v2-MP3YSRHH-pSzvxgyF.js");
  return { id: o0, diagram: e };
}, "loader"), nE = {
  id: o0,
  detector: oE,
  loader: aE
}, lE = nE, a0 = "journey", hE = /* @__PURE__ */ p((e) => /^\s*journey/.test(e), "detector"), cE = /* @__PURE__ */ p(async () => {
  const { diagram: e } = await import("./journeyDiagram-3NMN7TZE-DxFC36uw.js");
  return { id: a0, diagram: e };
}, "loader"), uE = {
  id: a0,
  detector: hE,
  loader: cE
}, dE = uE, fE = /* @__PURE__ */ p((e, t, r) => {
  R.debug(`rendering svg for syntax error
`);
  const i = O2(t), s = i.append("g");
  i.attr("viewBox", "0 0 2412 512"), Cf(i, 100, 512, !0), s.append("path").attr("class", "error-icon").attr(
    "d",
    "m411.313,123.313c6.25-6.25 6.25-16.375 0-22.625s-16.375-6.25-22.625,0l-32,32-9.375,9.375-20.688-20.688c-12.484-12.5-32.766-12.5-45.25,0l-16,16c-1.261,1.261-2.304,2.648-3.31,4.051-21.739-8.561-45.324-13.426-70.065-13.426-105.867,0-192,86.133-192,192s86.133,192 192,192 192-86.133 192-192c0-24.741-4.864-48.327-13.426-70.065 1.402-1.007 2.79-2.049 4.051-3.31l16-16c12.5-12.492 12.5-32.758 0-45.25l-20.688-20.688 9.375-9.375 32.001-31.999zm-219.313,100.687c-52.938,0-96,43.063-96,96 0,8.836-7.164,16-16,16s-16-7.164-16-16c0-70.578 57.422-128 128-128 8.836,0 16,7.164 16,16s-7.164,16-16,16z"
  ), s.append("path").attr("class", "error-icon").attr(
    "d",
    "m459.02,148.98c-6.25-6.25-16.375-6.25-22.625,0s-6.25,16.375 0,22.625l16,16c3.125,3.125 7.219,4.688 11.313,4.688 4.094,0 8.188-1.563 11.313-4.688 6.25-6.25 6.25-16.375 0-22.625l-16.001-16z"
  ), s.append("path").attr("class", "error-icon").attr(
    "d",
    "m340.395,75.605c3.125,3.125 7.219,4.688 11.313,4.688 4.094,0 8.188-1.563 11.313-4.688 6.25-6.25 6.25-16.375 0-22.625l-16-16c-6.25-6.25-16.375-6.25-22.625,0s-6.25,16.375 0,22.625l15.999,16z"
  ), s.append("path").attr("class", "error-icon").attr(
    "d",
    "m400,64c8.844,0 16-7.164 16-16v-32c0-8.836-7.156-16-16-16-8.844,0-16,7.164-16,16v32c0,8.836 7.156,16 16,16z"
  ), s.append("path").attr("class", "error-icon").attr(
    "d",
    "m496,96.586h-32c-8.844,0-16,7.164-16,16 0,8.836 7.156,16 16,16h32c8.844,0 16-7.164 16-16 0-8.836-7.156-16-16-16z"
  ), s.append("path").attr("class", "error-icon").attr(
    "d",
    "m436.98,75.605c3.125,3.125 7.219,4.688 11.313,4.688 4.094,0 8.188-1.563 11.313-4.688l32-32c6.25-6.25 6.25-16.375 0-22.625s-16.375-6.25-22.625,0l-32,32c-6.251,6.25-6.251,16.375-0.001,22.625z"
  ), s.append("text").attr("class", "error-text").attr("x", 1440).attr("y", 250).attr("font-size", "150px").style("text-anchor", "middle").text("Syntax error in text"), s.append("text").attr("class", "error-text").attr("x", 1250).attr("y", 400).attr("font-size", "100px").style("text-anchor", "middle").text(`mermaid version ${r}`);
}, "draw"), n0 = { draw: fE }, pE = n0, gE = {
  db: {},
  renderer: n0,
  parser: {
    parse: /* @__PURE__ */ p(() => {
    }, "parse")
  }
}, mE = gE, l0 = "flowchart-elk", yE = /* @__PURE__ */ p((e, t = {}) => (
  // If diagram explicitly states flowchart-elk
  /^\s*flowchart-elk/.test(e) || // If a flowchart/graph diagram has their default renderer set to elk
  /^\s*(flowchart|graph)/.test(e) && t?.flowchart?.defaultRenderer === "elk" ? (t.layout = "elk", !0) : !1
), "detector"), xE = /* @__PURE__ */ p(async () => {
  const { diagram: e } = await import("./flowDiagram-HODETNUW-BfgdGhCg.js").then((t) => t.f);
  return { id: l0, diagram: e };
}, "loader"), CE = {
  id: l0,
  detector: yE,
  loader: xE
}, bE = CE, h0 = "timeline", kE = /* @__PURE__ */ p((e) => /^\s*timeline/.test(e), "detector"), wE = /* @__PURE__ */ p(async () => {
  const { diagram: e } = await import("./timeline-definition-24CTP7MA-lrZI3pxO.js");
  return { id: h0, diagram: e };
}, "loader"), TE = {
  id: h0,
  detector: kE,
  loader: wE
}, SE = TE, c0 = "mindmap", _E = /* @__PURE__ */ p((e) => /^\s*mindmap/.test(e), "detector"), vE = /* @__PURE__ */ p(async () => {
  const { diagram: e } = await import("./mindmap-definition-YA3MSWOX-xS3fomYE.js");
  return { id: c0, diagram: e };
}, "loader"), BE = {
  id: c0,
  detector: _E,
  loader: vE
}, LE = BE, u0 = "kanban", FE = /* @__PURE__ */ p((e) => /^\s*kanban/.test(e), "detector"), AE = /* @__PURE__ */ p(async () => {
  const { diagram: e } = await import("./kanban-definition-UXKFOSKX-CvDXORwq.js");
  return { id: u0, diagram: e };
}, "loader"), EE = {
  id: u0,
  detector: FE,
  loader: AE
}, ME = EE, d0 = "sankey", $E = /* @__PURE__ */ p((e) => /^\s*sankey(-beta)?/.test(e), "detector"), OE = /* @__PURE__ */ p(async () => {
  const { diagram: e } = await import("./sankeyDiagram-P5KCCOFB-DtBM-NIj.js");
  return { id: d0, diagram: e };
}, "loader"), DE = {
  id: d0,
  detector: $E,
  loader: OE
}, IE = DE, f0 = "packet", PE = /* @__PURE__ */ p((e) => /^\s*packet(-beta)?/.test(e), "detector"), RE = /* @__PURE__ */ p(async () => {
  const { diagram: e } = await import("./diagram-Z3DM3KII-DfrMTktH.js");
  return { id: f0, diagram: e };
}, "loader"), NE = {
  id: f0,
  detector: PE,
  loader: RE
}, p0 = "radar", qE = /* @__PURE__ */ p((e) => /^\s*radar-beta/.test(e), "detector"), zE = /* @__PURE__ */ p(async () => {
  const { diagram: e } = await import("./diagram-UQ7AKVKN-DTuNjnCB.js");
  return { id: p0, diagram: e };
}, "loader"), WE = {
  id: p0,
  detector: qE,
  loader: zE
}, g0 = "block", HE = /* @__PURE__ */ p((e) => /^\s*block(-beta)?/.test(e), "detector"), YE = /* @__PURE__ */ p(async () => {
  const { diagram: e } = await import("./blockDiagram-I7D4REHJ-De89y_MR.js");
  return { id: g0, diagram: e };
}, "loader"), UE = {
  id: g0,
  detector: HE,
  loader: YE
}, jE = UE, m0 = "treeView", GE = /* @__PURE__ */ p((e) => /^\s*treeView-beta/.test(e), "detector"), XE = /* @__PURE__ */ p(async () => {
  const { diagram: e } = await import("./diagram-S7CK7UJ4-bg2YiWEB.js");
  return { id: m0, diagram: e };
}, "loader"), VE = {
  id: m0,
  detector: GE,
  loader: XE
}, ZE = VE, y0 = "architecture", KE = /* @__PURE__ */ p((e) => /^\s*architecture/.test(e), "detector"), QE = /* @__PURE__ */ p(async () => {
  const { diagram: e } = await import("./architectureDiagram-5GKGNRK7-B-Y5YdSY.js");
  return { id: y0, diagram: e };
}, "loader"), JE = {
  id: y0,
  detector: KE,
  loader: QE
}, tM = JE, x0 = "eventmodeling", eM = /* @__PURE__ */ p((e) => /^\s*eventmodeling/.test(e), "detector"), rM = /* @__PURE__ */ p(async () => {
  const { diagram: e } = await import("./diagram-VSXAHHWV-CsiT4Vba.js");
  return { id: x0, diagram: e };
}, "loader"), iM = {
  id: x0,
  detector: eM,
  loader: rM
}, sM = iM, C0 = "ishikawa", oM = /* @__PURE__ */ p((e) => /^\s*ishikawa(-beta)?\b/i.test(e), "detector"), aM = /* @__PURE__ */ p(async () => {
  const { diagram: e } = await import("./ishikawaDiagram-5VMMS53U-CBg1k5zw.js");
  return { id: C0, diagram: e };
}, "loader"), nM = {
  id: C0,
  detector: oM,
  loader: aM
}, b0 = "venn", lM = /* @__PURE__ */ p((e) => /^\s*venn-beta/.test(e), "detector"), hM = /* @__PURE__ */ p(async () => {
  const { diagram: e } = await import("./vennDiagram-4TSXK5OY-CdfUzd7K.js");
  return { id: b0, diagram: e };
}, "loader"), cM = {
  id: b0,
  detector: lM,
  loader: hM
}, uM = cM, k0 = "treemap", dM = /* @__PURE__ */ p((e) => /^\s*treemap/.test(e), "detector"), fM = /* @__PURE__ */ p(async () => {
  const { diagram: e } = await import("./diagram-VX7I27RA-DZFD6Cxh.js");
  return { id: k0, diagram: e };
}, "loader"), pM = {
  id: k0,
  detector: dM,
  loader: fM
}, w0 = "wardley", gM = /* @__PURE__ */ p((e) => /^\s*wardley-beta/i.test(e), "detector"), mM = /* @__PURE__ */ p(async () => {
  const { diagram: e } = await import("./wardleyDiagram-VM6X3IG4-DYAVAbIK.js");
  return { id: w0, diagram: e };
}, "loader"), yM = {
  id: w0,
  detector: gM,
  loader: mM
}, xM = yM, T0 = "cynefin", CM = /* @__PURE__ */ p((e) => /^\s*cynefin-beta(?:[\s:]|$)/.test(e), "detector"), bM = /* @__PURE__ */ p(async () => {
  const { diagram: e } = await import("./cynefinDiagram-5FMLGOSQ-uIqersXC.js");
  return { id: T0, diagram: e };
}, "loader"), kM = {
  id: T0,
  detector: CM,
  loader: bM
}, S0 = "railroad", wM = /* @__PURE__ */ p((e) => /^\s*railroad-beta/i.test(e), "detector"), TM = /* @__PURE__ */ p(async () => {
  const { diagram: e } = await import("./railroadDiagram-O6MQD6OU-DGKn2eYs.js");
  return { id: S0, diagram: e };
}, "loader"), SM = {
  id: S0,
  detector: wM,
  loader: TM
}, _0 = "railroadEbnf", _M = /* @__PURE__ */ p((e) => /^\s*railroad-ebnf-beta/i.test(e), "detector"), vM = /* @__PURE__ */ p(async () => {
  const { diagram: e } = await import("./ebnfDiagram-PWID7BFC-BLsG1Z2u.js");
  return { id: _0, diagram: e };
}, "loader"), BM = {
  id: _0,
  detector: _M,
  loader: vM
}, v0 = "railroadAbnf", LM = /* @__PURE__ */ p((e) => /^\s*railroad-abnf-beta/i.test(e), "detector"), FM = /* @__PURE__ */ p(async () => {
  const { diagram: e } = await import("./abnfDiagram-VCTEODGH-BpmD5IVr.js");
  return { id: v0, diagram: e };
}, "loader"), AM = {
  id: v0,
  detector: LM,
  loader: FM
}, B0 = "railroadPeg", EM = /* @__PURE__ */ p((e) => /^\s*railroad-peg-beta/i.test(e), "detector"), MM = /* @__PURE__ */ p(async () => {
  const { diagram: e } = await import("./pegDiagram-XKGWAZYB-BPYyKXfI.js");
  return { id: B0, diagram: e };
}, "loader"), $M = {
  id: B0,
  detector: EM,
  loader: MM
}, jd = !1, ka = /* @__PURE__ */ p(() => {
  jd || (jd = !0, Lo("error", mE, (e) => e.toLowerCase().trim() === "error"), Lo(
    "---",
    // --- diagram type may appear if YAML front-matter is not parsed correctly
    {
      db: {
        clear: /* @__PURE__ */ p(() => {
        }, "clear")
      },
      styles: {},
      // should never be used
      renderer: {
        draw: /* @__PURE__ */ p(() => {
        }, "draw")
      },
      parser: {
        parse: /* @__PURE__ */ p(() => {
          throw new Error(
            "Diagrams beginning with --- are not valid. If you were trying to use a YAML front-matter, please ensure that you've correctly opened and closed the YAML front-matter with un-indented `---` blocks"
          );
        }, "parse")
      },
      init: /* @__PURE__ */ p(() => null, "init")
      // no op
    },
    (e) => e.toLowerCase().trimStart().startsWith("---")
  ), An(bE, LE, tM), An(
    tA,
    ME,
    tE,
    ZA,
    mA,
    SA,
    BA,
    AA,
    WA,
    jA,
    dA,
    lA,
    sA,
    SE,
    bA,
    lE,
    sE,
    dE,
    OA,
    IE,
    NE,
    RA,
    jE,
    sM,
    ZE,
    WE,
    nM,
    pM,
    SM,
    BM,
    AM,
    $M,
    uM,
    xM,
    kM
  ));
}, "addDiagrams"), OM = /* @__PURE__ */ p(async () => {
  R.debug("Loading registered diagrams");
  const t = (await Promise.allSettled(
    Object.entries(ri).map(async ([r, { detector: i, loader: s }]) => {
      if (s)
        try {
          On(r);
        } catch {
          try {
            const { diagram: o, id: a } = await s();
            Lo(a, o, i);
          } catch (o) {
            throw R.error(`Failed to load external diagram with key ${r}. Removing from detectors.`), delete ri[r], o;
          }
        }
    })
  )).filter((r) => r.status === "rejected");
  if (t.length > 0) {
    R.error(`Failed to load ${t.length} external diagrams`);
    for (const r of t)
      R.error(r);
    throw new Error(`Failed to load ${t.length} external diagrams`);
  }
}, "loadRegisteredDiagrams"), DM = "graphics-document document";
function L0(e, t) {
  e.attr("role", DM), t !== "" && e.attr("aria-roledescription", t);
}
p(L0, "setA11yDiagramInfo");
function F0(e, t, r, i) {
  if (e.insert !== void 0) {
    if (r) {
      const s = `chart-desc-${i}`;
      e.attr("aria-describedby", s), e.insert("desc", ":first-child").attr("id", s).text(r);
    }
    if (t) {
      const s = `chart-title-${i}`;
      e.attr("aria-labelledby", s), e.insert("title", ":first-child").attr("id", s).text(t);
    }
  }
}
p(F0, "addSVGa11yTitleDescription");
var gl = class A0 {
  constructor(t, r, i, s, o) {
    this.type = t, this.text = r, this.db = i, this.parser = s, this.renderer = o;
  }
  static {
    p(this, "Diagram");
  }
  static async fromText(t, r = {}) {
    const i = Xt(), s = Cl(t, i);
    t = rT(t) + `
`;
    try {
      On(s);
    } catch {
      const c = LC(s);
      if (!c)
        throw new ff(`Diagram ${s} not found.`);
      const { id: h, diagram: u } = await c();
      Lo(h, u);
    }
    const { db: o, parser: a, renderer: n, init: l } = On(s);
    return a.parser && (a.parser.yy = o), o.clear?.(), l?.(i), r.title && o.setDiagramTitle?.(r.title), await a.parse(t), new A0(s, t, o, a, n);
  }
  async render(t, r) {
    await this.renderer.draw(this.text, t, r, this);
  }
  getParser() {
    return this.parser;
  }
  getType() {
    return this.type;
  }
}, Gd = [], IM = /* @__PURE__ */ p(() => {
  Gd.forEach((e) => {
    e();
  }), Gd = [];
}, "attachFunctions"), PM = /* @__PURE__ */ p((e) => e.replace(/^\s*%%(?!{)[^\n]+\n?/gm, "").trimStart(), "cleanupComments");
function E0(e) {
  const t = e.match(df);
  if (!t)
    return {
      text: e,
      metadata: {}
    };
  const r = t[1], i = r ? t[2].split(`
`).map((a) => a.startsWith(r) ? a.slice(r.length) : a).join(`
`) : t[2];
  let s = AF(i, {
    // To support config, we need JSON schema.
    // https://www.yaml.org/spec/1.2/spec.html#id2803231
    schema: FF
  }) ?? {};
  s = typeof s == "object" && !Array.isArray(s) ? s : {};
  const o = {};
  return s.displayMode && (o.displayMode = s.displayMode.toString()), s.title && (o.title = s.title.toString()), s.config && (o.config = s.config), {
    text: e.slice(t[0].length),
    metadata: o
  };
}
p(E0, "extractFrontMatter");
var RM = /* @__PURE__ */ p((e) => e.replace(/\r\n?/g, `
`).replace(
  /<(\w+)([^>]*)>/g,
  (t, r, i) => "<" + r + i.replace(/="([^"]*)"/g, "='$1'") + ">"
), "cleanupText"), NM = /* @__PURE__ */ p((e) => {
  const { text: t, metadata: r } = E0(e), { displayMode: i, title: s, config: o = {} } = r;
  return i && (o.gantt || (o.gantt = {}), o.gantt.displayMode = i), { title: s, config: o, text: t };
}, "processFrontmatter"), qM = /* @__PURE__ */ p((e) => {
  const t = pe.detectInit(e) ?? {}, r = pe.detectDirective(e, "wrap");
  return Array.isArray(r) ? t.wrap = r.some(({ type: i }) => i === "wrap") : r?.type === "wrap" && (t.wrap = !0), {
    text: Hw(e),
    directive: t
  };
}, "processDirectives");
function Hh(e) {
  const t = RM(e), r = NM(t), i = qM(r.text), s = jl(r.config, i.directive);
  return e = PM(i.text), {
    code: e,
    title: r.title,
    config: s
  };
}
p(Hh, "preprocessDiagram");
function M0(e) {
  const t = new TextEncoder().encode(e), r = Array.from(t, (i) => String.fromCodePoint(i)).join("");
  return btoa(r);
}
p(M0, "toBase64");
var zM = 5e4, WM = "graph TB;a[Maximum text size in diagram exceeded];style a fill:#faa", HM = "sandbox", YM = "loose", UM = "http://www.w3.org/2000/svg", jM = "http://www.w3.org/1999/xlink", GM = "http://www.w3.org/1999/xhtml", XM = "100%", VM = "100%", ZM = "border:0;margin:0;", KM = "margin:0", QM = "allow-top-navigation-by-user-activation allow-popups", JM = 'The "iframe" tag is not supported by your browser.', t5 = ["foreignobject"], e5 = ["dominant-baseline"];
function Yh(e) {
  const t = Hh(e);
  return vo(), SC(t.config ?? {}), t;
}
p(Yh, "processAndSetConfigs");
async function $0(e, t) {
  ka();
  try {
    const { code: r, config: i } = Yh(e);
    return { diagramType: (await D0(r)).type, config: i };
  } catch (r) {
    if (t?.suppressErrors)
      return !1;
    throw r;
  }
}
p($0, "parse");
var Xd = /* @__PURE__ */ p((e, t, r = []) => {
  const i = nf(`{ ${r.join(" !important; ")} !important; }`);
  return `.${e} ${t} ${i}`;
}, "cssImportantStyles"), r5 = /* @__PURE__ */ p((e, t = /* @__PURE__ */ new Map()) => {
  const r = new CSSStyleSheet();
  if (e.fontFamily !== void 0 && r.insertRule(
    `:root { --mermaid-font-family: ${e.fontFamily}}`,
    r.cssRules.length
  ), e.altFontFamily !== void 0 && r.insertRule(
    `:root { --mermaid-alt-font-family: ${e.altFontFamily}}`,
    r.cssRules.length
  ), t instanceof Map) {
    const n = ge(e) ? ["> *", "span"] : ["rect", "polygon", "ellipse", "circle", "path"];
    t.forEach((l) => {
      iu(l.styles) || n.forEach((c) => {
        r.insertRule(
          Xd(l.id, c, l.styles),
          r.cssRules.length
        );
      }), iu(l.textStyles) || r.insertRule(
        Xd(
          l.id,
          "tspan",
          (l?.textStyles || []).map((c) => c.replace("color", "fill"))
        ),
        r.cssRules.length
      );
    });
  }
  let i = "";
  if (e.themeCSS !== void 0)
    if (typeof r.replaceSync == "function") {
      const s = new CSSStyleSheet();
      s.replaceSync(e.themeCSS), i = $n(s) + `
`;
    } else
      i += `${e.themeCSS}
`;
  return i + $n(r);
}, "createCssStyles"), i5 = /* @__PURE__ */ p((e, t) => pl(
  GF(`${e}{${t}}`),
  ZF([
    /* @__PURE__ */ p(function(i, s, o, a) {
      if (i.type === "rule" && Array.isArray(i.props)) {
        if (i.parent && i.parent.type === ul)
          return;
        i.props = i.props.map((n) => n === e && Array.isArray(i.children) && i.children.every((c) => c.type !== "decl" ? !1 : (/* @__PURE__ */ new Set([
          "font-family",
          "font-size",
          "fill"
        ])).has(c.props)) || // If the prop already starts with the namespace followed by a space or >, then it's already namespaced.
        (n.startsWith(`${e} `) || n.startsWith(`${e}>`)) && // Column combinators are not yet widely supported, it's not yet compressed to `${namespace}||`,
        // so we need to add an extra check for that
        !n.startsWith(`${e} ||`) ? n : `${e} ${n}`);
      } else i.type.startsWith("@") && ([
        ...[
          $F,
          DF,
          Ny,
          PF,
          "@container",
          "@starting-style"
        ],
        ul
        // needed for Mermaid's animation feature
      ].includes(i.type) || (R.warn(`Removing unsupported at-rule ${i.type} from CSS`), i.type = zh));
    }, "addNamespace"),
    VF
  ])
), "compileCSS"), s5 = /* @__PURE__ */ p((e, t, r, i) => {
  const s = r5(e, r), o = jC(
    t,
    s,
    { ...e.themeVariables, theme: e.theme, look: e.look },
    i
  );
  return i5(i, o);
}, "createUserStyles"), o5 = /* @__PURE__ */ p((e = "", t, r) => {
  let i = e;
  return !r && !t && (i = i.replace(
    /marker-end="url\([\d+./:=?A-Za-z-]*?#/g,
    'marker-end="url(#'
  )), i = zr(i), i = i.replace(/<br>/g, "<br/>"), i;
}, "cleanUpSvgCode"), a5 = /* @__PURE__ */ p((e = "", t) => {
  const r = t?.viewBox?.baseVal?.height ? t.viewBox.baseVal.height + "px" : VM, i = M0(`<body style="${KM}">${e}</body>`);
  return `<iframe style="width:${XM};height:${r};${ZM}" src="data:text/html;charset=UTF-8;base64,${i}" sandbox="${QM}">
  ${JM}
</iframe>`;
}, "putIntoIFrame"), Vd = /* @__PURE__ */ p((e, t, r, i, s) => {
  const o = e.append("div");
  o.attr("id", r), i && o.attr("style", i);
  const a = o.append("svg").attr("id", t).attr("width", "100%").attr("xmlns", UM);
  return s && a.attr("xmlns:xlink", s), a.append("g"), e;
}, "appendDivSvgG");
function ml(e, t) {
  return e.append("iframe").attr("id", t).attr("style", "width: 100%; height: 100%;").attr("sandbox", "");
}
p(ml, "sandboxedIframe");
var n5 = /* @__PURE__ */ p((e, t, r, i) => {
  e.getElementById(t)?.remove(), e.getElementById(r)?.remove(), e.getElementById(i)?.remove();
}, "removeExistingElements"), l5 = /* @__PURE__ */ p(async function(e, t, r) {
  ka();
  const i = Yh(t);
  t = i.code;
  const s = Xt();
  R.debug(s), t.length > (s?.maxTextSize ?? zM) && (t = WM);
  const o = `#${e}`, a = "i" + e, n = "#" + a, l = "d" + e, c = "#" + l, h = /* @__PURE__ */ p(() => {
    const O = At(d ? n : c).node();
    O && "remove" in O && O.remove();
  }, "removeTempElements");
  let u = At(document.body);
  const d = s.securityLevel === HM, f = s.securityLevel === YM, m = s.fontFamily;
  if (r !== void 0) {
    if (r && (r.innerHTML = ""), d) {
      const U = ml(At(r), a);
      u = At(U.nodes()[0].contentDocument.body), u.node().style.margin = "0";
    } else
      u = At(r);
    Vd(u, e, l, `font-family: ${m}`, jM);
  } else {
    if (n5(document, e, l, a), d) {
      const U = ml(At(document.body), a);
      u = At(U.nodes()[0].contentDocument.body), u.node().style.margin = "0";
    } else
      u = At("body");
    Vd(u, e, l);
  }
  let y, x;
  try {
    y = await gl.fromText(t, { title: i.title });
  } catch (U) {
    if (s.suppressErrorRendering)
      throw h(), U;
    y = await gl.fromText("error"), x = U;
  }
  const C = u.select(c).node(), k = y.type, T = C.firstChild, _ = T.firstChild, v = y.renderer.getClasses?.(t, y), L = s5(s, k, v, o), A = document.createElement("style");
  A.innerHTML = L, T.insertBefore(A, _);
  try {
    await y.renderer.draw(t, e, "11.17.2", y);
  } catch (U) {
    throw s.suppressErrorRendering ? h() : pE.draw(t, e, "11.17.2"), U;
  }
  const F = u.select(`${c} svg`), G = y.db.getAccTitle?.(), Y = y.db.getAccDescription?.();
  I0(k, F, G, Y);
  const st = (/* @__PURE__ */ p(() => {
    u.select(`[id="${e}"]`).selectAll("foreignobject > *").attr("xmlns", GM);
    let U = u.select(c).node().innerHTML;
    if (R.debug("config.arrowMarkerAbsolute", s.arrowMarkerAbsolute), U = o5(U, d, cr(s.arrowMarkerAbsolute)), d) {
      const O = u.select(c + " svg").node();
      U = a5(U, O);
    } else f || (U = Mi.sanitize(U, {
      ADD_TAGS: t5,
      ADD_ATTR: e5,
      HTML_INTEGRATION_POINTS: { foreignobject: !0 }
    }));
    return IM(), U;
  }, "serializeSvg"))();
  if (x)
    throw x;
  return h(), {
    diagramType: k,
    svg: st,
    bindFunctions: y.db.bindFunctions
  };
}, "render");
function O0(e = {}) {
  const t = se({}, e);
  t?.fontFamily && !t.themeVariables?.fontFamily && (t.themeVariables || (t.themeVariables = {}), t.themeVariables.fontFamily = t.fontFamily), wC(t), t?.theme && t.theme in kr ? t.themeVariables = kr[t.theme].getThemeVariables(
    t.themeVariables
  ) : t && (t.themeVariables = kr.default.getThemeVariables(t.themeVariables));
  const r = typeof t == "object" ? kC(t) : lf();
  xl(r.logLevel), ka();
}
p(O0, "initialize");
var D0 = /* @__PURE__ */ p((e, t = {}) => {
  const { code: r } = Hh(e);
  return gl.fromText(r, t);
}, "getDiagramFromText");
function I0(e, t, r, i) {
  L0(t, e), F0(t, r, i, t.attr("id"));
}
p(I0, "addA11yInfo");
var li = Object.freeze({
  render: l5,
  parse: $0,
  getDiagramFromText: D0,
  initialize: O0,
  getConfig: Xt,
  /**
   * @deprecated This function does nothing. It will be overwritten by the next
   *             call to {@link render} or {@link parse}.
   */
  setConfig: hf,
  getSiteConfig: lf,
  updateSiteConfig: TC,
  reset: /* @__PURE__ */ p(() => {
    vo();
  }, "reset"),
  globalReset: /* @__PURE__ */ p(() => {
    vo($i);
  }, "globalReset"),
  defaultConfig: $i
});
xl(Xt().logLevel);
vo(Xt());
var h5 = /* @__PURE__ */ p((e, t, r) => {
  R.warn(e), Ul(e) ? (r && r(e.str, e.hash), t.push({ ...e, message: e.str, error: e })) : (r && r(e), e instanceof Error && t.push({
    str: e.message,
    message: e.message,
    hash: e.name,
    error: e
  }));
}, "handleError"), P0 = /* @__PURE__ */ p(async function(e = {
  querySelector: ".mermaid"
}) {
  try {
    await c5(e);
  } catch (t) {
    if (Ul(t) && R.error(t.str), _r.parseError && _r.parseError(t), !e.suppressErrors)
      throw R.error("Use the suppressErrors option to suppress these errors"), t;
  }
}, "run"), c5 = /* @__PURE__ */ p(async function({ postRenderCallback: e, querySelector: t, nodes: r } = {
  querySelector: ".mermaid"
}) {
  const i = li.getConfig();
  R.debug(`${e ? "" : "No "}Callback function found`);
  let s;
  if (r)
    s = r;
  else if (t)
    s = document.querySelectorAll(t);
  else
    throw new Error("Nodes and querySelector are both undefined");
  R.debug(`Found ${s.length} diagrams`), i?.startOnLoad !== void 0 && (R.debug("Start On Load: " + i?.startOnLoad), li.updateSiteConfig({ startOnLoad: i?.startOnLoad }));
  const o = new pe.InitIDGenerator(i.deterministicIds, i.deterministicIDSeed);
  let a;
  const n = [];
  for (const l of Array.from(s)) {
    if (R.info("Rendering diagram: " + l.id), l.getAttribute("data-processed"))
      continue;
    l.setAttribute("data-processed", "true");
    const c = `mermaid-${o.next()}`;
    a = l.innerHTML, a = jp(pe.entityDecode(a)).trim().replace(/<br\s*\/?>/gi, "<br/>");
    const h = pe.detectInit(a);
    h && R.debug("Detected early reinit: ", h);
    try {
      const { svg: u, bindFunctions: d } = await z0(c, a, l);
      l.innerHTML = u, e && await e(c), d && d(l);
    } catch (u) {
      h5(u, n, _r.parseError);
    }
  }
  if (n.length > 0)
    throw n[0];
}, "runThrowsErrors"), R0 = /* @__PURE__ */ p(function(e) {
  li.initialize(e);
}, "initialize"), u5 = /* @__PURE__ */ p(async function(e, t, r) {
  R.warn("mermaid.init is deprecated. Please use run instead."), e && R0(e);
  const i = { postRenderCallback: r, querySelector: ".mermaid" };
  typeof t == "string" ? i.querySelector = t : t && (t instanceof HTMLElement ? i.nodes = [t] : i.nodes = t), await P0(i);
}, "init"), d5 = /* @__PURE__ */ p(async (e, {
  lazyLoad: t = !0
} = {}) => {
  ka(), An(...e), t === !1 && await OM();
}, "registerExternalDiagrams"), N0 = /* @__PURE__ */ p(function() {
  if (_r.startOnLoad) {
    const { startOnLoad: e } = li.getConfig();
    e && _r.run().catch((t) => R.error("Mermaid failed to initialize", t));
  }
}, "contentLoaded");
typeof document < "u" && window.addEventListener("load", N0, !1);
var f5 = /* @__PURE__ */ p(function(e) {
  _r.parseError = e;
}, "setParseErrorHandler"), Zo = [], vn = !1, q0 = /* @__PURE__ */ p(async () => {
  if (!vn) {
    for (vn = !0; Zo.length > 0; ) {
      const e = Zo.shift();
      if (e)
        try {
          await e();
        } catch (t) {
          R.error("Error executing queue", t);
        }
    }
    vn = !1;
  }
}, "executeQueue"), p5 = /* @__PURE__ */ p(async (e, t) => new Promise((r, i) => {
  const s = /* @__PURE__ */ p(() => new Promise((o, a) => {
    li.parse(e, t).then(
      (n) => {
        o(n), r(n);
      },
      (n) => {
        R.error("Error parsing", n), _r.parseError?.(n), a(n), i(n);
      }
    );
  }), "performCall");
  Zo.push(s), q0().catch(i);
}), "parse"), z0 = /* @__PURE__ */ p((e, t, r) => new Promise((i, s) => {
  const o = /* @__PURE__ */ p(() => new Promise((a, n) => {
    li.render(e, t, r).then(
      (l) => {
        a(l), i(l);
      },
      (l) => {
        R.error("Error parsing", l), _r.parseError?.(l), n(l), s(l);
      }
    );
  }), "performCall");
  Zo.push(o), q0().catch(s);
}), "render"), g5 = /* @__PURE__ */ p(() => Object.keys(ri).map((e) => ({
  id: e
})), "getRegisteredDiagramsMetadata"), _r = {
  startOnLoad: !0,
  mermaidAPI: li,
  parse: p5,
  render: z0,
  init: u5,
  run: P0,
  registerExternalDiagrams: d5,
  registerLayoutLoaders: Iy,
  initialize: R0,
  parseError: void 0,
  contentLoaded: N0,
  setParseErrorHandler: f5,
  detectType: Cl,
  registerIconPacks: ow,
  getRegisteredDiagramsMetadata: g5
}, m5 = _r;
/*! Check if previously processed */
/*!
 * Wait for document loaded before starting the execution
 */
const i3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  clearLayoutRenderState: kh,
  createCommonLayoutRenderer: Ty,
  default: m5,
  defaultMeasureLayout: wh,
  paintLayoutData: Th
}, Symbol.toStringTag, { value: "Module" }));
export {
  Hc as $,
  jl as A,
  af as B,
  Xw as C,
  O2 as D,
  eC as E,
  k5 as F,
  hw as G,
  AF as H,
  Ts as I,
  FF as J,
  b5 as K,
  ia as L,
  DC as M,
  xf as N,
  Mi as O,
  Sc as P,
  ya as Q,
  _2 as R,
  Yn as S,
  Gw as T,
  Ds as U,
  Ft as V,
  ar as W,
  k2 as X,
  Yc as Y,
  Nw as Z,
  p as _,
  VC as a,
  Sp as a$,
  E5 as a0,
  v5 as a1,
  F5 as a2,
  L5 as a3,
  S5 as a4,
  Ml as a5,
  A5 as a6,
  _5 as a7,
  xi as a8,
  $5 as a9,
  o_ as aA,
  fe as aB,
  ZT as aC,
  Nl as aD,
  Pl as aE,
  yo as aF,
  Tw as aG,
  ww as aH,
  kw as aI,
  bw as aJ,
  dw as aK,
  kp as aL,
  gw as aM,
  uw as aN,
  xw as aO,
  wp as aP,
  pw as aQ,
  vw as aR,
  _w as aS,
  Sw as aT,
  Lw as aU,
  Bw as aV,
  fw as aW,
  Tp as aX,
  Cw as aY,
  yw as aZ,
  mw as a_,
  M5 as aa,
  B5 as ab,
  Ge as ac,
  z as ad,
  W as ae,
  HC as af,
  bf as ag,
  qm as ah,
  ch as ai,
  Nu as aj,
  Ns as ak,
  ow as al,
  Yl as am,
  ut as an,
  W5 as ao,
  z5 as ap,
  Ty as aq,
  It as ar,
  fy as as,
  dt as at,
  q5 as au,
  Vo as av,
  gy as aw,
  ha as ax,
  uh as ay,
  Hm as az,
  XC as b,
  sy as b$,
  jm as b0,
  Ep as b1,
  Qd as b2,
  w2 as b3,
  C5 as b4,
  Ve as b5,
  sw as b6,
  w5 as b7,
  Ll as b8,
  Ir as b9,
  ai as bA,
  zi as bB,
  vr as bC,
  hd as bD,
  nr as bE,
  br as bF,
  oB as bG,
  Ju as bH,
  Xo as bI,
  wr as bJ,
  gv as bK,
  Le as bL,
  id as bM,
  gh as bN,
  aF as bO,
  fa as bP,
  Go as bQ,
  iF as bR,
  dy as bS,
  ir as bT,
  mv as bU,
  bh as bV,
  Vm as bW,
  nF as bX,
  sF as bY,
  XL as bZ,
  ua as b_,
  vs as ba,
  Pc as bb,
  ek as bc,
  pt as bd,
  mp as be,
  Be as bf,
  X1 as bg,
  Bl as bh,
  Of as bi,
  Rs as bj,
  Pf as bk,
  T5 as bl,
  lx as bm,
  dh as bn,
  fh as bo,
  Xu as bp,
  Qm as bq,
  da as br,
  Km as bs,
  Sv as bt,
  Jm as bu,
  hB as bv,
  VB as bw,
  pv as bx,
  Tv as by,
  cB as bz,
  $t as c,
  ma as c0,
  oy as c1,
  VL as c2,
  jB as c3,
  jr as c4,
  ps as c5,
  _i as c6,
  no as c7,
  tn as c8,
  gF as c9,
  HS as ca,
  i3 as cb,
  Cf as d,
  se as e,
  Sr as f,
  KC as g,
  Pm as h,
  Re as i,
  At as j,
  Is as k,
  R as l,
  $p as m,
  QC as n,
  JC as o,
  GC as p,
  O5 as q,
  Nr as r,
  ZC as s,
  sx as t,
  r3 as u,
  e3 as v,
  Kw as w,
  pe as x,
  Xt as y,
  eb as z
};
//# sourceMappingURL=mermaid.core-CmK1425T.js.map
