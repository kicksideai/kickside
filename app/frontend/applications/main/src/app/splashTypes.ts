import type { SplashStep } from '../composables/useSurfaces'

export type SplashOutcome = { status: 'completed' | 'skipped'; detail?: Record<string, unknown> }
export type SplashStepList = SplashStep[]
