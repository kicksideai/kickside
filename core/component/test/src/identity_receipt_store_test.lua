-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- The receipt reads the _execution_identity key out of the stored
-- private_context on the real engine, whatever else the context carries.
local sql = require("sql")
local json = require("json")
local time = require("time")
local uuid = require("uuid")
local test = require("test")
local identity = require("identity")

local function db(): sql.DB
    local handle, err = sql.get("app:db")
    if err or not handle then error(tostring(err)) end
    return handle
end

local function store(raw: string): (string, error?)
    local id = uuid.v7()
    local now = time.now():format(time.RFC3339)
    local handle = db()
    local _, err = sql.builder.insert("kickside_components"):set_map({
        component_id = id, impl_id = "kickside.test:security", private_context = raw,
        position = "n", created_at = now, updated_at = now,
    }):run_with(handle):exec()
    handle:release()
    return id, err
end

local function seed(raw: string): string
    local id, err = store(raw)
    if err then error(tostring(err)) end
    return id
end

local function legacy_context(): string
    local destinations, dedup = {}, {}
    for index = 1, 200 do
        destinations["destination-" .. index] = { kind = "webhook", url = "https://example.test/" .. index }
        dedup["delivery-" .. index] = { at = "2026-11-01T00:00:00Z", status = "delivered" }
    end
    local encoded = assert(json.encode({
        destinations = destinations, delivery_dedup = dedup,
        _execution_identity = { principal = { kind = "user", id = "user-1" }, credential_id = "credential-1" },
    }))
    return encoded
end

return {run = test.run_cases(function()
    test.describe("identity receipt over the stored context", function()
        test.it("reads the identity next to legacy context keys", function()
            local receipt, err = identity.get_identity_receipt(seed(legacy_context()))
            test.is_nil(err)
            if type(receipt) ~= "table" then error("missing identity receipt") end
            test.eq(receipt.principal.id, "user-1")
            test.eq(receipt.execution_identity.credential_id, "credential-1")
        end)

        for _, raw in ipairs({"{}", "[]", '{"_execution_identity":12}', '{"_execution_identity":"user-1"}',
            '{"_execution_identity":false}'}) do
            test.it("refuses a missing identity/" .. raw, function()
                local receipt, err = identity.get_identity_receipt(seed(raw))
                test.is_nil(receipt)
                test.eq(err:kind(), errors.INVALID); test.eq(err:details().error_kind, "declaration")
            end)
        end

        test.it("reports a context that is not an object or array as corrupt", function()
            local receipt, err = identity.get_identity_receipt(seed("false"))
            test.is_nil(receipt)
            test.eq(err:kind(), errors.INTERNAL); test.is_false(err:retryable())
            test.eq(err:details().code, "persisted_data"); test.eq(err:details().field, "component.private_context")
        end)

        test.it("reports malformed context text as corrupt where the store holds it", function()
            local handle = db()
            local dialect = handle:type()
            handle:release()
            local id, store_err = store("{")
            if dialect == sql.type.POSTGRES then
                test.not_nil(store_err)
                return
            end
            test.is_nil(store_err)
            local receipt, err = identity.get_identity_receipt(id)
            test.is_nil(receipt)
            test.eq(err:kind(), errors.INTERNAL); test.is_false(err:retryable())
            test.eq(err:details().code, "persisted_data"); test.eq(err:details().field, "component.private_context")
        end)
    end)
end)}
