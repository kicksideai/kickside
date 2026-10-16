-- A component share grants READ; reading an agent's editable config is a read.
-- user_agents.get succeeds for a READ-granted recipient and stays fail-closed
-- for a stranger, while user_agents.update keeps requiring WRITE. Drives the
-- real binding under distinct actors via the shared-read probe.

local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local time = require("time")
local funcs = require("funcs")
local security = require("security")

local AGENTS_NS = "kickside.agents.registry"
local PROBE = "app:user_agents_shared_read_probe"
local PROC_SCOPE = "wippy.security:process"
local ACCESS_READ = 1

local function new_executor(user_id: string): any
    local actor: any = security.new_actor(user_id, {})
    local scope: any = security.named_scope(PROC_SCOPE)
    return funcs.new():with_actor(actor):with_scope(scope)
end

local function define_tests()
    test.describe("user_agents shared read access", function()
        local db: any
        local suffix = uuid.v4():sub(1, 8)
        local owner = "shared-read-owner-" .. suffix
        local recipient = "shared-read-recipient-" .. suffix
        local stranger = "shared-read-stranger-" .. suffix
        local created: { string } = {}

        test.before_all(function()
            db = sql.get("app:db")
            test.not_nil(db)
        end)

        test.after_all(function()
            if db then
                for _, cid in ipairs(created) do
                    db:execute("DELETE FROM kickside_component_access WHERE component_id = $1", { cid })
                    db:execute("DELETE FROM kickside_component_meta WHERE component_id = $1", { cid })
                    db:execute("DELETE FROM kickside_components WHERE component_id = $1", { cid })
                end
                db:release()
            end
        end)

        local function grant(cid: string, subject: string, mask: number)
            local _, err = sql.builder.insert("kickside_component_access")
                :set_map({
                    access_id = uuid.v7(),
                    component_id = cid,
                    source_component_id = cid,
                    subject_id = subject,
                    subject_type = "user",
                    access_mask = mask,
                    created_at = time.now():format(time.RFC3339),
                })
                :run_with(db):exec()
            test.is_nil(err, "grant: " .. tostring(err))
        end

        test.it("READ share reads the agent config, WRITE stays required to change it", function()
            local name = "shared_read_agent_" .. suffix
            local reg, err = new_executor(owner):call(AGENTS_NS .. ":a_create", {
                name = name,
                prompt = "Shared prompt.",
                model = "claude-4-5-sonnet",
                temperature = 0.5,
                tools = { "app:public_tool_probe" },
            })
            test.is_nil(err, "a_create: " .. tostring(err))
            test.not_nil(reg)
            local cid = reg.component_id :: string
            created[#created + 1] = cid

            grant(cid, recipient, ACCESS_READ)

            local probe, perr = new_executor(recipient):call(PROBE, { op = "get", component_id = cid })
            test.is_nil(perr, "probe: " .. tostring(perr))
            test.is_true(probe.ok, tostring(probe and probe.error))
            test.is_true(probe.result.success, tostring(probe.result and probe.result.error))
            test.eq(probe.result.agent.title, name)
            test.eq((probe.result.agent.tools or {})[1], "app:public_tool_probe")

            local denied, derr = new_executor(recipient):call(PROBE, {
                op = "update", component_id = cid, patch = { prompt = "Rewritten." },
            })
            test.is_nil(derr, "probe: " .. tostring(derr))
            test.is_nil(denied.result)
            test.eq(denied.kind, errors.PERMISSION_DENIED)

            local unshared, serr = new_executor(stranger):call(PROBE, { op = "get", component_id = cid })
            test.is_nil(serr, "probe: " .. tostring(serr))
            test.is_false(unshared.result.success == true)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
