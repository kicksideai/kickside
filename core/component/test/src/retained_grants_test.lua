-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local sql = require("sql")
local funcs = require("funcs")
local access_subjects = require("access_subjects")

local db_id = "app:retained_grants_db"
local root = "11111111-1111-4111-8111-111111111111"
local child = "22222222-2222-4222-8222-222222222222"
local group_grant = "00000000-0000-4000-8000-000000000001"
local derived_grant = "00000000-0000-4000-8000-000000000002"
local agent_grant = "00000000-0000-4000-8000-000000000003"
local user_grant = "00000000-0000-4000-8000-000000000005"
local service_grant = "00000000-0000-4000-8000-000000000006"
local unused_grant = "00000000-0000-4000-8000-000000000007"

local untyped_key = "UNIQUE(subject_id,component_id,source_component_id)"
local typed_key = "UNIQUE(subject_type,subject_id,component_id,source_component_id)"
local alternate_key_name = "retained ACL typed grant"
local alternate_typed_key = 'CONSTRAINT "' .. alternate_key_name .. '" ' .. typed_key
local insert = "INSERT INTO kickside_component_access(access_id,subject_id,component_id,source_component_id,"
    .. "access_mask,inherited,subject_type,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)"
local upsert = insert .. " ON CONFLICT (subject_type,subject_id,component_id,source_component_id)"
    .. " DO UPDATE SET access_mask=excluded.access_mask"

local function with_db(id, use)
    local db = assert(sql.get(id))
    local ok, result = pcall(use, db)
    db:release()
    if not ok then error(result, 0) end
    return result
end

local function migrate(receipt)
    return assert(funcs.call("kickside.component.migrations:18_retained_grants",
        {database_id = db_id, id = "component_test:" .. receipt, direction = "up"}))
end

local function complete(receipt)
    local result = migrate(receipt)
    test.eq(result.status, "complete", tostring(result.error))
end

local function setup(keys, legacy, has_derived)
    local pg = with_db("app:db", function(shared)
        local is_pg = assert(shared:type()) == sql.type.POSTGRES
        if is_pg then
            assert(shared:execute("DROP SCHEMA IF EXISTS component_retained_grants_test CASCADE"))
            assert(shared:execute("CREATE SCHEMA component_retained_grants_test"))
        end
        return is_pg
    end)
    with_db(db_id, function(db)
        for _, name in ipairs({"access", "access_retired", "ancestor"}) do
            assert(db:execute("DROP TABLE IF EXISTS kickside_component_" .. name))
        end
        assert(db:execute("DROP TABLE IF EXISTS kickside_execution_identity_audit"))
        assert(db:execute("DROP TABLE IF EXISTS kickside_components"))
        local id = pg and "UUID" or "TEXT"
        assert(db:execute("CREATE TABLE kickside_components(component_id " .. id
            .. " PRIMARY KEY,parent_id " .. id .. ",path TEXT,deleting_at TEXT,private_context TEXT)"))
        assert(db:execute("INSERT INTO kickside_components(component_id,parent_id) VALUES ($1,NULL),($2,$1)", {root, child}))
        assert(db:execute("CREATE TABLE kickside_component_ancestor(component_id " .. id .. ",ancestor_id "
            .. id .. ",depth INTEGER,marker TEXT DEFAULT 'new',PRIMARY KEY(component_id,ancestor_id))"))
        assert(db:execute("CREATE TABLE kickside_execution_identity_audit(created_at TEXT,component_id " .. id
            .. ",identity_generation INTEGER,published_at TEXT)"))
        local constraint = pg and "CONSTRAINT chk_kickside_component_access_subject_type " or ""
        local subjects = legacy and "'user','group','agent'" or "'user','group','service'"
        local default = legacy and "DEFAULT 'user' " or ""
        assert(db:execute("CREATE TABLE kickside_component_access(access_id " .. id .. " PRIMARY KEY,"
            .. "subject_id TEXT NOT NULL,component_id " .. id .. " NOT NULL,source_component_id TEXT NOT NULL,"
            .. "access_mask INTEGER NOT NULL,inherited INTEGER NOT NULL DEFAULT 0,subject_type TEXT NOT NULL "
            .. default .. constraint .. "CHECK (subject_type IN (" .. subjects .. ")),created_at TEXT NOT NULL,"
            .. keys .. ")"))
        local subject_columns = legacy and "subject_id" or "subject_type,subject_id"
        local indexes = {
            subject_id = subject_columns,
            subject_component = subject_columns .. ",component_id",
            subject_mask = subject_columns .. ",access_mask",
        }
        for name, columns in pairs(indexes) do
            assert(db:execute("CREATE INDEX idx_kickside_component_access_" .. name
                .. " ON kickside_component_access(" .. columns .. ")"))
        end
        assert(db:execute(insert, {group_grant, "same", root, root, 3, 0, "group", "old"}))
        if legacy or has_derived then
            assert(db:execute(insert, {derived_grant, "same", child, root, 3, 1, "group", "derived"}))
        end
        if legacy then
            assert(db:execute(insert, {agent_grant, "obsolete", root, root, 15, 0, "agent", "old"}))
        else
            assert(db:execute([[INSERT INTO kickside_component_ancestor(component_id,ancestor_id,depth,marker)
                VALUES ($1,$1,0,'original'),($2,$2,0,'original'),($2,$1,1,'original')]], {root, child}))
        end
    end)
    return pg
