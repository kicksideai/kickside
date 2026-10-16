-- Read side of the skills slice (queries). A skill's metadata lives on its
-- component (discovery); its body, version history, and file manifests live in the
-- committed projection body (state.lua), folded from thread events; file bytes
-- live in the skill filesystem, named by sha256. Access is the component contract's
-- job: every read gates on component.validate_access (or list_components scoping).
-- Mutations live in the writer.

local errors = require("errors")
local component = require("component")
local base64 = require("base64")
local skill_types = require("types")
local normalize = require("normalize")
local state = require("skill_state")
local bundle_store = require("bundle_store")

local M = {}

local is_str = normalize.is_str

local function arg_table(args: any): skill_types.Map
    if type(args) == "table" then return args :: skill_types.Map end
    return {}
end

-- file_entries: a version record's file manifest. Collection rows carry only
-- the fields needed to select a file; a skill detail includes its full file
-- descriptors.
local function file_entries(record: any, want_kind: string?, full: boolean): { skill_types.SkillFile }
    local files = (type((record :: any).files) == "table" and (record :: any).files or {}) :: { skill_types.SkillFileManifest }
    local out: { skill_types.SkillFile } = {}
    for _, m in ipairs(files) do
        if not want_kind or m.kind == want_kind then
            local entry: skill_types.SkillFile = {
                path = tostring(m.path or ""),
                kind = tostring(m.kind or ""),
                mime_type = m.mime_type,
                size_bytes = (tonumber(m.size_bytes) or 0) :: integer,
                executable = m.executable == true,
            }
            if full then
                entry.sha256 = m.sha256
                entry.metadata = type(m.metadata) == "table" and m.metadata or nil
            end
            out[#out + 1] = entry
        end
    end
    return out
end

-- get: skill metadata + a body. READ access required. args: { skill_id, version? }.
-- Without version, returns the current head; with version, that historical version
-- (meta always reflects the live component).
function M.get(args: any): (skill_types.Skill?, error?)
    local get_args = (arg_table(args) :: any) :: skill_types.SkillGetArgs
    if not is_str(get_args.skill_id) then return nil, errors.new({ kind = errors.INVALID, message = "skill_id is required" }) end
    local skill_id = get_args.skill_id :: string

    local _, aerr = component.validate_access(skill_id, component.ACCESS.READ)
    if aerr then return nil, aerr end

    local svc, serr = component.get_service()
    if serr or not svc then return nil, errors.wrap(serr or errors.new({ kind = errors.UNAVAILABLE, message = "component service missing" }), "component service unavailable") end
    local comp, cerr = svc:get({ component_id = skill_id })
    if cerr or not (comp and comp.success) then return nil, errors.wrap(cerr or (comp and comp.error) or errors.new({ kind = errors.NOT_FOUND, message = "skill not found" }), "get skill failed") end

    local body, berr = state.body_for(skill_id)
    if berr then return nil, berr end
    local record, verr = state.pick(body, get_args.version)
    if not record then return nil, verr end

    local meta = (((comp :: any).meta or {}) :: any) :: skill_types.ComponentMeta
    return ({
        skill_id = skill_id,
        name = meta.title,
        description = meta.comment,
        status = meta.status,
        icon = meta.icon,
        body = tostring((record :: any).body or ""),
        version = tonumber((record :: any).version) or 1,
        license = (record :: any).license,
        file_count = tonumber((record :: any).file_count) or 0,
        bundle_size = tonumber((record :: any).bundle_size) or 0,
        files = file_entries(record, nil, true),
    }) :: skill_types.Skill
end

-- list_versions: a skill's version history, newest first, no bodies. READ access
-- required. args: { skill_id }.
function M.list_versions(args: any): ({ skill_types.SkillVersion }?, error?)
    local list_args = (arg_table(args) :: any) :: skill_types.SkillListVersionsArgs
    if not is_str(list_args.skill_id) then return nil, errors.new({ kind = errors.INVALID, message = "skill_id is required" }) end
    local skill_id = list_args.skill_id :: string
    local _, aerr = component.validate_access(skill_id, component.ACCESS.READ)
    if aerr then return nil, aerr end

    local body, berr = state.body_for(skill_id)
    if berr then return nil, berr end
    local versions = state.versions(body)
    local out: { skill_types.SkillVersion } = {}
    for i = #versions, 1, -1 do
        local v = versions[i]
        out[#out + 1] = {
            version = tonumber(v.version) or 0,
            name = v.name,
            description = v.description,
            license = v.license,
            file_count = tonumber(v.file_count) or 0,
            bundle_size = tonumber(v.bundle_size) or 0,
            created_at = v.created_at and tostring(v.created_at) or nil,
        }
    end
    return out
end

-- list_files: compact rows from a skill version's file manifest (no content or
-- full descriptor metadata). READ access required. args: { skill_id, version?, kind? }.
function M.list_files(args: any): ({ skill_types.SkillFile }?, error?)
    local list_args = (arg_table(args) :: any) :: skill_types.SkillListFilesArgs
    if not is_str(list_args.skill_id) then return nil, errors.new({ kind = errors.INVALID, message = "skill_id is required" }) end
    local skill_id = list_args.skill_id :: string
    local _, aerr = component.validate_access(skill_id, component.ACCESS.READ)
    if aerr then return nil, aerr end

    local body, berr = state.body_for(skill_id)
    if berr then return nil, berr end
    local record, verr = state.pick(body, list_args.version)
    if not record then return nil, verr end

    local want_kind = is_str(list_args.kind) and list_args.kind or nil
    return file_entries(record, want_kind :: string?, false)
