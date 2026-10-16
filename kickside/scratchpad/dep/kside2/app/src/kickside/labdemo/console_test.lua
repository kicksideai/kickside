-- Lifecycle test for the labdemo console sink: the port is published and the
-- write acknowledges per the kickside.data:writable ABI.
local test = require("test")
local funcs = require("funcs")
local registry = require("registry")
local security = require("security")

local WRITE_ID = "kickside.labdemo:console_write"
local SINK_ID = "kickside.labdemo:console_sink"
local PORT_ID = "kickside.labdemo:console"

local function executor(actor_id)
    return funcs.new():with_actor(security.new_actor(actor_id, {}))
end

local function run()
    test.describe("kickside.labdemo console sink", function()
        test.it("publishes the console store port bound to the writable sink", function()
            local entry, err = registry.get(PORT_ID)
            test.is_nil(err)
            test.not_nil(entry, PORT_ID .. " is missing")
        end)

        test.it("acknowledges a write and stamps the configured label", function()
            local res, err = executor("labdemo-test-user"):call(WRITE_ID, {
                sink_op = "upsert",
                idempotency_key = "labdemo-t-1",
                config = { label = "TEST" },
                input = { content = "hello from the lifecycle test" },
            })
            test.is_nil(err)
            test.not_nil(res)
            test.is_true(res.success, "write did not acknowledge")
            test.eq(res.result, "created")
            test.eq(res.dest_ref.label, "TEST")
        end)

        test.it("rejects a write without content", function()
            local res, err = executor("labdemo-test-user"):call(WRITE_ID, {
                sink_op = "upsert",
                input = {},
            })
            test.is_nil(err)
            test.eq(res.success, false)
        end)
    end)
end

return { run = run }
