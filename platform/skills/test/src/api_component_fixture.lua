-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- Component client seam for the skills reader: the access gate admits the actor,
-- and the component service answers with the configured service envelope.
local M = {
    ACCESS = { READ = 1, WRITE = 2, DELETE = 4, ADMIN = 8 },
}

local current: any = {}

function M.configure(value: any)
    current = type(value) == "table" and value or {}
end

function M.validate_access(_: string, required: integer): (integer, error?)
    return required, nil
end

function M.get_service(): (any, error?)
    return {
        get = function(_, request: any): (any, error?)
            return current.get(request)
        end,
    }, nil
end

return M
