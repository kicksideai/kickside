-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local schema = require("retained_grant_schema")
local query, execute = schema.query, schema.execute

local function restore_ancestry(tx, pg)
    -- Only parent_id establishes ancestry. Verify it against the stored placement
    -- path before making it visible to grant readers. Cycles and orphans have no root.
    local label = pg and "replace(CAST(c.component_id AS text),'-','')" or "c.component_id"
    local start = pg and label or "('/' || c.component_id || '/')"
    local child = pg and ("p.path || '.' || " .. label) or "p.path || c.component_id || '/'"
    local invalid = query(tx, "WITH RECURSIVE tree(id,path) AS (SELECT c.component_id," .. start
        .. " FROM kickside_components c WHERE parent_id IS NULL UNION ALL SELECT c.component_id," .. child
        .. " FROM kickside_components c JOIN tree p ON c.parent_id=p.id)"
        .. " SELECT 1 FROM kickside_components c LEFT JOIN tree p ON c.component_id=p.id"
        .. " WHERE p.id IS NULL OR (CAST(c.path AS text)<>'' AND CAST(c.path AS text)<>p.path) LIMIT 1")
    if #invalid > 0 then error("retained Component ancestry disagrees with placement") end
    execute(tx, "DELETE FROM kickside_component_ancestor")
    execute(tx, [[WITH RECURSIVE chain(component_id,ancestor_id,depth) AS (
        SELECT component_id,component_id,0 FROM kickside_components UNION ALL
        SELECT a.component_id,c.parent_id,a.depth+1 FROM chain a
        JOIN kickside_components c ON c.component_id=a.ancestor_id WHERE c.parent_id IS NOT NULL)
        INSERT INTO kickside_component_ancestor(component_id,ancestor_id,depth) SELECT * FROM chain]])
end

local function upgrade(tx, pg)
    local key, legacy = schema.shape(tx, pg)
    local cols = query(tx, pg and [[SELECT column_name AS name FROM information_schema.columns
        WHERE table_schema=current_schema() AND table_name='kickside_components']]
        or "PRAGMA table_info(kickside_components)")
    local present = {}
    for _, col in ipairs(cols) do present[col.name] = true end
    if legacy and pg then
        execute(tx, "LOCK TABLE kickside_components,kickside_component_access,kickside_component_ancestor IN SHARE ROW EXCLUSIVE MODE NOWAIT")
    end
    -- Preserve stored execution contexts. Only normal, authorized identity selection can activate one.
    if not present.identity_generation then
        execute(tx, "ALTER TABLE kickside_components ADD COLUMN identity_generation " .. (pg and "BIGINT" or "INTEGER")
            .. " NOT NULL DEFAULT 0 CHECK(identity_generation>=0)")
    end
    if not present.identity_hash then execute(tx, "ALTER TABLE kickside_components ADD COLUMN identity_hash TEXT") end
    execute(tx, [[CREATE INDEX IF NOT EXISTS idx_execution_identity_audit_published
        ON kickside_execution_identity_audit(created_at,component_id,identity_generation) WHERE published_at IS NOT NULL]])
    execute(tx, [[CREATE INDEX IF NOT EXISTS idx_component_pending_delete
        ON kickside_components(deleting_at,component_id) WHERE deleting_at IS NOT NULL]])
    if not legacy and #key.untyped == 0 then return end
    if legacy then
        if #query(tx, [[SELECT 1 FROM kickside_component_access WHERE inherited=0 AND subject_type='user'
            AND (subject_id LIKE 'principal:group:%' OR subject_id LIKE 'principal:service:%') LIMIT 1]]) > 0 then
            error("retained user grant uses a reserved group or service actor key")
        end
        restore_ancestry(tx, pg)
        -- Historical agent IDs carry no proof of a user, group or service identity.
        local id_type = pg and "UUID" or "TEXT"
        execute(tx, "CREATE TABLE IF NOT EXISTS kickside_component_access_retired (access_id " .. id_type
            .. " PRIMARY KEY,subject_type TEXT NOT NULL,subject_id TEXT NOT NULL,component_id " .. id_type
            .. " NOT NULL,source_component_id TEXT NOT NULL,access_mask INTEGER NOT NULL,inherited INTEGER NOT NULL,"
            .. "created_at TEXT NOT NULL,retired_at TEXT NOT NULL,reason TEXT NOT NULL)")
        local fields = "access_id,subject_type,subject_id,component_id,source_component_id,access_mask,inherited,created_at"
        local now = pg and [[to_char(now() AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS"Z"')]]
            or "strftime('%Y-%m-%dT%H:%M:%SZ','now')"
        execute(tx, "INSERT INTO kickside_component_access_retired(" .. fields .. ",retired_at,reason) SELECT "
            .. fields .. "," .. now .. ",'legacy agent subject has no directory-proven principal' FROM kickside_component_access"
            .. " WHERE inherited=0 AND subject_type='agent'")
    end
    if pg then schema.postgres(tx, key, legacy) else schema.sqlite(tx, key, legacy) end
end

return require("migration").define(function()
    migration("18 recover retained typed component grants", function()
        for _, engine in ipairs({"sqlite", "postgres"}) do
            database(engine, function()
                up(function(tx) upgrade(tx, engine == "postgres") end)
            end)
        end
    end)
end)
