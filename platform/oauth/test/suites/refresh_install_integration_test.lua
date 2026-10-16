local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local time = require("time")
local json = require("json")
local funcs = require("funcs")
local jobs = require("jobs")
local support = require("oauth_repo_support")
local oauth_repo = require("oauth_repo")
local oauth_read_repo = require("oauth_read_repo")
local oauth_token_repo = require("oauth_token_repo")
local refresh_schedule = require("refresh_schedule")
type Map = { [string]: any }
local function deadline_instant(value: string): any
    local encoded = value:find("T") and value or (value:gsub(" ", "T") .. "Z")
    local instant, parse_err = time.parse(time.RFC3339, encoded)
    test.is_nil(parse_err)
    return test.not_nil(instant)
end
local function query(statement: string, params: { any }): { Map }
    local db, err = sql.get("app:db")
    if err then error(tostring(err)) end
    local rows, read_err = db:query(statement, params)
    db:release()
    if read_err then error(tostring(read_err)) end
    return rows
end
local function execute(statement: string, params: { any }): ()
    local db, err = sql.get("app:db")
    if err then error(tostring(err)) end
    local _, write_err = db:execute(statement, params)
    db:release()
    if write_err then error(tostring(write_err)) end
end
local function claim_slot(job_id: string?): Map
    if type(job_id) ~= "string" then error("refresh slot id is required") end
    execute("UPDATE kickside_job SET status='running',lease_token=$1,lease_until=$2,execution_seq=execution_seq+1 WHERE id=$3",
        { uuid.v7(), time.now():utc():add(60*time.SECOND):format(time.RFC3339), job_id })
    return query("SELECT * FROM kickside_job WHERE id=$1", { job_id })[1]
end
type CreatedConnection = { created_at: string }
local function create(): (string, CreatedConnection)
    execute("CREATE TABLE IF NOT EXISTS oauth_refresh_behavior (connection_id TEXT,behavior TEXT)", {})
    local id = uuid.v7()
    local result, err = oauth_repo.create_connection(id, {
        provider = "google", connection_name = "Native refresh", connection_state = "connected",
        expires_at = time.now():unix() + 3601, tokens = { access_token = "a", refresh_token = "r" },
    })
    if err then error(tostring(err)) end
    local created_at = result and result.created_at
    if type(created_at) ~= "string" then error("connection creation returned no issue timestamp") end
    return id, { created_at = created_at }
end
local function required_connection(component_id: string): Map
    local row, err = refresh_schedule.read(component_id)
    if err then error(tostring(err)) end
    if not row then error("refresh connection is required") end
    return row
end
local function required_deadline(component_id: string): string
    local deadline, err = refresh_schedule.connection_deadline(required_connection(component_id))
    if err then error(tostring(err)) end
    if type(deadline) ~= "string" then error("refresh deadline is required") end
    return deadline
