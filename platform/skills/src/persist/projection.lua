local component = require("component")
local types = require("types")

-- Skills version-history projection worker. The runner invokes it (worker_input_mode
-- = prefetch_events) with a batch of new skill events + the projection's current
-- body; it folds each created/updated event into body.versions and advances
-- current_version, returning the body + last_seq. The body IS the read model
-- (kickside_projection): reader.lua serves get/list_versions/list_files/read_file
-- from it without replaying events, so the history survives event retention.
-- body.meta carries the engine's worker config and must be preserved untouched.
local M = {}

local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

local function as_table(value: any): any
    if type(value) == "table" then return value end
    return {}
end

local function head_version(body: any): any
    local versions = type(body.versions) == "table" and body.versions or {}
    local current = tonumber(body.current_version) or 0
    local head: any = nil
    for _, v in ipairs(versions :: { any }) do
        local n = tonumber((v :: any).version) or 0
        if current > 0 and n == current then return v end
        if not head or n > (tonumber((head :: any).version) or 0) then head = v end
    end
    return head or {}
end

local function sync_public_meta(input: any, body: any): (boolean, string?)
    local skill_id = trim(body.skill_id)
    if skill_id == "" then return true, nil end

    local versions = type(body.versions) == "table" and body.versions or {}
    local head = head_version(body)
    local component_api = (type(input.component) == "table" and input.component) or component

    local ok, err = component_api.set_meta(skill_id, {
        version = tonumber(body.current_version) or tonumber((head :: any).version) or 0,
        version_count = #versions,
        file_count = tonumber((head :: any).file_count) or 0,
        bundle_size = tonumber((head :: any).bundle_size) or 0,
        last_version_at = (head :: any).created_at,
    })
    if ok == true then return true, nil end
    return false, tostring(err or "component.set_meta failed")
end

-- Upsert a version record into body.versions (replace same version, else append).
local function put_version(body: any, record: any)
    local versions = type(body.versions) == "table" and body.versions or {}
    local ver = tonumber(record.version) or 0
    local replaced = false
    for i, v in ipairs(versions :: { any }) do
        if (tonumber(v.version) or 0) == ver then
            versions[i] = record
            replaced = true
            break
        end
    end
    if not replaced then versions[#versions + 1] = record end
    body.versions = versions
    if ver > (tonumber(body.current_version) or 0) then body.current_version = ver end
end

-- Fold one event into the body.
local function apply(body: any, event: any)
    local etype = trim((event :: any).type)
    if etype == types.EVENT.FILE_TRANSFERRED then
        local transfer = as_table((event :: any).body)
        body.bundle_files = body.bundle_files or {}
        body.bundle_files[transfer.artifact_id] = transfer.sha256
        for _, version in ipairs(body.versions or {}) do
            for _, file in ipairs(version.files or {}) do
                if file.artifact_id == transfer.artifact_id then
                    file.sha256 = transfer.sha256
                    file.artifact_id = nil
                end
            end
        end
        return
    end
    if etype ~= types.EVENT.CREATED and etype ~= types.EVENT.UPDATED then return end
    local ebody = as_table((event :: any).body)
    local skill_id = trim(ebody.skill_id)
    if skill_id ~= "" then body.skill_id = skill_id end
    local record = {
        version = tonumber(ebody.version) or ((tonumber(body.current_version) or 0) + 1),
        body = type(ebody.body) == "string" and ebody.body or "",
        name = ebody.name,
        description = ebody.description,
        license = ebody.license,
        allowed_tools = type(ebody.allowed_tools) == "table" and ebody.allowed_tools or nil,
        compatibility = type(ebody.compatibility) == "table" and ebody.compatibility or nil,
        metadata = type(ebody.metadata) == "table" and ebody.metadata or nil,
        source = type(ebody.source) == "table" and ebody.source or nil,
        files = type(ebody.files) == "table" and ebody.files or {},
        file_count = tonumber(ebody.file_count) or 0,
        bundle_size = tonumber(ebody.bundle_size) or 0,
        created_at = (event :: any).created_at,
    }
    for _, file in ipairs(record.files) do
        local stored = file.artifact_id and (body.bundle_files or {})[file.artifact_id]
        if stored then file.sha256 = stored; file.artifact_id = nil end
    end
    put_version(body, record)
end

-- run(input): the worker entrypoint. input.projection.body is the carried read
-- model; input.events is the new batch; input.range.to_seq is the new head.
function M.run(input: any): any
    input = type(input) == "table" and input or {}
    local projection = type(input.projection) == "table" and input.projection or {}
    local body: any = type(projection.body) == "table" and projection.body or {}
    if body.versions == nil then body.versions = {} end
    if body.current_version == nil then body.current_version = 0 end

    local events = type(input.events) == "table" and input.events or {}
    for _, e in ipairs(events :: { any }) do apply(body, e) end

    local meta_ok, meta_err = sync_public_meta(input, body)
    if not meta_ok then return nil, meta_err end

    local range = type(input.range) == "table" and input.range or {}
    return { body = body, last_seq = tonumber(range.to_seq) or nil }
end

return M
