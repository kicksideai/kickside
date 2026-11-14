-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
return require("migration").define(function()
    migration("15 projection declaration digest", function()
        for _, dialect in ipairs({"postgres", "sqlite"}) do
            database(dialect, function()
                up(function(db)
                    local _, err = db:execute("ALTER TABLE kickside_projection ADD COLUMN declaration_digest TEXT")
                    if err then error(err) end
                    local _, err = db:execute("ALTER TABLE kickside_projection ADD COLUMN declaration_revision BIGINT")
                    if err then error(err) end
                    local _, err = db:execute("ALTER TABLE kickside_projection ADD COLUMN declaration_from_seq BIGINT")
                    if err then error(err) end
                    local _, err = db:execute([[CREATE INDEX idx_projection_declaration_digest
                        ON kickside_projection(kind, projection_key, declaration_digest, thread_id, id)]])
                    if err then error(err) end
                end)
            end)
        end
    end)
end)
