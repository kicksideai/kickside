local test = require("test")
local errors = require("errors")
local failure_classification = require("failure_classification")
local outcome = require("round_outcome")
local drive = require("drive")

local PULLABLE_CODES = {
    "auth_expired",
    "rate_limited",
    "invalid_config",
    "invalid_request",
    "not_found",
    "conflict",
    "permission_denied",
    "provider_unavailable",
    "provider_error",
    "cursor_expired",
    "history_unavailable",
    "stalled",
    "unknown",
}

local WRITABLE_CODES = {
    "auth_expired",
    "rate_limited",
    "invalid_config",
    "invalid_request",
    "not_found",
    "conflict",
    "idempotency_conflict",
    "permission_denied",
    "provider_unavailable",
    "provider_error",
    "cursor_expired",
    "history_unavailable",
    "stalled",
    "dependency_missing",
    "unknown",
}

local EXPECTED_KIND: { [string]: string } = {}
EXPECTED_KIND.auth_expired = errors.PERMISSION_DENIED :: string
EXPECTED_KIND.conflict = errors.CONFLICT :: string
EXPECTED_KIND.idempotency_conflict = errors.CONFLICT :: string
EXPECTED_KIND.cursor_expired = errors.UNAVAILABLE :: string
EXPECTED_KIND.dependency_missing = errors.UNAVAILABLE :: string
EXPECTED_KIND.history_unavailable = errors.UNAVAILABLE :: string
EXPECTED_KIND.invalid_config = errors.INVALID :: string
EXPECTED_KIND.invalid_request = errors.INVALID :: string
EXPECTED_KIND.not_found = errors.NOT_FOUND :: string
EXPECTED_KIND.permission_denied = errors.PERMISSION_DENIED :: string
EXPECTED_KIND.provider_error = errors.INTERNAL :: string
EXPECTED_KIND.provider_unavailable = errors.UNAVAILABLE :: string
EXPECTED_KIND.rate_limited = errors.RATE_LIMITED :: string
EXPECTED_KIND.stalled = errors.UNAVAILABLE :: string
EXPECTED_KIND.unknown = errors.INTERNAL :: string

local DETERMINISTIC: { [string]: boolean } = {
    auth_expired = true,
    idempotency_conflict = true,
    invalid_config = true,
    invalid_request = true,
    not_found = true,
    permission_denied = true,
}

local function verify_codes(label: string, codes: { string })
    for _, code in ipairs(codes) do
        for _, declared_retriable in ipairs({ true, false }) do
            local classified = failure_classification.classify({
                code = code,
                message = label .. " " .. code,
                retriable = declared_retriable,
                scope = "provider",
            })
            test.eq(classified.kind, EXPECTED_KIND[code], label .. "." .. code .. " kind")
            test.eq(classified.retriable, declared_retriable and DETERMINISTIC[code] ~= true,
                label .. "." .. code .. " retry verdict")
            test.eq(classified.message, label .. " " .. code)
        end
    end
end

