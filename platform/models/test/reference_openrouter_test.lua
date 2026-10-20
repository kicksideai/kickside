local test = require("test")
local reference = require("reference")
local reference_registry = require("reference_registry")
local reference_source = require("reference_source")
local providers = require("discovery_common").PROVIDERS

local function define_tests()
    test.describe("model reference ownership", function()
        test.it("matches qualified vendor models without borrowing another vendor's limits", function()
            test.is_nil(reference.lookup(providers.OPENAI, "shared-model"))
            test.is_nil(reference.lookup(providers.OPENAI_COMPAT, "shared-model"))
            test.eq(reference.lookup(providers.OPENAI, "owned-model").context_length, 67890)
            test.eq(reference.lookup(providers.ANTHROPIC, "shared-model").context_length, 12345)
            test.eq(reference.lookup(providers.OPENAI_COMPAT, "anthropic/shared-model").context_length, 12345)
        end)

        test.it("knows embedding models from the embeddings catalog", function()
            test.eq(reference.lookup(providers.OPENAI, "text-embedding-3-small").context_length, 8192)
        end)

        test.it("returns a source failure to discovery", function()
            local original = reference_source.lookup
            reference_source.lookup = function() return nil, "reference source unavailable" end
            local ok, err = pcall(function()
                local value, lookup_err = reference_registry.lookup(providers.OPENAI, "test-model")
                test.is_nil(value)
                test.eq(lookup_err, "reference source unavailable")
            end)
            reference_source.lookup = original
            if not ok then error(err, 0) end
        end)
    end)
end
return { run = test.run_cases(define_tests) }
