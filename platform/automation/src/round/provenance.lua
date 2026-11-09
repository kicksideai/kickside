local json = require("json")
local sql = require("sql")
local ledger = require("round_ledger")
local automation_db = require("automation_db")
local component = require("component")
local commit = require("round_commit")
local drive = require("drive")
local row_limit = require("row_limit")

local M = {}
type Map = { [string]: any }

local function infrastructure(message: string, cause: any): error
    return errors.new({kind=errors.UNAVAILABLE,retryable=true,message=message .. ": " .. tostring(cause),
        details={error_kind="infrastructure",reason="delivery_identity_evidence_unavailable"}})
end

function M.decode(raw: any): (Map?, error?)
    local value, err = json.decode(tostring(raw))
    if err or type(value) ~= "table" then return nil,infrastructure("delivery provenance is invalid",err) end
    return value,nil
end

function M.identity(evidence: Map): (Map?, error?)
    if evidence.unresolved then
        return nil,errors.new({kind=errors.PERMISSION_DENIED,retryable=false,
            message="delivery identity requires authorized resolution",
            details={error_kind="subject",reason="delivery_identity_unresolved"}})
    end
    if type(evidence.identity) ~= "table" then return nil,infrastructure("delivery identity is missing",nil) end
    return evidence.identity,nil
end

local function original(receipt: Map, row: Map?, key: string): (Map?, error?)
    if row and row.execution_identity_json ~= nil then return M.decode(row.execution_identity_json) end
    local generation = receipt.identity_generation
    local stored = receipt.execution_identity
    local evidence: Map = {identity=stored,generation=generation,prepared_key=key}
    if row then
        local selected = receipt.identity_selected_at
        if generation ~= 0 and type(selected) == "string" and selected > tostring(row.created_at) then
            return {unresolved=true,created_at=row.created_at,generation=generation},nil
        end
        evidence.inferred={created_at=row.created_at,identity_selected_at=selected,
            reason=generation == 0 and "original_generation"
                or (type(selected) == "string" and "selection_not_after_admission" or "selection_audit_missing")}
    end
    return evidence,nil
end

local function admission_row(prior: Map?, row: Map): Map
    if prior and (prior.execution_identity_json ~= nil
        or (row.execution_identity_json == nil and tostring(prior.created_at) <= tostring(row.created_at))) then
        return prior
    end
    return row
end