end

local function add_typed_grants(db)
    assert(db:execute(upsert, {user_grant, "same", root, root, 1, 0, "user", "old"}))
    assert(db:execute(upsert, {service_grant, "same", root, root, 2, 0, "service", "old"}))
end

local function assert_mask(db, subject_type, subject_id, component_id, mask)
    local statement, args = access_subjects.effective_mask_query({{subject_type = subject_type, subject_id = subject_id}}, component_id)
    test.eq(tonumber(assert(db:query(statement, args))[1].access_mask) or 0, mask)
end

local function assert_effective_grants(db)
    for _, component_id in ipairs({root, child}) do
        assert_mask(db, "group", "same", component_id, 3)
        assert_mask(db, "user", "same", component_id, 1)
        assert_mask(db, "service", "same", component_id, 2)
        assert_mask(db, "user", "obsolete", component_id, 0)
        assert_mask(db, "service", "obsolete", component_id, 0)
    end
    local _, duplicate = db:execute(insert, {unused_grant, "same", root, root, 4, 0, "group", "duplicate"})
    test.is_true(duplicate ~= nil)
    local _, invalid = db:execute(insert, {unused_grant, "new", root, root, 4, 0, "agent", "invalid"})
    test.is_true(invalid ~= nil)
    local _, untyped = db:execute([[INSERT INTO kickside_component_access
        (access_id,subject_id,component_id,source_component_id,access_mask,created_at)
        VALUES ($1,'new',$2,$3,4,'untyped')]], {unused_grant, root, root})
    test.is_true(untyped ~= nil)
end

