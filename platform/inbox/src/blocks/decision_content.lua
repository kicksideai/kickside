local json = require("json")

local M = {}
type Map = { [string]: any }

local function acyclic(value: any, visiting: { [any]: boolean }): boolean
    if type(value) ~= "table" then return true end
    if visiting[value] then return false end
    visiting[value] = true
    for _, child in pairs(value :: Map) do
        if not acyclic(child, visiting) then return false end
    end
    visiting[value] = nil
    return true
end

local function scalar(value: any): string?
    if type(value) == "string" then return value end
    if type(value) == "number" or type(value) == "boolean" then return tostring(value) end
    return nil
end

local function keys(value: any): { any }
    local out: { any } = {}
    for key in pairs(value) do out[#out + 1] = key end
    table.sort(out, function(a: any, b: any): boolean
        local left, right = tostring(a), tostring(b)
        if left == right then return type(a) < type(b) end
        return left < right
    end)
    return out
end

local function is_list(value: any): boolean
    if type(value) ~= "table" then return false end
    local count = 0
    for key in pairs(value :: Map) do
        if type(key) ~= "number" or key < 1 or key % 1 ~= 0 then return false end
        count = count + 1
    end
    return count > 0 and #(value :: { any }) == count
end

local function encoded(value: any): (string?, string?)
    local text, err = json.encode(value)
    if err or not text then return nil, "could not encode review content: " .. tostring(err) end
    return text, nil
end

local function cell(value: any): (string?, string?)
    if value == nil then return "", nil end
    local text = scalar(value)
    if text == nil then
        local err
        text, err = encoded(value)
        if err then return nil, err end
    end
    return ((text :: string):gsub("\\", "\\\\"):gsub("\r?\n", " "):gsub("|", "\\|")), nil
end

local function record_table(rows: { any }): (string?, string?)
    local columns: { [string]: boolean } = {}
    for _, row in ipairs(rows) do
        if type(row) ~= "table" or is_list(row) then return nil, nil end
        for key in pairs(row :: Map) do columns[key] = true end
    end
    local header = keys(columns)
    if #header == 0 then return nil, nil end
    local titles: { string } = {}
    local rules: { string } = {}
    for index, key in ipairs(header) do
        titles[index] = cell(key) :: string
        rules[index] = "---"
    end
    local lines = { "| " .. table.concat(titles, " | ") .. " |", "| " .. table.concat(rules, " | ") .. " |" }
    for _, row in ipairs(rows) do
        local cells: { string } = {}
        for index, key in ipairs(header) do
            local text, err = cell((row :: Map)[key])
            if err then return nil, err end
            cells[index] = text :: string
        end
        lines[#lines + 1] = "| " .. table.concat(cells, " | ") .. " |"
    end
    return table.concat(lines, "\n"), nil
end

local function block(value: any): (string?, string?)
    local text = scalar(value)
    if text then return text, nil end
    if is_list(value) then
        local table_text, err = record_table(value :: { any })
        if err then return nil, err end
        if table_text then return table_text, nil end
        local lines: { string } = {}
        for _, item in ipairs(value :: { any }) do
            local line = scalar(item)
            if not line or line:find("[\r\n]") then lines = {}; break end
            lines[#lines + 1] = "- " .. line
        end
        if #lines > 0 then return table.concat(lines, "\n"), nil end
    end
    local text_json, err = encoded(value)
    if err then return nil, err end
    local fence_size = 3
    for ticks in (text_json :: string):gmatch("`+") do fence_size = math.max(fence_size, #ticks + 1) end
    local fence = string.rep("`", fence_size)
    return fence .. "json\n" .. (text_json :: string) .. "\n" .. fence, nil
end

local function fields(value: any): (string?, string?)
    if value == nil then return "", nil end
    if not acyclic(value, {}) then return nil, "review content contains a cyclic value" end
    if type(value) ~= "table" or is_list(value) then return block(value) end
    local facts: { string } = {}
    local blocks: { string } = {}
    for _, key in ipairs(keys(value :: Map)) do
        local item = (value :: Map)[key]
        local text = scalar(item)
        if text and not text:find("[\r\n]") then
            facts[#facts + 1] = "- " .. tostring(key) .. ": " .. text
        else
            local rendered, err = block(item)
            if err then return nil, err end
            blocks[#blocks + 1] = "**" .. tostring(key) .. "**\n\n" .. (rendered :: string)
        end
    end
    local sections: { string } = {}
    if #facts > 0 then sections[1] = table.concat(facts, "\n") end
    for _, item in ipairs(blocks) do sections[#sections + 1] = item end
    return table.concat(sections, "\n\n"), nil
end

function M.render(input: any, context: any): (string?, string?)
    local content, input_err = fields(input)
    if input_err then return nil, input_err end
    local correlation, context_err = fields(context)
    if context_err then return nil, context_err end
    local sections: { string } = {}
    if content ~= "" then sections[#sections + 1] = content :: string end
    if correlation ~= "" then sections[#sections + 1] = correlation :: string end
    return table.concat(sections, "\n\n"), nil
end

return M
