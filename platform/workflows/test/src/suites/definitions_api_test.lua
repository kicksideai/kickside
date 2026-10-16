-- Flow artifact REST helpers: an export is READ-gated published source, while
-- import is a new un-published draft built through the definition command pipeline.

local test = require("test")
local funcs = require("funcs")
local security = require("security")
local workflow_repo = require("workflow_repo")
local workflow = require("workflow")
local version_publish = require("version_publish")
local version_read = require("version_read")
local definitions_api_module = require("definitions_api")
local definitions_api = definitions_api_module
local flow_contract = require("flow_contract")
local types = require("types")

type Map = { [string]: any }

local C = types.COMMAND

local function scope(): any
    local policy, policy_err = security.policy("app:workflows_suite_policy")
    if policy_err or not policy then error("suite policy: " .. tostring(policy_err)) end
    local out, scope_err = security.new_scope({ policy })
    if scope_err or not out then error("suite scope: " .. tostring(scope_err)) end
    return out
end

local function call_as(actor_id: string, args: any): (Map?, any?)
    local actor, actor_err = security.new_actor(actor_id, {})
    if actor_err or not actor then return nil, actor_err end
    local result, err = funcs.new():with_actor(actor):with_scope(scope()):call("app:definitions_api_seam", args)
    if err then return nil, err end
    if type(result) ~= "table" then return nil, "definitions API seam returned an invalid result" end
    return result :: Map, nil
end

local function same_tree(left: any, right: any): boolean
    if type(left) ~= type(right) then return false end
    if type(left) ~= "table" then return left == right end
    for key, value in pairs(left :: Map) do
        if not same_tree(value, (right :: Map)[key]) then return false end
    end
    for key, _ in pairs(right :: Map) do
        if (left :: Map)[key] == nil then return false end
    end
    return true
end

local function copy_tree(value: any): any
    if type(value) ~= "table" then return value end
    local out: Map = {}
    for key, child in pairs(value :: Map) do out[key] = copy_tree(child) end
    return out
end

local function unauthenticated_response(handler: () -> any): Map
    local captured: Map = {}
    local response: Map = {
        set_content_type = function(_self: any, content_type: any) captured.content_type = content_type end,
        set_status = function(_self: any, status: any) captured.status = status end,
        write_json = function(_self: any, body: any) captured.body = body end,
    }
    local fake_http: Map = {
        CONTENT = { JSON = "application/json" },
        STATUS = { OK = 200, BAD_REQUEST = 400, UNAUTHORIZED = 401, FORBIDDEN = 403 },
        request = function()
            return {
                param = function(_self: any, _name: string) return "no-access" end,
                body = function() return "{}" end,
            }
        end,
        response = function() return response end,
    }
    local api = definitions_api_module.new({ http = fake_http,
        security = { actor = function() return nil end } })
    local selected = handler == definitions_api.export_handler and api.export_handler or api.import_handler
    local ok, err = pcall(selected)
    if not ok then error(err) end
    return captured
end

local function authenticated_import_response(flow: Map, actor_id: string): Map
    local captured: Map = {}
    local response: Map = {
        set_content_type = function(_self: any, content_type: any) captured.content_type = content_type end,
        set_status = function(_self: any, status: any) captured.status = status end,
        write_json = function(_self: any, body: any) captured.body = body end,
    }
    local fake_http: Map = {
        CONTENT = { JSON = "application/json" },
        STATUS = { OK = 200, BAD_REQUEST = 400, UNAUTHORIZED = 401, FORBIDDEN = 403 },
        request = function() return { body = function() return "request" end } end,
        response = function() return response end,
    }
    local api = definitions_api_module.new({ http = fake_http,
        json = { decode = function() return { flow = flow, bindings = {} }, nil end },
        security = { actor = function() return { id = function() return actor_id end } end },
    })
    local ok, err = pcall(api.import_handler)
    if not ok then error(err) end
    return captured
end

