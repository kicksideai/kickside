-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test=require("test")
local cleanup=require("cleanup")
local owners={}
local sql=require("sql")
local uuid=require("uuid")
local channel=require("channel")
local time=require("time")
local drive=require("drive")
local jobs=require("jobs")
local repair=require("repair")
local boundary=require("boundary")
local types=require("types")
local jobs_config=require("jobs_config")

local function execute(db,s,p)
    local value,err=db:execute(s,p)
    assert(not err,tostring(err))
    return value
end
local function query(db,s,p)
    local value,err=db:query(s,p)
    assert(not err,tostring(err))
    return value
end
local function fixture(db,kind)
    local owner=uuid.v7()
            owners[#owners+1]=owner
    local tx=assert(db:begin())
    local _,err=drive.insert_tx(tx,{automation_id=owner,drive_key="main",source_kind=kind or "timer",
        source_thread_id=kind=="event" and uuid.v7() or nil})
    assert(not err,tostring(err))
    assert(tx:commit())
    return owner
end
local function active(owner)
    local db=assert(sql.get(jobs_config.db_id()))
    local rows=query(db,"SELECT id,wake_key FROM kickside_job WHERE owner_id=$1 AND status IN ('pending','running')",{owner})
    db:release()
    return rows
end
local function adapter(db,begin)
    return {type=function() return db:type() end,query=function(_,s,p) return db:query(s,p) end,
        execute=function(_,s,p) return db:execute(s,p) end,begin=begin}
end
local function migration(db,id) return repair({db=db,id=id}) end
local function not_complete(db,id) test.eq(#query(db,"SELECT id FROM _migrations WHERE id=$1",{id}),0) end

local cases=test.run_cases(function()
    test.describe("stranded-drive repair races and commit boundaries",function()
        test.it("replays transient SQLite writer contention from a fresh transaction",function()
            local db=assert(sql.get(types.db_id()))
            local owner=fixture(db)
            local begins=0
            local contended=adapter(db,function(_,options)
                begins=begins+1
                if begins<=2 then return nil,errors.new({kind=errors.UNAVAILABLE,message="database is locked"}) end
                return db:begin(options)
            end)
            local result=migration(contended,"app:repair-contention:"..uuid.v7())
            if db:type()==sql.type.SQLITE then
                test.eq(result.status,"complete",tostring(result.error))
                test.eq(begins,4)
                test.eq(#active(owner),1)
            else
                test.eq(result.status,"error")
                test.eq(begins,1)
            end
            db:release()
        end)
        test.it("bounds SQLite contention retries without completing the migration",function()
            local db=assert(sql.get(types.db_id()))
            local begins=0
            local blocked=adapter(db,function()
                begins=begins+1
                return nil,errors.new({kind=errors.UNAVAILABLE,message="database table is locked"})
            end)
            local id="app:repair-contention:"..uuid.v7()
            test.eq(migration(blocked,id).status,"error")
            test.eq(begins,db:type()==sql.type.SQLITE and 5 or 1)
            not_complete(db,id)
            db:release()
        end)
        test.it("converges two concurrent runners on one checkpoint and one slot per drive",function()
            local db=assert(sql.get(types.db_id()))
            local owner=uuid.v7()
            owners[#owners+1]=owner
            local tx=assert(db:begin())
            for i=1,40 do
                local _,err=drive.insert_tx(tx,{automation_id=owner,drive_key=tostring(i),source_kind="timer"})
                assert(not err,tostring(err))
            end
            assert(tx:commit())
            local id="app:repair-concurrent:"..uuid.v7()
            local done=channel.new(2)
            for _=1,2 do
                coroutine.spawn(function()
                    local ok,result=pcall(repair,{database_id=types.db_id(),id=id})
                    done:send({ok=ok,result=result})
                end)
            end
            local deadline=time.after("120s")
            for _=1,2 do
                local selected=channel.select({done:case_receive(),deadline:case_receive()})
                test.eq(selected.channel,done,"concurrent repairs must terminate")
                test.is_true(selected.value.ok,tostring(selected.value.result))
                test.eq(selected.value.result.status,"complete",tostring(selected.value.result.error))
            end
            test.eq(#active(owner),40)
            test.eq(#query(db,"SELECT id FROM _migrations WHERE id=$1",{id}),1)
            test.eq(#query(db,"SELECT id FROM _migration_progress WHERE id=$1",{id}),0)
            db:release()
        end)
        test.it("converges on a source move between enqueue and validation",function()
            local db=assert(sql.get(types.db_id()))
            local owner=fixture(db,"event")
            local thread=uuid.v7()
            boundary.after=function(id)
                if id~=owner then return end
                boundary.after=nil
                execute(db,"UPDATE kickside_automation_drive SET source_thread_id=$1,revision=revision+1 WHERE automation_id=$2",{thread,owner})
            end
            local result=migration(db,"app:repair-race:"..uuid.v7())
            boundary.after=nil
            test.eq(result.status,"complete",tostring(result.error))
            local rows=active(owner)
            test.eq(#rows,1)
            test.eq(rows[1].wake_key,drive.wake_key(thread))
            db:release()
        end)
        test.it("leaves a durable repair mark after bounded source churn and reuses its job on retry",function()
            local db=assert(sql.get(types.db_id()))
            local owner=fixture(db,"event")
            local calls=0
            boundary.after=function(id)
                if id~=owner then return end
                calls=calls+1
                execute(db,"UPDATE kickside_automation_drive SET source_thread_id=$1,revision=revision+1 WHERE automation_id=$2",{uuid.v7(),owner})
            end
            local id="app:repair-race:"..uuid.v7()
            local result=migration(db,id)
            boundary.after=nil
            test.eq(result.status,"error")
            test.eq(calls,3)
            not_complete(db,id)
            local row=assert(drive.get(db,owner,"main"))
            test.is_nil(row.job_id)
            local first=active(owner)
            test.eq(#first,1)
            result=migration(db,id)
            test.eq(result.status,"complete",tostring(result.error))
            test.eq(assert(drive.get(db,owner,"main")).job_id,first[1].id)
            test.eq(active(owner)[1].wake_key,drive.wake_key(row.source_thread_id))
            db:release()
        end)
        test.it("respects owner deletion racing the provisioning fence",function()
            local db=assert(sql.get(types.db_id()))
            local owner=fixture(db)
            boundary.before=function(id)
                if id~=owner then return end
                boundary.before=nil
                execute(db,"UPDATE kickside_automation_drive SET pending_command_id=$1 WHERE automation_id=$2",{"owner-delete:"..owner,owner})
            end
            local result=migration(db,"app:repair-race:"..uuid.v7())
            boundary.before=nil
            test.eq(result.status,"complete",tostring(result.error))
            test.eq(#active(owner),0)
            test.is_nil(assert(drive.get(db,owner,"main")).job_id)
            db:release()
        end)
        for _, remove_at in ipairs({1,3}) do
            test.it("cancels a repaired slot when its source is removed on attempt "..remove_at,function()
                local db=assert(sql.get(types.db_id()))
                local owner=fixture(db,"event")
                local calls=0
                boundary.after=function(id)
                    if id~=owner then return end
                    calls=calls+1
                    if calls==remove_at then
                        boundary.after=nil
                        execute(db,"UPDATE kickside_automation_drive SET source_kind='none',revision=revision+1 WHERE automation_id=$1",{owner})
                    else
                        execute(db,"UPDATE kickside_automation_drive SET source_thread_id=$1,revision=revision+1 WHERE automation_id=$2",{uuid.v7(),owner})
                    end
                end
                local result=migration(db,"app:repair-race:"..uuid.v7())
                boundary.after=nil
                test.eq(result.status,"complete",tostring(result.error))
                test.eq(calls,remove_at)
                test.eq(#active(owner),0)
                db:release()
            end)
        end
        test.it("does not complete before dispatcher wake succeeds",function()
            local db=assert(sql.get(types.db_id()))
            local owner=fixture(db)
            local id="app:repair-race:"..uuid.v7()
            boundary.fail_wake=true
            local result=migration(db,id)
            boundary.fail_wake=false
            test.eq(result.status,"error")
            not_complete(db,id)
            local first=active(owner)
            test.eq(#first,1)
            result=migration(db,id)
            test.eq(result.status,"complete",tostring(result.error))
            test.eq(active(owner)[1].id,first[1].id)
            db:release()
        end)
        test.it("replays already attached slots after checkpoint transaction failure",function()
            local db=assert(sql.get(types.db_id()))
            local owner=fixture(db)
            local attached=false
            boundary.after=function(id) if id==owner then attached=true end end
            local broken=adapter(db,function(_,options)
                if attached then return nil,errors.new({kind=errors.UNAVAILABLE,message="injected checkpoint failure"}) end
                return db:begin(options)
            end)
            local id="app:repair-race:"..uuid.v7()
            local result=migration(broken,id)
            boundary.after=nil
            test.eq(result.status,"error")
            not_complete(db,id)
            local first=active(owner)
            test.eq(#first,1)
            result=migration(db,id)
            test.eq(result.status,"complete",tostring(result.error))
            test.eq(active(owner)[1].id,first[1].id)
            db:release()
        end)
        test.it("does not rewind a checkpoint advanced by an interleaved runner",function()
            local db=assert(sql.get(types.db_id()))
            local owner=uuid.v7()
            owners[#owners+1]=owner
            local tx=assert(db:begin())
            for i=1,405 do
                local _,err=drive.insert_tx(tx,{automation_id=owner,drive_key=string.format("key-%03d",i),source_kind="timer"})
                assert(not err,tostring(err))
            end
            assert(tx:commit())
            local id="app:repair-race:"..uuid.v7()
            local outer_begins,peer_begins=0,0
            local peer_cursor
            local outer=adapter(db,function(_,options)
                outer_begins=outer_begins+1
                if outer_begins==2 then
                    local peer=adapter(db,function(_,peer_options)
                        peer_begins=peer_begins+1
                        if peer_begins==5 then return nil,errors.new({kind=errors.UNAVAILABLE,message="peer interruption"}) end
                        return db:begin(peer_options)
                    end)
                    test.eq(migration(peer,id).status,"error")
                    peer_cursor=query(db,"SELECT cursor FROM _migration_progress WHERE id=$1",{id})[1].cursor
                elseif outer_begins==3 then
                    test.eq(query(db,"SELECT cursor FROM _migration_progress WHERE id=$1",{id})[1].cursor,peer_cursor)
                end
                return db:begin(options)
            end)
            local result=migration(outer,id)
            test.eq(result.status,"complete",tostring(result.error))
            test.eq(#active(owner),405)
            test.eq(#query(db,"SELECT id FROM _migrations WHERE id=$1",{id}),1)
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
