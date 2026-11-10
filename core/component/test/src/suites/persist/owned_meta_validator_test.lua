-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local funcs = require("funcs")
local KEY = "test.validated"

return {run = test.run_cases(function()
    test.describe("owned metadata validation", function()
        local db, id
        test.before_each(function()
            db = assert(sql.get("app:db"))
            id = uuid.v7()
        end)
        test.after_each(function()
            test.is_nil(select(2, db:execute("DELETE FROM kickside_components WHERE component_id=$1", {id})))
            db:release()
        end)
        local function invoke(target, args)
            local result, err = funcs.call(target, args)
            test.is_nil(err, tostring(err))
            if not result.success then
                return nil, errors.new({kind = result.kind, message = result.error,
                    retryable = result.retryable, details = result.details})
            end
            return result, nil
        end
        local function create(value)
            return invoke("kickside.component.binding:register_component_func", {
                component_id = id, impl_id = "kickside.test:meta", meta = {[KEY] = value},
            })
        end
        local function write(value, deletion)
            return invoke("kickside.component.binding:set_meta_component_func", {
                component_id = id, fields = deletion and {} or {[KEY] = value},
                delete_keys = deletion and {KEY} or nil,
            })
        end
        test.it("validates creation, replacement and removal with the acting principal and stored old value", function()
            local result, err = create("created")
            test.is_nil(err, tostring(err)); test.not_nil(result)
            result, err = write("updated")
            test.is_nil(err, tostring(err)); test.not_nil(result)
            result, err = write(nil, true)
            test.is_nil(err, tostring(err)); test.not_nil(result)
            local rows = assert(db:query("SELECT value FROM kickside_component_meta WHERE component_id=$1 AND key=$2", {id, KEY}))
            test.eq(#rows, 0)
        end)
        test.it("validates every command in a batch against earlier values", function()
            test.is_nil(select(2, create("created")))
            local result, err = invoke("kickside.component.binding:update_component_func", {
                component_id = id, commands = {
                    {type = "SET_META", payload = {fields = {[KEY] = "updated"}}},
                    {type = "SET_META", payload = {fields = {}, delete_keys = {KEY}}},
                },
            })
            test.is_nil(err, tostring(err)); test.not_nil(result)
            local rows = assert(db:query("SELECT value FROM kickside_component_meta WHERE component_id=$1 AND key=$2", {id, KEY}))
            test.eq(#rows, 0)
        end)
        test.it("rejects same-value assignments and refuses a batch before any write", function()
            test.is_nil(select(2, create("created")))
            local result, err = write("created")
            test.is_nil(result); test.eq(err:kind(), errors.PERMISSION_DENIED)
            result, err = invoke("kickside.component.binding:update_component_func", {
                component_id = id, commands = {
                    {type = "SET_META", payload = {fields = {title = "uncommitted"}}},
                    {type = "SET_META", payload = {fields = {[KEY] = "refused"}}},
                },
            })
            test.is_nil(result); test.eq(err:kind(), errors.PERMISSION_DENIED)
            local rows = assert(db:query("SELECT value FROM kickside_component_meta WHERE component_id=$1 AND key='title'", {id}))
            test.eq(#rows, 0)
        end)
        test.it("rejects invalid initial values without creating a component", function()
            local result, err = create("refused")
            test.is_nil(result); test.eq(err:kind(), errors.PERMISSION_DENIED)
            test.eq(err:details().code, "test_metadata_transition")
            local rows = assert(db:query("SELECT component_id FROM kickside_components WHERE component_id=$1", {id}))
            test.eq(#rows, 0)
        end)
        test.it("rolls back rejected updates and deletions", function()
            test.is_nil(select(2, create("created")))
            for _, deletion in ipairs({false, true}) do
                local result, err = write("refused", deletion)
                test.is_nil(result); test.eq(err:kind(), errors.PERMISSION_DENIED)
                test.eq(err:details().code, "test_metadata_transition")
                test.is_false(err:retryable())
                local rows = assert(db:query("SELECT value FROM kickside_component_meta WHERE component_id=$1 AND key=$2", {id, KEY}))
                test.eq(rows[1].value, "created")
            end
        end)
    end)
end)}
