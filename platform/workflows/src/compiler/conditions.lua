-- Compiles an edge predicate into the engine expr DSL (expr-lang). Canvas edges
-- own their predicates: a bare field ref binds to `output.<field>` (the producing
-- node's result), so `status == 'approved'` lowers to `output.status == 'approved'`.
-- A cycle node's continue_condition reads accumulated state, so bare refs there bind
-- to `state.<field>` (with `iteration` left free). Non-exclusive engine fan-out
-- (node.lua:525-577) means a conditional split must emit a condition AND its
-- negation, so `negate` is part of the surface.

local M = {}

local KEYWORDS: { [string]: boolean } = {
    ["true"] = true, ["false"] = true, ["nil"] = true, ["null"] = true,
    iteration = true, output = true, input = true, inputs = true,
    state = true, result = true, error = true, node = true, last_result = true,
    ["in"] = true, contains = true, startsWith = true, len = true,
    all = true, any = true, none = true,
}

local function snake(s: string): string
    local out = s:gsub("[^%w]+", "_"):gsub("^_+", ""):gsub("_+$", "")
    return out:lower()
end

local function trim(s: string): string
    return (s:gsub("^%s+", ""):gsub("%s+$", ""))
end

-- Split at paren depth zero, outside string literals. Every walk over a
-- predicate goes through this: a split that ignores grouping hands its operands
-- an unbalanced paren, which `qualify` then reads as part of a field name.
local function split_top(expr: string, op: string): { string }
    local parts: { string } = {}
    local depth = 0
    local quote: string? = nil
    local start = 1
    local i = 1
    while i <= #expr do
        local ch = expr:sub(i, i)
        if quote then
            if ch == quote and expr:sub(i - 1, i - 1) ~= "\\" then quote = nil end
            i = i + 1
        elseif ch == "'" or ch == '"' then
            quote = ch
            i = i + 1
        elseif ch == "(" then
            depth = depth + 1
            i = i + 1
        elseif ch == ")" then
            if depth > 0 then depth = depth - 1 end
            i = i + 1
        elseif depth == 0 and expr:sub(i, i + 1) == op then
            parts[#parts + 1] = trim(expr:sub(start, i - 1))
            i = i + 2
            start = i
        else
            i = i + 1
        end
    end
    parts[#parts + 1] = trim(expr:sub(start))
    return parts
end

-- True when the whole expression is a single parenthesised group, so the
-- compiler descends into it instead of splitting through its closing paren.
local function is_group(expr: string): boolean
    if expr:sub(1, 1) ~= "(" then return false end
    local depth = 0
    local quote: string? = nil
    local i = 1
    while i <= #expr do
        local ch = expr:sub(i, i)
        if quote then
            if ch == quote and expr:sub(i - 1, i - 1) ~= "\\" then quote = nil end
        elseif ch == "'" or ch == '"' then
            quote = ch
        elseif ch == "(" then
            depth = depth + 1
        elseif ch == ")" then
            depth = depth - 1
            if depth == 0 then return i == #expr end
        end
        i = i + 1
    end
    return false
end

-- Qualify one operand: numbers, string/bool/keyword literals and already-dotted or
-- already-rooted refs pass through; a bare field ref is prefixed with the root.
local function qualify(root: string, token: string): string
    local t = trim(token)
    if t == "" then return t end
    if t:match("^!") then return "!" .. qualify(root, t:sub(2)) end
    if t:match("^%-?%d+%.?%d*$") then return t end
    if t:match("^'.*'$") or t:match('^".*"$') then return t end
    if t:match("^%[") then return t end
    if root == "output" and t:match("^state%.") then return "output." .. t end
    if t:find("%.") then return t end
    local head = t:match("^([%w_]+)")
    if head and KEYWORDS[head] then return t end
    return root .. "." .. snake(t)
end

-- Split one clause on its comparison operator at depth zero and outside string
-- literals, so a comparison inside a call or a quoted literal is left alone.
local function split_clause(clause: string): (string?, string?, string?)
    local depth = 0
    local quote: string? = nil
    local i = 1
    while i <= #clause do
        local ch = clause:sub(i, i)
        if quote then
            if ch == quote and clause:sub(i - 1, i - 1) ~= "\\" then quote = nil end
            i = i + 1
        elseif ch == "'" or ch == '"' then
            quote = ch
            i = i + 1
        elseif ch == "(" then
            depth = depth + 1
            i = i + 1
        elseif ch == ")" then
            if depth > 0 then depth = depth - 1 end
            i = i + 1
        elseif depth == 0 then
            local two = clause:sub(i, i + 1)
            if two == ">=" or two == "<=" or two == "==" or two == "!=" then
                return clause:sub(1, i - 1), two, clause:sub(i + 2)
            end
            if ch == ">" or ch == "<" then
                return clause:sub(1, i - 1), ch, clause:sub(i + 1)
            end
            i = i + 1
        else
            i = i + 1
        end
    end
    return nil, nil, nil
end

local compile_expr: (string, string) -> string

local function compile_clause(fragment: string, root: string): string
    local frag = trim(fragment)
    if frag == "" then return "" end
    if is_group(frag) then return "(" .. compile_expr(frag:sub(2, -2), root) .. ")" end
    if frag:sub(1, 1) == "!" then
        local inner = trim(frag:sub(2))
        if is_group(inner) then return "!(" .. compile_expr(inner:sub(2, -2), root) .. ")" end
    end

    local lhs, op, rhs = split_clause(frag)
    if op then
        return qualify(root, lhs :: string) .. " " .. op .. " " .. qualify(root, rhs :: string)
    end

    local neg = frag:match("^!%s*") ~= nil
    local core = (frag:gsub("^!%s*", ""))
    if root == "output" and core:match("^state%.[%w_]+$") then
        local q = "output." .. core .. " == 1"
        return neg and ("!(" .. q .. ")") or q
    end
    return qualify(root, frag)
end

local function compile_parts(parts: { string }, root: string, sep: string): string
    local out: { string } = {}
    for _, part in ipairs(parts) do
        local compiled = compile_expr(part, root)
        if compiled ~= "" then out[#out + 1] = compiled end
    end
    return table.concat(out, sep)
end

compile_expr = function(expr: string, root: string): string
    local e = trim(expr)
    if e == "" then return "" end
    local or_parts = split_top(e, "||")
    if #or_parts > 1 then return compile_parts(or_parts, root, " || ") end
    local and_parts = split_top(e, "&&")
    if #and_parts > 1 then return compile_parts(and_parts, root, " && ") end
    return compile_clause(e, root)
end

-- compile(cond, root) -> engine expr string. root is "output" (edge predicates) or
-- "state" (cycle continue conditions). A blank/absent predicate is the constant true.
function M.compile(cond: any, root: string): string
    if type(cond) ~= "string" then return "true" end
    local c = (cond :: string)
    c = c:gsub("%f[%w]and%f[%W]", "&&")
    c = c:gsub("%f[%w]or%f[%W]", "||")
    c = c:gsub("%f[%w]not%f[%W]", "!")
    c = trim(c)
    if c == "" then return "true" end
    return compile_expr(c, root)
end

local function wrap_not(expr: string): string
    local e = trim(expr)
    if e == "true" then return "false" end
    if e == "false" then return "true" end
    if e:match("^!%s*%(") and e:sub(-1) == ")" then
        return trim(e:gsub("^!%s*%(", ""):sub(1, -2))
    end
    return "!(" .. e .. ")"
end

-- negate(expr) returns the explicit disjoint else/fallthrough predicate. Compound
-- predicates use De Morgan so the emitted form is the structural opposite of the
-- sibling condition set.
function M.negate(expr: string): string
    if expr == "true" then return "false" end
    if expr == "false" then return "true" end
    local and_parts = split_top(expr, "&&")
    if #and_parts > 1 then
        local out: { string } = {}
        for _, part in ipairs(and_parts) do out[#out + 1] = M.negate(part) end
        return table.concat(out, " || ")
    end
    local or_parts = split_top(expr, "||")
    if #or_parts > 1 then
        local out: { string } = {}
        for _, part in ipairs(or_parts) do out[#out + 1] = M.negate(part) end
        return table.concat(out, " && ")
    end
    return wrap_not(expr)
end

-- disjoin(list) ORs a set of compiled exprs into one (the union of sibling
-- conditions an else edge negates). An empty set is the constant false.
function M.disjoin(list: { string }): string
    if #list == 0 then return "false" end
    if #list == 1 then return list[1] end
    local parts: { string } = {}
    for _, e in ipairs(list) do parts[#parts + 1] = "(" .. e .. ")" end
    return table.concat(parts, " || ")
end

return M
