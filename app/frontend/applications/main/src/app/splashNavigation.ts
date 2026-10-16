export interface SplashNavigation {
  path: string
  startToken?: string
}

export async function completeSplashNavigation(detail: SplashNavigation, deps: {
  dismiss: () => Promise<void>
  isSplashActive: () => boolean
  navigate: (path: string) => Promise<unknown>
  startChat: (token: string) => void
}) {
  await deps.dismiss()
  if (deps.isSplashActive()) return
  await deps.navigate(detail.path)
  if (detail.startToken) deps.startChat(detail.startToken)
}
