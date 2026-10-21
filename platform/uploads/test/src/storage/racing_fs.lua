local fs = require("fs")
local M = {}
local pending_path, pending_method, pending_callback

function M.arm(path: string, method: string, callback: () -> ()): ()
    pending_path, pending_method, pending_callback = path, method, callback
end

function M.reset(): () pending_path, pending_method, pending_callback = nil, nil, nil end

function M.get(id: string): (any?, any?)
    local native, err = fs.get(id)
    if err then return nil, err end
    local proxy = {}
    for _, method in ipairs({ "open", "readfile", "stat", "exists", "mkdir", "remove", "writefile" }) do
        proxy[method] = function(_self: any, path: string, ...: any): (any?, any?)
            if path == pending_path and method == pending_method then
                local callback = pending_callback
                M.reset()
                callback()
            end
            return native[method](native, path, ...)
        end
    end
    return proxy, nil
end

return M
