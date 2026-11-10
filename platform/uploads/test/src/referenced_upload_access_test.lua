local test = require("test")
local uuid = require("uuid")
local security = require("security")
local funcs = require("funcs")
local contract = require("contract")
local provision = require("provision")
local records = require("records")
local sql = require("sql")
local fs = require("fs")
local artifacts_repo = require("artifacts")

-- A component that references an upload through meta.upload_id grants its
-- readers the upload: the original bytes, every derived artifact and the page
-- map. A caller without READ on such a component reads none of them.

local GROUP = "app:uploads_test"
local SCOPE = "wippy.security:process"

local function actor_of(id: string): any
    return security.new_actor(id, { security_groups = { GROUP } })
end

local function run_as(id: string, target: string, ctx: any, args: any?): (any, any)
    return funcs.new():with_actor(actor_of(id)):with_scope(security.named_scope(SCOPE))
        :with_context(ctx):call(target, args or {})
end

local function seed_user(id: string)
    local db = assert(sql.get("app:db"))
    local _, user_err = db:execute([[INSERT INTO app_users
        (user_id,email,full_name,password_hash,status)
        VALUES ($1,$2,$1,'test-only','active')]], { id, id .. "@uploads.test" })
    test.is_nil(user_err, tostring(user_err))
    for _, group_id in ipairs({ GROUP, SCOPE }) do
        local _, group_err = db:execute("INSERT INTO app_user_groups (user_id,group_id) VALUES ($1,$2)", { id, group_id })
        test.is_nil(group_err, tostring(group_err))
    end
    db:release()
    local _, provision_err = provision.ensure_user(actor_of(id), security.named_scope(SCOPE), id)
    test.is_nil(provision_err, tostring(provision_err))
end

local function component_service(id: string): any
    local definition = assert(contract.get("kickside.component:component_service"))
    return assert(definition:with_actor(actor_of(id)):with_scope(security.named_scope(SCOPE)):open())
end

return { run = test.run_cases(function()
    test.describe("Upload access through a referencing component", function()
        test.it("serves the original, artifacts and page map to readers of the referencing component only", function()
            local owner, reader, stranger = uuid.v4(), uuid.v4(), uuid.v4()
            seed_user(owner)
            local id = uuid.v4()
            local storage = assert(fs.get("app:uploads"))
            local _, stored_err = storage:writefile(id, "original bytes")
            test.is_nil(stored_err, tostring(stored_err))
            local frozen, frozen_err = run_as(owner, "app:upload_identity_probe", { upload_id = id })
            test.is_nil(frozen_err, tostring(frozen_err))
            local _, create_err = records.create(id, owner, 14, "application/pdf", "app:uploads", id,
                "kickside.uploads:types.generic", { _execution_identity = frozen, filename = "doc.pdf" }, "completed")
            test.is_nil(create_err, tostring(create_err))

            local image = assert(artifacts_repo.create_artifact({ upload_id = id, kind = "image", role = "rendered-page",
                mime_type = "image/jpeg", label = "page_1.jpg", ordinal = 2001, content = "page image bytes",
                metadata = { page = 1 } }))
            local thumbnail = assert(artifacts_repo.create_artifact({ upload_id = id, kind = "image", role = "page-thumbnail",
                mime_type = "image/jpeg", label = "page_1_thumbnail.jpg", ordinal = 3001, content = "thumbnail bytes",
                metadata = { page = 1, image_artifact_id = image.artifact_id } }))

            local service = component_service(owner)
            local referencing = service:register({ impl_id = "kickside.core:thread", meta = { upload_id = id } })
            test.is_true(referencing.success, tostring(referencing.error))
            local grant, grant_err = run_as(owner, "kickside.component.binding:grant_subtree_func", { upload_id = id }, {
                root_component_id = referencing.component_id,
                subject = { subject_id = reader, subject_type = "user" }, access_mask = 1 })
            test.is_nil(grant_err, tostring(grant_err))
            test.is_true(grant.success, tostring(grant.error))

            local raw = assert(run_as(reader, "app:upload_raw_probe", { upload_id = id }))
            test.eq(raw.status, 200)
            test.eq(raw.body, "original bytes")

            local listed = assert(run_as(reader, "app:upload_artifacts_probe", { upload_id = id }))
            test.eq(listed.status, 200)
            local listed_ids = {}
            for _, item in ipairs(listed.body.artifacts or {}) do listed_ids[item.artifact_id] = true end
            test.is_true(listed_ids[image.artifact_id] == true)
            test.is_nil(listed_ids[thumbnail.artifact_id])

            local bytes = assert(run_as(reader, "app:upload_artifact_raw_probe",
                { upload_id = id, artifact_id = thumbnail.artifact_id }))
            test.eq(bytes.status, 200)
            test.eq(bytes.body, "thumbnail bytes")

            local pages = assert(run_as(reader, "app:upload_pages_probe", { upload_id = id }))
            test.eq(pages.status, 200)
            test.eq(#pages.body.pages, 1)
            test.eq(pages.body.pages[1].page, 1)
            test.eq(pages.body.pages[1].image.artifact_id, image.artifact_id)
            test.eq(pages.body.pages[1].image.mime_type, "image/jpeg")
            test.eq(pages.body.pages[1].thumbnail.artifact_id, thumbnail.artifact_id)
            test.eq(pages.body.pages[1].thumbnail.raw_url,
                "/api/v1/uploads/" .. id .. "/artifacts/" .. thumbnail.artifact_id .. "/raw")

            for _, probe in ipairs({ "app:upload_raw_probe", "app:upload_artifacts_probe", "app:upload_pages_probe" }) do
                local denied = assert(run_as(stranger, probe, { upload_id = id }))
                test.eq(denied.status, 403, probe)
            end
            local denied_bytes = assert(run_as(stranger, "app:upload_artifact_raw_probe",
                { upload_id = id, artifact_id = image.artifact_id }))
            test.eq(denied_bytes.status, 403, "stranger artifact bytes")

            local revoke, revoke_err = run_as(owner, "kickside.component.binding:revoke_subtree_func", { upload_id = id }, {
                root_component_id = referencing.component_id, subject = { subject_id = reader, subject_type = "user" } })
            test.is_nil(revoke_err, tostring(revoke_err))
            test.is_true(revoke.success, tostring(revoke.error))
            local revoked = assert(run_as(reader, "app:upload_artifact_raw_probe",
                { upload_id = id, artifact_id = image.artifact_id }))
            test.eq(revoked.status, 403, "after the grant is revoked")
            local deleted = service:delete({ component_id = referencing.component_id })
            test.is_true(deleted.success, tostring(deleted.error))
        end)
    end)
end) }