end

-- read_file: one bundled file's content, read from its bundle. READ access
-- required. args: { skill_id, path, version?, max_bytes?, format? }. format
-- "base64" returns the bytes base64-encoded; default returns raw text. A file over
-- max_bytes (capped at LIMITS.FILE) is rejected rather than truncated.
function M.read_file(args: any): (skill_types.SkillFileContent?, error?)
    local read_args = (arg_table(args) :: any) :: skill_types.SkillReadFileArgs
    if not is_str(read_args.skill_id) then return nil, errors.new({ kind = errors.INVALID, message = "skill_id is required" }) end
    local skill_id = read_args.skill_id :: string
    local path, perr = normalize.clean_path(read_args.path)
    if perr or not path then return nil, errors.new({ kind = errors.INVALID, message = perr or "path is required" }) end

    local _, aerr = component.validate_access(skill_id, component.ACCESS.READ)
    if aerr then return nil, aerr end

    local body, berr = state.body_for(skill_id)
    if berr then return nil, berr end
    local record, verr = state.pick(body, read_args.version)
    if not record then return nil, verr end

    local manifest = (type((record :: any).files) == "table" and (record :: any).files or {}) :: { skill_types.SkillFileManifest }
    local entry: skill_types.SkillFileManifest? = nil
    for _, m in ipairs(manifest) do
        if tostring(m.path) == path then entry = m break end
    end
    if not entry then return nil, errors.new({ kind = errors.NOT_FOUND, message = "file not found: " .. (path :: string) }) end

    local size = tonumber((entry :: any).size_bytes) or 0
    local cap = skill_types.LIMITS.FILE
    if read_args.max_bytes ~= nil then
        local mb = tonumber(read_args.max_bytes)
        if mb and mb < cap then cap = mb :: integer end
    end
    if size > cap then
        return nil, errors.new({ kind = errors.INVALID, message = "file too large (" .. tostring(size) .. " > " .. tostring(cap) .. ")" })
    end

    local content, rerr = bundle_store.read(skill_id, tostring((entry :: any).sha256 or ""))
    if rerr or content == nil then return nil, errors.wrap(rerr or errors.new({ kind = errors.INTERNAL, message = "bundle content missing" }), "read file bytes") end
    local bytes = tostring(content)

    local fmt = is_str(read_args.format) and read_args.format or skill_types.ENCODING.TEXT
    if fmt == skill_types.ENCODING.BASE64 then
        local enc, eerr = base64.encode(bytes)
        if eerr then return nil, errors.wrap(eerr, "base64 encode failed") end
        bytes = enc :: string
    end

    return ({
        path = path :: string,
        kind = tostring((entry :: any).kind or ""),
        mime_type = (entry :: any).mime_type,
        size_bytes = size :: integer,
        sha256 = (entry :: any).sha256,
        executable = (entry :: any).executable == true,
        encoding = fmt,
        content = bytes,
    }) :: skill_types.SkillFileContent
