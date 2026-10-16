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
local execution_identity = require("execution_identity")
local component_identity = require("component_identity")
local component_envelope = require("component_envelope")
local error_envelope = require("error_envelope")

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

-- converge makes every component of a declaring kind match its declaration: a
-- missing thread row is recreated (thread-declaring kinds), a missing declared
-- projection or cursor is registered (any kind declaring projections). Declared state thereby survives anything — a partial
-- delete, a lost row, a module uninstall/reinstall — because the next service
-- start reasserts the declaration. Boot runs it on service start and on a
-- code-changing in-place upgrade; an identical-source reinstall does not
-- trigger convergence. Each component converges under its own
-- stored execution identity (converge_executor), so projections keep running as
-- whoever owns them and the opener's framework frame never stands in for a user.
-- Components already matching their declaration are not touched at all.
function M.converge(opener_actor: any, opener_scope: any): ({ [string]: any }, error?)
    local summary: { [string]: any } = { checked = 0, healed = 0, skipped = {} }
    local function skip(component_id: string, impl_id: string, cause: error)
        (summary.skipped :: { any })[#(summary.skipped :: { any }) + 1] =
            {component_id = component_id, impl_id = impl_id, reason = cause:message(), error = error_envelope.encode(cause)}
    end

    local db, db_err = sql.get(core_db.id())
    if db_err then return summary, (errors.wrap(db_err, "converge: db unavailable") :: error) end
    if not db then return summary, missing_result("get") end
    local _db = db :: sql.DB

    -- One divergence set per declaring kind: components missing their thread row,
    -- plus components missing declared projections.
    local function divergent_components(kind: { [string]: any }): ({ [string]: boolean }, error?)
        local ids: { [string]: boolean } = {}
        -- A missing thread is recreatable only for a kind that declares its
        -- primary-thread class; projection-only kinds get their threads from
        -- other flows, so their scan covers projections alone.
        if type(kind.class) == "string" and kind.class ~= "" then
            local divergent_threads, thread_err = sql.builder
                .select("c.component_id AS component_id")
                :from("kickside_components c")
                :left_join("kickside_thread t ON t.id = c.component_id")
                :where("t.id IS NULL")
                :where("c.impl_id = ?", tostring(kind.component_impl_id or kind.impl_id))
                :run_with(_db):query()
            if thread_err then
                return ids, (errors.wrap(thread_err, "converge: thread scan failed") :: error)
            end
            for _, row in ipairs((divergent_threads or {}) :: { any }) do
                ids[tostring((row :: { [string]: any }).component_id)] = true
            end
        end
        for _, projection in ipairs((kind.projections or {}) :: { any }) do
            local decl = projection :: { [string]: any }
            -- An omitted declared key stores as the projections default — the scan
            -- must compare against what register actually wrote.
            local declared_key = decl.projection_key
            if type(declared_key) ~= "string" or declared_key == "" then
                declared_key = proj_types.KEY_DEFAULT
            end
            local escaped_kind = tostring(decl.kind):gsub("'", "''")
            local escaped_key = tostring(declared_key):gsub("'", "''")
            local cursor_key = type(decl.cursor_key) == "string" and decl.cursor_key ~= "" and decl.cursor_key or proj_types.KEY_DEFAULT
            local escaped_cursor = cursor_key:gsub("'", "''")
            local missing_rows, proj_err = sql.builder
                .select("c.component_id AS component_id")
                :from("kickside_components c")
                :join("kickside_thread t ON t.id = c.component_id")
                :left_join("kickside_projection p ON p.thread_id = t.id AND p.kind = '" .. escaped_kind .. "' AND p.projection_key = '" .. escaped_key .. "'")
                :left_join("kickside_projection_cursor pc ON pc.projection_id=p.id AND pc.cursor_key='" .. escaped_cursor .. "'")
                :left_join("kickside_job j ON j.id=pc.job_id")
                :where("(p.id IS NULL OR pc.id IS NULL OR j.id IS NULL)")
                :where("c.impl_id = ?", tostring(kind.component_impl_id or kind.impl_id))
                :run_with(_db):query()
            if proj_err then
                return ids, (errors.wrap(proj_err, "converge: projection scan failed") :: error)
            end
            for _, row in ipairs((missing_rows or {}) :: { any }) do
                ids[tostring((row :: { [string]: any }).component_id)] = true
            end
        end
        return ids, nil
    end

    for _, kind in ipairs(autoinit.declared_kinds()) do
        local k = kind :: { [string]: any }
        local divergent, scan_err = divergent_components(k)
        if scan_err then
            local _, release_err = _db:release()
            if release_err then
                return summary, error_envelope.wrap_secondary(release_err, scan_err, "converge: database release failed")
            end
            return summary, scan_err
        end
        for component_id, _ in pairs(divergent) do
            summary.checked = summary.checked + 1
            local executor, exec_err = converge_executor(component_id, opener_actor, opener_scope)
            if exec_err or not executor then
                local cause = exec_err or missing_result("executor")
                skip(component_id, tostring(k.impl_id), errors.wrap(cause, "converge identity unavailable"))
            else
                local _, converge_err = (executor :: any)
                    :call(CONVERGE_THREAD_FN, {
                        component_id = component_id,
                        impl_id = k.impl_id,
                        thread_class = k.class,
                    })
                if converge_err then
                    skip(component_id, tostring(k.impl_id), errors.wrap(converge_err, "converge_thread failed"))
                else
                    summary.healed = summary.healed + 1
                end
            end
        end
    end

    local _, release_err = _db:release()
    if release_err then return summary, (errors.wrap(release_err, "converge: database release failed") :: error) end
    return summary, nil
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
