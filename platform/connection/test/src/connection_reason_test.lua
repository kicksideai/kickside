local test = require("test")
local handler = require("handler")
local fixture = require("fixture")
local registry_fixture = require("registry_fixture")
local contract_fixture = require("contract_fixture")
local function define_tests()
    test.describe("connection reconnect reason response", function()
        test.it("projects the public reason into the list response without exposing private tokens", function()
            handler.handler()
            local result = fixture.result
            test.eq(result.connections[1].connection_state, "needs_reauth")
            test.contains(result.connections[1].reauth_reason or "", "invalid_grant")
            test.is_nil(result.connections[1].private_context)
        end)
        test.it("selects the connection declaration icon in every source and sink registry order", function()
            local orders: {{integer}} = { {1, 2, 3}, {1, 3, 2}, {2, 1, 3}, {2, 3, 1}, {3, 1, 2}, {3, 2, 1} }
            for index, order in ipairs(orders) do
                local provider = "icon-order-" .. tostring(index)
                local bindings = {}
                for position, contract_id in ipairs({ "kickside.data:pullable", "kickside.connection:connection", "kickside.data:writable" }) do
                    bindings[position] = { id = "fixture:binding-" .. tostring(position), kind = "contract.binding", meta = { provider = provider, icon = "tabler:icon-" .. tostring(position) },
                        data = { contracts = { { contract = contract_id } } } }
                end
                registry_fixture.bindings = { bindings[order[1]], bindings[order[2]], bindings[order[3]] }
                contract_fixture.connections = { { component_id = provider, meta = { provider = provider, icon = "tabler:stored" } } }
                handler.handler()
                test.eq(fixture.result.connections[1].icon, "tabler:icon-2", "connection icon order " .. tostring(index))
                test.eq(fixture.result.items[1].icon, "tabler:icon-2", "picker icon order " .. tostring(index))
            end
        end)

        test.it("selects a stable source icon when the provider declares none", function()
            local orders: {{integer}} = { {1, 2, 3}, {1, 3, 2}, {2, 1, 3}, {2, 3, 1}, {3, 1, 2}, {3, 2, 1} }
            for index, order in ipairs(orders) do
                for _, declares_connection in ipairs({ true, false }) do
                    local provider = "icon-fallback-" .. tostring(index) .. "-" .. tostring(declares_connection)
                    local bindings = {
                        { id = "fixture:b-source", kind = "contract.binding", meta = { provider = provider, icon = "tabler:source-b" },
                            data = { contracts = { { contract = "kickside.data:pullable" } } } },
                        { id = "fixture:a-source", kind = "contract.binding", meta = { provider = provider, icon = "tabler:source-a" },
                            data = { contracts = { { contract = "kickside.data:pullable" } } } },
                        { id = "fixture:0-empty", kind = "contract.binding", meta = { provider = provider },
                            data = { contracts = { { contract = declares_connection and "kickside.connection:connection" or "kickside.data:writable" } } } },
                    }
                    registry_fixture.bindings = { bindings[order[1]], bindings[order[2]], bindings[order[3]] }
                    contract_fixture.connections = { { component_id = provider, meta = { provider = provider, icon = "tabler:stored" } } }
                    handler.handler()
                    test.eq(fixture.result.connections[1].icon, "tabler:source-a", "source fallback order " .. tostring(index))
                    test.eq(fixture.result.items[1].icon, "tabler:source-a", "picker fallback order " .. tostring(index))
                end
            end
        end)

        test.it("retains the stored icon when no provider binding declares an icon", function()
            local provider = "icon-stored"
            registry_fixture.bindings = {
                { id = "fixture:source", kind = "contract.binding", meta = { provider = provider, icon = "" },
                    data = { contracts = { { contract = "kickside.data:pullable" } } } },
                { id = "fixture:connection", kind = "contract.binding", meta = { provider = provider },
                    data = { contracts = { { contract = "kickside.connection:connection" } } } },
            }
            contract_fixture.connections = { { component_id = provider, meta = { provider = provider, icon = "tabler:stored" } } }
            handler.handler()
            test.eq(fixture.result.connections[1].icon, "tabler:stored")
            test.eq(fixture.result.items[1].icon, "tabler:stored")
        end)
    end)
end
return { run = test.run_cases(define_tests) }
