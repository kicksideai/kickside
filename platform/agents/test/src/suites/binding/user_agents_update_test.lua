-- Defect: user_agents.update merged the new fields against the stored context, but
-- ignored the context-read error and merged against {} on failure -- persisting the
-- agent with a wiped prompt/model/capabilities on a transient error. Correct
-- behavior: a context-read error ABORTS the update and leaves the stored agent
-- unchanged. Driven through the wipe probe, which forces the context read to fail.

local test = require("test")
local sql = require("sql")
local uuid_v4 = require("uuid").v4
local funcs = require("funcs")
local security = require("security")
local user_agents = require("user_agents")

local AGENTS_NS = "kickside.agents.registry"
local WIPE_PROBE = "app:user_agents_update_wipe_probe"
local PROC_SCOPE = "wippy.security:process"

local function new_executor(user_id: string): any
    local actor: any = security.new_actor(user_id, {})
    local scope: any = security.named_scope(PROC_SCOPE)
    return funcs.new():with_actor(actor):with_scope(scope)
end

local function define_tests()
    test.describe("user_agents.update context-read failure", function()
        local db: any
        local owner = "wipe_test_owner"
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

        test.it("keeps delegate metadata untouched for a palette-only patch", function()
            local palette = user_agents.update_meta_fields({ palette_hidden = true })
            test.is_true(palette.palette_hidden)
            test.is_nil(palette.delegate_count)
            local delegated = user_agents.update_meta_fields({ delegates = { "a", "b" } })
            test.eq(delegated.delegate_count, 2)
        end)

        test.it("keeps discovery private by default and accepts only boolean public", function()
            local omitted = user_agents.discovery_meta_fields({})
            test.is_nil(omitted.public)
            test.is_true(user_agents.discovery_meta_fields({ public = true }).public)
            test.is_false(user_agents.discovery_meta_fields({ public = false }).public)
            test.is_false(user_agents.discovery_meta_fields({ public = "true" }).public)
            test.is_false(user_agents.discovery_meta_fields({ public = 1 }).public)
        end)

        test.it("validates explicit capability ids fail-closed", function()
            local ok, err = user_agents.validate_entry_ids({ "app:public_trait_probe" }, "trait")
            test.is_true(ok)
            test.is_nil(err)
            ok, err = user_agents.validate_entry_ids({ "app:public_tool_probe" }, "tool")
            test.is_true(ok)
            test.is_nil(err)

            ok, err = user_agents.validate_entry_ids({ "app:internal_trait_probe" }, "trait")
            test.is_false(ok)
            test.ok((tostring(err):find("not public", 1, true)))
            ok, err = user_agents.validate_entry_ids({ "app:wrong_kind_tool_probe" }, "tool")
            test.is_false(ok)
            test.ok((tostring(err):find("invalid registry shape", 1, true)))
            ok, err = user_agents.validate_entry_ids({ "keeper.hub.tools:dependencies" }, "tool")
            test.is_false(ok)
            test.ok((tostring(err):find("not found", 1, true)))
        end)

        test.it("aborts and leaves the stored config unchanged (no wipe)", function()
            local exec = new_executor(owner)
            local reg, err = exec:call(AGENTS_NS .. ":a_create", {
                name = "wipe_probe_agent_" .. uuid_v4():sub(1, 8),
                prompt = "Original prompt.",
                model = "claude-4-5-sonnet",
                tools = { "app:public_tool_probe" },
                temperature = 0.7,
            })
            test.is_nil(err, "a_create: " .. tostring(err))
            test.not_nil(reg)
            local cid = reg.component_id :: string
            created[#created + 1] = cid

            local probe, perr = exec:call(WIPE_PROBE, { component_id = cid })
            test.is_nil(perr, "wipe probe: " .. tostring(perr))
            test.not_nil(probe)
            test.is_true(probe.ok, tostring(probe and probe.error))

            -- The update surfaces the error instead of succeeding.
            test.is_nil(probe.result)
            test.eq(probe.kind, errors.UNKNOWN)
            test.contains(probe.error, "transient context read failure")

            -- The stored private_context is untouched: prompt, model, tools all survive.
            local after: any = probe.after or {}
            test.eq(after.prompt, "Original prompt.")
            test.eq(after.model, "claude-4-5-sonnet")
            test.eq((after.tools or {})[1], "app:public_tool_probe")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

return { run = function(options: any): any return run_cases(options) end }
