local command = require("command")
local factory = require("factory")
local worker = require("worker")
local worker_completion = require("worker_completion")
local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local registry = require("registry")
local drive = require("drive")
local slot = require("slot")
local jobs = require("jobs")
local lifecycle = require("lifecycle")
local completion = require("completion")
local cancel = require("cancel")
local retention = require("retention")
local purge = require("slot_purge")
local owner_gc = require("owner_gc")
local teardown = require("thread_teardown")
local reclaim = require("reclaim")

local function db()
    local opened, err = sql.get("app:db")
    if err or not opened then error(tostring(err)) end
    return opened
end
local function exec(opened, statement, args)
    local result, err = opened:execute(statement, args or {})
    if err then error(tostring(err)) end
    return result
end
local function query(opened, statement, args)
    local rows, err = opened:query(statement, args or {})
    if err then error(tostring(err)) end
    return rows
end
local function new_slot(kind)
    local owner = uuid.v7()
    local opened = db()
    local tx = assert(opened:begin())
    local _, err = drive.insert_tx(tx, { automation_id = owner, drive_key = "main", phase = "active", source_kind = kind or "timer",
        cursor = "retained", event_seq = 17 })
    if err then tx:rollback(); opened:release(); error(tostring(err)) end
    tx:commit()
    opened:release()
    local id, provision_err = slot.provision(owner, "main")
    if provision_err then error(tostring(provision_err)) end
    return owner, id
end
local function state(owner, id)
    local opened = db()
    local d, err = drive.get(opened, owner, "main")
    if err then error(tostring(err)) end
    local j = query(opened, "SELECT * FROM kickside_job WHERE id=$1", {id})[1]
    opened:release()
    return d, j
end
local function running(id, attempts)
    local opened = db()
    local token = uuid.v7()
    exec(opened, [[UPDATE kickside_job SET status='running', lease_token=$1, execution_seq=1,
        attempts=$2,max_attempts=1,lease_until=$3 WHERE id=$4]], {token, attempts or 1, lifecycle.future_string(tostring(opened:type()), 60),id})
    local j = query(opened, "SELECT * FROM kickside_job WHERE id=$1", {id})[1]
    opened:release()
    return j
end
local function active(owner, id)
    local d, j = state(owner,id)
    test.not_nil(d)
    test.eq(d.job_id,id)
    test.not_nil(j, "drive must not retain a deleted slot")
    if j then test.is_true(j.status == "pending" or j.status == "running", "drive must not retain a terminal slot: " .. tostring(j.status)) end
end
local function fault_record(owner, fn)
    local opened = db()
    local dialect = tostring(opened:type())
    if dialect == sql.type.POSTGRES then
        exec(opened, [[CREATE FUNCTION reject_slot_record() RETURNS trigger LANGUAGE plpgsql AS $$
            BEGIN IF NEW.automation_id::text = ']] .. owner .. [[' THEN RAISE EXCEPTION 'slot record refused'; END IF; RETURN NEW; END $$]])
        exec(opened, [[CREATE TRIGGER reject_slot_record BEFORE UPDATE OF job_id ON kickside_automation_drive
            FOR EACH ROW EXECUTE FUNCTION reject_slot_record()]])
    else
        exec(opened, [[CREATE TRIGGER reject_slot_record BEFORE UPDATE OF job_id ON kickside_automation_drive
            WHEN NEW.automation_id=']] .. owner .. [[' BEGIN SELECT RAISE(ABORT,'slot record refused'); END]])
    end
    opened:release()
    local ok, err = pcall(fn)
    opened = db()
    exec(opened, "DROP TRIGGER reject_slot_record" .. (dialect == sql.type.POSTGRES and " ON kickside_automation_drive" or ""))
    if dialect == sql.type.POSTGRES then exec(opened, "DROP FUNCTION reject_slot_record()") end
    opened:release()
    if not ok then error(err) end
end

