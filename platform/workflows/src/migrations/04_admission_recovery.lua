-- Fresh-install schema. Columns, constraints and indexes are declared at creation.

return require("migration").define(function()
    migration("04 admission recovery", function()
        database("postgres", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE workflow_admission_gate (
                    "trigger_id" text NOT NULL,
                    CONSTRAINT "workflow_admission_gate_pkey" PRIMARY KEY (trigger_id)
                    )
                ]=])
                if err then error(tostring(err)) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE workflow_admission_gate")
                if err then error(tostring(err)) end
            end)
        end)
        database("sqlite", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE workflow_admission_gate(trigger_id TEXT PRIMARY KEY)
                ]=])
                if err then error(tostring(err)) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE workflow_admission_gate")
                if err then error(tostring(err)) end
            end)
        end)
    end)
end)
