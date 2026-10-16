local test = require("test")
local kit = require("pullable_conformance")

local function has_failure(result: any, code: string): boolean
    local failures = type(result) == "table" and (result :: any).failures or {}
    for _, raw in ipairs(failures :: { any }) do
        if type(raw) == "table" and (raw :: any).code == code then return true end
    end
    return false
end

local function good_source(req: any): any
    local config = type(req.config) == "table" and (req.config :: any) or {}
    if config.fail == true then
        return {
            success = false,
            error = {
                code = "provider_error",
                message = "fixture failure",
                retriable = true,
                scope = "provider",
            },
        }
    end
    local since = type(config.backfill_since) == "string" and config.backfill_since or nil
    local offset = type(req.cursor) == "table" and tonumber((req.cursor :: any).offset) or 0
    local items = {
        { item_key = "a", dedup_key = "a:v1", op = "upsert", observed_at = "2026-01-02T00:00:00Z", payload = { text = "a" } },
        { item_key = "b", dedup_key = "b:v1", op = "upsert", observed_at = "2026-01-03T00:00:00Z", payload = { text = "b" } },
        { item_key = "c", dedup_key = "c:v1", op = "delete", observed_at = "2026-01-04T00:00:00Z" },
    }
    local out: { any } = {}
    local limit = tonumber(req.limit) or 2
    local i = offset + 1
    while i <= #items and #out < limit do
        local item = items[i]
        if not since or tostring((item :: any).observed_at or "") >= since then out[#out + 1] = item end
        i = i + 1
    end
    return {
        success = true,
        items = out,
        next_cursor = { offset = i - 1 },
        has_more = i <= #items,
        coverage = { mode = "delta" },
    }
end

local function good_keys(_req: any): any
    return {
        success = true,
        keys = {
            { item_key = "a", dedup_key = "a:v1" },
            { item_key = "b", dedup_key = "b:v1" },
        },
        next_cursor = { done = true },
        has_more = false,
    }
end

local function run(source: any, opts: any?): any
    opts = type(opts) == "table" and opts or {}
    opts.pull = source
    opts.limit = 2
    opts.max_pages = opts.max_pages or 4
    opts.config = opts.config or {}
    opts.failure_config = opts.failure_config or { fail = true }
    if opts.backfill_since == nil then
        opts.backfill_since = { mode = "honored", value = "2026-01-01T00:00:00Z" }
    end
    return kit.run(opts)
end

local function define_tests()
    test.describe("pullable conformance kit", function()
        test.it("passes a known-good cursored source", function()
            local result = run(good_source)
            test.is_true(result.success, kit.format_failures(result))
            test.eq(#result.failures, 0)
        end)

        test.it("passes a known-good source with reconcile pull_keys", function()
            local result = run(good_source, { pull_keys = good_keys })
            test.is_true(result.success, kit.format_failures(result))
            test.eq(#result.failures, 0)
        end)

        test.it("reports malformed reconcile keys", function()
            local result = run(good_source, {
                pull_keys = function()
                    return { success = true, keys = { { item_key = "a" } }, next_cursor = { done = true }, has_more = false }
                end,
            })
            test.is_true(has_failure(result, "keys.dedup_key"), kit.format_failures(result))
        end)

        test.it("reports an invalid item envelope", function()
            local result = run(function(req)
                if req.config and req.config.fail then return good_source(req) end
                return {
                    success = true,
                    items = { { dedup_key = "missing-key", op = "upsert", payload = {} } },
                    next_cursor = { done = true },
                    has_more = false,
                }
            end)
            test.is_true(has_failure(result, "schema.required"), kit.format_failures(result))
        end)

        test.it("reports a cursor that repeats while has_more=true", function()
            local result = run(function(req)
                if req.config and req.config.fail then return good_source(req) end
                return {
                    success = true,
                    items = { { item_key = "a", dedup_key = "a:1", op = "upsert", payload = {} } },
                    next_cursor = { offset = 0 },
                    has_more = true,
                }
            end, { max_pages = 3 })
            test.is_true(has_failure(result, "cursor.progress"), kit.format_failures(result))
        end)

        test.it("reports empty has_more pages without retry_after_ms", function()
            local result = run(function(req)
                if req.config and req.config.fail then return good_source(req) end
                return {
                    success = true,
                    items = {},
                    next_cursor = { offset = 1 },
                    has_more = true,
                }
            end, { max_pages = 1 })
            test.is_true(has_failure(result, "empty_page.retry_after_ms"), kit.format_failures(result))
        end)

        test.it("reports an invalid DataError taxonomy", function()
            local result = kit.run({
                pull = function(req)
                    if req.config and req.config.fail then
                        return { success = false, error = { code = "provider_error", message = "bad", retriable = true } }
                    end
                    return good_source(req)
                end,
                config = {},
                limit = 2,
                max_pages = 4,
                failure_config = { fail = true },
                backfill_since = { mode = "ignored", reason = "fixture covers error taxonomy only" },
            })
            test.is_true(has_failure(result, "schema.required"), kit.format_failures(result))
        end)

        test.it("requires an explicit backfill_since declaration", function()
            local result = kit.run({
                pull = good_source,
                config = {},
                limit = 2,
                max_pages = 4,
                failure_config = { fail = true },
            })
            test.is_true(has_failure(result, "backfill.declaration"), kit.format_failures(result))
        end)
    end)
end

return { run = test.run_cases(define_tests) }
