import "@iconify/vue";
import { defineComponent as m, h as u, onMounted as a } from "vue";
const i = 3e4;
function l(o) {
  let t;
  const e = new Promise((r, n) => {
    t = setTimeout(() => n(new Error(`Loading timed out after ${i} ms.`)), i);
  });
  return Promise.race([o, e]).finally(() => clearTimeout(t));
}
function c(o, t, e) {
  const r = e();
  a(() => r("error", { message: o, error: t }));
}
function f(o, t, e) {
  return () => l(o()).catch((r) => ({
    rootComponent: m(() => (c(t, r, e), () => u("wippy-error", { title: "Failed to load", message: t })))
  }));
}
export {
  f as l
};
//# sourceMappingURL=lazy-DX8B4FNv.js.map
