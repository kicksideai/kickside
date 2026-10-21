local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local security = require("security")
local funcs = require("funcs")
local time = require("time")
local function executor(user)
    return funcs.new():with_actor(security.new_actor(user, {})):with_scope(security.named_scope("wippy.security:process"))
end
local function cases()
    test.describe("component-to-provider native HTTP", function()
        local owner = executor("provider-owner-" .. uuid.v7())
        local stranger = executor("provider-stranger-" .. uuid.v7())
        local reader_id = "provider-reader-" .. uuid.v7()
        local reader = executor(reader_id)
        local id
        test.before_all(function()
            local created, err = owner:call("kickside.connection.registry:register", {
                provider = "provider_http_fixture", name = "HTTP fixture", auth = {api_key = "native-http-fixture"},
            })
            test.is_nil(err); test.not_nil(created)
            id = created.component_id
            local db = assert(sql.get("app:db"))
            local _, grant_err = db:execute([[INSERT INTO kickside_component_access
                (access_id, subject_type, subject_id, component_id, source_component_id, access_mask, created_at)
                VALUES ($1,'user',$2,$3,$4,1,$5)]], {uuid.v7(), reader_id, id, id, time.now():utc():format(time.RFC3339)})
            db:release(); test.is_nil(grant_err)
        end)
        test.after_all(function()
            if id then
                local _, err = owner:call("kickside.connection.registry:delete", {component_id = id})
                test.is_nil(err)
            end
        end)
        test.it("resolves a stored private credential and reads and writes over real HTTP", function()
            for _, write in ipairs({false, true}) do
                local result, err = owner:call("app.client_test:probe", {component_id = id, title = "Native HTTP", write = write})
                test.is_nil(err); test.eq(result.success, true); test.eq(result.data.id, "native-receipt")
                test.eq(result.data.title, "Native HTTP"); test.is_nil(result.data.api_key)
            end
        end)
        test.it("denies a stranger and denies writes to an actor with READ access", function()
            local result, err = stranger:call("app.client_test:probe", {component_id = id, title = "denied", write = false})
            test.is_nil(result); test.not_nil(err)
            result, err = reader:call("app.client_test:probe", {component_id = id, title = "allowed read", write = false})
            test.is_nil(err); test.eq(result.success, true)
            result, err = reader:call("app.client_test:probe", {component_id = id, title = "denied write", write = true})
            test.is_nil(result); test.not_nil(err)
        end)
        test.it("sends a custom request envelope through credential admission and real HTTP", function()
            local result, err = owner:call("app.client_test:probe", {component_id = id, title = "Custom wire", write = true, custom = true})
            test.is_nil(err); test.eq(result.success, true)
            test.eq(result.data.title, "Custom wire"); test.eq(result.data.format, "envelope")
            result, err = reader:call("app.client_test:probe", {component_id = id, title = "denied custom write", write = true, custom = true})
            test.is_nil(result); test.not_nil(err)
        end)
    end)
end
return {run = test.run_cases(cases)}
