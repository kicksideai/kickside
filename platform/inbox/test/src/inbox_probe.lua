local inbox_reader = require("inbox_reader")

local M = {}

function M.read(input: any): (any?, any?)
    if type(input) ~= "table" or type(input.id) ~= "string" then
        return nil, "id is required"
    end
    return inbox_reader.get(input.id)
end

return M
