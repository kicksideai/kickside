return require("migration").define(function()
    migration("00 session legacy users prerequisite", function()
        for _, engine in ipairs({"postgres", "sqlite"}) do
            database(engine, function()
                up(function(db)
                    local _, err = db:execute([=[
                        CREATE TABLE app_users (
                            user_id text PRIMARY KEY,
                            email text UNIQUE NOT NULL,
                            full_name text,
                            password_hash text NOT NULL,
                            status text NOT NULL DEFAULT 'active',
                            created_at text NOT NULL,
                            updated_at text NOT NULL,
                            auth_generation integer NOT NULL DEFAULT 0
                        )
                    ]=])
                    if err then error(tostring(err)) end
                end)
            end)
        end
    end)
end)
