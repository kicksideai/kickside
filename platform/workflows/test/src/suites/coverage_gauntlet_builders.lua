type Map = { [string]: any }

local function doc(nodes: any, edges: any): Map
    return { nodes = nodes, edges = edges or {}, params = {} }
end

local function n(id: string, kind: string, extra: any): Map
    local out: Map = { id = id, kind = kind }
    if type(extra) == "table" then
        for k, v in pairs(extra :: Map) do out[k] = v end
    end
    return out
end

local function fn(id: string, extra: any?): Map
    local out = n(id, "block", extra)
    local function_id = tostring(out.ref or "")
    local name = function_id:match("^app:(.+)$") or "engine_linear"
    out.ref = "app:block." .. name
    out.config = type(out.config) == "table" and out.config or {}
    if out.title == nil then out.title = "Prepare" end
    return out
end

local function agent_step(id: string, extra: any?): Map
    local out = n(id, "block", extra)
    out.ref = "app:block.configurable_agent"
    out.config = type(out.config) == "table" and out.config or {}
    return out
end

local function wait_step(id: string, extra: any?): Map
    local out = n(id, "block", extra)
    out.ref = "app:block.test_external_wait"
    out.config = type(out.config) == "table" and out.config or {}
    return out
end

local function e(id: string, source: string, target: string, extra: any): Map
    local out: Map = { id = id, source_id = source, target_id = target }
    if type(extra) == "table" then
        for k, v in pairs(extra :: Map) do out[k] = v end
    end
    return out
end

return { doc = doc, n = n, fn = fn, agent_step = agent_step, wait_step = wait_step, e = e }
