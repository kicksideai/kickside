// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
// Each tag registers when the entry loads, so this map stays small and in its own
// chunk. The entry and the lazy editor both read it.
export const EDITOR_TAGS: Record<string, string> = {
  'kickside-model-provider-openai-compatible': 'openai_compat',
  'kickside-model-provider-openai': 'openai',
  'kickside-model-provider-anthropic': 'anthropic',
  'kickside-model-provider-google-generative-ai': 'google_genai',
  'kickside-model-provider-google-vertex': 'google_vertex',
  'kickside-model-provider-bedrock': 'bedrock',
}
