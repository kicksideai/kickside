local M = {}
function M.find(filter: any): (any?, string?)
    if filter[".id"] == "test:collision_a" or filter[".id"] == "test:collision_b" then
        return { { id = filter[".id"], meta = { type = "tool", llm_alias = "shared_alias" } } }, nil
    end
    if filter[".id"] == "test:reserved_alias" then
        return { { id = filter[".id"], meta = { type = "tool", llm_alias = "session_info" } } }, nil
    end
    local schemas = { ["test:broken_schema"] = "{broken", ["test:scalar_schema"] = "42", ["test:array_schema"] = "[]" }
    local schema = schemas[filter[".id"]]
    if schema then return { { id = filter[".id"], meta = { type = "tool", input_schema = schema } } }, nil end
    return nil, "catalog unavailable"
end
function M.find_tools(_: any): (nil, string)
    return nil, "tool namespace unavailable"
end
return M
