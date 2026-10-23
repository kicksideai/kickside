-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test=require("test")
local sql=require("sql")
local uuid=require("uuid")
local json=require("json")
local channel=require("channel")
local time=require("time")
local writer=require("writer")
local apply=require("apply")
local claim=require("claim")
local jobs=require("jobs")
local clock=require("clock")

local function checked(value: any, err: any): any
    if err then error(err) end
    return value
end

return test.run_cases(function()
    test.describe("concurrent projection output completion",function()
        test.it("completes two real projections with shared outputs in opposite request order",function()
            local db=assert(sql.get("app:db"))
            local dialect=checked(db:type())
            local output_ids,registered,all_jobs={},{},{}
            for i=1,4 do
                local id=uuid.v7()
                local head=i<3 and 1 or 0
                checked(db:execute("INSERT INTO kickside_thread (id,thread_class,component_id,event_count) VALUES ($1,'test',$2,$3)",{id,id,head}))
                if head==1 then
                    checked(db:execute("INSERT INTO kickside_event (id,thread_id,type,role,body,seq) VALUES ($1,$2,'fixture:input','system','{}',1)",{uuid.v7(),id}))
                else output_ids[#output_ids+1]=id end
                local row=checked(writer.register_projection(db,id,{kind="concurrent-output",worker_ref="func://app:test_count_worker",system_identity=true}))
                all_jobs[#all_jobs+1]=row.job_id
                if head==1 then registered[#registered+1]=row end
            end
            local start,done=channel.new(2),channel.new(2)
            for index,row in ipairs(registered) do
                -- Lease only this fixture's row through the Jobs-owned primitive;
                -- a shared-queue claim could consume another suite's work.
                local tx=assert(db:begin())
                local token=uuid.v7()
                local leased,lease_err=claim.lease_row(tx,dialect,row.job_id,token,
                    clock.format(time.now():add("1m"),dialect),clock.now(dialect))
                if lease_err or not leased then tx:rollback();error(lease_err or "fixture job is not pending") end
                checked(tx:commit())
                local job={id=row.job_id,lease_token=token,execution_seq=leased.execution_seq}
                local snapshot=checked(db:query([[SELECT c.*,p.body,p.kind FROM kickside_projection_cursor c
                    JOIN kickside_projection p ON p.id=c.projection_id WHERE c.id=$1]],{row.cursor_id}))[1]
                snapshot.body=checked(json.decode(snapshot.body))
                local first=index==1 and output_ids[1] or output_ids[2]
                local second=index==1 and output_ids[2] or output_ids[1]
                coroutine.spawn(function()
                    start:receive()
                    local ok,result,err=pcall(apply.advance,"app:db",job,snapshot,1,{append_events={
                        {thread_id=first,events={{type="fixture:output",body_json="{}"}}},
                        {thread_id=second,events={{type="fixture:output",body_json="{}"}}},
                    }})
                    done:send({ok=ok,result=result,err=err})
                end)
            end
            db:release()
            start:send(true);start:send(true)
            local deadline=time.after("30s")
            for _=1,2 do
                local result=channel.select({done:case_receive(),deadline:case_receive()})
                test.eq(result.channel,done,"both completions must terminate")
                test.is_true(result.value.ok,tostring(result.value.result))
                test.is_nil(result.value.err,tostring(result.value.err))
                test.not_nil(result.value.result)
            end
            db=assert(sql.get("app:db"))
            for _,id in ipairs(output_ids) do
                test.eq(checked(db:query("SELECT event_count FROM kickside_thread WHERE id=$1",{id}))[1].event_count,2)
            end
            db:release()
            for _,id in ipairs(all_jobs) do checked(jobs.cancel(id)) end
        end)
    end)
end)
