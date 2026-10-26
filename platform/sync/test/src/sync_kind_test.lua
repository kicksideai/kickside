-- The Data Sync kind on the round (design v5 §3.2, §4, A22, A27, A33): its
-- declaration, the drives a real install declares through the automation
-- engine, reconfiguration through the declaration command, and the generic
-- controls. Runs on SQLite and PostgreSQL.

local test = require("test")
local llm = require("llm")
local strategy_llm = require("strategy_llm")
local json = require("json")
local sync = require("sync_runtime")
local automations_lib = require("automations_lib")
local binding_validation = require("binding_validation")
local contract = require("contract")
local drive = require("drive")
local errors = require("errors")
local funcs = require("funcs")
local registry = require("registry")
local security = require("security")
local sql = require("sql")
local time = require("time")
local uuid = require("uuid")

type Map = { [string]: any }

local PROCESS_SCOPE = "wippy.security:process"
local MANAGE = "kickside.automation.agent:automations_manage"
local DB = "app:db"

local function read_drive(id: string, key: string): Map?
    local d, db_err = sql.get(DB)
    if db_err or not d then error(tostring(db_err or "sync test database unavailable")) end
    local row, err = drive.get(d, id, key)
    d:release()
    if err then error(tostring(err)) end
    return row
end

local function declaration(overrides: Map?): Map
    local input: Map = {
        title = "Records to store",
        trigger = { v = 2, source = "app.fixture:records", schedule = { type = "interval", expression = "1h" }, backfill = "all" },
        sink_port = "app.fixture:round_record",
        sink_config = {},
        transform = { kind = "none" },
        enabled = true,
    }
    for k, v in pairs(overrides or {}) do input[k] = v end
    return input
end