local function rows(tx: any, d: Map, keys: {string}): (Map?, error?)
    local found: Map = {evidence={},prepared={},ledger={}}
    for first=1,#keys,100 do
        local params: {any} = {tostring(d.automation_id)}
        local marks: {string} = {}
        for index=first,math.min(#keys,first+99) do
            params[#params+1]=keys[index];marks[#marks+1]="$" .. tostring(#params)
        end
        local prepared, read_err = tx:query("SELECT idempotency_key,execution_identity_json,created_at FROM kickside_automation_prepared"
            .. " WHERE automation_id=$1 AND idempotency_key IN (" .. table.concat(marks,",") .. ")",params)
        if read_err then return nil,infrastructure("prepared provenance read fails",read_err) end
        for _,row in ipairs(prepared) do
            found.evidence[row.idempotency_key]=admission_row(found.evidence[row.idempotency_key],row)
            found.prepared[#found.prepared+1]=row
        end
        params[#params+1]=tostring(d.ledger_port or d.source_port)
        local retained, ledger_err = tx:query("SELECT item_key,identity_key,execution_identity_json,created_at FROM kickside_trigger_item_ledger"
            .. " WHERE owner_id=$1 AND identity_key IN (" .. table.concat(marks,",") .. ") AND source_port=$" .. tostring(#params),params)
        if ledger_err then return nil,infrastructure("ledger provenance read fails",ledger_err) end
        for _,row in ipairs(retained) do
            found.evidence[row.identity_key]=admission_row(found.evidence[row.identity_key],row)
            found.ledger[#found.ledger+1]=row
        end
    end
    return found,nil
end

-- The protected owner captures once before effects. The drive journal survives
-- a fenced/crashed round until commit transfers evidence into retained work.
function M.admit(d: Map, keys: {string}): (Map?, error?)
    local receipt, receipt_err = component.get_identity_receipt(tostring(d.automation_id))
    if receipt_err or not receipt then return nil,receipt_err end
    return automation_db.in_tx(function(tx: any): (any?,error?)
        local held,fence_err=commit.fence_tx(tx,tostring(d.automation_id),tostring(d.drive_key),d.fence)
        if fence_err then return nil,fence_err end
        if not held then return nil,errors.new({kind=errors.CONFLICT,retryable=true,message="delivery fence moves"}) end
        local journal: Map = held.admission or {}
        local existing,read_err=rows(tx,d,keys)
        if read_err or not existing then return nil,read_err end
        local answer: Map = {}
        local changed=false
        for _,key in ipairs(keys) do
            local evidence=journal[key]
            if evidence == nil then
                local admitted,admit_err=original(receipt,existing.evidence[key],key)
                if admit_err then return nil,admit_err end
                evidence=admitted
                journal[key]=evidence
                changed=true
            end
            answer[key]=evidence
        end
        held.admission=journal
        table.sort(existing.ledger,function(a: Map,b: Map): boolean
            if a.item_key ~= b.item_key then return a.item_key < b.item_key end
            return a.identity_key < b.identity_key
        end)
        table.sort(existing.prepared,function(a: Map,b: Map): boolean return a.idempotency_key < b.idempotency_key end)
        for _,kind in ipairs({"ledger","prepared"}) do
            for _,row in ipairs(existing[kind]) do
                if row.execution_identity_json == nil then
                    local key=row.identity_key or row.idempotency_key
                    local encoded,encode_err=M.encoded(held,key)
                    if encode_err then return nil,encode_err end
                    local statement: string
                    local params: {any}
                    if kind == "ledger" then
                        statement="UPDATE kickside_trigger_item_ledger SET execution_identity_json=$1"
                            .. " WHERE owner_id=$2 AND source_port=$3 AND item_key=$4 AND identity_key=$5 AND execution_identity_json IS NULL"
                        params={encoded,tostring(d.automation_id),tostring(d.ledger_port or d.source_port),row.item_key,key}
                    else
                        statement="UPDATE kickside_automation_prepared SET execution_identity_json=$1"
                            .. " WHERE automation_id=$2 AND idempotency_key=$3 AND execution_identity_json IS NULL"
                        params={encoded,tostring(d.automation_id),key}
                    end
                    local _,write_err=tx:execute(statement,params)
                    if write_err then return nil,infrastructure("retained admission write fails",write_err) end
                end
            end
        end
        if changed then
            local encoded,encode_err=json.encode(journal)
            if encode_err then return nil,infrastructure("admission encoding fails",encode_err) end
            local size_err=row_limit.check(encoded,"delivery_admission",tostring(d.automation_id))
            if size_err then return nil,size_err end
            local written,write_err=drive.update_cas_tx(tx,tostring(d.automation_id),tostring(d.drive_key),{}, {admission_json=encoded})
            if write_err then return nil,write_err end
            if not written then return nil,infrastructure("admission drive disappears",d.drive_key) end
        end
        return {deliveries=answer,identity_generation=receipt.identity_generation},nil
    end)
end

function M.load_evidence(d: Map, key: string): (Map?, error?)
    local held,read_err=automation_db.with_db(function(db: any): (any?,error?)
        return drive.get_admission(db,tostring(d.automation_id),tostring(d.drive_key),key)
    end)
    if read_err then return nil,read_err end
    if held and commit.holds(held,d.fence) and type(held.admission) == "table" and held.admission[key] ~= nil then
        return held.admission[key],nil
    end
    local admitted,err=M.admit(d,{key})
    if err or not admitted then return nil,err end
    return admitted.deliveries[key],nil
end

function M.encoded(held: Map, key: string): (string?, error?)
    local evidence=type(held.admission) == "table" and held.admission[key] or nil
    if evidence == nil then return nil,infrastructure("delivery admission is missing",key) end
    local encoded,err=json.encode(evidence)
    if err then return nil,infrastructure("delivery admission encoding fails",err) end
    return encoded,nil
end

function M.resolve_tx(tx: any, held: Map, receipt: Map, item_keys: {string}, delivery_keys: {string}, drives: Map): (integer?, error?)
    local dialect,dialect_err=tx:db_type()
    if dialect_err then return nil,infrastructure("resolution dialect is unavailable",dialect_err) end
    local suffix=dialect == sql.type.POSTGRES and " FOR UPDATE" or ""
    local owner=tostring(held.automation_id)
    local port=ledger.source_port(held)
    local journal: Map=held.admission or {}
    held.admission=journal
    local updated: Map={[held.drive_key]=held}
    local plans: {Map} = {}
    local prepared_keys: {string} = {}
    local seen: Map = {}
    for _,key in ipairs(delivery_keys) do seen[key]=true;prepared_keys[#prepared_keys+1]=key end
    if #item_keys > 0 then
        local params: {any}={owner,port}
        local marks: {string}={}
        for _,key in ipairs(item_keys) do params[#params+1]=key;marks[#marks+1]="$" .. tostring(#params) end
        local retained,read_err=tx:query("SELECT item_key,identity_key,execution_identity_json,created_at FROM kickside_trigger_item_ledger"
            .. " WHERE owner_id=$1 AND source_port=$2 AND item_key IN (" .. table.concat(marks,",") .. ")"
            .. " AND state IN ('waiting','retrying','parked','uncertain','dead')"
            .. " ORDER BY owner_id,source_port,item_key,identity_key LIMIT 201",params)
        if read_err then return nil,infrastructure("resolution ledger read fails",read_err) end
        if #retained > 200 then return nil,errors.new({kind=errors.INVALID,message="identity resolution requires a bounded delivery selection"}) end
        for _,row in ipairs(retained) do
            if not seen[row.identity_key] then seen[row.identity_key]=true;prepared_keys[#prepared_keys+1]=row.identity_key end
        end
    end
    if #prepared_keys > 200 then return nil,errors.new({kind=errors.INVALID,message="identity resolution requires a bounded delivery selection"}) end
    table.sort(prepared_keys)
    if #prepared_keys > 0 then
        local params: {any}={owner}
        local marks: {string}={}
        for _,key in ipairs(prepared_keys) do params[#params+1]=key;marks[#marks+1]="$" .. tostring(#params) end
        local retained,read_err=tx:query("SELECT source_port,item_key,identity_key,execution_identity_json,created_at FROM kickside_trigger_item_ledger"
            .. " WHERE owner_id=$1 AND identity_key IN (" .. table.concat(marks,",") .. ")"
            .. " AND state IN ('waiting','retrying','parked','uncertain','dead')"
            .. " ORDER BY owner_id,source_port,item_key,identity_key LIMIT 201" .. suffix,params)
        if read_err then return nil,infrastructure("resolution ledger lock fails",read_err) end
        if #retained > 200 then return nil,errors.new({kind=errors.INVALID,message="identity resolution requires a bounded delivery selection"}) end
        for _,row in ipairs(retained) do plans[#plans+1]={table="kickside_trigger_item_ledger",row=row,key=row.identity_key} end
    end
    for first=1,#prepared_keys,100 do
        local params: {any}={owner}
        local marks: {string}={}
        for index=first,math.min(#prepared_keys,first+99) do params[#params+1]=prepared_keys[index];marks[#marks+1]="$" .. tostring(#params) end
        local prepared,read_err=tx:query("SELECT idempotency_key,execution_identity_json,created_at FROM kickside_automation_prepared"
            .. " WHERE automation_id=$1 AND idempotency_key IN (" .. table.concat(marks,",") .. ")"
            .. " ORDER BY automation_id,idempotency_key" .. suffix,params)
        if read_err then return nil,infrastructure("resolution prepared read fails",read_err) end
        for _,row in ipairs(prepared) do plans[#plans+1]={table="kickside_automation_prepared",row=row,key=row.idempotency_key} end
    end
    if #plans == 0 then return nil,errors.new({kind=errors.NOT_FOUND,message="identity resolution names no retained delivery"}) end
    local originals: Map={}
    for _,plan in ipairs(plans) do originals[plan.key]=admission_row(originals[plan.key],plan.row) end
    for _,plan in ipairs(plans) do
        local prior,prior_err=original(receipt,originals[plan.key],plan.key)
        if prior_err or not prior then return nil,prior_err end
        local admitted=type(prior.identity) == "table"
        for _,candidate in pairs(drives) do
            local saved=type(candidate.admission) == "table" and candidate.admission[plan.key] or nil
            if type(saved) == "table" and type(saved.identity) == "table" then admitted=true end
        end
        if admitted then
            return nil,errors.new({kind=errors.CONFLICT,retryable=false,message="admitted delivery identity is immutable",
                details={reason="delivery_identity_already_admitted"}})
        end
    end
    for _,plan in ipairs(plans) do
        local evidence={identity=receipt.execution_identity,generation=receipt.identity_generation,prepared_key=plan.key}
        local encoded,encode_err=json.encode(evidence)
        if encode_err then return nil,infrastructure("resolved identity encoding fails",encode_err) end
        local statement: string
        local params: {any}
        if plan.table == "kickside_trigger_item_ledger" then
            statement="UPDATE kickside_trigger_item_ledger SET execution_identity_json=$1,identity_parked=false WHERE owner_id=$2 AND source_port=$3 AND item_key=$4 AND identity_key=$5"
            params={encoded,owner,plan.row.source_port,plan.row.item_key,plan.key}
        else
            statement="UPDATE kickside_automation_prepared SET execution_identity_json=$1 WHERE automation_id=$2 AND idempotency_key=$3"
            params={encoded,owner,plan.key}
        end
        local _,write_err=tx:execute(statement,params)
        if write_err then return nil,infrastructure("resolved identity write fails",write_err) end
        journal[plan.key]=evidence
        for key,candidate in pairs(drives) do
            if type(candidate.admission) == "table" and candidate.admission[plan.key] ~= nil then
                candidate.admission[plan.key]=evidence
                updated[key]=candidate
            end
        end
    end
    local keys: {string}={}
    for key in pairs(updated) do keys[#keys+1]=key end
    for _,key in ipairs(drive.sorted_keys(keys)) do
        local encoded,encode_err=json.encode(updated[key].admission)
        if encode_err then return nil,infrastructure("resolved admission encoding fails",encode_err) end
        local size_err=row_limit.check(encoded,"delivery_admission",owner)
        if size_err then return nil,size_err end
        local changed,write_err=drive.update_cas_tx(tx,owner,key,{}, {admission_json=encoded})
        if write_err then return nil,write_err end
        if not changed then return nil,infrastructure("resolution drive disappears",key) end
    end
    return #plans,nil
end

return M
