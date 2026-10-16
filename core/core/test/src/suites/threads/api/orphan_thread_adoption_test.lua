-- A thread created by a framework maintenance actor is owned by no principal:
-- an operator cannot read or delete it. After the operator adopts it through
-- the component service, the normal threads read and delete paths apply.
-- Runs on SQLite and PostgreSQL.

local test = require("test")
local uuid = require("uuid")
local security = require("security")
local contract = require("contract")

local THREADS = "kickside.core:threads"
local COMPONENT_SERVICE = "kickside.component:component_service"
local MAINTENANCE = "system:kickside.jobs"

local function operator_scope(): any
    local pol, perr = security.policy("app:test_scope_policy")
    if not pol then error("test policy missing: " .. tostring(perr)) end
    return security.new_scope({ pol })
end

local function open(contract_id: string, actor_id: string): any
    local def, def_err = contract.get(contract_id)
    if def_err or not def then error(contract_id .. " unavailable: " .. tostring(def_err)) end
    local inst, open_err = def:with_actor(security.new_actor(actor_id, { security_groups = {} }))
        :with_scope(operator_scope()):open()
    if open_err or not inst then error("open " .. contract_id .. " failed: " .. tostring(open_err)) end
    return inst
end

local function define_tests()
    test.describe("Orphan thread adoption", function()
        test.it("an operator reads and deletes an adopted orphan thread through the threads contract", function()
            local suffix = uuid.v4():sub(1, 8)
            local created, create_err = open(THREADS, MAINTENANCE):create({ thread_class = "orphan_" .. suffix })
            test.is_nil(create_err, tostring(create_err))
            local thread_id = created.thread_id
            local operator = "operator-" .. suffix
            local threads = open(THREADS, operator)

            local hidden, hidden_err = threads:find({ thread_id = thread_id })
            test.is_nil(hidden_err, tostring(hidden_err))
            test.is_nil(hidden)
            local _, refused_err = threads:delete({ thread_id = thread_id })
            test.not_nil(refused_err)

            local adopted, adopt_err = open(COMPONENT_SERVICE, operator):adopt({ component_id = thread_id })
            test.is_nil(adopt_err, tostring(adopt_err))
            test.is_true(adopted.success, tostring(adopted.error))

            local visible, visible_err = threads:find({ thread_id = thread_id })
            test.is_nil(visible_err, tostring(visible_err))
            test.not_nil(visible)
            local deleted, delete_err = threads:delete({ thread_id = thread_id })
            test.is_nil(delete_err, tostring(delete_err))
            test.not_nil(deleted)
            local gone, gone_err = threads:find({ thread_id = thread_id })
            test.is_nil(gone_err, tostring(gone_err))
            test.is_nil(gone)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
