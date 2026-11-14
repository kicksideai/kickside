-- provision: materialize a declared scoped component as a thread -- the component +
-- its event-log thread (one id, since thread.id == component.id), its declared
-- lifecycle-handler projections, and its retention / vacuum policy. This is where a
-- provisioned-kind declaration becomes real.
--
-- User-scope declarations have two lifecycle owners, both calling ensure_user:
--   - interactive users: the relay's workspace plugin, on websocket login;
--   - non-interactive / bridge service actors (which never log in): the uploads
--     process worker, at first ingest (its first touch of the actor's uploads
--     component).
--
-- Every step is idempotent: upsert is get-or-create, register_projection is
-- an upsert, retention upsert is keyed on the thread. So the whole materialization is
-- CONVERGENT -- a partial run completes on the next call. That is the cross-slice
-- equivalent of a single transaction: a literal one would have to duplicate each
-- slice's insert logic (component + thread + projection + retention), which is the
-- parallel implementation this whole effort removes.

local contract = require("contract")
local funcs = require("funcs")
local sql = require("sql")
local autoinit = require("autoinit")
local retention_repo = require("retention_repo")
local core_db = require("core_db")
local proj_types = require("proj_types")
local proj_register = require("proj_register")
local execution_identity = require("execution_identity")
local component_identity = require("component_identity")
local component_envelope = require("component_envelope")
local error_envelope = require("error_envelope")
local lifecycle_log = require("component_lifecycle_log")
local component_lifecycle = require("component_lifecycle")

local M = {}

local THREADS = "kickside.core:threads"
-- The convergence primitive is a plain function entry, not a contract method: a
-- live module install validates the existing binding against an updated
-- definition per entry, so a definition may never grow a method in an upgrade.
local CONVERGE_THREAD_FN = "kickside.core.threads:converge_thread_method"
-- The trusted owner entry that resolves a component's stored identity to converge it.
local CONVERGE_OWNER = "kickside.core.threads:converge"
local COMPONENT_SERVICE = "kickside.component:component_service"

local function missing_result(field: string): error
    return errors.new({kind = errors.INTERNAL, message = "provisioning dependency returns no result: " .. field,
        retryable = false, details = {code = "provision_response", field = field}})
end

-- apply_grants writes each declared additional grant onto the provisioned component
-- through grant_subtree (the canonical access cascade), beyond the owner's implicit
-- FULL. Idempotent: grant_subtree upserts the direct grant, so re-running converges.
-- Opened with the provisioning actor + scope so the grant runs under the owner's ADMIN.
local function apply_grants(actor: any, scope: any, component_id: string, grants: { any }): error?
    if type(grants) ~= "table" or #grants == 0 then
        return nil
    end
    local cdef, cerr = contract.get(COMPONENT_SERVICE)
    if cerr then return (errors.wrap(cerr, "component service unavailable") :: error) end
    if not cdef then return missing_result("grants_get") end
    local svc, oerr = (cdef :: any):with_actor(actor):with_scope(scope):open()
    if oerr then return (errors.wrap(oerr, "open component service failed") :: error) end
    if not svc then return missing_result("grants_open") end
    for _, g in ipairs(grants) do
        local grant = g :: { subject_id: string, subject_type: string?, access_mask: integer }
        local res, herr = (svc :: any):grant_subtree({
            root_component_id = component_id,
            subject = { subject_id = grant.subject_id, subject_type = grant.subject_type },
            access_mask = grant.access_mask,
        })
        if herr then
            return (errors.wrap(herr, "grant_subtree '" .. tostring(grant.subject_id) .. "' failed") :: error)
        end
        if type(res) ~= "table" then return missing_result("grant") end
        if (res :: any).success == false then
            return component_envelope.error_of(res, "grant_subtree", "grant_subtree '" .. tostring(grant.subject_id) .. "'")
        end
        if (res :: any).success ~= true then return missing_result("grant") end
    end
    return nil
