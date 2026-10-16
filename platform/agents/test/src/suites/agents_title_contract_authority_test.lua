local test = require("test")
local sql = require("sql")
local json = require("json")
local crypto = require("crypto")
local funcs = require("funcs")
local security = require("security")

local DB = "app:db"
local FUNCTION_SCOPE = "app:agents_title_function_deny_scope"
local CONTRACT_SCOPE = "app:agents_title_contract_deny_scope"
local IMPL = "kickside.agents:user_agent"
local PROBE = "app:agents_title_legacy_scope_probe"
local FUNCTION_AUTHORITY_PROBE = "app:agents_title_function_authority_probe"
local CONTRACT_AUTHORITY_PROBE = "app:agents_title_contract_authority_probe"

local function uuid(): string
    local id, err = crypto.random.uuid()
    test.is_nil(err, "uuid: " .. tostring(err))
    return id :: string
end

local function executor(actor_id: string, scope_id: string): any
    local actor: any = security.new_actor(actor_id, {})
    return funcs.new():with_actor(actor):with_scope(security.named_scope(scope_id))
end

local function define_tests()
    test.describe("legacy agent title query-method authority", function()
        local db: any
        local component_id: string?
        local actor_id = "agents_title_contract_reader"

        test.before_all(function()
            local open_err
            db, open_err = sql.get(DB)
            test.is_nil(open_err, "database: " .. tostring(open_err))
            component_id = uuid()
            local context, context_err = json.encode({})
            test.is_nil(context_err, "context: " .. tostring(context_err))
            local _, component_err = db:execute([[INSERT INTO kickside_components
                (component_id, impl_id, private_context, created_at, updated_at)
                VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)]], { component_id, IMPL, context })
            test.is_nil(component_err, "component: " .. tostring(component_err))
            local _, meta_err = db:execute([[INSERT INTO kickside_component_meta
                (meta_id, component_id, key, value, created_at, updated_at)
                VALUES ($1, $2, 'title', 'Contract scope title', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)]], { uuid(), component_id })
            test.is_nil(meta_err, "meta: " .. tostring(meta_err))
            local _, ancestor_err = db:execute([[INSERT INTO kickside_component_ancestor
                (component_id, ancestor_id, depth) VALUES ($1, $1, 0)]], { component_id })
            test.is_nil(ancestor_err, "ancestor: " .. tostring(ancestor_err))
            local _, grant_err = db:execute([[INSERT INTO kickside_component_access
                (access_id, subject_id, component_id, source_component_id, subject_type, access_mask, created_at)
                VALUES ($1, $2, $3, $4, 'user', 1, CURRENT_TIMESTAMP)]], { uuid(), actor_id, component_id, component_id })
            test.is_nil(grant_err, "grant: " .. tostring(grant_err))
        end)

        test.after_all(function()
            if not db then return end
            for _, statement in ipairs({
                "DELETE FROM kickside_component_access WHERE component_id = $1",
                "DELETE FROM kickside_component_ancestor WHERE component_id = $1 OR ancestor_id = $1",
                "DELETE FROM kickside_component_meta WHERE component_id = $1",
                "DELETE FROM kickside_components WHERE component_id = $1",
            }) do
                local _, cleanup_err = db:execute(statement, { component_id })
                test.is_nil(cleanup_err, "cleanup: " .. tostring(cleanup_err))
            end
            local _, release_err = db:release()
            test.is_nil(release_err, "release: " .. tostring(release_err))
        end)

        local function assert_title(scope_id: string, authority_probe: string, action: string)
            local query_allowed, authority_err = executor(actor_id, scope_id):call(authority_probe)
            test.is_nil(authority_err, "query authority: " .. tostring(authority_err))
            test.is_false(query_allowed == true, "query " .. action .. " must be denied")

            local ref = "user_agent:" .. assert(component_id)
            local titles, resolve_err = executor(actor_id, scope_id):call(PROBE, { identifiers = { ref } })
            test.is_nil(resolve_err, "legacy resolver: " .. tostring(resolve_err))
            test.eq(titles[ref], "Contract scope title")
        end

        test.it("keeps a granted legacy title readable when the query binding function is denied", function()
            assert_title(FUNCTION_SCOPE, FUNCTION_AUTHORITY_PROBE, "funcs.call")
        end)

        test.it("keeps a granted legacy title readable when the query contract method is denied", function()
            assert_title(CONTRACT_SCOPE, CONTRACT_AUTHORITY_PROBE, "contract.call")
        end)
    end)
end

return { run = test.run_cases(define_tests) }
