local registry = require("registry")
local support = require("user_repo_support")
local M = {}
local HOST = "kickside.contract:host_credential_eligibility"
local GUARD = "kickside.users.binding:credential_eligibility"
local CONFIG = "kickside.users:bot_account_inventory"

local function unavailable(id)
    return nil, errors.new({kind = errors.UNAVAILABLE, retryable = false,
        message = "bot account credential support is incomplete",
        details = {code = "bot_credentials_not_ready", entry = id}})
end

local function invalid()
    return nil, errors.new({kind = errors.INVALID, retryable = false,
        message = "bot account credential inventory is invalid"})
end

local function identifier(value)
    return type(value) == "string" and value:match("^[%w_.%-]+:[%w_.%-]+$") ~= nil
end

local function array(value)
    if type(value) ~= "table" or #value == 0 then return false end
    local count = 0
    for key in pairs(value) do
        if type(key) ~= "number" or key < 1 or key > #value or key % 1 ~= 0 then return false end
        count = count + 1
    end
    return count == #value
end

local function validate(rows)
    if not array(rows) then return false end
    for _, row in ipairs(rows) do
        if type(row) ~= "table" or (row.installed ~= nil and not identifier(row.installed))
            or not array(row.entries) then return false end
        for _, required in ipairs(row.entries) do
            if type(required) ~= "table" or not identifier(required.entry)
                or type(required.kind) ~= "string" or required.kind == "" then return false end
            if required.meta ~= nil then
                if type(required.meta) ~= "table" then return false end
                for key, value in pairs(required.meta) do
                    local kind = type(value)
                    if type(key) ~= "string" or key == "" or
                        (kind ~= "string" and kind ~= "number" and kind ~= "boolean") then return false end
                end
            end
        end
    end
    return true
end

local function lookup(id)
    local entry, err = registry.get(id)
    if err and errors.is(err, errors.NOT_FOUND) then return nil, nil end
    if err then return nil, err end
    return entry, nil
end

function M.check()
    local host, host_err = lookup(HOST)
    if host_err then return nil, host_err end
    if not host or host.kind ~= "function.lua" or not host.meta or
        host.meta.credential_eligibility ~= GUARD then return unavailable(HOST) end
    local guard, guard_err = lookup(GUARD)
    if guard_err then return nil, guard_err end
    if not guard or guard.kind ~= "function.lua" then return unavailable(GUARD) end
    local config, config_err = lookup(CONFIG)
    if config_err then return nil, config_err end
    if not config then return unavailable(CONFIG) end
    local rows = config.meta and config.meta.consumers
    if config.kind ~= "registry.entry" or not validate(rows) then return invalid() end
    for _, row in ipairs(rows) do
        local installed = true
        if row.installed then
            local entry, err = lookup(row.installed)
            if err then return nil, err end
            installed = entry ~= nil
        end
        if installed then
            for _, required in ipairs(row.entries) do
                local entry, err = lookup(required.entry)
                if err then return nil, err end
                if not entry or entry.kind ~= required.kind then return unavailable(required.entry) end
                for key, value in pairs(required.meta or {}) do
                    if not entry.meta or entry.meta[key] ~= value then return unavailable(required.entry) end
                end
            end
        end
    end
    local db, db_err = support.get_db()
    if db_err then return nil, db_err end
    local _, schema_err = db:query("SELECT user_id, created_by, created_at FROM app_user_bot_accounts WHERE 1=0")
    db:release()
    if schema_err then return nil, schema_err end
    return true, nil
end

return M
