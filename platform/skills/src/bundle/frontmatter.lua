-- SKILL.md frontmatter parser — a bounded reader for the open SKILL.md format
-- (agentskills.io), NOT a general YAML parser. It handles exactly what the format
-- uses: a leading `---`-delimited block of `key: value` pairs, an optional nested
-- `metadata:` map (one level of two-space indentation), and list values written
-- either inline (`[a, b]`) or as `-` items. `allowed-tools` is split on spaces
-- when given as a bare scalar (the Claude convention). Anything richer is out of
-- scope by design; a focused parser is correct here and avoids a YAML dependency
-- the module lacks.

local M = {}

type Frontmatter = { [string]: any }

-- Trim ASCII whitespace from both ends of a string.
local function trim(s: string): string
    return (s:gsub("^%s+", ""):gsub("%s+$", ""))
end
M.trim = trim

-- Strip a single pair of matching surrounding quotes from a scalar value.
local function unquote(s: string): string
    local first = s:sub(1, 1)
    if (first == '"' or first == "'") and s:sub(-1) == first and #s >= 2 then
        return s:sub(2, #s - 1)
    end
    return s
end

-- Count leading spaces (indentation depth) of a raw line.
local function indent_of(line: string): integer
    local sp = line:match("^( *)")
    return (sp and #sp or 0) :: integer
end

-- Parse an inline list `[a, b, c]` into a string array; returns nil if not inline.
local function parse_inline_list(v: string): { string }?
    if v:sub(1, 1) ~= "[" or v:sub(-1) ~= "]" then return nil end
    local inner = v:sub(2, #v - 1)
    local out: { string } = {}
    for item in inner:gmatch("[^,]+") do
        local t = unquote(trim(item))
        if t ~= "" then out[#out + 1] = t end
    end
    return out
end

-- Split the frontmatter block into its lines (without the fences) and the body.
-- Returns (lines, body) or (nil, full_text) when there is no frontmatter block.
local function split_block(text: string): ({ string }?, string)
    -- Tolerate a UTF-8 BOM and leading blank lines before the opening fence.
    local s = text:gsub("^\239\187\191", "")
    local rest = s:match("^%s*%-%-%-[ \t]*\r?\n(.*)$")
    if not rest then return nil, s end

    local lines: { string } = {}
    local body_start: number? = nil
    local pos = 1
    while true do
        local nl = rest:find("\n", pos, true)
        local line = nl and rest:sub(pos, nl - 1) or rest:sub(pos)
        local stripped = line:gsub("\r$", "")
        if stripped:match("^%-%-%-[ \t]*$") then
            body_start = nl and (nl + 1) or (#rest + 1)
            break
        end
        lines[#lines + 1] = stripped
        if not nl then break end
        pos = nl + 1
    end
    local body = body_start and rest:sub(body_start) or ""
    return lines, body
end

-- Parse a SKILL.md document. Returns (frontmatter, body, err). frontmatter is a map of
-- lowercased keys to values: scalars are strings, lists are string arrays, and a
-- nested `metadata:` block becomes a sub-map. When there is no frontmatter block
-- the whole text is the body and frontmatter is {}.
function M.parse(text: any): (Frontmatter?, string, string?)
    if type(text) ~= "string" then return {}, "" end
    local lines, body = split_block(text :: string)
    if not lines then return {}, body end

    local fm: Frontmatter = {}
    local i = 1
    local n = #lines
    while i <= n do
        local line = lines[i]
        local stripped = trim(line)
        -- Skip blanks, comments, and stray top-level list items.
        if stripped ~= "" and stripped:sub(1, 1) ~= "#" and indent_of(line) == 0 then
            local key, val = line:match("^([%w_%-]+)%s*:%s*(.*)$")
            if key and val then
                local lkey = key:lower()
                val = trim(val)

                if lkey == "allowed_tools" then
                    return nil, body, "SKILL.md frontmatter uses allowed-tools, not allowed_tools"
                end

                if val == "" then
                    -- A bare `key:` introduces either a nested map (indented
                    -- `subkey: value`) or a list (indented `- item`). Peek ahead.
                    local sub: Frontmatter = {}
                    local list: { string } = {}
                    local j = i + 1
                    while j <= n do
                        local nxt = lines[j]
                        if trim(nxt) == "" then j = j + 1
                        elseif indent_of(nxt) > 0 then
                            local item = trim(nxt):match("^%-%s*(.*)$")
                            if item then
                                list[#list + 1] = unquote(trim(item))
                            else
                                local sk, sv = trim(nxt):match("^([%w_%-]+)%s*:%s*(.*)$")
                                if sk then sub[sk:lower()] = unquote(trim(sv)) end
                            end
                            j = j + 1
                        else
                            break
                        end
                    end
                    i = j - 1
                    if #list > 0 then
                        fm[lkey] = list
                    elseif next(sub) ~= nil then
                        fm[lkey] = sub
                    else
                        fm[lkey] = ""
                    end
                else
                    local inline = parse_inline_list(val)
                    if inline then
                        fm[lkey] = inline
                    elseif lkey == "allowed-tools" then
                        -- Claude convention: a bare scalar lists tools space-split.
                        local tools: { string } = {}
                        for t in (unquote(val)):gmatch("%S+") do tools[#tools + 1] = t end
                        fm[lkey] = tools
                    else
                        fm[lkey] = unquote(val)
                    end
                end
            end
        end
        i = i + 1
    end

    return fm, body
end

return M
