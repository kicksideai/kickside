-- Component access operations over direct grants (design v4 §6.6).
--
-- Only direct grants are stored: one row per (component, subject_type,
-- subject_id), source = the component itself. Effective access is derived at
-- check time as the bitwise union of the subjects' direct grants on the
-- component and on every strict ancestor (access_subjects.effective_mask_query),
-- so a grant, revoke or move is one bounded write and takes effect on the next
-- read. The caller owns the transaction.
local sql = require("sql")
local time = require("time")
local uuid = require("uuid")
local access_subjects = require("access_subjects")
local placement = require("placement")
local component_types = require("component_types")
local access_policy = require("access_policy")
local execution_identity = require("execution_identity")
local implementation_access = require("implementation_access")

type Executor = sql.DB | sql.Transaction
type Subject = { subject_type: string, subject_id: string }

local function internal(message: string, cause: error?): error
    if cause then return errors.wrap(cause, message) end
    return errors.new({message = message, kind = errors.INTERNAL, retryable = false})
end

local function invalid(message: string): error
    return (errors.new({ message = message, kind = errors.INVALID }) :: error)
end

-- Typed grant subject of a GRANT/REVOKE payload. The subject type is required
-- (IDENTITY-1 §5): an absent type is a typed INVALID, never a user default.
local function payload_subject(payload: any): (Subject?, error?)
    if not payload.subject_id or payload.subject_id == "" then
        return nil, invalid("subject ID is required")
    end
    local subject_type, type_err = access_policy.normalize_subject_type(payload.subject_type)
    if type_err then return nil, type_err end
    if not subject_type then return nil, invalid("subject_type is required") end
    return { subject_type = subject_type, subject_id = tostring(payload.subject_id) }, nil
end

-- GRANT_ACCESS payload: { component_id, subject_id, subject_type, access_mask }.
-- Upserts the direct grant of that typed subject on the component.
local function grant_access(tx: Executor, _db: Executor, command: component_types.Command): (component_types.CommandResult?, error?)
    local payload = command.payload or {}
    if not payload.component_id then return nil, invalid("component ID is required") end
    local subject, subject_err = payload_subject(payload)
    if subject_err or not subject then return nil, subject_err end
    local access_mask, mask_err = access_policy.normalize_access_mask(payload.access_mask)
    if mask_err then return nil, mask_err end

    local _, err = sql.builder.insert(component_types.TABLES.ACCESS)
        :set_map({
            access_id = uuid.v7(),
            subject_id = subject.subject_id,
            subject_type = subject.subject_type,
            component_id = payload.component_id,
            source_component_id = payload.component_id,
            access_mask = access_mask,
            inherited = 0,
            created_at = time.now():utc():format_rfc3339(),
        })
        :suffix("ON CONFLICT (subject_type, subject_id, component_id, source_component_id) DO UPDATE SET access_mask = excluded.access_mask")
        :run_with(tx):exec()
    if err then return nil, internal("failed to grant access", err) end

    return {
        component_id = payload.component_id,
        subject_id = subject.subject_id,
        subject_type = subject.subject_type,
        access_mask = access_mask,
        changes_made = true,
    }, nil
end

-- REVOKE_ACCESS payload: { component_id, subject_id, subject_type }. Removes the
-- direct grant of that typed subject.
local function revoke_access(tx: Executor, _db: Executor, command: component_types.Command): (component_types.CommandResult?, error?)
    local payload = command.payload or {}
    if not payload.component_id then return nil, invalid("component ID is required") end
    local subject, subject_err = payload_subject(payload)
    if subject_err or not subject then return nil, subject_err end

    local result, err = sql.builder.delete(component_types.TABLES.ACCESS)
        :where("component_id = ?", payload.component_id)
        :where("subject_type = ?", subject.subject_type)
        :where("subject_id = ?", subject.subject_id)
        :where("source_component_id = ?", payload.component_id)
        :run_with(tx):exec()
    if err then return nil, internal("failed to revoke access", err) end

    return {
        component_id = payload.component_id,
        subject_id = subject.subject_id,
        subject_type = subject.subject_type,
        changes_made = result.rows_affected > 0,
        rows_affected = result.rows_affected,
    }, nil
end

-- Effective mask of the subjects on one component, or nil when no grant reaches it.
local function effective_mask(tx: Executor, subjects: { Subject }, component_id: string): (integer?, error?)
    local statement, args = access_subjects.effective_mask_query(subjects, component_id)
    local rows, err = tx:query(statement, args)
    if err then return nil, internal("failed to read component access", err) end
    if not rows or not rows[1] then return nil, nil end
    return math.tointeger(tonumber(rows[1].access_mask)), nil
