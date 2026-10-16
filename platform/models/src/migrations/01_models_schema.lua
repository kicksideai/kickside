return require("migration").define(function()
    migration("kickside model provider profiles and model cards", function()
        local function indexes(db)
            db:execute([[CREATE INDEX idx_kickside_model_profiles_provider ON kickside_model_provider_profiles(provider_id)]])
            db:execute([[CREATE INDEX idx_kickside_model_cards_profile ON kickside_model_cards(provider_profile_id)]])
            db:execute([[CREATE INDEX idx_kickside_model_cards_provider ON kickside_model_cards(provider_id)]])
            db:execute([[CREATE INDEX idx_kickside_model_cards_source ON kickside_model_cards(source)]])
        end

        local function create_tables(db)
            db:execute([[
                CREATE TABLE kickside_model_provider_profiles (
                    id                  TEXT PRIMARY KEY,
                    name                TEXT NOT NULL,
                    provider_id         TEXT NOT NULL,
                    config_json         TEXT NOT NULL DEFAULT '{}',
                    secret_json         TEXT NOT NULL DEFAULT '',
                    enabled             INTEGER NOT NULL DEFAULT 1,
                    status              TEXT NOT NULL DEFAULT 'unknown',
                    message             TEXT NOT NULL DEFAULT '',
                    last_discovered_at  INTEGER,
                    created_at          INTEGER NOT NULL,
                    updated_at          INTEGER NOT NULL
                )
            ]])
            db:execute([[
                CREATE TABLE kickside_model_cards (
                    name                 TEXT PRIMARY KEY,
                    title                TEXT NOT NULL,
                    description          TEXT NOT NULL DEFAULT '',
                    provider_id          TEXT NOT NULL,
                    provider_profile_id  TEXT,
                    provider_model       TEXT NOT NULL,
                    capabilities_json    TEXT NOT NULL DEFAULT '[]',
                    classes_json         TEXT NOT NULL DEFAULT '[]',
                    priority             INTEGER NOT NULL DEFAULT 0,
                    max_tokens           INTEGER NOT NULL DEFAULT 0,
                    output_tokens        INTEGER NOT NULL DEFAULT 0,
                    dimensions           INTEGER,
                    pricing_json         TEXT NOT NULL DEFAULT '{}',
                    options_json         TEXT NOT NULL DEFAULT '{}',
                    source               TEXT NOT NULL DEFAULT 'manual',
                    enabled              INTEGER NOT NULL DEFAULT 1,
                    metadata_json        TEXT NOT NULL DEFAULT '{}',
                    created_at           INTEGER NOT NULL,
                    updated_at           INTEGER NOT NULL
                )
            ]])
            indexes(db)
        end

        database("sqlite", function()
            up(function(db)
                create_tables(db)
                return true
            end)
            down(function(db)
                db:execute([[DROP TABLE IF EXISTS kickside_model_cards]])
                db:execute([[DROP TABLE IF EXISTS kickside_model_provider_profiles]])
                return true
            end)
        end)

        database("postgres", function()
            up(function(db)
                create_tables(db)
                return true
            end)
            down(function(db)
                db:execute([[DROP TABLE IF EXISTS kickside_model_cards]])
                db:execute([[DROP TABLE IF EXISTS kickside_model_provider_profiles]])
                return true
            end)
        end)
    end)
end)
