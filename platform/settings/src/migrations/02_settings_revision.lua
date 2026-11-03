-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- kickside_settings_revision: one row counting committed override changes. Every
-- write bumps it in the same transaction, so each node's cache can tell whether
-- it holds the current override set.

return require("migration").define(function()
    migration("kickside settings revision", function()
        database("postgres", function()
            up(function(db)
                db:execute([[
                    CREATE TABLE kickside_settings_revision (
                        id       INTEGER PRIMARY KEY CHECK (id = 1),
                        revision BIGINT NOT NULL
                    )
                ]])
                db:execute([[INSERT INTO kickside_settings_revision (id, revision) VALUES (1, 0)]])
            end)
            down(function(db)
                db:execute([[DROP TABLE IF EXISTS kickside_settings_revision]])
            end)
        end)

        database("sqlite", function()
            up(function(db)
                db:execute([[
                    CREATE TABLE kickside_settings_revision (
                        id       INTEGER PRIMARY KEY CHECK (id = 1),
                        revision INTEGER NOT NULL
                    )
                ]])
                db:execute([[INSERT INTO kickside_settings_revision (id, revision) VALUES (1, 0)]])
            end)
            down(function(db)
                db:execute([[DROP TABLE IF EXISTS kickside_settings_revision]])
            end)
        end)
    end)
end)
