local test = require("test")
local sql = require("sql")
local json = require("json")
local slot = require("slot")
local drive = require("drive")
local h = require("round_harness")
local round_write = require("round_write")
local plan = require("plan")
local contract = require("contract")
local security = require("security")

local function state_db()
    local db, err = sql.get("app:db")
    if err then error(tostring(err)) end
    local _, create_err = db:execute("CREATE TABLE IF NOT EXISTS compat_run_as_upgrade (id TEXT PRIMARY KEY, value TEXT NOT NULL)")
    if create_err then db:release(); error(tostring(create_err)) end
    return db
end

local function write(db, id, value)
    local _, err = db:execute("INSERT INTO compat_run_as_upgrade (id,value) VALUES ($1,$2)", {id, value})
    if err then error(tostring(err)) end
end

local function read(db, id)
    local rows, err = db:query("SELECT value FROM compat_run_as_upgrade WHERE id=$1", {id})
    if err or not rows or not rows[1] then error(tostring(err or "missing " .. id)) end
    return rows[1].value
end

local function append(thread_id, configurer)
    local actor, actor_err = security.new_actor(configurer, {security_groups = {"automation_test"}})
    if actor_err then error(tostring(actor_err)) end
    local scope, scope_err = security.named_scope("wippy.security:process")
    if scope_err then error(tostring(scope_err)) end
    local definition, definition_err = contract.get("kickside.core:threads")
    if definition_err then error(tostring(definition_err)) end
    local threads, open_err = definition:with_actor(actor):with_scope(scope):open()
    if open_err then error(tostring(open_err)) end
    local result, append_err = threads:append_event({thread_id = thread_id,
        event = {type = h.EVENT_TYPE, role = "user", body = {text = "observe_identity"}}})
    if append_err or not result or result.success == false then error(tostring(append_err or (result and result.error))) end
end

local function create_drive(automation_id, thread_id, drive_key)
    local db = h.db()
    local tx = db:begin()
    local _, insert_err = drive.insert_tx(tx, {automation_id = automation_id, drive_key = drive_key or "compat", source_kind = "event",
        source_thread_id = thread_id, action = {source_ref = "fixture:compat", event_type = h.EVENT_TYPE}, applied = {declaration = {}, policy = h.drive_policy(nil)}})
    if insert_err then tx:rollback() else tx:commit() end
    db:release(); test.is_nil(insert_err, tostring(insert_err))
end

local function prepared(automation_id)
    local d=h.read_drive(automation_id,"compat_prepared")
    local job=h.running_job()
    h.set_drive(automation_id,"compat_prepared","round_token=$1,round_until=$2",{job.lease_token,job.lease_until})
    local value,err=round_write.prepare({key="compat-prepared",hash="compat-payload",prepared=true,
        drive={automation_id=automation_id,drive_key="compat_prepared",source_port="fixture:compat",
            ledger_port="fixture:compat",fence={round_token=job.lease_token,round_until=job.lease_until,
                revision=d.revision,rewind_generation=d.rewind_generation,command_generation=d.command_generation,job=job}}},
        function() error("legacy prepared output recomputes after update") end)
    test.is_nil(err,tostring(err))
    test.eq(value.title,"published prepared value")
end

local function run_live(automation_id, thread_id, configurer)
    local listener = h.listen_round(automation_id, "compat")
    local worker = nil
    local ok, err = pcall(function()
        append(thread_id, configurer)
        local job_id, provision_err = slot.provision(automation_id, "compat")
        test.is_nil(provision_err, tostring(provision_err)); test.not_nil(job_id)
        local key = h.probe_key_for(job_id)
        worker = h.start_worker()
        h.receive_logged(listener)
        h.await_worker_pass(key)
    end)
    if worker then h.stop_worker(worker) end
    h.close_round(listener)
    if not ok then error(err) end
end

