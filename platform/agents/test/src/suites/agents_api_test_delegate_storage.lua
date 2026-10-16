local test = require("test")
local sql = require("sql")
local json = require("json")
local uuid_v4 = require("uuid").v4
local registry = require("registry")

local IMPL_ID = "kickside.agents:user_agent"

local function define_tests()
    test.describe("agent business logic", function()
        local db
        local cleanup_component_ids = {}

        test.before_all(function()
            db = sql.get("app:db")
            test.not_nil(db)
        end)

        test.after_all(function()
            if db then
                for _, cid in ipairs(cleanup_component_ids) do
                    db:execute("DELETE FROM kickside_component_access WHERE component_id = $1", { cid })
                    db:execute("DELETE FROM kickside_component_meta WHERE component_id = $1", { cid })
                    db:execute("DELETE FROM kickside_components WHERE component_id = $1", { cid })
                end
                db:release()
            end
        end)

        local function create_test_component(opts)
            opts = opts or {}
            local component_id = uuid_v4()
            cleanup_component_ids[#cleanup_component_ids + 1] = component_id

            local private_ctx = opts.private_context or {
                prompt = opts.prompt or "Test agent prompt.",
                model = opts.model or "class:fast",
                temperature = opts.temperature or 0.5,
                max_tokens = opts.max_tokens or 8000,
                traits = opts.traits or {},
                trait_contexts = opts.trait_contexts or {},
                trait_agent_options = opts.trait_agent_options or {},
                agent_options = opts.agent_options or {},
                tools = opts.tools or {},
                delegates = opts.delegates or {},
                memory_target_id = opts.memory_target_id or "",
            }
            local encoded_ctx, enc_err = json.encode(private_ctx)
            test.is_nil(enc_err)

            local _, err = db:execute(
                [[INSERT INTO kickside_components (component_id, impl_id, private_context, created_at, updated_at)
                  VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)]],
                { component_id, IMPL_ID, encoded_ctx }
            )
            test.is_nil(err)

            local meta = opts.meta or {
                { key = "title", value = opts.title or "Test Agent" },
                { key = "description", value = opts.description or "" },
                { key = "icon", value = opts.icon or "tabler:robot" },
                { key = "class", value = opts.class or "public" },
                { key = "model", value = opts.model or "class:fast" },
            }
            for _, m in ipairs(meta) do
                _, err = db:execute(
                    [[INSERT INTO kickside_component_meta (meta_id, component_id, key, value, created_at, updated_at)
                      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)]],
                    { uuid_v4(), component_id, m.key, m.value }
                )
                test.is_nil(err)
            end

            return component_id
        end








        test.describe("delegate storage", function()
            test.it("stores delegate references in private_context", function()
                local delegate_id_1 = create_test_component({ title = "Delegate A" })
                local delegate_id_2 = create_test_component({ title = "Delegate B" })

                local parent_id = create_test_component({
                    title = "Parent Agent",
                    delegates = { delegate_id_1, delegate_id_2 },
                    meta = {
                        { key = "title", value = "Parent Agent" },
                        { key = "delegate_count", value = tostring(2) },
                    },
                })

                local rows, err = db:query(
                    "SELECT private_context FROM kickside_components WHERE component_id = $1",
                    { parent_id }
                )
                test.is_nil(err)
                test.eq(#rows, 1)

                local ctx_data, dec_err = json.decode(tostring(rows[1].private_context))
                test.is_nil(dec_err)
                test.eq(#ctx_data.delegates, 2)
                test.eq(ctx_data.delegates[1], delegate_id_1)
                test.eq(ctx_data.delegates[2], delegate_id_2)
            end)

            test.it("delegate_count meta matches actual delegate count", function()
                local d1 = create_test_component({ title = "Del 1" })
                local d2 = create_test_component({ title = "Del 2" })
                local d3 = create_test_component({ title = "Del 3" })

                local parent_id = create_test_component({
                    title = "Multi Delegate Parent",
                    delegates = { d1, d2, d3 },
                    meta = {
                        { key = "title", value = "Multi Delegate Parent" },
                        { key = "delegate_count", value = tostring(3) },
                    },
                })

                local meta_rows, meta_err = db:query(
                    "SELECT value FROM kickside_component_meta WHERE component_id = $1 AND key = 'delegate_count'",
                    { parent_id }
                )
                test.is_nil(meta_err)
                test.eq(meta_rows[1].value, "3")

                local ctx_rows, ctx_err = db:query(
                    "SELECT private_context FROM kickside_components WHERE component_id = $1",
                    { parent_id }
                )
                test.is_nil(ctx_err)
                local ctx_data, dec_err = json.decode(tostring(ctx_rows[1].private_context))
                test.is_nil(dec_err)
                test.eq(#ctx_data.delegates, 3)
            end)

            test.it("delegates reference valid component IDs", function()
                local delegate_id = create_test_component({ title = "Valid Delegate" })
                local parent_id = create_test_component({
                    title = "Referencing Parent",
                    delegates = { delegate_id },
                })

                local ctx_rows, err = db:query(
                    "SELECT private_context FROM kickside_components WHERE component_id = $1",
                    { parent_id }
                )
                test.is_nil(err)
                local ctx_data, _ = json.decode(tostring(ctx_rows[1].private_context))
                local referenced_id = ctx_data.delegates[1]

                local comp_rows, comp_err = db:query(
                    "SELECT component_id FROM kickside_components WHERE component_id = $1",
                    { referenced_id }
                )
                test.is_nil(comp_err)
                test.eq(#comp_rows, 1)
                test.eq(comp_rows[1].component_id, delegate_id)
            end)
        end)



    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
