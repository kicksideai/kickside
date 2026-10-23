-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local repair = require("repair")
local forward = require("forward")
local boundary = require("boundary")
local cleanup = require("cleanup")
local drive = require("drive")
local types = require("types")
local owners = {}

local function checked(value: any, err: any): any
    if err then error(err) end
    return value
end

local cases = test.run_cases(function()
    test.describe("forward stranded-drive recovery", function()
    test.it("repairs past an old applied marker and records the forward ID only after its wake succeeds", function()
        local db = assert(sql.get(types.db_id()))
        local owner, old_id, new_id = uuid.v7(), "app:old-repair:" .. uuid.v7(), "app:forward-repair:" .. uuid.v7()
        owners[#owners+1] = owner
        local tx = assert(db:begin())
        checked(drive.insert_tx(tx, {automation_id=owner,drive_key="main",source_kind="timer"}))
        checked(tx:execute("UPDATE kickside_automation_drive SET job_id=$1 WHERE automation_id=$2", {uuid.v7(),owner}))
        checked(tx:execute("INSERT INTO _migrations (id,description) VALUES ($1,'old repair committed before wake')", {old_id}))
        checked(tx:commit())
        test.eq(repair({db=db,id=old_id}).skipped,1)
        local before = checked(drive.get(db,owner,"main")).job_id
        boundary.fail_wake = true
        local first = forward({db=db,id=new_id})
        boundary.fail_wake = false
        test.eq(first.status,"error")
        test.eq(#checked(db:query("SELECT id FROM _migrations WHERE id=$1",{new_id})),0)
        local after = checked(drive.get(db,owner,"main")).job_id
        test.is_true(after ~= before)
        local resumed = forward({db=db,id=new_id})
        test.eq(resumed.status,"complete",tostring(resumed.error))
        test.eq(checked(drive.get(db,owner,"main")).job_id,after)
        test.eq(#checked(db:query("SELECT id FROM _migrations WHERE id=$1",{old_id})),1)
        test.eq(#checked(db:query("SELECT id FROM _migrations WHERE id=$1",{new_id})),1)
        test.eq(forward({db=db,id=new_id}).skipped,1)
        db:release()
    end)
    end)
end)

return function(options: any): any
    local ok, result = pcall(cases,options)
    boundary.fail_wake = false
    cleanup(owners)
    if not ok then error(result) end
    return result
end
