-- Fresh-install schema. Columns, constraints and indexes are declared at creation.

return require("migration").define(function()
    migration("02 definition state", function()
        database("postgres", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE workflow_def_state (
                    "workflow_id" text NOT NULL,
                    "head_seq" bigint NOT NULL DEFAULT 0,
                    "definition_edit_seq" bigint NOT NULL DEFAULT 0,
                    "node_order" text NOT NULL DEFAULT '[]'::text,
                    "edge_order" text NOT NULL DEFAULT '[]'::text,
                    "note_order" text NOT NULL DEFAULT '[]'::text,
                    "params" text NOT NULL DEFAULT '{}'::text,
                    "labels" text NOT NULL DEFAULT '[]'::text,
                    "version_lineage" text NOT NULL DEFAULT '{}'::text,
                    CONSTRAINT "workflow_def_state_pkey" PRIMARY KEY (workflow_id)
                    )
                ]=])
                if err then error(tostring(err)) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE workflow_def_state")
                if err then error(tostring(err)) end
            end)
        end)
        database("sqlite", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE workflow_def_state (
                    workflow_id        TEXT PRIMARY KEY,
                    head_seq           BIGINT NOT NULL DEFAULT 0,
                    definition_edit_seq BIGINT NOT NULL DEFAULT 0,
                    node_order         TEXT NOT NULL DEFAULT '[]',
                    edge_order         TEXT NOT NULL DEFAULT '[]',
                    note_order         TEXT NOT NULL DEFAULT '[]',
                    params             TEXT NOT NULL DEFAULT '{}',
                    labels             TEXT NOT NULL DEFAULT '[]',
                    version_lineage    TEXT NOT NULL DEFAULT '{}'
                    )
                ]=])
                if err then error(tostring(err)) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE workflow_def_state")
                if err then error(tostring(err)) end
            end)
        end)
    end)
end)
