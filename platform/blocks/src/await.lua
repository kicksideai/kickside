local node = require("node")

local M = {}

type Map = { [string]: any }

local function map(value: any): Map
    return type(value) == "table" and (value :: Map) or {}
end

local function text(value: any): string
    return type(value) == "string" and value or ""
end

function M.run(args: any)
    local n, err = node.new(args)
    if err then error(err) end
    local config = map(n:config())
    -- The runtime node id is globally unique inside the Dataflow, including repeated
    -- and nested Flow expansion. Declaration ids are not, so they must never be used
    -- as durable Signal identity.
    local signal_id = text(config.signal_id)
    if signal_id == "" then signal_id = tostring(n.node_id or "") end
    local arm_id = text(config.arm_id)
    if signal_id == "" then
        return n:fail({ code = "BLOCK_SIGNAL_REQUIRED", message = "signal_id is required" }, "Block signal missing")
    end

    local inputs, input_err = n:inputs()
    if input_err then
        return n:fail({ code = "BLOCK_INPUT_FAILED", message = tostring(input_err) }, "Block input failed")
    end
    local default = map(map(inputs).default).content
    local arm_args = {
        dataflow_id = n.dataflow_id,
        node_id = n.node_id,
        signal_id = signal_id,
        input = default,
        config = map(config.block_config),
        -- Block arms are independent of visual Workflows. Preserve any execution
        -- context supplied by the caller as an opaque value so the arm owner can
        -- interpret its own correlation fields without coupling Blocks to them.
        run_context = map(config.context).run_context,
    }

    -- Both paths use Dataflow's durable signal-yield protocol. park() adds the
    -- atomic "commit wait, then invoke arm" guarantee when a Block declares an
    -- external arm; an unarmed wait has no side effect to order and uses yield().
    local wait_options: Map = {
        wait_for_signal = true,
        signal_id = signal_id,
        timeout = map(config.block_config).timeout,
    }
    local result, park_err
    if arm_id ~= "" then
        wait_options.arm = { ref = arm_id, args = arm_args }
        result, park_err = n:park(wait_options)
    else
        result, park_err = n:yield(wait_options)
    end
    if park_err then
        local detail = map(park_err)
        return n:fail({
            code = text(detail.code) ~= "" and detail.code or "BLOCK_PARK_FAILED",
            message = text(detail.message) ~= "" and detail.message or tostring(park_err),
        }, "Block wait failed")
    end
    if result == nil then return 0 end
    return n:complete(result, "Block Signal received")
end

return M
