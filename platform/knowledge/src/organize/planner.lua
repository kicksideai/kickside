local llm = require("llm")
local prompt = require("prompt")
local json = require("json")

-- Organize planner adapter. Given the dropped files (id + filename only — content is
-- never read here; the KB owns content + embedding), the fast model proposes a KB
-- name/description and a clean title + category per file. One structured call.
local M = {}

local SYSTEM = [[You organize a set of uploaded files into ONE knowledge base.
Input is a list of "upload_id :: filename" lines. Reply with ONLY compact JSON, no prose, no code fences:
{"kb_name":"short human name","kb_description":"one sentence","files":[{"upload_id":"<id>","title":"clean human title from the filename","category":"1-2 word topic"}]}
Use every upload_id exactly once. Do not invent ids.]]

local function nonempty_text(value: any): boolean
    return type(value) == "string" and (value :: string):find("%S") ~= nil
end

-- plan(files) -> ({ kb_name, kb_description, assignments = { [upload_id]={title,category} } }, err)
function M.plan(files: { any }): (any, string?)
    if type(files) ~= "table" or #files == 0 then return nil, "no files to plan" end

    local lines: { string } = {}
    for _, f in ipairs(files) do
        lines[#lines + 1] = tostring(f.upload_id) .. " :: " .. tostring(f.filename or "file")
    end

    local p = prompt.new()
    p:add_system(SYSTEM)
    p:add_user(table.concat(lines, "\n"))

    local resp, err = llm.generate(p, { model = "class:fast", temperature = 0.1, max_tokens = 1200 })
    if err then return nil, err end
    if not resp then return nil, "planner returned no response" end

    local text = type(resp) == "table" and (resp :: { [string]: any }).result or nil
    if not nonempty_text(text) then return nil, "planner returned no result text" end
    local parsed, perr = json.decode(text)
    if perr or type(parsed) ~= "table" then return nil, "planner returned non-JSON: " .. text:sub(1, 200) end

    local assignments: { [string]: any } = {}
    if not nonempty_text(parsed.kb_name) or not nonempty_text(parsed.kb_description) then
        return nil, "planner returned incomplete knowledge base details"
    end
    if type(parsed.files) ~= "table" then return nil, "planner returned no file assignments" end

    local expected: { [string]: boolean } = {}
    for _, file in ipairs(files) do
        if not nonempty_text(file.upload_id) then return nil, "invalid upload id" end
        expected[file.upload_id :: string] = true
    end
    for _, file in ipairs(parsed.files :: { any }) do
        if type(file) ~= "table"
            or not nonempty_text(file.upload_id)
            or not expected[file.upload_id :: string]
            or assignments[file.upload_id :: string] ~= nil
            or not nonempty_text(file.title)
            or not nonempty_text(file.category) then
            return nil, "planner returned incomplete file assignments"
        end
        assignments[file.upload_id :: string] = { title = file.title, category = file.category }
    end
    for upload_id, _ in pairs(expected) do
        if assignments[upload_id] == nil then return nil, "planner omitted a file assignment" end
    end

    return {
        kb_name = parsed.kb_name,
        kb_description = parsed.kb_description,
        assignments = assignments,
    }
end

return M
