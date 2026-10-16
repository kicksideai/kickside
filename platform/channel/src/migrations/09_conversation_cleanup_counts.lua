-- Fresh-install schema. Columns, constraints and indexes are declared at creation.

return require("migration").define(function()
    migration("09 conversation cleanup counts", function()
        database("postgres", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_channel_cleanup_counts (
                    "provider" text NOT NULL,
                    "external_id" text NOT NULL,
                    "reply_uncertain" integer NOT NULL DEFAULT 0,
                    "unappended" integer NOT NULL DEFAULT 0,
                    "link_pending" integer NOT NULL DEFAULT 0,
                    CONSTRAINT "kickside_channel_cleanup_counts_pkey" PRIMARY KEY (provider, external_id)
                    )
                ]=])
                if err then error(tostring(err)) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_channel_cleanup_counts")
                if err then error(tostring(err)) end
            end)
        end)
        database("sqlite", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_channel_cleanup_counts (
                    provider TEXT NOT NULL,
                    external_id TEXT NOT NULL,
                    reply_uncertain INTEGER NOT NULL DEFAULT 0,
                    unappended INTEGER NOT NULL DEFAULT 0, link_pending INTEGER NOT NULL DEFAULT 0,
                    PRIMARY KEY (provider,external_id)
                    )
                ]=])
                if err then error(tostring(err)) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_channel_cleanup_counts")
                if err then error(tostring(err)) end
            end)
        end)
    end)
end)