local function define_tests()
  test.describe("kickside.sync kind", function()
    local owner_id = ""
    local owner: any = nil
    local exec: any = nil

    local function install(input: Map): (Map?, any)
        return exec:call("app.fixture:install_as_user", { type_id = "kickside.sync:sync", input = input,
            grantee = security.actor():id() })
    end

    local function install_ok(input: Map): Map
        local installed, err = install(input)
        test.is_nil(err, tostring(err))
        test.not_nil(installed)
        return installed :: Map
    end

    local function manage(args: Map): Map
        local out, err = exec:call(MANAGE, args)
        if err then error(tostring(err)) end
        return out :: Map
    end

    test.before_all(function()
        owner_id = "sync-kind-" .. uuid.v4():sub(1, 8)
        owner = security.new_actor(owner_id, { security_groups = { "automation_test" } })
        exec = funcs.new():with_actor(owner):with_scope(security.named_scope(PROCESS_SCOPE))
    end)

    test.describe("kickside.sync declarations", function()
        test.it("remains a native Data Sync Automation with its own create surface", function()
            local entry = registry.get("kickside.sync:sync") :: any
            test.eq(entry.meta.type, "kickside.automation")
            test.eq(entry.meta.class, "automation")
            test.eq(entry.meta.component.create.view, "kickside.sync:sync_create_view")
            local properties = ((entry.meta.inputs or {}).properties or {}) :: any
            test.is_nil(properties.flow_ref)
        end)

        test.it("passes the shared automation binding + port validator", function()
            local failures = binding_validation.validate_bindings({ registry.get("kickside.sync:sync") })
            test.eq(#failures, 0, table.concat(failures, "; "))
        end)

        test.it("delivers through the round consumer and binds no legacy trigger contract or control", function()
            local entry = registry.get("kickside.sync:sync") :: any
            local bound: Map = {}
            for _, c in ipairs(entry.data.contracts or {}) do bound[tostring(c.contract)] = c.methods end
            test.eq((bound["kickside.trigger:round_consumer"] :: Map).deliver, "kickside.sync:round_deliver")
            test.is_nil(bound["kickside.trigger:consumer"])
            test.is_nil(bound["kickside.trigger:scheduled"])
            local contract_methods = bound["kickside.sync:sync_contract"] :: Map
            test.eq(contract_methods.reconfigure, "kickside.sync:sync_reconfigure")
            for _, control in ipairs({ "status", "pause", "resume", "resync", "replay", "reconcile" }) do
                test.is_nil(contract_methods[control], control .. " is the engine's generic control")
            end
            test.is_nil((registry.get("kickside.sync:sync_resync_contract")))
            test.is_nil((registry.get("kickside.sync:sync_replay_contract")))
        end)
    end)

    test.describe("kickside.sync install onto the round", function()
        test.it("resolves a personal event source before requesting its instance schema", function()
            local result, err = exec:call("kickside.sync:sync_install", declaration({
                trigger = { v = 2, source = "app.fixture:personal_record_arrived", backfill = "none" },
            }))
            test.is_nil(err, tostring(err))
            test.not_nil(result)
            test.not_nil(result.source.source_thread_id)
        end)

        test.it("uses the normalized selected instance for its schema and event source", function()
            local result, err = exec:call("kickside.sync:sync_install", declaration({
                trigger = { v = 2, source = "app.fixture:selected_schema_record", backfill = "none",
                    config = { thread_id = "  selected-feed  " } },
            }))
            test.is_nil(err, tostring(err))
            test.eq(result.source.source_thread_id, "selected-feed")
        end)

        test.it("keeps destination-configured content in expression mapping validation", function()
            local installed, err = install(declaration({ trigger = { v = 2, source = "app.fixture:titled_records",
                schedule = { type = "interval", expression = "1h" }, backfill = "all" },
                sink_port = "app.fixture:mapped_content", sink_config = { content = "Configured receipt" },
                transform = { kind = "expr", expr = "{title: input.title}" } }))
            test.is_nil(err, tostring(err))
            test.not_nil(installed)
        end)
        test.it("refuses an expression mapping that reads an undeclared source field", function()
            local _, err = install(declaration({ trigger = { v = 2, source = "app.fixture:titled_records",
                schedule = { type = "interval", expression = "1h" }, backfill = "all" },
                sink_port = "app.fixture:mapped_record", transform = { kind = "expr", expr = "{title: input.email}" } }))
            test.not_nil(err)
            test.contains(tostring(err), "title")
        end)

        test.it("declares a collection main drive with its schedule, pull config and policy overrides", function()
            local input = declaration({
                trigger = { v = 2, source = "app.fixture:records", config = { folder = "a" },
                    schedule = { type = "interval", expression = "2h" }, backfill = "all",
                    poll = { page_size = 25, max_pages_per_run = 4, max_items_per_run = 60 },
                    delivery = { retry_after_ms = 1500 } },
            })
            local installed, err = install(input)
            test.is_nil(err, tostring(err))
            local main = read_drive((installed :: Map).id, "main") :: Map
            test.eq(main.source_kind, "collection")
            test.eq(main.action.source_ref, "app.fixture:records")
            test.eq(main.action.schedule.expression, "2h")
            test.eq(main.action.config.folder, "a")
            test.is_nil(main.action.config.backfill_since)
            test.eq(main.applied.policy.round.page_size, 25)
            test.eq(main.applied.policy.round.max_pages, 4)
            test.eq(main.applied.policy.round.max_items, 60)
            test.eq(main.applied.policy.delivery.retry_after_ms, 1500)
            test.eq(main.enabled, true)
            test.is_nil(read_drive((installed :: Map).id, "reconcile"))
            local d, db_err = sql.get(DB)
            if db_err or not d then error(tostring(db_err or "sync test database unavailable")) end
            local rows = d:query("SELECT id FROM kickside_cron_schedules WHERE task_args LIKE $1", { "%" .. (installed :: Map).id .. "%" })
            d:release()
            test.eq(#(rows or {}), 0)
        end)

        test.it("applies installed LLM settings through the native LLM owner and preserves poll bounds", function()
            local original_models, original_providers = llm._models, llm._providers
            local requests = {}
            local function model(name)
                return { name = name, providers = { { id = "fixture:llm", provider_model = name, sampling = true } } }
            end
            llm._models = {
                get_by_name = function(name) return model(name), nil end,
                get_by_class = function(name) return { model("class:" .. name) }, nil end,
            }
            llm._providers = {
                driver_declares_legacy_reasoning_flag = function() return false, nil end,
                open = function()
                    return { generate = function(_, request)
                        requests[#requests + 1] = request
                        return { result = "bounded output", tokens = {} }, nil
                    end }, nil
                end,
            }
            local ok, failure = pcall(function()
                local cases = {
                    { config = {kind = "llm"}, model = "class:fast", temperature = 0,
                        prompt = "Summarize the item as concise plain text." },
                    { config = {kind = "llm", temperature = 0.7}, model = "class:fast", temperature = 0.7,
                        prompt = "Summarize the item as concise plain text." },
                    { config = {kind = "llm", max_tokens = 41}, model = "class:fast", temperature = 0, max_tokens = 41,
                        prompt = "Summarize the item as concise plain text." },
                    { config = {kind = "llm", generation_policy = {
                        type = "kickside.transform.generation_policy", version = 1,
                        model = {selector = "policy-model"}, sampling = {temperature = 0.25},
                        budgets = {runtime = 29}, prompts = {runtime = "Policy prompt."},
                    }}, model = "policy-model", temperature = 0.25, max_tokens = 29, prompt = "Policy prompt." },
                }
                for _, case in ipairs(cases) do
                    local input = declaration({transform = case.config})
                    input.trigger.poll = {page_size = 25, max_pages_per_run = 4, max_items_per_run = 60}
                    local installed = install_ok(input)
                    local main = read_drive(installed.id, "main")
                    test.eq(main.applied.policy.round.page_size, 25)
                    test.eq(main.applied.policy.round.max_pages, 4)
                    test.eq(main.applied.policy.round.max_items, 60)
                    local result, err = strategy_llm.apply(main.applied.declaration.transform, {payload = {title = "hello"}},
                        {operator_grants = {}, principal_grants = {}})
                    test.is_nil(err, tostring(err))
                    test.eq(result, "bounded output")
                    local request = requests[#requests]
                    test.eq(request.model, case.model)
                    test.eq(request.options.temperature, case.temperature)
                    test.eq(request.options.max_tokens, case.max_tokens)
                    test.eq(request.messages[1].content[1].text, case.prompt)
                end
            end)
            llm._models, llm._providers = original_models, original_providers
            if not ok then error(failure) end
        end)

        test.it("refuses invalid LLM options at install before generation", function()
            for _, config in ipairs({
                {kind = "llm", temperature = "0.5"},
                {kind = "llm", max_tokens = 0},
                {kind = "llm", max_tokens = 2.5},
                {kind = "llm", generation_policy = {sampling = {temperature = false}}},
                {kind = "llm", temperature = 0.1, generation_policy = {sampling = {temperature = 0.2}}},
            }) do
                local _, err = install(declaration({transform = config}))
                test.not_nil(err)
            end
        end)

        test.it("refuses the trigger fields the round gives no meaning", function()
            local base = { v = 2, source = "app.fixture:records", schedule = { type = "interval", expression = "2h" }, backfill = "all" }
            local cases: { { field: string, value: Map } } = {
                { field = "max_attempts", value = { delivery = { max_attempts = 3 } } },
                { field = "on_exhausted", value = { delivery = { on_exhausted = "skip" } } },
                { field = "continue_after_ms", value = { poll = { continue_after_ms = 1000 } } },
                { field = "delivery", value = { poll = { delivery = { retry_after_ms = 1000 } } } },
                { field = "timeout_seconds", value = { schedule = { type = "interval", expression = "2h", timeout_seconds = 30 } } },
                { field = "max_retries", value = { schedule = { type = "interval", expression = "2h", max_retries = 2 } } },
                { field = "trace_context", value = { trace_context = { trace_id = "t" } } },
            }
            for _, case in ipairs(cases) do
                local trigger: Map = {}
                for k, v in pairs(base) do trigger[k] = v end
                for k, v in pairs(case.value) do trigger[k] = v end
                local _, err = install(declaration({ trigger = trigger }))
                test.not_nil(err, case.field .. " must be refused")
                test.contains(tostring(err), case.field)
            end
        end)

        test.it("freezes the backfill boundary a fresh collection install declares", function()
            local before = time.now():utc():format(time.RFC3339)
            local none = install_ok(declaration({ trigger = { v = 2, source = "app.fixture:records",
                schedule = { type = "interval", expression = "1h" }, backfill = "none" } })) :: Map
            local since_none = tostring((read_drive(none.id, "main") :: Map).action.config.backfill_since)
            test.is_true(since_none >= string.sub(before, 1, 10), since_none)
            local since = install_ok(declaration({ trigger = { v = 2, source = "app.fixture:records",
                schedule = { type = "interval", expression = "1h" }, backfill = { since = "2026-01-02T03:04:05Z" } } })) :: Map
            test.eq((read_drive(since.id, "main") :: Map).action.config.backfill_since, "2026-01-02T03:04:05Z")
            local days = install_ok(declaration({ trigger = { v = 2, source = "app.fixture:records",
                schedule = { type = "interval", expression = "1h" }, backfill = { last_days = 3 } } })) :: Map
            local expected = time.unix(time.now():unix() - 3 * 86400, 0):utc():format(time.RFC3339)
            test.eq(string.sub(tostring((read_drive(days.id, "main") :: Map).action.config.backfill_since), 1, 13),
                string.sub(expected, 1, 13))
        end)

        test.it("declares reconciliation as a reconcile drive over the source's pull_keys, with no schedule row", function()
            local installed, err = install(declaration({ trigger = { v = 2, source = "app.fixture:keyed_records",
                schedule = { type = "interval", expression = "1h" }, backfill = "all" }, reconcile = true }))
            test.is_nil(err, tostring(err))
            local rd = read_drive((installed :: Map).id, "reconcile") :: Map
            test.eq(rd.source_kind, "reconcile")
            test.eq(rd.action.pull_keys, "app.fixture:record_keys")
            test.not_nil(rd.reconcile_next_at)
            local state = automations_lib.read_state((installed :: Map).id) :: Map
            test.is_nil(state.reconcile_schedule_id)
            test.is_nil(state.schedule_ids)
        end)

        test.it("refuses reconcile over a source that cannot list its keys", function()
            local _, err = install(declaration({ reconcile = true }))
            test.contains(tostring(err), "pull_keys")
        end)

        test.it("installs a disabled sync with its drives paused", function()
            local installed = install_ok(declaration({ enabled = false })) :: Map
            local main = read_drive(installed.id, "main") :: Map
            test.eq(main.enabled, false)
            test.eq(main.phase, drive.PHASE.PAUSED)
        end)

        test.it("declares an events source as an event drive on its thread from its history boundary", function()
            local threads = (contract.get("kickside.core:threads") :: any):with_actor(owner):with_scope(security.named_scope(PROCESS_SCOPE)):open()
            local created, created_err = threads:upsert({ thread_class = "automation", external_ref = "sync-kind:" .. uuid.v4(), title = "Upstream" })
            test.is_nil(created_err, tostring(created_err))
            local thread_id = tostring(created.thread_id)
            local installed, err = install(declaration({ trigger = { v = 2, source = "app.fixture:record_arrived",
                config = { thread_id = thread_id }, backfill = "none" } }))
            test.is_nil(err, tostring(err))
            local main = read_drive((installed :: Map).id, "main") :: Map
            test.eq(main.source_kind, "event")
            test.eq(main.source_thread_id, thread_id)
            test.eq(main.action.event_type, "app.fixture.events:record.arrived")
            local _, scheduled_err = install(declaration({ trigger = { v = 2, source = "app.fixture:record_arrived",
                config = { thread_id = thread_id }, backfill = "all", schedule = { type = "interval", expression = "1h" } } }))
            test.contains(tostring(scheduled_err), "schedule does not apply")
        end)

        test.it("rejects a one-shot trigger schedule and a pass-through gap", function()
            local _, once_err = install(declaration({ trigger = { v = 2, source = "app.fixture:records",
                schedule = { type = "once", expression = "2026-01-01T00:00:00Z" }, backfill = "all" } }))
            test.contains(tostring(once_err), "schedule.type")
            local _, gap_err = install(declaration({ trigger = { v = 2, source = "app.fixture:titled_records",
                schedule = { type = "interval", expression = "1h" }, backfill = "none" }, sink_port = "app.fixture:content_store" }))
            test.ok(errors.is(gap_err, errors.INVALID), tostring(gap_err))
            test.contains(tostring(gap_err), "content")
        end)

        test.it("refuses a transform whose resource use cannot be enforced at install and reconfigure", function()
            local opaque = { kind = "func", ["function"] = "app.fixture:round_transform" }
            local refused, install_err = install(declaration({ transform = opaque }))
            test.is_nil(refused)
            test.ok(errors.is(install_err, errors.INVALID), tostring(install_err))
            test.contains(tostring(install_err), "declares no enforceable resources")
            local installed = install_ok(declaration()) :: Map
            local moved, reconfigure_err = exec:call(MANAGE, { action = "reconfigure", id = installed.id,
                input = declaration({ transform = opaque }) })
            test.is_nil(moved)
            test.contains(tostring(reconfigure_err), "declares no enforceable resources")
            test.eq((read_drive(installed.id, "main") :: Map).applied.declaration.transform.kind, "none")

            local resource = uuid.v7()
            local declared = install_ok(declaration({ transform = { kind = "func", ["function"] = "app.fixture:round_transform",
                resource_id = resource } })) :: Map
            local applied = (read_drive(declared.id, "main") :: Map).applied.declaration.transform
            test.eq(applied.kind, "func")
            test.eq(applied.resource_id, resource)
        end)
    end)

    test.describe("kickside.sync reconfigure", function()
        test.it("refuses opaque edits without holding a source change pending", function()
            local transform = { kind = "func", ["function"] = "app.fixture:round_transform",
                resource_id = uuid.v7(), config = { resource = "first" } }
            local installed = install_ok(declaration({ transform = transform }))
            local threads = (contract.get("kickside.core:threads") :: any):with_actor(owner):with_scope(security.named_scope(PROCESS_SCOPE)):open()
            local created, create_err = threads:upsert({ thread_class = "fixture", impl_id = "app.fixture:record_feed",
                external_ref = "source-change:" .. uuid.v4(), title = "Source" })
            test.is_nil(create_err, tostring(create_err))
            local service = (contract.get("kickside.component:component_service") :: any):with_actor(owner):with_scope(security.named_scope(PROCESS_SCOPE)):open()
            local granted, grant_err = service:grant_subtree({ root_component_id = tostring(created.thread_id),
                subject = { subject_id = security.actor():id(), subject_type = "user" }, access_mask = 1 })
            test.is_nil(grant_err, tostring(grant_err))
            test.is_true(granted.success)
            manage({ action = "pause", id = installed.id })
            manage({ action = "resume", id = installed.id })
            local before = read_drive(installed.id, "main") :: Map
            test.eq(before.phase, "active")
            local changed = declaration({ trigger = { v = 2, source = "app.fixture:record_arrived",
                config = { thread_id = tostring(created.thread_id) }, backfill = "none" },
                transform = { kind = transform.kind, ["function"] = transform["function"],
                    resource_id = transform.resource_id, config = { resource = "second" } } })
            local result, err = funcs.new():call(MANAGE, { action = "reconfigure", id = installed.id, input = changed })
            test.is_nil(result)
            test.not_nil(err)
            test.ok(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
            test.contains(tostring(err), "execution subject")
            local after = read_drive(installed.id, "main") :: Map
            test.is_nil(after.pending_command_id)
            test.eq(after.phase, before.phase)
            test.eq(after.source_kind, before.source_kind)
            test.eq(after.applied.declaration.transform.config.resource, "first")
            manage({ action = "uninstall", id = installed.id })
        end)

        test.it("keeps shared pure edits and refuses opaque configuration edits", function()
            local transform = { kind = "func", ["function"] = "app.fixture:round_transform",
                resource_id = uuid.v7(), config = { nested = { resource = "first" } } }
            local installed = install_ok(declaration({ transform = transform }))
            local shared = funcs.new()
            local pure, pure_err = shared:call(MANAGE, { action = "reconfigure", id = installed.id,
                input = declaration({ title = "Renamed", transform = transform }) })
            test.is_nil(pure_err, tostring(pure_err))
            test.not_nil(pure)
            manage({ action = "pause", id = installed.id })
            manage({ action = "resume", id = installed.id })
            local before = read_drive(installed.id, "main") :: Map
            test.eq(before.phase, "active")
            local changed = { kind = transform.kind, ["function"] = transform["function"],
                resource_id = transform.resource_id, config = { nested = { resource = "second" } } }
            local result, err = shared:call(MANAGE, { action = "reconfigure", id = installed.id,
                input = declaration({ transform = changed }) })
            test.is_nil(result)
            test.not_nil(err)
            test.ok(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
            test.contains(tostring(err), "execution subject")
            local main = read_drive(installed.id, "main") :: Map
            test.eq(main.applied.declaration.transform.config.nested.resource, "first")
            test.is_true(main.enabled)
            test.eq(main.phase, before.phase)
            test.is_nil(main.pending_command_id)
            local accepted, subject_err = exec:call(MANAGE, { action = "reconfigure", id = installed.id,
                input = declaration({ transform = changed }) })
            test.is_nil(subject_err, tostring(subject_err))
            test.not_nil(accepted)
            test.eq((read_drive(installed.id, "main") :: Map).applied.declaration.transform.config.nested.resource, "second")
            manage({ action = "uninstall", id = installed.id })
        end)

        test.it("accepts an unchanged event source when editing title and transform, and refuses an invalid source change", function()
            local threads = (contract.get("kickside.core:threads") :: any):with_actor(owner):with_scope(security.named_scope(PROCESS_SCOPE)):open()
            local created, create_err = threads:upsert({ thread_class = "fixture", impl_id = "app.fixture:record_feed", external_ref = "sync-edit:" .. uuid.v4(), title = "Source" })
            test.is_nil(create_err, tostring(create_err))
            local trigger = { v = 2, source = "app.fixture:record_arrived",
                config = { thread_id = tostring(created.thread_id) }, backfill = "none" }
            local input = declaration({ trigger = trigger, enabled = false })
            local installed = install_ok(input)
            local original = read_drive(installed.id, "main") :: Map
            local appended, append_err = threads:append_event({ thread_id = tostring(created.thread_id),
                event = { type = "app.fixture.events:record.arrived", role = "user", body = { title = "Pending record" } } })
            test.is_nil(append_err, tostring(append_err))
            test.not_nil(appended)
            local changed = declaration({ trigger = trigger, enabled = false, title = "Edited event sync",
                transform = { kind = "expr", expr = "{ title: payload.title }" } })
            for _ = 1, 2 do
                local applied = manage({ action = "reconfigure", id = installed.id, input = changed })
                test.is_true(applied.success, tostring(applied.error))
                local current = read_drive(installed.id, "main") :: Map
                test.eq(current.source_kind, "event")
                test.eq(current.source_thread_id, original.source_thread_id)
                test.eq(current.action.event_type, original.action.event_type)
                test.eq(current.action.source_ref, original.action.source_ref)
                test.eq(current.event_seq, original.event_seq)
                test.eq(current.applied.declaration.title, "Edited event sync")
                test.eq(current.applied.declaration.transform.expr, "{ title: payload.title }")
            end
            local invalid_trigger = { v = 2, source = trigger.source, config = trigger.config,
                backfill = "none", schedule = { type = "interval", expression = "1h" } }
            local refused, change_err = exec:call(MANAGE, { action = "reconfigure", id = installed.id,
                input = declaration({ trigger = invalid_trigger, enabled = false }) })
            test.is_nil(refused)
            test.contains(tostring(change_err), "schedule does not apply")
            test.eq((read_drive(installed.id, "main") :: Map).applied.declaration.title, "Edited event sync")
        end)

        test.it("carries the new source through the declaration command and follows the declared enablement", function()
            local installed = install_ok(declaration()) :: Map
            local changed = declaration({ trigger = { v = 2, source = "app.fixture:records", config = { folder = "b" },
                schedule = { type = "interval", expression = "3h" }, backfill = "all", poll = { page_size = 7 } }, enabled = false })
            local result = manage({ action = "reconfigure", id = installed.id, input = changed })
            test.is_true(result.success, tostring(result.error))
            local main = read_drive(installed.id, "main") :: Map
            test.eq(main.action.schedule.expression, "3h")
            test.eq(main.action.config.folder, "b")
            test.eq(main.applied.declaration.trigger.schedule.expression, "3h")
            test.eq(main.enabled, false)
            test.eq(main.phase, drive.PHASE.PAUSED)
            test.eq(main.command_generation, 2)
            local state = automations_lib.read_state(installed.id) :: Map
            test.eq(state.source.config.folder, "b")
            test.eq(state.enabled, false)
            local public = automations_lib.read_public_state(installed.id) :: Map
            test.eq(public.schedule_expression, "3h")
            test.eq(public.status, "paused")
        end)

        test.it("refuses a destination or reconcile change", function()
            local installed = install_ok(declaration()) :: Map
            local moved, move_err = exec:call(MANAGE, { action = "reconfigure", id = installed.id,
                input = declaration({ sink_port = "app.fixture:store" }) })
            test.is_nil(moved)
            test.not_nil(move_err)
            test.contains(tostring(move_err), "destination")
        end)
    end)

    test.describe("kickside.sync generic controls", function()
        test.it("pauses and resumes every drive through the engine", function()
            local installed = install_ok(declaration({ trigger = { v = 2, source = "app.fixture:keyed_records",
                schedule = { type = "interval", expression = "1h" }, backfill = "all" }, reconcile = true })) :: Map
            test.is_true(manage({ action = "pause", id = installed.id }).success)
            test.eq((read_drive(installed.id, "main") :: Map).phase, drive.PHASE.PAUSED)
            test.eq((read_drive(installed.id, "reconcile") :: Map).phase, drive.PHASE.PAUSED)
            test.is_true(manage({ action = "resume", id = installed.id }).success)
            test.eq((read_drive(installed.id, "main") :: Map).enabled, true)
            test.eq((read_drive(installed.id, "reconcile") :: Map).enabled, true)
        end)
    end)

    test.describe("kickside.sync:pass-through requirements", function()
        local SOURCE = { id = "ns:records", output_schema = { type = "object", properties = { title = { type = "string" } } } }
        local SINK = {
            id = "ns:store",
            input_schema = { type = "object", required = { "content" }, properties = { content = { type = "string" } } },
            config_schema = { content = { type = "string", supplies = "content" } },
        }

        test.it("accepts the Jira content payload for an inbox pass-through", function()
            local source: any = registry.get("kickside.atlassian.jira.source:issues")
            local sink: any = registry.get("kickside.inbox.sink:inbox_item")
            test.not_nil(source)
            test.not_nil(sink)
            local schema: any = json.decode(source.data.output_schema)
            local input: any = json.decode(sink.data.input_schema)
            test.is_nil(sync.passthrough_gap({ output_schema = schema }, { input_schema = input }, { kind = "none" }, {}))
            test.not_nil(schema.properties.content)
            test.not_nil(schema.properties.issue_priority)
            test.is_nil(schema.properties.priority)
            test.is_nil(schema.properties.payload)
        end)

        test.it("refuses a pass-through whose items cannot carry what the destination requires", function()
            test.contains(tostring(sync.passthrough_gap(SOURCE, SINK, { kind = "none" }, {})), "content")
        end)

        test.it("accepts it once the destination configuration supplies the field", function()
            test.is_nil(sync.passthrough_gap(SOURCE, SINK, { kind = "none" }, { content = "Uploaded" }))
        end)

        test.it("accepts a source that carries the field, a mapping transform, and an undeclared source face", function()
            local carrying = { id = "ns:records", output_schema = { type = "object", properties = { content = { type = "string" } } } }
            test.is_nil(sync.passthrough_gap(carrying, SINK, { kind = "none" }, {}))
            test.is_nil(sync.passthrough_gap(SOURCE, SINK, { kind = "expr", expr = "{ content: payload.title }" }, {}))
            test.is_nil(sync.passthrough_gap({ id = "ns:records" }, SINK, { kind = "none" }, {}))
        end)
    end)

    test.describe("kickside.sync:when label", function()
        test.it("reads an events source as what it waits for", function()
            test.eq(sync.when_label({ v = 2, source = "kickside.uploads:upload_completed" }, "Upload Completed"), "On upload completed")
        end)

        test.it("reads a cadence in words", function()
            for _, case in ipairs({
                { "interval", "15m", "Every 15 min" },
                { "ticker", "1h", "Every 1 hour" },
                { "interval", "2h", "Every 2 hours" },
                { "interval", "30s", "Every 30 sec" },
                { "interval", "1d", "Every 1 day" },
                { "cron", "0 9 * * *", "On schedule (0 9 * * *)" },
            }) do
                local label = sync.when_label({ v = 2, source = "ns:records", schedule = { type = case[1], expression = case[2] } }, "Records")
                test.eq(label, case[3], case[1] .. " " .. case[2])
            end
        end)
    end)
  end)
end

return test.run_cases(define_tests)
