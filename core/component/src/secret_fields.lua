-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local registry = require("registry")
local autoinit = require("autoinit")
local funcs = require("funcs")
local types = require("component_types")

local M = {}

local function invalid(): error
    return errors.new({kind = errors.INVALID, message = "invalid component secret field declaration or value",
        details = {code = "component_secret_field"}})
end

function M.validate(raw: unknown, schema: unknown?): error?
    if type(raw) ~= "table" then return invalid() end
    local fields = raw :: types.SecretField[]
    local count = 0
    for key, field in pairs(fields) do
        if type(key) ~= "number" or key % 1 ~= 0 or key < 1 or key > #fields
            or type(field) ~= "table" or field.type ~= "string" or type(field.path) ~= "table"
            or #field.path == 0 then return invalid() end
        if #field.path == 1 and type(schema) == "table" then
            local credential_fields = (schema :: types.CredentialSchema).fields
            if credential_fields ~= nil and type(credential_fields) ~= "table" then return invalid() end
            for _, declared in ipairs(credential_fields or {}) do
                if type(declared) ~= "table" then return invalid() end
                if declared.key == field.path[1] then
                    local kind = declared.type or "text"
                    if kind ~= "string" and kind ~= "text" and kind ~= "password" and kind ~= "url"
                        and kind ~= "email" and kind ~= "select" and kind ~= "textarea" then return invalid() end
                end
            end
        end
        count = count + 1
        local path_count = 0
        for index, part in pairs(field.path) do
            if type(index) ~= "number" or index % 1 ~= 0 or index < 1 or index > #field.path
                or type(part) ~= "string" or part == "" then return invalid() end
            path_count = path_count + 1
        end
        if path_count ~= #field.path or types.RUNTIME_CONTEXT_KEYS[field.path[1]] == true then return invalid() end
        for _, other in ipairs(fields) do
            if other ~= field and type(other) == "table" and type(other.path) == "table" then
                local prefix = true
                for i = 1, math.min(#field.path, #other.path) do
                    if field.path[i] ~= other.path[i] then prefix = false; break end
                end
                if prefix then return invalid() end
            end
        end
    end
    if count ~= #fields then return invalid() end
    return nil
end

local cached_version: string? = nil
local cached_fields: {[string]: {types.SecretField}} = {}

function M.for_impl(impl_id: string): (types.SecretField[]?, error?)
    local version, version_err = registry.current_version()
    if version_err then return nil, version_err end
    local token = tostring(version:id())
    if token ~= cached_version then
        cached_version, cached_fields = token, {}
    end
    if cached_fields[impl_id] then return cached_fields[impl_id], nil end
    local entry, err = autoinit.kind_for_impl(impl_id)
    if err and not errors.is(err, errors.NOT_FOUND) then return nil, err end
    local raw = entry and entry.meta and entry.meta.secret_fields
    if raw == nil then
        cached_fields[impl_id] = {}
        return cached_fields[impl_id], nil
    end
    local declaration_err = M.validate(raw, entry.meta.credential_schema)
    if declaration_err then return nil, declaration_err end
    cached_fields[impl_id] = raw :: types.SecretField[]
    return cached_fields[impl_id], nil
end

function M.declarations(): (types.SecretKind[]?, string?, error?)
    local result, err = funcs.call("kickside.component:kind_declaration")
    if err then return nil, nil, err end
    local snapshot = result :: types.SecretDeclarations
    local kinds: {types.SecretKind} = {}
    for _, kind in ipairs(snapshot.kinds) do
        local validation_err = M.validate(kind.meta.secret_fields, kind.meta.credential_schema)
        if validation_err then return nil, nil, validation_err end
        if #kind.meta.secret_fields > 0 then kinds[#kinds + 1] = kind end
    end
    return kinds, snapshot.version, nil
end

local function copy(value: types.JsonMap): types.JsonMap
    local result: types.JsonMap = {}
    for key, item in pairs(value) do
        result[key] = type(item) == "table" and copy(item :: types.JsonMap) or item
    end
    return result
end

local function get(value: types.JsonMap, path: {string}): unknown
    local current: unknown = value
    for _, part in ipairs(path) do
        if type(current) ~= "table" then return nil end
        current = (current :: types.JsonMap)[part]
    end
    return current
end

local function put(value: types.JsonMap, path: {string}, item: unknown): error?
    local current = value
    for i = 1, #path - 1 do
        local child = current[path[i]]
        if child ~= nil and type(child) ~= "table" then return invalid() end
        if child == nil then child = {}; current[path[i]] = child end
        current = child :: types.JsonMap
    end
    current[path[#path]] = item
    return nil
end

local function split(fields: types.SecretField[], value: types.JsonMap, stored: boolean): (types.JsonMap?, types.JsonMap?, error?)
    if #fields == 0 then return value, {}, nil end
    local visible, secrets = copy(value), {} :: types.JsonMap
    for _, field in ipairs(fields) do
        local secret = get(value, field.path)
        if secret ~= nil and type(secret) ~= "string" then
            if not stored or type(secret) ~= "table" or type((secret :: types.SecretPresence).set) ~= "boolean" then
                return nil, nil, invalid()
            end
            secret = nil
        end
        local present = type(secret) == "string" and secret ~= ""
        local secret_err = present and put(secrets, field.path, secret) or nil
        if secret_err then return nil, nil, secret_err end
        local visible_err = put(visible, field.path, {set = present})
        if visible_err then return nil, nil, visible_err end
    end
    return visible, secrets, nil
end

function M.apply(fields: types.SecretField[], value: types.JsonMap, raw: unknown): (types.JsonMap?, error?)
    if type(raw) ~= "table" then return nil, invalid() end
    local changes = raw :: {types.SecretChange}
    local count = 0
    for index, change in pairs(changes) do
        if type(index) ~= "number" or index % 1 ~= 0 or index < 1 or index > #changes
            or type(change) ~= "table" or type(change.path) ~= "table" then return nil, invalid() end
        if change.clear ~= true and type(change.value) ~= "string" then return nil, invalid() end
        if change.clear ~= nil and change.clear ~= true then return nil, invalid() end
        if change.clear == true and change.value ~= nil then return nil, invalid() end
        local declared = false
        for _, field in ipairs(fields) do
            if #change.path == #field.path then
                local equal = true
                for i, part in ipairs(field.path) do
                    if change.path[i] ~= part then equal = false; break end
                end
                if equal then declared = true; break end
            end
        end
        if not declared then return nil, invalid() end
        count = count + 1
    end
    if count ~= #changes then return nil, invalid() end
    local result = copy(value)
    for _, change in ipairs(changes) do
        local item = change.clear ~= true and change.value ~= "" and change.value or nil
        local put_err = put(result, change.path, item)
        if put_err then return nil, put_err end
    end
    return result, nil
end

function M.complete(fields: types.SecretField[], value: types.JsonMap): boolean
    for _, field in ipairs(fields) do
        local item = get(value, field.path)
        if type(item) ~= "table" or type((item :: types.SecretPresence).set) ~= "boolean" then return false end
    end
    return true
end

function M.patch(fields: types.SecretField[], value: types.JsonMap, patch: types.JsonMap, deleted: {string}?): (types.JsonMap?, error?)
    local result = copy(value)
    for key, item in pairs(copy(patch)) do result[key] = item end
    for _, key in ipairs(deleted or {}) do result[key] = nil end
    for _, field in ipairs(fields) do
        local removed = false
        for _, key in ipairs(deleted or {}) do
            if key == field.path[1] then removed = true; break end
        end
        if not removed and patch[field.path[1]] ~= nil and get(patch, field.path) == nil then
            local err = put(result, field.path, get(value, field.path))
            if err then return nil, err end
        end
    end
    return result, nil
end

function M.partition(fields: types.SecretField[], value: types.JsonMap): (types.JsonMap?, types.JsonMap?, error?)
    return split(fields, value, false)
end

function M.stored(fields: types.SecretField[], value: types.JsonMap): (types.JsonMap?, types.JsonMap?, error?)
    return split(fields, value, true)
end

local function mask_into(fields: types.SecretField[], value: types.JsonMap, visible: types.JsonMap): (types.JsonMap?, error?)
    for _, field in ipairs(fields) do
        local secret = get(value, field.path)
        local present = type(secret) == "string" and secret ~= ""
            or type(secret) == "table" and (secret :: types.SecretPresence).set == true
        local err = put(visible, field.path, {set = present})
        if err then return nil, err end
    end
    return visible, nil
end

function M.mask(fields: types.SecretField[], value: types.JsonMap): (types.JsonMap?, error?)
    if #fields == 0 then return value, nil end
    return mask_into(fields, value, copy(value))
end

function M.combine(declared: types.SecretField[], stored: types.SecretField[]): (types.SecretField[]?, error?)
    local paths: types.SecretField[] = {}
    for _, field in ipairs(stored) do paths[#paths + 1] = field end
    for _, field in ipairs(declared) do
        local found = false
        for _, previous in ipairs(paths) do
            local equal = #field.path == #previous.path
            for i, part in ipairs(field.path) do
                if previous.path[i] ~= part then equal = false; break end
            end
            if equal then found = true; break end
        end
        if not found then paths[#paths + 1] = field end
    end
    local validation_err = M.validate(paths)
    if validation_err then return nil, validation_err end
    return paths, nil
end

-- External service surfaces also mask fields awaiting the bounded migration.
-- Internal library readers need only the paths carried by the stored document.
function M.external(impl_id: string, value: types.JsonMap, stored: types.SecretField[]?): (types.JsonMap?, types.SecretField[]?, error?)
    local declared, declaration_err = M.for_impl(impl_id)
    if declaration_err then return nil, nil, declaration_err end
    local paths, path_err = M.combine(declared :: types.SecretField[], stored or {})
    if path_err then return nil, nil, path_err end
    local masked, mask_err = M.mask(paths :: types.SecretField[], value)
    return masked, paths, mask_err
end

function M.presence(fields: types.SecretField[], value: types.JsonMap): (types.JsonMap?, error?)
    return mask_into(fields, value, {})
end

function M.merge(fields: types.SecretField[], visible: types.JsonMap, secrets: types.JsonMap): (types.JsonMap?, error?)
    if #fields == 0 then return visible, nil end
    local merged = copy(visible)
    for _, field in ipairs(fields) do
        local secret = get(secrets, field.path)
        if secret ~= nil and type(secret) ~= "string" then return nil, invalid() end
        local previous = get(visible, field.path)
        if type(previous) == "string" then
            local legacy = previous ~= "" and previous or nil
            if secret ~= nil and legacy ~= secret then
                return nil, errors.new({kind = errors.INTERNAL, retryable = false,
                    message = "component secret conflicts with its encrypted document",
                    details = {code = "component_secrets_inconsistent"}})
            end
            secret = secret or legacy
        elseif previous ~= nil and (type(previous) ~= "table"
            or type((previous :: types.SecretPresence).set) ~= "boolean") then return nil, invalid() end
        local present = type(secret) == "string" and secret ~= ""
        if type(previous) == "table" and (previous :: types.SecretPresence).set ~= present then
            return nil, errors.new({kind = errors.INTERNAL, retryable = false,
                message = "component secret presence does not match its encrypted document",
                details = {code = "component_secrets_inconsistent"}})
        end
        local err = put(merged, field.path, secret)
        if err then return nil, err end
    end
    return merged, nil
end

return M
