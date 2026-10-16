-- Threads binding integration. Drives the kickside.core:threads contract under real
-- actors through contract.get():with_actor():with_scope():open() so the component
-- contract resolves the acting actor: create registers a component (visible via a
-- kickside_components row), list is access-filtered to the owner, a non-member is
-- excluded, upsert is idempotent on a natural key, and a registered
-- projection is removed via its rollback. Runs on SQLite and PostgreSQL.

local sql = require("sql")
local uuid = require("uuid")
local security = require("security")
local contract = require("contract")
local funcs = require("funcs")
local json = require("json")

local DB = "app:db"
local THREADS = "kickside.core:threads"

local CREATE = "create"
local FIND = "find"
local LOCATE = "upsert"
local UPDATE = "update"
local DELETE = "delete"
local LIST = "list"
local LIST_EVENTS = "list_events"
local FIND_EXTERNAL = "find_event_by_external"
local APPEND_EVENTS = "append_events"
local APPEND_EVENT = "append_event"
local EMIT = "emit"
local LIST_CHILDREN = "list_children"
local LIST_EDGES = "list_edges"
local LIST_CLASSES = "list_classes"
local REGISTER_PROJECTION = "register_projection"
local LIST_PROJECTIONS = "list_projections"
local CATCH_UP_PROJECTION = "catch_up_projection"
local PAUSE_PROJECTION = "pause_projection"
local RESUME_PROJECTION = "resume_projection"
local REMOVE_PROJECTION = "remove_projection"
local TEST_WORKER = "app:test_count_worker"
local PROCESS_SCOPE = "wippy.security:process"

local M = {}

