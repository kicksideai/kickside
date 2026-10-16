-- The finalizer markers kb10 emits after source materialization must be declared
-- event types owned by the knowledge injection kind, so the injection thread accepts
-- them and the digest projection can consume them.

local test = require("test")
local funcs = require("funcs")
local sql = require("sql")
local uuid = require("uuid")
local security = require("security")
local json = require("json")
local contract = require("contract")

local DB = "app:db"
local THREADS_CONTRACT = "kickside.core:threads"
local THREAD_CLASS = "kickside.knowledge.injection"
local EMBED_BINDING = "test.kb:embeddable"
local ENGINE_IMPL = "app:test_engine_wiki"
local DIGEST_REQUESTED = "kickside.knowledge.events:digest.requested"
local TREATMENT_REQUESTED = "kickside.knowledge.events:treatment.requested"
local FINALIZER_SOURCE = "knowledge.source.finalizer"

local function db(): any
    local d, err = sql.get(DB)
    if err then error("db connect failed: " .. tostring(err)) end
    return d
end

-- A reconstructable user scope: declaring the source projection persists the caller's
-- execution identity, which requires a scope the resolver can rebuild (a named process
-- scope cannot be reconstructed here). Mirrors thread_ingest_identity_test.
local function limited_scope(): any
    local pol, err = security.policy("app:limited_user")
    if not pol then error("limited policy missing: " .. tostring(err)) end
    local deny, deny_err = security.policy("app:limited_no_process_scope")
    if not deny then error("limited deny policy missing: " .. tostring(deny_err)) end
    return security.new_scope({ pol, deny })
end

local function insert_meta(d: any, component_id: string, key: string, value: string): ()
    local _, err = sql.builder.insert("kickside_component_meta")
        :set_map({
            meta_id = uuid.v7(),
            component_id = component_id,
            key = key,
            value = value,
            created_at = 0,
            updated_at = 0,
        })
        :run_with(d):exec()
    if err then error("meta insert failed: " .. tostring(err)) end
end

local function seed_kb(component_id: string, owner: string): ()
    local d = db()
    local _, comp_err = sql.builder.insert("kickside_components")
        :set_map({
            component_id = component_id,
            impl_id = EMBED_BINDING,
            private_context = "{}",
            created_at = 0,
            updated_at = 0,
        })
        :run_with(d):exec()
    if comp_err then d:release() error("component insert failed: " .. tostring(comp_err)) end

    local _, access_err = sql.builder.insert("kickside_component_access")
        :set_map({
            access_id = uuid.v7(),
            subject_id = owner,
            subject_type = "user",
            component_id = component_id,
            source_component_id = component_id,
            access_mask = 15,
            inherited = 0,
            created_at = 0,
        })
        :run_with(d):exec()
    if access_err then d:release() error("access insert failed: " .. tostring(access_err)) end

    insert_meta(d, component_id, "class", "knowledge_base")
    insert_meta(d, component_id, "kb_type", "wiki")
    insert_meta(d, component_id, "status", "ready")
    insert_meta(d, component_id, "title", "Finalizer events target")
    d:release()
end

-- Provision the KB primary thread under the engine binding so its declared source
-- projection is registered -- the owner mechanism the KB create path runs. Opened
-- with the caller's actor + scope so the projection is owned by them.
local function provision_primary_thread(component_id: string, actor: any, scope: any): ()
    local def, get_err = contract.get(THREADS_CONTRACT)
    if get_err then error("threads contract unavailable: " .. tostring(get_err)) end
    local threads, open_err = (def :: any):with_actor(actor):with_scope(scope):open()
    if open_err then error("threads open failed: " .. tostring(open_err)) end
    local _, ensure_err = threads:ensure_thread({
        component_id = component_id,
        impl_id = ENGINE_IMPL,
        thread_class = THREAD_CLASS,
    })
    if ensure_err then error("provision primary thread failed: " .. tostring(ensure_err)) end
end

