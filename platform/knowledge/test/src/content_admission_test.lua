-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local json = require("json")
local funcs = require("funcs")
local security = require("security")
local contract = require("contract")
local http_client = require("http_client")
local system = require("system")
local session = require("session")
local groups = require("groups")
local component = require("component")
local cleanup = require("fixture_cleanup")
local provision = require("provision")
local uploads = require("uploads")
local upload_types = require("upload_types")
local upload_records = require("upload_records")
local artifacts = require("artifacts")

local CONTENT = "The reference describes accessible travel."
local targets: { string } = {}
local upload_ids: { string } = {}
local users: { string } = {}

local function rows(statement: string, params: any?): any
    local db = assert(sql.get("app:db"))
    local result, err = db:query(statement, params or {})
    db:release()
    if err then error(tostring(err)) end
    return result
end

local function execute(statement: string, params: any?)
    local db = assert(sql.get("app:db"))
    local _, err = db:execute(statement, params or {})
    db:release()
    if err then error(tostring(err)) end
end

local function executor(user: string, context: any?): any
    local e = funcs.new():with_actor(security.new_actor(user, {})):with_scope(security.named_scope("wippy.security:process"))
    return context and e:with_context(context) or e
end

local function owner(): string
    local id = "admission-" .. uuid.v7()
    users[#users + 1] = id
    local db = assert(sql.get("app:db"))
    local sqlite = db:type() == sql.type.SQLITE
    db:release()
    local now = sqlite and "strftime('%s', 'now')" or "now()"
    execute("INSERT INTO app_users (user_id, email, full_name, password_hash, status, created_at, updated_at) VALUES ($1, $2, 'Test user', '!test', 'active', " .. now .. ", " .. now .. ")", { id, id .. "@knowledge.test" })
    execute("INSERT INTO app_user_groups (user_id, group_id, created_at) VALUES ($1, 'app:user', " .. now .. ")", { id })
    return id
end

local function target(user: string, engine: string): string
    if engine == "memory" then
        local def = assert(contract.get("kickside.knowledge:knowledge_bases"))
        local kb = assert(def:with_actor(security.new_actor(user, {})):with_scope(security.named_scope("wippy.security:process")):open())
        local result, err = kb:create({ name = "Admission test", kb_type = "memory", embedding_model = "admission-embed", config = { extraction_model = "admission-fast" } })
        test.is_nil(err, tostring(err))
        test.not_nil(result)
        targets[#targets + 1] = result.component_id
        return result.component_id
    end
    local id = uuid.v7()
    targets[#targets + 1] = id
    execute("INSERT INTO kickside_components (component_id, impl_id, private_context, created_at, updated_at) VALUES ($1, 'test.kb:embeddable', '{}', 0, 0)", { id })
    execute("INSERT INTO kickside_component_access (access_id, subject_id, subject_type, component_id, source_component_id, access_mask, inherited, created_at) VALUES ($1, $2, 'user', $3, $4, 15, 0, 0)", { uuid.v7(), user, id, id })
    for k, v in pairs({ class = "knowledge_base", kb_type = "wiki", status = "ready", title = "Admission test" }) do
        execute("INSERT INTO kickside_component_meta (meta_id, component_id, key, value, created_at, updated_at) VALUES ($1, $2, $3, $4, 0, 0)", { uuid.v7(), id, k, v })
    end
    local def = assert(contract.get("kickside.core:threads"))
    local threads = assert(def:with_actor(security.new_actor(user, {})):with_scope(security.named_scope("wippy.security:process")):open())
    local _, err = threads:ensure_thread({ component_id = id, impl_id = "app:test_engine_wiki", thread_class = "kickside.knowledge.injection" })
    test.is_nil(err, tostring(err))
    return id
end

local function upload(user: string): string
    local actor = security.new_actor(user, {})
    local _, provision_err = provision.ensure_user(actor, security.named_scope("wippy.security:process"), user)
    test.is_nil(provision_err, tostring(provision_err))
    local id = uuid.v7()
    upload_ids[#upload_ids + 1] = id
    local _, err = upload_records.create(id, user, #CONTENT, "text/plain", "app:uploads", id .. ".txt", "documents", { filename = "reference.txt" }, "completed")
    test.is_nil(err, tostring(err))
    local artifact, artifact_err = artifacts.create_artifact({ upload_id = id, kind = "text", role = "primary", mime_type = "text/plain", content = CONTENT, storage_id = "app:uploads" })
    test.is_nil(artifact_err, tostring(artifact_err))
    test.not_nil(artifact)
    return id
end

local function admit(user: string, id: string, caller: string, refused: boolean?): any
    local args = { kb_id = id, content = CONTENT, content_type = "text/plain", title = "Reference", external_id = "admission:" .. caller, external_version = "v1" }
    if caller == "content" then
        local token = assert(session.mint(assert(groups.get_user_with_groups(user)))).token
        local gateway, gateway_err = system.supervisor.state("app:gateway")
        test.is_nil(gateway_err, tostring(gateway_err))
        local port = assert(gateway.details:match(":(%d+)$"))
        local response, err = http_client.request("POST", "http://127.0.0.1:" .. port .. "/api/knowledge/" .. id .. "/ingest", {
            headers = { Authorization = "Bearer " .. token, ["Content-Type"] = "application/json" }, body = assert(json.encode(args)),
        })
        test.is_nil(err, tostring(err))
        test.eq(response.status_code, refused and 500 or 200, response.body)
        return assert(json.decode(response.body))
    elseif caller == "upload" then
        local upload_id = upload(user)
        local result, err = executor(user):call("app:ingest_upload_probe", { kb_id = id, upload_id = upload_id })
        test.is_nil(err, tostring(err))
        if refused then
            test.is_nil(result.result)
            test.contains(result.error, "content admission refused")
        else
            test.not_nil(result.result, result.error)
        end
        return result.result
    elseif caller == "reference" then
        args.reference = { component_id = "app:admission_content_provider", context = {} }
        local result, err = executor(user, { component_id = id }):call("kickside.knowledge.binding:embed_reference_func", args)
        test.is_nil(err, tostring(err))
        return result
    end
    local fn = caller == "trait" and "kickside.knowledge.traits:kb_embed_tool" or "kickside.knowledge.traits.kb_ingest:embed_content"
    local result, err = executor(user, { kb_ids = { id }, kb_id = id }):call(fn, args)
    if refused then
        test.is_nil(result)
        test.contains(tostring(err), "content admission refused")
    else
        test.is_nil(err, tostring(err))
    end
    return result
end

local function define_tests()
    test.describe("content admission through bound engines", function()
        test.after_each(function()
            for _, id in ipairs(targets) do cleanup.cleanup(id) end
            targets = {}
            for _, id in ipairs(upload_ids) do
                local _, err = uploads.delete_upload(id)
                test.is_nil(err, tostring(err))
            end
            upload_ids = {}
            for _, id in ipairs(users) do
                local _, err = component.system_delete(assert(upload_types.component_id_for_owner(id)))
                test.is_nil(err, tostring(err))
                execute("DELETE FROM app_user_groups WHERE user_id = $1", { id })
                execute("DELETE FROM app_users WHERE user_id = $1", { id })
            end
            users = {}
        end)
        for _, caller in ipairs({ "content", "upload", "reference", "ingest_trait", "trait" }) do
            test.it("returns the binding's refusal for " .. caller, function()
                local user = owner()
                local id = target(user, "document")
                execute("UPDATE kickside_components SET impl_id = 'app:admission_refusing_engine' WHERE component_id = $1", { id })
                local result = admit(user, id, caller, true)
                if caller == "content" or caller == "reference" then
                    test.is_false(result.success)
                    test.contains(result.error, "content admission refused")
                end
                test.eq(#rows("SELECT id FROM kickside_event WHERE thread_id = $1 AND type = 'kickside.knowledge.events:content.upserted'", { id }), 0)
            end)
        end
        for _, engine in ipairs({ "document", "wiki", "memory" }) do
            for _, caller in ipairs({ "content", "upload", "reference", "ingest_trait", "trait" }) do
                test.it("admits " .. caller .. " through the " .. engine .. " binding", function()
                    local user = owner()
                    local id = target(user, engine)
                    local result = admit(user, id, caller)
                    test.is_true(result.success, assert(json.encode(result)))
                    test.eq(result.thread_id, id)
                    if engine == "memory" then
                        test.not_nil(result.run_id)
                    else
                        test.is_nil(result.run_id)
                    end
                    local events = rows("SELECT body, external_id FROM kickside_event WHERE thread_id = $1 AND type = 'kickside.knowledge.events:content.upserted'", { id })
                    if engine ~= "memory" then
                        test.not_nil(result.projection_id)
                        test.eq(#events, 1)
                        local body = assert(json.decode(events[1].body))
                        test.eq(body.content, CONTENT)
                        test.eq(events[1].external_id, result.external_id)
                        test.not_nil(body.source_ref)
                        test.not_nil(result.trace_context)
                    else
                        test.eq(#events, 0)
                        local runs = rows("SELECT input FROM kickside_memory_runs WHERE component_id = $1 AND run_type = 'derive'", { id })
                        test.eq(#runs, 1)
                        local input = assert(json.decode(runs[1].input))
                        test.eq(input.span[1].role, "document")
                        test.eq(input.span[1].author.kind, "document")
                        test.is_nil(input.span[1].author.id)
                        test.contains(input.span[1].text, CONTENT)
                    end
                end)
            end
        end
    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
