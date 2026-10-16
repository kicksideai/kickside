local logger = require("logger")
local errors = require("errors")
local upload_lib = require("upload_lib")

-- on_delete for archive uploads: deleting the container deletes the member uploads
-- it produced. The members are recorded on the container metadata as child_upload_ids
-- by the processor. delete_upload runs each member's own on_delete, so a nested
-- archive cascades its grandchildren. An already-deleted member is complete;
-- another failure retains the container and its child list for retry.

local log = logger:named("uploads.archive")

local function handle(params: any): any
    local meta = type(params.metadata) == "table" and params.metadata or {}
    local children = meta.child_upload_ids
    if type(children) ~= "table" then
        return { success = true }
    end

    local removed = 0
    for _, child_id in ipairs(children) do
        if type(child_id) == "string" and child_id ~= "" then
            local deleted, err = upload_lib.delete_upload(child_id)
            if err then
                if not errors.is(err, errors.NOT_FOUND) then
                    log:warn("failed to delete archive member", { parent = params.upload_id,
                        child = child_id, error = tostring(err) })
                    if type(err) == "userdata" then return nil, err end
                    return nil, errors.new({ message = "archive member deletion failed: " .. tostring(err),
                        kind = errors.UNAVAILABLE, retryable = true })
                end
            elseif deleted then
                removed = removed + 1
            else
                return nil, errors.new({ message = "archive member deletion returned no result",
                    kind = errors.INTERNAL, retryable = true })
            end
        end
    end

    log:info("archive members deleted", { parent = params.upload_id, removed = removed })
    return { success = true, removed = removed }
end

return { handle = handle }
