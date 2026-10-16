local security = require("security")
local sql = require("sql")
local component_types = require("component_types")

local M = {}

local function read_error(cause: error): error
    return (errors.wrap(cause, "component implementation read failed") :: error)
end

function M.narrow(db: any, query: any, candidate_query: any?): (any?, error?)
    local candidates = candidate_query or sql.builder.select("DISTINCT impl_id"):from(component_types.TABLES.COMPONENTS)
    local rows, err = candidates:run_with(db):query()
    if err then return nil, read_error(err) end
    local permitted, placeholders = {}, {}
    for _, row in ipairs(rows or {}) do
        if security.can("registry.get", row.impl_id) then
            permitted[#permitted + 1] = row.impl_id
            placeholders[#placeholders + 1] = "?"
        end
    end
    if #permitted == 0 then return query:where("1 = 0"), nil end
    return query:where("c.impl_id IN (" .. table.concat(placeholders, ",") .. ")", unpack(permitted)), nil
end

function M.check(db: any, component_id: string): (boolean, error?)
    local rows, err = sql.builder.select("impl_id"):from(component_types.TABLES.COMPONENTS)
        :where("component_id = ?", component_id):run_with(db):query()
    if err then return false, read_error(err) end
    return rows and rows[1] ~= nil and security.can("registry.get", rows[1].impl_id), nil
end

return M
