-- Integration coverage for kickside.automation.agent:automations_read, driven
-- through a real funcs call under a real actor + scope: list/types/catalog/
-- read_config/export against a real installed fixture automation
-- (kickside.automation.agent.fixture), installed through the sibling manage
-- tool -- not a mocked automations_lib.

local test = require("test")
local funcs = require("funcs")
local security = require("security")
local uuid = require("uuid")

local READ_TOOL = "kickside.automation.agent:automations_read"
local MANAGE_TOOL = "kickside.automation.agent:automations_manage"
local FIXTURE_TYPE = "kickside.automation.agent.fixture:automation_type"
local PROC_SCOPE = "wippy.security:process"

type Map = { [string]: any }

local function executor(user_id: string): any
    local actor: any = security.new_actor(user_id, {})
    local scope: any = security.named_scope(PROC_SCOPE)
    return funcs.new():with_actor(actor):with_scope(scope)
end

local function find_by_id(rows: any, id: string): Map?
    if type(rows) ~= "table" then return nil end
    for _, row in ipairs(rows :: { any }) do
        if type(row) == "table" and (row :: Map).id == id then return row :: Map end
    end
    return nil
end

local function define_tests()
    test.describe("AutomationsRead tool", function()
        local owner = "automations_read_test_" .. uuid.v4()
        local exec: any
        local fixture_id: string?
        local second_fixture_id: string?
        local large_fixture_id: string?
        local large_note = string.rep("x", 5000)

        test.before_all(function()
            exec = executor(owner)
            local installed, err = exec:call(MANAGE_TOOL, {
                action = "install",
                type = FIXTURE_TYPE,
                input = { title = "Read Fixture" },
            })
            test.is_nil(err, "fixture install returned a transport error: " .. tostring(err))
            local r = installed :: Map
            test.is_true(r.success, "fixture install failed: " .. tostring(r.error))
            fixture_id = r.id :: string
            local second, second_err = exec:call(MANAGE_TOOL, {
                action = "install",
                type = FIXTURE_TYPE,
                input = { title = "Read Fixture Two" },
            })
            test.is_nil(second_err, "second fixture install returned a transport error: " .. tostring(second_err))
            second_fixture_id = (second :: Map).id :: string
            local large, large_err = exec:call(MANAGE_TOOL, {
                action = "install",
                type = FIXTURE_TYPE,
                input = { title = "Large Read Fixture", note = large_note },
            })
            test.is_nil(large_err, "large fixture install returned a transport error: " .. tostring(large_err))
            large_fixture_id = (large :: Map).id :: string
        end)

        test.after_all(function()
            if exec and fixture_id then
                exec:call(MANAGE_TOOL, { action = "uninstall", id = fixture_id })
            end
            if exec and second_fixture_id then
                exec:call(MANAGE_TOOL, { action = "uninstall", id = second_fixture_id })
            end
            if exec and large_fixture_id then
                exec:call(MANAGE_TOOL, { action = "uninstall", id = large_fixture_id })
            end
        end)

        test.it("rejects a call whose actor carries no identity", function()
            local unidentified: any = funcs.new()
                :with_actor(security.new_actor("", {}))
                :with_scope(security.named_scope(PROC_SCOPE))
            local result, err = unidentified:call(READ_TOOL, { action = "list" })
            test.is_nil(result)
            test.not_nil(err)
        end)

        test.it("rejects an unknown action", function()
            local result, err = exec:call(READ_TOOL, { action = "not_a_real_action" })
            test.is_nil(result)
            test.not_nil(err)
            test.is_true(tostring(err):find("unknown action", 1, true) ~= nil)
        end)

        test.it("read_config requires an id", function()
            local result, err = exec:call(READ_TOOL, { action = "read_config" })
            test.is_nil(result)
            test.not_nil(err)
            test.is_true(tostring(err):find("id is required", 1, true) ~= nil)
        end)

        test.it("lists compact installed automation summaries, honoring the class filter", function()
            local listed, err = exec:call(READ_TOOL, { action = "list", limit = 100 })
            test.is_nil(err, "list returned a transport error: " .. tostring(err))
            local r = listed :: Map
            test.is_true(r.success, "list failed: " .. tostring(r.error))
            local row = find_by_id(r.automations, fixture_id :: string)
            test.not_nil(row, "installed fixture not present in list")
            test.eq((row :: Map).title, "Read Fixture")
            test.eq((row :: Map).type, FIXTURE_TYPE)
            test.eq((row :: Map).owner_id, owner)
            test.is_true((row :: Map).is_owner)
            test.is_nil((row :: Map).drive_status)
            test.is_nil((row :: Map).public_state)

            local filtered, filter_err = exec:call(READ_TOOL, { action = "list", class = "automation", limit = 100 })
            test.is_nil(filter_err, "filtered list returned a transport error: " .. tostring(filter_err))
            local filtered_r = filtered :: Map
            test.is_true(filtered_r.success)
            test.not_nil(find_by_id(filtered_r.automations, fixture_id :: string))

            local excluded, exclude_err = exec:call(READ_TOOL, { action = "list", class = "not_a_real_class" })
            test.is_nil(exclude_err, "excluded list returned a transport error: " .. tostring(exclude_err))
            local excluded_r = excluded :: Map
            test.is_true(excluded_r.success)
            test.eq(#(excluded_r.automations :: { any }), 0)
            test.is_nil(excluded_r.next_cursor)
        end)

        test.it("pages installed automations with limit and cursor", function()
            local first, first_err = exec:call(READ_TOOL, { action = "list", limit = 1 })
            test.is_nil(first_err, "bounded list returned a transport error: " .. tostring(first_err))
            local first_row = first :: Map
            test.eq(#(first_row.automations :: { any }), 1)
            test.eq(first_row.count, 1)
            test.eq(type(first_row.next_cursor), "string")
            test.is_nil((first_row.automations :: { Map })[1].drive_status)
            test.is_nil((first_row.automations :: { Map })[1].public_state)

            local second, second_err = exec:call(READ_TOOL, { action = "list", limit = 1, cursor = first_row.next_cursor })
            test.is_nil(second_err, "second page returned a transport error: " .. tostring(second_err))
            local second_row = second :: Map
            test.eq(#(second_row.automations :: { any }), 1)
            test.is_true((first_row.automations :: { Map })[1].id ~= (second_row.automations :: { Map })[1].id)

            local invalid, invalid_err = exec:call(READ_TOOL, { action = "list", limit = 0 })
            test.is_nil(invalid)
            test.not_nil(invalid_err)
        end)

        test.it("pages a class-filtered list without losing rows", function()
            local seen: { [string]: boolean } = {}
            local cursor: string? = nil
            repeat
                local page, page_err = exec:call(READ_TOOL, { action = "list", class = "automation", limit = 1, cursor = cursor })
                test.is_nil(page_err, "filtered page returned a transport error: " .. tostring(page_err))
                local rows = (page :: Map).automations :: { Map }
                test.is_true(#rows <= 1)
                for _, row in ipairs(rows) do seen[row.id :: string] = true end
                cursor = (page :: Map).next_cursor
            until cursor == nil
            test.is_true(seen[fixture_id :: string])
            test.is_true(seen[second_fixture_id :: string])
            test.is_true(seen[large_fixture_id :: string])
        end)

        test.it("lists compact installable type summaries and reads one whole descriptor", function()
            local listed, err = exec:call(READ_TOOL, { action = "types", limit = 100 })
            test.is_nil(err, "types returned a transport error: " .. tostring(err))
            local r = listed :: Map
            test.is_true(r.success, "types failed: " .. tostring(r.error))
            local row = find_by_id(r.types, FIXTURE_TYPE)
            test.not_nil(row, "fixture type not present in the type catalog")
            test.is_true((row :: Map).reconfigurable)
            test.is_nil((row :: Map).description)
            test.is_nil((row :: Map).inputs)
            test.is_nil((row :: Map).actions)
            local detail, detail_err = exec:call(READ_TOOL, { action = "type", id = FIXTURE_TYPE })
            test.is_nil(detail_err, "type detail returned a transport error: " .. tostring(detail_err))
            local detailed = (detail :: Map).type :: Map
            test.eq((detailed.inputs :: Map).type, "object")
            local actions = detailed.actions :: { any }
            test.not_nil(actions)
            local names: { [string]: boolean } = {}
            for _, action in ipairs(actions) do names[tostring((action :: Map).name)] = true end
            test.is_true(names.execute)
            test.is_nil(names.pause, "pause is a generic automation action")
            test.is_nil(names.resume, "resume is a generic automation action")
            test.is_nil(names.reconfigure, "reconfigure is a generic automation action")
        end)

        test.it("pages installable types in id order with a cursor", function()
            local first, first_err = exec:call(READ_TOOL, { action = "types", limit = 1 })
            test.is_nil(first_err)
            local first_r = first :: Map
            test.eq(#(first_r.types :: { any }), 1)
            if first_r.next_cursor then
                local second, second_err = exec:call(READ_TOOL, { action = "types", limit = 1, cursor = first_r.next_cursor })
                test.is_nil(second_err)
                local next_row = ((second :: Map).types :: { Map })[1]
                test.is_true(tostring(next_row.id) > tostring((first_r.types :: { Map })[1].id))
            end
        end)

        test.it("returns compact source/sink catalog rows and reads a whole port", function()
            local result, err = exec:call(READ_TOOL, { action = "catalog", limit = 100 })
            test.is_nil(err, "catalog returned a transport error: " .. tostring(err))
            local r = result :: Map
            test.is_true(r.success, "catalog failed: " .. tostring(r.error))
            test.eq(type(r.sources), "table")
            test.eq(type(r.sinks), "table")
            test.is_nil(r.destinations)
            local first_source = (r.sources :: { Map })[1]
            local first_sink = (r.sinks :: { Map })[1]
            local row = first_source or first_sink
            test.not_nil(row)
            test.is_nil((row :: Map).description)
            test.is_nil((row :: Map).input_schema)
            test.is_nil((row :: Map).config_schema)
            local direction = first_source and "source" or "sink"
            local detail, detail_err = exec:call(READ_TOOL, { action = "catalog_entry", id = (row :: Map).id, direction = direction })
            test.is_nil(detail_err, "catalog detail returned a transport error: " .. tostring(detail_err))
            test.not_nil((detail :: Map).entry)
            test.not_nil(((detail :: Map).entry :: Map).description)
            local total = #(r.sources :: { any }) + #(r.sinks :: { any })
            local seen = 0
            local cursor: string? = nil
            repeat
                local page, page_err = exec:call(READ_TOOL, { action = "catalog", limit = 1, cursor = cursor })
                test.is_nil(page_err)
                seen = seen + #((page :: Map).sources :: { any }) + #((page :: Map).sinks :: { any })
                cursor = (page :: Map).next_cursor
            until cursor == nil or seen > total
            if r.next_cursor == nil then test.eq(seen, total) end
        end)

        test.it("reads the fixture's full config as an object", function()
            local result, err = exec:call(READ_TOOL, { action = "read_config", id = fixture_id })
            test.is_nil(err, "read_config returned a transport error: " .. tostring(err))
            local r = result :: Map
            test.is_true(r.success, "read_config failed: " .. tostring(r.error))
            test.eq(r.id, fixture_id)
            test.eq((r.config :: Map).title, "Read Fixture")
            test.eq(((r.config :: Map)._portable_input :: Map).title, "Read Fixture")
            test.is_nil(r.content)
        end)

        test.it("returns a large config whole", function()
            local result, err = exec:call(READ_TOOL, { action = "read_config", id = large_fixture_id })
            test.is_nil(err, "large read_config returned a transport error: " .. tostring(err))
            local r = result :: Map
            test.eq(((r.config :: Map)._portable_input :: Map).note, large_note)
        end)

        test.it("exports the fixture as a portable artifact object", function()
            local result, err = exec:call(READ_TOOL, { action = "export", id = fixture_id })
            test.is_nil(err, "export returned a transport error: " .. tostring(err))
            local r = result :: Map
            test.is_true(r.success, "export failed: " .. tostring(r.error))
            local artifact = r.artifact :: Map
            test.eq(artifact.apiVersion, "kickside.automation/v1")
            test.eq(artifact.kind, "Automation")
            local spec = artifact.spec :: Map
            test.eq(spec.type, FIXTURE_TYPE)
            test.eq((spec.input :: Map).title, "Read Fixture")
            test.is_nil(r.content)
        end)

        test.it("exports a large artifact whole", function()
            local result, err = exec:call(READ_TOOL, { action = "export", id = large_fixture_id })
            test.is_nil(err, "large export returned a transport error: " .. tostring(err))
            local r = result :: Map
            test.eq((((r.artifact :: Map).spec :: Map).input :: Map).note, large_note)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

return { run = function(options: any): any return run_cases(options) end }
