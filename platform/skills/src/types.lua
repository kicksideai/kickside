-- Type and invariant surfaces for the kickside.skills store + agent surface.
-- A skill is a component (identity / access / kind) whose primary kickside.core
-- thread (thread_id == skill_id) carries the version events. A registered
-- projection folds them into the committed projection body. Bundled file bytes
-- live in the skill's own bundle, named by sha256 in each version's manifest.

local M = {}

type Map = { [string]: any }
type Scalar = string | number | boolean

-- A bundled file in a skill version: a reference (loaded into context on demand),
-- an asset (binary dependency), or a script (reserved for the script runner).
-- content is the raw bytes; size_bytes/sha256 describe it. mime_type + metadata
-- (e.g. an inferred script language) aid the agent + the future runner.
type SkillFile = {
    path: string,
    kind: string,
    mime_type: string?,
    size_bytes: integer?,
    sha256: string?,
    executable: boolean?,
    metadata: Map?,
    content: string?,
}

type SkillFileInput = SkillFile & {
    encoding: string?,
}

-- A file as recorded in a version's event manifest: descriptors + the sha256 its
-- bytes are stored under in the skill's bundle (bundle_store.read(skill_id, sha256)).
type SkillFileManifest = {
    path: string,
    kind: string,
    mime_type: string?,
    size_bytes: integer,
    sha256: string?,
    artifact_id: string?,
    executable: boolean?,
    metadata: Map?,
}

-- A normalized remote skill ready for import. fetch() on a skill_source returns
-- this; skill_create consumes it. files carry content (text or base64) which the
-- store normalizes to raw bytes before storing them in the skill bundle.
type SkillBundle = {
    name: string,
    description: string?,
    version: string?,
    body: string,
    license: string?,
    allowed_tools: { string }?,
    compatibility: Map?,
    metadata: Map?,
    files: { SkillFileInput }?,
    source: Map?,
}

type SkillCreateArgs = SkillBundle & {
    status: string?,
    agent_id: string?,
    icon: string?,
}

type SkillRefineArgs = {
    skill_id: string?,
    name: string?,
    description: string?,
    body: string?,
    status: string?,
    icon: string?,
    files: { SkillFileInput }?,
    license: string?,
    allowed_tools: { string }?,
    compatibility: Map?,
    metadata: Map?,
    source: Map?,
}

type SkillShareArgs = {
    skill_id: string?,
    user_id: string?,
    access_mask: integer?,
    action: string?,
}

type SkillDeleteArgs = {
    skill_id: string?,
}

type VersionSelector = string | number

type SkillGetArgs = {
    skill_id: string?,
    version: VersionSelector?,
}

type SkillListVersionsArgs = {
    skill_id: string?,
}

type SkillListFilesArgs = {
    skill_id: string?,
    version: VersionSelector?,
    kind: string?,
}

type SkillReadFileArgs = {
    skill_id: string?,
    path: string?,
    version: VersionSelector?,
    max_bytes: VersionSelector?,
    format: string?,
}

type SkillListArgs = {
    include_archived: boolean?,
    agent_id: string?,
    ids: string?,
    q: string?,
    limit: integer?,
    offset: integer?,
}

type SkillToolArgs = {
    action: string?,
    skill_id: string?,
    user_id: string?,
    access_mask: integer?,
    name: string?,
    description: string?,
    body: string?,
    status: string?,
    icon: string?,
    agent_id: string?,
    version: VersionSelector?,
    path: string?,
    kind: string?,
    max_bytes: VersionSelector?,
    format: string?,
    files: { SkillFileInput }?,
    license: string?,
    allowed_tools: { string }?,
    compatibility: Map?,
    metadata: Map?,
    source: Map?,
    include_archived: boolean?,
    limit: integer?,
    cursor: string?,
}

-- Full skill record: component metadata + the current body/version. Returned by
-- skill_store.get. file_count/bundle_size summarize the version's files; files lists their descriptors.
type Skill = {
    skill_id: string,
    name: string?,
    description: string?,
    status: string?,
    icon: string?,
    body: string,
    version: integer,
    license: string?,
    file_count: integer?,
    bundle_size: integer?,
    files: { SkillFile }?,
}

-- Discovery row from skill_store.list: no body (loaded on demand via get()).
type SkillSummary = {
    skill_id: string,
    name: string?,
    description: string?,
    status: string?,
    icon: string?,
    agent_id: string?,
    version: integer?,
    version_count: integer?,
    file_count: integer?,
    bundle_size: integer?,
}

-- One entry in a skill's version history (reader.list_versions). No body — the
-- editor loads a chosen version's body on demand via get({ version }).
type SkillVersion = {
    version: integer,
    name: string?,
    description: string?,
    license: string?,
    file_count: integer?,
    bundle_size: integer?,
    created_at: string?,
}

type SkillFileContent = {
    path: string,
    kind: string,
    mime_type: string?,
    size_bytes: integer,
    sha256: string?,
    executable: boolean?,
    encoding: string,
    content: string,
}

-- A folded version record in the projection body: a version's full snapshot
-- (body + frontmatter + file manifest) so get/list_files/read_file serve any
-- version from the read model without replaying events.
type VersionRecord = {
    version: integer,
    body: string,
    name: string?,
    description: string?,
    license: string?,
    allowed_tools: { string }?,
    compatibility: Map?,
    metadata: Map?,
    source: Map?,
    files: { SkillFileManifest },
    file_count: integer,
    bundle_size: integer,
    created_at: string?,
}

