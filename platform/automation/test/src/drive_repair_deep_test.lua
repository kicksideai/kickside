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
local claim = require("claim")

local function query(db, statement, params)
    local rows, err = db:query(statement, params)
    assert(not err, tostring(err))
    return rows
end
local function execute(db, statement, params)
    local result, err = db:execute(statement, params)
    assert(not err, tostring(err))
    return result
end
local function fixture(db, owner, key, kind)
    owners[#owners+1]=owner
    local tx = assert(db:begin())
    local _, err = drive.insert_tx(tx, {automation_id=owner,drive_key=key,source_kind=kind or "timer",source_thread_id=kind=="event" and uuid.v7() or nil})
    assert(not err, tostring(err))
    execute(tx,"UPDATE kickside_automation_drive SET job_id=$1,cursor='saved',event_seq=17 WHERE automation_id=$2 AND drive_key=$3",
        {uuid.v7(),owner,key})
    assert(tx:commit())
end
local function snapshot(db, owner, key)
    return query(db,"SELECT * FROM kickside_automation_drive WHERE automation_id=$1 AND drive_key=$2",{owner,key})[1]
end
local function unchanged(a,b)
    for k,v in pairs(a) do if k~="job_id" then test.eq(b[k],v,k) end end
end
local function active(owner)
    local db=assert(sql.get(jobs_config.db_id()))
    local rows=query(db,"SELECT id FROM kickside_job WHERE owner_id=$1 AND status IN ('pending','running')",{owner})
    db:release()
    return rows
end

local cases=test.run_cases(function()
    test.describe("deeper stranded-drive recovery",function()
        test.it("replays a partially repaired page without losing progress or duplicating canonical jobs",function()
            local db=assert(sql.get(types.db_id()))
            local owner="0000:"..uuid.v7()
            local before={}
            for _,key in ipairs({"a","b","c"}) do fixture(db,owner,key);before[key]=snapshot(db,owner,key) end
            local id="app:deep-repair:"..uuid.v7()
            local dialect=db:type()
            if dialect==sql.type.SQLITE then
                execute(db,"CREATE TRIGGER deep_fail_record BEFORE UPDATE OF job_id ON kickside_automation_drive "
                    .."WHEN NEW.automation_id='"..owner.."' AND NEW.drive_key='b' "
                    .."BEGIN SELECT RAISE(ABORT,'injected in-page attachment failure'); END")
            else
                execute(db,[[CREATE FUNCTION deep_fail_record_fn() RETURNS trigger LANGUAGE plpgsql AS $$
                    BEGIN RAISE EXCEPTION 'injected in-page attachment failure'; END; $$]])
                execute(db,"CREATE TRIGGER deep_fail_record BEFORE UPDATE OF job_id ON kickside_automation_drive "
                    .."FOR EACH ROW WHEN (NEW.automation_id='"..owner.."' AND NEW.drive_key='b') EXECUTE FUNCTION deep_fail_record_fn()")
            end
            local result=repair({db=db,id=id})
            if dialect==sql.type.SQLITE then execute(db,"DROP TRIGGER deep_fail_record")
            else
                execute(db,"DROP TRIGGER deep_fail_record ON kickside_automation_drive")
                execute(db,"DROP FUNCTION deep_fail_record_fn()")
            end
            test.eq(result.status,"error")
            test.is_true(tostring(result.error):find("injected in-page attachment failure",1,true)~=nil,tostring(result.error))
            test.eq(#query(db,"SELECT id FROM _migrations WHERE id=$1",{id}),0)
            test.eq(#query(db,"SELECT id FROM _migration_progress WHERE id=$1",{id}),0)
            for _,key in ipairs({"a","b","c"}) do
                local after=snapshot(db,owner,key)
                if key~="a" then test.eq(after.job_id,before[key].job_id) end
                unchanged(before[key],after)
            end
            local shared=jobs_config.db_id()==types.db_id()
            local captured=active(owner)
            test.eq(#captured,2)
            result=repair({db=db,id=id})
            test.eq(result.status,"complete",tostring(result.error))
            local repaired=active(owner)
            test.eq(#repaired,3)
            for _,prior in ipairs(captured) do
                local retained=false
                for _,job in ipairs(repaired) do if job.id==prior.id then retained=true end end
                test.is_true(retained,"split-store committed job id must survive retry")
            end
            for _,key in ipairs({"a","b","c"}) do
                local after=snapshot(db,owner,key)
                unchanged(before[key],after)
                test.eq(assert(jobs.get_job(after.job_id)).status,"pending")

            end
            db:release()
        end)
        test.it("reattaches an existing event slot and retains its source wake key",function()
            local db=assert(sql.get(types.db_id()))
            local owner,thread=uuid.v7(),uuid.v7()
            fixture(db,owner,"events","event")
            execute(db,"UPDATE kickside_automation_drive SET source_thread_id=$1 WHERE automation_id=$2",{thread,owner})
            local canonical=assert(slot.provision(owner,"events"))
            execute(db,"UPDATE kickside_automation_drive SET job_id=NULL WHERE automation_id=$1",{owner})
            local before=snapshot(db,owner,"events")
            local result=repair({db=db,id="app:deep-repair:"..uuid.v7()})
            test.eq(result.status,"complete",tostring(result.error))
            local after=snapshot(db,owner,"events")
            test.eq(after.job_id,canonical)
            unchanged(before,after)
            test.eq(#active(owner),1)
            local jdb=assert(sql.get(jobs_config.db_id()))
            test.eq(query(jdb,"SELECT wake_key FROM kickside_job WHERE id=$1",{canonical})[1].wake_key,drive.wake_key(thread))
            jdb:release()
            db:release()
        end)
        test.it("keeps repaired paused drives parked when the round tries to claim them",function()
            local db=assert(sql.get(types.db_id()))
            local owner="0000:"..uuid.v7()
            fixture(db,owner,"paused")
            execute(db,"UPDATE kickside_automation_drive SET enabled=false,phase='paused' WHERE automation_id=$1",{owner})
            local result=repair({db=db,id="app:deep-repair:"..uuid.v7()})
            test.eq(result.status,"complete",tostring(result.error))
            local tx=assert(db:begin())
            local stamped,err=claim.stamp_tx(tx,owner,"paused",{token=uuid.v7()},drive.utc_now())
            test.is_nil(err,tostring(err))
            test.eq(stamped.state,claim.STATE.PARKED)
            assert(tx:rollback())
            db:release()
        end)
        test.it("resumes a checkpoint in the middle of one automation's drive keys",function()
            local db=assert(sql.get(types.db_id()))
            local owner="0000:"..uuid.v7()
            for i=1,205 do fixture(db,owner,string.format("key-%03d",i)) end
            local id="app:deep-repair:"..uuid.v7()
            local begins=0
            local adapter={
                type=function() return db:type() end,
                query=function(_,s,p) return db:query(s,p) end,
                execute=function(_,s,p) return db:execute(s,p) end,
                begin=function(_,options)
                    begins=begins+1
                    if begins==3 then return nil,errors.new({kind=errors.UNAVAILABLE,message="between-page failure"}) end
                    return db:begin(options)
                end,
            }
            test.eq(repair({db=adapter,id=id}).status,"error")
            local progress=query(db,"SELECT cursor FROM _migration_progress WHERE id=$1",{id})
            test.eq(#progress,1)
            test.eq(assert(json.decode(progress[1].cursor))[1],owner)
            local result=repair({db=db,id=id})
            test.eq(result.status,"complete",tostring(result.error))
            test.eq(#active(owner),205)
            for i=1,205 do
                local after=snapshot(db,owner,string.format("key-%03d",i))
                test.eq(assert(jobs.get_job(after.job_id)).status,"pending")
                test.eq(after.cursor,"saved")
                test.eq(tonumber(after.event_seq),17)
            end
            test.eq(#query(db,"SELECT id FROM _migration_progress WHERE id=$1",{id}),0)
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
