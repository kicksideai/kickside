-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local contract = require("contract")
local security = require("security")
local object_fields = require("object_fields")

local M = {}

function M.normalize(value: any): (any?, any?)
    if value == nil then return nil, nil end
    local function invalid(): (any?, any?)
        return nil, errors.new({ kind = errors.INVALID, message = "files must be a list of content provider references with component_id, context and optional title" })
    end
    if type(value) ~= "table" then return invalid() end
    local count = 0
    for key in pairs(value) do
        if type(key) ~= "number" or key < 1 or key % 1 ~= 0 then return invalid() end
        count = count + 1
    end
    if count ~= #value then return invalid() end
    local out = {}
    for _, ref in ipairs(value) do
        if type(ref) ~= "table" or type(ref.component_id) ~= "string" or not ref.component_id:find("%S")
            or (ref.title ~= nil and type(ref.title) ~= "string")
            or (ref.context ~= nil and type(ref.context) ~= "table") then return invalid() end
        for key in pairs(ref.context or {}) do if type(key) ~= "string" then return invalid() end end
        out[#out + 1] = { component_id = ref.component_id, context = object_fields.object(ref.context), title = ref.title }
    end
    return out, nil
end

function M.open(ref: any): (any?, any?)
    local actor, scope = security.actor(), security.scope()
    if not actor or not scope then
        return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "viewer identity and scope required" })
    end
    local definition, err = contract.get("kickside.contract:content_provider")
    if err then return nil, err end
    return definition:with_actor(actor):with_scope(scope):with_context(ref.context or {}):open(ref.component_id)
end

function M.locked(err: any): boolean
    return errors.is(err, errors.PERMISSION_DENIED) or errors.is(err, errors.NOT_FOUND)
end

function M.info(ref: any): (any?, any?)
    local provider, open_err = M.open(ref)
    if open_err then return nil, open_err end
    local info, err = provider:get_info({})
    if err then return nil, err end
    if type(info) ~= "table" or info.success == false then
        return nil, errors.new({ kind = errors.INTERNAL, message = "content provider returns no file information" })
    end
    return {
        locked = false,
        filename = ref.title or info.filename,
        content_type = info.content_type,
        size = info.size,
        view_url = info.view_url,
    }, nil
end

function M.list(refs: any): (any?, any?)
    if refs == nil then return nil, nil end
    local out = {}
    for _, ref in ipairs(refs) do
        local info, err = M.info(ref)
        if err then
            if not M.locked(err) then return nil, err end
            out[#out + 1] = { locked = true }
        else
            out[#out + 1] = info
        end
    end
    return out, nil
end

return M
