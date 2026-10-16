-- SkillFile tool — read a skill bundle's files on demand.
--
-- A skill's `use` action returns the body plus a compact file manifest (paths +
-- kind, not contents). When the agent needs a referenced file it calls this tool:
-- `list` re-lists the manifest, `read` pulls one file's contents. Both go through
-- the access-checked skill_runtime contract (READ access + path normalization +
-- size cap enforced in the store). Binary assets come back base64-encoded.

local funcs = require("funcs")
local skill_types = require("types")
local keyset = require("keyset")

local SKILL_LIST_FILES = "kickside.skills:skill_list_files"
local SKILL_READ_FILE = "kickside.skills:skill_read_file"

local function tool_args(args: any): skill_types.SkillToolArgs
    if type(args) == "table" then return (args :: any) :: skill_types.SkillToolArgs end
    return ({} :: any) :: skill_types.SkillToolArgs
end

local function file_result(file: skill_types.SkillFileContent?): (any, error?)
    if type(file) ~= "table" then return nil, errors.new({ message = "File not found", kind = errors.NOT_FOUND }) end
    local out: { [string]: any } = { success = true }
    for key, value in pairs(file :: any) do out[key] = value end
    return out, nil
end

local function handler(args: any): (any, error?)
    local parsed_args = tool_args(args)
    local action = tostring(parsed_args.action)

    if action == "list" then
        local limit, cursor, page_err = keyset.args(args)
        if page_err then return nil, page_err end
        local files, err = funcs.call(SKILL_LIST_FILES, {
            skill_id = parsed_args.skill_id, version = parsed_args.version, kind = parsed_args.kind,
        })
        if err then return nil, err end
        local page, next_cursor = keyset.page(files :: { any }?, keyset.field("path"), limit :: integer, cursor)
        return { success = true, files = page, count = #page, next_cursor = next_cursor }, nil
    end

    if action == "read" then
        local file, err = funcs.call(SKILL_READ_FILE, {
            skill_id = parsed_args.skill_id,
            path = parsed_args.path,
            version = parsed_args.version,
            max_bytes = parsed_args.max_bytes,
            format = parsed_args.format,
        })
        if err then return nil, err end
        return file_result(file :: skill_types.SkillFileContent?)
    end

    return nil, errors.new({ message = tostring("unknown action '" .. action .. "'. Available: list, read"), kind = errors.INVALID })
end

return { handler = handler }
