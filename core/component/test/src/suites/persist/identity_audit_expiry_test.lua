local sql = require("sql")
local json = require("json")
local uuid = require("uuid")
local time = require("time")
local test = require("test")
local command = require("component_command")
local ops = require("ops")
local audit_retention = require("audit_retention")
local audit_policy = require("audit_policy")

local function db(): sql.DB
    local handle, err = sql.get("app:db")
    if err or not handle then error(tostring(err)) end
    return handle
end

local function seed(handle: sql.DB): string
    local id = uuid.v7()
    local now = time.now():format(time.RFC3339)
    local private, encode_err = json.encode({ label = "kept" })
    if encode_err then error(tostring(encode_err)) end
    local _, insert_err = handle:execute([[INSERT INTO kickside_components
        (component_id,impl_id,private_context,position,created_at,updated_at)
        VALUES ($1,$2,$3,$4,$5,$6)]],
        { id, "kickside.test:security", private, "n", now, now })
    if insert_err then error(tostring(insert_err)) end
    local _, grant_err = handle:execute([[INSERT INTO kickside_component_access
        (access_id,subject_id,subject_type,component_id,source_component_id,access_mask,inherited)
        VALUES ($1,$2,$3,$4,$5,$6,$7)]],
        { uuid.v7(), "owner-1", "user", id, id, ops.ACCESS.ADMIN, 0 })
    if grant_err then error(tostring(grant_err)) end
    return id
end

local FORMER_AUDITS_PER_OWNER: integer = 10000

local function set_as_owner(id: string, request_id: string, generation: integer): (any?, any?)
    return command.set_execution_identity(id,
        { kind = "user", id = "owner-1" }, request_id, generation)
end

local function seed_audits(handle: sql.DB, id: string, count: integer, created_at: string, published_at: string?): ()
    local seeded, err = handle:execute([[WITH RECURSIVE n(x) AS (
        SELECT 1 UNION ALL SELECT x+1 FROM n WHERE x<]] .. tostring(count) .. [[)
        INSERT INTO kickside_execution_identity_audit
            (component_id,identity_generation,request_id,record_json,created_at,published_at)
        SELECT $1,100000+x,'seed-' || CAST(x AS TEXT),'{}',$2,$3 FROM n]],
        { id, created_at, published_at or sql.NULL })
    if err then error(tostring(err)) end
    test.eq(tonumber(seeded.rows_affected), count)
end

local function audits(handle: sql.DB, id: string): integer
    local rows, err = handle:query("SELECT COUNT(*) AS n FROM kickside_execution_identity_audit WHERE component_id=$1", { id })
    if err then error(tostring(err)) end
    return math.floor(tonumber(rows[1].n) :: number)
end

local function cleanup(id: string): ()
    local handle = db()
    for _, table_name in ipairs({ "kickside_execution_identity_audit", "kickside_component_access",
        "kickside_components" }) do
        local _, cleanup_err = handle:execute("DELETE FROM " .. table_name .. " WHERE component_id=$1", { id })
        test.is_nil(cleanup_err, tostring(cleanup_err))
    end
    handle:release()
end

