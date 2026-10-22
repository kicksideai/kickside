local test = require("test")
local sql = require("sql")
local json = require("json")
local funcs = require("funcs")
local uuid = require("uuid")
local workflow = require("workflow")
local version_publish = require("version_publish")
local types = require("types")
local version_read = require("version_read")
local legacy_fixture = require("legacy_fixture")

type Map = { [string]: any }

local MIGRATION = "kickside.workflows.migrations:06_iteration_input_routes"
local WORKFLOW_ID = "d3c4d70d-5cbe-4c95-9681-440f2da7ec3c"
local DEFAULT_WORKFLOW_ID = "b6ae8128-4247-4af9-a157-dfb82b693932"
local C = types.COMMAND

local function command(kind: string, body: Map): Map
    return { type = kind, body = body }
end

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
    test.is_nil(err, tostring(err))
    test.not_nil(result)
    test.eq((result :: Map).failed, 0, tostring((result :: Map).error))
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

local function publish_unaffected_version(): number
    local _, apply_err = workflow.apply(DEFAULT_WORKFLOW_ID, {
        command(C.NODE_ADD, { id = "step", kind = "block", ref = "app:block.engine_item" }),
    }, "fixture")
    test.is_nil(apply_err)
    local published, publish_err = version_publish.publish(DEFAULT_WORKFLOW_ID, "fixture")
    test.is_nil(publish_err, tostring(publish_err))
    test.not_nil(published)
    test.is_true((published :: Map).ok)
    return tonumber((published :: Map).version) or 0
end

local function stored_commands(workflow_id: string, version: number): string
    local db, db_err = sql.get("app:db")
    test.is_nil(db_err)
    local rows, read_err = (db :: any):query(
        "SELECT compiled_commands FROM workflow_versions WHERE workflow_id = $1 AND version = $2",
        { workflow_id, version })
    ;(db :: any):release()
    test.is_nil(read_err)
    return tostring((rows :: { Map })[1].compiled_commands)
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
            local default_version = publish_unaffected_version()
            local default_commands = stored_commands(DEFAULT_WORKFLOW_ID, default_version)
            local source_document = stored_document()
            test.eq(source_document, legacy_fixture.document)

            migration_run()
            test.eq(stored_commands(DEFAULT_WORKFLOW_ID, default_version), default_commands)
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
            test.eq(stored_commands(DEFAULT_WORKFLOW_ID, default_version), default_commands)
            local repeated = select(1, version_read.get(WORKFLOW_ID, 1)) :: Map
            local twice_json, twice_err = json.encode(repeated.compiled_commands)
            test.is_nil(twice_err)
            test.eq(twice_json, once_json)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
