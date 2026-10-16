-- The privileged declaration step writes plan state, public cadence and
-- the fence in one component transaction on SQLite and PostgreSQL.
local sql = require("sql")
local json = require("json")
local uuid = require("uuid")
local time = require("time")
local test = require("test")
local ops = require("ops")
local funcs = require("funcs")
local security = require("security")

type Map = { [string]: any }

local function db(): sql.DB
    local opened, err = sql.get("app:db")
    if err or not opened then error(tostring(err)) end
    return opened :: sql.DB
end

local function seed(opened: sql.DB, state: Map): string
    local id = uuid.v7()
    local now = time.now():format(time.RFC3339)
    local encoded, encode_err = json.encode(state)
    if encode_err then error(tostring(encode_err)) end
    local _, insert_err = sql.builder.insert("kickside_components"):set_map({
        component_id = id, impl_id = "kickside.test:security", private_context = encoded,
        position = "n", created_at = now, updated_at = now,
    }):run_with(opened):exec()
    if insert_err then error(tostring(insert_err)) end
    return id
end

local function context(opened: sql.DB, id: string): Map
    local rows, err = opened:query("SELECT private_context FROM kickside_components WHERE component_id = $1", { id })
    if err then error(tostring(err)) end
    local decoded, decode_err = json.decode(tostring(rows[1].private_context))
    if decode_err then error(tostring(decode_err)) end
    return decoded :: Map
end

local function apply_declaration(opened: sql.DB, input: Map): (any?, any)
    local token, prepare_err = ops.prepare_declaration(input, function(request)
        return {
            valid = true, operator_valid = true, subject_valid = true, pins_lowered = true,
            operator_id = "operator", execution_subject_id = "subject",
            component_id = request.component_id, automation_id = request.automation_id,
            command_id = request.command_id, generation = request.generation,
            declaration_hash = request.declaration_hash, declaration = request.declaration,
            state = request.state, public_meta = request.public_meta,
            affected_drive_keys = { "drive-a" },
        }
    end)
    if prepare_err then return nil, prepare_err end
    local tx, begin_err = opened:begin()
    if begin_err or not tx then error(tostring(begin_err)) end
    local result, err = ops.apply_declaration_tx(tx, token)
    if err then tx:rollback() else tx:commit() end
    return result, err
end

local run_cases = test.run_cases(function()
    test.describe("component declaration state", function()
        test.it("identity selection fences a previously authorized declaration without changing retained configuration", function()
            local d=db()
            local id=seed(d,{_portable_input={title="retained"},cursor=9,debt={key="original"}})
            local base={component_id=id,automation_id=id,generation=1,command_id="installed",
                declaration_hash="retained-hash",declaration={title="retained"}}
            local _,base_err=apply_declaration(d,base)
            test.is_nil(base_err,tostring(base_err))
            local old={component_id=id,automation_id=id,generation=2,command_id="old-config",
                declaration_hash="old-desired-hash",declaration={title="delayed old desired"},state={cursor=0}}
            local delayed,delay_err=ops.prepare_declaration(old,function(request)
                return {valid=true,operator_valid=true,subject_valid=true,pins_lowered=true,
                    operator_id="old-operator",execution_subject_id="old-operator",component_id=id,automation_id=id,
                    command_id=request.command_id,generation=request.generation,declaration_hash=request.declaration_hash,
                    declaration=request.declaration,state=request.state,affected_drive_keys={"main"}}
            end)
            test.is_nil(delay_err,tostring(delay_err))
            local _,grant_err=d:execute("INSERT INTO kickside_component_access"
                .. " (access_id,subject_id,subject_type,component_id,source_component_id,access_mask,inherited) VALUES ($1,$2,'user',$3,$4,8,0)",
                {uuid.v7(),"recovery-admin",id,id})
            test.is_nil(grant_err,tostring(grant_err))
            local actor = assert(security.new_actor("recovery-admin", {}))
            local scope = assert(security.new_scope({assert(security.policy("app:test_scope_policy"))}))
            local result, selection_err = funcs.new():with_actor(actor):with_scope(scope)
                :call("app:owned_identity_selection_probe", {
                    input = {component_id = id, principal = {kind = "user", id = "recovery-admin"},
                        request_id = "recovery", expected_identity_generation = 0},
                    owner = {valid = true, automation_id = id, command_id = "recovery",
                        command_generation = 3, declaration_hash = "retained-hash"},
                })
            test.is_nil(selection_err,tostring(selection_err))
            test.eq(result.identity_generation,1)
            local rows,fence_err=d:query("SELECT applied_command_generation,command_id,declaration_hash"
                .. " FROM kickside_component_declaration_fence WHERE component_id=$1 AND automation_id=$2",{id,id})
            test.is_nil(fence_err,tostring(fence_err))
            test.eq(tonumber(rows[1].applied_command_generation),3)
            test.eq(rows[1].command_id,"recovery")
            test.eq(rows[1].declaration_hash,"retained-hash")
            tx=d:begin()
            local _,late_err=ops.apply_declaration_tx(tx,delayed)
            tx:rollback()
            test.not_nil(late_err)
            test.is_true(errors.is(late_err,errors.CONFLICT))
            local retained=context(d,id)
            test.eq(retained._portable_input.title,"retained")
            test.eq(retained.cursor,9)
            test.eq(retained.debt.key,"original")
            d:release()
        end)

        test.it("writes a reconfigured plan and public cadence with the declaration fence", function()
            local d = db()
            local id = seed(d, { _portable_input = { hunts_per_day = 2 }, hunts_per_day = 2, cursor = 7 })
            local input = { component_id = id, automation_id = "automation-state", generation = 2,
                command_id = "state-2", declaration_hash = "state-hash-2",
                declaration = { hunts_per_day = 6 }, state = { hunts_per_day = 6, cursor = 0 },
                public_meta = { hunts_per_day = 6, schedule_expression = "4h" } }
            local written, write_err = apply_declaration(d, input)
            test.is_nil(write_err, tostring(write_err))
            test.eq(written.generation, 2)
            local stored = context(d, id)
            test.eq(stored._portable_input.hunts_per_day, 6)
            test.eq(stored.hunts_per_day, 6)
            test.eq(stored.cursor, 0)
            local rows, meta_err = d:query("SELECT key, value FROM kickside_component_meta WHERE component_id = $1", { id })
            test.is_nil(meta_err, tostring(meta_err))
            local meta = {}
            for _, row in ipairs(rows or {}) do meta[row.key] = row.value end
            test.eq(meta.hunts_per_day, "6")
            test.eq(meta.schedule_expression, "4h")
            d:release()
        end)

        test.it("rolls back plan, cadence and fence when a component metadata write fails", function()
            local d = db()
            local id = seed(d, { _portable_input = { hunts_per_day = 2 }, hunts_per_day = 2 })
            local input = { component_id = id, automation_id = "automation-write-failure", generation = 2,
                command_id = "failed-state-2", declaration_hash = "failed-state-hash-2",
                declaration = { hunts_per_day = 6 }, state = { hunts_per_day = 6 },
                public_meta = { private_context = "forbidden" } }
            local _, write_err = apply_declaration(d, input)
            test.not_nil(write_err)
            local stored = context(d, id)
            test.eq(stored._portable_input.hunts_per_day, 2)
            test.eq(stored.hunts_per_day, 2)
            local rows, fence_err = d:query("SELECT command_id FROM kickside_component_declaration_fence WHERE component_id = $1", { id })
            test.is_nil(fence_err, tostring(fence_err))
            test.eq(#rows, 0)
            d:release()
        end)

    end)
end)
return { run = function(options) return run_cases(options) end }
