-- Skill versions live in the primary thread and its projection; bundled bytes
-- live in the injected skill filesystem, named by SHA-256 in each manifest.

local component = require("component")
local uuid = require("uuid")
local base64 = require("base64")
local contract = require("contract")
local errors = require("errors")
local skill_types = require("types")
local normalize = require("normalize")
local state = require("skill_state")
local bundle_store = require("bundle_store")
local refine_consistency = require("refine_consistency")
local version_append = require("version_append")

local M = {}

local is_str = normalize.is_str

local function over_limit(field: string, value: any, max: integer): error?
    if type(value) == "string" and #(value :: string) > max then
        return errors.new({ kind = errors.INVALID, message = field .. " too long (max " .. tostring(max) .. ")" })
    end
    return nil
end

local function valid_status(status: any): boolean
    return status == skill_types.STATUS.ACTIVE or status == skill_types.STATUS.ARCHIVED
end

local threads = version_append.threads

-- Resolve a fetched file's raw bytes from its content + encoding. Text is stored
-- as-is; base64 is decoded so the bundle holds real bytes.
local function decode_content(file: skill_types.SkillFileInput): (string?, error?)
    local content = file.content
    if content == nil then return nil, errors.new({ kind = errors.INVALID, message = "file content is required" }) end
    if type(content) ~= "string" then return nil, errors.new({ kind = errors.INVALID, message = "file content must be a string" }) end
    if file.encoding == skill_types.ENCODING.BASE64 then
        local bytes, derr = base64.decode(content :: string)
        if derr then return nil, errors.new({ kind = errors.INVALID, message = "base64 decode failed: " .. tostring(derr) }) end
        return bytes
    end
    return content :: string
end

type PreparedFile = {
    path: string,
    kind: string,
    mime_type: string?,
    content: string,
    size_bytes: integer,
    executable: boolean,
    metadata: skill_types.Map?,
}

-- Validate + normalize the incoming file list into prepared files (raw bytes +
-- descriptors). Returns (files, total_bytes, err).
local function prepare_files(files: any): ({ PreparedFile }?, integer, error?)
    if files == nil then return {}, 0 end
    if type(files) ~= "table" then return nil, 0, errors.new({ kind = errors.INVALID, message = "files must be an array" }) end
    local list = files :: { skill_types.SkillFileInput }
    if #list > skill_types.LIMITS.FILE_COUNT then
        return nil, 0, errors.new({ kind = errors.INVALID, message = "too many files (max " .. tostring(skill_types.LIMITS.FILE_COUNT) .. ")" })
    end

    local out: { PreparedFile } = {}
    local seen: { [string]: boolean } = {}
    local total = 0
    for _, raw in ipairs(list) do
        local nf = normalize.normalize_file(raw)
        local path, perr = normalize.clean_path(nf.path)
        if perr then return nil, 0, errors.new({ kind = errors.INVALID, message = perr }) end
        if seen[path :: string] then return nil, 0, errors.new({ kind = errors.INVALID, message = "duplicate file path: " .. (path :: string) }) end
        seen[path :: string] = true

        local bytes, berr = decode_content(raw)
        if berr then return nil, 0, berr end
        local b = bytes :: string
        if #b > skill_types.LIMITS.FILE then
            return nil, 0, errors.new({ kind = errors.INVALID, message = "file too large: " .. (path :: string) .. " (max " .. tostring(skill_types.LIMITS.FILE) .. ")" })
        end
        total = total + #b
        if total > skill_types.LIMITS.BUNDLE then
            return nil, 0, errors.new({ kind = errors.INVALID, message = "bundle too large (max " .. tostring(skill_types.LIMITS.BUNDLE) .. ")" })
        end

        out[#out + 1] = {
            path = path :: string,
            kind = nf.kind,
            mime_type = nf.mime_type,
            content = b,
            size_bytes = #b,
            executable = nf.executable == true,
            metadata = type(nf.metadata) == "table" and nf.metadata or nil,
        }
    end
    return out, total :: integer
