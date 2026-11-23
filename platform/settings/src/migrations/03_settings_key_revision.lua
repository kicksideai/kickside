-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- kickside_settings.revision: the committed settings revision of the override's last
-- write, so a writer can state the revision of the key it read. Rows that exist at
-- migration time take the current settings revision.

return require("migration").define(function()
    migration("kickside settings key revision", function()
        database("postgres", function()
            up(function(db)
                db:execute([[ALTER TABLE kickside_settings ADD COLUMN revision BIGINT NOT NULL DEFAULT 0]])
                db:execute([[UPDATE kickside_settings SET revision = (SELECT revision FROM kickside_settings_revision WHERE id = 1)]])
            end)
            down(function(db)
                db:execute([[ALTER TABLE kickside_settings DROP COLUMN revision]])
            end)
        end)

        database("sqlite", function()
            up(function(db)
                db:execute([[ALTER TABLE kickside_settings ADD COLUMN revision INTEGER NOT NULL DEFAULT 0]])
                db:execute([[UPDATE kickside_settings SET revision = (SELECT revision FROM kickside_settings_revision WHERE id = 1)]])
            end)
            down(function(db)
                db:execute([[ALTER TABLE kickside_settings DROP COLUMN revision]])
            end)
        end)
    end)
end)