return test.run_cases(function()
    test.describe("slot lifetime", function()
        for _, mode in ipairs({"quiet", "rearm", "parked", "wake"}) do
            test.it("public completion keeps the referenced slot active: " .. mode, function()
                local owner,id = new_slot()
                local j = running(id)
                local opened = db()
                local opts = {}
                if mode == "rearm" then opts.rearm = lifecycle.future_string(tostring(opened:type()), 60) end
                if mode == "parked" then opts.record = {status="parked",error="configuration refused"} end
                if mode == "wake" then
                    local answer,err=jobs.wake_job(id,{control=true})
                    test.is_nil(err,tostring(err));test.is_true(answer.woken)
                end
                local tx = assert(opened:begin())
                local result,err=completion.complete_tx(tx,id,{token=j.lease_token,execution_seq=1},opts)
                if err then tx:rollback() else tx:commit() end
                opened:release()
                test.is_nil(err,tostring(err));test.not_nil(result)
                active(owner,id)
            end)
        end
        for _, mode in ipairs({"deterministic", "infrastructure"}) do
            test.it("failure beyond max_attempts keeps the referenced slot active: " .. mode, function()
                local owner,id=new_slot()
                local j=running(id,12)
                local opened=db()
                local err=lifecycle.fail_job(opened,j,tostring(opened:type()),"execution refused",mode)
                opened:release()
                test.is_nil(err,tostring(err));active(owner,id)
                local _,row=state(owner,id)
                test.eq(row.last_error,"execution refused")
                if mode=="deterministic" then test.is_nil(row.scheduled_at) else test.not_nil(row.scheduled_at) end
            end)
        end
        test.it("expired lease reclaim returns the referenced slot to pending",function()
            local owner,id=new_slot();running(id)
            local opened=db()
            exec(opened,"UPDATE kickside_job SET lease_until=$1 WHERE id=$2",{ "2000-01-01T00:00:00Z",id })
            local n,err=reclaim.reclaim_expired(opened,tostring(opened:type()),1)
            opened:release()
            test.is_nil(err,tostring(err));test.eq(n,1);active(owner,id)
        end)
        test.it("retention excludes pending and parked slots",function()
            local owner,id=new_slot()
            local opened=db()
            exec(opened,"UPDATE kickside_job SET scheduled_at=NULL,finished_at=$1 WHERE id=$2",{"2000-01-01T00:00:00Z",id})
            local n,err=retention.prune_jobs(opened,nil,"2100-01-01T00:00:00Z",100,true)
            opened:release()
            test.is_nil(err,tostring(err));active(owner,id)
        end)
        test.it("explicit low-level terminal completion can close a slot",function()
            local owner,id=new_slot();local j=running(id)
            local opened=db()
            local err=lifecycle.complete_job(opened,j,tostring(opened:type()),{terminal=true})
            opened:release()
            test.is_nil(err,tostring(err))
            local d,row=state(owner,id);test.eq(row.status,"done");test.eq(d.job_id,id)
        end)
        test.it("pending cancellation closes the slot while its drive keeps its reference",function()
            local owner,id=new_slot()
            local result,err=jobs.cancel(id)
            test.is_nil(err,tostring(err));test.is_true(result.canceled)
            local d,row=state(owner,id);test.eq(row.status,"cancelled");test.eq(d.job_id,id)
        end)
        test.it("running cancellation settles terminal while its drive keeps its reference",function()
            local owner,id=new_slot();local j=running(id)
            local opened=db()
            local changed,err,revoked=cancel.cancel_job(opened,tostring(opened:type()),{id=id,expected_lease_token=j.lease_token})
            test.is_nil(err,tostring(err));test.is_true(changed);test.eq(#revoked,1)
            local done,finish_err=cancel.finish_cancellation(opened,tostring(opened:type()),{id=id,token=j.lease_token,execution_seq=1,reason="cancelled"})
            opened:release()
            test.is_nil(finish_err,tostring(finish_err));test.is_true(done)
            local d,row=state(owner,id);test.eq(row.status,"cancelled");test.eq(d.job_id,id)
        end)
        test.it("retention removes terminal slots without changing their drive",function()
            local owner,id=new_slot();test.is_nil(select(2,jobs.cancel(id)))
            local opened=db()
            exec(opened,"UPDATE kickside_job SET finished_at=$1 WHERE id=$2",{"2000-01-01T00:00:00Z",id})
            local n,err=retention.prune_jobs(opened,nil,"2001-01-01T00:00:00Z",100,true)
            opened:release()
            test.is_nil(err,tostring(err));test.is_true(n>=1)
            local d,row=state(owner,id);test.is_nil(row);test.eq(d.job_id,id)
        end)
        test.it("sourceless provisioning cancels then sequential reprovisioning replaces the slot",function()
            local owner,id=new_slot()
            local opened=db();exec(opened,"UPDATE kickside_automation_drive SET source_kind='none' WHERE automation_id=$1",{owner});opened:release()
            local none,err=slot.provision(owner,"main");test.is_nil(err,tostring(err));test.is_nil(none)
            local d,row=state(owner,id);test.eq(row.status,"cancelled");test.eq(d.job_id,id)
            opened=db();exec(opened,"UPDATE kickside_automation_drive SET source_kind='timer' WHERE automation_id=$1",{owner});opened:release()
            local fresh,replace_err=slot.provision(owner,"main");test.is_nil(replace_err,tostring(replace_err));test.is_true(fresh~=id)
            active(owner,fresh)
            local after=state(owner,fresh);test.eq(after.event_seq,17);test.eq(after.cursor,"retained")
        end)
        test.it("owner deletion removes the slot and its drive",function()
            local owner,id=new_slot()
            local result,err=owner_gc.delete(owner)
            test.is_nil(err,tostring(err));test.not_nil(result)
            local d,row=state(owner,id);test.is_nil(d);test.is_nil(row)
        end)
        test.it("missing worker target parks a referenced slot instead of making it dead",function()
            local owner,id=new_slot();local j=running(id)
            j.worker_ref="app:absent_worker"
            local opened=db()
            local result,dispatch_err=worker.execute_job(opened,tostring(opened:type()),j)
            test.is_nil(result);test.not_nil(dispatch_err)
            local failure_class=worker_completion.failure_class_for(dispatch_err)
            test.eq(failure_class,"deterministic")
            local fail_err=lifecycle.fail_job(opened,j,tostring(opened:type()),tostring(dispatch_err),failure_class)
            opened:release()
            test.is_nil(fail_err,tostring(fail_err));active(owner,id)
        end)
        test.it("thread cleanup detaches an automation-owned slot instead of deleting it",function()
            local owner,id=new_slot()
            local opened=db();local thread_id=uuid.v7()
            exec(opened,"INSERT INTO kickside_thread (id,thread_class,component_id) VALUES ($1,'test',$2)",{thread_id,thread_id})
            exec(opened,"UPDATE kickside_job SET thread_id=$1 WHERE id=$2",{thread_id,id})
            local page,err=teardown.page(opened,tostring(opened:type()),thread_id,0)
            opened:release()
            test.is_nil(err,tostring(err));test.not_nil(page);active(owner,id)
            local _,row=state(owner,id);test.is_nil(row.thread_id)
        end)
        test.it("direct owner purge can delete a referenced pending slot",function()
            local owner,id=new_slot()
            local removed,err=purge.purge_slot({namespace="drive",scope=owner,key="main"})
            test.is_nil(err,tostring(err));test.eq(removed,1)
            local d,row=state(owner,id);test.not_nil(d);test.eq(d.job_id,id);test.is_nil(row)
        end)
        test.it("source reconfigure must retain durable provisioning work after finalization",function()
            local owner,id=new_slot()
            local opened=db();exec(opened,"UPDATE kickside_automation_drive SET source_kind='none' WHERE automation_id=$1",{owner});opened:release()
            local _,none_err=slot.provision(owner,"main");test.is_nil(none_err,tostring(none_err))
            opened=db();local tx=assert(opened:begin())
            local reserved,reserve_err=command.reserve_tx(tx,{automation_id=owner,request_id="source-update",digest="new-source",kind="reconfigure",
                input={declaration={},drive_policy={},writer="app:source_writer",writer_args={},
                    source_update={changed=true,source_kind="timer",start_seq=0,action={schedule={type="interval",expression="1h"}}}},
                drive_keys={"main"},next_attempt_at="2000-01-01T00:00:00Z"})
            if reserve_err then tx:rollback() else tx:commit() end
            opened:release();test.is_nil(reserve_err,tostring(reserve_err));test.not_nil(reserved)
            local interrupted=errors.new({kind=errors.UNAVAILABLE,message="provision interrupted"})
            local engine=factory.new({funcs={new=function() return {with_context=function(self) return self end,call=function() return {success=true},nil end},nil end},
                slot={provision=function() return nil,interrupted end,wake_dispatcher=function() return {woken=true},nil end}})
            local result,reconfigure_err=engine.recover_command(owner)
            test.is_nil(result);test.not_nil(reconfigure_err)
            opened=db()
            local pending,pending_err=command.pending(opened,owner)
            local missing,missing_err=drive.missing_slots(opened,100000)
            opened:release();test.is_nil(pending_err,tostring(pending_err));test.is_nil(missing_err,tostring(missing_err))
            local selected=false
            for _,row in ipairs(missing) do if row.automation_id==owner then selected=true end end
            local d,j=state(owner,id);test.eq(d.source_kind,"timer");test.eq(j.status,"cancelled")
            test.is_true(pending~=nil or selected,"finalization drops all durable provisioning work while the sourced drive retains a cancelled slot")
        end)
        test.it("registry version changes preserve the job row and its drive reference",function()
            local owner,id=new_slot()
            local original=assert(registry.current_version())
            local changes=assert(registry.snapshot()):changes()
            changes:create({id="app:slot_lifetime_version",kind="registry.entry",meta={generation=1},data={}})
            local applied,apply_err=changes:apply()
            local d,j=state(owner,id)
            local restored,restore_err=registry.apply_version(original)
            test.is_nil(apply_err,tostring(apply_err));test.is_nil(restore_err,tostring(restore_err))
            test.not_nil(j);test.eq(j.status,"pending");test.eq(d.job_id,id);active(owner,id)
        end)
        test.it("dispatcher must not acknowledge a wake refused by an inactive slot",function()
            local owner,id=new_slot()
            test.is_nil(select(2,jobs.cancel(id)))
            local opened=db()
            exec(opened,"UPDATE kickside_automation_drive SET wake_generation=2,wake_applied_generation=0 WHERE automation_id=$1",{owner})
            opened:release()
            local engine=factory.new({slot={wake=slot.wake,provision=slot.provision,wake_dispatcher=slot.wake_dispatcher}})
            local pass,err=engine.dispatch({limit=1000})
            test.is_nil(err,tostring(err));test.not_nil(pass)
            local d=state(owner,id)
            test.is_true(d.wake_generation>d.wake_applied_generation,"refused wake loses its durable demand")
        end)
        test.it("missing-slot selection must include a sourced drive with a terminal slot",function()
            local owner,id=new_slot()
            test.is_nil(select(2,jobs.cancel(id)))
            local opened=db();local missing,err=drive.missing_slots(opened,100000);opened:release()
            test.is_nil(err,tostring(err))
            local selected=false
            for _,row in ipairs(missing) do if row.automation_id==owner then selected=true end end
            test.is_true(selected,"non-null terminal reference excludes the drive from missing-slot work")
        end)
        test.it("failed record of an existing slot must not purge the referenced job",function()
            local owner,id=new_slot()
            local answer,err
            fault_record(owner,function() answer,err=slot.provision(owner,"main") end)
            test.is_nil(answer);test.not_nil(err);test.contains(tostring(err),"slot record refused")
            active(owner,id)
        end)
        test.it("stale sourceless provisioning must not cancel a newly sourced drive",function()
            local owner,id=new_slot()
            local opened=db();exec(opened,"UPDATE kickside_automation_drive SET source_kind='none' WHERE automation_id=$1",{owner});opened:release()
            local original=jobs.cancel
            local nested_id,nested_err
            jobs.cancel=function(job_id,token)
                jobs.cancel=original
                local inner=db();exec(inner,"UPDATE kickside_automation_drive SET source_kind='timer' WHERE automation_id=$1",{owner});inner:release()
                nested_id,nested_err=slot.provision(owner,"main")
                return original(job_id,token)
            end
            local ok,result,err=pcall(slot.provision,owner,"main")
            jobs.cancel=original
            test.is_true(ok,tostring(result));test.is_nil(err,tostring(err));test.is_nil(nested_err,tostring(nested_err));test.eq(nested_id,id)
            active(owner,id)
        end)
    end)
end)
