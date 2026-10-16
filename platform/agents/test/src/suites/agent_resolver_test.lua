local test = require("test")
local sql = require("sql")
local json = require("json")
local uuid_v4 = require("uuid").v4
local funcs = require("funcs")
local security = require("security")
local contract = require("contract")

local RESOLVER = "kickside.agents:agent_resolver_func"
local RESOLVER_CONTRACT = "wippy.agent:resolver"
local CONTEXT_PROBE = "app:agent_context_resolver_probe"
local USER_AGENT_IMPL = "kickside.agents:user_agent"
local PROC_SCOPE = "wippy.security:process"
local APP_DB = "app:db"
local AGENTS_NS = "kickside.agents.registry"
local CURATOR_TRAIT = "kickside.agents.traits:trait_curator"
local ROSTER_TRAIT = "kickside.agents.traits:agent_roster"
local DELEGATE_TRAIT = "kickside.agents.traits:delegate"

local function new_executor(user_id: string): any
    local actor: any = security.new_actor(user_id, {})
    local scope: any = security.named_scope(PROC_SCOPE)
    return funcs.new():with_actor(actor):with_scope(scope)
end

local function decode_context(raw: any): table
    if type(raw) ~= "string" or raw == "" then return {} end
    local decoded, err = json.decode(raw)
    if err or type(decoded) ~= "table" then return {} end
    return decoded
end

