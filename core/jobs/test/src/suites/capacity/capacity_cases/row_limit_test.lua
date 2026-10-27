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
        test.it("accounts for database defaults before accepting an enqueue row", function()
            local policy, policy_err = config.policy()
            test.is_nil(policy_err)
            if not policy or not policy.max_row_bytes then error("missing Jobs row byte limit") end
            local db, owner = open_db(), uuid.v7()
            local function insert(key: string, filler: string): (string?, error?)
                local id, err = lifecycle.enqueue_job(db, tostring(db:type()), {
                    owner_locator = { kind = "test", id = owner },
                    job_identity = { namespace = "enqueue_defaults", scope = owner, key = key },
                    job_type = "test.enqueue_defaults", payload = { filler = filler }, parked = true,
                })
                return id, err
            end
            local template_id, template_err = insert("template", "")
            test.is_nil(template_err)
            local rows, read_err = db:query("SELECT * FROM kickside_job WHERE id=$1", { template_id })
            test.is_nil(read_err)
            local template = rows[1]
            -- Reconstruct the explicit INSERT map that previously passed at
            -- exactly cap, before the database supplied these seven defaults.
            for _, key in ipairs({ "actor_context", "created_at", "updated_at", "execution_seq",
                    "wake_enabled", "wake_generation", "wake_control_pending" }) do
                template[key] = nil
            end
            template.slot = false
            template.payload = json.encode({ filler = "" })
            local base, base_err = row_bytes.measure(template)
            test.is_nil(base_err)
            local pad = policy.max_row_bytes - (base :: integer)
            test.is_true(pad > 512)
            template.payload = json.encode({ filler = string.rep("x", pad) })
            test.eq(row_bytes.measure(template), policy.max_row_bytes)
            test.is_nil(select(2, db:execute("DELETE FROM kickside_job WHERE id=$1", { template_id })))

            local rejected_id, reject_err = insert("target__", string.rep("x", pad))
            test.is_nil(rejected_id)
            test.not_nil(reject_err)
            test.eq(reject_err:kind(), errors.INVALID)
            test.eq(reject_err:details().reason, "row_too_large")
            local remaining, remaining_err = db:query("SELECT id FROM kickside_job WHERE owner_id=$1", { owner })
            test.is_nil(remaining_err)
            test.eq(#remaining, 0)

            local safe_id, safe_err = insert("safe____", string.rep("x", pad - 512))
            test.is_nil(safe_err)
            local stored_rows, stored_err = db:query("SELECT * FROM kickside_job WHERE id=$1", { safe_id })
            test.is_nil(stored_err)
            local stored = stored_rows[1]
            local stored_bytes, measure_err = row_bytes.measure(stored)
            test.is_nil(measure_err)
            test.is_true((stored_bytes :: integer) <= policy.max_row_bytes)
            test.eq(stored.actor_context, "{}")
            test.not_nil(stored.created_at)
            test.not_nil(stored.updated_at)
            test.is_true(stored.created_at ~= "9999-12-31T23:59:59.999999999+00:00")
            test.eq(tonumber(stored.execution_seq), 0)
            test.is_nil(select(2, db:execute("DELETE FROM kickside_job WHERE id=$1", { safe_id })))
            db:release()
        end)

        test.it("measures PostgreSQL JSONB expansion when admitting an enqueue payload", function()
            local policy, policy_err = config.policy()
            test.is_nil(policy_err)
            if not policy or not policy.max_row_bytes then error("missing Jobs row byte limit") end
            local db, owner = open_db(), uuid.v7()
            local dbtype = tostring(db:type())
            local payload: { [string]: any } = { filler = "" }
            for i = 1, 1024 do payload["key" .. tostring(i)] = "v" end
            local function insert(key: string): (string?, error?)
                local id, err = lifecycle.enqueue_job(db, dbtype, {
                    owner_locator = { kind = "test", id = owner },
                    job_identity = { namespace = "enqueue_jsonb", scope = owner, key = key },
                    job_type = "test.enqueue_jsonb", payload = payload, parked = true,
                })
                return id, err
            end
            local template_id, template_err = insert("template")
            test.is_nil(template_err)
            local rows, read_err = db:query("SELECT * FROM kickside_job WHERE id=$1", { template_id })
            test.is_nil(read_err)
            local predicted = rows[1]
            predicted.payload = json.encode(payload)
            predicted.created_at = "9999-12-31T23:59:59.999999999+00:00"
            predicted.updated_at = predicted.created_at
            predicted.slot = false
            predicted.wake_enabled = true
            predicted.wake_control_pending = false
            local base, base_err = row_bytes.measure(predicted)
            test.is_nil(base_err)
            local pad = policy.max_row_bytes - (base :: integer) - 512
            test.is_true(pad > 0)
            payload.filler = string.rep("x", pad)
            predicted.payload = json.encode(payload)
            test.eq(row_bytes.measure(predicted), policy.max_row_bytes - 512)
            test.is_nil(select(2, db:execute("DELETE FROM kickside_job WHERE id=$1", { template_id })))
            local id, insert_err = insert("target__")
            if dbtype == sql.type.POSTGRES then
                test.is_nil(id)
                test.not_nil(insert_err)
                test.eq(insert_err:details().reason, "row_too_large")
            else
                test.is_nil(insert_err)
                test.not_nil(id)
                local stored_rows, stored_err = db:query("SELECT * FROM kickside_job WHERE id=$1", { id })
                test.is_nil(stored_err)
                local bytes, bytes_err = row_bytes.measure(stored_rows[1])
                test.is_nil(bytes_err)
                test.is_true((bytes :: integer) <= policy.max_row_bytes)
                test.is_nil(select(2, db:execute("DELETE FROM kickside_job WHERE id=$1", { id })))
            end
            db:release()
        end)

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
            local marker = "termination_pending:" .. tostring(leased.lease_token)
            local setup, setup_begin_err = db:begin()
            test.is_nil(setup_begin_err)
            if not setup then error("row limit setup transaction unavailable") end
            local _, empty_payload_err = setup:execute("UPDATE kickside_job SET payload=$1 WHERE id=$2",
                { json.encode(""), id })
            test.is_nil(empty_payload_err)
            local rows, read_err = setup:query("SELECT * FROM kickside_job WHERE id=$1", { id })
            test.is_nil(read_err)
            local row = rows[1]
            row.last_error = marker
            local base_bytes, measure_err = row_bytes.measure(row)
            test.is_nil(measure_err)
            local pad = policy.max_row_bytes - (base_bytes :: integer) + 1
            test.is_true(pad > 0)
            local padded = string.rep("x", pad)
            local _, payload_err = setup:execute("UPDATE kickside_job SET payload=$1 WHERE id=$2",
                { json.encode(padded), id })
            test.is_nil(payload_err)
            local padded_rows, padded_read_err = setup:query("SELECT * FROM kickside_job WHERE id=$1", { id })
            test.is_nil(padded_read_err)
            local padded_row = padded_rows[1]
            padded_row.last_error = marker
            local padded_bytes, padded_measure_err = row_bytes.measure(padded_row)
            test.is_nil(padded_measure_err)
            test.eq(padded_bytes, policy.max_row_bytes + 1)
            local _, setup_commit_err = setup:commit()
            test.is_nil(setup_commit_err)
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

        test.it("rejects an exact pre-trigger cap row before the termination update", function()
            local policy, policy_err = config.policy()
            test.is_nil(policy_err)
            if not policy or not policy.max_row_bytes then error("missing Jobs row byte limit") end
            local db = open_db()
            local owner, token, template_id, id = uuid.v7(), uuid.v7(), uuid.v7(), uuid.v7()
            local seed = "2000-01-02T03:04:05.000000Z"
            local function insert_job(job_id: string, identity: string, payload: string): error?
                local _, err = db:execute([[INSERT INTO kickside_job
                    (id,job_type,payload,status,lease_token,job_identity,owner_kind,owner_id,created_at,updated_at)
                    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)]],
                    { job_id, "test.row_limit", payload, "running", token, identity, "test", owner, seed, seed })
                return err
            end
            test.is_nil(insert_job(template_id, "row_limit_guard:" .. template_id, json.encode("")))
            local template = db:query("SELECT * FROM kickside_job WHERE id=$1", { template_id })[1]
            local marker = "termination_pending:" .. tostring(token)
            template.last_error = marker
            local base_bytes, base_err = row_bytes.measure(template)
            test.is_nil(base_err)
            local pad = policy.max_row_bytes - (base_bytes :: integer)
            test.is_true(pad > 0)
            test.is_nil(select(2, db:execute("DELETE FROM kickside_job WHERE id=$1", { template_id })))
            test.is_nil(insert_job(id, "row_limit_guard:" .. id, json.encode(string.rep("z", pad))))
            local candidate = db:query("SELECT * FROM kickside_job WHERE id=$1", { id })[1]
            candidate.last_error = marker
            local candidate_bytes, candidate_err = row_bytes.measure(candidate)
            test.is_nil(candidate_err)
            test.eq(candidate_bytes, policy.max_row_bytes)
            local prepare_err = worker_fence.prepare_termination(db, { id = id, lease_token = token })
            test.not_nil(prepare_err)
            test.eq(prepare_err:kind(), errors.INVALID)
            test.eq(prepare_err:details().reason, "row_too_large")
            local after = db:query("SELECT * FROM kickside_job WHERE id=$1", { id })[1]
            test.is_nil(after.last_error)
            test.eq(after.payload, candidate.payload)
            test.eq(after.updated_at, candidate.updated_at)
            test.is_nil(select(2, db:execute("DELETE FROM kickside_job WHERE id=$1", { id })))
            db:release()
        end)

        test.it("keeps a safely under-cap termination row within the stored cap", function()
            local policy, policy_err = config.policy()
            test.is_nil(policy_err)
            if not policy or not policy.max_row_bytes then error("missing Jobs row byte limit") end
            local db = open_db()
            local id, owner, token = uuid.v7(), uuid.v7(), uuid.v7()
            local _, insert_err = db:execute([[INSERT INTO kickside_job
                (id,job_type,payload,status,lease_token,job_identity,owner_kind,owner_id,created_at,updated_at)
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)]],
                { id, "test.row_limit", json.encode(""), "running", token, "row_limit_safe:" .. id,
                    "test", owner, "2000-01-02T03:04:05.000000Z", "2000-01-02T03:04:05.000000Z" })
            test.is_nil(insert_err)
            test.is_nil(worker_fence.prepare_termination(db, { id = id, lease_token = token }))
            local after = db:query("SELECT * FROM kickside_job WHERE id=$1", { id })[1]
            local after_bytes, after_err = row_bytes.measure(after)
            test.is_nil(after_err)
            test.is_true((after_bytes :: integer) <= policy.max_row_bytes)
            test.is_nil(select(2, db:execute("DELETE FROM kickside_job WHERE id=$1", { id })))
            db:release()
        end)

        test.it("projects a stamped job snapshot without rereading or mutation", function()
            local executor: any = { query = function() error("snapshot must not reread") end }
            local stamped: any = { id = uuid.v7(), owner_kind = "test", owner_id = "stamped", payload = "{}",
                updated_at = "2000-01-02T03:04:05Z" }
            local expected: any = {}
            for key, value in pairs(stamped) do expected[key] = value end
            expected.updated_at = "9999-12-31T23:59:59.999999999+00:00"
            local expected_json = json.encode(expected)
            local stamped_err = row_bytes.check_update(executor, "kickside_job", stamped.id, {},
                (#(expected_json :: string)) - 1, "snapshot", stamped)
            test.not_nil(stamped_err)
            test.eq(stamped_err:kind(), errors.INVALID)
            test.eq(stamped_err:details().used, #(expected_json :: string))
            test.eq(stamped.updated_at, "2000-01-02T03:04:05Z")
        end)

        test.it("does not project job runs or incomplete job snapshots", function()
            local executor: any = { query = function() error("snapshot must not reread") end }
            local job: any = { id = uuid.v7(), owner_kind = "test", owner_id = "incomplete", payload = "{}" }
            local job_bytes = row_bytes.measure(job)
            test.is_nil(row_bytes.check_update(executor, "kickside_job", job.id, {}, job_bytes :: integer,
                "snapshot", job))
            local run: any = { id = uuid.v7(), owner_kind = "test", owner_id = "run", payload = "{}",
                updated_at = "2000-01-02T03:04:05Z" }
            local run_bytes = row_bytes.measure(run)
            test.is_nil(row_bytes.check_update(executor, "kickside_job_run", run.id, {}, run_bytes :: integer,
                "snapshot", run))
        end)
    end)
end
return { run = test.run_cases(define_tests) }
