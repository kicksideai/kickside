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







        test.describe("agent access control", function()
            test.it("grants viewer access with mask 1", function()
                local component_id = create_test_component({ title = "Access Test Agent" })
                local viewer_id = "viewer_" .. uuid_v4()

                local _, err = db:execute(
                    [[INSERT INTO kickside_component_access (access_id, subject_id, component_id, source_component_id, subject_type, access_mask, created_at)
                      VALUES ($1, $2, $3, $4, 'user', 1, CURRENT_TIMESTAMP)]],
                    { uuid_v4(), viewer_id, component_id, component_id }
                )
                test.is_nil(err)

                local rows, q_err = db:query(
                    "SELECT access_mask FROM kickside_component_access WHERE component_id = $1 AND subject_id = $2",
                    { component_id, viewer_id }
                )
                test.is_nil(q_err)
                test.eq(#rows, 1)
                test.eq(rows[1].access_mask, 1)
            end)

            test.it("grants member access with mask 3", function()
                local component_id = create_test_component({ title = "Member Test Agent" })
                local member_id = "member_" .. uuid_v4()

                local _, err = db:execute(
                    [[INSERT INTO kickside_component_access (access_id, subject_id, component_id, source_component_id, subject_type, access_mask, created_at)
                      VALUES ($1, $2, $3, $4, 'user', 3, CURRENT_TIMESTAMP)]],
                    { uuid_v4(), member_id, component_id, component_id }
                )
                test.is_nil(err)

                local rows, q_err = db:query(
                    "SELECT access_mask FROM kickside_component_access WHERE component_id = $1 AND subject_id = $2",
                    { component_id, member_id }
                )
                test.is_nil(q_err)
                test.eq(rows[1].access_mask, 3)
            end)

            test.it("grants owner access with mask 15", function()
                local component_id = create_test_component({ title = "Owner Test Agent" })
                local owner_id = "owner_" .. uuid_v4()

                local _, err = db:execute(
                    [[INSERT INTO kickside_component_access (access_id, subject_id, component_id, source_component_id, subject_type, access_mask, created_at)
                      VALUES ($1, $2, $3, $4, 'user', 15, CURRENT_TIMESTAMP)]],
                    { uuid_v4(), owner_id, component_id, component_id }
                )
                test.is_nil(err)

                local rows, q_err = db:query(
                    "SELECT access_mask FROM kickside_component_access WHERE component_id = $1 AND subject_id = $2",
                    { component_id, owner_id }
                )
                test.is_nil(q_err)
                test.eq(rows[1].access_mask, 15)
            end)

            test.it("revokes access by deleting kickside_component_access row", function()
                local component_id = create_test_component({ title = "Revoke Test Agent" })
                local user_id = "revoke_" .. uuid_v4()

                db:execute(
                    [[INSERT INTO kickside_component_access (access_id, subject_id, component_id, source_component_id, subject_type, access_mask, created_at)
                      VALUES ($1, $2, $3, $4, 'user', 3, CURRENT_TIMESTAMP)]],
                    { uuid_v4(), user_id, component_id, component_id }
                )

                local _, del_err = db:execute(
                    "DELETE FROM kickside_component_access WHERE component_id = $1 AND subject_id = $2",
                    { component_id, user_id }
                )
                test.is_nil(del_err)

                local rows, q_err = db:query(
                    "SELECT * FROM kickside_component_access WHERE component_id = $1 AND subject_id = $2",
                    { component_id, user_id }
                )
                test.is_nil(q_err)
                test.eq(#rows, 0)
            end)

            test.it("grants group-level access with subject_type group", function()
                local component_id = create_test_component({ title = "Group Access Agent" })
                local group_id = "group_" .. uuid_v4()

                local _, err = db:execute(
                    [[INSERT INTO kickside_component_access (access_id, subject_id, component_id, source_component_id, access_mask, subject_type, created_at)
                      VALUES ($1, $2, $3, $4, 1, 'group', CURRENT_TIMESTAMP)]],
                    { uuid_v4(), group_id, component_id, component_id }
                )
                test.is_nil(err)

                local rows, q_err = db:query(
                    "SELECT access_mask, subject_type FROM kickside_component_access WHERE component_id = $1 AND subject_id = $2",
                    { component_id, group_id }
                )
                test.is_nil(q_err)
                test.eq(#rows, 1)
                test.eq(rows[1].access_mask, 1)
                test.eq(rows[1].subject_type, "group")
            end)

            test.it("enforces unique constraint on subject+component+source", function()
                local component_id = create_test_component({ title = "Unique Group Agent" })
                local group_id = "unique_group_" .. uuid_v4()

                local _, err = db:execute(
                    [[INSERT INTO kickside_component_access (access_id, subject_id, component_id, source_component_id, access_mask, subject_type, created_at)
                      VALUES ($1, $2, $3, $4, 1, 'group', CURRENT_TIMESTAMP)]],
                    { uuid_v4(), group_id, component_id, component_id }
                )
                test.is_nil(err)

                local _, dup_err = db:execute(
                    [[INSERT INTO kickside_component_access (access_id, subject_id, component_id, source_component_id, access_mask, subject_type, created_at)
                      VALUES ($1, $2, $3, $4, 3, 'group', CURRENT_TIMESTAMP)]],
                    { uuid_v4(), group_id, component_id, component_id }
                )
                test.not_nil(dup_err)
            end)
        end)




    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
