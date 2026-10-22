local fixture_cleanup = require("fixture_cleanup")
local fixtures: { string } = {}
local test = require("test")
local security = require("security")
local contract = require("contract")
local sql = require("sql")
local uuid = require("uuid")
local funcs = require("funcs")
local json = require("json")
local execution_identity = require("execution_identity")
local thread_ingest_base = require("thread_ingest_base")

local DB = "app:db"
local THREADS_CONTRACT = "kickside.core:threads"
local APPEND_PROBE = "app:thread_ingest_append_probe"
-- The KB engine binding the KB primary thread is declared under; it carries the
-- source projection in meta.projections (test harness engine descriptor).
local ENGINE_IMPL = "app:test_engine_wiki"
local THREAD_CLASS = "kickside.knowledge.injection"

local function db()
    local d, err = sql.get(DB)
    if err then error("db connect failed: " .. tostring(err)) end
    return d
end

local function limited_scope()
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
    fixtures[#fixtures + 1] = component_id
    local d = db()
    local identity_context, identity_context_err = json.encode({
        [execution_identity.CONTEXT_KEY] = {
            version = execution_identity.VERSION,
            principal = { kind = "user", id = owner },
            authorized_by = { kind = "user", id = owner },
            captured_at = execution_identity.utc_now(),
        },
    })
    if identity_context_err or type(identity_context) ~= "string" then
        d:release()
        error("component identity encoding failed: " .. tostring(identity_context_err))
    end
    local _, comp_err = sql.builder.insert("kickside_components")
        :set_map({
            component_id = component_id,
            impl_id = "test.kb:embeddable",
            private_context = identity_context,
            created_at = 0,
            updated_at = 0,
        })
        :run_with(d):exec()
    if comp_err then
        d:release()
        error("component insert failed: " .. tostring(comp_err))
    end

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
    if access_err then
        d:release()
        error("access insert failed: " .. tostring(access_err))
    end

    insert_meta(d, component_id, "class", "knowledge_base")
    insert_meta(d, component_id, "kb_type", "wiki")
    insert_meta(d, component_id, "status", "ready")
    insert_meta(d, component_id, "title", "Agent write target")
    d:release()
end

local function cleanup(component_id: string): ()
    fixture_cleanup.cleanup(component_id)
end

local function cleanup_fixtures(): ()
    for _, id in ipairs(fixtures) do cleanup(id) end
    fixtures = {}
end

-- The declared source projection must use the KB's protected v2 identity,
-- independently of the opener's limited scope. No system grant is added.
local function assert_owner_rows(component_id: string, owner: string): ()
    local d = db()
    local proj_rows, proj_err = sql.builder
        .select("actor_id", "actor_context")
        :from("kickside_projection")
        :where("thread_id = ?", component_id)
        :run_with(d):query()
    if proj_err then
        d:release()
        error("projection query failed: " .. tostring(proj_err))
    end
    test.ok(#(proj_rows or {}) >= 1, "source projection should be registered")
    for _, row in ipairs(proj_rows or {}) do
        test.eq(owner, row.actor_id)
        test.not_nil(row.actor_context)
        local decoded, decode_err = execution_identity.from_row(row.actor_id, row.actor_context)
        test.is_nil(decode_err)
        test.eq(decoded.principal.id, owner)
        test.eq(decoded.authorized_by.id, owner)
    end

    local grant_rows, grant_err = sql.builder
        .select("access_id")
        :from("kickside_component_access")
        :where("component_id = ?", component_id)
        :where("subject_id = ?", "system:knowledge.injection")
        :run_with(d):query()
    d:release()
    if grant_err then error("grant query failed: " .. tostring(grant_err)) end
    test.eq(0, #(grant_rows or {}))
end

local function define_tests()
    test.describe("thread_ingest identity", function()
        for _, case in ipairs({
            { name = "small inline text", content = string.rep("a", 1024), omitted = false },
            { name = "text above the event row bound", content = string.rep("a", 5 * 1024 * 1024), omitted = true },
            { name = "text above the bound after JSON escaping", content = string.rep("\0", 800 * 1024), omitted = true },
        }) do
            test.it("ingests " .. case.name .. " through the event source", function()
                local owner = "artifact-writer-" .. uuid.v4()
                local component_id = uuid.v7()
                seed_kb(component_id, owner)
                local actor = security.new_actor(owner, {user_id = owner, email = owner, status = "active",
                    security_groups = {"app.security:user"}})
                local scope = limited_scope()
                local def, get_err = contract.get(THREADS_CONTRACT)
                test.is_nil(get_err)
                local threads, open_err = def:with_actor(actor):with_scope(scope):open()
                test.is_nil(open_err)
                local _, ensure_err = threads:ensure_thread({component_id = component_id,
                    impl_id = ENGINE_IMPL, thread_class = THREAD_CLASS})
                test.is_nil(ensure_err)
                local result, append_err = funcs.new():with_actor(actor):with_scope(scope):call(APPEND_PROBE, {
                    kb_id = component_id, content = case.content,
                    source_ref = {kind = "upload", upload_id = "test-upload", artifact_id = "test-text"},
                    external_id = "upload:test-upload", external_version = case.omitted and "delivery:artifact-pull" or "v1"})
                test.is_nil(append_err, tostring(append_err))
                test.eq(result.success, true)
                local page, pull_err = funcs.new():with_actor(actor):with_scope(scope)
                    :call("kickside.core.threads:events_pullable", {
                        config = {thread_id = component_id, event_type = "kickside.knowledge.events:content.upserted"},
                        cursor = 0, limit = 1, idempotency_key = "artifact-pull"})
                test.is_nil(pull_err)
                test.eq(page.success, true)
                test.eq(#page.items, 1)
                local body = page.items[1].payload
                test.eq(body.source_ref.upload_id, "test-upload")
                test.eq(body.source_ref.artifact_id, "test-text")
                if case.omitted then
                    test.is_nil(body.content)
                    test.eq(body.content_omitted, true)
                    test.eq(body.content_sha256,thread_ingest_base.content_sha(case.content))
                    local matched,match_err=funcs.new():with_actor(actor):with_scope(scope):call(APPEND_PROBE,{
                        check_delivery=true,kb_id=component_id,external_id="upload:test-upload",
                        delivery_key="artifact-pull",content=case.content})
                    test.is_nil(match_err)
                    test.eq(matched,true)
                    local changed,changed_err=funcs.new():with_actor(actor):with_scope(scope):call(APPEND_PROBE,{
                        check_delivery=true,kb_id=component_id,external_id="upload:test-upload",
                        delivery_key="artifact-pull",content=case.content.."changed"})
                    test.is_nil(changed)
                    test.is_true(errors.is(changed_err,errors.CONFLICT))
                    test.eq(body.content_bytes, #case.content)
                else
                    test.eq(body.content, case.content)
                    test.is_nil(body.content_omitted)
                    test.is_nil(body.content_bytes)
                    local keys = {}
                    for key in pairs(body) do keys[#keys + 1] = key end
                    table.sort(keys)
                    test.eq(table.concat(keys, ","), "actor_id,content,content_type,kb_id,metadata,source_ref,title")
                end
            end)
        end
        test.it("retains native trace validation metadata", function()
            local context, err = thread_ingest_base.trace_for("kb.ingest", "kb", "source", { run_id = "only-run" })
            test.is_nil(context)
            test.is_true(errors.is(err, errors.INVALID))
            test.is_false(err:retryable())
            test.eq(err:details().code, "trace_context_trace_id_required")
        end)
        test.after_each(cleanup_fixtures)
        test.it("provisions the source projection from the KB owner identity under a limited opener scope", function()
            local owner = "agent-writer-" .. uuid.v4()
            local component_id = uuid.v7()
            cleanup(component_id)
            seed_kb(component_id, owner)

            local actor = security.new_actor(owner, {
                user_id = owner,
                email = owner,
                status = "active",
                security_groups = { "app.security:user" },
            })

            local def, get_err = contract.get(THREADS_CONTRACT)
            test.is_nil(get_err)
            local threads, open_err = (def :: any):with_actor(actor):with_scope(limited_scope()):open()
            test.is_nil(open_err)

            local result, ensure_err = threads:ensure_thread({
                component_id = component_id,
                impl_id = ENGINE_IMPL,
                thread_class = THREAD_CLASS,
            })
            test.is_nil(ensure_err)
            test.not_nil(result)

            assert_owner_rows(component_id, owner)

            cleanup(component_id)
        end)

        test.it("surfaces a not-provisioned error instead of creating the source projection on inject", function()
            local owner = "agent-append-" .. uuid.v4()
            local component_id = uuid.v7()
            cleanup(component_id)
            seed_kb(component_id, owner)

            local actor = security.new_actor(owner, {
                user_id = owner,
                email = owner,
                status = "active",
                security_groups = { "app.security:user" },
            })

            local def, get_err = contract.get(THREADS_CONTRACT)
            test.is_nil(get_err)
            local scope = limited_scope()
            local threads, open_err = (def :: any):with_actor(actor):with_scope(scope):open()
            test.is_nil(open_err)

            -- A KB whose primary thread exists but was never provisioned through the
            -- create path (no engine impl) carries no declared source projection.
            local existing, ensure_err = threads:ensure_thread({
                component_id = component_id,
                thread_class = THREAD_CLASS,
            })
            test.is_nil(ensure_err)
            test.not_nil(existing)

            local d = db()
            local before_rows, before_err = sql.builder
                .select("id")
                :from("kickside_projection")
                :where("thread_id = ?", component_id)
                :run_with(d):query()
            d:release()
            if before_err then error("projection query failed: " .. tostring(before_err)) end
            test.eq(0, #(before_rows or {}))

            -- The producer path looks up the declared projection and, on a miss,
            -- surfaces provisioning as an error; it never materializes infrastructure.
            local result, append_err = funcs.new():with_actor(actor):with_scope(scope):call(APPEND_PROBE, {
                kb_id = component_id,
                content = "memory repair content",
                external_id = "agent-memory:test",
                external_version = "v1",
            })
            test.not_nil(append_err)
            test.ok(tostring(append_err):find("not provisioned", 1, true) ~= nil,
                "error names the not-provisioned knowledge base")
            test.is_nil(result)

            local after = db()
            local after_rows, after_err = sql.builder
                .select("id")
                :from("kickside_projection")
                :where("thread_id = ?", component_id)
                :run_with(after):query()
            after:release()
            if after_err then error("projection query failed: " .. tostring(after_err)) end
            test.eq(0, #(after_rows or {}))

            cleanup(component_id)
        end)
        test.it("ingests through a source projection beyond the first listing page", function()
            local owner = "agent-crowded-" .. uuid.v4()
            local component_id = uuid.v7()
            seed_kb(component_id, owner)
            local actor = security.new_actor(owner, { user_id = owner, email = owner, status = "active",
                security_groups = { "app.security:user" } })
            local def, get_err = contract.get(THREADS_CONTRACT)
            test.is_nil(get_err)
            local scope = limited_scope()
            local threads, open_err = def:with_actor(actor):with_scope(scope):open()
            test.is_nil(open_err)
            local _, ensure_err = threads:ensure_thread({ component_id = component_id,
                impl_id = ENGINE_IMPL, thread_class = THREAD_CLASS })
            test.is_nil(ensure_err)
            local d, filler_ids = db(), {}
            for i = 1, 250 do
                local filler_id = uuid.v7()
                local _, err = sql.builder.insert("kickside_projection"):set_map({ id = filler_id,
                    thread_id = component_id, kind = string.format("a.filler.%04d", i),
                    projection_key = "default", body = "{}", state = "valid", last_event_seq = 0 })
                    :run_with(d):exec()
                if err then d:release(); error(tostring(err)) end
                filler_ids[#filler_ids + 1] = filler_id
            end
            d:release()
            local result, append_err = funcs.new():with_actor(actor):with_scope(scope):call(APPEND_PROBE, {
                kb_id = component_id, content = "content behind a crowd of projections",
                external_id = "agent-memory:crowded", external_version = "v1" })
            test.is_nil(append_err)
            test.not_nil(result)
            for _, id in ipairs(filler_ids) do
                local _, remove_err = threads:remove_projection({ thread_id = component_id, projection_id = id })
                test.is_nil(remove_err)
            end
            local _, delete_err = threads:delete({ thread_id = component_id })
            test.is_nil(delete_err)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
