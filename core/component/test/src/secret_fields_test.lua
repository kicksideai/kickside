-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local fields = require("secret_fields")
local json = require("json")

local declarations = {
    {path = {"api_key"}, type = "string"},
    {path = {"auth", "password"}, type = "string"},
}
return {run = test.run_cases(function()
    test.describe("declared component secrets", function()
        test.it("omits empty secret declarations from migration candidates", function()
            local kinds, _, err = fields.declarations()
            test.is_nil(err)
            for _, kind in ipairs(kinds) do
                test.neq(kind.id, "app:empty_secret_kind")
            end
        end)
        test.it("preserves an omitted nested secret without mutating the caller patch", function()
            local patch = {auth = {user = "new"}}
            local updated, err = fields.patch({{path = {"auth", "password"}, type = "string"}},
                {auth = {user = "old", password = "secret"}}, patch)
            test.is_nil(err)
            test.eq(updated.auth.password, "secret")
            test.is_nil(patch.auth.password)
        end)
        test.it("validates typed paths and rejects ambiguity", function()
            test.is_nil(fields.validate(declarations))
            for _, declaration in ipairs({
                {{path = {"secret"}, type = "number"}},
                {{path = {}, type = "string"}},
                {{path = {""}, type = "string"}},
                {{path = {"_execution_identity"}, type = "string"}},
                {{path = {"secret"}, type = "string"}, {path = {"secret"}, type = "string"}},
                {{path = {"auth"}, type = "string"}, {path = {"auth", "password"}, type = "string"}},
            }) do
                test.is_true(errors.is(fields.validate(declaration), errors.INVALID))
            end
        end)
        test.it("retains stored paths and rejects incompatible declaration replacements", function()
            local combined, err = fields.combine({{path = {"api_key"}, type = "string"}}, declarations)
            test.is_nil(err)
            test.eq(#combined, 2)
            test.eq(#declarations, 2)
            local paths, overlap_err = fields.combine({{path = {"auth"}, type = "string"}}, declarations)
            test.is_nil(paths)
            test.is_true(errors.is(overlap_err, errors.INVALID))
        end)
        test.it("rejects a credential schema field that is not string-valued", function()
            local invalid = fields.validate({{path = {"enabled"}, type = "string"}},
                {fields = {{key = "enabled", type = "checkbox"}}})
            test.is_true(errors.is(invalid, errors.INVALID))
            test.is_nil(fields.validate(declarations, {fields = {{key = "api_key", type = "password"}}}))
        end)
        test.it("partitions strings without altering non-secret values or its input", function()
            local incoming = {api_key = "credential-sentinel", auth = {password = "nested-sentinel", user = "sample"},
                cursor = 7, _execution_identity = {principal = {kind = "user", id = "sample"}}}
            local before = json.encode(incoming)
            local visible, secrets, err = fields.partition(declarations, incoming)
            test.is_nil(err)
            test.eq(json.encode(incoming), before)
            test.eq(visible.api_key.set, true)
            test.eq(visible.auth.password.set, true)
            test.eq(visible.auth.user, "sample")
            test.eq(visible.cursor, 7)
            test.eq(visible._execution_identity.principal.id, "sample")
            test.eq(secrets.api_key, "credential-sentinel")
            test.eq(secrets.auth.password, "nested-sentinel")
            local encoded = json.encode(visible)
            test.is_nil((encoded:find("sentinel", 1, true)))
            local merged, merge_err = fields.merge(declarations, visible, secrets)
            test.is_nil(merge_err)
            test.eq(merged.api_key, incoming.api_key)
            test.eq(merged.auth.password, incoming.auth.password)
            test.eq(merged.auth.user, "sample")
        end)
        test.it("masks legacy plaintext and reports absent paths with only presence", function()
            local masked, err = fields.mask(declarations, {api_key = "never-return", cursor = 8})
            test.is_nil(err)
            test.eq(json.encode(masked.api_key), '{"set":true}')
            test.eq(json.encode(masked.auth.password), '{"set":false}')
            test.eq(masked.cursor, 8)
        end)
        test.it("returns only per-path presence without non-secret configuration", function()
            local result, err = fields.presence(declarations, {api_key = "never-return", cursor = 7})
            test.is_nil(err)
            test.eq(result.api_key.set, true)
            test.eq(result.auth.password.set, false)
            test.is_nil(result.cursor)
            test.is_nil((assert(json.encode(result)):find("never-return", 1, true)))
        end)
        test.it("rejects masks and non-string writes rather than treating them as credentials", function()
            for _, value in ipairs({42, true, {set = true}, {password = "nested"}}) do
                local visible, secrets, err = fields.partition(declarations, {api_key = value})
                test.is_nil(visible)
                test.is_nil(secrets)
                test.is_true(errors.is(err, errors.INVALID))
                test.is_nil((tostring(err):find("nested", 1, true)))
            end
        end)
        test.it("sets and clears only declared paths while preserving nested non-secret state", function()
            local value, err = fields.apply(declarations, {api_key = "old", auth = {password = "old-nested", user = "member"}}, {
                {path = {"api_key"}, value = "new"}, {path = {"auth", "password"}, clear = true}})
            test.is_nil(err)
            test.eq(value.api_key, "new")
            test.is_nil(value.auth.password)
            test.eq(value.auth.user, "member")
            for _, change in ipairs({{path = {"cursor"}, value = "never-write"},
                {path = {"api_key"}, value = true}, {path = {"api_key"}, value = "new", clear = true},
                {path = {"api_key"}}}) do
                local rejected, invalid = fields.apply(declarations, {}, {change})
                test.is_nil(rejected)
                test.is_true(errors.is(invalid, errors.INVALID))
            end
        end)
        test.it("rejects secret presence markers whose encrypted values disappear", function()
            local merged, err = fields.merge(declarations, {api_key = {set = true}}, {})
            test.is_nil(merged)
            test.eq(err:details().code, "component_secrets_inconsistent")
        end)
        test.it("preserves byte-identical documents for undeclared kinds", function()
            local value = {cursor = 7, config = {items = {1, 2, 3}}}
            local visible, secrets, err = fields.partition({}, value)
            test.is_nil(err)
            test.eq((json.encode(visible)), (json.encode(value)))
            test.is_nil(next(secrets))
        end)
    end)
end)}
