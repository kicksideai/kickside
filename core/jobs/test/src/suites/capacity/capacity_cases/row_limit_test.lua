local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local json = require("json")
local lifecycle = require("lifecycle")
local config = require("config")
local job_fixture = require("job_fixture")
local worker_fence = require("worker_fence")
local row_bytes = require("row_bytes")

local function open_db(): sql.DB
    local db, err = sql.get("app:db")
    if not db then error("test database unavailable: " .. tostring(err)) end
    if err or not db then error("jobs row limit DB unavailable: " .. tostring(err)) end
    return db :: sql.DB
end

local function enqueue(db: sql.DB, owner_id: string, key: string): (string?, error?, boolean?)
    return lifecycle.enqueue_job(db, tostring(db:type()), {
        owner_locator = { kind = "test", id = owner_id },
        job_identity = { namespace = "row_limit", scope = owner_id, key = key },
        job_type = "test.row_limit", parked = true,
    })
end

local function define_tests()
    test.describe("jobs row byte limit", function()
        test.it("checks an already locked complete snapshot without rereading or changing it", function()
            local row: any = { id = uuid.v7(), owner_kind = "test", owner_id = "snapshot",
                payload = string.rep("x", 512), status = "pending", last_error = "prior" }
            local reads = 0
            local executor: any = { query = function(): (any, nil)
                reads = reads + 1
                return { row }, nil
            end }
            local err = row_bytes.check_update(executor, "kickside_job", row.id,
                { status = "running", last_error = row_bytes.NULL }, 100, "claim_job", row)
            test.not_nil(err)
            test.eq(err:kind(), errors.INVALID)
            test.eq(err:details().reason, "row_too_large")
            test.eq(reads, 0)
            test.eq(row.status, "pending")
            test.eq(row.last_error, "prior")
            test.is_nil(row_bytes.check_update(executor, "kickside_job", row.id,
                { status = "running", last_error = row_bytes.NULL }, 1024, "claim_job", row))
            test.eq(reads, 0)
            test.is_nil(row_bytes.check_update(executor, "kickside_job", row.id:upper(),
                { status = "running" }, 1024, "claim_job", row))
            local cause = errors.new({ message = "changes fail", kind = errors.INVALID })
            local callback_err = row_bytes.check_update(executor, "kickside_job", row.id,
                function() return nil, cause end, 1024, "claim_job", row)
            test.eq(callback_err, cause)
            local wrong = row_bytes.check_update(executor, "kickside_job", "other",
                {}, 1024, "claim_job", row)
            test.is_true(errors.is(wrong, errors.INTERNAL))
        end)

        test.it("measures worker termination and quarantine updates against the complete job row", function()
            local policy, policy_err = config.policy()
            test.is_nil(policy_err)
            if not policy or not policy.max_row_bytes then error("missing Jobs row byte limit") end
            local owner, db = uuid.v7(), open_db()
            local id, enqueue_err = enqueue(db, owner, "termination-cap")
            test.is_nil(enqueue_err)
            local dbtype = tostring(db:type())
            local leased, lease_err = job_fixture.lease_own(db, dbtype, id :: string)
            if not leased then error("test job lease fails: " .. tostring(lease_err)) end
            test.is_nil(lease_err)
            local rows, read_err = db:query("SELECT * FROM kickside_job WHERE id=$1", { id })
            test.is_nil(read_err)
            local row = rows[1]
            local marker = "termination_pending:" .. tostring(leased.lease_token)
            row.payload = json.encode("")
            row.last_error = marker
            local base_bytes, measure_err = row_bytes.measure(row)
            test.is_nil(measure_err)
            local pad = policy.max_row_bytes - (base_bytes :: integer) + 1
            test.is_true(pad > 0)
            local padded = string.rep("x", pad)
            local _, payload_err = db:execute("UPDATE kickside_job SET payload=$1 WHERE id=$2",
                { json.encode(padded), id })
            test.is_nil(payload_err)
            local prepare_err = worker_fence.prepare_termination(db, leased)
            test.not_nil(prepare_err)
            test.eq(prepare_err:kind(), errors.INVALID)
            test.eq(prepare_err:details().reason, "row_too_large")
            local after_prepare = db:query("SELECT * FROM kickside_job WHERE id=$1", { id })[1]
            test.is_nil(after_prepare.last_error)
            local after_bytes, after_measure_err = row_bytes.measure(after_prepare)
            test.is_nil(after_measure_err)
            test.is_true((after_bytes :: integer) <= policy.max_row_bytes)

            local overlarge = json.encode(string.rep("y", policy.max_row_bytes * 2))
            local _, oversize_err = db:execute([[UPDATE kickside_job SET payload=$1,last_error=$2
                WHERE id=$3]], { overlarge, marker, id })
            test.is_nil(oversize_err)
            local hold_err = worker_fence.hold_unconfirmed_execution(db, leased)
            test.not_nil(hold_err)
            test.eq(hold_err:kind(), errors.INVALID)
            test.eq(hold_err:details().reason, "row_too_large")
            local after_hold = db:query("SELECT lease_token FROM kickside_job WHERE id=$1", { id })[1]
            test.eq(after_hold.lease_token, leased.lease_token)
            local _, cleanup_err = db:execute("DELETE FROM kickside_job WHERE id=$1", { id })
            test.is_nil(cleanup_err)
            db:release()
        end)
    end)
end
return { run = test.run_cases(define_tests) }
