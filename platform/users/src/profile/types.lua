-- Shared type and invariant surface for kickside.profile. Mirrors
-- kickside.settings, but every value is owned by a user_id: definitions are
-- global declarations, values are per-user rows. The value itself is dynamic
-- because each declaration owns its value_type/schema.

local registry = require("registry")

local M = {}

type ProfileValue = any
type JsonSchema = any

type Definition = {
    namespace: string,
    key: string,
    value_type: string,
    default: ProfileValue,
    description: string,
    editable: boolean,
    visible: boolean,
    -- visibility controls cross-user reads: a "self" field is readable only by
    -- its owner; a "public" field is readable by any authenticated actor (so
    -- display names / avatars can render across the app). Writes are always
    -- owner-only regardless of visibility.
    visibility: string,
    schema: JsonSchema?,
    validate_func: string?,
}

type DefinitionMap = { [string]: { [string]: Definition } }

type ValueRecord = {
    value: ProfileValue,
    value_type: string?,
    updated_at: any?,
}

-- key -> record, within a single user's namespace.
type ValueMap = { [string]: ValueRecord }

type GetArgs = { namespace: string?, key: string?, user_id: string? }
type NamespaceArgs = { namespace: string?, user_id: string? }
type SetArgs = { namespace: string?, key: string?, value: ProfileValue }
type UnsetArgs = { namespace: string?, key: string? }
type ListArgs = { namespace: string? }

type BasicResponse = { success: boolean, error: string? }
type GetResponse = { success: boolean, value: ProfileValue?, error: string? }
type NamespaceResponse = { success: boolean, values: { [string]: ProfileValue }?, error: string? }

type FieldListRow = {
    namespace: string,
    key: string,
    value_type: string,
    is_default: boolean,
    description: string,
    editable: boolean,
    visibility: string,
    schema: JsonSchema?,
    updated_at: any?,
    value: ProfileValue?,
    default: ProfileValue?,
}

type ListResponse = { success: boolean, fields: { FieldListRow }?, error: string? }

type UpdatedField = { namespace: string, key: string }
type PutResponse = { success: boolean, updated: { UpdatedField }?, error: string? }

M.ProfileValue = ProfileValue
M.JsonSchema = JsonSchema
M.Definition = Definition
M.DefinitionMap = DefinitionMap
M.ValueRecord = ValueRecord
M.ValueMap = ValueMap
M.GetArgs = GetArgs
M.NamespaceArgs = NamespaceArgs
M.SetArgs = SetArgs
M.UnsetArgs = UnsetArgs
M.ListArgs = ListArgs
M.BasicResponse = BasicResponse
M.GetResponse = GetResponse
M.NamespaceResponse = NamespaceResponse
M.FieldListRow = FieldListRow
M.ListResponse = ListResponse
M.UpdatedField = UpdatedField
M.PutResponse = PutResponse

M.DEFINITION_TYPE = "kickside.users.profile:definition"

-- Registry entry whose meta.db_id holds the configured profile database
-- resource. The target_db ns.requirement rewrites that field per deployment.
M.DB_CONFIG = "kickside.users.profile:db_config"

-- Resolve the configured DB id the writer binds to. Reads db_config's meta.db_id
-- so a target_db rebind reaches the persist layer.
function M.db_id(): string
    local entry = select(1, registry.get(M.DB_CONFIG)) :: any
    return entry.meta.db_id :: string
end

M.DEFAULT_VISIBLE = true

-- Profile field value types. No secret type: profile fields are personal data,
-- not credentials; add a shared crypto helper before introducing one.
M.TYPES = {
    string = true,
    int = true,
    bool = true,
    duration = true,
    json = true,
}

M.VISIBILITY_SELF = "self"
M.VISIBILITY_PUBLIC = "public"

M.VISIBILITY = {
    self = true,
    public = true,
}

return M
