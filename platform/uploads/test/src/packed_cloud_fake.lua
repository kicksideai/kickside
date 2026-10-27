local M = {}
local objects = {}
M.denied = errors.new({message = "native cloud denied", kind = errors.PERMISSION_DENIED, retryable = false})
M.failed = errors.new({message = "native download failure", kind = errors.UNAVAILABLE, retryable = true})
local sign_failure = false
function M.fail_sign(value) sign_failure = value end
local download_failure = false
function M.fail_download(value) download_failure = value end
function M.get(id)
    if id == "app:denied" then return nil, M.denied end
    local storage = {}
    function storage:upload_object(key, content)
        objects[key] = content
        return true, nil
    end
    function storage:head_object(key)
        if not objects[key] then return nil, errors.new({message = "missing object", kind = errors.NOT_FOUND}) end
        return {size = #objects[key], etag = '"version"'}, nil
    end
    function storage:download_object(key, writer, options)
        if download_failure then return nil, M.failed end
        assert(options.if_match == '"version"')
        return writer:write(objects[key])
    end
    function storage:delete_objects(keys)
        for _, key in ipairs(keys) do objects[key] = nil end
        return true, nil
    end
    function storage:presigned_get_url(key, options)
        if sign_failure then return nil, M.failed end
        return "https://objects.example/" .. key .. "?expiration=" .. options.expiration, nil
    end
    function storage:release() end
    return storage, nil
end
return M
