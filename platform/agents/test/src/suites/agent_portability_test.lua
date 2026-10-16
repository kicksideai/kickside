-- End-to-end portability round-trip for an agent, run exactly as the transfer
-- orchestrator runs it for a shell-only kind: component_service.export emits the
-- portable shell envelope, component_service.import reconstructs a fresh component from
-- it. Agents carry no backing data (no projection, no scheduler), so this is the whole
-- path. It asserts the security model end to end: the declared context carries, an
-- unlisted key is dropped, the memory_target_id reference travels as a re-bindable slot
-- (never raw), and on import that slot remaps through the id_map.

local test = require("test")
local sql = require("sql")
local json = require("json")
local uuid_v4 = require("uuid").v4
local security = require("security")
local contract = require("contract")

local IMPL_ID = "kickside.agents:user_agent"
local SERVICE = "kickside.component:component_service"
local OWNER = "agent_port_owner"

local function service(): any
    local actor = security.new_actor(OWNER, {})
    local scope = security.named_scope("wippy.security:process")
    local def, err = contract.get(SERVICE)
    if err or not def then error("component_service unavailable: " .. tostring(err)) end
    return (def :: any):with_actor(actor):with_scope(scope):open()
end

local function define_tests()
    test.describe("agent portability round-trip", function()
        local db: any = nil
        local src = uuid_v4()
        local dst: string? = nil

        test.before_all(function()
            db = sql.get("app:db")
            test.not_nil(db)
        end)

        test.after_all(function()
            if db then
                for _, cid in ipairs({ src, dst }) do
                    if cid then
                        db:execute("DELETE FROM kickside_component_access WHERE component_id = $1", { cid })
                        db:execute("DELETE FROM kickside_component_meta WHERE component_id = $1", { cid })
                        db:execute("DELETE FROM kickside_components WHERE component_id = $1", { cid })
                    end
                end
                db:release()
            end
        end)

        test.it("exports a secret-free shell and re-imports with the ref remapped", function()
            local private_ctx = {
                prompt = "You are the source agent.", model = "class:fast",
                temperature = 0.5, max_tokens = 2048, traits = {}, tools = {},
                memory_target_id = "src-kb-123",          -- a ref: travels as a slot, not raw
                delegates = { "should-not-travel" },   -- not in portable_schema.context: dropped
            }
            local _, e1 = db:execute(
                [[INSERT INTO kickside_components (component_id, impl_id, private_context, created_at, updated_at)
                  VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)]],
                { src, IMPL_ID, json.encode(private_ctx) })
            test.is_nil(e1)
            for _, m in ipairs({ { "title", "Source Agent" }, { "description", "src desc" }, { "class", "agent" }, { "model", "class:fast" } }) do
                local _, em = db:execute(
                    [[INSERT INTO kickside_component_meta (meta_id, component_id, key, value, created_at, updated_at)
                      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)]], { uuid_v4(), src, m[1], m[2] })
                test.is_nil(em)
            end
            local _, ea = db:execute(
                [[INSERT INTO kickside_component_access (access_id, subject_id, component_id, source_component_id, subject_type, access_mask, created_at)
                  VALUES ($1, $2, $3, $4, 'user', 15, CURRENT_TIMESTAMP)]], { uuid_v4(), OWNER, src, src })
            test.is_nil(ea)

            local svc = service()

            -- export shell
            local exp = svc:export({ component_id = src })
            test.not_nil(exp)
            test.is_true(exp.success, "export failed: " .. tostring(exp and exp.error))
            local env = json.decode(tostring((exp :: any).shell))
            test.eq(env.context.prompt, "You are the source agent.")
            test.eq(env.context.model, "class:fast")
            test.is_nil(env.context.memory_target_id, "ref must not travel as raw context")
            test.is_nil(env.context.delegates, "unlisted context key must be dropped")
            local has_ref_slot = false
            for _, s in ipairs(env.slots or {}) do
                if (s :: any).key == "memory_target_id" then has_ref_slot = true end
            end
            test.is_true(has_ref_slot, "memory_target_id ref slot missing from envelope")

            -- import shell, remapping the ref through the id_map
            local imp = svc:import({
                shell = exp.shell,
                slot_values = { memory_target_id = "src-kb-123" },
                id_map = { components = { ["src-kb-123"] = "new-kb-999" } },
            })
            test.not_nil(imp)
            test.is_true(imp.success, "import failed: " .. tostring(imp and imp.error))
            dst = imp.component_id
            test.not_nil(dst)

            -- reconstructed context: declared keys carried, ref remapped, nothing leaked
            local rows = db:query("SELECT private_context FROM kickside_components WHERE component_id = $1", { dst })
            test.eq(#rows, 1)
            local ctx = json.decode(tostring((rows[1] :: any).private_context))
            test.eq(ctx.prompt, "You are the source agent.")
            test.eq(ctx.model, "class:fast")
            test.eq(tonumber(ctx.max_tokens), 2048)
            test.eq(ctx.memory_target_id, "new-kb-999")
            test.is_nil(ctx.delegates, "dropped key must not reappear on import")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