local function define_tests()
    test.describe("Flow artifact API", function()
        test.it("keeps the security dependency private to constructed handlers", function()
            test.is_nil(definitions_api_module._security)
            test.is_nil(definitions_api_module._repo)
        end)
        test.it("round-trips published source into a distinct unpublished draft and resolves title collisions", function()
            local owner = "definition-api-owner-" .. tostring(math.random(1, 1000000000))
            local created = select(1, call_as(owner, { op = "create_published", title = "Flow import" })) :: Map
            test.is_nil(created.error)
            local source_id = tostring(created.workflow_id or "")
            test.is_true(source_id ~= "")

            local exported = select(1, call_as(owner, { op = "export", workflow_id = source_id })) :: Map
            test.is_nil(exported.error)
            local flow = exported.flow :: Map
            test.is_nil(flow.compiled_commands)

            -- Imports always use a visibly distinct copy name.
            local collision = select(1, call_as(owner, { op = "create_empty", title = "Flow import" })) :: Map
            test.is_nil(collision.error)
            local imported = select(1, call_as(owner, { op = "import", flow = flow })) :: Map
            test.is_nil(imported.error)
            test.eq(imported.status, "draft")
            test.eq(imported.published, false)
            test.eq(imported.title, "Copy of Flow import")
            test.is_true(imported.flow_id ~= source_id)
            test.eq(imported.head_version, 0)
            local imported_document = imported.document :: Map
            test.eq((imported_document.params :: Map).key, flow.key)
            local expected_document = copy_tree(flow.document) :: Map
            local expected_params = type(expected_document.params) == "table" and (expected_document.params :: Map) or {}
            expected_document.params = expected_params
            expected_params.key = flow.key
            test.eq(#(imported_document.nodes :: { any }), #(expected_document.nodes :: { any }))
            for index, expected in ipairs(expected_document.nodes :: { any }) do
                local actual = (imported_document.nodes :: { any })[index] :: Map
                local wanted = expected :: Map
                test.eq(actual.id, wanted.id)
                test.eq(actual.kind, wanted.kind)
                test.eq(actual.ref, wanted.ref)
                test.is_true(same_tree(actual.config or {}, wanted.config or {}))
            end
            test.is_true(same_tree(imported_document.edges, expected_document.edges))
            test.is_true(same_tree(imported_document.params, expected_document.params))
            test.eq((expected_document.layout :: Map).direction, "LR")
            test.is_true(same_tree(imported_document.layout, expected_document.layout))
        end)

        test.it("uses the Flow document title as the source for the shared copy name", function()
            local owner = "definition-api-owner-" .. tostring(math.random(1, 1000000000))
            local created = select(1, call_as(owner, { op = "create_published", title = "Copy title source" })) :: Map
            local exported = select(1, call_as(owner, { op = "export", workflow_id = created.workflow_id })) :: Map
            local flow = exported.flow :: Map
            local document = flow.document :: Map
            local params = document.params :: Map
            params.title = "Copy title source"

            flow.checksum = select(1, flow_contract.checksum(flow))
            local imported = select(1, call_as(owner, { op = "import", flow = flow })) :: Map
            test.is_nil(imported.error)
            test.eq(imported.title, "Copy of Copy title source")
        end)

        test.it("uses the canonical Flow request and response envelope", function()
            local owner = "definition-api-owner-" .. tostring(math.random(1, 1000000000))
            local created = select(1, call_as(owner, { op = "create_published", title = "Envelope Flow" })) :: Map
            local exported = select(1, call_as(owner, { op = "export", workflow_id = created.workflow_id })) :: Map
            local captured = select(1, call_as(owner, { op = "import_handler", flow = exported.flow })) :: Map
            if captured.status ~= 200 then
                local failed = type(captured.body) == "table" and (captured.body :: Map) or {}
                error("canonical import handler failed: " .. tostring(failed.code) .. ": " .. tostring(failed.error))
            end
            test.eq(captured.status, 200)
            local body = captured.body :: Map
            test.eq(body.success, true)
            test.not_nil(body.flow)
            test.is_true(tostring((body.flow :: Map).flow_id or "") ~= "")
            test.is_nil(body.workflow)
        end)

        test.it("enforces the published READ gate and rejects malformed source with directed errors", function()
            local owner = "definition-api-owner-" .. tostring(math.random(1, 1000000000))
            local created = select(1, call_as(owner, { op = "create_published", title = "Private Flow" })) :: Map
            local source_id = tostring(created.workflow_id or "")
            local denied = select(1, call_as("definition-api-stranger", { op = "export", workflow_id = source_id })) :: Map
            test.contains(tostring(denied.error), "access denied")

            local exported = select(1, call_as(owner, { op = "export", workflow_id = source_id })) :: Map
            local malformed_flow = exported.flow :: Map
            malformed_flow.document = {}
            malformed_flow.checksum = select(1, flow_contract.checksum(malformed_flow))
            local malformed = select(1, call_as(owner, { op = "import", flow = malformed_flow })) :: Map
            test.eq(malformed.code, "flow_invalid")
            test.contains(tostring(malformed.error), "document requires nodes and edges arrays")
        end)

        test.it("restores an immutable version into a distinct draft with recorded lineage", function()
            local owner = "definition-api-owner-" .. tostring(math.random(1, 1000000000))
            local created = select(1, call_as(owner, { op = "create_published", title = "Restore target" })) :: Map
            local restored, restore_call_err = call_as(owner, { op = "restore", workflow_id = created.workflow_id, version = 1 })
            test.is_nil(restore_call_err)
            test.not_nil(restored)
            restored = restored :: Map
            test.is_nil(restored.error)
            test.eq(restored.status, "draft")
            test.is_false(restored.published)
            test.is_true(restored.flow_id ~= created.workflow_id)
            test.eq(((restored.lineage :: Map).source_flow_id), created.workflow_id)
            test.eq(((restored.lineage :: Map).source_version), 1)
        end)

        test.it("guards export and import handlers before reading request data", function()
            local export_response = unauthenticated_response(definitions_api.export_handler)
            test.eq(export_response.content_type, "application/json")
            test.eq(export_response.status, 401)
            test.eq(((export_response.body :: Map).success), false)
            test.eq(((export_response.body :: Map).error), "authentication required")

            local import_response = unauthenticated_response(definitions_api.import_handler)
            test.eq(import_response.content_type, "application/json")
            test.eq(import_response.status, 401)
            test.eq(((import_response.body :: Map).success), false)
            test.eq(((import_response.body :: Map).error), "authentication required")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function publish_commands(): { Map }
    return {
        { type = "layout.set-direction", body = { direction = "LR" } },
        { type = C.PARAM_SET, body = { key = "key", value = "kickside.test/flow-import" } },
        { type = C.PARAM_SET, body = { key = "title", value = "Flow import" } },
        { type = C.NODE_ADD, body = { id = "entry", kind = "block", ref = "app:block.engine_linear" } },
        { type = C.NODE_ADD, body = { id = "work", kind = "block", ref = "app:block.engine_linear" } },
        { type = C.EDGE_ADD, body = { id = "entry_work", source_id = "entry", target_id = "work" } },
    }
end

local function seam(args: any): Map
    local a = type(args) == "table" and (args :: Map) or {}
    local actor = security.actor()
    local actor_id = actor and tostring(actor:id() or "") or "test"
    if a.op == "create_published" then
        local created, create_err = workflow_repo.create(a.title)
        if create_err or not created then return { error = create_err } end
        local id = tostring((created :: Map).id or "")
        local _, apply_err = workflow.apply(id, publish_commands(), actor_id)
        if apply_err then return { error = apply_err } end
        local published, publish_err = version_publish.publish(id, actor_id)
        return { workflow_id = id, error = publish_err or (type(published) == "table" and (published :: Map).ok ~= true and "publish refused" or nil) }
    elseif a.op == "create_empty" then
        local created, create_err = workflow_repo.create(a.title)
        return { workflow_id = created and (created :: Map).id or nil, error = create_err }
    elseif a.op == "export" then
        local flow, export_err = definitions_api.export_flow(a.workflow_id)
        return { flow = flow, error = export_err }
    elseif a.op == "import" then
        local imported, import_err = definitions_api.import_flow(a.flow, a.bindings or {}, actor_id)
        if import_err then return { code = (import_err :: Map).code, error = (import_err :: Map).message } end
        local id = tostring((imported :: Map).flow_id or "")
        local state, state_err = workflow.state(id)
        return {
            workflow_id = id,
            title = (imported :: Map).title,
            status = (imported :: Map).status,
            published = (imported :: Map).published,
            head_version = select(1, version_read.head(id)),
            document = state and {
                nodes = (state :: Map).nodes,
                edges = (state :: Map).edges,
                notes = (state :: Map).notes,
                layout = (state :: Map).layout,
                params = (state :: Map).params,
            } or nil,
            error = state_err,
        }
    elseif a.op == "restore" then
        local restored, restore_err = definitions_api.restore_version(a.workflow_id, a.version, actor_id)
        if restore_err or not restored then return { error = restore_err or "restore failed" } end
        local id = tostring((restored :: Map).flow_id or "")
        local state, state_err = workflow.state(id)
        return {
            workflow_id = id,
            status = (restored :: Map).status,
            published = (restored :: Map).published,
            lineage = state and (state :: Map).version_lineage or nil,
            error = state_err,
        }
    elseif a.op == "import_handler" then
        return authenticated_import_response(a.flow :: Map, actor_id)
    end
    return { error = "unknown op" }
end

return { run = function(options) return run_cases(options) end, seam = seam }
