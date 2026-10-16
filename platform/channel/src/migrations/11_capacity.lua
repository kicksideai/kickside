-- Fresh-install schema. Columns, constraints and indexes are declared at creation.

return require("migration").define(function()
    migration("11 capacity", function()
        database("postgres", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_channel_conversation (
                    "provider" text NOT NULL,
                    "external_id" text NOT NULL,
                    "deleting" integer NOT NULL DEFAULT 0,
                    "delete_requested_at" text,
                    CONSTRAINT "kickside_channel_conversation_deleting_check" CHECK (deleting = ANY (ARRAY[0, 1])),
                    CONSTRAINT "kickside_channel_conversation_pkey" PRIMARY KEY (provider, external_id)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_channel_session_owner (
                    "session_id" text NOT NULL,
                    "provider" text NOT NULL,
                    "external_id" text NOT NULL,
                    CONSTRAINT "kickside_channel_session_owner_pkey" PRIMARY KEY (session_id)
                    )
                ]=])
                if err then error(tostring(err)) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_channel_session_owner")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kickside_channel_conversation")
                if err then error(tostring(err)) end
            end)
        end)
        database("sqlite", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_channel_conversation (
                    provider TEXT NOT NULL,
                    external_id TEXT NOT NULL,
                    deleting INTEGER NOT NULL DEFAULT 0 CHECK (deleting IN (0,1)),
                    delete_requested_at TEXT,
                    PRIMARY KEY (provider,external_id)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_channel_session_owner (
                    session_id TEXT PRIMARY KEY,
                    provider TEXT NOT NULL,
                    external_id TEXT NOT NULL
                    )
                ]=])
                if err then error(tostring(err)) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_channel_session_owner")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kickside_channel_conversation")
                if err then error(tostring(err)) end
            end)
        end)
    end)
end)
