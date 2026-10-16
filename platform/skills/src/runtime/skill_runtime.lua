-- Skill runtime — the store-backed implementation of the skill_runtime contract.
--
-- activate / list_files / read_file are thin dispatchers over the access-checked
-- store funcs (each runs under the caller's actor via funcs:call). Bundled scripts
-- are stored as files, but execution is intentionally not part of this contract
-- until a runner implementation ships.

local funcs = require("funcs")

local M = {}

local SKILL_GET = "kickside.skills:skill_get"
local SKILL_LIST_FILES = "kickside.skills:skill_list_files"
local SKILL_READ_FILE = "kickside.skills:skill_read_file"

-- activate: load a skill version (its metadata/body) plus its file manifest, so an
-- agent can follow the procedure and read referenced files on demand. input:
-- { skill_id, version? }. Returns { skill, files }.
function M.activate(input: any): (any, string?)
    input = type(input) == "table" and input or {}
    local skill, gerr = funcs.call(SKILL_GET, { skill_id = input.skill_id, version = input.version })
    if gerr then return nil, tostring(gerr) end
    local files, ferr = funcs.call(SKILL_LIST_FILES, { skill_id = input.skill_id, version = input.version })
    if ferr then return nil, tostring(ferr) end
    return { skill = skill, files = files }
end

-- list_files: a version's file manifest (no content). input: { skill_id, version?,
-- kind? }. Returns { files }.
function M.list_files(input: any): (any, string?)
    input = type(input) == "table" and input or {}
    local files, ferr = funcs.call(SKILL_LIST_FILES, {
        skill_id = input.skill_id, version = input.version, kind = input.kind,
    })
    if ferr then return nil, tostring(ferr) end
    return { files = files }
end

-- read_file: one bundled file's content (access + path + size checked in the
-- store). input: { skill_id, path, version?, max_bytes?, format? }.
function M.read_file(input: any): (any, string?)
    input = type(input) == "table" and input or {}
    local file, rerr = funcs.call(SKILL_READ_FILE, {
        skill_id = input.skill_id,
        path = input.path,
        version = input.version,
        max_bytes = input.max_bytes,
        format = input.format,
    })
    if rerr then return nil, tostring(rerr) end
    return file
end

return M
