-- OAuth client credential resolution. A provider declares, in its connector
-- context, WHERE its client id/secret live:
--   oauth_client_<field>_setting = "namespace:key"  -> a kickside/settings value
--   oauth_client_<field>_env     = "<env.variable id>" -> an environment value
-- We prefer the (encrypted, admin-editable) setting and fall back to env, so a
-- deployment can move credentials out of .env into settings without code change.
-- The settings contract id is provider-injectable (context settings_contract),
-- defaulting to the canonical service.

local ctx = require("ctx")
local env = require("env")
local contract = require("contract")
local security = require("security")
local oauth_types = require("oauth_types")

local M = {}

local DEFAULT_SETTINGS_CONTRACT = oauth_types.CONTRACT.SETTINGS

-- ctx_str reads a context value, returning "" when absent.
local function ctx_str(key: string): string
    local v = ctx.get(key)
    return (type(v) == "string") and (v :: string) or ""
end

-- from_settings resolves "namespace:key" through the settings contract; nil when
-- unset, empty, malformed, or the service is unavailable.
local function from_settings(ref: string): string?
    if ref == "" then return nil end
    local ns, key = ref:match("^(.+):([^:]+)$")
    if not ns or not key then return nil end
    local contract_id = ctx_str("settings_contract")
    if contract_id == "" then contract_id = DEFAULT_SETTINGS_CONTRACT end
    local actor = security.actor()
    local scope = security.scope()
    if not actor or not scope then return nil end
    local def = contract.get(contract_id)
    if not def then return nil end
    local inst = def:with_actor(actor):with_scope(scope):open()
    if not inst then return nil end
    local r = inst:get({ namespace = ns, key = key })
    if r and (r :: any).success and type((r :: any).value) == "string" and (r :: any).value ~= "" then
        return (r :: any).value :: string
    end
    return nil
end

-- from_env resolves an env.variable id; nil when unset or empty.
local function from_env(ref: string): string?
    if ref == "" then return nil end
    local v = env.get(ref)
    if type(v) == "string" and (v :: string) ~= "" then return v :: string end
    return nil
end

-- resolve returns (value, source) for field "id" | "secret", preferring the
-- setting over env. value is nil when configured in neither place (the caller
-- decides whether that field is required).
function M.resolve(field: string): (string?, string?)
    if field ~= "id" and field ~= "secret" then
        return nil
    end
    local from_set = from_settings(ctx_str("oauth_client_" .. field .. "_setting"))
    if from_set then return from_set, "settings" end
    local from_e = from_env(ctx_str("oauth_client_" .. field .. "_env"))
    if from_e then return from_e, "env" end
    return nil
end

return M