local function define_tests()
    test.describe("agent_resolver", function()
        local db: any
        local owner = "resolver_test_owner"
        local created: {string} = {}

        test.before_all(function()
            db = sql.get(APP_DB)
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

        -- Register user agents through the package's canonical registry binding
        -- so actor propagation, context encoding, metadata and owner grants match
        -- production creation.
        local function register_agent(private_ctx: table, title: string): string
            local args: { [string]: any } = { name = title }
            for k, v in pairs(private_ctx) do args[k] = v end
            local reg, err = new_executor(owner):call(AGENTS_NS .. ":a_create", args)
            test.is_nil(err, "a_create: " .. tostring(err))
            test.not_nil(reg)
            test.not_nil(reg.component_id)
            local component_id = reg.component_id :: string
            created[#created + 1] = component_id

            local rows, qerr = db:query(
                [[SELECT c.impl_id, c.private_context, a.subject_id, a.access_mask
                  FROM kickside_components c
                  LEFT JOIN kickside_component_access a ON a.component_id = c.component_id
                  WHERE c.component_id = $1]],
                { component_id })
            test.is_nil(qerr, "component fixture query: " .. tostring(qerr))
            local row = rows and rows[1]
            test.not_nil(row, "registry create did not persist component " .. component_id)
            test.eq(row.impl_id, USER_AGENT_IMPL)
            test.eq(row.subject_id, owner)
            test.eq(row.access_mask, 15)
            local ctx = decode_context(row.private_context)
            test.eq(ctx.prompt, args.prompt or "")
            test.eq(ctx.model, args.model or "class:fast")

            local meta_rows, meta_err = db:query(
                [[SELECT value FROM kickside_component_meta WHERE component_id = $1 AND key = 'status']],
                { component_id })
            test.is_nil(meta_err, "status meta query: " .. tostring(meta_err))
            test.not_nil(meta_rows[1], "registry create did not seed status public meta")
            test.eq(meta_rows[1].value, "active")

            return component_id
        end

        -- Negative fixture: a readable component that is not a user agent.
        local function insert_non_agent(private_ctx: table, title: string): string
            local cid = uuid_v4()
            created[#created + 1] = cid
            local enc, _ = json.encode(private_ctx)
            db:execute(
                [[INSERT INTO kickside_components (component_id, impl_id, private_context, created_at, updated_at)
                  VALUES ($1, 'kickside.test:not_agent', $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)]],
                { cid, enc })
            db:execute(
                [[INSERT INTO kickside_component_meta (meta_id, component_id, key, value, created_at, updated_at)
                  VALUES ($1, $2, 'title', $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)]],
                { uuid_v4(), cid, title })
            db:execute(
                [[INSERT INTO kickside_component_access (access_id, subject_id, component_id, source_component_id, subject_type, access_mask, created_at)
                  VALUES ($1, $2, $3, $4, 'user', 15, CURRENT_TIMESTAMP)]],
                { uuid_v4(), owner, cid, cid })
            return cid
        end

        local function insert_raw_user_agent(private_ctx: table, title: string): string
            local cid = uuid_v4()
            created[#created + 1] = cid
            local enc, _ = json.encode(private_ctx)
            db:execute(
                [[INSERT INTO kickside_components (component_id, impl_id, private_context, created_at, updated_at)
                  VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)]],
                { cid, USER_AGENT_IMPL, enc })
            for key, value in pairs({
                title = title,
                class = "agent",
                model = private_ctx.model or "class:fast",
                status = "active",
            }) do
                db:execute(
                    [[INSERT INTO kickside_component_meta (meta_id, component_id, key, value, created_at, updated_at)
                      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)]],
                    { uuid_v4(), cid, key, tostring(value) })
            end
            db:execute(
                [[INSERT INTO kickside_component_access (access_id, subject_id, component_id, source_component_id, subject_type, access_mask, created_at)
                  VALUES ($1, $2, $3, $4, 'user', 15, CURRENT_TIMESTAMP)]],
                { uuid_v4(), owner, cid, cid })
            return cid
        end

        local function find_trait(resolved: any, trait_id: string): any
            for _, trait in ipairs(resolved.traits or {}) do
                if trait.id == trait_id then return trait end
            end
            return nil
        end

        -- The chat agent switcher sends the bare component id; the resolver must
        -- resolve a bare component id (no user_agent: prefix) to the user agent.
        test.it("resolves a user agent by bare component id", function()
            local cid = register_agent(
                { prompt = "You are a test agent.", model = "class:fast" }, "Resolver Bare Agent")
            local resolved, err = new_executor(owner):call(RESOLVER, { agent_id = cid })
            test.is_nil(err)
            test.not_nil(resolved, "resolver returned nil for " .. cid)
            test.eq(resolved.id, "user_agent:" .. cid)
            test.eq(resolved.prompt, "You are a test agent.")
            test.eq(resolved.model, "class:fast")
        end)

        test.it("resolves the same agent by prefixed user_agent: id", function()
            local cid = register_agent(
                { prompt = "Prefixed prompt.", model = "class:fast" }, "Resolver Prefixed Agent")
            local resolved, err = new_executor(owner):call(RESOLVER, { agent_id = "user_agent:" .. cid })
            test.is_nil(err)
            test.not_nil(resolved, "resolver returned nil for user_agent:" .. cid)
            test.eq(resolved.id, "user_agent:" .. cid)
            test.eq(resolved.prompt, "Prefixed prompt.")
        end)

        test.it("opens the canonical resolver contract with caller actor and scope", function()
            local cid = register_agent(
                { prompt = "Contract prompt.", model = "class:fast" }, "Resolver Contract Agent")
            local actor: any = security.new_actor(owner, {})
            local scope: any = security.named_scope(PROC_SCOPE)
            local def, def_err = contract.get(RESOLVER_CONTRACT)
            test.is_nil(def_err, "contract.get: " .. tostring(def_err))
            test.not_nil(def)

            local resolver, open_err = (def :: any):with_actor(actor):with_scope(scope):open()
            test.is_nil(open_err, "resolver open: " .. tostring(open_err))
            test.not_nil(resolver)

            local resolved, resolve_err = resolver:resolve({ agent_id = "user_agent:" .. cid })
            test.is_nil(resolve_err, "resolver call: " .. tostring(resolve_err))
            test.not_nil(resolved, "resolver returned nil for user_agent:" .. cid)
            test.eq(resolved.id, "user_agent:" .. cid)
            test.eq(resolved.prompt, "Contract prompt.")
        end)

        test.it("loads a component-backed user agent through wippy.agent context", function()
            local cid = register_agent(
                { prompt = "Context prompt.", model = "class:fast" }, "Resolver Context Agent")
            local loaded, err = new_executor(owner):call(CONTEXT_PROBE, {
                agent_id = "user_agent:" .. cid,
            })
            test.is_nil(err, "context probe call: " .. tostring(err))
            test.not_nil(loaded)
            test.eq(loaded.success, true, loaded and loaded.error or "context probe failed")
            test.not_nil(loaded.agent)
            test.eq(loaded.agent.id, "user_agent:" .. cid)
            test.eq(loaded.agent.name, "Resolver Context Agent")
            test.eq(loaded.agent.model, "class:fast")
            test.eq(loaded.current_agent_id, "user_agent:" .. cid)
        end)

        test.it("preserves agent-level runtime options for compiler overlay", function()
            local cid = register_agent({
                prompt = "Runtime options prompt.",
                model = "class:fast",
                agent_options = {
                    checkpoint = {
                        token_threshold = 42000,
                        max_tokens = 1400,
                    },
                },
            }, "Resolver Runtime Options Agent")

            local resolved, err = new_executor(owner):call(RESOLVER, { agent_id = cid })

            test.is_nil(err)
            test.not_nil(resolved, "resolver returned nil for runtime options agent " .. cid)
            test.not_nil(resolved.agent_options)
            test.eq(resolved.agent_options.checkpoint.token_threshold, 42000)
            test.eq(resolved.agent_options.checkpoint.max_tokens, 1400)
        end)

        test.it("derives a checkpoint threshold from the resolved model window", function()
            local cid = register_agent({
                prompt = "Checkpoint policy prompt.",
                model = "checkpoint-policy-model",
                max_tokens = 8000,
                agent_options = {
                    checkpoint = { token_threshold = 240000 },
                },
            }, "Resolver Checkpoint Policy Agent")

            local resolved, err = new_executor(owner):call(RESOLVER, { agent_id = cid })

            test.is_nil(err)
            test.not_nil(resolved)
            test.eq(221529, resolved.agent_options.checkpoint.token_threshold)
        end)

        test.it("retains a smaller configured checkpoint threshold", function()
            local cid = register_agent({
                prompt = "Checkpoint policy lower threshold prompt.",
                model = "checkpoint-policy-model",
                max_tokens = 8000,
                agent_options = {
                    checkpoint = { token_threshold = 12000 },
                },
            }, "Resolver Checkpoint Policy Lower Threshold Agent")

            local resolved, err = new_executor(owner):call(RESOLVER, { agent_id = cid })

            test.is_nil(err)
            test.not_nil(resolved)
            test.eq(12000, resolved.agent_options.checkpoint.token_threshold)
        end)

        test.it("keeps the configured checkpoint threshold when model limits are unavailable", function()
            local cid = register_agent({
                prompt = "Checkpoint policy unknown model prompt.",
                model = "unspecified-limits-model",
                max_tokens = 8000,
                agent_options = {
                    checkpoint = { token_threshold = 43000 },
                },
            }, "Resolver Checkpoint Policy Unknown Model Agent")

            local resolved, err = new_executor(owner):call(RESOLVER, { agent_id = cid })

            test.is_nil(err)
            test.not_nil(resolved)
            test.eq(43000, resolved.agent_options.checkpoint.token_threshold)
        end)

        test.it("preserves trait-owned runtime options on the trait spec", function()
            local cid = register_agent({
                prompt = "Trait runtime options prompt.",
                model = "class:fast",
                traits = { ROSTER_TRAIT },
                trait_contexts = {
                    [ROSTER_TRAIT] = {
                        namespaces = { "user_agent" },
                    },
                },
                trait_agent_options = {
                    [ROSTER_TRAIT] = {
                        checkpoint = {
                            token_threshold = 15000,
                            max_tokens = 500,
                        },
                    },
                },
            }, "Resolver Trait Runtime Options Agent")

            local resolved, err = new_executor(owner):call(RESOLVER, { agent_id = cid })

            test.is_nil(err)
            test.not_nil(resolved, "resolver returned nil for trait runtime options agent " .. cid)
            local trait = find_trait(resolved, ROSTER_TRAIT)
            test.not_nil(trait)
            test.eq((trait.context.namespaces or {})[1], "user_agent")
            test.eq(trait.agent_options.checkpoint.token_threshold, 15000)
            test.eq(trait.agent_options.checkpoint.max_tokens, 500)
        end)

        test.it("seeds master trait context without creating recursive trait_contexts", function()
            local cid = register_agent({
                prompt = "Master trait prompt.",
                model = "class:fast",
                traits = { CURATOR_TRAIT, ROSTER_TRAIT },
                trait_contexts = {
                    [CURATOR_TRAIT] = {
                        namespaces = { "test.agent" },
                    },
                    [ROSTER_TRAIT] = {
                        namespaces = { "user_agent" },
                    },
                },
            }, "Resolver Master Trait Agent")

            local resolved, err = new_executor(owner):call(RESOLVER, { agent_id = cid })

            test.is_nil(err)
            test.not_nil(resolved, "resolver returned nil for master trait agent " .. cid)
            local curator = find_trait(resolved, CURATOR_TRAIT)
            test.not_nil(curator)
            test.eq((curator.context.namespaces or {})[1], "test.agent")
            test.eq((curator.context.base_traits or {})[1], CURATOR_TRAIT)
            test.eq(curator.context.self_id, "user_agent:" .. cid)
            test.not_nil(curator.context.trait_contexts)
            test.is_false(curator.context.trait_contexts[CURATOR_TRAIT] == curator.context)
            test.eq((curator.context.trait_contexts[CURATOR_TRAIT].namespaces or {})[1], "test.agent")
            test.eq(curator.context.trait_contexts[CURATOR_TRAIT].base_traits, nil)
            test.eq(curator.context.trait_contexts[CURATOR_TRAIT].trait_contexts, nil)

            local roster = find_trait(resolved, ROSTER_TRAIT)
            test.not_nil(roster)
            test.eq(roster.context.self_id, "user_agent:" .. cid)
            test.eq((roster.context.namespaces or {})[1], "user_agent")
        end)

        test.it("rejects persisted trait context that does not match the trait schema", function()
            local cid = insert_raw_user_agent({
                prompt = "Invalid trait context prompt.",
                model = "class:fast",
                traits = { ROSTER_TRAIT },
                trait_contexts = {
                    [ROSTER_TRAIT] = {
                        namespaces = "not-a-list",
                    },
                },
            }, "Resolver Invalid Trait Context Agent")

            local resolved, err = new_executor(owner):call(RESOLVER, { agent_id = cid })

            test.is_nil(err)
            test.is_nil(resolved)
        end)

        test.it("resolves memory implementation from the provider registry", function()
            local cid = register_agent({
                prompt = "Memory prompt.",
                model = "class:fast",
                memory_target_id = "kb-fixture",
                memory_provider_id = "app:fixture_memory_provider",
            }, "Resolver Memory Agent")
            local resolved, err = new_executor(owner):call(RESOLVER, { agent_id = cid })
            test.is_nil(err)
            test.not_nil(resolved, "resolver returned nil for memory agent " .. cid)
            test.not_nil(resolved.memory_contract)
            test.eq(resolved.memory_contract.implementation_id, "app.fixture:memory")
            test.eq(resolved.memory_contract.context.component_id, "kb-fixture")
            test.eq(resolved.memory_contract.context.provider_id, "app:fixture_memory_provider")
        end)

        -- Namespaced ids are native registry agents. The resolver contract owns
        -- that path too, so sessions do not depend on a fallback loader.
        test.it("resolves a native registry agent by namespaced id", function()
            local resolved, err = new_executor(owner):call(RESOLVER, { agent_id = "app:fixture_system_agent" })
            test.is_nil(err)
            test.not_nil(resolved)
            test.eq(resolved.id, "app:fixture_system_agent")
            test.eq(resolved.name, "fixture")
            test.eq(resolved.title, "Fixture Agent")
            test.eq(resolved.prompt, "A fixture system agent for the agents harness suite.")
            test.eq(resolved.model, "class:fast")
            test.eq(resolved.temperature, 0.25)
            test.eq(resolved.max_tokens, 1234)
            test.eq((resolved.traits or {})[1], "wippy.agent.traits:time_aware")
        end)

        test.it("loads a native registry agent through wippy.agent context", function()
            local loaded, err = new_executor(owner):call(CONTEXT_PROBE, {
                agent_id = "app:fixture_system_agent",
            })
            test.is_nil(err, "context probe call: " .. tostring(err))
            test.not_nil(loaded)
            test.eq(loaded.success, true, loaded and loaded.error or "context probe failed")
            test.not_nil(loaded.agent)
            test.eq(loaded.agent.id, "app:fixture_system_agent")
            test.eq(loaded.agent.name, "fixture")
            test.eq(loaded.agent.model, "class:fast")
            test.eq(loaded.current_agent_id, "app:fixture_system_agent")
            test.eq(loaded.current_model, "class:fast")
        end)

        -- Other component kinds share the components table; a bare id pointing at
        -- one must not resolve as an agent.
        test.it("does not resolve a non-agent component as an agent", function()
            local cid = insert_non_agent(
                { prompt = "not an agent" }, "Resolver Non Agent")
            local resolved, _ = new_executor(owner):call(RESOLVER, { agent_id = cid })
            test.is_nil(resolved)
        end)

        -- A deleted delegate is a dangling ref: it resolves to neither a component
        -- nor a registry entry. It must be omitted from both the delegation tool list
        -- and the derived delegate prompt, so the LLM is never offered a delegate that
        -- resolves to nothing. A live delegate alongside it must still be offered.
        test.it("omits a dangling delegate from the tool list and delegate prompt", function()
            local live_cid = register_agent(
                { prompt = "Live delegate.", model = "class:fast" }, "Resolver Live Delegate")
            local ghost_id = uuid_v4()
            local cid = register_agent({
                prompt = "Delegating agent.",
                model = "class:fast",
                delegates = { live_cid, ghost_id },
            }, "Resolver Delegating Agent")

            local resolved, err = new_executor(owner):call(RESOLVER, { agent_id = cid })
            test.is_nil(err)
            test.not_nil(resolved, "resolver returned nil for delegating agent " .. cid)

            local live_ref = "user_agent:" .. live_cid
            local found_live, found_ghost = false, false
            for _, d in ipairs(resolved.delegates or {}) do
                if d.id == live_ref then found_live = true end
                if d.id == ghost_id or d.title == ghost_id then found_ghost = true end
            end
            test.is_true(found_live, "live delegate missing from resolved tool list")
            test.is_false(found_ghost, "dangling delegate still offered in resolved tool list")

            local delegate_trait = find_trait(resolved, DELEGATE_TRAIT)
            test.not_nil(delegate_trait, "delegate trait not attached")
            local targets = delegate_trait.context.targets or {}
            local prompt_live, prompt_ghost = false, false
            for _, t in ipairs(targets) do
                if t.title == "Resolver Live Delegate" then prompt_live = true end
                if t.title == ghost_id then prompt_ghost = true end
            end
            test.is_true(prompt_live, "live delegate missing from delegate prompt targets")
            test.is_false(prompt_ghost, "dangling delegate still listed in delegate prompt targets")
        end)

        test.it("returns nil for empty agent_id", function()
            local resolved, _ = new_executor(owner):call(RESOLVER, { agent_id = "" })
            test.is_nil(resolved)
        end)

        test.it("returns a typed configuration error when the stored model is missing", function()
            local cid = register_agent(
                { prompt = "Modelless.", model = "class:fast" }, "Resolver Modelless Agent")
            local enc, _ = json.encode({ prompt = "Modelless.", model = "" })
            db:execute(
                [[UPDATE kickside_components SET private_context = $1 WHERE component_id = $2]],
                { enc, cid })
            local resolved, err = new_executor(owner):call(RESOLVER, { agent_id = cid })
            test.is_nil(resolved)
            test.not_nil(err)
            test.is_true(errors.is(err, errors.INVALID), tostring(err))
            test.eq(err:details().code, "agent_model_required")
            test.eq(err:details().component_id, cid)
            test.contains(tostring(err), "Configure a model")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