end

-- Check whether the actor's effective access on a component carries the required
-- bits. Answers (allowed, err): false with no error is an access refusal; an
-- error is a failed read of the grants or placement, never a refusal.
local function check_user_access(tx: Executor, user_id: string?, component_id: string?, required_mask: integer?, supplied_subjects: { Subject }?, supplied_prefixes: { string }?, snapshot_given: boolean?): (boolean, error?)
    if not user_id or not component_id or not required_mask then
        return false, nil
    end

    local subjects = supplied_subjects
    local snapshot_err: error? = nil
    if not snapshot_given then subjects, snapshot_err = access_subjects.resolve(user_id) end
    if snapshot_err then return false, snapshot_err end
    if not subjects or #subjects == 0 then return false, nil end

    local mask, mask_err = effective_mask(tx, subjects :: { Subject }, component_id)
    if mask_err then return false, mask_err end
    if mask == nil or not access_policy.has_all(mask, required_mask) then
        return false, nil
    end

    local permitted, implementation_err = implementation_access.check(tx, component_id)
    if implementation_err then return false, implementation_err end
    if not permitted then return false, nil end

    -- Optional injected narrowing: an acting identity confined to whitelisted subtrees
    -- only passes for components inside them. Mirrors the read path; AND-ed onto the
    -- grant check, reject-only. Empty list (deny-all) fails since no path is under it.
    local prefixes = supplied_prefixes
    if not snapshot_given then prefixes, snapshot_err = access_subjects.access_filter(user_id) end
    if snapshot_err then return false, snapshot_err end
    if prefixes then
        local node, node_err = placement.read_node(tx, component_id)
        if node_err then return false, internal("failed to read component placement", node_err) end
        if not node or not placement.path_under_any((node :: any).path, prefixes) then
            return false, nil
        end
    end

    return true, nil
end

