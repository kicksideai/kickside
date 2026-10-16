import themePreset from '@wippy-fe/theme/tailwind.config'

/*
 * The theme's PrimeVue CSS is written with Tailwind `@apply`, and several of its
 * components assume Tailwind's preflight is present - `.p-tab`, for one, styles
 * border, colour and hover but never background, and relies on preflight having
 * neutralised the UA's `buttonface` on the `<button>` it renders.
 *
 * The host document loads a prebuilt Tailwind sheet, but nothing carries it into
 * a web component's shadow root, so a module that renders PrimeVue has to build
 * its own base. That is what this config is for.
 *
 * See @wippy-fe/theme README, "Tailwind preset".
 */
export default {
  presets: [themePreset],
  content: ['./src/**/*.{vue,ts}'],
}
