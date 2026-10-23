-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local cleanup=require("cleanup")
local owners={}
local sql = require("sql")
local uuid = require("uuid")
local json = require("json")
local drive = require("drive")
local slot = require("slot")
local jobs = require("jobs")
local repair = require("repair")
local types = require("types")
local jobs_config = require("jobs_config")
local process = require("process")
local channel = require("channel")
local time = require("time")
local function execute(db,statement,params)
    local result,err=db:execute(statement,params)
    if err then error(err) end
    return result
end
local function query(db,statement,params)
    local rows,err=db:query(statement,params)
    if err then error(err) end
    return rows
end
local function fixture(db,kind,job)
    local owner=uuid.v7()
    owners[#owners+1]=owner
    local tx=assert(db:begin())
    local _,err=drive.insert_tx(tx,{automation_id=owner,drive_key="main",source_kind=kind or "timer"})
    if err then error(err) end
    execute(tx,[[UPDATE kickside_automation_drive SET cursor='saved-cursor',event_seq=12,
        occurrence_seq=8,last_committed_occurrence_seq=7,command_generation=9,rewind_generation=3,
        wake_generation=6,wake_applied_generation=4,job_id=$1 WHERE automation_id=$2]],{job or uuid.v7(),owner})
    assert(tx:commit())
    return owner
end
local function snapshot(db,owner)
    return query(db,"SELECT * FROM kickside_automation_drive WHERE automation_id=$1",{owner})[1]
end
local function active_jobs(owner)
    local db=assert(sql.get(jobs_config.db_id()))
    local count=tonumber(query(db,[[SELECT COUNT(*) AS n FROM kickside_job
        WHERE owner_kind='automation' AND owner_id=$1 AND status IN ('pending','running')]],{owner})[1].n)
    db:release()
    return count
end
local function run(db,id) return repair({db=db,id=id}) end
local function unchanged(before,after)
    for key,value in pairs(before) do if key~="job_id" then test.eq(after[key],value,key) end end
end
local cases=test.run_cases(function()
    test.describe("stranded drive migration",function()
        test.it("notifies an already registered pool after repaired rows are committed",function()
            local db=assert(sql.get(types.db_id()))
            local owner=fixture(db)
            local wake=process.listen(jobs_config.WAKE_TOPIC,{message=true})
            local registered,register_err=process.registry.register(jobs_config.POOL_NAME,nil,process.registry.CONSISTENT)
            test.is_nil(register_err,tostring(register_err))
            test.is_true(registered)
            local ok,failure=pcall(function()
                local migration_id="app:drive-repair:"..uuid.v7()
                local result=run(db,migration_id)
                test.eq(result.status,"complete",tostring(result.error))
                local received=channel.select({wake:case_receive(),time.after("2s"):case_receive()})
                test.eq(received.channel,wake,"repair must notify the live pool without another enqueue")
                -- Read through a fresh connection, outside the migration transaction.
                local fresh=assert(sql.get(types.db_id()))
                local repaired=snapshot(fresh,owner)
                fresh:release()
                test.not_nil(repaired.job_id)
                test.eq(assert(jobs.get_job(repaired.job_id)).status,"pending")
                -- Canonical provisioning can emit more than one committed hint
                -- (dispatcher creation plus its explicit wake). Drain those
                -- before checking that an applied migration emits no new hint.
                while true do
                    local pending=channel.select({wake:case_receive(),time.after("20ms"):case_receive()})
                    if pending.channel~=wake then break end
                end
                test.eq(run(db,migration_id).status,"complete")
                local quiet=channel.select({wake:case_receive(),time.after("20ms"):case_receive()})
                test.is_true(quiet.channel~=wake,"an already-applied repair must not request another dispatcher round")
            end)
            process.registry.unregister(jobs_config.POOL_NAME,process.registry.CONSISTENT)
            process.unlisten(wake)
            db:release()
            if not ok then error(failure) end
        end)
        test.it("reprovisions missing and terminal references once and preserves durable progress",function()
            local db=assert(sql.get(types.db_id()))
            local missing=fixture(db)
            local terminal=fixture(db)
            local old=assert(slot.provision(terminal,"main"))
            assert(jobs.cancel(old))
            local healthy=fixture(db)
            local healthy_job=assert(slot.provision(healthy,"main"))
            local sourceless=fixture(db,"none")
            local before={}
            for _,owner in ipairs({missing,terminal,healthy,sourceless}) do before[owner]=snapshot(db,owner) end
            local id="app:drive-repair:"..uuid.v7()
            local result=run(db,id)
            test.eq(result.status,"complete",tostring(result.error))
            for _,owner in ipairs({missing,terminal}) do
                local after=snapshot(db,owner)
                test.is_true(after.job_id~=before[owner].job_id)
                test.eq(assert(jobs.get_job(after.job_id)).status,"pending")
                unchanged(before[owner],after)
            end
            test.eq(snapshot(db,healthy).job_id,healthy_job)
            test.eq(snapshot(db,sourceless).job_id,before[sourceless].job_id)
            for _,owner in ipairs({healthy,sourceless}) do unchanged(before[owner],snapshot(db,owner)) end
            local state={}
            for _,owner in ipairs({missing,terminal,healthy,sourceless}) do state[owner]=snapshot(db,owner).job_id end
            test.eq(run(db,id).status,"complete")
            test.eq(run(db,"app:drive-repair:"..uuid.v7()).status,"complete")
            for _,owner in ipairs({missing,terminal,healthy,sourceless}) do test.eq(snapshot(db,owner).job_id,state[owner]) end
            for _,owner in ipairs({missing,terminal,healthy}) do
                test.eq(active_jobs(owner),1)
            end
            db:release()
        end)
        test.it("preserves paused and deleting drives and leaves healthy running slots alone",function()
            local db=assert(sql.get(types.db_id()))
            local paused=fixture(db)
            execute(db,"UPDATE kickside_automation_drive SET enabled=false,phase='paused' WHERE automation_id=$1",{paused})
            local deleting=fixture(db)
            execute(db,"UPDATE kickside_automation_drive SET pending_command_id=$1 WHERE automation_id=$2",
                {"owner-delete:"..deleting,deleting})
            local running=fixture(db)
            local running_job=assert(slot.provision(running,"main"))
            local jobs_db=assert(sql.get(jobs_config.db_id()))
            execute(jobs_db,"UPDATE kickside_job SET status='running' WHERE id=$1",{running_job})
            jobs_db:release()
            local terminal={}
            for _,status in ipairs({"done","dead"}) do
                local owner=fixture(db)
                local job=assert(slot.provision(owner,"main"))
                jobs_db=assert(sql.get(jobs_config.db_id()))
                execute(jobs_db,"UPDATE kickside_job SET status=$1 WHERE id=$2",{status,job})
                jobs_db:release()
                terminal[#terminal+1]=owner
            end
            local owners={paused,deleting,running,terminal[1],terminal[2]}
            local before={}
            for _,owner in ipairs(owners) do before[owner]=snapshot(db,owner) end
            local result=run(db,"app:drive-repair:"..uuid.v7())
            test.eq(result.status,"complete",tostring(result.error))
            for _,owner in ipairs(owners) do unchanged(before[owner],snapshot(db,owner)) end
            test.eq(snapshot(db,deleting).job_id,before[deleting].job_id)
            test.eq(active_jobs(deleting),0)
            test.eq(snapshot(db,running).job_id,running_job)
            for _,owner in ipairs({paused,terminal[1],terminal[2]}) do
                test.is_true(snapshot(db,owner).job_id~=before[owner].job_id)
                test.eq(active_jobs(owner),1)
            end
            db:release()
        end)
        test.it("resumes after a committed page without creating duplicate slots",function()
            local db=assert(sql.get(types.db_id()))
            local owners={}
            for index=1,401 do owners[#owners+1]=fixture(db) end
            local id="app:drive-repair:"..uuid.v7()
            local begins=0
            local adapter={
                type=function() return db:type() end,
                query=function(_,statement,params) return db:query(statement,params) end,
                execute=function(_,statement,params) return db:execute(statement,params) end,
                begin=function(_,options)
                    begins=begins+1
                    if begins==3 then return nil,errors.new({kind=errors.UNAVAILABLE,message="simulated interruption"}) end
                    return db:begin(options)
                end,
            }
            test.eq(run(adapter,id).status,"error")
            test.eq(#query(db,"SELECT id FROM _migrations WHERE id=$1",{id}),0)
            test.eq(#query(db,"SELECT cursor FROM _migration_progress WHERE id=$1",{id}),1)
            test.eq(run(db,id).status,"complete")
            test.eq(#query(db,"SELECT cursor FROM _migration_progress WHERE id=$1",{id}),0)
            local ids={}
            for _,owner in ipairs(owners) do
                local job=snapshot(db,owner).job_id
                test.eq(assert(jobs.get_job(job)).status,"pending")
                ids[owner]=job
                test.eq(active_jobs(owner),1)
            end
            test.eq(run(db,id).status,"complete")
            for _,owner in ipairs(owners) do test.eq(snapshot(db,owner).job_id,ids[owner]) end
            db:release()
        end)
    end)
end)

return function(options)
    local ok,result=pcall(cases,options)
    cleanup(owners)
    if not ok then error(result) end
    return result
end
