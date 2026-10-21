local test = require("test")
local sql = require("sql")
local json = require("json")
local funcs = require("funcs")
local uuid = require("uuid")
local version_read = require("version_read")
local legacy_fixture = require("legacy_fixture")

type Map = { [string]: any }

local MIGRATION = "kickside.workflows.migrations:06_iteration_input_routes"
local WORKFLOW_ID = "released-iteration-input-routes"

local function route_config(commands: { Map }): Map?
    for _, command_row in ipairs(commands) do
        if command_row.type == "CREATE_NODE" and tostring((command_row.payload :: Map).node_id) == "p" then
            return (command_row.payload :: Map).config :: Map
        end
    end
    return nil
end

local function migration_run()
    local result, err = funcs.call(MIGRATION, {
        database_id = "app:db",
        id = MIGRATION .. ":" .. uuid.v4(),
        direction = "up",
    })
    test.is_nil(err)
    test.not_nil(result)
    test.eq(result.failed, 0, tostring(result.error))
end

local function insert_released_version()
    local db, db_err = sql.get("app:db")
    test.is_nil(db_err)
    local _, insert_err = (db :: any):execute(
        "INSERT INTO workflow_versions (workflow_id, version, def_seq, document, compiled_commands, allowlist, created_by, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
        { WORKFLOW_ID, 1, 3, legacy_fixture.document, legacy_fixture.compiled_commands,
            legacy_fixture.allowlist, "fixture", "2026-10-20T00:00:00Z" })
    ;(db :: any):release()
    test.is_nil(insert_err)
end

local function stored_document(): string
    local db, db_err = sql.get("app:db")
    test.is_nil(db_err)
    local rows, read_err = (db :: any):query(
        "SELECT document FROM workflow_versions WHERE workflow_id = $1 AND version = $2",
        { WORKFLOW_ID, 1 })
    ;(db :: any):release()
    test.is_nil(read_err)
    return tostring((rows :: { Map })[1].document)
end

local function define_tests()
    test.describe("Workflow iteration input route migration", function()
        test.it("recompiles a released published artifact without changing its definition", function()
            insert_released_version()
            local source_document = stored_document()
            test.eq(source_document, legacy_fixture.document)

            migration_run()
            local upgraded = select(1, version_read.get(WORKFLOW_ID, 1)) :: Map
            local routes = (route_config(upgraded.compiled_commands :: { Map }) :: Map).iteration_input_routes :: { Map }
            test.eq(#routes, 2)
            test.eq(tostring(routes[1].node_id), "item")
            test.eq(tostring(routes[2].node_id), "join")
            local join_config: Map? = nil
            for _, command_row in ipairs(upgraded.compiled_commands :: { Map }) do
                if command_row.type == "CREATE_NODE" and tostring((command_row.payload :: Map).node_id) == "join" then
                    join_config = (command_row.payload :: Map).config :: Map
                end
            end
            test.not_nil(join_config)
            test.eq(table.concat((((join_config :: Map).inputs :: Map).required :: { string }), ","), "in1,in2")
            test.eq(stored_document(), source_document)

            local once_json, once_err = json.encode(upgraded.compiled_commands)
            test.is_nil(once_err)
            migration_run()
            local repeated = select(1, version_read.get(WORKFLOW_ID, 1)) :: Map
            local twice_json, twice_err = json.encode(repeated.compiled_commands)
            test.is_nil(twice_err)
            test.eq(twice_json, once_json)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
