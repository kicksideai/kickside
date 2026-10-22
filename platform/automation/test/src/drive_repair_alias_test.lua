-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test=require("test")
local cleanup=require("cleanup")
local owners={}
local sql=require("sql")
local uuid=require("uuid")
local drive=require("drive")
local slot=require("slot")
local jobs=require("jobs")
local repair=require("repair")
local types=require("types")
local cfg=require("jobs_config")
local cases=test.run_cases(function()
    test.describe("aliased SQLite database resources",function()
    test.it("repairs when Jobs and Automation use the configured database resources",function()
        local db=assert(sql.get(types.db_id()))
        local owner=uuid.v7()
            owners[#owners+1]=owner
        local tx=assert(db:begin())
        local _,err=drive.insert_tx(tx,{automation_id=owner,drive_key="main",source_kind="timer"})
        assert(not err,tostring(err))
        assert(tx:commit())
        -- The existing public provisioning path succeeds with this configuration.
        local old,provision_err=slot.provision(owner,"main")
        assert(old,tostring(provision_err))
        assert(jobs.cancel(old))
        local result=repair({db=db,id="app:alias-repair:"..uuid.v7()})
        db:release()
        test.eq(result.status,"complete",tostring(result.error))
    end)
    end)
end)

return function(options)
    local ok,result=pcall(cases,options)
    cleanup(owners)
    if not ok then error(result) end
    return result
end
