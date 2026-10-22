-- Integration coverage for kickside.automation.agent:automations_manage, driven
-- through a real funcs call under a real actor + scope so it exercises the
-- same path the MCP dispatcher uses: install -> read_config roundtrip (via the
-- sibling read tool), pause/resume, run, reconfigure, and uninstall against a
-- real installed fixture automation (kickside.automation.agent.fixture) -- not
-- a mocked automations_lib.

local test = require("test")
local funcs = require("funcs")
local security = require("security")
local uuid = require("uuid")

local MANAGE_TOOL = "kickside.automation.agent:automations_manage"
local READ_TOOL = "kickside.automation.agent:automations_read"
local FIXTURE_TYPE = "kickside.automation.agent.fixture:automation_type"
local FIXTURE_TYPE_TRIGGER_RUN = "kickside.automation.agent.fixture:automation_type_trigger_run"
local FIXTURE_TYPE_NO_RUN = "kickside.automation.agent.fixture:automation_type_no_run"
local PROC_SCOPE = "wippy.security:process"

type Map = { [string]: any }

local function executor(user_id: string): any
    local actor: any = security.new_actor(user_id, {})
    local scope: any = security.named_scope(PROC_SCOPE)
    return funcs.new():with_actor(actor):with_scope(scope)
end

local function define_tests()
    test.describe("AutomationsManage tool", function()
        local owner = "automations_manage_test_" .. uuid.v4()

        test.it("rejects a call whose actor carries no identity", function()
            local result, err = executor(""):call(MANAGE_TOOL, { action = "pause", id = "any" })
            test.is_nil(result)
            test.not_nil(err)
            test.is_true(tostring(err):find("authentication", 1, true) ~= nil,
                "the refusal is authentication, not action dispatch: " .. tostring(err))
        end)

        test.it("rejects an unknown action", function()
            local result, err = executor(owner):call(MANAGE_TOOL, { action = "not_a_real_action" })
            test.is_nil(result)
            test.not_nil(err)
            test.is_true(tostring(err):find("unknown action", 1, true) ~= nil)
        end)

        test.it("rejects install with no type", function()
            local result, err = executor(owner):call(MANAGE_TOOL, { action = "install" })
            test.is_nil(result)
            test.not_nil(err)
            test.is_true(tostring(err):find("type is required", 1, true) ~= nil)
        end)

        test.it("rejects an action call that misses one of its required fields", function()
            local cases = {
                { args = { action = "install", type = FIXTURE_TYPE }, message = "input is required for action=install" },
                { args = { action = "reconfigure", id = "a1" }, message = "input is required for action=reconfigure" },
                { args = { action = "pause" }, message = "id is required for action=pause" },
                { args = { action = "call", id = "a1" }, message = "method is required for action=call" },
                { args = { action = "import" }, message = "artifact is required for action=import" },
                { args = { action = "set_execution_identity", id = "a1", principal = { kind = "user", id = owner },
                    expected_identity_generation = 0 }, message = "request_id is required for action=set_execution_identity" },
                { args = { action = "control", id = "a1" }, message = "control is required for action=control" },
            }
            for _, case in ipairs(cases) do
                local result, err = executor(owner):call(MANAGE_TOOL, case.args)
                test.is_nil(result, case.message)
                test.is_true(errors.is(err, errors.INVALID), case.message .. ": " .. tostring(err))
                test.contains(tostring(err), case.message)
            end
        end)

        test.it("rejects fields that belong to another action", function()
            local cases = {
                { args = { action = "pause", id = "a1", input = {} }, message = "action=pause does not accept input" },
                { args = { action = "install", type = FIXTURE_TYPE, input = {}, id = "a1" }, message = "action=install does not accept id" },
                { args = { action = "uninstall", id = "a1", control = "replay" }, message = "action=uninstall does not accept control" },
                { args = { action = "control", id = "a1", control = "pause", principal = { kind = "user", id = owner } },
                    message = "action=control does not accept principal" },
            }
            for _, case in ipairs(cases) do
                local result, err = executor(owner):call(MANAGE_TOOL, case.args)
                test.is_nil(result, case.message)
                test.is_true(errors.is(err, errors.INVALID), case.message .. ": " .. tostring(err))
                test.contains(tostring(err), case.message)
            end
        end)

        test.it("requires request_id for replay, resync and discard, and keys for discard", function()
            local exec = executor(owner)
            for _, control in ipairs({ "replay", "resync", "discard" }) do
                local result, err = exec:call(MANAGE_TOOL, { action = "control", id = "a1", control = control })
                test.is_nil(result, control)
                test.is_true(errors.is(err, errors.INVALID), control .. ": " .. tostring(err))
                test.contains(tostring(err), control .. " requires a request_id")
            end

            local installed = exec:call(MANAGE_TOOL, {
                action = "install",
                type = FIXTURE_TYPE_NO_RUN,
                input = { title = "Discard Keys Fixture" },
            }) :: Map
            test.is_true(installed.success, "install failed: " .. tostring(installed.error))
            local id = installed.id :: string
            for _, keys in ipairs({ {}, false }) do
                local args: Map = { action = "control", id = id, control = "discard", drive_key = "main", request_id = uuid.v7() }
                if keys then args.keys = keys end
                local result, err = exec:call(MANAGE_TOOL, args)
                test.is_nil(result)
                test.is_true(errors.is(err, errors.INVALID), tostring(err))
                test.contains(tostring(err), "discard names the uncertain item keys")
            end
            exec:call(MANAGE_TOOL, { action = "uninstall", id = id })
        end)

        test.it("installs, reads config back, pauses, resumes, runs, reconfigures, and uninstalls a fixture automation", function()
            local exec = executor(owner)

            local installed, install_err = exec:call(MANAGE_TOOL, {
                action = "install",
                type = FIXTURE_TYPE,
                input = { title = "Agent Fixture A", install_only = { keep = "me" } },
            })
            test.is_nil(install_err, "install returned a transport error: " .. tostring(install_err))
            local install_result = installed :: Map
            test.is_true(install_result.success, "install failed: " .. tostring(install_result.error))
            test.eq(install_result.type, FIXTURE_TYPE)
            local id = install_result.id :: string
            test.eq(type(id), "string")
            test.is_true(id ~= "")

            -- manage.install -> read.read_config roundtrip
            local read_back, read_err = exec:call(READ_TOOL, { action = "read_config", id = id })
            test.is_nil(read_err, "read_config returned a transport error: " .. tostring(read_err))
            local read_result = read_back :: Map
            test.is_true(read_result.success, "read_config failed: " .. tostring(read_result.error))
            test.eq(read_result.id, id)
            local config = read_result.config :: Map
            test.eq(config.title, "Agent Fixture A")
            local portable = config._portable_input :: Map
            test.not_nil(portable, "exportable fixture should carry _portable_input")
            test.eq(portable.title, "Agent Fixture A")

            -- pause / resume
            local paused, pause_err = exec:call(MANAGE_TOOL, { action = "pause", id = id })
            test.is_nil(pause_err, "pause returned a transport error: " .. tostring(pause_err))
            local pause_result = paused :: Map
            test.is_true(pause_result.success, "pause envelope failed: " .. tostring(pause_result.error))
            test.eq(pause_result.method, "pause")
            local pause_inner = pause_result.result :: Map
            test.eq(pause_inner.state, "succeeded")
            test.is_true(pause_inner.outcome.changed)
            local paused_state = exec:call(READ_TOOL, { action = "status", id = id }) :: Map
            local paused_main: Map? = nil
            for _, drive in ipairs(paused_state.drives :: { Map }) do
                if drive.drive_key == "main" then paused_main = drive end
            end
            test.not_nil(paused_main)
            test.eq((paused_main :: Map).phase, "paused")
            test.is_false((paused_main :: Map).enabled)

            local resumed, resume_err = exec:call(MANAGE_TOOL, { action = "resume", id = id })
            test.is_nil(resume_err, "resume returned a transport error: " .. tostring(resume_err))
            local resume_result = resumed :: Map
            test.is_true(resume_result.success, "resume envelope failed: " .. tostring(resume_result.error))
            local resume_inner = resume_result.result :: Map
            test.eq(resume_inner.state, "succeeded")
            test.is_true(resume_inner.outcome.changed)
            local resumed_state = exec:call(READ_TOOL, { action = "status", id = id }) :: Map
            local resumed_main: Map? = nil
            for _, drive in ipairs(resumed_state.drives :: { Map }) do
                if drive.drive_key == "main" then resumed_main = drive end
            end
            test.not_nil(resumed_main)
            test.eq((resumed_main :: Map).phase, "active")
            test.is_true((resumed_main :: Map).enabled)

            -- MCP run wakes the drive through the same engine control the
            -- catalog and UI offer, rather than executing a kind method.
            local ran, run_err = exec:call(MANAGE_TOOL, { action = "run", id = id })
            test.is_nil(run_err, "run returned a transport error: " .. tostring(run_err))
            local run_result = ran :: Map
            test.is_true(run_result.success, "run envelope failed: " .. tostring(run_result.error))
            test.eq(run_result.method, "run_now")
            local run_inner = run_result.result :: Map
            test.eq(run_inner.state, "succeeded")
            test.is_true(run_inner.outcome.changed)

            -- reconfigure edits the stored (portable) input in place. Title is not a
            -- reconfigure field (that goes through the separate rename endpoint), so
            -- the engine keeps _portable_input.title pinned to the live component
            -- title regardless of what reconfigure's input carries.
            local reconfigured, reconfigure_err = exec:call(MANAGE_TOOL, {
                action = "reconfigure",
                id = id,
                input = { title = "Agent Fixture A", note = "edited" },
            })
            test.is_nil(reconfigure_err, "reconfigure returned a transport error: " .. tostring(reconfigure_err))
            local reconfigure_result = reconfigured :: Map
            test.is_true(reconfigure_result.success, "reconfigure failed: " .. tostring(reconfigure_result.error))

            local read_back2, read_err2 = exec:call(READ_TOOL, { action = "read_config", id = id })
            test.is_nil(read_err2, "second read_config returned a transport error: " .. tostring(read_err2))
            local read_result2 = read_back2 :: Map
            test.is_true(read_result2.success, "second read_config failed: " .. tostring(read_result2.error))
            local portable2 = (read_result2.config :: Map)._portable_input :: Map
            test.eq(portable2.title, "Agent Fixture A")
            test.eq(portable2.note, "edited")
            -- The reconfigure sent only title+note; every unsent install field
            -- must survive the round-trip. Wholesale replacement is how field
            -- maps and backfill windows silently vanished in production.
            local install_only = (portable2.install_only or {}) :: Map
            test.eq(install_only.keep, "me")

            -- A kind refusal travels as a structured result with err == nil;
            -- the manage tool must surface it as failure, never as success.
            local refused, refuse_err = exec:call(MANAGE_TOOL, {
                action = "reconfigure",
                id = id,
                input = { refuse = true },
            })
            test.is_nil(refused)
            test.not_nil(refuse_err)
            test.contains(tostring(refuse_err), "fixture refused the edit")

            local refused_action, action_err = exec:call(MANAGE_TOOL, {
                action = "call", id = id, method = "execute", args = { refuse = true },
            })
            test.is_nil(refused_action)
            test.is_true(errors.is(action_err, errors.INVALID))
            test.contains(tostring(action_err), "fixture refused the action")

            -- uninstall tears it down; a further read_config must fail
            local uninstalled, uninstall_err = exec:call(MANAGE_TOOL, { action = "uninstall", id = id })
            test.is_nil(uninstall_err, "uninstall returned a transport error: " .. tostring(uninstall_err))
            local uninstall_result = uninstalled :: Map
            test.is_true(uninstall_result.success, "uninstall failed: " .. tostring(uninstall_result.error))
            test.eq(uninstall_result.id, id)
            test.eq(uninstall_result.replay_failed, 0)

            local read_after_delete, delete_read_err = exec:call(READ_TOOL, { action = "read_config", id = id })
            test.is_nil(read_after_delete)
            test.not_nil(delete_read_err)
        end)

        test.it("run wakes a drive even when a type declares trigger", function()
            local exec = executor(owner)
            local installed, install_err = exec:call(MANAGE_TOOL, {
                action = "install",
                type = FIXTURE_TYPE_TRIGGER_RUN,
                input = { title = "Trigger Run Fixture" },
            })
            test.is_nil(install_err, "install returned a transport error: " .. tostring(install_err))
            local install_result = installed :: Map
            test.is_true(install_result.success, "install failed: " .. tostring(install_result.error))
            local id = install_result.id :: string

            local ran, run_err = exec:call(MANAGE_TOOL, { action = "run", id = id })
            test.is_nil(run_err, "run returned a transport error: " .. tostring(run_err))
            local run_result = ran :: Map
            test.is_true(run_result.success, "run envelope failed: " .. tostring(run_result.error))
            test.eq(run_result.method, "run_now")
            local run_inner = run_result.result :: Map
            test.eq(run_inner.state, "succeeded")
            test.is_true(run_inner.outcome.changed)

            exec:call(MANAGE_TOOL, { action = "uninstall", id = id })
        end)

        test.it("call dispatches a declared type action by name with the caller's args", function()
            local exec = executor(owner)
            local installed = exec:call(MANAGE_TOOL, {
                action = "install",
                type = FIXTURE_TYPE_TRIGGER_RUN,
                input = { title = "Call Fixture" },
            }) :: Map
            test.is_true(installed.success, "install failed: " .. tostring(installed.error))
            local id = installed.id :: string

            local called, call_err = exec:call(MANAGE_TOOL, { action = "call", id = id, method = "trigger", args = { reason = "operator" } })
            test.is_nil(call_err)
            local call_result = called :: Map
            test.is_true(call_result.success, "call envelope failed: " .. tostring(call_result.error))
            test.eq(call_result.method, "trigger")
            test.is_true((call_result.result :: Map).ran)

            local missing, missing_err = exec:call(MANAGE_TOOL, { action = "call", id = id })
            test.is_nil(missing)
            test.not_nil(missing_err)
            test.contains(tostring(missing_err), "method")

            exec:call(MANAGE_TOOL, { action = "uninstall", id = id })
        end)

        test.it("run wakes a drive without a declared manual action", function()
            local exec = executor(owner)
            local installed, install_err = exec:call(MANAGE_TOOL, {
                action = "install",
                type = FIXTURE_TYPE_NO_RUN,
                input = { title = "No Run Fixture" },
            })
            test.is_nil(install_err, "install returned a transport error: " .. tostring(install_err))
            local install_result = installed :: Map
            test.is_true(install_result.success, "install failed: " .. tostring(install_result.error))
            local id = install_result.id :: string

            local catalog, catalog_err = exec:call(READ_TOOL, { action = "type", id = FIXTURE_TYPE_NO_RUN })
            test.is_nil(catalog_err, tostring(catalog_err))
            local catalog_row: Map? = (catalog :: Map).type
            test.not_nil(catalog_row)
            test.eq(#(catalog_row :: Map).controls, 6, "MCP types shares engine controls")

            local ran, run_err = exec:call(MANAGE_TOOL, { action = "run", id = id })
            test.is_nil(run_err, "run returned a transport error: " .. tostring(run_err))
            local run_result = ran :: Map
            test.is_true(run_result.success, tostring(run_result.error))
            test.eq(run_result.method, "run_now")
            test.eq((run_result.result :: Map).state, "succeeded")

            exec:call(MANAGE_TOOL, { action = "uninstall", id = id })
        end)

        test.it("run reports a clear error for an unknown automation id", function()
            local result, err = executor(owner):call(MANAGE_TOOL, { action = "run", id = "not-a-real-id-" .. uuid.v4() })
            test.is_nil(result)
            test.not_nil(err)
            test.is_true(tostring(err):find("automation not found", 1, true) ~= nil)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

return { run = function(options: any): any return run_cases(options) end }
