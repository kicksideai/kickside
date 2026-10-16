local test = require("test")
local uuid = require("uuid")
local writable_module = require("run_writable")
local maintenance_module = require("maintenance")
local admission = require("admission")
local store = require("store")
local admission_scaffold = require("admission_scaffold")

local sc = admission_scaffold.new({
    test = test,
    uuid = uuid,
    run_writable = writable_module,
    maintenance = maintenance_module,
    admission = admission,
    store = store,
})
local writable = sc.writable
local maintenance = sc.maintenance
local TEST_IDENTITY_JSON = sc.TEST_IDENTITY_JSON
local reserve_fixture = sc.reserve_fixture

local function define_tests()
    test.describe("workflow admission and recovery", function()
        local new_engine = sc.new_engine
        local new_appender = sc.new_appender
        local install = sc.install
        local build_request = sc.build_request
        local query_row = sc.query_row
        local exec = sc.exec
        local dataflow_of = sc.dataflow_of
        local old_repo, old_version_read, old_compiler = writable._repo, writable._version_read, writable._compiler
        local old_writer_client, old_checker_client = writable._client_new, maintenance._client_new
        local old_identity_loader = writable._load_identity
        local old_append = maintenance._append_event
        test.after_all(function()
            writable._repo, writable._version_read, writable._compiler = old_repo, old_version_read, old_compiler
            writable._client_new, maintenance._client_new = old_writer_client, old_checker_client
            writable._load_identity = old_identity_loader
            maintenance._append_event = old_append
        end)
        test.it("admits exactly one racer for the last slot; the loser gets typed capacity", function()
            local _, _, _, cli = new_engine()
            local _, append = new_appender()
            install(cli, append)
            local trigger = "automation-" .. uuid.v4()
            local flow = "flow-" .. uuid.v4()
            local function reserve_args(key: string, limit: number): any
                return { workflow_id = flow, version = 1, trigger_id = trigger,
                    dedup_key = key, automation_revision = 1, limit = limit,
                    execution_identity_json = TEST_IDENTITY_JSON }
            end
            for index = 1, 24 do
                local seeded, seed_err = reserve_fixture(reserve_args("seed-" .. tostring(index), 1))
                test.is_nil(seed_err)
                test.not_nil(seeded.row)
            end
            local first, first_err = reserve_fixture(reserve_args("racer-a", 1))
            test.is_nil(first_err)
            test.eq(first.existing, false)
            test.eq(type(first.row.run_id), "string")
            local second, second_err = reserve_fixture(reserve_args("racer-b", 1))
            test.is_nil(second_err)
            test.eq(second.capacity, true)
            local repeat_a, repeat_err = reserve_fixture(reserve_args("racer-a", 1))
            test.is_nil(repeat_err)
            test.eq(repeat_a.existing, true)
            test.eq(repeat_a.row.run_id, first.row.run_id)
            local count = query_row("SELECT COUNT(*) AS n FROM workflow_runs WHERE trigger_id=$1", { trigger })
            test.eq(tonumber(count.n), 25)
            local full = "automation-" .. uuid.v4()
            for i = 1, 25 do
                local reserved, reserve_err = reserve_fixture({ workflow_id = flow, version = 1,
                    trigger_id = full, dedup_key = "fill-" .. tostring(i), automation_revision = 1,
                    execution_identity_json = TEST_IDENTITY_JSON })
                test.is_nil(reserve_err)
                test.eq(reserved.existing, false)
            end
            local loser = writable.write(build_request(full, flow, "racer-late"))
            test.eq(loser.success, false)
            test.eq(loser.error.scope, "capacity")
            test.eq(loser.error.retriable, true)
            test.eq(loser.retry_after_ms, 2000)
            local old_identity_key_only = writable.write(build_request(full, flow, "fill-1"))
            test.eq(old_identity_key_only.success, false)
            test.eq(old_identity_key_only.error.scope, "capacity")
        end)

        test.it("uses the workflows policy inflight limit instead of a request limit", function()
            local trigger, flow = "automation-" .. uuid.v4(), "flow-" .. uuid.v4()
            local first, first_err = reserve_fixture({ workflow_id = flow, version = 1,
                trigger_id = trigger, dedup_key = "policy-limit-1", automation_revision = 1,
                limit = 1, execution_identity_json = TEST_IDENTITY_JSON })
            local second, second_err = reserve_fixture({ workflow_id = flow, version = 1,
                trigger_id = trigger, dedup_key = "policy-limit-2", automation_revision = 1,
                limit = 1, execution_identity_json = TEST_IDENTITY_JSON })

            test.is_nil(first_err)
            test.is_nil(second_err)
            test.not_nil(first.row)
            test.not_nil(second.row)
        end)

        -- A34: a run without a v2 identity stays fail-closed; maintenance adopts
        -- identities first and never activates or observes such a run.
        test.it("never activates or observes a run whose identity is not adopted", function()
            local engine, _, _, cli = new_engine()
            local _, append = new_appender()
            install(cli, append)
            local trigger = "automation-" .. uuid.v4()
            local reserved, reserve_err = reserve_fixture({ workflow_id = "flow-" .. uuid.v4(), version = 1,
                trigger_id = trigger, dedup_key = "unadopted", automation_revision = 1,
                execution_identity_json = TEST_IDENTITY_JSON })
            test.is_nil(reserve_err)
            local run_id = reserved.row.run_id
            local dataflow_id = dataflow_of(run_id)
            engine[dataflow_id] = { status = "pending" }
            local observed, activated = 0, 0
            local get_status, start = cli.get_status, cli.start
            function cli:get_status(id: string): (any?, any?)
                if id == dataflow_id then observed = observed + 1 end
                return get_status(self, id)
            end
            function cli:start(id: string, options: any): (any?, any?)
                if id == dataflow_id then activated = activated + 1 end
                return start(self, id, options)
            end
            exec("UPDATE workflow_runs SET execution_identity_json=NULL, completion_check_at=$1 WHERE run_id=$2",
                { admission.now(), run_id })
            local _, tick_err = maintenance.tick(50)
            test.is_nil(tick_err)
            test.eq(observed, 0)
            test.eq(activated, 0)
            local row = query_row("SELECT admission_state, status FROM workflow_runs WHERE run_id=$1", { run_id })
            test.eq(row.admission_state, "unadmitted")
            test.eq(row.status, "pending")
        end)





    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options: any): any return run_cases(options) end }
