// Billing pages where an account owner adds credits for each first-party provider.
const BILLING_URLS: Record<string, string> = {
  'wippy.llm.claude:provider': 'https://platform.claude.com/settings/billing',
  'wippy.llm.openai:provider': 'https://platform.openai.com/settings/organization/billing',
  'wippy.llm.google.generative_ai:provider': 'https://aistudio.google.com/billing',
}

export type ProviderErrorType = 'insufficient_credits' | 'invalid_key' | 'rate_limited'

export interface ConnectFailure {
  message: string
  errorType?: ProviderErrorType
  billingUrl?: string
}

export function errorTypeOf(data: unknown): ProviderErrorType | undefined {
  const value = (data as any)?.diagnostics?.error_type
  return value === 'insufficient_credits' || value === 'invalid_key' || value === 'rate_limited' ? value : undefined
}

export function connectFailure(message: string, errorType: ProviderErrorType | undefined, providerId: string): ConnectFailure {
  if (errorType === 'insufficient_credits') {
    return {
      message: 'The key works, but the provider account has no credits. Add credits, then connect again.',
      errorType,
      billingUrl: BILLING_URLS[providerId],
    }
  }
  if (errorType === 'invalid_key') {
    return { message: 'The provider does not accept this API key. Check the key and try again.', errorType }
  }
  if (errorType === 'rate_limited') {
    return { message: 'The provider is rate limiting requests. Wait a moment and try again.', errorType }
  }
  return { message }
}
