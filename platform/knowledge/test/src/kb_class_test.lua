-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local json = require("json")
local funcs = require("funcs")
local security = require("security")
local http_client = require("http_client")
local test_gateway = require("test_gateway")
local session = require("session")
local groups = require("groups")
local fixture_cleanup = require("fixture_cleanup")
local provision = require("provision")
local upload_types = require("upload_types")
local upload_records = require("upload_records")
local artifacts = require("artifacts")
local fs = require("fs")

local owners, targets, uploads, upload_owners = {}, {}, {}, {}
local function query(statement: string, params: any): any
    local db = assert(sql.get("app:db"))
    local result, err = db:query(statement, params)
    db:release()
    assert(not err, tostring(err))
    return result
end
local function execute(statement: string, params: any)
    local db = assert(sql.get("app:db"))
    local _, err = db:execute(statement, params)
    db:release()
    assert(not err, tostring(err))
end
local function executor(owner: string): any
    return funcs.new():with_actor(security.new_actor(owner, {}))
        :with_scope(security.new_scope({ assert(security.policy("app:user")) }))
end
local function probe(owner: string, args: any): any
    local result, err = executor(owner):call("app.kb_class:probe", args)
    test.is_nil(err, tostring(err))
    return result
end
local function fixture(provisioned: boolean?, real_kb: boolean?): (string, string)
    local owner = "kb-class-" .. uuid.v7()
    owners[#owners + 1] = owner
    local db = assert(sql.get("app:db"))
    local now = db:type() == sql.type.SQLITE and "strftime('%s', 'now')" or "now()"
    db:release()
    execute("INSERT INTO app_users (user_id,email,full_name,password_hash,status,created_at,updated_at) VALUES ($1,$2,'Class test','!test','active'," .. now .. "," .. now .. ")", { owner, owner .. "@knowledge.test" })
    execute("INSERT INTO app_user_groups (user_id,group_id,created_at) VALUES ($1,'app:user'," .. now .. ")", { owner })
    local created = probe(owner, { action = "create", provisioned = provisioned, non_kb = not real_kb })
    targets[#targets + 1] = created.id
    test.eq(probe(owner, { action = "read", id = created.id }).class, real_kb and "knowledge_base" or "thread")
    return owner, created.id
end
local function request(owner: string, id: string, method: string, suffix: string, body: any): any
    local token = assert(session.mint(assert(groups.get_user_with_groups(owner)))).token
    local response, err = http_client.request(method, test_gateway.url() .. "/api/knowledge/" .. id .. suffix, {
        headers = { Authorization = "Bearer " .. token, ["Content-Type"] = "application/json" },
        body = assert(json.encode(body or {})),
    })
    test.is_nil(err, tostring(err))
    return { status = response.status_code, body = assert(json.decode(response.body)) }
end
local function upload(owner: string): string
    assert(provision.ensure_user(security.new_actor(owner, {}), security.named_scope("wippy.security:process"), owner))
    upload_owners[owner] = true
    local id = uuid.v7()
    uploads[#uploads + 1] = id
    local content = "Class boundary fixture"
    assert(assert(fs.get("app:uploads")):writefile(id, content))
    local _, err = upload_records.create(id, owner, #content, "text/plain", "app:uploads", id, "documents", {}, "completed")
    test.is_nil(err, tostring(err))
    local artifact, artifact_err = artifacts.create_artifact({ upload_id = id, kind = "text", role = "primary",
        mime_type = "text/plain", content = content, storage_id = "app:uploads" })
    test.is_nil(artifact_err, tostring(artifact_err))
    test.not_nil(artifact)
    return id
end
local function event_count(id: string): number
    return #query("SELECT id FROM kickside_event WHERE thread_id=$1 AND type IN ('kickside.knowledge.events:content.upserted','kickside.knowledge.events:content.deleted')", { id })
end
local function unchanged(owner: string, id: string)
    local meta = probe(owner, { action = "read", id = id })
    test.eq(meta.title, "Before", "title must remain unchanged")
    test.eq(meta.class, "thread", "class must remain unchanged")
end
local function rejected(response: any)
    test.eq(response.status, 400, assert(json.encode(response.body)))
    test.is_false(response.body.success)
    test.contains(response.body.error, "component is not a knowledge base")
end

return { run = test.run_cases(function()
    test.describe("Knowledge class boundary", function()
        test.after_each(function()
            for _, id in ipairs(targets) do fixture_cleanup.cleanup(id) end
            targets = {}
            for owner in pairs(upload_owners) do fixture_cleanup.cleanup(assert(upload_types.component_id_for_owner(owner))) end
            upload_owners = {}
            for _, id in ipairs(uploads) do execute("DELETE FROM kickside_uploads WHERE uuid=$1", { id }) end
            uploads = {}
            for _, owner in ipairs(owners) do
                execute("DELETE FROM app_user_groups WHERE user_id=$1", { owner })
                execute("DELETE FROM app_users WHERE user_id=$1", { owner })
            end
            owners = {}
        end)
        test.it("get_kb hides readable non-KB details", function()
            local owner, id = fixture()
            local response = request(owner, id, "GET", "", {})
            unchanged(owner, id)
            test.eq(response.status, 404, "non-KB details must be hidden; got " .. tostring(response.body.name))
            test.is_false(response.body.success)
            test.eq(response.body.error, "knowledge base not found")
            test.is_nil(response.body.name)
        end)
        test.it("delete_content rejects a writable non-KB before appending", function()
            local owner, id = fixture(true)
            local before = event_count(id)
            local response = request(owner, id, "DELETE", "/content", { external_id = "class-fixture" })
            unchanged(owner, id)
            test.eq(event_count(id), before, "content delete must not append an event")
            rejected(response)
        end)
        test.it("ingest_existing_upload rejects a writable non-KB before ingestion", function()
            local owner, id = fixture(true)
            local upload_id = upload(owner)
            local before = event_count(id)
            local response = request(owner, id, "POST", "/ingest-upload", { upload_id = upload_id })
            unchanged(owner, id)
            test.eq(event_count(id), before, "upload ingestion must not append an event")
            rejected(response)
        end)
        test.it("upload_token rejects a writable non-KB before issuing a token", function()
            local owner, id = fixture()
            local before = event_count(id)
            local response = request(owner, id, "POST", "/upload-token", {})
            unchanged(owner, id)
            test.eq(event_count(id), before)
            test.is_false(response.body.upload_token ~= nil, "must not issue a token for future writes")
            rejected(response)
        end)
        test.it("registry_update rejects a writable non-KB without changing metadata", function()
            local owner, id = fixture()
            local result = probe(owner, { action = "update", id = id })
            test.eq(result.after.title, result.before.title, "registry update must not change title")
            test.eq(result.after.comment, result.before.comment, "registry update must not change comment")
            test.is_false(result.updated)
            test.is_true(result.invalid, tostring(result.error))
        end)
        test.it("retry_source rejects a writable non-KB before reading retry state", function()
            local owner, id = fixture(true)
            local before = event_count(id)
            local response = request(owner, id, "POST", "/retry-source", { node_id = uuid.v7(), failed_event_id = uuid.v7() })
            unchanged(owner, id)
            test.eq(event_count(id), before)
            rejected(response)
        end)
        test.it("ingest_content rejects a writable non-KB before appending", function()
            local owner, id = fixture(true)
            local before = event_count(id)
            local response = request(owner, id, "POST", "/ingest", { content = "Class fixture" })
            unchanged(owner, id)
            test.eq(event_count(id), before, "content ingestion must not append an event")
            rejected(response)
        end)
        for _, case in ipairs({
            { name = "kb_embed", fn = "kickside.knowledge.traits:kb_embed_tool", args = { content = "Class fixture" } },
            { name = "embed_content", fn = "kickside.knowledge.traits.kb_ingest:embed_content", args = { content = "Class fixture" } },
            { name = "delete_trait", fn = "kickside.knowledge.traits.kb_ingest:delete_content", args = { external_id = "class-fixture" } },
            { name = "select_kb", fn = "kickside.knowledge.traits.kb_ingest:select_kb", args = {} },
            { name = "fetch_url", fn = "kickside.knowledge.traits.kb_ingest:fetch_url", args = { url = "http://127.0.0.1/never-fetch" } },
        }) do
            test.it(case.name .. " rejects a writable non-KB before effects", function()
                local owner, id = fixture(true)
                local before = event_count(id)
                local args = {}
                for key, value in pairs(case.args) do args[key] = value end
                args.kb_id = id
                local result, err = executor(owner):call(case.fn, args)
                unchanged(owner, id)
                test.eq(event_count(id), before, case.name .. " must not append an event")
                test.is_nil(result, case.name .. " must not return a successful receipt")
                test.is_true(errors.is(err, errors.INVALID), tostring(err))
            end)
        end
        test.it("upload_core rejects a writable non-KB before appending", function()
            local owner, id = fixture(true)
            local before = event_count(id)
            local result = probe(owner, { action = "upload_core", id = id, upload_id = upload(owner) })
            unchanged(owner, id)
            test.eq(event_count(id), before, "shared upload ingestion must not append an event")
            test.is_nil(result.result)
            test.is_true(result.invalid, result.error)
        end)
        for _, action in ipairs({ "query", "config" }) do
            test.it(action .. " rejects a readable non-KB before reading its store", function()
                local owner, id = fixture()
                local result = probe(owner, { action = action, id = id })
                unchanged(owner, id)
                test.eq(result.calls, 0, "must not read KB data for another component class")
                test.is_nil(result.result)
                test.contains(result.error, "component is not a knowledge base")
            end)
        end
        test.it("manager maintenance already rejects another component class", function()
            local owner, id = fixture()
            local result, err = executor(owner):call("kickside.knowledge.traits:knowledge_manager_tool", {
                action = "resummarize_knowledge_base", component_id = id,
            })
            unchanged(owner, id)
            test.is_nil(result)
            test.is_true(errors.is(err, errors.INVALID), tostring(err))
        end)
        test.it("real KB details and registry metadata update still succeed", function()
            local owner, id = fixture(true, true)
            local response = request(owner, id, "GET", "", {})
            test.eq(response.status, 200)
            test.eq(response.body.name, "Before")
            local result = probe(owner, { action = "update", id = id })
            test.is_true(result.updated, tostring(result.error))
            test.eq(result.after.title, "After")
        end)
        test.it("real KB token and registry update preserve WRITE-only access", function()
            local owner, id = fixture(true, true)
            execute("UPDATE kickside_component_access SET access_mask=2 WHERE component_id=$1 AND subject_id=$2", { id, owner })
            local response = request(owner, id, "POST", "/upload-token", {})
            test.eq(response.status, 200)
            test.is_true(type(response.body.upload_token) == "string")
            local result = probe(owner, { action = "update_write_only", id = id })
            test.is_true(result.updated, result.error)
            test.eq(query("SELECT value FROM kickside_component_meta WHERE component_id=$1 AND key='title'", { id })[1].value, "After")
        end)
    end)
end) }
