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











        test.describe("trait-tool composition integrity", function()
            -- Public traits are offered in the agent editor's Capabilities picker, so they
            -- must read cleanly: a fitting icon and a semantic description of the capability
            -- (a trait can bundle a prompt + funcs, not just a tool), never one that names
            -- the underlying tool ("...with the FooRead tool").
            test.it("every public trait has an icon", function()
                local traits = registry.find({ [".kind"] = "registry.entry", ["meta.type"] = "agent.trait" })
                local missing = {}
                for _, t in ipairs(traits or {}) do
                    local meta = (t :: any).meta or {}
                    if meta.public and (type(meta.icon) ~= "string" or meta.icon == "") then
                        missing[#missing + 1] = t.id
                    end
                end
                test.eq(#missing, 0, "public traits missing an icon: " .. table.concat(missing, ", "))
            end)

            test.it("public trait descriptions are semantic, not tool-named", function()
                local traits = registry.find({ [".kind"] = "registry.entry", ["meta.type"] = "agent.trait" })
                local bad = {}
                for _, t in ipairs(traits or {}) do
                    local meta = (t :: any).meta or {}
                    local desc = tostring(meta.comment or "")
                    if meta.public then
                        if desc == "" then
                            bad[#bad + 1] = t.id .. " (empty)"
                        else
                            local lower = string.lower(desc)
                            local with_the = string.find(lower, "with the ", 1, true)
                            local named_tool = with_the and string.find(lower, " tool", with_the + #"with the ", true)
                            if named_tool then
                                bad[#bad + 1] = t.id .. " (names a tool)"
                            end
                        end
                    end
                end
                test.eq(#bad, 0, "public traits with a missing or tool-named description: " .. table.concat(bad, ", "))
            end)

            test.it("every non-private trait has all tools registered", function()
                local traits = registry.find({
                    [".kind"] = "registry.entry",
                    ["meta.type"] = "agent.trait",
                })
                test.not_nil(traits)

                local missing = {}
                for _, trait in ipairs(traits) do
                    if not (trait.meta and trait.meta.private) then
                        local data = (trait :: any).data or {}
                        local tools = (data :: any).tools or {}
                        for _, tool_id in ipairs(tools) do
                            local tool_entries = registry.find({ [".id"] = tool_id })
                            if not tool_entries or #tool_entries == 0 then
                                missing[#missing + 1] = trait.id .. " -> " .. tostring(tool_id)
                            end
                        end
                    end
                end
                test.eq(#missing, 0, "missing tools: " .. table.concat(missing, ", "))
            end)

            test.it("every trait with web_component has the component registered", function()
                local components = registry.find({
                    [".kind"] = "registry.entry",
                    ["meta.type"] = "view.component",
                })
                -- web_component names the view.component's tag_name (resolved at
                -- runtime via loadByTagName), so match on tag_name.
                local component_names = {}
                for _, comp in ipairs(components or {}) do
                    if comp.meta and comp.meta.tag_name then
                        component_names[comp.meta.tag_name] = true
                    end
                end

                local traits = registry.find({
                    [".kind"] = "registry.entry",
                    ["meta.type"] = "agent.trait",
                })

                local missing = {}
                for _, trait in ipairs(traits or {}) do
                    if trait.meta and trait.meta.web_component then
                        local wc_name = trait.meta.web_component
                        if not component_names[wc_name] then
                            missing[#missing + 1] = trait.id .. " -> " .. tostring(wc_name)
                        end
                    end
                end
                test.eq(#missing, 0, "missing web components: " .. table.concat(missing, ", "))
            end)

            test.it("every picker-backed public trait declares context_schema", function()
                local traits = registry.find({
                    [".kind"] = "registry.entry",
                    ["meta.type"] = "agent.trait",
                })

                local missing = {}
                for _, trait in ipairs(traits or {}) do
                    local meta = trait.meta or {}
                    if meta.public and not meta.private and meta.web_component and type(meta.context_schema) ~= "table" then
                        missing[#missing + 1] = tostring(trait.id)
                    end
                end
                test.eq(#missing, 0, "picker-backed public traits missing context_schema: " .. table.concat(missing, ", "))
            end)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
