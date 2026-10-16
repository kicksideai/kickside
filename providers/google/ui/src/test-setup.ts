import { config } from "@vue/test-utils";
import { vi } from "vitest";

globalThis.__props__ = { config: {} };
globalThis.__api__ = {};

function responseFor(url: string): unknown {
  for (const key of Object.keys(globalThis.__api__)) {
    if (url.includes(key)) return globalThis.__api__[key];
  }
  return { success: true };
}

const api = {
  get: vi.fn((url: string) => Promise.resolve({ data: responseFor(url) })),
  post: vi.fn((url: string) => Promise.resolve({ data: responseFor(url) })),
  put: vi.fn((url: string) => Promise.resolve({ data: responseFor(url) })),
  delete: vi.fn((url: string) => Promise.resolve({ data: responseFor(url) })),
};

vi.mock("@wippy-fe/proxy", () => ({
  api,
  host: { toast: vi.fn(), handleError: vi.fn() },
  on: vi.fn(() => vi.fn()),
  loadByTagName: vi.fn(() => Promise.resolve()),
}));

vi.mock("@wippy-fe/webcomponent-vue", () => ({
  useProps: () => ({ value: globalThis.__props__ }),
  useEvents: () => vi.fn(),
}));

Object.assign(window, {
  $W: {
    api: () => Promise.resolve(api),
    instance: () => Promise.resolve({ host: { toast: vi.fn() } }),
  },
});

config.global.stubs = {
  Icon: true,
  "wc-icon-picker": true,
  "wc-model-picker": true,
  "wc-resource-view": true,
};
config.global.config.compilerOptions = {
  isCustomElement: (tag: string) => tag.startsWith("wc-") || tag.startsWith("kx-"),
};
