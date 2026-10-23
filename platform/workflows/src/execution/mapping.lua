-- M.AUTHORING_GRAMMAR is the single public workflow-transform contract. Stored
-- mappings use the v1 `input` variable and the dataflow expr runtime evaluates
-- Go slices with zero-based indexes; this module owns both bridges so neither
-- implementation detail leaks into authoring.

local json = require("json")
local M = {}

type Map = { [string]: any }

M.AUTHORING_GRAMMAR = [[
- The only source variable is `output`, the upstream node result.
- Object fields use normal expr-lang access, for example `output.contact_id`.
- Array positions are one-based positive integer subscripts: `output.items[1]`
  selects the first item and `[2]` the second. Map keys remain field access or
  quoted string subscripts.
]]

local MODES: { [string]: boolean } = {
    expr = true,
    expr_generated = true,
    llm_runtime = true,
}

local function copy_tree(v: any): any
    if type(v) ~= "table" then return v end
    local out: Map = next(v) == nil and json.encode(v) == "{}" and table.create(0, 1) or {}
    for k, item in pairs(v :: Map) do out[k] = copy_tree(item) end
    return out
end
M.copy_tree = copy_tree

local function trim(s: string): string
    return (s:gsub("^%s+", ""):gsub("%s+$", ""))
end

local function ident_char(ch: string): boolean
    return ch:match("[%w_]") ~= nil
end

local function replace_ident(expr: string, from_name: string, to_name: string): string
    local out: { string } = {}
    local i = 1
    local quote: string? = nil
    while i <= #expr do
        local ch = expr:sub(i, i)
        if quote then
            out[#out + 1] = ch
            if ch == quote and expr:sub(i - 1, i - 1) ~= "\\" then quote = nil end
            i = i + 1
        elseif ch == "'" or ch == '"' then
            quote = ch
            out[#out + 1] = ch
            i = i + 1
        elseif expr:sub(i, i + #from_name - 1) == from_name
            and (i == 1 or not ident_char(expr:sub(i - 1, i - 1)))
            and (i + #from_name > #expr or not ident_char(expr:sub(i + #from_name, i + #from_name))) then
            out[#out + 1] = to_name
            i = i + #from_name
        else
            out[#out + 1] = ch
            i = i + 1
        end
    end
    return table.concat(out)
end

local function previous_non_space(source: string, i: integer): string
    while i >= 1 do
        local ch = source:sub(i, i)
        if not ch:match("%s") then return ch end
        i = i - 1
    end
    return ""
end

local function matching_bracket(source: string, open_at: integer): integer?
    local depth: integer = 1
    local quote: string? = nil
    local i: integer = open_at + 1
    while i <= #source do
        local ch = source:sub(i, i)
        if quote then
            if ch == quote and source:sub(i - 1, i - 1) ~= "\\" then quote = nil end
        elseif ch == "'" or ch == '"' then
            quote = ch
        elseif ch == "[" then
            depth = depth + 1
        elseif ch == "]" then
            depth = depth - 1
            if depth == 0 then return i end
        end
        i = i + 1
    end
    return nil
end

-- expr-lang indexes Go slices from zero, whereas the workflow grammar is
-- deliberately one-based. Only numeric literal subscripts are array positions;
-- quoted subscripts continue to address map keys unchanged.
local function rebase_array_subscripts(source: string): string
    local out: { string } = {}
    local quote: string? = nil
    local i: integer = 1
    while i <= #source do
        local ch = source:sub(i, i)
        if quote then
            out[#out + 1] = ch
            if ch == quote and source:sub(i - 1, i - 1) ~= "\\" then quote = nil end
            i = i + 1
        elseif ch == "'" or ch == '"' then
            quote = ch
            out[#out + 1] = ch
            i = i + 1
        elseif ch == "[" then
            local close_at = matching_bracket(source, i)
            if not close_at then
                out[#out + 1] = ch
                i = i + 1
            else
                local content = source:sub(i + 1, (close_at - 1) :: integer)
                local rebased_content = rebase_array_subscripts(content)
                local previous = previous_non_space(source, i - 1)
                local literal_index = rebased_content:match("^%s*(%d+)%s*$")
                local is_subscript = previous ~= "" and
                    (ident_char(previous) or previous == ")" or previous == "]")
                if is_subscript and literal_index then
                    out[#out + 1] = "[" .. tostring((tonumber(literal_index) or 0) - 1) .. "]"
                else
                    out[#out + 1] = "[" .. rebased_content .. "]"
                end
                i = close_at + 1
            end
        else
            out[#out + 1] = ch
            i = i + 1
        end
    end
    return table.concat(out)
end

function M.output_to_input(expr: string): string
    return replace_ident(expr, "output", "input")
end

function M.input_to_output(expr: string): string
    return replace_ident(expr, "input", "output")
end

local function empty_mapping(): Map
    return {}
end

function M.normalize(raw: any): (Map?, string?)
    if raw == nil then return empty_mapping(), nil end
    if type(raw) == "string" then
        local expr = trim(raw :: string)
        if expr == "" then return empty_mapping(), nil end
        return { v = 1, mode = "expr", expr = M.output_to_input(expr) }, nil
    end
    if type(raw) ~= "table" then return nil, "mapping must be an expression string or mapping v1" end

    local src = raw :: Map
    if next(src) == nil then return empty_mapping(), nil end

    if tonumber(src.v) == 1 then
        local out = copy_tree(src) :: Map
        local mode = type(out.mode) == "string" and tostring(out.mode) or "expr"
        if not MODES[mode] then return nil, "mapping mode unsupported: " .. mode end
        out.v = 1
        out.mode = mode
        if mode == "expr" or mode == "expr_generated" then
            if type(out.expr) ~= "string" or trim(out.expr) == "" then return nil, "mapping expr is required" end
            out.expr = M.output_to_input(trim(out.expr))
        end
        return out, nil
    end

    return nil, "mapping v1 is required"
end

function M.expr(raw: any): (string, string?)
    local spec, err = M.normalize(raw)
    if not spec then return "", err end
    if type(spec.expr) == "string" then return spec.expr, nil end
    return "", nil
end

function M.engine_expr(raw: any): (string?, string?)
    local expr, err = M.expr(raw)
    if err then return nil, err end
    if expr == "" then return nil, nil end
    return rebase_array_subscripts(M.input_to_output(expr)), nil
end

-- Failed-edge transforms use the same public authoring grammar as ordinary
-- mappings. Dataflow evaluates those targets against `{ error = ... }`, so the
-- compiler must bridge the public `output` root to `error` instead of leaking a
-- second mapping language into the canvas.
function M.engine_error_expr(raw: any): (string?, string?)
    local expr, err = M.expr(raw)
    if err then return nil, err end
    if expr == "" then return nil, nil end
    return rebase_array_subscripts(replace_ident(expr, "input", "error")), nil
end

return M
