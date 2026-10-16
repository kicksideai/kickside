-- Tests for kickside.agents:tools binding.

local test = require("test")
local uuid_v4 = require("uuid").v4
local contract = require("contract")
local registry = require("registry")

local CONTRACT_ID = "kickside.agents:tools"

local function open_tools(): any
    local def, err = contract.get(CONTRACT_ID)
    test.is_nil(err, "contract.get: " .. tostring(err))
    test.not_nil(def)
    local instance, ierr = def:open()
    test.is_nil(ierr, "open: " .. tostring(ierr))
    return instance
end

local function define_tests()
    test.describe("kickside.agents:tools binding", function()
        local tools: any

        test.before_all(function()
            tools = open_tools()
        end)

        test.describe("contract resolution", function()
            test.it("contract.get works", function()
                local def, err = contract.get(CONTRACT_ID)
                test.is_nil(err)
                test.not_nil(def)
            end)
            test.it("open returns instance", function()
                test.not_nil(tools)
            end)
        end)

        test.describe("argument validation", function()
            test.it("find requires id", function()
                local _, err = tools:find({})
                test.not_nil(err)
                test.eq(tostring(err):find("id") ~= nil, true)
                test.is_true(errors.is(err, errors.INVALID))
            end)

            test.it("binding exposes only implemented read methods", function()
                local entry, err = registry.get("kickside.agents.registry:tools_registry")
                test.is_nil(err)
                test.not_nil(entry)
                local contracts = entry.data and entry.data.contracts or {}
                local methods = contracts[1] and contracts[1].methods or {}
                test.not_nil(methods.find)
                test.not_nil(methods.list)
                test.is_nil(methods.register)
                test.is_nil(methods.upsert)
                test.is_nil(methods.update)
                test.is_nil(methods.delete)
            end)
        end)

        test.describe("read operations", function()
            test.it("list returns only exact-boolean public tools", function()
                local list, err = tools:list({})
                test.is_nil(err)
                test.not_nil(list)
                test.eq(#(list :: any) > 0, true, "expected at least one tool")
                local by_id: { [string]: any } = {}
                for _, tool in ipairs(list :: any) do
                    by_id[(tool :: any).id] = tool
                    test.is_true((tool :: any).public)
                    test.eq(type((tool :: any).input_schema), "table")
                end
                test.not_nil(by_id["app:public_tool_probe"])
                test.is_nil(by_id["app:private_tool_probe"])
                test.is_nil(by_id["app:missing_public_tool_probe"])
                test.is_nil(by_id["app:malformed_public_tool_probe"])
                test.is_nil(by_id["app:malformed_private_tool_probe"])
            end)

            test.it("list filters by namespace prefix", function()
                local list, err = tools:list({ namespace = "keeper.knowledge.tools" })
                test.is_nil(err)
                test.not_nil(list)
                for _, t in ipairs(list :: any) do
                    local id: any = (t :: any).id
                    test.eq(id:sub(1, #"keeper.knowledge.tools") == "keeper.knowledge.tools", true)
                end
            end)

            test.it("find returns existing tool", function()
                -- pick the first listed tool and try finding it
                local list, _ = tools:list({})
                if list and (list :: any)[1] then
                    local first: any = (list :: any)[1]
                    local found, err = tools:find({ id = first.id })
                    test.is_nil(err)
                    test.not_nil(found)
                    test.eq(found.id, first.id)
                end
            end)

            test.it("find returns nil for non-existent tool", function()
                local found, err = tools:find({ id = "nonexistent_tool_" .. uuid_v4() })
                test.is_nil(err)
                test.is_nil(found)
            end)

            test.it("keeps authorized exact-ref lookup independent from discovery", function()
                local found, err = tools:find({ id = "app:private_tool_probe" })
                test.is_nil(err)
                test.not_nil(found)
                test.eq(found.id, "app:private_tool_probe")
                test.is_false(found.public)
            end)

        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
