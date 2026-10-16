return require("migration").define(function()
    migration("11 group enrollments", function()
        local function install(db)
            local _, err = db:execute([[
                CREATE TABLE app_user_group_enrollments (
                    enrollment_id TEXT PRIMARY KEY,
                    group_id TEXT NOT NULL,
                    created_at TEXT NOT NULL
                )
            ]])
            if err then error(tostring(err)) end
        end
        database("postgres", function() up(install) end)
        database("sqlite", function() up(install) end)
    end)
end)