end

-- materialize one declaration for scope_key against an actor-bound threads contract.
-- actor + scope are the provisioning identity, reused to apply the declaration's grants.
local function materialize(threads: any, actor: any, scope: any, scope_key: string, decl: any): (string?, error?)
    local component_id = autoinit.component_id(scope_key, decl.class :: string) :: string
    local declared, declaration_err = autoinit.thread_for_impl(decl.impl_id)
    if declaration_err then return nil, declaration_err end

    -- The component AND its thread share one id (get-or-create, idempotent).
    local upsert_args: { [string]: any } = {
        thread_id = component_id,
        impl_id = decl.impl_id,
        thread_class = (declared or {}).class or decl.class,
        title = decl.title,
        icon = decl.icon,
    }
    local _, upsert_err = threads:upsert(upsert_args)
    if upsert_err then
        return nil, upsert_err
    end

    -- The thread writer applies declared thread projections from decl.impl_id on
    -- first create. Provisioning does not carry a second projection-registration
    -- path; reruns only converge access + retention.

    -- Retention / vacuum policy for the component's thread (idempotent upsert).
    -- ALWAYS create a policy so every provisioned thread is governed by a sane
    -- default window (the retention-defaults rule); a declaration may tighten the
    -- event window, an omitted one falls to consts.DEFAULTS. Without this a thread
    -- with no declared retention would carry no policy row and never be swept.
    local rdb, rdb_err = sql.get(core_db.id())
    if rdb_err then return nil, (errors.wrap(rdb_err, "provision retention database unavailable") :: error) end
    if not rdb then return nil, missing_result("get") end
    local r = decl.retention
    local windows: { [string]: any } = {}
    if type(r) == "table" and type(r.event_days) == "number" then
        windows.event_hot_retention_days = r.event_days
    end
    local _, retention_err = retention_repo.upsert(rdb, component_id :: string, windows)
    local _, release_err = rdb:release()
    if release_err then
        if retention_err then
            return nil, error_envelope.wrap_secondary(release_err, retention_err, "provision retention database release failed")
        end
        return nil, (errors.wrap(release_err, "provision retention database release failed") :: error)
    end
    if retention_err then return nil, retention_err end

    -- Declared additional grants (e.g. admin READ, user WRITE-only on a system thread).
    local grant_err = apply_grants(actor, scope, component_id :: string, (decl.grants or {}) :: { any })
    if grant_err then
        return nil, grant_err
    end

    return component_id :: string, nil
end

