-- Tests that the oauth repo resolves its DB id from the target_db requirement,
-- not a hardcoded literal. The requirement rewrites db_config.meta.db_id;
-- oauth_types.db_id() reads it back, so a rebind reaches sql.get in the repo.

local test = require("test")
local registry = require("registry")
local oauth_types = require("oauth_types")

local function define_tests()
    test.describe("oauth DB id resolution", function()
        -- db_id() must return whatever the db_config registry entry carries (the
        -- value the target_db requirement wired), proving the repo reads the
        -- configured resource rather than a literal "app:db" in the source.
        test.it("resolves db_id from the db_config registry entry", function()
            local entry, err = registry.get(oauth_types.DB_CONFIG)
            test.is_nil(err, "db_config entry must exist: " .. tostring(err))
            test.not_nil(entry)
            local meta: any = (entry :: any).meta or {}
            local wired = meta.db_id
            test.not_nil(wired, "db_config.meta.db_id must be set by the target_db requirement")

            test.eq(oauth_types.db_id(), wired, "repo db id must follow the configured db_config value")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
