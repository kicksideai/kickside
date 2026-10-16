-- Skill's kickside.contract:portable EXPORT adapter. A skill's data is its version
-- history (the projection body folded from its thread events) and its file bytes
-- (the skill's bundle, named by sha256 in each version's manifest). This streams the
-- version records to <path>/data/versions.jsonl and each referenced file's RAW bytes
-- to its own part file under <path>/data/files/<sha256>. The component shell
-- (title/description/status meta) is written by the generic coordinator; this moves
-- only the skill's own data.
--
-- Bytes travel raw (the KXB1 container carries length-delimited parts), never base64
-- in a single buffer: peak memory is one file, not every file at once.

local fs = require("fs")
local ctx = require("ctx")
local state = require("skill_state")
local bundle_store = require("bundle_store")
local pio = require("portable_io")

local M = {}

function M.handler(args)
    local component_id = ctx.get("component_id")
    if type(component_id) ~= "string" or component_id == "" then
        return { success = false, error = "no component_id in context" }
    end
    local storage_id = type(args) == "table" and args.storage_id or nil
    local path = type(args) == "table" and args.path or nil
    if type(storage_id) ~= "string" or type(path) ~= "string" then
        return { success = false, error = "storage_id and path are required" }
    end

    local storage, ferr = fs.get(storage_id)
    if ferr or not storage then return { success = false, error = "storage: " .. tostring(ferr) } end

    local body, berr = state.body_for(component_id)
    if berr then return { success = false, error = "read skill: " .. tostring(berr) } end
    local versions = state.versions(body)

    local files = { "data/versions.jsonl" }
    local seen = {}
    for _, v in ipairs(versions) do
        for _, f in ipairs(type(v.files) == "table" and v.files or {}) do
            local content, rerr = bundle_store.read(component_id, tostring(f.sha256 or ""))
            if rerr or content == nil then return {success = false, error = "read file " .. tostring(f.path) .. ": " .. tostring(rerr)} end
            local sha256 = f.sha256
            if not seen[sha256] then
                seen[sha256] = true
                local rel = "data/files/" .. sha256
                local fpath = path .. "/" .. rel
                local parent_ok, parent_err = pio.ensure_parent(storage, fpath)
                if parent_err or not parent_ok then return {success = false, error = tostring(parent_err)} end
                local wok, werr = storage:writefile(fpath, content)
                if not wok then return { success = false, error = "write file " .. tostring(f.path) .. ": " .. tostring(werr) } end
                files[#files + 1] = rel
            end
        end
    end

    local ok, werr = pio.write_jsonl(storage, path .. "/data/versions.jsonl", versions)
    if not ok then return { success = false, error = "write versions: " .. tostring(werr) } end

    return {
        success = true,
        manifest = {
            files = files,
            counts = { versions = #versions, files = #files - 1 },
        },
    }
end

return M