-- skill_store.refine result. version is set only when the body or files changed
-- (a description-only refine leaves it nil).
type RefineResult = { skill_id: string, version: integer? }

-- skill_store.share result.
type ShareResult = { skill_id: string, user_id: string, action: string }
type DeleteResult = { skill_id: string }

type ComponentCommand = {
    type: string,
    payload: Map?,
}

type ComponentMeta = Map & {
    title: string?,
    description: string?,
    status: string?,
    icon: string?,
    agent_id: string?,
    version: integer?,
    version_count: integer?,
    file_count: integer?,
    bundle_size: integer?,
}

type ComponentRow = {
    component_id: string,
    meta: ComponentMeta?,
}

-- The skills trait build func (init_skills) contribution: empty when nothing is
-- pinned, otherwise the pinned-skills prompt section the compiler appends.
type Contribution = { prompt: string? }

M.Map = Map
M.Scalar = Scalar
M.SkillFile = SkillFile
M.SkillFileInput = SkillFileInput
M.SkillFileManifest = SkillFileManifest
M.SkillBundle = SkillBundle
M.SkillCreateArgs = SkillCreateArgs
M.SkillRefineArgs = SkillRefineArgs
M.SkillShareArgs = SkillShareArgs
M.SkillDeleteArgs = SkillDeleteArgs
M.VersionSelector = VersionSelector
M.SkillGetArgs = SkillGetArgs
M.SkillListVersionsArgs = SkillListVersionsArgs
M.SkillListFilesArgs = SkillListFilesArgs
M.SkillReadFileArgs = SkillReadFileArgs
M.SkillListArgs = SkillListArgs
M.SkillToolArgs = SkillToolArgs
M.Skill = Skill
M.SkillSummary = SkillSummary
M.SkillVersion = SkillVersion
M.SkillFileContent = SkillFileContent
M.VersionRecord = VersionRecord
M.RefineResult = RefineResult
M.ShareResult = ShareResult
M.DeleteResult = DeleteResult
M.ComponentCommand = ComponentCommand
M.ComponentMeta = ComponentMeta
M.ComponentRow = ComponentRow
M.Contribution = Contribution

-- kickside_component_meta.class discriminator for skill components (discovery vocabulary).
M.SKILL_CLASS = "kickside.skills"

-- impl_id stored on the skill's components row.
M.SKILL_IMPL = "kickside.skills:skill"

-- The skill's event-log thread: the skill component's primary thread
-- (thread_id == skill_id), holding the version events the projection folds.
M.THREAD_CLASS = M.SKILL_CLASS

-- Thread event types: a skill version is born with `created` and each refinement
-- appends `updated`. body carries the full version snapshot (body + frontmatter +
-- file manifest named by sha256).
M.EVENT = {
    CREATED = "kickside.skills.events:skill.created",
    UPDATED = "kickside.skills.events:skill.updated",
    FILE_TRANSFERRED = "kickside.skills.events:file.transferred",
}

-- The version-history projection kind state.lua reads the body of. Its full config
-- (worker_ref/input_mode) is declared on the `skill` KIND binding (single source)
-- and auto-applied by the engine when the history thread passes that kind as its
-- declaration impl_id; only the kind name is needed here to locate the materialized
-- body.
M.PROJECTION_KIND = "kickside.skills:history"

-- A skill is surfaced to agents while active; archived skills are hidden from
-- discovery (set via refine; reversible).
M.STATUS = { ACTIVE = "active", ARCHIVED = "archived" }

-- A skill version bundles a markdown body with reference/asset/script files.
-- kind drives how a file is surfaced: a reference is loaded into context on
-- demand, an asset is a binary the procedure depends on, a script is reserved
-- for the follow-on script runner and is stored, never run, in V1.
M.FILE_KIND = { REFERENCE = "reference", ASSET = "asset", SCRIPT = "script" }

-- Source file encodings the importer accepts. Text is stored as-is; base64 is
-- decoded to raw bytes before storage so the bundle holds the real file.
M.ENCODING = { TEXT = "text", BASE64 = "base64" }

-- Input bounds. name/description mirror the Claude SKILL.md frontmatter limits
-- (name <= 64, description <= 1024); body is capped so a pinned skill cannot
-- blow an agent's context window. FILE caps a single bundled file; BUNDLE caps a
-- version's total file bytes; FILE_COUNT caps how many files one version carries.
M.LIMITS = {
    NAME = 64,
    DESCRIPTION = 1024,
    BODY = 64 * 1024,
    FILE = 1024 * 1024,
    BUNDLE = 8 * 1024 * 1024,
    FILE_COUNT = 256,
    PATH = 512,
}

-- Skill runtime. The runtime contract activates a skill version, lists its
-- files, and reads one file. The default binding is skill_runtime.
M.SKILL_RUNTIME = "kickside.skills:skill_runtime"
M.SKILL_RUNTIME_BINDING = "kickside.skills:skill_runtime_binding"

-- Reserved registry meta.type for a skill script runner. A future SkillScript
-- tool resolves an executable file's runtime to a binding tagged with this type
-- (a registry allowlist, not arbitrary container images). No runner ships in V1.
M.SKILL_RUNNER_TYPE = "kickside.skill_runner"

return M
