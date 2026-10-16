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






        test.describe("agent metadata", function()
            test.it("stores title, comment, icon, class, model in kickside_component_meta", function()
                local component_id = create_test_component({
                    title = "Research Bot",
                    description = "Researches topics deeply",
                    icon = "tabler:microscope",
                    class = "public",
                    model = "claude-4-5-sonnet",
                    meta = {
                        { key = "title", value = "Research Bot" },
                        { key = "comment", value = "Researches topics deeply" },
                        { key = "icon", value = "tabler:microscope" },
                        { key = "class", value = "public" },
                        { key = "model", value = "claude-4-5-sonnet" },
                        { key = "delegate_count", value = "0" },
                    },
                })

                local rows, err = db:query(
                    "SELECT key, value FROM kickside_component_meta WHERE component_id = $1 ORDER BY key",
                    { component_id }
                )
                test.is_nil(err)
                test.eq(#rows, 6)

                local meta = {}
                for _, row in ipairs(rows) do
                    meta[row.key] = row.value
                end
                test.eq(meta.title, "Research Bot")
                test.eq(meta.comment, "Researches topics deeply")
                test.eq(meta.icon, "tabler:microscope")
                test.eq(meta.class, "public")
                test.eq(meta.model, "claude-4-5-sonnet")
                test.eq(meta.delegate_count, "0")
            end)

            test.it("kickside_component_meta values are stored as text", function()
                local component_id = create_test_component({
                    meta = {
                        { key = "title", value = "Type Test" },
                        { key = "delegate_count", value = tostring(3) },
                    },
                })

                local rows, err = db:query(
                    "SELECT value FROM kickside_component_meta WHERE component_id = $1 AND key = 'delegate_count'",
                    { component_id }
                )
                test.is_nil(err)
                test.eq(#rows, 1)
                test.eq(type(rows[1].value), "string")
                test.eq(rows[1].value, "3")
            end)
        end)





    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