local function cleanup(component_id: string): ()
    local d = db()
    sql.builder.delete("kickside_projection_cursor"):where("thread_id = ?", component_id):run_with(d):exec()
    sql.builder.delete("kickside_projection"):where("thread_id = ?", component_id):run_with(d):exec()
    sql.builder.delete("kickside_event"):where("thread_id = ?", component_id):run_with(d):exec()
    sql.builder.delete("kickside_thread"):where("id = ?", component_id):run_with(d):exec()
    sql.builder.delete("kickside_component_access"):where("component_id = ?", component_id):run_with(d):exec()
    sql.builder.delete("kickside_component_meta"):where("component_id = ?", component_id):run_with(d):exec()
    sql.builder.delete("kickside_components"):where("component_id = ?", component_id):run_with(d):exec()
    d:release()
end

local function events_of_type(thread_id: string, event_type: string): { any }
    local d = db()
    local rows, err = d:query(
        [[SELECT external_id, external_version, body, seq
          FROM kickside_event
          WHERE thread_id = $1 AND type = $2
          ORDER BY seq]],
        { thread_id, event_type }
    )
    d:release()
    if err then error("event query failed: " .. tostring(err)) end
    for _, row in ipairs(rows or {}) do
        if type(row.body) == "string" and row.body ~= "" then
            local decoded, derr = json.decode(row.body)
            if not derr then row.body = decoded end
        end
    end
    return (rows or {}) :: { any }
end


local function open_threads(actor: any, scope: any): any
    local def, get_err = contract.get(THREADS_CONTRACT)
    if get_err then error("threads contract unavailable: " .. tostring(get_err)) end
    local threads, open_err = (def :: any):with_actor(actor):with_scope(scope):open()
    if open_err then error("threads open failed: " .. tostring(open_err)) end
    return threads
end

local function finalizer_body(component_id: string): any
    return {
        kb_id = component_id,
        reason = "source_complete",
        source_thread_id = component_id,
        source_projection_id = uuid.v7(),
        source_from_seq = 1,
        source_to_seq = 3,
        source_target_seq = 3,
    }
end

local function define_tests()
    test.describe("finalizer marker events", function()
        for _, case in ipairs({
            { event_type = DIGEST_REQUESTED, prefix = "digest-request:" },
            { event_type = TREATMENT_REQUESTED, prefix = "treatment-request:" },
        }) do
            test.it("the injection thread accepts " .. case.event_type, function()
                local owner = "finalizer-" .. uuid.v4()
                local component_id = uuid.v7()
                cleanup(component_id)
                seed_kb(component_id, owner)

                local actor = security.new_actor(owner, {
                    user_id = owner,
                    email = owner,
                    status = "active",
                    security_groups = { "app.security:user" },
                })
                local scope = limited_scope()
                provision_primary_thread(component_id, actor, scope)

                if case.event_type == DIGEST_REQUESTED then
                    local requested, request_err = funcs.new():with_actor(actor):with_scope(scope):call("app:digest_request_probe", component_id)
                    test.is_nil(request_err)
                    test.not_nil(requested)
                    local requested_events = events_of_type(component_id, DIGEST_REQUESTED)
                    test.eq(1, #requested_events)
                    test.eq("config_changed", requested_events[1].body.reason)
                    test.eq(owner, requested_events[1].body.user_id)
                end

                local threads = open_threads(actor, scope)
                local body = finalizer_body(component_id)
                local emitted, emit_err = threads:emit({
                    component_id = component_id,
                    thread_class = THREAD_CLASS,
                    type = case.event_type,
                    role = "system",
                    body = body,
                    external = {
                        external_source = FINALIZER_SOURCE,
                        external_id = case.prefix .. component_id .. ":3",
                        external_version = "v1",
                    },
                })
                test.is_nil(emit_err)
                test.not_nil(emitted)

                local events = events_of_type(component_id, case.event_type)
                local marker: integer = case.event_type == DIGEST_REQUESTED and 2 or 1
                test.eq(marker, #events)
                test.eq("source_complete", events[marker].body.reason)
                test.eq(component_id, events[marker].body.kb_id)
                test.eq(3, events[marker].body.source_target_seq)

                cleanup(component_id)
            end)
        end
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
