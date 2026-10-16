local test = require("test")
local store = require("store")
local publish = require("publish")
local read = require("read")
local workflow = require("workflow")

return { run = test.run_cases(function()
    test.describe("workflow artifact integrity", function()
        test.it("aborts publication when document JSON encoding fails", function()
            local original_open, original_head, original_read, original_build = store.open_db, store.head_seq, store.read_state, workflow.build
            local rolled_back, released = false, false
            local tx = { rollback = function() rolled_back = true end, query = function() return {} end }
            store.open_db = function() return { begin = function() return tx end, release = function() released = true end } end
            store.head_seq = function() return 0 end
            store.read_state = function() return {} end
            workflow.build = function()
                local nodes = {}; nodes[1] = nodes
                return { nodes = nodes }
            end
            local result, err = publish.publish("encoding-test", "test")
            store.open_db, store.head_seq, store.read_state, workflow.build = original_open, original_head, original_read, original_build
            test.is_nil(result)
            test.is_true(errors.is(err, errors.INTERNAL), tostring(err))
            test.contains(tostring(err), "encode")
            test.is_true(rolled_back)
            test.is_true(released)
        end)
        for _, field in ipairs({ "document", "compiled_commands", "allowlist" }) do
            test.it("rejects corrupt published " .. field, function()
                local original_open = store.open_db
                local released = false
                local row = { document = "{}", compiled_commands = "[]", allowlist = "[]" }
                row[field] = "{broken"
                store.open_db = function() return {
                    query = function() return { row } end,
                    release = function() released = true end,
                } end
                local result, err = read.get("stored-test", 1)
                store.open_db = original_open
                test.is_nil(result)
                test.is_true(errors.is(err, errors.INTERNAL), tostring(err))
                test.is_true(released)
            end)
        end
        test.it("propagates child version lookup errors from snapshot decoration", function()
            local source = errors.new({ kind = errors.UNAVAILABLE, message = "version storage unavailable", details = { marker = "child" } })
            local original = store.version_interface
            store.version_interface = function() return nil, source end
            local result, err = store.decorate_snapshot({}, { nodes = {
                { kind = "flow", config = { flow_ref = { id = "child", version = 1 } } },
            } })
            store.version_interface = original
            test.is_nil(result)
            test.eq(err, source)
        end)
    end)
end) }