end

local function store_files(skill_id: string, files: { PreparedFile }): ({ skill_types.SkillFileManifest }?, integer, error?)
    local manifest: { skill_types.SkillFileManifest } = {}
    local total = 0
    for _, f in ipairs(files) do
        local sha256, aerr = bundle_store.put(skill_id, f.content)
        if aerr or not sha256 then return nil, 0, aerr or errors.new({kind = errors.INTERNAL, message = "bundle file missing"}) end
        total = total + f.size_bytes
        manifest[#manifest + 1] = {
            path = f.path,
            kind = f.kind,
            mime_type = f.mime_type,
            size_bytes = f.size_bytes,
            sha256 = sha256,
            executable = f.executable,
            metadata = f.metadata,
        }
    end
    return manifest, total :: integer
end

local function bundle_total(manifest: { skill_types.SkillFileManifest }): integer
    local total = 0
    for _, m in ipairs(manifest) do total = total + (tonumber(m.size_bytes) or 0) end
    return total :: integer
end

-- Append a version event to the skill's history thread, then advance the
-- kind's history projection through it (the threads read-after-write seam), so
-- the version is readable when the write returns: an agent saves a skill and
-- activates it in consecutive calls.
local function append_version(thread_id: string, etype: string, record: skill_types.Map): error?
    -- thread_id == skill_id (the component's primary thread). emit ensures it + the
    -- kind's declared history projection on first append.
    local inst, terr = threads()
    if terr then return terr end
    local append_err = version_append.append(
        inst,
        thread_id,
        etype,
        record,
        skill_types.SKILL_IMPL,
        skill_types.THREAD_CLASS
    )
    if append_err then return append_err end
    local _, catch_up_err = (inst :: any):catch_up_projection({ thread_id = thread_id, kind = skill_types.PROJECTION_KIND })
    if catch_up_err then return catch_up_err end
    return nil
end

local function latest_version(thread_id: string): (any?, error?)
    local inst, terr = threads()
    if terr or not inst then return nil, terr end
    return version_append.latest(inst, thread_id, skill_types.EVENT.CREATED, skill_types.EVENT.UPDATED)
end

-- The frontmatter fields a version event carries.
type Frontmatter = {
    license: any,
    allowed_tools: any,
    compatibility: any,
    metadata: any,
    source: any,
}

local function frontmatter(args: skill_types.Map): Frontmatter
    return {
        license = is_str(args.license) and args.license or nil,
        allowed_tools = type(args.allowed_tools) == "table" and args.allowed_tools or nil,
        compatibility = type(args.compatibility) == "table" and args.compatibility or nil,
        metadata = type(args.metadata) == "table" and args.metadata or nil,
        source = type(args.source) == "table" and args.source or nil,
    }
end

-- create: register the skill component, ensure its history thread + projection +
-- bundle, store the first version's bundle bytes, and append the
-- `created` event. Returns the skill_id.
function M.create(args: any): (string?, error?)
    args = args or {}
    local create_args = args :: skill_types.SkillCreateArgs
    if not is_str(create_args.name) then return nil, errors.new({ kind = errors.INVALID, message = "name is required" }) end
    if not is_str(create_args.description) then return nil, errors.new({ kind = errors.INVALID, message = "description is required (drives skill discovery)" }) end
    local lim_err = over_limit("name", create_args.name, skill_types.LIMITS.NAME)
        or over_limit("description", create_args.description, skill_types.LIMITS.DESCRIPTION)
        or over_limit("body", create_args.body, skill_types.LIMITS.BODY)
    if lim_err then return nil, lim_err end
    if is_str(create_args.status) and not valid_status(create_args.status) then
        return nil, errors.new({ kind = errors.INVALID, message = "status must be 'active' or 'archived'" })
    end

    -- A skill can target a specific agent (scoped to it) or be user-global. Creating
    -- one FOR an agent requires write access to that agent.
    if is_str(create_args.agent_id) then
        local _, aerr = component.validate_access(create_args.agent_id :: string, component.ACCESS.WRITE)
        if aerr then return nil, aerr end
    end

    local svc, serr = component.get_service()
    if serr or not svc then return nil, errors.wrap(serr or errors.new({ kind = errors.UNAVAILABLE, message = "component service missing" }), "component service unavailable") end

    local skill_id = uuid.v4()

    local meta: skill_types.Map = {
        title = create_args.name,
        comment = create_args.description,
        class = skill_types.SKILL_CLASS,
        status = is_str(create_args.status) and create_args.status or skill_types.STATUS.ACTIVE,
    }
    if is_str(create_args.agent_id) then meta.agent_id = create_args.agent_id end
    if is_str(create_args.icon) then meta.icon = create_args.icon end

    local reg, rerr = svc:register({ component_id = skill_id, impl_id = skill_types.SKILL_IMPL, meta = meta })
    if rerr or not (reg and reg.success) then
        return nil, errors.wrap(rerr or (reg and reg.error) or errors.new({ kind = errors.INTERNAL, message = "invalid register response" }), "register_component")
    end

    local function rollback(e: error): (string?, error?)
        local deleted, delete_err = svc:delete({ component_id = skill_id })
        if delete_err or not (deleted and deleted.success) then
            local cause = errors.wrap(e, "create failed")
            return nil, errors.new({ message = tostring(e) .. "; create rollback failed: "
                .. tostring(delete_err or (deleted and deleted.error) or "invalid delete response"),
                kind = cause:kind(), retryable = cause:retryable(), details = cause:details() })
        end
        return nil, e
    end

    -- The primary thread is materialized by the core emit path, which applies the
    -- skill kind's declared history projection on first append.
    local thread_id, terr = state.thread_for(skill_id)
    if terr or not thread_id then return rollback(errors.wrap(terr or errors.new({ kind = errors.INTERNAL, message = "thread missing" }), "thread")) end

    local prepared, total, ferr = prepare_files(create_args.files)
    if ferr or not prepared then return rollback(ferr or errors.new({ kind = errors.INTERNAL, message = "file prepare failed" })) end
    local manifest, mtotal, serr2 = store_files(skill_id, prepared)
    if serr2 or not manifest then return rollback(serr2 or errors.new({ kind = errors.INTERNAL, message = "file store failed" })) end

    local fm = frontmatter(create_args :: skill_types.Map)
    local record: skill_types.Map = {
        skill_id = skill_id,
        version = 1,
        body = type(create_args.body) == "string" and create_args.body or "",
        name = create_args.name,
        description = create_args.description,
        license = fm.license,
        allowed_tools = fm.allowed_tools,
        compatibility = fm.compatibility,
        metadata = fm.metadata,
        source = fm.source,
        files = manifest,
        file_count = #manifest,
        bundle_size = mtotal,
    }
    local aerr = append_version(thread_id, skill_types.EVENT.CREATED, record)
    if aerr then return rollback(aerr) end
    return skill_id
end

-- refine: append a new version (body + files) and/or patch the public meta. WRITE
-- access required. A new version is cut when body or files change; files default to
-- the prior version's manifest (named by sha256) unless `files` is given,
-- which fully replaces them. Frontmatter carries forward unless replaced. Returns
-- { skill_id, version } (version set iff a new version was written).
function M.refine(args: any): (skill_types.RefineResult?, error?)
    args = args or {}
    local refine_args = args :: skill_types.SkillRefineArgs
    if not is_str(refine_args.skill_id) then return nil, errors.new({ kind = errors.INVALID, message = "skill_id is required" }) end
    local skill_id = refine_args.skill_id :: string
    local has_files = refine_args.files ~= nil
    if not is_str(refine_args.body) and not is_str(refine_args.description) and not is_str(refine_args.status)
        and not is_str(refine_args.icon) and not has_files then
        return nil, errors.new({ kind = errors.INVALID, message = "nothing to refine (provide body, description, status, icon, or files)" })
    end
    local lim_err = over_limit("body", refine_args.body, skill_types.LIMITS.BODY)
        or over_limit("description", refine_args.description, skill_types.LIMITS.DESCRIPTION)
    if lim_err then return nil, lim_err end
    if is_str(refine_args.status) and not valid_status(refine_args.status) then
        return nil, errors.new({ kind = errors.INVALID, message = "status must be 'active' or 'archived'" })
    end

    local _, aerr = component.validate_access(skill_id, component.ACCESS.WRITE)
    if aerr then return nil, aerr end

    local meta_fields: skill_types.Map = {}
    if is_str(refine_args.description) then
        meta_fields.comment = refine_args.description
    end
    if is_str(refine_args.status) then
        meta_fields.status = refine_args.status
    end
    if is_str(refine_args.icon) then
        meta_fields.icon = refine_args.icon
    end

    local new_version: integer? = nil
    local append_pending: any = nil
    if is_str(refine_args.body) or has_files then
        local thread_id, terr = state.thread_for(skill_id)
        if terr or not thread_id then return nil, terr or errors.new({ kind = errors.UNAVAILABLE, message = "skill history unavailable" }) end
        local head, herr = latest_version(thread_id)
        if not head then return nil, herr or errors.new({ kind = errors.NOT_FOUND, message = "skill not found" }) end
        new_version = ((tonumber((head :: any).version) or 1) + 1) :: integer

        local body_md = is_str(refine_args.body) and refine_args.body or tostring((head :: any).body or "")
        local fm = frontmatter(refine_args :: skill_types.Map)
        local manifest: { skill_types.SkillFileManifest }
        local mtotal: integer
        if has_files then
            local prepared, total, ferr = prepare_files(refine_args.files)
            if ferr or not prepared then return nil, ferr end
            local stored, st, serr2 = store_files(skill_id, prepared)
            if serr2 or not stored then return nil, serr2 end
            manifest = stored
            mtotal = st
        else
            -- Carry the head's manifest forward (same bundled bytes).
            if type((head :: any).files) ~= "table" then
                return nil, errors.new({ kind = errors.INTERNAL, message = "current skill version has no file manifest" })
            end
            manifest = (head :: any).files :: { skill_types.SkillFileManifest }
            mtotal = bundle_total(manifest)
        end

        local record: skill_types.Map = {
            skill_id = skill_id,
            version = new_version,
            body = body_md,
            name = is_str(refine_args.name) and refine_args.name or (head :: any).name,
            description = is_str(refine_args.description) and refine_args.description or (head :: any).description,
            license = fm.license ~= nil and fm.license or (head :: any).license,
            allowed_tools = fm.allowed_tools ~= nil and fm.allowed_tools or (head :: any).allowed_tools,
            compatibility = fm.compatibility ~= nil and fm.compatibility or (head :: any).compatibility,
            metadata = fm.metadata ~= nil and fm.metadata or (head :: any).metadata,
            source = fm.source ~= nil and fm.source or (head :: any).source,
            files = manifest,
            file_count = #manifest,
            bundle_size = mtotal,
        }
        append_pending = function(): error?
            return append_version(thread_id, skill_types.EVENT.UPDATED, record)
        end
    end

    local has_meta = next(meta_fields) ~= nil
    if append_pending and has_meta then
        -- Component metadata and the thread event are owned behind separate
        -- contracts. The coordinator snapshots metadata, writes the reversible
        -- side first, and restores it if the append fails or detects a concurrent
        -- same-version writer.
        local svc, svc_err = component.get_service()
        if svc_err or not svc then
            return nil, errors.wrap(svc_err or errors.new({ kind = errors.UNAVAILABLE, message = "component service missing" }), "component service unavailable")
        end
        local ok, consistency_err = refine_consistency.apply(skill_id, meta_fields, {
            get_meta = function(component_id: string): (any?, error?)
                local result, get_err = svc:get({ component_id = component_id })
                if get_err or not result or result.success == false then
                    return nil, errors.wrap(get_err or (result and result.error) or errors.new({ kind = errors.NOT_FOUND, message = "skill not found" }), "component metadata preflight failed")
                end
                return type(result.meta) == "table" and result.meta or {}, nil
            end,
            set_meta = component.set_meta,
            append = append_pending,
        })
        if not ok then return nil, consistency_err end
    elseif append_pending then
        local apperr = append_pending()
        if apperr then return nil, apperr end
    elseif has_meta then
        local ok, err = component.set_meta(skill_id, meta_fields)
        if not ok then return nil, errors.wrap(err or errors.new({ kind = errors.INTERNAL, message = "metadata update fails" }), "meta update failed") end
    end

    return ({ skill_id = skill_id, version = new_version }) :: skill_types.RefineResult
end

-- share: grant or revoke another user's access to a skill (same component-access
-- model as sharing an agent). ADMIN access required.
function M.share(args: any): (skill_types.ShareResult?, error?)
    args = args or {}
    local share_args = args :: skill_types.SkillShareArgs
    if not is_str(share_args.skill_id) then return nil, errors.new({ kind = errors.INVALID, message = "skill_id is required" }) end
    if not is_str(share_args.user_id) then return nil, errors.new({ kind = errors.INVALID, message = "user_id is required" }) end

    local _, aerr = component.validate_access(share_args.skill_id :: string, component.ACCESS.ADMIN)
    if aerr then return nil, aerr end

    local svc, serr = component.get_service()
    if serr or not svc then return nil, errors.wrap(serr or errors.new({ kind = errors.UNAVAILABLE, message = "component service missing" }), "component service unavailable") end

    local subject = { subject_id = share_args.user_id, subject_type = "user" }
    local res, e
    if share_args.action == "revoke" then
        res, e = svc:revoke_subtree({ root_component_id = share_args.skill_id, subject = subject })
    else
        local access_policy = require("access_policy")
        local access_mask, mask_err = access_policy.normalize_access_mask(share_args.access_mask, component.ACCESS.READ)
        if mask_err then return nil, mask_err end
        res, e = svc:grant_subtree({ root_component_id = share_args.skill_id, subject = subject, access_mask = access_mask })
    end
    if e or not (res and res.success) then
        return nil, errors.wrap(e or (res and res.error) or errors.new({ kind = errors.INTERNAL, message = "invalid share response" }), "share failed")
    end
    return ({ skill_id = share_args.skill_id, user_id = share_args.user_id, action = share_args.action or "grant" }) :: skill_types.ShareResult
end

-- delete: remove the skill component. DELETE access required. The component's
-- deletable impl tears down the history thread + the bundle files.
function M.delete(args: any): (skill_types.DeleteResult?, error?)
    args = args or {}
    local delete_args = args :: skill_types.SkillDeleteArgs
    if not is_str(delete_args.skill_id) then return nil, errors.new({ kind = errors.INVALID, message = "skill_id is required" }) end

    local _, aerr = component.validate_access(delete_args.skill_id :: string, component.ACCESS.DELETE)
    if aerr then return nil, aerr end

    local svc, serr = component.get_service()
    if serr or not svc then return nil, errors.wrap(serr or errors.new({ kind = errors.UNAVAILABLE, message = "component service missing" }), "component service unavailable") end
    local res, e = svc:delete({ component_id = delete_args.skill_id })
    if e or not (res and res.success) then
        return nil, errors.wrap(e or (res and res.error) or errors.new({ kind = errors.INTERNAL, message = "invalid delete response" }), "delete_component")
    end
    return ({ skill_id = delete_args.skill_id }) :: skill_types.DeleteResult
end

return M
