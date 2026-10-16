-- Skill's kickside.contract:portable IMPORT_INTO adapter. The coordinator has
-- already registered the new skill component (component_id is in context); this
-- replays <path>/data into it: it ensures the skill's history thread + projection,
-- stores each exported file's bytes (data/files/<sha256>) in the new skill's bundle,
-- and appends one version event per exported version (created for v1, updated
-- after). Files are named by sha256, so manifests carry over unchanged. The events
-- drive the projection that rebuilds the body.

local fs = require("fs")
local hash = require("hash")
local ctx = require("ctx")
local security = require("security")
local contract = require("contract")
local types = require("types")
local state = require("skill_state")
local version_append = require("version_append")
local bundle_store = require("bundle_store")
local pio = require("portable_io")

local M = {}

-- The one canonical threads seam: the kickside.core:threads contract, opened under
-- the caller's actor + scope, never a private *_method function-id.
local THREADS_CONTRACT = "kickside.core:threads"

local function threads(): (any?, string?)
    local def, gerr = contract.get(THREADS_CONTRACT)
    if gerr or not def then return nil, "threads contract unavailable: " .. tostring(gerr) end
    local inst, oerr = (def :: any):with_actor(security.actor()):with_scope(security.scope()):open()
    if oerr or not inst then return nil, "threads open failed: " .. tostring(oerr) end
    return inst, nil
end

function M.handler(args)
    local component_id = ctx.get("component_id")
    if type(component_id) ~= "string" or component_id == "" then
        return { success = false, error = "no component_id in context" }
    end
    local skill_id = component_id :: string
    local storage_id = type(args) == "table" and args.storage_id or nil
    local path = type(args) == "table" and args.path or nil
    if type(storage_id) ~= "string" or type(path) ~= "string" then
        return { success = false, error = "storage_id and path are required" }
    end

    local storage, ferr = fs.get(storage_id)
    if ferr or not storage then return { success = false, error = "storage: " .. tostring(ferr) } end

    local base = path .. "/data/"
    local versions, versions_err = pio.read_jsonl(storage, base .. "versions.jsonl")
    if versions_err or not versions then return {success = false, error = "read versions: " .. tostring(versions_err)} end
    if #versions == 0 then return { success = false, error = "missing versions.jsonl" } end

    -- The history thread passes the skill kind as its declaration impl_id, so the
    -- engine auto-applies its declared projection on creation. The thread component
    -- shell itself remains kickside.core:thread -- no register here.
    local thread_id, terr = state.thread_for(skill_id)
    if terr or not thread_id then return { success = false, error = "thread: " .. tostring(terr) } end

    -- Store each referenced file's bytes in the new skill's bundle, one part file at a
    -- time, so memory never exceeds the largest single file.
    local stored = {}
    for _, v in ipairs(versions) do
        for _, f in ipairs(type(v.files) == "table" and v.files or {}) do
            local sha256 = f.sha256
            local reference = f.artifact_id and ("artifacts/" .. tostring(f.artifact_id)) or ("files/" .. tostring(sha256))
            if not f.artifact_id and not bundle_store.valid_sha256(sha256) then return {success = false, error = "file " .. tostring(f.path) .. " has no sha256"} end
            if not stored[reference] then
                local bytes, bytes_err = storage:readfile(base .. reference)
                if bytes_err or type(bytes) ~= "string" then return {success = false, error = "read file " .. tostring(f.path) .. ": " .. tostring(bytes_err)} end
                local digest, hash_err = hash.sha256(bytes)
                if hash_err then return {success = false, error = "hash file: " .. tostring(hash_err)} end
                if sha256 and digest ~= sha256 then return {success = false, error = "file differs from its sha256: " .. tostring(f.path)} end
                local put, perr = bundle_store.put(skill_id, bytes)
                if perr then return {success = false, error = "store file " .. tostring(f.path) .. ": " .. tostring(perr)} end
                stored[reference] = put
            end
            f.sha256 = stored[reference]
            f.artifact_id = nil
        end
    end

    -- Replay versions in order.
    table.sort(versions, function(x, y) return (tonumber(x.version) or 0) < (tonumber(y.version) or 0) end)
    local inst, inst_err = threads()
    if inst_err or not inst then return {success = false, error = tostring(inst_err)} end
    for i, v in ipairs(versions) do
        local files = type(v.files) == "table" and v.files or {}
        local record = {
            skill_id = skill_id,
            version = tonumber(v.version) or i,
            body = tostring(v.body or ""),
            name = v.name, description = v.description, license = v.license,
            allowed_tools = v.allowed_tools, compatibility = v.compatibility,
            metadata = v.metadata, source = v.source,
            files = files, file_count = #files, bundle_size = tonumber(v.bundle_size) or 0,
        }
        local etype = i == 1 and types.EVENT.CREATED or types.EVENT.UPDATED
        local append_err = version_append.append(inst, thread_id, etype, record, types.SKILL_IMPL, types.THREAD_CLASS)
        if append_err then return {success = false, error = "append version: " .. tostring(append_err)} end
    end

    local _, catch_up_err = inst:catch_up_projection({thread_id = thread_id, kind = types.PROJECTION_KIND})
    if catch_up_err then return {success = false, error = "project versions: " .. tostring(catch_up_err)} end

    return { success = true, id_map = args.id_map, warnings = {} }
end

return M
