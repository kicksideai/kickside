-- The profile service. Each contract method maps to one of these functions via
-- the kickside.users.profile:profile binding. Values are per-user: writes always
-- target the authenticated actor; reads default to the actor but may target
-- another user when the requested field is declared public.

local defs = require("profile_defs")
local writer = require("profile_writer")
local profile_types = require("profile_types")
local json = require("json")

local M = {}

local function current_actor_id(): string?
    local security = require("security")
    local actor = security.actor()
    local actor_id = actor and actor:id() or nil
    if type(actor_id) == "string" and actor_id ~= "" then return actor_id end
    return nil
end

-- Effective value for one declared key given a user's override map: a coerced
-- stored value, else the declared default.
local function preserve_json_shape(def: profile_types.Definition, value: profile_types.ProfileValue): profile_types.ProfileValue
    if def.value_type ~= "json" or type(value) ~= "table" or next(value :: any) ~= nil then return value end
    local schema = def.schema
    if type(schema) == "table" and (schema :: any).type == "object" then
        local object = select(1, json.decode("{}"))
        if type(object) == "table" then return object end
    end
    return value
end

local function effective_value(def: profile_types.Definition, rec: profile_types.ValueRecord?): profile_types.ProfileValue
    if rec ~= nil then
        local v, cerr = defs.coerce(def, (rec :: any).value)
        if not cerr then return preserve_json_shape(def, v) end
    end
    return preserve_json_shape(def, def.default)
end

-- Resolve which user a read targets and whether the caller may see it. Own reads
-- are always allowed. Cross-user reads are allowed only for public-visibility
-- fields. Returns (user_id, error?).
local function resolve_read_target(actor_id: string, requested: any, def_public: boolean): (string?, string?)
    if type(requested) ~= "string" or requested == "" or requested == actor_id then
        return actor_id
    end
    if def_public then return requested :: string end
    return nil, "profile field is not readable for another user"
end

-- get({ namespace, key, user_id? }) -> { success, value, error? }.
function M.get(args: any): profile_types.GetResponse
    args = args or {}
    local actor_id = current_actor_id()
    if not actor_id then return { success = false, error = "authenticated actor is required" } end
    local def = defs.find(args.namespace, args.key)
    if not def then return { success = false, error = "undeclared profile field" } end

    local target, terr = resolve_read_target(actor_id :: string, args.user_id, def.visibility == profile_types.VISIBILITY_PUBLIC)
    if terr then return { success = false, error = terr } end

    local rec, read_err = writer.read_value(target :: string, def.namespace, def.key)
    if read_err then return { success = false, error = tostring(read_err) } end
    return ({ success = true, value = effective_value(def, rec) }) :: profile_types.GetResponse
end

-- get_namespace({ namespace, user_id? }) -> { success, values = { key = value } }.
-- For a cross-user target, only public fields are returned.
function M.get_namespace(args: any): profile_types.NamespaceResponse
    args = args or {}
    local actor_id = current_actor_id()
    if not actor_id then return { success = false, error = "authenticated actor is required" } end
    if type(args.namespace) ~= "string" then return { success = false, error = "namespace is required" } end

    local cross = type(args.user_id) == "string" and args.user_id ~= "" and args.user_id ~= actor_id
    local target = cross and (args.user_id :: string) or (actor_id :: string)

    local declared = defs.all()[args.namespace] or {}
    local map, read_err = writer.read_namespace(target, args.namespace)
    if read_err or not map then return { success = false, error = tostring(read_err) } end
    local values: { [string]: any } = {}
    for key, def in pairs(declared) do
        if (not cross) or def.visibility == profile_types.VISIBILITY_PUBLIC then
            values[key] = effective_value(def, (map :: profile_types.ValueMap)[key])
        end
    end
    return { success = true, values = values }
end

-- set({ namespace, key, value }) -> { success, error? }. Always writes the
-- authenticated actor's own value via the canonical writer.
function M.set(args: any): profile_types.BasicResponse
    args = args or {}
    local actor_id = current_actor_id()
    if not actor_id then return { success = false, error = "authenticated actor is required" } end
    local ok, err = writer.set(actor_id, args.namespace, args.key, args.value)
    if not ok then return { success = false, error = err } end
    return { success = true }
end

-- unset({ namespace, key }) -> { success, error? }. Reverts the actor's field to
-- the declared default.
function M.unset(args: any): profile_types.BasicResponse
    args = args or {}
    local actor_id = current_actor_id()
    if not actor_id then return { success = false, error = "authenticated actor is required" } end
    local ok, err = writer.clear(actor_id, args.namespace, args.key)
    if not ok then return { success = false, error = err } end
    return { success = true }
end

-- list({ namespace? }) -> { success, fields = [...] } merging visible declarations
-- with the actor's own values + provenance, so the profile editor renders every
-- declared field.
function M.list(args: any): profile_types.ListResponse
    args = args or {}
    local actor_id = current_actor_id()
    if not actor_id then return { success = false, error = "authenticated actor is required" } end

    local out: { profile_types.FieldListRow } = {}
    for dns, keys in pairs(defs.all()) do
        if type(args.namespace) ~= "string" or dns == args.namespace then
            local map, read_err = writer.read_namespace(actor_id :: string, dns)
            if read_err or not map then return { success = false, error = tostring(read_err) } end
            for key, def in pairs(keys) do
                if def.visible ~= false then
                    local rec = (map :: profile_types.ValueMap)[key]
                    local row: profile_types.FieldListRow = {
                        namespace = dns, key = key,
                        value_type = def.value_type,
                        is_default = rec == nil,
                        description = def.description,
                        editable = def.editable,
                        visibility = def.visibility,
                        schema = def.schema,
                        updated_at = rec and rec.updated_at or nil,
                    }
                    row.value = effective_value(def, rec)
                    row.default = def.default
                    out[#out + 1] = row
                end
            end
        end
    end
    return { success = true, fields = out }
end

return M
