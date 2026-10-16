-- kickside.data:writable sink that logs each written item to the runtime console.
local logger = require("logger")

local log = logger:named("labdemo.console")

local function fail(message)
    return { success = false, result = "noop", error = { code = "sink_error", message = tostring(message), retriable = false, scope = "sink" } }
end

local function write(req)
    req = type(req) == "table" and req or {}
    local config = type(req.config) == "table" and req.config or {}
    local input = type(req.input) == "table" and req.input or {}

    local sink_op = type(req.sink_op) == "string" and req.sink_op or "upsert"
    if sink_op ~= "upsert" then return fail("unsupported sink operation: " .. sink_op) end

    local content = input.content
    if content == nil or content == "" then return fail("write requires input.content") end

    local label = config.label
    if type(label) ~= "string" or label == "" then label = "LAB" end

    log:info("console write", { label = label, content = tostring(content), key = req.idempotency_key })
    return { success = true, result = "created", dest_ref = { label = label } }
end

return { write = write }
