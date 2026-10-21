local test = require("test")
local fs = require("fs")
local sql = require("sql")
local uuid = require("uuid")
local registry = require("registry")
local funcs = require("funcs")
local security = require("security")
local policy = require("policy")
local locations = require("locations")
local records = require("records")
local resources = require("resources")
local offload = require("offload")
local cloud = require("cloud")
local backend = require("backend")
local racing_fs = require("racing_fs")
local DB = "app:db"
local STORAGE = "app:uploads"
local POLICY = { mode = "s3", resource_id = "app.upload_storage:fake", prefix = "storage-tests" }
local files = {}

local function exec(statement: string, args: any): any
    local db = assert(sql.get(DB))
    local result, err = db:execute(statement, args)
    db:release()
    test.is_nil(err, tostring(err))
    return result
end

local function original(): (any, string)
    local id = uuid.v4()
    local content = "original verified bytes " .. id
    local path = "storage-test-" .. id
    files[#files + 1] = { id = id, path = path }
    test.not_nil(assert(fs.get(STORAGE)):writefile(path, content))
    local record, err = records.create(id, "storage-unit", #content, "text/plain", STORAGE, path, "text", { filename = "file.txt" }, "completed")
    test.is_nil(err, tostring(err))
    test.not_nil(record)
    return { storage_id = STORAGE, storage_path = path, mime_type = "text/plain" }, content
end

local function location(object: any): any
    local row, err = locations.get(DB, STORAGE, object.storage_path, nil)
    test.is_nil(err, tostring(err))
    return row
end

return { run = test.run_cases(function()
    test.describe("processed upload storage ownership", function()
        test.after_each(function()
            for _, item in ipairs(files) do
                exec("DELETE FROM kickside_upload_storage_locations WHERE storage_id=$1 AND storage_path=$2", { STORAGE, item.path })
                exec("DELETE FROM kickside_uploads WHERE uuid=$1", { item.id })
                local storage = assert(fs.get(STORAGE))
                if storage:exists(item.path) then storage:remove(item.path) end
            end
            files = {}
            cloud.reset("normal")
            racing_fs.reset()
        end)

        test.it("rejects unsafe and undeclared storage settings", function()
            test.is_true(policy.validate({ value = { mode = "local", resource_id = "", prefix = "uploads" } }).valid)
            for _, value in ipairs({
                { mode = "invalid", resource_id = "", prefix = "uploads" },
                { mode = "local", resource_id = "", prefix = "../uploads" },
                { mode = "local", resource_id = "", prefix = "/uploads" },
                { mode = "local", resource_id = "", prefix = "uploads//files" },
                { mode = "local", resource_id = "", prefix = "uploads", extra = true },
                { mode = "s3", resource_id = "other:resource", prefix = "uploads" },
            }) do test.is_false(policy.validate({ value = value }).valid) end
        end)

        test.it("keeps overlay writes inside the owner's native resource namespace", function()
            local actor = assert(security.new_actor("storage-overlay-test", {}))
            local writes = assert(security.policy("kickside.uploads.storage.service:overlay_entries"))
            test.eq(writes:evaluate(actor, "registry.overlay.create.cloudstorage.s3", "kickside.uploads.storage.runtime:s3_test"), "allow")
            test.eq(writes:evaluate(actor, "registry.overlay.create.cloudstorage.s3", "app:unrelated"), "undefined")
            test.eq(writes:evaluate(actor, "registry.apply", "kickside.uploads.storage.runtime:s3_test"), "undefined")
            local cloud_policy = assert(security.policy("kickside.uploads.storage.security:cloud"))
            test.eq(cloud_policy:evaluate(actor, "cloudstorage.get", "kickside.uploads.storage.runtime:s3_test"), "allow")
            test.eq(cloud_policy:evaluate(actor, "cloudstorage.get", "unrelated:s3"), "undefined")
        end)

        test.it("denies destination discovery, probes, and writes to non-administrators", function()
            local scope = assert(security.new_scope({ assert(security.policy("app:upload_runtime_resources")) }))
            local executor = assert(funcs.new():with_actor(assert(security.new_actor("storage-member", {}))):with_scope(scope))
            for _, request in ipairs({ { storage_method = "GET" }, { storage_method = "POST" },
                { storage_method = "POST", storage_action = "configure" },
                { storage_method = "DELETE", storage_action = "configure" } }) do
                local result, err = executor:with_context(request):call("app.upload_storage:settings_probe", {})
                test.is_nil(err, tostring(err))
                test.eq(result.status, 403)
                test.is_false(result.body.success)
                test.is_nil(result.body.resources)
            end
        end)

        test.it("rejects invalid administrator settings and acknowledges policy reset", function()
            local executor = assert(funcs.new():with_actor(assert(security.new_actor("storage-admin", {})))
                :with_scope(assert(security.named_scope("wippy.security:process"))))
            local invalid, invalid_err = executor:with_context({ storage_method = "POST", storage_action = "configure",
                storage_body = { mode = "local", resource_id = "", prefix = "../unsafe" } }):call("app.upload_storage:settings_probe", {})
            test.is_nil(invalid_err, tostring(invalid_err))
            test.eq(invalid.status, 400)
            local reset, reset_err = executor:with_context({ storage_method = "DELETE", storage_action = "configure" })
                :call("app.upload_storage:settings_probe", {})
            test.is_nil(reset_err, tostring(reset_err))
            test.eq(reset.status, 200)
            test.is_true(reset.body.success)
            test.eq(assert(policy.current()).mode, "local")
        end)

        test.it("reconciles its owned overlay without changing registry history", function()
            local before = assert(registry.current_version()):id()
            local result, err = funcs.call("kickside.uploads.storage.service:request", {})
            test.is_nil(err, tostring(err))
            test.is_true(result.success)
            test.eq(assert(registry.current_version()):id(), before)
            local current, current_err = policy.current()
            test.is_nil(current_err, tostring(current_err))
            test.eq(current.mode, "local")
        end)

        test.it("reuses the caller transaction for storage resolution", function()
            local object, content = original()
            local db = assert(sql.get(DB))
            local tx = assert(db:begin())
            local storage, storage_err = resources.get_storage(STORAGE, tx)
            test.is_nil(storage_err)
            local actual, read_err = storage:readfile(object.storage_path)
            test.is_nil(read_err, tostring(read_err))
            test.eq(actual, content)
            tx:rollback()
            db:release()
        end)

        test.it("retains local content after an uncertain upload failure", function()
            local object, content = original()
            cloud.reset("upload_error")
            local result, err = offload.place(object, POLICY, nil)
            test.is_nil(result)
            test.not_nil(err)
            test.eq(assert(fs.get(STORAGE)):readfile(object.storage_path), content)
            test.eq(location(object).state, "copying")
        end)

        test.it("detects same-size corruption before committing a destination", function()
            local object, content = original()
            cloud.reset("corrupt")
            local result, err = offload.place(object, POLICY, nil)
            test.is_nil(result)
            test.contains(tostring(err), "integrity")
            test.eq(assert(fs.get(STORAGE)):readfile(object.storage_path), content)
            test.eq(location(object).state, "copying")
        end)

        test.it("observes cancellation before committing or removing local bytes", function()
            local object, content = original()
            cloud.reset("normal")
            local result, err = offload.place(object, POLICY, { should_continue = function() return false, "cancelled" end })
            test.is_nil(result)
            test.eq(err, "cancelled")
            test.eq(assert(fs.get(STORAGE)):readfile(object.storage_path), content)
            test.eq(location(object).state, "copying")
        end)

        test.it("retries the same durable object and reclaims local bytes only after verification", function()
            local object, content = original()
            cloud.reset("upload_error")
            offload.place(object, POLICY, nil)
            local key = location(object).object_key
            cloud.set_mode("normal")
            local result, err = offload.place(object, POLICY, nil)
            test.is_nil(err, tostring(err))
            test.is_true(result.placed)
            test.eq(location(object).object_key, key)
            test.eq(location(object).state, "ready")
            test.eq(cloud.bytes(key), content)
            test.is_false(assert(fs.get(STORAGE)):exists(object.storage_path))
            test.eq(cloud.upload_count(), 2)
            local repeated, repeated_err = offload.place(object, POLICY, nil)
            test.is_nil(repeated_err, tostring(repeated_err))
            test.is_true(repeated.placed)
            test.eq(cloud.upload_count(), 2)
        end)

        test.it("cannot commit bytes whose owning record was deleted", function()
            local path = "removed-" .. uuid.v4()
            local row = assert(locations.claim(DB, STORAGE, path, POLICY.resource_id, POLICY.prefix))
            files[#files + 1] = { id = "absent", path = path }
            local ready, err = locations.ready(DB, row, 1, "digest", '"etag"')
            test.is_nil(err, tostring(err))
            test.is_false(ready)
        end)

        test.it("recovers interruption between location commit and local reclamation", function()
            local object = original()
            local row = assert(locations.claim(DB, STORAGE, object.storage_path, POLICY.resource_id, POLICY.prefix))
            test.is_true(assert(locations.ready(DB, row, 1, "digest", '"etag"')))
            cloud.reset("upload_error")
            local result, err = offload.place(object, POLICY, nil)
            test.is_nil(err, tostring(err))
            test.is_true(result.placed)
            test.eq(cloud.upload_count(), 0)
            test.is_false(assert(fs.get(STORAGE)):exists(object.storage_path))
        end)

        for _, operation in ipairs({ "open", "readfile", "stat", "exists" }) do
            test.it("keeps " .. operation .. " available when placement commits between resolution and local IO", function()
                local object, content = original()
                local row = assert(locations.claim(DB, STORAGE, object.storage_path, POLICY.resource_id, POLICY.prefix))
                local native = assert(fs.get(STORAGE))
                local reader = assert(native:open(object.storage_path, "r"))
                test.not_nil(assert(cloud.get(POLICY.resource_id):upload_object(row.object_key, reader, {})))
                reader:close()
                racing_fs.arm(object.storage_path, operation, function()
                    test.is_true(assert(locations.ready(DB, row, #content, "verified", '"fake-etag"')))
                    test.not_nil(native:remove(object.storage_path))
                end)
                local storage = assert(backend.get(STORAGE, DB, STORAGE, nil, nil))
                local result, err = storage[operation](storage, object.storage_path)
                test.is_nil(err, tostring(err))
                if operation == "open" then
                    test.not_nil(result)
                    test.eq(result:read(#content), content)
                    result:close()
                elseif operation == "readfile" then test.eq(result, content)
                elseif operation == "stat" then test.eq(result.size, #content)
                else test.is_true(result) end
                test.is_false(native:exists(object.storage_path))
            end)
        end
    end)
end) }
