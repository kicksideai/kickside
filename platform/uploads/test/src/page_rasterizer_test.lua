-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local rasterizer = require("rasterizer")
local registry = require("registry")
return {run = test.run_cases(function()
    test.describe("Rasterizer discovery errors", function()
        test.after_each(function() registry.failure = false end)
        test.it("distinguishes no renderer from denied registry access", function()
            local renderer, absent = rasterizer.find_by_mime("application/pdf")
            test.is_nil(renderer); test.is_nil(absent)
            registry.failure = true
            local denied, err = rasterizer.find_by_mime("application/pdf")
            test.is_nil(denied); test.is_true(errors.is(err, errors.PERMISSION_DENIED))
        end)
    end)
end)}