local function assert_named_key(db, pg, name)
    local rows = assert(db:query(pg and [[SELECT conname FROM pg_constraint
        WHERE conrelid='kickside_component_access'::regclass AND conname=$1]]
        or [[SELECT name FROM sqlite_schema WHERE name='kickside_component_access'
            AND instr(sql, 'CONSTRAINT "' || $1 || '"') > 0]], {name}))
    test.eq(#rows, 1)
end

local function assert_legacy_recovered(db, active_count)
    local rows = assert(db:query("SELECT * FROM kickside_component_access"))
    test.eq(#rows, active_count)
    local grants = assert(db:query("SELECT * FROM kickside_component_access WHERE subject_type='group'"))
    test.eq(#grants, 1)
    test.eq(tostring(grants[1].access_id), group_grant)
    test.eq(grants[1].subject_id, "same")
    test.eq(tonumber(grants[1].access_mask), 3)
    test.eq(grants[1].created_at, "old")
    local retired = assert(db:query("SELECT * FROM kickside_component_access_retired"))
    test.eq(#retired, 1)
    test.eq(tostring(retired[1].access_id), agent_grant)
    test.eq(retired[1].subject_id, "obsolete")
    test.eq(tonumber(retired[1].access_mask), 15)
    local ancestors = assert(db:query("SELECT ancestor_id FROM kickside_component_ancestor WHERE component_id=$1 AND depth=1", {child}))
    test.eq(#ancestors, 1)
    test.eq(tostring(ancestors[1].ancestor_id), root)
end

local function assert_modern_preserved(db)
    local ancestors = assert(db:query("SELECT marker FROM kickside_component_ancestor"))
    test.eq(#ancestors, 3)
    for _, ancestor in ipairs(ancestors) do test.eq(ancestor.marker, "original") end
    assert_effective_grants(db)
end

return {run = test.run_cases(function()
    test.describe("retained Component grants", function()
        test.it("recovers a legacy untyped key without promoting historical subjects", function()
            local pg = setup(untyped_key, true)
            with_db(db_id, function(db)
                assert(db:execute(insert, {"00000000-0000-4000-8000-000000000004", "principal:service:collision",
                    root, root, 15, 0, "user", "old"}))
            end)
            local refused = migrate("legacy_untyped")
            test.eq(refused.failed, 1)
            test.is_true(tostring(refused.error):find("reserved group or service", 1, true) ~= nil)
            with_db(db_id, function(db)
                test.eq(tonumber(assert(db:query("SELECT COUNT(*) AS n FROM kickside_component_access"))[1].n), 4)
                assert(db:execute("DELETE FROM kickside_component_access WHERE subject_id='principal:service:collision'"))
            end)
            complete("legacy_untyped")
            with_db(db_id, function(db)
                assert_legacy_recovered(db, 1)
                add_typed_grants(db)
            end)
            complete("replay_legacy_untyped")
            with_db(db_id, function(db)
                assert_legacy_recovered(db, 3)
                if pg then assert_named_key(db, pg, "uq_kickside_component_access_subject") end
                assert_effective_grants(db)
            end)
        end)

        test.it("removes the redundant untyped key and keeps the alternate typed key and unrelated uniqueness", function()
            local pg = setup('CONSTRAINT "retained ACL untyped grant" ' .. untyped_key .. ","
                .. alternate_typed_key .. ",CONSTRAINT extra_grant_uniqueness UNIQUE(created_at,access_mask)", true)
            complete("legacy_both")
            with_db(db_id, function(db)
                assert_legacy_recovered(db, 1)
                add_typed_grants(db)
            end)
            complete("replay_legacy_both")
            with_db(db_id, function(db)
                assert_legacy_recovered(db, 3)
                assert_named_key(db, pg, alternate_key_name)
                assert_effective_grants(db)
                local _, duplicate = db:execute(insert, {unused_grant, "other", root, root, 3, 0, "group", "old"})
                test.is_true(duplicate ~= nil)
            end)
        end)

        test.it("removes a stale untyped key from modern grants without rerunning the legacy data repair", function()
            local pg = setup(alternate_typed_key .. "," .. untyped_key, false, true)
            complete("modern_both")
            with_db(db_id, add_typed_grants)
            complete("replay_modern_both")
            with_db(db_id, function(db)
                assert_named_key(db, pg, alternate_key_name)
                local derived = assert(db:query("SELECT access_id FROM kickside_component_access WHERE inherited=1"))
                test.eq(#derived, 1)
                test.eq(tostring(derived[1].access_id), derived_grant)
                assert_modern_preserved(db)
            end)
        end)

        test.it("leaves a populated fresh typed schema and its grants intact on replay", function()
            setup(typed_key, false)
            with_db(db_id, add_typed_grants)
            complete("fresh_typed")
            complete("replay_fresh_typed")
            with_db(db_id, assert_modern_preserved)
        end)
    end)
end)}
