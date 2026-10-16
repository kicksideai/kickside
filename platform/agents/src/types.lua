-- Type surfaces for the kickside.agents:agents registry and the
-- wippy.agent:resolver binding. AgentConfig mirrors the agent private_context
-- shape that agents.lua writes on create and the resolver reads back. Result
-- shapes document each registry method's output. Reference cross-module via
-- the import alias (e.g. agent_types.AgentConfig).

local M = {}

-- The impl_id (registry id of the kickside.agents:user_agent contract.binding)
-- that backs every user agent. A component is a user agent iff its impl_id is
-- this. Single source of truth — filter/identify user agents through it, never
-- a re-typed literal.
M.USER_AGENT_IMPL = "kickside.agents:user_agent"

-- kickside_component_meta.class discriminator for agent components. Every create
-- path writes this and the registry list/find filter on it — a single value, so
-- created agents are discoverable. Filter/identify agents through it, never a
-- re-typed literal.
M.AGENT_CLASS = "agent"

-- Component public metadata is stored as text by kickside.component. Keep that
-- storage detail out of every discovery caller while still failing closed for
-- missing/malformed values. Registry entries are not passed here: their canonical
-- `meta.public` value remains the boolean checked at the registry boundary.
function M.component_is_public(meta: any): boolean
    if type(meta) ~= "table" then return false end
    local is_public = meta.public == true or meta.public == "true"
    local is_private = meta.private == true or meta.private == "true"
    return is_public and not is_private
end

-- Registry protocol for packages that can back wippy.agent:memory for a user
-- agent. The provider package owns the implementation_id and target listing.
M.MEMORY_PROVIDER_TYPE = "agent.memory_provider"

-- Model an agent is created with when the create input omits one. AgentConfig.model
-- is required, so create fills it with this value and the stored config always
-- carries a model. The single source of truth for the create-time default -- read
-- sites (resolver, list) never substitute, they surface a missing model instead.
M.DEFAULT_MODEL = "class:fast"

-- Sampling temperature an agent is created with, and the value read sites
-- substitute when a stored config omits temperature. Single source of truth for
-- the temperature default -- reference this, never a re-typed literal.
M.DEFAULT_TEMPERATURE = 0.5

-- Response token budget an agent is created with, and the value read sites
-- substitute when a stored config omits max_tokens. Single source of truth for
-- the max_tokens default -- reference this, never a re-typed literal.
M.DEFAULT_MAX_TOKENS = 8000

-- New user agents receive artifact authoring and uploaded-file access unless the caller
-- explicitly supplies a traits array (including an empty array as opt-out).
-- Return a fresh table so one create path cannot mutate another's defaults.
M.DEFAULT_ARTIFACT_TRAIT = "kickside.agents.traits:artifacts"
M.DEFAULT_FILE_TRAIT = "kickside.uploads.traits:file_manager"

function M.default_traits(): { string }
    return { M.DEFAULT_ARTIFACT_TRAIT, M.DEFAULT_FILE_TRAIT }
end

-- The agent configuration persisted in a component's private_context. Built by
-- agents.create and consumed by agent_resolver.resolve.
type AgentConfig = {
    prompt: string,
    model: string,
    temperature: number,
    max_tokens: number,
    traits: { string },
    trait_contexts: { [string]: any },
    trait_agent_options: { [string]: any },
    agent_options: { [string]: any },
    tools: { string },
    delegates: { string },
    thinking_effort: string?,
    memory_target_id: string,
    memory_provider_id: string?,
}

-- A persisted rollback step: the contract method to call and its args,
-- replayed on teardown.
type RollbackStep = { method: string, args: { [string]: any } }

-- Public component row returned by kickside.component:component_service list
-- methods for agent components. Agent runtime state lives in private_context
-- and is resolved through the component service, not exposed here.
type ComponentRow = {
    component_id: string,
    impl_id: string,
    created_at: string?,
    updated_at: string?,
    meta: { [string]: string }?,
    parent_id: string?,
    position: string?,
    path: string?,
}

-- agents.create result.
type CreateResult = {
    component_id: string,
    name: string?,
    rollback: RollbackStep,
}

-- agents.upsert envelope. The upserted agent record is the
-- public per-component row.
type UpsertResult = { agent: ComponentRow, created: boolean, rollback: RollbackStep? }

-- Bare component handle returned by update/delete.
type ComponentRef = { component_id: string }

M.AgentConfig = AgentConfig
M.RollbackStep = RollbackStep
M.ComponentRow = ComponentRow
M.CreateResult = CreateResult
M.UpsertResult = UpsertResult
M.ComponentRef = ComponentRef

return M