function M.new()
        local suffix = uuid.v4():sub(1, 8)
        local owner = "thread-owner-" .. suffix
        local stranger = "thread-stranger-" .. suffix

        local function test_scope()
            local scope, serr = security.named_scope(PROCESS_SCOPE)
            if not scope then error("test scope missing: " .. tostring(serr)) end
            return scope
        end

        local function run_as(user_id, target, args)
            local actor = security.new_actor(user_id, { security_groups = {} })
            local svc, cerr = contract.get(THREADS)
            if cerr or not svc then error("threads contract unavailable: " .. tostring(cerr)) end
            local inst, oerr = svc:with_actor(actor):with_scope(test_scope()):open()
            if oerr or not inst then error("open threads contract failed: " .. tostring(oerr)) end
            return inst[target](inst, args)
        end

        local function as_owner(target, args)
            return run_as(owner, target, args)
        end

        local function publish_as_owner(args)
            local actor = security.new_actor(owner, { security_groups = {} })
            return funcs.new():with_actor(actor):with_scope(test_scope()):call("app:test_output_publisher", args)
        end

        -- Read a thread's component_id directly to assert the component link.
        local function component_id_of(thread_id)
            local d, e = sql.get(DB)
            if e then error(tostring(e)) end
            local rows, qerr = sql.builder.select("component_id")
                :from("kickside_thread")
                :where("id = ?", thread_id)
                :run_with(d):query()
            d:release()
            if qerr then error(tostring(qerr)) end
            return rows and rows[1] and rows[1].component_id or nil
        end

        -- Confirm a component row exists in the component module's table.
        local function component_row_exists(component_id)
            local d, e = sql.get(DB)
            if e then error(tostring(e)) end
            local rows, qerr = sql.builder.select("component_id", "impl_id")
                :from("kickside_components")
                :where("component_id = ?", component_id)
                :run_with(d):query()
            d:release()
            if qerr then error(tostring(qerr)) end
            return rows and rows[1] or nil
        end

        -- Read a component's public meta as a { key = value } map, straight from the
        -- component module's meta table, so a test can assert the thread markers.
        local function component_meta(component_id)
            local d, e = sql.get(DB)
            if e then error(tostring(e)) end
            local rows, qerr = sql.builder.select("key", "value")
                :from("kickside_component_meta")
                :where("component_id = ?", component_id)
                :run_with(d):query()
            d:release()
            if qerr then error(tostring(qerr)) end
            local meta = {}
            for _, row in ipairs(rows or {}) do
                meta[row.key] = row.value
            end
            return meta
        end

        -- Register a component FIRST through the component service (component-first),
        -- with public meta but WITHOUT the type=thread marker, so a later ensure_thread
        -- attaches a thread to a pre-existing component that the picker cannot see yet.
        local function register_bare_component(user_id, component_id, impl_id, meta)
            local actor = security.new_actor(user_id, { security_groups = {} })
            local svc, cerr = contract.get("kickside.component:component_service")
            if cerr or not svc then error("component service unavailable: " .. tostring(cerr)) end
            local inst, oerr = svc:with_actor(actor):with_scope(test_scope()):open()
            if oerr or not inst then error("open component service failed: " .. tostring(oerr)) end
            local res, rerr = inst:register({ component_id = component_id, impl_id = impl_id, meta = meta })
            if rerr or type(res) ~= "table" or res.success ~= true then
                error("register bare component failed: " .. tostring(rerr or (type(res) == "table" and res.error)))
            end
            return res.component_id
        end

        local function projection_count(thread_id)
            local d, e = sql.get(DB)
            if e then error(tostring(e)) end
            local rows, qerr = sql.builder.select("COUNT(*) AS c")
                :from("kickside_projection")
                :where("thread_id = ?", thread_id)
                :run_with(d):query()
            d:release()
            if qerr then error(tostring(qerr)) end
            return tonumber(rows and rows[1] and rows[1].c) or 0
        end

        -- Read a projection body (decoded) by thread + kind.
        local function projection_body_of(thread_id, kind)
            local d, e = sql.get(DB)
            if e then error(tostring(e)) end
            local rows, qerr = sql.builder.select("body")
                :from("kickside_projection")
                :where("thread_id = ?", thread_id)
                :where("kind = ?", kind)
                :run_with(d):query()
            d:release()
            if qerr then error(tostring(qerr)) end
            if not rows or not rows[1] then return nil end
            return json.decode((rows[1] :: any).body :: string)
        end

        -- Write a known private_context blob straight onto the component row, and
        -- read the raw stored string back, so a test can assert byte-identity.
        local function set_private_context_raw(component_id, raw)
            local d, e = sql.get(DB)
            if e then error(tostring(e)) end
            local _, uerr = d:execute(
                "UPDATE kickside_components SET private_context = $1 WHERE component_id = $2",
                { raw, component_id }
            )
            d:release()
            if uerr then error("set private_context failed: " .. tostring(uerr)) end
        end

        local function private_context_raw(component_id)
            local d, e = sql.get(DB)
            if e then error(tostring(e)) end
            local rows, qerr = sql.builder.select("private_context")
                :from("kickside_components")
                :where("component_id = ?", component_id)
                :run_with(d):query()
            d:release()
            if qerr then error(tostring(qerr)) end
            return rows and rows[1] and (rows[1] :: any).private_context or nil
        end

        local function insert_orphan_thread(thread_id, thread_class)
            local d, e = sql.get(DB)
            if e then error(tostring(e)) end
            local _, ierr = sql.builder.insert("kickside_thread")
                :set_map({
                    id = thread_id,
                    thread_class = thread_class,
                    attrs = "{}",
                    state = "open",
                    event_count = 0,
                    last_event_ts = "2026-01-01T00:00:00Z",
                    component_id = thread_id,
                    created_at = "2026-01-01T00:00:00Z",
                    updated_at = "2026-01-01T00:00:00Z",
                })
                :run_with(d):exec()
            d:release()
            if ierr then error("failed to insert orphan thread: " .. tostring(ierr)) end
        end

        -- Count events of a given type on a thread, straight from the event log, so a
        -- test can assert a drop notification landed on a subscriber's own thread.
        local function event_type_count(thread_id, event_type)
            local d, e = sql.get(DB)
            if e then error(tostring(e)) end
            local rows, qerr = sql.builder.select("COUNT(*) AS c")
                :from("kickside_event")
                :where("thread_id = ?", thread_id)
                :where("type = ?", event_type)
                :run_with(d):query()
            d:release()
            if qerr then error(tostring(qerr)) end
            return tonumber(rows and rows[1] and rows[1].c) or 0
        end

        local function delete_thread_only(thread_id)
            local d, e = sql.get(DB)
            if e then error(tostring(e)) end
            local _, derr = d:execute("DELETE FROM kickside_thread WHERE id = $1", { thread_id })
            d:release()
            if derr then error("failed to delete thread row: " .. tostring(derr)) end
        end

        local function thread_ids(res)
            local ids = {}
            if res and type(res.threads) == "table" then
                for _, t in ipairs(res.threads) do
                    ids[#ids + 1] = t.id
                end
            end
            return ids
        end

        local function index_of(list, value)
            for i, x in ipairs(list) do
                if x == value then return i end
            end
            return nil
        end

        return { suffix = suffix, owner = owner, stranger = stranger,
            test_scope = test_scope,
            run_as = run_as,
            as_owner = as_owner,
            publish_as_owner = publish_as_owner,
            component_id_of = component_id_of,
            component_row_exists = component_row_exists,
            component_meta = component_meta,
            register_bare_component = register_bare_component,
            projection_count = projection_count,
            projection_body_of = projection_body_of,
            set_private_context_raw = set_private_context_raw,
            private_context_raw = private_context_raw,
            insert_orphan_thread = insert_orphan_thread,
            event_type_count = event_type_count,
            delete_thread_only = delete_thread_only,
            thread_ids = thread_ids,
            index_of = index_of,
        }
end

return M
