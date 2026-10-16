type ModuleIdentityLike = {
  full_name?: unknown
  component?: unknown
  module?: unknown
  org?: unknown
  organization?: unknown
  namespace?: unknown
  name?: unknown
  id?: unknown
}

export function normalizeModuleIdentity(value?: unknown): string {
  return String(value || '').trim().toLowerCase()
}

export function moduleIdentityKeys(m?: ModuleIdentityLike | null): string[] {
  if (!m) return []
  const keys = new Set<string>()
  const add = (value?: unknown) => {
    const k = normalizeModuleIdentity(value)
    if (k) keys.add(k)
  }
  add(m.full_name)
  add(m.component)
  add(m.module)
  if (m.org && m.name) add(`${m.org}/${m.name}`)
  if (typeof m.organization === 'string' && m.name) add(`${m.organization}/${m.name}`)
  if (m.organization && typeof m.organization === 'object' && m.name) {
    const org = m.organization as { name?: unknown; slug?: unknown }
    if (org.slug) add(`${org.slug}/${m.name}`)
    if (org.name) add(`${org.name}/${m.name}`)
  }
  if (m.namespace && m.name) add(`${m.namespace}/${m.name}`)
  const name = normalizeModuleIdentity(m.name)
  if (name.includes('/')) add(name)
  const id = normalizeModuleIdentity(m.id)
  if (id.includes('/')) add(id)
  return Array.from(keys)
}

export function moduleMatchesComponent(m: ModuleIdentityLike | null | undefined, component: string): boolean {
  const target = normalizeModuleIdentity(component)
  if (!target) return false
  return moduleIdentityKeys(m).includes(target)
}
