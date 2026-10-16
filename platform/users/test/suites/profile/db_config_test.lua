-- Tests that the profile persist layer resolves its DB id from the target_db
-- requirement, not a hardcoded literal. The requirement rewrites
-- db_config.meta.db_id; profile_types.db_id() reads it back, so a rebind reaches
-- sql.get in the writer.

local test = require("test")
local registry = require("registry")
local profile_types = require("profile_types")

local function define_tests()
    test.describe("profile DB id resolution", function()
        test.it("resolves db_id from the db_config registry entry", function()
            local entry, err = registry.get(profile_types.DB_CONFIG)
            test.is_nil(err, "db_config entry must exist: " .. tostring(err))
            test.not_nil(entry)
            local meta: any = (entry :: any).meta or {}
            local wired = meta.db_id
            test.not_nil(wired, "db_config.meta.db_id must be set by the target_db requirement")

            test.eq(profile_types.db_id(), wired, "writer db id must follow the configured db_config value")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
