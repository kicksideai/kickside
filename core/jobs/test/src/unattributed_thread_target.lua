-- Job worker_ref target that creates a thread under whatever frame dispatch
-- gives it, without binding an owner identity.
local contract = require("contract")

local function run(input: any): (any?, error?)
    local payload = type(input) == "table" and input.payload or {}
    local def, def_err = contract.get("kickside.core:threads")
    if def_err or not def then return nil, def_err end
    local threads, open_err = (def :: any):open()
    if open_err or not threads then return nil, open_err end
    local created, create_err = (threads :: any):create({ thread_class = tostring(payload.thread_class) })
    if create_err then return nil, create_err end
    return { thread_id = created.thread_id }, nil
end

return { run = run }
