import { inject, ref } from 'vue'
import { APP_TITLE } from '../constants'
import type { useApi } from '../composables/useWippy'

const DEFAULT_MARK = '/app/kickside-icon.svg'

export function useShellBranding(api: ReturnType<typeof useApi>) {
  const facadeTitle = inject(APP_TITLE, 'KickSide')
  const markUrl = ref(DEFAULT_MARK)
  const appTitle = ref(facadeTitle)

  function setBrowserTitle(title: string) {
    // This shell runs in an iframe. The facade owns the host tab title.
    document.title = title
  }

  async function applyBranding() {
    try {
      const { data } = await api.get('/api/public/branding')
      if (data?.success) {
        appTitle.value = (data.title || facadeTitle) as string
        markUrl.value = (data.logo_url || DEFAULT_MARK) as string
        setBrowserTitle(appTitle.value)
      }
    } catch { /* keep facade defaults on any error */ }
  }

  return { markUrl, appTitle, applyBranding }
}
