-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
return require("migration").define(function()
    migration("23 Jobs owns updated_at", function()
        database("postgres", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE OR REPLACE FUNCTION kickside_jobs_set_updated_at()
                    RETURNS trigger
                    LANGUAGE plpgsql
                    AS $function$
                    BEGIN
                    NEW.updated_at = NOW();
                    RETURN NEW;
                    END;
                    $function$
                ]=])
                if err then error(err) end
                local _, err = db:execute("DROP TRIGGER IF EXISTS trg_kickside_job_updated_at ON kickside_job")
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE TRIGGER trg_kickside_job_updated_at BEFORE UPDATE ON kickside_job
                    FOR EACH ROW EXECUTE FUNCTION kickside_jobs_set_updated_at()
                ]=])
                if err then error(err) end
            end)
            -- Migration 04 now owns this function. Keep the working Jobs
            -- trigger when undoing the legacy rebind; 04 removes it with its
            -- tables. Restoring Core's function would break Core-free installs.
            down(function(_db) end)
        end)
        database("sqlite", function()
            -- SQLite's inline trigger already belongs to Jobs.
            up(function(_db) end)
            down(function(_db) end)
        end)
    end)
end)
