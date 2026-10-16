local test = require("test")
local funcs = require("funcs")
local security = require("security")
local stub = require("stub")

local TOOL = "kickside.automation.agent:automations_read_error_fixture"

type Map = { [string]: any }

local function call(action)
    return funcs.new():with_actor(security.new_actor("catalog_error_reader", {}))
        :with_scope(security.named_scope("wippy.security:process")):call(TOOL, action)
end

local function define_tests()
    test.describe("AutomationsRead detail and summary boundaries", function()
        test.it("propagates exact source and sink catalog failures", function()
            local source, source_err = call({ action = "catalog_entry", id = "example:source", direction = "source" })
            test.is_nil(source)
            test.is_true(errors.is(source_err, errors.UNAVAILABLE))
            test.eq(source_err:message(), stub.source_error:message())
            local sink, sink_err = call({ action = "catalog_entry", id = "example:sink", direction = "sink" })
            test.is_nil(sink)
            test.is_true(errors.is(sink_err, errors.UNAVAILABLE))
            test.eq(sink_err:message(), stub.sink_error:message())
        end)

        test.it("pages compact health delivery failures while retaining aggregates", function()
            local first, first_err = call({ action = "health", limit = 1 })
            test.is_nil(first_err)
            local health = (first :: Map).health :: Map
            test.eq(health.degraded_drives, 7)
            test.eq(health.uncertain_items, 3)
            local first_failures = health.delivery_failures :: { Map }
            test.eq(#first_failures, 1)
            test.eq(first_failures[1].automation_id, "example:alpha")
            test.eq(first_failures[1].count, 4)
            test.is_nil(first_failures[1].last_error)
            test.eq((first :: Map).next_cursor, "example:alpha")

            local second, second_err = call({ action = "health", limit = 1, cursor = (first :: Map).next_cursor })
            test.is_nil(second_err)
            local second_failures = (((second :: Map).health :: Map).delivery_failures :: { Map })
            test.eq(#second_failures, 1)
            test.eq(second_failures[1].automation_id, "example:bravo")
            test.is_nil(second_failures[1].last_error)
            test.is_nil((second :: Map).next_cursor)
        end)

        test.it("preserves complete status detail", function()
            local status, status_err = call({ action = "status", id = "example:automation" })
            test.is_nil(status_err)
            local response = status :: Map
            test.eq((((response.delivery_failures :: Map).last_error :: Map).message), string.rep("s", 4096))
            test.eq((((response.extension :: Map).provider :: Map).nested :: Map).value, "preserved")
            test.eq(response.next_page_token, "next-drives")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
