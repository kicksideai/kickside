-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local security = require("security")
local funcs = require("funcs")
local contract = require("contract")
local uuid = require("uuid")
local fs = require("fs")
local records = require("records")
local types = require("types")

return {run = test.run_cases(function()
    test.describe("Upload owner scope", function()
        test.it("checks a non-process owner scope on raw and page reads", function()
            local owner, id = uuid.v4(), uuid.v4()
            local actor = security.new_actor(owner, {security_groups = {"app:uploads_test"}})
            local allowed = assert(security.new_scope({assert(security.policy("app:test_scope_policy"))}))
            local restricted = assert(allowed:with(assert(security.policy("app:page_owner_scope_deny"))))
            local registered = assert(funcs.new():with_actor(actor):with_scope(allowed)
                :call("kickside.component.binding:register_component_func", {component_id = types.component_id_for_owner(owner),
                    impl_id = types.IMPL, meta = {}}))
            test.is_true(registered.success, registered.error)
            local storage = assert(fs.get("app:uploads"))
            assert(storage:writefile(id, "private bytes"))
            assert(records.create(id, owner, 13, "text/plain", "app:uploads", id, "documents", {}, "completed"))
            for _, scope in ipairs({allowed, restricted}) do
                local api = assert(assert(contract.get("kickside.uploads:page_images")):with_actor(actor):with_scope(scope):open())
                local info, err = api:get_info({upload_id = id})
                local raw, raw_err = funcs.new():with_actor(actor):with_scope(scope):with_context({upload_id = id})
                    :call("app:upload_raw_probe", {})
                test.is_nil(raw_err, tostring(raw_err))
                if scope == allowed then
                    test.is_nil(err, tostring(err)); test.eq(info.state, "not_paged")
                    test.eq(raw.status, 200); test.eq(raw.body, "private bytes")
                else
                    test.is_nil(info); test.not_nil(err)
                    test.is_true(raw.status == 403 or raw.status == 404)
                end
            end
            assert(storage:remove(id))
        end)
    end)
end)}
