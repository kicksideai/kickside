-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local sql = require("sql")
local json = require("json")
type DB = sql.DB
type Transaction = sql.Transaction
local M = {reads = 0, calls = 0, context = {}, decodes = 0, api_key = "fixture-cache-secret", model = "wire-model",
    provider_id = "wippy.llm.openai_compat:provider"}

M.encode = json.encode
M.type = sql.type
function M.decode(raw)
    M.decodes = M.decodes + 1
    return json.decode(raw)
end

function M.get(id)
    M.reads = M.reads + 1
    return sql.get(id)
end

function M.open(id, context)
    M.context = context
    assert(id == M.provider_id)
    assert(context.api_key == M.api_key)
    assert(context.base_url == "https://provider.example.test/v1")
    if M.open_error then return nil, M.open_error end
    local function invoke(_, input)
        assert(input.model == M.model)
        M.calls = M.calls + 1
        if M.response ~= nil or M.failure ~= nil then return M.response, M.failure end
        return {success = true}
    end
    return {status = invoke, generate = invoke, embed = invoke, structured_output = invoke, evaluate = invoke}
end

return M
