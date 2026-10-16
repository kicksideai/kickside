-- The SQLite rule (design v5 §4.8): one serialized connection and no busy or
-- transaction timeouts; "database is locked" means the design is violated,
-- never something to wait out. Projection slots and jobs share this connection.

local test = require("test")
local sql = require("sql")
local core_db = require("core_db")

local function define_tests()
    test.describe("sqlite connection", function()
        test.it("keeps the shared core/jobs connection without a busy timeout", function()
            local db, err = sql.get(core_db.id())
            if err or not db then error(tostring(err)) end
            local dbtype = tostring(db:type())
            if dbtype ~= sql.type.SQLITE then db:release(); return end
            local _, set_err = db:execute("PRAGMA busy_timeout = 0")
            db:release()
            test.is_nil(set_err, tostring(set_err))
            local probe, probe_err = sql.get(core_db.id())
            if probe_err or not probe then error(tostring(probe_err)) end
            local rows, query_err = probe:query("PRAGMA busy_timeout")
            probe:release()
            test.is_nil(query_err, tostring(query_err))
            local row = (rows :: any)[1]
            local value = 0
            for _, v in pairs(row) do value = tonumber(v) or value end
            test.eq(value, 0)
        end)
    end)
end

return test.run_cases(define_tests)
