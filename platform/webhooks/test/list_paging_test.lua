local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local security = require("security")
local funcs = require("funcs")
local traced_repo = require("traced_repo")
local trace_sql = require("trace_sql")

local function call(actor_id: string, args: any, meta: any?): any
    local actor = assert(security.new_actor(actor_id, meta or {}))
    local policy = assert(security.policy("app:webhooks_suite_policy"))
    local scope = assert(security.new_scope({ policy }))
    local result, err = funcs.new():with_actor(actor):with_scope(scope):call(args.method == "traced_page" and "app:list_trace_probe" or "app:test_repo_call", args)
    assert(not err, tostring(err))
    return result
end

local function execute(db: any, query: any)
    local _, err = query:run_with(db):exec()
    assert(not err, tostring(err))
end

local function fixture(size: integer?): any
    local db = assert(sql.get("app:db"))
    local owner, reader, member, stranger = uuid.v4(), uuid.v4(), uuid.v4(), uuid.v4()
    local group, ids = uuid.v4(), {}
    for index = 1, size or 105 do
        local id = uuid.v4()
        ids[#ids + 1] = id
        local path = db:type() == sql.type.POSTGRES and id:gsub("%-", "") or "/" .. id .. "/"
        execute(db, sql.builder.insert("kickside_components"):set_map({
            component_id = id, impl_id = "kickside.webhooks:webhook_kind", private_context = "{}", path = path,
        }))
        for _, grant in ipairs({ { owner, "user", 15 }, { reader, "user", 1 }, { group, "group", 1 } }) do
            execute(db, sql.builder.insert("kickside_component_access"):set_map({
                access_id = uuid.v4(), component_id = id, source_component_id = id,
                subject_id = grant[1], subject_type = grant[2], access_mask = grant[3], inherited = 0,
            }))
        end
        execute(db, sql.builder.insert("kickside_thread"):set_map({
            id = id, thread_class = "kickside.webhooks", attrs = "{}", component_id = id,
        }))
        execute(db, sql.builder.insert("kickside_webhooks"):set_map({
            webhook_id = id, actor_id = owner, secret_hash = "hidden", secret_prefix = "prefix",
            schema_json = '{"type":"object"}', label = "paging", status = "active",
            created_at = math.floor(index / 3), updated_at = 1,
        }))
        for _, state in ipairs(index % 2 == 0 and { "valid", "pending", "invalid" } or { "invalid" }) do
            execute(db, sql.builder.insert("kickside_projection"):set_map({
                id = uuid.v4(), thread_id = id, kind = "paging", projection_key = state,
                body = "{}", state = state, last_event_seq = 0,
            }))
        end
    end
    db:release()
    return { owner = owner, reader = reader, member = member, stranger = stranger, group = group, ids = ids }
end

local function probe(args: any): any
    trace_sql.reset()
    local rows, err = traced_repo.list(args.options)
    return { rows = rows, error = err, selections = trace_sql.selections }
end

return { probe = probe, run = test.run_cases(function()
    test.describe("Native webhook pages", function()
        test.it("preserves each caller's visible set before and after native bounds", function()
            local f = fixture(9)
            for _, actor in ipairs({ f.owner, f.reader, f.member, f.stranger }) do
                local meta = actor == f.member and { security_groups = { f.group } } or {}
                local visible = call(actor, { method = "visible_components", ids = f.ids }, meta)
                local rows = call(actor, { method = "list" }, meta)
                local expected = {}
                for _, row in ipairs(visible) do expected[row.component_id] = true end
                test.eq(#rows, actor == f.stranger and 0 or 9)
                test.eq(#rows, #visible)
                for _, row in ipairs(rows) do test.is_true(expected[row.webhook_id] == true) end
            end
        end)

        test.it("matches the existing component visible set for owners, readers, groups and strangers", function()
            local f = fixture()
            for _, actor in ipairs({ f.owner, f.reader, f.member, f.stranger }) do
                local meta = actor == f.member and { security_groups = { f.group } } or {}
                local visible = call(actor, { method = "visible_components", ids = f.ids }, meta)
                local expected = {}
                for _, row in ipairs(visible) do expected[row.component_id] = true end
                local seen, cursor, count = {}, nil, 0
                repeat
                    local page = call(actor, { method = "list_page", options = { limit = 7, cursor = cursor } }, meta)
                    test.is_nil(page.error)
                    test.is_true(#page.rows <= 7)
                    for _, row in ipairs(page.rows) do
                        test.is_true(expected[row.webhook_id] == true)
                        test.is_nil(seen[row.webhook_id])
                        test.eq(row.schema.type, "object")
                        test.is_nil(row.secret_hash)
                        test.is_nil(row.schema_json)
                        test.is_true(row.subscriber_count == 0 or row.subscriber_count == 2)
                        seen[row.webhook_id] = true
                        count = count + 1
                    end
                    test.is_true(page.next_cursor == nil or page.next_cursor ~= cursor)
                    cursor = page.next_cursor
                until cursor == nil
                test.eq(count, #visible)
                test.eq(count, actor == f.stranger and 0 or 105)
            end
            local db = assert(sql.get("app:db"))
            execute(db, sql.builder.delete("kickside_component_access"):where("subject_id = ?", f.reader))
            execute(db, sql.builder.delete("kickside_component_access"):where("subject_id = ?", f.group))
            db:release()
            for _, actor in ipairs({ f.reader, f.member }) do
                local page = call(actor, { method = "list_page" }, { security_groups = { f.group } })
                test.is_nil(page.error)
                test.eq(#page.rows, 0)
            end
        end)

        test.it("uses one grouped subscriber count query for a page", function()
            local f = fixture()
            for _, size in ipairs({ 1, 25 }) do
                local page = call(f.owner, { method = "traced_page", options = { limit = size } })
                test.is_nil(page.error)
                local counts = 0
                for _, selection in ipairs(page.selections) do
                    if table.concat(selection, ","):find("COUNT(*) AS count", 1, true) then
                        counts = counts + 1
                        test.eq(selection[1], "thread_id")
                    end
                end
                test.eq(counts, 1)
                test.eq(#page.rows, size)
            end
        end)

        test.it("bounds defaults and maximums and rejects malformed cursors", function()
            local f = fixture()
            local page = call(f.owner, { method = "list_page" })
            test.is_nil(page.error)
            test.eq(#page.rows, 25)
            test.not_nil(page.next_cursor)
            page = call(f.owner, { method = "list_page", options = { limit = 99999 } })
            test.is_nil(page.error)
            test.eq(#page.rows, 100)
            test.not_nil(page.next_cursor)
            for _, cursor in ipairs({ "broken", "{}", '{"created_at":1}', '{"created_at":"bad","webhook_id":"id"}' }) do
                page = call(f.owner, { method = "list_page", options = { cursor = cursor } })
                test.is_true(page.invalid)
                test.is_nil(page.rows)
            end
        end)
    end)
end) }
