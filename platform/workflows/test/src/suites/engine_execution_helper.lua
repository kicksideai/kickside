local ctx = require("ctx")

local M = {}

type Map = { [string]: any }

local function copy_map(input: any): Map
    local out: Map = {}
    if type(input) ~= "table" then
        out.value = input
        return out
    end
    for k, v in pairs(input :: Map) do out[k] = v end
    return out
end

local function block_input(args: any): any
    return type(args) == "table" and (args :: Map).input or nil
end

function M.linear(input: any): Map
    local src = copy_map(block_input(input))
    local text = tostring(src.text or "")
    return {
        kind = "linear",
        text = text,
        transformed = string.upper(text) .. ":" .. tostring(src.count or ""),
        input_echo = src,
    }
end

function M.run_context(input: any): Map
    local run_context = select(1, ctx.get("run_context"))
    local dataflow_id = select(1, ctx.get("dataflow_id"))
    local node_id = select(1, ctx.get("node_id"))
    local component_id = select(1, ctx.get("component_id"))
    return {
        input_echo = copy_map(block_input(input)),
        run_context = copy_map(run_context),
        component_id = component_id,
        dataflow_id = dataflow_id,
        node_id = node_id,
    }
end

function M.decide(input: any): Map
    local src = copy_map(block_input(input))
    local amount = tonumber(src.amount) or 0
    src.amount = amount
    src.route_a = amount >= 10
    src.decided = true
    return src
end

function M.arm_a(input: any): Map
    local src = copy_map(block_input(input))
    return {
        arm = "A",
        ran_a = true,
        ran_b = false,
        amount = src.amount,
        route_a = src.route_a,
        source = src,
    }
end

function M.arm_b(input: any): Map
    local src = copy_map(block_input(input))
    return {
        arm = "B",
        ran_a = false,
        ran_b = true,
        amount = src.amount,
        route_a = src.route_a,
        source = src,
    }
end

function M.item(input: any): Map
    local src = copy_map(block_input(input))
    local value = tonumber(src.value) or 0
    return {
        item = src.name,
        value = value,
        doubled = value * 2,
    }
end

function M.item_or_fail(input: any): (Map?, string?)
    local src = copy_map(block_input(input))
    if src.fail == true then
        return nil, "intentional item failure: " .. tostring(src.name or "unnamed")
    end
    return M.item(input), nil
end

function M.lane_guard(input: any): Map
    local src = copy_map(block_input(input))
    return {
        passed_items = type(src.passed_items) == "table" and src.passed_items or {},
        outcome = src.outcome,
    }
end

-- tool_outcome is a public registry tool fixture: outcome=typed fails with a
-- typed error, outcome=domain returns a structured domain error.
function M.tool_outcome(args: any): (Map?, error?)
    local src = copy_map(args)
    if src.outcome == "typed" then
        return nil, errors.new({ kind = errors.UNAVAILABLE, message = "tool backend unavailable" })
    end
    if src.outcome == "domain" then
        return { success = false, error = "lead not found", code = "lead_not_found", lead_id = src.lead_id }
    end
    return { success = true, lead_id = src.lead_id }
end

function M.compose_brief(input: any): Map
    return copy_map(block_input(input))
end

return M
