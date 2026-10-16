local registry = require("registry")
local fixture = require("fixture")
local M = {}
function M.find(filter: table): (any, error?)
    local stage = fixture.stage
    if stage == "binding" then return nil, fixture.source end
    if stage == "missing_bindings" then return nil, nil end
    if stage == "scalar_bindings" then return true, nil end
    if stage == "scalar_binding" then return {true}, nil end
    local row = {id = filter[".id"], kind = "contract.binding"}
    if stage == "sparse_bindings" then return {[2] = row}, nil end
    if stage == "keyed_bindings" then return {named = row}, nil end
    if stage == "extra_bindings" then return {row, row}, nil end
    if stage == "empty_bindings" then return {}, nil end
    return registry.find(filter)
end
return M
