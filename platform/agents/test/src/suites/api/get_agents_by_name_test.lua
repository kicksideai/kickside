local test = require("test")
local sql = require("sql")
local json = require("json")
local crypto = require("crypto")
local funcs = require("funcs")
local security = require("security")

local PROBE = "app:agents_by_name_probe"
local AGENTS_NS = "kickside.agents.registry"
local PROC_SCOPE = "wippy.security:process"
local APP_DB = "app:db"
local PUBLIC_SYSTEM_AGENT = "app:fixture_public_system_agent"
local PRIVATE_SYSTEM_AGENT = "app:fixture_system_agent"

local function uuid(): string
    local id, err = crypto.random.uuid()
    if err then return "uuid_error" end
    return id
end

local function new_executor(user_id: string): any
    local actor: any = security.new_actor(user_id, {})
    local scope: any = security.named_scope(PROC_SCOPE)
    return funcs.new():with_actor(actor):with_scope(scope)
end

local function define_tests()
    test.describe("agents_by_name resolution", function()
        local db: any
        local owner = "by_name_test_owner"
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

        local function register_agent(title: string): string
            local reg, err = new_executor(owner):call(AGENTS_NS .. ":a_create", {
                name = title,
                prompt = "You are a test agent.",
                model = "class:fast",
            })
            test.is_nil(err, "a_create: " .. tostring(err))
            test.not_nil(reg)
            test.not_nil(reg.component_id)
            local component_id = reg.component_id :: string
            created[#created + 1] = component_id
            return component_id
        end

        local function resolve_as(user_id: string, identifiers: {string}): any
            local resolved, err = new_executor(user_id):call(PROBE, { identifiers = identifiers })
            test.is_nil(err, "probe: " .. tostring(err))
            return resolved or {}
        end

        -- The chat host resolves session agent ids through this API; a user agent
        -- ref must surface its component title, not stay an opaque user_agent:<id>.
        test.it("resolves a user agent ref to its title for a caller with access", function()
            local cid = register_agent("By Name Chat Agent")
            local ref = "user_agent:" .. cid
            local resolved = resolve_as(owner, { ref })
            test.eq(resolved[ref], "By Name Chat Agent")
        end)

        test.it("keeps user agents unresolved for callers without access", function()
            local cid = register_agent("Private Owner Agent")
            local ref = "user_agent:" .. cid
            local resolved = resolve_as("stranger_" .. uuid(), { ref })
            test.is_nil(resolved[ref])
        end)

        test.it("does not resolve a non-agent component as an agent title", function()
            local cid = uuid()
            created[#created + 1] = cid
            local enc, _ = json.encode({ note = "not an agent" })
            db:execute(
                [[INSERT INTO kickside_components (component_id, impl_id, private_context, created_at, updated_at)
                  VALUES ($1, 'kickside.test:not_agent', $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)]],
                { cid, enc })
            db:execute(
                [[INSERT INTO kickside_component_meta (meta_id, component_id, key, value, created_at, updated_at)
                  VALUES ($1, $2, 'title', 'Not An Agent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)]],
                { uuid(), cid })
            db:execute(
                [[INSERT INTO kickside_component_access (access_id, subject_id, component_id, source_component_id, subject_type, access_mask, created_at)
                  VALUES ($1, $2, $3, $4, 'user', 15, CURRENT_TIMESTAMP)]],
                { uuid(), owner, cid, cid })

            local ref = "user_agent:" .. cid
            local resolved = resolve_as(owner, { ref })
            test.is_nil(resolved[ref])
        end)

        test.it("resolves a public system agent by registry id", function()
            local resolved = resolve_as(owner, { PUBLIC_SYSTEM_AGENT })
            test.eq(resolved[PUBLIC_SYSTEM_AGENT], "Public Fixture Agent")
        end)

        test.it("keeps non-public system agents unresolved", function()
            local resolved = resolve_as(owner, { PRIVATE_SYSTEM_AGENT })
            test.is_nil(resolved[PRIVATE_SYSTEM_AGENT])
        end)

        test.it("resolves a public system agent by title", function()
            local resolved = resolve_as(owner, { "Public Fixture Agent" })
            test.eq(resolved["Public Fixture Agent"], "Public Fixture Agent")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
