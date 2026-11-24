-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- kickside_settings.revision: the committed settings revision of the override's last
-- write, so a writer can state the revision of the key it read. Rows that exist at
-- migration time take the current settings revision.

-- Migration 02 initialized the counter to zero even if overrides already
-- existed. Reserve zero for keys without an override.
local function backfill(db)
    db:execute([[UPDATE kickside_settings_revision SET revision = 1
        WHERE id = 1 AND revision = 0 AND EXISTS (SELECT 1 FROM kickside_settings)]])
    db:execute([[UPDATE kickside_settings SET revision = (SELECT revision FROM kickside_settings_revision WHERE id = 1)]])
end

return require("migration").define(function()
    migration("kickside settings key revision", function()
        database("postgres", function()
            up(function(db)
                db:execute([[ALTER TABLE kickside_settings ADD COLUMN revision BIGINT NOT NULL DEFAULT 0]])
                backfill(db)
            end)
            down(function(db)
                db:execute([[ALTER TABLE kickside_settings DROP COLUMN revision]])
            end)
        end)

        database("sqlite", function()
            up(function(db)
                db:execute([[ALTER TABLE kickside_settings ADD COLUMN revision INTEGER NOT NULL DEFAULT 0]])
                backfill(db)
            end)
            down(function(db)
                db:execute([[ALTER TABLE kickside_settings DROP COLUMN revision]])
            end)
        end)
    end)
end)
