local test = require("test")
local sql = require("sql")
local security = require("security")
local contract = require("contract")
local uuid = require("uuid")
local component = require("component")
local json = require("json")
local funcs = require("funcs")

local function define_tests()
    test.describe("Component delete fence with thread cleanup", function()
        local function open(name: string, owner: string): any
            local scope, scope_err = security.named_scope("wippy.security:process")
            test.is_nil(scope_err, tostring(scope_err))
            local definition, contract_err = contract.get(name)
            test.is_nil(contract_err, tostring(contract_err))
            test.not_nil(definition)
            local instance, open_err = definition:with_actor(security.new_actor(owner, { security_groups = {} }))
                :with_scope(scope):open()
            test.is_nil(open_err, tostring(open_err))
            test.not_nil(instance)
            return instance
        end

        local function count(table_name: string, column: string, id: string): integer
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err, tostring(db_err))
            local rows, read_err = db:query("SELECT COUNT(*) AS n FROM " .. table_name .. " WHERE " .. column .. "=$1", { id })
            db:release()
            test.is_nil(read_err, tostring(read_err))
            return tonumber(rows[1].n) :: integer
        end

        for _, path in ipairs({ "gated", "system" }) do
            test.it("keeps the committed fence through thread and read model purge on " .. path .. " delete", function()
                local owner = "delete-fence-" .. uuid.v4()
                local threads = open("kickside.core:threads", owner)
                local created, create_err = threads:create({ impl_id = "app:purge_cleanup_binding", thread_class = "delete.fence" })
                test.is_nil(create_err, tostring(create_err))
                test.not_nil(created)
                local id = tostring(created.component_id)
                local db, db_err = sql.get("app:db")
                test.is_nil(db_err, tostring(db_err))
                local _, schema_err = db:execute("CREATE TABLE IF NOT EXISTS component_delete_read_model (component_id TEXT PRIMARY KEY, body TEXT NOT NULL)")
                test.is_nil(schema_err, tostring(schema_err))
                local _, report_schema_err = db:execute("CREATE TABLE IF NOT EXISTS component_delete_retry_report (component_id TEXT PRIMARY KEY, body TEXT NOT NULL)")
                test.is_nil(report_schema_err, tostring(report_schema_err))
                local _, insert_err = db:execute("INSERT INTO component_delete_read_model(component_id,body) VALUES ($1,$2)", { id, "materialized" })
                db:release()
                test.is_nil(insert_err, tostring(insert_err))
                test.eq(count("kickside_thread", "id", id), 1)
                test.eq(count("component_delete_read_model", "component_id", id), 1)
                if path == "gated" then
                    local deleted, delete_err = open("kickside.component:component_service", owner):delete({ component_id = id })
                    test.is_nil(delete_err, tostring(delete_err))
                    test.not_nil(deleted)
                    test.is_true(deleted.success, tostring(deleted.error))
                    test.is_true(deleted.deleted)
                else
                    local scope, scope_err = security.named_scope("wippy.security:process")
                    test.is_nil(scope_err, tostring(scope_err))
                    local deleted, delete_err = funcs.new():with_actor(security.new_actor(owner, { security_groups = {} }))
                        :with_scope(scope):call("app:system_purge_cleanup_delete", { component_id = id })
                    test.is_nil(delete_err, tostring(delete_err))
                    test.is_true(deleted.success, tostring(deleted.error))
                end
                db, db_err = sql.get("app:db")
                test.is_nil(db_err, tostring(db_err))
                local reports, report_err = db:query("SELECT body FROM component_delete_retry_report WHERE component_id=$1", { id })
                db:release()
                test.is_nil(report_err, tostring(report_err))
                test.eq(#reports, 1)
                local report, decode_err = json.decode(reports[1].body)
                test.is_nil(decode_err, tostring(decode_err))
                test.is_true(report.success, tostring(report.error))
                test.eq(report.deleted, 0)
                test.eq(#report.blocked, 1)
                test.eq(report.blocked[1].component_id, id)
                test.is_false(report.needs_continue)
                test.eq(count("kickside_components", "component_id", id), 0)
                test.eq(count("kickside_thread", "id", id), 0)
                test.eq(count("kickside_event", "thread_id", id), 0)
                test.eq(count("component_delete_read_model", "component_id", id), 0)
            end)
        end
    end)
end

return { run = test.run_cases(define_tests) }
