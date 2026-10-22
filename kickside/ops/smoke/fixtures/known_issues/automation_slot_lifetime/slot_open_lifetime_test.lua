local factory = require("factory")
local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local drive = require("drive")
local slot = require("slot")
local jobs = require("jobs")

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
    return owner, assert(id)
end
local function state(owner, id)
    local opened = db()
    local d, err = drive.get(opened, owner, "main")
    if err then error(tostring(err)) end
    local j = query(opened, "SELECT * FROM kickside_job WHERE id=$1", {id})[1]
    opened:release()
    return d, j
end
local function active(owner, id)
    local d, j = state(owner,id)
    test.not_nil(d)
    test.eq(d.job_id,id)
    test.not_nil(j, "drive must not retain a deleted slot")
    if j then test.is_true(j.status == "pending" or j.status == "running", "drive must not retain a terminal slot: " .. tostring(j.status)) end
end

return test.run_cases(function()
    test.describe("open slot lifetime issues", function()
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
        test.it("stale sourceless provisioning must not cancel a newly sourced drive",function()
            local owner,id=new_slot()
            local opened=db();exec(opened,"UPDATE kickside_automation_drive SET source_kind='none' WHERE automation_id=$1",{owner});opened:release()
            local original=jobs.cancel
            local nested_id,nested_err
            jobs.cancel=function(job_id,token)
                jobs.cancel=original
                local inner=db();exec(inner,"UPDATE kickside_automation_drive SET source_kind='timer' WHERE automation_id=$1",{owner});inner:release()
                nested_id,nested_err=slot.provision(owner,"main")
                return original(assert(job_id),token)
            end
            local ok,result,err=pcall(slot.provision,owner,"main")
            jobs.cancel=original
            test.is_true(ok,tostring(result));test.is_nil(err,tostring(err));test.is_nil(nested_err,tostring(nested_err));test.eq(nested_id,id)
            active(owner,id)
        end)
    end)
end)
