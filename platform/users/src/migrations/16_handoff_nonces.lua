-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
return require("migration").define(function()
    migration("16 handoff nonces", function()
        for _, engine in ipairs({"postgres", "sqlite"}) do
            database(engine, function()
                up(function(db)
                    local _, err = db:execute([[
                        CREATE TABLE IF NOT EXISTS app_user_handoff_nonces (
                            nonce TEXT PRIMARY KEY,
                            expires_at BIGINT NOT NULL
                        )
                    ]])
                    if err then error(tostring(err)) end
                    -- Handoff claim removes expired one-time tokens before its
                    -- insert. Keep that bounded to the expired range rather
                    -- than scanning live nonces on every sign-in.
                    local _, index_err = db:execute(
                        "CREATE INDEX IF NOT EXISTS app_user_handoff_nonces_expires_at_idx "
                        .. "ON app_user_handoff_nonces (expires_at)")
                    if index_err then error(tostring(index_err)) end
                end)
                down(function(db)
                    local _, err = db:execute("DROP TABLE IF EXISTS app_user_handoff_nonces")
                    if err then error(tostring(err)) end
                end)
            end)
        end
    end)
end)
