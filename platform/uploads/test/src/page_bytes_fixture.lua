-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local M: {stage: string, err: error?, closed: boolean} = {stage = "", closed = false}

function M.get_storage(_id: string)
    if M.stage == "acquire" then return nil, M.err end
    local storage = {}
    function storage:stat(_path: string)
        if M.stage == "stat" then return nil, M.err end
        return {size = 0}, nil
    end
    function storage:open(_path: string, _mode: string)
        if M.stage == "open" then return nil, M.err end
        local file = {}
        function file:read(_length: integer): (string?, error?)
            if M.stage == "read" then return nil, M.err end
            return "", nil
        end
        function file:close(): (boolean?, error?)
            M.closed = true
            if M.stage == "close" then return nil, M.err end
            return true, nil
        end
        return file, nil
    end
    return storage, nil
end

return M
