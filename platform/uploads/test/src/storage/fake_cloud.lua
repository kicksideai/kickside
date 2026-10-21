local M = {}
local objects = {}
local mode = "normal"
local uploads = 0

function M.reset(value: string): () mode = value; objects = {}; uploads = 0 end
function M.set_mode(value: string): () mode = value end
function M.upload_count(): number return uploads end
function M.bytes(key: string): string? return objects[key] end

function M.get(_id: string): any
    local storage = {}
    function storage:upload_object(key: string, reader: any, _options: any): (any?, any?)
        uploads = uploads + 1
        if mode == "upload_error" then return nil, errors.new({ message = "test network interruption", kind = errors.UNAVAILABLE, retryable = true }) end
        local chunks = {}
        while true do
            local chunk, err = reader:read(1024 * 1024)
            if err then
                if errors.is(err, errors.NOT_FOUND) then break end
                return nil, err
            end
            if not chunk or #chunk == 0 then break end
            chunks[#chunks + 1] = chunk
        end
        local content = table.concat(chunks)
        objects[key] = mode == "corrupt" and ("!" .. content:sub(2)) or content
        return true, nil
    end
    function storage:head_object(key: string): (any?, any?)
        local content = objects[key]
        if content == nil then return nil, errors.new({ message = "not found", kind = errors.NOT_FOUND }) end
        return { size = #content, etag = '"fake-etag"' }, nil
    end
    function storage:download_object(key: string, writer: any, options: any): (any?, any?)
        if options.if_match ~= '"fake-etag"' then return nil, "unpinned download" end
        local _, err = writer:write(objects[key])
        return err == nil, err
    end
    function storage:delete_objects(keys: { string }): (boolean, any?)
        for _, key in ipairs(keys) do objects[key] = nil end
        return true, nil
    end
    function storage:release(): () end
    return storage
end

return M