-- Components of the subtree rooted at root_id that the subject reaches.
local function subtree_reach(tx: Executor, root_id: string, subject: Subject): (integer?, error?)
    local reach, reach_args = access_subjects.reach_rows({ subject }, nil)
    local args: { any } = {}
    for _, v in ipairs(reach_args) do args[#args + 1] = v end
    args[#args + 1] = root_id
    args[#args + 1] = root_id
    local statement = access_subjects.numbered("SELECT COUNT(DISTINCT x.component_id) AS n FROM (" .. reach .. ") x"
        .. " WHERE x.component_id = ? OR x.component_id IN (SELECT component_id FROM "
        .. component_types.TABLES.ANCESTOR .. " WHERE ancestor_id = ? AND depth > 0)")
    local rows, err = tx:query(statement, args)
    if err then return nil, internal("subtree access count failed", err) end
    return math.floor(tonumber(rows and rows[1] and rows[1].n) or 0), nil
end

-- Reject an operation that would remove the last admin of a component: the
-- direct ADMIN grants on the component, excluding framework system grants.
local function check_last_admin(tx: Executor, component_id: string, subject: Subject): error?
    local ADMIN = component_types.ACCESS.ADMIN
    local rows, err = sql.builder.select("subject_type", "subject_id")
        :from(component_types.TABLES.ACCESS)
        :where("component_id = ?", component_id)
        :where("source_component_id = ?", component_id)
        :where("(access_mask & ?) = ?", ADMIN, ADMIN)
        :run_with(tx):query()
    if err then return internal("last-admin check", err) end

    local admin_count, target_is_admin = 0, false
    for _, g in ipairs((rows or {}) :: { any }) do
        local sid = (g :: any).subject_id
        if type(sid) == "string" and string.sub(sid, 1, 7) ~= "system:" then
            admin_count = admin_count + 1
            if sid == subject.subject_id and (g :: any).subject_type == subject.subject_type then
                target_is_admin = true
            end
        end
    end
    if target_is_admin and admin_count <= 1 then
        return invalid("at least one admin is required")
    end
    return nil
end

-- Grant (or revoke) a typed subject on a subtree: one direct grant on the root,
-- which every descendant inherits through the ancestor relation.
local function apply_subtree_access(tx: Executor, db: Executor, root_component_id: string, subject_id: string, access_mask: integer, revoke: boolean, subject_type: string?): (component_types.SubtreeResult?, error?)
    local subject, subject_err = payload_subject({ subject_id = subject_id, subject_type = subject_type })
    if subject_err or not subject then return nil, subject_err end

    -- Last-admin guard: a revoke or a downgrade (mask without ADMIN bit) on the
    -- root must not remove the sole admin, whatever the entry point.
    local loses_admin = revoke or not access_policy.has_all(access_mask, component_types.ACCESS.ADMIN)
    if loses_admin then
        local guard_err = check_last_admin(tx, root_component_id, subject)
        if guard_err then return nil, guard_err end
    end

    local root, rerr = placement.read_node(tx, root_component_id)
    if rerr then return nil, rerr end
    if not root then
        return nil, (errors.new({ message = "root component not found", kind = errors.NOT_FOUND }) :: error)
    end

    local before, before_err = subtree_reach(tx, root_component_id, subject)
    if before_err then return nil, before_err end

    local cmd_type = revoke and component_types.COMMAND_TYPES.REVOKE_ACCESS or component_types.COMMAND_TYPES.GRANT_ACCESS
    local cmd_payload: { [string]: any } = {
        component_id = root_component_id, subject_id = subject.subject_id, subject_type = subject.subject_type,
    }
    if not revoke then cmd_payload.access_mask = access_mask end
    local handler = revoke and revoke_access or grant_access
    local res, herr = handler(tx, db, { type = cmd_type, payload = cmd_payload })
    if herr then return nil, herr end

    -- affected: subtree components the subject gains (grant) or loses (revoke).
    local after, after_err = subtree_reach(tx, root_component_id, subject)
    if after_err then return nil, after_err end
    local affected = revoke and ((before :: integer) - (after :: integer)) or (after :: integer)
    local changed = (res and res.changes_made) == true
    return { root_component_id = root_component_id, affected = affected, changes_made = changed }, nil
end

local function grant_rows(rows: { any }?): ({ any }?, error?)
    local out = {}
    for _, r in ipairs(rows or {}) do
        -- System actors (system:*) are infrastructure grants, never user/group
        -- shares; they are left out of every enumerated grant set.
        local sid = r.subject_id
        if type(sid) ~= "string" or string.sub(sid, 1, 7) ~= "system:" then
            -- subject_type is NOT NULL in DDL: a row without one is corrupt,
            -- and inventing "user" for it would fabricate a grant subject.
            if type(r.subject_type) ~= "string" or r.subject_type == "" then
                return nil, internal("grant row without subject_type")
            end
            out[#out + 1] = {
                subject_id = sid,
                subject_type = r.subject_type,
                access_mask = tonumber(r.access_mask) or 0,
                component_id = r.component_id,
            }
        end
    end
    return out, nil
end

local function with_db(read: (sql.DB) -> (any, error?)): (any, error?)
    local db, db_err = sql.get(component_types.db_id())
    if db_err then return nil, errors.wrap(db_err, "component access database unavailable") end
    if not db then
        return nil, errors.new({message = "component access database response is invalid", kind = errors.INTERNAL,
            retryable = false, details = {code = "component_access_response", field = "database"}})
    end
    local conn = db :: sql.DB
    local result, err = read(conn)
    conn:release()
    return result, err
end

-- The direct grants made on a component: { { subject_id, subject_type,
-- access_mask } }. These are what the share UI manages and can revoke here;
-- grants on ancestors are managed at their own component. A trusted read (the
-- caller gates ADMIN).
local function list_access(component_id: string?): (any, error?)
    if not component_id or component_id == "" then
        return nil, invalid("component_id is required")
    end
    return with_db(function(db: sql.DB): (any, error?)
        local rows, err = sql.builder.select("subject_id", "subject_type", "access_mask", "component_id")
            :from(component_types.TABLES.ACCESS)
            :where("component_id = ?", component_id)
            :where("source_component_id = ?", component_id)
            :run_with(db):query()
        if err then return nil, internal("failed to read access", err) end
        local out, rows_err = grant_rows(rows)
        if rows_err then return nil, rows_err end
        for _, row in ipairs(out or {}) do row.component_id = nil end
        return out, nil
    end)
end

-- Every direct grant that reaches a component: those on the component and on
-- each strict ancestor, each row naming the component it was made on. The
-- effective-access input for recipient resolution. A trusted read.
local function reaching_grants(component_id: string?): (any, error?)
    if not component_id or component_id == "" then
        return nil, invalid("component_id is required")
    end
    return with_db(function(db: sql.DB): (any, error?)
        local rows, err = db:query("SELECT g.subject_id, g.subject_type, g.access_mask, g.component_id FROM "
            .. component_types.TABLES.ACCESS .. " g WHERE g.component_id = $1"
            .. " UNION ALL SELECT g.subject_id, g.subject_type, g.access_mask, g.component_id FROM "
            .. component_types.TABLES.ANCESTOR .. " a JOIN " .. component_types.TABLES.ACCESS
            .. " g ON g.component_id = a.ancestor_id WHERE a.component_id = $2 AND a.depth > 0",
            { component_id, component_id })
        if err then return nil, internal("failed to read reaching grants", err) end
        return grant_rows(rows)
    end)
end

-- Component ids are UUIDs; any other resource id names no component and
-- carries no component grant.
local UUID_PATTERN = "^%x%x%x%x%x%x%x%x%-%x%x%x%x%-%x%x%x%x%-%x%x%x%x%-%x%x%x%x%x%x%x%x%x%x%x%x$"

-- principal_masks(principal, resource_ids) -> { [resource_id] = mask } of the
-- typed principal's effective component grants (direct and cascaded) on each
-- resource it reaches; a resource it holds nothing on is absent. A trusted read.
local function principal_masks(principal: any, resource_ids: { string }): ({ [string]: integer }?, error?)
    local subjects, subjects_err = access_subjects.principal_subjects(principal)
    if subjects_err then return nil, subjects_err end
    return with_db(function(db: sql.DB): (any, error?)
        local out: { [string]: integer } = {}
        for _, id in ipairs(resource_ids) do
            if type(id) == "string" and id:match(UUID_PATTERN) and #subjects > 0 then
                local mask, mask_err = effective_mask(db, subjects, id)
                if mask_err then return nil, mask_err end
                if mask ~= nil then out[id] = mask :: integer end
            end
        end
        return out, nil
    end)
end

-- Read a component's recorded owner (the OWNER_META_KEY metadata), or nil.
local function component_owner_record(component_id: string?): (any?, error?)
    if not component_id or component_id == "" then
        return nil, nil
    end
    return with_db(function(db: sql.DB): (any, error?)
        local rows, err = sql.builder.select("value")
            :from(component_types.TABLES.META)
            :where("component_id = ?", component_id)
            :where("key = ?", component_types.OWNER_META_KEY)
            :limit(1)
            :run_with(db):query()
        if err then return nil, internal("failed to read owner", err) end
        if rows and rows[1] then
            local owner = tostring(rows[1].value)
            local principal = execution_identity.principal_of_key(owner)
            return { actor_id = owner, principal = principal }, nil
        end
        return nil, nil
    end)
end

local function component_owner(component_id: string?): (string?, error?)
    local record, err = component_owner_record(component_id)
    return record and record.actor_id or nil, err
end

local function canonicalize_email_grants(tx: Executor, resolve_subject: any): (boolean?, error?)
    local rows, query_err = tx:query("SELECT * FROM " .. component_types.TABLES.ACCESS
        .. " WHERE subject_type = 'user' AND subject_id LIKE '%@%'")
    if query_err then return nil, internal("failed to read email grants", query_err) end
    for _, row in ipairs(rows or {}) do
        local canonical_id, resolve_err = resolve_subject(row.subject_id)
        if resolve_err then return nil, resolve_err end
        if canonical_id and canonical_id ~= row.subject_id then
            local _, upsert_err = tx:execute("INSERT INTO " .. component_types.TABLES.ACCESS
                .. " (access_id, subject_type, subject_id, component_id, source_component_id, access_mask, inherited, created_at)"
                .. " VALUES ($1, 'user', $2, $3, $4, $5, $6, $7)"
                .. " ON CONFLICT (subject_type, subject_id, component_id, source_component_id)"
                .. " DO UPDATE SET access_mask = " .. component_types.TABLES.ACCESS .. ".access_mask | excluded.access_mask",
                { uuid.v7(), canonical_id, row.component_id, row.source_component_id, row.access_mask, row.inherited, row.created_at })
            if upsert_err then return nil, internal("failed to canonicalize email grant", upsert_err) end
            local _, delete_err = sql.builder.delete(component_types.TABLES.ACCESS)
                :where("access_id = ?", row.access_id):run_with(tx):exec()
            if delete_err then return nil, internal("failed to remove canonicalized email grant", delete_err) end
        end
    end
    return true, nil
end

return {
    canonicalize_email_grants = canonicalize_email_grants,
    grant_access = grant_access,
    revoke_access = revoke_access,
    check_user_access = check_user_access,
    apply_subtree_access = apply_subtree_access,
    list_access = list_access,
    reaching_grants = reaching_grants,
    principal_masks = principal_masks,
    component_owner = component_owner,
    component_owner_record = component_owner_record,
    effective_mask_query = access_subjects.effective_mask_query,
}
