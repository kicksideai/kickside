local inbox_reader = require("inbox_reader")

local M = {}

function M.read(input: any): (any?, any?)
    if type(input) == "table" and input.list == true then
        local items, err = inbox_reader.query():all()
        if err then return nil, err end
        local counts, count_err = inbox_reader.counts()
        if count_err then return nil, count_err end
        return { items = items, counts = counts }, nil
    end
    if type(input) ~= "table" or type(input.id) ~= "string" then
        return nil, "id is required"
    end
    return inbox_reader.get(input.id)
end

return M
