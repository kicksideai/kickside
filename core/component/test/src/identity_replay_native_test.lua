local test = require("test")
local context = require("context")
local authority = require("authority")
local storage = require("storage")
local identity = require("identity")
local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
local principal = {kind = "user", id = "user-1"}
local function prepare()
    local token, err = context.prepare_identity({component_id = "component", principal = principal,
        request_id = "request", expected_identity_generation = 7})
    test.is_nil(err); test.eq(type(token), "table")
    return token
end
return {run = test.run_cases(function()
    test.describe("native execution identity replay", function()
        for _, kind in ipairs(kinds) do
            for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                for _, classification in ipairs({{}, {error_kind = "source_classifier"}}) do
                    test.it(kind .. "/" .. tostring(options.retryable) .. "/" .. tostring(classification.error_kind), function()
                        local source = errors.new({kind = kind, retryable = options.retryable, message = "identity replay read refuses",
                            details = {code = "identity_replay_dependency", nested = {marker = "kept"}, error_kind = classification.error_kind}})
                        authority.reset("", nil); storage.reset("replay", source); local token = prepare()
                        local result, err = context.set_execution_identity_tx({} :: any, token)
                        test.is_nil(result); test.eq(type(err), "userdata"); test.eq(err:kind(), source:kind()); test.eq(err:retryable(), source:retryable())
                        test.eq(err:details().code, "identity_replay_dependency"); test.eq(err:details().nested.marker, "kept")
                        test.eq(err:details().error_kind, classification.error_kind or "infrastructure")
                        test.eq(source:details().error_kind, classification.error_kind); test.eq(storage.reads, 3); test.eq(storage.writes, 0)
                        local repeated, repeat_err = context.set_execution_identity_tx({} :: any, token)
                        test.is_nil(repeated); test.is_true(errors.is(repeat_err, errors.PERMISSION_DENIED)); test.eq(storage.reads, 3)
                    end)
                end
            end
        end
        test.it("existing successful audit replay retains identity result", function()
            authority.reset("", nil); storage.reset("", nil)
            local digest = identity.request_digest(principal, 7)
            storage.records = {{record_json = identity.audit_record("none", principal, principal, "request", digest, 7, "set", "canonical")}}
            local result, err = context.set_execution_identity_tx({} :: any, prepare())
            test.is_nil(err); test.eq(result.component_id, "component"); test.eq(result.principal.kind, "user"); test.eq(result.principal.id, "user-1")
            test.eq(result.identity_generation, 7); test.eq(result.request_id, "request"); test.is_false(result.changes_made); test.eq(storage.writes, 0)
        end)
    end)
end)}
