local test = require("test")
local registry = require("registry")
local security = require("security")
local funcs = require("funcs")
local fs = require("fs")
local uuid = require("uuid")
local records = require("records")
local content = require("content")
local cleanup = require("cleanup")
local function define_tests()
    test.describe("Module access composition", function()
        local upload_id, storage
        test.after_each(function()
            if upload_id then
                local _, cleanup_err = cleanup.delete_for_upload(upload_id)
                test.is_nil(cleanup_err, tostring(cleanup_err))
                local _, remove_err = storage:remove(upload_id)
                test.is_nil(remove_err, tostring(remove_err))
                upload_id = nil
            end
        end)
        test.it("admits exactly the listed endpoint identities", function()
            local policy_id = "kickside.uploads.security:module_access"
            local declaration, declaration_err = registry.get(policy_id)
            test.is_nil(declaration_err)
            test.not_nil(declaration)
            test.is_nil(declaration.data.policy.conditions)
            local expected = {
                ["kickside.uploads.api:artifact_raw_handler.endpoint"] = true,
                ["kickside.uploads.api:artifacts_handler.endpoint"] = true,
                ["kickside.uploads.api:complete_handler.endpoint"] = true,
                ["kickside.uploads.api:delete_handler.endpoint"] = true,
                ["kickside.uploads.api:get_handler.endpoint"] = true,
                ["kickside.uploads.api:list_handler.endpoint"] = true,
                ["kickside.uploads.api:presigned_handler.endpoint"] = true,
                ["kickside.uploads.api:raw_handler.endpoint"] = true,
                ["kickside.uploads.api:upload_handler.endpoint"] = true,
                ["kickside.uploads.storage:inspect.endpoint"] = true,
                ["kickside.uploads.storage:test.endpoint"] = true,
                ["kickside.uploads.storage:configure.endpoint"] = true,
                ["kickside.uploads.storage:reset.endpoint"] = true,
            }
            local listed = {}
            for _, id in ipairs(declaration.data.policy.resources) do
                test.is_true(expected[id] == true, id)
                test.is_nil(listed[id], id)
                listed[id] = true
                local entry, err = registry.get(id)
                test.is_nil(err, id)
                test.not_nil(entry, id)
                test.eq(entry.kind, "http.endpoint", id)
            end
            for id in pairs(expected) do test.is_true(listed[id] == true, id) end
            local policy, policy_err = security.policy(policy_id)
            test.is_nil(policy_err)
            local actor = security.new_actor("listed-endpoint-member", {})
            local endpoints, find_err = registry.find({[".kind"] = "http.endpoint"})
            test.is_nil(find_err)
            for _, entry in ipairs(endpoints) do
                local id = tostring(entry.id)
                test.eq(policy:evaluate(actor, "access", id), expected[id] and "allow" or "undefined", id)
            end
            for id in pairs(expected) do
                test.eq(policy:evaluate(actor, "access", id .. ".unlisted"), "undefined", id)
            end
        end)
        test.it("declares a compatible platform Members default for every member requirement", function()
            for _, id in ipairs({"kickside.uploads.security:user_security_scope"}) do
                local requirement, err = registry.get(id)
                test.is_nil(err, id)
                test.not_nil(requirement, id)
                test.eq(requirement.meta.value_kind, "security.scope", id)
                test.eq(requirement.data.default, "kickside.security.groups:members", id)
            end
        end)
        test.it("admits owned member endpoints and rejects other modules", function()
            local policy, err = security.policy("kickside.uploads.security:module_access")
            test.is_nil(err)
            test.not_nil(policy)
            local actor = security.new_actor("module-member", {})
            for _, id in ipairs({
                "kickside.uploads.api:complete_handler.endpoint",
                "kickside.uploads.api:delete_handler.endpoint",
                "kickside.uploads.api:get_handler.endpoint",
                "kickside.uploads.api:list_handler.endpoint",
                "kickside.uploads.api:presigned_handler.endpoint",
                "kickside.uploads.api:upload_handler.endpoint",
                "kickside.uploads.api:raw_handler.endpoint",
                "kickside.uploads.api:artifacts_handler.endpoint",
                "kickside.uploads.api:artifact_raw_handler.endpoint",
            }) do
                test.not_nil(registry.get(id), id)
                test.eq(policy:evaluate(actor, "access", id), "allow", id)
                test.eq(policy:evaluate(actor, "access", (id .. ".unlisted")), "undefined", id)
                test.eq(policy:evaluate(actor, "funcs.call", id), "undefined", id)
            end
            for _, id in ipairs({ "unrelated.module:list.endpoint", "kickside.uploads_extension:list.endpoint" }) do
                test.eq(policy:evaluate(actor, "access", id), "undefined", id)
            end
        end)
        test.it("includes module discovery without an application blanket grant", function()
            local policies, seen = {}, {}
            local function include(id)
                if seen[id] then return end
                seen[id] = true
                local entry, entry_err = registry.get(id)
                test.is_nil(entry_err, id)
                test.not_nil(entry, id)
                local policy, policy_err = security.policy(id)
                test.is_nil(policy_err, id)
                policies[#policies + 1] = policy
                for _, child in ipairs(entry.meta.includes or {}) do include(child) end
            end
            include("kickside.uploads.security:module_access")
            local declaration = registry.get("kickside.uploads.security:module_access")
            test.is_true(type(declaration.meta.title) == "string" and declaration.meta.title ~= "")
            test.eq(declaration.meta.intent, "module_access")
            test.eq(declaration.meta.surface, "kickside.uploads")
            test.is_true(declaration.meta.private ~= true)
            local scope, scope_err = security.new_scope(policies)
            test.is_nil(scope_err)
            local actor = security.new_actor("module-member", {})
            test.eq(scope:evaluate(actor, "registry.get", "kickside.uploads:retention"), "allow")
            test.eq(scope:evaluate(actor, "funcs.call", "kickside.convert.doc2md:converter"), "allow")
            test.eq(scope:evaluate(actor, "funcs.call", "kickside.convert.doc2md:page_resources"), "allow")
            local converted, convert_err = funcs.new():with_actor(actor):with_scope(scope)
                :call("kickside.convert.doc2md:converter", { bytes = "Northwind member conversion NW-MEMBER-CONVERT-731", options = { ["extract-images"] = false } })
            test.is_nil(convert_err, tostring(convert_err))
            test.not_nil(converted)
            test.is_true(converted.ok.markdown:find("NW-MEMBER-CONVERT-731", 1, true) ~= nil)

            policies[#policies + 1] = assert(security.policy("kickside.uploads.test.module_access:storage_access"))
            local member_scope = assert(security.new_scope(policies))
            upload_id = uuid.v4()
            storage = assert(fs.get("app:uploads"))
            local bytes = "Northwind member knowledge upload NW-MEMBER-CONVERT-731. Returns take 17 days."
            local _, write_err = storage:writefile(upload_id, bytes)
            test.is_nil(write_err, tostring(write_err))
            local kb_id = uuid.v4()
            local _, record_err = records.create(upload_id, actor:id(), #bytes, "text/plain",
                "app:uploads", upload_id, "documents", { filename = "member-handbook.txt" }, "uploaded")
            test.is_nil(record_err, tostring(record_err))
            local result, process_err = funcs.new():with_actor(actor):with_scope(member_scope)
                :call("kickside.uploads.documents:processor", {
                    upload_id = upload_id, storage_id = "app:uploads", storage_path = upload_id,
                    mime_type = "text/plain", size = #bytes, options = { extract_images = false },
                    metadata = { filename = "member-handbook.txt", reference_component_id = kb_id },
                })
            test.is_nil(process_err, tostring(process_err))
            test.is_true(result.success)
            local markdown, read_err, _, artifact = content.read_artifact_content(
                upload_id, result.metadata.primary_artifact_id)
            test.is_nil(read_err, tostring(read_err))
            test.is_true(markdown:find("NW-MEMBER-CONVERT-731", 1, true) ~= nil)
            test.eq(artifact.metadata.reference_component_id, kb_id)
            test.eq(member_scope:evaluate(actor, "funcs.call", "unrelated.module:converter"), "undefined")

            for _, action in ipairs({ "access", "registry.get", "funcs.call" }) do
                test.eq(scope:evaluate(actor, action, "unrelated.module:list.endpoint"), "undefined", action)
            end
        end)
    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