local function define_tests()
    test.describe("shared failure classification", function()
        test.it("retains outer retry authority over serialized native metadata", function()
            for _, retry in ipairs({true, false}) do
                local classified = failure_classification.classify({success = false, retriable = retry,
                    error = {kind = errors.UNAVAILABLE, message = "serialized failure", retryable = not retry,
                        details = {code = "provider_unavailable"}}})
                test.eq(classified.retriable, retry)
            end
        end)

        test.it("retains deterministic code authority across native and repeated classification", function()
            local native = errors.new({kind = errors.CONFLICT, retryable = true, message = "payload conflict",
                details = {code = "idempotency_conflict"}})
            for _, value in ipairs({native, {kind = errors.CONFLICT, retryable = true, message = "payload conflict",
                details = {code = "idempotency_conflict"}}, {kind = errors.CONFLICT, retriable = true,
                code = "idempotency_conflict", message = "payload conflict"}}) do
                local classified = failure_classification.classify(value)
                test.eq(classified.kind, errors.CONFLICT)
                test.eq(classified.retriable, false)
                test.eq(failure_classification.classify(classified).retriable, false)
            end
        end)

        test.it("rehydrates native metadata without changing published DataError fields", function()
            local value = {success = false, retry_after_ms = 700, error = {
                code = "rate_limited", message = "paced", scope = "provider",
                kind = errors.RATE_LIMITED, retryable = false, retriable = true,
                details = {code = "provider_capacity", scope = "capacity", retry_at_ms = 1893456000123}}}
            local native = failure_classification.native(value)
            test.is_true(errors.is(native, errors.RATE_LIMITED))
            test.eq(native:retryable(), false)
            test.eq(native:details().code, "provider_capacity")
            test.eq(native:details().scope, "capacity")
            test.eq(native:details().retry_after_ms, 700)
            test.eq(failure_classification.capacity_floor(value), 1893456000123)
            test.eq(value.error.scope, "provider")
        end)

        test.it("schedules capacity waits at the exact absolute floor without policy delay", function()
            local failure = failure_classification.classify(errors.new({ kind = errors.RATE_LIMITED,
                retryable = false, message = "capacity", details = {
                    code = "provider_capacity", scope = "capacity", retry_at_ms = 1893456000123 } }))
            local phase, parked = outcome.failure_phase(failure)
            test.eq(phase, drive.PHASE.DEGRADED)
            test.eq(parked, false)
            for _, list in ipairs({ "waiting", "failed" }) do
                local outcomes = { delivered = {}, skipped = {}, waiting = {}, uncertain = {}, failed = {} }
                outcomes[list] = { { key = "delivery", error = failure } }
                local recorded = outcome.ledger_outcomes({ { item_key = "item", dedup_key = "item",
                    delivery_key = "delivery", attempts = 0 } }, outcomes, { retry_after_ms = 5000, max_delay_ms = 60000 })
                test.eq(recorded[1].state, "waiting")
                test.eq(recorded[1].next_attempt_at, "2030-01-01T00:00:00.123Z")
                test.eq(recorded[1].error.code, "provider_capacity")
            end
        end)

        test.it("carries provider code scope retry floor and details through repeated classification", function()
            local original = { code = "rate_limited", message = "paced", retriable = true,
                scope = "provider", retry_after_ms = 90000, details = { provider = "fixture" } }
            local classified = failure_classification.classify(failure_classification.classify(original))
            test.eq(classified.code, original.code)
            test.eq(classified.scope, original.scope)
            test.eq(classified.retry_after_ms, original.retry_after_ms)
            test.eq(classified.details.provider, "fixture")
        end)

        test.it("paces an item retry no earlier than its provider floor and preserves its typed error", function()
            local before = drive.utc_after(90000)
            local recorded = outcome.ledger_outcomes({ { item_key = "item", dedup_key = "change", delivery_key = "delivery", attempts = 0 } },
                { delivered = {}, skipped = {}, waiting = {}, uncertain = {}, failed = {
                    { key = "delivery", error = { code = "rate_limited", message = "paced", retriable = true,
                        scope = "provider", retry_after_ms = 90000 } } } }, { retry_after_ms = 100, max_delay_ms = 100 })
            test.is_true(recorded[1].next_attempt_at >= before)
            test.eq(recorded[1].error.code, "rate_limited")
            test.eq(recorded[1].error.scope, "provider")
            test.eq(recorded[1].error.retry_after_ms, 90000)
        end)

        test.it("settles the prepared output of an item that failed before any write once it is dead, and keeps a retried one's", function()
            local items = { { item_key = "dead", dedup_key = "dead", delivery_key = "dead-key", attempts = 0 },
                { item_key = "again", dedup_key = "again", delivery_key = "again-key", attempts = 0 } }
            local recorded, settled = outcome.ledger_outcomes(items,
                { delivered = {}, skipped = {}, waiting = {}, uncertain = {}, failed = {
                    { key = "dead-key", prepared_key = "dead-key",
                        error = { kind = errors.INVALID, message = "no value", retriable = false } },
                    { key = "again-key", prepared_key = "again-key",
                        error = { kind = errors.UNAVAILABLE, message = "busy", retriable = true } } } },
                { retry_after_ms = 100, max_delay_ms = 100 })
            test.eq(#recorded, 2)
            test.eq(#settled, 1)
            test.eq(settled[1].item.item_key, "dead")
            test.eq(settled[1].prepared_key, "dead-key")
            test.eq(#settled[1].receipts, 0)
        end)

        test.it("covers every pullable and writable DataError code", function()
            verify_codes("pullable", PULLABLE_CODES)
            verify_codes("writable", WRITABLE_CODES)
        end)

        test.it("keeps cursor expiry, unavailable history, and stalled flag-dependent", function()
            -- These three DataErrors mean the source could not make progress;
            -- provider policy decides whether a later attempt can recover them.
            for _, code in ipairs({ "cursor_expired", "history_unavailable", "stalled" }) do
                local retry = failure_classification.classify({ code = code, retriable = true })
                local terminal = failure_classification.classify({ code = code, retriable = false })
                test.eq(retry.kind, errors.UNAVAILABLE)
                test.eq(retry.retriable, true)
                test.eq(terminal.kind, errors.UNAVAILABLE)
                test.eq(terminal.retriable, false)
            end
        end)

        test.it("preserves typed kinds and declared envelope retriability", function()
            local conflict = failure_classification.classify({
                success = false,
                error = errors.new({ kind = errors.CONFLICT, message = "stale revision" }),
                retriable = false,
            })
            test.eq(conflict.kind, errors.CONFLICT)
            test.eq(conflict.retriable, false)
            test.eq(conflict.message, "stale revision")

            local unavailable = failure_classification.classify({
                success = false,
                error = errors.new({ kind = errors.UNAVAILABLE, message = "provider opted out" }),
                retriable = false,
            })
            test.eq(unavailable.kind, errors.UNAVAILABLE)
            test.eq(unavailable.retriable, false)

            local typed_unavailable = failure_classification.classify(errors.new({
                kind = errors.UNAVAILABLE,
                message = "typed error opted out",
                retryable = false,
            }))
            test.eq(typed_unavailable.kind, errors.UNAVAILABLE)
            test.eq(typed_unavailable.retriable, false)

            local terminal = failure_classification.classify({
                success = false,
                error = { code = "provider_unavailable", message = "terminal provider verdict", retriable = true },
                terminal = true,
            })
            test.eq(terminal.kind, errors.UNAVAILABLE)
            test.eq(terminal.retriable, false)
        end)

        test.it("applies retry and terminal precedence to opposite envelope contradictions", function()
            local outer_false = failure_classification.classify({
                success = false,
                error = { kind = errors.UNAVAILABLE, message = "detail retries", retriable = true },
                retriable = false,
            })
            test.eq(outer_false.kind, errors.UNAVAILABLE)
            test.eq(outer_false.retriable, false)

            local outer_true = failure_classification.classify({
                success = false,
                error = { kind = errors.UNAVAILABLE, message = "detail stops", retriable = false },
                retriable = true,
            })
            test.eq(outer_true.kind, errors.UNAVAILABLE)
            test.eq(outer_true.retriable, true)

            local outer_terminal = failure_classification.classify({
                success = false,
                error = { kind = errors.UNAVAILABLE, message = "detail says nonterminal", terminal = false },
                retriable = true,
                terminal = true,
            })
            test.eq(outer_terminal.retriable, false)

            local detail_terminal = failure_classification.classify({
                success = false,
                error = { kind = errors.UNAVAILABLE, message = "detail is terminal", terminal = true },
                retriable = true,
                terminal = false,
            })
            test.eq(detail_terminal.retriable, false)
        end)

        test.it("uses typed retryable fallback only when no boolean carrier flag exists", function()
            local typed_fallback = failure_classification.classify(errors.new({
                kind = errors.UNAVAILABLE,
                message = "typed fallback opts out",
                retryable = false,
            }))
            test.eq(typed_fallback.kind, errors.UNAVAILABLE)
            test.eq(typed_fallback.retriable, false)

            local typed_outer = failure_classification.classify({
                success = false,
                error = errors.new({
                    kind = errors.UNAVAILABLE,
                    message = "outer flag overrides typed fallback",
                    retryable = false,
                }),
                retriable = true,
            })
            test.eq(typed_outer.kind, errors.UNAVAILABLE)
            test.eq(typed_outer.retriable, true)
        end)

        test.it("keeps deterministic kinds terminal and idempotency conflicts non-retriable", function()
            local already_exists = failure_classification.classify({
                kind = errors.ALREADY_EXISTS,
                message = "explicit retry cannot change this kind",
                retriable = true,
            })
            test.eq(already_exists.kind, errors.ALREADY_EXISTS)
            test.eq(already_exists.retriable, false)

            local idempotency_conflict = failure_classification.classify({
                code = "idempotency_conflict",
                message = "same key has a different payload",
                retriable = true,
            })
            test.eq(idempotency_conflict.kind, errors.CONFLICT)
            test.eq(idempotency_conflict.retriable, false)

            local conflict = failure_classification.classify({
                kind = errors.CONFLICT,
                message = "ordinary conflict opted out",
                retriable = false,
            })
            test.eq(conflict.kind, errors.CONFLICT)
            test.eq(conflict.retriable, false)
        end)

        test.it("defaults untyped failure envelopes to retriable INTERNAL", function()
            local classified = failure_classification.classify({
                success = false,
                error = "provider failed before classifying the error",
            })
            test.eq(classified.kind, errors.INTERNAL)
            test.eq(classified.retriable, true)
        end)

        test.it("preserves typed PERMISSION_DENIED failures as terminal", function()
            local classified = failure_classification.classify(errors.new({
                kind = errors.PERMISSION_DENIED,
                message = "authentication required",
            }))
            test.eq(classified.kind, errors.PERMISSION_DENIED)
            test.eq(classified.retriable, false)
        end)

        test.it("classifies raised and unknown failures as retriable INTERNAL", function()
            local raised = failure_classification.classify("provider raised before returning")
            local unknown = failure_classification.classify({ code = "future_provider_code", message = "future code" })
            local unknown_kind = failure_classification.classify({ kind = "FUTURE_KIND", message = "future kind" })
            test.eq(raised.kind, errors.INTERNAL)
            test.eq(raised.retriable, true)
            test.eq(unknown.kind, errors.INTERNAL)
            test.eq(unknown.retriable, true)
            test.eq(unknown_kind.kind, errors.INTERNAL)
            test.eq(unknown_kind.retriable, true)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
local function run(options: any): any
    return run_cases(options)
end

return { run = run }
