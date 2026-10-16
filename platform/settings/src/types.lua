-- Shared type and invariant surface for kickside.settings. The value itself is
-- intentionally dynamic because each declaration owns its value_type/schema; the
-- envelopes, cache records, list rows, vocabulary, and DB resolver are stable.

local registry = require("registry")

local M = {}

type SettingValue = any
type JsonSchema = any

type Definition = {
    namespace: string,
    key: string,
    value_type: string,
    default: SettingValue,
    description: string,
    scope: string,
    editable: boolean,
    visible: boolean,
    read_access: string?,
    schema: JsonSchema?,
    validate_func: string?,
    -- Presentation hints for the admin form (all optional, backward-compatible):
    -- a human title (falls back to a humanized key), a subgroup heading within the
    -- namespace form, an ordering weight within that subgroup, and a bespoke
    -- web-component tag that replaces the generic control for this one setting.
    title: string?,
    category: string?,
    order: number?,
    ui: string?,
    owner: string?,
}

type DefinitionMap = { [string]: { [string]: Definition } }

type OverrideRecord = {
    value: SettingValue,
    error: string?,
    value_type: string?,
    updated_by: string?,
    updated_at: any?,
}

type OverrideMap = { [string]: OverrideRecord }

type GetArgs = { namespace: string?, key: string? }
type NamespaceArgs = { namespace: string? }
type SetArgs = { namespace: string?, key: string?, value: SettingValue }
type UnsetArgs = { namespace: string?, key: string? }
type ListArgs = { namespace: string? }

type BasicResponse = { success: boolean, error: string? }
type GetResponse = { success: boolean, value: SettingValue?, error: string? }
type NamespaceResponse = { success: boolean, values: { [string]: SettingValue }?, error: string? }

type SettingListRow = {
    namespace: string,
    key: string,
    is_secret: boolean,
    value_type: string,
    is_default: boolean,
    description: string,
    scope: string,
    editable: boolean,
    schema: JsonSchema?,
    updated_by: string?,
    updated_at: any?,
    has_value: boolean?,
    value: SettingValue?,
    error: string?,
    default: SettingValue?,
    -- Presentation hints surfaced to the admin form (see Definition).
    title: string?,
    category: string?,
    order: number?,
    ui: string?,
    owner: string?,
}

type ListResponse = { success: boolean, settings: { SettingListRow }?, error: string? }

type UpdatedSetting = { namespace: string, key: string }
type PutResponse = { success: boolean, updated: { UpdatedSetting }?, error: string? }

M.SettingValue = SettingValue
M.JsonSchema = JsonSchema
M.Definition = Definition
M.DefinitionMap = DefinitionMap
M.OverrideRecord = OverrideRecord
M.OverrideMap = OverrideMap
M.GetArgs = GetArgs
M.NamespaceArgs = NamespaceArgs
M.SetArgs = SetArgs
M.UnsetArgs = UnsetArgs
M.ListArgs = ListArgs
M.BasicResponse = BasicResponse
M.GetResponse = GetResponse
M.NamespaceResponse = NamespaceResponse
M.SettingListRow = SettingListRow
M.ListResponse = ListResponse
M.UpdatedSetting = UpdatedSetting
M.PutResponse = PutResponse

M.DEFINITION_TYPE = "kickside.settings:definition"

-- Registry entry whose meta.db_id holds the configured settings database
-- resource. The target_db ns.requirement rewrites that field per deployment.
M.DB_CONFIG = "kickside.settings:db_config"

-- Resolve the configured DB id the writer binds to. Reads db_config's meta.db_id
-- so a target_db rebind reaches the persist layer.
function M.db_id(): string
    local entry = select(1, registry.get(M.DB_CONFIG)) :: any
    return entry.meta.db_id :: string
end

-- A non-visible setting is excluded from the admin UI listing but stays fully
-- manageable through the contract + PUT API. Declarations default to visible.
M.DEFAULT_VISIBLE = true

M.TYPES = {
    string = true,
    int = true,
    bool = true,
    duration = true,
    json = true,
    -- A secret is a string stored AES-encrypted at rest. Reads via get return the
    -- plaintext (for the code that needs the credential); list masks it.
    secret = true,
}

-- value_types whose stored value is encrypted and must never be surfaced in a
-- listing.
M.SECRET_TYPES = {
    secret = true,
}

M.SCOPE_GLOBAL = "global"

return M
