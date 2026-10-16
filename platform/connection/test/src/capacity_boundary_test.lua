local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local funcs = require("funcs")
local security = require("security")
local time = require("time")

return { run = test.run_cases(function()
    test.describe("connection-owned capacity floor", function()
        local ids = {}
        local user = "capacity-" .. uuid.v7()
        local exec = funcs.new():with_actor(security.new_actor(user, {}))
            :with_scope(security.named_scope("wippy.security:process"))

        local function create(): string
            local result, err = exec:call("kickside.connection.registry:register", {
                provider = "jira", name = "capacity " .. uuid.v7(), auth = { token = "original" },
            })
            test.is_nil(err)
            test.not_nil(result)
            ids[#ids + 1] = result.component_id
            return result.component_id
        end
        local function call(id, operation, now, fields): (any, any)
            local args = { component_id = id, operation = operation, now_ms = now }
            for key, value in pairs(fields or {}) do args[key] = value end
            return exec:call("app:capacity_probe", args)
        end
        local function calls(id): integer
            local db = assert(sql.get("app:db"))
            local rows, err = db:query("SELECT COUNT(*) AS n FROM connection_capacity_calls WHERE connection_id=$1", { id })
            db:release()
            test.is_nil(err)
            return tonumber(rows[1].n) :: integer
        end
        test.before_all(function()
            local db = assert(sql.get("app:db"))
            local _, err = db:execute("CREATE TABLE connection_capacity_calls (connection_id TEXT NOT NULL, method TEXT NOT NULL)")
            db:release()
            test.is_nil(err)
        end)
        test.after_all(function()
            local db, err = sql.get("app:db")
            test.is_nil(err)
            db = assert(db)
            for _, id in ipairs(ids) do
                for _, table_name in ipairs({ "kickside_component_access", "kickside_component_meta", "kickside_components" }) do
                    local _, delete_err = db:execute("DELETE FROM " .. table_name .. " WHERE component_id=$1", { id })
                    test.is_nil(delete_err)
                end
            end
            local _, drop_err = db:execute("DROP TABLE connection_capacity_calls")
            test.is_nil(drop_err)
            db:release()
        end)

        test.it("blocks a second acquisition after the first provider reports connection capacity", function()
            local id = create()
            local floor = time.now():unix_nano() // 1000000 + 60000
            local function acquire(limited)
                return exec:call("kickside.automation:round_acquire", {source_kind = "collection",
                    source_ref = "app:capacity_source_port", limit = 1,
                    config = {connection_id = id, limited = limited, retry_at_ms = floor}})
            end
            local failed, first_err = acquire(true)
            test.is_nil(first_err)
            test.is_false(failed.success)
            local held, held_err = acquire(false)
            test.is_nil(held_err)
            test.is_false(held.success)
            test.eq(held.error.kind, errors.RATE_LIMITED)
            test.eq(held.error.retry_at_ms, floor)
            test.eq(calls(id), 1)
        end)

    end)
end) }
