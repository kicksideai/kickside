-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local uuid = require("uuid")
local security = require("security")
local funcs = require("funcs")
local contract = require("contract")
local fs = require("fs")
local records = require("records")
local sql = require("sql")
local registry = require("registry")
local http_client = require("http_client")
local types = require("types")
local upload_tokens = require("upload_tokens")

local function call_as(actor_id, target, upload_id, args)
    local actor = security.new_actor(actor_id, {security_groups = {"app:uploads_test"}})
    return funcs.new():with_actor(actor):with_scope(security.named_scope("wippy.security:process"))
        :with_context({upload_id = upload_id}):call(target, args or {})
end

return {run = test.run_cases(function()
    test.describe("Referenced upload bytes", function()
        local owner, writer, reader, upload_id, storage, tokens
        local function register(actor, metadata, component_id, impl_id)
            local result, err = call_as(actor, "kickside.component.binding:register_component_func", upload_id,
                {impl_id = impl_id or "kickside.core:thread", component_id = component_id, meta = metadata or {}})
            test.is_nil(err, tostring(err))
            test.is_true(result.success, result.error)
            return result.component_id
        end
        local function share(actor, id, subject, mask)
            local result, err = call_as(actor, "kickside.component.binding:grant_subtree_func", upload_id,
                {root_component_id = id, subject = {subject_id = subject, subject_type = "user"}, access_mask = mask})
            test.is_nil(err, tostring(err))
            test.is_true(result.success, result.error)
        end
        local function raw(actor, query, id, suffix)
            local token = assert(tokens:create(security.new_actor(actor, {security_groups = {"app:uploads_test"}}),
                security.named_scope("wippy.security:process"), {expiration = "1h"}))
            local gateway = assert(registry.get("app:gateway"))
            local port = assert(tostring(gateway.data.addr):match(":(%d+)$"))
            local response, err = http_client.get("http://127.0.0.1:" .. port .. "/reference/uploads/" .. (id or upload_id) .. (suffix or "/raw") .. (query or ""),
                {headers = {Authorization = "Bearer " .. token}})
            test.is_nil(err, tostring(err))
            if query == nil and id == nil and suffix == nil then
                local page_api = assert(assert(contract.get("kickside.uploads:page_images"))
                    :with_actor(security.new_actor(actor, {security_groups = {"app:uploads_test"}}))
                    :with_scope(security.named_scope("wippy.security:process")):open())
                local info, page_err = page_api:get_info({upload_id = upload_id})
                if response.status_code == 200 then
                    test.is_nil(page_err, tostring(page_err)); test.eq(info.state, "not_paged")
                else
                    test.is_nil(info); test.is_true(errors.is(page_err, errors.NOT_FOUND))
                end
            end
            return response
        end
        local function legacy_reference(actor, metadata)
            local id = register(actor)
            local db = assert(sql.get("app:db"))
            for key, value in pairs(metadata) do
                assert(db:execute("INSERT INTO kickside_component_meta (meta_id,component_id,key,value,created_at,updated_at) VALUES ($1,$2,$3,$4,'2026-01-01T00:00:00Z','2026-01-01T00:00:00Z')",
                    {uuid.v4(), id, key, value}))
            end
            db:release()
            return id
        end
        local function denied(result, err)
            test.is_nil(err, tostring(err))
            test.is_false(result.success)
            test.eq(result.kind, errors.PERMISSION_DENIED)
        end
        test.before_each(function()
            owner, writer, reader, upload_id = uuid.v4(), uuid.v4(), uuid.v4(), uuid.v4()
            storage = assert(fs.get("app:uploads"))
            assert(storage:writefile(upload_id, "private bytes"))
            assert(records.create(upload_id, owner, 13, "text/plain", "app:uploads", upload_id,
                "kickside.uploads:types.generic", {filename = "private.txt"}, "completed"))
            local db = assert(sql.get("app:db"))
            for _, actor in ipairs({owner, writer, reader}) do
                assert(db:execute("INSERT INTO app_users (user_id,email,full_name,password_hash,status) VALUES ($1,$2,$1,'test-only','active')",
                    {actor, actor .. "@uploads.test"}))
                assert(db:execute("INSERT INTO app_user_groups (user_id,group_id) VALUES ($1,$2)", {actor, "app:uploads_test"}))
            end
            db:release()
            tokens = assert(security.token_store("kickside.users.security:tokens"))
        end)
        test.after_each(function()
            if tokens then tokens:close() end
            assert(storage:remove(upload_id))
        end)
        test.it("denies a reference registered by a different upload owner", function()
            local result, err = call_as(writer, "kickside.component.binding:register_component_func", upload_id,
                {impl_id = "kickside.core:thread", meta = {upload_id = upload_id}})
            denied(result, err)
            test.eq(raw(writer).status_code, 404)
        end)
        test.it("denies a reference added through metadata updates", function()
            local id = register(writer)
            local result, err = call_as(writer, "kickside.component.binding:set_meta_component_func", upload_id,
                {component_id = id, fields = {upload_id = upload_id}})
            test.is_nil(err, tostring(err))
            denied(result, err)
            test.eq(raw(writer).status_code, 404)
        end)
        test.it("denies assignments on a shared component created by the upload owner", function()
            local id = register(owner)
            share(owner, id, writer, 3)
            for _, target in ipairs({"kickside.component.binding:set_meta_component_func", "kickside.component.binding:update_component_func"}) do
                local args = {component_id = id, fields = {upload_id = upload_id}}
                if target == "kickside.component.binding:update_component_func" then
                    args = {component_id = id, commands = {{type = "SET_META", payload = {fields = {upload_id = upload_id}}}}}
                end
                local result, err = call_as(writer, target, upload_id, args)
                test.eq(raw(writer).status_code, 404)
                denied(result, err)
            end
        end)
        test.it("rejects replacement of an authorized reference by a writer without upload READ", function()
            local other = uuid.v4()
            assert(records.create(other, writer, 13, "text/plain", "app:uploads", upload_id,
                "kickside.uploads:types.generic", {filename = "shared.txt"}, "completed"))
            local id = register(owner)
            share(owner, id, writer, 3)
            local assigned, assign_err = call_as(writer, "kickside.component.binding:set_meta_component_func", upload_id,
                {component_id = id, fields = {upload_id = other}})
            test.is_nil(assign_err, tostring(assign_err)); test.is_true(assigned.success, assigned.error)
            local replaced, replace_err = call_as(writer, "kickside.component.binding:set_meta_component_func", upload_id,
                {component_id = id, fields = {upload_id = upload_id}})
            denied(replaced, replace_err)
            test.eq(raw(writer).status_code, 404)
        end)
        test.it("keeps stored owner references readable by shared recipients", function()
            local id = legacy_reference(owner, {upload_id = upload_id})
            share(owner, id, reader, 1)
            local response = raw(reader)
            test.eq(response.status_code, 200, response.body)
            test.eq(response.body, "private bytes")
            test.eq(raw(writer).status_code, 404)
            test.eq(raw(owner).status_code, 200)
        end)
        test.it("accepts any authorized readable reference alongside an unauthorized reference", function()
            legacy_reference(reader, {upload_id = upload_id})
            for _ = 1, 2 do
                share(owner, register(owner, {upload_id = upload_id}), reader, 1)
            end
            test.eq(raw(reader).status_code, 200)
        end)
        test.it("checks the creating principal's live upload READ and honors revocation", function()
            local container = register(owner, {}, types.component_id_for_owner(owner), types.IMPL)
            local reference = legacy_reference(writer, {upload_id = upload_id})
            share(writer, reference, reader, 1)
            share(owner, container, writer, 2)
            test.eq(raw(reader).status_code, 404)
            share(owner, container, writer, 1)
            test.eq(raw(reader).status_code, 200)
            local revoked, revoke_err = call_as(owner, "kickside.component.binding:revoke_subtree_func", upload_id,
                {root_component_id = container, subject = {subject_id = writer, subject_type = "user"}})
            test.is_nil(revoke_err, tostring(revoke_err))
            test.is_true(revoked.success, revoked.error)
            test.eq(raw(reader).status_code, 404)
        end)
        test.it("authorizes assignments with uploads READ and rejects them after revocation", function()
            local container = register(owner, {}, types.component_id_for_owner(owner), types.IMPL)
            share(owner, container, writer, 2)
            local refused, refuse_err = call_as(writer, "kickside.component.binding:register_component_func", upload_id,
                {impl_id = "kickside.core:thread", meta = {upload_id = upload_id}})
            denied(refused, refuse_err)
            share(owner, container, writer, 1)
            local reference = register(writer, {upload_id = upload_id})
            share(writer, reference, reader, 1)
            test.eq(raw(reader).status_code, 200)
            local revoked, revoke_err = call_as(owner, "kickside.component.binding:revoke_subtree_func", upload_id,
                {root_component_id = container, subject = {subject_id = writer, subject_type = "user"}})
            test.is_nil(revoke_err, tostring(revoke_err)); test.is_true(revoked.success, revoked.error)
            local reassigned, reassign_err = call_as(writer, "kickside.component.binding:set_meta_component_func", upload_id,
                {component_id = reference, fields = {upload_id = upload_id}})
            denied(reassigned, reassign_err)
            test.eq(raw(reader).status_code, 404)
        end)
        test.it("preserves upload-scoped read tokens used by document readers", function()
            register(owner,{},types.component_id_for_owner(owner),types.IMPL)
            local issued,issue_err=call_as(owner,"kickside.uploads.tokens:pack_read",upload_id,{upload_id=upload_id})
            test.is_nil(issue_err,tostring(issue_err));test.is_nil(issued.error,tostring(issued.error))
            local capability=assert(issued.value)
            test.eq(raw(reader, "?token=" .. capability).status_code, 200)
            local other_id=uuid.v4()
            assert(records.create(other_id,owner,13,"text/plain","app:uploads",upload_id,
                "kickside.uploads:types.generic",{filename="other.txt"},"completed"))
            local other_issued,other_err=call_as(owner,"kickside.uploads.tokens:pack_read",other_id,{upload_id=other_id})
            test.is_nil(other_err,tostring(other_err));test.is_nil(other_issued.error,tostring(other_issued.error))
            local other=assert(other_issued.value)
            test.eq(raw(reader, "?token=" .. other).status_code, 404)
        end)
        test.it("denies a legacy reference whose owner metadata changes before the update", function()
            local id = legacy_reference(writer, {upload_id = upload_id})
            local db = assert(sql.get("app:db"))
            assert(db:execute("UPDATE kickside_component_meta SET value=$1 WHERE component_id=$2 AND key='owner'", {owner, id}))
            assert(db:execute("UPDATE kickside_components SET private_context=$1, identity_hash=NULL WHERE component_id=$2", {"{}", id}))
            db:release()
            local response = raw(writer)
            test.eq(response.status_code, 404, response.body)
        end)
        test.it("denies stored owner metadata forgery while retaining captured identity", function()
            local id = legacy_reference(writer, {upload_id = upload_id})
            local db = assert(sql.get("app:db"))
            assert(db:execute("UPDATE kickside_component_meta SET value=$1 WHERE component_id=$2 AND key='owner'", {owner, id}))
            db:release()
            test.eq(raw(writer).status_code, 404)
        end)
        test.it("denies references without a captured principal", function()
            local id = register(owner, {upload_id = upload_id})
            share(owner, id, reader, 1)
            local db = assert(sql.get("app:db"))
            assert(db:execute("UPDATE kickside_components SET private_context=$1, identity_hash=NULL WHERE component_id=$2", {"{}", id}))
            db:release()
            test.eq(raw(reader).status_code, 404)
        end)
        test.it("returns identical missing and unreadable upload responses on byte and artifact endpoints", function()
            for _, suffix in ipairs({"/raw", "/artifacts", "/artifacts/" .. uuid.v4() .. "/raw"}) do
                local missing = raw(reader, nil, uuid.v4(), suffix)
                local unreadable = raw(reader, nil, upload_id, suffix)
                test.eq(unreadable.status_code, 404, unreadable.body)
                test.eq(unreadable.status_code, missing.status_code)
                test.eq(unreadable.body, missing.body)
            end
        end)
        test.it("does not accept a public owner replacement to authorize a reference", function()
            local id = legacy_reference(writer, {upload_id = upload_id})
            local changed, err = call_as(writer, "kickside.component.binding:set_meta_component_func", upload_id,
                {component_id = id, fields = {owner = owner}})
            test.is_nil(err, tostring(err))
            test.is_true(changed.success, changed.error)
            test.eq(raw(writer).status_code, 404)
        end)
    end)
end)}
