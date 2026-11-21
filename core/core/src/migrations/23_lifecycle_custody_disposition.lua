-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
return require("migration").define(function()
    migration("23 retain lifecycle report custody dispositions", function()
        for _, dialect in ipairs({"sqlite", "postgres"}) do
            database(dialect, function()
                up(function(tx)
                    local _, err = tx:execute([[CREATE TABLE IF NOT EXISTS kickside_lifecycle_custody_disposition (
                        thread_id TEXT NOT NULL,
                        event_seq BIGINT NOT NULL,
                        event_id TEXT NOT NULL,
                        subject_id TEXT NOT NULL,
                        principal_kind TEXT,
                        reason TEXT NOT NULL CHECK (reason IN ('retained_unresolved_custody',
                            'missing_principal_kind','missing_component_incarnation')),
                        witness_id TEXT,
                        witness_incarnation TEXT,
                        recorded_at TEXT NOT NULL,
                        PRIMARY KEY (thread_id,event_seq),
                        CHECK ((witness_id IS NULL) = (witness_incarnation IS NULL))
                    )]])
                    if err then error(err) end
                end)
            end)
        end
    end)
end)
