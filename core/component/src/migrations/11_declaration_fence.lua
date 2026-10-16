-- Fresh-install schema. Columns, constraints and indexes are declared at creation.

return require("migration").define(function()
    migration("11 declaration fence", function()
        database("postgres", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_component_declaration_fence (
                    "component_id" uuid NOT NULL,
                    "automation_id" text NOT NULL,
                    "applied_command_generation" bigint NOT NULL,
                    "command_id" text NOT NULL,
                    "declaration_hash" text NOT NULL,
                    "updated_at" text NOT NULL,
                    CONSTRAINT "kickside_component_declaration_applied_command_generation_check" CHECK (applied_command_generation > 0),
                    CONSTRAINT "kickside_component_declaration_fence_pkey" PRIMARY KEY (component_id, automation_id),
                    CONSTRAINT "kickside_component_declaration_fence_component_id_fkey" FOREIGN KEY (component_id) REFERENCES kickside_components(component_id) ON DELETE CASCADE
                    )
                ]=])
                if err then error(err) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_component_declaration_fence")
                if err then error(err) end
            end)
        end)
        database("sqlite", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_component_declaration_fence (
                    component_id TEXT NOT NULL REFERENCES "kickside_components"(component_id) ON DELETE CASCADE,
                    automation_id TEXT NOT NULL, applied_command_generation INTEGER NOT NULL CHECK(applied_command_generation>0),
                    command_id TEXT NOT NULL, declaration_hash TEXT NOT NULL,
                    updated_at TEXT NOT NULL, PRIMARY KEY(component_id,automation_id))
                ]=])
                if err then error(err) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_component_declaration_fence")
                if err then error(err) end
            end)
        end)
    end)
end)
