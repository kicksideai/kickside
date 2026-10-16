import { ref } from 'vue'
import { api } from '@wippy-fe/proxy'
import type { Adapter, ClassGroup, ModelCard, Preset, Profile } from '../types.ts'

// Admin data store for the models surface. Owns the four admin collections, the
// load lifecycle, and the profile / card mutations. Every mutation reloads the
// admin payload so derived views stay consistent.

function messageOf(e: unknown, fallback: string): string {
  const data = (e as any)?.response?.data ?? (e as any)?.data
  if (typeof data?.error === 'string' && data.error) return data.error
  if (typeof data?.message === 'string' && data.message) return data.message
  return e instanceof Error ? e.message : fallback
}

export function useModelsApi() {
  const adapters = ref<Adapter[]>([])
  const presets = ref<Preset[]>([])
  const profiles = ref<Profile[]>([])
  const models = ref<ModelCard[]>([])
  const classes = ref<ClassGroup[]>([])
  const loading = ref(true)
  const saving = ref(false)
  const discovering = ref('')
  const probing = ref('')
  const error = ref('')

  let loadSeq = 0
  let classesLoadSeq = 0

  async function load(): Promise<void> {
    const seq = ++loadSeq
    loading.value = true
    error.value = ''
    try {
      const { data } = await api.get('/api/v1/models/admin')
      if (seq !== loadSeq) return
      adapters.value = data.adapters ?? []
      presets.value = data.presets ?? []
      profiles.value = data.profiles ?? []
      models.value = data.models ?? []
    } catch (e) {
      if (seq === loadSeq) error.value = messageOf(e, 'failed to load models')
    } finally {
      if (seq === loadSeq) loading.value = false
    }
  }

  // Registry-resolved model classes (fast / nano / …): each class lists its
  // generate-capable members ranked by priority, the top one being what
  // class:<name> resolves to at runtime.
  async function loadClasses(): Promise<void> {
    const seq = ++classesLoadSeq
    try {
      const { data } = await api.get('/api/v1/models/classes')
      if (seq === classesLoadSeq) classes.value = data.classes ?? []
    } catch {
      if (seq === classesLoadSeq) classes.value = []
    }
  }

  async function mutate(run: () => Promise<void>, fail: string): Promise<boolean> {
    saving.value = true
    error.value = ''
    try {
      await run()
      await load()
      return true
    } catch (e) {
      error.value = messageOf(e, fail)
      return false
    } finally {
      saving.value = false
    }
  }

  function saveProfile(mode: 'create' | 'edit', id: string, body: Record<string, unknown>): Promise<boolean> {
    return mutate(async () => {
      if (mode === 'edit') await api.put(`/api/v1/models/provider-profiles/${encodeURIComponent(id)}`, body)
      else await api.post('/api/v1/models/provider-profiles', body)
    }, 'failed to save profile')
  }

  function deleteProfile(id: string): Promise<boolean> {
    return mutate(() => api.delete(`/api/v1/models/provider-profiles/${encodeURIComponent(id)}`).then(() => {}), 'failed to delete profile')
  }

  function saveCard(body: Record<string, unknown>): Promise<boolean> {
    return mutate(() => api.put('/api/v1/models/cards', body).then(() => {}), 'failed to save model')
  }

  // Persist several cards in one mutation so the admin payload reloads once
  // (used by onboarding auto-assignment, which writes a model per class tier).
  function saveCards(bodies: Record<string, unknown>[]): Promise<boolean> {
    if (!bodies.length) return Promise.resolve(true)
    return mutate(async () => {
      for (const body of bodies) await api.put('/api/v1/models/cards', body)
    }, 'failed to save models')
  }

  function deleteCard(name: string): Promise<boolean> {
    return mutate(() => api.delete(`/api/v1/models/cards?name=${encodeURIComponent(name)}`).then(() => {}), 'failed to delete model')
  }

  async function discover(id: string): Promise<{ ok: boolean; message: string }> {
    discovering.value = id
    error.value = ''
    try {
      const { data } = await api.post(`/api/v1/models/provider-profiles/${encodeURIComponent(id)}/discover`, {})
      await load()
      if (data && data.success === false) {
        error.value = data.error || 'connection failed'
        return { ok: false, message: error.value }
      }
      return { ok: true, message: 'Connection succeeded' }
    } catch (e) {
      error.value = messageOf(e, 'connection failed')
      return { ok: false, message: error.value }
    } finally {
      discovering.value = ''
    }
  }

  // Authenticated connection check against the provider. Unlike discovery, this
  // does not create model cards; OpenAI-compatible profiles can use test_model
  // for a real chat-completions probe.
  async function testProfile(id: string): Promise<{ ok: boolean; message: string }> {
    error.value = ''
    try {
      const { data } = await api.post(`/api/v1/models/provider-profiles/${encodeURIComponent(id)}/test`, {})
      await load()
      if (data && data.success === false) {
        error.value = data.error || 'connection test failed'
        return { ok: false, message: error.value }
      }
      return { ok: true, message: data?.message || 'Connection test succeeded' }
    } catch (e) {
      error.value = messageOf(e, 'connection test failed')
      await load().catch(() => {})
      return { ok: false, message: error.value }
    }
  }

  async function testModel(name: string): Promise<{ ok: boolean; message: string; data?: any }> {
    probing.value = name
    error.value = ''
    try {
      const { data } = await api.post('/api/v1/models/cards/test', { name })
      if (data && data.success === false) {
        const message = data.error || data.message || 'model probe failed'
        return { ok: false, message, data: { ...data, error: data.error || data.message || message } }
      }
      const routed = data?.provider_model && data.provider_model !== data?.model
        ? ` (${data.provider_model})`
        : ''
      return { ok: true, message: data?.message ? `${data.message}${routed}` : `Model probe succeeded${routed}`, data }
    } catch (e) {
      const message = messageOf(e, 'model probe failed')
      return { ok: false, message, data: { success: false, model: name, error: message } }
    } finally {
      probing.value = ''
    }
  }

  return {
    adapters, presets, profiles, models, classes,
    loading, saving, discovering, probing, error,
    load, loadClasses, saveProfile, deleteProfile, saveCard, saveCards, deleteCard, discover, testProfile, testModel,
  }
}
