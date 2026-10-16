local test = require("test")
local sql = require("sql")
local json = require("json")
local uuid_v4 = require("uuid").v4
local registry = require("registry")

local IMPL_ID = "kickside.agents:user_agent"

local function define_tests()
    test.describe("Agent Block declaration", function()
        test.it("publishes exactly one configurable Agent Block with its owned editor", function()
            local rows, err = registry.find({ ["meta.type"] = "kickside.block" })
            test.is_nil(err)
            local owned = {}
            for _, entry in ipairs(rows or {}) do
                if tostring(entry.id or ""):match("^kickside%.agents:") then owned[#owned + 1] = entry end
            end
            test.eq(#owned, 1)
            local block = owned[1].data.block
            test.eq(owned[1].id, "kickside.agents:block.agent")
            test.eq(block.api_version, "kickside.block/v1")
            test.eq(block.execution.kind, "agent")
            test.eq(block.execution.mode, "config")
            test.eq(block.presentation.config_wc, "kickside-agent-block-config")
            test.eq(block.config.properties.agent_id.type, "string")
            test.eq(block.config.properties.instructions.type, "string")
        end)
    end)

    test.describe("user agent management", function()
        local db
        local test_component_id = uuid_v4()
        local test_user_id = "test_agent_owner_" .. uuid_v4()

        test.before_all(function()
            db = sql.get("app:db")
            test.not_nil(db)
        end)

        test.after_all(function()
            if db then
                db:execute("DELETE FROM kickside_component_access WHERE component_id = $1", { test_component_id })
                db:execute("DELETE FROM kickside_component_meta WHERE component_id = $1", { test_component_id })
                db:execute("DELETE FROM kickside_components WHERE component_id = $1", { test_component_id })
                db:release()
            end
        end)

        test.describe("component lifecycle", function()
            test.it("creates a user agent component", function()
                local private_ctx = {
                    prompt = "You are a test agent.",
                    model = "class:fast",
                    temperature = 0.7,
                    max_tokens = 4000,
                    traits = {},
                    tools = {},
                    delegates = {},
                }
                local encoded_ctx, enc_err = json.encode(private_ctx)
                test.is_nil(enc_err)

                local _, err = db:execute(
                    [[INSERT INTO kickside_components (component_id, impl_id, private_context, created_at, updated_at)
                      VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)]],
                    { test_component_id, IMPL_ID, encoded_ctx }
                )
                test.is_nil(err)

                local meta_entries = {
                    { key = "title", value = "Test Agent" },
                    { key = "comment", value = "Agent for testing" },
                    { key = "icon", value = "tabler:robot" },
                    { key = "class", value = "agent" },
                    { key = "model", value = "class:fast" },
                }
                for _, m in ipairs(meta_entries) do
                    _, err = db:execute(
                        [[INSERT INTO kickside_component_meta (meta_id, component_id, key, value, created_at, updated_at)
                          VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)]],
                        { uuid_v4(), test_component_id, m.key, m.value }
                    )
                    test.is_nil(err)
                end

                _, err = db:execute(
                    [[INSERT INTO kickside_component_access (access_id, subject_id, component_id, source_component_id, subject_type, access_mask, created_at)
                      VALUES ($1, $2, $3, $4, 'user', 15, CURRENT_TIMESTAMP)]],
                    { uuid_v4(), test_user_id, test_component_id, test_component_id }
                )
                test.is_nil(err)
            end)

            test.it("retrieves component with correct impl_id", function()
                local rows, err = db:query(
                    "SELECT * FROM kickside_components WHERE component_id = $1",
                    { test_component_id }
                )
                test.is_nil(err)
                test.eq(#rows, 1)
                test.eq(rows[1].impl_id, IMPL_ID)
            end)

            test.it("retrieves private_context as JSON", function()
                local rows, err = db:query(
                    "SELECT private_context FROM kickside_components WHERE component_id = $1",
                    { test_component_id }
                )
                test.is_nil(err)
                local ctx, dec_err = json.decode(tostring(rows[1].private_context))
                test.is_nil(dec_err)
                test.eq(ctx.prompt, "You are a test agent.")
                test.eq(ctx.model, "class:fast")
                test.eq(ctx.temperature, 0.7)
                test.eq(ctx.max_tokens, 4000)
            end)

            test.it("retrieves all metadata entries", function()
                local rows, err = db:query(
                    "SELECT key, value FROM kickside_component_meta WHERE component_id = $1 ORDER BY key",
                    { test_component_id }
                )
                test.is_nil(err)
                test.eq(#rows, 5)

                local meta = {}
                for _, row in ipairs(rows) do
                    meta[row.key] = row.value
                end
                test.eq(meta.title, "Test Agent")
                test.eq(meta.comment, "Agent for testing")
                test.eq(meta.icon, "tabler:robot")
                test.eq(meta.class, "agent")
                test.eq(meta.model, "class:fast")
            end)

            test.it("lists components by impl_id", function()
                local rows, err = db:query(
                    "SELECT * FROM kickside_components WHERE impl_id = $1",
                    { IMPL_ID }
                )
                test.is_nil(err)

                local found = false
                for _, row in ipairs(rows) do
                    if row.component_id == test_component_id then
                        found = true
                        break
                    end
                end
                test.is_true(found)
            end)

            test.it("updates metadata title", function()
                local _, err = db:execute(
                    "UPDATE kickside_component_meta SET value = $1, updated_at = CURRENT_TIMESTAMP WHERE component_id = $2 AND key = $3",
                    { "Updated Agent", test_component_id, "title" }
                )
                test.is_nil(err)

                local rows, q_err = db:query(
                    "SELECT value FROM kickside_component_meta WHERE component_id = $1 AND key = 'title'",
                    { test_component_id }
                )
                test.is_nil(q_err)
                test.eq(#rows, 1)
                test.eq(rows[1].value, "Updated Agent")
            end)

            test.it("merges partial private_context update", function()
                local rows, err = db:query(
                    "SELECT private_context FROM kickside_components WHERE component_id = $1",
                    { test_component_id }
                )
                test.is_nil(err)
                test.eq(#rows, 1)

                local existing, dec_err = json.decode(tostring(rows[1].private_context))
                test.is_nil(dec_err)

                existing.prompt = "Updated prompt."
                existing.temperature = 0.3

                local encoded, enc_err = json.encode(existing)
                test.is_nil(enc_err)

                local _, update_err = db:execute(
                    "UPDATE kickside_components SET private_context = $1, updated_at = CURRENT_TIMESTAMP WHERE component_id = $2",
                    { encoded, test_component_id }
                )
                test.is_nil(update_err)

                local verify, v_err = db:query(
                    "SELECT private_context FROM kickside_components WHERE component_id = $1",
                    { test_component_id }
                )
                test.is_nil(v_err)
                local updated, d_err = json.decode(tostring(verify[1].private_context))
                test.is_nil(d_err)
                test.eq(updated.prompt, "Updated prompt.")
                test.eq(updated.temperature, 0.3)
                test.eq(updated.max_tokens, 4000)
                test.eq(updated.model, "class:fast")
            end)

            test.it("grants and verifies access for another user", function()
                local share_user = "test_share_" .. uuid_v4()
                local _, err = db:execute(
                    [[INSERT INTO kickside_component_access (access_id, subject_id, component_id, source_component_id, subject_type, access_mask, created_at)
                      VALUES ($1, $2, $3, $4, 'user', 1, CURRENT_TIMESTAMP)]],
                    { uuid_v4(), share_user, test_component_id, test_component_id }
                )
                test.is_nil(err)

                local rows, q_err = db:query(
                    "SELECT * FROM kickside_component_access WHERE component_id = $1 AND subject_id = $2",
                    { test_component_id, share_user }
                )
                test.is_nil(q_err)
                test.eq(#rows, 1)
                test.eq(rows[1].access_mask, 1)

                local _, update_err = db:execute(
                    "UPDATE kickside_component_access SET access_mask = $1 WHERE component_id = $2 AND subject_id = $3",
                    { 3, test_component_id, share_user }
                )
                test.is_nil(update_err)

                local verify, v_err = db:query(
                    "SELECT access_mask FROM kickside_component_access WHERE component_id = $1 AND subject_id = $2",
                    { test_component_id, share_user }
                )
                test.is_nil(v_err)
                test.eq(verify[1].access_mask, 3)

                local _, del_err = db:execute(
                    "DELETE FROM kickside_component_access WHERE component_id = $1 AND subject_id = $2",
                    { test_component_id, share_user }
                )
                test.is_nil(del_err)

                local deleted, d_err = db:query(
                    "SELECT * FROM kickside_component_access WHERE component_id = $1 AND subject_id = $2",
                    { test_component_id, share_user }
                )
                test.is_nil(d_err)
                test.eq(#deleted, 0)
            end)

            test.it("deletes component and verifies removal", function()
                db:execute("DELETE FROM kickside_component_access WHERE component_id = $1", { test_component_id })
                db:execute("DELETE FROM kickside_component_meta WHERE component_id = $1", { test_component_id })
                db:execute("DELETE FROM kickside_components WHERE component_id = $1", { test_component_id })

                local rows, err = db:query(
                    "SELECT * FROM kickside_components WHERE component_id = $1",
                    { test_component_id }
                )
                test.is_nil(err)
                test.eq(#rows, 0)
            end)
        end)

        test.describe("registry queries", function()
            test.it("does not declare Automation as an Agents dependency", function()
                test.is_nil((registry.get("kickside.agents:dep.kickside.automation")))
            end)

            test.it("finds agent traits from registry", function()
                local entries, err = registry.find({
                    [".kind"] = "registry.entry",
                    ["meta.type"] = "agent.trait",
                })
                test.is_nil(err)
                test.not_nil(entries)
                test.ok(#entries >= 1)

                local has_non_private = false
                for _, entry in ipairs(entries) do
                    if entry.meta and not entry.meta.private then
                        has_non_private = true
                        break
                    end
                end
                test.is_true(has_non_private)
            end)

            test.it("finds tools from registry", function()
                local entries, err = registry.find({
                    [".kind"] = "function.lua",
                    ["meta.type"] = "tool",
                })
                test.is_nil(err)
                test.not_nil(entries)
                test.ok(#entries >= 1)
            end)

            test.it("finds system agents from registry", function()
                local entries, err = registry.find({
                    [".kind"] = "registry.entry",
                    ["meta.type"] = "agent.gen1",
                })
                test.is_nil(err)
                test.not_nil(entries)
                test.ok(#entries >= 1)
            end)

            test.it("finds contract binding for user_agent", function()
                local entries, err = registry.find({
                    [".id"] = IMPL_ID,
                })
                test.is_nil(err)
                test.not_nil(entries)
                test.eq(#entries, 1)
                test.eq(entries[1].kind, "contract.binding")
            end)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