return test.run_cases(function()
    test.describe("component identity audits bounded by age expiry", function()
        test.it("sets identity past the former per-owner audit count across reopened connections", function()
            local handle = db()
            local id = seed(handle)
            local expected_audits = FORMER_AUDITS_PER_OWNER + 12
            seed_audits(handle, id, FORMER_AUDITS_PER_OWNER, "2000-01-01T00:00:00Z", nil)
            handle:release()
            for generation = 0, 11 do
                local changed, err = set_as_owner(id, "expiry-req-" .. tostring(generation), generation)
                test.is_nil(err, tostring(err))
                test.not_nil(changed)
                test.eq(changed.identity_generation, generation + 1)
            end
            local reopened = db()
            test.eq(audits(reopened, id), expected_audits)
            local rows, rows_err = reopened:query([[SELECT private_context,identity_generation
                FROM kickside_components WHERE component_id=$1]], { id })
            reopened:release()
            test.is_nil(rows_err, tostring(rows_err))
            test.eq(tonumber(rows[1].identity_generation), 12)
            local private = assert(json.decode(tostring(rows[1].private_context)))
            test.eq(private.label, "kept")
            cleanup(id)
        end)

        test.it("prunes published audits past the window and keeps recent ones", function()
            local handle = db()
            local id = seed(handle)
            seed_audits(handle, id, 150, "2000-01-01T00:00:00Z", "2000-01-01T00:00:00Z")
            local pending, pending_err = handle:execute([[INSERT INTO kickside_execution_identity_audit
                (component_id,identity_generation,request_id,record_json,created_at)
                VALUES ($1,1,'pending','{}',$2)]], { id, time.now():utc():format_rfc3339() })
            test.is_nil(pending_err, tostring(pending_err))
            test.eq(tonumber(pending.rows_affected), 1)
            handle:release()
            local pruned = 0
            for _ = 1, 10 do
                local result, err = audit_retention.run(100)
                test.is_nil(err, tostring(err))
                if result.pruned == 0 then break end
                pruned = pruned + result.pruned
            end
            test.is_true(pruned >= 150)
            local reopened = db()
            local rows, rows_err = reopened:query([[SELECT request_id FROM kickside_execution_identity_audit
                WHERE component_id=$1]], { id })
            reopened:release()
            test.is_nil(rows_err, tostring(rows_err))
            test.eq(#rows, 1)
            test.eq(rows[1].request_id, "pending")
            cleanup(id)
        end)

        test.it("retains current selection evidence past expiry and prunes it only after generation advances", function()
            local handle = db()
            local id = seed(handle)
            local selected, select_err = set_as_owner(id, "retained-selection", 0)
            test.is_nil(select_err, tostring(select_err))
            test.eq(selected.identity_generation, 1)
            local _, age_err = handle:execute([[UPDATE kickside_execution_identity_audit
                SET created_at='2000-01-01T00:00:00Z',published_at='2000-01-01T00:00:00Z'
                WHERE component_id=$1 AND identity_generation=1]], { id })
            test.is_nil(age_err, tostring(age_err))
            handle:release()
            local result, run_err = audit_retention.run(100)
            test.is_nil(run_err, tostring(run_err))
            test.not_nil(result)
            local reopened = db()
            local rows, read_err = reopened:query([[SELECT identity_generation,created_at FROM kickside_execution_identity_audit
                WHERE component_id=$1]], { id })
            reopened:release()
            test.is_nil(read_err, tostring(read_err))
            test.eq(#rows, 1)
            test.eq(tonumber(rows[1].identity_generation), 1)
            test.eq(tostring(rows[1].created_at), "2000-01-01T00:00:00Z")
            local changed, change_err = set_as_owner(id, "replacement-selection", 1)
            test.is_nil(change_err, tostring(change_err))
            test.eq(changed.identity_generation, 2)
            local aged = db()
            local _, second_age_err = aged:execute([[UPDATE kickside_execution_identity_audit
                SET created_at='2000-01-01T00:00:00Z',published_at='2000-01-01T00:00:00Z'
                WHERE component_id=$1 AND identity_generation=2]], { id })
            test.is_nil(second_age_err, tostring(second_age_err))
            aged:release()
            local pruned, prune_err = audit_retention.run(100)
            test.is_nil(prune_err, tostring(prune_err))
            test.is_true(pruned.pruned >= 1)
            local final = db()
            local remaining, remaining_err = final:query([[SELECT identity_generation FROM kickside_execution_identity_audit
                WHERE component_id=$1]], { id })
            final:release()
            test.is_nil(remaining_err, tostring(remaining_err))
            test.eq(#remaining, 1)
            test.eq(tonumber(remaining[1].identity_generation), 2)
            cleanup(id)
        end)

        test.it("refuses one audit row above the row byte limit", function()
            local policy, policy_err = audit_policy.policy()
            test.is_nil(policy_err)
            local cap = policy.max_row_bytes
            test.is_nil(audit_policy.check_row("component", string.rep("a", cap), "set_execution_identity"))
            local refused = audit_policy.check_row("component", string.rep("a", cap + 1), "set_execution_identity")
            test.not_nil(refused)
            test.eq(refused:kind(), errors.INVALID)
            test.eq(refused:details().reason, "row_too_large")
            test.eq(refused:details().cap, cap)
            test.is_nil(refused:details().status)
        end)
    end)
end)