return {run = test.run_cases(function()
    test.describe("published automation update", function()
        test.it("preserves configured identity bytes and dispatches as the configuring user", function()
            h.await_migrations()
            local db = state_db()
            if plan.phase == "baseline" then
                local env = h.setup("compat_published")
                create_drive(env.automation_id, env.thread_id)
                create_drive(env.automation_id, env.thread_id,"compat_prepared")
                local now=drive.utc_now()
                local item={item_key="compat-waiting",dedup_key="compat-waiting",op="upsert",payload={directive="observe_identity"},source_port="fixture:compat",delivery_generation=1}
                local keys=round_write.keys({automation_id=env.automation_id,source_port="fixture:compat",delivery_revision=1},item)
                item.delivery_key=keys.idempotency_key
                local _,prepared_err=db:execute("INSERT INTO kickside_automation_prepared (automation_id,idempotency_key,payload_hash,prepared_json,created_at) VALUES ($1,'compat-prepared','compat-payload',$2,$3)",
                    {env.automation_id,json.encode({title="published prepared value"}),now})
                test.is_nil(prepared_err,tostring(prepared_err))
                local _,waiting_err=db:execute("INSERT INTO kickside_trigger_item_ledger (owner_id,source_port,item_key,dedup_key,identity_key,envelope_json,state,attempts,first_failed_at,last_failed_at,error_code,retriable,terminal,created_at,updated_at,delivery_order) VALUES ($1,'fixture:compat','compat-waiting','compat-waiting',$2,$3,'waiting',0,$4,$4,'capacity',true,false,$4,$4,1)",
                    {env.automation_id,item.delivery_key,json.encode(item),now})
                test.is_nil(waiting_err,tostring(waiting_err))
                h.set_drive(env.automation_id,"compat","unresolved_count=1",{})
                local rows, read_err = db:query("SELECT record_json FROM kickside_execution_identity_audit WHERE component_id=$1", {env.automation_id})
                test.is_nil(read_err, tostring(read_err)); test.not_nil(rows and rows[1])
                write(db, "automation_id", env.automation_id)
                write(db, "thread_id", env.thread_id)
                write(db, "identity_json", tostring(rows[1].record_json))
                write(db, "configurer", env.owner)
                local components, component_err = db:query("SELECT private_context FROM kickside_components WHERE component_id=$1", {env.automation_id})
                test.is_nil(component_err); test.eq(#components, 1)
                write(db, "configuration", tostring(components[1].private_context))
                db:release()
                return
            end
            local automation_id, thread_id = read(db, "automation_id"), read(db, "thread_id")
            local expected_identity, configurer = read(db, "identity_json"), read(db, "configurer")
            local rows, read_err = db:query("SELECT record_json FROM kickside_execution_identity_audit WHERE component_id=$1", {automation_id})
            test.is_nil(read_err, tostring(read_err)); test.not_nil(rows and rows[1])
            test.eq(tostring(rows[1].record_json), expected_identity)
            local components, component_err = db:query("SELECT private_context FROM kickside_components WHERE component_id=$1", {automation_id})
            test.is_nil(component_err); test.eq(#components, 1)
            test.eq(tostring(components[1].private_context), read(db, "configuration"))
            db:release()
            prepared(automation_id)
            run_live(automation_id, thread_id, configurer)
            local debt=h.query("SELECT state FROM kickside_trigger_item_ledger WHERE owner_id=$1 AND item_key='compat-waiting'",{automation_id})
            test.eq(#debt,1)
            test.eq(debt[1].state,"resolved")
            local retained=h.query("SELECT idempotency_key,payload_hash,prepared_json FROM kickside_automation_prepared WHERE automation_id=$1",{automation_id})
            test.eq(#retained,1)
            test.eq(retained[1].idempotency_key,"compat-prepared")
            test.eq(retained[1].payload_hash,"compat-payload")
            test.eq(json.decode(retained[1].prepared_json).title,"published prepared value")
            local log_rows = h.log_rows(automation_id, "compat")
            test.not_nil(log_rows[#log_rows])
            local detail = json.decode(log_rows[#log_rows].detail_json)
            test.eq(detail.principal.kind, "user")
            test.eq(detail.principal.id, configurer)
            test.eq(detail.operator.kind, "user")
            test.eq(detail.operator.id, configurer)
        end)
    end)
end)}