end

-- list: skills the caller can read — name + description + status for discovery.
-- Bodies load on demand via get(). Archived skills are hidden unless asked for.
-- args: { include_archived?, agent_id?, ids?, q?, limit?, offset? }; offset skips
-- that many matching skills in the service's order.
function M.list(args: any): ({ skill_types.SkillSummary }?, error?)
    local list_args = (arg_table(args) :: any) :: skill_types.SkillListArgs
    local svc, serr = component.get_service()
    if serr or not svc then return nil, errors.wrap(serr or errors.new({ kind = errors.UNAVAILABLE, message = "component service missing" }), "component service unavailable") end

    local result, lerr = svc:list({ filters = { meta = { class = skill_types.SKILL_CLASS } } })
    if lerr or not (result and result.success) then
        return nil, errors.wrap(lerr or (result and result.error) or errors.new({ kind = errors.INTERNAL, message = "invalid list response" }), "list failed")
    end

    local want_agent = is_str(list_args.agent_id) and list_args.agent_id or nil
    local want_ids: { [string]: boolean }? = nil
    if is_str(list_args.ids) then
        want_ids = {}
        for id in string.gmatch(tostring(list_args.ids), "([^,]+)") do
            local trimmed = id:match("^%s*(.-)%s*$")
            if trimmed ~= "" then (want_ids :: { [string]: boolean })[trimmed] = true end
        end
    end
    local q = is_str(list_args.q) and string.lower(tostring(list_args.q)) or nil
    local limit = tonumber(list_args.limit)
    if limit ~= nil then
        limit = math.floor(limit)
        if limit < 1 then limit = 25 end
    elseif q then
        limit = 20
    else
        limit = 25
    end
    local offset = list_args.offset or 0
    if type(offset) ~= "number" or offset ~= math.floor(offset) or offset < 0 then
        return nil, errors.new({ kind = errors.INVALID, message = "offset must be a non-negative integer" })
    end
    local skipped = 0

    local out: { skill_types.SkillSummary } = {}
    local components = (type(result.components) == "table" and result.components or {}) :: { skill_types.ComponentRow }
    for _, c in ipairs(components) do
        local meta = (c.meta or {}) :: skill_types.ComponentMeta
        local skill_agent = meta.agent_id
        local scope_ok = (not want_agent) or skill_agent == want_agent or not is_str(skill_agent)
        if scope_ok and (list_args.include_archived or meta.status ~= skill_types.STATUS.ARCHIVED) then
            local id_ok = want_ids == nil or (want_ids :: { [string]: boolean })[tostring(c.component_id)] == true
            local q_ok = true
            if q then
                local name = string.lower(tostring(meta.title or ""))
                local desc = string.lower(tostring(meta.comment or ""))
                q_ok = string.find(name, q, 1, true) ~= nil
                    or string.find(desc, q, 1, true) ~= nil
            end
            if id_ok and q_ok and skipped < offset then
                skipped = skipped + 1
            elseif id_ok and q_ok then
                out[#out + 1] = {
                    skill_id = c.component_id,
                    name = meta.title,
                    description = meta.comment,
                    status = meta.status,
                    icon = meta.icon,
                    agent_id = is_str(skill_agent) and skill_agent or nil,
                    version = tonumber(meta.version) or nil,
                    version_count = tonumber(meta.version_count) or nil,
                    file_count = tonumber(meta.file_count) or nil,
                    bundle_size = tonumber(meta.bundle_size) or nil,
                }
                if limit and #out >= limit then break end
            end
        end
    end
    return out
end

return M
