-- Fresh-install schema. Columns, constraints and indexes are declared at creation.

return require("migration").define(function()
    migration("07 identity fence", function()
        database("postgres", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_execution_identity_audit (
                    "component_id" uuid NOT NULL,
                    "identity_generation" bigint NOT NULL,
                    "request_id" text NOT NULL,
                    "record_json" text NOT NULL,
                    "created_at" text NOT NULL,
                    "published_at" text,
                    CONSTRAINT "kickside_execution_identity_audit_pkey" PRIMARY KEY (component_id, identity_generation),
                    CONSTRAINT "kickside_execution_identity_audit_component_id_request_id_key" UNIQUE (component_id, request_id)
                    )
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE UNIQUE INDEX idx_execution_identity_audit_request ON kickside_execution_identity_audit USING btree (component_id, request_id)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_execution_identity_audit_unpublished ON kickside_execution_identity_audit USING btree (created_at, component_id, identity_generation) WHERE (published_at IS NULL)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_execution_identity_audit_published ON kickside_execution_identity_audit USING btree (created_at, component_id, identity_generation) WHERE (published_at IS NOT NULL)
                ]=])
                if err then error(err) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_execution_identity_audit")
                if err then error(err) end
            end)
        end)
        database("sqlite", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_execution_identity_audit (component_id TEXT NOT NULL,identity_generation INTEGER NOT NULL,request_id TEXT NOT NULL,record_json TEXT NOT NULL,created_at TEXT NOT NULL,published_at TEXT,PRIMARY KEY (component_id, identity_generation),UNIQUE (component_id, request_id))
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE UNIQUE INDEX idx_execution_identity_audit_request ON kickside_execution_identity_audit (component_id, request_id)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_execution_identity_audit_unpublished ON kickside_execution_identity_audit (created_at, component_id, identity_generation) WHERE published_at IS NULL
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_execution_identity_audit_published
                    ON kickside_execution_identity_audit(created_at,component_id,identity_generation)
                    WHERE published_at IS NOT NULL
                ]=])
                if err then error(err) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_execution_identity_audit")
                if err then error(err) end
            end)
        end)
    end)
end)
