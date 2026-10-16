return require("migration").define(function()
    migration("05 undo history", function()
        database("postgres", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE workflow_undo_history (
                        workflow_id TEXT PRIMARY KEY,
                        tracker TEXT NOT NULL
                    )
                ]=])
                if err then error(tostring(err)) end
            end)
        end)
        database("sqlite", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE workflow_undo_history (
                        workflow_id TEXT PRIMARY KEY,
                        tracker TEXT NOT NULL
                    )
                ]=])
                if err then error(tostring(err)) end
            end)
        end)
    end)
end)
