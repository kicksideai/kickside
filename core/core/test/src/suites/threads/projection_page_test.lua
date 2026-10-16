local test = require("test")
local uuid = require("uuid")
local sql = require("sql")
local fixture = require("fixture")
local registry = require("registry")
local json = require("json")

return { run = test.run_cases(function()
    test.describe("Threads projection list continuation", function()
        test.it("accepts the published projection output without continuation flags", function()
            local entry, err = registry.get("kickside.core:threads")
            test.is_nil(err)
            local schema
            for _, method in ipairs(entry.data.methods) do
                if method.name == "list_projections" then
                    local decode_err
                    schema, decode_err = json.decode(method.output_schemas[1].definition)
                    test.is_nil(decode_err)
                end
            end
            test.not_nil(schema)
            local published = { thread_id = "published", event_count = 0, projections = {}, cursors = {}, count = 0 }
            for _, name in ipairs(schema.required) do
                test.not_nil(published[name], "published implementations do not return " .. name)
            end
            test.eq(schema.properties.projections_has_more.type, "boolean")
            test.eq(schema.properties.cursors_has_more.type, "boolean")
        end)
        local context = fixture.new()
        local owned, projection_ids, cursor_ids = {}, {}, {}
        local thread_id
        test.before_all(function()
            local created, create_err = context.as_owner("create", { thread_class = "pages_" .. context.suffix })
            test.is_nil(create_err)
            thread_id = created.thread_id
            owned[#owned + 1] = thread_id
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            for i = 1, 205 do
                local projection_id = uuid.v7()
                projection_ids[#projection_ids + 1] = projection_id
                local _, err = sql.builder.insert("kickside_projection"):set_map({ id = projection_id,
                    thread_id = thread_id, kind = "page", projection_key = string.format("key-%04d", i),
                    body = "{}", state = "valid", last_event_seq = 0 }):run_with(db):exec()
                if err then db:release(); error(tostring(err)) end
                for cursor = 1, (i == 1 and 2 or 1) do
                    local cursor_id = uuid.v7()
                    cursor_ids[#cursor_ids + 1] = cursor_id
                    local _, cursor_err = sql.builder.insert("kickside_projection_cursor"):set_map({
                        id = cursor_id, projection_id = projection_id, thread_id = thread_id,
                        cursor_key = "cursor-" .. cursor, generation = 1, last_seq = 0, status = "active",
                        created_at = "2000-01-01T00:00:00Z", updated_at = "2000-01-01T00:00:00Z",
                    }):run_with(db):exec()
                    if cursor_err then db:release(); error(tostring(cursor_err)) end
                end
            end
            db:release()
            table.sort(cursor_ids, function(a, b) return a > b end)
        end)
        test.after_all(function()
            for _, id in ipairs(projection_ids) do
                local _, err = context.as_owner("remove_projection", { thread_id = thread_id, projection_id = id })
                test.is_nil(err)
            end
            for _, id in ipairs(owned) do
                local _, err = context.as_owner("delete", { thread_id = id })
                test.is_nil(err)
            end
        end)
        test.it("continues each array once in total order and reports independent exhaustion", function()
            local projections, cursors, projections_cursor, cursors_cursor = {}, {}, nil, nil
            local projection_done, cursor_done = false, false
            for _ = 1, 40 do
                local page, err = context.as_owner("list_projections", { thread_id = thread_id, limit = 7,
                    projections_cursor = projections_cursor, cursors_cursor = cursors_cursor })
                test.is_nil(err)
                test.eq(type(page.projections_has_more), "boolean")
                test.eq(type(page.cursors_has_more), "boolean")
                test.eq(page.count, #page.cursors)
                if not projection_done then
                    for _, row in ipairs(page.projections) do projections[#projections + 1] = row.id end
                end
                if not cursor_done then
                    for _, row in ipairs(page.cursors) do cursors[#cursors + 1] = row.id end
                end
                if page.projections_has_more then
                    test.not_nil(page.projections_cursor)
                    projections_cursor = page.projections_cursor
                else
                    test.is_nil(page.projections_cursor)
                    projection_done = true
                end
                if page.cursors_has_more then
                    test.not_nil(page.cursors_cursor)
                    cursors_cursor = page.cursors_cursor
                else
                    test.is_nil(page.cursors_cursor)
                    cursor_done = true
                end
                if projection_done and cursor_done then break end
            end
            test.eq(#projections, 205)
            test.eq(#cursors, 206)
            for i, id in ipairs(projection_ids) do test.eq(projections[i], id) end
            for i, id in ipairs(cursor_ids) do test.eq(cursors[i], id) end
        end)
        test.it("continues cursors with timestamps within the same second", function()
            local created, create_err = context.as_owner("create", { thread_class = "fractions_" .. context.suffix })
            test.is_nil(create_err)
            local fractional_thread = created.thread_id
            owned[#owned + 1] = fractional_thread
            local projection_id = uuid.v7()
            local first_id, second_id = uuid.v7(), uuid.v7()
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            local _, projection_err = sql.builder.insert("kickside_projection"):set_map({
                id = projection_id, thread_id = fractional_thread, kind = "page", projection_key = "default",
                body = "{}", state = "valid", last_event_seq = 0 }):run_with(db):exec()
            if projection_err then db:release(); error(tostring(projection_err)) end
            for i, id in ipairs({ first_id, second_id }) do
                local _, insert_err = sql.builder.insert("kickside_projection_cursor"):set_map({
                    id = id, projection_id = projection_id, thread_id = fractional_thread,
                    cursor_key = "fraction-" .. i, generation = 1, last_seq = 0, status = "active",
                    created_at = string.format("2000-01-01T00:00:00.%06dZ", i),
                    updated_at = "2000-01-01T00:00:00Z" }):run_with(db):exec()
                if insert_err then db:release(); error(tostring(insert_err)) end
            end
            db:release()
            local first, first_err = context.as_owner("list_projections", { thread_id = fractional_thread, limit = 1 })
            local second, second_err = context.as_owner("list_projections", { thread_id = fractional_thread, limit = 1,
                cursors_cursor = first and first.cursors_cursor })
            local _, remove_err = context.as_owner("remove_projection", {
                thread_id = fractional_thread, projection_id = projection_id })
            test.is_nil(remove_err)
            test.is_nil(first_err)
            test.is_nil(second_err)
            test.eq(first.cursors[1].id, second_id)
            test.is_true(first.cursors_has_more)
            test.eq(#second.cursors, 1)
            test.eq(second.cursors[1].id, first_id)
            test.eq(second.cursors_has_more, false)
            local expired, expired_err = context.as_owner("list_projections", {
                thread_id = fractional_thread, cursors_cursor = first.cursors_cursor })
            test.is_nil(expired)
            test.not_nil(expired_err)
            test.eq(expired_err:kind(), errors.INVALID)
        end)
        test.it("reports more than the default page instead of implying completeness", function()
            local page, err = context.as_owner("list_projections", { thread_id = thread_id })
            test.is_nil(err)
            test.eq(#page.projections, 200)
            test.eq(#page.cursors, 200)
            test.is_true(page.projections_has_more)
            test.is_true(page.cursors_has_more)
        end)
        test.it("reports one exhausted array while the other still has rows", function()
            local page, err = context.as_owner("list_projections", { thread_id = thread_id, limit = 205 })
            test.is_nil(err)
            test.eq(#page.projections, 205)
            test.eq(#page.cursors, 205)
            test.eq(page.projections_has_more, false)
            test.is_nil(page.projections_cursor)
            test.eq(page.cursors_has_more, true)
            test.not_nil(page.cursors_cursor)
        end)
        test.it("rejects malformed, cross-thread and cross-array cursors", function()
            local first, first_err = context.as_owner("list_projections", { thread_id = thread_id, limit = 7 })
            test.is_nil(first_err)
            test.not_nil(first.projections_cursor)
            local other, create_err = context.as_owner("create", { thread_class = "page_other_" .. context.suffix })
            test.is_nil(create_err)
            owned[#owned + 1] = other.thread_id
            for _, args in ipairs({
                { thread_id = thread_id, projections_cursor = "invalid%%%" },
                { thread_id = thread_id, cursors_cursor = first.projections_cursor },
                { thread_id = other.thread_id, projections_cursor = first.projections_cursor },
            }) do
                local page, err = context.as_owner("list_projections", args)
                test.is_nil(page)
                test.not_nil(err)
                test.eq(err:kind(), errors.INVALID)
            end
        end)
        test.it("reports both arrays exhausted on a lazy thread", function()
            local page, err = context.as_owner("list_projections", { thread_id = uuid.v7() })
            test.is_nil(err)
            test.eq(page.event_count, 0)
            test.eq(page.projections_has_more, false)
            test.eq(page.cursors_has_more, false)
            test.is_nil(page.projections_cursor)
            test.is_nil(page.cursors_cursor)
        end)
        test.it("denies continuation reads to a stranger", function()
            local first, err = context.as_owner("list_projections", { thread_id = thread_id, limit = 7 })
            test.is_nil(err)
            local page, denied = context.run_as(context.stranger, "list_projections", {
                thread_id = thread_id, projections_cursor = first.projections_cursor })
            test.is_nil(page)
            test.not_nil(denied)
            test.eq(denied:kind(), errors.PERMISSION_DENIED)
        end)
    end)
end) }
