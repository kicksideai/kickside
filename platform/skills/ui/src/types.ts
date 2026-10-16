// No host-driven props: the skills surface fetches its own data.
export interface ComponentProps {}

// One bundled file inside a skill's package, loaded on demand by the agent.
export interface SkillFile {
  path: string
  kind?: string
  mime_type?: string
  size_bytes?: number
}

// A skill record as returned by GET /api/v1/skills. Shared by the management
// surface and the trait picker so both read the same shape.
export interface Skill {
  skill_id: string
  name?: string
  description?: string
  status?: string
  icon?: string
  version?: number
  body?: string
  license?: string
  agent_id?: string
  files?: SkillFile[]
  file_count?: number
  bundle_size?: number
}

// One entry from GET /api/v1/skills/{id}/versions (newest first).
export interface SkillVersion {
  version: number
  name?: string
  description?: string
  license?: string
  file_count?: number
  bundle_size?: number
  created_at?: string
}
