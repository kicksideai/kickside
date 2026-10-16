local model_catalog = require("model_catalog")

local M = {}

function M.resolve(input: any): (any?, any?)
    local model = input and input.model
    if type(model) ~= "string" or model == "" then return nil end
    return model_catalog.resolve(model)
end

return M
