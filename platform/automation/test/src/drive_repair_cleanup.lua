-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local sql=require("sql")
local types=require("types")
local jobs_config=require("jobs_config")

-- These fixtures have no component owners and must never reach a later suite's
-- live Jobs worker. Delete only IDs this suite allocated, including fake running
-- jobs that have no real lease; run-history foreign keys cascade on both engines.
return function(owners)
    local ids,seen={},{}
    for _,id in ipairs(owners) do
        if not seen[id] then ids[#ids+1]=id;seen[id]=true end
    end
    local function remove(db_id,table_name,column,prefix)
        local db=assert(sql.get(db_id))
        local ok,err=pcall(function()
            for first=1,#ids,200 do
                local marks,params={},{}
                for i=first,math.min(first+199,#ids) do
                    params[#params+1]=ids[i];marks[#marks+1]="$"..tostring(#params)
                end
                local _,delete_err=db:execute("DELETE FROM "..table_name.." WHERE "..prefix..column
                    .." IN ("..table.concat(marks,",")..")",params)
                if delete_err then error(delete_err) end
            end
        end)
        db:release()
        if not ok then error(err) end
    end
    remove(jobs_config.db_id(),"kickside_job","owner_id","owner_kind='automation' AND ")
    remove(types.db_id(),"kickside_automation_drive","automation_id","")
end
