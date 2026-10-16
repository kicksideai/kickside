import themePreset from '@wippy-fe/theme/tailwind.config'

export default {
  presets: [themePreset],
  content: [
    './src/**/*.{vue,ts}',
    './app.html',
  ],
  theme: {
    extend: {
      // Pin rounded-lg to the 8px control canon (--r8); the 13px SPA root
      // otherwise resolves the rem-based default to 6.5px on nav/tab chrome.
      borderRadius: {
        lg: '8px',
      },
    },
  },
}