-- provision_scope materializes every declaration of want_scope for scope_key, opening
-- the threads contract bound to the actor so the components are owned by them.
-- Idempotent + convergent; returns the provisioned ids.
local function provision_scope(actor: any, scope: any, scope_key: string, want_scope: string): ({ string }?, error?)
    if type(scope_key) ~= "string" or scope_key == "" then
        return nil, (errors.new({ message = "scope_key is required", kind = errors.INVALID }) :: error)
    end
    local svc, cerr = contract.get(THREADS)
    if cerr then return nil, (errors.wrap(cerr, "threads contract unavailable") :: error) end
    if not svc then return nil, missing_result("threads_get") end
    local threads, oerr = (svc :: any):with_actor(actor):with_scope(scope):open()
    if oerr then return nil, (errors.wrap(oerr, "open threads contract failed") :: error) end
    if not threads then return nil, missing_result("threads_open") end

    local ids: { string } = {}
    for _, decl in ipairs(autoinit.declarations()) do
        if decl.scope == want_scope and scope:evaluate(actor, "registry.get", decl.impl_id) == "allow" then
            local id, mat_err = materialize(threads, actor, scope, scope_key, decl)
            if mat_err then return nil, mat_err end
            ids[#ids + 1] = id :: string
        end
    end
    return ids, nil
end

-- The frame a component converges under: the component's own stored execution
-- identity, resolved by this trusted owner (the converge entry) for the
-- component root, or the opener's framework frame for a framework-created
-- component that carries none. A parked or unresolvable identity is returned as
-- the error and the component is skipped visibly.
local function converge_executor(component_id: string, opener_actor: any, opener_scope: any): (any?, error?)
    local stored, load_err = component_identity.execution_identity_of(component_id)
    if load_err then return nil, load_err end
    if stored ~= nil then
        return execution_identity.bind(stored, { deferred_owner = CONVERGE_OWNER, execution_root = component_id })
    end
    -- with_actor returns (nil, err) when the process lacks the funcs.security
    -- capability; chaining onto nil would crash the whole provisioner.
    local executor, actor_err = funcs.new():with_actor(opener_actor)
    if actor_err then return nil, actor_err end
    if not executor then return nil, missing_result("actor") end
    local scoped, scope_err = (executor :: any):with_scope(opener_scope)
    if scope_err then return nil, scope_err end
    if not scoped then return nil, missing_result("scope") end
    return scoped, nil
end

-- Each maintenance turn repairs at most 256 divergent components using declaration
-- digests and visits at most 256 lifecycle components. The continuation is a
-- keyset position, never an accumulated work list.
function M.converge(opener_actor: any, opener_scope: any, continuation: table?): ({ [string]: any }, error?)
    local summary: { [string]: any } = {checked = 0, healed = 0, skipped = {}}
    local db, db_err = sql.get(core_db.id())
    if db_err then return summary, errors.wrap(db_err, "converge: db unavailable") end
    if not db then return summary, missing_result("get") end
    local lifecycle_healed = false
    local function finish(cause: error?): ({ [string]: any }, error?)
        if lifecycle_healed then
            local _, wake_err = component_lifecycle.committed()
            if wake_err then
                cause = cause and error_envelope.wrap_secondary(wake_err, cause, "converge: job worker wake failed")
                    or errors.wrap(wake_err, "converge: job worker wake failed")
            end
        end
        local _, release_err = db:release()
        if release_err and cause then return summary, error_envelope.wrap_secondary(release_err, cause, "converge: database release failed") end
        return summary, release_err and errors.wrap(release_err, "converge: database release failed") or cause
    end
    local function converge_lifecycle(component_id: string, impl_id: string): error?
        local dbtype, type_err = db:type()
        if type_err then return type_err end
        local tx, begin_err = db:begin()
        if begin_err then return begin_err end
        if not tx then return missing_result("begin") end
        local _, own_err = component_lifecycle.converge_own(tx, tostring(dbtype), component_id, impl_id)
        if own_err then
            local _, rollback_err = tx:rollback()
            if rollback_err then return error_envelope.wrap_secondary(rollback_err, own_err, "converge: lifecycle rollback failed") end
            return own_err
        end
        local _, commit_err = tx:commit()
        if not commit_err then lifecycle_healed = true end
        return commit_err
    end
    local function quoted(value: string): string return "'" .. value:gsub("'", "''") .. "'" end
    local kinds = autoinit.declared_kinds()
    table.sort(kinds, function(a, b) return a.impl_id < b.impl_id end)
    local first = continuation and continuation.kind_index or 1
    local after = continuation and continuation.after or nil
    local remaining = 256
    for index = first, #kinds do
        local kind = kinds[index]
        local existing, existing_err = sql.builder.select("c.component_id AS component_id")
            :from("kickside_components c"):where("c.impl_id = ?", tostring(kind.component_impl_id or kind.impl_id))
            :limit(1):run_with(db):query()
        if existing_err then return finish(errors.wrap(existing_err, "converge: component scan failed")) end
        if type(existing) ~= "table" then return finish(missing_result("components")) end
        if #existing > 0 then
            local own_lifecycle, on_thread = false, type(kind.class) == "string" and kind.class ~= ""
            for _, decl in ipairs(kind.projections or {}) do
                if decl.on == autoinit.PROJECTION_ON.LIFECYCLE then own_lifecycle = true end
                if decl.on == nil or decl.on == "" or decl.on == autoinit.PROJECTION_ON.THREAD then on_thread = true end
            end
            own_lifecycle = own_lifecycle and not lifecycle_log.is_exempt(tostring(kind.component_impl_id or kind.impl_id))
            local candidates: {any}? = nil
            local lifecycle_id = "NULL"
            if own_lifecycle then
                local page = sql.builder.select("c.component_id AS component_id"):from("kickside_components c")
                    :where("c.impl_id = ?", tostring(kind.component_impl_id or kind.impl_id))
                if after then page = page:where("c.component_id > ?", after) end
                local rows, page_err = page:order_by("c.component_id ASC"):limit(remaining):run_with(db):query()
                if page_err then return finish(errors.wrap(page_err, "converge: lifecycle page failed")) end
                if type(rows) ~= "table" then return finish(missing_result("lifecycle_page")) end
                candidates = rows
                local cases: {string} = {}
                for _, row in ipairs(rows) do
                    cases[#cases + 1] = "WHEN " .. quoted(tostring(row.component_id)) .. " THEN " .. quoted(lifecycle_log.thread_id(tostring(row.component_id)))
                end
                if #cases > 0 then
                    lifecycle_id = "CASE c.component_id " .. table.concat(cases, " ") .. " END"
                    local dbtype, type_err = db:type()
                    if type_err then return finish(type_err) end
                    if dbtype == "postgres" then lifecycle_id = "CAST(" .. lifecycle_id .. " AS UUID)" end
                end
            end
            local scan = sql.builder.select("c.component_id AS component_id")
                :from("kickside_components c")
                :left_join("kickside_thread t ON t.id=c.component_id")
                :where("c.impl_id = ?", tostring(kind.component_impl_id or kind.impl_id))
            local predicates: {string} = {}
            local args: {any} = {}
            if type(kind.class) == "string" and kind.class ~= "" then
                scan = scan:left_join("kickside_component_meta type_meta ON type_meta.component_id=c.component_id AND type_meta.key='type'")
                    :left_join("kickside_component_meta class_meta ON class_meta.component_id=c.component_id AND class_meta.key='thread_class'")
                predicates[#predicates + 1] = "(t.id IS NULL OR t.thread_class <> ? OR type_meta.value IS NULL OR type_meta.value <> 'thread' OR class_meta.value IS NULL OR class_meta.value <> t.thread_class)"
                args[#args + 1] = kind.class
            end
            for pindex, decl in ipairs(kind.projections or {}) do
                local own = decl.on == autoinit.PROJECTION_ON.LIFECYCLE and own_lifecycle
                if own or decl.on == nil or decl.on == "" or decl.on == autoinit.PROJECTION_ON.THREAD then
                    local key = type(decl.projection_key) == "string" and decl.projection_key ~= "" and decl.projection_key or proj_types.KEY_DEFAULT
                    local cursor_key = type(decl.cursor_key) == "string" and decl.cursor_key ~= "" and decl.cursor_key or proj_types.KEY_DEFAULT
                    local expected, declaration_err = proj_register.declaration_body({worker_ref = decl.worker_ref,
                        worker_input_mode = decl.input_mode, worker_config = decl.worker_config, events = decl.events, drop_notify = decl.drop_notify})
                    if declaration_err then return finish(declaration_err) end
                    local digest, digest_err = proj_register.declaration_digest(expected)
                    if digest_err then return finish(digest_err) end
                    local p, pc, j = "p" .. tostring(pindex), "pc" .. tostring(pindex), "j" .. tostring(pindex)
                    local thread_id = own and lifecycle_id or "t.id"
                    scan = scan:left_join("kickside_projection " .. p .. " ON " .. p .. ".thread_id=" .. thread_id .. " AND " .. p .. ".kind=" .. quoted(decl.kind) .. " AND " .. p .. ".projection_key=" .. quoted(key))
                        :left_join("kickside_projection_cursor " .. pc .. " ON " .. pc .. ".projection_id=" .. p .. ".id AND " .. pc .. ".cursor_key=" .. quoted(cursor_key))
                        :left_join("kickside_job " .. j .. " ON " .. j .. ".id=" .. pc .. ".job_id")
                    predicates[#predicates + 1] = "(" .. (own and "" or "t.id IS NOT NULL AND ") .. "(" .. p .. ".id IS NULL OR " .. p .. ".declaration_digest IS NULL OR " .. p .. ".declaration_digest <> ? OR " .. pc .. ".id IS NULL OR " .. j .. ".id IS NULL))"
                    args[#args + 1] = digest
                end
            end
            if #predicates > 0 then
                scan = scan:where("(" .. table.concat(predicates, " OR ") .. ")", table.unpack(args))
                if candidates then
                    if #candidates > 0 then scan = scan:where("c.component_id <= ?", tostring(candidates[#candidates].component_id))
                    else scan = scan:where("1=0") end
                end
                if after then scan = scan:where("c.component_id > ?", after) end
                local rows, scan_err = scan:order_by("c.component_id ASC"):limit(remaining):run_with(db):query()
                if scan_err then return finish(errors.wrap(scan_err, "converge: declaration scan failed")) end
                if type(rows) ~= "table" then return finish(missing_result("scan")) end
                for _, row in ipairs(rows) do
                    local component_id = tostring(row.component_id)
                    summary.checked = summary.checked + 1
                    local cause: error? = nil
                    if on_thread then
                        local executor, exec_err = converge_executor(component_id, opener_actor, opener_scope)
                        if exec_err or not executor then
                            cause = errors.wrap(exec_err or missing_result("executor"), "converge identity unavailable")
                        else
                            local _, converge_err = executor:call(CONVERGE_THREAD_FN, {component_id = component_id,
                                impl_id = kind.impl_id, thread_class = kind.class})
                            if converge_err then cause = errors.wrap(converge_err, "converge_thread failed") end
                        end
                    end
                    if not cause and own_lifecycle then
                        cause = converge_lifecycle(component_id, tostring(kind.impl_id))
                    end
                    if cause then
                        summary.skipped[#summary.skipped + 1] = {component_id = component_id, impl_id = kind.impl_id,
                            reason = cause:message(), error = error_envelope.encode(cause)}
                    else
                        summary.healed = summary.healed + 1
                    end
                end
                local visited = candidates or rows
                if #visited == remaining then
                    summary.continuation = {kind_index = index, after = tostring(visited[#visited].component_id)}
                    return finish(nil)
                end
                remaining = remaining - #visited
            end
        end
        after = nil
    end
    return finish(nil)
end

-- ensure_user materializes every user-scope declaration for the actor. Two owners
-- call it: the relay workspace plugin on interactive login, and the uploads process
-- worker at first ingest for non-interactive/bridge actors that never log in. The
-- actor owns the provisioned components; idempotent, so either owner converges.
function M.ensure_user(actor: any, scope: any, scope_key: string): ({ string }?, error?)
    return provision_scope(actor, scope, scope_key, autoinit.SCOPE.USER :: string)
end

-- ensure_system materializes every system-scope declaration (called once at boot under
-- a system actor, e.g. system:lifecycle). System singletons share the fixed
-- SYSTEM_SCOPE_KEY so the same components resolve on every boot, owned by the system
-- actor with whatever additional grants each declaration carries.
function M.ensure_system(actor: any, scope: any): ({ string }?, error?)
    return provision_scope(actor, scope, autoinit.SYSTEM_SCOPE_KEY :: string, autoinit.SCOPE.SYSTEM :: string)
end

return M
