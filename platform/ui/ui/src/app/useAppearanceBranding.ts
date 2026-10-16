import { ref, type Ref } from 'vue'
import { api } from '@wippy-fe/proxy'

interface AppearanceBrandingOptions {
  logoUrl: Ref<string>
  error: Ref<string>
  apiError: (error: unknown, fallback: string) => string
}

export function useAppearanceBranding({ logoUrl, error, apiError }: AppearanceBrandingOptions) {
  const uploadingLogo = ref(false)

  async function uploadLogo(event: Event) {
    const input = event.target as HTMLInputElement
    const file = input.files && input.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { error.value = 'Logo must be an image'; input.value = ''; return }
    if (file.size > 2 * 1024 * 1024) { error.value = 'Logo too large (max 2 MB)'; input.value = ''; return }
    uploadingLogo.value = true
    error.value = ''
    try {
      const form = new FormData()
      form.append('logo', file)
      const { data } = await api.post('/api/v1/nav/logo', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      if (!data.success || !data.url) throw new Error(data.error || 'upload failed')
      logoUrl.value = data.url
    } catch (cause) {
      error.value = apiError(cause, 'upload failed')
    } finally {
      uploadingLogo.value = false
      input.value = ''
    }
  }

  function removeLogo() { logoUrl.value = '' }

  return { uploadingLogo, uploadLogo, removeLogo }
}
