local json = require("json")
local sql = require("sql")
local row_limit = require("row_limit")
local runtime_policy = require("runtime_policy")
local drive = require("drive")

local M = {}
type Map = { [string]: any }
local TABLE = "kickside_automation_delivery_history"
local KEY = "automation_id,drive_key,round_token,source_port,item_key,identity_key"
local BATCH = 50

local function internal(message: string, cause: any): error
    return errors.new({kind=errors.INTERNAL,retryable=true,message=message .. ": " .. tostring(cause)})
end

function M.cutoff(): (string?,error?)
    local policy,err=runtime_policy.policy()
    if err then return nil,err end
    return drive.utc_after(-(policy.history_ms :: integer)),nil
end

function M.event(outcome: Map, prior: Map?, delivered: boolean): boolean
    local unresolved=prior and (prior.state == "retrying" or prior.state == "waiting" or prior.state == "uncertain" or prior.state == "parked")
    local stored=prior and prior.item or nil
    local reservation=type(stored) == "table" and stored.reservation ~= nil and stored.delivery_evidence == nil
    return ((not prior or reservation) and outcome.state ~= "resolved")
        or (unresolved and (outcome.state == "resolved" or outcome.state == "dead")) or delivered
end

function M.record_tx(tx: any, round: Map, outcomes: {Map}, deliveries: {Map}?, prior: Map?): error?
    local delivered: Map={}
    for _,entry in ipairs(deliveries or {}) do delivered[entry.key]=true end
    local states=prior or {}
    local rows: {Map} = {}
    for _,outcome in ipairs(outcomes) do
        local prior=states[outcome.item.item_key .. "\n" .. outcome.item.delivery_key]
        if M.event(outcome,prior,delivered[outcome.item.delivery_key] == true) then
            local error_json: string? = nil
            if outcome.error ~= nil or prior or delivered[outcome.item.delivery_key] then
                local details: Map = {}
                for key,value in pairs(outcome.error or {}) do details[key]=value end
                local reserved=prior and prior.state == "uncertain" and type(prior.item) == "table" and prior.item.reservation ~= nil
                details.attempts=(prior and tonumber(prior.attempts) or 0)
                    + ((not reserved and (delivered[outcome.item.delivery_key] or (outcome.state ~= "waiting" and outcome.state ~= "resolved"))) and 1 or 0)
                local encoded,err=json.encode(details)
                if err then return internal("delivery history error encoding fails",err) end
                error_json=encoded
            end
            local row: Map={automation_id=round.automation_id,drive_key=round.drive_key,
                round_token=round.captured.round_token,source_port=round.source_port,
                item_key=outcome.item.item_key,identity_key=outcome.item.delivery_key,state=outcome.state,
                execution_identity_json=outcome.execution_identity_json,error_json=error_json,
                round_at=round.now,expires_at=round.history_expires_at or round.resolved_expires_at}
            local encoded,encode_err=json.encode(row)
            if encode_err then return internal("delivery history encoding fails",encode_err) end
            local bound_err=row_limit.check(encoded,"delivery_history",round.automation_id)
            if bound_err then return bound_err end
            rows[#rows+1]=row
        end
    end
    table.sort(rows,function(a: Map,b: Map): boolean
        if a.item_key ~= b.item_key then return a.item_key < b.item_key end
        return a.identity_key < b.identity_key
    end)
    for first=1,#rows,BATCH do
        local params: {any}={}
        local values: {string}={}
        for index=first,math.min(#rows,first+BATCH-1) do
            local row=rows[index]
            local marks: {string}={}
            for _,value in ipairs({row.automation_id,row.drive_key,row.round_token,row.source_port,
                row.item_key,row.identity_key,row.state,row.execution_identity_json or sql.NULL,
                row.error_json or sql.NULL,row.round_at,row.expires_at}) do
                params[#params+1]=value
                marks[#marks+1]="$" .. tostring(#params)
            end
            values[#values+1]="(" .. table.concat(marks,",") .. ")"
        end
        local _,write_err=tx:execute("INSERT INTO " .. TABLE .. " (" .. KEY
            .. ",state,execution_identity_json,error_json,round_at,expires_at) VALUES " .. table.concat(values,","),params)
        if write_err then return internal("delivery history append fails",write_err) end
    end
    return nil
end

local function decode_outcomes(rows: {Map}): ({Map}?,error?)
    local outcomes: {Map}={}
    for _,row in ipairs(rows :: {Map}) do
        local failure: any = nil
        if row.error_json ~= nil then
            local decoded,decode_err=json.decode(tostring(row.error_json))
            if decode_err then return nil,internal("delivery history error is not JSON",decode_err) end
            failure=decoded
        end
        outcomes[#outcomes+1]={state=tostring(row.state),error=failure}
    end
    return outcomes,nil
end

-- outcomes(executor, automation_id, source_port, item_key, identity_keys) ->
-- { state, error? } of every retained round outcome of the item under those
-- delivery keys, until the history's retention prunes them.
function M.outcomes(executor: any, automation_id: string, source_port: string, item_key: string,
        identity_keys: {string}): ({Map}?, error?)
    local cutoff,cutoff_err=M.cutoff()
    if cutoff_err then return nil,cutoff_err end
    local outcomes: {Map} = {}
    for first=1,#identity_keys,100 do
        local params: {any}={automation_id,source_port,item_key,cutoff}
        local marks: {string}={}
        for index=first,math.min(#identity_keys,first+99) do
            params[#params+1]=identity_keys[index]
            marks[#marks+1]="$" .. tostring(#params)
        end
        local rows,err=executor:query("SELECT state,error_json FROM " .. TABLE
            .. " WHERE automation_id=$1 AND source_port=$2 AND item_key=$3 AND round_at>$4 AND identity_key IN ("
            .. table.concat(marks,",") .. ")",params)
        if err then return nil,internal("delivery history read fails",err) end
        local decoded,decode_err=decode_outcomes(rows)
        if decode_err or not decoded then return nil,decode_err end
        for _,outcome in ipairs(decoded) do outcomes[#outcomes+1]=outcome end
    end
    return outcomes,nil
end

-- Mutable retry state names its summary event by the existing primary key.
function M.evidence(executor: any, owner: string, ref: Map, cutoff: string): (Map?,error?)
    if type(ref.round_at) ~= "string" or ref.round_at <= cutoff then return nil,nil end
    local rows,err=executor:query("SELECT state,error_json FROM " .. TABLE
        .. " WHERE automation_id=$1 AND drive_key=$2 AND round_token=$3 AND source_port=$4 AND item_key=$5 AND identity_key=$6",
        {owner,ref.drive_key,ref.round_token,ref.source_port,ref.item_key,ref.identity_key})
    if err then return nil,internal("delivery summary history read fails",err) end
    return rows[1],nil
end

-- Each recursive step seeks the next automation prefix in the existing page
-- index. It never walks an automation's item observations to discover owners.
local OWNERS = "WITH RECURSIVE owners(automation_id) AS (SELECT MIN(automation_id) FROM " .. TABLE
    .. " UNION ALL SELECT (SELECT MIN(automation_id) FROM " .. TABLE
    .. " WHERE automation_id>owners.automation_id) FROM owners WHERE automation_id IS NOT NULL) "

function M.oldest(executor: any): (string?,error?)
    local rows,err=executor:query(OWNERS .. "SELECT MIN((SELECT MIN(round_at) FROM " .. TABLE
        .. " h WHERE h.automation_id=owners.automation_id)) AS at FROM owners WHERE automation_id IS NOT NULL",{})
    if err then return nil,internal("delivery history deadline read fails",err) end
    return rows[1] and rows[1].at,nil
end

function M.prune_tx(tx: any, cutoff: string, limit: integer): (integer?,error?)
    if type(cutoff) ~= "string" or cutoff == "" or type(limit) ~= "number"
        or limit ~= math.floor(limit) or limit < 1 or limit > 1000 then
        return nil,errors.new({kind=errors.INVALID,message="delivery history cutoff and limit 1..1000 required"})
    end
    local owners,read_err=tx:query(OWNERS .. "SELECT automation_id FROM owners WHERE automation_id IS NOT NULL"
        .. " AND (SELECT MIN(round_at) FROM " .. TABLE .. " h WHERE h.automation_id=owners.automation_id)<=$1 LIMIT $2",{cutoff,limit})
    if read_err then return nil,internal("delivery history prune owners fails",read_err) end
    local count=0
    for _,owner in ipairs(owners) do
        local deleted,err=tx:execute("DELETE FROM " .. TABLE .. " WHERE (" .. KEY .. ") IN (SELECT " .. KEY
            .. " FROM " .. TABLE .. " WHERE automation_id=$1 AND round_at <= $2 ORDER BY round_at,drive_key,round_token,source_port,item_key,identity_key LIMIT $3)",
            {owner.automation_id,cutoff,limit-count})
        local affected=deleted and tonumber(deleted.rows_affected) or nil
        if err or affected == nil then return nil,internal("delivery history prune fails",err or "missing affected-row count") end
        count=count+math.floor(affected)
        if count == limit then break end
    end
    return count,nil
end

return M
