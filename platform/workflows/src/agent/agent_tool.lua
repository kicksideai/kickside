-- One actor-scoped Flow capability for agents: a compact catalog prompt and one
-- generic run_flow tool. Discovery and execution share the same catalog policy.

local ctx = require("ctx")
local execution = require("execution")
local schema_validate = require("schema_validate")
local published_catalog = require("published_catalog")
local exact_flow_ref = require("flow_ref")
local tool_result = require("tool_result")

local M = {}

type Map = { [string]: any }

M._execute = function(flow_ref: any, input: any, opts: any): (Map?, error?)
    return execution.run(flow_ref, type(input) == "table" and input or {}, opts)
end
M._context_get = function(key: string): any return ctx.get(key) end
M._catalog = function(args: any?): ({ Map }?, error?) return published_catalog.catalog(args) end
M._validate_start_input = function(schema: any, input: any): string?
    return schema_validate.validate(schema, input, "input")
end

local function str(value: any): string return type(value) == "string" and value or "" end
local function map(value: any): Map return type(value) == "table" and (value :: Map) or {} end

local function flow_run_schema(): Map
    return {
        ["$schema"] = "https://json-schema.org/draft/2020-12/schema",
        type = "object",
        additionalProperties = false,
        required = { "flow_ref", "input" },
        properties = {
            flow_ref = {
                type = "object",
                additionalProperties = false,
                required = { "kind", "id", "version" },
                properties = {
                    kind = { const = "flow" },
                    id = { type = "string", minLength = 1 },
                    version = { type = "integer", minimum = 1 },
                },
                description = "Exact reference copied from the Flow catalog.",
            },
            input = {
                type = "object",
                additionalProperties = true,
                description = "Arguments matching the selected Flow's Start interface.",
            },
        },
    }
end

function M.catalog(args: any?): ({ Map }?, error?)
    return M._catalog(args)
end

local function clipped_text(value: any, max_len: number): string
    local text = str(value):gsub("%s+", " "):gsub("^%s+", ""):gsub("%s+$", "")
    if #text > max_len then return text:sub(1, math.max(1, max_len - 1)) .. "…" end
    return text
end

local function schema_type(schema: any): string
    local s = map(schema)
    local kind = s.type
    if type(kind) == "string" and kind ~= "" then
        if kind == "array" then
            local item_kind = schema_type(s.items)
            return item_kind ~= "value" and ("array<" .. item_kind .. ">") or "array"
        end
        return kind
    end
    if type(s.enum) == "table" then return "enum" end
    if type(s.oneOf) == "table" or type(s.anyOf) == "table" then return "union" end
    return "value"
end

local function schema_summary(schema: any): string
    local s = map(schema)
    local props = map(s.properties)
    local required: { [string]: boolean } = {}
    for _, key in ipairs(type(s.required) == "table" and s.required or {}) do
        if type(key) == "string" then required[key] = true end
    end
    local keys: { string } = {}
    for key, _ in pairs(props) do if type(key) == "string" then keys[#keys + 1] = key end end
    table.sort(keys)
    if #keys == 0 then return s.additionalProperties == true and "{ … }" or "{}" end
    local fields: { string } = {}
    for index, key in ipairs(keys) do
        if index > 6 then fields[#fields + 1] = "…"; break end
        fields[#fields + 1] = key .. (required[key] and "" or "?") .. ": " .. schema_type(props[key])
    end
    return "{ " .. table.concat(fields, ", ") .. " }"
end

local function catalog_prompt(entries: any): string
    local lines: { string } = {
        "## Available Flows",
        "Use `run_flow` with an exact `flow_ref` and matching Start input. Use WorkflowsRead action=list with published=true to discover more Flows. Report only actual tool output.",
    }
    local catalog = type(entries) == "table" and entries or {}
    if #catalog == 0 then
        lines[#lines + 1] = "This catalog page has no published Flows. Use WorkflowsRead action=list with published=true to continue discovery."
        return table.concat(lines, "\n")
    end
    for _, raw in ipairs(catalog) do
        local entry = map(raw)
        local ref = map(entry.flow_ref)
        local title = clipped_text(entry.title, 96)
        local description = clipped_text(entry.description, 160)
        local summary = "- `{kind: \"flow\", id: \"" .. str(ref.id) .. "\", version: "
            .. tostring(ref.version) .. "}` — " .. title
        if description ~= "" then summary = summary .. ": " .. description end
        summary = summary .. " | Start: " .. schema_summary(entry.input_schema)
            .. " | Finish: " .. schema_summary(entry.output_schema)
        lines[#lines + 1] = summary
    end
    return table.concat(lines, "\n")
end

function M.build(_base_prompt: any, _context: any): (Map?, any)
    local entries, err = M.catalog({limit = 10})
    if err then return nil, err end
    return {
        prompt = catalog_prompt(entries),
        tools = {{
            id = "kickside.workflows.agent:flow_run_tool",
            alias = "run_flow",
            description = "Run one exact published Flow from the actor-scoped catalog.",
            schema = flow_run_schema(),
        }},
    }
end

local function catalog_entry(ref: Map): (Map?, error?)
    local entries, err = M.catalog({id = ref.id, limit = 1})
    if err then return nil, err end
    for _, raw in ipairs(entries or {}) do
        local entry = map(raw)
        local candidate, candidate_err = exact_flow_ref.validate(entry.flow_ref)
        if not candidate_err and candidate and candidate.id == ref.id and candidate.version == ref.version then
            return entry, nil
        end
    end
    return tool_result.fail(errors.NOT_FOUND, "Flow is not published and callable at the requested version")
end

local function output_result(sample: any): any
    local result = map(sample)
    if result.result ~= nil then return result.result end
    return sample
end

-- flow_run_handler returns the Flow's output; a run that ends failed is the
-- tool's domain error carrying its run_id.
function M.flow_run_handler(args: any): (any?, error?)
    local a = map(args)
    local ref, ref_err = exact_flow_ref.validate(a.flow_ref)
    if ref_err or not ref then return nil, ref_err end
    if type(a.input) ~= "table" then return tool_result.fail(errors.INVALID, "input must be an object") end

    local entry, entry_err = catalog_entry(ref)
    if not entry then return nil, entry_err end
    local input_err = M._validate_start_input(entry.input_schema, a.input)
    if input_err then return tool_result.fail(errors.INVALID, "input does not match Start schema: " .. tostring(input_err)) end

    local run_opts: Map = {
        mode = "sync",
        trigger_kind = "agent_flow",
        trigger_id = "agent_flow",
    }
    local session_id = str(M._context_get("session_id"))
    if session_id ~= "" then run_opts.session_id = session_id end
    local descriptor, run_err = M._execute(ref, a.input, run_opts)
    if run_err then return nil, run_err end
    if not descriptor then return tool_result.fail(errors.INTERNAL, "Flow execution returned no descriptor") end
    if str(descriptor.run_id) == "" then return tool_result.fail(errors.INTERNAL, "Flow execution returned no run_id") end
    if descriptor.success == false then
        return tool_result.domain_error(str(descriptor.error) ~= "" and descriptor.error or "Flow execution failed",
            { run_id = descriptor.run_id })
    end
    return output_result(descriptor.data), nil
end

return M
