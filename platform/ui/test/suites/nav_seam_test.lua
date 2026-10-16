local test = require("test")
local contract = require("contract")
local security = require("security")
local http_client = require("http_client")
local json = require("json")
local registry = require("registry")

local NAV_PROVIDER = "kickside.ui:nav_provider"
local REGISTRY_BINDING = "kickside.ui:registry_nav_provider_binding"
-- The harness gateway's configured port (a per-run var).
local function nav_list_url(): string
    local entry = registry.get("app:gateway")
    local addr = entry and ((entry :: any).data and (entry :: any).data.addr or (entry :: any).addr) or nil
    local port = tostring(addr or ""):match(":(%d+)$")
    if not port then error("harness gateway address unavailable: " .. tostring(addr)) end
    return "http://127.0.0.1:" .. port .. "/api/nav/list"
end
local TEST_PATH = "/ui-test-surface"
local TEST_CATEGORY = "ui_test"

local function open_registry_provider(): any
    local policy, perr = security.policy("app:admin")
    if not policy then error("policy app:admin: " .. tostring(perr)) end
    local def, derr = contract.get(NAV_PROVIDER)
    if not def then error("nav_provider contract: " .. tostring(derr)) end
    local inst, oerr = (def :: any)
        :with_actor(security.new_actor("app:ui_test_admin", {}))
        :with_scope(security.new_scope({ policy }))
        :open(REGISTRY_BINDING)
    if not inst then error("open " .. REGISTRY_BINDING .. ": " .. tostring(oerr)) end
    return inst
end

local function by_field(rows: any, field: string): any
    local out: { [string]: any } = {}
    for _, row in ipairs((rows or {}) :: { any }) do out[tostring((row :: any)[field])] = row end
    return out
end

local function define_tests()
    test.describe("KickSide Nav Seam", function()
        test.it("the registry source is discoverable as a nav_provider implementation", function()
            local def, derr = contract.get(NAV_PROVIDER)
            test.not_nil(def)
            test.is_nil(derr)
            local impls, ierr = (def :: any):implementations()
            test.is_nil(ierr)
            local found = false
            for _, id in ipairs((impls or {}) :: { any }) do
                if tostring(id) == REGISTRY_BINDING then found = true end
            end
            test.is_true(found)
        end)

        test.it("calling it through the contract under an actor/scope yields raw declarations", function()
            local inst = open_registry_provider()
            local res, cerr = inst:list({ locale = "en-US", manage = false })
            test.is_nil(cerr)
            test.not_nil(res)

            -- A provider contributes raw fields. Provenance is derived only by the
            -- aggregator from this trusted binding id, never from provider payload.
            local items = by_field(res.items, "path")
            local surface = items[TEST_PATH]
            test.not_nil(surface)
            test.is_nil(surface.source)
            test.eq(surface.id, "kickside.ui:nav_item.ui_test_surface")
            test.eq(surface.title, "UI Test Surface")
            test.eq(surface.component_tag, "ui-test-surface")
            test.eq(surface.category, TEST_CATEGORY)
            -- Discovery bookkeeping stays out of the contribution.
            test.is_nil(surface.type)
            test.is_nil(surface.module)

            local cats = by_field(res.categories, "key")
            test.not_nil(cats[TEST_CATEGORY])
            test.eq(cats[TEST_CATEGORY].title, "UI Test Group")
        end)

        test.it("the registry binding exposes the native async future contract", function()
            local inst = open_registry_provider()
            local future, ferr = inst:list_async({ locale = "en-US", manage = false, timeout_ms = 250 })
            test.is_nil(ferr)
            test.not_nil(future)
            local response = (future :: any):response()
            local payload = response:receive()
            local result, rerr = payload:data()
            test.is_nil(rerr)
            test.not_nil(result)
            test.not_nil(by_field(result.items, "path")[TEST_PATH])
        end)

        test.it("GET /nav/list sanitizes missing caller context", function()
            local response, herr = http_client.get(nav_list_url(), { timeout = 10 })
            test.is_nil(herr)
            test.not_nil(response)
            test.eq(response.status_code, 503)

            local body, jerr = json.decode(tostring(response.body))
            test.is_nil(jerr)
            test.is_false(body.success)
            test.eq(body.error, "nav_unavailable")
            test.is_nil(body.details)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(o) return run_cases(o) end }
