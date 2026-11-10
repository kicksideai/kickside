local http = require("http")
local security = require("security")
local uploads_resources = require("uploads_resources")

local upload_query_repo = require("upload_query_repo")
local component = require("component")
local access_policy = require("access_policy")
local execution_identity = require("execution_identity")
local upload_tokens = require("upload_tokens")
local types = require("types")
local http_errors = require("http_errors")

-- Stream original bytes after verifying upload access or an authorized reference.
local function raw_handler()
    local req = http.request()
    local res = http.response()
    if not req or not res then
        return nil, "Failed to get HTTP context"
    end

    local uuid = req:param("uuid")
    if not uuid or uuid == "" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:set_content_type(http.CONTENT.JSON)
        res:write_json({ success = false, error = "Upload ID is required" })
        return
    end

    local upload, err = upload_query_repo.get(uuid)
    if err or not upload then
        res:set_status(http.STATUS.NOT_FOUND)
        res:set_content_type(http.CONTENT.JSON)
        res:write_json({ success = false, error = "Upload not found" })
        return
    end

    local bearer_ok = false
    local token = req:query("token")
    if type(token) == "string" and token ~= "" then
        local cap = upload_tokens.unpack_read(token, { upload_id = uuid, artifact_id = false })
        bearer_ok = cap ~= nil
    end
    -- The upload actor always reads their own bytes. Otherwise the upload may be exposed
    -- through a shared component (e.g. a workspace file component carrying
    -- meta.upload_id): honor component READ so a recipient of a shared file can
    -- actually fetch it, instead of 403-ing on the blob while the component is shared.
    if not bearer_ok then
        local actor = security.actor()
        if not actor then
            res:set_status(http.STATUS.UNAUTHORIZED)
            res:set_content_type(http.CONTENT.JSON)
            res:write_json({ success = false, error = "Authentication required" })
            return
        end
        local actor_id = actor:id()
        if upload.actor_id == actor_id then
            bearer_ok = true
        end
    end
    local container_id = types.component_id_for_owner(upload.actor_id)
    if not bearer_ok then
        if not container_id then
            res:set_status(http.STATUS.INTERNAL_ERROR)
            res:set_content_type(http.CONTENT.JSON)
            res:write_json({ success = false, error = "Upload owner is invalid" })
            return
        end
        local _, container_err = component.validate_access(container_id, component.ACCESS.READ)
        if not container_err then
            bearer_ok = true
        elseif not errors.is(container_err, errors.PERMISSION_DENIED) and not errors.is(container_err, errors.NOT_FOUND) then
            res:set_status(http_errors.classify(container_err))
            res:set_content_type(http.CONTENT.JSON)
            res:write_json({ success = false, error = tostring(container_err) })
            return
        end
    end
    if not bearer_ok then
        local references, reference_err = component.query({meta = {upload_id = uuid},
            access_mask = component.ACCESS.READ, include = {meta = false}})
        if reference_err then
            res:set_status(http_errors.classify(reference_err))
            res:set_content_type(http.CONTENT.JSON)
            res:write_json({success = false, error = tostring(reference_err)})
            return
        end
        for _, reference in ipairs(references or {}) do
            local context, context_err = component.get_private_context(reference.component_id)
            if context_err then
                res:set_status(http_errors.classify(context_err))
                res:set_content_type(http.CONTENT.JSON)
                res:write_json({success = false, error = tostring(context_err)})
                return
            end
            -- Public metadata cannot establish who authorizes a reference. Core
            -- captures this principal at creation and rejects generic writes to it.
            local captured = context and context._execution_identity
            if captured and captured.principal then
                local principal, principal_err = execution_identity.check_principal(captured.principal, "reference creator")
                if principal_err then
                    res:set_status(http_errors.classify(principal_err))
                    res:set_content_type(http.CONTENT.JSON)
                    res:write_json({success = false, error = tostring(principal_err)})
                    return
                end
                if execution_identity.actor_key(principal) == upload.actor_id then
                    bearer_ok = true
                    break
                end
                local masks, masks_err = component.principal_masks_system(principal, {container_id})
                if masks_err then
                    res:set_status(http_errors.classify(masks_err))
                    res:set_content_type(http.CONTENT.JSON)
                    res:write_json({success = false, error = tostring(masks_err)})
                    return
                end
                if access_policy.has_all((masks or {})[container_id] or 0, component.ACCESS.READ) then
                    bearer_ok = true
                    break
                end
            end
        end
        if not bearer_ok then
            res:set_status(http.STATUS.FORBIDDEN)
            res:set_content_type(http.CONTENT.JSON)
            res:write_json({success = false, error = "Access denied"})
            return
        end
    end

    local storage = uploads_resources.get_storage(upload.storage_id :: string)
    if not storage or not storage:exists(upload.storage_path) then
        res:set_status(http.STATUS.NOT_FOUND)
        res:set_content_type(http.CONTENT.JSON)
        res:write_json({ success = false, error = "File not in storage" })
        return
    end
    local file, open_err = storage:open(upload.storage_path :: string, "r")
    if open_err or not file then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:set_content_type(http.CONTENT.JSON)
        res:write_json({ success = false, error = "Failed to read file" })
        return
    end

    res:set_content_type(upload.mime_type or "application/octet-stream")
    res:set_status(http.STATUS.OK)
    while true do
        local chunk, read_err = file:read(1024 * 1024)
        if read_err then
            if errors.is(read_err, errors.NOT_FOUND) then break end
            file:close(); return nil, read_err
        end
        if not chunk or #chunk == 0 then break end
        local _, write_err = res:write(chunk)
        if write_err then file:close(); return nil, write_err end
    end
    local _, close_err = file:close()
    if close_err then return nil, close_err end
end

return {
    raw_handler = raw_handler
}
