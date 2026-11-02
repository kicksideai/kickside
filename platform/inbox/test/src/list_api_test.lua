local test = require("test")
local json = require("json")
local list = require("list_handler")
local context = require("list_context")
local function run()
    test.describe("Inbox list decision contract", function()
        test.before_each(function() context.query_params = nil; list._modules = {} end)
        test.after_each(function() context.query_params = nil; list._modules = {} end)
        test.it("returns only viewer-authorized file metadata", function()
            context.query_params = { id = "file-item", status = "all" }
            context.rows = { { id = "file-item", item_type = "notice", metadata_json = "{}",
                files = { { component_id = "private:provider", title = "private name", context = { key = "private" } } } } }
            list._modules = { http = context, security = context, reader = context, events = context,
                files = { list = function(refs: any): (any?, any?)
                    test.eq(refs[1].context.key, "private")
                    return { { locked = true } }, nil
                end } }
            list.handler()
            list._modules = {}
            context.query_params = nil
            local file = context.body().items[1].files[1]
            test.is_true(file.locked)
            test.is_nil(file.title)
            test.is_nil(file.context)
            test.is_nil(file.component_id)
        end)

        test.it("lists attachment counts without calling providers or exposing references", function()
            context.rows = {}
            for index = 1, 40 do
                context.rows[index] = { id = tostring(index), item_type = "notice", metadata_json = "{}",
                    files = { { component_id = "private:provider", title = "private name" },
                        { component_id = "other:provider", context = { key = "private" } } } }
            end
            local calls = 0
            list._modules = { http = context, security = context, reader = context, events = context,
                files = { list = function(): (any?, any?)
                    calls = calls + 1
                    return nil, errors.new({ kind = errors.UNAVAILABLE, message = "provider unavailable" })
                end } }
            list.handler()
            list._modules = {}
            test.eq(calls, 0)
            test.eq(context.status, 200)
            test.eq(#context.body().items, 40)
            for _, item in ipairs(context.body().items) do
                test.eq(item.file_count, 2)
                test.is_nil(item.files)
            end
        end)

        test.it("reports metadata failure only when the attached item is requested", function()
            context.rows = { { id = "file-item", item_type = "notice", metadata_json = "{}",
                files = { { component_id = "unavailable:provider" } } } }
            context.query_params = { id = "file-item", status = "all" }
            local calls = 0
            list._modules = { http = context, security = context, reader = context, events = context,
                files = { list = function(): (any?, any?)
                    calls = calls + 1
                    return nil, errors.new({ kind = errors.UNAVAILABLE, message = "provider unavailable" })
                end } }
            list.handler()
            list._modules = {}
            context.query_params = nil
            test.eq(calls, 1)
            test.eq(context.status, 500)
            test.is_false(context.body().success)
        end)

        for _, identifier in ipairs({ "target", "absent", "" }) do
            test.it("filters a requested item identity before pagination: " .. identifier, function()
                context.rows = {
                    { id = "other", item_type = "notice", status = "dismissed", metadata_json = "{}" },
                    { id = "target", item_type = "notice", status = "dismissed", metadata_json = "{}" },
                }
                context.query_params = { status = "all", id = identifier }
                list._modules = { http = context, security = context, reader = context, events = context }
                list.handler()
                list._modules = {}
                context.query_params = nil
                local body = context.body()
                local expected = identifier == "" and 2 or identifier == "target" and 1 or 0
                test.eq(#body.items, expected)
                test.eq(body.total_count, expected)
                test.eq(body.item_count, 2)
                if identifier == "target" then test.eq(body.items[1].id, "target") end
            end)
        end

        test.it("returns empty object fields after a stored JSON round trip", function()
            local row = json.decode('{"id":"plain","item_type":"notice","status":"dismissed","metadata_json":"{}","form":[]}')
            context.rows = { row }
            list._modules = { http = context, security = context, reader = context, events = context }
            list.handler()
            list._modules = {}
            local item = context.body().items[1]
            test.eq(json.encode(item.metadata), "{}")
            test.eq(json.encode(item.form), "{}")
        end)

        test.it("returns outcome and exact submitted form for resolved decisions", function()
            context.rows = { {
                id = "decision", item_type = "flow_decision", status = "rejected", action = "reject",
                form = { reason = "", confirmed = false, count = 0, note = "Cannot approve" },
                metadata_json = "{}", resolved_at = 1700000000,
            } }
            list._modules = { http = context, security = context, reader = context, events = context }
            list.handler()
            list._modules = {}
            test.eq(context.status, 200)
            local body = context.body()
            local item = body.items[1]
            test.eq(item.action, "reject")
            test.not_nil(item.form)
            test.eq(item.form.reason, "")
            test.eq(item.form.confirmed, false)
            test.eq(item.form.count, 0)
            test.eq(item.form.note, "Cannot approve")
        end)
    end)
end
return { run = test.run_cases(run) }
