local test = require("test")
local contract = require("contract")
local security = require("security")
local sql = require("sql")
local json = require("json")
local uuid = require("uuid")
local repo = require("repo")

local function define()
    test.describe("OAuth provider runtime configuration boundary", function()
        local id, owner, stranger = uuid.v7(), "runtime-owner-" .. uuid.v4(), "runtime-stranger-" .. uuid.v4()
        local function execute(statement, args)
            local db = assert(sql.get("app:db"))
            local result, err = db:execute(statement, args or {})
            db:release()
            test.is_nil(err, tostring(err))
            return result
        end
        local function open(actor)
            local definition, err = contract.get("kickside.oauth.runtime:connection")
            test.is_nil(err, tostring(err)); test.not_nil(definition)
            local instance, open_err = definition:with_actor(security.new_actor(actor, {}))
                :with_scope(security.new_scope({assert(security.policy("app:user"))})):open()
            test.is_nil(open_err, tostring(open_err)); test.not_nil(instance)
            return instance
        end
        test.before_all(function()
            execute([[INSERT INTO kickside_components (component_id,impl_id,private_context,created_at,updated_at)
                VALUES ($1,$2,$3,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)]], {id,"kickside.oauth:oauth_connection",json.encode({component_id=id})})
            execute([[INSERT INTO kickside_component_access
                (access_id,subject_id,subject_type,component_id,source_component_id,access_mask,created_at)
                VALUES ($1,$2,'user',$3,$4,1,CURRENT_TIMESTAMP)]], {uuid.v7(),owner,id,id})
            local _, err = repo.create_connection(id, {provider="runtime-test",connection_name="Runtime fixture",
                connection_state="connected",tokens={access_token="private-access",refresh_token="private-refresh"},
                client_credentials={client_secret="private-client-secret"},oauth_flow={verifier="private-verifier"},
                user_profile={email="private@example.test"},provider_specific={endpoint_url="https://fixture.example/mcp"}})
            test.is_nil(err, tostring(err))
        end)
        test.after_all(function()
            for _, table_name in ipairs({"kickside_component_access","kickside_component_meta","kickside_components","kickside_oauth_connections"}) do
                execute("DELETE FROM " .. table_name .. " WHERE component_id=$1", {id})
            end
        end)
        test.it("returns only provider runtime configuration to a READ holder", function()
            local result, err = open(owner):get_config({component_id=id})
            test.is_nil(err, tostring(err)); test.not_nil(result)
            test.eq(result.provider, "runtime-test")
            test.eq(result.connection_state, "connected")
            test.eq(result.config.endpoint_url, "https://fixture.example/mcp")
            local encoded = json.encode(result)
            for _, secret in ipairs({"private-access","private-refresh","private-client-secret","private-verifier","private@example.test"}) do
                test.is_nil((encoded:find(secret,1,true)))
            end
            test.is_nil(result.tokens); test.is_nil(result.client_credentials); test.is_nil(result.oauth_flow)
        end)
        test.it("denies a stranger before returning provider-private data", function()
            local result, err = open(stranger):get_config({component_id=id})
            test.is_nil(result); test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
        end)
        test.it("preserves a query failure instead of reporting a missing connection", function()
            execute("ALTER TABLE kickside_oauth_connections RENAME TO oauth_runtime_test_unavailable")
            local ok, result, err = pcall(function() return open(owner):get_config({component_id=id}) end)
            execute("ALTER TABLE oauth_runtime_test_unavailable RENAME TO kickside_oauth_connections")
            test.is_true(ok,tostring(result)); test.is_nil(result); test.not_nil(err)
            test.is_false(errors.is(err,errors.NOT_FOUND),tostring(err))
            test.is_false(errors.is(err,errors.PERMISSION_DENIED),tostring(err))
        end)
        test.it("does not disguise damaged encrypted storage as a missing connection", function()
            execute("UPDATE kickside_oauth_connections SET oauth_data_encrypted=$1 WHERE component_id=$2", {"damaged-ciphertext",id})
            local result, err = open(owner):get_config({component_id=id})
            test.is_nil(result); test.not_nil(err)
            test.is_false(errors.is(err, errors.NOT_FOUND), tostring(err))
            test.is_false(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
        end)
    end)
end
return {run=test.run_cases(define)}
