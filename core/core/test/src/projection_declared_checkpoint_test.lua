-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local claim = require("claim")
local clock = require("clock")
local fixture = require("fixture")
local invoke = require("invoke")
local json = require("json")
local projections = require("projections")
local sql = require("sql")
local test = require("test")
local time = require("time")
local uuid = require("uuid")

local WORKER = "proc://app:declared_checkpoint_worker"
local KIND = "test.declared.checkpoint"
local TRIGGER = "kickside.test.threads:trigger"
local CHANGED = "kickside.test.threads:changed"

local function in_db(run)
    local db = assert(sql.get("app:db"))
    local ok, value = pcall(run, db)
    assert(select(2, db:release()) == nil)
    if not ok then error(value) end
    return value
end

local function registration(db, component_id, projection_key, cursor_key)
    local rows = assert(db:query([[SELECT c.id,c.job_id,c.actor_id,c.execution_identity_json,c.generation,c.last_seq,
        c.status,c.last_error,c.projection_id FROM kickside_projection_cursor c
        JOIN kickside_projection p ON p.id=c.projection_id
        WHERE c.thread_id=$1 AND p.kind=$2 AND p.projection_key=$3 AND c.cursor_key=$4]],
        {component_id, KIND, projection_key, cursor_key}))
    return assert(rows[1])
end

local function execute(row)
    local token = uuid.v7()
    local job = in_db(function(db)
        local dialect = assert(db:type())
        local tx = assert(db:begin())
        local leased = assert(claim.lease_row(tx, dialect, row.job_id, token,
            clock.format(time.now():add("1m"), dialect), clock.now(dialect)))
        assert(select(2, tx:commit()) == nil)
        return {id = row.job_id, lease_token = token, execution_seq = tonumber(leased.execution_seq)}
    end)
    local result, err = invoke.run({job = job, payload = {cursor_id = row.id}})
    assert(result, tostring(err))
    return result
end

return {run = test.run_cases(function()
    test.describe("private checkpoints on actor-bound component declarations", function()
        for _, case in ipairs({
            {name = "runs the installed descriptor under its persisted actor", allowed = true},
            {name = "refuses an extra cursor", alternate = true, refusal = "installed projection declaration"},
            {name = "refuses different stored configuration", config = true, refusal = "installed projection declaration"},
            {name = "refuses a different stored actor", identity = true, refusal = "component's execution identity"},
            {name = "refuses an unrelated component implementation", owner = true, refusal = "installed projection declaration"},
            {name = "continues to enforce live actor authorization", revoked = true, refusal = "deferred principal is disabled"},
        }) do
            test.it(case.name, function()
                local f = fixture.new()
                if case.revoked then f.owner = "transition-" .. f.owner end
                local id = uuid.v7()
                local impl = case.owner and "kickside.test.threads:thread_kind" or "app:declared_checkpoint_component"
                assert(f.register_bare_component(f.owner, id, impl, {}))
                local attached, attach_err = f.run_as(f.owner, "ensure_thread", {component_id = id,
                    impl_id = "app:declared_checkpoint_descriptor"})
                assert(attached, tostring(attach_err))
                local params = {thread_id = id, kind = KIND, projection_key = "source", cursor_key = "source",
                    worker_ref = WORKER, worker_input_mode = "prefetch_events", events = {input = {{type = TRIGGER}}}}
                local direct, direct_err = f.run_as(f.owner, "register_projection", params)
                test.is_nil(direct)
                test.is_true(errors.is(direct_err, errors.PERMISSION_DENIED), tostring(direct_err))
                local input, append_err = f.run_as(f.owner, "append_event", {thread_id = id,
                    event = {type = TRIGGER, body = {}}})
                assert(input, tostring(append_err))

                local before = in_db(function(db)
                    assert(db:execute([[CREATE TABLE IF NOT EXISTS declared_checkpoint_effect (
                        thread_id TEXT PRIMARY KEY, actor_id TEXT NOT NULL)]]))
                    local row = registration(db, id, "source", "source")
                    if case.alternate then
                        params.cursor_key = "alternate"
                        params.execution_identity_row = {actor_id = row.actor_id, actor_context = row.execution_identity_json}
                        assert(projections.register_projection(db, id, params))
                    elseif case.config then
                        local body_row = assert(db:query("SELECT body FROM kickside_projection WHERE id=$1",
                            {row.projection_id}))[1]
                        local body = type(body_row.body) == "table" and body_row.body or assert(json.decode(body_row.body))
                        body.worker_config = {arbitrary = true}
                        assert(db:execute("UPDATE kickside_projection SET body=$1 WHERE id=$2",
                            {assert(json.encode(body)), row.projection_id}))
                    elseif case.identity then
                        local identity = assert(json.decode(row.execution_identity_json))
                        identity.principal.id = f.stranger
                        assert(db:execute("UPDATE kickside_projection_cursor SET actor_id=$1,execution_identity_json=$2 WHERE id=$3",
                            {f.stranger, assert(json.encode(identity)), row.id}))
                    elseif case.revoked then
                        assert(db:execute([[INSERT INTO kickside_component_meta (meta_id,component_id,key,value)
                            VALUES ($1,$2,$3,$4)]], {uuid.v7(), id, "core_test.principal_state", "disabled"}))
                    end
                    return registration(db, id, "source", params.cursor_key)
                end)
                test.not_nil(before.actor_id)
                local result = execute(before)
                in_db(function(db)
                    local after = registration(db, id, "source", params.cursor_key)
                    local effects = assert(db:query("SELECT actor_id FROM declared_checkpoint_effect WHERE thread_id=$1", {id}))
                    local outputs = assert(db:query("SELECT body FROM kickside_event WHERE thread_id=$1 AND type=$2", {id, CHANGED}))
                    test.eq(after.id, before.id)
                    test.eq(after.job_id, before.job_id)
                    test.eq(tonumber(after.generation), tonumber(before.generation))
                    if case.allowed then
                        test.eq(tonumber(after.last_seq), 1)
                        test.eq(#effects, 1)
                        test.eq(effects[1].actor_id, f.owner)
                        test.eq(#outputs, 1)
                        local output = type(outputs[1].body) == "table" and outputs[1].body or assert(json.decode(outputs[1].body))
                        test.eq(output.actor_id, f.owner)
                    else
                        test.is_true(result.invalid, tostring(after.last_error))
                        test.contains(after.last_error, assert(case.refusal))
                        test.eq(tonumber(after.last_seq), 0)
                        test.eq(#effects, 0)
                        test.eq(#outputs, 0)
                    end
                    assert(projections.remove_projection(db, id, {projection_id = before.projection_id}))
                end)
            end)
        end
    end)
end)}
