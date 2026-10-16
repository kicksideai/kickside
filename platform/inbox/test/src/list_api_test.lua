local test = require("test")
local json = require("json")
local list = require("list_handler")
local context = require("list_context")
local function run()
    test.describe("Inbox list decision contract", function()
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
