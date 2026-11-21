local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local security = require("security")
local funcs = require("funcs")
local json = require("json")
local lifecycle = require("lifecycle")

local function read(args: table, actor_id: string?, meta: table?, policy: string?): (any?, error?)
    local scope = assert(security.new_scope({assert(security.policy(policy or "app:test_scope_policy"))}))
    local caller = assert(funcs.new():with_actor(assert(security.new_actor(actor_id or "operator", meta or {}))):with_scope(scope))
    return caller:call("kickside.core.lifecycle:custody_inventory_test_read", args)
end

local function define_tests()
    test.describe("Read-only lifecycle custody inventory", function()
        test.it("pages the exact implementation through resolved rows and preserves missing and replaced incarnations", function()
            local db = assert(sql.get("app:db"))
            local impl = "test:inventory-" .. uuid.v4()
            local marker = uuid.v4()
            local ids = {uuid.v4(), uuid.v4(), uuid.v4()}
            table.sort(ids)
            assert(db:execute([[INSERT INTO kickside_components (component_id,impl_id,owner_type,owner_kind,owner_id,custody_legacy)
                VALUES ($1,$2,'principal','user','private-tenant',0)]], {ids[1], impl}))
            assert(db:execute("INSERT INTO kickside_components (component_id,impl_id) VALUES ($1,$2)", {ids[2], impl}))
            assert(db:execute([[INSERT INTO kickside_components (component_id,impl_id,secrets_incarnation,encrypted_secrets)
                VALUES ($1,$2,$3,'secret-sentinel')]], {ids[3], impl, marker}))
            assert(db:execute("INSERT INTO kickside_components (component_id,impl_id) VALUES ($1,$2)", {uuid.v4(), impl .. "-other"}))
            assert(db:execute([[INSERT INTO kickside_component_access
                (access_id,subject_type,subject_id,component_id,source_component_id,access_mask,inherited)
                VALUES ($1,'user','tenant-admin',$2,$3,15,0)]], {uuid.v4(), ids[2], ids[2]}))
            local args: table = {view = "components", impl_id = impl, limit = 1}
            local denied, access_err = read(args, "tenant-admin", {}, "app:test_constrained_writer_policy")
            test.is_nil(denied)
            test.is_true(errors.is(access_err, errors.PERMISSION_DENIED))
            local first = assert(read(args))
            test.eq(first.inspected, 1)
            test.eq(#first.items, 0)
            test.not_nil(first.cursor)
            local mixed = read({view = "components", impl_id = impl .. "-other", cursor = first.cursor})
            test.is_nil(mixed)
            args.cursor = first.cursor
            local second = assert(read(args))
            test.eq(second.items[1].component_id, ids[2])
            test.eq(second.items[1].incarnation_known, false)
            test.is_nil(second.items[1].incarnation)
            args.cursor = second.cursor
            local last = assert(read(args))
            test.eq(last.items[1].incarnation, marker)
            test.is_nil(last.cursor)
            test.is_nil((assert(json.encode(last)):find("secret%-sentinel")))
            local stored = assert(db:query("SELECT secrets_incarnation FROM kickside_components WHERE component_id=$1", {ids[2]}))
            test.is_nil(stored[1].secrets_incarnation)
            assert(db:execute("DELETE FROM kickside_components WHERE component_id=$1", {ids[3]}))
            local replacement = uuid.v4()
            assert(db:execute("INSERT INTO kickside_components (component_id,impl_id,secrets_incarnation) VALUES ($1,$2,$3)",
                {ids[3], impl, replacement}))
            local retried = assert(read(args))
            test.eq(retried.items[1].incarnation, replacement)
            db:release()
        end)

        test.it("denies ordinary accounts and confined, delegated and non-user frames for both views", function()
            for _, args in ipairs({{view = "reports"}, {view = "components", impl_id = "test:private"}}) do
                for _, actor in ipairs({
                    {"tenant-member", {}, "app:test_constrained_writer_policy"},
                    {"operator", {access_filter = {prefixes = {"/tenant/"}}}},
                    {"operator", {credential_id = "credential"}}, {"operator", {execution_identity = {}}},
                    {"principal:group:operators", {}}, {"system:lifecycle", {}},
                }) do
                    local result, err = read(args, actor[1], actor[2], actor[3])
                    test.is_nil(result)
                    test.not_nil(err)
                    test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
                end
            end
        end)

        test.it("pages durable dispositions independently of the event queue", function()
            local db = assert(sql.get("app:db"))
            local id, component_id, incarnation = lifecycle.thread_id(), uuid.v4(), uuid.v4()
            local first, second = uuid.v4(), uuid.v4()
            assert(db:execute([[INSERT INTO kickside_lifecycle_custody_disposition
                (thread_id,event_seq,event_id,subject_id,reason,witness_id,witness_incarnation,recorded_at)
                VALUES ($1,11,$2,'historical-user','retained_unresolved_custody',$3,$4,'2026-11-21T00:00:00Z')]],
                {id, first, component_id, incarnation}))
            assert(db:execute([[INSERT INTO kickside_lifecycle_custody_disposition
                (thread_id,event_seq,event_id,subject_id,reason,recorded_at)
                VALUES ($1,12,$2,'legacy-user','missing_principal_kind','2026-11-21T00:01:00Z')]], {id, second}))
            assert(db:release())
            local denied, access_err = read({view = "dispositions"}, "tenant-member", {}, "app:test_constrained_writer_policy")
            test.is_nil(denied)
            test.is_true(errors.is(access_err, errors.PERMISSION_DENIED))
            local page = assert(read({view = "dispositions", limit = 1}))
            test.eq(page.items[1].seq, 11)
            test.eq(page.items[1].event_id, first)
            test.eq(page.items[1].witness_id, component_id)
            test.eq(page.items[1].witness_incarnation, incarnation)
            test.not_nil(page.cursor)
            local wrong_view = read({view = "reports", cursor = page.cursor})
            test.is_nil(wrong_view)
            local last = assert(read({view = "dispositions", limit = 1, cursor = page.cursor}))
            test.eq(last.items[1].seq, 12)
            test.eq(last.items[1].event_id, second)
            test.eq(last.items[1].reason, "missing_principal_kind")
            test.is_nil(last.cursor)
        end)

        test.it("observes pending legacy reports across sparse windows at a fixed head and flags cursor changes and gaps", function()
            local db = assert(sql.get("app:db"))
            local id, projection, cursor = lifecycle.thread_id(), uuid.v4(), uuid.v4()
            assert(db:execute("DELETE FROM kickside_thread WHERE id=$1", {id}))
            local args: table = {view = "reports", limit = 1}
            test.eq(assert(read(args)).state, "missing_thread")
            assert(db:execute("INSERT INTO kickside_thread (id,thread_class,component_id,event_count) VALUES ($1,'lifecycle',$2,5)", {id, id}))
            test.eq(assert(read(args)).state, "missing_cursor")
            assert(db:execute([[INSERT INTO kickside_projection (id,thread_id,kind,body) VALUES ($1,$2,'lifecycle.reap',
                '{"meta":{"worker_ref":"func://kickside.core.lifecycle:reaper"}}')]], {projection, id}))
            assert(db:execute([[INSERT INTO kickside_projection_cursor (id,thread_id,projection_id,last_seq,status)
                VALUES ($1,$2,$3,1,'paused')]], {cursor, id, projection}))
            local function event(seq: integer, kind: string, payload: table)
                assert(db:execute("INSERT INTO kickside_event (id,thread_id,seq,type,body) VALUES ($1,$2,$3,$4,$5)",
                    {uuid.v4(), id, seq, kind, assert(json.encode(payload))}))
            end
            event(1, lifecycle.EVENT.COMPONENT_DELETED, {subject_id = "completed"})
            event(2, "other:event", {sensitive = "hidden"})
            event(3, lifecycle.EVENT.COMPONENT_DELETED, {subject_id = id, sensitive = "hidden"})
            event(4, lifecycle.EVENT.PRINCIPAL_DELETED, {subject_id = "private-account"})
            event(5, lifecycle.EVENT.COMPONENT_DELETED, {subject_id = id, incarnation = uuid.v4()})
            local first = assert(read(args))
            test.eq(first.state, "observed")
            test.eq(first.cursor_status, "paused")
            test.eq(first.checkpoint, 1)
            test.eq(#first.items, 0)
            args.cursor = first.cursor
            event(6, lifecycle.EVENT.PRINCIPAL_DELETED, {subject_id = "later"})
            assert(db:execute("UPDATE kickside_thread SET event_count=6 WHERE id=$1", {id}))
            local second = assert(read(args))
            test.eq(second.through_seq, 5)
            test.eq(second.items[1].seq, 3)
            test.eq(second.items[1].reason, "missing_component_incarnation")
            test.is_nil((assert(json.encode(second)):find("hidden")))
            args.cursor = second.cursor
            local third = assert(read(args))
            test.eq(third.items[1].reason, "missing_principal_kind")
            test.is_nil((assert(json.encode(third)):find("private%-account")))
            args.cursor = third.cursor
            local last = assert(read(args))
            test.eq(#last.items, 0)
            test.is_nil(last.cursor)
            assert(db:execute("UPDATE kickside_projection_cursor SET last_seq=2 WHERE id=$1", {cursor}))
            test.eq(assert(read(args)).state, "restart")
            args.cursor = nil
            assert(db:execute("UPDATE kickside_thread SET max_pruned_seq=3 WHERE id=$1", {id}))
            test.eq(assert(read(args)).state, "pruned_history")
            db:release()
        end)
    end)
end
return {run = test.run_cases(define_tests)}
