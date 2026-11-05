-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local security = require("security")
local crud = require("crud")

return {run = test.run_cases(function()
    test.describe("Thread attachment compatibility", function()
        test.it("maintenance keeps the supplied kind for a missing component", function()
            local db = assert(sql.get("app:db"))
            local id = uuid.v4()
            local value, err = crud.create(db, {component_id = id, impl_id = "event.read.test:admin_kind"},
                security.actor():id(), {system = true}, nil, true)
            test.is_nil(err); test.eq(value.thread.id, id)
            local rows = assert(db:query("SELECT event_read FROM kickside_thread WHERE id=$1", {id}))
            test.eq(#rows, 1); test.eq(rows[1].event_read, "admin")
            test.is_nil(select(2, db:execute("DELETE FROM kickside_thread WHERE id=$1", {id})))
            test.is_nil(select(2, db:release()))
        end)
        for _, mode in ipairs({"checked", "trusted_audit", "maintenance"}) do
            for _, shape in ipairs({"missing UUID", "legacy text"}) do
                test.it(mode .. "/" .. shape, function()
                    local db = assert(sql.get("app:db"))
                    local dbtype = assert(db:type())
                    local id = shape == "missing UUID" and uuid.v4() or "legacy-component-" .. uuid.v4()
                    local params = {component_id = id, impl_id = "kickside.core:thread",
                        trusted_audit = mode == "trusted_audit"}
                    local value, err = crud.create(db, params, security.actor():id(), {system = true}, nil,
                        mode == "maintenance")
                    if mode == "checked" then
                        test.is_nil(value); test.is_true(errors.is(err, errors.PERMISSION_DENIED))
                    elseif shape == "legacy text" and dbtype == sql.type.POSTGRES then
                        test.is_nil(value); test.not_nil(err)
                        test.eq(err:kind(), errors.INVALID)
                        test.is_true(tostring(err):find("invalid input syntax for type uuid", 1, true) ~= nil, tostring(err) .. "/" .. err:kind())
                    else
                        test.is_nil(err); test.eq(value.thread.id, id); test.eq(value.component_id, id)
                        test.eq(value.thread.component_id, id)
                        local _, delete_err = db:execute("DELETE FROM kickside_thread WHERE id=$1", {id})
                        test.is_nil(delete_err)
                    end
                    test.is_nil(select(2, db:release()))
                end)
            end
        end
        for _, mode in ipairs({"checked", "trusted_audit", "maintenance"}) do
            for _, shape in ipairs({"missing UUID", "legacy text"}) do
                test.it(mode .. "/" .. shape .. " with an inferred kind", function()
                    local db = assert(sql.get("app:db"))
                    local dbtype = assert(db:type())
                    local id = shape == "missing UUID" and uuid.v4() or "legacy-component-" .. uuid.v4()
                    local value, err = crud.create(db, {component_id = id, trusted_audit = mode == "trusted_audit"},
                        security.actor():id(), {system = true}, nil, mode == "maintenance")
                    if mode ~= "trusted_audit" then
                        test.is_nil(value); test.is_true(errors.is(err, errors.PERMISSION_DENIED))
                    elseif shape == "legacy text" and dbtype == sql.type.POSTGRES then
                        test.is_nil(value); test.not_nil(err)
                        test.eq(err:kind(), errors.INVALID)
                        test.is_true(tostring(err):find("invalid input syntax for type uuid", 1, true) ~= nil, tostring(err) .. "/" .. err:kind())
                    else
                        test.is_nil(err); test.eq(value.thread.id, id)
                        local _, delete_err = db:execute("DELETE FROM kickside_thread WHERE id=$1", {id})
                        test.is_nil(delete_err)
                    end
                    test.is_nil(select(2, db:release()))
                end)
            end
        end
    end)
end)}