end
local function define_tests()
    test.describe("OAuth refresh Jobs integration", function()
        test.it("owns one Jobs slot per connection at the exact refresh deadline", function()
            local id, created = create()
            local job_id, err = refresh_schedule.arm(id)
            test.is_nil(err, tostring(err))
            local again, repeat_err = refresh_schedule.arm(id)
            test.is_nil(repeat_err); test.eq(again, job_id)
            local row = query("SELECT job_type,scheduled_at FROM kickside_job WHERE id=$1", { job_id })[1]
            test.eq(row.job_type, "kickside.oauth:refresh_connection")
            local current = refresh_schedule.read(id)
            local deadline = refresh_schedule.deadline(current.expires_at, time.parse(time.RFC3339, created.created_at):unix())
            test.eq(deadline_instant(row.scheduled_at):utc():format(time.RFC3339NANO),
                deadline_instant(deadline):utc():format(time.RFC3339NANO))
            local _, cancel_err = refresh_schedule.cancel(id)
            test.is_nil(cancel_err, tostring(cancel_err))
            test.eq(query("SELECT status FROM kickside_job WHERE id=$1", { job_id })[1].status, "cancelled")
            test.is_nil(select(2, oauth_repo.delete_connection(id)))
        end)
        test.it("records token update wake demand atomically and wakes the same slot to reread the new deadline", function()
            local id = create()
            local job_id, err = refresh_schedule.arm(id)
            test.is_nil(err)
            local first = refresh_schedule.read(id)
            local _, update_err = oauth_token_repo.update_tokens(id, { access_token = "rotated" }, time.now():unix()+7201)
            test.is_nil(update_err, tostring(update_err))
            local updated = refresh_schedule.read(id)
            test.eq(updated.refresh_wake_generation, first.refresh_wake_generation+1)
            test.eq(updated.refresh_wake_applied_generation, first.refresh_wake_applied_generation)
            local same, arm_err = refresh_schedule.arm(id)
            test.is_nil(arm_err); test.eq(same, job_id)
            local job = query("SELECT scheduled_at FROM kickside_job WHERE id=$1", { job_id })[1]
            test.is_false(deadline_instant(job.scheduled_at):after(time.now()),
                "the worker is woken to rearm from current durable token data")
            test.is_nil(select(2, refresh_schedule.cancel(id)))
            test.is_nil(select(2, oauth_repo.delete_connection(id)))
        end)
        test.it("fences an in-flight refresh after cancellation or reauthorization", function()
            local id = create()
            local prior = refresh_schedule.read(id)
            test.is_nil(select(2, refresh_schedule.cancel(id)))
            local result, err = oauth_token_repo.update_tokens(id, { access_token = "stale" }, time.now():unix()+7200, prior.refresh_wake_generation)
            test.is_nil(err); test.is_true(result.stale)
            test.is_false(refresh_schedule.read(id).refresh_enabled)
            test.is_nil(select(2, oauth_repo.delete_connection(id)))
        end)
        test.it("preserves omitted expiry and parks refresh instead of hot-looping on an old deadline", function()
            local id = create()
            local prior = refresh_schedule.read(id)
            test.is_nil(select(2, oauth_token_repo.update_tokens(id, { access_token = "no-expiry" }, nil)))
            local current = refresh_schedule.read(id)
            test.eq(current.expires_at, prior.expires_at)
            test.is_false(current.refresh_enabled)
            test.is_nil(refresh_schedule.connection_deadline(current))
            test.is_nil(select(2, oauth_repo.delete_connection(id)))
        end)

        test.it("runs the native worker early only to rearm at the stored exact deadline", function()
            local id = create()
            local job_id, arm_err = refresh_schedule.arm(id)
            test.is_nil(arm_err)
            local expected = required_deadline(id)
            local job = claim_slot(job_id)
            local result, err = funcs.call("kickside.oauth:refresh_connection", { job = job, payload = { component_id = id } })
            test.is_nil(err, tostring(err)); test.is_true(result.self_completed)
            local actual = query("SELECT scheduled_at FROM kickside_job WHERE id=$1", { job_id })[1].scheduled_at
            test.eq(deadline_instant(actual):utc():format(time.RFC3339NANO),
                deadline_instant(expected):utc():format(time.RFC3339NANO))
            test.is_nil(select(2, refresh_schedule.cancel(id)))
            test.is_nil(select(2, oauth_repo.delete_connection(id)))
        end)
        test.it("refreshes under the stored live connection identity and rereads token rotation for its next exact deadline", function()
            execute("CREATE TABLE IF NOT EXISTS oauth_refresh_effect (connection_id TEXT,actor_id TEXT)", {})
            local id = create()
            local owner = "oauth-native-" .. uuid.v7()
            local context = { component_id = id, _execution_identity = { version = 2,
                component_id = id, principal = { kind = "user", id = owner },
                authorized_by = { kind = "user", id = owner }, captured_at = time.now():utc():format(time.RFC3339) } }
            execute("INSERT INTO kickside_components (component_id,impl_id,private_context,created_at,updated_at) VALUES ($1,$2,$3,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)",
                { id, "kickside.oauth:oauth_connection", json.encode(context) })
            execute("INSERT INTO kickside_component_access (access_id,subject_id,subject_type,component_id,source_component_id,access_mask,created_at) VALUES ($1,$2,'user',$3,$4,15,CURRENT_TIMESTAMP)", { uuid.v7(), owner, id, id })
            test.is_nil(select(2, oauth_repo.update_connection(id, { provider = "native-refresh-test" })))
            test.is_nil(select(2, oauth_token_repo.update_tokens(id, { access_token = "old", refresh_token = id }, time.now():unix()-2)))
            local job_id, arm_err = refresh_schedule.arm(id)
            test.is_nil(arm_err)
            local job = claim_slot(job_id)
            local result, err = funcs.call("kickside.oauth:refresh_connection", { job = job, payload = { component_id = id } })
            test.is_nil(err, tostring(err)); test.is_true(result.self_completed)
            local effects = query("SELECT actor_id FROM oauth_refresh_effect WHERE connection_id=$1", { id })
            test.eq(#effects, 1); test.eq(effects[1].actor_id, owner)
            local refreshed, token_err = oauth_read_repo.get_connection(id)
            test.is_nil(token_err, tostring(token_err))
            test.eq(refreshed.tokens.refresh_token, id, "Google-style refresh responses omit a replacement refresh token")
            local expected = required_deadline(id)
            -- Token publication may leave control demand on the running slot.
            -- Its next attempt reads the new deadline and performs no effect.
            job = claim_slot(job_id)
            result, err = funcs.call("kickside.oauth:refresh_connection", { job = job, payload = { component_id = id } })
            test.is_nil(err, tostring(err)); test.is_true(result.self_completed)
            test.eq(#query("SELECT actor_id FROM oauth_refresh_effect WHERE connection_id=$1", { id }), 1)
            local actual = query("SELECT scheduled_at FROM kickside_job WHERE id=$1", { job_id })[1].scheduled_at
            test.eq(deadline_instant(actual):utc():format(time.RFC3339NANO),
                deadline_instant(expected):utc():format(time.RFC3339NANO))
            test.is_nil(select(2, refresh_schedule.cancel(id)))
            test.is_nil(select(2, oauth_repo.delete_connection(id)))
        end)
        test.it("does not let a stale provider rejection disable a newer authorization", function()
            execute("CREATE TABLE IF NOT EXISTS oauth_refresh_effect (connection_id TEXT,actor_id TEXT)", {})
            execute("CREATE TABLE IF NOT EXISTS oauth_refresh_behavior (connection_id TEXT,behavior TEXT)", {})
            local id = create()
            local owner = "oauth-reauth-" .. uuid.v7()
            local context = { component_id = id, _execution_identity = { version = 2,
                component_id = id, principal = { kind = "user", id = owner },
                authorized_by = { kind = "user", id = owner }, captured_at = time.now():utc():format(time.RFC3339) } }
            execute("INSERT INTO kickside_components (component_id,impl_id,private_context,created_at,updated_at) VALUES ($1,$2,$3,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)",
                { id, "kickside.oauth:oauth_connection", json.encode(context) })
            execute("INSERT INTO kickside_component_access (access_id,subject_id,subject_type,component_id,source_component_id,access_mask,created_at) VALUES ($1,$2,'user',$3,$4,15,CURRENT_TIMESTAMP)", { uuid.v7(), owner, id, id })
            test.is_nil(select(2, oauth_repo.update_connection(id, { provider = "native-refresh-test" })))
            test.is_nil(select(2, oauth_token_repo.update_tokens(id, { access_token = "old", refresh_token = id }, time.now():unix()-2)))
            execute("INSERT INTO oauth_refresh_behavior (connection_id,behavior) VALUES ($1,'reauthorize_then_reject')", { id })
            local job_id, arm_err = refresh_schedule.arm(id)
            test.is_nil(arm_err)
            local result, err = funcs.call("kickside.oauth:refresh_connection", { job = claim_slot(job_id), payload = { component_id = id } })
            test.is_nil(err, tostring(err)); test.is_true(result.self_completed)
            local row = query("SELECT connection_state,refresh_enabled FROM kickside_oauth_connections WHERE component_id=$1", { id })[1]
            test.eq(row.connection_state, "connected")
            test.is_true(row.refresh_enabled == true or row.refresh_enabled == 1)
            test.is_nil(select(2, refresh_schedule.cancel(id)))
            test.is_nil(select(2, oauth_repo.delete_connection(id)))
        end)
        test.it("keeps a temporary provider HTTP failure connected and retries the same Jobs slot", function()
            execute("CREATE TABLE IF NOT EXISTS oauth_refresh_effect (connection_id TEXT,actor_id TEXT)", {})
            local id = create()
            local owner = "oauth-transient-" .. uuid.v7()
            local context = { component_id = id, _execution_identity = { version = 2,
                component_id = id, principal = { kind = "user", id = owner },
                authorized_by = { kind = "user", id = owner }, captured_at = time.now():utc():format(time.RFC3339) } }
            execute("INSERT INTO kickside_components (component_id,impl_id,private_context,created_at,updated_at) VALUES ($1,$2,$3,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)",
                { id, "kickside.oauth:oauth_connection", json.encode(context) })
            execute("INSERT INTO kickside_component_access (access_id,subject_id,subject_type,component_id,source_component_id,access_mask,created_at) VALUES ($1,$2,'user',$3,$4,15,CURRENT_TIMESTAMP)", { uuid.v7(), owner, id, id })
            test.is_nil(select(2, oauth_repo.update_connection(id, { provider = "native-refresh-test" })))
            test.is_nil(select(2, oauth_token_repo.update_tokens(id, { access_token = "old", refresh_token = id }, time.now():unix()-2)))
            execute("INSERT INTO oauth_refresh_behavior (connection_id,behavior) VALUES ($1,'temporarily_unavailable')", { id })
            local job_id, arm_err = refresh_schedule.arm(id)
            test.is_nil(arm_err)
            local result, err = funcs.call("kickside.oauth:refresh_connection", { job = claim_slot(job_id), payload = { component_id = id } })
            local row = query("SELECT connection_state,refresh_enabled,schedule_id FROM kickside_oauth_connections WHERE component_id=$1", { id })[1]
            test.eq(row.connection_state, "connected")
            test.is_true(row.refresh_enabled == true or row.refresh_enabled == 1)
            test.eq(row.schedule_id, job_id)
            test.is_nil(result)
            test.not_nil(err)
            test.is_true(err:retryable())
            -- A later definitive rejection still requires reconnect and parks
            -- this same slot; a transient failure must not erase that distinction.
            execute("UPDATE oauth_refresh_behavior SET behavior='invalid_grant' WHERE connection_id=$1", { id })
            result, err = funcs.call("kickside.oauth:refresh_connection", { job = claim_slot(job_id), payload = { component_id = id } })
            test.is_nil(err, tostring(err)); test.is_true(result.self_completed)
            row = query("SELECT connection_state,refresh_enabled,schedule_id FROM kickside_oauth_connections WHERE component_id=$1", { id })[1]
            test.eq(row.connection_state, "needs_reauth")
            test.is_true(row.refresh_enabled == false or row.refresh_enabled == 0)
            test.eq(row.schedule_id, job_id)
            test.is_nil(select(2, refresh_schedule.cancel(id)))
            test.is_nil(select(2, oauth_repo.delete_connection(id)))
        end)
        test.it("persists a failed slot install floor and propagates failed retry persistence", function()
            local id = create()
            local enqueue = jobs.enqueue
            jobs.enqueue = function() return nil, errors.new({ kind = errors.UNAVAILABLE, retryable = true, message = "Jobs unavailable" }) end
            local _, err, deferred = refresh_schedule.arm(id)
            jobs.enqueue = enqueue
            test.not_nil(err); test.is_true(deferred)
            local row = refresh_schedule.read(id)
            test.not_nil(row.refresh_retry_at)
            test.is_nil(select(2, refresh_schedule.bootstrap()))
            local after_boot = refresh_schedule.read(id)
            test.eq(after_boot.refresh_wake_generation, row.refresh_wake_generation)
            test.eq(after_boot.refresh_retry_at, row.refresh_retry_at)
            local dispatched, dispatch_err = refresh_schedule.dispatch()
            test.is_nil(dispatch_err); test.eq(dispatched.rearm, row.refresh_retry_at)
            -- New owner demand is eligible again; failure to record its floor
            -- must reach the dispatcher caller, not become a hot continuation.
            test.is_nil(select(2, oauth_token_repo.update_tokens(id, { access_token = "new" }, time.now():unix()+3600)))
            local get_db = support.get_db
            local reads = 0
            support.get_db = function()
                reads = reads+1
                if reads >= 3 then return nil, "OAuth storage unavailable" end
                return get_db()
            end
            jobs.enqueue = function() return nil, errors.new({ kind = errors.UNAVAILABLE, retryable = true, message = "Jobs unavailable" }) end
            local answer, failure = refresh_schedule.dispatch()
            jobs.enqueue = enqueue; support.get_db = get_db
            test.is_nil(answer); test.not_nil(failure)
            test.is_nil(select(2, refresh_schedule.cancel(id)))
            test.is_nil(select(2, oauth_repo.delete_connection(id)))
        end)
        test.it("never claims a durable retry floor after a concurrent token update won the generation", function()
            local id = create()
            local enqueue = jobs.enqueue
            local raced = false
            jobs.enqueue = function(spec: Map)
                if spec.scope == "refresh" and spec.key == id and not raced then
                    raced = true
                    local _, update_err = oauth_token_repo.update_tokens(id, { access_token = "newer" }, time.now():unix()+7200)
                    if update_err then error(tostring(update_err)) end
                    return nil, errors.new({ kind = errors.UNAVAILABLE, retryable = true, message = "Jobs unavailable" })
                end
                return enqueue(spec)
            end
            local _, err, deferred = refresh_schedule.arm(id)
            jobs.enqueue = enqueue
            test.not_nil(err); test.is_false(deferred == true)
            test.is_nil(refresh_schedule.read(id).refresh_retry_at)
            test.is_nil(select(2, refresh_schedule.arm(id)))
            test.is_nil(select(2, refresh_schedule.cancel(id)))
            test.is_nil(select(2, oauth_repo.delete_connection(id)))
        end)
        test.it("cancels a slot installed by a stale arm after the connection was deleted", function()
            local id = create()
            local enqueue = jobs.enqueue
            local stale_job: string? = nil
            local raced = false
            jobs.enqueue = function(spec: Map)
                local result, err = enqueue(spec)
                if not raced and spec.scope == "refresh" and spec.key == id and result then
                    raced = true; stale_job = result.id
                    local _, cancel_err = refresh_schedule.cancel(id)
                    if cancel_err then error(tostring(cancel_err)) end
                    local _, delete_err = oauth_repo.delete_connection(id)
                    if delete_err then error(tostring(delete_err)) end
                end
                return result, err
            end
            local _, err = refresh_schedule.arm(id)
            jobs.enqueue = enqueue
            test.is_nil(err, tostring(err)); test.not_nil(stale_job)
            test.eq(query("SELECT status FROM kickside_job WHERE id=$1", { stale_job })[1].status, "cancelled")
        end)

        test.it("republishes durable connection demand at boot without a ticker", function()
            local id = create()
            test.is_nil(select(2, refresh_schedule.arm(id)))
            local before = refresh_schedule.read(id)
            test.is_nil(select(2, refresh_schedule.bootstrap()))
            local current = refresh_schedule.read(id)
            test.eq(current.refresh_wake_generation, before.refresh_wake_generation+1)
            test.is_true(current.refresh_wake_generation>current.refresh_wake_applied_generation)
            -- Recovery must preserve existing pending demand until dispatch
            -- acknowledges it, even when bootstrap is called again.
            test.is_nil(select(2, refresh_schedule.bootstrap()))
            local pending = refresh_schedule.read(id)
            test.eq(pending.refresh_wake_generation, before.refresh_wake_generation+1)
            test.eq(pending.refresh_wake_applied_generation, before.refresh_wake_applied_generation)
            local dispatched, err = refresh_schedule.dispatch()
            test.is_nil(err, tostring(err)); test.not_nil(dispatched)
            local applied = refresh_schedule.read(id)
            test.eq(applied.refresh_wake_generation, before.refresh_wake_generation+1)
            test.eq(applied.refresh_wake_applied_generation, applied.refresh_wake_generation)
            test.eq(applied.schedule_id, before.schedule_id)
            test.is_nil(select(2, refresh_schedule.cancel(id)))
            test.is_nil(select(2, oauth_repo.delete_connection(id)))
        end)
    end)
end
return { run = test.run_cases(define_tests) }
