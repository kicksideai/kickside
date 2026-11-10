local security = require("security")
local component = require("component")
local upload_tokens = require("upload_tokens")
local types = require("types")

-- The read rule for an upload's original bytes, its derived artifacts and its
-- page map. A caller reads an upload when it presents a read token for it, is
-- its uploader, holds READ on the uploader's uploads component, or holds READ
-- on a component that references the upload through meta.upload_id.

local M = {}

M.UNAUTHENTICATED = "unauthenticated"
M.DENIED = "denied"

type Options = { token: string?, artifact_id: string | boolean | nil }

-- check(upload, opts?) -> nil when the caller may read the upload, else a
-- denial code (UNAUTHENTICATED or DENIED) or an error the decision could not
-- be made through. opts.token is checked against opts.artifact_id: an artifact
-- id, or false for the upload root.
function M.check(upload: any, opts: Options?): (string?, error?)
    local options: Options = opts or {}
    local token = options.token
    if type(token) == "string" and token ~= "" then
        local scope = options.artifact_id
        if scope == nil then scope = false end
        if upload_tokens.unpack_read(token, { upload_id = upload.uuid, artifact_id = scope }) then return nil, nil end
    end

    local actor = security.actor()
    local actor_id = actor and actor:id() or nil
    if type(actor_id) ~= "string" or actor_id == "" then return M.UNAUTHENTICATED, nil end
    if upload.actor_id == actor_id then return nil, nil end

    local component_id = types.component_id_for_owner(upload.actor_id)
    if not component_id then
        return nil, errors.new({ kind = errors.INTERNAL, message = "Upload owner is invalid" })
    end
    local _, owner_err = component.validate_access(component_id, component.ACCESS.READ)
    if not owner_err then return nil, nil end
    if not errors.is(owner_err, errors.PERMISSION_DENIED) and not errors.is(owner_err, errors.NOT_FOUND) then
        return nil, owner_err
    end

    local referencing, count_err = component.count({
        meta = { upload_id = tostring(upload.uuid) },
        access_mask = component.ACCESS.READ,
    })
    if count_err then return nil, count_err end
    if (tonumber(referencing) or 0) > 0 then return nil, nil end
    return M.DENIED, nil
end

return M
